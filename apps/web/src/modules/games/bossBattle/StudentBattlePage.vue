<template>
  <div class="min-h-screen bg-[#07051a] text-white flex flex-col items-center justify-center p-2 sm:p-4 select-none">
    <div class="w-full max-w-4xl flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6">
      <!-- 1. PHONE BEZEL / MOBILE MOCKUP (Panel 9: Left / Center) -->
      <div class="w-full max-w-md phone-shell rounded-[2.5rem] border-4 border-slate-700/80 shadow-2xl overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-950 to-black flex flex-col min-h-[720px] relative">
        <!-- Phone Top Status Bar -->
        <div class="flex items-center justify-between px-5 pt-4 text-xs">
          <span class="font-extrabold tracking-widest uppercase text-white/80 text-[11px] flex items-center gap-1">
            <span>🎮</span> {{ getQuizTypeLabel(state?.quizType || 'ulangan_harian') }}
          </span>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black tabular-nums text-xs shadow-xs">
              <span>⏱️</span> {{ clock }}
            </div>
            <button
              class="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-rose-600/80 text-white/90 hover:text-white text-[11px] font-bold border border-white/15 transition flex items-center gap-1 cursor-pointer"
              title="Keluar dari arena battle"
              @click="exitBattleConfirm"
            >
              <span>🚪</span> Keluar
            </button>
          </div>
        </div>

        <!-- Boss HP Bar Header -->
        <div class="px-5 mt-2">
          <div class="flex items-center justify-between text-[11px] font-bold text-amber-200">
            <span class="tracking-widest uppercase">BOSS: {{ state?.boss?.name || 'Rakus Maximus' }}</span>
            <span class="text-white/70 text-[10px]">{{ state?.bossHpPercentDisplay ?? 100 }}%</span>
          </div>
          <div class="h-3 rounded-full bg-black/60 overflow-hidden border border-white/20 mt-1 relative">
            <div
              class="h-full bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 transition-all duration-500 ease-out"
              :style="{ width: `${state?.bossHpPercentDisplay || 0}%` }"
            ></div>
          </div>
          <p class="text-center text-[10px] mt-1 text-white/70 tabular-nums font-semibold">
            {{ (state?.bossHpDisplay || 0).toLocaleString('id-ID') }} / {{ (state?.initialBossHp || 0).toLocaleString('id-ID') }} HP
          </p>
        </div>

        <!-- Mini Arena Stage with Boss and Visual Laser -->
        <div class="relative flex justify-center py-2 min-h-[170px] overflow-hidden my-1">
          <div v-if="laserActive" :class="lastAnswerCorrect === false ? 'mobile-laser-conduit-miss' : 'mobile-laser-conduit'">
            <div class="laser-vertical-shaft" :class="{ 'laser-shaft-miss': lastAnswerCorrect === false }">
              <div class="laser-vertical-core"></div>
              <div class="laser-vertical-pulse"></div>
            </div>
            <div class="laser-bottom-muzzle"></div>
            <div v-if="lastAnswerCorrect !== false" class="laser-top-impact">
              <div class="laser-impact-ring"></div>
              <div class="laser-impact-core"></div>
            </div>
            <div v-else class="laser-miss-tag">
              MELESET!
            </div>
          </div>

          <div class="transform scale-75 origin-top">
            <BossSprite
              :name="state?.boss?.name || 'Rakus Maximus'"
              :boss-id="state?.boss?.id || 'rakus-maximus'"
              :color="state?.boss?.color || '#7c3aed'"
              :accent="state?.boss?.accent || '#c084fc'"
              :custom-image-url="state?.boss?.customImageUrl"
              :pose="pose"
              :show-hit="myHit"
              :reduced-motion="false"
            />
          </div>
        </div>

        <!-- Main Content Area: Rules, Question, or Completion -->
        <div class="px-4 pb-4 space-y-3 flex-1 flex flex-col justify-between">
          <!-- Active Question Card: Tampil selama siswa belum menyelesaikan seluruh butir soal -->
          <div
            v-if="currentQuestion && me.answeredCount < questions.length && state?.outcome !== 'boss_victory'"
            class="rounded-2xl bg-slate-900/90 border border-white/15 p-3.5 shadow-xl space-y-2.5"
          >
            <div v-if="state?.outcome === 'class_victory'" class="bg-amber-500/20 border border-amber-400/40 rounded-xl px-3 py-1.5 text-[11px] text-amber-200 flex items-center justify-between">
              <span class="font-bold flex items-center gap-1">
                <span>🏆</span> Boss Telah Kalah!
              </span>
              <span class="text-white/80">Selesaikan soal tersisa untuk nilai 100!</span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-[11px] font-extrabold text-cyan-400 flex items-center gap-1">
                <span>📝</span> Soal {{ Math.min(me.answeredCount + 1, questions.length) }} dari {{ questions.length }}
              </span>
              <span class="text-[10px] text-white/50">Bobot: {{ currentQuestion.points || 10 }} pts</span>
            </div>

            <p class="text-xs sm:text-sm font-semibold text-white leading-relaxed">
              {{ currentQuestion.text }}
            </p>

            <!-- Multiple Choice Options (Panel 9: A. Lambung highlighted in vivid green) -->
            <div class="space-y-1.5 pt-1">
              <button
                v-for="(opt, idx) in currentQuestion.options"
                :key="idx"
                class="w-full text-left text-xs px-3 py-2.5 rounded-xl border transition-all flex items-center gap-2.5"
                :class="optionButtonClass(idx)"
                :disabled="answerLocked"
                @click="submitOption(idx)"
              >
                <span class="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] border shrink-0" :class="optionBadgeClass(idx)">
                  {{ String.fromCharCode(65 + idx) }}
                </span>
                <span class="flex-1 font-medium">{{ opt }}</span>
                <span v-if="chosenOption === idx" class="text-xs font-black text-emerald-300">✓</span>
              </button>
            </div>
          </div>

          <!-- Completion View -->
          <div
            v-else-if="me.answeredCount >= questions.length || state?.outcome === 'class_victory' || state?.outcome === 'boss_victory'"
            class="rounded-2xl bg-gradient-to-b from-slate-900 to-black border p-4 text-center space-y-3 shadow-2xl"
            :class="state?.outcome === 'class_victory' ? 'border-amber-400/50' : 'border-rose-500/30'"
          >
            <div class="space-y-1">
              <span class="text-3xl block">
                {{ state?.outcome === 'class_victory' ? '🏆' : (state?.outcome === 'boss_victory' ? '⚔️' : '📝') }}
              </span>
              <p class="font-black text-base" :class="state?.outcome === 'class_victory' ? 'text-amber-300' : 'text-white'">
                {{ state?.outcome === 'class_victory' ? 'KELAS MENANG! BOSS DIKALAHKAN' : (state?.outcome === 'boss_victory' ? 'PERTEMPURAN BERAKHIR' : 'ULANGAN SELESAI!') }}
              </p>
              <p class="text-xs text-white/80 leading-relaxed">
                {{
                  state?.outcome === 'class_victory'
                    ? 'Hebat! Seluruh siswa mencapai KKM dan Boss telah dikalahkan.'
                    : state?.outcome === 'boss_victory'
                    ? 'Pertempuran selesai. Masih ada siswa yang belum mencapai KKM (Boss Menang). Tetap semangat!'
                    : 'Anda telah menyelesaikan seluruh butir soal ulangan.'
                }}
              </p>
            </div>

            <!-- Academic Score Card -->
            <div class="bg-black/40 border border-white/10 rounded-xl p-3 space-y-1 max-w-xs mx-auto">
              <p class="text-[10px] text-white/60 uppercase tracking-wider font-bold">Nilai Akhir Anda</p>
              <p class="text-3xl font-black text-amber-300 tabular-nums">
                {{ Math.round(me.academicScore) }}
              </p>
              <p class="text-[11px] text-white/80">
                {{ me.correctAnswers }} dari {{ questions.length }} soal dijawab benar
              </p>
              <div class="pt-1">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                  :class="me.reachedKkm ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'"
                >
                  {{ me.reachedKkm ? '✓ Mencapai KKM' : 'Belum Mencapai KKM' }}
                </span>
              </div>
            </div>

            <div class="flex flex-col gap-2 pt-1 max-w-xs mx-auto w-full">
              <button
                v-if="state?.outcome === 'class_victory'"
                class="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg hover:scale-102 active:scale-98 transition cursor-pointer flex items-center justify-center gap-1.5"
                @click="shootVisualLaserAtDefeatedBoss"
              >
                <span>⚡</span> Tembakkan Laser Perayaan!
              </button>
              <button
                class="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 hover:from-rose-900 hover:to-rose-800 text-white font-bold text-xs border border-white/20 shadow-md hover:scale-102 active:scale-98 transition cursor-pointer flex items-center justify-center gap-1.5"
                @click="exitBattleDirect"
              >
                <span>🚪</span> Keluar dari Battle & Kembali
              </button>
            </div>
          </div>

          <!-- Waiting / Lobby View -->
          <div
            v-else
            class="rounded-2xl bg-gradient-to-b from-indigo-950/70 to-slate-900 border border-cyan-400/30 p-4 text-center space-y-3 shadow-xl relative overflow-hidden"
          >
            <div class="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none"></div>
            
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-[11px] font-black uppercase tracking-wider">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>🎮 LOBBY PERTEMPURAN TERHUBUNG</span>
            </div>

            <div class="space-y-1">
              <h3 class="text-sm font-extrabold text-white">Selamat Datang di Arena, {{ me.name }}!</h3>
              <p class="text-[11px] text-white/70 leading-relaxed">
                Kamu telah diceklis guru untuk bertempur melawan <strong class="text-amber-300">{{ state?.boss?.name || 'Boss' }}</strong>.
              </p>
            </div>

            <!-- Squad Ready Indicator -->
            <div class="bg-black/40 border border-white/10 rounded-xl p-2.5 flex items-center justify-between text-xs text-left">
              <div class="flex items-center gap-2">
                <span class="text-lg">🛡️</span>
                <div>
                  <p class="font-bold text-white text-[11px]">Pasukan Kelas Siap</p>
                  <p class="text-[10px] text-emerald-400 font-semibold">● Terhubung Real-Time</p>
                </div>
              </div>
              <div class="text-right">
                <span class="text-[10px] text-white/50 block">Peserta</span>
                <span class="font-black text-amber-300 text-xs tabular-nums">{{ students.length }} Pejuang</span>
              </div>
            </div>

            <div class="pt-1">
              <p class="text-[10px] text-cyan-200 animate-pulse font-medium">
                ⏳ Menunggu guru membuka butir soal ujian...
              </p>
            </div>
          </div>

          <!-- Bottom Student Bar (Panel 9: Chibi Avatar, Name, Skor, Benar, Salah) -->
          <div class="rounded-2xl bg-black/80 border border-white/15 p-2.5 flex items-center justify-between shadow-xl">
            <div class="flex items-center gap-2.5">
              <StudentChibi
                :name="me.name"
                :student-id="me.participantId"
                :size="40"
                :gender="me.gender"
                :pose="laserActive ? 'attack' : (myHit ? 'hit' : 'idle')"
              />
              <div>
                <p class="font-black text-xs text-white">{{ me.name }}</p>
                <p class="text-[10px] text-amber-300 font-bold">Skor: {{ Math.round(me.academicScore) }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 text-right text-[11px]">
              <div>
                <span class="text-white/60 block text-[9px] uppercase font-bold">Benar</span>
                <span class="text-emerald-400 font-black tabular-nums">{{ me.correctAnswers }}</span>
              </div>
              <div>
                <span class="text-white/60 block text-[9px] uppercase font-bold">Salah</span>
                <span class="text-rose-400 font-black tabular-nums">{{ me.wrongAnswers }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. SIDE HUD PANEL (Panel 9: Right Side: Progress Kelas & Ranking Sementara) -->
      <aside class="w-full max-w-xs space-y-4">
        <!-- Progress Kelas -->
        <div class="rounded-3xl bg-slate-900/90 border border-white/15 p-4 shadow-xl text-left">
          <p class="text-[11px] font-extrabold text-white/70 uppercase tracking-wider">Progress Kelas</p>
          <p class="text-2xl font-black text-emerald-400 mt-1 tabular-nums">
            {{ state?.passedCount ?? 0 }} / {{ state?.officialCount ?? 0 }} ({{ state?.ketuntasanDisplay ?? 0 }}%)
          </p>
          <p class="text-xs text-emerald-300 font-bold mt-0.5">Tuntas KKM</p>
        </div>

        <!-- Ranking Sementara -->
        <div class="rounded-3xl bg-slate-900/90 border border-white/15 p-4 shadow-xl space-y-3 text-left">
          <div class="flex items-center justify-between pb-2 border-b border-white/10">
            <p class="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>🏆</span> Ranking Sementara
            </p>
            <span class="text-[10px] text-white/50">Top 5</span>
          </div>

          <div class="space-y-1.5 text-xs">
            <div
              v-for="(st, idx) in leaderboard"
              :key="st.participantId"
              class="flex items-center justify-between px-3 py-2 rounded-xl border transition"
              :class="st.participantId === me.participantId ? 'bg-amber-400/20 border-amber-400/60 text-amber-300 font-black ring-1 ring-amber-400/30' : 'bg-white/5 border-white/5 text-white/80'"
            >
              <div class="flex items-center gap-2 truncate">
                <span class="font-black text-[11px] text-white/50 w-4">{{ idx + 1 }}.</span>
                <span class="truncate">{{ st.participantId === me.participantId ? 'Kamu' : st.name }}</span>
              </div>
              <span class="font-black tabular-nums">{{ Math.round(st.academicScore) }}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- Modal Notifikasi Sesi Dihentikan / Selesai oleh Guru -->
    <Transition name="fade">
      <div
        v-if="isSessionStopped"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md text-white text-center"
      >
        <div class="max-w-sm w-full p-6 rounded-3xl bg-slate-900 border-2 border-amber-400 shadow-2xl space-y-4">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-3xl shadow-lg animate-pulse">
            🛑
          </div>
          <div class="space-y-1.5">
            <h3 class="text-base font-black text-amber-300">Sesi Game Telah Dihentikan</h3>
            <p class="text-xs text-white/80 leading-relaxed">
              {{ sessionStoppedNotice || 'Guru telah mengakhiri sesi ulangan gamifikasi ini. Skor telah tersimpan ke sistem.' }}
            </p>
          </div>
          <div class="bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white/70">
            Mengalihkan ke Portal Siswa dalam <span class="font-bold text-amber-400 tabular-nums">{{ redirectCountdown }}</span> detik...
          </div>
          <button
            @click="router.replace('/student')"
            class="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition cursor-pointer"
          >
            Kembali ke Portal Siswa Sekarang 🏠
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BossSprite from './BossSprite.vue'
import StudentChibi from './StudentChibi.vue'
import { getQuizTypeLabel } from './engine'
import { useBossBattleSession } from './sessionStore'
import { realtimeBossBattle } from '@/services/realtimeBossBattle'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const {
  publicState,
  progressList,
  questionsOfActive,
  answerAsStudent,
  getActiveSession,
  restoreSession,
  loadSessionFromBackend,
  syncOnlineSessionState,
  beginBattle,
  syncBankQuestions,
  clearActiveSession,
} = useBossBattleSession()

const currentStudentId = ref<string>(String(route.query.siswa || authStore.user?.id || ''))
const chosenOption = ref<number | null>(null)
const answerLocked = ref(false)
const myHit = ref(false)
const laserActive = ref(false)
const lastAnswerCorrect = ref<boolean | null>(null)

const isSessionStopped = ref(false)
const sessionStoppedNotice = ref('')
const redirectCountdown = ref(3)
let redirectInterval: ReturnType<typeof setInterval> | null = null
let studentPollInterval: ReturnType<typeof setInterval> | null = null
let unsubVisual: (() => void) | null = null
let unsubHp: (() => void) | null = null
let unsubState: (() => void) | null = null
let unsubStop: (() => void) | null = null
let unsubClear: (() => void) | null = null
let unsubBattleStarted: (() => void) | null = null

const students = computed(() => progressList())

watch(students, (list) => {
  if (list.length > 0) {
    const user = authStore.user
    const querySiswa = route.query.siswa as string | undefined
    if (querySiswa && list.some(s => s.participantId === querySiswa || s.studentId === querySiswa)) {
      currentStudentId.value = querySiswa
      return
    }
    if (user) {
      const myId = String(user.id || '')
      const myStudentId = String((user as any).student_id || '')
      const myUsername = String(user.username || '')
      const myNis = String((user as any).nis || '')
      const myName = (user.name || '').toLowerCase().trim()

      const matched = list.find((s) => 
        (myId && (s.participantId === myId || s.studentId === myId)) ||
        (myStudentId && (s.participantId === myStudentId || s.studentId === myStudentId)) ||
        (myUsername && (s.participantId === myUsername || s.studentId === myUsername)) ||
        (myNis && (s.participantId === myNis || s.studentId === myNis)) ||
        (myName && (s.name || '').toLowerCase().trim() === myName)
      )
      if (matched) {
        currentStudentId.value = matched.participantId
        return
      }

      // Jika user sedang login (role student), selalu pertahankan identitas akun siswa tersebut!
      // Jangan pernah fallback ke list[0] karena akan membajak progress siswa lain di HP lain
      if (user.role === 'student' || (user as any).is_student || myId) {
        currentStudentId.value = myId
        return
      }
    }
    if (!currentStudentId.value || !list.some(s => s.participantId === currentStudentId.value)) {
      if (!authStore.user || authStore.user.role !== 'student') {
        currentStudentId.value = list[0].participantId
      }
    }
  }
}, { immediate: true })

const currentSessionId = computed(() => String(route.params.id || getActiveSession()?.sessionId || 'active'))
let lastPollTime = Date.now() - 5000

function navigateAfterExit() {
  const isStudent = authStore.user?.role === 'student' || authStore.user?.is_student
  if (authStore.isAuthenticated) {
    if (isStudent) {
      router.replace('/student')
    } else {
      router.replace('/dashboard')
    }
  } else {
    router.replace('/')
  }
}

function exitBattleDirect() {
  clearActiveSession()
  if (studentPollInterval) clearInterval(studentPollInterval)
  if (redirectInterval) clearInterval(redirectInterval)
  navigateAfterExit()
}

function exitBattleConfirm() {
  if (confirm('Apakah Anda yakin ingin keluar dari arena battle?')) {
    exitBattleDirect()
  }
}

function triggerExitSession(reason?: string) {
  if (isSessionStopped.value) return
  isSessionStopped.value = true
  sessionStoppedNotice.value = reason || 'Guru telah menghentikan sesi game ini.'
  clearActiveSession()
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem('agd_active_battle_dispatch')
    } catch {}
  }
  if (studentPollInterval) clearInterval(studentPollInterval)
  redirectCountdown.value = 3
  if (redirectInterval) clearInterval(redirectInterval)
  redirectInterval = setInterval(() => {
    redirectCountdown.value--
    if (redirectCountdown.value <= 0) {
      if (redirectInterval) clearInterval(redirectInterval)
      navigateAfterExit()
    }
  }, 1000)
}

