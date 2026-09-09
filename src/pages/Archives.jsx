import { Link } from 'react-router-dom'
import { CARDS, PAGES } from '../data/content'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import Img from '../components/Img'

export default function Archives() {
  const page = PAGES.archives
  return (
    <>
      <PageHero kicker={page.kicker} title={page.title} sub={page.sub} image={page.hero}>
        <p className="page-intro">{page.intro}</p>
      </PageHero>

      <section className="page-section">
        <SectionHead title="THE SIX CHAMBERS" sub="OPEN A CHAMBER TO READ ITS RECORD." />
        <div className="chamber-list">
          {CARDS.map((c, i) => (
            <Link to={`/archives/${c.slug}`} className={`chamber${i % 2 ? ' reverse' : ''}`} key={c.slug}>
              <div className="chamber-img"><Img src={c.img} alt={c.title} /></div>
              <div className="chamber-body">
                <span className="chamber-num">{c.era}</span>
                <h3>{c.title}</h3>
                <p className="chamber-desc">{c.desc}</p>
                <p className="chamber-cap">{c.cap}</p>
                <em className="sec-link">OPEN THE RECORD ›</em>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-section band">
        <div className="band-inner">
          <div>
            <div className="sec-title">THE ARCHIVE NEVER CLOSES</div>
            <p className="band-text">New chambers are added as the story grows. Initiates are notified first, and sealed records open to signed-in members.</p>
          </div>
          <div className="band-actions">
            <Link to="/rituals" className="btn-gold">THE RITUALS ›</Link>
            <Link to="/videos" className="btn-ghost">WATCH THE ARCHIVES</Link>
          </div>
        </div>
      </section>
    </>
  )
}
