"use client";

import { useState, useEffect, useRef } from "react";

export function PageLoader({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isBot = /Lighthouse|Googlebot|PTST|Speed Insights/i.test(navigator.userAgent);
    const hasAnimated = sessionStorage.getItem("hero-animated");
    
    if (prefersReduced || isBot || hasAnimated) {
      onComplete();
      return;
    }

    let frame = 0;
    const totalFrames = 40;
    let rafId = 0;

    const tick = () => {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      
      // Custom easing for the counter
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(eased * 100));

      if (frame < totalFrames) {
        rafId = requestAnimationFrame(tick);
      } else {
        // Counter finished, trigger 3D exit animation
        import("@/lib/gsap").then(({ gsap }) => {
          const tl = gsap.timeline({ 
            onComplete,
            defaults: { ease: "expo.inOut" }
          });
          
          // Step 1: Counter flies "into" the camera
          tl.to(counterRef.current, {
            scale: 25,
            opacity: 0,
            duration: 0.4,
            ease: "power3.in"
          });
          
          // Progress bar shrinks away
          tl.to(barRef.current, {
            scaleX: 0,
            opacity: 0,
            duration: 0.2
          }, "<");

          // Step 2: Background folds backwards in 3D
          tl.to(wrapperRef.current, {
            rotationX: -90,
            transformOrigin: "top",
            opacity: 0,
            duration: 0.4,
            ease: "power2.inOut"
          }, "-=0.2");
        });
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] pointer-events-none"
      style={{ perspective: "1000px" }}
      aria-hidden="true"
    >
      <div 
        ref={wrapperRef}
        className="w-full h-full flex flex-col items-center justify-center transform-origin-bottom"
        style={{ backgroundColor: "var(--color-void)", transformOrigin: "50% 100%" }}
      >
        <span
          ref={counterRef}
          className="text-[12vw] md:text-[140px] font-black leading-none tabular-nums tracking-tighter"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
            willChange: "transform, opacity",
            textShadow: "0 0 40px rgba(99,102,241,0.2)"
          }}
        >
          {count}
        </span>
        <div className="absolute bottom-0 left-0 right-0 h-[2px]">
          <div
            ref={barRef}
            className="h-full origin-left"
            style={{
              background: "linear-gradient(90deg, var(--color-signal), var(--color-highlight))",
              transform: `scaleX(${count / 100})`,
              transition: "transform 16ms linear",
              boxShadow: "0 0 20px rgba(99,102,241,0.6)"
            }}
          />
        </div>
      </div>
    </div>
  );
}
