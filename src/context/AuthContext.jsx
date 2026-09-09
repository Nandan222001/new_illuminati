import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  ROLES,
  SESSION_KEY,
  USERS_KEY,
  changeRole,
  deleteUser,
  ensureSeeded,
  getSession,
  getUsers,
  login as loginRequest,
  publicUser,
  register as registerRequest,
  setSession,
  updateUser,
} from '../auth/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [users, setUsers] = useState([])
  const [session, setSessionState] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    ensureSeeded().then((seeded) => {
      if (!alive) return
      setUsers(seeded)
      setSessionState(getSession())
      setReady(true)
    })
    // Keep tabs in sync (another tab logging out, admin changing roles, ...)
    const onStorage = (e) => {
      if (e.key === USERS_KEY) setUsers(getUsers())
      if (e.key === SESSION_KEY) setSessionState(getSession())
    }
    window.addEventListener('storage', onStorage)
    return () => {
      alive = false
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const rawUser = useMemo(
    () => (session ? users.find((u) => u.id === session.userId) || null : null),
    [users, session],
  )

  // Session points at a user that no longer exists (banished) -> clear it.
  useEffect(() => {
    if (ready && session && !rawUser) {
      setSession(null)
      setSessionState(null)
    }
  }, [ready, session, rawUser])

  const startSession = useCallback((user) => {
    const next = { userId: user.id, startedAt: new Date().toISOString() }
    setSession(next)
    setSessionState(next)
  }, [])

  const login = useCallback(async (credentials) => {
    const user = await loginRequest(credentials)
    setUsers(getUsers())
    startSession(user)
    return publicUser(user)
  }, [startSession])

  const register = useCallback(async (data) => {
    const user = await registerRequest(data)
    setUsers(getUsers())
    startSession(user)
    return publicUser(user)
  }, [startSession])

  const logout = useCallback(() => {
    setSession(null)
    setSessionState(null)
  }, [])

  const updateRole = useCallback((id, role) => {
    setUsers(changeRole(id, role, rawUser?.id))
  }, [rawUser])

  const removeUser = useCallback((id) => {
    setUsers(deleteUser(id, rawUser?.id))
  }, [rawUser])

  const updateProfile = useCallback((patch) => {
    if (!rawUser) throw new Error('You are not signed in.')
    const name = String(patch.name ?? rawUser.name).trim()
    if (name.length < 2) throw new Error('Your name must be at least 2 characters.')
    setUsers(updateUser(rawUser.id, { name }))
  }, [rawUser])

  const value = useMemo(() => ({
    ready,
    user: publicUser(rawUser),
    users: users.map(publicUser),
    isAdmin: rawUser?.role === ROLES.ADMIN,
    login,
    register,
    logout,
    updateRole,
    removeUser,
    updateProfile,
  }), [ready, rawUser, users, login, register, logout, updateRole, removeUser, updateProfile])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
