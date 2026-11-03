<template>
  <component :is="activeLayout">
    <RouterView />
  </component>

  <!-- Realtime Battle Invite / Auto-Entry Notification Overlay -->
  <Transition name="battle-modal">
    <div
      v-if="battleInvite"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div
        class="w-full max-w-sm rounded-3xl bg-gradient-to-b from-indigo-950 via-slate-900 to-black border-2 border-amber-400 p-6 text-center space-y-4 shadow-2xl relative overflow-hidden text-white"
      >
        <div class="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none"></div>
        <div class="absolute -bottom-12 -right-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <div class="w-16 h-16 mx-auto rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-3xl shadow-lg animate-bounce">
          ⚔️
        </div>

        <div class="space-y-1.5">
          <span class="inline-block px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold text-[10px] tracking-widest uppercase border border-amber-400/30">
            Panggilan Pertempuran!
          </span>
          <h3 class="text-base font-black text-white leading-snug">
            Guru Telah Memulai Boss Battle!
          </h3>
          <p class="text-xs text-white/80">
            Kamu diceklis untuk ikut bertempur melawan <strong class="text-amber-300">{{ battleInvite.bossName || 'Boss' }}</strong>.
          </p>
        </div>

        <div class="bg-black/50 border border-white/10 rounded-xl p-3 flex items-center justify-between text-xs">
          <span class="text-white/60">Masuk otomatis dalam:</span>
          <span class="font-black text-amber-400 text-sm tabular-nums">{{ countdown }} detik</span>
        </div>

        <button
          @click="enterBattleNow"
          class="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>🚀</span> Masuk ke Lobby Battle Sekarang
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/app/layouts/AppLayout.vue'
import { realtimeBossBattle } from '@/services/realtimeBossBattle'
import { getActiveBattleDispatch } from '@/modules/games/bossBattle/sessionStore'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const activeLayout = computed(() => {
  const layout = route.meta.layout as string | undefined
  if (layout === 'blank' || layout === 'auth' || layout === 'exam') {
    return 'div'
  }
  return AppLayout
})

const battleInvite = ref<any | null>(null)
const countdown = ref(2)
let countdownTimer: any = null
let unsubBattle: (() => void) | null = null
let liveBroadcastInterval: ReturnType<typeof setInterval> | null = null

function isStudentParticipant(user: any, payload: any): boolean {
  if (!user || !payload) return false
  const isStudent =
    user.role === 'student' ||
    (Array.isArray(user.roles) && user.roles.includes('student')) ||
    Boolean(user.is_student)
  if (!isStudent) return false

  const participantIds: string[] = (payload.participantIds || []).map(String)
  const studentIds: string[] = (payload.studentIds || []).map(String)
  const participantNames: string[] = (payload.participantNames || []).map((n: string) =>
    (n || '').toLowerCase().trim()
  )

  const myId = String(user.id || '')
  const myStudentId = String((user as any).student_id || '')
  const myUsername = String(user.username || '')
  const myNis = String((user as any).nis || '')
  const myName = (user.name || '').toLowerCase().trim()

  return (
    (myId && (participantIds.includes(myId) || studentIds.includes(myId))) ||
    (myStudentId && (participantIds.includes(myStudentId) || studentIds.includes(myStudentId))) ||
    (myUsername && (participantIds.includes(myUsername) || studentIds.includes(myUsername))) ||
    (myNis && (participantIds.includes(myNis) || studentIds.includes(myNis))) ||
    (myName && participantNames.includes(myName))
  )
}

function handleBattleDispatch(payload: any) {
  if (!payload || !payload.sessionId) return
  // Jika siswa sudah berada di halaman game play untuk SESI INI, tidak perlu redirect ulang
  if (route.path === `/games/ulangan-harian/play/${payload.sessionId}`) return

  const user = authStore.user
  if (isStudentParticipant(user, payload)) {
    battleInvite.value = payload
    countdown.value = 2
    clearInterval(countdownTimer)
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownTimer)
        enterBattleNow()
      }
    }, 1000)
  }
}

function enterBattleNow() {
  if (!battleInvite.value) return
  clearInterval(countdownTimer)
  const sId = battleInvite.value.sessionId
  battleInvite.value = null
  router.push(`/games/ulangan-harian/play/${sId}`)
}

async function checkGlobalLiveBroadcast() {
  const user = authStore.user
  if (!user) return
  const isStudent =
    user.role === 'student' ||
    (Array.isArray(user.roles) && user.roles.includes('student')) ||
    Boolean(user.is_student)
  if (!isStudent) return

  try {
    const res = await api.get('/student/live-broadcast')
    const data = res.data?.data
    if (!data) return

    if (data.active && data.type === 'game' && data.session_id) {
      // Ada sesi game yang aktif di server
      const currentPlaySessionId = route.path.startsWith('/games/ulangan-harian/play/')
        ? route.path.replace('/games/ulangan-harian/play/', '')
        : null

      // Jika siswa belum ada di sesi game ini, atau sedang berada di sesi game lama yang berbeda:
      if (currentPlaySessionId !== data.session_id) {
        if (!battleInvite.value || battleInvite.value.sessionId !== data.session_id) {
          handleBattleDispatch({
            sessionId: data.session_id,
            title: data.title,
            bossName: data.boss_name || 'Boss',
            participantIds: [String(user.id || ''), String((user as any).student_id || '')],
            studentIds: [String(user.id || ''), String((user as any).student_id || '')],
            participantNames: [user.name || ''],
          })
        }
      }
    } else if (!data.active) {
      // Sesi game tidak aktif untuk notifikasi dispatch
      battleInvite.value = null
      clearInterval(countdownTimer)
    }
  } catch {}
}

let unsubStop: (() => void) | null = null

onMounted(async () => {
  // Try to restore session on app load
  await authStore.fetchUser()

  // Subscribe to real-time battle start events across all tabs & pages
  unsubBattle = realtimeBossBattle.subscribe('battle.started', (payload: any) => {
    handleBattleDispatch(payload)
  })

  // Subscribe to real-time session stopped events
  unsubStop = realtimeBossBattle.subscribe('session.stopped', () => {
    battleInvite.value = null
    clearInterval(countdownTimer)
    if (route.path.includes('/games/ulangan-harian/play')) {
      router.push('/student')
    }
  })

  // Check if an active battle dispatch already exists upon initial mount
  const activeDispatch = getActiveBattleDispatch()
  if (activeDispatch) {
    handleBattleDispatch(activeDispatch)
  }

  // Multi-device Network Heartbeat Polling: pastikan sinkronisasi antar HP siswa dan laptop guru
  checkGlobalLiveBroadcast()
  liveBroadcastInterval = setInterval(checkGlobalLiveBroadcast, 2000)
})

onUnmounted(() => {
  unsubBattle?.()
  unsubStop?.()
  clearInterval(countdownTimer)
  if (liveBroadcastInterval) clearInterval(liveBroadcastInterval)
})
</script>

<style scoped>
.battle-modal-enter-active,
.battle-modal-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.battle-modal-enter-from,
.battle-modal-leave-to {
  opacity: 0;
  transform: scale(0.92);
}
</style>
