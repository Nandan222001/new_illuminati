import { useTranslation } from 'react-i18next'
import { CARDS, CHANNELS, SYMBOLS, TATTOOS } from '../data/content'
import { useContent } from '../context/ContentContext'

/** Keep built-in chapters in display order and honor the API's visible list. */
export function useLocalizedArchives() {
  const { t } = useTranslation()
  const { archives } = useContent()
  const bySlug = new Map(archives.map((row) => [row.slug, row]))
  const builtIn = CARDS.filter(({ slug }) => bySlug.has(slug)).map(({ slug }) => ({
    ...bySlug.get(slug),
    title: t(`content.cards.${slug}.title`),
    desc: t(`content.cards.${slug}.desc`),
    cap: t(`content.cards.${slug}.cap`),
    era: t(`content.cards.${slug}.era`),
    body: t(`content.cards.${slug}.body`),
  }))
  return [...builtIn, ...archives.filter((row) => row.custom)]
}

/** Visual sigils, with name/short/meaning/about translated by slug. */
export function useLocalizedSymbols() {
  const { t } = useTranslation()
  return SYMBOLS.map((s) => ({
    ...s,
    name: t(`content.symbols.${s.slug}.name`),
    short: t(`content.symbols.${s.slug}.short`),
    meaning: t(`content.symbols.${s.slug}.meaning`),
    about: t(`content.symbols.${s.slug}.about`, { defaultValue: '' }),
  }))
}

/** Tattoo motifs, with name/meaning translated by slug. */
export function useLocalizedTattoos() {
  const { t } = useTranslation()
  return TATTOOS.map((tt) => ({
    ...tt,
    name: t(`content.tattoos.${tt.slug}.name`),
    meaning: t(`content.tattoos.${tt.slug}.meaning`),
  }))
}

/** Community channels (Discord, Telegram, ...), translated by key. */
export function useLocalizedChannels() {
  const { t } = useTranslation()
  return CHANNELS.map((c) => ({
    ...c,
    name: t(`content.channels.${c.key}.name`),
    desc: t(`content.channels.${c.key}.desc`),
    note: t(`content.channels.${c.key}.note`),
  }))
}
