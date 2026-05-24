"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations("Error")

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Layout/Page Error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h2 className="mb-4 text-2xl font-bold text-[var(--color-text-primary)]">
        {t("title")}
      </h2>
      <p className="mb-8 text-[var(--color-text-secondary)]">
        {t("message")}
      </p>
      <button
        onClick={() => reset()}
        className="rounded-full bg-[var(--color-signal)] px-6 py-2 text-sm font-medium text-[var(--color-void)] transition-opacity hover:opacity-90"
      >
        {t("retry")}
      </button>
    </div>
  )
}
