"use client"

import { useState, useEffect } from "react"
import { navLinks } from "@/data/portfolio"

export function useActiveSection(): string {
  const [activeSection, setActiveSection] = useState("hero")

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    navLinks.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            setActiveSection(id)
          }
        },
        { threshold: 0.3, rootMargin: "-80px 0px 0px 0px" }
      )

      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  return activeSection
}
