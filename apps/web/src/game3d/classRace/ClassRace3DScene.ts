import * as THREE from 'three';
import { ThreeEngine } from '../core/ThreeEngine';
import { DioramaEnvironment } from '../core/DioramaEnvironment';
import { createTextSprite } from '../core/TextSprite';
import { FrugalParticleSystem } from '../core/ObjectPool';

export interface RaceTeamData {
  id: string;
  name: string;
  color: string;
  rank: number;
  distance: number;
  last_round_step?: number;
  turbo_active?: boolean;
  member_ids?: string[];
}

export interface RaceStateData {
  status: 'lobby' | 'in_progress' | 'completed' | 'finished';
  teams: RaceTeamData[];
  race_length: number;
  current_round: number;
  total_rounds: number;
  winner_team_id?: string;
  podium?: Array<{ rank: number; team_id: string; team_name: string; total_distance: number }>;
}

interface CarEntity {
  id: string;
  group: THREE.Group;
  bodyMesh: THREE.Mesh;
  wheels: THREE.Mesh[];
  labelSprite: { sprite: THREE.Sprite; updateText: (txt: string, badge?: string) => void; dispose: () => void };
  targetZ: number;
  currentZ: number;
  laneX: number;
  turboTrails: THREE.Mesh[];
  isTurbo: boolean;
}

/**
 * ClassRace3DScene: Pengelola lintasan balap, mobil balap prosedural,
 * follow-cam, efek turbo, traffic light, dan panggung podium 3D.
 */
export class ClassRace3DScene {
  private engine: ThreeEngine;
  private environment: DioramaEnvironment;
  private particleSystem: FrugalParticleSystem;

  private trackGroup: THREE.Group;
  private carsGroup: THREE.Group;
  private podiumGroup: THREE.Group;
  private trafficLightGroup: THREE.Group;

  private cars: Map<string, CarEntity> = new Map();
  private trackLength = 120; // Panjang lintasan 3D
  private laneWidth = 3.2;
  private currentLeadingZ = 0;
  private finishLineZ = 100;
  private ribbonMesh: THREE.Mesh | null = null;
  private isRibbonBroken = false;

  // Traffic light lamps
  private lightLamps: THREE.Mesh[] = [];

  // Kamera
  private baseFov = 45;
  private turboFov = 54;
  private currentFov = 45;

  private unregisterRender: () => void;

  constructor(engine: ThreeEngine) {
    this.engine = engine;
    this.environment = new DioramaEnvironment(engine.scene, 'race');
    this.particleSystem = new FrugalParticleSystem(engine.scene, 350);

    this.trackGroup = new THREE.Group();
    this.carsGroup = new THREE.Group();
    this.podiumGroup = new THREE.Group();
    this.trafficLightGroup = new THREE.Group();

    engine.scene.add(this.trackGroup);
    engine.scene.add(this.carsGroup);
    engine.scene.add(this.podiumGroup);
    engine.scene.add(this.trafficLightGroup);

    this.podiumGroup.visible = false;

    // Buat lintasan dan lingkungan
    this.buildTrackAndScenery();

    // Buat lampu start 3D
    this.buildTrafficLight();

    // Daftarkan render update loop
    this.unregisterRender = engine.addRenderCallback((delta, elapsed) => {
      this.update(delta, elapsed);
    });
  }

