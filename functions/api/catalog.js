// GET /api/catalog: the live product list as a small script. Every page loads it right after
// assets/js/catalog.js. If the database can't be reached it returns a no-op and the site keeps
// the built-in catalogue. Cached at Cloudflare's edge for 20 seconds.
import { liveProducts } from '../_lib/shop.js';

export async function onRequestGet(context) {
  const { request, env, waitUntil } = context;
  const cache = caches.default;
  const cacheKey = new Request(new URL('/api/catalog', request.url).toString(), { method: 'GET' });
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const headers = { 'Content-Type': 'application/javascript; charset=utf-8', 'X-Content-Type-Options': 'nosniff' };
  try {
    const rows = await liveProducts(env);
    if (!rows || !rows.length) throw new Error('empty');
    const body = `window.SS_APPLY&&SS_APPLY(${JSON.stringify(rows).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')});`;
    const res = new Response(body, { headers: { ...headers, 'Cache-Control': 'public, max-age=0, s-maxage=20' } });
    waitUntil(cache.put(cacheKey, res.clone()));
    return res;
  } catch (e) {
    console.error('catalog', e.message);
    return new Response('/* live catalogue unavailable: using the built-in list */', { headers: { ...headers, 'Cache-Control': 'no-store' } });
  }
}
