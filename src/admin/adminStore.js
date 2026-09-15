/**
 * Admin integration settings + revenue — backed by the FastAPI backend's
 * /admin endpoints. Razorpay/SMTP/Twilio values are stored for display only;
 * no live call to any of those providers is ever made (same as before).
 */
import { apiFetch } from '../api/client'

export const DEFAULT_SETTINGS = {
  razorpay: { enabled: false, mode: 'test', keyId: '', keySecret: '' },
  smtp: { enabled: false, host: '', port: '587', secure: true, username: '', password: '', fromName: 'Illuminati Brotherhood', fromEmail: '' },
  twilio: { enabled: false, accountSid: '', authToken: '', fromNumber: '' },
}

export async function fetchSettings() {
  const data = await apiFetch('/admin/settings')
  return {
    razorpay: { ...DEFAULT_SETTINGS.razorpay, ...data.razorpay },
    smtp: { ...DEFAULT_SETTINGS.smtp, ...data.smtp },
    twilio: { ...DEFAULT_SETTINGS.twilio, ...data.twilio },
  }
}

export async function saveSettings(settings) {
  await apiFetch('/admin/settings', { method: 'PUT', body: settings })
}

export async function fetchRevenueSeries(months = 6) {
  return apiFetch(`/admin/revenue?months=${months}`)
}

export async function fetchTransactions(limit = 10) {
  const data = await apiFetch(`/admin/transactions?limit=${limit}`)
  return data.map((t) => ({ ...t, date: new Date(t.date) }))
}

export function formatINR(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`
}
