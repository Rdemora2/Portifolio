import type { Metadata } from "next"

import {
  getDocumentLanguage,
  locales,
  type Locale,
} from "@/i18n.config"
import {
  AUTHOR_NAME,
  getLocalizedUrl,
  type InternalPathname,
  SITE_NAME,
  SITE_URL,
} from "@/lib/constants"

type PageMetadataInput = {
  locale: Locale
  pathname: InternalPathname
  title: string
  description: string
  imagePath?: string
}

export function buildPageMetadata({
  locale,
  pathname,
  title,
  description,
  imagePath = `/opengraph-image/${locale}`,
}: PageMetadataInput): Metadata {
  const canonical = getLocalizedUrl(locale, pathname)
  const image = imagePath.startsWith("http")
    ? imagePath
    : `${SITE_URL}${imagePath}`
  const languageAlternates = Object.fromEntries(
    locales.map((alternateLocale) => [
      getDocumentLanguage(alternateLocale),
      getLocalizedUrl(alternateLocale, pathname),
    ]),
  )

  return {
    title,
    description,
    authors: [{ name: AUTHOR_NAME, url: getLocalizedUrl(locale) }],
    alternates: {
      canonical,
      languages: {
        ...languageAlternates,
        "x-default": getLocalizedUrl("pt", pathname),
      },
    },
    openGraph: {
      type: "website",
      locale: getDocumentLanguage(locale).replace("-", "_"),
      title: `${title} | ${SITE_NAME}`,
      description,
      siteName: SITE_NAME,
      url: canonical,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [{ url: image, alt: title }],
    },
  }
}
