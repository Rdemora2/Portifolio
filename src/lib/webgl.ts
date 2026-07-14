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
