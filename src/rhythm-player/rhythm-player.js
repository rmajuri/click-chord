import React from 'react'
import { ArrowBack, ArrowForward, PlayArrow, Pause } from '@material-ui/icons'
import styles from './rhythm-player.module.css'

const RhythmPlayer = ({ rhythmPlaying, back, start, pause, forward }) => {

    const trackPlayOption = rhythmPlaying ? <Pause onClick={pause} fontSize={'large'} /> : <PlayArrow onClick={start} fontSize={'large'} /> 

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <ArrowBack onClick={back} fontSize={'large'} />
                {trackPlayOption}
                <ArrowForward onClick={forward} fontSize={'large'} />
            </div>
        </div>
    )
}

export default RhythmPlayer