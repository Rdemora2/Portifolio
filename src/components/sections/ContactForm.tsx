"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { contactSchema, type ContactSchema } from "@/lib/validations"
import { MagneticButton } from "@/components/shared/MagneticButton"
import { useTranslations } from "next-intl"

type ServerErrorKey = "rateLimited" | "generic"
type IdempotencyState = { key: string; createdAt: number }

const IDEMPOTENCY_STORAGE_KEY = "portfolio-contact-idempotency"
const IDEMPOTENCY_TTL_MS = 23 * 60 * 60 * 1_000
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9_-]{16,128}$/

function createRequestIdempotencyKey(): string | null {
  try {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID()
    }

    const bytes = crypto.getRandomValues(new Uint8Array(16))
    return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("")
  } catch {
    return null
  }
}

function readStoredIdempotency(now = Date.now()): IdempotencyState | null {
  try {
    const raw = sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY)
    if (!raw) return null

    const value = JSON.parse(raw) as Partial<IdempotencyState>
    if (
      typeof value.key !== "string" ||
      !IDEMPOTENCY_KEY_PATTERN.test(value.key) ||
      typeof value.createdAt !== "number" ||
      !Number.isFinite(value.createdAt) ||
      value.createdAt > now ||
      now - value.createdAt >= IDEMPOTENCY_TTL_MS
    ) {
      sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY)
      return null
    }

    return { key: value.key, createdAt: value.createdAt }
  } catch {
    return null
  }
}

function writeStoredIdempotency(value: IdempotencyState): void {
  try {
    sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, JSON.stringify(value))
  } catch {
    // The in-memory ref remains available when storage is blocked or full.
  }
}

function clearStoredIdempotency(): void {
  try {
    sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY)
  } catch {
    // Storage availability must not affect the contact flow.
  }
}

export function ContactForm() {
  const t = useTranslations("Contact")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [serverError, setServerError] = useState<ServerErrorKey>("generic")
  const isMounted = useRef(true)
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestControllerRef = useRef<AbortController | null>(null)
  const idempotencyRef = useRef<IdempotencyState | null>(null)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
      requestControllerRef.current?.abort()
    }
  }, [])

  const clearStatusTimer = () => {
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current)
      statusTimerRef.current = null
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactSchema>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactSchema) => {
    clearStatusTimer()
    requestControllerRef.current?.abort()
    const controller = new AbortController()
    requestControllerRef.current = controller
    setStatus("loading")
    setServerError("generic")
    let errorKey: ServerErrorKey = "generic"
    const payload = JSON.stringify(data)
    const now = Date.now()
    let idempotency = idempotencyRef.current
    if (
      idempotency &&
      (idempotency.createdAt > now || now - idempotency.createdAt >= IDEMPOTENCY_TTL_MS)
    ) {
      idempotencyRef.current = null
      clearStoredIdempotency()
      idempotency = null
    }
    idempotency ??= readStoredIdempotency(now)
    if (!idempotency) {
      const key = createRequestIdempotencyKey()
      if (key) {
        idempotency = { key, createdAt: now }
        idempotencyRef.current = idempotency
        writeStoredIdempotency(idempotency)
      }
    } else {
      idempotencyRef.current = idempotency
    }
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (idempotency?.key) {
        headers["Idempotency-Key"] = idempotency.key
      }

      const res = await fetch("/api/contact", {
        method: "POST",
        headers,
        body: payload,
        signal: controller.signal,
      })
      if (!res.ok) {
        if (res.status === 429) errorKey = "rateLimited"
        throw new Error("Contact request failed")
      }
      if (isMounted.current) {
        idempotencyRef.current = null
        clearStoredIdempotency()
        setStatus("success")
        reset()
        statusTimerRef.current = setTimeout(() => {
          if (isMounted.current) setStatus("idle")
          statusTimerRef.current = null
        }, 5000)
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      if (isMounted.current) {
        setServerError(errorKey)
        setStatus("error")
      }
    } finally {
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null
      }
    }
  }

  return (
    <>
      <form
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        className="space-y-4 sm:space-y-6"
        aria-busy={status === "loading"}
        toolname="prepare_portfolio_contact"
        tooldescription={t("form.webMcp.toolDescription")}
        noValidate
      >
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
          <FormField
            label={t("form.name")}
            htmlFor="contact-name"
            error={errors.name ? t("form.validation.name") : undefined}
          >
            <input
              {...register("name")}
              type="text"
              id="contact-name"
              className="form-input"
              placeholder=" "
              autoComplete="name"
              minLength={2}
              maxLength={100}
              required
              toolparamdescription={t("form.webMcp.parameters.name")}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
            />
          </FormField>
          <FormField
            label={t("form.email")}
            htmlFor="contact-email"
            error={errors.email ? t("form.validation.email") : undefined}
          >
            <input
              {...register("email")}
              type="email"
              id="contact-email"
              className="form-input"
              placeholder=" "
              autoComplete="email"
              maxLength={254}
              required
              toolparamdescription={t("form.webMcp.parameters.email")}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "contact-email-error" : undefined}
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
          <FormField label={t("form.company")} htmlFor="contact-company">
            <input
              {...register("company")}
              type="text"
              id="contact-company"
              className="form-input"
              placeholder=" "
              autoComplete="organization"
              maxLength={120}
              toolparamdescription={t("form.webMcp.parameters.company")}
            />
          </FormField>
          <FormField
            label={t("form.subject")}
            htmlFor="contact-subject"
            error={
              errors.subject ? t("form.validation.subject") : undefined
            }
          >
            <input
              {...register("subject")}
              type="text"
              id="contact-subject"
              className="form-input"
              placeholder=" "
              maxLength={160}
              required
              toolparamdescription={t("form.webMcp.parameters.subject")}
              aria-invalid={errors.subject ? true : undefined}
              aria-describedby={
                errors.subject ? "contact-subject-error" : undefined
              }
            />
          </FormField>
        </div>

        <FormField
          label={t("form.message")}
          htmlFor="contact-message"
          error={errors.message ? t("form.validation.message") : undefined}
        >
          <textarea
            {...register("message")}
            id="contact-message"
            rows={5}
            className="form-input resize-none"
            placeholder=" "
            minLength={20}
            maxLength={4_000}
            required
            toolparamdescription={t("form.webMcp.parameters.message")}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
          />
        </FormField>

        <MagneticButton
          type="submit"
          disabled={status === "loading"}
          wrapperClassName="w-full"
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
            role="status"
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
            {t(`form.serverErrors.${serverError}`)}
          </div>
        )}
      </form>

      {/*
        Keep the honeypot registered with React Hook Form but outside the
        annotated form so agents never receive it as a legitimate parameter.
      */}
      <div hidden>
        <label htmlFor="botCheck">Don&apos;t fill this out if you&apos;re human:</label>
        <input
          {...register("botCheck")}
          type="text"
          id="botCheck"
          tabIndex={-1}
          autoComplete="off"
          maxLength={200}
        />
      </div>
    </>
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
          id={`${htmlFor}-error`}
          className="mt-1 text-xs"
          style={{ fontFamily: "var(--font-mono)", color: "var(--color-alert)" }}
        >
          {error}
        </p>
      )}
    </div>
  )
}
