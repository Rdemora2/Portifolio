"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export function useLenis() {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const deviceMemory = navigator.deviceMemory;
    const isLowPower =
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
      (deviceMemory !== undefined && deviceMemory <= 4);

    if (prefersReduced || isLowPower) return;

    let isActive = true;
    let cleanupGsap: (() => void) | null = null;

    const lenis = new Lenis({
      lerp: 0.1, // Padrão
      smoothWheel: true,
      wheelMultiplier: 1.0,
    });

    const run = async () => {
      const mod = await import("@/lib/gsap");
      if (!isActive) return;
      const { gsap, ScrollTrigger } = mod;
      lenis.on("scroll", ScrollTrigger.update);

      const tick = (time: number) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      cleanupGsap = () => {
        gsap.ticker.remove(tick);
      };
    };

    run();

    return () => {
      isActive = false;
      cleanupGsap?.();
      lenis.destroy();
    };
  }, []);
}
