import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { once } from "node:events"
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { createServer } from "node:http"
import { join } from "node:path"
import { tmpdir } from "node:os"

import {
  collectBundleMetrics,
  createBudgetRows,
  extractCssFontAssets,
  extractRouteAssets,
  findBudgetFailures,
  measureLazyGroups,
  runBundleBudgetCheck,
} from "./check-bundle-budget.mjs"

describe("bundle budget collection", () => {
  let nextDir
  const homeHtml =
    '<link rel="preload" href="/_next/static/media/display.woff2" as="font"><link rel="stylesheet" href="/_next/static/css/app.css"><script src="/_next/static/chunks/runtime.js"></script>'
  const articleHtml =
    '<link rel="preload" href="/_next/static/media/display.woff2" as="font"><link rel="stylesheet" href="/_next/static/css/app.css"><script src="/_next/static/chunks/runtime.js"></script><script src="/_next/static/chunks/article.js"></script>'

  beforeEach(async () => {
    nextDir = await mkdtemp(join(tmpdir(), "portfolio-bundle-budget-"))
  })

  afterEach(async () => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    await rm(nextDir, { recursive: true, force: true })
  })

  async function fixture(relativePath, content) {
    const path = join(nextDir, relativePath)
    await mkdir(join(path, ".."), { recursive: true })
    await writeFile(path, content)
  }

  async function createCompleteBuildFixture() {
    await Promise.all([
      fixture("static/chunks/runtime.js", "runtime".repeat(200)),
      fixture("static/chunks/article.js", "article".repeat(150)),
      fixture("static/chunks/lazy.js", "deferred".repeat(300)),
      fixture(
        "static/css/app.css",
        '@font-face{font-family:Display;src:url("../media/extended.woff2") format("woff2")} .app{display:block}'.repeat(50),
      ),
      fixture("static/media/display.woff2", "font".repeat(500)),
      fixture("static/media/extended.woff2", "extended-font".repeat(300)),
      fixture("server/app/en.html", homeHtml),
      fixture("server/app/en/insights/go-em-producao.html", articleHtml),
      fixture(
        "server/app/[locale]/(home)/page/react-loadable-manifest.json",
        JSON.stringify({
          "ProjectDrawer -> LiquidPortal": {
            files: ["static/chunks/lazy.js"],
          },
        }),
      ),
    ])
  }

  it("measures home, article and deferred assets independently", async () => {
    await createCompleteBuildFixture()

    const metrics = collectBundleMetrics(nextDir)
    expect(metrics.home.files.js).toEqual(["static/chunks/runtime.js"])
    expect(metrics.article.files.js).toEqual([
      "static/chunks/runtime.js",
      "static/chunks/article.js",
    ])
    expect(metrics.home.files.fontPreload).toEqual([
      "static/media/display.woff2",
    ])
    expect(metrics.home.files.fontInventory).toEqual([
      "static/media/display.woff2",
      "static/media/extended.woff2",
    ])
    expect(metrics.home.fontPreload).toBe("font".repeat(500).length)
    expect(metrics.home.fontInventory).toBe(
      "font".repeat(500).length + "extended-font".repeat(300).length,
    )
    expect(metrics.lazy.groups).toHaveLength(1)
    expect(metrics.deferred.files.map(({ path }) => path)).toEqual([
      "static/chunks/lazy.js",
    ])

    const rows = createBudgetRows(metrics)
    expect(rows.map(({ surface }) => surface)).toEqual(
      expect.arrayContaining([
        "ARTICLE JS",
        "ARTICLE HTML",
        "ARTICLE FONT PRELOAD",
        "ARTICLE FONT INVENTORY",
        "LAZY TOTAL",
        "LAZY MAX · static/chunks/lazy.js",
        "LAZY ENTRY · ProjectDrawer -> LiquidPortal",
      ]),
    )
  })

  it("accepts captured HTML for every measured dynamic route", async () => {
    await createCompleteBuildFixture()
    await Promise.all([
      rm(join(nextDir, "server/app/en.html")),
      rm(join(nextDir, "server/app/en/insights/go-em-producao.html")),
    ])

    const metrics = collectBundleMetrics(nextDir, {
      home: homeHtml,
      article: articleHtml,
    })

    expect(metrics.home.files.js).toEqual(["static/chunks/runtime.js"])
    expect(metrics.article.files.js).toEqual([
      "static/chunks/runtime.js",
      "static/chunks/article.js",
    ])
    expect(metrics.home.files.fontInventory).toEqual([
      "static/media/display.woff2",
      "static/media/extended.woff2",
    ])
  })

  it("fetches only a missing dynamic route and keeps static HTML as the fast path", async () => {
    await createCompleteBuildFixture()
    await rm(join(nextDir, "server/app/en/insights/go-em-producao.html"))

    const requestedPaths = []
    const server = createServer((request, response) => {
      requestedPaths.push(request.url)
      if (request.url !== "/en/insights/go-em-producao") {
        response.writeHead(404).end()
        return
      }

      response.writeHead(200, { "content-type": "text/html; charset=utf-8" })
      response.end(articleHtml)
    })
    server.listen({ host: "127.0.0.1", port: 0 })
    await once(server, "listening")
    const address = server.address()
    if (!address || typeof address === "string") {
      throw new Error("Bundle test server did not expose a TCP port")
    }

    vi.stubEnv(
      "BUNDLE_BUDGET_BASE_URL",
      `http://127.0.0.1:${address.port}`,
    )
    vi.spyOn(console, "table").mockImplementation(() => undefined)

    try {
      await runBundleBudgetCheck(nextDir)
    } finally {
      server.close()
      await once(server, "close")
    }

    expect(requestedPaths).toEqual(["/en/insights/go-em-producao"])
  })

  it("rejects routes whose initial entries are empty", () => {
    expect(() => extractRouteAssets("<html></html>", "HOME")).toThrow(
      "HOME route did not expose any JavaScript entries",
    )
  })

  it("counts only semantic font preloads regardless of attribute order", () => {
    const assets = extractRouteAssets(
      [
        '<script src="/_next/static/chunks/runtime.js"></script>',
        '<link rel="stylesheet" href="/_next/static/css/app.css">',
        '<link href="/_next/static/media/navigation.woff2" rel="alternate">',
        '<link as="style" href="/_next/static/media/style.woff2" rel="preload">',
        "<link href='/_next/static/media/display.woff2?v=1' AS='FONT' REL='preload'>",
      ].join(""),
      "HOME",
    )

    expect(assets.font).toEqual(["static/media/display.woff2"])
  })

  it("resolves relative and absolute WOFF2 references from initial CSS", () => {
    expect(
      extractCssFontAssets(
        '@font-face{src:url(../media/a.woff2)}@font-face{src:url("/_next/static/media/b.woff2?v=1")}',
        "static/css/app.css",
      ),
    ).toEqual(["static/media/a.woff2", "static/media/b.woff2"])
  })

  it("rejects empty lazy manifests and entries", () => {
    expect(() => measureLazyGroups(nextDir, {})).toThrow(
      "Lazy-load manifest has no entries",
    )
    expect(() =>
      measureLazyGroups(nextDir, { "Empty dynamic import": { files: [] } }),
    ).toThrow('Lazy-load entry "Empty dynamic import" has no JavaScript or CSS files')
  })

  it("reports article and deferred regressions against configured limits", async () => {
    await createCompleteBuildFixture()
    const metrics = collectBundleMetrics(nextDir)
    const tinyBudgets = {
      BUNDLE_BUDGET_HOME_JS_KB: "0.001",
      BUNDLE_BUDGET_HOME_CSS_KB: "0.001",
      BUNDLE_BUDGET_HOME_HTML_KB: "0.001",
      BUNDLE_BUDGET_HOME_FONT_PRELOAD_KB: "0.001",
      BUNDLE_BUDGET_HOME_FONT_INVENTORY_KB: "0.001",
      BUNDLE_BUDGET_ARTICLE_JS_KB: "0.001",
      BUNDLE_BUDGET_ARTICLE_CSS_KB: "0.001",
      BUNDLE_BUDGET_ARTICLE_HTML_KB: "0.001",
      BUNDLE_BUDGET_ARTICLE_FONT_PRELOAD_KB: "0.001",
      BUNDLE_BUDGET_ARTICLE_FONT_INVENTORY_KB: "0.001",
      BUNDLE_BUDGET_LAZY_ENTRY_KB: "0.001",
      BUNDLE_BUDGET_LAZY_CHUNK_KB: "0.001",
      BUNDLE_BUDGET_LAZY_TOTAL_KB: "0.001",
    }

    const failures = findBudgetFailures(createBudgetRows(metrics, tinyBudgets))
    expect(failures.map(({ surface }) => surface)).toEqual(
      expect.arrayContaining([
        "ARTICLE JS",
        "ARTICLE HTML",
        "ARTICLE FONT PRELOAD",
        "ARTICLE FONT INVENTORY",
        "LAZY TOTAL",
        "LAZY MAX · static/chunks/lazy.js",
        "LAZY ENTRY · ProjectDrawer -> LiquidPortal",
      ]),
    )
  })
})
