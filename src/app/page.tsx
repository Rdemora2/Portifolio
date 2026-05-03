"use client"

import { useState, useCallback } from "react"
import { useLenis } from "@/hooks/useLenis"
import { PageLoader } from "@/components/layout/PageLoader"
import { CustomCursor } from "@/components/layout/CustomCursor"
import { Navigation } from "@/components/layout/Navigation"
import { Footer } from "@/components/layout/Footer"
import { Hero } from "@/components/sections/Hero"
import { About } from "@/components/sections/About"
import { Projects } from "@/components/sections/Projects"
import { TechStack } from "@/components/sections/TechStack"
import { Metrics } from "@/components/sections/Metrics"
import { Experience } from "@/components/sections/Experience"
import { Contact } from "@/components/sections/Contact"
import { SectionDivider } from "@/components/shared/SectionDivider"

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)

  useLenis()

  const handleLoadComplete = useCallback(() => {
    setIsLoaded(true)
  }, [])

  return (
    <>
      {!isLoaded && <PageLoader onComplete={handleLoadComplete} />}
      <CustomCursor />
      <Navigation />
      <main id="main-content">
        <Hero />
        <SectionDivider />
        <About />
        <SectionDivider />
        <Projects />
        <SectionDivider />
        <TechStack />
        <SectionDivider />
        <Metrics />
        <SectionDivider />
        <Experience />
        <SectionDivider />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
