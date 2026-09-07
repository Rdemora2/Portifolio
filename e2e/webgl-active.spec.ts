import {
  expect,
  type Locator,
  type Page,
  test,
  type TestInfo,
} from "@playwright/test"

const visitorUserAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"

test.use({
  launchOptions: {
    args: ["--disable-blink-features=AutomationControlled"],
  },
  userAgent: visitorUserAgent,
})

// Context loss and synchronous pixel reads can stall the shared headless GPU
// process. Keep lifecycle mutations isolated from the active-context checks.
test.describe.configure({ mode: "serial" })

function captureRuntimeSignals(page: Page) {
  const consoleMessages: string[] = []
  const failedRequests: string[] = []
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      consoleMessages.push(message.text().slice(0, 500))
    }
  })
  page.on("requestfailed", (request) => {
    failedRequests.push(
      `${request.method()} ${new URL(request.url()).pathname}: ${request.failure()?.errorText ?? "unknown"}`,
    )
  })
  return { consoleMessages, failedRequests }
}

async function expectActiveCanvas(
  page: Page,
  canvas: Locator,
  runtime: ReturnType<typeof captureRuntimeSignals>,
  testInfo: TestInfo,
) {
  try {
    await expect(canvas).toBeVisible()
  } catch (error) {
    const capabilities = await page.evaluate(() => {
      const connection = (
        navigator as Navigator & {
          connection?: { saveData?: boolean }
          deviceMemory?: number
        }
      ).connection
      const probe = document.createElement("canvas")
      const probeContext =
        probe.getContext("webgl2") ??
        probe.getContext("webgl") ??
        probe.getContext("experimental-webgl")

      return {
        canvasCount: document.querySelectorAll("[data-home-hero] canvas").length,
        deviceMemory: (navigator as Navigator & { deviceMemory?: number })
          .deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
        pointerFine: matchMedia("(pointer: fine)").matches,
        probeContext: probeContext
          ? probeContext instanceof WebGL2RenderingContext
            ? "webgl2"
            : "webgl"
          : null,
        reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
        saveData: connection?.saveData ?? null,
        userAgent: navigator.userAgent,
        visibilityState: document.visibilityState,
        webdriver: navigator.webdriver,
      }
    })
    await testInfo.attach("webgl-capabilities", {
      body: Buffer.from(
        JSON.stringify({ ...capabilities, ...runtime }, null, 2),
      ),
      contentType: "application/json",
    })
    throw error
  }
}

test("runs the WebGL signature for a normal visitor and follows lifecycle changes", async ({
  page,
}, testInfo) => {
  const runtime = captureRuntimeSignals(page)
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/en", { waitUntil: "domcontentloaded" })

  expect(await page.evaluate(() => navigator.webdriver)).toBe(false)
  expect(await page.evaluate(() => navigator.userAgent)).toBe(visitorUserAgent)

  const canvas = page.locator("[data-home-hero] canvas")
  await expectActiveCanvas(page, canvas, runtime, testInfo)
  const context = await canvas.evaluate((element) => {
    const target = element as HTMLCanvasElement
    const gl =
      target.getContext("webgl2") ??
      target.getContext("webgl") ??
      target.getContext("experimental-webgl")
    if (!(gl instanceof WebGLRenderingContext || gl instanceof WebGL2RenderingContext)) {
      return null
    }
    return {
      height: gl.drawingBufferHeight,
      width: gl.drawingBufferWidth,
    }
  })
  expect(context).not.toBeNull()
  expect(context?.width).toBeGreaterThan(0)
  expect(context?.height).toBeGreaterThan(0)

  const initialWidth = await canvas.evaluate(
    (element) => (element as HTMLCanvasElement).width,
  )
  await page.setViewportSize({ width: 960, height: 720 })
  await expect
    .poll(() =>
      canvas.evaluate((element) => (element as HTMLCanvasElement).width),
    )
    .not.toBe(initialWidth)

  await page.evaluate(() => {
    let simulatedHidden = false
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => simulatedHidden,
    })
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => (simulatedHidden ? "hidden" : "visible"),
    })
    ;(
      window as typeof window & { setTestDocumentHidden?: (hidden: boolean) => void }
    ).setTestDocumentHidden = (hidden) => {
      simulatedHidden = hidden
      document.dispatchEvent(new Event("visibilitychange"))
    }
  })

  await page.evaluate(() => {
    ;(
      window as typeof window & { setTestDocumentHidden?: (hidden: boolean) => void }
    ).setTestDocumentHidden?.(true)
  })
  await expect(canvas).toHaveCount(0)

  await page.evaluate(() => {
    ;(
      window as typeof window & { setTestDocumentHidden?: (hidden: boolean) => void }
    ).setTestDocumentHidden?.(false)
  })
  await expect(canvas).toBeVisible()
  const restoredContext = await canvas.evaluate((element) => {
    const target = element as HTMLCanvasElement
    return Boolean(target.getContext("webgl2") ?? target.getContext("webgl"))
  })
  expect(restoredContext).toBe(true)

  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect(canvas).toHaveCount(0)
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    "Roberto Moraes",
  )
})

test("falls back cleanly after a real WebGL context loss", async ({ page }, testInfo) => {
  const pageErrors: string[] = []
  const runtime = captureRuntimeSignals(page)
  page.on("pageerror", (error) => pageErrors.push(error.message))
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/en", { waitUntil: "domcontentloaded" })

  const canvas = page.locator("[data-home-hero] canvas")
  await expectActiveCanvas(page, canvas, runtime, testInfo)
  const canLoseContext = await canvas.evaluate((element) => {
    const target = element as HTMLCanvasElement
    const gl = target.getContext("webgl2") ?? target.getContext("webgl")
    return Boolean(gl?.getExtension("WEBGL_lose_context"))
  })
  test.skip(!canLoseContext, "The browser does not expose WEBGL_lose_context")

  await canvas.evaluate((element) => {
    const target = element as HTMLCanvasElement
    const gl = target.getContext("webgl2") ?? target.getContext("webgl")
    gl?.getExtension("WEBGL_lose_context")?.loseContext()
  })
  await expect(canvas).toBeHidden()
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    "Roberto Moraes",
  )
  expect(pageErrors).toEqual([])
})
