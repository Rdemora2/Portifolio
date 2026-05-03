import type { ReactNode } from "react"

interface BadgeProps {
  children: ReactNode
  variant?: "default" | "signal" | "matrix" | "alert"
  className?: string
}

const VARIANT_STYLES = {
  default: { borderColor: "var(--color-edge)", color: "var(--color-text-muted)", bg: "transparent" },
  signal: { borderColor: "var(--color-signal)", color: "var(--color-signal)", bg: "rgba(99,102,241,0.1)" },
  matrix: { borderColor: "var(--color-matrix)", color: "var(--color-matrix)", bg: "rgba(0,255,136,0.1)" },
  alert: { borderColor: "var(--color-alert)", color: "var(--color-alert)", bg: "rgba(255,107,53,0.1)" },
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const style = VARIANT_STYLES[variant]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs uppercase tracking-wider ${className}`}
      style={{
        fontFamily: "var(--font-mono)",
        borderColor: style.borderColor,
        color: style.color,
        backgroundColor: style.bg,
      }}
    >
      {children}
    </span>
  )
}
