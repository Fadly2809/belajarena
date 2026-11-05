import * as THREE from 'three';
import { ThreeEngine } from '../core/ThreeEngine';
import { DioramaEnvironment } from '../core/DioramaEnvironment';
import { createTextSprite, createHpBarSprite } from '../core/TextSprite';
import { FrugalParticleSystem, ObjectPool } from '../core/ObjectPool';
import { BossAudioSynth } from './BossAudioSynth';

export type BossPose = 'idle' | 'hit' | 'defeat_last_hit' | 'defeated' | 'laugh';

export interface BossStateData {
  bossHpExact: number;
  bossHpDisplay: number;
  initialBossHp: number;
  bossHpPercentDisplay: number;
  outcome: 'ongoing' | 'class_victory' | 'boss_victory';
  status: string;
  passedCount: number;
  officialCount: number;
  ketuntasanDisplay: number;
  questionCount: number;
  currentQuestion?: number;
  kkm: number;
  pose?: BossPose;
  boss?: {
    id: string;
    name: string;
    difficulty?: 'mudah' | 'sedang' | 'sulit' | string;
    color?: string;
    accent?: string;
    customImageUrl?: string | null;
  };
}

export interface BossRig {
  id: string;
  rootGroup: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  leftArmGroup: THREE.Group;
  rightArmGroup: THREE.Group;
  jawGroup?: THREE.Group;
  glitchParts: THREE.Object3D[];
  eyeMeshes: THREE.Mesh[];
  coreMesh?: THREE.Mesh;
  auraMesh?: THREE.Mesh;
  standingGroup?: THREE.Group;
  fallenGroup?: THREE.Group;
  tentacles?: THREE.Group[];
  orbitingMinions?: THREE.Mesh[];
  baseY: number;
  scale: number;
  currentPose: BossPose;
  setPose: (pose: BossPose) => void;
}

const LASER_PALETTE = [0x38bdf8, 0x10b981, 0xfacc15, 0xc084fc, 0xf43f5e, 0x06b6d4];

export type GlowingLaserGroup = THREE.Group & {
  beamGroup: THREE.Group;
  coreMesh: THREE.Mesh;
  innerGlowMesh: THREE.Mesh;
  outerHaloMesh: THREE.Mesh;
  muzzleMesh: THREE.Mesh;
  flareMesh: THREE.Mesh;
};

export class BossBattle3DScene {
  private engine: ThreeEngine;
  private environment: DioramaEnvironment;
  private particleSystem: FrugalParticleSystem;
  public audio: BossAudioSynth;

  private arenaGroup: THREE.Group;
  private bossGroup: THREE.Group;
  private laserGroup: THREE.Group;
  private effectsGroup: THREE.Group;

  private bossRig: BossRig | null = null;
  private currentBossId = '';
  private currentDifficulty = 'sedang';
  private currentCustomImage: string | null = null;

  // State sinkronisasi
  private currentHp = 10000;
  private maxHp = 10000;
  private visualHp = 10000;
  private outcome: 'ongoing' | 'class_victory' | 'boss_victory' = 'ongoing';
  private hpBarSprite: { sprite: THREE.Sprite; updateHp: (c: number, m: number) => void; dispose: () => void } | null = null;
  private bossNameSprite: { sprite: THREE.Sprite; updateText: (txt: string, badge?: string) => void; dispose: () => void } | null = null;

  // Kamera: Near-frontal (horizontal 0°..12°, vertikal 5°..10°)
  private cameraMode: 'overview' | 'bossFocus' | 'stageAngle' = 'overview';
  private cameraTargetPos = new THREE.Vector3(0, 7.2, 19.5);
  private cameraLookTarget = new THREE.Vector3(0, 5.5, 0);
  private cameraShake = 0;

  // Animasi & Hit Reaksi
  private recoilZ = 0;
  private hitFlashTimer = 0;
  private isDefeated = false;
  private currentPose: BossPose = 'idle';

  // Combo Barrage Detection (≥5 jawaban benar dalam 3 detik)
  private recentLaserTimes: number[] = [];
  private laserPool: ObjectPool<GlowingLaserGroup>;

  // Panggung Obor & Elemen Dekorasi
  private totemCrystals: THREE.Mesh[] = [];
  private stageFloorMesh: THREE.Mesh | null = null;

  private unregisterRender: () => void;

