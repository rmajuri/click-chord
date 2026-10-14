import { QUANTIZE_GRIDS, MIN_OCTAVE, MAX_OCTAVE } from './quantize'
import { ArrowUpIcon, ArrowDownIcon } from '../icons/icons'
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
  playingStep,
  octaves,
  onOctaveChange
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
          progression.steps.map((step, i) => {
            const octave = octaves[step.eventIndex] ?? 0

            return (
              <div
                key={`${step.beat}-${step.chord}`}
                className={`${styles.step} ${
                  step.chord ? '' : styles.restStep
                } ${playingStep === i ? styles.playingStep : ''}`}
                style={{ flexGrow: step.duration }}
              >
                <span className={styles.stepName}>{step.chord ?? 'Rest'}</span>
                {step.chord && (
                  <span className={styles.octaveControls}>
                    <button
                      type='button'
                      className={styles.octaveButton}
                      aria-label={`Lower ${step.chord} an octave`}
                      disabled={octave <= MIN_OCTAVE}
                      onClick={() => onOctaveChange(step.eventIndex, -1)}
                    >
                      <ArrowDownIcon />
                    </button>
                    <span className={styles.octaveValue}>
                      {octave > 0 ? `+${octave}` : octave}
                    </span>
                    <button
                      type='button'
                      className={styles.octaveButton}
                      aria-label={`Raise ${step.chord} an octave`}
                      disabled={octave >= MAX_OCTAVE}
                      onClick={() => onOctaveChange(step.eventIndex, 1)}
                    >
                      <ArrowUpIcon />
                    </button>
                  </span>
                )}
              </div>
            )
          })
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
