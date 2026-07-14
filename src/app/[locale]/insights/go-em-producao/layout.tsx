import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getGoProductionArticle } from "@/content/insights/go-em-producao"
import { getDocumentLanguage, isLocale } from "@/i18n.config"
import { AUTHOR_NAME, getLocalizedUrl, SITE_NAME, SITE_URL } from "@/lib/constants"

const articlePath = "/insights/go-em-producao"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: candidate } = await params

  if (!isLocale(candidate)) notFound()

  const locale = candidate
  const article = getGoProductionArticle(locale)
  const canonical = getLocalizedUrl(locale, articlePath)
  const socialImage = `${SITE_URL}/opengraph-image/article/${locale}`
  const openGraphLocale = getDocumentLanguage(locale).replace("-", "_")

  return {
    title: article.seo.title,
    description: article.seo.description,
    authors: [{ name: AUTHOR_NAME, url: getLocalizedUrl(locale) }],
    alternates: {
      canonical,
      languages: {
        [getDocumentLanguage("pt")]: getLocalizedUrl("pt", articlePath),
        [getDocumentLanguage("en")]: getLocalizedUrl("en", articlePath),
        [getDocumentLanguage("es")]: getLocalizedUrl("es", articlePath),
        "x-default": getLocalizedUrl("pt", articlePath),
      },
    },
    openGraph: {
      title: `${article.seo.title} | ${SITE_NAME}`,
      description: article.seo.description,
      type: "article",
      locale: openGraphLocale,
      url: canonical,
      siteName: SITE_NAME,
      publishedTime: article.publishedDate,
      modifiedTime: article.publishedDate,
      authors: [AUTHOR_NAME],
      images: [{ url: socialImage, width: 1200, height: 630, alt: article.seo.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.seo.title} | ${SITE_NAME}`,
      description: article.seo.description,
      images: [{ url: socialImage, alt: article.seo.title }],
    },
  }
}

export default function InsightLayout({ children }: { children: React.ReactNode }) {
  return children
}
