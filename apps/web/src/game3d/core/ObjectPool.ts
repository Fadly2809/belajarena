import * as THREE from 'three';

/**
 * ObjectPool: Mengelola pool objek 3D untuk proyektil dan efek partikel.
 * Menghindari garbage collection berulang dan menjaga 60 fps stabil.
 */
export class ObjectPool<T extends THREE.Object3D> {
  private activeList: T[] = [];
  private inactiveList: T[] = [];
  private createFn: () => T;
  private resetFn?: (item: T) => void;
  private maxCapacity: number;

  constructor(createFn: () => T, resetFn?: (item: T) => void, initialSize = 10, maxCapacity = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxCapacity = maxCapacity;

    for (let i = 0; i < initialSize; i++) {
      const obj = this.createFn();
      obj.visible = false;
      this.inactiveList.push(obj);
    }
  }

  public acquire(): T | null {
    let item: T;
    if (this.inactiveList.length > 0) {
      item = this.inactiveList.pop()!;
    } else if (this.activeList.length < this.maxCapacity) {
      item = this.createFn();
    } else {
      // Kapasitas maksimum tercapai, gunakan kembali objek terlama
      item = this.activeList.shift()!;
    }

    if (this.resetFn) {
      this.resetFn(item);
    }
    item.visible = true;
    this.activeList.push(item);
    return item;
  }

  public release(item: T): void {
    const idx = this.activeList.indexOf(item);
    if (idx !== -1) {
      this.activeList.splice(idx, 1);
      item.visible = false;
      this.inactiveList.push(item);
    }
  }

  public releaseAll(): void {
    while (this.activeList.length > 0) {
      const item = this.activeList.pop()!;
      item.visible = false;
      this.inactiveList.push(item);
    }
  }

  public getActive(): T[] {
    return this.activeList;
  }

  public destroy(): void {
    this.releaseAll();
    for (const item of this.inactiveList) {
      const anyItem = item as any;
      if (anyItem?.isMesh) {
        anyItem.geometry?.dispose();
        if (Array.isArray(anyItem.material)) {
          anyItem.material.forEach((m: any) => m?.dispose());
        } else {
          anyItem.material?.dispose();
        }
      }
    }
    this.inactiveList = [];
    this.activeList = [];
  }
}

export interface ParticleItem {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  scaleDecay: number;
}

/**
 * FrugalParticleSystem: Sistem partikel hemat sumber daya
 * Maksimum 500 partikel aktif serentak menggunakan shared geometry & materials.
 */
export class FrugalParticleSystem {
  private particles: ParticleItem[] = [];
  private pool: THREE.Mesh[] = [];
  private container: THREE.Group;
  private maxParticles = 500;
  private boxGeo: THREE.BoxGeometry;
  private sharedMaterials: Map<number, THREE.MeshLambertMaterial> = new Map();

  constructor(scene: THREE.Scene, maxParticles = 500) {
    this.maxParticles = maxParticles;
    this.container = new THREE.Group();
    scene.add(this.container);

    this.boxGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);

    // Pra-alokasi pool partikel kubus low-poly
    for (let i = 0; i < 50; i++) {
      const mat = this.getMaterial(0xffffff);
      const mesh = new THREE.Mesh(this.boxGeo, mat);
      mesh.visible = false;
      this.container.add(mesh);
      this.pool.push(mesh);
    }
  }

  private getMaterial(colorHex: number): THREE.MeshLambertMaterial {
    let mat = this.sharedMaterials.get(colorHex);
    if (!mat) {
      mat = new THREE.MeshLambertMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.95,
      });
      this.sharedMaterials.set(colorHex, mat);
    }
    return mat;
  }

  /**
   * Pemicu semburan partikel (mis. pecahan robot kalah, percikan asap, confetti)
   */
  public emitBurst(
    position: THREE.Vector3,
    colorHex: number,
    count = 12,
    speed = 4,
    maxLife = 1.0,
    sizeScale = 1.0
  ): void {
    const mat = this.getMaterial(colorHex);
    const burstCount = Math.min(count, this.maxParticles - this.particles.length);

    for (let i = 0; i < burstCount; i++) {
      let mesh: THREE.Mesh;
      if (this.pool.length > 0) {
        mesh = this.pool.pop()!;
      } else if (this.particles.length < this.maxParticles) {
        mesh = new THREE.Mesh(this.boxGeo, mat);
        this.container.add(mesh);
      } else {
        break; // Batas 500 partikel tercapai
      }

      mesh.material = mat;
      mesh.position.copy(position);
      mesh.scale.set(sizeScale, sizeScale, sizeScale);
      mesh.visible = true;

      // Kecepatan acak melingkar
      const angle = Math.random() * Math.PI * 2;
      const elevation = (Math.random() - 0.2) * Math.PI * 0.5;
      const spd = speed * (0.5 + Math.random() * 0.7);

      const vx = Math.cos(angle) * Math.cos(elevation) * spd;
      const vy = Math.max(1.5, Math.sin(elevation) * spd + 2.0);
      const vz = Math.sin(angle) * Math.cos(elevation) * spd;

      this.particles.push({
        mesh,
        velocity: new THREE.Vector3(vx, vy, vz),
        life: 0,
        maxLife,
        scaleDecay: 1.0,
      });
    }
  }

  public update(delta: number): void {
    const gravity = -9.8;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;

      if (p.life >= p.maxLife) {
        // Recycle partikel
        p.mesh.visible = false;
        this.pool.push(p.mesh);
        this.particles.splice(i, 1);
        continue;
      }

      // Fisika gerak
      p.velocity.y += gravity * delta;
      p.mesh.position.x += p.velocity.x * delta;
      p.mesh.position.y += p.velocity.y * delta;
      p.mesh.position.z += p.velocity.z * delta;

      // Rotasi kubus
      p.mesh.rotation.x += delta * 4;
      p.mesh.rotation.y += delta * 5;

      // Pengecilan menjelang habis
      const progress = p.life / p.maxLife;
      const currentScale = Math.max(0.01, 1 - progress);
      p.mesh.scale.set(currentScale, currentScale, currentScale);
    }
  }

  public destroy(): void {
    this.particles.forEach((p) => {
      this.container.remove(p.mesh);
    });
    this.pool.forEach((m) => {
      this.container.remove(m);
    });
    this.boxGeo.dispose();
    this.sharedMaterials.forEach((mat) => mat.dispose());
    this.sharedMaterials.clear();
    this.particles = [];
    this.pool = [];
  }
}
