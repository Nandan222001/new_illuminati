/* ------------------------------------------------------------------ */
/*  Site content. Every image path points at /public/assets.           */
/* ------------------------------------------------------------------ */

export const NAV_LINKS = [
  { to: '/', key: 'home' },
  { to: '/archives', key: 'archives' },
  { to: '/new-order', key: 'newOrder' },
  { to: '/rituals', key: 'rituals' },
  { to: '/videos', key: 'videos' },
  { to: '/visuals', key: 'visuals' },
  { to: '/community', key: 'community' },
  { to: '/about', key: 'about' },
]

/* Translatable copy for these entries (kicker/title/sub/intro, card/symbol
   text, channel/timeline/faq copy) lives in src/i18n/locales/*, keyed by the
   slug/key below. See src/hooks/useLocalizedContent.js. */
export const PAGES = {
  archives: { hero: '/assets/archives-hero.jpg', heroMobile: '/assets/archives-hero-mobile.jpg' },
  rituals: { hero: '/assets/rituals-hero.jpg', heroMobile: '/assets/rituals-hero-mobile.jpg' },
  newOrder: { hero: '/assets/neworder-hero.jpg', heroMobile: '/assets/neworder-hero-mobile.jpg' },
  videos: { hero: '/assets/videos-hero.jpg', heroMobile: '/assets/videos-hero-mobile.jpg' },
  visuals: { hero: '/assets/visuals-hero.jpg', heroMobile: '/assets/visuals-hero-mobile.jpg' },
  community: { hero: '/assets/community-hero.jpg', heroMobile: '/assets/community-hero-mobile.jpg' },
  about: { hero: '/assets/about-hero.jpg', heroMobile: '/assets/about-hero-mobile.jpg' },
}

export const CARDS = [
  { slug: 'the-third-eye', img: '/assets/archive-eye.jpg' },
  { slug: 'the-gathering', img: '/assets/archive-ritual.jpg' },
  { slug: 'the-golden-altar', img: '/assets/archive-altar.jpg' },
  { slug: 'the-horned-figure', img: '/assets/archive-baphomet.jpg' },
  { slug: 'the-threshold', img: '/assets/archive-silhouette.jpg' },
  { slug: 'the-grimoire', img: '/assets/archive-parchment.jpg' },
]

export const RITUALS = [
  { slug: 'the-first-candle', step: 'I', title: 'THE FIRST CANDLE', img: '/assets/archive-altar.jpg', duration: 'Station 1 · Threshold', desc: 'A single flame lit in silence marks the seeker\'s intent. Nothing is spoken. The candle burns for exactly one hour while the initiate reflects on the question that brought them here.', tags: ['Silence', 'Intent', 'Flame'] },
  { slug: 'the-circle-of-thirteen', step: 'II', title: 'THE CIRCLE OF THIRTEEN', img: '/assets/archive-ritual.jpg', duration: 'Station 2 · Gathering', desc: 'Twelve keepers and one empty place. The initiate is invited to stand in the gap and complete the circle — the visual heart of the Brotherhood mythology.', tags: ['Circle', 'Council', 'Belonging'] },
  { slug: 'the-reading-of-sigils', step: 'III', title: 'THE READING OF SIGILS', img: '/assets/archive-parchment.jpg', duration: 'Station 3 · Study', desc: 'The grimoire is opened at a random page and the initiate is asked to interpret the sigil. There is no right answer; the reading reveals the reader.', tags: ['Sigils', 'Interpretation', 'Study'] },
  { slug: 'the-black-sun-vigil', step: 'IV', title: 'THE BLACK SUN VIGIL', img: '/assets/rituals-hero.jpg', duration: 'Station 4 · Night Watch', desc: 'From midnight until the first light, the initiate keeps watch alone beneath the black sun emblem. The vigil is the longest station and the one most seekers speak of afterwards.', tags: ['Vigil', 'Endurance', 'Dawn'] },
  { slug: 'the-mirror-of-the-horned', step: 'V', title: 'THE MIRROR OF THE HORNED', img: '/assets/archive-baphomet.jpg', duration: 'Station 5 · Confrontation', desc: 'The seeker faces the horned allegory — the fear that guards knowledge — and names it aloud. In the fiction, naming the fear is what unlocks the fifth door.', tags: ['Allegory', 'Fear', 'Naming'] },
  { slug: 'the-crossing', step: 'VI', title: 'THE CROSSING', img: '/assets/archive-silhouette.jpg', duration: 'Station 6 · Passage', desc: 'The initiate walks the candle-lit aisle toward the triangle of light. The doors remain open behind them the entire way; leaving is always allowed.', tags: ['Passage', 'Choice', 'Light'] },
  { slug: 'the-sealed-oath', step: 'VII', title: 'THE SEALED OATH', img: '/assets/community-hero.jpg', duration: 'Station 7 · Oath', desc: 'At the round table the initiate signs the parchment and receives the emblem. The oath is simple: seek, question, and never claim the story is anything but a story.', tags: ['Oath', 'Emblem', 'Brotherhood'] },
]

