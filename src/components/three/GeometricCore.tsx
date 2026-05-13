"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const heroVertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  vWorldPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const heroFragmentShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform vec3 uColor;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

float fresnel(vec3 normal, vec3 viewDir, float power) {
  return pow(1.0 - abs(dot(normal, viewDir)), power);
}

void main() {
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnelFactor = fresnel(vNormal, viewDir, 2.5);
  
  // Iridescent color shift based on view angle and time
  float angle = dot(vNormal, viewDir);
  vec3 iridescentColor = vec3(
    0.5 + 0.5 * sin(angle * 6.0 + uTime * 0.3),
    0.5 + 0.5 * sin(angle * 6.0 + uTime * 0.3 + 2.094),
    0.5 + 0.5 * sin(angle * 6.0 + uTime * 0.3 + 4.189)
  );
  
  // Blend between base signal color and iridescent
  vec3 holographicColor = mix(uColor, iridescentColor * 0.8, 0.3);
  
  vec3 baseColor = holographicColor * 0.08;
  vec3 glowColor = holographicColor * fresnelFactor * 1.8;
  
  // Scanning line effect
  float scanLine = smoothstep(0.0, 0.02, abs(fract(vWorldPosition.y * 3.0 + uTime * 0.15) - 0.5));
  float scanGlow = (1.0 - scanLine) * 0.15;
  
  float pulse = sin(uTime * 0.8) * 0.5 + 0.5;
  gl_FragColor = vec4(
    baseColor + glowColor * (0.7 + pulse * 0.3) + holographicColor * scanGlow,
    fresnelFactor * 0.9 + scanGlow * 0.3
  );
}
`

export function GeometricCore({ mouse }: { mouse: { x: number; y: number } }) {
  const meshRef = useRef<THREE.Mesh>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColor: { value: new THREE.Color(0x818cf8) },
    }),
    []
  )

  useFrame((state) => {
    if (!meshRef.current) return
    uniforms.uTime.value = state.clock.elapsedTime
    uniforms.uMouse.value.set(mouse.x, mouse.y)
    
    // Enhanced mouse reactivity with smooth interpolation
    const targetRotX = mouse.y * 0.15
    const targetRotY = mouse.x * 0.15
    meshRef.current.rotation.x += (targetRotX - meshRef.current.rotation.x) * 0.02 + 0.001
    meshRef.current.rotation.y += (targetRotY - meshRef.current.rotation.y) * 0.02 + 0.002
  })

  return (
    <mesh ref={meshRef} scale={2.5}>
      <icosahedronGeometry args={[1, 2]} />
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
