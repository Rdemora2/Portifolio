import { expect, test } from "@playwright/test"

test("keeps the project drawer usable when WebGL is unavailable", async ({
  page,
}) => {
  const pageErrors: string[] = []
  page.on("pageerror", (error) => pageErrors.push(error.message))

  await page.goto("/en/#projects")

  const hasWebGl = await page.evaluate(() => {
    const canvas = document.createElement("canvas")
    return Boolean(
      canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl"),
    )
  })
  expect(hasWebGl).toBe(false)

  const opener = page.getByRole("button", {
    name: /Grupo Bandeirantes.*View details/,
  })
  await opener.click()

  const dialog = page.getByRole("dialog", { name: "Grupo Bandeirantes" })
  const closeButton = dialog.getByRole("button", { name: "Close details" })
  await expect(dialog).toBeVisible()
  await expect(closeButton).toBeFocused()

  await closeButton.click()
  await expect(dialog).toBeHidden()
  await expect(opener).toBeFocused()
  expect(pageErrors, "WebGL fallback must not emit uncaught page errors").toEqual(
    [],
  )
})
