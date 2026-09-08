import styles from "./PageIntro.module.css"

type PageIntroProps = {
  eyebrow: string
  title: string
  description: string
  navigation?: {
    label: string
    links: readonly { href: `#${string}`; label: string }[]
  }
}

export function PageIntro({ eyebrow, title, description, navigation }: PageIntroProps) {
  return (
    <header className={styles.pageHero} data-page-hero>
      <div className={styles.pageHeroInner}>
        <p className={styles.heroMarker}>{eyebrow}</p>
        <h1 className={styles.pageTitle}>{title}</h1>
        <p className={styles.pageLead}>{description}</p>
        {navigation && (
          <nav className={styles.navigation} aria-label={navigation.label}>
            {navigation.links.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}<span aria-hidden="true">↓</span>
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
