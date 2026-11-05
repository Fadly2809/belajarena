<template>
  <div class="td-arena min-h-screen bg-slate-950 text-white select-none flex flex-col justify-between font-sans overflow-x-hidden">
    <!-- Top Header Proyektor -->
    <header class="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30 shadow-lg">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-xl shadow-inner">
          🏰
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] uppercase tracking-[0.25em] text-indigo-400 font-extrabold px-2 py-0.5 rounded bg-indigo-400/10 border border-indigo-400/20">
              Pertahanan Markas • Layar Proyektor
            </span>
            <span v-if="gameState?.pin" class="text-[11px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
              PIN Gabung: <span class="text-amber-400 font-mono tracking-wider">{{ gameState.pin }}</span>
            </span>
          </div>
          <h1 class="text-base sm:text-lg font-black tracking-wide text-white">
            {{ gameState?.title || 'Tower Defense Kelas' }} — <span class="text-indigo-300">{{ gameState?.classroom_name || 'Kelas' }}</span>
          </h1>
        </div>
      </div>

      <!-- Stats Bar: Base HP, Class Coins, Wave, Streak -->
      <div class="flex items-center gap-4">
        <!-- Kas Koin Kelas -->
        <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 shadow">
          <span class="text-lg">🪙</span>
          <div>
            <div class="text-[9px] uppercase tracking-wider font-extrabold text-amber-400/80">Koin Kelas</div>
            <div class="font-black text-sm text-amber-300 leading-none">{{ gameState?.coins ?? 60 }}</div>
          </div>
        </div>

        <!-- HP Markas Utama -->
        <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border" :class="baseHpClass">
          <span class="text-lg">🏰</span>
          <div>
            <div class="text-[9px] uppercase tracking-wider font-extrabold">HP Markas</div>
            <div class="font-black text-sm leading-none">{{ gameState?.base_hp ?? 20 }} / {{ gameState?.max_base_hp ?? 20 }}</div>
          </div>
        </div>

        <!-- Gelombang Wave -->
        <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200">
          <span class="text-lg">🌊</span>
          <div>
            <div class="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Gelombang</div>
            <div class="font-black text-sm text-indigo-400 leading-none">
              {{ gameState?.wave_current || 0 }} / {{ gameState?.wave_total || 5 }}
            </div>
          </div>
        </div>

        <!-- Class Streak / Serangan Gabungan -->
        <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
          <span class="text-lg">🔥</span>
          <div>
            <div class="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Combo Kelas</div>
            <div class="font-black text-sm text-rose-400 leading-none">
              {{ gameState?.class_streak || 0 }} / 10
            </div>
          </div>
        </div>

        <!-- Toggle Mode 3D / 2D -->
        <button
          @click="viewMode = viewMode === '3d' ? '2d' : '3d'"
          class="px-2.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
          :class="viewMode === '3d' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40 hover:bg-indigo-500/30' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'"
          :title="viewMode === '3d' ? 'Mode 3D aktif. Klik untuk beralih ke Mode Ringan (2D)' : 'Mode 2D aktif. Klik untuk beralih ke Mode 3D'"
        >
          <span>{{ viewMode === '3d' ? '🏰 3D' : '🌱 2D' }}</span>
          <span class="hidden sm:inline">{{ viewMode === '3d' ? 'Mode 3D' : 'Mode Ringan' }}</span>
        </button>

        <!-- Tombol Aksi Guru -->
        <div class="flex items-center gap-2">
          <button
            v-if="canStartNextWave"
            @click="startNextWave"
            :disabled="startingWave"
            class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>⚔️</span>
            <span>{{ startingWave ? 'Mempersiapkan...' : (gameState?.wave_current === 0 ? 'Mulai Gelombang 1' : `Mulai Gelombang ${gameState.wave_current + 1}`) }}</span>
          </button>

          <button
            v-if="gameState?.status === 'in_progress'"
            @click="finishGame"
            class="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer"
          >
            Selesaikan & Simpan
          </button>

          <button
            @click="goBack"
            class="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-1"
            title="Buka dashboard hasil ulangan"
          >
            <span>📊</span>
            <span>Hasil Ulangan</span>
          </button>
        </div>
      </div>
    </header>

    <!-- MAIN BODY: PETA ARENA TD JALUR S -->
    <main class="flex-1 p-4 lg:p-6 flex flex-col gap-5 max-w-7xl mx-auto w-full relative">
      <!-- OVERLAY GAME SELESAI -->
      <div v-if="gameState?.status === 'completed'" class="p-6 rounded-2xl bg-slate-900/90 border-2 border-amber-400 text-center shadow-2xl space-y-3 animate-fade-in my-2">
        <span class="text-4xl">🏆</span>
        <h2 class="text-2xl font-black text-white">SESI PERMAINAN SELESAI</h2>
        <p class="text-xs text-slate-300">Pertempuran telah berakhir. Seluruh nilai peserta telah otomatis tersimpan ke rekap rapor.</p>
        <div class="flex items-center justify-center gap-3 pt-2">
          <button
            @click="goBack"
            class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <span>📊</span>
            <span>Buka Dashboard Hasil Ulangan</span>
          </button>
        </div>
      </div>
      <!-- Efek Layar Serangan Gabungan (Combo Strike Effect) -->
      <transition enter-active-class="transition duration-500 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-300 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showComboAlert" class="absolute inset-0 z-40 bg-indigo-950/60 backdrop-blur-xs flex items-center justify-center pointer-events-none">
          <div class="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 p-1 rounded-3xl shadow-2xl animate-bounce">
            <div class="bg-slate-950 px-8 py-5 rounded-[22px] text-center">
              <span class="text-4xl">⚡🌩️🔥</span>
              <h2 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-indigo-200 mt-1">
                SERANGAN GABUNGAN KELAS!
              </h2>
              <p class="text-xs text-slate-300 mt-1">10 Jawaban Benar Beruntun! Seluruh musuh di arena terkena sambaran petir massal!</p>
            </div>
          </div>
        </div>
      </transition>

      <!-- PETA VISUAL JALUR S (CANVAS / SVG ARENA) -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col gap-4">
        <!-- Status Bar Arena -->
        <div class="flex items-center justify-between text-xs font-bold text-slate-400 pb-2 border-b border-slate-800">
          <div class="flex items-center gap-3">
            <span class="flex items-center gap-1.5 text-white">
              <span>🗺️</span> Peta Arena Pertahanan (Jalur S-Curve)
            </span>
            <span v-if="gameState?.is_buff_active" class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] animate-pulse">
              ⚡ Buff Kecepatan Menara +{{ (gameState.buff_stacks || 1) * 25 }}% Aktif!
            </span>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-[11px] text-slate-400 hidden sm:inline">
              Klik slot kosong di sepanjang jalur untuk membangun menara dengan Koin Kelas
            </span>
            <!-- Tombol Switch Mode 3D / 2D di Status Bar -->
            <button
              @click="viewMode = viewMode === '3d' ? '2d' : '3d'"
              class="px-3 py-1.5 rounded-xl font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition active:scale-95 border"
              :class="viewMode === '3d'
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-white/50 shadow-indigo-500/40 hover:brightness-110 animate-pulse'"
            >
              <span>{{ viewMode === '3d' ? '🌱 Mode Ringan (2D)' : '🚀 Aktifkan Mode 3D' }}</span>
            </button>
          </div>
        </div>

        <!-- ARENA 3D PERTAHANAN MARKAS (Default) -->
        <div v-if="viewMode === '3d'" class="w-full">
          <TowerDefense3DArena
            :state="gameState"
            :selectedSlotId="selectedEmptySlot ? String(selectedEmptySlot.id) : null"
            :previewTowerType="hoveredTowerType"
            @slot-click="handle3DSlotClick"
            @switch-to-2d="viewMode = '2d'"
            @webgl-failed="viewMode = '2d'"
          />
        </div>

        <!-- Container Arena Jalur S 2D (Fallback / Mode Ringan) -->
        <div v-else class="relative w-full aspect-[16/9] max-h-[580px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
          <!-- Tombol Mengambang di Pojok Kanan 2D Arena untuk kembali ke 3D -->
          <div class="absolute top-3 right-3 z-30">
            <button
              @click="viewMode = '3d'"
              class="px-3.5 py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 border border-indigo-400 text-white font-black text-xs shadow-xl backdrop-blur-md transition flex items-center gap-1.5 cursor-pointer active:scale-95 animate-pulse"
              title="Beralih kembali ke tampilan 3D spektakuler"
            >
              <span>🏰</span>
              <span>Beralih ke Mode 3D</span>
            </button>
          </div>
          <!-- Background SVG Track Jalur S -->
          <svg class="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <!-- Bayangan Jalur -->
            <path
              d="M 5,20 L 35,20 Q 45,20 45,35 Q 45,50 35,50 L 20,65 Q 15,80 40,80 L 65,80 Q 75,80 75,65 Q 75,40 70,40 L 85,30 Q 95,30 95,50"
              fill="none"
              stroke="#0f172a"
              stroke-width="12"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <!-- Jalur Aspal / Tanah Utama -->
            <path
              d="M 5,20 L 35,20 Q 45,20 45,35 Q 45,50 35,50 L 20,65 Q 15,80 40,80 L 65,80 Q 75,80 75,65 Q 75,40 70,40 L 85,30 Q 95,30 95,50"
              fill="none"
              stroke="#1e293b"
              stroke-width="8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <!-- Garis Putus-Putus Tengah Jalur -->
            <path
              d="M 5,20 L 35,20 Q 45,20 45,35 Q 45,50 35,50 L 20,65 Q 15,80 40,80 L 65,80 Q 75,80 75,65 Q 75,40 70,40 L 85,30 Q 95,30 95,50"
              fill="none"
              stroke="#475569"
              stroke-width="0.8"
              stroke-dasharray="2,2"
              stroke-linecap="round"
            />
          </svg>

          <!-- SPAWN PORTAL (TITIK AWAL MUSUH) DI (5%, 20%) -->
          <div class="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style="left: 5%; top: 20%;">
            <div class="w-12 h-12 rounded-2xl bg-rose-950/80 border-2 border-rose-500/80 flex items-center justify-center text-2xl shadow-lg shadow-rose-500/30 animate-pulse">
              🚪
            </div>
            <span class="text-[9px] font-extrabold text-rose-300 mt-1 uppercase tracking-wider bg-slate-950/80 px-1.5 py-0.5 rounded border border-rose-800/50">
              Spawn
            </span>
          </div>

          <!-- MARKAS KELAS (BASE UTAMA) DI (95%, 50%) -->
          <div class="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style="left: 95%; top: 50%;">
            <div class="w-14 h-14 rounded-2xl bg-indigo-950/90 border-2 border-indigo-400 flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/40">
              🏰
            </div>
            <div class="mt-1 flex flex-col items-center bg-slate-950/90 px-2 py-0.5 rounded border border-indigo-500/50">
              <span class="text-[10px] font-black text-indigo-300">Markas</span>
              <div class="w-14 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                <div class="h-full bg-emerald-400 transition-all" :style="{ width: `${((gameState?.base_hp ?? 20) / (gameState?.max_base_hp ?? 20)) * 100}%` }"></div>
              </div>
            </div>
          </div>

          <!-- 8 SLOT PEMBANGUNAN MENARA DI SEPANJANG JALUR -->
          <div
            v-for="slot in gameState?.slots || defaultSlots"
            :key="slot.id"
            class="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
            :style="{ left: `${slot.x}%`, top: `${slot.y}%` }"
            @click="handleSlotClick(slot)"
          >
            <!-- Slot Terisi Menara -->
            <div v-if="getTowerAtSlot(slot.id)" class="group relative flex flex-col items-center">
              <div
                class="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-xl border-2 transition transform group-hover:scale-110"
                :style="{ backgroundColor: `${getTowerAtSlot(slot.id)?.color}25`, borderColor: getTowerAtSlot(slot.id)?.color }"
              >
                {{ getTowerAtSlot(slot.id)?.icon || '🏹' }}
              </div>
              <span class="mt-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-slate-900 border border-white/20 text-white shadow">
                Lv.{{ getTowerAtSlot(slot.id)?.level || 1 }}
              </span>
            </div>

            <!-- Slot Kosong -->
            <div
              v-else
              class="w-9 h-9 rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/60 hover:bg-indigo-600/20 hover:border-indigo-400 transition flex items-center justify-center text-xs font-bold text-slate-500 hover:text-white shadow"
              title="Klik untuk bangun menara"
            >
              +
            </div>
          </div>

          <!-- MUSUH AKTIF YANG SEDANG BERJALAN -->
          <div
            v-for="enemy in gameState?.enemies || []"
            :key="enemy.id"
            class="absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-300 ease-linear flex flex-col items-center"
            :style="{ left: `${enemy.x}%`, top: `${enemy.y}%` }"
          >
            <!-- Bar HP Musuh -->
            <div class="w-8 h-1 bg-slate-800 rounded-full overflow-hidden mb-0.5 border border-slate-700">
              <div
                class="h-full bg-rose-500 transition-all"
                :style="{ width: `${Math.max(0, (enemy.hp / enemy.max_hp) * 100)}%` }"
              ></div>
            </div>
            <!-- Ikon Musuh -->
            <div class="text-2xl filter drop-shadow animate-bounce">
              {{ enemy.icon || '👾' }}
            </div>
          </div>
        </div>

        <!-- Kartu Soal Ulangan di Bawah Arena Proyektor -->
        <div v-if="currentQuestion" class="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex-1">
            <span class="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-400/20">
              Soal Sedang Aktif di HP Siswa (Bank Soal: {{ gameState?.subject || 'Informatika' }})
            </span>
            <p class="text-sm font-bold text-white mt-1 leading-snug">
              {{ currentQuestion.question }}
            </p>
          </div>
          <div class="shrink-0 text-right">
            <span class="text-xs font-semibold text-slate-400">Tiap jawaban benar dari siswa:</span>
            <div class="text-xs font-extrabold text-amber-300">+10 Koin Kas Kelas 🪙</div>
          </div>
        </div>
      </div>
    </main>

    <!-- MODAL MEMBANGUN MENARA BARU -->
    <div v-if="selectedEmptySlot" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
        <div class="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-800">
          <div>
            <h3 class="text-base font-black text-white">Bangun Menara di Slot #{{ selectedEmptySlot.id }}</h3>
            <p class="text-xs text-slate-400">Kas Koin Tersedia: <strong class="text-amber-400">{{ gameState?.coins ?? 60 }} Koin</strong></p>
          </div>
          <button @click="selectedEmptySlot = null; hoveredTowerType = null" class="text-slate-400 hover:text-white text-lg">✕</button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
          <button
            v-for="tower in towerOptions"
            :key="tower.type"
            @click="buildTower(tower.type); hoveredTowerType = null"
            @mouseenter="hoveredTowerType = tower.type"
            @mouseleave="hoveredTowerType = null"
            :disabled="(gameState?.coins ?? 0) < tower.cost"
            class="p-3.5 rounded-2xl border text-left flex items-start gap-3 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-95"
            :style="{ backgroundColor: `${tower.color}15`, borderColor: `${tower.color}50` }"
          >
            <span class="text-3xl shrink-0">{{ tower.icon }}</span>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h4 class="font-black text-sm text-white">{{ tower.name }}</h4>
                <span class="text-xs font-black text-amber-300">{{ tower.cost }} 🪙</span>
              </div>
              <p class="text-[11px] text-slate-300 mt-1 leading-snug">{{ tower.desc }}</p>
              <div class="mt-2 text-[10px] text-slate-400 font-semibold">
                Dmg: {{ tower.damage }} • CD: {{ tower.cooldown }}s
              </div>
            </div>
          </button>
        </div>

        <button
          @click="selectedEmptySlot = null; hoveredTowerType = null"
          class="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
        >
          Batal
        </button>
      </div>
    </div>

    <!-- MODAL UPGRADE / JUAL MENARA -->
    <div v-if="selectedTowerSlot" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
        <div class="text-4xl mb-2">{{ selectedTowerSlot.icon || '🏹' }}</div>
        <h3 class="text-base font-black text-white">{{ selectedTowerSlot.name }} (Level {{ selectedTowerSlot.level || 1 }})</h3>
        <p class="text-xs text-slate-400 mt-0.5">Slot #{{ selectedTowerSlot.slot_id }}</p>

        <div class="flex flex-col gap-2.5 my-5">
          <button
            v-if="(selectedTowerSlot.level || 1) < 3"
            @click="upgradeTower(selectedTowerSlot.slot_id)"
            class="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs shadow hover:brightness-110 active:scale-95 transition"
          >
            Upgrade ke Level {{ (selectedTowerSlot.level || 1) + 1 }}
          </button>
          <div v-else class="text-xs text-amber-400 font-bold py-1">
            Level Maksimal (Level 3)
          </div>

          <button
            @click="sellTower(selectedTowerSlot.slot_id)"
            class="w-full py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold text-xs transition"
          >
            Jual Menara (Kembalikan 70% Koin)
          </button>
        </div>

        <button
          @click="selectedTowerSlot = null"
          class="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import { isWebGLAvailable } from '@/game3d/core/WebGLDetector'
