import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { SOCIAL_LINKS } from '../data/content'
import BrandMark from './BrandMark'

/**
 * "Join Us Now" popup — one button per community channel.
 * Links live in src/data/content.js (SOCIAL_LINKS); swap the dummies
 * for the live community URLs there.
 */
export default function JoinUsModal({ open, onClose }) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      className="modal open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="joinus-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-box">
        <BrandMark className="m-mark" style={{ width: 56, height: 56 }} />
        <h3 id="joinus-title">{t('joinUs.title')}</h3>
        <p>{t('joinUs.sub')}</p>
        <div className="join-grid">
          {SOCIAL_LINKS.map((s) => (
            <a key={s.key} className="join-btn" href={s.url} target="_blank" rel="noopener noreferrer">
              <span aria-hidden="true">{s.icon}</span>{s.label}
            </a>
          ))}
        </div>
        <div className="modal-actions" style={{ marginTop: 18 }}>
          <button type="button" className="btn-ghost" onClick={onClose}>{t('modals.initiation.notNow')}</button>
        </div>
      </div>
    </div>
  )
}
