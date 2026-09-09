import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FAQ, PAGES, TIMELINE } from '../data/content'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import Img from '../components/Img'

const PILLARS = [
  { icon: '◬', title: 'STORY FIRST', text: 'Every page is a chapter. The archive, the rituals and the countdown are narrative devices — not claims.' },
  { icon: '◈', title: 'CLEARLY LABELLED', text: 'Videos are tagged fiction, theory or fact so you always know what you are watching.' },
  { icon: '◎', title: 'COMMUNITY LED', text: 'Initiates vote on where the story goes next. The council listens.' },
  { icon: '⊘', title: 'NO REAL-WORLD CLAIMS', text: 'We never target real people or organisations. Resemblances are coincidental or referential.' },
]

export default function About() {
  const page = PAGES.about
  const [open, setOpen] = useState(0)

  return (
    <>
      <PageHero kicker={page.kicker} title={page.title} sub={page.sub} image={page.hero}>
        <p className="page-intro">{page.intro}</p>
      </PageHero>

      <section className="page-section">
        <SectionHead title="WHAT WE STAND FOR" sub="FOUR PILLARS OF THE EXPERIENCE." />
        <div className="pillar-grid">
          {PILLARS.map((p) => (
            <article className="pillar" key={p.title}>
              <span className="pillar-icon">{p.icon}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section about-story">
        <div className="about-img"><Img src="/assets/archives-hero.jpg" alt="The library" /></div>
        <div className="about-text">
          <SectionHead title="THE STORY SO FAR" />
          <ol className="story-timeline">
            {TIMELINE.map((t) => (
              <li key={t.year}><b>{t.year}</b><h4>{t.title}</h4><p>{t.text}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="page-section" id="faq">
        <SectionHead title="FREQUENTLY ASKED" sub="THE QUESTIONS EVERY INITIATE ASKS FIRST." />
        <div className="faq">
          {FAQ.map((f, i) => (
            <div className={`faq-item${open === i ? ' open' : ''}`} key={f.q}>
              <button type="button" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                <span>{f.q}</span><em>{open === i ? '−' : '+'}</em>
              </button>
              <div className="faq-a"><p>{f.a}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="page-section band" id="disclaimer">
        <div className="band-inner">
          <div>
            <div className="sec-title">CONTENT DISCLAIMER</div>
            <p className="band-text">Illuminati Brotherhood is a work of fiction created for entertainment. It does not promote, describe or endorse any real ritual, belief system, organisation or ideology. Some imagery is dark and mature in tone; 18+ is recommended. If you are affected by any themes on this site, please step away and reach out to someone you trust.</p>
          </div>
          <div className="band-actions">
            <Link to="/register" className="btn-gold">BECOME AN INITIATE ›</Link>
            <Link to="/community" className="btn-ghost">JOIN THE COMMUNITY</Link>
          </div>
        </div>
      </section>
    </>
  )
}
