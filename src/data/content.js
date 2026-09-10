/* ------------------------------------------------------------------ */
/*  Site content. Every image path points at /public/assets.           */
/* ------------------------------------------------------------------ */

export const NAV_LINKS = [
  { to: '/', label: 'HOME' },
  { to: '/archives', label: 'ARCHIVES' },
  { to: '/new-order', label: 'NEW ORDER' },
  { to: '/rituals', label: 'RITUALS' },
  { to: '/videos', label: 'VIDEOS' },
  { to: '/visuals', label: 'VISUALS' },
  { to: '/community', label: 'COMMUNITY' },
  { to: '/about', label: 'ABOUT' },
]

export const PAGES = {
  archives: {
    kicker: 'THE RITUAL ARCHIVE',
    title: 'ARCHIVES',
    sub: 'A JOURNEY THROUGH SYMBOLS, CEREMONY AND MYSTERY.',
    hero: '/assets/archives-hero.jpg',
    heroMobile: '/assets/archives-hero-mobile.jpg',
    intro: 'Every order keeps a library. Ours keeps the questions nobody dared to write down. Six chambers, six relics — each one a doorway into the mythology the Brotherhood was built on.',
  },
  rituals: {
    kicker: 'CEREMONY & OATH',
    title: 'RITUALS',
    sub: 'CANDLE. CIRCLE. SILENCE. THE STAGES OF THE INITIATE.',
    hero: '/assets/rituals-hero.jpg',
    heroMobile: '/assets/rituals-hero-mobile.jpg',
    intro: 'The rites of the Brotherhood are theatre — staged, symbolic and entirely fictional. Read them as story. Follow the seven stations from the first candle to the sealed oath.',
  },
  newOrder: {
    kicker: 'THE 666,666 EXPERIENCE',
    title: 'NEW ORDER',
    sub: '06 NOVEMBER 2026 · 12:00 AM · THE VEIL THINS.',
    hero: '/assets/neworder-hero.jpg',
    heroMobile: '/assets/neworder-hero-mobile.jpg',
    intro: 'A fictional campaign milestone: when the counter reaches zero the Brotherhood opens the next chapter of the experience. No prophecies. No real-world claims. Just a date on the calendar and a story waiting to unfold.',
  },
  videos: {
    kicker: 'FORBIDDEN ARCHIVES',
    title: 'VIDEOS',
    sub: 'EXPLORE THE VIDEOS, DOCUMENTARIES AND HIDDEN STORIES.',
    hero: '/assets/videos-hero.jpg',
    heroMobile: '/assets/videos-hero-mobile.jpg',
    intro: 'The projector hums in an empty hall. Documentaries, dramatisations and theory breakdowns — each one labelled clearly as fiction, theory or fact so you always know what you are watching.',
  },
  visuals: {
    kicker: 'SYMBOLS OF THE UNKNOWN',
    title: 'VISUALS',
    sub: 'ANCIENT SYMBOLS. MODERN INTERPRETATIONS. ENDLESS QUESTIONS.',
    hero: '/assets/visuals-hero.jpg',
    heroMobile: '/assets/visuals-hero-mobile.jpg',
    intro: 'A gallery of sigils, emblems and imagery from across the Brotherhood universe. Tap any symbol to learn the meaning we assigned it in this fiction.',
  },
  community: {
    kicker: 'THE COUNCIL',
    title: 'COMMUNITY',
    sub: 'DISCUSS. SHARE. EXPLORE.',
    hero: '/assets/community-hero.jpg',
    heroMobile: '/assets/community-hero-mobile.jpg',
    intro: 'The round table is open. Join the channels, meet the other initiates, and help decide where the story goes next. 18+ recommended for mature themes.',
  },
  about: {
    kicker: 'THE THRESHOLD',
    title: 'ABOUT',
    sub: 'WHO WE ARE. WHAT THIS IS. WHAT IT IS NOT.',
    hero: '/assets/about-hero.jpg',
    heroMobile: '/assets/about-hero-mobile.jpg',
    intro: 'Illuminati Brotherhood is an immersive, fictional entertainment experience about secret-society mythology, conspiracy culture and historical mystery. Nothing here is a real-world claim.',
  },
}

