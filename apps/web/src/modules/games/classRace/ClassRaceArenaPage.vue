<template>
  <div class="class-race-arena min-h-screen bg-slate-950 text-white select-none flex flex-col justify-between font-sans overflow-x-hidden">
    <!-- Top Header Bar -->
    <header class="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30 shadow-lg">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl shadow-inner">
          🏎️
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] uppercase tracking-[0.25em] text-amber-400 font-extrabold px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
              Balapan Kelas • Proyektor Arena
            </span>
            <span v-if="sessionState?.pin" class="text-[11px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
              PIN Gabung: <span class="text-amber-400 font-mono tracking-wider">{{ sessionState.pin }}</span>
            </span>
          </div>
          <h1 class="text-base sm:text-lg font-black tracking-wide text-white">
            {{ sessionState?.title || 'Balapan Kelas (Class Race)' }} — <span class="text-amber-300">{{ sessionState?.classroom_name || 'Kelas' }}</span>
          </h1>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- Status Badge -->
        <span class="px-3 py-1 rounded-xl text-xs font-bold border" :class="statusBadgeClass">
          {{ statusLabel }}
        </span>

        <!-- Timer / Ronde -->
        <div v-if="sessionState?.status === 'in_progress'" class="flex items-center gap-2">
          <div class="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200">
            Ronde <span class="text-amber-400 font-extrabold text-sm">{{ sessionState.current_round }}</span> / {{ sessionState.total_rounds || 10 }}
          </div>
          <div class="flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-black tabular-nums text-sm shadow-md animate-pulse">
            <span>⏱️</span>
            <span>{{ timeRemaining }}s</span>
          </div>
        </div>

        <!-- Toggle Mode 3D / 2D -->
        <button
          @click="viewMode = viewMode === '3d' ? '2d' : '3d'"
          class="px-2.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
          :class="viewMode === '3d' ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-500/30' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'"
          :title="viewMode === '3d' ? 'Mode 3D aktif. Klik untuk beralih ke Mode Ringan (2D)' : 'Mode 2D aktif. Klik untuk beralih ke Mode 3D'"
        >
          <span>{{ viewMode === '3d' ? '🏎️ 3D' : '🌱 2D' }}</span>
          <span class="hidden sm:inline">{{ viewMode === '3d' ? 'Mode 3D' : 'Mode Ringan' }}</span>
        </button>

        <!-- Tombol Aksi Guru -->
        <div class="flex items-center gap-2">
          <button
            v-if="sessionState?.status === 'lobby'"
            @click="startRace"
            :disabled="starting"
            class="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <span>🚀</span>
            <span>{{ starting ? 'Memulai...' : 'MULAI BALAPAN' }}</span>
          </button>

          <button
            v-if="sessionState?.status === 'in_progress'"
            @click="advanceRound"
            class="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md cursor-pointer active:scale-95 flex items-center gap-1"
            title="Lewati sisa waktu ronde ini"
          >
            <span>⏩</span>
            <span>Ronde Berikutnya</span>
          </button>

          <button
            v-if="sessionState?.status === 'in_progress'"
            @click="finishRace"
            class="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-md cursor-pointer active:scale-95 flex items-center gap-1"
            title="Akhiri balapan sekarang"
          >
            <span>🏁</span>
            <span>Finis Sekarang</span>
          </button>

          <button
            @click="goBack"
            class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-1"
            title="Buka dashboard hasil ulangan balapan kelas"
          >
            <span>📊</span>
            <span>Hasil Ulangan</span>
          </button>
        </div>
      </div>
    </header>

    <!-- MAIN BODY -->
    <main class="flex-1 p-4 lg:p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <!-- 1. LOBBY VIEW (Sebelum Mulai: Guru Mengatur Tim & Kehadiran) -->
      <section v-if="sessionState?.status === 'lobby'" class="flex-1 flex flex-col gap-6">
        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div class="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
            <div>
              <h2 class="text-lg font-black text-white flex items-center gap-2">
                <span>🏁</span> Susunan Tim Balapan Kelas
              </h2>
              <p class="text-xs text-slate-400 mt-0.5">
                Siswa dibagi seimbang secara otomatis. Guru dapat menggeser siswa antar-tim atau menandai siswa absen sebelum balapan dimulai.
              </p>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs font-semibold text-slate-300 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
                Total Siswa Aktif: <strong class="text-emerald-400">{{ activeParticipantsCount }}</strong> / {{ totalParticipantsCount }}
              </span>
              <button
                @click="startRace"
                class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 hover:brightness-110 active:scale-95 transition flex items-center gap-2"
              >
                <span>🏎️</span>
                <span>MULAI BALAPAN KELAS SEKARANG</span>
              </button>
            </div>
          </div>

          <!-- Grid Tim -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              v-for="team in sessionState?.teams || []"
              :key="team.id"
              class="rounded-xl border p-4 flex flex-col gap-3 transition"
              :style="{ backgroundColor: `${team.color}15`, borderColor: `${team.color}50` }"
            >
              <div class="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">{{ team.icon || '🏎️' }}</span>
                  <div>
                    <h3 class="font-black text-sm text-white">{{ team.name }}</h3>
                    <p class="text-[10px] text-slate-400 font-semibold">{{ getTeamMembers(team).length }} Anggota</p>
                  </div>
                </div>
                <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: team.color }"></div>
              </div>

              <!-- List Siswa -->
              <div class="flex-1 flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1">
                <div
                  v-for="m in getTeamMembers(team)"
                  :key="m.id"
                  class="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-white/5 text-xs"
                  :class="m.is_absent ? 'opacity-40 line-through bg-rose-950/30 border-rose-800/40' : ''"
                >
                  <span class="truncate font-medium text-slate-200">{{ m.name }}</span>
                  <div class="flex items-center gap-1 shrink-0">
                    <button
                      @click="toggleAbsent(m.id)"
                      class="px-1.5 py-0.5 rounded text-[10px] font-bold transition"
                      :class="m.is_absent ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-400 hover:text-white'"
                      :title="m.is_absent ? 'Tandai Hadir' : 'Tandai Absen / Tidak Hadir'"
                    >
                      {{ m.is_absent ? 'Absen' : 'Hadir' }}
                    </button>
                    <!-- Tombol Pindah Tim -->
                    <button
                      @click="openMoveMemberModal(m, team)"
                      class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                      title="Pindahkan siswa ini ke tim lain"
                    >
                      ⇄
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. RACING ARENA VIEW (Saat Balapan Berjalan) -->
      <section v-else-if="sessionState?.status === 'in_progress'" class="flex-1 flex flex-col gap-5">
        <!-- Soal yang Sedang Berlangsung di Proyektor -->
        <div v-if="currentQuestion" class="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div class="flex items-center justify-between gap-3 mb-3">
            <span class="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-500/30">
              Pertanyaan Ronde {{ sessionState?.current_round }}
            </span>
            <div class="flex items-center gap-3">
              <span class="text-xs font-bold text-slate-300">
                Jawaban Masuk: <strong class="text-amber-400">{{ answeredCount }}</strong> / {{ activeParticipantsCount }}
              </span>
              <div class="w-36 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  class="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                  :style="{ width: `${(answeredCount / Math.max(1, activeParticipantsCount)) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>

          <h2 class="text-lg lg:text-xl font-bold text-white leading-relaxed mb-4">
            {{ currentQuestion.question }}
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              v-for="(opt, idx) in currentQuestion.options || []"
              :key="idx"
              class="px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-sm font-semibold flex items-center gap-3"
            >
              <span class="w-7 h-7 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center font-black text-xs text-amber-400">
                {{ ['A', 'B', 'C', 'D'][idx] }}
              </span>
              <span>{{ opt }}</span>
            </div>
          </div>
        </div>

        <!-- LINTASAN BALAP 3D (Default) -->
        <div v-if="viewMode === '3d'" class="flex flex-col gap-4">
          <ClassRace3DArena
            :state="sessionState"
            @switch-to-2d="viewMode = '2d'"
            @webgl-failed="viewMode = '2d'"
          />

          <!-- Papan Klasemen Tim (HTML) di Bawah Canvas 3D -->
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            <div
              v-for="team in sessionState?.teams || []"
              :key="team.id"
              class="bg-slate-900/90 border rounded-xl p-3 flex flex-col justify-between shadow"
              :style="{ borderColor: `${team.color}60` }"
            >
              <div class="flex items-center justify-between gap-1 mb-1">
                <span class="w-6 h-6 rounded-md flex items-center justify-center font-black text-xs shadow" :class="getRankBadgeClass(team.rank)">
                  #{{ team.rank || 1 }}
                </span>
                <span v-if="team.turbo_active" class="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-black text-[9px] animate-pulse">
                  TURBO x2
                </span>
              </div>
              <div class="font-extrabold text-sm text-white truncate">{{ team.name }}</div>
              <div class="text-xs font-black text-amber-400 mt-1">
                {{ Math.round(team.distance || 0) }}m <span v-if="team.last_round_step > 0" class="text-emerald-400 font-bold">+{{ team.last_round_step }}m</span>
              </div>
            </div>
          </div>
        </div>

        <!-- LINTASAN BALAP HORIZONTAL 2D (Fallback / Mode Ringan) -->
        <div v-else class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
          <div class="flex items-center justify-between gap-3 pb-2 border-b border-slate-800 text-xs font-bold text-slate-400">
            <span class="flex items-center gap-1.5 text-white">
              <span>🏎️</span> Jalur Balap Sirkuit (Target Finis: {{ raceLength }}m)
            </span>
            <div class="flex items-center gap-3 text-[11px]">
              <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span> 0m</span>
              <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-slate-600"></span> 250m</span>
              <span class="flex items-center gap-1 font-extrabold text-amber-400">🏁 FINIS ({{ raceLength }}m)</span>
              <!-- Tombol Kembali ke Mode 3D -->
              <button
                @click="viewMode = '3d'"
                class="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-400 hover:brightness-110 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1 cursor-pointer active:scale-95 animate-pulse"
              >
                <span>🏎️</span>
                <span>Aktifkan Mode 3D</span>
              </button>
            </div>
          </div>

          <div class="flex flex-col gap-3.5">
            <div
              v-for="team in sessionState?.teams || []"
              :key="team.id"
              class="relative bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex items-center gap-4 overflow-hidden group shadow-inner"
            >
              <!-- Info Tim di Kiri -->
              <div class="w-48 shrink-0 flex items-center gap-3 z-10 bg-slate-950/90 pr-2">
                <span class="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shadow" :class="getRankBadgeClass(team.rank)">
                  #{{ team.rank || 1 }}
                </span>
                <div class="truncate">
                  <div class="flex items-center gap-1.5">
                    <span class="text-lg">{{ team.icon || '🏎️' }}</span>
                    <h4 class="font-black text-sm text-white truncate">{{ team.name }}</h4>
                  </div>
                  <div class="flex items-center gap-2 text-[10px] font-semibold text-slate-400">
                    <span class="text-amber-400 font-extrabold">{{ Math.round(team.distance || 0) }}m</span>
                    <span v-if="team.last_round_step > 0" class="text-emerald-400 font-bold">+{{ team.last_round_step }}m</span>
                    <span v-if="team.turbo_active" class="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-black text-[9px] animate-pulse">
                      ⚡ TURBO x2
                    </span>
                  </div>
                </div>
              </div>

              <!-- Lintasan Jalur (Track Lane) -->
              <div class="flex-1 h-14 bg-slate-900 rounded-lg relative overflow-hidden flex items-center px-2 border border-slate-800/80">
                <!-- Garis-garis aspal / Grid -->
                <div class="absolute inset-0 flex justify-between items-center opacity-10 pointer-events-none px-4">
                  <div v-for="n in 10" :key="n" class="w-0.5 h-full bg-white"></div>
                </div>

                <!-- Checkered Finish Line di Kanan -->
                <div class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-amber-500/20 border-l-2 border-dashed border-amber-400/80 flex items-center justify-center">
                  <span class="text-sm">🏁</span>
                </div>

                <!-- Kendaraan Bergerak Berdasarkan Jarak -->
                <div
                  class="absolute transition-all duration-1000 ease-out flex items-center gap-1"
                  :style="{ left: `calc(${Math.min(92, ((team.distance || 0) / raceLength) * 90)}% + 8px)` }"
                >
                  <!-- Efek Api Turbo jika Turbo Aktif -->
                  <span v-if="team.turbo_active" class="text-lg animate-bounce mr-[-8px]">🔥</span>
                  
                  <!-- Ikon Kendaraan -->
                  <div
                    class="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-lg border-2 transform group-hover:scale-110 transition"
                    :style="{ backgroundColor: `${team.color}30`, borderColor: team.color }"
                  >
                    {{ team.icon || '🏎️' }}
                  </div>

                  <!-- Pop-up langkah ronde terakhir -->
                  <span
                    v-if="team.last_round_step > 0"
                    class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-slate-950 shadow animate-bounce"
                  >
                    +{{ team.last_round_step }}m
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. FINISH / PODIUM VIEW (Balapan Selesai) -->
      <section v-else-if="sessionState?.status === 'completed'" class="flex-1 flex flex-col items-center justify-center gap-6 py-6">
        <div class="text-center">
          <span class="px-4 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black uppercase tracking-widest">
            🏁 Balapan Selesai!
          </span>
          <h2 class="text-3xl lg:text-4xl font-black text-white mt-2">
            Pemenang Balapan Kelas
          </h2>
          <p class="text-sm text-slate-400 mt-1">Selamat kepada seluruh tim atas kerja sama dan kecepatannya!</p>
        </div>

        <!-- Panggung 3D Podium & Confetti jika Mode 3D -->
        <div v-if="viewMode === '3d'" class="w-full max-w-4xl">
          <ClassRace3DArena
            :state="sessionState"
            @switch-to-2d="viewMode = '2d'"
            @webgl-failed="viewMode = '2d'"
          />
        </div>

        <!-- OLYMPIC PODIUM 1, 2, 3 -->
        <div class="flex items-end justify-center gap-4 w-full max-w-2xl my-4">
          <!-- Juara 2 (Perak) -->
          <div v-if="podiumTeams[1]" class="flex-1 flex flex-col items-center">
            <div class="text-3xl mb-1">{{ podiumTeams[1].icon || '🏎️' }}</div>
            <div class="font-extrabold text-white text-sm text-center mb-1 truncate w-full">{{ podiumTeams[1].name }}</div>
            <span class="text-xs text-slate-400 font-bold mb-2">{{ Math.round(podiumTeams[1].distance || 0) }}m</span>
            <div class="w-full h-32 rounded-t-2xl bg-gradient-to-t from-slate-800 to-slate-700 border-t-4 border-slate-300 flex flex-col items-center justify-center shadow-xl">
              <span class="text-3xl font-black text-slate-300">2</span>
              <span class="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Perak 🥈</span>
            </div>
          </div>

          <!-- Juara 1 (Emas) -->
          <div v-if="podiumTeams[0]" class="flex-1 flex flex-col items-center">
            <div class="text-4xl mb-1 animate-bounce">👑</div>
            <div class="text-4xl mb-1">{{ podiumTeams[0].icon || '🏎️' }}</div>
            <div class="font-black text-amber-300 text-base text-center mb-1 truncate w-full">{{ podiumTeams[0].name }}</div>
            <span class="text-xs text-amber-400 font-extrabold mb-2">{{ Math.round(podiumTeams[0].distance || 0) }}m</span>
            <div class="w-full h-44 rounded-t-2xl bg-gradient-to-t from-amber-600 to-amber-500 border-t-4 border-amber-300 flex flex-col items-center justify-center shadow-2xl shadow-amber-500/20">
              <span class="text-4xl font-black text-slate-950">1</span>
              <span class="text-xs font-black text-slate-950 uppercase tracking-wider">Juara 1 🥇</span>
            </div>
          </div>

          <!-- Juara 3 (Perunggu) -->
          <div v-if="podiumTeams[2]" class="flex-1 flex flex-col items-center">
            <div class="text-3xl mb-1">{{ podiumTeams[2].icon || '🏎️' }}</div>
            <div class="font-extrabold text-white text-sm text-center mb-1 truncate w-full">{{ podiumTeams[2].name }}</div>
            <span class="text-xs text-slate-400 font-bold mb-2">{{ Math.round(podiumTeams[2].distance || 0) }}m</span>
            <div class="w-full h-24 rounded-t-2xl bg-gradient-to-t from-amber-900 to-amber-800 border-t-4 border-amber-700 flex flex-col items-center justify-center shadow-xl">
              <span class="text-2xl font-black text-amber-200">3</span>
              <span class="text-[10px] font-extrabold text-amber-200 uppercase tracking-wider">Perunggu 🥉</span>
            </div>
          </div>
        </div>

        <!-- Tombol Hasil Ulangan -->
        <div class="flex items-center gap-3 mt-4">
          <button
            @click="goBack"
            class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <span>📊</span>
            <span>Buka Dashboard Hasil Ulangan</span>
          </button>
        </div>
      </section>
    </main>

    <!-- Modal Pindah Anggota Tim -->
    <div v-if="movingMember" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-2xl">
        <h3 class="text-base font-black text-white mb-2">
          Pindahkan {{ movingMember.name }}
        </h3>
        <p class="text-xs text-slate-400 mb-4">Pilih tim tujuan untuk siswa ini:</p>

        <div class="grid grid-cols-1 gap-2 mb-5">
          <button
            v-for="targetTeam in availableTargetTeams"
            :key="targetTeam.id"
            @click="confirmMoveMember(targetTeam.id)"
            class="px-4 py-3 rounded-xl border flex items-center justify-between transition cursor-pointer hover:brightness-125"
            :style="{ backgroundColor: `${targetTeam.color}20`, borderColor: targetTeam.color }"
          >
            <div class="flex items-center gap-2">
              <span class="text-xl">{{ targetTeam.icon || '🏎️' }}</span>
              <span class="font-bold text-sm text-white">{{ targetTeam.name }}</span>
            </div>
            <span class="text-xs text-slate-400 font-semibold">{{ targetTeam.member_ids?.length || 0 }} Anggota</span>
          </button>
        </div>

        <button
          @click="movingMember = null"
          class="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
        >
          Batal
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
import ClassRace3DArena from '@/game3d/components/ClassRace3DArena.vue'

