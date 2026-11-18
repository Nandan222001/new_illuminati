import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import EditorialHeader, { Breadcrumbs } from '../components/EditorialHeader'
import StoryCard from '../components/StoryCard'
import ShareLinks from '../components/ShareLinks'
import { findStory, formatStoryDate, latestStories, storyDate, STORY_AUTHOR, STORY_INDEX_PATH } from '../data/stories/index.js'
import NotFound from './NotFound'

export function StoryDate({ date }) {
  const { i18n } = useTranslation()
  return <time dateTime={date}>{formatStoryDate(date, i18n.resolvedLanguage || 'en')}</time>
}

export default function Stories() {
  const { t } = useTranslation()
  return (
    <div className="editorial-frame editorial-page">
      <Breadcrumbs items={[{ label: t('editorial.stories') }]} />
      <EditorialHeader kicker={t('editorial.storyIndex.kicker')} title={t('editorial.stories')} description={t('editorial.storyIndex.description')}>
        <p className="editorial-date">{t('editorial.updated')} <StoryDate date={storyDate(latestStories[0])} /></p>
      </EditorialHeader>
      <section aria-label={t('editorial.latest')} className="story-grid">
        {latestStories.map((story) => <StoryCard key={story.slug} story={story} />)}
      </section>
    </div>
  )
}

export function StoryDetail() {
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const story = findStory(pathname.replace(/\/+$/, ''))
  if (!story) return <NotFound />

  return (
    <div className="editorial-frame editorial-page editorial-article-page">
      <Breadcrumbs items={[{ label: t('editorial.stories'), to: STORY_INDEX_PATH }, { label: story.title }]} />
      <article className="editorial-article" lang="en">
        <EditorialHeader kicker={story.category} title={story.title} description={story.intro}>
          <p className="editorial-byline">
            <Link to="/about#editorial">{STORY_AUTHOR}</Link>
            <span aria-hidden="true">·</span>
            <time dateTime={storyDate(story)}>{formatStoryDate(storyDate(story))}</time>
          </p>
        </EditorialHeader>
        {story.notice && <p className="editorial-notice">{story.notice}</p>}
        <div className="editorial-prose">
          {story.sections.map(({ title, paragraphs, sources }) => (
            <section key={title}>
              <h2>{title}</h2>
              {paragraphs.map((p, i) => (
                <p key={p.slice(0, 36)}>{p}{i === paragraphs.length - 1 && (
                  <span className="source-refs">{sources.map((n) => <a key={n} href={`#source-${n}`} aria-label={`Source ${n}`}>[{n}]</a>)}</span>
                )}</p>
              ))}
            </section>
          ))}
          <section className="editorial-sources" aria-labelledby="sources-title">
            <h2 id="sources-title">Sources and further reading</h2>
            <ol>
              {story.sources.map(({ publisher, title, url }, i) => (
                <li key={url} id={`source-${i + 1}`}><a href={url}>{title}</a> <span>— {publisher}</span></li>
              ))}
            </ol>
          </section>
        </div>
      </article>
      <div className="editorial-article">
        <ShareLinks key={story.path} title={story.title} path={story.path} />
      </div>
      <section className="editorial-section">
        <div className="editorial-section-head">
          <h2>{t('editorial.moreStories')}</h2>
          <Link className="editorial-text-link" to={STORY_INDEX_PATH}>{t('editorial.allStories')} <span aria-hidden="true">→</span></Link>
        </div>
        <div className="story-grid">
          {latestStories.filter((item) => item !== story).slice(0, 3).map((item) => <StoryCard key={item.slug} story={item} />)}
        </div>
      </section>
    </div>
  )
}
