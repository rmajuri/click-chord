import { useState, useEffect } from 'react'
import * as Tone from 'tone'
import { majorScaleChords, buildChords } from '../chords/chords'
import styles from './main.module.css'
import SynthBoxContainer from '../synth-box-container/synth-box-container'
import KeyChanger from '../key-changer/key-changer'
import RhythmGrid from '../rhythm-grid/rhythm-grid'

const Kick = new Tone.ToneAudioBuffer('./kick-deep.wav')
const Hat = new Tone.ToneAudioBuffer('./hihat-808.wav')
const Snare = new Tone.ToneAudioBuffer('./snare-analog.wav')
const transport = Tone.getTransport()

buildChords('square')
transport.bpm.value = 95

const stopDrumSequencer = () => {
  transport.stop()
  transport.cancel()
}

const App = () => {
  const [keyOptions] = useState([
    'C',
    'Db',
    'D',
    'Eb',
    'E',
    'F',
    'Gb',
    'G',
    'Ab',
    'A',
    'Bb',
    'B'
  ])
  const [currentSynthTexture, setCurrentSynthTexture] = useState('square')
  const [currentKey, setCurrentKey] = useState('C')
  const [currentChord, setCurrentChord] = useState('')
  const [bpm, setBpm] = useState(95)

  useEffect(() => stopDrumSequencer, [])

  const changeBpm = (bpmValue) => {
    transport.bpm.value = Number(bpmValue)
    setBpm(bpmValue)
  }

  const changeTexture = (synthTexture) => {
    if (!currentChord && currentSynthTexture !== synthTexture) {
      buildChords(synthTexture)
      setCurrentSynthTexture(synthTexture)

      return () => stopDrumSequencer()
    }
  }

  const handleSynthBoxClick = async (chord) => {
    await Tone.start()

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

  const startDrumSequencer = async (count) => {
    await Tone.start()
    const kick = new Tone.Player(Kick).toDestination()
    const snare = new Tone.Player(Snare).toDestination()
    const hat = new Tone.Player(Hat).toDestination()
    let index = 0

    const repeat = () => {
      const step = count ? index % count : 8
      const kickClasses = [
        ...document.getElementById(`kickParent${step}`).classList
      ]
      const snareClasses = [
        ...document.getElementById(`snareParent${step}`).classList
      ]
      const hatClasses = [
        ...document.getElementById(`hatParent${step}`).classList
      ]

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

    transport.scheduleRepeat(repeat, `${count}n`)
    transport.start('+0.1')
  }

  const changedKeyHandler = (direction) => {
    if (currentChord) {
      majorScaleChords[currentKey][currentChord].stop()
      const chordPlaying = document.getElementById(currentChord)
      chordPlaying.className = 'synthBox'
      setCurrentChord('')
    }
    const currentKeyIndex = keyOptions.indexOf(currentKey)
    if (direction === 'up') {
      if (currentKeyIndex + 1 === keyOptions.length) {
        setCurrentKey('C')
      } else {
        setCurrentKey(keyOptions[currentKeyIndex + 1])
      }
    } else if (currentKeyIndex - 1 < 0) {
      setCurrentKey('B')
    } else {
      setCurrentKey(keyOptions[currentKeyIndex - 1])
    }
  }

  let synthChords
  if (Object.keys(majorScaleChords).length) {
    synthChords = Object.keys(majorScaleChords[currentKey])
  }

  return Object.keys(majorScaleChords).length ? (
    <div>
      <div className={styles.headerContainer}>
        <h1 className={styles.appHeader}>CLICK-CHORD</h1>
      </div>

      <RhythmGrid
        handleTextureClick={changeTexture}
        startSequencer={startDrumSequencer}
        stopSequencer={stopDrumSequencer}
        changeBpm={changeBpm}
        bpm={bpm}
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
      <footer style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--secondary-font)' }}>
          Built with{' '}
          <span role='img' aria-label='music note'>
            🎵
          </span>{' '}
          by{' '}
          <a href='https://www.robertmajuri.com/' target='blank'>
            Rob Majuri
          </a>
        </p>
      </footer>
    </div>
  ) : null
}

export default App
