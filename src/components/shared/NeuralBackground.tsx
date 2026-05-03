"use client"

import { useRef, useEffect, useState } from "react"

interface NeuralNode {
  x: number
  y: number
  layer: number
  baseY: number
}

interface NeuralConnection {
  from: number
  to: number
  weight: number
}

export function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const sizeRef = useRef({ width: 0, height: 0, ratio: 1 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0

    // Skip on mobile for performance
    const isMobile = window.innerWidth < 768
    if (isMobile) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight
      canvas.width = width * ratio
      canvas.height = height * ratio
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(ratio, ratio)
      sizeRef.current = { width, height, ratio }
    }
    resize()
    window.addEventListener("resize", resize)

    // Generate neural network topology
    const w = sizeRef.current.width
    const h = sizeRef.current.height
    const layers = [4, 6, 8, 6, 4, 3]
    const nodes: NeuralNode[] = []
    const connections: NeuralConnection[] = []

    const layerSpacing = w / (layers.length + 1)

    layers.forEach((count, layerIdx) => {
      const x = layerSpacing * (layerIdx + 1)
      const nodeSpacing = h / (count + 1)
      for (let i = 0; i < count; i++) {
        const y = nodeSpacing * (i + 1)
        nodes.push({ x, y, layer: layerIdx, baseY: y })
      }
    })

    // Connect adjacent layers
    let nodeOffset = 0
    for (let l = 0; l < layers.length - 1; l++) {
      const currentCount = layers[l]!
      const nextCount = layers[l + 1]!
      const nextOffset = nodeOffset + currentCount

      for (let i = 0; i < currentCount; i++) {
        for (let j = 0; j < nextCount; j++) {
          // Only connect some nodes for sparsity (attention-like)
          if (Math.random() < 0.6) {
            connections.push({
              from: nodeOffset + i,
              to: nextOffset + j,
              weight: 0.2 + Math.random() * 0.8,
            })
          }
        }
      }
      nodeOffset += currentCount
    }

    setIsVisible(true)

    if (prefersReduced || isTouch) {
      // Static render
      const { width: cw, height: ch } = sizeRef.current
      ctx.clearRect(0, 0, cw, ch)

      connections.forEach((conn) => {
        const fromNode = nodes[conn.from]
        const toNode = nodes[conn.to]
        if (!fromNode || !toNode) return

        ctx.beginPath()
        ctx.moveTo(fromNode.x, fromNode.y)
        ctx.lineTo(toNode.x, toNode.y)
        ctx.strokeStyle = `rgba(99, 102, 241, ${conn.weight * 0.06})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      })

      nodes.forEach((node) => {
        ctx.beginPath()
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(99, 102, 241, 0.12)"
        ctx.fill()
      })

      return () => {
        window.removeEventListener("resize", resize)
      }
    }

    let rafId: number
    let time = 0

    const draw = () => {
      time += 0.008
      const { width: cw, height: ch } = sizeRef.current
      ctx.clearRect(0, 0, cw, ch)

      // Animate node positions subtly
      nodes.forEach((node) => {
        node.y = node.baseY + Math.sin(time * 0.5 + node.x * 0.01 + node.layer * 0.8) * 3
      })

      // Draw connections with pulsing "attention" weights
      connections.forEach((conn) => {
        const fromNode = nodes[conn.from]
        const toNode = nodes[conn.to]
        if (!fromNode || !toNode) return

        const pulse = (Math.sin(time * 1.5 + conn.from * 0.3 + conn.to * 0.2) * 0.5 + 0.5) * conn.weight
        const alpha = pulse * 0.08

        ctx.beginPath()
        ctx.moveTo(fromNode.x, fromNode.y)
        ctx.lineTo(toNode.x, toNode.y)
        ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`
        ctx.lineWidth = 0.5 + pulse * 0.5
        ctx.stroke()
      })

      // Draw nodes
      nodes.forEach((node, idx) => {
        const pulse = Math.sin(time + idx * 0.4) * 0.5 + 0.5
        const radius = 1.5 + pulse * 1

        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(99, 102, 241, ${0.08 + pulse * 0.07})`
        ctx.fill()

        // Subtle glow on some nodes
        if (idx % 3 === 0) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, radius * 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(99, 102, 241, ${pulse * 0.03})`
          ctx.fill()
        }
      })

      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full transition-opacity duration-1000"
      style={{ opacity: isVisible ? 1 : 0 }}
      aria-hidden="true"
    />
  )
}
