import { useEffect, useRef, useState } from 'react'

const formatNumber = (value) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)

/** Count-up animation that starts only when the stat scrolls into view. */
export default function CountUpNumber({ value, duration = 1400 }) {
  const nodeRef = useRef(null)
  const currentValue = useRef(value ?? 0)
  const animatedOnce = useRef(false)
  const [inView, setInView] = useState(false)
  const [displayed, setDisplayed] = useState(value ?? 0)

  useEffect(() => {
    const node = nodeRef.current
    if (!node) return undefined
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return undefined
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true)
        observer.disconnect()
      }
    }, { threshold: 0.35 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) {
      currentValue.current = 0
      setDisplayed(0)
      return undefined
    }

    const target = Math.max(0, Math.round(Number(value)))
    if (!inView) {
      currentValue.current = target
      setDisplayed(target)
      return undefined
    }

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion || typeof window.requestAnimationFrame !== 'function') {
      currentValue.current = target
      setDisplayed(target)
      animatedOnce.current = true
      return undefined
    }

    const startValue = animatedOnce.current ? currentValue.current : 0
    let startTime
    let frameId
    animatedOnce.current = true
    currentValue.current = startValue
    setDisplayed(startValue)

    const tick = (now) => {
      if (startTime === undefined) startTime = now
      const progress = Math.min(1, (now - startTime) / duration)
      const eased = 1 - (1 - progress) ** 3
      const next = Math.round(startValue + (target - startValue) * eased)
      currentValue.current = next
      setDisplayed(next)
      if (progress < 1) frameId = window.requestAnimationFrame(tick)
    }
    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [duration, inView, value])

  return (
    <span ref={nodeRef} aria-live="off">
      {value === null || value === undefined ? '—' : formatNumber(displayed)}
    </span>
  )
}
