/**
 * Client-side auth service (demo).
 *
 * The site is a static Vite/React app deployed to Vercel, so accounts are
 * persisted in localStorage. Passwords are never stored in plain text — they
 * are salted and hashed with SHA-256 via SubtleCrypto. Swap the functions in
 * this file for real API calls when a backend is available; the rest of the
 * app only talks to the AuthContext.
 */

export const USERS_KEY = 'ib_users_v1'
export const SESSION_KEY = 'ib_session_v1'
export const DEMO_KEY = 'ib_demo_keeper_v1'

/**
 * Seed Keeper (admin) credentials.
 * Set VITE_ADMIN_EMAIL / VITE_ADMIN_PASSWORD at build time to fix them.
 * When no passphrase is configured, a random one is generated on first load,
 * kept in localStorage and displayed on the login page for demo access.
 */
const ENV = (typeof import.meta !== 'undefined' && import.meta.env) || {}
export const ADMIN_EMAIL = ENV.VITE_ADMIN_EMAIL || 'admin@illuminati.local'
const ENV_ADMIN_PASSWORD = ENV.VITE_ADMIN_PASSWORD || ''

export const ROLES = { ADMIN: 'admin', MEMBER: 'member' }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

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

function randomHex(bytes) {
  if (globalThis.crypto?.getRandomValues) {
    return [...crypto.getRandomValues(new Uint8Array(bytes))].map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  let out = ''
  while (out.length < bytes * 2) out += Math.floor(Math.random() * 16).toString(16)
  return out
}

export function uid(prefix = 'usr') {
  return `${prefix}_${Date.now().toString(36)}_${randomHex(4)}`
}

export async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  if (globalThis.crypto?.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', data)
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  // Fallback for non-secure contexts (no SubtleCrypto): FNV-1a, two rounds.
  let h1 = 0x811c9dc5
  let h2 = 0x01000193
  for (const byte of data) {
    h1 ^= byte
    h1 = Math.imul(h1, 0x01000193)
    h2 ^= byte
    h2 = Math.imul(h2, 0x811c9dc5)
  }
  return `${(h1 >>> 0).toString(16)}${(h2 >>> 0).toString(16)}`
}

export function isValidEmail(email) {
  return EMAIL_RE.test(String(email || '').trim())
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

export function publicUser(user) {
  if (!user) return null
  // eslint-disable-next-line no-unused-vars
  const { passwordHash, salt, ...safe } = user
  return safe
}

export function getUsers() {
  return readJSON(USERS_KEY, [])
}

export function saveUsers(users) {
  writeJSON(USERS_KEY, users)
}

export function getSession() {
  return readJSON(SESSION_KEY, null)
}

export function setSession(session) {
  if (session) writeJSON(SESSION_KEY, session)
  else localStorage.removeItem(SESSION_KEY)
}

function generatePassphrase() {
  return `Keeper-${randomHex(4).toUpperCase()}`
}

/** Credentials for the seeded Keeper, for the demo box on the login page. */
export function getDemoCredentials() {
  if (ENV_ADMIN_PASSWORD) return { email: ADMIN_EMAIL, password: ENV_ADMIN_PASSWORD, fromEnv: true }
  const saved = readJSON(DEMO_KEY, null)
  return saved ? { ...saved, fromEnv: false } : null
}

let seedPromise = null

/** Guarantees at least one admin account exists. Idempotent. */
export function ensureSeeded() {
  if (!seedPromise) {
    seedPromise = (async () => {
      const users = getUsers()
      if (!users.some((u) => u.role === ROLES.ADMIN)) {
        const password = ENV_ADMIN_PASSWORD || generatePassphrase()
        if (!ENV_ADMIN_PASSWORD) writeJSON(DEMO_KEY, { email: ADMIN_EMAIL, password })
        const salt = randomHex(8)
        const createdAt = new Date().toISOString()
        users.unshift({
          id: 'usr_grand_keeper',
          name: 'Grand Keeper',
          email: ADMIN_EMAIL,
          role: ROLES.ADMIN,
          salt,
          passwordHash: await hashPassword(password, salt),
          createdAt,
          initiate: 1,
          paid: true,
          paidAt: createdAt,
          sealId: 'IB-000',
        })
        saveUsers(users)
      }
      return users
    })()
  }
  return seedPromise
}

export async function register({ name, email, password }) {
  const cleanName = String(name || '').trim()
  const cleanEmail = normalizeEmail(email)
  if (cleanName.length < 2) throw new Error('Tell us the name the Brotherhood should know you by.')
  if (!isValidEmail(cleanEmail)) throw new Error('That email does not look valid.')
  if (String(password || '').length < 8) throw new Error('Your passphrase must be at least 8 characters.')

  const users = getUsers()
  if (users.some((u) => u.email === cleanEmail)) {
    throw new Error('An initiate with this email already exists. Try signing in instead.')
  }

  const salt = randomHex(8)
  const user = {
    id: uid(),
    name: cleanName,
    email: cleanEmail,
    role: ROLES.MEMBER,
    salt,
    passwordHash: await hashPassword(password, salt),
    createdAt: new Date().toISOString(),
    initiate: users.reduce((max, u) => Math.max(max, u.initiate || 0), 0) + 1,
    paid: false,
    paidAt: null,
    sealId: null,
  }
  users.push(user)
  saveUsers(users)
  return user
}

export async function login({ email, password }) {
  const cleanEmail = normalizeEmail(email)
  const user = getUsers().find((u) => u.email === cleanEmail)
  if (!user) throw new Error('No initiate is registered with this email.')
  const hash = await hashPassword(password, user.salt)
  if (hash !== user.passwordHash) throw new Error('The passphrase is incorrect.')
  return user
}

export const INITIATION_FEE_INR = 999

/**
 * Marks a member as having completed their (simulated) ₹999 initiation
 * payment. This never talks to a real payment gateway — it just flips a
 * local flag, same as everything else in this demo auth service.
 */
export function sealInitiation(id) {
  const users = getUsers()
  const target = users.find((u) => u.id === id)
  if (!target) throw new Error('Initiate not found.')
  if (target.paid) return users
  const sealId = `IB-${randomHex(3).toUpperCase()}`
  return updateUser(id, { paid: true, paidAt: new Date().toISOString(), sealId })
}

export function updateUser(id, patch) {
  const users = getUsers()
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1) throw new Error('Initiate not found.')
  users[idx] = { ...users[idx], ...patch }
  saveUsers(users)
  return users
}

export function changeRole(id, role, actorId) {
  if (!Object.values(ROLES).includes(role)) throw new Error('Unknown rank.')
  const users = getUsers()
  const target = users.find((u) => u.id === id)
  if (!target) throw new Error('Initiate not found.')
  if (target.id === actorId && role !== ROLES.ADMIN) throw new Error('You cannot lower your own rank.')
  const admins = users.filter((u) => u.role === ROLES.ADMIN)
  if (target.role === ROLES.ADMIN && role !== ROLES.ADMIN && admins.length <= 1) {
    throw new Error('The Brotherhood must keep at least one Keeper.')
  }
  return updateUser(id, { role })
}

export function deleteUser(id, actorId) {
  const users = getUsers()
  const target = users.find((u) => u.id === id)
  if (!target) throw new Error('Initiate not found.')
  if (target.id === actorId) throw new Error('You cannot banish yourself.')
  if (target.role === ROLES.ADMIN && users.filter((u) => u.role === ROLES.ADMIN).length <= 1) {
    throw new Error('The Brotherhood must keep at least one Keeper.')
  }
  const next = users.filter((u) => u.id !== id)
  saveUsers(next)
  return next
}
