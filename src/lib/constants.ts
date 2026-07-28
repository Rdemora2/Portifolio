import type { TechCategory } from "@/types"
import type { Locale } from "@/i18n.config"
import { defaultLocale } from "@/i18n.config"
import { pathnames } from "@/i18n/routing"

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://robertomoraes.dev"

function normalizeSiteUrl(value: string): string {
  const url = new URL(value)

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('NEXT_PUBLIC_SITE_URL must use http or https')
  }

  return url.origin
}

export const SITE_URL = normalizeSiteUrl(configuredSiteUrl)
export const SITE_NAME = "Roberto Moraes"
export const AUTHOR_NAME = "Roberto Moraes"

export type InternalPathname =
  | "/"
  | "/work"
  | `/work/${string}`
  | "/experience"
  | "/about"
  | "/insights"
  | "/insights/go-em-producao"
  | "/contact"

export function getLocalizedPath(
  locale: Locale,
  pathname: InternalPathname = "/",
): string {
  const projectMatch = pathname.match(/^\/work\/([^/]+)$/)
  const internalPath = projectMatch ? "/work/[slug]" : pathname
  const configuredPath = pathnames[internalPath as keyof typeof pathnames]
  const localizedPattern =
    typeof configuredPath === "string"
      ? configuredPath
      : configuredPath[locale]
  const localizedPath = projectMatch?.[1]
    ? localizedPattern.replace("[slug]", encodeURIComponent(projectMatch[1]))
    : localizedPattern
  const localePrefix = locale === defaultLocale ? "" : `/${locale}`

  if (localizedPath === "/") {
    return localePrefix || "/"
  }

  return `${localePrefix}${localizedPath}`
}

export function getLocalizedUrl(
  locale: Locale,
  pathname: InternalPathname = "/",
): string {
  const path = getLocalizedPath(locale, pathname)
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`
}

export const TECH_CATEGORY_COLORS: Record<TechCategory, string> = {
  cloud: "#6366f1",
  backend: "#00ff88",
  frontend: "#6366f1",
  mobile: "#ff6b35",
  devops: "#4f46e5",
  ai: "#a855f7",
  video: "#f59e0b",
}
