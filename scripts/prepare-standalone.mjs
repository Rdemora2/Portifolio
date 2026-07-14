import { cp, mkdir, readdir, rm, stat } from "node:fs/promises"
import { dirname, join } from "node:path"

const root = process.cwd()
const standalone = join(root, ".next", "standalone")

async function assertFile(path, label) {
  let metadata
  try {
    metadata = await stat(path)
  } catch (error) {
    throw new Error(`Standalone build is incomplete: missing ${label} at ${path}`, {
      cause: error,
    })
  }

  if (!metadata.isFile()) {
    throw new Error(`Standalone build is incomplete: ${label} is not a file at ${path}`)
  }
}

async function assertNonEmptyDirectory(path, label) {
  let entries
  try {
    entries = await readdir(path)
  } catch (error) {
    throw new Error(`Standalone build is incomplete: missing ${label} at ${path}`, {
      cause: error,
    })
  }

  if (entries.length === 0) {
    throw new Error(`Standalone build is incomplete: ${label} is empty at ${path}`)
  }
}

async function copyDirectory(source, destination, { optional = false } = {}) {
  try {
    const metadata = await stat(source)
    if (!metadata.isDirectory()) {
      throw new Error(`Expected a directory at ${source}`)
    }
  } catch (error) {
    if (optional && error?.code === "ENOENT") return false
    throw error
  }

  await mkdir(dirname(destination), { recursive: true })
  await rm(destination, { recursive: true, force: true })
  await cp(source, destination, { recursive: true, force: true })
  return true
}

await assertFile(join(standalone, "server.js"), "server.js")

await copyDirectory(join(root, "public"), join(standalone, "public"), {
  optional: true,
})

const standaloneStatic = join(standalone, ".next", "static")
await copyDirectory(join(root, ".next", "static"), standaloneStatic)
await assertNonEmptyDirectory(standaloneStatic, "static assets")

console.log("Standalone assets prepared.")
