import { useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocalizedSymbols, useLocalizedTattoos } from '../hooks/useLocalizedContent'
import { normalizeName, parseBirthdate, readSigil } from '../utils/sigilReading'
import drawOn from '../utils/drawOn'
import SymbolIcon from './SymbolIcon'
import TattooIcon from './TattooIcon'

const CARD_W = 1080
const CARD_H = 1500
const GOLD = '#e6c878'

function svgToImage(svgEl, size) {
  const clone = svgEl.cloneNode(true)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', size)
  clone.setAttribute('height', size)
  clone.querySelectorAll('*').forEach((el) => { el.style.strokeDasharray = '' })
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }))
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('svg load failed')) }
    img.src = url
  })
}

function wrapLines(ctx, text, maxWidth) {
  const tokens = text.includes(' ') ? text.split(' ').map((w, i, a) => (i < a.length - 1 ? `${w} ` : w)) : Array.from(text)
  const lines = []
  let line = ''
  for (const tok of tokens) {
    if (line && ctx.measureText(line + tok).width > maxWidth) {
      lines.push(line.trimEnd())
      line = tok
    } else {
      line += tok
    }
  }
  if (line) lines.push(line.trimEnd())
  return lines
}

async function drawCard(cardEl, c) {
  const canvas = document.createElement('canvas')
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')
  const serif = "Cinzel, Georgia, serif"
  const sans = "Inter, system-ui, sans-serif"
  try { await Promise.all([document.fonts.load(`700 40px Cinzel`), document.fonts.load(`400 30px Inter`)]) } catch { /* fall back to system fonts */ }

  const bg = ctx.createLinearGradient(0, 0, 0, CARD_H)
  bg.addColorStop(0, '#120b08')
  bg.addColorStop(1, '#050203')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, CARD_W, CARD_H)
  ctx.strokeStyle = 'rgba(230,200,120,.55)'
  ctx.lineWidth = 3
  ctx.strokeRect(36, 36, CARD_W - 72, CARD_H - 72)
  ctx.strokeStyle = 'rgba(230,200,120,.2)'
  ctx.lineWidth = 1
  ctx.strokeRect(52, 52, CARD_W - 104, CARD_H - 104)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  const spaced = (px) => { if ('letterSpacing' in ctx) ctx.letterSpacing = c.joinedScript ? '0px' : `${px}px` }

  ctx.fillStyle = '#b04a4a'
  ctx.font = `700 26px ${sans}`
  spaced(8)
  ctx.fillText(c.kicker, CARD_W / 2, 150)

  let nameSize = 76
  ctx.fillStyle = GOLD
  spaced(6)
  do { ctx.font = `700 ${nameSize}px ${serif}`; nameSize -= 4 } while (ctx.measureText(c.name).width > CARD_W - 200 && nameSize > 28)
  ctx.fillText(c.name, CARD_W / 2, 250)

  const icons = cardEl.querySelectorAll('.finder-mark svg')
  const marks = [c.tattoo, c.sigil]
  const ringSize = 340
  const gap = 90
  const startX = (CARD_W - (ringSize * 2 + gap)) / 2
  for (let i = 0; i < marks.length; i++) {
    const x = startX + i * (ringSize + gap)
    const img = await svgToImage(icons[i], ringSize)
    ctx.drawImage(img, x, 330, ringSize, ringSize)
    ctx.fillStyle = '#8d8474'
    ctx.font = `700 22px ${sans}`
    spaced(5)
    ctx.fillText(marks[i].label, x + ringSize / 2, 730)
    ctx.fillStyle = '#f0e6cf'
    ctx.font = `600 30px ${serif}`
    spaced(3)
    ctx.fillText(marks[i].name, x + ringSize / 2, 780)
  }

  spaced(0)
  ctx.fillStyle = GOLD
  ctx.font = `600 34px ${sans}`
  const introLines = wrapLines(ctx, c.intro, CARD_W - 240)
  let y = 900
  for (const l of introLines) { ctx.fillText(l, CARD_W / 2, y); y += 50 }

  ctx.fillStyle = '#ddd3c0'
  ctx.font = `400 30px ${sans}`
  y += 20
  for (const l of wrapLines(ctx, c.meaning, CARD_W - 240)) { ctx.fillText(l, CARD_W / 2, y); y += 46 }

  ctx.strokeStyle = 'rgba(230,200,120,.3)'
  ctx.beginPath(); ctx.moveTo(240, 1250); ctx.lineTo(CARD_W - 240, 1250); ctx.stroke()
  ctx.fillStyle = GOLD
  ctx.font = `700 30px ${serif}`
  spaced(3)
  ctx.fillText(c.zodiac, CARD_W / 2, 1305)
  ctx.fillText(c.lifePath, CARD_W / 2, 1350)

  ctx.fillStyle = '#6d6558'
  ctx.font = `400 22px ${sans}`
  spaced(1)
  ctx.fillText(c.footer, CARD_W / 2, 1425)

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'))
}

