import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../api/client'
import { useAuth } from './AuthContext'

/**
 * Content catalog — backed by the FastAPI backend's /content/{kind}
 * endpoints (kind is 'video' | 'ritual' | 'image'). `category` is 'paid'
 * (sealed for signed-in initiates only) or 'free'; `custom` marks
 * admin-added items. See /backend/app/models/content.py.
 */

const EMPTY = { video: [], ritual: [], image: [] }

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
  return {
    add: async (fields) => {
      await apiFetch(`/content/${kind}`, { method: 'POST', body: toCreatePayload(fields) })
      await reload.public()
    },
    update: async (id, patch) => {
      if (patch.category !== undefined) {
        await apiFetch(`/content/${kind}/${id}/lock`, { method: 'PATCH', body: { locked: patch.category === 'paid' } })
      }
      await reload.public()
    },
    remove: async (id) => {
      await apiFetch(`/content/${kind}/${id}`, { method: 'DELETE' })
      await reload.all()
    },
    restore: async (id) => {
      await apiFetch(`/content/${kind}/${id}/restore`, { method: 'POST' })
      await reload.all()
    },
  }
}

export function ContentProvider({ children }) {
  const { user, isAdmin, ready: authReady } = useAuth()
  const [raw, setRaw] = useState(EMPTY)
  const [hiddenRaw, setHiddenRaw] = useState(EMPTY)
  const [ready, setReady] = useState(false)

  const loadPublic = useCallback(async () => {
    const [video, ritual, image] = await Promise.all([
      apiFetch('/content/video', { auth: false }),
      apiFetch('/content/ritual', { auth: false }),
      apiFetch('/content/image', { auth: false }),
    ])
    setRaw({ video, ritual, image })
  }, [])

  const loadHidden = useCallback(async () => {
    if (!isAdmin) { setHiddenRaw(EMPTY); return }
    const [video, ritual, image] = await Promise.all([
      apiFetch('/content/video/admin/all'),
      apiFetch('/content/ritual/admin/all'),
      apiFetch('/content/image/admin/all'),
    ])
    const onlyHiddenSeed = (list) => list.filter((i) => i.hidden && !i.is_custom)
    setHiddenRaw({ video: onlyHiddenSeed(video), ritual: onlyHiddenSeed(ritual), image: onlyHiddenSeed(image) })
  }, [isAdmin])

  useEffect(() => {
    loadPublic().finally(() => setReady(true))
  }, [loadPublic])

  useEffect(() => {
    if (authReady) loadHidden()
  }, [authReady, isAdmin, loadHidden])

  const reload = useMemo(() => ({ public: loadPublic, all: async () => { await loadPublic(); await loadHidden() } }), [loadPublic, loadHidden])
  const videoApi = useMemo(() => makeKindApi('video', reload), [reload])
  const ritualApi = useMemo(() => makeKindApi('ritual', reload), [reload])
  const imageApi = useMemo(() => makeKindApi('image', reload), [reload])

  const videos = useMemo(() => raw.video.map(toClientItem), [raw.video])
  const rituals = useMemo(() => raw.ritual.map(toClientItem), [raw.ritual])
  const gallery = useMemo(() => raw.image.map(toClientItem), [raw.image])

  const toHiddenList = (list) => list.map((i) => ({ id: i.id, title: i.title }))
  const hiddenVideos = useMemo(() => toHiddenList(hiddenRaw.video), [hiddenRaw.video])
  const hiddenRituals = useMemo(() => toHiddenList(hiddenRaw.ritual), [hiddenRaw.ritual])
  const hiddenImages = useMemo(() => toHiddenList(hiddenRaw.image), [hiddenRaw.image])

  const value = useMemo(() => ({
    ready,
    /** Sealed (paid) content is visible to any signed-in initiate. */
    canAccess: (category) => category !== 'paid' || !!user?.paid,
    videos,
    rituals,
    gallery,
    hiddenVideos,
    hiddenRituals,
    hiddenImages,
    addVideo: videoApi.add,
    updateVideo: videoApi.update,
    deleteVideo: videoApi.remove,
    restoreVideo: videoApi.restore,
    addRitual: ritualApi.add,
    updateRitual: ritualApi.update,
    deleteRitual: ritualApi.remove,
    restoreRitual: ritualApi.restore,
    addImage: imageApi.add,
    updateImage: imageApi.update,
    deleteImage: imageApi.remove,
    restoreImage: imageApi.restore,
  }), [ready, user, videos, rituals, gallery, hiddenVideos, hiddenRituals, hiddenImages, videoApi, ritualApi, imageApi])

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used inside <ContentProvider>')
  return ctx
}
