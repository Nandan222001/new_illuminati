import { CARDS, PAGES, VIDEOS, videoDescription } from '../data/content.js'
import { findStory, storyDate, STORY_AUTHOR, STORY_INDEX_PATH } from '../data/stories/index.js'
import { DEFAULT_SITE_URL, SITE_NAME, normalizeSiteUrl } from './site.js'

const EDITORIAL_IMAGE = '/assets/editorial-share.png'
const EDITORIAL_IMAGE_ALT = 'Illuminati Brotherhood: myths, symbols and history'
const HOME_DESCRIPTION = 'Explore myths, symbols and the history behind the Bavarian Illuminati, the Eye of Providence and the New World Order. Free articles with sources.'

const PAGE_SEO = {
  '/': {
    title: 'Illuminati Brotherhood | Myths, Symbols & History Explained',
    description: HOME_DESCRIPTION,
    image: EDITORIAL_IMAGE,
    preloadImage: '/assets/editorial-emblem.svg',
  },
  '/archives': {
    title: 'Secret-Society Archive & Library | Illuminati Brotherhood',
    description: 'Browse the illustrated chambers of secret-society myth, history and original fiction — plus the Library of e-books shelved with the archive.',
    image: PAGES.archives.hero,
  },
  '/rituals': {
    title: 'Fictional Ritual Stories | Illuminati Brotherhood',
    description: 'Explore seven fictional ritual stations, from the First Candle to the Sealed Oath. These theatrical stories use symbolism, not real-world practices.',
    image: PAGES.rituals.hero,
    robots: 'noindex,follow',
  },
  '/stories': {
    title: `Sourced Stories on Myths, Symbols & History | ${SITE_NAME}`,
    description: 'Read free educational features on the Bavarian Illuminati, the Eye of Providence, pyramids, grimoires and the origins of conspiracy theories.',
    image: EDITORIAL_IMAGE,
  },
  '/videos': {
    title: 'Video Catalogue | Illuminati Brotherhood',
    description: 'Browse episode previews about symbols, history and fictional stories. Playback, where published, is part of the member experience.',
    image: PAGES.videos.hero,
  },
  '/visuals': {
    title: 'Symbol Guides: Eye of Providence & Pyramid | Illuminati Brotherhood',
    description: 'Explore the history of the Eye of Providence, the pyramid and other familiar motifs. Read sourced guides and learn how to tell myth from history.',
    image: PAGES.visuals.hero,
  },
  '/community': {
    title: 'Community & Council Board | Illuminati Brotherhood',
    description: 'The channels, the emblem and a private thread to the Keepers — every message one-to-one. Mature themes; adults 18+ only.',
    image: PAGES.community.hero,
    robots: 'noindex,follow',
  },
  '/about': {
    title: 'About the Project | Illuminati Brotherhood',
    description: 'Learn how this independent educational storytelling project sources articles, distinguishes myth from history and labels its fictional archive.',
    image: EDITORIAL_IMAGE,
  },
  '/privacy': {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: 'How the site uses information from browsing, accounts, private messages and payments, and how to request a correction or deletion.',
    image: EDITORIAL_IMAGE,
  },
  '/contact': {
    title: `Contact | ${SITE_NAME}`,
    description: 'Contact the site team about a story, account, purchase or privacy request. No purchase is required to send a support message.',
    image: EDITORIAL_IMAGE,
  },
  '/rules': {
    title: 'Terms, Rules & Instructions (v1.1.6) | Illuminati Brotherhood',
    description: 'Terms & Conditions version 1.1.6: entry conditions, age rules, membership terms, privacy and ownership for the Illuminati Brotherhood experience.',
    image: PAGES.about.hero,
  },
  '/why-999': {
    title: 'What Paid Site Access Covers | Illuminati Brotherhood',
    description: 'See what the one-time fee covers: digital archive access and in-world documents. No automatic renewal or real-world membership.',
    image: '/assets/about-hero.jpg',
  },
  '/book': {
    title: 'Buy the Book | Illuminati Brotherhood',
    description: 'One book, one price, instant download after payment. The current volume on sale is set by the publisher.',
    image: '/assets/hero-baphomet.jpg',
  },
  '/login': {
    title: 'Sign In | Illuminati Brotherhood',
    description: 'Sign in to your Illuminati Brotherhood account.',
    image: '/assets/auth-login.jpg',
    robots: 'noindex,follow',
  },
  '/register': {
    title: 'Create an Account | Illuminati Brotherhood',
    description: 'Create an account for the Illuminati Brotherhood fictional entertainment experience.',
    image: '/assets/auth-register.jpg',
    robots: 'noindex,follow',
  },
}

const STATIC_BREADCRUMBS = {
  '/archives': [{ name: 'Home', path: '/' }, { name: 'Archives', path: '/archives' }],
  '/rituals': [{ name: 'Home', path: '/' }, { name: 'Rituals', path: '/rituals' }],
  '/stories': [{ name: 'Home', path: '/' }, { name: 'Stories', path: '/stories' }],
  '/videos': [{ name: 'Home', path: '/' }, { name: 'Videos', path: '/videos' }],
  '/visuals': [{ name: 'Home', path: '/' }, { name: 'Symbols', path: '/visuals' }],
  '/community': [{ name: 'Home', path: '/' }, { name: 'Community', path: '/community' }],
  '/about': [{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }],
  '/rules': [{ name: 'Home', path: '/' }, { name: 'Rules', path: '/rules' }],
  '/why-999': [{ name: 'Home', path: '/' }, { name: 'What Paid Access Covers', path: '/why-999' }],
  '/contact': [{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }],
  '/privacy': [{ name: 'Home', path: '/' }, { name: 'Privacy Policy', path: '/privacy' }],
}

