"use client"

import { testimonials } from "@/data/portfolio"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { AnimatedText } from "@/components/shared/AnimatedText"

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative py-16 sm:py-20 md:py-32"
      style={{ backgroundColor: "var(--color-void)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <p
            className="mb-2 text-xs font-normal uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
              letterSpacing: "0.25em",
            }}
          >
            O que dizem
          </p>
          <h2
            className="mb-12 font-bold sm:mb-16"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
              fontSize: "var(--text-3xl)",
            }}
          >
            Depoimentos
          </h2>
        </ScrollReveal>

        <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, idx) => (
            <ScrollReveal key={testimonial.id} delay={idx * 0.15}>
              <div
                className="group relative rounded-2xl border p-5 transition-all duration-200 hover:border-[var(--color-signal)] sm:p-6 md:p-8"
                style={{
                  borderColor: "var(--color-edge)",
                  backgroundColor: "rgba(10,16,24,0.5)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <span
                  className="absolute -top-3 left-6 text-4xl font-bold leading-none"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-signal)",
                    opacity: 0.3,
                  }}
                  aria-hidden="true"
                >
                  &ldquo;
                </span>

                <div
                  className="absolute top-0 left-8 right-8 h-[1px] origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
                  style={{
                    background: "linear-gradient(90deg, var(--color-signal), var(--color-matrix), transparent)",
                  }}
                  aria-hidden="true"
                />

                <blockquote
                  className="mb-6 text-sm leading-relaxed md:text-base"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {testimonial.quote}
                </blockquote>

                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                    style={{
                      backgroundColor: "rgba(99,102,241,0.15)",
                      color: "var(--color-signal)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {testimonial.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {testimonial.name}
                    </p>
                    <p
                      className="truncate text-xs"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {testimonial.role} · {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
