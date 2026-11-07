<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold uppercase tracking-wider mb-2">
          <span>👥</span> Data Pengguna Sistem
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Kelola Pengguna & Akun Guru
        </h1>
        <p class="text-slate-600 text-xs sm:text-sm mt-1">
          Pantau seluruh akun pendidik yang mendaftar mandiri, kelola status keaktifan, dan reset kata sandi.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="openAddTeacherModal"
          class="px-4 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#164255] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
        >
          <span>➕</span>
          <span>Daftarkan Guru Manual</span>
        </button>
      </div>
    </div>

    <!-- Alert status -->
    <div v-if="successMsg" class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span>✅</span>
        <span>{{ successMsg }}</span>
      </div>
      <button @click="successMsg = ''" class="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
    </div>

    <!-- Filter & Search Bar -->
    <div class="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
        <div class="relative flex-1 max-w-md">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari nama guru, email, NIP, atau sekolah..."
            class="input pl-9 text-xs"
          />
          <span class="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
        </div>

        <select v-model="filterStatus" class="input sm:w-44 text-xs font-semibold">
          <option value="all">Semua Status</option>
          <option value="active">Hanya Aktif</option>
          <option value="suspended">Hanya Suspend</option>
        </select>
      </div>

      <div class="text-xs font-bold text-slate-500">
        Total: {{ filteredUsers.length }} Akun Terdaftar
      </div>
    </div>

    <!-- Tabel Data Pengguna / Guru -->
    <div class="card p-0 overflow-hidden">
      <div v-if="loading" class="py-12 text-center text-xs text-slate-400">
        Memuat data pengguna...
      </div>
      <div v-else-if="filteredUsers.length === 0" class="py-12 text-center text-xs text-slate-500">
        Tidak ditemukan data pengguna yang sesuai filter.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase text-[10px] font-bold">
              <th class="py-3 px-4">Nama Lengkap & NIP</th>
              <th class="py-3 px-4">Email Login</th>
              <th class="py-3 px-4">Asal Satuan Pendidikan</th>
              <th class="py-3 px-4">Mata Pelajaran</th>
              <th class="py-3 px-4 text-center">Status Akun</th>
              <th class="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="u in filteredUsers" :key="u.id" class="hover:bg-slate-50/70 transition">
              <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {{ u.name.charAt(0) }}
                  </div>
                  <div>
                    <span class="font-bold text-slate-900 block text-xs">{{ u.name }}</span>
                    <span class="text-[10px] text-slate-400 font-mono">{{ u.nip !== '-' ? 'NIP: ' + u.nip : 'Non-NIP' }}</span>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4 font-mono text-slate-700">
                <span>{{ u.email }}</span>
                <span v-if="u.role === 'superadmin'" class="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-purple-100 text-purple-800">
                  Admin
                </span>
              </td>
              <td class="py-3 px-4">
                <span class="font-semibold text-slate-800 block">{{ u.school_name }}</span>
              </td>
              <td class="py-3 px-4">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="sub in (u.subjects?.length ? u.subjects : (u.subject && u.subject !== '-' ? u.subject.split(', ') : ['Semua Mapel']))"
                    :key="sub"
                    class="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-semibold text-[11px]"
                  >
                    {{ sub }}
                  </span>
                </div>
              </td>
              <td class="py-3 px-4 text-center">
                <span
                  class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block"
                  :class="u.is_active
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'"
                >
                  {{ u.is_active ? '✓ Aktif' : '✗ Ditangguhkan' }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    v-if="u.role !== 'superadmin'"
                    @click="openResetPasswordModal(u)"
                    class="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs transition"
                    title="Reset Sandi Akun"
                  >
                    🔑 Reset Sandi
                  </button>
                  <button
                    v-if="u.role !== 'superadmin'"
                    @click="handleToggleStatus(u)"
                    class="px-2.5 py-1.5 rounded-lg font-bold text-xs transition"
                    :class="u.is_active
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'"
                    :title="u.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'"
                  >
                    {{ u.is_active ? '⏸ Suspend' : '▶ Aktifkan' }}
                  </button>
                  <button
                    v-if="u.role !== 'superadmin'"
                    @click="handleDeleteUser(u)"
                    class="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition"
                    title="Hapus Akun Pengguna"
                  >
                    🗑️
                  </button>
                  <span v-else class="text-[10px] text-slate-400 font-bold italic px-2">Akun Utama</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL RESET SANDI -->
    <div
      v-if="showResetModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="showResetModal = false"
    >
      <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 relative">
        <div class="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">🔑</span>
            <div>
              <h3 class="text-sm font-bold text-slate-900">Reset Kata Sandi</h3>
              <p class="text-[11px] text-slate-500">{{ selectedUser?.name }}</p>
            </div>
          </div>
          <button @click="showResetModal = false" class="text-slate-400 hover:text-slate-600 text-sm">✕</button>
        </div>

        <form @submit.prevent="handleResetPasswordSubmit" class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Kata Sandi Baru</label>
            <input
              v-model="newPasswordInput"
              type="text"
              required
              minlength="6"
              class="input text-xs font-mono font-bold"
              placeholder="Minimal 6 karakter"
            />
            <p class="text-[10px] text-slate-400 mt-1">Beritahukan kata sandi baru ini kepada guru yang bersangkutan.</p>
          </div>

          <div class="pt-3 flex gap-2">
            <button
              type="button"
              @click="showResetModal = false"
              class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="resetting"
              class="flex-1 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#164255] text-white font-bold transition flex items-center justify-center gap-2"
            >
              <span>{{ resetting ? 'Menyimpan...' : 'Simpan Sandi' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL TAMBAH GURU MANUAL OLEH ADMIN -->
    <div
      v-if="showAddTeacherModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="showAddTeacherModal = false"
    >
      <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <div class="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">👨‍🏫</span>
            <div>
              <h3 class="text-sm font-bold text-slate-900">Daftarkan Akun Guru Manual</h3>
              <p class="text-[11px] text-slate-500">Buat akun guru langsung dari portal admin</p>
            </div>
          </div>
          <button @click="showAddTeacherModal = false" class="text-slate-400 hover:text-slate-600 text-sm">✕</button>
        </div>

        <form @submit.prevent="handleAddTeacherSubmit" class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nama Lengkap Guru & Gelar <span class="text-red-500">*</span></label>
            <input v-model="newTeacherForm.name" type="text" required class="input text-xs font-bold" placeholder="Contoh: Dra. Nurhayati, M.Pd." />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">NIP (Opsional)</label>
            <input v-model="newTeacherForm.nip" type="text" class="input text-xs font-mono" placeholder="1985xxxxxxxx" />
          </div>

          <!-- Pemilihan Mata Pelajaran (Dropdown Multi-Mapel) -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="block font-semibold text-slate-700">
                Mata Pelajaran yang Diampu <span class="text-red-500">*</span>
              </label>
              <button
                type="button"
                @click="addAdminTeacherSubjectSlot"
                class="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <span>+ Tambah Mapel</span>
              </button>
            </div>

            <div class="space-y-2">
              <div
                v-for="(slot, idx) in adminTeacherSubjectSlots"
                :key="idx"
                class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
              >
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-bold text-slate-400 w-5 text-center">#{{ idx + 1 }}</span>
                  <select
                    v-model="slot.selected"
                    required
                    class="input text-xs flex-1 bg-white font-medium"
                  >
                    <option value="" disabled>-- Pilih Mata Pelajaran --</option>
                    <option v-for="std in STANDARD_SUBJECTS" :key="std" :value="std">{{ std }}</option>
                    <option value="__CUSTOM__">Lainnya (Ketik Manual)...</option>
                  </select>
                  <button
                    v-if="adminTeacherSubjectSlots.length > 1"
                    type="button"
                    @click="removeAdminTeacherSubjectSlot(idx)"
                    class="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition shrink-0 cursor-pointer"
                    title="Hapus mata pelajaran ini"
                  >
                    ✕
                  </button>
                </div>

                <div v-if="slot.selected === '__CUSTOM__'" class="pl-7">
                  <input
                    v-model="slot.custom"
                    type="text"
                    required
                    class="input text-xs bg-white"
                    placeholder="Ketik nama mata pelajaran kustom/muatan lokal..."
                  />
                </div>
              </div>
            </div>
            <p class="text-[10px] text-slate-500">Pilih dari dropdown atau klik <strong>+ Tambah Mapel</strong> bila guru mengampu lebih dari 1 mata pelajaran.</p>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Satuan Pendidikan Asal</label>
            <select v-model="newTeacherForm.school_id" class="input text-xs font-semibold">
              <option value="">-- Pilih Sekolah --</option>
              <option v-for="sch in schoolsList" :key="sch.id" :value="sch.id">
                {{ sch.name }} ({{ sch.city || 'Indonesia' }})
              </option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Email Guru (Untuk Login) <span class="text-red-500">*</span></label>
            <input v-model="newTeacherForm.email" type="email" required class="input text-xs" placeholder="nurhayati@guru.smp.belajar.id" />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Kata Sandi Awal <span class="text-red-500">*</span></label>
            <input v-model="newTeacherForm.password" type="text" required minlength="6" class="input text-xs font-mono" />
          </div>

          <div class="pt-3 flex gap-2">
            <button
              type="button"
              @click="showAddTeacherModal = false"
              class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="addingTeacher"
              class="flex-1 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#164255] text-white font-bold transition flex items-center justify-center gap-2"
            >
              <span>{{ addingTeacher ? 'Mendaftarkan...' : 'Daftarkan Akun' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const loading = ref(false)
const users = ref<any[]>([])
const schoolsList = ref<any[]>([])
const searchQuery = ref('')
const filterStatus = ref<'all' | 'active' | 'suspended'>('all')
const successMsg = ref('')

// Reset password state
const showResetModal = ref(false)
const selectedUser = ref<any>(null)
const newPasswordInput = ref('password123')
const resetting = ref(false)

// Add teacher modal state
const showAddTeacherModal = ref(false)
const addingTeacher = ref(false)

const STANDARD_SUBJECTS = [
  'Matematika',
  'Informatika',
  'Koding dan Kecerdasan Artifisial (KKA)',
  'Ilmu Pengetahuan Alam (IPA)',
  'Ilmu Pengetahuan Sosial (IPS)',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Pendidikan Pancasila (PPKn)',
  'Pendidikan Agama & Budi Pekerti',
  'PJOK',
  'Seni Budaya',
  'Prakarya',
  'Bimbingan dan Konseling (BK)',
  'Bahasa Daerah / Muatan Lokal'
]

const adminTeacherSubjectSlots = ref<Array<{ selected: string; custom: string }>>([
  { selected: 'Matematika', custom: '' }
])

function addAdminTeacherSubjectSlot() {
  adminTeacherSubjectSlots.value.push({ selected: '', custom: '' })
}

function removeAdminTeacherSubjectSlot(index: number) {
  if (adminTeacherSubjectSlots.value.length > 1) {
    adminTeacherSubjectSlots.value.splice(index, 1)
  }
}

const newTeacherForm = ref({
  name: '',
  nip: '',
  subject: '',
  school_id: '',
  email: '',
  password: 'password123'
})

const filteredUsers = computed(() => {
  let list = users.value || []

  if (filterStatus.value === 'active') {
    list = list.filter(u => u.is_active)
  } else if (filterStatus.value === 'suspended') {
    list = list.filter(u => !u.is_active)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(u =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.nip?.toLowerCase().includes(q) ||
      u.school_name?.toLowerCase().includes(q) ||
      u.subject?.toLowerCase().includes(q)
    )
  }
  return list
})

async function fetchUsers() {
  loading.value = true
  try {
    const res = await api.get('/admin/users')
    if (res.data?.data) {
      users.value = res.data.data
    }
  } catch (err: any) {
    console.error('Failed to load admin users:', err)
  } finally {
    loading.value = false
  }
}

async function fetchSchools() {
  try {
    const res = await api.get('/admin/schools')
    if (res.data?.data) {
      schoolsList.value = res.data.data
    }
  } catch (err) {
    console.warn('Could not load schools for dropdown:', err)
  }
}

function openResetPasswordModal(user: any) {
  selectedUser.value = user
  newPasswordInput.value = 'password123'
  showResetModal.value = true
}

async function handleResetPasswordSubmit() {
  if (!selectedUser.value || !newPasswordInput.value.trim()) return
  resetting.value = true
  try {
    const res = await api.put(`/admin/users/${selectedUser.value.id}/reset-password`, {
      password: newPasswordInput.value.trim()
    })
    successMsg.value = res.data?.message || 'Kata sandi berhasil direset.'
    showResetModal.value = false
  } catch (err: any) {
    alert('Gagal mereset sandi: ' + (err.response?.data?.message || err.message))
  } finally {
    resetting.value = false
  }
}

async function handleToggleStatus(user: any) {
  try {
    const res = await api.put(`/admin/users/${user.id}/status`)
    if (res.data?.data || res.data?.is_active !== undefined) {
      user.is_active = res.data.is_active
    } else {
      user.is_active = !user.is_active
    }
    successMsg.value = res.data?.message || 'Status akun berhasil diubah.'
  } catch (err: any) {
    alert('Gagal mengubah status: ' + (err.response?.data?.message || err.message))
  }
}

async function handleDeleteUser(user: any) {
  if (!confirm(`Hapus akun guru "${user.name}" (${user.email})? Tindakan ini tidak dapat dibatalkan.`)) return
  try {
    await api.delete(`/admin/users/${user.id}`)
    successMsg.value = `Akun guru "${user.name}" berhasil dihapus.`
    await fetchUsers()
  } catch (err: any) {
    alert('Gagal menghapus akun: ' + (err.response?.data?.message || err.message))
  }
}

function openAddTeacherModal() {
  newTeacherForm.value = {
    name: '',
    nip: '',
    subject: '',
    school_id: schoolsList.value[0]?.id || '',
    email: '',
    password: 'password123'
  }
  adminTeacherSubjectSlots.value = [{ selected: 'Matematika', custom: '' }]
  showAddTeacherModal.value = true
}

async function handleAddTeacherSubmit() {
  if (!newTeacherForm.value.name.trim() || !newTeacherForm.value.email.trim()) return

  const resolvedSubjects = adminTeacherSubjectSlots.value
    .map(s => (s.selected === '__CUSTOM__' ? s.custom.trim() : s.selected.trim()))
    .filter(Boolean)

  if (resolvedSubjects.length === 0) {
    alert('Silakan tentukan minimal 1 mata pelajaran yang diampu guru.')
    return
  }

  addingTeacher.value = true
  try {
    const payload = {
      ...newTeacherForm.value,
      subject: resolvedSubjects.join(', '),
      subjects: resolvedSubjects
    }
    await api.post('/admin/users', payload)
    successMsg.value = `Akun guru "${newTeacherForm.value.name}" berhasil ditambahkan!`
    showAddTeacherModal.value = false
    await fetchUsers()
  } catch (err: any) {
    alert('Gagal mendaftarkan guru: ' + (err.response?.data?.message || err.message))
  } finally {
    addingTeacher.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchUsers(), fetchSchools()])
})
</script>

