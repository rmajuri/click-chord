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

const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11]

const midiToNote = (midi) =>
  `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`

const noteToMidi = (note) => {
  const [, name, octave] = note.match(/^([A-G]b?)(-?\d+)$/)
  return NOTE_NAMES.indexOf(name) + (Number(octave) + 1) * 12
}

export const transposeNote = (note, octaves) =>
  midiToNote(noteToMidi(note) + octaves * 12)

// A one-note-at-a-time instrument (the bass or the melody). Its tonic sits
// within the octave starting at lowestTonicMidi, recorded notes can be
// shifted by octaves between minMidi and maxMidi, and each texture is
// { label, volume, options } for a MonoSynth, or names another synth class
export function createMonoInstrument({
  lowestTonicMidi,
  minMidi,
  maxMidi,
  textures
}) {
  // Live playing and the loop get separate synths so playing along with a
  // looped line doesn't cut it off
  const voices = {}

  return {
    textures,

    // Every note from the tonic up to the tonic an octave higher, so
    // chromatic passing tones are there alongside the scale
    notesForKey(key) {
      const tonic = NOTE_NAMES.indexOf(key)
      const tonicMidi =
        lowestTonicMidi + ((tonic - (lowestTonicMidi % 12) + 12) % 12)

      return Array.from({ length: 13 }, (_, interval) => ({
        note: midiToNote(tonicMidi + interval),
        inKey: MAJOR_SCALE.includes(interval % 12)
      }))
    },

    octaveRange(note) {
      const midi = noteToMidi(note)
      return {
        min: -Math.floor((midi - minMidi) / 12),
        max: Math.floor((maxMidi - midi) / 12)
      }
    },

    build(texture) {
      const { synth = Tone.MonoSynth, options, volume } = textures[texture]
      ;['live', 'loop'].forEach((voice) => {
        voices[voice]?.dispose()
        voices[voice] = new synth(options).toDestination()
        voices[voice].volume.value = volume
      })
    },

    start(note, time = '+0.01', voice = 'live') {
      voices[voice].triggerAttack(note, time, 0.8)
    },

    stop(time = '+0.01', voice = 'live') {
      voices[voice].triggerRelease(time)
    }
  }
}
