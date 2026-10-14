import { describe, it, expect } from 'vitest'
import { analyzeDrawing } from './analyze-drawing'
import { compose, composeRegionPhrase, readKeywords } from './compose'
import { MODES, KEY_SEMITONES } from './music-theory'
import { STYLES } from './mappings'
import {
  createPaper,
  fillRect,
  drawLine,
  fillCircle,
  drawWave
} from './test-images'

const RED = [210, 40, 40]
const BLUE = [40, 80, 200]
const YELLOW = [240, 200, 30]
const BLACK = [30, 30, 35]

const sunnyHouse = () => {
  const image = fillCircle(createPaper(), 20, 18, 12, YELLOW)
  fillRect(image, 50, 45, 35, 30, RED)
  drawLine(image, 45, 45, 67, 25, RED)
  drawLine(image, 67, 25, 90, 45, RED)
  return analyzeDrawing(image)
}

const nightWaves = () => {
  const image = drawWave(createPaper(), 30, 10, BLUE, 4)
  drawWave(image, 60, 12, BLUE, 4)
  drawWave(image, 75, 8, BLACK, 3)
  return analyzeDrawing(image)
}

const leadNotes = (composition) =>
  composition.notes.filter(({ voice }) => voice === 'lead')

const inScale = (midi, composition) => {
  const offset = (((midi - composition.rootMidi) % 12) + 12) % 12
  return MODES[composition.mode].steps.includes(offset)
}