export const CARDS = [
  { slug: 'the-third-eye', title: 'THE THIRD EYE', desc: 'A symbol representing knowledge, perception and hidden truth.', cap: 'Knowledge · Perception · Truth', img: '/assets/archive-eye.jpg', era: 'Chamber I', body: 'Older than any order that claimed it, the open eye appears wherever humans wanted to say "we see more than we are told". In the Brotherhood fiction it marks the first chamber: the moment an initiate stops accepting and starts looking.' },
  { slug: 'the-gathering', title: 'THE GATHERING', desc: 'Hooded keepers circle the eternal flame of counsel.', cap: 'Ceremony · Brotherhood · Oath', img: '/assets/archive-ritual.jpg', era: 'Chamber II', body: 'Thirteen robes, one circle, no faces. The Gathering is the Brotherhood\'s founding image — a council where rank dissolves and only the flame is above anyone. It is staged, symbolic and entirely fictional.' },
  { slug: 'the-golden-altar', title: 'THE GOLDEN ALTAR', desc: 'Where candlelight meets the triangular gate of awakening.', cap: 'Light · Passage · Awakening', img: '/assets/archive-altar.jpg', era: 'Chamber III', body: 'A triangle of light set into the stone. Initiates kneel not to worship, but to look through it. The altar is a lens in the fiction: what you see on the other side is whatever you brought with you.' },
  { slug: 'the-horned-figure', title: 'THE HORNED FIGURE', desc: 'Myth and allegory guarding the gate of forbidden wisdom.', cap: 'Myth · Allegory · Power', img: '/assets/archive-baphomet.jpg', era: 'Chamber IV', body: 'Borrowed from centuries of allegory, the horned guardian is the story\'s antagonist and mirror at once. It represents the fear of knowledge — the thing standing between the seeker and the fourth chamber.' },
  { slug: 'the-threshold', title: 'THE THRESHOLD', desc: 'One silhouette. One triangle. One choice to step through.', cap: 'Choice · Passage · Destiny', img: '/assets/archive-silhouette.jpg', era: 'Chamber V', body: 'Every initiate reaches a door they can still walk away from. The Threshold is that scene, frozen: the figure, the flame, and the moment before the choice.' },
  { slug: 'the-grimoire', title: 'THE GRIMOIRE', desc: 'Parchments of sigils, circles and centuries-old questions.', cap: 'Sigils · History · Mystery', img: '/assets/archive-parchment.jpg', era: 'Chamber VI', body: 'The final chamber holds a book that is never finished. Its sigils are the visual language of the whole experience — you will find them hidden across every page of this site.' },
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
  { slug: 'the-third-eye', name: 'THE THIRD EYE', short: 'perception beyond sight', img: '/assets/archive-eye.jpg', meaning: 'The eye that sees what is hidden. In the fiction it is the first mark an initiate receives — the reminder to question everything, including the Brotherhood itself.' },
  { slug: 'the-pyramid', name: 'THE PYRAMID', short: 'ascent of knowledge', img: '/assets/forbidden-pyramid.jpg', meaning: 'Wide at the base, narrow at the peak: knowledge is easy to begin and hard to finish. The capstone floats free because the climb is never complete.' },
  { slug: 'the-shadow', name: 'THE SHADOW', short: 'the keeper of secrets', img: '/assets/archive-silhouette.jpg', meaning: 'The hooded silhouette stands for every keeper who chose anonymity. Faces are never shown in Brotherhood imagery — the story matters more than the storyteller.' },
  { slug: 'the-horned-figure', name: 'THE HORNED FIGURE', short: 'myth & allegory', img: '/assets/archive-baphomet.jpg', meaning: 'Borrowed from centuries of allegory and deliberately reframed as the fear of knowledge. The antagonist of the fiction, and its mirror.' },
  { slug: 'the-black-sun', name: 'THE BLACK SUN', short: 'the hidden light', img: '/assets/visuals-hero.jpg', meaning: 'A sun that gives no light, only outline. The emblem of the vigil: the idea that some truths are only visible in darkness.' },
  { slug: 'the-emblem', name: 'THE EMBLEM', short: 'seal of the brotherhood', img: '/assets/community-emblem.jpg', meaning: 'Triangle, eye and ring of runes. The seal every initiate receives at the seventh station and the mark that appears on every page of this experience.' },
  { slug: 'the-altar-gate', name: 'THE ALTAR GATE', short: 'the triangular passage', img: '/assets/archive-altar.jpg', meaning: 'The lit triangle set into stone. Not a place of worship but of looking — a lens through which the seeker sees whatever they carried in.' },
  { slug: 'the-grimoire-page', name: 'THE GRIMOIRE PAGE', short: 'the unfinished book', img: '/assets/archive-parchment.jpg', meaning: 'Sigils, circles and centuries-old questions. The visual language of the whole experience, drawn from a book that is never finished.' },
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
  { icon: '🎮', name: 'DISCORD', desc: 'Live discussion, theory threads and voice rooms.', members: '48,200 initiates', note: 'Discord invite copied (demo)' },
  { icon: '✈', name: 'TELEGRAM', desc: 'Announcements, drops and countdown updates.', members: '21,900 initiates', note: 'Opening Telegram (demo)' },
  { icon: '📷', name: 'INSTAGRAM', desc: 'Daily visuals, sigils and behind-the-scenes.', members: '132K followers', note: 'Opening Instagram (demo)' },
  { icon: '💬', name: 'DISCUSSION BOARD', desc: 'Long-form essays and archive deep-dives.', members: '9,400 initiates', note: 'Opening Discussion Board (demo)' },
]

export const TIMELINE = [
  { year: 'ORIGIN', title: 'A story, not a claim', text: 'The Brotherhood began as a creative project: what if secret-society mythology were treated as cinema instead of conspiracy?' },
  { year: 'ARCHIVE', title: 'Six chambers', text: 'The Ritual Archive gave the fiction a structure — six relics, six chambers, one journey from perception to oath.' },
  { year: 'COUNCIL', title: 'The community', text: 'Initiates joined the round table. Their theories, art and questions now shape where the story goes next.' },
  { year: '2026', title: 'The New Order', text: 'On 06 November 2026 the counter hits zero and the next chapter of the experience opens. Fictional, scheduled, and entirely ours.' },
]

export const FAQ = [
  { q: 'Is any of this real?', a: 'No. Illuminati Brotherhood is a fictional entertainment experience. The rituals, council, countdown and lore are invented for storytelling.' },
  { q: 'Who can join the community?', a: 'Anyone who enjoys mystery, cinema and mythology. 18+ is recommended because some visuals are dark and mature in tone.' },
  { q: 'What does an account do?', a: 'Signed-in initiates unlock sealed videos and rituals and receive an initiate number. Admins (Keepers) manage members and sealed content.' },
  { q: 'Do you make real-world claims about people or organisations?', a: 'Never. Any resemblance to real people, groups or events is coincidental or purely referential for the sake of the fiction.' },
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
