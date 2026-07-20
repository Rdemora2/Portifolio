import AxeBuilder from "@axe-core/playwright"
import {
  expect,
  type Browser,
  type Page,
  type Request,
  test,
} from "@playwright/test"

const deferredJavaScriptUrl =
  /\/_next\/static\/chunks\/.*\.js(?:\?.*)?$/

async function discoverInteractionChunkPaths(
  browser: Browser,
  baseURL: string | undefined,
  interact: (page: Page) => Promise<void>,
): Promise<Set<string>> {
  if (!baseURL) throw new Error("Playwright baseURL is required for chunk discovery")

  const context = await browser.newContext({ baseURL })
  const discoveryPage = await context.newPage()
  const chunkPaths = new Set<string>()
  const recordDeferredChunk = (request: Request) => {
    if (
      request.resourceType() === "script" &&
      deferredJavaScriptUrl.test(request.url())
    ) {
      chunkPaths.add(new URL(request.url()).pathname)
    }
  }

  try {
    await discoveryPage.goto("/en/#projects", { waitUntil: "networkidle" })
    discoveryPage.on("request", recordDeferredChunk)
    await interact(discoveryPage)
    await discoveryPage.waitForTimeout(100)
  } finally {
    discoveryPage.off("request", recordDeferredChunk)
    await context.close()
  }

  if (chunkPaths.size === 0) {
    throw new Error("The interaction did not request any deferred JavaScript chunks")
  }

  return chunkPaths
}

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

async function expectNoHorizontalOverflow(page: Page, surface: string) {
  await expect
    .poll(
      () =>
        page.evaluate(() => ({
          body: Math.max(0, document.body.scrollWidth - window.innerWidth),
          document: Math.max(
            0,
            document.documentElement.scrollWidth - window.innerWidth,
          ),
        })),
      { message: `${surface} must fit within the viewport` },
    )
    .toEqual({ body: 0, document: 0 })
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

async function readExperienceTimelineScale(page: Page) {
  return page
    .locator("[data-experience-timeline-progress]")
    .evaluate((progress) => {
      const transform = getComputedStyle(progress).transform
      return transform === "none" ? 1 : new DOMMatrixReadOnly(transform).m22
    })
}

async function scrollToAndRender(page: Page, scrollY: number) {
  await page.evaluate(async (top) => {
    window.scrollTo({ top, behavior: "instant" })
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
  }, scrollY)
}

async function prepareScrollLinkedMotion(page: Page) {
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = "auto"
    await document.fonts.ready
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
  })
}

async function readArticleHeroState(page: Page) {
  return page.locator("[data-article-hero]").evaluate((hero) => {
    if (!(hero instanceof HTMLElement)) {
      throw new Error("Article hero must be an HTML element")
    }

    const requiredElement = (selector: string) => {
      const element = hero.querySelector<HTMLElement>(selector)
      if (!element) throw new Error(`Missing article hero hook: ${selector}`)
      return element
    }
    const readVariable = (property: string) =>
      Number.parseFloat(hero.style.getPropertyValue(property) || "0")
    const readMatrix = (element: Element) => {
      const transform = getComputedStyle(element).transform
      return new DOMMatrixReadOnly(
        transform === "none" ? "matrix(1, 0, 0, 1, 0, 0)" : transform,
      )
    }
    const normalizeAngle = (angle: number) =>
      ((angle + 180) % 360 + 360) % 360 - 180
    const readRotation = (matrix: DOMMatrixReadOnly) =>
      normalizeAngle((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI)

    const sticky = requiredElement("[data-hero-sticky]")
    const grid = requiredElement("[data-hero-grid]")
    const beam = requiredElement("[data-hero-beam]")
    const copy = requiredElement("[data-hero-copy]")
    const footer = requiredElement("[data-hero-footer]")
    const recorder = requiredElement("[data-hero-recorder]")
    const core = requiredElement("[data-hero-core]")
    const words = Array.from(
      hero.querySelectorAll<HTMLElement>("[data-hero-word]"),
    )
    const metrics = Array.from(
      hero.querySelectorAll<HTMLElement>("[data-hero-metric]"),
    )
    const recorderMatrix = readMatrix(recorder)
    const coreVisualMatrix = recorderMatrix.multiply(readMatrix(core))
    const heroRect = hero.getBoundingClientRect()
    const stickyRect = sticky.getBoundingClientRect()
    const motionElements = [grid, beam, copy, recorder, core, ...metrics]

    return {
      dataset: {
        active: hero.dataset.heroActive ?? "",
        motion: hero.dataset.heroMotion ?? "",
      },
      capability: window.matchMedia(
        "(min-width: 900px) and (min-height: 600px) and (hover: hover) and (pointer: fine)",
      ).matches,
      geometry: {
        documentTop: window.scrollY + heroRect.top,
        heroHeight: hero.offsetHeight,
        range: Math.max(hero.offsetHeight - window.innerHeight, 1),
        stickyHeight: stickyRect.height,
        stickyTop: stickyRect.top,
        viewportHeight: window.innerHeight,
      },
      motion: {
        progress: readVariable("--hero-progress"),
        signal: readVariable("--hero-signal"),
        pulse: readVariable("--hero-pulse"),
        type: readVariable("--hero-type"),
        orbit: readVariable("--hero-orbit"),
        handoff: readVariable("--hero-handoff"),
      },
      transforms: {
        copy: getComputedStyle(copy).transform,
        recorder: getComputedStyle(recorder).transform,
        core: getComputedStyle(core).transform,
        words: words.map((word) => getComputedStyle(word).transform),
        metrics: metrics.map((metric) => getComputedStyle(metric).transform),
      },
      opacity: {
        copy: Number.parseFloat(getComputedStyle(copy).opacity),
        footer: Number.parseFloat(getComputedStyle(footer).opacity),
      },
      rotation: {
        recorder: readRotation(recorderMatrix),
        coreVisual: readRotation(coreVisualMatrix),
        metricsVisual: metrics.map((metric) =>
          readRotation(recorderMatrix.multiply(readMatrix(metric))),
        ),
      },
      motionStyles: motionElements.map((element) => {
        const style = getComputedStyle(element)
        return {
          animationName: style.animationName,
          transitionDuration: style.transitionDuration,
          willChange: style.willChange,
        }
      }),
      stickyPosition: getComputedStyle(sticky).position,
      overflow: {
        body: Math.max(0, document.body.scrollWidth - window.innerWidth),
        document: Math.max(
          0,
          document.documentElement.scrollWidth - window.innerWidth,
        ),
      },
    }
  })
}

function expectStaticHeroMotion(
  state: Awaited<ReturnType<typeof readArticleHeroState>>,
) {
  expect(state.dataset).toEqual({ active: "false", motion: "static" })
  expect(Object.values(state.motion)).toEqual([0, 0, 0, 0, 0, 0])
  expect(Math.abs(state.rotation.coreVisual)).toBeLessThanOrEqual(0.05)
  state.rotation.metricsVisual.forEach((rotation) => {
    expect(Math.abs(rotation)).toBeLessThanOrEqual(0.05)
  })
  expect(state.overflow).toEqual({ body: 0, document: 0 })
}

function hasEffectivelyZeroCssDuration(value: string) {
  return value
    .split(",")
    .every((duration) => Number.parseFloat(duration) <= 0.00001)
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
  const englishLocaleLink = page.getByRole("link", {
    name: "EN — Switch language to English",
  }).first()
  await expect(englishLocaleLink).toHaveAttribute("aria-current", "page")
  await expect(englishLocaleLink).not.toHaveAttribute("lang")
  await expect(englishLocaleLink.locator("span")).toHaveAttribute("lang", "en-US")

  await page.goto("/es")
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX")
  await expect(page.getByRole("link", { name: "Ver Proyectos" })).toBeVisible()
})

test("preserves the query and hash when switching locales", async ({ page }) => {
  await page.goto("/en?source=e2e#projects")

  const portugueseLink = page.getByRole("link", {
    name: "PT — Switch language to Portuguese",
  })
  const spanishLink = page.getByRole("link", {
    name: "ES — Switch language to Spanish",
  })
  await expect(portugueseLink).toHaveAttribute(
    "href",
    "/pt?source=e2e#projects",
  )
  await expect(spanishLink).toHaveAttribute(
    "href",
    "/es?source=e2e#projects",
  )

  await spanishLink.click()

  await expect(page).toHaveURL((url) => {
    return (
      url.pathname === "/es" &&
      url.searchParams.get("source") === "e2e" &&
      url.hash === "#projects"
    )
  })
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX")
})

