"use client"

import { useEffect, useRef } from "react"

export function useGSAP(callback: (ctx: { add: (callback: () => void) => void }) => void, deps: React.DependencyList = []) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    let ctx: { revert: () => void } | null = null
    let isActive = true

    const run = async () => {
      const mod = await import("@/lib/gsap")
      if (!isActive) return
      ctx = mod.gsap.context((self) => {
        callback(self as { add: (callback: () => void) => void })
      }, ref)
    }

    run()

    return () => {
      isActive = false
      ctx?.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}
