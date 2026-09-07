import { expect, test } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

test("home content and links work without JavaScript in every language", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
  const page = await context.newPage()
  for (const path of ["/", "/en", "/es"]) {
    await page.goto(path)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    expect(await page.locator("[data-scroll-reveal]").evaluateAll((elements) =>
      elements.every((element) => getComputedStyle(element).opacity === "1"),
    )).toBe(true)
    const project = page.locator("[data-project-link='hospital-sirio-libanes']")
    await project.click()
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hospital Sírio-Libanês")
  }
  await context.close()
})

test("blocked application chunks leave server content visible", async ({ page }) => {
  await page.route("**/_next/**/*.js*", (route) => route.abort())
  await page.goto("/", { waitUntil: "domcontentloaded" })
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  const reveals = page.locator("[data-scroll-reveal]")
  expect(await reveals.count()).toBeGreaterThan(10)
  expect(await reveals.evaluateAll((elements) => elements.every((element) =>
    getComputedStyle(element).opacity === "1" && !element.closest("[hidden]"),
  ))).toBe(true)
  await page.getByRole("contentinfo").scrollIntoViewIfNeeded()
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Voltar ao topo" })).toBeVisible()
})

test("privacy is localized, accessible and linked from contact and footer", async ({ page }) => {
  for (const [contact, privacy, title] of [
    ["/contato", "/privacidade", "Privacidade"],
    ["/en/contact", "/en/privacy", "Privacy"],
    ["/es/contacto", "/es/privacidad", "Privacidad"],
  ]) {
    await page.goto(contact!)
    await expect(page.locator(`#contact a[href='${privacy}']`)).toHaveCount(1)
    await page.getByRole("contentinfo").getByRole("link", { name: title!, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`${privacy}$`))
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title!)
    const alternate = page.locator("link[rel='alternate'][hreflang='x-default']")
    await expect(alternate).toHaveCount(1)
    await expect(alternate).toHaveAttribute("href", /\/privacidade$/)
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  }
})

test("website previews use responsive images and unavailable demos have no dead link", async ({ page }) => {
  await page.goto("/projetos")
  await page.locator("[data-website-grid]").scrollIntoViewIfNeeded()
  const unavailable = page.locator("[data-website-card='carla-moraes']")
  await expect(unavailable.locator("a")).toHaveCount(0)
  await expect(unavailable).toContainText("Demonstração temporariamente indisponível")
  const image = page.locator("[data-website-thumbnail] img").first()
  await expect(image).toHaveAttribute("srcset", /_next\/image/)
  await image.scrollIntoViewIfNeeded()
  await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true)
})
