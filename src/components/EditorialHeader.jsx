import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function Breadcrumbs({ items }) {
  const { t } = useTranslation()
  return (
    <nav className="editorial-crumbs" aria-label={t('editorial.breadcrumbs')}>
      <ol>
        {[{ label: t('nav.home'), to: '/' }, ...items].map(({ label, to }, i, all) => (
          <li key={to || label}>
            {i === all.length - 1 ? <span aria-current="page">{label}</span> : <Link to={to}>{label}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default function EditorialHeader({ kicker, title, description, children }) {
  return (
    <header className="editorial-header">
      {kicker && <p className="editorial-kicker">{kicker}</p>}
      <h1>{title}</h1>
      {description && <p className="editorial-lede">{description}</p>}
      {children}
    </header>
  )
}
