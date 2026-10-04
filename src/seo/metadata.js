import { CARDS, PAGES, VIDEOS } from '../data/content.js'

export const SITE_NAME = 'Illuminati Brotherhood'
// The seed admin address uses this brand domain. Override it with the exact
// production origin through VITE_SITE_URL before deployment if it differs.
export const DEFAULT_SITE_URL = 'https://illuminati-brotherhood.org'

const PAGE_SEO = {
  '/': {
    title: 'Illuminati Brotherhood | Secret-Society Myths & Symbols',
    description: 'Explore secret-society myths, historical mysteries and symbols through original fiction. An immersive story world, not a real organization.',
    image: '/assets/hero-baphomet.jpg',
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
  },
  '/new-order': {
    title: 'New World Order Story Countdown | Illuminati Brotherhood',
    description: 'Follow the New World Order countdown, campaign phases and joined-members total of an immersive story world inspired by historical symbols.',
    image: PAGES.newOrder.hero,
  },
  '/videos': {
    title: 'Secret-Society Videos & Stories | Illuminati Brotherhood',
    description: 'Watch short films and explainers about secret societies, symbols and historical mysteries. Every episode is clearly labelled as story, theory or fact.',
    image: PAGES.videos.hero,
  },
  '/visuals': {
    title: 'Secret-Society Symbols, Sigils & Tattoos | Illuminati Brotherhood',
    description: 'Decode the dollar, find your sigil and explore illustrated secret-society symbols, tattoos and key visuals in an interactive guide to myth and meaning.',
    image: PAGES.visuals.hero,
  },
  '/community': {
    title: 'Community & Council Board | Illuminati Brotherhood',
    description: 'The channels, the emblem and a private thread to the Keepers — every message one-to-one. Mature themes; adults 18+ only.',
    image: PAGES.community.hero,
  },
  '/about': {
    title: 'About Illuminati Brotherhood | Fiction & History',
    description: 'Learn what Illuminati Brotherhood is: a fictional entertainment brand inspired by secret-society history, symbolism and mystery—not a real organization.',
    image: PAGES.about.hero,
  },
  '/rules': {
    title: 'Terms, Rules & Instructions (v1.1.6) | Illuminati Brotherhood',
    description: 'Terms & Conditions version 1.1.6: entry conditions, age rules, membership terms, privacy and ownership for the Illuminati Brotherhood experience.',
    image: PAGES.about.hero,
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
  '/new-order': [{ name: 'Home', path: '/' }, { name: 'New World Order', path: '/new-order' }],
  '/videos': [{ name: 'Home', path: '/' }, { name: 'Videos', path: '/videos' }],
  '/visuals': [{ name: 'Home', path: '/' }, { name: 'Visuals', path: '/visuals' }],
  '/community': [{ name: 'Home', path: '/' }, { name: 'Community', path: '/community' }],
  '/about': [{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }],
  '/rules': [{ name: 'Home', path: '/' }, { name: 'Rules', path: '/rules' }],
}

export function normalizeSiteUrl(value = DEFAULT_SITE_URL) {
  try {
    const url = new URL(value, DEFAULT_SITE_URL)
    return url.origin
  } catch {
    return DEFAULT_SITE_URL
  }
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

export function getSeoMetadata(pathname, translate, siteUrlValue = DEFAULT_SITE_URL, extraArchives = []) {
  const path = normalizePath(pathname)
  const siteUrl = normalizeSiteUrl(siteUrlValue)
  const record = PAGE_SEO[path]
  let pageName = record?.title || SITE_NAME
  let description = record?.description || 'Explore a fictional entertainment experience inspired by secret-society history, symbols and historical mysteries.'
  let image = record?.image || '/assets/hero-baphomet.jpg'
  let robots = record?.robots || 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
  let ogType = 'website'
  let breadcrumbs = STATIC_BREADCRUMBS[path] || null

  const archiveMatch = path.match(/^\/archives\/([^/]+)$/)
  if (archiveMatch) {
    const slug = decodeSegment(archiveMatch[1])
    const card = CARDS.find((item) => item.slug === slug)
    if (card) {
      const title = localize(translate, `content.cards.${slug}.title`, slug.replaceAll('-', ' '))
      const body = localize(translate, `content.cards.${slug}.body`, '')
      pageName = `${title} | Archive Chamber | ${SITE_NAME}`
      description = excerpt(`${body} A fictional archive chapter inspired by secret-society symbolism.`)
      image = card.img
      ogType = 'article'
      breadcrumbs = [
        { name: 'Home', path: '/' },
        { name: 'Archives', path: '/archives' },
        { name: title, path },
      ]
    } else {
      const custom = extraArchives.find((item) => item.slug === slug)
      if (custom) {
        pageName = `${custom.title} | Archive Chamber | ${SITE_NAME}`
        description = excerpt(`${custom.body || custom.desc} A chapter of the Illuminati Brotherhood archive.`)
        image = custom.img
        ogType = 'article'
        breadcrumbs = [
          { name: 'Home', path: '/' },
          { name: 'Archives', path: '/archives' },
          { name: title, path },
        ]
      } else {
        robots = 'noindex,follow'
      }
    }
  }

  const videoMatch = path.match(/^\/videos\/([^/]+)$/)
  if (videoMatch) {
    const slug = decodeSegment(videoMatch[1])
    const video = VIDEOS.find((item) => item.slug === slug)
    if (video) {
      pageName = `${video.title} | Videos | ${SITE_NAME}`
      description = excerpt(`${video.desc} Clearly labelled as story, theory or fact in an entertainment series.`)
      image = video.img
      ogType = 'article'
      breadcrumbs = [
        { name: 'Home', path: '/' },
        { name: 'Videos', path: '/videos' },
        { name: video.title, path },
      ]
    } else {
      robots = 'noindex,follow'
    }
  }

  if (path === '/profile' || path.startsWith('/admin/')) robots = 'noindex,nofollow'
  if (path === '/admin') robots = 'noindex,nofollow'
  if (!record && !archiveMatch && !videoMatch && path !== '/profile' && !path.startsWith('/admin')) robots = 'noindex,follow'

  const routeExists = Boolean(record)
    || (archiveMatch && (CARDS.some((card) => card.slug === decodeSegment(archiveMatch[1]))
      || extraArchives.some((card) => card.slug === decodeSegment(archiveMatch[1]))))
    || (videoMatch && VIDEOS.some((video) => video.slug === decodeSegment(videoMatch[1])))
    || path === '/profile'
    || path === '/admin'
    || path.startsWith('/admin/')
  if (!routeExists && !record) {
    pageName = `Page Not Found | ${SITE_NAME}`
    description = 'This page could not be found. Return to the homepage to explore the fictional archive, symbols and stories.'
  }

  const canonical = routeExists ? `${siteUrl}${path === '/' ? '/' : path}` : null
  return {
    path,
    title: pageName,
    description: excerpt(description),
    canonical,
    image: absoluteUrl(siteUrl, image),
    imageAlt: `${pageName.replace(/\s\|.*$/, '')} artwork`,
    robots,
    ogType,
    breadcrumbs,
    preloadImage: image,
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
