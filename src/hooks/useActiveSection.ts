"use client"

import { useState, useEffect } from "react"
import { navLinks } from "@/data/portfolio"

export function useActiveSection(): string {
  const [activeSection, setActiveSection] = useState("hero")

  useEffect(() => {
    const sections = navLinks
      .map(({ id }) => ({ id, element: document.getElementById(id) }))
      .filter(
        (section): section is { id: string; element: HTMLElement } =>
          section.element !== null,
      )

    let animationFrame = 0

    const updateActiveSection = () => {
      cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(() => {
        // A stable reading line works for both short and very tall sections.
        // Ratio-based IntersectionObserver thresholds never fire for sections
        // whose height is several times larger than the viewport.
        const readingLine = window.innerHeight * 0.3
        let nextSection = sections[0]?.id ?? "hero"
        let nearestDistance = Number.POSITIVE_INFINITY

        for (const { id, element } of sections) {
          const rect = element.getBoundingClientRect()

          if (rect.top <= readingLine && rect.bottom > readingLine) {
            nextSection = id
            break
          }

          const distance = Math.min(
            Math.abs(rect.top - readingLine),
            Math.abs(rect.bottom - readingLine),
          )
          if (distance < nearestDistance) {
            nearestDistance = distance
            nextSection = id
          }
        }

        setActiveSection((current) =>
          current === nextSection ? current : nextSection,
        )
      })
    }

    // Defer the initial measurement to prevent a forced reflow (layout thrashing) during the critical rendering path.
    const initialTimeout = setTimeout(updateActiveSection, 100)
    window.addEventListener("scroll", updateActiveSection, { passive: true })
    window.addEventListener("resize", updateActiveSection)

    return () => {
      clearTimeout(initialTimeout)
      cancelAnimationFrame(animationFrame)
      window.removeEventListener("scroll", updateActiveSection)
      window.removeEventListener("resize", updateActiveSection)
    }
  }, [])

  return activeSection
}