const route = useRoute()
const router = useRouter()
const sessionId = String(route.params.id || 'active')

const viewMode = ref<'3d' | '2d'>(isWebGLAvailable() ? '3d' : '2d')
const sessionState = ref<any>(null)
const starting = ref(false)
const movingMember = ref<any>(null)
const sourceTeam = ref<any>(null)
let pollTimer: any = null

const raceLength = computed(() => Number(sessionState.value?.race_length) || 500)
const currentQuestion = computed(() => sessionState.value?.current_question)

const totalParticipantsCount = computed(() => (sessionState.value?.participants || []).length)
const activeParticipantsCount = computed(() => {
  return (sessionState.value?.participants || []).filter((p: any) => !p.is_absent).length
})

const answeredCount = computed(() => {
  const currentRound = sessionState.value?.current_round || 1
  const roundAnswers = sessionState.value?.round_answers || {}
  return Object.keys(roundAnswers).length
})

const timeRemaining = computed(() => {
  if (!sessionState.value?.server_round_ends_at) return 0
  const rem = Math.ceil((sessionState.value.server_round_ends_at - Date.now()) / 1000)
  return Math.max(0, rem)
})

const statusLabel = computed(() => {
  if (sessionState.value?.status === 'lobby') return 'Lobby (Menunggu Mulai)'
  if (sessionState.value?.status === 'in_progress') return 'Sedang Balapan'
  if (sessionState.value?.status === 'completed') return 'Selesai'
  return 'Siap'
})

