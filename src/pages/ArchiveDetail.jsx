import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocalizedCards } from '../hooks/useLocalizedContent'
import PageHero from '../components/PageHero'
import Img from '../components/Img'

export default function ArchiveDetail() {
  const { slug } = useParams()
  const { t } = useTranslation()
  const cards = useLocalizedCards()
  const index = cards.findIndex((c) => c.slug === slug)
  if (index === -1) return <Navigate to="/archives" replace />
  const card = cards[index]
  const prev = cards[(index - 1 + cards.length) % cards.length]
  const next = cards[(index + 1) % cards.length]

  return (
    <>
      <PageHero kicker={card.era} title={card.title} sub={card.cap} image={card.img} compact />

      <section className="page-section detail">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">{t('nav.home')}</Link><span>/</span><Link to="/archives">{t('nav.archives')}</Link><span>/</span><b>{card.title}</b>
        </nav>
        <div className="detail-grid">
          <div className="detail-media"><Img src={card.img} alt={card.title} /></div>
          <div className="detail-body">
            <h2>{card.desc}</h2>
            <p>{card.body}</p>
            <div className="detail-actions">
              <Link to="/rituals" className="btn-gold">{t('archiveDetail.seeRituals')}</Link>
              <Link to="/archives" className="btn-ghost">{t('archiveDetail.allChambers')}</Link>
            </div>
          </div>
        </div>
        <div className="detail-nav">
          <Link to={`/archives/${prev.slug}`} className="detail-nav-link">‹ <span>{prev.title}</span></Link>
          <Link to={`/archives/${next.slug}`} className="detail-nav-link right"><span>{next.title}</span> ›</Link>
        </div>
      </section>
    </>
  )
}
