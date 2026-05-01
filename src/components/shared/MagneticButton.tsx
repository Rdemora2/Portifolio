"use client"

import { useRef, type ReactNode } from "react"
import { gsap } from "@/lib/gsap"

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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || disabled) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * strength
    const y = (e.clientY - rect.top - rect.height / 2) * strength
    gsap.to(ref.current, { x, y, duration: 0.3, ease: "power2.out" })
  }

  const handleMouseLeave = () => {
    if (!ref.current) return
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" })
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
