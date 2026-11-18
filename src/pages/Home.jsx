import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocalizedArchives } from '../hooks/useLocalizedContent'
import { formatStoryDate, latestStories, storyDate, STORY_INDEX_PATH } from '../data/stories/index.js'
import ArchivePreviewGrid from '../components/ArchivePreviewGrid'
import InstagramFollow from '../components/InstagramFollow'
import StoryCard from '../components/StoryCard'

export default function Home() {
  const { t, i18n } = useTranslation()
  const cards = useLocalizedArchives().filter((card) => !card.custom)
  const latestDate = storyDate(latestStories[0])

  return (
    <>
      <div className="editorial-home-hero">
        <header className="editorial-frame editorial-hero-inner" id="home">
          <div className="editorial-hero-copy">
            <p className="editorial-kicker editorial-ruled">{t('editorial.home.kicker')}</p>
            <h1>{t('editorial.home.title')}</h1>
            <p className="editorial-lede">{t('editorial.home.description')}</p>
            <div className="editorial-actions">
              <Link className="editorial-button" to={STORY_INDEX_PATH}>{t('editorial.home.explore')} <span aria-hidden="true">→</span></Link>
              <Link className="editorial-button secondary" to="/visuals">{t('editorial.home.exploreSymbols')}</Link>
            </div>
            <p className="editorial-hero-note">{t('editorial.disclaimer')} <Link to="/about#disclaimer">{t('editorial.learnMore')}</Link></p>
          </div>
          <div className="editorial-hero-art" aria-hidden="true">
            <img src="/assets/editorial-emblem.svg" alt="" width="580" height="480" />
          </div>
        </header>
      </div>

      <div className="editorial-frame editorial-home-body">
        <section className="editorial-section" aria-labelledby="latest-stories-title" id="latest-stories">
          <div className="editorial-section-head">
            <div>
              <p className="editorial-kicker">{t('editorial.home.readingRoom')}</p>
              <h2 id="latest-stories-title">{t('editorial.latest')}</h2>
              <p className="editorial-date">
                {t('editorial.storyCount', { count: latestStories.length })} <span aria-hidden="true">·</span>{' '}
                {t('editorial.updated')} <time dateTime={latestDate}>{formatStoryDate(latestDate, i18n.resolvedLanguage)}</time>
              </p>
            </div>
            <Link className="editorial-text-link" to={STORY_INDEX_PATH}>{t('editorial.allStories')} <span aria-hidden="true">→</span></Link>
          </div>
          <div className="story-grid">
            {latestStories.slice(0, 3).map((story) => <StoryCard key={story.slug} story={story} />)}
          </div>
        </section>

        <div className="home-reading-notes" lang="en">
          <section className="editorial-prose" aria-labelledby="history-title">
            <h2 id="history-title">What is the Illuminati in history?</h2>
            <p>The Illuminati was the name of a documented Enlightenment-era society founded by Adam Weishaupt in Bavaria in 1776. Its members used private correspondence and a hierarchy to organize themselves. Bavarian authorities banned the group in 1785; researchers at the University of Erfurt have traced a later phase in Thuringia through 1787. The modern legend of an organization directing world events is not supported by the evidence documenting that historical group.</p>
            <p>A surviving letter can show what someone planned or believed. It cannot, by itself, prove that a plan succeeded. Notice that difference as you read. It is a useful way to approach a remarkable claim: start with a dated record, read it in context, and separate what it says from what someone later inferred.</p>
            <p>Our <Link to="/stories/bavarian-illuminati-1776">Bavarian Illuminati article</Link> explains what survives in the records and why historians distinguish a ban from the final evidence of activity. The <Link to="/new-order">New World Order explainer</Link> puts a frequently quoted political speech back into context. You can follow the sources in either article yourself, including public records and university research.</p>
          </section>
          <section className="editorial-prose" aria-labelledby="symbols-title">
            <h2 id="symbols-title">What do these symbols really mean?</h2>
            <p>Look at the back of a U.S. dollar bill and you will find an eye inside a triangle near the top of a pyramid. That eye, the Eye of Providence, had a specific meaning for the designers of the Great Seal. It is not the same as every motif of an eye, or as the spiritual idea of a third eye. Likewise, a royal burial complex at Giza and an engraved pyramid on a national seal share a shape without sharing a purpose.</p>
            <p>Start with <Link to="/stories/eye-of-providence">the eye on the dollar</Link>, compare <Link to="/stories/pyramid-symbol">the two histories of the pyramid</Link>, or open our feature on <Link to="/stories/grimoires-history-and-fiction">real and fictional grimoires</Link>. Each article links directly to the records, collections or scholarship it uses. The separate story archive presents invented scenes and artwork; those are not historical sources. The educational articles and catalogue previews are free to read without creating an account.</p>
          </section>
        </div>

        <section className="editorial-section" aria-labelledby="archive-preview-title" id="archives">
          <div className="editorial-section-head">
            <div>
              <p className="editorial-kicker">{t('editorial.home.fiction')}</p>
              <h2 id="archive-preview-title">{t('editorial.home.archiveTitle')}</h2>
              <p className="editorial-section-description">{t('editorial.home.archiveDescription')}</p>
            </div>
            <Link className="editorial-text-link" to="/archives">{t('editorial.home.allArchives')} <span aria-hidden="true">→</span></Link>
          </div>
          <ArchivePreviewGrid cards={cards} />
        </section>

        <section className="editorial-section editorial-directory" aria-labelledby="explore-more-title">
          <h2 id="explore-more-title">{t('editorial.home.keepExploring')}</h2>
          <div className="editorial-actions">
            <Link className="editorial-button secondary" to="/visuals">{t('home.allVisuals')} <span aria-hidden="true">→</span></Link>
            <Link className="editorial-button secondary" to="/videos">{t('home.allVideos')} <span aria-hidden="true">→</span></Link>
            <Link className="editorial-button secondary" to="/about">{t('editorial.home.aboutProject')} <span aria-hidden="true">→</span></Link>
          </div>
        </section>
        <InstagramFollow />
      </div>
    </>
  )
}
