import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PAGES } from '../data/content'
import { useLocalizedCards } from '../hooks/useLocalizedContent'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import Img from '../components/Img'

export default function Archives() {
  const page = PAGES.archives
  const { t } = useTranslation()
  const cards = useLocalizedCards()
  return (
    <>
      <PageHero kicker={t('content.pages.archives.kicker')} title={t('content.pages.archives.title')} sub={t('content.pages.archives.sub')} image={page.hero} imageMobile={page.heroMobile}>
        <p className="page-intro">{t('content.pages.archives.intro')}</p>
      </PageHero>

      <section className="page-section">
        <SectionHead title={t('archives.chambersTitle')} sub={t('archives.chambersSub')} />
        <div className="chamber-list">
          {cards.map((c, i) => (
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
    </>
  )
}
