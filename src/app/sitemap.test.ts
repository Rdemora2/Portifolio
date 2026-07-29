import { describe, expect, it } from "vitest"

import { projects } from "@/data/portfolio"
import { locales } from "@/i18n.config"
import { SITE_URL } from "@/lib/constants"

import sitemap from "./sitemap"

describe("portfolio sitemap", () => {
  const entries = sitemap()

  it("publishes every index, article, and case in each locale", () => {
    const pagesPerLocale = 7 + projects.length

    expect(entries).toHaveLength(locales.length * pagesPerLocale)
    expect(new Set(entries.map((entry) => entry.url)).size).toBe(entries.length)
  })

  it.each([
    `${SITE_URL}/projetos`,
    `${SITE_URL}/en/work`,
    `${SITE_URL}/es/proyectos`,
    `${SITE_URL}/projetos/hospital-sirio-libanes`,
    `${SITE_URL}/en/work/hospital-sirio-libanes`,
    `${SITE_URL}/es/proyectos/hospital-sirio-libanes`,
    `${SITE_URL}/en/insights/go-in-production`,
    `${SITE_URL}/es/insights/go-en-produccion`,
  ])("contains %s", (url) => {
    expect(entries.some((entry) => entry.url === url)).toBe(true)
  })

  it("uses complete regional alternates and x-default", () => {
    for (const entry of entries) {
      expect(Object.keys(entry.alternates?.languages ?? {}).sort()).toEqual(
        ["en-US", "es-MX", "pt-BR", "x-default"].sort(),
      )
      expect(entry.alternates?.languages?.["x-default"]).toMatch(
        new RegExp(`^${SITE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
      )
    }
  })
})
