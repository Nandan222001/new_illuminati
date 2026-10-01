import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { readConsent, saveConsent } from '../utils/consent'

const ConsentContext = createContext(null)

export function ConsentProvider({ children }) {
  // Keep the server render and the first hydrated render identical. Restore
  // the browser-only consent record immediately after hydration.
  const [consent, setConsent] = useState(null)
  useEffect(() => { setConsent(readConsent()) }, [])
  const accept = useCallback(() => setConsent(saveConsent()), [])
  const value = useMemo(() => ({ consent, accept }), [consent, accept])
  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}

export function useConsent() {
  const ctx = useContext(ConsentContext)
  if (!ctx) throw new Error('useConsent must be used inside <ConsentProvider>')
  return ctx
}
