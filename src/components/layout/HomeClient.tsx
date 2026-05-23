"use client"

import { useState, useCallback } from "react"
import { PageLoader } from "@/components/layout/PageLoader"

interface HomeClientProps {
  children: React.ReactNode
}

/**
 * Thin client wrapper that manages the PageLoader state.
 * Extracted from page.tsx so the page itself can be a Server Component for SSR/SEO.
 */
export function HomeClient({ children }: HomeClientProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  const handleLoadComplete = useCallback(() => {
    setIsLoaded(true)
  }, [])

  return (
    <>
      {!isLoaded && <PageLoader onComplete={handleLoadComplete} />}
      <main
        id="main-content"
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        {children}
      </main>
    </>
  )
}
