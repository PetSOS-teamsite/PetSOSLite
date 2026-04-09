import { storage } from "../storage";
import type { HospitalPingState, Hospital } from "@shared/schema";

const DAILY_PING_INTERVAL_MS = 60 * 60 * 1000;
const NO_REPLY_CHECK_INTERVAL_MS = 60 * 60 * 1000;
const PING_MESSAGE = "Hi 👋 Just checking availability - PetSOS";

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v21.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

let dailyPingInterval: NodeJS.Timeout | null = null;
let noReplyCheckInterval: NodeJS.Timeout | null = null;
let isDailyPingProcessing = false;
let isNoReplyProcessing = false;

async function sendWhatsAppPingMessage(phoneNumber: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.log('[HospitalPing] WhatsApp not configured - skipping ping');
    return { success: false, error: 'WhatsApp not configured' };
  }

  let cleanedNumber = phoneNumber.replace(/[^0-9]/g, '');
  if (!cleanedNumber || cleanedNumber.length < 8) {
    return { success: false, error: 'Invalid phone number' };
  }

  try {
    const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    // Use hello_world template (pre-approved by Meta) so ping works outside the 24h session window
    const payload = {
      messaging_product: 'whatsapp',
      to: cleanedNumber,
      type: 'template',
      template: {
        name: 'hello_world',
        language: { code: 'en_US' }
      }
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
      console.error('[HospitalPing] Send failed:', errorData);
      return { success: false, error: JSON.stringify(errorData) };
    }

    const data = await response.json();
    const messageId = data?.messages?.[0]?.id;
    console.log('[HospitalPing] Ping sent successfully to:', cleanedNumber, 'messageId:', messageId);
    return { success: true, messageId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[HospitalPing] Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

async function isEligibleForPing(hospital: Hospital, pingState: HospitalPingState | undefined): Promise<boolean> {
  if (!hospital.whatsapp) {
    return false;
  }

  if (!pingState) {
    return true;
  }

  if (!pingState.pingEnabled) {
    return false;
  }

  if (pingState.pingStatus === 'no_reply' || pingState.pingStatus === 'paused') {
    return false;
  }

  if (pingState.lastPingSentAt) {
    const hoursSinceLastPing = (Date.now() - pingState.lastPingSentAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastPing < 23) {
      return false;
    }
  }

  return true;
}

async function processDailyPings(): Promise<{ processed: number; sent: number; failed: number }> {
  if (isDailyPingProcessing) {
    console.log('[HospitalPing] Daily ping still in progress, skipping...');
    return { processed: 0, sent: 0, failed: 0 };
  }

  isDailyPingProcessing = true;
  let processed = 0, sent = 0, failed = 0;

  try {
    const hospitals = await storage.getAllHospitals();
    const hospitalsWithWhatsApp = hospitals.filter(h => h.whatsapp && h.status === 'active');

    if (hospitalsWithWhatsApp.length === 0) {
      console.log('[HospitalPing] No hospitals with WhatsApp numbers found');
      return { processed: 0, sent: 0, failed: 0 };
    }

    console.log(`[HospitalPing] Checking ${hospitalsWithWhatsApp.length} hospitals for daily ping`);

    for (const hospital of hospitalsWithWhatsApp) {
      processed++;
      
      try {
        const pingState = await storage.getHospitalPingState(hospital.id);
        
        if (!await isEligibleForPing(hospital, pingState)) {
          continue;
        }

        const result = await sendWhatsAppPingMessage(hospital.whatsapp!);

        if (result.success) {
          await storage.upsertHospitalPingState({
            hospitalId: hospital.id,
            pingEnabled: pingState?.pingEnabled ?? true,
            pingStatus: 'active',
            lastPingSentAt: new Date(),
            lastPingMessageId: result.messageId || null,
            lastInboundReplyAt: pingState?.lastInboundReplyAt || null,
            lastReplyLatencySeconds: pingState?.lastReplyLatencySeconds || null,
            noReplySince: null,
          });

          await storage.createHospitalPingLog({
            hospitalId: hospital.id,
            direction: 'outbound',
            providerMessageId: result.messageId || null,
            eventType: 'ping_sent',
            sentAt: new Date(),
            receivedAt: null,
            payload: { phoneNumber: hospital.whatsapp }
          });

          sent++;
          console.log(`[HospitalPing] Ping sent to hospital ${hospital.id} (${hospital.nameEn})`);
        } else {
          failed++;
          console.error(`[HospitalPing] Failed to ping hospital ${hospital.id}: ${result.error}`);
        }
      } catch (error) {
        failed++;
        console.error(`[HospitalPing] Error processing hospital ${hospital.id}:`, error);
      }
    }

    console.log(`[HospitalPing] Daily ping complete: ${processed} processed, ${sent} sent, ${failed} failed`);
    return { processed, sent, failed };
  } catch (error) {
    console.error('[HospitalPing] Error in daily ping processing:', error);
    return { processed, sent, failed };
  } finally {
    isDailyPingProcessing = false;
  }
}

async function processNoReplyMarking(): Promise<{ marked: number }> {
  if (isNoReplyProcessing) {
    console.log('[HospitalPing] No-reply check still in progress, skipping...');
    return { marked: 0 };
  }

  isNoReplyProcessing = true;
  let marked = 0;

  try {
    const hospitalsNeedingMarking = await storage.getHospitalsNeedingNoReplyMarking();

    if (hospitalsNeedingMarking.length === 0) {
      return { marked: 0 };
    }

    console.log(`[HospitalPing] Found ${hospitalsNeedingMarking.length} hospitals needing no-reply marking`);

    for (const pingState of hospitalsNeedingMarking) {
      try {
        await storage.updateHospitalPingState(pingState.hospitalId, {
          pingStatus: 'no_reply',
          noReplySince: new Date()
        });

        await storage.createHospitalPingLog({
          hospitalId: pingState.hospitalId,
          direction: 'outbound',
          providerMessageId: null,
          eventType: 'no_reply_marked',
          sentAt: null,
          receivedAt: null,
          payload: { 
            lastPingSentAt: pingState.lastPingSentAt,
            reason: 'No reply within 24 hours'
          }
        });

        marked++;
        console.log(`[HospitalPing] Hospital ${pingState.hospitalId} marked as no_reply`);
      } catch (error) {
        console.error(`[HospitalPing] Error marking hospital ${pingState.hospitalId}:`, error);
      }
    }

    console.log(`[HospitalPing] No-reply marking complete: ${marked} hospitals marked`);
    return { marked };
  } catch (error) {
    console.error('[HospitalPing] Error in no-reply marking:', error);
    return { marked };
  } finally {
    isNoReplyProcessing = false;
  }
}

export async function handleHospitalReply(
  hospitalId: string, 
  phoneNumber: string,
  providerMessageId?: string
): Promise<void> {
  try {
    const pingState = await storage.getHospitalPingState(hospitalId);
    const now = new Date();
    
    let latencySeconds: number | null = null;
    if (pingState?.lastPingSentAt) {
      latencySeconds = Math.floor((now.getTime() - pingState.lastPingSentAt.getTime()) / 1000);
    }

    await storage.upsertHospitalPingState({
      hospitalId,
      pingEnabled: pingState?.pingEnabled ?? true,
      pingStatus: 'active',
      lastPingSentAt: pingState?.lastPingSentAt || null,
      lastPingMessageId: pingState?.lastPingMessageId || null,
      lastInboundReplyAt: now,
      lastReplyLatencySeconds: latencySeconds,
      noReplySince: null,
    });

    await storage.createHospitalPingLog({
      hospitalId,
      direction: 'inbound',
      providerMessageId: providerMessageId || null,
      eventType: 'reply_received',
      sentAt: null,
      receivedAt: now,
      payload: { phoneNumber }
    });

    console.log(`[HospitalPing] Hospital ${hospitalId} reply recorded, latency: ${latencySeconds}s`);
  } catch (error) {
    console.error(`[HospitalPing] Error handling hospital reply for ${hospitalId}:`, error);
  }
}

export function startHospitalPingScheduler(): void {
  if (dailyPingInterval) {
    console.log('[HospitalPing] Scheduler already running');
    return;
  }

  console.log(`[HospitalPing] Starting hospital ping scheduler (daily ping every ${DAILY_PING_INTERVAL_MS / 1000 / 60} min, no-reply check every ${NO_REPLY_CHECK_INTERVAL_MS / 1000 / 60} min)`);

  dailyPingInterval = setInterval(async () => {
    try {
      await processDailyPings();
    } catch (error) {
      console.error('[HospitalPing] Daily ping scheduler error:', error);
    }
  }, DAILY_PING_INTERVAL_MS);

  noReplyCheckInterval = setInterval(async () => {
    try {
      await processNoReplyMarking();
    } catch (error) {
      console.error('[HospitalPing] No-reply check error:', error);
    }
  }, NO_REPLY_CHECK_INTERVAL_MS);
}

export function stopHospitalPingScheduler(): void {
  if (dailyPingInterval) {
    clearInterval(dailyPingInterval);
    dailyPingInterval = null;
  }
  if (noReplyCheckInterval) {
    clearInterval(noReplyCheckInterval);
    noReplyCheckInterval = null;
  }
  console.log('[HospitalPing] Scheduler stopped');
}

export async function runDailyPingOnce(): Promise<{ processed: number; sent: number; failed: number }> {
  return await processDailyPings();
}

export async function runNoReplyCheckOnce(): Promise<{ marked: number }> {
  return await processNoReplyMarking();
}
