import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CHANNELS, INSTA_IMAGES, PAGES } from '../data/content'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import Img from '../components/Img'

const SEED_POSTS = [
  { id: 'p1', author: 'Grand Keeper', role: 'admin', time: '2h ago', text: 'The fourth chamber opens to initiates this week. Bring your interpretation of the Black Sun — the best reading gets pinned.' },
  { id: 'p2', author: 'Vesper', role: 'member', time: '5h ago', text: 'Re-watched Hidden Societies. The empty thirteenth seat theory holds up if you pause at 06:12.' },
  { id: 'p3', author: 'Orrin', role: 'member', time: '1d ago', text: 'Has anyone mapped the sigils on the Visuals page against the grimoire parchment? Three of them repeat.' },
]

export default function Community() {
  const page = PAGES.community
  const { user, isAdmin } = useAuth()
  const toast = useToast()
  const [posts, setPosts] = useState(SEED_POSTS)
  const [draft, setDraft] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setPosts((p) => [{ id: `p${Date.now()}`, author: user.name, role: user.role, time: 'just now', text }, ...p])
    setDraft('')
    toast('Posted to the board (demo — not persisted)')
  }

  return (
    <>
      <PageHero kicker={page.kicker} title={page.title} sub={page.sub} image={page.hero}>
        <p className="page-intro">{page.intro}</p>
      </PageHero>

      <section className="page-section">
        <SectionHead title="THE CHANNELS" sub="PICK YOUR SEAT AT THE TABLE." />
        <div className="channel-grid">
          {CHANNELS.map((c) => (
            <button type="button" className="channel" key={c.name} onClick={() => toast(c.note)}>
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
          <SectionHead title="DISCUSSION BOARD" sub="LATEST FROM THE INITIATES." size={16} />
          {user ? (
            <form className="post-form" onSubmit={submit}>
              <textarea rows={3} maxLength={400} placeholder={`Share a theory, ${user.name.split(' ')[0]}…`} value={draft} onChange={(e) => setDraft(e.target.value)} />
              <div className="post-form-foot">
                <span className="muted">{draft.length}/400</span>
                <button type="submit" className="btn-gold" disabled={!draft.trim()}>POST ›</button>
              </div>
            </form>
          ) : (
            <div className="post-locked">
              <p>Only initiates may post. <Link to="/login">Sign in</Link> or <Link to="/register">register</Link> to join the discussion.</p>
            </div>
          )}
          <ul className="posts">
            {posts.map((p) => (
              <li className="post" key={p.id}>
                <span className={`avatar${p.role === 'admin' ? ' admin' : ''}`}>{p.author[0]}</span>
                <div>
                  <div className="post-head"><b>{p.author}</b>{p.role === 'admin' && <em className="role-pill admin">KEEPER</em>}<span>{p.time}</span></div>
                  <p>{p.text}</p>
                </div>
              </li>
            ))}
          </ul>
          {isAdmin && <p className="muted">You are viewing the board as a Keeper. Moderation tools live in the <Link to="/admin">admin panel</Link>.</p>}
        </div>

        <aside className="community-side">
          <div className="side-card">
            <div className="comm-emblem-wrap"><Img className="comm-emblem" src="/assets/community-emblem.jpg" alt="Brotherhood emblem" /></div>
            <h4>THE EMBLEM</h4>
            <p>Every initiate receives the seal at the seventh station. Wear it in your profile.</p>
            {!user && <Link to="/register" className="btn-gold">BECOME AN INITIATE ›</Link>}
            {user && <Link to="/profile" className="btn-gold">MY PROFILE ›</Link>}
          </div>
          <div className="side-card">
            <h4>FOLLOW ON INSTAGRAM</h4>
            <div className="insta-grid tight">
              {INSTA_IMAGES.map((img, i) => (
                <a href="#" key={i} onClick={(e) => { e.preventDefault(); toast('Opening Instagram (demo)') }}><Img src={img} alt="Instagram post" /></a>
              ))}
            </div>
            <div className="insta-foot">
              <button className="follow-btn" onClick={() => toast('Following @illuminati.brotherhood (demo)')}>📷 FOLLOW NOW</button>
              <span className="handle">@illuminati.brotherhood</span>
            </div>
          </div>
          <div className="comm-note">18+ recommended for mature content. Be kind — this is a story we tell together.</div>
        </aside>
      </section>
    </>
  )
}
