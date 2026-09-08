"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import styles from "./ClientBrands.module.css"

interface BrandMarqueeProps {
  children: ReactNode
  pauseLabel: string
  resumeLabel: string
}

export function BrandMarquee({ children, pauseLabel, resumeLabel }: BrandMarqueeProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root || !("IntersectionObserver" in window)) return

    const observer = new IntersectionObserver(([entry]) => {
      root.dataset.visible = String(entry?.isIntersecting ?? false)
    }, { rootMargin: "80px" })
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={rootRef} className={styles.marquee} data-paused={paused} data-visible="false">
      <div
        className={styles.viewport}
        tabIndex={0}
        role="group"
        aria-labelledby="client-brands-title"
        data-brand-viewport
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.scrollLeft = 0
        }}
      >
        <div className={styles.track} data-brand-track>{children}</div>
      </div>
      <button
        type="button"
        className={styles.motionControl}
        aria-label={paused ? resumeLabel : pauseLabel}
        title={paused ? resumeLabel : pauseLabel}
        onClick={() => setPaused((value) => !value)}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          {paused ? <path d="M4 2.5 13 8l-9 5.5z" /> : <path d="M4 3h3v10H4zm5 0h3v10H9z" />}
        </svg>
      </button>
    </div>
  )
}
