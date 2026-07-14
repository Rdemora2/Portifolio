import { existsSync, readFileSync, readdirSync } from "node:fs"
import { relative, resolve, sep } from "node:path"
import { pathToFileURL } from "node:url"
import { gzipSync } from "node:zlib"

const routeDefinitions = {
  home: {
    surface: "HOME",
    htmlPath: "server/app/en.html",
  },
  article: {
    surface: "ARTICLE",
    htmlPath: "server/app/en/insights/go-em-producao.html",
  },
}

function requireNonEmpty(values, message) {
  if (values.length === 0) throw new Error(message)
  return values
}

export function extractRouteAssets(html, surface) {
  const assets = { js: new Set(), css: new Set() }
  const assetPattern =
    /(?:src|href)=["']\/_next\/(static\/[^"'?#]+\.(?:js|css))(?:\?[^"']*)?["']/g

  for (const match of html.matchAll(assetPattern)) {
    const encodedPath = match[1]
    if (!encodedPath) continue

    const path = decodeURIComponent(encodedPath)
    if (path.endsWith(".js")) assets.js.add(path)
    if (path.endsWith(".css")) assets.css.add(path)
  }

  return {
    js: requireNonEmpty(
      [...assets.js],
      `${surface} route did not expose any JavaScript entries in its prerendered HTML`,
    ),
    css: requireNonEmpty(
      [...assets.css],
      `${surface} route did not expose any CSS entries in its prerendered HTML`,
    ),
  }
}

function resolveAsset(nextDir, relativePath) {
  if (!relativePath.startsWith("static/")) {
    throw new Error(`Bundle manifest referenced an invalid asset path: ${relativePath}`)
  }

  const root = resolve(nextDir)
  const absolutePath = resolve(root, relativePath)
  if (!absolutePath.startsWith(`${root}${sep}`)) {
    throw new Error(`Bundle manifest referenced an asset outside .next: ${relativePath}`)
  }

  return absolutePath
}

function gzipFile(nextDir, relativePath) {
  return gzipSync(readFileSync(resolveAsset(nextDir, relativePath)), {
    level: 9,
  }).length
}

export function measureRoute(nextDir, surface, htmlPath) {
  const html = readFileSync(resolve(nextDir, htmlPath))
  const files = extractRouteAssets(html.toString("utf8"), surface)

  return {
    js: files.js.reduce((total, file) => total + gzipFile(nextDir, file), 0),
    css: files.css.reduce((total, file) => total + gzipFile(nextDir, file), 0),
    html: gzipSync(html, { level: 9 }).length,
    files,
  }
}

export function measureLazyGroups(nextDir, manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new Error("Lazy-load manifest must be an object")
  }

  const entries = requireNonEmpty(
    Object.entries(manifest),
    "Lazy-load manifest has no entries; deferred bundle coverage would be empty",
  )
  const allFiles = new Set()
  const groups = entries.map(([name, value]) => {
    const files = requireNonEmpty(
      [
        ...new Set(
          (Array.isArray(value?.files) ? value.files : []).filter(
            (file) => typeof file === "string" && /\.(?:js|css)$/.test(file),
          ),
        ),
      ],
      `Lazy-load entry "${name}" has no JavaScript or CSS files`,
    )

    files.forEach((file) => allFiles.add(file))
    return {
      name,
      files,
      total: files.reduce(
        (total, file) => total + gzipFile(nextDir, file),
        0,
      ),
    }
  })

  return {
    groups,
    files: [...allFiles],
    total: [...allFiles].reduce(
      (total, file) => total + gzipFile(nextDir, file),
      0,
    ),
  }
}

function listBundleFiles(directory, nextDir, files = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      listBundleFiles(absolutePath, nextDir, files)
      continue
    }
    if (!entry.isFile() || !/\.(?:js|css)$/.test(entry.name)) continue

    files.push(relative(nextDir, absolutePath).split(sep).join("/"))
  }

  return files
}

export function measureDeferredChunks(nextDir, initialFiles) {
  const initial = new Set(initialFiles)
  const paths = requireNonEmpty(
    listBundleFiles(resolve(nextDir, "static", "chunks"), nextDir).filter(
      (file) => !initial.has(file),
    ),
    "No deferred chunks were found outside the primary route entries",
  )
  const files = paths.map((path) => ({
    path,
    total: gzipFile(nextDir, path),
  }))
  const max = files.reduce((largest, file) =>
    file.total > largest.total ? file : largest,
  )

  return {
    files,
    max,
    total: files.reduce((sum, file) => sum + file.total, 0),
  }
}

