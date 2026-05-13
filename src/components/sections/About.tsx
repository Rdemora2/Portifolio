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
  { label: "Anos de experiência", value: "4+" },
  { label: "Projetos entregues", value: "10+" },
  { label: "Países", value: "2" },
  { label: "Usuários impactados", value: "100k+" },
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
              De dev a gestor sem largar o terminal
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
                className="mb-6 text-base leading-relaxed md:text-lg"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {personalInfo.bioExtended}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.5}>
              <div className="flex flex-wrap gap-3">
                {["Cloud & DevOps", "Backend de Alta Performance", "Gestão de Times", "Observabilidade"].map(
                  (pillar) => (
                    <span
                      key={pillar}
                      className="rounded-full border px-4 py-1.5 text-xs font-medium transition-colors duration-300 hover:border-[var(--color-signal)] hover:text-[var(--color-signal)]"
                      style={{
                        fontFamily: "var(--font-mono)",
                        borderColor: "var(--color-edge)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {pillar}
                    </span>
                  ),
                )}
              </div>
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
