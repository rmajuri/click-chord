import { useEffect, useRef } from 'react'
import { renderAdjusted, DEFAULT_ADJUST } from './image-tools'
import styles from './drawsound.module.css'

const CROP_SIDES = [
  ['top', 'Trim top'],
  ['bottom', 'Trim bottom'],
  ['left', 'Trim left'],
  ['right', 'Trim right']
]

const DrawingStage = ({
  drawing,
  altText,
  description,
  onDescriptionChange,
  onAdjust
}) => {
  const canvasRef = useRef(null)
  const { adjust } = drawing

  useEffect(() => {
    const rendered = renderAdjusted(drawing.source, drawing.adjust, 900)
    const canvas = canvasRef.current
    canvas.width = rendered.width
    canvas.height = rendered.height
    canvas.getContext('2d').drawImage(rendered, 0, 0)
  }, [drawing.source, drawing.adjust])

  const rotate = (quarterTurns) =>
    onAdjust({
      ...adjust,
      rotation: (adjust.rotation + quarterTurns * 90 + 360) % 360
    })

  // Each side trims at most 40%, so a fifth of the picture always remains
  const setCrop = (side, value) =>
    onAdjust({ ...adjust, crop: { ...adjust.crop, [side]: Number(value) } })

  return (
    <div className={styles.stageArea}>
      <figure className={styles.stage}>
        <div className={styles.frame}>
          <canvas
            ref={canvasRef}
            className={styles.drawing}
            role='img'
            aria-label={`Your drawing. ${altText}`}
          />
          <div className={styles.readingBand} aria-hidden='true' />
        </div>
        <figcaption className={styles.caption}>{drawing.name}</figcaption>
      </figure>

      <div className={styles.field}>
        <label htmlFor='ds-description'>What is it? (optional)</label>
        <input
          id='ds-description'
          type='text'
          value={description}
          maxLength={80}
          autoComplete='off'
          placeholder='Our cat in the garden'
          aria-describedby='ds-description-hint'
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
        <p id='ds-description-hint' className={styles.hint}>
          Names the song and can nudge its mood. Words like “night” or “race
          car” change how it feels.
        </p>
      </div>

      <details className={styles.details}>
        <summary>Straighten or trim the photo</summary>
        <div className={styles.adjustRow}>
          <button
            type='button'
            className={styles.button}
            onClick={() => rotate(-1)}
          >
            ↺ Turn left
          </button>
          <button
            type='button'
            className={styles.button}
            onClick={() => rotate(1)}
          >
            Turn right ↻
          </button>
          <button
            type='button'
            className={styles.button}
            onClick={() => onAdjust(DEFAULT_ADJUST)}
          >
            Reset
          </button>
        </div>
        <div className={styles.cropGrid}>
          {CROP_SIDES.map(([side, label]) => (
            <label key={side} className={styles.slider}>
              <span>
                {label}{' '}
                <span className={styles.value}>{adjust.crop[side]}%</span>
              </span>
              <input
                type='range'
                min='0'
                max='40'
                step='1'
                value={adjust.crop[side]}
                aria-valuetext={`${adjust.crop[side]} percent`}
                onChange={(event) => setCrop(side, event.target.value)}
              />
            </label>
          ))}
        </div>
      </details>
    </div>
  )
}

export default DrawingStage
