/**
 * Social-media links.
 *
 * The Keeper edits these in Admin → Settings → Social media; they are stored
 * on the backend (`admin_settings.social`) and mirrored into localStorage so
 * the public pages keep working when the API is unavailable.
 */

const KEY = 'ib_social_v1'

export const SOCIAL_PLATFORMS = ['instagram', 'discord', 'telegram', 'youtube', 'x', 'facebook']

export const DEFAULT_SOCIAL = {
  instagram: '',
  discord: '',
  telegram: '',
  youtube: '',
  x: '',
  facebook: '',
}

/** Turns whatever the Keeper typed into an absolute https URL (or ''). */
export function normalizeSocialUrl(platform, raw) {
  const value = String(raw ?? '').trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  if (/^mailto:|^tel:/i.test(value)) return value
  if (value.startsWith('@')) {
    const handle = value.slice(1).replace(/^\/+/, '')
    const bases = {
      instagram: 'https://instagram.com/',
      discord: 'https://discord.gg/',
      telegram: 'https://t.me/',
      youtube: 'https://youtube.com/@',
      x: 'https://x.com/',
      facebook: 'https://facebook.com/',
    }
    return `${bases[platform] || 'https://'}${handle}`
  }
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(value)) return `https://${value}`
  return `https://${value.replace(/^\/+/, '')}`
}

export function normalizeSocialMap(input = {}) {
  const out = { ...DEFAULT_SOCIAL }
  SOCIAL_PLATFORMS.forEach((platform) => {
    out[platform] = normalizeSocialUrl(platform, input[platform])
  })
  return out
}

export function readStoredSocial() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY))
    return normalizeSocialMap({ ...DEFAULT_SOCIAL, ...(raw || {}) })
  } catch {
    return { ...DEFAULT_SOCIAL }
  }
}

export function saveStoredSocial(social) {
  const normalized = normalizeSocialMap(social)
  try { localStorage.setItem(KEY, JSON.stringify(normalized)) } catch { /* private mode */ }
  try { window.dispatchEvent(new CustomEvent('ib:social-updated', { detail: normalized })) } catch { /* SSR */ }
  return normalized
}

export function socialHandle(url) {
  if (!url) return ''
  try {
    const path = new URL(url).pathname.replace(/^\/+|\/+$/g, '')
    return path ? `@${path.replace(/^@/, '')}` : ''
  } catch {
    return ''
  }
}
