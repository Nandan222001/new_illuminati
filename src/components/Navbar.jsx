import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { NAV_LINKS } from '../data/content'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useAmbientSound } from '../hooks/useAmbientSound'
import BrandMark from './BrandMark'
import BrandFlame from './BrandFlame'
import LanguageSwitcher from './LanguageSwitcher'

function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?'
}

export default function Navbar({ onEnter }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { on: soundOn, toggle: toggleSound } = useAmbientSound()
  const menuRef = useRef(null)
  const { user, isAdmin, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  // Close menus on route change.
  useEffect(() => { setMobileOpen(false); setMenuOpen(false) }, [location.pathname])

  // Close the account menu when clicking outside.
  useEffect(() => {
    if (!menuOpen) return undefined
    const onDown = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
    }
  }, [menuOpen])

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.classList.toggle('nav-locked', mobileOpen)
    return () => document.body.classList.remove('nav-locked')
  }, [mobileOpen])

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    toast(t('nav.leftCircleToast'))
    navigate('/')
  }

  return (
    <nav className="nav" aria-label="Primary">
      <Link className="brand" to="/">
        <BrandFlame />
        <BrandMark className="brand-mark" />
        <span className="brand-name">ILLUMINATI<small>BROTHERHOOD</small></span>
      </Link>

      <div className={`nav-links${mobileOpen ? ' mobile-open' : ''}`}>
        {NAV_LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setMobileOpen(false)}>
            {t(`nav.${link.key}`)}
          </NavLink>
        ))}
        <div className="nav-mobile-auth">
          {user ? (
            <>
              <NavLink to="/profile">{t('nav.myProfile')}</NavLink>
              {isAdmin && <NavLink to="/admin">{t('nav.admin')}</NavLink>}
              <button type="button" onClick={handleLogout}>{t('nav.logout')}</button>
            </>
          ) : (
            <>
              <NavLink to="/login">{t('nav.login')}</NavLink>
              <NavLink to="/register">{t('nav.register')}</NavLink>
            </>
          )}
        </div>
      </div>

      <div className="nav-right">
        <button className="icon-btn" title={t('nav.ambientSound')} aria-label={t('nav.toggleAmbientSound')} aria-pressed={soundOn} onClick={toggleSound}>
          {soundOn ? '🔊' : '🔈'}
        </button>
        <LanguageSwitcher />
        <button className="icon-btn" title={t('nav.search')} aria-label={t('nav.search')} onClick={() => toast(t('nav.searchToast'))}>⌕</button>

        {user ? (
          <div className="account" ref={menuRef}>
            <button
              type="button"
              className={`avatar-btn${isAdmin ? ' admin' : ''}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              title={user.name}
            >
              <span className="avatar">{initials(user.name)}</span>
              <span className="avatar-name">{user.name.split(' ')[0]}</span>
              <span className="chev">▾</span>
            </button>
            {menuOpen && (
              <div className="account-menu" role="menu">
                <div className="account-head">
                  <b>{user.name}</b>
                  <span>{user.email}</span>
                  <em className={`role-pill ${user.role}`}>{isAdmin ? t('nav.keeperAdmin') : t('nav.initiateNumber', { number: String(user.initiate || 0).padStart(3, '0') })}</em>
                </div>
                <Link to="/profile" role="menuitem">◈ {t('nav.myProfile')}</Link>
                {isAdmin && <Link to="/admin" role="menuitem">▲ {t('nav.adminPanel')}</Link>}
                <button type="button" role="menuitem" onClick={handleLogout}>⏻ {t('nav.logout')}</button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="btn-login">{t('nav.login')}</Link>
            <Link to="/register" className="btn-enter">{t('nav.join')} △</Link>
          </div>
        )}

        {user && <button className="btn-enter enter-cta" onClick={onEnter}>{t('nav.enter')} △</button>}

        <button className="hamburger" aria-label={t('nav.toggleMenu')} aria-expanded={mobileOpen} onClick={() => setMobileOpen((v) => !v)}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {mobileOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
    </nav>
  )
}
