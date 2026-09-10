import { useState } from 'react'
import { GALLERY } from '../../data/content'
import { useContent } from '../../context/ContentContext'
import { useToast } from '../../context/ToastContext'
import Img from '../../components/Img'

const EMPTY = { title: '', cap: '', img: '', portrait: false, category: 'free' }

export default function AdminImages() {
  const { gallery, hidden, addImage, updateImage, deleteImage, restoreItem, setCategory } = useContent()
  const toast = useToast()
  const [form, setForm] = useState(EMPTY)
  const [showHidden, setShowHidden] = useState(false)

  const hiddenSeed = GALLERY.filter((g) => hidden[g.id]).map((g) => ({ id: g.id, title: g.title }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.img.trim()) { toast('Title and image URL are required.'); return }
    addImage(form)
    toast(`"${form.title}" added as ${form.category === 'paid' ? 'PAID' : 'FREE'}.`)
    setForm(EMPTY)
  }

  const toggleCategory = (g) => {
    const next = g.category === 'paid' ? 'free' : 'paid'
    if (g.custom) updateImage(g.id, { category: next })
    else setCategory(g.id, next)
    toast(`"${g.title}" is now ${next.toUpperCase()}.`)
  }

  const remove = (g) => {
    deleteImage(g.id, g.custom)
    toast(g.custom ? `"${g.title}" deleted.` : `"${g.title}" removed from the site (can be restored).`)
  }

  return (
    <>
      <div className="admin-head">
        <h1>IMAGES</h1>
        <p>{gallery.length} key visuals in the gallery. Mark any image FREE or PAID.</p>
      </div>

      <section className="admin-card">
        <h3>ADD AN IMAGE</h3>
        <form className="form upload-form" onSubmit={submit}>
          <div className="form-row">
            <label><span>TITLE</span><input type="text" placeholder="The Second Seal" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label><span>CAPTION</span><input type="text" placeholder="Key visual · Chapter II" value={form.cap} onChange={(e) => setForm({ ...form, cap: e.target.value })} /></label>
          </div>
          <label><span>IMAGE URL</span><input type="text" placeholder="/assets/your-image.jpg or https://…" value={form.img} onChange={(e) => setForm({ ...form, img: e.target.value })} /></label>
          <div className="form-row three">
            <label><span>CATEGORY</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="free">FREE</option>
                <option value="paid">PAID (sealed)</option>
              </select>
            </label>
            <label className="check inline standalone"><input type="checkbox" checked={form.portrait} onChange={(e) => setForm({ ...form, portrait: e.target.checked })} /><span>Portrait crop</span></label>
            <div className="upload-submit"><button type="submit" className="btn-gold full">ADD IMAGE ▲</button></div>
          </div>
        </form>
      </section>

      <div className="admin-toolbar">
        <label className="check inline"><input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} /><span>Show removed seed images</span></label>
      </div>

      <div className="content-grid">
        {gallery.map((g) => (
          <div className={`content-row${g.category === 'paid' ? ' sealed' : ''}`} key={g.id}>
            <div className="content-thumb"><Img src={g.img} alt={g.title} /></div>
            <div className="content-body">
              {g.custom && <span className="tag custom">CUSTOM</span>}
              <h5>{g.title}</h5>
              <span className="vid-sub">{g.cap}</span>
            </div>
            <div className="content-actions">
              <label className="switch">
                <input type="checkbox" checked={g.category === 'paid'} onChange={() => toggleCategory(g)} />
                <i /><span>{g.category === 'paid' ? 'PAID' : 'FREE'}</span>
              </label>
              <button type="button" className="btn-danger small" onClick={() => remove(g)}>DELETE</button>
            </div>
          </div>
        ))}
      </div>

      {showHidden && (
        <>
          <h3 className="admin-subhead">REMOVED SEED IMAGES</h3>
          {hiddenSeed.length === 0 ? <p className="empty">Nothing removed.</p> : (
            <div className="restore-list">
              {hiddenSeed.map((g) => (
                <div className="restore-row" key={g.id}>
                  <span>{g.title}</span>
                  <button type="button" className="btn-ghost small" onClick={() => { restoreItem(g.id); toast('Restored.') }}>RESTORE</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
