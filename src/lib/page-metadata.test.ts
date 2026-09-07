import { describe, expect, it } from "vitest"

import { SITE_NAME, SITE_URL } from "./constants"
import { buildPageMetadata } from "./page-metadata"

describe("page metadata", () => {
  it("keeps an absolute home title and avoids repeating the site name socially", () => {
    const title = `${SITE_NAME} | Software Engineer`
    const metadata = buildPageMetadata({
      locale: "en",
      pathname: "/",
      title,
      description: "Production software engineering portfolio.",
      absoluteTitle: true,
    })

    expect(metadata.title).toEqual({ absolute: title })
    expect(metadata.openGraph?.title).toBe(title)
    expect(metadata.twitter?.title).toBe(title)
  })

  it("builds a case-specific social image URL without changing canonical alternates", () => {
    const metadata = buildPageMetadata({
      locale: "pt",
      pathname: "/work/hospital-sirio-libanes",
      title: "Hospital Sírio-Libanês — Engenheiro de Backend",
      description: "Case de engenharia de software em produção.",
      imagePath:
        "/opengraph-image/project/hospital-sirio-libanes/pt",
    })

    expect(metadata.openGraph?.images).toEqual([
      expect.objectContaining({
        url: `${SITE_URL}/opengraph-image/project/hospital-sirio-libanes/pt`,
      }),
    ])
    expect(metadata.alternates?.canonical).toBe(
      `${SITE_URL}/projetos/hospital-sirio-libanes`,
    )
    expect(metadata.alternates?.languages).toEqual(
      expect.objectContaining({
        "pt-BR": `${SITE_URL}/projetos/hospital-sirio-libanes`,
        "en-US": `${SITE_URL}/en/work/hospital-sirio-libanes`,
        "es-MX": `${SITE_URL}/es/proyectos/hospital-sirio-libanes`,
        "x-default": `${SITE_URL}/projetos/hospital-sirio-libanes`,
      }),
    )
  })
})
