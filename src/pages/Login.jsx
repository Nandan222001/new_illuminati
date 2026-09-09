import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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
      toast(u.role === 'admin' ? `Welcome back, Keeper ${u.name}.` : `Welcome back, ${u.name}.`)
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
      quote="“The door has always been open. Only few know where it is.”"
      kicker="RETURN TO THE CIRCLE"
      title="LOGIN"
      sub="Sign in to unseal the archives, the rituals and the community board."
      footer={<>New to the Brotherhood? <Link to="/register">Become an initiate ›</Link></>}
    >
      {location.state?.from && <div className="notice">Sign in to continue to <b>{location.state.from}</b>.</div>}
      <form className="form" onSubmit={submit} noValidate>
        <label>
          <span>EMAIL</span>
          <input type="email" name="email" autoComplete="email" required placeholder="initiate@brotherhood.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label>
          <span>PASSPHRASE</span>
          <div className="pw-wrap">
            <input type={showPw ? 'text' : 'password'} name="password" autoComplete="current-password" required placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="button" className="pw-toggle" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}>{showPw ? '◎' : '◉'}</button>
          </div>
        </label>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button type="submit" className="btn-gold full" disabled={busy}>{busy ? 'OPENING THE DOOR…' : 'ENTER ›'}</button>
      </form>

      <div className="demo-box">
        <b>▲ ADMIN DEMO ACCESS</b>
        {demo ? (
          <>
            <p>Email <code>{demo.email}</code> · Passphrase <code>{demo.password}</code></p>
            <button type="button" className="btn-ghost small" onClick={fillAdmin}>FILL ADMIN CREDENTIALS</button>
            {!demo.fromEnv && <span className="muted">Generated for this browser on first visit. Set <code>VITE_ADMIN_PASSWORD</code> to fix it.</span>}
          </>
        ) : (
          <p>Keeper credentials are managed by the site owner. Set <code>VITE_ADMIN_PASSWORD</code> or clear site data to regenerate the demo account.</p>
        )}
      </div>
    </AuthShell>
  )
}
