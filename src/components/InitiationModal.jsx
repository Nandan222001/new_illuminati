import { useEffect, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { INITIATION_FEE_INR } from '../auth/authService'

// Razorpay Payment Button id (public). Override per environment with VITE_RAZORPAY_BUTTON_ID.
const RAZORPAY_BUTTON_ID = import.meta.env.VITE_RAZORPAY_BUTTON_ID || 'pl_TrqclJ8VZTqGew'
const POLL_MS = 4000

/**
 * "Complete your initiation" checkout. Payment happens on Razorpay; once it is
 * captured, Razorpay calls our webhook (POST /api/v1/paymentwebhook), which
 * unlocks the account whose email paid. While this modal is open we poll the
 * member's profile so it flips to the success state on its own.
 */
export default function InitiationModal({ open, onClose }) {
  const { user, refreshUser } = useAuth()
  const toast = useToast()
  const { t } = useTranslation()
  const formRef = useRef(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Mount the Razorpay button script inside the form (it renders next to itself).
  useEffect(() => {
    const form = formRef.current
    if (!open || !form || user?.paid) return undefined
    form.innerHTML = ''
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js'
    script.async = true
    script.dataset.payment_button_id = RAZORPAY_BUTTON_ID
    form.appendChild(script)
    return () => { form.innerHTML = '' }
  }, [open, user?.paid])

  // Watch for the webhook to confirm the payment.
  useEffect(() => {
    if (!open || user?.paid) return undefined
    const timer = window.setInterval(() => { refreshUser().catch(() => {}) }, POLL_MS)
    return () => window.clearInterval(timer)
  }, [open, user?.paid, refreshUser])

  const checkNow = async () => {
    setChecking(true)
    try {
      const me = await refreshUser()
      if (me.paid) toast(t('modals.initiation.sealedToast'))
      else toast(t('modals.initiation.notConfirmedYet'))
    } catch (err) {
      toast(err.message)
    } finally {
      setChecking(false)
    }
  }

  const paid = !!user?.paid

  return (
    <div className={`modal${open ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) onClose() }} role="dialog" aria-modal="true" aria-hidden={!open}>
      <div className="modal-box init-modal">
        {paid ? (
          <>
            <svg className="m-mark" viewBox="0 0 100 100" fill="none" aria-hidden="true">
              <polygon points="50,6 95,88 5,88" stroke="#e6c878" strokeWidth="3" />
              <ellipse cx="50" cy="60" rx="17" ry="10" stroke="#e6c878" strokeWidth="2" />
              <circle cx="50" cy="60" r="5" fill="#e6c878" />
            </svg>
            <h3>{t('modals.initiation.doneTitle')}</h3>
            <p>
              <Trans i18nKey="modals.initiation.doneBody" values={{ sealId: user.sealId || '' }} components={[<b style={{ color: 'var(--gold)' }} />]} />
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
              <span className="muted">{t('modals.initiation.payEmailNote', { email: user?.email || '' })}</span>
            </p>
            <form className="init-form razorpay-form" ref={formRef} />
            <div className="modal-actions">
              <button type="button" className="btn-gold" onClick={checkNow} disabled={checking}>{checking ? t('modals.initiation.checking') : t('modals.initiation.alreadyPaid')}</button>
              <button type="button" className="btn-ghost" onClick={onClose}>{t('modals.initiation.notNow')}</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
