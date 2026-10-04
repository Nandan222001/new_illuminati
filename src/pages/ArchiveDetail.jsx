import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocalizedCards } from '../hooks/useLocalizedContent'
import { useContent } from '../context/ContentContext'
import PageHero from '../components/PageHero'
import Img from '../components/Img'

const THIRD_EYE_SLUG = 'the-third-eye'
const OSIRIS_URL = 'https://osirisai.live/?layers=jets,maritime,cctv,cctv_previews,live_news,earthquakes,global_incidents,day_night,cables,sdk_sea,sdk_air,sdk_naval'

export default function ArchiveDetail() {
  const { slug } = useParams()
  const { t } = useTranslation()
  const { archives } = useContent()
  const cards = useLocalizedCards()
  const custom = archives.find((a) => a.custom && a.slug === slug)
  const list = custom
    ? [...cards, { ...custom, era: custom.era || 'Chamber', cap: custom.cap || '', body: custom.body || '' }]
    : cards
  const index = list.findIndex((c) => c.slug === slug)
  if (index === -1) return <Navigate to="/archives" replace />
  const card = list[index]
  const prev = list[(index - 1 + list.length) % list.length]
  const next = list[(index + 1) % list.length]
  const isThirdEye = card.slug === THIRD_EYE_SLUG

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

        {/* OSIRIS lives with the Third Eye chamber (moved out of the Visuals
            sigil panel in v1.1.6). */}
        {isThirdEye && (
          <article className="osiris-panel" id="osiris">
            <div className="osiris-head">
              <span className="osiris-badge">{t('archiveDetail.osirisBadge')}</span>
              <h3>{t('archiveDetail.osirisTitle')}</h3>
            </div>
            <p className="osiris-text">{t('archiveDetail.osirisText')}</p>
            <div className="osiris-foot">
              <a className="btn-gold" href={OSIRIS_URL} target="_blank" rel="noopener noreferrer">
                {t('archiveDetail.osirisCta')} ↗
              </a>
              <span className="muted">{t('archiveDetail.osirisFrame')}</span>
            </div>
          </article>
        )}

        <div className="detail-nav">
          <Link to={`/archives/${prev.slug}`} className="detail-nav-link">‹ <span>{prev.title}</span></Link>
          <Link to={`/archives/${next.slug}`} className="detail-nav-link right"><span>{next.title}</span> ›</Link>
        </div>
      </section>
    </>
  )
}
