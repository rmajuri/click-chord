import React from 'react'
import styles from './key-changer.module.css'
import { ArrowUpwardRounded, ArrowDownwardRounded } from '@material-ui/icons'
import { Typography } from '@material-ui/core'

const KeyChanger = ({ currentKey, changedKeyHandler }) => {
    return (
        <div className={styles.currentKeyContainer}>
            <ArrowUpwardRounded
                fontSize={"large"}
                className={styles.arrowIcon}
                onClick={() => changedKeyHandler('up')}
            />
            <Typography>
                <h4 className={styles.currentKeyText}>{currentKey}</h4>
            </Typography>
            <ArrowDownwardRounded
                fontSize={"large"}
                className={styles.arrowIcon}
                onClick={() => changedKeyHandler('down')}
            />
        </div>
    )
}

export default KeyChanger