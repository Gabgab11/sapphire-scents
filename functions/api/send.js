// POST /api/send: emails checkout orders and contact messages to the Sapphire team (Resend).
// Cloudflare Pages settings › Environment variables:
//   RESEND_API_KEY (secret), MAIL_FROM ("Sapphire Scents <orders@shopsapphirescents.com>"), MAIL_TO (optional)
// Until they're set it answers 503 and the site falls back to the customer's email app.
import { liveProducts, naira, KINDS, json } from '../_lib/shop.js';

const clean = (v, max = 500) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max);
const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const okEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

async function send(env, { to, subject, text, replyTo }) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.MAIL_FROM, to: [to], subject, text,
      html: `<pre style="font:14px/1.6 -apple-system,Segoe UI,Arial,sans-serif;white-space:pre-wrap">${esc(text)}</pre>`,
      ...(replyTo ? { reply_to: replyTo } : {})
    })
  });
  if (!r.ok) throw new Error('Resend ' + r.status + ' ' + (await r.text()).slice(0, 200));
}

export async function onRequestPost({ request, env }) {
  if (!env.RESEND_API_KEY || !env.MAIL_FROM) return json(503, { ok: false, error: 'Email sending is not set up yet' });
  const TO = env.MAIL_TO || 'info@shopsapphirescents.com';
  let b = {};
  try { b = await request.json(); } catch (e) { b = {}; }
  if (clean(b.website)) return json(200, { ok: true }); // honeypot

  try {
    if (b.type === 'order') {
      const c = b.customer || {};
      const cu = { name: clean(c.name, 120), phone: clean(c.phone, 40), email: clean(c.email, 160), address: clean(c.address, 300), city: clean(c.city, 120), state: clean(c.state, 120), notes: clean(c.notes, 1500) };
      if (!cu.name || !cu.phone || !okEmail(cu.email) || !cu.address || !cu.city || !cu.state) return json(400, { ok: false, error: 'Missing details' });
      // prices always come from the database, never from the browser
      const rows = await liveProducts(env);
      if (!rows || !rows.length) return json(503, { ok: false, error: 'Shop is busy, try again' });
      const byId = Object.fromEntries(rows.map(r => [r.id, r]));
      const items = (Array.isArray(b.items) ? b.items : []).slice(0, 50)
        .map(l => ({ p: byId[clean(l.id, 80)], qty: Math.max(1, Math.min(99, parseInt(l.qty, 10) || 1)), opt: clean(l.opt, 60) }))
        .filter(l => l.p && l.p.in_stock !== false);
      if (!items.length) return json(400, { ok: false, error: 'Your bag is empty' });
      const total = items.reduce((s, l) => s + l.p.price * l.qty, 0);
      const ref = clean(b.ref, 20) || 'SS-' + Date.now().toString(36).toUpperCase().slice(-6);
      const lines = items.map(l => `• ${l.p.name} (${KINDS[l.p.type] || ''}${l.opt ? ', ' + l.opt : ''}) × ${l.qty}: ${naira(l.p.price * l.qty)}`).join('\n');
      const who = `Name: ${cu.name}\nPhone: ${cu.phone}\nEmail: ${cu.email}\nAddress: ${cu.address}, ${cu.city}, ${cu.state}${cu.notes ? '\nNotes: ' + cu.notes : ''}`;
      await send(env, { to: TO, replyTo: cu.email, subject: `New order ${ref} – ${cu.name} – ${naira(total)}`, text: `New website order ${ref}\n\n${lines}\n\nSubtotal: ${naira(total)} (delivery to be confirmed)\n\n${who}` });
      try {
        await send(env, { to: cu.email, replyTo: TO, subject: `Your Sapphire Scents order ${ref}`, text: `Hello ${cu.name.split(' ')[0]},\n\nThank you for your order. The Sapphire team will contact you to confirm availability, delivery cost and payment details.\n\nOrder ${ref}\n${lines}\n\nSubtotal: ${naira(total)} (delivery to be confirmed)\n\nDeliver to: ${cu.address}, ${cu.city}, ${cu.state}\n\nSapphire Scents\n${TO}` });
      } catch (e) { console.error('customer copy failed', e.message); }
      return json(200, { ok: true, ref, total });
    }
    if (b.type === 'contact') {
      const name = clean(b.name, 120), email = clean(b.email, 160), subject = clean(b.subject, 120) || 'Website message', message = clean(b.message, 5000);
      if (!name || !okEmail(email) || !message) return json(400, { ok: false, error: 'Missing details' });
      await send(env, { to: TO, replyTo: email, subject: `${subject} – ${name}`, text: `${message}\n\n${name}\n${email}\n\n(Sent from the contact form on the Sapphire Scents website)` });
      return json(200, { ok: true });
    }
    return json(400, { ok: false, error: 'Unknown request' });
  } catch (e) {
    console.error(e);
    return json(502, { ok: false, error: 'Could not send right now' });
  }
}

export const onRequestGet = () => json(405, { ok: false, error: 'Use POST' });
