<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-purple-900 flex flex-col">
    <!-- CBT Header -->
    <header class="bg-white/10 backdrop-blur-sm border-b border-white/10 px-6 py-3">
      <div class="flex items-center justify-between max-w-4xl mx-auto">
        <div class="text-white">
          <h1 class="font-bold text-lg leading-tight">{{ exam?.title }}</h1>
          <p class="text-white/60 text-xs">{{ exam?.subject_name }} · {{ exam?.classroom_name }}</p>
        </div>

        <!-- Timer -->
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 px-4 py-2 rounded-xl"
            :class="timeRemaining < 300 ? 'bg-red-500/30 border border-red-400/40' : 'bg-white/10'"
          >
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-white font-mono text-lg font-bold" :class="{ 'text-red-300': timeRemaining < 300 }">
              {{ formatTime(timeRemaining) }}
            </span>
          </div>

          <button
            @click="confirmSubmit"
            class="bg-green-500 hover:bg-green-400 text-white font-semibold px-5 py-2 rounded-xl transition-colors"
            :disabled="submitting"
          >
            <svg v-if="submitting" class="spinner w-4 h-4" viewBox="0 0 24 24"></svg>
            <span v-else>Kumpulkan</span>
          </button>
        </div>
      </div>
    </header>

    <div class="flex-1 flex max-w-4xl mx-auto w-full gap-0 overflow-hidden">
      <!-- Question navigator (left sidebar) -->
      <aside class="w-56 bg-white/5 backdrop-blur-sm border-r border-white/10 p-4 overflow-y-auto hidden md:block">
        <p class="text-white/60 text-xs font-medium mb-3">NAVIGASI SOAL</p>
        <div class="grid grid-cols-5 gap-1.5">
          <button
            v-for="(q, idx) in questions"
            :key="q.id"
            @click="goToQuestion(idx)"
            class="w-8 h-8 rounded-lg text-xs font-bold transition-all"
            :class="getQuestionNavClass(idx)"
          >
            {{ idx + 1 }}
          </button>
        </div>

        <div class="mt-4 space-y-1.5 text-xs text-white/60">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded bg-green-500"></div>
            <span>Dijawab ({{ answeredCount }})</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded bg-amber-400"></div>
            <span>Ditandai ({{ markedCount }})</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded bg-white/20"></div>
            <span>Belum dijawab</span>
          </div>
        </div>
      </aside>

      <!-- Question content -->
      <main class="flex-1 overflow-y-auto">
        <div v-if="loading" class="flex items-center justify-center h-full">
          <div class="text-white text-center">
            <div class="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p>Memuat soal...</p>
          </div>
        </div>

        <div v-else-if="examError" class="flex items-center justify-center h-full p-6">
          <div class="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md text-center text-white border border-white/20">
            <div class="w-16 h-16 rounded-full bg-red-500/20 text-red-300 flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 class="text-xl font-bold mb-2">Gagal Memuat Ujian</h2>
            <p class="text-sm text-white/80 mb-6">{{ examError }}</p>
            <router-link to="/cbt" class="inline-flex items-center px-4 py-2 rounded-xl bg-white text-primary-900 font-semibold text-sm hover:bg-white/90 transition-colors">
              Kembali ke Daftar Ujian
            </router-link>
          </div>
        </div>

        <div v-else-if="currentQuestion" class="p-6">
          <!-- Question header -->
          <div class="flex items-center justify-between mb-4">
            <span class="text-white/60 text-sm">Soal {{ currentIndex + 1 }} dari {{ questions.length }}</span>
            <button
              @click="toggleMark()"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              :class="currentAnswer?.is_marked ? 'bg-amber-400/30 text-amber-300 border border-amber-400/40' : 'bg-white/10 text-white/60 hover:bg-white/20'"
            >
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
              </svg>
              {{ currentAnswer?.is_marked ? 'Tandai Ulang' : 'Tandai Soal' }}
            </button>
          </div>

          <!-- Question card -->
          <div class="bg-white rounded-2xl p-6 mb-5">
            <!-- Stimulus -->
            <div v-if="currentQuestion.stimulus" class="mb-4 p-4 bg-surface-50 rounded-xl border border-surface-100">
              <p class="text-xs font-semibold text-surface-500 mb-2">📄 BACA TEKS BERIKUT</p>
              <p class="text-sm text-surface-700 whitespace-pre-wrap leading-relaxed">{{ currentQuestion.stimulus }}</p>
            </div>

            <!-- Question -->
            <p class="text-surface-800 font-medium leading-relaxed text-base whitespace-pre-wrap">
              {{ currentQuestion.content }}
            </p>
          </div>

          <!-- Answer options -->
          <div v-if="currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false'" class="space-y-3">
            <button
              v-for="option in currentQuestion.options"
              :key="option.label"
              @click="selectAnswer(option.label)"
              class="w-full flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left"
              :class="currentAnswer?.answer_data?.selected === option.label
                ? 'border-white bg-white/20 backdrop-blur-sm'
                : 'border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/15'"
            >
              <span class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
                :class="currentAnswer?.answer_data?.selected === option.label
                  ? 'bg-white text-primary-700'
                  : 'bg-white/20 text-white'"
              >{{ option.label }}</span>
              <span class="text-white text-sm pt-1 leading-relaxed">{{ option.content }}</span>
            </button>
          </div>

          <!-- Essay / Short Answer -->
          <div v-else-if="['essay', 'short_answer'].includes(currentQuestion.type)" class="space-y-2">
            <p class="text-white/60 text-xs">{{ currentQuestion.type === 'essay' ? 'Tulis jawaban esai Anda' : 'Tulis jawaban singkat' }}</p>
            <textarea
              v-model="essayAnswer"
              class="w-full bg-white rounded-2xl p-4 text-surface-800 resize-none focus:outline-none focus:ring-2 focus:ring-white/50"
              :rows="currentQuestion.type === 'essay' ? 8 : 3"
              :placeholder="currentQuestion.type === 'essay' ? 'Tuliskan jawaban Anda di sini...' : 'Jawaban singkat...'"
              @input="saveEssayAnswer"
            ></textarea>
          </div>

          <!-- Navigation -->
          <div class="flex items-center justify-between mt-6">
            <button
              @click="prevQuestion"
              class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-30"
              :disabled="currentIndex === 0"
            >
              ← Sebelumnya
            </button>
            <span class="text-white/40 text-sm">{{ currentIndex + 1 }} / {{ questions.length }}</span>
            <button
              @click="nextQuestion"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-white transition-colors"
              :class="currentIndex < questions.length - 1 ? 'bg-white/10 hover:bg-white/20' : 'bg-green-500 hover:bg-green-400'"
            >
              {{ currentIndex < questions.length - 1 ? 'Selanjutnya →' : 'Kumpulkan ✓' }}
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- Submit Confirm Modal -->
    <Teleport to="body">
      <div v-if="showSubmitModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div class="relative bg-white rounded-3xl shadow-modal w-full max-w-md p-8 text-center">
          <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-surface-900">Kumpulkan Ujian?</h2>
          <div class="mt-3 text-sm text-surface-500 space-y-1">
            <p>✅ Dijawab: <strong>{{ answeredCount }}</strong> soal</p>
            <p>⚠️ Belum dijawab: <strong>{{ questions.length - answeredCount }}</strong> soal</p>
            <p>🔖 Ditandai: <strong>{{ markedCount }}</strong> soal</p>
          </div>
          <p class="mt-3 text-sm text-amber-700 bg-amber-50 rounded-xl p-3">
            Setelah dikumpulkan, Anda tidak dapat mengubah jawaban lagi.
          </p>
          <div class="flex gap-3 mt-6">
            <button @click="showSubmitModal = false" class="flex-1 btn-secondary">Kembali</button>
            <button @click="submitExam" class="flex-1 btn-primary" :disabled="submitting">
              <svg v-if="submitting" class="spinner w-4 h-4 mr-1" viewBox="0 0 24 24"></svg>
              Ya, Kumpulkan
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

