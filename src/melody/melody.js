import * as Tone from 'tone'
import { createMonoInstrument } from '../mono-instrument/mono-instrument'

const ENVELOPE = { attack: 0.01, decay: 0.2, sustain: 0.7, release: 0.4 }

// Volumes are set by ear so switching sounds doesn't jump in level, and sit
// lower than the bass since higher notes cut through more
const TEXTURES = {
  lead: {
    label: 'Lead',
    volume: -12,
    options: {
      oscillator: { type: 'sawtooth' },
      envelope: ENVELOPE,
      filter: { Q: 1, type: 'lowpass' },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.6,
        release: 0.4,
        baseFrequency: 800,
        octaves: 2
      }
    }
  },
  soft: {
    label: 'Soft',
    volume: -4,
    options: {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.06, decay: 0.2, sustain: 0.8, release: 0.6 },
      filter: { Q: 0, type: 'lowpass' },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 1,
        release: 0.6,
        baseFrequency: 3000,
        octaves: 0
      }
    }
  },
  chip: {
    label: 'Chip',
    volume: -16,
    options: {
      oscillator: { type: 'square' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0.9, release: 0.1 },
      filter: { Q: 0, type: 'lowpass' },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 1,
        release: 0.1,
        baseFrequency: 6000,
        octaves: 0
      }
    }
  },
  bell: {
    label: 'Bell',
    volume: -8,
    synth: Tone.FMSynth,
    options: {
      harmonicity: 3.01,
      modulationIndex: 10,
      envelope: { attack: 0.001, decay: 1.2, sustain: 0.1, release: 1.2 },
      modulationEnvelope: {
        attack: 0.002,
        decay: 0.6,
        sustain: 0.2,
        release: 1
      }
    }
  },
  glide: {
    label: 'Glide',
    volume: -12,
    options: {
      // Slides between notes instead of jumping
      portamento: 0.08,
      oscillator: { type: 'sawtooth' },
      envelope: ENVELOPE,
      filter: { Q: 4, type: 'lowpass' },
      filterEnvelope: {
        attack: 0.02,
        decay: 0.4,
        sustain: 0.5,
        release: 0.4,
        baseFrequency: 600,
        octaves: 2.5
      }
    }
  }
}

// Tonics are voiced between C4 and B4, above the chords, and recorded notes
// can be shifted between C3 and C7
export const melody = createMonoInstrument({
  lowestTonicMidi: 60,
  minMidi: 48,
  maxMidi: 96,
  textures: TEXTURES
})
