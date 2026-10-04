import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../api/client'
import { DEFAULT_SOCIAL, readStoredSocial, saveStoredSocial, SOCIAL_PLATFORMS } from '../utils/social'

const SiteSettingsContext = createContext(null)

/**
 * Public site settings (currently the social-media links the Keeper fills in
 * from Admin → Settings). Loaded from the API when available and always
 * mirrored to localStorage, so the footer/community rows stay correct even
 * when the backend is offline.
 */
export function SiteSettingsProvider({ children }) {
  const [social, setSocial] = useState({ ...DEFAULT_SOCIAL })

  useEffect(() => {
    setSocial(readStoredSocial())
    const onUpdate = (event) => setSocial(event.detail || readStoredSocial())
    window.addEventListener('ib:social-updated', onUpdate)
    window.addEventListener('storage', onUpdate)
    let alive = true
    apiFetch('/public/settings', { auth: false, timeoutMs: 4000 })
      .then((data) => {
        if (!alive || !data?.social) return
        const merged = Object.fromEntries(SOCIAL_PLATFORMS.map((p) => [p, data.social[p] || '']))
        const hasAny = SOCIAL_PLATFORMS.some((p) => merged[p])
        if (hasAny) setSocial(saveStoredSocial({ ...readStoredSocial(), ...merged }))
      })
      .catch(() => { /* bundled/local defaults stay in place */ })
    return () => {
      alive = false
      window.removeEventListener('ib:social-updated', onUpdate)
      window.removeEventListener('storage', onUpdate)
    }
  }, [])

  const updateSocial = useCallback((patch) => setSocial(saveStoredSocial({ ...readStoredSocial(), ...patch })), [])

  const value = useMemo(() => ({
    social,
    updateSocial,
    setSocial: (next) => setSocial(saveStoredSocial(next)),
  }), [social, updateSocial])

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext)
  if (!ctx) throw new Error('useSiteSettings must be used inside <SiteSettingsProvider>')
  return ctx
}
