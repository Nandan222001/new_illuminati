export const SITE_NAME = 'Illuminati Brotherhood'
export const DEFAULT_SITE_URL = 'https://illuminati-brotherhood.org'

export function normalizeSiteUrl(value = DEFAULT_SITE_URL) {
  try {
    const url = new URL(value, DEFAULT_SITE_URL)
    return ['http:', 'https:'].includes(url.protocol) ? url.origin : DEFAULT_SITE_URL
  } catch {
    return DEFAULT_SITE_URL
  }
}
