<template>
  <div class="space-y-6 max-w-4xl">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 flex items-center gap-2">
          <span>📅</span> Tahun Pelajaran & Kalender Semester
        </h1>
        <p class="text-surface-500 text-sm mt-0.5">
          Atur periode kalender akademik, semester berjalan, dan cut-off penilaian SMP Negeri 6 Kendari
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="showCreateModal = true"
          class="btn btn-primary text-sm flex items-center gap-2"
        >
          <span>➕</span> Tambah Tahun Pelajaran
        </button>
      </div>
    </div>

    <!-- Active Year Hero Banner -->
    <div class="card p-6 bg-gradient-to-r from-primary-900 to-indigo-900 text-white rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <span class="badge badge-success text-[10px] uppercase font-bold">Periode Berjalan</span>
        <h2 class="text-2xl font-black mt-1">Tahun Pelajaran 2024/2025</h2>
        <p class="text-xs text-white/80 mt-1">
          Semester Aktif: <strong class="text-amber-300">Semester 1 (Ganjil)</strong> &bull; 15 Juli 2024 s/d 20 Desember 2024
        </p>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-3 py-1.5 rounded-xl bg-white/20 text-xs font-semibold backdrop-blur-md">
          🟢 84 Hari Efektif KBM
        </span>
      </div>
    </div>

    <!-- Academic Years List -->
    <div class="space-y-4">
      <h3 class="font-bold text-surface-900 text-sm">Riwayat & Daftar Periode Akademik</h3>

      <div
        v-for="yr in academicYears"
        :key="yr.id"
        class="card p-5 border border-surface-200 space-y-4"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <h4 class="text-base font-bold text-surface-900">Tahun Pelajaran {{ yr.name }}</h4>
            <span
              :class="[
                'badge text-[10px] font-bold uppercase',
                yr.isActive ? 'badge-success' : 'badge-secondary'
              ]"
            >
              {{ yr.isActive ? 'Aktif' : 'Arsip' }}
            </span>
          </div>

          <button
            v-if="!yr.isActive"
            @click="setActiveYear(yr)"
            class="btn btn-secondary text-xs px-3 py-1 font-semibold"
          >
            Aktifkan Periode Ini
          </button>
        </div>

        <!-- Semesters Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div
            v-for="sem in yr.semesters"
            :key="sem.number"
            class="p-3 rounded-xl border flex items-center justify-between"
            :class="sem.isActive ? 'bg-primary-50/70 border-primary-200' : 'bg-surface-50 border-surface-200'"
          >
            <div>
              <p class="font-bold text-surface-900">Semester {{ sem.number }} ({{ sem.number === 1 ? 'Ganjil' : 'Genap' }})</p>
              <p class="text-[11px] text-surface-500">{{ sem.startDate }} s/d {{ sem.endDate }}</p>
            </div>
            <span v-if="sem.isActive" class="text-primary-700 font-bold text-[10px] bg-white px-2 py-0.5 rounded shadow-sm">
              Sedang Berjalan
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Tambah Periode -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      @click.self="showCreateModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-surface-100">
          <h3 class="text-base font-bold text-surface-900">Tambah Tahun Pelajaran Baru</h3>
          <button @click="showCreateModal = false" class="text-surface-400 hover:text-surface-700">✕</button>
        </div>

        <form @submit.prevent="createAcademicYear" class="space-y-3 text-xs">
          <div>
            <label class="label">Nama Periode</label>
            <input v-model="newYear.name" type="text" class="input text-xs" placeholder="Contoh: 2025/2026" required />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Tanggal Mulai</label>
              <input v-model="newYear.startDate" type="date" class="input text-xs" required />
            </div>
            <div>
              <label class="label">Tanggal Selesai</label>
              <input v-model="newYear.endDate" type="date" class="input text-xs" required />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-surface-100">
            <button
              type="button"
              @click="showCreateModal = false"
              class="btn btn-secondary text-xs px-4 py-2"
            >
              Batal
            </button>
            <button
              type="submit"
              class="btn btn-primary text-xs px-4 py-2 font-bold"
            >
              Simpan Periode
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showCreateModal = ref(false)

const academicYears = ref([
  {
    id: '1',
    name: '2024/2025',
    isActive: true,
    semesters: [
      { number: 1, startDate: '15 Juli 2024', endDate: '20 Desember 2024', isActive: true },
      { number: 2, startDate: '06 Januari 2025', endDate: '20 Juni 2025', isActive: false }
    ]
  },
  {
    id: '2',
    name: '2023/2024',
    isActive: false,
    semesters: [
      { number: 1, startDate: '17 Juli 2023', endDate: '22 Desember 2023', isActive: false },
      { number: 2, startDate: '08 Januari 2024', endDate: '21 Juni 2024', isActive: false }
    ]
  }
])

const newYear = ref({
  name: '2025/2026',
  startDate: '2025-07-14',
  endDate: '2026-06-19'
})

function setActiveYear(yr: any) {
  academicYears.value.forEach(y => y.isActive = false)
  yr.isActive = true
  alert(`Tahun Pelajaran ${yr.name} sekarang aktif.`)
}

function createAcademicYear() {
  academicYears.value.unshift({
    id: String(Date.now()),
    name: newYear.value.name,
    isActive: false,
    semesters: [
      { number: 1, startDate: 'Juli ' + newYear.value.name.split('/')[0], endDate: 'Desember ' + newYear.value.name.split('/')[0], isActive: false },
      { number: 2, startDate: 'Januari ' + newYear.value.name.split('/')[1], endDate: 'Juni ' + newYear.value.name.split('/')[1], isActive: false }
    ]
  })
  showCreateModal.value = false
}
</script>
