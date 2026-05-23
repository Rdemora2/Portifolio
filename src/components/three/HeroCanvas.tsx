"use client"

import { Canvas } from "@react-three/fiber"
import { useRef, useEffect } from "react";
import { Suspense } from "react"
import { GeometricCore } from "./GeometricCore"
import { ParticleField } from "./ParticleField"
import { useAdaptiveDpr } from "@/hooks/useAdaptiveDpr"

interface HeroCanvasProps {
  mouse: { x: number; y: number }
}

export function HeroCanvas({ mouse }: HeroCanvasProps) {
  const dpr = useAdaptiveDpr()

  return (
    <Canvas
      dpr={[1, dpr]}
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