test("presents published website experiences with secure, responsive links", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/en/#sites", { waitUntil: "domcontentloaded" })

  const showcase = page.locator("[data-website-showcase]")
  const cards = showcase.locator("[data-website-card]")
  const links = showcase.locator("[data-website-link]")
  const thumbnails = showcase.locator("[data-website-thumbnail] img")
  const expectedDestinations = [
    "https://lp-institucional-vendas.vercel.app/",
    "https://lp-institucional-advocacia.vercel.app/",
    "https://front-site-tivix-technologies.vercel.app/",
    "https://lp-institucional-paisagismo.vercel.app/",
    "https://lp-institucional-fintech.vercel.app/",
  ]

  await expect(showcase).toBeVisible()
  await expect(
    showcase.getByRole("heading", {
      level: 2,
      name: "Websites that turn positioning into digital presence.",
    }),
  ).toBeVisible()
  await expect(cards).toHaveCount(expectedDestinations.length)
  await expect(links).toHaveCount(expectedDestinations.length)
  await expect(thumbnails).toHaveCount(expectedDestinations.length)

  for (const [index, destination] of expectedDestinations.entries()) {
    const link = links.nth(index)

    await expect(link).toHaveAttribute("href", destination)
    await expect(link).toHaveAttribute("target", "_blank")
    await expect(link).toHaveAttribute("rel", "noopener noreferrer external")
    await expect(link).toHaveAccessibleName(/opens in a new tab/i)
  }

  for (let index = 0; index < expectedDestinations.length; index += 1) {
    const thumbnail = thumbnails.nth(index)
    await thumbnail.scrollIntoViewIfNeeded()
    await expect
      .poll(
        () =>
          thumbnail.evaluate(
            (image) =>
              image instanceof HTMLImageElement &&
              image.complete &&
              image.naturalWidth > 0,
          ),
        {
          message: `Local website thumbnail ${index + 1} must decode successfully`,
          timeout: 15_000,
        },
      )
      .toBe(true)
  }

  await expectNoHorizontalOverflow(page, "Website showcase on mobile")

  await page.setViewportSize({ width: 1024, height: 768 })
  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible()
  await expectNoHorizontalOverflow(page, "Website showcase on compact desktop")

  await page.setViewportSize({ width: 1280, height: 800 })
  await expectNoHorizontalOverflow(page, "Website showcase on desktop")
  await showcase.evaluate((section) => {
    window.scrollTo({
      top: (section as HTMLElement).offsetTop,
      behavior: "instant",
    })
  })
  const [gridBounds, firstCardBounds, tivixCardBounds] = await Promise.all([
    showcase.locator("[data-website-grid]").boundingBox(),
    cards.nth(0).boundingBox(),
    cards.nth(2).boundingBox(),
  ])

  expect(gridBounds).not.toBeNull()
  expect(firstCardBounds).not.toBeNull()
  expect(tivixCardBounds).not.toBeNull()

  if (gridBounds && firstCardBounds && tivixCardBounds) {
    const gridCenter = gridBounds.x + gridBounds.width / 2
    const tivixCenter = tivixCardBounds.x + tivixCardBounds.width / 2

    expect(tivixCardBounds.width).toBeCloseTo(firstCardBounds.width, 0)
    expect(Math.abs(tivixCenter - gridCenter)).toBeLessThanOrEqual(1)
    expect(tivixCardBounds.y).toBeGreaterThan(
      firstCardBounds.y + firstCardBounds.height,
    )
  }

  const primaryNavigation = page.getByRole("navigation", {
    name: "Main navigation",
  })
  await expect(primaryNavigation.getByRole("link", { name: "Sites" })).toHaveAttribute(
    "aria-current",
    "location",
  )
})

test("keeps locale navigation and production metrics useful without JavaScript", async ({
  browser,
}, testInfo) => {
  const noScriptPage = await browser.newPage({
    baseURL: testInfo.project.use.baseURL,
    javaScriptEnabled: false,
  })

  try {
    await noScriptPage.goto("/en", { waitUntil: "domcontentloaded" })

    const metricFallbacks = noScriptPage.locator(
      "#metrics [data-count-up-fallback]",
    )
    await expect(metricFallbacks).toHaveCount(3)
    await expect(metricFallbacks.nth(0)).toHaveText("20M")
    await expect(metricFallbacks.nth(1)).toHaveText("6ms")
    await expect(metricFallbacks.nth(2)).toHaveText("92%")
    await expect(metricFallbacks.nth(0)).toHaveCSS("display", "inline")

    const websiteShowcase = noScriptPage.locator("[data-website-showcase]")
    await expect(websiteShowcase).toBeAttached()
    await expect(websiteShowcase).toContainText(
      "Websites that turn positioning into digital presence.",
    )
    await expect(noScriptPage.locator("[data-website-card]")).toHaveCount(5)
    const websiteLinks = noScriptPage.locator("[data-website-link]")
    await expect(websiteLinks).toHaveCount(5)
    await expect(websiteLinks.nth(0)).toHaveAttribute(
      "href",
      "https://lp-institucional-vendas.vercel.app/",
    )
    await expect(websiteLinks.nth(2)).toHaveAttribute(
      "href",
      "https://front-site-tivix-technologies.vercel.app/",
    )

    await noScriptPage
      .getByRole("link", { name: "ES — Switch language to Spanish" })
      .click()
    await expect(noScriptPage).toHaveURL(/\/es\/?$/)
    await expect(noScriptPage.locator("html")).toHaveAttribute("lang", "es-MX")
  } finally {
    await noScriptPage.close()
  }
})

test("keeps the reactive border exclusive to the three production metrics", async ({
  page,
}) => {
  await disableWebGlForIsolatedMotionTest(page)
  await page.goto("/en/", { waitUntil: "load" })

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
  await firstMetric.evaluate((card) => {
    card.parentElement?.scrollIntoView({
      behavior: "instant",
      block: "center",
      inline: "nearest",
    })
  })
  await scrollToAndRender(page, await page.evaluate(() => window.scrollY))
  await expect
    .poll(() =>
      firstMetric.evaluate((card) => {
        const wrapper = card.parentElement
        if (!wrapper) return Number.POSITIVE_INFINITY

        const style = getComputedStyle(wrapper)
        const matrix =
          style.transform === "none"
            ? new DOMMatrixReadOnly()
            : new DOMMatrixReadOnly(style.transform)

        return Math.max(
          Math.abs(matrix.a - 1),
          Math.abs(matrix.b),
          Math.abs(matrix.c),
          Math.abs(matrix.d - 1),
          Math.abs(matrix.e),
          Math.abs(matrix.f),
          Math.abs(Number.parseFloat(style.opacity) - 1),
          wrapper.getAnimations().length,
        )
      }),
    )
    .toBeLessThanOrEqual(0.001)
  const edgePosition = await firstMetric.evaluate((card) => ({
    x: card.clientWidth - 2,
    y: card.clientHeight / 2,
  }))

  // Keep the fixed navigation out of this isolated component interaction.
  // `force: true` would skip Playwright's hit-target check without changing
  // the browser's real pointer target, which makes the pointermove assertion
  // race with whichever fixed layer happens to be above the coordinates.
  await page.locator("nav").first().evaluate((navigation) => {
    navigation.style.pointerEvents = "none"
  })
  await expect(firstMetric).toHaveCSS("opacity", "1", { timeout: 10000 })
  await firstMetric.hover({ position: edgePosition })
  await expect
    .poll(() => firstMetric.evaluate((card) => card.matches(":hover")))
    .toBe(true)
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
  await firstMetric.hover({ position: edgePosition })
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

test("draws the experience timeline with native scroll-linked motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await disableWebGlForIsolatedMotionTest(page)
  await page.goto("/en/", { waitUntil: "networkidle" })

  const progress = page.locator("[data-experience-timeline-progress]")
  await expect(progress).toHaveCount(1)
  await expect(page.locator("[data-experience-card]")).toHaveCount(5)
  await page.evaluate(async () => {
    await document.fonts.ready
  })

  const scrollTimeline = await progress.evaluate((element) => {
    const style = getComputedStyle(element)

    return {
      supported: CSS.supports("animation-timeline: view()"),
      animationName: style.animationName,
      animationTimeline: style.getPropertyValue("animation-timeline"),
    }
  })

  if (!scrollTimeline.supported) {
    expect(await readExperienceTimelineScale(page)).toBe(1)
    return
  }

  expect(scrollTimeline.animationName).not.toBe("none")
  expect(scrollTimeline.animationTimeline).toMatch(/^view/)

  const timelineRange = await progress.evaluate((element) => {
    if (!(element instanceof HTMLElement)) {
      throw new Error("Experience timeline progress must be an HTML element")
    }

    const bounds = element.getBoundingClientRect()
    const documentTop = window.scrollY + bounds.top

    return {
      start: documentTop - window.innerHeight * 0.56,
      end: documentTop + element.offsetHeight - window.innerHeight * 0.55,
    }
  })

  await scrollToAndRender(page, timelineRange.start - 200)
  await expect
    .poll(() => readExperienceTimelineScale(page))
    .toBeLessThanOrEqual(0.01)
  const initialScale = await readExperienceTimelineScale(page)

  await scrollToAndRender(
    page,
    (timelineRange.start + timelineRange.end) / 2,
  )
  await expect
    .poll(() => readExperienceTimelineScale(page))
    .toBeGreaterThan(0.30)
  const middleScale = await readExperienceTimelineScale(page)
  expect(middleScale).toBeGreaterThan(initialScale + 0.3)
  expect(middleScale).toBeLessThan(0.65)

  await scrollToAndRender(page, timelineRange.end)
  await expect
    .poll(() => readExperienceTimelineScale(page))
    .toBeGreaterThanOrEqual(0.99)
  const finalScale = await readExperienceTimelineScale(page)
  expect(finalScale).toBeGreaterThan(middleScale)
})

test("keeps both experience columns equally spaced from the timeline", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/en/#experience")

  const cards = page.locator("[data-experience-card]")
  await expect(cards).toHaveCount(5)
  await cards.first().scrollIntoViewIfNeeded()

  const cardGaps = await page.locator("#experience").evaluate((section) => {
    const timeline = section.querySelector<HTMLElement>(
      "[data-experience-timeline]",
    )

    if (!timeline) throw new Error("Experience timeline was not rendered")

    const timelineRect = timeline.getBoundingClientRect()
    const timelineCenter = timelineRect.left + timelineRect.width / 2

    return Array.from(
      section.querySelectorAll<HTMLElement>("[data-experience-card]"),
      (card) => {
        const cardRect = card.getBoundingClientRect()
        const side = card.dataset.experienceSide

        return {
          side,
          gap:
            side === "left"
              ? timelineCenter - cardRect.right
              : cardRect.left - timelineCenter,
        }
      },
    )
  })

  expect(cardGaps.filter(({ side }) => side === "left")).toHaveLength(2)
  expect(cardGaps.filter(({ side }) => side === "right")).toHaveLength(3)

  const leftGaps = cardGaps
    .filter(({ side }) => side === "left")
    .map(({ gap }) => gap)
  const rightGaps = cardGaps
    .filter(({ side }) => side === "right")
    .map(({ gap }) => gap)
  const average = (values: number[]) =>
    values.reduce((total, value) => total + value, 0) / values.length

  expect(Math.min(...leftGaps, ...rightGaps)).toBeGreaterThanOrEqual(40)
  expect(Math.abs(average(leftGaps) - average(rightGaps))).toBeLessThanOrEqual(1)

  const timelineProgress = page.locator(
    "[data-experience-timeline-progress]",
  )
  await expect(page.locator("[data-experience-timeline-track]")).toBeVisible()
  await expect(timelineProgress).toBeHidden()
  await expect(timelineProgress).toHaveCSS("animation-name", "none")
  expect(await readExperienceTimelineScale(page)).toBe(1)
})

