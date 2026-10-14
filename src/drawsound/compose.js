import {
  COLOR_MAPPINGS,
  INSTRUMENT_LABELS,
  KEYWORD_NUDGES,
  SHAPE_MOTIFS,
  SHAPE_LABELS,
  STYLES,
  TEMPO_FACTORS,
  DEFAULT_SETTINGS
} from './mappings'
import {
  KEY_SEMITONES,
  MODES,
  PROGRESSIONS,
  degreeToMidi,
  chordName,
  nearestChordTone
} from './music-theory'

export const STEPS_PER_BEAT = 4
export const BEATS_PER_BAR = 4
const STEPS_PER_BAR = STEPS_PER_BEAT * BEATS_PER_BAR
// Seconds of reverb and release left ringing after the last bar
export const TAIL_SECONDS = 3

// The melody lives between these scale degrees above the key's root
const MELODY_LOW = 0
const MELODY_HIGH = 12

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const lerp = (a, b, t) => a + (b - a) * t

// Small seeded random generator, so a drawing and its settings always give
// back the same song
export const createRandom = (seed) => {
  let state = seed >>> 0
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    pick: (items) => items[Math.floor(next() * items.length)],
    chance: (p) => next() < p
  }
}

export const readKeywords = (text = '') => {
  const words = text.toLowerCase().match(/[a-z]+/g) ?? []
  const nudge = { brightness: 0, tempo: 0, legato: 0, busy: 0, matched: [] }
  KEYWORD_NUDGES.forEach((entry) => {
    const hit = entry.words.find((word) => words.includes(word))
    if (hit) {
      nudge.brightness += entry.brightness ?? 0
      nudge.tempo += entry.tempo ?? 0
      nudge.legato += entry.legato ?? 0
      nudge.busy += entry.busy ?? 0
      nudge.matched.push(hit)
    }
  })
  return nudge
}

const chooseMode = (brightness, curviness, mood) => {
  if (mood === 'major') return 'major'
  if (mood === 'minor') return 'aeolian'
  if (brightness >= 0.6) return 'major'
  if (brightness >= 0.5) return curviness > 0.45 ? 'lydian' : 'mixolydian'
  if (brightness >= 0.4) return 'dorian'
  return 'aeolian'
}

const heightToDegree = (y) =>
  Math.round(lerp(MELODY_LOW + 1, MELODY_HIGH, clamp(1 - y)))

const rhythmFor = (busyness, random) => {
  if (busyness < 0.3) return [4]
  if (busyness < 0.62)
    return random.pick([
      [2, 2],
      [3, 1],
      [2, 2]
    ])
  return random.pick([
    [1, 1, 2],
    [2, 1, 1],
    [1, 1, 1, 1]
  ])
}

const voiceFor = (style, palette) => {
  if (style.lead) {
    return { lead: style.lead, sparkle: style.sparkle }
  }
  const first = palette[0]?.family ?? 'gray'
  const second = palette[1]?.family ?? first
  const lead = COLOR_MAPPINGS[first].instrument
  let sparkle = COLOR_MAPPINGS[second].instrument
  if (sparkle === lead) {
    sparkle = lead === 'bell' ? 'glass' : 'bell'
  }
  return { lead, sparkle }
}

const percent = (share) => `${Math.round(share * 100)}%`

