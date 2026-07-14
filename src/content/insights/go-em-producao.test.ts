import { describe, expect, it } from "vitest"

import { locales } from "@/i18n.config"
import { getGoProductionArticle } from "./go-em-producao"

describe("Go in production article", () => {
  it("publishes a complete localized edition for every supported locale", () => {
    const editions = locales.map((locale) => getGoProductionArticle(locale))
    const expectedSectionIds = getGoProductionArticle("pt").sections.map(
      (section) => section.id,
    )

    for (const edition of editions) {
      expect(edition.title).toBeTruthy()
      expect(edition.seo.description.length).toBeGreaterThan(80)
      expect(edition.metrics).toHaveLength(4)
      expect(edition.sections.map((section) => section.id)).toEqual(expectedSectionIds)
      expect(edition.sections.every((section) => section.items.length >= 4)).toBe(true)
    }
  })

  it("does not reuse Portuguese titles in translated editions", () => {
    const pt = getGoProductionArticle("pt")
    const en = getGoProductionArticle("en")
    const es = getGoProductionArticle("es")

    expect(en.subtitle).not.toBe(pt.subtitle)
    expect(es.subtitle).not.toBe(pt.subtitle)
    expect(en.sections[0]?.title).not.toBe(pt.sections[0]?.title)
    expect(es.sections[0]?.title).not.toBe(pt.sections[0]?.title)
  })
})
