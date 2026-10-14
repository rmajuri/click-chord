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
import SegmentedControl from '../segmented-control/segmented-control'
import BassBoxContainer from '../bass-box-container/bass-box-container'
import {
  buildBass,
  BASS_TEXTURES,
  bassNotesForKey,
  transposeNote,
  startBassNote,
  stopBassNote
} from '../bass/bass'
import Sampler from '../sampler/sampler'
import {
  isMicSupported,
  startMicCapture,
  MAX_SAMPLE_SECONDS
} from '../sampler/mic-capture'
import {
  quantizeRecording,
  BEATS_PER_BAR,
  octaveRange
} from '../progression-recorder/quantize'
import { drumSounds, defaultDrumSounds } from '../drums/drum-sounds'

const transport = Tone.getTransport()
// Shared by the Play button and the drum sequencer's Sample row
const samplePlayer = new Tone.Player().toDestination()

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
    startBassNote(transposeNote(step.name, octave), time, 'loop')
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
const NO_OCTAVES = { chords: {}, bass: {} }

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
  const [view, setView] = useState('chords')
  const [currentBassNote, setCurrentBassNote] = useState('')
  const [bassTexture, setBassTexture] = useState('round')
  const [bpm, setBpm] = useState(95)
  const [recorderState, setRecorderState] = useState('idle')
  const [recordings, setRecordings] = useState({ chords: null, bass: null })
  const [grid, setGrid] = useState(1)
  const [isLooping, setIsLooping] = useState(false)
  const [playingSteps, setPlayingSteps] = useState(NO_STEPS_PLAYING)
  const [octaves, setOctaves] = useState(NO_OCTAVES)
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
      clearTimeout(micTimeoutRef.current)
      stopMicRef.current?.()
    },
    []
  )

  useEffect(() => {
    if (!isLooping || !hasProgression) {
      return
    }
    const stopLoop = startLoop(progressions, {
      getOctave: (track, eventIndex) =>
        octavesRef.current[track][eventIndex] ?? 0,
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
      updateOctaves(rec.track, {})
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
    octavesRef.current = NO_OCTAVES
    setOctaves(NO_OCTAVES)
  }

  const clearTrack = (track) => {
    const other = track === 'chords' ? bassProgression : chordProgression
    if (!other) {
      setIsLooping(false)
    }
    setRecordings((prev) => ({ ...prev, [track]: null }))
    updateOctaves(track, {})
  }

  function updateOctaves(track, trackOctaves) {
    const next = { ...octavesRef.current, [track]: trackOctaves }
    octavesRef.current = next
    setOctaves(next)
  }

  const changeStepOctave = (track, step, direction) => {
    const trackOctaves = octaves[track]
    const { min, max } = octaveRange(track, step.name)
    const octave = Math.min(
      max,
      Math.max(min, (trackOctaves[step.eventIndex] ?? 0) + direction)
    )
    updateOctaves(track, { ...trackOctaves, [step.eventIndex]: octave })
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

  // Whatever's sounding in the view being hidden stops, since its box won't
  // be on screen to stop it
  const changeView = (nextView) => {
    if (nextView === view) {
      return
    }
    stopCurrentChord()
    stopBass()
    // A take only records the instrument it started on
    if (recorderState !== 'idle') {
      stopRecording()
    }
    setView(nextView)
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
