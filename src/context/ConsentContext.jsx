import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { readConsent, saveConsent } from '../utils/consent'

const ConsentContext = createContext(null)

export function ConsentProvider({ children }) {
  const [consent, setConsent] = useState(() => readConsent())
  const accept = useCallback(() => setConsent(saveConsent()), [])
  const value = useMemo(() => ({ consent, accept }), [consent, accept])
  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}

export function useConsent() {
  const ctx = useContext(ConsentContext)
  if (!ctx) throw new Error('useConsent must be used inside <ConsentProvider>')
  return ctx
}
