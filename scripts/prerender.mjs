import { createServer, loadEnv } from 'vite'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { findStory, storyDate } from '../src/data/stories/index.js'
import { getSeoMetadata, getStructuredData } from '../src/seo/metadata.js'
import { CATALOGUE_FALLBACK, documentFile, publicRoutes, renderRoutes } from '../src/seo/routes.js'
import { DEFAULT_SITE_URL, SITE_NAME, normalizeSiteUrl } from '../src/seo/site.js'

const root = process.cwd()
const dist = join(root, 'dist')
const environment = loadEnv('production', root, 'VITE_')
const siteUrl = normalizeSiteUrl(process.env.VITE_SITE_URL || environment.VITE_SITE_URL || DEFAULT_SITE_URL)
const htmlTemplate = await readFile(join(dist, 'index.html'), 'utf8')

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
  return html.replace(expression, () => replacement)
}

function renderHead(template, metadata) {
  const jsonLd = JSON.stringify(getStructuredData(metadata)).replace(/</g, '\\u003c')
  let html = template
  html = replaceTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(metadata.title)}</title>`)
  html = replaceTag(html, /<meta name="description"[^>]*>/i, `<meta name="description" content="${escapeHtml(metadata.description)}">`)
  html = replaceTag(html, /<meta name="robots"[^>]*>/i, `<meta name="robots" content="${escapeHtml(metadata.robots)}">`)
  html = replaceTag(html, /<link rel="canonical"[^>]*>/i, metadata.canonical ? `<link rel="canonical" href="${escapeHtml(metadata.canonical)}">` : '')
  html = replaceTag(html, /<link id="seo-hero-preload"[^>]*>/i, metadata.preloadImage ? `<link id="seo-hero-preload" rel="preload" as="image" href="${escapeHtml(metadata.preloadImage)}" fetchpriority="high">` : '')
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
  optimizeDeps: { noDiscovery: true },
  server: { middlewareMode: true },
})

try {
  const { render } = await vite.ssrLoadModule('/src/entry-server.jsx')
  const { default: i18n } = await vite.ssrLoadModule('/src/i18n/config.js')
  await i18n.changeLanguage('en')
  const translate = i18n.t.bind(i18n)
  const fallbackMetadata = {
    ...getSeoMetadata('/__not-found', translate, siteUrl),
    title: `Catalogue | ${SITE_NAME}`,
    description: 'Browse published archive and video previews.',
  }
  // Entries may be published in the API after the static site was built.
  // Mount (not hydrate) the app at those URLs and let it resolve the record.
  await writeFile(join(dist, CATALOGUE_FALLBACK), renderHead(htmlTemplate, fallbackMetadata))

  for (const route of renderRoutes) {
    const metadata = getSeoMetadata(route, translate, siteUrl)
    const markup = await render(route)
    const document = renderHead(htmlTemplate, metadata).replace(
      '<div id="root"></div>',
      () => `<div id="root">${markup}</div>`,
    )
    const outputPath = join(dist, documentFile(route))
    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, document)
    console.log(`Pre-rendered ${route}`)
  }

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...publicRoutes.map((route) => {
      const story = findStory(route)
      const lastmod = story ? `<lastmod>${storyDate(story)}</lastmod>` : ''
      return `  <url><loc>${escapeHtml(`${siteUrl}${route}`)}</loc>${lastmod}</url>`
    }),
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
