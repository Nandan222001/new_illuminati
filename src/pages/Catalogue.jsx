import { Link, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useConsent } from '../context/ConsentContext'
import { useContent } from '../context/ContentContext'
import { useLocalizedArchives } from '../hooks/useLocalizedContent'
import { findStory } from '../data/stories/index.js'
import EditorialHeader, { Breadcrumbs } from '../components/EditorialHeader'
import ArchivePreviewGrid from '../components/ArchivePreviewGrid'
import CatalogueLoading from '../components/CatalogueLoading'
import StoryCard from '../components/StoryCard'
import NotFound from './NotFound'

const CHAMBER_READING = {
  'the-third-eye': '/stories/eye-of-providence',
  'the-gathering': '/stories/bavarian-illuminati-1776',
  'the-golden-altar': '/stories/pyramid-symbol',
  'the-horned-figure': '/stories/grimoires-history-and-fiction',
  'the-threshold': '/new-order',
  'the-grimoire': '/stories/grimoires-history-and-fiction',
}

function MemberAccess() {
  const { t } = useTranslation()
  const { user, isAdmin } = useAuth()
  const { consent } = useConsent()
  const { pathname, search, hash } = useLocation()
  return (
    <aside className="editorial-notice catalogue-access" aria-label={t('editorial.catalogue.members')}>
      <p>{t('editorial.catalogue.accessNotice')}</p>
      <div className="editorial-actions">
        {!user && <Link className="editorial-button secondary" to="/login" state={{ from: pathname + search + hash }}>{t('editorial.signIn')}</Link>}
        {user && !consent && (isAdmin || user.paid) && <Link className="editorial-button secondary" to="/rules#instructions">{t('editorial.catalogue.reviewTerms')}</Link>}
        <Link className="editorial-text-link" to="/why-999">{t('editorial.catalogue.accessDetails')} <span aria-hidden="true">→</span></Link>
      </div>
    </aside>
  )
}

export function ArchiveCatalogue() {
  const { t } = useTranslation()
  const cards = useLocalizedArchives()
  return (
    <div className="editorial-frame editorial-page">
      <Breadcrumbs items={[{ label: t('nav.archives') }]} />
      <EditorialHeader kicker={t('editorial.home.fiction')} title={t('editorial.catalogue.archiveTitle')} description={t('editorial.catalogue.archiveIntro')} />
      <ArchivePreviewGrid cards={cards} />
      <section className="editorial-section" id="library">
        <h2>{t('library.title')}</h2>
        <MemberAccess />
      </section>
    </div>
  )
}

export function ArchivePreview() {
  const { slug } = useParams()
  const { t } = useTranslation()
  const cards = useLocalizedArchives()
  const { ready } = useContent()
  const i = cards.findIndex((card) => card.slug === slug)
  if (i < 0) return ready ? <NotFound /> : <CatalogueLoading />
  const card = cards[i]
  const previous = cards[i - 1]
  const next = cards[i + 1]
  const reading = findStory(CHAMBER_READING[slug])
  return (
    <div className="editorial-frame editorial-page">
      <Breadcrumbs items={[{ label: t('nav.archives'), to: '/archives' }, { label: card.title }]} />
      <EditorialHeader kicker={t('editorial.catalogue.fictionPreview')} title={card.title} description={card.desc} />
      <MemberAccess />
      {reading && (
        <section className="editorial-section">
          <h2>{t('editorial.catalogue.background')}</h2>
          <div className="story-grid single"><StoryCard story={reading} /></div>
        </section>
      )}
      <nav className="catalogue-pagination" aria-label={t('editorial.catalogue.otherChambers')}>
        {previous && <Link className="editorial-text-link" to={`/archives/${encodeURIComponent(previous.slug)}`}><span aria-hidden="true">←</span> {previous.title}</Link>}
        <Link className="editorial-text-link" to="/archives">{t('editorial.home.allArchives')}</Link>
        {next && <Link className="editorial-text-link" to={`/archives/${encodeURIComponent(next.slug)}`}>{next.title} <span aria-hidden="true">→</span></Link>}
      </nav>
    </div>
  )
}

export function SymbolCatalogue() {
  const { t } = useTranslation()
  return (
    <div className="editorial-frame editorial-page">
      <Breadcrumbs items={[{ label: t('editorial.symbols') }]} />
      <EditorialHeader kicker={t('editorial.home.kicker')} title={t('editorial.symbols')} description={t('editorial.catalogue.symbolIntro')} />
      <div className="story-grid" id="sigils">
        <StoryCard story={findStory('/stories/eye-of-providence')} />
        <StoryCard story={findStory('/stories/pyramid-symbol')} />
        <StoryCard story={findStory('/stories/grimoires-history-and-fiction')} />
      </div>
      <section className="editorial-prose editorial-section" lang="en" id="the-third-eye">
        <h2>The Third Eye is not the Eye of Providence</h2>
        <p>“Third eye” describes ideas about inner sight in several traditions. It is not another name for the eye on the Great Seal of the United States. Our fictional archive borrows the broader motif. The article on the Eye of Providence explains what the designers of the seal said their particular image meant.</p>
        <Link className="editorial-text-link" to="/archives/the-third-eye">The Third Eye archive preview <span aria-hidden="true">→</span></Link>
      </section>
      <MemberAccess />
    </div>
  )
}

const hasVideoSource = (video) => Boolean(video?.has_video || video?.video_url || video?.video_key)

export function VideoCatalogue() {
  const { t } = useTranslation()
  const { videos } = useContent()
  return (
    <div className="editorial-frame editorial-page">
      <Breadcrumbs items={[{ label: t('nav.videos') }]} />
      <EditorialHeader kicker={t('editorial.catalogue.preview')} title={t('editorial.catalogue.videosTitle')} description={t('editorial.catalogue.videosIntro')} />
      {videos.length === 0 ? (
        <p className="editorial-notice">{t('editorial.catalogue.noEpisodes')}</p>
      ) : (
        <ul className="catalogue-video-list">
          {videos.map((video) => (
            <li key={video.slug}>
              <Link to={`/videos/${encodeURIComponent(video.slug)}`} className="archive-preview-card" aria-label={video.title}>
                <div><h3>{video.title}</h3><p>{hasVideoSource(video) ? t('editorial.catalogue.members') : t('editorial.catalogue.noPlayback')}</p></div>
                <span className="editorial-card-action">{t('editorial.catalogue.preview')} <span aria-hidden="true">→</span></span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <MemberAccess />
    </div>
  )
}

export function VideoPreview() {
  const { slug } = useParams()
  const { t } = useTranslation()
  const { videos, ready } = useContent()
  const video = videos.find((item) => item.slug === slug)
  if (!video) return ready ? <NotFound /> : <CatalogueLoading />
  return (
    <div className="editorial-frame editorial-page">
      <Breadcrumbs items={[{ label: t('nav.videos'), to: '/videos' }, { label: video.title }]} />
      <EditorialHeader kicker={t('editorial.catalogue.preview')} title={video.title} description={video.desc} />
      {hasVideoSource(video) ? <MemberAccess /> : <p className="editorial-notice">{t('editorial.catalogue.noPlayback')}</p>}
      {slug === 'new-world-order' && <Link className="editorial-text-link" to="/new-order">{t('editorial.catalogue.readNwo')} <span aria-hidden="true">→</span></Link>}
    </div>
  )
}
