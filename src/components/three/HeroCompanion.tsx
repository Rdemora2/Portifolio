"use client";

/**
 * HeroCompanion — desktop-only 3D companion for the Hero section.
 *
 * Upgrade (Fase 3D.2): Quantum Data Core (Ultimate Tech/Programming Context)
 * Includes additive blending, data trails, sparkles, and complex geometry
 * to represent a high-end AI/Quantum processing unit.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef, useState, useEffect } from "react";
import { useAdaptiveDpr } from "@/hooks/useAdaptiveDpr";
import { Float, Icosahedron, Torus, Edges, Sparkles, Trail, Sphere } from "@react-three/drei";
import * as THREE from "three";

// A fast moving packet that leaves a light trail
function DataPacket({ radius, speed, color, axis }: { radius: number, speed: number, color: string, axis: 'x' | 'y' | 'z' }) {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed;
    if (axis === 'x') {
      ref.current.position.set(0, Math.sin(t) * radius, Math.cos(t) * radius);
    } else if (axis === 'y') {
      ref.current.position.set(Math.sin(t) * radius, 0, Math.cos(t) * radius);
    } else {
      ref.current.position.set(Math.sin(t) * radius, Math.cos(t) * radius, 0);
    }
  });

  return (
    <Trail
      width={0.5} // Width of the line
      length={4} // Length of the line
      color={new THREE.Color(color)} // Color of the line
      attenuation={(t) => t * t} // Tapering effect
    >
      <mesh ref={ref}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </Trail>
  );
}

function QuantumCore() {
  const coreRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (coreRef.current) {
      coreRef.current.rotation.y = time * 0.2;
      coreRef.current.rotation.x = time * 0.1;
    }
    if (ring1Ref.current) ring1Ref.current.rotation.x = time * 0.8;
    if (ring2Ref.current) ring2Ref.current.rotation.y = time * -0.6;
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = time * 0.5;
      ring3Ref.current.rotation.x = time * 0.4;
    }
  });

  return (
    <Float speed={3} rotationIntensity={0.8} floatIntensity={1.5}>
      <group ref={coreRef}>
        {/* Central Processing Node */}
        <Icosahedron args={[1, 1]} scale={0.8}>
          <meshBasicMaterial 
            color="#0f172a" 
            wireframe={false}
          />
          <Edges 
            linewidth={2} 
            threshold={15} 
            color="#818cf8" 
          />
        </Icosahedron>

        {/* Outer Wireframe Shell with Additive Blending for Hologram effect */}
        <Icosahedron args={[1.5, 2]} scale={1.1}>
          <meshBasicMaterial 
            color="#3b82f6" 
            wireframe 
            transparent 
            opacity={0.3} 
            blending={THREE.AdditiveBlending}
          />
        </Icosahedron>
        
        <Sphere args={[1.6, 16, 16]}>
          <meshBasicMaterial 
            color="#ec4899" 
            wireframe 
            transparent 
            opacity={0.05} 
            blending={THREE.AdditiveBlending}
          />
        </Sphere>
      </group>

      {/* Orbital Data Rings (Gyroscope effect) */}
      <Torus ref={ring1Ref} args={[2.2, 0.005, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#ec4899" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
      </Torus>
      <Torus ref={ring2Ref} args={[2.5, 0.008, 16, 100]} rotation={[0, Math.PI / 2, 0]}>
        <meshBasicMaterial color="#6366f1" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
      </Torus>
      <Torus ref={ring3Ref} args={[2.8, 0.01, 16, 100]} rotation={[Math.PI / 4, 0, Math.PI / 4]}>
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </Torus>

      {/* Glowing Data Packets (Trails) */}
      <DataPacket radius={2.2} speed={1.5} color="#ec4899" axis="x" />
      <DataPacket radius={2.5} speed={-1.2} color="#6366f1" axis="y" />
      <DataPacket radius={2.8} speed={1.8} color="#8b5cf6" axis="z" />
      
      {/* Floating Sparkles (Data Dust) */}
      <Sparkles count={200} scale={8} size={2} speed={0.4} opacity={0.6} color="#60a5fa" />
    </Float>
  );
}

export function HeroCompanion() {
  const dpr = useAdaptiveDpr(1, 1.5);
  const [isLowPower, setIsLowPower] = useState(false);
  
  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const isWeakGPU = (navigator.hardwareConcurrency || 4) <= 4;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLowPower(isTouch || isWeakGPU);
  }, []);

  return (
    <>
      <span className="sr-only">Interactive 3D geometric core</span>
      <Canvas
        aria-hidden="true"
        dpr={[1, dpr]}
      camera={{ position: [0, 0, 8], fov: 45 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: false, alpha: true }}
    >
      <Suspense fallback={null}>
        {!isLowPower ? <QuantumCore /> : (
          /* Low power fallback: just a wireframe rotating slowly */
          <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
            <Icosahedron args={[2, 1]}>
              <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.3} />
            </Icosahedron>
          </Float>
        )}
      </Suspense>
    </Canvas>
    </>
  );
}
