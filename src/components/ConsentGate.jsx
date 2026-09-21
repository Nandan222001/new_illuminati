import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useConsent } from '../context/ConsentContext'
import BrandMark from './BrandMark'

export const RULE_KEYS = ['age', 'about', 'conduct', 'safety', 'membership', 'accounts', 'purchases', 'ownership', 'privacy', 'changes']

/** Blocks the public site until the viewer has read and accepted the Rules & Instructions. */
export default function ConsentGate() {
  const { t } = useTranslation()
  const { accept } = useConsent()
  const [agreed, setAgreed] = useState(false)
  const [declined, setDeclined] = useState(false)
  const checkRef = useRef(null)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    checkRef.current?.focus()
    return () => { document.body.style.overflow = prev }
  }, [])

  return (
    <div className="consent-gate" role="dialog" aria-modal="true" aria-labelledby="consent-title">
      <div className="consent-box">
        <BrandMark className="consent-mark" style={{ width: 52, height: 52 }} />
        <h3 id="consent-title">{t('rules.gate.title')}</h3>
        <p className="consent-intro">{t('rules.gate.intro')}</p>
        <div className="consent-scroll" tabIndex={0}>
          <ol>
            {RULE_KEYS.map((k) => (
              <li key={k}><b>{t(`rules.items.${k}.title`)}</b><span>{t(`rules.items.${k}.text`)}</span></li>
            ))}
          </ol>
          <p className="consent-wellbeing">{t('rules.wellbeing')}</p>
        </div>
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
      </div>
    </div>
  )
}
