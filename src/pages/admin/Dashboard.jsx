import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROLES } from '../../auth/authService'
import { useAuth } from '../../context/AuthContext'
import { useContent } from '../../context/ContentContext'
import { fetchRevenueSeries, formatINR } from '../../admin/adminStore'

const QUICK_LINKS = [
  { to: '/admin/videos', icon: '▶', label: 'Upload a video' },
  { to: '/admin/archives', icon: '▤', label: 'Publish an archive record' },
  { to: '/admin/books', icon: '❧', label: 'Shelve an e-book' },
  { to: '/admin/rituals', icon: '✦', label: 'Add a ritual + film' },
  { to: '/admin/images', icon: '▣', label: 'Add an image' },
  { to: '/admin/messages', icon: '✉', label: 'Read the council inbox' },
  { to: '/admin/settings', icon: '⚙', label: 'Social links & providers' },
]

const EMPTY_SERIES = Array.from({ length: 6 }, () => ({ label: '—', subscriptions: 0, revenue: 0 }))

export default function AdminDashboard() {
  const { user, users } = useAuth()
  const { videos, rituals, gallery, books, archives } = useContent()
  const [series, setSeries] = useState(EMPTY_SERIES)

  useEffect(() => {
    // Guard against a partial response: the KPI row must never break the page.
    fetchRevenueSeries(6)
      .then((data) => { if (Array.isArray(data) && data.length) setSeries(data) })
      .catch(() => {})
  }, [])

  const admins = users.filter((u) => u.role === ROLES.ADMIN).length
  const members = users.length - admins
  const paidCount = [...videos, ...rituals, ...gallery, ...books, ...archives].filter((i) => i.category === 'paid').length
  const thisMonth = series[series.length - 1] || { revenue: 0, subscriptions: 0 }
  const lastMonth = series[series.length - 2] || { revenue: 0 }
  const growth = lastMonth && lastMonth.revenue ? Math.round(((thisMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100) : 0

  return (
    <>
      <div className="admin-head">
        <h1>DASHBOARD</h1>
        <p>Welcome back, {user.name.split(' ')[0]}. Here is the state of the Brotherhood.</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">REVENUE THIS MONTH</span>
          <b className="kpi-value">{formatINR(thisMonth.revenue)}</b>
          <span className={`kpi-delta${growth >= 0 ? ' up' : ' down'}`}>{growth >= 0 ? '▲' : '▼'} {Math.abs(growth)}% vs last month</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">TOTAL ACCOUNTS</span>
          <b className="kpi-value">{users.length}</b>
          <span className="kpi-delta">{admins} keepers · {members} initiates</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">VIDEOS</span>
          <b className="kpi-value">{videos.length}</b>
          <span className="kpi-delta">{videos.filter((v) => v.category === 'paid').length} sealed (paid)</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">PAID ITEMS TOTAL</span>
          <b className="kpi-value">{paidCount}</b>
          <span className="kpi-delta">across videos, rituals &amp; visuals</span>
        </div>
      </div>

      <div className="admin-columns">
        <section className="admin-card">
          <h3>QUICK ACTIONS</h3>
          <div className="quick-grid">
            {QUICK_LINKS.map((q) => (
              <Link key={q.to} to={q.to} className="quick-tile">
                <span aria-hidden="true">{q.icon}</span>{q.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="admin-card">
          <h3>CONTENT OVERVIEW</h3>
          <ul className="mini-list">
            <li><span>Videos</span><b>{videos.length}</b></li>
            <li><span>Rituals</span><b>{rituals.length}</b></li>
            <li><span>Gallery images</span><b>{gallery.length}</b></li>
            <li><span>Archive records</span><b>{archives.length}</b></li>
            <li><span>E-books</span><b>{books.length}</b></li>
            <li><span>Sealed / paid content</span><b>{paidCount}</b></li>
          </ul>
          <p className="muted">Toggle any item between FREE and PAID from its own section.</p>
        </section>
      </div>
    </>
  )
}
