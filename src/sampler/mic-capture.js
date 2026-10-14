import * as Tone from 'tone'
import { detectPitch } from './detect-pitch'

export const MAX_SAMPLE_SECONDS = 4

// Anything quieter than this at the start of a take is treated as the gap
// before the user made a sound
const SILENCE_THRESHOLD = 0.02
const PRE_ROLL_SECONDS = 0.01

export const isMicSupported = () =>
  typeof window !== 'undefined' &&
  !!navigator.mediaDevices?.getUserMedia &&
  typeof MediaRecorder !== 'undefined'

// Opens the device mic and starts recording. Resolves to a stop function that
// releases the mic and resolves to the take as { buffer, frequency }, where
// frequency is the detected pitch in Hz or null
export const startMicCapture = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false
    }
  })
  const recorder = new MediaRecorder(stream)
  const chunks = []
  recorder.ondataavailable = (e) => {
    if (e.data.size) {
      chunks.push(e.data)
    }
  }
  const stopped = new Promise((resolve) => {
    recorder.onstop = resolve
  })
  recorder.start()

  return async () => {
    if (recorder.state !== 'inactive') {
      recorder.stop()
    }
    await stopped
    stream.getTracks().forEach((track) => track.stop())

    const blob = new Blob(chunks, { type: recorder.mimeType })
    const audioBuffer = await Tone.getContext().rawContext.decodeAudioData(
      await blob.arrayBuffer()
    )
    const buffer = trimLeadingSilence(new Tone.ToneAudioBuffer(audioBuffer))
    return { buffer, frequency: detectPitch(buffer) }
  }
}

// Trimming the gap before the first sound keeps the sample tight to the
// beat when the sequencer triggers it
const trimLeadingSilence = (buffer) => {
  const data = buffer.getChannelData(0)
  const firstSound = data.findIndex(
    (value) => Math.abs(value) > SILENCE_THRESHOLD
  )
  if (firstSound <= 0) {
    return buffer
  }
  const start = Math.max(0, firstSound / buffer.sampleRate - PRE_ROLL_SECONDS)
  return buffer.slice(start)
}
