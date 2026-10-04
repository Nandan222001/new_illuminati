import { createServer, loadEnv } from 'vite'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { CARDS, VIDEOS } from '../src/data/content.js'
import { DEFAULT_SITE_URL, getSeoMetadata, getStructuredData, normalizeSiteUrl } from '../src/seo/metadata.js'

const root = process.cwd()
const dist = join(root, 'dist')
const environment = loadEnv('production', root, 'VITE_')
const siteUrl = normalizeSiteUrl(process.env.VITE_SITE_URL || environment.VITE_SITE_URL || DEFAULT_SITE_URL)
const htmlTemplate = await readFile(join(dist, 'index.html'), 'utf8')

const publicRoutes = [
  '/',
  '/archives',
  ...CARDS.map((card) => `/archives/${card.slug}`),
  '/rituals',
  '/new-order',
  '/videos',
  ...VIDEOS.map((video) => `/videos/${video.slug}`),
  '/visuals',
  '/community',
  '/about',
  '/rules',
]
const renderRoutes = [
  ...publicRoutes,
  '/login',
  '/register',
  '/profile',
  '/admin',
  '/admin/revenue',
  '/admin/members',
  '/admin/videos',
  '/admin/images',
  '/admin/rituals',
  '/admin/books',
  '/admin/archives',
  '/admin/messages',
  '/admin/settings',
  '/__not-found',
]

// Match the server snapshot used for hydration: browser-only values are read
// after mount by the app, never while static HTML is being rendered.
const store = new Map()
globalThis.localStorage = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
}
globalThis.window = {
  addEventListener() {},
  removeEventListener() {},
  scrollTo() {},
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  location: { href: `${siteUrl}/`, origin: siteUrl, pathname: '/' },
}
globalThis.document = {
  getElementById: () => null,
  body: { classList: { toggle() {}, remove() {} }, style: {} },
  addEventListener() {},
  removeEventListener() {},
}

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character]))

function replaceTag(html, expression, replacement) {
  if (!expression.test(html)) throw new Error(`Could not find head tag matching ${expression}`)
  return html.replace(expression, replacement)
}

function renderHead(template, metadata) {
  const jsonLd = JSON.stringify(getStructuredData(metadata)).replace(/</g, '\\u003c')
  let html = template
  html = replaceTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(metadata.title)}</title>`)
  html = replaceTag(html, /<meta name="description"[^>]*>/i, `<meta name="description" content="${escapeHtml(metadata.description)}">`)
  html = replaceTag(html, /<meta name="robots"[^>]*>/i, `<meta name="robots" content="${escapeHtml(metadata.robots)}">`)
  html = replaceTag(html, /<link rel="canonical"[^>]*>/i, metadata.canonical ? `<link rel="canonical" href="${escapeHtml(metadata.canonical)}">` : '')
  html = replaceTag(html, /<link id="seo-hero-preload"[^>]*>/i, `<link id="seo-hero-preload" rel="preload" as="image" href="${escapeHtml(metadata.preloadImage)}" fetchpriority="high">`)
  html = replaceTag(html, /<meta property="og:type"[^>]*>/i, `<meta property="og:type" content="${metadata.ogType}">`)
  html = replaceTag(html, /<meta property="og:title"[^>]*>/i, `<meta property="og:title" content="${escapeHtml(metadata.title)}">`)
  html = replaceTag(html, /<meta property="og:description"[^>]*>/i, `<meta property="og:description" content="${escapeHtml(metadata.description)}">`)
  html = replaceTag(html, /<meta property="og:url"[^>]*>/i, metadata.canonical ? `<meta property="og:url" content="${escapeHtml(metadata.canonical)}">` : '')
  html = replaceTag(html, /<meta property="og:image"[^>]*>/i, `<meta property="og:image" content="${escapeHtml(metadata.image)}">`)
  html = replaceTag(html, /<meta property="og:image:alt"[^>]*>/i, `<meta property="og:image:alt" content="${escapeHtml(metadata.imageAlt)}">`)
  html = replaceTag(html, /<meta name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${escapeHtml(metadata.title)}">`)
  html = replaceTag(html, /<meta name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${escapeHtml(metadata.description)}">`)
  html = replaceTag(html, /<meta name="twitter:image"[^>]*>/i, `<meta name="twitter:image" content="${escapeHtml(metadata.image)}">`)
  html = replaceTag(html, /<script id="seo-jsonld" type="application\/ld\+json">[\s\S]*?<\/script>/i, `<script id="seo-jsonld" type="application/ld+json">${jsonLd}</script>`)
  return html
}

const vite = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true },
})

try {
  const { render } = await vite.ssrLoadModule('/src/entry-server.jsx')
  const { default: i18n } = await vite.ssrLoadModule('/src/i18n/config.js')
  await i18n.changeLanguage('en')

  for (const route of renderRoutes) {
    const metadata = getSeoMetadata(route, i18n.t.bind(i18n), siteUrl)
    const markup = await render(route)
    const document = renderHead(htmlTemplate, metadata).replace(
      '<div id="root"></div>',
      `<div id="root">${markup}</div>`,
    )
    const outputPath = route === '/__not-found'
      ? join(dist, '404.html')
      : route === '/'
        ? join(dist, 'index.html')
        : join(dist, route.slice(1), 'index.html')
    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, document)
    console.log(`Pre-rendered ${route}`)
  }

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...publicRoutes.map((route) => `  <url><loc>${escapeHtml(`${siteUrl}${route === '/' ? '/' : route}`)}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n')
  await writeFile(join(dist, 'sitemap.xml'), sitemap)
  await writeFile(join(dist, 'robots.txt'), [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n'))
} finally {
  await vite.close()
}
