/**
 * The one-book sale page (/book) — client side.
 *
 * One card, one volume, one price, all of it set by the Keeper from
 * **Admin → Book Sale**. The page is public, so nothing here sends a bearer
 * token: the entitlement to download a bought volume is the signed link the
 * server returns after Checkout's signature verifies.
 */
import { API_BASE, apiFetch } from './client'

/** The card's contents (cover, title, blurb, price) — 404 when nothing is on sale. */
export const fetchStoreBook = () => apiFetch('/store/book', { auth: false })

/** Raise a Razorpay order for the listed price. */
export const createStoreOrder = (details = {}) =>
  apiFetch('/store/order', { method: 'POST', auth: false, body: { email: details.email || null, name: details.name || null } })

/** Verify Checkout's signature; resolves with the signed download link. */
export const verifyStorePayment = (body) =>
  apiFetch('/store/verify', { method: 'POST', auth: false, body })

/** Absolute URL of a bought volume (the token is the entitlement). */
export const storeDownloadUrl = (tokenOrPath) => {
  const value = String(tokenOrPath || '')
  if (value.startsWith('http')) return value
  // The server already returns a rooted path ("/api/v1/store/download?t=…"):
  // prefixing API_BASE again would double it to /api/v1/api/v1/….
  if (value.startsWith('/api/')) {
    const origin = /^https?:\/\//.test(API_BASE) ? new URL(API_BASE).origin : ''
    return `${origin}${value}`
  }
  return `${API_BASE}${value}`
}

/* --------------------------- Keeper console --------------------------- */

export const fetchStoreListing = () => apiFetch('/store/listing')

export const saveStoreListing = (body) => apiFetch('/store/listing', { method: 'PUT', body })
