/** Splits text into lines that fit maxWidth. Uses words when the text has spaces, characters otherwise (e.g. Chinese). */
export function wrapLines(ctx, text, maxWidth) {
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
