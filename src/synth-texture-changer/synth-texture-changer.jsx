import { useState } from 'react'
import { Popper, Paper, Button } from '@mui/material'
import styles from './synth-texture-changer.module.css'

const TextureChanger = ({ handleTextureClick }) => {
  const [anchorEl, setAnhorEl] = useState(null)
  const [synthTextures] = useState(['Square', 'Triangle', 'Sawtooth', 'Sine'])

  const open = Boolean(anchorEl)

  const handleSynthTextureButtonClick = (e) => {
    if (!anchorEl) {
      setAnhorEl(e.currentTarget)
    } else {
      setAnhorEl(null)
    }
  }
  return (
    <div className={styles.synthTextureButtonArea}>
      <Button
        type='button'
        aria-describedby='Synth Texture Change Button'
        sx={buttonStyle}
        onClick={handleSynthTextureButtonClick}
      >
        Change Synth Texture
      </Button>

      <Popper
        id='synthTextureChanger'
        open={open}
        anchorEl={anchorEl}
        placement='bottom'
      >
        <Paper className={styles.textureOptionContainer}>
          {synthTextures.map((texture) => {
            return (
              <Button
                key={texture}
                sx={secondaryButtonStyle}
                type='button'
                onClick={() => handleTextureClick(texture.toLowerCase())}
              >
                {texture}
              </Button>
            )
          })}
        </Paper>
      </Popper>
    </div>
  )
}

const buttonStyle = {
  color: 'var(--blue)',
  border: '1px solid var(--blue)',
  fontFamily: 'var(--header-font)',
  background: 'var(--yellow)',
  marginBottom: '1rem',
  '&:hover': {
    backgroundColor: 'var(--orange)',
    cursor: 'pointer'
  }
}

const secondaryButtonStyle = {
  backgroundColor: 'var(--yellow)',
  fontFamily: 'var(--secondary-font)',
  color: 'var(--blue)',
  padding: '.25rem',
  border: '1px solid var(--blue)',
  cursor: 'pointer',
  borderRadius: '3px',
  '&:hover': {
    backgroundColor: 'var(--orange)'
  }
}

export default TextureChanger
