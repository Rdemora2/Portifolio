"use client"

import { useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { PageLoader } from "@/components/layout/PageLoader"
import { Hero } from "@/components/sections/Hero"
import { SectionDivider } from "@/components/shared/SectionDivider"

const About = dynamic(() => import("@/components/sections/About").then(mod => mod.About), { ssr: true })
const Projects = dynamic(() => import("@/components/sections/Projects").then(mod => mod.Projects), { ssr: true })
const TechStack = dynamic(() => import("@/components/sections/TechStack").then(mod => mod.TechStack), { ssr: true })
const Metrics = dynamic(() => import("@/components/sections/Metrics").then(mod => mod.Metrics), { ssr: true })
const Experience = dynamic(() => import("@/components/sections/Experience").then(mod => mod.Experience), { ssr: true })
const Insights = dynamic(() => import("@/components/sections/Insights").then(mod => mod.Insights), { ssr: true })
const Contact = dynamic(() => import("@/components/sections/Contact").then(mod => mod.Contact), { ssr: true })

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
