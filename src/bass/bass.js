import * as Tone from 'tone'

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

// Tonics are voiced between E1 and Eb2, the range of a four string bass
const LOWEST_TONIC_MIDI = 28

const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11]

const midiToNote = (midi) =>
  `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`

const noteToMidi = (note) => {
  const [, name, octave] = note.match(/^([A-G]b?)(-?\d+)$/)
  return NOTE_NAMES.indexOf(name) + (Number(octave) + 1) * 12
}

export const transposeNote = (note, octaves) =>
  midiToNote(noteToMidi(note) + octaves * 12)

// Octave shifts that keep a note at E1 or above, since anything lower is
// too low for most speakers to play
export const bassOctaveRange = (note, maxOctave) => ({
  min: -Math.floor((noteToMidi(note) - LOWEST_TONIC_MIDI) / 12),
  max: maxOctave
})

// Every note from the tonic up to the tonic an octave higher, so chromatic
// passing tones are there alongside the scale
export function bassNotesForKey(key) {
  const tonic = NOTE_NAMES.indexOf(key)
  const tonicMidi =
    LOWEST_TONIC_MIDI + ((tonic - (LOWEST_TONIC_MIDI % 12) + 12) % 12)

  return Array.from({ length: 13 }, (_, interval) => ({
    note: midiToNote(tonicMidi + interval),
    inKey: MAJOR_SCALE.includes(interval % 12)
  }))
}

const ENVELOPE = { attack: 0.01, decay: 0.3, sustain: 0.8, release: 0.3 }

// Volumes are set by ear so switching sounds doesn't jump in level
export const BASS_TEXTURES = {
  round: {
    label: 'Round',
    volume: 2,
    options: {
      oscillator: { type: 'triangle' },
      envelope: ENVELOPE,
      filter: { Q: 1, type: 'lowpass' },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.6,
        release: 0.3,
        baseFrequency: 200,
        octaves: 2
      }
    }
  },
  pluck: {
    label: 'Pluck',
    volume: -2,
    options: {
      oscillator: { type: 'square' },
      envelope: { attack: 0.005, decay: 0.4, sustain: 0.3, release: 0.2 },
      filter: { Q: 3, type: 'lowpass' },
      filterEnvelope: {
        attack: 0.001,
        decay: 0.12,
        sustain: 0.05,
        release: 0.2,
        baseFrequency: 100,
        octaves: 4
      }
    }
  },
  sub: {
    label: 'Sub',
    volume: 4,
    options: {
      oscillator: { type: 'sine' },
      envelope: ENVELOPE,
      filter: { Q: 0, type: 'lowpass' },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 1,
        release: 0.3,
        baseFrequency: 400,
        octaves: 0
      }
    }
  },
  fatSaw: {
    label: 'Fat Saw',
    volume: -8,
    options: {
      oscillator: { type: 'fatsawtooth', count: 3, spread: 25 },
      envelope: ENVELOPE,
      filter: { Q: 2, type: 'lowpass' },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.5,
        release: 0.3,
        baseFrequency: 150,
        octaves: 3
      }
    }
  },
  acid: {
    label: 'Acid',
    volume: -8,
    options: {
      oscillator: { type: 'sawtooth' },
      envelope: ENVELOPE,
      filter: { Q: 12, type: 'lowpass' },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.25,
        sustain: 0.15,
        release: 0.2,
        baseFrequency: 150,
        octaves: 4
      }
    }
  }
}

// Live playing and the loop get separate synths so playing along with a
// looped bass line doesn't cut it off
const voices = {}

export function buildBass(texture) {
  const { options, volume } = BASS_TEXTURES[texture]
  ;['live', 'loop'].forEach((voice) => {
    voices[voice]?.dispose()
    voices[voice] = new Tone.MonoSynth(options).toDestination()
    voices[voice].volume.value = volume
  })
}

export const startBassNote = (note, time = '+0.01', voice = 'live') =>
  voices[voice].triggerAttack(note, time, 0.8)

export const stopBassNote = (time = '+0.01', voice = 'live') =>
  voices[voice].triggerRelease(time)
