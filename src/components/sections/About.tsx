"use client"

import { personalInfo } from "@/data/portfolio"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { GradientBorder } from "@/components/shared/GradientBorder"
import { AnimatedText } from "@/components/shared/AnimatedText"

const stats = [
  { label: "Anos de experiência", value: "3+" },
  { label: "Projetos entregues", value: "10+" },
  { label: "Países", value: "2" },
]

function highlightKeywords(text: string): string {
  const keywords = ["missão crítica", "ultra-baixa latência", "liderança estratégica", "excelência técnica máxima", "escalabilidade", "estabilidade sistêmica"]
  let result = text
  keywords.forEach((keyword) => {
    result = result.replace(
      new RegExp(keyword, "gi"),
      `<span style="color: var(--color-signal)">${keyword}</span>`
    )
  })
  return result
}

export function About() {
  return (
    <section
      id="about"
      className="relative py-32"
      style={{ backgroundColor: "var(--color-deep)" }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <p
            className="mb-2 text-sm font-medium uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-signal)",
            }}
          >
            Sobre
          </p>
        </ScrollReveal>

        <div className="grid gap-16 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <AnimatedText
              as="h2"
              type="split-words"
              className="mb-8 text-3xl font-bold leading-tight md:text-4xl lg:text-5xl"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              Engenharia de elite para desafios de escala
            </AnimatedText>

            <ScrollReveal delay={0.2}>
              <p
                className="mb-6 text-lg leading-relaxed"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-secondary)",
                }}
                dangerouslySetInnerHTML={{ __html: highlightKeywords(personalInfo.bio) }}
              />
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <p
                className="text-lg leading-relaxed"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Com atuação em projetos para o{" "}
                <span style={{ color: "var(--color-signal)" }}>Grupo Bandeirantes</span>,{" "}
                <span style={{ color: "var(--color-signal)" }}>Hospital Sírio-Libanês</span> e{" "}
                <span style={{ color: "var(--color-signal)" }}>Fiesta Americana Resorts</span>,
                entrego soluções que combinam propriedade técnica total com gestão estratégica de alto nível.
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal animation="slide-right" delay={0.3}>
            <GradientBorder animated>
              <div className="space-y-6 p-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span
                      className="text-sm uppercase tracking-wider"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {stat.label}
                    </span>
                    <span
                      className="text-2xl font-bold"
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
