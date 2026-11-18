/**
 * Consent record for the Terms & Conditions gate.
 *
 * Changing the terms version requires a new acknowledgement before account and
 * member pages can be opened. Public editorial pages do not need a record.
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
