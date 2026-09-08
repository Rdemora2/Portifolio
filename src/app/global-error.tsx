"use client"

import { useEffect, useRef } from "react"

import "./fallback.css"

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const focusFrame = requestAnimationFrame(() => {
      mainRef.current?.focus({ preventScroll: true })
    })

    return () => cancelAnimationFrame(focusFrame)
  }, [error])

  return (
    <html lang="pt">
      <head>
        <title>Falha inesperada | Roberto Moraes</title>
      </head>
      <body className="fallback-body">
        <main
          ref={mainRef}
          className="fallback-shell"
          role="alert"
          tabIndex={-1}
        >
          <div className="fallback-grid" aria-hidden="true" />
          <section className="fallback-card" aria-labelledby="global-error-title">
            <p className="fallback-eyebrow">Falha temporária</p>
            <h1
              id="global-error-title"
              className="fallback-title fallback-title--error"
            >
              Algo saiu do fluxo
            </h1>
            <p className="fallback-copy">
              Não foi possível concluir esta renderização. Tente novamente; seus
              dados de navegação permanecem protegidos.
            </p>
            <button className="fallback-action" onClick={unstable_retry}>
              Tentar novamente
            </button>
          </section>
        </main>
      </body>
    </html>
  )
}
