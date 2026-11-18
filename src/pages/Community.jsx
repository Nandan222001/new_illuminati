import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { PAGES } from '../data/content'
import { useLocalizedChannels } from '../hooks/useLocalizedContent'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { addMessage, createThread, listThreads, normalizeThread, onThreadsChanged, setThreadStatus } from '../api/community'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import Img from '../components/Img'
import ThreadList from '../components/ThreadList'
import SocialLinks from '../components/SocialLinks'
import InstagramFollow from '../components/InstagramFollow'
import { SOCIAL_ICONS } from '../components/SocialIcons'

/**
 * Community: channels + the private discussion board.
 *
 * The board is deliberately one-to-one: an initiate only ever sees the threads
 * they opened with the Keepers, and a Keeper sees all of them. A third member
 * can never read another initiate's thread (enforced by the API and by
 * src/api/community.js).
 */
export default function Community() {
  const page = PAGES.community
  const { user, isAdmin } = useAuth()
  const toast = useToast()
  const { t } = useTranslation()
  const { social } = useSiteSettings()
  const channels = useLocalizedChannels()
  const [threads, setThreads] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [draft, setDraft] = useState('')
  const [subject, setSubject] = useState('')
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    if (!user) { setThreads([]); setLoaded(true); return }
    const list = await listThreads({ user, isAdmin })
    setThreads(list.map(normalizeThread))
    setLoaded(true)
  }, [user, isAdmin])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => onThreadsChanged(() => { refresh() }), [refresh])

  const submit = async (e) => {
    e.preventDefault()
    const body = draft.trim()
    if (!body || busy) return
    setBusy(true)
    try {
      await createThread({ user, subject: subject.trim() || null, body })
      setDraft('')
      setSubject('')
      toast(t('community.postedToast'))
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  const reply = async (threadId, body) => {
    await addMessage({ threadId, user, body })
    toast(t('community.replyToast'))
    await refresh()
  }

  const changeStatus = async (threadId, status) => {
    await setThreadStatus({ threadId, status })
    await refresh()
  }

  const linkedChannels = channels.filter((channel) => social[channel.key])

  return (
    <>
      <PageHero kicker={t('content.pages.community.kicker')} title={t('content.pages.community.title')} sub={t('content.pages.community.sub')} image={page.hero} imageMobile={page.heroMobile}>
        <p className="page-intro">{t('content.pages.community.intro')}</p>
      </PageHero>

      {linkedChannels.length > 0 && (
        <section className="page-section">
          <SectionHead title={t('community.channelsTitle')} sub={t('community.channelsSub')} />
          <div className="channel-grid">
            {linkedChannels.map((c) => {
              const Icon = SOCIAL_ICONS[c.key]
              return (
                <a className="channel" key={c.key} href={social[c.key]} target="_blank" rel="noopener noreferrer me">
                  <span className="channel-icon"><Icon width={22} height={22} /></span>
                  <h3>{c.name}</h3>
                  <p>{c.desc}</p>
                  <em>{t('social.follow')} ↗</em>
                </a>
              )
            })}
          </div>
        </section>
      )}

      <section className="page-section community-split" id="threads">
        <div className="board">
          <SectionHead title={t('community.boardTitle')} sub={t('community.boardSub')} size={16} />

          {!user && (
            <div className="post-locked">
              <p><Trans i18nKey="community.postLocked" components={[<Link to="/login" />, <Link to="/register" />]} /></p>
              <p className="muted">{t('community.signedOutThreads')}</p>
            </div>
          )}

          {user && (
            <form className="post-form" onSubmit={submit}>
              <p className="board-note">🔒 {t('community.privateNote')}</p>
              <input
                type="text"
                className="thread-subject"
                maxLength={120}
                placeholder={t('community.newThread')}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <textarea rows={3} maxLength={1000} placeholder={t('community.sharePlaceholder', { name: user.name.split(' ')[0] })} value={draft} onChange={(e) => setDraft(e.target.value)} />
              <div className="post-form-foot">
                <span className="muted">{draft.length}/1000</span>
                <button type="submit" className="btn-gold" disabled={!draft.trim() || busy}>{t('community.post')}</button>
              </div>
            </form>
          )}

          {user && (
            <>
              {!loaded ? (
                <p className="muted">{t('common.loading')}</p>
              ) : (
                <ThreadList
                  threads={threads}
                  isAdmin={isAdmin}
                  onReply={reply}
                  onStatus={isAdmin ? changeStatus : undefined}
                  emptyText={t('community.threadEmpty')}
                />
              )}
              {isAdmin && <p className="muted"><Trans i18nKey="community.adminNote" components={[<Link to="/admin/messages" />]} /></p>}
              {!isAdmin && <p className="muted">{t('community.viewerBoardNote')}</p>}
            </>
          )}
        </div>

        <aside className="community-side">
          <div className="side-card">
            <div className="comm-emblem-wrap"><Img className="comm-emblem" src="/assets/community-emblem.jpg" alt="Brotherhood emblem" /></div>
            <h4>{t('community.emblemTitle')}</h4>
            <p>{t('community.emblemText')}</p>
            {!user && <Link to="/register" className="btn-gold">{t('common.becomeInitiate')} ›</Link>}
            {user && <Link to="/profile" className="btn-gold">{t('nav.myProfile')} ›</Link>}
          </div>
          <InstagramFollow />
          <SocialLinks className="social-row side-social" labels={false} />
          <div className="comm-note">{t('community.matureNote')}</div>
        </aside>
      </section>
    </>
  )
}
