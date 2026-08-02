"use client"

import React, { useEffect, useRef, useMemo, useCallback } from "react"
import { Renderer, Program, Mesh, Triangle } from "ogl"

import { isBot } from "@/lib/is-bot"

type Vec3 = [number, number, number]

export interface LiquidChromeProps extends React.HTMLAttributes<HTMLDivElement> {
  baseColor?: Vec3
  speed?: number
  amplitude?: number
  frequencyX?: number
  frequencyY?: number
  interactive?: boolean
  dpr?: number
}

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragmentShader = `
precision mediump float;
uniform float uTime;
uniform vec3 uResolution;
uniform vec3 uBaseColor;
uniform float uAmplitude;
uniform float uFrequencyX;
uniform float uFrequencyY;
uniform vec2 uMouse;
varying vec2 vUv;

vec4 renderImage(vec2 uvCoord) {
    vec2 fragCoord = uvCoord * uResolution.xy;
    vec2 uv = (2.0 * fragCoord - uResolution.xy) / min(uResolution.x, uResolution.y);

    for (float i = 1.0; i <= 6.0; i++){
        uv.x += uAmplitude / i * cos(i * uFrequencyX * uv.y + uTime + uMouse.x * 3.14159);
        uv.y += uAmplitude / i * cos(i * uFrequencyY * uv.x + uTime + uMouse.y * 3.14159);
    }

    vec2 diff = (uvCoord - uMouse);
    float dist = length(diff);
    float falloff = exp(-dist * 20.0);
    float ripple = sin(10.0 * dist - uTime * 2.0) * 0.03;
    uv += (diff / (dist + 0.0001)) * ripple * falloff;

    float ridge = 0.5 + 0.5 * sin(uTime - uv.y - uv.x);
    float sheen = pow(ridge, 5.0);
    vec3 color = uBaseColor * (0.8 + 1.65 * ridge);
    color += vec3(0.18, 0.22, 0.50) * sheen;

    return vec4(clamp(color, 0.0, 0.72), 1.0);
}

void main() {
    gl_FragColor = renderImage(vUv);
}
`

const maximumDpr = 1.25
const targetFrameInterval = 1000 / 30

