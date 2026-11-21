// Shared Supabase settings for the server functions.
// The publishable key is public by design: row-level security in the database decides what it can read.
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sisketddtfuwwwtdxduy.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || require('../assets/js/config.json').supabaseKey;

async function liveProducts() {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 4000);
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,type,name,price,in_stock,sort,data&visible=eq.true&order=sort.asc`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      signal: ctrl.signal
    });
    if (!r.ok) throw new Error('Supabase ' + r.status);
    const rows = await r.json();
    return Array.isArray(rows) ? rows : null;
  } finally { clearTimeout(t); }
}

module.exports = { SUPABASE_URL, SUPABASE_KEY, liveProducts };
