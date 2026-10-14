import { useState } from 'react'
import { KickIcon, HatIcon, SnareIcon } from '../icons/icons'
import DrumSoundPicker from '../drum-sound-picker/drum-sound-picker'
import { drumSounds as drumSoundOptions } from '../drums/drum-sounds'
import styles from './rhythm-maker.module.css'

const RhythmMaker = ({
  stopSequencer,
  startSequencer,
  drumSounds,
  onDrumSoundChange,
  changeBpm,
  bpm
}) => {
  const [timeCount, setTimeCount] = useState(8)
  const [isSequencerOn, setIsSequencerOn] = useState(false)

  const toggleCheckedColor = (targetedInput) => {
    const clickedDrum = document.getElementById(`${targetedInput}`)
    const drumClassList = [...clickedDrum.classList]
    if (drumClassList.includes('iconParentPlaying')) {
      clickedDrum.classList.remove('iconParentPlaying')
    } else {
      clickedDrum.classList.add('iconParentPlaying')
    }
  }

  const handleBpmChange = (e) => {
    if (e) {
      changeBpm(e.target.value)
    }
  }

  const handleSequencerToggle = () => {
    if (!isSequencerOn) {
      startSequencer(timeCount)
      setIsSequencerOn(true)
    } else {
      stopSequencer()
      setIsSequencerOn(false)
    }
  }

  const changeTimeCount = (count) => {
    if (!!count && count !== timeCount) {
      stopSequencer()
      setTimeCount(count)
    }
  }

  const drumSteps = new Array(timeCount).fill('_')

  const kicks = drumSteps.map((step, i) => {
    return (
      <div
        className='iconParent'
        key={`kickParent${i}`}
        id={`kickParent${i}`}
        onClick={() => toggleCheckedColor(`kickParent${i}`)}
      >
        <KickIcon
          key={`kick${i}`}
          id={`kick${i}`}
          className={styles.drumCheckbox}
        />
      </div>
    )
  })

  const hiHats = drumSteps.map((step, i) => {
    return (
      <div
        className='iconParent'
        key={`hatParent${i}`}
        id={`hatParent${i}`}
        onClick={() => toggleCheckedColor(`hatParent${i}`)}
      >
        <HatIcon
          key={`hat${i}`}
          id={`hat${i}`}
          className={styles.drumCheckbox}
        />
      </div>
    )
  })

  const snares = drumSteps.map((step, i) => {
    return (
      <div
        className='iconParent'
        key={`snareParent${i}`}
        id={`snareParent${i}`}
        onClick={() => toggleCheckedColor(`snareParent${i}`)}
      >
        <SnareIcon
          key={`snare${i}`}
          id={`snare${i}`}
          className={styles.drumCheckbox}
        />
      </div>
    )
  })

  const sequencerLabel = !isSequencerOn ? 'Off' : 'On'

  return (
    <div className={styles.container}>
      <div className={styles.drumControlContainer}>
        <div>
          <button
            type='button'
            className={`button ${styles.timeCountButton}`}
            onClick={() => changeTimeCount(8)}
          >
            4/4
          </button>

          <button
            type='button'
            className={`button ${styles.timeCountButton}`}
            onClick={() => changeTimeCount(6)}
          >
            6/8
          </button>
        </div>

        <div className={styles.switchContainer}>
          <label className={styles.switchLabel}>
            <span className={styles.switch}>
              <span className={styles.switchBase}>
                <input
                  type='checkbox'
                  role='switch'
                  className={styles.switchInput}
                  checked={isSequencerOn}
                  onChange={handleSequencerToggle}
                />
                <span className={styles.switchThumb} />
              </span>
              <span className={styles.switchTrack} />
            </span>
            <span className={styles.switchText}>{sequencerLabel}</span>
          </label>
        </div>

        <div className={styles.inputContainer}>
          <div className={styles.bpmInput}>
            <input
              type='number'
              aria-label='BPM'
              value={bpm}
              onChange={handleBpmChange}
              min='10'
              max='120'
              step='1'
            />
          </div>
        </div>
      </div>

      <div className={styles.drumSection}>
        <div className={styles.drumContainer}>
          <DrumSoundPicker
            label='Kick'
            soundNames={Object.keys(drumSoundOptions.kick)}
            currentSound={drumSounds.kick}
            onSelect={(soundName) => onDrumSoundChange('kick', soundName)}
          />
          <div className={styles.drums}>{kicks}</div>
        </div>

        <div className={styles.drumContainer}>
          <DrumSoundPicker
            label='Hi-Hat'
            soundNames={Object.keys(drumSoundOptions.hat)}
            currentSound={drumSounds.hat}
            onSelect={(soundName) => onDrumSoundChange('hat', soundName)}
          />
          <div className={styles.drums}>{hiHats}</div>
        </div>

        <div className={styles.drumContainer}>
          <DrumSoundPicker
            label='Snare'
            soundNames={Object.keys(drumSoundOptions.snare)}
            currentSound={drumSounds.snare}
            onSelect={(soundName) => onDrumSoundChange('snare', soundName)}
          />
          <div className={styles.drums}>{snares}</div>
        </div>
      </div>
    </div>
  )
}

export default RhythmMaker
