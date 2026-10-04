import { Link } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { PAGES } from '../data/content'
import { useLocalizedCards } from '../hooks/useLocalizedContent'
import { useAuth } from '../context/AuthContext'
import { useContent } from '../context/ContentContext'
import { useToast } from '../context/ToastContext'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import Img from '../components/Img'
import InitiationModal from '../components/InitiationModal'
import EbookViewer from '../components/EbookViewer'
import { downloadEbook, ebookFilename, isExternalEbook, isStoredEbook } from '../api/library'
import { useState } from 'react'

export default function Archives() {
  const page = PAGES.archives
  const { t } = useTranslation()
  const { user } = useAuth()
  const { archives, books, canAccess } = useContent()
  const toast = useToast()
  const [showInitiation, setShowInitiation] = useState(false)
  const [viewerBook, setViewerBook] = useState(null)
  const [savingKey, setSavingKey] = useState('')
  const cards = useLocalizedCards()

  /** Stored volumes open in the in-page reader (they need the member's token);
   *  linked ones simply open where they are hosted. */
  const readVolume = (book) => {
    if (isExternalEbook(book)) {
      window.open(book.file, '_blank', 'noopener')
      return
    }
    setViewerBook(book)
  }

  const saveVolume = async (book) => {
    setSavingKey(book.slug)
    try {
      if (isExternalEbook(book)) {
        // Hosted elsewhere: hand it to the browser, we cannot count or gate it.
        window.open(book.file, '_blank', 'noopener')
      } else {
        await downloadEbook(book)
        toast(t('library.saved', { name: ebookFilename(book) }))
      }
    } catch (err) {
      toast(err.message)
    } finally {
      setSavingKey('')
    }
  }

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
              // Redacted rows carry `has_file` instead of a file link.
              const hasFile = !!b.file || !!b.has_file
              const browsing = savingKey === b.slug
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
                  ) : hasFile ? (
                    <div className="book-actions">
                      <button type="button" className="btn-gold small" onClick={() => readVolume(b)}>{t('library.read')}</button>
                      <button type="button" className="btn-ghost small" onClick={() => saveVolume(b)} disabled={browsing}>
                        {browsing ? `${t('library.download')} …` : `${t('library.download')} ⤓`}
                      </button>
                    </div>
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
          <p className="muted">
            <Trans i18nKey="library.viewerNote" />
            {books.some((b) => b.category === 'paid' && (b.file || b.has_file)) && <><br /><Trans i18nKey="library.sealedNote" /></>}
          </p>
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
      <EbookViewer book={viewerBook} open={!!viewerBook} onClose={() => setViewerBook(null)} />
    </>
  )
}
