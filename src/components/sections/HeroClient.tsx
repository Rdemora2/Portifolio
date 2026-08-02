"use client"

import dynamic from "next/dynamic"
import { useSyncExternalStore } from "react"

import { useInView } from "@/hooks/useInView"
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
  "(pointer: coarse)",
  "(max-width: 1023px)",
] as const

// WHY: Privacy-focused browsers like Brave and Firefox randomize or limit navigator.hardwareConcurrency
// and deviceMemory to mitigate fingerprinting vectors. We check for privacy browser signatures so
// valid desktop users on these platforms aren't falsely flagged as low-power.
function canRenderSignatureEffect(isBotHint: boolean) {
  // The server already detected a bot via the real HTTP User-Agent header.
  // Short-circuit immediately — no need to evaluate any client-side signals.
  if (isBotHint) return false

  const connection = (navigator as NavigatorWithConnection).connection
  const isBrave = typeof navigator !== "undefined" && "brave" in navigator
  const isFirefox = typeof navigator !== "undefined" && navigator.userAgent.toLowerCase().includes("firefox")
  const isPrivacyBrowser = isBrave || isFirefox

  const isLowPower = !isPrivacyBrowser && (
    (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4) ||
    (navigator.deviceMemory !== undefined && navigator.deviceMemory <= 4)
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

export function HeroClientWrapper({
  children,
  isBotHint = false,
}: {
  children: React.ReactNode
  isBotHint?: boolean
}) {
  const [sectionRef, isInView] = useInView<HTMLElement>({
    threshold: 0,
    rootMargin: "0px",
    triggerOnce: false,
  })
  const canRender = useSyncExternalStore(
    subscribeToCapabilities,
    () => canRenderSignatureEffect(isBotHint),
    () => false,
  )

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative flex min-h-dvh items-center overflow-hidden"
    >
      <div
        className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_64%_28%,rgba(99,102,241,0.15),transparent_34%),linear-gradient(180deg,#050a12_0%,#07101a_52%,#050a12_100%)]"
        aria-hidden="true"
      >
        {canRender && isInView ? (
          <WebGLErrorBoundary>
            <LiquidChrome
              baseColor={[0.08, 0.08, 0.22]}
              speed={0.2}
              amplitude={0.35}
              frequencyX={2.5}
              frequencyY={2.5}
              interactive
              dpr={1}
            />
          </WebGLErrorBoundary>
        ) : null}
      </div>

      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at 40% 50%, rgba(5,10,18,0.36) 0%, rgba(5,10,18,0.78) 58%, rgba(5,10,18,0.97) 100%)",
        }}
        aria-hidden="true"
      />

      {children}

      <div
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[var(--color-text-muted)]"
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
