import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
const STRENGTH_LABEL = ['', 'WEAK', 'FAIR', 'STRONG', 'UNBREAKABLE']

export default function Register() {
  const { user, register, ready } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', agree: false })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const score = useMemo(() => strength(form.password), [form.password])

  useEffect(() => { if (ready && user) navigate('/profile', { replace: true }) }, [ready, user, navigate])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('The two passphrases do not match.'); return }
    if (!form.agree) { setError('You must acknowledge that this is a fictional experience.'); return }
    setBusy(true)
    try {
      const u = await register(form)
      toast(`Welcome, initiate #${String(u.initiate).padStart(3, '0')}.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      reverse
      image="/assets/archive-altar.jpg"
      imageAlt="Signing the oath"
      quote="“Seek. Question. And never claim the story is anything but a story.”"
      kicker="THE SEALED OATH"
      title="REGISTER"
      sub="Create your initiate account. It takes less than a minute and unlocks the sealed chapters."
      footer={<>Already an initiate? <Link to="/login">Sign in ›</Link></>}
    >
      <form className="form" onSubmit={submit} noValidate>
        <label>
          <span>INITIATE NAME</span>
          <input type="text" name="name" autoComplete="name" required minLength={2} placeholder="The name the circle will know" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>
          <span>EMAIL</span>
          <input type="email" name="email" autoComplete="email" required placeholder="initiate@brotherhood.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <div className="form-row">
          <label>
            <span>PASSPHRASE</span>
            <div className="pw-wrap">
              <input type={showPw ? 'text' : 'password'} name="password" autoComplete="new-password" required minLength={8} placeholder="min. 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="button" className="pw-toggle" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}>{showPw ? '◎' : '◉'}</button>
            </div>
          </label>
          <label>
            <span>CONFIRM</span>
            <input type={showPw ? 'text' : 'password'} name="confirm" autoComplete="new-password" required placeholder="repeat it" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          </label>
        </div>
        {form.password && (
          <div className={`strength s${score}`} aria-live="polite">
            <div className="bars"><i /><i /><i /><i /></div>
            <span>{STRENGTH_LABEL[score] || 'TOO SHORT'}</span>
          </div>
        )}
        <label className="check">
          <input type="checkbox" checked={form.agree} onChange={(e) => setForm({ ...form, agree: e.target.checked })} />
          <span>I understand this is a <b>fictional, entertainment-only</b> experience and I am 18 or older.</span>
        </label>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button type="submit" className="btn-gold full" disabled={busy}>{busy ? 'SEALING THE OATH…' : 'BECOME AN INITIATE ›'}</button>
      </form>
    </AuthShell>
  )
}
