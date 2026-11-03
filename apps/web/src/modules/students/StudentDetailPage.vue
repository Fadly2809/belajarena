<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="card p-8 animate-pulse space-y-4">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-2xl bg-surface-200"></div>
        <div class="space-y-2 flex-1">
          <div class="h-5 bg-surface-200 rounded w-1/3"></div>
          <div class="h-3 bg-surface-200 rounded w-1/4"></div>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <div class="h-24 bg-surface-200 rounded-xl"></div>
        <div class="h-24 bg-surface-200 rounded-xl"></div>
        <div class="h-24 bg-surface-200 rounded-xl"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="!student || errorMsg" class="card p-12 text-center space-y-4">
      <div class="text-4xl">⚠️</div>
      <h2 class="text-lg font-bold text-surface-900">Data Siswa Tidak Ditemukan</h2>
      <p class="text-xs text-surface-500 max-w-md mx-auto">
        Data peserta didik yang Anda cari belum terdaftar atau telah dihapus dari sistem.
      </p>
      <RouterLink to="/students" class="btn btn-primary text-xs inline-flex items-center gap-2">
        <span>← Kembali ke Data Siswa</span>
      </RouterLink>
    </div>

    <!-- Data Siswa Nyata -->
    <template v-else>
      <!-- Header -->
      <div class="card p-6 bg-white border border-surface-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center text-3xl font-black">
            {{ student.gender === 'L' ? '👦' : '👧' }}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="badge badge-primary text-[10px]">Kelas {{ getStudentClassName(student) }} &bull; Fase D</span>
              <span class="badge text-[10px]" :class="student.status === 'active' ? 'badge-success' : 'badge-secondary'">
                {{ student.status === 'active' ? 'Siswa Aktif' : 'Tidak Aktif' }}
              </span>
            </div>
            <h1 class="text-xl font-bold text-surface-900 mt-1">
              {{ student.name }}
            </h1>
            <p class="text-xs text-surface-500">
              NIS: <span class="font-mono font-bold">{{ student.nis || '—' }}</span> &bull; 
              NISN: <span class="font-mono font-bold">{{ student.nisn || '—' }}</span>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <RouterLink to="/students" class="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
            ← Daftar Siswa
          </RouterLink>
          <RouterLink to="/reports/grades" class="btn btn-primary text-xs px-4 py-1.5 font-bold shadow-sm">
            📄 Rekap Nilai
          </RouterLink>
          <button
            @click="showDeleteModal = true"
            class="btn bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs px-3 py-1.5 font-bold flex items-center gap-1.5 transition"
            title="Hapus Siswa"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Hapus Siswa
          </button>
        </div>
      </div>

      <!-- 3 Quick Stats Real (Bukan Dummy) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- 1. Kehadiran -->
        <div class="card p-4 flex items-center justify-between">
          <div>
            <p class="text-xs text-surface-500 font-medium">Persentase Kehadiran</p>
            <p class="text-2xl font-black mt-1" :class="student.attendance_rate !== null && student.attendance_rate !== undefined ? 'text-emerald-600' : 'text-slate-400'">
              {{ student.attendance_rate !== null && student.attendance_rate !== undefined ? `${student.attendance_rate}%` : '—' }}
            </p>
            <p class="text-[11px] text-surface-400 mt-0.5">
              {{ student.attendance_count ? `${student.attendance_count} Catatan presensi` : 'Belum ada catatan presensi' }}
            </p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            📅
          </div>
        </div>

        <!-- 2. Rata-rata Nilai -->
        <div class="card p-4 flex items-center justify-between">
          <div>
            <p class="text-xs text-surface-500 font-medium">Rata-rata Nilai Formatif</p>
            <p class="text-2xl font-black mt-1" :class="student.avg_grade !== null && student.avg_grade !== undefined ? 'text-primary-600' : 'text-slate-400'">
              {{ student.avg_grade !== null && student.avg_grade !== undefined ? student.avg_grade : '—' }}
            </p>
            <p class="text-[11px] mt-0.5" :class="student.avg_grade ? 'text-emerald-600 font-semibold' : 'text-surface-400'">
              {{ student.avg_grade ? getGradePredicate(student.avg_grade) : 'Belum ada nilai penilaian' }}
            </p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-xl">
            🎯
          </div>
        </div>

        <!-- 3. Profil Karakter -->
        <div class="card p-4 flex items-center justify-between">
          <div>
            <p class="text-xs text-surface-500 font-medium">Karakter Pelajar Pancasila</p>
            <p class="text-lg font-black text-surface-900 mt-1">
              {{ student.character_note || 'Dalam Observasi' }}
            </p>
            <p class="text-[11px] text-surface-400 mt-0.5">
              {{ student.character_note ? 'Dimensi teramati' : 'Belum ada catatan observasi guru' }}
            </p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
            🌟
          </div>
        </div>
      </div>

      <!-- Biodata Lengkap -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card space-y-4">
          <h2 class="font-bold text-surface-900 text-sm pb-2 border-b border-surface-100 flex items-center gap-2">
            <span>👤</span> Data Pribadi Peserta Didik
          </h2>
          <table class="w-full text-xs text-surface-700">
            <tbody class="divide-y divide-surface-100">
              <tr>
                <td class="py-2.5 text-surface-500 w-44">Nama Lengkap</td>
                <td class="py-2.5 font-bold text-surface-900">{{ student.name }}</td>
              </tr>
              <tr>
                <td class="py-2.5 text-surface-500">Nomor Induk Siswa (NIS)</td>
                <td class="py-2.5 font-medium font-mono text-surface-900">{{ student.nis || '—' }}</td>
              </tr>
              <tr>
                <td class="py-2.5 text-surface-500">NISN</td>
                <td class="py-2.5 font-medium font-mono text-surface-900">{{ student.nisn || '—' }}</td>
              </tr>
              <tr>
                <td class="py-2.5 text-surface-500">Kelas / Rombel</td>
                <td class="py-2.5 font-medium text-surface-900">
                  <span class="badge badge-primary">Kelas {{ getStudentClassName(student) }}</span>
                </td>
              </tr>
              <tr>
                <td class="py-2.5 text-surface-500">Tempat, Tanggal Lahir</td>
                <td class="py-2.5 font-medium text-surface-900">
                  {{ formatBirth(student.birth_place, student.birth_date) }}
                </td>
              </tr>
              <tr>
                <td class="py-2.5 text-surface-500">Jenis Kelamin</td>
                <td class="py-2.5 font-medium text-surface-900">
                  {{ student.gender === 'L' ? 'Laki-Laki' : 'Perempuan' }}
                </td>
              </tr>
              <tr>
                <td class="py-2.5 text-surface-500">Alamat Tempat Tinggal</td>
                <td class="py-2.5 font-medium text-surface-900">{{ student.address || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card space-y-4">
          <h2 class="font-bold text-surface-900 text-sm pb-2 border-b border-surface-100 flex items-center gap-2">
            <span>👨‍👩‍👦</span> Data Orang Tua & Wali Kelas
          </h2>
          <table class="w-full text-xs text-surface-700">
            <tbody class="divide-y divide-surface-100">
              <tr>
                <td class="py-2.5 text-surface-500 w-44">Nama Orang Tua / Wali</td>
                <td class="py-2.5 font-medium text-surface-900">{{ student.parent_name || '—' }}</td>
              </tr>
              <tr>
                <td class="py-2.5 text-surface-500">Nomor Telepon / WhatsApp</td>
                <td class="py-2.5 font-medium font-mono text-primary-600">
                  {{ student.parent_phone || student.phone || '—' }}
                </td>
              </tr>
              <tr>
                <td class="py-2.5 text-surface-500">Wali Kelas Pembina</td>
                <td class="py-2.5 font-medium text-surface-900">
                  {{ homeroomTeacherName }}
                </td>
              </tr>
              <tr>
                <td class="py-2.5 text-surface-500">Guru Mata Pelajaran</td>
                <td class="py-2.5 font-medium text-surface-900">
                  Muhammad Fadly Akbar Arsandi, S.Pd. (Informatika & KKA)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- KARTU MANAJEMEN AKUN LOGIN SISWA -->
      <div class="card p-6 bg-gradient-to-br from-white via-surface-50 to-primary-50/20 border-2 border-primary-100 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-surface-200">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center text-lg font-bold shadow-sm">
              🔐
            </div>
            <div>
              <h2 class="text-sm font-bold text-surface-900">Manajemen Akun Login Siswa</h2>
              <p class="text-xs text-surface-500">Kredensial akses portal CBT, ulangan gamifikasi, dan pembelajaran digital</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button
              @click="showResetPassModal = true"
              class="btn btn-primary text-xs px-3.5 py-1.5 font-bold shadow-xs flex items-center gap-1.5"
            >
              <span>🔑</span>
              <span>Ganti / Reset Password</span>
            </button>
            <button
              @click="toggleAccountActive"
              class="btn text-xs px-3 py-1.5 font-bold flex items-center gap-1.5 transition"
              :class="student.is_active !== false && student.status !== 'inactive'
                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'"
            >
              <span>{{ student.is_active !== false && student.status !== 'inactive' ? '🔒 Bekukan Akun' : '🔓 Aktifkan Akun' }}</span>
            </button>
            <button
              @click="copyCredentials"
              class="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
              title="Salin username dan password ke clipboard"
            >
              <span>📋</span>
              <span>Salin Akun</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <!-- Username -->
          <div class="p-3.5 rounded-xl bg-white border border-surface-200">
            <span class="text-[10px] text-surface-400 font-bold uppercase tracking-wider block">Username Login</span>
            <div class="flex items-center justify-between mt-1">
              <span class="font-mono font-black text-sm text-surface-900">
                {{ student.username || student.nis }}
              </span>
              <span class="text-[10px] text-surface-400">NIS</span>
            </div>
          </div>

          <!-- Password -->
          <div class="p-3.5 rounded-xl bg-white border border-surface-200">
            <span class="text-[10px] text-surface-400 font-bold uppercase tracking-wider block">Kata Sandi (Password)</span>
            <div class="flex items-center justify-between mt-1">
              <span v-if="showPassword" class="font-mono font-black text-sm text-primary-700">
                {{ student.password || student.nis || 'password' }}
              </span>
              <span v-else class="font-mono text-sm text-surface-400">
                ••••••••
              </span>
              <button
                @click="showPassword = !showPassword"
                class="text-xs text-surface-500 hover:text-surface-800 p-1"
                :title="showPassword ? 'Sembunyikan' : 'Lihat password'"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <!-- Status Login -->
          <div class="p-3.5 rounded-xl bg-white border border-surface-200">
            <span class="text-[10px] text-surface-400 font-bold uppercase tracking-wider block">Status Akses Login</span>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="w-2 h-2 rounded-full" :class="student.is_active !== false && student.status !== 'inactive' ? 'bg-emerald-500' : 'bg-rose-500'"></span>
              <span class="font-bold text-xs" :class="student.is_active !== false && student.status !== 'inactive' ? 'text-emerald-700' : 'text-rose-700'">
                {{ student.is_active !== false && student.status !== 'inactive' ? 'Aktif (Dapat Login)' : 'Dinonaktifkan' }}
              </span>
            </div>
          </div>

          <!-- URL Portal -->
          <div class="p-3.5 rounded-xl bg-white border border-surface-200">
            <span class="text-[10px] text-surface-400 font-bold uppercase tracking-wider block">Portal Siswa</span>
            <p class="font-mono text-[11px] text-primary-600 truncate mt-1">
              http://localhost:5173/login
            </p>
          </div>
        </div>
      </div>
    </template>

    <!-- Reset Password Modal -->
    <Teleport to="body">
      <div v-if="showResetPassModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showResetPassModal = false"></div>
        <div class="relative bg-white rounded-3xl shadow-modal w-full max-w-md p-6 space-y-4 animate-scale-up text-xs">
          <div class="flex items-center gap-3 pb-3 border-b border-surface-100">
            <span class="text-2xl">🔑</span>
            <div>
              <h3 class="font-bold text-surface-900 text-sm">Ganti / Reset Kata Sandi Siswa</h3>
              <p class="text-[11px] text-surface-500">{{ student?.name }} &bull; NIS: {{ student?.nis }}</p>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <label class="label text-[11px]">Kata Sandi Baru</label>
              <div class="flex gap-1.5">
                <input
                  v-model="newPasswordInput"
                  :type="showNewPass ? 'text' : 'password'"
                  class="input text-xs font-mono font-bold flex-1"
                  placeholder="Masukkan password baru"
                />
                <button
                  type="button"
                  @click="showNewPass = !showNewPass"
                  class="btn btn-secondary text-xs px-2.5"
                >
                  {{ showNewPass ? '🙈' : '👁️' }}
                </button>
                <button
                  type="button"
                  @click="newPasswordInput = generateRandomPass()"
                  class="btn btn-secondary text-xs px-2.5 whitespace-nowrap"
                >
                  🎲 Acak
                </button>
              </div>
            </div>

            <div class="flex gap-2 text-[11px]">
              <button
                type="button"
                @click="newPasswordInput = student?.nis || '123456'"
                class="text-primary-600 hover:underline"
              >
                Gunakan NIS ({{ student?.nis }})
              </button>
              <span class="text-surface-300">&bull;</span>
              <button
                type="button"
                @click="newPasswordInput = 'password'"
                class="text-primary-600 hover:underline"
              >
                Gunakan 'password'
              </button>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-surface-100">
            <button @click="showResetPassModal = false" class="btn-secondary text-xs px-3.5 py-2">Batal</button>
            <button
              @click="saveNewPassword"
              :disabled="savingPass || !newPasswordInput.trim()"
              class="btn-primary text-xs px-4 py-2 font-bold flex items-center gap-1.5 shadow-sm"
            >
              <span v-if="savingPass" class="spinner w-3 h-3"></span>
              <span>Simpan Kata Sandi</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

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
              Apakah Anda yakin ingin menghapus data siswa <strong class="text-surface-800">{{ student?.name }}</strong> (NIS: {{ student?.nis }})?
              Data siswa beserta riwayat nilai dan catatan kehadirannya akan dihapus permanen.
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
import { useRoute, useRouter, RouterLink } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const errorMsg = ref('')
const student = ref<any>(null)
const classrooms = ref<any[]>([])
const showDeleteModal = ref(false)
const deleting = ref(false)

// Manajemen Akun Siswa
const showResetPassModal = ref(false)
const showPassword = ref(false)
const showNewPass = ref(false)
const newPasswordInput = ref('')
const savingPass = ref(false)

function generateRandomPass() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  let res = ''
  for (let i = 0; i < 6; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return res
}

function copyCredentials() {
  if (!student.value) return
  const u = student.value.username || student.value.nis
  const p = student.value.password || student.value.nis || 'password'
  const text = `Portal Siswa SMPN 6 Kendari\nNama: ${student.value.name}\nNIS / Username: ${u}\nKata Sandi: ${p}\nLogin di: ${window.location.origin}/login`
  navigator.clipboard.writeText(text).then(() => {
    alert('Kredensial akun siswa berhasil disalin ke clipboard! 📋')
  }).catch(() => {
    prompt('Salin kredensial akun siswa:', text)
  })
}

async function saveNewPassword() {
  if (!student.value || !newPasswordInput.value.trim()) return
  savingPass.value = true
  try {
    await api.post(`/students/${student.value.id}/reset-password`, {
      password: newPasswordInput.value.trim()
    })
    student.value.password = newPasswordInput.value.trim()
    showResetPassModal.value = false
    newPasswordInput.value = ''
    alert('Kata sandi siswa berhasil diperbarui!')
  } catch (err: any) {
    console.error('Reset password failed:', err)
    alert('Gagal mengubah password: ' + (err.response?.data?.message || err.message))
  } finally {
    savingPass.value = false
  }
}

async function toggleAccountActive() {
  if (!student.value) return
  const currentActive = student.value.is_active !== false && student.value.status !== 'inactive'
  const confirmMsg = currentActive
    ? `Bekukan akun siswa ${student.value.name}? Siswa tidak akan bisa login ke portal CBT & materi.`
    : `Aktifkan kembali akun siswa ${student.value.name}?`
  if (!confirm(confirmMsg)) return

  try {
    const res = await api.post(`/students/${student.value.id}/toggle-status`)
    if (res.data?.data) {
      student.value.is_active = res.data.data.is_active
      student.value.status = res.data.data.status
    } else {
      student.value.is_active = !currentActive
      student.value.status = !currentActive ? 'active' : 'inactive'
    }
  } catch (err: any) {
    console.error('Toggle status failed:', err)
    alert('Gagal mengubah status akun: ' + (err.response?.data?.message || err.message))
  }
}

async function executeDelete() {
  if (!student.value) return
  deleting.value = true
  try {
    await api.delete(`/students/${student.value.id}`)
    showDeleteModal.value = false
    router.push('/students')
  } catch (err: any) {
    console.error('Delete student failed:', err)
    alert('Gagal menghapus siswa: ' + (err.response?.data?.message || err.message))
  } finally {
    deleting.value = false
  }
}

async function loadClassrooms() {
  try {
    const res = await api.get('/classrooms')
    classrooms.value = res.data?.data || []
  } catch {
    classrooms.value = []
  }
}

async function loadStudent() {
  loading.value = true
  errorMsg.value = ''
  try {
    const studentId = route.params.id as string
    const res = await api.get(`/students/${studentId}`)
    student.value = res.data?.data || null
    if (!student.value) {
      errorMsg.value = 'Data siswa tidak ditemukan'
    }
  } catch (err: any) {
    console.error('Failed to load student detail:', err)
    errorMsg.value = err.response?.data?.message || 'Data siswa tidak ditemukan'
    student.value = null
  } finally {
    loading.value = false
  }
}

const homeroomTeacherName = computed(() => {
  if (!student.value) return '—'
  const matchedClass = classrooms.value.find(c => c.id === student.value.classroom_id || c.name === student.value.classroom_name)
  return matchedClass?.homeroom_teacher_name || 'Muhammad Fadly Akbar Arsandi, S.Pd.'
})

function getStudentClassName(s: any): string {
  if (!s) return '—'
  if (s.classroom_id) {
    const cls = classrooms.value.find(c => c.id === s.classroom_id)
    if (cls) return cls.name
  }
  return s.classroom_name || s.classroom || '—'
}

function formatBirth(place?: string, date?: string) {
  if (!place && !date) return '—'
  if (place && !date) return place
  if (!place && date) return date
  return `${place}, ${date}`
}

function getGradePredicate(score: number): string {
  if (score >= 90) return 'Predikat A (Sangat Baik)'
  if (score >= 80) return 'Predikat B (Baik / Tuntas)'
  if (score >= 75) return 'Predikat C (Cukup / Tuntas)'
  return 'Predikat D (Perlu Pendampingan)'
}

onMounted(async () => {
  await Promise.all([loadClassrooms(), loadStudent()])
})
</script>
