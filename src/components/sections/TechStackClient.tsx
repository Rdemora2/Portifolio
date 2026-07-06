"use client";

import { useEffect, useMemo, useRef } from "react";
import { useInView } from "@/hooks/useInView";

interface TechStackPhysicsWrapperProps {
  children: React.ReactNode;
}

export function TechStackPhysicsWrapper({ children }: TechStackPhysicsWrapperProps) {
  const [sectionRef, inView] = useInView<HTMLDivElement>({
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
  const tagRectsRef = useRef<(DOMRect | null)[]>([]);
  const containerRectRef = useRef<DOMRect | null>(null);
  const currentOffsets = useRef<{ x: number; y: number }[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (prefersReduced || isTouch || !inView) return;

    const container = containerRef.current;
    if (!container) return;

    const tagElements = Array.from(container.querySelectorAll(".tech-tag")) as HTMLElement[];
    const allTags = tagElements.length;
    
    if (currentOffsets.current.length === 0 || currentOffsets.current.length !== allTags) {
      currentOffsets.current = Array.from({ length: allTags }, () => ({
        x: 0,
        y: 0,
      }));
    }

    const updateRects = () => {
      containerRectRef.current = container.getBoundingClientRect();
      tagRectsRef.current = tagElements.map((tag) => tag.getBoundingClientRect());
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
      const mouse = mouseRef.current;

      tagElements.forEach((tag, i) => {
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
    tagElements.forEach((tag) => {
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

  return (
    <div ref={sectionRef}>
      <div ref={containerRef}>
        {children}
      </div>
    </div>
  );
}
