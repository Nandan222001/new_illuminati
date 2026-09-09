import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'

const CONTENT_KEY = 'ib_content_v1'

/** Items sealed for members only until an admin changes it. */
const DEFAULT_LOCKS = {
  'the-black-sun-vigil': true,
  'council-of-thirteen': true,
  'the-last-screening': true,
}

const ContentContext = createContext(null)

function readLocks() {
  try {
    const raw = localStorage.getItem(CONTENT_KEY)
    return raw ? { ...DEFAULT_LOCKS, ...JSON.parse(raw) } : DEFAULT_LOCKS
  } catch {
    return DEFAULT_LOCKS
  }
}

export function ContentProvider({ children }) {
  const { user } = useAuth()
  const [locks, setLocks] = useState(readLocks)

  useEffect(() => {
    const onStorage = (e) => { if (e.key === CONTENT_KEY) setLocks(readLocks()) }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setLocked = useCallback((id, locked) => {
    setLocks((prev) => {
      const next = { ...prev, [id]: !!locked }
      localStorage.setItem(CONTENT_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const value = useMemo(() => ({
    locks,
    isLocked: (id) => !!locks[id],
    /** Sealed content is visible to any signed-in initiate. */
    canAccess: (id) => !locks[id] || !!user,
    setLocked,
  }), [locks, user, setLocked])

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used inside <ContentProvider>')
  return ctx
}
