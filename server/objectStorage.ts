import { Storage, File, Bucket } from "@google-cloud/storage";
import { Response } from "express";
import { randomUUID } from "crypto";
import {
  ObjectAclPolicy,
  ObjectPermission,
  canAccessObject,
  getObjectAclPolicy,
  setObjectAclPolicy,
} from "./objectAcl";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

export type StorageProviderType = "replit" | "gcs" | "unavailable";

export interface StorageProvider {
  readonly type: StorageProviderType;
  readonly bucketName: string;
  getStorageClient(): Storage;
  getBucket(): Bucket;
  signUploadUrl(objectName: string, ttlSec: number, contentType?: string): Promise<string>;
  getPublicUrl(objectName: string): string;
  getUploadsPrefix(): string;
}

class ReplitStorageProvider implements StorageProvider {
  readonly type: StorageProviderType = "replit";
  readonly bucketName: string;
  private storage: Storage;
  private privateObjectDir: string;

  constructor() {
    this.privateObjectDir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!this.privateObjectDir) {
      throw new Error("PRIVATE_OBJECT_DIR not set for Replit storage provider");
    }
    
    const { bucketName } = this.parseObjectPath(this.privateObjectDir);
    this.bucketName = bucketName;

    this.storage = new Storage({
      credentials: {
        audience: "replit",
        subject_token_type: "access_token",
        token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
        type: "external_account",
        credential_source: {
          url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
          format: {
            type: "json",
            subject_token_field_name: "access_token",
          },
        },
        universe_domain: "googleapis.com",
      },
      projectId: "",
    });
  }

  private parseObjectPath(path: string): { bucketName: string; objectName: string } {
    if (!path.startsWith("/")) {
      path = `/${path}`;
    }
    const pathParts = path.split("/");
    if (pathParts.length < 3) {
      throw new Error("Invalid path: must contain at least a bucket name");
    }
    return {
      bucketName: pathParts[1],
      objectName: pathParts.slice(2).join("/"),
    };
  }

  getStorageClient(): Storage {
    return this.storage;
  }

  getBucket(): Bucket {
    return this.storage.bucket(this.bucketName);
  }

  async signUploadUrl(objectName: string, ttlSec: number, contentType?: string): Promise<string> {
    const request: Record<string, any> = {
      bucket_name: this.bucketName,
      object_name: objectName,
      method: "PUT",
      expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
    };
    if (contentType) {
      request.content_type = contentType;
    }
    const response = await fetch(
      `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      }
    );
    if (!response.ok) {
      throw new Error(
        `Failed to sign object URL, errorcode: ${response.status}, ` +
          `make sure you're running on Replit`
      );
    }
    const { signed_url: signedURL } = await response.json();
    return signedURL;
  }

  getPublicUrl(objectName: string): string {
    return `https://storage.googleapis.com/${this.bucketName}/${objectName}`;
  }

  getUploadsPrefix(): string {
    const { objectName } = this.parseObjectPath(this.privateObjectDir);
    return objectName ? `${objectName}/uploads` : "uploads";
  }

  getPrivateObjectDir(): string {
    return this.privateObjectDir;
  }
}

class GCSStorageProvider implements StorageProvider {
  readonly type: StorageProviderType = "gcs";
  readonly bucketName: string;
  private storage: Storage;
  private uploadsPrefix: string = ".private/uploads";

  constructor() {
    const serviceAccountJson = process.env.GCS_SERVICE_ACCOUNT_JSON;
    const bucketName = process.env.GCS_BUCKET_NAME;

    if (!serviceAccountJson) {
      throw new Error("GCS_SERVICE_ACCOUNT_JSON not set for GCS storage provider");
    }
    if (!bucketName) {
      throw new Error("GCS_BUCKET_NAME not set for GCS storage provider");
    }

    this.bucketName = bucketName;
    
    try {
      const credentials = JSON.parse(serviceAccountJson);
      this.storage = new Storage({
        credentials,
        projectId: credentials.project_id,
      });
    } catch (error) {
      throw new Error(`Failed to parse GCS_SERVICE_ACCOUNT_JSON: ${error}`);
    }
  }

