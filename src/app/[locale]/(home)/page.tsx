import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"

import { About } from "@/components/sections/About"
import { Contact } from "@/components/sections/Contact"
import { Experience } from "@/components/sections/Experience"
import { Hero } from "@/components/sections/Hero"
import { Insights } from "@/components/sections/Insights"
import { Metrics } from "@/components/sections/Metrics"
import { Projects } from "@/components/sections/Projects"
import { TechStack } from "@/components/sections/TechStack"
import { SectionDivider } from "@/components/shared/SectionDivider"

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const messages = await getMessages({ locale })
  const homeMessages = {
    Projects: messages.Projects,
    Stats: messages.Stats,
    Contact: messages.Contact,
  }

  return (
    <NextIntlClientProvider locale={locale} messages={homeMessages}>
      <main id="main-content" className="home-content relative">
        <Hero />
        <SectionDivider
          topColor="var(--color-void)"
          bottomColor="var(--color-deep)"
        />
        <About />
        <SectionDivider
          topColor="var(--color-deep)"
          bottomColor="var(--color-void)"
        />
        <Projects />
        <SectionDivider
          topColor="var(--color-void)"
          bottomColor="var(--color-deep)"
        />
        <TechStack />
        <SectionDivider
          topColor="var(--color-deep)"
          bottomColor="var(--color-void)"
        />
        <Metrics />
        <SectionDivider
          topColor="var(--color-void)"
          bottomColor="var(--color-deep)"
        />
        <Experience />
        <SectionDivider
          topColor="var(--color-deep)"
          bottomColor="var(--color-deep)"
        />
        <Insights />
        <SectionDivider
          topColor="var(--color-deep)"
          bottomColor="var(--color-void)"
        />
        <Contact />
      </main>
    </NextIntlClientProvider>
  )
}
