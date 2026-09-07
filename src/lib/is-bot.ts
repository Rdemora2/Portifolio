/**
 * Selects the static decorative fallback for automation and self-identified
 * crawlers. Page content and navigation remain the same.
 *
 * Detection strategy (order matters — most reliable first):
 *  1. `navigator.webdriver` — when exposed by the automation configuration.
 *  2. User-agent pattern — crawlers and tools that identify themselves.
 * Neither signal is universal: a headless browser can still run the full effect.
 * WebGL integration tests therefore exercise an explicitly capable visitor too.
 *
 * Call this function only on the client side (inside useEffect or after a
 * `typeof window !== "undefined"` guard).
 */
export function isBot(): boolean {
  if (typeof navigator === "undefined") return false

  if (navigator.webdriver === true) return true

  const ua = navigator.userAgent || ""
  return /bot|googlebot|crawler|spider|robot|crawling|lighthouse|chrome-lighthouse/i.test(ua)
}
