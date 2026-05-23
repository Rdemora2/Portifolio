"use client"

import { useEffect } from "react"

/**
 * Suppresses noisy Three.js warnings in development only.
 * Uses useEffect to avoid module-level side effects.
 */
export function SuppressWarnings() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      const originalWarn = console.warn
      console.warn = (...args: unknown[]) => {
        const msg = typeof args[0] === "string" ? args[0] : ""
        if (
          msg.includes("THREE") ||
          msg.includes("WebGL") ||
          msg.includes("WEBGL")
        ) {
          return
        }
        originalWarn.apply(console, args)
      }

      return () => {
        console.warn = originalWarn
      }
    }
  }, [])

  return null
}
