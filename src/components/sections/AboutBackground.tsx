"use client"

import dynamic from "next/dynamic"
import { useInView } from "@/hooks/useInView"

const FloatingGridCanvas = dynamic(
  () => import("@/components/three/FloatingGrid").then((m) => ({ default: m.FloatingGridCanvas })),
  { ssr: false }
)

const NeuralBackground = dynamic(
  () => import("@/components/shared/NeuralBackground").then((m) => ({ default: m.NeuralBackground })),
  { ssr: false }
)

export function AboutBackground() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0, rootMargin: "400px", triggerOnce: false })

  return (
    <div ref={ref} className="absolute inset-0 z-0 pointer-events-none">
      {inView && <FloatingGridCanvas />}
      {inView && <NeuralBackground />}
    </div>
  )
}
