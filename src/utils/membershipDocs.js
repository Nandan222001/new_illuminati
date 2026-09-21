import { wrapLines } from './canvasText'

/**
 * Joining letter (A4 PDF) and membership card (PNG / PDF).
 *
 * FIELD MAPPING — every placeholder is filled from the signed-in user:
 *   {{name}}        user.name
 *   {{firstName}}   first word of user.name
 *   {{email}}       user.email
 *   {{memberNo}}    user.initiate, formatted IB-000123
 *   {{sealId}}      user.sealId
 *   {{memberSince}} user.paidAt (falls back to user.createdAt), e.g. "12 March 2026"
 *   {{status}}      "Active" once the membership is sealed
 *   {{docRef}}      IB/JL/<sealId>
 *   {{rulesUrl}}    <site origin>/rules
 * Documents are drawn on a canvas so any script (Latin, Devanagari, CJK) renders correctly.
 */

export const LETTER_TEMPLATE = {
  title: 'CONFIRMATION OF MEMBERSHIP',
  salutation: 'Dear {{firstName}},',
  paragraphs: [
    'Welcome to Illuminati Brotherhood. We are pleased to confirm that your membership has been sealed and is now active. Your details are recorded below.',
    'As a member you may open the sealed videos, rituals and visuals on our website, download this letter and your membership card at any time from your Profile, and take part in our community.',
    'Please read the Rules & Instructions published at {{rulesUrl}}. By continuing to use your membership you agree to them.',
    'Your membership and these documents are personal and non-transferable. Illuminati Brotherhood is a brand and story world inspired by secret-society history and symbolism; it is not affiliated with any real organisation.',
  ],
  closing: 'Welcome aboard,',
  signatory: 'The Membership Office',
  signatoryLine: 'Illuminati Brotherhood',
  footerRights: '© 2026 Illuminati Brotherhood. All rights reserved.',
  footerNote: 'This letter is system-generated and does not require a signature.',
}

export const CARD_TEMPLATE = {
  kicker: 'MEMBERSHIP CARD',
  backLines: [
    'This card identifies the holder as a member of the Illuminati Brotherhood community.',
    'It is not a government-issued identity document and must not be used as proof of identity or age.',
    'It is personal and non-transferable.',
  ],
  footerRights: '© 2026 Illuminati Brotherhood. All rights reserved.',
}

const GOLD = '#c9a24b'
const GOLD_LIGHT = '#e6c878'
const SERIF = 'Cinzel, Georgia, serif'
const SANS = 'Inter, system-ui, sans-serif'

export function formatMemberNo(n) {
  return `IB-${String(Number(n) || 0).padStart(6, '0')}`
}

