import { spawn } from "node:child_process"
import { createHash } from "node:crypto"
import { once } from "node:events"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { createServer } from "node:net"
import { posix, relative, resolve, sep } from "node:path"
import { setTimeout as delay } from "node:timers/promises"
import { pathToFileURL } from "node:url"
import { gzipSync } from "node:zlib"

export const routeDefinitions = {
  home: {
    surface: "HOME",
    htmlPath: "server/app/en.html",
    pathname: "/en/",
    budgets: { js: 260, css: 25, html: 60, fontPreload: 120, fontInventory: 210 },
  },
  work: {
    surface: "WORK",
    htmlPath: "server/app/en/work.html",
    pathname: "/en/work",
    budgets: { js: 250, css: 25, html: 35, fontPreload: 120, fontInventory: 210 },
  },
  caseStudy: {
    surface: "CASE",
    htmlPath: "server/app/en/work/hospital-sirio-libanes.html",
    pathname: "/en/work/hospital-sirio-libanes",
    budgets: { js: 245, css: 25, html: 20, fontPreload: 120, fontInventory: 210 },
  },
  experience: {
    surface: "EXPERIENCE",
    htmlPath: "server/app/en/experience.html",
    pathname: "/en/experience",
    budgets: { js: 245, css: 25, html: 22, fontPreload: 120, fontInventory: 210 },
  },
  about: {
    surface: "ABOUT",
    htmlPath: "server/app/en/about.html",
    pathname: "/en/about",
    budgets: { js: 245, css: 25, html: 40, fontPreload: 120, fontInventory: 210 },
  },
  insights: {
    surface: "INSIGHTS",
    htmlPath: "server/app/en/insights.html",
    pathname: "/en/insights",
    budgets: { js: 245, css: 25, html: 18, fontPreload: 120, fontInventory: 210 },
  },
  contact: {
    surface: "CONTACT",
    htmlPath: "server/app/en/contact.html",
    pathname: "/en/contact",
    budgets: { js: 250, css: 25, html: 18, fontPreload: 120, fontInventory: 210 },
  },
  article: {
    surface: "ARTICLE",
    htmlPath: "server/app/en/insights/go-em-producao.html",
    pathname: "/en/insights/go-in-production",
    budgets: { js: 250, css: 25, html: 35, fontPreload: 120, fontInventory: 210 },
  },
}

function requireNonEmpty(values, message) {
  if (values.length === 0) throw new Error(message)
  return values
}

