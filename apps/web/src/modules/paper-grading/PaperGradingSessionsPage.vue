<template>
  <div class="space-y-6">
    <!-- Header Halaman -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 p-6 rounded-2xl text-white shadow-xl">
      <div>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/20">
            📝
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight">Periksa Lembar Jawaban Kertas (AI Vision)</h1>
            <p class="text-xs text-blue-100 mt-0.5">Koreksi tugas & ulangan fisik berbasis AI Gemini Vision dengan persetujuan penuh oleh guru.</p>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="openNewSessionModal"
          class="px-4 py-2.5 bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
        >
          <span class="text-base">+</span> Buat Sesi Baru
        </button>
      </div>
    </div>

    <!-- Ringkasan Statistik -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
          📋
        </div>
        <div>
          <p class="text-xs font-medium text-gray-500">Total Sesi Pemeriksaan</p>
          <p class="text-xl font-bold text-gray-900">{{ sessions.length }} Sesi</p>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl font-bold">
          ✅
        </div>
        <div>
          <p class="text-xs font-medium text-gray-500">Total Nilai Disetujui</p>
          <p class="text-xl font-bold text-green-700">{{ totalApprovedCount }} Lembar</p>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center text-xl font-bold">
          ⏳
        </div>
        <div>
          <p class="text-xs font-medium text-gray-500">Menunggu Persetujuan</p>
          <p class="text-xl font-bold text-yellow-700">{{ totalPendingCount }} Lembar</p>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
          🎯
        </div>
        <div>
          <p class="text-xs font-medium text-gray-500">Rata-rata Nilai Disetujui</p>
          <p class="text-xl font-bold text-indigo-700">{{ overallAvgScore }} / 100</p>
        </div>
      </div>
    </div>

    <!-- Filter & Pencarian -->
    <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3 flex-wrap">
        <select
          v-model="filterClass"
          class="px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Kelas</option>
          <option v-for="c in classrooms" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>

        <select
          v-model="filterType"
          class="px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Jenis (Tugas & Ulangan)</option>
          <option value="assignment">Tugas Siswa</option>
          <option value="exam">Ulangan Harian / Asesmen</option>
        </select>
      </div>

      <button
        @click="fetchSessions"
        class="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
      >
        <span>🔄 Segarkan Data</span>
      </button>
    </div>

    <!-- Daftar Sesi Pemeriksaan -->
    <div v-if="loading" class="text-center py-12">
      <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-xs text-gray-500">Memuat sesi pemeriksaan kertas...</p>
    </div>

    <div v-else-if="filteredSessions.length === 0" class="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
      <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
        📄
      </div>
      <h3 class="text-sm font-bold text-gray-800">Belum Ada Sesi Pemeriksaan Kertas</h3>
      <p class="text-xs text-gray-500 max-w-md mx-auto mt-1 mb-6">
        Buat sesi baru untuk mengoreksi foto atau PDF lembar jawaban siswa menggunakan asisten AI Gemini Vision.
      </p>
      <button
        @click="openNewSessionModal"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
      >
        + Buat Sesi Baru Sekarang
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="sess in filteredSessions"
        :key="sess.id"
        class="bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col overflow-hidden"
      >
        <div class="p-5 flex-1 space-y-4">
          <!-- Header Card -->
          <div class="flex items-start justify-between gap-3">
            <div>
              <span
                class="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wider mb-1.5"
                :class="sess.type === 'assignment' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'"
              >
                {{ sess.type === 'assignment' ? 'Tugas Siswa' : 'Ulangan Harian' }}
              </span>
              <h3 class="text-sm font-bold text-gray-900 line-clamp-1" :title="sess.title">
                {{ sess.title }}
              </h3>
            </div>
            <button
              @click="deleteSession(sess)"
              class="text-gray-400 hover:text-red-600 text-xs p-1"
              title="Hapus Sesi"
            >
              🗑️
            </button>
          </div>

          <!-- Metadata -->
          <div class="text-xs text-gray-500 space-y-1">
            <div class="flex items-center gap-1.5">
              <span>🏫</span> <span class="font-medium text-gray-700">{{ sess.classroom_name }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span>📚</span> <span>{{ sess.subject_name }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span>📅</span> <span>{{ formatDate(sess.created_at) }}</span>
            </div>
          </div>

          <!-- Progress Bar & Status -->
          <div class="space-y-1.5 pt-2 border-t border-gray-100">
            <div class="flex justify-between text-xs">
              <span class="text-gray-500">Disetujui Guru:</span>
              <span class="font-bold text-green-700">{{ sess.approved_count || 0 }} / {{ sess.total_submissions || 0 }} lembar</span>
            </div>
            <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
              <div
                class="bg-green-500 h-full transition-all"
                :style="{ width: getPercent(sess.approved_count, sess.total_submissions) + '%' }"
                title="Disetujui"
              ></div>
              <div
                class="bg-yellow-400 h-full transition-all"
                :style="{ width: getPercent(sess.completed_count, sess.total_submissions) + '%' }"
                title="Menunggu Tinjau"
              ></div>
              <div
                class="bg-blue-400 h-full transition-all"
                :style="{ width: getPercent(sess.queued_count, sess.total_submissions) + '%' }"
                title="Antre/Diproses"
              ></div>
            </div>
          </div>
        </div>

        <!-- Footer Card -->
        <div class="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div class="text-xs">
            <span class="text-gray-400">Rata-rata:</span>
            <span class="font-bold text-gray-800 ml-1">{{ sess.average_score || 0 }}</span>
          </div>
          <router-link
            :to="`/paper-grading/${sess.id}`"
            class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1"
          >
            <span>Buka Sesi</span> <span>→</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Modal Buat Sesi Baru -->
    <div v-if="showNewModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up">
        <div class="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <h3 class="text-base font-bold">Buat Sesi Pemeriksaan Kertas Baru</h3>
          <button @click="showNewModal = false" class="text-white/80 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="createSession" class="p-6 space-y-4">
          <!-- Jenis Sesi -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">Jenis Penilaian:</label>
            <div class="grid grid-cols-2 gap-3">
              <label
                class="flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all"
                :class="newForm.type === 'assignment' ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold' : 'border-gray-200 text-gray-600'"
              >
                <input type="radio" v-model="newForm.type" value="assignment" class="text-blue-600" />
                <span class="text-xs">Tugas Siswa (Formatif)</span>
              </label>

              <label
                class="flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all"
                :class="newForm.type === 'exam' ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold' : 'border-gray-200 text-gray-600'"
              >
                <input type="radio" v-model="newForm.type" value="exam" class="text-blue-600" />
                <span class="text-xs">Ulangan Harian (Sumatif)</span>
              </label>
            </div>
          </div>

          <!-- Judul Sesi -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Judul Penilaian Kertas:</label>
            <input
              v-model="newForm.title"
              type="text"
              required
              placeholder="Contoh: Ulangan Harian Bab 2 Jaringan Komputer"
              class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Kelas -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Kelas:</label>
            <select
              v-model="newForm.classroom_id"
              required
              class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>Pilih Kelas</option>
              <option v-for="c in classrooms" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>

          <!-- Mata Pelajaran -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Mata Pelajaran:</label>
            <select
              v-model="newForm.subject_id"
              required
              class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="sub-inf">Informatika</option>
              <option value="sub-kka">KKA (Koding & Kecerdasan Artifisial)</option>
            </select>
          </div>

          <div class="bg-blue-50 p-3 rounded-xl text-xs text-blue-900">
            ℹ️ Rubrik penilaian awal akan dibuat secara otomatis (Soal 1–5). Anda dapat menyunting dan menyesuaikan kunci jawaban serta bobot soal setelah sesi dibuat.
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              @click="showNewModal = false"
              class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="creating"
              class="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all flex items-center gap-1.5"
            >
              <span v-if="creating">Membuat...</span>
              <span v-else>Buat Sesi & Buka</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const sessions = ref<any[]>([])
const classrooms = ref<any[]>([])
const loading = ref(false)
const creating = ref(false)

const filterClass = ref('')
const filterType = ref('')

const showNewModal = ref(false)
const newForm = ref({
  title: '',
  type: 'assignment',
  ref_id: '',
  classroom_id: '',
  subject_id: 'sub-inf'
})

const filteredSessions = computed(() => {
  return sessions.value.filter(s => {
    if (filterClass.value && s.classroom_id !== filterClass.value) return false
    if (filterType.value && s.type !== filterType.value) return false
    return true
  })
})

const totalApprovedCount = computed(() => {
  return sessions.value.reduce((sum, s) => sum + (s.approved_count || 0), 0)
})

const totalPendingCount = computed(() => {
  return sessions.value.reduce((sum, s) => sum + (s.completed_count || 0), 0)
})

const overallAvgScore = computed(() => {
  const scored = sessions.value.filter(s => s.average_score > 0)
  if (scored.length === 0) return 0
  const sum = scored.reduce((a, s) => a + s.average_score, 0)
  return Math.round((sum / scored.length) * 10) / 10
})

function getAuthToken(): string {
  return localStorage.getItem('auth_token') || ''
}

async function fetchClassrooms() {
  try {
    const res = await fetch('/api/v1/classrooms', {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })
    if (res.ok) {
      const data = await res.json()
      classrooms.value = data.data || []
    }
  } catch (err) {
    console.warn('Failed to fetch classrooms:', err)
  }
}

async function fetchSessions() {
  loading.value = true
  try {
    const res = await fetch('/api/v1/grading/sessions', {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })
    if (res.ok) {
      const data = await res.json()
      sessions.value = data.data || []
    }
  } catch (err) {
    console.error('Failed to fetch grading sessions:', err)
  } finally {
    loading.value = false
  }
}

function openNewSessionModal() {
  newForm.value = {
    title: '',
    type: 'assignment',
    ref_id: '',
    classroom_id: classrooms.value[0]?.id || '',
    subject_id: 'sub-inf'
  }
  showNewModal.value = true
}

async function createSession() {
  creating.value = true
  try {
    const res = await fetch('/api/v1/grading/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(newForm.value)
    })
    if (res.ok) {
      const result = await res.json()
      showNewModal.value = false
      router.push(`/paper-grading/${result.data.id}`)
    } else {
      const err = await res.json()
      alert(err.message || 'Gagal membuat sesi pemeriksaan kertas.')
    }
  } catch (err) {
    alert('Terjadi kesalahan jaringan.')
  } finally {
    creating.value = false
  }
}

async function deleteSession(sess: any) {
  if (!confirm(`Hapus sesi "${sess.title}" beserta seluruh berkas lembar jawabannya?`)) return
  try {
    const res = await fetch(`/api/v1/grading/sessions/${sess.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })
    if (res.ok) {
      await fetchSessions()
    }
  } catch (err) {
    alert('Gagal menghapus sesi.')
  }
}

function getPercent(val: number, total: number): number {
  if (!total || total === 0) return 0
  return Math.min(100, Math.round(((val || 0) / total) * 100))
}

function formatDate(iso: string): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

onMounted(async () => {
  await fetchClassrooms()
  await fetchSessions()

  // Cek apakah ada query param dari tombol "Periksa Kertas"
  const qType = route.query.type as string
  const qRefId = route.query.refId as string
  const qTitle = route.query.title as string
  const qClassId = route.query.classroomId as string

  if (qTitle || qRefId) {
    newForm.value = {
      title: qTitle ? `Periksa Kertas: ${qTitle}` : 'Pemeriksaan Kertas Tugas/Ulangan',
      type: qType === 'exam' ? 'exam' : 'assignment',
      ref_id: qRefId || '',
      classroom_id: qClassId || classrooms.value[0]?.id || '',
      subject_id: 'sub-inf'
    }
    showNewModal.value = true
  }
})
</script>

<style scoped>
@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-scale-up {
  animation: scaleUp 0.2s ease-out;
}
</style>

