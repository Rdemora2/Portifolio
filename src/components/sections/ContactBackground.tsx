"use client"

import dynamic from "next/dynamic"
import { useInView } from "@/hooks/useInView"

const WaveCanvas = dynamic(
  () => import("@/components/three/WaveCanvas").then((m) => ({ default: m.WaveCanvas })),
  { ssr: false }
)

export function ContactBackground() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0, rootMargin: "400px", triggerOnce: false })

  return (
    <div ref={ref} className="absolute inset-0 z-0 pointer-events-none">
      {inView && <WaveCanvas />}
    </div>
  )
}