test("exposes professional experience as a semantic chronology", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/en/#experience")

  const chronology = page.locator("[data-experience-list]")
  await expect(chronology).toHaveCount(1)
  await expect(chronology.locator(":scope > li")).toHaveCount(5)
  await expect(chronology.locator("[data-experience-entry]")).toHaveCount(5)
  await expect(
    chronology.locator("[data-experience-highlights]"),
  ).toHaveCount(5)
  await expect(
    chronology.getByRole("heading", {
      level: 3,
      name: "Software Engineer & IT Manager",
    }),
  ).toBeVisible()
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
  const editorialArticle = page.getByRole("article", {
    name: "Go in production",
  })
  await expect(editorialArticle).toHaveCount(1)
  await expect(editorialArticle.getByRole("heading", { level: 1 })).toHaveText(
    "Go in production",
  )
  await expect(page.locator("[data-article-scene]")).toHaveCount(8)
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
  await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute(
    "content",
    "Go in production",
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
  const parsedArticleSchema = JSON.parse(articleSchema ?? "{}")
  expect(parsedArticleSchema).toMatchObject({
    "@type": "TechArticle",
    inLanguage: "en-US",
    author: {
      "@type": "Person",
      "@id": "https://robertomoraes.dev/#person",
      name: "Roberto Moraes",
      url: "https://robertomoraes.dev/en",
    },
  })
})

test("keeps the complete article readable without client JavaScript", async ({
  browser,
}, testInfo) => {
  const noScriptPage = await browser.newPage({
    baseURL: testInfo.project.use.baseURL,
    javaScriptEnabled: false,
  })

  try {
    await noScriptPage.goto("/en/insights/go-em-producao")

    await expect(
      noScriptPage.getByRole("heading", {
        level: 1,
        name: "Go in production",
      }),
    ).toBeVisible()
    await expect(noScriptPage.locator("#main-content")).toBeVisible()
    await expect(noScriptPage.locator("[data-article-scene]")).toHaveCount(8)
    await expect(noScriptPage.getByRole("status")).toHaveCount(0)
    await expect(noScriptPage.locator("[data-hero-sticky]")).toHaveCSS(
      "position",
      "relative",
    )
    await expect(noScriptPage.locator("[data-article-progress]")).toBeHidden()
    await expect(noScriptPage.locator("[data-article-tracker]")).toBeHidden()
    await expect(noScriptPage.locator("[data-article-stage]")).toBeHidden()

    const staticHeroGeometry = await noScriptPage
      .locator("[data-article-hero]")
      .evaluate((hero) => ({
        height: hero.getBoundingClientRect().height,
        stickyHeight:
          hero.querySelector("[data-hero-sticky]")?.getBoundingClientRect()
            .height ?? 0,
      }))
    expect(
      Math.abs(staticHeroGeometry.height - staticHeroGeometry.stickyHeight),
    ).toBeLessThanOrEqual(1)

    await noScriptPage.locator("#seguranca").scrollIntoViewIfNeeded()
    await expect(
      noScriptPage.getByRole("heading", {
        level: 2,
        name: "Controls close to the boundary",
      }),
    ).toBeVisible()
    await expectNoHorizontalOverflow(noScriptPage, "Article without JavaScript")
  } finally {
    await noScriptPage.close()
  }
})

