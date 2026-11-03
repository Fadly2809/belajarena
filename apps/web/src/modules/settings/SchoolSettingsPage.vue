<template>
  <div class="space-y-6 max-w-4xl">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span>🏛️</span> Pengaturan Satuan Pendidikan
        </h1>
        <p class="text-slate-600 text-sm mt-1 font-medium">
          Identitas resmi sekolah yang tercantum pada dokumen cetak rapor, kartu ujian CBT, dan administrasi dinas
        </p>
      </div>
      <button @click="saveSchoolSettings" class="px-4 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#082231] text-white font-bold text-xs shadow-md transition flex items-center gap-2">
        <span>💾</span> <span>Simpan Pengaturan</span>
      </button>
    </div>

    <!-- Identitas Sekolah Card -->
    <div class="card space-y-4">
      <h2 class="font-bold text-surface-900 text-sm pb-2 border-b border-surface-100 flex items-center gap-2">
        <span>📋</span> Identitas Pokok Satuan Pendidikan (Dapodik Kemendikbudristek)
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const isSaving = ref(false)
const school = ref({
  name: 'SMP Negeri 6 Kendari',
  npsn: '40403892',
  institution: 'Pemerintah Kota Kendari',
  accreditation: 'A',
  address: 'Jalan R.A. Kartini No. 1, Kel. Bende',
  city: 'Kota Kendari',
  province: 'Sulawesi Tenggara',
  phone: '0401-3121234',
  email: 'smpn6kendari@gmail.com',
  principalName: 'Drs. H. Mansyur, M.Pd.',
  principalNip: '19681120 199412 1 002',
  curriculum: 'Kurikulum Merdeka',
  kktp: 75,
  academicYear: '2024/2025'
})

onMounted(async () => {
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
    }
  } catch (err) {
    console.error('Failed to load school settings:', err)
  }
})

async function saveSchoolSettings() {
  isSaving.value = true
  try {
    await api.put('/school', {
      ...school.value,
      principal_name: school.value.principalName,
      principal_nip: school.value.principalNip,
      kktp: Number(school.value.kktp) || 75
    })
    alert('Pengaturan sekolah dan batas KKTP berhasil disimpan!')
  } catch (err: any) {
    console.error('Failed to save school settings:', err)
    alert('Gagal menyimpan pengaturan: ' + (err.message || 'Terjadi kesalahan'))
  } finally {
    isSaving.value = false
  }
}
</script>
