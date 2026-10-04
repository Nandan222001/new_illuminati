import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../api/client'
import { CARDS, EBOOKS, GALLERY, RITUALS, VIDEOS } from '../data/content'
import { useAuth } from './AuthContext'

/**
 * Content catalog — backed by the FastAPI backend's /content/{kind}
 * endpoints (kind is 'video' | 'ritual' | 'image' | 'book' | 'archive').
 * `category` is 'paid' (sealed for signed-in initiates only) or 'free';
 * `custom` marks admin-added items. See /backend/app/models/content.py.
 *
 * If the API is unreachable the console keeps working: uploads are written to
 * a local browser store and merged into the public lists, so the Keeper can
 * still publish an archive record, e-book or video on the day of a launch.
 */

const EMPTY = { video: [], ritual: [], image: [], book: [], archive: [] }
const KINDS = ['video', 'ritual', 'image', 'book', 'archive']
const LOAD_TIMEOUT_MS = 5000
const LOCAL_KEY = 'ib_local_content_v1'
const HIDDEN_KEY = 'ib_local_hidden_v1'

// Mirrors the backend's DEFAULT_LOCKED_SLUGS (backend/app/seeds/seed_content.py).
const SEALED_SLUGS = new Set([
  'the-black-sun-vigil', 'council-of-thirteen', 'the-last-screening',
  'a-field-guide-to-hidden-symbols', 'the-new-world-order-dossier', 'rituals-a-stage-manual',
])

function emptyMap() {
  return KINDS.reduce((acc, kind) => ({ ...acc, [kind]: [] }), {})
}

function readJSON(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key))
    return parsed && typeof parsed === 'object' ? parsed : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* private mode */ }
  try { window.dispatchEvent(new CustomEvent('ib:content-updated')) } catch { /* SSR */ }
}

function localSlug(title, taken) {
  const base = String(title || 'item').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item'
  let slug = base
  let n = 2
  while (taken.has(slug)) slug = `${base}-${n++}`
  return slug
}

function bundledRaw(rows, slugKey, extraKeys) {
  return rows.map((row) => ({
    id: row[slugKey],
    slug: row[slugKey],
    title: row.title,
    description: row.desc ?? null,
    image_url: row.img,
    locked: SEALED_SLUGS.has(row[slugKey]),
    is_custom: false,
    extra: Object.fromEntries(extraKeys.filter((k) => k in row).map((k) => [k, row[k]])),
  }))
}

/** Built-in catalog shown when the API can't be reached (e.g. a frontend-only deploy). */
const BUNDLED = {
  video: bundledRaw(VIDEOS, 'slug', ['tag', 'dur', 'date', 'video_url']),
  ritual: bundledRaw(RITUALS, 'slug', ['step', 'duration', 'tags', 'video_url']),
  image: bundledRaw(GALLERY, 'id', ['cap', 'portrait']),
  book: bundledRaw(EBOOKS, 'slug', ['pages', 'file', 'format']),
  archive: bundledRaw(CARDS, 'slug', ['era', 'cap', 'body']),
}

const ContentContext = createContext(null)

function toClientItem(item) {
  return {
    ...item.extra,
    id: item.id,
    slug: item.slug,
    title: item.title,
    desc: item.description,
    img: item.image_url,
    category: item.locked ? 'paid' : 'free',
    custom: item.is_custom,
  }
}

/** Splits a flat admin form (title/desc/img/category + kind-specific fields) into the API payload shape. */
function toCreatePayload(fields) {
  const { title, desc, img, category, ...extra } = fields
  return { title, description: desc || null, image_url: img || null, locked: category === 'paid', extra }
}

