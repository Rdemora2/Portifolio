import { describe, expect, it } from "vitest"

import { projects } from "@/data/portfolio"
import { SITE_URL } from "@/lib/constants"

import { createLlmsFull, createLlmsIndex } from "./llms-content"

describe("LLM portfolio context", () => {
  it("uses the same public origin as application metadata", () => {
    const index = createLlmsIndex()
    const full = createLlmsFull()

    expect(index).toContain(`${SITE_URL}/llms-full.txt`)
    expect(full).toContain(`${SITE_URL}/privacidade`)
    expect(full).toContain(`${SITE_URL}/en/privacy`)
    expect(full).toContain(`${SITE_URL}/es/privacidad`)
  })

  it("renders every case from the shared portfolio data", () => {
    const full = createLlmsFull()

    for (const project of projects) {
      expect(full).toContain(`### ${project.title}`)
      expect(full).toContain(`${SITE_URL}/projetos/${project.slug}`)
    }
  })

  it("does not restore claims removed from the shared source", () => {
    const full = createLlmsFull().toLowerCase()

    expect(full).not.toContain("patient self-service")
    expect(full).not.toContain("booking engine")
    expect(full).not.toContain("zero security incidents")
  })
})
