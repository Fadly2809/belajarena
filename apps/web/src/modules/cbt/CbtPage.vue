<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span>💻</span> CBT – Ujian Online
        </h1>
        <p class="text-slate-600 text-sm mt-1 font-medium">
          Kelola ujian berbasis komputer (STS, SAS, dan Sumatif Lingkup Materi) di {{ schoolName }}
        </p>
      </div>
      <RouterLink to="/cbt/create" class="px-4 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#082231] text-white font-bold text-xs shadow-md transition flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        <span>Buat Ujian Baru</span>
      </RouterLink>
    </div>

    <!-- Stats Row (Theme Petrol & Honey) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <!-- Card 1: Total Ujian (Deep Petrol) -->
      <div class="card-stat-petrol group">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-300">Total Ujian CBT</span>
            <div class="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-base shadow-inner">
              📝
            </div>
          </div>
          <div class="mt-3">
            <div class="text-3xl font-black text-white tracking-tight leading-none">{{ exams.length }}</div>
            <p class="text-[11px] text-slate-300 font-medium mt-1">Paket asesmen tersimpan</p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300/90 group-hover:text-white transition">
          <span>Semua paket ujian</span>
          <span class="font-bold transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>

      <!-- Card 2: Aktif Sekarang (Warm Honey Amber) -->
      <div class="card-stat-honey group">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-900/80">Aktif Sekarang</span>
            <div class="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center text-slate-950 text-base shadow-inner">
              ⚡
            </div>
          </div>
          <div class="mt-3">
            <div class="text-3xl font-black text-slate-950 tracking-tight leading-none">
              {{ exams.filter(e => e.status === 'active').length }}
            </div>
            <p class="text-[11px] text-slate-900/80 font-semibold mt-1">Siswa dapat mengerjakan</p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-xs text-slate-900/80 group-hover:text-slate-950 font-bold transition">
          <span>Sedang berlangsung</span>
          <span class="font-black transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>

      <!-- Card 3: Terjadwal (Deep Petrol) -->
      <div class="card-stat-petrol group">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-300">Terjadwal</span>
            <div class="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-base shadow-inner">
              📅
            </div>
          </div>
          <div class="mt-3">
            <div class="text-3xl font-black text-white tracking-tight leading-none">
              {{ exams.filter(e => e.status === 'scheduled').length }}
            </div>
            <p class="text-[11px] text-slate-300 font-medium mt-1">Siap rilis mendatang</p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300/90 group-hover:text-white transition">
          <span>Jadwal ujian mendatang</span>
          <span class="font-bold transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>

      <!-- Card 4: Selesai (Dark Slate) -->
      <div class="card-stat-dark group">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-300">Selesai & Dinilai</span>
            <div class="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-base shadow-inner">
              🏁
            </div>
          </div>
          <div class="mt-3">
            <div class="text-3xl font-black text-white tracking-tight leading-none">
              {{ exams.filter(e => e.status === 'completed').length }}
            </div>
            <p class="text-[11px] text-slate-300 font-medium mt-1">Siap cetak & rekap</p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300/90 group-hover:text-white transition">
          <span>Arsip nilai CBT</span>
          <span class="font-bold transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </div>

    <!-- Filter -->
    <div class="bg-white rounded-[24px] shadow-card border border-slate-200/60 p-4 sm:p-5">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <input v-model="search" type="text" class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition" placeholder="Cari judul ujian CBT..." @input="debouncedSearch" />
        </div>
        <select v-model="filter.status" class="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 w-full sm:w-44 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition" @change="loadExams">
          <option value="">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Terjadwal</option>
          <option value="active">Sedang Aktif</option>
          <option value="completed">Selesai</option>
        </select>
        <select v-model="filter.subject" class="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition" @change="loadExams">
          <option value="">Semua Mapel</option>
          <option v-for="s in subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </div>
    </div>

    <!-- Exams list -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="card animate-pulse">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-surface-200"></div>
          <div class="flex-1 space-y-2">
            <div class="h-5 bg-surface-200 rounded w-1/2"></div>
            <div class="h-3 bg-surface-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <div v-if="exams.length === 0" class="card">
        <div class="empty-state">
          <svg class="w-16 h-16 text-surface-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <p class="text-surface-700 font-medium">Belum ada ujian</p>
          <p class="text-surface-500 text-sm mt-1">Buat ujian CBT pertama Anda</p>
          <RouterLink to="/cbt/create" class="btn-primary mt-4">Buat Ujian</RouterLink>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="exam in exams"
          :key="exam.id"
          class="card hover:shadow-card-hover transition-all"
        >
          <div class="flex flex-col sm:flex-row sm:items-center gap-4">
            <!-- Icon + status -->
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              :class="getExamIconBg(exam.status)"
            >
              <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <h3 class="font-bold text-surface-900 text-lg">{{ exam.title }}</h3>
                <span v-if="exam.assessment_type === 'sts' || exam.title?.toLowerCase().includes('sts') || exam.title?.toLowerCase().includes('tengah')"
                  class="badge bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs flex items-center gap-1 shadow-2xs">
                  <span>📑</span> STS (Tengah Semester)
                </span>
                <span v-else-if="exam.assessment_type === 'sas' || exam.title?.toLowerCase().includes('sas') || exam.title?.toLowerCase().includes('akhir')"
                  class="badge bg-purple-100 text-purple-800 border border-purple-300 font-bold text-xs flex items-center gap-1 shadow-2xs">
                  <span>🏆</span> SAS (Akhir Semester)
                </span>
                <span v-else-if="exam.tp_code || exam.assessment_type === 'tp'"
                  class="badge bg-blue-100 text-blue-800 border border-blue-300 font-bold text-xs flex items-center gap-1 shadow-2xs">
                  <span>🎯</span> {{ exam.tp_code || 'Sumatif TP' }}
                </span>
                <span class="badge" :class="getStatusBadge(exam.status)">
                  {{ getStatusLabel(exam.status) }}
                </span>
              </div>
              <div class="flex flex-wrap gap-3 text-sm text-surface-500">
                <span>📚 {{ exam.subject_name }}</span>
                <span>🏫 {{ exam.classroom_name }}</span>
                <span>⏱ {{ exam.duration_minutes }} menit</span>
                <span v-if="exam.question_count">❓ {{ exam.question_count }} soal</span>
                <span v-if="exam.start_time">
                  📅 {{ formatDateTime(exam.start_time) }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-wrap items-center gap-2 flex-shrink-0">
              <!-- Active exam: show monitor button -->
              <RouterLink
                v-if="exam.status === 'active'"
                :to="`/cbt/${exam.id}`"
                class="btn-primary"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                Monitor
              </RouterLink>

              <!-- Draft: edit & publish -->
              <template v-if="exam.status === 'draft'">
                <RouterLink :to="`/cbt/${exam.id}/edit`" class="btn-secondary btn-sm">Edit</RouterLink>
                <button @click="activateExam(exam)" class="btn-primary btn-sm">Mulai Ujian</button>
              </template>

              <!-- Scheduled: activate now -->
              <button v-if="exam.status === 'scheduled'" @click="activateExam(exam)" class="btn-primary btn-sm">
                Aktifkan Sekarang
              </button>

              <!-- Completed: results & rekap -->
              <div v-if="exam.status === 'completed'" class="flex items-center gap-1.5">
                <RouterLink
                  :to="`/cbt/${exam.id}/results`"
                  class="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition flex items-center gap-1 shadow-xs"
                  title="Masukkan Nilai CBT ke Rekap Nilai Siswa"
                >
                  <span>📥</span> Rekap Nilai
                </RouterLink>
                <RouterLink :to="`/cbt/${exam.id}/results`" class="btn-secondary btn-sm">
                  Lihat Hasil
                </RouterLink>
              </div>

              <!-- Access code chip -->
              <div v-if="exam.access_code && exam.status !== 'draft'" class="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 rounded-xl border border-primary-100">
                <span class="text-xs text-primary-600 font-medium">Kode:</span>
                <code class="text-sm font-bold text-primary-800 tracking-widest">{{ exam.access_code }}</code>
                <button @click="copyCode(exam.access_code)" class="text-primary-400 hover:text-primary-600">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                </button>
              </div>

              <!-- More actions dropdown -->
              <div class="relative" ref="dropdownRef">
                <button @click="toggleDropdown(exam.id)" class="btn-icon btn-ghost">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                  </svg>
                </button>
                <div v-if="openDropdown === exam.id" class="absolute right-0 top-full mt-1 bg-white border border-surface-200 rounded-xl shadow-lg z-10 w-48 py-1">
                  <RouterLink :to="`/cbt/${exam.id}`" class="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50">
                    Detail Ujian
                  </RouterLink>
                  <button @click="duplicateExam(exam)" class="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 w-full text-left">
                    Duplikasi
                  </button>
                  <button
                    v-if="exam.status === 'active'"
                    @click="closeExam(exam)"
                    class="flex items-center gap-2 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 w-full text-left"
                  >
                    Tutup Ujian
                  </button>
                  <button
                    v-if="['draft', 'completed'].includes(exam.status)"
                    @click="deleteExam(exam)"
                    class="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Active exam progress bar -->
          <div v-if="exam.status === 'active' && exam.participant_stats" class="mt-4 pt-4 border-t border-surface-100">
            <div class="flex items-center justify-between text-xs text-surface-500 mb-2">
              <span>Siswa selesai: {{ exam.participant_stats.submitted }} / {{ exam.participant_stats.total }}</span>
              <span>{{ Math.round((exam.participant_stats.submitted / exam.participant_stats.total) * 100) }}%</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-value bg-primary-500"
                :style="{ width: `${(exam.participant_stats.submitted / exam.participant_stats.total) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const authStore = useAuthStore()
const schoolName = computed(() => authStore.currentSchool?.name || 'Satuan Pendidikan')

interface Exam {
  id: string
  title: string
  assessment_type?: string
  tp_id?: string
  tp_code?: string
  subject_name: string
  classroom_name: string
  duration_minutes: number
  question_count?: number
  access_code?: string
  start_time?: string
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled'
  participant_stats?: {
    total: number
    started: number
    submitted: number
  }
}

const loading = ref(false)
const exams = ref<Exam[]>([])
const subjects = ref<any[]>([])
const openDropdown = ref<string | null>(null)
const search = ref('')
let searchTimeout: ReturnType<typeof setTimeout>
let pollInterval: ReturnType<typeof setInterval>

const stats = ref([
  { label: 'Total Ujian', value: '0', color: 'text-surface-900' },
  { label: 'Aktif Sekarang', value: '0', color: 'text-green-600' },
  { label: 'Terjadwal', value: '0', color: 'text-primary-600' },
  { label: 'Selesai', value: '0', color: 'text-surface-500' },
])

const filter = reactive({ status: '', subject: '' })

function getStatusLabel(s: string): string {
  return { draft: 'Draft', scheduled: 'Terjadwal', active: 'Aktif', completed: 'Selesai', cancelled: 'Dibatalkan' }[s] || s
}

function getStatusBadge(s: string): string {
  return {
    draft: 'badge-secondary',
    scheduled: 'badge-warning',
    active: 'badge-success',
    completed: 'badge-primary',
    cancelled: 'badge-danger',
  }[s] || 'badge-secondary'
}

function getExamIconBg(s: string): string {
  return {
    draft: 'bg-surface-100 text-surface-500',
    scheduled: 'bg-amber-100 text-amber-600',
    active: 'bg-green-100 text-green-600',
    completed: 'bg-primary-100 text-primary-600',
  }[s] || 'bg-surface-100 text-surface-500'
}

function formatDateTime(dt: string): string {
  return new Date(dt).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => loadExams(), 400)
}

