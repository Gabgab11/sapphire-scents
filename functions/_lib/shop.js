// Shared helpers for the Cloudflare Pages functions.
import config from '../../assets/js/config.json';

export const supabaseUrl = env => env.SUPABASE_URL || config.supabaseUrl;
export const supabaseKey = env => env.SUPABASE_PUBLISHABLE_KEY || config.supabaseKey;

// Products shown on the shop, straight from the dashboard's database.
export async function liveProducts(env) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 4000);
  try {
    const key = supabaseKey(env);
    const r = await fetch(`${supabaseUrl(env)}/rest/v1/products?select=id,type,name,price,in_stock,sort,data&visible=eq.true&order=sort.asc`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: ctrl.signal
    });
    if (!r.ok) throw new Error('Supabase ' + r.status);
    const rows = await r.json();
    return Array.isArray(rows) ? rows : null;
  } finally { clearTimeout(t); }
}

export const naira = n => '₦' + Number(n || 0).toLocaleString('en-NG');
export const KINDS = { perfume: 'Perfume', refill: 'Scent refill', diffuser: 'Diffuser' };
export const json = (status, body, extra = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra } });
