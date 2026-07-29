import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { PageIntro } from "@/components/portfolio/PageIntro"
import { Experience } from "@/components/sections/Experience"
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
    namespace: "PortfolioPages.experience",
  })

  return buildPageMetadata({
    locale: candidate,
    pathname: "/experience",
    title: t("metaTitle"),
    description: t("metaDescription"),
  })
}

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: candidate } = await params
  if (!isLocale(candidate)) notFound()

  setRequestLocale(candidate)
  const t = await getTranslations("PortfolioPages.experience")

  return (
    <main id="main-content">
      <PageIntro
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />
      <Experience />
    </main>
  )
}
