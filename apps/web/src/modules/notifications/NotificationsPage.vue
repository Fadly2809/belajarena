<template>
  <div class="space-y-6 max-w-4xl">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 flex items-center gap-2">
          <span>🔔</span> Notifikasi & Pemberitahuan Sekolah
        </h1>
        <p class="text-surface-500 text-sm mt-0.5">
          Pemberitahuan aktivitas pembelajaran, penugasan siswa, jadwal CBT, dan pengumuman dinas
        </p>
      </div>
      <div v-if="notifications.length > 0" class="flex items-center gap-2">
        <button @click="markAllAsRead" class="btn btn-secondary text-xs px-3 py-1.5 font-medium">
          ✓ Tandai Semua Telah Dibaca
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="notifications.length === 0" class="card p-12 text-center space-y-3">
      <div class="text-4xl">🔔</div>
      <h2 class="text-base font-bold text-surface-900">Tidak Ada Notifikasi Baru</h2>
      <p class="text-xs text-surface-500 max-w-sm mx-auto">
        Semua pemberitahuan dan aktivitas tugas atau ujian baru akan ditampilkan di sini secara real-time.
      </p>
    </div>

    <!-- Notifications List -->
    <div v-else class="space-y-3">
      <div
        v-for="item in notifications"
        :key="item.id"
        class="card p-4 flex items-start gap-4 transition hover:shadow-sm"
        :class="!item.isRead ? 'bg-primary-50/40 border-l-4 border-l-primary-600' : 'bg-white border-l-4 border-l-surface-300'"
      >
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" :class="item.iconBg || 'bg-blue-100 text-blue-700'">
          {{ item.icon || '🔔' }}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <h2 class="text-sm font-bold text-surface-900">{{ item.title }}</h2>
            <span class="text-[10px] text-surface-400 shrink-0">{{ item.time }}</span>
          </div>
          <p class="text-xs text-surface-600 mt-1 leading-relaxed">
            {{ item.message }}
          </p>
          <div class="mt-2 flex items-center gap-3 text-xs">
            <router-link v-if="item.actionUrl" :to="item.actionUrl" class="text-primary-600 font-bold hover:underline">
              {{ item.actionLabel }} →
            </router-link>
            <button @click="item.isRead = true" v-if="!item.isRead" class="text-surface-400 hover:text-surface-600">
              Tandai dibaca
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const notifications = ref<any[]>([])

async function loadNotifications() {
  try {
    const res = await api.get('/notifications')
    notifications.value = (res as any)?.data || []
  } catch (err) {
    console.error('Failed to load notifications:', err)
  }
}

function markAllAsRead() {
  notifications.value.forEach(n => n.isRead = true)
}

onMounted(() => {
  loadNotifications()
})
</script>
