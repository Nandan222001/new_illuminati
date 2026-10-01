import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DEFAULT_SITE_URL, getSeoMetadata, getStructuredData } from '../seo/metadata.js'

const SITE_URL = import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL

function setMeta(documentRef, selector, attribute, key, value) {
  let element = documentRef.head.querySelector(selector)
  if (!element) {
    element = documentRef.createElement('meta')
    element.setAttribute(attribute, key)
    documentRef.head.appendChild(element)
  }
  element.setAttribute('content', value)
}

function applyMetadata(documentRef, metadata) {
  documentRef.title = metadata.title
  setMeta(documentRef, 'meta[name="description"]', 'name', 'description', metadata.description)
  setMeta(documentRef, 'meta[name="robots"]', 'name', 'robots', metadata.robots)
  setMeta(documentRef, 'meta[property="og:type"]', 'property', 'og:type', metadata.ogType)
  setMeta(documentRef, 'meta[property="og:site_name"]', 'property', 'og:site_name', 'Illuminati Brotherhood')
  setMeta(documentRef, 'meta[property="og:title"]', 'property', 'og:title', metadata.title)
  setMeta(documentRef, 'meta[property="og:description"]', 'property', 'og:description', metadata.description)
  if (metadata.canonical) {
    setMeta(documentRef, 'meta[property="og:url"]', 'property', 'og:url', metadata.canonical)
  } else {
    documentRef.head.querySelector('meta[property="og:url"]')?.remove()
  }
  setMeta(documentRef, 'meta[property="og:image"]', 'property', 'og:image', metadata.image)
  setMeta(documentRef, 'meta[property="og:image:alt"]', 'property', 'og:image:alt', metadata.imageAlt)
  setMeta(documentRef, 'meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
  setMeta(documentRef, 'meta[name="twitter:title"]', 'name', 'twitter:title', metadata.title)
  setMeta(documentRef, 'meta[name="twitter:description"]', 'name', 'twitter:description', metadata.description)
  setMeta(documentRef, 'meta[name="twitter:image"]', 'name', 'twitter:image', metadata.image)

  let canonical = documentRef.head.querySelector('link[rel="canonical"]')
  if (metadata.canonical) {
    if (!canonical) {
      canonical = documentRef.createElement('link')
      canonical.rel = 'canonical'
      documentRef.head.appendChild(canonical)
    }
    canonical.href = metadata.canonical
  } else {
    canonical?.remove()
  }

  const preload = documentRef.head.querySelector('#seo-hero-preload')
  if (preload && metadata.preloadImage) preload.href = metadata.preloadImage

  let jsonLd = documentRef.head.querySelector('#seo-jsonld')
  if (!jsonLd) {
    jsonLd = documentRef.createElement('script')
    jsonLd.id = 'seo-jsonld'
    jsonLd.type = 'application/ld+json'
    documentRef.head.appendChild(jsonLd)
  }
  jsonLd.textContent = JSON.stringify(getStructuredData(metadata))
}

/** Updates document metadata as the client-side router changes pages. */
export default function SeoManager() {
  const { pathname } = useLocation()
  const { t, i18n } = useTranslation()

  useEffect(() => {
    const metadata = getSeoMetadata(pathname, t, SITE_URL)
    applyMetadata(document, metadata)
  }, [pathname, t, i18n.language])

  return null
}
