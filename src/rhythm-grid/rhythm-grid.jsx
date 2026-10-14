import RhythmHeader from '../rhythm-headings-section/rhythm-headings-section'
import RhythmMaker from '../rhythm-maker/rhythm-maker'
import SynthTextureChanger from '../synth-texture-changer/synth-texture-changer'
import styles from './rhythm-grid.module.css'

const RhythmGrid = ({
  handleTextureClick,
  stopSequencer,
  startSequencer,
  drumSounds,
  onDrumSoundChange,
  changeBpm,
  bpm,
  hasSample
}) => {
  return (
    <div className={styles.rhythmGrid}>
      <RhythmHeader />
      <SynthTextureChanger
        handleTextureClick={handleTextureClick}
        hasSample={hasSample}
      />
      <RhythmMaker
        stopSequencer={stopSequencer}
        startSequencer={startSequencer}
        drumSounds={drumSounds}
        onDrumSoundChange={onDrumSoundChange}
        changeBpm={changeBpm}
        bpm={bpm}
      />
    </div>
  )
}

export default RhythmGrid