const statusBadgeClass = computed(() => {
  if (sessionState.value?.status === 'lobby') return 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  if (sessionState.value?.status === 'in_progress') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
  return 'bg-blue-500/20 text-blue-300 border-blue-500/40'
})

const podiumTeams = computed(() => {
  if (sessionState.value?.podium && sessionState.value.podium.length > 0) {
    return sessionState.value.podium
  }
  const teams = [...(sessionState.value?.teams || [])].sort((a: any, b: any) => (b.distance || 0) - (a.distance || 0))
  return teams.slice(0, 3)
})

const availableTargetTeams = computed(() => {
  if (!sourceTeam.value) return []
  return (sessionState.value?.teams || []).filter((t: any) => t.id !== sourceTeam.value.id)
})

function getTeamMembers(team: any) {
  const memberIds = team.member_ids || []
  return (sessionState.value?.participants || []).filter((p: any) => memberIds.includes(p.id))
}

function getRankBadgeClass(rank: number) {
  if (rank === 1) return 'bg-amber-400 text-slate-950 font-black'
  if (rank === 2) return 'bg-slate-300 text-slate-950 font-black'
  if (rank === 3) return 'bg-amber-700 text-amber-100 font-black'
  return 'bg-slate-800 text-slate-400 font-bold'
}

