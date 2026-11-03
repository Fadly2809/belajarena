/**
 * Deteksi ketersediaan WebGL pada browser laptop guru.
 * Menyediakan fallback aman ke Mode 2D bila WebGL tidak didukung atau dinonaktifkan.
 */
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

