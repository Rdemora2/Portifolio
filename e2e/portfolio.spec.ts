import AxeBuilder from "@axe-core/playwright"
import { expect, type Page, test } from "@playwright/test"

const wcagTags = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
]

async function expectNoAccessibilityViolations(page: Page, surface: string) {
  const { violations } = await new AxeBuilder({ page }).withTags(wcagTags).analyze()
  const summary = violations.map(({ id, impact, nodes }) => ({
    id,
    impact,
    targets: nodes.map((node) => node.target),
  }))

  expect(summary, `${surface} must pass the automated WCAG audit`).toEqual([])

  const { violations: labelInNameViolations } = await new AxeBuilder({ page })
    .options({
      runOnly: {
        type: "rule",
        values: ["label-content-name-mismatch"],
      },
      rules: {
        "label-content-name-mismatch": { enabled: true },
      },
    })
    .analyze()
  const labelInNameSummary = labelInNameViolations.map(({ id, impact, nodes }) => ({
    id,
    impact,
    targets: nodes.map((node) => node.target),
  }))

  expect(
    labelInNameSummary,
    `${surface} must keep every visible label in its accessible name`,
  ).toEqual([])
}

test("serves the portfolio with strict security and localized SEO metadata", async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })

  const response = await request.get("/")
  expect(response.status()).toBe(200)

  const headers = response.headers()
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'")
  expect(headers["content-security-policy"]).toContain("script-src-attr 'none'")
  expect(headers["strict-transport-security"]).toContain("max-age=63072000")
  expect(headers["cross-origin-resource-policy"]).toBe("same-origin")
  expect(headers["origin-agent-cluster"]).toBe("?1")
  expect(headers["x-content-type-options"]).toBe("nosniff")
  expect(headers["x-frame-options"]).toBe("DENY")
  expect(headers.link ?? "").not.toContain("hreflang")

  await page.goto("/")
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR")
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    "Roberto Moraes",
  )
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://robertomoraes.dev",
  )
  await expect(page.locator('link[rel="alternate"][hreflang="en-US"]')).toHaveAttribute(
    "href",
    "https://robertomoraes.dev/en",
  )
})

test("normalizes the default locale and renders every supported language", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })

  await page.goto("/pt")
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR")

  await page.goto("/en")
  await expect(page.locator("html")).toHaveAttribute("lang", "en-US")
  await expect(page.getByRole("link", { name: "View Projects" })).toBeVisible()

  await page.goto("/es")
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX")
  await expect(page.getByRole("link", { name: "Ver Proyectos" })).toBeVisible()
})

test("preserves the query and hash when switching locales", async ({ page }) => {
  await page.goto("/en?source=e2e#projects")

  await page
    .getByRole("button", { name: "Switch language to Spanish" })
    .click()

  await expect(page).toHaveURL((url) => {
    return (
      url.pathname === "/es" &&
      url.searchParams.get("source") === "e2e" &&
      url.hash === "#projects"
    )
  })
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX")
})

