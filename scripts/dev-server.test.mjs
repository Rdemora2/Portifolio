import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import {
  alignDevBundlerCache,
  calculateProcessTreeRssKb,
  enforceHeapLimit,
  loadDevelopmentGuardEnvironment,
  parseMemoryLimit,
  parseLinuxProcessStatus,
  readActiveNextDevelopmentPid,
} from "./dev-server.mjs"

const temporaryDirectories = []

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

describe("development server memory guard", () => {
  it("accepts bounded integer limits and rejects unsafe values", () => {
    expect(parseMemoryLimit(undefined, 1536, "LIMIT")).toBe(1536)
    expect(parseMemoryLimit("2048", 1536, "LIMIT")).toBe(2048)
    expect(() => parseMemoryLimit("511", 1536, "LIMIT")).toThrow(
      "between 512 and 4096 MiB",
    )
    expect(() => parseMemoryLimit("6gb", 1536, "LIMIT")).toThrow(
      "integer number of MiB",
    )
  })

  it("replaces inherited V8 heap limits without discarding other options", () => {
    expect(enforceHeapLimit("--inspect --max-old-space-size=4096", 1536)).toBe(
      "--inspect --max-old-space-size=1536",
    )
    expect(enforceHeapLimit("--max_old_space_size 3072 --trace-warnings", 1024)).toBe(
      "--trace-warnings --max-old-space-size=1024",
    )
  })

  it("sums only the root process and its recursive descendants", () => {
    const processTable = `
      10 1 100
      11 10 200
      12 11 300
      13 99 900
    `

    expect(calculateProcessTreeRssKb(processTable, 10)).toBe(600)
  })

  it("reads Linux process ancestry and resident memory from procfs", () => {
    expect(
      parseLinuxProcessStatus(`
        Name:\tnext-server
        Pid:\t42
        PPid:\t21
        VmRSS:\t65536 kB
      `),
    ).toEqual({ pid: 42, parentPid: 21, rssKb: 65536 })
    expect(parseLinuxProcessStatus("Name:\tincomplete")).toBeNull()
  })

  it("loads guard values without leaking dotenv state into the Next child", async () => {
    const root = await mkdtemp(join(tmpdir(), "portfolio-dev-env-"))
    temporaryDirectories.push(root)
    await writeFile(
      join(root, ".env.development.local"),
      [
        "NEXT_DEV_OLD_SPACE_MB=1024",
        "NEXT_DEV_MEMORY_LIMIT_MB=1536",
        "PORTFOLIO_DEV_ENV_LEAK=must-not-leak",
      ].join("\n"),
    )

    const originalNodeEnvironment = process.env.NODE_ENV
    process.env.NODE_ENV = "development"
    try {
      expect(loadDevelopmentGuardEnvironment(root)).toEqual({
        oldSpaceLimit: "1024",
        processTreeLimit: "1536",
      })
      expect(process.env.PORTFOLIO_DEV_ENV_LEAK).toBeUndefined()
      expect(process.env.__NEXT_PROCESSED_ENV).toBeUndefined()
    } finally {
      if (originalNodeEnvironment === undefined) {
        delete process.env.NODE_ENV
      } else {
        process.env.NODE_ENV = originalNodeEnvironment
      }
    }
  })

  it("keeps one development bundler cache at a time", async () => {
    const root = await mkdtemp(join(tmpdir(), "portfolio-dev-cache-"))
    temporaryDirectories.push(root)

    await expect(alignDevBundlerCache(root, "--webpack")).resolves.toBe(true)
    await mkdir(join(root, ".next", "dev"), { recursive: true })
    await writeFile(join(root, ".next", "dev", "webpack-artifact"), "cached")
    await expect(alignDevBundlerCache(root, "--webpack")).resolves.toBe(false)
    await expect(alignDevBundlerCache(root, "--turbopack")).resolves.toBe(true)
    await expect(
      readFile(join(root, ".next", "dev", "webpack-artifact"), "utf8"),
    ).rejects.toMatchObject({ code: "ENOENT" })
  })

  it("keeps the bundler marker in Next-preserved shared cache", async () => {
    const root = await mkdtemp(join(tmpdir(), "portfolio-dev-marker-"))
    temporaryDirectories.push(root)

    await alignDevBundlerCache(root, "--webpack")
    await mkdir(join(root, ".next", "dev"), { recursive: true })
    await writeFile(join(root, ".next", "dev", "transient"), "artifact")
    await rm(join(root, ".next", "dev"), { recursive: true, force: true })

    await expect(alignDevBundlerCache(root, "--webpack")).resolves.toBe(false)
    await expect(
      readFile(
        join(root, ".next", "cache", ".portfolio-bundler"),
        "utf8",
      ),
    ).resolves.toBe("--webpack\n")
  })

  it("refuses to touch the cache while a Next dev process is alive", async () => {
    const root = await mkdtemp(join(tmpdir(), "portfolio-dev-lock-"))
    temporaryDirectories.push(root)
    await mkdir(join(root, ".next", "dev"), { recursive: true })
    await writeFile(
      join(root, ".next", "dev", "lock"),
      JSON.stringify({ pid: process.pid }),
    )

    await expect(
      readActiveNextDevelopmentPid(root, (pid) => pid === process.pid),
    ).resolves.toBe(process.pid)
    await expect(alignDevBundlerCache(root, "--webpack")).rejects.toThrow(
      "is already running",
    )
  })
})