async function initSession(targetId?: string) {
  isSessionStopped.value = false
  sessionStoppedNotice.value = ''
  chosenOption.value = null
  answerLocked.value = false
  myHit.value = false
  laserActive.value = false
  lastAnswerCorrect.value = null

  const urlId = targetId || (route.params.id as string)
  if (urlId && urlId !== 'active') {
    await loadSessionFromBackend(urlId)
  } else {
    // Cek langsung sesi aktif di server
    const loaded = await loadSessionFromBackend('active')
    if (!loaded) {
      restoreSession()
    }
  }
  await syncBankQuestions()
}

watch(
  () => route.params.id,
  async (newId, oldId) => {
    if (newId && newId !== oldId) {
      await initSession(newId as string)
    }
  }
)

async function checkSessionHealth() {
  if (isSessionStopped.value) return
  const sId = currentSessionId.value

  // 1. Cek langsung status sesi spesifik dari backend
  try {
    const res = await api.get(`/ulangan-gamifikasi/sessions/${sId}/poll?since=${lastPollTime}`)
    lastPollTime = Date.now()
    const sData = res.data?.data?.session
    const events = res.data?.data?.events || []

    // Jika guru menghentikan sesi game ini secara eksplisit
    const stopEvt = events.find((e: any) => e.type === 'session_stopped')
    if (stopEvt) {
      triggerExitSession(stopEvt.reason || 'Guru telah menghentikan sesi game ini.')
      return
    }

    if (sData && sData.id === sId) {
      syncOnlineSessionState(sData)
    }
  } catch {
    // Abaikan error jaringan sementara saat polling, jangan tendang siswa
  }

  // 2. Cek jika guru memulai sesi BARU di live broadcast server
  try {
    const bRes = await api.get('/student/live-broadcast')
    const bData = bRes.data?.data
    if (bData && bData.active && bData.type === 'game' && bData.session_id) {
      // Jika guru telah memulai sesi BARU yang berbeda dari sesi di HP saat ini
      if (bData.session_id !== sId) {
        router.replace(`/games/ulangan-harian/play/${bData.session_id}`)
        await initSession(bData.session_id)
        return
      }
    }
  } catch {}
}

