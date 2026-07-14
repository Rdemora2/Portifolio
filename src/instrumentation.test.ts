import { createHash } from "node:crypto"
import { afterEach, describe, expect, it, vi } from "vitest"
import { register } from "./instrumentation"

const digest = (scope: string) => createHash("sha256").update(`portfolio-${scope}`).digest("hex")

function stubValidProductionEnvironment(): void {
  vi.stubEnv("NODE_ENV", "production")
  vi.stubEnv("NEXT_RUNTIME", "nodejs")
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://robertomoraes.dev")
  vi.stubEnv("RESEND_API_KEY", `re_${digest("resend")}`)
  vi.stubEnv("CONTACT_FROM_EMAIL", "contact@robertomoraes.dev")
  vi.stubEnv("CONTACT_TO_EMAIL", "owner@robertomoraes.dev")
  vi.stubEnv("CONTACT_IDEMPOTENCY_SECRET", digest("idempotency"))
  vi.stubEnv("CONTACT_ALLOWED_ORIGINS", "https://robertomoraes.dev")
  vi.stubEnv("CONTACT_TRUST_PROXY", "false")
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe("register", () => {
  it("does not enforce production credentials in development", async () => {
    vi.stubEnv("NODE_ENV", "development")
    vi.stubEnv("NEXT_RUNTIME", "nodejs")
    vi.stubEnv("RESEND_API_KEY", "")

    await expect(register()).resolves.toBeUndefined()
  })

  it("does not load Node.js runtime validation for the edge runtime", async () => {
    vi.stubEnv("NODE_ENV", "production")
    vi.stubEnv("NEXT_RUNTIME", "edge")
    vi.stubEnv("RESEND_API_KEY", "")

    await expect(register()).resolves.toBeUndefined()
  })

  it("fails before serving with an invalid Node.js production environment", async () => {
    vi.stubEnv("NODE_ENV", "production")
    vi.stubEnv("NEXT_RUNTIME", "nodejs")
    vi.stubEnv("RESEND_API_KEY", "")
    vi.stubEnv("CONTACT_FROM_EMAIL", "")
    vi.stubEnv("CONTACT_TO_EMAIL", "")
    vi.stubEnv("CONTACT_IDEMPOTENCY_SECRET", "")
    vi.stubEnv("CONTACT_ALLOWED_ORIGINS", "")
    vi.stubEnv("CONTACT_TRUST_PROXY", "")
    const stderr = vi.spyOn(process.stderr, "write").mockImplementation(() => true)
    const exit = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("process exited")
    }) as typeof process.exit)

    await expect(register()).rejects.toThrow("process exited")
    expect(exit).toHaveBeenCalledWith(1)
    expect(stderr).toHaveBeenCalledWith(expect.stringContaining("Invalid production environment"))
  })

  it("accepts a valid Node.js production environment", async () => {
    stubValidProductionEnvironment()
    await expect(register()).resolves.toBeUndefined()
  })
})
