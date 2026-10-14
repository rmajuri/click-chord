import { useEffect, useMemo, useRef, useState } from 'react'
import { analyzeDrawing } from './analyze-drawing'
import { compose } from './compose'
import { describeDrawing } from './describe'
import { DEFAULT_SETTINGS, INSTRUMENT_LABELS, STYLES } from './mappings'
import {
  DEFAULT_ADJUST,
  getAnalysisPixels,
  loadImageFile,
  loadImageUrl,
  makeThumbnail
} from './image-tools'
import { createPlayer, renderToWav } from './player'
import { loadCreations, saveCreation, deleteCreation } from './creations-store'
import { speak, INSTRUCTIONS } from './speech'
import { paintExample } from './examples'
import DrawingPicker from './drawing-picker'
import DrawingStage from './drawing-stage'
import PlayerControls, { formatTime } from './player-controls'
import ScoreView from './score-view'
import SoundOptions from './sound-options'
import SoundExplorer from './sound-explorer'
import HowItWorks from './how-it-works'
import Creations from './creations'
import styles from './drawsound.module.css'

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'song'

const Drawsound = () => {
  const [drawing, setDrawing] = useState(null)
  const [description, setDescription] = useState('')
  // What the song uses, which trails typing so every keystroke isn't a new song
  const [songDescription, setSongDescription] = useState('')
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [playState, setPlayState] = useState('stopped')
  const [volume, setVolume] = useState(0.8)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [creations, setCreations] = useState(loadCreations)
  const [exporting, setExporting] = useState(false)
  const playerRef = useRef(null)
  const pageRef = useRef(null)
  const timeRef = useRef(null)
  const headingRef = useRef(null)
  const playButtonRef = useRef(null)
  // Whether the listener wants music, so a reloaded song carries on playing
  const wantsPlayRef = useRef(false)
  const loadedRef = useRef(null)

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Drawsound · Click-Chord'
    headingRef.current?.focus()
    const player = createPlayer({
      onEnd: () => {
        wantsPlayRef.current = false
        setPlayState('stopped')
        setStatus('The song finished. Press Play to hear it again.')
      }
    })
    playerRef.current = player
    return () => {
      document.title = previousTitle
      player.dispose()
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => setSongDescription(description), 600)
    return () => clearTimeout(timeout)
  }, [description])

  const composition = useMemo(
    () => drawing && compose(drawing.features, settings, songDescription),
    [drawing, settings, songDescription]
  )

  // Rebuilds the instruments whenever the song changes. Rapid changes, like
  // dragging a trim slider, settle before anything is built.
  useEffect(() => {
    if (!composition) return
    const player = playerRef.current
    const timeout = setTimeout(async () => {
      setPlayState('loading')
      const loaded = await player.load(composition)
      if (!loaded) return
      loadedRef.current = composition
      if (wantsPlayRef.current) {
        await player.play()
        setPlayState('playing')
      } else {
        setPlayState('stopped')
      }
    }, 150)
    return () => clearTimeout(timeout)
  }, [composition])

  useEffect(() => {
    playerRef.current.setVolume(volume)
  }, [volume])

  // Moves the playheads without re-rendering React on every frame
  useEffect(() => {
    const page = pageRef.current
    if (!composition || playState === 'stopped' || playState === 'loading') {
      page.style.setProperty('--progress', 0)
      if (timeRef.current) timeRef.current.textContent = '0:00'
      return
    }
    const length = composition.totalSteps * composition.stepSeconds
    let frame
    const tick = () => {
      const seconds = playerRef.current.seconds()
      page.style.setProperty('--progress', Math.min(1, seconds / length))
      if (timeRef.current) {
        timeRef.current.textContent = formatTime(Math.min(seconds, length))
      }
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [playState, composition])

  const startDrawing = (source, name, presetDescription = '') => {
    const features = analyzeDrawing(getAnalysisPixels(source, DEFAULT_ADJUST))
    wantsPlayRef.current = false
    playerRef.current.stop()
    // Choosing a drawing counts as a tap, which browsers need before sound
    playerRef.current.unlock()
    setError('')
    setDrawing({
      source,
      adjust: DEFAULT_ADJUST,
      features,
      name,
      savedId: null
    })
    setSettings((current) => ({ ...current, variation: 0 }))
    setDescription(presetDescription)
    setSongDescription(presetDescription)
    setStatus(
      features.inkRatio < 0.003
        ? 'We could hardly find any marks in that picture, so the song is very quiet. Try a brighter photo with bolder lines.'
        : 'Your song is ready. Press Play to listen.'
    )
    requestAnimationFrame(() => playButtonRef.current?.focus())
  }

  const handleFile = async (file) => {
    try {
      setStatus('Opening your picture…')
      const image = await loadImageFile(file)
      startDrawing(image, 'Your drawing')
    } catch (err) {
      setError(err.message)
      setStatus('')
    }
  }

  const handleExample = (example) => {
    startDrawing(paintExample(example), example.label, example.description)
  }

  const handleAdjust = (adjust) => {
    const features = analyzeDrawing(getAnalysisPixels(drawing.source, adjust))
    setDrawing({ ...drawing, adjust, features })
  }

  const togglePlay = async () => {
    const player = playerRef.current
    if (playState === 'playing') {
      wantsPlayRef.current = false
      player.pause()
      setPlayState('paused')
      setStatus('Paused.')
      return
    }
    wantsPlayRef.current = true
    if (playState === 'loading' || loadedRef.current !== composition) {
      player.unlock()
      setStatus('Getting the instruments ready…')
      return
    }
    await player.play()
    setPlayState('playing')
    setStatus('')
  }

  const stop = () => {
    wantsPlayRef.current = false
    playerRef.current.stop()
    setPlayState('stopped')
    setStatus('Stopped.')
  }

  const replay = async () => {
    wantsPlayRef.current = true
    playerRef.current.stop()
    if (playState === 'loading' || loadedRef.current !== composition) {
      playerRef.current.unlock()
      return
    }
    await playerRef.current.play()
    setPlayState('playing')
    setStatus('')
  }

  const changeSettings = (changes) => {
    setSettings({ ...settings, ...changes })
    if (changes.style) {
      const style = STYLES.find(({ id }) => id === changes.style)
      setStatus(`Sound changed to ${style.label}.`)
    }
  }

  const newVersion = () => {
    const variation = settings.variation + 1
    setSettings({ ...settings, variation })
    setStatus(`Version ${variation + 1}: same drawing, new details.`)
  }

  const playRegion = (phrase) => {
    if (playState === 'playing') {
      wantsPlayRef.current = false
      playerRef.current.pause()
      setPlayState('paused')
    }
    playerRef.current.preview(phrase, composition.stepSeconds)
  }

  const save = () => {
    const id = drawing.savedId ?? crypto.randomUUID()
    const creation = {
      id,
      // The song's own title trails typing, so read the field directly
      title: description.trim() || composition.title,
      description,
      createdAt: Date.now(),
      thumbnail: makeThumbnail(drawing.source, drawing.adjust),
      features: drawing.features,
      settings
    }
    const next = saveCreation(creation, creations)
    if (!next) {
      setError(
        "This browser wouldn't let us save. It may be full or in private mode. You can still download the song."
      )
      return
    }
    setCreations(next)
    setDrawing({ ...drawing, savedId: id })
    setStatus(`Saved “${creation.title}” to My creations.`)
  }

  const openCreation = async (creation) => {
    const image = await loadImageUrl(creation.thumbnail)
    wantsPlayRef.current = false
    playerRef.current.stop()
    setError('')
    setDrawing({
      source: image,
      adjust: DEFAULT_ADJUST,
      features: creation.features,
      name: creation.title,
      savedId: creation.id
    })
    setSettings({ ...DEFAULT_SETTINGS, ...creation.settings })
    setDescription(creation.description)
    setSongDescription(creation.description)
    setStatus(`Opened “${creation.title}”. Press Play to listen.`)
    requestAnimationFrame(() => playButtonRef.current?.focus())
  }

  const removeCreation = (creation) => {
    if (!window.confirm(`Delete “${creation.title}”? This can't be undone.`)) {
      return
    }
    setCreations(deleteCreation(creation.id, creations))
    if (drawing?.savedId === creation.id) {
      setDrawing({ ...drawing, savedId: null })
    }
    setStatus(`Deleted “${creation.title}”.`)
  }

  const download = async () => {
    setExporting(true)
    setStatus('Making your sound file…')
    try {
      const blob = await renderToWav(composition)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `drawsound-${slugify(composition.title)}.wav`
      document.body.append(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 10000)
      setStatus('Your song was downloaded as a WAV file.')
    } catch {
      setError("Sorry, we couldn't make the sound file in this browser.")
    } finally {
      setExporting(false)
    }
  }

  const drawingText = useMemo(
    () => drawing && describeDrawing(drawing.features, songDescription),
    [drawing, songDescription]
  )
  const thumbnail = useMemo(
    () => drawing && makeThumbnail(drawing.source, drawing.adjust, 480),
    [drawing]
  )

  return (
    <div className={styles.page} ref={pageRef} data-state={playState}>
      <header className={styles.header}>
        <a className={styles.backLink} href='#/'>
          ← Back to Click-Chord
        </a>
        <div className={styles.brand}>
          <h1 ref={headingRef} tabIndex={-1} className={styles.title}>
            Draw<span>sound</span>
          </h1>
          <p className={styles.tagline}>
            Every drawing has a sound waiting to be discovered.
          </p>
        </div>
        <button
          type='button'
          className={`${styles.button} ${styles.quietButton}`}
          onClick={() => speak(INSTRUCTIONS)}
        >
          🔊 Hear how it works
        </button>
      </header>

      <main className={styles.main}>
        <p className={styles.status} role='status' aria-live='polite'>
          {status}
        </p>
        {error && (
          <p className={styles.error} role='alert'>
            {error}
          </p>
        )}

        <div className={styles.workspace}>
          <section className={styles.panel} aria-labelledby='ds-choose'>
            <h2 id='ds-choose' className={styles.sectionTitle}>
              <span className={styles.stepNumber} aria-hidden='true'>
                1
              </span>
              Choose a drawing
            </h2>
            <DrawingPicker
              hasDrawing={Boolean(drawing)}
              onFile={handleFile}
              onExample={handleExample}
            />
            {drawing && (
              <DrawingStage
                drawing={drawing}
                altText={drawingText}
                description={description}
                onDescriptionChange={setDescription}
                onAdjust={handleAdjust}
              />
            )}
            <p className={styles.privacy}>
              Your drawing stays on this device. Nothing is uploaded.
            </p>
          </section>

          <section className={styles.panel} aria-labelledby='ds-listen'>
            <h2 id='ds-listen' className={styles.sectionTitle}>
              <span className={styles.stepNumber} aria-hidden='true'>
                2
              </span>
              Listen
            </h2>
            {composition ? (
              <>
                <p className={styles.songTitle}>
                  “{composition.title}”{' '}
                  <span className={styles.songMeta}>
                    {composition.key} {composition.modeLabel} ·{' '}
                    {composition.bpm} beats a minute ·{' '}
                    {INSTRUMENT_LABELS[composition.instruments.lead]}
                  </span>
                </p>
                <PlayerControls
                  ref={playButtonRef}
                  playState={playState}
                  songSeconds={composition.totalSteps * composition.stepSeconds}
                  volume={volume}
                  timeRef={timeRef}
                  onTogglePlay={togglePlay}
                  onStop={stop}
                  onReplay={replay}
                  onVolumeChange={setVolume}
                />
                <ScoreView composition={composition} />
                <SoundOptions
                  settings={settings}
                  onChange={changeSettings}
                  onNewVersion={newVersion}
                />
                <div className={styles.keepRow}>
                  <button
                    type='button'
                    className={styles.button}
                    onClick={save}
                  >
                    {drawing.savedId
                      ? 'Update my creation'
                      : 'Save to my creations'}
                  </button>
                  <button
                    type='button'
                    className={styles.button}
                    onClick={download}
                    disabled={exporting}
                  >
                    {exporting ? 'Making the file…' : 'Download song (.wav)'}
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.emptyListen}>
                <svg viewBox='0 0 120 60' aria-hidden='true'>
                  <path d='M5 40c15-30 25 10 40-10s20-25 35 0 25 10 35-15' />
                  <circle cx='45' cy='30' r='4' />
                  <circle cx='80' cy='30' r='4' />
                </svg>
                <p>Choose a drawing and its song will appear here.</p>
              </div>
            )}
          </section>
        </div>

        {composition && (
          <SoundExplorer
            features={drawing.features}
            composition={composition}
            thumbnail={thumbnail}
            onPlayRegion={playRegion}
          />
        )}
        {composition && (
          <HowItWorks
            drawingText={drawingText}
            explanation={composition.explanation}
          />
        )}
        <Creations
          creations={creations}
          onOpen={openCreation}
          onDelete={removeCreation}
        />
      </main>

      <footer className={styles.footer}>
        <p>
          Drawsound is an experiment in hearing art. It hasn’t yet been tested
          with blind and low-vision children, and we’d love to learn from
          families and teachers who try it.
        </p>
      </footer>
    </div>
  )
}

export default Drawsound
