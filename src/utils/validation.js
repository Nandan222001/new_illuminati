/**
 * Shared input validation for the whole site.
 *
 * Emails are syntax-checked and known disposable domains are rejected. Auth
 * forms additionally require a supported consumer provider. This checks the
 * provider domain, not whether a specific mailbox exists. Passwords must
 * contain at least one uppercase letter, one lowercase letter, one number and
 * one special character — the same rules are enforced again by the API
 * (backend/app/schemas/user.py), because client-side checks alone can be bypassed.
 */

// Deliberately conservative: no consecutive dots, no leading/trailing dot,
// a real TLD of at least two letters, and a domain that is not all digits.
const EMAIL_RE = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/

/** Common throwaway inbox providers — addresses here are rejected outright. */
export const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'tempmail.com', 'temp-mail.org', '10minutemail.com', '10minutemail.net',
  'guerrillamail.com', 'guerrillamail.net', 'sharklasers.com', 'yopmail.com', 'yopmail.fr',
  'trashmail.com', 'trashmail.de', 'dispostable.com', 'throwawaymail.com', 'getnada.com',
  'maildrop.cc', 'tempr.email', 'fakeinbox.com', 'mintemail.com', 'mailnesia.com',
  'spamgourmet.com', 'mailcatch.com', 'mytrashmail.com', 'discard.email', 'tempmailo.com',
  'burnermail.io', 'mohmal.com', 'emailondeck.com', 'moakt.com', 'linshiyouxiang.net',
])

/** Established consumer mail providers accepted for member registration. */
export const SUPPORTED_EMAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com',
  'hotmail.com', 'hotmail.co.uk', 'hotmail.de', 'hotmail.fr', 'hotmail.es', 'hotmail.it', 'hotmail.ca', 'hotmail.co.in', 'hotmail.in', 'hotmail.com.au',
  'outlook.com', 'outlook.co.uk', 'outlook.de', 'outlook.fr', 'outlook.es', 'outlook.it', 'outlook.ca', 'outlook.co.in', 'outlook.in', 'outlook.com.au', 'outlook.com.br', 'outlook.jp',
  'live.com', 'live.co.uk', 'live.de', 'live.fr', 'live.it', 'live.in', 'msn.com',
  'yahoo.com', 'yahoo.co.in', 'yahoo.in', 'yahoo.co.uk', 'yahoo.ca', 'yahoo.com.au', 'yahoo.fr', 'yahoo.de', 'yahoo.es', 'yahoo.it', 'yahoo.co.jp', 'yahoo.com.br', 'yahoo.com.sg', 'yahoo.co.nz', 'yahoo.co.za', 'ymail.com',
  'icloud.com', 'me.com', 'mac.com',
  'proton.me', 'protonmail.com', 'protonmail.ch', 'pm.me',
  'aol.com', 'gmx.com', 'gmx.net', 'gmx.de', 'mail.com', 'fastmail.com', 'fastmail.fm',
  'zoho.com', 'zohomail.com', 'rediffmail.com', 'yandex.com', 'yandex.ru',
  'tuta.com', 'tutanota.com', 'tutanota.de', 'hey.com',
  'qq.com', '163.com', '126.com', 'yeah.net', 'foxmail.com', 'naver.com', 'daum.net', 'hanmail.net', 'mail.ru',
])

export function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase()
}

/**
 * Returns `{ ok, value, reason }`. `reason` is one of `required`, `format`,
 * `length`, `domain`, `tld`, `disposable` or `provider`, so the UI can show a
 * precise message instead of a generic "invalid email". Auth forms enable
 * `requireSupportedProvider`; `allowAddresses` is reserved for the configured
 * Keeper login. Other contact forms retain general email validation.
 */
export function validateEmail(value, { requireSupportedProvider = false, allowAddresses = [] } = {}) {
  const email = normalizeEmail(value)
  if (!email) return { ok: false, value: email, reason: 'required' }
  if (email.length > 254) return { ok: false, value: email, reason: 'length' }

  const at = email.lastIndexOf('@')
  if (at < 1 || at === email.length - 1) return { ok: false, value: email, reason: 'format' }
  const local = email.slice(0, at)
  const domain = email.slice(at + 1)

  if (local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
    return { ok: false, value: email, reason: 'format' }
  }
  if (!EMAIL_RE.test(email)) return { ok: false, value: email, reason: 'format' }
  if (domain.includes('..') || domain.startsWith('-') || domain.endsWith('-')) {
    return { ok: false, value: email, reason: 'format' }
  }

  const tld = domain.slice(domain.lastIndexOf('.') + 1)
  if (!/^[a-z]{2,24}$/.test(tld)) return { ok: false, value: email, reason: 'tld' }
  if (DISPOSABLE_DOMAINS.has(domain)) return { ok: false, value: email, reason: 'disposable' }
  const isAllowedKeeperAddress = allowAddresses.some((address) => normalizeEmail(address) === email)
  if (requireSupportedProvider && !SUPPORTED_EMAIL_DOMAINS.has(domain) && !isAllowedKeeperAddress) {
    return { ok: false, value: email, reason: 'provider' }
  }

  return { ok: true, value: email, reason: null }
}

export function isValidEmail(value) {
  return validateEmail(value).ok
}

/** Which of the mandatory character classes a passphrase is still missing. */
export function passwordChecks(password = '') {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }
}

export const PASSWORD_RULE_ORDER = ['length', 'upper', 'lower', 'digit', 'special']

export function validatePassword(password = '') {
  const checks = passwordChecks(password)
  const missing = PASSWORD_RULE_ORDER.filter((rule) => !checks[rule])
  return { ok: missing.length === 0, checks, missing }
}

/** 0–4 score used by the strength meter (special characters count twice). */
export function passwordScore(password = '') {
  const c = passwordChecks(password)
  let score = 0
  if (c.length) score += 1
  if (password.length >= 12) score += 1
  if (c.upper && c.lower) score += 1
  if (c.digit) score += 1
  if (c.special) score += 1
  return Math.min(score, 4)
}

/** A name is only accepted when it has at least two visible characters. */
export function isValidName(value) {
  const name = String(value ?? '').trim().replace(/\s+/g, ' ')
  return { ok: name.length >= 2 && name.length <= 80, value: name }
}

/**
 * All site times are published in GMT/UTC (item: “Time format to be used as
 * GMT instead of IST”). These helpers keep every printed time consistent.
 */
export function toGmt(date = new Date()) {
  return date instanceof Date ? date : new Date(date)
}

export function formatGmtDateTime(date = new Date()) {
  const d = toGmt(date)
  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = d.toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' }).toUpperCase()
  const year = d.getUTCFullYear()
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  const ss = String(d.getUTCSeconds()).padStart(2, '0')
  return `${day} ${month} ${year} · ${hh}:${mm}:${ss} GMT`
}

export function formatGmtClock(date = new Date()) {
  const d = toGmt(date)
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  const ss = String(d.getUTCSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss} GMT`
}
