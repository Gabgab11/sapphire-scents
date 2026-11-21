// Turns what the browser sent into a checked order. Prices always come from the database.
import { liveProducts, naira, KINDS } from './shop.js';

export const clean = (v, max = 500) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max);
export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const okEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
export const teamEmail = env => env.MAIL_TO || 'info@shopsapphirescents.com';

export async function buildOrder(env, b) {
  const c = b.customer || {};
  const cu = { name: clean(c.name, 120), phone: clean(c.phone, 40), email: clean(c.email, 160), address: clean(c.address, 300), city: clean(c.city, 120), state: clean(c.state, 120), country: clean(c.country, 60) || 'Nigeria', notes: clean(c.notes, 1500) };
  if (!COUNTRIES.includes(cu.country)) return { error: [400, 'Please choose a delivery country from the list.'] };
  if (cu.country !== 'Nigeria') cu.state = '';
  if (!cu.name || !cu.phone || !okEmail(cu.email) || !cu.address || !cu.city || (cu.country === 'Nigeria' && !cu.state)) return { error: [400, 'Please fill in your name, phone, email and delivery address.'] };
  const rows = await liveProducts(env).catch(() => null);
  if (!rows || !rows.length) return { error: [503, 'The shop is busy. Please try again in a moment.'] };
  const byId = Object.fromEntries(rows.map(r => [r.id, r]));
  const items = (Array.isArray(b.items) ? b.items : []).slice(0, 50)
    .map(l => ({ p: byId[clean(l.id, 80)], qty: Math.max(1, Math.min(99, parseInt(l.qty, 10) || 1)), opt: clean(l.opt, 60) }))
    .filter(l => l.p && l.p.in_stock !== false);
  if (!items.length) return { error: [400, 'Your bag is empty, or the items in it are sold out.'] };
  const total = items.reduce((s, l) => s + l.p.price * l.qty, 0);
  const lines = orderLines(items.map(l => ({ name: l.p.name, kind: KINDS[l.p.type] || '', opt: l.opt, qty: l.qty, amount: l.p.price * l.qty })));
  const compact = items.map(l => ({ id: l.p.id, name: l.p.name, kind: KINDS[l.p.type] || '', opt: l.opt, qty: l.qty, amount: l.p.price * l.qty }));
  return { cu, items: compact, total, lines };
}

export const orderLines = items => items.map(l => `• ${l.name} (${l.kind}${l.opt ? ', ' + l.opt : ''}) × ${l.qty}: ${naira(l.amount)}`).join('\n');
export const COUNTRIES = ['Nigeria', 'Ghana', 'Benin', 'South Africa', 'Kenya', 'Egypt', 'United Kingdom', 'Ireland', 'United States', 'Canada', 'Portugal', 'Spain', 'France', 'Germany', 'Italy', 'Netherlands', 'Belgium', 'United Arab Emirates', 'Saudi Arabia', 'Qatar']; // keep in sync with assets/js/places.js
export const place = cu => [cu.address, cu.city, cu.state, cu.country].filter(Boolean).join(', ');
export const whoText = cu => `Name: ${cu.name}\nPhone: ${cu.phone}\nEmail: ${cu.email}\nAddress: ${place(cu)}${cu.notes ? '\nNotes: ' + cu.notes : ''}`;

export async function sendMail(env, { to, subject, text, replyTo }) {
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
export const canMail = env => !!(env.RESEND_API_KEY && env.MAIL_FROM);

// Only letters in the greeting of emails sent to customers, so the forms can't be used to send spam links
export const firstName = n => (String(n || '').split(/\s+/)[0] || '').replace(/[^\p{L}'-]/gu, '').slice(0, 30) || 'there';
