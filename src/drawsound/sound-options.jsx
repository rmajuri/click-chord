import { STYLES } from './mappings'
import styles from './drawsound.module.css'

const SoundOptions = ({ settings, onChange, onNewVersion }) => (
  <div className={styles.options}>
    <fieldset className={styles.styleChoices}>
      <legend>Pick a sound</legend>
      <div className={styles.styleList}>
        {STYLES.map((style) => (
          <label key={style.id} className={styles.styleChoice}>
            <input
              type='radio'
              name='ds-style'
              value={style.id}
              checked={settings.style === style.id}
              onChange={() => onChange({ style: style.id })}
            />
            <span className={styles.styleName}>{style.label}</span>
            <span className={styles.styleHint}>{style.hint}</span>
          </label>
        ))}
      </div>
    </fieldset>

    <div className={styles.versionRow}>
      <button
        type='button'
        className={`${styles.button} ${styles.accentButton}`}
        onClick={onNewVersion}
        aria-describedby='ds-version-hint'
      >
        ✦ Make a new version
      </button>
      <p id='ds-version-hint' className={styles.hint}>
        Version {settings.variation + 1}. Same drawing and mood, new details.
      </p>
    </div>

    <details className={styles.details}>
      <summary>More options</summary>
      <div className={styles.selectRow}>
        <label className={styles.selectField}>
          <span>Mood</span>
          <select
            value={settings.mood}
            onChange={(event) => onChange({ mood: event.target.value })}
          >
            <option value='auto'>Let the drawing decide</option>
            <option value='major'>Sunny (major)</option>
            <option value='minor'>Moody (minor)</option>
          </select>
        </label>
        <label className={styles.selectField}>
          <span>Speed</span>
          <select
            value={settings.tempo}
            onChange={(event) => onChange({ tempo: event.target.value })}
          >
            <option value='slower'>Slower</option>
            <option value='auto'>The drawing’s speed</option>
            <option value='faster'>Faster</option>
          </select>
        </label>
        <label className={styles.selectField}>
          <span>Length</span>
          <select
            value={settings.bars}
            onChange={(event) => onChange({ bars: Number(event.target.value) })}
          >
            <option value='8'>Short (8 bars)</option>
            <option value='16'>Long (16 bars)</option>
          </select>
        </label>
      </div>
    </details>
  </div>
)

export default SoundOptions
