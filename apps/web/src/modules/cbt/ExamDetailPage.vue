<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="card p-12 text-center text-surface-500">
      <div class="spinner w-8 h-8 mx-auto mb-3"></div>
      <p class="text-xs font-medium">Memuat detail data ujian CBT...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMsg" class="card p-8 text-center text-surface-600 space-y-3">
      <div class="text-3xl">⚠️</div>
      <p class="text-sm font-bold text-rose-600">{{ errorMsg }}</p>
      <router-link to="/cbt" class="btn btn-secondary text-xs px-4 py-2 inline-flex items-center gap-1.5">
        ← Kembali ke Bank Ujian CBT
      </router-link>
    </div>

    <template v-else-if="exam">
      <!-- Header Banner -->
      <div class="card p-6 bg-gradient-to-r from-primary-900 to-indigo-950 text-white rounded-2xl shadow-lg">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="badge badge-primary text-[10px] bg-white/20 text-white border-none">
                {{ exam.subject_name || 'Informatika' }} &bull; Kelas {{ exam.classroom_name || 'VII A' }}
              </span>
              <span
                class="badge text-[10px]"
                :class="exam.status === 'active' ? 'badge-success' : (exam.status === 'completed' ? 'bg-surface-700 text-white' : 'badge-warning')"
              >
                {{ formatStatus(exam.status) }}
              </span>
              <span v-if="exam.assessment_type === 'sts' || exam.title?.toLowerCase().includes('sts') || exam.title?.toLowerCase().includes('tengah')"
                class="badge text-[10px] bg-amber-400 text-amber-950 font-black border-none">
                📑 Asesmen STS (20%)
              </span>
              <span v-else-if="exam.assessment_type === 'sas' || exam.title?.toLowerCase().includes('sas') || exam.title?.toLowerCase().includes('akhir')"
                class="badge text-[10px] bg-purple-400 text-purple-950 font-black border-none">
                🏆 Asesmen SAS (20%)
              </span>
              <span v-else-if="exam.tp_code || exam.assessment_type === 'tp'"
                class="badge text-[10px] bg-blue-400 text-blue-950 font-black border-none">
                🎯 Asesmen {{ exam.tp_code || 'Sumatif TP' }} (30%)
              </span>
            </div>
            <h1 class="text-2xl font-black mt-1 text-white">
              {{ exam.title }}
            </h1>
            <p class="text-xs text-white/80 mt-1">
              SMP Negeri 6 Kendari &bull; Dibuat oleh: <strong class="text-white">{{ creatorName }}</strong>
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <router-link to="/cbt" class="btn bg-white/10 hover:bg-white/20 text-white text-xs border border-white/20">
              ← Bank Ujian
            </router-link>
            <router-link :to="`/exam/${exam.id}/start`" class="btn bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold shadow flex items-center gap-1.5">
              <span>🚀</span>
              <span>Masuk Sebagai Siswa</span>
            </router-link>
            <router-link :to="`/cbt/${exam.id}/results`" class="btn bg-white text-primary-900 hover:bg-white/90 text-xs font-bold shadow flex items-center gap-1.5">
              <span>📊</span>
              <span>Rekap Nilai Peserta</span>
            </router-link>
          </div>
        </div>

        <!-- Token & Exam Setting Badges -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/15 text-xs">
          <div class="p-3 rounded-xl bg-white/10 backdrop-blur-md">
            <p class="text-white/60 text-[10px] uppercase font-bold">Token Sesi CBT</p>
            <p class="text-2xl font-mono font-black text-amber-300 tracking-wider mt-0.5">
              {{ exam.access_code || exam.token || 'INF-7A' }}
            </p>
          </div>
          <div class="p-3 rounded-xl bg-white/10 backdrop-blur-md">
            <p class="text-white/60 text-[10px] uppercase font-bold">Durasi Pengerjaan</p>
            <p class="text-xl font-bold mt-0.5">
              {{ exam.duration_minutes || 60 }} Menit
            </p>
          </div>
          <div class="p-3 rounded-xl bg-white/10 backdrop-blur-md">
            <p class="text-white/60 text-[10px] uppercase font-bold">Jumlah Butir Soal</p>
            <p class="text-xl font-bold mt-0.5">
              {{ questionsList.length }} Butir
            </p>
          </div>
          <div class="p-3 rounded-xl bg-white/10 backdrop-blur-md">
            <p class="text-white/60 text-[10px] uppercase font-bold">Ketuntasan (KKTP / KKM)</p>
            <p class="text-xl font-black text-emerald-300 mt-0.5">
              {{ exam.kktp ?? exam.kkm ?? exam.passing_grade ?? 70 }}
            </p>
          </div>
        </div>
      </div>

      <!-- Security & Anti-Cheat Settings -->
      <div class="card p-4 space-y-3">
        <h2 class="font-bold text-surface-900 text-sm flex items-center gap-2">
          <span>🛡️</span> Parameter Keamanan & Anti-Curang Sistem CBT
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div
            class="flex items-center gap-2 p-2.5 rounded-lg border"
            :class="exam.randomize_questions !== false ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-surface-50 text-surface-600 border-surface-200'"
          >
            <span>{{ exam.randomize_questions !== false ? '✓' : '✕' }}</span>
            <div>
              <span class="font-bold block">Acak Urutan Soal: {{ exam.randomize_questions !== false ? 'Aktif' : 'Nonaktif' }}</span>
              <span class="text-[10px]" :class="exam.randomize_questions !== false ? 'text-emerald-600' : 'text-surface-400'">Tiap siswa menerima urutan berbeda</span>
            </div>
          </div>

          <div
            class="flex items-center gap-2 p-2.5 rounded-lg border"
            :class="exam.randomize_options !== false ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-surface-50 text-surface-600 border-surface-200'"
          >
            <span>{{ exam.randomize_options !== false ? '✓' : '✕' }}</span>
            <div>
              <span class="font-bold block">Acak Pilihan Opsi: {{ exam.randomize_options !== false ? 'Aktif' : 'Nonaktif' }}</span>
              <span class="text-[10px]" :class="exam.randomize_options !== false ? 'text-emerald-600' : 'text-surface-400'">Opsi A/B/C/D diacak dinamis</span>
            </div>
          </div>

          <div
            class="flex items-center gap-2 p-2.5 rounded-lg border"
            :class="exam.tab_switch_detection !== false ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-surface-50 text-surface-600 border-surface-200'"
          >
            <span>{{ exam.tab_switch_detection !== false ? '✓' : '✕' }}</span>
            <div>
              <span class="font-bold block">Deteksi Pindah Tab: {{ exam.tab_switch_detection !== false ? 'Aktif' : 'Nonaktif' }}</span>
              <span class="text-[10px]" :class="exam.tab_switch_detection !== false ? 'text-emerald-600' : 'text-surface-400'">Peringatan jika keluar jendela ujian</span>
            </div>
          </div>

          <div
            class="flex items-center gap-2 p-2.5 rounded-lg border"
            :class="exam.show_score_immediately !== false ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-surface-50 text-surface-600 border-surface-200'"
          >
            <span>{{ exam.show_score_immediately !== false ? '✓' : '✕' }}</span>
            <div>
              <span class="font-bold block">Tampilkan Nilai: {{ exam.show_score_immediately !== false ? 'Langsung' : 'Sembunyikan' }}</span>
              <span class="text-[10px]" :class="exam.show_score_immediately !== false ? 'text-emerald-600' : 'text-surface-400'">Siswa melihat skor saat kumpulkan</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Daftar Soal Terlampir -->
      <div class="card space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-surface-100">
          <div>
            <h2 class="font-bold text-surface-900 text-sm">Pratinjau Butir Soal Terlampir</h2>
            <p class="text-xs text-surface-500 mt-0.5">Menampilkan seluruh butir soal yang diujikan pada paket ini ({{ questionsList.length }} Soal)</p>
          </div>
          <router-link :to="`/exam/${exam.id}/start`" class="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 font-bold">
            <span>👁️</span>
            <span>Uji Coba Kerjakan</span>
          </router-link>
        </div>

        <div v-if="questionsList.length === 0" class="p-8 text-center text-surface-400 text-xs">
          Belum ada butir soal yang terlampir pada paket ujian ini.
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="(q, idx) in questionsList"
            :key="q.id || idx"
            class="p-4 rounded-xl border border-surface-200 space-y-3 text-xs bg-white hover:border-primary-200 transition"
          >
            <div class="flex items-center justify-between">
              <span class="font-bold text-primary-700">Soal Nomor {{ idx + 1 }}</span>
              <div class="flex items-center gap-1.5">
                <span class="badge badge-secondary text-[10px]">{{ q.subject_name || q.topic || exam.subject_name || 'Informatika' }}</span>
                <span v-if="q.difficulty" class="badge bg-surface-100 text-surface-600 text-[10px]">{{ q.difficulty }}</span>
              </div>
            </div>

            <p class="text-surface-800 font-medium leading-relaxed">
              {{ cleanContent(q.content || q.text) }}
            </p>

            <div v-if="getOptions(q).length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div
                v-for="(opt, optIdx) in getOptions(q)"
                :key="optIdx"
                class="p-2 rounded-lg border text-xs flex items-center gap-2"
                :class="isOptionCorrect(opt, optIdx, q) ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900' : 'bg-surface-50 border-surface-200 text-surface-600'"
              >
                <span
                  class="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]"
                  :class="isOptionCorrect(opt, optIdx, q) ? 'bg-emerald-600 text-white' : 'bg-surface-200 text-surface-700'"
                >
                  {{ ['A', 'B', 'C', 'D', 'E'][optIdx] }}
                </span>
                <span class="truncate">{{ getOptionText(opt) }}</span>
                <span v-if="isOptionCorrect(opt, optIdx, q)" class="ml-auto text-emerald-600 text-xs font-bold whitespace-nowrap">✓ Kunci</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const route = useRoute()
