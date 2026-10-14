import { COLOR_FAMILIES, WARM_COLORS, COOL_COLORS } from './mappings'

// The drawing is read left to right in this many slices, one per beat
export const TIME_SLICES = 32
export const REGION_GRID = 3

const BACKGROUND_BLOCKS = 6

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const round = (value, places = 3) => Number(value.toFixed(places))

export const classifyColor = (r, g, b) => {
  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  const chroma = max - min
  const lightness = (max + min) / 2
  if (chroma < 0.16) {
    return max < 0.42 ? 'black' : 'gray'
  }
  let hue
  if (max === r / 255) {
    hue = (((g - b) / 255 / chroma) % 6) * 60
  } else if (max === g / 255) {
    hue = ((b - r) / 255 / chroma + 2) * 60
  } else {
    hue = ((r - g) / 255 / chroma + 4) * 60
  }
  hue = (hue + 360) % 360
  if (hue >= 12 && hue < 48 && max < 0.6) {
    return 'brown'
  }
  if (hue < 14 || hue >= 340) {
    return lightness > 0.72 ? 'pink' : 'red'
  }
  if (hue < 42) {
    return 'orange'
  }
  if (hue < 70) {
    return 'yellow'
  }
  if (hue < 165) {
    return 'green'
  }
  if (hue < 255) {
    return 'blue'
  }
  if (hue < 295) {
    return 'purple'
  }
  return 'pink'
}

const percentile = (values, p) => {
  if (!values.length) {
    return 0
  }
  const sorted = Float32Array.from(values).sort()
  return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))]
}

// Paper in photos is rarely evenly lit, so the paper brightness is estimated
// per block and anything clearly darker or more colorful than it is ink
const findInk = ({ width, height, data }) => {
  const count = width * height
  const lum = new Float32Array(count)
  const chroma = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const r = data[i * 4] / 255
    const g = data[i * 4 + 1] / 255
    const b = data[i * 4 + 2] / 255
    const alpha = data[i * 4 + 3] / 255
    // Transparent pixels count as white paper
    lum[i] = (0.2126 * r + 0.7152 * g + 0.0722 * b) * alpha + (1 - alpha)
    chroma[i] = (Math.max(r, g, b) - Math.min(r, g, b)) * alpha
  }

  const globalPaper = percentile(lum, 0.85)
  const paperChroma = percentile(
    chroma.filter((_, i) => lum[i] >= globalPaper - 0.1),
    0.5
  )

  const blockW = Math.ceil(width / BACKGROUND_BLOCKS)
  const blockH = Math.ceil(height / BACKGROUND_BLOCKS)
  const blockPaper = []
  for (let by = 0; by < BACKGROUND_BLOCKS; by++) {
    for (let bx = 0; bx < BACKGROUND_BLOCKS; bx++) {
      const values = []
      for (let y = by * blockH; y < Math.min(height, (by + 1) * blockH); y++) {
        for (let x = bx * blockW; x < Math.min(width, (bx + 1) * blockW); x++) {
          values.push(lum[y * width + x])
        }
      }
      // A block covered in ink can't tell us about the paper
      blockPaper.push(
        values.length
          ? Math.max(percentile(values, 0.85), globalPaper - 0.2)
          : globalPaper
      )
    }
  }

  const raw = new Uint8Array(count)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      const paper =
        blockPaper[
          Math.floor(y / blockH) * BACKGROUND_BLOCKS + Math.floor(x / blockW)
        ]
      if (paper - lum[i] > 0.12 || chroma[i] - paperChroma > 0.2) {
        raw[i] = 1
      }
    }
  }

  // Drop lone specks of noise and paper texture
  const mask = new Uint8Array(count)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      if (!raw[i]) {
        continue
      }
      let neighbors = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (
            (dx || dy) &&
            nx >= 0 &&
            ny >= 0 &&
            nx < width &&
            ny < height &&
            raw[ny * width + nx]
          ) {
            neighbors++
          }
        }
      }
      if (neighbors >= 2) {
        mask[i] = 1
      }
    }
  }
  return mask
}

