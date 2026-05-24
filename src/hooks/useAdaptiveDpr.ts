"use client"

import { useMemo } from "react"

/**
 * Returns a clamped device pixel ratio suitable for Three.js rendering.
 * Detects low-power devices and caps DPR accordingly.
 *
 * @param min - Minimum DPR (default: 1)
 * @param max - Maximum DPR (default: 2)
 * @returns Clamped DPR value, or 1 during SSR
 */
export function useAdaptiveDpr(min = 1, max = 2): number {
  return useMemo(() => {
    if (typeof window === "undefined") return min

    const isLowPower =
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
      (navigator.deviceMemory !== undefined && navigator.deviceMemory <= 4)

    const effectiveMax = isLowPower ? Math.min(max, 1.5) : max
    return Math.min(Math.max(window.devicePixelRatio, min), effectiveMax)
  }, [min, max])
}