export function extractRouteAssets(html, surface) {
  const assets = { js: new Set(), css: new Set(), font: new Set() }
  const assetPattern =
    /(?:src|href)=["']\/_next\/(static\/[^"'?#]+\.(?:js|css))(?:\?[^"']*)?["']/g

  for (const match of html.matchAll(assetPattern)) {
    const encodedPath = match[1]
    if (!encodedPath) continue

    const path = decodeURIComponent(encodedPath)
    if (path.endsWith(".js")) assets.js.add(path)
    if (path.endsWith(".css")) assets.css.add(path)
  }

  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0]
    const attributes = new Map()
    const attributePattern =
      /\s([^\s"'<>\/=]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g

    for (const attribute of tag.matchAll(attributePattern)) {
      const name = attribute[1]?.toLowerCase()
      const value = attribute[2] ?? attribute[3] ?? attribute[4]
      if (name && value !== undefined) attributes.set(name, value)
    }

    const rel = attributes.get("rel") ?? ""
    const as = attributes.get("as") ?? ""
    const href = attributes.get("href") ?? ""
    const isFontPreload =
      rel
        .toLowerCase()
        .split(/\s+/)
        .includes("preload") && as.toLowerCase() === "font"
    if (!isFontPreload) continue

    const fontMatch = href.match(
      /^\/_next\/(static\/[^?#]+\.woff2)(?:[?#].*)?$/i,
    )
    if (fontMatch?.[1]) assets.font.add(decodeURIComponent(fontMatch[1]))
  }

  return {
    js: requireNonEmpty(
      [...assets.js],
      `${surface} route did not expose any JavaScript entries in its initial HTML`,
    ),
    css: requireNonEmpty(
      [...assets.css],
      `${surface} route did not expose any CSS entries in its initial HTML`,
    ),
    font: [...assets.font],
  }
}

function resolveCssAssetReference(cssPath, reference) {
  const decodedReference = decodeURIComponent(reference)

  if (decodedReference.startsWith("/_next/")) {
    return decodedReference.slice("/_next/".length)
  }

  if (decodedReference.startsWith("static/")) return decodedReference

  return posix.normalize(
    posix.join(posix.dirname(cssPath), decodedReference),
  )
}

export function extractCssFontAssets(css, cssPath) {
  const fonts = new Set()
  const fontPattern =
    /url\(\s*(["']?)([^"')?#]+\.woff2)(?:\?[^"')]*)?\1\s*\)/g

  for (const match of css.matchAll(fontPattern)) {
    const reference = match[2]
    if (!reference) continue
    fonts.add(resolveCssAssetReference(cssPath, reference))
  }

  return [...fonts]
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

function rawFileSize(nextDir, relativePath) {
  return readFileSync(resolveAsset(nextDir, relativePath)).length
}

export function measureRoute(nextDir, surface, htmlPath, providedHtml) {
  const html =
    providedHtml === undefined
      ? readFileSync(resolve(nextDir, htmlPath))
      : Buffer.isBuffer(providedHtml)
        ? providedHtml
        : Buffer.from(providedHtml)
  const htmlAssets = extractRouteAssets(html.toString("utf8"), surface)
  const cssFonts = htmlAssets.css.flatMap((cssPath) =>
    extractCssFontAssets(
      readFileSync(resolveAsset(nextDir, cssPath), "utf8"),
      cssPath,
    ),
  )
  const { font: htmlFonts, ...routeAssets } = htmlAssets
  const files = {
    ...routeAssets,
    fontPreload: [...htmlFonts],
    fontInventory: requireNonEmpty(
      [...new Set([...htmlFonts, ...cssFonts])],
      `${surface} route did not expose any font entries in its initial HTML or CSS`,
    ),
  }

  return {
    js: files.js.reduce((total, file) => total + gzipFile(nextDir, file), 0),
    css: files.css.reduce((total, file) => total + gzipFile(nextDir, file), 0),
    // WOFF2 is already compressed. Keep the actually preloaded transfer and
    // the complete CSS-reachable inventory as separate regression signals.
    fontPreload: files.fontPreload.reduce(
      (total, file) => total + rawFileSize(nextDir, file),
      0,
    ),
    fontInventory: files.fontInventory.reduce(
      (total, file) => total + rawFileSize(nextDir, file),
      0,
    ),
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

function findFilesNamed(directory, filename, files = []) {
  if (!existsSync(directory)) return files

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      findFilesNamed(absolutePath, filename, files)
      continue
    }
    if (entry.isFile() && entry.name === filename) files.push(absolutePath)
  }

  return files
}

function readLazyManifest(nextDir) {
  const routeManifests = findFilesNamed(
    resolve(nextDir, "server", "app", "[locale]"),
    "react-loadable-manifest.json",
  )
  const candidates =
    routeManifests.length > 0
      ? routeManifests
      : [resolve(nextDir, "react-loadable-manifest.json")].filter((path) =>
          existsSync(path),
        )

  if (candidates.length === 0) {
    throw new Error(
      "Could not locate a production lazy-load manifest for any portfolio route",
    )
  }

  const mergedManifest = {}
  for (const manifestPath of candidates) {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"))
    for (const [name, entry] of Object.entries(manifest)) {
      const route = relative(nextDir, manifestPath).split(sep).join("/")
      mergedManifest[`${route} :: ${name}`] = entry
    }
  }

  return mergedManifest
}

export function collectBundleMetrics(
  nextDir = resolve(".next"),
  routeHtml = {},
) {
  const measuredRoutes = Object.fromEntries(
    Object.entries(routeDefinitions).map(([key, definition]) => [
      key,
      measureRoute(
        nextDir,
        definition.surface,
        definition.htmlPath,
        routeHtml[key],
      ),
    ]),
  )
  const initialFiles = Object.values(measuredRoutes).flatMap((route) => [
    ...route.files.js,
    ...route.files.css,
  ])

  return {
    ...measuredRoutes,
    lazy: measureLazyGroups(nextDir, readLazyManifest(nextDir)),
    deferred: measureDeferredChunks(nextDir, initialFiles),
  }
}

async function reserveLoopbackPort() {
  const server = createServer()
  await new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen)
    server.listen({ host: "127.0.0.1", port: 0 }, resolveListen)
  })

  const address = server.address()
  if (!address || typeof address === "string") {
    server.close()
    throw new Error("Could not reserve a loopback port for bundle analysis")
  }

  await new Promise((resolveClose, rejectClose) => {
    server.close((error) => (error ? rejectClose(error) : resolveClose()))
  })
  return address.port
}

