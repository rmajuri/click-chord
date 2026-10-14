import { useMemo, useState } from 'react'
import { EXAMPLES, paintExample } from './examples'
import styles from './drawsound.module.css'

const DrawingPicker = ({ hasDrawing, onFile, onExample }) => {
  const [dragging, setDragging] = useState(false)
  const thumbnails = useMemo(
    () =>
      Object.fromEntries(
        EXAMPLES.map((example) => [
          example.id,
          paintExample(example).toDataURL('image/png')
        ])
      ),
    []
  )

  const takeFile = (event) => {
    const file = event.target.files?.[0]
    // Clearing lets the same file be picked again after a change
    event.target.value = ''
    if (file) onFile(file)
  }

  return (
    <div className={styles.picker}>
      <label
        className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          const file = event.dataTransfer.files?.[0]
          if (file) onFile(file)
        }}
      >
        <input
          type='file'
          accept='image/*'
          className={styles.fileInput}
          onChange={takeFile}
          data-testid='drawing-file'
        />
        <svg className={styles.dropIcon} viewBox='0 0 48 48' aria-hidden='true'>
          <path d='M8 36c4-1 6-6 10-6s5 4 9 4 6-9 13-10' />
          <rect x='5' y='8' width='38' height='32' rx='5' />
          <circle cx='16' cy='18' r='4' />
        </svg>
        <span className={styles.dropTitle}>
          {hasDrawing
            ? 'Choose a different drawing'
            : 'Choose a photo of a drawing'}
        </span>
        <span className={styles.dropHint}>
          Or drag a picture here. JPG, PNG, WebP or GIF.
        </span>
      </label>

      <label className={`${styles.button} ${styles.cameraButton}`}>
        <input
          type='file'
          accept='image/*'
          capture='environment'
          className={styles.fileInput}
          onChange={takeFile}
        />
        Take a photo
      </label>

      <div
        className={styles.examples}
        role='group'
        aria-labelledby='ds-examples-label'
      >
        <p id='ds-examples-label' className={styles.examplesLabel}>
          No drawing handy? Try one of ours:
        </p>
        <div className={styles.exampleList}>
          {EXAMPLES.map((example) => (
            <button
              key={example.id}
              type='button'
              className={styles.exampleButton}
              onClick={() => onExample(example)}
            >
              <img src={thumbnails[example.id]} alt='' />
              {example.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DrawingPicker
