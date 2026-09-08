import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { PageIntro } from "@/components/portfolio/PageIntro"
import styles from "./Privacy.module.css"

import { personalInfo } from "@/data/portfolio"
import { isLocale } from "@/i18n.config"
import { buildPageMetadata } from "@/lib/page-metadata"

const sections = ["responsibility", "contact", "retention", "services", "measurement", "preferences", "rights", "external"] as const

export async function generateMetadata({ params }: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = await getTranslations({ locale, namespace: "Privacy" })
  return buildPageMetadata({ locale, pathname: "/privacy", title: t("title"), description: t("description") })
}

export default async function PrivacyPage({ params }: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations("Privacy")
  const email = personalInfo.contacts.find((contact) => contact.type === "email")

  return (
    <main id="main-content">
      <PageIntro eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <div className={styles.layout}>
        <aside className={styles.index}>
          <p className={styles.updated}>{t("updated")}</p>
          <nav aria-label={t("contents")}>
            {sections.map((section, index) => (
              <a key={section} href={`#privacy-${section}`}>
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                {t(`${section}.title`)}
              </a>
            ))}
          </nav>
        </aside>
        <div className={styles.content}>
        {sections.map((section) => (
          <section key={section} id={`privacy-${section}`} aria-labelledby={`privacy-${section}-title`}>
            <h2 id={`privacy-${section}-title`} className="mb-3 text-xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>{t(`${section}.title`)}</h2>
            <p className="text-base leading-8 text-[var(--color-text-secondary)]">{t(`${section}.body`)}</p>
            {section === "rights" && email && (
              <a href={email.href} className="mt-3 inline-flex min-h-11 items-center text-[var(--color-signal)] underline underline-offset-4">{t("requestContact")}</a>
            )}
            {section === "measurement" && (
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--color-signal)]">
                <a className="inline-flex min-h-11 items-center underline underline-offset-4" href="https://vercel.com/docs/analytics/privacy-policy">Vercel Web Analytics</a>
                <a className="inline-flex min-h-11 items-center underline underline-offset-4" href="https://vercel.com/docs/speed-insights/privacy-policy">Vercel Speed Insights</a>
              </div>
            )}
          </section>
        ))}
        </div>
      </div>
    </main>
  )
}
