"use client"

import { useRef, useMemo } from "react"
import { useFrame, Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import * as THREE from "three"

function WaveMesh() {
  const meshRef = useRef<THREE.Mesh>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  )

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 4, 0, 0]} position={[0, -1, -2]}>
      <planeGeometry args={[16, 8, 80, 40]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          varying vec2 vUv;
          varying float vWave;
          void main() {
            vUv = uv;
            vec3 pos = position;
            float wave = sin(pos.x * 1.5 + uTime * 0.6) * 0.25 +
                         sin(pos.x * 3.0 + uTime * 0.4) * 0.1 +
                         cos(pos.y * 2.0 + uTime * 0.5) * 0.15;
            pos.z += wave;
            vWave = wave;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec2 vUv;
          varying float vWave;
          void main() {
            float gridX = abs(fract(vUv.x * 60.0) - 0.5);
            float line = 1.0 - smoothstep(0.0, 0.04, gridX);
            float fade = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x) *
                         smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.6, vUv.y);
            float intensity = (vWave + 0.3) * 1.5;
            vec3 color = mix(vec3(0.0, 0.83, 1.0), vec3(0.0, 1.0, 0.53), vUv.x);
            gl_FragColor = vec4(color * line * fade * 0.15 * intensity, line * fade * 0.12);
          }
        `}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

export function WaveCanvas() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4], fov: 55 }}
      style={{ position: "absolute", inset: 0, zIndex: 0 }}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <WaveMesh />
      </Suspense>
    </Canvas>
  )
}
