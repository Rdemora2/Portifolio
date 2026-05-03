"use client"

import { useRef, useEffect, type ReactNode } from "react"

interface MagneticButtonProps {
  children: ReactNode
  strength?: number
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  href?: string
  type?: "button" | "submit"
  disabled?: boolean
  ariaLabel?: string
}

export function MagneticButton({
  children,
  strength = 0.3,
  className = "",
  style,
  onClick,
  href,
  type = "button",
  disabled = false,
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null)
  const rectRef = useRef<DOMRect | null>(null)
  const gsapRef = useRef<null | { gsap: typeof import("gsap").gsap }>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let rafId = 0
    const updateRect = () => {
      rectRef.current = el.getBoundingClientRect()
    }

    updateRect()

    const handleScroll = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = 0
        updateRect()
      })
    }

    const resizeObserver = new ResizeObserver(() => updateRect())
    resizeObserver.observe(el)
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", updateRect)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", updateRect)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  const ensureGsap = async () => {
    if (gsapRef.current) return gsapRef.current
    const mod = await import("@/lib/gsap")
    gsapRef.current = mod
    return mod
  }

  const handleMouseMove = async (e: React.MouseEvent) => {
    if (!ref.current || disabled) return
    const rect = rectRef.current
    if (!rect) return
    const x = (e.clientX - rect.left - rect.width / 2) * strength
    const y = (e.clientY - rect.top - rect.height / 2) * strength
    const mod = await ensureGsap()
    mod?.gsap.to(ref.current, { x, y, duration: 0.3, ease: "power2.out" })
  }

  const handleMouseLeave = async () => {
    if (!ref.current) return
    const mod = await ensureGsap()
    mod?.gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" })
  }

  const commonProps = {
    className: `inline-flex items-center justify-center gap-2 transition-colors ${className}`,
    style,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    "aria-label": ariaLabel,
  }

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        {...commonProps}
      >
        {children}
      </a>
    )
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...commonProps}
    >
      {children}
    </button>
  )
}
