<template>
  <div class="space-y-6 max-w-5xl">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span>🏛️</span> Pengaturan Satuan Pendidikan
        </h1>
        <p class="text-slate-600 text-sm mt-1 font-medium">
          Kelola profil sekolah aktif serta daftar satuan pendidikan multi-tenant di platform Belajarena
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="showAddModal = true"
          class="px-3.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs border border-blue-200 transition flex items-center gap-1.5"
        >
          <span>➕</span> <span>Tambah Sekolah</span>
        </button>
        <button
          @click="saveSchoolSettings"
          :disabled="isSaving"
          class="px-4 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#082231] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
        >
          <span>💾</span> <span>{{ isSaving ? 'Menyimpan...' : 'Simpan Profil Aktif' }}</span>
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

    <!-- MULTI-TENANT SCHOOL LIST CARD -->
    <div class="card space-y-4 border border-blue-100 bg-gradient-to-br from-white via-white to-blue-50/30">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h2 class="font-bold text-surface-900 text-sm flex items-center gap-2">
            <span>🌐</span> Satuan Pendidikan Terdaftar (Multi-Sekolah)
          </h2>
          <p class="text-[11px] text-slate-500 mt-0.5">
            Setiap satuan pendidikan memiliki isolasi basis data penuh (rombel kelas, siswa, ujian CBT, tugas, dan rekap nilai).
          </p>
        </div>
        <span class="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 self-start sm:self-auto">
          {{ schoolList.length }} Sekolah Terdaftar
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="item in schoolList"
          :key="item.id"
          class="p-4 rounded-2xl border transition-all duration-200 relative flex flex-col justify-between"
          :class="item.id === currentActiveId
            ? 'bg-blue-50/80 border-blue-300 shadow-sm ring-2 ring-blue-500/20'
            : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'"
        >
          <div>
            <div class="flex items-start justify-between gap-2 mb-2">
              <span class="text-xl">🏫</span>
              <span
                v-if="item.id === currentActiveId"
                class="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider"
              >
                Aktif Saat Ini
              </span>
            </div>
            <h3 class="font-bold text-slate-900 text-xs line-clamp-1" :title="item.name">{{ item.name }}</h3>
            <p class="text-[11px] text-slate-500 mt-0.5 font-mono">NPSN: {{ item.npsn || '—' }}</p>
            <p class="text-[11px] text-slate-600 mt-1 line-clamp-1">📍 {{ item.city || 'Kota' }}, {{ item.province || 'Provinsi' }}</p>

            <div class="grid grid-cols-3 gap-1 mt-3 pt-2.5 border-t border-slate-100 text-center">
              <div class="p-1 rounded bg-slate-50">
                <span class="block text-xs font-extrabold text-slate-800">{{ item.student_count ?? 0 }}</span>
                <span class="block text-[9px] text-slate-400 uppercase font-medium">Siswa</span>
              </div>
              <div class="p-1 rounded bg-slate-50">
                <span class="block text-xs font-extrabold text-slate-800">{{ item.classroom_count ?? 0 }}</span>
                <span class="block text-[9px] text-slate-400 uppercase font-medium">Kelas</span>
              </div>
              <div class="p-1 rounded bg-slate-50">
                <span class="block text-xs font-extrabold text-slate-800">{{ item.teacher_count ?? 1 }}</span>
                <span class="block text-[9px] text-slate-400 uppercase font-medium">Guru</span>
              </div>
            </div>
          </div>

          <div class="mt-3 pt-2">
            <button
              v-if="item.id !== currentActiveId"
              @click="switchActiveSchool(item)"
              class="w-full py-1.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[11px] transition shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>🔄</span> <span>Beralih ke Sekolah Ini</span>
            </button>
            <div
              v-else
              class="w-full py-1.5 px-3 rounded-xl bg-blue-100/60 text-blue-900 font-bold text-[11px] text-center"
            >
              ✓ Terpilih di Sesi Ini
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Identitas Sekolah Aktif Card -->
    <div class="card space-y-4">
      <h2 class="font-bold text-surface-900 text-sm pb-2 border-b border-surface-100 flex items-center gap-2">
        <span>📋</span> Identitas Pokok Satuan Pendidikan Aktif (Dapodik Kemendikbudristek)
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label class="label">Nama Satuan Pendidikan</label>
          <input v-model="school.name" type="text" class="input text-xs font-bold" required />
        </div>
        <div>
          <label class="label">Nomor Pokok Sekolah Nasional (NPSN)</label>
          <input v-model="school.npsn" type="text" class="input text-xs font-mono" required />
        </div>
        <div>
          <label class="label">Bentuk Pendidikan & Status</label>
          <input v-model="school.institution" type="text" class="input text-xs" />
        </div>
        <div>
          <label class="label">Status Akreditasi</label>
          <select v-model="school.accreditation" class="input text-xs font-semibold">
            <option value="A">Terakreditasi A (Unggul)</option>
            <option value="B">Terakreditasi B (Baik)</option>
            <option value="C">Terakreditasi C</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Alamat & Kontak Resmi -->
    <div class="card space-y-4">
      <h2 class="font-bold text-surface-900 text-sm pb-2 border-b border-surface-100 flex items-center gap-2">
        <span>📍</span> Alamat & Kontak Resmi Satuan Pendidikan
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div class="md:col-span-2">
          <label class="label">Alamat Jalan</label>
          <input v-model="school.address" type="text" class="input text-xs" required />
        </div>
        <div>
          <label class="label">Kota / Kabupaten</label>
          <input v-model="school.city" type="text" class="input text-xs" required />
        </div>
        <div>
          <label class="label">Provinsi</label>
          <input v-model="school.province" type="text" class="input text-xs" required />
        </div>
        <div>
          <label class="label">Nomor Telepon Kantor</label>
          <input v-model="school.phone" type="text" class="input text-xs font-mono" />
        </div>
        <div>
          <label class="label">Alamat Surel (Email Resmi)</label>
          <input v-model="school.email" type="email" class="input text-xs" required />
        </div>
      </div>
    </div>

    <!-- Kepala Sekolah & Pejabat Penandatangan -->
    <div class="card space-y-4">
      <h2 class="font-bold text-surface-900 text-sm pb-2 border-b border-surface-100 flex items-center gap-2">
        <span>✍️</span> Kepala Sekolah (Penandatangan Dokumen Resmi)
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label class="label">Nama Kepala Sekolah & Gelar</label>
          <input v-model="school.principalName" type="text" class="input text-xs font-bold" required />
        </div>
        <div>
          <label class="label">NIP Kepala Sekolah</label>
          <input v-model="school.principalNip" type="text" class="input text-xs font-mono" required />
        </div>
      </div>
    </div>

    <!-- Konfigurasi Kurikulum & Penilaian -->
    <div class="card space-y-4">
      <h2 class="font-bold text-surface-900 text-sm pb-2 border-b border-surface-100 flex items-center gap-2">
        <span>⚙️</span> Standar Penilaian & Kriteria Ketuntasan (KKTP)
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div>
          <label class="label">Kurikulum yang Berlaku</label>
          <select v-model="school.curriculum" class="input text-xs font-semibold">
            <option value="Kurikulum Merdeka">Kurikulum Merdeka (Fase D)</option>
            <option value="Kurikulum 2013">Kurikulum 2013 Revisi</option>
          </select>
        </div>
        <div>
          <label class="label">Kriteria Ketercapaian Minimum (KKTP)</label>
          <input v-model.number="school.kktp" type="number" min="50" max="90" class="input text-xs font-bold" />
        </div>
        <div>
          <label class="label">Tahun Pelajaran Berjalan</label>
          <input v-model="school.academicYear" type="text" class="input text-xs font-semibold" />
        </div>
      </div>
    </div>

    <!-- MODAL TAMBAH SEKOLAH BARU -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="showAddModal = false"
    >
      <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto">
        <div class="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🏛️</span>
            <div>
              <h3 class="text-base font-bold text-slate-900">Tambah Satuan Pendidikan Baru</h3>
              <p class="text-xs text-slate-500 mt-0.5">Tambahkan instansi sekolah baru ke sistem multi-tenant</p>
            </div>
          </div>
          <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-600 text-sm">✕</button>
        </div>

        <form @submit.prevent="handleAddSchool" class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nama Satuan Pendidikan <span class="text-red-500">*</span></label>
            <input v-model="newSchoolForm.name" type="text" required class="input text-xs" placeholder="Contoh: SMA Bintang Nusantara" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">NPSN</label>
              <input v-model="newSchoolForm.npsn" type="text" class="input text-xs font-mono" placeholder="8 digit NPSN" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Kota / Kabupaten</label>
              <input v-model="newSchoolForm.city" type="text" class="input text-xs" placeholder="Contoh: Surabaya" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Provinsi</label>
              <input v-model="newSchoolForm.province" type="text" class="input text-xs" placeholder="Contoh: Jawa Timur" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">No. Telepon</label>
              <input v-model="newSchoolForm.phone" type="text" class="input text-xs" placeholder="031-xxxxxxx" />
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nama Kepala Sekolah / Penandatangan</label>
            <input v-model="newSchoolForm.principal_name" type="text" class="input text-xs" placeholder="Nama & gelar kepala sekolah" />
          </div>

          <div class="pt-3 flex gap-2">
            <button
              type="button"
              @click="showAddModal = false"
              class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isAdding"
              class="flex-1 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#164255] text-white font-bold transition flex items-center justify-center gap-2"
            >
              <span>{{ isAdding ? 'Menyimpan...' : 'Simpan Sekolah' }}</span>
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
import { useAuthStore, type SchoolInfo } from '@/stores/auth'

