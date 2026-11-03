<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-900 via-surface-900 to-indigo-950">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6">
      <div class="text-center space-y-2">
        <div class="w-12 h-12 mx-auto rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-2xl font-bold">
          🔒
        </div>
        <h1 class="text-2xl font-black text-surface-900">Atur Ulang Kata Sandi</h1>
        <p class="text-xs text-surface-500">
          Buat kata sandi baru yang aman dan mudah diingat untuk akun pendidik Anda.
        </p>
      </div>

      <div v-if="success" class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2 text-center">
        <p class="font-bold">✓ Kata Sandi Berhasil Diperbarui!</p>
        <p>Anda sekarang dapat masuk ke aplikasi dengan kata sandi baru Anda.</p>
        <router-link to="/login" class="btn btn-primary text-xs w-full py-2 block font-bold mt-2">
          Masuk ke Akun Sekarang →
        </router-link>
      </div>

      <form v-else @submit.prevent="handleReset" class="space-y-4 text-xs">
        <div>
          <label class="label">Kata Sandi Baru</label>
          <input
            v-model="newPassword"
            type="password"
            class="input text-xs"
            placeholder="Minimal 8 karakter"
            required
          />
        </div>

        <div>
          <label class="label">Konfirmasi Kata Sandi Baru</label>
          <input
            v-model="confirmPassword"
            type="password"
            class="input text-xs"
            placeholder="Ketik ulang kata sandi baru"
            required
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="btn btn-primary w-full py-2.5 text-xs font-bold shadow-md"
        >
          {{ isLoading ? 'Menyimpan...' : 'Simpan Kata Sandi Baru' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const success = ref(false)

function handleReset() {
  if (newPassword.value !== confirmPassword.value) {
    alert('Konfirmasi kata sandi tidak cocok!')
    return
  }
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    success.value = true
  }, 600)
}
</script>
