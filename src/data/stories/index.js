import bavarianIlluminati from './bavarianIlluminati.js'
import eyeOfProvidence from './eyeOfProvidence.js'
import pyramidSymbol from './pyramidSymbol.js'
import newWorldOrder from './newWorldOrder.js'
import grimoires from './grimoires.js'

export const STORY_AUTHOR = 'Illuminati Brotherhood Editorial'
export const STORY_INDEX_PATH = '/stories'

// Set updatedAt only when a story is materially revised. Readers and the sitemap
// should see editorial dates, not the date the site was last built or visited.
const STORIES = [bavarianIlluminati, eyeOfProvidence, newWorldOrder, pyramidSymbol, grimoires].map((story) => ({
  path: `${STORY_INDEX_PATH}/${story.slug}`,
  publishedAt: '2026-11-18',
  ...story,
}))

export const latestStories = [...STORIES].sort((a, b) => storyDate(b).localeCompare(storyDate(a)))
export const storyPaths = STORIES.map(({ path }) => path)

export function storyDate(story) {
  return story.updatedAt || story.publishedAt
}

export function formatStoryDate(date, locale = 'en') {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(date))
}

export function findStory(path) {
  return STORIES.find((story) => story.path === path)
}
