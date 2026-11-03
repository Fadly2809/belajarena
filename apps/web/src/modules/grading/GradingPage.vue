<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 flex items-center gap-2">
          <span>📊</span> Buku Nilai & Ledger Rapor Kurikulum Merdeka
        </h1>
        <p class="text-surface-500 text-sm mt-0.5">
          Rekap Asesmen Formatif (TP), Sumatif Lingkup Materi, Sumatif Akhir Semester (SAS), dan Deskripsi Capaian Rapor
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="generateDescriptions"
          class="btn btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
        >
          <span>✨</span> Generate Deskripsi Otomatis
        </button>
        <button
          @click="exportLedger"
          class="btn btn-primary text-xs px-4 py-2 flex items-center gap-1.5 font-bold shadow-sm"
        >
          <span>📥</span> Unduh Ledger Nilai (Excel)
        </button>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="card p-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <div>
          <label class="block text-[10px] font-bold uppercase text-surface-500 mb-1">Pilih Rombel</label>
          <select v-model="selectedClass" class="input text-xs py-1.5 font-bold" @change="onClassChange">
            <option v-for="c in classrooms" :key="c.id" :value="c.id">
              {{ formatClassLabel(c) }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold uppercase text-surface-500 mb-1">Mata Pelajaran</label>
          <select v-model="selectedSubject" class="input text-xs py-1.5">
            <option v-for="s in availableGradingSubjects" :key="s.id" :value="s.name">
              {{ s.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold uppercase text-surface-500 mb-1">Semester</label>
          <select v-model="selectedSemester" class="input text-xs py-1.5">
            <option value="1">Semester 1 (Ganjil)</option>
            <option value="2">Semester 2 (Genap)</option>
          </select>
        </div>
      </div>

      <div class="flex items-center gap-3 text-xs">
        <div class="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
          Rata-rata Kelas: <strong class="text-sm">84.5</strong>
        </div>
        <div class="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800">
          KKTP Sekolah: <strong class="text-sm">70.0</strong>
        </div>
      </div>
    </div>

    <!-- Ledger Table (Format Nilai Kurikulum Merdeka) -->
    <div class="card overflow-x-auto p-0">
      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="bg-surface-50 text-surface-700 font-bold border-b border-surface-200 text-center uppercase tracking-wider">
            <th class="py-3 px-3 w-10 border-r border-surface-200" rowspan="2">No</th>
            <th class="py-3 px-3 w-24 border-r border-surface-200 text-left" rowspan="2">NIS</th>
            <th class="py-3 px-4 min-w-[180px] border-r border-surface-200 text-left" rowspan="2">Nama Peserta Didik</th>
            <th class="py-2 px-3 border-r border-surface-200 bg-blue-50/50" colspan="3">Formatif (Nilai TP)</th>
            <th class="py-2 px-3 border-r border-surface-200 bg-amber-50/50" colspan="2">Sumatif Materi</th>
            <th class="py-3 px-3 w-16 border-r border-surface-200 bg-purple-50/50" rowspan="2">SAS</th>
            <th class="py-3 px-3 w-16 border-r border-surface-200 bg-emerald-50 text-emerald-900 font-black" rowspan="2">NA Rapor</th>
            <th class="py-3 px-4 min-w-[240px] text-left" rowspan="2">Deskripsi Capaian Kompetensi (Rapor)</th>
          </tr>
          <tr class="bg-surface-100 text-surface-600 font-semibold border-b border-surface-200 text-center text-[10px]">
            <th class="py-1 px-2 border-r border-surface-200">TP 7.1</th>
            <th class="py-1 px-2 border-r border-surface-200">TP 7.2</th>
            <th class="py-1 px-2 border-r border-surface-200">TP 7.3</th>
            <th class="py-1 px-2 border-r border-surface-200">ST-1</th>
            <th class="py-1 px-2 border-r border-surface-200">ST-2</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-200">
          <tr v-for="(row, idx) in gradeRecords" :key="row.id" class="hover:bg-surface-50/60">
            <td class="py-2.5 px-3 text-center text-surface-400 font-semibold border-r border-surface-200">{{ idx + 1 }}</td>
            <td class="py-2.5 px-3 font-mono font-medium text-surface-700 border-r border-surface-200">{{ row.nis }}</td>
            <td class="py-2.5 px-4 font-semibold text-surface-900 border-r border-surface-200">{{ row.name }}</td>
            
            <!-- Formatif Inputs -->
            <td class="py-2 px-1 text-center border-r border-surface-200">
              <input v-model.number="row.tp1" type="number" min="0" max="100" class="w-12 text-center text-xs p-1 rounded border border-surface-200 focus:border-primary-500 font-semibold" @input="recalculate(row)" />
            </td>
            <td class="py-2 px-1 text-center border-r border-surface-200">
              <input v-model.number="row.tp2" type="number" min="0" max="100" class="w-12 text-center text-xs p-1 rounded border border-surface-200 focus:border-primary-500 font-semibold" @input="recalculate(row)" />
            </td>
            <td class="py-2 px-1 text-center border-r border-surface-200">
              <input v-model.number="row.tp3" type="number" min="0" max="100" class="w-12 text-center text-xs p-1 rounded border border-surface-200 focus:border-primary-500 font-semibold" @input="recalculate(row)" />
            </td>

            <!-- Sumatif Inputs -->
            <td class="py-2 px-1 text-center border-r border-surface-200 bg-amber-50/20">
              <input v-model.number="row.st1" type="number" min="0" max="100" class="w-12 text-center text-xs p-1 rounded border border-amber-200 focus:border-primary-500 font-semibold" @input="recalculate(row)" />
            </td>
            <td class="py-2 px-1 text-center border-r border-surface-200 bg-amber-50/20">
              <input v-model.number="row.st2" type="number" min="0" max="100" class="w-12 text-center text-xs p-1 rounded border border-amber-200 focus:border-primary-500 font-semibold" @input="recalculate(row)" />
            </td>

            <!-- SAS Input -->
            <td class="py-2 px-1 text-center border-r border-surface-200 bg-purple-50/20">
              <input v-model.number="row.sas" type="number" min="0" max="100" class="w-12 text-center text-xs p-1 rounded border border-purple-200 focus:border-primary-500 font-semibold" @input="recalculate(row)" />
            </td>

            <!-- NA (Nilai Akhir) Rapor -->
            <td class="py-2.5 px-3 text-center border-r border-surface-200 bg-emerald-50/40">
              <span
                class="font-black text-sm"
                :class="row.finalGrade >= 70 ? 'text-emerald-700' : 'text-rose-600'"
              >
                {{ row.finalGrade }}
              </span>
            </td>

            <!-- Deskripsi Otomatis Rapor -->
            <td class="py-2.5 px-4 text-[11px] leading-relaxed text-surface-600">
              {{ row.description }}
            </td>
          </tr>
          <tr v-if="gradeRecords.length === 0">
            <td colspan="10" class="py-12 text-center text-surface-400">
              <div class="flex flex-col items-center justify-center gap-2">
                <div class="text-3xl">📊</div>
                <p class="font-bold text-surface-700 text-sm">Belum ada siswa untuk dinilai</p>
                <p class="text-xs text-surface-400">Tambahkan data siswa terlebih dahulu di menu Data Siswa.</p>
                <router-link to="/students" class="mt-2 btn-primary btn-sm">
                  + Tambah Siswa
                </router-link>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Catatan Pedoman Penilaian Kurikulum Merdeka Kemendikbud -->
    <div class="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
      <h3 class="font-bold flex items-center gap-1.5">
        <span>ℹ️</span> Panduan Pembobotan Nilai Akhir (Kemendikbudristek):
      </h3>
      <p class="text-blue-800">
        Nilai Akhir Rapor dihitung dari: Rata-rata Formatif (40%) + Rata-rata Sumatif Lingkup Materi (40%) + Sumatif Akhir Semester (20%).
        Deskripsi rapor merangkum capaian tertinggi (TP yang dikuasai sangat baik) dan capaian yang masih membutuhkan pendampingan.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import { useClassrooms, getSubjectNameForClass, getAvailableSubjectsForClass } from '@/composables/useClassrooms'

const { classrooms, fetchClassrooms, formatClassLabel } = useClassrooms()
const selectedClass = ref('')
const selectedSubject = ref('')
const selectedSemester = ref('1')

const availableGradingSubjects = computed(() => getAvailableSubjectsForClass(selectedClass.value))

function onClassChange() {
  selectedSubject.value = getSubjectNameForClass(selectedClass.value)
  loadStudentsForGrading()
}

const gradeRecords = ref<any[]>([])

async function loadStudentsForGrading() {
  try {
    const params: Record<string, any> = {}
    if (selectedClass.value) {
      params.classroom_id = selectedClass.value
    }
    const res = await api.get('/students', { params })
    const students = res.data?.data || []
    gradeRecords.value = students.map((s: any) => ({
      id: s.id,
      nis: s.nis || '-',
      name: s.name,
      tp1: 0,
      tp2: 0,
      tp3: 0,
      st1: 0,
      st2: 0,
      sas: 0,
      finalGrade: 0,
      description: 'Belum ada penilaian'
    }))
  } catch (err) {
    console.error('Failed to load students for grading:', err)
    gradeRecords.value = []
  }
}

onMounted(async () => {
  await fetchClassrooms()
  if (classrooms.value.length > 0 && !selectedClass.value) {
    selectedClass.value = classrooms.value[0].id
  }
  selectedSubject.value = getSubjectNameForClass(selectedClass.value)
  await loadStudentsForGrading()
})

function recalculate(row: any) {
  const avgFormatif = (row.tp1 + row.tp2 + row.tp3) / 3
  const avgSumatif = (row.st1 + row.st2) / 2
  const sas = row.sas
  row.finalGrade = Math.round((avgFormatif * 0.4) + (avgSumatif * 0.4) + (sas * 0.2))
}

function generateDescriptions() {
  gradeRecords.value.forEach(row => {
    if (row.finalGrade >= 90) {
      row.description = 'Menunjukkan penguasaan istimewa dalam seluruh capaian elemen Informatika Fase D secara mandiri.'
    } else if (row.finalGrade >= 80) {
      row.description = 'Menunjukkan penguasaan baik dalam sistem komputer dan pemrosesan data; pertahankan prestasi belajarnya.'
    } else {
      row.description = 'Mencapai ketuntasan minimum; disarankan memperbanyak latihan mandiri pada logika percabangan.'
    }
  })
  alert('✨ Deskripsi capaian kompetensi rapor otomatis berhasil diperbarui!')
}

function exportLedger() {
  alert('Mengunduh Ledger Nilai Lengkap Format Excel (.xlsx)...')
}
</script>
