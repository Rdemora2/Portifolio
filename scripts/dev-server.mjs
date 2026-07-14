import { execFile, spawn } from "node:child_process"
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"
import { promisify } from "node:util"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import nextEnv from "@next/env"

const execFileAsync = promisify(execFile)
const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const nextCli = join(projectRoot, "node_modules", "next", "dist", "bin", "next")
const defaultOldSpaceLimitMb = 1536
const defaultProcessTreeLimitMb = 2048
const sampleIntervalMs = 2_000
const devBundlerMarker = ".portfolio-bundler"
const { loadEnvConfig, resetEnv } = nextEnv

export function parseMemoryLimit(value, fallback, label) {
  const candidate = value ?? String(fallback)
  if (!/^\d+$/.test(candidate)) {
    throw new Error(`${label} must be an integer number of MiB`)
  }

  const parsed = Number(candidate)
  if (!Number.isSafeInteger(parsed) || parsed < 512 || parsed > 4096) {
    throw new Error(`${label} must be between 512 and 4096 MiB`)
  }

  return parsed
}

export function enforceHeapLimit(nodeOptions, heapLimitMb) {
  const withoutExistingLimit = (nodeOptions ?? "")
    .replace(
      /(^|\s)--max[-_]old[-_]space[-_]size(?:=\d+|\s+\d+)(?=\s|$)/g,
      " ",
    )
    .trim()

  return [withoutExistingLimit, `--max-old-space-size=${heapLimitMb}`]
    .filter(Boolean)
    .join(" ")
}

export function calculateProcessTreeRssKb(processTable, rootPid) {
  const processes = processTable
    .trim()
    .split("\n")
    .map((line) => line.trim().split(/\s+/).map(Number))
    .filter(
      (entry) =>
        entry.length === 3 &&
        entry.every((value) => Number.isFinite(value) && value >= 0),
    )
    .map(([pid, parentPid, rssKb]) => ({ pid, parentPid, rssKb }))

  const processTree = new Set([rootPid])
  let foundDescendant = true
  while (foundDescendant) {
    foundDescendant = false
    for (const process of processes) {
      if (
        processTree.has(process.parentPid) &&
        !processTree.has(process.pid)
      ) {
        processTree.add(process.pid)
        foundDescendant = true
      }
    }
  }

  return processes.reduce(
    (total, process) =>
      processTree.has(process.pid) ? total + process.rssKb : total,
    0,
  )
}

export function parseLinuxProcessStatus(status) {
  const pid = Number(status.match(/^\s*Pid:\s+(\d+)/m)?.[1])
  const parentPid = Number(status.match(/^\s*PPid:\s+(\d+)/m)?.[1])
  const rssKb = Number(
    status.match(/^\s*VmRSS:\s+(\d+)\s+kB/m)?.[1] ?? 0,
  )

  if (
    !Number.isSafeInteger(pid) ||
    pid <= 0 ||
    !Number.isSafeInteger(parentPid) ||
    parentPid < 0 ||
    !Number.isSafeInteger(rssKb) ||
    rssKb < 0
  ) {
    return null
  }

  return { pid, parentPid, rssKb }
}

export function loadDevelopmentGuardEnvironment(root = projectRoot) {
  try {
    loadEnvConfig(
      root,
      true,
      {
        info: () => undefined,
        error: (...arguments_) => console.error(...arguments_),
      },
      true,
    )

    return {
      oldSpaceLimit: process.env.NEXT_DEV_OLD_SPACE_MB,
      processTreeLimit: process.env.NEXT_DEV_MEMORY_LIMIT_MB,
    }
  } finally {
    // Do not leak the wrapper's dotenv state into Next.js. The child must load
    // the files itself so edits to .env.development.local keep hot reloading.
    resetEnv()
  }
}

export function isProcessAlive(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    if (error?.code === "EPERM") return true
    if (error?.code === "ESRCH") return false
    throw error
  }
}

export async function readActiveNextDevelopmentPid(
  root,
  processIsAlive = isProcessAlive,
) {
  const lock = join(root, ".next", "dev", "lock")
  let contents
  try {
    contents = await readFile(lock, "utf8")
  } catch (error) {
    if (error?.code === "ENOENT") return null
    throw error
  }

  let pid
  try {
    pid = JSON.parse(contents).pid
  } catch {
    throw new Error(
      "the existing Next.js development lock is unreadable; stop every dev server and remove .next/dev/lock",
    )
  }

  if (!Number.isSafeInteger(pid) || pid <= 0) {
    throw new Error(
      "the existing Next.js development lock has no valid PID; stop every dev server and remove .next/dev/lock",
    )
  }

  return processIsAlive(pid) ? pid : null
}

