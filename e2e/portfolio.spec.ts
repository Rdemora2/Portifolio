import AxeBuilder from "@axe-core/playwright"
import { expect, type Page, test } from "@playwright/test"

import { expectNoContentClipping } from "./helpers/layout"

const routeMatrix = [
  {
    surface: "home",
    pt: "/",
    en: "/en",
    es: "/es",
  },
  {
    surface: "work",
    pt: "/projetos",
    en: "/en/work",
    es: "/es/proyectos",
  },
  {
    surface: "case",
    pt: "/projetos/hospital-sirio-libanes",
    en: "/en/work/hospital-sirio-libanes",
    es: "/es/proyectos/hospital-sirio-libanes",
  },
  {
    surface: "experience",
    pt: "/experiencia",
    en: "/en/experience",
    es: "/es/experiencia",
  },
  {
    surface: "about",
    pt: "/sobre",
    en: "/en/about",
    es: "/es/sobre",
  },
  {
    surface: "insights",
    pt: "/insights",
    en: "/en/insights",
    es: "/es/insights",
  },
  {
    surface: "article",
    pt: "/insights/go-em-producao",
    en: "/en/insights/go-in-production",
    es: "/es/insights/go-en-produccion",
  },
  {
    surface: "contact",
    pt: "/contato",
    en: "/en/contact",
    es: "/es/contacto",
  },
] as const

const primaryEnglishRoutes = routeMatrix.map(({ en }) => en)

function captureRuntimeErrors(page: Page) {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`))
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`)
    }
  })
  return errors
}

test("serves every localized portfolio route and case", async ({ request }) => {
  const routes = routeMatrix.flatMap(({ pt, en, es }) => [
    { locale: "pt", pathname: pt },
    { locale: "en", pathname: en },
    { locale: "es", pathname: es },
  ])
  const remainingCases = [
    { locale: "pt", pathname: "/projetos/band-news-bandsports" },
    { locale: "pt", pathname: "/projetos/fiesta-americana" },
    { locale: "en", pathname: "/en/work/band-news-bandsports" },
    { locale: "en", pathname: "/en/work/fiesta-americana" },
    { locale: "es", pathname: "/es/proyectos/band-news-bandsports" },
    { locale: "es", pathname: "/es/proyectos/fiesta-americana" },
  ]

  for (const { locale, pathname } of [...routes, ...remainingCases]) {
    const response = await request.get(pathname, {
      headers: { cookie: `NEXT_LOCALE=${locale}` },
      maxRedirects: 0,
    })
    expect(response.status(), pathname).toBe(200)
    expect(response.headers()["content-type"], pathname).toContain("text/html")
    expect(new URL(response.url()).pathname, pathname).toBe(pathname)
  }
})

test("renders one descriptive document title and H1 on every primary surface", async ({
  page,
}) => {
  for (const pathname of primaryEnglishRoutes) {
    await page.goto(pathname, { waitUntil: "domcontentloaded" })

    await expect(page.locator("html")).toHaveAttribute("lang", "en-US")
    await expect(page.locator("main#main-content")).toHaveCount(1)
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
    await expect(page).toHaveTitle(/\S+ \| Roberto Moraes|Roberto Moraes/)
  }
})

test("keeps the hero identity exact and the home deliberately concise", async ({
  page,
}) => {
  await page.goto("/en", { waitUntil: "domcontentloaded" })

  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    "Roberto Moraes",
  )
  await expect(
    page.getByText("Software Engineer & IT Manager", { exact: true }),
  ).toBeVisible()
  await expect(page.locator("[data-home-section]")).toHaveCount(5)
  await expect(page.locator("[data-project-card]")).toHaveCount(3)
  await expect(page.locator("[data-experience-list]")).toHaveCount(0)
  await expect(page.locator("[data-website-showcase]")).toHaveCount(0)
  await expect(page.locator("form")).toHaveCount(0)

  await expect(
    page.getByRole("link", { name: "Explore work" }).first(),
  ).toHaveAttribute("href", "/en/work")
  await expect(
    page.getByRole("link", { name: "View experience" }).first(),
  ).toHaveAttribute("href", "/en/experience")

  const visibleCopy = await page.locator("body").innerText()
  expect(visibleCopy).not.toMatch(
    /available for|open to work|consulting|opportunit(?:y|ies)|estimated budget/i,
  )
})

