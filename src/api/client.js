/**
 * Thin fetch wrapper for the FastAPI backend. Attaches the JWT bearer token
 * (when present) and normalizes error messages so callers can just read
 * `err.message`.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1'
const TOKEN_KEY = 'ib_token_v1'
const DEFAULT_TIMEOUT_MS = 10000

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export const TOKEN_STORAGE_KEY = TOKEN_KEY

function extractMessage(body, fallback) {
  if (!body) return fallback
  const { detail } = body
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length) {
    return detail.map((d) => d.msg).filter(Boolean).join(' ') || fallback
  }
  return fallback
}

export async function apiFetch(path, { method = 'GET', body, auth = true, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  // A hung backend must never leave the UI waiting forever: abort after timeoutMs.
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    let res
    try {
      res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })
    } catch (err) {
      throw new Error(err?.name === 'AbortError' ? 'The server took too long to respond. Please try again.' : 'Could not reach the server. Check your connection and try again.')
    }

    if (res.status === 204) return null

    let data = null
    let isJson = true
    try {
      data = await res.json()
    } catch (err) {
      if (err?.name === 'AbortError') throw new Error('The server took too long to respond. Please try again.')
      data = null
      isJson = false
    }

    // A 2xx that isn't JSON never reached the API (e.g. a host rewriting /api/* to index.html).
    if (res.ok && !isJson) throw new Error('Could not reach the server. Check your connection and try again.')

    if (!res.ok) {
      if (res.status === 401) setToken(null)
      throw new Error(extractMessage(data, 'Something went wrong. Please try again.'))
    }

    return data
  } finally {
    clearTimeout(timer)
  }
}
