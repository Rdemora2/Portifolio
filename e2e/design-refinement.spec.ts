import { expect, test } from "@playwright/test"

test("brand references lead to documented cases and the complete lab expands", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/en")
  const brands = page.locator('[data-home-section="clients"]')
  await expect(brands.getByRole("img", { name: "Band", exact: true })).toHaveCount(0)
  for (const name of ["Newco", "BandSports", "BandNews TV", "Arte 1", "Terra Viva", "Agro+", "Globo", "Hospital Sírio-Libanês", "OMO Lavanderia", "Housi", "Prêmio SDE — Sou do Esporte"]) {
    const logo = brands.getByRole("img", { name, exact: true })
    await logo.scrollIntoViewIfNeeded()
    await expect(logo).toBeVisible()
    await expect.poll(() => logo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true)
  }
  await expect(brands.getByRole("link")).toHaveCount(2)
  await brands.getByRole("link").first().click()
  await expect(page).toHaveURL(/\/en\/work\/band-news-bandsports$/)
  await page.goto("/en/work")
  const more = page.locator("details").filter({ has: page.locator("summary", { hasText: "more interfaces" }) })
  await expect(more).not.toHaveAttribute("open")
  await more.locator("summary").click()
  await expect(more).toHaveAttribute("open")
  await expect(more.locator("[data-website-card]").first()).toBeVisible()
})

test("brand marquee stays in one row with pause, keyboard and reduced-motion controls", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/en")
  const brands = page.locator('[data-home-section="clients"]')
  const viewport = brands.locator("[data-brand-viewport]")
  const track = brands.locator("[data-brand-track]")
  await brands.scrollIntoViewIfNeeded()
  await page.mouse.move(0, 0)
  await expect(track).toHaveCSS("animation-play-state", "running")
  const initial = await track.evaluate((node) => getComputedStyle(node).transform)
  await expect.poll(() => track.evaluate((node) => getComputedStyle(node).transform)).not.toBe(initial)
  await brands.getByRole("button", { name: "Pause logo animation" }).click()
  await expect(track).toHaveCSS("animation-play-state", "paused")
  await brands.getByRole("button", { name: "Resume logo animation" }).click()
  await expect(track).toHaveCSS("animation-play-state", "running")
  await viewport.hover()
  await expect(track).toHaveCSS("animation-play-state", "paused")

  await viewport.focus()
  await page.keyboard.press("Tab")
  await expect(brands.getByRole("link").first()).toBeFocused()
  await page.keyboard.press("Tab")
  await expect(brands.getByRole("link").last()).toBeFocused()
  await expect(brands.getByRole("link").last()).toBeInViewport()
  await expect(track).toHaveCSS("animation-name", "none")

  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect(brands.getByRole("button")).toHaveCount(0)
  await expect(brands.getByRole("img")).toHaveCount(11)
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    const rowTops = await brands.locator('[data-brand-copy="0"] > li').evaluateAll((items) =>
      items.map((item) => Math.round(item.getBoundingClientRect().top)),
    )
    expect(new Set(rowTops).size).toBe(1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await brands.getByRole("img", { name: "Prêmio SDE — Sou do Esporte", exact: true }).scrollIntoViewIfNeeded()
    await expect(brands.getByRole("img", { name: "Prêmio SDE — Sou do Esporte", exact: true })).toBeInViewport()
  }
})

test("scroll progress hides with the menu and returns keyboard focus to the top", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/en")
  await expect(page.locator("[data-navigation-ready]")).toHaveAttribute("data-navigation-ready", "true")
  const top = page.getByRole("button", { name: "Back to top", includeHidden: true })
  await expect(top).toHaveAttribute("tabindex", "-1")
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }))
  await expect(top).toHaveAttribute("data-visible", "true")
  await expect.poll(() => top.locator("circle").last().evaluate(
    (circle) => parseFloat(getComputedStyle(circle).strokeDashoffset),
  )).toBeLessThan(1)
  await page.getByRole("button", { name: /open menu/i }).click()
  await expect(top).toHaveAttribute("data-visible", "false")
  await page.keyboard.press("Escape")
  await expect(top).toHaveAttribute("data-visible", "true")
  await top.focus()
  await page.keyboard.press("Enter")
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  await expect(page.locator("body")).toBeFocused()
})

test("case cards expose concise links and remain clickable through their previews", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/en/work")
  const card = page.locator('[data-project-card="hospital-sirio-libanes"]')
  const link = card.getByRole("link")
  await expect(link).toHaveCount(1)
  await expect(link).toHaveAccessibleName("Open case study: Hospital Sírio-Libanês")
  await expect(link).not.toContainText("20M")
  await expect(card.locator("dl")).toContainText("20M")
  const preview = card.locator("img")
  await preview.scrollIntoViewIfNeeded()
  const bounds = await preview.boundingBox()
  if (!bounds) throw new Error("Case preview must be visible")
  await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
  await expect(page).toHaveURL(/\/en\/work\/hospital-sirio-libanes$/)
})

test("navigation stops rewriting its surface after the scroll transition", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  for (const route of ["/en", "/en/work"]) {
    await page.goto(route)
    const navigation = page.getByRole("navigation", { name: "Main navigation" })
    await expect(navigation).toHaveAttribute("data-navigation-ready", "true")
    await page.evaluate(() => scrollTo({ top: 300, behavior: "instant" }))
    await expect.poll(() => navigation.evaluate((node) => (node as HTMLElement).style.getPropertyValue("--nav-progress"))).toBe("1")
    const writes = await navigation.evaluate(async (node) => {
      let count = 0
      const surface = (node as HTMLElement).style
      const original = surface.setProperty
      surface.setProperty = function (...args) {
        count += 1
        return original.apply(this, args)
      }
      try {
        for (const top of [400, 500, 600]) {
          scrollTo({ top, behavior: "instant" })
          await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
        }
        return count
      } finally { surface.setProperty = original }
    })
    expect(writes).toBe(0)
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }))
    await expect.poll(() => navigation.evaluate((node) => (node as HTMLElement).style.getPropertyValue("--nav-progress"))).toBe(route === "/en" ? "0" : "1")
  }
})
