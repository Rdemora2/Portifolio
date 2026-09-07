# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: webgl-active.spec.ts >> runs the WebGL signature for a normal visitor and follows lifecycle changes
- Location: e2e/webgl-active.spec.ts:109:5

# Error details

```
Error: Timeout 7500ms exceeded while waiting on the predicate
```

# Test source

```ts
  48  |       consoleMessages.push(message.text().slice(0, 500))
  49  |     }
  50  |   })
  51  |   page.on("requestfailed", (request) => {
  52  |     failedRequests.push(
  53  |       `${request.method()} ${new URL(request.url()).pathname}: ${request.failure()?.errorText ?? "unknown"}`,
  54  |     )
  55  |   })
  56  |   return { consoleMessages, failedRequests }
  57  | }
  58  | 
  59  | async function expectActiveCanvas(
  60  |   page: Page,
  61  |   canvas: Locator,
  62  |   runtime: ReturnType<typeof captureRuntimeSignals>,
  63  |   testInfo: TestInfo,
  64  | ) {
  65  |   try {
  66  |     await expect(canvas).toBeVisible()
  67  |   } catch (error) {
  68  |     const capabilities = await page.evaluate(() => {
  69  |       const connection = (
  70  |         navigator as Navigator & {
  71  |           connection?: { saveData?: boolean }
  72  |           deviceMemory?: number
  73  |         }
  74  |       ).connection
  75  |       const probe = document.createElement("canvas")
  76  |       const probeContext =
  77  |         probe.getContext("webgl2") ??
  78  |         probe.getContext("webgl") ??
  79  |         probe.getContext("experimental-webgl")
  80  | 
  81  |       return {
  82  |         canvasCount: document.querySelectorAll("[data-home-hero] canvas").length,
  83  |         deviceMemory: (navigator as Navigator & { deviceMemory?: number })
  84  |           .deviceMemory,
  85  |         hardwareConcurrency: navigator.hardwareConcurrency,
  86  |         pointerFine: matchMedia("(pointer: fine)").matches,
  87  |         probeContext: probeContext
  88  |           ? probeContext instanceof WebGL2RenderingContext
  89  |             ? "webgl2"
  90  |             : "webgl"
  91  |           : null,
  92  |         reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
  93  |         saveData: connection?.saveData ?? null,
  94  |         userAgent: navigator.userAgent,
  95  |         visibilityState: document.visibilityState,
  96  |         webdriver: navigator.webdriver,
  97  |       }
  98  |     })
  99  |     await testInfo.attach("webgl-capabilities", {
  100 |       body: Buffer.from(
  101 |         JSON.stringify({ ...capabilities, ...runtime }, null, 2),
  102 |       ),
  103 |       contentType: "application/json",
  104 |     })
  105 |     throw error
  106 |   }
  107 | }
  108 | 
  109 | test("runs the WebGL signature for a normal visitor and follows lifecycle changes", async ({
  110 |   page,
  111 | }, testInfo) => {
  112 |   const runtime = captureRuntimeSignals(page)
  113 |   await page.setViewportSize({ width: 1280, height: 800 })
  114 |   await page.emulateMedia({ reducedMotion: "no-preference" })
  115 |   await page.goto("/en", { waitUntil: "domcontentloaded" })
  116 | 
  117 |   expect(await page.evaluate(() => navigator.webdriver)).toBe(false)
  118 |   expect(await page.evaluate(() => navigator.userAgent)).toBe(visitorUserAgent)
  119 | 
  120 |   const canvas = page.locator("[data-home-hero] canvas")
  121 |   await expectActiveCanvas(page, canvas, runtime, testInfo)
  122 |   const context = await canvas.evaluate((element) => {
  123 |     const target = element as HTMLCanvasElement
  124 |     const gl =
  125 |       target.getContext("webgl2") ??
  126 |       target.getContext("webgl") ??
  127 |       target.getContext("experimental-webgl")
  128 |     if (!(gl instanceof WebGLRenderingContext || gl instanceof WebGL2RenderingContext)) {
  129 |       return null
  130 |     }
  131 |     return {
  132 |       height: gl.drawingBufferHeight,
  133 |       width: gl.drawingBufferWidth,
  134 |     }
  135 |   })
  136 |   expect(context).not.toBeNull()
  137 |   expect(context?.width).toBeGreaterThan(0)
  138 |   expect(context?.height).toBeGreaterThan(0)
  139 | 
  140 |   const initialWidth = await canvas.evaluate(
  141 |     (element) => (element as HTMLCanvasElement).width,
  142 |   )
  143 |   await page.setViewportSize({ width: 960, height: 720 })
  144 |   await expect
  145 |     .poll(() =>
  146 |       canvas.evaluate((element) => (element as HTMLCanvasElement).width),
  147 |     )
> 148 |     .not.toBe(initialWidth)
      |          ^ Error: Timeout 7500ms exceeded while waiting on the predicate
  149 | 
  150 |   await page.evaluate(() => {
  151 |     let simulatedHidden = false
  152 |     Object.defineProperty(document, "hidden", {
  153 |       configurable: true,
  154 |       get: () => simulatedHidden,
  155 |     })
  156 |     Object.defineProperty(document, "visibilityState", {
  157 |       configurable: true,
  158 |       get: () => (simulatedHidden ? "hidden" : "visible"),
  159 |     })
  160 |     ;(
  161 |       window as typeof window & { setTestDocumentHidden?: (hidden: boolean) => void }
  162 |     ).setTestDocumentHidden = (hidden) => {
  163 |       simulatedHidden = hidden
  164 |       document.dispatchEvent(new Event("visibilitychange"))
  165 |     }
  166 |   })
  167 | 
  168 |   await page.evaluate(() => {
  169 |     ;(
  170 |       window as typeof window & { setTestDocumentHidden?: (hidden: boolean) => void }
  171 |     ).setTestDocumentHidden?.(true)
  172 |   })
  173 |   await expect(canvas).toHaveCount(0)
  174 | 
  175 |   await page.evaluate(() => {
  176 |     ;(
  177 |       window as typeof window & { setTestDocumentHidden?: (hidden: boolean) => void }
  178 |     ).setTestDocumentHidden?.(false)
  179 |   })
  180 |   await expect(canvas).toBeVisible()
  181 |   await expect.poll(() => canvasPixelSignature(canvas)).not.toBeNull()
  182 | 
  183 |   await page.emulateMedia({ reducedMotion: "reduce" })
  184 |   await expect(canvas).toHaveCount(0)
  185 |   await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
  186 |     "Roberto Moraes",
  187 |   )
  188 | })
  189 | 
  190 | test("falls back cleanly after a real WebGL context loss", async ({ page }, testInfo) => {
  191 |   const pageErrors: string[] = []
  192 |   const runtime = captureRuntimeSignals(page)
  193 |   page.on("pageerror", (error) => pageErrors.push(error.message))
  194 |   await page.emulateMedia({ reducedMotion: "no-preference" })
  195 |   await page.goto("/en", { waitUntil: "domcontentloaded" })
  196 | 
  197 |   const canvas = page.locator("[data-home-hero] canvas")
  198 |   await expectActiveCanvas(page, canvas, runtime, testInfo)
  199 |   const canLoseContext = await canvas.evaluate((element) => {
  200 |     const target = element as HTMLCanvasElement
  201 |     const gl = target.getContext("webgl2") ?? target.getContext("webgl")
  202 |     return Boolean(gl?.getExtension("WEBGL_lose_context"))
  203 |   })
  204 |   test.skip(!canLoseContext, "The browser does not expose WEBGL_lose_context")
  205 | 
  206 |   await canvas.evaluate((element) => {
  207 |     const target = element as HTMLCanvasElement
  208 |     const gl = target.getContext("webgl2") ?? target.getContext("webgl")
  209 |     gl?.getExtension("WEBGL_lose_context")?.loseContext()
  210 |   })
  211 |   await expect(canvas).toBeHidden()
  212 |   await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
  213 |     "Roberto Moraes",
  214 |   )
  215 |   expect(pageErrors).toEqual([])
  216 | })
  217 | 
```