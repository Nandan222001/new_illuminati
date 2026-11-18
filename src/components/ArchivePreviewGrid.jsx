import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function ArchivePreviewGrid({ cards }) {
  const { t } = useTranslation()
  if (cards.length === 0) return <p className="editorial-notice">{t('editorial.catalogue.noChapters')}</p>
  return (
    <ul className="archive-preview-grid">
      {cards.map(({ slug, title, desc }, index) => (
        <li key={slug}>
          <Link className="archive-preview-card" to={`/archives/${encodeURIComponent(slug)}`} aria-label={title}>
            <span className="archive-preview-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <div><h3>{title}</h3><p>{desc}</p></div>
            <span className="editorial-card-action">{t('editorial.catalogue.preview')} <span aria-hidden="true">→</span></span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
