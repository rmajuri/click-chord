import React, { useState } from 'react'
import { Popper, Paper, Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import styles from './synth-texture-changer.module.css'

const TextureChanger = ({ handleTextureClick }) => {
  const [anchorEl, setAnhorEl] = useState(null)
  const [synthTextures] = useState(['Square', 'Triangle', 'Sawtooth', 'Sine'])

  const classes = useStyles()

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
        className={classes.root}
        onClick={handleSynthTextureButtonClick}
      >
        Change Synth Texture
      </Button>

      <Popper
        id='synthTextureChanger'
        open={open}
        anchorEl={anchorEl}
        transition
        placement='bottom'
      >
        <Paper className={styles.textureOptionContainer}>
          {synthTextures.map((texture, i) => {
            return (
              <Button
                key={texture}
                className={classes.secondaryButton}
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

const useStyles = makeStyles({
  root: {
    color: 'var(--blue)',
    border: '1px solid var(--blue)',
    fontFamily: 'var(--header-font)',
    background: 'var(--yellow)',
    marginBottom: '1rem',
    '&:hover': {
      backgroundColor: 'var(--orange)',
      cursor: 'pointer'
    }
  },
  secondaryButton: {
    backgroundColor: 'var(--yellow)',
    fontFamily: 'var(--secondary-font)',
    color: 'var(--blue)',
    padding: '.25rem',
    border: `1px solid var(--blue)`,
    cursor: 'pointer',
    borderRadius: '3px',
    '&:hover': {
      backgroundColor: 'var(--orange)'
    }
  }
})

export default TextureChanger
