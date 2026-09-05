import type { ComponentProps } from "react"

import type { Link } from "@/navigation"

export const siteNavigation = [
  { key: "work", href: "/work" },
  { key: "experience", href: "/experience" },
  { key: "about", href: "/about" },
  { key: "insights", href: "/insights" },
] as const

export type SiteNavigationItem = (typeof siteNavigation)[number]

export type FooterNavigationItem = {
  key: "work" | "experience" | "about" | "insights" | "contact" | "faq"
  href: ComponentProps<typeof Link>["href"]
}

export const footerNavigation: readonly FooterNavigationItem[] = [
  ...siteNavigation,
  { key: "contact", href: "/contact" },
  { key: "faq", href: { pathname: "/about", hash: "faq" } },
] as const

