const SHAPES = 'path,circle,ellipse,polygon,rect,line'

/** Animates every shape in the given SVGs as if being drawn by hand. Returns a cleanup function. */
export default function drawOn(svgs) {
  if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
  const animations = []
  svgs.forEach((svg) => {
    svg.querySelectorAll(SHAPES).forEach((el, i) => {
      if (typeof el.animate !== 'function' || typeof el.getTotalLength !== 'function') return
      const cs = getComputedStyle(el)
      const delay = Math.min(i * 70, 700)
      if (cs.stroke !== 'none') {
        const len = el.getTotalLength()
        if (len > 0) {
          el.style.strokeDasharray = `${len}`
          const a = el.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 900, delay, easing: 'ease-out', fill: 'backwards' })
          a.onfinish = () => { el.style.strokeDasharray = '' }
          animations.push({ a, el })
        }
      }
      if (cs.fill !== 'none') {
        animations.push({ a: el.animate([{ fillOpacity: 0 }, { fillOpacity: 1 }], { duration: 500, delay: delay + 450, fill: 'backwards' }), el: null })
      }
    })
  })
  return () => animations.forEach(({ a, el }) => { a.cancel(); if (el) el.style.strokeDasharray = '' })
}