function normalizePath(pathname = '/') {
  let path = '/'
  try {
    path = new URL(pathname, 'https://seo.invalid').pathname
  } catch {
    path = '/'
  }
  if (path.length > 1) path = path.replace(/\/+$/, '')
  return path || '/'
}

function decodeSegment(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function excerpt(value, maxLength = 158) {
  const clean = String(value || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  if (clean.length <= maxLength) return clean
  const target = clean.slice(0, maxLength - 1)
  const wordBoundary = target.lastIndexOf(' ')
  return `${target.slice(0, wordBoundary > 100 ? wordBoundary : target.length).trimEnd()}…`
}

function localize(translate, key, fallback) {
  if (typeof translate !== 'function') return fallback
  const value = translate(key, { defaultValue: fallback })
  return value && value !== key ? value : fallback
}

function absoluteUrl(siteUrl, assetOrPath) {
  if (/^https?:\/\//i.test(assetOrPath || '')) return assetOrPath
  return new URL(assetOrPath || '/assets/hero-baphomet.jpg', `${siteUrl}/`).toString()
}

export function getSeoMetadata(pathname, translate, siteUrlValue = DEFAULT_SITE_URL, { archives = CARDS, videos = VIDEOS } = {}) {
  const path = normalizePath(pathname)
  const siteUrl = normalizeSiteUrl(siteUrlValue)
  const story = findStory(path)
  const record = story ? { title: `${story.title} | ${SITE_NAME}`, description: story.summary, image: EDITORIAL_IMAGE } : PAGE_SEO[path]
  let pageName = record?.title || SITE_NAME
  let description = record?.description || 'Explore a fictional entertainment experience inspired by secret-society history, symbols and historical mysteries.'
  let image = record?.image || '/assets/hero-baphomet.jpg'
  let robots = record?.robots || 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
  const ogType = story ? 'article' : 'website'
  let breadcrumbs = story ? [
    { name: 'Home', path: '/' },
    { name: 'Stories', path: STORY_INDEX_PATH },
    { name: story.title, path },
  ] : STATIC_BREADCRUMBS[path] || null

  const archiveMatch = path.match(/^\/archives\/([^/]+)$/)
  const videoMatch = path.match(/^\/videos\/([^/]+)$/)
  const archiveSlug = archiveMatch && decodeSegment(archiveMatch[1])
  const videoSlug = videoMatch && decodeSegment(videoMatch[1])
  const archive = archiveSlug && archives.find((item) => item.slug === archiveSlug)
  const video = videoSlug && videos.find((item) => item.slug === videoSlug)

  if (archive) {
    const title = archive.custom
      ? archive.title
      : localize(translate, `content.cards.${archiveSlug}.title`, archiveSlug.replaceAll('-', ' '))
    const preview = archive.custom ? (archive.desc || '') : localize(translate, `content.cards.${archiveSlug}.desc`, '')
    pageName = `${title} | Archive Chamber | ${SITE_NAME}`
    description = `${preview} A fictional archive chapter inspired by secret-society symbolism.`
    image = archive.img || EDITORIAL_IMAGE
    breadcrumbs = [
      { name: 'Home', path: '/' },
      { name: 'Archives', path: '/archives' },
      { name: title, path },
    ]
  }

  if (video) {
    pageName = `${video.title} | Videos | ${SITE_NAME}`
    description = `${videoDescription(video) || ''} Browse this episode preview.`
    image = video.img || EDITORIAL_IMAGE
    breadcrumbs = [
      { name: 'Home', path: '/' },
      { name: 'Videos', path: '/videos' },
      { name: video.title, path },
    ]
  }

  const privateRoute = path === '/profile' || path === '/admin' || path.startsWith('/admin/')
  const routeExists = Boolean(record || archive || video || privateRoute)
  if (privateRoute) robots = 'noindex,nofollow'
  if (!routeExists) {
    robots = 'noindex,follow'
    pageName = `Page Not Found | ${SITE_NAME}`
    description = 'This page could not be found. Return to the homepage to explore the fictional archive, symbols and stories.'
    image = EDITORIAL_IMAGE
  }

  const canonical = routeExists ? `${siteUrl}${path === '/' ? '/' : path}` : null
  return {
    path,
    title: pageName,
    description: excerpt(description),
    canonical,
    image: absoluteUrl(siteUrl, image),
    imageAlt: image === EDITORIAL_IMAGE ? EDITORIAL_IMAGE_ALT : `${pageName.replace(/\s\|.*$/, '')} artwork`,
    robots,
    ogType,
    breadcrumbs,
    preloadImage: record?.preloadImage || null,
    story,
    siteUrl,
  }
}

export function getStructuredData(metadata) {
  if (!metadata.canonical) return []

  const graph = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${metadata.siteUrl}/#website`,
      name: SITE_NAME,
      url: metadata.siteUrl,
      inLanguage: 'en',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${metadata.canonical}#webpage`,
      name: metadata.title,
      description: metadata.description,
      url: metadata.canonical,
      inLanguage: 'en',
      isPartOf: { '@id': `${metadata.siteUrl}/#website` },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: metadata.image,
      },
    },
  ]

  if (metadata.story) {
    graph.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: metadata.story.title,
      description: metadata.description,
      image: metadata.image,
      mainEntityOfPage: { '@id': `${metadata.canonical}#webpage` },
      author: { '@type': 'Organization', name: STORY_AUTHOR, url: `${metadata.siteUrl}/about#editorial` },
      datePublished: metadata.story.publishedAt,
      dateModified: storyDate(metadata.story),
      inLanguage: 'en',
    })
  }

  if (metadata.breadcrumbs?.length > 1) {
    graph.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: metadata.breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: `${metadata.siteUrl}${crumb.path}`,
      })),
    })
  }

  return graph
}
