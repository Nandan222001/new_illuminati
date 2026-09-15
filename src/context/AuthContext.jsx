import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  ROLES,
  changeRole as changeRoleRequest,
  deleteUser as deleteUserRequest,
  fetchMe,
  hasSession,
  listUsers,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  sealInitiation,
  updateProfile as updateProfileRequest,
} from '../auth/authService'
import { TOKEN_STORAGE_KEY } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [ready, setReady] = useState(false)

  const isAdmin = user?.role === ROLES.ADMIN

  const refreshUsers = useCallback(async () => {
    try {
      setUsers(await listUsers())
    } catch {
      setUsers([])
    }
  }, [])

  const loadIdentity = useCallback(async () => {
    if (!hasSession()) {
      setUser(null)
      setUsers([])
      return
    }
    try {
      const me = await fetchMe()
      setUser(me)
      if (me.role === ROLES.ADMIN) await refreshUsers()
      else setUsers([])
    } catch {
      setUser(null)
      setUsers([])
    }
  }, [refreshUsers])

  useEffect(() => {
    let alive = true
    loadIdentity().finally(() => { if (alive) setReady(true) })
    const onStorage = (e) => { if (e.key === TOKEN_STORAGE_KEY) loadIdentity() }
    window.addEventListener('storage', onStorage)
    return () => {
      alive = false
      window.removeEventListener('storage', onStorage)
    }
  }, [loadIdentity])

  const login = useCallback(async (credentials) => {
    const me = await loginRequest(credentials)
    setUser(me)
    if (me.role === ROLES.ADMIN) await refreshUsers()
    return me
  }, [refreshUsers])

  const register = useCallback(async (data) => {
    const me = await registerRequest(data)
    setUser(me)
    setUsers([])
    return me
  }, [])

  const logout = useCallback(() => {
    logoutRequest()
    setUser(null)
    setUsers([])
  }, [])

  const updateRole = useCallback(async (id, role) => {
    const updated = await changeRoleRequest(id, role)
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
  }, [])

  const removeUser = useCallback(async (id) => {
    await deleteUserRequest(id)
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }, [])

  const updateProfile = useCallback(async (patch) => {
    const updated = await updateProfileRequest(patch)
    setUser(updated)
    return updated
  }, [])

  const completeInitiation = useCallback(async () => {
    const updated = await sealInitiation()
    setUser(updated)
    return updated
  }, [])

  const value = useMemo(() => ({
    ready,
    user,
    users,
    isAdmin,
    login,
    register,
    logout,
    updateRole,
    removeUser,
    updateProfile,
    completeInitiation,
  }), [ready, user, users, isAdmin, login, register, logout, updateRole, removeUser, updateProfile, completeInitiation])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
