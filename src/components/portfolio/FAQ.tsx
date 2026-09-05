import { getTranslations } from "next-intl/server"

import { ScrollReveal } from "@/components/shared/ScrollReveal"

import styles from "./FAQ.module.css"

const faqKeys = [
  "specialties",
  "languages",
  "scale",
  "fullstack",
  "devops",
  "architecture",
] as const

export async function FAQ() {
  const t = await getTranslations("PortfolioPages.about")

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqKeys.map((key) => ({
      "@type": "Question",
      name: t(`faq.${key}.question`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`faq.${key}.answer`),
      },
    })),
  }
  const serializedFaqSchema = JSON.stringify(faqSchema).replace(/</g, "\\u003c")

  return (
    <section className={styles.faqSection} aria-labelledby="faq-title">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializedFaqSchema }}
      />
      <div className={styles.container}>
        <ScrollReveal className={styles.faqHeader}>
          <p className={styles.eyebrow}>{t("faqEyebrow")}</p>
          <h2 id="faq-title" className={styles.title}>
            {t("faqTitle")}
          </h2>
          <p className={styles.description}>{t("faqDescription")}</p>
        </ScrollReveal>

        <div className={styles.faqList}>
          {faqKeys.map((key, index) => (
            <ScrollReveal key={key} delay={index * 0.05}>
              <details className={styles.faqItem}>
                <summary className={styles.faqSummary}>
                  <span className={styles.questionText}>
                    {t(`faq.${key}.question`)}
                  </span>
                  <svg
                    className={styles.chevronIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <div className={styles.faqContent}>
                  <p className={styles.answerText}>{t(`faq.${key}.answer`)}</p>
                </div>
              </details>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
