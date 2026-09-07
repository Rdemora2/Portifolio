# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: webgl-active.spec.ts >> falls back cleanly after a real WebGL context loss
- Location: e2e/webgl-active.spec.ts:190:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-home-hero] canvas')
Expected: visible
Timeout: 7500ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 7500ms
  - waiting for locator('[data-home-hero] canvas')

```

```yaml
- link "Skip to content":
  - /url: "#main-content"
- navigation "Main navigation":
  - link "RM. — Roberto Moraes, home":
    - /url: /en
    - text: RM .
  - link "Work":
    - /url: /en/work
  - link "Experience":
    - /url: /en/experience
  - link "About":
    - /url: /en/about
  - link "Insights":
    - /url: /en/insights
  - group "Select language":
    - link "PT — Switch language to Portuguese":
      - /url: /pt
      - text: PT
    - link "EN — Switch language to English":
      - /url: /en
      - text: EN
    - link "ES — Switch language to Spanish":
      - /url: /es
      - text: ES
- main:
  - heading "Roberto Moraes" [level=1]
  - paragraph: Software Engineer
  - paragraph: Go · Next.js · Kotlin · AWS · GCP
  - link "Explore work":
    - /url: /en/work
  - link "View experience":
    - /url: /en/experience
  - paragraph: Profile
  - heading "Engineering at the core. Management as a multiplier." [level=2]
  - paragraph: My work starts with the technical problem and follows the product into operation. I design architectures, write and review code, shape cloud and observability, and—when the context calls for it—coordinate people, priorities, and risk to turn decisions into reliable software.
  - text: "01"
  - heading "End-to-end delivery" [level=3]
  - paragraph: Backend, web, mobile, integrations, and infrastructure followed through to production.
  - text: "02"
  - heading "Production & reliability" [level=3]
  - paragraph: Performance, observability, security, and operations treated as part of the product.
  - text: "03"
  - heading "Applied leadership" [level=3]
  - paragraph: Technical direction, quality standards, and team coordination grounded in engineering context.
  - paragraph: Selected work
  - heading "Production software. Context, decisions, and outcomes." [level=2]
  - paragraph: Cases showing how architecture, code, infrastructure, and coordination connect when performance, reliability, and continuity matter.
  - article:
    - 'link "Open case study: Hospital Sírio-Libanês"':
      - /url: /en/work/hospital-sirio-libanes
      - text: Case 01 Backend & Cloud Engineer · Technical Lead
      - heading "Hospital Sírio-Libanês" [level=3]
      - paragraph: End-to-end architecture and engineering for a digital hospitality platform. Its Go backend handles 20M+ requests per month at 6ms average latency.
      - term: Requests/month
      - definition: 20M
      - term: Average response
      - definition: 6ms
      - term: Cache hit rate
      - definition: 92%
  - article:
    - 'link "Open case study: Grupo Bandeirantes"':
      - /url: /en/work/band-news-bandsports
      - text: Case 02 Software Engineer & IT Manager
      - heading "Grupo Bandeirantes" [level=3]
      - paragraph: Led the full rebuild of 6+ Grupo Bandeirantes portals, modernizing a high-traffic media platform with zero downtime.
      - term: Portals migrated
      - definition: 6+
      - term: Downtime
      - definition: 0s
      - term: Partnership
      - definition: "1"
  - article:
    - 'link "Open case study: Fiesta Americana Resort"':
      - /url: /en/work/fiesta-americana
      - text: Case 03 International Project Manager
      - heading "Fiesta Americana Resort" [level=3]
      - paragraph: Led a cross-border hospitality project that unified Unicast streaming and coaxial broadcast in a single platform.
  - link "View all work":
    - /url: /en/work
  - paragraph: Practice
  - heading "From backend to operations, always centered on the product." [level=2]
  - paragraph: My experience combines implementation depth, systems architecture, and accountability for what happens after deployment.
  - heading "Backend & platforms" [level=3]
  - paragraph: High-throughput APIs, integrations, data, and services designed for real load.
  - heading "Web, mobile & media" [level=3]
  - paragraph: Next.js, Kotlin, and connected-device experiences, from interface to streaming.
  - heading "Cloud, reliability & operations" [level=3]
  - paragraph: AWS, GCP, observability, security, CI/CD, and operational response.
  - heading "Architecture, technical leadership & IT management" [level=3]
  - paragraph: Technical decisions, quality, priorities, and teams aligned with product context.
  - link "Explore capabilities":
    - /url: /en/about
  - paragraph: Career
  - heading "Continuous growth across development and leadership." [level=2]
  - paragraph: Since 2022, I have expanded from full-stack development into leading the technology function, adding architecture, cloud, operations, and leadership without losing proximity to the code.
  - link "View complete experience":
    - /url: /en/experience
  - list:
    - listitem:
      - text: 2022—2023
      - heading "Buser" [level=3]
      - paragraph: Evolving a digital product at scale.
    - listitem:
      - text: "2023"
      - heading "Weber Technologies" [level=3]
      - paragraph: End-to-end full-stack delivery.
    - listitem:
      - text: 2023—present
      - heading "Valiant Group" [level=3]
      - paragraph: Progression from developer to Software Engineer & IT Manager.
  - paragraph: Engineering thinking
  - heading "Production lessons, without unnecessary abstraction." [level=2]
  - paragraph: Architecture, performance, and technical leadership explained through real systems.
  - link "Read article":
    - /url: /en/insights/go-in-production
  - text: "{ }"