interface Question {
  id: string
  type: string
  content: string
  stimulus?: string
  options?: Array<{ label: string; content: string }>
}

interface Answer {
  question_id: string
  answer_data: any
  is_marked: boolean
}

const loading = ref(true)
const examError = ref('')
const submitting = ref(false)
const showSubmitModal = ref(false)
const exam = ref<any>(null)
const session = ref<any>(null)
const questions = ref<Question[]>([])
const answers = ref<Map<string, Answer>>(new Map())
const currentIndex = ref(0)
const essayAnswer = ref('')
const timeRemaining = ref(0)
let timerInterval: ReturnType<typeof setInterval>
let autoSaveInterval: ReturnType<typeof setInterval>

const currentQuestion = computed(() => questions.value[currentIndex.value] || null)

const currentAnswer = computed(() => {
  const q = currentQuestion.value
  return q ? answers.value.get(q.id) || null : null
})

const answeredCount = computed(() =>
  [...answers.value.values()].filter(a =>
    a.answer_data && (a.answer_data.selected || a.answer_data.text)
  ).length
)

const markedCount = computed(() =>
  [...answers.value.values()].filter(a => a.is_marked).length
)

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function getQuestionNavClass(idx: number): string {
  const q = questions.value[idx]
  const ans = q ? answers.value.get(q.id) : null

  if (idx === currentIndex.value) return 'ring-2 ring-white bg-white text-primary-700'
  if (ans?.is_marked) return 'bg-amber-400 text-white'
  if (ans?.answer_data?.selected || ans?.answer_data?.text) return 'bg-green-500 text-white'
  return 'bg-white/20 text-white hover:bg-white/30'
}

