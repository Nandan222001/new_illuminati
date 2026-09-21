import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import AuthShell from '../components/AuthShell'

function strength(pw) {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 4)
}
const STRENGTH_KEYS = ['', 'weak', 'fair', 'strong', 'unbreakable']

export default function Register() {
  const { user, register, ready } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', agree: false })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const score = useMemo(() => strength(form.password), [form.password])

  useEffect(() => { if (ready && user) navigate('/profile', { replace: true }) }, [ready, user, navigate])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError(t('register.errorMismatch')); return }
    if (!form.agree) { setError(t('register.errorAgree')); return }
    setBusy(true)
    try {
      const u = await register(form)
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
          <input type="email" name="email" autoComplete="email" required placeholder={t('common.emailPlaceholder')} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <div className="form-row">
          <label>
            <span>{t('common.passwordLabel')}</span>
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
