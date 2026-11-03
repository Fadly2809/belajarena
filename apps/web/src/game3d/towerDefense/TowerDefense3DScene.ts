import * as THREE from 'three';
import { ThreeEngine } from '../core/ThreeEngine';
import { DioramaEnvironment } from '../core/DioramaEnvironment';
import { createTextSprite, createHpBarSprite } from '../core/TextSprite';
import { FrugalParticleSystem, ObjectPool } from '../core/ObjectPool';

export interface TowerSlotData {
  id: string | number;
  x: number;
  y: number;
  tower?: {
    type: 'archer' | 'cannon' | 'magic' | 'catapult';
    level: number;
    range?: number;
    damage?: number;
    name?: string;
  } | null;
}

export interface EnemyData {
  id: string;
  type: 'minion' | 'runner' | 'tank' | 'boss';
  hp: number;
  max_hp: number;
  x: number;
  y: number;
  speed: number;
  is_slowed?: boolean;
}

export interface TDStateData {
  status: 'lobby' | 'in_progress' | 'completed' | 'finished';
  base_hp: number;
  max_base_hp: number;
  coins: number;
  wave_current: number;
  wave_total: number;
  class_streak: number;
  is_buff_active?: boolean;
  buff_stacks?: number;
  towers?: Array<{
    id?: string | number;
    slot_id: string | number;
    type: 'archer' | 'cannon' | 'magic' | 'catapult';
    level: number;
    name?: string;
    icon?: string;
    color?: string;
    damage?: number;
    range?: number;
  }>;
  slots: TowerSlotData[];
  enemies: EnemyData[];
  outcome?: 'class_victory' | 'base_destroyed';
}

interface TowerVisual {
  slotId: string;
  group: THREE.Group;
  head: THREE.Group;
  type: string;
  level: number;
  lastShotTime: number;
}

interface EnemyVisual {
  id: string;
  group: THREE.Group;
  bodyMesh: THREE.Mesh;
  hpBar: { sprite: THREE.Sprite; updateHp: (c: number, m: number) => void; dispose: () => void };
  currentPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  type: string;
  isSlowed: boolean;
}

interface TDActiveProjectile {
  type: 'cannon' | 'magic' | 'catapult';
  mesh: THREE.Object3D;
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  progress: number;
  speed: number;
  arcHeight: number;
  color: number;
  lastTrailProgress: number;
}

/**
 * TowerDefense3DScene: Pengelola arena diorama 3D Pertahanan Markas
 * Peta jalur S, 8 slot menara, menara prosedural dengan kepala berputar,
 * musuh robot/boss beranimasi, efek proyektil/laser/petir, dan markas kelas.
 */
export class TowerDefense3DScene {
  private engine: ThreeEngine;
  private environment: DioramaEnvironment;
  private particleSystem: FrugalParticleSystem;

  private mapGroup: THREE.Group;
  private slotsGroup: THREE.Group;
  private towersGroup: THREE.Group;
  private enemiesGroup: THREE.Group;
  private effectsGroup: THREE.Group;
  private baseGroup: THREE.Group;

  // Interaktivitas Slot
  private slotMeshes: Map<string, THREE.Mesh> = new Map();
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  public onSlotSelected?: (slotId: string) => void;
  public selectedSlotId: string | null = null;
  private ghostTowerMesh: THREE.Group | null = null;

  // Objek Visual
  private towers: Map<string, TowerVisual> = new Map();
  private enemies: Map<string, EnemyVisual> = new Map();
  private baseHpBarSprite: { sprite: THREE.Sprite; updateHp: (c: number, m: number) => void; dispose: () => void } | null = null;

  // Kamera Presets
  private cameraTarget = new THREE.Vector3(0, 0, 0);
  private cameraTargetPos = new THREE.Vector3(0, 32, 28);
  private cameraMode: 'overview' | 'base' | 'path' = 'overview';

  // State Buff Kecepatan Menara
  private isBuffActive = false;

  // Pool Proyektil/Efek Visual Menara
  private laserBeamPool: ObjectPool<THREE.Group>;
  private cannonballPool: ObjectPool<THREE.Group>;
  private magicOrbPool: ObjectPool<THREE.Group>;
  private boulderPool: ObjectPool<THREE.Mesh>;
  private activeProjectiles: TDActiveProjectile[] = [];

  private unregisterRender: () => void;

  constructor(engine: ThreeEngine) {
    this.engine = engine;
    this.environment = new DioramaEnvironment(engine.scene, 'towerDefense');
    this.particleSystem = new FrugalParticleSystem(engine.scene, 450);

    this.mapGroup = new THREE.Group();
    this.slotsGroup = new THREE.Group();
    this.towersGroup = new THREE.Group();
    this.enemiesGroup = new THREE.Group();
    this.effectsGroup = new THREE.Group();
    this.baseGroup = new THREE.Group();

    engine.scene.add(this.mapGroup);
    engine.scene.add(this.slotsGroup);
    engine.scene.add(this.towersGroup);
    engine.scene.add(this.enemiesGroup);
    engine.scene.add(this.effectsGroup);
    engine.scene.add(this.baseGroup);

    // 1. Pool Laser Archer (Cylinder 3D Glowing Additive)
    this.laserBeamPool = new ObjectPool<THREE.Group>(
      () => {
        const group = new THREE.Group();
        const coreGeo = new THREE.CylinderGeometry(0.12, 0.12, 1, 8);
        coreGeo.rotateX(Math.PI / 2);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);

        const glowGeo = new THREE.CylinderGeometry(0.35, 0.35, 1, 8);
        glowGeo.rotateX(Math.PI / 2);
        const glowMat = new THREE.MeshBasicMaterial({
          color: 0xef4444,
          transparent: true,
          opacity: 0.82,
          blending: THREE.AdditiveBlending,
        });
        const glowMesh = new THREE.Mesh(glowGeo, glowMat);

        const muzzleGeo = new THREE.SphereGeometry(0.38, 8, 8);
        const muzzleMat = new THREE.MeshBasicMaterial({
          color: 0xef4444,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
        });
        const muzzleMesh = new THREE.Mesh(muzzleGeo, muzzleMat);

        group.add(coreMesh);
        group.add(glowMesh);
        group.add(muzzleMesh);
        this.effectsGroup.add(group);
        return group;
      },
      (group) => {
        group.visible = false;
        group.scale.set(1, 1, 1);
      },
      8,
      25
    );

