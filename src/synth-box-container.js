import React from 'react'
import SynthBox from './synth-box'
import styles from './synth-box-container.module.css'

const SynthBoxContainer = ({synthChords, handleSynthBoxClick}) => {

    return (
        <div className={styles.synthBoxGrid}>
            {
                synthChords.map(chord => {
                    return (
                        <SynthBox
                            key={chord}
                            chordName={chord}
                            handleSynthBoxClick={handleSynthBoxClick}
                        />
                    )
                })
            }
        </div>
    )
}

export default SynthBoxContainer