async function fetchState() {
  try {
    const res = await api.get(`/ulangan-gamifikasi/sessions/${sessionId}/state`)
    if (res.data?.data) {
      sessionState.value = res.data.data
    }
  } catch (err) {
    console.warn('Gagal memuat state balapan:', err)
  }
}

async function startRace() {
  if (starting.value) return
  starting.value = true
  try {
    const res = await api.post(`/ulangan-gamifikasi/sessions/${sessionId}/start`, {})
    if (res.data?.data) {
      sessionState.value = res.data.data
    }
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Gagal memulai balapan')
  } finally {
    starting.value = false
  }
}

async function advanceRound() {
  try {
    const res = await api.post(`/ulangan-gamifikasi/sessions/${sessionId}/round/next`, {})
    if (res.data?.data) {
      sessionState.value = res.data.data
    }
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Gagal memajukan ronde')
  }
}

async function finishRace() {
  if (!confirm('Yakin ingin menyelesaikan balapan sekarang?')) return
  try {
    const res = await api.post(`/ulangan-gamifikasi/sessions/${sessionId}/finish`, {})
    if (res.data?.data) {
      sessionState.value = res.data.data
    }
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Gagal menyelesaikan balapan')
  }
}

async function toggleAbsent(participantId: string) {
  try {
    await api.post(`/ulangan-gamifikasi/sessions/${sessionId}/participants/${participantId}/toggle-absent`, {})
    await fetchState()
  } catch (err) {
    console.warn('Gagal mengubah absensi:', err)
  }
}

function openMoveMemberModal(member: any, team: any) {
  movingMember.value = member
  sourceTeam.value = team
}

async function confirmMoveMember(targetTeamId: string) {
  if (!movingMember.value) return
  try {
    await api.patch(`/ulangan-gamifikasi/sessions/${sessionId}/teams`, {
      action: 'move_member',
      member_id: movingMember.value.id,
      to_team_id: targetTeamId
    })
    movingMember.value = null
    await fetchState()
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Gagal memindahkan anggota')
  }
}

function goBack() {
  if (sessionId && sessionId !== 'active') {
    router.push({ path: '/reports/exam-events', query: { session_id: sessionId } })
  } else {
    router.push('/reports/exam-events')
  }
}

onMounted(async () => {
  await fetchState()
  pollTimer = setInterval(fetchState, 600)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<style scoped>
.class-race-arena {
  background-image: radial-gradient(circle at 50% 0%, #1e1b4b 0%, #030712 70%);
}
</style>