test("keeps the reactive border exclusive to the three production metrics", async ({
  page,
}) => {
  await page.goto("/en/#metrics")

  const projectGlows = page.locator("#projects .border-glow-card")
  const metricGlows = page.locator("#metrics .border-glow-card")

  await expect(projectGlows).toHaveCount(0)
  await expect(metricGlows).toHaveCount(3)

  const metricLayout = await metricGlows.evaluateAll((cards) =>
    cards.map((card) => {
      const style = getComputedStyle(card)

      return {
        height: card.clientHeight,
        borderRadius: style.borderRadius,
        edgeSensitivity: style.getPropertyValue("--edge-sensitivity").trim(),
      }
    }),
  )

  expect(new Set(metricLayout.map(({ height }) => height)).size).toBe(1)
  expect(metricLayout).toEqual(
    Array.from({ length: 3 }, () => ({
      height: metricLayout[0]?.height,
      borderRadius: "16px",
      edgeSensitivity: "30",
    })),
  )

  const firstMetric = metricGlows.first()
  await firstMetric.scrollIntoViewIfNeeded()
  const box = await firstMetric.boundingBox()
  expect(box).not.toBeNull()

  if (!box) return

  await page.mouse.move(box.x + box.width - 2, box.y + box.height / 2)
  await expect
    .poll(() =>
      firstMetric.evaluate((card) =>
        Number.parseFloat(
          getComputedStyle(card).getPropertyValue("--edge-proximity"),
        ),
      ),
    )
    .toBeGreaterThan(95)
  await expect
    .poll(() =>
      firstMetric.evaluate((card) =>
        Number.parseFloat(getComputedStyle(card, "::before").opacity),
      ),
    )
    .toBeGreaterThan(0.5)

  await page.mouse.move(0, 0)
  await expect
    .poll(() =>
      firstMetric.evaluate((card) =>
        Number.parseFloat(
          getComputedStyle(card).getPropertyValue("--edge-proximity"),
        ),
      ),
    )
    .toBe(0)

  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.mouse.move(box.x + box.width - 2, box.y + box.height / 2)
  await expect
    .poll(() =>
      firstMetric.evaluate((card) =>
        Number.parseFloat(
          getComputedStyle(card).getPropertyValue("--edge-proximity"),
        ),
      ),
    )
    .toBe(0)
  await expect
    .poll(() =>
      firstMetric.evaluate((card) =>
        Number.parseFloat(getComputedStyle(card, "::before").opacity),
      ),
    )
    .toBe(0)
})

test("serves a localized, non-indexable 404 with a working return path", async ({
  page,
}) => {
  const response = await page.goto("/en/this-route-does-not-exist")

  expect(response?.status()).toBe(404)
  await expect(page.locator("html")).toHaveAttribute("lang", "en-US")
  await expect(page.getByText("Route not found", { exact: true })).toBeVisible()
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("404")
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/i,
  )

  await page.getByRole("link", { name: "Back to portfolio" }).click()
  await expect(page).toHaveURL(/\/en\/?$/)
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    "Roberto Moraes",
  )
})

test("publishes the article as an indexable, localized document", async ({ page }) => {
  await page.goto("/en/insights/go-em-producao", { waitUntil: "networkidle" })

  await expect(page.locator("html")).toHaveAttribute("lang", "en-US")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Go")
  await expect(page.locator("article section")).toHaveCount(8)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://robertomoraes.dev/en/insights/go-em-producao",
  )
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
    "content",
    "en_US",
  )
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://robertomoraes.dev/opengraph-image/article/en",
  )
  await expect(
    page.locator('link[rel="alternate"][hreflang="en-US"]'),
  ).toHaveAttribute(
    "href",
    "https://robertomoraes.dev/en/insights/go-em-producao",
  )
  const articleSchema = await page
    .locator('#main-content > script[type="application/ld+json"]')
    .textContent()
  expect(articleSchema).toContain("TechArticle")
  expect(articleSchema).toContain('"inLanguage":"en-US"')
})

test("publishes valid social, robots and sitemap endpoints", async ({ request }) => {
  const [
    defaultImage,
    englishImage,
    spanishImage,
    articleImage,
    robots,
    sitemap,
  ] = await Promise.all([
    request.get("/opengraph-image"),
    request.get("/opengraph-image/en"),
    request.get("/opengraph-image/es"),
    request.get("/opengraph-image/article/en"),
    request.get("/robots.txt"),
    request.get("/sitemap.xml"),
  ])

  for (const image of [defaultImage, englishImage, spanishImage, articleImage]) {
    expect(image.status()).toBe(200)
    expect(image.headers()["content-type"]).toContain("image/png")
    expect((await image.body()).byteLength).toBeGreaterThan(1_000)
  }
  expect(await robots.text()).toContain("Sitemap: https://robertomoraes.dev/sitemap.xml")

  const sitemapXml = await sitemap.text()
  expect(sitemap.status()).toBe(200)
  expect(sitemapXml).toContain("https://robertomoraes.dev/en/insights/go-em-producao")
  expect(sitemapXml).toContain('hreflang="en-US"')
  expect(sitemapXml).toContain('hreflang="x-default"')
})

