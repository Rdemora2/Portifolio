"use client"

import { useRef, useMemo, useEffect, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const PARTICLE_COUNT = 3000
const MOBILE_PARTICLE_COUNT = 1200
const CONNECTION_DISTANCE = 1.2
const MAX_CONNECTIONS = 200

export function ParticleField({ mouse }: { mouse: { x: number; y: number } }) {
  const pointsRef = useRef<THREE.Points>(null)
  const linesRef = useRef<THREE.LineSegments>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768 || "ontouchstart" in window)
  }, [])

  const count = isMobile ? MOBILE_PARTICLE_COUNT : PARTICLE_COUNT

  const [positions, velocities, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    const sz = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 3 + Math.random() * 2
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
      vel[i * 3] = (Math.random() - 0.5) * 0.002
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.002
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002
      // Depth-based size variation
      sz[i] = 0.5 + Math.random() * 1.5
    }
    return [pos, vel, sz]
  }, [count])

  // Connection line buffer
  const linePositions = useMemo(() => {
    return new Float32Array(MAX_CONNECTIONS * 6) // 2 points * 3 coords per line
  }, [])

  const lineColors = useMemo(() => {
    return new Float32Array(MAX_CONNECTIONS * 6) // 2 colors * 3 channels per line
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0x818cf8) },
      uHighlightColor: { value: new THREE.Color(0x00d4ff) },
    }),
    []
  )

  useFrame((state) => {
    if (!pointsRef.current) return
    const geo = pointsRef.current.geometry
    const posAttr = geo.attributes.position as THREE.BufferAttribute | undefined
    if (!posAttr) return

    uniforms.uTime.value = state.clock.elapsedTime

    const arr = posAttr.array as Float32Array
    for (let i = 0; i < count; i++) {
      const ix = i * 3
      const iy = i * 3 + 1
      const iz = i * 3 + 2

      const px = arr[ix] ?? 0
      const py = arr[iy] ?? 0
      const pz = arr[iz] ?? 0

      const vx = velocities[ix] ?? 0
      const vy = velocities[iy] ?? 0
      const vz = velocities[iz] ?? 0

      arr[ix] = px + vx + mouse.x * 0.0001
      arr[iy] = py + vy + mouse.y * 0.0001
      arr[iz] = pz + vz

      const dist = Math.sqrt(arr[ix] * arr[ix] + arr[iy] * arr[iy] + arr[iz] * arr[iz])
      if (dist > 6) {
        const scale = 3 / dist
        arr[ix] = arr[ix] * scale
        arr[iy] = arr[iy] * scale
        arr[iz] = arr[iz] * scale
      }
    }
    posAttr.needsUpdate = true

    // Update constellation connections (only check subset for performance)
    if (linesRef.current) {
      const lineGeo = linesRef.current.geometry
      const linePosAttr = lineGeo.attributes.position as THREE.BufferAttribute
      const lineColAttr = lineGeo.attributes.color as THREE.BufferAttribute
      const lPos = linePosAttr.array as Float32Array
      const lCol = lineColAttr.array as Float32Array

      let connectionCount = 0
      const checkCount = Math.min(count, 300) // Only check first N particles for connections

      for (let i = 0; i < checkCount && connectionCount < MAX_CONNECTIONS; i++) {
        for (let j = i + 1; j < checkCount && connectionCount < MAX_CONNECTIONS; j++) {
          const dx = arr[i * 3]! - arr[j * 3]!
          const dy = arr[i * 3 + 1]! - arr[j * 3 + 1]!
          const dz = arr[i * 3 + 2]! - arr[j * 3 + 2]!
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz)

          if (d < CONNECTION_DISTANCE) {
            const alpha = 1.0 - d / CONNECTION_DISTANCE
            const idx = connectionCount * 6

            lPos[idx] = arr[i * 3]!
            lPos[idx + 1] = arr[i * 3 + 1]!
            lPos[idx + 2] = arr[i * 3 + 2]!
            lPos[idx + 3] = arr[j * 3]!
            lPos[idx + 4] = arr[j * 3 + 1]!
            lPos[idx + 5] = arr[j * 3 + 2]!

            // Color with fade based on distance
            const r = 0.51 * alpha
            const g = 0.55 * alpha
            const b = 0.97 * alpha
            lCol[idx] = r
            lCol[idx + 1] = g
            lCol[idx + 2] = b
            lCol[idx + 3] = r
            lCol[idx + 4] = g
            lCol[idx + 5] = b

            connectionCount++
          }
        }
      }

      // Zero out remaining connections
      for (let i = connectionCount * 6; i < MAX_CONNECTIONS * 6; i++) {
        lPos[i] = 0
        lCol[i] = 0
      }

      linePosAttr.needsUpdate = true
      lineColAttr.needsUpdate = true
      lineGeo.setDrawRange(0, connectionCount * 2)
    }
  })

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-aSize"
            args={[sizes, 1]}
          />
        </bufferGeometry>
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={`
            uniform float uTime;
            attribute float aSize;
            varying float vDepth;
            void main() {
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              vDepth = -mvPosition.z;
              gl_PointSize = aSize * 2.0 * (300.0 / -mvPosition.z);
              gl_Position = projectionMatrix * mvPosition;
            }
          `}
          fragmentShader={`
            uniform float uTime;
            uniform vec3 uColor;
            uniform vec3 uHighlightColor;
            varying float vDepth;
            void main() {
              float dist = length(gl_PointCoord - vec2(0.5));
              if (dist > 0.5) discard;
              float alpha = 1.0 - smoothstep(0.1, 0.5, dist);
              float pulse = sin(uTime * 2.0 + gl_PointCoord.x * 10.0) * 0.3 + 0.7;
              
              // Depth-based color variation (closer = brighter, more highlight)
              float depthFactor = smoothstep(2.0, 8.0, vDepth);
              vec3 color = mix(uHighlightColor, uColor, depthFactor);
              
              // Depth-based alpha (farther = more transparent)
              float depthAlpha = mix(0.6, 0.2, depthFactor);
              
              gl_FragColor = vec4(color * pulse, alpha * depthAlpha);
            }
          `}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Constellation connection lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[lineColors, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  )
}
