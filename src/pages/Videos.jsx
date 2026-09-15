import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PAGES } from '../data/content'
import { useAuth } from '../context/AuthContext'
import { useContent } from '../context/ContentContext'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import Img from '../components/Img'

const FILTERS = ['all', 'fiction', 'theory', 'fact']

export default function Videos() {
  const page = PAGES.videos
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const { videos: VIDEOS, canAccess } = useContent()
  const { user } = useAuth()

  const list = useMemo(() => VIDEOS.filter((v) => {
    if (filter !== 'all' && v.tag !== filter) return false
    if (query && !`${v.title} ${v.desc}`.toLowerCase().includes(query.toLowerCase())) return false
    return true
  }), [VIDEOS, filter, query])

  const featured = VIDEOS[0]

  return (
    <>
      <PageHero kicker={page.kicker} title={page.title} sub={page.sub} image={page.hero} imageMobile={page.heroMobile}>
        <p className="page-intro">{page.intro}</p>
      </PageHero>

      <section className="page-section">
        <SectionHead title="NOW SCREENING" sub="THE FEATURED EPISODE THIS WEEK." />
        <Link to={`/videos/${featured.slug}`} className="featured-video">
          <Img src={featured.img} alt={featured.title} />
          <div className="featured-cap">
            <span className={`tag ${featured.tag}`}>{featured.tag.toUpperCase()}</span>
            <h3>{featured.title}</h3>
            <p>{featured.desc}</p>
            <div className="featured-meta"><span>▶ {featured.dur}</span><span>{featured.views} views</span><span>{featured.date}</span></div>
          </div>
          {(() => {
            const open = canAccess(featured.category) && !!user
            if (open) return <span className="play big-play">▶</span>
            return (
              <>
                <span className="play big-play">🔒</span>
                <span className="seal-badge">{user ? '🔒 SEALED' : '🔒 SIGN IN TO WATCH'}</span>
              </>
            )
          })()}
        </Link>
      </section>

      <section className="page-section">
        <SectionHead
          title="ALL EPISODES"
          sub={`${list.length} OF ${VIDEOS.length} EPISODES`}
          right={(
            <div className="filter-bar">
              <input type="search" placeholder="Search the archives…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search videos" />
              <div className="chips">
                {FILTERS.map((f) => (
                  <button key={f} type="button" className={`chip${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>{f.toUpperCase()}</button>
                ))}
              </div>
            </div>
          )}
        />
        {list.length === 0 ? (
          <p className="empty">Nothing in the archive matches that search.</p>
        ) : (
          <div className="vid-grid page-vid-grid">
            {list.map((v) => {
              const locked = v.category === 'paid'
              const open = canAccess(v.category) && !!user
              const needsLogin = !user
              return (
                <Link className={`vid${!open ? ' sealed' : ''}`} key={v.slug} to={`/videos/${v.slug}`}>
                  <div className="vid-thumb">
                    <Img src={v.img} alt={v.title} />
                    <span className="play">{open ? '▶' : '🔒'}</span>
                    <span className="dur">{v.dur}</span>
                    {!open && <span className="seal-badge">{needsLogin ? '🔒 SIGN IN TO WATCH' : '🔒 SEALED'}</span>}
                    {open && locked && <span className="seal-badge unsealed">◈ UNSEALED</span>}
                  </div>
                  <div className="vid-body">
                    <h5>{v.title}</h5>
                    <span className="vid-sub">{v.date} · {v.views} views</span>
                    <span className={`tag ${v.tag}`}>{v.tag.toUpperCase()}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
