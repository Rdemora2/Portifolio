import { defineRouting } from "next-intl/routing"

import { locales } from "@/i18n.config"

export const pathnames = {
  "/": "/",
  "/work": {
    pt: "/projetos",
    en: "/work",
    es: "/proyectos",
  },
  "/work/[slug]": {
    pt: "/projetos/[slug]",
    en: "/work/[slug]",
    es: "/proyectos/[slug]",
  },
  "/experience": {
    pt: "/experiencia",
    en: "/experience",
    es: "/experiencia",
  },
  "/about": {
    pt: "/sobre",
    en: "/about",
    es: "/sobre",
  },
  "/insights": "/insights",
  "/insights/go-em-producao": {
    pt: "/insights/go-em-producao",
    en: "/insights/go-in-production",
    es: "/insights/go-en-produccion",
  },
  "/contact": {
    pt: "/contato",
    en: "/contact",
    es: "/contacto",
  },
  "/privacy": {
    pt: "/privacidade",
    en: "/privacy",
    es: "/privacidad",
  },
} as const

export const routing = defineRouting({
  locales,
  defaultLocale: "pt",
  localePrefix: "as-needed",
  localeDetection: true,
  pathnames,
  // Metadata emits canonical, regional hreflang links and x-default from the
  // configured public origin. Avoid a second, request-host-derived Link header
  // that can conflict behind proxies and on local audits.
  alternateLinks: false,
})
