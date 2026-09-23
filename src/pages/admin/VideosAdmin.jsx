import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../../context/ContentContext'
import { useToast } from '../../context/ToastContext'
import Img from '../../components/Img'

const TAGS = ['fiction', 'theory', 'fact']
const TAG_LABEL = { fiction: 'STORY', theory: 'THEORY', fact: 'FACT' }
const EMPTY = { title: '', desc: '', img: '', tag: 'fiction', dur: '10:00', category: 'free' }

export default function AdminVideos() {
  const { videos, hiddenVideos, addVideo, updateVideo, deleteVideo, restoreVideo } = useContent()
  const toast = useToast()
  const [form, setForm] = useState(EMPTY)
  const [showHidden, setShowHidden] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.img.trim()) { toast('Title and image URL are required.'); return }
    await addVideo({ ...form, views: '—', date: 'New' })
    toast(`"${form.title}" uploaded as ${form.category === 'paid' ? 'PAID' : 'FREE'}.`)
    setForm(EMPTY)
  }

  const toggleCategory = async (v) => {
    const next = v.category === 'paid' ? 'free' : 'paid'
    await updateVideo(v.id, { category: next })
    toast(`"${v.title}" is now ${next.toUpperCase()}.`)
  }

  const remove = async (v) => {
    await deleteVideo(v.id)
    toast(v.custom ? `"${v.title}" deleted.` : `"${v.title}" removed from the site (can be restored).`)
  }

  return (
    <>
      <div className="admin-head">
        <h1>VIDEOS</h1>
        <p>{videos.length} episodes live. Upload new footage and mark it FREE or PAID (sealed for initiates).</p>
      </div>

      <section className="admin-card">
        <h3>UPLOAD A VIDEO</h3>
        <form className="form upload-form" onSubmit={submit}>
          <div className="form-row">
            <label><span>Title</span><input type="text" placeholder="The Hidden Chapter" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label><span>Duration</span><input type="text" placeholder="12:30" value={form.dur} onChange={(e) => setForm({ ...form, dur: e.target.value })} /></label>
          </div>
          <label><span>THUMBNAIL / VIDEO IMAGE URL</span><input type="text" placeholder="/assets/your-image.jpg or https://…" value={form.img} onChange={(e) => setForm({ ...form, img: e.target.value })} /></label>
          <label><span>Description</span><input type="text" placeholder="One line about the episode" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} /></label>
          <div className="form-row three">
            <label><span>Label</span>
              <select value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })}>
                {TAGS.map((t) => <option key={t} value={t}>{TAG_LABEL[t]}</option>)}
              </select>
            </label>
            <label><span>Category</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="free">FREE</option>
                <option value="paid">PAID (sealed)</option>
              </select>
            </label>
            <div className="upload-submit"><button type="submit" className="btn-gold full">UPLOAD ▲</button></div>
          </div>
        </form>
      </section>

      <div className="admin-toolbar">
        <label className="check inline"><input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} /><span>Show removed seed videos</span></label>
      </div>

      <div className="content-grid">
        {videos.map((v) => (
          <div className={`content-row${v.category === 'paid' ? ' sealed' : ''}`} key={v.id}>
            <div className="content-thumb"><Img src={v.img} alt={v.title} /></div>
            <div className="content-body">
              <span className={`tag ${v.tag}`}>{TAG_LABEL[v.tag] || v.tag.toUpperCase()}</span>
              {v.custom && <span className="tag custom">CUSTOM</span>}
              <h5>{v.title}</h5>
              <Link to={`/videos/${v.slug}`} className="sec-link">VIEW ›</Link>
            </div>
            <div className="content-actions">
              <label className="switch">
                <input type="checkbox" checked={v.category === 'paid'} onChange={() => toggleCategory(v)} />
                <i /><span>{v.category === 'paid' ? 'PAID' : 'FREE'}</span>
              </label>
              <button type="button" className="btn-danger small" onClick={() => remove(v)}>DELETE</button>
            </div>
          </div>
        ))}
      </div>

      {showHidden && (
        <>
          <h3 className="admin-subhead">REMOVED SEED VIDEOS</h3>
          {hiddenVideos.length === 0 ? <p className="empty">Nothing removed.</p> : (
            <div className="restore-list">
              {hiddenVideos.map((v) => (
                <div className="restore-row" key={v.id}>
                  <span>{v.title}</span>
                  <button type="button" className="btn-ghost small" onClick={async () => { await restoreVideo(v.id); toast('Restored.') }}>RESTORE</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
