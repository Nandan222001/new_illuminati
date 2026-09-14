import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { GALLERY, RITUALS, VIDEOS } from '../data/content'
import { useAuth } from './AuthContext'

/**
 * Content catalog (demo).
 *
 * `locks` marks any content id as PAID (sealed for signed-in initiates only)
 * or FREE (public). `hidden` removes a seed item from public listings without
 * deleting the source data — an admin "delete" on a built-in item hides it
 * instead, and can be restored later. Admin-added items live entirely in
 * `custom` and can be fully removed. Everything persists to localStorage;
 * swap this file for API calls when a backend exists.
 */

const CONTENT_KEY = 'ib_content_v1'
const HIDDEN_KEY = 'ib_hidden_v1'
const CUSTOM_KEY = 'ib_custom_v1'

/** Items sealed (PAID) for members only until an admin changes it. */
const DEFAULT_LOCKS = {
  'the-black-sun-vigil': true,
  'council-of-thirteen': true,
  'the-last-screening': true,
}

const EMPTY_CUSTOM = { videos: [], rituals: [], images: [] }

const ContentContext = createContext(null)

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function readLocks() {
  return { ...DEFAULT_LOCKS, ...readJSON(CONTENT_KEY, {}) }
}

function readHidden() {
  return readJSON(HIDDEN_KEY, {})
}

function readCustom() {
  return { ...EMPTY_CUSTOM, ...readJSON(CUSTOM_KEY, {}) }
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'item'
}

function uid(existingIds, base) {
  let id = base
  let n = 2
  while (existingIds.has(id)) { id = `${base}-${n}`; n += 1 }
  return id
}

export function ContentProvider({ children }) {
  const { user } = useAuth()
  const [locks, setLocks] = useState(readLocks)
  const [hidden, setHiddenState] = useState(readHidden)
  const [custom, setCustom] = useState(readCustom)

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === CONTENT_KEY) setLocks(readLocks())
      if (e.key === HIDDEN_KEY) setHiddenState(readHidden())
      if (e.key === CUSTOM_KEY) setCustom(readCustom())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setLocked = useCallback((id, locked) => {
    setLocks((prev) => {
      const next = { ...prev, [id]: !!locked }
      writeJSON(CONTENT_KEY, next)
      return next
    })
  }, [])

  const setCategory = useCallback((id, category) => setLocked(id, category === 'paid'), [setLocked])

  const setHidden = useCallback((id, isHidden) => {
    setHiddenState((prev) => {
      const next = { ...prev, [id]: !!isHidden }
      writeJSON(HIDDEN_KEY, next)
      return next
    })
  }, [])

  const addItem = useCallback((kind, fields) => {
    setCustom((prev) => {
      const ids = new Set([...prev[kind].map((i) => i.id), ...({ videos: VIDEOS, rituals: RITUALS, images: GALLERY }[kind]).map((i) => i.id || i.slug)])
      const id = uid(ids, slugify(fields.title))
      const item = { ...fields, id, slug: id, custom: true, createdAt: new Date().toISOString() }
      const next = { ...prev, [kind]: [item, ...prev[kind]] }
      writeJSON(CUSTOM_KEY, next)
      return next
    })
  }, [])

  const updateItem = useCallback((kind, id, patch) => {
    setCustom((prev) => {
      const next = { ...prev, [kind]: prev[kind].map((i) => (i.id === id ? { ...i, ...patch } : i)) }
      writeJSON(CUSTOM_KEY, next)
      return next
    })
  }, [])

  const removeCustomItem = useCallback((kind, id) => {
    setCustom((prev) => {
      const next = { ...prev, [kind]: prev[kind].filter((i) => i.id !== id) }
      writeJSON(CUSTOM_KEY, next)
      return next
    })
  }, [])

  /** Delete = fully remove a custom item, or hide (reversible) a seed item. */
  const deleteItem = useCallback((kind, id, isCustom) => {
    if (isCustom) removeCustomItem(kind, id)
    else setHidden(id, true)
  }, [removeCustomItem, setHidden])

  const restoreItem = useCallback((id) => setHidden(id, false), [setHidden])

  const decorate = useCallback((item, idKey = 'slug') => ({
    ...item,
    id: item[idKey] || item.id,
    category: locks[item[idKey] || item.id] ? 'paid' : 'free',
    custom: false,
  }), [locks])

  const videos = useMemo(() => [
    ...VIDEOS.filter((v) => !hidden[v.slug]).map((v) => decorate(v, 'slug')),
    ...custom.videos.filter((v) => !hidden[v.id]),
  ], [hidden, custom.videos, decorate])

  const rituals = useMemo(() => [
    ...RITUALS.filter((r) => !hidden[r.slug]).map((r) => decorate(r, 'slug')),
    ...custom.rituals.filter((r) => !hidden[r.id]),
  ], [hidden, custom.rituals, decorate])

  const gallery = useMemo(() => [
    ...GALLERY.filter((g) => !hidden[g.id]).map((g) => decorate(g, 'id')),
    ...custom.images.filter((g) => !hidden[g.id]),
  ], [hidden, custom.images, decorate])

  const value = useMemo(() => ({
    locks,
    isLocked: (id) => !!locks[id],
    /** Sealed (paid) content is visible to any signed-in initiate. */
    canAccess: (category) => category !== 'paid' || !!user?.paid,
    setLocked,
    setCategory,
    hidden,
    setHidden,
    restoreItem,
    videos,
    rituals,
    gallery,
    addVideo: (fields) => addItem('videos', fields),
    updateVideo: (id, patch) => updateItem('videos', id, patch),
    deleteVideo: (id, isCustom) => deleteItem('videos', id, isCustom),
    addRitual: (fields) => addItem('rituals', fields),
    updateRitual: (id, patch) => updateItem('rituals', id, patch),
    deleteRitual: (id, isCustom) => deleteItem('rituals', id, isCustom),
    addImage: (fields) => addItem('images', fields),
    updateImage: (id, patch) => updateItem('images', id, patch),
    deleteImage: (id, isCustom) => deleteItem('images', id, isCustom),
  }), [locks, user, setLocked, setCategory, hidden, setHidden, restoreItem, videos, rituals, gallery, addItem, updateItem, deleteItem])

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used inside <ContentProvider>')
  return ctx
}
