import React from 'react'
import styles from './rhythm-headings-section.module.css'

const RhythmHeadingsSection = ({ rhythmHeaderText, rhythmButtonText, handleClick }) => {
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

export default RhythmHeadingsSection