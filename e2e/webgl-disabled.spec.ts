import { expect, test } from "@playwright/test"

test("keeps the engineering journey usable when WebGL is unavailable", async ({
  page,
}) => {
  const pageErrors: string[] = []
  page.on("pageerror", (error) => pageErrors.push(error.message))

  await page.goto("/en", { waitUntil: "domcontentloaded" })

  const hasWebGl = await page.evaluate(() => {
    const canvas = document.createElement("canvas")
    return Boolean(
      canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl"),
    )
  })
  expect(hasWebGl).toBe(false)

  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    "Roberto Moraes",
  )
  await expect(
    page.getByText("Software Engineer & IT Manager", { exact: true }),
  ).toBeVisible()
  await expect(page.locator("[data-project-card]")).toHaveCount(3)

  await page
    .locator("[data-project-link='hospital-sirio-libanes']")
    .click()
  await expect(page).toHaveURL(/\/en\/work\/hospital-sirio-libanes$/)
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Hospital Sírio-Libanês",
  )
  expect(pageErrors, "WebGL fallback must not emit uncaught page errors").toEqual(
    [],
  )
})
