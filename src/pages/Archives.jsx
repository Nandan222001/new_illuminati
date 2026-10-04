import { Link } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { PAGES } from '../data/content'
import { useLocalizedCards } from '../hooks/useLocalizedContent'
import { useAuth } from '../context/AuthContext'
import { useContent } from '../context/ContentContext'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import Img from '../components/Img'
import InitiationModal from '../components/InitiationModal'
import { useState } from 'react'

export default function Archives() {
  const page = PAGES.archives
  const { t } = useTranslation()
  const { user } = useAuth()
  const { archives, books, canAccess } = useContent()
  const [showInitiation, setShowInitiation] = useState(false)
  const cards = useLocalizedCards()

  // Keeper-added chambers come from the API; built-in chambers stay translated.
  const customCards = archives
    .filter((a) => a.custom)
    .map((a) => ({ ...a, era: a.era || 'Chamber', cap: a.cap || '', body: a.body || '' }))
  const allCards = [...cards, ...customCards]

  return (
    <>
      <PageHero kicker={t('content.pages.archives.kicker')} title={t('content.pages.archives.title')} sub={t('content.pages.archives.sub')} image={page.hero} imageMobile={page.heroMobile}>
        <p className="page-intro">{t('content.pages.archives.intro')}</p>
      </PageHero>

      <section className="page-section">
        <SectionHead title={t('archives.chambersTitle')} sub={t('archives.chambersSub')} />
        <div className="chamber-list">
          {allCards.map((c, i) => (
            <Link to={`/archives/${c.slug}`} className={`chamber${i % 2 ? ' reverse' : ''}`} key={c.slug}>
              <div className="chamber-img"><Img src={c.img} alt={c.title} /></div>
              <div className="chamber-body">
                <span className="chamber-num">{c.era}</span>
                <h3>{c.title}</h3>
                <p className="chamber-desc">{c.desc}</p>
                <p className="chamber-cap">{c.cap}</p>
                <em className="sec-link">{t('archives.openRecord')}</em>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- THE LIBRARY (e-books) ---------- */}
      <section className="page-section" id="library">
        <SectionHead title={t('library.title')} sub={t('library.sub')} />
        {books.length === 0 ? (
          <p className="empty">{t('library.empty')}</p>
        ) : (
          <div className="book-grid">
            {books.map((b) => {
              const open = canAccess(b.category)
              const sealed = b.category === 'paid' && !open
              return (
                <article className={`book-card${sealed ? ' sealed' : ''}`} key={b.slug}>
                  <div className="book-cover">
                    <Img src={b.img} alt={b.title} />
                    {b.category === 'paid' && <span className={`seal-badge${open ? ' unsealed' : ''}`}>{open ? t('library.unsealed') : t('library.sealed')}</span>}
                  </div>
                  <h4>{b.title}</h4>
                  <p>{b.desc}</p>
                  <div className="book-meta">
                    <span>{t('library.pages', { count: b.pages || '—' })}</span>
                    {b.format && <span>{String(b.format).toUpperCase()}</span>}
                  </div>
                  {sealed ? (
                    user ? (
                      <button type="button" className="btn-ghost small" onClick={() => setShowInitiation(true)}>{t('library.sealedUserText').replace(/<[^>]*>/g, '')}</button>
                    ) : (
                      <Link className="btn-ghost small" to="/register">{t('library.signInToRead')}</Link>
                    )
                  ) : b.file ? (
                    <a className="btn-gold small" href={b.file} target="_blank" rel="noopener noreferrer" download>{t('library.download')} ⤓</a>
                  ) : (
                    <>
                      <button type="button" className="btn-ghost small" disabled>{t('library.awaiting')}</button>
                      <p className="muted small-note">{t('library.awaitingNote')}</p>
                    </>
                  )}
                </article>
              )
            })}
          </div>
        )}
        {books.some((b) => b.category === 'paid') && (
          <p className="muted"><Trans i18nKey="library.viewerNote" /></p>
        )}
      </section>

      <section className="page-section band">
        <div className="band-inner">
          <div>
            <div className="sec-title">{t('archives.bandTitle')}</div>
            <p className="band-text">{t('archives.bandText')}</p>
          </div>
          <div className="band-actions">
            <Link to="/rituals" className="btn-gold">{t('archives.bandCtaRituals')}</Link>
            <Link to="/videos" className="btn-ghost">{t('archives.bandCtaWatch')}</Link>
          </div>
        </div>
      </section>

      <InitiationModal open={showInitiation} onClose={() => setShowInitiation(false)} />
    </>
  )
}
