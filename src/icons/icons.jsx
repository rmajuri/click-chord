import styles from './icons.module.css'

const Icon = ({ className, children, ...props }) => (
  <svg
    viewBox='0 0 24 24'
    focusable='false'
    aria-hidden='true'
    className={className ? `${styles.icon} ${className}` : styles.icon}
    {...props}
  >
    {children}
  </svg>
)

export const KickIcon = (props) => (
  <Icon {...props}>
    <circle cx='12' cy='12' r='8' />
  </Icon>
)

export const HatIcon = (props) => (
  <Icon {...props}>
    <path d='M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7a.996.996 0 0 0-1.41 0c-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4' />
  </Icon>
)

export const SnareIcon = (props) => (
  <Icon {...props}>
    <path d='M8 6h8c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2' />
  </Icon>
)

export const ArrowUpIcon = (props) => (
  <Icon {...props}>
    <path d='M13 19V7.83l4.88 4.88c.39.39 1.03.39 1.42 0s.39-1.02 0-1.41l-6.59-6.59a.996.996 0 0 0-1.41 0l-6.6 6.58c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0L11 7.83V19c0 .55.45 1 1 1s1-.45 1-1' />
  </Icon>
)

export const ArrowDownIcon = (props) => (
  <Icon {...props}>
    <path d='M11 5v11.17l-4.88-4.88c-.39-.39-1.03-.39-1.42 0s-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0l6.59-6.59c.39-.39.39-1.02 0-1.41a.996.996 0 0 0-1.41 0L13 16.17V5c0-.55-.45-1-1-1s-1 .45-1 1' />
  </Icon>
)

export const MicIcon = (props) => (
  <Icon {...props}>
    <path d='M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3m5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72z' />
  </Icon>
)
