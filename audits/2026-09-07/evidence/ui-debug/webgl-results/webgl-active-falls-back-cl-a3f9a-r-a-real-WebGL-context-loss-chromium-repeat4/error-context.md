# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: webgl-active.spec.ts >> falls back cleanly after a real WebGL context loss
- Location: e2e/webgl-active.spec.ts:117:5

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
  24  | 
  25  |     const width = Math.min(gl.drawingBufferWidth, 24)
  26  |     const height = Math.min(gl.drawingBufferHeight, 24)
  27  |     const pixels = new Uint8Array(width * height * 4)
  28  |     gl.finish()
  29  |     gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  30  |     return pixels.reduce(
  31  |       (signature, value, index) => (signature + value * (index + 1)) % 2_147_483_647,
  32  |       0,
  33  |     )
  34  |   })
  35  | }
  36  | 
  37  | test("runs the WebGL signature for a normal visitor and follows lifecycle changes", async ({
  38  |   page,
  39  | }) => {
  40  |   await page.setViewportSize({ width: 1280, height: 800 })
  41  |   await page.emulateMedia({ reducedMotion: "no-preference" })
  42  |   await page.goto("/en", { waitUntil: "domcontentloaded" })
  43  | 
  44  |   expect(await page.evaluate(() => navigator.webdriver)).toBe(false)
  45  |   expect(await page.evaluate(() => navigator.userAgent)).toBe(visitorUserAgent)
  46  | 
  47  |   const canvas = page.locator("[data-home-hero] canvas")
  48  |   await expect(canvas).toBeVisible()
  49  |   const context = await canvas.evaluate((element) => {
  50  |     const target = element as HTMLCanvasElement
  51  |     const gl =
  52  |       target.getContext("webgl2") ??
  53  |       target.getContext("webgl") ??
  54  |       target.getContext("experimental-webgl")
  55  |     if (!(gl instanceof WebGLRenderingContext || gl instanceof WebGL2RenderingContext)) {
  56  |       return null
  57  |     }
  58  |     return {
  59  |       height: gl.drawingBufferHeight,
  60  |       width: gl.drawingBufferWidth,
  61  |     }
  62  |   })
  63  |   expect(context).not.toBeNull()
  64  |   expect(context?.width).toBeGreaterThan(0)
  65  |   expect(context?.height).toBeGreaterThan(0)
  66  | 
  67  |   const initialWidth = await canvas.evaluate(
  68  |     (element) => (element as HTMLCanvasElement).width,
  69  |   )
  70  |   await page.setViewportSize({ width: 960, height: 720 })
  71  |   await expect
  72  |     .poll(() =>
  73  |       canvas.evaluate((element) => (element as HTMLCanvasElement).width),
  74  |     )
  75  |     .not.toBe(initialWidth)
  76  | 
  77  |   await page.evaluate(() => {
  78  |     let simulatedHidden = false
  79  |     Object.defineProperty(document, "hidden", {
  80  |       configurable: true,
  81  |       get: () => simulatedHidden,
  82  |     })
  83  |     Object.defineProperty(document, "visibilityState", {
  84  |       configurable: true,
  85  |       get: () => (simulatedHidden ? "hidden" : "visible"),
  86  |     })
  87  |     ;(
  88  |       window as typeof window & { setTestDocumentHidden?: (hidden: boolean) => void }
  89  |     ).setTestDocumentHidden = (hidden) => {
  90  |       simulatedHidden = hidden
  91  |       document.dispatchEvent(new Event("visibilitychange"))
  92  |     }
  93  |   })
  94  | 
  95  |   await page.evaluate(() => {
  96  |     ;(
  97  |       window as typeof window & { setTestDocumentHidden?: (hidden: boolean) => void }
  98  |     ).setTestDocumentHidden?.(true)
  99  |   })
  100 |   await expect(canvas).toHaveCount(0)
  101 | 
  102 |   await page.evaluate(() => {
  103 |     ;(
  104 |       window as typeof window & { setTestDocumentHidden?: (hidden: boolean) => void }
  105 |     ).setTestDocumentHidden?.(false)
  106 |   })
  107 |   await expect(canvas).toBeVisible()
  108 |   await expect.poll(() => canvasPixelSignature(canvas)).not.toBeNull()
  109 | 
  110 |   await page.emulateMedia({ reducedMotion: "reduce" })
  111 |   await expect(canvas).toHaveCount(0)
  112 |   await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
  113 |     "Roberto Moraes",
  114 |   )
  115 | })
  116 | 
  117 | test("falls back cleanly after a real WebGL context loss", async ({ page }) => {
  118 |   const pageErrors: string[] = []
  119 |   page.on("pageerror", (error) => pageErrors.push(error.message))
  120 |   await page.emulateMedia({ reducedMotion: "no-preference" })
  121 |   await page.goto("/en", { waitUntil: "domcontentloaded" })
  122 | 
  123 |   const canvas = page.locator("[data-home-hero] canvas")
> 124 |   await expect(canvas).toBeVisible()
      |                        ^ Error: expect(locator).toBeVisible() failed
  125 |   const canLoseContext = await canvas.evaluate((element) => {
  126 |     const target = element as HTMLCanvasElement
  127 |     const gl = target.getContext("webgl2") ?? target.getContext("webgl")
  128 |     return Boolean(gl?.getExtension("WEBGL_lose_context"))
  129 |   })
  130 |   test.skip(!canLoseContext, "The browser does not expose WEBGL_lose_context")
  131 | 
  132 |   await canvas.evaluate((element) => {
  133 |     const target = element as HTMLCanvasElement
  134 |     const gl = target.getContext("webgl2") ?? target.getContext("webgl")
  135 |     gl?.getExtension("WEBGL_lose_context")?.loseContext()
  136 |   })
  137 |   await expect(canvas).toBeHidden()
  138 |   await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
  139 |     "Roberto Moraes",
  140 |   )
  141 |   expect(pageErrors).toEqual([])
  142 | })
  143 | 
```