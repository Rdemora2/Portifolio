import { describe, expect, it } from "vitest"

import { getLocalizedPath, getLocalizedUrl, SITE_URL } from "./constants"
import { DEFAULT_SITE_URL, resolveSiteUrl } from "./site"

describe("localized portfolio URLs", () => {
  it("uses the reachable public alias as the default canonical origin", () => {
    expect(resolveSiteUrl(undefined)).toBe(DEFAULT_SITE_URL)
  })

  it("normalizes a configured origin for every public URL consumer", () => {
    expect(resolveSiteUrl("https://portfolio.example.org/path?q=1")).toBe(
      "https://portfolio.example.org",
    )
  })

  it.each([
    ["pt", "/", "/"],
    ["pt", "/work", "/projetos"],
    ["pt", "/experience", "/experiencia"],
    ["pt", "/about", "/sobre"],
    ["pt", "/contact", "/contato"],
    ["en", "/work", "/en/work"],
    ["en", "/experience", "/en/experience"],
    ["en", "/about", "/en/about"],
    ["en", "/contact", "/en/contact"],
    ["es", "/work", "/es/proyectos"],
    ["es", "/experience", "/es/experiencia"],
    ["es", "/about", "/es/sobre"],
    ["es", "/contact", "/es/contacto"],
  ] as const)("maps %s %s to %s", (locale, pathname, expected) => {
    expect(getLocalizedPath(locale, pathname)).toBe(expected)
  })

  it.each([
    ["pt", "/insights/go-em-producao"],
    ["en", "/en/insights/go-in-production"],
    ["es", "/es/insights/go-en-produccion"],
  ] as const)("localizes the article route for %s", (locale, expected) => {
    expect(
      getLocalizedPath(locale, "/insights/go-em-producao"),
    ).toBe(expected)
  })

  it.each([
    ["pt", "/projetos/hospital-sirio-libanes"],
    ["en", "/en/work/hospital-sirio-libanes"],
    ["es", "/es/proyectos/hospital-sirio-libanes"],
  ] as const)("preserves project slugs for %s", (locale, expected) => {
    expect(
      getLocalizedPath(locale, "/work/hospital-sirio-libanes"),
    ).toBe(expected)
  })

  it("builds absolute canonical URLs from the same route contract", () => {
    expect(getLocalizedUrl("pt", "/work")).toBe(`${SITE_URL}/projetos`)
    expect(getLocalizedUrl("en", "/work")).toBe(`${SITE_URL}/en/work`)
  })
})
