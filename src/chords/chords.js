import * as Tone from 'tone'

let synth

export const majorScaleChords = {}

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

// Roots are voiced between A2 and Ab3 so every key sits in the same register
const LOWEST_ROOT_MIDI = 45

// Intervals in semitones above the chord root
const CHORD_TYPES = {
  '': [0, 4, 7],
  Maj7: [0, 4, 7, 11],
  Maj9: [0, 4, 7, 11, 14],
  'Maj7#11': [0, 4, 7, 11, 18],
  add9: [0, 4, 7, 14],
  6: [0, 4, 7, 9],
  '6/9': [0, 4, 7, 9, 14],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  7: [0, 4, 7, 10],
  9: [0, 4, 7, 10, 14],
  '7sus4': [0, 5, 7, 10],
  m: [0, 3, 7],
  m7: [0, 3, 7, 10],
  m9: [0, 3, 7, 10, 14],
  madd9: [0, 3, 7, 14],
  m11: [0, 3, 7, 10, 14, 17],
  dim: [0, 3, 6],
  m7b5: [0, 3, 6, 10],
  5: [0, 7]
}

// Each entry is a chord root (semitones above the tonic), the chord types
// built on it, and the types that also get inversions (rendered as slash
// chords right after the root position chord). Order here is the order the
// chord boxes render in.
const MAJOR_KEY_CHORDS = [
  // I
  [0, ['', 'Maj7', 'Maj9', 'add9', '6', '6/9', 'sus2', 'sus4', '5'], ['']],
  // ii
  [2, ['m', 'm7', 'm9', 'madd9', 'm11', '5'], ['m']],
  // iii
  [4, ['m', 'm7', '5'], ['m']],
  // IV
  [5, ['', 'Maj7', 'Maj9', 'add9', '6', 'Maj7#11', '5'], ['']],
  // V
  [7, ['', '7', '9', 'add9', '6', 'sus4', '7sus4', '5'], ['', '7']],
  // vi
  [9, ['m', 'm7', 'm9', 'madd9', 'm11', '5'], ['m']],
  // vii
  [11, ['dim', 'm7b5']],
  // Borrowed and secondary dominant chords: II7 (V/V), III7 (V/vi), iv, bVI, bVII
  [2, ['7']],
  [4, ['7']],
  [5, ['m']],
  [8, ['']],
  [10, ['']]
]

const midiToNote = (midi) =>
  `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`

const rootMidi = (pitchClass) =>
  LOWEST_ROOT_MIDI + ((pitchClass - (LOWEST_ROOT_MIDI % 12) + 12) % 12)

// Rotates the lowest `inversion` chord tones up an octave so the chord tone at
// that index becomes the bass note
const invert = (intervals, inversion) => [
  ...intervals.slice(inversion),
  ...intervals.slice(0, inversion).map((interval) => interval + 12)
]

export function buildChords(synthTexture) {
  const volume = synthTexture === 'sine' || synthTexture === 'triangle' ? 1 : -2
  if (synth) {
    synth.dispose()
  }
  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: synthTexture
    }
  }).toDestination()
  synth.maxPolyphony = 64
  synth.volume.value = volume

  class chordObj {
    constructor(midis) {
      this.midis = midis
    }

    notes(octave) {
      return this.midis.map((midi) => midiToNote(midi + octave * 12))
    }

    start(time = '+0.01', octave = 0) {
      synth.triggerAttack(this.notes(octave), time, 0.3)
    }

    stop(time = '+0.01', octave = 0) {
      synth.triggerRelease(this.notes(octave), time)
    }
  }

  NOTE_NAMES.forEach((key, tonic) => {
    majorScaleChords[key] = {}

    MAJOR_KEY_CHORDS.forEach(([offset, types, invertedTypes = []]) => {
      const pitchClass = (tonic + offset) % 12
      const root = rootMidi(pitchClass)

      types.forEach((type) => {
        const name = `${NOTE_NAMES[pitchClass]}${type}`
        const intervals = CHORD_TYPES[type]
        const inversions = invertedTypes.includes(type) ? intervals.length : 1

        for (let inversion = 0; inversion < inversions; inversion++) {
          const bass = NOTE_NAMES[(pitchClass + intervals[inversion]) % 12]
          const midis = invert(intervals, inversion).map(
            (interval) => root + interval
          )
          majorScaleChords[key][inversion ? `${name}/${bass}` : name] =
            new chordObj(midis)
        }
      })
    })
  })
}
