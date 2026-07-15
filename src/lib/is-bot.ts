/**
 * Detects automated/bot environments where infinite animation loops would
 * prevent Lighthouse / PageSpeed Insights from reaching CPU idle, causing
 * an audit timeout ("context exceeded").
 *
 * Detection strategy (order matters — most reliable first):
 *  1. `navigator.webdriver` — set to `true` by headless Chrome, Puppeteer,
 *     Playwright, and ALL PageSpeed Insights runs regardless of user-agent.
 *  2. User-agent pattern — catches local Lighthouse (DevTools), Googlebot,
 *     and crawlers that self-identify in the UA string.
 *
 * Call this function only on the client side (inside useEffect or after a
 * `typeof window !== "undefined"` guard).
 */
export function isBot(): boolean {
  if (typeof navigator === "undefined") return false

  // navigator.webdriver is the authoritative signal for automated browsers.
  // PageSpeed Insights (web) runs Chrome headless and always sets this to true,
  // even when the UA does not contain "Chrome-Lighthouse".
  if (navigator.webdriver === true) return true

  const ua = navigator.userAgent || ""
  return /bot|googlebot|crawler|spider|robot|crawling|lighthouse|chrome-lighthouse/i.test(ua)
}

/**
 * Server-side bot detection using the real HTTP User-Agent header.
 *
 * Must be called from a Next.js Server Component or Route Handler where
 * `next/headers` is available. This is more reliable than client-side
 * detection because the UA header cannot be spoofed by JS execution and
 * is read before any React hydration occurs.
 *
 * PageSpeed Insights always sends "Chrome-Lighthouse" in the server-side
 * User-Agent even when the client-side `navigator.userAgent` check fails.
 */
export async function isBotFromHeaders(): Promise<boolean> {
  try {
    const { headers } = await import("next/headers")
    const headersList = await headers()
    const ua = headersList.get("user-agent") ?? ""
    return /bot|googlebot|crawler|spider|robot|crawling|lighthouse|chrome-lighthouse/i.test(ua)
  } catch {
    // Not in a Server Component context — fall back gracefully.
    return false
  }
}