// Edge direction and how much it bends, measured on a blurred ink mask
const analyzeLines = (mask, width, height) => {
  const blurred = new Float32Array(width * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0
      let n = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (nx >= 0 && ny >= 0 && nx < width && ny < height) {
            sum += mask[ny * width + nx]
            n++
          }
        }
      }
      blurred[y * width + x] = sum / n
    }
  }

  const angles = new Float32Array(width * height).fill(NaN)
  const bins = { horizontal: 0, vertical: 0, rising: 0, falling: 0 }
  let edges = 0
  const at = (x, y) => blurred[y * width + x]
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const gx =
        at(x + 1, y - 1) +
        2 * at(x + 1, y) +
        at(x + 1, y + 1) -
        at(x - 1, y - 1) -
        2 * at(x - 1, y) -
        at(x - 1, y + 1)
      const gy =
        at(x - 1, y + 1) +
        2 * at(x, y + 1) +
        at(x + 1, y + 1) -
        at(x - 1, y - 1) -
        2 * at(x, y - 1) -
        at(x + 1, y - 1)
      if (Math.hypot(gx, gy) < 0.6) {
        continue
      }
      // The edge runs across the gradient. Point it rightward so "rise" is
      // how much it climbs moving left to right (image y grows downward).
      let tx = -gy
      let ty = gx
      if (tx < 0 || (tx === 0 && ty > 0)) {
        tx = -tx
        ty = -ty
      }
      const angle = (Math.atan2(-ty, tx) * 180) / Math.PI
      angles[y * width + x] = angle
      edges++
      if (Math.abs(angle) < 22.5) {
        bins.horizontal++
      } else if (Math.abs(angle) > 67.5) {
        bins.vertical++
      } else if (angle > 0) {
        bins.rising++
      } else {
        bins.falling++
      }
    }
  }

  // Straight strokes keep the same direction from pixel to pixel; curves turn
  let turn = 0
  let pairs = 0
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const a = angles[y * width + x]
      if (Number.isNaN(a)) {
        continue
      }
      for (const [dx, dy] of [
        [1, 0],
        [0, 1],
        [1, 1],
        [-1, 1]
      ]) {
        const b = angles[(y + dy) * width + x + dx]
        if (!Number.isNaN(b)) {
          const diff = Math.abs(a - b) % 180
          turn += Math.min(diff, 180 - diff)
          pairs++
        }
      }
    }
  }

  const share = (n) => (edges ? round(n / edges) : 0)
  return {
    horizontal: share(bins.horizontal),
    vertical: share(bins.vertical),
    rising: share(bins.rising),
    falling: share(bins.falling),
    curviness: pairs ? round(clamp((turn / pairs - 4) / 22)) : 0,
    edgeRatio: round(edges / (width * height))
  }
}

const classifyShape = ({ fillRatio, inkFill, closed, elongation }) => {
  if (closed || inkFill > 0.55) {
    if (fillRatio > 0.88) {
      return 'boxy'
    }
    return fillRatio > 0.66 ? 'round' : 'pointy'
  }
  return elongation > 4 ? 'line' : 'squiggle'
}

const findShapes = (mask, width, height) => {
  const labels = new Int32Array(width * height)
  const minArea = Math.max(8, Math.round(width * height * 0.002))
  const shapes = []
  let next = 1

  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || labels[start]) {
      continue
    }
    const label = next++
    const stack = [start]
    labels[start] = label
    const pixels = []
    while (stack.length) {
      const i = stack.pop()
      pixels.push(i)
      const x = i % width
      const y = (i - x) / width
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
            continue
          }
          const n = ny * width + nx
          if (mask[n] && !labels[n]) {
            labels[n] = label
            stack.push(n)
          }
        }
      }
    }
    if (pixels.length < minArea) {
      continue
    }

    let minX = width
    let minY = height
    let maxX = 0
    let maxY = 0
    let sumX = 0
    let sumY = 0
    pixels.forEach((i) => {
      const x = i % width
      const y = (i - x) / width
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
      sumX += x
      sumY += y
    })
    const cx = sumX / pixels.length
    const cy = sumY / pixels.length
    let covXY = 0
    let varX = 0
    let varY = 0
    pixels.forEach((i) => {
      const x = i % width
      const y = (i - x) / width
      covXY += (x - cx) * (cy - y)
      varX += (x - cx) ** 2
      varY += (y - cy) ** 2
    })
    // How stretched the ink is along its main direction, at any angle
    const spread = Math.sqrt((varX - varY) ** 2 + 4 * covXY ** 2)
    const major = (varX + varY + spread) / 2
    const minor = Math.max(1e-6, (varX + varY - spread) / 2)

    // Children often draw outlines, so measure the shape with its holes
    // filled in: flood the box from its border and see what's left
    const bw = maxX - minX + 1
    const bh = maxY - minY + 1
    const outside = new Uint8Array(bw * bh)
    const flood = []
    const inShape = (x, y) => labels[(y + minY) * width + x + minX] === label
    for (let x = 0; x < bw; x++) {
      flood.push([x, 0], [x, bh - 1])
    }
    for (let y = 0; y < bh; y++) {
      flood.push([0, y], [bw - 1, y])
    }
    while (flood.length) {
      const [x, y] = flood.pop()
      if (x < 0 || y < 0 || x >= bw || y >= bh) {
        continue
      }
      if (outside[y * bw + x] || inShape(x, y)) {
        continue
      }
      outside[y * bw + x] = 1
      flood.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
    }
    const outsideCount = outside.reduce((sum, v) => sum + v, 0)
    const filledArea = bw * bh - outsideCount
    const boxArea = bw * bh

    const measures = {
      fillRatio: filledArea / boxArea,
      inkFill: pixels.length / boxArea,
      closed: filledArea - pixels.length > pixels.length * 0.5,
      elongation: Math.sqrt(major / minor)
    }
    shapes.push({
      type: classifyShape(measures),
      x: round((cx + 0.5) / width),
      y: round((cy + 0.5) / height),
      w: round(bw / width),
      h: round(bh / height),
      size: round(filledArea / (width * height)),
      // Positive when the shape leans up to the right
      slope: varX ? round(clamp(covXY / varX, -4, 4)) : 0
    })
  }

  shapes.sort((a, b) => b.size - a.size)
  return shapes
}

