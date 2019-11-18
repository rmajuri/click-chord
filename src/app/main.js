import React, { useState, useEffect } from 'react'
import { majorScaleChords, buildChords } from '../chords/chords'
import styles from './main.module.css'
import Tone from 'tone'
import SynthBoxContainer from '../synth-box-container/synth-box-container'
import KeyChanger from '../key-changer/key-changer'
import RhythmGrid from '../rhythm-grid/rhythm-grid'
import { Fade, Paper } from '@material-ui/core'

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  root: {
    background: 'var(--yellow)',
  }
})

const Kick = new Tone.Buffer('./kick-deep.wav')
const Hat = new Tone.Buffer('./hihat-808.wav')
const Snare = new Tone.Buffer('./snare-analog.wav')


const App = () => {
  const [keyOptions] = useState(['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'])
  const [currentSynthTexture, setCurrentSynthTexture] = useState('')
  const [currentKey, setCurrentKey] = useState('')
  const [currentChord, setCurrentChord] = useState('')
  Tone.Transport.bpm.value = 95

  const classes = useStyles()

  useEffect(() => {
    buildChords('Synth')
    setCurrentSynthTexture('Synth')
    setCurrentKey('C')

    return () => stopDrumSequencer()
  }, [])

  const changeBpm = bpmValue => {
    Tone.Transport.bpm.value = bpmValue
  }

  const changeTexture = synthTexture => {
    if (!currentChord && currentSynthTexture !== synthTexture) {
      buildChords(synthTexture)
      setCurrentSynthTexture(synthTexture)

      return () => stopDrumSequencer()
    }
  }

  const handleSynthBoxClick = (chord) => {
    if (!currentChord) {
      majorScaleChords[currentKey][chord].start()
      setCurrentChord(chord)
      const chordPlaying = document.getElementById(chord)
      chordPlaying.classList.add('synthBoxPlaying')
    }

    if (currentChord === chord) {
      majorScaleChords[currentKey][chord].stop()
      setCurrentChord('')
      const chordPlaying = document.getElementById(chord)
      chordPlaying.classList.remove('synthBoxPlaying')
    }

    if (currentChord && currentChord !== chord) {
      majorScaleChords[currentKey][currentChord].stop()
      const chordPlaying = document.getElementById(currentChord)
      chordPlaying.classList.remove('synthBoxPlaying')
      majorScaleChords[currentKey][chord].start()
      setCurrentChord(chord)
      const newChord = document.getElementById(chord)
      newChord.classList.add('synthBoxPlaying')
    }
  }

  const startDrumSequencer = count => {
    const kick = new Tone.Player(Kick).toMaster()
    const snare = new Tone.Player(Snare).toMaster()
    const hat = new Tone.Player(Hat).toMaster()
    let index = 0

    const repeat = () => {
      let step = count ? index % count : 8
      const kickClasses = [...document.getElementById(`kickParent${step}`).classList]
      const snareClasses = [...document.getElementById(`snareParent${step}`).classList]
      const hatClasses = [...document.getElementById(`hatParent${step}`).classList]

      if (kickClasses.includes('iconParentPlaying')) {
        kick.start()
      }
      if (snareClasses.includes('iconParentPlaying')) {
        snare.start()
      }
      if (hatClasses.includes('iconParentPlaying')) {
        hat.start()
      }
      index++
    }

    Tone.Transport.scheduleRepeat(repeat, `${count}n`)
    Tone.Transport.start()
  }

  const stopDrumSequencer = () => {
    Tone.Transport.stop()
    Tone.Transport.cancel()
    Tone.Transport.clear()
  }


  const changedKeyHandler = direction => {
    if (currentChord) {
      majorScaleChords[currentKey][currentChord].stop()
      const chordPlaying = document.getElementById(currentChord)
      chordPlaying.className = 'synthBox'
      setCurrentChord('')
    }
    let currentKeyIndex = keyOptions.indexOf(currentKey)
    if (direction === 'up') {
      if (currentKeyIndex + 1 === keyOptions.length) {
        setCurrentKey('C')
      } else {
        setCurrentKey(keyOptions[currentKeyIndex + 1])
      }
    } else {
      if (currentKeyIndex - 1 < 0) {
        setCurrentKey('B')
      } else {
        setCurrentKey(keyOptions[currentKeyIndex - 1])
      }
    }
  }

  let synthChords
  if (Object.keys(majorScaleChords).length) {
    synthChords = Object.keys(majorScaleChords[currentKey])
  }

  return Object.keys(majorScaleChords).length ? (
    <div className={styles.app}>
      <Paper className={[styles.headerContainer, classes.root].join(' ')} elevation={2}>
        <Fade in={true} timeout={{ enter: 3000 }}>
          <h1 className={styles.appHeader}>CLICK-CHORD</h1>
        </Fade>
      </Paper>

      <RhythmGrid
        handleTextureClick={changeTexture}
        startSequencer={startDrumSequencer}
        stopSequencer={stopDrumSequencer}
        changeBpm={changeBpm}
      />

      <div className={styles.appContainerCenter}>

        <KeyChanger
          changedKeyHandler={changedKeyHandler}
          currentKey={currentKey}
        />

        <SynthBoxContainer
          synthChords={synthChords}
          handleSynthBoxClick={handleSynthBoxClick}
        />

      </div>

    </div >
  ) : null
}

export default App
