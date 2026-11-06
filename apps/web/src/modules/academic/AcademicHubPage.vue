<template>
  <div class="space-y-7 animate-fade-in pb-12 font-sans">
    <!-- 1. Header Pusat Akademik -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0c2b3d] text-[11px] font-bold uppercase tracking-wider">
            Menu Terpadu
          </span>
          <span class="text-xs text-slate-500 font-medium">{{ schoolName }}</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span>📁</span> Pusat Akademik Belajarena
        </h1>
        <p class="text-slate-600 text-sm mt-1 font-medium max-w-2xl">
          Satu pusat terpadu untuk pengelolaan kelas, penjadwalan, bank soal & CBT, penugasan siswa, serta pelaporan capaian belajar.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <span class="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold font-mono shadow-2xs">
          Kurikulum Merdeka (Fase D)
        </span>
        <div class="px-3.5 py-1.5 rounded-xl bg-[#0c2b3d] text-white text-xs font-bold flex items-center gap-2 shadow-sm">
          <span>{{ totalAvailableMenus }} Menu Tersedia</span>
        </div>
      </div>
    </div>

    <!-- 2. Search & Filter Bar -->
    <div class="bg-white rounded-[24px] shadow-card border border-slate-200/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="relative flex-1 max-w-md">
        <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari menu akademik (contoh: jadwal, absensi, ujian, nilai, materi)..."
          class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs font-bold"
        >
          ✕
        </button>
      </div>

      <!-- Category Filter Pills -->
      <div class="flex flex-wrap items-center gap-1.5">
        <button
          @click="selectedGroup = 'all'"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition"
          :class="selectedGroup === 'all' ? 'bg-[#0c2b3d] text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
        >
          Semua ({{ filteredTotalCount }})
        </button>
        <button
          v-for="group in filteredGroups"
          :key="group.id"
          @click="selectedGroup = group.id"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          :class="selectedGroup === group.id ? 'bg-[#0c2b3d] text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
        >
          <span>{{ group.icon }}</span>
          <span>{{ group.name }}</span>
          <span class="text-[10px] opacity-75">({{ group.items.length }})</span>
        </button>
      </div>
    </div>

    <!-- 3. Categorized Sections Grid -->
    <div class="space-y-8">
      <section
        v-for="group in displayGroups"
        :key="group.id"
        class="space-y-4"
      >
        <!-- Section Header -->
        <div class="flex items-center justify-between pb-2 border-b border-slate-200/70">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-[#0c2b3d] text-white flex items-center justify-center text-sm shadow-xs font-bold">
              {{ group.icon }}
            </div>
            <div>
              <h2 class="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>{{ group.name }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold font-mono">
                  {{ group.items.length }} menu
                </span>
              </h2>
              <p class="text-xs text-slate-500 font-medium">
                {{ group.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <RouterLink
            v-for="item in group.items"
            :key="item.name"
            :to="item.to"
            class="group bg-white rounded-[22px] p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between hover:-translate-y-0.5 relative overflow-hidden"
          >
            <!-- Accent Top Bar -->
            <div class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity" :class="item.gradient || 'from-[#0c2b3d] to-cyan-500'"></div>

            <div>
              <div class="flex items-start justify-between gap-2 mb-3">
                <div
                  class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-xs transition-transform group-hover:scale-105"
                  :class="item.iconBg || 'bg-blue-50 text-[#0c2b3d]'"
                  v-html="item.iconSvg"
                ></div>

                <div class="flex flex-col items-end gap-1">
                  <span
                    v-if="item.teacherOnly"
                    class="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider"
                  >
                    Khusus Guru
                  </span>
                  <span
                    v-if="item.badge"
                    class="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold"
                  >
                    {{ item.badge }}
                  </span>
                </div>
              </div>

              <h3 class="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">
                {{ item.label }}
              </h3>

              <p class="text-xs text-slate-500 leading-relaxed mt-1.5 font-medium line-clamp-2">
                {{ item.description }}
              </p>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-blue-600 transition-colors">
              <span>Buka Modul</span>
              <span class="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </RouterLink>
        </div>
      </section>

      <!-- Empty State jika pencarian tidak menemukan hasil -->
      <div
        v-if="displayGroups.length === 0"
        class="card p-12 text-center space-y-3"
      >
        <div class="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-3xl mx-auto">
          🔍
        </div>
        <h3 class="text-base font-bold text-slate-800">Menu Tidak Ditemukan</h3>
        <p class="text-xs text-slate-500 max-w-sm mx-auto">
          Tidak ada menu akademik yang cocok dengan kata kunci "{{ searchQuery }}". Silakan periksa kembali ejaan atau klik tombol reset.
        </p>
        <button
          @click="searchQuery = ''; selectedGroup = 'all'"
          class="px-4 py-2 rounded-xl bg-[#0c2b3d] text-white text-xs font-bold shadow-xs hover:bg-[#082231] transition"
        >
          Tampilkan Semua Menu
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const schoolName = computed(() => authStore.currentSchool?.name || 'Satuan Pendidikan')
const isStudent = computed(() => authStore.hasRole('student'))

const searchQuery = ref('')
const selectedGroup = ref('all')

interface AcademicItem {
  name: string
  to: string
  label: string
  description: string
  iconSvg: string
  iconBg: string
  gradient: string
  teacherOnly?: boolean
  badge?: string
}

interface AcademicGroup {
  id: string
  name: string
  icon: string
  description: string
  items: AcademicItem[]
}

const rawGroups: AcademicGroup[] = [
  {
    id: 'kelas-siswa',
    name: 'Kelas & Siswa',
    icon: '👥',
    description: 'Manajemen rombongan belajar, data induk profil siswa, jadwal mengajar mingguan, dan presensi kelas.',
    items: [
      {
        name: 'classes',
        to: '/classes',
        label: 'Manajemen Kelas',
        description: 'Kelola rombongan belajar, penetapan wali kelas, kapasitas rombel, dan pembagian ruang kelas.',
        iconSvg: `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`,
        iconBg: 'bg-blue-50 text-blue-700',
        gradient: 'from-blue-600 to-indigo-600',
        teacherOnly: true
      },
      {
        name: 'students',
        to: '/students',
        label: 'Data Siswa',
        description: 'Database lengkap biodata siswa, NIS/NISN, nomor kontak wali, dan rekam jejak akademik.',
        iconSvg: `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
        iconBg: 'bg-indigo-50 text-indigo-700',
        gradient: 'from-indigo-600 to-purple-600',
        teacherOnly: true
      },
      {
        name: 'schedule',
        to: '/schedule',
        label: 'Jadwal Mingguan',
        description: 'Jadwal tatap muka mata pelajaran per rombel dengan jam belajar terstruktur.',
        iconSvg: `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
        iconBg: 'bg-emerald-50 text-emerald-700',
        gradient: 'from-emerald-600 to-teal-600'
      },
      {
        name: 'attendance',
        to: '/attendance',
        label: 'Absensi Siswa',
        description: 'Pencatatan presensi kehadiran harian, jurnal pembelajaran di kelas, dan rekapitulasi status kehadiran.',
        iconSvg: `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`,
        iconBg: 'bg-teal-50 text-teal-700',
        gradient: 'from-teal-600 to-cyan-600'
      }
    ]
  },
  {
    id: 'penilaian-tugas',
    name: 'Penilaian & Tugas',
    icon: '📝',
    description: 'Bank butir soal, ujian digital CBT terstandar, lembar tugas praktikum koding, dan pemetaan kurikulum.',
    items: [
      {
        name: 'question-bank',
        to: '/question-bank',
        label: 'Bank Soal',
        description: 'Gudang bank butir soal pilihan ganda, esai, variasi tingkat kesulitan, dan kisi-kisi evaluasi.',
        iconSvg: `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
        iconBg: 'bg-amber-50 text-amber-700',
        gradient: 'from-amber-500 to-orange-600',
        teacherOnly: true
      },
      {
        name: 'cbt',
        to: '/cbt',
        label: 'Ujian CBT',
        description: 'Pelaksanaan ujian online berbasis komputer dengan timer otomatis, acak soal, dan koreksi instan.',
        iconSvg: `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,
        iconBg: 'bg-rose-50 text-rose-700',
        gradient: 'from-rose-600 to-red-600'
      },
      {
        name: 'assignments',
        to: '/assignments',
        label: 'Tugas Siswa',
        description: 'Penugasan proyek koding, lembar kerja praktikum, instruksi terpandu, dan evaluasi hasil tugas.',
        iconSvg: `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>`,
        iconBg: 'bg-purple-50 text-purple-700',
        gradient: 'from-purple-600 to-indigo-600'
      },
      {
        name: 'curriculum-chapters',
        to: '/curriculum/chapters',
        label: 'Mapping BAB & TP',
        description: 'Pemetaan Tujuan Pembelajaran (TP) Kurikulum Merdeka terhadap BAB pokok bahasan materi ajar.',
        iconSvg: `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>`,
        iconBg: 'bg-sky-50 text-sky-700',
        gradient: 'from-sky-600 to-blue-600',
        teacherOnly: true
      }
    ]
  },
  {
    id: 'laporan-materi',
    name: 'Laporan & Materi',
    icon: '📊',
    description: 'Pustaka materi ajar slide PPTX/PDF, rekap nilai ulangan harian, buku nilai siswa, dan live ranking.',
    items: [
      {
        name: 'report-exam-events',
        to: '/reports/exam-events',
        label: 'Rekap Nilai Ulangan',
        description: 'Rekapitulasi perolehan nilai setiap sesi ulangan harian dan analisis butir soal per kelas.',
        iconSvg: `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
        iconBg: 'bg-emerald-50 text-emerald-700',
        gradient: 'from-emerald-600 to-green-600'
      },
      {
        name: 'report-grades',
        to: '/reports/grades',
        label: 'Rekap Nilai Siswa',
        description: 'Buku nilai kumulatif, capaian ketercapaian KKTP, dan rekap formatif-sumatif untuk persiapan rapor.',
        iconSvg: `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>`,
        iconBg: 'bg-amber-50 text-amber-700',
        gradient: 'from-amber-500 to-yellow-600'
      },
      {
        name: 'rankings',
        to: '/rankings',
        label: 'Live Ranking',
        description: 'Papan peringkat keaktifan dan prestasi belajar kelas secara langsung dengan sistem skor cerdas.',
        iconSvg: `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>`,
        iconBg: 'bg-indigo-50 text-indigo-700',
        gradient: 'from-indigo-600 to-blue-600'
      },
      {
        name: 'presentations-library',
        to: '/presentations?tab=library',
        label: 'Materi Ajar (Pustaka File & Slide)',
        description: 'Pustaka modul slide PPTX/PDF, bahan ajar digital, dan file pendukung pembelajaran interaktif.',
        iconSvg: `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`,
        iconBg: 'bg-cyan-50 text-cyan-700',
        gradient: 'from-cyan-600 to-blue-600'
      }
    ]
  }
]

// Filter out teacherOnly items if user is a student
const filteredGroups = computed(() => {
  return rawGroups.map(group => {
    let items = group.items
    if (isStudent.value) {
      items = items.filter(i => !i.teacherOnly).map(i => {
        if (i.name === 'attendance') {
          return { ...i, label: 'Absensi Saya', description: 'Lihat status rekap kehadiran belajar pribadi di kelas.' }
        }
        return i
      })
    }
    return {
      ...group,
      items
    }
  }).filter(group => group.items.length > 0)
})

const totalAvailableMenus = computed(() => {
  return filteredGroups.value.reduce((acc, g) => acc + g.items.length, 0)
})

const filteredTotalCount = computed(() => {
  let count = 0
  displayGroups.value.forEach(g => {
    count += g.items.length
  })
  return count
})

const displayGroups = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return filteredGroups.value
    .filter(g => selectedGroup.value === 'all' || g.id === selectedGroup.value)
    .map(g => {
      if (!query) return g
      const matchedItems = g.items.filter(item => {
        return (
          item.label.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
        )
      })
      return {
        ...g,
        items: matchedItems
      }
    })
    .filter(g => g.items.length > 0)
})
</script>

