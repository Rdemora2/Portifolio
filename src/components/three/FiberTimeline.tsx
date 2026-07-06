"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAdaptiveDpr } from "@/hooks/useAdaptiveDpr";
import { useInView } from "@/hooks/useInView";
/* eslint-disable react-hooks/purity */
import { ScrollTrigger } from "gsap/ScrollTrigger";

function FiberThread() {
  const lineRef = useRef<THREE.Line>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Generate a twisting spline
  const curve = useMemo(() => {
    const points = [];
    const numPoints = 100;
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      // y goes from 10 down to -10 to cover the tall vertical section
      const y = 10 - t * 20; 
      // snake on x and z
      const x = Math.sin(t * Math.PI * 4) * 3.0;
      const z = Math.cos(t * Math.PI * 3) * 3.0;
      points.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(points);
  }, []);

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const points = curve.getPoints(200);
    geometry.setFromPoints(points);
    
    // Add custom attribute for flow animation
    const progress = new Float32Array(points.length);
    for (let i = 0; i < points.length; i++) {
      progress[i] = i / points.length;
    }
    geometry.setAttribute("aProgress", new THREE.BufferAttribute(progress, 1));
    return geometry;
  }, [curve]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScrollProgress: { value: 0 },
      uColor: { value: new THREE.Color("#6366f1") }, // Signal color
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime!.value = state.clock.elapsedTime;
    }
    if (lineRef.current) {
      // gentle ambient rotation
      lineRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  // Track scroll progress for this specific section
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: "#experience",
      start: "top center",
      end: "bottom center",
      onUpdate: (self) => {
        if (materialRef.current) {
          materialRef.current.uniforms.uScrollProgress!.value = self.progress;
        }
      },
    });
    return () => trigger.kill();
  }, []);

  const lineObject = useMemo(() => new THREE.Line(lineGeometry), [lineGeometry]);

  return (
    <primitive object={lineObject} ref={lineRef}>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          attribute float aProgress;
          varying float vProgress;
          void main() {
            vProgress = aProgress;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform float uScrollProgress;
          uniform vec3 uColor;
          varying float vProgress;
          
          void main() {
            // Pulse based on time
            float timePulse = sin(vProgress * 40.0 - uTime * 3.0) * 0.5 + 0.5;
            
            // Draw line slightly ahead of scroll progress
            float drawAlpha = smoothstep(uScrollProgress + 0.15, uScrollProgress - 0.05, vProgress);
            
            // Glow effect
            float glow = (0.2 + timePulse * 0.8) * drawAlpha;
            
            gl_FragColor = vec4(uColor * glow, glow);
          }
        `}
      />
    </primitive>
  );
}

function FiberParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particlesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const count = 300;
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Spread particles around the bounding box
      positions[i * 3 + 0] = (Math.random() - 0.5) * 16; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8; // z
      phases[i] = Math.random() * Math.PI * 2;
    }
    
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    return geometry;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#818cf8") },
    }),
    []
  );

  useFrame((state) => {
    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uTime!.value = state.clock.elapsedTime;
      // Gentle rise
      pointsRef.current.position.y = (state.clock.elapsedTime * 0.5) % 30;
    }
  });

  return (
    <points ref={pointsRef} geometry={particlesGeometry}>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          attribute float aPhase;
          varying float vAlpha;
          uniform float uTime;
          void main() {
            vec3 pos = position;
            pos.x += sin(uTime * 0.5 + aPhase) * 0.5;
            pos.z += cos(uTime * 0.5 + aPhase) * 0.5;
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = (15.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
            vAlpha = sin(uTime * 1.5 + aPhase) * 0.5 + 0.5;
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          varying float vAlpha;
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            float glow = (0.5 - dist) * 2.0;
            gl_FragColor = vec4(uColor * glow, glow * 0.3 * vAlpha);
          }
        `}
      />
    </points>
  );
}

export function FiberTimeline() {
  const dpr = useAdaptiveDpr(1, 1.5);
  const [sectionRef, isInView] = useInView<HTMLDivElement>({
    threshold: 0,
    rootMargin: "0px",
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const handleDrawer = (e: Event) => {
      const customEvent = e as CustomEvent<{ isOpen: boolean }>;
      setIsDrawerOpen(customEvent.detail.isOpen);
    };
    window.addEventListener("drawerStateChange", handleDrawer);
    return () => window.removeEventListener("drawerStateChange", handleDrawer);
  }, []);

  const [isLowPower, setIsLowPower] = useState(false);
  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const isWeakGPU = (navigator.hardwareConcurrency || 4) <= 4;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLowPower(isTouch || isWeakGPU);
  }, []);

  return (
    <div ref={sectionRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {isInView && !isDrawerOpen && !isLowPower && (
        <>
          <span className="sr-only">3D Fiber timeline animation</span>
          <Canvas
            aria-hidden="true"
            dpr={[1, dpr]}
          camera={{ position: [0, 0, 22], fov: 50 }}
          gl={{ antialias: false, alpha: true }}
        >
          <FiberThread />
          <FiberParticles />
        </Canvas>
        </>
      )}
    </div>
  );
}
