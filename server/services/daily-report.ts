import { db } from '../db';
import { emergencyRequests, messages, hospitalEmergencyResponses, hospitals, regions } from '@shared/schema';
import { sendGmailEmail } from '../gmail-client';
import { sql, and, gte, lt, eq, count } from 'drizzle-orm';

const REPORT_HOUR_UTC = 0; // 00:00 UTC = 08:00 HKT
const CHECK_INTERVAL_MS = 60 * 1000;
const HKT_OFFSET_MS = 8 * 60 * 60 * 1000; // UTC+8

let schedulerInterval: NodeJS.Timeout | null = null;
let lastReportDate: string | null = null;

// ─── Time helpers ─────────────────────────────────────────────────────────────

function getHKTBounds() {
  const now = Date.now();
  const hktNow = now + HKT_OFFSET_MS;
  const hktMidnightToday = Math.floor(hktNow / 86400000) * 86400000;
  const hktMidnightYesterday = hktMidnightToday - 86400000;
  const h8 = 8 * 3600000;

  const utcStart = hktMidnightYesterday - HKT_OFFSET_MS;
  const utcEnd = hktMidnightToday - HKT_OFFSET_MS;

  const dateStr = new Date(utcStart + HKT_OFFSET_MS).toISOString().slice(0, 10);

  return {
    date: dateStr,
    start: new Date(utcStart),
    end: new Date(utcEnd),
    sections: [
      { label: '00:00–08:00', icon: '🌙', desc: 'Overnight', from: new Date(utcStart),        to: new Date(utcStart + h8) },
      { label: '08:00–16:00', icon: '☀️',  desc: 'Daytime',   from: new Date(utcStart + h8),   to: new Date(utcStart + 2 * h8) },
      { label: '16:00–24:00', icon: '🌆',  desc: 'Evening',   from: new Date(utcStart + 2 * h8), to: new Date(utcEnd) },
    ],
  };
}

