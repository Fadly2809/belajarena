<template>
  <div class="min-h-[75vh] flex flex-col items-center justify-center text-center p-6 space-y-5">
    <div class="w-24 h-24 rounded-3xl bg-primary-50 text-primary-600 flex items-center justify-center text-5xl shadow-sm border border-primary-100">
      🔍
    </div>
    <div class="space-y-1">
      <h1 class="text-4xl font-black text-surface-900 tracking-tight">404</h1>
      <h2 class="text-lg font-bold text-surface-800">Halaman Tidak Ditemukan</h2>
      <p class="text-xs text-surface-500 max-w-sm mx-auto">
        Maaf, halaman atau rute yang Anda tuju tidak ditemukan atau sedang dalam proses pemeliharaan.
      </p>
    </div>
    <div class="pt-2">
      <router-link :to="homePath" class="btn btn-primary text-xs px-5 py-2.5 font-bold shadow-md">
        ← {{ isStudent ? 'Kembali ke Portal Siswa' : 'Kembali ke Dashboard Utama' }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isStudent = computed(() => {
  return authStore.user?.role === 'student' || authStore.user?.is_student
})
const homePath = computed(() => (isStudent.value ? '/student' : '/dashboard'))
</script>