test.describe("immersive article experience", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } })

  test("keeps the hero choreography viewport-bound, phased and optically level", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto("/en/insights/go-em-producao", {
      waitUntil: "networkidle",
    })
    await prepareScrollLinkedMotion(page)

    const hero = page.locator("[data-article-hero]")
    await expect(hero).toHaveAttribute("data-hero-motion", "scroll")
    await expect(hero).toHaveAttribute("data-hero-active", "true")

    const initialState = await readArticleHeroState(page)
    expect(initialState.capability).toBe(true)
    expect(
      Math.abs(
        initialState.geometry.stickyHeight -
          initialState.geometry.viewportHeight,
      ),
    ).toBeLessThanOrEqual(1)

    const rangeInViewports =
      initialState.geometry.range / initialState.geometry.viewportHeight
    expect(rangeInViewports).toBeGreaterThanOrEqual(0.44)
    expect(rangeInViewports).toBeLessThanOrEqual(0.46)

    const fractions = [0, 0.1, 0.2, 0.38, 0.5, 0.68, 0.8, 1] as const
    const states: Awaited<ReturnType<typeof readArticleHeroState>>[] = []

    for (const fraction of fractions) {
      await scrollToAndRender(
        page,
        initialState.geometry.documentTop +
          initialState.geometry.range * fraction,
      )
      await expect
        .poll(async () => (await readArticleHeroState(page)).motion.progress)
        .toBeCloseTo(fraction, 2)

      const state = await readArticleHeroState(page)
      states.push(state)

      expect(state.dataset).toEqual({ active: "true", motion: "scroll" })
      expect(
        Math.abs(state.geometry.stickyHeight - state.geometry.viewportHeight),
      ).toBeLessThanOrEqual(1)
      expect(Math.abs(state.geometry.stickyTop)).toBeLessThanOrEqual(1)
      expect(state.overflow).toEqual({ body: 0, document: 0 })
      expect(state.opacity).toEqual({ copy: 1, footer: 1 })
      expect(Math.abs(state.rotation.coreVisual)).toBeLessThanOrEqual(0.05)
      state.rotation.metricsVisual.forEach((rotation) => {
        expect(Math.abs(rotation)).toBeLessThanOrEqual(0.05)
      })
    }

    const [
      start,
      signalPeak,
      signalSettled,
      typePeak,
      orbitMidpoint,
      orbitSettled,
      handoffMidpoint,
      complete,
    ] = states
    if (
      !start ||
      !signalPeak ||
      !signalSettled ||
      !typePeak ||
      !orbitMidpoint ||
      !orbitSettled ||
      !handoffMidpoint ||
      !complete
    ) {
      throw new Error("Hero choreography did not produce every sample")
    }

    expect(start.motion).toEqual({
      progress: 0,
      signal: 0,
      pulse: 0,
      type: 0,
      orbit: 0,
      handoff: 0,
    })
    expect(signalPeak.motion.signal).toBeGreaterThan(0.45)
    expect(signalPeak.motion.signal).toBeLessThan(0.55)
    expect(signalPeak.motion.pulse).toBeGreaterThan(0.95)
    expect(signalPeak.motion.orbit).toBe(0)
    expect(signalPeak.motion.handoff).toBe(0)

    expect(signalSettled.motion.signal).toBe(1)
    expect(signalSettled.motion.pulse).toBeGreaterThan(0.95)
    expect(signalSettled.motion.type).toBeGreaterThan(0.35)
    expect(signalSettled.motion.type).toBeLessThan(0.42)

    expect(typePeak.motion.pulse).toBe(0)
    expect(typePeak.motion.type).toBe(1)
    expect(typePeak.motion.orbit).toBeGreaterThan(0.2)
    expect(typePeak.motion.orbit).toBeLessThan(0.28)
    expect(typePeak.motion.handoff).toBe(0)

    expect(orbitMidpoint.motion.orbit).toBeGreaterThan(0.6)
    expect(orbitMidpoint.motion.orbit).toBeLessThan(0.67)
    expect(orbitSettled.motion.orbit).toBe(1)
    expect(orbitSettled.motion.handoff).toBeGreaterThan(0.1)
    expect(orbitSettled.motion.handoff).toBeLessThan(0.18)
    expect(orbitSettled.motion.type).toBeGreaterThan(0.82)
    expect(orbitSettled.motion.type).toBeLessThan(0.9)

    expect(handoffMidpoint.motion.handoff).toBeGreaterThan(0.5)
    expect(handoffMidpoint.motion.handoff).toBeLessThan(0.57)
    expect(handoffMidpoint.motion.type).toBeGreaterThan(0.43)
    expect(handoffMidpoint.motion.type).toBeLessThan(0.5)
    expect(complete.motion).toEqual({
      progress: 1,
      signal: 1,
      pulse: 0,
      type: 0,
      orbit: 1,
      handoff: 1,
    })

    for (let index = 1; index < states.length; index += 1) {
      const previous = states[index - 1]
      const current = states[index]
      if (!previous || !current) {
        throw new Error("Hero choreography samples must remain contiguous")
      }

      expect(current.motion.progress).toBeGreaterThanOrEqual(
        previous.motion.progress,
      )
      expect(current.motion.signal).toBeGreaterThanOrEqual(
        previous.motion.signal,
      )
      expect(current.motion.orbit).toBeGreaterThanOrEqual(previous.motion.orbit)
      expect(current.motion.handoff).toBeGreaterThanOrEqual(
        previous.motion.handoff,
      )
    }

    expect(typePeak.transforms.words[2]).not.toBe(start.transforms.words[2])
    expect(complete.transforms.words[2]).toBe(start.transforms.words[2])
    expect(complete.transforms.recorder).not.toBe(start.transforms.recorder)
    expect(Math.abs(complete.rotation.recorder)).toBeGreaterThan(10)
  })

  test("uses an unclipped static hero on constrained-height desktops", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 500 })
    await page.goto("/en/insights/go-em-producao", {
      waitUntil: "networkidle",
    })
    await prepareScrollLinkedMotion(page)

    const initialState = await readArticleHeroState(page)
    expect(initialState.capability).toBe(false)
    expect(initialState.stickyPosition).toBe("relative")
    expectStaticHeroMotion(initialState)

    const contentBounds = await page
      .locator("[data-hero-sticky]")
      .evaluate((sticky) => {
        const stickyBounds = sticky.getBoundingClientRect()
        const content = [
          sticky.querySelector("a"),
          sticky.querySelector("[data-hero-copy]"),
          sticky.querySelector("[data-hero-recorder]"),
          sticky.querySelector("[data-hero-footer]"),
        ].filter((element): element is Element => element !== null)

        return {
          bottom: Math.max(
            ...content.map((element) => element.getBoundingClientRect().bottom),
          ),
          left: Math.min(
            ...content.map((element) => element.getBoundingClientRect().left),
          ),
          right: Math.max(
            ...content.map((element) => element.getBoundingClientRect().right),
          ),
          sticky: {
            bottom: stickyBounds.bottom,
            left: stickyBounds.left,
            right: stickyBounds.right,
            top: stickyBounds.top,
          },
          top: Math.min(
            ...content.map((element) => element.getBoundingClientRect().top),
          ),
        }
      })
    expect(contentBounds.top).toBeGreaterThanOrEqual(contentBounds.sticky.top)
    expect(contentBounds.right).toBeLessThanOrEqual(contentBounds.sticky.right)
    expect(contentBounds.bottom).toBeLessThanOrEqual(
      contentBounds.sticky.bottom,
    )
    expect(contentBounds.left).toBeGreaterThanOrEqual(contentBounds.sticky.left)

    const initialTransforms = initialState.transforms
    await scrollToAndRender(
      page,
      initialState.geometry.documentTop + initialState.geometry.heroHeight - 1,
    )
    const scrolledState = await readArticleHeroState(page)

    expectStaticHeroMotion(scrolledState)
    expect(scrolledState.stickyPosition).toBe("relative")
    expect(scrolledState.transforms).toEqual(initialTransforms)
    scrolledState.motionStyles.forEach(({ willChange }) => {
      expect(willChange).toBe("auto")
    })
  })

  test("keeps the desktop flight recorder synchronized with native navigation", async ({
    page,
  }) => {
    await page.goto("/en/insights/go-em-producao", {
      waitUntil: "networkidle",
    })

    const experience = page.locator("[data-article-experience]")
    const stage = page.locator("[data-article-stage]")
    const navigation = page.getByRole("navigation", {
      name: "In this article",
    })
    const cacheLink = navigation.getByRole("link", {
      name: "Caching is an availability strategy",
      exact: true,
    })
    const initialScroll = await page.evaluate(() => window.scrollY)

    await expect(experience).toHaveAttribute("data-motion", "full")
    await cacheLink.click()

    await expect(page).toHaveURL(/#cache$/)
    await expect(experience).toHaveAttribute("data-active-scene", "cache")
    await expect(stage).toHaveAttribute("data-active-scene", "cache")
    await expect(stage).toHaveAttribute("data-scene", "cache-fallback")
    await expect(cacheLink).toHaveAttribute("aria-current", "location")
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(initialScroll)
    await expect
      .poll(() =>
        stage.evaluate((element) => {
          const bounds = element.getBoundingClientRect()
          return bounds.bottom > 0 && bounds.top < window.innerHeight
        }),
      )
      .toBe(true)

    const scrollLinkedMotion = await page
      .locator("[data-article-scene] > div")
      .evaluateAll((frames) => {
        const current = getComputedStyle(frames[3] as Element)
        const future = getComputedStyle(frames.at(-1) as Element)

        return {
          currentOpacity: Number(current.opacity),
          futureOpacity: Number(future.opacity),
          currentTransform: current.transform,
          futureTransform: future.transform,
          name: current.animationName,
          timeline: current.getPropertyValue("animation-timeline"),
        }
      })

    expect(scrollLinkedMotion.name).toContain("revealChapter")
    expect(scrollLinkedMotion.timeline).toMatch(/^view/)
    expect(scrollLinkedMotion.currentOpacity).toBe(1)
    expect(scrollLinkedMotion.futureOpacity).toBe(1)
    expect(scrollLinkedMotion.currentTransform).not.toBe(
      scrollLinkedMotion.futureTransform,
    )

    await expectNoHorizontalOverflow(page, "Immersive article on desktop")

    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          document.documentElement.style.scrollBehavior = "auto"
          let previousY = window.scrollY
          let stableFrames = 0

          const check = () => {
            if (Math.abs(window.scrollY - previousY) < 0.5) {
              stableFrames += 1
            } else {
              stableFrames = 0
              previousY = window.scrollY
            }

            if (stableFrames >= 4) {
              resolve()
            } else {
              requestAnimationFrame(check)
            }
          }

          requestAnimationFrame(check)
        }),
    )
    await stage.evaluate((element) => {
      const panel = element.firstElementChild
      if (panel instanceof HTMLElement) panel.scrollTop = panel.scrollHeight
    })
    await stage.hover()
    const scrollBeforeStageWheel = await page.evaluate(() => window.scrollY)
    await page.mouse.wheel(0, 480)
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(scrollBeforeStageWheel)

    await page.setViewportSize({ width: 1280, height: 600 })
    await expect
      .poll(() =>
        stage.evaluate((element) => {
          const panel = element.firstElementChild?.getBoundingClientRect()
          const links = element.querySelectorAll("a")
          const lastLink = links
            .item(links.length - 1)
            ?.getBoundingClientRect()

          return Boolean(
            panel &&
              lastLink &&
              panel.top >= 0 &&
              panel.bottom <= window.innerHeight &&
              lastLink.top >= 0 &&
              lastLink.bottom <= window.innerHeight,
          )
        }),
      )
      .toBe(true)
  })

  test("keeps editorial text fully opaque throughout normal scroll motion", async ({
    page,
  }) => {
    await page.goto("/en/insights/go-em-producao", {
      waitUntil: "networkidle",
    })
    await prepareScrollLinkedMotion(page)
    await page.locator("#cache").scrollIntoViewIfNeeded()

    const textSurfaceOpacity = await page
      .locator(
        "dl > div, [data-article-scene] > div, [data-stage-readout], [data-hero-copy], [data-hero-footer]",
      )
      .evaluateAll((elements) =>
        elements.map((element) => Number(getComputedStyle(element).opacity)),
      )

    expect(textSurfaceOpacity.length).toBeGreaterThan(12)
    expect(textSurfaceOpacity.every((opacity) => opacity > 0)).toBe(true)
    await expectNoAccessibilityViolations(page, "Article during normal scroll motion")
  })

  test("restores the visual scene from a deep link", async ({ page }) => {
    await page.goto("/en/insights/go-em-producao#seguranca", {
      waitUntil: "networkidle",
    })

    const experience = page.locator("[data-article-experience]")
    const stage = page.locator("[data-article-stage]")
    const navigation = page.getByRole("navigation", {
      name: "In this article",
    })
    const securityLink = navigation.getByRole("link", {
      name: "Controls close to the boundary",
      exact: true,
    })

    await expect(page).toHaveURL(/#seguranca$/)
    await expect(experience).toHaveAttribute("data-active-scene", "seguranca")
    await expect(stage).toHaveAttribute("data-scene", "security")
    await expect(securityLink).toHaveAttribute("aria-current", "location")
    await expect
      .poll(() =>
        page.locator("#seguranca").evaluate((element) => {
          const bounds = element.getBoundingClientRect()
          return bounds.bottom > 0 && bounds.top < window.innerHeight
        }),
      )
      .toBe(true)
  })
})