export async function alignDevBundlerCache(root, bundler) {
  const activePid = await readActiveNextDevelopmentPid(root)
  if (activePid !== null) {
    throw new Error(
      `Next.js development server PID ${activePid} is already running; stop it before starting another server or switching bundlers`,
    )
  }

  const nextDirectory = join(root, ".next")
  const devDirectory = join(root, ".next", "dev")
  // Next dev clears most direct children of `.next/dev`, while next build
  // clears `.next` except `cache`, `dev`, and `lock`. The shared cache folder
  // is the only Next-preserved location across both workflows.
  const markerDirectory = join(nextDirectory, "cache")
  const marker = join(markerDirectory, devBundlerMarker)
  let currentBundler = null
  try {
    currentBundler = (await readFile(marker, "utf8")).trim()
  } catch (error) {
    if (error?.code !== "ENOENT") throw error
  }

  if (currentBundler === bundler) return false

  await rm(devDirectory, { recursive: true, force: true })
  await mkdir(markerDirectory, { recursive: true })
  await writeFile(marker, `${bundler}\n`, "utf8")
  return true
}

async function readLinuxProcessTreeRssKb(rootPid) {
  const entries = await readdir("/proc", { withFileTypes: true })
  const processes = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory() && /^\d+$/.test(entry.name))
      .map(async (entry) => {
        try {
          return parseLinuxProcessStatus(
            await readFile(`/proc/${entry.name}/status`, "utf8"),
          )
        } catch (error) {
          if (error?.code === "ENOENT" || error?.code === "EACCES") return null
          throw error
        }
      }),
  )
  const processTable = processes
    .filter(Boolean)
    .map(({ pid, parentPid, rssKb }) => `${pid} ${parentPid} ${rssKb}`)
    .join("\n")

  return calculateProcessTreeRssKb(processTable, rootPid)
}

async function readDarwinProcessTreeRssKb(rootPid) {
  const { stdout } = await execFileAsync("ps", [
    "-axo",
    "pid=,ppid=,rss=",
  ])
  return calculateProcessTreeRssKb(stdout, rootPid)
}

async function readProcessTreeRssKb(rootPid) {
  if (process.platform === "linux") {
    return readLinuxProcessTreeRssKb(rootPid)
  }

  return readDarwinProcessTreeRssKb(rootPid)
}

function resolveBundler(arguments_) {
  const requested = arguments_.filter((argument) =>
    ["--turbo", "--turbopack", "--webpack"].includes(argument),
  )
  const unique = new Set(
    requested.map((argument) =>
      argument === "--turbo" ? "--turbopack" : argument,
    ),
  )

  if (unique.size > 1) {
    throw new Error("Choose either --webpack or --turbopack, not both")
  }

  return {
    bundler: unique.values().next().value ?? "--webpack",
    forwardedArguments: arguments_.filter(
      (argument) => !["--turbo", "--turbopack", "--webpack"].includes(argument),
    ),
  }
}

