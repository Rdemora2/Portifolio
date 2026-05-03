"use client"

import { useRef, useEffect } from "react"
import { gsap, ScrollTrigger } from "@/lib/gsap"
import { experience } from "@/data/portfolio"
import { ScrollReveal } from "@/components/shared/ScrollReveal"

export function Experience() {
  const lineRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!lineRef.current || !sectionRef.current) return

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            end: "bottom 40%",
            scrub: 1,
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative py-20 md:py-32"
      style={{ backgroundColor: "var(--color-deep)" }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <p
            className="mb-2 text-xs font-normal uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
              letterSpacing: "0.25em",
            }}
          >
            Onde trabalhei
          </p>
          <h2
            className="mb-20 text-3xl font-bold md:text-5xl"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
          >
            Experiência
          </h2>
        </ScrollReveal>

        <div className="relative">
          <div
            ref={lineRef}
            className="absolute left-0 top-0 hidden h-full w-[2px] origin-top md:left-1/2 md:block md:-translate-x-1/2"
            style={{
              backgroundColor: "var(--color-edge)",
              transformOrigin: "top center",
            }}
          />

          <div className="space-y-16 md:space-y-24">
            {experience.map((entry, idx) => (
              <ScrollReveal
                key={entry.id}
                animation={idx % 2 === 0 ? "slide-left" : "slide-right"}
                delay={idx * 0.15}
              >
                <div
                  className={`relative md:w-[45%] ${idx % 2 === 0 ? "md:mr-auto md:pr-12" : "md:ml-auto md:pl-12"}`}
                >
                  <div
                    className="absolute top-6 hidden h-4 w-4 rounded-full border-2 md:block"
                    style={{
                      borderColor: entry.current ? "var(--color-signal)" : "var(--color-edge)",
                      backgroundColor: entry.current ? "var(--color-signal)" : "var(--color-void)",
                      [idx % 2 === 0 ? "right" : "left"]: "-2.1rem",
                    }}
                  >
                    {entry.current && (
                      <span
                        className="absolute inset-0 animate-ping rounded-full"
                        style={{ backgroundColor: "var(--color-signal)", opacity: 0.3 }}
                      />
                    )}
                  </div>

                  <div
                    className="rounded-2xl border p-8 transition-all duration-500 hover:border-[var(--color-signal)]"
                    style={{
                      borderColor: "var(--color-edge)",
                      backgroundColor: "rgba(10,16,24,0.5)",
                    }}
                  >
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span
                        className="text-xs uppercase tracking-widest"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: entry.current ? "var(--color-signal)" : "var(--color-text-muted)",
                        }}
                      >
                        {entry.period}
                      </span>
                      {entry.current && (
                        <span
                          className="flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs"
                          style={{
                            backgroundColor: "rgba(0,255,136,0.1)",
                            color: "var(--color-matrix)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: "var(--color-matrix)" }} />
                          Atual
                        </span>
                      )}
                    </div>

                    <h3
                      className="mb-1 text-xl font-bold"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {entry.role}
                    </h3>
                    <p
                      className="mb-4 text-sm font-medium"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--color-signal)",
                      }}
                    >
                      {entry.company}
                    </p>
                    <p
                      className="mb-6 text-sm leading-relaxed"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {entry.description}
                    </p>

                    <ul className="mb-6 space-y-2">
                      {entry.highlights.map((h) => (
                        <li
                          key={h}
                          className="flex items-start gap-2 text-sm"
                          style={{
                            fontFamily: "var(--font-body)",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          <span style={{ color: "var(--color-matrix)" }}>▸</span>
                          {h}
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-2">
                      {entry.stack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border px-3 py-1 text-xs"
                          style={{
                            fontFamily: "var(--font-mono)",
                            borderColor: "var(--color-edge)",
                            color: "var(--color-text-muted)",
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
