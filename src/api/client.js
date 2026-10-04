/**
 * Thin fetch wrapper for the FastAPI backend. Attaches the JWT bearer token
 * (when present) and normalizes error messages so callers can just read
 * `err.message`.
 */

export const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1'
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

/**
 * Multipart upload with progress (the Keeper's e-book PDFs). fetch() cannot
 * report upload progress, so this uses XHR; the bearer token is attached the
 * same way apiFetch does it.
 */
export function apiUpload(path, file, { fieldName = 'file', onProgress, timeoutMs = 0 } = {}) {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    // The filename is sent explicitly: the server checks the extension, and a
    // Blob that isn't a File would otherwise arrive as "blob" with no suffix.
    form.append(fieldName, file, file?.name || 'volume.pdf')

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_BASE}${path}`)
    const token = getToken()
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    if (typeof onProgress === 'function') {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)))
      }
    }

    let timer = null
    if (timeoutMs > 0) timer = setTimeout(() => xhr.abort(), timeoutMs)

    const done = () => { if (timer) clearTimeout(timer) }

    xhr.onload = () => {
      done()
      let data = null
      try { data = JSON.parse(xhr.responseText) } catch { data = null }
      if (xhr.status >= 200 && xhr.status < 300) {
        if (typeof onProgress === 'function') onProgress(100)
        resolve(data)
        return
      }
      if (xhr.status === 401) setToken(null)
      reject(new Error(extractMessage(data, 'The upload failed. Please try again.')))
    }
    xhr.onerror = () => { done(); reject(new Error('Could not reach the server. Check your connection and try again.')) }
    xhr.onabort = () => { done(); reject(new Error('The upload was interrupted. Please try again.')) }
    xhr.ontimeout = () => { done(); reject(new Error('The upload took too long. Please try again.')) }

    xhr.send(form)
  })
}

/**
 * Fetches a protected file (an e-book volume) as a Blob, so the member's bearer
 * token never appears in a URL. Anything non-2xx becomes a normal Error whose
 * message is the API's `detail` — e.g. "This volume is sealed…".
 */
export async function apiFetchBlob(path, { timeoutMs = 60000 } = {}) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    let res
    try {
      res = await fetch(`${API_BASE}${path}`, { headers, signal: controller.signal })
    } catch (err) {
      throw new Error(err?.name === 'AbortError' ? 'The server took too long to respond. Please try again.' : 'Could not reach the server. Check your connection and try again.')
    }
    if (res.status === 401) setToken(null)
    if (!res.ok) {
      let message = ''
      try {
        message = extractMessage(await res.json(), '')
      } catch { message = '' }
      const fallback = res.status === 402
        ? 'This volume is sealed. Complete your initiation to read it.'
        : res.status === 403
          ? 'You do not have access to this volume.'
          : 'The volume could not be opened. Please try again.'
      throw new Error(message || fallback)
    }
    return res.blob()
  } finally {
    clearTimeout(timer)
  }
}
