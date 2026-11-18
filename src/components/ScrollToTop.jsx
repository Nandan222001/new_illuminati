import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      return undefined
    }
    let id = hash.slice(1)
    try { id = decodeURIComponent(id) } catch { /* invalid escape: use the literal ID */ }
    const scroll = () => {
      const target = document.getElementById(id)
      if (!target) return false
      target.scrollIntoView({ behavior: 'instant' })
      return true
    }
    if (scroll()) return undefined
    // Lazy pages and signed-in previews can mount the anchor after navigation.
    const observer = new MutationObserver(() => { if (scroll()) observer.disconnect() })
    const main = document.getElementById('site-main')
    if (main) observer.observe(main, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [pathname, hash])
  return null
}
