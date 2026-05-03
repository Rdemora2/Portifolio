"use client";

import { useRef, useEffect } from "react";

export function SectionDivider() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ width: 0, height: 0, ratio: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(ratio, ratio);
      sizeRef.current = { width, height, ratio };
    };
    resize();
    window.addEventListener("resize", resize);

    let rafId: number;
    let time = 0;

    const draw = () => {
      time += 0.015;
      const { width: w, height: h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);

      ctx.beginPath();
      ctx.moveTo(0, h / 2);

      for (let x = 0; x <= w; x += 2) {
        const nx = x / w;
        const y =
          h / 2 +
          Math.sin(nx * Math.PI * 4 + time * 2) * 3 +
          Math.sin(nx * Math.PI * 8 + time * 1.5) * 1.5 +
          Math.sin(nx * Math.PI * 2 + time * 0.8) * 2;
        ctx.lineTo(x, y);
      }

      const gradient = ctx.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(0, "rgba(99, 102, 241, 0)");
      gradient.addColorStop(0.2, "rgba(99, 102, 241, 0.4)");
      gradient.addColorStop(0.5, "rgba(0, 255, 136, 0.6)");
      gradient.addColorStop(0.8, "rgba(99, 102, 241, 0.4)");
      gradient.addColorStop(1, "rgba(99, 102, 241, 0)");

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // glow pass
      ctx.shadowBlur = 8;
      ctx.shadowColor = "rgba(99, 102, 241, 0.3)";
      ctx.stroke();
      ctx.shadowBlur = 0;

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-[20px] w-full"
      style={{ backgroundColor: "transparent" }}
      aria-hidden="true"
    />
  );
}
