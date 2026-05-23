"use client"

import { useState, useEffect, useRef } from "react"

interface UseInViewOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

/**
 * Observes element visibility via IntersectionObserver.
 *
 * Generic over the element type to eliminate unsafe casts at call sites.
 * @example
 * const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.3 })
 */
export function useInView<T extends HTMLElement = HTMLElement>({ 
  threshold = 0.3, 
  rootMargin = "0px",
  triggerOnce = true
}: UseInViewOptions = {}): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true)
          if (triggerOnce) {
            observer.unobserve(el)
          }
        } else if (!triggerOnce) {
          setIsInView(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, triggerOnce])

  return [ref, isInView]
}
