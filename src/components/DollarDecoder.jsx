import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import drawOn from '../utils/drawOn'

const VIEW_W = 480
const VIEW_H = 320
const GOLD = '#e6c878'
const ROWS = 13
const TOP = 138
const BASE = 248
const CX = 240
const ROW_H = (BASE - TOP) / ROWS
const PYRAMID_ROWS = Array.from({ length: ROWS }, (_, i) => ({ y: TOP + i * ROW_H, hw: 12 + (i * (118 - 12)) / (ROWS - 1) }))
const RAYS = Array.from({ length: 17 }, (_, i) => {
  const a = ((-170 + i * 10) * Math.PI) / 180
  return { x1: CX + 44 * Math.cos(a), y1: 100 + 44 * Math.sin(a), x2: CX + 64 * Math.cos(a), y2: 100 + 64 * Math.sin(a) }
})

const PARTS = [
  { key: 'annuit', x: 372, y: 26 },
  { key: 'eye', x: 296, y: 88 },
  { key: 'pyramid', x: 334, y: 190 },
  { key: 'date', x: 318, y: 266 },
  { key: 'novus', x: 404, y: 304 },
]

export default function DollarDecoder() {
  const { t } = useTranslation()
  const [active, setActive] = useState('eye')
  const artRef = useRef(null)
  const infoRef = useRef(null)
  const index = PARTS.findIndex((p) => p.key === active)

  useEffect(() => {
    const el = artRef.current
    if (!el) return undefined
    let cleanup = () => {}
    const start = () => { cleanup = drawOn([el.querySelector('svg')]) }
    if (!('IntersectionObserver' in window)) { start(); return () => cleanup() }
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { start(); io.disconnect() } }, { threshold: 0.35 })
    io.observe(el)
    return () => { io.disconnect(); cleanup() }
  }, [])

  const select = (key) => {
    setActive(key)
    if (window.matchMedia('(max-width: 1100px)').matches) infoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }
  const step = (d) => setActive(PARTS[(index + d + PARTS.length) % PARTS.length].key)
  const part = (key) => ({ 'data-part': key, className: active === key ? 'active' : undefined, onClick: () => setActive(key) })

  return (
    <>
      <div className="decoder">
        <div className="decoder-art" ref={artRef}>
          <div className="decoder-frame">
            <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} fill="none" stroke={GOLD} strokeWidth="1.6" role="img" aria-label={t('decoder.artLabel')}>
              <g {...part('annuit')}>
                <text x={CX} y="30" textAnchor="middle" fontFamily="Cinzel, Georgia, serif" fontWeight="700" fontSize="15" letterSpacing="6" fill={GOLD} stroke="none">ANNUIT CŒPTIS</text>
              </g>
              <g {...part('eye')}>
                {RAYS.map((r, i) => <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} strokeWidth="1" opacity=".7" />)}
                <polygon points="240,62 270,114 210,114" fill="rgba(230,200,120,.08)" strokeWidth="1.8" />
                <ellipse cx="240" cy="100" rx="11" ry="6.5" />
                <circle cx="240" cy="100" r="3.2" fill={GOLD} stroke="none" />
              </g>
              <g {...part('pyramid')}>
                {PYRAMID_ROWS.map((r, i) => (
                  <g key={i}>
                    <rect x={CX - r.hw} y={r.y} width={2 * r.hw} height={ROW_H} fill="rgba(230,200,120,.07)" strokeWidth="1" />
                    <rect x={CX} y={r.y} width={r.hw} height={ROW_H} fill="rgba(0,0,0,.38)" stroke="none" />
                  </g>
                ))}
              </g>
              <path d={`M60 ${BASE}H420`} strokeWidth="1.2" opacity=".6" />
              <g {...part('date')}>
                <text x={CX} y="270" textAnchor="middle" fontFamily="Cinzel, Georgia, serif" fontWeight="700" fontSize="12" letterSpacing="3" fill={GOLD} stroke="none">MDCCLXXVI</text>
              </g>
              <g {...part('novus')}>
                <text x={CX} y="308" textAnchor="middle" fontFamily="Cinzel, Georgia, serif" fontWeight="700" fontSize="15" letterSpacing="4" fill={GOLD} stroke="none">NOVUS ORDO SECLORUM</text>
              </g>
            </svg>
            {PARTS.map((p, i) => (
              <button
                key={p.key}
                type="button"
                className={`decoder-hotspot${active === p.key ? ' active' : ''}`}
                style={{ left: `${(p.x / VIEW_W) * 100}%`, top: `${(p.y / VIEW_H) * 100}%` }}
                aria-pressed={active === p.key}
                aria-label={t(`decoder.parts.${p.key}.title`)}
                onClick={() => select(p.key)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        <article className="decoder-info" key={active} ref={infoRef}>
          <span className="chamber-num">{String(index + 1).padStart(2, '0')} / {String(PARTS.length).padStart(2, '0')}</span>
          <h3>{t(`decoder.parts.${active}.title`)}</h3>
          <p>{t(`decoder.parts.${active}.what`)}</p>
          <div className="decoder-fact">
            <b>{t('decoder.factLabel')}</b>
            <p>{t(`decoder.parts.${active}.fact`)}</p>
          </div>
          <div className="decoder-nav">
            <button type="button" className="btn-ghost small" aria-label={t('common.previous')} onClick={() => step(-1)}>‹</button>
            <button type="button" className="btn-ghost small" aria-label={t('common.next')} onClick={() => step(1)}>›</button>
          </div>
        </article>
      </div>

      <div className="decoder-numbers">
        <h4>{t('decoder.numbersTitle')}</h4>
        <ul>
          {['steps', 'annuit', 'pluribus', 'stripes', 'stars', 'arrows'].map((k) => <li key={k}>{t(`decoder.numbers.${k}`)}</li>)}
        </ul>
        <p>{t('decoder.caption')}</p>
      </div>
    </>
  )
}
