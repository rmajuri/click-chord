import { describe, it, expect } from 'vitest'
import { analyzeDrawing, classifyColor, TIME_SLICES } from './analyze-drawing'
import {
  createPaper,
  fillRect,
  drawLine,
  fillCircle,
  strokeCircle,
  drawWave
} from './test-images'

const RED = [210, 40, 40]
const BLUE = [40, 80, 200]
const YELLOW = [240, 200, 30]
const BLACK = [30, 30, 35]

describe('classifyColor', () => {
  it('names common crayon colors', () => {
    expect(classifyColor(...RED)).toBe('red')
    expect(classifyColor(...BLUE)).toBe('blue')
    expect(classifyColor(...YELLOW)).toBe('yellow')
    expect(classifyColor(...BLACK)).toBe('black')
    expect(classifyColor(40, 160, 70)).toBe('green')
    expect(classifyColor(240, 130, 30)).toBe('orange')
    expect(classifyColor(130, 60, 190)).toBe('purple')
    expect(classifyColor(240, 140, 190)).toBe('pink')
    expect(classifyColor(120, 75, 40)).toBe('brown')
  })
})

describe('analyzeDrawing', () => {
  it('finds no ink on blank paper', () => {
    const features = analyzeDrawing(createPaper())
    expect(features.inkRatio).toBe(0)
    expect(features.palette).toEqual([])
    expect(features.shapes).toEqual([])
    expect(features.slices).toHaveLength(TIME_SLICES)
    expect(features.slices.every(({ density }) => density === 0)).toBe(true)
  })

  it('ignores uneven lighting on the paper', () => {
    const image = createPaper()
    // A soft shadow across the right side of the photo
    for (let x = 60; x < 120; x++) {
      for (let y = 0; y < 90; y++) {
        const shade = 252 - (x - 60) * 1.2
        image.data.set([shade, shade - 3, shade - 10], (y * 120 + x) * 4)
      }
    }
    expect(analyzeDrawing(image).inkRatio).toBeLessThan(0.01)
  })

  it('measures the dominant color', () => {
    const image = fillRect(createPaper(), 10, 10, 60, 50, BLUE)
    fillRect(image, 80, 20, 15, 15, RED)
    const { palette, warmth } = analyzeDrawing(image)
    expect(palette[0].family).toBe('blue')
    expect(palette[1].family).toBe('red')
    expect(palette[0].share).toBeGreaterThan(0.8)
    expect(warmth).toBeLessThan(0)
  })

  it('places marks in the right time slices and heights', () => {
    const image = drawLine(createPaper(), 0, 10, 59, 10, BLACK)
    drawLine(image, 60, 80, 119, 80, BLACK)
    const { slices } = analyzeDrawing(image)
    expect(slices[2].y).toBeLessThan(0.2)
    expect(slices[TIME_SLICES - 3].y).toBeGreaterThan(0.8)
  })

  it('tells rising lines from falling ones', () => {
    const rising = analyzeDrawing(
      drawLine(createPaper(), 10, 80, 110, 10, BLACK)
    ).lines
    const falling = analyzeDrawing(
      drawLine(createPaper(), 10, 10, 110, 80, BLACK)
    ).lines
    expect(rising.rising).toBeGreaterThan(rising.falling)
    expect(falling.falling).toBeGreaterThan(falling.rising)
  })

  it('finds curves curvier than straight lines', () => {
    const straight = analyzeDrawing(
      drawLine(createPaper(), 5, 45, 115, 45, BLACK)
    ).lines
    const curvy = analyzeDrawing(drawWave(createPaper(), 45, 25, BLACK)).lines
    expect(curvy.curviness).toBeGreaterThan(straight.curviness)
  })

  it('recognizes round, boxy and line shapes, including outlines', () => {
    const shapeOf = (image) => analyzeDrawing(image).shapes[0].type
    expect(shapeOf(fillCircle(createPaper(), 60, 45, 25, RED))).toBe('round')
    expect(shapeOf(strokeCircle(createPaper(), 60, 45, 28, RED))).toBe('round')
    expect(shapeOf(fillRect(createPaper(), 30, 20, 50, 45, RED))).toBe('boxy')
    expect(shapeOf(drawLine(createPaper(), 10, 70, 110, 20, RED))).toBe('line')
  })

  it('counts separate shapes and records where they are', () => {
    const image = fillCircle(createPaper(), 20, 20, 10, YELLOW)
    fillRect(image, 80, 55, 25, 25, RED)
    const { shapes, shapeCount } = analyzeDrawing(image)
    expect(shapeCount).toBe(2)
    const square = shapes.find(({ type }) => type === 'boxy')
    expect(square.x).toBeGreaterThan(0.6)
    expect(square.y).toBeGreaterThan(0.6)
  })

  it('is deterministic', () => {
    const make = () =>
      drawWave(fillCircle(createPaper(), 30, 30, 12, RED), 60, 10, BLUE)
    expect(analyzeDrawing(make())).toEqual(analyzeDrawing(make()))
  })

  it('gives different drawings different seeds', () => {
    const a = analyzeDrawing(fillCircle(createPaper(), 30, 30, 12, RED))
    const b = analyzeDrawing(fillCircle(createPaper(), 90, 60, 12, RED))
    expect(a.seed).not.toBe(b.seed)
  })
})
