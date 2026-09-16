import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { INSTA_IMAGES, PAGES, getTimeLeft } from '../data/content'
import { useLocalizedCards, useLocalizedSymbols } from '../hooks/useLocalizedContent'
import { useAuth } from '../context/AuthContext'
import { useContent } from '../context/ContentContext'
import { useToast } from '../context/ToastContext'
import Img from '../components/Img'
import { useIsMobile } from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import SymbolIcon from '../components/SymbolIcon'
import BrandFlame from '../components/BrandFlame'

const EXPLORE = [
  { to: '/archives', key: 'archives', page: PAGES.archives },
  { to: '/rituals', key: 'rituals', page: PAGES.rituals },
  { to: '/new-order', key: 'newOrder', page: PAGES.newOrder },
  { to: '/videos', key: 'videos', page: PAGES.videos },
  { to: '/visuals', key: 'visuals', page: PAGES.visuals },
  { to: '/community', key: 'community', page: PAGES.community },
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
  const { videos, canAccess } = useContent()
  const { openDisclaimer } = useOutletContext()
  const isMobile = useIsMobile()
  const heroSrc = isMobile ? '/assets/hero-baphomet-mobile.jpg' : '/assets/hero-baphomet.jpg'
  const HOME_VIDEOS = useMemo(() => videos.slice(0, 4), [videos])
  const { t } = useTranslation()
  const CARDS = useLocalizedCards()
  const HOME_SYMBOLS = useLocalizedSymbols().slice(0, 5)

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
            <div className="eyebrow">{user ? t('home.welcomeBack', { name: user.name.split(' ')[0].toUpperCase() }) : t('home.welcomeTo')}</div>
            <h1>ILLUMINATI<br />BROTHERHOOD</h1>
            <p className="hero-sub">{t('home.heroSubLine1')}<br />{t('home.heroSubLine2')}</p>
            <div className="hero-tag">{t('home.heroTag')}</div>
            <div className="hero-cta">
              <button className="btn-gold hero-cta-main" onClick={openDisclaimer}>
                <BrandFlame button />
                <span className="cta-label">{t('home.ctaMain')} <i className="cta-arrow">›</i></span>
              </button>
              {user
                ? <Link className="btn-ghost" to="/community">👥 {t('common.joinCommunity')}</Link>
                : <Link className="btn-ghost" to="/register">△ {t('common.becomeInitiate')}</Link>}
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
              <Link to="/archives">{t('home.railHistory')}</Link><br />
              <Link to="/visuals">{t('home.railSymbols')}</Link><br />
              <Link to="/videos">{t('home.railConspiracies')}</Link><br />
              <Link to="/rituals">{t('nav.rituals')}</Link><br />
              <Link to="/new-order">{t('home.railSecrets')}</Link>
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
          <div className="left"><span className="pulse-dot"></span> {t('home.bottomLeft')}</div>
          <div className="scroll-hint">{t('home.scrollHint')} <span className="mouse"></span></div>
        </div>
      </header>

      {/* ---------- EXPLORE THE PAGES ---------- */}
      <section className="explore" id="explore">
        <SectionHead title={t('home.exploreTitle')} sub={t('home.exploreSub')} />
        <div className="explore-grid">
          {EXPLORE.map(({ to, key, page }) => (
            <Link to={to} className="explore-card" key={to}>
              <Img src={page.hero} alt={t(`content.pages.${key}.title`)} />
              <div className="explore-cap">
                <span>{t(`content.pages.${key}.kicker`)}</span>
                <h3>{t(`content.pages.${key}.title`)}</h3>
                <p>{t(`content.pages.${key}.sub`)}</p>
                <em>{t('common.enterArrow')}</em>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- ARCHIVE CAROUSEL ---------- */}
      <section className="archive" id="archives">
        <SectionHead
          title={t('content.pages.archives.kicker')}
          sub={t('content.pages.archives.sub')}
          right={<Link to="/archives" className="sec-link">{t('home.viewAllChambers')}</Link>}
        />
        <div className="carousel-wrap">
          <button className="car-btn prev" aria-label={t('common.previous')} onClick={() => showCard(current - 1)}>‹</button>
          <div className="carousel" ref={carouselRef}>
            {CARDS.map((c, i) => (
              <div
                key={c.slug}
                ref={(el) => { cardRefs.current[i] = el }}
                className={`card${i === current ? ' active' : ''}`}
                onClick={() => (i === current ? navigate(`/archives/${c.slug}`) : showCard(i))}
              >
                <Img src={c.img} alt={c.title} />
                <div className="card-cap"><h4>{c.title}</h4><p>{c.cap}</p></div>
              </div>
            ))}
          </div>
          <button className="car-btn next" aria-label={t('common.next')} onClick={() => showCard(current + 1)}>›</button>
        </div>
        <div className="car-foot">
          <div className="car-count"><span>{String(current + 1).padStart(2, '0')}</span> <span className="dim">/ {String(CARDS.length).padStart(2, '0')}</span></div>
          <div className="car-now">
            <span style={{ color: 'var(--gold)' }}>›</span>
            <div><h4>{CARDS[current].title}</h4><p>{CARDS[current].desc}</p></div>
          </div>
          <div className="autoplay">
            {t('home.autoplayLabel')}
            <button className="pause-btn" aria-label={playing ? t('common.pause') : t('common.play')} onClick={() => setPlaying((p) => !p)}>{playing ? '❚❚' : '▶'}</button>
          </div>
        </div>
      </section>

      {/* ---------- SYMBOLS + COUNTDOWN ---------- */}
      <section className="split" id="symbols">
        <div className="symbols">
          <SectionHead
            title={t('content.pages.visuals.kicker')}
            sub={t('content.pages.visuals.sub')}
            right={<Link to="/visuals" className="sec-link">{t('home.allVisuals')}</Link>}
          />
          <div className="symbol-row">
            {HOME_SYMBOLS.map((s) => (
              <Link className="symbol" key={s.slug} to={`/visuals#${s.slug}`} onClick={() => toast(`${s.name} — ${s.short}`)}>
                <div className="symbol-ring"><SymbolIcon slug={s.slug} /></div>
                <h5>{s.name}</h5><span>{t('common.explore')}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="countdown" id="countdown">
          <div className={`skeleton bg-skeleton${countdownBgLoaded ? ' bg-skeleton-hidden' : ''}`} />
          <div className="cd-kicker">{t('content.pages.newOrder.kicker')}</div>
          <div className="cd-date">{t('home.countdownDate')}</div>
          <div className="cd-big">666,666</div>
          <div className="cd-boxes">
            <div className="cd-box"><b>{String(timeLeft.d).padStart(3, '0')}</b><span>{t('common.days')}</span></div>
            <div className="cd-box"><b>{String(timeLeft.h).padStart(2, '0')}</b><span>{t('common.hours')}</span></div>
            <div className="cd-box"><b>{String(timeLeft.m).padStart(2, '0')}</b><span>{t('common.minutes')}</span></div>
            <div className="cd-box"><b>{String(timeLeft.s).padStart(2, '0')}</b><span>{t('common.seconds')}</span></div>
          </div>
          <Link to="/new-order" className="btn-ghost cd-cta">{t('home.countdownCta')}</Link>
          <div className="cd-note"><i>ⓘ</i> {t('common.fictionalMilestoneNote')}</div>
        </div>
      </section>

      {/* ---------- VIDEOS / COMMUNITY / INSTAGRAM ---------- */}
      <section className="triple" id="videos">
        <div>
          <SectionHead
            title={t('content.pages.videos.kicker')}
            sub={t('content.pages.videos.sub')}
            right={<Link to="/videos" className="sec-link">{t('home.allVideos')}</Link>}
          />
          <div className="vid-grid">
            {HOME_VIDEOS.map((v) => {
              const open = canAccess(v.category) && !!user
              return (
                <Link className={`vid${!open ? ' sealed' : ''}`} key={v.slug} to={`/videos/${v.slug}`}>
                  <div className="vid-thumb">
                    <Img src={v.img} alt={v.title} />
                    <span className="play">{open ? '▶' : '🔒'}</span>
                    <span className="dur">{v.dur}</span>
                    {!open && <span className="seal-badge">{user ? t('common.sealedBadge') : t('common.signInBadge')}</span>}
                  </div>
                  <div className="vid-body">
                    <h5>{v.title}</h5>
                    <span className={`tag ${v.tag}`}>{t(`common.tags.${v.tag}`)}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
        <div id="community">
          <SectionHead title={t('home.communityTitle')} sub={t('content.pages.community.sub')} size={16} />
          <div className="comm-body">
            <div className="comm-emblem-wrap">
              <Img className="comm-emblem" src="/assets/community-emblem.jpg" alt="Brotherhood emblem" />
            </div>
            <div className="comm-btns">
              <button onClick={() => toast(t('content.channels.discord.note'))}>🎮 {t('content.channels.discord.name')}</button>
              <button onClick={() => toast(t('content.channels.telegram.note'))}>✈ {t('content.channels.telegram.name')}</button>
              <button onClick={() => toast(t('content.channels.instagram.note'))}>📷 {t('content.channels.instagram.name')}</button>
              <button onClick={() => navigate('/community')}>💬 {t('content.channels.discussionBoard.name')}</button>
            </div>
          </div>
          <div className="comm-note">{t('home.communityMatureNote')}</div>
          <div className="comm-social">
            <a href="#" onClick={(e) => e.preventDefault()}>📷</a><a href="#" onClick={(e) => e.preventDefault()}>🎮</a><a href="#" onClick={(e) => e.preventDefault()}>✈</a><a href="#" onClick={(e) => e.preventDefault()}>▶</a><a href="#" onClick={(e) => e.preventDefault()}>𝕏</a>
          </div>
        </div>
        <div>
          <SectionHead title={<>{t('home.instagramTitleLine1')}<br />{t('home.instagramTitleLine2')}</>} size={13} />
          <div className="insta-grid">
            {INSTA_IMAGES.map((img, i) => (
              <a href="#" key={i} onClick={(e) => { e.preventDefault(); toast(t('content.channels.instagram.note')) }}><Img src={img} alt={t('common.instagramPostAlt')} /></a>
            ))}
          </div>
          <div className="insta-foot">
            <button className="follow-btn" onClick={() => toast(t('common.followingToast'))}>📷 {t('common.followNow')}</button>
            <span className="handle">@illuminati.brotherhood</span>
          </div>
        </div>
      </section>
    </>
  )
}
