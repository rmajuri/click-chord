import styles from './view-toggle.module.css'

const views = [
  { value: 'chords', label: 'Chords' },
  { value: 'bass', label: 'Bass' }
]

const ViewToggle = ({ view, onViewChange }) => {
  return (
    <div className={styles.toggle} role='group' aria-label='Instrument view'>
      {views.map(({ value, label }) => (
        <button
          key={value}
          type='button'
          aria-pressed={view === value}
          className={`button ${styles.option} ${
            view === value ? styles.selected : ''
          }`}
          onClick={() => onViewChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default ViewToggle
