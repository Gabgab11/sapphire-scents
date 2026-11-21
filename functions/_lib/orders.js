// Saves website orders to the database so they show in the dashboard.
// Needs SUPABASE_SECRET_KEY (an sb_secret_… key) in Cloudflare › Variables and secrets.
// Without it orders still go through; they just aren't listed in the dashboard.
import config from '../../assets/js/config.json';

const ready = env => !!(env.SUPABASE_SECRET_KEY && config.supabaseUrl);
async function rest(env, path, init) {
  const r = await fetch(`${config.supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: env.SUPABASE_SECRET_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal', ...(init.headers || {}) }
  });
  if (!r.ok) throw new Error('orders ' + r.status + ' ' + (await r.text()).slice(0, 200));
}

export async function saveOrder(env, { ref, channel, status, cu, items, total }) {
  if (!ready(env)) return;
  try { await rest(env, 'orders', { method: 'POST', body: JSON.stringify({ id: ref, channel, status, customer: cu, items, total }) }); }
  catch (e) { console.error('save order', e.message); }
}

// Only moves an unpaid order to paid, so repeats (verify + webhook) are harmless
export async function markPaid(env, ref, { amount, paystackRef }) {
  if (!ready(env)) return;
  try {
    await rest(env, `orders?id=eq.${encodeURIComponent(ref)}&status=in.(new,awaiting_payment)`, {
      method: 'PATCH', body: JSON.stringify({ status: 'paid', paid_amount: amount, paid_at: new Date().toISOString(), paystack_ref: paystackRef })
    });
  } catch (e) { console.error('mark paid', e.message); }
}
