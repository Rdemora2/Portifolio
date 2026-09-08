import { expect, test } from "@playwright/test"

test("gallery enhancement preserves the position of the case narrative", async ({ browser, baseURL }) => {
  for (const width of [390, 1440]) {
    const heights: number[] = []
    for (const javaScriptEnabled of [false, true]) {
      const context = await browser.newContext({ baseURL, javaScriptEnabled, reducedMotion: "reduce", viewport: { width, height: 900 } })
      try {
        const page = await context.newPage()
        await page.goto("/en/work/hospital-sirio-libanes")
        const gallery = page.locator("[data-project-gallery]")
        await gallery.scrollIntoViewIfNeeded()
        if (javaScriptEnabled) await expect(gallery.locator(".swiper-initialized")).toBeVisible()
        await page.evaluate(() => document.fonts.ready)
        heights.push(await gallery.evaluate((node) => node.getBoundingClientRect().height))
      } finally {
        await context.close()
      }
    }
    expect(Math.abs(heights[0]! - heights[1]!)).toBeLessThan(2)
  }
})

const slugs = ["hospital-sirio-libanes", "band-news-bandsports", "fiesta-americana"]
for (const [locale, base] of [["pt", "/projetos"], ["en", "/en/work"], ["es", "/es/proyectos"]] as const) {
  test(`project reading flow and section navigation in ${locale}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto(base)
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
    await expect(page.locator("[data-work-cases] [data-project-card]")).toHaveCount(3)
    for (const slug of slugs) {
      await page.goto(`${base}/${slug}`)
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
      const contents = page.locator("[data-case-study] aside nav")
      await expect(contents.getByRole("link")).toHaveCount(slug === "band-news-bandsports" ? 6 : 5)
      await contents.locator('a[href="#architecture"]').click()
      await expect(page).toHaveURL(/#architecture$/)
      await expect(page.locator("#architecture h2")).toBeInViewport()
      await expect(page.locator("#architecture dl > div")).toHaveCount(3)
      for (const width of [320, 1440]) {
        await page.setViewportSize({ width, height: 900 })
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      }
      const nextCase = page.locator("[data-case-study] footer a").first()
      await nextCase.click()
      await expect(page).not.toHaveURL(new RegExp(`${slug}(?:#.*)?$`))
      await expect(page.locator("[data-case-study]")).toBeVisible()
    }
  })
}
