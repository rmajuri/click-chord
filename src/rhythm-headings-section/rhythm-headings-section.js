import React from 'react'
import styles from './rhythm-headings-section.module.css'
import { Typography } from '@material-ui/core'

const RhythmHeader = () => {
    return (
        <div className={styles.rhythmHeaderArea}>
            <Typography>
                <h3 className={styles.rhythmHeader}>Rhythm Maker</h3>
            </Typography>
        </div>
    )
}

export default RhythmHeader