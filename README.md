# Illuminati Brotherhood — fictional entertainment experience
 
A multi-page React + Vite site. All lore, rituals, countdowns and imagery are
fiction created for entertainment; nothing here is a real-world claim.
 
## Run
 
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build + prerendered SEO pages, sitemap.xml and robots.txt in dist/
npm run preview    # serve the production build
npm run smoke      # SSR-render every route to catch runtime errors
```

## SEO, indexing & live member totals

The app now prerenders its public routes to crawlable HTML at build time. Every
public route gets a unique title, description, canonical URL, Open Graph/Twitter
metadata and JSON-LD; the build also writes `dist/sitemap.xml`, `dist/robots.txt`
and a custom 404 page. `VITE_SITE_URL` must be the exact canonical production
origin (for example `https://your-domain.example`) before deploying. The
fallback is `https://illuminati-brotherhood.io`, inferred from the seeded admin
email; change it if that is not the live domain. Avoid building with a preview
or localhost URL as the canonical origin.

After deployment, verify the live sitemap and robots file, add the domain in
Google Search Console, submit `/sitemap.xml`, and use URL Inspection to request
crawling of the homepage and key pages. Indexing and rankings are ultimately
controlled by Google and are not guaranteed by metadata alone.

The homepage's animated member counter reads an aggregate-only public API
endpoint (`GET /api/v1/public/stats`) and never exposes member records. Archive,
station and episode figures come from the actual bundled catalogue. No
success-story/testimonial total is fabricated; add one only when verified
success-story data exists.

## Pages

| Route | Page |
| --- | --- |
| `/` | Home — hero, "choose your path" grid, archive carousel, symbols, countdown, videos, community, Instagram |
| `/archives`, `/archives/:slug` | The six chambers of the Ritual Archive + detail records |
| `/rituals` | The seven stations (some sealed for signed-in initiates) |
| `/new-order` | Live countdown to 31 Dec 2026, phases, notify form |
| `/videos`, `/videos/:slug` | Filterable episode grid, featured episode, demo player, sealed episodes |
| `/visuals` | Sigil explorer + key-visual gallery with lightbox |
| `/community` | Channels, discussion board (post as a member), Instagram |
| `/about` | Pillars, story timeline, FAQ, content disclaimer |
| `/login`, `/register` | Auth pages |
| `/profile` | Member area (protected) |
| `/admin` | Keeper console (admin only): members, roles, sealed content |

## Accounts & roles

Authentication and content use the FastAPI service in `backend/`; user records
are stored in MySQL and the browser stores only a JWT session token in
`localStorage`. The frontend calls `/api/v1` (Vite proxies this to port 8000 in
development). Set `VITE_API_BASE_URL` for a separately hosted production API,
and configure the backend CORS origins to match the site.

| Role | Access |
| --- | --- |
| Visitor | All public pages; sealed rituals/videos show a sign-in prompt |
| Initiate (member) | Everything above + sealed content, discussion board posting, profile |
| Keeper (admin) | Everything above + `/admin`: promote/demote, banish, seal/unseal content |

The backend seeds a Keeper from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in
`backend/.env` when the service starts. The frontend's `VITE_ADMIN_EMAIL` and
`VITE_ADMIN_PASSWORD` values only populate the optional demo credential box in
development; they do not create or secure the backend account.

Safety rails: you cannot demote or banish yourself, and the last Keeper can
never be removed.

## Mobile art direction

Wide 16:9 artwork crops badly on phones, so every hero has a dedicated
portrait (9:16) version: `public/assets/*-hero-mobile.jpg` and
`hero-baphomet-mobile.jpg`. `PageHero` (and the Home hero) pick the portrait
image below 720px via `matchMedia`, and the `@media(max-width:720px)` block at
the end of `App.css` switches the grids to image-led poster layouts
(tall cards, horizontal snap rails, 2-up posters).

## Project layout

```
public/assets/        page hero images, ritual & video artwork
src/
  auth/authService.js FastAPI authentication client
  context/            AuthContext, ContentContext (sealed items), ToastContext
  components/         Navbar, Footer, Layout, PageHero, SEO metadata, ...
  data/content.js     bundled page content and fallback catalogue
  pages/              one file per route
scripts/prerender.mjs build-time public route rendering, sitemap and robots
scripts/smoke-ssr.mjs render-every-route smoke test
```
