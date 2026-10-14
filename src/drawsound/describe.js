import { INSTRUMENT_LABELS, SHAPE_LABELS, COLOR_MAPPINGS } from './mappings'

const ROW_NAMES = ['Top', 'Middle', 'Bottom']
const COL_NAMES = ['left', 'middle', 'right']

export const regionName = ({ row, col }) =>
  row === 1 && col === 1 ? 'Center' : `${ROW_NAMES[row]} ${COL_NAMES[col]}`

const amount = (density) => {
  if (density < 0.004) return 'empty paper'
  if (density < 0.04) return 'a few marks'
  if (density < 0.12) return 'some drawing'
  return 'lots of drawing'
}

const joinList = (items) =>
  items.length < 2
    ? items.join('')
    : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`

// A plain-language description of what Drawsound measured. It describes
// marks, colors and shapes, never guesses what the drawing shows.
export function describeDrawing(features, description = '') {
  const sentences = []
  const said = description.trim()
  if (said) {
    sentences.push(`You said this is: ${said}.`)
  }

  if (features.inkRatio < 0.003) {
    sentences.push(
      'The page looks almost empty. Try a photo with darker or bolder marks, taken in good light.'
    )
    return sentences.join(' ')
  }

  const colors = features.palette
    .filter(({ share }) => share >= 0.08)
    .slice(0, 3)
  if (colors.length) {
    const [first, ...rest] = colors
    sentences.push(
      `The drawing is mostly ${first.family}${rest.length ? `, with some ${joinList(rest.map(({ family }) => family))}` : ''}.`
    )
  }

  const coverage =
    features.inkRatio < 0.05
      ? 'a small part'
      : features.inkRatio < 0.15
        ? 'some'
        : features.inkRatio < 0.35
          ? 'a lot'
          : 'most'
  const busiest = [...features.regions].sort((a, b) => b.density - a.density)[0]
  sentences.push(
    `The marks cover ${coverage} of the page, with the most going on in the ${regionName(busiest).toLowerCase()}.`
  )

  if (features.shapes.length) {
    const kinds = [...new Set(features.shapes.slice(0, 3).map((s) => s.type))]
    sentences.push(
      `There ${features.shapeCount === 1 ? 'is 1 shape' : `are ${features.shapeCount} separate shapes`}; the biggest look ${joinList(kinds.map((k) => SHAPE_LABELS[k]))}.`
    )
  }

  const { lines } = features
  sentences.push(
    lines.curviness > 0.45
      ? 'The lines are mostly curvy.'
      : 'The lines are mostly straight.'
  )
  return sentences.join(' ')
}

export function describeRegion(region, phrase, style) {
  const name = regionName(region)
  if (phrase.empty) {
    return `${name}: empty paper. The music rests and breathes here.`
  }
  const parts = [amount(region.density)]
  if (region.color) {
    parts.push(`mostly ${region.color}`)
  }
  const instrument =
    style === 'colors' && region.color
      ? INSTRUMENT_LABELS[COLOR_MAPPINGS[region.color].instrument]
      : INSTRUMENT_LABELS[phrase.instrument]
  const pitch = ['high', 'middle', 'low'][region.row]
  const shape = phrase.shape
    ? `, with a ${SHAPE_LABELS[phrase.shape]} shape`
    : ''
  return `${name}: ${parts.join(', ')}${shape}. Plays ${pitch} notes on ${instrument}.`
}
