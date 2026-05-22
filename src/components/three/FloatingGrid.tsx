"use client"

import { useId, useMemo, useRef } from "react"
import { useFrame, Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import * as THREE from "three"

const hashStringToSeed = (value: string) => {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return hash >>> 0
}

const createSeededRandom = (seed: number) => {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

function GridPlane() {
  const meshRef = useRef<THREE.Mesh>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0x6366f1) },
    }),
    []
  )

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return
    const material = mesh.material as THREE.ShaderMaterial
    const timeUniform = material.uniforms.uTime
    if (!timeUniform) return
    timeUniform.value = state.clock.elapsedTime
    mesh.rotation.x = -Math.PI / 3 + Math.sin(state.clock.elapsedTime * 0.15) * 0.05
    mesh.rotation.z = state.clock.elapsedTime * 0.03
    mesh.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.2
  })

  return (
    <mesh ref={meshRef} position={[0, -1, 0]}>
      <planeGeometry args={[20, 20, 40, 40]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          varying vec2 vUv;
          varying float vElevation;
          void main() {
            vUv = uv;
            vec3 pos = position;
            float wave = sin(pos.x * 2.0 + uTime * 0.5) * 0.15 +
                         sin(pos.y * 3.0 + uTime * 0.3) * 0.1 +
                         sin((pos.x + pos.y) * 1.5 + uTime * 0.4) * 0.08;
            pos.z += wave;
            vElevation = wave;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          uniform float uTime;
          varying vec2 vUv;
          varying float vElevation;
          void main() {
            float gridX = abs(fract(vUv.x * 40.0) - 0.5);
            float gridY = abs(fract(vUv.y * 40.0) - 0.5);
            float grid = min(gridX, gridY);
            float line = 1.0 - smoothstep(0.0, 0.03, grid);
            float fade = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x) *
                         smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
            float glow = (vElevation + 0.2) * 2.0;
            vec3 color = uColor * line * fade * 0.2 * (0.5 + glow * 0.5);
            gl_FragColor = vec4(color, line * fade * 0.12);
          }
        `}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

function FloatingOrbs() {
  const groupRef = useRef<THREE.Group>(null)

  const id = useId()
  const seed = useMemo(() => hashStringToSeed(id), [id])
  const orbs = useMemo(() => {
    const rand = createSeededRandom(seed)
    return Array.from({ length: 12 }, () => ({
      pos: [
        (rand() - 0.5) * 10,
        (rand() - 0.5) * 4,
        (rand() - 0.5) * 6,
      ] as [number, number, number],
      scale: 0.03 + rand() * 0.06,
      speed: 0.2 + rand() * 0.5,
      offset: rand() * Math.PI * 2,
    }))
  }, [seed])

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.children.forEach((child, i) => {
      const orb = orbs[i]
      if (!orb || !(child instanceof THREE.Mesh)) return
      child.position.y = orb.pos[1] + Math.sin(state.clock.elapsedTime * orb.speed + orb.offset) * 0.5
      child.position.x = orb.pos[0] + Math.cos(state.clock.elapsedTime * orb.speed * 0.7 + orb.offset) * 0.3
    })
  })

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={orb.pos} scale={orb.scale}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color="#6366f1" transparent opacity={0.25} />
        </mesh>
      ))}
    </group>
  )
}

export function FloatingGridCanvas() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 3, 7], fov: 60 }}
      style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <GridPlane />
        <FloatingOrbs />
      </Suspense>
    </Canvas>
  )
}
