import styles from "./Portfolio.module.css"

type PageIntroProps = {
  eyebrow: string
  title: string
  description: string
  meta?: readonly string[]
}

export function PageIntro({
  eyebrow,
  title,
  description,
  meta = [],
}: PageIntroProps) {
  return (
    <header className={styles.pageHero}>
      <div className={styles.pageHeroInner}>
        <p className={styles.heroMarker}>{eyebrow}</p>
        <h1 className={styles.pageTitle}>{title}</h1>
        <p className={styles.pageLead}>{description}</p>
        {meta.length > 0 ? (
          <div className={styles.heroMeta} aria-label={eyebrow}>
            {meta.map((item) => (
              <span key={item} className={styles.metaChip}>
                {item}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  )
}
