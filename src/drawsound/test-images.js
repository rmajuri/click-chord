// Tiny raster helpers for building test drawings without a browser canvas

export const PAPER = [252, 249, 242]

export const createPaper = (width = 120, height = 90, color = PAPER) => {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < width * height; i++) {
    data.set([...color, 255], i * 4)
  }
  return { width, height, data }
}

const setPixel = (image, x, y, color) => {
  x = Math.round(x)
  y = Math.round(y)
  if (x < 0 || y < 0 || x >= image.width || y >= image.height) return
  image.data.set([...color, 255], (y * image.width + x) * 4)
}

export const fillRect = (image, x0, y0, w, h, color) => {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      setPixel(image, x, y, color)
    }
  }
  return image
}

export const drawLine = (image, x0, y0, x1, y1, color, thickness = 3) => {
  const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2)
  const r = thickness / 2
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const cx = x0 + (x1 - x0) * t
    const cy = y0 + (y1 - y0) * t
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        setPixel(image, cx + dx, cy + dy, color)
      }
    }
  }
  return image
}

export const fillCircle = (image, cx, cy, radius, color) => {
  for (let y = cy - radius; y <= cy + radius; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2) {
        setPixel(image, x, y, color)
      }
    }
  }
  return image
}

export const strokeCircle = (image, cx, cy, radius, color, thickness = 3) => {
  for (let y = cy - radius - thickness; y <= cy + radius + thickness; y++) {
    for (let x = cx - radius - thickness; x <= cx + radius + thickness; x++) {
      const d = Math.hypot(x - cx, y - cy)
      if (Math.abs(d - radius) <= thickness / 2) {
        setPixel(image, x, y, color)
      }
    }
  }
  return image
}

export const drawWave = (image, y, amplitude, color, thickness = 3) => {
  let prev = null
  for (let x = 0; x < image.width; x++) {
    const point = [x, y + Math.sin((x / image.width) * Math.PI * 4) * amplitude]
    if (prev) drawLine(image, ...prev, ...point, color, thickness)
    prev = point
  }
  return image
}
