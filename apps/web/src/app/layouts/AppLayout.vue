<template>
  <div class="min-h-screen flex bg-[#e8edf2] text-slate-800 font-sans">
    <!-- Deep Petrol Sidebar (Reference Modern Dashboard) -->
    <aside
      class="fixed inset-y-0 left-0 z-30 flex flex-col bg-[#0c2b3d] transition-all duration-300"
      :class="sidebarOpen ? 'w-64' : 'w-20'"
    >
      <!-- Top Profile & Brand Header -->
      <div class="pt-6 pb-4 px-4 flex flex-col items-center text-center flex-shrink-0">
        <div class="relative mb-2">
          <img
            :src="userAvatar"
            class="w-14 h-14 rounded-full object-cover ring-2 ring-white/20 shadow-md p-0.5"
            alt="Avatar"
          />
          <span class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-[#0c2b3d]"></span>
        </div>
        <div v-if="sidebarOpen" class="w-full">
          <h3 class="text-sm font-bold text-white tracking-tight truncate">{{ userName }}</h3>
          <p class="text-[11px] text-slate-300/80 truncate mt-0.5">{{ userEmailOrNip }}</p>
        </div>
      </div>

      <!-- Navigation Links with Sliding Carved Indicator -->
      <nav
        ref="navContainerRef"
        class="relative flex-1 overflow-y-auto pt-2 pb-4 space-y-1 custom-sidebar-scroll"
      >
        <!-- Floating Sliding Active Pill -->
        <div
          v-if="indicatorReady"
          class="nav-sliding-pill"
          :style="indicatorStyle"
        ></div>

        <template v-for="item in navItems" :key="item.name">
          <!-- Section Divider Header -->
          <div
            v-if="item.section && sidebarOpen"
            class="pt-3 pb-1 px-4 text-[10px] font-bold tracking-wider uppercase text-slate-400/80"
          >
            {{ item.section }}
          </div>
          <div v-else-if="item.section && !sidebarOpen" class="my-2 border-t border-white/10"></div>

          <RouterLink
            :to="item.to"
            :ref="(el) => setNavItemRef(item.to, el)"
            class="nav-item-link group"
            :class="{ 'active-text': isActive(item.to) }"
            :title="!sidebarOpen ? item.label : undefined"
            @click="handleNavClick(item.to)"
          >
            <span
              class="w-5 h-5 flex-shrink-0 transition-colors duration-200"
              :class="isActive(item.to) ? 'text-[#0c2b3d]' : 'text-slate-300/80 group-hover:text-white'"
              v-html="item.icon"
            ></span>
            <span v-if="sidebarOpen" class="truncate text-sm tracking-wide transition-colors duration-200">
              {{ item.label }}
            </span>
          </RouterLink>
        </template>
      </nav>

      <!-- Bottom Mini Calendar Widget (Reference Dashboard Style) -->
      <div class="p-3 border-t border-white/10 bg-[#082231]/80 flex-shrink-0">
        <div v-if="sidebarOpen" class="bg-white rounded-2xl p-3 shadow-md text-slate-800">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <span class="text-xs font-bold text-slate-900">{{ calHeaderDay }}</span>
            <span class="text-xs text-slate-400">📅</span>
          </div>
          <div class="flex items-center justify-between mt-2 mb-1.5 px-0.5">
            <span class="text-[11px] font-bold text-slate-700">{{ calMonthName }}</span>
            <div class="flex items-center gap-1">
              <button @click="prevCalMonth" class="w-5 h-5 rounded hover:bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">‹</button>
              <button @click="nextCalMonth" class="w-5 h-5 rounded hover:bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">›</button>
            </div>
          </div>
          <div class="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1">
            <span>M</span><span>S</span><span>S</span><span>R</span><span>K</span><span>J</span><span>S</span>
          </div>
          <div class="grid grid-cols-7 gap-1 text-center text-[10px]">
            <div
              v-for="(cell, i) in calDaysMatrix"
              :key="i"
              class="h-5 flex items-center justify-center rounded-full font-medium"
              :class="{
                'bg-[#0c2b3d] text-white font-bold': cell.isToday,
                'text-slate-700 hover:bg-slate-100': cell.day && !cell.isToday,
                'invisible': !cell.day
              }"
            >
              {{ cell.day }}
            </div>
          </div>
          <button
            @click="handleLogout"
            class="w-full mt-2.5 pt-2 border-t border-slate-100 text-slate-500 hover:text-red-600 text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span>Keluar Akun</span>
          </button>
        </div>

        <div v-else class="flex flex-col items-center gap-2">
          <div class="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center text-xs font-bold" title="Hari ini">
            {{ new Date().getDate() }}
          </div>
          <button
            @click="handleLogout"
            class="p-2 text-white/50 hover:text-red-400 hover:bg-white/10 rounded-xl transition"
            title="Keluar"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div
      class="flex-1 flex flex-col min-w-0 transition-all duration-300"
      :style="{ marginLeft: sidebarOpen ? '255px' : '79px', paddingLeft: '1px' }"
    >
      <!-- Top Header Navbar -->
      <header class="sticky top-0 z-20 h-20 bg-white/85 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-8 shadow-xs">
        <!-- Left: Toggle & Academic Year -->
        <div class="flex items-center gap-5">
          <button
            @click="sidebarOpen = !sidebarOpen"
            class="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition"
            :aria-label="sidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <!-- Academic Year Dropdown Pill -->
          <div class="relative">
            <button
              @click="showYearDropdown = !showYearDropdown"
              class="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition shadow-xs"
            >
              <span>Tahun Ajaran {{ selectedYear }}</span>
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown Options -->
            <div
              v-if="showYearDropdown"
              class="absolute left-0 mt-2 w-48 bg-white border border-slate-150 rounded-xl shadow-lg py-1 z-50 text-xs font-medium"
            >
              <button
                v-for="yr in academicYears"
                :key="yr"
                @click="selectedYear = yr; showYearDropdown = false"
                class="w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition flex items-center justify-between"
                :class="{ 'text-blue-600 font-bold bg-blue-50/50': selectedYear === yr }"
              >
                <span>{{ yr }}</span>
                <span v-if="selectedYear === yr" class="text-blue-600">✓</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Asisten AI, Notification, Date/Time & Profile -->
        <div class="flex items-center gap-4 sm:gap-6">
          <!-- Asisten AI Quick Trigger in Navbar -->
          <button
            @click="openAssistant()"
            class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:opacity-95 hover:scale-102 transition"
            title="Buka Asisten AI Guru (Informatika & KKA)"
          >
            <span class="text-sm">🤖</span>
            <span class="hidden sm:inline">Asisten AI</span>
          </button>

          <!-- Notification Bell with Pop-up Dropdown -->
          <div class="relative" ref="notificationDropdownRef">
            <button
              @click="toggleNotifications"
              class="relative p-2.5 rounded-xl border transition shadow-xs"
              :class="showNotifications ? 'bg-blue-50 border-blue-300 text-blue-600' : 'bg-slate-50 border-slate-200/70 hover:bg-slate-100 text-slate-600 hover:text-blue-600'"
              title="Notifikasi & Pemberitahuan"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span
                v-if="unreadCount > 0"
                class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow"
              >
                {{ unreadCount }}
              </span>
            </button>

            <!-- Notification Pop-up Dropdown Card -->
            <div
              v-if="showNotifications"
              class="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <!-- Pop-up Header -->
              <div class="p-3.5 bg-slate-50 border-b border-slate-200/70 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <h4 class="font-bold text-xs text-slate-900">Notifikasi & Pengumuman</h4>
                  <span
                    v-if="unreadCount > 0"
                    class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold"
                  >
                    {{ unreadCount }} Baru
                  </span>
                </div>
                <button
                  v-if="unreadCount > 0"
                  @click="markAllAsRead"
                  class="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition"
                >
                  ✓ Tandai Semua Dibaca
                </button>
              </div>

              <!-- Notifications List -->
              <div class="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
                <div
                  v-for="item in notifications"
                  :key="item.id"
                  class="p-3.5 flex items-start gap-3 hover:bg-slate-50/80 transition relative text-left"
                  :class="{ 'bg-blue-50/25': !item.isRead }"
                >
                  <!-- Icon -->
                  <div
                    class="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                    :class="item.iconBg"
                  >
                    {{ item.icon }}
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-1">
                      <p class="text-xs font-bold text-slate-900 truncate">
                        {{ item.title }}
                      </p>
                      <span
                        v-if="!item.isRead"
                        class="w-2 h-2 rounded-full bg-blue-600 shrink-0"
                      ></span>
                    </div>
                    <p class="text-[11px] text-slate-500 leading-snug mt-1">
                      {{ item.message }}
                    </p>
                    <div class="mt-2 flex items-center justify-between text-[11px]">
                      <span class="text-[10px] text-slate-400">{{ item.time }}</span>
                      <RouterLink
                        v-if="item.actionUrl"
                        :to="item.actionUrl"
                        @click="showNotifications = false; item.isRead = true"
                        class="font-bold text-blue-600 hover:underline"
                      >
                        {{ item.actionLabel }} →
                      </RouterLink>
                    </div>
                  </div>
                </div>

                <!-- Empty State -->
                <div
                  v-if="notifications.length === 0"
                  class="py-10 text-center text-slate-400 text-xs"
                >
                  <p class="text-2xl mb-1">📭</p>
                  <p>Tidak ada notifikasi baru</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Live Date & Clock -->
          <div class="hidden sm:flex flex-col text-right">
            <span class="text-xs font-semibold text-slate-800 leading-tight">{{ liveDate }}</span>
            <span class="text-[11px] font-medium text-slate-400 leading-tight mt-0.5">{{ liveClock }}</span>
          </div>

          <!-- Profile Badge -->
          <RouterLink
            to="/profile"
            class="flex items-center gap-3 pl-3 pr-2 py-1 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200/60"
          >
            <img
              :src="userAvatar"
              class="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shadow-sm"
              alt="Avatar"
            />
            <div class="text-left hidden md:block">
              <p class="text-xs font-bold text-slate-900 leading-tight">{{ userName }}</p>
              <p class="text-[11px] text-slate-400 leading-tight mt-0.5">Informatika & KKA · SMP Negeri 6 Kendari</p>
            </div>
          </RouterLink>
        </div>
      </header>

      <!-- Page Main Content Slot -->
      <main class="flex-1 p-6 lg:p-8">
        <slot>
          <RouterView v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
              <component :is="Component" />
            </Transition>
          </RouterView>
        </slot>
      </main>

      <!-- Belajarena Footer -->
      <footer class="px-8 py-5 border-t border-slate-200/60 bg-white/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <p>© 2026 Belajarena · SMP Negeri 6 Kendari · Muhammad Fadly Akbar Arsandi, S.Pd. (NIP: 199509282020121003)</p>
        <p class="font-medium text-slate-500">Informatika & KKA · Versi 2.5.0</p>
      </footer>

      <!-- Global AI Pedagogical Assistant Modal -->
      <AiAssistantModal />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute, RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AiAssistantModal from '@/components/AiAssistantModal.vue'
