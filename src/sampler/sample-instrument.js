import * as Tone from 'tone'

// Pitch the sample is treated as when it has no clear pitch of its own
export const FALLBACK_FREQUENCY = Tone.Frequency('C4').toFrequency()

// Middle of the register the chord roots are voiced in (A2 to Ab3)
const CHORD_ROOT_CENTER_MIDI = 50.5
const PEAK_TARGET = 0.5
const MAX_BOOST = 8

const frequencyToMidi = (frequency) => 69 + 12 * Math.log2(frequency / 440)

const peakOf = (buffer) => {
  let peak = 0
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    for (const value of buffer.getChannelData(ch)) {
      peak = Math.max(peak, Math.abs(value))
    }
  }
  return peak
}

// Plays chords by repitching a recorded sample, with the same
// triggerAttack/triggerRelease shape as the PolySynth it stands in for
export class SampleInstrument {
  constructor({ buffer, frequency }) {
    this.buffer = buffer
    this.frequency = frequency ?? FALLBACK_FREQUENCY
    // Shift chords by whole octaves toward the sample's own register so it
    // isn't slowed or sped up into mush
    this.transpose =
      12 *
      Math.round(
        (frequencyToMidi(this.frequency) - CHORD_ROOT_CENTER_MIDI) / 12
      )
    this.gain = Math.min(MAX_BOOST, PEAK_TARGET / (peakOf(buffer) || 1))
    this.output = new Tone.Gain().toDestination()
    this.active = new Map()
  }

  triggerAttack(notes, time) {
    const startTime = Tone.Time(time).toSeconds()
    const voiceGain = this.gain / Math.sqrt(notes.length)
    notes.forEach((note) => {
      const target = Tone.Frequency(note).transpose(this.transpose)
      const source = new Tone.ToneBufferSource({
        url: this.buffer,
        playbackRate: target.toFrequency() / this.frequency,
        fadeIn: 0.005,
        fadeOut: 0.08,
        onended: () => {
          const sources = this.active.get(note)?.filter((s) => s !== source)
          if (sources?.length) {
            this.active.set(note, sources)
          } else if (sources) {
            this.active.delete(note)
          }
          source.dispose()
        }
      }).connect(this.output)
      source.start(startTime, 0, undefined, voiceGain)
      this.active.set(note, [...(this.active.get(note) ?? []), source])
    })
  }

  triggerRelease(notes, time) {
    const stopTime = Tone.Time(time).toSeconds()
    notes.forEach((note) => {
      this.active.get(note)?.forEach((source) => source.stop(stopTime))
    })
  }

  dispose() {
    this.active.forEach((sources) =>
      sources.forEach((source) => source.dispose())
    )
    this.active.clear()
    this.output.dispose()
  }
}
