import React from 'react'
import RhythmHeader from '../rhythm-headings-section/rhythm-headings-section'
import RhythmMaker from '../rhythm-maker/rhythm-maker'
import SynthTextureChanger from '../synth-texture-changer/synth-texture-changer'
import styles from './rhythm-grid.module.css'

const RhythmGrid = ({ handleTextureClick }) => {
    return (
        <div className={styles.rhythmGrid}>
            <RhythmHeader />
            <SynthTextureChanger handleTextureClick={handleTextureClick} />
            <RhythmMaker />
        </div>
    )
}

export default RhythmGrid