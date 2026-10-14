import { MONO_INSTRUMENTS } from '../mono-instrument/instruments'

export const BEATS_PER_BAR = 4

const MIN_OCTAVE = -2
const MAX_OCTAVE = 2

// How far a step can be shifted by octaves, kept within each single-note
// instrument's range
export const octaveRange = (track, name) => {
  const instrument = MONO_INSTRUMENTS[track]
  if (!instrument) {
    return { min: MIN_OCTAVE, max: MAX_OCTAVE }
  }
  const { min, max } = instrument.octaveRange(name)
  return { min: Math.max(MIN_OCTAVE, min), max: Math.min(MAX_OCTAVE, max) }
}

// Grid sizes in beats (quarter notes)
export const QUANTIZE_GRIDS = [
  { label: '1 Bar', beats: 4 },
  { label: '1/2', beats: 2 },
  { label: '1/4', beats: 1 },
  { label: '1/8', beats: 0.5 }
]

// Turns a raw recording ({ events, duration, bpm, loopUnit }, times in seconds
// from the start of the take) into steps snapped to the grid, plus a loop
// length in whole multiples of loopUnit beats (a bar unless the take was
// recorded over a loop). Each event's name is a chord or a single note, and a
// step with a null name is a rest. Each step keeps the index of the event it
// came from, which stays stable across re-quantizing.
export function quantizeRecording(recording, gridBeats) {
  if (!recording || !recording.events.length) {
    return null
  }

  const { events, duration, bpm, loopUnit = BEATS_PER_BAR } = recording
  const toBeats = (seconds) => (seconds * bpm) / 60
  const snap = (beats) => Math.round(beats / gridBeats) * gridBeats

  // When several changes land on the same grid slot, the last one wins
  const slots = new Map()
  events.forEach(({ time, name, key }, eventIndex) => {
    slots.set(snap(toBeats(time)), { name, key, eventIndex })
  })

  const steps = []
  ;[...slots.entries()]
    .sort(([a], [b]) => a - b)
    .forEach(([beat, { name, key, eventIndex }]) => {
      const prev = steps.at(-1)
      const unchanged = prev
        ? prev.name === name && prev.key === key
        : name === null
      if (!unchanged) {
        steps.push({ beat, name, key, eventIndex })
      }
    })

  if (!steps.length) {
    return null
  }

  // A take recorded over a loop can come in partway through it, so it starts
  // with a rest to stop the last note ringing on into the next time around
  if (steps[0].beat > 0) {
    steps.unshift({ beat: 0, name: null, key: null, eventIndex: -1 })
  }

  // The loop has to cover the last step, and otherwise follows where the
  // user pressed stop, rounded to the nearest loop unit
  const last = steps.at(-1)
  const minEnd = last.beat + (last.name ? gridBeats : 0)
  const loopBeats = Math.max(
    loopUnit,
    Math.ceil(minEnd / loopUnit) * loopUnit,
    Math.round(toBeats(duration) / loopUnit) * loopUnit
  )

  return {
    loopBeats,
    steps: steps.map((step, i) => ({
      ...step,
      duration: (steps[i + 1]?.beat ?? loopBeats) - step.beat
    }))
  }
}
