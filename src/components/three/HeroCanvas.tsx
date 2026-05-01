"use client"

import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import { GeometricCore } from "./GeometricCore"
import { ParticleField } from "./ParticleField"

interface HeroCanvasProps {
  mouse: { x: number; y: number }
}

export function HeroCanvas({ mouse }: HeroCanvasProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
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