function makeKindApi(kind, reload) {
  /** Offline path: write the item into the local store so it appears immediately. */
  const addLocal = (fields) => {
    const store = { ...emptyMap(), ...readJSON(LOCAL_KEY, {}) }
    const { title, desc, img, category, ...extra } = fields
    const existing = new Set([
      ...store[kind].map((i) => i.slug),
      ...(BUNDLED[kind] || []).map((i) => i.slug),
    ])
    const slug = localSlug(title, existing)
    const item = {
      ...extra,
      id: `local-${kind}-${Date.now()}`,
      slug,
      title,
      desc: desc || '',
      img: img || '',
      category: category === 'paid' ? 'paid' : 'free',
      custom: true,
      local: true,
    }
    store[kind] = [item, ...store[kind]]
    writeJSON(LOCAL_KEY, store)
    return item
  }

  return {
    /** Returns the shelved item so callers can immediately attach an uploaded file to it. */
    add: async (fields) => {
      let created = null
      try {
        created = toClientItem(await apiFetch(`/content/${kind}`, { method: 'POST', body: toCreatePayload(fields) }))
      } catch {
        created = addLocal(fields)
      }
      await reload.public()
      return created
    },
    update: async (id, patch) => {
      try {
        const { category, ...rest } = patch
        if (category !== undefined) {
          await apiFetch(`/content/${kind}/${id}/lock`, { method: 'PATCH', body: { locked: category === 'paid' } })
        }
        // Only books edit free-form fields today, but the mapping is generic.
        const payload = {}
        if (rest.title !== undefined) payload.title = rest.title
        if (rest.desc !== undefined) payload.description = rest.desc
        if (rest.img !== undefined) payload.image_url = rest.img
        const extra = Object.fromEntries(Object.entries(rest).filter(([key]) => !['title', 'desc', 'img'].includes(key)))
        if (Object.keys(extra).length) payload.extra = extra
        if (Object.keys(payload).length) {
          await apiFetch(`/content/${kind}/${id}`, { method: 'PATCH', body: payload })
        }
      } catch {
        const store = { ...emptyMap(), ...readJSON(LOCAL_KEY, {}) }
        store[kind] = store[kind].map((item) => (
          item.id === id ? { ...item, ...(patch.category ? { category: patch.category } : {}), ...patch } : item
        ))
        writeJSON(LOCAL_KEY, store)
      }
      await reload.public()
    },
    /**
     * Attach an uploaded volume (key from POST /library/ebooks) to an item, or
     * detach it with `key: null`. The key is validated server-side, so the file
     * handle can only ever point at a real file on the upload shelf.
     */
    attachFile: async (id, key, filename) => {
      try {
        await apiFetch(`/content/${kind}/${id}/file`, { method: 'PATCH', body: { key, filename: filename || null } })
      } catch {
        // Offline: the upload itself never reached the server, so only the local
        // reference is kept — the volume stays listed as awaiting its file.
        const store = { ...emptyMap(), ...readJSON(LOCAL_KEY, {}) }
        const patch = { file: '', file_key: key || '', file_name: filename || '' }
        store[kind] = store[kind].map((item) => (String(item.id) === String(id) ? { ...item, ...patch } : item))
        writeJSON(LOCAL_KEY, store)
      }
      await reload.public()
    },
    remove: async (id) => {
      try {
        await apiFetch(`/content/${kind}/${id}`, { method: 'DELETE' })
      } catch {
        const store = { ...emptyMap(), ...readJSON(LOCAL_KEY, {}) }
        const local = store[kind].find((item) => item.id === id)
        if (local) {
          store[kind] = store[kind].filter((item) => item.id !== id)
          writeJSON(LOCAL_KEY, store)
        } else {
          const hidden = readJSON(HIDDEN_KEY, {})
          hidden[kind] = [...new Set([...(hidden[kind] || []), String(id)])]
          writeJSON(HIDDEN_KEY, hidden)
        }
      }
      await reload.all()
    },
    restore: async (id) => {
      try {
        await apiFetch(`/content/${kind}/${id}/restore`, { method: 'POST' })
      } catch {
        const hidden = readJSON(HIDDEN_KEY, {})
        hidden[kind] = (hidden[kind] || []).filter((slugOrId) => String(slugOrId) !== String(id))
        writeJSON(HIDDEN_KEY, hidden)
      }
      await reload.all()
    },
  }
}

