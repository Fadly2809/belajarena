<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span>🎮</span> Edu-Games Ulangan Harian Gamifikasi
        </h1>
        <p class="text-slate-600 text-sm mt-1 font-medium">
          5 Mode Permainan Edukatif Berbasis Data Real (Bank Soal & Siswa Kelas) untuk Penilaian Formatif & Ulangan Harian
        </p>
      </div>
      <div class="flex items-center gap-2">
        <router-link
          to="/cbt"
          class="px-4 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#082231] text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
        >
          <span>📝</span> <span>Mode Ujian CBT (UTS & UAS) →</span>
        </router-link>
      </div>
    </div>

    <!-- PANDUAN ASESMEN SEKOLAH: ULANGAN HARIAN VS CBT SEMESTER -->
    <div class="rounded-[24px] p-5 bg-[#0c2b3d]/5 border border-[#0c2b3d]/15 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div class="flex items-start gap-3.5">
        <span class="text-2xl mt-0.5">💡</span>
        <div class="text-xs space-y-1">
          <p class="font-extrabold text-[#0c2b3d] text-sm">
            Petunjuk Standar Asesmen Pembelajaran:
          </p>
          <p class="text-slate-600 leading-relaxed">
            &bull; <strong>Ulangan Harian Gamifikasi:</strong> Gunakan salah satu dari <strong>5 Pilihan Game Edukasi</strong> di bawah ini (termasuk Final Boss Battle, Balapan Kelas, Pertahanan Markas, Kuis Kilat, & Memory Match) untuk evaluasi formatif kelas yang menyenangkan dan interaktif.<br>
            &bull; <strong>Ulangan Tengah Semester (UTS/PTS) & Ulangan Semester (UAS/PAS):</strong> Menggunakan sistem evaluasi formal berbasis komputer di <strong><router-link to="/cbt" class="text-[#0c2b3d] font-bold underline">Modul Ujian CBT</router-link></strong>.
          </p>
        </div>
      </div>
      <router-link
        to="/cbt"
        class="whitespace-nowrap px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-[#0c2b3d] font-bold text-xs shadow-xs hover:bg-slate-50 transition"
      >
        Buka Modul CBT →
      </router-link>
    </div>

    <!-- Active Games Banner if any (Real Sesi Aktif) -->
    <div v-if="activeSessions.length > 0" class="p-5 rounded-[24px] bg-[#0c2b3d] text-white shadow-card flex flex-wrap items-center justify-between gap-4 border border-slate-700/40">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-xl animate-pulse">
          ⚡
        </div>
        <div>
          <h2 class="font-bold text-base leading-snug">Sesi Game Sedang Berlangsung</h2>
          <p class="text-xs text-white/80">
            Kode / PIN: <span class="font-mono font-bold tracking-widest text-amber-300 text-sm">{{ activeSessions[0].pin }}</span>
            &bull; {{ activeSessions[0].title }} ({{ activeSessions[0].participantsCount }} Siswa Terdaftar)
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="stopActiveSessionFromList(activeSessions[0])"
          class="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
          title="Hentikan sesi game yang sedang aktif"
        >
          <span>⏹️</span>
          <span>Stop Sesi</span>
        </button>
        <router-link
          :to="(activeSessions[0].mode === 'class-race' || activeSessions[0].game_type === 'class-race')
            ? `/games/class-race/arena/${activeSessions[0].id}`
            : ((activeSessions[0].mode === 'tower-defense' || activeSessions[0].game_type === 'tower-defense')
              ? `/games/tower-defense/arena/${activeSessions[0].id}`
              : (activeSessions[0].isBossBattle
                ? '/games/ulangan-harian/arena/active'
                : `/games/session/${activeSessions[0].id}?mode=${activeSessions[0].mode || 'fast_quiz'}`))"
          class="px-4 py-2 bg-white text-primary-700 hover:bg-white/90 text-xs font-bold rounded-lg shadow transition"
        >
          Masuk Layar Kontrol Host →
        </router-link>
      </div>
    </div>

    <!-- Pilihan 5 Mode Game Edukasi (Setara untuk Ulangan Harian) -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-lg font-bold text-surface-900 flex items-center gap-2">
            <span>🧩</span> 5 Pilihan Mode Game Edukasi (Ulangan Harian)
          </h2>
          <p class="text-xs text-surface-500 mt-0.5">
            Pilih mode gamifikasi yang paling sesuai dengan karakteristik materi dan gaya belajar kelas
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div
          v-for="tpl in gameTemplates"
          :key="tpl.id"
          class="card hover:shadow-lg transition-all border flex flex-col justify-between group cursor-pointer relative overflow-hidden"
          :class="tpl.borderColor"
          @click="selectTemplate(tpl)"
        >
          <!-- Accent Corner Badge -->
          <div class="absolute top-2 right-2">
            <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full" :class="tpl.tagColor">
              {{ tpl.badge }}
            </span>
          </div>

          <div>
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3 transition-transform group-hover:scale-110 shadow-xs"
              :style="{ backgroundColor: tpl.bgColor }"
            >
              {{ tpl.icon }}
            </div>
            <h3 class="font-bold text-surface-900 text-sm mb-1.5 leading-snug">{{ tpl.name }}</h3>
            <p class="text-surface-500 text-xs leading-relaxed mb-3">
              {{ tpl.description }}
            </p>
          </div>

          <div class="pt-3 border-t border-surface-100 flex items-center justify-between">
            <span class="text-[10px] font-bold text-surface-600 truncate max-w-[120px]">{{ tpl.suitability }}</span>
            <button class="btn btn-secondary text-xs px-2.5 py-1 font-bold group-hover:bg-primary-600 group-hover:text-white transition">
              Mainkan →
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Riwayat Sesi Game Sebelumnya (Data Real Bebas Dummy) -->
    <div class="card space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-100">
        <div>
          <h2 class="font-bold text-surface-900 text-base">Riwayat Sesi Game Kelas</h2>
          <p class="text-xs text-surface-500">Hasil dan rekapitulasi sesi kuis & ulangan gamifikasi yang telah selesai</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-100 text-surface-600">
            {{ pastSessions.length }} sesi selesai
          </span>
          <button
            v-if="pastSessions.length > 0"
            @click="deleteAllPastSessions"
            class="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition flex items-center gap-1.5 border border-rose-200 shadow-xs cursor-pointer"
            title="Hapus seluruh riwayat game yang sudah selesai"
          >
            <span>🗑️</span>
            <span>Hapus Semua</span>
          </button>
        </div>
      </div>

      <div v-if="pastSessions.length > 0" class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="bg-surface-50 text-surface-600 font-semibold uppercase tracking-wider">
              <th class="py-3 px-4">Judul Game</th>
              <th class="py-3 px-4">Kelas</th>
              <th class="py-3 px-4">Mode</th>
              <th class="py-3 px-4">Partisipan</th>
              <th class="py-3 px-4">Status / Hasil</th>
              <th class="py-3 px-4">Tanggal</th>
              <th class="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            <tr v-for="ses in pastSessions" :key="ses.id" class="hover:bg-surface-50/50">
              <td class="py-3 px-4 font-semibold text-surface-900">{{ ses.title }}</td>
              <td class="py-3 px-4"><span class="badge badge-secondary">{{ ses.classroom }}</span></td>
              <td class="py-3 px-4">{{ ses.mode }}</td>
              <td class="py-3 px-4">{{ ses.participantsCount }} Siswa</td>
              <td class="py-3 px-4">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold"
                  :class="ses.outcome === 'class_victory' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'"
                >
                  {{ ses.outcomeLabel }}
                </span>
              </td>
              <td class="py-3 px-4 text-surface-500">{{ ses.date }}</td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <router-link
                    :to="`/reports/exam-events?session_id=${ses.id}`"
                    class="px-2 py-1 rounded-lg text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-semibold transition flex items-center gap-1"
                    title="Buka Rekap Nilai Event Ini & Masukkan ke Rekap Siswa"
                  >
                    <span>📋</span> Rekap Nilai
                  </router-link>
                  <router-link
                    :to="ses.link"
                    class="px-2.5 py-1 rounded-lg text-primary-600 hover:text-primary-700 hover:bg-primary-50 font-semibold transition"
                  >
                    Arena →
                  </router-link>
                  <button
                    @click="deleteSinglePastSession(ses)"
                    class="p-1 rounded-lg text-surface-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                    title="Hapus riwayat sesi ini"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State Riwayat Nyata (Bebas Dummy) -->
      <div v-else class="p-8 text-center text-surface-400 space-y-2">
        <span class="text-3xl">🎮</span>
        <p class="font-bold text-surface-700 text-sm">Belum Ada Riwayat Sesi Game yang Selesai</p>
        <p class="text-xs text-surface-500 max-w-md mx-auto">
          Mulai ulangan gamifikasi Boss Battle atau kuis edukasi. Setelah sesi selesai atau dihentikan guru, rekapitulasi nilai siswa akan otomatis tampil di sini.
        </p>
      </div>
    </div>

    <!-- Modal Buat Sesi Baru (Menggunakan Data Real) -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      @click.self="showCreateModal = false"
    >
      <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scale-up">
        <div class="flex items-center justify-between pb-3 border-b border-surface-100">
          <div>
            <h3 class="text-base font-bold text-surface-900 flex items-center gap-2">
              <span>🚀</span> Setup Sesi Game: {{ activeTemplate?.name }}
            </h3>
            <p class="text-[11px] text-surface-500">Koneksi otomatis ke Bank Soal dan Daftar Siswa Kelas Real</p>
          </div>
          <button @click="showCreateModal = false" class="text-surface-400 hover:text-surface-600 text-lg">✕</button>
        </div>

        <form @submit.prevent="launchNewSession" class="space-y-4 text-xs">
          <div>
            <label class="label">Judul Aktivitas Game Ulangan Harian</label>
            <input
              v-model="newSession.title"
              type="text"
              class="input text-xs"
              placeholder="Contoh: Kuis Cepat Berpikir Komputasional"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Target Kelas Rombel</label>
              <select v-model="newSession.classroomId" class="input text-xs font-bold" required @change="onClassChange">
                <option v-for="c in classrooms" :key="c.id" :value="c.id">
                  {{ formatClassLabel(c) }}
                </option>
              </select>
            </div>
            <div>
              <label class="label">Mata Pelajaran</label>
              <select v-model="newSession.subject" class="input text-xs font-semibold" required @change="updateQuestionsCount">
                <option v-for="s in availableSubjects" :key="s.id" :value="s.name">
                  {{ s.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Jumlah Soal / Babak</label>
              <select v-model.number="newSession.questionCount" class="input text-xs">
                <option :value="5">5 Butir Soal</option>
                <option :value="10">10 Butir Soal</option>
                <option :value="15">15 Butir Soal</option>
                <option :value="20">20 Butir Soal</option>
              </select>
            </div>
            <div>
              <label class="label">Waktu per Soal (Detik)</label>
              <select v-model.number="newSession.timePerQuestion" class="input text-xs">
                <option :value="10">10 Detik (Sangat Cepat)</option>
                <option :value="15">15 Detik (Standar)</option>
                <option :value="20">20 Detik</option>
                <option :value="30">30 Detik (Santai)</option>
              </select>
            </div>
          </div>

          <!-- Live Real Data Indicator -->
          <div class="p-3 rounded-xl bg-surface-50 border border-surface-200 space-y-1.5 text-[11px]">
            <div class="flex items-center justify-between text-surface-700">
              <span class="flex items-center gap-1.5">
                <span>👥</span> Siswa Terdaftar di Kelas:
              </span>
              <strong class="text-primary-700">{{ classStudentCount }} Siswa</strong>
            </div>
            <div class="flex items-center justify-between text-surface-700">
              <span class="flex items-center gap-1.5">
                <span>📚</span> Butir Soal di Bank Soal Real:
              </span>
              <strong class="text-emerald-700">{{ bankQuestionCount }} Soal Siap</strong>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-surface-100">
            <button
              type="button"
              @click="showCreateModal = false"
              class="btn btn-secondary text-xs px-4 py-2"
            >
              Batal
            </button>
            <button
              type="submit"
              class="btn btn-primary text-xs px-5 py-2 font-bold shadow-md"
            >
              🚀 Buka Ruang Permainan
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  useClassrooms,
  getSubjectNameForClass,
  getAvailableSubjectsForClass
} from '@/composables/useClassrooms'
import { useBossBattleSession } from '@/modules/games/bossBattle/sessionStore'
import api from '@/services/api'

const router = useRouter()
const { classrooms, fetchClassrooms, formatClassLabel, getClassName } = useClassrooms()
const { getActiveSession, restoreSession, stopActiveSession, clearActiveSession } = useBossBattleSession()
const showCreateModal = ref(false)
const activeTemplate = ref<any>(null)
const classStudentCount = ref(0)
const bankQuestionCount = ref(0)

// 5 Pilihan Mode Game Edukasi (Ulangan Harian Gamifikasi Setara)
const gameTemplates = [
  {
    id: 'boss_battle',
    name: 'Final Boss Battle (Serangan Kelas)',
    description: 'Siswa bekerja sama menembakkan laser ke Boss dengan menjawab benar. Boss tumbang saat seluruh kelas melewati target KKM!',
    icon: '👾',
    bgColor: '#f5f3ff',
    borderColor: 'border-violet-300',
    tagColor: 'bg-violet-100 text-violet-800',
    suitability: 'Paling Populer: Kolaboratif Kelas',
    badge: 'Boss Battle',
    isBossBattle: true
  },
  {
    id: 'class_race',
    name: 'Class Race (Balapan Kelas)',
    description: 'Kuis tim serentak dengan lintasan balap proyektor. Kecepatan dan ketepatan tim memacu kendaraan melaju menuju garis finis!',
    icon: '🏎️',
    bgColor: '#fff7ed',
    borderColor: 'border-amber-300',
    tagColor: 'bg-amber-100 text-amber-800',
    suitability: 'Kompetisi Tim & Kolaborasi',
    badge: 'Race Arena'
  },
  {
    id: 'tower_defense',
    name: 'Tower Defense Kelas (Pertahanan Markas)',
    description: 'Strategi kolaboratif kelas membangun menara dan bertahan dari 5 gelombang musuh. Jawaban benar menyumbang koin dan buff menara!',
    icon: '🏰',
    bgColor: '#f0fdf4',
    borderColor: 'border-emerald-300',
    tagColor: 'bg-emerald-100 text-emerald-800',
    suitability: 'Strategi & Kolaborasi Kelas',
    badge: 'Base Defense'
  },
  {
    id: 'fast_quiz',
    name: 'Kuis Kilat Berkecepatan (Fast Quiz)',
    description: 'Multiplayer interaktif ala Kahoot dengan soal pilihan ganda dari Bank Soal dan poin berdasarkan kecepatan serta ketepatan.',
    icon: '⚡',
    bgColor: '#eff6ff',
    borderColor: 'border-blue-200',
    tagColor: 'bg-blue-100 text-blue-800',
    suitability: 'Kompetisi Individu',
    badge: 'Speed Battle'
  },
  {
    id: 'memory_match',
    name: 'Pencocok Pasangan (Memory Match)',
    description: 'Permainan mencocokkan kartu pasangan antara konsep/istilah dan fungsi/jawaban nyata secara interaktif dan seru.',
    icon: '🧠',
    bgColor: '#fffbeb',
    borderColor: 'border-amber-200',
    tagColor: 'bg-amber-100 text-amber-800',
    suitability: 'Daya Ingat & Asosiasi Logika',
    badge: 'Pair Matching'
  }
]

const activeSessions = ref<Array<{
  id: string
  pin: string
  title: string
  participantsCount: number
  mode?: string
  game_type?: string
  isBossBattle?: boolean
}>>([])

const pastSessions = ref<Array<{
  id: string
  title: string
  classroom: string
  mode: string
  participantsCount: number
  outcome?: string
  outcomeLabel: string
  date: string
  link: string
}>>([])

const newSession = ref({
  title: 'Kuis Interaktif Baru',
  templateId: 'fast_quiz',
  classroomId: 'cls-7a',
  classroom: 'VII A',
  subject: 'KKA (Koding dan Kecerdasan Artifisial)',
  questionCount: 5,
  timePerQuestion: 15
})

const availableSubjects = computed(() => getAvailableSubjectsForClass(newSession.value.classroomId))

onMounted(async () => {
  await fetchClassrooms()
  if (classrooms.value.length > 0) {
    newSession.value.classroomId = classrooms.value[0].id
    newSession.value.classroom = classrooms.value[0].name
    newSession.value.subject = getSubjectNameForClass(classrooms.value[0].id)
  }
  await updateCounts()
  await loadRealSessions()
})

async function onClassChange() {
  const c = classrooms.value.find(cl => cl.id === newSession.value.classroomId)
  if (c) newSession.value.classroom = c.name
  newSession.value.subject = getSubjectNameForClass(newSession.value.classroomId)
  await updateCounts()
}

async function updateQuestionsCount() {
  await updateCounts()
}

async function updateCounts() {
  try {
    const sRes = await api.get('/students', { params: { classroom_id: newSession.value.classroomId, all: 'true' } })
    const list = sRes.data?.data || []
    classStudentCount.value = list.length
  } catch {
    classStudentCount.value = 0
  }

  try {
    const qRes = await api.get('/questions', { params: { subject_name: newSession.value.subject } })
    const qList = qRes.data?.data || []
    bankQuestionCount.value = qList.length
  } catch {
    bankQuestionCount.value = 0
  }
}

function getGameModeTitle(mode?: string) {
  if (mode === 'class-race' || mode === 'class_race') return 'Balapan Kelas (Class Race)'
  if (mode === 'tower-defense' || mode === 'tower_defense') return 'Pertahanan Markas (Tower Defense)'
  if (mode === 'fast_quiz') return 'Kuis Kilat (Speed Battle)'
  if (mode === 'memory_match') return 'Pencocok Pasangan'
  if (mode === 'word_scramble') return 'Susun Kata Kosakata (Arsip)'
  if (mode === 'flashcard_battle') return 'Tebak Kartu Konsep (Arsip)'
  return 'Boss Battle Gamifikasi'
}

async function loadRealSessions() {
  activeSessions.value = []
  pastSessions.value = []

  // 1. Fetch sesi dari API server (Server adalah Source of Truth sesi online)
  try {
    const res = await api.get('/ulangan-gamifikasi/sessions')
    const list = res.data?.data || []
    if (Array.isArray(list)) {
      for (const s of list) {
        const isLive = (s.status === 'active' || s.status === 'in_progress' || s.status === 'lobby') && s.outcome === 'ongoing'
        const isBoss = s.mode === 'boss_battle' || (!s.mode && !s.game_type) || s.quiz_type === 'boss_battle'
        const isClassRace = s.mode === 'class-race' || s.game_type === 'class-race'
        const isTD = s.mode === 'tower-defense' || s.game_type === 'tower-defense'
        if (isLive) {
          if (!activeSessions.value.some(a => a.id === s.id)) {
            activeSessions.value.push({
              id: s.id,
              pin: s.join_code || s.pin || s.id,
              title: s.title || (isClassRace ? 'Balapan Kelas' : (isTD ? 'Pertahanan Markas' : 'Ulangan Gamifikasi')),
              participantsCount: (s.participants || []).length || s.official_count || 0,
              mode: s.mode || s.game_type || (isBoss ? 'boss_battle' : 'fast_quiz'),
              game_type: s.game_type,
              isBossBattle: isBoss
            })
          }
        } else if (s.status === 'completed' || (s.outcome && s.outcome !== 'ongoing')) {
          const dateStr = s.ended_at || s.created_at
            ? new Date(s.ended_at || s.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
            : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

          const clsName = s.classroom_name
            ? (/^kelas\s+/i.test(s.classroom_name) ? s.classroom_name : `Kelas ${s.classroom_name}`)
            : (s.classroom_id ? getClassName(s.classroom_id) : 'Semua Kelas')

          let sessionLink = `/games/session/${s.id}?mode=${s.mode || 'fast_quiz'}`
          if (isClassRace) {
            sessionLink = `/games/class-race/arena/${s.id}`
          } else if (isTD) {
            sessionLink = `/games/tower-defense/arena/${s.id}`
          } else if (isBoss) {
            sessionLink = `/games/ulangan-harian/arena/${s.id}`
          }

          pastSessions.value.push({
            id: s.id,
            title: s.title || 'Edu-Game Sesi',
            classroom: clsName,
            mode: getGameModeTitle(s.mode || s.game_type),
            participantsCount: (s.participants || []).length || s.official_count || 0,
            outcome: s.outcome,
            outcomeLabel: 'Selesai',
            date: dateStr,
            link: sessionLink
          })
        }
      }
    }
  } catch (err) {
    console.warn('Load game sessions from api failed:', err)
  }

  // 2. Periksa sesi lokal Boss Battle aktif (HANYA jika game benar-benar sedang berjalan)
  restoreSession()
  const localBoss = getActiveSession()
  if (
    localBoss &&
    localBoss.status === 'active' &&
    localBoss.startedAt &&
    localBoss.outcome === 'ongoing'
  ) {
    if (!activeSessions.value.some(a => a.id === localBoss.sessionId)) {
      activeSessions.value.unshift({
        id: localBoss.sessionId,
        pin: localBoss.sessionId,
        title: localBoss.config.title || 'Ulangan Gamifikasi Boss Battle',
        participantsCount: localBoss.progress?.size || localBoss.officialRoster?.length || 0,
        mode: 'boss_battle',
        isBossBattle: true
      })
    }
  } else if (localBoss && (localBoss.status === 'waiting' || localBoss.status === 'preview' || !localBoss.startedAt)) {
    clearActiveSession()
  }
}

async function deleteSinglePastSession(ses: any) {
  if (confirm(`Apakah Anda yakin ingin menghapus riwayat sesi game "${ses.title}"?`)) {
    try {
      await api.delete(`/ulangan-gamifikasi/sessions/${ses.id}`)
      await loadRealSessions()
    } catch (err) {
      console.error('Gagal menghapus riwayat sesi:', err)
      alert('Gagal menghapus riwayat sesi.')
    }
  }
}

async function deleteAllPastSessions() {
  if (confirm(`Apakah Anda yakin ingin menghapus SEMUA (${pastSessions.value.length}) riwayat sesi game yang sudah selesai?`)) {
    try {
      await api.delete('/ulangan-gamifikasi/sessions')
      await loadRealSessions()
    } catch (err) {
      console.error('Gagal menghapus seluruh riwayat sesi:', err)
      alert('Gagal menghapus seluruh riwayat sesi.')
    }
  }
}

async function stopActiveSessionFromList(item: any) {
  if (confirm(`Apakah Anda yakin ingin menghentikan sesi "${item.title}" sekarang?`)) {
    if (item.isBossBattle) {
      stopActiveSession('Dihentikan dari menu Edu-Games')
      clearActiveSession()
    }
    try {
      await api.post(`/ulangan-gamifikasi/sessions/${item.id}/stop`, {})
      await api.post('/ulangan-gamifikasi/sessions/active/stop', {})
    } catch {}
    await loadRealSessions()
  }
}

function selectTemplate(tpl: any) {
  if (tpl.id === 'boss_battle') {
    // Mode Final Boss Battle
    router.push('/games/ulangan-harian')
    return
  }

  activeTemplate.value = tpl
  newSession.value.templateId = tpl.id
  newSession.value.title = `${tpl.name} — ${newSession.value.classroom}`
  showCreateModal.value = true
  updateCounts()
}

async function launchNewSession() {
  showCreateModal.value = false
  const genId = 'ses-' + Date.now().toString(36)
  const pin = Math.floor(100000 + Math.random() * 900000).toString()

  // 1. Ambil data siswa real kelas
  let realStudents: any[] = []
  try {
    const sRes = await api.get('/students', { params: { classroom_id: newSession.value.classroomId, all: 'true' } })
    realStudents = sRes.data?.data || []
  } catch {}

  // 2. Ambil butir soal real dari Bank Soal
  let realQuestions: any[] = []
  try {
    const qRes = await api.get('/questions', { params: { subject_name: newSession.value.subject } })
    const allQ = qRes.data?.data || []
    realQuestions = allQ.slice(0, newSession.value.questionCount)
  } catch {}

  const isClassRaceMode = newSession.value.templateId === 'class_race' || newSession.value.templateId === 'class-race'
  const isTdMode = newSession.value.templateId === 'tower_defense' || newSession.value.templateId === 'tower-defense'
  const sessionPayload: any = {
    id: genId,
    pin,
    join_code: pin,
    title: newSession.value.title,
    mode: isClassRaceMode ? 'class-race' : (isTdMode ? 'tower-defense' : newSession.value.templateId),
    quiz_type: isClassRaceMode ? 'class-race' : (isTdMode ? 'tower-defense' : newSession.value.templateId),
    game_type: isClassRaceMode ? 'class-race' : (isTdMode ? 'tower-defense' : undefined),
    classroom_id: newSession.value.classroomId,
    classroom_name: newSession.value.classroom,
    subject: newSession.value.subject,
    question_count: newSession.value.questionCount,
    time_per_question: newSession.value.timePerQuestion,
    race_length: isClassRaceMode ? 500 : undefined,
    per_question_seconds: isClassRaceMode ? (newSession.value.timePerQuestion || 15) : undefined,
    initial_coins: isTdMode ? 60 : undefined,
    status: (isClassRaceMode || isTdMode) ? 'lobby' : 'active',
    outcome: 'ongoing',
    questions: realQuestions,
    participants: realStudents.map(s => ({
      id: s.id,
      name: s.name,
      nis: s.nis || s.nisn || '',
      nisn: s.nisn || s.nis || '',
      avatar: s.gender === 'P' ? '👧' : '🧑',
      score: 0,
      academic_score: 0,
      answered: 0,
      correct: 0,
      wrong: 0,
      reached_kkm: false
    })),
    created_at: new Date().toISOString()
  }

  // Simpan ke API Server (Source of Truth Real Sesi Game)
  try {
    await api.post('/ulangan-gamifikasi/sessions', sessionPayload)
  } catch (err) {
    console.warn('Gagal simpan session ke server:', err)
  }

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('game_session_' + genId, JSON.stringify(sessionPayload))
    localStorage.setItem('game_session_active', JSON.stringify(sessionPayload))
  }

  if (isClassRaceMode) {
    router.push(`/games/class-race/arena/${genId}`)
    return
  }

  if (isTdMode) {
    router.push(`/games/tower-defense/arena/${genId}`)
    return
  }

  router.push({
    path: `/games/session/${genId}`,
    query: {
      mode: newSession.value.templateId,
      classId: newSession.value.classroomId,
      subject: newSession.value.subject
    }
  })
}
</script>
