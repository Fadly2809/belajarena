<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 flex items-center gap-2">
          <span>📚</span> Struktur Kurikulum Merdeka (Fase D SMP)
        </h1>
        <p class="text-surface-500 text-sm mt-0.5">
          Capaian Pembelajaran (CP), Alur Tujuan Pembelajaran (ATP), dan 8 Elemen Inti untuk Jenjang SMP Kelas 7-9
        </p>
      </div>
      <div class="flex items-center gap-2">
        <router-link
          to="/curriculum/objectives"
          class="btn btn-primary text-sm flex items-center gap-2"
        >
          <span>🎯</span> Kelola Tujuan Pembelajaran (TP & KKTP)
        </router-link>
      </div>
    </div>

    <!-- Subject Selector Bar -->
    <div class="card p-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="sub in subjects"
          :key="sub.id"
          @click="activeSubject = sub.id"
          :class="[
            'px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5',
            activeSubject === sub.id ? 'bg-primary-600 text-white shadow-sm' : 'bg-surface-50 text-surface-700 hover:bg-surface-100'
          ]"
        >
          <span>{{ sub.icon }}</span>
          <span>{{ sub.name }}</span>
        </button>
      </div>

      <div class="text-xs text-surface-500 font-medium">
        Fase D &bull; Total {{ currentSubjectData.elements.length }} Elemen Pembelajaran
      </div>
    </div>

    <!-- Overview Capaian Pembelajaran (CP) Umum Fase D -->
    <div class="card p-6 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 border border-blue-200 space-y-3">
      <div class="flex items-center justify-between">
        <span class="badge badge-primary text-[10px] uppercase font-bold tracking-wider">
          Keputusan Kepala BSKAP Kemendikbudristek No. 032/H/KR/2024
        </span>
        <span class="text-xs font-bold text-primary-700">Fase D (Usia 13-15 Tahun)</span>
      </div>

      <h2 class="text-lg font-bold text-surface-900">
        Capaian Pembelajaran Umum Mata Pelajaran {{ currentSubjectData.name }}
      </h2>

      <p class="text-xs text-surface-700 leading-relaxed">
        {{ currentSubjectData.cpGeneral }}
      </p>
    </div>

    <!-- Daftar Elemen Capaian Pembelajaran -->
    <div class="space-y-4">
      <h3 class="text-base font-bold text-surface-900 flex items-center gap-2">
        <span>🧩</span> Elemen & Rincian Capaian per Elemen (Fase D)
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="(el, idx) in currentSubjectData.elements"
          :key="idx"
          class="card hover:shadow-md transition border border-surface-200 flex flex-col justify-between"
        >
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-1 rounded-md text-[10px] font-black tracking-wide bg-primary-100 text-primary-800">
                {{ el.code }}
              </span>
              <span class="text-[11px] text-surface-400 font-semibold">{{ el.targetClass }}</span>
            </div>

            <h4 class="font-bold text-surface-900 text-sm">{{ el.name }}</h4>

            <p class="text-xs text-surface-600 leading-relaxed">
              {{ el.description }}
            </p>
          </div>

          <div class="pt-3 mt-3 border-t border-surface-100 flex items-center justify-between">
            <span class="text-[11px] text-primary-600 font-semibold">
              {{ el.tpCount }} Tujuan Pembelajaran (TP)
            </span>
            <router-link
              to="/curriculum/objectives"
              class="text-xs font-bold text-primary-600 hover:text-primary-800"
            >
              Rincian ATP →
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const activeSubject = ref('info')

const subjects = [
  { id: 'info', name: 'Informatika (Kelas IX)', icon: '💻' },
  { id: 'kka', name: 'KKA - Koding & Kecerdasan Artifisial (Kelas VII)', icon: '🤖' }
]

