"use client"

import { useEffect, useRef } from "react"
import { useTranslations } from "next-intl"

import { usePathname } from "@/navigation"

import styles from "./BackToTop.module.css"

const RING_CIRCUMFERENCE = 119.38

export function BackToTop() {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const progressRef = useRef<SVGCircleElement>(null)
  const pathname = usePathname()
  const t = useTranslations("Footer")

  useEffect(() => {
    let animationFrame = 0

    const update = () => {
      animationFrame = 0

      const button = buttonRef.current
      const progressRing = progressRef.current
      if (!button || !progressRing) return

      const documentHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      )
      const maxScroll = Math.max(documentHeight - window.innerHeight, 0)
      const progress = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0
      const threshold = Math.max(600, window.innerHeight)
      const hasOpenDialog = Boolean(
        document.querySelector(
          '[role="dialog"][aria-modal="true"]:not([aria-hidden="true"])',
        ),
      )
      const isVisible =
        maxScroll > threshold && window.scrollY > threshold && !hasOpenDialog

      button.dataset.visible = isVisible ? "true" : "false"
      button.dataset.deep = progress >= 0.66 ? "true" : "false"
      const nextAriaHidden = isVisible ? "false" : "true"
      const nextTabIndex = isVisible ? 0 : -1

      if (button.getAttribute("aria-hidden") !== nextAriaHidden) {
        button.setAttribute("aria-hidden", nextAriaHidden)
      }
      if (button.tabIndex !== nextTabIndex) button.tabIndex = nextTabIndex
      progressRing.style.strokeDashoffset = String(
        RING_CIRCUMFERENCE * (1 - progress),
      )
    }

    const scheduleUpdate = () => {
      if (animationFrame) return
      animationFrame = window.requestAnimationFrame(update)
    }

    const resizeObserver = new ResizeObserver(scheduleUpdate)
    resizeObserver.observe(document.documentElement)
    resizeObserver.observe(document.body)

    const dialogObserver = new MutationObserver(scheduleUpdate)
    dialogObserver.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-hidden", "aria-modal", "data-open", "role"],
    })

    scheduleUpdate()
    window.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("resize", scheduleUpdate, { passive: true })

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
      resizeObserver.disconnect()
      dialogObserver.disconnect()
    }
  }, [pathname])

  const scrollToTop = () => {
    const top = document.querySelector<HTMLElement>("body#top[tabindex='-1']")
    top?.focus({ preventScroll: true })

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "instant" : "smooth",
    })
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      className={styles.button}
      onClick={scrollToTop}
      aria-label={t("backToTop")}
      aria-hidden="true"
      tabIndex={-1}
      data-visible="false"
      data-deep="false"
    >
      <svg
        className={styles.progress}
        viewBox="0 0 44 44"
        aria-hidden="true"
      >
        <circle className={styles.track} cx="22" cy="22" r="19" />
        <circle
          ref={progressRef}
          className={styles.ring}
          cx="22"
          cy="22"
          r="19"
          pathLength={RING_CIRCUMFERENCE}
        />
      </svg>
      <svg
        className={styles.arrow}
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M4.75 11.25 10 6l5.25 5.25M10 6v8" />
      </svg>
    </button>
  )
}
