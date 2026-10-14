import styles from '../synth-box-container/synth-box-container.module.css'

const BassBoxContainer = ({
  bassNotes,
  currentBassNote,
  handleBassBoxClick
}) => {
  return (
    <div className={styles.synthBoxGrid}>
      {bassNotes.map(({ note, inKey }) => (
        <div
          key={note}
          onClick={() => handleBassBoxClick(note)}
          className={`synthBox ${inKey ? '' : 'bassBoxOutOfKey'} ${
            currentBassNote === note ? 'synthBoxPlaying' : ''
          }`}
        >
          <h5>{note}</h5>
        </div>
      ))}
    </div>
  )
}

export default BassBoxContainer