export function ContentProvider({ children }) {
  const { user, isAdmin, ready: authReady } = useAuth()
  // Ship the bundled catalog in the first render so static HTML and the first
  // client render both contain useful page content before the API responds.
  const [raw, setRaw] = useState(BUNDLED)
  const [local, setLocal] = useState(emptyMap)
  const [hiddenLocal, setHiddenLocal] = useState({})
  const [hiddenRaw, setHiddenRaw] = useState(EMPTY)
  const [ready, setReady] = useState(true)

  const loadLocal = useCallback(() => {
    setLocal({ ...emptyMap(), ...readJSON(LOCAL_KEY, {}) })
    setHiddenLocal(readJSON(HIDDEN_KEY, {}))
  }, [])

  const loadPublic = useCallback(async () => {
    loadLocal()
    try {
      // The token is sent when one exists: sealed e-books only hand their file
      // link to an entitled reader (see backend content.py `_view_for`).
      const results = await Promise.all(KINDS.map((kind) => (
        apiFetch(`/content/${kind}`, { timeoutMs: LOAD_TIMEOUT_MS }).catch(() => null)
      )))
      // Keep the bundled list for any kind the API does not serve yet.
      setRaw((prev) => Object.fromEntries(KINDS.map((kind, i) => (
        [kind, Array.isArray(results[i]) ? results[i] : (prev[kind] ?? BUNDLED[kind])]
      ))))
    } catch {
      setRaw((prev) => (prev === EMPTY ? BUNDLED : prev))
    }
  }, [loadLocal])

  const loadHidden = useCallback(async () => {
    if (!isAdmin) { setHiddenRaw(EMPTY); return }
    try {
      const results = await Promise.all(KINDS.map((kind) => (
        apiFetch(`/content/${kind}/admin/all`, { timeoutMs: LOAD_TIMEOUT_MS }).catch(() => null)
      )))
      const onlyHiddenSeed = (list) => (Array.isArray(list) ? list : []).filter((i) => i.hidden && !i.is_custom)
      setHiddenRaw(Object.fromEntries(KINDS.map((kind, i) => [kind, onlyHiddenSeed(results[i])])))
    } catch {
      setHiddenRaw(EMPTY)
    }
  }, [isAdmin])

  useEffect(() => {
    // Re-reads whenever the session changes: sealed volumes only hand over their
    // file link to an entitled reader, so paying (or signing out) must re-fetch.
    loadPublic().finally(() => setReady(true))
  }, [loadPublic, user?.id, user?.paid])

  useEffect(() => {
    if (authReady) loadHidden()
  }, [authReady, isAdmin, loadHidden])

  const reload = useMemo(() => ({ public: loadPublic, all: async () => { await loadPublic(); await loadHidden() } }), [loadPublic, loadHidden])
  const apis = useMemo(() => Object.fromEntries(KINDS.map((kind) => [kind, makeKindApi(kind, reload)])), [reload])

  /** API rows + locally published rows, minus anything hidden on this device. */
  const clientList = useCallback((kind) => {
    const hiddenHere = new Set((hiddenLocal[kind] || []).map(String))
    const apiRows = (raw[kind] || []).filter((row) => (
      !hiddenHere.has(String(row.id)) && !hiddenHere.has(String(row.slug))
    ))
    const rows = [...(local[kind] || []), ...apiRows]
    return rows.map((row) => (row.local ? row : toClientItem(row)))
  }, [raw, local, hiddenLocal])

  const videos = useMemo(() => clientList('video'), [clientList])
  const rituals = useMemo(() => clientList('ritual'), [clientList])
  const gallery = useMemo(() => clientList('image'), [clientList])
  const books = useMemo(() => clientList('book'), [clientList])
  const archives = useMemo(() => clientList('archive'), [clientList])

  const toHiddenList = (list) => list.map((i) => ({ id: i.id, title: i.title }))

  const value = useMemo(() => ({
    ready,
    /** Sealed (paid) content is visible to any signed-in initiate. */
    canAccess: (category) => category !== 'paid' || !!user?.paid,
    videos,
    rituals,
    gallery,
    books,
    archives,
    hiddenVideos: toHiddenList(hiddenRaw.video),
    hiddenRituals: toHiddenList(hiddenRaw.ritual),
    hiddenImages: toHiddenList(hiddenRaw.image),
    hiddenBooks: toHiddenList(hiddenRaw.book),
    hiddenArchives: toHiddenList(hiddenRaw.archive),
    addVideo: apis.video.add, updateVideo: apis.video.update, deleteVideo: apis.video.remove, restoreVideo: apis.video.restore,
    addRitual: apis.ritual.add, updateRitual: apis.ritual.update, deleteRitual: apis.ritual.remove, restoreRitual: apis.ritual.restore,
    addImage: apis.image.add, updateImage: apis.image.update, deleteImage: apis.image.remove, restoreImage: apis.image.restore,
    addBook: apis.book.add, updateBook: apis.book.update, deleteBook: apis.book.remove, restoreBook: apis.book.restore,
    attachBookFile: apis.book.attachFile,
    addArchive: apis.archive.add, updateArchive: apis.archive.update, deleteArchive: apis.archive.remove, restoreArchive: apis.archive.restore,
  }), [ready, user, videos, rituals, gallery, books, archives, hiddenRaw, apis])

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used inside <ContentProvider>')
  return ctx
}
