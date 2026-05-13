"use client"

import Link from "next/link"
import { insights } from "@/data/portfolio"
import { ScrollReveal } from "@/components/shared/ScrollReveal"

const CATEGORY_LABELS: Record<string, string> = {
  cloud: "Cloud",
  devops: "DevOps",
  leadership: "Liderança",
  architecture: "Arquitetura",
  observability: "Observabilidade",
}

const CATEGORY_COLORS: Record<string, string> = {
  cloud: "#6366f1",
  devops: "#4f46e5",
  leadership: "#00ff88",
  architecture: "#00d4ff",
  observability: "#f59e0b",
}

export function Insights() {
  return (
    <section
      id="insights"
      className="relative py-16 sm:py-20 md:py-32"
      style={{ backgroundColor: "var(--color-deep)" }}
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
            Pensamento técnico
          </p>
          <h2
            className="mb-4 font-bold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
              fontSize: "var(--text-3xl)",
            }}
          >
            Insights Estratégicos
          </h2>
          <p
            className="mb-12 max-w-xl text-sm sm:mb-16 md:text-base"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-text-secondary)",
            }}
          >
            Reflexões sobre liderança técnica, arquitetura de sistemas e as decisões que fazem a diferença em produção.
          </p>
        </ScrollReveal>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {insights.map((insight, idx) => {
            const CardContent = (
              <article
                className="group relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:border-[var(--color-signal)] sm:p-6 md:p-8"
                style={{
                  borderColor: "var(--color-edge)",
                  backgroundColor: "rgba(5,10,18,0.6)",
                }}
              >
                <div
                  className="absolute top-0 left-0 h-full w-[3px] origin-top scale-y-0 transition-transform duration-500 group-hover:scale-y-100"
                  style={{
                    backgroundColor: CATEGORY_COLORS[insight.category] ?? "#6366f1",
                  }}
                  aria-hidden="true"
                />

                <div className="mb-4 flex items-center gap-3">
                  <span
                    className="rounded-full px-3 py-0.5 text-xs uppercase tracking-wider"
                    style={{
                      fontFamily: "var(--font-mono)",
                      backgroundColor: `${CATEGORY_COLORS[insight.category] ?? "#6366f1"}15`,
                      color: CATEGORY_COLORS[insight.category] ?? "#6366f1",
                    }}
                  >
                    {CATEGORY_LABELS[insight.category] ?? insight.category}
                  </span>
                  <span
                    className="text-xs"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {insight.readTime}
                  </span>
                </div>

                <h3
                  className="mb-3 text-base font-bold transition-colors duration-200 group-hover:text-[var(--color-signal)] sm:text-lg md:text-xl"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {insight.title}
                </h3>

                <p
                  className="mb-6 text-sm leading-relaxed"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {insight.summary}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  {insight.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border px-2.5 py-0.5 text-xs"
                      style={{
                        fontFamily: "var(--font-mono)",
                        borderColor: "rgba(26,40,64,0.5)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                  {insight.hasFullArticle && (
                    <span
                      className="ml-auto text-xs font-semibold uppercase tracking-wider"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-signal)",
                      }}
                    >
                      Ler artigo →
                    </span>
                  )}
                </div>

                <div
                  className="absolute bottom-6 right-6 translate-x-2 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 sm:bottom-8 sm:right-8"
                  style={{ color: "var(--color-signal)" }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path
                      d="M4 10h12M12 6l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </article>
            )

            return (
              <ScrollReveal key={insight.id} delay={idx * 0.1}>
                {insight.hasFullArticle && insight.slug ? (
                  <Link href={`/insights/${insight.slug}`} className="block no-underline">
                    {CardContent}
                  </Link>
                ) : (
                  CardContent
                )}
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