test("presents production cases before the independent web lab", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/en/work", { waitUntil: "domcontentloaded" })

  const cases = page.locator("[data-work-cases] [data-project-card]")
  const websiteCards = page.locator("[data-website-card]")
  const websiteLinks = page.locator("[data-website-link]")
  await expect(cases).toHaveCount(3)
  await expect(websiteCards).toHaveCount(7)
  await expect(websiteLinks).toHaveCount(7)
  await expect(cases.nth(0)).toContainText("Hospital Sírio-Libanês")
  await expect(cases.nth(1)).toContainText("Grupo Bandeirantes")
  await expect(cases.nth(2)).toContainText("Fiesta Americana")

  for (let index = 0; index < 7; index += 1) {
    const link = websiteLinks.nth(index)
    await expect(link).toHaveAttribute("target", "_blank")
    await expect(link).toHaveAttribute(
      "rel",
      "noopener noreferrer external",
    )
    await expect(link).toHaveAccessibleName(/opens in a new tab/i)
  }

  const firstCase = cases.first()
  const firstCaseLink = firstCase.locator("[data-project-link]")
  await firstCaseLink.focus()
  await expect(firstCase).toHaveCSS("border-color", "rgb(0, 255, 136)")
  await expect(firstCase).toHaveCSS(
    "box-shadow",
    /rgb\(0, 255, 136\) 0px 0px 0px 2px inset/,
  )

  const firstImage = page.locator("[data-website-thumbnail] img").first()
  await firstImage.scrollIntoViewIfNeeded()
  await expect
    .poll(() =>
      firstImage.evaluate(
        (image) =>
          image instanceof HTMLImageElement &&
          image.complete &&
          image.naturalWidth > 0,
      ),
    )
    .toBe(true)
  await expectNoContentClipping(page, "Work page on mobile")
})

test("publishes complete, shareable case studies with contextual evidence", async ({
  page,
}) => {
  await page.goto("/en/work/hospital-sirio-libanes", {
    waitUntil: "domcontentloaded",
  })

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Hospital Sírio-Libanês",
  )
  await expect(page.getByRole("heading", { name: "Challenge" })).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Architecture & solution" }),
  ).toBeVisible()
  await expect(page.getByRole("heading", { name: "My contribution" })).toBeVisible()
  await expect(page.locator("#metrics")).toContainText("20M")
  await expect(page.locator("#metrics")).toContainText("6ms")
  await expect(page.locator("#metrics")).toContainText("92%")
  await expect(page.getByText("Go", { exact: true }).last()).toBeVisible()
  await expect(page.getByText("Cloud Run", { exact: true }).last()).toBeVisible()

  const structuredData = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents()
  expect(structuredData.join(" ")).toContain("CreativeWork")
  expect(structuredData.join(" ")).toContain("BreadcrumbList")

  await page.goto("/en/work/band-news-bandsports")
  const products = page.locator("[data-managed-product-link]")
  await expect(products).toHaveCount(9)
  for (let index = 0; index < 9; index += 1) {
    await expect(products.nth(index)).toHaveAttribute("target", "_blank")
    await expect(products.nth(index)).toHaveAttribute(
      "rel",
      "noopener noreferrer external",
    )
  }
})

test("preserves the complete professional chronology and company progression", async ({
  page,
}) => {
  await page.goto("/en/experience", { waitUntil: "domcontentloaded" })

  const entries = page.locator("[data-experience-list] > li")
  await expect(entries).toHaveCount(5)
  await expect(page.locator("[data-company-progression]")).toHaveText(
    "Progression within the company · 3 roles",
  )

  const expectedRoles = [
    "Software Engineer & IT Manager",
    "IT Project Manager",
    "Full-Stack Web / Mobile Developer",
    "Full-Stack Web Developer",
    "Full-Stack Web Developer",
  ]
  expect(
    await page.locator("[data-experience-entry] h3").allTextContents(),
  ).toEqual(expectedRoles)

  const expectedCompanies = [
    "Valiant Group do Brasil",
    "Valiant Group do Brasil",
    "Valiant Group do Brasil",
    "Weber Technologies",
    "Buser Brasil",
  ]
  expect(
    await page.locator("[data-experience-company]").allTextContents(),
  ).toEqual(expectedCompanies)

  await page.setViewportSize({ width: 768, height: 1024 })
  await expect(page.locator("[data-experience-timeline]")).toBeHidden()
  expect(
    (await page.locator("[data-experience-card]").first().boundingBox())?.width,
  ).toBeGreaterThan(480)

  await page.setViewportSize({ width: 1024, height: 768 })
  await expect(page.locator("[data-experience-timeline]")).toBeVisible()
})

