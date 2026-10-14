import * as Tone from 'tone'
import { midiToFrequency } from './music-theory'

// Each recipe builds a polyphonic instrument and any effects it needs, and
// returns the node to connect onward. Built inside whatever Tone context is
// current, so the same recipes serve live playback and offline export.
const RECIPES = {
  bell: () =>
    new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3.5,
      modulationIndex: 8,
      oscillator: { type: 'sine' },
      modulation: { type: 'sine' },
      envelope: { attack: 0.002, decay: 1.4, sustain: 0, release: 1.4 },
      modulationEnvelope: {
        attack: 0.002,
        decay: 0.25,
        sustain: 0,
        release: 0.2
      },
      volume: -12
    }),
  glass: () =>
    new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 5.01,
      modulationIndex: 3,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 1.8, sustain: 0, release: 1.8 },
      modulationEnvelope: {
        attack: 0.01,
        decay: 0.6,
        sustain: 0,
        release: 0.5
      },
      volume: -14
    }),
  marimba: () =>
    new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 4,
      modulationIndex: 2,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.002, decay: 0.55, sustain: 0, release: 0.4 },
      modulationEnvelope: {
        attack: 0.002,
        decay: 0.08,
        sustain: 0,
        release: 0.1
      },
      volume: -8
    }),
  kalimba: () =>
    new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 7,
      modulationIndex: 2.5,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.002, decay: 0.7, sustain: 0, release: 0.5 },
      modulationEnvelope: {
        attack: 0.002,
        decay: 0.1,
        sustain: 0,
        release: 0.1
      },
      volume: -9
    }),
  keys: () =>
    new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 1,
      modulationIndex: 1.5,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 1, sustain: 0.25, release: 0.8 },
      modulationEnvelope: {
        attack: 0.005,
        decay: 0.4,
        sustain: 0.1,
        release: 0.5
      },
      volume: -11
    }),
  flute: () => {
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.07, decay: 0.2, sustain: 0.7, release: 0.5 },
      volume: -11
    })
    const vibrato = new Tone.Vibrato({ frequency: 5, depth: 0.08 })
    synth.connect(vibrato)
    return { input: synth, output: vibrato, extra: [vibrato] }
  },
  pluck: () => {
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'fatsawtooth', count: 2, spread: 14 },
      envelope: { attack: 0.003, decay: 0.4, sustain: 0.08, release: 0.5 },
      volume: -18
    })
    const filter = new Tone.Filter({ frequency: 1800, type: 'lowpass', Q: 0.6 })
    synth.connect(filter)
    return { input: synth, output: filter, extra: [filter] }
  },
  reed: () => {
    const synth = new Tone.PolySynth(Tone.AMSynth, {
      harmonicity: 2,
      oscillator: { type: 'square' },
      envelope: { attack: 0.04, decay: 0.2, sustain: 0.6, release: 0.4 },
      volume: -20
    })
    const filter = new Tone.Filter({ frequency: 1400, type: 'lowpass' })
    synth.connect(filter)
    return { input: synth, output: filter, extra: [filter] }
  },
  warm: () => {
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'fatsawtooth', count: 3, spread: 22 },
      envelope: { attack: 0.6, decay: 0.5, sustain: 0.8, release: 1.6 },
      volume: -30
    })
    const filter = new Tone.Filter({ frequency: 850, type: 'lowpass' })
    synth.connect(filter)
    return { input: synth, output: filter, extra: [filter] }
  },
  airy: () => {
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'fattriangle', count: 3, spread: 18 },
      envelope: { attack: 0.8, decay: 0.5, sustain: 0.8, release: 2 },
      volume: -24
    })
    const chorus = new Tone.Chorus({ frequency: 0.6, depth: 0.5, wet: 0.5 })
    chorus.start()
    synth.connect(chorus)
    return { input: synth, output: chorus, extra: [chorus] }
  },
  bass: () => {
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.6, release: 0.4 },
      volume: -10
    })
    const filter = new Tone.Filter({ frequency: 600, type: 'lowpass' })
    synth.connect(filter)
    return { input: synth, output: filter, extra: [filter] }
  }
}

