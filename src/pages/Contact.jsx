import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '../api/client'
import { isMine, normalizeThread } from '../api/community'
import { useAuth } from '../context/AuthContext'
import { useConsent } from '../context/ConsentContext'
import { validateEmail } from '../utils/validation'
import EditorialHeader, { Breadcrumbs } from '../components/EditorialHeader'
import ThreadList from '../components/ThreadList'

const configuredAddress = validateEmail(import.meta.env.VITE_CONTACT_EMAIL)
const contactEmail = configuredAddress.ok ? configuredAddress.value : ''
const SUPPORT_PREFIX = 'Support: '

function SupportForm({ user }) {
  const { t } = useTranslation()
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [threads, setThreads] = useState(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let alive = true
    apiFetch('/community/threads').then((data) => {
      if (!Array.isArray(data)) throw new Error('Invalid support response')
      if (!alive) return
      const history = data.map(normalizeThread).filter((thread) => isMine(thread, user) && thread.subject?.startsWith(SUPPORT_PREFIX))
      setThreads((current) => [...(current || []), ...history.filter((row) => !current?.some((message) => message.id === row.id))])
      setLoadError(false)
    }).catch(() => { if (alive) setLoadError(true) })
    return () => { alive = false }
  }, [user])

  async function send(event) {
    event.preventDefault()
    if (!subject.trim() || !body.trim() || busy) return
    setBusy(true)
    setSent(false)
    setError('')
    try {
      // No local fallback: tell the reader it was sent only after the API accepts it.
      const message = normalizeThread(await apiFetch('/community/threads', {
        method: 'POST', body: { subject: `${SUPPORT_PREFIX}${subject.trim()}`, body: body.trim() },
      }))
      if (!message?.id) throw new Error('Missing support confirmation')
      setThreads((current) => [message, ...(current || []).filter((thread) => thread.id !== message.id)])
      setSubject('')
      setBody('')
      setSent(true)
    } catch {
      setError(t('editorial.contact.sendError'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <form className="editorial-contact-form" onSubmit={send}>
        <div className="editorial-contact-field">
          <label htmlFor="contact-subject">{t('editorial.contact.subject')}</label>
          <input id="contact-subject" value={subject} onChange={(e) => setSubject(e.target.value)} required maxLength={120} />
        </div>
        <div className="editorial-contact-field">
          <label htmlFor="contact-message">{t('editorial.contact.message')}</label>
          <textarea id="contact-message" value={body} onChange={(e) => setBody(e.target.value)} required maxLength={4000} rows={6} />
        </div>
        <p>{t('editorial.contact.reminder')}</p>
        <button type="submit" className="editorial-button" disabled={busy || !subject.trim() || !body.trim()}>{t(busy ? 'editorial.contact.sending' : 'editorial.contact.send')}</button>
        {sent && <p role="status">{t('editorial.contact.sent')}</p>}
        {error && <p className="editorial-error" role="alert">{error}</p>}
      </form>
      <section className="editorial-section support-threads">
        <h2>{t('editorial.contact.threads')}</h2>
        {loadError && <p className="editorial-error" role="alert">{t('editorial.contact.loadError')}</p>}
        {threads && <ThreadList threads={threads} emptyText={t('editorial.contact.empty')} />}
        {!threads && !loadError && <p role="status">{t('editorial.contact.loading')}</p>}
      </section>
    </>
  )
}

export default function Contact() {
  const { t } = useTranslation()
  const { user, ready } = useAuth()
  const { consent } = useConsent()
  return (
    <div className="editorial-frame editorial-page">
      <Breadcrumbs items={[{ label: t('editorial.contact.title') }]} />
      <EditorialHeader kicker={t('editorial.about.title')} title={t('editorial.contact.title')} description={t('editorial.contact.description')} />
      <section className="editorial-prose" aria-labelledby="contact-options">
        <h2 id="contact-options">{t('editorial.contact.options')}</h2>
        {contactEmail && <p>{t('editorial.contact.email')} <a href={`mailto:${encodeURIComponent(contactEmail).replace('%40', '@')}`}>{contactEmail}</a></p>}
        {ready && user && (consent ? <SupportForm user={user} key={user.id} /> : (
          <Link className="editorial-button secondary" to="/rules#instructions">{t('editorial.catalogue.reviewTerms')}</Link>
        ))}
        {ready && !user && (
          <>
            <p>{t('editorial.contact.signIn')}</p>
            <div className="editorial-actions">
              <Link className="editorial-button" to="/login" state={{ from: '/contact' }}>{t('editorial.signIn')}</Link>
              <Link className="editorial-button secondary" to="/register" state={{ from: '/contact' }}>{t('editorial.contact.register')}</Link>
            </div>
          </>
        )}
        <p><Link to="/privacy">{t('editorial.privacy')}</Link></p>
      </section>
    </div>
  )
}
