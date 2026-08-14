import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { websiteExperiences } from "@/data/showcase-sites"

const requiredPublishedDomains = [
  "lp-estudio-musica.vercel.app",
  "lp-fundo-investimento.vercel.app",
  "portal-noticias-ivory.vercel.app",
  "lp-hospitalidade-premium.vercel.app",
  "lp-institucional-fintech.vercel.app",
  "lp-institucional-paisagismo.vercel.app",
  "lp-institucional-vendas.vercel.app",
  "lp-institucional-advocacia.vercel.app",
  "casa-brasa-tabacaria.vercel.app",
] as const

const jpegStartOfFrameMarkers = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce,
  0xcf,
])

function readImageDimensions(path: string) {
  const image = readFileSync(path)

  if (image.length >= 8 && image.readUInt32BE(0) === 0x89504e47) {
    return {
      width: image.readUInt32BE(16),
      height: image.readUInt32BE(20),
    }
  }

  if (
    image.length >= 30 &&
    image.toString("ascii", 0, 4) === "RIFF" &&
    image.toString("ascii", 8, 12) === "WEBP"
  ) {
    const chunkType = image.toString("ascii", 12, 16)

    if (chunkType === "VP8X") {
      return {
        width: image.readUIntLE(24, 3) + 1,
        height: image.readUIntLE(27, 3) + 1,
      }
    }

    if (chunkType === "VP8L" && image[20] === 0x2f) {
      const dimensions = image.readUInt32LE(21)

      return {
        width: (dimensions & 0x3fff) + 1,
        height: ((dimensions >>> 14) & 0x3fff) + 1,
      }
    }

    if (
      chunkType === "VP8 " &&
      image[23] === 0x9d &&
      image[24] === 0x01 &&
      image[25] === 0x2a
    ) {
      return {
        width: image.readUInt16LE(26) & 0x3fff,
        height: image.readUInt16LE(28) & 0x3fff,
      }
    }
  }

  if (image.readUInt16BE(0) !== 0xffd8) {
    throw new Error(`${path} is not a supported PNG, JPEG, or WebP image`)
  }

  let offset = 2
  while (offset + 8 < image.length) {
    if (image[offset] !== 0xff) {
      offset += 1
      continue
    }

    while (image[offset] === 0xff) offset += 1
    const marker = image[offset] as number
    offset += 1

    if (marker === 0xd8 || marker === 0xd9) continue

    const segmentLength = image.readUInt16BE(offset)
    if (segmentLength < 2 || offset + segmentLength > image.length) break

    if (jpegStartOfFrameMarkers.has(marker)) {
      return {
        width: image.readUInt16BE(offset + 5),
        height: image.readUInt16BE(offset + 3),
      }
    }

    offset += segmentLength
  }

  throw new Error(`${path} has no supported image dimensions`)
}

describe("website showcase data", () => {
  it("preserves every required published destination", () => {
    const listedDomains = new Set(
      websiteExperiences.map(({ domain }) => domain),
    )

    requiredPublishedDomains.forEach((domain) => {
      expect(listedDomains.has(domain), `${domain} must remain listed`).toBe(
        true,
      )
    })
  })

  it("keeps identifiers and published destinations unique", () => {
    expect(new Set(websiteExperiences.map(({ id }) => id)).size).toBe(
      websiteExperiences.length,
    )
    expect(new Set(websiteExperiences.map(({ href }) => href)).size).toBe(
      websiteExperiences.length,
    )

    websiteExperiences.forEach(({ href, domain }) => {
      const url = new URL(href)

      expect(url.protocol).toBe("https:")
      expect(url.hostname).toBe(domain)
    })
  })

  it("references local thumbnails with reserved dimensions", () => {
    websiteExperiences.forEach(({ image }) => {
      const localPath = join(process.cwd(), "public", image.src.slice(1))

      expect(existsSync(localPath), `${image.src} must exist`).toBe(true)
      expect(image.width).toBeGreaterThan(0)
      expect(image.height).toBeGreaterThan(0)
      expect(image.width / image.height).toBeCloseTo(1410 / 831, 4)
      expect(readImageDimensions(localPath)).toEqual({
        width: image.width,
        height: image.height,
      })
    })
  })

  it("keeps thumbnails and blur placeholders unique", () => {
    expect(new Set(websiteExperiences.map(({ image }) => image.src)).size).toBe(
      websiteExperiences.length,
    )
    expect(
      new Set(websiteExperiences.map(({ image }) => image.blurDataURL)).size,
    ).toBe(websiteExperiences.length)

    websiteExperiences.forEach(({ image }) => {
      expect(image.blurDataURL).toMatch(/^data:image\/jpeg;base64,/)
    })
  })
})
