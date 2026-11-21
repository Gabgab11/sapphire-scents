// POST /api/order/whatsapp: checks the order against live prices, saves it for the dashboard,
// and returns the message the customer sends on WhatsApp. The number lives in assets/js/config.json.
import { json, naira } from '../../_lib/shop.js';
import { clean, buildOrder, whoText } from '../../_lib/order.js';
import { saveOrder } from '../../_lib/orders.js';
import { newRef } from '../../_lib/paystack.js';

export async function onRequestPost({ request, env }) {
  let b = {};
  try { b = await request.json(); } catch (e) {}
  if (clean(b.website)) return json(400, { ok: false, error: 'Unknown request' });
  try {
    const o = await buildOrder(env, b);
    if (o.error) return json(o.error[0], { ok: false, error: o.error[1] });
    const { cu, items, total, lines } = o;
    const ref = newRef();
    await saveOrder(env, { ref, channel: 'whatsapp', status: 'new', cu, items, total });
    const text = `Hello Sapphire Scents, I'd like to order and pay.\n\nOrder ${ref}\n${lines}\n\nSubtotal: ${naira(total)}\n\n${whoText(cu)}`;
    return json(200, { ok: true, ref, total, text });
  } catch (e) {
    console.error('wa order', e.message);
    return json(502, { ok: false, error: 'Something went wrong. Please try again.' });
  }
}
