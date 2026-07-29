import { expect, test } from "@playwright/test"

import { expectNoContentClipping } from "./helpers/layout"
import { bridgeUpgradedLoopbackRequests } from "./helpers/network"

test.beforeEach(async ({ page }, testInfo) => {
  await bridgeUpgradedLoopbackRequests(page, testInfo.project.use.baseURL)
  await page.emulateMedia({ reducedMotion: "reduce" })
})

test("keeps every core journey usable with real touch and mobile semantics", async ({
  page,
}) => {
  const routes = [
    "/en",
    "/en/work",
    "/en/work/hospital-sirio-libanes",
    "/en/experience",
    "/en/about",
    "/en/contact",
  ]

  expect(
    await page.evaluate(() => matchMedia("(pointer: coarse)").matches),
  ).toBe(true)

  for (const pathname of routes) {
    await page.goto(pathname, { waitUntil: "domcontentloaded" })
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible()
    await expectNoContentClipping(page, `Touch viewport on ${pathname}`)
  }
})

test("keeps navigation operable in a short landscape viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 844, height: 390 })
  await page.goto("/en/work/hospital-sirio-libanes", {
    waitUntil: "domcontentloaded",
  })

  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toHaveAttribute("data-navigation-ready", "true")
  await page.getByRole("button", { name: "Open menu" }).tap()
  const dialog = page.getByRole("dialog", { name: "Navigation menu" })
  await expect(dialog).toBeVisible()
  const navigationLabel = dialog.getByText("Navigation", { exact: true })
  const menuHeader = dialog.locator("[data-navigation-menu-header]")
  await expect(navigationLabel).toBeVisible()
  await expect(menuHeader).toBeVisible()

  const [labelBox, headerBox] = await Promise.all([
    navigationLabel.boundingBox(),
    menuHeader.boundingBox(),
  ])
  if (!labelBox || !headerBox) {
    throw new Error("Navigation menu geometry must be measurable")
  }
  expect(labelBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height)

  const experienceLink = dialog.getByRole("link", { name: "Experience" })
  await expect(experienceLink).toBeVisible()
  await experienceLink.tap()
  await expect(page).toHaveURL(/\/en\/experience\/?$/)
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  await expectNoContentClipping(page, "Short landscape experience")
})
