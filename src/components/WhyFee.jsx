import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/**
 * The "why ₹999?" explanation shown before any payment is opened.
 *
 * Three plain reasons — one payment only, a membership issued in the member's
 * own name, and the running costs of the archive — plus an honest statement of
 * what the fee is *not*. Rendered inside the initiation modal (before Razorpay
 * Checkout opens) and on the standalone /why-999 page so both stay identical.
 */

const REASONS = [
  { key: 'once', glyph: '☉' },
  { key: 'seal', glyph: '◈' },
  { key: 'network', glyph: '⬡' },
]

const BADGES = ['oneTime', 'noRenewal', 'noRefund']

export default function WhyFee({ fee, compact = false, showTermsLink = false }) {
  const { t } = useTranslation()

  return (
    <div className={`why-fee${compact ? ' compact' : ''}`}>
      <p className="why-fee-kicker">{t('whyFee.kicker')}</p>
      <h2 className="why-fee-title">{t('whyFee.title', { fee })}</h2>
      <p className="why-fee-sub">{t('whyFee.sub')}</p>

      <ul className="why-fee-badges" aria-hidden="true">
        {BADGES.map((badge) => <li key={badge}>{t(`whyFee.badges.${badge}`)}</li>)}
      </ul>

      <ol className="why-fee-list">
        {REASONS.map((reason) => (
          <li className="why-fee-item" key={reason.key}>
            <span className="why-fee-num" aria-hidden="true">{reason.glyph}</span>
            <div className="why-fee-copy">
              <h3>{t(`whyFee.reasons.${reason.key}.title`)}</h3>
              <p>{t(`whyFee.reasons.${reason.key}.body`, { fee })}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="why-fee-honest">
        <b>{t('whyFee.honestTitle')}</b>
        <p>{t('whyFee.honest')}</p>
      </div>

      {showTermsLink && (
        <p className="why-fee-terms">
          <Link to="/rules" target="_blank" rel="noopener noreferrer">{t('whyFee.readTerms')} ↗</Link>
        </p>
      )}
    </div>
  )
}
