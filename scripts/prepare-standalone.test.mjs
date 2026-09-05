import { execFile } from "node:child_process"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { promisify } from "node:util"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

const execFileAsync = promisify(execFile)
const scriptPath = join(import.meta.dirname, "prepare-standalone.mjs")

describe("prepare-standalone", () => {
  let projectDir

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), "portfolio-standalone-"))
  })

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true })
  })

  it("defers deployment output to Vercel's native adapter", async () => {
    const { stdout } = await execFileAsync(process.execPath, [scriptPath], {
      cwd: projectDir,
      env: { ...process.env, VERCEL: "1" },
    })

    expect(stdout).toContain("Vercel's Next adapter owns deployment output")
  })

  it("still requires a complete standalone artifact outside Vercel", async () => {
    const env = { ...process.env }
    delete env.VERCEL

    await expect(
      execFileAsync(process.execPath, [scriptPath], {
        cwd: projectDir,
        env,
      }),
    ).rejects.toMatchObject({
      stderr: expect.stringContaining("missing server.js"),
    })
  })
})
