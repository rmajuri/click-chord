import { useState, useEffect, useMemo, useRef } from 'react'
import * as Tone from 'tone'
import {
  majorScaleChords,
  buildChords,
  setSampleSustain
} from '../chords/chords'
import styles from './main.module.css'
import SynthBoxContainer from '../synth-box-container/synth-box-container'
import KeyChanger from '../key-changer/key-changer'
import RhythmGrid from '../rhythm-grid/rhythm-grid'
import ProgressionRecorder from '../progression-recorder/progression-recorder'
import Sampler from '../sampler/sampler'
import {
  isMicSupported,
  startMicCapture,
  MAX_SAMPLE_SECONDS
} from '../sampler/mic-capture'
import {
  quantizeRecording,
  MIN_OCTAVE,
  MAX_OCTAVE
} from '../progression-recorder/quantize'
import { drumSounds, defaultDrumSounds } from '../drums/drum-sounds'

const transport = Tone.getTransport()
// Shared by the Play button and the drum sequencer's Sample row
const samplePlayer = new Tone.Player().toDestination()

buildChords('square')
transport.bpm.value = 95

// The drum sequencer and the progression loop share the transport, so each
// only stops it when the other isn't using it
let drumRepeatId = null
let loopPart = null

// Read on every step, so a newly picked sound plays without a restart
const drumVoices = {}

const setDrumVoice = (drum, soundName) => {
  drumVoices[drum]?.dispose()
  drumVoices[drum] = drumSounds[drum][soundName]()
  return drumVoices[drum]
}

Object.entries(defaultDrumSounds).forEach(([drum, soundName]) =>
  setDrumVoice(drum, soundName)
)

const stopTransportIfIdle = () => {
  if (drumRepeatId === null && loopPart === null) {
    transport.stop()
  }
}

const stopDrumSequencer = () => {
  if (drumRepeatId !== null) {
    transport.clear(drumRepeatId)
    drumRepeatId = null
  }
  stopTransportIfIdle()
}

