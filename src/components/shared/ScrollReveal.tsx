"use client";

import React, { useRef, useEffect, type ReactNode, type ElementType } from "react";

/**
 * ScrollReveal — Motion taxonomy dispatcher.
 *
 * Five semantic animation classes, each communicating a different visual weight:
 *
 * - "title"    → short rise + opacity. For h1, h2 without clipping glyphs.
 * - "body"     → restrained rise + opacity. For supporting copy.
 * - "stat"     → subtle scale + opacity. For numbers, badges, metrics.
 * - "card"     → translateY(24px→0) + opacity, staggered. For cards/list items.
 * - "ambient"  → scaleX or opacity, fast. For decorative lines and dividers.
 * - "fade-up"  → legacy default (y60 + opacity). Preserved for unclassified use.
 *
 * All classes respect prefers-reduced-motion (content is revealed immediately).
 * Content is visible by default, so a failed import or disabled JavaScript never
 * leaves important text permanently clipped or transparent.
 * Uses the browser's Web Animations API, so reveal effects do not pull an
 * animation runtime into the initial bundle.
 *
 * Server HTML stays visible. Effects start just before content enters the
 * viewport, without preparing animations or forcing layout for every section
 * during hydration. Initially visible text never waits for an entrance effect.
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
  // The complete taxonomy stays on compositor-friendly transform + opacity.
  // Small distances preserve hierarchy without making the page feel theatrical.
  "title": {
    from: { transform: "translate3d(0, 18px, 0)", opacity: 0 },
    to:   { transform: "translate3d(0, 0, 0)", opacity: 1 },
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    dur:  0.72,
  },
  // Body copy follows with less distance and a slightly softer cadence.
  "body": {
    from: { transform: "translate3d(0, 12px, 0)", opacity: 0 },
    to:   { transform: "translate3d(0, 0, 0)", opacity: 1 },
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    dur:  0.62,
  },
  // Stats retain a little weight without the previous elastic overshoot.
  "stat": {
    from: { transform: "scale(0.94)", opacity: 0 },
    to:   { transform: "scale(1)", opacity: 1 },
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    dur:  0.68,
  },
  // Card: vertical rise — list items appear in sequence
  "card": {
    from: { transform: "translate3d(0, 24px, 0)", opacity: 0 },
    to:   { transform: "translate3d(0, 0, 0)", opacity: 1 },
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    dur:  0.66,
  },
  // Ambient: scale from center — decorative elements self-organize
  "ambient": {
    from: { transform: "scaleX(0.72)", opacity: 0 },
    to:   { transform: "scaleX(1)", opacity: 1 },
    easing: "cubic-bezier(0.65, 0, 0.35, 1)",
    dur:  0.4,
  },
  // Legacy variants — kept for backwards compatibility
  "fade-up":     { from: { transform: "translate3d(0, 28px, 0)", opacity: 0 }, to: { transform: "translate3d(0, 0, 0)", opacity: 1 }, easing: "cubic-bezier(0.16, 1, 0.3, 1)", dur: 0.7 },
  "fade-in":     { from: { opacity: 0 }, to: { opacity: 1 }, easing: "cubic-bezier(0.22, 1, 0.36, 1)", dur: 0.6 },
  "slide-left":  { from: { transform: "translate3d(-30px, 0, 0)", opacity: 0 }, to: { transform: "translate3d(0, 0, 0)", opacity: 1 }, easing: "cubic-bezier(0.16, 1, 0.3, 1)", dur: 0.7 },
  "slide-right": { from: { transform: "translate3d(30px, 0, 0)", opacity: 0 }, to: { transform: "translate3d(0, 0, 0)", opacity: 1 }, easing: "cubic-bezier(0.16, 1, 0.3, 1)", dur: 0.7 },
  "scale":       { from: { transform: "scale(0.95)", opacity: 0 }, to: { transform: "scale(1)", opacity: 1 }, easing: "cubic-bezier(0.16, 1, 0.3, 1)", dur: 0.68 },
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

    if (motionQuery.matches || !window.IntersectionObserver || !el.animate) {
      revealImmediately();
      return;
    }

    const finalDuration = duration ?? config.dur ?? 0.8;

    let runningAnimation: Animation | null = null;
    let hasObserved = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const initialObservation = !hasObserved;
        hasObserved = true;
        if (!entry?.isIntersecting) return;

        observer.disconnect();
        if (initialObservation && entry.boundingClientRect.top < window.innerHeight) return;

        try {
          runningAnimation = el.animate([config.from, config.to], {
            duration: finalDuration * 1000,
            delay: delay * 1000,
            easing: config.easing,
            fill: "both",
          });
          runningAnimation.addEventListener("finish", () => {
            revealImmediately();
            runningAnimation?.cancel();
            runningAnimation = null;
          }, { once: true });
        } catch {
          runningAnimation?.cancel();
          runningAnimation = null;
          revealImmediately();
        }
      },
      { threshold, rootMargin: "0px 0px 160px 0px" },
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

    const revealOnFocus = (event: FocusEvent) => {
      // Pointer focus occurs between press and release. Snapping the transform
      // here can move a link away from the pointer and discard the click.
      if (!(event.target instanceof Element) || !event.target.matches(":focus-visible")) return;
      observer.disconnect();
      runningAnimation?.cancel();
      runningAnimation = null;
      revealImmediately();
    };
    el.addEventListener("focusin", revealOnFocus);

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
      el.removeEventListener("focusin", revealOnFocus);
      observer.disconnect();

      if (runningAnimation) {
        // Animation was mid-flight: cancel and snap to visible so content
        // isn't left in an invisible state after a deps change or fast-refresh.
        runningAnimation.cancel();
        runningAnimation = null;
        revealImmediately();
      }
      // If runningAnimation is null the finish handler already called
      // revealImmediately(), so the element's inline styles are correct.
    };
  }, [animation, delay, duration, threshold]);

  return React.createElement(
    Tag,
    {
      ref,
      className,
      "data-scroll-reveal": "",
      "data-reveal-variant": animation,
    },
    children,
  );
}
