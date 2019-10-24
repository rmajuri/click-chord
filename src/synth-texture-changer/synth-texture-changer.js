import React from 'react'
import styles from './synth-texture-changer.module.css'

const TextureChanger = ({ handleTextureClick }) => {
    return (
        <div>
            <h4 className={styles.textureOptionHeader}>Synth Texture</h4>
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
                    onClick={() => handleTextureClick('DuoSynth')}
                >
                    Duo Synth
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
        </div>
    )
}

export default TextureChanger
