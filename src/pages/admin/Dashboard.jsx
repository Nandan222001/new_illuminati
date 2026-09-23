import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROLES } from '../../auth/authService'
import { useAuth } from '../../context/AuthContext'
import { useContent } from '../../context/ContentContext'
import { fetchRevenueSeries, formatINR } from '../../admin/adminStore'
import { fetchSummary } from '../../utils/analytics'

const QUICK_LINKS = [
  { to: '/admin/videos', icon: '▶', label: 'Upload a video' },
  { to: '/admin/images', icon: '▣', label: 'Add an image' },
  { to: '/admin/rituals', icon: '✦', label: 'Add a ritual' },
  { to: '/admin/settings', icon: '⚙', label: 'Configure payments' },
]

const EMPTY_SERIES = Array.from({ length: 6 }, () => ({ label: '—', subscriptions: 0, revenue: 0 }))

export default function AdminDashboard() {
  const { user, users } = useAuth()
  const { videos, rituals, gallery } = useContent()
  const [series, setSeries] = useState(EMPTY_SERIES)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchRevenueSeries(6).then(setSeries).catch(() => {})
    fetchSummary().then(setStats).catch(() => {})
  }, [])

  const attempts = (stats?.payment_success || 0) + (stats?.payment_failed || 0)
  const failRate = attempts ? Math.round(((stats?.payment_failed || 0) / attempts) * 100) : 0
  const maxDay = stats ? Math.max(...stats.days.map((d) => d.visits), 1) : 1

  const admins = users.filter((u) => u.role === ROLES.ADMIN).length
  const members = users.length - admins
  const paidCount = [...videos, ...rituals, ...gallery].filter((i) => i.category === 'paid').length
  const thisMonth = series[series.length - 1]
  const lastMonth = series[series.length - 2]
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

      <div className="admin-subhead">
        <h2>TRAFFIC &amp; PAYMENTS</h2>
        {stats && (
          <span className={`mode-badge ${stats.mode === 'live' ? 'live' : 'local'}`}>
            {stats.mode === 'live' ? 'LIVE API' : 'THIS DEVICE · LOCAL MODE'}
          </span>
        )}
      </div>
      {stats && (
        <>
          <div className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-label">VISITS · 7 DAYS</span>
              <b className="kpi-value">{stats.visits_7d}</b>
              <span className="kpi-delta">{stats.visits_total} all-time</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">UNIQUE VISITORS · 7D</span>
              <b className="kpi-value">{stats.unique_7d}</b>
              <span className="kpi-delta">distinct devices</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">PAYMENT ATTEMPTS · 7D</span>
              <b className="kpi-value">{attempts}</b>
              <span className="kpi-delta">{stats.payment_success} sealed</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">FAILED PAYMENTS · 7D</span>
              <b className="kpi-value">{stats.payment_failed}</b>
              <span className="kpi-delta">{failRate}% failure rate</span>
            </div>
          </div>
          <div className="admin-duo">
            <div className="kpi-card">
              <span className="kpi-label">VISITS · LAST 7 DAYS</span>
              <div className="bars">
                {stats.days.map((d, i) => (
                  <div className="bar-col" key={i}>
                    <div className="bar" style={{ height: `${Math.max(4, Math.round((d.visits / maxDay) * 100))}%` }} title={`${d.visits}`} />
                    <span>{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">RECENT FAILED PAYMENTS</span>
              {stats.recent_failed.length === 0 ? (
                <p className="kpi-empty">No failed payments recorded.</p>
              ) : (
                <ul className="fail-list">
                  {stats.recent_failed.map((f, i) => (
                    <li key={i}><b>{f.at}</b><span>{f.reason}</span></li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}

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
            <li><span>Sealed / paid content</span><b>{paidCount}</b></li>
          </ul>
          <p className="muted">Toggle any item between FREE and PAID from its own section.</p>
        </section>
      </div>
    </>
  )
}