const authStore = useAuthStore()

const isSaving = ref(false)
const isAdding = ref(false)
const showAddModal = ref(false)
const successMsg = ref('')

const schoolList = ref<SchoolInfo[]>([])
const currentActiveId = computed(() => authStore.currentSchool?.id || 'sch-smpn6kendari')

const school = ref({
  id: 'sch-smpn6kendari',
  name: 'SMP Negeri 6 Kendari',
  npsn: '40402621',
  institution: 'Pemerintah Kota Kendari',
  accreditation: 'A',
  address: 'Jl. Bunga Tanjung No. 1, Tipulu, Kendari Barat',
  city: 'Kota Kendari',
  province: 'Sulawesi Tenggara',
  phone: '0401-3123456',
  email: 'info@smpn6kendari.sch.id',
  principalName: 'Sri Milaningsih, S.Pd., M.Pd.',
  principalNip: '19850331 200903 2 001',
  curriculum: 'Kurikulum Merdeka',
  kktp: 75,
  academicYear: '2026/2027'
})

const newSchoolForm = ref({
  name: '',
  npsn: '',
  city: '',
  province: '',
  phone: '',
  principal_name: ''
})

async function fetchSchoolsList() {
  try {
    const res = await api.get('/schools')
    if (res.data?.data) {
      schoolList.value = res.data.data
    }
  } catch (err) {
    console.error('Failed to load schools list:', err)
  }
}

