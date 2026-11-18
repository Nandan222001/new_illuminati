import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { CARDS } from '../src/data/content.js'
import { latestStories, storyDate, storyPaths } from '../src/data/stories/index.js'
import { CATALOGUE_FALLBACK, documentFile, publicRoutes } from '../src/seo/routes.js'
import { getSeoMetadata } from '../src/seo/metadata.js'
import { normalizeSocialMap, normalizeSocialUrl } from '../src/utils/social.js'

const readDist = (path) => readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8')
const page = (route) => readDist(documentFile(route))
const markup = (html) => html.slice(html.indexOf('<div id="root">'))
const titleOf = (html) => html.match(/<title>([^<]+)<\/title>/)?.[1]
const robotsOf = (html) => html.match(/name="robots" content="([^"]+)"/)?.[1]

const noInflatedClaims = /3\.6M\+|6K\+|666,666|real metrics|<div class="cd-box/i

test('homepage has real inventory, public CTAs, six links and no social/countdown placeholders', async () => {
  const html = await page('/')
  const body = markup(html)
  assert.match(titleOf(html), /Myths, Symbols &amp; History Explained/)
  assert.match(body, /independent educational project/i)
  assert.match(body, new RegExp(`${latestStories.length} sourced articles`))
  assert.match(body, /href="\/stories"[^>]*>Explore the stories/)
  assert.match(body, /href="\/visuals"[^>]*>Explore symbols/)
  assert.match(body, /href="\/videos"[^>]*>ALL VIDEOS/)
  assert.doesNotMatch(body, /carousel|consent-gate|instagram-follow|coming soon/i)
  assert.doesNotMatch(body, noInflatedClaims)
  assert.equal([...body.matchAll(/class="archive-preview-card"/g)].length, CARDS.length)
  for (const { slug } of CARDS) assert.match(body, new RegExp(`href="/archives/${slug}"`))
  for (const path of ['/about', '/contact', '/privacy', '/rules#terms', '/about#disclaimer']) assert.ok(body.includes(`href="${path}"`), path)
  assert.match(body, /<time dateTime="\d{4}-\d{2}-\d{2}">/i)
})

test('five substantive articles are prerendered with sources, bylines, links and metadata', async () => {
  const sitemap = await readDist('sitemap.xml')
  const index = await page('/stories')
  assert.equal(latestStories.length, 5)
  for (const story of latestStories) {
    const html = await page(story.path)
    const body = markup(html)
    const count = [story.intro, ...story.sections.flatMap((section) => section.paragraphs)].join(' ').split(/\s+/).length
    assert.ok(count >= 800, `${story.path}: ${count} words`)
    assert.ok(index.includes(`href="${story.path}"`))
    assert.ok(titleOf(html).includes(story.title.replaceAll('&', '&amp;')))
    assert.match(body, /Illuminati Brotherhood Editorial/)
    assert.match(body, /Copy link/)
    assert.match(body, /aria-label="Breadcrumb"/)
    assert.match(body, /Sources and further reading/)
    assert.doesNotMatch(body, /consent-gate/)
    for (const [i, source] of story.sources.entries()) {
      assert.equal(new URL(source.url).protocol, 'https:')
      assert.ok(body.includes(`id="source-${i + 1}"`))
      assert.ok(body.includes(`href="${source.url.replaceAll('&', '&amp;')}"`))
    }
    const graph = JSON.parse(html.match(/<script id="seo-jsonld" type="application\/ld\+json">(.*?)<\/script>/s)[1])
    assert.equal(graph.find((entry) => entry['@type'] === 'Article').headline, story.title)
    assert.equal(graph.find((entry) => entry['@type'] === 'BreadcrumbList').itemListElement.length, 3)
    assert.ok(sitemap.includes(`${story.path}</loc><lastmod>${storyDate(story)}</lastmod>`))
  }
  const nwo = markup(await page('/new-order'))
  assert.match(nwo, /not presented as fact/)
  assert.match(nwo, /What the myth claims/)
  assert.match(nwo, /What historians and public records can show/)
  assert.match(nwo, /Where the modern myth came from/)
  assert.doesNotMatch(nwo, noInflatedClaims)
})

