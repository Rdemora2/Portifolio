import { expect, test } from "@playwright/test"

const editions = [
  { locale: "pt", about: "/sobre", experience: "/experiencia", privacy: "/privacidade", insights: "/insights" },
  { locale: "en", about: "/en/about", experience: "/en/experience", privacy: "/en/privacy", insights: "/en/insights" },
  { locale: "es", about: "/es/sobre", experience: "/es/experiencia", privacy: "/es/privacidad", insights: "/es/insights" },
] as const

for (const edition of editions) {
  test(`remaining pages support native reading navigation in ${edition.locale}`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 390, height: 844 } })
    try {
      const page = await context.newPage()
      await page.goto(edition.about)
      await page.locator('[data-page-hero] a[href="#faq"]').click()
      await expect(page.locator("#faq-title")).toBeInViewport()
      const question = page.locator("#faq summary").first()
      await question.focus()
      await page.keyboard.press("Enter")
      await expect(page.locator("#faq details").first()).toHaveAttribute("open", "")
      const faqData = await page.locator('#faq script[type="application/ld+json"]').textContent()
      expect(JSON.parse(faqData!).mainEntity[0].acceptedAnswer.text).toBe(await page.locator("#faq details p").first().textContent())

      await page.goto(edition.experience)
      await page.locator('[data-page-hero] a[href="#experience-buser-dev"]').click()
      await expect(page.locator("#experience-buser-dev h3")).toBeInViewport()
      const entryTop = await page.locator("#experience-buser-dev").evaluate((node) => node.getBoundingClientRect().top)
      expect(entryTop).toBeGreaterThanOrEqual(64)

      await page.goto(edition.privacy)
      await page.locator('aside a[href="#privacy-rights"]').click()
      await expect(page.locator("#privacy-rights-title")).toBeInViewport()
      await expect(page.locator("#privacy-rights a")).toHaveAttribute("href", /^mailto:/)

      await page.goto(edition.insights)
      const title = await page.locator("#insights h3").textContent()
      await page.locator("#insights article a").click()
      await expect(page.locator("h1")).toHaveText(title!)
      await expect(page.locator("[data-article-scene]")).toHaveCount(8)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    } finally {
      await context.close()
    }
  })
}
