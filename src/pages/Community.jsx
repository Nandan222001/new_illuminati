import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { INSTA_IMAGES, PAGES } from '../data/content'
import { useLocalizedChannels } from '../hooks/useLocalizedContent'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import Img from '../components/Img'
import JoinUsModal from '../components/JoinUsModal'

const SEED_POSTS = [
  { id: 'p1', author: 'Grand Keeper', role: 'admin', key: 'p1' },
  { id: 'p2', author: 'Vesper', role: 'member', key: 'p2' },
  { id: 'p3', author: 'Orrin', role: 'member', key: 'p3' },
]

export default function Community() {
  const page = PAGES.community
  const { user, isAdmin } = useAuth()
  const toast = useToast()
  const { t } = useTranslation()
  const channels = useLocalizedChannels()
  const [posts, setPosts] = useState(SEED_POSTS.map((p) => ({ ...p, time: t(`community.seedPosts.${p.key}.time`), text: t(`community.seedPosts.${p.key}.text`) })))
  const [draft, setDraft] = useState('')
  const [showJoin, setShowJoin] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setPosts((p) => [{ id: `p${Date.now()}`, author: user.name, role: user.role, time: t('community.justNow'), text }, ...p])
    setDraft('')
    toast(t('community.postedToast'))
  }

  return (
    <>
      <PageHero kicker={t('content.pages.community.kicker')} title={t('content.pages.community.title')} sub={t('content.pages.community.sub')} image={page.hero} imageMobile={page.heroMobile}>
        <p className="page-intro">{t('content.pages.community.intro')}</p>
      </PageHero>

      <section className="page-section">
        <SectionHead title={t('community.channelsTitle')} sub={t('community.channelsSub')} />
        <div className="channel-grid">
          {channels.map((c) => (
            <button type="button" className="channel" key={c.key} onClick={() => toast(c.note)}>
              <span className="channel-icon">{c.icon}</span>
              <h3>{c.name}</h3>
              <p>{c.desc}</p>
              <em>{c.members}</em>
            </button>
          ))}
        </div>
      </section>

      <section className="page-section community-split">
        <div className="board">
          <SectionHead title={t('community.boardTitle')} sub={t('community.boardSub')} size={16} />
          {user ? (
            <form className="post-form" onSubmit={submit}>
              <textarea rows={3} maxLength={400} placeholder={t('community.sharePlaceholder', { name: user.name.split(' ')[0] })} value={draft} onChange={(e) => setDraft(e.target.value)} />
              <div className="post-form-foot">
                <span className="muted">{draft.length}/400</span>
                <button type="submit" className="btn-gold" disabled={!draft.trim()}>{t('community.post')}</button>
              </div>
            </form>
          ) : (
            <div className="post-locked">
              <p><Trans i18nKey="community.postLocked" components={[<Link to="/login" />, <Link to="/register" />]} /></p>
            </div>
          )}
          <ul className="posts">
            {posts.map((p) => (
              <li className="post" key={p.id}>
                <span className={`avatar${p.role === 'admin' ? ' admin' : ''}`}>{p.author[0]}</span>
                <div>
                  <div className="post-head"><b>{p.author}</b>{p.role === 'admin' && <em className="role-pill admin">{t('common.keeper')}</em>}<span>{p.time}</span></div>
                  <p>{p.text}</p>
                </div>
              </li>
            ))}
          </ul>
          {isAdmin && <p className="muted"><Trans i18nKey="community.adminNote" components={[<Link to="/admin" />]} /></p>}
        </div>

        <aside className="community-side">
          <div className="side-card">
            <div className="comm-emblem-wrap"><Img className="comm-emblem" src="/assets/community-emblem.jpg" alt="Brotherhood emblem" /></div>
            <h4>{t('community.emblemTitle')}</h4>
            <p>{t('community.emblemText')}</p>
            {user?.paid && <button type="button" className="btn-gold" onClick={() => setShowJoin(true)}>{t('common.joinUsNow')} ›</button>}
            {user && <Link to="/profile" className="btn-gold">{t('nav.myProfile')} ›</Link>}
            <JoinUsModal open={showJoin} onClose={() => setShowJoin(false)} />
          </div>
          <div className="side-card">
            <h4>{t('community.followInstagram')}</h4>
            <div className="insta-grid tight">
              {INSTA_IMAGES.map((img, i) => (
                <a href="#" key={i} onClick={(e) => { e.preventDefault(); toast(t('content.channels.instagram.note')) }}><Img src={img} alt={t('common.instagramPostAlt')} /></a>
              ))}
            </div>
            <div className="insta-foot">
              <button className="follow-btn" onClick={() => toast(t('common.followingToast'))}>📷 {t('common.followNow')}</button>
              <span className="handle">@illuminati.brotherhood</span>
            </div>
          </div>
          <div className="comm-note">{t('community.matureNote')}</div>
        </aside>
      </section>
    </>
  )
}
