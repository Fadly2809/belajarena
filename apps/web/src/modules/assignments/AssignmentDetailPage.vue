<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="card p-8 animate-pulse space-y-4">
      <div class="h-6 bg-surface-200 rounded w-1/4"></div>
      <div class="h-8 bg-surface-200 rounded w-1/2"></div>
      <div class="grid grid-cols-4 gap-4 mt-6">
        <div v-for="i in 4" :key="i" class="h-20 bg-surface-200 rounded"></div>
      </div>
    </div>

    <!-- Error / Not Found State -->
    <div v-else-if="!assignment" class="card p-12 text-center space-y-4">
      <div class="text-4xl">⚠️</div>
      <h2 class="text-lg font-bold text-surface-900">Tugas Tidak Ditemukan</h2>
      <p class="text-xs text-surface-500">
        Data penugasan ini mungkin telah dihapus atau tautan tidak valid.
      </p>
      <router-link to="/assignments" class="btn btn-primary text-xs inline-flex items-center gap-2">
        ← Kembali ke Daftar Tugas
      </router-link>
    </div>

    <!-- Main Content -->
    <div v-else class="space-y-6">
      <!-- Header -->
      <div class="card p-5 bg-white border border-surface-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <router-link to="/assignments" class="btn btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1">
            ← Kembali ke Tugas
          </router-link>
          <div>
            <div class="flex items-center gap-2">
              <span class="badge badge-primary text-[10px]">Kelas {{ assignment.classroom }} &bull; {{ assignment.subject }}</span>
              <span class="text-xs text-rose-600 font-bold">Batas: {{ assignment.deadline || 'Tidak ditentukan' }}</span>
            </div>
            <h1 class="text-xl font-bold text-surface-900 mt-1">
              {{ assignment.title }}
            </h1>
            <p v-if="assignment.description" class="text-xs text-surface-500 mt-1">
              {{ assignment.description }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="openImportModal"
            class="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
          >
            <span>📥</span> Masukkan ke Rekap Nilai Siswa
          </button>
          <button @click="exportSubmissions" class="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
            <span>📥</span> Unduh Rekap Nilai Tugas
          </button>
        </div>
      </div>

      <!-- Submission Stat Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="card p-4">
          <p class="text-xs text-surface-500 font-medium">Total Siswa</p>
          <p class="text-2xl font-black text-surface-900 mt-1">{{ assignment.totalStudents ?? 0 }}</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-surface-500 font-medium">Telah Mengumpulkan</p>
          <p class="text-2xl font-black text-emerald-600 mt-1">{{ assignment.submittedCount ?? 0 }}</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-surface-500 font-medium">Belum Mengumpulkan</p>
          <p class="text-2xl font-black text-rose-600 mt-1">{{ assignment.unsubmittedCount ?? 0 }}</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-surface-500 font-medium">Rata-rata Nilai</p>
          <p class="text-2xl font-black text-primary-600 mt-1">
            {{ assignment.avgScore !== null && assignment.avgScore !== undefined ? assignment.avgScore : '—' }}
          </p>
        </div>
      </div>

      <!-- Submissions Table -->
      <div class="card space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-surface-100">
          <h2 class="font-bold text-surface-900 text-sm">Daftar Pengumpulan Tugas Siswa</h2>
          <span class="text-xs text-surface-500">
            {{ assignment.submittedCount ?? 0 }} dari {{ assignment.totalStudents ?? 0 }} telah mengunggah
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="bg-surface-50 text-surface-600 font-semibold uppercase tracking-wider">
                <th class="py-3 px-4 w-12 text-center">No</th>
                <th class="py-3 px-4">Nama Siswa</th>
                <th class="py-3 px-4">Waktu Pengumpulan</th>
                <th class="py-3 px-4">Berkas Tugas</th>
                <th class="py-3 px-4 text-center">Nilai</th>
                <th class="py-3 px-4">Umpan Balik Guru</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-100">
              <tr v-for="(sub, idx) in assignment.submissions || []" :key="sub.id" class="hover:bg-surface-50/50">
                <td class="py-3 px-4 text-center text-surface-400 font-semibold">{{ idx + 1 }}</td>
                <td class="py-3 px-4 font-semibold text-surface-900">
                  {{ sub.studentName || sub.student_name }}
                  <span class="block text-[10px] text-surface-400 font-normal">NIS: {{ sub.nis || sub.student_nis }}</span>
                </td>
                <td class="py-3 px-4">
                  <span class="text-surface-700">{{ sub.submittedAt || sub.submitted_at }}</span>
                  <span v-if="sub.isLate" class="badge badge-warning text-[9px] ml-1">Terlambat</span>
                </td>
                <td class="py-3 px-4">
                  <div class="space-y-1">
                    <div v-if="sub.submission_text" class="text-xs text-surface-800 bg-surface-50 p-2 rounded-lg border border-surface-200">
                      <span class="text-[10px] font-bold text-surface-500 uppercase block mb-0.5">Teks Jawaban:</span>
                      <p class="whitespace-pre-wrap leading-relaxed">{{ sub.submission_text }}</p>
                    </div>
                    <div v-if="sub.file_url || sub.fileName" class="flex items-center gap-1.5">
                      <a
                        :href="getFileUrl(sub.file_url || sub.fileName)"
                        target="_blank"
                        @click="handlePreviewOrDownload(sub)"
                        class="text-primary-600 hover:underline flex items-center gap-1 font-medium text-xs bg-primary-50 px-2 py-1 rounded-md border border-primary-200"
                      >
                        <span>📎</span>
                        <span class="truncate max-w-[140px]">{{ sub.fileName || sub.file_url }}</span>
                      </a>
                    </div>
                    <span v-if="!sub.submission_text && !sub.file_url && !sub.fileName" class="text-surface-400 italic text-[11px]">Tidak ada lampiran</span>
                  </div>
                </td>
                <td class="py-3 px-4 text-center">
                  <span v-if="sub.score !== null && sub.score !== undefined" class="font-extrabold text-sm text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {{ sub.score }}
                  </span>
                  <span v-else class="text-surface-400 italic text-[11px]">Belum dinilai</span>
                </td>
                <td class="py-3 px-4 text-surface-600 text-[11px] max-w-xs truncate">
                  {{ sub.feedback || '-' }}
                </td>
                <td class="py-3 px-4 text-right">
                  <button
                    @click="openGradingModal(sub)"
                    class="btn btn-primary text-xs px-2.5 py-1 font-bold shadow-xs"
                  >
                    {{ sub.score !== null && sub.score !== undefined ? 'Ubah Nilai' : 'Beri Nilai' }}
                  </button>
                </td>
              </tr>
              <tr v-if="!assignment.submissions || assignment.submissions.length === 0">
                <td colspan="7" class="py-12 text-center text-surface-400">
                  <div class="flex flex-col items-center justify-center gap-2">
                    <div class="text-3xl">📥</div>
                    <p class="font-bold text-surface-700 text-sm">Belum ada tugas yang dikumpulkan</p>
                    <p class="text-xs text-surface-400">Berkas tugas yang diunggah siswa akan otomatis muncul di sini untuk diperiksa.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Penilaian Cepat -->
    <div
      v-if="selectedSub"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      @click.self="selectedSub = null"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-surface-100">
          <div>
            <h3 class="text-base font-bold text-surface-900">Penilaian Tugas Siswa</h3>
            <p class="text-xs text-surface-500">{{ selectedSub.studentName || selectedSub.student_name }} (NIS: {{ selectedSub.nis || selectedSub.student_nis }})</p>
          </div>
          <button @click="selectedSub = null" class="text-surface-400 hover:text-surface-700">✕</button>
        </div>

        <div class="space-y-2">
          <div v-if="selectedSub.submission_text" class="p-3 bg-surface-50 rounded-xl border border-surface-200 text-xs space-y-1">
            <span class="text-[10px] font-bold text-surface-500 uppercase block">Jawaban / Teks Siswa:</span>
            <p class="text-surface-800 whitespace-pre-wrap leading-relaxed">{{ selectedSub.submission_text }}</p>
          </div>

          <div v-if="selectedSub.file_url || selectedSub.fileName" class="p-3 bg-primary-50/60 rounded-xl border border-primary-200 text-xs flex items-center justify-between">
            <span class="text-surface-600 font-semibold">Berkas Lampiran / Tautan:</span>
            <a
              :href="getFileUrl(selectedSub.file_url || selectedSub.fileName)"
              target="_blank"
              class="font-bold text-primary-700 hover:underline flex items-center gap-1"
            >
              <span>📎</span> {{ selectedSub.fileName || selectedSub.file_url }}
            </a>
          </div>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="label">Nilai Tugas (Skala 0 - 100)</label>
            <input
              v-model.number="gradingForm.score"
              type="number"
              min="0"
              max="100"
              class="input text-sm font-bold text-center"
              required
            />
          </div>

          <div>
            <label class="label">Catatan & Umpan Balik Guru (Feedback)</label>
            <textarea
              v-model="gradingForm.feedback"
              rows="3"
              class="input text-xs"
              placeholder="Berikan apresiasi dan catatan konstruktif..."
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-surface-100">
          <button
            type="button"
            @click="selectedSub = null"
            class="btn btn-secondary text-xs px-4 py-2"
          >
            Batal
          </button>
          <button
            type="button"
            @click="saveGrade"
            class="btn btn-primary text-xs px-5 py-2 font-bold"
          >
            Simpan Nilai
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Masukkan ke Rekap Nilai Siswa -->
    <Teleport to="body">
      <div v-if="showImportModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
          <div class="p-5 bg-gradient-to-r from-purple-700 to-indigo-800 text-white flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xl">📥</span>
              <div>
                <h3 class="font-bold text-sm">Masukkan Nilai Tugas ke Rekap Nilai Siswa</h3>
                <p class="text-[11px] text-purple-200">
                  Tugas: {{ assignment?.title }}
                </p>
              </div>
            </div>
            <button @click="showImportModal = false" class="text-white/80 hover:text-white font-bold">✕</button>
          </div>

          <div class="p-5 space-y-4 text-xs">
            <div class="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-purple-950">
              <p class="font-bold flex items-center gap-1.5">
                <span>ℹ️</span> Integrasi Nilai Kurikulum Merdeka
              </p>
              <p class="text-[11px] text-purple-800 mt-1 leading-relaxed">
                Nilai tugas yang telah dinilai akan dimasukkan secara presisi ke kolom penilaian rapor yang dipilih. Siswa yang belum dinilai tidak akan diisi nilai palsu.
              </p>
            </div>

            <!-- Target Rombel & Mapel -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Target Kelas / Rombel</label>
                <select
                  v-model="importForm.classroom_id"
                  @change="importForm.subject_id = getSubjectIdForClass(importForm.classroom_id)"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                >
                  <option v-for="c in classrooms" :key="c.id" :value="c.id">
                    {{ formatClassLabel(c) }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Target Mata Pelajaran</label>
                <select
                  v-model="importForm.subject_id"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                >
                  <option v-for="s in getAvailableSubjectsForClass(importForm.classroom_id)" :key="s.id" :value="s.id">
                    {{ s.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Komponen Penilaian Target -->
            <div>
              <label class="block font-bold text-slate-700 mb-1.5">
                Pilih Komponen Nilai Rapor Target:
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <!-- Formatif Tugas 1 (Default) -->
                <label
                  class="p-2.5 rounded-xl border cursor-pointer transition flex items-start gap-2.5"
                  :class="importForm.component_key === 'tugas1' ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600' : 'border-slate-200 hover:bg-slate-50'"
                >
                  <input
                    type="radio"
                    v-model="importForm.component_key"
                    value="tugas1"
                    @change="setComponent('formatif', 'tugas1', 'Formatif — Tugas 1')"
                    class="mt-0.5 text-purple-600"
                  />
                  <div>
                    <span class="font-bold text-slate-900 block">Formatif — Tugas 1</span>
                    <span class="text-[10px] text-slate-500">Bobot 40% &bull; Penilaian Formatif Tugas</span>
                  </div>
                </label>

                <!-- Formatif Praktikum Lab -->
                <label
                  class="p-2.5 rounded-xl border cursor-pointer transition flex items-start gap-2.5"
                  :class="importForm.component_key === 'praktikum_lab' ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600' : 'border-slate-200 hover:bg-slate-50'"
                >
                  <input
                    type="radio"
                    v-model="importForm.component_key"
                    value="praktikum_lab"
                    @change="setComponent('formatif', 'praktikum_lab', 'Formatif — Praktikum Lab')"
                    class="mt-0.5 text-purple-600"
                  />
                  <div>
                    <span class="font-bold text-slate-900 block">Formatif — Praktikum Lab</span>
                    <span class="text-[10px] text-slate-500">Bobot 40% &bull; Penilaian Lab Komputer</span>
                  </div>
                </label>

                <!-- Formatif Proyek Portofolio -->
                <label
                  class="p-2.5 rounded-xl border cursor-pointer transition flex items-start gap-2.5"
                  :class="importForm.component_key === 'proyek_portofolio' ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600' : 'border-slate-200 hover:bg-slate-50'"
                >
                  <input
                    type="radio"
                    v-model="importForm.component_key"
                    value="proyek_portofolio"
                    @change="setComponent('formatif', 'proyek_portofolio', 'Formatif — Proyek Portofolio')"
                    class="mt-0.5 text-purple-600"
                  />
                  <div>
                    <span class="font-bold text-slate-900 block">Formatif — Proyek Koding</span>
                    <span class="text-[10px] text-slate-500">Bobot 40% &bull; Tugas Karya / Proyek</span>
                  </div>
                </label>

                <!-- Sumatif TP 1 -->
                <label
                  class="p-2.5 rounded-xl border cursor-pointer transition flex items-start gap-2.5"
                  :class="importForm.component_key === 'tp1' ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600' : 'border-slate-200 hover:bg-slate-50'"
                >
                  <input
                    type="radio"
                    v-model="importForm.component_key"
                    value="tp1"
                    @change="setComponent('sumatif_tp', 'tp1', 'Sumatif TP 1')"
                    class="mt-0.5 text-purple-600"
                  />
                  <div>
                    <span class="font-bold text-slate-900 block">Sumatif TP 1</span>
                    <span class="text-[10px] text-slate-500">Bobot 40% &bull; Lingkup Materi 1</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Preview Nilai Siswa -->
            <div>
              <span class="text-[10px] font-bold text-slate-500 uppercase">
                Pratinjau Nilai Siswa yang Telah Dinilai ({{ gradedSubmissions.length }} Siswa):
              </span>
              <div class="max-h-36 overflow-y-auto mt-1 border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
                <div
                  v-for="(p, i) in gradedSubmissions"
                  :key="i"
                  class="p-2 flex items-center justify-between text-[11px]"
                >
                  <span class="font-bold text-slate-800">{{ p.studentName }} <span class="font-mono text-slate-400 font-normal">({{ p.nis || '-' }})</span></span>
                  <span class="font-black text-emerald-700">Nilai: {{ p.score }}</span>
                </div>
                <div v-if="gradedSubmissions.length === 0" class="p-3 text-center text-slate-400 italic">
                  Belum ada siswa yang dinilai pada tugas ini. Beri nilai siswa terlebih dahulu sebelum memasukkan ke rekap.
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 bg-slate-50 border-t flex items-center justify-end gap-2">
            <button
              @click="showImportModal = false"
              class="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-200"
            >
              Batal
            </button>
            <button
              :disabled="isSubmittingImport || gradedSubmissions.length === 0"
              @click="submitImport"
              class="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <span v-if="isSubmittingImport">Memproses...</span>
              <span v-else>Konfirmasi & Masukkan ke Rekap Siswa</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'
import {
  useClassrooms,
  getSubjectIdForClass,
  getAvailableSubjectsForClass
} from '@/composables/useClassrooms'

const route = useRoute()
const { classrooms, fetchClassrooms, formatClassLabel } = useClassrooms()
const loading = ref(false)
const assignment = ref<any>(null)

const selectedSub = ref<any>(null)
const gradingForm = ref({
  score: 85,
  feedback: ''
})

// Import Modal State
const showImportModal = ref(false)
const isSubmittingImport = ref(false)
const importForm = ref({
  classroom_id: '',
  subject_id: 'sub-kka',
  component_type: 'formatif',
  component_key: 'tugas1',
  component_label: 'Formatif — Tugas 1'
})

const gradedSubmissions = computed(() => {
  return (assignment.value?.submissions || []).filter((s: any) => s.score !== null && s.score !== undefined)
})

function openImportModal() {
  const cls = classrooms.value.find(c => c.name === assignment.value?.classroom)
  importForm.value.classroom_id = cls?.id || (classrooms.value[0]?.id || 'cls-7a')
  importForm.value.subject_id = getSubjectIdForClass(importForm.value.classroom_id)
  showImportModal.value = true
}

function setComponent(type: string, key: string, label: string) {
  importForm.value.component_type = type
  importForm.value.component_key = key
  importForm.value.component_label = label
}

async function submitImport() {
  if (gradedSubmissions.value.length === 0) return
  isSubmittingImport.value = true
  try {
    const res = await api.post('/reports/grades/import-assignment', {
      assignment_id: assignment.value?.id,
      classroom_id: importForm.value.classroom_id,
      subject_id: importForm.value.subject_id,
      component_type: importForm.value.component_type,
      component_key: importForm.value.component_key,
      component_label: importForm.value.component_label
    })

    alert(res.data?.message || 'Nilai tugas berhasil dimasukkan ke Rekap Nilai Siswa!')
    showImportModal.value = false
  } catch (err: any) {
    console.error('Failed to import assignment grades:', err)
    alert(err.response?.data?.message || 'Gagal memasukkan nilai tugas ke Rekap Nilai Siswa.')
  } finally {
    isSubmittingImport.value = false
  }
}

async function loadAssignmentDetail() {
  loading.value = true
  try {
    const id = route.params.id as string
    const res = await api.get(`/assignments/${id}`)
    assignment.value = res.data?.data || res.data || null
  } catch (err) {
    console.error('Failed to load assignment detail:', err)
    assignment.value = null
  } finally {
    loading.value = false
  }
}

function openGradingModal(sub: any) {
  selectedSub.value = sub
  gradingForm.value = {
    score: sub.score !== null && sub.score !== undefined ? sub.score : 85,
    feedback: sub.feedback || ''
  }
}

async function saveGrade() {
  if (!selectedSub.value || !assignment.value) return
  try {
    await api.post(`/assignments/${assignment.value.id}/submissions/${selectedSub.value.id}`, {
      score: gradingForm.value.score,
      feedback: gradingForm.value.feedback
    })
    selectedSub.value = null
    await loadAssignmentDetail()
  } catch (err: any) {
    alert('Gagal menyimpan nilai: ' + (err.message || 'Terjadi kesalahan'))
  }
}

function getFileUrl(fileOrUrl?: string) {
  if (!fileOrUrl) return '#'
  if (fileOrUrl.startsWith('http://') || fileOrUrl.startsWith('https://')) return fileOrUrl
  return '#'
}

function handlePreviewOrDownload(sub: any) {
  const target = sub.file_url || sub.fileName
  if (target && (target.startsWith('http://') || target.startsWith('https://'))) {
    return
  }
  if (sub.submission_text) {
    alert(`Teks Jawaban dari ${sub.studentName || sub.student_name}:\n\n${sub.submission_text}`)
  } else {
    alert(`Berkas Lampiran: ${target || 'Tidak ada berkas'}`)
  }
}

function exportSubmissions() {
  if (!assignment.value) return
  const subs = assignment.value.submissions || []
  if (subs.length === 0) {
    alert('Belum ada data pengumpulan tugas untuk diunduh.')
    return
  }

  const csvRows = [
    ['No', 'Nama Siswa', 'NIS', 'Waktu Pengumpulan', 'Nama Berkas', 'Nilai', 'Catatan Guru'].join(','),
    ...subs.map((s: any, idx: number) => [
      idx + 1,
      `"${s.studentName || s.student_name || ''}"`,
      `"${s.nis || s.student_nis || ''}"`,
      `"${s.submittedAt || s.submitted_at || ''}"`,
      `"${s.fileName || s.file_url || s.submission_text || ''}"`,
      s.score ?? '',
      `"${(s.feedback || '').replace(/"/g, '""')}"`
    ].join(','))
  ]

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rekap_tugas_${assignment.value.title.replace(/\s+/g, '_')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(async () => {
  await fetchClassrooms()
  await loadAssignmentDetail()
})
</script>
