import { expect, test } from "@playwright/test"

test("keeps gallery motion under the visitor's control", async ({ page }) => {
  const loopWarnings: string[] = []
  page.on("console", (message) => {
    if (message.type() === "warning" && message.text().includes("Swiper Loop Warning")) {
      loopWarnings.push(message.text())
    }
  })

  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/en/work/band-news-bandsports", {
    waitUntil: "domcontentloaded",
  })

  const gallery = page.locator('[data-project-gallery="true"]')
  await gallery.scrollIntoViewIfNeeded()
  const swiper = gallery.locator(".swiper")
  const pauseButton = gallery.getByRole("button", { name: "Pause gallery" })
  await expect(pauseButton).toBeVisible()
  await expect
    .poll(() =>
      swiper.evaluate((element) =>
        Boolean(
          (
            element as HTMLElement & {
              swiper?: { autoplay?: { running?: boolean } }
            }
          ).swiper?.autoplay?.running,
        ),
      ),
    )
    .toBe(true)

  const activeSlide = gallery.locator(".swiper-slide-active button")
  await activeSlide.focus()
  await expect(activeSlide).toBeFocused()
  const focusedSlideName = await activeSlide.getAttribute("aria-label")
  if (!focusedSlideName) throw new Error("The active slide needs an accessible name")
  await expect
    .poll(() =>
      swiper.evaluate((element) =>
        Boolean(
          (
            element as HTMLElement & {
              swiper?: { autoplay?: { running?: boolean } }
            }
          ).swiper?.autoplay?.running,
        ),
      ),
    )
    .toBe(false)
  await page.waitForTimeout(4_600)
  const focusedSlide = gallery.getByRole("button", {
    name: focusedSlideName,
    exact: true,
  })
  await expect(focusedSlide).toBeFocused()
  await expect(focusedSlide).not.toHaveAttribute("aria-hidden")
  await expect(gallery.locator(".swiper-slide-active button")).toHaveAttribute(
    "aria-label",
    focusedSlideName,
  )

  await pauseButton.click()
  await expect(
    gallery.getByRole("button", { name: "Resume gallery" }),
  ).toBeVisible()
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  })
  await expect
    .poll(() =>
      swiper.evaluate((element) =>
        Boolean(
          (
            element as HTMLElement & {
              swiper?: { autoplay?: { running?: boolean } }
            }
          ).swiper?.autoplay?.running,
        ),
      ),
    )
    .toBe(false)

  await gallery.getByRole("button", { name: "Resume gallery" }).click()
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  })
  await expect
    .poll(() =>
      swiper.evaluate((element) =>
        Boolean(
          (
            element as HTMLElement & {
              swiper?: { autoplay?: { running?: boolean } }
            }
          ).swiper?.autoplay?.running,
        ),
      ),
    )
    .toBe(true)

  await expect(
    gallery.getByRole("button", { name: /^Go to image 1:/ }),
  ).toBeVisible()
  const nextButton = gallery.getByRole("button", { name: "Next image" })
  await nextButton.focus()
  const startingSlideName = await gallery
    .locator(".swiper-slide-active button")
    .getAttribute("aria-label")
  const slideCount = await gallery
    .getByRole("button", { name: /^Go to image \d+:/ })
    .count()
  for (let index = 0; index < slideCount; index += 1) {
    await nextButton.click()
    await page.waitForTimeout(650)
  }
  await expect(gallery.locator(".swiper-slide-active button")).toHaveAttribute(
    "aria-label",
    startingSlideName ?? "",
  )
  expect(loopWarnings).toEqual([])
})

test("disables gallery autoplay when reduced motion is requested", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/en/work/band-news-bandsports", {
    waitUntil: "domcontentloaded",
  })

  const gallery = page.locator('[data-project-gallery="true"]')
  await gallery.scrollIntoViewIfNeeded()
  await expect(
    gallery.getByRole("button", { name: /^(?:Pause|Resume) gallery$/ }),
  ).toHaveCount(0)
  await expect
    .poll(() =>
      gallery.locator(".swiper").evaluate((element) =>
        Boolean(
          (
            element as HTMLElement & {
              swiper?: { autoplay?: { running?: boolean } }
            }
          ).swiper?.autoplay?.running,
        ),
      ),
    )
    .toBe(false)
})

for (const locale of [
  {
    action: "Abrir próximo case",
    label: "Responsabilidade",
    pathname: "/projetos/band-news-bandsports",
  },
  {
    action: "Abrir siguiente caso",
    label: "Responsabilidad",
    pathname: "/es/proyectos/band-news-bandsports",
  },
]) {
  for (const width of [320, 390, 430]) {
    test(`keeps ${locale.label} separate at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await page.goto(locale.pathname, { waitUntil: "domcontentloaded" })
      await page.evaluate(() => document.fonts.ready)

      const label = page.getByText(locale.label, { exact: true })
      const value = label.locator("xpath=following-sibling::dd")
      const [labelBox, valueBox] = await Promise.all([
        label.evaluate((element) => {
          const range = document.createRange()
          range.selectNodeContents(element)
          return range.getBoundingClientRect().toJSON()
        }),
        value.boundingBox(),
      ])
      if (!labelBox || !valueBox) throw new Error("Case facts must be measurable")

      const separatedHorizontally =
        labelBox.x + labelBox.width <= valueBox.x ||
        valueBox.x + valueBox.width <= labelBox.x
      const separatedVertically =
        labelBox.y + labelBox.height <= valueBox.y ||
        valueBox.y + valueBox.height <= labelBox.y
      expect(separatedHorizontally || separatedVertically).toBe(true)
      await expect(
        page.getByRole("link", { name: new RegExp(locale.action) }),
      ).toBeAttached()
    })
  }
}
