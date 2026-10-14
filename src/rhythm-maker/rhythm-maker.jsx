import { useState } from 'react'
import {
  ClearRounded,
  StopRounded,
  FiberManualRecordRounded
} from '@mui/icons-material'
import {
  Paper,
  Button,
  Input,
  Switch,
  FormGroup,
  FormControlLabel
} from '@mui/material'
import styles from './rhythm-maker.module.css'

const RhythmMaker = ({ stopSequencer, startSequencer, changeBpm, bpm }) => {
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
        <FiberManualRecordRounded
          fontSize='large'
          key={`kick${i}`}
          id={`kick${i}`}
          className={styles.drumCheckbox}
          sx={shapeIconStyle}
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
        <ClearRounded
          fontSize='large'
          key={`hat${i}`}
          id={`hat${i}`}
          className={styles.drumCheckbox}
          sx={shapeIconStyle}
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
        <StopRounded
          fontSize='large'
          key={`snare${i}`}
          id={`snare${i}`}
          className={styles.drumCheckbox}
          sx={shapeIconStyle}
        />
      </div>
    )
  })

  const sequencerLabel = !isSequencerOn ? 'Off' : 'On'

  return (
    <Paper className={styles.container} sx={{ background: 'var(--teal)' }}>
      <div className={styles.drumControlContainer}>
        <div>
          <Button sx={timeCountButtonStyle} onClick={() => changeTimeCount(8)}>
            4/4
          </Button>

          <Button sx={timeCountButtonStyle} onClick={() => changeTimeCount(6)}>
            6/8
          </Button>
        </div>

        <div className={styles.switchContainer}>
          <FormGroup row>
            <FormControlLabel
              control={
                <Switch
                  checked={isSequencerOn}
                  onChange={handleSequencerToggle}
                  value='sequencerToggle'
                  sx={switchStyle}
                />
              }
              label={sequencerLabel}
              sx={switchLabelStyle}
            />
          </FormGroup>
        </div>

        <div className={styles.inputContainer}>
          <Input
            type='number'
            sx={inputStyle}
            value={bpm}
            onChange={handleBpmChange}
            slotProps={{ input: { min: '10', max: '120', step: '1' } }}
          />
        </div>
      </div>

      <div className={styles.drumSection}>
        <div className={styles.drumContainer}>
          <p className={styles.drumTitle}>Kick</p>
          <div className={styles.drums}>{kicks}</div>
        </div>

        <div className={styles.drumContainer}>
          <p className={styles.drumTitle}>Hi-Hat</p>
          <div className={styles.drums}>{hiHats}</div>
        </div>

        <div className={styles.drumContainer}>
          <p className={styles.drumTitle}>Snare</p>
          <div className={styles.drums}>{snares}</div>
        </div>
      </div>
    </Paper>
  )
}

const shapeIconStyle = {
  '@media (max-width: 500px)': {
    fontSize: '1.5rem'
  },
  '@media screen and (device-aspect-ratio: 40/71)': {
    fontSize: '1.3rem'
  }
}

const inputStyle = {
  width: '3rem',
  color: 'var(--blue)',
  fontFamily: 'var(--secondary-font)'
}

const switchStyle = {
  '& .MuiSwitch-switchBase, & .MuiSwitch-switchBase.Mui-checked': {
    color: 'var(--orange)'
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: 'var(--orange)'
  }
}

const switchLabelStyle = {
  '& .MuiFormControlLabel-label': {
    fontFamily: 'var(--header-font)',
    color: 'var(--blue)'
  }
}

const timeCountButtonStyle = {
  fontFamily: 'var(--secondary-font)',
  color: 'var(--blue)',
  '&:active': {
    backgroundColor: 'var(--orange)'
  }
}

export default RhythmMaker