async function fetchRouteHtml(url, serverProcess, readServerOutput) {
  const deadline = Date.now() + 30_000
  let lastError

  while (Date.now() < deadline) {
    if (serverProcess && serverProcess.exitCode !== null) {
      throw new Error(
        `Bundle analysis server exited before it became ready.\n${readServerOutput()}`,
      )
    }

    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(3_000),
      })
      const contentType = response.headers.get("content-type") ?? ""
      if (response.ok && contentType.includes("text/html")) {
        return Buffer.from(await response.arrayBuffer())
      }
      lastError = new Error(
        `received HTTP ${response.status} with content-type ${contentType || "unknown"}`,
      )
    } catch (error) {
      lastError = error
    }

    await delay(125)
  }

  throw new Error(
    `Timed out fetching ${url} for bundle analysis: ${lastError instanceof Error ? lastError.message : "unknown error"}\n${readServerOutput()}`,
  )
}

async function stopServer(serverProcess) {
  if (serverProcess.exitCode !== null || serverProcess.signalCode !== null) return

  const exited = once(serverProcess, "exit")
  serverProcess.kill("SIGTERM")
  await Promise.race([exited, delay(5_000)])

  if (serverProcess.exitCode === null && serverProcess.signalCode === null) {
    serverProcess.kill("SIGKILL")
    await exited
  }
}

function parseConfiguredBaseUrl(configuredBaseUrl) {
  try {
    const url = new URL(configuredBaseUrl)
    if (!/^https?:$/.test(url.protocol)) throw new Error()
    return url
  } catch {
    throw new Error(
      "BUNDLE_BUDGET_BASE_URL must be an absolute HTTP(S) URL",
    )
  }
}

async function fetchDynamicRoutes(
  routeEntries,
  baseUrl,
  serverProcess,
  readServerOutput,
) {
  const entries = await Promise.all(
    routeEntries.map(async ([key, definition]) => [
      key,
      await fetchRouteHtml(
        new URL(definition.pathname, baseUrl),
        serverProcess,
        readServerOutput,
      ),
    ]),
  )

  return Object.fromEntries(entries)
}

async function loadDynamicRouteHtml(nextDir, routeEntries) {
  if (routeEntries.length === 0) return {}

  const configuredBaseUrl = process.env.BUNDLE_BUDGET_BASE_URL
  if (configuredBaseUrl) {
    return fetchDynamicRoutes(
      routeEntries,
      parseConfiguredBaseUrl(configuredBaseUrl),
      null,
      () => "",
    )
  }

  const standaloneServer = resolve(nextDir, "standalone", "server.js")
  if (!existsSync(standaloneServer)) {
    const surfaces = routeEntries
      .map(([, definition]) => definition.surface)
      .join(", ")
    throw new Error(
      `${surfaces} ${routeEntries.length === 1 ? "is" : "are"} dynamic and the standalone server was not found at ${standaloneServer}`,
    )
  }

  const port = await reserveLoopbackPort()
  const validationToken = createHash("sha256")
    .update("portfolio-bundle-analysis-runtime")
    .digest("hex")
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://robertomoraes.dev"
  let serverOutput = ""
  const appendOutput = (chunk) => {
    serverOutput = `${serverOutput}${chunk.toString()}`.slice(-8_000)
  }
  const serverProcess = spawn(process.execPath, [standaloneServer], {
    cwd: resolve(nextDir, ".."),
    env: {
      ...process.env,
      // The analyzer never calls the contact API, but the standalone runtime
      // deliberately validates its full environment at boot. Supply scoped,
      // non-secret values only when the caller has not provided real config.
      CONTACT_ALLOWED_ORIGINS:
        process.env.CONTACT_ALLOWED_ORIGINS ?? siteUrl,
      CONTACT_FROM_EMAIL:
        process.env.CONTACT_FROM_EMAIL ?? "bundle-analysis@robertomoraes.dev",
      CONTACT_IDEMPOTENCY_SECRET:
        process.env.CONTACT_IDEMPOTENCY_SECRET ?? validationToken,
      CONTACT_TO_EMAIL:
        process.env.CONTACT_TO_EMAIL ?? "quality@robertomoraes.dev",
      CONTACT_TRUST_PROXY: process.env.CONTACT_TRUST_PROXY ?? "false",
      HOSTNAME: "127.0.0.1",
      NODE_ENV: "production",
      NEXT_PUBLIC_SITE_URL: siteUrl,
      PORT: String(port),
      RESEND_API_KEY:
        process.env.RESEND_API_KEY ?? `re_${validationToken}`,
    },
    stdio: ["ignore", "pipe", "pipe"],
  })
  serverProcess.stdout?.on("data", appendOutput)
  serverProcess.stderr?.on("data", appendOutput)

  try {
    return await fetchDynamicRoutes(
      routeEntries,
      new URL(`http://127.0.0.1:${port}`),
      serverProcess,
      () => serverOutput,
    )
  } finally {
    await stopServer(serverProcess)
  }
}

