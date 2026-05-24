export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-void)]">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 animate-ping rounded-full bg-[var(--color-signal)] opacity-20" />
        <div className="relative flex h-full w-full items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-sm border-2 border-[var(--color-signal)]" />
        </div>
      </div>
    </div>
  )
}