function formatHKT(date: Date): string {
  return new Intl.DateTimeFormat('en-HK', {
    timeZone: 'Asia/Hong_Kong',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

// ─── Data gathering ────────────────────────────────────────────────────────────

type CaseRow = {
  id: string;
  createdAt: Date;
  symptom: string;
  aiAnalyzedSymptoms: string | null;
  manualLocation: string | null;
  locationLatitude: string | null;
  locationLongitude: string | null;
  regionId: string | null;
  contactName: string;
  contactPhone: string;
  petSpecies: string | null;
  petBreed: string | null;
  status: string;
};

async function fetchCasesInRange(from: Date, to: Date): Promise<CaseRow[]> {
  return db
    .select({
      id: emergencyRequests.id,
      createdAt: emergencyRequests.createdAt,
      symptom: emergencyRequests.symptom,
      aiAnalyzedSymptoms: emergencyRequests.aiAnalyzedSymptoms,
      manualLocation: emergencyRequests.manualLocation,
      locationLatitude: emergencyRequests.locationLatitude,
      locationLongitude: emergencyRequests.locationLongitude,
      regionId: emergencyRequests.regionId,
      contactName: emergencyRequests.contactName,
      contactPhone: emergencyRequests.contactPhone,
      petSpecies: emergencyRequests.petSpecies,
      petBreed: emergencyRequests.petBreed,
      status: emergencyRequests.status,
    })
    .from(emergencyRequests)
    .where(and(gte(emergencyRequests.createdAt, from), lt(emergencyRequests.createdAt, to)))
    .orderBy(emergencyRequests.createdAt);
}

function resolveLocation(c: CaseRow, regionMap: Record<string, string>): string {
  if (c.manualLocation) return c.manualLocation;
  if (c.regionId && regionMap[c.regionId]) return regionMap[c.regionId];
  if (c.locationLatitude && c.locationLongitude)
    return `${parseFloat(c.locationLatitude).toFixed(4)}, ${parseFloat(c.locationLongitude).toFixed(4)}`;
  return 'Location not provided';
}

async function gatherStats() {
  const bounds = getHKTBounds();
  const { date, start, end, sections } = bounds;

  // ── Broadcast & reply stats ──────────────────────────────────────────────
  const [broadcastTotal] = await db.select({ total: count() }).from(messages)
    .where(and(gte(messages.createdAt, start), lt(messages.createdAt, end)));
  const [broadcastSent] = await db.select({ total: count() }).from(messages)
    .where(and(gte(messages.createdAt, start), lt(messages.createdAt, end), eq(messages.status, 'sent')));
  const [broadcastFailed] = await db.select({ total: count() }).from(messages)
    .where(and(gte(messages.createdAt, start), lt(messages.createdAt, end), eq(messages.status, 'failed')));
  const [replyTotal] = await db.select({ total: count() }).from(hospitalEmergencyResponses)
    .where(and(gte(hospitalEmergencyResponses.createdAt, start), lt(hospitalEmergencyResponses.createdAt, end)));
  const [canAccept] = await db.select({ total: count() }).from(hospitalEmergencyResponses)
    .where(and(gte(hospitalEmergencyResponses.createdAt, start), lt(hospitalEmergencyResponses.createdAt, end), eq(hospitalEmergencyResponses.responseType, 'can_accept')));
  const [full] = await db.select({ total: count() }).from(hospitalEmergencyResponses)
    .where(and(gte(hospitalEmergencyResponses.createdAt, start), lt(hospitalEmergencyResponses.createdAt, end), eq(hospitalEmergencyResponses.responseType, 'full')));
  const [callRequested] = await db.select({ total: count() }).from(hospitalEmergencyResponses)
    .where(and(gte(hospitalEmergencyResponses.createdAt, start), lt(hospitalEmergencyResponses.createdAt, end), eq(hospitalEmergencyResponses.responseType, 'call_requested')));

  // ── Top hospitals ────────────────────────────────────────────────────────
  const topHospitals = await db
    .select({ hospitalId: hospitalEmergencyResponses.hospitalId, replies: count() })
    .from(hospitalEmergencyResponses)
    .where(and(gte(hospitalEmergencyResponses.createdAt, start), lt(hospitalEmergencyResponses.createdAt, end)))
    .groupBy(hospitalEmergencyResponses.hospitalId)
    .orderBy(sql`count(*) desc`)
    .limit(5);

  const hospitalIds = topHospitals.map(r => r.hospitalId);
  const hospitalNames: Record<string, string> = {};
  if (hospitalIds.length > 0) {
    const rows = await db.select({ id: hospitals.id, nameEn: hospitals.nameEn }).from(hospitals)
      .where(sql`${hospitals.id} = ANY(${hospitalIds})`);
    rows.forEach(r => { hospitalNames[r.id] = r.nameEn; });
  }

  // ── Region name map ──────────────────────────────────────────────────────
  const allRegions = await db.select({ id: regions.id, nameEn: regions.nameEn }).from(regions);
  const regionMap: Record<string, string> = {};
  allRegions.forEach(r => { regionMap[r.id] = r.nameEn; });

  // ── Cases per section ────────────────────────────────────────────────────
  const sectionData = await Promise.all(sections.map(async (s) => {
    const cases = await fetchCasesInRange(s.from, s.to);
    return {
      ...s,
      count: cases.length,
      cases: cases.map(c => ({
        time: formatHKT(c.createdAt),
        pet: [c.petSpecies, c.petBreed].filter(Boolean).join(' · ') || 'Unknown pet',
        symptom: c.aiAnalyzedSymptoms || c.symptom,
        location: resolveLocation(c, regionMap),
        contact: `${c.contactName} ${c.contactPhone}`,
        status: c.status,
        id: c.id,
      })),
    };
  }));

  const totalCases = sectionData.reduce((sum, s) => sum + s.count, 0);
  const totalSent = Number(broadcastSent.total);
  const totalReplies = Number(replyTotal.total);

  return {
    date,
    totalCases,
    broadcastsSent: totalSent,
    broadcastsFailed: Number(broadcastFailed.total),
    deliveryRate: Number(broadcastTotal.total) > 0 ? Math.round((totalSent / Number(broadcastTotal.total)) * 100) : 0,
    totalReplies,
    canAccept: Number(canAccept.total),
    full: Number(full.total),
    callRequested: Number(callRequested.total),
    responseRate: totalSent > 0 ? Math.round((totalReplies / totalSent) * 100) : 0,
    topHospitals: topHospitals.map(r => ({ name: hospitalNames[r.hospitalId] || r.hospitalId, replies: Number(r.replies) })),
    sections: sectionData,
  };
}

// ─── Email HTML ────────────────────────────────────────────────────────────────

function pill(color: string, text: string) {
  return `<span style="display:inline-block;padding:2px 8px;border-radius:12px;background:${color};font-size:11px;font-weight:600;color:#fff">${text}</span>`;
}

function statusPill(status: string) {
  const map: Record<string, [string, string]> = {
    pending: ['#f9a825', 'Pending'],
    in_progress: ['#1e88e5', 'In Progress'],
    completed: ['#43a047', 'Completed'],
    cancelled: ['#999', 'Cancelled'],
  };
  const [color, label] = map[status] || ['#999', status];
  return pill(color, label);
}

function buildCasesTable(cases: ReturnType<typeof gatherStats> extends Promise<infer T> ? T['sections'][0]['cases'] : never) {
  if (cases.length === 0) {
    return `<p style="color:#999;font-size:13px;text-align:center;margin:8px 0">No emergencies in this period</p>`;
  }
  const rows = cases.map(c => `
    <tr style="border-bottom:1px solid #f0f0f0">
      <td style="padding:8px 10px;font-size:12px;color:#555;white-space:nowrap">${c.time} HKT</td>
      <td style="padding:8px 10px;font-size:12px;color:#333">${c.pet}</td>
      <td style="padding:8px 10px;font-size:12px;color:#333;max-width:160px">${c.symptom.slice(0, 80)}${c.symptom.length > 80 ? '…' : ''}</td>
      <td style="padding:8px 10px;font-size:12px;color:#555">${c.location}</td>
      <td style="padding:8px 10px;font-size:12px;color:#555">${c.contact}</td>
      <td style="padding:8px 10px">${statusPill(c.status)}</td>
    </tr>`).join('');
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;border-radius:6px;overflow:hidden;font-size:12px">
      <tr style="background:#fafafa">
        <th style="padding:6px 10px;text-align:left;color:#888;font-weight:600">Time</th>
        <th style="padding:6px 10px;text-align:left;color:#888;font-weight:600">Pet</th>
        <th style="padding:6px 10px;text-align:left;color:#888;font-weight:600">Symptoms</th>
        <th style="padding:6px 10px;text-align:left;color:#888;font-weight:600">Location</th>
        <th style="padding:6px 10px;text-align:left;color:#888;font-weight:600">Contact</th>
        <th style="padding:6px 10px;text-align:left;color:#888;font-weight:600">Status</th>
      </tr>
      ${rows}
    </table>`;
}

function buildEmailHtml(stats: Awaited<ReturnType<typeof gatherStats>>): string {
  const sectionBgColors = ['#f0f4ff', '#fff8e1', '#fce4ec'];
  const sectionBorderColors = ['#3f51b5', '#f9a825', '#e53935'];

  const sectionBlocks = stats.sections.map((s, i) => `
    <tr><td style="padding:20px 32px 0">
      <div style="border-left:4px solid ${sectionBorderColors[i]};padding-left:12px;margin-bottom:12px">
        <h3 style="margin:0;font-size:14px;color:#333">${s.icon} ${s.label} HKT &nbsp;<span style="font-weight:normal;color:#888">${s.desc}</span>
          &nbsp;
          <span style="font-size:20px;font-weight:bold;color:${sectionBorderColors[i]}">${s.count}</span>
          <span style="font-size:12px;color:#999"> case${s.count !== 1 ? 's' : ''}</span>
        </h3>
      </div>
      ${buildCasesTable(s.cases)}
    </td></tr>`).join('');

  const topHospitalsRows = stats.topHospitals.length > 0
    ? stats.topHospitals.map(h => `<tr><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0">${h.name}</td><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;text-align:center">${h.replies}</td></tr>`).join('')
    : `<tr><td colspan="2" style="padding:8px 12px;color:#999;text-align:center">No replies yesterday</td></tr>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>PetSOS Daily Report</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:30px 0">
<tr><td align="center">
<table width="680" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">

  <!-- Header -->
  <tr><td style="background:#e53935;padding:24px 32px">
    <h1 style="margin:0;color:#fff;font-size:22px">🐾 PetSOS Daily Report</h1>
    <p style="margin:4px 0 0;color:#ffcdd2;font-size:14px">${stats.date} (Hong Kong Time)</p>
  </td></tr>

  <!-- Top stats -->
  <tr><td style="padding:28px 32px 0">
    <h2 style="margin:0 0 14px;font-size:15px;color:#333;border-bottom:2px solid #e53935;padding-bottom:8px">Day Summary</h2>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="text-align:center;padding:14px;background:#fff8f8;border-radius:6px;width:20%">
          <div style="font-size:34px;font-weight:bold;color:#e53935">${stats.totalCases}</div>
          <div style="font-size:11px;color:#666;margin-top:4px">Emergencies</div>
        </td>
        <td style="width:10px"></td>
        <td style="text-align:center;padding:14px;background:#f8fff8;border-radius:6px;width:20%">
          <div style="font-size:34px;font-weight:bold;color:#43a047">${stats.broadcastsSent}</div>
          <div style="font-size:11px;color:#666;margin-top:4px">Broadcasts Sent</div>
        </td>
        <td style="width:10px"></td>
        <td style="text-align:center;padding:14px;background:#f8f8ff;border-radius:6px;width:20%">
          <div style="font-size:34px;font-weight:bold;color:#1e88e5">${stats.deliveryRate}%</div>
          <div style="font-size:11px;color:#666;margin-top:4px">Delivery Rate</div>
        </td>
        <td style="width:10px"></td>
        <td style="text-align:center;padding:14px;background:#f8fff8;border-radius:6px;width:20%">
          <div style="font-size:34px;font-weight:bold;color:#43a047">${stats.canAccept}</div>
          <div style="font-size:11px;color:#666;margin-top:4px">✅ Accepted</div>
        </td>
        <td style="width:10px"></td>
        <td style="text-align:center;padding:14px;background:#f5f5f5;border-radius:6px;width:20%">
          <div style="font-size:34px;font-weight:bold;color:#888">${stats.responseRate}%</div>
          <div style="font-size:11px;color:#666;margin-top:4px">Response Rate</div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- 8-hour time sections -->
  <tr><td style="padding:24px 32px 0">
    <h2 style="margin:0 0 4px;font-size:15px;color:#333;border-bottom:2px solid #e53935;padding-bottom:8px">Emergencies by Time Period (HKT)</h2>
  </td></tr>
  ${sectionBlocks}

  <!-- Hospital response breakdown -->
  <tr><td style="padding:24px 32px 0">
    <h2 style="margin:0 0 14px;font-size:15px;color:#333;border-bottom:2px solid #e53935;padding-bottom:8px">Hospital Response Breakdown</h2>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="text-align:center;padding:12px;background:#f8fff8;border-radius:6px;width:25%">
          <div style="font-size:26px;font-weight:bold;color:#43a047">${stats.canAccept}</div>
          <div style="font-size:11px;color:#666;margin-top:4px">✅ Can Accept</div>
        </td>
        <td style="width:8px"></td>
        <td style="text-align:center;padding:12px;background:#fff8f8;border-radius:6px;width:25%">
          <div style="font-size:26px;font-weight:bold;color:#e53935">${stats.full}</div>
          <div style="font-size:11px;color:#666;margin-top:4px">❌ Full</div>
        </td>
        <td style="width:8px"></td>
        <td style="text-align:center;padding:12px;background:#fffde7;border-radius:6px;width:25%">
          <div style="font-size:26px;font-weight:bold;color:#f9a825">${stats.callRequested}</div>
          <div style="font-size:11px;color:#666;margin-top:4px">📞 Call First</div>
        </td>
        <td style="width:8px"></td>
        <td style="text-align:center;padding:12px;background:#f5f5f5;border-radius:6px;width:25%">
          <div style="font-size:26px;font-weight:bold;color:#888">${stats.totalReplies}</div>
          <div style="font-size:11px;color:#666;margin-top:4px">Total Replies</div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Top responding hospitals -->
  <tr><td style="padding:24px 32px">
    <h2 style="margin:0 0 12px;font-size:15px;color:#333;border-bottom:2px solid #e53935;padding-bottom:8px">Top Responding Hospitals</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;border-radius:6px;overflow:hidden">
      <tr style="background:#fafafa">
        <th style="padding:8px 12px;text-align:left;font-size:12px;color:#666;font-weight:600">Hospital</th>
        <th style="padding:8px 12px;text-align:center;font-size:12px;color:#666;font-weight:600">Replies</th>
      </tr>
      ${topHospitalsRows}
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#fafafa;padding:18px 32px;border-top:1px solid #eee">
    <p style="margin:0;font-size:12px;color:#999;text-align:center">
      Auto-generated by PetSOS at 08:00 HKT &middot;
      <a href="https://petsos.site/admin" style="color:#e53935;text-decoration:none">Open Admin Dashboard</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── Public API ────────────────────────────────────────────────────────────────

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
    const subject = `PetSOS Daily Report — ${stats.date} | ${stats.totalCases} emergencies · ${stats.responseRate}% response rate`;
    const html = buildEmailHtml(stats);

    let allSent = true;
    for (const recipient of recipients) {
      const ok = await sendGmailEmail(recipient, subject, html, process.env.EMAIL_FROM || 'noreply@petsos.site');
      if (!ok) allSent = false;
    }

    console.log(`[DailyReport] Report for ${stats.date} sent to: ${recipients.join(', ')} | ${stats.totalCases} emergencies across 3 periods`);
    return { success: allSent };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[DailyReport] Failed to send report:', msg);
    return { success: false, error: msg };
  }
}

async function checkAndSendReport(): Promise<void> {
  const now = new Date();
  if (now.getUTCHours() !== REPORT_HOUR_UTC || now.getUTCMinutes() !== 0) return;
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
    try { await checkAndSendReport(); } catch (e) { console.error('[DailyReport] Scheduler error:', e); }
  }, CHECK_INTERVAL_MS);
}

export function stopDailyReportScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[DailyReport] Scheduler stopped');
  }
}
