import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { INITIATION_FEE_INR } from '../auth/authService'

const EMPTY = { cardName: '', cardNumber: '', expiry: '', cvv: '' }

/**
 * Themed "complete your initiation" checkout modal, entirely simulated —
 * no payment gateway is called and none of these fields are ever stored.
 * On submit it just flips the signed-in user's local `paid` flag after a
 * short fake delay, unlocking sealed content for their account.
 */
export default function InitiationModal({ open, onClose }) {
  const { completeInitiation } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState(EMPTY)
  const [stage, setStage] = useState('form') // 'form' | 'processing' | 'done'
  const [sealId, setSealId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape' && stage !== 'processing') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, stage])

  useEffect(() => {
    if (open) { setForm(EMPTY); setStage('form'); setError('') }
  }, [open])

  const submit = (e) => {
    e.preventDefault()
    setError('')
    if (form.cardName.trim().length < 2) { setError('Enter the name on the card.'); return }
    if (form.cardNumber.replace(/\s/g, '').length < 12) { setError('That card number looks too short.'); return }
    if (!/^\d{2}\s*\/\s*\d{2}$/.test(form.expiry)) { setError('Expiry should look like MM/YY.'); return }
    if (form.cvv.length < 3) { setError('Enter the 3-digit security code.'); return }

    setStage('processing')
    window.setTimeout(() => {
      try {
        const updated = completeInitiation()
        setSealId(updated?.sealId || '')
        setStage('done')
        toast('Your oath is sealed. Welcome to the inner circle.')
      } catch (err) {
        setError(err.message)
        setStage('form')
      }
    }, 900)
  }

  return (
    <div className={`modal${open ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget && stage !== 'processing') onClose() }} role="dialog" aria-modal="true" aria-hidden={!open}>
      <div className="modal-box init-modal">
        {stage === 'done' ? (
          <>
            <svg className="m-mark" viewBox="0 0 100 100" fill="none" aria-hidden="true">
              <polygon points="50,6 95,88 5,88" stroke="#e6c878" strokeWidth="3" />
              <ellipse cx="50" cy="60" rx="17" ry="10" stroke="#e6c878" strokeWidth="2" />
              <circle cx="50" cy="60" r="5" fill="#e6c878" />
            </svg>
            <h3>OATH SEALED</h3>
            <p>
              Your initiation is complete. Membership seal <b style={{ color: 'var(--gold)' }}>{sealId}</b> has been recorded.
              Every sealed chapter across the archive is now open to you.
            </p>
            <div className="modal-actions">
              <button className="btn-gold" onClick={onClose}>ENTER THE SEALED ARCHIVES ›</button>
            </div>
          </>
        ) : (
          <>
            <h3>COMPLETE YOUR INITIATION</h3>
            <p>
              A one-time fee of <b style={{ color: 'var(--gold)' }}>₹{INITIATION_FEE_INR}</b> seals your oath and unlocks
              every sealed chapter, ritual and reel in the archive.
              <br /><br />
              <span className="muted">This is a simulated checkout for a fictional experience — no card details are sent anywhere or stored.</span>
            </p>
            <form className="form init-form" onSubmit={submit} noValidate>
              <label>
                <span>NAME ON CARD</span>
                <input type="text" autoComplete="cc-name" placeholder="As it appears on the card" value={form.cardName} onChange={(e) => setForm({ ...form, cardName: e.target.value })} disabled={stage === 'processing'} />
              </label>
              <label>
                <span>CARD NUMBER</span>
                <input type="text" inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" maxLength={19} value={form.cardNumber} onChange={(e) => setForm({ ...form, cardNumber: e.target.value })} disabled={stage === 'processing'} />
              </label>
              <div className="form-row">
                <label>
                  <span>EXPIRY</span>
                  <input type="text" autoComplete="cc-exp" placeholder="MM/YY" maxLength={5} value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} disabled={stage === 'processing'} />
                </label>
                <label>
                  <span>CVV</span>
                  <input type="text" inputMode="numeric" autoComplete="cc-csc" placeholder="•••" maxLength={4} value={form.cvv} onChange={(e) => setForm({ ...form, cvv: e.target.value })} disabled={stage === 'processing'} />
                </label>
              </div>
              {error && <div className="form-error" role="alert">{error}</div>}
              <div className="modal-actions">
                <button type="submit" className="btn-gold" disabled={stage === 'processing'}>
                  {stage === 'processing' ? 'SEALING THE OATH…' : `PAY ₹${INITIATION_FEE_INR} · SEAL OATH`}
                </button>
                <button type="button" className="btn-ghost" onClick={onClose} disabled={stage === 'processing'}>NOT NOW</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
