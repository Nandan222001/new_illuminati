import { useEffect, useState } from 'react'
import { ACCEPTED_IMAGE_ATTR, fetchImageLimits, IMAGE_LIMITS, uploadImage, validateImageFile } from '../api/library'
import { useToast } from '../context/ToastContext'

/**
 * Admin image input with both options: upload a file from this device, or
 * paste a link. The value is always a URL string, so every form keeps working
 * the same way (`form.img`). Uploads happen as soon as a file is chosen.
 */
export default function ImageField({ label = 'IMAGE', value, onChange }) {
  const toast = useToast()
  const [mode, setMode] = useState('upload')
  const [progress, setProgress] = useState(0)
  const [busy, setBusy] = useState(false)
  const [limits, setLimits] = useState({ ...IMAGE_LIMITS, maxSizeBytes: IMAGE_LIMITS.maxSizeMb * 1024 * 1024 })

  useEffect(() => { fetchImageLimits().then(setLimits) }, [])

  const pick = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const problem = validateImageFile(file, limits)
    if (problem) { toast(problem); return }
    setBusy(true)
    setProgress(0)
    try {
      onChange(await uploadImage(file, { onProgress: setProgress }))
      toast('Image uploaded.')
    } catch (err) {
      toast(err.message)
    } finally {
      setBusy(false)
      setProgress(0)
    }
  }

  return (
    <div className="image-field">
      <span className="image-field-label">{label}</span>
      <div className="source-toggle" role="tablist" aria-label={`${label} source`}>
        <button type="button" role="tab" aria-selected={mode === 'upload'} className={mode === 'upload' ? 'active' : ''} onClick={() => setMode('upload')}>⬆ UPLOAD IMAGE</button>
        <button type="button" role="tab" aria-selected={mode === 'link'} className={mode === 'link' ? 'active' : ''} onClick={() => setMode('link')}>🔗 PASTE LINK</button>
      </div>
      {mode === 'upload' ? (
        <label>
          <span>{limits.label}, up to {limits.maxSizeMb} MB</span>
          <input type="file" accept={ACCEPTED_IMAGE_ATTR} disabled={busy} onChange={pick} />
        </label>
      ) : (
        <label>
          <span>IMAGE LINK</span>
          <input type="text" placeholder="/assets/your-image.jpg or https://…" value={value} onChange={(e) => onChange(e.target.value)} />
        </label>
      )}
      {busy && <div className="upload-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /><em>UPLOADING {progress}%</em></div>}
      {value && !busy && (
        <div className="image-field-preview">
          <img src={value} alt="Preview" />
          <button type="button" className="btn-ghost small" onClick={() => onChange('')}>REMOVE</button>
        </div>
      )}
    </div>
  )
}
