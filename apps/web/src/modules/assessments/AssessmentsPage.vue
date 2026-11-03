<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 flex items-center gap-2">
          <span>🎯</span> Manajemen Asesmen Kurikulum Merdeka
        </h1>
        <p class="text-surface-500 text-sm mt-0.5">
          Asesmen Diagnostik Awal, Asesmen Formatif per Tujuan Pembelajaran (TP), dan Asesmen Sumatif Lingkup Materi
        </p>
      </div>
      <div class="flex items-center gap-2">
        <RouterLink
          to="/reports/grades"
          class="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-300 transition flex items-center gap-1.5 shadow-xs"
          style="background-color: #f0fdfa !important; color: #115e59 !important; border-color: #99f6e4 !important;"
          title="Input nilai ulangan harian atau sumatif yang dilakukan di luar aplikasi / offline / lampau"
        >
          <span>📋</span> <span>Input Ulangan Luar Aplikasi</span>
        </RouterLink>
        <button
          @click="showCreateModal = true"
          class="btn btn-primary text-sm flex items-center gap-2"
        >
          <span>➕</span> Buat Rencana Asesmen
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="card p-4 border-l-4 border-l-blue-500 flex items-center justify-between">
        <div>
          <p class="text-xs text-surface-500 font-semibold uppercase">Asesmen Formatif (TP)</p>
          <p class="text-2xl font-black text-surface-900 mt-1">12 Sesi</p>
          <p class="text-[11px] text-surface-400 mt-0.5">Observasi & Kuis Formatif</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
          📝
        </div>
      </div>

      <div class="card p-4 border-l-4 border-l-amber-500 flex items-center justify-between">
        <div>
          <p class="text-xs text-surface-500 font-semibold uppercase">Sumatif Lingkup Materi</p>
          <p class="text-2xl font-black text-surface-900 mt-1">4 Sesi</p>
          <p class="text-[11px] text-surface-400 mt-0.5">Penilaian Tengah Bab</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
          📊
        </div>
      </div>

      <div class="card p-4 border-l-4 border-l-emerald-500 flex items-center justify-between">
        <div>
          <p class="text-xs text-surface-500 font-semibold uppercase">Tingkat Ketercapaian</p>
          <p class="text-2xl font-black text-emerald-600 mt-1">94.2%</p>
          <p class="text-[11px] text-surface-400 mt-0.5">Peserta didik mencapai KKTP</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
          🏆
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="card p-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <div>
          <select v-model="selectedType" class="input text-xs py-1.5">
            <option value="all">Semua Jenis Asesmen</option>
            <option value="formatif">Formatif</option>
            <option value="sumatif">Sumatif</option>
            <option value="diagnostik">Diagnostik</option>
          </select>
        </div>
        <div>
          <select v-model="selectedClass" class="input text-xs py-1.5 font-bold">
            <option value="all">Semua Rombel</option>
            <option v-for="c in classrooms" :key="c.id" :value="c.name">
              {{ formatClassLabel(c) }}
            </option>
          </select>
        </div>
      </div>

      <div class="w-full sm:w-64">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari asesmen..."
          class="input text-xs py-1.5"
        />
      </div>
    </div>

    <!-- Assessments Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="item in filteredAssessments"
        :key="item.id"
        class="card hover:shadow-lg transition-all border border-surface-200 flex flex-col justify-between"
      >
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span
              :class="[
                'text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase',
                item.type === 'formatif' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              ]"
            >
              {{ item.type }}
            </span>
            <span class="text-xs font-semibold text-surface-500">{{ item.classroom }}</span>
          </div>

          <h2 class="font-bold text-surface-900 text-base leading-snug">
            {{ item.title }}
          </h2>

          <p class="text-xs text-surface-500 leading-relaxed line-clamp-2">
            Target TP: {{ item.learningObjective }}
          </p>

          <div class="p-2.5 rounded-lg bg-surface-50 border border-surface-100 flex items-center justify-between text-xs">
            <span class="text-surface-500">Metode Asesmen:</span>
            <span class="font-bold text-surface-800">{{ item.technique }}</span>
          </div>

          <div class="flex items-center justify-between text-xs">
            <span class="text-surface-500">Rata-rata Nilai:</span>
            <span class="font-black text-emerald-700 text-sm">{{ item.averageScore }}</span>
          </div>
        </div>

        <div class="pt-4 mt-4 border-t border-surface-100 flex items-center justify-between gap-2">
          <router-link
            :to="`/assessments/${item.id}`"
            class="btn btn-secondary text-xs px-3 py-1.5 flex-1 text-center"
          >
            Input / Rekap Nilai
          </router-link>
          <router-link
            to="/grading"
            class="btn btn-primary text-xs px-3 py-1.5 flex items-center justify-center gap-1 font-bold"
          >
            <span>📊</span> Ledger
          </router-link>
        </div>
      </div>
    </div>

    <!-- Modal Buat Asesmen Baru -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      @click.self="showCreateModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-surface-100">
          <h3 class="text-base font-bold text-surface-900">Rancang Asesmen Baru</h3>
          <button @click="showCreateModal = false" class="text-surface-400 hover:text-surface-700">✕</button>
        </div>

        <form @submit.prevent="createAssessment" class="space-y-3 text-xs">
          <div>
            <label class="label">Judul Asesmen</label>
            <input v-model="newAsm.title" type="text" class="input text-xs" placeholder="Misal: Asesmen Formatif TP 7.2 Konversi Bilangan Biner" required />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Jenis Asesmen</label>
              <select v-model="newAsm.type" class="input text-xs">
                <option value="formatif">Formatif</option>
                <option value="sumatif">Sumatif Lingkup Materi</option>
                <option value="diagnostik">Diagnostik Awal</option>
              </select>
            </div>
            <div>
              <label class="label">Sasaran Rombel</label>
              <select v-model="newAsm.classroom" class="input text-xs font-bold">
                <option v-for="c in classrooms" :key="c.id" :value="c.name">
                  {{ formatClassLabel(c) }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="label">Teknik / Metode Asesmen</label>
            <select v-model="newAsm.technique" class="input text-xs">
              <option value="Tes Tertulis CBT">Tes Tertulis CBT</option>
              <option value="Observasi Kinerja & Diskusi">Observasi Kinerja & Diskusi</option>
              <option value="Penugasan Produk / Proyek">Penugasan Produk / Proyek</option>
              <option value="Kuis Kilat Interaktif">Kuis Kilat Interaktif</option>
            </select>
          </div>

          <div>
            <label class="label">Tujuan Pembelajaran yang Diukur (TP)</label>
            <textarea v-model="newAsm.learningObjective" rows="2" class="input text-xs" placeholder="Tuliskan kode TP dan deskripsi ringkas..." required></textarea>
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
              Simpan Asesmen
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useClassrooms } from '@/composables/useClassrooms'

