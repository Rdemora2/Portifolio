"use client";

import { useState, useEffect, useRef } from "react";

export function PageLoader({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);
  const loaderRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const gsapRef = useRef<null | { gsap: typeof import("gsap").gsap }>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      onComplete();
      return;
    }

    let frame = 0;
    const totalFrames = 60;
    const rafId = { current: 0 };

    const loadGsap = async () => {
      if (gsapRef.current) return gsapRef.current;
      const mod = await import("@/lib/gsap");
      gsapRef.current = mod;
      return mod;
    };

    const tick = () => {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * 100));

      if (frame < totalFrames) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        loadGsap().then((mod) => {
          if (!mod) return;
          const tl = mod.gsap.timeline({ onComplete });
          tl.to(counterRef.current, {
            y: "-100%",
            opacity: 0,
            duration: 0.6,
            ease: "power3.inOut",
          });
          tl.to(
            barRef.current,
            {
              scaleX: 0,
              duration: 0.4,
              ease: "power3.inOut",
            },
            "-=0.3",
          );
          tl.to(
            loaderRef.current,
            {
              clipPath: "circle(0% at 50% 50%)",
              duration: 0.8,
              ease: "power3.inOut",
            },
            "-=0.2",
          );
        });
      }
    };

    rafId.current = requestAnimationFrame(tick);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [onComplete]);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        backgroundColor: "var(--color-void)",
        clipPath: "circle(150% at 50% 50%)",
      }}
    >
      <span
        ref={counterRef}
        className="text-[120px] font-mono leading-none tabular-nums"
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--color-text-primary)",
        }}
      >
        {count}
      </span>
      <div className="absolute bottom-0 left-0 right-0 h-[2px]">
        <div
          ref={barRef}
          className="h-full origin-left"
          style={{
            backgroundColor: "var(--color-signal)",
            transform: `scaleX(${count / 100})`,
            transition: "transform 16ms linear",
          }}
        />
      </div>
    </div>
  );
}
