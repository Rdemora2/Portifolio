import { expect, type Locator, type Page, test } from "@playwright/test"

type NavigationVisualState = {
  afterOpacity: number
  afterTransform: string
  beforeOpacity: number
  beforeTransform: string
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
      afterTransform: after.transform,
      beforeOpacity: Number.parseFloat(before.opacity),
      beforeTransform: before.transform,
      focusVisible: element.matches(":focus-visible"),
      outlineWidth: style.outlineWidth,
      transform: style.transform,
      transitionDuration: style.transitionDuration,
    }
  })
}

async function waitForHomeHydration(page: Page) {
  await expect(page.locator("[data-projects-client]")).toHaveAttribute(
    "data-hydrated",
    "true",
  )
}

async function disableWebGlForIsolatedMotionTest(page: Page) {
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

test.describe("home navigation and restrained motion", () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test("keeps hover, current and keyboard focus perceptible and contained", async ({
    page,
  }) => {
    await disableWebGlForIsolatedMotionTest(page)
    await page.goto("/en", { waitUntil: "domcontentloaded" })
    await waitForHomeHydration(page)

    const navigation = page.getByRole("navigation", {
      name: "Main navigation",
    })
    const projects = navigation.getByRole("link", { name: "Projects" })
    const contact = navigation.getByRole("link", { name: "Contact" })

    await expect(projects).toBeVisible()
    await expect(navigation.getByLabel(/RM\. — Roberto Moraes/)).toHaveAttribute(
      "aria-current",
      "location",
    )

    const restingState = await readNavigationVisualState(projects)
    expect(restingState.beforeOpacity).toBeLessThan(0.05)
    expect(restingState.afterOpacity).toBeLessThan(0.05)

    await projects.hover()
    await expect
      .poll(async () => (await readNavigationVisualState(projects)).beforeOpacity)
      .toBeGreaterThan(0.95)
    await expect
      .poll(async () => (await readNavigationVisualState(projects)).afterOpacity)
      .toBeGreaterThan(0.95)
    expect((await readNavigationVisualState(projects)).transform).not.toBe(
      "none",
    )

    await contact.hover()
    const containment = await contact.evaluate((element) => {
      const linkRect = element.getBoundingClientRect()
      const locale = element
        .closest("nav")
        ?.querySelector<HTMLElement>("[role='group']")
      if (!locale) throw new Error("Missing desktop locale switcher")

      const effectRight = Number.parseFloat(
        getComputedStyle(element, "::before").right,
      )

      return {
        effectRightEdge: linkRect.right + Math.max(0, -effectRight),
        localeLeftEdge: locale.getBoundingClientRect().left,
      }
    })
    expect(containment.effectRightEdge).toBeLessThan(containment.localeLeftEdge)

    await projects.focus()
    await expect
      .poll(async () => (await readNavigationVisualState(projects)).beforeOpacity)
      .toBeGreaterThan(0.95)
    await expect
      .poll(async () => (await readNavigationVisualState(projects)).afterOpacity)
      .toBeGreaterThan(0.95)
    const focusedState = await readNavigationVisualState(projects)
    expect(focusedState.focusVisible).toBe(true)
    expect(focusedState.outlineWidth).toBe("2px")

    await projects.click()
    await expect(page).toHaveURL(/#projects$/)
    await expect(projects).toHaveAttribute("aria-current", "location")
  })

  test("reveals home content with compositor-safe frames and releases hints", async ({
    page,
  }) => {
    await disableWebGlForIsolatedMotionTest(page)
    await page.goto("/en", { waitUntil: "domcontentloaded" })
    await waitForHomeHydration(page)
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = "auto"
    })

    const reveal = page
      .locator("#contact [data-scroll-reveal][data-reveal-variant]")
      .first()
    await reveal.evaluate((element) => {
      element.scrollIntoView({ block: "center" })
    })

    await expect
      .poll(() =>
        reveal.evaluate((element) => {
          const ignoredProperties = new Set([
            "composite",
            "computedOffset",
            "easing",
            "offset",
          ])

          return Array.from(
            new Set(
              element
                .getAnimations()
                .flatMap((animation) => {
                  const effect = animation.effect
                  return effect instanceof KeyframeEffect
                    ? effect.getKeyframes()
                    : []
                })
                .flatMap((keyframe) => Object.keys(keyframe))
                .filter((property) => !ignoredProperties.has(property)),
            ),
          ).sort()
        }),
      )
      .toEqual(["opacity", "transform"])

    await expect
      .poll(() =>
        reveal.evaluate((element) => {
          const style = getComputedStyle(element)
          return {
            animations: element.getAnimations().length,
            opacity: style.opacity,
            transform: style.transform,
            willChange: style.willChange,
          }
        }),
      )
      .toEqual({
        animations: 0,
        opacity: "1",
        transform: "none",
        willChange: "auto",
      })

    const dividerSignal = page.locator("[data-section-divider-signal]").first()
    const supportsViewTimeline = await page.evaluate(() =>
      CSS.supports("animation-timeline", "view()"),
    )
    const signalStyle = await dividerSignal.evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        animationName: style.animationName,
        animationTimeline: style.getPropertyValue("animation-timeline"),
      }
    })

    if (supportsViewTimeline) {
      expect(signalStyle.animationName).not.toBe("none")
      expect(signalStyle.animationTimeline).not.toBe("auto")
    } else {
      expect(signalStyle.animationName).toBe("none")
    }

    const overflow = await page.evaluate(() => ({
      body: Math.max(0, document.body.scrollWidth - window.innerWidth),
      document: Math.max(
        0,
        document.documentElement.scrollWidth - window.innerWidth,
      ),
    }))
    expect(overflow).toEqual({ body: 0, document: 0 })
  })
})

