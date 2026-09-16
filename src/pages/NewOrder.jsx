import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PAGES, getTimeLeft } from '../data/content'
import { useLocalizedTimeline } from '../hooks/useLocalizedContent'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import Img from '../components/Img'

const PHASES = [
  { n: '01', key: 'signal', img: '/assets/archive-eye.jpg' },
  { n: '02', key: 'gathering', img: '/assets/community-hero.jpg' },
  { n: '03', key: 'screening', img: '/assets/videos-hero.jpg' },
  { n: '04', key: 'zeroHour', img: '/assets/neworder-hero.jpg' },
]

export default function NewOrder() {
  const page = PAGES.newOrder
  const [timeLeft, setTimeLeft] = useState(getTimeLeft)
  const [email, setEmail] = useState('')
  const { user } = useAuth()
  const toast = useToast()
  const { t } = useTranslation()
  const timeline = useLocalizedTimeline()

  useEffect(() => {
    const tick = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(tick)
  }, [])

  const notify = (e) => {
    e.preventDefault()
    toast(t('newOrder.notifyToast'))
    setEmail('')
  }

  return (
    <>
      <PageHero kicker={t('content.pages.newOrder.kicker')} title={t('content.pages.newOrder.title')} sub={t('content.pages.newOrder.sub')} image={page.hero} imageMobile={page.heroMobile}>
        <div className="cd-boxes big">
          <div className="cd-box"><b>{String(timeLeft.d).padStart(3, '0')}</b><span>{t('common.days')}</span></div>
          <div className="cd-box"><b>{String(timeLeft.h).padStart(2, '0')}</b><span>{t('common.hours')}</span></div>
          <div className="cd-box"><b>{String(timeLeft.m).padStart(2, '0')}</b><span>{t('common.minutes')}</span></div>
          <div className="cd-box"><b>{String(timeLeft.s).padStart(2, '0')}</b><span>{t('common.seconds')}</span></div>
        </div>
        <div className="cd-big hero-big">666,666</div>
      </PageHero>

      <section className="page-section">
        <SectionHead title={t('newOrder.whatHappensTitle')} sub={t('newOrder.whatHappensSub')} />
        <p className="page-intro left">{t('content.pages.newOrder.intro')}</p>
        <div className="phase-grid">
          {PHASES.map((p) => (
            <article className="phase" key={p.n}>
              <div className="phase-img"><Img src={p.img} alt={t(`newOrder.phases.${p.key}.title`)} /><span className="phase-num">{p.n}</span></div>
              <h3>{t(`newOrder.phases.${p.key}.title`)}</h3>
              <p>{t(`newOrder.phases.${p.key}.text`)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section band">
        <div className="band-inner">
          <div>
            <div className="sec-title">{t('newOrder.roadTitle')}</div>
            <ul className="mini-timeline">
              {timeline.map((item) => (
                <li key={item.key}><b>{item.year}</b><span><strong>{item.title}</strong> — {item.text}</span></li>
              ))}
            </ul>
          </div>
          <div className="notify-box">
            <h4>{t('newOrder.notifyTitle')}</h4>
            {user ? (
              <>
                <p>{t('newOrder.alreadyOnList', { name: user.name.split(' ')[0] })}</p>
                <Link to="/profile" className="btn-gold">{t('newOrder.viewProfile')}</Link>
              </>
            ) : (
              <form onSubmit={notify}>
                <p>{t('newOrder.notifyPrompt')}</p>
                <div className="notify-row">
                  <input type="email" required placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <button type="submit" className="btn-gold">{t('newOrder.notifyMe')}</button>
                </div>
                <Link to="/register" className="sec-link">{t('newOrder.orBecomeInitiate')}</Link>
              </form>
            )}
            <div className="cd-note"><i>ⓘ</i> {t('common.fictionalMilestoneNote')}</div>
          </div>
        </div>
      </section>
    </>
  )
}
