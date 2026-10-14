import { useState, useEffect, useRef } from 'react'
import styles from './drum-sound-picker.module.css'

const DrumSoundPicker = ({ label, soundNames, currentSound, onSelect }) => {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef(null)
  const menuId = `${label.replace(/\W/g, '')}SoundMenu`

  useEffect(() => {
    if (!open) {
      return
    }
    const closeOnOutsideClick = (e) => {
      if (!anchorRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    const closeOnEscape = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div className={styles.menuAnchor} ref={anchorRef}>
      <button
        type='button'
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${label} sound: ${currentSound}`}
        className={styles.drumTitle}
        onClick={() => setOpen(!open)}
      >
        {label} <span aria-hidden='true'>▾</span>
      </button>

      {open && (
        <div id={menuId} className={styles.soundMenu}>
          {soundNames.map((soundName) => (
            <button
              key={soundName}
              type='button'
              aria-pressed={soundName === currentSound}
              className={`button ${styles.soundOption}`}
              onClick={() => {
                onSelect(soundName)
                setOpen(false)
              }}
            >
              {soundName}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default DrumSoundPicker
