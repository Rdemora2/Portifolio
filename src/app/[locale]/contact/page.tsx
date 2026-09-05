import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { NextIntlClientProvider } from "next-intl"
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server"

import { PageIntro } from "@/components/portfolio/PageIntro"
import { Contact } from "@/components/sections/Contact"
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
    namespace: "PortfolioPages.contact",
  })

  return buildPageMetadata({
    locale: candidate,
    pathname: "/contact",
    title: t("metaTitle"),
    description: t("metaDescription"),
  })
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: candidate } = await params
  if (!isLocale(candidate)) notFound()

  setRequestLocale(candidate)
  const [t, messages] = await Promise.all([
    getTranslations("PortfolioPages.contact"),
    getMessages({ locale: candidate }),
  ])

  return (
    <main id="main-content">
      <PageIntro
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />
      <NextIntlClientProvider
        locale={candidate}
        messages={{ Contact: messages.Contact }}
      >
        <Contact />
      </NextIntlClientProvider>
    </main>
  )
}