import { useAiAssistant } from '@/composables/useAiAssistant'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { openAssistant } = useAiAssistant()

const sidebarOpen = ref(true)
const showYearDropdown = ref(false)
const selectedYear = ref('2024/2025')
const academicYears = ['2024/2025', '2025/2026', '2023/2024']

// User details
const userName = computed(() => authStore.user?.name || 'Muhammad Fadly Akbar Arsandi, S.Pd.')
const userNip = computed(() => (authStore.user as any)?.nip || '199509282020121003')
const userAvatar = computed(() => {
  return authStore.user?.avatar_url || authStore.user?.avatar_path || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
})

const isStudent = computed(() => authStore.hasRole('student'))
const userClassOrRole = computed(() => {
  if (isStudent.value) return 'Kelas XI IPA 1'
  return 'Guru Informatika & KKA'
})
const userStatusText = computed(() => {
  if (isStudent.value) return 'Siswa Aktif'
  return 'Guru Aktif · SMPN 6'
})
const userEmailOrNip = computed(() => {
  return authStore.user?.email || `NIP: ${userNip.value}`
})

// Mini-Calendar State (Dashboard Reference Style)
const calDate = ref(new Date())
const calMonthName = computed(() => {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${months[calDate.value.getMonth()]} ${calDate.value.getFullYear()}`
})
const calHeaderDay = computed(() => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const now = new Date()
  return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`
})
const calDaysMatrix = computed(() => {
  const y = calDate.value.getFullYear()
  const m = calDate.value.getMonth()
  const firstDay = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  
  const cells: { day: number | null; isToday: boolean }[] = []
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: null, isToday: false })
  }
  const today = new Date()
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = today.getFullYear() === y && today.getMonth() === m && today.getDate() === d
    cells.push({ day: d, isToday })
  }
  return cells
})

