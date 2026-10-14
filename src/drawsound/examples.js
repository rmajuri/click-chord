import { createRandom } from './compose'

// Example drawings painted in crayon-like strokes, so anyone can try
// Drawsound without a photo at hand

const WIDTH = 640
const HEIGHT = 480

const crayon = (ctx, random, points, color, width = 9) => {
  ctx.strokeStyle = color
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  // Several thin, slightly wobbly passes give a waxy texture
  for (let pass = 0; pass < 4; pass++) {
    ctx.globalAlpha = 0.55
    ctx.lineWidth = width * (0.55 + random.next() * 0.45)
    ctx.beginPath()
    points.forEach(([x, y], i) => {
      const jx = x + (random.next() - 0.5) * width * 0.5
      const jy = y + (random.next() - 0.5) * width * 0.5
      if (i) ctx.lineTo(jx, jy)
      else ctx.moveTo(jx, jy)
    })
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

const circle = (cx, cy, r, from = 0, to = Math.PI * 2, steps = 40) =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const a = from + ((to - from) * i) / steps
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
  })

const scribbleFill = (ctx, random, x, y, w, h, color) => {
  const points = []
  for (let row = 0; row <= h; row += 10) {
    points.push([x, y + row], [x + w, y + row + 5])
  }
  crayon(ctx, random, points, color, 8)
}

const wave = (y, amplitude, cycles, phase = 0) =>
  Array.from({ length: 65 }, (_, i) => {
    const x = 20 + (i / 64) * (WIDTH - 40)
    return [
      x,
      y + Math.sin((i / 64) * Math.PI * 2 * cycles + phase) * amplitude
    ]
  })

export const EXAMPLES = [
  {
    id: 'house',
    label: 'Sunny house',
    description: 'a house in the sun',
    draw: (ctx, random) => {
      crayon(ctx, random, circle(110, 100, 48), '#f2b705', 12)
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2
        crayon(
          ctx,
          random,
          [
            [110 + Math.cos(a) * 66, 100 + Math.sin(a) * 66],
            [110 + Math.cos(a) * 96, 100 + Math.sin(a) * 96]
          ],
          '#f2b705',
          8
        )
      }
      crayon(
        ctx,
        random,
        [
          [300, 250],
          [520, 250],
          [520, 410],
          [300, 410],
          [300, 250]
        ],
        '#d6402f',
        10
      )
      crayon(
        ctx,
        random,
        [
          [280, 252],
          [410, 140],
          [540, 252]
        ],
        '#8a4b2a',
        10
      )
      scribbleFill(ctx, random, 385, 330, 50, 78, '#3a6ea8')
      crayon(ctx, random, wave(430, 8, 6), '#3f9a4a', 12)
    }
  },
  {
    id: 'ocean',
    label: 'Ocean waves',
    description: 'waves in the ocean',
    draw: (ctx, random) => {
      crayon(ctx, random, wave(170, 26, 2), '#2f6fb3', 11)
      crayon(ctx, random, wave(260, 34, 2.5, 1), '#2f6fb3', 11)
      crayon(ctx, random, wave(350, 22, 3, 2), '#4aa0c8', 11)
      crayon(ctx, random, wave(420, 14, 4), '#245a91', 10)
      // A little orange fish
      crayon(
        ctx,
        random,
        circle(300, 300, 28, 0, Math.PI * 2, 30),
        '#f08a24',
        9
      )
      crayon(
        ctx,
        random,
        [
          [272, 300],
          [244, 280],
          [244, 320],
          [272, 300]
        ],
        '#f08a24',
        9
      )
      crayon(ctx, random, circle(560, 70, 30), '#f2b705', 10)
    }
  },
  {
    id: 'night',
    label: 'Starry night',
    description: 'stars at night',
    draw: (ctx, random) => {
      const star = (cx, cy, r) =>
        Array.from({ length: 11 }, (_, i) => {
          const a = -Math.PI / 2 + (i * Math.PI) / 5
          const radius = i % 2 ? r * 0.45 : r
          return [cx + Math.cos(a) * radius, cy + Math.sin(a) * radius]
        })
      ;[
        [90, 80, 34],
        [250, 150, 26],
        [400, 70, 30],
        [560, 170, 22],
        [160, 250, 20]
      ].forEach(([x, y, r]) => crayon(ctx, random, star(x, y, r), '#e8b10c', 8))
      crayon(ctx, random, circle(520, 330, 70, -2.2, 2.2), '#6a6870', 12)
      crayon(
        ctx,
        random,
        circle(555, 330, 50, 2.1, -2.1 + Math.PI * 2),
        '#6a6870',
        8
      )
      scribbleFill(ctx, random, 30, 380, 380, 80, '#6b4a9e')
    }
  }
]

export function paintExample(example) {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fdfaf2'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
  example.draw(ctx, createRandom(example.id.length * 7919))
  return canvas
}