  constructor(engine: ThreeEngine) {
    this.engine = engine;
    this.audio = new BossAudioSynth();
    this.environment = new DioramaEnvironment(engine.scene, 'towerDefense');
    this.particleSystem = new FrugalParticleSystem(engine.scene, 450);

    this.arenaGroup = new THREE.Group();
    this.bossGroup = new THREE.Group();
    this.laserGroup = new THREE.Group();
    this.effectsGroup = new THREE.Group();

    engine.scene.add(this.arenaGroup);
    engine.scene.add(this.bossGroup);
    engine.scene.add(this.laserGroup);
    engine.scene.add(this.effectsGroup);

    // Inisialisasi pool laser berkas bercahaya
    this.laserPool = new ObjectPool<GlowingLaserGroup>(
      () => {
        const group = new THREE.Group() as GlowingLaserGroup;
        const beamGroup = new THREE.Group();

        // 1. Core Mesh (Inti Berkas Laser Proporsional Karakter Siswa Chibi)
        const coreGeo = new THREE.CylinderGeometry(0.028, 0.028, 1, 8);
        coreGeo.rotateX(Math.PI / 2);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.98 });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        beamGroup.add(coreMesh);

        // 2. Inner Glow Mesh (Pendaran Warna Sedang)
        const innerGeo = new THREE.CylinderGeometry(0.07, 0.07, 1, 8);
        innerGeo.rotateX(Math.PI / 2);
        const innerMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
        });
        const innerGlowMesh = new THREE.Mesh(innerGeo, innerMat);
        beamGroup.add(innerGlowMesh);

        // 3. Outer Halo Mesh (Aura Luminous Lembut)
        const outerGeo = new THREE.CylinderGeometry(0.15, 0.15, 1, 8);
        outerGeo.rotateX(Math.PI / 2);
        const outerMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.42,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
        });
        const outerHaloMesh = new THREE.Mesh(outerGeo, outerMat);
        beamGroup.add(outerHaloMesh);

        // 4. Muzzle & Flare (Ukuran Moncong Pas dengan Tangan Chibi)
        const muzzleGeo = new THREE.SphereGeometry(0.15, 8, 8);
        const muzzleMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
        });
        const muzzleMesh = new THREE.Mesh(muzzleGeo, muzzleMat);

        const flareGeo = new THREE.SphereGeometry(0.35, 8, 8);
        const flareMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.90,
          blending: THREE.AdditiveBlending,
        });
        const flareMesh = new THREE.Mesh(flareGeo, flareMat);

        group.add(beamGroup);
        group.add(muzzleMesh);
        group.add(flareMesh);

        group.beamGroup = beamGroup;
        group.coreMesh = coreMesh;
        group.innerGlowMesh = innerGlowMesh;
        group.outerHaloMesh = outerHaloMesh;
        group.muzzleMesh = muzzleMesh;
        group.flareMesh = flareMesh;

        this.laserGroup.add(group);
        return group;
      },
      (group) => {
        group.visible = false;
        group.beamGroup.scale.set(1, 1, 1);
      },
      12,
      35
    );

    // Bangun panggung diorama panggung arena
    this.buildArenaStage();

    // Atur preset kamera awal (Near-Frontal)
    this.setCameraPreset('overview');

    // Loop animasi
    this.unregisterRender = engine.addRenderCallback((delta, elapsed) => {
      this.update(delta, elapsed);
    });
  }

  /**
   * Panggung Diorama Melingkar Bertingkat dengan Cincin Energi & Pilar Totem
   */
  private buildArenaStage(): void {
    const stageGeo = new THREE.CylinderGeometry(11, 12.5, 2.5, 36);
    const stageMat = new THREE.MeshLambertMaterial({ color: 0x1e1b4b });
    this.stageFloorMesh = new THREE.Mesh(stageGeo, stageMat);
    this.stageFloorMesh.position.y = -1.25;
    this.stageFloorMesh.receiveShadow = true;
    this.arenaGroup.add(this.stageFloorMesh);

    const floorTopGeo = new THREE.CylinderGeometry(10.8, 10.8, 0.15, 36);
    const floorTopMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.25,
      metalness: 0.45,
    });
    const floorTop = new THREE.Mesh(floorTopGeo, floorTopMat);
    floorTop.position.y = 0.08;
    floorTop.receiveShadow = true;
    this.arenaGroup.add(floorTop);

    // Cincin Luar Neon Cyber
    const outerRingGeo = new THREE.RingGeometry(9.8, 10.5, 48);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.16;
    this.arenaGroup.add(outerRing);

    // Cincin Dalam Bercahaya
    const innerRingGeo = new THREE.RingGeometry(4.2, 4.8, 36);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.17;
    this.arenaGroup.add(innerRing);

    // 4 Pilar Totem Energi
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const x = Math.cos(angle) * 9.2;
      const z = Math.sin(angle) * 9.2;

      const totemGroup = new THREE.Group();
      totemGroup.position.set(x, 0, z);

      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.75, 4.0, 8),
        new THREE.MeshLambertMaterial({ color: 0x1e293b })
      );
      pillar.position.y = 2.0;
      pillar.castShadow = true;
      totemGroup.add(pillar);

      const pRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.75, 0.1, 6, 16),
        new THREE.MeshBasicMaterial({ color: 0x818cf8 })
      );
      pRing.rotation.x = Math.PI / 2;
      pRing.position.y = 3.6;
      totemGroup.add(pRing);

      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.75),
        new THREE.MeshLambertMaterial({
          color: 0x38bdf8,
          emissive: 0x38bdf8,
          emissiveIntensity: 0.65,
        })
      );
      crystal.position.y = 4.8;
      totemGroup.add(crystal);
      this.totemCrystals.push(crystal);

      this.arenaGroup.add(totemGroup);
    }
  }

  /**
   * Konstruksi Model 3D Karakter Boss Tanpa Lembar Penghalang
   */
  public loadBoss(bossId: string, difficulty = 'sedang', name = 'Boss', customImageUrl?: string | null): void {
    if (
      this.bossRig &&
      this.currentBossId === bossId &&
      this.currentDifficulty === difficulty &&
      this.currentCustomImage === customImageUrl
    ) {
      return;
    }

    this.currentBossId = bossId;
    this.currentDifficulty = difficulty;
    this.currentCustomImage = customImageUrl || null;

    if (this.bossRig) {
      this.bossGroup.remove(this.bossRig.rootGroup);
      this.bossRig.rootGroup.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
          else m.material?.dispose();
        }
      });
      this.bossRig = null;
    }

    const diffScale = difficulty === 'sulit' ? 1.3 : difficulty === 'mudah' ? 1.0 : 1.15;

    let rig: BossRig;
    if (customImageUrl) {
      rig = this.buildCustomBoss(diffScale, customImageUrl);
    } else if (bossId === 'robot-glitch') {
      rig = this.buildRobotGlitch(diffScale);
    } else if (bossId === 'rakus-maximus') {
      rig = this.buildRakusMaximus(diffScale);
    } else if (bossId === 'virus-lambda') {
      rig = this.buildVirusLambda(diffScale);
    } else if (bossId === 'bugzilla' || bossId === 'bugzilla-compiler') {
      rig = this.buildBugzilla(diffScale);
    } else {
      rig = this.buildRakusMaximus(diffScale);
    }

    this.bossRig = rig;
    this.bossGroup.add(rig.rootGroup);

    // Pasang Bar HP 3D & Label Nama di Atas Boss
    if (this.hpBarSprite) this.hpBarSprite.dispose();
    if (this.bossNameSprite) this.bossNameSprite.dispose();

    const headTopY = (rig.baseY + 10.4) * diffScale;

    this.bossNameSprite = createTextSprite(name.toUpperCase(), {
      textColor: '#ffffff',
      bgColor: '#1e1b4b',
      borderColor: '#f59e0b',
      fontSize: 22,
      width: 260,
      height: 56,
    });
    this.bossNameSprite.sprite.position.set(0, headTopY + 2.0, 0);
    this.bossGroup.add(this.bossNameSprite.sprite);

    this.hpBarSprite = createHpBarSprite(200, 26);
    this.hpBarSprite.sprite.position.set(0, headTopY + 0.8, 0);
    this.bossGroup.add(this.hpBarSprite.sprite);
    this.hpBarSprite.updateHp(this.visualHp, this.maxHp);
  }

  /**
   * 1. MODEL PROSEDURAL & VOLUMETRIK 3D ASLI: ROBOT GLITCH
   * Sesuai BossSprite.vue viewBox 0 0 200 220 — Murni Geometri 3D (Tanpa Lembar Kartu)
   */
  private buildRobotGlitch(scale: number): BossRig {
    const root = new THREE.Group();
    const bodyGroup = new THREE.Group();
    const headGroup = new THREE.Group();
    const leftArmGroup = new THREE.Group();
    const rightArmGroup = new THREE.Group();
    const glitchParts: THREE.Object3D[] = [];
    const eyeMeshes: THREE.Mesh[] = [];

    root.add(bodyGroup);
    bodyGroup.add(headGroup);
    bodyGroup.add(leftArmGroup);
    bodyGroup.add(rightArmGroup);

    // 1. Torso Zirah Trapezoid Mecha (#0284c7 & #082f49)
    const torsoGeo = new THREE.BoxGeometry(6.4, 4.8, 2.2);
    const torsoMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 });
    const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
    torsoMesh.position.set(0, 4.6, 0.0);
    torsoMesh.castShadow = true;
    bodyGroup.add(torsoMesh);
    glitchParts.push(torsoMesh);

    // Pelat Dada Dalam Hitam Cyber (#0f172a)
    const chestPlate = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 3.8, 0.4),
      new THREE.MeshLambertMaterial({ color: 0x0f172a })
    );
    chestPlate.position.set(0, 4.6, 1.0);
    bodyGroup.add(chestPlate);

    // Arc Reactor di Dada: Cincin Sian + Inti Putih Segitiga + 3 Ventilasi Pendingin
    const reactorRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.85, 0.14, 8, 24),
      new THREE.MeshLambertMaterial({ color: 0x0284c7 })
    );
    reactorRing.position.set(0, 4.6, 1.25);
    bodyGroup.add(reactorRing);

    const coreGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.2, 16);
    coreGeo.rotateX(Math.PI / 2);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, 4.6, 1.25);
    bodyGroup.add(coreMesh);

    // Segitiga Putih di Tengah Arc Reactor
    const triangleGeo = new THREE.ConeGeometry(0.38, 0.6, 3);
    const triangleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const triangleMesh = new THREE.Mesh(triangleGeo, triangleMat);
    triangleMesh.position.set(0, 4.6, 1.36);
    bodyGroup.add(triangleMesh);

    // 3 Ventilasi Pendingin Horizontal di Bawah Reaktor
    [-0.5, -0.8, -1.1].forEach((yOff) => {
      const vent = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.12, 0.15),
        new THREE.MeshLambertMaterial({ color: 0x334155 })
      );
      vent.position.set(0, 4.6 + yOff, 1.25);
      bodyGroup.add(vent);
    });

    // 2. Kepala Poligon Mecha
    const headGeo = new THREE.BoxGeometry(4.8, 2.8, 2.2);
    const headMat = new THREE.MeshLambertMaterial({ color: 0x082f49 });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.set(0, 7.4, 0.1);
    headMesh.castShadow = true;
    headGroup.add(headMesh);
    glitchParts.push(headMesh);

    // Modul Telinga Cyber di Kiri & Kanan Kepala
    [-2.6, 2.6].forEach((xSide) => {
      const ear = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 1.6, 1.4),
        new THREE.MeshLambertMaterial({ color: 0x0284c7 })
      );
      ear.position.set(xSide, 7.4, 0.1);
      headGroup.add(ear);
    });

    // Pelat Dahi & Lampu LED Status di Tengah
    const forehead = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.7, 0.3),
      new THREE.MeshLambertMaterial({ color: 0x0f172a })
    );
    forehead.position.set(0, 8.4, 1.15);
    headGroup.add(forehead);

    const ledMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x22c55e })
    );
    ledMesh.position.set(0, 8.4, 1.32);
    headGroup.add(ledMesh);
    eyeMeshes.push(ledMesh);

    // 3D Visor Mata Digital: Layar Lebar Menyatu
    const visorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(4.0, 1.3, 0.35),
      new THREE.MeshLambertMaterial({ color: 0x020617 })
    );
    visorFrame.position.set(0, 7.3, 1.18);
    headGroup.add(visorFrame);

    // Konten Visor (Dua Mata Digital Sian + Scanline)
    const visorContentGroup = new THREE.Group();
    visorContentGroup.position.set(0, 7.3, 1.38);

    const leftOpticRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.38, 0.08, 6, 16),
      new THREE.MeshBasicMaterial({ color: 0x0ea5e9 })
    );
    leftOpticRing.position.set(-1.0, 0, 0);
    visorContentGroup.add(leftOpticRing);

    const leftPupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    leftPupil.position.set(-1.0, 0, 0.05);
    visorContentGroup.add(leftPupil);
    eyeMeshes.push(leftPupil);

    const rightOpticRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.38, 0.08, 6, 16),
      new THREE.MeshBasicMaterial({ color: 0x0ea5e9 })
    );
    rightOpticRing.position.set(1.0, 0, 0);
    visorContentGroup.add(rightOpticRing);

    const rightPupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    rightPupil.position.set(1.0, 0, 0.05);
    visorContentGroup.add(rightPupil);
    eyeMeshes.push(rightPupil);

    const scanline = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 0.05, 0.02),
      new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.65 })
    );
    visorContentGroup.add(scanline);

    // Mode Laugh: Waveform Tawa Merah
    const waveformGroup = new THREE.Group();
    waveformGroup.position.set(0, 7.3, 1.38);
    waveformGroup.visible = false;
    [-1.0, 1.0].forEach((xEye) => {
      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(0.35, 0.08, 4, 12, Math.PI),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      arch.position.set(xEye, -0.1, 0);
      arch.rotation.z = Math.PI;
      waveformGroup.add(arch);
    });
    headGroup.add(waveformGroup);

    // Mode Defeated: ERR:404 X X
    const errorGroup = new THREE.Group();
    errorGroup.position.set(0, 7.3, 1.38);
    errorGroup.visible = false;
    [-1.0, 1.0].forEach((xEye) => {
      const b1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.08, 0.04),
        new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
      );
      b1.rotation.z = Math.PI / 4;
      b1.position.set(xEye, 0, 0);
      const b2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.08, 0.04),
        new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
      );
      b2.rotation.z = -Math.PI / 4;
      b2.position.set(xEye, 0, 0);
      errorGroup.add(b1);
      errorGroup.add(b2);
    });
    headGroup.add(errorGroup);
    headGroup.add(visorContentGroup);

    // Kisi-Kisi Mulut di Dagu (3 Bilah Ventilasi Horizontal)
    const mouthFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.35, 0.2),
      new THREE.MeshLambertMaterial({ color: 0x0f172a })
    );
    mouthFrame.position.set(0, 6.3, 1.15);
    headGroup.add(mouthFrame);

    for (let m = -0.5; m <= 0.5; m += 0.25) {
      const slat = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.25, 0.08),
        new THREE.MeshLambertMaterial({ color: 0x64748b })
      );
      slat.position.set(m, 6.3, 1.25);
      headGroup.add(slat);
    }

    // 2 Antena Miring Simetris dengan Bola Sian Menyala & Signal Arc
    [-2.2, 2.2].forEach((xSide, idx) => {
      const antGroup = new THREE.Group();
      antGroup.position.set(xSide * 0.65, 8.2, 0.1);
      antGroup.rotation.z = idx === 0 ? 0.38 : -0.38;

      const rod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8),
        new THREE.MeshLambertMaterial({ color: 0x64748b })
      );
      rod.position.y = 1.1;
      antGroup.add(rod);

      const tip = new THREE.Mesh(
        new THREE.SphereGeometry(0.38, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x67e8f9 })
      );
      tip.position.y = 2.2;
      antGroup.add(tip);
      eyeMeshes.push(tip);

      const arc = new THREE.Mesh(
        new THREE.TorusGeometry(0.55, 0.06, 6, 12, Math.PI * 0.7),
        new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.7 })
      );
      arc.position.set(idx === 0 ? -0.3 : 0.3, 2.3, 0);
      arc.rotation.z = idx === 0 ? -0.4 : 0.4;
      antGroup.add(arc);

      headGroup.add(antGroup);
      glitchParts.push(antGroup);
    });

    // 3. Bahu & Lengan Servo Mekanik dengan Sendi Engsel Kuning & Cakar Sian
    [-3.8, 3.8].forEach((xSide, idx) => {
      const armGroup = idx === 0 ? leftArmGroup : rightArmGroup;
      armGroup.position.set(xSide, 4.8, 0.2);

      // Pelindung Bahu Bersudut (Pauldrons) dengan Baut Sian
      const shoulder = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 1.2, 1.8),
        new THREE.MeshLambertMaterial({ color: 0x0369a1 })
      );
      shoulder.position.y = 0.4;
      armGroup.add(shoulder);

      const bolt = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0x67e8f9 })
      );
      bolt.position.set(0, 0.4, 0.95);
      armGroup.add(bolt);

      // Lengan Atas
      const upperArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.4, 1.6, 8),
        new THREE.MeshLambertMaterial({ color: 0x334155 })
      );
      upperArm.position.y = -0.7;
      armGroup.add(upperArm);

      // Sendi Engsel Bulat Kuning Emas
      const joint = new THREE.Mesh(
        new THREE.SphereGeometry(0.38, 10, 10),
        new THREE.MeshLambertMaterial({ color: 0xfacc15 })
      );
      joint.position.y = -1.6;
      armGroup.add(joint);

      // Capit Servo Cyber Sian
      const clawPincer = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.0, 0.6),
        new THREE.MeshLambertMaterial({ color: 0x38bdf8 })
      );
      clawPincer.position.y = -2.2;
      armGroup.add(clawPincer);

      glitchParts.push(armGroup);
    });

    // 4. Kubus Glitch Mengorbit
    for (let i = 0; i < 4; i++) {
      const gBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        new THREE.MeshBasicMaterial({ color: 0x67e8f9, wireframe: true })
      );
      const angle = (i / 4) * Math.PI * 2;
      gBox.position.set(Math.cos(angle) * 3.8, 5.0 + (i % 2) * 1.5, Math.sin(angle) * 3.8);
      bodyGroup.add(gBox);
      glitchParts.push(gBox);
    }

    root.scale.set(scale, scale, scale);

    const setPose = (p: BossPose) => {
      if (p === 'defeated' || p === 'defeat_last_hit') {
        headGroup.rotation.z = -0.18;
        headGroup.position.y = -0.3;
        leftArmGroup.position.y = 4.2;
        rightArmGroup.position.y = 4.0;
        ledMesh.material = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        visorContentGroup.visible = false;
        waveformGroup.visible = false;
        errorGroup.visible = true;
      } else if (p === 'laugh') {
        headGroup.rotation.z = 0;
        headGroup.position.y = 0;
        ledMesh.material = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        visorContentGroup.visible = false;
        waveformGroup.visible = true;
        errorGroup.visible = false;
      } else {
        headGroup.rotation.z = 0;
        headGroup.position.y = 0;
        leftArmGroup.position.y = 4.8;
        rightArmGroup.position.y = 4.8;
        ledMesh.material = new THREE.MeshBasicMaterial({ color: 0x22c55e });
        visorContentGroup.visible = true;
        waveformGroup.visible = false;
        errorGroup.visible = false;
      }
    };

    return {
      id: 'robot-glitch',
      rootGroup: root,
      bodyGroup,
      headGroup,
      leftArmGroup,
      rightArmGroup,
      glitchParts,
      eyeMeshes,
      coreMesh,
      baseY: 0,
      scale,
      currentPose: 'idle',
      setPose,
    };
  }

  /**
   * 2. MODEL PROSEDURAL & VOLUMETRIK 3D ASLI: VIRUS LAMBDA
   * Sesuai BossSprite.vue viewBox 0 0 200 220 — Murni Geometri 3D (Tanpa Lembar Kartu)
   */
  private buildVirusLambda(scale: number): BossRig {
    const root = new THREE.Group();
    const bodyGroup = new THREE.Group();
    const headGroup = new THREE.Group();
    const leftArmGroup = new THREE.Group();
    const rightArmGroup = new THREE.Group();
    const glitchParts: THREE.Object3D[] = [];
    const eyeMeshes: THREE.Mesh[] = [];
    const tentacles: THREE.Group[] = [];
    const orbitingMinions: THREE.Mesh[] = [];

    root.add(bodyGroup);
    bodyGroup.add(headGroup);

    // 1. Kapsid Inti Ikosahedron / Poligonal Hijau Zamrud
    const capsidGeo = new THREE.IcosahedronGeometry(3.6, 1);
    const capsidMat = new THREE.MeshLambertMaterial({ color: 0x059669 });
    const capsidMesh = new THREE.Mesh(capsidGeo, capsidMat);
    capsidMesh.position.set(0, 5.5, 0.0);
    capsidMesh.castShadow = true;
    bodyGroup.add(capsidMesh);
    glitchParts.push(capsidMesh);

    // Pelat Facet Shell di Permukaan Depan Kapsid
    const facet1 = new THREE.Mesh(
      new THREE.ConeGeometry(2.0, 0.2, 5),
      new THREE.MeshLambertMaterial({ color: 0x10b981, transparent: true, opacity: 0.85 })
    );
    facet1.position.set(0, 6.8, 2.5);
    facet1.rotation.x = Math.PI / 2;
    bodyGroup.add(facet1);

    // 2. Klaster Mata 3D Asli (Mata Sentral Siklop & 2 Satelit) — BUKAN LEMBAR FLAT!
    const eyeClusterGroup = new THREE.Group();
    eyeClusterGroup.position.set(0, 5.5, 3.4);

    // A. Mata Utama Siklop Tengah
    const mainEyeSocket = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.18, 8, 24),
      new THREE.MeshLambertMaterial({ color: 0x022c22 })
    );
    eyeClusterGroup.add(mainEyeSocket);

    // Sclera / Cornea Hijau Neon
    const mainEyeSclera = new THREE.Mesh(
      new THREE.SphereGeometry(1.4, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xa3e635 })
    );
    mainEyeSclera.scale.set(1.0, 1.0, 0.35);
    eyeClusterGroup.add(mainEyeSclera);
    eyeMeshes.push(mainEyeSclera);

    // Pupil Bulat Hijau Tua
    const mainPupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.65, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x064e3b })
    );
    mainPupil.position.z = 0.32;
    eyeClusterGroup.add(mainPupil);

    // Titik Pantulan Putih
    const glint = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    glint.position.set(0.25, 0.25, 0.42);
    eyeClusterGroup.add(glint);

    // Pupil Slit Merah untuk Mode Laugh
    const slitPupil = new THREE.Mesh(
      new THREE.ConeGeometry(0.28, 1.8, 4),
      new THREE.MeshBasicMaterial({ color: 0xdc2626 })
    );
    slitPupil.position.z = 0.35;
    slitPupil.visible = false;
    eyeClusterGroup.add(slitPupil);

    // Tanda X untuk Mode Defeated
    const defeatedXGroup = new THREE.Group();
    defeatedXGroup.position.z = 0.4;
    defeatedXGroup.visible = false;
    const xBar1 = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.28, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
    );
    xBar1.rotation.z = Math.PI / 4;
    const xBar2 = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.28, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
    );
    xBar2.rotation.z = -Math.PI / 4;
    defeatedXGroup.add(xBar1);
    defeatedXGroup.add(xBar2);
    eyeClusterGroup.add(defeatedXGroup);

    // B. Dua Mata Satelit Kiri & Kanan
    [-1.8, 1.8].forEach((xSide) => {
      const satGroup = new THREE.Group();
      satGroup.position.set(xSide, 0.8, -0.4);

      const satSocket = new THREE.Mesh(
        new THREE.TorusGeometry(0.5, 0.08, 6, 16),
        new THREE.MeshLambertMaterial({ color: 0x022c22 })
      );
      satGroup.add(satSocket);

      const satSclera = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xa3e635 })
      );
      satGroup.add(satSclera);
      eyeMeshes.push(satSclera);

      const satPupil = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x064e3b })
      );
      satPupil.position.z = 0.28;
      satGroup.add(satPupil);

      eyeClusterGroup.add(satGroup);
    });

    bodyGroup.add(eyeClusterGroup);

    // 3. Simbol Lambda (λ) Bercahaya di Puncak Kapsid
    const crestGroup = new THREE.Group();
    crestGroup.position.set(0, 9.2, 0.48);

    const lambdaLeg1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 1.4, 8),
      new THREE.MeshBasicMaterial({ color: 0x6ee7b7 })
    );
    lambdaLeg1.rotation.z = 0.45;
    crestGroup.add(lambdaLeg1);

    const lambdaLeg2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 1.1, 8),
      new THREE.MeshBasicMaterial({ color: 0x6ee7b7 })
    );
    lambdaLeg2.position.set(0.3, -0.2, 0);
    lambdaLeg2.rotation.z = -0.45;
    crestGroup.add(lambdaLeg2);

    const crestDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xa3e635 })
    );
    crestDot.position.set(0, 0.7, 0);
    crestGroup.add(crestDot);

    bodyGroup.add(crestGroup);
    glitchParts.push(crestGroup);

    // 4. 6 Duri Besar (Peplomer) Menonjol Keluar Simetris dengan Ujung Bola Mint (#6ee7b7)
    const spikeConfigs = [
      { angle: Math.PI * 0.75, length: 2.2, r: 0.45 },
      { angle: Math.PI * 0.25, length: 2.2, r: 0.45 },
      { angle: Math.PI * 0.95, length: 2.4, r: 0.42 },
      { angle: Math.PI * 0.05, length: 2.4, r: 0.42 },
      { angle: Math.PI * 1.25, length: 2.0, r: 0.38 },
      { angle: Math.PI * 1.75, length: 2.0, r: 0.38 },
    ];

    spikeConfigs.forEach((cfg) => {
      const spikeGroup = new THREE.Group();
      spikeGroup.position.set(0, 5.5, -0.1);
      spikeGroup.rotation.z = cfg.angle;

      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.24, cfg.length, 8),
        new THREE.MeshLambertMaterial({ color: 0x047857 })
      );
      shaft.position.y = 3.6 + cfg.length / 2;
      spikeGroup.add(shaft);

      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(cfg.r, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0x6ee7b7 })
      );
      bulb.position.y = 3.6 + cfg.length;
      spikeGroup.add(bulb);
      eyeMeshes.push(bulb);

      bodyGroup.add(spikeGroup);
      glitchParts.push(spikeGroup);
    });

    // 5. 5 Tentakel Bio-Flagela Menggantung ke Lantai Arena
    for (let t = -2; t <= 2; t++) {
      const tentGroup = new THREE.Group();
      tentGroup.position.set(t * 1.2, 3.2, 0.1);

      for (let s = 0; s < 4; s++) {
        const seg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.28 - s * 0.05, 0.34 - s * 0.05, 0.85, 6),
          new THREE.MeshLambertMaterial({ color: 0x047857 })
        );
        seg.position.y = -s * 0.8;
        tentGroup.add(seg);

        // Pengisap Bio Lime
        const sucker = new THREE.Mesh(
          new THREE.SphereGeometry(0.14, 6, 6),
          new THREE.MeshBasicMaterial({ color: 0xa3e635 })
        );
        sucker.position.set(0, -s * 0.8, 0.25);
        tentGroup.add(sucker);
      }
      bodyGroup.add(tentGroup);
      tentacles.push(tentGroup);
    }

    // 6. 2 Mikroba Mini (Spora Mengorbit) di Sekitar Tubuh
    [-3.8, 3.8].forEach((xPos, idx) => {
      const spore = new THREE.Mesh(
        new THREE.SphereGeometry(0.45, 8, 8),
        new THREE.MeshLambertMaterial({ color: 0x10b981 })
      );
      spore.position.set(xPos, 5.0 + idx * 0.8, 1.2);
      bodyGroup.add(spore);
      orbitingMinions.push(spore);
    });

    root.scale.set(scale, scale, scale);

    const setPose = (p: BossPose) => {
      if (p === 'defeated' || p === 'defeat_last_hit') {
        capsidMesh.material = new THREE.MeshLambertMaterial({ color: 0x1e293b });
        mainEyeSclera.material = new THREE.MeshBasicMaterial({ color: 0x334155 });
        mainPupil.visible = false;
        slitPupil.visible = false;
        defeatedXGroup.visible = true;
        tentacles.forEach((t) => (t.rotation.z = (Math.random() - 0.5) * 0.5));
      } else if (p === 'laugh') {
        capsidMesh.material = new THREE.MeshLambertMaterial({ color: 0x059669 });
        mainEyeSclera.material = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        mainPupil.visible = false;
        slitPupil.visible = true;
        defeatedXGroup.visible = false;
      } else {
        capsidMesh.material = new THREE.MeshLambertMaterial({ color: 0x059669 });
        mainEyeSclera.material = new THREE.MeshBasicMaterial({ color: 0xa3e635 });
        mainPupil.visible = true;
        slitPupil.visible = false;
        defeatedXGroup.visible = false;
      }
    };

    return {
      id: 'virus-lambda',
      rootGroup: root,
      bodyGroup,
      headGroup,
      leftArmGroup,
      rightArmGroup,
      glitchParts,
      eyeMeshes,
      tentacles,
      orbitingMinions,
      baseY: 0,
      scale,
      currentPose: 'idle',
      setPose,
    };
  }

  /**
   * 3. MODEL PROSEDURAL & VOLUMETRIK 3D ASLI: BUGZILLA COMPILER
   * Sesuai BossSprite.vue viewBox 0 0 200 220 — Murni Geometri 3D (Tanpa Lembar Kartu)
   */
  private buildBugzilla(scale: number): BossRig {
    const root = new THREE.Group();
    const bodyGroup = new THREE.Group();
    const headGroup = new THREE.Group();
    const leftArmGroup = new THREE.Group();
    const rightArmGroup = new THREE.Group();
    const glitchParts: THREE.Object3D[] = [];
    const eyeMeshes: THREE.Mesh[] = [];

    root.add(bodyGroup);
    bodyGroup.add(headGroup);
    bodyGroup.add(leftArmGroup);
    bodyGroup.add(rightArmGroup);

    // 1. Karapas Cangkang Punggung Cembung Kuning-Oranye (#d97706)
    const shellGeo = new THREE.SphereGeometry(3.6, 16, 14);
    shellGeo.scale(1.0, 1.25, 0.85);
    const shellMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    shellMesh.position.set(0, 4.6, 0.0);
    shellMesh.castShadow = true;
    bodyGroup.add(shellMesh);
    glitchParts.push(shellMesh);

    // Garis Punggung Tengah Karapas
    const seam = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 6.0, 0.3),
      new THREE.MeshLambertMaterial({ color: 0x451a03 })
    );
    seam.position.set(0, 4.6, 1.6);
    bodyGroup.add(seam);

    // Sayap Elytra di Belakang Punggung
    [-1.8, 1.8].forEach((xSide) => {
      const wing = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 4.6, 2.2),
        new THREE.MeshLambertMaterial({ color: 0x92400e })
      );
      wing.position.set(xSide, 5.2, -1.2);
      wing.rotation.y = xSide < 0 ? -0.35 : 0.35;
      bodyGroup.add(wing);
    });

    // Lambang Bahaya 3D di Dada: Segitiga Kuning dengan Tanda Seru Merah "!"
    const hazardPlate = new THREE.Mesh(
      new THREE.ConeGeometry(1.0, 1.5, 3),
      new THREE.MeshLambertMaterial({ color: 0xfacc15 })
    );
    hazardPlate.position.set(0, 4.8, 1.7);
    hazardPlate.rotation.z = Math.PI;
    bodyGroup.add(hazardPlate);

    // Tanda Seru Merah 3D di Tengah Perisai
    const exclamationBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.65, 0.15),
      new THREE.MeshBasicMaterial({ color: 0x7f1d1d })
    );
    exclamationBar.position.set(0, 4.95, 1.82);
    bodyGroup.add(exclamationBar);

    const exclamationDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x7f1d1d })
    );
    exclamationDot.position.set(0, 4.45, 1.82);
    bodyGroup.add(exclamationDot);

    // 2. Kepala Kumbang & Capit Mandibula Stag dengan Gerigi Putih
    const headGeo = new THREE.BoxGeometry(4.0, 2.4, 2.2);
    const headMat = new THREE.MeshLambertMaterial({ color: 0x292524 });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.set(0, 7.3, 0.4);
    headMesh.castShadow = true;
    headGroup.add(headMesh);
    glitchParts.push(headMesh);

    // Sepasang Mata Majemuk Merah Lonjong dengan Kisi
    const eyesGroup = new THREE.Group();
    [-1.2, 1.2].forEach((xSide) => {
      const eyeSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.65, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      eyeSphere.scale.set(1.1, 0.85, 0.5);
      eyeSphere.position.set(xSide, 7.5, 1.45);
      eyesGroup.add(eyeSphere);
      eyeMeshes.push(eyeSphere);
    });
    headGroup.add(eyesGroup);

    // Sepasang Capit Mandibula Stag Tajam dengan Gerigi Gigi Putih
    [-1.6, 1.6].forEach((xSide, idx) => {
      const mandGroup = new THREE.Group();
      mandGroup.position.set(xSide, 6.4, 1.35);
      mandGroup.rotation.z = idx === 0 ? -0.4 : 0.4;

      const mandible = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.45, 1.8, 6),
        new THREE.MeshLambertMaterial({ color: 0xfde047 })
      );
      mandible.position.y = -0.7;
      mandGroup.add(mandible);

      // Gerigi Gigi Putih
      for (let g = 0; g < 2; g++) {
        const tooth = new THREE.Mesh(
          new THREE.ConeGeometry(0.12, 0.35, 4),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        tooth.position.set(idx === 0 ? 0.22 : -0.22, -0.4 - g * 0.45, 0);
        tooth.rotation.z = idx === 0 ? -Math.PI / 2 : Math.PI / 2;
        mandGroup.add(tooth);
      }

      headGroup.add(mandGroup);
      glitchParts.push(mandGroup);
    });

    // 2 Antena Serangga Bersegmen Melengkung ke Luar dengan Ujung Merah/Oranye
    [-2.2, 2.2].forEach((xSide, idx) => {
      const antGroup = new THREE.Group();
      antGroup.position.set(xSide * 0.6, 8.2, 0.4);

      const curve = new THREE.CylinderGeometry(0.08, 0.12, 2.2, 6);
      const antMesh = new THREE.Mesh(curve, new THREE.MeshLambertMaterial({ color: 0xb45309 }));
      antMesh.position.set(idx === 0 ? -0.6 : 0.6, 1.0, 0);
      antMesh.rotation.z = idx === 0 ? 0.5 : -0.5;
      antGroup.add(antMesh);

      const tipBulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      tipBulb.position.set(idx === 0 ? -1.5 : 1.5, 2.0, 0);
      antGroup.add(tipBulb);
      eyeMeshes.push(tipBulb);

      headGroup.add(antGroup);
      glitchParts.push(antGroup);
    });

    // 3. Lengan Capit Scythe Mantis & Kaki Kumbang Bawah
    [-3.8, 3.8].forEach((xSide, idx) => {
      const armGroup = idx === 0 ? leftArmGroup : rightArmGroup;
      armGroup.position.set(xSide, 4.8, 0.4);

      const leg1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, 2.0, 6),
        new THREE.MeshLambertMaterial({ color: 0x78350f })
      );
      leg1.position.y = -0.8;
      leg1.rotation.z = idx === 0 ? 0.3 : -0.3;
      armGroup.add(leg1);

      const scythe = new THREE.Mesh(
        new THREE.ConeGeometry(0.35, 1.8, 4),
        new THREE.MeshLambertMaterial({ color: 0xfcd34d })
      );
      scythe.position.set(idx === 0 ? 0.4 : -0.4, -2.2, 0.3);
      scythe.rotation.z = idx === 0 ? -0.6 : 0.6;
      armGroup.add(scythe);

      glitchParts.push(armGroup);
    });

    root.scale.set(scale, scale, scale);

    const setPose = (p: BossPose) => {
      if (p === 'defeated' || p === 'defeat_last_hit') {
        headGroup.rotation.x = 0.25;
        shellMesh.material = new THREE.MeshLambertMaterial({ color: 0x451a03 });
      } else {
        headGroup.rotation.x = 0;
        shellMesh.material = new THREE.MeshLambertMaterial({ color: 0xd97706 });
      }
    };

    return {
      id: 'bugzilla',
      rootGroup: root,
      bodyGroup,
      headGroup,
      leftArmGroup,
      rightArmGroup,
      glitchParts,
      eyeMeshes,
      baseY: 0,
      scale,
      currentPose: 'idle',
      setPose,
    };
  }

  /**
   * 4. MODEL PROSEDURAL & VOLUMETRIK 3D ASLI: RAKUS MAXIMUS
   * Dilengkapi Standing Group & Fallen Collapsed Group ('rakus-fallen')
   */
  private buildRakusMaximus(scale: number): BossRig {
    const root = new THREE.Group();
    const bodyGroup = new THREE.Group();
    const headGroup = new THREE.Group();
    const leftArmGroup = new THREE.Group();
    const rightArmGroup = new THREE.Group();
    const jawGroup = new THREE.Group();
    const standingGroup = new THREE.Group();
    const fallenGroup = new THREE.Group();
    const glitchParts: THREE.Object3D[] = [];
    const eyeMeshes: THREE.Mesh[] = [];

    root.add(standingGroup);
    root.add(fallenGroup);
    standingGroup.add(bodyGroup);
    bodyGroup.add(headGroup);
    bodyGroup.add(leftArmGroup);
    bodyGroup.add(rightArmGroup);
    headGroup.add(jawGroup);

    // ========================================================
    // A. STANDING GROUP (Pose Normal, Hit, Laugh)
    // ========================================================

    // 1. Torso Kekar Berotot Ungu Tua (#6b21a8 / #581c87)
    const bodyGeo = new THREE.BoxGeometry(7.2, 5.6, 2.8);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x6b21a8 });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.set(0, 4.6, 0.0);
    bodyMesh.castShadow = true;
    bodyGroup.add(bodyMesh);
    glitchParts.push(bodyMesh);

    // Perisai Dada Berpelat Logam dengan Kristal Inti Ungu (#c084fc)
    const pectoralPlate = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 2.4, 0.4),
      new THREE.MeshLambertMaterial({ color: 0x1e1b4b })
    );
    pectoralPlate.position.set(0, 4.4, 1.45);
    bodyGroup.add(pectoralPlate);

    const coreCrystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.75),
      new THREE.MeshBasicMaterial({ color: 0xc084fc })
    );
    coreCrystal.position.set(0, 4.4, 1.7);
    bodyGroup.add(coreCrystal);

    // 2. Pelindung Bahu Bertatah Duri Emas di Kiri & Kanan
    [-3.8, 3.8].forEach((xSide, idx) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(xSide, 5.8, 0.25);

      const pad = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 1.4, 2.2),
        new THREE.MeshLambertMaterial({ color: 0x475569 })
      );
      pGroup.add(pad);

      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.35, 1.2, 5),
        new THREE.MeshLambertMaterial({ color: 0xeab308 })
      );
      spike.position.set(idx === 0 ? -0.4 : 0.4, 1.0, 0);
      spike.rotation.z = idx === 0 ? 0.35 : -0.35;
      pGroup.add(spike);

      bodyGroup.add(pGroup);
    });

    // 3. Kepala Monster Golem dengan Alis Tebal, Mata Oranye & Taring Bawah
    const headGeo = new THREE.BoxGeometry(4.8, 2.8, 2.4);
    const headMat = new THREE.MeshLambertMaterial({ color: 0x581c87 });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.set(0, 7.4, 0.4);
    headMesh.castShadow = true;
    headGroup.add(headMesh);
    glitchParts.push(headMesh);

    // 2 Tanduk Iblis Melengkung ke Atas-Luar Bergaris Gelang Emas (3 band per tanduk)
    [-2.2, 2.2].forEach((xSide, idx) => {
      const hornGroup = new THREE.Group();
      hornGroup.position.set(xSide, 8.4, 0.2);

      const horn = new THREE.Mesh(
        new THREE.ConeGeometry(0.7, 3.2, 8),
        new THREE.MeshLambertMaterial({ color: 0xeab308 })
      );
      horn.position.set(idx === 0 ? -0.8 : 0.8, 1.4, 0);
      horn.rotation.z = idx === 0 ? 0.5 : -0.5;
      hornGroup.add(horn);

      // Gelang Emas Ridges
      [0.6, 1.2, 1.8].forEach((yR) => {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.55 - yR * 0.12, 0.08, 6, 12),
          new THREE.MeshBasicMaterial({ color: 0xfef08a })
        );
        ring.position.set(idx === 0 ? -yR * 0.45 : yR * 0.45, yR, 0);
        ring.rotation.x = Math.PI / 2;
        hornGroup.add(ring);
      });

      headGroup.add(hornGroup);
      glitchParts.push(hornGroup);
    });

    // Mata Oranye Menyala Garang
    [-1.0, 1.0].forEach((xSide) => {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xea580c })
      );
      eye.position.set(xSide, 7.6, 1.6);
      headGroup.add(eye);
      eyeMeshes.push(eye);
    });

    // Mulut dengan Taring Bawah Mencuat ke Atas
    const mouthCavity = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.8, 0.4),
      new THREE.MeshLambertMaterial({ color: 0x2d0606 })
    );
    mouthCavity.position.set(0, 6.7, 1.5);
    headGroup.add(mouthCavity);

    // Taring Bawah Mencuat ke Atas (Canine Tusks)
    [-0.8, 0.8].forEach((xSide) => {
      const tusk = new THREE.Mesh(
        new THREE.ConeGeometry(0.24, 0.75, 4),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      tusk.position.set(xSide, 6.8, 1.65);
      headGroup.add(tusk);
    });

    // 4. Lengan Besar Menyentuh Tanah dengan Cakar Emas 3 Jari
    [-3.8, 3.8].forEach((xSide, idx) => {
      const armGroup = idx === 0 ? leftArmGroup : rightArmGroup;
      armGroup.position.set(xSide, 4.2, 0.5);

      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.95, 3.4, 8),
        new THREE.MeshLambertMaterial({ color: 0x581c87 })
      );
      arm.position.y = -1.2;
      armGroup.add(arm);

      [-0.4, 0, 0.4].forEach((cOff) => {
        const claw = new THREE.Mesh(
          new THREE.ConeGeometry(0.2, 0.65, 4),
          new THREE.MeshLambertMaterial({ color: 0xfacc15 })
        );
        claw.position.set(cOff, -2.8, 0.3);
        claw.rotation.x = -Math.PI / 4;
        armGroup.add(claw);
      });

      glitchParts.push(armGroup);
    });

    // ========================================================
    // B. FALLEN / COLLAPSED GROUP ('rakus-fallen' di Lantai)
    // ========================================================
    fallenGroup.visible = false;
    fallenGroup.position.set(0, 1.0, 0.2);

    const fallenBody = new THREE.Mesh(
      new THREE.BoxGeometry(8.2, 2.0, 4.0),
      new THREE.MeshLambertMaterial({ color: 0x581c87 })
    );
    fallenBody.position.set(0, 0.8, 0);
    fallenGroup.add(fallenBody);

    // Kepala Rebah di Lantai
    const fallenHead = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 1.8, 2.8),
      new THREE.MeshLambertMaterial({ color: 0x581c87 })
    );
    fallenHead.position.set(0, 0.6, 1.6);
    fallenGroup.add(fallenHead);

    // Mata Tanda Silang X
    [-0.9, 0.9].forEach((xEye) => {
      const b1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.12, 0.08),
        new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
      );
      b1.rotation.z = Math.PI / 4;
      b1.position.set(xEye, 1.1, 2.8);
      const b2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.12, 0.08),
        new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
      );
      b2.rotation.z = -Math.PI / 4;
      b2.position.set(xEye, 1.1, 2.8);
      fallenGroup.add(b1);
      fallenGroup.add(b2);
    });

    // Lidah Menjulur ke Lantai
    const tongue = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.15, 0.9),
      new THREE.MeshBasicMaterial({ color: 0xf43f5e })
    );
    tongue.position.set(0, 0.25, 2.8);
    fallenGroup.add(tongue);

    // Tanduk Rebah Miring Menempel Lantai
    [-3.8, 3.8].forEach((xSide, idx) => {
      const fHorn = new THREE.Mesh(
        new THREE.ConeGeometry(0.65, 2.8, 6),
        new THREE.MeshLambertMaterial({ color: 0xca8a04 })
      );
      fHorn.position.set(xSide, 0.6, 0.8);
      fHorn.rotation.z = idx === 0 ? 1.4 : -1.4;
      fHorn.rotation.y = idx === 0 ? 0.3 : -0.3;
      fallenGroup.add(fHorn);
    });

    root.scale.set(scale, scale, scale);

    const setPose = (p: BossPose) => {
      if (p === 'defeated' || p === 'defeat_last_hit') {
        standingGroup.visible = false;
        fallenGroup.visible = true;
      } else {
        standingGroup.visible = true;
        fallenGroup.visible = false;
      }
    };

    return {
      id: 'rakus-maximus',
      rootGroup: root,
      bodyGroup,
      headGroup,
      leftArmGroup,
      rightArmGroup,
      jawGroup,
      standingGroup,
      fallenGroup,
      glitchParts,
      eyeMeshes,
      coreMesh: coreCrystal,
      baseY: 0,
      scale,
      currentPose: 'idle',
      setPose,
    };
  }

  /**
   * 5. MODEL PROSEDURAL: CUSTOM IMAGE AVATAR BOSS
   */
  private buildCustomBoss(scale: number, imageUrl: string): BossRig {
    const root = new THREE.Group();
    const bodyGroup = new THREE.Group();
    const headGroup = new THREE.Group();
    const leftArmGroup = new THREE.Group();
    const rightArmGroup = new THREE.Group();

    root.add(bodyGroup);

    const loader = new THREE.TextureLoader();
    const texture = loader.load(imageUrl);
    texture.colorSpace = THREE.SRGBColorSpace;

    const frameGeo = new THREE.BoxGeometry(8.6, 9.6, 0.6);
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x1e1b4b });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, 5.5, 0);
    frame.castShadow = true;
    bodyGroup.add(frame);

    const planeGeo = new THREE.PlaneGeometry(8.2, 9.2);
    const planeMat = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      roughness: 0.35,
      metalness: 0.15,
      side: THREE.DoubleSide,
    });
    const frontFaceMesh = new THREE.Mesh(planeGeo, planeMat);
    frontFaceMesh.position.set(0, 5.5, 0.32);
    bodyGroup.add(frontFaceMesh);

    root.scale.set(scale, scale, scale);

    const setPose = (_p: BossPose) => {};

    return {
      id: 'custom-boss',
      rootGroup: root,
      bodyGroup,
      headGroup,
      leftArmGroup,
      rightArmGroup,
      glitchParts: [frame],
      eyeMeshes: [],
      baseY: 0,
      scale,
      currentPose: 'idle',
      setPose,
    };
  }

  /**
   * Pemicu Serangan Laser Siswa (Jawaban Benar Terverifikasi Server)
   */
  public triggerStudentAttack(startXPercent: number, _studentName?: string, damage?: number): void {
    const now = performance.now();
    this.recentLaserTimes.push(now);
    this.recentLaserTimes = this.recentLaserTimes.filter((t) => now - t <= 3000);

    const isCombo = this.recentLaserTimes.length >= 5;
    if (isCombo) {
      this.audio.playComboBarrage();
    } else {
      this.audio.playLaser(false);
    }

    const laser = this.laserPool.acquire();
    if (laser) {
      const clampedPct = Math.max(2, Math.min(98, startXPercent));
      const ndcX = (clampedPct / 100) * 2 - 1;
      const ndc = new THREE.Vector3(ndcX, -0.88, 0.5);
      ndc.unproject(this.engine.camera);
      const rayDir = ndc.sub(this.engine.camera.position).normalize();
      const startPos = this.engine.camera.position.clone().add(rayDir.multiplyScalar(9.0));

      const targetY = this.bossRig ? 5.2 * this.bossRig.scale : 5.2;
      const targetPos = new THREE.Vector3(
        (Math.random() - 0.5) * 1.0,
        targetY + (Math.random() - 0.5) * 0.8,
        0.5
      );

      const dir = new THREE.Vector3().subVectors(targetPos, startPos);
      const distance = dir.length();

      laser.beamGroup.position.copy(startPos).addScaledVector(dir, 0.5);
      const thickness = isCombo ? 1.28 : 1.0;
      laser.beamGroup.scale.set(thickness, thickness, distance);
      laser.beamGroup.lookAt(targetPos);

      laser.muzzleMesh.position.copy(startPos);
      laser.flareMesh.position.copy(targetPos);

      const color = LASER_PALETTE[Math.floor(Math.random() * LASER_PALETTE.length)];
      (laser.innerGlowMesh.material as THREE.MeshBasicMaterial).color.setHex(color);
      (laser.outerHaloMesh.material as THREE.MeshBasicMaterial).color.setHex(color);
      (laser.muzzleMesh.material as THREE.MeshBasicMaterial).color.setHex(color);
      (laser.flareMesh.material as THREE.MeshBasicMaterial).color.setHex(color);

      laser.visible = true;

      setTimeout(() => {
        this.laserPool.release(laser);
      }, 180);

      setTimeout(() => {
        this.audio.playHit(isCombo);
        this.applyBossHit(targetPos, color, damage, isCombo);
      }, 70);
    }
  }

  /**
   * Efek Benturan Fisik, Partikel Pecahan, Flinch Recoil, dan Teks Damage
   */
  private applyBossHit(hitPos: THREE.Vector3, colorHex: number, damage?: number, isCombo = false): void {
    if (!this.bossRig) return;

    this.recoilZ = isCombo ? 1.4 : 0.7;
    this.hitFlashTimer = 0.18;
    this.cameraShake = isCombo ? 0.6 : 0.25;

    const particleCount = isCombo ? 24 : 12;
    this.particleSystem.emitBurst(hitPos, colorHex, particleCount, 4.5, 0.7, 0.45);

    // Jitter pergeseran bagian glitch
    if (this.bossRig.id === 'robot-glitch') {
      this.bossRig.glitchParts.forEach((part) => {
        part.position.x += (Math.random() - 0.5) * 0.35;
        setTimeout(() => {
          part.position.x = 0;
        }, 120);
      });
    }

    if (damage && damage > 0) {
      const dmgSprite = createTextSprite(`-${damage.toLocaleString('id-ID')}`, {
        textColor: '#facc15',
        bgColor: 'rgba(239, 68, 68, 0.85)',
        borderColor: '#ffffff',
        fontSize: 24,
        width: 140,
        height: 48,
      });
      dmgSprite.sprite.position.copy(hitPos).add(new THREE.Vector3(0, 1.2, 1.0));
      this.effectsGroup.add(dmgSprite.sprite);

      let elapsed = 0;
      const animateDmg = () => {
        elapsed += 0.03;
        dmgSprite.sprite.position.y += 0.08;
        if (elapsed < 0.75) {
          requestAnimationFrame(animateDmg);
        } else {
          this.effectsGroup.remove(dmgSprite.sprite);
          dmgSprite.dispose();
        }
      };
      requestAnimationFrame(animateDmg);
    }
  }

  /**
   * Animasi Boss Tumbang (Pose Defeated / Confetti Kemenangan)
   */
  private triggerDefeatExplosion(): void {
    if (this.isDefeated || !this.bossRig) return;
    this.isDefeated = true;
    this.audio.playVictoryFanfare();

    if (this.hpBarSprite) this.hpBarSprite.sprite.visible = false;
    if (this.bossNameSprite) this.bossNameSprite.sprite.visible = false;

    this.bossRig.setPose('defeated');

    const confColors = [0xfbbf24, 0x10b981, 0x38bdf8, 0xf43f5e, 0xa855f7];
    for (let c = 0; c < 5; c++) {
      this.particleSystem.emitBurst(
        new THREE.Vector3((Math.random() - 0.5) * 8, 9 + c * 0.8, (Math.random() - 0.5) * 8),
        confColors[c],
        25,
        3.5,
        2.5,
        0.8
      );
    }
  }

  /**
   * Kamera Presets: Dikunci Pada Sudut Near-Frontal (0°..12° horizontal, 5°..10° vertikal)
   */
  public setCameraPreset(mode: 'overview' | 'bossFocus' | 'stageAngle'): void {
    this.cameraMode = mode;
    if (mode === 'overview') {
      this.cameraTargetPos.set(0, 7.2, 19.5);
      this.cameraLookTarget.set(0, 5.5, 0);
    } else if (mode === 'bossFocus') {
      this.cameraTargetPos.set(0, 6.7, 14.5);
      this.cameraLookTarget.set(0, 5.5, 0);
    } else if (mode === 'stageAngle') {
      this.cameraTargetPos.set(2.0, 7.2, 19.5);
      this.cameraLookTarget.set(0, 5.5, 0);
    }
  }

  /**
   * Paksa Pose / Boss (Untuk Dev Tool Bandingkan 2D/3D)
   */
  public forceBossPose(pose: BossPose): void {
    this.currentPose = pose;
    if (this.bossRig) {
      this.bossRig.setPose(pose);
    }
  }

  public forceBoss(bossId: string, pose: BossPose = 'idle'): void {
    this.loadBoss(bossId, 'sedang', bossId);
    this.forceBossPose(pose);
  }

  /**
   * Sinkronisasi Game State dari Server
   */
  public syncState(state: BossStateData): void {
    if (!state) return;

    this.currentHp = state.bossHpExact ?? state.bossHpDisplay ?? 10000;
    this.maxHp = state.initialBossHp || 10000;
    this.outcome = state.outcome;

    if (state.boss) {
      this.loadBoss(
        state.boss.id,
        state.boss.difficulty || 'sedang',
        state.boss.name,
        state.boss.customImageUrl
      );
    }

    const pose = state.pose || (state.outcome === 'class_victory' ? 'defeated' : state.outcome === 'boss_victory' ? 'laugh' : 'idle');
    if (pose !== this.currentPose && this.bossRig) {
      this.currentPose = pose;
      this.bossRig.setPose(pose);
    }

    if ((this.outcome === 'class_victory' || this.currentHp <= 0) && !this.isDefeated) {
      this.triggerDefeatExplosion();
    }
  }

  /**
   * Loop Update Per-Frame
   */
  public update(delta: number, elapsed: number): void {
    this.environment.update(delta);
    this.particleSystem.update(delta);

    // 1. Interpolasi Posisi Kamera & Camera Shake
    let camPos = this.cameraTargetPos.clone();
    if (this.cameraShake > 0) {
      camPos.x += (Math.random() - 0.5) * this.cameraShake;
      camPos.y += (Math.random() - 0.5) * this.cameraShake;
      camPos.z += (Math.random() - 0.5) * this.cameraShake;
      this.cameraShake = Math.max(0, this.cameraShake - delta * 2.0);
    }
    this.engine.camera.position.lerp(camPos, Math.min(1, delta * 3.5));
    this.engine.camera.lookAt(this.cameraLookTarget);

    // 2. Putar Kristal Pilar Totem
    this.totemCrystals.forEach((c, idx) => {
      c.rotation.y += delta * 1.2;
      c.position.y = 4.8 + Math.sin(elapsed * 2.5 + idx) * 0.2;
    });

    // 3. Interpolasi Visual HP Bar
    this.visualHp += (this.currentHp - this.visualHp) * Math.min(1, delta * 6.0);
    if (this.hpBarSprite && this.hpBarSprite.sprite.visible) {
      this.hpBarSprite.updateHp(this.visualHp, this.maxHp);
    }

    // 4. Animasi & Pose Boss
    if (this.bossRig) {
      const isDefeatedPose = this.currentPose === 'defeated' || this.currentPose === 'defeat_last_hit';

      if (!isDefeatedPose) {
        // A. Napas / Denyut Lembut (Skala Y 0.98..1.02)
        const breathe = 1.0 + Math.sin(elapsed * 2.2) * 0.02;
        this.bossRig.bodyGroup.scale.set(1.0, breathe, 1.0);

        // B. Recoil Z kembali perlahan ke 0
        if (this.recoilZ > 0) {
          this.bossRig.bodyGroup.position.z = -this.recoilZ;
          this.recoilZ = Math.max(0, this.recoilZ - delta * 3.5);
        } else {
          this.bossRig.bodyGroup.position.z = 0;
        }

        // C. Ayunan Lembut Anggota Gerak
        this.bossRig.leftArmGroup.rotation.x = Math.sin(elapsed * 1.8) * 0.12;
        this.bossRig.rightArmGroup.rotation.x = -Math.sin(elapsed * 1.8) * 0.12;

        // D. Gelombang Tentakel Virus Lambda
        if (this.bossRig.tentacles) {
          this.bossRig.tentacles.forEach((tent, idx) => {
            tent.rotation.z = Math.sin(elapsed * 2.5 + idx * 0.8) * 0.15;
          });
        }

        // E. Spora Mengorbit di Sekitar Virus Lambda
        if (this.bossRig.orbitingMinions) {
          this.bossRig.orbitingMinions.forEach((spore, idx) => {
            const angle = elapsed * 1.4 + idx * Math.PI;
            spore.position.set(Math.cos(angle) * 4.6, 5.2 + Math.sin(elapsed * 2.0 + idx) * 0.6, Math.sin(angle) * 1.8);
          });
        }

        // F. Gerakan Tertawa (Laugh) Berguncang Vertikal Ringan
        if (this.currentPose === 'laugh') {
          this.bossRig.bodyGroup.position.y = Math.sin(elapsed * 12.0) * 0.18;
          if (this.bossRig.jawGroup) {
            this.bossRig.jawGroup.rotation.x = Math.abs(Math.sin(elapsed * 8.0)) * 0.35;
          }
        } else {
          this.bossRig.bodyGroup.position.y = Math.sin(elapsed * 2.2) * 0.15;
        }
      }
    }
  }

  public destroy(): void {
    this.unregisterRender();
    this.audio.destroy();
    this.environment.destroy();
    this.particleSystem.destroy();
    this.laserPool.destroy();
    this.laserGroup.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const m = obj as THREE.Mesh;
        m.geometry?.dispose();
        if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
        else (m.material as THREE.Material)?.dispose();
      }
    });

    this.hpBarSprite?.dispose();
    this.bossNameSprite?.dispose();

    if (this.bossRig) {
      this.bossRig.rootGroup.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
          else m.material?.dispose();
        }
      });
    }
  }
}
