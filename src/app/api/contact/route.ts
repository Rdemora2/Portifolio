import { createHmac, randomBytes } from "node:crypto"
import { isIP } from "node:net"
import { NextRequest, NextResponse } from "next/server"
import { contactSchema, type ContactSchema } from "@/lib/validations"

export const runtime = "nodejs"

type RateLimitEntry = {
  count: number
  resetAt: number
}

type RateLimitResult = {
  limited: boolean
  limit: number
  remaining: number
  resetSeconds: number
}

const RATE_LIMIT_WINDOW_MS = getIntegerEnv(
  "CONTACT_RATE_LIMIT_WINDOW_SECONDS",
  60,
  1,
  3_600
) * 1_000
const RATE_LIMIT_MAX = getIntegerEnv("CONTACT_RATE_LIMIT_MAX", 5, 1, 1_000)
const RATE_LIMIT_GLOBAL_MAX = getIntegerEnv(
  "CONTACT_RATE_LIMIT_GLOBAL_MAX",
  100,
  RATE_LIMIT_MAX,
  100_000
)
const RATE_LIMIT_MAX_ENTRIES = getIntegerEnv(
  "CONTACT_RATE_LIMIT_MAX_ENTRIES",
  5_000,
  10,
  100_000
)
const MAX_BODY_BYTES = getIntegerEnv("CONTACT_MAX_BODY_BYTES", 16_384, 1_024, 1_048_576)
const EMAIL_TIMEOUT_MS = getIntegerEnv("CONTACT_EMAIL_TIMEOUT_MS", 8_000, 1_000, 30_000)
const TRUST_PROXY = process.env.CONTACT_TRUST_PROXY === "true"
const TRUST_PROXY_HOPS = getIntegerEnv("CONTACT_TRUST_PROXY_HOPS", 1, 1, 20)
const configuredClientIpHeader = process.env.CONTACT_CLIENT_IP_HEADER?.toLowerCase().trim()
const CLIENT_IP_HEADER =
  configuredClientIpHeader && /^[a-z0-9-]+$/.test(configuredClientIpHeader)
    ? configuredClientIpHeader
    : "x-forwarded-for"
const rateLimitKey = randomBytes(32)
const rateLimitEntries = new Map<string, RateLimitEntry>()
let nextRateLimitCleanup = 0

function getIntegerEnv(name: string, fallback: number, min: number, max: number): number {
  const rawValue = process.env[name]

  if (!rawValue || !/^\d+$/.test(rawValue)) {
    return fallback
  }

  const value = Number(rawValue)
  return Number.isSafeInteger(value) && value >= min && value <= max ? value : fallback
}

function cleanupRateLimitEntries(now: number): void {
  if (now < nextRateLimitCleanup) {
    return
  }

  for (const [key, entry] of rateLimitEntries) {
    if (entry.resetAt <= now) {
      rateLimitEntries.delete(key)
    }
  }

  nextRateLimitCleanup = now + RATE_LIMIT_WINDOW_MS
}

function consumeRateLimit(key: string, limit: number, now = Date.now()): RateLimitResult {
  cleanupRateLimitEntries(now)

  const existing = rateLimitEntries.get(key)
  const resetAt = existing?.resetAt && existing.resetAt > now
    ? existing.resetAt
    : now + RATE_LIMIT_WINDOW_MS
  const entry = existing?.resetAt && existing.resetAt > now
    ? existing
    : { count: 0, resetAt }

  entry.count += 1

  if (!existing && rateLimitEntries.size >= RATE_LIMIT_MAX_ENTRIES) {
    return {
      limited: true,
      limit,
      remaining: 0,
      resetSeconds: Math.ceil(RATE_LIMIT_WINDOW_MS / 1_000),
    }
  }

  rateLimitEntries.set(key, entry)

  return {
    limited: entry.count > limit,
    limit,
    remaining: Math.max(0, limit - entry.count),
    resetSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1_000)),
  }
}

function getClientIdentifier(request: NextRequest): string {
  if (!TRUST_PROXY) {
    return "shared-untrusted-proxy"
  }

  const forwardedAddresses = request.headers
    .get(CLIENT_IP_HEADER)
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean)
  const address = forwardedAddresses?.at(-TRUST_PROXY_HOPS)

  if (!address || isIP(address) === 0) {
    return "shared-invalid-address"
  }

  return createHmac("sha256", rateLimitKey).update(address).digest("base64url")
}

function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(result.resetSeconds),
  }
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  headers: Record<string, string> = {}
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  })
}

function getAllowedOrigins(request: NextRequest): Set<string> {
  const configuredOrigins = process.env.CONTACT_ALLOWED_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

  return new Set(configuredOrigins?.length ? configuredOrigins : [request.nextUrl.origin])
}

function hasAllowedOrigin(request: NextRequest): boolean {
  if (request.headers.get("sec-fetch-site")?.toLowerCase() === "cross-site") {
    return false
  }

  const origin = request.headers.get("origin")
  return !origin || getAllowedOrigins(request).has(origin)
}

async function readJsonBody(request: NextRequest): Promise<unknown> {
  if (!request.body) {
    throw new SyntaxError("Missing request body")
  }

  const reader = request.body.getReader()
  const decoder = new TextDecoder("utf-8", { fatal: true })
  let size = 0
  let body = ""

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      size += value.byteLength
      if (size > MAX_BODY_BYTES) {
        await reader.cancel("Request body too large")
        throw new BodyTooLargeError()
      }

      body += decoder.decode(value, { stream: true })
    }

    body += decoder.decode()
    return JSON.parse(body) as unknown
  } finally {
    reader.releaseLock()
  }
}

