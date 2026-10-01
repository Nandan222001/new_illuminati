import { useEffect, useLayoutEffect } from 'react'

// Avoid React's server-render warning while retaining synchronous DOM work in
// the browser. The static-render shim intentionally has no createElement().
const useIsomorphicLayoutEffect = typeof window !== 'undefined'
  && typeof document !== 'undefined'
  && typeof document.createElement === 'function'
  ? useLayoutEffect
  : useEffect

export default useIsomorphicLayoutEffect
