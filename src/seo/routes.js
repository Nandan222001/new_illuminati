import { CARDS, VIDEOS } from '../data/content.js'
import { storyPaths, STORY_INDEX_PATH } from '../data/stories/index.js'

export const CATALOGUE_FALLBACK = 'catalogue-fallback.html'
export const isCatalogueDetailPath = (path) => /^\/(archives|videos)\/[^/.]+$/.test(path)

export function documentFile(path) {
  if (path === '/') return 'index.html'
  if (path === '/__not-found') return '404.html'
  return `${path.slice(1)}.html`
}

// Keep static preview, build-time HTML and the smoke test on the same inventory.
export const publicRoutes = [
  '/', STORY_INDEX_PATH, ...storyPaths,
  '/archives', ...CARDS.map(({ slug }) => `/archives/${slug}`),
  '/videos', ...VIDEOS.map(({ slug }) => `/videos/${slug}`),
  '/visuals', '/about', '/contact', '/privacy', '/rules', '/why-999',
]

export const renderRoutes = [
  ...publicRoutes,
  '/book', '/rituals', '/community', '/login', '/register', '/profile',
  '/admin', '/admin/revenue', '/admin/members', '/admin/videos', '/admin/images',
  '/admin/rituals', '/admin/books', '/admin/book', '/admin/archives', '/admin/messages', '/admin/settings',
  '/__not-found',
]
