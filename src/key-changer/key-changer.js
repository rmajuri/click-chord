import React from 'react'
import styles from './key-changer.module.css'
import { ArrowUpward, ArrowDownward } from '@material-ui/icons'

const KeyChanger = ({ currentKey, changedKeyHandler }) => {
    return (
        <div className={styles.currentKeyContainer}>
            <ArrowUpward
                fontSize={"large"}
                className={styles.arrowIcon}
                onClick={() => changedKeyHandler('up')}
            />
            <h4 className={styles.currentKeyText}>{currentKey}</h4>
            <ArrowDownward
                fontSize={"large"}
                className={styles.arrowIcon}
                onClick={() => changedKeyHandler('down')}
            />
        </div>
    )
}

export default KeyChanger