// Builds a song from drawing features. Everything that varies comes from the
// features, the settings, and a random generator seeded by both, so the same
// drawing and settings always make the same song. A new "variation" reshuffles
// the details while keeping the key, mood, tempo and melody shape.
export function compose(features, settings = {}, description = '') {
  const options = { ...DEFAULT_SETTINGS, ...settings }
  const style = STYLES.find(({ id }) => id === options.style) ?? STYLES[0]
  const nudge = readKeywords(description)
  const random = createRandom(features.seed ^ (options.variation * 0x9e3779b1))
  const { lines, palette, slices } = features

  const firstColor = palette[0]?.family ?? 'gray'
  const key = COLOR_MAPPINGS[firstColor].key
  const brightnessScore = clamp(
    0.5 +
      features.warmth * 0.3 +
      (features.brightness - 0.55) * 0.5 +
      (lines.rising - lines.falling) * 0.3 +
      nudge.brightness
  )
  const mode = chooseMode(brightnessScore, lines.curviness, options.mood)
  // Keeps the root between G3 and F#4 so the melody sits comfortably
  let rootMidi = 60 + KEY_SEMITONES[key]
  if (rootMidi > 66) rootMidi -= 12

  // Typical busy slices set the scale for what counts as busy here
  const densities = slices.map(({ density }) => density).sort((a, b) => a - b)
  const reference = Math.max(
    0.03,
    densities[Math.floor(densities.length * 0.9)]
  )
  const activity = (slice) =>
    slice.density < 0.004 ? 0 : clamp(slice.density / reference)
  // How busy a slice is, both next to the rest of this drawing and in
  // absolute terms, so a single thin line doesn't count as busy
  const energy = (slice) =>
    activity(slice) && clamp(activity(slice) * 0.5 + slice.density * 5)
  const complexity = clamp(lines.edgeRatio * 4)
  const legato = clamp(lines.curviness * 0.8 + nudge.legato)
  const busyBoost = nudge.busy

  const averageActivity =
    slices.reduce((sum, slice) => sum + energy(slice), 0) / slices.length
  const bpm = Math.round(
    clamp(
      (72 + averageActivity * 30 + complexity * 14 - legato * 8 + nudge.tempo) *
        style.tempo *
        (TEMPO_FACTORS[options.tempo] ?? 1),
      58,
      140
    )
  )
  const stepSeconds = 60 / bpm / STEPS_PER_BEAT

  const bars = options.bars
  const beats = bars * BEATS_PER_BAR
  const totalSteps = bars * STEPS_PER_BAR
  const progression = random.pick(PROGRESSIONS[mode])
  const chordRoots = Array.from({ length: bars }, (_, bar) =>
    bar === bars - 1 ? 0 : progression[bar % progression.length]
  )

  const colorVariety = palette.filter(({ share }) => share >= 0.08).length
  const chordSize = colorVariety >= 4 ? 5 : colorVariety >= 2 ? 4 : 3
  const voices = voiceFor(style, palette)

  const notes = []
  const drums = []
  const sliceForBeat = (beat) =>
    Math.min(slices.length - 1, Math.floor((beat * slices.length) / beats))
  const xForBeat = (beat) => (beat + 0.5) / beats

  // Melody: each beat reads one slice of the drawing
  const risingBias =
    lines.rising + lines.falling
      ? lines.rising / (lines.rising + lines.falling)
      : 0.5
  const maxLeap = Math.round(lerp(6, 3, legato))
  let previousDegree = null
  let lastNote = null
  let sustained = false
  const finalBeat = beats - BEATS_PER_BAR

  for (let beat = 0; beat < finalBeat; beat++) {
    const sliceIndex = sliceForBeat(beat)
    const slice = slices[sliceIndex]
    const level = activity(slice)
    const chordRoot = chordRoots[Math.floor(beat / BEATS_PER_BAR)]
    const beatInBar = beat % BEATS_PER_BAR

    if (!level) {
      // Empty paper: let the last note ring once, then rest
      if (lastNote && !sustained) {
        lastNote.steps += STEPS_PER_BEAT
        sustained = true
      } else {
        lastNote = null
      }
      continue
    }
    sustained = false

    let target = heightToDegree(slice.y)
    if (
      previousDegree !== null &&
      Math.abs(target - previousDegree) > maxLeap
    ) {
      target = previousDegree + Math.sign(target - previousDegree) * maxLeap
    }
    const nextSlice = slices[sliceForBeat(beat + 1)]
    const nextTarget =
      nextSlice && activity(nextSlice) ? heightToDegree(nextSlice.y) : target

    const phraseEnd = beat % 16 === 15
    const busyness = clamp(energy(slice) * (0.6 + 0.4 * complexity) + busyBoost)
    const rhythm = phraseEnd ? [4] : rhythmFor(busyness, random)
    let degree = target
    let step = beat * STEPS_PER_BEAT
    rhythm.forEach((length, index) => {
      if (index === 0) {
        if (beatInBar % 2 === 0 || phraseEnd) {
          degree = nearestChordTone(degree, chordRoot)
        }
      } else {
        let direction = Math.sign(nextTarget - degree)
        if (!direction) {
          direction = random.chance(risingBias) ? 1 : -1
        }
        const stride = legato < 0.4 && random.chance(0.3) ? 2 : 1
        degree += direction * stride
      }
      degree = clamp(degree, MELODY_LOW, MELODY_HIGH + 2)
      lastNote = {
        voice: 'lead',
        step,
        steps: length,
        midi: degreeToMidi(degree, rootMidi, mode),
        velocity: Number(
          clamp(
            (0.5 + 0.3 * level + (beatInBar === 0 && index === 0 ? 0.1 : 0)) *
              (0.85 + 0.15 * features.saturation),
            0.3,
            0.92
          ).toFixed(2)
        ),
        pan: Number(lerp(-0.4, 0.4, xForBeat(beat)).toFixed(2)),
        color: slice.color,
        slice: sliceIndex
      }
      notes.push(lastNote)
      step += length
    })
    previousDegree = degree
  }

  // Ending: settle on the home note
  const endingDegree = nearestChordTone(previousDegree ?? 7, 0)
  notes.push({
    voice: 'lead',
    step: finalBeat * STEPS_PER_BEAT,
    steps: STEPS_PER_BAR,
    midi: degreeToMidi(
      [0, 7, 14].reduce((best, d) =>
        Math.abs(d - endingDegree) < Math.abs(best - endingDegree) ? d : best
      ),
      rootMidi,
      mode
    ),
    velocity: 0.6,
    pan: 0.3,
    color: slices.at(-1).color ?? palette[0]?.family ?? null,
    slice: slices.length - 1
  })

  // Shapes: the biggest ones each play a short motif where they sit
  const motifShapes = features.shapes.slice(0, 3)
  motifShapes.forEach((shape) => {
    let motif = SHAPE_MOTIFS[shape.type]
    if (shape.type === 'line' && shape.slope < -0.3) {
      motif = { ...motif, degrees: motif.degrees.map((d) => -d) }
    } else if (shape.type === 'line' && Math.abs(shape.slope) <= 0.3) {
      motif = { ...motif, degrees: motif.degrees.map(() => 0) }
    }
    const beat = Math.min(finalBeat - 1, Math.floor(shape.x * finalBeat))
    const start = beat * STEPS_PER_BEAT + (random.chance(0.5) ? 2 : 0)
    const chordRoot = chordRoots[Math.floor(beat / BEATS_PER_BAR)]
    const base = nearestChordTone(heightToDegree(shape.y) + 7, chordRoot)
    let step = start
    motif.degrees.forEach((offset, index) => {
      notes.push({
        voice: 'sparkle',
        step,
        steps: motif.steps[index],
        midi: degreeToMidi(base + offset, rootMidi, mode),
        velocity: Number(clamp(0.35 + shape.size * 1.5, 0.35, 0.6).toFixed(2)),
        pan: Number(lerp(-0.8, 0.8, shape.x).toFixed(2)),
        color: null,
        shape: shape.type,
        slice: Math.min(slices.length - 1, Math.floor(shape.x * slices.length))
      })
      step += motif.steps[index]
    })
  })

  // Harmony, bass and drums follow how busy each bar is
  const barActivity = Array.from({ length: bars }, (_, bar) => {
    let sum = 0
    for (let b = 0; b < BEATS_PER_BAR; b++) {
      sum += energy(slices[sliceForBeat(bar * BEATS_PER_BAR + b)])
    }
    return clamp(sum / BEATS_PER_BAR + busyBoost)
  })
  const space = 1 - clamp(features.inkRatio * 4)
  const padPan = Number((features.balance.leftRight * 0.3).toFixed(2))
  const drumCap = { none: 0, light: 2, full: 3 }[style.drums]

  chordRoots.forEach((root, bar) => {
    const step = bar * STEPS_PER_BAR
    const last = bar === bars - 1
    for (let i = 0; i < chordSize; i++) {
      notes.push({
        voice: 'pad',
        step,
        steps: STEPS_PER_BAR,
        midi: degreeToMidi(root + i * 2, rootMidi - 12, mode),
        velocity: Number((0.22 + 0.18 * space).toFixed(2)),
        pan: padPan,
        color: null
      })
    }

    if (style.bass) {
      const bassRoot = degreeToMidi(root, rootMidi - 24, mode)
      const busy = barActivity[bar]
      if (style.drums === 'full' && busy > 0.6 && !last) {
        for (let eighth = 0; eighth < 8; eighth++) {
          notes.push({
            voice: 'bass',
            step: step + eighth * 2,
            steps: 2,
            midi: eighth % 4 === 3 ? bassRoot + 12 : bassRoot,
            velocity: eighth % 2 ? 0.45 : 0.6,
            pan: 0,
            color: null
          })
        }
      } else {
        const fifth = busy > 0.4 && !last
        notes.push({
          voice: 'bass',
          step,
          steps: fifth ? 8 : 16,
          midi: bassRoot,
          velocity: 0.6,
          pan: 0,
          color: null
        })
        if (fifth) {
          notes.push({
            voice: 'bass',
            step: step + 8,
            steps: 8,
            midi: degreeToMidi(root + 4, rootMidi - 24, mode),
            velocity: 0.5,
            pan: 0,
            color: null
          })
        }
      }
    }

    // Drums come in after the first bar and end on a single kick
    const level = Math.min(
      drumCap,
      bar === 0 ? 0 : Math.ceil(barActivity[bar] * 3)
    )
    if (last) {
      if (drumCap) drums.push({ step, drum: 'kick', velocity: 0.7 })
      return
    }
    if (level >= 1) {
      for (let eighth = 0; eighth < 8; eighth++) {
        if (eighth % 2 === 1) {
          drums.push({ step: step + eighth * 2, drum: 'shaker', velocity: 0.4 })
        }
      }
    }
    if (level >= 2) {
      drums.push({ step, drum: 'kick', velocity: 0.75 })
      drums.push({ step: step + 8, drum: 'kick', velocity: 0.6 })
    }
    if (level >= 3) {
      drums.push({ step: step + 4, drum: 'snare', velocity: 0.6 })
      drums.push({ step: step + 12, drum: 'snare', velocity: 0.6 })
      if (random.chance(0.5)) {
        drums.push({ step: step + 10, drum: 'kick', velocity: 0.5 })
      }
      for (let sixteenth = 0; sixteenth < 16; sixteenth += 2) {
        drums.push({
          step: step + sixteenth,
          drum: 'hat',
          velocity: sixteenth % 4 ? 0.3 : 0.45
        })
      }
    }
  })

  notes.sort((a, b) => a.step - b.step)
  drums.sort((a, b) => a.step - b.step)

  const padKind =
    style.pad === 'auto' ? (features.warmth >= 0 ? 'warm' : 'airy') : style.pad
  const composition = {
    title: description.trim() || 'My drawing song',
    key,
    mode,
    modeLabel: MODES[mode].label,
    bpm,
    bars,
    totalSteps,
    stepSeconds,
    duration: totalSteps * stepSeconds + TAIL_SECONDS,
    style: style.id,
    variation: options.variation,
    instruments: {
      lead: voices.lead,
      sparkle: voices.sparkle,
      pad: padKind,
      bass: style.bass,
      drums: style.drums,
      reverb: style.reverb
    },
    chords: chordRoots.map((root, bar) => ({
      bar,
      root,
      name: chordName(root, key, mode)
    })),
    notes,
    drums,
    rootMidi
  }
  composition.explanation = explain(features, composition, {
    nudge,
    legato,
    chordSize,
    style
  })
  return composition
}

