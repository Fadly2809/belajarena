<template>
  <div class="space-y-6 max-w-4xl font-sans animate-fade-in pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>👤</span> Profil Pendidik & Keamanan Akun
        </h1>
        <p class="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
          Kelola informasi data pribadi guru, NIP, kontak, dan keamanan kata sandi Anda di {{ currentSchoolName }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold font-mono">
          NIP: {{ profile.nip || '-' }}
        </span>
      </div>
    </div>

    <!-- Feedback Alerts -->
    <div
      v-if="profileSuccessMsg"
      class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in"
    >
      <div class="flex items-center gap-2.5">
        <span class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
        <span>{{ profileSuccessMsg }}</span>
      </div>
      <button @click="profileSuccessMsg = ''" class="text-emerald-700 hover:text-emerald-900 font-bold p-1">✕</button>
    </div>

    <div
      v-if="profileErrorMsg"
      class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in"
    >
      <div class="flex items-center gap-2.5">
        <span class="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold">!</span>
        <span>{{ profileErrorMsg }}</span>
      </div>
      <button @click="profileErrorMsg = ''" class="text-rose-700 hover:text-rose-900 font-bold p-1">✕</button>
    </div>

    <div
      v-if="passwordSuccessMsg"
      class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in"
    >
      <div class="flex items-center gap-2.5">
        <span class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
        <span>{{ passwordSuccessMsg }}</span>
      </div>
      <button @click="passwordSuccessMsg = ''" class="text-emerald-700 hover:text-emerald-900 font-bold p-1">✕</button>
    </div>

    <div
      v-if="passwordErrorMsg"
      class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in"
    >
      <div class="flex items-center gap-2.5">
        <span class="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold">!</span>
        <span>{{ passwordErrorMsg }}</span>
      </div>
      <button @click="passwordErrorMsg = ''" class="text-rose-700 hover:text-rose-900 font-bold p-1">✕</button>
    </div>

    <!-- Profile Header Banner -->
    <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col sm:flex-row items-center gap-6">
      <div class="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-blue-50/60 pointer-events-none -z-0"></div>

      <!-- Avatar Badge with Interactive Upload -->
      <div class="relative group shrink-0 z-10">
        <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-gradient-to-tr from-[#0c2b3d] via-indigo-900 to-blue-700 text-white font-black flex items-center justify-center shadow-lg shadow-blue-900/20 ring-4 ring-white">
          <img
            v-if="profile.avatar_url"
            :src="profile.avatar_url"
            alt="Foto Profil Guru"
            class="w-full h-full object-cover"
          />
          <span v-else class="text-4xl sm:text-5xl">👨‍🏫</span>
        </div>

        <!-- Hover overlay camera button -->
        <label
          class="absolute inset-0 rounded-3xl bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-center p-2 backdrop-blur-[2px]"
          title="Klik untuk unggah foto baru"
        >
          <span class="text-2xl">📷</span>
          <span class="text-[10px] font-bold mt-1">Ganti Foto</span>
          <input
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleAvatarFileChange"
          />
        </label>

        <!-- Loading spinner when uploading -->
        <div
          v-if="uploadingAvatar"
          class="absolute inset-0 rounded-3xl bg-black/75 text-white flex flex-col items-center justify-center text-center p-2 z-20"
        >
          <span class="animate-spin text-xl">⏳</span>
          <span class="text-[10px] font-bold mt-1">Mengunggah...</span>
        </div>
      </div>

      <!-- Identity Details -->
      <div class="text-center sm:text-left space-y-1.5 flex-1 z-10">
        <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <h2 class="text-xl sm:text-2xl font-black text-slate-900">{{ profile.name }}</h2>
          <span class="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
            Guru Mata Pelajaran
          </span>
        </div>
        <div class="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-0.5">
          <span class="text-xs text-slate-600 font-medium">Mata Pelajaran:</span>
          <span v-if="selectedSubjects.length === 0" class="text-xs text-slate-400 font-semibold italic">Belum Diatur</span>
          <span
            v-for="sub in selectedSubjects"
            :key="sub"
            class="px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 font-bold text-xs"
          >
            {{ sub }}
          </span>
        </div>
        <div class="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-slate-500">
          <span>🏫 <strong class="text-slate-700">{{ currentSchoolName }}</strong></span>
          <span>&bull;</span>
          <span>📧 <span class="font-mono text-slate-600">{{ profile.email }}</span></span>
        </div>

        <!-- Action Upload / Remove Buttons -->
        <div class="flex items-center justify-center sm:justify-start gap-2 pt-2">
          <label class="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold cursor-pointer transition flex items-center gap-1.5 border border-blue-200 shadow-2xs">
            <span>📷</span>
            <span>{{ profile.avatar_url ? 'Ganti Foto Profil' : 'Upload Foto Guru' }}</span>
            <input type="file" accept="image/*" class="hidden" @change="handleAvatarFileChange" />
          </label>
          <button
            v-if="profile.avatar_url"
            @click="handleRemoveAvatar"
            type="button"
            class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold transition border border-slate-200 hover:border-rose-200"
          >
            Hapus Foto
          </button>
        </div>
      </div>
    </div>

    <!-- Forms Grid: Profile Data & Password Change -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 1. Form Edit Informasi Profil -->
      <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
            <span class="text-xl">📝</span>
            <div>
              <h3 class="font-bold text-slate-900 text-sm">Informasi Data Guru</h3>
              <p class="text-[11px] text-slate-400">Perbarui identitas pendidik dan kontak resmi</p>
            </div>
          </div>

          <form @submit.prevent="handleUpdateProfile" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
              <input
                v-model="profile.name"
                type="text"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-800 font-medium text-xs transition"
                required
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Alamat Email (Login Akun)</label>
              <input
                v-model="profile.email"
                type="email"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-800 font-medium text-xs transition font-mono"
                required
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Nomor Induk Pegawai (NIP)</label>
              <input
                v-model="profile.nip"
                type="text"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-800 font-semibold text-xs transition font-mono"
                placeholder="199509282020121003"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Nomor Unik Pendidik (NUPTK)</label>
              <input
                v-model="profile.nuptk"
                type="text"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-800 font-semibold text-xs transition font-mono"
                placeholder="Isi jika ada..."
              />
            </div>

            <!-- Multi-Select Mata Pelajaran -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="block font-bold text-slate-700 text-xs">
                  Mata Pelajaran yang Diampu <span class="text-rose-500">*</span>
                </label>
                <span class="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {{ selectedSubjects.length }} Mapel Dipilih
                </span>
              </div>

              <!-- Daftar Mapel Terpilih (Chips yang bisa dihapus) -->
              <div class="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl min-h-[52px]">
                <div v-if="selectedSubjects.length === 0" class="text-[11px] text-slate-400 font-medium py-1 text-center">
                  Belum ada mapel dipilih. Klik pilihan mapel di bawah atau ketik nama mapel kustom.
                </div>
                <div v-else class="flex flex-wrap gap-1.5">
                  <span
                    v-for="sub in selectedSubjects"
                    :key="sub"
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0c2b3d] text-white text-xs font-bold shadow-xs animate-in fade-in zoom-in-95"
                  >
                    <span>📚 {{ sub }}</span>
                    <button
                      type="button"
                      @click="removeSubject(sub)"
                      class="hover:bg-rose-500 hover:text-white rounded-full w-4 h-4 inline-flex items-center justify-center text-[10px] ml-0.5 transition cursor-pointer"
                      title="Hapus mapel ini"
                    >
                      ✕
                    </button>
                  </span>
                </div>
              </div>

              <!-- Pilihan Rekomendasi Cepat (Kurikulum Merdeka / SMP) -->
              <div>
                <span class="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">Pilihan Cepat Mapel Standar (Klik untuk Memilih/Membatalkan):</span>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="sub in standardSubjects"
                    :key="sub"
                    type="button"
                    @click="toggleSubject(sub)"
                    class="px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1 cursor-pointer"
                    :class="selectedSubjects.includes(sub)
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'"
                  >
                    <span>{{ selectedSubjects.includes(sub) ? '✓' : '+' }}</span>
                    <span>{{ sub }}</span>
                  </button>
                </div>
              </div>

              <!-- Input Mapel Kustom / Tambahan Lainnya -->
              <div class="flex gap-2 pt-1">
                <input
                  v-model="customSubjectInput"
                  type="text"
                  class="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder-slate-400"
                  placeholder="Ketik nama mapel lain (misal: Robotika, Bahasa Sunda, dll)..."
                  @keydown.enter.prevent="addCustomSubject"
                />
                <button
                  type="button"
                  @click="addCustomSubject"
                  class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1"
                >
                  <span>+</span> Tambah
                </button>
              </div>

              <p class="text-[10px] text-slate-500 leading-relaxed">
                💡 Guru dapat mengampu lebih dari 1 mata pelajaran sekaligus. Seluruh mapel yang dipilih akan otomatis tersedia saat pembuatan modul ajar, jadwal mingguan rutin, bank soal, kuis/CBT, dan rekap nilai rapor.
              </p>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
              <input
                v-model="profile.phone"
                type="text"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-800 font-medium text-xs transition font-mono"
                placeholder="081245678901"
              />
            </div>

            <div class="pt-2">
              <button
                type="submit"
                :disabled="savingProfile"
                class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span v-if="savingProfile" class="animate-spin text-sm">⏳</span>
                <span>{{ savingProfile ? 'Menyimpan Perubahan...' : 'Simpan Perubahan Profil' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 2. Form Ganti Kata Sandi -->
      <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
            <span class="text-xl">🔐</span>
            <div>
              <h3 class="font-bold text-slate-900 text-sm">Keamanan Kata Sandi</h3>
              <p class="text-[11px] text-slate-400">Ganti kata sandi masuk untuk mengamankan akun guru</p>
            </div>
          </div>

          <form @submit.prevent="handleChangePassword" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Kata Sandi Saat Ini</label>
              <input
                v-model="passwordForm.current"
                type="password"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-800 font-medium text-xs transition"
                placeholder="Masukkan kata sandi lama..."
                required
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Kata Sandi Baru</label>
              <input
                v-model="passwordForm.new"
                type="password"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-800 font-medium text-xs transition"
                placeholder="Minimal 6 karakter..."
                required
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Konfirmasi Kata Sandi Baru</label>
              <input
                v-model="passwordForm.confirm"
                type="password"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-800 font-medium text-xs transition"
                placeholder="Ulangi kata sandi baru..."
                required
              />
            </div>

            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-1">
              <p class="font-bold text-slate-700">Tips Kata Sandi Aman:</p>
              <ul class="list-disc list-inside space-y-0.5 text-slate-500">
                <li>Gunakan kombinasi minimal 6 huruf dan angka.</li>
                <li>Jangan bagikan kata sandi akun guru kepada siswa.</li>
              </ul>
            </div>

            <div class="pt-2">
              <button
                type="submit"
                :disabled="savingPassword"
                class="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md shadow-slate-900/10 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span v-if="savingPassword" class="animate-spin text-sm">⏳</span>
                <span>{{ savingPassword ? 'Memproses Sandi...' : 'Perbarui Kata Sandi' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import { compressImageFile } from '@/utils/imageHelper'

const router = useRouter()
const authStore = useAuthStore()
const currentSchoolName = computed(() => authStore.currentSchool?.name || 'Satuan Pendidikan')

const profile = ref({
  name: authStore.user?.name || '',
  email: authStore.user?.email || '',
  nip: (authStore.user as any)?.nip || '',
  nuptk: (authStore.user as any)?.nuptk || '',
  phone: (authStore.user as any)?.phone || '',
  subject: (authStore.user as any)?.subject || '',
  avatar_url: authStore.user?.avatar_url || authStore.user?.avatar_path || ''
})

// Multi-Select Subjects State
const selectedSubjects = ref<string[]>([])
const customSubjectInput = ref('')

const standardSubjects = [
  'Informatika',
  'Koding dan Kecerdasan Artifisial (KKA)',
  'Matematika',
  'Ilmu Pengetahuan Alam (IPA)',
  'Ilmu Pengetahuan Sosial (IPS)',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Pendidikan Pancasila (PPKn)',
  'Pendidikan Agama & Budi Pekerti',
  'PJOK',
  'Seni Budaya',
  'Prakarya'
]

function parseSubjects(subVal: any): string[] {
  if (Array.isArray(subVal)) return subVal.map(s => String(s).trim()).filter(Boolean)
  if (typeof subVal === 'string' && subVal.trim()) {
    return subVal.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean)
  }
  return []
}

function syncSelectedSubjects(data: any) {
  const list = parseSubjects(data.subjects || data.subject)
  selectedSubjects.value = list
  profile.value.subject = list.join(', ')
}

function toggleSubject(sub: string) {
  const idx = selectedSubjects.value.findIndex(s => s.toLowerCase() === sub.toLowerCase())
  if (idx >= 0) {
    selectedSubjects.value.splice(idx, 1)
  } else {
    selectedSubjects.value.push(sub)
  }
  profile.value.subject = selectedSubjects.value.join(', ')
}

function removeSubject(sub: string) {
  const idx = selectedSubjects.value.findIndex(s => s.toLowerCase() === sub.toLowerCase())
  if (idx >= 0) {
    selectedSubjects.value.splice(idx, 1)
    profile.value.subject = selectedSubjects.value.join(', ')
  }
}

function addCustomSubject() {
  const trimmed = customSubjectInput.value.trim()
  if (!trimmed) return
  if (!selectedSubjects.value.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
    selectedSubjects.value.push(trimmed)
    profile.value.subject = selectedSubjects.value.join(', ')
  }
  customSubjectInput.value = ''
}

const passwordForm = ref({
  current: '',
  new: '',
  confirm: ''
})

const savingProfile = ref(false)
const savingPassword = ref(false)
const uploadingAvatar = ref(false)

const profileSuccessMsg = ref('')
const profileErrorMsg = ref('')
const passwordSuccessMsg = ref('')
const passwordErrorMsg = ref('')

async function loadProfile() {
  try {
    const res = await api.get('/profile')
    if (res.data?.data) {
      const u = res.data.data
      profile.value.name = u.name || profile.value.name
      profile.value.email = u.email || profile.value.email
      profile.value.nip = u.nip || profile.value.nip
      profile.value.nuptk = u.nuptk || ''
      profile.value.phone = u.phone || profile.value.phone
      profile.value.avatar_url = u.avatar_url || u.avatar_path || ''
      syncSelectedSubjects(u)
    }
  } catch {
    // Fallback to authStore
    if (authStore.user) {
      profile.value.name = authStore.user.name || profile.value.name
      profile.value.email = authStore.user.email || profile.value.email
      profile.value.nip = (authStore.user as any).nip || profile.value.nip
      profile.value.phone = (authStore.user as any).phone || profile.value.phone
      profile.value.avatar_url = authStore.user.avatar_url || authStore.user.avatar_path || ''
      syncSelectedSubjects(authStore.user)
    }
  }
}

async function handleAvatarFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploadingAvatar.value = true
  profileErrorMsg.value = ''
  profileSuccessMsg.value = ''

  try {
    // 1. Kompres gambar di browser (maks 600x600, quality 0.85)
    const base64Image = await compressImageFile(file, 600, 600, 0.85)

    // 2. Unggah ke server
    const res = await api.post('/profile/avatar', { avatar: base64Image })
    const newAvatarUrl = res.data?.data?.avatar_url || base64Image
    profile.value.avatar_url = newAvatarUrl

    // 3. Update reactive authStore agar sidebar & header langsung berubah
    authStore.updateUser({
      avatar_path: newAvatarUrl,
      avatar_url: newAvatarUrl
    })

    profileSuccessMsg.value = 'Foto profil pendidik berhasil diperbarui!'
  } catch (err: any) {
    profileErrorMsg.value = 'Gagal mengunggah foto: ' + (err.response?.data?.message || err.message)
  } finally {
    uploadingAvatar.value = false
    input.value = ''
  }
}

async function handleRemoveAvatar() {
  if (!confirm('Apakah Anda yakin ingin menghapus foto profil?')) return

  uploadingAvatar.value = true
  profileErrorMsg.value = ''
  profileSuccessMsg.value = ''

  try {
    await api.post('/profile/avatar', { avatar: 'remove' })
    profile.value.avatar_url = ''
    authStore.updateUser({
      avatar_path: '',
      avatar_url: ''
    })
    profileSuccessMsg.value = 'Foto profil berhasil dihapus.'
  } catch (err: any) {
    profileErrorMsg.value = 'Gagal menghapus foto: ' + (err.response?.data?.message || err.message)
  } finally {
    uploadingAvatar.value = false
  }
}

onMounted(() => {
  const isStudent =
    authStore.user?.role === 'student' ||
    authStore.user?.is_student === true ||
    authStore.hasRole('student') ||
    !!authStore.user?.nis

  if (isStudent) {
    router.replace({ path: '/student', query: { tab: 'profile' } })
    return
  }

  loadProfile()
})

async function handleUpdateProfile() {
  profileSuccessMsg.value = ''
  profileErrorMsg.value = ''

  if (selectedSubjects.value.length === 0) {
    profileErrorMsg.value = 'Silakan pilih atau tambahkan minimal 1 mata pelajaran yang Anda ampu.'
    return
  }

  savingProfile.value = true
  profile.value.subject = selectedSubjects.value.join(', ')

  try {
    const res = await authStore.updateProfile({
      name: profile.value.name,
      email: profile.value.email,
      nip: profile.value.nip,
      nuptk: profile.value.nuptk,
      subject: profile.value.subject,
      subjects: selectedSubjects.value,
      phone: profile.value.phone
    })

    if (res.success) {
      profileSuccessMsg.value = 'Data profil pendidik dan mata pelajaran berhasil diperbarui!'
      await authStore.fetchUser()
      await loadProfile()
    } else {
      profileErrorMsg.value = res.message || 'Gagal menyimpan perubahan profil.'
    }
  } catch (err: any) {
    profileErrorMsg.value = err.response?.data?.message || 'Terjadi kesalahan saat menyimpan profil.'
  } finally {
    savingProfile.value = false
  }
}

async function handleChangePassword() {
  passwordSuccessMsg.value = ''
  passwordErrorMsg.value = ''

  if (passwordForm.value.new.length < 6) {
    passwordErrorMsg.value = 'Kata sandi baru minimal 6 karakter.'
    return
  }

  if (passwordForm.value.new !== passwordForm.value.confirm) {
    passwordErrorMsg.value = 'Konfirmasi kata sandi baru tidak cocok!'
    return
  }

  savingPassword.value = true

  try {
    const res = await authStore.changePassword({
      current_password: passwordForm.value.current,
      new_password: passwordForm.value.new,
      new_password_confirmation: passwordForm.value.confirm
    })

    if (res.success) {
      passwordSuccessMsg.value = 'Kata sandi akun Anda berhasil diperbarui.'
      passwordForm.value = { current: '', new: '', confirm: '' }
    } else {
      passwordErrorMsg.value = res.message || 'Gagal memperbarui kata sandi.'
    }
  } catch (err: any) {
    passwordErrorMsg.value = err.response?.data?.message || 'Terjadi kesalahan saat memperbarui kata sandi.'
  } finally {
    savingPassword.value = false
  }
}
</script>
