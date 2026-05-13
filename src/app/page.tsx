"use client"

import { useState, useCallback } from "react"
import { PageLoader } from "@/components/layout/PageLoader"
import { Hero } from "@/components/sections/Hero"
import { About } from "@/components/sections/About"
import { Projects } from "@/components/sections/Projects"
import { TechStack } from "@/components/sections/TechStack"
import { Metrics } from "@/components/sections/Metrics"
import { Experience } from "@/components/sections/Experience"

import { Insights } from "@/components/sections/Insights"
import { Contact } from "@/components/sections/Contact"
import { SectionDivider } from "@/components/shared/SectionDivider"

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)

  const handleLoadComplete = useCallback(() => {
    setIsLoaded(true)
  }, [])

  return (
    <>
      {!isLoaded && <PageLoader onComplete={handleLoadComplete} />}
      <main id="main-content">
        <Hero />
        <SectionDivider topColor="var(--color-void)" bottomColor="var(--color-deep)" />
        <About />
        <SectionDivider topColor="var(--color-deep)" bottomColor="var(--color-void)" />
        <Projects />
        <SectionDivider topColor="var(--color-void)" bottomColor="var(--color-deep)" />
        <TechStack />
        <SectionDivider topColor="var(--color-deep)" bottomColor="var(--color-void)" />
        <Metrics />
        <SectionDivider topColor="var(--color-void)" bottomColor="var(--color-deep)" />
        <Experience />
        <SectionDivider topColor="var(--color-deep)" bottomColor="var(--color-deep)" />
        <Insights />
        <SectionDivider topColor="var(--color-deep)" bottomColor="var(--color-void)" />
        <Contact />
      </main>
    </>
  )
}
