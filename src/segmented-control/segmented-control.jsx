import styles from './segmented-control.module.css'

const SegmentedControl = ({ label, options, value, onChange }) => {
  return (
    <div className={styles.control} role='group' aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type='button'
          aria-pressed={value === option.value}
          className={`button ${styles.option} ${
            value === option.value ? styles.selected : ''
          }`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default SegmentedControl