const { classrooms, fetchClassrooms, formatClassLabel, getClassName } = useClassrooms()

const selectedType = ref('all')
const selectedClass = ref('all')
const searchQuery = ref('')
const showCreateModal = ref(false)

const assessments = ref([
  {
    id: 'asm-01',
    title: 'Formatif TP 7.1: Pengenalan Komponen Sistem Komputer',
    type: 'formatif',
    classroom: 'VII A',
    technique: 'Observasi & Lembar Kerja',
    learningObjective: 'TP 7.1 Mengidentifikasi komponen penyusun komputer dan fungsinya.',
    averageScore: 88.2
  },
  {
    id: 'asm-02',
    title: 'Formatif TP 7.2: Logika Biner & Pemrosesan Data',
    type: 'formatif',
    classroom: 'VII A',
    technique: 'Tes Tertulis CBT',
    learningObjective: 'TP 7.2 Mengonversi bilangan biner 8-bit ke desimal.',
    averageScore: 85.0
  },
  {
    id: 'asm-03',
    title: 'Sumatif Lingkup Materi 1: Perangkat Keras Komputer',
    type: 'sumatif',
    classroom: 'VII A',
    technique: 'Tes Tertulis CBT Terpadu',
    learningObjective: 'Mengintegrasikan seluruh pemahaman materi perangkat keras Fase D.',
    averageScore: 86.8
  }
])

function normalizeClass(nameOrId: string) {
  return (nameOrId || '').replace(/[\s-]/g, '').toLowerCase()
}

const filteredAssessments = computed(() => {
  return assessments.value.filter(a => {
    const matchType = selectedType.value === 'all' || a.type === selectedType.value
    const matchClass = selectedClass.value === 'all' ||
      normalizeClass(a.classroom) === normalizeClass(selectedClass.value) ||
      normalizeClass(a.classroom) === normalizeClass(getClassName(selectedClass.value))
    const matchSearch = a.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchType && matchClass && matchSearch
  })
})

const newAsm = ref({
  title: '',
  type: 'formatif',
  classroom: 'VII A',
  technique: 'Tes Tertulis CBT',
  learningObjective: ''
})

onMounted(async () => {
  await fetchClassrooms()
  if (classrooms.value.length > 0) {
    newAsm.value.classroom = classrooms.value[0].name
  }
})

function createAssessment() {
  assessments.value.unshift({
    id: 'asm-' + Date.now(),
    title: newAsm.value.title,
    type: newAsm.value.type,
    classroom: newAsm.value.classroom,
    technique: newAsm.value.technique,
    learningObjective: newAsm.value.learningObjective,
    averageScore: 0
  })
  showCreateModal.value = false
  newAsm.value = {
    title: '',
    type: 'formatif',
    classroom: classrooms.value[0]?.name || 'VII A',
    technique: 'Tes Tertulis CBT',
    learningObjective: ''
  }
}
</script>
