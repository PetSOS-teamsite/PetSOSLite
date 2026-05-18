import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { messagingService } from "./services/messaging";
import { setupAuth, isAuthenticated, isAdmin, sanitizeUser } from "./auth";
import { setupTestUtils } from "./testUtils";
import { db } from "./db";
import { messages } from "@shared/schema";
import { eq } from "drizzle-orm";
import rateLimit from "express-rate-limit";
import * as OTPAuth from "otpauth";
import * as QRCode from "qrcode";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { 
  generalLimiter, 
  authLimiter, 
  broadcastLimiter, 
  exportLimiter, 
  deletionLimiter,
  strictLimiter 
} from "./middleware/rateLimiter";
import { deepseekService } from "./services/deepseek";
import { checkAndUpdateTyphoonStatus } from "./services/typhoon-monitor";
import { fetchTyphoonWarning } from "./services/hko-api";
import { 
  insertUserSchema, insertPetSchema, insertClinicSchema,
  insertMessageSchema, emergencyRequests,
  insertRegionSchema, insertCountrySchema, insertPetBreedSchema,
  insertFeatureFlagSchema,
  insertAuditLogSchema, insertPrivacyConsentSchema,
  insertTranslationSchema, insertEmergencyRequestSchema,
  insertPetMedicalRecordSchema, insertPetMedicalSharingConsentSchema,
  insertPushSubscriptionSchema, insertNotificationBroadcastSchema,
  insertVetApplicationSchema, insertVetConsultantSchema, insertContentVerificationSchema,
  STORAGE_QUOTA
} from "@shared/schema";
import { fcmService, sendBroadcastNotification as sendFCMBroadcast } from "./services/fcm";
import { ObjectStorageService, ObjectNotFoundError, getStorageStatus } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import path from "path";
import { config } from "./config";
import { encryptTotpSecret, decryptTotpSecret, isEncryptedSecret } from "./encryption";
import { handleHospitalReply } from "./services/hospital-ping-scheduler";
import type { Hospital, InsertHospitalChangeLog } from "@shared/schema";

// Helper function to detect and log hospital field changes
async function logHospitalChanges(
  hospitalId: string, 
  oldData: Hospital, 
  newData: Record<string, any>,
  changedBy: string,
  changeSource: 'access_code' | 'verification_code' | 'admin' | 'api',
  changeType: 'update' | 'confirm' | 'status_change',
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const changeLogs: InsertHospitalChangeLog[] = [];
  
  for (const [key, newValue] of Object.entries(newData)) {
    const oldValue = (oldData as any)[key];
    
    // Skip if values are effectively the same
    if (oldValue === newValue) continue;
    if (oldValue === null && newValue === '') continue;
    if (oldValue === '' && newValue === null) continue;
    
    // Convert values to strings for storage
    const oldValueStr = oldValue === null || oldValue === undefined ? null : String(oldValue);
    const newValueStr = newValue === null || newValue === undefined ? null : String(newValue);
    
    // Skip if string representations are the same
    if (oldValueStr === newValueStr) continue;
    
    changeLogs.push({
      hospitalId,
      fieldName: key,
      oldValue: oldValueStr,
      newValue: newValueStr,
      changedBy,
      changeSource,
      changeType,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    });
  }
  
  if (changeLogs.length > 0) {
    await storage.createHospitalChangeLogs(changeLogs);
    console.log(`[Audit] Logged ${changeLogs.length} changes for hospital ${hospitalId} by ${changedBy} via ${changeSource}`);
  }
}

