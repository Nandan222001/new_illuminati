import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useContent } from '../context/ContentContext'
import { useToast } from '../context/ToastContext'
import { INITIATION_FEE_INR } from '../auth/authService'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import Img from '../components/Img'
import InitiationModal from '../components/InitiationModal'

export default function Profile() {
  const { user, isAdmin, logout, updateProfile } = useAuth()
  const { videos, rituals } = useContent()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [name, setName] = useState(user.name)
  const [error, setError] = useState('')
  const [showInitiation, setShowInitiation] = useState(false)

  const sealedVideos = videos.filter((v) => v.category === 'paid')
  const sealedRituals = rituals.filter((r) => r.category === 'paid')
  const joined = new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

  const save = (e) => {
    e.preventDefault()
    setError('')
    try {
      updateProfile({ name })
      toast('Profile updated.')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleLogout = () => {
    logout()
    toast('You have left the circle. Until next time.')
    navigate('/')
  }

  return (
    <>
      <PageHero kicker={isAdmin ? 'KEEPER OF THE ARCHIVE' : `INITIATE #${String(user.initiate || 0).padStart(3, '0')}`} title={user.name.toUpperCase()} sub={user.email} image="/assets/community-emblem.jpg" compact>
        <div className="hero-cta">
          {isAdmin && <Link to="/admin" className="btn-gold">▲ ADMIN PANEL</Link>}
          <button type="button" className="btn-ghost" onClick={handleLogout}>⏻ LOGOUT</button>
        </div>
      </PageHero>

      {location.state?.denied && (
        <div className="page-section"><div className="notice danger">That area is reserved for Keepers (admins).</div></div>
      )}

      {!user.paid && (
        <div className="page-section">
          <div className="notice initiation-notice">
            <div>
              <b>🔒 Your oath is not yet sealed.</b>
              <p>Complete your initiation for a one-time fee of ₹{INITIATION_FEE_INR} to unlock every sealed chapter, ritual and reel across the archive.</p>
            </div>
            <button type="button" className="btn-gold" onClick={() => setShowInitiation(true)}>SEAL YOUR OATH ›</button>
          </div>
        </div>
      )}

      <section className="page-section profile-grid">
        <div className="side-card">
          <h4>MY DETAILS</h4>
          <form className="form" onSubmit={save}>
            <label><span>INITIATE NAME</span><input type="text" value={name} minLength={2} required onChange={(e) => setName(e.target.value)} /></label>
            <label><span>EMAIL</span><input type="email" value={user.email} disabled /></label>
            <label><span>RANK</span><input type="text" value={isAdmin ? 'Keeper (admin)' : 'Initiate (member)'} disabled /></label>
            <label><span>MEMBER SINCE</span><input type="text" value={joined} disabled /></label>
            <label><span>MEMBERSHIP</span><input type="text" value={user.paid ? `Sealed · ${user.sealId}` : 'Not yet sealed'} disabled /></label>
            {error && <div className="form-error" role="alert">{error}</div>}
            <button type="submit" className="btn-gold" disabled={name.trim() === user.name}>SAVE CHANGES</button>
          </form>
        </div>

        <div className="profile-main">
          <SectionHead
            title="YOUR UNSEALED CONTENT"
            sub={user.paid ? 'YOUR SEALED OATH UNLOCKS EVERYTHING BELOW.' : 'SEAL YOUR OATH TO UNLOCK THE RECORDS BELOW.'}
            size={16}
          />
          <div className="vid-grid page-vid-grid">
            {sealedVideos.map((v) => (
              <Link className="vid" key={v.slug} to={`/videos/${v.slug}`}>
                <div className="vid-thumb"><Img src={v.img} alt={v.title} /><span className="play">{user.paid ? '▶' : '🔒'}</span><span className="dur">{v.dur}</span><span className={`seal-badge${user.paid ? ' unsealed' : ''}`}>{user.paid ? '◈ UNSEALED' : '🔒 SEALED'}</span></div>
                <div className="vid-body"><h5>{v.title}</h5><span className={`tag ${v.tag}`}>{v.tag.toUpperCase()}</span></div>
              </Link>
            ))}
            {sealedRituals.map((r) => (
              <Link className="vid" key={r.slug} to={`/rituals#${r.slug}`}>
                <div className="vid-thumb"><Img src={r.img} alt={r.title} /><span className="play">{r.step}</span><span className={`seal-badge${user.paid ? ' unsealed' : ''}`}>{user.paid ? '◈ UNSEALED' : '🔒 SEALED'}</span></div>
                <div className="vid-body"><h5>{r.title}</h5><span className="tag fact">RITUAL</span></div>
              </Link>
            ))}
            {sealedVideos.length + sealedRituals.length === 0 && <p className="empty">Nothing is sealed right now — every record is open to all.</p>}
          </div>

          <SectionHead title="CONTINUE THE JOURNEY" size={16} />
          <div className="quick-links">
            <Link to="/archives">◬ THE ARCHIVES</Link>
            <Link to="/rituals">◈ THE RITUALS</Link>
            <Link to="/videos">▶ THE VIDEOS</Link>
            <Link to="/community">◎ THE COMMUNITY</Link>
          </div>
        </div>
      </section>

      <InitiationModal open={showInitiation} onClose={() => setShowInitiation(false)} />
    </>
  )
}
