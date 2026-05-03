"use client"

import { useRef, useEffect, useState, useCallback } from "react"

export function CustomCursor() {
  const innerRef = useRef<HTMLDivElement>(null)
  const outerRef = useRef<HTMLDivElement>(null)
  const mousePos = useRef({ x: 0, y: 0 })
  const outerPos = useRef({ x: 0, y: 0 })
  const [cursorState, setCursorState] = useState<"default" | "hover-link" | "hover-button">("default")
  const [isVisible, setIsVisible] = useState(false)
  const isVisibleRef = useRef(false)

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0
    if (isTouchDevice) return

    // Add cursor-hide class to body
    document.body.classList.add("custom-cursor-active")

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
      if (!isVisibleRef.current) {
        isVisibleRef.current = true
        setIsVisible(true)
      }
      if (innerRef.current) {
        innerRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`
      }
    }

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest("a") || target.closest("[role='link']")) {
        setCursorState("hover-link")
      } else if (target.closest("button") || target.closest("[role='button']")) {
        setCursorState("hover-button")
      } else {
        setCursorState("default")
      }
    }

    const onMouseLeave = () => {
      isVisibleRef.current = false
      setIsVisible(false)
    }
    const onMouseEnter = () => {
      isVisibleRef.current = true
      setIsVisible(true)
    }

    let rafId: number
    const lerp = () => {
      outerPos.current.x += (mousePos.current.x - outerPos.current.x) * 0.12
      outerPos.current.y += (mousePos.current.y - outerPos.current.y) * 0.12
      if (outerRef.current) {
        outerRef.current.style.transform = `translate(${outerPos.current.x - 12}px, ${outerPos.current.y - 12}px)`
      }
      rafId = requestAnimationFrame(lerp)
    }
    rafId = requestAnimationFrame(lerp)

    window.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseover", onMouseOver)
    document.addEventListener("mouseleave", onMouseLeave)
    document.addEventListener("mouseenter", onMouseEnter)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseover", onMouseOver)
      document.removeEventListener("mouseleave", onMouseLeave)
      document.removeEventListener("mouseenter", onMouseEnter)
      document.body.classList.remove("custom-cursor-active")
    }
  }, [])

  const scaleMap = {
    default: 1,
    "hover-link": 1.5,
    "hover-button": 2,
  }

  const outerScale = scaleMap[cursorState]
  const outerSize = 24 * outerScale
  const outerOffset = -(outerSize - 24) / 2

  return (
    <>
      <div
        ref={innerRef}
        className="pointer-events-none fixed top-0 left-0 z-[10000] rounded-full"
        style={{
          width: 8,
          height: 8,
          backgroundColor: "var(--color-signal)",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.3s",
        }}
        aria-hidden="true"
      />
      <div
        ref={outerRef}
        className="pointer-events-none fixed top-0 left-0 z-[10000] rounded-full border"
        style={{
          width: outerSize,
          height: outerSize,
          borderColor: cursorState === "hover-link" ? "var(--color-signal)" : "var(--color-signal)",
          backgroundColor: cursorState === "hover-link" ? "rgba(99,102,241,0.08)" : "transparent",
          opacity: isVisible ? 0.5 : 0,
          transition: "opacity 0.3s, width 0.3s, height 0.3s, margin 0.3s, border-color 0.3s, background-color 0.3s",
          marginLeft: outerOffset,
          marginTop: outerOffset,
          mixBlendMode: cursorState === "hover-button" ? "difference" : "normal",
        }}
        aria-hidden="true"
      />
    </>
  )
}
