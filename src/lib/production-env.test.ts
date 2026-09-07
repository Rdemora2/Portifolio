import { createHash } from "node:crypto"
import { describe, expect, it } from "vitest"
import {
  ProductionEnvironmentError,
  assertProductionBuildEnv,
  assertProductionRuntimeEnv,
} from "./production-env"

const digest = (scope: string) => createHash("sha256").update(`portfolio-${scope}`).digest("hex")

function validEnvironment(overrides: Record<string, string | undefined> = {}) {
  return {
    NEXT_PUBLIC_SITE_URL: "https://portifolio-liard-zeta.vercel.app",
    NEXT_PUBLIC_WEB_VITALS_ENDPOINT: "/api/vitals",
    RESEND_API_KEY: `re_${digest("resend")}`,
    CONTACT_FROM_EMAIL: "Portfolio <contact@robertomoraes.dev>",
    CONTACT_TO_EMAIL: "owner@robertomoraes.dev",
    CONTACT_IDEMPOTENCY_SECRET: digest("idempotency"),
    CONTACT_ALLOWED_ORIGINS: "https://portifolio-liard-zeta.vercel.app",
    CONTACT_TRUST_PROXY: "false",
    CONTACT_CLIENT_IP_HEADER: "x-forwarded-for",
    CONTACT_TRUST_PROXY_HOPS: "1",
    CONTACT_RATE_LIMIT_WINDOW_SECONDS: "60",
    CONTACT_RATE_LIMIT_MAX: "5",
    CONTACT_RATE_LIMIT_GLOBAL_MAX: "100",
    CONTACT_RATE_LIMIT_MAX_ENTRIES: "5000",
    CONTACT_MAX_BODY_BYTES: "16384",
    CONTACT_EMAIL_TIMEOUT_MS: "8000",
    ...overrides,
  }
}

describe("assertProductionBuildEnv", () => {
  it("accepts the canonical default when NEXT_PUBLIC_SITE_URL is absent", () => {
    expect(() => assertProductionBuildEnv({})).not.toThrow()
  })

  it("accepts a public HTTPS origin and same-origin Web Vitals path", () => {
    expect(() =>
      assertProductionBuildEnv({
        NEXT_PUBLIC_SITE_URL: "https://portfolio.robertomoraes.dev",
        NEXT_PUBLIC_WEB_VITALS_ENDPOINT: "/api/vitals",
      })
    ).not.toThrow()
  })

  it.each([
    "https://fixture-labs.com",
    "https://8.8.8.8",
    "https://203.1.1.1",
    "https://[2001:4860:4860::8888]",
  ])("accepts the valid public origin %s", (origin) => {
    expect(() => assertProductionBuildEnv({ NEXT_PUBLIC_SITE_URL: origin })).not.toThrow()
  })

  it.each([
    ["an insecure scheme", { NEXT_PUBLIC_SITE_URL: "http://robertomoraes.dev" }],
    ["localhost", { NEXT_PUBLIC_SITE_URL: "https://localhost:3000" }],
    ["an example domain", { NEXT_PUBLIC_SITE_URL: "https://example.com" }],
    ["a URL path", { NEXT_PUBLIC_SITE_URL: "https://robertomoraes.dev/app" }],
    ["credentials", { NEXT_PUBLIC_SITE_URL: "https://user:pass@robertomoraes.dev" }],
    ["a single-label host", { NEXT_PUBLIC_SITE_URL: "https://intranet" }],
    ["invalid DNS labels", { NEXT_PUBLIC_SITE_URL: "https://foo_bar.com" }],
    ["home.arpa", { NEXT_PUBLIC_SITE_URL: "https://router.home.arpa" }],
    ["a private address", { NEXT_PUBLIC_SITE_URL: "https://192.168.1.10" }],
    ["a documentation address", { NEXT_PUBLIC_SITE_URL: "https://203.0.113.10" }],
    ["a placeholder label", { NEXT_PUBLIC_SITE_URL: "https://placeholder.acme.com" }],
    ["an absolute telemetry URL", { NEXT_PUBLIC_WEB_VITALS_ENDPOINT: "https://collector.dev" }],
    ["a protocol-relative telemetry URL", { NEXT_PUBLIC_WEB_VITALS_ENDPOINT: "//collector.dev" }],
  ])("rejects %s", (_label, environment) => {
    expect(() => assertProductionBuildEnv(environment)).toThrow(ProductionEnvironmentError)
  })
})

