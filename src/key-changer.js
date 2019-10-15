import React from 'react'
import styles from './key-changer.module.css'
import { ArrowUpward, ArrowDownward } from '@material-ui/icons'

const KeyChanger = ({ currentKey }) => {
    return (
        <div className={styles.currentKeyContainer}>
            <ArrowUpward fontSize={"large"} className={styles.arrowIcon} />
            <h4 className={styles.currentKeyText}>C</h4>
            <ArrowDownward fontSize={"large"} className={styles.arrowIcon} />
        </div>
    )
}

export default KeyChanger