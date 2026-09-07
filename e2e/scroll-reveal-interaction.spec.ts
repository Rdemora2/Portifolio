import { expect, test, type Locator, type Page } from "@playwright/test"

test.use({
  viewport: { width: 1280, height: 480 },
  contextOptions: { reducedMotion: "no-preference" },
})

async function holdArticleEntrance(page: Page): Promise<Locator> {
  await page.goto("/en/insights", { waitUntil: "networkidle" })
  const articleLink = page.getByRole("link", { name: /Read full article/i })
  await articleLink.scrollIntoViewIfNeeded()
  const animationWasPaused = await articleLink.evaluate(async (link) => {
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    )
    const reveal = link.closest("[data-scroll-reveal]")
    const animation = reveal?.getAnimations()[0]
    if (!animation) return false
    animation.pause()
    animation.currentTime = 0
    return true
  })
  expect(animationWasPaused).toBe(true)
  return articleLink
}

test("keeps a pointer click on an article stable during its entrance", async ({ page }) => {
  // Hold the real entrance at its initial position so focus and pointer release
  // exercise the same geometry regardless of runner speed.
  const articleLink = await holdArticleEntrance(page)
  await articleLink.click()
  await expect(page).toHaveURL(/\/en\/insights\/go-in-production$/)
})

test("reveals the article immediately when reached with the keyboard", async ({ page }) => {
  const articleLink = await holdArticleEntrance(page)
  for (let step = 0; step < 30; step += 1) {
    await page.keyboard.press("Tab")
    if (await articleLink.evaluate((link) => link === document.activeElement)) break
  }
  await expect(articleLink).toBeFocused()
  const reveal = page.locator("[data-scroll-reveal]").filter({ has: articleLink })
  await expect(reveal).toHaveCSS("transform", "none")
  await expect(reveal).toHaveCSS("opacity", "1")
  await page.keyboard.press("Enter")
  await expect(page).toHaveURL(/\/en\/insights\/go-in-production$/)
})
