# Illuminati Brotherhood — immersive story-world site (v1.1.6)

A multi-page React + Vite site backed by a FastAPI + MySQL service. The lore,
rituals, countdown and imagery are an authored story world; the Terms &
Conditions (version 1.1.6) shown in the entry gate and on `/rules` are the
governing text for visitors and members.
 
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
fallback is `https://illuminati-brotherhood.org`, inferred from the seeded admin
email; change it if that is not the live domain. Avoid building with a preview
or localhost URL as the canonical origin.

After deployment, verify the live sitemap and robots file, add the domain in
Google Search Console, submit `/sitemap.xml`, and use URL Inspection to request
crawling of the homepage and key pages. Indexing and rankings are ultimately
controlled by Google and are not guaranteed by metadata alone.

The homepage shows the published joined-members figure (`3.6M+`, see
`MEMBERS_JOINED_DISPLAY` in `src/data/content.js`) alongside the GMT countdown;
`GET /api/v1/public/stats` still exposes the aggregate registered-account count
for internal use. Archive, station, episode and volume figures come from the
actual catalogue.

## What changed in 1.1.6

| # | Change | Where |
| --- | --- | --- |
| 1 | Rules & Terms rewritten (no vouching, archives caution, entry window, hidden material, conditions) and versioned `1.1.6` | `src/i18n/locales/*/translation.json`, `src/utils/consent.js`, `src/components/ConsentGate.jsx`, `src/pages/Rules.jsx` |
| 2, 3, 21, 23 | Social accounts link correctly with real brand logos; the URLs are edited in **Admin → Settings → Social media** | `src/components/SocialIcons.jsx`, `src/components/SocialLinks.jsx`, `src/context/SiteSettingsContext.jsx`, `src/pages/admin/Settings.jsx` |
| 4 | Ritual stations take a film URL + thumbnail from the admin console and play it on the public page | `src/pages/admin/RitualsAdmin.jsx`, `src/pages/Rituals.jsx`, `src/components/MediaPlayer.jsx` |
| 5 | Only valid, non-disposable email addresses are accepted (client + API) | `src/utils/validation.js`, `backend/app/schemas/user.py` |
| 6 | The whole site stays locked (inert, scroll-locked) until the terms are acknowledged | `src/components/ConsentGate.jsx`, `src/components/Layout.jsx` |
| 7 | Membership countdown on the upper row, joined-members total (`3.6M+`) directly below it | `src/components/CountdownBar.jsx`, `src/pages/Home.jsx`, `src/pages/NewOrder.jsx` |
| 8 | Every published time is GMT/UTC | `src/data/content.js` (`TARGET_DATE`), `src/utils/validation.js` |
| 9, 15, 16 | Campaign-milestone disclaimer, “No real-world claims” and “A story, not a claim” removed from the New World Order page | `src/i18n/locales/*/translation.json` |
| 10 | OSIRIS moved to **Archives → The Third Eye** | `src/pages/ArchiveDetail.jsx`, `src/pages/Visuals.jsx` |
| 11 | Passphrases must carry a special character (plus upper/lower/digit, 8+) | `src/utils/validation.js`, `backend/app/schemas/user.py` |
| 12 | New original synthesized score, with `/public/assets/site-ambient.mp3` as an optional override | `src/hooks/useAmbientSound.js` |
| 13 | Hyperlinks corrected (no dead `#` links; unset platforms say “coming soon”) | `src/components/Footer.jsx`, `src/components/SocialLinks.jsx` |
| 14 | “New Order” renamed to **New World Order** (`/new-world-order` redirects) | all locales, `src/App.jsx`, `vercel.json` |
| 17, 23 | E-book Library with admin shelving, plus Keeper-added archive records | `src/pages/Archives.jsx`, `src/pages/admin/BooksAdmin.jsx`, `src/pages/admin/ArchivesAdmin.jsx` |
| 18 | Eight new sigils (Ankh, Triskelion, Ascending Flame, Sphinx, Grail, Dove & Serpent, Compass Rose, Lamp of Diogenes) | `src/data/content.js`, `src/components/SymbolIcon.jsx` |
| 19 | Visuals page order: Decode the Dollar → Find Your Sigil → The Sigils → Tattoos of the Unknown → The Gallery | `src/pages/Visuals.jsx` |
| 20 | Key-visual captions are Keeper-only | `src/pages/Visuals.jsx` |
| 22 | Private discussion board: an initiate only ever sees their own threads with the Keepers; a Keeper sees them all | `src/api/community.js`, `src/pages/Community.jsx`, `src/pages/admin/Messages.jsx`, `backend/app/api/v1/endpoints/community.py` |

## Website music

`useAmbientSound` plays “The New World Order” — a four-chord cathedral
progression synthesized in the browser (no licensed samples). Drop a track at
`public/assets/site-ambient.mp3` to override it; the synthesized score fades
out automatically when the file is available.

## Pages

| Route | Page |
| --- | --- |
| `/` | Home — hero, "choose your path" grid, archive carousel, symbols, countdown + members, library, videos, community, Instagram |
| `/archives`, `/archives/:slug` | Ritual Archive chambers, OSIRIS (Third Eye) + the e-book Library (`#library`) |
| `/rituals` | The seven stations (some sealed for signed-in initiates) |
| `/new-order` | Live countdown to 31 Dec 2026 23:59:59 GMT, phases, notify form |
| `/videos`, `/videos/:slug` | Filterable episode grid, featured episode, demo player, sealed episodes |
| `/visuals` | Sigil explorer + key-visual gallery with lightbox |
| `/community` | Channels, private board (your threads with the Keepers), Instagram |
| `/about` | Pillars, story timeline, FAQ, content disclaimer |
| `/login`, `/register` | Auth pages |
| `/profile` | Member area (protected) |
| `/admin` | Keeper console (admin only): members, videos, rituals, archives, e-books, council inbox, social links |

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
