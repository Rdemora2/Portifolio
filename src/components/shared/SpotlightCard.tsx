"use client"

import React, { useRef } from "react"

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  spotlightColor?: string
}

export function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(99, 102, 241, 0.15)", // Default indigo-ish glow
  ...props
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null)

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const card = divRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    card.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`)
    card.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`)
  }

  return (
    <div
      ref={divRef}
      {...props}
      onPointerMove={handlePointerMove}
      className={`group relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
        style={{
          background: `radial-gradient(600px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), ${spotlightColor}, transparent 40%)`,
        }}
      />
      {children}
    </div>
  )
}
