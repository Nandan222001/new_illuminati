/**
 * Thin fetch wrapper for the FastAPI backend. Attaches the JWT bearer token
 * (when present) and normalizes error messages so callers can just read
 * `err.message`.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1'
const TOKEN_KEY = 'ib_token_v1'

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

export async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.')
  }

  if (res.status === 204) return null

  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok) {
    if (res.status === 401) setToken(null)
    throw new Error(extractMessage(data, 'Something went wrong. Please try again.'))
  }

  return data
}
