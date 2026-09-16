import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { getDemoCredentials } from '../auth/authService'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import AuthShell from '../components/AuthShell'

export default function Login() {
  const { user, login, ready } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/profile'
  const { t } = useTranslation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!ready || !user) return
    // Keepers land on the admin panel unless they were heading somewhere specific.
    const dest = user.role === 'admin' && from === '/profile' ? '/admin' : from
    navigate(dest, { replace: true })
  }, [ready, user, from, navigate])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const u = await login(form)
      toast(u.role === 'admin' ? t('login.welcomeBackKeeper', { name: u.name }) : t('login.welcomeBack', { name: u.name }))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const demo = useMemo(() => (ready ? getDemoCredentials() : null), [ready])
  const fillAdmin = () => demo && setForm({ email: demo.email, password: demo.password })

  return (
    <AuthShell
      image="/assets/auth-login.jpg"
      imageAlt="The sealed door"
      quote={t('login.quote')}
      kicker={t('login.kicker')}
      title={t('nav.login')}
      sub={t('login.sub')}
      footer={<Trans i18nKey="login.footerCta" components={{ 0: <Link to="/register" /> }} />}
    >
      {location.state?.from && (
        <div className="notice"><Trans i18nKey="login.continueNotice" values={{ from: location.state.from }} components={{ 0: <b /> }} /></div>
      )}
      <form className="form" onSubmit={submit} noValidate>
        <label>
          <span>{t('common.emailLabel')}</span>
          <input type="email" name="email" autoComplete="email" required placeholder={t('common.emailPlaceholder')} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label>
          <span>{t('common.passphraseLabel')}</span>
          <div className="pw-wrap">
            <input type={showPw ? 'text' : 'password'} name="password" autoComplete="current-password" required placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="button" className="pw-toggle" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? t('common.hidePassword') : t('common.showPassword')}>{showPw ? '◎' : '◉'}</button>
          </div>
        </label>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button type="submit" className="btn-gold full" disabled={busy}>{busy ? t('login.opening') : t('common.enterArrow')}</button>
      </form>

      <div className="demo-box">
        <b>{t('login.demoTitle')}</b>
        {demo ? (
          <>
            <p><Trans i18nKey="login.demoCreds" values={{ email: demo.email, password: demo.password }} components={{ 0: <code />, 1: <code /> }} /></p>
            <button type="button" className="btn-ghost small" onClick={fillAdmin}>{t('login.fillAdmin')}</button>
            {!demo.fromEnv && <span className="muted"><Trans i18nKey="login.demoGeneratedNote" components={{ 0: <code /> }} /></span>}
          </>
        ) : (
          <p><Trans i18nKey="login.demoManagedNote" components={{ 0: <code /> }} /></p>
        )}
      </div>
    </AuthShell>
  )
}
