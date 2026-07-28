// WHY: Wrapping canvas context creation in a safe probe ensures that environments with disabled WebGL,
// hardware acceleration turned off, or exceeded context budgets fail gracefully with null instead of throwing.
export function createWebGLCanvas(
  attributes: WebGLContextAttributes = {},
): HTMLCanvasElement | null {
  const canvas = document.createElement("canvas")

  try {
    const context =
      canvas.getContext("webgl2", attributes) ??
      canvas.getContext("webgl", attributes)

    return context ? canvas : null
  } catch {
    return null
  }
}
