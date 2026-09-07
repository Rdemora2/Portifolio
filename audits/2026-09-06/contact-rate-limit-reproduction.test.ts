import { NextRequest } from "next/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const sendEmailMock = vi.hoisted(() => vi.fn())

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendEmailMock }
  },
}))

const validContact = {
  name: "Audit User",
  email: "audit@example.com",
  subject: "Rate limit reproduction",
  message: "This message is long enough for the contact schema.",
  botCheck: "",
}

function makeRequest(clientIp: string): NextRequest {
  return new NextRequest("https://portfolio.test/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://portfolio.test",
      "x-forwarded-for": clientIp,
    },
    body: JSON.stringify(validContact),
  })
}

describe("contact global rate-limit audit reproduction", () => {
  beforeEach(() => {
    vi.resetModules()
    sendEmailMock.mockReset()
    sendEmailMock.mockResolvedValue({ data: { id: "email_audit" }, error: null })
    vi.stubEnv("RESEND_API_KEY", "re_audit_key_never_sent")
    vi.stubEnv("CONTACT_FROM_EMAIL", "audit@example.com")
    vi.stubEnv("CONTACT_TO_EMAIL", "owner@example.com")
    vi.stubEnv("CONTACT_IDEMPOTENCY_SECRET", "audit-secret")
    vi.stubEnv("CONTACT_ALLOWED_ORIGINS", "https://portfolio.test")
    vi.stubEnv("CONTACT_RATE_LIMIT_MAX", "2")
    vi.stubEnv("CONTACT_RATE_LIMIT_GLOBAL_MAX", "4")
    vi.stubEnv("CONTACT_RATE_LIMIT_WINDOW_SECONDS", "60")
    vi.stubEnv("CONTACT_TRUST_PROXY", "true")
    vi.stubEnv("CONTACT_CLIENT_IP_HEADER", "x-forwarded-for")
    vi.stubEnv("CONTACT_TRUST_PROXY_HOPS", "1")
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("shows that requests rejected for one client still exhaust the global bucket", async () => {
    const { POST } = await import("../../src/app/api/contact/route")

    expect((await POST(makeRequest("203.0.113.10"))).status).toBe(200)
    expect((await POST(makeRequest("203.0.113.10"))).status).toBe(200)
    expect((await POST(makeRequest("203.0.113.10"))).status).toBe(429)
    expect((await POST(makeRequest("203.0.113.10"))).status).toBe(429)

    const unrelatedClient = await POST(makeRequest("203.0.113.11"))

    expect(unrelatedClient.status).toBe(429)
    expect(unrelatedClient.headers.get("ratelimit-limit")).toBe("4")
    expect(sendEmailMock).toHaveBeenCalledTimes(2)
  })
})
