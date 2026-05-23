"use client"

import { useState, useEffect, useRef } from "react"

interface MousePosition {
  x: number
  y: number
}

/**
 * Tracks mouse position throttled via requestAnimationFrame
 * to avoid excessive re-renders from raw mousemove events (~60/s).
 */
export function useMousePosition(): MousePosition {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 })
  const rafId = useRef(0)
  const latest = useRef<MousePosition>({ x: 0, y: 0 })

  useEffect(() => {
    let scheduled = false

    const handler = (e: MouseEvent) => {
      latest.current = { x: e.clientX, y: e.clientY }

      if (!scheduled) {
        scheduled = true
        rafId.current = requestAnimationFrame(() => {
          setPosition(latest.current)
          scheduled = false
        })
      }
    }

    window.addEventListener("mousemove", handler, { passive: true })
    return () => {
      window.removeEventListener("mousemove", handler)
      cancelAnimationFrame(rafId.current)
    }
  }, [])

  return position
}