function readBudget(env, names, fallbackKiB) {
  const configured = names
    .map((name) => env[name])
    .find((value) => value !== undefined && value !== "")
  const kib = Number(configured ?? fallbackKiB)

  if (!Number.isFinite(kib) || kib <= 0) {
    throw new Error(
      `${names[0]} must be a positive number of transfer KiB; received ${configured}`,
    )
  }

  return kib * 1024
}

export function createBudgetRows(metrics, env = process.env) {
  const routeRows = Object.entries(routeDefinitions).flatMap(
    ([key, definition]) => {
      const metric = metrics[key]
      const prefix = `BUNDLE_BUDGET_${definition.surface}`
      const fallbackNames =
        definition.surface === "HOME"
          ? {
              js: ["BUNDLE_BUDGET_JS_KB"],
              css: ["BUNDLE_BUDGET_CSS_KB"],
              html: ["BUNDLE_BUDGET_HTML_KB"],
              fontPreload: ["BUNDLE_BUDGET_HOME_FONT_KB"],
            }
          : definition.surface === "ARTICLE"
            ? { fontPreload: ["BUNDLE_BUDGET_ARTICLE_FONT_KB"] }
            : {}
      const budgetFor = (kind, suffix) =>
        readBudget(
          env,
          [`${prefix}_${suffix}_KB`, ...(fallbackNames[kind] ?? [])],
          definition.budgets[kind],
        )

      return [
        [`${definition.surface} JS`, metric.js, budgetFor("js", "JS")],
        [`${definition.surface} CSS`, metric.css, budgetFor("css", "CSS")],
        [`${definition.surface} HTML`, metric.html, budgetFor("html", "HTML")],
        [
          `${definition.surface} FONT PRELOAD`,
          metric.fontPreload,
          budgetFor("fontPreload", "FONT_PRELOAD"),
        ],
        [
          `${definition.surface} FONT INVENTORY`,
          metric.fontInventory,
          budgetFor("fontInventory", "FONT_INVENTORY"),
        ],
      ]
    },
  )
  const lazyEntryBudget = readBudget(
    env,
    ["BUNDLE_BUDGET_LAZY_ENTRY_KB"],
    100,
  )
  const lazyChunkBudget = readBudget(
    env,
    ["BUNDLE_BUDGET_LAZY_CHUNK_KB"],
    90,
  )
  const lazyTotalBudget = readBudget(
    env,
    ["BUNDLE_BUDGET_LAZY_TOTAL_KB"],
    175,
  )
  const rows = [
    ...routeRows,
    ["LAZY TOTAL", metrics.deferred.total, lazyTotalBudget],
    [
      `LAZY MAX · ${metrics.deferred.max.path}`,
      metrics.deferred.max.total,
      lazyChunkBudget,
    ],
    ...metrics.lazy.groups.map((group) => [
      `LAZY ENTRY · ${group.name}`,
      group.total,
      lazyEntryBudget,
    ]),
  ]

  return rows.map(([surface, total, budget]) => ({
    surface,
    total,
    budget,
    sizeKiB: (total / 1024).toFixed(1),
    budgetKiB: (budget / 1024).toFixed(1),
    status: total <= budget ? "PASS" : "FAIL",
  }))
}

export function findBudgetFailures(rows) {
  return rows.filter(({ status }) => status === "FAIL")
}

export async function runBundleBudgetCheck(nextDir = resolve(".next")) {
  const dynamicRouteEntries = Object.entries(routeDefinitions).filter(
    ([, definition]) => !existsSync(resolve(nextDir, definition.htmlPath)),
  )
  const routeHtml = await loadDynamicRouteHtml(nextDir, dynamicRouteEntries)
  const rows = createBudgetRows(collectBundleMetrics(nextDir, routeHtml))
  console.table(
    rows.map(({ surface, sizeKiB, budgetKiB, status }) => ({
      surface,
      sizeKiB,
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

if (isCli) await runBundleBudgetCheck()