test("passes automated WCAG audits on every primary surface", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })

  await page.goto("/en", { waitUntil: "networkidle" })
  await expectNoAccessibilityViolations(page, "Portfolio home")

  await page.goto("/en/#contact")
  await expect(page.getByRole("button", { name: "Send Message" })).toBeVisible()
  await expectNoAccessibilityViolations(page, "Contact form")

  await page.goto("/en/insights/go-em-producao", { waitUntil: "networkidle" })
  await expectNoAccessibilityViolations(page, "Published article")
})

test("keeps form validation localized and keyboard-first", async ({ page }) => {
  await page.goto("/en/#contact")
  const name = page.locator("#contact-name")

  await page.getByRole("button", { name: "Send Message" }).click()

  await expect(name).toHaveAttribute("aria-invalid", "true")
  await expect(name).toHaveAttribute("aria-describedby", "contact-name-error")
  await expect(name).toBeFocused()
  await expect(page.locator("#contact-email-error")).toHaveText(
    "Enter a valid email address.",
  )
  await expect(page.locator("#contact-project-type-error")).toBeVisible()
  await expect(page.locator("#contact-message-error")).toBeVisible()
})

test("enforces the configured production origin on the contact API", async ({ request }) => {
  const allowed = await request.post("/api/contact", {
    headers: { Origin: "https://robertomoraes.dev" },
    data: {},
  })
  expect(allowed.status()).toBe(400)

  const denied = await request.post("/api/contact", {
    headers: { Origin: "http://localhost:3100" },
    data: {},
  })
  expect(denied.status()).toBe(403)
})

