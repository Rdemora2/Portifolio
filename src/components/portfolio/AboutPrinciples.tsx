import { getTranslations } from "next-intl/server"

import { ScrollReveal } from "@/components/shared/ScrollReveal"

import { SectionHeading } from "./SectionHeading"
import styles from "./AboutPrinciples.module.css"

const principles = ["production", "clarity", "evidence", "proximity"] as const

export async function AboutPrinciples() {
  const t = await getTranslations("PortfolioPages.about")

  return (
    <section id="principles" className={styles.section}>
      <div className={styles.container}>
        <ScrollReveal>
          <SectionHeading
            eyebrow={t("principlesEyebrow")}
            title={t("principlesTitle")}
          />
        </ScrollReveal>
        <div className={styles.grid}>
          {principles.map((principle, index) => (
            <ScrollReveal
              key={principle}
              delay={index * 0.06}
              className={styles.card}
            >
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className={styles.title}>
                {t(`principles.${principle}.title`)}
              </h3>
              <p className={styles.description}>
                {t(`principles.${principle}.description`)}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
