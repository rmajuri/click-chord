// Picks loop points so a held chord can sustain past the end of the sample.
// The loop covers the steadiest loud stretch after the attack, and both ends
// sit on rising zero crossings (a whole number of cycles apart when the
// sample is pitched) so the seam doesn't click.

const FRAME = 1024
const HOP = 512
// Frames this close to the peak level count as part of the sustain
const SUSTAIN_LEVEL = 0.8
const MIN_LOOP_SECONDS = 0.1

const frameLevels = (data) => {
  const levels = []
  for (let start = 0; start + FRAME <= data.length; start += HOP) {
    let sum = 0
    for (let i = start; i < start + FRAME; i++) {
      sum += data[i] * data[i]
    }
    levels.push(Math.sqrt(sum / FRAME))
  }
  return levels
}

// Fractional sample position of the rising zero crossing nearest `position`,
// searched within `radius` samples, or `position` itself if there is none
const nearestRisingZero = (data, position, radius) => {
  let best = null
  const from = Math.max(1, Math.floor(position - radius))
  const to = Math.min(data.length - 1, Math.ceil(position + radius))
  for (let i = from; i <= to; i++) {
    if (data[i - 1] < 0 && data[i] >= 0) {
      const crossing = i - 1 + -data[i - 1] / (data[i] - data[i - 1])
      if (
        best === null ||
        Math.abs(crossing - position) < Math.abs(best - position)
      ) {
        best = crossing
      }
    }
  }
  return best ?? position
}

export const findLoopPoints = (buffer, frequency) => {
  const data = buffer.getChannelData(0)
  const { sampleRate } = buffer
  const wholeSample = { loopStart: 0, loopEnd: buffer.duration }
  const levels = frameLevels(data)
  if (!levels.length) {
    return wholeSample
  }

  const peakFrame = levels.indexOf(Math.max(...levels))
  let lastFrame = peakFrame
  while (
    lastFrame + 1 < levels.length &&
    levels[lastFrame + 1] >= levels[peakFrame] * SUSTAIN_LEVEL
  ) {
    lastFrame++
  }

  const minLength = MIN_LOOP_SECONDS * sampleRate
  const period = frequency ? sampleRate / frequency : null
  const searchRadius = period ? period / 2 : HOP

  const start = nearestRisingZero(data, peakFrame * HOP, searchRadius)
  let end = Math.min(data.length - 1, lastFrame * HOP + FRAME)
  end = Math.max(end, Math.min(data.length - 1, start + minLength))
  if (period) {
    end = start + Math.max(1, Math.round((end - start) / period)) * period
  }
  end = Math.min(nearestRisingZero(data, end, searchRadius), data.length - 1)

  if (end - start < minLength / 2) {
    return wholeSample
  }
  return { loopStart: start / sampleRate, loopEnd: end / sampleRate }
}
