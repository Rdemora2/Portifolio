"use client";

import type { ReactNode } from "react";

interface GradientBorderProps {
  children: ReactNode;
  className?: string;
  borderWidth?: number;
  animated?: boolean;
}

export function GradientBorder({
  children,
  className = "",
  borderWidth = 1,
  animated = true,
}: GradientBorderProps) {
  return (
    <div
      className={`relative rounded-2xl ${className}`}
      style={{ padding: borderWidth }}
    >
      <div
        className={`absolute inset-0 rounded-2xl ${animated ? "animate-gradient-rotate" : ""}`}
        style={{
          background:
            "conic-gradient(from 0deg, var(--color-signal), var(--color-matrix), var(--color-pulse), var(--color-signal))",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: borderWidth,
          borderRadius: "inherit",
        }}
      />
      <div className="relative rounded-2xl bg-[var(--color-deep)] h-full">
        {children}
      </div>
    </div>
  );
}
