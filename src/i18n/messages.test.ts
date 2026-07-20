import { describe, expect, it } from "vitest"

import en from "@/messages/en.json"
import es from "@/messages/es.json"
import pt from "@/messages/pt.json"
import { websiteExperiences } from "@/data/showcase-sites"

function flattenKeys(value: unknown, prefix = "", output: string[] = []): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    if (prefix) output.push(prefix)
    return output
  }

  for (const [key, child] of Object.entries(value)) {
    flattenKeys(child, prefix ? `${prefix}.${key}` : key, output)
  }

  return output
}

function collectStrings(value: unknown, output: string[] = []): string[] {
  if (typeof value === "string") {
    output.push(value)
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, output))
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectStrings(item, output))
  }

  return output
}

describe("localized message catalogs", () => {
  it("keeps identical key shapes in every locale", () => {
    const expected = flattenKeys(pt).sort()

    expect(flattenKeys(en).sort()).toEqual(expected)
    expect(flattenKeys(es).sort()).toEqual(expected)
  })

  it.each([
    ["pt", pt],
    ["en", en],
    ["es", es],
  ] as const)("contains no blank messages in %s", (_locale, messages) => {
    expect(collectStrings(messages).every((message) => message.trim().length > 0)).toBe(true)
  })

  it("keeps the contact flow localized", () => {
    expect(en.Contact.form.selectPlaceholder).toBe("Select an option")
    expect(es.Contact.form.send).toBe("Enviar mensaje")
    expect(es.Contact.form.serverErrors.rateLimited).not.toMatch(/requisi|tente/i)
    expect(pt.Contact.form.webMcp.toolDescription).toContain("confirmação manual")
    expect(en.Contact.form.webMcp.toolDescription).toContain("manual confirmation")
    expect(es.Contact.form.webMcp.toolDescription).toContain("confirmación manual")
  })

  it("describes the managed product lifecycle in every locale", () => {
    expect(pt.Projects.managedProducts.description).toMatch(
      /concepção.*sustentação/i,
    )
    expect(en.Projects.managedProducts.description).toMatch(/concept.*support/i)
    expect(es.Projects.managedProducts.description).toMatch(
      /concepción.*soporte/i,
    )
  })

  it("localizes every published website experience and capability", () => {
    const catalogs = [pt, en, es] as const

    catalogs.forEach((catalog) => {
      websiteExperiences.forEach(({ id, tagIds }) => {
        const item = catalog.WebsiteShowcase.items[id]

        expect(item.title.trim()).not.toBe("")
        expect(item.description.trim()).not.toBe("")
        expect(item.category.trim()).not.toBe("")
        expect(item.imageAlt.trim()).not.toBe("")

        tagIds.forEach((tagId) => {
          expect(catalog.WebsiteShowcase.tags[tagId].trim()).not.toBe("")
        })
      })
    })
  })
})
