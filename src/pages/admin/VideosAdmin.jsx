import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../../context/ContentContext'
import { useToast } from '../../context/ToastContext'
import Img from '../../components/Img'
import { ACCEPTED_VIDEO_ATTR, fetchVideoLimits, formatBytes, uploadVideo, validateVideoFile, VIDEO_LIMITS } from '../../api/library'
import ImageField from '../../components/ImageField'

const TAGS = ['fiction', 'theory', 'fact']
const TAG_LABEL = { fiction: 'STORY', theory: 'THEORY', fact: 'FACT' }
const EMPTY = { title: '', desc: '', img: '', video: '', tag: 'fiction', dur: '10:00', category: 'free' }

export default function AdminVideos() {
  const { videos, hiddenVideos, addVideo, updateVideo, deleteVideo, restoreVideo } = useContent()
  const toast = useToast()
  const [form, setForm] = useState(EMPTY)
  const [showHidden, setShowHidden] = useState(false)
  const [source, setSource] = useState('upload') // 'upload' | 'link'
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [busy, setBusy] = useState(false)
  const [limits, setLimits] = useState({ ...VIDEO_LIMITS, maxSizeBytes: VIDEO_LIMITS.maxSizeMb * 1024 * 1024 })

  useEffect(() => { fetchVideoLimits().then(setLimits) }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    if (!form.title.trim() || !form.img.trim()) { toast('Title and a thumbnail image are required.'); return }
    let stored = {}
    if (source === 'upload') {
      const problem = validateVideoFile(file, limits)
      if (problem) { toast(problem); return }
      setBusy(true)
      try {
        const res = await uploadVideo(file, { onProgress: setProgress })
        stored = { video_key: res.key, video_name: res.filename, video_size: res.size }
      } catch (err) {
        toast(err.message)
        setBusy(false)
        setProgress(0)
        return
      }
    } else if (!form.video.trim()) {
      toast('Paste a video link (mp4 / YouTube / Vimeo) or switch to Upload.')
      return
    }
    try {
      await addVideo({ ...form, ...stored, date: 'New', video_url: source === 'link' ? form.video.trim() : '' })
      toast(`"${form.title}" added as ${form.category === 'paid' ? 'PAID' : 'FREE'}.`)
      setForm(EMPTY)
      setFile(null)
    } finally {
      setBusy(false)
      setProgress(0)
    }
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
        <p>{videos.length} episodes live. Upload a video file or paste a link, and mark it FREE or PAID (sealed for initiates).</p>
      </div>

      <section className="admin-card">
        <h3>UPLOAD A VIDEO</h3>
        <form className="form upload-form" onSubmit={submit}>
          <div className="form-row">
            <label><span>TITLE</span><input type="text" placeholder="The Hidden Chapter" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label><span>DURATION</span><input type="text" placeholder="12:30" value={form.dur} onChange={(e) => setForm({ ...form, dur: e.target.value })} /></label>
          </div>
          <ImageField label="THUMBNAIL IMAGE" value={form.img} onChange={(img) => setForm((prev) => ({ ...prev, img }))} />
          <div className="source-toggle" role="tablist" aria-label="Video source">
            <button type="button" role="tab" aria-selected={source === 'upload'} className={source === 'upload' ? 'active' : ''} onClick={() => setSource('upload')}>⬆ UPLOAD FILE</button>
            <button type="button" role="tab" aria-selected={source === 'link'} className={source === 'link' ? 'active' : ''} onClick={() => setSource('link')}>🔗 PASTE LINK</button>
          </div>
          {source === 'upload' ? (
            <label>
              <span>VIDEO FILE ({limits.label}, up to {limits.maxSizeMb} MB)</span>
              <input type="file" accept={ACCEPTED_VIDEO_ATTR} disabled={busy} onChange={(e) => setFile(e.target.files?.[0] || null)} />
              {file && <small className="muted">{file.name} · {formatBytes(file.size)}</small>}
            </label>
          ) : (
            <label><span>VIDEO LINK (mp4 / YouTube / Vimeo)</span><input type="text" placeholder="https://…/episode.mp4 or https://youtu.be/…" value={form.video} onChange={(e) => setForm({ ...form, video: e.target.value })} /></label>
          )}
          {busy && <div className="upload-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /><em>UPLOADING {progress}%</em></div>}
          <label><span>DESCRIPTION</span><input type="text" placeholder="One line about the episode" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} /></label>
          <div className="form-row three">
            <label><span>LABEL</span>
              <select value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })}>
                {TAGS.map((t) => <option key={t} value={t}>{TAG_LABEL[t]}</option>)}
              </select>
            </label>
            <label><span>CATEGORY</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="free">FREE</option>
                <option value="paid">PAID (sealed)</option>
              </select>
            </label>
            <div className="upload-submit"><button type="submit" className="btn-gold full" disabled={busy}>{busy ? `UPLOADING ${progress}%` : (source === 'upload' ? 'UPLOAD ▲' : 'ADD VIDEO ▲')}</button></div>
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
              <span className="tag custom">{v.video_key ? 'VIDEO UPLOADED' : v.video_url ? 'VIDEO LINKED' : 'NO VIDEO'}</span>
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
