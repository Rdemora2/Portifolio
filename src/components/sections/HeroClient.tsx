"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useInView } from "@/hooks/useInView";
import FaultyTerminal from "@/components/shared/FaultyTerminal";

const GeometricCoreCompanion = dynamic(
  () => import("@/components/three/HeroCompanion").then((m) => ({ default: m.HeroCompanion })),
  { ssr: false }
);

interface HeroClientWrapperProps {
  children: React.ReactNode;
  isLoaded?: boolean;
}

export function HeroClientWrapper({ children, isLoaded = true }: HeroClientWrapperProps) {
  const [sectionInViewRef, isInView] = useInView<HTMLElement>({
    threshold: 0,
    rootMargin: "0px",
    triggerOnce: false,
  });

  const terminalWrapRef = useRef<HTMLDivElement>(null);

  const perf = useMemo(() => {
    if (typeof window === "undefined") {
      return { prefersReduced: false, isLowPower: false, isDesktop: false, dpr: 1 };
    }
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const deviceMemory = navigator.deviceMemory;
    const isLowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (deviceMemory !== undefined && deviceMemory <= 4);
    const isSmall = window.innerWidth < 768;
    const isDesktop = !isSmall && !isLowPower && window.matchMedia("(pointer: fine)").matches;
    const dpr = prefersReduced || isLowPower || isSmall ? 1 : 1.5;
    return { prefersReduced, isLowPower, isDesktop, dpr };
  }, []);

  // Parallax: FaultyTerminal scrolls at 0.85× speed
  useEffect(() => {
    const terminal = terminalWrapRef.current;
    if (!terminal || perf.prefersReduced) return;

    let ctx: { revert: () => void } | null = null;
    let isActive = true;

    const run = async () => {
      const mod = await import("@/lib/gsap");
      if (!isActive) return;
      const { gsap } = mod;
      ctx = gsap.context(() => {
        gsap.to(terminal, {
          yPercent: -15,
          ease: "none",
          scrollTrigger: {
            trigger: terminal.closest("section"),
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    };

    run();
    return () => {
      isActive = false;
      ctx?.revert();
    };
  }, [perf.prefersReduced]);

  // Entrance animation targeting classes inside children
  useEffect(() => {
    if (!isLoaded) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const section = sectionInViewRef.current || document.getElementById("hero");
    if (!section) return;

    const nameEl = section.querySelector(".hero-name") as HTMLElement;
    const titleEl = section.querySelector(".hero-title") as HTMLElement;
    const subtitleEl = section.querySelector(".hero-subtitle") as HTMLElement;
    const ctaEl = section.querySelector(".hero-cta") as HTMLElement;

    const hasAnimated = sessionStorage.getItem("hero-animated");
    if (hasAnimated) {
      if (nameEl) {
        const text = nameEl.textContent ?? "";
        nameEl.innerHTML = "";
        text.split(" ").forEach((word: string, wordIdx: number, words: string[]) => {
          const wordSpan = document.createElement("span");
          wordSpan.style.display = "inline-block";
          wordSpan.style.whiteSpace = "nowrap";
          word.split("").forEach((char: string) => {
            const charSpan = document.createElement("span");
            charSpan.style.display = "inline-block";
            charSpan.style.background = "linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-signal) 50%, var(--color-highlight) 100%)";
            charSpan.style.backgroundSize = "200% 200%";
            charSpan.style.webkitBackgroundClip = "text";
            charSpan.style.webkitTextFillColor = "transparent";
            charSpan.style.backgroundClip = "text";
            charSpan.textContent = char;
            wordSpan.appendChild(charSpan);
          });
          nameEl.appendChild(wordSpan);
          if (wordIdx < words.length - 1) {
            nameEl.appendChild(document.createTextNode(" "));
          }
        });
      }
      if (titleEl) titleEl.style.clipPath = "inset(0 0% 0 0)";
      if (subtitleEl) subtitleEl.style.opacity = "1";
      if (ctaEl) ctaEl.style.opacity = "1";
      return;
    }

    let ctx: { revert: () => void } | null = null;
    let isActive = true;

    const run = async () => {
      const mod = await import("@/lib/gsap");
      if (!isActive) return;
      const { gsap } = mod;
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          delay: 0.1,
          onComplete: () => {
            sessionStorage.setItem("hero-animated", "true");
          },
        });

        if (nameEl) {
          const text = nameEl.textContent ?? "";
          nameEl.innerHTML = "";
          text.split(" ").forEach((word: string, wordIdx: number, words: string[]) => {
            const wordSpan = document.createElement("span");
            wordSpan.style.display = "inline-block";
            wordSpan.style.whiteSpace = "nowrap";

            word.split("").forEach((char: string) => {
              const charSpan = document.createElement("span");
              charSpan.style.display = "inline-block";
              charSpan.style.willChange = "transform, opacity";
              charSpan.style.background = "linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-signal) 50%, var(--color-highlight) 100%)";
              charSpan.style.backgroundSize = "200% 200%";
              charSpan.style.webkitBackgroundClip = "text";
              charSpan.style.webkitTextFillColor = "transparent";
              charSpan.style.backgroundClip = "text";
              charSpan.className = "hero-char";
              charSpan.textContent = char;
              wordSpan.appendChild(charSpan);
            });

            nameEl.appendChild(wordSpan);

            if (wordIdx < words.length - 1) {
              nameEl.appendChild(document.createTextNode(" "));
            }
          });

          const chars = nameEl.querySelectorAll(".hero-char");
          tl.fromTo(
            chars,
            { y: 120, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1.2,
              stagger: 0.035,
              ease: "power4.out",
            },
            0.2,
          );
        }

        if (titleEl) {
          tl.fromTo(
            titleEl,
            { clipPath: "inset(0 100% 0 0)" },
            { clipPath: "inset(0 0% 0 0)", duration: 1, ease: "power4.out" },
            0.8,
          );
        }

        if (subtitleEl) {
          tl.fromTo(
            subtitleEl,
            { opacity: 0 },
            { opacity: 1, duration: 0.8 },
            1.2,
          );
        }

        if (ctaEl) {
          tl.fromTo(
            ctaEl,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8 },
            1.5,
          );
        }
      }, section);
    };

    run();

    return () => {
      isActive = false;
      ctx?.revert();
    };
  }, [isLoaded, sectionInViewRef]);

  return (
    <section id="hero" ref={sectionInViewRef} className="relative flex min-h-dvh items-center overflow-hidden">
      <div ref={terminalWrapRef} className="absolute inset-0 z-0 will-change-transform">
        <FaultyTerminal
          scale={1.2}
          gridMul={[1.5, 1]}
          digitSize={1.2}
          timeScale={0.25}
          pause={!isInView}
          scanlineIntensity={0.35}
          glitchAmount={0.7}
          flickerAmount={0.6}
          noiseAmp={0.7}
          chromaticAberration={0}
          dither={0}
          curvature={0.1}
          tint="#6366f1"
          mouseReact={isInView && !perf.prefersReduced}
          mouseStrength={0.5}
          pageLoadAnimation={false}
          brightness={0.6}
          dpr={1}
        />
      </div>

      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at 40% 50%, rgba(5,10,18,0.3) 0%, rgba(5,10,18,0.75) 55%, rgba(5,10,18,0.96) 100%)",
        }}
        aria-hidden="true"
      />

      {children}

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: "var(--color-text-muted)" }}
        aria-hidden="true"
      >
        <span
          className="text-[0.6rem] uppercase tracking-[0.25em]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          scroll
        </span>
        <div
          className="h-10 w-[1px] animate-scroll-indicator"
          style={{ backgroundColor: "var(--color-signal)", opacity: 0.5 }}
        />
      </div>
    </section>
  );
}

