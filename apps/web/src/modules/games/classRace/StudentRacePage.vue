<template>
  <div class="student-race-page min-h-screen bg-slate-950 text-white select-none flex flex-col justify-between font-sans p-4 sm:p-6">
    <!-- Top Header Siswa: Profil & Tim -->
    <header class="w-full max-w-xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl mb-4 backdrop-blur-md">
      <div class="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-800">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">🧑‍🎓</span>
          <div>
            <h2 class="text-sm font-black text-white leading-tight">{{ studentUser?.name || 'Siswa' }}</h2>
            <p class="text-[10px] text-slate-400 font-semibold">NIS: {{ (studentUser as any)?.nis || studentUser?.username || '-' }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div
            v-if="myTeam"
            class="px-3 py-1 rounded-xl border flex items-center gap-1.5 shadow"
            :style="{ backgroundColor: `${myTeam.color}25`, borderColor: myTeam.color }"
          >
            <span class="text-base">{{ myTeam.icon || '🏎️' }}</span>
            <span class="text-xs font-black" :style="{ color: myTeam.color }">{{ myTeam.name }}</span>
          </div>
          <span v-else class="text-xs text-slate-400">Memuat Tim...</span>
        </div>
      </div>

      <!-- Live Team Standing Banner -->
      <div v-if="myTeam" class="flex items-center justify-between text-xs bg-slate-950/80 rounded-xl px-3 py-2 border border-slate-800">
        <div class="flex items-center gap-2">
          <span class="w-5 h-5 rounded-md bg-amber-400 text-slate-950 font-black text-[11px] flex items-center justify-center">
            #{{ myTeam.rank || 1 }}
          </span>
          <span class="font-bold text-slate-300">Posisi Tim</span>
        </div>
        <div class="flex items-center gap-3 font-extrabold">
          <span class="text-amber-400">{{ Math.round(myTeam.distance || 0) }} meter</span>
          <span v-if="myTeam.turbo_active" class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] animate-pulse">
            ⚡ TURBO AKTIF
          </span>
        </div>
      </div>
    </header>

    <!-- CONTENT BODY -->
    <main class="flex-1 w-full max-w-xl mx-auto flex flex-col justify-center">
      <!-- 1. LOBBY STATE (Sebelum Balapan Dimulai) -->
      <div v-if="sessionState?.status === 'lobby'" class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4">
        <div class="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-4xl shadow-inner animate-bounce">
          🏎️
        </div>
        <div>
          <span class="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider">
            Menunggu Guru Memulai
          </span>
          <h1 class="text-xl font-black text-white mt-2">
            {{ sessionState?.title || 'Balapan Kelas' }}
          </h1>
          <p class="text-xs text-slate-400 mt-1">
            Bersiaplah di tim Anda! Guru akan segera mengibarkan bendera start balapan.
          </p>
        </div>

        <div v-if="myTeam" class="w-full p-4 rounded-2xl border text-left" :style="{ backgroundColor: `${myTeam.color}15`, borderColor: `${myTeam.color}40` }">
          <div class="flex items-center gap-2 mb-2 font-black text-sm" :style="{ color: myTeam.color }">
            <span>{{ myTeam.icon || '🏎️' }}</span>
            <span>Anda bergabung di {{ myTeam.name }}</span>
          </div>
          <p class="text-[11px] text-slate-300 leading-relaxed">
            Kerja sama dan kecepatan Anda bersama anggota tim lainnya menentukan laju langkah tim di lintasan proyektor!
          </p>
        </div>
      </div>

      <!-- 2. RACING STATE (Balapan Berjalan) -->
      <div v-else-if="sessionState?.status === 'in_progress'" class="flex flex-col gap-4">
        <!-- Ronde & Timer Bar -->
        <div class="flex items-center justify-between gap-3 px-1">
          <span class="text-xs font-black text-amber-400 uppercase tracking-wider">
            Ronde {{ sessionState.current_round }} / {{ sessionState.total_rounds || 10 }}
          </span>
          <div class="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-xs tabular-nums shadow">
            <span>⏱️</span>
            <span>{{ timeRemaining }}s</span>
          </div>
        </div>

        <!-- Kartu Soal -->
        <div v-if="currentQuestion && !hasAnswered" class="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5">
          <h2 class="text-base sm:text-lg font-bold text-white leading-relaxed">
            {{ currentQuestion.question }}
          </h2>

          <!-- 4 Pilihan Jawaban Besar -->
          <div class="grid grid-cols-1 gap-3">
            <button
              v-for="(opt, idx) in currentQuestion.options || []"
              :key="idx"
              @click="submitAnswer(idx)"
              :disabled="submitting"
              class="w-full text-left p-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 active:scale-[0.98] border border-slate-700 text-white font-semibold text-sm transition flex items-center gap-3.5 shadow-md cursor-pointer disabled:opacity-50"
            >
              <span class="w-9 h-9 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center font-black text-sm text-amber-400 shrink-0">
                {{ ['A', 'B', 'C', 'D'][idx] }}
              </span>
              <span class="flex-1 leading-snug">{{ opt }}</span>
            </button>
          </div>
        </div>

        <!-- Status Menunggu Setelah Siswa Menjawab -->
        <div v-else-if="hasAnswered" class="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl flex flex-col items-center gap-4">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner animate-pulse" :class="lastAnswerResult?.is_correct ? 'bg-emerald-500/20 border border-emerald-400/40' : 'bg-slate-800 border border-slate-700'">
            {{ lastAnswerResult?.is_correct ? '🎯' : '⏳' }}
          </div>
          <div>
            <span
              class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border"
              :class="lastAnswerResult?.is_correct ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' : 'bg-amber-500/20 text-amber-300 border-amber-400/40'"
            >
              {{ lastAnswerResult?.is_correct ? 'Jawaban Benar! 🎉' : 'Jawaban Tercatat 👍' }}
            </span>
            <h3 class="text-base font-black text-white mt-3">
              Menunggu Ronde Selesai...
            </h3>
            <p class="text-xs text-slate-400 mt-1">
              Hasil langkah tim sedang dihitung di layar arena proyektor kelas.
            </p>
          </div>
        </div>
      </div>

      <!-- 3. COMPLETED / FINISH STATE -->
      <div v-else-if="sessionState?.status === 'completed'" class="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl flex flex-col items-center gap-5">
        <div class="text-5xl animate-bounce">🏆</div>
        <div>
          <span class="px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black uppercase tracking-widest">
            Balapan Selesai!
          </span>
          <h2 class="text-2xl font-black text-white mt-3">
            Hebat, Balapan Tuntas!
          </h2>
          <p class="text-xs text-slate-400 mt-1">
            Lihat perolehan podium juara di layar proyektor kelas Anda.
          </p>
        </div>

        <div v-if="myTeam" class="w-full p-4 rounded-2xl border text-center" :style="{ backgroundColor: `${myTeam.color}20`, borderColor: myTeam.color }">
          <div class="text-2xl mb-1">{{ myTeam.icon || '🏎️' }}</div>
          <div class="font-black text-sm text-white">{{ myTeam.name }}</div>
          <div class="text-amber-400 font-extrabold text-xs mt-0.5">Peringkat Akhir: #{{ myTeam.rank || 1 }} ({{ Math.round(myTeam.distance || 0) }}m)</div>
        </div>

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
      Belajarena Balapan Kelas • Terhubung ke Server Sekolah
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
const sessionState = ref<any>(null)
const submitting = ref(false)
const lastAnswerResult = ref<any>(null)
let pollTimer: any = null

