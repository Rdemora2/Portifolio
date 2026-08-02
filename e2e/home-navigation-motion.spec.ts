import { expect, type Locator, type Page, test } from "@playwright/test"

import { websiteExperiences } from "../src/data/showcase-sites"

type NavigationVisualState = {
  afterOpacity: number
  beforeOpacity: number
  focusVisible: boolean
  outlineWidth: string
  transform: string
  transitionDuration: string
}

async function readNavigationVisualState(
  locator: Locator,
): Promise<NavigationVisualState> {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element)
    const before = getComputedStyle(element, "::before")
    const after = getComputedStyle(element, "::after")

    return {
      afterOpacity: Number.parseFloat(after.opacity),
      beforeOpacity: Number.parseFloat(before.opacity),
      focusVisible: element.matches(":focus-visible"),
      outlineWidth: style.outlineWidth,
      transform: style.transform,
      transitionDuration: style.transitionDuration,
    }
  })
}

async function disableWebGl(page: Page) {
  await page.addInitScript(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext

    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value(
        this: HTMLCanvasElement,
        contextId: string,
        options?: CanvasRenderingContext2DSettings,
      ) {
        if (
          contextId === "webgl" ||
          contextId === "webgl2" ||
          contextId === "experimental-webgl"
        ) {
          return null
        }

        return originalGetContext.call(this, contextId as "2d", options)
      },
    })
  })
}

test.describe("localized page navigation", () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test("keeps hover, focus, and current-page feedback perceptible", async ({
    page,
  }) => {
    await disableWebGl(page)
    await page.goto("/en", { waitUntil: "domcontentloaded" })

    const navigation = page.getByRole("navigation", {
      name: "Main navigation",
    })
    const work = navigation.getByRole("link", { name: "Work" })
    const brand = navigation.getByLabel(/RM\. — Roberto Moraes/)

    await expect(work).toBeVisible()
    await expect(brand).toHaveAttribute("aria-current", "page")
    await expect(work).not.toHaveAttribute("aria-current")

    const restingState = await readNavigationVisualState(work)
    expect(restingState.beforeOpacity).toBeLessThan(0.05)
    expect(restingState.afterOpacity).toBeLessThan(0.05)

    await work.hover()
    await expect
      .poll(async () => (await readNavigationVisualState(work)).beforeOpacity)
      .toBeGreaterThan(0.9)
    await expect
      .poll(async () => (await readNavigationVisualState(work)).afterOpacity)
      .toBeGreaterThan(0.9)

    await work.focus()
    const focusedState = await readNavigationVisualState(work)
    expect(focusedState.focusVisible).toBe(true)
    expect(focusedState.outlineWidth).toBe("2px")

    await work.click()
    await expect(page).toHaveURL(/\/en\/work\/?$/)
    const currentWork = page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Work" })
    await expect(currentWork).toHaveAttribute("aria-current", "page")
    await currentWork.evaluate((element) => {
      if (element instanceof HTMLElement) element.blur()
    })
    const currentState = await readNavigationVisualState(currentWork)
    expect(currentState.beforeOpacity).toBeGreaterThan(0.4)
    expect(currentState.afterOpacity).toBeGreaterThan(0.9)
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Engineering explained through decisions",
    )
  })

  test("keeps the mobile menu modal, keyboard-safe, and route-aware", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/en/about", { waitUntil: "domcontentloaded" })

    const openButton = page.getByRole("button", { name: "Open menu" })
    await expect(
      page.getByRole("navigation", { name: "Main navigation" }),
    ).toHaveAttribute("data-navigation-ready", "true")
    await openButton.focus()
    await openButton.click()

    const dialog = page.getByRole("dialog", { name: "Navigation menu" })
    const closeButton = dialog.getByRole("button", { name: "Close menu" })
    const about = dialog.getByRole("link", { name: "About" })

    await expect(dialog).toBeVisible()
    await expect(closeButton).toBeFocused()
    await expect(about).toHaveAttribute("aria-current", "page")
    await expect
      .poll(() => page.evaluate(() => document.documentElement.style.overflow))
      .toBe("hidden")

    await page.keyboard.press("Shift+Tab")
    await expect(
      dialog.getByRole("link", {
        name: "ES — Switch language to Spanish",
      }),
    ).toBeFocused()

    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(openButton).toBeFocused()
    await expect
      .poll(() => page.evaluate(() => document.documentElement.style.overflow))
      .toBe("")
  })

  test("bridges legacy section fragments to localized pages", async ({
    page,
  }) => {
    await page.goto("/en?source=legacy#experience")

    await expect(page).toHaveURL((url) => {
      return (
        url.pathname === "/en/experience" &&
        url.searchParams.get("source") === "legacy"
      )
    })
    await expect(page.locator("[data-experience-list] > li")).toHaveCount(5)

    await page.goto("/es#sites")
    await expect(page).toHaveURL(/\/es\/proyectos#web$/)
    await expect(page.locator("[data-website-card]")).toHaveCount(
      websiteExperiences.length,
    )
  })
})

test.describe("restrained motion", () => {
  test.use({
    contextOptions: { reducedMotion: "reduce" },
    viewport: { width: 1440, height: 900 },
  })

  test("preserves interaction feedback without spatial movement", async ({
    page,
  }) => {
    await disableWebGl(page)
    await page.goto("/en", { waitUntil: "domcontentloaded" })

    const work = page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Work" })
    const restingState = await readNavigationVisualState(work)

    expect(Number.parseFloat(restingState.transitionDuration)).toBeLessThanOrEqual(
      0.00001,
    )
    expect(restingState.transform).toBe("none")

    await work.hover()
    const hoveredState = await readNavigationVisualState(work)
    expect(hoveredState.beforeOpacity).toBeGreaterThan(0.9)
    expect(hoveredState.transform).toBe("none")

    await expect(page.locator("[data-scroll-reveal]")).not.toHaveCount(0)
    await expect
      .poll(() =>
        page.locator("[data-scroll-reveal]").evaluateAll((elements) =>
          elements
            .map((element, index) => {
              const style = getComputedStyle(element)
              return {
                animations: element.getAnimations().length,
                index,
                opacity: style.opacity,
                transform: style.transform,
                willChange: style.willChange,
              }
            })
            .filter(
              ({ animations, opacity, transform, willChange }) =>
                animations !== 0 ||
                opacity !== "1" ||
                transform !== "none" ||
                willChange !== "auto",
            ),
        ),
      )
      .toEqual([])
  })
})
