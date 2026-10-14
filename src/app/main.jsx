import { useState, useEffect, useMemo, useRef } from 'react'
import * as Tone from 'tone'
import { majorScaleChords, buildChords } from '../chords/chords'
import styles from './main.module.css'
import SynthBoxContainer from '../synth-box-container/synth-box-container'
import KeyChanger from '../key-changer/key-changer'
import RhythmGrid from '../rhythm-grid/rhythm-grid'
import ProgressionRecorder from '../progression-recorder/progression-recorder'
import SegmentedControl from '../segmented-control/segmented-control'
import BassBoxContainer from '../bass-box-container/bass-box-container'
import {
  buildBass,
  BASS_TEXTURES,
  bassNotesForKey,
  startBassNote,
  stopBassNote
} from '../bass/bass'
import {
  quantizeRecording,
  BEATS_PER_BAR,
  MIN_OCTAVE,
  MAX_OCTAVE
} from '../progression-recorder/quantize'

const Kick = new Tone.ToneAudioBuffer('./kick-deep.wav')
const Hat = new Tone.ToneAudioBuffer('./hihat-808.wav')
const Snare = new Tone.ToneAudioBuffer('./snare-analog.wav')
const transport = Tone.getTransport()

buildChords('square')
buildBass('round')
transport.bpm.value = 95

// The drum sequencer and the progression loop share the transport, so each
// only stops it when the other isn't using it
let drumRepeatId = null
let loopParts = null
// Where the loop started on the transport and how long its longest track is,
// so a take recorded over the loop can be timed against it
let loopTiming = null

