<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold uppercase tracking-wider mb-2">
          <span>🏛️</span> Data Satuan Pendidikan
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Kelola Data Satuan Pendidikan
        </h1>
        <p class="text-slate-600 text-xs sm:text-sm mt-1">
          Daftar seluruh sekolah yang terdaftar pada sistem Belajarena (dari registrasi guru maupun penambahan manual).
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="openAddModal"
          class="px-4 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#164255] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
        >
          <span>➕</span>
          <span>Tambah Sekolah Baru</span>
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
      <div class="relative flex-1 max-w-md">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama sekolah, NPSN, atau kota..."
          class="input pl-9 text-xs"
        />
        <span class="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
      </div>
      <div class="text-xs font-bold text-slate-500">
        Total: {{ filteredSchools.length }} Satuan Pendidikan
      </div>
    </div>

    <!-- Tabel Data Sekolah -->
    <div class="card p-0 overflow-hidden">
      <div v-if="loading" class="py-12 text-center text-xs text-slate-400">
        Memuat data sekolah...
      </div>
      <div v-else-if="filteredSchools.length === 0" class="py-12 text-center text-xs text-slate-500">
        Tidak ditemukan data sekolah yang sesuai.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase text-[10px] font-bold">
              <th class="py-3 px-4">Nama Satuan Pendidikan</th>
              <th class="py-3 px-4">NPSN & Akreditasi</th>
              <th class="py-3 px-4">Wilayah & Alamat</th>
              <th class="py-3 px-4">Kepala Sekolah</th>
              <th class="py-3 px-4 text-center">Statistik</th>
              <th class="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="s in filteredSchools" :key="s.id" class="hover:bg-slate-50/70 transition">
              <td class="py-3 px-4">
                <span class="font-bold text-slate-900 block text-xs">{{ s.name }}</span>
                <span class="text-[11px] text-slate-400 font-mono">ID: {{ s.id }}</span>
              </td>
              <td class="py-3 px-4">
                <span class="font-mono text-slate-700 block">{{ s.npsn || '—' }}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                  Akreditasi {{ s.accreditation || 'A' }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span class="text-slate-800 font-semibold block">📍 {{ s.city || 'Kota' }}, {{ s.province || 'Provinsi' }}</span>
                <span class="text-[11px] text-slate-500 line-clamp-1">{{ s.address || '-' }}</span>
              </td>
              <td class="py-3 px-4">
                <span class="font-bold text-slate-800 block">{{ s.principal_name || '—' }}</span>
                <span class="text-[10px] text-slate-400 font-mono">{{ s.principal_nip ? 'NIP: ' + s.principal_nip : 'Non-NIP' }}</span>
              </td>
              <td class="py-3 px-4 text-center">
                <div class="inline-flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg text-[11px] font-bold text-slate-700">
                  <span>👨‍🏫 {{ s.teacher_count || 0 }}</span>
                  <span class="text-slate-300">|</span>
                  <span>🎓 {{ s.student_count || 0 }}</span>
                  <span class="text-slate-300">|</span>
                  <span>📚 {{ s.classroom_count || 0 }}</span>
                </div>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    @click="openEditModal(s)"
                    class="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition"
                    title="Edit Profil Sekolah"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    @click="handleDeleteSchool(s)"
                    class="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition"
                    title="Hapus Satuan Pendidikan"
                  >
                    🗑️ Hapus
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL FORM TAMBAH / EDIT SEKOLAH -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="showModal = false"
    >
      <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto">
        <div class="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🏛️</span>
            <div>
              <h3 class="text-base font-bold text-slate-900">
                {{ isEditing ? 'Edit Satuan Pendidikan' : 'Tambah Satuan Pendidikan Baru' }}
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">Kelola identitas pokok sekolah untuk sistem</p>
            </div>
          </div>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600 text-sm">✕</button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nama Satuan Pendidikan <span class="text-red-500">*</span></label>
            <input v-model="form.name" type="text" required class="input text-xs font-bold" placeholder="Contoh: SMP Negeri 1 Bandung" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">NPSN</label>
              <input v-model="form.npsn" type="text" class="input text-xs font-mono" placeholder="8 digit NPSN" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Akreditasi</label>
              <select v-model="form.accreditation" class="input text-xs font-semibold">
                <option value="A">Terakreditasi A (Unggul)</option>
                <option value="B">Terakreditasi B (Baik)</option>
                <option value="C">Terakreditasi C</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Kota / Kabupaten</label>
              <input v-model="form.city" type="text" class="input text-xs" placeholder="Contoh: Kendari" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Provinsi</label>
              <input v-model="form.province" type="text" class="input text-xs" placeholder="Contoh: Sulawesi Tenggara" />
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Alamat Jalan</label>
            <input v-model="form.address" type="text" class="input text-xs" placeholder="Jl. Pendidikan No. 12" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Nama Kepala Sekolah</label>
              <input v-model="form.principal_name" type="text" class="input text-xs" placeholder="Nama & gelar" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">NIP Kepala Sekolah</label>
              <input v-model="form.principal_nip" type="text" class="input text-xs font-mono" placeholder="1980xxxxxxxx" />
            </div>
          </div>

          <div class="pt-3 flex gap-2">
            <button
              type="button"
              @click="showModal = false"
              class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="flex-1 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#164255] text-white font-bold transition flex items-center justify-center gap-2"
            >
              <span>{{ submitting ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Tambah Sekolah') }}</span>
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
const submitting = ref(false)
const schools = ref<any[]>([])
const searchQuery = ref('')
const successMsg = ref('')

const showModal = ref(false)
const isEditing = ref(false)
const currentEditId = ref('')

const form = ref({
  name: '',
  npsn: '',
  accreditation: 'A',
  city: '',
  province: '',
  address: '',
  principal_name: '',
  principal_nip: ''
})

const filteredSchools = computed(() => {
  let list = schools.value || []
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.npsn?.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q)
    )
  }
  return list
})