describe('compose', () => {
  it('gives the same song for the same drawing and settings', () => {
    expect(compose(sunnyHouse(), { variation: 2 })).toEqual(
      compose(sunnyHouse(), { variation: 2 })
    )
  })

  it('makes recognizably different songs for different drawings', () => {
    const a = compose(sunnyHouse())
    const b = compose(nightWaves())
    expect(a.key).not.toBe(b.key)
    expect(leadNotes(a).map(({ midi }) => midi)).not.toEqual(
      leadNotes(b).map(({ midi }) => midi)
    )
  })

  it('keeps key, mood and tempo when making a new version', () => {
    const features = sunnyHouse()
    const first = compose(features, { variation: 0 })
    const second = compose(features, { variation: 1 })
    expect(second.key).toBe(first.key)
    expect(second.mode).toBe(first.mode)
    expect(second.bpm).toBe(first.bpm)
    expect(second.notes).not.toEqual(first.notes)
  })

  it('keeps every pitched note in the scale', () => {
    for (const features of [sunnyHouse(), nightWaves()]) {
      const composition = compose(features)
      composition.notes.forEach(({ midi }) => {
        expect(inScale(midi, composition)).toBe(true)
      })
    }
  })

  it('keeps notes inside the song and in a playable range', () => {
    const composition = compose(nightWaves(), { bars: 16 })
    composition.notes.forEach(({ step, steps, midi }) => {
      expect(step).toBeGreaterThanOrEqual(0)
      expect(step + steps).toBeLessThanOrEqual(composition.totalSteps + 16)
      expect(midi).toBeGreaterThanOrEqual(28)
      expect(midi).toBeLessThanOrEqual(100)
    })
    expect(composition.totalSteps).toBe(16 * 16)
  })

  it('ends on the home note', () => {
    const composition = compose(sunnyHouse())
    const last = leadNotes(composition).at(-1)
    expect((last.midi - composition.rootMidi) % 12).toBe(0)
    expect(last.step).toBe(composition.totalSteps - 16)
  })

  it('plays higher notes for marks higher on the page', () => {
    const high = compose(
      analyzeDrawing(drawLine(createPaper(), 0, 8, 119, 8, BLACK))
    )
    const low = compose(
      analyzeDrawing(drawLine(createPaper(), 0, 82, 119, 82, BLACK))
    )
    const average = (c) =>
      leadNotes(c).reduce((sum, { midi }) => sum + midi, 0) /
      leadNotes(c).length
    expect(average(high) - high.rootMidi).toBeGreaterThan(
      average(low) - low.rootMidi
    )
  })

  it('turns empty paper into rests', () => {
    // Marks only on the left half, so the right half should be quiet
    const composition = compose(
      analyzeDrawing(
        drawWave(fillRect(createPaper(), 0, 0, 1, 1, BLACK), 45, 10, BLACK)
      )
    )
    const halfDrawn = compose(
      analyzeDrawing(fillRect(createPaper(), 0, 20, 50, 40, BLACK))
    )
    const lateNotes = leadNotes(halfDrawn).filter(
      ({ step }) => step >= 80 && step < halfDrawn.totalSteps - 16
    )
    expect(lateNotes).toHaveLength(0)
    expect(leadNotes(composition).length).toBeGreaterThan(lateNotes.length)
  })

  it('plays more notes for busier drawings', () => {
    const sparse = analyzeDrawing(
      drawLine(createPaper(), 0, 45, 119, 45, BLACK, 2)
    )
    const busyImage = createPaper()
    for (let y = 5; y < 90; y += 6) {
      drawLine(busyImage, 0, y, 119, 90 - y, BLACK, 2)
    }
    const busy = analyzeDrawing(busyImage)
    expect(leadNotes(compose(busy)).length).toBeGreaterThan(
      leadNotes(compose(sparse)).length
    )
  })

  it('still makes a gentle song from a blank page', () => {
    const composition = compose(analyzeDrawing(createPaper()))
    expect(composition.notes.some(({ voice }) => voice === 'pad')).toBe(true)
    expect(composition.bpm).toBeGreaterThanOrEqual(58)
  })

  it('lets each style choose different instruments', () => {
    const features = sunnyHouse()
    const leads = new Set(
      STYLES.map(({ id }) => compose(features, { style: id }).instruments.lead)
    )
    expect(leads.size).toBeGreaterThanOrEqual(4)
    expect(compose(features, { style: 'music-box' }).drums).toHaveLength(0)
  })

  it('follows mood and tempo settings', () => {
    const features = sunnyHouse()
    expect(compose(features, { mood: 'minor' }).mode).toBe('aeolian')
    expect(compose(features, { mood: 'major' }).mode).toBe('major')
    expect(compose(features, { tempo: 'faster' }).bpm).toBeGreaterThan(
      compose(features, { tempo: 'slower' }).bpm
    )
  })

  it('picks the key from the main color', () => {
    const composition = compose(sunnyHouse())
    expect(Object.keys(KEY_SEMITONES)).toContain(composition.key)
    // The house is mostly red, and red means D
    expect(composition.key).toBe('D')
  })

  it('explains each mapping in words', () => {
    const { explanation } = compose(sunnyHouse(), {}, 'our house')
    const ids = explanation.map(({ id }) => id)
    expect(ids).toEqual(
      expect.arrayContaining(['color', 'mood', 'time', 'rhythm', 'shapes'])
    )
    explanation.forEach(({ text }) => expect(text.length).toBeGreaterThan(20))
  })

  it('lets descriptions nudge the music', () => {
    expect(readKeywords('A sleepy night with the moon').matched).toContain(
      'night'
    )
    const features = sunnyHouse()
    expect(compose(features, {}, 'a race car').bpm).toBeGreaterThan(
      compose(features, {}, 'bedtime').bpm
    )
  })
})

describe('composeRegionPhrase', () => {
  it('plays busy regions and rests on empty ones', () => {
    const features = sunnyHouse()
    const composition = compose(features)
    const busiest = [...features.regions].sort(
      (a, b) => b.density - a.density
    )[0]
    const phrase = composeRegionPhrase(busiest, features, composition)
    expect(phrase.notes.length).toBeGreaterThan(0)
    phrase.notes.forEach(({ midi }) =>
      expect(inScale(midi, composition)).toBe(true)
    )

    const empty = composeRegionPhrase(
      { row: 0, col: 2, density: 0, color: null, y: null },
      features,
      composition
    )
    expect(empty.empty).toBe(true)
  })

  it('pans regions to their side', () => {
    const features = sunnyHouse()
    const composition = compose(features)
    const left = features.regions.find(
      ({ col, density }) => col === 0 && density
    )
    expect(composeRegionPhrase(left, features, composition).pan).toBeLessThan(0)
  })
})