const stopTransportIfIdle = () => {
  if (drumRepeatId === null && loopParts === null) {
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

// Starts a step's chord or bass note and returns a function that stops it
const soundStep = (track, step, octave, time) => {
  if (track === 'bass') {
    startBassNote(step.name, time, 'loop')
    return (stopTime) => stopBassNote(stopTime, 'loop')
  }
  const chord = majorScaleChords[step.key][step.name]
  chord.start(time, octave)
  return (stopTime) => chord.stop(stopTime, octave)
}

// Every track starts together and loops on its own length, so a one bar bass
// line repeats under a four bar progression. Octaves and mutes are read as
// each step plays, so changing one doesn't restart the loop
const startLoop = (progressions, { getOctave, isMuted, onStep }) => {
  const ticksPerBeat = transport.PPQ
  const tracks = Object.entries(progressions).filter(([, p]) => p)

  let startTicks = 0
  if (transport.state === 'started') {
    // Drums are already running, so come in on the next bar
    const ticksPerBar = ticksPerBeat * BEATS_PER_BAR
    startTicks =
      Math.ceil(transport.getTicksAtTime(Tone.now()) / ticksPerBar) *
      ticksPerBar
  }
  loopTiming = {
    startTicks,
    cycleBeats: Math.max(...tracks.map(([, p]) => p.loopBeats))
  }

  const silencers = []
  loopParts = tracks.map(([track, progression]) => {
    let stopSounding = null
    const silence = (time) => {
      stopSounding?.(time)
      stopSounding = null
    }
    silencers.push(silence)

    const part = new Tone.Part(
      (time, step) => {
        silence(time)
        if (step.name && !isMuted(track)) {
          stopSounding = soundStep(
            track,
            step,
            getOctave(track, step.eventIndex),
            time
          )
        }
        Tone.getDraw().schedule(() => onStep(track, step.index), time)
      },
      progression.steps.map((step, index) => ({
        ...step,
        index,
        time: `${step.beat * ticksPerBeat}i`
      }))
    )
    part.loop = true
    part.loopEnd = `${progression.loopBeats * ticksPerBeat}i`
    part.start(`${startTicks}i`)
    return part
  })

  if (transport.state !== 'started') {
    transport.start('+0.1')
  }

  return () => {
    loopParts.forEach((part) => part.dispose())
    loopParts = null
    loopTiming = null
    silencers.forEach((silence) => silence())
    stopTransportIfIdle()
  }
}

const NO_STEPS_PLAYING = { chords: -1, bass: -1 }

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
  const [view, setView] = useState('chords')
  const [currentBassNote, setCurrentBassNote] = useState('')
  const [bassTexture, setBassTexture] = useState('round')
  const [bpm, setBpm] = useState(95)
  const [recorderState, setRecorderState] = useState('idle')
  const [recordings, setRecordings] = useState({ chords: null, bass: null })
  const [grid, setGrid] = useState(1)
  const [isLooping, setIsLooping] = useState(false)
  const [playingSteps, setPlayingSteps] = useState(NO_STEPS_PLAYING)
  const [octaves, setOctaves] = useState({})
  const recordingRef = useRef(null)
  const octavesRef = useRef(octaves)

  const chordProgression = useMemo(
    () => quantizeRecording(recordings.chords, grid),
    [recordings.chords, grid]
  )
  const bassProgression = useMemo(
    () => quantizeRecording(recordings.bass, grid),
    [recordings.bass, grid]
  )
  const progressions = useMemo(
    () => ({ chords: chordProgression, bass: bassProgression }),
    [chordProgression, bassProgression]
  )
  const hasProgression = Boolean(chordProgression || bassProgression)

  useEffect(
    () => () => {
      transport.stop()
      transport.cancel()
    },
    []
  )

  useEffect(() => {
    if (!isLooping || !hasProgression) {
      return
    }
    const stopLoop = startLoop(progressions, {
      getOctave: (track, eventIndex) =>
        track === 'chords' ? (octavesRef.current[eventIndex] ?? 0) : 0,
      // The track being recorded sits out so the old take doesn't play over
      // the new one
      isMuted: (track) => recordingRef.current?.track === track,
      onStep: (track, index) =>
        setPlayingSteps((prev) => ({ ...prev, [track]: index }))
    })
    return () => {
      stopLoop()
      setPlayingSteps(NO_STEPS_PLAYING)
    }
  }, [isLooping, hasProgression, progressions])

  // Without a loop playing, times are measured from the first note played
  // after hitting record, so there's no pressure to come in on a count. Over a
  // loop, they're measured from the start of the time around the loop the
  // first note lands in, so the take lines up with the loop
  const captureChange = (track, name, key = null) => {
    const rec = recordingRef.current
    if (rec?.track !== track) {
      return
    }
    const now = rec.now()
    if (rec.startTime === null) {
      if (!name) {
        return
      }
      rec.startTime = rec.cycleSeconds
        ? Math.floor(now / rec.cycleSeconds) * rec.cycleSeconds
        : now
      setRecorderState('recording')
    }
    rec.events.push({ time: now - rec.startTime, name, key })
  }

  const captureChordChange = (chord) =>
    captureChange('chords', chord, currentKey)

  const startRecording = async () => {
    await Tone.start()
    const rec = {
      track: view,
      startTime: null,
      events: [],
      now: () => performance.now() / 1000
    }
    if (loopTiming) {
      const { startTicks, cycleBeats } = loopTiming
      const secondsPerBeat = 60 / transport.bpm.value
      rec.now = () =>
        ((transport.getTicksAtTime(Tone.immediate()) - startTicks) /
          transport.PPQ) *
        secondsPerBeat
      rec.cycleSeconds = cycleBeats * secondsPerBeat
      rec.loopUnit = cycleBeats
    }
    recordingRef.current = rec
    setRecorderState('armed')
    if (view === 'chords' && currentChord) {
      captureChordChange(currentChord)
    }
    if (view === 'bass' && currentBassNote) {
      captureChange('bass', currentBassNote)
    }
  }

  const stopRecording = () => {
    const rec = recordingRef.current
    recordingRef.current = null
    setRecorderState('idle')
    if (rec && rec.startTime !== null && rec.events.length) {
      if (rec.track === 'chords') {
        updateOctaves({})
      }
      setRecordings((prev) => ({
        ...prev,
        [rec.track]: {
          events: rec.events,
          duration: rec.now() - rec.startTime,
          bpm: transport.bpm.value,
          loopUnit: rec.loopUnit
        }
      }))
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
    setRecordings({ chords: null, bass: null })
    updateOctaves({})
  }

  const clearTrack = (track) => {
    const other = track === 'chords' ? bassProgression : chordProgression
    if (!other) {
      setIsLooping(false)
    }
    setRecordings((prev) => ({ ...prev, [track]: null }))
    if (track === 'chords') {
      updateOctaves({})
    }
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

  const handleBassBoxClick = async (note) => {
    await Tone.start()

    if (currentBassNote === note) {
      stopBassNote()
      setCurrentBassNote('')
      captureChange('bass', null)
    } else {
      // The bass is monophonic, so a new note glides straight on from the last
      startBassNote(note)
      setCurrentBassNote(note)
      captureChange('bass', note)
    }
  }

  // A held note carries over to the new sound rather than cutting out
  const changeBassTexture = (texture) => {
    buildBass(texture)
    setBassTexture(texture)
    if (currentBassNote) {
      startBassNote(currentBassNote)
    }
  }

  const stopBass = () => {
    if (currentBassNote) {
      stopBassNote()
      setCurrentBassNote('')
      captureChange('bass', null)
    }
  }

  const stopChord = () => {
    if (currentChord) {
      majorScaleChords[currentKey][currentChord].stop()
      document.getElementById(currentChord).classList.remove('synthBoxPlaying')
      setCurrentChord('')
      captureChordChange(null)
    }
  }

  // Whatever's sounding in the view being hidden stops, since its box won't
  // be on screen to stop it
  const changeView = (nextView) => {
    if (nextView === view) {
      return
    }
    stopChord()
    stopBass()
    // A take only records the instrument it started on
    if (recorderState !== 'idle') {
      stopRecording()
    }
    setView(nextView)
  }

  const startDrumSequencer = async (count) => {
    await Tone.start()
    const kick = new Tone.Player(Kick).toDestination()
    const snare = new Tone.Player(Snare).toDestination()
    const hat = new Tone.Player(Hat).toDestination()
    const stepTicks = Tone.Time(`${count}n`).toTicks()

    // Step from the transport position rather than a counter so the drums
    // stay on the bar when the transport is already running for the loop
    const repeat = (time) => {
      const step = count
        ? Math.round(transport.getTicksAtTime(time) / stepTicks) % count
        : 8
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
    stopBass()
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

      <ProgressionRecorder
        recorderState={recorderState}
        onRecord={startRecording}
        onStopRecording={stopRecording}
        isLooping={isLooping}
        onToggleLoop={toggleLoop}
        onClear={clearRecording}
        grid={grid}
        onGridChange={setGrid}
        recordTrack={view}
        progressions={progressions}
        playingSteps={playingSteps}
        onClearTrack={clearTrack}
        octaves={octaves}
        onOctaveChange={changeStepOctave}
      />

      <div className={styles.appContainerCenter}>
        <KeyChanger
          changedKeyHandler={changedKeyHandler}
          currentKey={currentKey}
        />

        <div className={styles.viewControls}>
          <SegmentedControl
            label='Instrument view'
            options={[
              { value: 'chords', label: 'Chords' },
              { value: 'bass', label: 'Bass' }
            ]}
            value={view}
            onChange={changeView}
          />

          {view === 'bass' && (
            <SegmentedControl
              label='Bass sound'
              options={Object.entries(BASS_TEXTURES).map(
                ([value, { label }]) => ({ value, label })
              )}
              value={bassTexture}
              onChange={changeBassTexture}
            />
          )}
        </div>

        {view === 'chords' ? (
          <SynthBoxContainer
            synthChords={synthChords}
            handleSynthBoxClick={handleSynthBoxClick}
          />
        ) : (
          <BassBoxContainer
            bassNotes={bassNotesForKey(currentKey)}
            currentBassNote={currentBassNote}
            handleBassBoxClick={handleBassBoxClick}
          />
        )}
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
