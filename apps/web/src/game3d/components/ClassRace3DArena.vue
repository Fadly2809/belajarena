<template>
  <div class="relative w-full h-[520px] lg:h-[620px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
    <!-- WebGL Canvas Container -->
    <div ref="canvasContainer" class="w-full h-full cursor-grab active:cursor-grabbing"></div>

    <!-- Top Overlay: HUD 3D Controls & Info -->
    <div class="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
      <div class="flex items-center gap-2 pointer-events-auto">
        <span class="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-amber-400/40 text-[11px] font-extrabold text-amber-300 backdrop-blur-md shadow flex items-center gap-1.5">
          <span>🏎️</span>
          <span>ARENA BALAPAN 3D</span>
        </span>
        <span v-if="fps > 0" class="px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-700 text-[10px] font-mono text-emerald-400">
          {{ fps }} FPS
        </span>
      </div>

      <div class="flex items-center gap-2 pointer-events-auto">
        <!-- Tombol Beralih ke Mode Ringan (2D) -->
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
import { ClassRace3DScene, type RaceStateData } from '../classRace/ClassRace3DScene';

const props = defineProps<{
  state: RaceStateData | null;
}>();

const emit = defineEmits<{
  (e: 'switch-to-2d'): void;
  (e: 'webgl-failed'): void;
}>();

const canvasContainer = ref<HTMLDivElement | null>(null);
const fps = ref(60);
const adaptiveNotice = ref('');

let engine: ThreeEngine | null = null;
let raceScene: ClassRace3DScene | null = null;

onMounted(() => {
  if (!isWebGLAvailable()) {
    console.warn('[ClassRace3DArena] WebGL tidak tersedia pada browser. Beralih ke mode 2D.');
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

    raceScene = new ClassRace3DScene(engine);

    if (props.state) {
      raceScene.syncState(props.state);
    }
  } catch (err) {
    console.error('[ClassRace3DArena] Gagal menginisialisasi 3D arena:', err);
    emit('webgl-failed');
  }
});

watch(
  () => props.state,
  (newState) => {
    if (raceScene && newState) {
      raceScene.syncState(newState);
    }
  },
  { deep: true }
);

onBeforeUnmount(() => {
  if (raceScene) {
    raceScene.destroy();
    raceScene = null;
  }
  if (engine) {
    engine.destroy();
    engine = null;
  }
});
</script>

