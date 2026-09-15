# Illuminati Brotherhood — fictional entertainment experience
 
A multi-page React + Vite site. All lore, rituals, countdowns and imagery are
fiction created for entertainment; nothing here is a real-world claim.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the production build
npm run smoke      # SSR-render every route to catch runtime errors
```

## Pages

| Route | Page |
| --- | --- |
| `/` | Home — hero, "choose your path" grid, archive carousel, symbols, countdown, videos, community, Instagram |
| `/archives`, `/archives/:slug` | The six chambers of the Ritual Archive + detail records |
| `/rituals` | The seven stations (some sealed for signed-in initiates) |
| `/new-order` | Live countdown to 06 Nov 2026, phases, notify form |
| `/videos`, `/videos/:slug` | Filterable episode grid, featured episode, demo player, sealed episodes |
| `/visuals` | Sigil explorer + key-visual gallery with lightbox |
| `/community` | Channels, discussion board (post as a member), Instagram |
| `/about` | Pillars, story timeline, FAQ, content disclaimer |
| `/login`, `/register` | Auth pages |
| `/profile` | Member area (protected) |
| `/admin` | Keeper console (admin only): members, roles, sealed content |

## Accounts & roles

Authentication is client-side (the site is static, deployed to Vercel).
Accounts live in `localStorage` with salted SHA-256 password hashes; sessions
sync across tabs. Swap `src/auth/authService.js` for API calls to move to a
real backend — the rest of the app only talks to `AuthContext`.

| Role | Access |
| --- | --- |
| Visitor | All public pages; sealed rituals/videos show a sign-in prompt |
| Initiate (member) | Everything above + sealed content, discussion board posting, profile |
| Keeper (admin) | Everything above + `/admin`: promote/demote, banish, seal/unseal content |

A default Keeper (`admin@illuminati.local`) is seeded on first load. Its
passphrase is generated randomly per browser and shown in the **Admin demo
access** box on `/login` (one click fills it in). To fix the credentials for a
deployment, set build-time env vars (see `.env.example`):

```
VITE_ADMIN_EMAIL=admin@illuminati.local
VITE_ADMIN_PASSWORD=<your passphrase>
```

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
  auth/authService.js localStorage-backed user store + password hashing
  context/            AuthContext, ContentContext (sealed items), ToastContext
  components/         Navbar, Footer, Layout, PageHero, AuthShell, ProtectedRoute, ...
  data/content.js     all page copy, cards, rituals, videos, symbols, gallery
  pages/              one file per route
scripts/smoke-ssr.mjs render-every-route smoke test
```
