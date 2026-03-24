import styles from './DecorativeShapes.module.css'

interface DecorativeShapesProps {
  variant: 'panel' | 'mobile'
}

const DOTS = Array.from({ length: 9 }, (_, i) => i)

export function DecorativeShapes({ variant }: DecorativeShapesProps) {
  return (
    <div className={`${styles.shapes} ${styles[variant]}`} aria-hidden="true">
      <span className={`${styles.shape} ${styles.euro}`}>€</span>
      <span className={`${styles.shape} ${styles.percent}`}>%</span>
      <div className={`${styles.shape} ${styles.rectTop}`} />
      <div className={`${styles.shape} ${styles.circleBottom}`} />
      <div className={`${styles.shape} ${styles.diamondMid}`} />
      <div className={styles.dotGrid}>
        {DOTS.map((i) => <div key={i} className={styles.dot} />)}
      </div>
      <div className={`${styles.shape} ${styles.ring}`} />
    </div>
  )
}
