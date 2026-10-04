import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { downloadEbook, ebookFilename, fetchEbookObjectUrl, releaseObjectUrl } from '../api/library'
import { useToast } from '../context/ToastContext'

/**
 * In-page reader for a stored (admin-uploaded) volume.
 *
 * The PDF is fetched with the member's bearer token and shown from a Blob URL,
 * so the file itself is never a public link — an account without a paid
 * initiation gets a 402 from the API and sees the sealed notice instead.
 */
export default function EbookViewer({ book, open, onClose }) {
  const { t } = useTranslation()
  const toast = useToast()
  const [state, setState] = useState({ status: 'loading', url: '', error: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !book) return undefined
    let alive = true
    let created = ''
    setState({ status: 'loading', url: '', error: '' })

    fetchEbookObjectUrl(book, { inline: true })
      .then((url) => {
        created = url
        if (alive) setState({ status: 'ready', url, error: '' })
        else releaseObjectUrl(url)
      })
      .catch((err) => { if (alive) setState({ status: 'error', url: '', error: err.message }) })

    return () => {
      alive = false
      releaseObjectUrl(created)
    }
  }, [open, book])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  const save = async () => {
    if (!book) return
    setSaving(true)
    try {
      await downloadEbook(book)
      toast(`${ebookFilename(book)} saved.`)
    } catch (err) {
      toast(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!book) return null

  return (
    <div
      className={`modal ebook-viewer${open ? ' open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
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
            {book.pages ? <span className="ebook-meta">{t('library.pages', { count: book.pages })}</span> : null}
          </div>
          <button type="button" className="ebook-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="ebook-stage">
          {state.status === 'loading' && (
            <div className="ebook-status"><span className="sigil-spinner" /><p>{t('library.viewerLoading')}</p></div>
          )}
          {state.status === 'error' && (
            <div className="ebook-status error">
              <span aria-hidden="true">🔒</span>
              <p>{state.error || t('library.viewerError')}</p>
            </div>
          )}
          {state.status === 'ready' && (
            <iframe className="ebook-frame" src={state.url} title={book.title} />
          )}
        </div>

        <div className="ebook-actions">
          <button type="button" className="btn-gold small" onClick={save} disabled={saving || state.status !== 'ready'}>
            {saving ? t('library.awaiting') : `${t('library.download')} ⤓`}
          </button>
          <button type="button" className="btn-ghost small" onClick={onClose}>{t('common.close')}</button>
        </div>
      </div>
    </div>
  )
}
