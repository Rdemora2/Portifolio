import { createHash } from "node:crypto"
import { spawn } from "node:child_process"
import {
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))
export const developmentFingerprintMarker =
  ".portfolio-dependency-fingerprint"

export function createDependencyFingerprint({
  lockfile,
  packageManifest,
  npmConfiguration,
  nodeVersion,
  platform,
  architecture,
}) {
  return createHash("sha256")
    .update(lockfile)
    .update("\0")
    .update(packageManifest)
    .update("\0")
    .update(npmConfiguration)
    .update("\0")
    .update(nodeVersion)
    .update("\0")
    .update(platform)
    .update("\0")
    .update(architecture)
    .digest("hex")
}

async function readCurrentFingerprint(root) {
  const [lockfile, packageManifest, npmConfiguration] = await Promise.all([
    readFile(join(root, "package-lock.json"), "utf8"),
    readFile(join(root, "package.json"), "utf8"),
    readFile(join(root, ".npmrc"), "utf8").catch((error) => {
      if (error?.code === "ENOENT") return ""
      throw error
    }),
  ])

  return createDependencyFingerprint({
    lockfile,
    packageManifest,
    npmConfiguration,
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,
  })
}

async function readMarker(path) {
  try {
    return (await readFile(path, "utf8")).trim()
  } catch (error) {
    if (error?.code === "ENOENT") return null
    throw error
  }
}

async function writeMarker(path, fingerprint) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${fingerprint}\n`, "utf8")
}

export async function resetNextCacheIfStale(root, fingerprint) {
  const nextDirectory = join(root, ".next")
  const marker = join(nextDirectory, developmentFingerprintMarker)
  if ((await readMarker(marker)) === fingerprint) return false

  // `.next` is a named-volume mount in Docker and the mount point itself
  // cannot be removed. Empty its contents while preserving the directory.
  await mkdir(nextDirectory, { recursive: true })
  const entries = await readdir(nextDirectory)
  await Promise.all(
    entries.map((entry) =>
      rm(join(nextDirectory, entry), { recursive: true, force: true }),
    ),
  )
  await writeMarker(marker, fingerprint)
  return true
}

function runNpm(arguments_) {
  const npmExecutable = process.platform === "win32" ? "npm.cmd" : "npm"
  return new Promise((resolve, reject) => {
    const child = spawn(npmExecutable, arguments_, {
      cwd: projectRoot,
      env: process.env,
      stdio: "inherit",
    })

    child.once("error", reject)
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(
        new Error(
          `npm ${arguments_.join(" ")} failed${signal ? ` with ${signal}` : ` with exit code ${code}`}`,
        ),
      )
    })
  })
}

async function markImageDependencies(fingerprint) {
  await writeMarker(
    join(projectRoot, "node_modules", developmentFingerprintMarker),
    fingerprint,
  )
}

async function prepareDevelopmentWorkspace() {
  const fingerprint = await readCurrentFingerprint(projectRoot)
  const dependencyMarker = join(
    projectRoot,
    "node_modules",
    developmentFingerprintMarker,
  )

  if ((await readMarker(dependencyMarker)) !== fingerprint) {
    console.log(
      "[dev-workspace] dependency volume is stale; running a clean verified install",
    )
    await runNpm(["ci", "--ignore-scripts", "--no-audit", "--no-fund"])
    await runNpm(["audit", "signatures"])
    await writeMarker(dependencyMarker, fingerprint)
  }

  if (await resetNextCacheIfStale(projectRoot, fingerprint)) {
    console.log(
      "[dev-workspace] cleared the Next.js cache after a dependency runtime change",
    )
  }
}

async function main() {
  const fingerprint = await readCurrentFingerprint(projectRoot)
  if (process.argv.includes("--mark-dependencies")) {
    await markImageDependencies(fingerprint)
    return
  }

  await prepareDevelopmentWorkspace()
}

const invokedPath = process.argv[1]
if (invokedPath && pathToFileURL(invokedPath).href === import.meta.url) {
  main().catch((error) => {
    console.error(`[dev-workspace] ${error.message}`)
    process.exitCode = 1
  })
}
