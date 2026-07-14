import { z } from "zod"

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
    projectType: z.enum(["web", "mobile", "backend", "architecture", "leadership", "other"]),
    message: multiLineText
      .min(20, "Mensagem muito curta")
      .max(4_000, "Mensagem muito longa"),
    budget: singleLineText.max(100, "Budget muito longo").optional(),
    botCheck: z.string().max(200).optional(),
  })
  .strict()

export type ContactSchema = z.infer<typeof contactSchema>
