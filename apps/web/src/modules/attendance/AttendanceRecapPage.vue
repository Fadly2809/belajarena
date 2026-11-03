<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 flex items-center gap-2">
          <span>📊</span> Rekapitulasi Presensi Kehadiran Siswa
        </h1>
        <p class="text-surface-500 text-sm mt-0.5">
          Tahun Ajaran 2024/2025 &bull; Semester Ganjil &bull; Akumulasi hadir (H), sakit (S), izin (I), dan alpa (A)
        </p>
      </div>
      <div class="flex items-center gap-2">
        <router-link to="/attendance" class="btn btn-secondary text-xs px-3 py-2 flex items-center gap-1">
          ← Presensi Harian
        </router-link>
        <button @click="exportExcel" class="btn btn-primary text-xs px-4 py-2 flex items-center gap-1.5 font-bold shadow-sm">
          <span>📥</span> Unduh Rekap (Excel)
        </button>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="card p-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <div>
          <label class="block text-[10px] font-bold uppercase text-surface-500 mb-1">Rombel Kelas</label>
          <select v-model="selectedClass" class="input text-xs py-1.5" @change="loadRecap">
            <option v-for="c in classrooms" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
      </div>

      <div class="flex items-center gap-3 text-xs">
        <div class="p-2.5 rounded-xl border text-xs" :class="avgClassRate !== null ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'">
          Rata-rata Kehadiran: <strong class="text-sm font-bold">{{ avgClassRate !== null ? `${avgClassRate}%` : '—' }}</strong>
        </div>
        <div class="p-2.5 rounded-xl bg-surface-100 text-surface-700 text-xs">
          Total Sesi Presensi: <strong class="text-sm font-bold">{{ totalSessionsCount }} Sesi</strong>
        </div>
      </div>
    </div>

    <!-- Rekap Table -->
    <div class="card p-0 overflow-x-auto">
      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="bg-surface-50 text-surface-700 font-bold border-b border-surface-200 text-center uppercase tracking-wider text-[11px]">
            <th class="py-3 px-3 w-12 border-r border-surface-200" rowspan="2">No</th>
            <th class="py-3 px-4 w-28 border-r border-surface-200 text-left" rowspan="2">NIS</th>
            <th class="py-3 px-4 min-w-[200px] border-r border-surface-200 text-left" rowspan="2">Nama Peserta Didik</th>
            <th class="py-2 px-3 border-r border-surface-200 text-center w-12" rowspan="2">L/P</th>
            <th class="py-2 px-3 border-r border-surface-200 bg-surface-100" colspan="4">Rincian Hari Kehadiran</th>
            <th class="py-3 px-4 w-28 text-center bg-emerald-50 text-emerald-900 font-black" rowspan="2">% Kehadiran</th>
            <th class="py-3 px-4 w-28 text-center" rowspan="2">Status</th>
          </tr>
          <tr class="bg-surface-100 text-surface-600 font-semibold border-b border-surface-200 text-center text-[10px]">
            <th class="py-1 px-2 border-r border-surface-200 text-emerald-700 font-bold">Hadir (H)</th>
            <th class="py-1 px-2 border-r border-surface-200 text-blue-700 font-bold">Sakit (S)</th>
            <th class="py-1 px-2 border-r border-surface-200 text-amber-700 font-bold">Izin (I)</th>
            <th class="py-1 px-2 border-r border-surface-200 text-rose-700 font-bold">Alpa (A)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-100">
          <tr v-for="(row, idx) in recapRecords" :key="row.id" class="hover:bg-surface-50/50">
            <td class="py-2.5 px-3 text-center border-r border-surface-100 text-surface-400 font-semibold">{{ idx + 1 }}</td>
            <td class="py-2.5 px-4 font-mono font-semibold border-r border-surface-100">{{ row.nis }}</td>
            <td class="py-2.5 px-4 font-bold text-surface-900 border-r border-surface-100">{{ row.name }}</td>
            <td class="py-2.5 px-3 text-center border-r border-surface-100 font-semibold text-surface-600">{{ row.gender }}</td>
            <td class="py-2.5 px-2 text-center border-r border-surface-100 font-bold text-emerald-700">{{ row.present }}</td>
            <td class="py-2.5 px-2 text-center border-r border-surface-100 font-medium text-blue-700">{{ row.sick }}</td>
            <td class="py-2.5 px-2 text-center border-r border-surface-100 font-medium text-amber-700">{{ row.permission }}</td>
            <td class="py-2.5 px-2 text-center border-r border-surface-100 font-bold text-rose-600">{{ row.unexcused }}</td>

            <td class="py-2.5 px-4 text-center border-r border-surface-100 bg-emerald-50/20">
              <span v-if="row.hasRecords" class="font-black text-xs text-emerald-700">
                {{ row.rate }}%
              </span>
              <span v-else class="text-xs text-slate-400 font-medium">—</span>
            </td>

            <td class="py-2.5 px-4 text-center">
              <span v-if="row.hasRecords"
                :class="[
                  'badge text-[10px] uppercase font-bold',
                  row.rate >= 90 ? 'badge-success' : row.rate >= 80 ? 'badge-warning' : 'badge-danger'
                ]"
              >
                {{ row.rate >= 90 ? 'Sangat Rajin' : row.rate >= 80 ? 'Cukup' : 'Perhatian Khusus' }}
              </span>
              <span v-else class="badge badge-secondary text-[10px]">
                Belum Diabsen
              </span>
            </td>
          </tr>
          <tr v-if="recapRecords.length === 0">
            <td colspan="10" class="py-12 text-center text-surface-400">
              <div class="flex flex-col items-center justify-center gap-2">
                <div class="text-3xl">📋</div>
                <p class="font-bold text-surface-700 text-sm">Belum ada siswa di kelas ini</p>
                <p class="text-xs text-surface-400">Silakan input siswa melalui menu Data Siswa.</p>
                <router-link to="/students" class="mt-2 btn-primary btn-sm">
                  + Input Data Siswa
                </router-link>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const classrooms = ref<any[]>([])
