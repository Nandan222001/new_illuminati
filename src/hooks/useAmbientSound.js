import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Website music — "The New World Order", an original score synthesized in the
 * browser (item 12 replaced the old horror drone + laughter loop).
 *
 * The bed is a slow four-chord cathedral progression in A minor (Am → F → Dm
 * → E) played on soft organ tones over a deep sub-drone, an airy noise pad and
 * occasional distant bells, all fed through a generated reverb. Nothing here
 * is sampled or licensed, so the site can ship it royalty-free.
 *
 * If the Keeper drops a track at /public/assets/site-ambient.mp3 it is used
 * instead, so the music can be swapped without a code change.
 */
const FILE_TRACK = '/assets/site-ambient.mp3'

/** Chord voicings (Hz) and the root of each chord's bass note. */
const PROGRESSION = [
  { bass: 55.00, notes: [110.00, 130.81, 164.81, 220.00] }, // A minor
  { bass: 43.65, notes: [87.31, 110.00, 130.81, 174.61] },  // F major
  { bass: 73.42, notes: [146.83, 174.61, 220.00, 293.66] }, // D minor
  { bass: 41.20, notes: [82.41, 103.83, 123.47, 164.81] },  // E major
]
const CHORD_SECONDS = 14
const CHORUS_DETUNE = 1.004

/** Simple noise-decay impulse response used as a hall reverb. */
function buildReverb(ctx, seconds = 3.4, decay = 2.6) {
  const length = Math.floor(ctx.sampleRate * seconds)
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate)
  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const data = impulse.getChannelData(channel)
    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay
    }
  }
  return impulse
}

