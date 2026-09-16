import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useContent } from '../context/ContentContext'
import { useToast } from '../context/ToastContext'
import { INITIATION_FEE_INR } from '../auth/authService'
import Img from '../components/Img'
import SectionHead from '../components/SectionHead'
import InitiationModal from '../components/InitiationModal'

export default function VideoDetail() {
  const { slug } = useParams()
  const { videos: VIDEOS, canAccess } = useContent()
  const video = VIDEOS.find((v) => v.slug === slug)
  const [playing, setPlaying] = useState(false)
  const [showInitiation, setShowInitiation] = useState(false)
  const { user } = useAuth()
  const toast = useToast()
  const { t } = useTranslation()

  if (!video) return <Navigate to="/videos" replace />
  const open = canAccess(video.category) && !!user
  const related = VIDEOS.filter((v) => v.slug !== video.slug).slice(0, 4)

  return (
    <section className="page-section detail video-detail">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">{t('nav.home')}</Link><span>/</span><Link to="/videos">{t('nav.videos')}</Link><span>/</span><b>{video.title}</b>
      </nav>

      <div className={`player${playing ? ' playing' : ''}`}>
        <Img src={video.img} alt={video.title} eager />
        {open ? (
          <>
            {!playing && (
              <button type="button" className="play big-play" aria-label={t('common.play')} onClick={() => { setPlaying(true); toast(t('videoDetail.nowPlayingToast', { title: video.title })) }}>▶</button>
            )}
            {playing && (
              <div className="player-bar">
                <button type="button" onClick={() => setPlaying(false)} aria-label={t('common.pause')}>❚❚</button>
                <div className="progress"><span /></div>
                <em>00:00 / {video.dur}</em>
              </div>
            )}
          </>
        ) : (
          <div className="player-locked">
            <b>{t('videoDetail.sealedForInitiates')}</b>
            {user ? (
              <>
                <p>{t('videoDetail.unlocksText', { fee: INITIATION_FEE_INR })}</p>
                <div className="detail-actions">
                  <button type="button" className="btn-gold" onClick={() => setShowInitiation(true)}>{t('common.sealYourOathCta')}</button>
                </div>
              </>
            ) : (
              <>
                <p>{t('videoDetail.availableSignedIn')}</p>
                <div className="detail-actions">
                  <Link to="/login" state={{ from: `/videos/${video.slug}` }} className="btn-gold">{t('videoDetail.signInCta')}</Link>
                  <Link to="/register" className="btn-ghost">{t('common.becomeInitiate')}</Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="video-info">
        <div>
          <span className={`tag ${video.tag}`}>{t(`common.tags.${video.tag}`)}</span>
          <h1>{video.title}</h1>
          <div className="featured-meta"><span>▶ {video.dur}</span><span>{video.views} {t('common.viewsSuffix')}</span><span>{video.date}</span></div>
          <p>{video.desc}</p>
          <p className="muted"><Trans i18nKey="videoDetail.labelsLegend" components={{ 0: <b />, 1: <b />, 2: <b /> }} /></p>
        </div>
        <div className="video-side">
          <button type="button" className="btn-ghost" onClick={() => toast(user ? t('videoDetail.watchlistToast') : t('videoDetail.watchlistSignInToast'))}>{t('videoDetail.watchlist')}</button>
          <button type="button" className="btn-ghost" onClick={() => { navigator.clipboard?.writeText(window.location.href).catch(() => {}); toast(t('videoDetail.linkCopiedToast')) }}>{t('videoDetail.share')}</button>
        </div>
      </div>

      <SectionHead title={t('videoDetail.moreFromArchive')} />
      <div className="vid-grid page-vid-grid">
        {related.map((v) => (
          <Link className="vid" key={v.slug} to={`/videos/${v.slug}`}>
            <div className="vid-thumb">
              <Img src={v.img} alt={v.title} />
              <span className="play">{canAccess(v.category) && !!user ? '▶' : '🔒'}</span>
              <span className="dur">{v.dur}</span>
            </div>
            <div className="vid-body">
              <h5>{v.title}</h5>
              <span className={`tag ${v.tag}`}>{t(`common.tags.${v.tag}`)}</span>
            </div>
          </Link>
        ))}
      </div>

      <InitiationModal open={showInitiation} onClose={() => setShowInitiation(false)} />
    </section>
  )
}