class BodyTooLargeError extends Error {}
class EmailTimeoutError extends Error {}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function buildEmailContent(data: ContactSchema) {
  const { name, email, company, projectType, message, budget } = data
  const optionalCompanyText = company ? `Empresa: ${company}\n` : ""
  const optionalBudgetText = budget ? `Budget: ${budget}\n` : ""
  const optionalCompanyHtml = company
    ? `<p><strong>Empresa:</strong> ${escapeHtml(company)}</p>`
    : ""
  const optionalBudgetHtml = budget
    ? `<p><strong>Budget:</strong> ${escapeHtml(budget)}</p>`
    : ""

  return {
    subject: `[Portfolio] Nova mensagem de ${name}`,
    text: [
      "Nova mensagem do portfolio",
      "",
      `Nome: ${name}`,
      `Email: ${email}`,
      optionalCompanyText.trimEnd(),
      `Tipo de projeto: ${projectType}`,
      optionalBudgetText.trimEnd(),
      "",
      "Mensagem:",
      message,
    ].filter((line) => line !== "").join("\n"),
    html: `
      <h2>Nova mensagem do portfolio</h2>
      <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      ${optionalCompanyHtml}
      <p><strong>Tipo de projeto:</strong> ${escapeHtml(projectType)}</p>
      ${optionalBudgetHtml}
      <hr />
      <p><strong>Mensagem:</strong></p>
      <p>${escapeHtml(message).replace(/\r?\n/g, "<br />")}</p>
    `,
  }
}

function createIdempotencyKey(data: ContactSchema, secret: string): string {
  const tenMinuteWindow = Math.floor(Date.now() / 600_000)
  const payload = JSON.stringify({ ...data, botCheck: undefined, tenMinuteWindow })

  return createHmac("sha256", secret).update(payload).digest("base64url")
}

async function withTimeout<T>(promise: Promise<T>): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new EmailTimeoutError()), EMAIL_TIMEOUT_MS)
      }),
    ])
  } finally {
    if (timeout) {
      clearTimeout(timeout)
    }
  }
}

export async function POST(request: NextRequest) {
  if (!hasAllowedOrigin(request)) {
    return jsonResponse({ error: "Origem não permitida" }, 403)
  }

  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase()
  if (contentType !== "application/json") {
    return jsonResponse({ error: "Content-Type não suportado" }, 415)
  }

  const contentEncoding = request.headers.get("content-encoding")?.trim().toLowerCase()
  if (contentEncoding && contentEncoding !== "identity") {
    return jsonResponse({ error: "Content-Encoding não suportado" }, 415)
  }

  const contentLength = request.headers.get("content-length")
  if (contentLength && /^\d+$/.test(contentLength) && Number(contentLength) > MAX_BODY_BYTES) {
    return jsonResponse({ error: "Payload muito grande" }, 413)
  }

  const globalRateLimit = consumeRateLimit("global", RATE_LIMIT_GLOBAL_MAX)
  if (globalRateLimit.limited) {
    return jsonResponse(
      { error: "Muitas requisições. Tente novamente em breve." },
      429,
      { ...rateLimitHeaders(globalRateLimit), "Retry-After": String(globalRateLimit.resetSeconds) }
    )
  }

  const clientRateLimit = consumeRateLimit(`client:${getClientIdentifier(request)}`, RATE_LIMIT_MAX)
  const responseRateLimitHeaders = rateLimitHeaders(clientRateLimit)
  if (clientRateLimit.limited) {
    return jsonResponse(
      { error: "Muitas requisições. Tente novamente em breve." },
      429,
      { ...responseRateLimitHeaders, "Retry-After": String(clientRateLimit.resetSeconds) }
    )
  }

  let body: unknown
  try {
    body = await readJsonBody(request)
  } catch (error) {
    return jsonResponse(
      { error: error instanceof BodyTooLargeError ? "Payload muito grande" : "JSON inválido" },
      error instanceof BodyTooLargeError ? 413 : 400,
      responseRateLimitHeaders
    )
  }

  if (
    typeof body === "object" &&
    body !== null &&
    "botCheck" in body &&
    typeof body.botCheck === "string" &&
    body.botCheck.length > 0
  ) {
    return jsonResponse({ success: true }, 200, responseRateLimitHeaders)
  }

  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    return jsonResponse(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      400,
      responseRateLimitHeaders
    )
  }

  const resendKey = process.env.RESEND_API_KEY
  const from = process.env.CONTACT_FROM_EMAIL
  const to = process.env.CONTACT_TO_EMAIL
  if (!resendKey || !from || !to) {
    console.error("Contact email configuration is incomplete")
    return jsonResponse(
      { error: "Serviço de contato temporariamente indisponível" },
      503,
      responseRateLimitHeaders
    )
  }

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(resendKey)
    const emailContent = buildEmailContent(parsed.data)
    const idempotencySecret = process.env.CONTACT_IDEMPOTENCY_SECRET || resendKey
    const result = await withTimeout(
      resend.emails.send(
        {
          from,
          to,
          replyTo: parsed.data.email,
          ...emailContent,
        },
        { idempotencyKey: createIdempotencyKey(parsed.data, idempotencySecret) }
      )
    )

    if (result.error) {
      console.error("Contact email delivery was rejected", {
        code: result.error.name,
        statusCode: result.error.statusCode,
      })
      return jsonResponse(
        { error: "Não foi possível enviar a mensagem" },
        502,
        responseRateLimitHeaders
      )
    }

    return jsonResponse({ success: true }, 200, responseRateLimitHeaders)
  } catch (error) {
    console.error("Contact email delivery failed", {
      type: error instanceof EmailTimeoutError ? "timeout" : "exception",
    })
    return jsonResponse(
      { error: "Não foi possível enviar a mensagem" },
      error instanceof EmailTimeoutError ? 504 : 502,
      responseRateLimitHeaders
    )
  }
}
