import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackVisit } from '../utils/analytics'

/** Beacon a visit event on every route change (session-deduped per path). */
export default function usePageView() {
  const { pathname } = useLocation()
  useEffect(() => { trackVisit(pathname) }, [pathname])
}
