import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { INITIATION_FEE_INR } from '../auth/authService'
import InitiationModal from './InitiationModal'

/**
 * Locks a page behind an account and the initiation payment.
 * Signed-out visitors are sent to login (with a link to register); signed-in
 * members who have not paid see the payment prompt instead of the page.
 */
export default function PaidRoute({ children }) {
  const { ready, user, isAdmin } = useAuth()
  const location = useLocation()
  const { t } = useTranslation()
  const [dismissed, setDismissed] = useState(false)

  if (!ready) {
    return (
      <div className="page-loading">
        <div className="sigil-spinner" aria-label="Loading" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search + location.hash }} />
  if (isAdmin || user.paid) return children

  return (
    <section className="page-section paywall">
      <div className="notice initiation-notice">
        <div>
          <b>🔒 {t('paywall.title')}</b>
          <p>{t('paywall.text', { fee: INITIATION_FEE_INR })}</p>
        </div>
        <button type="button" className="btn-gold" onClick={() => setDismissed(false)}>{t('paywall.cta', { fee: INITIATION_FEE_INR })}</button>
      </div>
      <InitiationModal open={!dismissed} onClose={() => setDismissed(true)} />
    </section>
  )
}