onMounted(async () => {
  await initSession()

  // Heartbeat polling ke server setiap 2 detik setelah sesi siap
  setTimeout(checkSessionHealth, 1000)
  studentPollInterval = setInterval(checkSessionHealth, 2000)

  unsubVisual = realtimeBossBattle.subscribe('boss.hit.visual', (visual: any) => {
    if (visual) {
      myHit.value = true
      setTimeout(() => {
        myHit.value = false
      }, 500)
    }
  })

  unsubHp = realtimeBossBattle.subscribe('boss.hp.updated', (payload: any) => {
    if (payload && publicState.value) {
      if (payload.bossHpExact !== undefined) publicState.value.bossHpExact = payload.bossHpExact
      if (payload.bossHpDisplay !== undefined) publicState.value.bossHpDisplay = payload.bossHpDisplay
      if (payload.bossHpPercentDisplay !== undefined) publicState.value.bossHpPercentDisplay = payload.bossHpPercentDisplay
      if (payload.ketuntasanExact !== undefined) {
        publicState.value.ketuntasanExact = payload.ketuntasanExact
        publicState.value.ketuntasanDisplay = Math.round(payload.ketuntasanExact)
      }
      if (payload.passedCount !== undefined) publicState.value.passedCount = payload.passedCount
      if (payload.officialCount !== undefined) publicState.value.officialCount = payload.officialCount
    }
  })

  unsubState = realtimeBossBattle.subscribe('session.state', (newState: any) => {
    if (newState) {
      publicState.value = newState
    }
  })

  unsubStop = realtimeBossBattle.subscribe('session.stopped', (payload: any) => {
    triggerExitSession(payload?.reason || 'Guru telah menghentikan sesi game ini.')
  })

  unsubClear = realtimeBossBattle.subscribe('session.cleared', () => {
    triggerExitSession('Sesi game telah ditutup oleh guru.')
  })

  unsubBattleStarted = realtimeBossBattle.subscribe('battle.started', async (payload: any) => {
    if (payload?.sessionId && payload.sessionId !== currentSessionId.value) {
      // Guru memulai sesi game baru! Beralih langsung ke sesi baru
      router.replace(`/games/ulangan-harian/play/${payload.sessionId}`)
      await initSession(payload.sessionId)
    }
  })
})

