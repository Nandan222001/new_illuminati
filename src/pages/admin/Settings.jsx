import { useState } from 'react'
import { useToast } from '../../context/ToastContext'
import { DEFAULT_SETTINGS, readSettings, writeSettings } from '../../admin/adminStore'

function SecretField({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <label>
      <span>{label}</span>
      <div className="pw-wrap">
        <input type={show ? 'text' : 'password'} autoComplete="off" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
        <button type="button" className="pw-toggle" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide value' : 'Show value'}>{show ? '◎' : '◉'}</button>
      </div>
    </label>
  )
}

export default function AdminSettings() {
  const toast = useToast()
  const [settings, setSettings] = useState(readSettings)

  const save = (section) => {
    const next = { ...settings }
    writeSettings(next)
    toast(`${section} settings saved locally (demo).`)
  }

  const patch = (section, fields) => setSettings((prev) => ({ ...prev, [section]: { ...prev[section], ...fields } }))
  const reset = (section) => { setSettings((prev) => ({ ...prev, [section]: DEFAULT_SETTINGS[section] })); toast(`${section} settings reset.`) }

  const rp = settings.razorpay
  const smtp = settings.smtp
  const tw = settings.twilio

  return (
    <>
      <div className="admin-head">
        <h1>SETTINGS</h1>
        <p>Integration credentials for the Brotherhood&apos;s console.</p>
      </div>

      <div className="notice">
        ⚠ <b>Demo only.</b> This site is a static front end with no backend. Values below are saved to <em>this browser&apos;s</em> local storage and are never sent to Razorpay, an SMTP server, Twilio, or anywhere else. Wire <code>src/admin/adminStore.js</code> to a real API before accepting real credentials.
      </div>

      <section className="admin-card">
        <div className="settings-card-head">
          <h3>RAZORPAY <span className="muted-inline">— payments</span></h3>
          <label className="switch">
            <input type="checkbox" checked={rp.enabled} onChange={(e) => patch('razorpay', { enabled: e.target.checked })} />
            <i /><span>{rp.enabled ? 'ENABLED' : 'DISABLED'}</span>
          </label>
        </div>
        <form className="form" onSubmit={(e) => { e.preventDefault(); save('Razorpay') }}>
          <div className="form-row">
            <label><span>MODE</span>
              <select value={rp.mode} onChange={(e) => patch('razorpay', { mode: e.target.value })}>
                <option value="test">TEST</option>
                <option value="live">LIVE</option>
              </select>
            </label>
            <label><span>KEY ID</span><input type="text" autoComplete="off" placeholder="rzp_test_xxxxxxxxxxxx" value={rp.keyId} onChange={(e) => patch('razorpay', { keyId: e.target.value })} /></label>
          </div>
          <SecretField label="KEY SECRET" placeholder="••••••••••••••••" value={rp.keySecret} onChange={(v) => patch('razorpay', { keySecret: v })} />
          <div className="settings-actions">
            <button type="submit" className="btn-gold">SAVE RAZORPAY</button>
            <button type="button" className="btn-ghost" onClick={() => reset('razorpay')}>RESET</button>
          </div>
        </form>
      </section>

      <section className="admin-card">
        <div className="settings-card-head">
          <h3>SMTP <span className="muted-inline">— transactional email</span></h3>
          <label className="switch">
            <input type="checkbox" checked={smtp.enabled} onChange={(e) => patch('smtp', { enabled: e.target.checked })} />
            <i /><span>{smtp.enabled ? 'ENABLED' : 'DISABLED'}</span>
          </label>
        </div>
        <form className="form" onSubmit={(e) => { e.preventDefault(); save('SMTP') }}>
          <div className="form-row">
            <label><span>HOST</span><input type="text" autoComplete="off" placeholder="smtp.yourprovider.com" value={smtp.host} onChange={(e) => patch('smtp', { host: e.target.value })} /></label>
            <label><span>PORT</span><input type="text" autoComplete="off" placeholder="587" value={smtp.port} onChange={(e) => patch('smtp', { port: e.target.value })} /></label>
          </div>
          <div className="form-row">
            <label><span>USERNAME</span><input type="text" autoComplete="off" placeholder="apikey or username" value={smtp.username} onChange={(e) => patch('smtp', { username: e.target.value })} /></label>
            <SecretField label="PASSWORD" placeholder="••••••••••••••••" value={smtp.password} onChange={(v) => patch('smtp', { password: v })} />
          </div>
          <div className="form-row">
            <label><span>FROM NAME</span><input type="text" autoComplete="off" placeholder="Illuminati Brotherhood" value={smtp.fromName} onChange={(e) => patch('smtp', { fromName: e.target.value })} /></label>
            <label><span>FROM EMAIL</span><input type="email" autoComplete="off" placeholder="no-reply@yourdomain.com" value={smtp.fromEmail} onChange={(e) => patch('smtp', { fromEmail: e.target.value })} /></label>
          </div>
          <label className="check">
            <input type="checkbox" checked={smtp.secure} onChange={(e) => patch('smtp', { secure: e.target.checked })} />
            <span>Use TLS / SSL</span>
          </label>
          <div className="settings-actions">
            <button type="submit" className="btn-gold">SAVE SMTP</button>
            <button type="button" className="btn-ghost" onClick={() => reset('smtp')}>RESET</button>
          </div>
        </form>
      </section>

      <section className="admin-card">
        <div className="settings-card-head">
          <h3>TWILIO <span className="muted-inline">— SMS &amp; OTP</span></h3>
          <label className="switch">
            <input type="checkbox" checked={tw.enabled} onChange={(e) => patch('twilio', { enabled: e.target.checked })} />
            <i /><span>{tw.enabled ? 'ENABLED' : 'DISABLED'}</span>
          </label>
        </div>
        <form className="form" onSubmit={(e) => { e.preventDefault(); save('Twilio') }}>
          <label><span>ACCOUNT SID</span><input type="text" autoComplete="off" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" value={tw.accountSid} onChange={(e) => patch('twilio', { accountSid: e.target.value })} /></label>
          <div className="form-row">
            <SecretField label="AUTH TOKEN" placeholder="••••••••••••••••" value={tw.authToken} onChange={(v) => patch('twilio', { authToken: v })} />
            <label><span>FROM NUMBER</span><input type="text" autoComplete="off" placeholder="+15551234567" value={tw.fromNumber} onChange={(e) => patch('twilio', { fromNumber: e.target.value })} /></label>
          </div>
          <div className="settings-actions">
            <button type="submit" className="btn-gold">SAVE TWILIO</button>
            <button type="button" className="btn-ghost" onClick={() => reset('twilio')}>RESET</button>
          </div>
        </form>
      </section>
    </>
  )
}
