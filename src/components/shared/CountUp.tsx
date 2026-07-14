"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"

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

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)")
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
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
  const currentValueRef = useRef(0)
  const rafRef = useRef<number>(0)
  const prefersReduced = useSyncExternalStore(
    subscribeToReducedMotion,
    prefersReducedMotion,
    () => false,
  )
  const displayValue = prefersReduced && trigger ? end.toFixed(decimals) : display

  useEffect(() => {
    if (!trigger || prefersReduced) return

    const startTime = performance.now()
    const durationMs = duration * 1000
    const startValue = currentValueRef.current
    const remaining = end - startValue

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(Math.max(elapsed / durationMs, 0), 1)
      const easedProgress = easeOutExpo(progress)
      const current = startValue + easedProgress * remaining
      currentValueRef.current = current
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
