import { storage } from "../storage";
import { sendBroadcastNotification, sendPushNotification } from "./fcm";
import { sendGmailEmail } from "../gmail-client";
import type { TyphoonNotificationQueue, UserEmergencySubscription } from "@shared/schema";

const SCHEDULER_INTERVAL_MS = 60 * 1000;
const TYPHOON_QUEUE_INTERVAL_MS = 30 * 1000;
const MAX_RETRIES = 3;

let schedulerInterval: NodeJS.Timeout | null = null;
let typhoonQueueInterval: NodeJS.Timeout | null = null;
let isProcessing = false;
let isTyphoonQueueProcessing = false;

// WhatsApp Business API configuration
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v21.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

async function processScheduledNotifications(): Promise<void> {
  if (isProcessing) {
    console.log('[NotificationScheduler] Previous run still in progress, skipping...');
    return;
  }

  isProcessing = true;

  try {
    const dueNotifications = await storage.getScheduledNotifications();

    if (dueNotifications.length === 0) {
      return;
    }

    console.log(`[NotificationScheduler] Found ${dueNotifications.length} scheduled notifications to send`);

    for (const notification of dueNotifications) {
      try {
        console.log(`[NotificationScheduler] Processing notification ${notification.id}: "${notification.title}"`);

        await storage.updateNotificationBroadcastStatus(notification.id, 'pending');

        const tokens = await storage.getActiveTokens(
          notification.targetLanguage || undefined,
          notification.targetRole || undefined
        );

        if (tokens.length === 0) {
          await storage.updateNotificationBroadcast(notification.id, {
            status: 'sent',
            recipientCount: 0,
            providerResponse: {
              message: 'No active subscriptions found',
              url: notification.url || null
            },
            sentAt: new Date()
          });

          console.log(`[NotificationScheduler] Notification ${notification.id} sent to 0 recipients (no active subscriptions)`);
          continue;
        }

        const result = await sendBroadcastNotification(tokens, {
          title: notification.title,
          message: notification.message,
          url: notification.url || undefined
        });

        if (result.failedTokens && result.failedTokens.length > 0) {
          await storage.deactivatePushSubscriptions(result.failedTokens);
        }

        await storage.updateNotificationBroadcast(notification.id, {
          status: result.success ? 'sent' : 'failed',
          recipientCount: result.successCount || 0,
          providerResponse: {
            successCount: result.successCount || 0,
            failureCount: result.failureCount || 0,
            url: notification.url || null,
            error: result.error || null
          },
          sentAt: result.success ? new Date() : null
        });

        await storage.createAuditLog({
          entityType: 'notification_broadcast',
          entityId: notification.id,
          action: 'send_scheduled',
          userId: notification.adminId,
          changes: {
            title: notification.title,
            scheduledFor: notification.scheduledFor,
            recipientCount: result.successCount || 0,
            success: result.success
          }
        });

        console.log(`[NotificationScheduler] Notification ${notification.id} sent: ${result.successCount} success, ${result.failureCount} failed`);

      } catch (error) {
        console.error(`[NotificationScheduler] Error processing notification ${notification.id}:`, error);

        await storage.updateNotificationBroadcast(notification.id, {
          status: 'failed',
          providerResponse: {
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    }
  } catch (error) {
    console.error('[NotificationScheduler] Error in scheduler run:', error);
  } finally {
    isProcessing = false;
  }
}

export function startNotificationScheduler(): void {
  if (schedulerInterval) {
    console.log('[NotificationScheduler] Scheduler already running');
    return;
  }

  console.log('[NotificationScheduler] Starting notification scheduler (checking every minute)');

  processScheduledNotifications();

  schedulerInterval = setInterval(processScheduledNotifications, SCHEDULER_INTERVAL_MS);
}

export function stopNotificationScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[NotificationScheduler] Scheduler stopped');
  }
}

export async function runSchedulerOnce(): Promise<void> {
  await processScheduledNotifications();
}

// =====================================
// TYPHOON NOTIFICATION QUEUE PROCESSING
// =====================================

async function sendWhatsAppTextMessage(phoneNumber: string, message: string): Promise<{ success: boolean; error?: string }> {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.log('[WhatsApp] Not configured - skipping message');
    return { success: false, error: 'WhatsApp not configured' };
  }

  let cleanedNumber = phoneNumber.replace(/[^0-9]/g, '');
  if (!cleanedNumber || cleanedNumber.length < 8) {
    return { success: false, error: 'Invalid phone number' };
  }

  try {
    const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      to: cleanedNumber,
      type: 'text',
      text: { body: message }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[WhatsApp] Send failed:', errorData);
      return { success: false, error: JSON.stringify(errorData) };
    }

    console.log('[WhatsApp] Message sent successfully to:', cleanedNumber);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[WhatsApp] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

async function sendNotificationByChannel(
  notification: TyphoonNotificationQueue,
  subscription: UserEmergencySubscription | null
): Promise<{ success: boolean; error?: string }> {
  const channel = notification.channel;
  const language = subscription?.preferredLanguage || 'en';
  const title = language === 'zh' ? notification.titleZh : notification.titleEn;
  const body = language === 'zh' ? notification.bodyZh : notification.bodyEn;

  console.log(`[TyphoonQueue] Sending ${channel} notification: "${title}"`);

  try {
    switch (channel) {
      case 'push': {
        const token = subscription?.pushToken;
        if (!token) {
          return { success: false, error: 'No push token available' };
        }
        const result = await sendPushNotification([token], { title, message: body });
        return { success: result.success, error: result.error };
      }

      case 'email': {
        const email = subscription?.email;
        if (!email) {
          return { success: false, error: 'No email address available' };
        }
        try {
          const success = await sendGmailEmail(
            email,
            title,
            body,
            process.env.EMAIL_FROM || 'noreply@petsos.site'
          );
          return { success, error: success ? undefined : 'Email send failed' };
        } catch (error) {
          console.log('[TyphoonQueue] Email service not configured, skipping');
          return { success: false, error: 'Email service not configured' };
        }
      }

      case 'whatsapp': {
        const phone = subscription?.phone;
        if (!phone) {
          return { success: false, error: 'No phone number available' };
        }
        const message = `${title}\n\n${body}`;
        return await sendWhatsAppTextMessage(phone, message);
      }

      default:
        return { success: false, error: `Unknown channel: ${channel}` };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

export async function processTyphoonNotificationQueue(): Promise<{ processed: number; sent: number; failed: number }> {
  if (isTyphoonQueueProcessing) {
    console.log('[TyphoonQueue] Previous run still in progress, skipping...');
    return { processed: 0, sent: 0, failed: 0 };
  }

  isTyphoonQueueProcessing = true;
  let processed = 0, sent = 0, failed = 0;

  try {
    const pendingNotifications = await storage.getPendingTyphoonNotifications();

    if (pendingNotifications.length === 0) {
      return { processed: 0, sent: 0, failed: 0 };
    }

    console.log(`[TyphoonQueue] Processing ${pendingNotifications.length} pending notifications`);

    for (const notification of pendingNotifications) {
      processed++;

      try {
        await storage.updateTyphoonNotification(notification.id, { status: 'sending' });

        let subscription: UserEmergencySubscription | null = null;
        if (notification.targetAudience === 'subscribed') {
          const subscriptions = await storage.getActiveEmergencySubscriptions('typhoon');
          subscription = subscriptions[0] || null;
        }

        const result = await sendNotificationByChannel(notification, subscription);

        if (result.success) {
          await storage.updateTyphoonNotification(notification.id, {
            status: 'sent',
            sentAt: new Date(),
            recipientCount: 1
          });
          sent++;
          console.log(`[TyphoonQueue] Notification ${notification.id} sent successfully`);
        } else {
          const retryCount = (notification.retryCount || 0) + 1;
          if (retryCount >= MAX_RETRIES) {
            await storage.updateTyphoonNotification(notification.id, {
              status: 'failed',
              retryCount,
              errorMessage: result.error || 'Max retries exceeded'
            });
            failed++;
            console.error(`[TyphoonQueue] Notification ${notification.id} failed after ${retryCount} retries: ${result.error}`);
          } else {
            await storage.updateTyphoonNotification(notification.id, {
              status: 'pending',
              retryCount,
              errorMessage: result.error
            });
            console.log(`[TyphoonQueue] Notification ${notification.id} will retry (attempt ${retryCount}/${MAX_RETRIES})`);
          }
        }
      } catch (error) {
        console.error(`[TyphoonQueue] Error processing notification ${notification.id}:`, error);
        await storage.updateTyphoonNotification(notification.id, {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
        failed++;
      }
    }

    console.log(`[TyphoonQueue] Batch complete: ${processed} processed, ${sent} sent, ${failed} failed`);
    return { processed, sent, failed };
  } catch (error) {
    console.error('[TyphoonQueue] Error in queue processing:', error);
    return { processed, sent, failed };
  } finally {
    isTyphoonQueueProcessing = false;
  }
}

export async function queueTyphoonNotifications(alertId: string): Promise<number> {
  console.log(`[TyphoonQueue] Queueing notifications for typhoon alert: ${alertId}`);

  try {
    const subscriptions = await storage.getActiveEmergencySubscriptions('typhoon');
    
    if (subscriptions.length === 0) {
      console.log('[TyphoonQueue] No active subscriptions found');
      return 0;
    }

    console.log(`[TyphoonQueue] Found ${subscriptions.length} active subscriptions`);
    
    let queuedCount = 0;

    for (const subscription of subscriptions) {
      const channels = subscription.notifyChannels || ['push'];
      const language = subscription.preferredLanguage || 'en';

      for (const channel of channels) {
        if (channel !== 'push' && channel !== 'email' && channel !== 'whatsapp') {
          continue;
        }

        try {
          await storage.createTyphoonNotification({
            typhoonAlertId: alertId,
            notificationType: 'typhoon_warning',
            targetAudience: 'subscribed',
            channel: channel as 'push' | 'email' | 'whatsapp',
            titleEn: '⚠️ Typhoon Warning',
            titleZh: '⚠️ 颱風警告',
            bodyEn: 'A typhoon signal has been raised in Hong Kong. Please keep your pets safe and check emergency veterinary services.',
            bodyZh: '香港已發出颱風信號。請確保寵物安全並查閱緊急獸醫服務。',
            status: 'pending',
            retryCount: 0
          });
          queuedCount++;
        } catch (error) {
          console.error(`[TyphoonQueue] Failed to queue notification for subscription ${subscription.id}:`, error);
        }
      }
    }

    console.log(`[TyphoonQueue] Queued ${queuedCount} notifications for ${subscriptions.length} subscribers`);
    return queuedCount;
  } catch (error) {
    console.error('[TyphoonQueue] Error queueing notifications:', error);
    return 0;
  }
}

export function startTyphoonNotificationScheduler(): void {
  if (typhoonQueueInterval) {
    console.log('[TyphoonQueue] Scheduler already running');
    return;
  }

  console.log(`[TyphoonQueue] Starting typhoon notification scheduler (every ${TYPHOON_QUEUE_INTERVAL_MS / 1000}s)`);

  processTyphoonNotificationQueue();

  typhoonQueueInterval = setInterval(async () => {
    try {
      await processTyphoonNotificationQueue();
    } catch (error) {
      console.error('[TyphoonQueue] Scheduler error:', error);
    }
  }, TYPHOON_QUEUE_INTERVAL_MS);
}

export function stopTyphoonNotificationScheduler(): void {
  if (typhoonQueueInterval) {
    clearInterval(typhoonQueueInterval);
    typhoonQueueInterval = null;
    console.log('[TyphoonQueue] Scheduler stopped');
  }
}
