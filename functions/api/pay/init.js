// POST /api/pay/init: checks the order against live prices, opens a Paystack payment and
// returns the page the customer pays on. GET tells the checkout whether paying online is switched on.
import { json } from '../../_lib/shop.js';
import { clean, buildOrder, place } from '../../_lib/order.js';
import { payReady, payMode, paystack, newRef } from '../../_lib/paystack.js';
import { saveOrder } from '../../_lib/orders.js';

export const onRequestGet = ({ env }) => json(200, { enabled: payReady(env), mode: payReady(env) ? payMode(env) : null });

export async function onRequestPost({ request, env }) {
  if (!payReady(env)) return json(503, { ok: false, error: 'Online payment is not switched on yet' });
  let b = {};
  try { b = await request.json(); } catch (e) {}
  if (clean(b.website)) return json(400, { ok: false, error: 'Unknown request' });
  try {
    const o = await buildOrder(env, b);
    if (o.error) return json(o.error[0], { ok: false, error: o.error[1] });
    const { cu, items, total } = o;
    const ref = newRef();
    const origin = new URL(request.url).origin;
    const d = await paystack(env, '/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify({
        email: cu.email,
        amount: Math.round(total * 100), // kobo
        currency: 'NGN',
        reference: ref,
        callback_url: `${origin}/checkout?paid=1`,
        metadata: {
          order: ref, customer: cu, items, total,
          cancel_action: `${origin}/checkout`,
          custom_fields: [
            { display_name: 'Customer', variable_name: 'customer', value: `${cu.name} · ${cu.phone}` },
            { display_name: 'Deliver to', variable_name: 'deliver_to', value: `${place(cu)}` },
            { display_name: 'Items', variable_name: 'items', value: items.map(i => `${i.name}${i.opt ? ' (' + i.opt + ')' : ''} × ${i.qty}`).join(', ').slice(0, 900) }
          ]
        }
      })
    });
    await saveOrder(env, { ref, channel: 'paystack', status: 'awaiting_payment', cu, items, total });
    return json(200, { ok: true, ref, total, url: d.authorization_url });
  } catch (e) {
    console.error('pay init', e.message);
    return json(502, { ok: false, error: 'Payment could not start. Please try again, or place the order and pay later.' });
  }
}