test("separates profile, principles, and technical capabilities", async ({
  page,
}) => {
  await page.goto("/en/about", { waitUntil: "domcontentloaded" })

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Technical depth to build",
  )
  await expect(
    page.getByRole("heading", {
      name: "Criteria that remain when the technology changes.",
    }),
  ).toBeVisible()
  await expect(page.getByText("Production is part of the design")).toBeVisible()
  await expect(page.getByText("Leadership close to engineering")).toBeVisible()
  await expect(page.locator("#stack")).toBeVisible()
  await expect(page.locator(".tech-tag")).toHaveCount(22)
  await expect(page.locator("#stack")).not.toContainText("★")

  await expect(
    page.getByRole("checkbox", { name: "Pause motion" }),
  ).toHaveCount(1)
  const motionControl = page.locator("#technology-logo-motion")
  await page.getByText("Pause motion", { exact: true }).click()
  await expect(motionControl).toBeChecked()
  await expect(page.locator(".logoloop__track")).toHaveCSS(
    "animation-play-state",
    "paused",
  )
  await page.getByText("Resume motion", { exact: true }).click()
  await expect(motionControl).not.toBeChecked()
  await page.mouse.move(0, 0)
  await expect(page.locator(".logoloop__track")).toHaveCSS(
    "animation-play-state",
    "running",
  )
})

test("publishes a localized editorial index and progressive article", async ({
  browser,
  page,
}, testInfo) => {
  await page.goto("/en/insights", { waitUntil: "domcontentloaded" })
  const articleLink = page.getByRole("link", { name: /Read full article/i })
  await expect(articleLink).toHaveAttribute(
    "href",
    "/en/insights/go-in-production",
  )
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toHaveAttribute("data-navigation-ready", "true")
  await articleLink.click()

  await expect(page).toHaveURL(/\/en\/insights\/go-in-production$/)
  await expect(page.locator("[data-article-scene]")).toHaveCount(8)
  await expect(page.locator("[data-article-cta]")).toContainText(
    "Architecture becomes clearer",
  )
  await expect(
    page.locator("[data-article-cta]").getByRole("link", {
      name: "Explore work",
    }),
  ).toHaveAttribute("href", "/en/work")

  const noScriptPage = await browser.newPage({
    baseURL: testInfo.project.use.baseURL,
    javaScriptEnabled: false,
  })
  try {
    await noScriptPage.goto("/en/insights/go-in-production", {
      waitUntil: "domcontentloaded",
    })
    await expect(noScriptPage.locator("[data-article-scene]")).toHaveCount(8)
    await expect(noScriptPage.locator("[data-article-progress]")).toBeHidden()
    await expect(noScriptPage.locator("[data-hero-sticky]")).toHaveCSS(
      "position",
      "relative",
    )
  } finally {
    await noScriptPage.close()
  }
})

test("switches locale semantically on indexes and dynamic cases", async ({
  page,
}) => {
  await page.goto(
    "/en/work/hospital-sirio-libanes?source=e2e#metrics",
    { waitUntil: "domcontentloaded" },
  )

  const portuguese = page.getByRole("link", {
    name: "PT — Switch language to Portuguese",
  })
  const spanish = page.getByRole("link", {
    name: "ES — Switch language to Spanish",
  })
  await expect(portuguese).toHaveAttribute(
    "href",
    "/pt/projetos/hospital-sirio-libanes?source=e2e#metrics",
  )
  await expect(spanish).toHaveAttribute(
    "href",
    "/es/proyectos/hospital-sirio-libanes?source=e2e#metrics",
  )

  await spanish.click()
  await expect(page).toHaveURL((url) => {
    return (
      url.pathname === "/es/proyectos/hospital-sirio-libanes" &&
      url.searchParams.get("source") === "e2e" &&
      url.hash === "#metrics"
    )
  })
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX")
})

