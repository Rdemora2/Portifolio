import { expect, test } from "@playwright/test"

test("offers the article chapter index on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/en/insights/go-in-production", {
    waitUntil: "domcontentloaded",
  })

  const index = page.locator("[data-article-mobile-index]")
  await expect(index).toBeVisible()
  await index.locator("summary").click()

  const links = index.getByRole("navigation").getByRole("link")
  await expect(links).toHaveCount(8)
  await expect(links.first()).toHaveAttribute("href", /^#.+/)
  await links.nth(1).click()
  await expect(page).toHaveURL(/#.+/)
  await expect(index).not.toHaveAttribute("open")
  const destinationId = new URL(page.url()).hash.slice(1)
  await expect(page.locator(`#${destinationId} h2`)).toBeFocused()
})

test("leaves chapter navigation to the desktop experience on wide screens", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/en/insights/go-in-production", {
    waitUntil: "domcontentloaded",
  })

  await expect(page.locator("[data-article-mobile-index]")).toBeHidden()
  await expect(
    page.locator("[data-article-stage]").getByRole("navigation"),
  ).toBeVisible()
})
