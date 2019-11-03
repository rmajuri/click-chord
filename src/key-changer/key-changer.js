import React from 'react'
import styles from './key-changer.module.css'
import { ArrowUpwardRounded, ArrowDownwardRounded } from '@material-ui/icons'

const KeyChanger = ({ currentKey, changedKeyHandler }) => {
    return (
        <div className={styles.currentKeyContainer}>
            <ArrowUpwardRounded
                fontSize={"large"}
                className={styles.arrowIcon}
                onClick={() => changedKeyHandler('up')}
            />
            <h4 className={styles.currentKeyText}>{currentKey}</h4>
            <ArrowDownwardRounded
                fontSize={"large"}
                className={styles.arrowIcon}
                onClick={() => changedKeyHandler('down')}
            />
        </div>
    )
}

export default KeyChanger