onUnmounted(() => {
  unsubVisual?.()
  unsubHp?.()
  unsubState?.()
  unsubStop?.()
  unsubClear?.()
  unsubBattleStarted?.()
  if (studentPollInterval) clearInterval(studentPollInterval)
  if (redirectInterval) clearInterval(redirectInterval)
})

const state = publicState
const questions = computed(() => questionsOfActive())

const me = computed(() => {
  const myId = currentStudentId.value || authStore.user?.id || ''
  const found = students.value.find((p) => p.participantId === myId || p.studentId === myId)
  if (found) return found
  const user = authStore.user
  return {
    participantId: myId,
    studentId: myId,
    name: user?.name || 'Peserta',
    avatar: '🧑',
    gender: (user as any)?.gender as ('L' | 'P' | undefined),
    academicScore: 0,
    reachedKkm: false,
    reachedKkmAt: null,
    correctAnswers: 0,
    wrongAnswers: 0,
    answeredCount: 0,
    currentQuestionIndex: 0,
    lastAnswerCorrect: null,
  }
})

const currentQuestion = computed(() => {
  const qList = questions.value
  if (!qList.length) return null
  const idx = Math.min(me.value.answeredCount, Math.max(qList.length - 1, 0))
  return qList[idx]
})

const pose = computed(() => {
  if (state.value?.outcome === 'class_victory') return 'defeated'
  if (state.value?.outcome === 'boss_victory') return 'laugh'
  return myHit.value ? 'hit' : 'idle'
})

