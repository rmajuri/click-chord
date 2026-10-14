import { MAX_SAMPLE_SECONDS } from './mic-capture'
import { MicIcon } from '../icons/icons'
import styles from './sampler.module.css'

const statusText = {
  unsupported: "This browser can't record from the mic",
  denied: 'Mic access was blocked. Allow it in your browser to record',
  requesting: 'Waiting for mic access...',
  recording: `Recording... (up to ${MAX_SAMPLE_SECONDS}s)`,
  processing: 'Processing sample...',
  error: "Couldn't record that sample. Try again",
  idle: 'Record a sound with your mic, then add it to the Sample row'
}

const Sampler = ({
  samplerState,
  hasSample,
  sampleLength,
  sampleNote,
  onRecord,
  onStopRecording,
  onPlay,
  onClear
}) => {
  const isRecording = samplerState === 'recording'
  const isBusy = samplerState === 'requesting' || samplerState === 'processing'
  const status =
    samplerState === 'idle' && hasSample
      ? `${sampleLength.toFixed(2)}s sample ready, ${
          sampleNote ? `pitch ${sampleNote}` : 'no clear pitch (tuned as C)'
        }. Pick Sample under Change Synth Texture to play chords with it`
      : statusText[samplerState]

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <span className={styles.title}>
          <MicIcon className={styles.titleIcon} />
          Sampler
        </span>

        <button
          type='button'
          className={`button ${styles.controlButton} ${
            isRecording ? styles.recordingButton : ''
          }`}
          onClick={isRecording ? onStopRecording : onRecord}
          disabled={samplerState === 'unsupported' || isBusy}
        >
          <span className={styles.recordDot} />
          {isRecording ? 'Stop' : hasSample ? 'Re-record' : 'Record'}
        </button>

        <button
          type='button'
          className={`button ${styles.controlButton}`}
          onClick={onPlay}
          disabled={!hasSample || isRecording || isBusy}
        >
          Play
        </button>

        <button
          type='button'
          className={`button ${styles.controlButton}`}
          onClick={onClear}
          disabled={!hasSample || isRecording || isBusy}
        >
          Clear
        </button>
      </div>

      <p className={styles.status}>{status}</p>
    </div>
  )
}

export default Sampler
