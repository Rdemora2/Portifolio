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
      className="relative overflow-hidden py-16 sm:py-20 md:py-32"
      style={{ backgroundColor: "var(--color-deep)" }}
    >
      {inView && <FloatingGridCanvas />}
      {inView && <NeuralBackground />}
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
            Sobre
          </p>
        </ScrollReveal>

        <div className="grid gap-10 lg:gap-16 lg:grid-cols-[1.5fr_1fr]">
          <div className="min-w-0">
            <AnimatedText
              as="h2"
              type="split-words"
              className="mb-6 font-bold leading-tight sm:mb-8"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
                fontSize: "var(--text-3xl)",
              }}
            >
              De dev a gestor sem largar o terminal
            </AnimatedText>

            <ScrollReveal delay={0.2}>
              <p
                className="mb-6 leading-relaxed"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-secondary)",
                  fontSize: "var(--text-md)",
                }}
              >
                {personalInfo.bio}
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
                {personalInfo.bioExtended}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.5}>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {["Cloud & DevOps", "Backend de Alta Performance", "Gestão de Times", "Observabilidade"].map(
                  (pillar) => (
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
                  ),
                )}
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