function prevCalMonth() {
  const d = new Date(calDate.value)
  d.setMonth(d.getMonth() - 1)
  calDate.value = d
}
function nextCalMonth() {
  const d = new Date(calDate.value)
  d.setMonth(d.getMonth() + 1)
  calDate.value = d
}

// Notification Pop-up State
const showNotifications = ref(false)
const notificationDropdownRef = ref<HTMLDivElement | null>(null)
const notifications = ref<any[]>([])

async function loadNotifications() {
  try {
    const res = await api.get('/notifications')
    const list = res.data?.data || []
    notifications.value = list.map((n: any) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      time: n.created_at || 'Baru saja',
      icon: '🔔',
      iconBg: 'bg-blue-100 text-blue-700',
      isRead: !!n.read,
      actionUrl: '',
      actionLabel: ''
    }))
  } catch (err) {
    notifications.value = []
  }
}

const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

function toggleNotifications(event?: Event) {
  if (event) event.stopPropagation()
  showNotifications.value = !showNotifications.value
}

function markAllAsRead() {
  notifications.value.forEach(n => (n.isRead = true))
}

function handleClickOutside(event: MouseEvent) {
  if (
    notificationDropdownRef.value &&
    !notificationDropdownRef.value.contains(event.target as Node)
  ) {
    showNotifications.value = false
  }
}