function goToQuestion(idx: number) {
  saveCurrentAnswer()
  currentIndex.value = idx
  syncEssayAnswer()
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    saveCurrentAnswer()
    currentIndex.value--
    syncEssayAnswer()
  }
}

function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) {
    saveCurrentAnswer()
    currentIndex.value++
    syncEssayAnswer()
  } else {
    confirmSubmit()
  }
}

function selectAnswer(label: string) {
  const q = currentQuestion.value
  if (!q) return

  const existing = answers.value.get(q.id) || { question_id: q.id, answer_data: {}, is_marked: false }
  existing.answer_data = { selected: label }
  answers.value.set(q.id, { ...existing })

  // Auto-advance after selection for MC (optional)
  setTimeout(() => {
    if (currentIndex.value < questions.value.length - 1) {
      saveCurrentAnswer()
      currentIndex.value++
      syncEssayAnswer()
    }
  }, 300)
}

function toggleMark() {
  const q = currentQuestion.value
  if (!q) return
  const existing = answers.value.get(q.id) || { question_id: q.id, answer_data: {}, is_marked: false }
  existing.is_marked = !existing.is_marked
  answers.value.set(q.id, { ...existing })
}

function syncEssayAnswer() {
  const q = currentQuestion.value
  if (!q) return
  if (['essay', 'short_answer'].includes(q.type)) {
    essayAnswer.value = answers.value.get(q.id)?.answer_data?.text || ''
  }
}

let essaySaveTimeout: ReturnType<typeof setTimeout>
function saveEssayAnswer() {
  clearTimeout(essaySaveTimeout)
  essaySaveTimeout = setTimeout(() => {
    const q = currentQuestion.value
    if (!q) return
    const existing = answers.value.get(q.id) || { question_id: q.id, answer_data: {}, is_marked: false }
    existing.answer_data = { text: essayAnswer.value }
    answers.value.set(q.id, { ...existing })
  }, 500)
}

function saveCurrentAnswer() {
  const q = currentQuestion.value
  if (!q) return
  if (['essay', 'short_answer'].includes(q.type)) {
    const existing = answers.value.get(q.id) || { question_id: q.id, answer_data: {}, is_marked: false }
    existing.answer_data = { text: essayAnswer.value }
    answers.value.set(q.id, { ...existing })
  }
}

async function autoSaveAnswers() {
  if (!session.value?.id) return
  const answersToSave = [...answers.value.entries()].map(([questionId, ans]) => ({
    question_id: questionId,
    answer_data: ans.answer_data,
    is_marked: ans.is_marked,
  }))
  try {
    await api.put(`/exam-sessions/${session.value.id}/answers/batch`, { answers: answersToSave })
  } catch {
    // Silent fail - will retry on next interval
  }
}

