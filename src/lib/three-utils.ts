import * as THREE from "three"

export function disposeMaterial(material: THREE.Material | THREE.Material[]): void {
  if (Array.isArray(material)) {
    material.forEach((m) => m.dispose())
  } else {
    material.dispose()
  }
}

export function disposeObject(obj: THREE.Object3D): void {
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose()
      disposeMaterial(child.material)
    }
    if (child instanceof THREE.Points) {
      child.geometry.dispose()
      disposeMaterial(child.material)
    }
  })
}

/** Converts a hex color string to a THREE.Color instance. */
export function hexToColor(hex: string): THREE.Color {
  return new THREE.Color(hex)
}

/**
 * @deprecated Use `hexToColor` instead. Renamed because it returns THREE.Color, not Vector3.
 */
export const hexToVec3 = hexToColor

/**
 * Creates a deterministic seed from a string using a simple hash.
 * Extracted from FloatingGrid/ParticleField to a shared utility.
 */
export function hashStringToSeed(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return Math.abs(hash)
}

/**
 * Creates a seeded pseudo-random number generator (mulberry32).
 * Returns a function that produces deterministic values in [0, 1).
 */
export function createSeededRandom(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
