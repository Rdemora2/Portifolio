"use client"

import { useRef, useEffect } from "react"

interface AnimatedTextProps {
  children: string
  as?: "h1" | "h2" | "h3" | "p" | "span"
  type: "split-chars" | "split-words" | "split-lines" | "reveal-line"
  stagger?: number
  delay?: number
  trigger?: "load" | "scroll"
  className?: string
  style?: React.CSSProperties
}

export function AnimatedText({
  children,
  as: Tag = "p",
  type,
  stagger = 0.035,
  delay = 0,
  trigger = "scroll",
  className = "",
  style,
}: AnimatedTextProps) {
  const containerRef = useRef<HTMLElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el || hasAnimated.current) return

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) return

    const animate = async () => {
      if (hasAnimated.current) return
      hasAnimated.current = true

      const mod = await import("@/lib/gsap")
      const { gsap } = mod

      if (type === "reveal-line") {
        gsap.fromTo(
          el,
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", duration: 1.2, delay, ease: "power3.out" }
        )
        return
      }

      const splitType = type === "split-chars" ? "" : type === "split-words" ? " " : "\n"
      const text = el.textContent ?? ""

      if (type === "split-chars") {
        el.innerHTML = ""
        text.split("").forEach((char) => {
          const span = document.createElement("span")
          span.style.display = "inline-block"
          span.style.willChange = "transform, opacity"
          span.textContent = char === " " ? "\u00A0" : char
          el.appendChild(span)
        })

        gsap.fromTo(
          el.children,
          { y: 120, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.2, stagger, delay, ease: "power3.out" }
        )
      } else if (type === "split-words") {
        el.innerHTML = ""
        text.split(splitType).forEach((word) => {
          const span = document.createElement("span")
          span.style.display = "inline-block"
          span.style.willChange = "transform, opacity"
          span.style.marginRight = "0.3em"
          span.textContent = word
          el.appendChild(span)
        })

        gsap.fromTo(
          el.children,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger, delay, ease: "power3.out" }
        )
      } else {
        gsap.fromTo(
          el,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, delay, ease: "power3.out" }
        )
      }
    }

    if (trigger === "load") {
      void animate()
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void animate()
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [type, stagger, delay, trigger])

  return (
    <Tag
      ref={containerRef as React.RefObject<HTMLHeadingElement & HTMLParagraphElement & HTMLSpanElement>}
      className={className}
      style={{ ...style, opacity: trigger === "load" ? 0 : undefined }}
    >
      {children}
    </Tag>
  )
}
