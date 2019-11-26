import React, { useState } from 'react'
import {
  ClearRounded,
  StopRounded,
  FiberManualRecordRounded
} from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'
import {
  Paper,
  Button,
  Input,
  Switch,
  FormGroup,
  FormControlLabel
} from '@material-ui/core'
import styles from './rhythm-maker.module.css'

const RhythmMaker = ({ stopSequencer, startSequencer, changeBpm, bpm }) => {
  const [timeCount, setTimeCount] = useState(8)
  const [isSequencerOn, setIsSequencerOn] = useState(false)

  const classes = useStyles()

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
          className={[styles.drumCheckbox, classes.shapeIcons].join(' ')}
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
          className={[styles.drumCheckbox, classes.shapeIcons].join(' ')}
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
          className={[styles.drumCheckbox, classes.shapeIcons].join(' ')}
        />
      </div>
    )
  })

  const sequencerLabel = !isSequencerOn ? 'Off' : 'On'

  return (
    <Paper className={[styles.container, classes.root].join(' ')}>
      <div className={styles.drumControlContainer}>
        <div>
          <Button
            className={classes.timeCountButton}
            onClick={() => changeTimeCount(8)}
          >
            4/4
          </Button>

          <Button
            className={classes.timeCountButton}
            onClick={() => changeTimeCount(6)}
          >
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
                  classes={{
                    switchBase: classes.switch,
                    checked: classes.checked,
                    track: classes.track
                  }}
                />
              }
              label={sequencerLabel}
              classes={{ label: classes.switchLabel }}
            />
          </FormGroup>
        </div>

        <div className={styles.inputContainer}>
          <Input
            type='number'
            className={classes.input}
            value={bpm}
            onChange={handleBpmChange}
            inputProps={{ min: '10', max: '120', step: '1' }}
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

const useStyles = makeStyles({
  root: {
    background: 'var(--teal)'
  },
  shapeIcons: {
    '@media(max-width: 500px)': {
      fontSize: '1.5rem'
    },
    '@media screen and (device-aspect-ratio: 40/71)': {
      fontSize: '1.3rem'
    }
  },
  sequencerButton: {
    color: 'var(--blue)',
    border: '1px solid var(--blue)',
    fontFamily: 'var(--header-font)',
    margin: '.5rem auto',
    display: 'flex',
    '&:hover': {
      color: 'var(--orange)',
      border: '1px solid var(--orange)'
    }
  },
  input: {
    width: '3rem',
    color: 'var(--blue)',
    fontFamily: 'var(--secondary-font)'
  },
  switch: {
    color: 'var(--orange)',
    '&$checked': {
      color: 'var(--orange)'
    },
    '&$checked + $track': {
      backgroundColor: 'var(--orange)'
    }
  },
  checked: {},
  track: {},
  switchLabel: {
    fontFamily: 'var(--header-font)',
    color: 'var(--blue)'
  },
  timeCountButton: {
    fontFamily: 'var(--secondary-font)',
    color: 'var(--blue)',
    '&:active': {
      backgroundColor: 'var(--orange)'
    }
  }
})

export default RhythmMaker
