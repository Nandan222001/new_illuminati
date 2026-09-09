import { useEffect, useRef, useState } from 'react'

const NAV_LINKS = [
  { id: 'home', label: 'HOME' },
  { id: 'archives', label: 'ARCHIVES' },
  { id: 'countdown', label: 'NEW ORDER' },
  { id: 'symbols', label: 'RITUALS' },
  { id: 'videos', label: 'VIDEOS' },
  { id: 'symbols', label: 'VISUALS' },
  { id: 'community', label: 'COMMUNITY' },
  { id: 'about', label: 'ABOUT' },
]

const CARDS = [
  { title: 'THE THIRD EYE', desc: 'A symbol representing knowledge, perception and hidden truth.', cap: 'Knowledge · Perception · Truth', img: '/assets/archive-eye.jpg' },
  { title: 'THE GATHERING', desc: 'Hooded keepers circle the eternal flame of counsel.', cap: 'Ceremony · Brotherhood · Oath', img: '/assets/archive-ritual.jpg' },
  { title: 'THE GOLDEN ALTAR', desc: 'Where candlelight meets the triangular gate of awakening.', cap: 'Light · Passage · Awakening', img: '/assets/archive-altar.jpg' },
  { title: 'THE HORNED FIGURE', desc: 'Myth and allegory guarding the gate of forbidden wisdom.', cap: 'Myth · Allegory · Power', img: '/assets/archive-baphomet.jpg' },
  { title: 'THE THRESHOLD', desc: 'One silhouette. One triangle. One choice to step through.', cap: 'Choice · Passage · Destiny', img: '/assets/archive-silhouette.jpg' },
  { title: 'THE GRIMOIRE', desc: 'Parchments of sigils, circles and centuries-old questions.', cap: 'Sigils · History · Mystery', img: '/assets/archive-parchment.jpg' },
]

const SYMBOLS = [
  { name: 'THE THIRD EYE', note: 'THE THIRD EYE — perception beyond sight' },
  { name: 'THE PYRAMID', note: 'THE PYRAMID — ascent of knowledge' },
  { name: 'THE SHADOW', note: 'THE SHADOW — the keeper of secrets' },
  { name: 'THE HORNED FIGURE', note: 'THE HORNED FIGURE — myth & allegory' },
  { name: 'THE BLACK SUN', note: 'THE BLACK SUN — the hidden light' },
]

const VIDEOS = [
  { title: 'Satanic Mythology', tag: 'fiction', dur: '12:46', img: '/assets/archive-baphomet.jpg', note: 'Now playing: Satanic Mythology (fiction)' },
  { title: 'Hidden Societies', tag: 'theory', dur: '08:20', img: '/assets/archive-ritual.jpg', note: 'Now playing: Hidden Societies (theory)' },
  { title: 'Ancient Mysteries', tag: 'fact', dur: '15:02', img: '/assets/forbidden-pyramid.jpg', note: 'Now playing: Ancient Mysteries (fact)' },
  { title: 'New World Order', tag: 'theory', dur: '10:44', img: '/assets/forbidden-city.jpg', note: 'Now playing: New World Order (theory)' },
]

const INSTA_IMAGES = [
  '/assets/archive-eye.jpg',
  '/assets/archive-altar.jpg',
  '/assets/archive-ritual.jpg',
  '/assets/archive-baphomet.jpg',
  '/assets/archive-silhouette.jpg',
  '/assets/community-emblem.jpg',
]

const TARGET_DATE = new Date('2026-11-06T00:00:00')

function getTimeLeft() {
  let diff = TARGET_DATE - new Date()
  if (diff < 0) diff = 0
  return {
    d: Math.floor(diff / 864e5),
    h: Math.floor(diff / 36e5) % 24,
    m: Math.floor(diff / 6e4) % 60,
    s: Math.floor(diff / 1e3) % 60,
  }
}

function Img({ src, alt, className = '' }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <>
      {!loaded && <div className="skeleton" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`${className} img-fade${loaded ? ' loaded' : ''}`}
        onLoad={() => setLoaded(true)}
      />
    </>
  )
}

function BrandMark({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      <polygon points="50,6 95,88 5,88" stroke="#e6c878" strokeWidth="3" fill="rgba(230,200,120,.06)" />
      <polygon points="50,26 78,76 22,76" stroke="#c9a24b" strokeWidth="1.5" fill="none" />
      <ellipse cx="50" cy="60" rx="17" ry="10" stroke="#e6c878" strokeWidth="2" fill="none" />
      <circle cx="50" cy="60" r="5" fill="#e6c878" />
      <circle cx="50" cy="14" r="2.5" fill="#e6c878" />
    </svg>
  )
}

