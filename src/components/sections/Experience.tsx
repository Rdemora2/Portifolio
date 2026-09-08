import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { experience } from "@/data/portfolio"
import { useTranslations } from "next-intl"

import styles from "./Experience.module.css"
import { ExperienceTimelineLine } from "./ExperienceTimelineLine"

export function Experience() {
  const t = useTranslations("Experience")
  const page = useTranslations("PortfolioPages.experience")

  return (
    <section id="experience" className={styles.section}>
      <div className={styles.container}>
        <ScrollReveal className={styles.heading}>
          <p className={styles.eyebrow}>{t("title_small")}</p>
          <h2 className={styles.title}>{t("title")}</h2>
        </ScrollReveal>

        <div className={styles.timeline}>
          <ExperienceTimelineLine />
          <ol className={styles.list} data-experience-list>
            {experience.map((entry, index) => {
              const rawHighlights = t.raw(`items.${entry.id}.highlights`)
              const highlights = Array.isArray(rawHighlights)
                ? (rawHighlights as string[])
                : []
              const isValiant = entry.id.startsWith("valiant-")

              return (
                <ScrollReveal
                  key={entry.id}
                  as="li"
                  animation="card"
                  delay={Math.min(index * 0.04, 0.16)}
                  className={styles.item}
                >
                  <article
                    id={`experience-${entry.id}`}
                    aria-labelledby={`experience-${entry.id}-title`}
                    className={styles.entry}
                    data-experience-entry
                    data-company-group={isValiant ? "valiant" : undefined}
                  >
                    <div className={styles.railMeta}>
                      <span className={styles.index} aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <time className={styles.period}>
                        {t(`items.${entry.id}.period`)}
                      </time>
                    </div>

                    <span className={styles.node} aria-hidden="true" />

                    <div
                      className={styles.card}
                      data-experience-card
                      data-experience-side="right"
                    >
                      {index === 0 ? (
                        <p
                          className={styles.progression}
                          data-company-progression
                        >
                          {page("progression")}
                        </p>
                      ) : null}

                      <header className={styles.cardHeader}>
                        <div>
                          <p
                            className={styles.company}
                            data-experience-company
                          >
                            {t(`items.${entry.id}.company`)}
                          </p>
                          <h3
                            id={`experience-${entry.id}-title`}
                            className={styles.role}
                          >
                            {t(`items.${entry.id}.role`)}
                          </h3>
                        </div>
                        {entry.current ? (
                          <span className={styles.current} aria-hidden="true" />
                        ) : null}
                      </header>

                      <p className={styles.description}>
                        {t(`items.${entry.id}.description`)}
                      </p>

                      <ul
                        className={styles.highlights}
                        data-experience-highlights
                      >
                        {highlights.map((highlight) => (
                          <li key={highlight}>{highlight}</li>
                        ))}
                      </ul>

                      <div className={styles.stack}>
                        {entry.stack.map((technology) => (
                          <span key={technology}>{technology}</span>
                        ))}
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