async function fetchSchools() {
  loading.value = true
  try {
    const res = await api.get('/admin/schools')
    if (res.data?.data) {
      schools.value = res.data.data
    }
  } catch (err: any) {
    console.error('Failed to load schools:', err)
  } finally {
    loading.value = false
  }
}

function openAddModal() {
  isEditing.value = false
  currentEditId.value = ''
  form.value = {
    name: '',
    npsn: '',
    accreditation: 'A',
    city: '',
    province: '',
    address: '',
    principal_name: '',
    principal_nip: ''
  }
  showModal.value = true
}

function openEditModal(school: any) {
  isEditing.value = true
  currentEditId.value = school.id
  form.value = {
    name: school.name || '',
    npsn: school.npsn || '',
    accreditation: school.accreditation || 'A',
    city: school.city || '',
    province: school.province || '',
    address: school.address || '',
    principal_name: school.principal_name || '',
    principal_nip: school.principal_nip || ''
  }
  showModal.value = true
}

async function handleSubmit() {
  if (!form.value.name.trim()) return
  submitting.value = true
  try {
    if (isEditing.value) {
      await api.put(`/admin/schools/${currentEditId.value}`, form.value)
      successMsg.value = `Data satuan pendidikan "${form.value.name}" berhasil diperbarui!`
    } else {
      await api.post('/admin/schools', form.value)
      successMsg.value = `Satuan pendidikan "${form.value.name}" berhasil ditambahkan!`
    }
    showModal.value = false
    await fetchSchools()
  } catch (err: any) {
    alert('Gagal menyimpan sekolah: ' + (err.response?.data?.message || err.message))
  } finally {
    submitting.value = false
  }
}

async function handleDeleteSchool(school: any) {
  if (!confirm(`Hapus satuan pendidikan "${school.name}"? Data profil sekolah ini akan dihapus dari sistem.`)) return
  try {
    await api.delete(`/admin/schools/${school.id}`)
    successMsg.value = `Satuan pendidikan "${school.name}" berhasil dihapus.`
    await fetchSchools()
  } catch (err: any) {
    alert('Gagal menghapus: ' + (err.response?.data?.message || err.message))
  }
}

onMounted(() => {
  fetchSchools()
})
</script>

