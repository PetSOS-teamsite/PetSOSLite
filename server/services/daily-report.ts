import { db } from '../db';
import { emergencyRequests, messages, hospitalEmergencyResponses, hospitals } from '@shared/schema';
import { sendGmailEmail } from '../gmail-client';
import { sql, and, gte, lt, eq, count } from 'drizzle-orm';

const REPORT_HOUR_UTC = 0; // 00:00 UTC = 08:00 HKT
const CHECK_INTERVAL_MS = 60 * 1000; // check every minute

let schedulerInterval: NodeJS.Timeout | null = null;
let lastReportDate: string | null = null; // tracks 'YYYY-MM-DD' of last sent report

function getHKTDateString(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Hong_Kong',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date); // returns YYYY-MM-DD
}

function getYesterdayUTCRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - 1);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

async function gatherStats() {
  const { start, end } = getYesterdayUTCRange();

  const [emergencyRows] = await db
    .select({ total: count() })
    .from(emergencyRequests)
    .where(and(gte(emergencyRequests.createdAt, start), lt(emergencyRequests.createdAt, end)));

  const [broadcastRows] = await db
    .select({ total: count() })
    .from(messages)
    .where(and(gte(messages.createdAt, start), lt(messages.createdAt, end)));

  const [sentRows] = await db
    .select({ total: count() })
    .from(messages)
    .where(and(
      gte(messages.createdAt, start),
      lt(messages.createdAt, end),
      eq(messages.status, 'sent')
    ));

  const [failedRows] = await db
    .select({ total: count() })
    .from(messages)
    .where(and(
      gte(messages.createdAt, start),
      lt(messages.createdAt, end),
      eq(messages.status, 'failed')
    ));

  const [replyRows] = await db
    .select({ total: count() })
    .from(hospitalEmergencyResponses)
    .where(and(
      gte(hospitalEmergencyResponses.createdAt, start),
      lt(hospitalEmergencyResponses.createdAt, end)
    ));

  const [canAcceptRows] = await db
    .select({ total: count() })
    .from(hospitalEmergencyResponses)
    .where(and(
      gte(hospitalEmergencyResponses.createdAt, start),
      lt(hospitalEmergencyResponses.createdAt, end),
      eq(hospitalEmergencyResponses.responseType, 'can_accept')
    ));

  const [fullRows] = await db
    .select({ total: count() })
    .from(hospitalEmergencyResponses)
    .where(and(
      gte(hospitalEmergencyResponses.createdAt, start),
      lt(hospitalEmergencyResponses.createdAt, end),
      eq(hospitalEmergencyResponses.responseType, 'full')
    ));

  const [callRows] = await db
    .select({ total: count() })
    .from(hospitalEmergencyResponses)
    .where(and(
      gte(hospitalEmergencyResponses.createdAt, start),
      lt(hospitalEmergencyResponses.createdAt, end),
      eq(hospitalEmergencyResponses.responseType, 'call_requested')
    ));

  const topHospitals = await db
    .select({
      hospitalId: hospitalEmergencyResponses.hospitalId,
      replies: count(),
    })
    .from(hospitalEmergencyResponses)
    .where(and(
      gte(hospitalEmergencyResponses.createdAt, start),
      lt(hospitalEmergencyResponses.createdAt, end)
    ))
    .groupBy(hospitalEmergencyResponses.hospitalId)
    .orderBy(sql`count(*) desc`)
    .limit(5);

  const hospitalIds = topHospitals.map(r => r.hospitalId);
  let hospitalNames: Record<string, string> = {};
  if (hospitalIds.length > 0) {
    const rows = await db
      .select({ id: hospitals.id, nameEn: hospitals.nameEn })
      .from(hospitals)
      .where(sql`${hospitals.id} = ANY(${hospitalIds})`);
    rows.forEach(r => { hospitalNames[r.id] = r.nameEn; });
  }

  const totalBroadcasts = Number(broadcastRows.total);
  const totalSent = Number(sentRows.total);
  const totalReplies = Number(replyRows.total);
  const responseRate = totalSent > 0 ? Math.round((totalReplies / totalSent) * 100) : 0;
  const deliveryRate = totalBroadcasts > 0 ? Math.round((totalSent / totalBroadcasts) * 100) : 0;

  return {
    date: getHKTDateString(start),
    emergencies: Number(emergencyRows.total),
    broadcastsSent: totalSent,
    broadcastsFailed: Number(failedRows.total),
    deliveryRate,
    totalReplies,
    canAccept: Number(canAcceptRows.total),
    full: Number(fullRows.total),
    callRequested: Number(callRows.total),
    responseRate,
    topHospitals: topHospitals.map(r => ({
      name: hospitalNames[r.hospitalId] || r.hospitalId,
      replies: Number(r.replies),
    })),
  };
}

