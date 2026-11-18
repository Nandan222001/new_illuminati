# Illuminati Brotherhood — myths, symbols and history

A React + Vite site backed by a FastAPI service. Public articles explain myths,
symbols and history using linked sources. The paid archive is a separate
fictional experience. The Terms & Conditions (version 1.1.6) are unchanged.

## Run
 
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build + prerendered SEO pages, sitemap.xml and robots.txt in dist/
npm run preview    # serve the production build
npm run smoke      # SSR-render the application routes
npm test           # audit regression checks against dist/ (run npm run build first)
```

## SEO and indexing

The app now prerenders its public routes to crawlable HTML at build time. Every
public route gets a unique title, description, canonical URL, Open Graph/Twitter
metadata and JSON-LD; the build also writes `dist/sitemap.xml`, `dist/robots.txt`
and a custom 404 page. `VITE_SITE_URL` must be the exact canonical production
origin (for example `https://your-domain.example`) before deploying. The
fallback is `https://illuminati-brotherhood.org`, inferred from the seeded admin
email; change it if that is not the live domain. Avoid building with a preview
or localhost URL as the canonical origin. Vercel clean URLs serve the static
HTML first. Newly published archive and video records resolve through a
client-side catalogue fallback, so their direct links work before a rebuild.
The bundled previews are public build artifacts; runtime API visibility changes
hide items in the hydrated page but do not rewrite those static files.

After deployment, verify the live sitemap and robots file, add the domain in
Google Search Console, submit `/sitemap.xml`, and use URL Inspection to request
crawling of the homepage and key pages. Indexing and rankings are ultimately
controlled by Google and are not guaranteed by metadata alone.

## November 2026 website audit: 15 fixes

| # | Audit issue | Resolution |
| --- | --- | --- |
| 1 | Unverified member and archive totals | Removed both claims. The home page counts only the published, linkable editorial articles. |
| 2 | Site presented as a real secret society | The home hero, About page, footer and account gate distinguish the educational project and fictional archive from any real affiliation or initiation. Existing charges are disclosed as payment for digital content only. |
| 3 | New World Order framed as fact | `/new-order` is a public, sourced myth-vs-history article with the documented context and no signup prompt. |
| 4 | Broken countdown | Removed it from Home and New World Order, along with the nonfunctional notification form. Legacy links go to the explainer. |
| 5 | Instagram placeholder | No prompt, icon or section is rendered until a valid profile is configured. Clearing it hides the links again. |
| 6 | Missing trust and legal links | The footer links to About, Contact, Privacy Policy, Terms and the content disclaimer, with copyright. Account holders can submit support messages without paying. |
| 7 | Unclear navigation | The fixed header exposes Stories, Symbols, Archives, New World Order, Videos and About, with an accessible mobile menu. |
| 8 | Links appeared dead or redirected to sign-in | The public links open real articles or labelled catalogue previews. Paid pages, readers and playback still require the original entitlement. |
| 9 | Browser icon and mobile title | Added a 512×512 PNG favicon, SVG favicon and Apple touch icon; set route-specific browser titles. |
| 10 | Thin homepage | Added reading notes on the historical Illuminati and the symbols, with three featured article previews. |
| 11 | Search-result copy | Updated titles, descriptions and social metadata to reflect the educational content. |
| 12 | No article catalogue | Added `/stories` and five articles of at least 800 words each, with an editorial byline and linked sources. |
| 13 | Weak internal discovery | The new pages have breadcrumbs, related reading, canonical URLs, structured data and entries in the generated sitemap. |
| 14 | No freshness signal | The latest-stories section shows the newest article publication or revision date, not the build date. |
| 15 | Hard-to-use archive carousel | Replaced autoplay and arrow-only navigation with six labelled links in a responsive, keyboard-accessible grid. |

