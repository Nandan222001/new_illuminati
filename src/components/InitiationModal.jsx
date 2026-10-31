import { useCallback, useEffect, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { createOrder, loadRazorpay, verifyPayment } from '../api/payments'
import { useSiteSettings } from '../context/SiteSettingsContext'
import WhyFee from './WhyFee'

const POLL_MS = 4000

/**
 * Opens Razorpay Checkout, but never straight away. Flow:
 *   0. the "why ₹{fee}?" screen explains what the one-time fee pays for,
 *   1. the member taps Continue → POST /payments/order creates a Razorpay order,
 *   2. Checkout opens as a popup,
 *   3. on success POST /payments/verify checks the signature and unlocks the account,
 *   4. the signed webhook (/paymentwebhook) is the backup if the browser never reports back.
 * The modal only shows reasons, progress, "sealed", or an error with a retry —
 * never a card form of our own.
 */
export default function InitiationModal({ open, onClose }) {
  const { user, refreshUser } = useAuth()
  const { joiningFee } = useSiteSettings()
  const { t } = useTranslation()
  // idle | reasons | starting | checkout | confirming | error
  const [stage, setStage] = useState('idle')
  const [error, setError] = useState('')
  const stageRef = useRef('idle')
  const setStageBoth = (s) => { stageRef.current = s; setStage(s) }
  const paid = !!user?.paid

  const start = useCallback(async () => {
    setError('')
    setStageBoth('starting')
    try {
      const [Razorpay, order] = await Promise.all([loadRazorpay(), createOrder()])
      const rzp = new Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: 'ILLUMINATI BROTHERHOOD',
        description: t('modals.initiation.checkoutDescription'),
        image: `${window.location.origin}/assets/community-emblem.jpg`,
        prefill: { name: user?.name || '', email: user?.email || '' },
        // Razorpay's popup is their hosted UI; these are the knobs it exposes.
        theme: { color: '#b8892f', backdrop_color: '#050203' },
        config: {
          display: {
            blocks: {
              upi: { name: t('modals.initiation.payUpi'), instruments: [{ method: 'upi' }] },
              cards: { name: t('modals.initiation.payCard'), instruments: [{ method: 'card' }] },
              other: { name: t('modals.initiation.payOther'), instruments: [{ method: 'netbanking' }, { method: 'wallet' }] },
            },
            sequence: ['block.upi', 'block.cards', 'block.other'],
            preferences: { show_default_blocks: false },
          },
        },
        modal: {
          escape: true,
          ondismiss: () => { if (stageRef.current === 'checkout') { setStageBoth('reasons'); onClose() } },
        },
        handler: async (response) => {
          setStageBoth('confirming')
          try {
            await verifyPayment(response)
            await refreshUser()
          } catch {
            // The webhook will still unlock the account; keep watching below.
          }
        },
      })
      rzp.on('payment.failed', (res) => {
        setError(res?.error?.description || t('modals.initiation.paymentFailed'))
        setStageBoth('error')
      })
      setStageBoth('checkout')
      rzp.open()
    } catch (err) {
      setError(err.message)
      setStageBoth('error')
    }
  }, [onClose, refreshUser, t, user?.email, user?.name])

  // Show the reasons screen first — Checkout only opens when the member asks for it.
  useEffect(() => {
    if (open && !paid && stageRef.current === 'idle') setStageBoth('reasons')
    if (!open && stageRef.current !== 'checkout') setStageBoth('idle')
  }, [open, paid])

  // After a payment, wait for the account to flip to paid (verify or webhook).
  useEffect(() => {
    if (!open || paid || stage !== 'confirming') return undefined
    const timer = window.setInterval(() => { refreshUser().catch(() => {}) }, POLL_MS)
    return () => window.clearInterval(timer)
  }, [open, paid, stage, refreshUser])

  const close = () => { setStageBoth('idle'); onClose() }

  const visible = open && (paid || stage !== 'idle')
  return (
    <div className={`modal${visible ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget && stage !== 'confirming') close() }} role="dialog" aria-modal="true" aria-hidden={!visible}>
      <div className={`modal-box init-modal${stage === 'reasons' && !paid ? ' why-modal' : ''}`}>
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
              <button className="btn-gold" onClick={close}>{t('modals.initiation.enterSealed')}</button>
            </div>
          </>
        ) : stage === 'error' ? (
          <>
            <h3>{t('modals.initiation.errorTitle')}</h3>
            <p>{error}</p>
            <div className="modal-actions">
              <button type="button" className="btn-gold" onClick={start}>{t('modals.initiation.tryAgain')}</button>
              <button type="button" className="btn-ghost" onClick={close}>{t('modals.initiation.notNow')}</button>
            </div>
          </>
        ) : stage === 'confirming' ? (
          <>
            <h3>{t('modals.initiation.confirmingTitle')}</h3>
            <p>{t('modals.initiation.confirmingText')}</p>
            <div className="sigil-spinner" aria-label="Loading" />
          </>
        ) : stage === 'starting' || stage === 'checkout' ? (
          <>
            <h3>{t('modals.initiation.title')}</h3>
            <p>{t('modals.initiation.openingCheckout', { fee: joiningFee })}</p>
            <div className="sigil-spinner" aria-label="Loading" />
          </>
        ) : (
          <>
            <button type="button" className="why-modal-x" onClick={close} aria-label={t('common.close')}>✕</button>
            <WhyFee fee={joiningFee} compact showTermsLink />
            <div className="modal-actions why-modal-actions">
              <button type="button" className="btn-gold" onClick={start}>{t('whyFee.continue', { fee: joiningFee })}</button>
              <button type="button" className="btn-ghost" onClick={close}>{t('whyFee.later')}</button>
            </div>
            <p className="why-modal-secure">{t('whyFee.secure')}</p>
          </>
        )}
      </div>
    </div>
  )
}