function confirmSubmit() {
  saveCurrentAnswer()
  showSubmitModal.value = true
}

async function submitExam() {
  if (!session.value?.id) return
  submitting.value = true
  try {
    await autoSaveAnswers()
    await api.post(`/exam-sessions/${session.value.id}/submit`)
    clearInterval(timerInterval)
    clearInterval(autoSaveInterval)
    router.push(`/cbt/result/${session.value.id}`)
  } catch (err) {
    console.error('Submit failed:', err)
    alert('Gagal mengumpulkan. Coba lagi.')
  } finally {
    submitting.value = false
    showSubmitModal.value = false
  }
}

function startTimer(durationSeconds: number) {
  timeRemaining.value = durationSeconds
  timerInterval = setInterval(() => {
    timeRemaining.value--
    if (timeRemaining.value <= 0) {
      clearInterval(timerInterval)
      submitExam()
    }
  }, 1000)
}

function normalizeQuestions(rawList: any[]): Question[] {
  return rawList.map((q, idx) => {
    let qType = q.type || 'multiple_choice'
    if (qType === 'pg' || qType === 'pilihan_ganda') qType = 'multiple_choice'
    if (qType === 'uraian' || qType === 'isian') qType = 'essay'

    let normalizedOptions: Array<{ label: string; content: string }> = []
    if (Array.isArray(q.options) && q.options.length > 0) {
      normalizedOptions = q.options.map((opt: any, oIdx: number) => {
        const label = ['A', 'B', 'C', 'D', 'E'][oIdx]
        const content = typeof opt === 'string' ? opt : (opt.content || opt.text || opt.label || '')
        return { label, content }
      })
    }

    return {
      id: q.id || `q-${idx}`,
      type: qType,
      content: (q.content || q.text || q.question || '').replace(/<[^>]*>/g, '').trim(),
      stimulus: q.stimulus,
      options: normalizedOptions
    }
  })
}

async function loadExamSession() {
  loading.value = true
  try {
    const targetId = (route.params.sessionId || route.params.id) as string
    const res = await api.get(`/exam-sessions/${targetId}`, {
      params: { student_id: authStore.user?.id }
    })
    const payload = res.data?.data || res.data

    session.value = payload.session || payload
    exam.value = payload.exam || session.value?.exam || payload
    const rawQuestions = payload.questions || exam.value?.questions || []
    questions.value = normalizeQuestions(rawQuestions)

    // Load existing answers
    const rawAnswers = payload.answers || session.value?.answers || []
    if (Array.isArray(rawAnswers)) {
      rawAnswers.forEach((ans: Answer) => {
        answers.value.set(ans.question_id, ans)
      })
    } else if (typeof rawAnswers === 'object') {
      Object.entries(rawAnswers).forEach(([qId, ans]: [string, any]) => {
        answers.value.set(qId, {
          question_id: qId,
          answer_data: ans.answer_data || (typeof ans === 'string' ? { selected: ans } : ans),
          is_marked: !!ans.is_marked
        })
      })
    }

    // Calculate remaining time
    const durationMinutes = Number(exam.value?.duration_minutes) || 60
    const expires = session.value?.expires_at
      ? new Date(session.value.expires_at).getTime()
      : (Date.now() + durationMinutes * 60 * 1000)
    const remaining = Math.max(0, Math.floor((expires - Date.now()) / 1000))
    startTimer(remaining > 0 ? remaining : durationMinutes * 60)

    // Auto-save every 30 seconds
    autoSaveInterval = setInterval(autoSaveAnswers, 30000)

    syncEssayAnswer()
  } catch (err: any) {
    console.error('Failed to load exam session:', err)
    examError.value = err.response?.data?.message || 'Gagal memuat sesi ujian. Periksa kode akses atau hubungi guru.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadExamSession()
})

onUnmounted(() => {
  clearInterval(timerInterval)
  clearInterval(autoSaveInterval)
})
</script>