export function HeroCompanionInjector() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const handleDrawer = (e: Event) => {
      const customEvent = e as CustomEvent<{ isOpen: boolean }>;
      setIsDrawerOpen(customEvent.detail.isOpen);
    };
    window.addEventListener("drawerStateChange", handleDrawer);
    return () => window.removeEventListener("drawerStateChange", handleDrawer);
  }, []);

  const perf = useMemo(() => {
    if (typeof window === "undefined") {
      return { prefersReduced: false, isLowPower: false, isDesktop: false, dpr: 1 };
    }
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const deviceMemory = navigator.deviceMemory;
    const isLowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (deviceMemory !== undefined && deviceMemory <= 4);
    const isSmall = window.innerWidth < 768;
    const isDesktop = !isSmall && !isLowPower && window.matchMedia("(pointer: fine)").matches;
    return { prefersReduced, isLowPower, isDesktop };
  }, []);

  // Use IntersectionObserver specifically for the companion
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? false));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const [isMounted, setIsMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setIsMounted(true), []);

  if (!isMounted || !perf.isDesktop || isDrawerOpen || !inView) {
    return <div ref={ref} className="hidden lg:block flex-shrink-0" style={{ width: "340px", height: "340px" }} aria-hidden="true" />;
  }

  return (
    <div ref={ref} className="hidden lg:block flex-shrink-0" style={{ width: "340px", height: "340px", opacity: 0.8 }} aria-hidden="true">
      <GeometricCoreCompanion />
    </div>
  );
}
