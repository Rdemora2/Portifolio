"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Canvas } from "@react-three/fiber"
import { Line } from "@react-three/drei"
import { Suspense } from "react"
import * as THREE from "three"
import type { TechItem } from "@/types"
import { TECH_CATEGORY_COLORS } from "@/lib/constants"

interface TechNodeProps {
  tech: TechItem
  position: [number, number, number]
  color: string
}

function TechNode({ tech, position, color }: TechNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const scale = 0.1 + tech.proficiency * 0.06

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1
  })

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        transparent
        opacity={0.8}
      />
    </mesh>
  )
}

function TechConnections({ positions, colors }: { positions: [number, number, number][]; colors: string[] }) {
  const lines = useMemo(() => {
    const result: { points: [number, number, number][]; color: string }[] = []
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const posI = positions[i]
        const posJ = positions[j]
        if (!posI || !posJ) continue
        const dist = Math.sqrt(
          (posI[0] - posJ[0]) ** 2 +
          (posI[1] - posJ[1]) ** 2 +
          (posI[2] - posJ[2]) ** 2
        )
        if (dist < 3) {
          result.push({
            points: [posI, posJ],
            color: colors[i] ?? "#00d4ff",
          })
        }
      }
    }
    return result
  }, [positions, colors])

  return (
    <>
      {lines.map((line, idx) => (
        <Line
          key={idx}
          points={line.points}
          color={line.color}
          transparent
          opacity={0.15}
          lineWidth={1}
        />
      ))}
    </>
  )
}

function TechGraphScene({ techStack }: { techStack: TechItem[] }) {
  const groupRef = useRef<THREE.Group>(null)

  const { positions, colors } = useMemo(() => {
    const categoryGroups: Record<string, TechItem[]> = {}
    techStack.forEach((tech) => {
      if (!categoryGroups[tech.category]) categoryGroups[tech.category] = []
      categoryGroups[tech.category]?.push(tech)
    })

    const posArr: [number, number, number][] = []
    const colArr: string[] = []
    const categories = Object.keys(categoryGroups)

    categories.forEach((category, catIdx) => {
      const items = categoryGroups[category]
      if (!items) return
      const angle = (catIdx / categories.length) * Math.PI * 2
      const baseX = Math.cos(angle) * 3
      const baseZ = Math.sin(angle) * 3
      const color = TECH_CATEGORY_COLORS[category] ?? "#00d4ff"

      items.forEach((_, itemIdx) => {
        const itemAngle = (itemIdx / items.length) * Math.PI * 2
        const r = 0.8 + Math.random() * 0.5
        posArr.push([
          baseX + Math.cos(itemAngle) * r,
          (Math.random() - 0.5) * 2,
          baseZ + Math.sin(itemAngle) * r,
        ])
        colArr.push(color)
      })
    })

    return { positions: posArr, colors: colArr }
  }, [techStack])

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.05
  })

  return (
    <group ref={groupRef}>
      {techStack.map((tech, idx) => {
        const pos = positions[idx]
        const color = colors[idx]
        if (!pos || !color) return null
        return <TechNode key={tech.name} tech={tech} position={pos} color={color} />
      })}
      <TechConnections positions={positions} colors={colors} />
    </group>
  )
}

export function TechGraph({ techStack }: { techStack: TechItem[] }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 10], fov: 50 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <TechGraphScene techStack={techStack} />
      </Suspense>
    </Canvas>
  )
}