function explain(features, composition, { nudge, legato, chordSize, style }) {
  const { palette, lines, shapes, shapeCount } = features
  const items = []
  const leadLabel = INSTRUMENT_LABELS[composition.instruments.lead]

  if (palette.length) {
    const top = palette[0]
    items.push({
      id: 'color',
      title: 'Colors choose the sound',
      text:
        style.id === 'colors'
          ? `The drawing is mostly ${top.family} (${percent(top.share)} of the marks), so the tune is played by ${leadLabel} in the key of ${composition.key}.`
          : `The drawing is mostly ${top.family}, which picks the key of ${composition.key}. You chose the ${style.label} sound, so ${leadLabel} play the tune.`
    })
  } else {
    items.push({
      id: 'color',
      title: 'Colors choose the sound',
      text: `We couldn't find many marks, so this is a quiet song in the key of ${composition.key}.`
    })
  }

  items.push({
    id: 'mood',
    title: 'Light, warmth and lines set the mood',
    text: `Warm or bright colors and rising lines lean toward a sunnier scale; cool or dark colors and falling lines lean toward a moodier one. This drawing landed on the ${composition.modeLabel} scale${nudge.matched.length ? `, with a nudge from the word "${nudge.matched[0]}"` : ''}.`
  })

  items.push({
    id: 'time',
    title: 'Left to right is the song from start to end',
    text: `The song reads the drawing like a page, one slice per beat. Marks near the top play higher notes and marks near the bottom play lower ones.`
  })

  items.push({
    id: 'rhythm',
    title: 'Busy parts play faster notes',
    text: `Crowded parts of the drawing play quick notes and drums; empty paper becomes rests and long, ringing notes. Overall the marks cover ${percent(features.inkRatio)} of the page, giving a tempo of ${composition.bpm} beats per minute.`
  })

  const curvy = legato > 0.45
  items.push({
    id: 'lines',
    title: 'Lines shape the melody',
    text: `${curvy ? 'Lots of curves make the melody smooth, moving step by step.' : 'Straighter lines let the melody take bigger jumps.'} ${lines.rising > lines.falling ? 'More lines climb up to the right, so in-between notes tend to go up.' : lines.falling > lines.rising ? 'More lines slope down to the right, so in-between notes tend to go down.' : ''}`.trim()
  })

  if (shapes.length) {
    const described = shapes
      .slice(0, 3)
      .map(
        (shape) =>
          `a ${SHAPE_LABELS[shape.type]} shape plays ${SHAPE_MOTIFS[shape.type].label}`
      )
    items.push({
      id: 'shapes',
      title: 'Shapes become little tunes',
      text: `We found ${shapeCount} shape${shapeCount === 1 ? '' : 's'}. The biggest each add a motif at their spot in the song, heard from their side of the speakers: ${described.join('; ')}.`
    })
  }

  items.push({
    id: 'harmony',
    title: 'More colors, richer chords',
    text:
      chordSize > 3
        ? `With several colors, the background chords get extra notes for a richer sound (${composition.chords
            .slice(0, 4)
            .map(({ name }) => name)
            .join(', ')}).`
        : `With just a few colors, the background chords stay simple (${composition.chords
            .slice(0, 4)
            .map(({ name }) => name)
            .join(', ')}).`
  })

  return items
}

