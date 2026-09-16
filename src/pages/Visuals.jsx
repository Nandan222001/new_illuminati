import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { PAGES } from '../data/content'
import { useLocalizedSymbols } from '../hooks/useLocalizedContent'
import { useAuth } from '../context/AuthContext'
import { useContent } from '../context/ContentContext'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import SymbolIcon from '../components/SymbolIcon'
import Img from '../components/Img'
import InitiationModal from '../components/InitiationModal'

export default function Visuals() {
  const page = PAGES.visuals
  const { user } = useAuth()
  const { gallery: GALLERY, canAccess } = useContent()
  const { t } = useTranslation()
  const SYMBOLS = useLocalizedSymbols()
  const [activeSlug, setActiveSlug] = useState(SYMBOLS[0].slug)
  const active = SYMBOLS.find((s) => s.slug === activeSlug) || SYMBOLS[0]
  const [lightbox, setLightbox] = useState(null)
  const [showInitiation, setShowInitiation] = useState(false)
  const { hash } = useLocation()

  useEffect(() => {
    const target = SYMBOLS.find((s) => `#${s.slug}` === hash)
    if (target) setActiveSlug(target.slug)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <PageHero kicker={t('content.pages.visuals.kicker')} title={t('content.pages.visuals.title')} sub={t('content.pages.visuals.sub')} image={page.hero} imageMobile={page.heroMobile}>
        <p className="page-intro">{t('content.pages.visuals.intro')}</p>
      </PageHero>

      <section className="page-section">
        <SectionHead title={t('visuals.sigilsTitle')} sub={t('visuals.sigilsSub')} />
        <div className="sigil-layout">
          <div className="symbol-row sigil-grid">
            {SYMBOLS.map((s) => (
              <button type="button" className={`symbol${active.slug === s.slug ? ' active' : ''}`} key={s.slug} id={s.slug} onClick={() => setActiveSlug(s.slug)}>
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
        <SectionHead title={t('visuals.galleryTitle')} sub={t('visuals.gallerySub')} />
        <div className="gallery">
          {GALLERY.map((g, i) => {
            const open = canAccess(g.category)
            const clickable = open || !!user
            return (
              <button
                type="button"
                className={`gallery-item${g.portrait ? ' portrait' : ''}${!open ? ' sealed' : ''}`}
                key={g.id}
                onClick={() => { if (open) setLightbox(i); else if (user) setShowInitiation(true) }}
                disabled={!clickable}
              >
                <Img src={g.img} alt={g.title} />
                {!open && <span className="seal-badge">{t('common.sealedBadge')}</span>}
                <span className="gallery-cap"><b>{g.title}</b><small>{g.cap}</small></span>
              </button>
            )
          })}
        </div>
        {GALLERY.some((g) => g.category === 'paid') && (
          user ? (
            <p className="muted"><Trans i18nKey="visuals.sealedUserText" components={{ 0: <button type="button" className="link-btn" onClick={() => setShowInitiation(true)} /> }} /></p>
          ) : (
            <p className="muted"><Trans i18nKey="visuals.sealedGuestText" components={{ 0: <Link to="/register" /> }} /></p>
          )
        )}
      </section>

      {lightbox !== null && (
        <div className="lightbox" onClick={(e) => { if (e.target === e.currentTarget) setLightbox(null) }} role="dialog" aria-modal="true">
          <button type="button" className="lb-close" aria-label={t('common.close')} onClick={() => setLightbox(null)}>✕</button>
          <button type="button" className="lb-nav prev" aria-label={t('common.previous')} onClick={() => setLightbox((i) => (i - 1 + GALLERY.length) % GALLERY.length)}>‹</button>
          <figure>
            <img src={GALLERY[lightbox].img} alt={GALLERY[lightbox].title} />
            <figcaption><b>{GALLERY[lightbox].title}</b><span>{GALLERY[lightbox].cap}</span><em>{lightbox + 1} / {GALLERY.length}</em></figcaption>
          </figure>
          <button type="button" className="lb-nav next" aria-label={t('common.next')} onClick={() => setLightbox((i) => (i + 1) % GALLERY.length)}>›</button>
        </div>
      )}

      <InitiationModal open={showInitiation} onClose={() => setShowInitiation(false)} />
    </>
  )
}
