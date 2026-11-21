// GET /api/pay/verify?reference=SS-…: asks Paystack (never the browser) whether the payment went through.
import { json, naira } from '../../_lib/shop.js';
import { clean, orderLines } from '../../_lib/order.js';
import { payReady, paystack } from '../../_lib/paystack.js';

export async function onRequestGet({ request, env }) {
  if (!payReady(env)) return json(503, { ok: false, error: 'Online payment is not switched on yet' });
  const ref = clean(new URL(request.url).searchParams.get('reference'), 40);
  if (!/^[A-Za-z0-9_-]{6,40}$/.test(ref)) return json(400, { ok: false, error: 'Missing payment reference' });
  try {
    const d = await paystack(env, '/transaction/verify/' + encodeURIComponent(ref));
    const m = d.metadata || {};
    const paid = d.status === 'success' && d.currency === 'NGN' && d.amount === Math.round((m.total || 0) * 100);
    const cu = m.customer || {};
    return json(200, {
      ok: true, paid, status: d.status, ref,
      amount: d.amount / 100, amountText: naira(d.amount / 100),
      name: cu.name || '', phone: cu.phone || '', email: cu.email || d.customer?.email || '',
      lines: Array.isArray(m.items) ? orderLines(m.items) : ''
    });
  } catch (e) {
    console.error('pay verify', e.message);
    return json(502, { ok: false, error: 'Could not check the payment right now' });
  }
}