const buildVoice = (name, destination, pan = 0) => {
  const built = RECIPES[name]()
  const voice = built.input ? built : { input: built, output: built, extra: [] }
  const panner = new Tone.Panner(pan)
  voice.output.connect(panner)
  panner.connect(destination)
  return {
    synth: voice.input,
    panner,
    dispose: () => {
      voice.input.dispose()
      voice.extra.forEach((node) => node.dispose())
      panner.dispose()
    }
  }
}

const buildDrums = (destination) => {
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 5,
    envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.2 },
    volume: -10
  }).connect(destination)
  const snareFilter = new Tone.Filter(1800, 'bandpass').connect(destination)
  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.16, sustain: 0 },
    volume: -16
  }).connect(snareFilter)
  const hatFilter = new Tone.Filter(7500, 'highpass').connect(destination)
  const hat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.04, sustain: 0 },
    volume: -22
  }).connect(hatFilter)
  const shakerFilter = new Tone.Filter(5000, 'bandpass').connect(destination)
  const shaker = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.005, decay: 0.07, sustain: 0 },
    volume: -20
  }).connect(shakerFilter)

  const nodes = [kick, snare, snareFilter, hat, hatFilter, shaker, shakerFilter]
  return {
    play: (drum, time, velocity) => {
      if (drum === 'kick') kick.triggerAttackRelease('C1', 0.3, time, velocity)
      else if (drum === 'snare')
        snare.triggerAttackRelease(0.15, time, velocity)
      else if (drum === 'hat') hat.triggerAttackRelease(0.04, time, velocity)
      else shaker.triggerAttackRelease(0.06, time, velocity)
    },
    dispose: () => nodes.forEach((node) => node.dispose())
  }
}

// Wires up every instrument a composition needs. Resolves once the reverb
// has been generated.
export async function buildEnsemble(composition, output) {
  const { instruments } = composition
  const limiter = new Tone.Limiter(-1).connect(output)
  const compressor = new Tone.Compressor({ threshold: -18, ratio: 3 }).connect(
    limiter
  )
  const reverb = new Tone.Reverb({ decay: 3.2, wet: instruments.reverb })
  reverb.connect(compressor)
  await reverb.ready

  const voices = {
    lead: buildVoice(instruments.lead, reverb),
    sparkle: buildVoice(instruments.sparkle, reverb),
    pad: buildVoice(instruments.pad, reverb),
    bass: instruments.bass ? buildVoice('bass', compressor) : null
  }
  const drums = instruments.drums === 'none' ? null : buildDrums(compressor)
  const { stepSeconds } = composition

  return {
    playNote: (note, time) => {
      const voice = voices[note.voice]
      if (!voice) return
      if (note.voice === 'lead' || note.voice === 'sparkle') {
        voice.panner.pan.setValueAtTime(note.pan, time)
      } else {
        voice.panner.pan.value = note.pan
      }
      voice.synth.triggerAttackRelease(
        midiToFrequency(note.midi),
        note.steps * stepSeconds * (note.voice === 'pad' ? 1 : 0.92),
        time,
        note.velocity
      )
    },
    playDrum: (hit, time) => drums?.play(hit.drum, time, hit.velocity),
    releaseAll: () =>
      Object.values(voices).forEach((voice) => voice?.synth.releaseAll()),
    dispose: () => {
      Object.values(voices).forEach((voice) => voice?.dispose())
      drums?.dispose()
      reverb.dispose()
      compressor.dispose()
      limiter.dispose()
    }
  }
}

// A single voice for previewing one region while exploring by sound
export function buildPreviewVoice(name, output) {
  return buildVoice(name === 'pad' ? 'airy' : name, output)
}