import TowerDefense3DArena from '@/game3d/components/TowerDefense3DArena.vue'

const route = useRoute()
const router = useRouter()
const sessionId = String(route.params.id || 'active')

const viewMode = ref<'3d' | '2d'>(isWebGLAvailable() ? '3d' : '2d')
const hoveredTowerType = ref<any>(null)
const gameState = ref<any>(null)
const startingWave = ref(false)
const selectedEmptySlot = ref<any>(null)
const selectedTowerSlot = ref<any>(null)
const showComboAlert = ref(false)
let pollTimer: any = null
let lastComboTimestamp = 0

const handle3DSlotClick = (slotId: string) => {
  const allSlots = gameState.value?.slots || defaultSlots
  const slot = allSlots.find((s: any) => String(s.id) === String(slotId) || s.id === slotId)
  if (slot) {
    handleSlotClick(slot)
  }
}

const defaultSlots = [
  { id: 1, x: 20, y: 32 },
  { id: 2, x: 40, y: 10 },
  { id: 3, x: 32, y: 38 },
  { id: 4, x: 22, y: 78 },
  { id: 5, x: 50, y: 68 },
  { id: 6, x: 55, y: 90 },
  { id: 7, x: 80, y: 52 },
  { id: 8, x: 78, y: 20 }
]

