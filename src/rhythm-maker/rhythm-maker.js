import React from 'react'
import { ArrowBack, ArrowForward, PlayArrow, Pause } from '@material-ui/icons'
import styles from './rhythm-maker.module.css'
import { makeStyles } from '@material-ui/core/styles'
import { Paper } from '@material-ui/core'

const useStyles = makeStyles({
    root: {
        background: 'var(--teal)'
    }
})

const RhythmMaker = ({ rhythmPlaying, back, start, pause, forward }) => {

    const classes = useStyles()
    const trackPlayOption = rhythmPlaying ? <Pause onClick={pause} fontSize={'large'} className={styles.playerControlsIcon} />
        : <PlayArrow onClick={start} fontSize={'large'} className={styles.playerControlsIcon} />

    return (
        <Paper className={[styles.container, classes.root].join(' ')}>
            <div className={styles.controls}>
                <ArrowBack onClick={back} fontSize={'large'} className={styles.playerControlsIcon} />
                {trackPlayOption}
                <ArrowForward onClick={forward} fontSize={'large'} className={styles.playerControlsIcon} />
            </div>
        </Paper>
    )
}

export default RhythmMaker