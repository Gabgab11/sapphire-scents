# Sapphire Scents

The website for Sapphire Scents, the Nigerian perfume house founded by Wale Jana in 2015.

## Pages
- `index.html`: animated logo intro, lights-on hero (a new scent on every visit), the Lineup, best sellers, diffusers, collections and refills
- `perfumes.html`: all 27 perfumes with filters by collection and note, search and sort
- `diffusers.html`: the i-1, i-3, i-5 and F-AIR diffusers, with a comparison table
- `refills.html`: 25 scent refills
- `product.html?id=…`: one page per product (perfume, refill or diffuser)
- `about.html`, `contact.html`, `checkout.html`, `404.html`

## How it's built
Plain HTML, CSS and JavaScript. No framework or build step.
- `assets/js/catalog.js`: every product, price, note and description, plus the ingredient artwork. Edit this file to change prices or add products.
- `assets/js/site.js`: shared header, menu, footer, bag and product cards.
- `assets/css/site.css`: all styles.
- `images/`: product photos and the logo.

The bag is kept in the visitor's browser. Checkout sends the order to info@shopsapphirescents.com by email; the team then confirms delivery and payment. Online card payment (for example Paystack) can be added later.

Deployed on Vercel from the `main` branch.

## Order and contact emails
Checkout orders and contact messages are sent by `api/send.js` (a Vercel function using Resend).
Set these in Vercel → Project → Settings → Environment Variables, then redeploy:
- `RESEND_API_KEY` – Resend API key
- `MAIL_FROM` – sender on a domain verified in Resend, e.g. `Sapphire Scents <orders@shopsapphirescents.com>`
- `MAIL_TO` – inbox for orders (defaults to info@shopsapphirescents.com)

Until they are set, the site falls back to letting the customer email, copy or Instagram the order.

## Dashboard (admin)
`/admin` is the staff dashboard: products, prices, stock, photos, bulk CSV upload, history and team.
Data lives in Supabase (project "Sapphire Scents"): `supabase/schema.sql` creates the tables, security rules and the
`products` photo bucket; `supabase/seed.sql` loads the original 56 products. Set the project URL and publishable key in
`assets/js/config.json`. Every page loads `/api/catalog`, which returns the live products; if it can't, the built-in list
in `assets/js/catalog.js` is used.

Adding staff: an owner adds the email on the dashboard's Team tab, then creates the login in Supabase
(Authentication › Users › Add user, with "Auto confirm"). Turn off public sign-ups in Supabase Auth settings.

## Hosting: Cloudflare Pages
Connect this GitHub repo in Cloudflare Pages (no build command, output directory `/`). The server code is in `functions/`
(`/api/catalog`, `/api/send`); `_headers` sets caching. Environment variables for order emails: `RESEND_API_KEY` (secret),
`MAIL_FROM`, `MAIL_TO`. The `api/` folder and `vercel.json` are the old Vercel versions and can be deleted after the move.