function buildEmailHtml(stats: Awaited<ReturnType<typeof gatherStats>>): string {
  const topHospitalsRows = stats.topHospitals.length > 0
    ? stats.topHospitals.map(h =>
        `<tr><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0">${h.name}</td><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;text-align:center">${h.replies}</td></tr>`
      ).join('')
    : `<tr><td colspan="2" style="padding:6px 12px;color:#999;text-align:center">No replies yesterday</td></tr>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>PetSOS Daily Report</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:30px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">

        <!-- Header -->
        <tr><td style="background:#e53935;padding:24px 32px">
          <h1 style="margin:0;color:#ffffff;font-size:22px">🐾 PetSOS Daily Report</h1>
          <p style="margin:4px 0 0;color:#ffcdd2;font-size:14px">${stats.date} (Hong Kong Time)</p>
        </td></tr>

        <!-- Emergency Summary -->
        <tr><td style="padding:28px 32px 0">
          <h2 style="margin:0 0 16px;font-size:16px;color:#333;border-bottom:2px solid #e53935;padding-bottom:8px">Emergency Summary</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="text-align:center;padding:16px;background:#fff8f8;border-radius:6px;width:33%">
                <div style="font-size:36px;font-weight:bold;color:#e53935">${stats.emergencies}</div>
                <div style="font-size:12px;color:#666;margin-top:4px">Emergencies</div>
              </td>
              <td style="width:12px"></td>
              <td style="text-align:center;padding:16px;background:#f8fff8;border-radius:6px;width:33%">
                <div style="font-size:36px;font-weight:bold;color:#43a047">${stats.broadcastsSent}</div>
                <div style="font-size:12px;color:#666;margin-top:4px">Broadcasts Sent</div>
              </td>
              <td style="width:12px"></td>
              <td style="text-align:center;padding:16px;background:#f8f8ff;border-radius:6px;width:33%">
                <div style="font-size:36px;font-weight:bold;color:#1e88e5">${stats.deliveryRate}%</div>
                <div style="font-size:12px;color:#666;margin-top:4px">Delivery Rate</div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Hospital Response Breakdown -->
        <tr><td style="padding:24px 32px 0">
          <h2 style="margin:0 0 16px;font-size:16px;color:#333;border-bottom:2px solid #e53935;padding-bottom:8px">Hospital Responses</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="text-align:center;padding:14px;background:#f8fff8;border-radius:6px;width:25%">
                <div style="font-size:28px;font-weight:bold;color:#43a047">${stats.canAccept}</div>
                <div style="font-size:11px;color:#666;margin-top:4px">✅ Can Accept</div>
              </td>
              <td style="width:10px"></td>
              <td style="text-align:center;padding:14px;background:#fff8f8;border-radius:6px;width:25%">
                <div style="font-size:28px;font-weight:bold;color:#e53935">${stats.full}</div>
                <div style="font-size:11px;color:#666;margin-top:4px">❌ Full</div>
              </td>
              <td style="width:10px"></td>
              <td style="text-align:center;padding:14px;background:#fffde7;border-radius:6px;width:25%">
                <div style="font-size:28px;font-weight:bold;color:#f9a825">${stats.callRequested}</div>
                <div style="font-size:11px;color:#666;margin-top:4px">📞 Call First</div>
              </td>
              <td style="width:10px"></td>
              <td style="text-align:center;padding:14px;background:#f5f5f5;border-radius:6px;width:25%">
                <div style="font-size:28px;font-weight:bold;color:#888">${stats.responseRate}%</div>
                <div style="font-size:11px;color:#666;margin-top:4px">Response Rate</div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Top Hospitals -->
        <tr><td style="padding:24px 32px">
          <h2 style="margin:0 0 12px;font-size:16px;color:#333;border-bottom:2px solid #e53935;padding-bottom:8px">Top Responding Hospitals</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;border-radius:6px;overflow:hidden">
            <tr style="background:#fafafa">
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#666;font-weight:600">Hospital</th>
              <th style="padding:8px 12px;text-align:center;font-size:12px;color:#666;font-weight:600">Replies</th>
            </tr>
            ${topHospitalsRows}
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#fafafa;padding:20px 32px;border-top:1px solid #eee">
          <p style="margin:0;font-size:12px;color:#999;text-align:center">
            This report was automatically generated by PetSOS &middot; 
            <a href="https://petsos.site/admin" style="color:#e53935;text-decoration:none">Open Admin Dashboard</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendDailyReport(): Promise<{ success: boolean; error?: string }> {
  const recipientEnv = process.env.DAILY_REPORT_EMAIL;
  if (!recipientEnv) {
    console.log('[DailyReport] DAILY_REPORT_EMAIL not set — skipping report');
    return { success: false, error: 'DAILY_REPORT_EMAIL not configured' };
  }

  const recipients = recipientEnv.split(',').map(e => e.trim()).filter(Boolean);

  try {
    console.log('[DailyReport] Gathering stats...');
    const stats = await gatherStats();

    const subject = `PetSOS Daily Report — ${stats.date} | ${stats.emergencies} emergencies · ${stats.responseRate}% response rate`;
    const html = buildEmailHtml(stats);

    let allSent = true;
    for (const recipient of recipients) {
      const ok = await sendGmailEmail(
        recipient,
        subject,
        html,
        process.env.EMAIL_FROM || 'noreply@petsos.site'
      );
      if (!ok) allSent = false;
    }

    console.log(`[DailyReport] Report for ${stats.date} sent to: ${recipients.join(', ')}`);
    return { success: allSent };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[DailyReport] Failed to send report:', msg);
    return { success: false, error: msg };
  }
}

async function checkAndSendReport(): Promise<void> {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcMinute = now.getUTCMinutes();

  if (utcHour !== REPORT_HOUR_UTC || utcMinute !== 0) return;

  const todayKey = now.toISOString().slice(0, 10);
  if (lastReportDate === todayKey) return;

  lastReportDate = todayKey;
  await sendDailyReport();
}

export function startDailyReportScheduler(): void {
  if (schedulerInterval) {
    console.log('[DailyReport] Scheduler already running');
    return;
  }

  console.log('[DailyReport] Starting daily report scheduler (fires at 08:00 HKT / 00:00 UTC)');
  schedulerInterval = setInterval(async () => {
    try {
      await checkAndSendReport();
    } catch (error) {
      console.error('[DailyReport] Scheduler error:', error);
    }
  }, CHECK_INTERVAL_MS);
}

export function stopDailyReportScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[DailyReport] Scheduler stopped');
  }
}
