import { SYMBOLS, TATTOOS } from '../data/content'

export const ZODIAC_KEYS = ['capricorn', 'aquarius', 'pisces', 'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius']
const ZODIAC_LAST_DAY = [19, 18, 20, 19, 20, 20, 22, 22, 22, 22, 21, 21]

// cyrb53: small, fast, fully deterministic string hash (no Date/Math.random involved).
function cyrb53(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed
  let h2 = 0x41c6ce57 ^ seed
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

export function normalizeName(name) {
  return name.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase()
}

/** Parses a YYYY-MM-DD string; returns null unless it is a real calendar date between 1900 and today. */
export function parseBirthdate(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '')
  if (!m) return null
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const d = new Date(Date.UTC(year, month - 1, day))
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return null
  if (year < 1900 || d.getTime() > Date.now()) return null
  return { year, month, day, iso: value }
}

function reduceDigits(n) {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce((sum, digit) => sum + Number(digit), 0)
  }
  return n
}

export function lifePathNumber({ year, month, day }) {
  return reduceDigits(reduceDigits(year) + reduceDigits(month) + reduceDigits(day))
}

export function zodiacKey({ month, day }) {
  const i = month - 1
  return ZODIAC_KEYS[day <= ZODIAC_LAST_DAY[i] ? i : (i + 1) % 12]
}

/**
 * Same (name, birthdate) always yields the same reading. The name is
 * normalised (case/whitespace/unicode form) so "  ARJUN  Singh" == "arjun singh".
 * Returns only stable slugs/numbers so the card can be re-rendered in any language.
 */
export function readSigil(name, birthdate) {
  const key = `${normalizeName(name)}|${birthdate.iso}`
  return {
    tattooSlug: TATTOOS[cyrb53(key, 1) % TATTOOS.length].slug,
    sigilSlug: SYMBOLS[cyrb53(key, 2) % SYMBOLS.length].slug,
    lifePath: lifePathNumber(birthdate),
    zodiac: zodiacKey(birthdate),
  }
}
