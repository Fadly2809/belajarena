<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 flex items-center gap-2">
          <span>⚡</span> Icebreakers & Classroom Energizers
        </h1>
        <p class="text-surface-500 text-sm mt-0.5">
          Koleksi 15+ aktivitas pencair suasana kelas, game interaktif, dan alat pembuka pembelajaran interaktif
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="activeTab = 'wheel'"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
            activeTab === 'wheel' ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-surface-700 border border-surface-200 hover:bg-surface-50'
          ]"
        >
          <span>🎡</span> Roda Putar Nama
        </button>
        <button
          @click="activeTab = 'library'"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
            activeTab === 'library' ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-surface-700 border border-surface-200 hover:bg-surface-50'
          ]"
        >
          <span>📚</span> Bank Aktivitas
        </button>
        <button
          @click="activeTab = 'timer'"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
            activeTab === 'timer' ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-surface-700 border border-surface-200 hover:bg-surface-50'
          ]"
        >
          <span>⏱️</span> Timer Kelas
        </button>
      </div>
    </div>

    <!-- TAB 1: RODA PUTAR NAMA INTERAKTIF -->
    <div v-if="activeTab === 'wheel'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Sisi Kiri: Roda & Kontrol Putar -->
      <div class="lg:col-span-2 card flex flex-col items-center justify-center p-8 bg-gradient-to-b from-white to-surface-50">
        <div class="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center mb-6">
          <!-- Pointer / Jarum Roda -->
          <div class="absolute -top-3 z-20 w-0 h-0 border-x-8 border-x-transparent border-t-[20px] border-t-rose-600 drop-shadow-md"></div>
          
          <!-- Roda Canvas / Visual -->
          <div
            class="w-full h-full rounded-full border-8 border-white shadow-2xl relative overflow-hidden transition-transform ease-out"
            :style="{
              transform: `rotate(${wheelRotation}deg)`,
              transitionDuration: isSpinning ? `${spinDuration}ms` : '0ms'
            }"
          >
            <!-- Slices generated dynamically -->
            <div
              v-for="(name, idx) in activeNames"
              :key="idx"
              class="absolute top-0 left-1/2 w-1/2 h-full origin-left flex items-center pl-6 text-xs font-bold text-white select-none drop-shadow"
              :style="{
                transform: `rotate(${(360 / activeNames.length) * idx}deg)`,
                backgroundColor: sliceColors[idx % sliceColors.length]
              }"
            >
              <span class="truncate max-w-[90px]">{{ name }}</span>
            </div>
          </div>

          <!-- Lingkaran Tengah Roda -->
          <div class="absolute z-10 w-16 h-16 rounded-full bg-white shadow-lg border-4 border-surface-100 flex items-center justify-center">
            <span class="text-xl">🎯</span>
          </div>
        </div>

        <!-- Tombol Aksi Putar -->
        <div class="flex items-center gap-4">
          <button
            @click="spinWheel"
            :disabled="isSpinning || activeNames.length < 2"
            class="btn btn-primary px-8 py-3 text-base shadow-lg shadow-primary-500/30 flex items-center gap-2 transform active:scale-95 transition-all"
          >
            <span v-if="!isSpinning">🚀 Putar Roda Sekarang!</span>
            <span v-else class="flex items-center gap-2">
              <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memutar Roda...
            </span>
          </button>
          <button
            @click="resetWheel"
            :disabled="isSpinning"
            class="btn btn-secondary px-4 py-3"
            title="Reset Pilihan"
          >
            ↺ Reset
          </button>
        </div>

        <!-- Pengumuman Pemenang Terpilih -->
        <transition
          enter-active-class="transform ease-out duration-300"
          enter-from-class="translate-y-4 opacity-0 scale-95"
          enter-to-class="translate-y-0 opacity-100 scale-100"
        >
          <div v-if="selectedWinner" class="mt-6 p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-center w-full max-w-md shadow-sm">
            <p class="text-xs font-semibold text-amber-700 uppercase tracking-wider">🎉 Siswa Terpilih</p>
            <h3 class="text-2xl font-extrabold text-amber-900 mt-1">{{ selectedWinner }}</h3>
            <p class="text-xs text-amber-800 mt-2">
              Silakan menjawab pertanyaan pemantik atau memimpin giliran berikutnya!
            </p>
          </div>
        </transition>
      </div>

      <!-- Sisi Kanan: Pengaturan Daftar Nama -->
      <div class="card space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-surface-100">
          <h2 class="font-bold text-surface-900 text-base">Daftar Partisipan ({{ activeNames.length }})</h2>
          <button
            @click="loadStudentsFromApi"
            :disabled="loadingStudents"
            class="text-xs text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
          >
            {{ loadingStudents ? 'Memuat...' : 'Muat Dari Data Siswa' }}
          </button>
        </div>

        <div>
          <label class="label text-xs">Tambahkan Nama Cepat (pisahkan dengan baris baru)</label>
          <textarea
            v-model="rawNamesInput"
            rows="6"
            class="input font-mono text-xs"
            placeholder="Ahmad Fadhil&#10;Aisyah Putri&#10;Bintang Pratama"
            @change="updateNamesFromInput"
          ></textarea>
        </div>

        <div class="flex items-center justify-between text-xs text-surface-500">
          <span>Minimal 2 nama untuk memutar roda.</span>
          <button @click="shuffleNames" class="text-primary-600 hover:underline">Acak Urutan</button>
        </div>

        <!-- Daftar badge nama saat ini -->
        <div class="max-h-48 overflow-y-auto space-y-1.5 pr-1">
          <div
            v-for="(name, idx) in activeNames"
            :key="idx"
            class="flex items-center justify-between p-2 rounded-lg bg-surface-50 text-xs border border-surface-200"
          >
            <span class="font-medium text-surface-800">{{ idx + 1 }}. {{ name }}</span>
            <button
              @click="removeName(idx)"
              class="text-surface-400 hover:text-rose-600"
              title="Hapus nama"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: LIBRARY / BANK ICEBREAKERS -->
    <div v-else-if="activeTab === 'library'" class="space-y-6">
      <!-- Filter Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-surface-200">
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="cat in categories"
            :key="cat.key"
            @click="selectedCategory = cat.key"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              selectedCategory === cat.key ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'text-surface-600 hover:bg-surface-50'
            ]"
          >
            {{ cat.label }}
          </button>
        </div>
        <div class="w-full sm:w-64">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari aktivitas energizer..."
            class="input text-xs py-1.5"
          />
        </div>
      </div>

      <!-- Grid Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="act in filteredActivities"
          :key="act.id"
          class="card hover:shadow-md transition-shadow flex flex-col justify-between border-t-4"
          :class="act.energyLevel === 'high' ? 'border-t-rose-500' : act.energyLevel === 'medium' ? 'border-t-amber-500' : 'border-t-emerald-500'"
        >
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span
                :class="[
                  'text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full',
                  act.energyLevel === 'high' ? 'bg-rose-50 text-rose-700' : act.energyLevel === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                ]"
              >
                Energi: {{ act.energyLevel }}
              </span>
              <span class="text-xs text-surface-500 flex items-center gap-1">
                ⏱️ {{ act.duration }} menit
              </span>
            </div>
            <h3 class="font-bold text-surface-900 text-base mb-1">{{ act.title }}</h3>
            <p class="text-surface-600 text-xs line-clamp-3 leading-relaxed mb-4">
              {{ act.description }}
            </p>
          </div>

          <div class="pt-4 border-t border-surface-100 flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-xs text-surface-500">
              <span v-if="act.requiresMovement" title="Perlu Gerakan Fisik">🏃‍♂️ Bergerak</span>
              <span v-else title="Dapat Dilakukan di Meja">🪑 Duduk</span>
            </div>
            <button
              @click="openActivityDetail(act)"
              class="btn btn-secondary text-xs px-3 py-1.5"
            >
              Lihat Panduan Guru →
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: TIMER KELAS INTERAKTIF -->
    <div v-else-if="activeTab === 'timer'" class="max-w-2xl mx-auto card p-8 text-center space-y-6">
      <h2 class="text-xl font-bold text-surface-900">⏱️ Stopwatch & Countdown Timer Kelas</h2>
      <p class="text-sm text-surface-500">
        Gunakan pengatur waktu layar besar untuk diskusi kelompok, icebreaking, atau pengerjaan kuis kilat.
      </p>

      <!-- Digital Clock Display -->
      <div class="bg-surface-900 text-white font-mono rounded-2xl p-8 shadow-inner flex items-center justify-center gap-4 text-6xl sm:text-7xl font-bold tracking-wider">
        <span>{{ formattedMinutes }}</span>
        <span class="animate-pulse">:</span>
        <span>{{ formattedSeconds }}</span>
      </div>

      <!-- Preset Buttons -->
      <div class="flex flex-wrap items-center justify-center gap-3">
        <button
          v-for="mins in [1, 3, 5, 10, 15]"
          :key="mins"
          @click="setTimerPreset(mins)"
          class="px-4 py-2 rounded-xl text-xs font-semibold bg-surface-100 hover:bg-surface-200 text-surface-800 transition"
        >
          {{ mins }} Menit
        </button>
      </div>

      <!-- Controls -->
      <div class="flex items-center justify-center gap-4">
        <button
          @click="toggleTimer"
          :class="[
            'btn px-8 py-3 text-base shadow-md font-bold',
            isTimerRunning ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'btn-primary'
          ]"
        >
          {{ isTimerRunning ? '⏸ Jeda' : '▶ Mulai Timer' }}
        </button>
        <button
          @click="resetTimer"
          class="btn btn-secondary px-6 py-3 text-base"
        >
          ↺ Reset
        </button>
      </div>
    </div>

    <!-- Modal Detail Aktivitas Icebreaker -->
    <div
      v-if="activeModalActivity"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      @click.self="activeModalActivity = null"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5">
        <div class="flex items-start justify-between">
          <div>
            <span class="badge badge-primary text-[10px] uppercase mb-1">{{ activeModalActivity.category }}</span>
            <h3 class="text-xl font-bold text-surface-900">{{ activeModalActivity.title }}</h3>
          </div>
          <button
            @click="activeModalActivity = null"
            class="text-surface-400 hover:text-surface-700 p-1"
          >
            ✕
          </button>
        </div>

        <div class="p-3 bg-surface-50 rounded-xl border border-surface-200 text-xs space-y-1.5">
          <div class="flex justify-between">
            <span class="text-surface-500">Estimasi Durasi:</span>
            <span class="font-semibold text-surface-800">{{ activeModalActivity.duration }} Menit</span>
          </div>
          <div class="flex justify-between">
            <span class="text-surface-500">Level Energi:</span>
            <span class="font-semibold text-surface-800 capitalize">{{ activeModalActivity.energyLevel }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-surface-500">Kebutuhan Gerak:</span>
            <span class="font-semibold text-surface-800">{{ activeModalActivity.requiresMovement ? 'Aktivitas Berdiri/Gerak' : 'Duduk di Bangku' }}</span>
          </div>
        </div>

        <div>
          <h4 class="font-bold text-surface-800 text-sm mb-2">Panduan Pelaksanaan Langkah demi Langkah:</h4>
          <div class="whitespace-pre-line text-xs text-surface-600 leading-relaxed bg-surface-50/70 p-3.5 rounded-xl border border-surface-100">
            {{ activeModalActivity.instructions }}
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button
            @click="activeModalActivity = null"
            class="btn btn-secondary text-xs px-4 py-2"
          >
            Tutup
          </button>
          <button
            @click="launchWithTimer(activeModalActivity.duration)"
            class="btn btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
          >
            <span>⏱️</span> Jalankan dengan Timer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import api from '@/services/api'

const activeTab = ref<'wheel' | 'library' | 'timer'>('wheel')
const loadingStudents = ref(false)

// Slice colors for Spin Wheel
const sliceColors = [
  '#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a',
  '#0284c7', '#9333ea', '#e11d48', '#d97706', '#059669'
]

// Wheel State
const activeNames = ref<string[]>([])
const rawNamesInput = ref('')
const isSpinning = ref(false)
const wheelRotation = ref(0)
const spinDuration = ref(4000)
const selectedWinner = ref<string | null>(null)

function updateNamesFromInput() {
  const parsed = rawNamesInput.value
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
  if (parsed.length > 0) {
    activeNames.value = parsed
  }
}

function removeName(idx: number) {
  activeNames.value.splice(idx, 1)
  rawNamesInput.value = activeNames.value.join('\n')
}

function shuffleNames() {
  activeNames.value = [...activeNames.value].sort(() => Math.random() - 0.5)
  rawNamesInput.value = activeNames.value.join('\n')
}

async function loadStudentsFromApi() {
  loadingStudents.value = true
  try {
    const res = await api.get('/students', { params: { per_page: 50 } })
    const data = res.data.data || []
    if (data.length > 0) {
      activeNames.value = data.map((s: { name: string }) => s.name)
      rawNamesInput.value = activeNames.value.join('\n')
      selectedWinner.value = null
    } else {
      alert('Belum ada data siswa di sistem. Silakan tambahkan siswa di menu Data Siswa terlebih dahulu.')
    }
  } catch (err) {
    console.error('Failed to load students:', err)
    alert('Gagal mengambil data siswa dari server.')
  } finally {
    loadingStudents.value = false
  }
}

function spinWheel() {
  if (isSpinning.value || activeNames.value.length < 2) return
  isSpinning.value = true
  selectedWinner.value = null

  // Calculate rotation: 5 full turns (1800 deg) + random angle
  const extraDegrees = Math.floor(Math.random() * 360)
  const totalDegrees = wheelRotation.value + 1800 + extraDegrees
  wheelRotation.value = totalDegrees

  setTimeout(() => {
    isSpinning.value = false
    const sliceAngle = 360 / activeNames.value.length
    // Pointer is at the top (-90 deg from 0 rad)
    const normalizedAngle = (360 - (totalDegrees % 360)) % 360
    const winnerIdx = Math.floor(normalizedAngle / sliceAngle) % activeNames.value.length
    selectedWinner.value = activeNames.value[winnerIdx]
  }, spinDuration.value)
}

function resetWheel() {
  wheelRotation.value = 0
  selectedWinner.value = null
}

// Icebreakers Library
interface Activity {
  id: string
  title: string
  category: string
  description: string
  instructions: string
  duration: number
  energyLevel: 'low' | 'medium' | 'high'
  requiresMovement: boolean
}

const categories = [
  { key: 'all', label: 'Semua Kategori' },
  { key: 'fokus', label: 'Fokus & Konsentrasi' },
  { key: 'energizer', label: 'Gerak Fisik & Energizer' },
  { key: 'pancasila', label: 'Profil Pelajar Pancasila' },
  { key: 'pembuka', label: 'Pembuka & Apersepsi' },
]

const selectedCategory = ref('all')
const searchQuery = ref('')
const activeModalActivity = ref<Activity | null>(null)

const activities = ref<Activity[]>([
  {
    id: '1',
    title: 'Sambung Kata Cepat Sains',
    category: 'fokus',
    description: 'Menyambung istilah sains dengan huruf terakhir kata sebelumnya dalam batas 5 detik per siswa.',
    instructions: '1. Tentukan topik (misal: Ekosistem atau Tata Surya).\n2. Guru menyebut kata pertama: "Fotosintesis".\n3. Siswa berikutnya menyambung dengan awalan "S", misal: "Spora".\n4. Lanjutkan berantai tanpa boleh mengulang kata yang sudah disebutkan.',
    duration: 5,
    energyLevel: 'high',
    requiresMovement: false
  },
  {
    id: '2',
    title: 'Senam Otak 1-2-3 (Brain Gym)',
    category: 'energizer',
    description: 'Latihan motorik silang jari tangan kanan dan kiri untuk mengembalikan fokus yang buyar.',
    instructions: '1. Tangan kanan membentuk simbol "2" (peace), tangan kiri simbol jempol "oke".\n2. Saat guru tepuk tangan, ubah posisi tangan kanan menjadi jempol dan tangan kiri menjadi simbol "2".\n3. Lakukan bergantian makin cepat selama 2 menit.',
    duration: 3,
    energyLevel: 'medium',
    requiresMovement: true
  },
  {
    id: '3',
    title: 'Dua Fakta dan Satu Mitos Diri',
    category: 'pancasila',
    description: 'Membangun keakraban kelas dengan menebak pernyataan bohong di antara dua fakta diri.',
    instructions: '1. Tunjuk 1 siswa membagikan 3 pernyataan tentang dirinya.\n2. Siswa lain berdiskusi selama 30 detik untuk menebak mana pernyataan yang mitos/karangan.\n3. Guru mengaitkan dengan nilai saling menghargai dan kebinekaan.',
    duration: 8,
    energyLevel: 'medium',
    requiresMovement: false
  },
  {
    id: '4',
    title: 'Tebak Istilah Lewat Emoji Riddle',
    category: 'pembuka',
    description: 'Menampilkan rangkaian ikon emoji di layar dan siswa berebut menebak maknanya.',
    instructions: '1. Tampilkan kombinasi emoji: ☀️ + 🌿 + 💧.\n2. Siswa tercepat menebak istilah: "Fotosintesis".\n3. Buat 3 babak tebakan untuk menghidupkan suasana kelas sebelum masuk materi inti.',
    duration: 5,
    energyLevel: 'high',
    requiresMovement: false
  },
  {
    id: '5',
    title: 'Patung Bergerak (Freeze & Focus)',
    category: 'energizer',
    description: 'Musik diputar dan siswa bergerak/meregangkan badan, saat musik berhenti semua mematung diam.',
    instructions: '1. Guru menyetel musik berirama ceria.\n2. Siswa berdiri dan bergerak santai merenggangkan otot bahu dan pinggang.\n3. Saat audio dihentikan mendadak, siswa harus mematung dan fokus menghadap papan tulis.',
    duration: 5,
    energyLevel: 'high',
    requiresMovement: true
  },
  {
    id: '6',
    title: 'Refleksi Satu Kata Penutup',
    category: 'pancasila',
    description: 'Aktivitas reflektif di akhir pembelajaran: setiap siswa menuliskan 1 kata perasaan/ilmu yang didapat.',
    instructions: '1. Berikan waktu 1 menit bagi siswa merenungkan pembelajaran hari ini.\n2. Tiap siswa bergantian menyebutkan 1 kata (misal: "Tertantang", "Paham", "Seru").\n3. Guru merangkum kata-kata kunci tersebut sebagai penutup pembelajaran yang bermakna.',
    duration: 5,
    energyLevel: 'low',
    requiresMovement: false
  }
])

const filteredActivities = computed(() => {
  return activities.value.filter(a => {
    const matchCat = selectedCategory.value === 'all' || a.category === selectedCategory.value
    const matchSearch = a.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                        a.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchCat && matchSearch
  })
})

function openActivityDetail(act: Activity) {
  activeModalActivity.value = act
}

function launchWithTimer(mins: number) {
  activeModalActivity.value = null
  activeTab.value = 'timer'
  setTimerPreset(mins)
  startTimer()
}

// Timer State
const timerSeconds = ref(300)
const isTimerRunning = ref(false)
let timerInterval: any = null

const formattedMinutes = computed(() => {
  const m = Math.floor(timerSeconds.value / 60)
  return m < 10 ? `0${m}` : `${m}`
})

const formattedSeconds = computed(() => {
  const s = timerSeconds.value % 60
  return s < 10 ? `0${s}` : `${s}`
})

function setTimerPreset(mins: number) {
  pauseTimer()
  timerSeconds.value = mins * 60
}

function toggleTimer() {
  if (isTimerRunning.value) {
    pauseTimer()
  } else {
    startTimer()
  }
}

function startTimer() {
  if (isTimerRunning.value || timerSeconds.value <= 0) return
  isTimerRunning.value = true
  timerInterval = setInterval(() => {
    if (timerSeconds.value > 0) {
      timerSeconds.value--
    } else {
      pauseTimer()
      alert('🔔 Waktu aktivitas telah selesai!')
    }
  }, 1000)
}

function pauseTimer() {
  isTimerRunning.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function resetTimer() {
  pauseTimer()
  timerSeconds.value = 300
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>
