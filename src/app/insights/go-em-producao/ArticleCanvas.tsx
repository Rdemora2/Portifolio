"use client"

import { useRef, useMemo, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

/* ── Particle field with flowing motion ── */
function Particles() {
  const meshRef = useRef<THREE.Points>(null)
  const count = 1200

  const [positions, velocities, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const c1 = new THREE.Color("#6366f1")
    const c2 = new THREE.Color("#00d4ff")
    const c3 = new THREE.Color("#00ff88")

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15
      vel[i * 3] = (Math.random() - 0.5) * 0.01
      vel[i * 3 + 1] = 0.003 + Math.random() * 0.01
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.005
      const mix = Math.random()
      const c = mix < 0.33 ? c1 : mix < 0.66 ? c2 : c3
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }
    return [pos, vel, col]
  }, [])

  useFrame((state) => {
    if (!meshRef.current) return
    const posAttr = meshRef.current.geometry.getAttribute("position")
    const arr = posAttr.array as Float32Array
    const t = state.clock.elapsedTime

    for (let i = 0; i < count; i++) {
      const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2
      arr[ix]! += velocities[ix]! + Math.sin(t * 0.2 + i * 0.1) * 0.003
      arr[iy]! += velocities[iy]!
      arr[iz]! += velocities[iz]! + Math.cos(t * 0.15 + i * 0.05) * 0.002
      if (arr[iy]! > 15) { arr[iy] = -15; arr[ix] = (Math.random() - 0.5) * 30 }
    }
    posAttr.needsUpdate = true
    meshRef.current.rotation.y = t * 0.015
    meshRef.current.rotation.x = Math.sin(t * 0.08) * 0.05
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} vertexColors transparent opacity={0.7} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

/* ── Rotating wireframe icosahedrons ── */
function WireframeShells() {
  const g1 = useRef<THREE.Mesh>(null)
  const g2 = useRef<THREE.Mesh>(null)
  const g3 = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (g1.current) {
      g1.current.rotation.x = Math.sin(t * 0.12) * 0.4
      g1.current.rotation.y = t * 0.06
      g1.current.rotation.z = Math.cos(t * 0.08) * 0.2
    }
    if (g2.current) {
      g2.current.rotation.x = t * 0.04
      g2.current.rotation.y = Math.cos(t * 0.1) * 0.3
      g2.current.rotation.z = Math.sin(t * 0.06) * 0.15
    }
    if (g3.current) {
      g3.current.rotation.x = Math.cos(t * 0.07) * 0.25
      g3.current.rotation.y = -t * 0.03
    }
  })

  return (
    <group>
      <mesh ref={g1}>
        <icosahedronGeometry args={[2.8, 1]} />
        <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.07} />
      </mesh>
      <mesh ref={g2}>
        <icosahedronGeometry args={[3.5, 0]} />
        <meshBasicMaterial color="#00d4ff" wireframe transparent opacity={0.04} />
      </mesh>
      <mesh ref={g3}>
        <octahedronGeometry args={[4.2, 0]} />
        <meshBasicMaterial color="#00ff88" wireframe transparent opacity={0.025} />
      </mesh>
    </group>
  )
}

/* ── Orbiting ring of dots ── */
function OrbitalRing() {
  const ref = useRef<THREE.Points>(null)
  const ringCount = 120

  const positions = useMemo(() => {
    const pos = new Float32Array(ringCount * 3)
    for (let i = 0; i < ringCount; i++) {
      const angle = (i / ringCount) * Math.PI * 2
      const r = 5 + Math.sin(angle * 3) * 0.5
      pos[i * 3] = Math.cos(angle) * r
      pos[i * 3 + 1] = Math.sin(angle * 2) * 0.3
      pos[i * 3 + 2] = Math.sin(angle) * r
    }
    return pos
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.05
    ref.current.rotation.x = 0.3
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={ringCount} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#6366f1" transparent opacity={0.4} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

/* ── Floating data lines ── */
function DataStreams() {
  const groupRef = useRef<THREE.Group>(null)
  const lineCount = 6

  const lines = useMemo(() => {
    return Array.from({ length: lineCount }, (_, i) => {
      const points = []
      const segments = 30
      const baseAngle = (i / lineCount) * Math.PI * 2
      for (let j = 0; j < segments; j++) {
        const t = j / segments
        const r = 3 + t * 3
        points.push(new THREE.Vector3(
          Math.cos(baseAngle + t * 2) * r,
          (t - 0.5) * 8,
          Math.sin(baseAngle + t * 2) * r
        ))
      }
      return new THREE.BufferGeometry().setFromPoints(points)
    })
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.02
  })

  return (
    <group ref={groupRef}>
      {lines.map((geo, i) => (
        <primitive key={i} object={new THREE.Line(geo, new THREE.LineBasicMaterial({ color: i % 2 === 0 ? "#6366f1" : "#00d4ff", transparent: true, opacity: 0.06 }))} />
      ))}
    </group>
  )
}

export function ArticleCanvas() {
  const [dpr] = useState<[number, number]>([1, 1.5])

  return (
    <div className="absolute inset-0 z-0" style={{ pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 55 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        dpr={dpr}
        style={{ background: "transparent" }}
      >
        <Particles />
        <WireframeShells />
        <OrbitalRing />
        <DataStreams />
      </Canvas>
    </div>
  )
}