const dominantColor = (counts) => {
  let best = null
  let bestCount = 0
  for (const family of COLOR_FAMILIES) {
    if (counts[family] > bestCount) {
      best = family
      bestCount = counts[family]
    }
  }
  return best
}

const emptyCounts = () =>
  Object.fromEntries(COLOR_FAMILIES.map((family) => [family, 0]))

const hashString = (text) => {
  let hash = 2166136261
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

// Turns pixels ({ width, height, data } in RGBA, like ImageData) into the
// visual features the composer reads. Same pixels in, same features out.
export function analyzeDrawing(image) {
  const { width, height, data } = image
  const mask = findInk(image)

  const colorCounts = emptyCounts()
  const sliceInk = Array.from({ length: TIME_SLICES }, () => ({
    ink: 0,
    sumY: 0,
    sumY2: 0,
    pixels: 0,
    colors: emptyCounts()
  }))
  const regions = Array.from({ length: REGION_GRID ** 2 }, () => ({
    ink: 0,
    pixels: 0,
    colors: emptyCounts(),
    sumY: 0
  }))
  let ink = 0
  let saturation = 0
  let brightness = 0
  let left = 0
  let right = 0
  let top = 0
  let bottom = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      const slice = sliceInk[Math.floor((x * TIME_SLICES) / width)]
      const region =
        regions[
          Math.floor((y * REGION_GRID) / height) * REGION_GRID +
            Math.floor((x * REGION_GRID) / width)
        ]
      slice.pixels++
      region.pixels++
      if (!mask[i]) {
        continue
      }
      const r = data[i * 4]
      const g = data[i * 4 + 1]
      const b = data[i * 4 + 2]
      const family = classifyColor(r, g, b)
      const max = Math.max(r, g, b) / 255
      const min = Math.min(r, g, b) / 255
      ink++
      colorCounts[family]++
      saturation += max ? (max - min) / max : 0
      brightness += max
      const ny = (y + 0.5) / height
      slice.ink++
      slice.sumY += ny
      slice.sumY2 += ny * ny
      slice.colors[family]++
      region.ink++
      region.sumY += ny
      region.colors[family]++
      if (x < width / 2) left++
      else right++
      if (y < height / 2) top++
      else bottom++
    }
  }

  const palette = COLOR_FAMILIES.map((family) => ({
    family,
    share: ink ? round(colorCounts[family] / ink) : 0
  }))
    .filter(({ share }) => share >= 0.02)
    .sort((a, b) => b.share - a.share)

  const shareOf = (families) =>
    palette
      .filter(({ family }) => families.includes(family))
      .reduce((sum, { share }) => sum + share, 0)

  const slices = sliceInk.map((slice) => {
    if (!slice.ink) {
      return { density: 0, y: null, spread: 0, color: null }
    }
    const mean = slice.sumY / slice.ink
    return {
      density: round(slice.ink / slice.pixels),
      y: round(mean),
      spread: round(
        Math.sqrt(Math.max(0, slice.sumY2 / slice.ink - mean ** 2))
      ),
      color: dominantColor(slice.colors)
    }
  })

  const shapes = findShapes(mask, width, height)
  const lines = analyzeLines(mask, width, height)

  const features = {
    width,
    height,
    inkRatio: round(ink / (width * height)),
    palette,
    warmth: round(shareOf(WARM_COLORS) - shareOf(COOL_COLORS)),
    brightness: ink ? round(brightness / ink) : 1,
    saturation: ink ? round(saturation / ink) : 0,
    lines,
    slices,
    shapes: shapes.slice(0, 6),
    shapeCount: shapes.length,
    regions: regions.map((region, index) => ({
      row: Math.floor(index / REGION_GRID),
      col: index % REGION_GRID,
      density: round(region.ink / region.pixels),
      color: dominantColor(region.colors),
      y: region.ink ? round(region.sumY / region.ink) : null
    })),
    balance: {
      leftRight: ink ? round((right - left) / ink) : 0,
      topBottom: ink ? round((bottom - top) / ink) : 0
    }
  }
  features.seed = hashString(JSON.stringify(features))
  return features
}
