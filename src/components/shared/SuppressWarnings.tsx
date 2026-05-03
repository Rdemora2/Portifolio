"use client";

if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("THREE.Clock") || args[0].includes("THREE.Timer"))
    ) {
      return;
    }
    originalWarn(...args);
  };
}

export function SuppressWarnings() {
  return null;
}