const towerOptions = [
  { type: 'archer', name: 'Archer (Panah)', cost: 30, damage: 2, cooldown: 1.0, icon: '🏹', color: '#10b981', desc: 'Serangan cepat jarak menengah ke musuh terdepan.' },
  { type: 'cannon', name: 'Cannon (Meriam)', cost: 50, damage: 5, cooldown: 2.5, icon: '💣', color: '#ef4444', desc: 'Serangan ledakan area (splash) mengenai gerombolan.' },
  { type: 'magic', name: 'Magic (Penyihir)', cost: 60, damage: 3, cooldown: 1.5, icon: '🔮', color: '#8b5cf6', desc: 'Efek sihir memperlambat laju musuh 40% selama 2s.' },
  { type: 'catapult', name: 'Catapult (Ketapel)', cost: 80, damage: 10, cooldown: 3.5, icon: '🪨', color: '#f59e0b', desc: 'Damage tinggi penghancur musuh ber-HP besar / Boss.' }
]

const currentQuestion = computed(() => gameState.value?.current_question)

const canStartNextWave = computed(() => {
  if (!gameState.value) return false
  if (gameState.value.status === 'completed') return false
  const status = gameState.value.wave_status
  return status === 'idle' || status === 'completed' || (gameState.value.enemies || []).length === 0
})

