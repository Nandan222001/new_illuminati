import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { CARDS, INSTA_IMAGES, PAGES, SYMBOLS, getTimeLeft } from '../data/content'
import { useAuth } from '../context/AuthContext'
import { useContent } from '../context/ContentContext'
import { useToast } from '../context/ToastContext'
import Img from '../components/Img'
import { useIsMobile } from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import SymbolIcon from '../components/SymbolIcon'

const HOME_SYMBOLS = SYMBOLS.slice(0, 5)

const EXPLORE = [
  { to: '/archives', page: PAGES.archives },
  { to: '/rituals', page: PAGES.rituals },
  { to: '/new-order', page: PAGES.newOrder },
  { to: '/videos', page: PAGES.videos },
  { to: '/visuals', page: PAGES.visuals },
  { to: '/community', page: PAGES.community },
]

export default function Home() {
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [timeLeft, setTimeLeft] = useState(getTimeLeft)
  const [heroBgLoaded, setHeroBgLoaded] = useState(false)
  const [countdownBgLoaded, setCountdownBgLoaded] = useState(false)
  const cardRefs = useRef([])
  const carouselRef = useRef(null)
  const toast = useToast()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { videos } = useContent()
  const { openDisclaimer } = useOutletContext()
  const isMobile = useIsMobile()
  const heroSrc = isMobile ? '/assets/hero-baphomet-mobile.jpg' : '/assets/hero-baphomet.jpg'
  const HOME_VIDEOS = useMemo(() => videos.slice(0, 4), [videos])

  useEffect(() => {
    setHeroBgLoaded(false)
    const hero = new Image()
    hero.onload = () => setHeroBgLoaded(true)
    hero.src = heroSrc
    const countdown = new Image()
    countdown.onload = () => setCountdownBgLoaded(true)
    countdown.src = '/assets/archive-baphomet.jpg'
  }, [heroSrc])

  const showCard = (i) => {
    setCurrent(() => {
      const next = (i + CARDS.length) % CARDS.length
      const track = carouselRef.current
      const card = cardRefs.current[next]
      if (track && card) {
        const target = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2
        track.scrollTo({ left: Math.max(0, target), behavior: 'smooth' })
      }
      return next
    })
  }

  useEffect(() => {
    if (!playing) return undefined
    const timer = setInterval(() => showCard(current + 1), 2000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, playing])

  useEffect(() => {
    const tick = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(tick)
  }, [])

  return (
    <>
      <header className={`hero${isMobile ? ' hero-portrait' : ''}`} id="home" style={{ backgroundImage: `url('${heroSrc}')` }}>
        <div className={`skeleton bg-skeleton${heroBgLoaded ? ' bg-skeleton-hidden' : ''}`} />
        <div className="hero-inner">
          <div>
            <div className="eyebrow">{user ? `WELCOME BACK, ${user.name.split(' ')[0].toUpperCase()}` : 'WELCOME TO'}</div>
            <h1>ILLUMINATI<br />BROTHERHOOD</h1>
            <p className="hero-sub">The door has always been open,<br />only few know where it is.</p>
            <div className="hero-tag">ENTER THE UNKNOWN</div>
            <div className="hero-cta">
              <button className="btn-gold" onClick={openDisclaimer}>ENTER THE DARK WORLD <span>›</span></button>
              {user
                ? <Link className="btn-ghost" to="/community">👥 JOIN THE COMMUNITY</Link>
                : <Link className="btn-ghost" to="/register">△ BECOME AN INITIATE</Link>}
            </div>
            <div className="social-row">
              <a href="#" title="Instagram" onClick={(e) => e.preventDefault()}>📷</a>
              <a href="#" title="Discord" onClick={(e) => e.preventDefault()}>🎮</a>
              <a href="#" title="Telegram" onClick={(e) => e.preventDefault()}>✈</a>
              <a href="#" title="YouTube" onClick={(e) => e.preventDefault()}>▶</a>
              <a href="#" title="X" onClick={(e) => e.preventDefault()}>𝕏</a>
            </div>
          </div>
          <div className="hero-rail">
            <div>
              <Link to="/archives">HISTORY</Link><br />
              <Link to="/visuals">SYMBOLS</Link><br />
              <Link to="/videos">CONSPIRACIES</Link><br />
              <Link to="/rituals">RITUALS</Link><br />
              <Link to="/new-order">SECRETS</Link>
            </div>
            <svg className="rail-emblem" viewBox="0 0 100 100" fill="none" aria-hidden="true">
              <polygon points="50,6 95,88 5,88" stroke="#e6c878" strokeWidth="2.5" />
              <circle cx="50" cy="58" r="20" stroke="#e6c878" strokeWidth="1.5" />
              <ellipse cx="50" cy="58" rx="12" ry="7" stroke="#e6c878" strokeWidth="1.5" />
              <circle cx="50" cy="58" r="3.5" fill="#e6c878" />
            </svg>
          </div>
        </div>
        <div className="hero-bottom">
          <div className="left"><span className="pulse-dot"></span> FICTIONAL / ENTERTAINMENT EXPERIENCE</div>
          <div className="scroll-hint">SCROLL TO EXPLORE <span className="mouse"></span></div>
        </div>
      </header>

      {/* ---------- EXPLORE THE PAGES ---------- */}
      <section className="explore" id="explore">
        <SectionHead title="CHOOSE YOUR PATH" sub="SIX DOORS. EACH ONE LEADS DEEPER." />
        <div className="explore-grid">
          {EXPLORE.map(({ to, page }) => (
            <Link to={to} className="explore-card" key={to}>
              <Img src={page.hero} alt={page.title} />
              <div className="explore-cap">
                <span>{page.kicker}</span>
                <h3>{page.title}</h3>
                <p>{page.sub}</p>
                <em>ENTER ›</em>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- ARCHIVE CAROUSEL ---------- */}
      <section className="archive" id="archives">
        <SectionHead
          title="THE RITUAL ARCHIVE"
          sub="A JOURNEY THROUGH SYMBOLS, CEREMONY AND MYSTERY."
          right={<Link to="/archives" className="sec-link">VIEW ALL CHAMBERS ›</Link>}
        />
        <div className="carousel-wrap">
          <button className="car-btn prev" aria-label="Previous" onClick={() => showCard(current - 1)}>‹</button>
          <div className="carousel" ref={carouselRef}>
            {CARDS.map((c, i) => (
              <div
                key={c.title}
                ref={(el) => { cardRefs.current[i] = el }}
                className={`card${i === current ? ' active' : ''}`}
                onClick={() => (i === current ? navigate(`/archives/${c.slug}`) : showCard(i))}
              >
                <Img src={c.img} alt={c.title} />
                <div className="card-cap"><h4>{c.title}</h4><p>{c.cap}</p></div>
              </div>
            ))}
          </div>
          <button className="car-btn next" aria-label="Next" onClick={() => showCard(current + 1)}>›</button>
        </div>
        <div className="car-foot">
          <div className="car-count"><span>{String(current + 1).padStart(2, '0')}</span> <span className="dim">/ {String(CARDS.length).padStart(2, '0')}</span></div>
          <div className="car-now">
            <span style={{ color: 'var(--gold)' }}>›</span>
            <div><h4>{CARDS[current].title}</h4><p>{CARDS[current].desc}</p></div>
          </div>
          <div className="autoplay">
            AUTO PLAY · 02 SEC
            <button className="pause-btn" aria-label={playing ? 'Pause' : 'Play'} onClick={() => setPlaying((p) => !p)}>{playing ? '❚❚' : '▶'}</button>
          </div>
        </div>
      </section>

      {/* ---------- SYMBOLS + COUNTDOWN ---------- */}
      <section className="split" id="symbols">
        <div className="symbols">
          <SectionHead
            title="SYMBOLS OF THE UNKNOWN"
            sub="ANCIENT SYMBOLS. MODERN INTERPRETATIONS. ENDLESS QUESTIONS."
            right={<Link to="/visuals" className="sec-link">ALL VISUALS ›</Link>}
          />
          <div className="symbol-row">
            {HOME_SYMBOLS.map((s) => (
              <Link className="symbol" key={s.name} to={`/visuals#${s.slug}`} onClick={() => toast(`${s.name} — ${s.short}`)}>
                <div className="symbol-ring"><SymbolIcon name={s.name} /></div>
                <h5>{s.name}</h5><span>Explore</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="countdown" id="countdown">
          <div className={`skeleton bg-skeleton${countdownBgLoaded ? ' bg-skeleton-hidden' : ''}`} />
          <div className="cd-kicker">THE 666,666 EXPERIENCE</div>
          <div className="cd-date">06 NOVEMBER 2026 · 12:00 AM</div>
          <div className="cd-big">666,666</div>
          <div className="cd-boxes">
            <div className="cd-box"><b>{String(timeLeft.d).padStart(3, '0')}</b><span>DAYS</span></div>
            <div className="cd-box"><b>{String(timeLeft.h).padStart(2, '0')}</b><span>HOURS</span></div>
            <div className="cd-box"><b>{String(timeLeft.m).padStart(2, '0')}</b><span>MINUTES</span></div>
            <div className="cd-box"><b>{String(timeLeft.s).padStart(2, '0')}</b><span>SECONDS</span></div>
          </div>
          <Link to="/new-order" className="btn-ghost cd-cta">THE NEW ORDER ›</Link>
          <div className="cd-note"><i>ⓘ</i> This is a fictional campaign milestone, not a real-world event.</div>
        </div>
      </section>

      {/* ---------- VIDEOS / COMMUNITY / INSTAGRAM ---------- */}
      <section className="triple" id="videos">
        <div>
          <SectionHead
            title="FORBIDDEN ARCHIVES"
            sub="EXPLORE THE VIDEOS, DOCUMENTARIES AND HIDDEN STORIES."
            right={<Link to="/videos" className="sec-link">ALL VIDEOS ›</Link>}
          />
          <div className="vid-grid">
            {HOME_VIDEOS.map((v) => (
              <Link className="vid" key={v.slug} to={`/videos/${v.slug}`}>
                <div className="vid-thumb">
                  <Img src={v.img} alt={v.title} />
                  <span className="play">▶</span>
                  <span className="dur">{v.dur}</span>
                </div>
                <div className="vid-body">
                  <h5>{v.title}</h5>
                  <span className={`tag ${v.tag}`}>{v.tag.toUpperCase()}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div id="community">
          <SectionHead title="ENTER THE COMMUNITY" sub="DISCUSS. SHARE. EXPLORE." size={16} />
          <div className="comm-body">
            <div className="comm-emblem-wrap">
              <Img className="comm-emblem" src="/assets/community-emblem.jpg" alt="Brotherhood emblem" />
            </div>
            <div className="comm-btns">
              <button onClick={() => toast('Discord invite copied (demo)')}>🎮 DISCORD</button>
              <button onClick={() => toast('Opening Telegram (demo)')}>✈ TELEGRAM</button>
              <button onClick={() => toast('Opening Instagram (demo)')}>📷 INSTAGRAM</button>
              <button onClick={() => navigate('/community')}>💬 DISCUSSION BOARD</button>
            </div>
          </div>
          <div className="comm-note">18+ recommended for mature content.</div>
          <div className="comm-social">
            <a href="#" onClick={(e) => e.preventDefault()}>📷</a><a href="#" onClick={(e) => e.preventDefault()}>🎮</a><a href="#" onClick={(e) => e.preventDefault()}>✈</a><a href="#" onClick={(e) => e.preventDefault()}>▶</a><a href="#" onClick={(e) => e.preventDefault()}>𝕏</a>
          </div>
        </div>
        <div>
          <SectionHead title={<>FOLLOW THE BROTHERHOOD<br />ON INSTAGRAM</>} size={13} />
          <div className="insta-grid">
            {INSTA_IMAGES.map((img, i) => (
              <a href="#" key={i} onClick={(e) => { e.preventDefault(); toast('Opening Instagram (demo)') }}><Img src={img} alt="Instagram post" /></a>
            ))}
          </div>
          <div className="insta-foot">
            <button className="follow-btn" onClick={() => toast('Following @illuminati.brotherhood (demo)')}>📷 FOLLOW NOW</button>
            <span className="handle">@illuminati.brotherhood</span>
          </div>
        </div>
      </section>
    </>
  )
}
