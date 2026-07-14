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

async function armDrawerExitObservation(page: Page) {
  await page.evaluate(() => {
    const root = document.documentElement
    delete root.dataset.drawerExitObserved
    delete root.dataset.drawerExitFocusContained
    delete root.dataset.drawerExitScrollLocked
    delete root.dataset.drawerExitBackgroundInert

    const observer = new MutationObserver((records) => {
      const closingDialog = records
        .filter((record) => record.type === "attributes")
        .map((record) => record.target)
        .find(
          (target): target is HTMLElement =>
            target instanceof HTMLElement &&
            target.id === "project-drawer" &&
            target.dataset.state === "closing",
        )
      if (!closingDialog) return

      const main = document.querySelector("main")
      root.dataset.drawerExitObserved = "true"
      root.dataset.drawerExitFocusContained = String(
        closingDialog.contains(document.activeElement),
      )
      root.dataset.drawerExitScrollLocked = String(
        root.style.overflow === "hidden",
      )
      root.dataset.drawerExitBackgroundInert = String(
        main instanceof HTMLElement && main.inert,
      )
      observer.disconnect()
    })

    observer.observe(document.body, {
      attributeFilter: ["data-state"],
      attributes: true,
      subtree: true,
    })
  })
}

async function expectProtectedDrawerExit(page: Page) {
  const root = page.locator("html")
  await expect(root).toHaveAttribute("data-drawer-exit-observed", "true")
  await expect(root).toHaveAttribute(
    "data-drawer-exit-focus-contained",
    "true",
  )
  await expect(root).toHaveAttribute(
    "data-drawer-exit-scroll-locked",
    "true",
  )
  await expect(root).toHaveAttribute(
    "data-drawer-exit-background-inert",
    "true",
  )
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

  await firstMetric.hover({ position: edgePosition })
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
    .toBeGreaterThan(0.35)
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
  await expect(page.locator("article section")).toHaveCount(8)
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
  await expect(
    page.locator('link[rel="alternate"][hreflang="en-US"]'),
  ).toHaveAttribute(
    "href",
    "https://robertomoraes.dev/en/insights/go-em-producao",
  )
  const articleSchema = await page
    .locator('#main-content > script[type="application/ld+json"]')
    .textContent()
  expect(articleSchema).toContain("TechArticle")
  expect(articleSchema).toContain('"inLanguage":"en-US"')
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

test.describe("normal-motion project drawer", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } })

  test("keeps the projects section anchored while the first drawer loads", async ({
    page,
  }) => {
    await page.goto("/en/", { waitUntil: "networkidle" })
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
      const visibilityObserver = new MutationObserver(() => {
        if (getComputedStyle(main).display === "none") {
          document.documentElement.dataset.mainHiddenDuringDrawerLoad = "true"
        }
      })
      visibilityObserver.observe(main, {
        attributes: true,
        attributeFilter: ["style"],
      })
    })

    const opener = page.getByRole("button", {
      name: /Grupo Bandeirantes.*View details/,
    })
    await expect(opener).toBeVisible()

    let interceptedChunks = 0
    let releaseChunks: () => void = () => undefined
    const chunkGate = new Promise<void>((resolve) => {
      releaseChunks = resolve
    })
    await page.route("**/_next/static/chunks/*.js", async (route) => {
      interceptedChunks += 1
      await chunkGate
      await route.continue()
    })

    const projectContextIsVisible = async () => {
      const sectionIsVisible = await page
        .locator("#projects")
        .evaluate((element) => {
          const rect = element.getBoundingClientRect()
          return rect.bottom > 0 && rect.top < window.innerHeight
        })
      const openerIsVisible = await opener.evaluate((element) => {
        const rect = element.getBoundingClientRect()
        return rect.bottom > 0 && rect.top < window.innerHeight
      })
      return sectionIsVisible && openerIsVisible
    }

    await expect.poll(projectContextIsVisible).toBe(true)

    const openDrawer = opener.click()
    await expect.poll(() => interceptedChunks).toBeGreaterThan(0)
    await expect(page.locator("main")).toHaveCSS("display", "block")
    await expect(page.locator("html")).toHaveAttribute(
      "data-main-hidden-during-drawer-load",
      "false",
    )
    await expect.poll(projectContextIsVisible).toBe(true)

    releaseChunks()
    await openDrawer

    await expect(
      page.getByRole("dialog", { name: "Grupo Bandeirantes" }),
    ).toBeVisible()
    await expect(page.locator("html")).toHaveAttribute(
      "data-main-hidden-during-drawer-load",
      "false",
    )
    await expect.poll(projectContextIsVisible).toBe(true)
  })

  test("keeps the latest filter intent when an animation import fails", async ({
    page,
  }) => {
    const pageErrors: string[] = []
    let abortedChunks = 0
    page.on("pageerror", (error) => pageErrors.push(error.message))

    await page.goto("/en/#projects", { waitUntil: "networkidle" })
    await page.route("**/_next/static/chunks/*.js", (route) => {
      abortedChunks += 1
      return route.abort()
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

    expect(abortedChunks).toBeGreaterThan(0)
    expect(pageErrors).toEqual([])
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

    await page.keyboard.press("Tab")
    await expect(closeButton).toBeFocused()
    await page.keyboard.press("Shift+Tab")
    await expect(closeButton).toBeFocused()

    const migratedPortals = dialog
      .getByText("Portals migrated", { exact: true })
      .locator("..")
      .locator("span")
      .first()

    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden({ timeout: 400 })
    await opener.press("Enter")
    await expect(dialog).toBeVisible()
    await page.waitForTimeout(650)
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

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    )
    expect(overflows).toBe(false)
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