function readLazyManifest(nextDir) {
  const candidates = [
    resolve(
      nextDir,
      "server/app/[locale]/(home)/page/react-loadable-manifest.json",
    ),
    resolve(
      nextDir,
      "server/app/[locale]/page/react-loadable-manifest.json",
    ),
    resolve(nextDir, "react-loadable-manifest.json"),
  ]
  const manifestPath = candidates.find((path) => existsSync(path))

  if (!manifestPath) {
    throw new Error(
      `Could not locate a production lazy-load manifest at: ${candidates.join(", ")}`,
    )
  }

  return JSON.parse(readFileSync(manifestPath, "utf8"))
}

export function collectBundleMetrics(nextDir = resolve(".next")) {
  const home = measureRoute(
    nextDir,
    routeDefinitions.home.surface,
    routeDefinitions.home.htmlPath,
  )
  const article = measureRoute(
    nextDir,
    routeDefinitions.article.surface,
    routeDefinitions.article.htmlPath,
  )
  const initialFiles = [
    ...home.files.js,
    ...home.files.css,
    ...article.files.js,
    ...article.files.css,
  ]

  return {
    home,
    article,
    lazy: measureLazyGroups(nextDir, readLazyManifest(nextDir)),
    deferred: measureDeferredChunks(nextDir, initialFiles),
  }
}

function readBudget(env, names, fallbackKiB) {
  const configured = names
    .map((name) => env[name])
    .find((value) => value !== undefined && value !== "")
  const kib = Number(configured ?? fallbackKiB)

  if (!Number.isFinite(kib) || kib <= 0) {
    throw new Error(
      `${names[0]} must be a positive number of gzip KiB; received ${configured}`,
    )
  }

  return kib * 1024
}

export function createBudgetRows(metrics, env = process.env) {
  const budgets = {
    homeJs: readBudget(
      env,
      ["BUNDLE_BUDGET_HOME_JS_KB", "BUNDLE_BUDGET_JS_KB"],
      260,
    ),
    homeCss: readBudget(
      env,
      ["BUNDLE_BUDGET_HOME_CSS_KB", "BUNDLE_BUDGET_CSS_KB"],
      25,
    ),
    homeHtml: readBudget(
      env,
      ["BUNDLE_BUDGET_HOME_HTML_KB", "BUNDLE_BUDGET_HTML_KB"],
      60,
    ),
    articleJs: readBudget(env, ["BUNDLE_BUDGET_ARTICLE_JS_KB"], 250),
    articleCss: readBudget(env, ["BUNDLE_BUDGET_ARTICLE_CSS_KB"], 25),
    articleHtml: readBudget(env, ["BUNDLE_BUDGET_ARTICLE_HTML_KB"], 35),
    lazyEntry: readBudget(env, ["BUNDLE_BUDGET_LAZY_ENTRY_KB"], 100),
    lazyChunk: readBudget(env, ["BUNDLE_BUDGET_LAZY_CHUNK_KB"], 90),
    lazyTotal: readBudget(env, ["BUNDLE_BUDGET_LAZY_TOTAL_KB"], 165),
  }

  const rows = [
    ["HOME JS", metrics.home.js, budgets.homeJs],
    ["HOME CSS", metrics.home.css, budgets.homeCss],
    ["HOME HTML", metrics.home.html, budgets.homeHtml],
    ["ARTICLE JS", metrics.article.js, budgets.articleJs],
    ["ARTICLE CSS", metrics.article.css, budgets.articleCss],
    ["ARTICLE HTML", metrics.article.html, budgets.articleHtml],
    ["LAZY TOTAL", metrics.deferred.total, budgets.lazyTotal],
    [
      `LAZY MAX · ${metrics.deferred.max.path}`,
      metrics.deferred.max.total,
      budgets.lazyChunk,
    ],
    ...metrics.lazy.groups.map((group) => [
      `LAZY ENTRY · ${group.name}`,
      group.total,
      budgets.lazyEntry,
    ]),
  ]

  return rows.map(([surface, total, budget]) => ({
    surface,
    total,
    budget,
    gzipKiB: (total / 1024).toFixed(1),
    budgetKiB: (budget / 1024).toFixed(1),
    status: total <= budget ? "PASS" : "FAIL",
  }))
}

export function findBudgetFailures(rows) {
  return rows.filter(({ status }) => status === "FAIL")
}

export function runBundleBudgetCheck(nextDir = resolve(".next")) {
  const rows = createBudgetRows(collectBundleMetrics(nextDir))
  console.table(
    rows.map(({ surface, gzipKiB, budgetKiB, status }) => ({
      surface,
      gzipKiB,
      budgetKiB,
      status,
    })),
  )

  const failures = findBudgetFailures(rows)
  if (failures.length > 0) {
    throw new Error(
      `Bundle budget exceeded for: ${failures
        .map(({ surface }) => surface)
        .join(", ")}`,
    )
  }
}

const isCli =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href

if (isCli) runBundleBudgetCheck()
