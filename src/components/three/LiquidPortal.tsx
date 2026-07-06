"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAdaptiveDpr } from "@/hooks/useAdaptiveDpr";

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform vec3 uColor1;
uniform vec3 uColor2;

varying vec2 vUv;

// Simplex noise function
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = vUv;
  
  // Aspect ratio correction for mouse dist
  vec2 st = gl_FragCoord.xy / uResolution.xy;
  st.x *= uResolution.x / uResolution.y;
  vec2 mouse = uMouse;
  mouse.x *= uResolution.x / uResolution.y;
  
  // Mouse distortion
  float dist = length(st - mouse);
  float mouseGlow = smoothstep(0.4, 0.0, dist);
  
  // Base noise for fluid
  float n1 = snoise(uv * 3.0 + uTime * 0.2);
  float n2 = snoise(uv * 5.0 - uTime * 0.3 + n1);
  float n3 = snoise(uv * 2.0 + uTime * 0.1 - n2 * 0.5);
  
  // Add mouse interaction to the noise map
  n3 += mouseGlow * 1.5;
  
  float fluid = smoothstep(0.0, 1.0, n3);
  
  vec3 color = mix(uColor1, uColor2, fluid);
  
  // Edge fade to blend with glass panel
  float edgeFade = smoothstep(0.0, 0.1, uv.x) * smoothstep(1.0, 0.9, uv.x) *
                   smoothstep(0.0, 0.1, uv.y) * smoothstep(1.0, 0.9, uv.y);
                   
  gl_FragColor = vec4(color, (fluid * 0.5 + 0.1) * edgeFade * 0.6);
}
`;

function FluidMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uResolution: { value: new THREE.Vector2(1000, 1000) },
    uColor1: { value: new THREE.Color("#4f46e5") }, // indigo-600
    uColor2: { value: new THREE.Color("#00d4ff") }, // cyan
  }), []);

  useEffect(() => {
    const handleResize = () => {
      if (materialRef.current) {
        materialRef.current.uniforms.uResolution!.value.set(
          window.innerWidth,
          window.innerHeight
        );
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime!.value = state.clock.elapsedTime;
      
      // Smoothly track mouse state
      const targetX = state.pointer.x * 0.5 + 0.5;
      const targetY = state.pointer.y * 0.5 + 0.5;
      
      const mouseVec = materialRef.current.uniforms.uMouse!.value;
      mouseVec.x += (targetX - mouseVec.x) * 0.05;
      mouseVec.y += (targetY - mouseVec.y) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

export function LiquidPortal() {
  const dpr = useAdaptiveDpr(1, 1.5);
  
  const [isLowPower, setIsLowPower] = useState(false);
  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const isWeakGPU = (navigator.hardwareConcurrency || 4) <= 4;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLowPower(isTouch || isWeakGPU);
  }, []);

  if (isLowPower) {
    return (
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: "radial-gradient(circle at top right, var(--color-signal), transparent 50%), radial-gradient(circle at bottom left, var(--color-highlight), transparent 50%)"
        }}
      />
    );
  }

  return (
    <div className="absolute inset-0 z-0 pointer-events-auto">
      <span className="sr-only">Interactive liquid portal animation</span>
      <Canvas
        aria-hidden="true"
        dpr={[1, dpr]}
        camera={{ position: [0, 0, 1] }}
        gl={{ antialias: false, alpha: true }}
      >
        <FluidMesh />
      </Canvas>
    </div>
  );
}
