"use client"

import { useEffect, useRef } from "react"

export function Noise() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const drawNoise = () => {
      const w = canvas.width
      const h = canvas.height
      const idata = ctx.createImageData(w, h)
      const buffer32 = new Uint32Array(idata.data.buffer)
      const len = buffer32.length

      for (let i = 0; i < len; i++) {
        if (Math.random() < 0.1) {
          buffer32[i] = 0xffffffff // white dot
        }
      }

      ctx.putImageData(idata, 0, 0)
    }

    const loop = () => {
      drawNoise()
      animationFrameId = requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener("resize", resize)
    loop()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[99999]"
      style={{
        opacity: 0.04, // Very subtle
        mixBlendMode: "overlay"
      }}
      aria-hidden="true"
    />
  )
}
