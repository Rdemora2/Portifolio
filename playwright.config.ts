import { createHash } from "node:crypto"
import { defineConfig, devices } from "@playwright/test"

const port = Number(process.env.PORT ?? 3100)
const localBaseUrl = `http://localhost:${port}`
const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL ?? localBaseUrl
const startsLocalServer = !process.env.PLAYWRIGHT_TEST_BASE_URL
const productionSiteUrl = "https://portifolio-liard-zeta.vercel.app"
const fixtureDigest = (scope: string) =>
  createHash("sha256").update(`portfolio-playwright-${scope}`).digest("hex")

// Keep the production allowlist strict. The API E2E sends this Origin explicitly
// instead of weakening runtime validation to admit an HTTP loopback origin.
const productionFixtureEnv = {
  NEXT_PUBLIC_SITE_URL: productionSiteUrl,
  RESEND_API_KEY: `re_${fixtureDigest("resend")}`,
  CONTACT_FROM_EMAIL: "portfolio-ci@robertomoraes.dev",
  CONTACT_TO_EMAIL: "quality-ci@robertomoraes.dev",
  CONTACT_IDEMPOTENCY_SECRET: fixtureDigest("idempotency"),
  CONTACT_ALLOWED_ORIGINS: productionSiteUrl,
  CONTACT_TRUST_PROXY: "false",
} satisfies Record<string, string>

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  failOnFlakyTests: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  timeout: 60_000,
  expect: { timeout: 7_500 },
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    locale: "pt-BR",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: process.env.CI ? "off" : "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      testIgnore: /(?:browser-smoke|mobile-smoke|webgl-disabled)\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium-webgl-disabled",
      testMatch: /webgl-disabled\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        contextOptions: { reducedMotion: "no-preference" },
        launchOptions: {
          args: ["--disable-webgl"],
        },
      },
    },
    {
      name: "firefox-smoke",
      testMatch: /browser-smoke\.spec\.ts/,
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit-smoke",
      testMatch: /browser-smoke\.spec\.ts/,
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "chromium-mobile-smoke",
      testMatch: /mobile-smoke\.spec\.ts/,
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "webkit-mobile-smoke",
      testMatch: /mobile-smoke\.spec\.ts/,
      use: { ...devices["iPhone 15"] },
    },
  ],
  webServer: startsLocalServer
    ? {
        command: "npm run start",
        url: localBaseUrl,
        reuseExistingServer: false,
        timeout: 60_000,
        env: {
          ...process.env,
          ...productionFixtureEnv,
          HOSTNAME: "localhost",
          PORT: String(port),
        },
      }
    : undefined,
})
