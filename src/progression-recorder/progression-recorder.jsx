import { QUANTIZE_GRIDS } from './quantize'
import styles from './progression-recorder.module.css'

const statusText = {
  armed: 'Click a chord to start recording',
  recording: 'Recording...'
}

const ProgressionRecorder = ({
  recorderState,
  onRecord,
  onStopRecording,
  isLooping,
  onToggleLoop,
  onClear,
  grid,
  onGridChange,
  progression,
  playingStep
}) => {
  const isRecording = recorderState !== 'idle'

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <button
          type='button'
          className={`button ${styles.controlButton} ${
            isRecording ? styles.recordingButton : ''
          }`}
          onClick={isRecording ? onStopRecording : onRecord}
          disabled={isLooping}
        >
          <span className={styles.recordDot} />
          {isRecording ? 'Stop' : 'Record'}
        </button>

        <button
          type='button'
          className={`button ${styles.controlButton}`}
          onClick={onToggleLoop}
          disabled={!progression || isRecording}
        >
          {isLooping ? 'Stop Loop' : 'Play Loop'}
        </button>

        <button
          type='button'
          className={`button ${styles.controlButton}`}
          onClick={onClear}
          disabled={!progression || isRecording}
        >
          Clear
        </button>

        <label className={styles.gridLabel}>
          Quantize
          <select
            className={styles.gridSelect}
            value={grid}
            onChange={(e) => onGridChange(Number(e.target.value))}
          >
            {QUANTIZE_GRIDS.map(({ label, beats }) => (
              <option key={beats} value={beats}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.timeline}>
        {isRecording ? (
          <p className={styles.status}>{statusText[recorderState]}</p>
        ) : progression ? (
          progression.steps.map((step, i) => (
            <div
              key={`${step.beat}-${step.chord}`}
              className={`${styles.step} ${
                step.chord ? '' : styles.restStep
              } ${playingStep === i ? styles.playingStep : ''}`}
              style={{ flexGrow: step.duration }}
            >
              {step.chord ?? 'Rest'}
            </div>
          ))
        ) : (
          <p className={styles.status}>
            Hit record and play a progression to loop it
          </p>
        )}
      </div>

      {progression && !isRecording && (
        <p className={styles.loopLength}>
          {progression.loopBeats / 4} bar loop
        </p>
      )}
    </div>
  )
}

export default ProgressionRecorder