async function main() {
  const guardEnvironment = loadDevelopmentGuardEnvironment()

  const oldSpaceLimitMb = parseMemoryLimit(
    guardEnvironment.oldSpaceLimit,
    defaultOldSpaceLimitMb,
    "NEXT_DEV_OLD_SPACE_MB",
  )
  const processTreeLimitMb = parseMemoryLimit(
    guardEnvironment.processTreeLimit,
    defaultProcessTreeLimitMb,
    "NEXT_DEV_MEMORY_LIMIT_MB",
  )
  if (oldSpaceLimitMb > processTreeLimitMb - 256) {
    throw new Error(
      "NEXT_DEV_OLD_SPACE_MB must leave at least 256 MiB for the rest of the V8 heap, native memory, and child processes",
    )
  }

  const { bundler, forwardedArguments } = resolveBundler(process.argv.slice(2))
  if (await alignDevBundlerCache(projectRoot, bundler)) {
    console.log(
      `[dev-guard] cleared the previous development cache before starting ${bundler.slice(2)}`,
    )
  }
  const supportsProcessTreeMonitoring = ["darwin", "linux"].includes(
    process.platform,
  )
  const child = spawn(
    process.execPath,
    [nextCli, "dev", bundler, ...forwardedArguments],
    {
      cwd: projectRoot,
      detached: supportsProcessTreeMonitoring,
      env: {
        ...process.env,
        NODE_OPTIONS: enforceHeapLimit(
          process.env.NODE_OPTIONS,
          oldSpaceLimitMb,
        ),
      },
      stdio: "inherit",
    },
  )

  console.log(
    `[dev-guard] ${bundler.slice(2)}; V8 old space <= ${oldSpaceLimitMb} MiB; process tree RSS <= ${processTreeLimitMb} MiB`,
  )

  let exitCode
  let isStopping = false
  let isSampling = false
  let warningPrinted = false
  let samplingErrorPrinted = false
  let forceKillTimer
  let monitor
  const signalHandlers = new Map()

  const cleanup = () => {
    if (monitor) clearInterval(monitor)
    if (forceKillTimer) clearTimeout(forceKillTimer)
    for (const [signal, handler] of signalHandlers) {
      process.off(signal, handler)
    }
    signalHandlers.clear()
  }

  const signalChild = (signal) => {
    if (!child.pid) return

    try {
      if (supportsProcessTreeMonitoring) {
        process.kill(-child.pid, signal)
      } else {
        child.kill(signal)
      }
    } catch (error) {
      if (error?.code !== "ESRCH") throw error
    }
  }

  const stopChild = (signal, requestedExitCode) => {
    if (isStopping) return
    isStopping = true
    exitCode = requestedExitCode
    if (monitor) clearInterval(monitor)
    signalChild(signal)
    forceKillTimer = setTimeout(() => signalChild("SIGKILL"), 5_000)
    forceKillTimer.unref()
  }

  for (const [signal, signalExitCode] of [
    ["SIGINT", 130],
    ["SIGTERM", 143],
    ["SIGHUP", 129],
  ]) {
    const handler = () => stopChild(signal, signalExitCode)
    signalHandlers.set(signal, handler)
    // npm and the terminal may both forward a signal. Keep the handler active
    // until the child exits so a duplicate signal cannot kill the wrapper
    // before its process-tree cleanup completes.
    process.on(signal, handler)
  }

  if (supportsProcessTreeMonitoring) {
    monitor = setInterval(async () => {
      if (isSampling || isStopping || !child.pid) return
      isSampling = true

      try {
        const rssKb = await readProcessTreeRssKb(child.pid)
        if (rssKb === 0 && child.exitCode === null) {
          throw new Error("the root Next.js process was not visible to the sampler")
        }
        const rssMb = rssKb / 1024
        if (!warningPrinted && rssMb >= processTreeLimitMb * 0.8) {
          warningPrinted = true
          console.warn(
            `[dev-guard] memory warning: ${rssMb.toFixed(0)} MiB of ${processTreeLimitMb} MiB`,
          )
        }

        if (rssMb > processTreeLimitMb) {
          console.error(
            `[dev-guard] stopped Next.js after the process tree exceeded ${processTreeLimitMb} MiB (${rssMb.toFixed(0)} MiB observed)`,
          )
          stopChild("SIGTERM", 1)
        }
      } catch (error) {
        if (!isStopping && !samplingErrorPrinted) {
          samplingErrorPrinted = true
          console.warn(`[dev-guard] could not sample memory: ${error.message}`)
        }
      } finally {
        isSampling = false
      }
    }, sampleIntervalMs)
    monitor.unref()
  }

  child.once("error", (error) => {
    console.error(`[dev-guard] failed to start Next.js: ${error.message}`)
    exitCode = 1
    cleanup()
    // A failed spawn emits `error`, but not `exit`. Set the process status here
    // so the wrapper cannot report a false success.
    process.exitCode = 1
  })

  child.once("exit", (code, signal) => {
    cleanup()
    process.exitCode = exitCode ?? code ?? (signal ? 1 : 0)
  })
}

const invokedPath = process.argv[1]
if (invokedPath && pathToFileURL(invokedPath).href === import.meta.url) {
  main().catch((error) => {
    console.error(`[dev-guard] ${error.message}`)
    process.exitCode = 1
  })
}
