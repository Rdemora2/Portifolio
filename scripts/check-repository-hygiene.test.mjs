import { execFileSync, spawnSync } from "node:child_process"
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

const root = fileURLToPath(new URL("../", import.meta.url))
const script = join(root, "scripts/check-repository-hygiene.mjs")
let fixture

function git(...args) {
  return execFileSync("git", args, { cwd: fixture, stdio: "pipe" })
}

function write(path, content = "fixture") {
  const target = join(fixture, path)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, content)
}

function check() {
  return spawnSync(process.execPath, [script], { cwd: fixture, encoding: "utf8" })
}

beforeEach(() => {
  mkdirSync(join(root, "audits"), { recursive: true })
  fixture = mkdtempSync(join(root, "audits/hygiene-test-"))
  git("init", "--quiet")
  write(".gitignore", readFileSync(join(root, ".gitignore")))
  git("add", ".gitignore")
})

afterEach(() => rmSync(fixture, { recursive: true, force: true }))

describe("repository hygiene with a real Git index", () => {
  it("allows site assets and leaves local audit evidence untracked", () => {
    write("public/images/brands/logo.png")
    write("audits/review/screenshot.png")
    git("add", ".")
    expect(check().status).toBe(0)
    expect(git("ls-files").toString()).toContain("public/images/brands/logo.png")
    expect(git("ls-files").toString()).not.toContain("audits/")
  })

  it.each([
    "audits/review/screenshot.png",
    "audits/review/report.json",
    "audits/review/trace.zip",
    "playwright-report/index.html",
    "test-results/video.webm",
    "coverage/coverage-final.json",
    "container-sbom.cdx.json",
    ".portfolio-pr-body.tmp",
  ])("rejects a force-added artifact: %s", (path) => {
    write(path)
    git("add", "--force", "--", path)
    const result = check()
    expect(result.status).toBe(1)
    expect(result.stderr).toContain(path)
    git("rm", "--cached", "--", path)
    expect(check().status).toBe(0)
  })
})