const studentUser = computed(() => authStore.user)
const myTeam = computed(() => sessionState.value?.my_team)
const currentQuestion = computed(() => sessionState.value?.current_question)
const hasAnswered = computed(() => sessionState.value?.has_answered || Boolean(lastAnswerResult.value))

const timeRemaining = computed(() => {
  if (!sessionState.value?.server_round_ends_at) return 0
  const rem = Math.ceil((sessionState.value.server_round_ends_at - Date.now()) / 1000)
  return Math.max(0, rem)
})

async function fetchState() {
  try {
    const res = await api.get(`/ulangan-gamifikasi/sessions/${sessionId}/state`)
    if (res.data?.data) {
      const prevRound = sessionState.value?.current_round
      sessionState.value = res.data.data
      // Jika ronde telah berganti di server, reset status jawaban lokal
      if (prevRound && sessionState.value?.current_round !== prevRound) {
        lastAnswerResult.value = null
      }
    }
  } catch (err) {
    console.warn('Gagal sinkron state:', err)
  }
}

async function submitAnswer(optionIndex: number) {
  if (submitting.value || hasAnswered.value || !currentQuestion.value) return
  submitting.value = true

  const pId = studentUser.value?.id || (studentUser.value as any)?.nis || studentUser.value?.username
  const eventId = `ans-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`

  try {
    const res = await api.post(`/ulangan-gamifikasi/sessions/${sessionId}/answer`, {
      participant_id: pId,
      question_id: currentQuestion.value.id,
      option_index: optionIndex,
      client_event_id: eventId
    })
    lastAnswerResult.value = {
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
.student-race-page {
  background-image: radial-gradient(circle at 50% 0%, #172554 0%, #020617 75%);
}
</style>
