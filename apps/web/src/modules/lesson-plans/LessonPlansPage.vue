<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 flex items-center gap-2">
          <span>📖</span> Modul Ajar Kurikulum Merdeka
        </h1>
        <p class="text-surface-500 text-sm mt-0.5">
          Perencanaan pembelajaran terstruktur Fase D (SMP Kelas 7-9) dengan Profil Pelajar Pancasila & diferensiasi belajar
        </p>
      </div>
      <div class="flex items-center gap-2">
        <router-link
          to="/lesson-plans/create"
          class="btn btn-primary text-sm flex items-center gap-2"
        >
          <span>➕</span> Buat Modul Ajar Baru
        </router-link>
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <div class="card p-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <div>
          <select v-model="selectedSubject" class="input text-xs py-1.5 font-bold">
            <option value="all">Semua Mata Pelajaran</option>
            <option value="Informatika">Informatika (Kelas IX)</option>
            <option value="KKA">KKA (Kelas VII)</option>
          </select>
        </div>
        <div>
          <select v-model="selectedGrade" class="input text-xs py-1.5 font-bold">
            <option value="all">Semua Kelas</option>
            <option value="7">Kelas VII (KKA)</option>
            <option value="9">Kelas IX (Informatika)</option>
          </select>
        </div>
        <div>
          <select v-model="selectedStatus" class="input text-xs py-1.5">
            <option value="all">Semua Status</option>
            <option value="published">Diterbitkan (Siap Ajar)</option>
            <option value="draft">Draf</option>
          </select>
        </div>
      </div>

      <div class="w-full sm:w-64">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari modul atau topik..."
          class="input text-xs py-1.5"
        />
      </div>
    </div>

    <!-- Modul Ajar Grid Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="plan in filteredPlans"
        :key="plan.id"
        class="card hover:shadow-lg transition-all border border-surface-200 flex flex-col justify-between"
      >
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="badge badge-primary text-[10px] font-semibold">{{ plan.subject }} - Kelas {{ plan.grade }}</span>
            <span
              :class="[
                'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase',
                plan.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-surface-100 text-surface-600'
              ]"
            >
              {{ plan.status === 'published' ? 'Siap Ajar' : 'Draf' }}
            </span>
          </div>

          <h2 class="font-bold text-surface-900 text-base leading-snug line-clamp-2">
            {{ plan.title }}
          </h2>

          <p class="text-xs text-surface-500 line-clamp-2 leading-relaxed">
            {{ plan.learningObjective }}
          </p>

          <!-- Profil Pelajar Pancasila Tags -->
          <div>
            <span class="text-[10px] font-bold text-surface-500 uppercase block mb-1">Dimensi P3:</span>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="(p3, i) in plan.dimensionsP3"
                :key="i"
                class="px-2 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700 font-medium"
              >
                {{ p3 }}
              </span>
            </div>
          </div>
        </div>

        <div class="pt-4 mt-4 border-t border-surface-100 space-y-3">
          <div class="flex items-center justify-between text-[11px] text-surface-500">
            <span>⏱️ {{ plan.duration }} JP ({{ plan.meetings }} Pertemuan)</span>
            <span>Update: {{ plan.updatedAt }}</span>
          </div>

          <div class="flex items-center justify-between gap-2">
            <router-link
              :to="`/lesson-plans/${plan.id}/edit`"
              class="btn btn-secondary text-xs px-3 py-1.5 flex-1 text-center"
            >
              ✏️ Buka Editor
            </router-link>
            <button
              @click="exportPdf(plan)"
              class="btn btn-primary text-xs px-3 py-1.5 flex items-center justify-center gap-1"
              title="Unduh Modul Lengkap"
            >
              <span>📄</span> Unduh
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const selectedSubject = ref('all')
const selectedGrade = ref('all')
const selectedStatus = ref('all')
const searchQuery = ref('')

const lessonPlans = ref([
  {
    id: 'lp-01',
    title: 'Logika Dasar Koding dan Blok Sekuensial',
    subject: 'KKA',
    grade: '7',
    status: 'published',
    duration: 4,
    meetings: 2,
    updatedAt: '2024-10-21',
    learningObjective: 'Peserta didik mampu memahami logika blok visual, sekuensial, dan menyusun algoritma sederhana untuk menyelesaikan tantangan koding.',
    dimensionsP3: ['Bernalar Kritis', 'Mandiri']
  },
  {
    id: 'lp-02',
    title: 'Pengenalan Model Kecerdasan Artifisial & Etika Digital',
    subject: 'KKA',
    grade: '7',
    status: 'published',
    duration: 4,
    meetings: 2,
    updatedAt: '2024-10-18',
    learningObjective: 'Peserta didik mampu mengenali konsep dasar kecerdasan buatan, deteksi pola citra, serta etika pemanfaatan AI secara bertanggung jawab.',
    dimensionsP3: ['Bernalar Kritis', 'Kreatif']
  },
  {
    id: 'lp-03',
    title: 'Analisis Data & Pengolahan Lembar Kerja Lanjutan',
    subject: 'Informatika',
    grade: '9',
    status: 'published',
    duration: 4,
    meetings: 2,
    updatedAt: '2024-10-15',
    learningObjective: 'Peserta didik mampu mengolah, memfilter, dan memvisualisasikan data kuantitatif menggunakan perkakas lembar kerja elektronik.',
    dimensionsP3: ['Bernalar Kritis', 'Bergotong Royong']
  },
  {
    id: 'lp-04',
    title: 'Algoritma Pemrograman Visual Lanjutan & Percabangan',
    subject: 'Informatika',
    grade: '9',
    status: 'draft',
    duration: 6,
    meetings: 3,
    updatedAt: '2024-10-22',
    learningObjective: 'Peserta didik mampu merancang alur logika percabangan bertingkat dan perulangan untuk menghasilkan aplikasi simulasi interaktif.',
    dimensionsP3: ['Kreatif', 'Bernalar Kritis', 'Mandiri']
  }
])

const filteredPlans = computed(() => {
  return lessonPlans.value.filter(p => {
    const matchSubj = selectedSubject.value === 'all' || p.subject === selectedSubject.value
    const matchGrade = selectedGrade.value === 'all' || p.grade === selectedGrade.value
    const matchStat = selectedStatus.value === 'all' || p.status === selectedStatus.value
    const matchSearch = p.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                        p.learningObjective.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchSubj && matchGrade && matchStat && matchSearch
  })
})

function exportPdf(plan: any) {
  alert(`Membuat dokumen Modul Ajar resmi Kemendikbudristek untuk "${plan.title}"... Dokumen siap diunduh.`)
}
</script>
