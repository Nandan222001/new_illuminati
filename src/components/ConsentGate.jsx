import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useConsent } from '../context/ConsentContext'
import BrandMark from './BrandMark'
import TermsDocument from './TermsDocument'

/**
 * Blocks the public site until the viewer acknowledges the Terms & Conditions.
 * The modal presents the complete, English terms document from src/data/terms.js
 * on first visit; the document itself is scrollable while the acknowledgement
 * controls remain available beneath it.
 */
export default function ConsentGate() {
  const { t } = useTranslation()
  const { accept } = useConsent()
  const [agreed, setAgreed] = useState(false)
  const [declined, setDeclined] = useState(false)
  const termsRef = useRef(null)

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.classList.add('consent-locked')
    const shell = document.getElementById('site-shell')
    if (shell) {
      shell.setAttribute('inert', '')
      shell.setAttribute('aria-hidden', 'true')
    }
    termsRef.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.classList.remove('consent-locked')
      const el = document.getElementById('site-shell')
      if (el) {
        el.removeAttribute('inert')
        el.removeAttribute('aria-hidden')
      }
    }
  }, [])

  return (
    <div className="consent-gate" role="dialog" aria-modal="true" aria-labelledby="consent-title">
      <div className="consent-box">
        <BrandMark className="consent-mark" style={{ width: 52, height: 52 }} />
        <div ref={termsRef} className="consent-scroll" tabIndex={0} role="region" aria-label="Terms and Conditions">
          <TermsDocument compact headingId="consent-title" />
        </div>
        <label className="check consent-check">
          <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setDeclined(false) }} />
          <span>{t('rules.gate.agree')}</span>
        </label>
        {declined && <div className="form-error" role="alert">{t('rules.gate.declined')}</div>}
        <div className="modal-actions">
          <button type="button" className="btn-gold" disabled={!agreed} onClick={accept}>{t('rules.gate.accept')}</button>
          <button type="button" className="btn-ghost" onClick={() => setDeclined(true)}>{t('rules.gate.decline')}</button>
        </div>
      </div>
    </div>
  )
}
