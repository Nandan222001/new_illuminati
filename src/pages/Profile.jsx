import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useContent } from '../context/ContentContext'
import { useToast } from '../context/ToastContext'
import { INITIATION_FEE_INR } from '../auth/authService'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import Img from '../components/Img'
import InitiationModal from '../components/InitiationModal'
import { downloadCardPdf, downloadCardPng, downloadJoiningLetterPdf } from '../utils/membershipDocs'

export default function Profile() {
  const { user, isAdmin, logout, updateProfile } = useAuth()
  const { videos, rituals } = useContent()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [name, setName] = useState(user.name)
  const [error, setError] = useState('')
  const [showInitiation, setShowInitiation] = useState(false)
  const [docBusy, setDocBusy] = useState('')
  const { t } = useTranslation()

  const sealedVideos = videos.filter((v) => v.category === 'paid')
  const sealedRituals = rituals.filter((r) => r.category === 'paid')
  const joined = new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

  const save = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await updateProfile({ name })
      toast(t('profile.updatedToast'))
    } catch (err) {
      setError(err.message)
    }
  }

  const runDownload = async (kind, fn) => {
    setDocBusy(kind)
    try {
      await fn(user)
    } catch {
      toast(t('profile.docs.error'))
    } finally {
      setDocBusy('')
    }
  }

  const handleLogout = () => {
    logout()
    toast(t('nav.leftCircleToast'))
    navigate('/')
  }

  return (
    <>
      <PageHero kicker={isAdmin ? t('profile.keeperKicker') : t('nav.initiateNumber', { number: String(user.initiate || 0).padStart(3, '0') })} title={user.name.toUpperCase()} sub={user.email} image="/assets/community-emblem.jpg" compact>
        <div className="hero-cta">
          {isAdmin && <Link to="/admin" className="btn-gold">▲ {t('profile.adminPanelBtn')}</Link>}
          <button type="button" className="btn-ghost" onClick={handleLogout}>⏻ {t('nav.logout')}</button>
        </div>
      </PageHero>

      {location.state?.denied && (
        <div className="page-section"><div className="notice danger">{t('profile.deniedNotice')}</div></div>
      )}

      {!user.paid && (
        <div className="page-section">
          <div className="notice initiation-notice">
            <div>
              <b>{t('profile.oathNotSealed')}</b>
              <p>{t('profile.completeInitiationText', { fee: INITIATION_FEE_INR })}</p>
            </div>
            <button type="button" className="btn-gold" onClick={() => setShowInitiation(true)}>{t('common.sealYourOathCta')}</button>
          </div>
        </div>
      )}

      <section className="page-section profile-grid">
        <div className="side-card">
          <h4>{t('profile.myDetails')}</h4>
          <form className="form" onSubmit={save}>
            <label><span>{t('common.initiateNameLabel')}</span><input type="text" value={name} minLength={2} required onChange={(e) => setName(e.target.value)} /></label>
            <label><span>{t('common.emailLabel')}</span><input type="email" value={user.email} disabled /></label>
            <label><span>{t('profile.rankLabel')}</span><input type="text" value={isAdmin ? t('profile.rankKeeper') : t('profile.rankInitiate')} disabled /></label>
            <label><span>{t('profile.memberSinceLabel')}</span><input type="text" value={joined} disabled /></label>
            <label><span>{t('profile.membershipLabel')}</span><input type="text" value={user.paid ? t('profile.membershipSealed', { sealId: user.sealId }) : t('profile.membershipNotSealed')} disabled /></label>
            {error && <div className="form-error" role="alert">{error}</div>}
            <button type="submit" className="btn-gold" disabled={name.trim() === user.name}>{t('profile.saveChanges')}</button>
          </form>
        </div>

        <div className="profile-main">
          <SectionHead
            title={t('profile.unsealedContentTitle')}
            sub={user.paid ? t('profile.unsealedSubPaid') : t('profile.unsealedSubUnpaid')}
            size={16}
          />
          <div className="vid-grid page-vid-grid">
            {sealedVideos.map((v) => (
              <Link className="vid" key={v.slug} to={`/videos/${v.slug}`}>
                <div className="vid-thumb"><Img src={v.img} alt={v.title} /><span className="play">{user.paid ? '▶' : '🔒'}</span><span className="dur">{v.dur}</span><span className={`seal-badge${user.paid ? ' unsealed' : ''}`}>{user.paid ? t('common.unsealedBadge') : t('common.sealedBadge')}</span></div>
                <div className="vid-body"><h5>{v.title}</h5><span className={`tag ${v.tag}`}>{t(`common.tags.${v.tag}`)}</span></div>
              </Link>
            ))}
            {sealedRituals.map((r) => (
              <Link className="vid" key={r.slug} to={`/rituals#${r.slug}`}>
                <div className="vid-thumb"><Img src={r.img} alt={r.title} /><span className="play">{r.step}</span><span className={`seal-badge${user.paid ? ' unsealed' : ''}`}>{user.paid ? t('common.unsealedBadge') : t('common.sealedBadge')}</span></div>
                <div className="vid-body"><h5>{r.title}</h5><span className="tag fact">{t('profile.ritualTag')}</span></div>
              </Link>
            ))}
            {sealedVideos.length + sealedRituals.length === 0 && <p className="empty">{t('profile.emptyUnsealed')}</p>}
          </div>

          <SectionHead title={t('profile.continueJourney')} size={16} />
          <div className="quick-links">
            <Link to="/archives">◬ {t('nav.archives')}</Link>
            <Link to="/rituals">◈ {t('nav.rituals')}</Link>
            <Link to="/videos">▶ {t('nav.videos')}</Link>
            <Link to="/community">◎ {t('nav.community')}</Link>
          </div>
        </div>
      </section>

      <section className="page-section" id="documents">
        <SectionHead title={t('profile.docs.title')} sub={t('profile.docs.sub')} />
        <div className="docs-grid">
          <article className="doc-card">
            <div className="doc-thumb doc-letter" aria-hidden="true"><i /><i /><i /><i /></div>
            <div className="doc-body">
              <h4>{t('profile.docs.letterTitle')}</h4>
              <p>{t('profile.docs.letterText')}</p>
              <div className="doc-actions">
                <button type="button" className="btn-gold small" disabled={!user.paid || !!docBusy} onClick={() => runDownload('letter', downloadJoiningLetterPdf)}>
                  {docBusy === 'letter' ? t('profile.docs.preparing') : t('profile.docs.downloadPdf')}
                </button>
              </div>
            </div>
          </article>
          <article className="doc-card">
            <div className="doc-thumb doc-card-thumb" aria-hidden="true"><i /><b /></div>
            <div className="doc-body">
              <h4>{t('profile.docs.cardTitle')}</h4>
              <p>{t('profile.docs.cardText')}</p>
              <div className="doc-actions">
                <button type="button" className="btn-gold small" disabled={!user.paid || !!docBusy} onClick={() => runDownload('cardPng', downloadCardPng)}>
                  {docBusy === 'cardPng' ? t('profile.docs.preparing') : t('profile.docs.downloadPng')}
                </button>
                <button type="button" className="btn-ghost small" disabled={!user.paid || !!docBusy} onClick={() => runDownload('cardPdf', downloadCardPdf)}>
                  {docBusy === 'cardPdf' ? t('profile.docs.preparing') : t('profile.docs.downloadPdf')}
                </button>
              </div>
            </div>
          </article>
        </div>
        {!user.paid && (
          <p className="docs-locked">
            {t('profile.docs.locked')} <button type="button" className="link-btn" onClick={() => setShowInitiation(true)}>{t('common.sealYourOathCta')}</button>
          </p>
        )}
        <p className="docs-note">{t('profile.docs.note')}</p>
      </section>

      <InitiationModal open={showInitiation} onClose={() => setShowInitiation(false)} />
    </>
  )
}
