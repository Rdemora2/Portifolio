"use client"

import { useState, useEffect, useRef } from "react"
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

  useEffect(() => {
    if (!trigger || hasRun.current) return
    hasRun.current = true

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) {
      setDisplay(text)
      return
    }

    let frame = 0
    const totalFrames = text.length * 2
    let rafId: number

    const tick = () => {
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
        rafId = requestAnimationFrame(() => {
          setTimeout(tick, speed)
        })
      } else {
        setDisplay(text)
      }
    }

    tick()

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [trigger, text, speed])

  return <span className={className}>{display}</span>
}
