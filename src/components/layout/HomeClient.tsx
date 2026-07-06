"use client"

import { useState, useCallback } from "react"
import { PageLoader } from "@/components/layout/PageLoader"
import SplashCursor from "@/components/shared/SplashCursor"

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
        className="relative"
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.3s ease",
          zIndex: 1, // Keep content above cursor
        }}
      >
        {children}
      </main>
      
      {/* Global Fluid Hover Interaction */}
      {isLoaded && (
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <SplashCursor 
            COLOR="#6366f1"
            RAINBOW_MODE={false}
            SPLAT_RADIUS={0.15}
            DENSITY_DISSIPATION={4.5} // Dissipate faster so it's more subtle
          />
        </div>
      )}
    </>
  )
}
