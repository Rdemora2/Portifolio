import { expect, type Page, test } from "@playwright/test"

import { websiteExperiences } from "../src/data/showcase-sites"
import { expectNoContentClipping } from "./helpers/layout"
import { bridgeUpgradedLoopbackRequests } from "./helpers/network"

type RuntimeErrors = {
  console: string[]
  page: string[]
}

function captureRuntimeErrors(page: Page): RuntimeErrors {
  const errors: RuntimeErrors = { console: [], page: [] }

  page.on("console", (message) => {
    if (message.type() === "error") errors.console.push(message.text())
  })
  page.on("pageerror", (error) => errors.page.push(error.message))

  return errors
}

function expectNoRuntimeErrors(errors: RuntimeErrors, surface: string) {
  expect(errors.page, `${surface} must not raise uncaught page errors`).toEqual([])
  expect(errors.console, `${surface} must not emit console.error`).toEqual([])
}

test.beforeEach(async ({ page }, testInfo) => {
  await bridgeUpgradedLoopbackRequests(page, testInfo.project.use.baseURL)
  await page.emulateMedia({ reducedMotion: "reduce" })
})

test("renders the multipage portfolio without engine-specific regressions", async ({
  page,
}) => {
  const runtimeErrors = captureRuntimeErrors(page)

  await page.goto("/en", { waitUntil: "domcontentloaded" })
  await expect(page.locator("html")).toHaveAttribute("lang", "en-US")
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    "Roberto Moraes",
  )
  await expect(page.locator("[data-home-section]")).toHaveCount(5)
  await expect(page.locator("[data-project-card]")).toHaveCount(3)
  await expectNoContentClipping(page, "Home")

  await page.goto("/en/work", { waitUntil: "domcontentloaded" })
  await expect(page.locator("[data-work-cases] [data-project-card]")).toHaveCount(
    3,
  )
  await expect(page.locator("[data-website-card]")).toHaveCount(
    websiteExperiences.length,
  )
  await expectNoContentClipping(page, "Work")

  await page.goto("/en/experience", { waitUntil: "domcontentloaded" })
  await expect(page.locator("[data-experience-list] > li")).toHaveCount(5)
  await expectNoContentClipping(page, "Experience")

  expectNoRuntimeErrors(runtimeErrors, "Multipage portfolio")
})

test("keeps project details and article content progressive", async ({
  browser,
  page,
}, testInfo) => {
  const runtimeErrors = captureRuntimeErrors(page)

  await page.goto("/en/work/hospital-sirio-libanes", {
    waitUntil: "domcontentloaded",
  })
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Hospital Sírio-Libanês",
  )
  await expect(page.locator("#metrics")).toContainText("20M")
  await expectNoContentClipping(page, "Project detail")

  await page.goto("/en/insights/go-in-production", {
    waitUntil: "domcontentloaded",
  })
  await expect(page.locator("[data-article-experience]")).toHaveAttribute(
    "data-motion",
    /^(?:full|reduced)$/,
  )
  await expect(page.locator("[data-article-scene]")).toHaveCount(8)
  await expect(page.locator("[data-hero-copy]")).toHaveCSS("opacity", "1")
  await expectNoContentClipping(page, "Article")

  const noScriptPage = await browser.newPage({
    baseURL: testInfo.project.use.baseURL,
    javaScriptEnabled: false,
  })
  try {
    await bridgeUpgradedLoopbackRequests(
      noScriptPage,
      testInfo.project.use.baseURL,
    )
    await noScriptPage.goto("/en/insights/go-in-production", {
      waitUntil: "domcontentloaded",
    })
    await expect(noScriptPage.locator("[data-hero-sticky]")).toHaveCSS(
      "position",
      "relative",
    )
    await expect(noScriptPage.locator("[data-article-progress]")).toBeHidden()
    await expect(noScriptPage.locator("[data-article-scene]")).toHaveCount(8)
    await expectNoContentClipping(noScriptPage, "Article without JavaScript")
  } finally {
    await noScriptPage.close()
  }

  expectNoRuntimeErrors(runtimeErrors, "Project and article")
})

test("keeps mobile navigation and contact usable", async ({ page }) => {
  const runtimeErrors = captureRuntimeErrors(page)

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/en/contact", { waitUntil: "domcontentloaded" })
  await expect(page.getByLabel("Name")).toBeVisible()
  await expect(page.getByLabel("Subject")).toBeVisible()
  await expect(page.getByLabel("Message")).toBeVisible()
  await expectNoContentClipping(page, "Mobile contact")

  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toHaveAttribute("data-navigation-ready", "true")
  await page.getByRole("button", { name: "Open menu" }).click()
  const dialog = page.getByRole("dialog", { name: "Navigation menu" })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole("link", { name: "Work" })).toBeVisible()
  await dialog.getByRole("button", { name: "Close menu" }).click()
  await expect(dialog).toBeHidden()

  expectNoRuntimeErrors(runtimeErrors, "Mobile contact")
})
