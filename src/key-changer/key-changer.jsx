import { ArrowUpIcon, ArrowDownIcon } from '../icons/icons'
import styles from './key-changer.module.css'

const KeyChanger = ({ currentKey, changedKeyHandler }) => {
  return (
    <div className={styles.currentKeyContainer}>
      <ArrowUpIcon
        className={styles.arrowIcon}
        onClick={() => changedKeyHandler('up')}
      />

      <h4 className={styles.currentKeyText}>{currentKey}</h4>

      <ArrowDownIcon
        className={styles.arrowIcon}
        onClick={() => changedKeyHandler('down')}
      />
    </div>
  )
}

export default KeyChanger