// Octaves are read as each step plays, so changing one doesn't restart the loop
const startLoop = (progression, getOctave, onStep) => {
  const ticksPerBeat = transport.PPQ
  let sounding = null

  const stopSounding = (time) => {
    sounding?.chord.stop(time, sounding.octave)
    sounding = null
  }

  loopPart = new Tone.Part(
    (time, step) => {
      stopSounding(time)
      if (step.chord) {
        sounding = {
          chord: majorScaleChords[step.key][step.chord],
          octave: getOctave(step.eventIndex)
        }
        sounding.chord.start(time, sounding.octave)
      }
      Tone.getDraw().schedule(() => onStep(step.index), time)
    },
    progression.steps.map((step, index) => ({
      ...step,
      index,
      time: `${step.beat * ticksPerBeat}i`
    }))
  )
  loopPart.loop = true
  loopPart.loopEnd = `${progression.loopBeats * ticksPerBeat}i`

  if (transport.state === 'started') {
    // Drums are already running, so come in on the next bar
    loopPart.start('@1m')
  } else {
    loopPart.start(0)
    transport.start('+0.1')
  }

  return () => {
    loopPart.dispose()
    loopPart = null
    stopSounding()
    stopTransportIfIdle()
  }
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
  const [currentDrumSounds, setCurrentDrumSounds] = useState(defaultDrumSounds)
  const [currentKey, setCurrentKey] = useState('C')
  const [currentChord, setCurrentChord] = useState('')
  // The transport outlives this page, so pick up its tempo on return visits
  const [bpm, setBpm] = useState(() => Math.round(transport.bpm.value))
  const [recorderState, setRecorderState] = useState('idle')
  const [recording, setRecording] = useState(null)
  const [grid, setGrid] = useState(1)
  const [isLooping, setIsLooping] = useState(false)
  const [playingStep, setPlayingStep] = useState(-1)
  const [octaves, setOctaves] = useState({})
  const [samplerState, setSamplerState] = useState(() =>
    isMicSupported() ? 'idle' : 'unsupported'
  )
  const [sampleLength, setSampleLength] = useState(0)
  const [sampleNote, setSampleNote] = useState(null)
  const [sampleSustain, setSampleSustainState] = useState(true)
  const sampleRef = useRef(null)
  const recordingRef = useRef(null)
  const stopMicRef = useRef(null)
  const micTimeoutRef = useRef(null)
  const stopSampleRecordingRef = useRef(null)
  const octavesRef = useRef(octaves)
  const heldChordRef = useRef(null)

  const progression = useMemo(
    () => quantizeRecording(recording, grid),
    [recording, grid]
  )

  useEffect(() => {
    heldChordRef.current = currentChord
      ? majorScaleChords[currentKey][currentChord]
      : null
  })

  // Leaving for another page shouldn't leave a chord ringing
  useEffect(
    () => () => {
      heldChordRef.current?.stop()
      drumRepeatId = null
      transport.stop()
      transport.cancel()
      clearTimeout(micTimeoutRef.current)
      stopMicRef.current?.()
    },
    []
  )

  useEffect(() => {
    if (!isLooping || !progression) {
      return
    }
    const stopLoop = startLoop(
      progression,
      (eventIndex) => octavesRef.current[eventIndex] ?? 0,
      setPlayingStep
    )
    return () => {
      stopLoop()
      setPlayingStep(-1)
    }
  }, [isLooping, progression])

  // Times are measured from the first chord played after hitting record, so
  // there's no pressure to come in on a count
  const captureChordChange = (chord, key = currentKey) => {
    const rec = recordingRef.current
    if (!rec) {
      return
    }
    const now = performance.now() / 1000
    if (rec.startTime === null) {
      if (!chord) {
        return
      }
      rec.startTime = now
      setRecorderState('recording')
    }
    rec.events.push({ time: now - rec.startTime, chord, key })
  }

  const startRecording = async () => {
    await Tone.start()
    recordingRef.current = { startTime: null, events: [] }
    setRecorderState('armed')
    if (currentChord) {
      captureChordChange(currentChord)
    }
  }

  const stopRecording = () => {
    const rec = recordingRef.current
    recordingRef.current = null
    setRecorderState('idle')
    if (rec?.startTime !== null && rec?.events.length) {
      updateOctaves({})
      setRecording({
        events: rec.events,
        duration: performance.now() / 1000 - rec.startTime,
        bpm: transport.bpm.value
      })
    }
  }

  const toggleLoop = async () => {
    await Tone.start()
    if (!isLooping && currentChord) {
      majorScaleChords[currentKey][currentChord].stop()
      document.getElementById(currentChord).classList.remove('synthBoxPlaying')
      setCurrentChord('')
    }
    setIsLooping(!isLooping)
  }

  const clearRecording = () => {
    setIsLooping(false)
    setRecording(null)
    updateOctaves({})
  }

  function updateOctaves(next) {
    octavesRef.current = next
    setOctaves(next)
  }

  const changeStepOctave = (eventIndex, direction) => {
    const octave = Math.min(
      MAX_OCTAVE,
      Math.max(MIN_OCTAVE, (octaves[eventIndex] ?? 0) + direction)
    )
    updateOctaves({ ...octaves, [eventIndex]: octave })
  }

  const stopSampleRecording = async () => {
    const stopMic = stopMicRef.current
    if (!stopMic) {
      return
    }
    stopMicRef.current = null
    clearTimeout(micTimeoutRef.current)
    setSamplerState('processing')
    try {
      const sample = await stopMic()
      sampleRef.current = sample
      samplePlayer.buffer = sample.buffer
      setSampleLength(sample.buffer.duration)
      setSampleNote(
        sample.frequency ? Tone.Frequency(sample.frequency).toNote() : null
      )
      setSamplerState('idle')
      if (currentSynthTexture === 'sample') {
        stopCurrentChord()
        buildChords('sample', { ...sample, sustain: sampleSustain })
      }
    } catch {
      setSamplerState('error')
    }
  }

  const startSampleRecording = async () => {
    await Tone.start()
    setSamplerState('requesting')
    try {
      stopMicRef.current = await startMicCapture()
    } catch (err) {
      setSamplerState(err.name === 'NotAllowedError' ? 'denied' : 'error')
      return
    }
    setSamplerState('recording')
    // Goes through a ref so the auto-stop sees the chord and texture state
    // as of when it fires, not when recording started
    micTimeoutRef.current = setTimeout(
      () => stopSampleRecordingRef.current(),
      MAX_SAMPLE_SECONDS * 1000
    )
  }

  useEffect(() => {
    stopSampleRecordingRef.current = stopSampleRecording
  })

  const playSample = async () => {
    await Tone.start()
    if (samplePlayer.loaded) {
      samplePlayer.start()
    }
  }

  const clearSample = () => {
    samplePlayer.stop()
    samplePlayer.buffer = new Tone.ToneAudioBuffer()
    sampleRef.current = null
    setSampleLength(0)
    setSampleNote(null)
    if (currentSynthTexture === 'sample') {
      stopCurrentChord()
      buildChords('square')
      setCurrentSynthTexture('square')
    }
  }

  // Rebuilding the chords swaps the instrument out from under a held chord,
  // so let go of it first
  const stopCurrentChord = () => {
    if (currentChord) {
      majorScaleChords[currentKey][currentChord].stop()
      document.getElementById(currentChord).classList.remove('synthBoxPlaying')
      setCurrentChord('')
      captureChordChange(null)
    }
  }

  const changeSampleSustain = (sustain) => {
    setSampleSustain(sustain)
    setSampleSustainState(sustain)
  }

  const changeBpm = (bpmValue) => {
    transport.bpm.value = Number(bpmValue)
    setBpm(bpmValue)
  }

  const changeTexture = (synthTexture) => {
    if (synthTexture === 'sample' && !sampleRef.current) {
      return
    }
    if (!currentChord && currentSynthTexture !== synthTexture) {
      buildChords(synthTexture, {
        ...sampleRef.current,
        sustain: sampleSustain
      })
      setCurrentSynthTexture(synthTexture)

      return () => stopDrumSequencer()
    }
  }

  const handleSynthBoxClick = async (chord) => {
    await Tone.start()

    if (!currentChord) {
      majorScaleChords[currentKey][chord].start()
      setCurrentChord(chord)
      captureChordChange(chord)
      const chordPlaying = document.getElementById(chord)
      chordPlaying.classList.add('synthBoxPlaying')
    }

    if (currentChord === chord) {
      majorScaleChords[currentKey][chord].stop()
      setCurrentChord('')
      captureChordChange(null)
      const chordPlaying = document.getElementById(chord)
      chordPlaying.classList.remove('synthBoxPlaying')
    }

    if (currentChord && currentChord !== chord) {
      majorScaleChords[currentKey][currentChord].stop()
      const chordPlaying = document.getElementById(currentChord)
      chordPlaying.classList.remove('synthBoxPlaying')
      majorScaleChords[currentKey][chord].start()
      setCurrentChord(chord)
      captureChordChange(chord)
      const newChord = document.getElementById(chord)
      newChord.classList.add('synthBoxPlaying')
    }
  }

  const changeDrumSound = async (drum, soundName) => {
    await Tone.start()
    // Play one hit so the user hears what they picked
    setDrumVoice(drum, soundName).play(Tone.now())
    setCurrentDrumSounds({ ...currentDrumSounds, [drum]: soundName })
  }

  const startDrumSequencer = async (count) => {
    await Tone.start()
    const stepTicks = Tone.Time(`${count}n`).toTicks()

    // Step from the transport position rather than a counter so the drums
    // stay on the bar when the transport is already running for the loop
    const repeat = (time) => {
      const step = count
        ? Math.round(transport.getTicksAtTime(time) / stepTicks) % count
        : 8

      Object.keys(drumVoices).forEach((drum) => {
        const drumClasses = [
          ...document.getElementById(`${drum}Parent${step}`).classList
        ]
        if (drumClasses.includes('iconParentPlaying')) {
          drumVoices[drum].play(time)
        }
      })
      const sampleClasses = [
        ...document.getElementById(`sampleParent${step}`).classList
      ]
      if (sampleClasses.includes('iconParentPlaying') && samplePlayer.loaded) {
        samplePlayer.start(time)
      }
    }

    stopDrumSequencer()
    drumRepeatId = transport.scheduleRepeat(repeat, `${count}n`)
    if (transport.state !== 'started') {
      transport.start('+0.1')
    }
  }

  const changedKeyHandler = (direction) => {
    if (currentChord) {
      majorScaleChords[currentKey][currentChord].stop()
      const chordPlaying = document.getElementById(currentChord)
      chordPlaying.className = 'synthBox'
      setCurrentChord('')
      captureChordChange(null)
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
      <p className={styles.drawsoundLink}>
        <a href='#/drawsound'>New: turn a drawing into music with Drawsound</a>
      </p>

      <RhythmGrid
        handleTextureClick={changeTexture}
        startSequencer={startDrumSequencer}
        stopSequencer={stopDrumSequencer}
        drumSounds={currentDrumSounds}
        onDrumSoundChange={changeDrumSound}
        changeBpm={changeBpm}
        bpm={bpm}
        hasSample={sampleLength > 0}
      />

      <Sampler
        samplerState={samplerState}
        hasSample={sampleLength > 0}
        sampleLength={sampleLength}
        sampleNote={sampleNote}
        sustain={sampleSustain}
        onSustainChange={changeSampleSustain}
        onRecord={startSampleRecording}
        onStopRecording={stopSampleRecording}
        onPlay={playSample}
        onClear={clearSample}
      />

      <ProgressionRecorder
        recorderState={recorderState}
        onRecord={startRecording}
        onStopRecording={stopRecording}
        isLooping={isLooping}
        onToggleLoop={toggleLoop}
        onClear={clearRecording}
        grid={grid}
        onGridChange={setGrid}
        progression={progression}
        playingStep={playingStep}
        octaves={octaves}
        onOctaveChange={changeStepOctave}
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