const baseHpClass = computed(() => {
  const hp = gameState.value?.base_hp ?? 20
  if (hp <= 5) return 'bg-rose-500/20 border-rose-400 text-rose-300 animate-pulse'
  if (hp <= 10) return 'bg-amber-500/20 border-amber-400 text-amber-300'
  return 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
})

function getTowerAtSlot(slotId: number) {
  return (gameState.value?.towers || []).find((t: any) => t.slot_id === slotId)
}

function handleSlotClick(slot: any) {
  const existing = getTowerAtSlot(slot.id)
  if (existing) {
    selectedTowerSlot.value = existing
  } else {
    selectedEmptySlot.value = slot
  }
}

async function fetchState() {
  try {
    const res = await api.get(`/ulangan-gamifikasi/sessions/${sessionId}/state`)
    if (res.data?.data) {
      gameState.value = res.data.data

      // Check combo strike alert
      if (gameState.value.last_combo_strike_at && gameState.value.last_combo_strike_at !== lastComboTimestamp) {
        lastComboTimestamp = gameState.value.last_combo_strike_at
        showComboAlert.value = true
        setTimeout(() => { showComboAlert.value = false }, 2500)
      }
    }
  } catch (err) {
    console.warn('Gagal memuat state TD:', err)
  }
}

async function startNextWave() {
  if (startingWave.value) return
  startingWave.value = true
  try {
    const res = await api.post(`/ulangan-gamifikasi/sessions/${sessionId}/wave/start`, {})
    if (res.data?.data) {
      gameState.value = res.data.data
    }
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Gagal memulai gelombang')
  } finally {
    startingWave.value = false
  }
}

