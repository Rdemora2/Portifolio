export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server"
import { contactSchema } from "@/lib/validations"

/** Simple in-memory rate limiter (per-IP, 5 requests per minute). */
const rateLimit = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 5

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimit.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  entry.count++
  return entry.count > RATE_LIMIT_MAX
}

/** Escapes HTML entities to prevent XSS in email templates. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Muitas requisições. Tente novamente em breve." },
        { status: 429 }
      )
    }

    const body: unknown = await req.json()
    const parsed = contactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      console.error("RESEND_API_KEY not configured")
      return NextResponse.json(
        { error: "Configuração de email incompleta" },
        { status: 500 }
      )
    }

    const { Resend } = await import("resend")
    const resend = new Resend(resendKey)

    const { name, email, company, projectType, message, budget } = parsed.data

    await resend.emails.send({
      from: "portfolio@robertozarzur.dev",
      to: "robertomoraeszar@gmail.com",
      subject: `[Portfolio] Nova mensagem de ${escapeHtml(name)}`,
      html: `
        <h2>Nova mensagem do portfolio</h2>
        <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        ${company ? `<p><strong>Empresa:</strong> ${escapeHtml(company)}</p>` : ""}
        <p><strong>Tipo de projeto:</strong> ${escapeHtml(projectType)}</p>
        ${budget ? `<p><strong>Budget:</strong> ${escapeHtml(budget)}</p>` : ""}
        <hr />
        <p><strong>Mensagem:</strong></p>
        <p>${escapeHtml(message)}</p>
      `,
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error("Contact form error:", err)
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    )
  }
}