function toggleDropdown(id: string) {
  openDropdown.value = openDropdown.value === id ? null : id
}

async function copyCode(code: string) {
  await navigator.clipboard.writeText(code)
  // Show brief toast (simplified)
  alert(`Kode "${code}" disalin ke clipboard!`)
}

async function activateExam(exam: Exam) {
  if (!confirm(`Aktifkan ujian "${exam.title}"? Siswa akan bisa mulai mengerjakan segera.`)) return
  try {
    await api.post(`/exams/${exam.id}/activate`)
    await loadExams()
  } catch (err) {
    console.error('Activate failed:', err)
  }
}

async function closeExam(exam: Exam) {
  if (!confirm(`Tutup ujian "${exam.title}"? Siswa yang masih mengerjakan akan dianggap selesai.`)) return
  try {
    await api.post(`/exams/${exam.id}/close`)
    await loadExams()
  } catch (err) {
    console.error('Close exam failed:', err)
  }
}

async function duplicateExam(exam: Exam) {
  openDropdown.value = null
  try {
    await api.post(`/exams/${exam.id}/duplicate`)
    await loadExams()
  } catch (err) {
    console.error('Duplicate failed:', err)
  }
}

async function deleteExam(exam: Exam) {
  openDropdown.value = null
  if (!confirm(`Hapus ujian "${exam.title}"?`)) return
  try {
    await api.delete(`/exams/${exam.id}`)
    await loadExams()
  } catch (err) {
    console.error('Delete failed:', err)
  }
}

