"use client";

import { useRef, useEffect } from "react";
import { metrics } from "@/data/portfolio";
import { CountUp } from "@/components/shared/CountUp";
import { useInView } from "@/hooks/useInView";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

export function Metrics() {
  const [sectionRef, isInView] = useInView({ threshold: 0.3 });

  return (
    <section
      id="metrics"
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="relative overflow-hidden py-16 sm:py-20 md:py-32"
      style={{ backgroundColor: "var(--color-void)" }}
    >
      <DataflowBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <p
            className="mb-2 text-center text-xs font-normal uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
              letterSpacing: "0.25em",
            }}
          >
            Números reais
          </p>
          <h2
            className="mb-4 text-center font-bold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
              fontSize: "var(--text-3xl)",
            }}
          >
            Hospital Sírio-Libanês
          </h2>
          <p
            className="mx-auto mb-12 max-w-xl text-center text-sm sm:mb-16 md:text-base"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-text-secondary)",
            }}
          >
            Dados de produção do sistema que eu construí e mantenho
          </p>
        </ScrollReveal>

        <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-3">
          {metrics.map((metric, idx) => (
            <ScrollReveal key={metric.label} delay={idx * 0.15}>
              <div
                className="rounded-2xl border p-5 text-center transition-all duration-500 hover:border-[var(--color-signal)] sm:p-6 md:p-8"
                style={{
                  borderColor: "var(--color-edge)",
                  backgroundColor: "rgba(10,16,24,0.6)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div
                  className="font-extrabold leading-none"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-signal)",
                    fontSize: "var(--text-5xl)",
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
                  className="mt-4 text-[0.625rem] uppercase tracking-widest sm:text-xs"
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
  );
}

function DataflowBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      sizeRef.current = { width: canvas.width, height: canvas.height };
    };
    resize();
    window.addEventListener("resize", resize);

    let rafId: number;
    const lines = Array.from({ length: 15 }, () => ({
      y: Math.random() * sizeRef.current.height,
      speed: 0.3 + Math.random() * 0.8,
      width: 50 + Math.random() * 200,
      x: Math.random() * sizeRef.current.width,
    }));

    const draw = () => {
      const { width, height } = sizeRef.current;
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(99, 102, 241, 0.04)";
      ctx.lineWidth = 1;

      lines.forEach((line) => {
        ctx.beginPath();
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(line.x + line.width, line.y);
        ctx.stroke();
        line.x += line.speed;
        if (line.x > sizeRef.current.width) {
          line.x = -line.width;
          line.y = Math.random() * sizeRef.current.height;
        }
      });

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
