import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { PageIntro } from "@/components/portfolio/PageIntro"
import { personalInfo } from "@/data/portfolio"
import { isLocale } from "@/i18n.config"
import { buildPageMetadata } from "@/lib/page-metadata"

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
      <div className="mx-auto max-w-3xl space-y-10 px-5 pb-20 sm:px-8 sm:pb-28">
        <p className="text-sm text-[var(--color-text-muted)]">{t("updated")}</p>
        {(["responsibility", "contact", "retention", "services", "measurement", "preferences", "rights", "external"] as const).map((section) => (
          <section key={section} aria-labelledby={`privacy-${section}`}>
            <h2 id={`privacy-${section}`} className="mb-3 text-xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-display)" }}>{t(`${section}.title`)}</h2>
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
    </main>
  )
}
