// Paystack helpers. Cloudflare Pages settings › Variables and secrets: PAYSTACK_SECRET_KEY (sk_test_… or sk_live_…).
export const payReady = env => !!(env.PAYSTACK_SECRET_KEY && /^sk_(test|live)_/.test(env.PAYSTACK_SECRET_KEY));
export const payMode = env => (env.PAYSTACK_SECRET_KEY || '').startsWith('sk_live_') ? 'live' : 'test';

export async function paystack(env, path, init = {}) {
  const r = await fetch('https://api.paystack.co' + path, {
    ...init,
    headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json', ...(init.headers || {}) }
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.status) throw new Error('Paystack ' + r.status + ' ' + (j.message || ''));
  return j.data;
}

export const newRef = () => 'SS-' + Date.now().toString(36).toUpperCase().slice(-5) + '-' + crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase().slice(0, 4);
