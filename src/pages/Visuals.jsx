import { useEffect, useRef, useState } from 'react'
import useIsomorphicLayoutEffect from '../hooks/useIsomorphicLayoutEffect'
import { Link, useLocation } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { PAGES } from '../data/content'
import { useLocalizedSymbols, useLocalizedTattoos } from '../hooks/useLocalizedContent'
import { useAuth } from '../context/AuthContext'
import { useContent } from '../context/ContentContext'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import SymbolIcon from '../components/SymbolIcon'
import TattooIcon from '../components/TattooIcon'
import SigilFinder from '../components/SigilFinder'
import DollarDecoder from '../components/DollarDecoder'
import Img from '../components/Img'
import InitiationModal from '../components/InitiationModal'
import drawOn from '../utils/drawOn'

/**
 * Section order (item 19): DECODE THE DOLLAR → FIND YOUR SIGIL → THE SIGILS →
 * TATTOOS OF THE UNKNOWN → THE GALLERY.
 *
 * The OSIRIS interface that used to hang off the Third Eye sigil now lives in
 * ARCHIVES → THE THIRD EYE (see ArchiveDetail.jsx).
 */
export default function Visuals() {
  const page = PAGES.visuals
  const { user, isAdmin } = useAuth()
  const { gallery: GALLERY, canAccess } = useContent()
  const { t } = useTranslation()
  const SYMBOLS = useLocalizedSymbols()
  const TATTOOS = useLocalizedTattoos()
  const [activeSlug, setActiveSlug] = useState(SYMBOLS[0].slug)
  const active = SYMBOLS.find((s) => s.slug === activeSlug) || SYMBOLS[0]
  const [lightbox, setLightbox] = useState(null)
  const [showInitiation, setShowInitiation] = useState(false)
  const { hash } = useLocation()
  const detailRef = useRef(null)
  const tattooRef = useRef(null)
  const [showAllTattoos, setShowAllTattoos] = useState(false)

  useIsomorphicLayoutEffect(() => {
    const svgs = detailRef.current ? [...detailRef.current.querySelectorAll('.draw-on svg')] : []
    return drawOn(svgs)
  }, [active.slug])

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

      {/* ---------- 1. DECODE THE DOLLAR ---------- */}
      <section className="page-section" id="decoder">
        <SectionHead title={t('decoder.title')} sub={t('decoder.sub')} />
        <DollarDecoder />
      </section>

      {/* ---------- 2. FIND YOUR SIGIL ---------- */}
      <section className="page-section" id="finder">
        <SectionHead title={t('finder.title')} sub={t('finder.sub')} />
        <SigilFinder />
      </section>

      {/* ---------- 3. THE SIGILS ---------- */}
      <section className="page-section" id="sigils">
        <SectionHead title={t('visuals.sigilsTitle')} sub={t('visuals.sigilsSub')} />
        <div className="sigil-layout">
          <div className="symbol-row sigil-grid">
            {SYMBOLS.map((s) => (
              <button
                type="button"
                className={`symbol${active.slug === s.slug ? ' active' : ''}`}
                key={s.slug}
                id={s.slug}
                onClick={() => {
                  setActiveSlug(s.slug)
                  if (window.matchMedia('(max-width: 1100px)').matches) detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                }}
              >
                <div className="symbol-ring"><SymbolIcon slug={s.slug} /></div>
                <b className="symbol-name">{s.name}</b><span>{s.short}</span>
              </button>
            ))}
          </div>
          <article className="sigil-detail" key={active.slug} ref={detailRef}>
            {active.img ? (
              <div className="sigil-detail-img"><Img src={active.img} alt={active.name} /></div>
            ) : (
              <div className="sigil-detail-img sigil-detail-art draw-on" role="img" aria-label={active.name}><SymbolIcon slug={active.slug} /></div>
            )}
            <div className="sigil-detail-body">
              <div className="symbol-ring small draw-on"><SymbolIcon slug={active.slug} /></div>
              <span className="chamber-num">{active.short.toUpperCase()}</span>
              <h3>{active.name}</h3>
              <p>{active.meaning}</p>
              <div className="sigil-more">
                {active.about && <h4 className="sigil-about-title">{t('visuals.sigilAboutTitle')}</h4>}
                {active.about && <p className="sigil-about-text">{active.about}</p>}
                {active.slug === 'the-third-eye' && (
                  <Link className="btn-gold sigil-archive-link" to="/archives/the-third-eye#osiris">
                    {t('archiveDetail.osirisTitle')} ›
                  </Link>
                )}
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* ---------- 4. TATTOOS OF THE UNKNOWN ---------- */}
      <section className="page-section" id="tattoos" ref={tattooRef}>
        <SectionHead title={t('visuals.tattoosTitle')} sub={t('visuals.tattoosSub')} />
        <div className={`tattoo-grid${showAllTattoos ? '' : ' collapsed'}`}>
          {TATTOOS.map((tt) => (
            <article className="tattoo-card" key={tt.slug}>
              <div className="symbol-ring"><TattooIcon slug={tt.slug} /></div>
              <h4>{tt.name}</h4>
              <p>{tt.meaning}</p>
            </article>
          ))}
        </div>
        <div className="see-more-row">
          <button
            type="button"
            className="btn-ghost"
            aria-expanded={showAllTattoos}
            onClick={() => {
              if (showAllTattoos) tattooRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              setShowAllTattoos(!showAllTattoos)
            }}
          >
            {showAllTattoos ? `${t('visuals.seeLess')} ‹` : `${t('visuals.seeMore')} ›`}
          </button>
        </div>
      </section>

      {/* ---------- 5. THE GALLERY ---------- */}
      <section className="page-section" id="gallery">
        <SectionHead title={t('visuals.galleryTitle')} sub={isAdmin ? t('visuals.gallerySub') : undefined} />
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
                <Img src={g.img} alt={isAdmin ? g.title : ''} />
                {!open && <span className="seal-badge">{t('common.sealedBadge')}</span>}
                {/* Key-visual captions are Keeper-only metadata, hidden from viewers. */}
                {isAdmin && <span className="gallery-cap"><b>{g.title}</b><small>{g.cap}</small></span>}
              </button>
            )
          })}
        </div>
        {GALLERY.some((g) => g.category === 'paid') && (
          user ? (
            <p className="muted"><Trans i18nKey="visuals.sealedUserText" components={[<button type="button" className="link-btn" onClick={() => setShowInitiation(true)} />]} /></p>
          ) : (
            <p className="muted"><Trans i18nKey="visuals.sealedGuestText" components={[<Link to="/register" />]} /></p>
          )
        )}
      </section>

      {lightbox !== null && (
        <div className="lightbox" onClick={(e) => { if (e.target === e.currentTarget) setLightbox(null) }} role="dialog" aria-modal="true">
          <button type="button" className="lb-close" aria-label={t('common.close')} onClick={() => setLightbox(null)}>✕</button>
          <button type="button" className="lb-nav prev" aria-label={t('common.previous')} onClick={() => setLightbox((i) => (i - 1 + GALLERY.length) % GALLERY.length)}>‹</button>
          <figure>
            <img src={GALLERY[lightbox].img} alt={isAdmin ? GALLERY[lightbox].title : ''} />
            {isAdmin && <figcaption><b>{GALLERY[lightbox].title}</b><span>{GALLERY[lightbox].cap}</span><em>{lightbox + 1} / {GALLERY.length}</em></figcaption>}
          </figure>
          <button type="button" className="lb-nav next" aria-label={t('common.next')} onClick={() => setLightbox((i) => (i + 1) % GALLERY.length)}>›</button>
        </div>
      )}

      <InitiationModal open={showInitiation} onClose={() => setShowInitiation(false)} />
    </>
  )
}
