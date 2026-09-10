import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PAGES, TIMELINE, getTimeLeft } from '../data/content'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import Img from '../components/Img'

const PHASES = [
  { n: '01', title: 'THE SIGNAL', text: 'The counter appears on every page. Initiates receive the first sealed message.', img: '/assets/archive-eye.jpg' },
  { n: '02', title: 'THE GATHERING', text: 'The council convenes. New chambers open in the archive and the community votes on the next chapter.', img: '/assets/community-hero.jpg' },
  { n: '03', title: 'THE SCREENING', text: 'The Last Screening — the feature-length finale of season one — is unsealed for all initiates.', img: '/assets/videos-hero.jpg' },
  { n: '04', title: 'THE NEW ORDER', text: 'Zero hour. The next season of the experience begins. Fictional, scheduled and entirely ours.', img: '/assets/neworder-hero.jpg' },
]

export default function NewOrder() {
  const page = PAGES.newOrder
  const [timeLeft, setTimeLeft] = useState(getTimeLeft)
  const [email, setEmail] = useState('')
  const { user } = useAuth()
  const toast = useToast()

  useEffect(() => {
    const tick = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(tick)
  }, [])

  const notify = (e) => {
    e.preventDefault()
    toast('You will be notified when the veil thins (demo)')
    setEmail('')
  }

  return (
    <>
      <PageHero kicker={page.kicker} title={page.title} sub={page.sub} image={page.hero} imageMobile={page.heroMobile}>
        <div className="cd-boxes big">
          <div className="cd-box"><b>{String(timeLeft.d).padStart(3, '0')}</b><span>DAYS</span></div>
          <div className="cd-box"><b>{String(timeLeft.h).padStart(2, '0')}</b><span>HOURS</span></div>
          <div className="cd-box"><b>{String(timeLeft.m).padStart(2, '0')}</b><span>MINUTES</span></div>
          <div className="cd-box"><b>{String(timeLeft.s).padStart(2, '0')}</b><span>SECONDS</span></div>
        </div>
        <div className="cd-big hero-big">666,666</div>
      </PageHero>

      <section className="page-section">
        <SectionHead title="WHAT HAPPENS AT ZERO" sub="FOUR PHASES. ONE DATE." />
        <p className="page-intro left">{page.intro}</p>
        <div className="phase-grid">
          {PHASES.map((p) => (
            <article className="phase" key={p.n}>
              <div className="phase-img"><Img src={p.img} alt={p.title} /><span className="phase-num">{p.n}</span></div>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section band">
        <div className="band-inner">
          <div>
            <div className="sec-title">THE ROAD TO 06 · 11 · 2026</div>
            <ul className="mini-timeline">
              {TIMELINE.map((t) => (
                <li key={t.year}><b>{t.year}</b><span><strong>{t.title}</strong> — {t.text}</span></li>
              ))}
            </ul>
          </div>
          <div className="notify-box">
            <h4>BE THE FIRST TO KNOW</h4>
            {user ? (
              <>
                <p>You are already on the list, {user.name.split(' ')[0]}. Initiates are notified before anyone else.</p>
                <Link to="/profile" className="btn-gold">VIEW MY PROFILE ›</Link>
              </>
            ) : (
              <form onSubmit={notify}>
                <p>Leave an email or become an initiate to receive the signal.</p>
                <div className="notify-row">
                  <input type="email" required placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <button type="submit" className="btn-gold">NOTIFY ME</button>
                </div>
                <Link to="/register" className="sec-link">OR BECOME AN INITIATE ›</Link>
              </form>
            )}
            <div className="cd-note"><i>ⓘ</i> This is a fictional campaign milestone, not a real-world event.</div>
          </div>
        </div>
      </section>
    </>
  )
}
