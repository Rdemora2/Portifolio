import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { HomeSections } from "@/components/portfolio/HomeSections"
import { LegacyHashRouter } from "@/components/portfolio/LegacyHashRouter"
import { Hero } from "@/components/sections/Hero"
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
    namespace: "Metadata",
  })

  return buildPageMetadata({
    locale: candidate,
    pathname: "/",
    title: t("title"),
    description: t("description"),
    absoluteTitle: true,
  })
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: candidate } = await params
  if (!isLocale(candidate)) notFound()
  setRequestLocale(candidate)

  return (
    <main id="main-content" className="home-content relative">
      <LegacyHashRouter />
      <Hero />
      <HomeSections />
    </main>
  )
}
