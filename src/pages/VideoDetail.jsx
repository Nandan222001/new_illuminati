import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
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

  if (!video) return <Navigate to="/videos" replace />
  const open = canAccess(video.category)
  const related = VIDEOS.filter((v) => v.slug !== video.slug).slice(0, 4)

  return (
    <section className="page-section detail video-detail">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">HOME</Link><span>/</span><Link to="/videos">VIDEOS</Link><span>/</span><b>{video.title}</b>
      </nav>

      <div className={`player${playing ? ' playing' : ''}`}>
        <Img src={video.img} alt={video.title} eager />
        {open ? (
          <>
            {!playing && (
              <button type="button" className="play big-play" aria-label="Play" onClick={() => { setPlaying(true); toast(`Now playing: ${video.title} (demo)`) }}>▶</button>
            )}
            {playing && (
              <div className="player-bar">
                <button type="button" onClick={() => setPlaying(false)} aria-label="Pause">❚❚</button>
                <div className="progress"><span /></div>
                <em>00:00 / {video.dur}</em>
              </div>
            )}
          </>
        ) : (
          <div className="player-locked">
            <b>🔒 SEALED FOR INITIATES</b>
            {user ? (
              <>
                <p>This episode unlocks once your oath is sealed (a one-time ₹{INITIATION_FEE_INR} initiation).</p>
                <div className="detail-actions">
                  <button type="button" className="btn-gold" onClick={() => setShowInitiation(true)}>SEAL YOUR OATH ›</button>
                </div>
              </>
            ) : (
              <>
                <p>This episode is available to signed-in members of the Brotherhood.</p>
                <div className="detail-actions">
                  <Link to="/login" state={{ from: `/videos/${video.slug}` }} className="btn-gold">SIGN IN ›</Link>
                  <Link to="/register" className="btn-ghost">BECOME AN INITIATE</Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="video-info">
        <div>
          <span className={`tag ${video.tag}`}>{video.tag.toUpperCase()}</span>
          <h1>{video.title}</h1>
          <div className="featured-meta"><span>▶ {video.dur}</span><span>{video.views} views</span><span>{video.date}</span></div>
          <p>{video.desc}</p>
          <p className="muted">Labels: <b>FICTION</b> = dramatised story · <b>THEORY</b> = popular ideas discussed critically · <b>FACT</b> = documented history.</p>
        </div>
        <div className="video-side">
          <button type="button" className="btn-ghost" onClick={() => toast(user ? 'Saved to your watchlist (demo)' : 'Sign in to save episodes')}>＋ WATCHLIST</button>
          <button type="button" className="btn-ghost" onClick={() => { navigator.clipboard?.writeText(window.location.href).catch(() => {}); toast('Link copied') }}>⇪ SHARE</button>
        </div>
      </div>

      <SectionHead title="MORE FROM THE ARCHIVE" />
      <div className="vid-grid page-vid-grid">
        {related.map((v) => (
          <Link className="vid" key={v.slug} to={`/videos/${v.slug}`}>
            <div className="vid-thumb">
              <Img src={v.img} alt={v.title} />
              <span className="play">{canAccess(v.category) ? '▶' : '🔒'}</span>
              <span className="dur">{v.dur}</span>
            </div>
            <div className="vid-body">
              <h5>{v.title}</h5>
              <span className={`tag ${v.tag}`}>{v.tag.toUpperCase()}</span>
            </div>
          </Link>
        ))}
      </div>

      <InitiationModal open={showInitiation} onClose={() => setShowInitiation(false)} />
    </section>
  )
}
