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
 * All classes respect prefers-reduced-motion (content is revealed immediately).
 * Content is visible by default, so a failed import or disabled JavaScript never
 * leaves important text permanently clipped or transparent.
 * Uses the browser's Web Animations API, so reveal effects do not pull an
 * animation runtime into the initial bundle.
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
  as?: ElementType;
}

// ── Animation configs per variant ───────────────────────────────────────────

interface AnimConfig {
  from: Keyframe;
  to: Keyframe;
  easing: string;
  dur?: number;
}

const ANIMATION_CONFIG: Record<RevealVariant, AnimConfig> = {
  // Title: clipPath per-element reveal — "cut" into view
  "title": {
    from: { clipPath: "inset(0 100% 0 0)", opacity: 1 },
    to:   { clipPath: "inset(0 0% 0 0)", opacity: 1 },
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    dur:  1.0,
  },
  // Body: blur dissolve without vertical movement — subordinate to titles
  "body": {
    from: { opacity: 0, filter: "blur(3px)" },
    to:   { opacity: 1, filter: "blur(0px)" },
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    dur:  0.7,
  },
  // Stat: elastic scale — numbers "arrive with weight"
  "stat": {
    from: { transform: "scale(0.82)", opacity: 0 },
    to:   { transform: "scale(1)", opacity: 1 },
    easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    dur:  0.9,
  },
  // Card: vertical rise — list items appear in sequence
  "card": {
    from: { transform: "translate3d(0, 40px, 0)", opacity: 0 },
    to:   { transform: "translate3d(0, 0, 0)", opacity: 1 },
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    dur:  0.7,
  },
  // Ambient: scale from center — decorative elements self-organize
  "ambient": {
    from: { scaleX: 0, opacity: 0 },
    to:   { scaleX: 1, opacity: 1 },
    easing: "cubic-bezier(0.65, 0, 0.35, 1)",
    dur:  0.4,
  },
  // Legacy variants — kept for backwards compatibility
  "fade-up":     { from: { transform: "translate3d(0, 60px, 0)", opacity: 0 }, to: { transform: "translate3d(0, 0, 0)", opacity: 1 }, easing: "cubic-bezier(0.16, 1, 0.3, 1)", dur: 0.8 },
  "fade-in":     { from: { opacity: 0 }, to: { opacity: 1 }, easing: "cubic-bezier(0.22, 1, 0.36, 1)", dur: 0.6 },
  "slide-left":  { from: { transform: "translate3d(-60px, 0, 0)", opacity: 0 }, to: { transform: "translate3d(0, 0, 0)", opacity: 1 }, easing: "cubic-bezier(0.16, 1, 0.3, 1)", dur: 0.8 },
  "slide-right": { from: { transform: "translate3d(60px, 0, 0)", opacity: 0 }, to: { transform: "translate3d(0, 0, 0)", opacity: 1 }, easing: "cubic-bezier(0.16, 1, 0.3, 1)", dur: 0.8 },
  "scale":       { from: { transform: "scale(0.8)", opacity: 0 }, to: { transform: "scale(1)", opacity: 1 }, easing: "cubic-bezier(0.16, 1, 0.3, 1)", dur: 0.8 },
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

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const config = ANIMATION_CONFIG[animation];

    if (!config) return;

    const revealImmediately = () => {
      el.style.opacity = "1";
      el.style.transform = "none";
      el.style.filter = "none";
      el.style.clipPath = "none";
      el.style.willChange = "";
    };

    if (motionQuery.matches) {
      revealImmediately();
      return;
    }

    const finalDuration = duration ?? config.dur ?? 0.8;

    let runningAnimation: Animation | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;

        observer.disconnect();
        el.style.willChange = "transform, opacity, filter, clip-path";
        runningAnimation = el.animate([config.from, config.to], {
          duration: finalDuration * 1000,
          delay: delay * 1000,
          easing: config.easing,
          fill: "both",
        });
        runningAnimation.addEventListener(
          "finish",
          () => {
            revealImmediately();
            runningAnimation?.cancel();
            runningAnimation = null;
          },
          { once: true },
        );
      },
      { threshold },
    );

    const handleMotionChange = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      observer.disconnect();
      runningAnimation?.cancel();
      runningAnimation = null;
      revealImmediately();
    };

    motionQuery.addEventListener("change", handleMotionChange);
    observer.observe(el);

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
      observer.disconnect();
      runningAnimation?.cancel();
      runningAnimation = null;
      revealImmediately();
    };
  }, [animation, delay, duration, threshold]);

  return React.createElement(
    Tag,
    { ref, className },
    children
  );
}
