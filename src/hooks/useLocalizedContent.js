import { useTranslation } from 'react-i18next'
import { CARDS, CHANNELS, FAQ, SYMBOLS, TATTOOS, TIMELINE } from '../data/content'

/** Archive chamber cards, with title/desc/cap/era/body translated by slug. */
export function useLocalizedCards() {
  const { t } = useTranslation()
  return CARDS.map((c) => ({
    ...c,
    title: t(`content.cards.${c.slug}.title`),
    desc: t(`content.cards.${c.slug}.desc`),
    cap: t(`content.cards.${c.slug}.cap`),
    era: t(`content.cards.${c.slug}.era`),
    body: t(`content.cards.${c.slug}.body`),
  }))
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
    members: t(`content.channels.${c.key}.members`),
    note: t(`content.channels.${c.key}.note`),
  }))
}

/** Brotherhood history timeline, translated by key. */
export function useLocalizedTimeline() {
  const { t } = useTranslation()
  return TIMELINE.map((item) => ({
    ...item,
    year: t(`content.timeline.${item.key}.year`),
    title: t(`content.timeline.${item.key}.title`),
    text: t(`content.timeline.${item.key}.text`),
  }))
}

/** About page FAQ, translated by key. */
export function useLocalizedFaq() {
  const { t } = useTranslation()
  return FAQ.map((item) => ({
    ...item,
    q: t(`content.faq.${item.key}.q`),
    a: t(`content.faq.${item.key}.a`),
  }))
}
