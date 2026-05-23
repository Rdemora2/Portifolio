"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { SCRAMBLE_CHARS } from "@/lib/constants"

interface TextScrambleProps {
  text: string
  trigger?: boolean
  speed?: number
  className?: string
}

export function TextScramble({
  text,
  trigger = false,
  speed = 30,
  className = "",
}: TextScrambleProps) {
  const [display, setDisplay] = useState(text)
  const hasRun = useRef(false)
  const prefersReduced = useMemo(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])
  const displayValue = !trigger || prefersReduced ? text : display

  useEffect(() => {
    if (!trigger || hasRun.current || prefersReduced) return
    hasRun.current = true

    let frame = 0
    const totalFrames = text.length * 2
    let rafId = 0
    let lastTime = 0

    const tick = (time: number) => {
      if (!lastTime) lastTime = time
      if (time - lastTime < speed) {
        rafId = requestAnimationFrame(tick)
        return
      }

      lastTime = time
      const progress = frame / totalFrames
      const resolved = Math.floor(progress * text.length)

      let result = ""
      for (let i = 0; i < text.length; i++) {
        if (i < resolved) {
          result += text[i]
        } else {
          result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
        }
      }

      setDisplay(result)
      frame++

      if (frame <= totalFrames) {
        rafId = requestAnimationFrame(tick)
      } else {
        setDisplay(text)
      }
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [trigger, text, speed, prefersReduced])

  return <span className={className}>{displayValue}</span>
}
