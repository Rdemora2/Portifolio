"use client"

import { Canvas } from "@react-three/fiber"
import { useState } from "react"
import { Suspense } from "react"
import { GeometricCore } from "./GeometricCore"
import { ParticleField } from "./ParticleField"

interface HeroCanvasProps {
  mouse: { x: number; y: number }
}

export function HeroCanvas({ mouse }: HeroCanvasProps) {
  const [dpr] = useState<[number, number]>(() => {
    if (typeof window === "undefined") return [1, 1.5]
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number })
      .deviceMemory
    const isLowPower =
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
      (deviceMemory !== undefined && deviceMemory <= 4)
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    const isSmall = window.innerWidth < 768
    const maxDpr = isLowPower || prefersReduced || isSmall ? 1 : 1.5
    return [1, maxDpr]
  })

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0, 6], fov: 55 }}
      style={{ position: "absolute", inset: 0, zIndex: 0 }}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.1} />
        <GeometricCore mouse={mouse} />
        <ParticleField mouse={mouse} />
      </Suspense>
    </Canvas>
  )
}
