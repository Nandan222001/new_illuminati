import { Link, Navigate, useParams } from 'react-router-dom'
import { CARDS } from '../data/content'
import PageHero from '../components/PageHero'
import Img from '../components/Img'

export default function ArchiveDetail() {
  const { slug } = useParams()
  const index = CARDS.findIndex((c) => c.slug === slug)
  if (index === -1) return <Navigate to="/archives" replace />
  const card = CARDS[index]
  const prev = CARDS[(index - 1 + CARDS.length) % CARDS.length]
  const next = CARDS[(index + 1) % CARDS.length]

  return (
    <>
      <PageHero kicker={card.era} title={card.title} sub={card.cap} image={card.img} compact />

      <section className="page-section detail">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">HOME</Link><span>/</span><Link to="/archives">ARCHIVES</Link><span>/</span><b>{card.title}</b>
        </nav>
        <div className="detail-grid">
          <div className="detail-media"><Img src={card.img} alt={card.title} /></div>
          <div className="detail-body">
            <h2>{card.desc}</h2>
            <p>{card.body}</p>
            <p className="muted">All records in the Ritual Archive are fictional lore written for this entertainment experience.</p>
            <div className="detail-actions">
              <Link to="/rituals" className="btn-gold">SEE THE RITUALS ›</Link>
              <Link to="/archives" className="btn-ghost">ALL CHAMBERS</Link>
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