test.describe("immersive article on a coarse pointer", () => {
  test.use({
    viewport: { width: 1024, height: 768 },
    hasTouch: true,
    isMobile: true,
    contextOptions: { reducedMotion: "no-preference" },
  })

  test("keeps the hero transform stable at the start of touch scrolling", async ({
    page,
  }) => {
    await page.goto("/en/insights/go-em-producao", {
      waitUntil: "networkidle",
    })

    const experience = page.locator("[data-article-experience]")
    const hero = page.locator("[data-article-hero]")
    const lastTitleWord = page.locator("h1 > span").last()

    await expect(experience).toHaveAttribute("data-motion", "full")
    await expect
      .poll(() =>
        page.evaluate(() => window.matchMedia("(pointer: coarse)").matches),
      )
      .toBe(true)

    const initialTransform = await lastTitleWord.evaluate(
      (element) => getComputedStyle(element).transform,
    )

    await page.evaluate(() => window.scrollTo(0, 2))
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(2)
    await expect
      .poll(() =>
        hero.evaluate((element) =>
          element.style.getPropertyValue("--hero-progress"),
        ),
      )
      .toBe("0.0000")
    await expect
      .poll(() =>
        lastTitleWord.evaluate((element) => getComputedStyle(element).transform),
      )
      .toBe(initialTransform)
  })

  test("keeps the hero choreography static through coarse-pointer scrolling", async ({
    page,
  }) => {
    await page.goto("/en/insights/go-em-producao", {
      waitUntil: "networkidle",
    })
    await prepareScrollLinkedMotion(page)

    await expect
      .poll(() =>
        page.evaluate(() => window.matchMedia("(pointer: coarse)").matches),
      )
      .toBe(true)

    const initialState = await readArticleHeroState(page)
    expect(initialState.capability).toBe(false)
    expect(initialState.stickyPosition).toBe("relative")
    expectStaticHeroMotion(initialState)

    const initialTransforms = initialState.transforms
    const targets = [
      initialState.geometry.documentTop,
      initialState.geometry.documentTop + initialState.geometry.heroHeight * 0.5,
      initialState.geometry.documentTop + initialState.geometry.heroHeight - 1,
      initialState.geometry.documentTop +
        initialState.geometry.heroHeight +
        initialState.geometry.viewportHeight * 0.5,
    ]

    for (const target of targets) {
      await scrollToAndRender(page, target)
      const state = await readArticleHeroState(page)

      expectStaticHeroMotion(state)
      expect(state.stickyPosition).toBe("relative")
      expect(state.transforms).toEqual(initialTransforms)
      state.motionStyles.forEach(({ willChange }) => {
        expect(willChange).toBe("auto")
      })
    }
  })
})

test("keeps the complete article readable with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/en/insights/go-em-producao", { waitUntil: "networkidle" })

  const experience = page.locator("[data-article-experience]")
  const stage = page.locator("[data-article-stage]")

  await expect(experience).toHaveAttribute("data-motion", "reduced")
  await expect(stage).toHaveCSS("position", "relative")
  await expect(page.locator("[data-article-scene]")).toHaveCount(8)

  const chapterMotion = await page
    .locator("[data-article-scene] > div")
    .evaluateAll((chapters) =>
      chapters.map((chapter) => {
        const style = getComputedStyle(chapter)
        return {
          animationName: style.animationName,
          opacity: style.opacity,
          transform: style.transform,
        }
      }),
    )

  expect(chapterMotion).toEqual(
    Array.from({ length: 8 }, () => ({
      animationName: "none",
      opacity: "1",
      transform: "none",
    })),
  )

  const residualStageMotion = await page
    .locator(
      "[data-stage-orbit], [data-stage-security-ring], [data-stage-trace-map], [data-stage-trace-signal], [data-stage-fallback-rail]",
    )
    .evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element)
        return {
          animationName: style.animationName,
          transitionDuration: style.transitionDuration,
          transform: style.transform,
        }
      }),
    )

  residualStageMotion.forEach(
    ({ animationName, transitionDuration, transform }) => {
      expect(animationName).toBe("none")
      expect(hasEffectivelyZeroCssDuration(transitionDuration)).toBe(true)
      expect(transform).toBe("none")
    },
  )

  const chapterMarkers = await page
    .locator("[data-article-scene]")
    .evaluateAll((chapters) =>
      chapters.map((chapter) => {
        const style = getComputedStyle(chapter, "::before")
        return {
          transform: style.transform,
          transitionDuration: style.transitionDuration,
        }
      }),
    )
  expect(new Set(chapterMarkers.map(({ transform }) => transform)).size).toBe(1)
  expect(
    chapterMarkers.every(({ transitionDuration }) =>
      hasEffectivelyZeroCssDuration(transitionDuration),
    ),
  ).toBe(true)
  await expectNoHorizontalOverflow(page, "Reduced-motion article")
})

test("keeps the hero choreography static with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/en/insights/go-em-producao", { waitUntil: "networkidle" })
  await prepareScrollLinkedMotion(page)

  const experience = page.locator("[data-article-experience]")
  await expect(experience).toHaveAttribute("data-motion", "reduced")

  const initialState = await readArticleHeroState(page)
  expect(initialState.capability).toBe(true)
  expect(initialState.stickyPosition).toBe("relative")
  expectStaticHeroMotion(initialState)
  const initialTransforms = initialState.transforms

  const targets = [
    initialState.geometry.documentTop,
    initialState.geometry.documentTop + initialState.geometry.heroHeight * 0.5,
    initialState.geometry.documentTop +
      initialState.geometry.heroHeight +
      initialState.geometry.viewportHeight * 0.5,
  ]

  for (const target of targets) {
    await scrollToAndRender(page, target)
    const state = await readArticleHeroState(page)

    expectStaticHeroMotion(state)
    expect(state.stickyPosition).toBe("relative")
    expect(state.transforms.copy).toBe("none")
    expect(state.transforms.recorder).toBe("none")
    expect(state.transforms.core).toBe("none")
    expect(state.transforms).toEqual(initialTransforms)
    state.motionStyles.forEach(
      ({ animationName, transitionDuration, willChange }) => {
        expect(animationName).toBe("none")
        expect(Number.parseFloat(transitionDuration)).toBeLessThanOrEqual(
          0.00001,
        )
        expect(willChange).toBe("auto")
      },
    )
  }
})

