import { useMemo } from 'react'
import { COLOR_SWATCHES, INSTRUMENT_LABELS } from './mappings'
import styles from './drawsound.module.css'

const WIDTH = 1000
const HEIGHT = 240
const TOP = 26
const MELODY_BOTTOM = 170
const BASS_TOP = 184
const BASS_BOTTOM = 214
const DRUM_Y = 228

const ShapeMark = ({ type, x, y, color }) => {
  const props = {
    fill: '#fffaf0',
    stroke: color,
    strokeWidth: 2.5,
    className: styles.motifMark
  }
  if (type === 'boxy') {
    return (
      <rect x={x - 5} y={y - 5} width='10' height='10' rx='1.5' {...props} />
    )
  }
  if (type === 'pointy') {
    return (
      <path
        d={`M${x} ${y - 6.5} L${x + 6.5} ${y + 5} L${x - 6.5} ${y + 5}Z`}
        {...props}
      />
    )
  }
  if (type === 'line' || type === 'squiggle') {
    return (
      <path
        d={`M${x} ${y - 6.5} L${x + 6} ${y} L${x} ${y + 6.5} L${x - 6} ${y}Z`}
        {...props}
      />
    )
  }
  return <circle cx={x} cy={y} r='5.5' {...props} />
}

// A picture of the song: time runs left to right like the drawing, higher
// notes sit higher. Shapes (not just colors) tell the parts apart.
const ScoreView = ({ composition }) => {
  const layout = useMemo(() => {
    const pitched = composition.notes.filter(
      ({ voice }) => voice === 'lead' || voice === 'sparkle'
    )
    const midis = pitched.map(({ midi }) => midi)
    const low = Math.min(...midis, composition.rootMidi) - 1
    const high = Math.max(...midis, composition.rootMidi + 12) + 1
    const x = (step) => (step / composition.totalSteps) * WIDTH
    const y = (midi) =>
      MELODY_BOTTOM - ((midi - low) / (high - low)) * (MELODY_BOTTOM - TOP)
    const bassMidis = composition.notes
      .filter(({ voice }) => voice === 'bass')
      .map(({ midi }) => midi)
    const bassLow = Math.min(...bassMidis, 40)
    const bassHigh = Math.max(...bassMidis, bassLow + 12)
    const bassY = (midi) =>
      BASS_BOTTOM -
      4 -
      ((midi - bassLow) / Math.max(1, bassHigh - bassLow)) *
        (BASS_BOTTOM - BASS_TOP - 8)
    return { x, y, bassY }
  }, [composition])

  const { x, y, bassY } = layout
  const barWidth = WIDTH / composition.bars
  const lead = composition.notes.filter(({ voice }) => voice === 'lead')
  const motifs = composition.notes.filter(({ voice }) => voice === 'sparkle')
  const bass = composition.notes.filter(({ voice }) => voice === 'bass')

  const summary = `Picture of the song: ${composition.bars} bars in ${composition.key} ${composition.modeLabel}, with ${lead.length} melody notes played by ${INSTRUMENT_LABELS[composition.instruments.lead]}, ${motifs.length} notes of shape tunes${bass.length ? ', a bass line' : ''}${composition.drums.length ? ' and drums' : ''}. Chords: ${composition.chords.map(({ name }) => name).join(', ')}.`

  return (
    <figure className={styles.score}>
      <div className={styles.scoreFrame}>
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role='img'
          aria-label={summary}
          className={styles.scoreSvg}
        >
          {composition.chords.map(({ bar, name }) => (
            <g key={bar}>
              <rect
                x={bar * barWidth + 1}
                y='0'
                width={barWidth - 2}
                height={HEIGHT}
                className={bar % 2 ? styles.barOdd : styles.barEven}
              />
              <text x={bar * barWidth + 8} y='17' className={styles.chordLabel}>
                {name}
              </text>
            </g>
          ))}
          {bass.map((note, i) => (
            <rect
              key={`b${i}`}
              x={x(note.step) + 1}
              y={bassY(note.midi) - 3}
              width={Math.max(4, x(note.steps) - 2)}
              height='6'
              rx='3'
              className={styles.bassNote}
            />
          ))}
          {composition.drums.map((hit, i) => (
            <rect
              key={`d${i}`}
              x={x(hit.step)}
              y={DRUM_Y - (hit.drum === 'kick' ? 6 : 3)}
              width='3'
              height={hit.drum === 'kick' ? 12 : 6}
              className={styles.drumHit}
            />
          ))}
          {lead.map((note, i) => (
            <rect
              key={`l${i}`}
              x={x(note.step) + 1}
              y={y(note.midi) - 5}
              width={Math.max(5, x(note.steps) - 2)}
              height='10'
              rx='5'
              fill={COLOR_SWATCHES[note.color] ?? COLOR_SWATCHES.black}
              className={styles.leadNote}
            />
          ))}
          {motifs.map((note, i) => (
            <ShapeMark
              key={`m${i}`}
              type={note.shape}
              x={x(note.step) + 4}
              y={y(note.midi)}
              color='#2a2733'
            />
          ))}
        </svg>
        <div className={styles.scorePlayhead} aria-hidden='true' />
      </div>
      <figcaption className={styles.legend}>
        <span>
          <span className={styles.legendLead} aria-hidden='true' /> Melody, in
          the drawing’s colors
        </span>
        <span>
          <span className={styles.legendMotif} aria-hidden='true'>
            ○ △ □
          </span>{' '}
          Shape tunes
        </span>
        {bass.length > 0 && (
          <span>
            <span className={styles.legendBass} aria-hidden='true' /> Bass
          </span>
        )}
        {composition.drums.length > 0 && (
          <span>
            <span className={styles.legendDrum} aria-hidden='true'>
              ┃╻
            </span>{' '}
            Drums
          </span>
        )}
      </figcaption>
    </figure>
  )
}

export default ScoreView
