<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span>🏫</span> Manajemen Kelas (Rombongan Belajar)
        </h1>
        <p class="text-slate-600 text-sm mt-1 font-medium">
          Data kelas, wali kelas pembina, dan distribusi siswa SMP Negeri 6 Kendari
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="openCreateModal" class="px-4 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#082231] text-white font-bold text-xs shadow-md transition flex items-center gap-2">
          <span>➕</span> Tambah Kelas Baru
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div v-for="i in 4" :key="i" class="card animate-pulse p-5">
        <div class="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
        <div class="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
        <div class="h-3 bg-slate-200 rounded w-2/3"></div>
      </div>
    </div>

    <template v-else>
      <!-- Quick Stat Cards Row (Theme Petrol & Honey) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="card-stat-petrol group">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-300">Total Kelas Aktif</span>
              <div class="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-base shadow-inner">
                🏛️
              </div>
            </div>
            <div class="mt-3">
              <div class="text-3xl font-black text-white tracking-tight leading-none">{{ classrooms.length }} Kelas</div>
              <p class="text-[11px] text-slate-300 font-medium mt-1">Semester Genap · 2026/2027</p>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300/90 group-hover:text-white transition">
            <span>Rombongan belajar terdaftar</span>
            <span class="font-bold transition-transform group-hover:translate-x-1">→</span>
          </div>
        </div>

        <div class="card-stat-honey group">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-900/80">Total Siswa Terdaftar</span>
              <div class="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center text-slate-950 text-base shadow-inner">
                👥
              </div>
            </div>
            <div class="mt-3">
              <div class="text-3xl font-black text-slate-950 tracking-tight leading-none">{{ totalStudents }} Siswa</div>
              <p class="text-[11px] text-slate-900/80 font-semibold mt-1">Terdistribusi aktif di kelas</p>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-xs text-slate-900/80 group-hover:text-slate-950 font-bold transition">
            <RouterLink to="/students" class="flex items-center justify-between w-full">
              <span>Buka direktori siswa</span>
              <span class="font-black transition-transform group-hover:translate-x-1">→</span>
            </RouterLink>
          </div>
        </div>

        <div class="card-stat-petrol group">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-300">Rata-rata Kapasitas</span>
              <div class="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-base shadow-inner">
                📊
              </div>
            </div>
            <div class="mt-3">
              <div class="text-3xl font-black text-white tracking-tight leading-none">{{ avgCapacity }}</div>
              <p class="text-[11px] text-slate-300 font-medium mt-1">Siswa per rombongan belajar</p>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300/90 group-hover:text-white transition">
            <span>Kapasitas optimal kelas</span>
            <span class="font-bold transition-transform group-hover:translate-x-1">→</span>
          </div>
        </div>

        <div class="card-stat-dark group">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-300">Wali Kelas Terisi</span>
              <div class="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-base shadow-inner">
                👨‍🏫
              </div>
            </div>
            <div class="mt-3">
              <div class="text-3xl font-black text-white tracking-tight leading-none">{{ homeroomAssignedCount }} / {{ classrooms.length }}</div>
              <p class="text-[11px] text-slate-300 font-medium mt-1">Guru pembina terplot</p>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300/90 group-hover:text-white transition">
            <span>Status pembina kelas</span>
            <span class="font-bold transition-transform group-hover:translate-x-1">→</span>
          </div>
        </div>
      </div>

      <!-- Filter by Grade -->
      <div class="flex items-center gap-2 flex-wrap">
        <button
          v-for="g in gradeOptions"
          :key="g.value"
          @click="filterGrade = g.value"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs',
            filterGrade === g.value
              ? 'bg-[#0c2b3d] text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
          ]"
        >
          {{ g.label }}
        </button>
      </div>

      <!-- Error state -->
      <div v-if="error" class="card p-6 text-center">
        <p class="text-red-500 font-medium">{{ error }}</p>
        <button @click="loadClassrooms" class="btn-secondary mt-3">Coba Lagi</button>
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredClassrooms.length === 0 && !loading" class="card">
        <div class="empty-state py-12">
          <svg class="w-16 h-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          <p class="text-slate-800 font-bold">Belum ada data kelas</p>
          <p class="text-slate-500 text-sm mt-1">Tambahkan kelas baru untuk memulai</p>
          <button @click="openCreateModal" class="px-4 py-2 rounded-xl bg-[#0c2b3d] text-white font-bold text-xs mt-4">Tambah Kelas</button>
        </div>
      </div>

      <!-- Classroom Cards Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="cls in filteredClassrooms"
          :key="cls.id"
          class="bg-white rounded-[24px] shadow-card border border-slate-200/60 p-5 sm:p-6 hover:shadow-card-hover transition-all flex flex-col justify-between"
        >
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="w-11 h-11 rounded-2xl bg-[#0c2b3d]/10 text-[#0c2b3d] font-black text-sm flex items-center justify-center border border-[#0c2b3d]/15">
                  {{ cls.name?.substring(0, 3) }}
                </span>
                <div>
                  <h2 class="font-extrabold text-slate-900 text-base leading-snug">Kelas {{ cls.name }}</h2>
                  <p class="text-[11px] text-slate-500 font-medium">{{ cls.grade_level ? `Tingkat ${cls.grade_level}` : '' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <button @click="openEditModal(cls)" class="p-2 rounded-lg text-slate-400 hover:text-[#0c2b3d] hover:bg-slate-100 transition" title="Edit">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button @click="confirmDelete(cls)" class="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition" title="Hapus">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="bg-[#0c2b3d]/5 border border-[#0c2b3d]/10 rounded-2xl p-3 text-center">
                <p class="text-2xl font-black text-[#0c2b3d]">{{ cls.students_count ?? cls.student_count ?? 0 }}</p>
                <p class="text-[11px] text-slate-500 font-semibold mt-0.5">Siswa Terdaftar</p>
              </div>
              <div class="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
                <p class="text-2xl font-black text-slate-800">{{ cls.capacity ?? '—' }}</p>
                <p class="text-[11px] text-slate-500 font-semibold mt-0.5">Kapasitas</p>
              </div>
            </div>

            <div class="space-y-1 bg-slate-50/70 border border-slate-100 rounded-xl p-3">
              <p class="text-[11px] text-slate-400 font-medium">Wali Kelas Pembina</p>
              <p class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>👨‍🏫</span> {{ cls.homeroom_teacher?.name || cls.homeroom_teacher_name || '—' }}
              </p>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100">
            <RouterLink
              :to="`/classes/${cls.id}`"
              class="w-full py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#082231] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 text-center"
            >
              <span>Detail Kelas</span>
              <span>→</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </template>

    <!-- Create / Edit Modal -->
    <Teleport to="body">
      <div v-if="showFormModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeFormModal"></div>
        <div class="relative bg-white rounded-3xl shadow-modal w-full max-w-lg">
          <div class="p-6 border-b border-surface-100">
            <h2 class="text-lg font-bold text-surface-900">
              {{ editingClass ? 'Edit Kelas' : 'Tambah Kelas Baru' }}
            </h2>
          </div>
          <form @submit.prevent="submitForm" class="p-6 space-y-4">
            <div>
              <label class="label">Nama Kelas <span class="text-red-500">*</span></label>
              <input v-model="form.name" type="text" class="input" :class="{ 'input-error': formErrors.name }" placeholder="Contoh: VII-A, VIII-B" />
              <p v-if="formErrors.name" class="error-msg">{{ formErrors.name }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Tingkat / Kelas</label>
                <select v-model="form.grade_level" class="input">
                  <option value="">Pilih tingkat...</option>
                  <option value="7">Kelas 7</option>
                  <option value="8">Kelas 8</option>
                  <option value="9">Kelas 9</option>
                </select>
              </div>
              <div>
                <label class="label">Kapasitas Siswa</label>
                <input v-model="form.capacity" type="number" class="input" min="1" max="40" placeholder="32" />
              </div>
            </div>
            <div>
              <label class="label">Nama Wali Kelas</label>
              <input
                v-model="form.homeroom_teacher_name"
                type="text"
                class="input"
                placeholder="Contoh: Muhammad Fadly Akbar Arsandi, S.Pd."
                list="teachersList"
              />
              <datalist id="teachersList">
                <option value="Muhammad Fadly Akbar Arsandi, S.Pd." />
                <option value="Siti Rahmawati, M.Pd." />
                <option value="Drs. Hendro Wibowo" />
                <option value="Nurul Hidayati, S.Si." />
              </datalist>
              <p class="text-[11px] text-surface-400 mt-1">Pilih dari rekomendasi atau ketik langsung nama guru beserta gelar.</p>
            </div>
            <div>
              <label class="label">Ruangan</label>
              <input v-model="form.room" type="text" class="input" placeholder="Ruang 8A, Lab Komputer..." />
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="closeFormModal" class="btn-secondary">Batal</button>
              <button type="submit" class="btn-primary" :disabled="saving">
                <svg v-if="saving" class="spinner w-4 h-4" viewBox="0 0 24 24"></svg>
                {{ editingClass ? 'Simpan Perubahan' : 'Tambah Kelas' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirm Modal -->
    <Teleport to="body">
      <div v-if="deletingClass" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="deletingClass = null"></div>
        <div class="relative bg-white rounded-3xl shadow-modal w-full max-w-sm p-6">
          <h2 class="text-lg font-bold text-surface-900 mb-2">Hapus Kelas?</h2>
          <p class="text-sm text-surface-500 mb-6">
            Kelas <strong>{{ deletingClass.name }}</strong> akan dihapus. Tindakan ini tidak dapat dibatalkan.
          </p>
          <div class="flex justify-end gap-3">
            <button @click="deletingClass = null" class="btn-secondary">Batal</button>
            <button @click="deleteClassroom" class="btn-danger" :disabled="deleting">
              <svg v-if="deleting" class="spinner w-4 h-4" viewBox="0 0 24 24"></svg>
              Hapus
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/services/api'

interface Classroom {
  id: string
  name: string
  grade_level?: number
  capacity?: number
  room?: string
  students_count?: number
  student_count?: number
  homeroom_teacher?: { name: string }
  homeroom_teacher_name?: string
}

const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const filterGrade = ref('all')
const showFormModal = ref(false)
const editingClass = ref<Classroom | null>(null)
const deletingClass = ref<Classroom | null>(null)
const classrooms = ref<Classroom[]>([])

const gradeOptions = [
  { value: 'all', label: 'Semua Tingkat' },
  { value: '7', label: 'Kelas 7' },
  { value: '8', label: 'Kelas 8' },
  { value: '9', label: 'Kelas 9' },
]

const form = reactive({
  name: '',
  grade_level: '',
  capacity: 32,
  room: '',
  homeroom_teacher_name: '',
})

const formErrors = reactive({ name: '' })

const filteredClassrooms = computed(() => {
  if (filterGrade.value === 'all') return classrooms.value
  return classrooms.value.filter(c => c.grade_level?.toString() === filterGrade.value)
})

const totalStudents = computed(() =>
  classrooms.value.reduce((sum, c) => sum + (c.students_count ?? c.student_count ?? 0), 0)
)

const avgCapacity = computed(() => {
  if (!classrooms.value.length) return '—'
  const total = classrooms.value.reduce((sum, c) => sum + (c.capacity ?? 0), 0)
  return Math.round(total / classrooms.value.length) || '—'
})

const homeroomAssignedCount = computed(() =>
  classrooms.value.filter(c => c.homeroom_teacher?.name || c.homeroom_teacher_name).length
)

async function loadClassrooms() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/classrooms', { params: { per_page: 100 } })
    classrooms.value = res.data.data || []
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Gagal memuat data kelas. Periksa koneksi ke server.'
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  editingClass.value = null
  form.name = ''
  form.grade_level = ''
  form.capacity = 32
  form.room = ''
  form.homeroom_teacher_name = ''
  formErrors.name = ''
  showFormModal.value = true
}

function openEditModal(cls: Classroom) {
  editingClass.value = cls
  form.name = cls.name
  form.grade_level = cls.grade_level?.toString() || ''
  form.capacity = cls.capacity ?? 32
  form.room = cls.room || ''
  form.homeroom_teacher_name = cls.homeroom_teacher_name || cls.homeroom_teacher?.name || ''
  formErrors.name = ''
  showFormModal.value = true
}

function closeFormModal() {
  showFormModal.value = false
  editingClass.value = null
}

async function submitForm() {
  formErrors.name = ''
  if (!form.name.trim()) {
    formErrors.name = 'Nama kelas wajib diisi'
    return
  }

  saving.value = true
  try {
    const payload = {
      name: form.name.trim(),
      grade_level: form.grade_level || undefined,
      capacity: form.capacity,
      room: form.room || undefined,
      homeroom_teacher_name: form.homeroom_teacher_name?.trim() || 'Belum Ditentukan',
    }

    if (editingClass.value) {
      await api.put(`/classrooms/${editingClass.value.id}`, payload)
    } else {
      await api.post('/classrooms', payload)
    }

    closeFormModal()
    await loadClassrooms()
  } catch (err: any) {
    const errs = err.response?.data?.errors
    if (errs?.name) formErrors.name = errs.name[0]
    else error.value = err.response?.data?.message || 'Gagal menyimpan data kelas'
  } finally {
    saving.value = false
  }
}

function confirmDelete(cls: Classroom) {
  deletingClass.value = cls
}

async function deleteClassroom() {
  if (!deletingClass.value) return
  deleting.value = true
  try {
    await api.delete(`/classrooms/${deletingClass.value.id}`)
    deletingClass.value = null
    await loadClassrooms()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Gagal menghapus kelas'
    deletingClass.value = null
  } finally {
    deleting.value = false
  }
}

onMounted(loadClassrooms)
</script>
