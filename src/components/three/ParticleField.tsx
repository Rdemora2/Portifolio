"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const PARTICLE_COUNT = 3000

export function ParticleField({ mouse }: { mouse: { x: number; y: number } }) {
  const pointsRef = useRef<THREE.Points>(null)

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3)
    const vel = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 3 + Math.random() * 2
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
      vel[i * 3] = (Math.random() - 0.5) * 0.002
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.002
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002
    }
    return [pos, vel]
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0x00d4ff) },
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
    for (let i = 0; i < PARTICLE_COUNT; i++) {
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
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 2.0 * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uColor;
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
            float pulse = sin(uTime * 2.0 + gl_PointCoord.x * 10.0) * 0.3 + 0.7;
            gl_FragColor = vec4(uColor * pulse, alpha * 0.4);
          }
        `}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