// A short phrase for one region of the drawing, used when exploring by sound.
// Height sets the register, how busy it is sets the rhythm, and its
// left-right position sets where it sits between the speakers.
export function composeRegionPhrase(region, features, composition) {
  const random = createRandom(features.seed + region.row * 3 + region.col)
  const pan = [-0.7, 0, 0.7][region.col]
  const instrument =
    composition.style === 'colors' && region.color
      ? COLOR_MAPPINGS[region.color].instrument
      : composition.instruments.lead
  const level = clamp(region.density / 0.15)
  if (region.density < 0.004) {
    return { instrument: 'pad', pan, notes: [], empty: true }
  }
  const baseDegree = heightToDegree(region.y ?? (region.row + 0.5) / 3)
  const rhythm =
    level < 0.3 ? [4, 4] : level < 0.65 ? [2, 2, 2, 2] : [1, 1, 1, 1, 2, 2]
  const shape = features.shapes.find(
    (s) =>
      Math.floor(s.x * 3) === region.col && Math.floor(s.y * 3) === region.row
  )
  const contour = shape
    ? SHAPE_MOTIFS[shape.type].degrees
    : rhythm.map(() => random.pick([0, 1, 2, -1]))
  let step = 0
  const notes = rhythm.map((length, i) => {
    const note = {
      step,
      steps: length,
      midi: degreeToMidi(
        nearestChordTone(baseDegree, 0) + (contour[i % contour.length] ?? 0),
        composition.rootMidi,
        composition.mode
      ),
      velocity: 0.55 + level * 0.25
    }
    step += length
    return note
  })
  return { instrument, pan, notes, empty: false, shape: shape?.type ?? null }
}