test("keeps the professional contact contract neutral and keyboard-first", async ({
  page,
}) => {
  await page.goto("/en/contact", { waitUntil: "domcontentloaded" })

  const form = page.locator("form")
  await expect(form).toHaveAttribute("toolname", "prepare_portfolio_contact")
  await expect(form).toHaveAttribute(
    "tooldescription",
    /professional contact form.*manual confirmation/i,
  )

  const visibleFields = form.locator("input:not([type='hidden']), textarea")
  await expect(visibleFields).toHaveCount(5)
  await expect(page.getByLabel("Name")).toBeVisible()
  await expect(page.getByLabel("Email")).toBeVisible()
  await expect(page.getByLabel("Company (optional)")).toBeVisible()
  await expect(page.getByLabel("Subject")).toBeVisible()
  await expect(page.getByLabel("Message")).toBeVisible()
  await expect(form.locator("select")).toHaveCount(0)
  await expect(page.locator("body")).not.toContainText(
    /budget|consulting|opportunit(?:y|ies)|available for/i,
  )

  await page.getByRole("button", { name: "Send message" }).click()
  await expect(page.getByText("Enter your name.")).toBeVisible()
  await expect(page.getByText("Enter a valid email address.")).toBeVisible()
  await expect(page.getByText("Enter a subject.")).toBeVisible()
  await expect(
    page.getByText("Write a message with a little more context."),
  ).toBeVisible()
  await expect(page.getByLabel("Name")).toBeFocused()

  const annotatedFields = await form
    .locator("[toolparamdescription]")
    .evaluateAll((fields) => fields.map((field) => field.id))
  expect(annotatedFields).toEqual([
    "contact-name",
    "contact-email",
    "contact-company",
    "contact-subject",
    "contact-message",
  ])
})

test("enforces security headers and route-aware discoverability", async ({
  page,
  request,
}) => {
  const response = await request.get("/en/work")
  expect(response.headers()["x-content-type-options"]).toBe("nosniff")
  expect(response.headers()["x-frame-options"]).toBe("DENY")
  expect(response.headers()["cross-origin-resource-policy"]).toBe(
    "same-origin",
  )
  expect(response.headers()["content-security-policy"]).toContain(
    "script-src-attr 'none'",
  )

  await page.goto("/en/work", { waitUntil: "domcontentloaded" })
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://robertomoraes.dev/en/work",
  )
  await expect(page.locator('link[hreflang="pt-BR"]')).toHaveAttribute(
    "href",
    "https://robertomoraes.dev/projetos",
  )
  await expect(page.locator('link[hreflang="es-MX"]')).toHaveAttribute(
    "href",
    "https://robertomoraes.dev/es/proyectos",
  )
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    "https://robertomoraes.dev/en/work",
  )

  await page.goto("/en")
  const structuredData = (
    await page.locator('script[type="application/ld+json"]').allTextContents()
  ).join(" ")
  expect(structuredData).toContain('"@type":"Person"')
  expect(structuredData).toContain('"@type":"WebSite"')
  expect(structuredData).not.toMatch(/ProfessionalService|Consulting/)
})

test("publishes complete robots, sitemap, and permanent article migrations", async ({
  request,
}) => {
  const robots = await request.get("/robots.txt")
  expect(robots.status()).toBe(200)
  expect(await robots.text()).toContain(
    "Sitemap: https://robertomoraes.dev/sitemap.xml",
  )

  const sitemap = await request.get("/sitemap.xml")
  const sitemapXml = await sitemap.text()
  expect(sitemap.status()).toBe(200)
  expect((sitemapXml.match(/<url>/g) ?? [])).toHaveLength(30)
  expect(sitemapXml).toContain(
    "https://robertomoraes.dev/projetos/hospital-sirio-libanes",
  )
  expect(sitemapXml).toContain(
    "https://robertomoraes.dev/en/insights/go-in-production",
  )
  expect(sitemapXml).toContain(
    "https://robertomoraes.dev/es/insights/go-en-produccion",
  )

  const oldEnglishArticle = await request.get(
    "/en/insights/go-em-producao",
    { maxRedirects: 0 },
  )
  expect(oldEnglishArticle.status()).toBe(308)
  expect(oldEnglishArticle.headers().location).toBe(
    "/en/insights/go-in-production",
  )

  const oldSpanishArticle = await request.get(
    "/es/insights/go-em-producao",
    { maxRedirects: 0 },
  )
  expect(oldSpanishArticle.status()).toBe(308)
  expect(oldSpanishArticle.headers().location).toBe(
    "/es/insights/go-en-produccion",
  )
})

