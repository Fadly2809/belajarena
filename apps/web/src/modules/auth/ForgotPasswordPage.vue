<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-900 via-surface-900 to-indigo-950">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6">
      <div class="text-center space-y-2">
        <img
          src="/logo-icon.png"
          alt="Belajarena Logo"
          class="w-14 h-14 mx-auto rounded-2xl shadow-md object-contain"
        />
        <h1 class="text-2xl font-black text-surface-900">Lupa Kata Sandi?</h1>
        <p class="text-xs text-surface-500">
          Masukkan alamat surel (email) akun pendidik Anda yang terdaftar di Belajarena untuk menerima tautan pemulihan.
        </p>
      </div>

      <div v-if="submitted" class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2 text-center">
        <p class="font-bold">✓ Tautan Pemulihan Terkirim!</p>
        <p>Silakan periksa kotak masuk atau spam email Anda untuk mengatur ulang kata sandi.</p>
        <router-link to="/login" class="text-primary-700 font-bold block pt-2 hover:underline">
          Kembali ke Halaman Masuk →
        </router-link>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="space-y-4 text-xs">
        <div>
          <label class="label">Alamat Email Terdaftar</label>
          <input
            v-model="email"
            type="email"
            class="input text-xs"
            placeholder="nama.guru@sekolah.sch.id"
            required
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="btn btn-primary w-full py-2.5 text-xs font-bold shadow-md"
        >
          {{ isLoading ? 'Mengirim Permintaan...' : 'Kirim Tautan Pemulihan' }}
        </button>

        <div class="text-center pt-2">
          <router-link to="/login" class="text-xs text-primary-600 hover:underline font-semibold">
            ← Kembali ke Masuk Aplikasi
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const isLoading = ref(false)
const submitted = ref(false)

function handleSubmit() {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    submitted.value = true
  }, 600)
}
</script>