export function formatLongDate(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Maps the signed-in user onto the document fields. */
export function memberFields(user, origin = typeof window !== 'undefined' ? window.location.origin : '') {
  const since = formatLongDate(user.paidAt || user.createdAt)
  const sealId = user.sealId || ''
  return {
    name: user.name.trim().replace(/\s+/g, ' '),
    firstName: user.name.trim().split(/\s+/)[0],
    email: user.email,
    memberNo: formatMemberNo(user.initiate),
    sealId,
    memberSince: since,
    status: 'Active',
    docRef: `IB/JL/${sealId || formatMemberNo(user.initiate)}`,
    rulesUrl: `${origin}/rules`,
  }
}

const fill = (text, f) => text.replace(/\{\{(\w+)\}\}/g, (_m, k) => f[k] ?? '')

async function loadFonts() {
  try {
    await Promise.all([document.fonts.load('700 40px Cinzel'), document.fonts.load('400 24px Inter'), document.fonts.load('600 24px Inter')])
  } catch { /* fall back to system fonts */ }
}

function spacing(ctx, px) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${px}px`
}

function newCanvas(w, h) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  return [canvas, canvas.getContext('2d')]
}

function drawEmblem(ctx, cx, cy, size, color = GOLD_LIGHT, lineWidth = 3) {
  const k = size / 100
  ctx.save()
  ctx.translate(cx - 50 * k, cy - 50 * k)
  ctx.scale(k, k)
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = lineWidth / k * (size / 100 > 0.6 ? 1 : 1.4)
  ctx.beginPath(); ctx.moveTo(50, 6); ctx.lineTo(95, 88); ctx.lineTo(5, 88); ctx.closePath(); ctx.stroke()
  ctx.lineWidth = (lineWidth * 0.7) / k
  ctx.beginPath(); ctx.ellipse(50, 60, 17, 10, 0, 0, Math.PI * 2); ctx.stroke()
  ctx.beginPath(); ctx.arc(50, 60, 5, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Shrinks the font until the text fits maxWidth. */
function fitText(ctx, text, weight, family, maxSize, minSize, maxWidth) {
  let size = maxSize
  do { ctx.font = `${weight} ${size}px ${family}`; size -= 2 } while (ctx.measureText(text).width > maxWidth && size > minSize)
}

/* ---------------------------------- letter ---------------------------------- */

export const LETTER_PX = { w: 1240, h: 1754 } // A4 at 150 dpi

export async function renderJoiningLetter(user) {
  await loadFonts()
  const f = memberFields(user)
  const T = LETTER_TEMPLATE
  const { w: W, h: H } = LETTER_PX
  const [canvas, ctx] = newCanvas(W, H)
  const M = 110
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = '#fbf8f1'
  ctx.fillRect(0, 0, W, H)

  // letterhead
  ctx.fillStyle = '#0b0605'
  ctx.fillRect(0, 0, W, 190)
  ctx.fillStyle = GOLD
  ctx.fillRect(0, 190, W, 6)
  drawEmblem(ctx, M + 40, 96, 92)
  ctx.textAlign = 'left'
  ctx.fillStyle = GOLD_LIGHT
  ctx.font = `700 44px ${SERIF}`; spacing(ctx, 9)
  ctx.fillText('ILLUMINATI', M + 110, 92)
  ctx.font = `600 20px ${SANS}`; spacing(ctx, 12)
  ctx.fillStyle = '#a8905a'
  ctx.fillText('BROTHERHOOD', M + 112, 128)
  ctx.textAlign = 'right'
  ctx.font = `600 18px ${SANS}`; spacing(ctx, 4)
  ctx.fillStyle = '#a8905a'
  ctx.fillText('MEMBERSHIP OFFICE', W - M, 100)

  // reference block + addressee
  spacing(ctx, 0)
  ctx.textAlign = 'right'
  ctx.fillStyle = '#555'
  ctx.font = `400 22px ${SANS}`
  ctx.fillText(`Ref: ${f.docRef}`, W - M, 262)
  ctx.fillText(`Date: ${f.memberSince}`, W - M, 296)
  ctx.textAlign = 'left'
  ctx.fillStyle = '#1b1510'
  ctx.font = `600 26px ${SANS}`
  ctx.fillText('To,', M, 262)
  fitText(ctx, f.name, 700, SANS, 30, 20, W - 2 * M - 360)
  ctx.fillText(f.name, M, 300)
  ctx.font = `400 22px ${SANS}`
  ctx.fillStyle = '#555'
  ctx.fillText(f.email, M, 334)

  // title
  ctx.fillStyle = '#1b1510'
  ctx.font = `700 40px ${SERIF}`; spacing(ctx, 5)
  ctx.textAlign = 'center'
  ctx.fillText(T.title, W / 2, 436)
  spacing(ctx, 0)
  ctx.strokeStyle = GOLD
  ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(W / 2 - 150, 462); ctx.lineTo(W / 2 + 150, 462); ctx.stroke()

  // body
  ctx.textAlign = 'left'
  ctx.fillStyle = '#25201a'
  ctx.font = `400 26px ${SANS}`
  let y = 540
  const body = (text) => {
    for (const line of wrapLines(ctx, fill(text, f), W - 2 * M)) { ctx.fillText(line, M, y); y += 42 }
    y += 22
  }
  ctx.font = `600 27px ${SANS}`
  ctx.fillText(fill(T.salutation, f), M, y); y += 58
  ctx.font = `400 26px ${SANS}`
  body(T.paragraphs[0])

  // details box
  const rows = [['Member name', f.name], ['Member No.', f.memberNo], ['Seal ID', f.sealId || '—'], ['Member since', f.memberSince], ['Status', f.status]]
  const boxH = rows.length * 52 + 30
  ctx.fillStyle = '#f2ead6'
  roundRect(ctx, M, y - 6, W - 2 * M, boxH, 14); ctx.fill()
  ctx.strokeStyle = GOLD; ctx.lineWidth = 2; roundRect(ctx, M, y - 6, W - 2 * M, boxH, 14); ctx.stroke()
  let ry = y + 44
  for (const [label, value] of rows) {
    ctx.fillStyle = '#7a6a45'; ctx.font = `600 19px ${SANS}`; spacing(ctx, 3)
    ctx.fillText(label.toUpperCase(), M + 34, ry)
    spacing(ctx, 0)
    ctx.fillStyle = '#1b1510'
    fitText(ctx, value, 600, SANS, 26, 16, W - 2 * M - 360)
    ctx.fillText(value, M + 330, ry)
    ry += 52
  }
  y += boxH + 44

  ctx.fillStyle = '#25201a'
  ctx.font = `400 26px ${SANS}`
  for (const p of T.paragraphs.slice(1)) body(p)

  // closing
  y += 6
  ctx.fillText(T.closing, M, y); y += 64
  ctx.fillStyle = '#1b1510'
  ctx.font = `700 28px ${SERIF}`; spacing(ctx, 2)
  ctx.fillText(T.signatory, M, y); y += 36
  spacing(ctx, 0)
  ctx.fillStyle = '#7a6a45'
  ctx.font = `400 22px ${SANS}`
  ctx.fillText(T.signatoryLine, M, y)

  // footer
  ctx.strokeStyle = 'rgba(201,162,75,.6)'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(M, H - 130); ctx.lineTo(W - M, H - 130); ctx.stroke()
  ctx.textAlign = 'center'
  ctx.fillStyle = '#6b6152'
  ctx.font = `600 20px ${SANS}`
  ctx.fillText(T.footerRights, W / 2, H - 92)
  ctx.font = `400 18px ${SANS}`
  ctx.fillText(T.footerNote, W / 2, H - 62)

  return { canvas, overflow: y > H - 150 }
}

/* ----------------------------------- card ----------------------------------- */

export const CARD_PX = { w: 1012, h: 638 } // 85.6 x 54 mm at 300 dpi
const CARD_MM = { w: 85.6, h: 54 }

export async function renderCardFront(user) {
  await loadFonts()
  const f = memberFields(user)
  const { w: W, h: H } = CARD_PX
  const [canvas, ctx] = newCanvas(W, H)

  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#15100c'); bg.addColorStop(1, '#050203')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  // watermark emblem
  ctx.globalAlpha = 0.07
  drawEmblem(ctx, W - 175, H - 190, 330, GOLD_LIGHT, 5)
  ctx.globalAlpha = 1
  // borders
  ctx.strokeStyle = GOLD; ctx.lineWidth = 4; roundRect(ctx, 18, 18, W - 36, H - 36, 26); ctx.stroke()
  ctx.strokeStyle = 'rgba(230,200,120,.25)'; ctx.lineWidth = 1.5; roundRect(ctx, 32, 32, W - 64, H - 64, 18); ctx.stroke()

  // brand
  drawEmblem(ctx, 96, 96, 60, GOLD_LIGHT, 3)
  ctx.textAlign = 'left'
  ctx.fillStyle = GOLD_LIGHT
  ctx.font = `700 26px ${SERIF}`; spacing(ctx, 6)
  ctx.fillText('ILLUMINATI', 140, 92)
  ctx.font = `600 13px ${SANS}`; spacing(ctx, 9)
  ctx.fillStyle = '#a8905a'
  ctx.fillText('BROTHERHOOD', 141, 114)
  ctx.textAlign = 'right'
  ctx.font = `600 15px ${SANS}`; spacing(ctx, 5)
  ctx.fillText(CARD_TEMPLATE.kicker, W - 70, 96)

  // name
  ctx.textAlign = 'left'
  spacing(ctx, 2)
  ctx.fillStyle = '#f0e6cf'
  const nameUpper = f.name.toUpperCase()
  const nameMaxW = W - 140
  ctx.font = `700 34px ${SERIF}`
  let underlineY = 318
  if (ctx.measureText(nameUpper).width > nameMaxW * 1.35) {
    // very long names: two lines instead of a tiny single line
    const lines = wrapLines(ctx, nameUpper, nameMaxW).slice(0, 2)
    lines.forEach((l, i) => ctx.fillText(l, 70, 262 + i * 44))
    underlineY = 262 + (lines.length - 1) * 44 + 28
  } else {
    fitText(ctx, nameUpper, 700, SERIF, 50, 26, nameMaxW)
    ctx.fillText(nameUpper, 70, 290)
  }
  ctx.strokeStyle = 'rgba(230,200,120,.4)'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(70, underlineY); ctx.lineTo(70 + 260, underlineY); ctx.stroke()

  // fields
  const field = (label, value, x, y, maxW) => {
    spacing(ctx, 4); ctx.fillStyle = '#8d8474'; ctx.font = `600 14px ${SANS}`
    ctx.fillText(label, x, y)
    spacing(ctx, 1); ctx.fillStyle = '#f0e6cf'
    fitText(ctx, value, 600, SANS, 30, 16, maxW)
    ctx.fillText(value, x, y + 40)
  }
  field('MEMBER No.', f.memberNo, 70, 385, 300)
  field('SEAL ID', f.sealId || '—', 390, 385, 300)
  field('MEMBER SINCE', f.memberSince, 70, 490, 300)
  // status pill
  ctx.fillStyle = 'rgba(230,200,120,.12)'; roundRect(ctx, 390, 470, 150, 46, 23); ctx.fill()
  ctx.strokeStyle = GOLD; ctx.lineWidth = 2; roundRect(ctx, 390, 470, 150, 46, 23); ctx.stroke()
  ctx.fillStyle = GOLD_LIGHT; ctx.font = `700 16px ${SANS}`; spacing(ctx, 4); ctx.textAlign = 'center'
  ctx.fillText(f.status.toUpperCase(), 465, 500)
  return canvas
}

export async function renderCardBack(user) {
  await loadFonts()
  const f = memberFields(user)
  const { w: W, h: H } = CARD_PX
  const [canvas, ctx] = newCanvas(W, H)

  ctx.fillStyle = '#0d0908'
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = GOLD; ctx.lineWidth = 4; roundRect(ctx, 18, 18, W - 36, H - 36, 26); ctx.stroke()
  ctx.strokeStyle = 'rgba(230,200,120,.25)'; ctx.lineWidth = 1.5; roundRect(ctx, 32, 32, W - 64, H - 64, 18); ctx.stroke()
  // stripe
  ctx.fillStyle = '#050203'; ctx.fillRect(40, 70, W - 80, 70)
  ctx.fillStyle = 'rgba(230,200,120,.5)'; ctx.fillRect(40, 140, W - 80, 3)

  ctx.textAlign = 'left'
  ctx.fillStyle = '#ddd3c0'
  ctx.font = `400 22px ${SANS}`; spacing(ctx, 0)
  let y = 205
  for (const line of CARD_TEMPLATE.backLines) {
    for (const l of wrapLines(ctx, line, W - 140)) { ctx.fillText(l, 70, y); y += 34 }
    y += 10
  }
  ctx.fillStyle = '#8d8474'
  ctx.font = `600 15px ${SANS}`; spacing(ctx, 3)
  ctx.fillText('RULES & INSTRUCTIONS', 70, y + 22)
  ctx.fillStyle = GOLD_LIGHT
  ctx.font = `400 21px ${SANS}`; spacing(ctx, 0)
  ctx.fillText(f.rulesUrl, 70, y + 54)

  // seal id strip (decorative bars derived from the id)
  const id = f.sealId || f.memberNo
  ctx.fillStyle = '#e6c878'
  let x = 70
  for (let i = 0; i < id.length && x < 520; i++) {
    const c = id.charCodeAt(i)
    for (let b = 0; b < 4; b++) { const bw = 2 + ((c >> b) & 3) * 2; ctx.fillRect(x, H - 132, bw, 46); x += bw + 3 }
  }
  ctx.fillStyle = '#8d8474'; ctx.font = `600 15px ${SANS}`; spacing(ctx, 3)
  ctx.fillText(id, 70, H - 62)

  ctx.textAlign = 'right'
  ctx.fillStyle = '#6d6558'; ctx.font = `400 15px ${SANS}`; spacing(ctx, 0)
  ctx.fillText(CARD_TEMPLATE.footerRights, W - 70, H - 62)
  return canvas
}

/** Front and back stacked on one sheet, for a single PNG. */
export async function renderCardSheet(user) {
  const [front, back] = await Promise.all([renderCardFront(user), renderCardBack(user)])
  const pad = 70
  const [sheet, ctx] = newCanvas(CARD_PX.w + pad * 2, CARD_PX.h * 2 + pad * 3)
  ctx.fillStyle = '#050203'; ctx.fillRect(0, 0, sheet.width, sheet.height)
  ctx.drawImage(front, pad, pad)
  ctx.drawImage(back, pad, pad * 2 + CARD_PX.h)
  return sheet
}

/* ----------------------------- PDF (no dependency) ----------------------------- */

function dataUrlToBytes(dataUrl) {
  const bin = atob(dataUrl.split(',')[1])
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

/** Builds a PDF with one full-page JPEG per page. pages: [{ canvas, wMm, hMm }] */
export function buildPdf(pages) {
  const enc = new TextEncoder()
  const parts = []
  const offsets = []
  let size = 0
  const push = (d) => { const b = typeof d === 'string' ? enc.encode(d) : d; parts.push(b); size += b.length }
  const mm = (v) => (v * 72) / 25.4

  push(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a])) // %PDF-1.4 + binary marker
  const startObj = (n) => { offsets[n] = size; push(`${n} 0 obj\n`) }

  const kids = pages.map((_, i) => `${3 + i * 3} 0 R`).join(' ')
  startObj(1); push('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n')
  startObj(2); push(`<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>\nendobj\n`)

  pages.forEach(({ canvas, wMm, hMm }, i) => {
    const pageN = 3 + i * 3
    const contentN = pageN + 1
    const imageN = pageN + 2
    const jpeg = dataUrlToBytes(canvas.toDataURL('image/jpeg', 0.92))
    const wPt = mm(wMm).toFixed(2)
    const hPt = mm(hMm).toFixed(2)
    const content = `q ${wPt} 0 0 ${hPt} 0 0 cm /Im0 Do Q`

    startObj(pageN)
    push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${wPt} ${hPt}] /Resources << /XObject << /Im0 ${imageN} 0 R >> >> /Contents ${contentN} 0 R >>\nendobj\n`)
    startObj(contentN)
    push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`)
    startObj(imageN)
    push(`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`)
    push(jpeg)
    push('\nendstream\nendobj\n')
  })

  const total = 2 + pages.length * 3
  const xrefAt = size
  let xref = `xref\n0 ${total + 1}\n0000000000 65535 f \n`
  for (let n = 1; n <= total; n++) xref += `${String(offsets[n]).padStart(10, '0')} 00000 n \n`
  push(xref)
  push(`trailer\n<< /Size ${total + 1} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`)

  return new Blob(parts, { type: 'application/pdf' })
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

const toBlob = (canvas) => new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'))
const slug = (user) => (user.sealId || formatMemberNo(user.initiate)).replace(/[^\w-]+/g, '')

export async function downloadJoiningLetterPdf(user) {
  const { canvas } = await renderJoiningLetter(user)
  saveBlob(buildPdf([{ canvas, wMm: 210, hMm: 297 }]), `illuminati-joining-letter-${slug(user)}.pdf`)
}

export async function downloadCardPng(user) {
  saveBlob(await toBlob(await renderCardSheet(user)), `illuminati-membership-card-${slug(user)}.png`)
}

export async function downloadCardPdf(user) {
  const [front, back] = await Promise.all([renderCardFront(user), renderCardBack(user)])
  saveBlob(buildPdf([{ canvas: front, wMm: CARD_MM.w, hMm: CARD_MM.h }, { canvas: back, wMm: CARD_MM.w, hMm: CARD_MM.h }]), `illuminati-membership-card-${slug(user)}.pdf`)
}
