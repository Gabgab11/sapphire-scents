// POST /api/send: emails checkout orders and contact messages to the Sapphire team (Resend).
// Cloudflare Pages settings › Environment variables:
//   RESEND_API_KEY (secret), MAIL_FROM ("Sapphire Scents <orders@shopsapphirescents.com>"), MAIL_TO (optional)
// Until they're set it answers 503 and the site falls back to the customer's email app.
import { naira, json } from '../_lib/shop.js';
import { clean, okEmail, buildOrder, whoText, sendMail as send, teamEmail, firstName, place } from '../_lib/order.js';

export async function onRequestPost({ request, env }) {
  if (!env.RESEND_API_KEY || !env.MAIL_FROM) return json(503, { ok: false, error: 'Email sending is not set up yet' });
  const TO = teamEmail(env);
  let b = {};
  try { b = await request.json(); } catch (e) { b = {}; }
  if (clean(b.website)) return json(200, { ok: true }); // honeypot

  try {
    if (b.type === 'order') {
      const o = await buildOrder(env, b);
      if (o.error) return json(o.error[0], { ok: false, error: o.error[1] });
      const { cu, total, lines } = o;
      const ref = clean(b.ref, 20) || 'SS-' + Date.now().toString(36).toUpperCase().slice(-6);
      const who = whoText(cu);
      await send(env, { to: TO, replyTo: cu.email, subject: `New order ${ref} – ${cu.name} – ${naira(total)}`, text: `New website order ${ref}\n\n${lines}\n\nSubtotal: ${naira(total)} (delivery to be confirmed)\n\n${who}` });
      try {
        await send(env, { to: cu.email, replyTo: TO, subject: `Your Sapphire Scents order ${ref}`, text: `Hello ${firstName(cu.name)},\n\nThank you for your order. The Sapphire team will contact you to confirm availability, delivery cost and payment details.\n\nOrder ${ref}\n${lines}\n\nSubtotal: ${naira(total)} (delivery to be confirmed)\n\nDeliver to: ${place(cu)}\n\nSapphire Scents\n${TO}` });
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
