"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#020408] text-white p-4 text-center font-sans">
        <h2 className="mb-4 text-3xl font-bold tracking-tight">
          Critical System Failure
        </h2>
        <p className="mb-8 text-gray-400 max-w-md">
          A critical error occurred at the root level. The application was unable to recover automatically.
        </p>
        <button
          onClick={() => reset()}
          className="rounded-full bg-[#00f2ff] px-8 py-3 text-sm font-bold text-[#020408] transition-transform hover:scale-105 active:scale-95"
        >
          Reboot Application
        </button>
        {process.env.NODE_ENV === "development" && (
          <pre className="mt-8 max-w-full overflow-auto rounded bg-red-950/20 p-4 text-left text-xs text-red-400 border border-red-900/50">
            {error.message}
            {error.stack}
          </pre>
        )}
      </body>
    </html>
  )
}
