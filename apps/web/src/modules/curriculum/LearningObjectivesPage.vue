<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 flex items-center gap-2">
          <span>🎯</span> Alur Tujuan Pembelajaran (ATP) & KKTP
        </h1>
        <p class="text-surface-500 text-sm mt-0.5">
          Pemetaan Tujuan Pembelajaran (TP), indikator ketercapaian, dan interval nilai asesmen Kurikulum Merdeka
        </p>
      </div>
      <div class="flex items-center gap-2">
        <router-link to="/curriculum" class="btn btn-secondary text-xs px-3 py-2 flex items-center gap-1">
          ← Struktur CP
        </router-link>
        <router-link to="/curriculum/chapters" class="btn btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 shadow-2xs">
          <span>🎯</span> Mapping BAB & Nilai
        </router-link>
        <button
          @click="showCreateModal = true"
          class="btn btn-primary text-xs px-4 py-2 flex items-center gap-1.5 font-bold"
        >
          <span>➕</span> Tambah TP Baru
        </button>
      </div>
    </div>

    <!-- Filter & Selector -->
    <div class="card p-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <div>
          <label class="block text-[10px] uppercase font-bold text-surface-500 mb-1">Tingkat Kelas</label>
          <select v-model="selectedGrade" class="input text-xs py-1.5 font-bold" @change="onGradeChange">
            <option value="7">Kelas VII</option>
            <option value="8">Kelas VIII</option>
            <option value="9">Kelas IX</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] uppercase font-bold text-surface-500 mb-1">Mata Pelajaran</label>
          <select v-model="selectedSubject" class="input text-xs py-1.5 font-semibold">
            <option :value="selectedSubject">{{ selectedSubject }}</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] uppercase font-bold text-surface-500 mb-1">Elemen CP</label>
          <select v-model="selectedElement" class="input text-xs py-1.5">
            <option value="all">Semua Elemen</option>
            <option v-for="el in availableElements" :key="el" :value="el">{{ el }}</option>
          </select>
        </div>
      </div>

      <div class="text-xs text-surface-500">
        Menampilkan <strong class="text-surface-900">{{ filteredObjectives.length }}</strong> Tujuan Pembelajaran aktif
      </div>
    </div>

    <!-- Objectives Table / Card List -->
    <div class="space-y-4">
      <div
        v-for="tp in filteredObjectives"
        :key="tp.code"
        class="card hover:shadow-md transition p-5 border border-surface-200 space-y-3"
      >
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded bg-primary-100 text-primary-800 font-mono text-xs font-black">
              {{ tp.code }}
            </span>
            <span class="badge badge-secondary text-[11px]">{{ tp.element }}</span>
            <span class="text-xs text-surface-400">&bull; Alokasi: {{ tp.duration }} JP</span>
          </div>

          <div class="flex items-center gap-2 text-xs">
            <span class="text-surface-500">Target Asesmen:</span>
            <span class="badge badge-primary text-[10px]">{{ tp.assessmentType }}</span>
          </div>
        </div>

        <h3 class="text-sm font-bold text-surface-900 leading-snug">
          {{ tp.objective }}
        </h3>

        <!-- KKTP (Kriteria Ketercapaian) Rubrik 4 Interval -->
        <div class="p-3 bg-surface-50 rounded-xl border border-surface-100 space-y-1.5 text-xs">
          <div class="flex items-center justify-between pb-1 border-b border-surface-200">
            <span class="font-bold text-surface-700 text-[11px] uppercase">Kriteria Ketercapaian (KKTP):</span>
            <span class="text-[10px] text-surface-500">Pendekatan Interval Nilai</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
            <div class="p-2 rounded bg-rose-50/70 border border-rose-200 text-rose-900">
              <span class="font-bold block text-[10px] text-rose-700 uppercase">0 - 69 (Perlu Bimbingan)</span>
              <span>{{ tp.kktp.d }}</span>
            </div>
            <div class="p-2 rounded bg-amber-50/70 border border-amber-200 text-amber-900">
              <span class="font-bold block text-[10px] text-amber-700 uppercase">70 - 80 (Cukup)</span>
              <span>{{ tp.kktp.c }}</span>
            </div>
            <div class="p-2 rounded bg-blue-50/70 border border-blue-200 text-blue-900">
              <span class="font-bold block text-[10px] text-blue-700 uppercase">81 - 90 (Baik)</span>
              <span>{{ tp.kktp.b }}</span>
            </div>
            <div class="p-2 rounded bg-emerald-50/70 border border-emerald-200 text-emerald-900">
              <span class="font-bold block text-[10px] text-emerald-700 uppercase">91 - 100 (Sangat Baik)</span>
              <span>{{ tp.kktp.a }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Tambah TP -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      @click.self="showCreateModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-surface-100">
          <h3 class="text-base font-bold text-surface-900">Tambah Tujuan Pembelajaran (TP)</h3>
          <button @click="showCreateModal = false" class="text-surface-400 hover:text-surface-700">✕</button>
        </div>

        <form @submit.prevent="createNewObjective" class="space-y-3 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Kode TP</label>
              <input v-model="newTp.code" type="text" class="input text-xs font-mono" placeholder="Contoh: TP-INF-7.4" required />
            </div>
            <div>
              <label class="label">Elemen CP</label>
              <select v-model="newTp.element" class="input text-xs" required>
                <option value="Berpikir Komputasional (BK)">BK</option>
                <option value="Sistem Komputer (SK)">SK</option>
                <option value="Teknologi Informasi (TIK)">TIK</option>
                <option value="Algoritma & Pemrograman (AP)">AP</option>
              </select>
            </div>
          </div>

          <div>
            <label class="label">Deskripsi Tujuan Pembelajaran (TP)</label>
            <textarea
              v-model="newTp.objective"
              rows="3"
              class="input text-xs"
              placeholder="Peserta didik mampu..."
              required
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Alokasi Waktu (JP)</label>
              <input v-model.number="newTp.duration" type="number" min="1" max="10" class="input text-xs" />
            </div>
            <div>
              <label class="label">Jenis Asesmen</label>
              <select v-model="newTp.assessmentType" class="input text-xs">
                <option value="Formatif Lisan & Praktik">Formatif Lisan & Praktik</option>
                <option value="Tes Tertulis CBT">Tes Tertulis CBT</option>
                <option value="Penugasan Proyek">Penugasan Proyek</option>
              </select>
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
              Simpan TP
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const selectedGrade = ref('7')
const selectedSubject = ref(authStore.user?.subject || 'Mata Pelajaran')
const selectedElement = ref('all')
const showCreateModal = ref(false)

const availableElements = computed(() => {
  const subj = (authStore.user?.subject || '').toLowerCase()
  if (subj.includes('matematika')) {
    return ['Bilangan', 'Aljabar', 'Pengukuran', 'Geometri', 'Analisis Data & Peluang']
  }
  if (subj.includes('ipa')) {
    return ['Pemahaman IPA', 'Keterampilan Proses', 'Makhluk Hidup & Lingkungan', 'Zat dan Perubahannya', 'Energi']
  }
  if (subj.includes('indonesia')) {
    return ['Menyimak', 'Membaca & Memirsa', 'Berbicara & Mempresentasikan', 'Menulis']
  }
  if (subj.includes('informatika') || subj.includes('kka')) {
    return [
      'Berpikir Komputasional (BK)',
      'Sistem Komputer (SK)',
      'Teknologi Informasi (TIK)',
      'Jaringan Komputer (JKI)',
      'Analisis Data (AD)',
      'Algoritma & Pemrograman (AP)'
    ]
  }
  return ['Capaian 1', 'Capaian 2', 'Capaian 3', 'Praktik & Portofolio']
})

function onGradeChange() {
  if (authStore.user?.subject) {
    selectedSubject.value = authStore.user.subject
  }
}

const defaultSmp6Objectives = [
  {
    code: 'TP-INF-7.1',
    element: 'Sistem Komputer (SK)',
    duration: 4,
    assessmentType: 'Formatif & CBT',
    objective: 'Peserta didik mampu mengidentifikasi komponen penyusun komputer (input, pemroses, output, penyimpanan) dan interaksinya.',
    kktp: {
      d: 'Belum mampu menyebutkan komponen utama sistem komputer.',
      c: 'Mampu menyebutkan 4 komponen utama tanpa mampu menjelaskan fungsinya.',
      b: 'Mampu menjelaskan fungsi CPU, RAM, Harddisk, dan periferal dengan tepat.',
      a: 'Mampu menganalisis alur data antarkomponen serta mendiagnosis kendala hardware sederhana.'
    }
  },
  {
    code: 'TP-INF-7.2',
    element: 'Berpikir Komputasional (BK)',
    duration: 4,
    assessmentType: 'Formatif Praktik',
    objective: 'Peserta didik mampu menerapkan dekomposisi persoalan dan pengenalan pola untuk mengonversi bilangan biner ke desimal dan sebaliknya.',
    kktp: {
      d: 'Belum memahami konsep bit 0 dan 1.',
      c: 'Mampu menghitung biner 4-bit dengan bantuan tabel konversi.',
      b: 'Mampu mengonversi biner 8-bit ke desimal secara mandiri tanpa tabel.',
      a: 'Mampu memecahkan sandi biner teks ASCII dan menyusun kode representasi data biner.'
    }
  },
  {
    code: 'TP-INF-7.3',
    element: 'Teknologi Informasi (TIK)',
    duration: 6,
    assessmentType: 'Penugasan Produk',
    objective: 'Peserta didik mampu membuat dokumen laporan terstruktur dan integrasi lembar kerja grafis sesuai kaidah tata letak digital.',
    kktp: {
      d: 'Belum mampu menyusun format dokumen secara mandiri.',
      c: 'Mampu membuat dokumen sederhana dengan format dasar.',
      b: 'Mampu mengintegrasikan tabel dan grafik dengan rapi.',
      a: 'Mampu menyusun laporan komprehensif dengan sitasi dan desain profesional.'
    }
  }
]

const objectives = ref<any[]>(authStore.currentSchool?.id === 'sch-smpn6kendari' ? defaultSmp6Objectives : [])

const filteredObjectives = computed(() => {
  return objectives.value.filter(tp => {
    if (selectedElement.value === 'all') return true
    return tp.element.includes(selectedElement.value)
  })
})

const newTp = ref({
  code: '',
  element: 'Berpikir Komputasional (BK)',
  duration: 4,
  assessmentType: 'Formatif & CBT',
  objective: ''
})

function createNewObjective() {
  objectives.value.push({
    code: newTp.value.code,
    element: newTp.value.element,
    duration: newTp.value.duration,
    assessmentType: newTp.value.assessmentType,
    objective: newTp.value.objective,
    kktp: {
      d: 'Perlu pendampingan intensif.',
      c: 'Mencapai kriteria minimum.',
      b: 'Menguasai konsep secara utuh.',
      a: 'Sangat mahir dan mampu membimbing teman sebaya.'
    }
  })
  showCreateModal.value = false
  newTp.value = { code: '', element: 'Berpikir Komputasional (BK)', duration: 4, assessmentType: 'Formatif & CBT', objective: '' }
}
</script>
