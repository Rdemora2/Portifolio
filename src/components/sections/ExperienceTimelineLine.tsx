"use client";

import { useRef, useEffect } from "react";

export function ExperienceTimelineLine() {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lineRef.current) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const section = lineRef.current.closest("section");
    if (!section) return;

    let ctx: { revert: () => void } | null = null;
    let isActive = true;

    const run = async () => {
      const mod = await import("@/lib/gsap");
      if (!isActive) return;
      const { gsap } = mod;
      
      ctx = gsap.context(() => {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 60%",
              end: "bottom 40%",
              scrub: 1,
            },
          }
        );
      });
    };

    run();

    return () => {
      isActive = false;
      ctx?.revert();
    };
  }, []);

  return (
    <div
      ref={lineRef}
      className="absolute left-0 top-0 hidden h-full w-[1.5px] origin-top md:left-1/2 md:block md:-translate-x-1/2"
      style={{
        backgroundColor: "var(--color-signal)",
        opacity: 0.25,
        transformOrigin: "top center",
      }}
    />
  );
}
