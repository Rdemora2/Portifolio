"use client"

import { Mesh, Program, Renderer, Triangle } from "ogl"
import { useEffect, useRef } from "react"

import { createWebGLCanvas } from "@/lib/webgl"
import { isBot } from "@/lib/is-bot"

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

// WHY: mediump precision float provides smooth color gradients for the fluid shader while drastically reducing fragment ALU overhead on mobile GPUs.
const fragmentShader = `
precision mediump float;

varying vec2 vUv;

uniform float uTime;
uniform float uAspect;
uniform vec2 uMouse;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 value) {
  const vec4 C = vec4(
    0.211324865405187,
    0.366025403784439,
    -0.577350269189626,
    0.024390243902439
  );
  vec2 cell = floor(value + dot(value, C.yy));
  vec2 local = value - cell + dot(cell, C.xx);
  vec2 offset = local.x > local.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 corners = local.xyxy + C.xxzz;
  corners.xy -= offset;
  cell = mod(cell, 289.0);
  vec3 permutation = permute(
    permute(cell.y + vec3(0.0, offset.y, 1.0)) +
    cell.x + vec3(0.0, offset.x, 1.0)
  );
  vec3 attenuation = max(
    0.5 - vec3(
      dot(local, local),
      dot(corners.xy, corners.xy),
      dot(corners.zw, corners.zw)
    ),
    0.0
  );
  attenuation *= attenuation;
  attenuation *= attenuation;
  vec3 gradient = 2.0 * fract(permutation * C.www) - 1.0;
  vec3 height = abs(gradient) - 0.5;
  vec3 rounded = floor(gradient + 0.5);
  vec3 adjusted = gradient - rounded;
  attenuation *= 1.79284291400159 - 0.85373472095314 *
    (adjusted * adjusted + height * height);
  vec3 contribution;
  contribution.x = adjusted.x * local.x + height.x * local.y;
  contribution.yz = adjusted.yz * corners.xz + height.yz * corners.yw;
  return 130.0 * dot(attenuation, contribution);
}

void main() {
  vec2 aspect = vec2(uAspect, 1.0);
  vec2 point = (vUv - 0.5) * aspect;
  vec2 mouse = (uMouse - 0.5) * aspect;
  float distanceToMouse = length(point - mouse);
  float mouseGlow = smoothstep(0.45, 0.0, distanceToMouse);

  float firstFlow = snoise(vUv * 2.8 + vec2(uTime * 0.08, -uTime * 0.11));
  float secondFlow = snoise(
    vUv * 5.2 + vec2(-uTime * 0.13, uTime * 0.09) + firstFlow * 0.42
  );
  float thirdFlow = snoise(vUv * 2.0 + secondFlow * 0.65 - uTime * 0.04);
  float fluid = smoothstep(-0.32, 0.72, thirdFlow + mouseGlow * 0.8);
  float filament = smoothstep(0.48, 0.58, abs(firstFlow + secondFlow * 0.35));

  vec3 indigo = vec3(0.31, 0.27, 0.90);
  vec3 cyan = vec3(0.0, 0.83, 1.0);
  vec3 color = mix(indigo, cyan, fluid);
  color += cyan * filament * 0.22;

  float edgeFade =
    smoothstep(0.0, 0.12, vUv.x) *
    smoothstep(1.0, 0.88, vUv.x) *
    smoothstep(0.0, 0.12, vUv.y) *
    smoothstep(1.0, 0.88, vUv.y);
  float alpha = (0.08 + fluid * 0.38 + mouseGlow * 0.10) * edgeFade;

  gl_FragColor = vec4(color, alpha);
}
`

