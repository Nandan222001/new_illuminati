import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../../context/ContentContext'
import { useToast } from '../../context/ToastContext'
import Img from '../../components/Img'

const EMPTY = { title: '', desc: '', img: '', file: '', pages: '', format: 'pdf', category: 'free' }

/** E-book shelf: add a volume, paste its file/link, mark it FREE or PAID. */
export default function AdminBooks() {
  const { books, hiddenBooks, addBook, updateBook, deleteBook, restoreBook } = useContent()
  const toast = useToast()
  const [form, setForm] = useState(EMPTY)
  const [showHidden, setShowHidden] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { toast('A title is required.'); return }
    if (!form.img.trim()) { toast('A cover image URL is required.'); return }
    if (!form.file.trim()) { toast('Paste the PDF or library link for this volume.'); return }
    await addBook({ ...form, pages: Number(form.pages) || null })
    toast(`"${form.title}" shelved as ${form.category === 'paid' ? 'PAID' : 'FREE'}.`)
    setForm(EMPTY)
  }

  const toggleCategory = async (b) => {
    const next = b.category === 'paid' ? 'free' : 'paid'
    await updateBook(b.id, { category: next })
    toast(`"${b.title}" is now ${next.toUpperCase()}.`)
  }

  const remove = async (b) => {
    await deleteBook(b.id)
    toast(b.custom ? `"${b.title}" removed from the shelf.` : `"${b.title}" hidden (can be restored).`)
  }

  return (
    <>
      <div className="admin-head">
        <h1>E-BOOKS</h1>
        <p>{books.length} volumes on the Library shelf. Link a PDF or reading page and choose FREE or PAID.</p>
      </div>

      <section className="admin-card">
        <h3>ADD A VOLUME</h3>
        <form className="form upload-form" onSubmit={submit}>
          <div className="form-row">
            <label><span>TITLE</span><input type="text" placeholder="The Book of the Thirteenth Seat" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label><span>PAGES</span><input type="text" inputMode="numeric" placeholder="148" value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })} /></label>
          </div>
          <label><span>COVER IMAGE URL</span><input type="text" placeholder="/assets/your-cover.jpg or https://…" value={form.img} onChange={(e) => setForm({ ...form, img: e.target.value })} /></label>
          <label><span>FILE / READING LINK (PDF, EPUB or a hosted reader URL)</span><input type="text" placeholder="https://…/volume.pdf" value={form.file} onChange={(e) => setForm({ ...form, file: e.target.value })} /></label>
          <label><span>DESCRIPTION</span><input type="text" placeholder="One line about the volume" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} /></label>
          <div className="form-row three">
            <label><span>FORMAT</span>
              <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}>
                <option value="pdf">PDF</option>
                <option value="epub">EPUB</option>
                <option value="web">WEB READER</option>
              </select>
            </label>
            <label><span>CATEGORY</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="free">FREE</option>
                <option value="paid">PAID (sealed)</option>
              </select>
            </label>
            <div className="upload-submit"><button type="submit" className="btn-gold full">SHELVE ▲</button></div>
          </div>
        </form>
      </section>

      <div className="admin-toolbar">
        <label className="check inline"><input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} /><span>Show removed volumes</span></label>
      </div>

      <div className="content-grid">
        {books.map((b) => (
          <div className={`content-row${b.category === 'paid' ? ' sealed' : ''}`} key={b.id}>
            <div className="content-thumb"><Img src={b.img} alt={b.title} /></div>
            <div className="content-body">
              <span className="tag fact">{b.format ? String(b.format).toUpperCase() : 'PDF'}</span>
              {b.custom && <span className="tag custom">CUSTOM</span>}
              <h5>{b.title}</h5>
              <span className="muted">{b.file ? 'LINKED' : 'NO FILE YET'}</span>
              <Link to="/archives#library" className="sec-link">VIEW ›</Link>
            </div>
            <div className="content-actions">
              <label className="switch">
                <input type="checkbox" checked={b.category === 'paid'} onChange={() => toggleCategory(b)} />
                <i /><span>{b.category === 'paid' ? 'PAID' : 'FREE'}</span>
              </label>
              <button type="button" className="btn-danger small" onClick={() => remove(b)}>DELETE</button>
            </div>
          </div>
        ))}
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
    </>
  )
}
