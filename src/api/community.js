/**
 * Community threads — the viewers' discussion board and the private
 * one-to-one channel between an initiate and the Keepers.
 *
 * Visibility rules (enforced here and again by the API):
 *   • an initiate only ever sees threads they opened;
 *   • a Keeper sees every thread;
 *   • no third member can read a thread they are not part of.
 *
 * When the backend is unreachable the same rules run against a local
 * browser store, so the board still works on a frontend-only deployment
 * (threads then live on that one device only).
 */
import { apiFetch } from './client'

const LOCAL_KEY = 'ib_threads_v1'
const EVENT = 'ib:threads-updated'
export const THREAD_STATUS = { OPEN: 'open', ANSWERED: 'answered' }

function readLocal() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_KEY))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocal(threads) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(threads)) } catch { /* private mode */ }
  try { window.dispatchEvent(new CustomEvent(EVENT)) } catch { /* SSR */ }
  return threads
}

export function onThreadsChanged(handler) {
  window.addEventListener(EVENT, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(EVENT, handler)
    window.removeEventListener('storage', handler)
  }
}

export function isMine(thread, user) {
  if (!thread || !user) return false
  if (thread.userId != null && user.id != null) return String(thread.userId) === String(user.id)
  return thread.userEmail && user.email ? thread.userEmail === user.email : false
}

/** A thread is readable by its author and by Keepers — never by a third member. */
export function canRead(thread, user, isAdmin) {
  return Boolean(isAdmin || isMine(thread, user))
}

function localCreate(user, subject, body) {
  const now = new Date().toISOString()
  const thread = {
    id: `t${Date.now()}`,
    subject: subject || null,
    userId: user?.id ?? null,
    userEmail: user?.email ?? null,
    userName: user?.name ?? 'Initiate',
    status: THREAD_STATUS.OPEN,
    createdAt: now,
    updatedAt: now,
    messages: [{ id: `m${Date.now()}`, author: user?.name ?? 'Initiate', role: user?.role ?? 'member', body, at: now }],
  }
  writeLocal([thread, ...readLocal()])
  return thread
}

export async function listThreads({ user, isAdmin }) {
  try {
    const data = await apiFetch('/community/threads', { timeoutMs: 5000 })
    const threads = Array.isArray(data) ? data : []
    return threads.filter((thread) => canRead(thread, user, isAdmin))
  } catch {
    const threads = readLocal()
    return isAdmin ? threads : threads.filter((thread) => isMine(thread, user))
  }
}

export async function createThread({ user, subject, body }) {
  try {
    return await apiFetch('/community/threads', { method: 'POST', body: { subject: subject || null, body } })
  } catch {
    return localCreate(user, subject, body)
  }
}

export async function addMessage({ threadId, user, body }) {
  try {
    return await apiFetch(`/community/threads/${threadId}/messages`, { method: 'POST', body: { body } })
  } catch {
    const now = new Date().toISOString()
    const message = { id: `m${Date.now()}`, author: user?.name ?? 'Initiate', role: user?.role ?? 'member', body, at: now }
    const threads = readLocal().map((thread) => (
      String(thread.id) === String(threadId)
        ? { ...thread, status: user?.role === 'admin' ? THREAD_STATUS.ANSWERED : thread.status, updatedAt: now, messages: [...thread.messages, message] }
        : thread
    ))
    writeLocal(threads)
    return message
  }
}

export async function setThreadStatus({ threadId, status }) {
  try {
    return await apiFetch(`/community/threads/${threadId}/status`, { method: 'PATCH', body: { status } })
  } catch {
    const threads = readLocal().map((thread) => (
      String(thread.id) === String(threadId) ? { ...thread, status, updatedAt: new Date().toISOString() } : thread
    ))
    writeLocal(threads)
    return null
  }
}

/** Shape check for API payloads, so the UI never crashes on a partial record. */
export function normalizeThread(thread) {
  if (!thread) return null
  return {
    id: thread.id,
    subject: thread.subject || null,
    userId: thread.userId ?? thread.user_id ?? null,
    userEmail: thread.userEmail ?? thread.user_email ?? null,
    userName: thread.userName ?? thread.user_name ?? 'Initiate',
    status: thread.status || THREAD_STATUS.OPEN,
    createdAt: thread.createdAt ?? thread.created_at ?? null,
    updatedAt: thread.updatedAt ?? thread.updated_at ?? null,
    messages: (thread.messages || []).map((m) => ({
      id: m.id,
      author: m.author ?? m.author_name ?? 'Initiate',
      role: m.role ?? m.author_role ?? 'member',
      body: m.body,
      at: m.at ?? m.created_at ?? null,
    })),
  }
}
