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
| 7 | Membership countdown and joined-members total (`3.6M+`) on Home and the New World Order hero — the separate top strip above the header was **removed** (v1.1.7) | `src/pages/Home.jsx`, `src/pages/NewOrder.jsx` |
| 8 | Every published time is GMT/UTC | `src/data/content.js` (`TARGET_DATE`), `src/utils/validation.js` |
| 9, 15, 16 | Campaign-milestone disclaimer, “No real-world claims” and “A story, not a claim” removed from the New World Order page | `src/i18n/locales/*/translation.json` |
| 10 | OSIRIS moved to **Archives → The Third Eye** | `src/pages/ArchiveDetail.jsx`, `src/pages/Visuals.jsx` |
| 11 | Passphrases must carry a special character (plus upper/lower/digit, 8+) | `src/utils/validation.js`, `backend/app/schemas/user.py` |
| 12 | New original synthesized score, with `/public/assets/site-ambient.mp3` as an optional override | `src/hooks/useAmbientSound.js` |
| 13 | Hyperlinks corrected (no dead `#` links; unset platforms say “coming soon”) | `src/components/Footer.jsx`, `src/components/SocialLinks.jsx` |
| 14 | “New Order” renamed to **New World Order** (`/new-world-order` redirects) | all locales, `src/App.jsx`, `vercel.json` |
| 17, 23 | E-book Library with admin shelving, plus Keeper-added archive records | `src/pages/Archives.jsx`, `src/pages/admin/BooksAdmin.jsx`, `src/pages/admin/ArchivesAdmin.jsx` |
| — | Keeper uploads the e-book PDF from the console; sealed volumes are served only to paid members (see *Sealed e-book library* below) | `backend/app/api/v1/endpoints/library.py`, `src/components/EbookViewer.jsx` |
| 18 | Eight new sigils (Ankh, Triskelion, Ascending Flame, Sphinx, Grail, Dove & Serpent, Compass Rose, Lamp of Diogenes) | `src/data/content.js`, `src/components/SymbolIcon.jsx` |
| 19 | Visuals page order: Decode the Dollar → Find Your Sigil → The Sigils → Tattoos of the Unknown → The Gallery | `src/pages/Visuals.jsx` |
| 20 | Key-visual captions are Keeper-only | `src/pages/Visuals.jsx` |
| 22 | Private discussion board: an initiate only ever sees their own threads with the Keepers; a Keeper sees them all | `src/api/community.js`, `src/pages/Community.jsx`, `src/pages/admin/Messages.jsx`, `backend/app/api/v1/endpoints/community.py` |

## Sealed e-book library (admin PDF uploads)

The Keeper uploads a volume from **Admin → E-Books → Add a volume**: drop the
PDF on the upload panel (or paste a link to a hosted file), choose a cover and
set **ACCESS** to `PAID — sealed members only` (the default) or `FREE — anyone`.
The file is written to the API server — `backend/uploads/ebooks/` by default,
which is *outside* any statically served folder — and the book record only ever
holds an opaque key (`extra.file_key`), never a public URL.

Who may read a sealed volume is decided by the API on **every request**
(`GET /api/v1/library/books/{id}/file`):

| Reader | Result |
| --- | --- |
| Not signed in | `401` — "Sign in to open this volume." |
| Signed in, initiation unpaid | `402` — "This volume is sealed. Complete your initiation to read it." |
| Signed in, ₹999 initiation sealed (`user.paid`) | `200` — the PDF, inline for reading or as an attachment for download |
| Keeper (admin) | `200` — for the console's previews and the file shelf |

The public catalogue (`GET /content/book`) is readable by anyone, but a sealed
volume's file link, storage key and file name are **redacted** for readers who
have not paid; only `has_file` / `file_storage` survive so the Library can show
the sealed state with a working call to action. Because of this, a member who
pays while the page is open gets the volume immediately — the Library asks for
it by the book's public id, and the entitlement is re-checked server-side.

On the public Library (`/archives#library`) an unlocked volume shows
**READ ONLINE** (an in-page PDF reader fed by a Blob URL, so the file is never a
public link) and **DOWNLOAD PDF**. Each successful download is counted on the
book record and shown in the Keeper console.

Housekeeping in the console:

- **UPLOAD PDF / REPLACE PDF** on any volume attaches or swaps its file
  (`PATCH /content/book/{id}/file`, which validates the key server-side).
- The **upload shelf** at the bottom of the page lists every file on disk with
  its size and owning volume; unattached files are Keeper-only and can be
  deleted there. Deleting a volume deletes its file.
- Uploads are limited to PDF/EPUB, checked by extension **and** magic bytes, and
  capped by `MAX_EBOOK_SIZE_MB` (default 100 MB) in `backend/.env`.

Deployment notes: this needs the FastAPI service (and its disk) — a
frontend-only Vercel deploy must set `VITE_API_BASE_URL` to the API origin and
allow that origin in `CORS_ORIGINS`. Uploaded volumes are gitignored
(`backend/uploads/`) and are not part of the repository; back the folder up as
you would any other user data.

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
  api/                FastAPI client (auth, content, sealed e-book library)
  auth/authService.js FastAPI authentication client
  context/            AuthContext, ContentContext (sealed items), ToastContext
  components/         Navbar, Footer, Layout, PageHero, SEO metadata, ...
  data/content.js     bundled page content and fallback catalogue
  pages/              one file per route
scripts/prerender.mjs build-time public route rendering, sitemap and robots
scripts/smoke-ssr.mjs render-every-route smoke test
```