  getStorageClient(): Storage {
    return this.storage;
  }

  getBucket(): Bucket {
    return this.storage.bucket(this.bucketName);
  }

  async signUploadUrl(objectName: string, ttlSec: number, contentType?: string): Promise<string> {
    const file = this.getBucket().file(objectName);
    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + ttlSec * 1000,
      contentType: contentType || "application/octet-stream",
    });
    return url;
  }

  getPublicUrl(objectName: string): string {
    return `https://storage.googleapis.com/${this.bucketName}/${objectName}`;
  }

  getUploadsPrefix(): string {
    return this.uploadsPrefix;
  }
}

class UnavailableStorageProvider implements StorageProvider {
  readonly type: StorageProviderType = "unavailable";
  readonly bucketName: string = "";

  getStorageClient(): Storage {
    throw new Error("Storage is not available");
  }

  getBucket(): Bucket {
    throw new Error("Storage is not available");
  }

  async signUploadUrl(_objectName: string, _ttlSec: number, _contentType?: string): Promise<string> {
    throw new Error("Storage is not available");
  }

  getPublicUrl(_objectName: string): string {
    throw new Error("Storage is not available");
  }

  getUploadsPrefix(): string {
    throw new Error("Storage is not available");
  }
}

function detectStorageProvider(): StorageProvider {
  if (process.env.PRIVATE_OBJECT_DIR) {
    try {
      return new ReplitStorageProvider();
    } catch (error) {
      console.warn("Failed to initialize Replit storage provider:", error);
    }
  }

  if (process.env.GCS_SERVICE_ACCOUNT_JSON && process.env.GCS_BUCKET_NAME) {
    try {
      return new GCSStorageProvider();
    } catch (error) {
      console.warn("Failed to initialize GCS storage provider:", error);
    }
  }

  return new UnavailableStorageProvider();
}

let storageProvider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (!storageProvider) {
    storageProvider = detectStorageProvider();
  }
  return storageProvider;
}

export function getStorageStatus(): {
  available: boolean;
  provider: StorageProviderType;
  message: string;
} {
  const provider = getStorageProvider();
  if (provider.type === "unavailable") {
    return {
      available: false,
      provider: "unavailable",
      message: "Object storage not available. Set PRIVATE_OBJECT_DIR (Replit) or GCS_SERVICE_ACCOUNT_JSON + GCS_BUCKET_NAME (GCS).",
    };
  }
  return {
    available: true,
    provider: provider.type,
    message: `Object storage is configured using ${provider.type === "replit" ? "Replit" : "Google Cloud Storage"} provider.`,
  };
}