test.describe("home motion accessibility", () => {
  test.use({
    contextOptions: { reducedMotion: "reduce" },
    viewport: { width: 1440, height: 900 },
  })

  test("keeps interaction feedback while removing spatial motion", async ({
    page,
  }) => {
    await disableWebGlForIsolatedMotionTest(page)
    await page.goto("/en", { waitUntil: "domcontentloaded" })
    await waitForHomeHydration(page)

    const projects = page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Projects" })
    const restingState = await readNavigationVisualState(projects)

    expect(Number.parseFloat(restingState.transitionDuration)).toBeLessThanOrEqual(
      0.00001,
    )
    expect(restingState.transform).toBe("none")

    await projects.hover()
    const hoveredState = await readNavigationVisualState(projects)
    expect(hoveredState.beforeOpacity).toBeGreaterThan(0.95)
    expect(hoveredState.transform).toBe("none")
    expect(hoveredState.beforeTransform).toBe(restingState.beforeTransform)
    expect(hoveredState.afterTransform).toBe(restingState.afterTransform)

    await projects.focus()
    const focusedState = await readNavigationVisualState(projects)
    expect(focusedState.focusVisible).toBe(true)
    expect(focusedState.outlineWidth).toBe("2px")
    expect(focusedState.transform).toBe("none")

    await expect
      .poll(() =>
        page.locator("[data-scroll-reveal]").evaluateAll((elements) =>
          elements.every((element) => {
            const style = getComputedStyle(element)
            return (
              element.getAnimations().length === 0 &&
              style.opacity === "1" &&
              style.transform === "none" &&
              style.willChange === "auto"
            )
          }),
        ),
      )
      .toBe(true)

    const signalStyle = await page
      .locator("[data-section-divider-signal]")
      .first()
      .evaluate((element) => {
        const style = getComputedStyle(element)
        return {
          animationName: style.animationName,
          opacity: style.opacity,
          transform: style.transform,
        }
      })
    expect(signalStyle).toEqual({
      animationName: "none",
      opacity: "0",
      transform: "none",
    })
  })
})
