import { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'

export default function DisclaimerModal({ open, onClose, onEnter }) {
  const { t } = useTranslation()
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div className={`modal${open ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) onClose() }} role="dialog" aria-modal="true" aria-hidden={!open}>
      <div className="modal-box">
        <svg className="m-mark" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <polygon points="50,6 95,88 5,88" stroke="#e6c878" strokeWidth="3" />
          <ellipse cx="50" cy="60" rx="17" ry="10" stroke="#e6c878" strokeWidth="2" />
          <circle cx="50" cy="60" r="5" fill="#e6c878" />
        </svg>
        <h3>{t('modals.disclaimer.title')}</h3>
        <p>
          <Trans i18nKey="modals.disclaimer.body" components={{ 0: <b style={{ color: 'var(--gold)' }} /> }} />
          <br /><br />{t('modals.disclaimer.prompt')}
        </p>
        <div className="modal-actions">
          <button className="btn-gold" onClick={onEnter}>{t('modals.disclaimer.enter')}</button>
          <button className="btn-ghost" onClick={onClose}>{t('modals.disclaimer.stay')}</button>
        </div>
      </div>
    </div>
  )
}
