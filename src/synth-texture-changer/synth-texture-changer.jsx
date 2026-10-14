import { useState } from 'react'
import styles from './synth-texture-changer.module.css'

const synthTextures = ['Square', 'Triangle', 'Sawtooth', 'Sine']

const TextureChanger = ({ handleTextureClick, hasSample }) => {
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.synthTextureButtonArea}>
      <div className={styles.menuAnchor}>
        <button
          type='button'
          aria-expanded={open}
          aria-controls='synthTextureChanger'
          className={`button ${styles.textureButton}`}
          onClick={() => setOpen(!open)}
        >
          Change Synth Texture
        </button>

        {open && (
          <div id='synthTextureChanger' className={styles.textureMenu}>
            {synthTextures.map((texture) => {
              return (
                <button
                  key={texture}
                  className={`button ${styles.textureOption}`}
                  type='button'
                  onClick={() => handleTextureClick(texture.toLowerCase())}
                >
                  {texture}
                </button>
              )
            })}
            <button
              className={`button ${styles.textureOption}`}
              type='button'
              disabled={!hasSample}
              title={hasSample ? undefined : 'Record a sample first'}
              onClick={() => handleTextureClick('sample')}
            >
              Sample
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TextureChanger
