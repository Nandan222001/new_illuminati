import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const ToastContext = createContext(() => {})

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)
  const timer = useRef(null)

  const toast = useCallback((msg) => {
    setMessage(msg)
    setVisible(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setVisible(false), 2600)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className={`toast${visible ? ' show' : ''}`} role="status" aria-live="polite">{message}</div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