describe("assertProductionRuntimeEnv", () => {
  it("accepts a complete production environment", () => {
    expect(() => assertProductionRuntimeEnv(validEnvironment())).not.toThrow()
  })

  it("accepts canonical-case proxy headers and a legitimate hostname containing fixture", () => {
    expect(() =>
      assertProductionRuntimeEnv(
        validEnvironment({
          NEXT_PUBLIC_SITE_URL: "https://fixture-labs.com",
          CONTACT_ALLOWED_ORIGINS: "https://fixture-labs.com",
          CONTACT_CLIENT_IP_HEADER: "X-Forwarded-For",
        })
      )
    ).not.toThrow()
  })

  it("reports every missing required variable without including secret values", () => {
    const exposedValue = "re_exposed_value_must_never_appear"

    expect(() =>
      assertProductionRuntimeEnv({
        RESEND_API_KEY: exposedValue,
        CONTACT_TRUST_PROXY: "maybe",
      })
    ).toThrowError(expect.objectContaining({
      message: expect.not.stringContaining(exposedValue),
    }))

    try {
      assertProductionRuntimeEnv({ CONTACT_TRUST_PROXY: "maybe" })
    } catch (error) {
      expect(error).toBeInstanceOf(ProductionEnvironmentError)
      expect((error as Error).message).toContain("CONTACT_FROM_EMAIL")
      expect((error as Error).message).toContain("CONTACT_ALLOWED_ORIGINS")
      expect((error as Error).message).toContain("CONTACT_TRUST_PROXY")
    }
  })

  it.each([
    ["Resend placeholder", { RESEND_API_KEY: "re_development_only_placeholder" }],
    ["alternate Resend placeholder", { RESEND_API_KEY: `re_example_${digest("resend")}` }],
    ["placeholder secret", { CONTACT_IDEMPOTENCY_SECRET: "replace-with-a-long-random-secret-value" }],
    ["example sender", { CONTACT_FROM_EMAIL: "Portfolio <hello@example.com>" }],
    ["invalid sender domain", { CONTACT_FROM_EMAIL: "hello@foo_bar.com" }],
    ["short secret", { CONTACT_IDEMPOTENCY_SECRET: "too-short" }],
    ["low-entropy secret", { CONTACT_IDEMPOTENCY_SECRET: "a".repeat(64) }],
    ["invalid proxy decision", { CONTACT_TRUST_PROXY: "yes" }],
    ["invalid header", { CONTACT_CLIENT_IP_HEADER: "X Forwarded For" }],
    ["invalid body limit", { CONTACT_MAX_BODY_BYTES: "100" }],
    ["invalid rate relation", { CONTACT_RATE_LIMIT_MAX: "10", CONTACT_RATE_LIMIT_GLOBAL_MAX: "5" }],
  ])("rejects %s", (_label, overrides) => {
    expect(() => assertProductionRuntimeEnv(validEnvironment(overrides))).toThrow(
      ProductionEnvironmentError
    )
  })

  it("requires the public site origin in CONTACT_ALLOWED_ORIGINS", () => {
    expect(() =>
      assertProductionRuntimeEnv(
        validEnvironment({ CONTACT_ALLOWED_ORIGINS: "https://admin.robertomoraes.dev" })
      )
    ).toThrow(/must include NEXT_PUBLIC_SITE_URL/)
  })
})
