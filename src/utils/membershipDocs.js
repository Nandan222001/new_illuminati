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
    if (typeof FontFace !== 'undefined' && !document.fonts.check('16px UnifrakturCook')) {
      const face = new FontFace('UnifrakturCook', "url('/assets/fonts/UnifrakturCook-Bold.ttf')")
      await face.load()
      document.fonts.add(face)
    }
    await Promise.all([
      document.fonts.load('700 40px Cinzel'),
      document.fonts.load('400 24px Inter'),
      document.fonts.load('600 24px Inter'),
      document.fonts.load('168px UnifrakturCook'),
    ])
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

const PARCHMENT = '#f4ecdc'
const P_INK = '#2b241a'
const P_GOLD = '#8a6d3b'
const P_NAVY = '#27356b'
const GOTHIC = 'UnifrakturCook, "Old English Text MT", "Times New Roman", serif'
const DOC_SERIF = "Georgia, 'Times New Roman', serif"

async function loadImg(src) {
  const img = new Image()
  img.src = src
  await img.decode()
  return img
}

export async function renderCardFront(user) {
  await loadFonts()
  const f = memberFields(user)
  const emblem = await loadImg('/assets/email/emblem.jpg')
  const W = 1600
  const H = 1000
  const [c, g] = newCanvas(W, H)

  // rounded-corner backdrop
  g.fillStyle = '#d9cdb4'
  g.fillRect(0, 0, W, H)
  g.save()
  roundRect(g, 0, 0, W, H, 70)
  g.clip()

  g.fillStyle = '#edf3f1'
  g.fillRect(0, 0, W, H)

  // guilloche watermark
  g.strokeStyle = '#c9dbd6'
  g.lineWidth = 2
  for (let r = 80; r < 940; r += 26) { g.beginPath(); g.arc(430, 540, r, 0, Math.PI * 2); g.stroke() }
  g.strokeStyle = '#bccfc9'
  g.lineWidth = 3
  g.beginPath(); g.moveTo(430, 240); g.lineTo(150, 830); g.lineTo(710, 830); g.closePath(); g.stroke()
  g.beginPath(); g.ellipse(430, 640, 120, 60, 0, 0, Math.PI * 2); g.stroke()
  g.beginPath(); g.ellipse(430, 650, 35, 35, 0, 0, Math.PI * 2); g.stroke()

  // borders
  g.strokeStyle = '#7d9a94'
  g.lineWidth = 6
  roundRect(g, 18, 18, W - 36, H - 36, 70)
  g.stroke()
  g.strokeStyle = '#96b4af'
  g.lineWidth = 2
  roundRect(g, 36, 36, W - 72, H - 72, 58)
  g.stroke()

  // gothic title
  g.textAlign = 'left'
  g.textBaseline = 'alphabetic'
  g.fillStyle = '#0a0e10'
  g.font = `168px ${GOTHIC}`
  g.fillText('Illuminati', 80, 195)

  // framed emblem + caption
  const ew = 250
  g.drawImage(emblem, W - 330, 58, ew, ew)
  g.strokeStyle = '#7d9a94'
  g.lineWidth = 3
  g.strokeRect(W - 330, 58, ew, ew)
  g.fillStyle = '#171a18'
  g.font = `700 30px ${SANS}`
  spacing(g, 6)
  const cap = 'ILLUMINATI'
  const cw = g.measureText(cap).width
  g.fillText(cap, W - 330 + Math.max(0, (ew - cw) / 2), 350)
  spacing(g, 0)

  // photo panel with hooded silhouette (no real person)
  const px0 = W - 560
  const py0 = 400
  const px1 = W - 110
  const py1 = 880
  g.fillStyle = '#262d2b'
  g.fillRect(px0, py0, px1 - px0, py1 - py0)
  const pcx = (px0 + px1) / 2
  g.fillStyle = '#0c100f'
  g.beginPath(); g.moveTo(pcx - 195, py1); g.lineTo(pcx - 140, 700); g.lineTo(pcx + 140, 700); g.lineTo(pcx + 195, py1); g.closePath(); g.fill()
  g.beginPath(); g.ellipse(pcx, 615, 150, 165, 0, 0, Math.PI * 2); g.fill()
  g.fillStyle = '#161c1a'
  g.beginPath(); g.ellipse(pcx, 620, 95, 120, 0, 0, Math.PI * 2); g.fill()
  g.fillStyle = '#3a4441'
  g.beginPath(); g.ellipse(pcx - 37, 607, 7, 7, 0, 0, Math.PI * 2); g.fill()
  g.beginPath(); g.ellipse(pcx + 37, 607, 7, 7, 0, 0, Math.PI * 2); g.fill()
  g.strokeStyle = '#7d9a94'
  g.lineWidth = 5
  g.strokeRect(px0, py0, px1 - px0, py1 - py0)

  // vertical motto
  g.save()
  g.translate(W - 612, 640)
  g.rotate(-Math.PI / 2)
  g.textAlign = 'center'
  g.fillStyle = '#4c635e'
  g.font = `700 28px ${SANS}`
  spacing(g, 8)
  g.fillText('AD LUCEM · MMXXVI', 0, 0)
  g.restore()
  spacing(g, 0)

  // fields
  const num = String(user.initiate ?? 0).padStart(4, '0')
  const rows = [
    ['MEMBER NAME', f.name.toUpperCase()],
    ['INITIATE №', num],
    ['SEAL', f.sealId || '—'],
    ['INITIATED', f.memberSince],
  ]
  let y = 372
  for (const [label, value] of rows) {
    g.textAlign = 'left'
    g.fillStyle = '#4c635e'
    g.font = `30px ${SANS}`
    spacing(g, 4)
    g.fillText(label, 92, y + 26)
    spacing(g, 0)
    g.fillStyle = '#131a18'
    fitText(g, value, 700, SANS, 60, 28, 860)
    g.fillText(value, 92, y + 92)
    y += 150
  }

  // fictional strip
  g.textAlign = 'center'
  g.fillStyle = '#4c635e'
  g.font = `28px ${SANS}`
  g.fillText('FICTIONAL MEMBER CARD — VALID ONLY WITHIN THE EXPERIENCE', W / 2, 955)

  g.restore()

  const { w: CW, h: CH } = CARD_PX
  const [canvas, ctx] = newCanvas(CW, CH)
  ctx.drawImage(c, 0, 0, CW, CH)
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

/* --------------------------- parchment documents (A4) --------------------------- */

const DOC_M = 110

const docAssets = () => Promise.all([loadImg('/assets/email/emblem.jpg'), loadImg('/assets/email/seal.jpg')])

function parchmentBase(g, W, H) {
  g.fillStyle = PARCHMENT
  g.fillRect(0, 0, W, H)
  g.strokeStyle = '#b9a678'
  g.lineWidth = 2
  g.strokeRect(40, 40, W - 80, H - 80)
  g.strokeStyle = P_GOLD
  g.lineWidth = 1
  g.strokeRect(52, 52, W - 104, H - 104)
}

function parchmentHeader(g, W, emblem, seal) {
  const M = DOC_M
  g.textAlign = 'left'
  g.fillStyle = P_GOLD
  g.font = `600 18px ${SANS}`
  spacing(g, 2)
  g.fillText('GARRETT S. CHAN', M, 120)
  g.fillText('ILLUMINATI HEADQUARTERS', M, 148)
  g.fillText('THE ARCHIVE HOUSE, SUITE 1776', M, 176)
  spacing(g, 0)
  const ew = 240
  g.drawImage(emblem, W / 2 - ew / 2, 70, ew, ew)
  const sw = 170
  g.drawImage(seal, W - M - sw, 80, sw, sw)
  g.textAlign = 'center'
  g.fillStyle = P_INK
  g.font = `700 42px ${DOC_SERIF}`
  spacing(g, 8)
  g.fillText('SUPREME ORDER OF ILLUMINATI', W / 2, 380)
  spacing(g, 5)
  g.fillStyle = P_GOLD
  g.font = `600 18px ${SANS}`
  g.fillText('LUX IN TENEBRIS  •  VERITAS LIBERAT  •  AD LUCEM', W / 2, 414)
  spacing(g, 0)
  g.strokeStyle = P_GOLD
  g.lineWidth = 3
  g.beginPath(); g.moveTo(M, 436); g.lineTo(W - M, 436); g.stroke()
  g.lineWidth = 1
  g.beginPath(); g.moveTo(M, 441); g.lineTo(W - M, 441); g.stroke()
  g.fillStyle = P_INK
  g.font = `700 26px ${DOC_SERIF}`
  spacing(g, 4)
  g.fillText('OFFICE OF THE GRAND MASTER', W / 2, 478)
  g.fillStyle = P_GOLD
  g.font = `600 16px ${SANS}`
  spacing(g, 6)
  g.fillText('EST. 1776', W / 2, 506)
  spacing(g, 0)
  g.strokeStyle = '#b9a678'
  g.lineWidth = 1.5
  g.beginPath(); g.moveTo(M, 528); g.lineTo(W - M, 528); g.stroke()
  g.textAlign = 'left'
  return 576
}

function docParas(g, paras, W, y) {
  g.textAlign = 'left'
  g.fillStyle = '#25201a'
  g.font = `400 23px ${DOC_SERIF}`
  for (const p of paras) {
    for (const line of wrapLines(g, p, W - 2 * DOC_M)) { g.fillText(line, DOC_M, y); y += 32 }
    y += 14
  }
  return y
}

function docBullets(g, items, W, y, marker = '▲') {
  g.fillStyle = '#25201a'
  g.font = `400 22px ${DOC_SERIF}`
  for (const item of items) {
    g.fillText(marker, DOC_M, y)
    const lines = wrapLines(g, item, W - 2 * DOC_M - 46)
    lines.forEach((l, i) => g.fillText(l, DOC_M + 46, y + i * 30))
    y += lines.length * 30 + 10
  }
  return y
}

function parchmentSign(g, W, y, dateStr, seal) {
  const M = DOC_M
  g.textAlign = 'left'
  g.fillStyle = P_NAVY
  g.font = "34px 'Segoe Script', 'Brush Script MT', cursive"
  g.fillText('Garrett S. Chan', M, y + 30)
  g.strokeStyle = '#b9a678'
  g.lineWidth = 1.5
  g.beginPath(); g.moveTo(M, y + 46); g.lineTo(M + 260, y + 46); g.stroke()
  g.fillStyle = P_INK
  g.font = `600 16px ${SANS}`
  spacing(g, 2)
  g.fillText('GARRETT S. CHAN', M, y + 74)
  g.fillStyle = P_GOLD
  g.fillText('GRAND MASTER', M, y + 98)
  g.fillText(`DATE: ${dateStr}`, M, y + 122)
  spacing(g, 0)
  const sw = 170
  g.drawImage(seal, W - M - sw, y - 10, sw, sw)
  return y + 140
}

function parchmentFooter(g, W, H, email, site) {
  const M = DOC_M
  g.strokeStyle = '#b9a678'
  g.lineWidth = 1.5
  g.beginPath(); g.moveTo(M, H - 178); g.lineTo(W - M, H - 178); g.stroke()
  g.fillStyle = '#6b6152'
  g.font = `400 15px ${SANS}`
  g.textAlign = 'left'
  let y = H - 150
  const txt = `This transmission is part of Illuminati Brotherhood, a fictional entertainment experience. No real society, contract, debt or obligation is created by it, and nothing herein is a claim about the real world. The Order never asks for money, bank details, identification documents or photographs, and no representative will ever ask to meet you outside the experience. Sent to ${email} because an account was created at ${site}. If you no longer wish to receive transmissions, delete your account from your profile page.`
  for (const line of wrapLines(g, txt, W - 2 * M)) { g.fillText(line, M, y); y += 22 }
}

function appointmentFor(user) {
  const base = new Date(user.paidAt || user.createdAt)
  const appt = new Date(base.getTime() + 3 * 86400000)
  return appt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export async function renderAcceptanceLetter(user) {
  await loadFonts()
  const f = memberFields(user)
  const [emblem, seal] = await docAssets()
  const { w: W, h: H } = LETTER_PX
  const [canvas, g] = newCanvas(W, H)
  g.textBaseline = 'alphabetic'
  parchmentBase(g, W, H)
  let y = parchmentHeader(g, W, emblem, seal)

  const num = String(user.initiate ?? 0).padStart(4, '0')
  g.fillStyle = P_INK
  g.font = `700 25px ${DOC_SERIF}`
  g.fillText(`Hail the Light 👁  —  Dear ${f.name},`, DOC_M, y + 8)
  y += 52

  y = docParas(g, [
    'The ledger of the Order has reviewed your request, and only after that review have you been accepted to walk the hidden halls. Welcome to the mysterious world you have been searching for.',
    `From this hour your initiate number is № ${num} and your secret code — ${f.sealId || f.memberNo} — is bound to you and to no other soul. It was inscribed on ${f.memberSince}. Within these pages every wish for mystery is fulfilled: the six chambers of the Ritual Archive, the seven stations of the rites, the sigil vault and the counting of the New Order.`,
  ], W, y)

  // required-information box (in-fiction fields only)
  const boxItems = [
    'Your Order name (the name the Archive shall call you by)',
    'The chamber you wish to enter first',
    'The sigil you choose to bear',
  ]
  g.font = `400 21px ${DOC_SERIF}`
  const noteLines = wrapLines(g, 'The Order asks nothing else of you — no purse, no papers, no photographs. Complete it in your profile on the site.', W - 2 * DOC_M - 60)
  const boxH = 44 + boxItems.length * 30 + 10 + noteLines.length * 28 + 22
  g.fillStyle = '#efe5cf'
  roundRect(g, DOC_M, y, W - 2 * DOC_M, boxH, 10)
  g.fill()
  g.strokeStyle = '#b9a678'
  g.lineWidth = 1.5
  roundRect(g, DOC_M, y, W - 2 * DOC_M, boxH, 10)
  g.stroke()
  let by = y + 38
  g.fillStyle = P_GOLD
  g.font = `600 16px ${SANS}`
  spacing(g, 3)
  g.fillText('REQUIRED INFORMATION — TO BE COMPLETED IN YOUR PROFILE', DOC_M + 26, by)
  spacing(g, 0)
  by += 30
  g.fillStyle = '#25201a'
  g.font = `400 21px ${DOC_SERIF}`
  for (const item of boxItems) { g.fillText(`●  ${item}`, DOC_M + 26, by); by += 30 }
  by += 4
  for (const l of noteLines) { g.fillText(l, DOC_M + 26, by); by += 28 }
  y += boxH + 28

  g.textAlign = 'center'
  g.fillStyle = P_INK
  g.font = `700 24px ${DOC_SERIF}`
  spacing(g, 2)
  g.fillText('KEY TERMS & CONDITIONS', W / 2, y)
  spacing(g, 0)
  y += 16
  g.strokeStyle = '#b9a678'
  g.lineWidth = 1.5
  g.beginPath(); g.moveTo(DOC_M, y); g.lineTo(W - DOC_M, y); g.stroke()
  y += 32
  g.textAlign = 'left'
  y = docBullets(g, [
    'Anyone who joins must keep the Archive’s mysteries within the Archive; speak of them only to those who already walk its halls.',
    'This path is for those driven by an intense desire for ultimate mysteries. Everything you desire to know is within reach here.',
    'The sole condition: your seal is yours alone — lend it to no one.',
    'A word of caution: rule-breakers find the chambers sealed. Proceed only if you are genuinely curious — everything beyond this line is story.',
  ], W, y)

  y = parchmentSign(g, W, y + 6, f.memberSince, seal)
  parchmentFooter(g, W, H, f.email, f.rulesUrl.replace(/\/rules$/, ''))
  return { canvas }
}

export async function renderClearanceNotice(user) {
  await loadFonts()
  const f = memberFields(user)
  const [emblem, seal] = await docAssets()
  const { w: W, h: H } = LETTER_PX
  const [canvas, g] = newCanvas(W, H)
  g.textBaseline = 'alphabetic'
  parchmentBase(g, W, H)
  let y = parchmentHeader(g, W, emblem, seal)

  const appt = appointmentFor(user)
  g.textAlign = 'right'
  g.fillStyle = P_NAVY
  g.font = "26px 'Segoe Script', 'Brush Script MT', cursive"
  g.fillText(`Date: ${f.memberSince}`, W - DOC_M, y + 6)
  g.textAlign = 'left'
  y += 48
  g.fillStyle = P_INK
  g.font = `700 24px ${DOC_SERIF}`
  g.fillText('Subject: Confidential Final Clearance Notice', DOC_M, y)
  y += 18
  g.strokeStyle = '#b9a678'
  g.lineWidth = 1.5
  g.beginPath(); g.moveTo(DOC_M, y); g.lineTo(W - DOC_M, y); g.stroke()
  y += 40

  const site = f.rulesUrl.replace(/\/rules$/, '')
  y = docParas(g, [
    `To the Authorized Recipient, ${f.name}. This letter serves as your final confidential notification, issued under the seal of the Grand Master.`,
    `The secret code previously assigned to you — ${f.sealId || f.memberNo} — has now been activated for final verification.`,
    `You are hereby instructed to present on ${appt} at exactly 8:00 PM at the Sealed Chamber of the Archive: ${site}/rituals.`,
  ], W, y)

  y = docBullets(g, [
    'Arrive at the appointed hour and remain calm.',
    'The rite is performed entirely within the experience; no representative of the Order will ever ask to meet you outside it, and none may ask you for money, papers or photographs in its name.',
    'Do not leave the chamber until the rite concludes and your code is verified.',
    'Upon successful verification the next stage will be unsealed for you, and all further instructions will be revealed within. This is your final stage.',
  ], W, y, '●')
  y += 6

  y = docParas(g, [
    'Your authorized representative for this meeting is: The Keeper of the Gate — a presence of the experience only.',
    'This document is strictly confidential within the story. Do not disclose its contents, the meeting time or the scheduled chamber under any circumstances — and remember that no real-world action is required of you.',
    'Discipline, loyalty and absolute confidentiality are the foundation of our Order. By order of the Grand Master.',
  ], W, y)

  g.fillStyle = P_INK
  g.font = `700 25px ${DOC_SERIF}`
  g.fillText('Hail the Light 👁', DOC_M, y + 6)
  y += 40

  y = parchmentSign(g, W, y, f.memberSince, seal)
  parchmentFooter(g, W, H, f.email, site)
  return { canvas }
}

export async function downloadAcceptancePdf(user) {
  const { canvas } = await renderAcceptanceLetter(user)
  saveBlob(buildPdf([{ canvas, wMm: 210, hMm: 297 }]), `illuminati-acceptance-letter-${slug(user)}.pdf`)
}

export async function downloadClearancePdf(user) {
  const { canvas } = await renderClearanceNotice(user)
  saveBlob(buildPdf([{ canvas, wMm: 210, hMm: 297 }]), `illuminati-clearance-notice-${slug(user)}.pdf`)
}
