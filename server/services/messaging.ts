import { storage } from "../storage";
import type { InsertMessage, Message } from "@shared/schema";
import { sendGmailEmail } from "../gmail-client";
import { Client as LineClient } from '@line/bot-sdk';

// WhatsApp Business API configuration
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v21.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// LINE Messaging API configuration
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;

// Email configuration (will be set up via integration)
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@petemergency.com';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

// Helper to get the application base URL consistently
function getBaseUrl(): string {
  // Priority: explicit BASE_URL > Replit deployment domain > dev domain > production default
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }
  if (process.env.REPLIT_DOMAINS) {
    // Use the first domain from comma-separated list
    return `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`;
  }
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  // Production fallback - matches the canonical domain in index.html
  return 'https://petsos.site';
}

/**
 * Server-side reverse geocoding via OpenStreetMap Nominatim.
 * Converts lat/lng to a readable address. Returns null on failure.
 */
async function reverseGeocodeServer(lat: number | string, lng: number | string, language: string = 'en'): Promise<string | null> {
  try {
    const langHeader = language === 'zh-HK' ? 'zh-HK,zh;q=0.9,en;q=0.5' : 'en-US,en;q=0.9';
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=17&addressdetails=1&accept-language=${encodeURIComponent(langHeader)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'PetSOS/1.0 (petsos.site)' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data: any = await res.json();
    if (!data?.address) return null;
    const a = data.address;
    const parts: string[] = [];
    const building = a.building || a.amenity || a.shop || '';
    const road = a.road || a.pedestrian || '';
    const houseNo = a.house_number || '';
    const district = a.city_district || a.suburb || a.quarter || a.neighbourhood || '';
    const city = a.city || a.town || '';
    if (building) parts.push(building);
    if (road) parts.push(houseNo ? `${houseNo} ${road}` : road);
    if (district) parts.push(district);
    if (city && city !== district) parts.push(city);
    return parts.length > 0 ? parts.join(', ') : data.display_name || null;
  } catch {
    return null;
  }
}

// ⚠️ TESTING MODE - REMOVE AFTER TESTING
// When enabled, all WhatsApp messages will be sent to these test numbers instead of actual clinic numbers
const TESTING_MODE = false; // Disabled for App Review video recording
const TEST_PHONE_NUMBERS = ['85265727136', '85255375152']; // Format: country code + number (no + or -)
let testNumberIndex = 0;

interface SendMessageOptions {
  emergencyRequestId: string;
  hospitalId: string;
  recipient: string;
  messageType: 'whatsapp' | 'email' | 'line';
  content: string;
}

interface WhatsAppSendResult {
  success: boolean;
  messageId?: string; // Meta's wamid for tracking delivery status
  error?: string;
}

export class MessagingService {
  
  /**
   * Send a WhatsApp template message using approved Meta templates
   */
  private async sendWhatsAppTemplateMessage(
    phoneNumber: string,
    templateName: string,
    templateVariables: string[]
  ): Promise<WhatsAppSendResult> {
    console.log('[WhatsApp Template] Attempting to send template message...');
    console.log('[WhatsApp Template] Template:', templateName);
    console.log('[WhatsApp Template] Variables count:', templateVariables.length);
    console.log('[WhatsApp Template] Has Access Token:', !!WHATSAPP_ACCESS_TOKEN);
    console.log('[WhatsApp Template] Has Phone Number ID:', !!WHATSAPP_PHONE_NUMBER_ID);
    
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      console.error('[WhatsApp Template] Credentials not configured - missing token or phone number ID');
      return { success: false, error: 'WhatsApp credentials not configured' };
    }

    // Validate phone number
    let cleanedNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanedNumber || cleanedNumber.length < 8) {
      console.error('[WhatsApp Template] Invalid phone number:', phoneNumber);
      return { success: false, error: 'Invalid phone number' };
    }

    // TESTING MODE: Override recipient with test numbers for template messages too
    if (TESTING_MODE) {
      const originalNumber = cleanedNumber;
      cleanedNumber = TEST_PHONE_NUMBERS[testNumberIndex % TEST_PHONE_NUMBERS.length];
      testNumberIndex++;
      console.log(`[TESTING MODE] Redirecting WhatsApp template from ${originalNumber} to test number: ${cleanedNumber}`);
    }

    try {
      const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
      
      // Build template component parameters
      const parameters = templateVariables.map(value => ({
        type: 'text',
        text: value
      }));
      
      const payload = {
        messaging_product: 'whatsapp',
        to: cleanedNumber,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: templateName.endsWith('_zh_hk') ? 'zh_HK' : 'en'
          },
          components: [
            {
              type: 'body',
              parameters: parameters
            }
          ]
        }
      };
      
      console.log('[WhatsApp Template] Request payload:', JSON.stringify(payload, null, 2));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('[WhatsApp Template] Response status:', response.status);
      
      if (!response.ok) {
        const error = await response.text();
        console.error('[WhatsApp Template] API error response:', error);
        let errorMessage = error;
        try {
          const errorJson = JSON.parse(error);
          console.error('[WhatsApp Template] Parsed error:', JSON.stringify(errorJson, null, 2));
          errorMessage = errorJson?.error?.message || error;
        } catch (e) {
          // Error wasn't JSON
        }
        return { success: false, error: errorMessage };
      }

      const result = await response.json();
      const messageId = result.messages?.[0]?.id;
      console.log('[WhatsApp Template] Message sent successfully!');
      console.log('[WhatsApp Template] API Response:', JSON.stringify(result, null, 2));
      console.log('[WhatsApp Template] Message ID:', messageId);
      return { success: true, messageId };
    } catch (error) {
      console.error('[WhatsApp Template] Error sending message:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send a message via WhatsApp Business API (legacy plain text - for fallback only)
   */
  private async sendWhatsAppMessage(phoneNumber: string, content: string): Promise<WhatsAppSendResult> {
    console.log('[WhatsApp] Attempting to send message...');
    console.log('[WhatsApp] Has Access Token:', !!WHATSAPP_ACCESS_TOKEN);
    console.log('[WhatsApp] Has Phone Number ID:', !!WHATSAPP_PHONE_NUMBER_ID);
    console.log('[WhatsApp] API URL:', WHATSAPP_API_URL);
    
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      console.error('[WhatsApp] Credentials not configured - missing token or phone number ID');
      return { success: false, error: 'WhatsApp credentials not configured' };
    }

    // ⚠️ TESTING MODE: Override recipient with test numbers
    let actualRecipient = phoneNumber;
    if (TESTING_MODE) {
      actualRecipient = TEST_PHONE_NUMBERS[testNumberIndex % TEST_PHONE_NUMBERS.length];
      testNumberIndex++;
      console.log(`[TESTING MODE] Redirecting WhatsApp from ${phoneNumber} to test number: ${actualRecipient}`);
      
      // Add note to message content that this is a test
      content = `[TEST MESSAGE]\nOriginal recipient: ${phoneNumber}\n\n${content}`;
    }

    // Validate phone number (must be non-empty and contain only digits after removing common formatting)
    const cleanedNumber = actualRecipient.replace(/[^0-9]/g, '');
    if (!cleanedNumber || cleanedNumber.length < 8) {
      console.error('[WhatsApp] Invalid phone number:', actualRecipient);
      return { success: false, error: 'Invalid phone number' };
    }

    try {
      const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
      console.log('[WhatsApp] Sending to URL:', url);
      console.log('[WhatsApp] Recipient (original):', phoneNumber);
      console.log('[WhatsApp] Recipient (cleaned):', cleanedNumber);
      console.log('[WhatsApp] Actual recipient:', actualRecipient);
      
      const payload = {
        messaging_product: 'whatsapp',
        to: cleanedNumber, // Use cleaned number without dashes
        type: 'text',
        text: { body: content },
      };
      
      console.log('[WhatsApp] Request payload:', JSON.stringify(payload, null, 2));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('[WhatsApp] Response status:', response.status);
      
      if (!response.ok) {
        const error = await response.text();
        console.error('[WhatsApp] API error response:', error);
        let errorMessage = error;
        try {
          const errorJson = JSON.parse(error);
          console.error('[WhatsApp] Parsed error:', JSON.stringify(errorJson, null, 2));
          errorMessage = errorJson?.error?.message || error;
        } catch (e) {
          // Error wasn't JSON
        }
        return { success: false, error: errorMessage };
      }

      const result = await response.json();
      const messageId = result.messages?.[0]?.id;
      console.log('[WhatsApp] Message sent successfully!');
      console.log('[WhatsApp] API Response:', JSON.stringify(result, null, 2));
      console.log('[WhatsApp] Message ID:', messageId);
      console.log('[WhatsApp] WhatsApp ID:', result.contacts?.[0]?.wa_id);
      return { success: true, messageId };
    } catch (error) {
      console.error('[WhatsApp] Error sending message:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send an email (fallback method) using Gmail
   */
  private async sendEmail(to: string, subject: string, content: string): Promise<boolean> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      console.error('Invalid email address:', to);
      return false;
    }
    
    try {
      // Use Gmail integration to send email
      return await sendGmailEmail(to, subject, content, EMAIL_FROM);
    } catch (error) {
      console.error('[EMAIL] Gmail send error:', error);
      return false;
    }
  }

  /**
   * Send a LINE message using LINE Messaging API
   */
  private async sendLineMessage(lineUserId: string, content: string): Promise<boolean> {
    console.log('[LINE] Attempting to send message...');
    console.log('[LINE] Has Access Token:', !!LINE_CHANNEL_ACCESS_TOKEN);
    console.log('[LINE] Has Channel Secret:', !!LINE_CHANNEL_SECRET);
    
    if (!LINE_CHANNEL_ACCESS_TOKEN || !LINE_CHANNEL_SECRET) {
      console.error('[LINE] Credentials not configured - missing token or secret');
      return false;
    }

    // Validate LINE user ID
    if (!lineUserId || lineUserId.trim().length === 0) {
      console.error('[LINE] Invalid LINE user ID:', lineUserId);
      return false;
    }

    try {
      // Initialize LINE client
      const lineClient = new LineClient({
        channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
        channelSecret: LINE_CHANNEL_SECRET,
      });

      // Send text message
      await lineClient.pushMessage(lineUserId, {
        type: 'text',
        text: content,
      });

      console.log('[LINE] Message sent successfully!');
      console.log('[LINE] Recipient User ID:', lineUserId);
      return true;
    } catch (error) {
      console.error('[LINE] Error sending message:', error);
      return false;
    }
  }

  /**
   * Send a message with automatic fallback
   */
  async sendMessage(options: SendMessageOptions): Promise<Message> {
    const { emergencyRequestId, hospitalId, recipient, messageType, content } = options;

    // Create message record
    const message = await storage.createMessage({
      emergencyRequestId,
      hospitalId,
      recipient,
      messageType,
      content,
      status: 'queued',
    });

    // Try to send immediately
    await this.processMessage(message.id);

    return message;
  }

  /**
   * Process a queued message
   * Uses atomic state transitions to prevent duplicate sends
   */
  async processMessage(messageId: string): Promise<void> {
    const message = await storage.getMessage(messageId);
    if (!message) {
      console.error('Message not found:', messageId);
      return;
    }

    // Guard: Only process queued messages (prevent duplicate sends)
    // Also allow retrying failed messages that haven't exceeded max retries
    if (message.status === 'in_progress') {
      console.log('[Process Message] Message already in progress, skipping:', messageId);
      return;
    }
    if (message.status === 'sent' || message.status === 'delivered' || message.status === 'read') {
      console.log('[Process Message] Message already sent/delivered, skipping:', messageId);
      return;
    }
    if (message.status === 'failed' && message.retryCount >= MAX_RETRIES) {
      console.log('[Process Message] Max retries exceeded, skipping:', messageId);
      return;
    }
    if (message.status !== 'queued' && message.status !== 'failed') {
      console.log('[Process Message] Invalid status for processing:', message.status);
      return;
    }

    // Atomically set status to 'in_progress' before sending
    await storage.updateMessage(messageId, { status: 'in_progress' });

    try {
      let success = false;
      let whatsappMessageId: string | undefined;
      let errorMessage: string | undefined;

      if (message.messageType === 'whatsapp') {
        // Check if template data is persisted (preferred) or needs to be extracted from content
        if (message.templateName && message.templateVariables) {
          // Use persisted template data (immutable - won't change if emergency request is edited)
          console.log('[Process Message] Using persisted template data:', message.templateName);
          const result = await this.sendWhatsAppTemplateMessage(
            message.recipient,
            message.templateName,
            message.templateVariables as string[]
          );
          success = result.success;
          whatsappMessageId = result.messageId;
          errorMessage = result.error;
        } else if (message.content.startsWith('[Template: ')) {
          // Legacy: Extract template name from content and rebuild (for old messages)
          const templateMatch = message.content.match(/\[Template: ([^\]]+)\]/);
          if (templateMatch) {
            const templateName = templateMatch[1];
            console.log('[Process Message] Legacy mode - rebuilding template:', templateName);
            
            const templateData = await this.buildTemplateMessage(message.emergencyRequestId);
            
            if (templateData && templateData.templateName === templateName) {
              const result = await this.sendWhatsAppTemplateMessage(
                message.recipient,
                templateData.templateName,
                templateData.variables
              );
              success = result.success;
              whatsappMessageId = result.messageId;
              errorMessage = result.error;
            } else {
              console.error('[Process Message] Failed to rebuild template data');
              success = false;
              errorMessage = 'Failed to rebuild template data';
            }
          }
        } else {
          // Legacy plain text message
          const result = await this.sendWhatsAppMessage(message.recipient, message.content);
          success = result.success;
          whatsappMessageId = result.messageId;
          errorMessage = result.error;
        }
        
        // If WhatsApp fails, try email fallback
        if (!success) {
          console.log('WhatsApp failed, trying email fallback...');
          const hospital = await storage.getHospital(message.hospitalId);
          if (hospital?.email) {
            const emailSuccess = await this.sendEmail(
              hospital.email,
              'Emergency Pet Request',
              message.content.replace(/\[Template: [^\]]+\]\s*/, '')
            );
            
            if (emailSuccess) {
              await storage.updateMessage(messageId, {
                messageType: 'email',
                recipient: hospital.email,
                status: 'sent',
                sentAt: new Date(),
              });
              return;
            }
          }
        }
      } else if (message.messageType === 'email') {
        success = await this.sendEmail(message.recipient, 'Emergency Pet Request', message.content);
      } else if (message.messageType === 'line') {
        const cleanContent = message.content.replace(/\[Template: [^\]]+\]\s*/, '');
        success = await this.sendLineMessage(message.recipient, cleanContent);
      }

      if (success) {
        await storage.updateMessage(messageId, {
          status: 'sent',
          sentAt: new Date(),
          whatsappMessageId: whatsappMessageId || null,
        });
      } else {
        const newRetryCount = message.retryCount + 1;
        
        if (newRetryCount >= MAX_RETRIES) {
          await storage.updateMessage(messageId, {
            status: 'failed',
            failedAt: new Date(),
            errorMessage: errorMessage || 'Max retries exceeded',
            retryCount: newRetryCount,
          });
        } else {
          // Set back to queued for retry - must await to ensure DB update completes before scheduling
          await storage.updateMessage(messageId, {
            status: 'queued',
            retryCount: newRetryCount,
            errorMessage: errorMessage || null,
          });
          
          console.log(`[Process Message] Scheduling retry ${newRetryCount}/${MAX_RETRIES} for message ${messageId} in ${RETRY_DELAY_MS * newRetryCount}ms`);
          setTimeout(() => {
            console.log(`[Process Message] Executing retry ${newRetryCount} for message ${messageId}`);
            this.processMessage(messageId);
          }, RETRY_DELAY_MS * newRetryCount);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Re-fetch to get current retry count in case of race conditions
      const currentMessage = await storage.getMessage(messageId);
      const currentRetryCount = currentMessage?.retryCount ?? message.retryCount;
      const newRetryCount = currentRetryCount + 1;
      
      await storage.updateMessage(messageId, {
        status: newRetryCount >= MAX_RETRIES ? 'failed' : 'queued',
        failedAt: newRetryCount >= MAX_RETRIES ? new Date() : null,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        retryCount: newRetryCount,
      });

      if (newRetryCount < MAX_RETRIES) {
        console.log(`[Process Message] Scheduling retry ${newRetryCount}/${MAX_RETRIES} for message ${messageId} after error`);
        setTimeout(() => {
          console.log(`[Process Message] Executing retry ${newRetryCount} for message ${messageId} after error`);
          this.processMessage(messageId);
        }, RETRY_DELAY_MS * newRetryCount);
      }
    }
  }

  /**
   * Process all queued messages (for background job)
   */
  async processQueue(): Promise<void> {
    const queuedMessages = await storage.getQueuedMessages();
    
    for (const message of queuedMessages) {
      await this.processMessage(message.id);
    }
  }

  /**
   * Build WhatsApp template message based on emergency request data
   */
  private async buildTemplateMessage(
    emergencyRequestId: string,
    language: string = 'en'
  ): Promise<{ templateName: string; variables: string[]; fallbackText: string } | null> {
    // Fetch emergency request with related data
    const emergencyRequest = await storage.getEmergencyRequest(emergencyRequestId);
    if (!emergencyRequest) {
      console.error('[Template Builder] Emergency request not found:', emergencyRequestId);
      return null;
    }

    // If manualLocation is missing but GPS coords are available, reverse geocode them
    if (!emergencyRequest.manualLocation && emergencyRequest.locationLatitude && emergencyRequest.locationLongitude) {
      try {
        const geocoded = await reverseGeocodeServer(
          emergencyRequest.locationLatitude,
          emergencyRequest.locationLongitude,
          language
        );
        if (geocoded) {
          (emergencyRequest as any).manualLocation = geocoded;
          console.log('[Template Builder] Reverse geocoded location:', geocoded);
        }
      } catch (geoErr) {
        console.warn('[Template Builder] Reverse geocode failed, using raw coords:', geoErr);
        (emergencyRequest as any).manualLocation = `${Number(emergencyRequest.locationLatitude).toFixed(4)}, ${Number(emergencyRequest.locationLongitude).toFixed(4)}`;
      }
    }

    // Fetch pet data if available
    let pet = null;
    if (emergencyRequest.petId) {
      pet = await storage.getPet(emergencyRequest.petId);
    }

    // Fetch user data for language preference
    let user = null;
    if (emergencyRequest.userId) {
      user = await storage.getUser(emergencyRequest.userId);
    }

    // Fetch medical records and consent if user has consented to sharing
    let medicalRecordsSummary = '';
    if (emergencyRequest.petId && emergencyRequest.userId) {
      // Check if user has consented to emergency sharing
      const consents = await storage.getMedicalSharingConsentsByPetId(emergencyRequest.petId);
      const emergencyConsent = consents.find(c => c.consentType === 'emergency_broadcast' && c.enabled);
      
      if (emergencyConsent) {
        // Fetch medical records
        const records = await storage.getMedicalRecordsByPetId(emergencyRequest.petId);
        if (records && records.length > 0) {
          const isZh = (user?.languagePreference === 'zh-HK');
          
          // Build a summary of medical records
          const recordTypes = records.map(r => {
            const typeLabels: Record<string, { en: string; zh: string }> = {
              'blood_test': { en: 'Blood Test', zh: '血液檢查' },
              'xray': { en: 'X-Ray', zh: 'X光' },
              'vaccination': { en: 'Vaccination', zh: '疫苗記錄' },
              'surgery_report': { en: 'Surgery Report', zh: '手術報告' },
              'prescription': { en: 'Prescription', zh: '處方' },
              'other': { en: 'Document', zh: '文件' },
            };
            const label = typeLabels[r.documentType] || typeLabels['other'];
            return isZh ? label.zh : label.en;
          });
          
          const uniqueTypes = Array.from(new Set(recordTypes));
          medicalRecordsSummary = isZh 
            ? `\n📋 醫療記錄: ${uniqueTypes.join(', ')} (${records.length}份)`
            : `\n📋 Medical Records: ${uniqueTypes.join(', ')} (${records.length} file${records.length > 1 ? 's' : ''})`;
        }
      }
    }

    // Determine language (user preference > parameter > default)
    const userLanguage = user?.languagePreference || language || 'en';
    const isZhHk = userLanguage === 'zh-HK';
    const langSuffix = isZhHk ? '_zh_hk' : '_en';

    // Determine which template to use
    let templateName: string;
    let variables: string[] = [];
    let fallbackText = '';

    // Check if pet has visit history (registered pet with medical history)
    if (pet && pet.lastVisitHospitalId) {
      templateName = `emergency_pet_alert_full${langSuffix}`;
      
      // Fetch last visited clinic name
      const lastClinic = await storage.getClinic(pet.lastVisitHospitalId);
      const lastClinicName = lastClinic ? (isZhHk && lastClinic.nameZh ? lastClinic.nameZh : lastClinic.name) : (isZhHk ? '不詳' : 'Unknown');
      
      // Build profile link
      const profileLink = `${getBaseUrl()}/emergency-profile/${emergencyRequestId}`;
      
      // Build 12 variables for full template (includes profile URL)
      variables = [
        lastClinicName, // {{1}} Last visited clinic
        pet.name || (isZhHk ? '未命名' : 'Unnamed'), // {{2}} Pet name
        emergencyRequest.petSpecies || (isZhHk ? '不詳' : 'Unknown'), // {{3}} Species
        emergencyRequest.petBreed || (isZhHk ? '不詳' : 'Unknown'), // {{4}} Breed
        emergencyRequest.petAge ? `${emergencyRequest.petAge} ${isZhHk ? '歲' : 'years'}` : (isZhHk ? '不詳' : 'Unknown'), // {{5}} Age
        pet.weight ? `${pet.weight}${isZhHk ? '公斤' : 'kg'}` : (isZhHk ? '不詳' : 'Unknown'), // {{6}} Weight
        emergencyRequest.symptom || (isZhHk ? '緊急情況' : 'Emergency situation'), // {{7}} Critical symptom
        pet.medicalNotes || (isZhHk ? '無' : 'None'), // {{8}} Medical notes
        emergencyRequest.manualLocation || (isZhHk ? '不詳' : 'Unknown'), // {{9}} Location
        emergencyRequest.contactName || (isZhHk ? '寵物主人' : 'Pet Owner'), // {{10}} Owner name
        emergencyRequest.contactPhone || (isZhHk ? '不詳' : 'Unknown'), // {{11}} Owner phone
        profileLink, // {{12}} Profile URL
      ];
      
      fallbackText = `🚨 ${isZhHk ? '緊急寵物求助' : 'EMERGENCY PET ALERT'}\n\n` +
        `${isZhHk ? '已登記寵物（有醫療記錄）' : 'REGISTERED PET WITH MEDICAL HISTORY'}\n` +
        `${isZhHk ? '名稱' : 'Name'}: ${variables[1]}\n` +
        `${isZhHk ? '物種' : 'Species'}: ${variables[2]}\n` +
        `${isZhHk ? '緊急症狀' : 'Emergency'}: ${variables[6]}\n` +
        `${isZhHk ? '聯絡' : 'Contact'}: ${variables[9]} (${variables[10]})` +
        medicalRecordsSummary +
        `\n\n🔗 ${isZhHk ? '詳細資料' : 'Full Profile'}: ${profileLink}` +
        `\n\n${isZhHk ? '⚡ 快速回覆：\n回覆 1 = 可以接收 ✅\n回覆 2 = 今晚爆滿 ❌\n回覆 3 = 請主人致電我們 📞' : '⚡ Quick Reply:\nReply 1 = We can accept ✅\nReply 2 = Full tonight ❌\nReply 3 = Please call us 📞'}`;
      
    } else if (pet) {
      // New registered pet (no visit history)
      templateName = `emergency_pet_alert_new${langSuffix}`;
      
      // Build profile link
      const profileLink = `${getBaseUrl()}/emergency-profile/${emergencyRequestId}`;
      
      // Build 11 variables for new template (includes profile URL)
      variables = [
        pet.name || (isZhHk ? '未命名' : 'Unnamed'), // {{1}} Pet name
        emergencyRequest.petSpecies || (isZhHk ? '不詳' : 'Unknown'), // {{2}} Species
        emergencyRequest.petBreed || (isZhHk ? '不詳' : 'Unknown'), // {{3}} Breed
        emergencyRequest.petAge ? `${emergencyRequest.petAge} ${isZhHk ? '歲' : 'years'}` : (isZhHk ? '不詳' : 'Unknown'), // {{4}} Age
        pet.weight ? `${pet.weight}${isZhHk ? '公斤' : 'kg'}` : (isZhHk ? '不詳' : 'Unknown'), // {{5}} Weight
        emergencyRequest.symptom || (isZhHk ? '緊急情況' : 'Emergency situation'), // {{6}} Critical symptom
        pet.medicalNotes || (isZhHk ? '無' : 'None'), // {{7}} Medical notes
        emergencyRequest.manualLocation || (isZhHk ? '不詳' : 'Unknown'), // {{8}} Location
        emergencyRequest.contactName || (isZhHk ? '寵物主人' : 'Pet Owner'), // {{9}} Owner name
        emergencyRequest.contactPhone || (isZhHk ? '不詳' : 'Unknown'), // {{10}} Owner phone
        profileLink, // {{11}} Profile URL
      ];
      
      fallbackText = `🚨 ${isZhHk ? '緊急寵物求助' : 'EMERGENCY PET ALERT'}\n\n` +
        `${isZhHk ? '名稱' : 'Name'}: ${variables[0]}\n` +
        `${isZhHk ? '物種' : 'Species'}: ${variables[1]}\n` +
        `${isZhHk ? '緊急症狀' : 'Emergency'}: ${variables[5]}\n` +
        `${isZhHk ? '聯絡' : 'Contact'}: ${variables[8]} (${variables[9]})` +
        medicalRecordsSummary +
        `\n\n🔗 ${isZhHk ? '詳細資料' : 'Full Profile'}: ${profileLink}` +
        `\n\n${isZhHk ? '⚡ 快速回覆：\n回覆 1 = 可以接收 ✅\n回覆 2 = 今晚爆滿 ❌\n回覆 3 = 請主人致電我們 📞' : '⚡ Quick Reply:\nReply 1 = We can accept ✅\nReply 2 = Full tonight ❌\nReply 3 = Please call us 📞'}`;
      
    } else {
      // Anonymous user (basic template)
      templateName = `emergency_pet_alert_basic${langSuffix}`;
      
      // Build 7 variables for basic template
      variables = [
        emergencyRequest.petSpecies || (isZhHk ? '不詳' : 'Unknown'), // {{1}} Species
        emergencyRequest.petBreed || (isZhHk ? '不詳' : 'Unknown'), // {{2}} Breed
        emergencyRequest.petAge ? `${emergencyRequest.petAge} ${isZhHk ? '歲' : 'years'}` : (isZhHk ? '不詳' : 'Unknown'), // {{3}} Age
        emergencyRequest.symptom || (isZhHk ? '緊急情況' : 'Emergency situation'), // {{4}} Critical symptom
        emergencyRequest.manualLocation || (isZhHk ? '不詳' : 'Unknown'), // {{5}} Location
        emergencyRequest.contactName || (isZhHk ? '寵物主人' : 'Pet Owner'), // {{6}} Owner name
        emergencyRequest.contactPhone || (isZhHk ? '不詳' : 'Unknown'), // {{7}} Owner phone
      ];
      
      // Build profile link
      const profileLink = `${getBaseUrl()}/emergency-profile/${emergencyRequestId}`;
      
      fallbackText = `🚨 ${isZhHk ? '緊急寵物求助' : 'EMERGENCY PET ALERT'}\n\n` +
        `${isZhHk ? '物種' : 'Species'}: ${variables[0]}\n` +
        `${isZhHk ? '緊急症狀' : 'Emergency'}: ${variables[3]}\n` +
        `${isZhHk ? '聯絡' : 'Contact'}: ${variables[5]} (${variables[6]})` +
        `\n\n🔗 ${isZhHk ? '詳細資料' : 'Full Profile'}: ${profileLink}` +
        `\n\n${isZhHk ? '⚡ 快速回覆：\n回覆 1 = 可以接收 ✅\n回覆 2 = 今晚爆滿 ❌\n回覆 3 = 請主人致電我們 📞' : '⚡ Quick Reply:\nReply 1 = We can accept ✅\nReply 2 = Full tonight ❌\nReply 3 = Please call us 📞'}`;
    }

    console.log('[Template Builder] Selected template:', templateName);
    console.log('[Template Builder] Variables count:', variables.length);
    
    return { templateName, variables, fallbackText };
  }

  /**
   * Broadcast emergency to multiple hospitals
   * Sends BOTH English and Traditional Chinese messages to each hospital
   */
  async broadcastEmergency(
    emergencyRequestId: string,
    hospitalIds: string[],
    message: string
  ): Promise<Message[]> {
    const messages: Message[] = [];

    // Build template messages for BOTH languages
    const templateDataEn = await this.buildTemplateMessage(emergencyRequestId, 'en');
    const templateDataZh = await this.buildTemplateMessage(emergencyRequestId, 'zh-HK');
    
    if (!templateDataEn || !templateDataZh) {
      console.error('[Broadcast] Failed to build template messages');
      throw new Error('Failed to build emergency message templates');
    }

    console.log('[Broadcast] Sending bilingual messages (EN + ZH-HK) to each hospital');

    // Helper function to send a single language message
    const sendLanguageMessage = async (
      hospitalId: string,
      hospital: any,
      templateData: { templateName: string; variables: string[]; fallbackText: string },
      langLabel: string
    ) => {
      const { templateName, variables, fallbackText } = templateData;
      
      // Determine message type and recipient
      let messageType: 'whatsapp' | 'email' | 'line';
      let recipient: string;
      let contentToStore: string;
      
      // Determine language code from template name
      const templateLanguage = templateName.endsWith('_zh_hk') ? 'zh_HK' : 'en';

      if (hospital.whatsapp) {
        messageType = 'whatsapp';
        recipient = hospital.whatsapp;
        contentToStore = `[Template: ${templateName}] ${fallbackText}`;
      } else if (hospital.email) {
        messageType = 'email';
        recipient = hospital.email;
        contentToStore = fallbackText;
      } else {
        return null; // No valid contact method
      }

      // Create message record with persisted template data
      // This ensures template variables are immutable even if emergency request is edited later
      const msg = await storage.createMessage({
        emergencyRequestId,
        hospitalId,
        recipient,
        messageType,
        content: contentToStore,
        status: 'queued',
        templateName: messageType === 'whatsapp' ? templateName : null,
        templateVariables: messageType === 'whatsapp' ? variables : null,
        templateLanguage: messageType === 'whatsapp' ? templateLanguage : null,
      });

      // Try to send immediately
      await this.processMessage(msg.id);
      
      // Reload message to get updated status
      const updatedMsg = await storage.getMessage(msg.id);
      console.log(`[Broadcast] ${langLabel} message sent to ${hospital.nameEn || hospital.nameZh}: ${updatedMsg?.status}`);
      return updatedMsg;
    };

    for (const hospitalId of hospitalIds) {
      const hospital = await storage.getHospital(hospitalId);
      if (!hospital) {
        console.warn(`Hospital not found: ${hospitalId}`);
        continue;
      }

      // Check if hospital has valid contact method
      if (!hospital.whatsapp && !hospital.email) {
        console.warn(`No valid contact method (WhatsApp or Email) for hospital ${hospitalId}`);
        
        // Create failed message record for tracking
        await storage.createMessage({
          emergencyRequestId,
          hospitalId,
          recipient: hospital.phone || 'unknown',
          messageType: 'whatsapp',
          content: templateDataEn.fallbackText,
          status: 'failed',
          errorMessage: 'No valid WhatsApp or Email contact available',
          failedAt: new Date(),
        });
        
        continue;
      }

      // Send English message first
      const msgEn = await sendLanguageMessage(hospitalId, hospital, templateDataEn, 'EN');
      if (msgEn) {
        messages.push(msgEn);
      }

      // Send Traditional Chinese message
      const msgZh = await sendLanguageMessage(hospitalId, hospital, templateDataZh, 'ZH-HK');
      if (msgZh) {
        messages.push(msgZh);
      }
    }

    return messages;
  }

  /**
   * Send a direct WhatsApp message (not tied to an emergency request)
   * Used for admin outreach, notifications, etc.
   */
  async sendDirectWhatsAppMessage(phoneNumber: string, content: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendWhatsAppMessage(phoneNumber, content);
  }

  /**
   * Send a Thank You message to a vet consultant applicant
   * Uses the consultant_thank_you WhatsApp template
   */
  async sendThankYouMessage(phoneNumber: string, applicantName: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log('[Thank You Message] Sending to:', phoneNumber, 'Name:', applicantName);
    
    // Use the consultant_thank_you template with the applicant's name
    // The template should be approved in Meta Business Manager
    const templateName = 'consultant_thank_you';
    const templateVariables = [applicantName];
    
    try {
      const result = await this.sendWhatsAppTemplateMessage(phoneNumber, templateName, templateVariables);
      return result;
    } catch (error: any) {
      console.error('[Thank You Message] Template failed, trying direct message:', error.message);
      
      // Fallback to direct message if template is not available
      const fallbackMessage = `Dear ${applicantName},\n\nThank you for your interest in joining PetSOS as a veterinary consultant. We appreciate your commitment to helping pet owners during emergencies.\n\nWe will review your application and get back to you soon.\n\nBest regards,\nThe PetSOS Team`;
      
      return this.sendWhatsAppMessage(phoneNumber, fallbackMessage);
    }
  }
}

export const messagingService = new MessagingService();

// Start background queue processor
setInterval(() => {
  messagingService.processQueue().catch(console.error);
}, 30000); // Process queue every 30 seconds
