import styles from '../synth-box-container/synth-box-container.module.css'

const NoteBoxContainer = ({ notes, currentNote, handleNoteBoxClick }) => {
  return (
    <div className={styles.synthBoxGrid}>
      {notes.map(({ note, inKey }) => (
        <div
          key={note}
          onClick={() => handleNoteBoxClick(note)}
          className={`synthBox ${inKey ? '' : 'noteBoxOutOfKey'} ${
            currentNote === note ? 'synthBoxPlaying' : ''
          }`}
        >
          <h5>{note}</h5>
        </div>
      ))}
    </div>
  )
}

export default NoteBoxContainer
