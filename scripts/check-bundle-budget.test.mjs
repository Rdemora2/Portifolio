import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"

import {
  collectBundleMetrics,
  createBudgetRows,
  extractRouteAssets,
  findBudgetFailures,
  measureLazyGroups,
} from "./check-bundle-budget.mjs"

describe("bundle budget collection", () => {
  let nextDir

  beforeEach(async () => {
    nextDir = await mkdtemp(join(tmpdir(), "portfolio-bundle-budget-"))
  })

  afterEach(async () => {
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
      fixture("static/css/app.css", ".app{display:block}".repeat(50)),
      fixture(
        "server/app/en.html",
        '<link rel="stylesheet" href="/_next/static/css/app.css"><script src="/_next/static/chunks/runtime.js"></script>',
      ),
      fixture(
        "server/app/en/insights/go-em-producao.html",
        '<link rel="stylesheet" href="/_next/static/css/app.css"><script src="/_next/static/chunks/runtime.js"></script><script src="/_next/static/chunks/article.js"></script>',
      ),
      fixture(
        "server/app/[locale]/page/react-loadable-manifest.json",
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
    expect(metrics.lazy.groups).toHaveLength(1)
    expect(metrics.deferred.files.map(({ path }) => path)).toEqual([
      "static/chunks/lazy.js",
    ])

    const rows = createBudgetRows(metrics)
    expect(rows.map(({ surface }) => surface)).toEqual(
      expect.arrayContaining([
        "ARTICLE JS",
        "ARTICLE HTML",
        "LAZY TOTAL",
        "LAZY MAX · static/chunks/lazy.js",
        "LAZY ENTRY · ProjectDrawer -> LiquidPortal",
      ]),
    )
  })

  it("rejects routes whose initial entries are empty", () => {
    expect(() => extractRouteAssets("<html></html>", "HOME")).toThrow(
      "HOME route did not expose any JavaScript entries",
    )
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
      BUNDLE_BUDGET_ARTICLE_JS_KB: "0.001",
      BUNDLE_BUDGET_ARTICLE_CSS_KB: "0.001",
      BUNDLE_BUDGET_ARTICLE_HTML_KB: "0.001",
      BUNDLE_BUDGET_LAZY_ENTRY_KB: "0.001",
      BUNDLE_BUDGET_LAZY_CHUNK_KB: "0.001",
      BUNDLE_BUDGET_LAZY_TOTAL_KB: "0.001",
    }

    const failures = findBudgetFailures(createBudgetRows(metrics, tinyBudgets))
    expect(failures.map(({ surface }) => surface)).toEqual(
      expect.arrayContaining([
        "ARTICLE JS",
        "ARTICLE HTML",
        "LAZY TOTAL",
        "LAZY MAX · static/chunks/lazy.js",
        "LAZY ENTRY · ProjectDrawer -> LiquidPortal",
      ]),
    )
  })
})
