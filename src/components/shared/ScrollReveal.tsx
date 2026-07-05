"use client";

import React, { useRef, useEffect, type ReactNode, type ElementType } from "react";

/**
 * ScrollReveal — Motion taxonomy dispatcher.
 *
 * Five semantic animation classes, each communicating a different visual weight:
 *
 * - "title"    → clipPath per-line reveal. For h1, h2. Feels "cut into view".
 * - "body"     → blur(2px→0) + opacity fade, no Y offset. For body text.
 * - "stat"     → elastic scale + opacity. For numbers, badges, metrics.
 * - "card"     → translateY(40px→0) + opacity, staggered. For cards/list items.
 * - "ambient"  → scaleX or opacity, fast. For decorative lines and dividers.
 * - "fade-up"  → legacy default (y60 + opacity). Preserved for unclassified use.
 *
 * All classes respect prefers-reduced-motion (opacity fallback only).
 * GSAP is lazy-imported to avoid blocking the initial JS bundle.
 */

type RevealVariant = "title" | "body" | "stat" | "card" | "ambient" | "fade-up" | "slide-left" | "slide-right" | "scale" | "fade-in";

interface ScrollRevealProps {
  children: ReactNode;
  /** Semantic animation class. Defaults to "fade-up" for backwards compat. */
  animation?: RevealVariant;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  /** Stagger offset when used in a list context (seconds per child). */
  stagger?: number;
  as?: ElementType;
}

// ── Animation configs per variant ───────────────────────────────────────────

type GsapFrom = Record<string, number | string>;
type GsapTo   = Record<string, number | string>;

interface AnimConfig {
  from: GsapFrom;
  to:   GsapTo;
  ease?: string;
  /** Override default duration */
  dur?: number;
}

const ANIMATION_CONFIG: Record<RevealVariant, AnimConfig> = {
  // Title: clipPath per-element reveal — "cut" into view
  "title": {
    from: { clipPath: "inset(0 100% 0 0)", opacity: 1 },
    to:   { clipPath: "inset(0 0% 0 0)", opacity: 1 },
    ease: "power4.out",
    dur:  1.0,
  },
  // Body: blur dissolve without vertical movement — subordinate to titles
  "body": {
    from: { opacity: 0, filter: "blur(3px)" },
    to:   { opacity: 1, filter: "blur(0px)" },
    ease: "power2.out",
    dur:  0.7,
  },
  // Stat: elastic scale — numbers "arrive with weight"
  "stat": {
    from: { scale: 0.82, opacity: 0 },
    to:   { scale: 1,    opacity: 1 },
    ease: "elastic.out(1, 0.6)",
    dur:  0.9,
  },
  // Card: vertical rise — list items appear in sequence
  "card": {
    from: { y: 40, opacity: 0 },
    to:   { y: 0,  opacity: 1 },
    ease: "power3.out",
    dur:  0.7,
  },
  // Ambient: scale from center — decorative elements self-organize
  "ambient": {
    from: { scaleX: 0, opacity: 0 },
    to:   { scaleX: 1, opacity: 1 },
    ease: "power2.inOut",
    dur:  0.4,
  },
  // Legacy variants — kept for backwards compatibility
  "fade-up":     { from: { y: 60, opacity: 0 }, to: { y: 0, opacity: 1 }, ease: "power3.out", dur: 0.8 },
  "fade-in":     { from: { opacity: 0 },        to: { opacity: 1 },        ease: "power2.out", dur: 0.6 },
  "slide-left":  { from: { x: -60, opacity: 0 },to: { x: 0, opacity: 1 }, ease: "power3.out", dur: 0.8 },
  "slide-right": { from: { x: 60, opacity: 0 }, to: { x: 0, opacity: 1 }, ease: "power3.out", dur: 0.8 },
  "scale":       { from: { scale: 0.8, opacity: 0 }, to: { scale: 1, opacity: 1 }, ease: "power3.out", dur: 0.8 },
};

// Reduced-motion fallback: just opacity, no spatial movement
const REDUCED_CONFIG: Partial<Record<RevealVariant, AnimConfig>> = {
  "title":   { from: { opacity: 0 }, to: { opacity: 1 }, dur: 0.4 },
  "body":    { from: { opacity: 0 }, to: { opacity: 1 }, dur: 0.3 },
  "stat":    { from: { opacity: 0 }, to: { opacity: 1 }, dur: 0.3 },
  "card":    { from: { opacity: 0 }, to: { opacity: 1 }, dur: 0.3 },
  "ambient": { from: { opacity: 0 }, to: { opacity: 1 }, dur: 0.2 },
};

export function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  duration,
  threshold = 0.2,
  className = "",
  as: Tag = "div",
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Choose full or reduced config
    const config = prefersReduced
      ? (REDUCED_CONFIG[animation] ?? ANIMATION_CONFIG[animation])
      : ANIMATION_CONFIG[animation];

    if (!config) return;

    const finalDuration = duration ?? config.dur ?? 0.8;

    let isActive = true;

    const setup = async () => {
      const mod = await import("@/lib/gsap");
      if (!isActive) return;
      mod.gsap.set(el, config.from);
    };

    setup();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          import("@/lib/gsap").then((mod) => {
            if (!isActive) return;
            mod.gsap.to(el, {
              ...config.to,
              duration: finalDuration,
              delay,
              ease: config.ease ?? "power3.out",
            });
            observer.disconnect();
          });
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => {
      isActive = false;
      observer.disconnect();
    };
  }, [animation, delay, duration, threshold]);

  const Component = Tag as any;
  return (
    <Component ref={ref} className={className}>
      {children}
    </Component>
  );
}
