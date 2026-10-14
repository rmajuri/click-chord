import { QUANTIZE_GRIDS, BEATS_PER_BAR, octaveRange } from './quantize'
import { transposeNote } from '../bass/bass'
import { ArrowUpIcon, ArrowDownIcon } from '../icons/icons'
import styles from './progression-recorder.module.css'

const TRACKS = [
  { id: 'chords', label: 'Chords', noun: 'a chord' },
  { id: 'bass', label: 'Bass', noun: 'a bass note' }
]

const ProgressionRecorder = ({
  recorderState,
  onRecord,
  onStopRecording,
  isLooping,
  onToggleLoop,
  onClear,
  grid,
  onGridChange,
  recordTrack,
  progressions,
  playingSteps,
  onClearTrack,
  octaves,
  onOctaveChange
}) => {
  const isRecording = recorderState !== 'idle'
  const hasProgression = TRACKS.some(({ id }) => progressions[id])
  const recordLabel = TRACKS.find(({ id }) => id === recordTrack).label
  const rows = TRACKS.filter(
    ({ id }) => progressions[id] || (isRecording && recordTrack === id)
  )

  const statusText = (noun) =>
    recorderState === 'armed'
      ? `Click ${noun} to start recording${
          isLooping ? ', it will line up with the loop' : ''
        }`
      : 'Recording...'

  const renderSteps = (track, progression) =>
    progression.steps.map((step, i) => {
      const octave = octaves[track][step.eventIndex] ?? 0
      const range = step.name && octaveRange(track, step.name)
      // Bass notes are named with their octave, so the name follows the shift
      const name =
        track === 'bass' && step.name
          ? transposeNote(step.name, octave)
          : step.name

      return (
        <div
          key={`${step.beat}-${step.name}`}
          className={`${styles.step} ${step.name ? '' : styles.restStep} ${
            playingSteps[track] === i ? styles.playingStep : ''
          }`}
          style={{ flexGrow: step.duration }}
        >
          <span className={styles.stepName}>{name ?? 'Rest'}</span>
          {step.name && (
            <span className={styles.octaveControls}>
              <button
                type='button'
                className={styles.octaveButton}
                aria-label={`Lower ${name} an octave`}
                disabled={octave <= range.min}
                onClick={() => onOctaveChange(track, step, -1)}
              >
                <ArrowDownIcon />
              </button>
              <span className={styles.octaveValue}>
                {octave > 0 ? `+${octave}` : octave}
              </span>
              <button
                type='button'
                className={styles.octaveButton}
                aria-label={`Raise ${name} an octave`}
                disabled={octave >= range.max}
                onClick={() => onOctaveChange(track, step, 1)}
              >
                <ArrowUpIcon />
              </button>
            </span>
          )}
        </div>
      )
    })

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <button
          type='button'
          className={`button ${styles.controlButton} ${
            isRecording ? styles.recordingButton : ''
          }`}
          onClick={isRecording ? onStopRecording : onRecord}
        >
          <span className={styles.recordDot} />
          {isRecording ? 'Stop' : `Record ${recordLabel}`}
        </button>

        <button
          type='button'
          className={`button ${styles.controlButton}`}
          onClick={onToggleLoop}
          disabled={!hasProgression || isRecording}
        >
          {isLooping ? 'Stop Loop' : 'Play Loop'}
        </button>

        <button
          type='button'
          className={`button ${styles.controlButton}`}
          onClick={onClear}
          disabled={!hasProgression || isRecording}
        >
          Clear All
        </button>

        <label className={styles.gridLabel}>
          Quantize
          <select
            className={styles.gridSelect}
            value={grid}
            disabled={isRecording}
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

      {rows.length ? (
        rows.map(({ id, label, noun }) => {
          const progression = progressions[id]
          const isRecordingRow = isRecording && recordTrack === id
          const bars = progression && progression.loopBeats / BEATS_PER_BAR

          return (
            <div key={id} className={styles.track}>
              <div className={styles.trackLabel}>
                <span className={styles.trackName}>{label}</span>
                {progression && !isRecordingRow && (
                  <span className={styles.trackMeta}>
                    {bars} {bars === 1 ? 'bar' : 'bars'}
                    <button
                      type='button'
                      className={styles.clearTrackButton}
                      aria-label={`Clear ${label.toLowerCase()}`}
                      disabled={isRecording}
                      onClick={() => onClearTrack(id)}
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
              <div className={styles.timeline}>
                {isRecordingRow ? (
                  <p className={styles.status}>{statusText(noun)}</p>
                ) : (
                  renderSteps(id, progression)
                )}
              </div>
            </div>
          )
        })
      ) : (
        <div className={styles.timeline}>
          <p className={styles.status}>
            Hit record and play some chords or a bass line to loop it
          </p>
        </div>
      )}
    </div>
  )
}

export default ProgressionRecorder
