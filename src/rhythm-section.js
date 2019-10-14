import React from 'react'
import styles from './rhythm-section.module.css'

const RhythmSection = ({ rhythmHeaderText, rhythmButtonText, handleClick }) => {
    return (
        <div className={styles.rhythmTextGrid}>
            <div className={styles.rhythmTextColumn}>
                <h2 className={styles.rhythmHeader}>{rhythmHeaderText}</h2>
            </div>
            <div className={styles.rhythmTextColumn}>
                <button
                    type="button"
                    className={styles.rhythmButton}
                    onClick={handleClick}
                >{rhythmButtonText}</button>
            </div>
        </div>
    )
}

export default RhythmSection