// Browser-only helpers for getting pixels out of a photo of a drawing

export const ANALYSIS_SIZE = 120
export const DEFAULT_ADJUST = {
  rotation: 0,
  crop: { top: 0, right: 0, bottom: 0, left: 0 }
}

export async function loadImageFile(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('That file is not a picture. Try a JPG or PNG photo.')
  }
  return loadImageUrl(URL.createObjectURL(file), true)
}

export function loadImageUrl(url, revoke = false) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      if (revoke) URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      if (revoke) URL.revokeObjectURL(url)
      reject(
        new Error(
          "We couldn't open that picture. Try a JPG or PNG photo (some phone formats like HEIC aren't supported by every browser)."
        )
      )
    }
    image.src = url
  })
}

const sourceSize = (source) => ({
  width: source.naturalWidth ?? source.width,
  height: source.naturalHeight ?? source.height
})

// Draws the source rotated (in quarter turns) and cropped (percent trimmed
// from each side), scaled so its longest side is at most maxSide
export function renderAdjusted(source, { rotation, crop }, maxSide) {
  const { width, height } = sourceSize(source)
  const turned = rotation % 180 !== 0
  const rotatedW = turned ? height : width
  const rotatedH = turned ? width : height

  const cropX = (crop.left / 100) * rotatedW
  const cropY = (crop.top / 100) * rotatedH
  const cropW = Math.max(1, rotatedW * (1 - (crop.left + crop.right) / 100))
  const cropH = Math.max(1, rotatedH * (1 - (crop.top + crop.bottom) / 100))

  const scale = Math.min(1, maxSide / Math.max(cropW, cropH))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(cropW * scale))
  canvas.height = Math.max(1, Math.round(cropH * scale))
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.imageSmoothingQuality = 'high'
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.scale(scale, scale)
  ctx.translate(-cropX, -cropY)
  ctx.translate(rotatedW / 2, rotatedH / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.drawImage(source, -width / 2, -height / 2)
  return canvas
}

// Big photos are halved step by step before the final shrink, which keeps
// thin pencil lines from disappearing
export function getAnalysisPixels(source, adjust) {
  let canvas = renderAdjusted(source, adjust, ANALYSIS_SIZE * 8)
  while (Math.max(canvas.width, canvas.height) > ANALYSIS_SIZE * 2) {
    const half = document.createElement('canvas')
    half.width = Math.max(1, Math.round(canvas.width / 2))
    half.height = Math.max(1, Math.round(canvas.height / 2))
    const ctx = half.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(canvas, 0, 0, half.width, half.height)
    canvas = half
  }
  const small = renderAdjusted(canvas, DEFAULT_ADJUST, ANALYSIS_SIZE)
  return small
    .getContext('2d', { willReadFrequently: true })
    .getImageData(0, 0, small.width, small.height)
}

export function makeThumbnail(source, adjust, maxSide = 360) {
  return renderAdjusted(source, adjust, maxSide).toDataURL('image/jpeg', 0.82)
}