// Dynamic Live Indonesian Date & Time
const liveDate = ref('')
const liveClock = ref('')

function updateClock() {
  const now = new Date()
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  
  const dayName = days[now.getDay()]
  const dateNum = now.getDate()
  const monthName = months[now.getMonth()]
  const yearNum = now.getFullYear()
  
  liveDate.value = `${dayName}, ${dateNum} ${monthName} ${yearNum}`

  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  liveClock.value = `${h}:${m} WIB`
}

let clockInterval: any = null
onMounted(() => {
  updateClock()
  loadNotifications()
  clockInterval = setInterval(updateClock, 1000)
  window.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', onWindowResize)
  updateIndicatorPosition(true)
})
onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval)
  window.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', onWindowResize)
})

interface NavMenuItem {
  name: string
  to: string
  label: string
  icon: string
  teacherOnly?: boolean
  studentOnly?: boolean
  section?: string
}

const allNavItems: NavMenuItem[] = [
  // 1. UTAMA
  {
    name: 'dashboard',
    to: '/dashboard',
    label: 'Dashboard',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
    section: 'UTAMA'
  },

  // 2. KELAS & SISWA
  {
    name: 'kelas',
    to: '/classes',
    label: 'Manajemen Kelas',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`,
    teacherOnly: true,
    section: 'KELAS & SISWA'
  },
  {
    name: 'siswa',
    to: '/students',
    label: 'Data Siswa',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
    teacherOnly: true
  },
  {
    name: 'jadwal',
    to: '/schedule',
    label: 'Jadwal Mingguan',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`
  },
  {
    name: 'absensi',
    to: '/attendance',
    label: 'Absensi Siswa',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`
  },

  // 3. PEMBELAJARAN & CBT
  {
    name: 'bank-soal',
    to: '/question-bank',
    label: 'Bank Soal',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    teacherOnly: true,
    section: 'PEMBELAJARAN & CBT'
  },
  {
    name: 'ujian',
    to: '/cbt',
    label: 'Ujian CBT',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`
  },
  {
    name: 'tugas',
    to: '/assignments',
    label: 'Tugas Siswa',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>`
  },
  {
    name: 'mapping-tp',
    to: '/curriculum/chapters',
    label: 'Mapping BAB & TP',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>`,
    teacherOnly: true
  },
  {
    name: 'rekap-ulangan',
    to: '/reports/exam-events',
    label: 'Rekap Nilai Ulangan',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>`
  },
  {
    name: 'nilai',
    to: '/reports/grades',
    label: 'Rekap Nilai Siswa',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>`
  },
  {
    name: 'ranking',
    to: '/rankings',
    label: 'Live Ranking',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>`
  },
  {
    name: 'materi',
    to: '/presentations',
    label: 'Studio Presentasi',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>`
  },
  {
    name: 'games',
    to: '/games',
    label: 'Edu-Games',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
  },

  // 4. SISTEM & PENGATURAN
  {
    name: 'pengaturan-sekolah',
    to: '/school/settings',
    label: 'Pengaturan Sekolah',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg>`,
    teacherOnly: true,
    section: 'PENGATURAN'
  },
  {
    name: 'pengaturan',
    to: '/profile',
    label: 'Profil & Sandi',
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`
  }
]

