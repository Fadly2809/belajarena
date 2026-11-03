import * as THREE from 'three';

/**
 * DioramaEnvironment: Membentuk panggung diorama melayang khas Belajarena
 * dengan latar langit cerah/gradien halus, pulau melayang, awan kubus rendah poligon.
 */
export class DioramaEnvironment {
  private group: THREE.Group;
  private clouds: THREE.Group[] = [];

  constructor(scene: THREE.Scene, type: 'race' | 'towerDefense' = 'race') {
    this.group = new THREE.Group();
    scene.add(this.group);

    // 1. Warna latar scene
    scene.background = new THREE.Color(type === 'race' ? 0x0f172a : 0x0a0f1d);
    scene.fog = new THREE.FogExp2(type === 'race' ? 0x0f172a : 0x0a0f1d, 0.008);

    // 2. Awan-awan kubus di langit (low-poly diorama aesthetic)
    this.createLowPolyClouds(type);

    // 3. Kubus-kubus daratan melayang di kejauhan
    this.createFloatingIslands(type);
  }

  private createLowPolyClouds(type: 'race' | 'towerDefense'): void {
    const cloudGeo = new THREE.BoxGeometry(3, 1.2, 2);
    const cloudMat = new THREE.MeshLambertMaterial({
      color: type === 'race' ? 0x93c5fd : 0x818cf8,
      transparent: true,
      opacity: 0.35,
    });

    for (let i = 0; i < 8; i++) {
      const cloudGroup = new THREE.Group();
      const count = 3 + Math.floor(Math.random() * 3);
      for (let j = 0; j < count; j++) {
        const piece = new THREE.Mesh(cloudGeo, cloudMat);
        piece.position.set((j - 1) * 2.2, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 1.5);
        const s = 0.8 + Math.random() * 0.5;
        piece.scale.set(s, s, s);
        cloudGroup.add(piece);
      }

      cloudGroup.position.set(
        (Math.random() - 0.5) * 120,
        25 + Math.random() * 15,
        (Math.random() - 0.5) * 100
      );
      this.clouds.push(cloudGroup);
      this.group.add(cloudGroup);
    }
  }

  private createFloatingIslands(type: 'race' | 'towerDefense'): void {
    const islandGeo = new THREE.BoxGeometry(6, 4, 6);
    const islandMat = new THREE.MeshLambertMaterial({
      color: type === 'race' ? 0x1e293b : 0x1e1b4b,
    });
    const capGeo = new THREE.BoxGeometry(6.2, 0.6, 6.2);
    const capMat = new THREE.MeshLambertMaterial({
      color: type === 'race' ? 0x10b981 : 0x6366f1,
    });

    for (let i = 0; i < 4; i++) {
      const island = new THREE.Group();
      const base = new THREE.Mesh(islandGeo, islandMat);
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 2.1;
      island.add(base);
      island.add(cap);

      const angle = (i / 4) * Math.PI * 2;
      const dist = 55 + Math.random() * 20;
      island.position.set(Math.cos(angle) * dist, -5 + Math.random() * 6, Math.sin(angle) * dist);
      const sc = 0.8 + Math.random() * 0.8;
      island.scale.set(sc, sc, sc);
      island.rotation.y = Math.random() * Math.PI;

      this.group.add(island);
    }
  }

  public update(delta: number): void {
    // Awan melayang pelan
    for (let i = 0; i < this.clouds.length; i++) {
      this.clouds[i].position.x += delta * 1.5;
      if (this.clouds[i].position.x > 80) {
        this.clouds[i].position.x = -80;
      }
    }
  }

  public destroy(): void {
    this.group.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const m = obj as THREE.Mesh;
        m.geometry?.dispose();
        if (Array.isArray(m.material)) {
          m.material.forEach((mat) => mat.dispose());
        } else {
          m.material?.dispose();
        }
      }
    });
    this.clouds = [];
  }
}