const clock = computed(() => {
  const s = state.value?.remainingSeconds ?? 0
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
})

const leaderboard = computed(() => {
  return [...students.value]
    .sort((a, b) => b.academicScore - a.academicScore)
    .slice(0, 5)
})

function optionButtonClass(idx: number) {
  if (chosenOption.value === idx) {
    return 'bg-emerald-600 border-emerald-400 text-white font-bold shadow-lg ring-2 ring-emerald-400/60 scale-[1.01]'
  }
  return 'bg-slate-900/90 border-white/10 hover:bg-white/10 text-white/90'
}

function optionBadgeClass(idx: number) {
  if (chosenOption.value === idx) {
    return 'bg-emerald-500 text-white border-emerald-300'
  }
  return 'bg-white/10 text-white/80 border-white/20'
}

function submitOption(optionIndex: number) {
  if (answerLocked.value || !currentQuestion.value) return
  chosenOption.value = optionIndex
  answerLocked.value = true

  // Kunci referensi soal saat ini secara eksplisit sebelum state reaktif bergeser
  const targetQuestion = currentQuestion.value
  const targetQuestionId = targetQuestion.id
  const clientEventId = `st-${me.value.participantId}-${targetQuestionId}-${Date.now()}`
  const currentSessionId = getActiveSession()?.sessionId || String(route.params.id || 'active')

  // Kirim ke backend network API — penilaian dilakukan di server
  api
    .post(`/ulangan-gamifikasi/sessions/${currentSessionId}/answer`, {
      participant_id: me.value.participantId,
      participant_name: me.value.name,
      question_id: targetQuestionId,
      option_index: optionIndex,
      client_event_id: clientEventId,
    })
    .then((res) => {
      const isCorrect = Boolean(res.data?.is_correct)
      const sData = res.data?.data
      if (sData && publicState.value) {
        if (sData.boss_hp_exact !== undefined) publicState.value.bossHpExact = sData.boss_hp_exact
        if (sData.boss_hp_display !== undefined) publicState.value.bossHpDisplay = sData.boss_hp_display
        if (sData.boss_hp_percent_display !== undefined) publicState.value.bossHpPercentDisplay = sData.boss_hp_percent_display
        if (sData.ketuntasan_exact !== undefined) publicState.value.ketuntasanExact = sData.ketuntasan_exact
        if (sData.ketuntasan_display !== undefined) publicState.value.ketuntasanDisplay = sData.ketuntasan_display
        if (sData.passed_count !== undefined) publicState.value.passedCount = sData.passed_count
        if (sData.outcome) publicState.value.outcome = sData.outcome
      }

      // Tampilan benar/salah dan animasi laser di HP siswa memakai respons server
      lastAnswerCorrect.value = isCorrect
      laserActive.value = true
      setTimeout(() => {
        laserActive.value = false
      }, 450)

      const effectiveDamage = res.data?.visual_attack?.damage || 0

      // 1. Siarkan ke layar arena proyektor guru secara realtime lokal (BroadcastChannel)
      realtimeBossBattle.broadcast('student.answer.submitted', {
        participantId: me.value.participantId,
        participantName: me.value.name,
        questionId: targetQuestionId,
        optionIndex,
        isCorrect,
        damage: effectiveDamage,
        clientEventId,
        senderTab: 'student_battle_page',
      })

      // 2. Update local progress dengan hasil penilaian server
      const result = answerAsStudent(
        me.value.participantId,
        targetQuestionId,
        optionIndex,
        clientEventId,
        isCorrect,
      )

      if (result?.visualAttack || isCorrect) {
        myHit.value = true
        setTimeout(() => {
          myHit.value = false
        }, 550)
      }

      setTimeout(() => {
        answerLocked.value = false
        chosenOption.value = null
      }, 600)
    })
    .catch((err) => {
      console.warn('Network answer sync error:', err)
      answerLocked.value = false
      chosenOption.value = null
    })
}

