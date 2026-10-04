/**
 * The sealed e-book library — client side.
 *
 * A volume uploaded from the Keeper console is stored on the API server and
 * identified by an opaque `file_key`. It is never a public URL: members open it
 * through `/library/files/{key}`, which the backend only answers for a
 * signed-in account whose initiation fee is paid. So this module fetches the
 * bytes with the bearer token and hands the browser a short-lived Blob URL —
 * good for both reading inline and downloading.
 */
import { apiFetch, apiFetchBlob, apiUpload } from './client'

/** Default limits, refreshed from GET /library/limits when the console loads. */
export const EBOOK_LIMITS = { maxSizeMb: 100, accepted: ['.pdf', '.epub'], label: 'PDF or EPUB' }

export const ACCEPTED_EBOOK_ATTR = '.pdf,.epub,application/pdf,application/epub+zip'

export async function fetchLibraryLimits() {
  try {
    const data = await apiFetch('/library/limits', { auth: false })
    const accepted = Array.isArray(data?.accepted) && data.accepted.length ? data.accepted : EBOOK_LIMITS.accepted
    return {
      maxSizeMb: Number(data?.max_size_mb) || EBOOK_LIMITS.maxSizeMb,
      maxSizeBytes: Number(data?.max_size_bytes) || EBOOK_LIMITS.maxSizeMb * 1024 * 1024,
      accepted,
      label: data?.label || EBOOK_LIMITS.label,
    }
  } catch {
    return { ...EBOOK_LIMITS, maxSizeBytes: EBOOK_LIMITS.maxSizeMb * 1024 * 1024 }
  }
}

/**
 * A book field, read from the flattened catalogue shape (ContentContext spreads
 * `extra` onto the row) or from a raw API row, where it sits under `extra`.
 */
function field(book, name) {
  if (!book) return undefined
  if (book[name] !== undefined) return book[name]
  return book.extra ? book.extra[name] : undefined
}

/** True when this catalogue row is served from a stored upload (not an external link). */
export function isStoredEbook(book) {
  if (!book) return false
  if (field(book, 'file_key')) return true
  const file = field(book, 'file')
  return typeof file === 'string' && file.includes('/library/files/')
}

/** The storage key for a stored volume, or '' for linked/free-standing files. */
export function ebookKey(book) {
  const key = field(book, 'file_key')
  if (key) return String(key)
  const file = field(book, 'file')
  const match = /\/library\/files\/([^/?#]+)/.exec(typeof file === 'string' ? file : '')
  return match ? decodeURIComponent(match[1]) : ''
}

export function formatBytes(bytes) {
  const value = Number(bytes) || 0
  if (!value) return ''
  if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`
  return `${Math.max(1, Math.round(value / 1024))} KB`
}

/** Client-side gate before a byte is sent; the server re-checks all of it. */
export function validateEbookFile(file, limits = EBOOK_LIMITS) {
  if (!file) return 'Choose a PDF file to upload.'
  const name = (file.name || '').toLowerCase()
  const accepted = limits.accepted?.length ? limits.accepted : EBOOK_LIMITS.accepted
  const okType = accepted.some((ext) => name.endsWith(ext)) || (file.type === 'application/pdf' && accepted.includes('.pdf'))
  if (!okType) return `Only ${limits.label || 'PDF'} volumes are accepted.`
  if (limits.maxSizeBytes && file.size > limits.maxSizeBytes) {
    return `That volume is ${formatBytes(file.size)} — the limit is ${limits.maxSizeMb} MB.`
  }
  return ''
}

/** Keeper: write a volume to the shelf, reporting progress as it uploads. */
export function uploadEbook(file, { onProgress } = {}) {
  return apiUpload('/library/ebooks', file, { onProgress })
}

/** Keeper: every volume on the shelf (with the book that serves it, if any). */
export function listStoredEbooks() {
  return apiFetch('/library/ebooks')
}

/** Keeper: remove an unattached volume from the shelf. */
export function deleteStoredEbook(key) {
  return apiFetch(`/library/ebooks/${encodeURIComponent(key)}`, { method: 'DELETE' })
}

/* ------------------------------- reading it ------------------------------- */

const objectUrls = new Set()

function rememberObjectUrl(blob) {
  const url = URL.createObjectURL(blob)
  objectUrls.add(url)
  // Long-lived enough for a full read, and revoked on unload either way.
  setTimeout(() => releaseObjectUrl(url), 30 * 60 * 1000)
  return url
}

export function releaseObjectUrl(url) {
  if (!url) return
  try { URL.revokeObjectURL(url) } catch { /* already gone */ }
  objectUrls.delete(url)
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => { objectUrls.forEach((url) => releaseObjectUrl(url)) })
}

/**
 * The API path that serves this volume. Book records are preferred — the id is
 * public while the storage key is withheld from anyone who hasn't paid, so a
 * member who seals their oath can open the volume without reloading the page.
 * A bare key (Keeper's upload shelf) falls back to the key route.
 */
export function ebookRequestPath(book, { inline = false } = {}) {
  const query = inline ? '?inline=1' : ''
  // `has_file` (no link) is how a sealed volume looks to a member before they
  // pay; `file_storage` tells us whether that hidden file lives on our server.
  const storedOnServer = isStoredEbook(book) || field(book, 'file_storage') === 'local' || (field(book, 'has_file') && !field(book, 'file'))
  const hasId = book?.id !== undefined && book?.id !== null && !String(book.id).startsWith('local-')
  if (storedOnServer && hasId) return `/library/books/${encodeURIComponent(book.id)}/file${query}`

  const key = ebookKey(book)
  if (!key) throw new Error('This volume has no stored file yet.')
  return `/library/files/${encodeURIComponent(key)}${query}`
}

/** Fetch a volume's bytes (bearer-authenticated) and return a Blob URL. */
export async function fetchEbookObjectUrl(book, { inline = false } = {}) {
  const blob = await apiFetchBlob(ebookRequestPath(book, { inline }))
  return rememberObjectUrl(blob)
}

/** Open the volume in a new tab (falls back to a download if the tab is blocked). */
export async function readEbook(book) {
  const tab = typeof window !== 'undefined' ? window.open('', '_blank') : null
  if (tab) {
    tab.document.write('<title>Opening the volume…</title><body style="background:#050203;color:#c9a24b;font-family:Georgia,serif;display:grid;place-items:center;height:100vh;margin:0">Opening the volume…</body>')
  }
  try {
    const url = await fetchEbookObjectUrl(book, { inline: true })
    if (tab && !tab.closed) tab.location.replace(url)
    else await downloadEbook(book)
    return url
  } catch (err) {
    try { tab?.close() } catch { /* ignore */ }
    throw err
  }
}

function saveUrl(url, filename) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
}

/** Save the volume to disk with its proper name. */
export async function downloadEbook(book) {
  const url = await fetchEbookObjectUrl(book)
  saveUrl(url, ebookFilename(book))
  return url
}

export function ebookFilename(book) {
  const base = String(field(book, 'file_name') || book?.title || 'volume').replace(/\.[a-z0-9]+$/i, '')
  const safe = base.replace(/[^\w\s.-]+/g, '').trim().replace(/\s+/g, '-').slice(0, 80) || 'volume'
  const ext = ebookKey(book).toLowerCase().endsWith('.epub') ? 'epub' : 'pdf'
  return `${safe}.${ext}`
}

/** A linked (external) volume can be opened directly; stored ones cannot. */
export function isExternalEbook(book) {
  return !isStoredEbook(book) && !!field(book, 'file')
}
