import { Link } from 'react-router-dom'
import { PAGES, RITUALS } from '../data/content'
import { useAuth } from '../context/AuthContext'
import { useContent } from '../context/ContentContext'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import Img from '../components/Img'

export default function Rituals() {
  const page = PAGES.rituals
  const { user } = useAuth()
  const { isLocked, canAccess } = useContent()

  return (
    <>
      <PageHero kicker={page.kicker} title={page.title} sub={page.sub} image={page.hero} imageMobile={page.heroMobile}>
        <p className="page-intro">{page.intro}</p>
      </PageHero>

      <section className="page-section">
        <SectionHead
          title="THE SEVEN STATIONS"
          sub="FOLLOW THE PATH OF THE INITIATE FROM FIRST CANDLE TO SEALED OATH."
          right={!user && <Link to="/register" className="sec-link">SIGN UP TO UNSEAL ›</Link>}
        />
        <ol className="ritual-timeline">
          {RITUALS.map((r) => {
            const locked = isLocked(r.slug)
            const open = canAccess(r.slug)
            return (
              <li className="ritual" key={r.slug} id={r.slug}>
                <div className="ritual-step"><span>{r.step}</span></div>
                <div className={`ritual-card${!open ? ' sealed' : ''}`}>
                  <div className="ritual-img">
                    <Img src={r.img} alt={r.title} />
                    {locked && <span className={`seal-badge${open ? ' unsealed' : ''}`}>{open ? '◈ UNSEALED' : '🔒 SEALED'}</span>}
                  </div>
                  <div className="ritual-body">
                    <span className="ritual-meta">{r.duration}</span>
                    <h3>{r.title}</h3>
                    {open ? (
                      <p>{r.desc}</p>
                    ) : (
                      <p className="sealed-text">This station is sealed. <Link to="/login">Sign in</Link> or <Link to="/register">become an initiate</Link> to read the record.</p>
                    )}
                    <div className="tag-row">{r.tags.map((t) => <span className="tag fact" key={t}>{t.toUpperCase()}</span>)}</div>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="page-section band">
        <div className="band-inner">
          <div>
            <div className="sec-title">STAGED. SYMBOLIC. FICTIONAL.</div>
            <p className="band-text">No real rituals are described or encouraged anywhere in this experience. The stations are narrative devices — scenes in a story you are invited to explore.</p>
          </div>
          <div className="band-actions">
            <Link to="/videos" className="btn-gold">WATCH THE DOCUMENTARIES ›</Link>
            <Link to="/about#disclaimer" className="btn-ghost">CONTENT DISCLAIMER</Link>
          </div>
        </div>
      </section>
    </>
  )
}