export default function SigilFinder() {
  const { t, i18n } = useTranslation()
  const SYMBOLS = useLocalizedSymbols()
  const TATTOOS = useLocalizedTattoos()
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [error, setError] = useState('')
  const [reading, setReading] = useState(null)
  const cardRef = useRef(null)
  const today = new Date().toISOString().slice(0, 10)

  const submit = (e) => {
    e.preventDefault()
    const birthdate = parseBirthdate(dob)
    if (!normalizeName(name)) return setError(t('finder.errName'))
    if (!birthdate) return setError(t('finder.errDate'))
    setError('')
    setReading({ displayName: name.trim().replace(/\s+/g, ' '), ...readSigil(name, birthdate) })
  }

  useLayoutEffect(() => {
    if (!reading || !cardRef.current) return undefined
    return drawOn([...cardRef.current.querySelectorAll('.finder-mark svg')])
  }, [reading])

  const view = reading && {
    tattoo: TATTOOS.find((x) => x.slug === reading.tattooSlug),
    sigil: SYMBOLS.find((x) => x.slug === reading.sigilSlug),
    zodiac: t(`finder.zodiac.${reading.zodiac}`),
    lifePath: `${t('finder.lifePath')} ${reading.lifePath} · ${t(`finder.lifePaths.${reading.lifePath}`)}`,
  }

  const download = async () => {
    try {
      const blob = await drawCard(cardRef.current, {
        kicker: t('finder.cardKicker'),
        name: reading.displayName.toUpperCase(),
        tattoo: { label: t('finder.yourTattoo'), name: view.tattoo.name },
        sigil: { label: t('finder.yourSigil'), name: view.sigil.name },
        intro: t('finder.intro', { tattoo: view.tattoo.name, sigil: view.sigil.name }),
        meaning: view.tattoo.meaning,
        zodiac: view.zodiac,
        lifePath: view.lifePath,
        footer: t('finder.footer'),
        joinedScript: i18n.language.startsWith('hi'),
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'my-sigil.png'
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      setError(t('finder.errDownload'))
    }
  }

  return (
    <div className="finder">
      <form className="form finder-form" onSubmit={submit} noValidate>
        <div className="form-row">
          <label>
            <span>{t('finder.nameLabel')}</span>
            <input type="text" name="name" maxLength={40} autoComplete="off" placeholder={t('finder.namePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            <span>{t('finder.dobLabel')}</span>
            <input type="date" name="dob" min="1900-01-01" max={today} value={dob} onChange={(e) => setDob(e.target.value)} />
          </label>
        </div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button type="submit" className="btn-gold full">{t('finder.reveal')} ›</button>
        <p className="finder-privacy">{t('finder.privacy')}</p>
        {view && <button type="button" className="btn-ghost full" onClick={download}>{t('finder.download')}</button>}
      </form>

      {!view && (
        <div className="finder-placeholder">
          <div className="symbol-ring"><SymbolIcon slug="the-third-eye" /></div>
          <p>{t('finder.placeholder')}</p>
        </div>
      )}

      {view && (
        <div className="finder-result">
          <div className="finder-card" ref={cardRef}>
            <span className="chamber-num">{t('finder.cardKicker')}</span>
            <h3 className="finder-name">{reading.displayName}</h3>
            <div className="finder-marks">
              <div className="finder-mark">
                <div className="symbol-ring"><TattooIcon slug={view.tattoo.slug} /></div>
                <small>{t('finder.yourTattoo')}</small>
                <b>{view.tattoo.name}</b>
              </div>
              <div className="finder-mark">
                <div className="symbol-ring"><SymbolIcon slug={view.sigil.slug} /></div>
                <small>{t('finder.yourSigil')}</small>
                <b>{view.sigil.name}</b>
              </div>
            </div>
            <p className="finder-intro">{t('finder.intro', { tattoo: view.tattoo.name, sigil: view.sigil.name })}</p>
            <p className="finder-meaning">{view.tattoo.meaning}</p>
            <div className="finder-facts">
              <span>{view.zodiac}</span>
              <span>{view.lifePath}</span>
            </div>
            <p className="finder-disclaimer">{t('finder.footer')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
