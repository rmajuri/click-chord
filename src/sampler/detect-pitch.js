// YIN pitch detection on the loudest stretch of the sample. Returns the
// fundamental in Hz, or null when the sound has no clear pitch (claps, noise)

const WINDOW = 2048
const HOP = 512
const MIN_FREQUENCY = 60
const MAX_FREQUENCY = 1500
const YIN_THRESHOLD = 0.15
const MIN_RMS = 0.01
// Only look at the attack and early sustain, where the pitch is steadiest
const SEARCH_SECONDS = 1

const loudestWindowStart = (data, sampleRate) => {
  const end = Math.min(data.length - WINDOW, SEARCH_SECONDS * sampleRate)
  let best = { start: -1, rms: 0 }
  for (let start = 0; start <= end; start += HOP) {
    let sum = 0
    for (let i = start; i < start + WINDOW; i++) {
      sum += data[i] * data[i]
    }
    const rms = Math.sqrt(sum / WINDOW)
    if (rms > best.rms) {
      best = { start, rms }
    }
  }
  return best.rms >= MIN_RMS ? best.start : -1
}

export const detectPitch = (buffer) => {
  const data = buffer.getChannelData(0)
  const { sampleRate } = buffer
  const start = loudestWindowStart(data, sampleRate)
  if (start < 0) {
    return null
  }

  const minLag = Math.floor(sampleRate / MAX_FREQUENCY)
  const maxLag = Math.min(WINDOW / 2, Math.ceil(sampleRate / MIN_FREQUENCY))
  const diff = new Float32Array(maxLag + 1)
  for (let lag = 1; lag <= maxLag; lag++) {
    let sum = 0
    for (let i = 0; i < WINDOW / 2; i++) {
      const delta = data[start + i] - data[start + i + lag]
      sum += delta * delta
    }
    diff[lag] = sum
  }

  // Cumulative mean normalized difference
  let runningSum = 0
  const cmnd = new Float32Array(maxLag + 1).fill(1)
  for (let lag = 1; lag <= maxLag; lag++) {
    runningSum += diff[lag]
    cmnd[lag] = runningSum ? (diff[lag] * lag) / runningSum : 1
  }

  for (let lag = minLag; lag < maxLag; lag++) {
    if (cmnd[lag] < YIN_THRESHOLD) {
      while (lag + 1 < maxLag && cmnd[lag + 1] < cmnd[lag]) {
        lag++
      }
      // Parabolic interpolation around the dip for sub-sample accuracy
      const [a, b, c] = [cmnd[lag - 1], cmnd[lag], cmnd[lag + 1]]
      const denominator = a - 2 * b + c
      const shift = denominator ? (a - c) / (2 * denominator) : 0
      return sampleRate / (lag + shift)
    }
  }
  return null
}
