import styles from "./Portfolio.module.css"

type SectionHeadingProps = {
  eyebrow: string
  title: string
  description?: string
  split?: boolean
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  split = false,
}: SectionHeadingProps) {
  return (
    <div
      className={split ? styles.sectionHeaderSplit : styles.sectionHeader}
    >
      <div>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      {description ? (
        <p className={styles.sectionLead}>{description}</p>
      ) : null}
    </div>
  )
}
