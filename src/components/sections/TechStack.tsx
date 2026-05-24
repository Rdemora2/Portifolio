"use client";

import { useEffect, useMemo, useRef } from "react";
import { techStack } from "@/data/portfolio";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { TECH_CATEGORY_COLORS } from "@/lib/constants";
import { useInView } from "@/hooks/useInView";

import LogoLoop from "@/components/shared/LogoLoop";
import { useTranslations } from "next-intl";
import { FaAws } from "react-icons/fa";
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiGo,
  SiNodedotjs,
  SiPython,
  SiDocker,
  SiKubernetes,
  SiPostgresql,
  SiGraphql,
} from "react-icons/si";

const techLogos = [
  { node: <SiReact size={36} color="#61DAFB" /> },
  { node: <SiNextdotjs size={36} color="#ffffff" /> },
  { node: <SiTypescript size={36} color="#3178C6" /> },
  { node: <SiTailwindcss size={36} color="#06B6D4" /> },
  { node: <SiGo size={36} color="#00ADD8" /> },
  { node: <SiNodedotjs size={36} color="#339933" /> },
  { node: <SiPython size={36} color="#3776AB" /> },
  { node: <SiDocker size={36} color="#2496ED" /> },
  { node: <SiKubernetes size={36} color="#326CE5" /> },
  { node: <FaAws size={36} color="#FF9900" /> },
  { node: <SiPostgresql size={36} color="#4169E1" /> },
  { node: <SiGraphql size={36} color="#E10098" /> },
];

export function TechStack() {
  const t = useTranslations("About.pillars");
  const tn = useTranslations("Nav");
  const [sectionRef, inView] = useInView<HTMLElement>({
    threshold: 0,
    rootMargin: "200px",
    triggerOnce: false,
  });
  const prefersReduced = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
  const isTouch = useMemo(() => {
    if (typeof window === "undefined") return false;
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }, []);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const tagRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tagRectsRef = useRef<(DOMRect | null)[]>([]);
  const containerRectRef = useRef<DOMRect | null>(null);
  const currentOffsets = useRef<{ x: number; y: number }[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (prefersReduced || isTouch || !inView) return;

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
  }, [prefersReduced, isTouch, inView]);

  const grouped = techStack.reduce<Record<string, typeof techStack>>(
    (acc, tech) => {
      if (!acc[tech.category]) acc[tech.category] = [];
      acc[tech.category]?.push(tech);
      return acc;
    },
    {},
  );

  return (
    <section
      id="tech"
      ref={sectionRef}
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
            {tn("tech_small") || "O que eu uso"}
          </p>
          <h2
            className="mb-8 font-bold sm:mb-12"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
              fontSize: "var(--text-3xl)",
            }}
          >
            {tn("tech")}
          </h2>
        </ScrollReveal>

        <div className="mb-12 sm:mb-20">
          <LogoLoop
            logos={techLogos}
            speed={60}
            direction="left"
            logoHeight={48}
            gap={40}
            fadeOut={true}
            fadeOutColor="var(--color-deep)"
            scaleOnHover={true}
            pauseOnHover={true}
          />
        </div>

        <div
          ref={containerRef}
          className="grid gap-8 sm:gap-12 sm:grid-cols-2 lg:grid-cols-3"
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
                        TECH_CATEGORY_COLORS[category as keyof typeof TECH_CATEGORY_COLORS] ?? "#6366f1",
                    }}
                  />
                  <span
                    style={{
                      color: TECH_CATEGORY_COLORS[category as keyof typeof TECH_CATEGORY_COLORS] ?? "#6366f1",
                    }}
                  >
                    {t(category) || category}
                  </span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {items.map((tech) => {
                    const currentIndex = techStack.findIndex((t) => t.name === tech.name);
                    return (
                      <span
                        key={tech.name}
                        ref={(el) => {
                          tagRefs.current[currentIndex] = el;
                        }}
                        className="cursor-default rounded-full border px-3 py-1.5 text-xs transition-all duration-200 hover:border-[var(--color-signal)] hover:text-[var(--color-signal)]"
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
