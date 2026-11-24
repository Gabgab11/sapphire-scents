// Runs before every request on the site.
// 1. Hides files that are in the code repository but must never be served (database setup,
//    notes, function source, old Vercel files).
// 2. Slows down anyone hammering the order, contact or payment endpoints.
const HIDDEN = /^\/(supabase|functions|api\/_|node_modules)(\/|$)|^\/(README|readme)(\.md)?$|^\/vercel\.json$|^\/package(-lock)?\.json$|^\/api\/[^/]+\.js$|^\/\.(?!well-known\/)|\.(sql|md|map|bak|env|log)$/i;

import config from '../assets/js/config.json';
import { products, productPage, listPage, ldTag, esc, SITE } from './_lib/seo.js';

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

// Old WordPress addresses that Google still has: send each one to the matching new page (301),
// so the shop keeps its search ranking and nobody lands on a dead page.
async function oldAddress(ctx, url) {
  const p = url.pathname.toLowerCase().replace(/\/+$/, '');
  const go = to => Response.redirect(SITE + to, 301);
  const cat = p.match(/^\/product-category\/([^/]+)/);
  if (cat) return go({ 'sapphire-perfume': '/perfumes', 'perfumes': '/perfumes', 'scent-refills': '/refills', 'diffusers': '/diffusers' }[cat[1]] || '/perfumes');
  const prod = p.match(/^\/product\/([^/]+)$/);
  if (prod) {
    const slug = prod[1];
    if (/^diffusers?$/.test(slug)) return go('/diffusers');
    const rows = await products(ctx.env, ctx).catch(() => []);
    const ids = new Set(rows.map(r => r.id));
    const base = slug.replace(/-\d+$/, '').replace(/-(scent-)?(refill|oil|perfume|diffuser)$/, '');
    const tries = [slug, slug.replace(/-\d+$/, '') + '-refill', base, base + '-refill', base.replace(/^the-/, '')];
    if (/-\d+$/.test(slug)) tries.splice(1, 0, base + '-refill');
    const hit = tries.find(t => ids.has(t)) || (rows.find(r => r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === base) || {}).id;
    return go(hit ? `/product?id=${encodeURIComponent(hit)}` : `/search?q=${encodeURIComponent(base.replace(/-/g, ' '))}`);
  }
  const fixed = { '/about-us': '/about', '/shop': '/perfumes', '/cart': '/checkout', '/my-account': '/', '/news': '/about', '/blog': '/about' }[p];
  if (fixed) return go(fixed);
  if (/^\/(category|tag|author|feed|\d{4})(\/|$)/.test(p)) return go('/about');
  if (/sitemap.*\.xml$/.test(p) && p !== '/sitemap.xml') return go('/sitemap.xml');
  return null;
}

async function seoFor(ctx, url) {
  const p = url.pathname.replace(/\.html$/, '');
  const pages = { '/perfumes': ['perfume', 'Perfumes', '#grid'], '/refills': ['refill', 'Scent refills', '#rgrid'], '/diffusers': ['diffuser', 'Diffusers', '#dgrid'] };
  if (p === '/product') {
    const id = url.searchParams.get('id') || '';
    const rows = await products(ctx.env, ctx);
    const row = rows.find(r => r.id === id);
    if (!row) return rows.length ? { ld: [], robots: 'noindex' } : null;
    const pg = productPage(row);
    return { ...pg, target: '#pdp' };
  }
  if (pages[p]) {
    const [type, name, target] = pages[p];
    const rows = await products(ctx.env, ctx);
    if (!rows.length) return null;
    const lp = listPage(rows, type, p, name);
    return { ld: [lp.ld], url: SITE + p, body: lp.body, target };
  }
  return null;
}

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Google Search Console checks this exact address; Pages would otherwise redirect away from .html
  if (path === '/google04b880f18e611c66.html' || path === '/google04b880f18e611c66') return new Response('google-site-verification: google04b880f18e611c66.html', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  const moved = await oldAddress(context, url).catch(() => null);
  if (moved) return moved;
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
  if (res.status === 404 && request.method === 'GET' && /^\/[a-z0-9-]+\/?$/i.test(path) && path.length > 12) return Response.redirect(SITE + '/about', 301);
  const type = res.headers.get('content-type') || '';
  if (!type.includes('text/html') || path.startsWith('/admin')) return res;
  let look = 'midnight';
  try { look = await currentLook(context); } catch (e) {}
  const preview = url.searchParams.get('look'); // the dashboard's preview, for that one page only
  if (preview && LOOKS.includes(preview)) look = preview;

  // Real text and structured data for search engines on product and category pages
  const seo = await seoFor(context, url).catch(() => null);
  // one clean address per page for search engines (no .html, no tracking bits)
  const plain = path === '/' || seo ? null : SITE + path.replace(/\.html$/, '').replace(/\/index$/, '/');
  if (look === 'midnight' && !seo && !plain) return res;
  let rw = new HTMLRewriter();
  if (plain && !/\/(search|checkout|admin)/.test(path)) rw = rw.on('head', { element(el) { el.append(`<link rel="canonical" href="${esc(plain)}">`, { html: true }); } });
  if (look !== 'midnight') rw = rw
    .on('html', { element(el) { el.setAttribute('data-look', look); } })
    .on('meta[name="theme-color"]', { element(el) { el.setAttribute('content', THEME_COLOR[look]); } });
  if (seo) {
    if (seo.title) rw = rw.on('title', { element(el) { el.setInnerContent(seo.title); } })
      .on('meta[property="og:title"]', { element(el) { el.setAttribute('content', seo.title); } });
    if (seo.desc) rw = rw.on('meta[name="description"]', { element(el) { el.setAttribute('content', seo.desc); } })
      .on('meta[property="og:description"]', { element(el) { el.setAttribute('content', seo.desc); } });
    if (seo.image) rw = rw.on('meta[property="og:image"]', { element(el) { el.setAttribute('content', seo.image); } });
    if (seo.robots) rw = rw.on('meta[name="robots"]', { element(el) { el.setAttribute('content', seo.robots); } });
    rw = rw.on('head', { element(el) {
      el.append(seo.ld.map(ldTag).join(''), { html: true });
      if (seo.url) el.append(`<link rel="canonical" href="${esc(seo.url)}">`, { html: true });
      if (seo.robots) el.append(`<meta name="robots" content="${seo.robots}">`, { html: true });
    } });
    if (seo.body && seo.target) rw = rw.on(seo.target, { element(el) { el.setInnerContent(seo.body, { html: true }); } });
  }
  const out = rw.transform(res);
  const h = new Headers(out.headers); h.set('Cache-Control', 'no-cache');
  return new Response(out.body, { status: out.status, statusText: out.statusText, headers: h });
}