function shootVisualLaserAtDefeatedBoss() {
  lastAnswerCorrect.value = true
  laserActive.value = true
  const currentSessionId = getActiveSession()?.sessionId || String(route.params.id || 'active')

  realtimeBossBattle.broadcast('student.answer.submitted', {
    participantId: me.value.participantId,
    questionId: 'celebration',
    optionIndex: 0,
    isCorrect: true,
    clientEventId: `cel-${Date.now()}`,
  })

  api.post(`/ulangan-gamifikasi/sessions/${currentSessionId}/answer`, {
    participant_id: me.value.participantId,
    participant_name: me.value.name,
    question_id: 'celebration',
    option_index: 0,
    client_event_id: `cel-${Date.now()}`,
  }).catch(() => {})

  setTimeout(() => {
    laserActive.value = false
    myHit.value = true
    setTimeout(() => {
      myHit.value = false
    }, 450)
  }, 450)
}
</script>

<style scoped>
.phone-shell {
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(124, 58, 237, 0.2);
}

/* Realistic Mobile Laser Cannon Conduit */
.mobile-laser-conduit {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 25;
  display: flex;
  justify-content: center;
}

.laser-vertical-shaft {
  position: absolute;
  bottom: 0;
  width: 12px;
  height: 85%;
  background: linear-gradient(180deg, #ffffff 0%, #38bdf8 45%, #06b6d4 100%);
  border-radius: 9999px;
  box-shadow: 0 0 20px #06b6d4, 0 0 35px #22d3ee, inset 0 0 6px #ffffff;
  animation: shaftShoot 0.48s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
  transform-origin: bottom center;
}

.laser-vertical-core {
  position: absolute;
  inset: 0 3px;
  background: #ffffff;
  border-radius: 9999px;
  box-shadow: 0 0 10px #ffffff;
}

.laser-vertical-pulse {
  position: absolute;
  width: 100%;
  height: 35px;
  background: #ffffff;
  border-radius: 9999px;
  box-shadow: 0 0 25px #ffffff, 0 0 40px #38bdf8;
  animation: pulseFlyUp 0.35s ease-out forwards;
}

@keyframes shaftShoot {
  0% {
    transform: scaleY(0.1);
    opacity: 0.2;
  }
  25% {
    transform: scaleY(1);
    opacity: 1;
  }
  75% {
    transform: scaleY(1);
    opacity: 1;
    filter: drop-shadow(0 0 15px #38bdf8);
  }
  100% {
    transform: scaleY(1);
    opacity: 0;
  }
}

@keyframes pulseFlyUp {
  0% {
    bottom: 0;
    opacity: 1;
    transform: scaleX(1.8);
  }
  100% {
    bottom: 85%;
    opacity: 1;
    transform: scaleX(2.4);
  }
}

.laser-bottom-muzzle {
  position: absolute;
  bottom: 2px;
  width: 32px;
  height: 20px;
  border-radius: 50%;
  background: radial-gradient(circle, #ffffff 0%, #38bdf8 60%, transparent 100%);
  box-shadow: 0 0 25px #06b6d4, 0 0 50px #22d3ee;
  animation: muzzleFlash 0.35s ease-out forwards;
}

@keyframes muzzleFlash {
  0% { transform: scale(0.4); opacity: 1; }
  40% { transform: scale(1.6); opacity: 1; }
  100% { transform: scale(0.8); opacity: 0; }
}

.laser-top-impact {
  position: absolute;
  top: 15%;
  width: 60px;
  height: 60px;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.laser-impact-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid #38bdf8;
  box-shadow: 0 0 20px #06b6d4, inset 0 0 15px #22d3ee;
  animation: impactRingExpand 0.42s 0.1s ease-out forwards;
  opacity: 0;
}

.laser-impact-core {
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 20px #ffffff, 0 0 35px #06b6d4;
  animation: impactCoreFlash 0.35s 0.1s ease-out forwards;
  opacity: 0;
}

@keyframes impactRingExpand {
  0% { transform: scale(0.2); opacity: 1; }
  50% { transform: scale(1.4); opacity: 1; }
  100% { transform: scale(2.2); opacity: 0; }
}

@keyframes impactCoreFlash {
  0% { transform: scale(0.4); opacity: 1; }
  50% { transform: scale(1.6); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

/* Laser Miss on Wrong Answer */
.mobile-laser-conduit-miss {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 25;
  display: flex;
  justify-content: center;
}

.laser-shaft-miss {
  background: linear-gradient(180deg, #fbbf24 0%, #f97316 45%, #ef4444 100%) !important;
  box-shadow: 0 0 16px #f97316, 0 0 25px #fbbf24 !important;
  transform: rotate(24deg) !important;
  transform-origin: bottom center !important;
  animation: shaftShootMiss 0.45s cubic-bezier(0.1, 0.9, 0.2, 1) forwards !important;
}

@keyframes shaftShootMiss {
  0% { transform: scaleY(0.1) rotate(0deg); opacity: 0; }
  35% { transform: scaleY(1.1) rotate(26deg); opacity: 1; }
  100% { transform: scaleY(1.2) rotate(28deg); opacity: 0; }
}

.laser-miss-tag {
  position: absolute;
  top: 15%;
  right: 18%;
  background: rgba(239, 68, 68, 0.9);
  color: #ffffff;
  font-weight: 900;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 9999px;
  border: 1px solid #fbbf24;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.8);
  animation: missTagFloat 0.6s ease-out forwards;
}

@keyframes missTagFloat {
  0% { transform: scale(0.6); opacity: 0; }
  30% { transform: scale(1.1); opacity: 1; }
  80% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.9) translateY(-8px); opacity: 0; }
}
</style>
