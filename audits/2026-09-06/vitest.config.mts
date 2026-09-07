import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("../../src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["audits/2026-09-06/contact-rate-limit-reproduction.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
  },
})
