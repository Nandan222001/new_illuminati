import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useConsent } from '../context/ConsentContext'
import { CONSENT_VERSION } from '../utils/consent'
import BrandMark from './BrandMark'
import TermsDocument from './TermsDocument'

/**
 * Blocks the entire public site until the viewer has acknowledged the Terms &
 * Conditions. While it is open the page behind is inert (scroll locked, no
 * clicks, no tab focus) so nothing can be used before acknowledgement.
 *
 * The terms shown here are the verbatim document from src/data/terms.js — the
 * same text the /rules page renders.
 */
export default function ConsentGate() {
  const { t } = useTranslation()
  const { accept } = useConsent()
  const [agreed, setAgreed] = useState(false)
  const [declined, setDeclined] = useState(false)
  const checkRef = useRef(null)

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.classList.add('consent-locked')
    const shell = document.getElementById('site-shell')
    if (shell) {
      shell.setAttribute('inert', '')
      shell.setAttribute('aria-hidden', 'true')
    }
    checkRef.current?.focus()
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
        <h3 id="consent-title">{t('rules.gate.title')}</h3>
        <p className="consent-version">{t('rules.gate.version')}</p>
        <p className="consent-intro">{t('rules.gate.intro')}</p>
        <div className="consent-scroll" tabIndex={0}>
          <TermsDocument compact />
          <p className="consent-wellbeing">{t('rules.wellbeing')}</p>
        </div>
        <p className="consent-lock-note">🔒 {t('rules.gate.lockNote')}</p>
        <Link className="consent-full" to="/rules" target="_blank" rel="noopener noreferrer">{t('rules.gate.full')} ↗</Link>
        <label className="check consent-check">
          <input ref={checkRef} type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setDeclined(false) }} />
          <span>{t('rules.gate.agree')}</span>
        </label>
        {declined && <div className="form-error" role="alert">{t('rules.gate.declined')}</div>}
        <div className="modal-actions">
          <button type="button" className="btn-gold" disabled={!agreed} onClick={accept}>{t('rules.gate.accept')}</button>
          <button type="button" className="btn-ghost" onClick={() => setDeclined(true)}>{t('rules.gate.decline')}</button>
        </div>
        <p className="consent-meta">{t('rules.versionNote', { version: CONSENT_VERSION })}</p>
      </div>
    </div>
  )
}