export function LiquidPortal() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    if (isBot()) return

    const isBrave = typeof navigator !== "undefined" && "brave" in navigator
    const isFirefox = typeof navigator !== "undefined" && navigator.userAgent.toLowerCase().includes("firefox")
    const isPrivacyBrowser = isBrave || isFirefox

    const lowPower = !isPrivacyBrowser && (
      (navigator.hardwareConcurrency || 4) <= 4 ||
      (navigator.deviceMemory !== undefined && navigator.deviceMemory <= 4)
    )
    const dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 1.5)
    const canvas = createWebGLCanvas({ alpha: true, antialias: false })
    if (!canvas) return

    let renderer: Renderer
    let gl: Renderer["gl"]
    let program: Program
    let mesh: Mesh
    const mouse = new Float32Array([0.65, 0.35])
    const targetMouse = { x: 0.65, y: 0.35 }

    try {
      renderer = new Renderer({
        alpha: true,
        antialias: false,
        canvas,
        dpr,
      })
      gl = renderer.gl
      gl.clearColor(0, 0, 0, 0)

      const geometry = new Triangle(gl)
      program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uAspect: { value: 1 },
          uMouse: { value: mouse },
        },
      })
      mesh = new Mesh(gl, { geometry, program })
    } catch {
      const context =
        canvas.getContext("webgl2") ?? canvas.getContext("webgl")
      context?.getExtension("WEBGL_lose_context")?.loseContext()
      return
    }

    canvas.setAttribute("aria-hidden", "true")
    canvas.style.display = "block"
    canvas.style.height = "100%"
    canvas.style.width = "100%"
    container.appendChild(canvas)

    let bounds = container.getBoundingClientRect()
    const pointer = { x: 0, y: 0, dirty: false }
    const resize = () => {
      const width = Math.max(container.clientWidth, 1)
      const height = Math.max(container.clientHeight, 1)
      bounds = container.getBoundingClientRect()
      renderer.setSize(width, height)
      program.uniforms.uAspect.value = width / height
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    resize()
    let boundsFrame = 0
    const updateBounds = () => {
      if (boundsFrame) return
      boundsFrame = requestAnimationFrame(() => {
        boundsFrame = 0
        bounds = container.getBoundingClientRect()
      })
    }
    window.addEventListener("resize", updateBounds, { passive: true })
    const settleBoundsTimer = window.setTimeout(() => {
      bounds = container.getBoundingClientRect()
    }, 600)

    const handlePointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.dirty = true
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    const minimumFrameInterval = lowPower ? 1000 / 30 : 0
    const startedAt = performance.now()
    let animationFrame = 0
    let lastRenderedAt = 0
    let contextLost = false

    const render = (now: number) => {
      if (contextLost) return
      if (pointer.dirty && bounds.width > 0 && bounds.height > 0) {
        targetMouse.x = Math.min(
          Math.max((pointer.x - bounds.left) / bounds.width, 0),
          1,
        )
        targetMouse.y = Math.min(
          Math.max(1 - (pointer.y - bounds.top) / bounds.height, 0),
          1,
        )
        pointer.dirty = false
      }
      const currentX = mouse[0] ?? 0.65
      const currentY = mouse[1] ?? 0.35
      mouse[0] = currentX + (targetMouse.x - currentX) * 0.055
      mouse[1] = currentY + (targetMouse.y - currentY) * 0.055
      program.uniforms.uTime.value = (now - startedAt) * 0.001
      renderer.render({ scene: mesh })
    }

    const update = (now: number) => {
      if (now - lastRenderedAt >= minimumFrameInterval) {
        render(now)
        lastRenderedAt = now
      }
      animationFrame = requestAnimationFrame(update)
    }

    const start = () => {
      if (animationFrame || document.hidden || reduceMotion) return
      animationFrame = requestAnimationFrame(update)
    }

    const stop = () => {
      cancelAnimationFrame(animationFrame)
      animationFrame = 0
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

    document.addEventListener("visibilitychange", handleVisibilityChange)
    canvas.addEventListener("webglcontextlost", handleContextLost)
    if (reduceMotion) render(startedAt)
    else start()

    return () => {
      stop()
      window.clearTimeout(settleBoundsTimer)
      cancelAnimationFrame(boundsFrame)
      window.removeEventListener("resize", updateBounds)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      canvas.removeEventListener("webglcontextlost", handleContextLost)
      window.removeEventListener("pointermove", handlePointerMove)
      resizeObserver.disconnect()
      if (canvas.parentElement === container) container.removeChild(canvas)
      gl.getExtension("WEBGL_lose_context")?.loseContext()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_68%_34%,rgba(99,102,241,0.16),transparent_34%),radial-gradient(circle_at_28%_72%,rgba(0,212,255,0.08),transparent_30%)]"
      aria-hidden="true"
    />
  )
}
