"use client"

import "./fallback.css"

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <html lang="pt">
      <head>
        <title>Falha inesperada | Roberto Moraes</title>
      </head>
      <body className="fallback-body">
        <main className="fallback-shell">
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
            {process.env.NODE_ENV === "development" ? (
              <pre className="fallback-debug">
                {error.message}
                {error.stack}
              </pre>
            ) : null}
          </section>
        </main>
      </body>
    </html>
  )
}