test("fits the article CTA into one viewport across locales and sizes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })

  const scenarios = [
    { locale: "pt", width: 1280, height: 720 },
    { locale: "pt", width: 1024, height: 600 },
    { locale: "pt", width: 390, height: 844 },
    { locale: "en", width: 1280, height: 720 },
    { locale: "es", width: 1280, height: 720 },
  ] as const

  for (const scenario of scenarios) {
    await page.setViewportSize({
      width: scenario.width,
      height: scenario.height,
    })
    await page.goto(`/${scenario.locale}/insights/go-em-producao`, {
      waitUntil: "domcontentloaded",
    })
    await page.evaluate(() => document.fonts.ready)

    const layout = await page.locator("[data-article-cta]").evaluate((section) => {
      const content = section.querySelector<HTMLElement>(
        "[data-article-cta-content]",
      )
      const title = section.querySelector<HTMLElement>(
        "[data-article-cta-title]",
      )

      if (!content || !title) {
        throw new Error("Article CTA layout hooks are missing")
      }

      const sectionRect = section.getBoundingClientRect()
      const contentRect = content.getBoundingClientRect()
      const titleRect = title.getBoundingClientRect()
      const titleStyle = getComputedStyle(title)
      const titleLineHeight = Number.parseFloat(titleStyle.lineHeight)

      return {
        viewportHeight: window.innerHeight,
        sectionHeight: sectionRect.height,
        sectionWidth: sectionRect.width,
        contentTop: contentRect.top - sectionRect.top,
        contentBottom: contentRect.bottom - sectionRect.top,
        contentLeft: contentRect.left - sectionRect.left,
        contentRight: contentRect.right - sectionRect.left,
        titleFontSize: Number.parseFloat(titleStyle.fontSize),
        titleLines: Math.round(titleRect.height / titleLineHeight),
      }
    })

    expect(
      Math.abs(layout.sectionHeight - layout.viewportHeight),
      `${scenario.locale} ${scenario.width}x${scenario.height}: CTA height`,
    ).toBeLessThanOrEqual(1)
    expect(layout.contentTop).toBeGreaterThanOrEqual(16)
    expect(layout.contentBottom).toBeLessThanOrEqual(layout.sectionHeight - 16)
    expect(layout.contentLeft).toBeGreaterThanOrEqual(0)
    expect(layout.contentRight).toBeLessThanOrEqual(layout.sectionWidth)
    expect(layout.titleFontSize).toBeGreaterThanOrEqual(34)
    expect(layout.titleFontSize).toBeLessThanOrEqual(72)
    expect(layout.titleLines).toBeLessThanOrEqual(7)
  }

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/en/insights/go-em-producao", {
    waitUntil: "domcontentloaded",
  })
  await page.evaluate(async () => {
    await document.fonts.ready
    document.documentElement.style.fontSize = "200%"
  })

  const resizedTextLayout = await page
    .locator("[data-article-cta]")
    .evaluate((section) => {
      const content = section.querySelector<HTMLElement>(
        "[data-article-cta-content]",
      )
      if (!content) throw new Error("Article CTA content was not rendered")

      const sectionRect = section.getBoundingClientRect()
      const contentRect = content.getBoundingClientRect()
      return {
        viewportHeight: window.innerHeight,
        sectionHeight: sectionRect.height,
        contentTop: contentRect.top - sectionRect.top,
        contentBottom: contentRect.bottom - sectionRect.top,
      }
    })

  expect(resizedTextLayout.sectionHeight).toBeGreaterThanOrEqual(
    resizedTextLayout.viewportHeight,
  )
  expect(resizedTextLayout.contentTop).toBeGreaterThanOrEqual(0)
  expect(resizedTextLayout.contentBottom).toBeLessThanOrEqual(
    resizedTextLayout.sectionHeight,
  )
  await expect(page.getByRole("link", { name: "Discuss the project" })).toBeVisible()
})

test("keeps article content fully opaque with increased contrast", async ({
  page,
}) => {
  await page.emulateMedia({ contrast: "more", reducedMotion: "no-preference" })
  await page.goto("/en/insights/go-em-producao", { waitUntil: "networkidle" })

  const contrastMotion = await page
    .locator(
      "dl > div, [data-article-scene] > div, [data-stage-readout]",
    )
    .evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element)
        return {
          animationName: style.animationName,
          opacity: style.opacity,
          transform: style.transform,
        }
      }),
    )

  expect(contrastMotion.length).toBeGreaterThan(8)
  expect(contrastMotion).toEqual(
    contrastMotion.map(() => ({
      animationName: "none",
      opacity: "1",
      transform: "none",
    })),
  )
  await expectNoHorizontalOverflow(page, "Increased-contrast article")
})

test("renders a complete, static print edition of the article", async ({ page }) => {
  await page.emulateMedia({ media: "print", reducedMotion: "no-preference" })
  await page.goto("/en/insights/go-em-producao", { waitUntil: "networkidle" })

  const printMotion = await page
    .locator("dl > div, [data-article-scene] > div, [data-topology-signal]")
    .evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element)
        return {
          animationName: style.animationName,
          opacity: style.opacity,
          transform: style.transform,
        }
      }),
    )

  expect(printMotion).toHaveLength(13)
  expect(printMotion).toEqual(
    printMotion.map(() => ({
      animationName: "none",
      opacity: "1",
      transform: "none",
    })),
  )
  const articleNavigation = page.locator("[data-article-navigation]")
  await expect(articleNavigation).toHaveCount(1)
  await expect(articleNavigation).toBeHidden()
  expect(
    await page.locator("body").evaluate(
      (element) => getComputedStyle(element, "::after").display,
    ),
  ).toBe("none")
  await expect(page.locator("[data-article-scene]")).toHaveCount(8)

  const titleFitsPrintSurface = await page
    .locator("[data-article-title]")
    .evaluate((title) => {
      const titleRect = title.getBoundingClientRect()
      return Array.from(title.children).every((word) => {
        const wordRect = word.getBoundingClientRect()
        return (
          wordRect.left >= titleRect.left - 1 &&
          wordRect.right <= titleRect.right + 1
        )
      })
    })
  expect(titleFitsPrintSurface).toBe(true)

  const ctaPrintLayout = await page
    .locator("[data-article-cta]")
    .evaluate((section) => {
      const style = getComputedStyle(section)
      return {
        breakBefore: style.breakBefore,
        breakInside: style.breakInside,
      }
    })
  expect(ctaPrintLayout).toEqual({
    breakBefore: "page",
    breakInside: "avoid-page",
  })
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

