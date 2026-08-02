/**
 * WebGL availability detection for the globe view.
 * Some browsers/devices (older hardware, locked-down corporate machines,
 * some virtualized/headless environments) don't expose a WebGL context —
 * in that case we fall back to a 2D jurisdiction list instead of a blank/broken globe.
 */
export function isWebGLAvailable(): boolean {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return false
  }

  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    return !!gl
  } catch {
    return false
  }
}