async function buildTower(type: string) {
  if (!selectedEmptySlot.value) return
  try {
    const res = await api.post(`/ulangan-gamifikasi/sessions/${sessionId}/towers`, {
      action: 'build',
      slot_id: selectedEmptySlot.value.id,
      type
    })
    if (res.data?.data) {
      gameState.value = res.data.data
    }
    selectedEmptySlot.value = null
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Gagal membangun menara')
  }
}

async function upgradeTower(slotId: number) {
  try {
    const res = await api.post(`/ulangan-gamifikasi/sessions/${sessionId}/towers`, {
      action: 'upgrade',
      slot_id: slotId
    })
    if (res.data?.data) {
      gameState.value = res.data.data
    }
    selectedTowerSlot.value = null
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Gagal mengupgrade menara')
  }
}

async function sellTower(slotId: number) {
  if (!confirm('Yakin ingin menjual menara ini?')) return
  try {
    const res = await api.post(`/ulangan-gamifikasi/sessions/${sessionId}/towers`, {
      action: 'sell',
      slot_id: slotId
    })
    if (res.data?.data) {
      gameState.value = res.data.data
    }
    selectedTowerSlot.value = null
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Gagal menjual menara')
  }
}

async function finishGame() {
  if (!confirm('Yakin ingin menyelesaikan sesi permainan sekarang? Nilai siswa akan difinalisasi ke rekap rapor.')) return
  try {
    const res = await api.post(`/ulangan-gamifikasi/sessions/${sessionId}/finish`, {})
    if (res.data?.data) {
      gameState.value = res.data.data
    }
    if (sessionId && sessionId !== 'active') {
      router.push({ path: '/reports/exam-events', query: { session_id: sessionId } })
    } else {
      router.push('/reports/exam-events')
    }
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Gagal menyelesaikan sesi')
  }
}

function goBack() {
  if (gameState.value?.status === 'completed') {
    if (sessionId && sessionId !== 'active') {
      router.push({ path: '/reports/exam-events', query: { session_id: sessionId } })
    } else {
      router.push('/reports/exam-events')
    }
  } else {
    if (confirm('Sesi permainan masih berlangsung. Ingin keluar dan buka hasil ulangan?')) {
      if (sessionId && sessionId !== 'active') {
        router.push({ path: '/reports/exam-events', query: { session_id: sessionId } })
      } else {
        router.push('/reports/exam-events')
      }
    }
  }
}

onMounted(async () => {
  await fetchState()
  pollTimer = setInterval(fetchState, 500)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<style scoped>
.td-arena {
  background-image: radial-gradient(circle at 50% 0%, #1e1b4b 0%, #020617 75%);
}
</style>

