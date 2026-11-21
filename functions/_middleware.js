// Runs before every request on the site.
// 1. Hides files that are in the code repository but must never be served (database setup,
//    notes, function source, old Vercel files).
// 2. Slows down anyone hammering the order, contact or payment endpoints.
const HIDDEN = /^\/(supabase|functions|api\/_|node_modules)(\/|$)|^\/(README|readme)(\.md)?$|^\/vercel\.json$|^\/package(-lock)?\.json$|^\/api\/[^/]+\.js$|^\/\.(?!well-known\/)|\.(sql|md|map|bak|env|log)$/i;

const LIMITS = { '/api/send': 6, '/api/pay/init': 10, '/api/pay/verify': 30 }; // per IP per 10 minutes

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
  return next();
}
