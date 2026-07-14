"use client"

import { useEffect, useRef } from "react"
import { useTranslations } from "next-intl"

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  const t = useTranslations("Error")
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    console.error("Layout/Page Error:", error)
    const focusFrame = requestAnimationFrame(() => {
      mainRef.current?.focus({ preventScroll: true })
    })

    return () => cancelAnimationFrame(focusFrame)
  }, [error])

  return (
    <main
      ref={mainRef}
      id="main-content"
      role="alert"
      tabIndex={-1}
      className="flex min-h-screen flex-col items-center justify-center p-4 text-center focus:outline-none"
    >
      <h1 className="mb-4 text-2xl font-bold text-[var(--color-text-primary)]">
        {t("title")}
      </h1>
      <p className="mb-8 text-[var(--color-text-secondary)]">
        {t("message")}
      </p>
      <button
        onClick={unstable_retry}
        className="rounded-full bg-[var(--color-signal)] px-6 py-2 text-sm font-medium text-[var(--color-void)] transition-opacity hover:opacity-90"
      >
        {t("retry")}
      </button>
    </main>
  )
}
