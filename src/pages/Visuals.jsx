import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PAGES, SYMBOLS } from '../data/content'
import { useContent } from '../context/ContentContext'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import SymbolIcon from '../components/SymbolIcon'
import Img from '../components/Img'

export default function Visuals() {
  const page = PAGES.visuals
  const { gallery: GALLERY, canAccess } = useContent()
  const [active, setActive] = useState(SYMBOLS[0])
  const [lightbox, setLightbox] = useState(null)
  const { hash } = useLocation()

  useEffect(() => {
    const target = SYMBOLS.find((s) => `#${s.slug}` === hash)
    if (target) setActive(target)
  }, [hash])

  useEffect(() => {
    if (lightbox === null) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight') setLightbox((i) => (i + 1) % GALLERY.length)
      if (e.key === 'ArrowLeft') setLightbox((i) => (i - 1 + GALLERY.length) % GALLERY.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  return (
    <>
      <PageHero kicker={page.kicker} title={page.title} sub={page.sub} image={page.hero} imageMobile={page.heroMobile}>
        <p className="page-intro">{page.intro}</p>
      </PageHero>

      <section className="page-section">
        <SectionHead title="THE SIGILS" sub="TAP A SYMBOL TO REVEAL ITS MEANING IN THE FICTION." />
        <div className="sigil-layout">
          <div className="symbol-row sigil-grid">
            {SYMBOLS.map((s) => (
              <button type="button" className={`symbol${active.slug === s.slug ? ' active' : ''}`} key={s.slug} id={s.slug} onClick={() => setActive(s)}>
                <div className="symbol-ring"><SymbolIcon name={s.name} /></div>
                <b className="symbol-name">{s.name}</b><span>{s.short}</span>
              </button>
            ))}
          </div>
          <article className="sigil-detail" key={active.slug}>
            <div className="sigil-detail-img"><Img src={active.img} alt={active.name} /></div>
            <div className="sigil-detail-body">
              <div className="symbol-ring small"><SymbolIcon name={active.name} /></div>
              <span className="chamber-num">{active.short.toUpperCase()}</span>
              <h3>{active.name}</h3>
              <p>{active.meaning}</p>
            </div>
          </article>
        </div>
      </section>

      <section className="page-section">
        <SectionHead title="THE GALLERY" sub="KEY VISUALS FROM ACROSS THE EXPERIENCE. CLICK TO ENLARGE." />
        <div className="gallery">
          {GALLERY.map((g, i) => {
            const open = canAccess(g.category)
            return (
              <button type="button" className={`gallery-item${g.portrait ? ' portrait' : ''}${!open ? ' sealed' : ''}`} key={g.id} onClick={() => open && setLightbox(i)} disabled={!open}>
                <Img src={g.img} alt={g.title} />
                {!open && <span className="seal-badge">🔒 SEALED</span>}
                <span className="gallery-cap"><b>{g.title}</b><small>{g.cap}</small></span>
              </button>
            )
          })}
        </div>
        {GALLERY.some((g) => g.category === 'paid') && (
          <p className="muted">🔒 Sealed visuals are available to signed-in initiates. <Link to="/register">Become an initiate ›</Link></p>
        )}
      </section>

      {lightbox !== null && (
        <div className="lightbox" onClick={(e) => { if (e.target === e.currentTarget) setLightbox(null) }} role="dialog" aria-modal="true">
          <button type="button" className="lb-close" aria-label="Close" onClick={() => setLightbox(null)}>✕</button>
          <button type="button" className="lb-nav prev" aria-label="Previous" onClick={() => setLightbox((i) => (i - 1 + GALLERY.length) % GALLERY.length)}>‹</button>
          <figure>
            <img src={GALLERY[lightbox].img} alt={GALLERY[lightbox].title} />
            <figcaption><b>{GALLERY[lightbox].title}</b><span>{GALLERY[lightbox].cap}</span><em>{lightbox + 1} / {GALLERY.length}</em></figcaption>
          </figure>
          <button type="button" className="lb-nav next" aria-label="Next" onClick={() => setLightbox((i) => (i + 1) % GALLERY.length)}>›</button>
        </div>
      )}
    </>
  )
}
