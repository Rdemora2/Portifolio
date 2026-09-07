import { describe, expect, it, vi } from "vitest"

import { projects } from "@/data/portfolio"
import { locales } from "@/i18n.config"

import { generateStaticParams, GET } from "./route"

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async () => (key: string) => key),
}))

describe("project social image route", () => {
  it("pre-renders every project and locale combination", () => {
    const params = generateStaticParams()

    expect(params).toHaveLength(projects.length * locales.length)
    expect(params).toContainEqual({
      slug: "hospital-sirio-libanes",
      locale: "pt",
    })
    expect(new Set(params.map(({ locale, slug }) => `${locale}:${slug}`)).size).toBe(
      params.length,
    )
  })

  it.each([
    { locale: "fr", slug: "hospital-sirio-libanes" },
    { locale: "pt", slug: "unknown-project" },
  ])("returns 404 for unsupported params $locale/$slug", async (params) => {
    const response = await GET(new Request("https://example.test"), {
      params: Promise.resolve(params),
    })

    expect(response.status).toBe(404)
  })

  it("renders a localized project image", async () => {
    const response = await GET(new Request("https://example.test"), {
      params: Promise.resolve({
        locale: "en",
        slug: "hospital-sirio-libanes",
      }),
    })

    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toBe("image/png")
    expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(10_000)
  })
})