test("serves localized, non-indexable not-found pages", async ({ page }) => {
  const response = await page.goto("/en/route-that-does-not-exist")

  expect(response?.status()).toBe(404)
  await expect(page.locator("html")).toHaveAttribute("lang", "en-US")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("404")
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/i,
  )
  await expect(
    page.getByRole("link", { name: "Back to portfolio" }),
  ).toHaveAttribute("href", "/en")
})

test("rejects untrusted contact origins with the neutral schema", async ({
  request,
}) => {
  const response = await request.post("/api/contact", {
    headers: {
      "content-type": "application/json",
      origin: "https://attacker.example",
    },
    data: {
      name: "Test User",
      email: "test@example.com",
      company: "Example",
      subject: "Engineering conversation",
      message: "This is a valid test message with enough context.",
      botCheck: "",
    },
  })

  expect(response.status()).toBe(403)
})

test("passes automated WCAG audits on every primary surface", async ({
  page,
}) => {
  test.setTimeout(120_000)
  await page.emulateMedia({ reducedMotion: "reduce" })

  const expectAxeClean = async (context: string) => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze()

    expect(
      results.violations,
      `${context}: ${results.violations
        .map(({ id, nodes }) => `${id} (${nodes.length})`)
        .join(", ")}`,
    ).toEqual([])
  }

  for (const pathname of primaryEnglishRoutes) {
    await page.goto(pathname, { waitUntil: "domcontentloaded" })
    await expectAxeClean(pathname)
  }

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/en", { waitUntil: "domcontentloaded" })
  await page.getByRole("button", { name: "Open menu" }).click()
  await expectAxeClean("Open mobile navigation")

  await page.goto("/en/contact", { waitUntil: "domcontentloaded" })
  await page.getByRole("button", { name: "Send message" }).click()
  await expect(page.getByText("Enter your name.")).toBeVisible()
  await expectAxeClean("Contact validation errors")

  await page.goto("/en/route-that-does-not-exist", {
    waitUntil: "domcontentloaded",
  })
  await expectAxeClean("Global not-found")
})

test("remains overflow-free across the responsive validation matrix", async ({
  page,
}) => {
  test.setTimeout(120_000)
  await page.emulateMedia({ reducedMotion: "reduce" })

  const matrix = [
    { width: 320, height: 568, pathname: "/en" },
    { width: 390, height: 844, pathname: "/en/work" },
    {
      width: 844,
      height: 390,
      pathname: "/en/work/hospital-sirio-libanes",
    },
    { width: 768, height: 1024, pathname: "/en/experience" },
    { width: 1024, height: 768, pathname: "/en/about" },
    { width: 1280, height: 800, pathname: "/en/insights" },
    {
      width: 1440,
      height: 900,
      pathname: "/en/insights/go-in-production",
    },
    {
      width: 320,
      height: 568,
      pathname: "/insights/go-em-producao",
    },
    {
      width: 414,
      height: 896,
      pathname: "/es/insights/go-en-produccion",
    },
    {
      width: 1024,
      height: 768,
      pathname: "/en/insights/go-in-production",
    },
    { width: 1920, height: 1080, pathname: "/en/contact" },
  ]

  for (const viewport of matrix) {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    })
    await page.goto(viewport.pathname, { waitUntil: "domcontentloaded" })
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expectNoContentClipping(
      page,
      `${viewport.pathname} at ${viewport.width}×${viewport.height}`,
    )

    const menuButton = page.locator("[data-navigation-menu-button]")
    if (viewport.width < 1024) {
      await expect(menuButton).toBeVisible()
      const box = await menuButton.boundingBox()
      expect(box?.width).toBeGreaterThanOrEqual(44)
      expect(box?.height).toBeGreaterThanOrEqual(44)
    } else {
      await expect(menuButton).toBeHidden()
    }
  }
})

test("loads primary routes without uncaught errors in reduced motion", async ({
  page,
}) => {
  test.setTimeout(90_000)
  const errors = captureRuntimeErrors(page)
  await page.emulateMedia({ reducedMotion: "reduce" })

  for (const pathname of primaryEnglishRoutes) {
    await page.goto(pathname, { waitUntil: "domcontentloaded" })
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  }

  expect(errors).toEqual([])
})
