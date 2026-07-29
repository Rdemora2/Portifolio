import type { Page } from "@playwright/test"

export async function bridgeUpgradedLoopbackRequests(
  page: Page,
  baseURL: string | undefined,
) {
  if (!baseURL) return

  const server = new URL(baseURL)
  const isLoopback = ["localhost", "127.0.0.1", "[::1]"].includes(
    server.hostname,
  )
  if (server.protocol !== "http:" || !isLoopback) return

  const upgradedOrigin = new URL(server.origin)
  upgradedOrigin.protocol = "https:"

  await page.route(`${upgradedOrigin.origin}/**`, async (route) => {
    try {
      const sourceURL = new URL(route.request().url())
      sourceURL.protocol = "http:"
      const response = await route.fetch({ url: sourceURL.href })
      const body = await response.body()

      await route.fulfill({
        body,
        headers: {
          ...response.headers(),
          "access-control-allow-credentials": "true",
          "access-control-allow-origin": server.origin,
          "cross-origin-resource-policy": "cross-origin",
        },
        status: response.status(),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const requestWasCancelled =
        /disposed|closed|cancelled|canceled|already handled/i.test(message)

      if (!requestWasCancelled) throw error

      try {
        await route.abort("aborted")
      } catch {
        // WebKit may dispose a speculative RSC prefetch and its route together.
      }
    }
  })
}
