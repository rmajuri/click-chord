import { describe, it, expect } from 'vitest'
import { analyzeDrawing } from './analyze-drawing'
import { compose, composeRegionPhrase } from './compose'
import { describeDrawing, describeRegion, regionName } from './describe'
import { encodeWav } from './wav'
import { createPaper, fillCircle, fillRect } from './test-images'

describe('describeDrawing', () => {
  it('describes colors and where the marks are, without guessing', () => {
    const image = fillCircle(createPaper(), 20, 18, 8, [240, 200, 30])
    fillRect(image, 70, 50, 30, 30, [40, 80, 200])
    const text = describeDrawing(analyzeDrawing(image))
    expect(text).toMatch(/mostly blue/)
    expect(text).toMatch(/yellow/)
    expect(text).toMatch(/bottom right/)
  })

  it('repeats what the child said it is', () => {
    const features = analyzeDrawing(
      fillCircle(createPaper(), 60, 45, 20, [0, 0, 0])
    )
    expect(describeDrawing(features, 'a ball')).toMatch(
      /You said this is: a ball/
    )
  })

  it('suggests a better photo for an empty page', () => {
    expect(describeDrawing(analyzeDrawing(createPaper()))).toMatch(
      /almost empty/
    )
  })
})

describe('describeRegion', () => {
  it('names the region and what it plays', () => {
    const features = analyzeDrawing(
      fillCircle(createPaper(), 20, 15, 12, [240, 200, 30])
    )
    const composition = compose(features)
    const region = features.regions[0]
    const phrase = composeRegionPhrase(region, features, composition)
    expect(regionName(region)).toBe('Top left')
    expect(describeRegion(region, phrase, 'colors')).toMatch(
      /^Top left: .*yellow.*high notes on music-box bells/
    )
    const empty = features.regions[8]
    expect(
      describeRegion(
        empty,
        composeRegionPhrase(empty, features, composition),
        'colors'
      )
    ).toMatch(/Bottom right: empty paper/)
  })
})

describe('encodeWav', () => {
  it('writes a valid 16-bit stereo header and samples', () => {
    const left = Float32Array.from([0, 1, -1, 0.5])
    const right = Float32Array.from([0, -1, 1, 2])
    const buffer = encodeWav([left, right], 44100)
    const view = new DataView(buffer)
    const text = (offset, length) =>
      String.fromCharCode(
        ...new Uint8Array(buffer.slice(offset, offset + length))
      )
    expect(text(0, 4)).toBe('RIFF')
    expect(text(8, 4)).toBe('WAVE')
    expect(view.getUint16(22, true)).toBe(2)
    expect(view.getUint32(24, true)).toBe(44100)
    expect(view.getUint32(40, true)).toBe(4 * 2 * 2)
    expect(buffer.byteLength).toBe(44 + 16)
    expect(view.getInt16(44 + 4, true)).toBe(32767)
    expect(view.getInt16(44 + 6, true)).toBe(-32768)
    // Out-of-range samples are clipped
    expect(view.getInt16(44 + 14, true)).toBe(32767)
  })
})