const navItems = computed(() => {
  if (isStudent.value) {
    return allNavItems.filter(item => !item.teacherOnly)
  }
  return allNavItems.filter(item => !item.studentOnly)
})

function isActive(to: string) {
  if (to === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(to)
}

// Sliding Active Nav Indicator (Smooth physics transition)
const navContainerRef = ref<HTMLElement | null>(null)
const navItemDomMap = new Map<string, HTMLElement>()
const indicatorTop = ref(0)
const indicatorHeight = ref(44)
const indicatorVisible = ref(false)
const indicatorReady = ref(false)
const hasMounted = ref(false)

function setNavItemRef(to: string, el: any) {
  if (el) {
    const domEl = el.$el || el
    navItemDomMap.set(to, domEl)
  }
}

function getActiveElement(): HTMLElement | null {
  for (const item of navItems.value) {
    if (isActive(item.to)) {
      const el = navItemDomMap.get(item.to)
      if (el) return el
    }
  }
  return null
}

function updateIndicatorPosition(immediate = false) {
  nextTick(() => {
    const el = getActiveElement()
    if (el) {
      indicatorTop.value = el.offsetTop
      indicatorHeight.value = el.offsetHeight
      indicatorVisible.value = true
      indicatorReady.value = true
    } else {
      indicatorVisible.value = false
    }

    if (immediate) {
      hasMounted.value = false
      nextTick(() => {
        setTimeout(() => {
          hasMounted.value = true
        }, 60)
      })
    }
  })
}

function handleNavClick(to: string) {
  const el = navItemDomMap.get(to)
  if (el) {
    indicatorTop.value = el.offsetTop
    indicatorHeight.value = el.offsetHeight
    indicatorVisible.value = true
    indicatorReady.value = true
  }
}

const indicatorStyle = computed(() => {
  return {
    transform: `translateY(${indicatorTop.value}px)`,
    height: `${indicatorHeight.value}px`,
    opacity: indicatorVisible.value ? 1 : 0,
    transition: hasMounted.value
      ? 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), height 0.2s ease, opacity 0.2s ease'
      : 'none'
  }
})

watch(() => route.path, () => {
  updateIndicatorPosition()
})

watch(sidebarOpen, () => {
  nextTick(() => {
    setTimeout(updateIndicatorPosition, 320)
  })
})

function onWindowResize() {
  updateIndicatorPosition()
}

async function handleLogout() {
  if (!confirm('Apakah Anda yakin ingin keluar?')) return
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.custom-sidebar-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-sidebar-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-sidebar-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
}
.custom-sidebar-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