const selectedClass = ref('cls-7a')
const recapRecords = ref<any[]>([])
const totalSessionsCount = ref(0)

const avgClassRate = computed(() => {
  const recorded = recapRecords.value.filter(r => r.hasRecords)
  if (recorded.length === 0) return null
  const sum = recorded.reduce((acc, r) => acc + r.rate, 0)
  return Math.round(sum / recorded.length)
})

async function loadClassrooms() {
  try {
    const res = await api.get('/classrooms')
    classrooms.value = res.data?.data || []
    if (classrooms.value.length > 0 && !selectedClass.value) {
      selectedClass.value = classrooms.value[0].id
    }
  } catch {
    classrooms.value = []
  }
}

async function loadRecap() {
  try {
    const [studentsRes, sessionsRes] = await Promise.all([
      api.get('/students', { params: { classroom_id: selectedClass.value } }),
      api.get('/sessions', { params: { classroom_id: selectedClass.value } })
    ])

    const students = studentsRes.data?.data || []
    const sessions = sessionsRes.data?.data || []
    totalSessionsCount.value = sessions.length

    recapRecords.value = students.map((s: any) => {
      const present = Number(s.present_count ?? 0)
      const sick = Number(s.sick_count ?? 0)
      const permission = Number(s.permission_count ?? 0)
      const unexcused = Number(s.unexcused_count ?? 0)
      const totalAtt = Number(s.attendance_count ?? (present + sick + permission + unexcused))
      const hasRecords = totalAtt > 0 || (s.attendance_rate !== null && s.attendance_rate !== undefined)
      const rate = hasRecords ? Number(s.attendance_rate ?? (totalAtt > 0 ? Math.round((present / totalAtt) * 100) : 0)) : null
      return {
        id: s.id,
        nis: s.nis || '—',
        name: s.name,
        gender: s.gender || 'L',
        present,
        sick,
        permission,
        unexcused,
        hasRecords,
        rate
      }
    })
  } catch (err) {
    console.error('Failed to load recap students:', err)
    recapRecords.value = []
  }
}

onMounted(async () => {
  await loadClassrooms()
  await loadRecap()
})

function exportExcel() {
  alert('Mengunduh Rekapitulasi Presensi Kehadiran Kelas (Format Excel)...')
}
</script>
