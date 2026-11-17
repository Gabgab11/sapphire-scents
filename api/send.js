// Sends checkout orders and contact messages to the Sapphire team by email (Resend).
// Needs these environment variables on Vercel:
//   RESEND_API_KEY  – Resend API key
//   MAIL_FROM       – a sender on a domain verified in Resend, e.g. "Sapphire Scents <orders@shopsapphirescents.com>"
//   MAIL_TO         – where orders and messages go (defaults to info@shopsapphirescents.com)
// Until they are set it answers 503 and the site falls back to the customer's email app.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let CAT = null;
function catalog() {
  if (CAT) return CAT;
  const src = fs.readFileSync(path.join(process.cwd(), 'assets/js/catalog.js'), 'utf8');
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(src + ';this.__C={byId,naira};', ctx);
  return (CAT = ctx.__C);
}

const clean = (v, max = 500) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max);
const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const okEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

async function send({ to, subject, text, replyTo }) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.MAIL_FROM, to: [to], subject, text,
      html: `<pre style="font:14px/1.6 -apple-system,Segoe UI,Arial,sans-serif;white-space:pre-wrap">${esc(text)}</pre>`,
      ...(replyTo ? { reply_to: replyTo } : {})
    })
  });
  if (!r.ok) throw new Error('Resend ' + r.status + ' ' + (await r.text()).slice(0, 200));
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Use POST' });
  if (!process.env.RESEND_API_KEY || !process.env.MAIL_FROM) return res.status(503).json({ ok: false, error: 'Email sending is not set up yet' });
  const TO = process.env.MAIL_TO || 'info@shopsapphirescents.com';
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  b = b || {};
  if (clean(b.website)) return res.status(200).json({ ok: true }); // honeypot: bots fill hidden fields

  try {
    if (b.type === 'order') {
      const { byId, naira } = catalog();
      const c = b.customer || {};
      const cu = { name: clean(c.name, 120), phone: clean(c.phone, 40), email: clean(c.email, 160), address: clean(c.address, 300), city: clean(c.city, 120), state: clean(c.state, 120), notes: clean(c.notes, 1500) };
      if (!cu.name || !cu.phone || !okEmail(cu.email) || !cu.address || !cu.city || !cu.state) return res.status(400).json({ ok: false, error: 'Missing details' });
      const items = (Array.isArray(b.items) ? b.items : []).slice(0, 50)
        .map(l => ({ p: byId[clean(l.id, 80)], qty: Math.max(1, Math.min(99, parseInt(l.qty, 10) || 1)), opt: clean(l.opt, 60) }))
        .filter(l => l.p);
      if (!items.length) return res.status(400).json({ ok: false, error: 'Your bag is empty' });
      const total = items.reduce((s, l) => s + l.p.price * l.qty, 0);
      const ref = clean(b.ref, 20) || 'SS-' + Date.now().toString(36).toUpperCase().slice(-6);
      const lines = items.map(l => `• ${l.p.name} (${l.p.kind}${l.opt ? ', ' + l.opt : ''}) × ${l.qty}: ${naira(l.p.price * l.qty)}`).join('\n');
      const who = `Name: ${cu.name}\nPhone: ${cu.phone}\nEmail: ${cu.email}\nAddress: ${cu.address}, ${cu.city}, ${cu.state}${cu.notes ? '\nNotes: ' + cu.notes : ''}`;
      await send({ to: TO, replyTo: cu.email, subject: `New order ${ref} – ${cu.name} – ${naira(total)}`, text: `New website order ${ref}\n\n${lines}\n\nSubtotal: ${naira(total)} (delivery to be confirmed)\n\n${who}` });
      // a copy for the customer; their order is already with the team if this fails
      try {
        await send({ to: cu.email, replyTo: TO, subject: `Your Sapphire Scents order ${ref}`, text: `Hello ${cu.name.split(' ')[0]},\n\nThank you for your order. The Sapphire team will contact you to confirm availability, delivery cost and payment details.\n\nOrder ${ref}\n${lines}\n\nSubtotal: ${naira(total)} (delivery to be confirmed)\n\nDeliver to: ${cu.address}, ${cu.city}, ${cu.state}\n\nSapphire Scents\n${TO}` });
      } catch (e) { console.error('customer copy failed', e.message); }
      return res.status(200).json({ ok: true, ref, total });
    }
    if (b.type === 'contact') {
      const name = clean(b.name, 120), email = clean(b.email, 160), subject = clean(b.subject, 120) || 'Website message', message = clean(b.message, 5000);
      if (!name || !okEmail(email) || !message) return res.status(400).json({ ok: false, error: 'Missing details' });
      await send({ to: TO, replyTo: email, subject: `${subject} – ${name}`, text: `${message}\n\n${name}\n${email}\n\n(Sent from the contact form on the Sapphire Scents website)` });
      return res.status(200).json({ ok: true });
    }
    return res.status(400).json({ ok: false, error: 'Unknown request' });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ ok: false, error: 'Could not send right now' });
  }
};
