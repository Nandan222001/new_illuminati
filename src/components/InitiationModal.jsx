import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
    if (form.cardName.trim().length < 2) { setError(t('modals.initiation.errorName')); return }
    if (form.cardNumber.replace(/\s/g, '').length < 12) { setError(t('modals.initiation.errorCardNumber')); return }
    if (!/^\d{2}\s*\/\s*\d{2}$/.test(form.expiry)) { setError(t('modals.initiation.errorExpiry')); return }
    if (form.cvv.length < 3) { setError(t('modals.initiation.errorCvv')); return }

    setStage('processing')
    window.setTimeout(async () => {
      try {
        const updated = await completeInitiation()
        setSealId(updated?.sealId || '')
        setStage('done')
        toast(t('modals.initiation.sealedToast'))
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
            <h3>{t('modals.initiation.doneTitle')}</h3>
            <p>
              <Trans i18nKey="modals.initiation.doneBody" values={{ sealId }} components={[<b style={{ color: 'var(--gold)' }} />]} />
            </p>
            <div className="modal-actions">
              <button className="btn-gold" onClick={onClose}>{t('modals.initiation.enterSealed')}</button>
            </div>
          </>
        ) : (
          <>
            <h3>{t('modals.initiation.title')}</h3>
            <p>
              <Trans i18nKey="modals.initiation.bodyIntro" values={{ fee: INITIATION_FEE_INR }} components={[<b style={{ color: 'var(--gold)' }} />]} />
              <br /><br />
              <span className="muted">{t('modals.initiation.simulatedNote')}</span>
            </p>
            <form className="form init-form" onSubmit={submit} noValidate>
              <label>
                <span>{t('modals.initiation.nameOnCard')}</span>
                <input type="text" autoComplete="cc-name" placeholder={t('modals.initiation.namePlaceholder')} value={form.cardName} onChange={(e) => setForm({ ...form, cardName: e.target.value })} disabled={stage === 'processing'} />
              </label>
              <label>
                <span>{t('modals.initiation.cardNumber')}</span>
                <input type="text" inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" maxLength={19} value={form.cardNumber} onChange={(e) => setForm({ ...form, cardNumber: e.target.value })} disabled={stage === 'processing'} />
              </label>
              <div className="form-row">
                <label>
                  <span>{t('modals.initiation.expiry')}</span>
                  <input type="text" autoComplete="cc-exp" placeholder="MM/YY" maxLength={5} value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} disabled={stage === 'processing'} />
                </label>
                <label>
                  <span>{t('modals.initiation.cvv')}</span>
                  <input type="text" inputMode="numeric" autoComplete="cc-csc" placeholder="•••" maxLength={4} value={form.cvv} onChange={(e) => setForm({ ...form, cvv: e.target.value })} disabled={stage === 'processing'} />
                </label>
              </div>
              {error && <div className="form-error" role="alert">{error}</div>}
              <div className="modal-actions">
                <button type="submit" className="btn-gold" disabled={stage === 'processing'}>
                  {stage === 'processing' ? t('modals.initiation.sealing') : t('modals.initiation.payAndSeal', { fee: INITIATION_FEE_INR })}
                </button>
                <button type="button" className="btn-ghost" onClick={onClose} disabled={stage === 'processing'}>{t('modals.initiation.notNow')}</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
