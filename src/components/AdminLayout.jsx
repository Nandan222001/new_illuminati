import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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

export default function AdminLayout() {
  const { user } = useAuth()

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-side-head">
          <span className="avatar admin">{initials(user.name)}</span>
          <div>
            <b>{user.name}</b>
            <small>KEEPER CONSOLE</small>
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
        <NavLink to="/" className="admin-exit">← EXIT TO SITE</NavLink>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  )
}
