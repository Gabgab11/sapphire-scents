// POST /api/pay/webhook: Paystack calls this when a payment succeeds (set it in Paystack › Settings ›
// API Keys & Webhooks). The signature is checked with the secret key, then the team and the customer
// are emailed. Paystack also emails the business owner for every successful payment.
import { json, naira } from '../../_lib/shop.js';
import { orderLines, whoText, sendMail, canMail, teamEmail, place } from '../../_lib/order.js';
import { payReady } from '../../_lib/paystack.js';
import { firstName } from '../../_lib/order.js';

async function hmac512(key, body) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(body));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost({ request, env }) {
  if (!payReady(env)) return json(503, { ok: false });
  const body = await request.text();
  const sig = request.headers.get('x-paystack-signature') || '';
  const want = await hmac512(env.PAYSTACK_SECRET_KEY, body);
  let diff = sig.length ^ want.length; // compare in constant time
  for (let i = 0; i < want.length; i++) diff |= (sig.charCodeAt(i) || 0) ^ want.charCodeAt(i);
  if (!sig || diff) return json(401, { ok: false });
  let ev = {};
  try { ev = JSON.parse(body); } catch (e) { return json(400, { ok: false }); }
  if (ev.event !== 'charge.success' || !canMail(env)) return json(200, { ok: true });
  const d = ev.data || {}, m = d.metadata || {}, cu = m.customer || {};
  if (!m.order || !Array.isArray(m.items)) return json(200, { ok: true }); // not a website order
  if (d.status !== 'success' || d.currency !== 'NGN' || d.amount !== Math.round((m.total || 0) * 100)) {
    console.error('webhook amount mismatch', d.reference); return json(200, { ok: true });
  }
  const amount = naira(d.amount / 100), lines = orderLines(m.items), TO = teamEmail(env);
  try {
    await sendMail(env, { to: TO, replyTo: cu.email, subject: `PAID order ${m.order} – ${cu.name} – ${amount}`, text: `Paid website order ${m.order}\nPaid ${amount} by ${d.channel || 'Paystack'} (Paystack ref ${d.reference})\n\n${lines}\n\nDelivery cost to be agreed with the customer.\n\n${whoText(cu)}` });
  } catch (e) { console.error('team mail', e.message); return json(500, { ok: false }); } // Paystack retries
  try {
    if (cu.email) await sendMail(env, { to: cu.email, replyTo: TO, subject: `Payment received: Sapphire Scents order ${m.order}`, text: `Hello ${firstName(cu.name)},\n\nWe have received your payment of ${amount}. Thank you.\n\nOrder ${m.order}\n${lines}\n\nThe Sapphire team will contact you on ${cu.phone} to arrange delivery.\n\nDeliver to: ${place(cu)}\n\nSapphire Scents\n${TO}` });
  } catch (e) { console.error('customer mail', e.message); }
  return json(200, { ok: true });
}
