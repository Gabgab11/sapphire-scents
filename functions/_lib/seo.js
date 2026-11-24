// Search engines and AI assistants often read a page without running its JavaScript.
// This fills product and category pages with real text, prices and structured data
// (schema.org) on the server, so Google, Bing, ChatGPT, Perplexity and Claude all see them.
import { liveProducts, naira, KINDS } from './shop.js';

const SITE = 'https://www.shopsapphirescents.com';
const IMG = { amber: 'images/crown-amber.webp', jag: 'images/crown-jagaban.webp', hero: 'images/hero-bottle.webp', flower: 'images/flower.webp' };
const SECTION = { perfume: ['/perfumes', 'Perfumes'], refill: ['/refills', 'Scent refills'], diffuser: ['/diffusers', 'Diffusers'] };
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ld = o => JSON.stringify(o).replace(/</g, '\\u003c');

export const imgUrl = d => {
  const v = (d && (d.img || (Array.isArray(d.images) && d.images[0]))) || 'amber';
  if (/^https:\/\//.test(v)) return v;
  return SITE + '/' + String(IMG[v] || v).replace(/^\//, '');
};
const blurb = p => {
  const d = p.data || {};
  const lead = d.tagline || d.summary || d.story || '';
  const notes = Array.isArray(d.notes) && d.notes.length ? `Notes of ${d.notes.join(', ')}.` : '';
  return [lead, notes].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
};

export async function products(env, ctx) {
  const key = new Request('https://seo.internal/products');
  const hit = await caches.default.match(key);
  if (hit) return hit.json();
  const rows = (await liveProducts(env).catch(() => null)) || [];
  if (rows.length) ctx.waitUntil(caches.default.put(key, new Response(JSON.stringify(rows), { headers: { 'Cache-Control': 'max-age=300' } })));
  return rows;
}

export function productLd(p) {
  const d = p.data || {}, url = `${SITE}/product?id=${encodeURIComponent(p.id)}`, sec = SECTION[p.type] || SECTION.perfume;
  return [{
    '@context': 'https://schema.org', '@type': 'Product', '@id': url + '#product',
    name: p.name, sku: p.id, url, image: imgUrl(d),
    description: blurb(p) || `${p.name}, a ${(KINDS[p.type] || 'product').toLowerCase()} by Sapphire Scents, made in Nigeria.`,
    brand: { '@type': 'Brand', name: 'Sapphire Scents' },
    category: KINDS[p.type] || 'Perfume',
    ...(d.family ? { additionalProperty: [{ '@type': 'PropertyValue', name: 'Scent family', value: d.family }] } : {}),
    countryOfOrigin: 'NG',
    offers: {
      '@type': 'Offer', url, priceCurrency: 'NGN', price: String(p.price),
      availability: p.in_stock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'Sapphire Scents', url: SITE + '/' }
    }
  }, {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: sec[1], item: SITE + sec[0] },
      { '@type': 'ListItem', position: 3, name: p.name, item: url }
    ]
  }];
}

// <head> tags and visible text for one product page
export function productPage(p) {
  const d = p.data || {}, kind = KINDS[p.type] || 'Perfume', url = `${SITE}/product?id=${encodeURIComponent(p.id)}`;
  const title = `${p.name} ${kind === 'Perfume' ? 'Perfume' : kind} – ${naira(p.price)} | Sapphire Scents Nigeria`;
  const desc = (`${p.name} by Sapphire Scents, made in Nigeria. ${blurb(p)} ${naira(p.price)}.`).replace(/\s+/g, ' ').slice(0, 300);
  const body = `<article class="ssr"><h1>${esc(p.name)}</h1><p>${esc(kind)}${d.family ? ' · ' + esc(d.family) : ''} · ${esc(naira(p.price))}${p.in_stock === false ? ' · Sold out' : ''}</p>${blurb(p) ? `<p>${esc(blurb(p))}</p>` : ''}${d.story && d.story !== blurb(p) ? `<p>${esc(d.story)}</p>` : ''}<p>Made in Nigeria by Sapphire Scents. Order online with Paystack or on WhatsApp, with delivery across Nigeria.</p></article>`;
  return { title, desc, url, image: imgUrl(d), ld: productLd(p), body };
}

// ItemList data and crawlable links for a category page
export function listPage(rows, type, path, name) {
  const list = rows.filter(r => r.type === type);
  return {
    ld: {
      '@context': 'https://schema.org', '@type': 'CollectionPage', name: `${name} | Sapphire Scents`, url: SITE + path,
      mainEntity: { '@type': 'ItemList', numberOfItems: list.length, itemListElement: list.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/product?id=${encodeURIComponent(p.id)}`, name: p.name })) }
    },
    body: `<ul class="ssr">${list.map(p => `<li><a href="product?id=${encodeURIComponent(p.id)}">${esc(p.name)}</a> – ${esc(naira(p.price))}${p.data && p.data.family ? ' · ' + esc(p.data.family) : ''}</li>`).join('')}</ul>`
  };
}
export const ldTag = o => `<script type="application/ld+json">${ld(o)}</script>`;
export { esc, SITE };