test('public paths are crawlable; account pages keep their gate and are not in the sitemap', async () => {
  const sitemap = await readDist('sitemap.xml')
  const robots = await readDist('robots.txt')
  const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => new URL(url).pathname)
  assert.deepEqual(routes, publicRoutes)
  assert.match(robots, /^Sitemap: https?:\/\/.+\/sitemap.xml$/m)
  const titles = new Set()
  for (const path of publicRoutes) {
    const html = await page(path)
    assert.doesNotMatch(markup(html), /class="consent-gate"/)
    assert.ok(robotsOf(html).startsWith('index,'), path)
    assert.ok(titleOf(html), path)
    titles.add(titleOf(html))
    assert.match(html, /<meta name="description" content="[^"]+"/)
  }
  assert.equal(titles.size, publicRoutes.length)
  const login = await page('/login')
  assert.match(login, /class="consent-gate"/)
  assert.match(robotsOf(login), /noindex/)
  assert.doesNotMatch(sitemap, /\/login<\/loc>/)
  assert.doesNotMatch(markup(await page('/archives/the-third-eye')), /osiris-panel|payment\.captured/i)
  assert.doesNotMatch(markup(await page('/videos/the-last-screening')), /player-locked|patient checkout/i)
  assert.equal(storyPaths.length, 5)
})

test('favicon has the declared dimensions and the social image is bundled', async () => {
  const html = await page('/')
  assert.match(html, /rel="icon" type="image\/png" sizes="512x512" href="\/favicon-512\.png"/)
  for (const [file, size] of [['favicon-512.png', 512], ['apple-touch-icon.png', 180]]) {
    const image = await readFile(new URL(`../dist/${file}`, import.meta.url))
    assert.equal(image.toString('ascii', 12, 16), 'IHDR')
    assert.equal(image.readUInt32BE(16), size)
    assert.equal(image.readUInt32BE(20), size)
  }
  assert.match(html, /property="og:image" content="https?:\/\/[^\"]+\/assets\/editorial-share\.png"/)
  const share = await readFile(new URL('../dist/assets/editorial-share.png', import.meta.url))
  assert.equal(share.readUInt32BE(16), 1200)
  assert.equal(share.readUInt32BE(20), 630)
})

test('Instagram publishes a profile only, not a placeholder, post or arbitrary URL', () => {
  const canonical = 'https://www.instagram.com/site.editorial/'
  for (const input of ['@site.editorial', 'instagram.com/site.editorial', 'https://www.instagram.com/Site.Editorial/?igsh=tracking']) {
    assert.equal(normalizeSocialUrl('instagram', input), canonical)
  }
  for (const input of ['', 'https://instagram.com/', 'https://instagram.com/p/abc/', 'https://instagram.com/explore/', 'https://fake.example/site.editorial', 'https://instagram.com@fake.example/site.editorial', 'javascript:alert(1)', '@not a handle']) {
    assert.equal(normalizeSocialUrl('instagram', input), '', input)
  }
  assert.equal(normalizeSocialMap({}).instagram, '')
})


test('runtime catalogue links have a non-indexed fallback and use the visible catalogue', async () => {
  const shell = await readDist(CATALOGUE_FALLBACK)
  assert.match(robotsOf(shell), /noindex/)
  assert.match(shell, /<div id="root"><\/div>/)
  assert.doesNotMatch(shell, /rel="canonical"/)
  const archive = { slug: 'test-chapter', title: 'Test chapter', custom: true }
  const metadata = getSeoMetadata('/archives/test-chapter', undefined, undefined, { archives: [archive] })
  assert.equal(metadata.breadcrumbs.at(-1).name, archive.title)
  assert.match(metadata.canonical, /\/archives\/test-chapter$/)
  for (const path of ['/archives/the-third-eye', '/videos/the-last-screening']) {
    const hidden = getSeoMetadata(path, undefined, undefined, { archives: [], videos: [] })
    assert.equal(hidden.canonical, null)
    assert.match(hidden.robots, /noindex/)
  }
})
