/**
 * Consent record for the Terms & Conditions gate.
 *
 * The version string is part of the record: bumping it re-locks the site for
 * every visitor, which is what item “Everything will be locked post
 * acknowledgement” requires — a new terms version must be acknowledged again.
 * The wording of the terms themselves lives in src/data/terms.js.
 */
import { TERMS_VERSION } from '../data/terms'

export const CONSENT_VERSION = TERMS_VERSION
const KEY = 'ib_consent'

/** Returns the stored consent record for the current terms version, or null. */
export function readConsent() {
  try {
    const c = JSON.parse(localStorage.getItem(KEY))
    return c && c.version === CONSENT_VERSION ? c : null
  } catch {
    return null
  }
}

export function saveConsent() {
  const record = {
    version: CONSENT_VERSION,
    at: new Date().toISOString(),
    gmt: new Date().toUTCString(),
  }
  try { localStorage.setItem(KEY, JSON.stringify(record)) } catch { /* private mode: consent lasts for this session only */ }
  return record
}