async function loadSubjects() {
  try {
    const res = await api.get('/subjects', { params: { per_page: 100 } })
    subjects.value = res.data.data || []
  } catch (err) {
    console.error('Failed to load subjects:', err)
    subjects.value = []
  }
}

async function loadExams() {
  loading.value = true
  try {
    const res = await api.get('/exams', {
      params: {
        search: search.value || undefined,
        status: filter.status || undefined,
        subject_id: filter.subject || undefined,
      }
    })
    exams.value = res.data.data || []
    updateStats()
  } catch (err) {
    console.error('Failed to load exams:', err)
    exams.value = []
    updateStats()
  } finally {
    loading.value = false
  }
}

function updateStats() {
  const total = exams.value.length
  const active = exams.value.filter(e => e.status === 'active').length
  const scheduled = exams.value.filter(e => e.status === 'scheduled').length
  const completed = exams.value.filter(e => e.status === 'completed').length
  stats.value[0].value = String(total)
  stats.value[1].value = String(active)
  stats.value[2].value = String(scheduled)
  stats.value[3].value = String(completed)
}

// Click outside to close dropdown
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement
  if (!target.closest('[ref="dropdownRef"]') && !target.closest('.btn-icon')) {
    openDropdown.value = null
  }
}

onMounted(async () => {
  await Promise.all([loadSubjects(), loadExams()])
  document.addEventListener('click', handleClickOutside)

  // Poll every 30s to update active exam progress
  pollInterval = setInterval(() => {
    if (exams.value.some(e => e.status === 'active')) {
      loadExams()
    }
  }, 30000)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  clearInterval(pollInterval)
})
</script>
