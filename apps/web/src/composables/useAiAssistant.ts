import { ref, computed } from 'vue'
import api from '@/services/api'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  source?: string
  timestamp: string
}

const STORAGE_KEY_API_KEY = 'cerdika_gemini_api_key'
const STORAGE_KEY_HISTORY = 'cerdika_ai_history'

const isOpen = ref(false)
const isLoading = ref(false)
const inputMessage = ref('')
const apiKey = ref(localStorage.getItem(STORAGE_KEY_API_KEY) || '')

function getAiGreeting(): ChatMessage {
  let teacherName = 'Bapak/Ibu Guru'
  let schoolName = 'Satuan Pendidikan'
  let nipStr = ''
  try {
    const rawUser = localStorage.getItem('auth_user')
    if (rawUser) {
      const u = JSON.parse(rawUser)
      if (u?.name) teacherName = u.name
      if (u?.nip) nipStr = ` (NIP: ${u.nip})`
    }
    const rawSchool = localStorage.getItem('auth_school')
    if (rawSchool) {
      const s = JSON.parse(rawSchool)
      if (s?.name) schoolName = s.name
    }
  } catch {}

  return {
    id: 'msg-welcome',
    role: 'assistant',
    content: `### 🤖 Halo ${teacherName}!
Saya adalah **Asisten AI Belajarena** untuk guru Informatika & KKA di **${schoolName}**${nipStr}.

Saya siap membantu Anda menyusun perangkat ajar dan aktivitas belajar interaktif secara instan:
* 📋 **Penyusunan Soal HOTS & MOTS** (Kurikulum Merdeka Fase D).
* 📘 **Pembuatan Draf Modul Ajar, ATP, & KKTP**.
* 💻 **Contoh Kode Python, Scratch, & Block Coding** ramah siswa.
* 🤖 **Ide Praktikum Kecerdasan Artifisial & Machine Learning**.
* 📊 **Panduan Asesmen Formatif & Sumatif**.

Silakan ketik pertanyaan Anda atau pilih tombol cepat di bawah!`,
    timestamp: new Date().toISOString(),
    source: 'built_in'
  }
}

function loadHistory(): ChatMessage[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_HISTORY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Bersihkan pesan error koneksi gemini-pro usang dari riwayat lama
        const cleaned = parsed.filter((m: ChatMessage) => !m.content?.includes('gemini-pro'))
        if (cleaned.length > 0) return cleaned
      }
    }
  } catch (e) {
    console.warn('Failed to parse saved AI history:', e)
  }
  return [getAiGreeting()]
}

const messages = ref<ChatMessage[]>(loadHistory())

function saveHistory() {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(messages.value))
  } catch (e) {
    console.warn('Failed to save AI history:', e)
  }
}

export function useAiAssistant() {
  function openAssistant(prompt?: string) {
    isOpen.value = true
    if (prompt) {
      inputMessage.value = prompt
      sendMessage()
    }
  }

  function closeAssistant() {
    isOpen.value = false
  }

  function toggleAssistant() {
    isOpen.value = !isOpen.value
  }

  function setApiKey(key: string) {
    apiKey.value = key.trim()
    localStorage.setItem(STORAGE_KEY_API_KEY, apiKey.value)
  }

  function clearHistory() {
    messages.value = [getAiGreeting()]
    saveHistory()
  }

  async function sendMessage(overrideText?: string) {
    const textToSend = (overrideText || inputMessage.value).trim()
    if (!textToSend || isLoading.value) return

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    }

    messages.value.push(userMsg)
    inputMessage.value = ''
    isLoading.value = true
    saveHistory()

    try {
      // Build brief history context
      const historyPayload = messages.value.slice(-6, -1).map(m => ({
        role: m.role,
        content: m.content
      }))

      let teacherName = 'Bapak/Ibu Guru'
      let schoolName = 'Satuan Pendidikan'
      let nip = ''
      try {
        const rawUser = localStorage.getItem('auth_user')
        if (rawUser) {
          const u = JSON.parse(rawUser)
          if (u?.name) teacherName = u.name
          if (u?.nip) nip = u.nip
        }
        const rawSchool = localStorage.getItem('auth_school')
        if (rawSchool) {
          const s = JSON.parse(rawSchool)
          if (s?.name) schoolName = s.name
        }
      } catch {}

      const response = await api.post('/ai/chat', {
        message: textToSend,
        history: historyPayload,
        apiKey: apiKey.value,
        context: {
          currentRoute: typeof window !== 'undefined' ? window.location.pathname : '',
          teacherName,
          school: schoolName,
          nip
        }
      })

      const data = response.data?.data
      const botMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        role: 'assistant',
        content: data?.reply || 'Maaf, tidak ada tanggapan yang dihasilkan.',
        source: data?.source || 'built_in',
        timestamp: data?.timestamp || new Date().toISOString()
      }

      messages.value.push(botMsg)
      saveHistory()
    } catch (err: any) {
      console.error('Error sending message to AI Assistant:', err)
      messages.value.push({
        id: 'msg-' + Date.now(),
        role: 'assistant',
        content: `⚠️ **Gagal menghubungi layanan AI**: ${err.response?.data?.message || err.message || 'Terjadi gangguan jaringan'}.\n\n*Silakan coba kembali dalam beberapa saat.*`,
        timestamp: new Date().toISOString()
      })
      saveHistory()
    } finally {
      isLoading.value = false
    }
  }

  return {
    isOpen,
    isLoading,
    inputMessage,
    messages,
    apiKey,
    openAssistant,
    closeAssistant,
    toggleAssistant,
    setApiKey,
    sendMessage,
    clearHistory
  }
}
