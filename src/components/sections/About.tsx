import { useTranslations } from "next-intl"

import { ScrollReveal } from "@/components/shared/ScrollReveal"

import { AboutBackground } from "./AboutBackground"
import styles from "./About.module.css"

export function About() {
  const t = useTranslations("About")
  const statsT = useTranslations("Stats")

  const stats = [
    { label: statsT("yearsOfExperience"), value: "4+" },
    { label: statsT("projectsDelivered"), value: "10+" },
    { label: statsT("countries"), value: "2" },
    { label: statsT("usersImpacted"), value: "100k+" },
  ]

  return (
    <section id="about" className={styles.section}>
      <AboutBackground />
      <div className={styles.container}>
        <ScrollReveal className={styles.eyebrowWrap}>
          <p className={styles.eyebrow}>{t("title")}</p>
        </ScrollReveal>

        <div className={styles.layout}>
          <div className={styles.statement}>
            <ScrollReveal animation="title">
              <h2 className={styles.title}>{t("mainTitle")}</h2>
            </ScrollReveal>

            <div className={styles.copy}>
              <ScrollReveal delay={0.12}>
                <p>{t("bio")}</p>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <p>{t("bioExtended")}</p>
              </ScrollReveal>
            </div>
          </div>

          <ScrollReveal animation="slide-right" delay={0.16} className={styles.statsWrap}>
            <dl className={styles.stats}>
              {stats.map((stat, index) => (
                <div key={stat.label} className={styles.stat}>
                  <span className={styles.statIndex} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
