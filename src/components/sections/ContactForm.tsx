"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { contactSchema, type ContactSchema } from "@/lib/validations"
import { MagneticButton } from "@/components/shared/MagneticButton"
import { useTranslations } from "next-intl"

const PROJECT_TYPES = [
  { value: "web", label: "Aplicação Web" },
  { value: "mobile", label: "Mobile Nativo" },
  { value: "backend", label: "Backend / API" },
  { value: "architecture", label: "Arquitetura" },
  { value: "leadership", label: "Gestão / Liderança" },
  { value: "other", label: "Outro" },
] as const

export function ContactForm() {
  const t = useTranslations("Contact")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

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
      if (isMounted.current) {
        setStatus("success")
        reset()
        setTimeout(() => {
          if (isMounted.current) setStatus("idle")
        }, 5000)
      }
    } catch {
      if (isMounted.current) {
        setStatus("error")
        setTimeout(() => {
          if (isMounted.current) setStatus("idle")
        }, 4000)
      }
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4 sm:space-y-6" noValidate>
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
        <FormField label={t("form.name")} htmlFor="contact-name" error={errors.name?.message}>
          <input
            {...register("name")}
            type="text"
            id="contact-name"
            className="form-input"
            placeholder=" "
          />
        </FormField>
        <FormField label={t("form.email")} htmlFor="contact-email" error={errors.email?.message}>
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
        <FormField label={t("form.company") || "Empresa (opcional)"} htmlFor="contact-company">
          <input
            {...register("company")}
            type="text"
            id="contact-company"
            className="form-input"
            placeholder=" "
          />
        </FormField>
        <FormField label={t("form.projectType") || "Tipo de projeto"} htmlFor="contact-project-type" error={errors.projectType?.message}>
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

      <FormField label={t("form.message")} htmlFor="contact-message" error={errors.message?.message}>
        <textarea
          {...register("message")}
          id="contact-message"
          rows={5}
          className="form-input resize-none"
          placeholder=" "
        />
      </FormField>

      <FormField label={t("form.budget") || "Budget estimado (opcional)"} htmlFor="contact-budget">
        <input
          {...register("budget")}
          type="text"
          id="contact-budget"
          className="form-input"
          placeholder=" "
        />
      </FormField>

      {/* Honeypot anti-spam field */}
      <div className="absolute opacity-0 -z-10 w-0 h-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="botCheck">Don&apos;t fill this out if you&apos;re human:</label>
        <input
          {...register("botCheck")}
          type="text"
          id="botCheck"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <MagneticButton
        type="submit"
        disabled={status === "loading"}
        className="w-full cursor-pointer rounded-full border border-[var(--color-signal)] text-[var(--color-signal)] px-4 py-3 text-xs font-semibold uppercase tracking-widest transition-all duration-200 hover:bg-[var(--color-signal)] hover:text-[var(--color-void)] disabled:cursor-not-allowed disabled:opacity-50 sm:py-4 sm:text-sm"
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
        {status === "loading" ? t("form.sending") : t("form.send")}
      </MagneticButton>

      {status === "success" && (
        <div
          role="alert"
          aria-live="polite"
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
          {t("form.success")}
        </div>
      )}

      {status === "error" && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-center gap-2 rounded-xl border p-3 text-sm animate-shake sm:p-4"
          style={{
            borderColor: "var(--color-alert)",
            backgroundColor: "rgba(255,107,53,0.05)",
            color: "var(--color-alert)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {t("form.error") || "Erro ao enviar. Tente novamente ou use contato direto."}
        </div>
      )}
    </form>
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
