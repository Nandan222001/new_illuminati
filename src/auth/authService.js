/**
 * Auth service — talks to the FastAPI backend (see /backend). Sessions are
 * a JWT bearer token kept in localStorage (see ../api/client.js); user
 * records live in MySQL, not in the browser.
 */
import { apiFetch, getToken, setToken } from '../api/client'

export const ROLES = { ADMIN: 'admin', MEMBER: 'member' }
export const INITIATION_FEE_INR = 999

/** Maps the backend's snake_case UserPublic to the shape the UI expects. */
export function publicUser(user) {
  if (!user) return null
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    initiate: user.initiate_number,
    paid: user.paid,
    paidAt: user.paid_at,
    sealId: user.seal_id,
    createdAt: user.created_at,
  }
}

export function hasSession() {
  return !!getToken()
}

export async function register({ name, email, password }) {
  const data = await apiFetch('/auth/register', { method: 'POST', body: { name, email, password }, auth: false })
  setToken(data.access_token)
  return publicUser(data.user)
}

export async function login({ email, password }) {
  const data = await apiFetch('/auth/login', { method: 'POST', body: { email, password }, auth: false })
  setToken(data.access_token)
  return publicUser(data.user)
}

export function logout() {
  setToken(null)
}

export async function fetchMe() {
  const data = await apiFetch('/auth/me')
  return publicUser(data)
}

export async function updateProfile(patch) {
  const data = await apiFetch('/auth/me', { method: 'PATCH', body: { name: patch.name } })
  return publicUser(data)
}

export async function sealInitiation() {
  const data = await apiFetch('/auth/initiate', { method: 'POST' })
  return publicUser(data)
}

export async function listUsers() {
  const data = await apiFetch('/users')
  return data.map(publicUser)
}

export async function changeRole(id, role) {
  const data = await apiFetch(`/users/${id}/role`, { method: 'PATCH', body: { role } })
  return publicUser(data)
}

export async function deleteUser(id) {
  await apiFetch(`/users/${id}`, { method: 'DELETE' })
}

/**
 * Demo credentials shown on the login page, sourced from the frontend's own
 * env (VITE_ADMIN_EMAIL / VITE_ADMIN_PASSWORD). These should match the
 * backend's ADMIN_EMAIL / ADMIN_PASSWORD so the "fill admin credentials"
 * button actually works against the seeded Keeper account.
 */
export function getDemoCredentials() {
  const ENV = (typeof import.meta !== 'undefined' && import.meta.env) || {}
  const email = ENV.VITE_ADMIN_EMAIL
  const password = ENV.VITE_ADMIN_PASSWORD
  if (!email || !password) return null
  return { email, password, fromEnv: true }
}
