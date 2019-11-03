import React, { useState } from 'react'
import styles from './synth-texture-changer.module.css'
import { Popper, Typography } from '@material-ui/core'

const TextureChanger = ({ handleTextureClick }) => {
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
        <div className={styles.synthTextureButtonArea}>
            <button
                type="button"
                aria-describedby={'Synth Texture Change Button'}
                className={styles.synthTextureButton}
                onClick={handleSynthTextureButtonClick}
            ><Typography>Change Synth Texture</Typography></button>
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
                        <Typography>
                            Synth
                        </Typography>
                    </button>
                    <button
                        className={styles.textureOption}
                        type="button"
                        onClick={() => handleTextureClick('AMSynth')}
                    >
                        <Typography>
                            AM Synth
                        </Typography>
                    </button>
                    <button
                        className={styles.textureOption}
                        type="button"
                        onClick={() => handleTextureClick('FMSynth')}
                    >
                        <Typography>
                            FM Synth
                        </Typography>
                    </button>
                    <button
                        className={styles.textureOption}
                        type="button"
                        onClick={() => handleTextureClick('MonoSynth')}
                    >
                        <Typography>
                            Mono Synth
                        </Typography>
                    </button>
                </div>
            </Popper>
        </div>
    )
}

export default TextureChanger
