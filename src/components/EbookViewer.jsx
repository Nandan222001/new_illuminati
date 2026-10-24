import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchEbookData } from '../api/library'
import { useAuth } from '../context/AuthContext'

/**
 * Read-only in-page reader for a stored (admin-uploaded) volume.
 *
 * Pages are drawn onto canvases with pdf.js — there is no text layer, so the
 * words cannot be selected or copied, and there is deliberately no download
 * button. The volume is fetched with the member's bearer token (a non-paid
 * account gets a 402 and sees the sealed notice) and is never turned into a
 * downloadable link. Right-click, drag, copy and print are blocked inside the
 * reader, and a faint watermark carries the reader's email.
 *
 * Honest limit: nothing in a browser can stop a screenshot or a determined
 * developer-tools user; this removes every ordinary way to save or copy the book.
 */
const MAX_SCALE = 2

async function loadPdfjs() {
  const [pdfjs, worker] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ])
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default
  return pdfjs
}

export default function EbookViewer({ book, open, onClose }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const stageRef = useRef(null)
  const pagesRef = useRef(null)
  const [state, setState] = useState({ status: 'loading', error: '', pages: 0 })

  useEffect(() => {
    if (!open || !book) return undefined
    let alive = true
    let doc = null
    setState({ status: 'loading', error: '', pages: 0 })
    if (pagesRef.current) pagesRef.current.innerHTML = ''

    ;(async () => {
      try {
        const data = await fetchEbookData(book)
        const bytes = new Uint8Array(data)
        if (String.fromCharCode(...bytes.slice(0, 4)) !== '%PDF') {
          throw new Error(t('library.viewerPdfOnly'))
        }
        const pdfjs = await loadPdfjs()
        doc = await pdfjs.getDocument({ data: bytes }).promise
        if (!alive) return
        setState({ status: 'ready', error: '', pages: doc.numPages })

        const container = pagesRef.current
        const width = Math.max(280, (stageRef.current?.clientWidth || 600) - 24)
        const ratio = Math.min(window.devicePixelRatio || 1, MAX_SCALE)
        for (let n = 1; n <= doc.numPages && alive; n += 1) {
          const page = await doc.getPage(n)
          const base = page.getViewport({ scale: 1 })
          const scale = width / base.width
          const viewport = page.getViewport({ scale: scale * ratio })
          const canvas = document.createElement('canvas')
          canvas.className = 'ebook-page'
          canvas.width = Math.floor(viewport.width)
          canvas.height = Math.floor(viewport.height)
          canvas.style.width = `${Math.floor(viewport.width / ratio)}px`
          canvas.style.height = `${Math.floor(viewport.height / ratio)}px`
          container.appendChild(canvas)
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
        }
      } catch (err) {
        if (alive) setState({ status: 'error', error: err.message, pages: 0 })
      }
    })()

    return () => {
      alive = false
      try { doc?.destroy() } catch { /* already gone */ }
      if (pagesRef.current) pagesRef.current.innerHTML = ''
    }
  }, [open, book, t])

  useEffect(() => {
    if (!open) return undefined
    const block = (e) => e.preventDefault()
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      // copy / save / print / select-all
      if ((e.ctrlKey || e.metaKey) && ['c', 's', 'p', 'a', 'x'].includes(e.key.toLowerCase())) e.preventDefault()
    }
    window.addEventListener('keydown', onKey, true)
    document.addEventListener('copy', block, true)
    document.addEventListener('cut', block, true)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.classList.add('ebook-open')
    return () => {
      window.removeEventListener('keydown', onKey, true)
      document.removeEventListener('copy', block, true)
      document.removeEventListener('cut', block, true)
      document.body.style.overflow = previous
      document.body.classList.remove('ebook-open')
    }
  }, [open, onClose])

  if (!book) return null
  const mark = user?.email || ''

  return (
    <div
      className={`modal ebook-viewer${open ? ' open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      onContextMenu={(e) => e.preventDefault()}
      role="dialog"
      aria-modal="true"
      aria-label={book.title}
      aria-hidden={!open}
    >
      <div className="modal-box ebook-modal">
        <div className="ebook-head">
          <div>
            <span className="ebook-kicker">{t('library.title')}</span>
            <h3>{book.title}</h3>
            {state.pages ? <span className="ebook-meta">{t('library.pages', { count: state.pages })}</span> : null}
          </div>
          <button type="button" className="ebook-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="ebook-stage" ref={stageRef} onDragStart={(e) => e.preventDefault()}>
          {state.status === 'loading' && (
            <div className="ebook-status"><span className="sigil-spinner" /><p>{t('library.viewerLoading')}</p></div>
          )}
          {state.status === 'error' && (
            <div className="ebook-status error">
              <span aria-hidden="true">🔒</span>
              <p>{state.error || t('library.viewerError')}</p>
            </div>
          )}
          <div className="ebook-pages" ref={pagesRef} />
          {mark && state.status === 'ready' && <div className="ebook-watermark" aria-hidden="true">{Array.from({ length: 40 }, (_, i) => <span key={i}>{mark}</span>)}</div>}
        </div>

        <div className="ebook-actions">
          <span className="ebook-readonly">🔒 {t('library.readOnlyNote')}</span>
          <button type="button" className="btn-ghost small" onClick={onClose}>{t('common.close')}</button>
        </div>
      </div>
    </div>
  )
}
