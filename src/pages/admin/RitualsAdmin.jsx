import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../../context/ContentContext'
import { useToast } from '../../context/ToastContext'
import Img from '../../components/Img'

const EMPTY = { title: '', desc: '', img: '', step: '', duration: '', tags: '', category: 'free' }

export default function AdminRituals() {
  const { rituals, hiddenRituals, addRitual, updateRitual, deleteRitual, restoreRitual } = useContent()
  const toast = useToast()
  const [form, setForm] = useState(EMPTY)
  const [showHidden, setShowHidden] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.img.trim()) { toast('Title and image URL are required.'); return }
    const step = form.step.trim() || String(rituals.length + 1)
    const duration = form.duration.trim() || `Station ${rituals.length + 1} · Custom`
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean)
    await addRitual({ title: form.title, desc: form.desc, img: form.img, category: form.category, step, duration, tags })
    toast(`"${form.title}" added as ${form.category === 'paid' ? 'PAID' : 'FREE'}.`)
    setForm(EMPTY)
  }

  const toggleCategory = async (r) => {
    const next = r.category === 'paid' ? 'free' : 'paid'
    await updateRitual(r.id, { category: next })
    toast(`"${r.title}" is now ${next.toUpperCase()}.`)
  }

  const remove = async (r) => {
    await deleteRitual(r.id)
    toast(r.custom ? `"${r.title}" deleted.` : `"${r.title}" removed from the site (can be restored).`)
  }

  return (
    <>
      <div className="admin-head">
        <h1>RITUALS</h1>
        <p>{rituals.length} stations on the path of the initiate. Mark any station FREE or PAID.</p>
      </div>

      <section className="admin-card">
        <h3>ADD A RITUAL</h3>
        <form className="form upload-form" onSubmit={submit}>
          <div className="form-row">
            <label><span>TITLE</span><input type="text" placeholder="THE MIDNIGHT VOW" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label><span>STEP LABEL</span><input type="text" placeholder="VIII" value={form.step} onChange={(e) => setForm({ ...form, step: e.target.value })} /></label>
          </div>
          <label><span>IMAGE URL</span><input type="text" placeholder="/assets/your-image.jpg or https://…" value={form.img} onChange={(e) => setForm({ ...form, img: e.target.value })} /></label>
          <label><span>DESCRIPTION</span><input type="text" placeholder="What happens at this station" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} /></label>
          <div className="form-row">
            <label><span>DURATION / SUBTITLE</span><input type="text" placeholder="Station 8 · Custom" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></label>
            <label><span>TAGS (comma separated)</span><input type="text" placeholder="Silence, Flame" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></label>
          </div>
          <div className="form-row three">
            <label><span>CATEGORY</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="free">FREE</option>
                <option value="paid">PAID (sealed)</option>
              </select>
            </label>
            <div /><div className="upload-submit"><button type="submit" className="btn-gold full">ADD RITUAL ▲</button></div>
          </div>
        </form>
      </section>

      <div className="admin-toolbar">
        <label className="check inline"><input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} /><span>Show removed seed rituals</span></label>
      </div>

      <div className="content-grid">
        {rituals.map((r) => (
          <div className={`content-row${r.category === 'paid' ? ' sealed' : ''}`} key={r.id}>
            <div className="content-thumb"><Img src={r.img} alt={r.title} /></div>
            <div className="content-body">
              <span className="tag fact">STATION {r.step}</span>
              {r.custom && <span className="tag custom">CUSTOM</span>}
              <h5>{r.title}</h5>
              <Link to={`/rituals#${r.slug}`} className="sec-link">VIEW ›</Link>
            </div>
            <div className="content-actions">
              <label className="switch">
                <input type="checkbox" checked={r.category === 'paid'} onChange={() => toggleCategory(r)} />
                <i /><span>{r.category === 'paid' ? 'PAID' : 'FREE'}</span>
              </label>
              <button type="button" className="btn-danger small" onClick={() => remove(r)}>DELETE</button>
            </div>
          </div>
        ))}
      </div>

      {showHidden && (
        <>
          <h3 className="admin-subhead">REMOVED SEED RITUALS</h3>
          {hiddenRituals.length === 0 ? <p className="empty">Nothing removed.</p> : (
            <div className="restore-list">
              {hiddenRituals.map((r) => (
                <div className="restore-row" key={r.id}>
                  <span>{r.title}</span>
                  <button type="button" className="btn-ghost small" onClick={async () => { await restoreRitual(r.id); toast('Restored.') }}>RESTORE</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
