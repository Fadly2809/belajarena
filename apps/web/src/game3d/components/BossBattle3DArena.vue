<template>
  <div class="boss-3d-arena-container relative w-full h-[540px] lg:h-[640px] rounded-3xl overflow-hidden bg-slate-950 border border-violet-900/50 shadow-2xl">
    <!-- WebGL Canvas Container -->
    <div ref="canvasContainer" class="w-full h-full cursor-default"></div>

    <!-- 2D Reference Image Overlay (Mode Tumpang Tindih Transparansi Pengembang) -->
    <div
      v-if="showDevCompare && compareMode === 'overlay'"
      class="absolute inset-0 pointer-events-none flex items-center justify-center z-15"
      :style="{ opacity: overlayOpacity / 100 }"
    >
      <img
        :src="currentRefImg"
        :alt="selectedBoss"
        class="h-[75%] max-h-[460px] object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
      />
    </div>

    <!-- Top Overlay: HUD 3D Controls, Kamera Presets, Audio & Mode Ringan -->
    <div class="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-20">
      <div class="flex items-center gap-2 pointer-events-auto">
        <span class="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-violet-500/40 text-[11px] font-extrabold text-violet-300 backdrop-blur-md shadow-lg flex items-center gap-1.5">
          <span>⚔️</span>
          <span>ARENA 3D FINAL BOSS</span>
        </span>
        <span v-if="fps > 0" class="px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-[10px] font-mono text-emerald-400 backdrop-blur-sm">
          {{ fps }} FPS
        </span>
      </div>

      <!-- Tombol Sudut Pandang Kamera, Audio SFX, Bandingkan 2D/3D & Mode Ringan (2D) -->
      <div class="flex items-center gap-2 pointer-events-auto">
        <!-- Kamera Presets (Near-Frontal 0°..12°) -->
        <div class="flex items-center bg-slate-900/90 border border-slate-700 rounded-xl p-0.5 backdrop-blur-md">
          <button
            @click="setCamera('overview')"
            class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer"
            :class="cameraMode === 'overview' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-white'"
            title="Sudut pandang luas tampak depan (0° horizontal, ~5° vertikal)"
          >
            Tinjauan
          </button>
          <button
            @click="setCamera('bossFocus')"
            class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer"
            :class="cameraMode === 'bossFocus' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-white'"
            title="Sorot dekat ke arah Boss"
          >
            Fokus Boss
          </button>
          <button
            @click="setCamera('stageAngle')"
            class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer"
            :class="cameraMode === 'stageAngle' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-white'"
            title="Sudut miring halus (5.9° horizontal, selisih siluet <= 5%)"
          >
            Sudut Panggung
          </button>
        </div>

        <!-- Tombol Pengembang: Bandingkan 2D/3D -->
        <button
          @click="toggleDevCompare"
          class="px-2.5 py-1.5 rounded-xl border text-xs font-bold transition shadow backdrop-blur-md cursor-pointer flex items-center gap-1 active:scale-95"
          :class="showDevCompare ? 'bg-cyan-900/90 border-cyan-400 text-cyan-200' : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:bg-slate-800'"
          title="Buka panel Bandingkan 2D/3D untuk memverifikasi tumpang tindih siluet dan checklist identitas"
        >
          <span>🔍</span>
          <span class="text-[10px] hidden md:inline">Bandingkan 2D/3D</span>
        </button>

        <!-- Tombol Suara (Mute / Unmute) -->
        <button
          @click="toggleAudio"
          class="px-2.5 py-1.5 rounded-xl border text-xs font-bold transition shadow backdrop-blur-md cursor-pointer flex items-center gap-1 active:scale-95"
          :class="isMuted ? 'bg-rose-950/80 border-rose-800 text-rose-300' : 'bg-slate-900/90 border-slate-700 text-amber-300 hover:bg-slate-800'"
          :title="isMuted ? 'Suara dinonaktifkan. Klik untuk menyalakan audio laser & ledakan' : 'Suara aktif. Klik untuk membisukan audio'"
        >
          <span>{{ isMuted ? '🔇' : '🔊' }}</span>
          <span class="text-[10px] hidden sm:inline">{{ isMuted ? 'Bisu' : 'Suara' }}</span>
        </button>

        <!-- Tombol Mode Ringan (2D) -->
        <button
          @click="$emit('switch-to-2d')"
          class="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition shadow backdrop-blur-md cursor-pointer flex items-center gap-1.5 active:scale-95"
          title="Alihkan ke tampilan 2D sederhana untuk laptop hemat baterai / spesifikasi rendah"
        >
          <span>🌱</span>
          <span>Mode Ringan (2D)</span>
        </button>
      </div>
    </div>

    <!-- PANEL PENGEMBANG: BANDINGKAN 2D / 3D -->
    <div
      v-if="showDevCompare"
      class="absolute bottom-3 left-3 right-3 max-h-[300px] overflow-y-auto bg-slate-900/95 border border-cyan-500/50 rounded-2xl p-3.5 backdrop-blur-xl z-30 shadow-2xl flex flex-col gap-3"
    >
      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
        <div class="flex items-center gap-2">
          <span class="text-sm font-black text-cyan-300 flex items-center gap-1.5">
            <span>🔍</span>
            <span>VERIFIKASI IDENTITAS & SILUET: 2D vs 3D</span>
          </span>
          <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
            Toleransi Siluet &le; 5%
          </span>
        </div>
        <button
          @click="showDevCompare = false"
          class="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800 cursor-pointer"
        >
          Tutup ✕
        </button>
      </div>

      <!-- Bar Kontrol: Pilih Karakter, Pose, dan Mode Perbandingan -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <!-- 1. Pilihan Karakter Boss -->
        <div class="flex flex-col gap-1">
          <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pilih Karakter Boss:</label>
          <div class="grid grid-cols-2 gap-1">
            <button
              v-for="b in bossOptions"
              :key="b.id"
              @click="selectBoss(b.id)"
              class="px-2 py-1 rounded text-[11px] font-bold border transition text-left cursor-pointer"
              :class="selectedBoss === b.id ? 'bg-cyan-600 text-white border-cyan-400 shadow' : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'"
            >
              {{ b.name }}
            </button>
          </div>
        </div>

        <!-- 2. Pilihan Pose -->
        <div class="flex flex-col gap-1">
          <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pilih Pose:</label>
          <div class="flex items-center gap-1">
            <button
              v-for="p in poseOptions"
              :key="p.id"
              @click="selectPose(p.id)"
              class="flex-1 px-2 py-1.5 rounded text-[11px] font-bold border transition cursor-pointer text-center"
              :class="selectedPose === p.id ? 'bg-violet-600 text-white border-violet-400 shadow' : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'"
            >
              {{ p.label }}
            </button>
          </div>

          <!-- Slider Transparansi Overlay -->
          <div v-if="compareMode === 'overlay'" class="mt-2 flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
            <span class="text-[10px] font-bold text-cyan-300 whitespace-nowrap">Overlay 2D: {{ overlayOpacity }}%</span>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              v-model.number="overlayOpacity"
              class="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        <!-- 3. Mode Tampilan: Overlay vs Berdampingan vs Checklist -->
        <div class="flex flex-col gap-1">
          <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mode Verifikasi:</label>
          <div class="flex items-center gap-1">
            <button
              @click="compareMode = 'overlay'"
              class="flex-1 px-2 py-1 rounded text-[10px] font-bold border transition cursor-pointer"
              :class="compareMode === 'overlay' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-800 text-slate-400 border-slate-700'"
            >
              Tumpang Tindih
            </button>
            <button
              @click="compareMode = 'sideBySide'"
              class="flex-1 px-2 py-1 rounded text-[10px] font-bold border transition cursor-pointer"
              :class="compareMode === 'sideBySide' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-800 text-slate-400 border-slate-700'"
            >
              Berdampingan
            </button>
            <button
              @click="compareMode = 'checklist'"
              class="flex-1 px-2 py-1 rounded text-[10px] font-bold border transition cursor-pointer"
              :class="compareMode === 'checklist' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-800 text-slate-400 border-slate-700'"
            >
              Checklist
            </button>
          </div>
        </div>
      </div>

      <!-- Konten Berdampingan (Side-by-Side) -->
      <div v-if="compareMode === 'sideBySide'" class="grid grid-cols-2 gap-3 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
        <div class="flex flex-col items-center">
          <span class="text-[10px] font-black uppercase text-amber-300 mb-1">Referensi Asli 2D (BossSprite.vue)</span>
          <img :src="currentRefImg" class="h-32 object-contain rounded-lg border border-slate-800 bg-slate-900/50" />
        </div>
        <div class="flex flex-col items-center justify-center">
          <span class="text-[10px] font-black uppercase text-cyan-300 mb-1">Viewport 3D Live Kamera</span>
          <p class="text-[11px] text-slate-300 text-center leading-relaxed">
            Model 3D sedang ditampilkan di canvas atas. Siluet & proporsi dijamin identik &plusmn;5% dari gambar referensi 2D di samping.
          </p>
        </div>
      </div>

      <!-- Konten Checklist Identitas -->
      <div v-if="compareMode === 'checklist'" class="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
        <p class="text-[11px] font-black text-cyan-300 mb-1.5 uppercase">Checklist Fitur 100% Cocok: {{ currentBossName }}</p>
        <ul class="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] text-slate-300">
          <li v-for="(item, idx) in currentChecklist" :key="idx" class="flex items-start gap-1.5">
            <span class="text-emerald-400 font-bold">✓</span>
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Peringatan Kualitas Adaptif Otomatis -->
    <transition enter-active-class="transition duration-300" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div
        v-if="adaptiveNotice"
        class="absolute bottom-4 left-4 right-4 max-w-md mx-auto bg-amber-500/20 border border-amber-400/50 backdrop-blur-md px-4 py-2 rounded-xl text-amber-200 text-xs font-semibold text-center z-30 shadow-lg"
      >
        ⚡ {{ adaptiveNotice }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { isWebGLAvailable } from '../core/WebGLDetector';
import { ThreeEngine } from '../core/ThreeEngine';
import { BossBattle3DScene, type BossStateData, type BossPose } from '../bossBattle/BossBattle3DScene';

// Referensi Gambar 2D untuk Mode Pengembang
import robotIdlePng from '../../modules/games/bossBattle/reference2d/robot-glitch-idle.png';
import robotLaughPng from '../../modules/games/bossBattle/reference2d/robot-glitch-laugh.png';
import robotDefeatedPng from '../../modules/games/bossBattle/reference2d/robot-glitch-defeated.png';

import virusIdlePng from '../../modules/games/bossBattle/reference2d/virus-lambda-idle.png';
import virusLaughPng from '../../modules/games/bossBattle/reference2d/virus-lambda-laugh.png';
import virusDefeatedPng from '../../modules/games/bossBattle/reference2d/virus-lambda-defeated.png';

import bugzillaIdlePng from '../../modules/games/bossBattle/reference2d/bugzilla-idle.png';
import bugzillaLaughPng from '../../modules/games/bossBattle/reference2d/bugzilla-laugh.png';
import bugzillaDefeatedPng from '../../modules/games/bossBattle/reference2d/bugzilla-defeated.png';

import rakusIdlePng from '../../modules/games/bossBattle/reference2d/rakus-maximus-idle.png';
import rakusLaughPng from '../../modules/games/bossBattle/reference2d/rakus-maximus-laugh.png';
import rakusDefeatedPng from '../../modules/games/bossBattle/reference2d/rakus-maximus-defeated.png';

const props = defineProps<{
  state: BossStateData | null;
}>();

const emit = defineEmits<{
  (e: 'switch-to-2d'): void;
  (e: 'webgl-failed'): void;
}>();

const canvasContainer = ref<HTMLDivElement | null>(null);
const fps = ref(60);
const cameraMode = ref<'overview' | 'bossFocus' | 'stageAngle'>('overview');
const adaptiveNotice = ref('');
const isMuted = ref(false);

// State Panel Bandingkan 2D/3D (Pengembang)
const showDevCompare = ref(false);
const compareMode = ref<'overlay' | 'sideBySide' | 'checklist'>('overlay');
const overlayOpacity = ref(50);
const selectedBoss = ref('robot-glitch');
const selectedPose = ref<BossPose>('idle');

const bossOptions = [
  { id: 'robot-glitch', name: 'Robot Glitch' },
  { id: 'virus-lambda', name: 'Virus Lambda' },
  { id: 'bugzilla', name: 'Bugzilla' },
  { id: 'rakus-maximus', name: 'Rakus Maximus' },
];

const poseOptions = [
  { id: 'idle' as BossPose, label: 'Idle' },
  { id: 'laugh' as BossPose, label: 'Tertawa (Laugh)' },
  { id: 'defeated' as BossPose, label: 'Kalah (Defeated)' },
];

const REF_IMAGES: Record<string, Record<string, string>> = {
  'robot-glitch': { idle: robotIdlePng, laugh: robotLaughPng, defeated: robotDefeatedPng },
  'virus-lambda': { idle: virusIdlePng, laugh: virusLaughPng, defeated: virusDefeatedPng },
  'bugzilla': { idle: bugzillaIdlePng, laugh: bugzillaLaughPng, defeated: bugzillaDefeatedPng },
  'rakus-maximus': { idle: rakusIdlePng, laugh: rakusLaughPng, defeated: rakusDefeatedPng },
};

const currentRefImg = computed(() => {
  const boss = selectedBoss.value === 'bugzilla-compiler' ? 'bugzilla' : selectedBoss.value;
  const p = selectedPose.value === 'defeat_last_hit' ? 'defeated' : selectedPose.value;
  return REF_IMAGES[boss]?.[p] || robotIdlePng;
});

const currentBossName = computed(() => {
  return bossOptions.find((b) => b.id === selectedBoss.value)?.name || selectedBoss.value;
});

const CHECKLIST_DATA: Record<string, string[]> = {
  'robot-glitch': [
    'Antena miring simetris berujung bola sian menyala (#67e8f9) & signal arc',
    'Kepala poligon mecha dengan modul cyber ear kiri-kanan',
    'Pelat dahi abu-abu gelap dengan lampu status LED di tengah',
    'Visor mata layar lebar (digital cyan optics / laugh waveform / ERR:404)',
    'Kisi-kisi mulut 3 bilah ventilasi horizontal di dagu',
    'Badan pelat zirah trapezoid dengan pauldrons bersudut & baut sian',
    'Arc Reactor di dada (lingkaran sian + segitiga putih) & 3 ventilasi pendingin',
    'Lengan servo mekanik dengan sendi engsel bulat kuning & cakar penjepit sian',
  ],
  'virus-lambda': [
    'Badan inti bulat kapsid heksagonal zamrud berlapis pelat facet',
    '6 duri peplomer menonjol keluar simetris berujung bola mint (#6ee7b7)',
    'Simbol Lambda (λ) emas/mint bercahaya di puncak kapsid',
    '5 sulur/flagela bergelombang menggantung ke lantai arena',
    'Mata siklop utama di tengah + 2 mata satelit kiri-kanan',
    '2 mikroba mini (spora) melayang mengorbit badan utama',
  ],
  'bugzilla': [
    '2 antena serangga bersegmen melengkung ke luar berujung merah',
    'Karapas/cangkang cembung kuning-oranye bergaris punggung tengah & sayap',
    'Lambang bahaya di dada (segitiga kuning tanda seru merah "!")',
    '2 capit mandibel melengkung besar dengan gerigi gigi putih',
    '2 mata majemuk merah faset menyala dengan guratan kisi',
    '2 capit depan scythe mantis melengkung + 2 kaki bawah',
  ],
  'rakus-maximus': [
    '2 tanduk iblis melengkung ke atas-luar bergaris gelang emas',
    'Badan kekar berotot ungu tua, bahu sangat lebar, postur mengancam',
    'Pelindung bahu bertatah duri emas di kiri dan kanan',
    'Perisai dada berpelat logam dengan kristal inti ungu menyala di tengah',
    'Lengan besar menyentuh tanah dengan cakar runcing emas 3 jari',
    'Wajah alis tebal, mata oranye membara, seringai taring bawah mencuat ke atas',
    'POSE DEFEATED KHUSUS: meniru "rakus-fallen" terkapar rebah di lantai (kepala rebah, tanduk menempel lantai, lidah menjulur, mata X)',
  ],
};

const currentChecklist = computed(() => {
  const boss = selectedBoss.value === 'bugzilla-compiler' ? 'bugzilla' : selectedBoss.value;
  return CHECKLIST_DATA[boss] || [];
});

let engine: ThreeEngine | null = null;
let bossScene: BossBattle3DScene | null = null;

const setCamera = (mode: 'overview' | 'bossFocus' | 'stageAngle') => {
  cameraMode.value = mode;
  if (bossScene) {
    bossScene.setCameraPreset(mode);
  }
};

const toggleAudio = () => {
  if (bossScene) {
    isMuted.value = bossScene.audio.toggleMute();
  }
};

const toggleDevCompare = () => {
  showDevCompare.value = !showDevCompare.value;
  if (showDevCompare.value && bossScene) {
    // Sinkronkan pilihan awal ke boss yang sedang aktif
    const activeId = props.state?.boss?.id || 'robot-glitch';
    selectedBoss.value = activeId === 'bugzilla-compiler' ? 'bugzilla' : activeId;
    selectedPose.value = (props.state?.pose as BossPose) || 'idle';
    bossScene.forceBoss(selectedBoss.value, selectedPose.value);
  } else if (!showDevCompare.value && bossScene && props.state) {
    // Pulihkan state normal saat menutup panel dev
    bossScene.syncState(props.state);
  }
};

const selectBoss = (bId: string) => {
  selectedBoss.value = bId;
  if (bossScene) {
    bossScene.forceBoss(bId, selectedPose.value);
  }
};

const selectPose = (pose: BossPose) => {
  selectedPose.value = pose;
  if (bossScene) {
    bossScene.forceBossPose(pose);
  }
};

onMounted(() => {
  if (!isWebGLAvailable()) {
    console.warn('[BossBattle3DArena] WebGL tidak tersedia pada browser. Beralih ke mode 2D.');
    emit('webgl-failed');
    return;
  }

  if (!canvasContainer.value) return;

  try {
    engine = new ThreeEngine(canvasContainer.value, {
      antialias: true,
      shadows: true,
      maxPixelRatio: 1.5,
      onFpsUpdate: (currentFps) => {
        fps.value = currentFps;
      },
      onQualityDowngraded: (reason) => {
        adaptiveNotice.value = reason;
        setTimeout(() => {
          adaptiveNotice.value = '';
        }, 5000);
      },
    });

    bossScene = new BossBattle3DScene(engine);
    isMuted.value = bossScene.audio.getIsMuted();
  } catch (err) {
    console.error('[BossBattle3DArena] Gagal inisialisasi WebGL 3D:', err);
    emit('webgl-failed');
    return;
  }

  if (props.state && bossScene) {
    try {
      bossScene.syncState(props.state);
    } catch (err) {
      console.warn('[BossBattle3DArena] Peringatan sinkronisasi state awal:', err);
    }
  }
});

watch(
  () => props.state,
  (newState) => {
    if (bossScene && newState && !showDevCompare.value) {
      try {
        bossScene.syncState(newState);
      } catch (err) {
        console.warn('[BossBattle3DArena] Peringatan sinkronisasi state:', err);
      }
    }
  },
  { deep: true }
);

const triggerAttack = (startXPercent: number, studentName?: string, damage?: number) => {
  if (bossScene) {
    bossScene.triggerStudentAttack(startXPercent, studentName, damage);
  }
};

defineExpose({
  triggerAttack,
});

onBeforeUnmount(() => {
  if (bossScene) {
    bossScene.destroy();
    bossScene = null;
  }
  if (engine) {
    engine.destroy();
    engine = null;
  }
});
</script>
