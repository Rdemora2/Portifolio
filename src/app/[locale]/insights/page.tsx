import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { PageIntro } from "@/components/portfolio/PageIntro"
import { Insights } from "@/components/sections/Insights"
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
    namespace: "PortfolioPages.insights",
  })

  return buildPageMetadata({
    locale: candidate,
    pathname: "/insights",
    title: t("metaTitle"),
    description: t("metaDescription"),
  })
}

export default async function InsightsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: candidate } = await params
  if (!isLocale(candidate)) notFound()

  setRequestLocale(candidate)
  const t = await getTranslations("PortfolioPages.insights")

  return (
    <main id="main-content">
      <PageIntro
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />
      <Insights />
    </main>
  )
}
