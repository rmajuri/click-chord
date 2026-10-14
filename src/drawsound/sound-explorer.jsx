import { useRef, useState } from 'react'
import { composeRegionPhrase } from './compose'
import { describeRegion, regionName } from './describe'
import { REGION_GRID } from './analyze-drawing'
import styles from './drawsound.module.css'

const amountWord = (density) => {
  if (density < 0.004) return 'Empty'
  if (density < 0.04) return 'A little'
  if (density < 0.12) return 'Some'
  return 'Lots'
}

// Lets anyone hear the drawing one part at a time, with or without seeing
// it. Arrow keys move around the 3 by 3 grid and play each part.
const SoundExplorer = ({ features, composition, thumbnail, onPlayRegion }) => {
  const [active, setActive] = useState(0)
  const [message, setMessage] = useState('')
  const buttons = useRef([])

  const play = (index) => {
    const region = features.regions[index]
    const phrase = composeRegionPhrase(region, features, composition)
    setActive(index)
    setMessage(describeRegion(region, phrase, composition.style))
    onPlayRegion(phrase)
  }

  const move = (event, index) => {
    const row = Math.floor(index / REGION_GRID)
    const col = index % REGION_GRID
    const targets = {
      ArrowRight: col < REGION_GRID - 1 ? index + 1 : index,
      ArrowLeft: col > 0 ? index - 1 : index,
      ArrowDown: row < REGION_GRID - 1 ? index + REGION_GRID : index,
      ArrowUp: row > 0 ? index - REGION_GRID : index,
      Home: 0,
      End: REGION_GRID ** 2 - 1
    }
    if (!(event.key in targets)) return
    event.preventDefault()
    const next = targets[event.key]
    buttons.current[next]?.focus()
    play(next)
  }

  return (
    <section className={styles.panel} aria-labelledby='ds-explore'>
      <h2 id='ds-explore' className={styles.sectionTitle}>
        <span className={styles.stepNumber} aria-hidden='true'>
          3
        </span>
        Explore by sound
      </h2>
      <p className={styles.lead} id='ds-explore-help'>
        The drawing is split into nine parts. Press one to hear the music it
        makes. With a keyboard, use the arrow keys to move from part to part.
        Higher parts play higher notes, and the left and right parts come from
        the left and right speakers.
      </p>
      <div className={styles.explorer}>
        <div
          className={styles.regionGrid}
          role='group'
          aria-label='Parts of the drawing'
          aria-describedby='ds-explore-help'
          style={{ backgroundImage: `url(${thumbnail})` }}
        >
          {features.regions.map((region, index) => (
            <button
              key={index}
              ref={(node) => (buttons.current[index] = node)}
              type='button'
              tabIndex={index === active ? 0 : -1}
              className={`${styles.region} ${index === active ? styles.regionActive : ''}`}
              onClick={() => play(index)}
              onKeyDown={(event) => move(event, index)}
            >
              <span className={styles.regionName}>{regionName(region)}</span>
              <span className={styles.regionAmount}>
                {amountWord(region.density)}
              </span>
            </button>
          ))}
        </div>
        <p className={styles.regionMessage} role='status' aria-live='polite'>
          {message || 'Pick a part to hear it.'}
        </p>
      </div>
    </section>
  )
}

export default SoundExplorer
