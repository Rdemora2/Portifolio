"use client";

import { useRef, useEffect } from "react";

export function SectionDivider({ 
  topColor = "var(--color-void)", 
  bottomColor = "var(--color-deep)",
  height = 40
}: { 
  topColor?: string; 
  bottomColor?: string;
  height?: number;
}) {
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
    
    // Create an offscreen canvas or resolve CSS variables
    const getCssVar = (name: string) => {
      if (name.startsWith("var(")) {
        const varName = name.slice(4, -1);
        return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      }
      return name;
    };

    const draw = () => {
      time += 0.01;
      const { width: w, height: h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);

      // Draw Top Background
      ctx.fillStyle = getCssVar(topColor);
      ctx.fillRect(0, 0, w, h);

      // Draw Wavy Bottom Background
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, h / 2);

      for (let x = 0; x <= w; x += 2) {
        const nx = x / w;
        const y =
          h / 2 +
          Math.sin(nx * Math.PI * 2 + time) * (h * 0.15) +
          Math.sin(nx * Math.PI * 4 + time * 1.5) * (h * 0.1);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      
      ctx.fillStyle = getCssVar(bottomColor);
      ctx.fill();

      // Subtle border on the wave
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const nx = x / w;
        const y =
          h / 2 +
          Math.sin(nx * Math.PI * 2 + time) * (h * 0.15) +
          Math.sin(nx * Math.PI * 4 + time * 1.5) * (h * 0.1);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      
      ctx.strokeStyle = "rgba(99, 102, 241, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [topColor, bottomColor]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height: `${height}px`, display: "block" }}
      aria-hidden="true"
    />
  );
}
