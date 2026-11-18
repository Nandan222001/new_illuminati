import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { useAmbientSound } from '../hooks/useAmbientSound'
import BrandMark from './BrandMark'
import LanguageSwitcher from './LanguageSwitcher'
import { SOCIAL_ICONS } from './SocialIcons'

const SITE_LINKS = [
  { to: '/', label: 'nav.home' },
  { to: '/stories', label: 'editorial.stories' },
  { to: '/visuals', label: 'editorial.symbols' },
  { to: '/archives', label: 'nav.archives' },
  { to: '/new-order', label: 'nav.newOrder' },
  { to: '/videos', label: 'nav.videos' },
  { to: '/about', label: 'nav.about' },
]
const InstagramIcon = SOCIAL_ICONS.instagram

function SoundIcon({ muted }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10v4h3l5 4V6l-5 4H4Z" />
      {muted
        ? <path d="m16 9 5 6m0-6-5 6" />
        : <><path d="M16 9.5a4 4 0 0 1 0 5" /><path d="M18.5 7a7.5 7.5 0 0 1 0 10" /></>}
    </svg>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuButton = useRef(null)
  const { on: soundOn, toggle: toggleSound } = useAmbientSound()
  const { user, isAdmin, logout } = useAuth()
  const { social } = useSiteSettings()
  const toast = useToast()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { t } = useTranslation()

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return undefined
    const onEscape = (event) => {
      if (event.key !== 'Escape') return
      setMobileOpen(false)
      menuButton.current?.focus()
    }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [mobileOpen])

  const handleLogout = () => {
    logout()
    setMobileOpen(false)
    toast(t('nav.leftCircleToast'))
    navigate('/')
  }

  const accountLink = <Link className="nav-account-link" to={user ? '/profile' : '/login'}>{t(user ? 'nav.myProfile' : 'editorial.signIn')}</Link>

  return (
    <nav className="nav site-nav" aria-label={t('editorial.primaryNavigation')}>
      <Link className="brand" to="/" onClick={() => setMobileOpen(false)}>
        <BrandMark className="brand-mark" />
        <span className="brand-name">ILLUMINATI<small>BROTHERHOOD</small></span>
      </Link>

      <button ref={menuButton} type="button" className="hamburger" aria-label={t('nav.toggleMenu')} aria-controls="primary-nav-links" aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          {mobileOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      <div id="primary-nav-links" className={`nav-links${mobileOpen ? ' mobile-open' : ''}`}>
        {SITE_LINKS.map(({ to, label }) => (
          <NavLink key={to} to={to} end={to === '/'} onClick={() => setMobileOpen(false)}>{t(label)}</NavLink>
        ))}
        {social.instagram && (
          <a href={social.instagram} target="_blank" rel="noopener noreferrer me" className="nav-instagram" aria-label={t('social.instagram')} onClick={() => setMobileOpen(false)}>
            <InstagramIcon width={16} height={16} /><span>{t('social.instagram')}</span>
          </a>
        )}
        <div className="nav-mobile-auth">
          {accountLink}
          {isAdmin && <Link to="/admin">{t('nav.adminPanel')}</Link>}
          {user && <button type="button" onClick={handleLogout}>{t('nav.logout')}</button>}
        </div>
      </div>

      <div className="nav-right">
        <button type="button" className="icon-btn" title={t('nav.ambientSound')} aria-label={t('nav.toggleAmbientSound')} aria-pressed={soundOn} onClick={toggleSound}>
          <SoundIcon muted={!soundOn} />
        </button>
        <LanguageSwitcher />
        <div className="nav-desktop-auth">
          {accountLink}
          {user && <button type="button" onClick={handleLogout}>{t('nav.logout')}</button>}
        </div>
      </div>
    </nav>
  )
}