test("exposes a valid human-confirmed WebMCP contact tool", async ({ page }) => {
  await page.addInitScript(() => {
    if (!("modelContext" in document) && !("modelContext" in navigator)) {
      Object.defineProperty(Document.prototype, "modelContext", {
        configurable: true,
        value: {},
      })
    }
  })
  await page.goto("/en", { waitUntil: "networkidle" })

  const form = page.locator('form[toolname="prepare_portfolio_contact"]')
  await expect(form).toHaveCount(1)

  const contract = await form.evaluate((element) => {
    if (!(element instanceof HTMLFormElement)) {
      throw new Error("The WebMCP tool must be backed by a form")
    }

    const fields = Array.from(element.elements).filter(
      (field): field is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement =>
        field instanceof HTMLInputElement ||
        field instanceof HTMLSelectElement ||
        field instanceof HTMLTextAreaElement,
    )

    return {
      description: element.getAttribute("tooldescription"),
      autoSubmit: element.hasAttribute("toolautosubmit"),
      fields: fields.map((field) => ({
        name: field.name,
        required: field.required,
        description: field.getAttribute("toolparamdescription"),
      })),
    }
  })

  expect(contract.description).toContain("manual confirmation")
  expect(contract.autoSubmit).toBe(false)
  expect(contract.fields.map(({ name }) => name)).toEqual([
    "name",
    "email",
    "company",
    "projectType",
    "message",
    "budget",
  ])
  expect(new Set(contract.fields.map(({ name }) => name)).size).toBe(
    contract.fields.length,
  )
  expect(
    contract.fields
      .filter(({ required }) => required)
      .map(({ name }) => name),
  ).toEqual(["name", "email", "projectType", "message"])
  expect(
    contract.fields.every(({ description }) => Boolean(description?.trim())),
  ).toBe(true)
  await expect(page.locator("#botCheck")).toHaveCount(1)
  await expect(form.locator("#botCheck")).toHaveCount(0)
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

test("presents nine securely linked Grupo Bandeirantes products", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/en/#projects", { waitUntil: "domcontentloaded" })
  await expect(
    page.locator("[data-projects-client][data-hydrated='true']"),
  ).toHaveCount(1)
  await page
    .getByRole("button", { name: /Grupo Bandeirantes.*View details/ })
    .click()

  const dialog = page.getByRole("dialog", { name: "Grupo Bandeirantes" })
  const managedProducts = dialog.locator("[data-managed-products]")
  const productLinks = managedProducts.locator("[data-managed-product-link]")
  const expectedProducts = [
    ["BandSports", "https://bandsports.uol.com.br/"],
    ["BandNews TV", "https://bandnewstv.uol.com.br/"],
    ["Arte 1", "https://canalarte1.uol.com.br/"],
    ["Terra Viva", "https://terraviva.uol.com.br/"],
    ["Agro+", "https://agromais.uol.com.br/"],
    ["Sabor & Arte", "https://canalsaborearte.uol.com.br/"],
    ["Newco Play", "https://newcoplay.com.br/"],
    ["Vivo Newco Play", "https://vivo.newcoplay.com.br/home"],
    ["Surf Play", "https://surf.newcoplay.com.br/"],
  ] as const

  await expect(dialog).toBeVisible()
  await expect(
    managedProducts.getByRole("heading", {
      level: 3,
      name: "From concept to ongoing support",
    }),
  ).toBeVisible()
  await expect(
    managedProducts.locator("[data-managed-product-group='editorialPortals']"),
  ).toContainText("Editorial portals")
  await expect(
    managedProducts.locator("[data-managed-product-group='newcoPlay']"),
  ).toContainText("Newco Play ecosystem")
  await expect(productLinks).toHaveCount(expectedProducts.length)

  for (const [index, [name, href]] of expectedProducts.entries()) {
    const link = productLinks.nth(index)
    const relTokens = (await link.getAttribute("rel"))
      ?.split(/\s+/)
      .filter(Boolean)
      .sort()

    await expect(link).toContainText(name)
    await expect(link).toHaveAttribute("href", href)
    await expect(link).toHaveAttribute("target", "_blank")
    expect(relTokens).toEqual(["external", "noopener", "noreferrer"])
    await expect(link).toHaveAccessibleName(/opens in a new tab/i)
  }

  await expectNoAccessibilityViolations(
    page,
    "Grupo Bandeirantes managed products",
  )
})

test.describe("normal-motion project drawer", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } })

  test("keeps the projects section anchored while the first drawer loads", async ({
    browser,
    page,
  }, testInfo) => {
    const projectDrawerChunkPaths = await discoverInteractionChunkPaths(
      browser,
      testInfo.project.use.baseURL,
      async (discoveryPage) => {
        await discoveryPage
          .getByRole("button", {
            name: /Grupo Bandeirantes.*View details/,
          })
          .dispatchEvent("click")
        await expect(
          discoveryPage.getByRole("dialog", { name: "Grupo Bandeirantes" }),
        ).toBeVisible()
      },
    )
    const deferredChunkRequests = new Set<string>()
    let releaseChunks: () => void = () => undefined
    const chunkGate = new Promise<void>((resolve) => {
      releaseChunks = resolve
    })

    await page.goto("/en/", { waitUntil: "networkidle" })
    await page.route(
      (url) => projectDrawerChunkPaths.has(url.pathname),
      async (route) => {
        const path = new URL(route.request().url()).pathname
        deferredChunkRequests.add(path)
        await chunkGate
        await route.continue()
      },
    )
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
      const recordMainVisibility = () => {
        const currentMain = document.querySelector("main")
        if (
          !(currentMain instanceof HTMLElement) ||
          getComputedStyle(currentMain).display === "none"
        ) {
          document.documentElement.dataset.mainHiddenDuringDrawerLoad = "true"
        }
      }
      const visibilityObserver = new MutationObserver(recordMainVisibility)
      visibilityObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "hidden", "style"],
      })
    })

    const opener = page.getByRole("button", {
      name: /Grupo Bandeirantes.*View details/,
    })
    await expect(opener).toBeVisible()
    await opener.scrollIntoViewIfNeeded()

    const readProjectContext = () =>
      page.evaluate(() => {
        const section = document.querySelector("#projects")
        const trigger = document.querySelector(
          '[data-project-trigger="band-news-bandsports"]',
        )
        if (!(section instanceof HTMLElement) || !(trigger instanceof HTMLElement)) {
          throw new Error("Project context was not found")
        }

        const sectionRect = section.getBoundingClientRect()
        const triggerRect = trigger.getBoundingClientRect()
        return {
          isVisible:
            sectionRect.bottom > 0 &&
            sectionRect.top < window.innerHeight &&
            triggerRect.bottom > 0 &&
            triggerRect.top < window.innerHeight,
          scrollY: window.scrollY,
          sectionTop: sectionRect.top,
          triggerTop: triggerRect.top,
          maxScrollDelta: Number.parseFloat(
            document.documentElement.dataset.maxProjectScrollDelta ?? "0",
          ),
        }
      })

    const projectContextIsStable = async (
      baseline: Awaited<ReturnType<typeof readProjectContext>>,
    ) => {
      const current = await readProjectContext()
      return (
        current.isVisible &&
        current.maxScrollDelta <= 1 &&
        Math.abs(current.scrollY - baseline.scrollY) <= 1 &&
        Math.abs(current.sectionTop - baseline.sectionTop) <= 1 &&
        Math.abs(current.triggerTop - baseline.triggerTop) <= 1
      )
    }

    await expect.poll(async () => (await readProjectContext()).isVisible).toBe(true)
    const initialProjectContext = await readProjectContext()
    await page.evaluate((baselineScrollY) => {
      const root = document.documentElement
      root.dataset.maxProjectScrollDelta = "0"
      const recordScrollDelta = () => {
        const currentMaximum = Number.parseFloat(
          root.dataset.maxProjectScrollDelta ?? "0",
        )
        const delta = Math.abs(window.scrollY - baselineScrollY)
        if (delta > currentMaximum) {
          root.dataset.maxProjectScrollDelta = String(delta)
        }
      }
      window.addEventListener("scroll", recordScrollDelta, { passive: true })
    }, initialProjectContext.scrollY)

    // Dispatch directly so pointer-enter preloading cannot consume the exact
    // module request this test intentionally holds behind the network gate.
    const openDrawer = opener.dispatchEvent("click")
    try {
      await expect.poll(() => deferredChunkRequests.size).toBeGreaterThan(0)
      const loadingDialog = page.getByRole("dialog", {
        name: /Loading details for Grupo Bandeirantes/,
      })
      await expect(loadingDialog).toBeVisible()
      await expect(loadingDialog).toHaveAttribute("aria-busy", "true")
      await expect(opener).toHaveAttribute("aria-expanded", "true")
      await expect(
        loadingDialog.getByRole("button", { name: "Close details" }),
      ).toBeFocused()
      await expect
        .poll(() => page.evaluate(() => document.documentElement.style.overflow))
        .toBe("hidden")
      await expect
        .poll(() =>
          page
            .locator("main")
            .evaluate((element) =>
              element instanceof HTMLElement ? element.inert : false,
            ),
        )
        .toBe(true)
      await expect(page.locator("main")).toHaveCSS("display", "block")
      await expect(page.locator("html")).toHaveAttribute(
        "data-main-hidden-during-drawer-load",
        "false",
      )
      await expect
        .poll(() => projectContextIsStable(initialProjectContext))
        .toBe(true)
    } finally {
      releaseChunks()
      await openDrawer
    }

    await expect(
      page.getByRole("dialog", { name: "Grupo Bandeirantes" }),
    ).toBeVisible()
    await expect(opener).toHaveAttribute("aria-expanded", "true")
    await expect(page.locator("html")).toHaveAttribute(
      "data-main-hidden-during-drawer-load",
      "false",
    )
    await expect
      .poll(() => projectContextIsStable(initialProjectContext))
      .toBe(true)
  })

  test("contains a failed drawer chunk locally and retries without losing the home", async ({
    browser,
    page,
  }, testInfo) => {
    const projectDrawerChunkPaths = await discoverInteractionChunkPaths(
      browser,
      testInfo.project.use.baseURL,
      async (discoveryPage) => {
        await discoveryPage
          .getByRole("button", {
            name: /Grupo Bandeirantes.*View details/,
          })
          .dispatchEvent("click")
        await expect(
          discoveryPage.getByRole("dialog", { name: "Grupo Bandeirantes" }),
        ).toBeVisible()
      },
    )
    await page.goto("/en/#projects", { waitUntil: "networkidle" })

    let abortDeferredChunks = true
    const abortedChunkPaths = new Set<string>()
    const retriedChunkPaths = new Set<string>()
    await page.route((url) => projectDrawerChunkPaths.has(url.pathname), async (route) => {
      const path = new URL(route.request().url()).pathname
      if (!abortDeferredChunks) {
        if (abortedChunkPaths.has(path)) {
          retriedChunkPaths.add(path)
        }
        await route.continue()
        return
      }

      abortedChunkPaths.add(path)
      await route.abort()
    })

    const opener = page.getByRole("button", {
      name: /Grupo Bandeirantes.*View details/,
    })
    // Keep the injected failure scoped to the import initiated by opening,
    // rather than the best-effort pointer-enter preload.
    await opener.dispatchEvent("click")

    const failure = page.getByRole("alertdialog", {
      name: "This project could not be opened",
    })
    await expect(failure).toBeVisible()
    expect(
      abortedChunkPaths.size,
      "the deferred ProjectDrawer module must be the failed request",
    ).toBeGreaterThan(0)
    await expect(page.locator("main")).toHaveCSS("display", "block")
    await expect(opener).toHaveAttribute("aria-expanded", "true")
    await expect(
      failure.getByRole("button", { name: "Try again" }),
    ).toBeFocused()

    abortDeferredChunks = false
    const reloaded = page.waitForEvent("framenavigated", (frame) =>
      frame === page.mainFrame(),
    )
    await failure.getByRole("button", { name: "Try again" }).click()
    await reloaded

    const dialog = page.getByRole("dialog", { name: "Grupo Bandeirantes" })
    await expect(dialog).toBeVisible()
    expect(retriedChunkPaths.size).toBeGreaterThan(0)
    await expect(page).toHaveURL(/\/en\/?#projects$/)
    await expect(dialog).not.toHaveAttribute("aria-busy", "true")
    await expect(page.locator("main")).toHaveCSS("display", "block")

    await dialog.getByRole("button", { name: "Close details" }).click()
    await expect(dialog).toBeHidden()
    await expect(opener).toBeFocused()
    await expect(opener).toHaveAttribute("aria-expanded", "false")
  })

  test("keeps the latest filter intent when an animation import fails", async ({
    browser,
    page,
  }, testInfo) => {
    const gsapChunkPaths = await discoverInteractionChunkPaths(
      browser,
      testInfo.project.use.baseURL,
      async (discoveryPage) => {
        const internationalFilter = discoveryPage.getByRole("button", {
          name: "International",
          exact: true,
        })
        await internationalFilter.click()
        await expect(internationalFilter).toHaveAttribute("aria-pressed", "true")
      },
    )
    const pageErrors: string[] = []
    const abortedChunkPaths = new Set<string>()
    page.on("pageerror", (error) => pageErrors.push(error.message))

    await page.goto("/en/#projects", { waitUntil: "networkidle" })
    await page.route((url) => gsapChunkPaths.has(url.pathname), async (route) => {
      const path = new URL(route.request().url()).pathname
      abortedChunkPaths.add(path)
      await route.abort()
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

    expect(
      abortedChunkPaths.size,
      "the filter fallback must be exercised by failing the deferred GSAP runtime",
    ).toBeGreaterThan(0)
    expect(pageErrors).toEqual([])
  })

  test("uses one uniform readability blur across the project drawer", async ({
    page,
  }) => {
    await page.goto("/en/#projects")
    await page
      .getByRole("button", { name: /Grupo Bandeirantes.*View details/ })
      .click()

    const dialog = page.getByRole("dialog", { name: "Grupo Bandeirantes" })
    const scrim = dialog.locator("[data-project-drawer-scrim]")
    const header = dialog.locator("[data-project-drawer-header]")
    const scroller = dialog.locator("[data-project-drawer-scroll]")

    await expect(dialog).toBeVisible()
    // Wait for the GSAP entrance animation to finish before snapshotting the
    // header position.  GSAP sets will-change:transform during the tween and
    // clears it on complete, so polling for an empty value is a reliable
    // signal that the drawer has settled at its resting geometry.
    await expect
      .poll(
        () => dialog.evaluate((el) => (el as HTMLElement).style.willChange),
        { timeout: 3_000 },
      )
      .toBe("")
    await scroller.evaluate((element) => {
      element.scrollTop = element.scrollHeight
    })
    await expect.poll(() => scroller.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
    await expect
      .poll(() => header.evaluate((element) => element.getBoundingClientRect().top))
      .toBeGreaterThanOrEqual(0)
    await expect(scrim).toHaveCSS("backdrop-filter", "blur(12px)")
    await expect(header).toHaveCSS("backdrop-filter", "blur(12px)")
    await expect(dialog).toHaveCSS("backdrop-filter", "blur(12px)")
    await expect(page.locator("[data-project-drawer-backdrop]")).toHaveCSS(
      "backdrop-filter",
      "blur(4px)",
    )
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

    const managedProductLinks = dialog.locator("[data-managed-product-link]")
    await expect(managedProductLinks).toHaveCount(9)
    await page.keyboard.press("Tab")
    await expect(managedProductLinks.first()).toBeFocused()
    await page.keyboard.press("Shift+Tab")
    await expect(closeButton).toBeFocused()
    await page.keyboard.press("Shift+Tab")
    await expect(managedProductLinks.last()).toBeFocused()
    await page.keyboard.press("Tab")
    await expect(closeButton).toBeFocused()

    const migratedPortals = dialog
      .getByText("Portals migrated", { exact: true })
      .locator("..")
      .locator("[data-count-up-animated]")

    await page.evaluate(() => {
      const root = document.documentElement
      root.dataset.drawerFocusVisitedBody = "false"
      root.dataset.trackDrawerExitFocus = "true"

      const trackFocus = () => {
        if (root.dataset.trackDrawerExitFocus !== "true") return
        if (document.activeElement === document.body) {
          root.dataset.drawerFocusVisitedBody = "true"
        }
        requestAnimationFrame(trackFocus)
      }
      requestAnimationFrame(trackFocus)
    })

    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden({ timeout: 1_000 })
    await expect(opener).toBeFocused({ timeout: 1_000 })
    await page.evaluate(() => {
      document.documentElement.dataset.trackDrawerExitFocus = "false"
    })
    await expect
      .poll(() => page.evaluate(() => document.documentElement.style.overflow))
      .toBe("")
    await opener.press("Enter")
    await expect(dialog).toBeVisible()
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
    await expect(
      dialog.locator("[data-project-drawer-scrim]"),
    ).toHaveCSS("backdrop-filter", "none")
    await expect(page.locator("[data-project-drawer-backdrop]")).toHaveCSS(
      "backdrop-filter",
      "none",
    )
    await expect(
      dialog.locator("[data-project-drawer-header]"),
    ).toHaveCSS("backdrop-filter", "none")
    await expect(dialog).toHaveCSS("backdrop-filter", "none")
    await expect(
      dialog.locator("[data-project-drawer-header]"),
    ).toHaveCSS("background-color", "rgba(5, 10, 18, 0.96)")

    const drawerHeader = dialog.locator("[data-project-drawer-header]")
    for (let index = 0; index < 9; index += 1) {
      await page.keyboard.press("Tab")
      const productLink = managedProductLinks.nth(index)
      await expect(productLink).toBeFocused()
      await expect
        .poll(() =>
          Promise.all([
            productLink.boundingBox(),
            drawerHeader.boundingBox(),
            dialog.boundingBox(),
          ]).then(([linkBox, headerBox, dialogBox]) => {
            if (!linkBox || !headerBox || !dialogBox) return false

            return (
              linkBox.height >= 44 &&
              linkBox.y >= headerBox.y + headerBox.height - 1 &&
              linkBox.y + linkBox.height <= dialogBox.y + dialogBox.height + 1
            )
          }),
        )
        .toBe(true)
    }
    await page.keyboard.press("Tab")
    await expect(closeButton).toBeFocused()
    await expectNoHorizontalOverflow(
      page,
      "Grupo Bandeirantes drawer on mobile",
    )
    await expect
      .poll(() =>
        dialog.locator("[data-managed-products]").evaluate((element) =>
          element.scrollWidth <= element.clientWidth,
        ),
      )
      .toBe(true)

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

    await page.setViewportSize({ width: 844, height: 390 })
    await trigger.click()
    await expect(dialog).toBeVisible()

    const links = dialog.getByRole("link")
    const closeButton = dialog.getByRole("button", { name: "Fechar menu" })
    await expect(links).toHaveCount(8)
    await expect(links.first()).toBeFocused()

    for (let index = 0; index < 8; index += 1) {
      const link = links.nth(index)
      await expect(link).toBeFocused()
      await expect
        .poll(() =>
          link.evaluate((element) => {
            const rect = element.getBoundingClientRect()
            return rect.top >= 0 && rect.bottom <= window.innerHeight
          }),
        )
        .toBe(true)

      if (index < 7) await page.keyboard.press("Tab")
    }

    await page.keyboard.press("Tab")
    await expect(closeButton).toBeFocused()
    await expect(closeButton).toBeInViewport()

    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    )
    expect(overflows).toBe(false)
  })

  test("keeps the article linear, synchronized and free of horizontal overflow", async ({
    page,
  }) => {
    await page.goto("/en/insights/go-em-producao", {
      waitUntil: "networkidle",
    })

    const experience = page.locator("[data-article-experience]")
    const stage = page.locator("[data-article-stage]")
    const tracker = experience.locator(
      'div[aria-hidden="true"][data-active-scene]',
    )

    await expect(experience).toHaveAttribute("data-motion", "reduced")
    await expect(stage).toBeHidden()
    await expect(tracker).toBeVisible()

    await page.locator("#seguranca").scrollIntoViewIfNeeded()

    await expect(experience).toHaveAttribute("data-active-scene", "seguranca")
    await expect(tracker).toHaveAttribute("data-active-scene", "seguranca")
    await expect(tracker).toContainText("Controls close to the boundary")
    await expectNoHorizontalOverflow(page, "Immersive article on mobile")
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
