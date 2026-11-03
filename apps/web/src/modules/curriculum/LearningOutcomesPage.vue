<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 flex items-center gap-2">
          <span>📜</span> Dokumen Capaian Pembelajaran (CP) Resmi
        </h1>
        <p class="text-surface-500 text-sm mt-0.5">
          Standar Kompetensi Lulusan Fase D (SMP Kelas 7-9) berdasarkan BSKAP Kemendikbudristek RI
        </p>
      </div>
      <div class="flex items-center gap-2">
        <router-link to="/curriculum" class="btn btn-secondary text-xs px-3 py-2 flex items-center gap-1">
          ← Struktur Kurikulum
        </router-link>
        <router-link to="/curriculum/objectives" class="btn btn-primary text-xs px-4 py-2 font-bold">
          Kelola Tujuan Pembelajaran (TP) →
        </router-link>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="card p-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <div>
          <select v-model="selectedSubject" class="input text-xs py-1.5 font-bold">
            <option value="Informatika">Informatika (Kelas 9)</option>
            <option value="KKA">KKA - Koding & Kecerdasan Artifisial (Kelas 7)</option>
          </select>
        </div>
      </div>
      <div class="w-full sm:w-64">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari kata kunci capaian..."
          class="input text-xs py-1.5"
        />
      </div>
    </div>

    <!-- CP Outcome List -->
    <div class="space-y-4">
      <div
        v-for="item in filteredOutcomes"
        :key="item.code"
        class="card p-5 border border-surface-200 space-y-3 hover:shadow-md transition"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-lg bg-primary-100 text-primary-800 font-mono text-xs font-black">
              {{ item.code }}
            </span>
            <span class="font-bold text-surface-900 text-sm">{{ item.elementName }}</span>
          </div>
          <span class="badge badge-primary text-[10px]">{{ item.targetPhase }}</span>
        </div>

        <p class="text-xs text-surface-700 leading-relaxed bg-surface-50 p-3 rounded-xl border border-surface-100">
          {{ item.outcomeText }}
        </p>

        <div class="flex items-center justify-between text-xs text-surface-500 pt-1">
          <span>Karakter Terkait: <strong>{{ item.p3Tags.join(', ') }}</strong></span>
          <router-link to="/curriculum/objectives" class="text-primary-600 font-bold hover:underline">
            Lihat Alur TP &raquo;
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const selectedSubject = ref('Informatika')
const searchQuery = ref('')

const outcomes = ref([
  {
    code: 'CP-INF-BK',
    subject: 'Informatika',
    elementName: 'Berpikir Komputasional (BK)',
    targetPhase: 'Fase D (Kelas 7-9)',
    outcomeText: 'Peserta didik mampu menerapkan berpikir komputasional untuk menghasilkan solusi terstruktur dari persoalan komputasi sehari-hari melalui dekomposisi, pengenalan pola, abstraksi, dan algoritma.',
    p3Tags: ['Bernalar Kritis', 'Mandiri']
  },
  {
    code: 'CP-INF-SK',
    subject: 'Informatika',
    elementName: 'Sistem Komputer (SK)',
    targetPhase: 'Fase D (Kelas 7-9)',
    outcomeText: 'Peserta didik mampu mendeskripsikan komponen, fungsi, dan cara kerja komputer yang membentuk sistem komputasi serta menjelaskan proses dan penggunaan kodifikasi data biner.',
    p3Tags: ['Bernalar Kritis']
  },
  {
    code: 'CP-INF-AP',
    subject: 'Informatika',
    elementName: 'Algoritma dan Pemrograman (AP)',
    targetPhase: 'Fase D (Kelas 9)',
    outcomeText: 'Peserta didik mampu memahami objek-objek dan instruksi dalam lingkungan pemrograman visual (blok), serta merancang dan menguji program visual modular yang memecahkan masalah kontekstual.',
    p3Tags: ['Kreatif', 'Bernalar Kritis']
  },
  {
    code: 'CP-KKA-KD',
    subject: 'KKA',
    elementName: 'Koding Dasar & Algoritma Visual (KD)',
    targetPhase: 'Fase D (Kelas 7)',
    outcomeText: 'Peserta didik mampu memahami logika blok visual, sekuensial, dan perulangan sederhana melalui platform koding edukatif untuk memecahkan teka-teki.',
    p3Tags: ['Bernalar Kritis', 'Kreatif']
  },
  {
    code: 'CP-KKA-AI',
    subject: 'KKA',
    elementName: 'Pengenalan Kecerdasan Artifisial (AI)',
    targetPhase: 'Fase D (Kelas 7)',
    outcomeText: 'Peserta didik mampu mengenali konsep dasar kecerdasan buatan, model pengenalan gambar dan teks, serta etika pemanfaatan AI secara bijak.',
    p3Tags: ['Mandiri', 'Bernalar Kritis']
  }
])

const filteredOutcomes = computed(() => {
  return outcomes.value.filter(o => {
    if (selectedSubject.value && !o.subject.toLowerCase().includes(selectedSubject.value.toLowerCase())) {
      return false
    }
    return (
      o.elementName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      o.outcomeText.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })
})
</script>