test.describe("normal-motion project drawer", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } })

  test("keeps the projects section anchored while the first drawer loads", async ({
    page,
  }) => {
    await page.goto("/en/", { waitUntil: "networkidle" })
    await page.evaluate(async () => {
      document.documentElement.style.scrollBehavior = "auto"
      document.querySelector("#projects")?.scrollIntoView({ block: "start" })
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      })

      const main = document.querySelector("main")
      if (!(main instanceof HTMLElement)) {
        throw new Error("Portfolio main element was not found")
      }

      document.documentElement.dataset.mainHiddenDuringDrawerLoad = "false"
      const visibilityObserver = new MutationObserver(() => {
        if (getComputedStyle(main).display === "none") {
          document.documentElement.dataset.mainHiddenDuringDrawerLoad = "true"
        }
      })
      visibilityObserver.observe(main, {
        attributes: true,
        attributeFilter: ["style"],
      })
    })

    const opener = page.getByRole("button", {
      name: /Grupo Bandeirantes.*View details/,
    })
    await expect(opener).toBeVisible()

    let interceptedChunks = 0
    let releaseChunks: () => void = () => undefined
    const chunkGate = new Promise<void>((resolve) => {
      releaseChunks = resolve
    })
    await page.route("**/_next/static/chunks/*.js", async (route) => {
      interceptedChunks += 1
      await chunkGate
      await route.continue()
    })

    const projectContextIsVisible = async () => {
      const sectionIsVisible = await page
        .locator("#projects")
        .evaluate((element) => {
          const rect = element.getBoundingClientRect()
          return rect.bottom > 0 && rect.top < window.innerHeight
        })
      const openerIsVisible = await opener.evaluate((element) => {
        const rect = element.getBoundingClientRect()
        return rect.bottom > 0 && rect.top < window.innerHeight
      })
      return sectionIsVisible && openerIsVisible
    }

    await expect.poll(projectContextIsVisible).toBe(true)

    const openDrawer = opener.click()
    await expect.poll(() => interceptedChunks).toBeGreaterThan(0)
    await expect(page.locator("main")).toHaveCSS("display", "block")
    await expect(page.locator("html")).toHaveAttribute(
      "data-main-hidden-during-drawer-load",
      "false",
    )
    await expect.poll(projectContextIsVisible).toBe(true)

    releaseChunks()
    await openDrawer

    await expect(
      page.getByRole("dialog", { name: "Grupo Bandeirantes" }),
    ).toBeVisible()
    await expect(page.locator("html")).toHaveAttribute(
      "data-main-hidden-during-drawer-load",
      "false",
    )
    await expect.poll(projectContextIsVisible).toBe(true)
  })

  test("keeps the latest filter intent when an animation import fails", async ({
    page,
  }) => {
    const pageErrors: string[] = []
    let abortedChunks = 0
    page.on("pageerror", (error) => pageErrors.push(error.message))

    await page.goto("/en/#projects", { waitUntil: "networkidle" })
    await page.route("**/_next/static/chunks/*.js", (route) => {
      abortedChunks += 1
      return route.abort()
    })

    await page.getByRole("button", { name: "International", exact: true }).click()
    await expect(
      page.getByRole("button", { name: "International", exact: true }),
    ).toHaveAttribute("aria-pressed", "true")
    await expect(
      page.getByRole("button", { name: /Fiesta Americana.*View details/ }),
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: /Grupo Bandeirantes.*View details/ }),
    ).toHaveCount(0)

    expect(abortedChunks).toBeGreaterThan(0)
    expect(pageErrors).toEqual([])
  })

  test("traps and restores focus, survives rapid reopen and completes CountUp", async ({
    page,
  }) => {
    const desktopViewport = page.viewportSize()
    await page.goto("/en/#projects")

    const opener = page.getByRole("button", {
      name: /Grupo Bandeirantes.*View details/,
    })
    await opener.focus()
    await opener.press("Enter")

    const dialog = page.getByRole("dialog", { name: "Grupo Bandeirantes" })
    const closeButton = dialog.getByRole("button", { name: "Close details" })
    await expect(dialog).toBeVisible()
    await expect(closeButton).toBeFocused()
    await expect
      .poll(() => page.evaluate(() => document.documentElement.style.overflow))
      .toBe("hidden")

    await page.keyboard.press("Tab")
    await expect(closeButton).toBeFocused()
    await page.keyboard.press("Shift+Tab")
    await expect(closeButton).toBeFocused()

    const migratedPortals = dialog
      .getByText("Portals migrated", { exact: true })
      .locator("..")
      .locator("span")
      .first()

    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden({ timeout: 400 })
    await opener.press("Enter")
    await expect(dialog).toBeVisible()
    await page.waitForTimeout(650)
    await expect(dialog).toBeVisible()
    await expect(migratedPortals).toHaveText("6+", { timeout: 4_000 })

    await page.setViewportSize({ width: 390, height: 844 })
    await expect
      .poll(() =>
        dialog.evaluate((element) => {
          const rect = element.getBoundingClientRect()
          return {
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
          }
        }),
      )
      .toEqual({ left: 0, right: 390, width: 390 })

    if (desktopViewport) await page.setViewportSize(desktopViewport)

    await dialog.getByRole("button", { name: "Close details" }).click()
    await expect(dialog).toBeHidden()
    await expect(opener).toBeFocused()
    await expect
      .poll(() => page.evaluate(() => document.documentElement.style.overflow))
      .toBe("")
  })
})

test.describe("mobile experience", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    contextOptions: { reducedMotion: "reduce" },
  })

  test("traps and restores focus in the menu without horizontal overflow", async ({
    page,
  }) => {
    await page.goto("/")
    const trigger = page.getByRole("button", { name: "Abrir menu" })

    await trigger.click()
    const dialog = page.getByRole("dialog", { name: "Menu de navegação" })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole("link", { name: "Sobre" })).toBeFocused()

    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    )
    expect(overflows).toBe(false)
  })
})

test("loads without uncaught runtime or console errors in reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })

  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })

  await page.goto("/#%E0%A4%A", { waitUntil: "networkidle" })
  expect(errors).toEqual([])
})
