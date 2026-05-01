import type { ReactNode } from "react"

interface ButtonProps {
  children: ReactNode
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
  className?: string
  onClick?: () => void
  href?: string
  disabled?: boolean
  type?: "button" | "submit"
}

const VARIANTS = {
  primary: "border-[var(--color-signal)] text-[var(--color-signal)] hover:bg-[var(--color-signal)] hover:text-[var(--color-void)]",
  secondary: "border-[var(--color-edge)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-secondary)]",
  ghost: "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-signal)]",
}

const SIZES = {
  sm: "px-4 py-1.5 text-xs",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  href,
  disabled,
  type = "button",
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full border font-semibold uppercase tracking-wider transition-all duration-300 disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`
  const style = { fontFamily: "var(--font-body)" }

  if (href) {
    return (
      <a href={href} className={classes} style={style}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} style={style}>
      {children}
    </button>
  )
}
