<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold uppercase tracking-wider mb-2">
          <span>🛠️</span> Portal Administrator Website
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Ringkasan Platform Belajarena
        </h1>
        <p class="text-slate-600 text-xs sm:text-sm mt-1">
          Pantau seluruh statistik ekosistem platform: satuan pendidikan terdaftar, akun guru yang mendaftar, dan total siswa.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="fetchOverview"
          :disabled="loading"
          class="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shadow-xs transition flex items-center gap-2"
        >
          <span :class="{ 'animate-spin': loading }">🔄</span>
          <span>Segarkan Data</span>
        </button>
        <RouterLink
          to="/admin/schools"
          class="px-4 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#164255] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
        >
          <span>🏛️</span>
          <span>Kelola Sekolah</span>
        </RouterLink>
      </div>
    </div>

    <!-- Alert error jika gagal -->
    <div v-if="errorMessage" class="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
      <span>⚠️</span>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- KPI Metric Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card p-5 border-l-4 border-l-blue-600 bg-white shadow-xs space-y-2">
        <div class="flex items-center justify-between text-slate-500">
          <span class="text-xs uppercase font-extrabold tracking-wider">Satuan Pendidikan</span>
          <span class="text-xl">🏛️</span>
        </div>
        <div class="text-3xl font-black text-slate-900">{{ overviewData.total_schools || 0 }}</div>
        <p class="text-[11px] text-slate-500">Sekolah aktif terdaftar</p>
      </div>

      <div class="card p-5 border-l-4 border-l-emerald-600 bg-white shadow-xs space-y-2">
        <div class="flex items-center justify-between text-slate-500">
          <span class="text-xs uppercase font-extrabold tracking-wider">Guru Terdaftar</span>
          <span class="text-xl">👨‍🏫</span>
        </div>
        <div class="text-3xl font-black text-emerald-700">{{ overviewData.total_teachers || 0 }}</div>
        <p class="text-[11px] text-slate-500">Akun pengajar mandiri</p>
      </div>

      <div class="card p-5 border-l-4 border-l-indigo-600 bg-white shadow-xs space-y-2">
        <div class="flex items-center justify-between text-slate-500">
          <span class="text-xs uppercase font-extrabold tracking-wider">Total Siswa</span>
          <span class="text-xl">🎓</span>
        </div>
        <div class="text-3xl font-black text-indigo-700">{{ overviewData.total_students || 0 }}</div>
        <p class="text-[11px] text-slate-500">Siswa di semua sekolah</p>
      </div>

      <div class="card p-5 border-l-4 border-l-amber-500 bg-white shadow-xs space-y-2">
        <div class="flex items-center justify-between text-slate-500">
          <span class="text-xs uppercase font-extrabold tracking-wider">Rombel Kelas</span>
          <span class="text-xl">📚</span>
        </div>
        <div class="text-3xl font-black text-amber-700">{{ overviewData.total_classrooms || 0 }}</div>
        <p class="text-[11px] text-slate-500">Rombongan belajar terkelola</p>
      </div>
    </div>

    <!-- 2 Column Section: Pendaftaran Guru Terbaru & Sekolah Terdaftar -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Pendaftaran Guru Terkini -->
      <div class="card space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2.5">
            <span class="text-lg">👨‍🏫</span>
            <div>
              <h2 class="font-bold text-slate-900 text-sm">Pendaftaran Guru Terkini</h2>
              <p class="text-[11px] text-slate-500">Guru baru yang mendaftarkan ruang mengajarnya</p>
            </div>
          </div>
          <RouterLink to="/admin/users" class="text-xs font-bold text-blue-600 hover:text-blue-800">
            Lihat Semua &rarr;
          </RouterLink>
        </div>

        <div v-if="loading" class="py-8 text-center text-xs text-slate-400">
          Memuat data pendaftaran...
        </div>
        <div v-else-if="!overviewData.recent_teachers || overviewData.recent_teachers.length === 0" class="py-8 text-center text-xs text-slate-500">
          Belum ada riwayat pendaftaran guru baru.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                <th class="py-2.5 px-3">Nama Guru</th>
                <th class="py-2.5 px-3">Sekolah & Mapel</th>
                <th class="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="t in overviewData.recent_teachers" :key="t.id" class="hover:bg-slate-50/60 transition">
                <td class="py-2.5 px-3">
                  <span class="font-bold text-slate-900 block">{{ t.name }}</span>
                  <span class="text-[11px] text-slate-400 font-mono">{{ t.email }}</span>
                </td>
                <td class="py-2.5 px-3">
                  <span class="text-slate-800 font-semibold block">{{ t.school_name }}</span>
                  <span class="text-[11px] text-blue-700">{{ t.subject }}</span>
                </td>
                <td class="py-2.5 px-3">
                  <span
                    class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase"
                    :class="t.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'"
                  >
                    {{ t.is_active ? 'Aktif' : 'Suspend' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Ringkasan Satuan Pendidikan -->
      <div class="card space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2.5">
            <span class="text-lg">🏛️</span>
            <div>
              <h2 class="font-bold text-slate-900 text-sm">Satuan Pendidikan Terdaftar</h2>
              <p class="text-[11px] text-slate-500">Sebaran sekolah dan kapasitas pengguna</p>
            </div>
          </div>
          <RouterLink to="/admin/schools" class="text-xs font-bold text-blue-600 hover:text-blue-800">
            Kelola Lengkap &rarr;
          </RouterLink>
        </div>

        <div v-if="loading" class="py-8 text-center text-xs text-slate-400">
          Memuat data sekolah...
        </div>
        <div v-else-if="!overviewData.schools_summary || overviewData.schools_summary.length === 0" class="py-8 text-center text-xs text-slate-500">
          Belum ada satuan pendidikan terdaftar.
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="s in overviewData.schools_summary"
            :key="s.id"
            class="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xs transition space-y-2"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="font-bold text-xs text-slate-900">{{ s.name }}</h3>
                <p class="text-[11px] text-slate-500 font-mono">NPSN: {{ s.npsn }} &bull; 📍 {{ s.city }}, {{ s.province }}</p>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-center">
              <div class="bg-white p-1.5 rounded-xl border border-slate-100">
                <span class="block text-xs font-black text-slate-800">{{ s.teacher_count }}</span>
                <span class="block text-[9px] text-slate-400 uppercase font-bold">Guru</span>
              </div>
              <div class="bg-white p-1.5 rounded-xl border border-slate-100">
                <span class="block text-xs font-black text-slate-800">{{ s.student_count }}</span>
                <span class="block text-[9px] text-slate-400 uppercase font-bold">Siswa</span>
              </div>
              <div class="bg-white p-1.5 rounded-xl border border-slate-100">
                <span class="block text-xs font-black text-slate-800">{{ s.classroom_count }}</span>
                <span class="block text-[9px] text-slate-400 uppercase font-bold">Kelas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/services/api'

const loading = ref(false)
const errorMessage = ref('')
const overviewData = ref({
  total_schools: 0,
  total_teachers: 0,
  total_students: 0,
  total_classrooms: 0,
  schools_summary: [] as any[],
  recent_teachers: [] as any[]
})

async function fetchOverview() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await api.get('/admin/overview')
    if (res.data?.data) {
      overviewData.value = res.data.data
    }
  } catch (err: any) {
    console.error('Failed to load admin overview:', err)
    errorMessage.value = err.response?.data?.message || 'Gagal memuat data ringkasan platform.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOverview()
})
</script>

