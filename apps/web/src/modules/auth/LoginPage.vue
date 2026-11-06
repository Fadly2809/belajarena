<template>
  <div class="min-h-screen bg-gradient-to-br from-[#071a25] via-[#0c2b3d] to-[#0e3143] flex items-center justify-center p-4">
    <!-- Background decorative elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#3894b6] opacity-15 blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#f59e0b] opacity-10 blur-3xl"></div>
      <div class="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-white opacity-5 blur-2xl"></div>
    </div>

    <div class="relative w-full max-w-md">
      <!-- Logo / Header -->
      <div class="text-center mb-6 flex flex-col items-center">
        <img
          src="/logo.png"
          alt="Belajarena Logo"
          class="h-16 w-auto max-w-[260px] object-contain drop-shadow-xl hover:scale-105 transition-transform"
        />
        <p class="text-slate-300 text-xs font-semibold mt-2 tracking-wide uppercase">{{ schoolName }}</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-[28px] shadow-2xl p-8 border border-white/20">
        <div class="mb-5 text-center">
          <h2 class="text-xl font-bold text-slate-900">Masuk ke Sistem</h2>
          <p class="text-slate-500 text-xs mt-1">Pilih jenis akun untuk melanjutkan</p>
        </div>

        <!-- 2 Account Types Selector -->
        <div class="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
          <button
            type="button"
            @click="selectAccountType('teacher')"
            class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-xs"
            :class="accountType === 'teacher' 
              ? 'bg-[#0c2b3d] text-white shadow-md shadow-[#0c2b3d]/20' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'"
          >
            <span>👨‍🏫</span>
            <span>Akun Guru</span>
          </button>
          <button
            type="button"
            @click="selectAccountType('student')"
            class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-xs"
            :class="accountType === 'student' 
              ? 'bg-[#f59e0b] text-slate-950 shadow-md shadow-[#f59e0b]/20 font-black' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'"
          >
            <span>🎓</span>
            <span>Akun Siswa</span>
          </button>
        </div>

        <!-- Role Badge Info -->
        <div class="mb-5 p-3 rounded-xl text-xs border"
          :class="accountType === 'teacher' ? 'bg-blue-50/80 border-blue-200 text-blue-900' : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'"
        >
          <div v-if="accountType === 'teacher'" class="flex items-start gap-2">
            <span class="text-sm">🔑</span>
            <div>
              <p class="font-bold">Akun Guru (Pak Fadly)</p>
              <p class="text-[11px] text-blue-700 mt-0.5">Memiliki akses penuh Guru Informatika & KKA sekaligus seluruh kendali administratif sekolah.</p>
            </div>
          </div>
          <div v-else class="flex items-start gap-2">
            <span class="text-sm">📚</span>
            <div>
              <p class="font-bold">Akun Siswa</p>
              <p class="text-[11px] text-emerald-700 mt-0.5">Masuk dengan NIS (contoh: <b>10527</b>) dan sandi (NIS Anda atau <b>password</b>).</p>
            </div>
          </div>
        </div>

        <!-- Alert error -->
        <div v-if="errorMessage" class="alert-error mb-4 animate-fade-in text-xs py-2.5 px-3">
          <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Identifier (NIP / Email / NISN) -->
          <div>
            <label for="email" class="label text-xs font-semibold">
              {{ accountType === 'teacher' ? 'NIP atau Email Guru' : 'NIS / NISN atau Email Siswa' }}
            </label>
            <input
              id="email"
              v-model="form.email"
              type="text"
              class="input text-xs"
              :class="{ 'input-error': errors.email }"
              :placeholder="accountType === 'teacher' ? 'NIP atau alamat email Guru / Pengelola' : 'Masukkan NIS atau NISN siswa'"
              autocomplete="username email"
              :disabled="loading"
            />
            <p v-if="errors.email" class="error-msg text-xs">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
              {{ errors.email }}
            </p>
          </div>

          <!-- Password -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label for="password" class="label text-xs font-semibold mb-0">Kata Sandi</label>
              <RouterLink to="/forgot-password" class="text-[11px] text-primary-600 hover:text-primary-700 font-medium">
                Lupa kata sandi?
              </RouterLink>
            </div>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="input pr-10 text-xs"
                :class="{ 'input-error': errors.password }"
                placeholder="Masukkan kata sandi"
                autocomplete="current-password"
                :disabled="loading"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
              >
                <svg v-if="showPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="error-msg text-xs">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
              {{ errors.password }}
            </p>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            class="w-full py-3 rounded-2xl font-bold text-xs shadow-md mt-2 transition active:scale-[0.99] flex items-center justify-center gap-2"
            :class="accountType === 'teacher' ? 'bg-[#0c2b3d] hover:bg-[#164255] text-white' : 'bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-black'"
            :disabled="loading"
          >
            <svg v-if="loading" class="spinner w-4 h-4" viewBox="0 0 24 24"></svg>
            <span>{{ loading ? 'Memverifikasi...' : (accountType === 'teacher' ? 'Masuk sebagai Guru' : 'Masuk sebagai Siswa') }}</span>
          </button>

          <!-- Quick Fill for Pak Fadly -->
          <div v-if="accountType === 'teacher'" class="pt-2 flex flex-col gap-2">
            <button
              type="button"
              @click="quickFillTeacher"
              class="w-full text-center py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-[11px] font-semibold text-slate-700 transition"
            >
              ⚡ Klik untuk isi akun Guru Default (Pak Fadly)
            </button>
            <div class="relative flex py-1 items-center">
              <div class="flex-grow border-t border-slate-200"></div>
              <span class="flex-shrink mx-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">atau</span>
              <div class="flex-grow border-t border-slate-200"></div>
            </div>
            <button
              type="button"
              @click="openRegisterModal"
              class="w-full text-center py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[11px] font-bold text-blue-800 transition flex items-center justify-center gap-1.5"
            >
              <span>🏛️</span>
              <span>Daftarkan Satuan Pendidikan Baru</span>
            </button>
          </div>

          <!-- Quick Fill for Siswa -->
          <div v-else class="pt-2">
            <button
              type="button"
              @click="quickFillStudent"
              class="w-full text-center py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-[11px] font-semibold text-amber-900 transition"
            >
              ⚡ Klik untuk isi akun Siswa (NIS: 10527 - Abizar)
            </button>
          </div>
        </form>
      </div>

      <!-- Footer Note -->
      <p class="text-center text-primary-200 text-xs mt-6">
        © 2026 Belajarena · {{ schoolName }}<br/>
        <span class="text-[10px] text-primary-300">Sistem Pembelajaran Multi-Satuan Pendidikan Terpadu</span>
      </p>
    </div>

    <!-- Modal Registrasi Satuan Pendidikan Baru -->
    <div
      v-if="showRegisterModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      @click.self="showRegisterModal = false"
    >
      <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto">
        <div class="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl">
              🏛️
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900">Daftarkan Satuan Pendidikan Baru</h3>
              <p class="text-xs text-slate-500 mt-0.5">Mulai sekolah baru dengan data dan rombel kelas terisolasi</p>
            </div>
          </div>
          <button
            @click="showRegisterModal = false"
            class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm transition"
          >
            ✕
          </button>
        </div>

        <div v-if="registerError" class="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{{ registerError }}</span>
        </div>

        <form @submit.prevent="handleRegisterSchool" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nama Satuan Pendidikan / Sekolah <span class="text-red-500">*</span></label>
            <input
              v-model="regForm.school_name"
              type="text"
              required
              class="input text-xs"
              placeholder="Contoh: SMP Negeri 1 Surabaya / SMA Prestasi"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">NPSN (Opsional)</label>
              <input
                v-model="regForm.npsn"
                type="text"
                class="input text-xs font-mono"
                placeholder="8 digit NPSN"
              />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Kota / Kabupaten</label>
              <input
                v-model="regForm.city"
                type="text"
                class="input text-xs"
                placeholder="Contoh: Surabaya"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Provinsi</label>
              <input
                v-model="regForm.province"
                type="text"
                class="input text-xs"
                placeholder="Contoh: Jawa Timur"
              />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">No. Telp Sekolah</label>
              <input
                v-model="regForm.phone"
                type="text"
                class="input text-xs"
                placeholder="031-xxxxxxx"
              />
            </div>
          </div>

          <div class="pt-2 border-t border-slate-100">
            <h4 class="font-bold text-slate-800 text-xs mb-2 flex items-center gap-1.5">
              <span>👤</span> <span>Akun Pengelola / Guru Pertama</span>
            </h4>
            <div class="space-y-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Nama Lengkap Pengelola / Guru <span class="text-red-500">*</span></label>
                <input
                  v-model="regForm.admin_name"
                  type="text"
                  required
                  class="input text-xs"
                  placeholder="Contoh: Dr. Budi Santoso, M.Pd."
                />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Email Pengelola (Untuk Login) <span class="text-red-500">*</span></label>
                <input
                  v-model="regForm.email"
                  type="email"
                  required
                  class="input text-xs"
                  placeholder="admin@sekolahanda.sch.id"
                />
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Kata Sandi <span class="text-red-500">*</span></label>
                <input
                  v-model="regForm.password"
                  type="password"
                  required
                  minlength="6"
                  class="input text-xs"
                  placeholder="Minimal 6 karakter"
                />
              </div>
            </div>
          </div>

          <div class="pt-3 flex gap-2">
            <button
              type="button"
              @click="showRegisterModal = false"
              class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="registerLoading"
              class="flex-1 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#164255] text-white font-bold transition flex items-center justify-center gap-2"
            >
              <svg v-if="registerLoading" class="spinner w-4 h-4" viewBox="0 0 24 24"></svg>
              <span>{{ registerLoading ? 'Mendaftarkan...' : 'Daftarkan & Masuk' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const schoolName = computed(() => authStore.currentSchool?.name || 'Belajarena LMS')

const accountType = ref<'teacher' | 'student'>('teacher')
const loading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')

// Register New School Modal State
const showRegisterModal = ref(false)
const registerLoading = ref(false)
const registerError = ref('')
const regForm = reactive({
  school_name: '',
  npsn: '',
  city: '',
  province: '',
  phone: '',
  admin_name: '',
  email: '',
  password: ''
})

function openRegisterModal() {
  registerError.value = ''
  showRegisterModal.value = true
}

async function handleRegisterSchool() {
  if (!regForm.school_name || !regForm.email || !regForm.password) {
    registerError.value = 'Nama sekolah, email, dan kata sandi wajib diisi.'
    return
  }
  registerLoading.value = true
  registerError.value = ''

  const res = await authStore.registerSchool({
    school_name: regForm.school_name,
    npsn: regForm.npsn,
    city: regForm.city,
    province: regForm.province,
    phone: regForm.phone,
    admin_name: regForm.admin_name,
    email: regForm.email,
    password: regForm.password
  })

  registerLoading.value = false
  if (res.success) {
    showRegisterModal.value = false
    router.push('/dashboard')
  } else {
    registerError.value = res.message || 'Gagal mendaftarkan sekolah.'
  }
}

onMounted(() => {
  if (!authStore.currentSchool) {
    authStore.fetchActiveSchool()
  }
})

const form = reactive({
  email: 'muhammadarsandi89@guru.smp.belajar.id',
  password: 'password',
})

const errors = reactive({
  email: '',
  password: '',
})

function selectAccountType(type: 'teacher' | 'student') {
  accountType.value = type
  errorMessage.value = ''
  errors.email = ''
  errors.password = ''
  if (type === 'teacher') {
    form.email = 'muhammadarsandi89@guru.smp.belajar.id'
    form.password = 'password'
  } else {
    form.email = ''
    form.password = ''
  }
}

function quickFillTeacher() {
  form.email = 'muhammadarsandi89@guru.smp.belajar.id'
  form.password = 'password'
  errorMessage.value = ''
}

function quickFillStudent() {
  form.email = '10527'
  form.password = 'password'
  errorMessage.value = ''
}

function validateForm(): boolean {
  errors.email = ''
  errors.password = ''
  let valid = true

  if (!form.email.trim()) {
    errors.email = accountType.value === 'teacher' ? 'NIP atau email guru wajib diisi' : 'NIS/NISN atau email siswa wajib diisi'
    valid = false
  }

  if (!form.password) {
    errors.password = 'Kata sandi wajib diisi'
    valid = false
  } else if (form.password.length < 4) {
    errors.password = 'Kata sandi minimal 4 karakter'
    valid = false
  }

  return valid
}

async function handleLogin() {
  if (!validateForm()) return

  loading.value = true
  errorMessage.value = ''

  const result = await authStore.login({
    email: form.email,
    password: form.password,
  })

  loading.value = false

  if (result.success) {
    const redirect = route.query.redirect as string
    if (authStore.user?.role === 'student' || authStore.user?.is_student) {
      const isAllowedStudentRedirect = redirect && (
        redirect.startsWith('/student') ||
        redirect.startsWith('/presentation-live') ||
        redirect.startsWith('/presentation/live') ||
        redirect.startsWith('/games') ||
        redirect.startsWith('/cbt')
      )
      router.push(isAllowedStudentRedirect ? redirect : '/student')
    } else {
      router.push(redirect || '/dashboard')
    }
  } else {
    errorMessage.value = result.message || 'Login gagal. Periksa kembali data login Anda.'
    if (result.errors?.email) errors.email = result.errors.email[0]
    if (result.errors?.password) errors.password = result.errors.password[0]
  }
}
</script>
