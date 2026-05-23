"use client";

import { useMemo, useRef, useEffect } from "react";
import { personalInfo } from "@/data/portfolio";
import FaultyTerminal from "@/components/shared/FaultyTerminal";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { useInView } from "@/hooks/useInView";

export function Hero({ isLoaded = true }: { isLoaded?: boolean }) {
  const [sectionInViewRef, isInView] = useInView<HTMLElement>({
    threshold: 0.1,
    rootMargin: "200px",
    triggerOnce: false,
  });
  const nameRef = useRef<HTMLHeadingElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const perf = useMemo(() => {
    if (typeof window === "undefined") {
      return { prefersReduced: false, isLowPower: false, dpr: 1 };
    }
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const deviceMemory = navigator.deviceMemory;
    const isLowPower =
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
      (deviceMemory !== undefined && deviceMemory <= 4);
    const isSmall = window.innerWidth < 768;
    const dpr = prefersReduced || isLowPower || isSmall ? 1 : 1.5;
    return { prefersReduced, isLowPower, dpr };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const hasAnimated = sessionStorage.getItem("hero-animated");
    if (hasAnimated) {
      if (nameRef.current) {
        const text = nameRef.current.textContent ?? "";
        nameRef.current.innerHTML = "";
        text.split(" ").forEach((word, wordIdx, words) => {
          const wordSpan = document.createElement("span");
          wordSpan.style.display = "inline-block";
          wordSpan.style.whiteSpace = "nowrap";
          word.split("").forEach((char) => {
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
          nameRef.current?.appendChild(wordSpan);
          if (wordIdx < words.length - 1) {
            nameRef.current?.appendChild(document.createTextNode(" "));
          }
        });
      }
      if (titleRef.current) titleRef.current.style.clipPath = "inset(0 0% 0 0)";
      if (subtitleRef.current) subtitleRef.current.style.opacity = "1";
      if (ctaRef.current) ctaRef.current.style.opacity = "1";
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

        if (nameRef.current) {
          const text = nameRef.current.textContent ?? "";
          nameRef.current.innerHTML = "";
          text.split(" ").forEach((word, wordIdx, words) => {
            const wordSpan = document.createElement("span");
            wordSpan.style.display = "inline-block";
            wordSpan.style.whiteSpace = "nowrap";

            word.split("").forEach((char) => {
              const charSpan = document.createElement("span");
              charSpan.style.display = "inline-block";
              charSpan.style.willChange = "transform, opacity";
              charSpan.style.background = "linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-signal) 50%, var(--color-highlight) 100%)";
              charSpan.style.backgroundSize = "200% 200%";
              charSpan.style.webkitBackgroundClip = "text";
              charSpan.style.webkitTextFillColor = "transparent";
              (charSpan.style as unknown as Record<string, string>).backgroundClip = "text";
              charSpan.className = "hero-char";
              charSpan.textContent = char;
              wordSpan.appendChild(charSpan);
            });

            nameRef.current?.appendChild(wordSpan);

            if (wordIdx < words.length - 1) {
              nameRef.current?.appendChild(document.createTextNode(" "));
            }
          });
          
          const chars = nameRef.current.querySelectorAll(".hero-char");
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

        if (titleRef.current) {
          tl.fromTo(
            titleRef.current,
            { clipPath: "inset(0 100% 0 0)" },
            { clipPath: "inset(0 0% 0 0)", duration: 1, ease: "power4.out" },
            0.8,
          );
        }

        if (subtitleRef.current) {
          tl.fromTo(
            subtitleRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.8 },
            1.2,
          );
        }

        if (ctaRef.current) {
          tl.fromTo(
            ctaRef.current,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8 },
            1.5,
          );
        }
      }, sectionInViewRef);
    };

    run();

    return () => {
      isActive = false;
      ctx?.revert();
    };
  }, [isLoaded, sectionInViewRef]);

  return (
    <section
      id="hero"
      ref={sectionInViewRef}
      className="relative flex min-h-dvh items-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
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
            "radial-gradient(ellipse at 60% 50%, rgba(5,10,18,0.5) 0%, rgba(5,10,18,0.85) 60%, rgba(5,10,18,0.95) 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1
            ref={nameRef}
            className="mb-4 font-extrabold leading-none"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-hero)",
              letterSpacing: "-0.03em",
              color: "var(--color-text-primary)",
              overflowWrap: "break-word",
              wordBreak: "normal",
            }}
          >
            {personalInfo.name}
          </h1>

          <p
            ref={titleRef}
            className="mb-4 font-semibold uppercase"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-signal)",
              clipPath: "inset(0 100% 0 0)",
              fontSize: "clamp(0.875rem, 1vw + 0.5rem, var(--text-lg))",
              letterSpacing: "0.15em",
            }}
          >
            {personalInfo.title}
          </p>

          <p
            ref={subtitleRef}
            className="mb-8 tracking-widest opacity-0 sm:mb-10"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-secondary)",
              fontSize: "clamp(0.75rem, 0.5vw + 0.625rem, 1rem)",
            }}
          >
            <span className="typewriter">{personalInfo.subtitle}</span>
            <span
              className="ml-0.5 inline-block h-5 w-[2px] animate-blink align-text-bottom"
              style={{ backgroundColor: "var(--color-signal)" }}
            />
          </p>

          <div ref={ctaRef} className="flex flex-wrap gap-3 opacity-0 sm:gap-4">
            <MagneticButton
              href="#projects"
              className="rounded-full border border-[var(--color-signal)] text-[var(--color-signal)] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-200 hover:bg-[var(--color-signal)] hover:text-[var(--color-void)] sm:px-8 sm:py-3 sm:text-sm"
              style={{
                fontFamily: "var(--font-body)",
              }}
              ariaLabel="Ver projetos"
            >
              Ver projetos
            </MagneticButton>
            <MagneticButton
              href="#contact"
              className="rounded-full border border-[var(--color-edge)] text-[var(--color-text-secondary)] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-200 hover:border-[var(--color-text-secondary)] sm:px-8 sm:py-3 sm:text-sm"
              style={{
                fontFamily: "var(--font-body)",
              }}
              ariaLabel="Entrar em contato"
            >
              Contato
            </MagneticButton>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        style={{ color: "var(--color-text-muted)" }}
      >
        <svg
          width="20"
          height="30"
          viewBox="0 0 20 30"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="1"
            y="1"
            width="18"
            height="28"
            rx="9"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            cx="10"
            cy="10"
            r="2"
            fill="currentColor"
            className="animate-scroll-indicator"
          />
        </svg>
      </div>
    </section>
  );
}
