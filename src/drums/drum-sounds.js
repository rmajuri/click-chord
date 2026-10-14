import * as Tone from 'tone'

const kickBuffer = new Tone.ToneAudioBuffer('./kick-deep.wav')
const snareBuffer = new Tone.ToneAudioBuffer('./snare-analog.wav')
const hatBuffer = new Tone.ToneAudioBuffer('./hihat-808.wav')

// Each sound builds its Tone nodes through `add` so they can all be disposed
// when the user picks a different sound, and returns a function that plays
// one hit at the given time
const voice = (build) => () => {
  const nodes = []
  const add = (node) => {
    nodes.push(node)
    return node
  }
  const play = build(add)
  return { play, dispose: () => nodes.forEach((node) => node.dispose()) }
}

const sample = (buffer) =>
  voice((add) => {
    const player = add(new Tone.Player(buffer).toDestination())
    return (time) => player.start(time)
  })

const membrane = (note, options) =>
  voice((add) => {
    const synth = add(new Tone.MembraneSynth(options).toDestination())
    return (time) => synth.triggerAttackRelease(note, '8n', time)
  })

const metal = (options) =>
  voice((add) => {
    const synth = add(new Tone.MetalSynth(options).toDestination())
    return (time) => synth.triggerAttackRelease(options.frequency, '32n', time)
  })

const filteredNoise = (filterOptions, synthOptions) =>
  voice((add) => {
    const filter = add(new Tone.Filter(filterOptions).toDestination())
    const synth = add(new Tone.NoiseSynth(synthOptions).connect(filter))
    return (time) => synth.triggerAttackRelease('16n', time)
  })

export const drumSounds = {
  kick: {
    Deep: sample(kickBuffer),
    '808 Boom': membrane('C1', {
      pitchDecay: 0.08,
      octaves: 6,
      envelope: { attack: 0.001, decay: 0.9, sustain: 0, release: 0.1 },
      volume: -2
    }),
    Punchy: membrane('E1', {
      pitchDecay: 0.02,
      octaves: 5,
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.05 },
      volume: 0
    }),
    'Low Tom': membrane('G1', {
      pitchDecay: 0.05,
      octaves: 2,
      envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.1 },
      volume: -1
    })
  },
  hat: {
    808: sample(hatBuffer),
    Closed: metal({
      frequency: 250,
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 6000,
      octaves: 1.5,
      envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
      volume: -10
    }),
    Open: metal({
      frequency: 250,
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 5000,
      octaves: 1.5,
      envelope: { attack: 0.001, decay: 0.4, release: 0.2 },
      volume: -16
    }),
    Shaker: filteredNoise(
      { type: 'highpass', frequency: 6000 },
      {
        noise: { type: 'white' },
        envelope: { attack: 0.01, decay: 0.06, sustain: 0 },
        volume: -4
      }
    )
  },
  snare: {
    Analog: sample(snareBuffer),
    Synth: voice((add) => {
      const body = add(
        new Tone.MembraneSynth({
          pitchDecay: 0.01,
          octaves: 2,
          envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.05 },
          volume: -8
        }).toDestination()
      )
      const filter = add(
        new Tone.Filter({ type: 'highpass', frequency: 1800 }).toDestination()
      )
      const rattle = add(
        new Tone.NoiseSynth({
          noise: { type: 'white' },
          envelope: { attack: 0.001, decay: 0.18, sustain: 0 },
          volume: -6
        }).connect(filter)
      )
      return (time) => {
        body.triggerAttackRelease('G2', '16n', time)
        rattle.triggerAttackRelease('16n', time)
      }
    }),
    Clap: filteredNoise(
      { type: 'bandpass', frequency: 1200, Q: 1.5 },
      {
        noise: { type: 'pink' },
        envelope: { attack: 0.005, decay: 0.15, sustain: 0 },
        volume: 16
      }
    ),
    Rimshot: metal({
      frequency: 800,
      harmonicity: 2.5,
      modulationIndex: 8,
      resonance: 3000,
      octaves: 0.5,
      envelope: { attack: 0.001, decay: 0.04, release: 0.01 },
      volume: -14
    })
  }
}

export const defaultDrumSounds = {
  kick: 'Deep',
  hat: '808',
  snare: 'Analog'
}
