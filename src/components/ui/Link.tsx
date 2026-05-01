import type { ReactNode } from "react"

interface LinkProps {
  children: ReactNode
  href: string
  external?: boolean
  className?: string
  ariaLabel?: string
}

export function Link({ children, href, external = false, className = "", ariaLabel }: LinkProps) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`transition-colors duration-300 hover:text-[var(--color-signal)] ${className}`}
      style={{ color: "var(--color-text-secondary)" }}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  )
}
