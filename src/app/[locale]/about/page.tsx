import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { AboutPrinciples } from "@/components/portfolio/AboutPrinciples"
import { PageIntro } from "@/components/portfolio/PageIntro"
import { About } from "@/components/sections/About"
import { TechStack } from "@/components/sections/TechStack"
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
    namespace: "PortfolioPages.about",
  })

  return buildPageMetadata({
    locale: candidate,
    pathname: "/about",
    title: t("metaTitle"),
    description: t("metaDescription"),
  })
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: candidate } = await params
  if (!isLocale(candidate)) notFound()

  setRequestLocale(candidate)
  const t = await getTranslations("PortfolioPages.about")

  return (
    <main id="main-content">
      <PageIntro
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={`${t("description")} ${t("bridge")}`}
      />
      <About />
      <AboutPrinciples />
      <div id="stack">
        <TechStack />
      </div>
    </main>
  )
}
