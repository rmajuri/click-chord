export const BEATS_PER_BAR = 4

export const MIN_OCTAVE = -2
export const MAX_OCTAVE = 2

// Grid sizes in beats (quarter notes)
export const QUANTIZE_GRIDS = [
  { label: '1 Bar', beats: 4 },
  { label: '1/2', beats: 2 },
  { label: '1/4', beats: 1 },
  { label: '1/8', beats: 0.5 }
]

// Turns a raw recording ({ events, duration, bpm }, times in seconds from the
// first chord) into steps snapped to the grid, plus a loop length in whole bars.
// A step with a null chord is a rest. Each step keeps the index of the event
// it came from, which stays stable across re-quantizing.
export function quantizeRecording(recording, gridBeats) {
  if (!recording || !recording.events.length) {
    return null
  }

  const { events, duration, bpm } = recording
  const toBeats = (seconds) => (seconds * bpm) / 60
  const snap = (beats) => Math.round(beats / gridBeats) * gridBeats

  // When several changes land on the same grid slot, the last one wins
  const slots = new Map()
  events.forEach(({ time, chord, key }, eventIndex) => {
    slots.set(snap(toBeats(time)), { chord, key, eventIndex })
  })

  const steps = []
  ;[...slots.entries()]
    .sort(([a], [b]) => a - b)
    .forEach(([beat, { chord, key, eventIndex }]) => {
      const prev = steps.at(-1)
      const unchanged = prev
        ? prev.chord === chord && prev.key === key
        : chord === null
      if (!unchanged) {
        steps.push({ beat, chord, key, eventIndex })
      }
    })

  if (!steps.length) {
    return null
  }

  // The loop has to cover the last step, and otherwise follows where the
  // user pressed stop, rounded to the nearest bar
  const last = steps.at(-1)
  const minEnd = last.beat + (last.chord ? gridBeats : 0)
  const loopBeats = Math.max(
    BEATS_PER_BAR,
    Math.ceil(minEnd / BEATS_PER_BAR) * BEATS_PER_BAR,
    Math.round(toBeats(duration) / BEATS_PER_BAR) * BEATS_PER_BAR
  )

  return {
    loopBeats,
    steps: steps.map((step, i) => ({
      ...step,
      duration: (steps[i + 1]?.beat ?? loopBeats) - step.beat
    }))
  }
}
