<template>
  <div class="relative w-full h-[540px] lg:h-[640px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
    <!-- WebGL Canvas Container -->
    <div ref="canvasContainer" class="w-full h-full cursor-pointer"></div>

    <!-- Top Overlay: HUD 3D Controls, Kamera Presets, Mode Ringan -->
    <div class="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
      <div class="flex items-center gap-2 pointer-events-auto">
        <span class="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-indigo-400/40 text-[11px] font-extrabold text-indigo-300 backdrop-blur-md shadow flex items-center gap-1.5">
          <span>🏰</span>
          <span>ARENA 3D PERTAHANAN MARKAS</span>
        </span>
        <span v-if="fps > 0" class="px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-700 text-[10px] font-mono text-emerald-400">
          {{ fps }} FPS
        </span>
      </div>

      <!-- Tombol Sudut Pandang Kamera & Beralih ke 2D -->
      <div class="flex items-center gap-2 pointer-events-auto">
        <div class="flex items-center bg-slate-900/90 border border-slate-700 rounded-xl p-0.5 backdrop-blur-md">
          <button
            @click="setCamera('overview')"
            class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition"
            :class="cameraMode === 'overview' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'"
          >
            Tinjauan
          </button>
          <button
            @click="setCamera('path')"
            class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition"
            :class="cameraMode === 'path' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'"
          >
            Lihat Jalur
          </button>
          <button
            @click="setCamera('base')"
            class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition"
            :class="cameraMode === 'base' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'"
          >
            Lihat Markas
          </button>
        </div>

        <button
          @click="$emit('switch-to-2d')"
          class="px-3 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition shadow backdrop-blur-md cursor-pointer flex items-center gap-1.5 active:scale-95"
          title="Alihkan ke tampilan 2D sederhana untuk laptop hemat baterai / spesifikasi rendah"
        >
          <span>🌱</span>
          <span>Mode Ringan (2D)</span>
        </button>
      </div>
    </div>

    <!-- Peringatan Kualitas Adaptif -->
    <transition enter-active-class="transition duration-300" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div
        v-if="adaptiveNotice"
        class="absolute bottom-4 left-4 right-4 max-w-md mx-auto bg-amber-500/20 border border-amber-400/50 backdrop-blur-md px-4 py-2 rounded-xl text-amber-200 text-xs font-semibold text-center z-20 shadow-lg"
      >
        ⚡ {{ adaptiveNotice }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { isWebGLAvailable } from '../core/WebGLDetector';
import { ThreeEngine } from '../core/ThreeEngine';
import { TowerDefense3DScene, type TDStateData } from '../towerDefense/TowerDefense3DScene';

const props = defineProps<{
  state: TDStateData | null;
  selectedSlotId?: string | null;
  previewTowerType?: 'archer' | 'cannon' | 'magic' | 'catapult' | null;
}>();

const emit = defineEmits<{
  (e: 'switch-to-2d'): void;
  (e: 'webgl-failed'): void;
  (e: 'slot-click', slotId: string): void;
}>();

const canvasContainer = ref<HTMLDivElement | null>(null);
const fps = ref(60);
const cameraMode = ref<'overview' | 'base' | 'path'>('overview');
const adaptiveNotice = ref('');

let engine: ThreeEngine | null = null;
let tdScene: TowerDefense3DScene | null = null;

const setCamera = (mode: 'overview' | 'base' | 'path') => {
  cameraMode.value = mode;
  if (tdScene) {
    tdScene.setCameraPreset(mode);
  }
};

onMounted(() => {
  if (!isWebGLAvailable()) {
    console.warn('[TowerDefense3DArena] WebGL tidak tersedia pada browser. Beralih ke mode 2D.');
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

    tdScene = new TowerDefense3DScene(engine);
    tdScene.onSlotSelected = (slotId) => {
      emit('slot-click', slotId);
    };
  } catch (err) {
    console.error('[TowerDefense3DArena] Gagal inisialisasi WebGL 3D:', err);
    emit('webgl-failed');
    return;
  }

  if (props.state && tdScene) {
    try {
      tdScene.syncState(props.state);
    } catch (err) {
      console.warn('[TowerDefense3DArena] Peringatan sinkronisasi state awal:', err);
    }
  }
});

watch(
  () => props.state,
  (newState) => {
    if (tdScene && newState) {
      try {
        tdScene.syncState(newState);
      } catch (err) {
        console.warn('[TowerDefense3DArena] Peringatan sinkronisasi state:', err);
      }
    }
  },
  { deep: true }
);

watch(
  () => [props.selectedSlotId, props.previewTowerType] as const,
  ([slotId, towerType]) => {
    if (!tdScene) return;
    if (slotId && towerType) {
      tdScene.showGhostTower(slotId, towerType);
    } else {
      tdScene.clearGhostTower();
    }
  }
);

onBeforeUnmount(() => {
  if (tdScene) {
    tdScene.destroy();
    tdScene = null;
  }
  if (engine) {
    engine.destroy();
    engine = null;
  }
});
</script>