    // 2. Pool Cannonball (Peluru Meriam Berapi)
    this.cannonballPool = new ObjectPool<THREE.Group>(
      () => {
        const group = new THREE.Group();
        const ballGeo = new THREE.SphereGeometry(0.42, 8, 8);
        const ballMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
        const ballMesh = new THREE.Mesh(ballGeo, ballMat);

        const glowGeo = new THREE.SphereGeometry(0.68, 8, 8);
        const glowMat = new THREE.MeshBasicMaterial({
          color: 0xf97316,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
        });
        const glowMesh = new THREE.Mesh(glowGeo, glowMat);

        group.add(ballMesh);
        group.add(glowMesh);
        this.effectsGroup.add(group);
        return group;
      },
      (group) => {
        group.visible = false;
        group.scale.set(1, 1, 1);
      },
      8,
      25
    );

    // 3. Pool Magic Orb (Bola Plasma Es/Sihir Cyan)
    this.magicOrbPool = new ObjectPool<THREE.Group>(
      () => {
        const group = new THREE.Group();
        const orbGeo = new THREE.SphereGeometry(0.36, 8, 8);
        const orbMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const orbMesh = new THREE.Mesh(orbGeo, orbMat);

        const glowGeo = new THREE.SphereGeometry(0.65, 8, 8);
        const glowMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
        });
        const glowMesh = new THREE.Mesh(glowGeo, glowMat);

