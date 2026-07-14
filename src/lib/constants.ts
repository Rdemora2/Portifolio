import type { TechCategory } from "@/types"
import type { Locale } from "@/i18n.config"
import { defaultLocale } from "@/i18n.config"

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

export function getLocalizedPath(locale: Locale, pathname = ""): string {
  const normalizedPath = pathname && pathname !== "/"
    ? `/${pathname.replace(/^\/+|\/+$/g, "")}`
    : ""
  const localePrefix = locale === defaultLocale ? "" : `/${locale}`

  return `${localePrefix}${normalizedPath}` || "/"
}

export function getLocalizedUrl(locale: Locale, pathname = ""): string {
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
