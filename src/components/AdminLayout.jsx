import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import BrandMark from './BrandMark'
import BrandFlame from './BrandFlame'
import ScrollToTop from './ScrollToTop'

const LINKS = [
  { to: '/admin', end: true, icon: '◆', label: 'Dashboard' },
  { to: '/admin/revenue', icon: '₹', label: 'Revenue' },
  { to: '/admin/members', icon: '◈', label: 'Members' },
  { to: '/admin/videos', icon: '▶', label: 'Videos' },
  { to: '/admin/images', icon: '▣', label: 'Images' },
  { to: '/admin/rituals', icon: '✦', label: 'Rituals' },
  { to: '/admin/settings', icon: '⚙', label: 'Settings' },
]

function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?'
}

/**
 * Standalone admin app shell. Deliberately does NOT render the public
 * site's Navbar/Footer (Layout) — the Keeper console is its own app with
 * its own top bar, sidebar and no marketing chrome. Regular members keep
 * the ordinary site header on their own dashboard (/profile).
 */
export default function AdminLayout() {
  const { user, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast('You have left the circle. Until next time.')
    navigate('/')
  }

  return (
    <div className="admin-app">
      <ScrollToTop />
      <header className="admin-topbar">
        <Link to="/admin" className="admin-brand">
          <BrandFlame />
          <BrandMark className="brand-mark" />
          <span className="brand-name">ILLUMINATI<small>KEEPER CONSOLE</small></span>
        </Link>
        <div className="admin-topbar-actions">
          <Link to="/" className="btn-ghost small">VIEW SITE</Link>
          <button type="button" className="btn-ghost small" onClick={handleLogout}>LOGOUT</button>
        </div>
      </header>
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-side-head">
            <span className="avatar admin">{initials(user.name)}</span>
            <div>
              <b>{user.name}</b>
              <small>KEEPER</small>
            </div>
          </div>
          <nav className="admin-nav" aria-label="Admin">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
                <span className="admin-nav-icon" aria-hidden="true">{l.icon}</span>
                {l.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="admin-main">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