function SymbolIcon({ name }) {
  const stroke = { fill: 'none', stroke: '#e6c878', strokeWidth: 2 }
  switch (name) {
    case 'THE THIRD EYE':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <ellipse cx="50" cy="50" rx="26" ry="14" />
          <circle cx="50" cy="50" r="7" fill="#e6c878" stroke="none" />
          <circle cx="50" cy="50" r="12" strokeWidth="1" opacity=".7" />
          <path d="M50 18v8M50 74v8M18 50h8M74 50h8" strokeWidth="1.5" />
        </svg>
      )
    case 'THE PYRAMID':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <polygon points="50,22 76,72 24,72" />
          <polygon points="50,22 59,40 41,40" fill="#e6c878" stroke="none" opacity=".85" />
          <path d="M32 62h36M37 54h26" strokeWidth="1" opacity=".7" />
        </svg>
      )
    case 'THE SHADOW':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <path d="M50 24c-10 6-14 16-14 28l-6 24h40l-6-24c0-12-4-22-14-28z" fill="rgba(230,200,120,.1)" />
          <ellipse cx="50" cy="48" rx="8" ry="10" fill="#050203" />
          <circle cx="47" cy="46" r="1.3" fill="#e6c878" stroke="none" />
          <circle cx="53" cy="46" r="1.3" fill="#e6c878" stroke="none" />
        </svg>
      )
    case 'THE HORNED FIGURE':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <path d="M30 30C22 40 24 54 34 60M70 30c8 10 6 24-4 30" strokeLinecap="round" />
          <path d="M38 52c0 10 5 18 12 18s12-8 12-18l-4-6H42z" fill="rgba(230,200,120,.1)" />
          <circle cx="45" cy="56" r="1.6" fill="#e6c878" stroke="none" />
          <circle cx="55" cy="56" r="1.6" fill="#e6c878" stroke="none" />
        </svg>
      )
    case 'THE BLACK SUN':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <circle cx="50" cy="50" r="10" />
          <g strokeWidth="1.6">
            <path d="M50 26v10M50 64v10M26 50h10M64 50h10M33 33l7 7M60 60l7 7M67 33l-7 7M40 60l-7 7" />
          </g>
          <circle cx="50" cy="50" r="4" fill="#e6c878" stroke="none" />
        </svg>
      )
    default:
      return null
  }
}

