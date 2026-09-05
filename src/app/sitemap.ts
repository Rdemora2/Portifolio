import type { MetadataRoute } from "next"

import { projects } from "@/data/portfolio"
import { getDocumentLanguage, locales } from "@/i18n.config"
import {
  getLocalizedUrl,
  type InternalPathname,
} from "@/lib/constants"

type SitemapPage = {
  pathname: InternalPathname
  lastModified: string
  changeFrequency: NonNullable<
    MetadataRoute.Sitemap[number]["changeFrequency"]
  >
  priority: number
}

const staticPages: SitemapPage[] = [
  {
    pathname: "/",
    lastModified: "2026-07-29",
    changeFrequency: "monthly",
    priority: 1,
  },
  {
    pathname: "/work",
    lastModified: "2026-07-29",
    changeFrequency: "monthly",
    priority: 0.95,
  },
  {
    pathname: "/experience",
    lastModified: "2026-07-29",
    changeFrequency: "monthly",
    priority: 0.88,
  },
  {
    pathname: "/about",
    lastModified: "2026-07-29",
    changeFrequency: "monthly",
    priority: 0.82,
  },
  {
    pathname: "/insights",
    lastModified: "2026-07-29",
    changeFrequency: "monthly",
    priority: 0.82,
  },
  {
    pathname: "/insights/go-em-producao",
    lastModified: "2025-03-20",
    changeFrequency: "yearly",
    priority: 0.78,
  },
  {
    pathname: "/contact",
    lastModified: "2026-07-29",
    changeFrequency: "yearly",
    priority: 0.55,
  },
]

const casePages: SitemapPage[] = projects.map((project) => ({
  pathname: `/work/${project.slug}`,
  lastModified: "2026-07-29",
  changeFrequency: "monthly",
  priority: 0.9,
}))

function languageAlternates(pathname: InternalPathname) {
  return {
    ...Object.fromEntries(
      locales.map((locale) => [
        getDocumentLanguage(locale),
        getLocalizedUrl(locale, pathname),
      ]),
    ),
    "x-default": getLocalizedUrl("pt", pathname),
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [...staticPages, ...casePages].flatMap((page) =>
    locales.map((locale) => ({
      url: getLocalizedUrl(locale, page.pathname),
      lastModified: page.lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: languageAlternates(page.pathname),
      },
    })),
  )
}
