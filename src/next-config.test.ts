import { afterEach, describe, expect, it, vi } from "vitest"

async function loadConfig() {
  vi.resetModules()
  return (await import("../next.config")).default
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("next.config", () => {
  it("keeps the standalone output for Docker and self-hosted deployments", async () => {
    vi.stubEnv("VERCEL", "")
    const createNextConfig = await loadConfig()

    expect(createNextConfig("phase-development-server").output).toBe("standalone")
  })

  it("lets Vercel's native Next adapter own the deployment output", async () => {
    vi.stubEnv("VERCEL", "1")
    const createNextConfig = await loadConfig()

    expect(createNextConfig("phase-development-server").output).toBeUndefined()
  })
})
