<template>
  <div class="student-td-page min-h-screen bg-slate-950 text-white select-none flex flex-col justify-between font-sans p-4 sm:p-6">
    <!-- Top Header Siswa: Markas & Kas Kelas -->
    <header class="w-full max-w-xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl mb-4 backdrop-blur-md">
      <div class="flex items-center justify-between gap-3 mb-2.5 pb-2.5 border-b border-slate-800">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">🧑‍🎓</span>
          <div>
            <h2 class="text-sm font-black text-white leading-tight">{{ studentUser?.name || 'Siswa' }}</h2>
            <p class="text-[10px] text-slate-400 font-semibold">NIS: {{ (studentUser as any)?.nis || studentUser?.username || '-' }}</p>
          </div>
        </div>

        <!-- Kontribusi Pribadi -->
        <div class="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-black flex items-center gap-1.5 shadow">
          <span>🪙</span>
          <span>+{{ gameState?.my_coins_contributed || 0 }} Koin Anda</span>
        </div>
      </div>

      <!-- Live Base HP & Class Coins -->
      <div class="grid grid-cols-2 gap-2 text-xs">
        <!-- Base HP -->
        <div class="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 flex items-center gap-2.5">
          <span class="text-xl">🏰</span>
          <div class="flex-1">
            <div class="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span>HP Markas</span>
              <span :class="(gameState?.base_hp ?? 20) <= 5 ? 'text-rose-400 font-extrabold animate-pulse' : 'text-emerald-400 font-extrabold'">
                {{ gameState?.base_hp ?? 20 }} / 20
              </span>
            </div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
              <div
                class="h-full transition-all"
                :class="(gameState?.base_hp ?? 20) <= 5 ? 'bg-rose-500' : 'bg-emerald-400'"
                :style="{ width: `${((gameState?.base_hp ?? 20) / 20) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Kas Koin Kelas -->
        <div class="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 flex items-center gap-2.5">
          <span class="text-xl">🪙</span>
          <div>
            <div class="text-[10px] font-bold text-slate-400">Kas Koin Kelas</div>
            <div class="font-black text-sm text-amber-300 leading-tight">{{ gameState?.coins ?? 60 }} Koin</div>
          </div>
        </div>
      </div>

      <!-- Emergency Alert jika Base HP Kritis -->
      <div v-if="(gameState?.base_hp ?? 20) <= 5 && gameState?.status !== 'completed'" class="mt-2.5 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-black flex items-center gap-2 animate-pulse">
        <span>⚠️</span>
        <span>Markas sedang kritis! Jawab benar untuk menambah koin & buff menara!</span>
      </div>
    </header>

    <!-- CONTENT BODY: SOAL & MENJAWAB -->
    <main class="flex-1 w-full max-w-xl mx-auto flex flex-col justify-center">
      <!-- 1. KARTU SOAL AKTIF -->
      <div v-if="gameState?.status === 'in_progress' && currentQuestion && !hasAnswered" class="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5">
        <div class="flex items-center justify-between gap-3">
          <span class="text-xs font-black text-indigo-400 uppercase tracking-wider">
            Gelombang {{ gameState?.wave_current || 1 }} / {{ gameState?.wave_total || 5 }}
          </span>
          <span class="text-xs font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-400/20">
            Benar = +10 Koin Kelas 🪙
          </span>
        </div>

        <h2 class="text-base sm:text-lg font-bold text-white leading-relaxed">
          {{ currentQuestion.question }}
        </h2>

        <!-- 4 Pilihan Jawaban Besar Touch-Friendly -->
        <div class="grid grid-cols-1 gap-3">
          <button
            v-for="(opt, idx) in currentQuestion.options || []"
            :key="idx"
            @click="submitAnswer(idx)"
            :disabled="submitting"
            class="w-full text-left p-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 active:scale-[0.98] border border-slate-700 text-white font-semibold text-sm transition flex items-center gap-3.5 shadow-md cursor-pointer disabled:opacity-50"
          >
            <span class="w-9 h-9 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center font-black text-sm text-indigo-400 shrink-0">
              {{ ['A', 'B', 'C', 'D'][idx] }}
            </span>
            <span class="flex-1 leading-snug">{{ opt }}</span>
          </button>
        </div>
      </div>

      <!-- 2. STATUS FEEDBACK SETELAH MENJAWAB -->
      <div v-else-if="hasAnswered" class="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl flex flex-col items-center gap-4">
        <div
          class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner animate-pulse"
          :class="lastResult?.is_correct ? 'bg-emerald-500/20 border border-emerald-400/40' : 'bg-slate-800 border border-slate-700'"
        >
          {{ lastResult?.is_correct ? '🎯' : '👍' }}
        </div>
        <div>
          <span
            class="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border"
            :class="lastResult?.is_correct ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' : 'bg-amber-500/20 text-amber-300 border-amber-400/40'"
          >
            {{ lastResult?.is_correct ? '+10 Koin untuk Kelas! 🪙' : 'Jawaban Tercatat 👍' }}
          </span>
          <h3 class="text-base font-black text-white mt-3">
            {{ lastResult?.is_correct ? 'Menara Mendapat Buff Kecepatan!' : 'Semangat! Coba soal berikutnya!' }}
          </h3>
          <p class="text-xs text-slate-400 mt-1">
            Lihat aksi pertahanan markas di layar proyektor kelas Anda.
          </p>
        </div>

        <button
          @click="resetAnswerState"
          class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
        >
          Lanjut Soal Berikutnya →
        </button>
      </div>

      <!-- 3. MENUNGGU GELOMBANG DIMULAI -->
      <div v-else-if="gameState?.status === 'lobby' || gameState?.wave_status === 'idle'" class="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl flex flex-col items-center gap-4">
        <div class="text-5xl animate-bounce">🏰</div>
        <h2 class="text-lg font-black text-white">Pertahanan Markas Siap Dimulai</h2>
        <p class="text-xs text-slate-400">
          Guru sedang mempersiapkan posisi menara. Bersiaplah menjawab soal untuk mengumpulkan koin kelas!
        </p>
      </div>

      <!-- 4. SELESAI / HASIL PERMAINAN -->
      <div v-else-if="gameState?.status === 'completed'" class="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl flex flex-col items-center gap-4">
        <div class="text-5xl">{{ gameState.outcome === 'class_victory' ? '🏆' : '💥' }}</div>
        <h2 class="text-xl font-black text-white">
          {{ gameState.outcome === 'class_victory' ? 'Kemenangan Kelas! Markas Bertahan!' : 'Markas Hancur!' }}
        </h2>
        <p class="text-xs text-slate-400">
          {{ gameState.outcome === 'class_victory'
            ? 'Kerja sama yang luar biasa! Kelas berhasil membasmi seluruh gelombang musuh!'
            : 'Pertahanan markas jebol. Terus tingkatkan kekompakan dan ketelitian kelas!' }}
        </p>
        <button
          @click="goToPortal"
          class="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
        >
          Kembali ke Portal Siswa
        </button>
      </div>
    </main>

    <!-- Bottom Footer Info -->
    <footer class="w-full max-w-xl mx-auto text-center text-[10px] text-slate-500 py-2">
      Belajarena Tower Defense Kelas • Terhubung ke Server Sekolah
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sessionId = String(route.params.id || 'active')
const gameState = ref<any>(null)
const submitting = ref(false)
const lastResult = ref<any>(null)
let pollTimer: any = null