        group.add(orbMesh);
        group.add(glowMesh);
        this.effectsGroup.add(group);
        return group;
      },
      (group) => {
        group.visible = false;
        group.scale.set(1, 1, 1);
      },
      8,
      25
    );

    // 4. Pool Boulder (Batu Ketapel Raksasa)
    this.boulderPool = new ObjectPool<THREE.Mesh>(
      () => {
        const geo = new THREE.DodecahedronGeometry(0.55);
        const mat = new THREE.MeshLambertMaterial({ color: 0x78716c });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        this.effectsGroup.add(mesh);
        return mesh;
      },
      (mesh) => {
        mesh.visible = false;
        mesh.scale.set(1, 1, 1);
      },
      8,
      25
    );

    // Bangun Panggung Diorama dan Jalur S
    this.buildDioramaMap();

    // Bangun Markas Kelas
    this.buildBaseCastle();

    // Daftarkan render update loop
    this.unregisterRender = engine.addRenderCallback((delta, elapsed) => {
      this.update(delta, elapsed);
    });

    // Pasang listener klik canvas untuk interaksi slot menara
    this.handleCanvasClick = this.handleCanvasClick.bind(this);
    engine.renderer.domElement.addEventListener('click', this.handleCanvasClick);
  }

  /**
   * Konversi koordinat 2D (0..100) ke koordinat 3D diorama (-25..+25, -20..+20)
   */
  public to3DCoord(x2d: number, y2d: number): THREE.Vector3 {
    const x3d = (x2d / 100 - 0.5) * 50;
    const z3d = (y2d / 100 - 0.5) * 40;
    return new THREE.Vector3(x3d, 0, z3d);
  }

  /**
   * Bangun pulau tanah diorama berkontur balok dan jalan tanah/aspal S-curve
   */
  private buildDioramaMap(): void {
    // 1. Daratan Utama Melayang (Floating Island Base)
    const islandGeo = new THREE.BoxGeometry(54, 4.0, 44);
    const islandMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.position.set(0, -2.0, 0);
    islandMesh.receiveShadow = true;
    this.mapGroup.add(islandMesh);

    // Lapisan permukaan tanah (Diorama Terrain)
    const grassGeo = new THREE.BoxGeometry(54.2, 0.3, 44.2);
    const grassMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const grassMesh = new THREE.Mesh(grassGeo, grassMat);
    grassMesh.position.set(0, 0.15, 0);
    grassMesh.receiveShadow = true;
    this.mapGroup.add(grassMesh);

    // 2. Jalur Jalan S-Curve (Dibangun dari segmen kurva waypoints)
    const waypoints2D = [
      { x: 5, y: 20 },
      { x: 35, y: 20 },
      { x: 45, y: 35 },
      { x: 35, y: 50 },
      { x: 20, y: 65 },
      { x: 40, y: 80 },
      { x: 65, y: 80 },
      { x: 75, y: 65 },
      { x: 70, y: 40 },
      { x: 85, y: 30 },
      { x: 95, y: 50 },
    ];

    const roadY = 0.42; // Ketinggian permukaan jalan di atas tanah
    const baseY = 0.16; // Ketinggian tepi bawah jalan (embankment)
    const roadWidth = 4.4;
    const curbWidth = 0.35;

    const curvePoints: THREE.Vector3[] = waypoints2D.map((wp) => {
      const p = this.to3DCoord(wp.x, wp.y);
      p.y = roadY;
      return p;
    });

    // Gunakan kurva centripetal Catmull-Rom agar jalur melengkung halus dan anggun
    const curve = new THREE.CatmullRomCurve3(curvePoints, false, 'centripetal');
    const roadSegments = 120;
    const sampledPoints = curve.getPoints(roadSegments);
    const N = sampledPoints.length;

    // Hitung vektor arah lateral (normal) halus di SETIAP node kurva (C1-continuous)
    const leftPoints: THREE.Vector3[] = [];
    const rightPoints: THREE.Vector3[] = [];
    const innerLeftPoints: THREE.Vector3[] = [];
    const innerRightPoints: THREE.Vector3[] = [];

    for (let i = 0; i < N; i++) {
      const p = sampledPoints[i];
      let tangent: THREE.Vector3;
      if (i === 0) {
        tangent = new THREE.Vector3().subVectors(sampledPoints[1], sampledPoints[0]).normalize();
      } else if (i === N - 1) {
        tangent = new THREE.Vector3().subVectors(sampledPoints[N - 1], sampledPoints[N - 2]).normalize();
      } else {
        tangent = new THREE.Vector3().subVectors(sampledPoints[i + 1], sampledPoints[i - 1]).normalize();
      }

      // Normal lateral horizontal tegak lurus terhadap arah jalan
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      const halfW = roadWidth / 2;
      const innerW = halfW - curbWidth;

      leftPoints.push(new THREE.Vector3(p.x + normal.x * halfW, roadY, p.z + normal.z * halfW));
      rightPoints.push(new THREE.Vector3(p.x - normal.x * halfW, roadY, p.z - normal.z * halfW));
      innerLeftPoints.push(new THREE.Vector3(p.x + normal.x * innerW, roadY, p.z + normal.z * innerW));
      innerRightPoints.push(new THREE.Vector3(p.x - normal.x * innerW, roadY, p.z - normal.z * innerW));
    }

    // Bangun Triangle Strips yang MENYATU (SHARED VERTICES) tanpa celah / jagged
    const roadVertices: number[] = [];
    const roadNormals: number[] = [];

    const curbVertices: number[] = [];
    const curbNormals: number[] = [];

    const wallVertices: number[] = [];

    const centerLineVertices: number[] = [];

    for (let i = 0; i < N - 1; i++) {
      const p1 = sampledPoints[i];
      const p2 = sampledPoints[i + 1];

      const l1 = leftPoints[i];
      const l2 = leftPoints[i + 1];
      const r1 = rightPoints[i];
      const r2 = rightPoints[i + 1];

      const il1 = innerLeftPoints[i];
      const il2 = innerLeftPoints[i + 1];
      const ir1 = innerRightPoints[i];
      const ir2 = innerRightPoints[i + 1];

      // 1. Aspal Tengah (antara innerLeft dan innerRight)
      // Triangle 1: (il1, ir1, il2)
      roadVertices.push(il1.x, il1.y, il1.z,  ir1.x, ir1.y, ir1.z,  il2.x, il2.y, il2.z);
      roadNormals.push(0, 1, 0,  0, 1, 0,  0, 1, 0);
      // Triangle 2: (il2, ir1, ir2)
      roadVertices.push(il2.x, il2.y, il2.z,  ir1.x, ir1.y, ir1.z,  ir2.x, ir2.y, ir2.z);
      roadNormals.push(0, 1, 0,  0, 1, 0,  0, 1, 0);

      // 2. Curb Neon Kiri (antara left dan innerLeft)
      curbVertices.push(l1.x, l1.y + 0.02, l1.z,  il1.x, il1.y + 0.02, il1.z,  l2.x, l2.y + 0.02, l2.z);
      curbNormals.push(0, 1, 0,  0, 1, 0,  0, 1, 0);
      curbVertices.push(l2.x, l2.y + 0.02, l2.z,  il1.x, il1.y + 0.02, il1.z,  il2.x, il2.y + 0.02, il2.z);
      curbNormals.push(0, 1, 0,  0, 1, 0,  0, 1, 0);

      // 3. Curb Neon Kanan (antara innerRight dan right)
      curbVertices.push(ir1.x, ir1.y + 0.02, ir1.z,  r1.x, r1.y + 0.02, r1.z,  ir2.x, ir2.y + 0.02, ir2.z);
      curbNormals.push(0, 1, 0,  0, 1, 0,  0, 1, 0);
      curbVertices.push(ir2.x, ir2.y + 0.02, ir2.z,  r1.x, r1.y + 0.02, r1.z,  r2.x, r2.y + 0.02, r2.z);
      curbNormals.push(0, 1, 0,  0, 1, 0,  0, 1, 0);

      // 4. Dinding Tebing Samping Kiri (Turun dari l1 ke tanah baseY)
      const bL1 = new THREE.Vector3(l1.x, baseY, l1.z);
      const bL2 = new THREE.Vector3(l2.x, baseY, l2.z);
      wallVertices.push(l1.x, l1.y, l1.z,  bL1.x, bL1.y, bL1.z,  l2.x, l2.y, l2.z);
      wallVertices.push(l2.x, l2.y, l2.z,  bL1.x, bL1.y, bL1.z,  bL2.x, bL2.y, bL2.z);

      // 5. Dinding Tebing Samping Kanan (Turun dari r1 ke tanah baseY)
      const bR1 = new THREE.Vector3(r1.x, baseY, r1.z);
      const bR2 = new THREE.Vector3(r2.x, baseY, r2.z);
      wallVertices.push(r1.x, r1.y, r1.z,  r2.x, r2.y, r2.z,  bR1.x, bR1.y, bR1.z);
      wallVertices.push(r2.x, r2.y, r2.z,  bR2.x, bR2.y, bR2.z,  bR1.x, bR1.y, bR1.z);

      // 6. Marka Putus-Putus Kuning di Tengah (Dashed Centerline)
      if (Math.floor(i / 2) % 2 === 0) {
        centerLineVertices.push(p1.x, roadY + 0.03, p1.z,  p2.x, roadY + 0.03, p2.z);
      }
    }

    // Mesh Aspal Jalan Utama
    const roadGeo = new THREE.BufferGeometry();
    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(roadVertices, 3));
    roadGeo.setAttribute('normal', new THREE.Float32BufferAttribute(roadNormals, 3));
    const roadMat = new THREE.MeshLambertMaterial({
      color: 0x334155, // Warna aspal slate rapi & kontras
      side: THREE.DoubleSide,
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.receiveShadow = true;
    this.mapGroup.add(roadMesh);

    // Mesh Curb Neon Bercahaya (Rel Tepi Jalan yang Halus & Kontinu)
    const curbGeo = new THREE.BufferGeometry();
    curbGeo.setAttribute('position', new THREE.Float32BufferAttribute(curbVertices, 3));
    curbGeo.setAttribute('normal', new THREE.Float32BufferAttribute(curbNormals, 3));
    const curbMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
    });
    const curbMesh = new THREE.Mesh(curbGeo, curbMat);
    this.mapGroup.add(curbMesh);

    // Mesh Dinding Samping Jalan (Embankment Skirt)
    const wallGeo = new THREE.BufferGeometry();
    wallGeo.setAttribute('position', new THREE.Float32BufferAttribute(wallVertices, 3));
    wallGeo.computeVertexNormals();
    const wallMat = new THREE.MeshLambertMaterial({
      color: 0x1e293b,
      side: THREE.DoubleSide,
    });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    this.mapGroup.add(wallMesh);

    // Marka Garis Tengah Kuning
    const centerLineGeo = new THREE.BufferGeometry();
    centerLineGeo.setAttribute('position', new THREE.Float32BufferAttribute(centerLineVertices, 3));
    const centerLineMat = new THREE.LineBasicMaterial({ color: 0xfbbf24, linewidth: 2 });
    const centerLine = new THREE.LineSegments(centerLineGeo, centerLineMat);
    this.mapGroup.add(centerLine);

    // 3. Gapura Portal Masuk Musuh (Spawn Portal) di Titik Awal
    const spawnPos = this.to3DCoord(5, 20);
    const portalGroup = new THREE.Group();
    portalGroup.position.copy(spawnPos);

    const portalFrame = new THREE.Mesh(
      new THREE.TorusGeometry(2.0, 0.3, 8, 16),
      new THREE.MeshLambertMaterial({ color: 0xef4444 })
    );
    portalFrame.position.y = 2.0;
    portalGroup.add(portalFrame);

    const portalCore = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xff0055, transparent: true, opacity: 0.7 })
    );
    portalCore.position.y = 2.0;
    portalGroup.add(portalCore);

    const portalLabel = createTextSprite('PORTAL MUSUH', {
      textColor: '#ffffff',
      bgColor: '#dc2626',
      borderColor: '#fca5a5',
      fontSize: 22,
      width: 200,
      height: 56,
    });
    portalLabel.sprite.position.set(0, 4.4, 0);
    portalGroup.add(portalLabel.sprite);

    this.mapGroup.add(portalGroup);
  }

  /**
   * Bangun Benteng Server Markas Kelas di Ujung Jalur
   */
  private buildBaseCastle(): void {
    const basePos = this.to3DCoord(95, 50);
    this.baseGroup.position.copy(basePos);

    // Bangunan benteng menara server bertingkat
    const castleBase = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 3.5, 4.5),
      new THREE.MeshLambertMaterial({ color: 0x4338ca })
    );
    castleBase.position.y = 1.75;
    castleBase.castShadow = true;
    this.baseGroup.add(castleBase);

    const castleTower = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 4.0, 2.8),
      new THREE.MeshLambertMaterial({ color: 0x6366f1 })
    );
    castleTower.position.y = 5.5;
    castleTower.castShadow = true;
    this.baseGroup.add(castleTower);

    // Inti energi bercahaya di puncak
    const core = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.0),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    core.position.y = 8.5;
    this.baseGroup.add(core);

    // Label Markas & Bar HP 3D
    const titleSprite = createTextSprite('MARKAS KELAS', {
      textColor: '#ffffff',
      bgColor: '#4f46e5',
      borderColor: '#a5b4fc',
      fontSize: 24,
      width: 240,
      height: 60,
    });
    titleSprite.sprite.position.set(0, 11.2, 0);
    this.baseGroup.add(titleSprite.sprite);

    this.baseHpBarSprite = createHpBarSprite(160, 28);
    this.baseHpBarSprite.sprite.position.set(0, 9.8, 0);
    this.baseGroup.add(this.baseHpBarSprite.sprite);
  }

  /**
   * Bangun 8 Slot Menara Taktis Pijakan Melingkar Bercahaya
   */
  private syncSlots(slots: TowerSlotData[]): void {
    slots.forEach((s) => {
      const slotIdStr = String(s.id);
      let mesh = this.slotMeshes.get(slotIdStr);
      if (!mesh) {
        const pos = this.to3DCoord(s.x, s.y);

        // Pijakan lingkaran
        const slotGeo = new THREE.CylinderGeometry(1.8, 2.0, 0.4, 16);
        const slotMat = new THREE.MeshLambertMaterial({
          color: 0x1e293b,
          emissive: 0x4f46e5,
          emissiveIntensity: 0.25,
        });
        mesh = new THREE.Mesh(slotGeo, slotMat);
        mesh.position.set(pos.x, 0.2, pos.z);
        mesh.userData = { slotId: slotIdStr };

        // Cincin lampu batas
        const ringGeo = new THREE.RingGeometry(1.7, 2.0, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x6366f1,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.22;
        mesh.add(ring);

        // Label Slot (SLOT 1 - SLOT 8)
        const labelText = `SLOT ${slotIdStr}`;
        const label = createTextSprite(labelText, {
          textColor: '#ffffff',
          bgColor: '#0f172a',
          borderColor: '#818cf8',
          fontSize: 18,
          width: 90,
          height: 44,
        });
        label.sprite.position.set(0, 1.2, 0);
        mesh.add(label.sprite);

        this.slotsGroup.add(mesh);
        this.slotMeshes.set(slotIdStr, mesh);
      }

      // Tampilkan atau perbarui model menara di slot ini
      this.syncTowerOnSlot(s, slotIdStr);
    });
  }

  /**
   * Sinkronkan visual menara pada slot (Bangun, Upgrade, Jual)
   */
  private syncTowerOnSlot(slot: TowerSlotData, slotIdStr: string): void {
    const existing = this.towers.get(slotIdStr);

    if (!slot.tower) {
      if (existing) {
        this.towersGroup.remove(existing.group);
        existing.group.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            const m = obj as THREE.Mesh;
            m.geometry?.dispose();
            if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
            else m.material?.dispose();
          }
        });
        this.towers.delete(slotIdStr);
      }
      return;
    }

    // Jika tipe atau level berubah, rekonstruksi menara
    if (!existing || existing.type !== slot.tower.type || existing.level !== slot.tower.level) {
      if (existing) {
        this.towersGroup.remove(existing.group);
        this.towers.delete(slotIdStr);
      }

      const towerVis = this.createTowerModel(slotIdStr, slot.x, slot.y, slot.tower.type, slot.tower.level);
      this.towers.set(slotIdStr, towerVis);
    }
  }

  /**
   * Membuat model menara prosedural dengan kepala berputar
   */
  private createTowerModel(
    slotId: string,
    x2d: number,
    y2d: number,
    type: string,
    level: number
  ): TowerVisual {
    const group = new THREE.Group();
    const pos = this.to3DCoord(x2d, y2d);
    group.position.set(pos.x, 0.4, pos.z);

    const headGroup = new THREE.Group();
    const heightScale = 1.0 + (level - 1) * 0.25;

    if (type === 'archer') {
      // 1. Archer / Laser: Tiang ramping + kristal merah berputar
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.5, 3.2 * heightScale, 8),
        new THREE.MeshLambertMaterial({ color: 0x334155 })
      );
      post.position.y = (3.2 * heightScale) / 2;
      group.add(post);

      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.7 * heightScale),
        new THREE.MeshLambertMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.6 })
      );
      crystal.position.y = 3.4 * heightScale;
      headGroup.add(crystal);
    } else if (type === 'cannon') {
      // 2. Cannon / Roket: Menara gemuk + tabung peluncur
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 1.2, 2.5 * heightScale, 10),
        new THREE.MeshLambertMaterial({ color: 0x475569 })
      );
      base.position.y = (2.5 * heightScale) / 2;
      group.add(base);

      // Tabung meriam / roket ganda
      const barrel1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 1.6, 8),
        new THREE.MeshLambertMaterial({ color: 0xf97316 })
      );
      barrel1.rotation.x = Math.PI / 2;
      barrel1.position.set(-0.35, 2.8 * heightScale, 0.6);

      const barrel2 = barrel1.clone();
      barrel2.position.set(0.35, 2.8 * heightScale, 0.6);

      headGroup.add(barrel1);
      headGroup.add(barrel2);
    } else if (type === 'magic') {
      // 3. Magic / Es: Kristal biru muda melayang + cincin es
      const spire = new THREE.Mesh(
        new THREE.ConeGeometry(0.6, 3.5 * heightScale, 6),
        new THREE.MeshLambertMaterial({ color: 0x0284c7 })
      );
      spire.position.y = (3.5 * heightScale) / 2;
      group.add(spire);

      const iceRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.85, 0.12, 6, 16),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      iceRing.rotation.x = Math.PI / 2;
      iceRing.position.y = 3.6 * heightScale;
      headGroup.add(iceRing);
    } else {
      // 4. Catapult / Tesla: Menara koil tembaga + bola petir
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.8, 3.0 * heightScale, 8),
        new THREE.MeshLambertMaterial({ color: 0x7c3aed })
      );
      post.position.y = (3.0 * heightScale) / 2;
      group.add(post);

      const teslaBall = new THREE.Mesh(
        new THREE.SphereGeometry(0.75, 12, 12),
        new THREE.MeshLambertMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 0.8 })
      );
      teslaBall.position.y = 3.4 * heightScale;
      headGroup.add(teslaBall);
    }

    // Cincin Level Emas jika Level > 1
    if (level > 1) {
      const ringGeo = new THREE.TorusGeometry(0.75, 0.08, 6, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
      const ring1 = new THREE.Mesh(ringGeo, ringMat);
      ring1.rotation.x = Math.PI / 2;
      ring1.position.y = 1.4;
      group.add(ring1);

      if (level === 3) {
        const ring2 = ring1.clone();
        ring2.position.y = 2.2;
        group.add(ring2);
      }
    }

    group.add(headGroup);
    this.towersGroup.add(group);

    return {
      slotId,
      group,
      head: headGroup,
      type,
      level,
      lastShotTime: 0,
    };
  }

  /**
   * Tampilkan preview hantu menara transparan pada slot yang dipilih
   */
  public showGhostTower(slotId: string, towerType: 'archer' | 'cannon' | 'magic' | 'catapult'): void {
    this.clearGhostTower();

    const slotMesh = this.slotMeshes.get(slotId);
    if (!slotMesh) return;

    this.ghostTowerMesh = new THREE.Group();
    const geo = new THREE.CylinderGeometry(0.6, 0.8, 3.0, 8);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 1.5;
    this.ghostTowerMesh.add(mesh);

    this.ghostTowerMesh.position.copy(slotMesh.position);
    this.engine.scene.add(this.ghostTowerMesh);
  }

  public clearGhostTower(): void {
    if (this.ghostTowerMesh) {
      this.engine.scene.remove(this.ghostTowerMesh);
      this.ghostTowerMesh.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          (obj as THREE.Mesh).geometry?.dispose();
        }
      });
      this.ghostTowerMesh = null;
    }
  }

  /**
   * Tangani klik pada canvas untuk memilih slot menara
   */
  private handleCanvasClick(event: MouseEvent): void {
    const rect = this.engine.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.engine.camera);
    const intersects = this.raycaster.intersectObjects(Array.from(this.slotMeshes.values()), true);

    if (intersects.length > 0) {
      let hit: THREE.Object3D | null = intersects[0].object;
      while (hit && !hit.userData?.slotId && hit.parent && hit !== this.engine.scene) {
        hit = hit.parent;
      }
      const slotId = hit?.userData?.slotId;
      if (slotId !== undefined && slotId !== null && this.onSlotSelected) {
        const strId = String(slotId);
        this.selectedSlotId = strId;
        this.onSlotSelected(strId);
      }
    }
  }

  /**
   * Sinkronisasi musuh dari state server (gerakan, HP, dan spawn)
   */
  private syncEnemies(enemiesData: EnemyData[]): void {
    const currentIds = new Set(enemiesData.map((e) => e.id));

    // Hapus musuh yang sudah mati / sampai markas
    this.enemies.forEach((ev, id) => {
      if (!currentIds.has(id)) {
        // Efek musuh kalah: pecah jadi kubus partikel
        this.particleSystem.emitBurst(ev.currentPos, 0xef4444, 12, 3.5, 0.8, 0.45);
        this.enemiesGroup.remove(ev.group);
        ev.hpBar.dispose();
        this.enemies.delete(id);
      }
    });

    // Tambah atau perbarui musuh aktif
    enemiesData.forEach((ed) => {
      let ev = this.enemies.get(ed.id);
      const targetPos = this.to3DCoord(ed.x, ed.y);
      targetPos.y = ed.type === 'boss' ? 1.4 : 0.8;

      if (!ev) {
        ev = this.createEnemyModel(ed);
        ev.currentPos.copy(targetPos);
        ev.group.position.copy(targetPos);
        this.enemies.set(ed.id, ev);
      }

      ev.targetPos.copy(targetPos);
      ev.isSlowed = Boolean(ed.is_slowed);
      ev.hpBar.updateHp(ed.hp, ed.max_hp);

      // Warna kebiruan jika terkena slow
      const bodyMat = ev.bodyMesh.material as THREE.MeshLambertMaterial;
      if (ev.isSlowed) {
        bodyMat.color.setHex(0x38bdf8);
      } else {
        bodyMat.color.setHex(ed.type === 'boss' ? 0xd97706 : ed.type === 'runner' ? 0xeab308 : ed.type === 'tank' ? 0x7c3aed : 0xef4444);
      }
    });
  }

  private createEnemyModel(ed: EnemyData): EnemyVisual {
    const group = new THREE.Group();
    const isBoss = ed.type === 'boss';
    const scale = isBoss ? 2.0 : 1.0;

    const baseColor = isBoss ? 0xd97706 : ed.type === 'runner' ? 0xeab308 : ed.type === 'tank' ? 0x7c3aed : 0xef4444;

    const bodyGeo = isBoss ? new THREE.BoxGeometry(1.6, 1.8, 1.6) : new THREE.BoxGeometry(0.9, 1.0, 0.9);
    const bodyMat = new THREE.MeshLambertMaterial({ color: baseColor });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    group.add(bodyMesh);

    // Mahkota emas untuk Boss Gelombang 5
    if (isBoss) {
      const crown = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.6, 0.5, 5),
        new THREE.MeshLambertMaterial({ color: 0xfbbf24 })
      );
      crown.position.y = 1.3;
      group.add(crown);
    }

    // Bar HP melayang di atas kepala musuh
    const hpBar = createHpBarSprite(100, 20);
    hpBar.sprite.position.set(0, isBoss ? 2.4 : 1.5, 0);
    group.add(hpBar.sprite);

    this.enemiesGroup.add(group);

    return {
      id: ed.id,
      group,
      bodyMesh,
      hpBar,
      currentPos: new THREE.Vector3(),
      targetPos: new THREE.Vector3(),
      type: ed.type,
      isSlowed: false,
    };
  }

  /**
   * Set Sudut Pandang Kamera Presets
   */
  public setCameraPreset(mode: 'overview' | 'base' | 'path'): void {
    this.cameraMode = mode;
    if (mode === 'overview') {
      this.cameraTargetPos.set(0, 32, 28);
      this.cameraTarget.set(0, 0, 0);
    } else if (mode === 'base') {
      this.cameraTargetPos.set(16, 15, 14);
      this.cameraTarget.set(22, 2, 0);
    } else if (mode === 'path') {
      this.cameraTargetPos.set(-15, 16, -6);
      this.cameraTarget.set(-10, 1, -12);
    }
  }

  /**
   * Sinkronisasi data game state dari server
   */
  public syncState(state: TDStateData): void {
    if (!state) return;

    // 1. Update HP Markas
    if (this.baseHpBarSprite) {
      this.baseHpBarSprite.updateHp(state.base_hp, state.max_base_hp);
    }

    if (state.is_buff_active !== undefined) {
      this.isBuffActive = !!state.is_buff_active;
    }

    // 2. Pemetaan menara ke slot berdasarkan slot_id
    const towerMap = new Map<string, any>();
    if (state.towers && Array.isArray(state.towers)) {
      state.towers.forEach((t: any) => {
        towerMap.set(String(t.slot_id), t);
      });
    }

    // 3. Normalisasi data slot & sertakan objek tower jika ada
    const rawSlots = state.slots && state.slots.length > 0 ? state.slots : [
      { id: 1, x: 20, y: 32 },
      { id: 2, x: 40, y: 10 },
      { id: 3, x: 32, y: 38 },
      { id: 4, x: 22, y: 78 },
      { id: 5, x: 50, y: 68 },
      { id: 6, x: 55, y: 90 },
      { id: 7, x: 80, y: 52 },
      { id: 8, x: 78, y: 20 },
    ];

    const normalizedSlots: TowerSlotData[] = rawSlots.map((s: any) => {
      const slotIdStr = String(s.id);
      const matchedTower = towerMap.get(slotIdStr) || s.tower || null;
      return {
        id: slotIdStr,
        x: s.x,
        y: s.y,
        tower: matchedTower ? {
          type: matchedTower.type,
          level: matchedTower.level || 1,
          damage: matchedTower.damage,
          range: matchedTower.range,
          name: matchedTower.name,
        } : null,
      };
    });

    try {
      this.syncSlots(normalizedSlots);
    } catch (slotErr) {
      console.error('[TowerDefense3DScene] Gagal syncSlots:', slotErr);
    }

    // 4. Update Musuh (dijalankan selalu tanpa terhalang slot)
    if (state.enemies && Array.isArray(state.enemies)) {
      try {
        this.syncEnemies(state.enemies);
      } catch (enemyErr) {
        console.error('[TowerDefense3DScene] Gagal syncEnemies:', enemyErr);
      }
    }
  }

  /**
   * Loop update per frame
   */
  public update(delta: number, elapsed: number): void {
    this.environment.update(delta);
    this.particleSystem.update(delta);

    // 1. Interpolasi posisi kamera
    this.engine.camera.position.lerp(this.cameraTargetPos, Math.min(1, delta * 2.5));
    const currentLook = new THREE.Vector3();
    this.engine.camera.getWorldDirection(currentLook);
    this.engine.camera.lookAt(this.cameraTarget);

    // 2. Denyut slot kosong & rotasi kepala menara
    this.slotMeshes.forEach((mesh, slotId) => {
      const hasTower = this.towers.has(slotId);
      if (!hasTower) {
        // Efek denyut lembut
        const scale = 1.0 + Math.sin(elapsed * 3.5) * 0.04;
        mesh.scale.set(scale, 1, scale);
      } else {
        mesh.scale.set(1, 1, 1);
      }
    });

    // Menara membidik musuh terdekat & tembak proyektil/laser 3D spektakuler
    this.towers.forEach((tower) => {
      let nearestDist = 999;
      let targetEnemy: EnemyVisual | null = null;

      for (const enemy of this.enemies.values()) {
        const d = tower.group.position.distanceTo(enemy.group.position);
        if (d < nearestDist && d <= 18) {
          nearestDist = d;
          targetEnemy = enemy;
        }
      }

      if (targetEnemy) {
        tower.head.lookAt(targetEnemy.group.position);
        const speedMult = this.isBuffActive ? 0.65 : 1.0;
        const baseCooldown = tower.type === 'cannon' ? 1.8 : tower.type === 'catapult' ? 2.4 : tower.type === 'magic' ? 1.3 : 0.9;
        const cooldown = baseCooldown * speedMult;

        if (elapsed - tower.lastShotTime >= cooldown) {
          tower.lastShotTime = elapsed;
          const startPt = tower.group.position.clone().add(new THREE.Vector3(0, 2.8, 0));
          const hitPt = targetEnemy.group.position.clone().add(new THREE.Vector3(0, 0.7, 0));

          if (tower.type === 'archer') {
            // 1. Tembakan Berkas Laser Merah Luminous (Archer Tower)
            const laser = this.laserBeamPool.acquire();
            if (laser) {
              const dir = new THREE.Vector3().subVectors(hitPt, startPt);
              const distance = dir.length();
              laser.position.copy(startPt).addScaledVector(dir, 0.5);
              laser.scale.set(1, 1, distance);
              laser.lookAt(hitPt);
              laser.visible = true;
              setTimeout(() => { this.laserBeamPool.release(laser); }, 160);
            }
            this.particleSystem.emitBurst(startPt, 0xef4444, 4, 1.2, 0.3, 0.2);
            this.particleSystem.emitBurst(hitPt, 0xef4444, 8, 2.5, 0.5, 0.28);
          } else if (tower.type === 'cannon') {
            // 2. Tembakan Peluru Meriam Berapi (Cannon Tower)
            const ball = this.cannonballPool.acquire();
            if (ball) {
              ball.position.copy(startPt);
              ball.visible = true;
              this.activeProjectiles.push({
                type: 'cannon',
                mesh: ball,
                startPos: startPt,
                targetPos: hitPt,
                progress: 0,
                speed: 3.5,
                arcHeight: 1.5,
                color: 0xf97316,
                lastTrailProgress: 0,
              });
            }
            this.particleSystem.emitBurst(startPt, 0xf97316, 5, 1.4, 0.35, 0.22);
          } else if (tower.type === 'magic') {
            // 3. Tembakan Bola Plasma Energi Sihir Es (Magic Tower)
            const orb = this.magicOrbPool.acquire();
            if (orb) {
              orb.position.copy(startPt);
              orb.visible = true;
              this.activeProjectiles.push({
                type: 'magic',
                mesh: orb,
                startPos: startPt,
                targetPos: hitPt,
                progress: 0,
                speed: 4.6,
                arcHeight: 0.6,
                color: 0x38bdf8,
                lastTrailProgress: 0,
              });
            }
            this.particleSystem.emitBurst(startPt, 0x38bdf8, 5, 1.3, 0.35, 0.2);
          } else {
            // 4. Tembakan Parabolik Bongkahan Batu Raksasa (Catapult Tower)
            const boulder = this.boulderPool.acquire();
            if (boulder) {
              boulder.position.copy(startPt);
              boulder.visible = true;
              this.activeProjectiles.push({
                type: 'catapult',
                mesh: boulder,
                startPos: startPt,
                targetPos: hitPt,
                progress: 0,
                speed: 2.2,
                arcHeight: 4.5,
                color: 0xa855f7,
                lastTrailProgress: 0,
              });
            }
            this.particleSystem.emitBurst(startPt, 0x94a3b8, 4, 1.2, 0.3, 0.2);
          }
        }
      } else {
        // Rotasi idle pelan
        tower.head.rotation.y += delta * 0.5;
      }
    });

    // Update posisi semua proyektil aktif yang sedang meluncur di udara
    for (let i = this.activeProjectiles.length - 1; i >= 0; i--) {
      const proj = this.activeProjectiles[i];
      proj.progress += delta * proj.speed;

      if (proj.progress >= 1.0) {
        // Benturan ledakan proyektil di target
        const burstCount = proj.type === 'cannon' ? 16 : proj.type === 'catapult' ? 16 : 12;
        const burstSpeed = proj.type === 'cannon' ? 3.8 : 3.0;
        this.particleSystem.emitBurst(proj.targetPos, proj.color, burstCount, burstSpeed, 0.7, 0.4);

        if (proj.type === 'cannon') {
          this.cannonballPool.release(proj.mesh as THREE.Group);
        } else if (proj.type === 'magic') {
          this.magicOrbPool.release(proj.mesh as THREE.Group);
        } else if (proj.type === 'catapult') {
          this.boulderPool.release(proj.mesh as THREE.Mesh);
        }
        this.activeProjectiles.splice(i, 1);
      } else {
        const curPos = new THREE.Vector3().lerpVectors(proj.startPos, proj.targetPos, proj.progress);
        if (proj.arcHeight > 0) {
          curPos.y += Math.sin(proj.progress * Math.PI) * proj.arcHeight;
        }
        proj.mesh.position.copy(curPos);

        if (proj.type === 'catapult') {
          proj.mesh.rotation.x += delta * 7;
          proj.mesh.rotation.z += delta * 5;
        }

        // Partikel jejak (trail) di udara
        if (proj.progress - proj.lastTrailProgress >= 0.15) {
          proj.lastTrailProgress = proj.progress;
          this.particleSystem.emitBurst(curPos, proj.color, 2, 0.9, 0.35, 0.2);
        }
      }
    }

    // 3. Interpolasi gerak musuh & animasi melayang / melangkah
    this.enemies.forEach((enemy) => {
      enemy.currentPos.lerp(enemy.targetPos, Math.min(1, delta * 6.0));
      enemy.group.position.copy(enemy.currentPos);

      // Animasi floating bobbing
      enemy.group.position.y += Math.sin(elapsed * 6 + enemy.currentPos.x) * 0.12;

      // Partikel salju ringan di sekitar musuh yang lambat
      if (enemy.isSlowed && Math.random() < 0.2) {
        this.particleSystem.emitBurst(enemy.group.position, 0x38bdf8, 1, 0.8, 0.5, 0.25);
      }
    });
  }

  public destroy(): void {
    this.unregisterRender();
    this.clearGhostTower();
    this.engine.renderer.domElement.removeEventListener('click', this.handleCanvasClick);

    this.environment.destroy();
    this.particleSystem.destroy();
    // Bersihkan proyektil aktif
    this.activeProjectiles.forEach((p) => {
      if (p.type === 'cannon') this.cannonballPool.release(p.mesh as THREE.Group);
      else if (p.type === 'magic') this.magicOrbPool.release(p.mesh as THREE.Group);
      else if (p.type === 'catapult') this.boulderPool.release(p.mesh as THREE.Mesh);
    });
    this.activeProjectiles = [];

    this.laserBeamPool.destroy();
    this.cannonballPool.destroy();
    this.magicOrbPool.destroy();
    this.boulderPool.destroy();

    this.effectsGroup.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const m = obj as THREE.Mesh;
        m.geometry?.dispose();
        if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
        else (m.material as THREE.Material)?.dispose();
      }
    });

    this.baseHpBarSprite?.dispose();

    this.towers.forEach((t) => {
      t.group.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
          else m.material?.dispose();
        }
      });
    });
    this.towers.clear();

    this.enemies.forEach((e) => {
      e.hpBar.dispose();
      e.group.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
          else m.material?.dispose();
        }
      });
    });
    this.enemies.clear();

    this.mapGroup.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh || (obj as THREE.LineSegments).isLineSegments) {
        const m = obj as any;
        m.geometry?.dispose();
        if (Array.isArray(m.material)) m.material.forEach((mat: any) => mat?.dispose());
        else m.material?.dispose();
      }
    });

    this.engine.scene.remove(this.mapGroup);
    this.engine.scene.remove(this.slotsGroup);
    this.engine.scene.remove(this.towersGroup);
    this.engine.scene.remove(this.enemiesGroup);
    this.engine.scene.remove(this.effectsGroup);
    this.engine.scene.remove(this.baseGroup);
  }
}
