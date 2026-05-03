"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { techStack } from "@/data/portfolio";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { TECH_CATEGORY_COLORS } from "@/lib/constants";
import { useInView } from "@/hooks/useInView";
import type { TechCategory } from "@/types";

const TechGraph = dynamic(
  () =>
    import("@/components/three/TechGraph").then((m) => ({
      default: m.TechGraph,
    })),
  { ssr: false },
);

const CATEGORY_LABELS: Record<TechCategory, string> = {
  cloud: "Cloud",
  backend: "Backend",
  frontend: "Frontend",
  mobile: "Mobile",
  devops: "DevOps",
  ai: "AI",
  video: "Vídeo",
};

export function TechStack() {
  const [prefersReduced, setPrefersReduced] = useState(false);
  const [ref, inView] = useInView({ threshold: 0, rootMargin: "400px", triggerOnce: true });
  const [isTouch, setIsTouch] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const tagRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tagRectsRef = useRef<(DOMRect | null)[]>([]);
  const containerRectRef = useRef<DOMRect | null>(null);
  const currentOffsets = useRef<{ x: number; y: number }[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    setPrefersReduced(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  // Mouse-reactive parallax for tech tags
  useEffect(() => {
    if (prefersReduced || isTouch) return;

    const container = containerRef.current;
    if (!container) return;

    const allTags = techStack.length;
    if (currentOffsets.current.length === 0) {
      currentOffsets.current = Array.from({ length: allTags }, () => ({
        x: 0,
        y: 0,
      }));
    }

    const updateRects = () => {
      containerRectRef.current = container.getBoundingClientRect();
      tagRectsRef.current = tagRefs.current.map((tag) =>
        tag ? tag.getBoundingClientRect() : null,
      );
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRectRef.current;
      if (!rect) return;
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const animate = () => {
      const tags = tagRefs.current;
      const mouse = mouseRef.current;

      tags.forEach((tag, i) => {
        if (!tag) return;
        const rect = tagRectsRef.current[i];
        const containerRect = containerRectRef.current;
        if (!rect || !containerRect) return;

        const tagCenterX = rect.left - containerRect.left + rect.width / 2;
        const tagCenterY = rect.top - containerRect.top + rect.height / 2;

        const dx = mouse.x - tagCenterX;
        const dy = mouse.y - tagCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 300;
        const maxOffset = 6;

        let targetX = 0;
        let targetY = 0;

        if (dist < maxDist && dist > 0) {
          const force = (1 - dist / maxDist) * maxOffset;
          targetX = -(dx / dist) * force;
          targetY = -(dy / dist) * force;
        }

        const current = currentOffsets.current[i];
        if (!current) return;

        current.x += (targetX - current.x) * 0.08;
        current.y += (targetY - current.y) * 0.08;

        tag.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    updateRects();
    const resizeObserver = new ResizeObserver(() => updateRects());
    resizeObserver.observe(container);
    tagRefs.current.forEach((tag) => {
      if (tag) resizeObserver.observe(tag);
    });

    container.addEventListener("mousemove", handleMouseMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [prefersReduced, isTouch]);

  const grouped = techStack.reduce<Record<string, typeof techStack>>(
    (acc, tech) => {
      if (!acc[tech.category]) acc[tech.category] = [];
      acc[tech.category]?.push(tech);
      return acc;
    },
    {},
  );

  let tagIndex = 0;

  return (
    <section
      id="tech"
      ref={ref as React.RefObject<HTMLElement>}
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
            O que eu uso
          </p>
          <h2
            className="mb-16 text-3xl font-bold md:text-5xl"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
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
                backgroundColor: "rgba(10,16,24,0.5)",
              }}
            >
              {inView && <TechGraph techStack={techStack} />}
            </div>
          </ScrollReveal>
        )}

        <div
          ref={containerRef}
          className="grid gap-12 md:grid-cols-2 lg:grid-cols-3"
        >
          {Object.entries(grouped).map(([category, items], idx) => (
            <ScrollReveal key={category} delay={idx * 0.1}>
              <div>
                <h3
                  className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor:
                        TECH_CATEGORY_COLORS[category] ?? "#6366f1",
                    }}
                  />
                  <span
                    style={{
                      color: TECH_CATEGORY_COLORS[category] ?? "#6366f1",
                    }}
                  >
                    {CATEGORY_LABELS[category as TechCategory] ?? category}
                  </span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {items.map((tech) => {
                    const currentIndex = tagIndex++;
                    return (
                      <span
                        key={tech.name}
                        ref={(el) => {
                          tagRefs.current[currentIndex] = el;
                        }}
                        className="rounded-full border px-3 py-1.5 text-xs transition-all duration-300 hover:border-[var(--color-signal)] hover:text-[var(--color-signal)]"
                        style={{
                          fontFamily: "var(--font-mono)",
                          borderColor: tech.featured
                            ? "var(--color-edge)"
                            : "rgba(26,40,64,0.5)",
                          color: tech.featured
                            ? "var(--color-text-primary)"
                            : "var(--color-text-secondary)",
                          backgroundColor: tech.featured
                            ? "rgba(99,102,241,0.05)"
                            : "transparent",
                          willChange: "transform",
                        }}
                      >
                        {tech.name}
                        {tech.proficiency === 5 && (
                          <span
                            className="ml-1"
                            style={{ color: "var(--color-matrix)" }}
                          >
                            ★
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