/** Soft organ voice: two slightly detuned oscillators through a gentle low-pass. */
function organVoice(ctx, destination, frequency, level, type = 'sine') {
  const gain = ctx.createGain()
  gain.gain.value = level
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = Math.min(2600, frequency * 8)
  filter.Q.value = 0.6
  filter.connect(gain)
  gain.connect(destination)

  const oscillators = [frequency, frequency * CHORUS_DETUNE].map((f, i) => {
    const osc = ctx.createOscillator()
    osc.type = i === 0 ? type : 'triangle'
    osc.frequency.value = f
    osc.connect(filter)
    osc.start()
    return osc
  })
  return { gain, filter, oscillators }
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

    const bus = ctx.createGain()
    bus.gain.value = 1
    const reverb = ctx.createConvolver()
    reverb.buffer = buildReverb(ctx)
    const wet = ctx.createGain()
    wet.gain.value = 0.5
    bus.connect(master)
    bus.connect(reverb)
    reverb.connect(wet)
    wet.connect(master)

    const nodes = []
    const timers = {}

    // Sub drone under the whole piece.
    const drone = organVoice(ctx, bus, PROGRESSION[0].bass / 1, 0.05, 'sine')
    const droneLfo = ctx.createOscillator()
    droneLfo.frequency.value = 0.03
    const droneLfoGain = ctx.createGain()
    droneLfoGain.gain.value = 0.02
    droneLfo.connect(droneLfoGain)
    droneLfoGain.connect(drone.gain.gain)
    droneLfo.start()
    nodes.push(...drone.oscillators, droneLfo)

    // Airy pad: filtered noise with a slow swell.
    const noise = ctx.createBufferSource()
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 6, ctx.sampleRate)
    const noiseData = noiseBuffer.getChannelData(0)
    let last = 0
    for (let i = 0; i < noiseData.length; i += 1) {
      last = (last + 0.015 * (Math.random() * 2 - 1)) / 1.015
      noiseData[i] = last * 2.4
    }
    noise.buffer = noiseBuffer
    noise.loop = true
    const noiseFilter = ctx.createBiquadFilter()
    noiseFilter.type = 'bandpass'
    noiseFilter.frequency.value = 620
    noiseFilter.Q.value = 0.7
    const noiseGain = ctx.createGain()
    noiseGain.gain.value = 0.035
    noise.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(bus)
    noise.start()
    nodes.push(noise)

    // Distant bell — struck at random intervals, long decay into the reverb.
    const strikeBell = () => {
      const now = ctx.currentTime
      const partials = [1, 2.02, 3.01]
      const root = 523.25 * (Math.random() < 0.5 ? 1 : 1.5)
      partials.forEach((partial, index) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = root * partial
        const gain = ctx.createGain()
        gain.gain.setValueAtTime(0.0001, now)
        gain.gain.linearRampToValueAtTime(0.05 / (index + 1.4), now + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 7 - index)
        osc.connect(gain)
        gain.connect(bus)
        osc.start(now)
        osc.stop(now + 7.5)
      })
    }

    // Chord bed: crossfade through the progression forever.
    const voiceGroups = []
    const playChord = (index) => {
      const chord = PROGRESSION[index % PROGRESSION.length]
      const now = ctx.currentTime
      const group = chord.notes.map((freq, i) => organVoice(ctx, bus, freq, 0, i === 0 ? 'triangle' : 'sine'))
      group.forEach((voice, i) => {
        voice.gain.gain.cancelScheduledValues(now)
        voice.gain.gain.setValueAtTime(0.0001, now)
        voice.gain.gain.linearRampToValueAtTime(0.075 / (i * 0.35 + 1), now + CHORD_SECONDS * 0.35)
        voice.gain.gain.linearRampToValueAtTime(0.0001, now + CHORD_SECONDS * 1.15)
      })
      voiceGroups.push(group)
      // Release the previous chord so only two voices overlap at a time.
      while (voiceGroups.length > 2) {
        voiceGroups.shift().forEach((voice) => {
          voice.oscillators.forEach((osc) => { try { osc.stop(now + 1) } catch { /* stopped */ } })
        })
      }
      timers.chord = window.setTimeout(() => playChord(index + 1), CHORD_SECONDS * 1000)
    }

    master.gain.setValueAtTime(0, ctx.currentTime)
    master.gain.linearRampToValueAtTime(1, ctx.currentTime + 4)

    playChord(0)
    strikeBell()
    timers.bell = window.setInterval(strikeBell, 21000)

    ctxRef.current = ctx
    graphRef.current = { master, nodes, timers, voiceGroups, fileTrack: null }

    // Prefer a real track if the Keeper uploaded one.
    const fileTrack = new Audio(FILE_TRACK)
    fileTrack.loop = true
    fileTrack.volume = 0
    fileTrack.crossOrigin = 'anonymous'
    fileTrack.addEventListener('canplaythrough', () => {
      const graph = graphRef.current
      if (!graph || graph.fileTrack) return
      graph.fileTrack = fileTrack
      // Fade the synthesized score out and the uploaded track in.
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.5)
      fileTrack.volume = 1
      fileTrack.play().catch(() => { /* still gestated by the toggle click */ })
    }, { once: true })
    fileTrack.addEventListener('error', () => { /* no override file — keep the synthesized score */ }, { once: true })
    fileTrack.load()
  }, [])

  const teardown = useCallback((fade) => {
    const ctx = ctxRef.current
    const graph = graphRef.current
    if (!ctx || !graph) return
    ctxRef.current = null
    graphRef.current = null
    const { master, nodes, timers, voiceGroups, fileTrack } = graph
    window.clearTimeout(timers.chord)
    window.clearInterval(timers.bell)
    const now = ctx.currentTime
    if (fade) {
      master.gain.cancelScheduledValues(now)
      master.gain.setValueAtTime(master.gain.value, now)
      master.gain.linearRampToValueAtTime(0, now + 2)
    }
    if (fileTrack) {
      window.setTimeout(() => { try { fileTrack.pause() } catch { /* detached */ } }, fade ? 2400 : 0)
    }
    const stopAt = fade ? now + 2.2 : now
    const allVoices = [...(voiceGroups || []), ...(nodes || []).map((osc) => ({ oscillators: [osc] }))]
    allVoices.forEach((voice) => {
      (voice.oscillators || []).forEach((osc) => { try { osc.stop(stopAt) } catch { /* already stopped */ } })
    })
    window.setTimeout(() => { try { ctx.close() } catch { /* already closed */ } }, fade ? 2600 : 0)
  }, [])

  useEffect(() => {
    if (on) start()
    else teardown(true)
  }, [on, start, teardown])

  // Stop immediately (no fade) if the app unmounts mid-playback.
  useEffect(() => () => teardown(false), [teardown])

  return { on, toggle: () => setOn((v) => !v) }
}
