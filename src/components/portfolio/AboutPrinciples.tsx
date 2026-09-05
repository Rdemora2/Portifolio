import { getTranslations } from "next-intl/server"

import { ScrollReveal } from "@/components/shared/ScrollReveal"

import { SectionHeading } from "./SectionHeading"
import styles from "./Portfolio.module.css"

const principles = ["production", "clarity", "evidence", "proximity"] as const

export async function AboutPrinciples() {
  const t = await getTranslations("PortfolioPages.about")

  return (
    <section className={styles.sectionGrid}>
      <div className={styles.container}>
        <ScrollReveal>
          <SectionHeading
            eyebrow={t("principlesEyebrow")}
            title={t("principlesTitle")}
          />
        </ScrollReveal>
        <div className={styles.principlesGrid}>
          {principles.map((principle, index) => (
            <ScrollReveal
              key={principle}
              delay={index * 0.06}
              className={styles.principleCard}
            >
              <span className={styles.practiceNumber} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className={`${styles.principleTitle} mt-8`}>
                {t(`principles.${principle}.title`)}
              </h3>
              <p className={styles.principleDescription}>
                {t(`principles.${principle}.description`)}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
