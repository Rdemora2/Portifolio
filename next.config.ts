import type { NextConfig } from "next"
import { PHASE_PRODUCTION_BUILD } from "next/constants"
import createNextIntlPlugin from "next-intl/plugin"
import createBundleAnalyzer from "@next/bundle-analyzer"
import { assertProductionBuildEnv } from "./src/lib/production-env"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")
const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})

const isDevelopment = process.env.NODE_ENV === "development"
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self' data:",
  `connect-src 'self'${isDevelopment ? " ws: wss:" : ""}`,
  "media-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(!isDevelopment ? ["upgrade-insecure-requests"] : []),
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Origin-Agent-Cluster", value: "?1" },
  ...(!isDevelopment
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: securityHeaders,
    },
    {
      source: "/favicon.ico",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=86400, stale-while-revalidate=604800",
        },
      ],
    },
  ],
  turbopack: {},
  experimental: {
    optimizePackageImports: ["three", "gsap", "lenis", "@react-three/fiber", "@react-three/drei"],
  },
  output: "standalone",
}

export default function createNextConfig(phase: string): NextConfig {
  if (phase === PHASE_PRODUCTION_BUILD) {
    assertProductionBuildEnv(process.env)
  }

  return withBundleAnalyzer(withNextIntl(nextConfig))
}
