import styles from './drawsound.module.css'

const dateFormat = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
})

const Creations = ({ creations, onOpen, onDelete }) => (
  <section className={styles.panel} aria-labelledby='ds-creations'>
    <h2 id='ds-creations' className={styles.sectionTitle}>
      My creations
    </h2>
    <p className={styles.hint}>
      Saved drawings and their songs stay in this browser on this device.
      Nothing is uploaded.
    </p>
    {creations.length ? (
      <ul className={styles.creationList}>
        {creations.map((creation) => (
          <li key={creation.id} className={styles.creation}>
            <img src={creation.thumbnail} alt='' />
            <div className={styles.creationText}>
              <h3>{creation.title}</h3>
              <p className={styles.hint}>
                {dateFormat.format(creation.createdAt)}
              </p>
            </div>
            <div className={styles.creationButtons}>
              <button
                type='button'
                className={styles.button}
                onClick={() => onOpen(creation)}
                aria-label={`Open ${creation.title}`}
              >
                Open
              </button>
              <button
                type='button'
                className={`${styles.button} ${styles.quietButton}`}
                onClick={() => onDelete(creation)}
                aria-label={`Delete ${creation.title}`}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p>Nothing saved yet. Press “Save to my creations” to keep a song.</p>
    )}
  </section>
)

export default Creations
