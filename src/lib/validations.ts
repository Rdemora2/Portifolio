import { z } from "zod"

export const contactSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.string().email("Email inválido"),
  company: z.string().optional(),
  projectType: z.enum(["web", "mobile", "backend", "architecture", "leadership", "other"]),
  message: z.string().min(20, "Mensagem muito curta"),
  budget: z.string().optional(),
})

export type ContactSchema = z.infer<typeof contactSchema>
