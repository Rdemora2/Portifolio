import { notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"

import { ImmersiveArticle } from "@/components/insights/ImmersiveArticle"
import { getGoProductionArticle } from "@/content/insights/go-em-producao"
import { getDocumentLanguage, isLocale } from "@/i18n.config"
import { AUTHOR_NAME, getLocalizedUrl, SITE_URL } from "@/lib/constants"

const articlePath = "/insights/go-em-producao"

export default async function GoEmProducaoPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: candidate } = await params

  if (!isLocale(candidate)) notFound()

  const locale = candidate
  setRequestLocale(locale)

  const article = getGoProductionArticle(locale)
  const documentLanguage = getDocumentLanguage(locale)
  const formattedDate = new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${article.publishedDate}T00:00:00Z`))
  const canonical = getLocalizedUrl(locale, articlePath)
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: article.title,
    description: article.seo.description,
    datePublished: article.publishedDate,
    dateModified: article.publishedDate,
    inLanguage: documentLanguage,
    mainEntityOfPage: canonical,
    image: `${SITE_URL}/opengraph-image/article/${locale}`,
    author: {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: AUTHOR_NAME,
      url: getLocalizedUrl(locale),
    },
  }
  const serializedJsonLd = JSON.stringify(articleJsonLd).replace(/</g, "\\u003c")

  return (
    <ImmersiveArticle
      article={article}
      authorName={AUTHOR_NAME}
      formattedDate={formattedDate}
      structuredData={serializedJsonLd}
    />
  )
}