Articles also have Share and Copy link controls. Edit the source files in
`src/data/stories/`; bump an article's `updatedAt` only for a material revision.
To offer a no-login contact option, set `VITE_CONTACT_EMAIL` to a monitored
public inbox and rebuild. The signed-in form delivers through the existing
FastAPI threads endpoint to **Admin → Messages**; it does not report offline
submissions as sent. Set Instagram under **Admin → Settings → Social media**
after checking that the profile belongs to the project. The article links and
public catalogue previews work without either setting.

## What changed in 1.1.6

| # | Change | Where |
| --- | --- | --- |
| 1 | Rules & Terms rewritten (no vouching, archives caution, entry window, hidden material, conditions) and versioned `1.1.6` | `src/i18n/locales/*/translation.json`, `src/utils/consent.js`, `src/components/ConsentGate.jsx`, `src/pages/Rules.jsx` |
| 2, 3, 21, 23 | Social accounts link correctly with real brand logos; the URLs are edited in **Admin → Settings → Social media** | `src/components/SocialIcons.jsx`, `src/components/SocialLinks.jsx`, `src/context/SiteSettingsContext.jsx`, `src/pages/admin/Settings.jsx` |
| 4 | Ritual stations take a film URL + thumbnail from the admin console and play it in the member area | `src/pages/admin/RitualsAdmin.jsx`, `src/pages/Rituals.jsx`, `src/components/MediaPlayer.jsx` |
| 5 | Only valid, non-disposable email addresses are accepted (client + API) | `src/utils/validation.js`, `backend/app/schemas/user.py` |
| 6 | Terms acknowledgement locks the account and member experience until accepted; public reading pages are exempt | `src/components/ConsentGate.jsx`, `src/components/Layout.jsx` |
| 10 | OSIRIS moved to **Archives → The Third Eye** | `src/pages/ArchiveDetail.jsx`, `src/pages/Visuals.jsx` |
| 11 | Passphrases must carry a special character (plus upper/lower/digit, 8+) | `src/utils/validation.js`, `backend/app/schemas/user.py` |
| 12 | New original synthesized score, with `/public/assets/site-ambient.mp3` as an optional override | `src/hooks/useAmbientSound.js` |
| 13 | Hyperlinks corrected (no dead `#` links; unset platforms are hidden) | `src/components/Footer.jsx`, `src/components/SocialLinks.jsx` |
| 14 | “New Order” renamed to **New World Order** (`/new-world-order` redirects) | all locales, `src/App.jsx`, `vercel.json` |
| 17, 23 | E-book Library with admin shelving, plus Keeper-added archive records | `src/pages/Archives.jsx`, `src/pages/admin/BooksAdmin.jsx`, `src/pages/admin/ArchivesAdmin.jsx` |
| — | Keeper uploads the e-book PDF from the console; sealed volumes are served only to paid members (see *Sealed e-book library* below) | `backend/app/api/v1/endpoints/library.py`, `src/components/EbookViewer.jsx` |
| 18 | Eight new sigils (Ankh, Triskelion, Ascending Flame, Sphinx, Grail, Dove & Serpent, Compass Rose, Lamp of Diogenes) | `src/data/content.js`, `src/components/SymbolIcon.jsx` |
| 19 | Visuals page order: Decode the Dollar → Find Your Sigil → The Sigils → Tattoos of the Unknown → The Gallery | `src/pages/Visuals.jsx` |
| 20 | Key-visual captions are Keeper-only | `src/pages/Visuals.jsx` |
| 22 | Private discussion board: an initiate only ever sees their own threads with the Keepers; a Keeper sees them all | `src/api/community.js`, `src/pages/Community.jsx`, `src/pages/admin/Messages.jsx`, `backend/app/api/v1/endpoints/community.py` |
| 24 | The Terms & Conditions are shown **verbatim** (the full entry warning, every acknowledgement point and every condition, in the original order and wording) in the entry gate and on `/rules` | `src/data/terms.js`, `src/components/TermsDocument.jsx`, `src/components/ConsentGate.jsx`, `src/pages/Rules.jsx` |
| 25 | A **“Why ₹{{fee}}?”** step now comes before any payment: the same three reasons (one payment only, a membership issued in the member's own name, and what the single fee includes) are shown in the initiation popup and on the public `/why-999` page, so the fee is explained before Razorpay Checkout ever opens | `src/components/WhyFee.jsx`, `src/components/InitiationModal.jsx`, `src/pages/Why999.jsx`, `src/App.jsx`, `src/i18n/locales/*/translation.json`, `src/App.css` |

### Terms & Conditions wording

The legal text is not written inside the translation files any more: it lives in
one place, `src/data/terms.js`, and is rendered as-is by both the entry gate and
`/rules` via `<TermsDocument />`, so the wording a visitor accepts is always the
same document. Edit that file to change the terms — and bump
`TERMS_VERSION` there to require a new acknowledgement before access to
member pages (the accepted version is stored with the consent record). The text stays in English on every
language so the accepted wording never varies; only the surrounding interface
(buttons, headings, instructions) is translated. The footer links to the standalone `/privacy` page; the older
`/rules#rule-privacy` anchor links there too.

## Why the ₹999 fee? (pre-payment explanation)

`InitiationModal` never opens Razorpay Checkout on its own any more. Every entry
point (the paywalled pages, the profile notice, the video/ritual/archive
buttons) first shows a **reasons screen** built from
`src/components/WhyFee.jsx`:

1. **One payment, permanent access** — charged once at initiation, no
   subscription and no auto-renewal.
2. **Membership issued in your own name** — the seal ID recorded on payment,
   plus the joining letter and member card (with the initiate number),
   downloadable from `/profile`.
3. **One fee, the whole archive** — every chamber, ritual station, reel,
   e-book volume and the community channel on one account; no per-item charge
   and no advertising.

Only product facts go here: what the fee is charged, what it unlocks, and the
payment terms. No claims about how the money is spent, member numbers or
results are asserted.

The same block is also a public page at **`/why-999`**, linked from the terms
page strip, the register form's terms row, the paywall notice, the profile
notice and the footer, and it is prerendered with its own SEO metadata, sitemap
entry and breadcrumbs. The copy lives under the `whyFee` key in
`src/i18n/locales/*/translation.json` (English and Hindi provided; other
languages fall back to English), and every `₹{{fee}}` is interpolated from the
Keeper's **Admin → Settings → Razorpay → joining fee**, so changing the price
changes the explanation everywhere.

A short “good to know” box repeats the payment facts — charged once at
initiation, no monthly or yearly charge, nothing auto-renews — and that
payments are final, matching the Terms & Conditions.

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

In the member Library (`/archives#library`), an unlocked uploaded PDF opens in
the in-page reader, which fetches the file with the member's token. The member
reader has no download button; standalone `/book` purchases use a separate
fulfillment flow.

Housekeeping in the console:

- **UPLOAD PDF / REPLACE PDF** on any volume attaches or swaps its file
  (`PATCH /content/book/{id}/file`, which validates the key server-side).
- The **upload shelf** at the bottom of the page lists every file on disk with
  its size and owning volume; unattached files are Keeper-only and can be
  deleted there. Deleting a volume deletes its file.
- Uploads are limited to PDF/EPUB, checked by extension **and** magic bytes, and
  capped by `MAX_EBOOK_SIZE_MB` (default 100 MB) in `backend/.env`.

Deployment notes: this needs the FastAPI service (and its disk). A
frontend-only Vercel deploy must set `VITE_API_BASE_URL` to the full API base
including `/api/v1`, and the API must allow the frontend origin in
`CORS_ORIGINS`. Uploaded volumes are gitignored
(`backend/uploads/`) and are not part of the repository; back the folder up as
you would any other user data.

## One-book sale page (`/book`)

`/book` is a standalone sales page: **one card, one volume, one price** — no
navbar, no footer, no consent gate, no other content. It is not wrapped in the
site's `Layout`, so nothing else on the site appears on it.

Everything it shows is set by the Keeper from **Admin → Book Sale**
(`/admin/book`), and the dashboard shows the current state at a glance:

| Setting | Effect on `/book` |
| --- | --- |
| **The book** | Which shelved e-book is sold — its cover, title and description come from the book record (added under Admin → E-Books) |
| **Price (₹)** | The amount charged, in whole rupees (converted to paise for Razorpay) |
| **Button label** | Optional CTA text; defaults to "Buy now — ₹{price}" |
| **Page live / hidden** | Off = `/book` answers `404` and renders "Nothing here yet" |

Buying needs **no account and no membership**: the visitor taps the button,
Razorpay Checkout collects their details, and the API hands back a signed,
24-hour download link for the volume.

| Call | What it does |
| --- | --- |
| `GET /api/v1/store/book` | Public: cover, title, blurb, price (+ Razorpay key). `404` when the page is switched off |
| `POST /api/v1/store/order` | Public: raises a Razorpay order for exactly that price |
| `POST /api/v1/store/verify` | Public: verifies Checkout's signature, records the sale, returns the download link |
| `GET /api/v1/store/download?t=` | Serves the bought volume; the signed token is re-checked and the payment must still be captured |
| `GET`/`PUT /api/v1/store/listing` | Keeper only: read/set the one book, its price and the on/off switch |

Sales are written to the existing `transactions` table tagged `store-order:` /
`store-sale:`, so they appear under **Admin → Revenue** — but they never set
`user.paid`, so a book purchase cannot unlock the sealed membership areas (the
Razorpay webhook routes store orders the same way).

The listing lives in a new `store_listing` table: run
`alembic upgrade head` on MySQL (dev SQLite with `AUTO_CREATE_TABLES=true`
creates it on startup).

## Website music

`useAmbientSound` plays “The New World Order” — a four-chord cathedral
progression synthesized in the browser (no licensed samples). Drop a track at
`public/assets/site-ambient.mp3` to override it; the synthesized score fades
out automatically when the file is available.

## Pages

| Route | Page |
| --- | --- |
| `/` | Home — educational introduction, latest stories and six archive previews |
| `/stories`, `/stories/:slug` | Public articles with linked sources and sharing controls |
| `/archives`, `/archives/:slug` | Public chamber previews; full archive, OSIRIS and Library for entitled readers |
| `/rituals` | The seven stations (some sealed for signed-in initiates) |
| `/new-order` | Public explainer on the myth and the historical record |
| `/videos`, `/videos/:slug` | Public catalogue; the member area shows available video playback |
| `/visuals` | Public symbol guides; sigil explorer and gallery in the member area |
| `/community` | Channels, private board (your threads with the Keepers), Instagram |
| `/about`, `/contact`, `/privacy`, `/rules` | Editorial policy, contact, privacy and Terms & Conditions |
| `/login`, `/register` | Auth pages |
| `/profile` | Member area (protected) |
| `/why-999` | Public explanation of the one-time initiation fee, with the payment CTA |
| `/book` | Standalone one-book sale page: a single card, no site chrome (book + price set in Admin → Book Sale) |
| `/admin` | Keeper console (admin only): members, videos, rituals, archives, e-books, book sale, council inbox, social links |

## Accounts & roles

Authentication and content use the FastAPI service in `backend/`; user records
are stored in MySQL and the browser stores only a JWT session token in
`localStorage`. The frontend calls `/api/v1` (Vite proxies this to port 8000 in
development). Set `VITE_API_BASE_URL` for a separately hosted production API,
and configure the backend CORS origins to match the site.

| Role | Access |
| --- | --- |
| Visitor | Articles, previews and trust pages without signing in |
| Initiate (member) | Profile and private support form; the full experience requires paid access |
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
  api/                FastAPI client (auth, content, sealed e-book library, /book sale)
  auth/authService.js FastAPI authentication client
  context/            AuthContext, ContentContext (sealed items), ToastContext
  components/         Navbar, Footer, Layout, PageHero, SEO metadata, ...
  data/content.js     bundled page content and fallback catalogue
  pages/              one file per route (Store.jsx is the standalone /book card)
scripts/prerender.mjs build-time public route rendering, sitemap and robots
scripts/smoke-ssr.mjs render-every-route smoke test
```
