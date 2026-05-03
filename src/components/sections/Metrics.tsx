"use client"

import { useRef, useEffect } from "react"
import { metrics } from "@/data/portfolio"
import { CountUp } from "@/components/shared/CountUp"
import { useInView } from "@/hooks/useInView"
import { ScrollReveal } from "@/components/shared/ScrollReveal"

export function Metrics() {
  const [sectionRef, isInView] = useInView(0.3)

  return (
    <section
      id="metrics"
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="relative overflow-hidden py-20 md:py-32"
      style={{ backgroundColor: "var(--color-void)" }}
    >
      <DataflowBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <p
            className="mb-2 text-center text-sm font-medium uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-signal)" }}
          >
            Números reais
          </p>
          <h2
            className="mb-4 text-center text-3xl font-bold md:text-5xl"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
          >
            Hospital Sírio-Libanês
          </h2>
          <p
            className="mx-auto mb-16 max-w-xl text-center text-sm md:text-base"
            style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)" }}
          >
            Dados de produção do sistema que eu construí e mantenho
          </p>
        </ScrollReveal>

        <div className="grid gap-8 md:grid-cols-3">
          {metrics.map((metric, idx) => (
            <ScrollReveal key={metric.label} delay={idx * 0.15}>
              <div
                className="rounded-2xl border p-10 text-center transition-all duration-500 hover:border-[var(--color-signal)]"
                style={{
                  borderColor: "var(--color-edge)",
                  backgroundColor: "rgba(8,13,20,0.6)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div
                  className="text-6xl font-extrabold leading-none md:text-7xl lg:text-8xl"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-signal)",
                  }}
                >
                  <CountUp
                    end={metric.value}
                    suffix={metric.suffix}
                    trigger={isInView}
                    duration={2.5}
                  />
                </div>
                <p
                  className="mt-4 text-xs uppercase tracking-widest"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {metric.label}
                </p>
                <p
                  className="mt-2 text-sm"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {metric.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function DataflowBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    let rafId: number
    const lines = Array.from({ length: 15 }, () => ({
      y: Math.random() * canvas.height,
      speed: 0.3 + Math.random() * 0.8,
      width: 50 + Math.random() * 200,
      x: Math.random() * canvas.width,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = "rgba(0, 212, 255, 0.04)"
      ctx.lineWidth = 1

      lines.forEach((line) => {
        ctx.beginPath()
        ctx.moveTo(line.x, line.y)
        ctx.lineTo(line.x + line.width, line.y)
        ctx.stroke()
        line.x += line.speed
        if (line.x > canvas.width) {
          line.x = -line.width
          line.y = Math.random() * canvas.height
        }
      })

      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  )
}
