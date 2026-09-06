"use client"

import dynamic from "next/dynamic"
import { useSyncExternalStore } from "react"

import { isBot } from "@/lib/is-bot"
import { WebGLErrorBoundary } from "@/components/shared/WebGLErrorBoundary"

// WHY: LiquidChrome is dynamically imported with ssr:false because WebGL APIs
// (canvas.getContext) are browser-only and should never execute on Node server workers.
const LiquidChrome = dynamic(
  () => import("@/components/shared/LiquidChrome"),
  { ssr: false },
)

type NavigatorWithConnection = Navigator & {
  connection?: EventTarget & { saveData?: boolean }
  brave?: unknown
}

const mediaQueries = [
  "(prefers-reduced-motion: reduce)",
] as const

const LIQUID_CHROME_BASE_COLOR: [number, number, number] = [0.10, 0.12, 0.28]

// WHY: Privacy-focused browsers like Brave and Firefox randomize or limit navigator.hardwareConcurrency
// and deviceMemory to mitigate fingerprinting vectors. Similarly, WebKit on iOS clamps hardwareConcurrency to 4.
// We guard against false low-power positives so mobile and privacy-browser users experience the authentic WebGL fluid.
function canRenderSignatureEffect(isBotHint: boolean) {
  if (isBotHint) return false

  const connection = (navigator as NavigatorWithConnection).connection
  const isBrave = typeof navigator !== "undefined" && "brave" in navigator
  const isFirefox = typeof navigator !== "undefined" && navigator.userAgent.toLowerCase().includes("firefox")
  const isWebKit = typeof navigator !== "undefined" && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.vendor && navigator.vendor.includes("Apple")))
  const isPrivacyOrApple = isBrave || isFirefox || isWebKit

  const isLowPower = !isPrivacyOrApple && (
    (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency < 4) ||
    (navigator.deviceMemory !== undefined && navigator.deviceMemory < 4)
  )

  const _isBot = isBot()

  return (
    document.visibilityState === "visible" &&
    !connection?.saveData &&
    !isLowPower &&
    !_isBot &&
    mediaQueries.every((query) => !window.matchMedia(query).matches)
  )
}

function subscribeToCapabilities(onChange: () => void) {
  const queryLists = mediaQueries.map((query) => window.matchMedia(query))
  const connection = (navigator as NavigatorWithConnection).connection

  queryLists.forEach((query) => query.addEventListener("change", onChange))
  connection?.addEventListener("change", onChange)
  document.addEventListener("visibilitychange", onChange)

  return () => {
    queryLists.forEach((query) => query.removeEventListener("change", onChange))
    connection?.removeEventListener("change", onChange)
    document.removeEventListener("visibilitychange", onChange)
  }
}

function getIsPointerFine(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(pointer: fine)").matches
}

function subscribeToPointerFine(onChange: () => void) {
  if (typeof window === "undefined") return () => {}
  const mql = window.matchMedia("(pointer: fine)")
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

export function HeroClientWrapper({
  children,
  isBotHint = false,
}: {
  children: React.ReactNode
  isBotHint?: boolean
}) {
  const canRender = useSyncExternalStore(
    subscribeToCapabilities,
    () => canRenderSignatureEffect(isBotHint),
    () => false,
  )

  const isPointerFine = useSyncExternalStore(
    subscribeToPointerFine,
    getIsPointerFine,
    () => false,
  )

  return (
    <section
      id="hero"
      className="site-home-hero relative flex items-center overflow-hidden"
      data-home-hero
    >
      <div
        className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_64%_28%,rgba(99,102,241,0.15),transparent_34%),linear-gradient(180deg,#050a12_0%,#07101a_52%,#050a12_100%)]"
        aria-hidden="true"
      >
        {canRender ? (
          <WebGLErrorBoundary>
            <LiquidChrome
              baseColor={LIQUID_CHROME_BASE_COLOR}
              speed={0.2}
              amplitude={0.35}
              frequencyX={2.5}
              frequencyY={2.5}
              interactive={isPointerFine}
              dpr={1}
            />
          </WebGLErrorBoundary>
        ) : null}
      </div>

      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 40% 50%, rgba(5,10,18,0.25) 0%, rgba(5,10,18,0.70) 60%, rgba(5,10,18,0.95) 100%)",
        }}
        aria-hidden="true"
      />

      {children}

      <div
        className="home-scroll-cue absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[var(--color-text-muted)]"
        data-home-scroll-cue
        aria-hidden="true"
      >
        <span
          className="text-sm leading-none"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ↓
        </span>
        <div className="h-10 w-px animate-scroll-indicator bg-[var(--color-signal)] opacity-50" />
      </div>
    </section>
  )
}
