"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { techStack } from "@/data/portfolio"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { TECH_CATEGORY_COLORS } from "@/lib/constants"
import type { TechCategory } from "@/types"

const TechGraph = dynamic(
  () => import("@/components/three/TechGraph").then((m) => ({ default: m.TechGraph })),
  { ssr: false }
)

const CATEGORY_LABELS: Record<TechCategory, string> = {
  cloud: "Cloud",
  backend: "Backend",
  frontend: "Frontend",
  mobile: "Mobile",
  devops: "DevOps",
  ai: "AI",
  video: "Vídeo",
}

export function TechStack() {
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    setPrefersReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  }, [])

  const grouped = techStack.reduce<Record<string, typeof techStack>>((acc, tech) => {
    if (!acc[tech.category]) acc[tech.category] = []
    acc[tech.category]?.push(tech)
    return acc
  }, {})

  return (
    <section
      id="tech"
      className="relative py-20 md:py-32"
      style={{ backgroundColor: "var(--color-deep)" }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <p
            className="mb-2 text-sm font-medium uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-signal)" }}
          >
            O que eu uso
          </p>
          <h2
            className="mb-16 text-3xl font-bold md:text-5xl"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
          >
            Tecnologias
          </h2>
        </ScrollReveal>

        {!prefersReduced && (
          <ScrollReveal>
            <div
              className="mb-20 overflow-hidden rounded-2xl border"
              style={{
                borderColor: "var(--color-edge)",
                height: "400px",
                backgroundColor: "rgba(8,13,20,0.5)",
              }}
            >
              <TechGraph techStack={techStack} />
            </div>
          </ScrollReveal>
        )}

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(grouped).map(([category, items], idx) => (
            <ScrollReveal key={category} delay={idx * 0.1}>
              <div>
                <h3
                  className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: TECH_CATEGORY_COLORS[category] ?? "#00d4ff" }}
                  />
                  <span style={{ color: TECH_CATEGORY_COLORS[category] ?? "#00d4ff" }}>
                    {CATEGORY_LABELS[category as TechCategory] ?? category}
                  </span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {items.map((tech) => (
                    <span
                      key={tech.name}
                      className="rounded-full border px-3 py-1.5 text-xs transition-all duration-300 hover:border-[var(--color-signal)] hover:text-[var(--color-signal)]"
                      style={{
                        fontFamily: "var(--font-mono)",
                        borderColor: tech.featured ? "var(--color-edge)" : "rgba(26,40,64,0.5)",
                        color: tech.featured ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                        backgroundColor: tech.featured ? "rgba(0,212,255,0.05)" : "transparent",
                      }}
                    >
                      {tech.name}
                      {tech.proficiency === 5 && (
                        <span className="ml-1" style={{ color: "var(--color-matrix)" }}>★</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