const subjectDataMap: Record<string, any> = {
  info: {
    name: 'Informatika (Kelas IX)',
    cpGeneral: 'Pada akhir fase D, peserta didik mampu memahami peran sistem komputasi, menerapkan berpikir komputasional secara terstruktur, memanfaatkan perkakas TIK untuk komunikasi dan kolaborasi, serta menganalisis dampak sosial teknologi informasi dalam kehidupan sehari-hari secara kritis dan bijak.',
    elements: [
      {
        code: 'BK',
        name: 'Berpikir Komputasional (Computational Thinking)',
        targetClass: 'Kelas IX',
        description: 'Menerapkan dekomposisi, pengenalan pola, abstraksi, dan perancangan algoritma untuk memecahkan persoalan sehari-hari secara logis.',
        tpCount: 6
      },
      {
        code: 'TIK',
        name: 'Teknologi Informasi dan Komunikasi',
        targetClass: 'Kelas IX',
        description: 'Memanfaatkan aplikasi pengolah kata, lembar kerja, presentasi, dan surel untuk integrasi konten dan pengelolaan berkas efisien.',
        tpCount: 5
      },
      {
        code: 'SK',
        name: 'Sistem Komputer (Computer Systems)',
        targetClass: 'Kelas IX',
        description: 'Memahami komponen perangkat keras (CPU, memori, I/O), perangkat lunak, sistem operasi, serta interaksi antarperangkat.',
        tpCount: 4
      },
      {
        code: 'JKI',
        name: 'Jaringan Komputer dan Internet',
        targetClass: 'Kelas IX',
        description: 'Memahami prinsip konektivitas jaringan lokal (LAN), internet nirkabel (Wi-Fi/Bluetooth), dan proteksi privasi peramban web.',
        tpCount: 4
      },
      {
        code: 'AD',
        name: 'Analisis Data',
        targetClass: 'Kelas IX',
        description: 'Mengumpulkan, membersihkan, menyortir, memfilter, dan memvisualisasikan data kuantitatif menggunakan perkakas digital.',
        tpCount: 5
      },
      {
        code: 'AP',
        name: 'Algoritma dan Pemrograman',
        targetClass: 'Kelas IX',
        description: 'Merancang program modular dan visual yang memuat variabel, percabangan logika kondisional, dan loop perulangan.',
        tpCount: 7
      },
      {
        code: 'DSI',
        name: 'Dampak Sosial Informatika',
        targetClass: 'Kelas IX',
        description: 'Menghargai hak kekayaan intelektual (HAKI), mencegah cyberbullying, mengenali hoaks digital, dan etika berinternet sehat.',
        tpCount: 4
      },
      {
        code: 'PLB',
        name: 'Praktik Lintas Bidang',
        targetClass: 'Kelas IX',
        description: 'Bekerja sama dalam tim untuk menghasilkan artefak komputasional nyata yang memecahkan masalah kontekstual di lingkungan sekolah.',
        tpCount: 3
      }
    ]
  },
  kka: {
    name: 'KKA - Koding dan Kecerdasan Artifisial (Kelas VII)',
    cpGeneral: 'Pada akhir fase D kelas VII, peserta didik memahami konsep dasar instruksi sekuensial dan logika algoritma visual (koding blok), mengenal prinsip pembelajaran mesin dan kecerdasan artifisial, serta menerapkan etika pemanfaatan teknologi kecerdasan buatan dalam pemecahan masalah nyata.',
    elements: [
      {
        code: 'KD',
        name: 'Koding Dasar & Logika Blok',
        targetClass: 'Kelas VII',
        description: 'Memahami blok perintah sekuensial, percabangan sederhana, dan perulangan menggunakan simulator lingkungan pemrograman edukatif.',
        tpCount: 6
      },
      {
        code: 'AI',
        name: 'Pengenalan Kecerdasan Artifisial',
        targetClass: 'Kelas VII',
        description: 'Mengenal konsep dasar kecerdasan buatan, model pengenalan gambar, pola, dan suara, serta pemanfaatan AI yang bertanggung jawab.',
        tpCount: 5
      },
      {
        code: 'ETI',
        name: 'Etika & Keamanan AI',
        targetClass: 'Kelas VII',
        description: 'Memahami dampak sosial, privasi data peserta didik, dan etika kejujuran akademik dalam pemanfaatan alat bantu AI generatif.',
        tpCount: 4
      }
    ]
  }
}

const currentSubjectData = computed(() => {
  return subjectDataMap[activeSubject.value] || subjectDataMap['info']
})
</script>