// WhatsApp webhook signature verification
// Meta signs all webhook payloads with X-Hub-Signature-256 using your app secret
function verifyWhatsAppSignature(req: any): boolean {
  const signature = req.headers['x-hub-signature-256'];
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  
  // If no app secret configured, log warning but allow in development
  if (!appSecret) {
    if (config.isDevelopment) {
      console.warn('[WhatsApp Webhook] WHATSAPP_APP_SECRET not configured - skipping signature verification in development');
      return true;
    }
    console.error('[WhatsApp Webhook] WHATSAPP_APP_SECRET not configured - rejecting request in production');
    return false;
  }
  
  // Signature header is required
  if (!signature) {
    console.error('[WhatsApp Webhook] Missing X-Hub-Signature-256 header');
    return false;
  }
  
  // Get raw body for signature verification (Buffer captured by express.json middleware)
  const rawBody = req.rawBody as Buffer | undefined;
  if (!rawBody) {
    console.error('[WhatsApp Webhook] Raw body not available for signature verification');
    return false;
  }
  
  // Compute expected signature using the raw body buffer
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex');
  
  // Use timing-safe comparison to prevent timing attacks
  try {
    const signatureBuffer = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    
    if (signatureBuffer.length !== expectedBuffer.length) {
      console.error('[WhatsApp Webhook] Signature length mismatch');
      return false;
    }
    
    const isValid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    if (!isValid) {
      console.error('[WhatsApp Webhook] Invalid signature');
    }
    return isValid;
  } catch (error) {
    console.error('[WhatsApp Webhook] Signature verification error:', error);
    return false;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up Replit Auth
  await setupAuth(app);
  
  // Set up test utilities (only in non-production)
  setupTestUtils(app);
  
  // Health check endpoint for Render and other platforms (no rate limiting)
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // ===== WHATSAPP WEBHOOK ENDPOINTS =====
  // These endpoints receive status updates from Meta when WhatsApp messages are delivered/read
  // They must be publicly accessible (no auth) for Meta to call them
  
  // Webhook verification endpoint (GET) - Meta sends a challenge to verify the webhook
  app.get('/api/webhooks/whatsapp', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    // Verify token — env var takes precedence, known value used as fallback
    // (This token is not secret: Meta transmits it in plaintext in the URL)
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'petsos-webhook-2026';
    
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[WhatsApp Webhook] Verification successful');
      res.status(200).send(challenge);
    } else {
      console.error('[WhatsApp Webhook] Verification failed - mode:', mode, 'token match:', token === verifyToken);
      res.sendStatus(403);
    }
  });
  
  // Webhook event receiver (POST) - Meta sends status updates here
  app.post('/api/webhooks/whatsapp', async (req, res) => {
    // SECURITY: Verify webhook signature before processing any data
    if (!verifyWhatsAppSignature(req)) {
      console.error('[WhatsApp Webhook] Signature verification failed - rejecting request');
      return res.sendStatus(401);
    }
    
    try {
      console.log('[WhatsApp Webhook] Event received (signature verified)');
      
      const body = req.body;
      
      // Meta sends events in a specific structure
      if (body?.object === 'whatsapp_business_account') {
        for (const entry of body.entry || []) {
          for (const change of entry.changes || []) {
            if (change.field === 'messages') {
              const value = change.value;
              
              // Process message status updates
              if (value?.statuses) {
                for (const status of value.statuses) {
                  const whatsappMessageId = status.id;
                  const statusType = status.status; // sent, delivered, read, failed
                  const timestamp = status.timestamp ? new Date(parseInt(status.timestamp) * 1000) : new Date();
                  
                  console.log(`[WhatsApp Webhook] Status update: ${whatsappMessageId} -> ${statusType}`);
                  
                  // Update our database based on the status
                  try {
                    const updateData: Record<string, any> = {};
                    
                    switch (statusType) {
                      case 'sent':
                        updateData.status = 'sent';
                        updateData.sentAt = timestamp;
                        break;
                      case 'delivered':
                        updateData.status = 'delivered';
                        updateData.deliveredAt = timestamp;
                        break;
                      case 'read':
                        updateData.readAt = timestamp;
                        break;
                      case 'failed':
                        updateData.status = 'failed';
                        updateData.failedAt = timestamp;
                        // Extract error info if available
                        if (status.errors && status.errors.length > 0) {
                          updateData.errorMessage = status.errors[0].message || status.errors[0].title || 'Unknown error';
                        }
                        break;
                    }
                    
                    if (Object.keys(updateData).length > 0) {
                      const updated = await storage.updateMessageByWhatsAppId(whatsappMessageId, updateData);
                      if (updated) {
                        console.log(`[WhatsApp Webhook] Updated message ${updated.id} with status ${statusType}`);
                      } else {
                        console.log(`[WhatsApp Webhook] No message found for WhatsApp ID: ${whatsappMessageId}`);
                      }
                    }
                  } catch (updateError) {
                    console.error('[WhatsApp Webhook] Error updating message status:', updateError);
                  }
                }
              }
              
              // Process incoming messages - store in chat conversations
              if (value?.messages) {
                for (const message of value.messages) {
                  const senderPhone = message.from;
                  const messageType = message.type; // text, image, document, audio, video
                  const timestamp = message.timestamp ? new Date(parseInt(message.timestamp) * 1000) : new Date();
                  const whatsappMsgId = message.id;
                  
                  console.log(`[WhatsApp Webhook] Incoming message from ${senderPhone}: ${messageType}`);
                  
                  try {
                    // Sanitize phone number (digits only)
                    const sanitizedPhone = senderPhone.replace(/[^0-9]/g, '');
                    
                    // Extract message content based on type
                    let content = '';
                    let mediaUrl: string | undefined;
                    
                    switch (messageType) {
                      case 'text':
                        content = message.text?.body || '';
                        break;
                      case 'image':
                        content = message.image?.caption || '[Image]';
                        mediaUrl = message.image?.id; // Media ID for later retrieval
                        break;
                      case 'document':
                        content = message.document?.filename || '[Document]';
                        mediaUrl = message.document?.id;
                        break;
                      case 'audio':
                        content = '[Audio message]';
                        mediaUrl = message.audio?.id;
                        break;
                      case 'video':
                        content = message.video?.caption || '[Video]';
                        mediaUrl = message.video?.id;
                        break;
                      case 'sticker':
                        content = '[Sticker]';
                        break;
                      case 'location':
                        content = `[Location: ${message.location?.latitude}, ${message.location?.longitude}]`;
                        break;
                      case 'contacts':
                        content = '[Contact shared]';
                        break;
                      default:
                        content = `[${messageType} message]`;
                    }
                    
                    // Find or create conversation
                    let conversation = await storage.getConversationByPhone(sanitizedPhone);
                    
                    if (!conversation) {
                      // Try to find matching hospital by phone
                      const hospital = await storage.findHospitalByPhone(sanitizedPhone);
                      
                      // Get sender's profile name from webhook if available
                      const senderName = value.contacts?.[0]?.profile?.name || 
                                        (hospital ? (hospital.nameEn || hospital.nameZh) : undefined);
                      
                      // Create new conversation
                      conversation = await storage.createConversation({
                        phoneNumber: sanitizedPhone,
                        hospitalId: hospital?.id || null,
                        displayName: senderName || `+${sanitizedPhone}`,
                        lastMessageAt: timestamp,
                        lastMessagePreview: content.substring(0, 100),
                        unreadCount: 1,
                        isArchived: false,
                      });
                      
                      console.log(`[WhatsApp Webhook] Created new conversation ${conversation.id} for ${sanitizedPhone}`);
                    } else {
                      // Update existing conversation
                      await storage.updateConversation(conversation.id, {
                        lastMessageAt: timestamp,
                        lastMessagePreview: content.substring(0, 100),
                        unreadCount: (conversation.unreadCount || 0) + 1,
                      });
                    }
                    
                    // Store the incoming message
                    const chatMessage = await storage.createChatMessage({
                      conversationId: conversation.id,
                      direction: 'inbound',
                      content,
                      messageType,
                      mediaUrl,
                      whatsappMessageId: whatsappMsgId,
                      status: 'received',
                      sentAt: timestamp,
                    });
                    
                    console.log(`[WhatsApp Webhook] Stored incoming message ${chatMessage.id} in conversation ${conversation.id}`);
                    
                    // Track hospital reply for ping/availability tracking
                    if (conversation.hospitalId) {
                      try {
                        await handleHospitalReply(conversation.hospitalId, sanitizedPhone, whatsappMsgId);
                        console.log(`[WhatsApp Webhook] Tracked hospital reply for ${conversation.hospitalId}`);
                      } catch (pingError) {
                        console.error('[WhatsApp Webhook] Error tracking hospital reply:', pingError);
                      }

                      // Link this WhatsApp reply to the most recent active emergency (within 30 min)
                      try {
                        const activeEmergency = await storage.getActiveEmergencyForHospital(conversation.hospitalId, 0.5);
                        if (activeEmergency && content) {
                          // Detect quick-reply keywords to classify response
                          const normalised = content.trim().toLowerCase();
                          let responseType: string = 'other';
                          if (/^(1|yes|ok|accept|可以|接受|得|有位|可|ready|available|we can|we are able)/.test(normalised)) {
                            responseType = 'can_accept';
                          } else if (/^(2|no|full|sorry|抱歉|滿|爆滿|冇位|唔得|tonight|tonight|fully booked)/.test(normalised)) {
                            responseType = 'full';
                          } else if (/^(3|call|please call|致電|打電話|ring|contact|聯絡)/.test(normalised)) {
                            responseType = 'call_requested';
                          }
                          await storage.createHospitalEmergencyResponse({
                            emergencyRequestId: activeEmergency.id,
                            hospitalId: conversation.hospitalId,
                            message: content,
                            responseType,
                            respondedAt: timestamp,
                          });
                          console.log(`[WhatsApp Webhook] Linked reply (type=${responseType}) from hospital ${conversation.hospitalId} to emergency ${activeEmergency.id}`);
                        }
                      } catch (linkError) {
                        console.error('[WhatsApp Webhook] Error linking reply to emergency:', linkError);
                      }
                    }
                    
                  } catch (msgError) {
                    console.error('[WhatsApp Webhook] Error processing incoming message:', msgError);
                  }
                }
              }
              
              // Also update chat message status for outbound messages
              if (value?.statuses) {
                for (const status of value.statuses) {
                  const whatsappMessageId = status.id;
                  const statusType = status.status;
                  const timestamp = status.timestamp ? new Date(parseInt(status.timestamp) * 1000) : new Date();
                  
                  // Try to update chat message status (for two-way chat)
                  try {
                    const chatUpdateData: Record<string, any> = {};
                    
                    switch (statusType) {
                      case 'sent':
                        chatUpdateData.status = 'sent';
                        chatUpdateData.sentAt = timestamp;
                        break;
                      case 'delivered':
                        chatUpdateData.status = 'delivered';
                        chatUpdateData.deliveredAt = timestamp;
                        break;
                      case 'read':
                        chatUpdateData.status = 'read';
                        chatUpdateData.readAt = timestamp;
                        break;
                      case 'failed':
                        chatUpdateData.status = 'failed';
                        if (status.errors?.[0]) {
                          chatUpdateData.errorMessage = status.errors[0].message || status.errors[0].title;
                        }
                        break;
                    }
                    
                    if (Object.keys(chatUpdateData).length > 0) {
                      const updatedChat = await storage.updateChatMessageByWhatsAppId(whatsappMessageId, chatUpdateData);
                      if (updatedChat) {
                        console.log(`[WhatsApp Webhook] Updated chat message ${updatedChat.id} status to ${statusType}`);
                      }
                    }
                  } catch (chatError) {
                    // Silently ignore - message might be from broadcast system, not chat
                  }
                }
              }
            }
          }
        }
      }
      
      // Always respond with 200 OK to acknowledge receipt
      res.sendStatus(200);
    } catch (error) {
      console.error('[WhatsApp Webhook] Error processing event:', error);
      // Still return 200 to prevent Meta from retrying
      res.sendStatus(200);
    }
  });
  
  // Serve sitemap.xml and robots.txt with correct content-type headers
  const publicDir = config.isDevelopment 
    ? path.resolve(import.meta.dirname, '../client/public')
    : path.resolve(import.meta.dirname, 'public');
    
  // Dynamic sitemap.xml generation from database
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const baseUrl = 'https://petsos.site';
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch active regions
      const regions = await storage.getRegions();
      const activeRegions = regions.filter(r => r.active);
      
      // Fetch indexable hospitals (available AND (verified OR open247) AND has slug)
      const allHospitals = await storage.getAllHospitals();
      const indexableHospitals = allHospitals.filter(h => 
        h.slug && h.isAvailable && (h.verified || h.open247)
      );
      
      // Static pages with priorities
      const staticPages = [
        { path: '/', priority: '1.0', changefreq: 'daily' },
        { path: '/emergency', priority: '1.0', changefreq: 'weekly' },
        { path: '/emergency-symptoms', priority: '0.9', changefreq: 'monthly' },
        { path: '/hospitals', priority: '0.9', changefreq: 'daily' },
        { path: '/clinics', priority: '0.9', changefreq: 'daily' },
        { path: '/districts', priority: '0.8', changefreq: 'weekly' },
        { path: '/resources', priority: '0.7', changefreq: 'weekly' },
        { path: '/faq', priority: '0.7', changefreq: 'monthly' },
        { path: '/about', priority: '0.7', changefreq: 'monthly' },
        { path: '/medical-advisory', priority: '0.6', changefreq: 'monthly' },
        { path: '/verification-process', priority: '0.6', changefreq: 'monthly' },
        { path: '/consultants', priority: '0.6', changefreq: 'monthly' },
        { path: '/typhoon-status', priority: '0.7', changefreq: 'daily' },
        { path: '/privacy', priority: '0.4', changefreq: 'monthly' },
        { path: '/terms', priority: '0.4', changefreq: 'monthly' },
      ];
      
      // Blog pages
      const blogPages = [
        { path: '/blog/midnight-fees', priority: '0.8', changefreq: 'weekly' },
        { path: '/blog/blood-bank', priority: '0.8', changefreq: 'weekly' },
        { path: '/blog/typhoon-guide', priority: '0.8', changefreq: 'weekly' },
        { path: '/blog/imaging-diagnostics', priority: '0.8', changefreq: 'weekly' },
        { path: '/blog/exotic-emergency', priority: '0.8', changefreq: 'weekly' },
      ];
      
      // Build XML
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      
      // Static pages
      for (const page of staticPages) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `  </url>\n`;
      }
      
      // Blog pages
      for (const page of blogPages) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `  </url>\n`;
      }
      
      // Active region pages
      for (const region of activeRegions) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/district/${region.code}</loc>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `  </url>\n`;
      }
      
      // Hospital detail pages with lastmod from updatedAt/lastVerifiedAt
      for (const hospital of indexableHospitals) {
        const lastmod = hospital.lastVerifiedAt 
          ? new Date(hospital.lastVerifiedAt).toISOString().split('T')[0]
          : hospital.updatedAt 
            ? new Date(hospital.updatedAt).toISOString().split('T')[0]
            : today;
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/hospitals/${hospital.slug}</loc>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `  </url>\n`;
      }
      
      xml += '</urlset>';
      
      // Set headers and send
      res.set({
        'Content-Type': 'application/xml; charset=UTF-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      });
      res.send(xml);
    } catch (error) {
      console.error('[Sitemap] Error generating sitemap:', error);
      // Fallback to static sitemap on error
      res.set({
        'Content-Type': 'application/xml; charset=UTF-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      });
      res.sendFile('sitemap.xml', { 
        root: publicDir,
        etag: false,
        lastModified: false
      });
    }
  });
  
  app.get('/sitemap-2025.xml', (req, res) => {
    // Alternate sitemap URL to bypass caching
    res.set({
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.removeHeader('ETag');
    res.sendFile('sitemap-2025.xml', { 
      root: publicDir,
      etag: false,
      lastModified: false
    });
  });
  
  app.get('/sitemap-oct29.xml', (req, res) => {
    // Dated sitemap URL to bypass all caching layers
    // Accepts optional ?v= parameter for additional cache busting
    res.set({
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Robots-Tag': 'noindex'
    });
    res.removeHeader('ETag');
    res.sendFile('sitemap-oct29.xml', { 
      root: publicDir,
      etag: false,
      lastModified: false
    });
  });
  
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.sendFile('robots.txt', { root: publicDir });
  });
  
  // Test route to verify API routing works
  app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
  });
  
  // Check if object storage is available (used by frontend to show/hide upload buttons)
  app.get('/api/storage/status', (req, res) => {
    const status = getStorageStatus();
    res.json(status);
  });
  
  // Apply general rate limiter to all API routes (100 req/15min)
  app.use('/api/', generalLimiter);
  
  // ===== USER ROUTES =====
  // Note: User registration is handled by /api/auth/signup in auth.ts
  // IMPORTANT: Specific routes must come BEFORE parameterized :id routes

  // GDPR/PDPO: Export user data
  app.get("/api/users/export", exportLimiter, isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const exportData = await storage.exportUserData(userId);

      // Sanitize user data before export to remove password hashes
      const sanitizedExportData = {
        ...exportData,
        user: sanitizeUser(exportData.user)
      };

      // Log export for audit
      await storage.createAuditLog({
        entityType: 'user',
        entityId: userId,
        action: 'export_data',
        userId: userId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      // Set headers for JSON download (use res.send instead of res.json to preserve headers)
      const filename = `petsos-data-export-${userId}-${new Date().toISOString()}.json`;
      res.status(200)
        .set({
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`
        })
        .send(JSON.stringify(sanitizedExportData, null, 2));
    } catch (error) {
      console.error("Error exporting user data:", error);
      res.status(500).json({ message: "Failed to export user data" });
    }
  });

  // GDPR/PDPO: Delete user data (Right to be Forgotten)
  app.delete("/api/users/gdpr-delete", deletionLimiter, isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;

      // Log deletion request BEFORE deleting
      await storage.createAuditLog({
        entityType: 'user',
        entityId: userId,
        action: 'gdpr_delete_request',
        userId: userId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      // Perform GDPR-compliant deletion
      const result = await storage.deleteUserDataGDPR(userId);

      if (!result.success) {
        return res.status(404).json({ message: "User not found" });
      }

      // Destroy session after successful deletion
      req.session.destroy((err: Error) => {
        if (err) {
          console.error("Error destroying session after GDPR delete:", err);
        }
      });

      res.json({
        success: true,
        message: "Your account and all associated data have been permanently deleted",
        deletedRecords: result.deletedRecords
      });
    } catch (error) {
      console.error("Error deleting user data:", error);
      res.status(500).json({ message: "Failed to delete user data" });
    }
  });

  // Get user by ID
  app.get("/api/users/:id", isAuthenticated, async (req: any, res) => {
    try {
      const requestingUserId = (req.user as any).id;
      const targetUserId = req.params.id;
      
      // Users can only view their own profile unless they're admin
      const requestingUser = await storage.getUser(requestingUserId);
      if (!requestingUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (requestingUserId !== targetUserId && requestingUser.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden - You can only view your own profile" });
      }
      
      const user = await storage.getUser(targetUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(sanitizeUser(user));
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update user
  app.patch("/api/users/:id", isAuthenticated, async (req: any, res) => {
    try {
      const requestingUserId = (req.user as any).id;
      const targetUserId = req.params.id;
      
      // Users can only update their own profile unless they're admin
      const requestingUser = await storage.getUser(requestingUserId);
      if (!requestingUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (requestingUserId !== targetUserId && requestingUser.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden - You can only update your own profile" });
      }
      
      // Parse update data with appropriate schema based on role
      let updateData;
      if (requestingUser.role === 'admin') {
        // Admins can update all fields including role and clinicId
        updateData = insertUserSchema.partial().parse(req.body);
      } else {
        // Regular users cannot update role or clinicId
        const safeUpdateSchema = insertUserSchema.omit({ role: true, clinicId: true }).partial();
        updateData = safeUpdateSchema.parse(req.body);
      }
      
      const user = await storage.updateUser(targetUserId, updateData);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.createAuditLog({
        entityType: 'user',
        entityId: user.id,
        action: 'update',
        userId: requestingUserId,
        changes: updateData,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json(sanitizeUser(user));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Internal server error", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Delete user
  app.delete("/api/users/:id", strictLimiter, isAuthenticated, async (req: any, res) => {
    try {
      const requestingUserId = (req.user as any).id;
      const targetUserId = req.params.id;
      
      // Users can only delete their own account unless they're admin
      const requestingUser = await storage.getUser(requestingUserId);
      if (!requestingUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (requestingUserId !== targetUserId && requestingUser.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden - You can only delete your own account" });
      }
      
      const success = await storage.deleteUser(targetUserId);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.createAuditLog({
        entityType: 'user',
        entityId: targetUserId,
        action: 'delete',
        userId: requestingUserId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get notification preferences for user
  app.get("/api/users/:id/notification-preferences", isAuthenticated, async (req: any, res) => {
    try {
      const requestingUserId = (req.user as any).id;
      const targetUserId = req.params.id;
      
      // Users can only view their own preferences unless they're admin
      const requestingUser = await storage.getUser(requestingUserId);
      if (!requestingUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (requestingUserId !== targetUserId && requestingUser.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden - You can only view your own preferences" });
      }
      
      const user = await storage.getUser(targetUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return notification preferences or defaults
      const preferences = user.notificationPreferences || {
        emergencyAlerts: true,
        generalUpdates: true,
        promotions: false,
        systemAlerts: true,
        vetTips: true,
      };
      
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update notification preferences for user
  app.patch("/api/users/:id/notification-preferences", isAuthenticated, async (req: any, res) => {
    try {
      const requestingUserId = (req.user as any).id;
      const targetUserId = req.params.id;
      
      // Users can only update their own preferences unless they're admin
      const requestingUser = await storage.getUser(requestingUserId);
      if (!requestingUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (requestingUserId !== targetUserId && requestingUser.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden - You can only update your own preferences" });
      }
      
      // Validate the notification preferences
      const notificationPreferencesUpdateSchema = z.object({
        emergencyAlerts: z.boolean().optional(),
        generalUpdates: z.boolean().optional(),
        promotions: z.boolean().optional(),
        systemAlerts: z.boolean().optional(),
        vetTips: z.boolean().optional(),
      });
      
      const updates = notificationPreferencesUpdateSchema.parse(req.body);
      
      // Get existing preferences and merge with updates
      const user = await storage.getUser(targetUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const currentPreferences = user.notificationPreferences || {
        emergencyAlerts: true,
        generalUpdates: true,
        promotions: false,
        systemAlerts: true,
        vetTips: true,
      };
      
      const newPreferences = { ...currentPreferences, ...updates };
      
      const updatedUser = await storage.updateUser(targetUserId, {
        notificationPreferences: newPreferences
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.createAuditLog({
        entityType: 'user',
        entityId: targetUserId,
        action: 'update_notification_preferences',
        userId: requestingUserId,
        changes: updates,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json(updatedUser.notificationPreferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating notification preferences:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== TWO-FACTOR AUTHENTICATION ROUTES =====
  
  // Setup 2FA - Generate TOTP secret and QR code (admin only)
  // SECURITY FLOW:
  // 1. Generate raw TOTP secret
  // 2. Create otpauth:// URL and QR code from raw secret (for authenticator apps)
  // 3. Encrypt the raw secret for secure storage
  // 4. Store ENCRYPTED secret in database (never store plain secrets)
  // 5. Return UNENCRYPTED secret and QR to client (for one-time display only)
  app.post("/api/auth/2fa/setup", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.twoFactorEnabled) {
        return res.status(400).json({ message: "2FA is already enabled" });
      }
      
      // Step 1: Generate a new TOTP secret (raw, unencrypted)
      const secret = new OTPAuth.Secret({ size: 20 });
      const rawSecret = secret.base32; // This is what authenticator apps need
      
      // Step 2: Create TOTP object and generate QR code from RAW secret
      const totp = new OTPAuth.TOTP({
        issuer: "PetSOS",
        label: user.email || user.name || "Admin",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: secret,
      });
      
      const otpauthUrl = totp.toString();
      const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
      
      // Step 3: Encrypt the secret for secure database storage
      const encryptedSecret = encryptTotpSecret(rawSecret);
      
      // Step 4: Store the ENCRYPTED secret in database (will be confirmed on verify)
      await storage.updateUserTwoFactor(userId, encryptedSecret, null, false);
      
      // Step 5: Return RAW (unencrypted) secret and QR to client for one-time display
      // IMPORTANT: We return rawSecret (not encryptedSecret) so authenticator apps work
      res.json({
        secret: rawSecret,
        qrCode: qrCodeDataUrl,
        otpauthUrl: otpauthUrl,
      });
    } catch (error) {
      console.error("Error setting up 2FA:", error);
      res.status(500).json({ message: "Failed to setup 2FA" });
    }
  });
  
  // Verify 2FA code and enable 2FA
  // SECURITY: This endpoint does NOT return the secret - it was already shown during setup
  // Only backup codes are returned (one-time display for user to save)
  app.post("/api/auth/2fa/verify", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const { code } = req.body;
      
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ message: "Verification code is required" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!user.twoFactorSecret) {
        return res.status(400).json({ message: "2FA setup not initiated. Please start setup first." });
      }
      
      if (user.twoFactorEnabled) {
        return res.status(400).json({ message: "2FA is already enabled" });
      }
      
      // SECURITY FIX: Decrypt the secret before verification
      // Handle backwards compatibility with unencrypted secrets
      let decryptedSecret: string;
      try {
        if (isEncryptedSecret(user.twoFactorSecret)) {
          decryptedSecret = decryptTotpSecret(user.twoFactorSecret);
        } else {
          decryptedSecret = user.twoFactorSecret;
        }
      } catch (decryptError) {
        console.error("Error decrypting 2FA secret:", decryptError);
        return res.status(500).json({ message: "Failed to process 2FA secret" });
      }
      
      // Verify the TOTP code
      const totp = new OTPAuth.TOTP({
        issuer: "PetSOS",
        label: user.email || user.name || "Admin",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(decryptedSecret),
      });
      
      const delta = totp.validate({ token: code, window: 1 });
      
      if (delta === null) {
        return res.status(400).json({ message: "Invalid verification code" });
      }
      
      // Generate backup codes
      const backupCodes: string[] = [];
      const hashedBackupCodes: string[] = [];
      
      for (let i = 0; i < 10; i++) {
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        backupCodes.push(code);
        const hashed = await bcrypt.hash(code, 10);
        hashedBackupCodes.push(hashed);
      }
      
      // Enable 2FA with backup codes (keep the encrypted secret)
      await storage.updateUserTwoFactor(userId, user.twoFactorSecret, hashedBackupCodes, true);
      
      await storage.createAuditLog({
        entityType: 'user',
        entityId: userId,
        action: '2fa_enabled',
        userId: userId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json({
        success: true,
        message: "2FA has been enabled",
        backupCodes: backupCodes, // Return plain backup codes only once
      });
    } catch (error) {
      console.error("Error verifying 2FA:", error);
      res.status(500).json({ message: "Failed to verify 2FA" });
    }
  });
  
  // Disable 2FA (requires current code)
  app.post("/api/auth/2fa/disable", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const { code } = req.body;
      
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ message: "Verification code is required" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!user.twoFactorEnabled || !user.twoFactorSecret) {
        return res.status(400).json({ message: "2FA is not enabled" });
      }
      
      // SECURITY FIX: Decrypt the secret before verification
      let decryptedSecret: string;
      try {
        if (isEncryptedSecret(user.twoFactorSecret)) {
          decryptedSecret = decryptTotpSecret(user.twoFactorSecret);
        } else {
          decryptedSecret = user.twoFactorSecret;
        }
      } catch (decryptError) {
        console.error("Error decrypting 2FA secret:", decryptError);
        return res.status(500).json({ message: "Failed to process 2FA secret" });
      }
      
      // Verify the TOTP code
      const totp = new OTPAuth.TOTP({
        issuer: "PetSOS",
        label: user.email || user.name || "Admin",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(decryptedSecret),
      });
      
      const delta = totp.validate({ token: code, window: 1 });
      
      if (delta === null) {
        return res.status(400).json({ message: "Invalid verification code" });
      }
      
      // Disable 2FA
      await storage.updateUserTwoFactor(userId, null, null, false);
      
      await storage.createAuditLog({
        entityType: 'user',
        entityId: userId,
        action: '2fa_disabled',
        userId: userId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json({
        success: true,
        message: "2FA has been disabled",
      });
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      res.status(500).json({ message: "Failed to disable 2FA" });
    }
  });
  
  // Generate new backup codes
  app.post("/api/auth/2fa/backup-codes", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const { code } = req.body;
      
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ message: "Verification code is required" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!user.twoFactorEnabled || !user.twoFactorSecret) {
        return res.status(400).json({ message: "2FA is not enabled" });
      }
      
      // SECURITY FIX: Decrypt the secret before verification
      let decryptedSecret: string;
      try {
        if (isEncryptedSecret(user.twoFactorSecret)) {
          decryptedSecret = decryptTotpSecret(user.twoFactorSecret);
        } else {
          decryptedSecret = user.twoFactorSecret;
        }
      } catch (decryptError) {
        console.error("Error decrypting 2FA secret:", decryptError);
        return res.status(500).json({ message: "Failed to process 2FA secret" });
      }
      
      // Verify the TOTP code
      const totp = new OTPAuth.TOTP({
        issuer: "PetSOS",
        label: user.email || user.name || "Admin",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(decryptedSecret),
      });
      
      const delta = totp.validate({ token: code, window: 1 });
      
      if (delta === null) {
        return res.status(400).json({ message: "Invalid verification code" });
      }
      
      // Generate new backup codes
      const backupCodes: string[] = [];
      const hashedBackupCodes: string[] = [];
      
      for (let i = 0; i < 10; i++) {
        const newCode = crypto.randomBytes(4).toString('hex').toUpperCase();
        backupCodes.push(newCode);
        const hashed = await bcrypt.hash(newCode, 10);
        hashedBackupCodes.push(hashed);
      }
      
      // Update backup codes
      await storage.updateUserTwoFactor(userId, user.twoFactorSecret, hashedBackupCodes, true);
      
      await storage.createAuditLog({
        entityType: 'user',
        entityId: userId,
        action: '2fa_backup_codes_regenerated',
        userId: userId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json({
        success: true,
        backupCodes: backupCodes,
      });
    } catch (error) {
      console.error("Error generating backup codes:", error);
      res.status(500).json({ message: "Failed to generate backup codes" });
    }
  });
  
  // Validate 2FA code during login
  app.post("/api/auth/2fa/validate", async (req: any, res) => {
    try {
      const { code, useBackupCode } = req.body;
      const pendingUserId = (req.session as any)?.pendingTwoFactorUserId;
      
      if (!pendingUserId) {
        return res.status(400).json({ message: "No pending 2FA validation" });
      }
      
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ message: "Verification code is required" });
      }
      
      const user = await storage.getUser(pendingUserId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!user.twoFactorEnabled || !user.twoFactorSecret) {
        return res.status(400).json({ message: "2FA is not enabled for this user" });
      }
      
      let isValid = false;
      
      if (useBackupCode) {
        // Validate using backup code
        isValid = await storage.validateBackupCode(pendingUserId, code);
      } else {
        // SECURITY FIX: Decrypt the secret before verification
        let decryptedSecret: string;
        try {
          if (isEncryptedSecret(user.twoFactorSecret)) {
            decryptedSecret = decryptTotpSecret(user.twoFactorSecret);
          } else {
            decryptedSecret = user.twoFactorSecret;
          }
        } catch (decryptError) {
          console.error("Error decrypting 2FA secret:", decryptError);
          return res.status(500).json({ message: "Failed to process 2FA secret" });
        }
        
        // Validate using TOTP code
        const totp = new OTPAuth.TOTP({
          issuer: "PetSOS",
          label: user.email || user.name || "Admin",
          algorithm: "SHA1",
          digits: 6,
          period: 30,
          secret: OTPAuth.Secret.fromBase32(decryptedSecret),
        });
        
        const delta = totp.validate({ token: code, window: 1 });
        isValid = delta !== null;
      }
      
      if (!isValid) {
        return res.status(400).json({ message: "Invalid verification code" });
      }
      
      // Clear pending 2FA and fully authenticate the user
      delete (req.session as any).pendingTwoFactorUserId;
      
      // Log the user in
      req.logIn(user, (err: Error) => {
        if (err) {
          console.error("Error logging in after 2FA:", err);
          return res.status(500).json({ message: "Login failed after 2FA validation" });
        }
        
        req.session.save((saveErr: Error) => {
          if (saveErr) {
            console.error("Error saving session after 2FA:", saveErr);
            return res.status(500).json({ message: "Session save failed" });
          }
          
          res.json({
            success: true,
            user: sanitizeUser(user),
          });
        });
      });
    } catch (error) {
      console.error("Error validating 2FA:", error);
      res.status(500).json({ message: "Failed to validate 2FA" });
    }
  });
  
  // Get 2FA status for current user
  app.get("/api/auth/2fa/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        enabled: user.twoFactorEnabled,
        hasBackupCodes: !!(user.twoFactorBackupCodes && user.twoFactorBackupCodes.length > 0),
        backupCodesCount: user.twoFactorBackupCodes?.length || 0,
      });
    } catch (error) {
      console.error("Error getting 2FA status:", error);
      res.status(500).json({ message: "Failed to get 2FA status" });
    }
  });

  // ===== ADMIN ROUTES =====
  
  // Get all users (admin only)
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      // Sanitize all users before returning
      const sanitizedUsers = users.map(sanitizeUser);
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all pets (admin only)
  app.get("/api/admin/pets", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const pets = await storage.getAllPets();
      res.json(pets);
    } catch (error) {
      console.error("Error fetching all pets:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== PET ROUTES =====
  
  // Get pets for user
  app.get("/api/users/:userId/pets", isAuthenticated, async (req: any, res) => {
    try {
      const requestingUserId = (req.user as any).id;
      const targetUserId = req.params.userId;
      
      // Users can only view their own pets unless they're admin
      const requestingUser = await storage.getUser(requestingUserId);
      if (!requestingUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (requestingUserId !== targetUserId && requestingUser.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden - You can only view your own pets" });
      }
      
      const pets = await storage.getPetsByUserId(targetUserId);
      res.json(pets);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create pet
  app.post("/api/pets", isAuthenticated, async (req: any, res) => {
    try {
      const requestingUserId = (req.user as any).id;
      const petData = insertPetSchema.parse(req.body);
      
      // Ensure the user is creating a pet for themselves
      if (petData.userId !== requestingUserId) {
        return res.status(403).json({ message: "Forbidden - You can only create pets for yourself" });
      }
      
      const pet = await storage.createPet(petData);
      
      await storage.createAuditLog({
        entityType: 'pet',
        entityId: pet.id,
        action: 'create',
        userId: requestingUserId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json(pet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get pet by ID
  app.get("/api/pets/:id", isAuthenticated, async (req: any, res) => {
    try {
      const requestingUserId = (req.user as any).id;
      const pet = await storage.getPet(req.params.id);
      
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      // Users can only view their own pets unless they're admin
      const requestingUser = await storage.getUser(requestingUserId);
      if (!requestingUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (pet.userId !== requestingUserId && requestingUser.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden - You can only view your own pets" });
      }
      
      res.json(pet);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update pet
  app.patch("/api/pets/:id", isAuthenticated, async (req: any, res) => {
    try {
      const requestingUserId = (req.user as any).id;
      const pet = await storage.getPet(req.params.id);
      
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      // Users can only update their own pets unless they're admin
      const requestingUser = await storage.getUser(requestingUserId);
      if (!requestingUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (pet.userId !== requestingUserId && requestingUser.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden - You can only update your own pets" });
      }
      
      const updateData = insertPetSchema.partial().parse(req.body);
      const updatedPet = await storage.updatePet(req.params.id, updateData);

      await storage.createAuditLog({
        entityType: 'pet',
        entityId: pet.id,
        action: 'update',
        userId: requestingUserId,
        changes: updateData,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json(updatedPet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Pet update error:", error);
      res.status(500).json({ message: "Internal server error", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Delete pet
  app.delete("/api/pets/:id", strictLimiter, isAuthenticated, async (req: any, res) => {
    try {
      const requestingUserId = (req.user as any).id;
      const pet = await storage.getPet(req.params.id);
      
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      
      // Users can only delete their own pets unless they're admin
      const requestingUser = await storage.getUser(requestingUserId);
      if (!requestingUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (pet.userId !== requestingUserId && requestingUser.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden - You can only delete your own pets" });
      }

      const success = await storage.deletePet(req.params.id);
      
      await storage.createAuditLog({
        entityType: 'pet',
        entityId: req.params.id,
        action: 'delete',
        userId: requestingUserId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get pet photo upload URL
  app.post("/api/pets/:id/photo-upload-url", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const petId = req.params.id;
      
      // Verify user owns this pet
      const pet = await storage.getPet(petId);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }
      if (pet.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const { contentType } = req.body || {};
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL(contentType);
      res.json({ uploadURL });
    } catch (error: any) {
      console.error("Error getting pet photo upload URL:", error);
      res.status(500).json({ error: error.message || "Failed to get upload URL" });
    }
  });

  // Update pet photo
  app.post("/api/pets/:id/photo", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const petId = req.params.id;
      
      // Validate request body
      const photoUpdateSchema = z.object({
        filePath: z.string().min(1, "File path is required"),
      });
      
      const validationResult = photoUpdateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: validationResult.error.errors 
        });
      }
      
      const { filePath: rawFilePath } = validationResult.data;
      
      // Verify user owns this pet
      const pet = await storage.getPet(petId);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }
      if (pet.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const objectStorageService = new ObjectStorageService();
      
      // Normalize the file path from upload URL
      const filePath = objectStorageService.normalizeObjectEntityPath(rawFilePath);
      
      // Validate the normalized path is a valid object path
      if (!filePath.startsWith('/objects/')) {
        return res.status(400).json({ 
          error: "Invalid file path", 
          message: "The uploaded file path is not a valid object storage path."
        });
      }
      
      // Set ACL policy - public for pet photos (gracefully handle errors)
      try {
        await objectStorageService.trySetObjectEntityAclPolicy(filePath, {
          owner: userId,
          visibility: "public",
        });
      } catch (aclError) {
        console.warn("Failed to set ACL policy for pet photo:", aclError);
        // Continue anyway - the file might still be accessible
      }
      
      // Get the public URL for the photo
      const photoUrl = objectStorageService.getObjectEntityPublicUrl(filePath);
      
      // Validate the photo URL is valid before saving
      if (!photoUrl || typeof photoUrl !== 'string') {
        return res.status(500).json({ 
          error: "Failed to generate photo URL", 
          message: "Could not generate a valid URL for the uploaded photo."
        });
      }
      
      // Update pet with photo URL
      const updatedPet = await storage.updatePet(petId, { photoUrl });
      
      await storage.createAuditLog({
        entityType: 'pet',
        entityId: petId,
        action: 'update',
        userId,
        changes: { photoUrl },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json(updatedPet);
    } catch (error: any) {
      console.error("Error updating pet photo:", error);
      res.status(500).json({ error: error.message || "Failed to update pet photo" });
    }
  });

  // Delete pet photo
  app.delete("/api/pets/:id/photo", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const petId = req.params.id;
      
      // Verify user owns this pet
      const pet = await storage.getPet(petId);
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }
      if (pet.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Update pet to remove photo URL
      const updatedPet = await storage.updatePet(petId, { photoUrl: null });
      
      await storage.createAuditLog({
        entityType: 'pet',
        entityId: petId,
        action: 'update',
        userId,
        changes: { photoUrl: null },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json(updatedPet);
    } catch (error: any) {
      console.error("Error deleting pet photo:", error);
      res.status(500).json({ error: error.message || "Failed to delete pet photo" });
    }
  });

  // ===== REGION ROUTES =====
  
  // Get all regions
  app.get("/api/regions", async (req, res) => {
    const regions = await storage.getAllRegions();
    res.json(regions);
  });

  // Get region by code
  app.get("/api/regions/code/:code", async (req, res) => {
    const region = await storage.getRegionByCode(req.params.code);
    if (!region) {
      return res.status(404).json({ message: "Region not found" });
    }
    res.json(region);
  });

  // Create region (admin only)
  app.post("/api/regions", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const regionData = insertRegionSchema.parse(req.body);
      const region = await storage.createRegion(regionData);
      
      await storage.createAuditLog({
        entityType: 'region',
        entityId: region.id,
        action: 'create',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json(region);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update region (admin only)
  app.patch("/api/regions/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const regionData = insertRegionSchema.partial().parse(req.body);
      const region = await storage.updateRegion(req.params.id, regionData);
      
      if (!region) {
        return res.status(404).json({ message: "Region not found" });
      }

      await storage.createAuditLog({
        entityType: 'region',
        entityId: region.id,
        action: 'update',
        changes: regionData,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json(region);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== COUNTRY ROUTES =====
  
  // Get all countries
  app.get("/api/countries", async (req, res) => {
    const countries = await storage.getAllCountries();
    res.json(countries);
  });

  // Get active countries only
  app.get("/api/countries/active", async (req, res) => {
    const countries = await storage.getActiveCountries();
    res.json(countries);
  });

  // Get country by code
  app.get("/api/countries/code/:code", async (req, res) => {
    const country = await storage.getCountryByCode(req.params.code);
    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }
    res.json(country);
  });

  // Get regions by country
  app.get("/api/countries/:code/regions", async (req, res) => {
    const regions = await storage.getRegionsByCountry(req.params.code);
    res.json(regions);
  });

  // Create country (admin only)
  app.post("/api/countries", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const countryData = insertCountrySchema.parse(req.body);
      const country = await storage.createCountry(countryData);
      
      await storage.createAuditLog({
        entityType: 'country',
        entityId: country.id,
        action: 'create',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json(country);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update country (admin only)
  app.patch("/api/countries/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const countryData = insertCountrySchema.partial().parse(req.body);
      const country = await storage.updateCountry(req.params.id, countryData);
      
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }

      await storage.createAuditLog({
        entityType: 'country',
        entityId: country.id,
        action: 'update',
        changes: countryData,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json(country);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete country (admin only) - soft delete
  app.delete("/api/countries/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const success = await storage.deleteCountry(req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: "Country not found" });
      }

      await storage.createAuditLog({
        entityType: 'country',
        entityId: req.params.id,
        action: 'delete',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== PET BREED ROUTES =====
  
  // Get all pet breeds
  app.get("/api/pet-breeds", async (req, res) => {
    const breeds = await storage.getAllPetBreeds();
    res.json(breeds);
  });

  // Get breeds by species
  app.get("/api/pet-breeds/species/:species", async (req, res) => {
    const breeds = await storage.getPetBreedsBySpecies(req.params.species);
    res.json(breeds);
  });

  // Get common breeds (optionally filtered by species)
  app.get("/api/pet-breeds/common", async (req, res) => {
    const species = req.query.species as string | undefined;
    const breeds = await storage.getCommonPetBreeds(species);
    res.json(breeds);
  });

  // Get breeds by country
  app.get("/api/pet-breeds/country/:countryCode", async (req, res) => {
    const breeds = await storage.getPetBreedsByCountry(req.params.countryCode);
    res.json(breeds);
  });

  // Create pet breed (admin only)
  app.post("/api/pet-breeds", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const breedData = insertPetBreedSchema.parse(req.body);
      const breed = await storage.createPetBreed(breedData);
      
      await storage.createAuditLog({
        entityType: 'pet_breed',
        entityId: breed.id,
        action: 'create',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json(breed);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update pet breed (admin only)
  app.patch("/api/pet-breeds/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const breedData = insertPetBreedSchema.partial().parse(req.body);
      const breed = await storage.updatePetBreed(req.params.id, breedData);
      
      if (!breed) {
        return res.status(404).json({ message: "Pet breed not found" });
      }

      await storage.createAuditLog({
        entityType: 'pet_breed',
        entityId: breed.id,
        action: 'update',
        changes: breedData,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json(breed);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete pet breed (admin only) - soft delete
  app.delete("/api/pet-breeds/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const success = await storage.deletePetBreed(req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: "Pet breed not found" });
      }

      await storage.createAuditLog({
        entityType: 'pet_breed',
        entityId: req.params.id,
        action: 'delete',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== CLINIC ROUTES (COMPATIBILITY LAYER - DEPRECATED) =====
  // These routes redirect to hospital endpoints for backwards compatibility
  // TODO: Remove after frontend migration complete and 48h zero usage
  
  // Helper function to transform hospital to legacy clinic format  
  // This provides backward compatibility while frontend migrates from /api/clinics to /api/hospitals
  const hospitalToClinicFormat = (h: any) => ({
    // Core identification
    id: h.id,
    slug: h.slug,
    
    // Names and addresses
    name: h.nameEn,
    nameZh: h.nameZh,
    address: h.addressEn,
    addressZh: h.addressZh,
    
    // Contact information
    phone: h.phone || '',
    whatsapp: h.whatsapp,
    email: h.email || null,
    websiteUrl: h.websiteUrl,
    
    // Location
    regionId: h.regionId,
    latitude: h.latitude ? parseFloat(h.latitude) : null,
    longitude: h.longitude ? parseFloat(h.longitude) : null,
    distance: h.distance, // Present only in nearby queries
    
    // Status and availability
    is24Hour: h.open247,
    status: h.isAvailable ? 'active' : 'inactive',
    isAvailable: h.isAvailable,
    liveStatus: h.liveStatus,
    
    // Partner and support flags
    isSupportHospital: h.isPartner,
    
    // Legacy field for backward compatibility
    services: [], // Hospitals use detailed service flags instead
    
    // Hospital indicator flags (for frontend migration period)
    isHospital: true, // Mark as hospital to distinguish from legacy clinics
    hospitalSlug: h.slug, // Frontend uses this to build /hospitals/:slug links
    
    // Media
    photos: h.photos || [],
    
    // Hospital-specific features
    onSiteVet247: h.onSiteVet247,
    triagePolicy: h.triagePolicy,
    icuLevel: h.icuLevel,
    whatsappTriage: h.whatsappTriage,
    
    // Amenities
    languages: h.languages,
    parking: h.parking,
    wheelchairAccess: h.wheelchairAccess
  });

  // Get all clinics
  app.get("/api/clinics", async (req, res) => {
    try {
      const clinics = await storage.getAllClinics();
      res.json(clinics);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get clinics by region → hospitals by region
  app.get("/api/clinics/region/:regionId", async (req, res) => {
    console.warn('[DEPRECATED] /api/clinics/region called - use /api/hospitals/region instead');
    const hospitals = await storage.getHospitalsByRegion(req.params.regionId);
    res.json(hospitals.map(hospitalToClinicFormat));
  });

  // Get 24-hour clinics by region → hospitals by region (all are 24/7)
  app.get("/api/clinics/24hour/:regionId", async (req, res) => {
    console.warn('[DEPRECATED] /api/clinics/24hour called - use /api/hospitals/region instead');
    const hospitals = await storage.getHospitalsByRegion(req.params.regionId);
    res.json(hospitals.filter(h => h.open247).map(hospitalToClinicFormat));
  });

  // Get nearby clinics → hospitals
  app.get("/api/clinics/nearby", async (req, res) => {
    console.warn('[DEPRECATED] /api/clinics/nearby called - use /api/hospitals/nearby instead');
    try {
      const { latitude, longitude, radius } = z.object({
        latitude: z.string().transform(Number),
        longitude: z.string().transform(Number),
        radius: z.string().transform(Number).default("10000"),
      }).parse(req.query);

      const hospitals = await storage.getNearbyHospitals(latitude, longitude, radius);
      res.json(hospitals.map(hospitalToClinicFormat));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get clinic by ID
  app.get("/api/clinics/:id", async (req, res) => {
    const clinic = await storage.getClinic(req.params.id);
    if (!clinic) {
      return res.status(404).json({ message: "Clinic not found" });
    }
    res.json(clinic);
  });

  // Clinic CRUD endpoints (admin only)
  app.post("/api/clinics", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const clinicData = insertClinicSchema.parse(req.body);
      const clinic = await storage.createClinic(clinicData);
      
      await storage.createAuditLog({
        entityType: 'clinic',
        entityId: clinic.id,
        action: 'create',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json(clinic);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/clinics/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const clinic = await storage.getClinic(req.params.id);
      
      if (!clinic) {
        return res.status(404).json({ message: "Clinic not found" });
      }

      const updateData = insertClinicSchema.partial().parse(req.body);
      const updatedClinic = await storage.updateClinic(req.params.id, updateData);

      await storage.createAuditLog({
        entityType: 'clinic',
        entityId: clinic.id,
        action: 'update',
        changes: updateData,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json(updatedClinic);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/clinics/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const success = await storage.deleteClinic(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Clinic not found" });
      }

      await storage.createAuditLog({
        entityType: 'clinic',
        entityId: req.params.id,
        action: 'delete',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== CLINIC REVIEWS ROUTES =====

  // Get reviews for a clinic (public - returns approved reviews only)
  app.get("/api/clinics/:id/reviews", async (req, res) => {
    try {
      const clinicId = req.params.id;
      const clinic = await storage.getClinic(clinicId);
      if (!clinic) {
        return res.status(404).json({ message: "Clinic not found" });
      }
      const reviews = await storage.getClinicReviews(clinicId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching clinic reviews:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create a review for a clinic (authenticated users only)
  app.post("/api/clinics/:id/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const clinicId = req.params.id;
      const userId = (req.user as any).id;

      const clinic = await storage.getClinic(clinicId);
      if (!clinic) {
        return res.status(404).json({ message: "Clinic not found" });
      }

      // Check if user already reviewed this clinic
      const existingReview = await storage.getUserReviewForClinic(userId, clinicId);
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this clinic" });
      }

      // Validate request body
      const reviewSchema = z.object({
        rating: z.number().min(1).max(5),
        reviewText: z.string().optional(),
      });
      const { rating, reviewText } = reviewSchema.parse(req.body);

      const review = await storage.createClinicReview({
        clinicId,
        userId,
        rating,
        reviewText: reviewText || null,
        status: 'approved', // Auto-approve for now, can add moderation later
      });

      // Update clinic rating stats
      await storage.updateClinicRatingStats(clinicId);

      await storage.createAuditLog({
        entityType: 'clinic_review',
        entityId: review.id,
        action: 'create',
        userId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating clinic review:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update own review
  app.patch("/api/reviews/:id", isAuthenticated, async (req: any, res) => {
    try {
      const reviewId = req.params.id;
      const userId = (req.user as any).id;

      const review = await storage.getClinicReview(reviewId);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      // Check ownership
      if (review.userId !== userId) {
        return res.status(403).json({ message: "You can only update your own reviews" });
      }

      const updateSchema = z.object({
        rating: z.number().min(1).max(5).optional(),
        reviewText: z.string().optional().nullable(),
      });
      const updateData = updateSchema.parse(req.body);

      const updatedReview = await storage.updateClinicReview(reviewId, updateData);

      // Update clinic rating stats
      await storage.updateClinicRatingStats(review.clinicId);

      await storage.createAuditLog({
        entityType: 'clinic_review',
        entityId: reviewId,
        action: 'update',
        userId,
        changes: updateData,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json(updatedReview);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating clinic review:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete own review
  app.delete("/api/reviews/:id", isAuthenticated, async (req: any, res) => {
    try {
      const reviewId = req.params.id;
      const userId = (req.user as any).id;

      const review = await storage.getClinicReview(reviewId);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      // Check ownership (admins can also delete)
      const user = await storage.getUser(userId);
      if (review.userId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "You can only delete your own reviews" });
      }

      const clinicId = review.clinicId;
      await storage.deleteClinicReview(reviewId);

      // Update clinic rating stats
      await storage.updateClinicRatingStats(clinicId);

      await storage.createAuditLog({
        entityType: 'clinic_review',
        entityId: reviewId,
        action: 'delete',
        userId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting clinic review:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get current user's review for a clinic
  app.get("/api/clinics/:id/my-review", isAuthenticated, async (req: any, res) => {
    try {
      const clinicId = req.params.id;
      const userId = (req.user as any).id;

      const review = await storage.getUserReviewForClinic(userId, clinicId);
      if (!review) {
        return res.status(404).json({ message: "No review found" });
      }
      res.json(review);
    } catch (error) {
      console.error("Error fetching user review:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Import clinics from CSV
  app.post("/api/clinics/import", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { csvData } = z.object({
        csvData: z.string(),
      }).parse(req.body);

      const lines = csvData.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        return res.status(400).json({ message: "CSV must contain headers and at least one row" });
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const regions = await storage.getAllRegions();
      
      const imported = [];
      const errors = [];

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim());
          const row: any = {};
          headers.forEach((header, idx) => {
            row[header] = values[idx] || '';
          });

          // Map CSV columns to clinic fields
          const districtEn = row['District'] || row['District (English)'] || '';
          const regionId = regions.find(r => 
            r.nameEn?.toLowerCase().includes(districtEn.toLowerCase()) ||
            r.nameZh?.includes(row['District'] || '')
          )?.id;

          if (!regionId) {
            errors.push(`Row ${i}: No matching region found for "${districtEn}"`);
            continue;
          }

          const clinicData = {
            name: row['Name of Vet Clinic (English)'] || row['Clinic Name (English)'] || 'Unnamed',
            nameZh: row['獸醫診所名稱 (Chinese)'] || row['Clinic Name (Chinese)'] || '未命名',
            address: row['Address'] || row['Address (English)'] || '',
            addressZh: row['營業地址'] || row['Address (Chinese)'] || '',
            phone: row['Call Phone Number'] || row['Phone'] || '',
            whatsapp: (row['WhatsApp Number'] || row['WhatsApp'] || '').replace(/[^\d+]/g, '') || undefined,
            email: row['Email'] || undefined,
            regionId: regionId,
            is24Hour: (row['24 hours'] || '').toLowerCase() === 'y' || (row['24 hours'] || '').toLowerCase() === 'yes',
            websiteUrl: row['Website'] || row['Website URL'] || undefined,
          };

          // Check if clinic with same name and region exists
          const existing = (await storage.getAllClinics()).find(c => 
            c.name?.toLowerCase() === clinicData.name.toLowerCase() && 
            c.regionId === regionId
          );

          if (existing) {
            await storage.updateClinic(existing.id, clinicData);
            imported.push({ action: 'updated', name: clinicData.name, id: existing.id });
          } else {
            const created = await storage.createClinic(clinicData);
            imported.push({ action: 'created', name: clinicData.name, id: created.id });
          }
        } catch (error) {
          errors.push(`Row ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      await storage.createAuditLog({
        entityType: 'clinic',
        entityId: 'bulk-import',
        action: 'import',
        changes: { imported: imported.length, errors: errors.length },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json({ imported, errors, summary: { createdOrUpdated: imported.length, errors: errors.length } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Staff management endpoints - DEPRECATED
  app.get("/api/clinics/:id/staff", isAuthenticated, isAdmin, async (req, res) => {
    console.warn('[DEPRECATED] GET /api/clinics/:id/staff called - update to use hospital staff management');
    res.status(410).json({ 
      message: "This endpoint is deprecated. Clinic staff management should be updated to use hospitals.",
      deprecated: true
    });
  });

  app.post("/api/clinics/:id/staff", isAuthenticated, isAdmin, async (req, res) => {
    console.warn('[DEPRECATED] POST /api/clinics/:id/staff called');
    res.status(410).json({ 
      message: "This endpoint is deprecated. Clinic staff management should be updated to use hospitals.",
      deprecated: true
    });
  });

  app.delete("/api/clinics/:id/staff/:userId", isAuthenticated, isAdmin, async (req, res) => {
    console.warn('[DEPRECATED] DELETE /api/clinics/:id/staff/:userId called');
    res.status(410).json({ 
      message: "This endpoint is deprecated. Clinic staff management should be updated to use hospitals.",
      deprecated: true
    });
  });

  // Geocode address to GPS coordinates
  app.post("/api/geocode", async (req, res) => {
    try {
      const { address } = z.object({
        address: z.string().min(1, "Address is required"),
      }).parse(req.body);

      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "Google Maps API key not configured" });
      }

      const encodedAddress = encodeURIComponent(address);
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

      const response = await fetch(geocodeUrl);
      const data = await response.json();

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        res.json({
          latitude: location.lat.toString(),
          longitude: location.lng.toString(),
          formattedAddress: data.results[0].formatted_address,
        });
      } else if (data.status === "ZERO_RESULTS") {
        res.status(404).json({ message: "Address not found. Please check the address and try again." });
      } else if (data.status === "OVER_QUERY_LIMIT") {
        res.status(429).json({ message: "Geocoding API quota exceeded. Please try again later." });
      } else {
        res.status(400).json({ message: `Geocoding failed: ${data.status}` });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Geocoding error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== HOSPITAL ROUTES =====
  
  // Get all hospitals (with minimal ping state data for availability display)
  app.get("/api/hospitals", async (req, res) => {
    try {
      const hospitals = await storage.getAllHospitals();
      
      // Fetch ping states and enrich hospitals with minimal safe data
      const pingStates = await storage.getAllHospitalPingStates();
      const pingStateMap = new Map(pingStates.map(ps => [ps.hospitalId, ps]));
      
      const hospitalsWithPingState = hospitals.map(h => {
        const pingState = pingStateMap.get(h.id);
        return {
          ...h,
          // Only expose last reply time for recency display - no internal admin details
          lastInboundReplyAt: pingState?.lastInboundReplyAt || null,
          replyStatus: pingState?.pingStatus === 'no_reply' ? 'unresponsive' : 'active',
        };
      });
      
      res.json(hospitalsWithPingState);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get hospitals by region
  app.get("/api/hospitals/region/:regionId", async (req, res) => {
    try {
      const hospitals = await storage.getHospitalsByRegion(req.params.regionId);
      res.json(hospitals);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get hospital by slug
  app.get("/api/hospitals/slug/:slug", async (req, res) => {
    try {
      const hospital = await storage.getHospitalBySlug(req.params.slug);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      res.json(hospital);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get nearby hospitals using PostGIS (efficient server-side geo-query)
  // Supports last_reply_window filter: 1h, 24h, 7d, none
  app.get("/api/hospitals/nearby", async (req, res) => {
    try {
      const { latitude, longitude, radius, last_reply_window } = z.object({
        latitude: z.string().transform(Number),
        longitude: z.string().transform(Number),
        radius: z.string().transform(Number).default("10000"),
        last_reply_window: z.enum(['1h', '24h', '7d', 'none', 'all']).optional(),
      }).parse(req.query);

      let hospitals = await storage.getNearbyHospitals(latitude, longitude, radius);
      
      // Fetch ping states for all hospitals
      const pingStates = await storage.getAllHospitalPingStates();
      const pingStateMap = new Map(pingStates.map(ps => [ps.hospitalId, ps]));
      
      // Enrich hospitals with MINIMAL ping data (only what's safe for public display)
      const hospitalsWithPingState = hospitals.map(h => {
        const pingState = pingStateMap.get(h.id);
        return {
          ...h,
          lastInboundReplyAt: pingState?.lastInboundReplyAt || null,
          replyStatus: pingState?.pingStatus === 'no_reply' ? 'unresponsive' : 'active',
        };
      });
      
      // Apply last reply filter if specified
      if (last_reply_window && last_reply_window !== 'all') {
        const now = Date.now();
        const filterHospitals = hospitalsWithPingState.filter(h => {
          const lastReply = h.lastInboundReplyAt;
          
          if (last_reply_window === 'none') {
            return !lastReply;
          }
          
          if (!lastReply) return false;
          
          const replyTime = new Date(lastReply).getTime();
          const ageMs = now - replyTime;
          
          switch (last_reply_window) {
            case '1h': return ageMs <= 60 * 60 * 1000;
            case '24h': return ageMs <= 24 * 60 * 60 * 1000;
            case '7d': return ageMs <= 7 * 24 * 60 * 60 * 1000;
            default: return true;
          }
        });
        
        res.json(filterHospitals);
      } else {
        res.json(hospitalsWithPingState);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get hospital by ID (must come AFTER /nearby to avoid matching "nearby" as ID)
  app.get("/api/hospitals/:id", async (req, res) => {
    try {
      const hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      res.json(hospital);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get hospital change logs (admin only)
  app.get("/api/hospitals/:id/change-logs", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await storage.getHospitalChangeLogs(req.params.id, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching hospital change logs:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get recent hospital change logs across all hospitals (admin only)
  app.get("/api/admin/hospital-change-logs", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getRecentHospitalChangeLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching recent hospital change logs:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create hospital (admin only)
  app.post("/api/hospitals", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { insertHospitalSchema } = await import("@shared/schema");
      const hospitalData = insertHospitalSchema.parse(req.body);
      const hospital = await storage.createHospital(hospitalData);
      
      await storage.createAuditLog({
        entityType: 'hospital',
        entityId: hospital.id,
        action: 'create',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json(hospital);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update hospital (admin only)
  app.patch("/api/hospitals/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { insertHospitalSchema } = await import("@shared/schema");
      const hospital = await storage.getHospital(req.params.id);
      
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }

      const updateData = insertHospitalSchema.partial().parse(req.body);
      const updatedHospital = await storage.updateHospital(req.params.id, updateData);

      await storage.createAuditLog({
        entityType: 'hospital',
        entityId: hospital.id,
        action: 'update',
        changes: updateData,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json(updatedHospital);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete hospital (admin only)
  app.delete("/api/hospitals/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const success = await storage.deleteHospital(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Hospital not found" });
      }

      await storage.createAuditLog({
        entityType: 'hospital',
        entityId: req.params.id,
        action: 'delete',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get consult fees for a hospital
  app.get("/api/hospitals/:hospitalId/fees", async (req, res) => {
    try {
      const fees = await storage.getConsultFeesByHospitalId(req.params.hospitalId);
      res.json(fees);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create consult fee (admin only)
  app.post("/api/hospitals/:hospitalId/fees", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { insertHospitalConsultFeeSchema } = await import("@shared/schema");
      const feeData = insertHospitalConsultFeeSchema.parse({
        ...req.body,
        hospitalId: req.params.hospitalId
      });
      const fee = await storage.createConsultFee(feeData);
      res.json(fee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update consult fee (admin only)
  app.patch("/api/hospitals/fees/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { insertHospitalConsultFeeSchema } = await import("@shared/schema");
      const updateData = insertHospitalConsultFeeSchema.partial().parse(req.body);
      const updatedFee = await storage.updateConsultFee(req.params.id, updateData);
      
      if (!updatedFee) {
        return res.status(404).json({ message: "Consult fee not found" });
      }
      
      res.json(updatedFee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete consult fee (admin only)
  app.delete("/api/hospitals/fees/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const success = await storage.deleteConsultFee(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Consult fee not found" });
      }
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get hospital updates (for review/moderation)
  app.get("/api/hospitals/:hospitalId/updates", isAuthenticated, async (req, res) => {
    try {
      const updates = await storage.getHospitalUpdatesByHospitalId(req.params.hospitalId);
      res.json(updates);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Submit hospital update/correction (authenticated users)
  app.post("/api/hospitals/:hospitalId/report", isAuthenticated, async (req, res) => {
    try {
      const sessionUser = req.user as any;
      const userId = sessionUser.id;
      
      const { insertHospitalUpdateSchema } = await import("@shared/schema");
      const updateData = insertHospitalUpdateSchema.parse({
        ...req.body,
        hospitalId: req.params.hospitalId,
        submittedById: userId
      });
      
      const update = await storage.createHospitalUpdate(updateData);
      res.json(update);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update hospital update status (admin only - for review)
  app.patch("/api/hospitals/updates/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const sessionUser = req.user as any;
      const userId = sessionUser.id;
      
      const { insertHospitalUpdateSchema } = await import("@shared/schema");
      const updateData = insertHospitalUpdateSchema.partial().extend({
        reviewedById: z.string().optional(),
        reviewedAt: z.date().optional(),
      }).parse({
        ...req.body,
        reviewedById: userId,
        reviewedAt: new Date()
      });
      
      const updatedUpdate = await storage.updateHospitalUpdate(req.params.id, updateData);
      
      if (!updatedUpdate) {
        return res.status(404).json({ message: "Hospital update not found" });
      }
      
      res.json(updatedUpdate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get emergency requests for hospital
  app.get("/api/hospitals/:hospitalId/emergency-requests", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const hospitalId = req.params.hospitalId;

      // Check if user is admin (for now, until we have hospital staff roles)
      if (user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized - Admin only" });
      }

      // Note: Using getEmergencyRequestsByClinicId which now uses hospitalId internally
      const requests = await storage.getEmergencyRequestsByClinicId(hospitalId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== HOSPITAL PING STATE ROUTES (Admin) =====
  
  // Get ping state for a specific hospital
  app.get("/api/hospitals/:hospitalId/ping-state", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const pingState = await storage.getHospitalPingState(req.params.hospitalId);
      res.json(pingState || { hospitalId: req.params.hospitalId, pingEnabled: true, pingStatus: 'active' });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all hospital ping states (admin dashboard)
  app.get("/api/admin/hospital-ping-states", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const pingStates = await storage.getAllHospitalPingStates();
      res.json(pingStates);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update hospital ping settings (toggle ping_enabled)
  app.patch("/api/hospitals/:hospitalId/ping-settings", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { pingEnabled } = z.object({
        pingEnabled: z.boolean(),
      }).parse(req.body);

      const hospitalId = req.params.hospitalId;
      const hospital = await storage.getHospital(hospitalId);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }

      const existingState = await storage.getHospitalPingState(hospitalId);
      const updatedState = await storage.upsertHospitalPingState({
        hospitalId,
        pingEnabled,
        pingStatus: existingState?.pingStatus || 'active',
        lastPingSentAt: existingState?.lastPingSentAt || null,
        lastPingMessageId: existingState?.lastPingMessageId || null,
        lastInboundReplyAt: existingState?.lastInboundReplyAt || null,
        lastReplyLatencySeconds: existingState?.lastReplyLatencySeconds || null,
        noReplySince: existingState?.noReplySince || null,
      });

      await storage.createAuditLog({
        entityType: 'hospital_ping_state',
        entityId: hospitalId,
        action: 'update_ping_settings',
        userId: req.user.id,
        changes: { pingEnabled },
        ipAddress: req.ip,
      });

      res.json(updatedState);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reset hospital ping status from no_reply back to active
  app.post("/api/hospitals/:hospitalId/reset-ping-status", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const hospitalId = req.params.hospitalId;
      const hospital = await storage.getHospital(hospitalId);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }

      const existingState = await storage.getHospitalPingState(hospitalId);
      if (!existingState) {
        return res.status(404).json({ message: "No ping state found for hospital" });
      }

      const updatedState = await storage.updateHospitalPingState(hospitalId, {
        pingStatus: 'active',
        noReplySince: null,
      });

      await storage.createHospitalPingLog({
        hospitalId,
        direction: 'outbound',
        providerMessageId: null,
        eventType: 'ping_sent',
        sentAt: null,
        receivedAt: null,
        payload: { action: 'manual_reset', resetBy: req.user.id },
      });

      await storage.createAuditLog({
        entityType: 'hospital_ping_state',
        entityId: hospitalId,
        action: 'reset_ping_status',
        userId: req.user.id,
        changes: { previousStatus: existingState.pingStatus, newStatus: 'active' },
        ipAddress: req.ip,
      });

      res.json(updatedState);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get ping logs for a hospital (admin)
  app.get("/api/hospitals/:hospitalId/ping-logs", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await storage.getHospitalPingLogs(req.params.hospitalId, limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== EMERGENCY REQUEST ROUTES =====

  // Create emergency request
  app.post("/api/emergency-requests", async (req: any, res) => {
    try {
      // Extend schema to handle petAge as number or null
      const emergencyRequestSchemaWithCoercion = insertEmergencyRequestSchema.extend({
        petAge: z.union([z.number(), z.null()]).optional(),
      });
      
      // Get logged-in user's ID if authenticated
      // Check both req.user (passport) and req.session.passport.user (session)
      let loggedInUserId = null;
      if (req.user) {
        loggedInUserId = (req.user as any).id;
      } else if (req.session?.passport?.user) {
        // Fallback: get user ID directly from session
        loggedInUserId = req.session.passport.user;
      }
      console.log('[Emergency Request] req.user:', req.user ? 'exists' : 'null');
      console.log('[Emergency Request] session.passport.user:', req.session?.passport?.user);
      console.log('[Emergency Request] loggedInUserId:', loggedInUserId);
      
      // Parse petAge as integer if provided
      let parsedPetAge: number | null = null;
      if (req.body.petAge != null) {
        const age = parseInt(req.body.petAge, 10);
        parsedPetAge = isNaN(age) ? null : age;
      }
      
      // Validate and parse request body with proper schema
      const validatedData = emergencyRequestSchemaWithCoercion.parse({
        userId: req.body.userId ?? loggedInUserId ?? null,
        petId: req.body.petId ?? null,
        symptom: req.body.symptom,
        petSpecies: req.body.petSpecies ?? null,
        petBreed: req.body.petBreed ?? null,
        petAge: parsedPetAge,
        locationLatitude: req.body.locationLatitude ? String(req.body.locationLatitude) : null,
        locationLongitude: req.body.locationLongitude ? String(req.body.locationLongitude) : null,
        manualLocation: req.body.manualLocation ?? null,
        contactName: req.body.contactName,
        contactPhone: req.body.contactPhone,
        status: req.body.status ?? 'pending',
        regionId: req.body.regionId ?? null,
        voiceTranscript: req.body.voiceTranscript ?? null,
        aiAnalyzedSymptoms: req.body.aiAnalyzedSymptoms ?? null,
        isVoiceRecording: req.body.isVoiceRecording ?? false,
      });
      
      const emergencyRequest = await storage.createEmergencyRequest(validatedData);
      
      await storage.createAuditLog({
        entityType: 'emergency_request',
        entityId: emergencyRequest.id,
        action: 'create',
        userId: emergencyRequest.userId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.status(201).json(emergencyRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating emergency request:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all emergency requests (admin only)
  app.get("/api/emergency-requests", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const requests = await storage.getAllEmergencyRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching emergency requests:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get emergency request by ID
  app.get("/api/emergency-requests/:id", async (req, res) => {
    const request = await storage.getEmergencyRequest(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Emergency request not found" });
    }
    res.json(request);
  });

  // Get hospital WhatsApp responses for a specific emergency (public - for pet owner tracking)
  app.get("/api/emergency-requests/:id/hospital-responses", async (req, res) => {
    try {
      const responses = await storage.getHospitalEmergencyResponsesByEmergencyId(req.params.id);
      // Enrich with hospital name
      const enriched = await Promise.all(responses.map(async (r) => {
        const hospital = await storage.getHospital(r.hospitalId);
        return {
          ...r,
          hospitalNameEn: hospital?.nameEn || 'Unknown Hospital',
          hospitalNameZh: hospital?.nameZh || '',
          hospitalPhone: hospital?.phone || '',
          hospitalWhatsapp: hospital?.whatsapp || '',
        };
      }));
      res.json(enriched);
    } catch (error) {
      console.error("Error fetching hospital responses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get emergency request profile (public shareable page for hospitals)
  app.get("/api/emergency-requests/:id/profile", async (req, res) => {
    try {
      const request = await storage.getEmergencyRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ message: "Emergency request not found" });
      }

      // Build the profile response with pet and medical records
      const profileData: any = {
        id: request.id,
        symptom: request.symptom,
        manualLocation: request.manualLocation,
        contactName: request.contactName,
        contactPhone: request.contactPhone,
        petSpecies: request.petSpecies,
        petBreed: request.petBreed,
        petAge: request.petAge,
        status: request.status,
        createdAt: request.createdAt,
        medicalSharingEnabled: false,
      };

      // If there's a pet associated, fetch pet details
      if (request.petId) {
        const pet = await storage.getPet(request.petId);
        if (pet) {
          profileData.pet = {
            id: pet.id,
            name: pet.name,
            species: pet.species,
            breed: pet.breed,
            age: pet.age,
            weight: pet.weight,
            medicalNotes: pet.medicalNotes,
            medicalHistory: pet.medicalHistory,
            color: pet.color,
            microchipId: pet.microchipId,
          };

          // Check if user has consented to emergency sharing
          const consents = await storage.getMedicalSharingConsentsByPetId(request.petId);
          const emergencyConsent = consents.find(c => c.consentType === 'emergency_broadcast' && c.enabled);
          
          if (emergencyConsent) {
            profileData.medicalSharingEnabled = true;
            // Fetch medical records
            const records = await storage.getMedicalRecordsByPetId(request.petId);
            if (records && records.length > 0) {
              profileData.medicalRecords = records.map(r => ({
                id: r.id,
                title: r.title,
                documentType: r.documentType,
                description: r.description,
                fileUrl: r.filePath, // filePath contains the object storage URL
                uploadedAt: r.uploadedAt,
              }));
            }
          }
        }
      }

      res.json(profileData);
    } catch (error) {
      console.error("Error fetching emergency profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get emergency requests for user
  app.get("/api/users/:userId/emergency-requests", isAuthenticated, async (req: any, res) => {
    try {
      const requestingUserId = (req.user as any).id;
      const targetUserId = req.params.userId;
      
      // Users can only view their own emergency requests unless they're admin
      const requestingUser = await storage.getUser(requestingUserId);
      if (!requestingUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (requestingUserId !== targetUserId && requestingUser.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden - You can only view your own emergency requests" });
      }
      
      const requests = await storage.getEmergencyRequestsByUserId(targetUserId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get emergency requests for clinic
  // Emergency requests by clinic - DEPRECATED
  app.get("/api/clinics/:clinicId/emergency-requests", isAuthenticated, async (req, res) => {
    console.warn('[DEPRECATED] GET /api/clinics/:clinicId/emergency-requests called - use /api/hospitals/:hospitalId/emergency-requests instead');
    res.status(410).json({ 
      message: "This endpoint is deprecated. Please use /api/hospitals/:hospitalId/emergency-requests instead.",
      deprecated: true
    });
  });

  // Update emergency request (allows both authenticated users and anonymous for emergency flexibility)
  app.patch("/api/emergency-requests/:id", async (req: any, res) => {
    try {
      const request = await storage.getEmergencyRequest(req.params.id);
      
      if (!request) {
        return res.status(404).json({ message: "Emergency request not found" });
      }
      
      // Authorization logic: Allow if user is authenticated and owns the request, is admin, or if request is anonymous
      if (req.user) {
        // User is authenticated - verify ownership, admin role, or anonymous request
        const requestingUserId = (req.user as any).id;
        const requestingUser = await storage.getUser(requestingUserId);
        
        if (!requestingUser) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        
        // Allow if: user owns the request, is admin, OR request was created anonymously
        const isOwner = request.userId === requestingUserId;
        const isAdmin = requestingUser.role === 'admin';
        const isAnonymousRequest = !request.userId;
        
        if (!isOwner && !isAdmin && !isAnonymousRequest) {
          return res.status(403).json({ message: "Forbidden - You can only update your own emergency requests" });
        }
      } else {
        // Anonymous user - only allow if request was created anonymously
        if (request.userId) {
          return res.status(403).json({ message: "Forbidden - This emergency belongs to a registered user" });
        }
      }
      
      const updateData = insertEmergencyRequestSchema.partial().parse(req.body);
      const updatedRequest = await storage.updateEmergencyRequest(req.params.id, updateData);

      await storage.createAuditLog({
        entityType: 'emergency_request',
        entityId: request.id,
        action: 'update',
        userId: req.user ? (req.user as any).id : null,
        changes: updateData,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json(updatedRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Broadcast emergency to clinics (allows anonymous users for emergency use)
  app.post("/api/emergency-requests/:id/broadcast", broadcastLimiter, async (req: any, res) => {
    try {
      const { clinicIds, message } = z.object({
        clinicIds: z.array(z.string()),
        message: z.string(),
      }).parse(req.body);

      const emergencyRequest = await storage.getEmergencyRequest(req.params.id);
      if (!emergencyRequest) {
        return res.status(404).json({ message: "Emergency request not found" });
      }
      
      // Check authorization: allow if authenticated user owns the request, is admin, or if anonymous emergency
      // Anonymous emergencies (userId: null) can be broadcast by anyone for emergency situations
      if (emergencyRequest.userId) {
        // This emergency belongs to a registered user - verify ownership or admin role
        if (req.user) {
          const requestingUserId = (req.user as any).id;
          const requestingUser = await storage.getUser(requestingUserId);
          
          if (!requestingUser) {
            return res.status(401).json({ message: "Unauthorized" });
          }
          
          if (emergencyRequest.userId !== requestingUserId && requestingUser.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden - You can only broadcast your own emergency requests" });
          }
        } else {
          // Anonymous user trying to broadcast a registered user's emergency
          return res.status(403).json({ message: "Forbidden - This emergency belongs to a registered user" });
        }
      }
      // If emergencyRequest.userId is null (anonymous), allow anyone to broadcast

      const messages = await messagingService.broadcastEmergency(
        req.params.id,
        clinicIds,
        message
      );

      res.status(201).json({ messages, count: messages.length });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== DEEPSEEK AI VOICE ANALYSIS ROUTE =====
  
  // Analyze voice transcript with DeepSeek AI
  // Custom rate limiter for AI analysis with fallback notification
  const aiAnalysisLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Stricter limit for AI analysis
    message: JSON.stringify({ 
      message: "Too many AI analysis requests. Please try again later.", 
      fallbackAvailable: true 
    }),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: any, res: any) => {
      res.status(429).json({
        message: "Too many AI analysis requests. Please try again later.",
        fallbackAvailable: true
      });
    }
  });

  app.post("/api/voice/analyze", aiAnalysisLimiter, async (req, res) => {
    try {
      // Validate input with size limits (max 10,000 characters)
      const { transcript, language } = z.object({
        transcript: z.string().min(1, "Transcript cannot be empty").max(10000, "Transcript too long"),
        language: z.enum(['en', 'zh', 'zh-HK', 'zh-CN']).optional().default('en'),
      }).parse(req.body);

      // Check if DeepSeek is available
      if (!deepseekService.isAvailable()) {
        return res.status(503).json({ 
          message: "DeepSeek AI service not configured. Please set DEEPSEEK_API_KEY environment variable.",
          fallbackAvailable: true 
        });
      }

      // Set timeout for AI analysis (10 seconds)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Analysis timeout')), 10000)
      );

      // Race between analysis and timeout
      const analysis = await Promise.race([
        deepseekService.analyzeVoiceTranscript(transcript, language),
        timeoutPromise
      ]) as any;
      
      res.json({
        success: true,
        analysis,
        formattedMessage: deepseekService.formatForBroadcast(analysis, transcript)
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors,
          fallbackAvailable: true
        });
      }
      
      // Handle timeout specifically
      if (error instanceof Error && error.message === 'Analysis timeout') {
        console.error("DeepSeek analysis timeout");
        return res.status(504).json({ 
          message: "AI analysis timeout. Please try again.", 
          error: "Timeout",
          fallbackAvailable: true
        });
      }
      
      console.error("DeepSeek analysis error:", error);
      res.status(500).json({ 
        message: "AI analysis failed", 
        error: error instanceof Error ? error.message : "Unknown error",
        fallbackAvailable: true
      });
    }
  });

  // ===== MESSAGE ROUTES =====
  
  // Create message (admin only - used by broadcast service)
  app.post("/api/messages", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get messages for emergency request
  app.get("/api/emergency-requests/:id/messages", async (req, res) => {
    const messages = await storage.getMessagesByEmergencyRequest(req.params.id);
    res.json(messages);
  });

  // Update message status
  app.patch("/api/messages/:id", async (req, res) => {
    try {
      const updateData = insertMessageSchema.partial().parse(req.body);
      const message = await storage.updateMessage(req.params.id, updateData);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get queued messages (for processing)
  app.get("/api/messages/queued", async (req, res) => {
    const messages = await storage.getQueuedMessages();
    res.json(messages);
  });

  // ===== ADMIN MESSAGE MANAGEMENT ROUTES =====
  
  // Get all messages with status (admin only) - for WhatsApp dashboard
  app.get("/api/admin/messages", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
      const allMessages = await storage.getAllMessages(limit);
      
      // Enrich messages with hospital names
      const messagesWithDetails = await Promise.all(
        allMessages.map(async (msg) => {
          const hospital = msg.hospitalId ? await storage.getHospital(msg.hospitalId) : null;
          const emergencyRequest = msg.emergencyRequestId ? await storage.getEmergencyRequest(msg.emergencyRequestId) : null;
          return {
            ...msg,
            hospitalName: hospital?.nameEn || hospital?.nameZh || 'Unknown Hospital',
            emergencyRequestStatus: emergencyRequest?.status || 'unknown',
            petInfo: emergencyRequest?.pet ? {
              name: emergencyRequest.pet.name,
              species: emergencyRequest.pet.species,
              breed: emergencyRequest.pet.breed
            } : null
          };
        })
      );
      
      res.json(messagesWithDetails);
    } catch (error) {
      console.error('Error fetching all messages:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Get message statistics (admin only)
  app.get("/api/admin/messages/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const allMessages = await storage.getAllMessages(1000);
      
      const stats = {
        total: allMessages.length,
        queued: allMessages.filter(m => m.status === 'queued').length,
        sent: allMessages.filter(m => m.status === 'sent').length,
        delivered: allMessages.filter(m => m.status === 'delivered').length,
        read: allMessages.filter(m => m.readAt !== null).length,
        failed: allMessages.filter(m => m.status === 'failed').length,
        byType: {
          whatsapp: allMessages.filter(m => m.messageType === 'whatsapp').length,
          email: allMessages.filter(m => m.messageType === 'email').length,
          line: allMessages.filter(m => m.messageType === 'line').length
        }
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching message stats:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Retry a failed message (admin only)
  app.post("/api/admin/messages/:id/retry", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const messageId = req.params.id;
      const message = await storage.getMessage(messageId);
      
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      
      // Reset message for retry
      await storage.updateMessage(messageId, {
        status: 'queued',
        retryCount: 0,
        failedAt: null,
        errorMessage: null
      });
      
      // Process the message immediately
      await messagingService.processMessage(messageId);
      
      // Get updated message
      const updatedMessage = await storage.getMessage(messageId);
      
      // Log the retry action
      await storage.createAuditLog({
        entityType: 'message',
        entityId: messageId,
        action: 'retry',
        userId: (req.user as any).id,
        changes: { previousStatus: message.status },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json(updatedMessage);
    } catch (error) {
      console.error('Error retrying message:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Resend to a specific hospital (admin only)
  app.post("/api/admin/messages/resend", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { emergencyRequestId, hospitalId } = req.body;
      
      if (!emergencyRequestId || !hospitalId) {
        return res.status(400).json({ message: 'emergencyRequestId and hospitalId are required' });
      }
      
      const hospital = await storage.getHospital(hospitalId);
      if (!hospital) {
        return res.status(404).json({ message: 'Hospital not found' });
      }
      
      const emergencyRequest = await storage.getEmergencyRequest(emergencyRequestId);
      if (!emergencyRequest) {
        return res.status(404).json({ message: 'Emergency request not found' });
      }
      
      const hospitalName = hospital.nameEn || hospital.nameZh || 'Unknown Hospital';
      
      // Build a resend message
      const resendMessage = `[RESEND] Emergency alert for ${emergencyRequest.petSpecies || 'pet'} - ${emergencyRequest.symptom || 'Emergency'}`;
      
      // Broadcast to this specific hospital using the broadcastEmergency with correct parameters
      const result = await messagingService.broadcastEmergency(emergencyRequestId, [hospitalId], resendMessage);
      
      // Log the resend action
      await storage.createAuditLog({
        entityType: 'message',
        entityId: emergencyRequestId,
        action: 'resend',
        userId: (req.user as any).id,
        changes: { hospitalId, hospitalName },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json({ 
        success: true, 
        message: `Message resent to ${hospitalName}`,
        result 
      });
    } catch (error) {
      console.error('Error resending message:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // ===== FEATURE FLAG ROUTES =====
  
  // Get all feature flags (admin only)
  app.get("/api/feature-flags", isAuthenticated, isAdmin, async (req, res) => {
    const flags = await storage.getAllFeatureFlags();
    res.json(flags);
  });

  // Get feature flag by key (admin only)
  app.get("/api/feature-flags/:key", isAuthenticated, isAdmin, async (req, res) => {
    const flag = await storage.getFeatureFlag(req.params.key);
    if (!flag) {
      return res.status(404).json({ message: "Feature flag not found" });
    }
    res.json(flag);
  });

  // Create feature flag (admin only)
  app.post("/api/feature-flags", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const flagData = insertFeatureFlagSchema.parse(req.body);
      const flag = await storage.createFeatureFlag(flagData);
      
      await storage.createAuditLog({
        entityType: 'feature_flag',
        entityId: flag.id,
        action: 'create',
        userId: (req.user as any).id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json(flag);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update feature flag (admin only)
  app.patch("/api/feature-flags/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const updateData = insertFeatureFlagSchema.partial().parse(req.body);
      const flag = await storage.updateFeatureFlag(req.params.id, updateData);
      
      if (!flag) {
        return res.status(404).json({ message: "Feature flag not found" });
      }

      await storage.createAuditLog({
        entityType: 'feature_flag',
        entityId: flag.id,
        action: 'update',
        userId: (req.user as any).id,
        changes: updateData,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json(flag);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== TRANSLATION ROUTES =====
  
  // Get translations by language
  app.get("/api/translations/:language", async (req, res) => {
    try {
      const translations = await storage.getTranslationsByLanguage(req.params.language);
      res.json(translations);
    } catch (error) {
      res.status(500).json({ message: "Translation service unavailable", translations: [] });
    }
  });

  // Create/update translation (admin only)
  app.post("/api/translations", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const translationData = insertTranslationSchema.parse(req.body);
      
      // Check if translation already exists
      const existing = await storage.getTranslation(translationData.key, 'en');
      
      let translation;
      if (existing) {
        translation = await storage.updateTranslation(existing.id, translationData);
      } else {
        translation = await storage.createTranslation(translationData);
      }
      
      res.json(translation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== PRIVACY CONSENT ROUTES =====
  
  // Get privacy consents for user
  app.get("/api/users/:userId/consents", isAuthenticated, async (req: any, res) => {
    try {
      const requestingUserId = (req.user as any).id;
      const targetUserId = req.params.userId;
      
      // Users can only view their own consents unless they're admin
      const requestingUser = await storage.getUser(requestingUserId);
      if (!requestingUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (requestingUserId !== targetUserId && requestingUser.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden - You can only view your own consents" });
      }
      
      const consents = await storage.getPrivacyConsents(targetUserId);
      res.json(consents);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create privacy consent
  app.post("/api/privacy-consents", isAuthenticated, async (req: any, res) => {
    try {
      const requestingUserId = (req.user as any).id;
      const consentData = insertPrivacyConsentSchema.parse(req.body);
      
      // Users can only create consents for themselves
      if (consentData.userId !== requestingUserId) {
        return res.status(403).json({ message: "Forbidden - You can only create consents for yourself" });
      }
      
      const consent = await storage.createPrivacyConsent(consentData);
      
      await storage.createAuditLog({
        entityType: 'privacy_consent',
        entityId: consent.id,
        action: 'create',
        userId: requestingUserId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json(consent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== AUDIT LOG ROUTES =====
  
  // Get audit logs for entity (admin only)
  app.get("/api/audit-logs/:entityType/:entityId", isAuthenticated, isAdmin, async (req, res) => {
    const logs = await storage.getAuditLogsByEntity(req.params.entityType, req.params.entityId);
    res.json(logs);
  });

  // ===== DIAGNOSTIC ROUTES (Admin Only) =====
  
  // Test WhatsApp connection and credentials
  app.post("/api/admin/test-whatsapp", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { phoneNumber, message } = z.object({
        phoneNumber: z.string().min(8, "Phone number required"),
        message: z.string().optional().default("Test message from PetSOS")
      }).parse(req.body);

      const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
      const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
      const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v21.0';

      // Debug logging
      console.log('[WhatsApp Test] DEBUG - Checking credentials...');
      console.log('[WhatsApp Test] Has Access Token:', !!WHATSAPP_ACCESS_TOKEN);
      console.log('[WhatsApp Test] Has Phone Number ID:', !!WHATSAPP_PHONE_NUMBER_ID);
      console.log('[WhatsApp Test] Token length:', WHATSAPP_ACCESS_TOKEN?.length || 0);
      console.log('[WhatsApp Test] Phone ID:', WHATSAPP_PHONE_NUMBER_ID || 'NOT SET');
      console.log('[WhatsApp Test] All env keys with WHATSAPP:', Object.keys(process.env).filter(k => k.includes('WHATSAPP')));

      // Check if credentials exist
      if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
        console.error('[WhatsApp Test] ERROR - Credentials missing!');
        return res.status(400).json({
          success: false,
          error: "WhatsApp credentials not configured",
          details: {
            hasAccessToken: !!WHATSAPP_ACCESS_TOKEN,
            hasPhoneNumberId: !!WHATSAPP_PHONE_NUMBER_ID,
            apiUrl: WHATSAPP_API_URL,
            tokenLength: WHATSAPP_ACCESS_TOKEN?.length || 0,
            phoneNumberId: WHATSAPP_PHONE_NUMBER_ID || null
          }
        });
      }

      // Clean phone number
      const cleanedNumber = phoneNumber.replace(/[^0-9]/g, '');
      
      // Test API connection
      const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: cleanedNumber,
        type: 'text',
        text: { body: message },
      };

      console.log('[WhatsApp Test] Sending to:', url);
      console.log('[WhatsApp Test] Payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      
      console.log('[WhatsApp Test] Response status:', response.status);
      console.log('[WhatsApp Test] Response data:', JSON.stringify(responseData, null, 2));

      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          error: "WhatsApp API returned an error",
          statusCode: response.status,
          details: responseData,
          debugInfo: {
            url,
            phoneNumber: cleanedNumber,
            hasToken: !!WHATSAPP_ACCESS_TOKEN,
            phoneNumberId: WHATSAPP_PHONE_NUMBER_ID
          }
        });
      }

      res.json({
        success: true,
        message: "WhatsApp test message sent successfully!",
        response: responseData,
        debugInfo: {
          phoneNumber: cleanedNumber,
          messageId: responseData.messages?.[0]?.id
        }
      });

    } catch (error) {
      console.error('[WhatsApp Test] Error:', error);
      res.status(500).json({
        success: false,
        error: "Test failed with exception",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // WhatsApp setup status & template checker (admin only)
  app.get("/api/admin/whatsapp-status", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
      const apiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v21.0';
      const webhookVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

      const credentialStatus = {
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken?.length || 0,
        hasPhoneNumberId: !!phoneNumberId,
        phoneNumberId: phoneNumberId || null,
        hasBusinessAccountId: !!businessAccountId,
        businessAccountId: businessAccountId || null,
        apiUrl,
        hasWebhookToken: !!webhookVerifyToken,
      };

      // If no token/phone ID, return early
      if (!accessToken || !phoneNumberId) {
        return res.json({ credentialStatus, phoneInfo: null, templates: [], error: 'Missing credentials' });
      }

      // Fetch phone number details from Meta
      let phoneInfo = null;
      let tokenError: string | null = null;
      try {
        const phoneRes = await fetch(`${apiUrl}/${phoneNumberId}?fields=display_phone_number,verified_name,quality_rating,platform_type,status`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        const phoneData = await phoneRes.json();
        if (phoneRes.ok) {
          phoneInfo = phoneData;
        } else {
          // Surface the exact Meta error (e.g. token expired)
          tokenError = phoneData?.error?.message || `HTTP ${phoneRes.status}`;
          const isExpired = phoneData?.error?.code === 190;
          if (isExpired) tokenError = `TOKEN_EXPIRED: ${tokenError}`;
        }
      } catch (e) { /* network error */ }

      // Fetch approved templates from Meta
      let templates: any[] = [];
      let templateError: string | null = null;
      if (businessAccountId && !tokenError) {
        try {
          const tplRes = await fetch(`${apiUrl}/${businessAccountId}/message_templates?limit=50&fields=name,status,language,components`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          });
          if (tplRes.ok) {
            const tplData = await tplRes.json();
            templates = tplData.data || [];
          } else {
            const errData = await tplRes.json();
            templateError = errData?.error?.message || `HTTP ${tplRes.status}`;
          }
        } catch (e) { /* ignore */ }
      }

      res.json({ credentialStatus, phoneInfo, templates, tokenError, templateError });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error', details: String(error) });
    }
  });

  // Send test template message (admin only)
  app.post("/api/admin/test-whatsapp-template", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { phoneNumber, templateName, emergencyRequestId } = z.object({
        phoneNumber: z.string().min(8),
        templateName: z.string().optional(),
        emergencyRequestId: z.string().optional(),
      }).parse(req.body);

      const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      const apiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v21.0';

      if (!accessToken || !phoneNumberId) {
        return res.status(400).json({ success: false, error: 'WhatsApp credentials not configured' });
      }

      const cleanedNumber = phoneNumber.replace(/[^0-9]/g, '');
      const tplName = templateName || 'hello_world';
      const isHelloWorld = tplName === 'hello_world';

      // hello_world has no parameters; PetSOS templates use sample body vars
      const payload: any = {
        messaging_product: 'whatsapp',
        to: cleanedNumber,
        type: 'template',
        template: {
          name: tplName,
          language: { code: tplName.endsWith('_zh_hk') ? 'zh_HK' : 'en' },
          ...(isHelloWorld ? {} : {
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: 'Cat' },
                  { type: 'text', text: 'Domestic Shorthair' },
                  { type: 'text', text: '3 years' },
                  { type: 'text', text: 'Breathing difficulty' },
                  { type: 'text', text: 'Mong Kok, Kowloon' },
                  { type: 'text', text: 'PetSOS Test Owner' },
                  { type: 'text', text: '85265000000' },
                ],
              },
            ],
          }),
        },
      };

      const response = await fetch(`${apiUrl}/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({ success: false, error: responseData?.error?.message || 'API error', details: responseData });
      }

      res.json({ success: true, messageId: responseData.messages?.[0]?.id, response: responseData });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // Get failed messages with details (admin only)
  app.get("/api/admin/failed-messages", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Query database directly for failed messages
      const query = await db.select().from(messages as any).where(eq((messages as any).status, 'failed')).limit(100);
      
      res.json({
        total: query.length,
        messages: query.map((m: any) => ({
          id: m.id,
          emergencyRequestId: m.emergencyRequestId,
          recipient: m.recipient,
          messageType: m.messageType,
          status: m.status,
          error: m.errorMessage,
          retryCount: m.retryCount,
          createdAt: m.createdAt,
          failedAt: m.failedAt,
          content: m.content?.substring(0, 100) + '...' || ''
        }))
      });
    } catch (error) {
      console.error('[Failed Messages] Error:', error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // ===== WHATSAPP CHAT ENDPOINTS (Two-way messaging) =====
  
  // Get all conversations (admin only)
  app.get("/api/admin/conversations", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const includeArchived = req.query.includeArchived === 'true';
      const conversations = await storage.getAllConversations(includeArchived);
      res.json(conversations);
    } catch (error) {
      console.error('[Conversations] Error fetching:', error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });
  
  // Get unread conversation count (admin only) - MUST be before :id routes
  app.get("/api/admin/conversations/unread-count", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const conversations = await storage.getAllConversations(false);
      const unreadCount = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      const unreadConversations = conversations.filter(c => (c.unreadCount || 0) > 0).length;
      res.json({ unreadCount, unreadConversations });
    } catch (error) {
      console.error('[Conversations] Error getting unread count:', error);
      res.status(500).json({ message: "Failed to get unread count" });
    }
  });
  
  // Get single conversation (admin only)
  app.get("/api/admin/conversations/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      console.error('[Conversations] Error fetching:', error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });
  
  // Get messages for a conversation (admin only)
  app.get("/api/admin/conversations/:id/messages", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const messages = await storage.getChatMessagesByConversation(req.params.id, limit, offset);
      res.json(messages);
    } catch (error) {
      console.error('[Conversations] Error fetching messages:', error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  
  // Start new conversation (admin only)
  app.post("/api/admin/conversations/new", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { phoneNumber, displayName, content } = z.object({
        phoneNumber: z.string().min(8),
        displayName: z.string().optional(),
        content: z.string().min(1),
      }).parse(req.body);
      
      // Sanitize phone number
      const sanitizedPhone = phoneNumber.replace(/[^0-9]/g, '');
      
      // Check if conversation already exists
      let conversation = await storage.getConversationByPhone(sanitizedPhone);
      
      if (!conversation) {
        // Try to find matching hospital
        const hospital = await storage.findHospitalByPhone(sanitizedPhone);
        
        // Create new conversation
        conversation = await storage.createConversation({
          phoneNumber: sanitizedPhone,
          hospitalId: hospital?.id || null,
          displayName: displayName || (hospital ? (hospital.nameEn || hospital.nameZh) : `+${sanitizedPhone}`),
          lastMessageAt: new Date(),
          lastMessagePreview: content.substring(0, 100),
          unreadCount: 0,
          isArchived: false,
        });
      }
      
      // Send via WhatsApp API
      const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
      const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
      const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';
      
      if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
        return res.status(500).json({ message: "WhatsApp not configured" });
      }
      
      const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
      const payload = {
        messaging_product: 'whatsapp',
        to: sanitizedPhone,
        type: 'text',
        text: { body: content },
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('[New Chat] WhatsApp API error:', responseData);
        return res.status(500).json({ 
          message: "Failed to send message",
          error: responseData.error?.message || 'Unknown error'
        });
      }
      
      const whatsappMessageId = responseData.messages?.[0]?.id;
      
      // Store the outbound message
      const chatMessage = await storage.createChatMessage({
        conversationId: conversation.id,
        direction: 'outbound',
        content,
        messageType: 'text',
        whatsappMessageId,
        status: 'sent',
        sentAt: new Date(),
      });
      
      // Update conversation
      await storage.updateConversation(conversation.id, {
        lastMessageAt: new Date(),
        lastMessagePreview: content.substring(0, 100),
      });
      
      // Audit log
      await storage.createAuditLog({
        entityType: 'whatsapp_chat',
        entityId: chatMessage.id,
        action: 'start_conversation',
        userId: req.user?.id,
        changes: { conversationId: conversation.id, phoneNumber: sanitizedPhone },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      console.log(`[New Chat] Started conversation ${conversation.id} with ${sanitizedPhone}`);
      
      res.json({ conversation, message: chatMessage });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error('[New Chat] Error:', error);
      res.status(500).json({ message: "Failed to start conversation" });
    }
  });

  // Mark conversation as read (admin only)
  app.post("/api/admin/conversations/:id/read", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.markConversationAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('[Conversations] Error marking as read:', error);
      res.status(500).json({ message: "Failed to mark as read" });
    }
  });
  
  // Archive/unarchive conversation (admin only)
  app.post("/api/admin/conversations/:id/archive", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { archive } = z.object({ archive: z.boolean() }).parse(req.body);
      
      if (archive) {
        await storage.archiveConversation(req.params.id);
      } else {
        await storage.updateConversation(req.params.id, { isArchived: false });
      }
      
      res.json({ success: true, archived: archive });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error('[Conversations] Error archiving:', error);
      res.status(500).json({ message: "Failed to archive conversation" });
    }
  });
  
  // Send reply message (admin only)
  app.post("/api/admin/conversations/:id/reply", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { content } = z.object({ content: z.string().min(1) }).parse(req.body);
      
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Send via WhatsApp API
      const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
      const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
      const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';
      
      if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
        return res.status(500).json({ message: "WhatsApp not configured" });
      }
      
      const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
      const payload = {
        messaging_product: 'whatsapp',
        to: conversation.phoneNumber,
        type: 'text',
        text: { body: content },
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('[Chat Reply] WhatsApp API error:', responseData);
        return res.status(500).json({ 
          message: "Failed to send message",
          error: responseData.error?.message || 'Unknown error'
        });
      }
      
      const whatsappMessageId = responseData.messages?.[0]?.id;
      
      // Store the outbound message
      const chatMessage = await storage.createChatMessage({
        conversationId: conversation.id,
        direction: 'outbound',
        content,
        messageType: 'text',
        whatsappMessageId,
        status: 'sent',
        sentAt: new Date(),
      });
      
      // Update conversation
      await storage.updateConversation(conversation.id, {
        lastMessageAt: new Date(),
        lastMessagePreview: content.substring(0, 100),
      });
      
      // Audit log
      await storage.createAuditLog({
        entityType: 'whatsapp_chat',
        entityId: chatMessage.id,
        action: 'send_reply',
        userId: req.user?.id,
        changes: { conversationId: conversation.id, content: content.substring(0, 50) },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      console.log(`[Chat Reply] Sent message ${chatMessage.id} to ${conversation.phoneNumber}`);
      
      res.json(chatMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error('[Chat Reply] Error:', error);
      res.status(500).json({ message: "Failed to send reply" });
    }
  });

  // ===== OWNER VERIFICATION ENDPOINTS =====
  
  // Generate 6-digit verification code for clinic (admin only)
  app.post("/api/clinics/:id/generate-code", isAuthenticated, isAdmin, async (req: any, res: any) => {
    try {
      console.log(`[Generate Clinic Code] Starting for clinic ID: ${req.params.id}`);
      
      const clinic = await storage.getClinic(req.params.id);
      if (!clinic) {
        console.log(`[Generate Clinic Code] Clinic not found: ${req.params.id}`);
        return res.status(404).json({ message: "Clinic not found" });
      }
      console.log(`[Generate Clinic Code] Found clinic: ${clinic.name}`);

      const code = Math.floor(Math.random() * 900000 + 100000).toString();
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours from now
      
      console.log(`[Generate Clinic Code] Updating clinic with code, expires at: ${expiresAt.toISOString()}`);
      const updatedClinic = await storage.updateClinic(req.params.id, { 
        ownerVerificationCode: code,
        ownerVerificationCodeExpiresAt: expiresAt
      });
      
      if (!updatedClinic) {
        console.error(`[Generate Clinic Code] Update returned undefined for clinic: ${req.params.id}`);
        return res.status(500).json({ message: "Failed to update clinic with verification code" });
      }
      console.log(`[Generate Clinic Code] Clinic updated successfully`);

      try {
        await storage.createAuditLog({
          entityType: 'clinic',
          entityId: clinic.id,
          action: 'generate_code',
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        });
      } catch (auditError) {
        console.error(`[Generate Clinic Code] Audit log error (non-fatal):`, auditError);
      }
      
      console.log(`[Generate Clinic Code] Success - returning code for clinic: ${clinic.id}`);
      res.json({ code, clinicId: clinic.id, expiresAt: expiresAt.toISOString() });
    } catch (error) {
      console.error("[Generate Clinic Code] Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to generate code", error: errorMessage });
    }
  });

  // Verify clinic access with code (public - no auth needed)
  app.post("/api/clinics/:id/verify", async (req: any, res: any) => {
    try {
      const { verificationCode } = z.object({
        verificationCode: z.string().length(6, "Code must be 6 digits")
      }).parse(req.body);

      const clinic = await storage.getClinic(req.params.id);
      if (!clinic) {
        return res.status(404).json({ message: "Clinic not found" });
      }

      if (clinic.ownerVerificationCode !== verificationCode) {
        return res.status(401).json({ message: "Invalid verification code" });
      }

      // Check if code has expired
      if (clinic.ownerVerificationCodeExpiresAt && new Date() > new Date(clinic.ownerVerificationCodeExpiresAt)) {
        return res.status(401).json({ message: "Verification code has expired. Please request a new code from the administrator." });
      }

      res.json({ verified: true, clinicId: clinic.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update clinic as owner (verified with code)
  app.patch("/api/clinics/:id/update-owner", async (req: any, res: any) => {
    try {
      const { verificationCode, ...updateData } = z.object({
        verificationCode: z.string().length(6, "Code must be 6 digits"),
        // Basic Information
        name: z.string().optional(),
        nameZh: z.string().optional(),
        address: z.string().optional(),
        addressZh: z.string().optional(),
        phone: z.string().optional(),
        whatsapp: z.string().optional(),
        email: z.string().optional(),
        regionId: z.string().optional(),
        // Operations
        is24Hour: z.boolean().optional(),
        isAvailable: z.boolean().optional(),
        // Services
        services: z.array(z.string()).optional(),
      }).parse(req.body);

      const clinic = await storage.getClinic(req.params.id);
      if (!clinic) {
        return res.status(404).json({ message: "Clinic not found" });
      }

      // Verify ownership with code
      if (clinic.ownerVerificationCode !== verificationCode) {
        return res.status(401).json({ message: "Invalid verification code" });
      }

      // Check if code has expired
      if (clinic.ownerVerificationCodeExpiresAt && new Date() > new Date(clinic.ownerVerificationCodeExpiresAt)) {
        return res.status(401).json({ message: "Verification code has expired. Please request a new code from the administrator." });
      }

      // Update clinic with owner-provided data (uses same storage function as admin)
      const updatedClinic = await storage.updateClinic(req.params.id, updateData);

      await storage.createAuditLog({
        entityType: 'clinic',
        entityId: clinic.id,
        action: 'update',
        changes: updateData,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json(updatedClinic);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Generate 6-digit verification code for hospital (admin only)
  app.post("/api/hospitals/:id/generate-code", isAuthenticated, isAdmin, async (req: any, res: any) => {
    try {
      console.log(`[Generate Code] Starting for hospital ID: ${req.params.id}`);
      
      const hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        console.log(`[Generate Code] Hospital not found: ${req.params.id}`);
        return res.status(404).json({ message: "Hospital not found" });
      }
      console.log(`[Generate Code] Found hospital: ${hospital.nameEn}`);

      const code = Math.floor(Math.random() * 900000 + 100000).toString();
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours from now
      
      console.log(`[Generate Code] Updating hospital with code, expires at: ${expiresAt.toISOString()}`);
      const updatedHospital = await storage.updateHospital(req.params.id, { 
        ownerVerificationCode: code,
        ownerVerificationCodeExpiresAt: expiresAt
      });
      
      if (!updatedHospital) {
        console.error(`[Generate Code] Update returned undefined for hospital: ${req.params.id}`);
        return res.status(500).json({ message: "Failed to update hospital with verification code" });
      }
      console.log(`[Generate Code] Hospital updated successfully`);

      try {
        await storage.createAuditLog({
          entityType: 'hospital',
          entityId: hospital.id,
          action: 'generate_code',
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        });
      } catch (auditError) {
        console.error(`[Generate Code] Audit log error (non-fatal):`, auditError);
      }
      
      console.log(`[Generate Code] Success - returning code for hospital: ${hospital.id}`);
      res.json({ code, hospitalId: hospital.id, expiresAt: expiresAt.toISOString() });
    } catch (error) {
      console.error("[Generate Code] Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to generate code", error: errorMessage });
    }
  });

  // Verify hospital access with code (public - no auth needed)
  app.post("/api/hospitals/:id/verify", async (req: any, res: any) => {
    try {
      const { verificationCode } = z.object({
        verificationCode: z.string().length(6, "Code must be 6 digits")
      }).parse(req.body);

      const hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }

      if (hospital.ownerVerificationCode !== verificationCode) {
        return res.status(401).json({ message: "Invalid verification code" });
      }

      // Check if code has expired
      if (hospital.ownerVerificationCodeExpiresAt && new Date() > new Date(hospital.ownerVerificationCodeExpiresAt)) {
        return res.status(401).json({ message: "Verification code has expired. Please request a new code from the administrator." });
      }

      res.json({ verified: true, hospitalId: hospital.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update hospital as owner (verified with code)
  app.patch("/api/hospitals/:id/update-owner", async (req: any, res: any) => {
    try {
      // First validate the verification code
      const { verificationCode } = z.object({
        verificationCode: z.string().length(6, "Code must be 6 digits"),
      }).parse(req.body);

      // Then use the same schema as admin endpoint for field validation
      const { insertHospitalSchema } = await import("@shared/schema");
      const { verificationCode: _, ...bodyWithoutCode } = req.body;
      const updateData = insertHospitalSchema.partial().parse(bodyWithoutCode);

      const hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }

      // Verify ownership with code
      if (hospital.ownerVerificationCode !== verificationCode) {
        return res.status(401).json({ message: "Invalid verification code" });
      }

      // Check if code has expired
      if (hospital.ownerVerificationCodeExpiresAt && new Date() > new Date(hospital.ownerVerificationCodeExpiresAt)) {
        return res.status(401).json({ message: "Verification code has expired. Please request a new code from the administrator." });
      }

      // Log field-level changes before update
      await logHospitalChanges(
        hospital.id,
        hospital,
        updateData,
        'Hospital Owner',
        'verification_code',
        'update',
        req.ip,
        req.get('user-agent')
      );

      // Update hospital with owner-provided data (uses same storage function as admin)
      const updatedHospital = await storage.updateHospital(req.params.id, updateData);

      await storage.createAuditLog({
        entityType: 'hospital',
        entityId: hospital.id,
        action: 'update',
        changes: updateData,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json(updatedHospital);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Quick status update for hospital owners (verified with code)
  app.patch("/api/hospitals/:id/status", async (req: any, res: any) => {
    try {
      const { verificationCode, liveStatus } = z.object({
        verificationCode: z.string().length(6, "Code must be 6 digits"),
        liveStatus: z.enum(['normal', 'busy', 'critical_only', 'full'], {
          errorMap: () => ({ message: "Status must be one of: normal, busy, critical_only, full" })
        }),
      }).parse(req.body);

      const hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }

      // Verify ownership with code
      if (hospital.ownerVerificationCode !== verificationCode) {
        return res.status(401).json({ message: "Invalid verification code" });
      }

      // Check if code has expired
      if (hospital.ownerVerificationCodeExpiresAt && new Date() > new Date(hospital.ownerVerificationCodeExpiresAt)) {
        return res.status(401).json({ message: "Verification code has expired. Please request a new code from the administrator." });
      }

      // Log status change
      await storage.createHospitalChangeLog({
        hospitalId: hospital.id,
        fieldName: 'liveStatus',
        oldValue: hospital.liveStatus || null,
        newValue: liveStatus,
        changedBy: 'Hospital Owner',
        changeSource: 'verification_code',
        changeType: 'status_change',
        ipAddress: req.ip || null,
        userAgent: req.get('user-agent') || null,
      });

      // Update only the live status
      const updatedHospital = await storage.updateHospital(req.params.id, { liveStatus });

      await storage.createAuditLog({
        entityType: 'hospital',
        entityId: hospital.id,
        action: 'status_update',
        changes: { liveStatus, previousStatus: hospital.liveStatus },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json({ 
        success: true, 
        liveStatus: updatedHospital?.liveStatus,
        message: `Status updated to ${liveStatus}` 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating hospital status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== HOSPITAL SELF-SERVICE PORTAL ENDPOINTS =====
  
  // Verify hospital access code and return hospital info (public - no auth needed)
  app.post("/api/hospitals/verify-code", async (req: any, res: any) => {
    try {
      const { accessCode } = z.object({
        accessCode: z.string().length(8, "Access code must be 8 characters")
      }).parse(req.body);

      const hospital = await storage.getHospitalByAccessCode(accessCode.toUpperCase());
      if (!hospital) {
        return res.status(401).json({ message: "Invalid access code" });
      }

      // Return hospital info (excluding sensitive data)
      res.json({
        id: hospital.id,
        slug: hospital.slug,
        nameEn: hospital.nameEn,
        nameZh: hospital.nameZh,
        addressEn: hospital.addressEn,
        addressZh: hospital.addressZh,
        phone: hospital.phone,
        whatsapp: hospital.whatsapp,
        email: hospital.email,
        open247: hospital.open247,
        lastConfirmedAt: hospital.lastConfirmedAt,
        confirmedByName: hospital.confirmedByName,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error verifying access code:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update hospital info using access code (public - no auth needed)
  app.post("/api/hospitals/update-by-code", async (req: any, res: any) => {
    try {
      const updateSchema = z.object({
        accessCode: z.string().length(8, "Access code must be 8 characters"),
        phone: z.string().optional(),
        whatsapp: z.string().optional(),
        email: z.string().email().optional().or(z.literal('')),
        open247: z.boolean().optional(),
        confirmedByName: z.string().min(1, "Name is required"),
      });

      const { accessCode, confirmedByName, ...updateData } = updateSchema.parse(req.body);

      const hospital = await storage.getHospitalByAccessCode(accessCode.toUpperCase());
      if (!hospital) {
        return res.status(401).json({ message: "Invalid access code" });
      }

      // Log field-level changes before update
      await logHospitalChanges(
        hospital.id,
        hospital,
        updateData,
        confirmedByName,
        'access_code',
        'update',
        req.ip,
        req.get('user-agent')
      );

      // Update hospital with new data and set lastConfirmedAt
      const updatedHospital = await storage.updateHospital(hospital.id, {
        ...updateData,
        confirmedByName,
        lastConfirmedAt: new Date(),
      } as any);

      await storage.createAuditLog({
        entityType: 'hospital',
        entityId: hospital.id,
        action: 'self_service_update',
        changes: { ...updateData, confirmedByName },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json({
        success: true,
        message: "Hospital information updated successfully",
        hospital: {
          id: updatedHospital?.id,
          nameEn: updatedHospital?.nameEn,
          nameZh: updatedHospital?.nameZh,
          lastConfirmedAt: updatedHospital?.lastConfirmedAt,
          confirmedByName: updatedHospital?.confirmedByName,
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating hospital by code:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mark hospital info as confirmed (simple confirmation without changes)
  app.post("/api/hospitals/confirm-info", async (req: any, res: any) => {
    try {
      const { accessCode, confirmedByName } = z.object({
        accessCode: z.string().length(8, "Access code must be 8 characters"),
        confirmedByName: z.string().min(1, "Name is required"),
      }).parse(req.body);

      const hospital = await storage.getHospitalByAccessCode(accessCode.toUpperCase());
      if (!hospital) {
        return res.status(401).json({ message: "Invalid access code" });
      }

      // Log confirmation action
      await storage.createHospitalChangeLog({
        hospitalId: hospital.id,
        fieldName: 'confirmation',
        oldValue: hospital.lastConfirmedAt ? hospital.lastConfirmedAt.toISOString() : null,
        newValue: new Date().toISOString(),
        changedBy: confirmedByName,
        changeSource: 'access_code',
        changeType: 'confirm',
        ipAddress: req.ip || null,
        userAgent: req.get('user-agent') || null,
      });

      // Update only the confirmation fields
      const updatedHospital = await storage.updateHospital(hospital.id, {
        confirmedByName,
        lastConfirmedAt: new Date(),
      } as any);

      await storage.createAuditLog({
        entityType: 'hospital',
        entityId: hospital.id,
        action: 'self_service_confirm',
        changes: { confirmedByName },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json({
        success: true,
        message: "Hospital information confirmed",
        hospital: {
          id: updatedHospital?.id,
          nameEn: updatedHospital?.nameEn,
          nameZh: updatedHospital?.nameZh,
          lastConfirmedAt: updatedHospital?.lastConfirmedAt,
          confirmedByName: updatedHospital?.confirmedByName,
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error confirming hospital info:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Generate access codes for all hospitals (admin only)
  app.post("/api/hospitals/generate-access-codes", isAuthenticated, isAdmin, async (req: any, res: any) => {
    try {
      const result = await storage.generateAccessCodesForAllHospitals();
      
      await storage.createAuditLog({
        entityType: 'hospital',
        entityId: 'all',
        action: 'generate_access_codes',
        changes: { updated: result.updated, errors: result.errors.length },
        userId: req.user?.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json({
        success: true,
        updated: result.updated,
        errors: result.errors,
      });
    } catch (error) {
      console.error("Error generating access codes:", error);
      res.status(500).json({ message: "Failed to generate access codes" });
    }
  });

  // Get hospital photo upload URL (for verified hospital owners)
  app.post("/api/hospitals/:id/photo-upload-url", async (req: any, res: any) => {
    try {
      const { verificationCode, contentType } = z.object({
        verificationCode: z.string().length(6, "Code must be 6 digits"),
        contentType: z.string().optional(),
      }).parse(req.body);

      const hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }

      // Verify ownership with code
      if (hospital.ownerVerificationCode !== verificationCode) {
        return res.status(401).json({ message: "Invalid verification code" });
      }

      // Check if code has expired
      if (hospital.ownerVerificationCodeExpiresAt && new Date() > new Date(hospital.ownerVerificationCodeExpiresAt)) {
        return res.status(401).json({ message: "Verification code has expired. Please request a new code from the administrator." });
      }

      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL(contentType);
      res.json({ uploadURL });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error getting hospital photo upload URL:", error);
      res.status(500).json({ error: error.message || "Failed to get upload URL" });
    }
  });

  // Add hospital photo (for verified hospital owners)
  app.post("/api/hospitals/:id/photo", async (req: any, res: any) => {
    try {
      const { verificationCode, filePath: rawFilePath } = z.object({
        verificationCode: z.string().length(6, "Code must be 6 digits"),
        filePath: z.string().min(1, "File path is required"),
      }).parse(req.body);

      const hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }

      // Verify ownership with code
      if (hospital.ownerVerificationCode !== verificationCode) {
        return res.status(401).json({ message: "Invalid verification code" });
      }

      // Check if code has expired
      if (hospital.ownerVerificationCodeExpiresAt && new Date() > new Date(hospital.ownerVerificationCodeExpiresAt)) {
        return res.status(401).json({ message: "Verification code has expired. Please request a new code from the administrator." });
      }

      const objectStorageService = new ObjectStorageService();
      
      // Extract the file path from the signed URL (remove bucket/domain info)
      const filePath = objectStorageService.extractObjectEntityPath(rawFilePath);
      if (!filePath) {
        return res.status(400).json({ 
          error: "Invalid file path", 
          message: "Could not extract valid file path from the uploaded file URL."
        });
      }
      
      // Set ACL policy - public for hospital photos
      try {
        await objectStorageService.trySetObjectEntityAclPolicy(filePath, {
          owner: hospital.id,
          visibility: "public",
        });
      } catch (aclError) {
        console.warn("Failed to set ACL policy for hospital photo:", aclError);
        // Continue anyway - the file might still be accessible
      }
      
      // Get the public URL for the photo
      const photoUrl = objectStorageService.getObjectEntityPublicUrl(filePath);
      
      if (!photoUrl || typeof photoUrl !== 'string') {
        return res.status(500).json({ 
          error: "Failed to generate photo URL", 
          message: "Could not generate a valid URL for the uploaded photo."
        });
      }
      
      // Add photo to hospital's photos array
      const currentPhotos = (hospital.photos || []) as string[];
      const updatedPhotos = [...currentPhotos, photoUrl];
      
      const updatedHospital = await storage.updateHospital(req.params.id, { photos: updatedPhotos });

      await storage.createAuditLog({
        entityType: 'hospital',
        entityId: hospital.id,
        action: 'update',
        changes: { photos: updatedPhotos },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json({ photoUrl, hospital: updatedHospital });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error adding hospital photo:", error);
      res.status(500).json({ error: error.message || "Failed to add hospital photo" });
    }
  });

  // Delete hospital photo (for verified hospital owners)
  app.delete("/api/hospitals/:id/photo", async (req: any, res: any) => {
    try {
      const { verificationCode, photoUrl } = z.object({
        verificationCode: z.string().length(6, "Code must be 6 digits"),
        photoUrl: z.string().min(1, "Photo URL is required"),
      }).parse(req.body);

      const hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }

      // Verify ownership with code
      if (hospital.ownerVerificationCode !== verificationCode) {
        return res.status(401).json({ message: "Invalid verification code" });
      }

      // Check if code has expired
      if (hospital.ownerVerificationCodeExpiresAt && new Date() > new Date(hospital.ownerVerificationCodeExpiresAt)) {
        return res.status(401).json({ message: "Verification code has expired. Please request a new code from the administrator." });
      }
      
      // Remove photo from hospital's photos array
      const currentPhotos = (hospital.photos || []) as string[];
      const updatedPhotos = currentPhotos.filter(url => url !== photoUrl);
      
      const updatedHospital = await storage.updateHospital(req.params.id, { photos: updatedPhotos });

      await storage.createAuditLog({
        entityType: 'hospital',
        entityId: hospital.id,
        action: 'update',
        changes: { photos: updatedPhotos },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json({ hospital: updatedHospital });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error deleting hospital photo:", error);
      res.status(500).json({ error: error.message || "Failed to delete hospital photo" });
    }
  });

  // Get hospital photo upload URL (for admin)
  app.post("/api/admin/hospitals/:id/photo-upload-url", isAuthenticated, isAdmin, async (req: any, res: any) => {
    try {
      const hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }

      const { contentType } = req.body || {};
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL(contentType);
      res.json({ uploadURL });
    } catch (error: any) {
      console.error("Error getting hospital photo upload URL:", error);
      res.status(500).json({ error: error.message || "Failed to get upload URL" });
    }
  });

  // Add hospital photo (for admin)
  app.post("/api/admin/hospitals/:id/photo", isAuthenticated, isAdmin, async (req: any, res: any) => {
    try {
      const { filePath: rawFilePath } = z.object({
        filePath: z.string().min(1, "File path is required"),
      }).parse(req.body);

      const hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }

      const objectStorageService = new ObjectStorageService();
      
      // Extract the file path from the signed URL
      const filePath = objectStorageService.extractObjectEntityPath(rawFilePath);
      if (!filePath) {
        return res.status(400).json({ 
          error: "Invalid file path", 
          message: "Could not extract valid file path from the uploaded file URL."
        });
      }
      
      // Set ACL policy - public for hospital photos
      try {
        await objectStorageService.trySetObjectEntityAclPolicy(filePath, {
          owner: hospital.id,
          visibility: "public",
        });
      } catch (aclError) {
        console.warn("Failed to set ACL policy for hospital photo:", aclError);
      }
      
      // Get the public URL for the photo
      const photoUrl = objectStorageService.getObjectEntityPublicUrl(filePath);
      
      if (!photoUrl || typeof photoUrl !== 'string') {
        return res.status(500).json({ 
          error: "Failed to generate photo URL", 
          message: "Could not generate a valid URL for the uploaded photo."
        });
      }
      
      // Add photo to hospital's photos array
      const currentPhotos = (hospital.photos || []) as string[];
      const updatedPhotos = [...currentPhotos, photoUrl];
      
      const updatedHospital = await storage.updateHospital(req.params.id, { photos: updatedPhotos });

      const userId = (req.user as any).id;
      await storage.createAuditLog({
        entityType: 'hospital',
        entityId: hospital.id,
        action: 'update',
        userId,
        changes: { photos: updatedPhotos },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json({ photoUrl, hospital: updatedHospital });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error adding hospital photo:", error);
      res.status(500).json({ error: error.message || "Failed to add hospital photo" });
    }
  });

  // Delete hospital photo (for admin)
  app.delete("/api/admin/hospitals/:id/photo", isAuthenticated, isAdmin, async (req: any, res: any) => {
    try {
      const { photoUrl } = z.object({
        photoUrl: z.string().min(1, "Photo URL is required"),
      }).parse(req.body);

      const hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      
      // Remove photo from hospital's photos array
      const currentPhotos = (hospital.photos || []) as string[];
      const updatedPhotos = currentPhotos.filter(url => url !== photoUrl);
      
      const updatedHospital = await storage.updateHospital(req.params.id, { photos: updatedPhotos });

      const userId = (req.user as any).id;
      await storage.createAuditLog({
        entityType: 'hospital',
        entityId: hospital.id,
        action: 'update',
        userId,
        changes: { photos: updatedPhotos },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json({ hospital: updatedHospital });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error deleting hospital photo:", error);
      res.status(500).json({ error: error.message || "Failed to delete hospital photo" });
    }
  });

  // ===== HOSPITAL OUTREACH ROUTES =====
  
  // Get all hospitals with outreach status for admin
  app.get("/api/admin/hospitals/outreach-status", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const allHospitals = await storage.getAllHospitals();
      
      const outreachData = allHospitals.map(hospital => ({
        id: hospital.id,
        slug: hospital.slug,
        nameEn: hospital.nameEn,
        nameZh: hospital.nameZh,
        phone: hospital.phone,
        whatsapp: hospital.whatsapp,
        email: hospital.email,
        verificationCode: hospital.ownerVerificationCode,
        verificationCodeExpiresAt: hospital.ownerVerificationCodeExpiresAt,
        lastConfirmedAt: hospital.lastConfirmedAt,
        confirmedByName: hospital.confirmedByName,
        inviteSentAt: hospital.inviteSentAt,
        isAvailable: hospital.isAvailable,
        status: hospital.lastConfirmedAt ? 'confirmed' : 'pending',
      }));
      
      res.json(outreachData);
    } catch (error) {
      console.error('Error fetching hospital outreach status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Send WhatsApp invitation to a single hospital
  app.post("/api/admin/hospitals/send-invite/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      let hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: 'Hospital not found' });
      }
      
      const targetPhone = hospital.whatsapp || hospital.phone;
      if (!targetPhone) {
        return res.status(400).json({ message: 'Hospital has no phone or WhatsApp number' });
      }
      
      // Generate a new 6-digit verification code with 72-hour expiry before sending
      const code = Math.floor(Math.random() * 900000 + 100000).toString();
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours from now
      
      hospital = await storage.updateHospital(req.params.id, { 
        ownerVerificationCode: code,
        ownerVerificationCodeExpiresAt: expiresAt
      }) || hospital;
      
      // Build the bilingual invitation message with direct edit link
      const hospitalName = hospital.nameEn || hospital.nameZh || 'Hospital';
      const editLink = `https://petsos.site/hospital/edit/${hospital.slug}`;
      const message = `🏥 PetSOS Hospital Information Update

Dear ${hospitalName},

We are launching PetSOS, a non-profit pet emergency platform connecting pet owners with 24-hour veterinary clinics in Hong Kong.

Your clinic is listed on our platform. Please verify your information:

👉 ${editLink}
📋 Verification Code: ${code}

This code expires in 72 hours.

Thank you,
PetSOS Team

---

🏥 PetSOS 醫院資料更新

${hospital.nameZh || hospitalName} 您好，

我們正推出 PetSOS，一個連結寵物主人與香港24小時獸醫診所的非營利寵物急症平台。

您的診所已列於我們平台。請驗證您的資料：

👉 ${editLink}
📋 驗證碼：${code}

此驗證碼將於72小時後失效。

謝謝，
PetSOS 團隊`;

      // Send via WhatsApp using messaging service
      const result = await messagingService.sendDirectWhatsAppMessage(targetPhone, message);
      
      if (result.success) {
        // Update the inviteSentAt timestamp
        await storage.updateHospital(hospital.id, { inviteSentAt: new Date() });
        
        // Log the action
        await storage.createAuditLog({
          entityType: 'hospital',
          entityId: hospital.id,
          action: 'send_invite',
          userId: (req.user as any).id,
          changes: { inviteSentAt: new Date().toISOString(), phone: targetPhone, codeGenerated: true },
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        });
        
        res.json({ 
          success: true, 
          message: 'Invitation sent successfully',
          hospital: hospital.nameEn,
          sentTo: targetPhone
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Failed to send invitation',
          error: result.error 
        });
      }
    } catch (error) {
      console.error('Error sending hospital invite:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Send WhatsApp invitations to all unconfirmed hospitals
  app.post("/api/admin/hospitals/send-all-invites", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const allHospitals = await storage.getAllHospitals();
      
      // Filter to only pending (unconfirmed) hospitals with phone/whatsapp
      const pendingHospitals = allHospitals.filter(h => 
        !h.lastConfirmedAt && 
        (h.whatsapp || h.phone)
      );
      
      if (pendingHospitals.length === 0) {
        return res.json({ 
          success: true, 
          message: 'No pending hospitals to invite',
          sent: 0,
          failed: 0
        });
      }
      
      const results = {
        sent: 0,
        failed: 0,
        details: [] as Array<{ hospital: string; status: string; error?: string }>
      };
      
      for (let hospital of pendingHospitals) {
        const targetPhone = hospital.whatsapp || hospital.phone;
        const hospitalName = hospital.nameEn || hospital.nameZh || 'Hospital';
        
        try {
          // Generate a new 6-digit verification code with 72-hour expiry
          const code = Math.floor(Math.random() * 900000 + 100000).toString();
          const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours from now
          
          hospital = await storage.updateHospital(hospital.id, { 
            ownerVerificationCode: code,
            ownerVerificationCodeExpiresAt: expiresAt
          }) || hospital;
          
          const editLink = `https://petsos.site/hospital/edit/${hospital.slug}`;
          const message = `🏥 PetSOS Hospital Information Update

Dear ${hospitalName},

We are launching PetSOS, a non-profit pet emergency platform connecting pet owners with 24-hour veterinary clinics in Hong Kong.

Your clinic is listed on our platform. Please verify your information:

👉 ${editLink}
📋 Verification Code: ${code}

This code expires in 72 hours.

Thank you,
PetSOS Team

---

🏥 PetSOS 醫院資料更新

${hospital.nameZh || hospitalName} 您好，

我們正推出 PetSOS，一個連結寵物主人與香港24小時獸醫診所的非營利寵物急症平台。

您的診所已列於我們平台。請驗證您的資料：

👉 ${editLink}
📋 驗證碼：${code}

此驗證碼將於72小時後失效。

謝謝，
PetSOS 團隊`;

          const result = await messagingService.sendDirectWhatsAppMessage(targetPhone!, message);
          
          if (result.success) {
            await storage.updateHospital(hospital.id, { inviteSentAt: new Date() });
            results.sent++;
            results.details.push({ hospital: hospitalName, status: 'sent' });
          } else {
            results.failed++;
            results.details.push({ hospital: hospitalName, status: 'failed', error: result.error });
          }
        } catch (err) {
          results.failed++;
          results.details.push({ 
            hospital: hospitalName, 
            status: 'failed', 
            error: err instanceof Error ? err.message : 'Unknown error' 
          });
        }
        
        // Add a small delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Log the bulk action
      await storage.createAuditLog({
        entityType: 'hospital_outreach',
        entityId: 'bulk',
        action: 'send_bulk_invites',
        userId: (req.user as any).id,
        changes: { sent: results.sent, failed: results.failed },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json({
        success: true,
        message: `Sent ${results.sent} invitations, ${results.failed} failed`,
        sent: results.sent,
        failed: results.failed,
        details: results.details
      });
    } catch (error) {
      console.error('Error sending bulk hospital invites:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // ===== MEDICAL RECORDS ROUTES =====
  
  // Get user's storage usage
  app.get("/api/medical-records/storage-usage", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const usage = await storage.getUserStorageUsage(userId);
      
      res.json({
        usedBytes: usage.usedBytes,
        recordCount: usage.recordCount,
        maxBytes: STORAGE_QUOTA.MAX_STORAGE_PER_USER,
        maxRecords: STORAGE_QUOTA.MAX_RECORDS_PER_USER,
        maxFileSize: STORAGE_QUOTA.MAX_FILE_SIZE,
        percentUsed: Math.round((usage.usedBytes / STORAGE_QUOTA.MAX_STORAGE_PER_USER) * 100),
      });
    } catch (error: any) {
      console.error("Error getting storage usage:", error);
      res.status(500).json({ error: error.message || "Failed to get storage usage" });
    }
  });
  
  // Get upload URL for medical records
  app.post("/api/medical-records/upload-url", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Check storage quota before allowing upload
      const usage = await storage.getUserStorageUsage(userId);
      
      if (usage.recordCount >= STORAGE_QUOTA.MAX_RECORDS_PER_USER) {
        return res.status(403).json({ 
          error: "Storage quota exceeded", 
          message: `Maximum of ${STORAGE_QUOTA.MAX_RECORDS_PER_USER} medical records allowed. Please delete some records to upload more.`,
          quota: {
            usedRecords: usage.recordCount,
            maxRecords: STORAGE_QUOTA.MAX_RECORDS_PER_USER,
          }
        });
      }
      
      if (usage.usedBytes >= STORAGE_QUOTA.MAX_STORAGE_PER_USER) {
        const usedMB = Math.round(usage.usedBytes / (1024 * 1024));
        const maxMB = Math.round(STORAGE_QUOTA.MAX_STORAGE_PER_USER / (1024 * 1024));
        return res.status(403).json({ 
          error: "Storage quota exceeded", 
          message: `Storage limit of ${maxMB}MB reached (${usedMB}MB used). Please delete some records to upload more.`,
          quota: {
            usedBytes: usage.usedBytes,
            maxBytes: STORAGE_QUOTA.MAX_STORAGE_PER_USER,
          }
        });
      }
      
      const { contentType } = req.body || {};
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL(contentType);
      res.json({ 
        uploadURL,
        quota: {
          usedBytes: usage.usedBytes,
          usedRecords: usage.recordCount,
          maxBytes: STORAGE_QUOTA.MAX_STORAGE_PER_USER,
          maxRecords: STORAGE_QUOTA.MAX_RECORDS_PER_USER,
          maxFileSize: STORAGE_QUOTA.MAX_FILE_SIZE,
        }
      });
    } catch (error: any) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: error.message || "Failed to get upload URL" });
    }
  });

  // Upload medical record through the API as a fallback when direct storage PUT is blocked by CORS
  app.post(
    "/api/medical-records/upload-file",
    isAuthenticated,
    express.raw({ type: "*/*", limit: STORAGE_QUOTA.MAX_FILE_SIZE }),
    async (req: any, res) => {
      try {
        const userId = (req.user as any).id;
        const fileSize = Buffer.isBuffer(req.body) ? req.body.length : 0;
        const contentType = req.get("x-file-content-type") || req.get("content-type") || "application/octet-stream";

        if (!fileSize) {
          return res.status(400).json({ error: "File body is required" });
        }

        const usage = await storage.getUserStorageUsage(userId);

        if (usage.recordCount >= STORAGE_QUOTA.MAX_RECORDS_PER_USER) {
          return res.status(403).json({
            error: "Storage quota exceeded",
            message: `Maximum of ${STORAGE_QUOTA.MAX_RECORDS_PER_USER} medical records allowed. Please delete some records to upload more.`,
          });
        }

        if ((usage.usedBytes + fileSize) > STORAGE_QUOTA.MAX_STORAGE_PER_USER) {
          const maxMB = Math.round(STORAGE_QUOTA.MAX_STORAGE_PER_USER / (1024 * 1024));
          return res.status(403).json({
            error: "Storage quota exceeded",
            message: `This upload would exceed your storage limit of ${maxMB}MB.`,
          });
        }

        const objectStorageService = new ObjectStorageService();
        const filePath = await objectStorageService.uploadObjectEntityBuffer(req.body, contentType);

        res.json({
          filePath,
          size: fileSize,
          type: contentType,
        });
      } catch (error: any) {
        console.error("Error uploading medical record file:", error);
        res.status(500).json({ error: error.message || "Failed to upload file" });
      }
    }
  );

  // Create medical record after upload
  app.post("/api/medical-records", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const fileSize = req.body.fileSize || 0;
      
      // Validate file size
      if (fileSize > STORAGE_QUOTA.MAX_FILE_SIZE) {
        const maxSizeMB = Math.round(STORAGE_QUOTA.MAX_FILE_SIZE / (1024 * 1024));
        return res.status(403).json({ 
          error: "File too large", 
          message: `Maximum file size is ${maxSizeMB}MB.`,
        });
      }
      
      // Check storage quota before creating record
      const usage = await storage.getUserStorageUsage(userId);
      
      if (usage.recordCount >= STORAGE_QUOTA.MAX_RECORDS_PER_USER) {
        return res.status(403).json({ 
          error: "Storage quota exceeded", 
          message: `Maximum of ${STORAGE_QUOTA.MAX_RECORDS_PER_USER} medical records allowed.`,
        });
      }
      
      if ((usage.usedBytes + fileSize) > STORAGE_QUOTA.MAX_STORAGE_PER_USER) {
        const maxMB = Math.round(STORAGE_QUOTA.MAX_STORAGE_PER_USER / (1024 * 1024));
        return res.status(403).json({ 
          error: "Storage quota exceeded", 
          message: `This upload would exceed your storage limit of ${maxMB}MB.`,
        });
      }
      
      const objectStorageService = new ObjectStorageService();
      
      // Normalize the file path from upload URL
      const filePath = objectStorageService.normalizeObjectEntityPath(req.body.filePath);
      
      // Set ACL policy - private to owner by default
      await objectStorageService.trySetObjectEntityAclPolicy(filePath, {
        owner: userId,
        visibility: "private",
      });
      
      const recordData = {
        ...req.body,
        filePath,
        userId,
      };
      
      const result = insertPetMedicalRecordSchema.safeParse(recordData);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid record data", details: result.error.errors });
      }
      
      const record = await storage.createMedicalRecord(result.data);
      res.status(201).json(record);
    } catch (error: any) {
      console.error("Error creating medical record:", error);
      res.status(500).json({ error: error.message || "Failed to create medical record" });
    }
  });

  // Get medical records for a pet
  app.get("/api/pets/:petId/medical-records", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const { petId } = req.params;
      
      // Verify user owns this pet
      const pet = await storage.getPet(petId);
      if (!pet || pet.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const records = await storage.getMedicalRecordsByPetId(petId);
      res.json(records);
    } catch (error: any) {
      console.error("Error fetching medical records:", error);
      res.status(500).json({ error: error.message || "Failed to fetch medical records" });
    }
  });

  // Delete medical record
  app.delete("/api/medical-records/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const { id } = req.params;
      
      // Get record and verify ownership
      const record = await storage.getMedicalRecord(id);
      if (!record) {
        return res.status(404).json({ error: "Record not found" });
      }
      if (record.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      await storage.deleteMedicalRecord(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting medical record:", error);
      res.status(500).json({ error: error.message || "Failed to delete medical record" });
    }
  });

  // Serve medical record files (protected)
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req: any, res) => {
    const userId = (req.user as any).id;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Get medical sharing consents for a pet
  app.get("/api/pets/:petId/medical-consents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const { petId } = req.params;
      
      // Verify user owns this pet
      const pet = await storage.getPet(petId);
      if (!pet || pet.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const consents = await storage.getMedicalSharingConsentsByPetId(petId);
      res.json(consents);
    } catch (error: any) {
      console.error("Error fetching medical consents:", error);
      res.status(500).json({ error: error.message || "Failed to fetch consents" });
    }
  });

  // Update medical sharing consent
  app.put("/api/pets/:petId/medical-consents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      const { petId } = req.params;
      
      // Verify user owns this pet
      const pet = await storage.getPet(petId);
      if (!pet || pet.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const consentData = {
        petId,
        userId,
        consentType: req.body.consentType,
        enabled: req.body.enabled,
      };
      
      const result = insertPetMedicalSharingConsentSchema.safeParse(consentData);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid consent data", details: result.error.errors });
      }
      
      const consent = await storage.upsertMedicalSharingConsent(result.data);
      
      // Log consent change
      await storage.createAuditLog({
        entityType: 'pet_medical_consent',
        entityId: petId,
        action: 'update',
        userId,
        changes: { consentType: req.body.consentType, enabled: req.body.enabled },
      });
      
      res.json(consent);
    } catch (error: any) {
      console.error("Error updating medical consent:", error);
      res.status(500).json({ error: error.message || "Failed to update consent" });
    }
  });

  // ===== PUSH NOTIFICATION ROUTES =====
  
  // Register push subscription
  app.post("/api/push/subscribe", generalLimiter, async (req, res) => {
    try {
      const subscriptionData = insertPushSubscriptionSchema.safeParse(req.body);
      if (!subscriptionData.success) {
        return res.status(400).json({ 
          error: "Invalid subscription data", 
          details: subscriptionData.error.errors 
        });
      }
      
      const subscription = await storage.createPushSubscription(subscriptionData.data);
      res.status(201).json(subscription);
    } catch (error: any) {
      console.error("Error creating push subscription:", error);
      res.status(500).json({ error: error.message || "Failed to create subscription" });
    }
  });
  
  // Deactivate push subscription
  app.delete("/api/push/unsubscribe", generalLimiter, async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: "token is required" });
      }
      
      const success = await storage.deactivatePushSubscription(token);
      if (success) {
        res.json({ success: true, message: "Subscription deactivated" });
      } else {
        res.status(404).json({ error: "Subscription not found" });
      }
    } catch (error: any) {
      console.error("Error deactivating push subscription:", error);
      res.status(500).json({ error: error.message || "Failed to deactivate subscription" });
    }
  });

  // Register native push token (for iOS/Android Capacitor apps)
  // This endpoint accepts APNs tokens (iOS) or FCM tokens (Android) from native apps
  app.post("/api/push/register-native", generalLimiter, async (req: any, res) => {
    try {
      // Validate request body
      const nativeTokenSchema = z.object({
        token: z.string().min(1, "Token is required"),
        platform: z.enum(['ios', 'android', 'web']),
        deviceInfo: z.object({
          platform: z.string().optional(),
          isNative: z.boolean().optional(),
          model: z.string().optional(),
          osVersion: z.string().optional(),
          appVersion: z.string().optional(),
        }).passthrough().optional(),
      });

      const validationResult = nativeTokenSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid request data",
          details: validationResult.error.errors
        });
      }

      const { token, platform, deviceInfo } = validationResult.data;

      // Get user ID if authenticated (optional - allows anonymous device registration)
      const userId = req.user?.id || null;

      // Determine provider based on platform
      // iOS uses APNs tokens (but Firebase can proxy them), Android uses FCM
      const provider = platform === 'ios' ? 'apns' : 'fcm';

      // Check if this token already exists
      const existingSubscription = await storage.getPushSubscriptionByToken(token);

      if (existingSubscription) {
        // Update existing subscription
        const updated = await storage.updatePushSubscription(existingSubscription.id, {
          userId: userId || existingSubscription.userId,
          platform,
          provider,
          browserInfo: deviceInfo ? JSON.stringify(deviceInfo) : existingSubscription.browserInfo,
          isActive: true,
        });

        console.log(`[Push Native] Updated existing subscription for token: ${token.substring(0, 20)}...`);
        return res.json({
          success: true,
          message: "Push token updated",
          subscriptionId: updated?.id || existingSubscription.id,
          isNew: false,
        });
      }

      // Create new subscription
      const subscription = await storage.createPushSubscription({
        userId,
        token,
        provider,
        platform,
        browserInfo: deviceInfo ? JSON.stringify(deviceInfo) : null,
        language: req.user?.language || 'en',
        isActive: true,
      });

      console.log(`[Push Native] Created new subscription for platform: ${platform}, token: ${token.substring(0, 20)}...`);
      
      res.status(201).json({
        success: true,
        message: "Push token registered",
        subscriptionId: subscription.id,
        isNew: true,
      });
    } catch (error: any) {
      console.error("Error registering native push token:", error);
      res.status(500).json({ error: error.message || "Failed to register push token" });
    }
  });
  
  // Admin: Send or schedule broadcast notification
  app.post("/api/admin/notifications/broadcast", broadcastLimiter, isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const broadcastSchema = z.object({
        title: z.string().min(1).max(100),
        message: z.string().min(1).max(500),
        targetLanguage: z.enum(['en', 'zh-HK']).nullable().optional(),
        targetRole: z.enum(['pet_owner', 'hospital_clinic']).nullable().optional(),
        url: z.string().url().optional().or(z.literal('')),
        scheduledFor: z.string().datetime().nullable().optional()
      });
      
      const validationResult = broadcastSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid broadcast data", 
          details: validationResult.error.errors 
        });
      }
      
      const { title, message, targetLanguage, targetRole, url, scheduledFor } = validationResult.data;
      const userId = (req.user as any).id;
      
      // If scheduledFor is provided, create a scheduled notification
      if (scheduledFor) {
        const scheduledDate = new Date(scheduledFor);
        
        // Validate scheduled time is in the future
        if (scheduledDate <= new Date()) {
          return res.status(400).json({ 
            error: "Scheduled time must be in the future" 
          });
        }
        
        // Create scheduled broadcast record
        const broadcast = await storage.createNotificationBroadcast({
          title,
          message,
          targetLanguage: targetLanguage || null,
          targetRole: targetRole || null,
          url: url || null,
          adminId: userId,
          status: 'scheduled',
          scheduledFor: scheduledDate
        });
        
        // Create audit log
        await storage.createAuditLog({
          entityType: 'notification_broadcast',
          entityId: broadcast.id,
          action: 'schedule',
          userId: userId,
          changes: { 
            title,
            message,
            scheduledFor: scheduledFor,
            targetLanguage: targetLanguage || 'all'
          },
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        });
        
        return res.status(201).json({
          success: true,
          broadcastId: broadcast.id,
          scheduled: true,
          scheduledFor: scheduledDate.toISOString(),
          message: 'Notification scheduled successfully'
        });
      }
      
      // Immediate send - original logic
      const broadcast = await storage.createNotificationBroadcast({
        title,
        message,
        targetLanguage: targetLanguage || null,
        targetRole: targetRole || null,
        url: url || null,
        adminId: userId,
        status: 'pending'
      });
      
      // Get active FCM tokens filtered by language and/or role
      const tokens = await storage.getActiveTokens(targetLanguage || undefined, targetRole || undefined);
      
      if (tokens.length === 0) {
        // Update broadcast record - no recipients
        await storage.updateNotificationBroadcast(broadcast.id, {
          status: 'sent',
          recipientCount: 0,
          providerResponse: { 
            message: 'No active subscriptions found',
            url: url || null
          },
          sentAt: new Date()
        });
        
        return res.status(200).json({
          success: true,
          broadcastId: broadcast.id,
          recipientCount: 0,
          message: 'No active subscriptions to notify'
        });
      }
      
      // Send via FCM
      const result = await sendFCMBroadcast(tokens, {
        title,
        message,
        url: url || undefined
      });
      
      // Deactivate invalid tokens
      if (result.failedTokens && result.failedTokens.length > 0) {
        await storage.deactivatePushSubscriptions(result.failedTokens);
      }
      
      // Update broadcast record with result
      await storage.updateNotificationBroadcast(broadcast.id, {
        status: result.success ? 'sent' : 'failed',
        recipientCount: result.successCount || 0,
        providerResponse: { 
          successCount: result.successCount || 0,
          failureCount: result.failureCount || 0,
          url: url || null,
          error: result.error || null
        },
        sentAt: result.success ? new Date() : null
      });
      
      // Create audit log
      await storage.createAuditLog({
        entityType: 'notification_broadcast',
        entityId: broadcast.id,
        action: 'send',
        userId: userId,
        changes: {
          title,
          message,
          targetLanguage: targetLanguage || 'all',
          recipientCount: result.successCount || 0,
          success: result.success
        }
      });
      
      if (!result.success) {
        return res.status(500).json({
          error: "Failed to send notification",
          broadcastId: broadcast.id,
          details: result.error
        });
      }
      
      res.status(201).json({
        success: true,
        broadcastId: broadcast.id,
        recipientCount: result.successCount,
        failedCount: result.failureCount
      });
    } catch (error: any) {
      console.error("Error sending broadcast notification:", error);
      res.status(500).json({ error: error.message || "Failed to send broadcast" });
    }
  });
  
  // Admin: Get all notification broadcasts (with pagination)
  app.get("/api/admin/notifications", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const page = Math.max(parseInt(req.query.page as string) || 1, 1);
      const offset = (page - 1) * limit;
      
      const { broadcasts, total } = await storage.getAllNotificationBroadcasts(limit, offset);
      
      res.json({
        broadcasts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: error.message || "Failed to fetch notifications" });
    }
  });
  
  // Admin: Cancel a scheduled notification
  app.delete("/api/admin/notifications/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = (req.user as any).id;
      
      // Get the notification first
      const broadcast = await storage.getNotificationBroadcast(id);
      
      if (!broadcast) {
        return res.status(404).json({ error: "Notification not found" });
      }
      
      // Only allow cancellation of scheduled notifications
      if (broadcast.status !== 'scheduled') {
        return res.status(400).json({ 
          error: "Only scheduled notifications can be cancelled",
          currentStatus: broadcast.status
        });
      }
      
      // Update status to cancelled
      const updated = await storage.updateNotificationBroadcastStatus(id, 'cancelled');
      
      // Create audit log
      await storage.createAuditLog({
        entityType: 'notification_broadcast',
        entityId: id,
        action: 'cancel',
        userId: userId,
        changes: { 
          previousStatus: 'scheduled',
          newStatus: 'cancelled'
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.json({
        success: true,
        message: "Notification cancelled successfully",
        broadcast: updated
      });
    } catch (error: any) {
      console.error("Error cancelling notification:", error);
      res.status(500).json({ error: error.message || "Failed to cancel notification" });
    }
  });
  
  // Admin: Send Launch Notification to all pet owners (Push + Email only, NO WhatsApp)
  app.post("/api/admin/send-launch-notification", broadcastLimiter, isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Bilingual launch message template
      const titleEn = "🚀 PetSOS is Now Live!";
      const titleZh = "🚀 PetSOS 正式啟動！";
      const messageEn = `Dear Pet Owner,

PetSOS is now ready to help you find 24-hour veterinary care for your pet in Hong Kong.

✅ Find nearby 24-hour clinics
✅ One-tap emergency broadcast
✅ Real-time typhoon alerts

Visit https://petsos.site now!`;

      const messageZh = `親愛的寵物主人，

PetSOS 現已準備好幫助您在香港尋找 24 小時獸醫服務。

✅ 搜尋附近 24 小時診所
✅ 一鍵緊急廣播
✅ 即時颱風警報

立即瀏覽 https://petsos.site！`;

      const combinedMessage = `${messageEn}\n\n---\n\n${messageZh}`;
      const combinedTitle = `${titleEn} / ${titleZh}`;
      
      // Create a broadcast record for tracking
      const broadcast = await storage.createNotificationBroadcast({
        title: combinedTitle,
        message: combinedMessage,
        targetLanguage: null,
        targetRole: 'pet_owner',
        url: 'https://petsos.site',
        adminId: userId,
        status: 'pending'
      });
      
      const results = {
        pushSuccessCount: 0,
        pushFailureCount: 0,
        emailSuccessCount: 0,
        emailFailureCount: 0,
        totalPetOwners: 0
      };
      
      // 1. Send Push Notifications to pet owners with active tokens
      const pushTokens = await storage.getPetOwnerPushTokens();
      console.log(`[Launch Notification] Found ${pushTokens.length} pet owners with push tokens`);
      
      if (pushTokens.length > 0) {
        const pushResult = await sendFCMBroadcast(pushTokens, {
          title: titleEn,
          message: `${messageEn.substring(0, 150)}...`,
          url: 'https://petsos.site'
        });
        
        results.pushSuccessCount = pushResult.successCount || 0;
        results.pushFailureCount = pushResult.failureCount || 0;
        
        // Deactivate invalid tokens
        if (pushResult.failedTokens && pushResult.failedTokens.length > 0) {
          await storage.deactivatePushSubscriptions(pushResult.failedTokens);
        }
        
        console.log(`[Launch Notification] Push: ${results.pushSuccessCount} success, ${results.pushFailureCount} failed`);
      }
      
      // 2. Send Emails to pet owners with email addresses
      const petOwnerEmails = await storage.getPetOwnerEmails();
      console.log(`[Launch Notification] Found ${petOwnerEmails.length} pet owners with emails`);
      results.totalPetOwners = petOwnerEmails.length;
      
      // Send emails in batches to avoid rate limits
      const emailSubject = `${titleEn} - ${titleZh}`;
      const emailContent = combinedMessage;
      
      for (const owner of petOwnerEmails) {
        try {
          const { sendGmailEmail } = await import('./gmail-client');
          const success = await sendGmailEmail(
            owner.email,
            emailSubject,
            emailContent,
            process.env.EMAIL_FROM || 'noreply@petsos.site'
          );
          
          if (success) {
            results.emailSuccessCount++;
          } else {
            results.emailFailureCount++;
          }
        } catch (emailError) {
          console.error(`[Launch Notification] Email error for ${owner.email}:`, emailError);
          results.emailFailureCount++;
        }
      }
      
      console.log(`[Launch Notification] Email: ${results.emailSuccessCount} success, ${results.emailFailureCount} failed`);
      
      // Update broadcast record with results
      const totalSuccess = results.pushSuccessCount + results.emailSuccessCount;
      const totalFailure = results.pushFailureCount + results.emailFailureCount;
      
      await storage.updateNotificationBroadcast(broadcast.id, {
        status: totalSuccess > 0 ? 'sent' : 'failed',
        recipientCount: totalSuccess,
        providerResponse: {
          pushSuccessCount: results.pushSuccessCount,
          pushFailureCount: results.pushFailureCount,
          emailSuccessCount: results.emailSuccessCount,
          emailFailureCount: results.emailFailureCount,
          totalPetOwners: results.totalPetOwners,
          note: 'Launch notification - Push + Email only (NO WhatsApp)'
        },
        sentAt: new Date()
      });
      
      // Create audit log
      await storage.createAuditLog({
        entityType: 'notification_broadcast',
        entityId: broadcast.id,
        action: 'send_launch_notification',
        userId: userId,
        changes: {
          type: 'launch_notification',
          pushSuccessCount: results.pushSuccessCount,
          pushFailureCount: results.pushFailureCount,
          emailSuccessCount: results.emailSuccessCount,
          emailFailureCount: results.emailFailureCount,
          totalPetOwners: results.totalPetOwners
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.status(201).json({
        success: true,
        broadcastId: broadcast.id,
        results: {
          push: {
            success: results.pushSuccessCount,
            failed: results.pushFailureCount,
            total: pushTokens.length
          },
          email: {
            success: results.emailSuccessCount,
            failed: results.emailFailureCount,
            total: petOwnerEmails.length
          },
          totalNotified: totalSuccess
        },
        message: `Launch notification sent to ${totalSuccess} pet owners (${results.pushSuccessCount} push, ${results.emailSuccessCount} email)`
      });
    } catch (error: any) {
      console.error("[Launch Notification] Error:", error);
      res.status(500).json({ error: error.message || "Failed to send launch notification" });
    }
  });
  
  // Admin: Get recent notification broadcasts (legacy endpoint for backwards compatibility)
  app.get("/api/admin/notifications/history", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const broadcasts = await storage.getRecentNotificationBroadcasts(limit);
      res.json(broadcasts);
    } catch (error: any) {
      console.error("Error fetching notification history:", error);
      res.status(500).json({ error: error.message || "Failed to fetch history" });
    }
  });

  // ===== ADMIN ANALYTICS ROUTES =====
  
  // Admin: Get analytics overview (summary metrics)
  app.get("/api/admin/analytics/overview", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const overview = await storage.getAnalyticsOverview();
      res.json(overview);
    } catch (error: any) {
      console.error("Error fetching analytics overview:", error);
      res.status(500).json({ error: error.message || "Failed to fetch analytics overview" });
    }
  });

  // Admin: Get emergency request trends
  app.get("/api/admin/analytics/emergency-trends", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const days = Math.min(Math.max(parseInt(req.query.days as string) || 30, 1), 365);
      const trends = await storage.getEmergencyTrends(days);
      res.json(trends);
    } catch (error: any) {
      console.error("Error fetching emergency trends:", error);
      res.status(500).json({ error: error.message || "Failed to fetch emergency trends" });
    }
  });

  // Admin: Get user activity trends
  app.get("/api/admin/analytics/user-activity", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const days = Math.min(Math.max(parseInt(req.query.days as string) || 30, 1), 365);
      const activity = await storage.getUserActivityTrends(days);
      res.json(activity);
    } catch (error: any) {
      console.error("Error fetching user activity:", error);
      res.status(500).json({ error: error.message || "Failed to fetch user activity" });
    }
  });

  // Firebase config endpoint for service worker
  app.get("/api/config/firebase", (req, res) => {
    res.json({
      apiKey: process.env.VITE_FIREBASE_API_KEY || '',
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.VITE_FIREBASE_APP_ID || '',
    });
  });

  // ===== TYPHOON & HOLIDAY PROTOCOL ROUTES =====
  
  // Get current typhoon/holiday status with hospital availability
  app.get("/api/typhoon/status", async (req, res) => {
    try {
      // Get current active typhoon alert
      const currentAlert = await storage.getActiveTyphoonAlert();
      
      // Get upcoming holiday (within next 7 days)
      const upcomingHoliday = await storage.getUpcomingHoliday(7);
      
      // Get hospital emergency statuses
      let hospitalStatuses: any[] = [];
      if (currentAlert || upcomingHoliday) {
        const referenceId = currentAlert?.id || upcomingHoliday?.id;
        if (referenceId) {
          hospitalStatuses = await storage.getHospitalEmergencyStatuses(referenceId);
        }
      }
      
      res.json({
        currentAlert,
        upcomingHoliday,
        hospitalStatuses,
        lastUpdated: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Error fetching typhoon status:", error);
      res.status(500).json({ error: error.message || "Failed to fetch typhoon status" });
    }
  });
  
  // Hospital staff: Update emergency status
  app.post("/api/typhoon/hospital-status", isAuthenticated, async (req: any, res) => {
    try {
      const { hospitalId, isOpen, openingTime, closingTime, notes, statusType, referenceId } = req.body;
      
      const status = await storage.updateHospitalEmergencyStatus({
        hospitalId,
        statusType: statusType || 'typhoon',
        referenceId,
        isOpen,
        openingTime,
        closingTime,
        confirmedBy: req.user.id,
        confirmationMethod: 'self_report',
        notes,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
      });
      
      res.json({ success: true, status });
    } catch (error: any) {
      console.error("Error updating hospital emergency status:", error);
      res.status(500).json({ error: error.message || "Failed to update status" });
    }
  });
  
  // Subscribe to emergency alerts
  app.post("/api/typhoon/subscribe", async (req, res) => {
    try {
      const { email, phone, pushToken, subscriptionType, notifyChannels, preferredLanguage, userId } = req.body;
      
      const subscription = await storage.createEmergencySubscription({
        userId: userId || null,
        email,
        phone,
        pushToken,
        subscriptionType: subscriptionType || 'all',
        notifyChannels: notifyChannels || ['push'],
        preferredLanguage: preferredLanguage || 'en',
      });
      
      res.json({ success: true, subscription });
    } catch (error: any) {
      console.error("Error creating emergency subscription:", error);
      res.status(500).json({ error: error.message || "Failed to create subscription" });
    }
  });
  
  // Manually trigger typhoon sync (for testing/admin)
  app.get("/api/typhoon/sync", async (req, res) => {
    try {
      console.log('[Typhoon Sync] Manual sync triggered');
      const result = await checkAndUpdateTyphoonStatus();
      
      res.json({
        success: true,
        ...result,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Error syncing typhoon status:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to sync typhoon status" 
      });
    }
  });

  // Fetch raw HKO data without database update (for debugging)
  app.get("/api/typhoon/hko-raw", async (req, res) => {
    try {
      const data = await fetchTyphoonWarning();
      res.json({
        success: true,
        hasActiveSignal: data !== null,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Error fetching HKO data:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to fetch HKO data" 
      });
    }
  });
  
  // Get HK holidays for a year
  app.get("/api/holidays", async (req, res) => {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const holidays = await storage.getHolidaysByYear(year);
      res.json(holidays);
    } catch (error: any) {
      console.error("Error fetching holidays:", error);
      res.status(500).json({ error: error.message || "Failed to fetch holidays" });
    }
  });
  
  // Admin: Create typhoon alert (usually triggered by HKO API integration)
  app.post("/api/admin/typhoon/alert", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { signalCode, signalNameEn, signalNameZh, issuedAt, severityLevel, notes, observatoryBulletinId } = req.body;
      
      const alert = await storage.createTyphoonAlert({
        signalCode,
        signalNameEn,
        signalNameZh,
        issuedAt: new Date(issuedAt),
        severityLevel,
        notes,
        observatoryBulletinId,
        isActive: true,
      });
      
      res.json({ success: true, alert });
    } catch (error: any) {
      console.error("Error creating typhoon alert:", error);
      res.status(500).json({ error: error.message || "Failed to create alert" });
    }
  });
  
  // Admin: Lift typhoon alert
  app.post("/api/admin/typhoon/lift/:alertId", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { alertId } = req.params;
      const alert = await storage.liftTyphoonAlert(alertId);
      res.json({ success: true, alert });
    } catch (error: any) {
      console.error("Error lifting typhoon alert:", error);
      res.status(500).json({ error: error.message || "Failed to lift alert" });
    }
  });

  // ===== VET CONSULTANTS & CONTENT VERIFICATION ENDPOINTS =====
  
  // List all public, active vet consultants with their verified content
  app.get("/api/consultants", async (req, res) => {
    try {
      const consultants = await storage.getVetConsultants();
      
      // Fetch verified content for each consultant
      const consultantsWithContent = await Promise.all(
        consultants.map(async (consultant) => {
          const withContent = await storage.getVetConsultantWithContent(consultant.id);
          return withContent || { ...consultant, verifiedContent: [] };
        })
      );
      
      res.json(consultantsWithContent);
    } catch (error: any) {
      console.error("Error fetching consultants:", error);
      res.status(500).json({ error: error.message || "Failed to fetch consultants" });
    }
  });

  // Get a single consultant with their verified content
  app.get("/api/consultants/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const consultant = await storage.getVetConsultantWithContent(id);
      
      if (!consultant) {
        return res.status(404).json({ error: "Consultant not found" });
      }
      
      // Only return public, active consultants
      if (!consultant.isActive || !consultant.isPublic) {
        return res.status(404).json({ error: "Consultant not found" });
      }
      
      res.json(consultant);
    } catch (error: any) {
      console.error("Error fetching consultant:", error);
      res.status(500).json({ error: error.message || "Failed to fetch consultant" });
    }
  });

  // Get verification info for a specific content item by slug
  app.get("/api/content/:slug/verification", async (req, res) => {
    try {
      const { slug } = req.params;
      const verification = await storage.getContentVerification(slug);
      
      if (!verification) {
        return res.status(404).json({ error: "Content not found" });
      }
      
      // Return verification info
      res.json({
        contentSlug: verification.contentSlug,
        contentType: verification.contentType,
        titleEn: verification.titleEn,
        titleZh: verification.titleZh,
        isVerified: verification.verifier !== null,
        verifier: verification.verifier ? {
          id: verification.verifier.id,
          nameEn: verification.verifier.nameEn,
          nameZh: verification.verifier.nameZh,
          titleEn: verification.verifier.titleEn,
          titleZh: verification.verifier.titleZh,
          specialtyEn: verification.verifier.specialtyEn,
          specialtyZh: verification.verifier.specialtyZh,
          photoUrl: verification.verifier.photoUrl,
        } : null,
        verifiedAt: verification.verifiedAt,
      });
    } catch (error: any) {
      console.error("Error fetching content verification:", error);
      res.status(500).json({ error: error.message || "Failed to fetch verification info" });
    }
  });

  // ===== VET APPLICATIONS ENDPOINTS =====

  // Public: Create a new vet application
  app.post("/api/vet-applications", async (req, res) => {
    try {
      const validatedData = insertVetApplicationSchema.parse(req.body);
      const application = await storage.createVetApplication(validatedData);
      res.status(201).json(application);
    } catch (error: any) {
      console.error("Error creating vet application:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid application data", details: error.errors });
      }
      res.status(500).json({ error: error.message || "Failed to create application" });
    }
  });

  // Admin: List all vet applications
  app.get("/api/admin/vet-applications", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { status } = req.query;
      const applications = await storage.getVetApplications(status as string | undefined);
      res.json(applications);
    } catch (error: any) {
      console.error("Error fetching vet applications:", error);
      res.status(500).json({ error: error.message || "Failed to fetch applications" });
    }
  });

  // Admin: Get a single vet application
  app.get("/api/admin/vet-applications/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const application = await storage.getVetApplicationById(id);
      
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      res.json(application);
    } catch (error: any) {
      console.error("Error fetching vet application:", error);
      res.status(500).json({ error: error.message || "Failed to fetch application" });
    }
  });

  // Admin: Update vet application status
  app.patch("/api/admin/vet-applications/:id/status", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, reviewNotes } = req.body;
      
      if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be one of: pending, approved, rejected" });
      }
      
      const application = await storage.updateVetApplicationStatus(
        id, 
        status, 
        req.user.id, 
        reviewNotes
      );
      
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      res.json(application);
    } catch (error: any) {
      console.error("Error updating vet application status:", error);
      res.status(500).json({ error: error.message || "Failed to update application status" });
    }
  });

  // Admin: Approve vet application and create consultant
  app.post("/api/admin/vet-applications/:id/approve", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { reviewNotes } = req.body;
      
      const result = await storage.approveVetApplication(id, req.user.id, reviewNotes);
      res.json(result);
    } catch (error: any) {
      console.error("Error approving vet application:", error);
      res.status(500).json({ error: error.message || "Failed to approve application" });
    }
  });

  // Admin: Send Thank You WhatsApp message to applicant
  app.post("/api/admin/vet-applications/:id/send-thank-you", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Get application details
      const application = await storage.getVetApplicationById(id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      
      const phoneNumber = application.phoneWhatsapp || application.phone;
      if (!phoneNumber) {
        return res.status(400).json({ error: "No phone number available for this applicant" });
      }
      
      // Send Thank You message via WhatsApp using the messaging service
      // Use the consultant_thank_you template
      const result = await messagingService.sendThankYouMessage(phoneNumber, application.fullName || 'Valued Professional');
      
      res.json({ 
        success: true, 
        message: "Thank you message sent successfully",
        messageId: result.messageId 
      });
    } catch (error: any) {
      console.error("Error sending thank you message:", error);
      res.status(500).json({ error: error.message || "Failed to send thank you message" });
    }
  });

  // Admin: Create consultant manually
  app.post("/api/admin/consultants", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const validatedData = insertVetConsultantSchema.parse(req.body);
      const consultant = await storage.createVetConsultant(validatedData);
      res.status(201).json(consultant);
    } catch (error: any) {
      console.error("Error creating consultant:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid consultant data", details: error.errors });
      }
      res.status(500).json({ error: error.message || "Failed to create consultant" });
    }
  });

  // Admin: Update consultant
  app.patch("/api/admin/consultants/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const consultant = await storage.updateVetConsultant(id, req.body);
      
      if (!consultant) {
        return res.status(404).json({ error: "Consultant not found" });
      }
      
      res.json(consultant);
    } catch (error: any) {
      console.error("Error updating consultant:", error);
      res.status(500).json({ error: error.message || "Failed to update consultant" });
    }
  });

  // Admin: Delete consultant
  app.delete("/api/admin/consultants/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteVetConsultant(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Consultant not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting consultant:", error);
      res.status(500).json({ error: error.message || "Failed to delete consultant" });
    }
  });

  // Admin: Create content verification link
  app.post("/api/admin/content-verifications", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const validatedData = insertContentVerificationSchema.parse(req.body);
      const verification = await storage.createContentVerification(validatedData);
      res.status(201).json(verification);
    } catch (error: any) {
      console.error("Error creating content verification:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid verification data", details: error.errors });
      }
      res.status(500).json({ error: error.message || "Failed to create verification" });
    }
  });

  // Admin: Delete content verification
  app.delete("/api/admin/content-verifications/:consultantId/:contentId", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { consultantId, contentId } = req.params;
      const deleted = await storage.deleteContentVerification(consultantId, contentId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Verification link not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting content verification:", error);
      res.status(500).json({ error: error.message || "Failed to delete verification" });
    }
  });

  // Admin: List all verified content items
  app.get("/api/admin/verified-content", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const contentItems = await storage.getVerifiedContentItems();
      res.json(contentItems);
    } catch (error: any) {
      console.error("Error fetching verified content items:", error);
      res.status(500).json({ error: error.message || "Failed to fetch verified content items" });
    }
  });

  // ===== BLOG API ENDPOINTS =====
  // Public API for blog statistics - midnight emergency fee guide
  app.get("/api/blog/midnight-fees", async (req, res) => {
    try {
      const allHospitalsRaw = await storage.getAllHospitals();
      // Filter to only 24-hour hospitals
      const allHospitals = allHospitalsRaw.filter(h => h.open247);
      
      // Filter hospitals with valid midnight fees and sort by fee
      const hospitalsWithFees = allHospitals
        .filter(h => h.consultFeeMidnight !== null && h.consultFeeMidnight !== undefined)
        .sort((a, b) => (a.consultFeeMidnight || 0) - (b.consultFeeMidnight || 0));
      
      // Get all regions for lookup (HK only)
      const regions = await storage.getRegionsByCountry('HK');
      const regionMap = new Map(regions.map(r => [r.id, r]));
      
      // Calculate statistics
      const fees = hospitalsWithFees.map(h => h.consultFeeMidnight!);
      const minFee = fees.length > 0 ? Math.min(...fees) : null;
      const maxFee = fees.length > 0 ? Math.max(...fees) : null;
      
      // Calculate correct median (average of two middle values for even count)
      let medianFee: number | null = null;
      if (fees.length > 0) {
        const mid = Math.floor(fees.length / 2);
        if (fees.length % 2 === 0) {
          medianFee = Math.round((fees[mid - 1] + fees[mid]) / 2);
        } else {
          medianFee = fees[mid];
        }
      }
      
      // Find cheapest hospital
      const cheapestHospital = hospitalsWithFees[0] || null;
      const cheapestRegion = cheapestHospital ? regionMap.get(cheapestHospital.regionId) : null;
      
      // Calculate verified count and get latest verification date
      // Use lastVerifiedAt timestamp as the verification indicator (set by admin)
      const verifiedHospitals = hospitalsWithFees.filter(h => h.lastVerifiedAt);
      const verificationDates = hospitalsWithFees
        .filter(h => h.lastVerifiedAt)
        .map(h => new Date(h.lastVerifiedAt!).getTime());
      const lastVerified = verificationDates.length > 0 
        ? new Date(Math.max(...verificationDates)).toISOString()
        : new Date().toISOString();
      
      // Group hospitals by region for district filtering
      const hospitalsByRegion: Record<string, typeof hospitalsWithFees> = {};
      for (const hospital of hospitalsWithFees) {
        const region = regionMap.get(hospital.regionId);
        const regionName = region?.nameEn || 'Other';
        if (!hospitalsByRegion[regionName]) {
          hospitalsByRegion[regionName] = [];
        }
        hospitalsByRegion[regionName].push(hospital);
      }
      
      // Find cheapest region (by average fee)
      let cheapestDistrictName = null;
      let cheapestDistrictAvg = Infinity;
      for (const [regionName, hospitals] of Object.entries(hospitalsByRegion)) {
        const avgFee = hospitals.reduce((sum, h) => sum + (h.consultFeeMidnight || 0), 0) / hospitals.length;
        if (avgFee < cheapestDistrictAvg) {
          cheapestDistrictAvg = avgFee;
          cheapestDistrictName = regionName;
        }
      }
      
      const stats = {
        minFee,
        maxFee,
        medianFee,
        totalCount: hospitalsWithFees.length,
        verifiedCount: verifiedHospitals.length,
        lastVerified,
        cheapestHospital: cheapestHospital ? {
          nameEn: cheapestHospital.nameEn,
          nameZh: cheapestHospital.nameZh,
          fee: cheapestHospital.consultFeeMidnight,
          region: cheapestRegion?.nameEn || null,
          regionZh: cheapestRegion?.nameZh || null
        } : null,
        cheapestDistrict: cheapestDistrictName,
        depositRange: "$5,000 - $10,000"
      };
      
      // Enrich hospitals with region data
      const enrichedHospitals = hospitalsWithFees.map(h => {
        const region = regionMap.get(h.regionId);
        return {
          id: h.id,
          slug: h.slug,
          nameEn: h.nameEn,
          nameZh: h.nameZh,
          regionId: h.regionId,
          regionNameEn: region?.nameEn || null,
          regionNameZh: region?.nameZh || null,
          consultFeeMidnight: h.consultFeeMidnight,
          consultFeeEvening: h.consultFeeEvening,
          consultFeeDay: h.consultFeeDay,
          midnightSurchargeStart: h.midnightSurchargeStart,
          eveningSurchargeStart: h.eveningSurchargeStart,
          onSiteVet247: h.onSiteVet247,
          open247: h.open247,
          openT8: h.openT8,
          openT10: h.openT10,
          verified: h.verified,
          lastVerifiedAt: h.lastVerifiedAt,
          phone: h.phone,
          whatsapp: h.whatsapp,
          depositBand: h.depositBand,
          admissionDeposit: h.admissionDeposit
        };
      });
      
      res.json({ 
        stats, 
        hospitals: enrichedHospitals,
        regions: regions.map(r => ({ id: r.id, nameEn: r.nameEn, nameZh: r.nameZh }))
      });
    } catch (error: any) {
      console.error("Error fetching midnight fee blog data:", error);
      res.status(500).json({ error: error.message || "Failed to fetch blog data" });
    }
  });

  // Public API for blog statistics - blood bank guide
  app.get("/api/blog/blood-bank", async (req, res) => {
    try {
      const allHospitalsRaw = await storage.getAllHospitals();
      
      // Filter hospitals with blood bank capabilities
      const hospitalsWithBlood = allHospitalsRaw.filter(h => 
        h.bloodTransfusion || h.bloodBankCanine || h.bloodBankFeline
      );
      
      // Get all regions for lookup (HK only)
      const regions = await storage.getRegionsByCountry('HK');
      const regionMap = new Map(regions.map(r => [r.id, r]));
      
      // Calculate statistics
      const canineCount = hospitalsWithBlood.filter(h => h.bloodBankCanine).length;
      const felineCount = hospitalsWithBlood.filter(h => h.bloodBankFeline).length;
      const transfusionCount = hospitalsWithBlood.filter(h => h.bloodTransfusion).length;
      
      // Calculate verified count and get latest verification date
      const verificationDates = hospitalsWithBlood
        .filter(h => h.lastVerifiedAt)
        .map(h => new Date(h.lastVerifiedAt!).getTime());
      const lastVerified = verificationDates.length > 0 
        ? new Date(Math.max(...verificationDates)).toISOString()
        : new Date().toISOString();
      
      // Find top hospital (has both canine AND feline blood banks)
      const fullServiceHospitals = hospitalsWithBlood.filter(h => 
        h.bloodBankCanine && h.bloodBankFeline
      );
      const topHospital = fullServiceHospitals[0] || null;
      const topHospitalRegion = topHospital ? regionMap.get(topHospital.regionId) : null;
      
      const stats = {
        canineCount,
        felineCount,
        transfusionCount,
        totalCount: hospitalsWithBlood.length,
        lastVerified,
        topHospital: topHospital ? {
          nameEn: topHospital.nameEn,
          nameZh: topHospital.nameZh,
          region: topHospitalRegion?.nameEn || null,
          regionZh: topHospitalRegion?.nameZh || null
        } : null
      };
      
      // Enrich hospitals with region data
      const enrichedHospitals = hospitalsWithBlood.map(h => {
        const region = regionMap.get(h.regionId);
        return {
          id: h.id,
          slug: h.slug,
          nameEn: h.nameEn,
          nameZh: h.nameZh,
          regionId: h.regionId,
          regionNameEn: region?.nameEn || null,
          regionNameZh: region?.nameZh || null,
          bloodTransfusion: h.bloodTransfusion,
          bloodBankCanine: h.bloodBankCanine,
          bloodBankFeline: h.bloodBankFeline,
          open247: h.open247,
          verified: h.verified,
          lastVerifiedAt: h.lastVerifiedAt,
          phone: h.phone,
          whatsapp: h.whatsapp
        };
      });
      
      res.json({ 
        stats, 
        hospitals: enrichedHospitals,
        regions: regions.map(r => ({ id: r.id, nameEn: r.nameEn, nameZh: r.nameZh }))
      });
    } catch (error: any) {
      console.error("Error fetching blood bank blog data:", error);
      res.status(500).json({ error: error.message || "Failed to fetch blog data" });
    }
  });

  // Public API for blog statistics - typhoon emergency guide
  app.get("/api/blog/typhoon-guide", async (req, res) => {
    try {
      const allHospitalsRaw = await storage.getAllHospitals();
      
      // Filter to 24-hour hospitals with any typhoon capability
      const hospitalsWithTyphoon = allHospitalsRaw.filter(h => 
        h.open247 && (h.openT8 || h.openT10 || h.openBlackRainstorm)
      );
      
      // Get all regions for lookup (HK only)
      const regions = await storage.getRegionsByCountry('HK');
      const regionMap = new Map(regions.map(r => [r.id, r]));
      
      // Calculate statistics
      const t8Count = hospitalsWithTyphoon.filter(h => h.openT8).length;
      const t10Count = hospitalsWithTyphoon.filter(h => h.openT10).length;
      const blackRainCount = hospitalsWithTyphoon.filter(h => h.openBlackRainstorm).length;
      
      // Get latest verification date
      const verificationDates = hospitalsWithTyphoon
        .filter(h => h.lastVerifiedAt)
        .map(h => new Date(h.lastVerifiedAt!).getTime());
      const lastVerified = verificationDates.length > 0 
        ? new Date(Math.max(...verificationDates)).toISOString()
        : new Date().toISOString();
      
      const stats = {
        t8Count,
        t10Count,
        blackRainCount,
        totalCount: hospitalsWithTyphoon.length,
        lastVerified
      };
      
      // Enrich hospitals with region data
      const enrichedHospitals = hospitalsWithTyphoon.map(h => {
        const region = regionMap.get(h.regionId);
        return {
          id: h.id,
          slug: h.slug,
          nameEn: h.nameEn,
          nameZh: h.nameZh,
          regionId: h.regionId,
          regionNameEn: region?.nameEn || null,
          regionNameZh: region?.nameZh || null,
          openT8: h.openT8,
          openT10: h.openT10,
          openBlackRainstorm: h.openBlackRainstorm,
          liveStatus: h.liveStatus,
          taxiDropoffEn: h.taxiDropoffEn,
          taxiDropoffZh: h.taxiDropoffZh,
          emergencyEntranceEn: h.emergencyEntranceEn,
          emergencyEntranceZh: h.emergencyEntranceZh,
          phone: h.phone,
          whatsapp: h.whatsapp,
          lastVerifiedAt: h.lastVerifiedAt
        };
      });
      
      res.json({ 
        stats, 
        hospitals: enrichedHospitals,
        regions: regions.map(r => ({ id: r.id, nameEn: r.nameEn, nameZh: r.nameZh }))
      });
    } catch (error: any) {
      console.error("Error fetching typhoon guide blog data:", error);
      res.status(500).json({ error: error.message || "Failed to fetch blog data" });
    }
  });

  // Public API for blog statistics - imaging diagnostics guide
  app.get("/api/blog/imaging-diagnostics", async (req, res) => {
    try {
      const allHospitalsRaw = await storage.getAllHospitals();
      
      // Filter to hospitals with any imaging capability
      const hospitalsWithImaging = allHospitalsRaw.filter(h => 
        h.imagingCT || h.imagingMRI || h.imagingXray || h.imagingUS
      );
      
      // Get all regions for lookup (HK only)
      const regions = await storage.getRegionsByCountry('HK');
      const regionMap = new Map(regions.map(r => [r.id, r]));
      
      // Calculate statistics
      const ctCount = hospitalsWithImaging.filter(h => h.imagingCT).length;
      const mriCount = hospitalsWithImaging.filter(h => h.imagingMRI).length;
      const xrayCount = hospitalsWithImaging.filter(h => h.imagingXray).length;
      const usCount = hospitalsWithImaging.filter(h => h.imagingUS).length;
      
      // Get latest verification date
      const verificationDates = hospitalsWithImaging
        .filter(h => h.lastVerifiedAt)
        .map(h => new Date(h.lastVerifiedAt!).getTime());
      const lastVerified = verificationDates.length > 0 
        ? new Date(Math.max(...verificationDates)).toISOString()
        : new Date().toISOString();
      
      const stats = {
        ctCount,
        mriCount,
        xrayCount,
        usCount,
        totalCount: hospitalsWithImaging.length,
        lastVerified
      };
      
      // Enrich hospitals with region data
      const enrichedHospitals = hospitalsWithImaging.map(h => {
        const region = regionMap.get(h.regionId);
        return {
          id: h.id,
          slug: h.slug,
          nameEn: h.nameEn,
          nameZh: h.nameZh,
          regionId: h.regionId,
          regionNameEn: region?.nameEn || null,
          regionNameZh: region?.nameZh || null,
          imagingCT: h.imagingCT,
          imagingMRI: h.imagingMRI,
          imagingXray: h.imagingXray,
          imagingUS: h.imagingUS,
          sameDayCT: h.sameDayCT,
          open247: h.open247,
          liveStatus: h.liveStatus,
          phone: h.phone,
          whatsapp: h.whatsapp,
          lastVerifiedAt: h.lastVerifiedAt
        };
      });
      
      res.json({ 
        stats, 
        hospitals: enrichedHospitals,
        regions: regions.map(r => ({ id: r.id, nameEn: r.nameEn, nameZh: r.nameZh }))
      });
    } catch (error: any) {
      console.error("Error fetching imaging diagnostics blog data:", error);
      res.status(500).json({ error: error.message || "Failed to fetch blog data" });
    }
  });

  app.get("/api/blog/exotic-emergency", async (req, res) => {
    try {
      const allHospitalsRaw = await storage.getAllHospitals();
      
      const hospitalsWithExotic = allHospitalsRaw.filter(h => 
        h.open247 && (
          h.exoticVet247 === true || 
          (h.exoticSpecies247 && Array.isArray(h.exoticSpecies247) && h.exoticSpecies247.length > 0)
        )
      );
      
      const regions = await storage.getRegionsByCountry('HK');
      const regionMap = new Map(regions.map(r => [r.id, r]));
      
      const exoticVet247Count = hospitalsWithExotic.filter(h => h.exoticVet247 === true).length;
      
      const allSpecies = new Set<string>();
      hospitalsWithExotic.forEach(h => {
        if (h.exoticSpecies247 && Array.isArray(h.exoticSpecies247)) {
          h.exoticSpecies247.forEach(species => allSpecies.add(species));
        }
      });
      
      let topHospital = null;
      let maxSpeciesCount = 0;
      hospitalsWithExotic.forEach(h => {
        const speciesCount = h.exoticSpecies247?.length || 0;
        if (speciesCount > maxSpeciesCount) {
          maxSpeciesCount = speciesCount;
          topHospital = {
            id: h.id,
            nameEn: h.nameEn,
            nameZh: h.nameZh,
            speciesCount
          };
        }
      });
      
      const verificationDates = hospitalsWithExotic
        .filter(h => h.lastVerifiedAt)
        .map(h => new Date(h.lastVerifiedAt!).getTime());
      const lastVerified = verificationDates.length > 0 
        ? new Date(Math.max(...verificationDates)).toISOString()
        : new Date().toISOString();
      
      const stats = {
        exoticVet247Count,
        totalCount: hospitalsWithExotic.length,
        speciesSupported: Array.from(allSpecies),
        lastVerified,
        topHospital
      };
      
      const enrichedHospitals = hospitalsWithExotic.map(h => {
        const region = regionMap.get(h.regionId);
        return {
          id: h.id,
          slug: h.slug,
          nameEn: h.nameEn,
          nameZh: h.nameZh,
          regionId: h.regionId,
          regionNameEn: region?.nameEn || null,
          regionNameZh: region?.nameZh || null,
          exoticVet247: h.exoticVet247,
          exoticSpecies247: h.exoticSpecies247 || [],
          open247: h.open247,
          liveStatus: h.liveStatus,
          phone: h.phone,
          whatsapp: h.whatsapp,
          lastVerifiedAt: h.lastVerifiedAt
        };
      });
      
      res.json({ 
        stats, 
        hospitals: enrichedHospitals,
        regions: regions.map(r => ({ id: r.id, nameEn: r.nameEn, nameZh: r.nameZh }))
      });
    } catch (error: any) {
      console.error("Error fetching exotic emergency blog data:", error);
      res.status(500).json({ error: error.message || "Failed to fetch blog data" });
    }
  });

  // Manually trigger daily report email (admin only)
  app.post("/api/admin/daily-report/send", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { sendDailyReport } = await import("./services/daily-report");
      const result = await sendDailyReport();
      if (result.success) {
        res.json({ success: true, message: "Daily report email sent successfully" });
      } else {
        res.status(500).json({ success: false, message: result.error || "Failed to send report" });
      }
    } catch (error) {
      console.error("Error sending daily report email:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Daily Emergency Report (admin only) - grouped by hospital
  app.get("/api/admin/daily-report", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const dateParam = req.query.date as string;
      const reportDate = dateParam ? new Date(dateParam) : new Date();

      // Build start/end of day bounds
      const startOfDay = new Date(reportDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(reportDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Fetch all emergency requests and filter by date
      const allRequests = await storage.getAllEmergencyRequests();
      const dayRequests = allRequests.filter(r => {
        const created = new Date(r.createdAt);
        return created >= startOfDay && created <= endOfDay;
      });

      // Fetch hospitals map
      const allHospitals = await storage.getAllHospitals();
      const hospitalMap: Record<string, any> = {};
      for (const h of allHospitals) {
        hospitalMap[h.id] = h;
      }

      // For each request, get all messages (broadcasts to hospitals)
      const hospitalEnquiriesMap: Record<string, any> = {};

      for (const request of dayRequests) {
        const messages = await storage.getMessagesByEmergencyRequest(request.id);

        // Group messages by hospital
        for (const msg of messages) {
          const hospitalId = msg.hospitalId;
          if (!hospitalEnquiriesMap[hospitalId]) {
            const hospital = hospitalMap[hospitalId];
            hospitalEnquiriesMap[hospitalId] = {
              hospitalId,
              hospitalNameEn: hospital?.nameEn || 'Unknown Hospital',
              hospitalNameZh: hospital?.nameZh || '',
              hospitalAddress: hospital?.addressEn || '',
              hospitalPhone: hospital?.phone || '',
              hospitalWhatsapp: hospital?.whatsapp || '',
              enquiries: [],
            };
          }

          // Avoid duplicate enquiry entries for same request+hospital
          const alreadyAdded = hospitalEnquiriesMap[hospitalId].enquiries.find(
            (e: any) => e.requestId === request.id
          );
          if (!alreadyAdded) {
            hospitalEnquiriesMap[hospitalId].enquiries.push({
              requestId: request.id,
              time: request.createdAt,
              symptom: request.symptom,
              aiAnalyzedSymptoms: request.aiAnalyzedSymptoms,
              location: request.manualLocation || (
                request.locationLatitude && request.locationLongitude
                  ? `${request.locationLatitude}, ${request.locationLongitude}`
                  : null
              ),
              contactName: request.contactName,
              contactPhone: request.contactPhone,
              petSpecies: request.petSpecies,
              petBreed: request.petBreed,
              petAge: request.petAge,
              requestStatus: request.status,
              messageStatus: msg.status,
              messageType: msg.messageType,
              sentAt: msg.sentAt,
              deliveredAt: msg.deliveredAt,
              readAt: msg.readAt,
            });
          }
        }
      }

      const hospitalReports = Object.values(hospitalEnquiriesMap).sort((a: any, b: any) =>
        a.hospitalNameEn.localeCompare(b.hospitalNameEn)
      );

      res.json({
        date: startOfDay.toISOString().split('T')[0],
        totalEnquiries: dayRequests.length,
        totalHospitalsContacted: hospitalReports.length,
        hospitalReports,
      });
    } catch (error) {
      console.error("Error generating daily report:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
