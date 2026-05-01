import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  projectType: z.enum(["web", "mobile", "backend", "architecture", "leadership", "other"]),
  message: z.string().min(20),
  budget: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

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
      subject: `[Portfolio] Nova mensagem de ${name}`,
      html: `
        <h2>Nova mensagem do portfolio</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${company ? `<p><strong>Empresa:</strong> ${company}</p>` : ""}
        <p><strong>Tipo de projeto:</strong> ${projectType}</p>
        ${budget ? `<p><strong>Budget:</strong> ${budget}</p>` : ""}
        <hr />
        <p><strong>Mensagem:</strong></p>
        <p>${message}</p>
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
