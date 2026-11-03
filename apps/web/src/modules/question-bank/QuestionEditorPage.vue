<template>
  <div class="space-y-6 max-w-4xl">
    <!-- Header -->
    <div class="card p-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 bg-white/95 backdrop-blur-md shadow-sm">
      <div class="flex items-center gap-3">
        <router-link to="/question-bank" class="btn btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1">
          ← Kembali ke Bank Soal
        </router-link>
        <div>
          <h2 class="font-bold text-surface-900 text-sm leading-tight flex items-center gap-2">
            <span>{{ isEditMode ? '✏️ Edit Butir Soal Asesmen' : '➕ Tambah Butir Soal Baru' }}</span>
            <span v-if="isEditMode" class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-100 text-surface-600">
              #{{ questionId }}
            </span>
          </h2>
          <span class="text-[11px] text-surface-500">
            Fase D &bull; {{ form.subject }} &bull; {{ form.element }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="saveQuestion"
          :disabled="isSaving || isLoading"
          class="btn btn-primary text-xs px-5 py-2 font-bold shadow-sm"
        >
          <span v-if="!isSaving">💾 {{ isEditMode ? 'Simpan Perubahan' : 'Simpan Butir Soal' }}</span>
          <span v-else>Menyimpan...</span>
        </button>
      </div>
    </div>

    <!-- Loading Skeleton saat Fetch Data Edit -->
    <div v-if="isLoading" class="card p-8 space-y-4 animate-pulse">
      <div class="h-5 bg-surface-200 rounded w-1/3"></div>
      <div class="h-20 bg-surface-100 rounded w-full"></div>
      <div class="space-y-2 pt-4">
        <div class="h-8 bg-surface-100 rounded" v-for="i in 4" :key="i"></div>
      </div>
    </div>

    <!-- Form Container -->
    <div v-else class="space-y-6 text-xs">
      <!-- Taksonomi & Klasifikasi Soal -->
      <div class="card space-y-4">
        <h3 class="text-sm font-bold text-surface-900 pb-2 border-b border-surface-100 flex items-center gap-2">
          <span>🏷️</span> Taksonomi & Klasifikasi Soal Kurikulum Merdeka
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div>
            <label class="label">Tingkat Kelas</label>
            <select v-model="form.grade" class="input text-xs font-semibold" @change="onGradeChange">
              <option value="7">Kelas VII (KKA)</option>
              <option value="9">Kelas IX (Informatika)</option>
            </select>
          </div>
          <div>
            <label class="label">Mata Pelajaran</label>
            <select v-model="form.subject" class="input text-xs font-semibold">
              <option v-for="s in availableSubjects" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div>
            <label class="label">Judul Materi / Topik</label>
            <input
              v-model="form.topic"
              type="text"
              class="input text-xs font-medium"
              placeholder="Contoh: Berpikir Komputasional"
              list="topic-suggestions"
            />
            <datalist id="topic-suggestions">
              <option value="Berpikir Komputasional" />
              <option value="Sistem Komputer" />
              <option value="Jaringan Komputer & Internet" />
              <option value="Algoritma & Pemrograman" />
              <option value="Analisis Data" />
              <option value="Kecerdasan Artifisial (AI)" />
              <option value="Dampak Sosial Informatika" />
            </datalist>
          </div>
          <div>
            <label class="label">Elemen Capaian</label>
            <select v-model="form.element" class="input text-xs">
              <option value="Berpikir Komputasional (BK)">Berpikir Komputasional (BK)</option>
              <option value="Sistem Komputer (SK)">Sistem Komputer (SK)</option>
              <option value="Jaringan Komputer dan Internet (JKI)">Jaringan Komputer dan Internet (JKI)</option>
              <option value="Algoritma & Pemrograman (AP)">Algoritma & Pemrograman (AP)</option>
              <option value="Analisis Data (AD)">Analisis Data (AD)</option>
              <option value="Dampak Sosial Informatika (DSI)">Dampak Sosial Informatika (DSI)</option>
              <option value="Praktik Lintas Bidang (PLB)">Praktik Lintas Bidang (PLB)</option>
            </select>
          </div>
          <div>
            <label class="label">Tingkat Kesukaran</label>
            <select v-model="form.difficulty" class="input text-xs font-semibold">
              <option value="mudah">Mudah (LOTS)</option>
              <option value="sedang">Sedang (MOTS)</option>
              <option value="sukar">Sukar (HOTS)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Teks Butir Soal -->
      <div class="card space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <label class="font-bold text-surface-900 text-sm">Teks Stimulus & Pokok Soal (Stem)</label>
          <div class="flex items-center gap-2">
            <label class="btn btn-secondary text-[11px] py-1 px-2.5 font-bold border-primary-200 text-primary-700 bg-primary-50 hover:bg-primary-100 cursor-pointer flex items-center gap-1.5 transition">
              <span>📷 Ekstrak dari Gambar (OCR)</span>
              <input type="file" accept="image/*" class="hidden" @change="handleOcrInEditor" />
            </label>
            <span class="text-[10px] text-surface-400">Gunakan bahasa baku & mudah dipahami</span>
          </div>
        </div>

        <!-- OCR progress indicator -->
        <div v-if="ocrLoading" class="p-3 rounded-xl bg-primary-50 border border-primary-200 space-y-1.5 animate-fade-in">
          <div class="flex items-center justify-between text-xs font-bold text-primary-800">
            <span>{{ ocrStatus }}</span>
            <span>{{ ocrProgress }}%</span>
          </div>
          <div class="w-full bg-primary-200 rounded-full h-1.5 overflow-hidden">
            <div class="bg-primary-600 h-1.5 rounded-full transition-all duration-300" :style="{ width: `${ocrProgress}%` }"></div>
          </div>
        </div>

        <textarea
          v-model="form.questionText"
          rows="4"
          class="input text-xs leading-relaxed"
          placeholder="Tuliskan stimulus teks, studi kasus, atau pertanyaan pokok di sini..."
          required
        ></textarea>
      </div>

      <!-- Pilihan Jawaban (Multiple Choice Options) -->
      <div class="card space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-surface-100">
          <div>
            <h3 class="font-bold text-surface-900 text-sm">Pilihan Jawaban (Opsi)</h3>
            <p class="text-[11px] text-surface-500">Pilih radio button di sebelah kiri untuk menandai KUNCI JAWABAN BENAR</p>
          </div>
          <button type="button" @click="addOption" class="text-xs text-primary-600 hover:underline font-semibold">
            + Tambah Opsi
          </button>
        </div>

        <div class="space-y-3">
          <div
            v-for="(opt, idx) in form.options"
            :key="idx"
            class="flex items-center gap-3 p-3 rounded-xl border transition"
            :class="form.correctOptionIndex === idx ? 'bg-emerald-50/70 border-emerald-300' : 'bg-surface-50 border-surface-200'"
          >
            <input
              type="radio"
              :name="'correct-opt'"
              :checked="form.correctOptionIndex === idx"
              @change="form.correctOptionIndex = idx"
              class="w-4 h-4 text-emerald-600 cursor-pointer"
            />
            <span class="font-bold text-xs w-6 text-center" :class="form.correctOptionIndex === idx ? 'text-emerald-800' : 'text-surface-600'">
              {{ ['A', 'B', 'C', 'D', 'E'][idx] }}
            </span>
            <input
              v-model="opt.text"
              type="text"
              class="input text-xs flex-1 bg-white"
              :placeholder="`Teks pilihan ${['A', 'B', 'C', 'D', 'E'][idx]}`"
              required
            />
            <button
              v-if="form.options.length > 2"
              @click="removeOption(idx)"
              type="button"
              class="text-surface-400 hover:text-rose-600 px-1"
              title="Hapus opsi"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- Pembahasan & Alasan Kunci -->
      <div class="card space-y-3">
        <label class="font-bold text-surface-900 text-sm">Pembahasan & Penjelasan Kunci Jawaban</label>
        <textarea
          v-model="form.explanation"
          rows="3"
          class="input text-xs leading-relaxed"
          placeholder="Tuliskan alasan mengapa jawaban tersebut benar agar siswa dapat belajar dari umpan balik..."
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api'
import { extractTextFromImage, parseQuestionsFromRawText } from '@/utils/questionParser'

const router = useRouter()
const route = useRoute()

const questionId = computed(() => route.params.id as string | undefined)
const isEditMode = computed(() => !!questionId.value)

const isLoading = ref(false)
const isSaving = ref(false)
const ocrLoading = ref(false)
const ocrProgress = ref(0)
ocrProgress.value = 0
const ocrStatus = ref('')

const availableSubjects = computed(() => {
  return form.value.grade === '7' ? ['KKA'] : ['Informatika']
})

function onGradeChange() {
  form.value.subject = form.value.grade === '7' ? 'KKA' : 'Informatika'
}

const form = ref({
  subject: 'KKA',
  grade: '7',
  topic: 'Logika Pemrograman Dasar',
  element: 'Koding & Logika Blok',
  difficulty: 'sedang',
  questionText: '',
  options: [
    { text: '' },
    { text: '' },
    { text: '' },
    { text: '' }
  ],
  correctOptionIndex: 0,
  explanation: ''
})

onMounted(async () => {
  if (isEditMode.value && questionId.value) {
    await loadQuestionDetail(questionId.value)
  }
})

async function loadQuestionDetail(id: string) {
  isLoading.value = true
  try {
    const res = await api.get(`/questions/${id}`)
    const q = res.data?.data || res.data
    if (!q) return

    // Isi pokok pertanyaan
    form.value.questionText = q.content || q.questionText || ''
    form.value.subject = q.subject_name || q.subject || 'Informatika'
    form.value.grade = String(q.grade || '7')
    form.value.topic = q.topic || q.element || 'Berpikir Komputasional'
    form.value.element = q.element || 'Sistem Komputer (SK)'

    // Level kesulitan
    if (q.difficulty === 'hard') form.value.difficulty = 'sukar'
    else if (q.difficulty === 'easy') form.value.difficulty = 'mudah'
    else form.value.difficulty = 'sedang'

    form.value.explanation = q.explanation || ''

    // Pilihan opsi
    if (Array.isArray(q.options) && q.options.length > 0) {
      form.value.options = q.options.map((opt: any) => ({
        text: typeof opt === 'string' ? opt : (opt.content || opt.text || '')
      }))

      // Tentukan kunci jawaban benar
      let foundIndex = -1
      // Cara 1: dari field is_correct
      foundIndex = q.options.findIndex((opt: any) => opt && opt.is_correct === true)
      
      // Cara 2: dari correct_answer label ('A', 'B', 'C', dsb)
      if (foundIndex === -1 && q.correct_answer) {
        const letters = ['A', 'B', 'C', 'D', 'E']
        const directIdx = letters.indexOf(String(q.correct_answer).trim().toUpperCase())
        if (directIdx !== -1 && directIdx < q.options.length) {
          foundIndex = directIdx
        } else {
          // Cocokkan teks pilihan
          const textIdx = q.options.findIndex((opt: any) => {
            const t = typeof opt === 'string' ? opt : (opt.content || opt.text || '')
            return t === q.correct_answer
          })
          if (textIdx !== -1) foundIndex = textIdx
        }
      }

      form.value.correctOptionIndex = foundIndex !== -1 ? foundIndex : 0
    }
  } catch (err: any) {
    console.error('Failed to load question detail:', err)
    alert('Gagal memuat data butir soal: ' + (err.response?.data?.message || err.message))
  } finally {
    isLoading.value = false
  }
}

function addOption() {
  if (form.value.options.length < 5) {
    form.value.options.push({ text: '' })
  }
}

function removeOption(idx: number) {
  form.value.options.splice(idx, 1)
  if (form.value.correctOptionIndex >= form.value.options.length) {
    form.value.correctOptionIndex = 0
  }
}

async function handleOcrInEditor(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  ocrLoading.value = true
  ocrProgress.value = 10
  ocrStatus.value = 'Mempersiapkan gambar...'

  try {
    const text = await extractTextFromImage(file, (progress, status) => {
      ocrProgress.value = Math.round(progress * 100)
      ocrStatus.value = status
    })

    const parsed = parseQuestionsFromRawText(text)
    if (parsed.length > 0) {
      const q = parsed[0]
      form.value.questionText = q.content
      if (q.topic) form.value.topic = q.topic
      if (q.options?.length >= 2) {
        form.value.options = q.options.map(o => ({ text: o.text }))
        const keyIndex = ['A', 'B', 'C', 'D', 'E'].indexOf(q.correct_answer)
        form.value.correctOptionIndex = keyIndex !== -1 ? keyIndex : 0
      }
      if (q.explanation) form.value.explanation = q.explanation
    } else {
      form.value.questionText = text
    }
  } catch (err: any) {
    alert('OCR Gagal: ' + err.message)
  } finally {
    ocrLoading.value = false
  }
}

async function saveQuestion() {
  if (!form.value.questionText.trim()) {
    alert('Teks pertanyaan soal wajib diisi!')
    return
  }
  isSaving.value = true

  const payload = {
    content: form.value.questionText,
    options: form.value.options.map((o, idx) => ({
      label: ['A', 'B', 'C', 'D', 'E'][idx],
      content: o.text,
      text: o.text,
      is_correct: idx === form.value.correctOptionIndex
    })),
    correct_answer: ['A', 'B', 'C', 'D', 'E'][form.value.correctOptionIndex],
    subject_name: form.value.subject,
    grade: form.value.grade,
    topic: form.value.topic || form.value.element || 'Berpikir Komputasional',
    element: form.value.element,
    difficulty: form.value.difficulty === 'sukar' ? 'hard' : form.value.difficulty === 'mudah' ? 'easy' : 'medium',
    explanation: form.value.explanation,
    type: 'multiple_choice'
  }

  try {
    if (isEditMode.value && questionId.value) {
      await api.put(`/questions/${questionId.value}`, payload)
      alert('✅ Butir soal berhasil diperbarui!')
    } else {
      await api.post('/questions', payload)
      alert('✅ Butir soal berhasil disimpan ke Bank Soal Sekolah!')
    }
    router.push('/question-bank')
  } catch (err: any) {
    console.error('Save question failed:', err)
    alert('Gagal menyimpan butir soal: ' + (err.response?.data?.message || err.message))
  } finally {
    isSaving.value = false
  }
}
</script>
