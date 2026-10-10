import { useEffect } from 'react'

/**
 * Site-wide content protection layer.
 * - Disables right-click context menu
 * - Blocks common dev-tools keyboard shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U)
 * - Prevents copy/cut on protected elements
 * - Blocks drag-start on images and other content
 * - Disables text selection via CSS (see App.css .terms-doc user-select rules)
 *
 * Note: client-side protections are a deterrent, not a guarantee.
 * A determined user can always bypass them. They stop casual copying.
 */
export default function ContentProtection() {
  useEffect(() => {
    /* ---- 1. Disable right-click context menu ---- */
    const onContextMenu = (e) => { e.preventDefault() }
    document.addEventListener('contextmenu', onContextMenu)

    /* ---- 2. Block dev-tools / source-view shortcuts ---- */
    const blockedCombos = new Set([
      'F12',
      'Control+Shift+I',
      'Control+Shift+J',
      'Control+Shift+C',
      'Control+U',
      'Meta+Alt+I',
      'Meta+Alt+J',
      'Meta+Alt+C',
      'Meta+U',
    ])

    const onKeyDown = (e) => {
      const parts = []
      if (e.ctrlKey || e.metaKey) parts.push(e.metaKey ? 'Meta' : 'Control')
      if (e.shiftKey) parts.push('Shift')
      if (e.altKey) parts.push('Alt')
      parts.push(e.key)
      const combo = parts.join('+')
      if (blockedCombos.has(combo)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    document.addEventListener('keydown', onKeyDown)

    /* ---- 3. Prevent copy / cut / drag on protected elements ---- */
    const protectEvent = (e) => {
      const target = e.target
      if (target && (
        target.closest('.terms-doc') ||
        target.closest('.consent-scroll') ||
        target.closest('.step-card') ||
        target.closest('.rules-wellbeing') ||
        target.closest('.rules-consent') ||
        target.closest('.cd-big') ||
        target.closest('.cd-members') ||
        target.closest('.stat-value') ||
        target.closest('.hero h1')
      )) {
        e.preventDefault()
      }
    }
    const onCopy = protectEvent
    const onCut = protectEvent
    const onDragStart = (e) => {
      if (e.target && e.target.tagName === 'IMG') {
        e.preventDefault()
      }
    }
    document.addEventListener('copy', onCopy)
    document.addEventListener('cut', onCut)
    document.addEventListener('dragstart', onDragStart)

    /* ---- 4. Block print-screen hint (best-effort) ---- */
    const onPrintScreen = (e) => {
      if (e.key === 'PrintScreen') {
        e.preventDefault()
        /* Attempt to clear clipboard (best-effort, may fail due to permissions) */
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('').catch(() => {})
        }
      }
    }
    document.addEventListener('keydown', onPrintScreen)

    /* ---- Cleanup ---- */
    return () => {
      document.removeEventListener('contextmenu', onContextMenu)
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keydown', onPrintScreen)
      document.removeEventListener('copy', onCopy)
      document.removeEventListener('cut', onCut)
      document.removeEventListener('dragstart', onDragStart)
    }
  }, [])

  return null
}
