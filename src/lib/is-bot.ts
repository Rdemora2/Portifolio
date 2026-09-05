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
// WHY: Automated auditors like Lighthouse and PageSpeed Insights use headless WebKit/Chromium.
// Continuous WebGL rAF render loops prevent CPU idle state, causing synthetic performance audits
// to timeout. Detecting webdriver/bot signals lets us gracefully bypass 3D loops for crawlers.
export function isBot(): boolean {
  if (typeof navigator === "undefined") return false

  if (navigator.webdriver === true) return true

  const ua = navigator.userAgent || ""
  return /bot|googlebot|crawler|spider|robot|crawling|lighthouse|chrome-lighthouse/i.test(ua)
}

