import { useEffect, useState } from 'react'
import { canSpeak, speak, stopSpeaking } from './speech'
import styles from './drawsound.module.css'

const HowItWorks = ({ drawingText, explanation }) => {
  const [speaking, setSpeaking] = useState(false)
  useEffect(() => () => stopSpeaking(), [])

  const toggleSpeech = () => {
    if (speaking) {
      stopSpeaking()
      setSpeaking(false)
      return
    }
    const text = [
      `What Drawsound noticed. ${drawingText}`,
      'How it became music.',
      ...explanation.map(({ title, text }) => `${title}. ${text}`)
    ].join(' ')
    if (speak(text)) {
      setSpeaking(true)
      const poll = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          clearInterval(poll)
          setSpeaking(false)
        }
      }, 500)
    }
  }

  return (
    <section className={styles.panel} aria-labelledby='ds-how'>
      <h2 id='ds-how' className={styles.sectionTitle}>
        How your drawing became music
      </h2>
      <div className={styles.noticed}>
        <h3>What Drawsound noticed</h3>
        <p>{drawingText}</p>
        {canSpeak() && (
          <button
            type='button'
            className={styles.button}
            onClick={toggleSpeech}
          >
            {speaking ? 'Stop reading' : 'Read this aloud'}
          </button>
        )}
      </div>
      <ol className={styles.explanations}>
        {explanation.map(({ id, title, text }) => (
          <li key={id}>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ol>
      <p className={styles.hint}>
        These are Drawsound’s own creative rules, not facts about what colors or
        shapes mean. The same drawing could become different music in another
        app, and that’s part of the fun.
      </p>
    </section>
  )
}

export default HowItWorks