const authStore = useAuthStore()
const examId = (route.params.id as string) || 'ex-01'

const loading = ref(true)
const errorMsg = ref('')
const exam = ref<any>(null)
const questionsList = ref<any[]>([])

const creatorName = computed(() => {
  if (exam.value?.created_by_name) return exam.value.created_by_name
  if (exam.value?.teacher_name) return exam.value.teacher_name
  return authStore.user?.name || 'Muhammad Fadly Akbar Arsandi, S.Pd.'
})

function formatStatus(status: string) {
  if (status === 'active') return 'Sesi Ujian Aktif'
  if (status === 'completed') return 'Ujian Telah Selesai'
  if (status === 'draft') return 'Draf Paket Ujian'
  if (status === 'scheduled') return 'Terjadwal'
  return status || 'Aktif'
}

function cleanContent(content: string) {
  if (!content) return ''
  return content.replace(/<[^>]*>/g, '').trim()
}

function getOptions(q: any): any[] {
  if (Array.isArray(q.options) && q.options.length > 0) return q.options
  return []
}

function getOptionText(opt: any): string {
  if (typeof opt === 'string') return opt
  return opt.text || opt.content || opt.label || ''
}

function isOptionCorrect(opt: any, idx: number, q: any): boolean {
  if (typeof opt === 'object' && opt.is_correct === true) return true
  const letter = ['A', 'B', 'C', 'D', 'E'][idx]
  if (q.correct_answer === letter || q.correctAnswer === letter || q.correct_option === letter) return true
  if (q.correct === idx || q.correct_index === idx) return true
  return false
}

async function fetchExamDetail() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await api.get(`/exams/${examId}`)
    const data = res.data?.data || res.data
    exam.value = data
    questionsList.value = Array.isArray(data.questions) ? data.questions : []
  } catch (err: any) {
    console.error('Failed to load exam detail:', err)
    errorMsg.value = err.response?.data?.message || 'Data paket ujian tidak ditemukan.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchExamDetail()
})
</script>
