<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-6 p-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      @click.self="closeAssistant"
    >
      <div
        class="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-xl h-[90vh] sm:h-[650px] flex flex-col overflow-hidden border border-slate-200/80 animate-in fade-in slide-in-from-bottom-4 duration-200"
      >
        <!-- Modal Top Header -->
        <div class="px-5 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between shadow-md">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/20">
              🤖
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold tracking-tight">Asisten AI Guru</h3>
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-400/30 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Aktif
                </span>
              </div>
              <p class="text-[11px] text-blue-150 leading-tight mt-0.5">
                Informatika & KKA · SMP Negeri 6 Kendari
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <!-- Settings / API Key Toggle -->
            <button
              @click="showSettings = !showSettings"
              class="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
              title="Pengaturan Kunci API (Gemini LLM)"
            >
              ⚙️
            </button>

            <!-- Clear Chat Button -->
            <button
              @click="confirmClearChat"
              class="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
              title="Bersihkan Percakapan"
            >
              🗑️
            </button>

            <!-- Close Button -->
            <button
              @click="closeAssistant"
              class="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition ml-1"
              title="Tutup"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Settings Drawer (Optional API Key Configuration) -->
        <div v-if="showSettings" class="p-4 bg-slate-50 border-b border-slate-200 text-xs">
          <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-slate-800 flex items-center gap-1.5">
              <span>🔑</span> Pengaturan Kunci Gemini AI (Opsional)
            </span>
            <button @click="showSettings = false" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <p class="text-[11px] text-slate-500 mb-2">
            Secara bawaan sistem sudah terhubung dengan <strong>Mesin Pedagogik Belajarena</strong> khusus Kurikulum Merdeka SMPN 6 Kendari. Jika ingin menggunakan kecerdasan LLM cloud Google Gemini secara langsung, Anda dapat memasukkan API Key di bawah:
          </p>
          <div class="flex items-center gap-2">
            <input
              v-model="customApiKeyInput"
              type="password"
              placeholder="Masukkan Google Gemini API Key (AIzaSy...)"
              class="flex-1 px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              @click="saveCustomApiKey"
              class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
            >
              Simpan
            </button>
          </div>
          <p v-if="apiKeySavedFeedback" class="text-[11px] text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
            ✓ Kunci API berhasil diperbarui!
          </p>
        </div>

        <!-- Chat Messages Container -->
        <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70 text-xs">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="flex flex-col"
            :class="msg.role === 'user' ? 'items-end' : 'items-start'"
          >
            <!-- Sender Header -->
            <div class="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 font-medium px-1">
              <span>{{ msg.role === 'user' ? 'Pak Fadly' : 'AI Assistant Belajarena' }}</span>
              <span>·</span>
              <span>{{ formatTime(msg.timestamp) }}</span>
            </div>

            <!-- Message Bubble -->
            <div
              class="max-w-[92%] rounded-2xl p-4 shadow-xs leading-relaxed transition"
              :class="
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-blue-500/10'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-slate-200/50'
              "
            >
              <!-- Formatted Content -->
              <div
                v-if="msg.role === 'assistant'"
                class="prose prose-sm max-w-none prose-slate"
                v-html="renderMarkdown(msg.content)"
              ></div>
              <div v-else class="whitespace-pre-wrap font-sans text-xs">
                {{ msg.content }}
              </div>

              <!-- Assistant Action Footer (Copy button) -->
              <div
                v-if="msg.role === 'assistant'"
                class="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400"
              >
                <span class="flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {{ msg.source === 'gemini' ? 'Gemini 1.5 Flash' : 'Pedagogical Engine SMPN 6 Kendari' }}
                </span>
                <button
                  @click="copyContent(msg.content, msg.id)"
                  class="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                  :title="copiedId === msg.id ? 'Tersalin!' : 'Salin Teks Lengkap'"
                >
                  <span>{{ copiedId === msg.id ? '✓ Tersalin' : '📋 Salin' }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Loading Indicator -->
          <div v-if="isLoading" class="flex items-start gap-2">
            <div class="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
              🤖
            </div>
            <div class="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 shadow-xs flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
              <span class="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]"></span>
              <span class="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.4s]"></span>
              <span class="text-xs text-slate-500 font-medium ml-1">
                Merumuskan solusi bahan ajar untuk Pak Fadly...
              </span>
            </div>
          </div>
        </div>

        <!-- Quick Prompt Chips -->
        <div class="px-4 py-2 bg-slate-100/70 border-t border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span class="text-[10px] text-slate-400 font-bold whitespace-nowrap">Rekomendasi Cepat:</span>
          <button
            v-for="(chip, i) in quickChips"
            :key="i"
            @click="useQuickChip(chip.prompt)"
            class="px-2.5 py-1 rounded-full bg-white border border-slate-200/90 text-[11px] text-slate-700 font-medium hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition whitespace-nowrap shadow-xs shrink-0 flex items-center gap-1"
          >
            <span>{{ chip.icon }}</span>
            <span>{{ chip.label }}</span>
          </button>
        </div>

        <!-- Chat Input Footer -->
        <div class="p-3 bg-white border-t border-slate-200 flex items-end gap-2">
          <textarea
            v-model="inputMessage"
            @keydown.enter.exact.prevent="submitMessage"
            rows="1"
            placeholder="Tanyakan pembuatan modul ajar, soal HOTS, atau script koding..."
            class="flex-1 bg-slate-100/80 border-none rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-24 leading-relaxed"
          ></textarea>
          <button
            @click="submitMessage"
            :disabled="isLoading || !inputMessage.trim()"
            class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5"
          >
            <span>Kirim</span>
            <span>➤</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useAiAssistant } from '@/composables/useAiAssistant'
