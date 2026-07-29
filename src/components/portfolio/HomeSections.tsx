import { getTranslations } from "next-intl/server"

import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Link } from "@/navigation"

import { ProjectGrid } from "./ProjectGrid"
import { SectionHeading } from "./SectionHeading"
import styles from "./Portfolio.module.css"

const profilePillars = ["endToEnd", "reliability", "leadership"] as const
const practiceAreas = [
  "backend",
  "interfaces",
  "operations",
  "leadership",
] as const
const trajectorySteps = ["buser", "weber", "valiant"] as const

export async function HomeSections() {
  const t = await getTranslations("PortfolioPages.home")

  return (
    <>
      <section className={styles.sectionAlt} data-home-section="profile">
        <div className={styles.container}>
          <div className={styles.profileLayout}>
            <ScrollReveal className={styles.profileStatement}>
              <p className={styles.eyebrow}>{t("profile.eyebrow")}</p>
              <h2 className={styles.sectionTitle}>{t("profile.title")}</h2>
              <p className={`${styles.sectionLead} mt-6`}>
                {t("profile.description")}
              </p>
            </ScrollReveal>

            <div className={styles.pillars}>
              {profilePillars.map((pillar, index) => (
                <ScrollReveal
                  key={pillar}
                  delay={index * 0.07}
                  className={styles.pillar}
                >
                  <span className={styles.pillarIndex}>
                    {t(`profile.pillars.${pillar}.index`)}
                  </span>
                  <div>
                    <h3 className={styles.pillarTitle}>
                      {t(`profile.pillars.${pillar}.title`)}
                    </h3>
                    <p className={styles.pillarDescription}>
                      {t(`profile.pillars.${pillar}.description`)}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} data-home-section="projects">
        <div className={styles.container}>
          <ScrollReveal>
            <SectionHeading
              eyebrow={t("projects.eyebrow")}
              title={t("projects.title")}
              description={t("projects.description")}
              split
            />
          </ScrollReveal>
          <ProjectGrid />
          <ScrollReveal>
            <Link href="/work" className={styles.sectionAction}>
              {t("projects.viewAll")}
              <span aria-hidden="true">↗</span>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <section className={styles.sectionGrid} data-home-section="practice">
        <div className={styles.container}>
          <ScrollReveal>
            <SectionHeading
              eyebrow={t("practice.eyebrow")}
              title={t("practice.title")}
              description={t("practice.description")}
              split
            />
          </ScrollReveal>
          <div className={styles.practiceGrid}>
            {practiceAreas.map((area, index) => (
              <ScrollReveal
                key={area}
                delay={index * 0.06}
                className={styles.practiceItem}
              >
                <span className={styles.practiceNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className={styles.practiceTitle}>
                  {t(`practice.areas.${area}.title`)}
                </h3>
                <p className={styles.practiceDescription}>
                  {t(`practice.areas.${area}.description`)}
                </p>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal>
            <Link href="/about" className={styles.sectionAction}>
              {t("practice.cta")}
              <span aria-hidden="true">↗</span>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <section className={styles.sectionAlt} data-home-section="trajectory">
        <div className={styles.container}>
          <div className={styles.trajectory}>
            <ScrollReveal className={styles.trajectoryIntro}>
              <p className={styles.eyebrow}>{t("trajectory.eyebrow")}</p>
              <h2 className={styles.sectionTitle}>{t("trajectory.title")}</h2>
              <p className={`${styles.sectionLead} mt-6`}>
                {t("trajectory.description")}
              </p>
              <Link href="/experience" className={styles.sectionAction}>
                {t("trajectory.cta")}
                <span aria-hidden="true">↗</span>
              </Link>
            </ScrollReveal>

            <ol className={styles.trajectorySteps}>
              {trajectorySteps.map((step, index) => (
                <ScrollReveal
                  key={step}
                  as="li"
                  delay={index * 0.08}
                  className={styles.trajectoryStep}
                >
                  <span className={styles.trajectoryPeriod}>
                    {t(`trajectory.steps.${step}.period`)}
                  </span>
                  <div>
                    <h3 className={styles.trajectoryTitle}>
                      {t(`trajectory.steps.${step}.title`)}
                    </h3>
                    <p className={styles.trajectoryDescription}>
                      {t(`trajectory.steps.${step}.description`)}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className={styles.section} data-home-section="insight">
        <div className={styles.container}>
          <ScrollReveal className={styles.insightCard}>
            <div className="relative z-10">
              <p className={styles.eyebrow}>{t("insight.eyebrow")}</p>
              <h2 className={styles.sectionTitle}>{t("insight.title")}</h2>
              <p className={`${styles.sectionLead} mt-5`}>
                {t("insight.description")}
              </p>
            </div>
            <Link
              href="/insights/go-em-producao"
              className={`${styles.sectionAction} relative z-10 m-0`}
            >
              {t("insight.cta")}
              <span aria-hidden="true">↗</span>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
