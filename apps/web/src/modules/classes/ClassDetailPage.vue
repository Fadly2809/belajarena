<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="card p-6 bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-900 text-white rounded-3xl shadow-xl border border-white/10">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-black shadow-inner">
            {{ classroom?.name || '7' }}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="badge badge-success text-[10px]">Tahun Ajaran 2024/2025</span>
              <span class="text-xs text-white/70">Semester Ganjil</span>
            </div>
            <h1 class="text-2xl font-black mt-1">Kelas {{ classroom?.name || 'VII A' }} (Fase D)</h1>
            <p class="text-xs text-white/80 mt-0.5">
              Wali Kelas: <strong class="text-amber-300">{{ classroom?.homeroom_teacher_name || 'Muhammad Fadly Akbar Arsandi, S.Pd.' }}</strong> &bull; SMP Negeri 6 Kendari
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <router-link to="/classes" class="btn bg-white/20 hover:bg-white/30 text-white text-xs border border-white/30 rounded-xl transition">
            ← Semua Rombel
          </router-link>
          <button @click="exportRoster" class="btn bg-white text-primary-900 hover:bg-white/90 text-xs font-bold shadow rounded-xl">
            📥 Cetak Presensi & Roster
          </button>
        </div>
      </div>

      <!-- Quick Metrics Realtime (Bukan Dummy) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/15 text-xs">
        <div>
          <p class="text-white/60">Total Siswa Aktif</p>
          <p class="text-xl font-extrabold mt-0.5">{{ students.length }} Siswa</p>
        </div>
        <div>
          <p class="text-white/60">Komposisi Gender</p>
          <p class="text-xl font-extrabold mt-0.5">{{ maleCount }} L / {{ femaleCount }} P</p>
        </div>
        <div>
          <p class="text-white/60">Rata-rata Kehadiran</p>
          <p class="text-xl font-extrabold mt-0.5" :class="classAttendanceRate !== null ? 'text-emerald-300' : 'text-white/50'">
            {{ classAttendanceRate !== null ? `${classAttendanceRate}%` : '—' }}
          </p>
          <p class="text-[10px] text-white/50">{{ classAttendanceRate !== null ? 'Presensi berjalan' : 'Belum ada presensi' }}</p>
        </div>
        <div>
          <p class="text-white/60">Rata-rata Nilai Formatif</p>
          <p class="text-xl font-extrabold mt-0.5" :class="classAvgGrade !== null ? 'text-amber-300' : 'text-white/50'">
            {{ classAvgGrade !== null ? classAvgGrade : '—' }}
          </p>
          <p class="text-[10px] text-white/50">{{ classAvgGrade !== null ? 'Nilai terakumulasi' : 'Belum ada penilaian' }}</p>
        </div>
      </div>
    </div>

    <!-- Tabs: Daftar Siswa / Jadwal Pelajaran -->
    <div class="card space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-surface-100 gap-3">
        <div class="flex items-center gap-2">
          <button
            @click="activeTab = 'students'"
            :class="[
              'px-4 py-2 rounded-xl text-xs font-bold transition',
              activeTab === 'students' ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'text-surface-600 hover:bg-surface-50'
            ]"
          >
            👥 Daftar Peserta Didik ({{ students.length }})
          </button>
          <button
            @click="activeTab = 'schedule'"
            :class="[
              'px-4 py-2 rounded-xl text-xs font-bold transition',
              activeTab === 'schedule' ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'text-surface-600 hover:bg-surface-50'
            ]"
          >
            📅 Jadwal Mingguan
          </button>
        </div>

        <div v-if="activeTab === 'students'" class="w-full sm:w-64">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari NIS atau nama siswa..."
            class="input text-xs py-1.5"
          />
        </div>
      </div>

      <!-- TAB 1: DAFTAR SISWA -->
      <div v-if="activeTab === 'students'" class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="bg-surface-50 text-surface-600 font-semibold uppercase tracking-wider text-[11px]">
              <th class="py-3 px-4 w-12 text-center">No</th>
              <th class="py-3 px-4">NIS / NISN</th>
              <th class="py-3 px-4">Nama Peserta Didik</th>
              <th class="py-3 px-4 text-center">L/P</th>
              <th class="py-3 px-4 text-center">Kehadiran</th>
              <th class="py-3 px-4 text-center">Rata Nilai</th>
              <th class="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            <tr v-for="(st, idx) in filteredStudents" :key="st.id" class="hover:bg-surface-50/50">
              <td class="py-3 px-4 text-center text-surface-400 font-semibold">{{ idx + 1 }}</td>
              <td class="py-3 px-4 font-mono">
                <span class="font-bold text-surface-800">{{ st.nis || '—' }}</span>
                <span class="text-surface-400 block text-[10px]">{{ st.nisn || '—' }}</span>
              </td>
              <td class="py-3 px-4 font-semibold text-surface-900">
                {{ st.name }}
              </td>
              <td class="py-3 px-4 text-center">
                <span
                  :class="[
                    'px-2 py-0.5 rounded text-[10px] font-bold',
                    st.gender === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                  ]"
                >
                  {{ st.gender === 'L' ? 'L' : 'P' }}
                </span>
              </td>
              <td class="py-3 px-4 text-center">
                <span class="font-bold" :class="st.attendance_rate !== null && st.attendance_rate !== undefined ? 'text-emerald-600' : 'text-slate-400'">
                  {{ st.attendance_rate !== null && st.attendance_rate !== undefined ? `${st.attendance_rate}%` : '—' }}
                </span>
              </td>
              <td class="py-3 px-4 text-center font-bold" :class="st.avg_grade !== null && st.avg_grade !== undefined ? 'text-surface-800' : 'text-slate-400'">
                {{ st.avg_grade !== null && st.avg_grade !== undefined ? st.avg_grade : '—' }}
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <router-link
                    :to="`/students/${st.id}`"
                    class="btn-icon btn-ghost text-surface-400 hover:text-primary-600"
                    title="Profil Siswa"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </router-link>
                  <button
                    @click="confirmDeleteStudent(st)"
                    class="btn-icon btn-ghost text-surface-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Hapus Siswa"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredStudents.length === 0">
              <td colspan="7" class="py-12 text-center text-surface-400">
                <div class="flex flex-col items-center justify-center gap-2">
                  <div class="text-3xl">👥</div>
                  <p class="font-bold text-surface-700 text-sm">Belum ada siswa di kelas ini</p>
                  <p class="text-xs text-surface-400">Silakan input data siswa baru melalui menu Data Siswa.</p>
                  <router-link to="/students" class="mt-2 btn-primary btn-sm">
                    + Tambah Siswa
                  </router-link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- TAB 2: JADWAL PELAJARAN MINGGUAN -->
      <div v-else-if="activeTab === 'schedule'" class="overflow-x-auto">
        <div class="p-6 text-center text-surface-400 bg-surface-50 rounded-2xl">
          <p class="text-2xl mb-1">📅</p>
          <p class="font-bold text-surface-700 text-xs">Jadwal Mingguan Kelas {{ classroom?.name || '' }}</p>
          <p class="text-[11px] text-surface-400 mt-0.5">Kelola jadwal pelajaran melalui menu Jadwal Mingguan.</p>
          <router-link to="/schedule" class="mt-3 inline-block btn-secondary btn-sm text-xs">
            Buka Pengaturan Jadwal
          </router-link>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showDeleteModal = false"></div>
        <div class="relative bg-white rounded-3xl shadow-modal w-full max-w-md p-6 space-y-4 animate-scale-up">
          <div class="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
            🗑️
          </div>
          <div class="text-center space-y-1">
            <h3 class="text-lg font-bold text-surface-900">
              Hapus Data Siswa?
            </h3>
            <p class="text-xs text-surface-500 leading-relaxed">
              Apakah Anda yakin ingin menghapus data siswa <strong class="text-surface-800">{{ studentToDelete?.name }}</strong> (NIS: {{ studentToDelete?.nis }}) dari kelas ini?
              Data siswa beserta riwayat nilai dan presensinya akan dihapus dari sistem.
            </p>
          </div>
          <div class="flex gap-2 pt-2">
            <button @click="showDeleteModal = false" class="btn-secondary flex-1 text-xs py-2.5">
              Batal
            </button>
            <button @click="executeDelete" class="btn bg-rose-600 hover:bg-rose-700 text-white font-bold flex-1 text-xs py-2.5 flex items-center justify-center gap-1.5 shadow-sm" :disabled="deleting">
              <span v-if="deleting" class="spinner w-3.5 h-3.5"></span>
              <span>{{ deleting ? 'Menghapus...' : 'Ya, Hapus Data' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const activeTab = ref<'students' | 'schedule'>('students')
const searchQuery = ref('')

const classroom = ref<any>(null)
const students = ref<any[]>([])
const showDeleteModal = ref(false)
const studentToDelete = ref<any>(null)
const deleting = ref(false)

async function loadClassroom() {
  try {
    const classId = route.params.id as string
    const res = await api.get(`/classrooms/${classId}`)
    classroom.value = res.data?.data || null
  } catch (err) {
    console.error('Failed to load classroom detail:', err)
  }
}

async function loadStudents() {
  try {
    const classId = route.params.id as string
    const res = await api.get('/students', { params: { classroom_id: classId } })
    students.value = res.data?.data || []
  } catch (err) {
    console.error('Failed to load class students:', err)
    students.value = []
  }
}

function confirmDeleteStudent(st: any) {
  studentToDelete.value = st
  showDeleteModal.value = true
}

async function executeDelete() {
  if (!studentToDelete.value) return
  deleting.value = true
  try {
    await api.delete(`/students/${studentToDelete.value.id}`)
    showDeleteModal.value = false
    studentToDelete.value = null
    await Promise.all([loadClassroom(), loadStudents()])
  } catch (err: any) {
    console.error('Delete student failed:', err)
    alert('Gagal menghapus siswa: ' + (err.response?.data?.message || err.message))
  } finally {
    deleting.value = false
  }
}

const maleCount = computed(() => students.value.filter(s => s.gender === 'L').length)
const femaleCount = computed(() => students.value.filter(s => s.gender === 'P').length)

const classAttendanceRate = computed(() => {
  const studentsWithRate = students.value.filter(s => s.attendance_rate !== null && s.attendance_rate !== undefined)
  if (studentsWithRate.length === 0) return null
  const total = studentsWithRate.reduce((acc, s) => acc + Number(s.attendance_rate), 0)
  return Math.round(total / studentsWithRate.length)
})

const classAvgGrade = computed(() => {
  const studentsWithGrade = students.value.filter(s => s.avg_grade !== null && s.avg_grade !== undefined)
  if (studentsWithGrade.length === 0) return null
  const total = studentsWithGrade.reduce((acc, s) => acc + Number(s.avg_grade), 0)
  return Math.round((total / studentsWithGrade.length) * 10) / 10
})

const filteredStudents = computed(() => {
  return students.value.filter(s =>
    (s.name || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (s.nis || '').includes(searchQuery.value)
  )
})

function exportRoster() {
  alert('Mengunduh Roster dan Lembar Presensi Kelas...')
}

onMounted(() => {
  loadClassroom()
  loadStudents()
})
</script>
