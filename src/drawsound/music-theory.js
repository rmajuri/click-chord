export const KEY_SEMITONES = {
  C: 0,
  Db: 1,
  D: 2,
  Eb: 3,
  E: 4,
  F: 5,
  Gb: 6,
  G: 7,
  Ab: 8,
  A: 9,
  Bb: 10,
  B: 11
}

const NOTE_NAMES = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B'
]

export const MODES = {
  major: { label: 'major', steps: [0, 2, 4, 5, 7, 9, 11] },
  lydian: { label: 'lydian', steps: [0, 2, 4, 6, 7, 9, 11] },
  mixolydian: { label: 'mixolydian', steps: [0, 2, 4, 5, 7, 9, 10] },
  dorian: { label: 'dorian', steps: [0, 2, 3, 5, 7, 9, 10] },
  aeolian: { label: 'minor', steps: [0, 2, 3, 5, 7, 8, 10] }
}

// Chord roots as scale degrees (0 is the home chord), one chord per bar
export const PROGRESSIONS = {
  major: [
    [0, 4, 5, 3],
    [0, 5, 3, 4],
    [0, 3, 4, 3],
    [5, 3, 0, 4],
    [0, 2, 3, 4],
    [0, 3, 0, 4]
  ],
  lydian: [
    [0, 1, 0, 1],
    [0, 1, 4, 0],
    [0, 4, 1, 0],
    [0, 6, 1, 0]
  ],
  mixolydian: [
    [0, 6, 3, 0],
    [0, 3, 6, 0],
    [0, 6, 3, 4],
    [0, 4, 6, 3]
  ],
  dorian: [
    [0, 3, 0, 3],
    [0, 6, 3, 0],
    [0, 2, 3, 0],
    [0, 3, 6, 0]
  ],
  aeolian: [
    [0, 5, 2, 6],
    [0, 3, 4, 0],
    [0, 5, 3, 4],
    [0, 6, 5, 6],
    [0, 3, 6, 2]
  ]
}

// Scale degree (any integer, may be negative) to a MIDI note
export const degreeToMidi = (degree, rootMidi, mode) => {
  const steps = MODES[mode].steps
  const octave = Math.floor(degree / 7)
  const index = ((degree % 7) + 7) % 7
  return rootMidi + octave * 12 + steps[index]
}

export const midiToFrequency = (midi) => 440 * 2 ** ((midi - 69) / 12)

export const midiToName = (midi) =>
  `${NOTE_NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`

export const chordDegrees = (root, size = 3) =>
  Array.from({ length: size }, (_, i) => root + i * 2)

export const chordName = (root, key, mode) => {
  const base = degreeToMidi(root, 0, mode)
  const third = degreeToMidi(root + 2, 0, mode) - base
  const fifth = degreeToMidi(root + 4, 0, mode) - base
  const name = NOTE_NAMES[(KEY_SEMITONES[key] + base) % 12]
  if (third === 3 && fifth === 6) {
    return `${name}°`
  }
  return third === 3 ? `${name}m` : name
}

// The chord tone degree closest to a target degree
export const nearestChordTone = (target, chordRoot) => {
  let best = target
  let bestDistance = Infinity
  for (let degree = target - 4; degree <= target + 4; degree++) {
    const fromRoot = (((degree - chordRoot) % 7) + 7) % 7
    if ([0, 2, 4].includes(fromRoot)) {
      const distance = Math.abs(degree - target)
      if (distance < bestDistance) {
        best = degree
        bestDistance = distance
      }
    }
  }
  return best
}
