import { useEffect, useState } from 'react'

/**
 * Full-bleed hero banner used by every inner page.
 * Shows a shimmer skeleton until the background image has loaded.
 */
export default function PageHero({ kicker, title, sub, image, children, compact = false }) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
    const img = new Image()
    img.onload = () => setLoaded(true)
    img.onerror = () => setLoaded(true)
    img.src = image
    return () => { img.onload = null; img.onerror = null }
  }, [image])

  return (
    <header className={`page-hero${compact ? ' compact' : ''}`} style={{ backgroundImage: `url('${image}')` }}>
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
