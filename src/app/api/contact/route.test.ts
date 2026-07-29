import { NextRequest } from "next/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const sendEmailMock = vi.hoisted(() => vi.fn())

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendEmailMock }
  },
}))

const validContact = {
  name: "Roberto Moraes",
  email: "roberto@example.com",
  company: "Example",
  subject: "Conversa sobre engenharia",
  message: "Quero conversar sobre engenharia de software.",
  botCheck: "",
}

function makeRequest(
  body: unknown,
  headers: Record<string, string> = {},
  rawBody = false
): NextRequest {
  return new NextRequest("https://portfolio.test/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://portfolio.test",
      "x-forwarded-for": "203.0.113.10",
      ...headers,
    },
    body: rawBody ? String(body) : JSON.stringify(body),
  })
}

async function loadPost() {
  const route = await import("./route")
  return route.POST
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.resetModules()
    sendEmailMock.mockReset()
    sendEmailMock.mockResolvedValue({
      data: { id: "email_123" },
      error: null,
      headers: {},
    })
    vi.stubEnv("RESEND_API_KEY", "re_test_key")
    vi.stubEnv("CONTACT_FROM_EMAIL", "Portfolio <portfolio@example.com>")
    vi.stubEnv("CONTACT_TO_EMAIL", "owner@example.com")
    vi.stubEnv("CONTACT_IDEMPOTENCY_SECRET", "test-secret")
    vi.stubEnv("CONTACT_ALLOWED_ORIGINS", "https://portfolio.test")
    vi.stubEnv("CONTACT_MAX_BODY_BYTES", "16384")
    vi.stubEnv("CONTACT_RATE_LIMIT_MAX", "5")
    vi.stubEnv("CONTACT_RATE_LIMIT_GLOBAL_MAX", "100")
    vi.stubEnv("CONTACT_RATE_LIMIT_WINDOW_SECONDS", "60")
    vi.stubEnv("CONTACT_TRUST_PROXY", "true")
    vi.stubEnv("CONTACT_CLIENT_IP_HEADER", "x-forwarded-for")
    vi.stubEnv("CONTACT_TRUST_PROXY_HOPS", "1")
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("rejects unsupported media types", async () => {
    const POST = await loadPost()
    const response = await POST(
      makeRequest(validContact, { "content-type": "text/plain" })
    )

    expect(response.status).toBe(415)
    expect(sendEmailMock).not.toHaveBeenCalled()
  })

  it("rejects cross-origin submissions", async () => {
    const POST = await loadPost()
    const response = await POST(
      makeRequest(validContact, { origin: "https://attacker.example" })
    )

    expect(response.status).toBe(403)
    expect(sendEmailMock).not.toHaveBeenCalled()
  })

  it("rejects malformed JSON", async () => {
    const POST = await loadPost()
    const response = await POST(makeRequest("{invalid", {}, true))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({ error: "JSON inválido" })
  })

  it("rejects bodies above the configured byte limit", async () => {
    vi.stubEnv("CONTACT_MAX_BODY_BYTES", "1024")
    const POST = await loadPost()
    const response = await POST(makeRequest({ ...validContact, message: "a".repeat(2_000) }))

    expect(response.status).toBe(413)
    expect(sendEmailMock).not.toHaveBeenCalled()
  })

  it("silently accepts honeypot submissions without sending email", async () => {
    const POST = await loadPost()
    const response = await POST(makeRequest({ botCheck: "filled-by-bot" }))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ success: true })
    expect(sendEmailMock).not.toHaveBeenCalled()
  })

  it("rejects invalid or unexpected fields", async () => {
    const POST = await loadPost()
    const response = await POST(makeRequest({ ...validContact, role: "admin" }))

    expect(response.status).toBe(400)
    expect(sendEmailMock).not.toHaveBeenCalled()
  })

  it("reports provider rejections instead of claiming success", async () => {
    sendEmailMock.mockResolvedValueOnce({
      data: null,
      error: {
        name: "validation_error",
        message: "rejected",
        statusCode: 422,
      },
      headers: {},
    })
    const POST = await loadPost()
    const response = await POST(makeRequest(validContact))

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toMatchObject({
      error: "Não foi possível enviar a mensagem",
    })
  })

  it("sends validated content with reply-to and an idempotency key", async () => {
    const POST = await loadPost()
    const response = await POST(makeRequest(validContact))

    expect(response.status).toBe(200)
    expect(response.headers.get("cache-control")).toBe("no-store")
    expect(response.headers.get("ratelimit-remaining")).toBe("4")
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Portfolio <portfolio@example.com>",
        to: "owner@example.com",
        replyTo: "roberto@example.com",
        subject: expect.stringContaining(validContact.subject),
        text: expect.stringContaining(validContact.message),
        html: expect.stringContaining(validContact.message),
      }),
      { idempotencyKey: expect.stringMatching(/^[A-Za-z0-9_-]{43}$/) }
    )
  })

  it("returns 429 with retry metadata after the client limit", async () => {
    vi.stubEnv("CONTACT_RATE_LIMIT_MAX", "2")
    const POST = await loadPost()

    expect((await POST(makeRequest(validContact))).status).toBe(200)
    expect((await POST(makeRequest(validContact))).status).toBe(200)
    const response = await POST(makeRequest(validContact))

    expect(response.status).toBe(429)
    expect(response.headers.get("retry-after")).toBe("60")
    expect(response.headers.get("ratelimit-remaining")).toBe("0")
    expect(sendEmailMock).toHaveBeenCalledTimes(2)
  })

  it("does not trust spoofable forwarding headers by default", async () => {
    vi.stubEnv("CONTACT_TRUST_PROXY", "false")
    vi.stubEnv("CONTACT_RATE_LIMIT_MAX", "1")
    const POST = await loadPost()

    expect((await POST(makeRequest(validContact))).status).toBe(200)
    const response = await POST(
      makeRequest(validContact, { "x-forwarded-for": "198.51.100.22" })
    )

    expect(response.status).toBe(429)
  })
})
