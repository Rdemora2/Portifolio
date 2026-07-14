import { describe, expect, it } from "vitest"

import { locales } from "@/i18n.config"
import { getGoProductionArticle } from "./go-em-producao"
import { articleSceneKinds } from "./types"

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

  it("keeps the reusable visual narrative aligned with the article structure", () => {
    const editions = locales.map((locale) => getGoProductionArticle(locale))
    const reference = editions[0]

    expect(reference).toBeDefined()
    if (!reference) return

    const referenceSections = reference.sections.map(({ id, visual }) => ({
      id,
      visual,
    }))

    const goProductionSceneKinds = [
      "ingress",
      "boundaries",
      "hot-path",
      "cache-fallback",
      "telemetry",
      "security",
      "recovery",
      "release",
    ]

    expect(reference.sections.map(({ visual }) => visual.kind)).toEqual(
      goProductionSceneKinds,
    )
    expect(
      reference.sections.every(({ visual }) =>
        articleSceneKinds.includes(visual.kind),
      ),
    ).toBe(true)
    expect(new Set(reference.sections.map(({ id }) => id)).size).toBe(
      reference.sections.length,
    )

    for (const edition of editions) {
      expect(
        edition.sections.map(({ id, visual }) => ({ id, visual })),
      ).toEqual(referenceSections)

      for (const { visual } of edition.sections) {
        expect(visual.focusNode).toBeGreaterThanOrEqual(0)
        expect(visual.focusNode).toBeLessThan(edition.architectureNodes.length)

        if (visual.metricIndex !== undefined) {
          expect(visual.metricIndex).toBeGreaterThanOrEqual(0)
          expect(visual.metricIndex).toBeLessThan(edition.metrics.length)
        }
      }
    }
  })

  it("localizes the controls exposed by the immersive experience", () => {
    const pt = getGoProductionArticle("pt")
    const en = getGoProductionArticle("en")
    const es = getGoProductionArticle("es")

    for (const edition of [pt, en, es]) {
      expect(Object.values(edition.experience).every(Boolean)).toBe(true)
    }

    expect(en.experience.scrollLabel).not.toBe(pt.experience.scrollLabel)
    expect(es.experience.scrollLabel).not.toBe(pt.experience.scrollLabel)
    expect(en.experience.progressLabel).not.toBe(pt.experience.progressLabel)
    expect(es.experience.progressLabel).not.toBe(pt.experience.progressLabel)
  })

  it("returns isolated content models that cannot contaminate later requests", () => {
    const first = getGoProductionArticle("en")
    const second = getGoProductionArticle("en")

    expect(first).not.toBe(second)
    expect(first.metrics).not.toBe(second.metrics)
    expect(first.architectureNodes).not.toBe(second.architectureNodes)
    expect(first.sections[0]).not.toBe(second.sections[0])
    expect(first.sections[0]?.items).not.toBe(second.sections[0]?.items)
    expect(first.sections[0]?.visual).not.toBe(second.sections[0]?.visual)

    if (!first.sections[0] || !second.sections[0]) return
    first.sections[0].visual.focusNode = 99
    first.sections[0].items[0] = "mutated"

    expect(second.sections[0].visual.focusNode).toBe(0)
    expect(second.sections[0].items[0]).not.toBe("mutated")
  })
})
