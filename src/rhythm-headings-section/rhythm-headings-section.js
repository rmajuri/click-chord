import React, { useState } from 'react'
import styles from './rhythm-headings-section.module.css'
import { Popper } from '@material-ui/core'

const RhythmHeadingsSection = ({ handleTextureClick }) => {
    const [anchorEl, setAnhorEl] = useState(null)

    const open = Boolean(anchorEl)

    const handleSynthTextureButtonClick = e => {
        if (!anchorEl) {
            setAnhorEl(e.currentTarget)
        } else {
            setAnhorEl(null)
        }
    }

    return (
        <div className={styles.rhythmTextGrid}>
            <div className={styles.rhythmTextColumn}>
                <h2 className={styles.rhythmHeader}>Rhythm Maker</h2>
            </div>
            <div className={styles.rhythmTextColumn}>
                <button
                    type="button"
                    aria-describedby={'Synth Texture Change Button'}
                    className={styles.synthTextureButton}
                    onClick={handleSynthTextureButtonClick}
                >Change Synth Texture</button>
                <Popper
                    id={'synthTextureChanger'}
                    open={open}
                    anchorEl={anchorEl}
                    transition
                    placement='bottom'
                >
                    <div className={styles.textureOptionContainer}>
                        <button
                            className={styles.textureOption}
                            type="button"
                            onClick={() => handleTextureClick('Synth')}
                        >
                            Synth
                        </button>
                        <button
                            className={styles.textureOption}
                            type="button"
                            onClick={() => handleTextureClick('AMSynth')}
                        >
                            AM Synth
                        </button>
                        <button
                            className={styles.textureOption}
                            type="button"
                            onClick={() => handleTextureClick('FMSynth')}
                        >
                            FM Synth
                        </button>
                        <button
                            className={styles.textureOption}
                            type="button"
                            onClick={() => handleTextureClick('MonoSynth')}
                        >
                            Mono Synth
                        </button>
                    </div>
                </Popper>
            </div>
        </div>
    )
}

export default RhythmHeadingsSection