  /**
   * Bangun jalan balap low-poly, marka garis, pohon, dan tribun
   */
  private buildTrackAndScenery(): void {
    const totalWidth = 5 * this.laneWidth + 2.0;

    // 1. Aspal jalan balap
    const roadGeo = new THREE.BoxGeometry(totalWidth, 0.4, this.trackLength + 20);
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.position.set(0, -0.2, (this.trackLength + 20) / 2 - 10);
    roadMesh.receiveShadow = true;
    this.trackGroup.add(roadMesh);

    // 2. Garis pembatas lajur jalan (putih putus-putus)
    const stripeGeo = new THREE.BoxGeometry(0.15, 0.42, 2.5);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });

    for (let lane = 1; lane < 5; lane++) {
      const laneX = (lane - 2.5) * this.laneWidth;
      for (let z = 0; z < this.trackLength; z += 5.0) {
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.set(laneX, -0.19, z);
        this.trackGroup.add(stripe);
      }
    }

    // 3. Garis Start Catur
    this.buildCheckeredLine(0, totalWidth, 'START');

    // 4. Garis Finish & Lengkungan Gapura (Checkered Arch)
    this.finishLineZ = this.trackLength - 10;
    this.buildCheckeredLine(this.finishLineZ, totalWidth, 'FINIS');
    this.buildFinishArch(this.finishLineZ, totalWidth);

    // 5. Papan penanda jarak (0m, 25m, 50m, 75m, 100m)
    this.buildDistanceMarkers(totalWidth);

    // 6. Pepohonan low-poly & Tribun penonton di sisi lintasan
    this.buildSceneryProps(totalWidth);
  }

  private buildCheckeredLine(zPos: number, totalWidth: number, label: string): void {
    const squareSize = 0.8;
    const cols = Math.floor(totalWidth / squareSize);
    const rows = 2;

    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const blackMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const geo = new THREE.BoxGeometry(squareSize, 0.42, squareSize);

    const startX = -((cols * squareSize) / 2) + squareSize / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const mat = (r + c) % 2 === 0 ? whiteMat : blackMat;
        const square = new THREE.Mesh(geo, mat);
        square.position.set(startX + c * squareSize, -0.18, zPos + (r - 0.5) * squareSize);
        this.trackGroup.add(square);
      }
    }
  }

  private buildFinishArch(zPos: number, totalWidth: number): void {
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, zPos);

    const pillarGeo = new THREE.BoxGeometry(1.2, 7, 1.2);
    const pillarMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });

    const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
    leftPillar.position.set(-totalWidth / 2 - 0.6, 3.5, 0);
    archGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
    rightPillar.position.set(totalWidth / 2 + 0.6, 3.5, 0);
    archGroup.add(rightPillar);

    const topBeamGeo = new THREE.BoxGeometry(totalWidth + 3, 1.4, 1.2);
    const topBeamMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    const topBeam = new THREE.Mesh(topBeamGeo, topBeamMat);
    topBeam.position.set(0, 6.8, 0);
    archGroup.add(topBeam);

    // Spanduk Finish di atas
    const bannerSprite = createTextSprite('GARIS FINIS', {
      textColor: '#ffffff',
      bgColor: '#b45309',
      borderColor: '#fbbf24',
      fontSize: 28,
      width: 320,
      height: 70,
    });
    bannerSprite.sprite.position.set(0, 6.8, 0.8);
    archGroup.add(bannerSprite.sprite);

    // Pita merah finis di bawah
    const ribbonGeo = new THREE.BoxGeometry(totalWidth, 0.3, 0.1);
    const ribbonMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
    this.ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    this.ribbonMesh.position.set(0, 1.2, 0);
    archGroup.add(this.ribbonMesh);

    this.trackGroup.add(archGroup);
  }

  private buildDistanceMarkers(totalWidth: number): void {
    const markerDistances = [0.25, 0.5, 0.75];
    for (const factor of markerDistances) {
      const z = factor * this.finishLineZ;
      const pct = Math.round(factor * 100);

      const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 4);
      const postMat = new THREE.MeshLambertMaterial({ color: 0x64748b });
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(totalWidth / 2 + 1.2, 2, z);
      this.trackGroup.add(post);

      const signSprite = createTextSprite(`${pct}%`, {
        textColor: '#f8fafc',
        bgColor: '#0284c7',
        borderColor: '#38bdf8',
        fontSize: 24,
        width: 140,
        height: 56,
      });
      signSprite.sprite.position.set(totalWidth / 2 + 1.2, 3.8, z);
      this.trackGroup.add(signSprite.sprite);
    }
  }

  private buildSceneryProps(totalWidth: number): void {
    const trunkGeo = new THREE.CylinderGeometry(0.25, 0.35, 1.5);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const leavesGeo = new THREE.ConeGeometry(1.2, 2.5, 5);
    const leavesMat = new THREE.MeshLambertMaterial({ color: 0x15803d });

    // Pohon low-poly di kiri & kanan lintasan
    for (let z = -5; z < this.trackLength + 10; z += 9) {
      // Kiri
      const treeL = new THREE.Group();
      const trunkL = new THREE.Mesh(trunkGeo, trunkMat);
      trunkL.position.y = 0.75;
      const leavesL = new THREE.Mesh(leavesGeo, leavesMat);
      leavesL.position.y = 2.4;
      treeL.add(trunkL);
      treeL.add(leavesL);
      treeL.position.set(-totalWidth / 2 - 3 - Math.random() * 2, 0, z + Math.random() * 3);
      this.trackGroup.add(treeL);

      // Kanan
      const treeR = treeL.clone();
      treeR.position.set(totalWidth / 2 + 3.5 + Math.random() * 2, 0, z + Math.random() * 3);
      this.trackGroup.add(treeR);
    }

    // Tribun penonton sederhana (stepped low-poly bleachers)
    const bleacherGroup = new THREE.Group();
    const bMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    for (let step = 0; step < 3; step++) {
      const stepMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.6 * (step + 1), 35),
        bMat
      );
      stepMesh.position.set(-totalWidth / 2 - 3.5 - step * 2.0, (0.6 * (step + 1)) / 2, 25);
      bleacherGroup.add(stepMesh);
    }
    this.trackGroup.add(bleacherGroup);
  }

  /**
   * Lampu start hitung mundur 3D (Traffic Light)
   */
  private buildTrafficLight(): void {
    this.trafficLightGroup.position.set(0, 0, -2);

    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 5.5),
      new THREE.MeshLambertMaterial({ color: 0x475569 })
    );
    post.position.set(-8, 2.75, 0);
    this.trafficLightGroup.add(post);

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 3.2, 0.8),
      new THREE.MeshLambertMaterial({ color: 0x0f172a })
    );
    box.position.set(-8, 4.2, 0);
    this.trafficLightGroup.add(box);

    const lampColors = [0xef4444, 0xf59e0b, 0x10b981];
    const lampGeo = new THREE.SphereGeometry(0.32, 12, 12);

    for (let i = 0; i < 3; i++) {
      const lampMat = new THREE.MeshLambertMaterial({
        color: lampColors[i],
        emissive: lampColors[i],
        emissiveIntensity: 0.15,
      });
      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.set(-8, 5.0 - i * 0.8, 0.42);
      this.trafficLightGroup.add(lamp);
      this.lightLamps.push(lamp);
    }
  }

  /**
   * Buat model mobil balap prosedural low-poly per tim
   */
  private createCar(team: RaceTeamData, laneIndex: number, totalTeams: number): CarEntity {
    const carGroup = new THREE.Group();
    const colorInt = parseInt(team.color.replace('#', ''), 16) || 0x3b82f6;

    // 1. Badan Mobil Utama (Aerodynamic low-poly chassis)
    const bodyGeo = new THREE.BoxGeometry(1.7, 0.45, 3.0);
    const bodyMat = new THREE.MeshLambertMaterial({ color: colorInt });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 0.45;
    bodyMesh.castShadow = true;
    carGroup.add(bodyMesh);

    // Hidung depan meruncing
    const noseGeo = new THREE.ConeGeometry(0.85, 1.2, 4);
    const noseMat = new THREE.MeshLambertMaterial({ color: colorInt });
    const noseMesh = new THREE.Mesh(noseGeo, noseMat);
    noseMesh.rotation.x = -Math.PI / 2;
    noseMesh.rotation.y = Math.PI / 4;
    noseMesh.position.set(0, 0.4, 2.0);
    carGroup.add(noseMesh);

    // Kokpit kaca gelap
    const cabinGeo = new THREE.BoxGeometry(1.1, 0.4, 1.2);
    const cabinMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const cabinMesh = new THREE.Mesh(cabinGeo, cabinMat);
    cabinMesh.position.set(0, 0.8, -0.2);
    carGroup.add(cabinMesh);

    // Spoiler belakang
    const spoilerWing = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.1, 0.5),
      new THREE.MeshLambertMaterial({ color: colorInt })
    );
    spoilerWing.position.set(0, 1.0, -1.35);
    carGroup.add(spoilerWing);

    const strutGeo = new THREE.BoxGeometry(0.1, 0.35, 0.1);
    const leftStrut = new THREE.Mesh(strutGeo, cabinMat);
    leftStrut.position.set(-0.6, 0.8, -1.35);
    const rightStrut = new THREE.Mesh(strutGeo, cabinMat);
    rightStrut.position.set(0.6, 0.8, -1.35);
    carGroup.add(leftStrut);
    carGroup.add(rightStrut);

    // 2. Empat Roda Silinder
    const wheels: THREE.Mesh[] = [];
    const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.3, 10);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });

    const wheelPositions = [
      { x: -0.95, z: 1.1 },
      { x: 0.95, z: 1.1 },
      { x: -0.95, z: -1.0 },
      { x: 0.95, z: -1.0 },
    ];

    for (const wp of wheelPositions) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wp.x, 0.36, wp.z);
      wheel.castShadow = true;
      carGroup.add(wheel);
      wheels.push(wheel);
    }

    // 3. Efek Garis Angin Kecepatan Turbo
    const turboTrails: THREE.Mesh[] = [];
    const trailGeo = new THREE.CylinderGeometry(0.04, 0.08, 3.5, 6);
    const trailMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
    });

    for (let t = 0; t < 2; t++) {
      const trail = new THREE.Mesh(trailGeo, trailMat);
      trail.rotation.x = Math.PI / 2;
      trail.position.set(t === 0 ? -0.5 : 0.5, 0.5, -3.2);
      trail.visible = false;
      carGroup.add(trail);
      turboTrails.push(trail);
    }

    // 4. Label Sprite Nama Tim di atas Mobil
    const labelSprite = createTextSprite(team.name, {
      textColor: '#ffffff',
      bgColor: team.color,
      borderColor: '#fef08a',
      fontSize: 22,
      badge: `#${team.rank || 1}`,
      width: 260,
      height: 64,
    });
    labelSprite.sprite.position.set(0, 2.2, 0);
    carGroup.add(labelSprite.sprite);

    // Hitung posisi lajur X
    const laneX = (laneIndex - (totalTeams - 1) / 2) * this.laneWidth;
    carGroup.position.set(laneX, 0, 0);
    this.carsGroup.add(carGroup);

    return {
      id: team.id,
      group: carGroup,
      bodyMesh,
      wheels,
      labelSprite,
      targetZ: 0,
      currentZ: 0,
      laneX,
      turboTrails,
      isTurbo: false,
    };
  }

  /**
   * Bangun Panggung Podium 3 Tingkat Juara 1, 2, 3
   */
  private buildPodium(podiumData: Array<{ rank: number; team_id: string; team_name: string }>): void {
    // Hapus podium lama
    while (this.podiumGroup.children.length > 0) {
      const child = this.podiumGroup.children.pop()!;
      this.podiumGroup.remove(child);
    }

    this.podiumGroup.position.set(0, 0, this.finishLineZ + 8);

    const stepConfigs = [
      { rank: 1, x: 0, height: 2.8, width: 4.0, color: 0xf59e0b, label: 'JUARA 1' },
      { rank: 2, x: -4.5, height: 2.0, width: 3.5, color: 0x94a3b8, label: 'JUARA 2' },
      { rank: 3, x: 4.5, height: 1.4, width: 3.5, color: 0xb45309, label: 'JUARA 3' },
    ];

    for (const cfg of stepConfigs) {
      const tierGeo = new THREE.BoxGeometry(cfg.width, cfg.height, 4.0);
      const tierMat = new THREE.MeshLambertMaterial({ color: cfg.color });
      const tierMesh = new THREE.Mesh(tierGeo, tierMat);
      tierMesh.position.set(cfg.x, cfg.height / 2, 0);
      tierMesh.receiveShadow = true;
      this.podiumGroup.add(tierMesh);

      // Label Juara di depan balok
      const badge = createTextSprite(cfg.label, {
        textColor: '#0f172a',
        bgColor: '#ffffff',
        borderColor: '#fef08a',
        fontSize: 26,
        width: 220,
        height: 60,
      });
      badge.sprite.position.set(cfg.x, cfg.height / 2, 2.1);
      this.podiumGroup.add(badge.sprite);
    }

    this.podiumGroup.visible = true;
  }

  /**
   * Sinkronisasi data dari server state (dipanggil dari Vue watcher/polling)
   */
  public syncState(state: RaceStateData): void {
    if (!state || !state.teams) return;

    const totalTeams = state.teams.length;
    const raceLen = state.race_length || 100;

    // 1. Sinkronkan mobil
    state.teams.forEach((team, idx) => {
      let car = this.cars.get(team.id);
      if (!car) {
        car = this.createCar(team, idx, totalTeams);
        this.cars.set(team.id, car);
      }

      // Hitung targetZ 3D proporsional terhadap panjang lintasan
      const progress = Math.min(1.05, (team.distance || 0) / raceLen);
      car.targetZ = progress * this.finishLineZ;
      car.isTurbo = Boolean(team.turbo_active);

      // Update badge ranking & jarak
      car.labelSprite.updateText(
        `${team.name} • ${Math.round(team.distance || 0)}m`,
        `#${team.rank || idx + 1}`
      );

      // Tampilkan garis turbo bila aktif
      car.turboTrails.forEach((trail) => {
        trail.visible = car!.isTurbo;
      });
    });

    // 2. Traffic Light State
    if (state.status === 'lobby') {
      this.setTrafficLightColor('red');
    } else if (state.status === 'in_progress') {
      this.setTrafficLightColor('green');
    }

    // 3. Status Selesai: Tampilkan Podium Juara
    if (state.status === 'finished' || state.status === 'completed') {
      if (!this.podiumGroup.visible) {
        this.buildPodium(state.podium || []);
      }
      this.isRibbonBroken = true;
      if (this.ribbonMesh) {
        this.ribbonMesh.scale.x = 0.05; // pita putus
      }
    }
  }

  private setTrafficLightColor(color: 'red' | 'yellow' | 'green'): void {
    if (this.lightLamps.length < 3) return;
    const [red, yellow, green] = this.lightLamps;

    const setIntensity = (mesh: THREE.Mesh, high: boolean) => {
      (mesh.material as THREE.MeshLambertMaterial).emissiveIntensity = high ? 1.0 : 0.1;
    };

    setIntensity(red, color === 'red');
    setIntensity(yellow, color === 'yellow');
    setIntensity(green, color === 'green');
  }

  /**
   * Loop update per frame: pergerakan halus mobil (lerp), putaran roda, partikel debu,
   * follow-cam, dan confetti podium
   */
  public update(delta: number, elapsed: number): void {
    this.environment.update(delta);
    this.particleSystem.update(delta);

    let maxZ = 0;
    let anyTurbo = false;

    // Update setiap mobil
    this.cars.forEach((car) => {
      // Interpolasi Z halus
      const zDiff = car.targetZ - car.currentZ;
      const speed = car.isTurbo ? 5.0 : 3.2;
      car.currentZ += zDiff * Math.min(1.0, delta * speed);
      car.group.position.z = car.currentZ;

      if (car.currentZ > maxZ) {
        maxZ = car.currentZ;
      }
      if (car.isTurbo) {
        anyTurbo = true;
      }

      // Putar roda saat bergerak
      if (Math.abs(zDiff) > 0.05) {
        const rotSpeed = delta * 14;
        car.wheels.forEach((w) => {
          w.rotation.x += rotSpeed;
        });

        // Partikel asap/debu di belakang roda (hemat)
        if (Math.random() < 0.25) {
          const trailPos = new THREE.Vector3(
            car.laneX + (Math.random() - 0.5) * 0.8,
            0.15,
            car.currentZ - 1.5
          );
          this.particleSystem.emitBurst(trailPos, 0x94a3b8, 2, 1.2, 0.6, 0.4);
        }
      }

      // Partikel turbo menyembur jika aktif
      if (car.isTurbo && Math.random() < 0.4) {
        const flamePos = new THREE.Vector3(car.laneX, 0.5, car.currentZ - 1.8);
        this.particleSystem.emitBurst(flamePos, 0x38bdf8, 3, 2.5, 0.4, 0.5);
      }
    });

    this.currentLeadingZ = maxZ;

    // Follow-Cam Halus
    const targetCamZ = Math.max(0, this.currentLeadingZ) - 12;
    const targetLookZ = Math.max(5, this.currentLeadingZ + 6);

    this.engine.camera.position.z += (targetCamZ - this.engine.camera.position.z) * Math.min(1, delta * 2.8);
    this.engine.camera.position.y += (7.8 - this.engine.camera.position.y) * Math.min(1, delta * 2.5);
    this.engine.camera.position.x += (0 - this.engine.camera.position.x) * Math.min(1, delta * 2.5);
    this.engine.camera.lookAt(0, 1.8, targetLookZ);

    // FOV melebar dinamis saat Turbo
    const targetFov = anyTurbo ? this.turboFov : this.baseFov;
    this.currentFov += (targetFov - this.currentFov) * Math.min(1, delta * 3.0);
    this.engine.camera.fov = this.currentFov;
    this.engine.camera.updateProjectionMatrix();

    // Hujan confetti ringan jika berada di panggung podium (status finished)
    if (this.podiumGroup.visible && Math.random() < 0.35) {
      const colors = [0xf59e0b, 0xef4444, 0x3b82f6, 0x10b981, 0xa855f7];
      const confColor = colors[Math.floor(Math.random() * colors.length)];
      const confPos = new THREE.Vector3(
        (Math.random() - 0.5) * 12,
        6 + Math.random() * 3,
        this.finishLineZ + 8 + (Math.random() - 0.5) * 6
      );
      this.particleSystem.emitBurst(confPos, confColor, 6, 2.5, 1.8, 0.45);
    }
  }

  public destroy(): void {
    this.unregisterRender();
    this.environment.destroy();
    this.particleSystem.destroy();

    this.cars.forEach((car) => {
      car.labelSprite.dispose();
      car.group.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
          else m.material?.dispose();
        }
      });
    });
    this.cars.clear();

    this.trackGroup.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const m = obj as THREE.Mesh;
        m.geometry?.dispose();
        if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
        else m.material?.dispose();
      }
    });

    this.engine.scene.remove(this.trackGroup);
    this.engine.scene.remove(this.carsGroup);
    this.engine.scene.remove(this.podiumGroup);
    this.engine.scene.remove(this.trafficLightGroup);
  }
}
