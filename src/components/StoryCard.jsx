import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const MOTIFS = {
  archive: 'M10 15h28v20H10zm-3-5h34v5H7zm11 11h12m-12 5h8',
  eye: 'M5 24c12-14 26-14 38 0-12 14-26 14-38 0zm25 0a6 6 0 1 0-12 0 6 6 0 0 0 12 0zM24 7v4m0 26v4',
  pyramid: 'M24 8 43 38H5L24 8Zm-4 7h8M15 23h18m-23 8h28',
  compass: 'M38 24a14 14 0 1 1-28 0 14 14 0 0 1 28 0ZM24 5v9m0 20v9m19-19h-9m-20 0H5m16-3 11-5-5 11-11 5 5-11Z',
  book: 'M24 36c-6-5-11-6-17-5V13c6-1 11 0 17 5 6-5 11-6 17-5v18c-6-1-11 0-17 5zm0-18v18m-12-16c3 0 5 1 8 3m8 0c3-2 5-3 8-3',
}

export default function StoryCard({ story }) {
  const { t } = useTranslation()
  return (
    <article className="story-card" lang="en">
      <Link to={story.path} aria-label={story.title}>
        <span className="story-motif" aria-hidden="true">
          <svg viewBox="0 0 48 48" width="35" height="35" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d={MOTIFS[story.motif]} /></svg>
        </span>
        <span className="editorial-kicker">{story.category}</span>
        <h3>{story.title}</h3>
        <p>{story.summary}</p>
        <span className="editorial-card-action">{t('editorial.readStory')} <span aria-hidden="true">→</span></span>
      </Link>
    </article>
  )
}
