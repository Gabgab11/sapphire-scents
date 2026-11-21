// Serves the live product list (from the dashboard) as a small script every page loads
// right after assets/js/catalog.js. If the database can't be reached, it returns a no-op
// and the site keeps showing the built-in catalogue.
const { liveProducts } = require('./_db');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  try {
    const rows = await liveProducts();
    if (!rows || !rows.length) throw new Error('empty');
    // fresh for 20 seconds at the edge, then served stale while it refreshes
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=20, stale-while-revalidate=600');
    const json = JSON.stringify(rows).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    res.status(200).send(`window.SS_APPLY&&SS_APPLY(${json});`);
  } catch (e) {
    console.error('catalog', e.message);
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=5');
    res.status(200).send('/* live catalogue unavailable: using the built-in list */');
  }
};
