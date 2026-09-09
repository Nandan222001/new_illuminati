import { Link } from 'react-router-dom'
import { NAV_LINKS } from '../data/content'
import { useAuth } from '../context/AuthContext'
import BrandMark from './BrandMark'

export default function Footer() {
  const { user, isAdmin } = useAuth()
  return (
    <footer>
      <div className="foot-top">
        <div className="foot-col foot-about">
          <div className="foot-brand">
            <BrandMark className="brand-mark" style={{ width: 40, height: 40 }} />
            <span className="brand-name">ILLUMINATI<small>BROTHERHOOD</small></span>
          </div>
          <p className="foot-desc">An immersive fictional exploration of secret-society mythology, conspiracy culture and historical mysteries.</p>
          <div className="social-row">
            <a href="#" title="Instagram" onClick={(e) => e.preventDefault()}>📷</a>
            <a href="#" title="Discord" onClick={(e) => e.preventDefault()}>🎮</a>
            <a href="#" title="Telegram" onClick={(e) => e.preventDefault()}>✈</a>
            <a href="#" title="YouTube" onClick={(e) => e.preventDefault()}>▶</a>
            <a href="#" title="X" onClick={(e) => e.preventDefault()}>𝕏</a>
          </div>
        </div>
        <div className="foot-col">
          <h6>EXPLORE</h6>
          {NAV_LINKS.map((l) => <Link key={l.to} to={l.to}>{l.label}</Link>)}
        </div>
        <div className="foot-col">
          <h6>ACCOUNT</h6>
          {user ? (
            <>
              <Link to="/profile">MY PROFILE</Link>
              {isAdmin && <Link to="/admin">ADMIN PANEL</Link>}
            </>
          ) : (
            <>
              <Link to="/login">LOGIN</Link>
              <Link to="/register">REGISTER</Link>
            </>
          )}
          <Link to="/about#faq">FAQ</Link>
          <Link to="/about#disclaimer">CONTENT DISCLAIMER</Link>
        </div>
        <div className="foot-col">
          <h6>LEGAL</h6>
          <a href="#" onClick={(e) => e.preventDefault()}>PRIVACY</a>
          <a href="#" onClick={(e) => e.preventDefault()}>TERMS</a>
          <a href="#" onClick={(e) => e.preventDefault()}>COMMUNITY GUIDELINES</a>
          <a href="#" onClick={(e) => e.preventDefault()}>CONTACT</a>
        </div>
      </div>
      <div className="foot-copy">© 2026 Illuminati Brotherhood. All rights reserved. A fictional entertainment experience.</div>
    </footer>
  )
}
