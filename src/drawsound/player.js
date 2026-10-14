import * as Tone from 'tone'
import { buildEnsemble, buildPreviewVoice } from './instruments'
import { midiToFrequency } from './music-theory'
import { encodeWav } from './wav'

const transport = Tone.getTransport()

// Tone.Offline swaps the global audio context while an export sets up, so
// anything that builds audio nodes takes turns to stay in the right context
let building = Promise.resolve()
const exclusive = (task) => {
  const run = building.then(task, task)
  building = run.catch(() => {})
  return run
}

const scheduleComposition = (composition, ensemble) => {
  const { stepSeconds } = composition
  const events = [
    ...composition.notes.map((note) => ({
      time: note.step * stepSeconds,
      note
    })),
    ...composition.drums.map((hit) => ({ time: hit.step * stepSeconds, hit }))
  ]
  const part = new Tone.Part((time, event) => {
    if (event.note) ensemble.playNote(event.note, time)
    else ensemble.playDrum(event.hit, time)
  }, events)
  part.start(0)
  return part
}

// Live playback on the shared transport. Click-Chord stops and clears the
// transport when it unmounts, so Drawsound has it to itself.
export function createPlayer({ onEnd }) {
  const volume = new Tone.Volume(0).toDestination()
  let ensemble = null
  let part = null
  let endId = null
  let loadId = 0

  const clear = () => {
    transport.stop()
    transport.cancel()
    part?.dispose()
    part = null
    ensemble?.releaseAll()
    ensemble?.dispose()
    ensemble = null
  }

  return {
    // Builds instruments for a composition. Returns false if a newer load
    // started meanwhile.
    load: async (composition) => {
      const id = ++loadId
      const next = await exclusive(() =>
        id === loadId ? buildEnsemble(composition, volume) : null
      )
      if (!next) return false
      if (id !== loadId) {
        next.dispose()
        return false
      }
      clear()
      ensemble = next
      transport.position = 0
      part = scheduleComposition(composition, ensemble)
      endId = transport.scheduleOnce((time) => {
        Tone.getDraw().schedule(() => {
          transport.stop()
          onEnd()
        }, time)
      }, composition.duration)
      return true
    },
    unlock: () => Tone.start(),
    play: async () => {
      await Tone.start()
      transport.start('+0.05')
    },
    pause: () => {
      transport.pause()
      ensemble?.releaseAll()
    },
    stop: () => {
      transport.stop()
      ensemble?.releaseAll()
    },
    seconds: () => transport.seconds,
    state: () => transport.state,
    setVolume: (level) => {
      volume.mute = level <= 0
      volume.volume.value = Tone.gainToDb(Math.max(level, 0.0001))
    },
    // A short phrase played immediately, outside the song
    preview: async (phrase, stepSeconds) => {
      await Tone.start()
      const voice = await exclusive(() =>
        buildPreviewVoice(phrase.instrument, volume)
      )
      voice.panner.pan.value = phrase.pan
      const now = Tone.now() + 0.05
      let end = 0
      if (phrase.empty) {
        voice.synth.triggerAttackRelease(
          [midiToFrequency(60), midiToFrequency(67)],
          1.2,
          now,
          0.15
        )
        end = 1.2
      } else {
        phrase.notes.forEach((note) => {
          voice.synth.triggerAttackRelease(
            midiToFrequency(note.midi),
            note.steps * stepSeconds * 0.9,
            now + note.step * stepSeconds,
            note.velocity
          )
          end = Math.max(end, (note.step + note.steps) * stepSeconds)
        })
      }
      setTimeout(() => voice.dispose(), (end + 3) * 1000)
    },
    dispose: () => {
      loadId++
      if (endId !== null) transport.clear(endId)
      clear()
      volume.dispose()
    }
  }
}

// Renders the whole song offline and returns a WAV blob
export async function renderToWav(composition) {
  const sampleRate = 44100
  const buffer = await exclusive(() =>
    Tone.Offline(
      async ({ transport: offlineTransport }) => {
        const ensemble = await buildEnsemble(composition, Tone.getDestination())
        const { stepSeconds } = composition
        composition.notes.forEach((note) =>
          offlineTransport.schedule(
            (time) => ensemble.playNote(note, time),
            note.step * stepSeconds
          )
        )
        composition.drums.forEach((hit) =>
          offlineTransport.schedule(
            (time) => ensemble.playDrum(hit, time),
            hit.step * stepSeconds
          )
        )
        offlineTransport.start(0)
      },
      composition.duration,
      2,
      sampleRate
    )
  )
  const channels = [0, 1].map((channel) => buffer.getChannelData(channel))
  return new Blob([encodeWav(channels, sampleRate)], { type: 'audio/wav' })
}
