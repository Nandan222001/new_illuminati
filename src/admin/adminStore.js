/**
 * Admin integration settings + revenue (demo).
 *
 * This site is a static Vite/React app with no backend, so there is nothing
 * real to connect to. These forms exist to show what a Keeper console would
 * look like wired to Razorpay, SMTP and Twilio — values are saved to
 * localStorage only, never transmitted anywhere, and no live API call is
 * ever made. Swap this file for real API calls when a backend exists.
 */

const SETTINGS_KEY = 'ib_admin_settings_v1'

export const DEFAULT_SETTINGS = {
  razorpay: { enabled: false, mode: 'test', keyId: '', keySecret: '' },
  smtp: { enabled: false, host: '', port: '587', secure: true, username: '', password: '', fromName: 'Illuminati Brotherhood', fromEmail: '' },
  twilio: { enabled: false, accountSid: '', authToken: '', fromNumber: '' },
}

export function readSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw)
    return {
      razorpay: { ...DEFAULT_SETTINGS.razorpay, ...parsed.razorpay },
      smtp: { ...DEFAULT_SETTINGS.smtp, ...parsed.smtp },
      twilio: { ...DEFAULT_SETTINGS.twilio, ...parsed.twilio },
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function writeSettings(next) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
}

export const SETTINGS_KEY_NAME = SETTINGS_KEY

/** Small deterministic PRNG so the demo numbers are stable across reloads. */
function seeded(seed) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const PLAN_PRICE = 499 // ₹ per initiate, fictional

/** Generates a stable 6-month revenue series ending this month (demo data). */
export function getRevenueSeries(months = 6) {
  const rand = seeded(42)
  const out = []
  const now = new Date()
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const base = 38 + Math.round(rand() * 40)
    const subs = base + i * 2
    out.push({
      label: d.toLocaleDateString(undefined, { month: 'short' }),
      subscriptions: subs,
      revenue: subs * PLAN_PRICE,
    })
  }
  return out
}

const NOTES = ['Initiate subscription', 'Sealed content unlock', 'Annual passphrase renewal', 'Merch: emblem pin (demo)']
const STATUSES = ['captured', 'captured', 'captured', 'refunded', 'pending']

/** Generates a stable list of demo Razorpay-style transactions. */
export function getTransactions(users, count = 10) {
  const rand = seeded(7)
  const names = users.length ? users.map((u) => u.name) : ['Demo Initiate']
  const out = []
  for (let i = 0; i < count; i += 1) {
    const daysAgo = Math.floor(rand() * 45)
    const d = new Date(Date.now() - daysAgo * 864e5)
    out.push({
      id: `pay_demo_${(1000 + i).toString(36)}`,
      name: names[Math.floor(rand() * names.length)],
      amount: PLAN_PRICE * (rand() > 0.85 ? 12 : 1),
      note: NOTES[Math.floor(rand() * NOTES.length)],
      status: STATUSES[Math.floor(rand() * STATUSES.length)],
      date: d,
    })
  }
  return out.sort((a, b) => b.date - a.date)
}

export function formatINR(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`
}
