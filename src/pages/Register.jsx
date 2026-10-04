import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import AuthShell from '../components/AuthShell'
import { PASSWORD_RULE_ORDER, passwordScore, validateEmail, validatePassword } from '../utils/validation'

const STRENGTH_KEYS = ['', 'weak', 'fair', 'strong', 'unbreakable']

export default function Register() {
  const { user, register, ready } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', agree: false })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [busy, setBusy] = useState(false)
  const score = useMemo(() => passwordScore(form.password), [form.password])
  const pwCheck = useMemo(() => validatePassword(form.password), [form.password])
  const emailCheck = useMemo(() => (form.email ? validateEmail(form.email) : null), [form.email])

  useEffect(() => { if (ready && user) navigate('/profile', { replace: true }) }, [ready, user, navigate])

  const emailMessage = (result) => {
    if (!result || result.ok) return ''
    const suffix = { required: 'Required', disposable: 'Disposable', length: 'Length', tld: 'Tld' }[result.reason] || 'Invalid'
    return t(`validation.email${suffix}`)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setEmailError('')

    // The site only ever stores valid, deliverable-looking addresses.
    const email = validateEmail(form.email)
    if (!email.ok) {
      const message = emailMessage(email)
      setEmailError(message)
      setError(message)
      return
    }
    const password = validatePassword(form.password)
    if (!password.ok) {
      setError(t('validation.passwordMissing', { list: password.missing.map((rule) => t(`validation.passwordRule.${rule}`)).join(', ') }))
      return
    }
    if (form.password !== form.confirm) { setError(t('register.errorMismatch')); return }
    if (!form.agree) { setError(t('register.errorAgree')); return }

    setBusy(true)
    try {
      const u = await register({ name: form.name, email: email.value, password: form.password })
      toast(t('register.welcomeToast', { number: String(u.initiate).padStart(3, '0') }))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      reverse
      image="/assets/auth-register.jpg"
      imageAlt="Signing the oath"
      quote={t('register.quote')}
      kicker={t('register.kicker')}
      title={t('nav.register')}
      sub={t('register.sub')}
      footer={<Trans i18nKey="register.footerCta" components={[<Link to="/login" />]} />}
    >
      <form className="form" onSubmit={submit} noValidate>
        <label>
          <span>{t('common.initiateNameLabel')}</span>
          <input type="text" name="name" autoComplete="name" required minLength={2} placeholder={t('register.namePlaceholder')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>
          <span>{t('common.emailLabel')}</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            inputMode="email"
            spellCheck="false"
            placeholder={t('common.emailPlaceholder')}
            value={form.email}
            aria-invalid={!!emailError}
            onChange={(e) => { setForm({ ...form, email: e.target.value }); setEmailError('') }}
          />
          {emailError && <em className="field-hint error">{emailError}</em>}
          {!emailError && emailCheck?.ok && <em className="field-hint ok">✓ {emailCheck.value}</em>}
        </label>
        <div className="form-row">
          <label>
            <span>{t('common.passphraseLabel')}</span>
            <div className="pw-wrap">
              <input type={showPw ? 'text' : 'password'} name="password" autoComplete="new-password" required minLength={8} placeholder={t('register.passwordPlaceholder')} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="button" className="pw-toggle" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? t('common.hidePassword') : t('common.showPassword')}>{showPw ? '◎' : '◉'}</button>
            </div>
          </label>
          <label>
            <span>{t('register.confirmLabel')}</span>
            <input type={showPw ? 'text' : 'password'} name="confirm" autoComplete="new-password" required placeholder={t('register.confirmPlaceholder')} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          </label>
        </div>
        {form.password && (
          <div className={`strength s${score}`} aria-live="polite">
            <div className="bars"><i /><i /><i /><i /></div>
            <span>{t(`register.strength.${STRENGTH_KEYS[score] || 'tooShort'}`)}</span>
          </div>
        )}
        {/* Special characters are mandatory — the checklist shows exactly
            which character classes are still missing. */}
        <ul className={`pw-rules${pwCheck.ok ? ' ok' : ''}`}>
          {PASSWORD_RULE_ORDER.map((rule) => (
            <li key={rule} className={pwCheck.checks[rule] ? 'met' : ''}>
              <i aria-hidden="true">{pwCheck.checks[rule] ? '✓' : '•'}</i>
              {t(`validation.passwordRule.${rule}`)}
            </li>
          ))}
        </ul>
        <label className="check">
          <input type="checkbox" checked={form.agree} onChange={(e) => setForm({ ...form, agree: e.target.checked })} />
          <span><Trans i18nKey="register.ageCheck" components={[<b />]} /> <Link to="/rules" target="_blank" rel="noopener noreferrer">{t('rules.title')} ↗</Link></span>
        </label>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button type="submit" className="btn-gold full" disabled={busy}>{busy ? t('register.sealing') : `${t('common.becomeInitiate')} ›`}</button>
      </form>
    </AuthShell>
  )
}
