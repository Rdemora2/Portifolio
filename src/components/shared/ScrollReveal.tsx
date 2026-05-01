"use client"

import { useRef, useEffect, type ReactNode } from "react"
import { gsap } from "@/lib/gsap"

interface ScrollRevealProps {
  children: ReactNode
  animation?: "fade-up" | "fade-in" | "slide-left" | "slide-right" | "scale"
  delay?: number
  duration?: number
  threshold?: number
  className?: string
}

const ANIMATION_CONFIG = {
  "fade-up": { from: { y: 60, opacity: 0 }, to: { y: 0, opacity: 1 } },
  "fade-in": { from: { opacity: 0 }, to: { opacity: 1 } },
  "slide-left": { from: { x: -60, opacity: 0 }, to: { x: 0, opacity: 1 } },
  "slide-right": { from: { x: 60, opacity: 0 }, to: { x: 0, opacity: 1 } },
  "scale": { from: { scale: 0.8, opacity: 0 }, to: { scale: 1, opacity: 1 } },
}

export function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 0.8,
  threshold = 0.2,
  className = "",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) return

    const config = ANIMATION_CONFIG[animation]
    gsap.set(el, config.from)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          gsap.to(el, { ...config.to, duration, delay, ease: "power3.out" })
          observer.disconnect()
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [animation, delay, duration, threshold])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
