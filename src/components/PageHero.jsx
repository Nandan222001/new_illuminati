import { useEffect, useState } from 'react'

const MOBILE_QUERY = '(max-width: 720px)'

/** True when the viewport matches the mobile breakpoint (SSR-safe). */
export function useIsMobile(query = MOBILE_QUERY) {
  const [mobile, setMobile] = useState(() => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false))
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const mq = window.matchMedia(query)
    const onChange = (e) => setMobile(e.matches)
    setMobile(mq.matches)
    mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange)
    return () => (mq.removeEventListener ? mq.removeEventListener('change', onChange) : mq.removeListener(onChange))
  }, [query])
  return mobile
}

/**
 * Full-bleed hero banner used by every inner page.
 * Uses a dedicated portrait image on phones (art direction) when provided,
 * and shows a shimmer skeleton until the chosen image has loaded.
 */
export default function PageHero({ kicker, title, sub, image, imageMobile, children, compact = false, align = 'bottom' }) {
  const isMobile = useIsMobile()
  const src = isMobile && imageMobile ? imageMobile : image
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
    const img = new Image()
    img.onload = () => setLoaded(true)
    img.onerror = () => setLoaded(true)
    img.src = src
    return () => { img.onload = null; img.onerror = null }
  }, [src])

  return (
    <header
      className={`page-hero${compact ? ' compact' : ''}${isMobile && imageMobile ? ' has-portrait' : ''}${align === 'center' ? ' align-center' : ''}`}
      style={{ backgroundImage: `url('${src}')` }}
    >
      <div className={`skeleton bg-skeleton${loaded ? ' bg-skeleton-hidden' : ''}`} />
      <div className="page-hero-inner">
        {kicker && <div className="eyebrow">{kicker}</div>}
        <h1>{title}</h1>
        {sub && <p className="page-hero-sub">{sub}</p>}
        {children}
      </div>
    </header>
  )
}
