import { expect, type Page, test } from "@playwright/test"

type RuntimeErrors = {
  console: string[]
  page: string[]
}

function captureRuntimeErrors(page: Page): RuntimeErrors {
  const errors: RuntimeErrors = { console: [], page: [] }

  page.on("console", (message) => {
    if (message.type() === "error") errors.console.push(message.text())
  })
  page.on("pageerror", (error) => errors.page.push(error.message))

  return errors
}

function expectNoRuntimeErrors(errors: RuntimeErrors, surface: string) {
  expect(errors.page, `${surface} must not raise uncaught page errors`).toEqual([])
  expect(errors.console, `${surface} must not emit console.error`).toEqual([])
}

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => ({
        body: Math.max(0, document.body.scrollWidth - window.innerWidth),
        document: Math.max(
          0,
          document.documentElement.scrollWidth - window.innerWidth,
        ),
      })),
    )
    .toEqual({ body: 0, document: 0 })
}

async function bridgeUpgradedLoopbackAssets(
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

  // WebKit correctly applies the production `upgrade-insecure-requests` CSP
  // even to a loopback HTTP test server. Fetch the upgraded same-app assets
  // through its HTTP endpoint; deployed production remains native HTTPS.
  await page.route(`${upgradedOrigin.origin}/_next/**`, async (route) => {
    const sourceURL = new URL(route.request().url())
    sourceURL.protocol = "http:"
    const response = await route.fetch({ url: sourceURL.href })

    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        "access-control-allow-origin": server.origin,
        "cross-origin-resource-policy": "cross-origin",
      },
    })
  })
}

test.beforeEach(async ({ page }, testInfo) => {
  await bridgeUpgradedLoopbackAssets(page, testInfo.project.use.baseURL)
})

test("renders the localized home without engine-specific regressions", async ({
  page,
}) => {
  const runtimeErrors = captureRuntimeErrors(page)

  await page.goto("/en", { waitUntil: "domcontentloaded" })

  await expect(
    page.locator("[data-projects-client][data-hydrated='true']"),
  ).toHaveCount(1)
  await expect(page.locator("html")).toHaveAttribute("lang", "en-US")
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    "Roberto Moraes",
  )
  await expect(
    page.getByRole("link", { name: "PT — Switch language to Portuguese" }),
  ).toHaveAttribute("href", "/pt")
  await expect(page.locator("[data-experience-list] > li")).toHaveCount(5)
  const websiteCards = page.locator("[data-website-card]")
  const websiteLinks = page.locator("[data-website-link]")
  await expect(websiteCards).toHaveCount(5)
  await expect(websiteLinks).toHaveCount(5)
  await expect(websiteLinks.nth(0)).toHaveAttribute(
    "href",
    "https://lp-institucional-vendas.vercel.app/",
  )
  await expect(websiteLinks.nth(1)).toHaveAttribute(
    "href",
    "https://lp-institucional-advocacia.vercel.app/",
  )
  await expect(websiteLinks.nth(2)).toHaveAttribute(
    "href",
    "https://front-site-tivix-technologies.vercel.app/",
  )
  await expect(websiteLinks.nth(0)).toHaveAttribute("target", "_blank")
  await expect(websiteLinks.nth(0)).toHaveAccessibleName(/opens in a new tab/i)
  await expectNoHorizontalOverflow(page)
  expectNoRuntimeErrors(runtimeErrors, "Localized home")
})

test("keeps the immersive article progressive and readable", async ({
  browser,
  page,
}, testInfo) => {
  const runtimeErrors = captureRuntimeErrors(page)

  await page.goto("/en/insights/go-em-producao", {
    waitUntil: "domcontentloaded",
  })

  await expect(page.locator("[data-article-experience]")).toHaveAttribute(
    "data-motion",
    /^(?:full|reduced)$/,
  )
  await expect(
    page.locator("article").filter({ has: page.locator("h1") }),
  ).toHaveCount(1)
  await expect(page.locator("[data-article-scene]")).toHaveCount(8)
  await expect(page.locator("[data-hero-copy]")).toHaveCSS("opacity", "1")
  await expectNoHorizontalOverflow(page)

  const noScriptPage = await browser.newPage({
    baseURL: testInfo.project.use.baseURL,
    javaScriptEnabled: false,
  })
  try {
    await bridgeUpgradedLoopbackAssets(
      noScriptPage,
      testInfo.project.use.baseURL,
    )
    await noScriptPage.goto("/en/insights/go-em-producao", {
      waitUntil: "domcontentloaded",
    })
    await expect(noScriptPage.locator("[data-hero-sticky]")).toHaveCSS(
      "position",
      "relative",
    )
    await expect(noScriptPage.locator("[data-article-progress]")).toBeHidden()
    await expect(noScriptPage.locator("[data-article-stage]")).toBeHidden()
    await expect(noScriptPage.locator("[data-article-scene]")).toHaveCount(8)
    await expectNoHorizontalOverflow(noScriptPage)
  } finally {
    await noScriptPage.close()
  }

  expectNoRuntimeErrors(runtimeErrors, "Immersive article")
})

test("keeps the project drawer modal and keyboard-safe", async ({ page }) => {
  const runtimeErrors = captureRuntimeErrors(page)

  await page.goto("/en/#projects", { waitUntil: "domcontentloaded" })
  await expect(
    page.locator("[data-projects-client][data-hydrated='true']"),
  ).toHaveCount(1)
  const opener = page.getByRole("button", {
    name: /Grupo Bandeirantes.*View details/,
  })
  await opener.click()

  const dialog = page.getByRole("dialog", { name: "Grupo Bandeirantes" })
  const closeButton = dialog.getByRole("button", { name: "Close details" })
  await expect(dialog).toBeVisible()
  await expect(closeButton).toBeFocused()
  await expect
    .poll(() => page.evaluate(() => document.documentElement.style.overflow))
    .toBe("hidden")

  await closeButton.click()
  await expect(dialog).toBeHidden()
  await expect(opener).toBeFocused()
  await expectNoHorizontalOverflow(page)
  expectNoRuntimeErrors(runtimeErrors, "Project drawer")
})
