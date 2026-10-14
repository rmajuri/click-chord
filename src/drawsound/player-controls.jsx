import { forwardRef } from 'react'
import styles from './drawsound.module.css'

export const formatTime = (seconds) => {
  const whole = Math.max(0, Math.floor(seconds))
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

const PlayIcon = () => (
  <svg viewBox='0 0 24 24' aria-hidden='true'>
    <path d='M8 5.5c0-.9 1-1.4 1.7-.9l9 6.4c.6.4.6 1.3 0 1.8l-9 6.4c-.7.5-1.7 0-1.7-.9z' />
  </svg>
)

const PauseIcon = () => (
  <svg viewBox='0 0 24 24' aria-hidden='true'>
    <rect x='6' y='5' width='4.5' height='14' rx='1.6' />
    <rect x='13.5' y='5' width='4.5' height='14' rx='1.6' />
  </svg>
)

const PlayerControls = forwardRef(function PlayerControls(
  {
    playState,
    songSeconds,
    volume,
    timeRef,
    onTogglePlay,
    onStop,
    onReplay,
    onVolumeChange
  },
  playButtonRef
) {
  const playing = playState === 'playing'
  const loading = playState === 'loading'

  return (
    <div className={styles.transport} role='group' aria-label='Song controls'>
      <button
        ref={playButtonRef}
        type='button'
        className={styles.playButton}
        onClick={onTogglePlay}
        aria-busy={loading}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
        <span>{playing ? 'Pause' : 'Play'}</span>
      </button>

      <div className={styles.transportSide}>
        <div className={styles.transportButtons}>
          <button
            type='button'
            className={styles.button}
            onClick={onStop}
            disabled={playState === 'stopped' || loading}
          >
            <svg
              viewBox='0 0 24 24'
              aria-hidden='true'
              className={styles.smallIcon}
            >
              <rect x='6' y='6' width='12' height='12' rx='2.5' />
            </svg>
            Stop
          </button>
          <button type='button' className={styles.button} onClick={onReplay}>
            <svg
              viewBox='0 0 24 24'
              aria-hidden='true'
              className={styles.smallIcon}
            >
              <path d='M12 5a7 7 0 1 1-6.6 4.7' fill='none' strokeWidth='2.4' />
              <path d='M4 4.5v5h5' fill='none' strokeWidth='2.4' />
            </svg>
            Start over
          </button>
        </div>
        <p className={styles.time} aria-hidden='true'>
          <span ref={timeRef}>0:00</span> / {formatTime(songSeconds)}
        </p>
        <label className={styles.slider}>
          <span>Volume</span>
          <input
            type='range'
            min='0'
            max='100'
            step='5'
            value={Math.round(volume * 100)}
            aria-valuetext={`${Math.round(volume * 100)} percent`}
            onChange={(event) =>
              onVolumeChange(Number(event.target.value) / 100)
            }
          />
        </label>
      </div>
    </div>
  )
})

export default PlayerControls