- contentinfo:
  - paragraph: RM.
  - paragraph: Software Engineer. Building software engineered for demanding production environments.
  - paragraph: Navigation
  - navigation "Footer navigation":
    - list:
      - listitem:
        - link "Work":
          - /url: /en/work
      - listitem:
        - link "Experience":
          - /url: /en/experience
      - listitem:
        - link "About":
          - /url: /en/about
      - listitem:
        - link "Insights":
          - /url: /en/insights
      - listitem:
        - link "Contact":
          - /url: /en/contact
      - listitem:
        - link "FAQ":
          - /url: /en/about#faq
  - paragraph: Contact
  - link "robertomoraeszar@gmail.com":
    - /url: mailto:robertomoraeszar@gmail.com
  - link "WhatsApp (opens in a new tab)":
    - /url: https://api.whatsapp.com/send?phone=5511973874345
  - link "LinkedIn (opens in a new tab)":
    - /url: https://www.linkedin.com/in/robertomoraes/
  - link "Privacy":
    - /url: /en/privacy
  - link "Back to top":
    - /url: "#top"
  - paragraph: © 2026 · Roberto Moraes
  - paragraph: Built with code, coffee, and ambition
- alert
```

# Test source

```ts
  1   | import {
  2   |   expect,
  3   |   type Locator,
  4   |   type Page,
  5   |   test,
  6   |   type TestInfo,
  7   | } from "@playwright/test"
  8   | 
  9   | const visitorUserAgent =
  10  |   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  11  |   "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
  12  | 
  13  | test.use({
  14  |   launchOptions: {
  15  |     args: ["--disable-blink-features=AutomationControlled"],
  16  |   },
  17  |   userAgent: visitorUserAgent,
  18  | })
  19  | 
  20  | async function canvasPixelSignature(canvas: Locator) {
  21  |   return canvas.evaluate((element) => {
  22  |     const target = element as HTMLCanvasElement
  23  |     const gl =
  24  |       target.getContext("webgl2") ??
  25  |       target.getContext("webgl") ??
  26  |       target.getContext("experimental-webgl")
  27  |     if (!(gl instanceof WebGLRenderingContext || gl instanceof WebGL2RenderingContext)) {
  28  |       return null
  29  |     }
  30  | 
  31  |     const width = Math.min(gl.drawingBufferWidth, 24)
  32  |     const height = Math.min(gl.drawingBufferHeight, 24)
  33  |     const pixels = new Uint8Array(width * height * 4)
  34  |     gl.finish()
  35  |     gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  36  |     return pixels.reduce(
  37  |       (signature, value, index) => (signature + value * (index + 1)) % 2_147_483_647,
  38  |       0,
  39  |     )
  40  |   })
  41  | }
  42  | 
  43  | function captureRuntimeSignals(page: Page) {
  44  |   const consoleMessages: string[] = []
  45  |   const failedRequests: string[] = []
  46  |   page.on("console", (message) => {
  47  |     if (["error", "warning"].includes(message.type())) {
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
> 66  |     await expect(canvas).toBeVisible()
      |                          ^ Error: expect(locator).toBeVisible() failed
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
  148 |     .not.toBe(initialWidth)
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
```