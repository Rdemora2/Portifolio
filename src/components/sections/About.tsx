"use client"

import dynamic from "next/dynamic"

import { personalInfo } from "@/data/portfolio"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { GradientBorder } from "@/components/shared/GradientBorder"
import { AnimatedText } from "@/components/shared/AnimatedText"
import { useInView } from "@/hooks/useInView"

const FloatingGridCanvas = dynamic(
  () => import("@/components/three/FloatingGrid").then((m) => ({ default: m.FloatingGridCanvas })),
  { ssr: false }
)

const NeuralBackground = dynamic(
  () => import("@/components/shared/NeuralBackground").then((m) => ({ default: m.NeuralBackground })),
  { ssr: false }
)

const stats = [
  { label: "Anos de experiência", value: "3+" },
  { label: "Projetos entregues", value: "10+" },
  { label: "Países", value: "2" },
]

export function About() {
  const [ref, inView] = useInView({ threshold: 0, rootMargin: "400px", triggerOnce: true })

  return (
    <section
      id="about"
      ref={ref as React.RefObject<HTMLElement>}
      className="relative overflow-hidden py-20 md:py-32"
      style={{ backgroundColor: "var(--color-deep)" }}
    >
      {inView && <FloatingGridCanvas />}
      {inView && <NeuralBackground />}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <p
            className="mb-2 text-xs font-normal uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
              letterSpacing: "0.25em",
            }}
          >
            Sobre
          </p>
        </ScrollReveal>

        <div className="grid gap-12 lg:gap-16 lg:grid-cols-[1.5fr_1fr]">
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
              Quem eu sou e o que eu faço
            </AnimatedText>

            <ScrollReveal delay={0.2}>
              <p
                className="mb-6 text-base leading-relaxed md:text-lg"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {personalInfo.bio}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <p
                className="text-base leading-relaxed md:text-lg"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Já trabalhei em projetos pro{" "}
                <span style={{ color: "var(--color-signal)" }}>Grupo Bandeirantes</span>,{" "}
                <span style={{ color: "var(--color-signal)" }}>Hospital Sírio-Libanês</span> e{" "}
                <span style={{ color: "var(--color-signal)" }}>Fiesta Americana Resorts</span>.
                Faço as coisas funcionarem, do código à gestão.
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal animation="slide-right" delay={0.3}>
            <GradientBorder animated={false}>
              <div className="space-y-6 p-6 md:p-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span
                      className="text-xs md:text-sm uppercase tracking-wider"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {stat.label}
                    </span>
                    <span
                      className="text-xl md:text-2xl font-bold"
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
