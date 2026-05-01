"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const heroVertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const heroFragmentShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform vec3 uColor;
varying vec3 vNormal;
varying vec3 vPosition;

float fresnel(vec3 normal, vec3 viewDir, float power) {
  return pow(1.0 - abs(dot(normal, viewDir)), power);
}

void main() {
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnelFactor = fresnel(vNormal, viewDir, 2.5);
  vec3 baseColor = uColor * 0.1;
  vec3 glowColor = uColor * fresnelFactor * 1.5;
  float pulse = sin(uTime * 0.8) * 0.5 + 0.5;
  gl_FragColor = vec4(baseColor + glowColor * (0.7 + pulse * 0.3), fresnelFactor * 0.9);
}
`

export function GeometricCore({ mouse }: { mouse: { x: number; y: number } }) {
  const meshRef = useRef<THREE.Mesh>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColor: { value: new THREE.Color(0x00d4ff) },
    }),
    []
  )

  useFrame((state) => {
    if (!meshRef.current) return
    uniforms.uTime.value = state.clock.elapsedTime
    uniforms.uMouse.value.set(mouse.x, mouse.y)
    meshRef.current.rotation.x += 0.001
    meshRef.current.rotation.y += 0.002
  })

  return (
    <mesh ref={meshRef} scale={2.5}>
      <icosahedronGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={heroVertexShader}
        fragmentShader={heroFragmentShader}
        uniforms={uniforms}
        transparent
        wireframe
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
