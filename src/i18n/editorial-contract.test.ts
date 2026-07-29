import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import en from "@/messages/en.json"
import es from "@/messages/es.json"
import pt from "@/messages/pt.json"

const catalogs = [
  {
    locale: "pt",
    messages: pt,
    forbidden:
      /disponível para novos|open to work|consultoria|oportunidade|budget|orçamento estimado/i,
  },
  {
    locale: "en",
    messages: en,
    forbidden:
      /available for new|open to work|consulting|opportunit(?:y|ies)|estimated budget/i,
  },
  {
    locale: "es",
    messages: es,
    forbidden:
      /disponible para nuevos|open to work|consultoría|oportunidad(?:es)?|presupuesto estimado/i,
  },
] as const

describe("professional positioning contract", () => {
  it.each(catalogs)(
    "keeps $locale profile and contact copy neutral",
    ({ messages, forbidden }) => {
      expect(
        JSON.stringify({
          about: messages.About,
          contact: messages.Contact,
          pages: messages.PortfolioPages,
        }),
      ).not.toMatch(forbidden)
    },
  )

  it.each([
    ["pt", pt],
    ["en", en],
    ["es", es],
  ] as const)(
    "keeps the %s contact contract limited to professional context",
    (_locale, messages) => {
      expect(
        Object.keys(messages.Contact.form.webMcp.parameters),
      ).toEqual(["name", "email", "company", "subject", "message"])
    },
  )

  it("does not publish commercial service structured data", () => {
    const layout = readFileSync(
      join(process.cwd(), "src/app/[locale]/layout.tsx"),
      "utf8",
    )

    expect(layout).not.toMatch(/ProfessionalService|Consulting/)
  })
})
