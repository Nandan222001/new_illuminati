import { useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getRevenueSeries, getTransactions, formatINR } from '../../admin/adminStore'

const CHART_W = 640
const CHART_H = 220
const PAD_L = 8
const PAD_B = 26
const BAR_GAP = 10

export default function AdminRevenue() {
  const { users } = useAuth()
  const [hover, setHover] = useState(null)
  const series = useMemo(() => getRevenueSeries(6), [])
  const transactions = useMemo(() => getTransactions(users, 10), [users])

  const total = series.reduce((s, m) => s + m.revenue, 0)
  const thisMonth = series[series.length - 1]
  const lastMonth = series[series.length - 2]
  const growth = lastMonth ? Math.round(((thisMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100) : 0
  const max = Math.max(...series.map((m) => m.revenue)) * 1.15

  const plotW = CHART_W - PAD_L
  const plotH = CHART_H - PAD_B
  const barW = (plotW - BAR_GAP * (series.length - 1)) / series.length

  return (
    <>
      <div className="admin-head">
        <h1>REVENUE</h1>
        <p>Demo figures — Razorpay is not connected. Configure it under <b>Settings</b> to go live.</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">TOTAL (6 MONTHS)</span>
          <b className="kpi-value">{formatINR(total)}</b>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">THIS MONTH</span>
          <b className="kpi-value">{formatINR(thisMonth.revenue)}</b>
          <span className={`kpi-delta${growth >= 0 ? ' up' : ' down'}`}>{growth >= 0 ? '▲' : '▼'} {Math.abs(growth)}%</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">ACTIVE SUBSCRIPTIONS</span>
          <b className="kpi-value">{thisMonth.subscriptions}</b>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">AVG. REVENUE / MONTH</span>
          <b className="kpi-value">{formatINR(Math.round(total / series.length))}</b>
        </div>
      </div>

      <section className="admin-card">
        <h3>MONTHLY REVENUE</h3>
        <div className="chart-wrap">
          <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="revenue-chart" role="img" aria-label="Monthly revenue, last 6 months">
            <line x1={PAD_L} y1={plotH} x2={CHART_W} y2={plotH} className="chart-axis" />
            {series.map((m, i) => {
              const h = Math.max(4, (m.revenue / max) * (plotH - 10))
              const x = PAD_L + i * (barW + BAR_GAP)
              const y = plotH - h
              const isLast = i === series.length - 1
              return (
                <g key={m.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover((v) => (v === i ? null : v))}>
                  <rect x={x} y={y} width={barW} height={h} rx={4} className={`chart-bar${isLast ? ' current' : ''}${hover === i ? ' hovered' : ''}`}>
                    <title>{`${m.label}: ${formatINR(m.revenue)} · ${m.subscriptions} subscriptions`}</title>
                  </rect>
                  {isLast && <text x={x + barW / 2} y={y - 8} textAnchor="middle" className="chart-value">{formatINR(m.revenue)}</text>}
                  <text x={x + barW / 2} y={plotH + 16} textAnchor="middle" className="chart-axis-label">{m.label}</text>
                </g>
              )
            })}
          </svg>
        </div>
      </section>

      <section className="admin-card">
        <h3>RECENT TRANSACTIONS</h3>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>PAYMENT ID</th><th>INITIATE</th><th>NOTE</th><th>DATE</th><th className="right">AMOUNT</th><th className="right">STATUS</th></tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td data-label="PAYMENT ID"><code>{t.id}</code></td>
                  <td data-label="INITIATE">{t.name}</td>
                  <td data-label="NOTE">{t.note}</td>
                  <td data-label="DATE">{t.date.toLocaleDateString()}</td>
                  <td data-label="AMOUNT" className="right">{formatINR(t.amount)}</td>
                  <td data-label="STATUS" className="right"><em className={`status-pill ${t.status}`}>{t.status.toUpperCase()}</em></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted">Demo data generated locally — no real payment gateway is connected.</p>
      </section>
    </>
  )
}
