<template>
  <div class="space-y-6">
    <!-- Screen Controls Bar (Hidden during Print) -->
    <div class="card p-4 flex flex-wrap items-center justify-between gap-4 print:hidden bg-white/95 backdrop-blur-md sticky top-0 z-20 shadow-md">
      <div class="flex items-center gap-3">
        <router-link to="/attendance" class="btn btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 shadow-2xs">
          ← Absensi Siswa
        </router-link>
        <div>
          <h2 class="font-bold text-surface-900 text-sm leading-tight">
            Laporan Rekapitulasi Presensi Siswa Resmi
          </h2>
          <span class="text-[11px] text-surface-500">
            {{ schoolInfo.name }} &bull; Semester Berjalan &bull; {{ schoolInfo.academic_year || '2026/2027' }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="printReport"
          class="btn btn-primary text-xs px-4 py-2 flex items-center gap-1.5 font-bold shadow-sm"
        >
          <span>🖨️</span> Cetak Berkas Presensi
        </button>
      </div>
    </div>

    <!-- Official Report Sheet -->
    <div class="card p-8 sm:p-12 bg-white max-w-4xl mx-auto border-2 border-surface-200 shadow-xl space-y-6 print:shadow-none print:border-none print:p-0">
      <!-- Kop Surat -->
      <div class="text-center pb-4 border-b-2 border-surface-900 space-y-1">
        <p class="text-xs uppercase font-extrabold tracking-widest text-surface-600">
          {{ schoolInfo.institution || 'PEMERINTAH KOTA KENDARI' }} &bull; {{ schoolInfo.department || 'DINAS PENDIDIKAN DAN KEBUDAYAAN' }}
        </p>
        <h1 class="text-xl sm:text-2xl font-black text-surface-900 tracking-wide">
          {{ schoolInfo.name || 'SATUAN PENDIDIKAN' }}
        </h1>
        <p class="text-xs text-surface-600">
          {{ schoolInfo.address || 'Alamat Satuan Pendidikan' }} &bull; NPSN: {{ schoolInfo.npsn || '-' }} &bull; Akreditasi: {{ schoolInfo.accreditation || 'A' }}
        </p>
        <div class="pt-2">
          <h2 class="text-sm font-black uppercase tracking-wider text-surface-900 underline">
            REKAPITULASI KEHADIRAN SISWA BULANAN & SEMESTER
          </h2>
        </div>
      </div>

      <!-- Info Identitas Kelas -->
      <div class="flex justify-between text-xs text-surface-800 pb-2">
        <div>
          <p><strong>Kelas / Rombel:</strong> Semua Rombel (Fase D)</p>
          <p><strong>Guru Pengampu:</strong> {{ teacherName }}</p>
        </div>
        <div class="text-right">
          <p><strong>Tahun Pelajaran:</strong> 2024/2025</p>
          <p><strong>Semester:</strong> 1 (Ganjil)</p>
        </div>
      </div>

      <!-- Table Rekap -->
      <table class="w-full text-xs text-left border border-surface-300">
        <thead>
          <tr class="bg-surface-100 font-bold border-b border-surface-300 text-center uppercase text-[10px]">
            <th class="p-2 border-r border-surface-300 w-10">No</th>
            <th class="p-2 border-r border-surface-300 w-24 text-left">NIS</th>
            <th class="p-2 border-r border-surface-300 text-left">Nama Peserta Didik</th>
            <th class="p-2 border-r border-surface-300 w-10">L/P</th>
            <th class="p-2 border-r border-surface-300 w-14">Hadir</th>
            <th class="p-2 border-r border-surface-300 w-12">Sakit</th>
            <th class="p-2 border-r border-surface-300 w-12">Izin</th>
            <th class="p-2 border-r border-surface-300 w-12">Alpa</th>
            <th class="p-2 w-20">% Kehadiran</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-300">
          <tr v-for="(st, idx) in list" :key="idx">
            <td class="p-2 text-center border-r border-surface-300">{{ idx + 1 }}</td>
            <td class="p-2 font-mono border-r border-surface-300">{{ st.nis }}</td>
            <td class="p-2 font-semibold border-r border-surface-300">{{ st.name }}</td>
            <td class="p-2 text-center border-r border-surface-300 font-bold">{{ st.gender }}</td>
            <td class="p-2 text-center border-r border-surface-300 font-bold text-emerald-700">{{ st.h }}</td>
            <td class="p-2 text-center border-r border-surface-300">{{ st.s }}</td>
            <td class="p-2 text-center border-r border-surface-300">{{ st.i }}</td>
            <td class="p-2 text-center border-r border-surface-300 font-bold" :class="st.a > 0 ? 'text-rose-600' : ''">{{ st.a }}</td>
            <td class="p-2 text-center font-bold text-surface-900">{{ st.rate }}%</td>
          </tr>
          <tr v-if="list.length === 0">
            <td colspan="7" class="p-8 text-center text-surface-400">
              Belum ada data presensi siswa untuk dicetak.
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Signatures -->
      <div class="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-surface-800">
        <div>
          <p>Mengetahui,</p>
          <p class="font-semibold">Kepala {{ schoolInfo.name }}</p>
          <div class="h-20"></div>
          <p class="font-bold underline">{{ schoolInfo.principal_name || 'Kepala Sekolah' }}</p>
          <p class="text-[10px] text-surface-500">NIP. {{ schoolInfo.principal_nip || '-' }}</p>
        </div>

        <div>
          <p>{{ schoolInfo.city || 'Kota' }}, {{ printDate }}</p>
          <p class="font-semibold">Guru Pengampu</p>
          <div class="h-20"></div>
          <p class="font-bold underline">{{ teacherName }}</p>
          <p class="text-[10px] text-surface-500">NIP. {{ teacherNip }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const authStore = useAuthStore()
const schoolInfo = computed(() => authStore.currentSchool || {
  name: 'Satuan Pendidikan',
  institution: 'PEMERINTAH KOTA KENDARI',
  department: 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
  address: 'Alamat Satuan Pendidikan',
  npsn: '-',
  accreditation: 'A',
  principal_name: 'Kepala Sekolah',
  principal_nip: '-',
  city: 'Kendari',
  academic_year: '2026/2027'
})
const teacherName = computed(() => authStore.user?.name || 'Guru Pengampu')
const teacherNip = computed(() => (authStore.user as any)?.nip || '-')
const printDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

const list = ref<any[]>([])

async function loadData() {
  try {
    const res = await api.get('/students')
    const students = res.data?.data || []
    list.value = students.map((s: any) => ({
      nis: s.nis || '-',
      name: s.name,
      gender: s.gender || 'L',
      h: 0,
      s: 0,
      i: 0,
      a: 0,
      rate: s.attendance_rate || 0
    }))
  } catch (err) {
    console.error('Failed to load attendance report students:', err)
    list.value = []
  }
}

onMounted(() => {
  loadData()
})

function printReport() {
  window.print()
}
</script>
