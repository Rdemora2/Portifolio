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
      className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[var(--color-void)] px-6 py-24 text-center focus:outline-none"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 22% 18%, rgba(99, 102, 241, 0.24), transparent 32%), radial-gradient(circle at 78% 82%, rgba(0, 212, 255, 0.1), transparent 30%)",
        }}
        aria-hidden="true"
      />
      <section
        className="w-full max-w-2xl rounded-[1.75rem] border border-[var(--color-edge)] bg-[rgba(10,16,24,0.72)] px-6 py-12 shadow-2xl sm:px-12 sm:py-16"
        aria-labelledby="route-error-title"
      >
        <p className="mb-5 font-mono text-xs uppercase tracking-[0.24em] text-[var(--color-alert)]">
          ERR / 500
        </p>
        <h1
          id="route-error-title"
          className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-5xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("title")}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
          {t("message")}
        </p>
        <button
          onClick={unstable_retry}
          className="mt-9 inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--color-signal)] bg-[var(--color-signal)] px-7 py-3 text-sm font-semibold text-[var(--color-void)] transition-[opacity,transform] hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-highlight)] motion-reduce:transform-none motion-reduce:transition-none"
        >
          {t("retry")}
        </button>
      </section>
    </main>
  )
}