export function LiquidChrome({
  baseColor = [0.1, 0.1, 0.25],
  speed = 0.2,
  amplitude = 0.3,
  frequencyX = 3,
  frequencyY = 3,
  interactive = true,
  dpr = 1,
  className = "",
  style,
  ...rest
}: LiquidChromeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<Renderer | null>(null)
  const programRef = useRef<Program | null>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const smoothMouseRef = useRef({ x: 0.5, y: 0.5 })
  const boundsRef = useRef<DOMRect | null>(null)
  const pendingPointerRef = useRef({ x: 0, y: 0 })
  const pointerFrameRef = useRef(0)

  const baseColorKey = baseColor.join(",")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableBaseColor = useMemo(() => new Float32Array(baseColor), [baseColorKey])

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!interactive) return
      pendingPointerRef.current = { x: event.clientX, y: event.clientY }
      if (pointerFrameRef.current) return

      pointerFrameRef.current = requestAnimationFrame(() => {
        pointerFrameRef.current = 0
        const rect = boundsRef.current
        if (!rect || rect.width === 0 || rect.height === 0) return

        const pointer = pendingPointerRef.current
        const x = Math.min(
          Math.max((pointer.x - rect.left) / rect.width, 0),
          1,
        )
        const y = Math.min(
          Math.max(1 - (pointer.y - rect.top) / rect.height, 0),
          1,
        )
        mouseRef.current = { x, y }
      })
    },
    [interactive],
  )

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    canvas.style.display = "none"
    if (isBot()) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    canvas.style.display = "block"

    let renderer: Renderer
    let gl: Renderer["gl"] | null = null
    let program: Program
    let mesh: Mesh

    try {
      renderer = new Renderer({
        alpha: false,
        antialias: false,
        canvas,
        dpr: Math.min(Math.max(dpr, 0.75), maximumDpr),
      })
      gl = renderer.gl
      gl.clearColor(0, 0, 0, 1)

      const geometry = new Triangle(gl)
      program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uResolution: {
            value: new Float32Array([
              gl.canvas.width,
              gl.canvas.height,
              gl.canvas.width / gl.canvas.height,
            ]),
          },
          uBaseColor: { value: stableBaseColor },
          uAmplitude: { value: amplitude },
          uFrequencyX: { value: frequencyX },
          uFrequencyY: { value: frequencyY },
          uMouse: {
            value: new Float32Array([
              smoothMouseRef.current.x,
              smoothMouseRef.current.y,
            ]),
          },
        },
      })

      if (!program.uniformLocations) {
        throw new Error("Shader program failed to link")
      }

      mesh = new Mesh(gl, { geometry, program })
      programRef.current = program
      rendererRef.current = renderer
    } catch {
      canvas.style.display = "none"
      gl?.getExtension("WEBGL_lose_context")?.loseContext()
      programRef.current = null
      rendererRef.current = null
      return
    }

    function resize() {
      if (!container || !renderer || !canvas || !gl) return
      boundsRef.current = container.getBoundingClientRect()
      renderer.setSize(
        Math.max(container.offsetWidth, 1),
        Math.max(container.offsetHeight, 1),
      )
      canvas.style.width = "100%"
      canvas.style.height = "100%"

      const res = program.uniforms.uResolution.value as Float32Array
      res[0] = gl.canvas.width
      res[1] = gl.canvas.height
      res[2] = gl.canvas.width / gl.canvas.height
    }

    const resizeObserver = new ResizeObserver(() => resize())
    resizeObserver.observe(container)
    resize()

    let boundsFrame = 0
    const updateBounds = () => {
      if (boundsFrame) return
      boundsFrame = requestAnimationFrame(() => {
        boundsFrame = 0
        boundsRef.current = container.getBoundingClientRect()
      })
    }
    window.addEventListener("scroll", updateBounds, { passive: true })

    let contextLost = false
    let animationFrame = 0
    let lastRenderedAt = Number.NEGATIVE_INFINITY

    const update = (t: number) => {
      if (contextLost || !rendererRef.current || !programRef.current || !mesh) {
        animationFrame = 0
        return
      }

      if (t - lastRenderedAt >= targetFrameInterval) {
        if (interactive) {
          const dampingFactor = 0.1
          const smoothMouse = smoothMouseRef.current
          const mouse = mouseRef.current
          smoothMouse.x += (mouse.x - smoothMouse.x) * dampingFactor
          smoothMouse.y += (mouse.y - smoothMouse.y) * dampingFactor

          const mouseUniform = program.uniforms.uMouse.value as Float32Array
          mouseUniform[0] = smoothMouse.x
          mouseUniform[1] = smoothMouse.y
        }

        program.uniforms.uTime.value = t * 0.001 * speed
        renderer.render({ scene: mesh })
        lastRenderedAt = t
      }
      animationFrame = requestAnimationFrame(update)
    }

    const stop = () => {
      cancelAnimationFrame(animationFrame)
      animationFrame = 0
    }

    const start = () => {
      if (animationFrame || contextLost || document.hidden) return
      animationFrame = requestAnimationFrame(update)
    }

    const handleContextLost = (event: Event) => {
      event.preventDefault()
      contextLost = true
      stop()
      canvas.style.display = "none"
    }

    const handleVisibilityChange = () => {
      if (document.hidden) stop()
      else start()
    }

    if (interactive) {
      window.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      })
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    canvas.addEventListener("webglcontextlost", handleContextLost)
    start()

    return () => {
      contextLost = true
      stop()
      cancelAnimationFrame(pointerFrameRef.current)
      cancelAnimationFrame(boundsFrame)
      pointerFrameRef.current = 0
      boundsRef.current = null
      resizeObserver.disconnect()
      if (interactive) {
        window.removeEventListener("pointermove", handlePointerMove)
      }
      window.removeEventListener("scroll", updateBounds)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      canvas.removeEventListener("webglcontextlost", handleContextLost)
      // React owns this canvas. Keeping its context alive allows Strict Mode's
      // setup-cleanup-setup cycle to reinitialize the renderer safely.
      programRef.current = null
      rendererRef.current = null
    }
  }, [
    amplitude,
    dpr,
    frequencyX,
    frequencyY,
    handlePointerMove,
    interactive,
    speed,
    stableBaseColor,
  ])

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={style}
      {...rest}
    >
      <canvas
        ref={canvasRef}
        className="relative z-0 block h-full w-full"
        aria-hidden="true"
      />
    </div>
  )
}

export default LiquidChrome
