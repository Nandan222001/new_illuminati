import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Dark-ambient horror bed: a synthesized drone (detuned + tritone sub
 * oscillators, filtered brown noise, a faint heartbeat pulse, occasional
 * dissonant "dread" stings) plus a looping diabolical-laughter clip
 * (/public/assets/diabolical-laughter.mp3), all routed through one master
 * gain so it fades in/out together. Must be started from a user gesture
 * (browser autoplay policy), which the navbar toggle's onClick satisfies.
 */
function buildNoiseBuffer(ctx) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02
    data[i] = last * 3.5
  }
  return buffer
}

/** A faint two-beat "lub-dub" pulse, like a heart in the dark. */
function playHeartbeat(ctx, master) {
  const now = ctx.currentTime
  ;[0, 0.28].forEach((offset, i) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(i === 0 ? 52 : 44, now + offset)
    osc.frequency.exponentialRampToValueAtTime(30, now + offset + 0.18)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, now + offset)
    gain.gain.linearRampToValueAtTime(0.18, now + offset + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.3)
    osc.connect(gain)
    gain.connect(master)
    osc.start(now + offset)
    osc.stop(now + offset + 0.35)
  })
}

/** An occasional rising-and-fading dissonant tritone swell — a distant "something's wrong". */
function playSting(ctx, master) {
  const now = ctx.currentTime
  const dur = 3 + Math.random() * 2.5
  ;[116, 116 * Math.SQRT2].forEach((freq) => {
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = freq
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.Q.value = 4
    filter.frequency.setValueAtTime(180, now)
    filter.frequency.linearRampToValueAtTime(1000, now + dur * 0.45)
    filter.frequency.linearRampToValueAtTime(140, now + dur)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.05, now + dur * 0.35)
    gain.gain.linearRampToValueAtTime(0, now + dur)
    osc.connect(filter)
    filter.connect(gain)
    gain.connect(master)
    osc.start(now)
    osc.stop(now + dur + 0.1)
  })
}

export function useAmbientSound() {
  const [on, setOn] = useState(false)
  const ctxRef = useRef(null)
  const graphRef = useRef(null)

  const start = useCallback(() => {
    if (ctxRef.current) return
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext
    if (!AudioContextCtor) return
    const ctx = new AudioContextCtor()
    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)

    const nodes = []
    // Low detuned drone: a sub, plus a tritone pair — the "devil's interval" — for constant unease.
    ;[[55, 'triangle', 0.045], [55 * Math.SQRT2, 'triangle', 0.04], [27.5, 'sine', 0.09]].forEach(([freq, type, level]) => {
      const osc = ctx.createOscillator()
      osc.type = type
      osc.frequency.value = freq
      const gain = ctx.createGain()
      gain.gain.value = level
      const lfo = ctx.createOscillator()
      lfo.frequency.value = 0.04 + Math.random() * 0.03
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = level * 0.4
      lfo.connect(lfoGain)
      lfoGain.connect(gain.gain)
      osc.connect(gain)
      gain.connect(master)
      osc.start()
      lfo.start()
      nodes.push(osc, lfo)
    })

    // Filtered brown-noise bed for a distant wind/hall texture.
    const noise = ctx.createBufferSource()
    noise.buffer = buildNoiseBuffer(ctx)
    noise.loop = true
    const noiseFilter = ctx.createBiquadFilter()
    noiseFilter.type = 'lowpass'
    noiseFilter.frequency.value = 500
    const noiseGain = ctx.createGain()
    noiseGain.gain.value = 0.05
    noise.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(master)
    noise.start()
    nodes.push(noise)

    // Looping diabolical laughter, routed through its own gain so it blends with the rest.
    const laughter = new Audio('/assets/diabolical-laughter.mp3')
    laughter.loop = true
    laughter.crossOrigin = 'anonymous'
    const laughterSource = ctx.createMediaElementSource(laughter)
    const laughterGain = ctx.createGain()
    laughterGain.gain.value = 0.35
    laughterSource.connect(laughterGain)
    laughterGain.connect(master)
    laughter.play().catch(() => { /* blocked until a user gesture; toggle already is one */ })

    const now = ctx.currentTime
    master.gain.setValueAtTime(0, now)
    master.gain.linearRampToValueAtTime(1, now + 1.5)

    // Faint heartbeat pulse, and an occasional dissonant sting at a random interval.
    const timers = {}
    timers.heartbeat = window.setInterval(() => playHeartbeat(ctx, master), 2400)
    const scheduleSting = () => {
      timers.sting = window.setTimeout(() => { playSting(ctx, master); scheduleSting() }, 15000 + Math.random() * 20000)
    }
    scheduleSting()

    ctxRef.current = ctx
    graphRef.current = { master, nodes, timers, laughter }
  }, [])

  const teardown = useCallback((fade) => {
    const ctx = ctxRef.current
    const graph = graphRef.current
    if (!ctx || !graph) return
    ctxRef.current = null
    graphRef.current = null
    const { master, nodes, timers, laughter } = graph
    window.clearInterval(timers.heartbeat)
    window.clearTimeout(timers.sting)
    const now = ctx.currentTime
    if (fade) {
      master.gain.cancelScheduledValues(now)
      master.gain.setValueAtTime(master.gain.value, now)
      master.gain.linearRampToValueAtTime(0, now + 1.2)
    }
    laughter.pause()
    laughter.currentTime = 0
    const stopAt = fade ? now + 1.3 : now
    nodes.forEach((n) => { try { n.stop(stopAt) } catch { /* already stopped */ } })
    window.setTimeout(() => { try { ctx.close() } catch { /* already closed */ } }, fade ? 1400 : 0)
  }, [])

  useEffect(() => {
    if (on) start()
    else teardown(true)
  }, [on, start, teardown])

  // Stop immediately (no fade) if the app unmounts mid-playback.
  useEffect(() => () => teardown(false), [teardown])

  return { on, toggle: () => setOn((v) => !v) }
}
