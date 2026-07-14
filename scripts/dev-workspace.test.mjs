import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import {
  createDependencyFingerprint,
  developmentFingerprintMarker,
  resetNextCacheIfStale,
} from "./dev-workspace.mjs"

const temporaryDirectories = []

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

describe("Docker development workspace", () => {
  it("fingerprints the lockfile and dependency runtime deterministically", () => {
    const input = {
      lockfile: "lockfile",
      packageManifest: '{"packageManager":"npm@11.16.0"}',
      npmConfiguration: "engine-strict=true",
      nodeVersion: "v24.18.0",
      platform: "linux",
      architecture: "arm64",
    }

    expect(createDependencyFingerprint(input)).toBe(
      createDependencyFingerprint(input),
    )
    expect(
      createDependencyFingerprint({ ...input, nodeVersion: "v24.19.0" }),
    ).not.toBe(createDependencyFingerprint(input))
    expect(
      createDependencyFingerprint({
        ...input,
        packageManifest: `${input.packageManifest}\n`,
      }),
    ).not.toBe(createDependencyFingerprint(input))
    expect(
      createDependencyFingerprint({
        ...input,
        npmConfiguration: "engine-strict=false",
      }),
    ).not.toBe(createDependencyFingerprint(input))
  })

  it("removes an incompatible Next cache and preserves a matching one", async () => {
    const root = await mkdtemp(join(tmpdir(), "portfolio-dev-workspace-"))
    temporaryDirectories.push(root)
    const nextDirectory = join(root, ".next")
    await mkdir(nextDirectory)
    await writeFile(join(nextDirectory, "stale-artifact"), "stale")
    await writeFile(
      join(nextDirectory, developmentFingerprintMarker),
      "previous\n",
    )
    const directoryBeforeReset = await stat(nextDirectory)

    await expect(resetNextCacheIfStale(root, "current")).resolves.toBe(true)
    const directoryAfterReset = await stat(nextDirectory)
    expect(directoryAfterReset.ino).toBe(directoryBeforeReset.ino)
    await expect(
      readFile(join(nextDirectory, "stale-artifact"), "utf8"),
    ).rejects.toMatchObject({ code: "ENOENT" })
    await expect(
      readFile(join(nextDirectory, developmentFingerprintMarker), "utf8"),
    ).resolves.toBe("current\n")
    await expect(resetNextCacheIfStale(root, "current")).resolves.toBe(false)
  })
})
