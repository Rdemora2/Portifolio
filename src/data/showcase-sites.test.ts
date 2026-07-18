import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { websiteExperiences } from "@/data/showcase-sites"

const jpegStartOfFrameMarkers = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce,
  0xcf,
])

function readJpegDimensions(path: string) {
  const image = readFileSync(path)

  if (image.readUInt16BE(0) !== 0xffd8) {
    throw new Error(`${path} is not a JPEG image`)
  }

  let offset = 2
  while (offset + 8 < image.length) {
    if (image[offset] !== 0xff) {
      offset += 1
      continue
    }

    while (image[offset] === 0xff) offset += 1
    const marker = image[offset]
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

  throw new Error(`${path} has no supported JPEG dimensions`)
}

describe("website showcase data", () => {
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
      expect(readJpegDimensions(localPath)).toEqual({
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
