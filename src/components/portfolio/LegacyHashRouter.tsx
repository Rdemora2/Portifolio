"use client"

import { useEffect } from "react"
import { useLocale } from "next-intl"

import type { Locale } from "@/i18n.config"
import {
  getLocalizedPath,
  type InternalPathname,
} from "@/lib/constants"

const legacyDestinations: Record<
  string,
  { pathname: InternalPathname; hash?: string }
> = {
  projects: { pathname: "/work" },
  sites: { pathname: "/work", hash: "#web" },
  experience: { pathname: "/experience" },
  about: { pathname: "/about" },
  tech: { pathname: "/about", hash: "#stack" },
  metrics: {
    pathname: "/work/hospital-sirio-libanes",
    hash: "#metrics",
  },
  insights: { pathname: "/insights" },
  contact: { pathname: "/contact" },
}

export function LegacyHashRouter() {
  const locale = useLocale() as Locale

  useEffect(() => {
    const destination = legacyDestinations[window.location.hash.slice(1)]
    if (!destination) return

    const target = `${getLocalizedPath(locale, destination.pathname)}${
      window.location.search
    }${destination.hash ?? ""}`
    window.location.replace(target)
  }, [locale])

  return null
}
