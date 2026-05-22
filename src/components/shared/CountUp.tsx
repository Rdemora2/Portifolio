"use client"

import { useState, useEffect, useMemo, useRef } from "react"

interface CountUpProps {
  end: number
  suffix?: string
  prefix?: string
  duration?: number
  decimals?: number
  trigger?: boolean
  className?: string
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

export function CountUp({
  end,
  suffix = "",
  prefix = "",
  duration = 2.5,
  decimals = 0,
  trigger = false,
  className = "",
}: CountUpProps) {
  const [display, setDisplay] = useState("0")
  const hasRun = useRef(false)
  const rafRef = useRef<number>(0)
  const prefersReduced = useMemo(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])
  const displayValue = prefersReduced && trigger ? end.toFixed(decimals) : display

  useEffect(() => {
    if (!trigger || hasRun.current || prefersReduced) return
    hasRun.current = true

    const startTime = performance.now()
    const durationMs = duration * 1000

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      const easedProgress = easeOutExpo(progress)
      const current = easedProgress * end
      setDisplay(current.toFixed(decimals))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [trigger, end, duration, decimals, prefersReduced])

  return (
    <span className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  )
}
