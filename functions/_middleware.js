// Runs before every request on the site.
// 1. Hides files that are in the code repository but must never be served (database setup,
//    notes, function source, old Vercel files).
// 2. Slows down anyone hammering the order, contact or payment endpoints.
const HIDDEN = /^\/(supabase|functions|api\/_|node_modules)(\/|$)|^\/(README|readme)(\.md)?$|^\/vercel\.json$|^\/package(-lock)?\.json$|^\/api\/[^/]+\.js$|^\/\.(?!well-known\/)|\.(sql|md|map|bak|env|log)$/i;

import config from '../assets/js/config.json';

// The shop's look (theme) is picked by an owner in the dashboard and saved in the settings table.
// It's stamped onto every page as <html data-look="…"> before the page reaches the browser,
// so there is never a flash of the wrong colours. Cached for a minute at the edge.
export const LOOKS = ['midnight', 'ivory', 'noir', 'royal', 'rose', 'emerald'];
const THEME_COLOR = { midnight: '#070C29', ivory: '#F6F1E8', noir: '#0D0B09', royal: '#0B1D5C', rose: '#24101A', emerald: '#0A2620' };
const lagosDay = () => new Date(Date.now() + 3600e3).toISOString().slice(0, 10); // Nigeria is UTC+1

export function effectiveLook(v) {
  if (!v || typeof v !== 'object') return 'midnight';
  const s = v.schedule, today = lagosDay();
  if (s && LOOKS.includes(s.id) && s.from && s.to && today >= s.from && today <= s.to) return s.id;
  return LOOKS.includes(v.id) ? v.id : 'midnight';
}

async function currentLook(ctx) {
  const key = new Request('https://settings.internal/look');
  const cache = caches.default;
  const hit = await cache.match(key);
  if (hit) return hit.text();
  let look = 'midnight';
  try {
    const r = await fetch(`${config.supabaseUrl}/rest/v1/settings?key=eq.look&select=value`, { headers: { apikey: config.supabaseKey } });
    if (r.ok) { const rows = await r.json(); look = effectiveLook(rows[0] && rows[0].value); }
  } catch (e) {}
  ctx.waitUntil(cache.put(key, new Response(look, { headers: { 'Cache-Control': 'max-age=60' } })));
  return look;
}

const LIMITS = { '/api/send': 6, '/api/order/whatsapp': 8, '/api/pay/init': 10, '/api/pay/verify': 30 }; // per IP per 10 minutes

async function tooMany(request, path) {
  const max = (request.method === 'POST' || path === '/api/pay/verify') ? LIMITS[path] : 0;
  if (!max) return false;
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const slot = Math.floor(Date.now() / 600000);
  const key = new Request(`https://ratelimit.internal/${encodeURIComponent(path)}/${encodeURIComponent(ip)}/${slot}`);
  const cache = caches.default;
  const hit = await cache.match(key);
  const n = hit ? parseInt(await hit.text(), 10) || 0 : 0;
  if (n >= max) return true;
  await cache.put(key, new Response(String(n + 1), { headers: { 'Cache-Control': 'max-age=600' } }));
  return false;
}

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Google Search Console checks this exact address; Pages would otherwise redirect away from .html
  if (path === '/google04b880f18e611c66.html' || path === '/google04b880f18e611c66') return new Response('google-site-verification: google04b880f18e611c66.html', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  if (HIDDEN.test(path)) return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain', 'X-Robots-Tag': 'noindex' } });

  if (path.startsWith('/api/')) {
    // Payment confirmations from Paystack are signed and never throttled
    if (path !== '/api/pay/webhook') {
      try { if (await tooMany(request, path)) return new Response(JSON.stringify({ ok: false, error: 'Too many tries. Please wait a few minutes and try again.' }), { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '600' } }); }
      catch (e) { /* never block a real customer because the counter failed */ }
      // Browser requests to the shop's endpoints must come from the shop itself
      const origin = request.headers.get('origin');
      if (request.method === 'POST' && origin && origin !== url.origin) return new Response(JSON.stringify({ ok: false, error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
  }
  const res = await next();
  const type = res.headers.get('content-type') || '';
  if (!type.includes('text/html') || path.startsWith('/admin')) return res;
  let look = 'midnight';
  try { look = await currentLook(context); } catch (e) {}
  const preview = url.searchParams.get('look'); // the dashboard's preview, for that one page only
  if (preview && LOOKS.includes(preview)) look = preview;
  if (look === 'midnight') return res;
  const out = new HTMLRewriter()
    .on('html', { element(el) { el.setAttribute('data-look', look); } })
    .on('meta[name="theme-color"]', { element(el) { el.setAttribute('content', THEME_COLOR[look]); } })
    .transform(res);
  const h = new Headers(out.headers); h.set('Cache-Control', 'no-cache');
  return new Response(out.body, { status: out.status, statusText: out.statusText, headers: h });
}
