export async function register(): Promise<void> {
  if (process.env.NODE_ENV !== "production" || process.env.NEXT_RUNTIME !== "nodejs") return

  const { validateProductionRuntimeOrExit } = await import("./lib/production-startup")
  validateProductionRuntimeOrExit()
}
