import * as THREE from 'three';

export interface ThreeEngineOptions {
  antialias?: boolean;
  shadows?: boolean;
  maxPixelRatio?: number;
  onFpsUpdate?: (fps: number) => void;
  onQualityDowngraded?: (reason: string) => void;
}

/**
 * ThreeEngine: Fondasi renderer 3D Belajarena dengan pengoptimalan performa
 * untuk laptop guru (target 60 fps stabil pada grafis terintegrasi).
 */
export class ThreeEngine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public container: HTMLElement;

  private animationFrameId: number | null = null;
  private isDestroyed = false;
  private onRenderCallbacks: Array<(delta: number, elapsed: number) => void> = [];

  // Konfigurasi performa
  private maxPixelRatio: number;
  private shadowsEnabled: boolean;
  private onFpsUpdate?: (fps: number) => void;
  private onQualityDowngraded?: (reason: string) => void;

  // Pemantau FPS & degradasi adaptif
  private frameCount = 0;
  private lastFpsTime = 0;
  private currentFps = 60;
  private lowFpsSecondsCount = 0;
  private qualityDowngraded = false;
  private clock = new THREE.Clock();

  // Lampu utama
  public dirLight: THREE.DirectionalLight | null = null;
  public hemiLight: THREE.HemisphereLight | null = null;

  constructor(container: HTMLElement, options: ThreeEngineOptions = {}) {
    this.container = container;
    this.maxPixelRatio = options.maxPixelRatio ?? 1.5;
    this.shadowsEnabled = options.shadows ?? true;
    this.onFpsUpdate = options.onFpsUpdate;
    this.onQualityDowngraded = options.onQualityDowngraded;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    const aspect = container.clientWidth / Math.max(1, container.clientHeight);
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(0, 15, 25);
    this.camera.lookAt(0, 0, 0);

    // 3. WebGLRenderer dengan batasan hardware hemat daya
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: options.antialias ?? true,
      alpha: true,
      stencil: false,
      depth: true,
    });

    const pixelRatio = Math.min(window.devicePixelRatio || 1, this.maxPixelRatio);
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    if (this.shadowsEnabled) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    container.appendChild(this.renderer.domElement);

    // 4. Tata Lampu Hemat: Maksimal 2 sumber cahaya
    this.setupLighting();

    // 5. Window Resize Handler
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);

    // 6. Mulai Loop Animasi
    this.startLoop();
  }

  /**
   * Setup 2 sumber cahaya: Hemisphere + 1 Directional dengan bayangan lembut
   */
  private setupLighting(): void {
    // Cahaya langit & tanah (Hemisphere Light)
    this.hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.85);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    // Cahaya matahari bersudut (Directional Light)
    this.dirLight = new THREE.DirectionalLight(0xfffbeb, 1.2);
    this.dirLight.position.set(20, 40, 20);
    if (this.shadowsEnabled) {
      this.dirLight.castShadow = true;
      this.dirLight.shadow.mapSize.width = 1024;
      this.dirLight.shadow.mapSize.height = 1024;
      this.dirLight.shadow.camera.near = 1;
      this.dirLight.shadow.camera.far = 120;
      const d = 35;
      this.dirLight.shadow.camera.left = -d;
      this.dirLight.shadow.camera.right = d;
      this.dirLight.shadow.camera.top = d;
      this.dirLight.shadow.camera.bottom = -d;
      this.dirLight.shadow.bias = -0.0005;
    }
    this.scene.add(this.dirLight);
  }

  /**
   * Daftarkan callback yang dijalankan setiap frame sebelum render
   */
  public addRenderCallback(cb: (delta: number, elapsed: number) => void): () => void {
    this.onRenderCallbacks.push(cb);
    return () => {
      this.onRenderCallbacks = this.onRenderCallbacks.filter((c) => c !== cb);
    };
  }

  /**
   * Loop Render dengan pemantau FPS dan degradasi adaptif bila fps < 45 selama 3 detik
   */
  private startLoop(): void {
    this.lastFpsTime = performance.now();
    this.clock.start();

    const loop = () => {
      if (this.isDestroyed) return;

      const delta = Math.min(this.clock.getDelta(), 0.1); // clamp delta agar tidak loncat saat lag
      const elapsed = this.clock.getElapsedTime();

      // Jalankan callback game
      for (let i = 0; i < this.onRenderCallbacks.length; i++) {
        this.onRenderCallbacks[i](delta, elapsed);
      }

      // Render Scene
      this.renderer.render(this.scene, this.camera);

      // Hitung FPS
      this.frameCount++;
      const now = performance.now();
      if (now - this.lastFpsTime >= 1000) {
        this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsTime));
        this.frameCount = 0;
        this.lastFpsTime = now;

        if (this.onFpsUpdate) {
          this.onFpsUpdate(this.currentFps);
        }

        // Degradasi adaptif jika performa < 45 fps selama 3 detik berturut-turut
        if (this.currentFps < 45 && !this.qualityDowngraded) {
          this.lowFpsSecondsCount++;
          if (this.lowFpsSecondsCount >= 3) {
            this.applyAdaptiveQualityDowngrade();
          }
        } else if (this.currentFps >= 50) {
          this.lowFpsSecondsCount = 0;
        }
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  /**
   * Penurunan kualitas otomatis adaptif untuk menjaga 60 fps di laptop hemat daya
   */
  private applyAdaptiveQualityDowngrade(): void {
    this.qualityDowngraded = true;
    console.warn('[ThreeEngine] FPS di bawah 45 selama 3 detik berturut-turut. Menerapkan optimasi adaptif: menurunkan pixel ratio & mematikan bayangan.');

    // 1. Matikan bayangan
    if (this.renderer.shadowMap.enabled) {
      this.renderer.shadowMap.enabled = false;
      if (this.dirLight) this.dirLight.castShadow = false;
    }

    // 2. Turunkan pixel ratio ke 1.0
    this.renderer.setPixelRatio(1.0);

    if (this.onQualityDowngraded) {
      this.onQualityDowngraded('Kualitas grafis diturunkan secara otomatis agar arena tetap lancar di laptop guru.');
    }
  }

  /**
   * Tangani perubahan ukuran jendela (resize)
   */
  public handleResize(): void {
    if (this.isDestroyed || !this.container) return;
    const width = this.container.clientWidth;
    const height = Math.max(1, this.container.clientHeight);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  public getFps(): number {
    return this.currentFps;
  }

  /**
   * Pembersihan total: hapus loop, dispose geometri, material, dan renderer WebGL
   */
  public destroy(): void {
    this.isDestroyed = true;
    window.removeEventListener('resize', this.handleResize);

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.onRenderCallbacks = [];

    // Traverse and dispose all geometries and materials in scene
    this.scene.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => mat.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      }
    });

    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}

