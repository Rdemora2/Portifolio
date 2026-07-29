import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"

import styles from "@/components/portfolio/Portfolio.module.css"
import { PageIntro } from "@/components/portfolio/PageIntro"
import { ProjectGrid } from "@/components/portfolio/ProjectGrid"
import { SectionHeading } from "@/components/portfolio/SectionHeading"
import { WebsiteShowcase } from "@/components/sections/WebsiteShowcase"
import { isLocale } from "@/i18n.config"
import { buildPageMetadata } from "@/lib/page-metadata"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: candidate } = await params
  if (!isLocale(candidate)) notFound()

  const t = await getTranslations({
    locale: candidate,
    namespace: "PortfolioPages.work",
  })

  return buildPageMetadata({
    locale: candidate,
    pathname: "/work",
    title: t("metaTitle"),
    description: t("metaDescription"),
  })
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: candidate } = await params
  if (!isLocale(candidate)) notFound()

  setRequestLocale(candidate)
  const t = await getTranslations("PortfolioPages.work")

  return (
    <main id="main-content">
      <PageIntro
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />

      <section className={styles.section} data-work-cases>
        <div className={styles.container}>
          <SectionHeading
            eyebrow={t("casesEyebrow")}
            title={t("casesTitle")}
            description={t("casesDescription")}
            split
          />
          <ProjectGrid />
        </div>
      </section>

      <WebsiteShowcase variant="lab" />
    </main>
  )
}