export default function App() {
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [timeLeft, setTimeLeft] = useState(getTimeLeft)
  const [modalOpen, setModalOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastShow, setToastShow] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [heroBgLoaded, setHeroBgLoaded] = useState(false)
  const [countdownBgLoaded, setCountdownBgLoaded] = useState(false)

  useEffect(() => {
    const hero = new Image()
    hero.onload = () => setHeroBgLoaded(true)
    hero.src = '/assets/hero-baphomet.jpg'
    const countdown = new Image()
    countdown.onload = () => setCountdownBgLoaded(true)
    countdown.src = '/assets/archive-baphomet.jpg'
  }, [])

  const cardRefs = useRef([])
  const carouselRef = useRef(null)
  const toastTimer = useRef(null)

  const showCard = (i) => {
    setCurrent((prev) => {
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

  useEffect(() => {
    const secs = ['home', 'archives', 'symbols', 'videos', 'community', 'about']
    const onScroll = () => {
      let cur = 'home'
      secs.forEach((id) => {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < 200) cur = id
      })
      setActiveSection(cur)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toast = (msg) => {
    setToastMsg(msg)
    setToastShow(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastShow(false), 2600)
  }

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <>
      <nav className="nav">
        <a className="brand" href="#home" onClick={(e) => { e.preventDefault(); scrollTo('home') }}>
          <BrandMark className="brand-mark" />
          <span className="brand-name">ILLUMINATI<small>BROTHERHOOD</small></span>
        </a>
        <div className={`nav-links${mobileNavOpen ? ' mobile-open' : ''}`}>
          {NAV_LINKS.map((link, i) => (
            <a
              key={`${link.id}-${i}`}
              href={`#${link.id}`}
              className={activeSection === link.id ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); scrollTo(link.id); setMobileNavOpen(false) }}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="nav-right">
          <button className="icon-btn" title="Ambient sound" onClick={() => { setSoundOn((s) => !s); toast('Ambient sound toggled (demo)') }}>
            {soundOn ? '🔊' : '🔈'}
          </button>
          <button className="icon-btn" title="Search" onClick={() => toast('Search the archives (demo)')}>⌕</button>
          <button className="btn-enter" onClick={() => setModalOpen(true)}>ENTER △</button>
          <button className="hamburger" onClick={() => setMobileNavOpen((v) => !v)}>☰</button>
        </div>
      </nav>

      <header className="hero" id="home">
        <div className={`skeleton bg-skeleton${heroBgLoaded ? ' bg-skeleton-hidden' : ''}`} />
        <div className="hero-inner">
          <div>
            <div className="eyebrow">WELCOME TO</div>
            <h1>ILLUMINATI<br />BROTHERHOOD</h1>
            <p className="hero-sub">The door has always been open,<br />only few know where it is.</p>
            <div className="hero-tag">ENTER THE UNKNOWN</div>
            <div className="hero-cta">
              <button className="btn-gold" onClick={() => scrollTo('archives')}>ENTER THE ARCHIVES <span>›</span></button>
              <button className="btn-ghost" onClick={() => scrollTo('community')}>👥 JOIN THE COMMUNITY</button>
            </div>
            <div className="social-row">
              <a href="#" title="Instagram">📷</a><a href="#" title="Discord">🎮</a><a href="#" title="Telegram">✈</a><a href="#" title="YouTube">▶</a><a href="#" title="X">𝕏</a>
            </div>
          </div>
          <div className="hero-rail">
            <div>
              <a href="#archives" onClick={(e) => { e.preventDefault(); scrollTo('archives') }}>HISTORY</a><br />
              <a href="#symbols" onClick={(e) => { e.preventDefault(); scrollTo('symbols') }}>SYMBOLS</a><br />
              <a href="#videos" onClick={(e) => { e.preventDefault(); scrollTo('videos') }}>CONSPIRACIES</a><br />
              <a href="#videos" onClick={(e) => { e.preventDefault(); scrollTo('videos') }}>THEORIES</a><br />
              <a href="#countdown" onClick={(e) => { e.preventDefault(); scrollTo('countdown') }}>SECRETS</a>
            </div>
            <svg className="rail-emblem" viewBox="0 0 100 100" fill="none">
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

      <section className="archive" id="archives">
        <div className="sec-head">
          <div>
            <div className="sec-title">THE RITUAL ARCHIVE</div>
            <div className="sec-sub">A JOURNEY THROUGH SYMBOLS, CEREMONY AND MYSTERY.</div>
          </div>
        </div>
        <div className="carousel-wrap">
          <button className="car-btn prev" onClick={() => showCard(current - 1)}>‹</button>
          <div className="carousel" ref={carouselRef}>
            {CARDS.map((c, i) => (
              <div
                key={c.title}
                ref={(el) => { cardRefs.current[i] = el }}
                className={`card${i === current ? ' active' : ''}`}
                onClick={() => showCard(i)}
              >
                <Img src={c.img} alt={c.title} />
                <div className="card-cap"><h4>{c.title}</h4><p>{c.cap}</p></div>
              </div>
            ))}
          </div>
          <button className="car-btn next" onClick={() => showCard(current + 1)}>›</button>
        </div>
        <div className="car-foot">
          <div className="car-count"><span>{String(current + 1).padStart(2, '0')}</span> <span className="dim">/ 06</span></div>
          <div className="car-now">
            <span style={{ color: 'var(--gold)' }}>›</span>
            <div><h4>{CARDS[current].title}</h4><p>{CARDS[current].desc}</p></div>
          </div>
          <div className="autoplay">
            AUTO PLAY · 02 SEC
            <button className="pause-btn" onClick={() => setPlaying((p) => !p)}>{playing ? '❚❚' : '▶'}</button>
          </div>
        </div>
      </section>

      <section className="split" id="symbols">
        <div className="symbols">
          <div className="sec-head">
            <div>
              <div className="sec-title">SYMBOLS OF THE UNKNOWN</div>
              <div className="sec-sub">ANCIENT SYMBOLS. MODERN INTERPRETATIONS. ENDLESS QUESTIONS.</div>
            </div>
          </div>
          <div className="symbol-row">
            {SYMBOLS.map((s) => (
              <div className="symbol" key={s.name} onClick={() => toast(s.note)}>
                <div className="symbol-ring"><SymbolIcon name={s.name} /></div>
                <h5>{s.name}</h5><span>Explore</span>
              </div>
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
          <div className="cd-note"><i>ⓘ</i> This is a fictional campaign milestone, not a real-world event.</div>
        </div>
      </section>

      <section className="triple" id="videos">
        <div>
          <div className="sec-head">
            <div>
              <div className="sec-title">FORBIDDEN ARCHIVES</div>
              <div className="sec-sub">EXPLORE THE VIDEOS, DOCUMENTARIES AND HIDDEN STORIES.</div>
            </div>
          </div>
          <div className="vid-grid">
            {VIDEOS.map((v) => (
              <div className="vid" key={v.title} onClick={() => toast(v.note)}>
                <div className="vid-thumb">
                  <Img src={v.img} alt={v.title} />
                  <span className="play">▶</span>
                  <span className="dur">{v.dur}</span>
                </div>
                <div className="vid-body">
                  <h5>{v.title}</h5>
                  <span className={`tag ${v.tag}`}>{v.tag.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div id="community">
          <div className="sec-head">
            <div>
              <div className="sec-title" style={{ fontSize: 16 }}>ENTER THE COMMUNITY</div>
              <div className="sec-sub">DISCUSS. SHARE. EXPLORE.</div>
            </div>
          </div>
          <div className="comm-body">
            <div className="comm-emblem-wrap">
              <Img className="comm-emblem" src="/assets/community-emblem.jpg" alt="Brotherhood emblem" />
            </div>
            <div className="comm-btns">
              <button onClick={() => toast('Discord invite copied (demo)')}>🎮 DISCORD</button>
              <button onClick={() => toast('Opening Telegram (demo)')}>✈ TELEGRAM</button>
              <button onClick={() => toast('Opening Instagram (demo)')}>📷 INSTAGRAM</button>
              <button onClick={() => toast('Opening Discussion Board (demo)')}>💬 DISCUSSION BOARD</button>
            </div>
          </div>
          <div className="comm-note">18+ recommended for mature content.</div>
          <div className="comm-social"><a href="#">📷</a><a href="#">🎮</a><a href="#">✈</a><a href="#">▶</a><a href="#">𝕏</a></div>
        </div>
        <div>
          <div className="sec-head">
            <div>
              <div className="sec-title" style={{ fontSize: 13 }}>FOLLOW THE BROTHERHOOD<br />ON INSTAGRAM</div>
            </div>
          </div>
          <div className="insta-grid">
            {INSTA_IMAGES.map((img, i) => (
              <a href="#" key={i}><Img src={img} alt="post" /></a>
            ))}
          </div>
          <div className="insta-foot">
            <button className="follow-btn" onClick={() => toast('Following @illuminati.brotherhood (demo)')}>📷 FOLLOW NOW</button>
            <span className="handle">@illuminati.brotherhood</span>
          </div>
        </div>
      </section>

      <footer id="about">
        <div className="foot-brand">
          <BrandMark className="brand-mark" style={{ width: 40, height: 40 }} />
          <span className="brand-name">ILLUMINATI<small>BROTHERHOOD</small></span>
        </div>
        <p className="foot-desc">An immersive fictional exploration of secret-society mythology, conspiracy culture and historical mysteries.</p>
        <div>
          <div className="foot-links"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Community Guidelines</a><a href="#">Contact</a><a href="#">Content Disclaimer</a></div>
          <div className="foot-copy">© 2026 Illuminati Brotherhood. All rights reserved. A fictional entertainment experience.</div>
        </div>
      </footer>

      <div className={`modal${modalOpen ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}>
        <div className="modal-box">
          <svg className="m-mark" viewBox="0 0 100 100" fill="none">
            <polygon points="50,6 95,88 5,88" stroke="#e6c878" strokeWidth="3" />
            <ellipse cx="50" cy="60" rx="17" ry="10" stroke="#e6c878" strokeWidth="2" />
            <circle cx="50" cy="60" r="5" fill="#e6c878" />
          </svg>
          <h3>ENTER THE UNKNOWN?</h3>
          <p>
            You are about to explore a <b style={{ color: 'var(--gold)' }}>fictional, entertainment-only</b> experience about secret-society mythology. No real-world claims. No real rituals. Just story, symbol and cinema.
            <br /><br />Do you wish to proceed?
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn-gold" onClick={() => { setModalOpen(false); scrollTo('archives') }}>I ENTER ›</button>
            <button className="btn-ghost" onClick={() => setModalOpen(false)}>STAY OUTSIDE</button>
          </div>
        </div>
      </div>
      <div className={`toast${toastShow ? ' show' : ''}`}>{toastMsg}</div>
    </>
  )
}
