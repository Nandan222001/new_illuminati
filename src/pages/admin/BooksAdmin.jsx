import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../../context/ContentContext'
import { useToast } from '../../context/ToastContext'
import Img from '../../components/Img'
import EbookViewer from '../../components/EbookViewer'
import {
  ACCEPTED_EBOOK_ATTR,
  deleteStoredEbook,
  fetchEbookObjectUrl,
  fetchLibraryLimits,
  formatBytes,
  isStoredEbook,
  listStoredEbooks,
  releaseObjectUrl,
  uploadEbook,
  validateEbookFile,
} from '../../api/library'

const EMPTY = { title: '', desc: '', img: '', file: '', pages: '', format: 'pdf', category: 'paid' }

/**
 * E-book shelf — the Keeper uploads a PDF here and chooses who may read it.
 *
 * PAID volumes are sealed: the API refuses to hand the file to anyone who is
 * not a signed-in member with a paid initiation (see
 * backend/app/api/v1/endpoints/library.py). FREE volumes are downloadable by
 * every visitor. Uploaded files are stored on the API server, so this form
 * does two steps: write the file to the shelf, then shelve the volume record.
 */
export default function AdminBooks() {
  const { books, hiddenBooks, addBook, updateBook, deleteBook, restoreBook, attachBookFile } = useContent()
  const toast = useToast()
  const [form, setForm] = useState(EMPTY)
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [busy, setBusy] = useState('')
  const [dragging, setDragging] = useState(false)
  const [showHidden, setShowHidden] = useState(false)
  const [limits, setLimits] = useState(null)
  const [stored, setStored] = useState([])
  const [previewBook, setPreviewBook] = useState(null)

  const fileInput = useRef(null)
  const replaceInput = useRef(null)
  const replaceTarget = useRef(null)

  const refreshStored = useCallback(async () => {
    try {
      setStored(await listStoredEbooks())
    } catch {
      setStored([])
    }
  }, [])

  useEffect(() => {
    fetchLibraryLimits().then(setLimits)
    refreshStored()
  }, [refreshStored])

  const limitLabel = limits ? `Max ${limits.maxSizeMb} MB · ${limits.label}` : 'PDF · up to 100 MB'

  const pickFile = (chosen) => {
    if (!chosen) return
    const problem = validateEbookFile(chosen, limits || undefined)
    if (problem) { toast(problem); return }
    setFile(chosen)
    setProgress(0)
    if (!form.title.trim()) {
      setForm((prev) => ({ ...prev, title: chosen.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ') }))
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { toast('A title is required.'); return }
    if (!form.img.trim()) { toast('A cover image URL is required.'); return }
    if (!file && !form.file.trim()) { toast('Choose a PDF to upload, or paste a link to a hosted volume.'); return }

    setBusy('create')
    try {
      let uploaded = null
      if (file) {
        setProgress(1)
        uploaded = await uploadEbook(file, { onProgress: setProgress })
      }
      const created = await addBook({ ...form, pages: Number(form.pages) || null, file: '' })
      if (uploaded && created?.id !== undefined) {
        await attachBookFile(created.id, uploaded.key, uploaded.filename)
      }
      toast(uploaded
        ? `"${form.title}" shelved with its ${formatBytes(uploaded.size)} volume as ${form.category === 'paid' ? 'PAID' : 'FREE'}.`
        : `"${form.title}" shelved as ${form.category === 'paid' ? 'PAID' : 'FREE'}.`)
      setForm(EMPTY)
      setFile(null)
      setProgress(0)
      if (fileInput.current) fileInput.current.value = ''
      refreshStored()
    } catch (err) {
      toast(err.message)
    } finally {
      setBusy('')
      setProgress(0)
    }
  }

  const startReplace = (book) => {
    replaceTarget.current = book
    replaceInput.current?.click()
  }

  const onReplacePicked = async (e) => {
    const chosen = e.target.files?.[0]
    const book = replaceTarget.current
    e.target.value = ''
    if (!chosen || !book) return
    const problem = validateEbookFile(chosen, limits || undefined)
    if (problem) { toast(problem); return }

    setBusy(`replace-${book.id}`)
    try {
      const uploaded = await uploadEbook(chosen, { onProgress: (p) => setProgress(p) })
      await attachBookFile(book.id, uploaded.key, uploaded.filename)
      toast(`"${book.title}" now serves ${uploaded.filename}.`)
      refreshStored()
    } catch (err) {
      toast(err.message)
    } finally {
      setBusy('')
      setProgress(0)
    }
  }

  const openBook = async (book) => {
    if (!isStoredEbook(book)) {
      if (book.file) window.open(book.file, '_blank', 'noopener')
      else toast('This volume has no file attached yet.')
      return
    }
    setPreviewBook(book)
  }

  const remove = async (b) => {
    await deleteBook(b.id)
    toast(b.custom ? `"${b.title}" removed from the shelf.` : `"${b.title}" hidden (can be restored).`)
    refreshStored()
  }

  const dropStored = async (entry) => {
    try {
      await deleteStoredEbook(entry.key)
      toast('File removed from the upload shelf.')
      refreshStored()
    } catch (err) {
      toast(err.message)
    }
  }

  const peek = async (entry) => {
    try {
      const url = await fetchEbookObjectUrl({ file_key: entry.key })
      window.open(url, '_blank', 'noopener')
      setTimeout(() => releaseObjectUrl(url), 60000)
    } catch (err) {
      toast(err.message)
    }
  }

  const bookFor = (key) => books.find((b) => b.file_key === key)

  return (
    <>
      <div className="admin-head">
        <h1>E-BOOKS</h1>
        <p>{books.length} volumes on the Library shelf. Upload a PDF here and mark it <b>PAID</b> — sealed volumes are only served to members whose initiation payment is complete.</p>
      </div>

      <section className="admin-card">
        <h3>ADD A VOLUME</h3>
        <form className="form upload-form" onSubmit={submit}>
          <div className="form-row">
            <label><span>TITLE</span><input type="text" placeholder="The Book of the Thirteenth Seat" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label><span>PAGES</span><input type="text" inputMode="numeric" placeholder="148" value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })} /></label>
          </div>

          <div
            className={`upload-drop${dragging ? ' drag' : ''}${file ? ' has-file' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files?.[0]) }}
          >
            <input
              ref={fileInput}
              type="file"
              accept={ACCEPTED_EBOOK_ATTR}
              onChange={(e) => pickFile(e.target.files?.[0])}
              aria-label="Choose the e-book PDF"
              hidden
            />
            {file ? (
              <>
                <b className="upload-file-name">❧ {file.name}</b>
                <span className="muted small-note">{formatBytes(file.size)} · ready to shelve</span>
                <div className="upload-drop-actions">
                  <button type="button" className="btn-ghost small" onClick={() => fileInput.current?.click()}>CHOOSE ANOTHER</button>
                  <button type="button" className="btn-ghost small" onClick={() => { setFile(null); setProgress(0) }}>REMOVE</button>
                </div>
              </>
            ) : (
              <>
                <b className="upload-file-name">⤒ UPLOAD THE PDF</b>
                <span className="muted small-note">Drop the file here or <button type="button" className="link-btn" onClick={() => fileInput.current?.click()}>browse the archive</button> · {limitLabel}</span>
              </>
            )}
            {progress > 0 && (
              <div className="upload-progress" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
                <i style={{ width: `${progress}%` }} />
                <span>{progress}%</span>
              </div>
            )}
          </div>

          <label><span>COVER IMAGE URL</span><input type="text" placeholder="/assets/your-cover.jpg or https://…" value={form.img} onChange={(e) => setForm({ ...form, img: e.target.value })} /></label>
          <label><span>OR LINK TO A HOSTED VOLUME (used only when no PDF is uploaded)</span><input type="text" placeholder="https://…/volume.pdf" value={form.file} onChange={(e) => setForm({ ...form, file: e.target.value })} /></label>
          <label><span>DESCRIPTION</span><input type="text" placeholder="One line about the volume" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} /></label>
          <div className="form-row three">
            <label><span>FORMAT</span>
              <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}>
                <option value="pdf">PDF</option>
                <option value="epub">EPUB</option>
                <option value="web">WEB READER</option>
              </select>
            </label>
            <label><span>ACCESS</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="paid">PAID — sealed members only</option>
                <option value="free">FREE — anyone</option>
              </select>
            </label>
            <div className="upload-submit">
              <button type="submit" className="btn-gold full" disabled={busy === 'create'}>
                {busy === 'create' ? 'SHELVING…' : 'SHELVE ▲'}
              </button>
            </div>
          </div>
          <p className="muted small-note">
            {form.category === 'paid'
              ? 'Sealed: the file is stored on the server and only served after the member’s ₹999 initiation payment is complete.'
              : 'Free: every visitor can read and download this volume.'}
          </p>
        </form>
      </section>

      <div className="admin-toolbar">
        <label className="check inline"><input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} /><span>Show removed volumes</span></label>
      </div>

      <div className="content-grid">
        {books.map((b) => {
          const stored = isStoredEbook(b)
          const hasFile = !!b.file || !!b.has_file
          return (
            <div className={`content-row${b.category === 'paid' ? ' sealed' : ''}`} key={b.id}>
              <div className="content-thumb"><Img src={b.img} alt={b.title} /></div>
              <div className="content-body">
                <span className="tag fact">{b.format ? String(b.format).toUpperCase() : 'PDF'}</span>
                {b.custom && <span className="tag custom">CUSTOM</span>}
                <h5>{b.title}</h5>
                <span className="muted">
                  {stored
                    ? `📄 ${b.file_name || 'PDF'}${b.file_size ? ` · ${formatBytes(b.file_size)}` : ''} · server-stored${b.downloads ? ` · ${b.downloads} downloads` : ''}`
                    : hasFile
                      ? '🔗 LINKED (external)'
                      : 'NO FILE YET'}
                </span>
                <div className="row-actions">
                  <button type="button" className="btn-ghost small" disabled={!hasFile} onClick={() => openBook(b)}>PREVIEW</button>
                  <button type="button" className="btn-ghost small" disabled={busy === `replace-${b.id}`} onClick={() => startReplace(b)}>
                    {busy === `replace-${b.id}` ? 'UPLOADING…' : (hasFile ? 'REPLACE PDF' : 'UPLOAD PDF')}
                  </button>
                  <Link to="/archives#library" className="btn-ghost small">VIEW</Link>
                </div>
              </div>
              <div className="content-actions">
                <label className="switch">
                  <input type="checkbox" checked={b.category === 'paid'} onChange={() => updateBook(b.id, { category: b.category === 'paid' ? 'free' : 'paid' }).then(() => toast(`"${b.title}" is now ${b.category === 'paid' ? 'FREE' : 'PAID'}.`))} />
                  <i /><span>{b.category === 'paid' ? 'PAID' : 'FREE'}</span>
                </label>
                <button type="button" className="btn-danger small" onClick={() => remove(b)}>DELETE</button>
              </div>
            </div>
          )
        })}
      </div>

      {showHidden && (
        <>
          <h3 className="admin-subhead">REMOVED VOLUMES</h3>
          {hiddenBooks.length === 0 ? <p className="empty">Nothing removed.</p> : (
            <div className="restore-list">
              {hiddenBooks.map((b) => (
                <div className="restore-row" key={b.id}>
                  <span>{b.title}</span>
                  <button type="button" className="btn-ghost small" onClick={async () => { await restoreBook(b.id); toast('Restored.') }}>RESTORE</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <section className="admin-card">
        <h3>ON THE UPLOAD SHELF ({stored.length})</h3>
        <p className="muted small-note">Files written to the API server by this console. Attached volumes are served only through the members-only library route; unattached files stay Keeper-only until a volume claims them.</p>
        {stored.length === 0 ? (
          <p className="empty">No files uploaded yet.</p>
        ) : (
          <div className="restore-list">
            {stored.map((entry) => {
              const owner = bookFor(entry.key)
              return (
                <div className="restore-row" key={entry.key}>
                  <span>
                    <b>{entry.key}</b>
                    <br />
                    <span className="muted small-note">
                      {formatBytes(entry.size)} · {new Date(entry.modified_at).toLocaleString()} ·{' '}
                      {owner
                        ? <>attached to “{owner.title}” {owner.category === 'paid' ? '(sealed)' : '(free)'}</>
                        : 'unattached — Keeper only'}
                    </span>
                  </span>
                  <span className="row-actions">
                    <button type="button" className="btn-ghost small" onClick={() => peek(entry)}>OPEN</button>
                    <button
                      type="button"
                      className="btn-danger small"
                      disabled={!!owner}
                      title={owner ? 'Detach it from its volume first.' : 'Delete this file from the shelf.'}
                      onClick={() => dropStored(entry)}
                    >
                      DELETE
                    </button>
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <input
        ref={replaceInput}
        type="file"
        accept={ACCEPTED_EBOOK_ATTR}
        onChange={onReplacePicked}
        aria-label="Replace this volume's PDF"
        hidden
      />

      <EbookViewer book={previewBook} open={!!previewBook} onClose={() => setPreviewBook(null)} />
    </>
  )
}