export const VIDEOS = [
  { slug: 'satanic-mythology', title: 'Satanic Mythology', tag: 'fiction', dur: '12:46', img: '/assets/archive-baphomet.jpg', desc: 'How the horned figure travelled from medieval allegory to modern pop culture — and how the Brotherhood fiction reinterprets it.', views: '1.2M', date: 'Episode 01' },
  { slug: 'hidden-societies', title: 'Hidden Societies', tag: 'theory', dur: '08:20', img: '/assets/archive-ritual.jpg', desc: 'A survey of the real historical societies that inspired the mythology, and the theories that grew around them.', views: '864K', date: 'Episode 02' },
  { slug: 'ancient-mysteries', title: 'Ancient Mysteries', tag: 'fact', dur: '15:02', img: '/assets/forbidden-pyramid.jpg', desc: 'Pyramids, alignments and lost libraries. The documented history behind the symbols used throughout the experience.', views: '2.1M', date: 'Episode 03' },
  { slug: 'new-world-order', title: 'New World Order', tag: 'theory', dur: '10:44', img: '/assets/forbidden-city.jpg', desc: 'Where the phrase came from, why it stuck, and how the Brotherhood story uses it as a fictional countdown.', views: '990K', date: 'Episode 04' },
  { slug: 'the-forbidden-library', title: 'The Forbidden Library', tag: 'fiction', dur: '09:31', img: '/assets/archives-hero.jpg', desc: 'A dramatised walk through the six chambers of the Ritual Archive, narrated by the Grand Keeper.', views: '412K', date: 'Episode 05' },
  { slug: 'the-last-screening', title: 'The Last Screening', tag: 'fiction', dur: '18:12', img: '/assets/videos-hero.jpg', desc: 'The feature-length chapter that closes season one. Sealed for initiates until the New Order date.', views: '—', date: 'Episode 06' },
  { slug: 'council-of-thirteen', title: 'Council of Thirteen', tag: 'fiction', dur: '11:05', img: '/assets/community-hero.jpg', desc: 'Inside the round table: how the fictional council makes its decisions and what the empty thirteenth seat means.', views: '—', date: 'Episode 07' },
  { slug: 'the-eye-over-the-city', title: 'The Eye Over The City', tag: 'theory', dur: '07:48', img: '/assets/neworder-hero.jpg', desc: 'Skylines, pyramids and the all-seeing eye — an image breakdown of the New Order key visual.', views: '533K', date: 'Episode 08' },
]

export const SYMBOLS = [
  { slug: 'the-third-eye', img: '/assets/archive-eye.jpg' },
  { slug: 'the-pyramid', img: '/assets/forbidden-pyramid.jpg' },
  { slug: 'the-shadow', img: '/assets/archive-silhouette.jpg' },
  { slug: 'the-horned-figure', img: '/assets/archive-baphomet.jpg' },
  { slug: 'the-black-sun', img: '/assets/visuals-hero.jpg' },
  { slug: 'the-emblem', img: '/assets/community-emblem.jpg' },
  { slug: 'the-altar-gate', img: '/assets/archive-altar.jpg' },
  { slug: 'the-grimoire-page', img: '/assets/archive-parchment.jpg' },
]

export const GALLERY = [
  { id: 'the-throne', img: '/assets/hero-baphomet.jpg', title: 'The Throne', cap: 'Key visual · Chapter I' },
  { id: 'the-eye-over-the-city', img: '/assets/neworder-hero.jpg', title: 'The Eye Over The City', cap: 'Key visual · New Order' },
  { id: 'the-circle', img: '/assets/rituals-hero.jpg', title: 'The Circle', cap: 'Rituals · Station II' },
  { id: 'the-library', img: '/assets/archives-hero.jpg', title: 'The Library', cap: 'Archives · Entrance' },
  { id: 'the-screening-room', img: '/assets/videos-hero.jpg', title: 'The Screening Room', cap: 'Videos · Hall' },
  { id: 'the-round-table', img: '/assets/community-hero.jpg', title: 'The Round Table', cap: 'Community · Council' },
  { id: 'the-gate', img: '/assets/about-hero.jpg', title: 'The Gate', cap: 'About · Threshold' },
  { id: 'the-wall-of-sigils', img: '/assets/visuals-hero.jpg', title: 'The Wall of Sigils', cap: 'Visuals · Temple' },
  { id: 'the-forbidden-city', img: '/assets/forbidden-city.jpg', title: 'The Forbidden City', cap: 'Videos · Theory' },
  { id: 'the-throne-portrait', img: '/assets/hero-baphomet-mobile.jpg', title: 'The Throne · Portrait', cap: 'Key visual · Mobile', portrait: true },
  { id: 'the-sealed-door', img: '/assets/auth-login.jpg', title: 'The Sealed Door', cap: 'Login · Key visual', portrait: true },
  { id: 'the-oath', img: '/assets/auth-register.jpg', title: 'The Oath', cap: 'Register · Key visual', portrait: true },
]

export const INSTA_IMAGES = [
  '/assets/archive-eye.jpg',
  '/assets/archive-altar.jpg',
  '/assets/archive-ritual.jpg',
  '/assets/archive-baphomet.jpg',
  '/assets/archive-silhouette.jpg',
  '/assets/community-emblem.jpg',
]

export const CHANNELS = [
  { key: 'discord', icon: '🎮' },
  { key: 'telegram', icon: '✈' },
  { key: 'instagram', icon: '📷' },
  { key: 'discussionBoard', icon: '💬' },
]

export const TIMELINE = [
  { key: 'origin' },
  { key: 'archive' },
  { key: 'council' },
  { key: 'newOrder' },
]

export const FAQ = [
  { key: 'isReal' },
  { key: 'whoCanJoin' },
  { key: 'accountDoes' },
  { key: 'realWorldClaims' },
]

export const TARGET_DATE = new Date('2026-11-06T00:00:00')

export function getTimeLeft() {
  let diff = TARGET_DATE - new Date()
  if (diff < 0) diff = 0
  return {
    d: Math.floor(diff / 864e5),
    h: Math.floor(diff / 36e5) % 24,
    m: Math.floor(diff / 6e4) % 60,
    s: Math.floor(diff / 1e3) % 60,
  }
}
