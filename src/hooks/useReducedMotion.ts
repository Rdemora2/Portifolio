"use client"

import { useSyncExternalStore } from "react"

const subscribe = (callback: () => void) => {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

const getSnapshot = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
const getServerSnapshot = () => false

/**
 * Reactive hook for `prefers-reduced-motion` media query.
 * Uses useSyncExternalStore to avoid hydration mismatches and cascading renders.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
