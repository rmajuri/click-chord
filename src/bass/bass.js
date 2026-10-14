import * as Tone from 'tone'

let synth

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

export function buildBass(synthTexture) {
  if (synth) {
    synth.dispose()
  }
  synth = new Tone.MonoSynth({
    oscillator: { type: synthTexture },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.8, release: 0.3 },
    filter: { Q: 2, type: 'lowpass' },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.4,
      release: 0.3,
      baseFrequency: 120,
      octaves: 3
    }
  }).toDestination()
  synth.volume.value =
    synthTexture === 'sine' || synthTexture === 'triangle' ? 2 : -4
}

export const startBassNote = (note) => synth.triggerAttack(note, '+0.01', 0.8)

export const stopBassNote = () => synth.triggerRelease('+0.01')