export const objectStorageClient = {
  bucket: (name: string) => getStorageProvider().getStorageClient().bucket(name),
};

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  private provider: StorageProvider;

  constructor() {
    this.provider = getStorageProvider();
  }

  getPublicObjectSearchPaths(): Array<string> {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr
          .split(",")
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
      )
    );
    if (paths.length === 0) {
      if (this.provider.type === "gcs") {
        return [`/${this.provider.bucketName}/public`];
      }
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Create a bucket in 'Object Storage' " +
          "tool and set PUBLIC_OBJECT_SEARCH_PATHS env var (comma-separated paths)."
      );
    }
    return paths;
  }

  getPrivateObjectDir(): string {
    if (this.provider.type === "replit") {
      const dir = process.env.PRIVATE_OBJECT_DIR || "";
      if (!dir) {
        throw new Error(
          "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' " +
            "tool and set PRIVATE_OBJECT_DIR env var."
        );
      }
      return dir;
    } else if (this.provider.type === "gcs") {
      return `/${this.provider.bucketName}/.private`;
    }
    throw new Error("Storage provider not available");
  }

  async searchPublicObject(filePath: string): Promise<File | null> {
    if (this.provider.type === "unavailable") {
      return null;
    }

    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath}/${filePath}`;
      const { bucketName, objectName } = parseObjectPath(fullPath);
      const bucket = this.provider.getStorageClient().bucket(bucketName);
      const file = bucket.file(objectName);

      const [exists] = await file.exists();
      if (exists) {
        return file;
      }
    }
    return null;
  }

  async downloadObject(file: File, res: Response, cacheTtlSec: number = 3600) {
    try {
      const [metadata] = await file.getMetadata();
      const aclPolicy = await getObjectAclPolicy(file);
      const isPublic = aclPolicy?.visibility === "public";
      
      res.set({
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Content-Length": metadata.size,
        "Cache-Control": `${isPublic ? "public" : "private"}, max-age=${cacheTtlSec}`,
      });

      const stream = file.createReadStream();
      stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });
      stream.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }

  async getObjectEntityUploadURL(contentType?: string): Promise<string> {
    if (this.provider.type === "unavailable") {
      throw new Error("Storage provider not available");
    }

    const objectId = randomUUID();
    const uploadsPrefix = this.provider.getUploadsPrefix();
    const objectName = `${uploadsPrefix}/${objectId}`;

    return this.provider.signUploadUrl(objectName, 900, contentType);
  }

  async uploadObjectEntityBuffer(buffer: Buffer, contentType?: string): Promise<string> {
    if (this.provider.type === "unavailable") {
      throw new Error("Storage provider not available");
    }

    const objectId = randomUUID();
    const uploadsPrefix = this.provider.getUploadsPrefix();
    const objectName = `${uploadsPrefix}/${objectId}`;
    const file = this.provider.getBucket().file(objectName);

    await file.save(buffer, {
      resumable: false,
      contentType: contentType || "application/octet-stream",
      metadata: {
        contentType: contentType || "application/octet-stream",
      },
    });

    return this.provider.getPublicUrl(objectName);
  }

  async getObjectEntityFile(objectPath: string): Promise<File> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }

    const entityId = parts.slice(1).join("/");
    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) {
      entityDir = `${entityDir}/`;
    }
    const objectEntityPath = `${entityDir}${entityId}`;
    const { bucketName, objectName } = parseObjectPath(objectEntityPath);
    const bucket = this.provider.getStorageClient().bucket(bucketName);
    const objectFile = bucket.file(objectName);
    const [exists] = await objectFile.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    return objectFile;
  }

  normalizeObjectEntityPath(rawPath: string): string {
    if (!rawPath.startsWith("https://storage.googleapis.com/")) {
      return rawPath;
    }

    const url = new URL(rawPath);
    const rawObjectPath = url.pathname;

    let objectEntityDir = this.getPrivateObjectDir();
    if (!objectEntityDir.endsWith("/")) {
      objectEntityDir = `${objectEntityDir}/`;
    }

    if (!rawObjectPath.startsWith(objectEntityDir)) {
      return rawObjectPath;
    }

    const entityId = rawObjectPath.slice(objectEntityDir.length);
    return `/objects/${entityId}`;
  }

  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/")) {
      return normalizedPath;
    }

    const objectFile = await this.getObjectEntityFile(normalizedPath);
    await setObjectAclPolicy(objectFile, aclPolicy);
    return normalizedPath;
  }

  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission,
  }: {
    userId?: string;
    objectFile: File;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    return canAccessObject({
      userId,
      objectFile,
      requestedPermission: requestedPermission ?? ObjectPermission.READ,
    });
  }

  extractObjectEntityPath(rawPath: string): string {
    return this.normalizeObjectEntityPath(rawPath);
  }

  getObjectEntityPublicUrl(objectPath: string): string {
    if (!objectPath.startsWith('/objects/')) {
      return objectPath;
    }

    const entityId = objectPath.slice('/objects/'.length);

    if (this.provider.type === "gcs") {
      const objectName = `${this.provider.getUploadsPrefix()}/${entityId}`.replace(/^uploads\//, '');
      return this.provider.getPublicUrl(objectName);
    }

    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) {
      entityDir = `${entityDir}/`;
    }

    const fullPath = `${entityDir}${entityId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);
    return `https://storage.googleapis.com/${bucketName}/${objectName}`;
  }

  getProviderType(): StorageProviderType {
    return this.provider.type;
  }
}

function parseObjectPath(path: string): {
  bucketName: string;
  objectName: string;
} {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  const pathParts = path.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }

  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");

  return {
    bucketName,
    objectName,
  };
}
