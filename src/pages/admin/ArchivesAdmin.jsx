import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../../context/ContentContext'
import { useToast } from '../../context/ToastContext'
import Img from '../../components/Img'

const EMPTY = { title: '', desc: '', img: '', era: '', cap: '', body: '', category: 'free' }

/**
 * Archive records (the chambers). Built-in chambers are translated; records
 * added here are shown as-is from the API, so an archive can be published the
 * same day without a deploy.
 */
export default function AdminArchives() {
  const { archives, hiddenArchives, addArchive, updateArchive, deleteArchive, restoreArchive } = useContent()
  const toast = useToast()
  const [form, setForm] = useState(EMPTY)
  const [showHidden, setShowHidden] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.img.trim()) { toast('Title and image URL are required.'); return }
    await addArchive({
      title: form.title,
      desc: form.desc,
      img: form.img,
      category: form.category,
      era: form.era.trim() || 'Chamber',
      cap: form.cap,
      body: form.body,
    })
    toast(`"${form.title}" opened as ${form.category === 'paid' ? 'PAID' : 'FREE'}.`)
    setForm(EMPTY)
  }

  const toggleCategory = async (a) => {
    const next = a.category === 'paid' ? 'free' : 'paid'
    await updateArchive(a.id, { category: next })
    toast(`"${a.title}" is now ${next.toUpperCase()}.`)
  }

  const remove = async (a) => {
    await deleteArchive(a.id)
    toast(a.custom ? `"${a.title}" deleted.` : `"${a.title}" removed from the site (can be restored).`)
  }

  return (
    <>
      <div className="admin-head">
        <h1>ARCHIVE RECORDS</h1>
        <p>{archives.length} chambers listed. Add a record with its image, caption and body text.</p>
      </div>

      <section className="admin-card">
        <h3>ADD A CHAMBER</h3>
        <form className="form upload-form" onSubmit={submit}>
          <div className="form-row">
            <label><span>TITLE</span><input type="text" placeholder="THE SEVENTH CHAMBER" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label><span>ERA / CHAMBER LABEL</span><input type="text" placeholder="Chamber VII" value={form.era} onChange={(e) => setForm({ ...form, era: e.target.value })} /></label>
          </div>
          <label><span>IMAGE URL</span><input type="text" placeholder="/assets/your-image.jpg or https://…" value={form.img} onChange={(e) => setForm({ ...form, img: e.target.value })} /></label>
          <div className="form-row">
            <label><span>SHORT DESCRIPTION</span><input type="text" placeholder="One line shown on the card" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} /></label>
            <label><span>CAPTION</span><input type="text" placeholder="Knowledge · Truth · Passage" value={form.cap} onChange={(e) => setForm({ ...form, cap: e.target.value })} /></label>
          </div>
          <label><span>BODY (the record itself)</span><input type="text" placeholder="What the chamber holds…" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></label>
          <div className="form-row three">
            <label><span>CATEGORY</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="free">FREE</option>
                <option value="paid">PAID (sealed)</option>
              </select>
            </label>
            <div /><div className="upload-submit"><button type="submit" className="btn-gold full">OPEN CHAMBER ▲</button></div>
          </div>
        </form>
      </section>

      <div className="admin-toolbar">
        <label className="check inline"><input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} /><span>Show removed records</span></label>
      </div>

      <div className="content-grid">
        {archives.map((a) => (
          <div className={`content-row${a.category === 'paid' ? ' sealed' : ''}`} key={a.id}>
            <div className="content-thumb"><Img src={a.img} alt={a.title} /></div>
            <div className="content-body">
              <span className="tag fact">{a.era || 'CHAMBER'}</span>
              {a.custom && <span className="tag custom">CUSTOM</span>}
              <h5>{a.title}</h5>
              <Link to={`/archives/${a.slug}`} className="sec-link">VIEW ›</Link>
            </div>
            <div className="content-actions">
              <label className="switch">
                <input type="checkbox" checked={a.category === 'paid'} onChange={() => toggleCategory(a)} />
                <i /><span>{a.category === 'paid' ? 'PAID' : 'FREE'}</span>
              </label>
              <button type="button" className="btn-danger small" onClick={() => remove(a)}>DELETE</button>
            </div>
          </div>
        ))}
      </div>

      {showHidden && (
        <>
          <h3 className="admin-subhead">REMOVED RECORDS</h3>
          {hiddenArchives.length === 0 ? <p className="empty">Nothing removed.</p> : (
            <div className="restore-list">
              {hiddenArchives.map((a) => (
                <div className="restore-row" key={a.id}>
                  <span>{a.title}</span>
                  <button type="button" className="btn-ghost small" onClick={async () => { await restoreArchive(a.id); toast('Restored.') }}>RESTORE</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
