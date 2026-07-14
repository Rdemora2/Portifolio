import { useTranslations } from "next-intl"

import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { GradientBorder } from "@/components/shared/GradientBorder"
import { AboutBackground } from "./AboutBackground"

export function About() {
  const t = useTranslations("About")
  const ts = useTranslations("Stats")

  const stats = [
    { label: ts("yearsOfExperience"), value: "4+" },
    { label: ts("projectsDelivered"), value: "10+" },
    { label: ts("countries"), value: "2" },
    { label: ts("usersImpacted"), value: "100k+" },
  ]

  const pillars = [
    t("pillars.cloud"),
    t("pillars.backend"),
    t("pillars.management"),
    t("pillars.observability"),
  ]

  return (
    <section
      id="about"
      className="relative overflow-hidden py-16 sm:py-20 md:py-32"
      style={{ backgroundColor: "var(--color-deep)" }}
    >
      <AboutBackground />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <p
            className="mb-2 text-xs font-normal uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
              letterSpacing: "0.25em",
            }}
          >
            {t("title")}
          </p>
        </ScrollReveal>

        <div className="grid gap-10 lg:gap-16 lg:grid-cols-[1.5fr_1fr]">
          <div className="min-w-0">
            <ScrollReveal animation="title">
              <h2
                className="mb-6 font-bold leading-tight sm:mb-8"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text-primary)",
                  fontSize: "var(--text-3xl)",
                }}
              >
                {t("mainTitle")}
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p
                className="mb-6 leading-relaxed"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-secondary)",
                  fontSize: "var(--text-md)",
                }}
              >
                {t("bio")}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <p
                className="mb-6 leading-relaxed"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-secondary)",
                  fontSize: "var(--text-md)",
                }}
              >
                {t("bioExtended")}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.5}>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {pillars.map((pillar) => (
                  <span
                    key={pillar}
                    className="cursor-default rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-200 hover:border-[var(--color-signal)] hover:text-[var(--color-signal)] sm:px-4 sm:py-1.5"
                    style={{
                      fontFamily: "var(--font-mono)",
                      borderColor: "var(--color-edge)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {pillar}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal animation="slide-right" delay={0.3}>
            <GradientBorder animated={false}>
              <div className="space-y-6 p-5 sm:p-6 md:p-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between gap-4">
                    <span
                      className="text-xs uppercase tracking-wider sm:text-sm"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {stat.label}
                    </span>
                    <span
                      className="text-xl font-bold sm:text-2xl"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </GradientBorder>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
