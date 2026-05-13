"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { contactSchema, type ContactSchema } from "@/lib/validations"
import { personalInfo } from "@/data/portfolio"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { MagneticButton } from "@/components/shared/MagneticButton"
import dynamic from "next/dynamic"
import { useInView } from "@/hooks/useInView"

const WaveCanvas = dynamic(
  () => import("@/components/three/WaveCanvas").then((m) => ({ default: m.WaveCanvas })),
  { ssr: false }
)

const PROJECT_TYPES = [
  { value: "web", label: "Aplicação Web" },
  { value: "mobile", label: "Mobile Nativo" },
  { value: "backend", label: "Backend / API" },
  { value: "architecture", label: "Arquitetura" },
  { value: "leadership", label: "Gestão / Liderança" },
  { value: "other", label: "Outro" },
] as const

export function Contact() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [ref, inView] = useInView({ threshold: 0, rootMargin: "400px", triggerOnce: true })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactSchema>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactSchema) => {
    setStatus("loading")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Falha no envio")
      setStatus("success")
      reset()
      setTimeout(() => setStatus("idle"), 5000)
    } catch {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 4000)
    }
  }

  return (
    <section
      id="contact"
      ref={ref as React.RefObject<HTMLElement>}
      className="relative overflow-hidden py-16 sm:py-20 md:py-32"
      style={{ backgroundColor: "var(--color-void)" }}
    >
      {inView && <WaveCanvas />}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:gap-16 lg:grid-cols-[2fr_3fr]">
          <ScrollReveal>
            <div>
              <p
                className="mb-2 text-xs font-normal uppercase"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.25em",
                }}
              >
                Contato
              </p>
              <h2
                className="mb-6 font-bold leading-tight"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text-primary)",
                  fontSize: "var(--text-3xl)",
                }}
              >
                Bora conversar?
              </h2>
              <p
                className="mb-8 leading-relaxed"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-secondary)",
                  fontSize: "var(--text-md)",
                }}
              >
                Se você tem um projeto interessante ou quer trocar uma ideia, manda uma mensagem.
              </p>

              <div className="space-y-4">
                {personalInfo.contacts.map((contact) => (
                  <a
                    key={contact.type}
                    href={contact.href}
                    target={contact.type !== "email" ? "_blank" : undefined}
                    rel={contact.type !== "email" ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-3 text-sm transition-colors duration-200 hover:text-[var(--color-signal)]"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-200"
                      style={{ borderColor: "var(--color-edge)" }}
                    >
                      {contact.type === "email" && "✉"}
                      {contact.type === "whatsapp" && "💬"}
                      {contact.type === "linkedin" && "in"}
                      {contact.type === "github" && "gh"}
                    </span>
                    {contact.label}
                  </a>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="slide-right" delay={0.2}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6" noValidate>
              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                <FormField label="Nome" htmlFor="contact-name" error={errors.name?.message}>
                  <input
                    {...register("name")}
                    type="text"
                    id="contact-name"
                    className="form-input"
                    placeholder=" "
                  />
                </FormField>
                <FormField label="Email" htmlFor="contact-email" error={errors.email?.message}>
                  <input
                    {...register("email")}
                    type="email"
                    id="contact-email"
                    className="form-input"
                    placeholder=" "
                  />
                </FormField>
              </div>

              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                <FormField label="Empresa (opcional)" htmlFor="contact-company">
                  <input
                    {...register("company")}
                    type="text"
                    id="contact-company"
                    className="form-input"
                    placeholder=" "
                  />
                </FormField>
                <FormField label="Tipo de projeto" htmlFor="contact-project-type" error={errors.projectType?.message}>
                  <select
                    {...register("projectType")}
                    id="contact-project-type"
                    className="form-input"
                    defaultValue=""
                  >
                    <option value="" disabled>Selecione</option>
                    {PROJECT_TYPES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField label="Mensagem" htmlFor="contact-message" error={errors.message?.message}>
                <textarea
                  {...register("message")}
                  id="contact-message"
                  rows={5}
                  className="form-input resize-none"
                  placeholder=" "
                />
              </FormField>

              <FormField label="Budget estimado (opcional)" htmlFor="contact-budget">
                <input
                  {...register("budget")}
                  type="text"
                  id="contact-budget"
                  className="form-input"
                  placeholder=" "
                />
              </FormField>

              <MagneticButton
                type="submit"
                disabled={status === "loading"}
                className="w-full cursor-pointer rounded-full border border-[var(--color-signal)] text-[var(--color-signal)] py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-200 hover:bg-[var(--color-signal)] hover:text-[var(--color-void)] disabled:cursor-not-allowed disabled:opacity-50 sm:py-4"
                style={{
                  fontFamily: "var(--font-body)",
                }}
              >
                {status === "loading" && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
                {status === "loading" ? "Enviando..." : "Enviar mensagem"}
              </MagneticButton>

              {status === "success" && (
                <div
                  className="flex items-center gap-2 rounded-xl border p-3 text-sm sm:p-4"
                  style={{
                    borderColor: "var(--color-matrix)",
                    backgroundColor: "rgba(0,255,136,0.05)",
                    color: "var(--color-matrix)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M6 10l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Mensagem enviada com sucesso!
                </div>
              )}

              {status === "error" && (
                <div
                  className="flex items-center gap-2 rounded-xl border p-3 text-sm animate-shake sm:p-4"
                  style={{
                    borderColor: "var(--color-alert)",
                    backgroundColor: "rgba(255,107,53,0.05)",
                    color: "var(--color-alert)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Erro ao enviar. Tente novamente ou use contato direto.
                </div>
              )}
            </form>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}

function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-medium uppercase tracking-wider"
        style={{
          fontFamily: "var(--font-mono)",
          color: error ? "var(--color-alert)" : "var(--color-text-muted)",
        }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p
          className="mt-1 text-xs"
          style={{ fontFamily: "var(--font-mono)", color: "var(--color-alert)" }}
        >
          {error}
        </p>
      )}
    </div>
  )
}
