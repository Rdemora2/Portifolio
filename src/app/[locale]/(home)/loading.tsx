"use client"

import { useTranslations } from "next-intl"

export default function Loading() {
  const t = useTranslations("Loading")

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[var(--color-void)]"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{t("label")}</span>
      <div className="relative h-12 w-12" aria-hidden="true">
        <div className="absolute inset-0 animate-ping rounded-full bg-[var(--color-signal)] opacity-20 motion-reduce:animate-none" />
        <div className="relative flex h-full w-full items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-sm border-2 border-[var(--color-signal)] motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  )
}
