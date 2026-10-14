import { createMonoInstrument } from '../mono-instrument/mono-instrument'

const ENVELOPE = { attack: 0.01, decay: 0.3, sustain: 0.8, release: 0.3 }

// Volumes are set by ear so switching sounds doesn't jump in level
const TEXTURES = {
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

// Tonics are voiced between E1 and Eb2, the range of a four string bass.
// Recorded notes can't drop below E1, since anything lower is too low for
// most speakers to play
export const bass = createMonoInstrument({
  lowestTonicMidi: 28,
  minMidi: 28,
  maxMidi: 75,
  textures: TEXTURES
})
