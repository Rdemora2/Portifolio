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

export function hexToVec3(hex: string): THREE.Color {
  return new THREE.Color(hex)
}
