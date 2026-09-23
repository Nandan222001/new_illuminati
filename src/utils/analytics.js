import { apiFetch } from '../api/client'

/**
 * Product analytics beacon.
 *
 * Every event is (a) appended to a small local ring buffer so the admin
 * dashboard works in static/local mode, and (b) fired at the backend
 * `POST /api/v1/analytics/track` when one is reachable (fire-and-forget).
 * The dashboard reads `GET /api/v1/analytics/summary` and falls back to the
 * local buffer, clearly badged as device-local.
 */

const DEVICE_KEY = 'ib_device_id'
const BUF_KEY = 'ib_analytics_buffer_v1'
const BUF_MAX = 500

export function deviceId() {
  let id = localStorage.getItem(DEVICE_KEY)
  if (!id) {
    id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
    localStorage.setItem(DEVICE_KEY, id)
  }
  return id
}

function pushLocal(kind, extra) {
  try {
    const buf = JSON.parse(localStorage.getItem(BUF_KEY) || '[]')
    buf.push({ kind, t: Date.now(), device: deviceId(), ...extra })
    localStorage.setItem(BUF_KEY, JSON.stringify(buf.slice(-BUF_MAX)))
  } catch { /* storage full/blocked — analytics must never break the site */ }
}

export function track(kind, extra = {}) {
  pushLocal(kind, extra)
  apiFetch('/analytics/track', {
    method: 'POST',
    auth: false,
    timeoutMs: 2500,
    body: { kind, device_id: deviceId(), ...extra },
  }).catch(() => {})
}

/** One visit per session per path. */
export function trackVisit(path) {
  try {
    const k = `ib_visited_${path}`
    if (sessionStorage.getItem(k)) return
    sessionStorage.setItem(k, '1')
  } catch { /* private mode */ }
  track('visit', { path })
}

export const trackPayment = (status, reason) => track(status === 'success' ? 'payment_success' : 'payment_failed', { reason })

const DAY = 86400000

function dayLabels(n = 7) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.now() - (n - 1 - i) * DAY)
    return { key: d.toDateString(), label: d.toLocaleDateString('en', { weekday: 'short' }) }
  })
}

/** Aggregates the local ring buffer (static / offline mode). */
export function localSummary() {
  let buf = []
  try { buf = JSON.parse(localStorage.getItem(BUF_KEY) || '[]') } catch { /* ignore */ }
  const weekAgo = Date.now() - 7 * DAY
  const days = dayLabels().map((d) => ({
    label: d.label,
    visits: buf.filter((e) => e.kind === 'visit' && new Date(e.t).toDateString() === d.key).length,
  }))
  const recent = buf.filter((e) => e.kind === 'visit' && e.t >= weekAgo)
  const failed = buf.filter((e) => e.kind === 'payment_failed')
  const success = buf.filter((e) => e.kind === 'payment_success')
  return {
    visits_total: buf.filter((e) => e.kind === 'visit').length,
    visits_7d: recent.length,
    unique_7d: new Set(recent.map((e) => e.device)).size || (recent.length ? 1 : 0),
    payment_success: success.length,
    payment_failed: failed.length,
    days,
    recent_failed: failed.slice(-5).reverse().map((e) => ({
      at: new Date(e.t).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      reason: e.reason || 'unknown',
    })),
  }
}

export async function fetchSummary() {
  try {
    const s = await apiFetch('/analytics/summary', { timeoutMs: 3000 })
    return { ...s, mode: 'live' }
  } catch {
    return { ...localSummary(), mode: 'local' }
  }
}
