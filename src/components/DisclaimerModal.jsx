import { useEffect } from 'react'

export default function DisclaimerModal({ open, onClose, onEnter }) {
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
        <h3>ENTER THE UNKNOWN?</h3>
        <p>
          You are about to explore a <b style={{ color: 'var(--gold)' }}>fictional, entertainment-only</b> experience about secret-society mythology. No real-world claims. No real rituals. Just story, symbol and cinema.
          <br /><br />Do you wish to proceed?
        </p>
        <div className="modal-actions">
          <button className="btn-gold" onClick={onEnter}>I ENTER ›</button>
          <button className="btn-ghost" onClick={onClose}>STAY OUTSIDE</button>
        </div>
      </div>
    </div>
  )
}
