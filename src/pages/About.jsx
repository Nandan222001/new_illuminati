import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PAGES } from '../data/content'
import { useLocalizedFaq, useLocalizedTimeline } from '../hooks/useLocalizedContent'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import Img from '../components/Img'

const PILLARS = ['storyFirst', 'clearlyLabelled', 'communityLed', 'noClaims']
const PILLAR_ICONS = { storyFirst: '◬', clearlyLabelled: '◈', communityLed: '◎', noClaims: '⊘' }

export default function About() {
  const page = PAGES.about
  const [open, setOpen] = useState(0)
  const { t } = useTranslation()
  const timeline = useLocalizedTimeline()
  const faq = useLocalizedFaq()

  return (
    <>
      <PageHero kicker={t('content.pages.about.kicker')} title={t('content.pages.about.title')} sub={t('content.pages.about.sub')} image={page.hero} imageMobile={page.heroMobile}>
        <p className="page-intro">{t('content.pages.about.intro')}</p>
      </PageHero>

      <section className="page-section">
        <SectionHead title={t('about.pillarsTitle')} sub={t('about.pillarsSub')} />
        <div className="pillar-grid">
          {PILLARS.map((key) => (
            <article className="pillar" key={key}>
              <span className="pillar-icon">{PILLAR_ICONS[key]}</span>
              <h3>{t(`about.pillars.${key}.title`)}</h3>
              <p>{t(`about.pillars.${key}.text`)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section about-story">
        <div className="about-img"><Img src="/assets/archives-hero.jpg" alt={t('about.libraryAlt')} /></div>
        <div className="about-text">
          <SectionHead title={t('about.storyTitle')} />
          <ol className="story-timeline">
            {timeline.map((item) => (
              <li key={item.key}><b>{item.year}</b><h4>{item.title}</h4><p>{item.text}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="page-section" id="faq">
        <SectionHead title={t('about.faqTitle')} sub={t('about.faqSub')} />
        <div className="faq">
          {faq.map((f, i) => (
            <div className={`faq-item${open === i ? ' open' : ''}`} key={f.key}>
              <button type="button" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                <span>{f.q}</span><em>{open === i ? '−' : '+'}</em>
              </button>
              <div className="faq-a"><p>{f.a}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="page-section band" id="disclaimer">
        <div className="band-inner">
          <div>
            <div className="sec-title">{t('footer.disclaimer')}</div>
            <p className="band-text">{t('about.disclaimerText')}</p>
          </div>
          <div className="band-actions">
            <Link to="/register" className="btn-gold">{t('common.becomeInitiate')} ›</Link>
            <Link to="/community" className="btn-ghost">{t('common.joinCommunity')}</Link>
          </div>
        </div>
      </section>
    </>
  )
}
