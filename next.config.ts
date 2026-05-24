import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"
import createBundleAnalyzer from "@next/bundle-analyzer"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")
const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})

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
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
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

export default withBundleAnalyzer(withNextIntl(nextConfig))
