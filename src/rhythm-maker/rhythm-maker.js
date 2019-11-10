import React, { useState, useEffect } from 'react'
import { ClearRounded, StopRounded, FiberManualRecordRounded } from '@material-ui/icons'
import styles from './rhythm-maker.module.css'
import { makeStyles } from '@material-ui/core/styles'
import { Paper } from '@material-ui/core'

const useStyles = makeStyles({
    root: {
        background: 'var(--teal)'
    }
})

const RhythmMaker = ({
    stopSequencer,
    startSequencer,
    changeBpm
}) => {

    const [timeCount, setTimeCount] = useState(8)
    const [bpm, setBpm] = useState(95)

    const classes = useStyles()

    useEffect(() => {
        startSequencer(timeCount)

        return stopSequencer()
    })

    const toggleCheckedColor = targetedInput => {
        const clickedDrum = document.getElementById(`${targetedInput}`)
        const drumClassList = [...clickedDrum.classList]
        if (drumClassList.includes('iconParentPlaying')) {
            clickedDrum.classList.remove('iconParentPlaying')
        } else {
            clickedDrum.classList.add('iconParentPlaying')
        }
    }

    const changeTimeCount = count => {
        if (!!count && count !== timeCount) {
            stopSequencer()
            setTimeCount(count)
            startSequencer(count)
        }
    }

    const handleBpmChange = event => {
        if (Number.isInteger(event.target.value)) {
            setBpm(event.target.value)
            changeBpm(bpm)
        }
    }

    const drumSteps = new Array(timeCount).fill('_')

    const kicks = drumSteps.map((step, i) => {
        return (
            <div className='iconParent'
                key={`kickParent${i}`}
                id={`kickParent${i}`}
                onClick={() => toggleCheckedColor(`kickParent${i}`)}
            >
                <FiberManualRecordRounded
                    fontSize={'large'}
                    key={`kick${i}`}
                    id={`kick${i}`}
                    className={styles.drumCheckbox}
                />
            </div>
        )
    })

    const hiHats = drumSteps.map((step, i) => {
        return (
            <div className='iconParent'
                key={`hatParent${i}`}
                id={`hatParent${i}`}
                onClick={() => toggleCheckedColor(`hatParent${i}`)}
            >
                <ClearRounded
                    fontSize={'large'}
                    key={`hat${i}`}
                    id={`hat${i}`}
                    className={styles.drumCheckbox}
                    onClick={() => toggleCheckedColor(`hat${i}`)}
                />
            </div>
        )
    })

    const snares = drumSteps.map((step, i) => {
        return (
            <div className='iconParent'
                key={`snareParent${i}`}
                id={`snareParent${i}`}
                onClick={() => toggleCheckedColor(`snareParent${i}`)}
            >
                <StopRounded
                    fontSize={'large'}
                    key={`snare${i}`}
                    id={`snare${i}`}
                    className={styles.drumCheckbox}
                />
            </div>
        )
    })


    return (
        <Paper className={[styles.container, classes.root].join(' ')}>
            {/* <div className={styles.controls}>
                <ArrowBack onClick={back} fontSize={'large'} className={styles.playerControlsIcon} />
                {trackPlayOption}
                <ArrowForward onClick={forward} fontSize={'large'} className={styles.playerControlsIcon} />
            </div> */}
            <div className={styles.drumSection}>
                <div className={styles.drumContainer}>
                    <p className={styles.drumTitle}>Kick</p>
                    <div className={styles.drums}>
                        {kicks}
                    </div>
                </div>
                <div className={styles.drumContainer}>
                    <p className={styles.drumTitle}>Hi-Hat</p>
                    <div className={styles.drums}>
                        {hiHats}
                    </div>
                </div>
                <div className={styles.drumContainer}>
                    <p className={styles.drumTitle}>Snare</p>
                    <div className={styles.drums}>
                        {snares}
                    </div>
                </div>
            </div>
        </Paper>
    )
}

export default RhythmMaker