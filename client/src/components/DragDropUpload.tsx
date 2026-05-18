import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, File, FileImage, X, Check, Loader2, AlertCircle, Camera } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

export interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string | null;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  uploadedUrl?: string;
  error?: string;
}

interface DragDropUploadProps {
  onUploadComplete: (result: { url: string; size: number; type: string }) => void;
  onError?: (error: string) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
  disabled?: boolean;
  multiple?: boolean;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const generateId = () => Math.random().toString(36).substring(2, 11);

export function DragDropUpload({
  onUploadComplete,
  onError,
  maxFileSize = 10485760,
  allowedTypes = ['image/*', 'application/pdf'],
  disabled = false,
  multiple = false,
}: DragDropUploadProps) {
  const { language } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const previewUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach(url => {
        URL.revokeObjectURL(url);
      });
      previewUrlsRef.current = [];
    };
  }, []);

  const isValidFileType = useCallback((file: File): boolean => {
    return allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const category = type.replace('/*', '/');
        return file.type.startsWith(category);
      }
      return file.type === type;
    });
  }, [allowedTypes]);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxFileSize) {
      const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(0);
      return language === 'zh-HK' 
        ? `文件過大，最大允許 ${maxSizeMB}MB` 
        : `File too large, max ${maxSizeMB}MB allowed`;
    }
    if (!isValidFileType(file)) {
      return language === 'zh-HK' 
        ? '不支援的文件格式' 
        : 'Unsupported file format';
    }
    return null;
  }, [maxFileSize, isValidFileType, language]);

  const uploadFile = async (uploadedFile: UploadedFile): Promise<void> => {
    const { file, id } = uploadedFile;

    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, status: "uploading" as const, progress: 0 } : f
    ));

    try {
      const response = await apiRequest('POST', '/api/medical-records/upload-url', {
        contentType: file.type,
      });
      const { uploadURL } = await response.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setFiles(prev => prev.map(f => 
              f.id === id ? { ...f, progress } : f
            ));
          }
        });

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.open('PUT', uploadURL);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      const finalUrl = uploadURL.split('?')[0];
      
      setFiles(prev => prev.map(f => 
        f.id === id ? { ...f, status: "success" as const, progress: 100, uploadedUrl: finalUrl } : f
      ));

      onUploadComplete({
        url: finalUrl,
        size: file.size,
        type: file.type,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = language === 'zh-HK' 
        ? '上傳失敗，請重試' 
        : 'Upload failed, please try again';
      
      setFiles(prev => prev.map(f => 
        f.id === id ? { ...f, status: "error" as const, error: errorMessage } : f
      ));
      
      onError?.(errorMessage);
    }
  };

  const processFiles = async (fileList: FileList | File[]) => {
    const newFiles: UploadedFile[] = [];

    for (const file of Array.from(fileList)) {
      const validationError = validateFile(file);
      
      if (validationError) {
        onError?.(validationError);
        continue;
      }

      const id = generateId();
      let previewUrl: string | null = null;

      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
        previewUrlsRef.current.push(previewUrl);
      }

      newFiles.push({
        id,
        file,
        previewUrl,
        progress: 0,
        status: "pending",
      });

      if (!multiple) break;
    }

    if (newFiles.length === 0) return;

    if (multiple) {
      setFiles(prev => [...prev, ...newFiles]);
    } else {
      // In single-file mode, revoke preview URLs from previous file before replacing
      setFiles(prev => {
        prev.forEach(oldFile => {
          if (oldFile.previewUrl) {
            URL.revokeObjectURL(oldFile.previewUrl);
            previewUrlsRef.current = previewUrlsRef.current.filter(url => url !== oldFile.previewUrl);
          }
        });
        return newFiles;
      });
    }

    for (const uploadedFile of newFiles) {
      await uploadFile(uploadedFile);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounterRef.current = 0;

    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    e.target.value = '';
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
        previewUrlsRef.current = previewUrlsRef.current.filter(url => url !== fileToRemove.previewUrl);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const acceptTypes = allowedTypes.map(t => {
    if (t === 'application/pdf') return '.pdf';
    if (t.startsWith('image/')) return t;
    return t;
  }).join(',');

  const hasUploadingFile = files.some(f => f.status === "uploading");
  const isDisabled = disabled || hasUploadingFile;

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileImage className="w-6 h-6 text-blue-500" />;
    }
    return <File className="w-6 h-6 text-gray-500 dark:text-gray-400" />;
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptTypes}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isDisabled}
        multiple={multiple}
        data-testid="input-file-drop"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isDisabled}
        data-testid="input-camera-drop"
      />

      {files.length === 0 && (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer",
            "bg-gray-50 dark:bg-gray-800/50",
            isDragOver 
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
            isDisabled && "opacity-50 cursor-not-allowed"
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !isDisabled && fileInputRef.current?.click()}
          data-testid="dropzone-area"
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center mb-3",
              isDragOver 
                ? "bg-blue-100 dark:bg-blue-900/40" 
                : "bg-gray-100 dark:bg-gray-700"
            )}>
              <Upload className={cn(
                "w-6 h-6",
                isDragOver 
                  ? "text-blue-500" 
                  : "text-gray-400 dark:text-gray-500"
              )} />
            </div>
            <p className={cn(
              "text-sm font-medium mb-1",
              isDragOver 
                ? "text-blue-600 dark:text-blue-400" 
                : "text-gray-700 dark:text-gray-300"
            )}>
              {isDragOver 
                ? (language === 'zh-HK' ? '放開以上傳文件' : 'Drop to upload')
                : (language === 'zh-HK' ? '拖放文件到此處或點擊選擇' : 'Drag & drop files here or click to select')
              }
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'zh-HK' 
                ? `支援圖片和PDF，最大 ${(maxFileSize / (1024 * 1024)).toFixed(0)}MB`
                : `Images and PDFs, max ${(maxFileSize / (1024 * 1024)).toFixed(0)}MB`
              }
            </p>
          </div>
        </div>
      )}

      {files.length === 0 && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isDisabled}
            className="flex-1"
            data-testid="button-browse-files"
          >
            <Upload className="w-4 h-4 mr-2" />
            {language === 'zh-HK' ? '選擇文件' : 'Browse Files'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => cameraInputRef.current?.click()}
            disabled={isDisabled}
            className="flex-1"
            data-testid="button-take-photo-drop"
          >
            <Camera className="w-4 h-4 mr-2" />
            {language === 'zh-HK' ? '拍照' : 'Take Photo'}
          </Button>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((uploadedFile) => (
            <div
              key={uploadedFile.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                uploadedFile.status === "error" 
                  ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20"
                  : uploadedFile.status === "success"
                  ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20"
                  : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              )}
              data-testid={`file-item-${uploadedFile.id}`}
            >
              {uploadedFile.previewUrl ? (
                <img
                  src={uploadedFile.previewUrl}
                  alt={uploadedFile.file.name}
                  className="w-14 h-14 object-cover rounded-md flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md flex-shrink-0">
                  {getFileIcon(uploadedFile.file)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(uploadedFile.file.size)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {uploadedFile.status === "uploading" && (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    )}
                    {uploadedFile.status === "success" && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                    {uploadedFile.status === "error" && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    {uploadedFile.status !== "uploading" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(uploadedFile.id)}
                        className="h-7 w-7 p-0"
                        data-testid={`button-remove-file-${uploadedFile.id}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {uploadedFile.status === "uploading" && (
                  <div className="mt-2">
                    <Progress value={uploadedFile.progress} className="h-1.5" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {language === 'zh-HK' 
                        ? `上傳中 ${uploadedFile.progress}%` 
                        : `Uploading ${uploadedFile.progress}%`
                      }
                    </p>
                  </div>
                )}

                {uploadedFile.status === "success" && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {language === 'zh-HK' ? '上傳成功' : 'Upload complete'}
                  </p>
                )}

                {uploadedFile.status === "error" && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {uploadedFile.error}
                  </p>
                )}
              </div>
            </div>
          ))}

          {!hasUploadingFile && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                files.forEach(file => {
                  if (file.previewUrl) {
                    URL.revokeObjectURL(file.previewUrl);
                  }
                });
                previewUrlsRef.current = [];
                setFiles([]);
              }}
              className="w-full"
              data-testid="button-clear-all-files"
            >
              <X className="w-4 h-4 mr-2" />
              {language === 'zh-HK' ? '清除所有文件' : 'Clear All'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
