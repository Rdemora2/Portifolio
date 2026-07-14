import type { MetadataRoute } from "next"
import { getDocumentLanguage, locales } from "@/i18n.config"
import { getLocalizedUrl } from "@/lib/constants"

const articlePath = "/insights/go-em-producao"

const homeAlternates = {
  [getDocumentLanguage("pt")]: getLocalizedUrl("pt"),
  [getDocumentLanguage("en")]: getLocalizedUrl("en"),
  [getDocumentLanguage("es")]: getLocalizedUrl("es"),
  "x-default": getLocalizedUrl("pt"),
}

const articleAlternates = {
  [getDocumentLanguage("pt")]: getLocalizedUrl("pt", articlePath),
  [getDocumentLanguage("en")]: getLocalizedUrl("en", articlePath),
  [getDocumentLanguage("es")]: getLocalizedUrl("es", articlePath),
  "x-default": getLocalizedUrl("pt", articlePath),
}

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) => [
    {
      url: getLocalizedUrl(locale),
      lastModified: "2026-07-13",
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages: homeAlternates },
    },
    {
      url: getLocalizedUrl(locale, articlePath),
      lastModified: "2025-03-20",
      changeFrequency: "yearly",
      priority: 0.7,
      alternates: { languages: articleAlternates },
    },
  ])
}
