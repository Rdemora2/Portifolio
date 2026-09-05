import { describe, expect, it } from "vitest"

import { projects } from "@/data/portfolio"

const expectedManagedProducts = [
  ["BandSports", "https://bandsports.uol.com.br/"],
  ["BandNews TV", "https://bandnewstv.uol.com.br/"],
  ["Arte 1", "https://canalarte1.uol.com.br/"],
  ["Terra Viva", "https://terraviva.uol.com.br/"],
  ["Agro+", "https://agromais.uol.com.br/"],
  ["Sabor & Arte", "https://canalsaborearte.uol.com.br/"],
  ["Newco Play", "https://newcoplay.com.br/"],
  ["Vivo Newco Play", "https://vivo.newcoplay.com.br/home"],
  ["Surf Play", "https://surf.newcoplay.com.br/"],
] as const

describe("portfolio project data", () => {
  it("keeps the Grupo Bandeirantes end-to-end product portfolio exact and safe", () => {
    const bandProject = projects.find(
      ({ id }) => id === "band-news-bandsports",
    )
    const managedProductGroups = bandProject?.managedProductGroups ?? []
    const managedProducts = managedProductGroups.flatMap(
      ({ products }) => products,
    )

    expect(
      managedProductGroups.map(({ id, products }) => [id, products.length]),
    ).toEqual([
      ["editorialPortals", 6],
      ["newcoPlay", 3],
    ])

    expect(managedProducts.map(({ name, href }) => [name, href])).toEqual(
      expectedManagedProducts,
    )
    expect(new Set(managedProducts.map(({ id }) => id)).size).toBe(
      managedProducts.length,
    )
    expect(new Set(managedProducts.map(({ name }) => name)).size).toBe(
      managedProducts.length,
    )
    expect(new Set(managedProducts.map(({ href }) => href)).size).toBe(
      managedProducts.length,
    )

    managedProducts.forEach(({ name, href }) => {
      const url = new URL(href)

      expect(name.trim()).not.toBe("")
      expect(url.protocol).toBe("https:")
      expect(url.username).toBe("")
      expect(url.password).toBe("")
      expect(url.hash).toBe("")
    })
  })

  it("publishes complete and optimized case study gallery images for primary cases", () => {
    const casesWithGalleries = ["band-news-bandsports", "hospital-sirio-libanes"] as const

    for (const projectId of casesWithGalleries) {
      const project = projects.find(({ id }) => id === projectId)
      expect(project).toBeDefined()
      const images = project?.caseStudy?.images ?? []
      expect(images.length).toBeGreaterThanOrEqual(5)

      images.forEach((image) => {
        expect(image.src).toMatch(/^\/images\/(?:band-sites|hsl-app)\/[a-z0-9_-]+\.webp$/)
        expect(image.width).toBeGreaterThan(500)
        expect(image.height).toBeGreaterThan(300)
        expect(image.alt.trim().length).toBeGreaterThan(10)
        expect(image.blurDataURL).toMatch(/^data:image\/webp;base64,/)
      })
    }
  })
})
