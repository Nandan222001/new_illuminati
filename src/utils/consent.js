export const CONSENT_VERSION = 1
const KEY = 'ib_consent'

/** Returns the stored consent record for the current rules version, or null. */
export function readConsent() {
  try {
    const c = JSON.parse(localStorage.getItem(KEY))
    return c && c.version === CONSENT_VERSION ? c : null
  } catch {
    return null
  }
}

export function saveConsent() {
  const record = { version: CONSENT_VERSION, at: new Date().toISOString() }
  try { localStorage.setItem(KEY, JSON.stringify(record)) } catch { /* private mode: consent lasts for this session only */ }
  return record
}
