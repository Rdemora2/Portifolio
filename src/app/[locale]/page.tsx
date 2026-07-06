import { HomeClient } from "@/components/layout/HomeClient"
import { Hero } from "@/components/sections/Hero"
import { SectionDivider } from "@/components/shared/SectionDivider"
import { About } from "@/components/sections/About"
import { Projects } from "@/components/sections/Projects"
import { TechStack } from "@/components/sections/TechStack"
import { Metrics } from "@/components/sections/Metrics"
import { Experience } from "@/components/sections/Experience"
import { Insights } from "@/components/sections/Insights"
import { Contact } from "@/components/sections/Contact"

export default function Home() {
  return (
    <HomeClient>
      <Hero isLoaded />
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
    </HomeClient>
  )
}
