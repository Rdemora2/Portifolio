"use client"

import { useState, useEffect, useRef } from "react"

/**
 * Tracks page scroll progress (0 → 1) throttled via requestAnimationFrame.
 * Uses passive scroll listener for optimal performance.
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0)
  const rafId = useRef(0)

  useEffect(() => {
    let scheduled = false

    const handler = () => {
      if (!scheduled) {
        scheduled = true
        rafId.current = requestAnimationFrame(() => {
          const scrollTop = window.scrollY
          const docHeight = document.documentElement.scrollHeight - window.innerHeight
          setProgress(docHeight > 0 ? scrollTop / docHeight : 0)
          scheduled = false
        })
      }
    }

    window.addEventListener("scroll", handler, { passive: true })
    return () => {
      window.removeEventListener("scroll", handler)
      cancelAnimationFrame(rafId.current)
    }
  }, [])

  return progress
}
