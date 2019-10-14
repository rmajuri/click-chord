import React, { useState, useEffect } from 'react'
import { majorScaleChords, buildChords } from './chords'
import styles from './app.module.css'
import Tone from 'tone'
import SynthBox from './synth-box'
import RhythmSection from './rhythm-section'

const AUDIO = document.createElement('audio')

const App = () => {
  const [keyOptions] = useState(['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'])
  const [rhytmList] = useState(['club.ogg', 'mellow.ogg', 'oldschool.ogg', 'rock.ogg', 'roll.ogg', 'waltz.ogg'])
  const [rhythmComponent, setRhythmComponent] = useState('player')
  const [currentSynthTexture, setCurrentSynthTexture] = useState('')
  const [currentKey, setCurrentKey] = useState('')
  const [currentChord, setCurrentChord] = useState('')
  const [currentRhythm, setCurrentRhythm] = useState('')
  const [rhythmPlaying, toggleRhythmPlaying] = useState(false)

  useEffect(() => {
    buildChords('Synth')
    setCurrentSynthTexture('Synth')
    setCurrentKey('C')
  }, [])

  const changeTexture = synthTexture => {
    if (!currentChord && currentSynthTexture !== synthTexture) {
      buildChords(synthTexture)
      setCurrentSynthTexture(synthTexture)
    }
  }

  const toggleRhythmInterface = () => {
    if (rhythmComponent === 'player') {
      setRhythmComponent('maker')
    } else {
      setRhythmComponent('player')
    }
  }

  const startAudio = () => {
    if (currentRhythm && !rhythmPlaying) {
      resume()
    } else if (!currentRhythm.length) {
      AUDIO.src = rhytmList[0]
      AUDIO.load()
      AUDIO.play()
      setCurrentRhythm(rhytmList[0])
      toggleRhythmPlaying(true)
    }
  }

  const forward = () => {
    const nextRhytm = rhytmList.indexOf(currentRhythm) + 1
    if (nextRhytm === 0 || nextRhytm >= rhytmList.length) {
      AUDIO.pause()
      AUDIO.src = ''
      toggleRhythmPlaying(false)
      setCurrentRhythm('')
    } else {
      AUDIO.pause()
      AUDIO.src = rhytmList[nextRhytm]
      AUDIO.load()
      AUDIO.play()
      setCurrentRhythm(rhytmList[nextRhytm])
      toggleRhythmPlaying(true)
    }
  }

  const back = () => {
    const nextRhytm = rhytmList.indexOf(currentRhythm) - 1
    if (nextRhytm < 0) {
      AUDIO.pause()
      AUDIO.src = ''
      toggleRhythmPlaying(false)
      setCurrentRhythm('')
    } else {
      AUDIO.pause()
      AUDIO.src = rhytmList[nextRhytm]
      AUDIO.load()
      AUDIO.play()
      setCurrentRhythm(rhytmList[nextRhytm])
      toggleRhythmPlaying(true)
    }
  }

  const pause = () => {
    AUDIO.pause()
    toggleRhythmPlaying(false)
  }

  const resume = () => {
    AUDIO.play()
    toggleRhythmPlaying(true)
  }

  const handleSynthBoxClick = (chord) => {
    if (!currentChord) {
      majorScaleChords[currentKey][chord].start()
      setCurrentChord(chord)
      const chordPlaying = document.getElementById(chord)
      chordPlaying.className = 'synthBoxPlaying'
    }

    if (currentChord === chord) {
      majorScaleChords[currentKey][chord].stop()
      setCurrentChord('')
      const chordPlaying = document.getElementById(chord)
      chordPlaying.className = 'synthBox'
    }

    if (currentChord && currentChord !== chord) {
      majorScaleChords[currentKey][currentChord].stop()
      const chordPlaying = document.getElementById(currentChord)
      chordPlaying.className = 'synthBox'
      majorScaleChords[currentKey][chord].start()
      const newChord = document.getElementById(chord)
      newChord.className = 'synthBoxPlaying'
      setCurrentChord(chord)
    }
  }

  const startDrumSequencer = count => {
    const kick = new Tone.Player('./kick-deep.wav').toMaster()
    const snare = new Tone.Player('./snare-analog.wav').toMaster()
    const hat = new Tone.Player('./hihat-808.wav').toMaster()
    const crash = new Tone.Player('./crash-noise.wav').toMaster()
    let index = 0

    const repeat = () => {
      let step = index % count
      let kickInputs = document.querySelector(`#kick${step}`)
      let snareInputs = document.querySelector(`#snare${step}`)
      let hatInputs = document.querySelector(`#hat${step}`)
      let crashInputs = document.querySelector(`#crash${step}`)
      if (kickInputs.checked) {
        kick.start()
      }
      if (snareInputs.checked) {
        snare.start()
      }
      if (hatInputs.checked) {
        hat.start()
      }
      if (crashInputs.checked) {
        crash.start()
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

  const changeBpm = bpm => {
    Tone.Transport.bpm.value = bpm
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

  const rhythmButtonText = rhythmComponent === 'player' ? 'Make your own rhythm!' : 'Choose a rhythm'
  const rhythmHeaderText = rhythmComponent === 'player' ? 'Rhythm Player' : 'Rhythm Maker'

  return Object.keys(majorScaleChords).length ? (
    <div className={styles.app}>
      <header>
        <h1 className={styles.appHeader}>CLICK-CHORD</h1>
      </header>

      <RhythmSection
        rhythmHeaderText={rhythmHeaderText}
        rhythmButtonText={rhythmButtonText}
        handleClick={toggleRhythmInterface} />

    </div>
  ) : null
}

export default App