async function loadActiveSchool() {
  try {
    const res = await api.get('/school')
    if (res.data?.data) {
      const data = res.data.data
      school.value = {
        ...school.value,
        ...data,
        principalName: data.principal_name || school.value.principalName,
        principalNip: data.principal_nip || school.value.principalNip,
        kktp: data.kktp || school.value.kktp
      }
      authStore.setSchool(data)
    }
  } catch (err) {
    console.error('Failed to load school settings:', err)
  }
}

function switchActiveSchool(targetSchool: SchoolInfo) {
  authStore.setSchool(targetSchool)
  school.value = {
    ...school.value,
    ...targetSchool,
    principalName: targetSchool.principal_name || school.value.principalName,
    principalNip: targetSchool.principal_nip || school.value.principalNip,
    kktp: targetSchool.kktp || school.value.kktp
  }
  successMsg.value = `Satuan pendidikan berhasil dialihkan ke "${targetSchool.name}".`
  // Reload page to re-initialize data stores for the switched school
  setTimeout(() => {
    window.location.reload()
  }, 700)
}

async function handleAddSchool() {
  if (!newSchoolForm.value.name.trim()) return
  isAdding.value = true
  try {
    const res = await api.post('/schools', newSchoolForm.value)
    if (res.data?.data) {
      successMsg.value = `Satuan pendidikan "${newSchoolForm.value.name}" berhasil ditambahkan!`
      showAddModal.value = false
      newSchoolForm.value = {
        name: '',
        npsn: '',
        city: '',
        province: '',
        phone: '',
        principal_name: ''
      }
      await fetchSchoolsList()
    }
  } catch (err: any) {
    alert('Gagal menambah sekolah: ' + (err.response?.data?.message || err.message))
  } finally {
    isAdding.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    fetchSchoolsList(),
    loadActiveSchool()
  ])
})

async function saveSchoolSettings() {
  isSaving.value = true
  try {
    const res = await api.put('/school', {
      ...school.value,
      principal_name: school.value.principalName,
      principal_nip: school.value.principalNip,
      kktp: Number(school.value.kktp) || 75
    })
    if (res.data?.data) {
      authStore.setSchool(res.data.data)
    }
    successMsg.value = 'Profil satuan pendidikan dan KKTP berhasil disimpan!'
    await fetchSchoolsList()
  } catch (err: any) {
    console.error('Failed to save school settings:', err)
    alert('Gagal menyimpan pengaturan: ' + (err.response?.data?.message || err.message))
  } finally {
    isSaving.value = false
  }
}
</script>
