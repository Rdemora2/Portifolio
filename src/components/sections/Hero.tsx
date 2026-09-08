import { getTranslations } from "next-intl/server"
import { personalInfo } from "@/data/portfolio"
import { HeroClientWrapper } from "./HeroClient"
import { Link } from "@/navigation"
import styles from "./Hero.module.css"

export async function Hero() {
  const t = await getTranslations("Hero")
  const [firstName, ...lastNames] = personalInfo.name.split(" ")

  return (
    <HeroClientWrapper motionLabels={{ pause: t("pauseMotion"), resume: t("resumeMotion") }}>
      <div className={`relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${styles.layout}`}>
        <div className={`hero-card-enter glass-card ${styles.card}`}>
          <p className={`hero-title hero-copy-enter ${styles.eyebrow}`}>
            <span aria-hidden="true" />{t("title")}
          </p>
          <h1 className={`hero-name hero-name-enter ${styles.name}`} aria-label={personalInfo.name}>
            {firstName}{" "}<span>{lastNames.join(" ")}</span>
          </h1>
          <p className={`hero-copy-enter ${styles.statement}`}>{t("statement")}</p>
          <p className={`hero-subtitle hero-copy-enter ${styles.stack}`}>{t("subtitle")}</p>
          <div className={`hero-cta hero-actions-enter ${styles.actions}`}>
            <Link href="/work" className={styles.primary}>{t("viewProjects")}<span aria-hidden="true">↗</span></Link>
            <Link href="/experience" className={styles.secondary}>{t("viewExperience")}<span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <aside className={styles.evidence} aria-label={t("evidenceLabel")}>
          <p className={styles.evidenceKicker}>{t("evidenceLabel")}</p>
          <p className={styles.evidenceNumber}>20M<span>+</span></p>
          <p className={styles.evidenceCaption}>{t("requests")}</p>
          <div className={styles.evidenceDetails}>
            <p><strong>6 ms</strong><span>{t("latency")}</span></p>
            <p><strong>92%</strong><span>{t("cache")}</span></p>
          </div>
          <Link href={{ pathname: "/work/[slug]", params: { slug: "hospital-sirio-libanes" } }} className={styles.evidenceLink}>
            Hospital Sírio-Libanês<span aria-hidden="true">↗</span>
          </Link>
        </aside>
      </div>
    </HeroClientWrapper>
  )
}