import { renderMarkdown } from '@/utils/markdown'

const {
  isOpen,
  isLoading,
  inputMessage,
  messages,
  apiKey,
  closeAssistant,
  setApiKey,
  sendMessage,
  clearHistory
} = useAiAssistant()

const chatContainer = ref<HTMLDivElement | null>(null)
const showSettings = ref(false)
const customApiKeyInput = ref(apiKey.value)
const apiKeySavedFeedback = ref(false)
const copiedId = ref<string | null>(null)

const quickChips = [
  { icon: '📋', label: '5 Soal HOTS KKA', prompt: 'Buatkan 5 butir soal pilihan ganda HOTS lengkap dengan stimulus dan kunci jawaban untuk mata pelajaran KKA (Koding dan Kecerdasan Artifisial) Kelas VII SMPN 6 Kendari.' },
  { icon: '📘', label: 'Modul Ajar Informatika', prompt: 'Buatkan draf Modul Ajar Kurikulum Merdeka Fase D untuk mata pelajaran Informatika elemen Algoritma dan Pemrograman 2 JP di SMP Negeri 6 Kendari.' },
  { icon: '💻', label: 'Script Python SMP', prompt: 'Berikan contoh program Python sederhana yang menarik untuk diajarkan di Lab Komputer siswa SMP kelas VII beserta penjelasan baris per baris kodenya.' },
  { icon: '🤖', label: 'Ide Proyek AI & Vision', prompt: 'Berikan 3 ide proyek praktikum Kecerdasan Artifisial (AI) yang ramah siswa SMP menggunakan kamera/webcam di Lab Komputer.' },
  { icon: '📊', label: 'Panduan KKTP & Rubrik', prompt: 'Bagaimana perumusan Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) berbasis rubrik berskala untuk proyek koding siswa SMP?' }
]

function submitMessage() {
  sendMessage()
}

function useQuickChip(prompt: string) {
  sendMessage(prompt)
}

function saveCustomApiKey() {
  setApiKey(customApiKeyInput.value)
  apiKeySavedFeedback.value = true
  setTimeout(() => {
    apiKeySavedFeedback.value = false
    showSettings.value = false
  }, 1500)
}

function confirmClearChat() {
  if (confirm('Bersihkan seluruh riwayat percakapan dengan Asisten AI?')) {
    clearHistory()
  }
}

async function copyContent(text: string, id: string) {
  try {
    await navigator.clipboard.writeText(text)
    copiedId.value = id
    setTimeout(() => {
      copiedId.value = null
    }, 2000)
  } catch (e) {
    console.error('Failed to copy text:', e)
  }
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return 'Baru saja'
  }
}

// Auto-scroll to bottom when new messages arrive
watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  }
)

watch(
  () => isOpen.value,
  async (open) => {
    if (open) {
      await nextTick()
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
      }
    }
  }
)
</script>
