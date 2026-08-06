/* Appointment-request handler.
 *
 * The site posts here instead of to a forms product, so the email provider
 * stays swappable and the cost stays at zero: Netlify's function free tier
 * (~125k invocations/month) plus Resend's (3,000 emails/month) is far more
 * headroom than a dental practice will use.
 *
 * Required env var (Netlify → Site configuration → Environment variables):
 *   RESEND_API_KEY   — from resend.com
 * Optional:
 *   BOOKING_TO       — recipient (default below)
 *   BOOKING_FROM     — verified sender on your domain
 */

const TO = process.env.BOOKING_TO || 'sylviacastaneda1@gmail.com';
const FROM = process.env.BOOKING_FROM || 'Appointments <onboarding@resend.dev>';
const PRACTICE = 'Marshall H. Brown, DDS';

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  let d;
  try {
    d = await req.json();
  } catch {
    return json(400, { error: 'Invalid request.' });
  }

  // Honeypot: real people never fill this. Return success so bots don't retry.
  if (d.company) return json(200, { ok: true });

  const first = String(d.firstName || '').trim();
  const last = String(d.lastName || '').trim();
  const phone = String(d.phone || '').trim();
  const email = String(d.email || '').trim();
  const notes = String(d.notes || '').trim().slice(0, 2000);
  const date = String(d.date || '').trim();
  const time = String(d.time || '').trim();
  const dateLabel = String(d.dateLabel || date).trim();

  const missing = [];
  if (!first) missing.push('first name');
  if (!last) missing.push('last name');
  if (!phone) missing.push('phone');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) missing.push('a valid email');
  if (!date || !time) missing.push('an appointment date and time');
  if (missing.length) return json(400, { error: `Please provide ${missing.join(', ')}.` });

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set — cannot send appointment email.');
    return json(500, {
      error: 'Booking is temporarily unavailable. Please call (817) 920-0882.',
    });
  }

  const rows = [
    ['Requested date', dateLabel],
    ['Requested time', time],
    ['Name', `${first} ${last}`],
    ['Phone', phone],
    ['Email', email],
    ['Notes', notes || '—'],
  ];

  const html = `
<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px">
  <h2 style="color:#0d2d4e;margin:0 0 4px">New appointment request</h2>
  <p style="color:#64748b;margin:0 0 20px;font-size:14px">Submitted via marshallbrowndds.com</p>
  <table style="border-collapse:collapse;width:100%;font-size:14px">
    ${rows.map(([k, v]) => `<tr>
      <td style="padding:10px 12px;background:#f7f9fc;border:1px solid #e2e8f0;font-weight:700;color:#0d2d4e;width:150px;vertical-align:top">${esc(k)}</td>
      <td style="padding:10px 12px;border:1px solid #e2e8f0;color:#1e293b;white-space:pre-wrap">${esc(v)}</td>
    </tr>`).join('')}
  </table>
  <p style="margin:20px 0 0;font-size:13px;color:#64748b">
    Reply to this email to reach ${esc(first)} directly, or call ${esc(phone)}.
    This is a <strong>request</strong> — the appointment is not confirmed until someone contacts the patient.
  </p>
</div>`.trim();

  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject: `Appointment request — ${first} ${last}, ${dateLabel} at ${time}`,
        html,
        text,
      }),
    });

    if (!res.ok) {
      console.error('Resend error', res.status, await res.text());
      return json(502, {
        error: 'We could not send your request. Please call (817) 920-0882.',
      });
    }
  } catch (err) {
    console.error('Resend request failed', err);
    return json(502, {
      error: 'We could not send your request. Please call (817) 920-0882.',
    });
  }

  return json(200, { ok: true, practice: PRACTICE });
};

export const config = { path: '/api/book' };