const studentUser = computed(() => authStore.user)
const currentQuestion = computed(() => gameState.value?.current_question)
const hasAnswered = computed(() => Boolean(lastResult.value))

async function fetchState() {
  try {
    const res = await api.get(`/ulangan-gamifikasi/sessions/${sessionId}/state`)
    if (res.data?.data) {
      gameState.value = res.data.data
    }
  } catch (err) {
    console.warn('Gagal sinkron state TD:', err)
  }
}

async function submitAnswer(optionIndex: number) {
  if (submitting.value || hasAnswered.value || !currentQuestion.value) return
  submitting.value = true

  const pId = studentUser.value?.id || (studentUser.value as any)?.nis || studentUser.value?.username
  const eventId = `td-ans-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`

  try {
    const res = await api.post(`/ulangan-gamifikasi/sessions/${sessionId}/answer`, {
      participant_id: pId,
      question_id: currentQuestion.value.id,
      option_index: optionIndex,
      client_event_id: eventId
    })
    lastResult.value = {
      is_correct: res.data?.is_correct,
      option_index: optionIndex
    }
    await fetchState()
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Gagal mengirim jawaban')
  } finally {
    submitting.value = false
  }
}

function resetAnswerState() {
  lastResult.value = null
  fetchState()
}

function goToPortal() {
  router.push('/student')
}

onMounted(async () => {
  await fetchState()
  pollTimer = setInterval(fetchState, 700)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<style scoped>
.student-td-page {
  background-image: radial-gradient(circle at 50% 0%, #1e1b4b 0%, #020617 75%);
}
</style>

