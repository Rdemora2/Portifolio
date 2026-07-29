import { describe, expect, it } from "vitest"
import { contactSchema } from "./validations"

const validContact = {
  name: "Roberto Moraes",
  email: "roberto@example.com",
  company: "Example",
  subject: "Conversa sobre engenharia",
  message: "Quero conversar sobre engenharia de software.",
  botCheck: "",
}

describe("contactSchema", () => {
  it("normalizes safe user input", () => {
    const result = contactSchema.parse({
      ...validContact,
      name: "  Roberto Moraes  ",
      email: "  ROBERTO@EXAMPLE.COM  ",
    })

    expect(result.name).toBe("Roberto Moraes")
    expect(result.email).toBe("roberto@example.com")
  })

  it("rejects unknown fields", () => {
    const result = contactSchema.safeParse({ ...validContact, role: "admin" })

    expect(result.success).toBe(false)
  })

  it("rejects control characters in single-line fields", () => {
    const result = contactSchema.safeParse({
      ...validContact,
      name: "Roberto\r\nBcc: attacker@example.com",
    })

    expect(result.success).toBe(false)
  })

  it("enforces message and honeypot size limits", () => {
    expect(
      contactSchema.safeParse({ ...validContact, message: "a".repeat(4_001) }).success
    ).toBe(false)
    expect(
      contactSchema.safeParse({ ...validContact, botCheck: "a".repeat(201) }).success
    ).toBe(false)
  })
})
