export const siteNavigation = [
  { key: "work", href: "/work" },
  { key: "experience", href: "/experience" },
  { key: "about", href: "/about" },
  { key: "insights", href: "/insights" },
] as const

export type SiteNavigationItem = (typeof siteNavigation)[number]

export const footerNavigation = [
  ...siteNavigation,
  { key: "contact", href: "/contact" },
] as const
