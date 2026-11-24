// Always-current sitemap: new products added in the dashboard appear here automatically.
import { products, SITE } from './_lib/seo.js';
export async function onRequestGet(ctx) {
  const rows = await products(ctx.env, ctx).catch(() => []);
  const day = new Date().toISOString().slice(0, 10);
  const pages = ['/', '/perfumes', '/diffusers', '/refills', '/about', '/contact', '/best-nigerian-perfume'];
  const u = (loc, pr) => `  <url><loc>${loc}</loc><lastmod>${day}</lastmod>${pr ? `<priority>${pr}</priority>` : ''}</url>`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p, i) => u(SITE + p, i === 0 ? '1.0' : '0.8')).join('\n')}\n${rows.map(r => u(`${SITE}/product?id=${encodeURIComponent(r.id)}`, '0.7')).join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
