import { z } from "zod"

// The site ships a strict CSP without unsafe-eval. Opt out of Zod's JIT probe
// before any schema parses so Firefox does not report a blocked Function call.
z.config({ jitless: true })

const singleLineText = z
  .string()
  .trim()
  .refine((value) => !/[\u0000-\u001F\u007F]/.test(value), "Caracteres inválidos")

const multiLineText = z
  .string()
  .trim()
  .refine(
    (value) => !/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value),
    "Caracteres inválidos"
  )

export const contactSchema = z
  .object({
    name: singleLineText.min(2, "Nome muito curto").max(100, "Nome muito longo"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254, "Email muito longo")
      .email("Email inválido"),
    company: singleLineText.max(120, "Empresa muito longa").optional(),
    subject: singleLineText
      .min(3, "Assunto muito curto")
      .max(160, "Assunto muito longo"),
    message: multiLineText
      .min(20, "Mensagem muito curta")
      .max(4_000, "Mensagem muito longa"),
    botCheck: z.string().max(200).optional(),
  })
  .strict()

export type ContactSchema = z.infer<typeof contactSchema>
