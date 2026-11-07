<template>
  <div v-if="!isStudent" class="min-h-screen flex bg-[#e8edf2] text-slate-800 font-sans">
    <!-- Deep Petrol Sidebar (Desktop & Tablet) -->
    <aside
      class="fixed inset-y-0 left-0 z-30 hidden md:flex flex-col bg-[#0c2b3d] transition-all duration-300"
      :class="sidebarOpen ? 'w-64' : 'w-20'"
    >
      <!-- Top Brand Logo -->
      <div class="pt-5 pb-3 px-4 flex items-center justify-center flex-shrink-0 border-b border-white/10">
        <RouterLink to="/dashboard" class="flex items-center justify-center transition-transform hover:scale-105" title="Belajarena">
          <img
            v-if="sidebarOpen"
            src="/logo.png"
            alt="Belajarena"
            class="h-9 w-auto max-w-[190px] object-contain drop-shadow"
          />
          <img
            v-else
            src="/logo-icon.png"
            alt="Belajarena Icon"
            class="w-9 h-9 rounded-xl object-contain shadow-md"
          />
        </RouterLink>
      </div>

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

      <!-- Navigation Links (Struktur Baru Belajarena dengan Animasi Geser Slide Menu) -->
      <nav
        ref="navContainerRef"
        class="relative flex-1 overflow-y-auto pt-2 pb-4 custom-sidebar-scroll"
      >
        <!-- Floating Sliding Active Pill (Animasi Geser Slide Carved Indicator) -->
        <div
          v-if="indicatorReady"
          class="nav-sliding-pill"
          :style="indicatorStyle"
        ></div>

        <!-- MENU KHUSUS ADMINISTRATOR WEBSITE -->
        <template v-if="isPlatformAdmin">
          <div class="px-3 pt-1 pb-2">
            <div v-if="sidebarOpen" class="px-2 pb-2 text-[10px] font-black tracking-wider uppercase text-blue-300 flex items-center justify-between">
              <span class="flex items-center gap-1.5">🛠️ ADMIN WEBSITE</span>
              <span class="text-[9px] bg-blue-500/20 text-blue-200 px-1.5 py-0.5 rounded font-mono font-bold">PUSAT KENDALI</span>
            </div>
            <div v-else class="my-2 border-t border-white/10"></div>

            <div class="space-y-1">
              <RouterLink
                v-for="item in rawAdminMenu"
                :key="item.to"
                :to="item.to"
                :ref="(el) => setNavItemRef(item.to, el)"
                class="nav-item-link group"
                :class="{ 'active-text': isRouteActive(item.to) }"
                :title="!sidebarOpen ? item.label : undefined"
                @click="handleNavClick(item.to)"
              >
                <span
                  class="w-5 h-5 flex-shrink-0 transition-colors duration-200"
                  :class="isRouteActive(item.to) ? 'text-[#0c2b3d]' : 'text-slate-300/80 group-hover:text-white'"
                  v-html="item.icon"
                ></span>
                <span v-if="sidebarOpen" class="truncate text-sm tracking-wide transition-colors duration-200">
                  {{ item.label }}
                </span>
              </RouterLink>
            </div>
          </div>
        </template>

        <!-- MENU GURU (PEMBELAJARAN, KELAS, ASESMEN, REKAP NILAI) -->
        <template v-else>
        <!-- 1. BERANDA / DASHBOARD -->
        <div>
          <RouterLink
            to="/dashboard"
            :ref="(el) => setNavItemRef('/dashboard', el)"
            class="nav-item-link group"
            :class="{ 'active-text': isRouteActive('/dashboard') }"
            :title="!sidebarOpen ? 'Dashboard' : undefined"
            @click="handleNavClick('/dashboard')"
          >
            <span
              class="w-5 h-5 flex-shrink-0 transition-colors duration-200"
              :class="isRouteActive('/dashboard') ? 'text-[#0c2b3d]' : 'text-slate-300/80 group-hover:text-white'"
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
            </span>
            <span v-if="sidebarOpen" class="truncate text-sm tracking-wide transition-colors duration-200">
              Dashboard
            </span>
          </RouterLink>
        </div>

        <!-- 2. FITUR UTAMA (DUA KARTU MENONJOL: EDU-GAMES & LIVE PRESENTASI) -->
        <div class="pt-2 pb-1">
          <div v-if="sidebarOpen" class="px-4 pb-1.5 text-[10px] font-bold tracking-wider uppercase text-amber-300/90 flex items-center justify-between">
            <span class="flex items-center gap-1">⭐ FITUR UTAMA</span>
            <span class="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">UNGGULAN</span>
          </div>
          <div v-else class="my-2 border-t border-white/10"></div>

          <div class="space-y-2">
            <!-- KARTU 1: EDU-GAMES -->
            <RouterLink
              to="/games"
              :ref="(el) => setNavItemRef('/games', el)"
              class="relative z-10 block mx-3 rounded-2xl transition-all duration-200 group overflow-hidden"
              :class="[
                sidebarOpen
                  ? 'p-3 bg-gradient-to-br from-[#4c1d95] via-[#6d28d9] to-[#d97706] text-white shadow-md border border-white/20 hover:shadow-xl hover:scale-[1.02]'
                  : 'p-2 flex items-center justify-center bg-gradient-to-br from-[#4c1d95] to-[#d97706] text-white mx-auto w-11 h-11',
                isRouteActive('/games') ? 'ring-2 ring-amber-400 shadow-amber-500/30' : ''
              ]"
              :title="!sidebarOpen ? 'Edu-Games (Unggulan)' : undefined"
              @click="handleNavClick('/games')"
            >
              <div v-if="sidebarOpen">
                <div class="flex items-center justify-between gap-1.5">
                  <div class="flex items-center gap-2">
                    <span class="text-base">🎮</span>
                    <span class="text-xs font-black text-white tracking-tight leading-none">Edu-Games</span>
                  </div>
                  <span class="px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow-2xs">
                    Unggulan
                  </span>
                </div>
                <p class="text-[10px] text-purple-100/90 leading-tight mt-1.5 font-medium line-clamp-1">
                  Mainkan game belajar bersama kelas
                </p>
              </div>
              <div v-else class="text-lg">
                🎮
              </div>
            </RouterLink>

            <!-- KARTU 2: LIVE PRESENTASI -->
            <RouterLink
              to="/presentations"
              :ref="(el) => setNavItemRef('/presentations', el)"
              class="relative z-10 block mx-3 rounded-2xl transition-all duration-200 group overflow-hidden"
              :class="[
                sidebarOpen
                  ? 'p-3 bg-gradient-to-br from-[#0369a1] via-[#0284c7] to-[#0d9488] text-white shadow-md border border-white/20 hover:shadow-xl hover:scale-[1.02]'
                  : 'p-2 flex items-center justify-center bg-gradient-to-br from-[#0369a1] to-[#0d9488] text-white mx-auto w-11 h-11',
                isRouteActive('/presentations') ? 'ring-2 ring-cyan-300 shadow-cyan-500/30' : ''
              ]"
              :title="!sidebarOpen ? 'Live Presentasi (Unggulan)' : undefined"
              @click="handleNavClick('/presentations')"
            >
              <div v-if="sidebarOpen">
                <div class="flex items-center justify-between gap-1.5">
                  <div class="flex items-center gap-2">
                    <span class="text-base">📡</span>
                    <span class="text-xs font-black text-white tracking-tight leading-none">Live Presentasi</span>
                  </div>
                  <span class="px-1.5 py-0.5 rounded-md bg-cyan-300 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow-2xs">
                    Unggulan
                  </span>
                </div>
                <p class="text-[10px] text-sky-100/90 leading-tight mt-1.5 font-medium line-clamp-1">
                  {{ isStudent ? 'Gabung sesi live presentasi guru' : 'Presentasikan slide langsung ke HP siswa' }}
                </p>
              </div>
              <div v-else class="text-lg">
                📡
              </div>
            </RouterLink>
          </div>
        </div>

        <!-- 3. AKADEMIK (SATU MENU GABUNGAN: ACCORDION & PUSAT HUB) -->
        <div class="pt-2">
          <div v-if="sidebarOpen" class="space-y-1">
            <!-- Accordion Header -->
            <div
              :ref="(el) => setNavItemRef('akademik-header', el)"
              class="relative z-10 mx-3 flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors duration-200 select-none group"
              :class="[
                isAkademikHeaderActive
                  ? 'bg-transparent text-[#0c2b3d] font-bold'
                  : (isCurrentRouteInAkademik()
                      ? 'bg-transparent text-blue-200 font-semibold hover:bg-white/5'
                      : 'text-slate-300 hover:text-white hover:bg-white/10')
              ]"
            >
              <div
                class="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                @click="toggleAkademik"
              >
                <span class="text-base">📁</span>
                <span
                  class="text-sm tracking-wide truncate transition-colors duration-200"
                  :class="isAkademikHeaderActive ? 'text-[#0c2b3d] font-bold' : (isCurrentRouteInAkademik() ? 'text-blue-200 font-semibold' : 'text-slate-300 group-hover:text-white')"
                >
                  Akademik
                </span>
                <span
                  class="text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold transition-colors duration-200"
                  :class="isAkademikHeaderActive ? 'bg-[#0c2b3d]/15 text-[#0c2b3d]' : 'bg-white/15 text-slate-300'"
                >
                  {{ visibleAkademikCount }}
                </span>
              </div>

              <div class="flex items-center gap-1">
                <!-- Direct Hub Page Shortcut -->
                <RouterLink
                  to="/academic"
                  class="p-1 rounded-lg transition-colors duration-200"
                  :class="isAkademikHeaderActive ? 'text-[#0c2b3d] hover:bg-black/10' : 'text-slate-300 hover:text-white hover:bg-white/20'"
                  title="Buka Pusat Akademik (Halaman Hub)"
                  @click.stop="handleNavClick('/academic')"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </RouterLink>

                <!-- Chevron Toggle -->
                <button
                  type="button"
                  @click.stop="toggleAkademik"
                  class="p-1 rounded-lg transition-colors duration-200"
                  :class="isAkademikHeaderActive ? 'text-[#0c2b3d] hover:bg-black/10' : 'text-slate-400 group-hover:text-white hover:bg-white/20'"
                  :aria-label="isAkademikOpen ? 'Tutup Akademik' : 'Buka Akademik'"
                >
                  <svg
                    class="w-4 h-4 transition-transform duration-200"
                    :class="{ 'rotate-180': isAkademikOpen }"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Accordion Content: 3 Sub-kelompok dengan dukungan Sliding Pill -->
            <div
              v-show="isAkademikOpen"
              class="space-y-3 pt-1 pb-1 transition-all"
            >
              <!-- Sub-group 1: Kelas & Siswa -->
              <div v-if="filteredKelasSiswa.length" class="space-y-0.5">
                <div class="px-5 pt-1.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-400/80">
                  Kelas & Siswa
                </div>
                <RouterLink
                  v-for="item in filteredKelasSiswa"
                  :key="item.to"
                  :to="item.to"
                  :ref="(el) => setNavItemRef(item.to, el)"
                  class="nav-item-link group !py-2 !text-xs !pl-7"
                  :class="{ 'active-text': isRouteActive(item.to) }"
                  @click="handleNavClick(item.to)"
                >
                  <span
                    class="w-4 h-4 flex-shrink-0 transition-colors duration-200"
                    :class="isRouteActive(item.to) ? 'text-[#0c2b3d]' : 'text-slate-300/80 group-hover:text-white'"
                    v-html="item.icon"
                  ></span>
                  <span class="truncate tracking-wide transition-colors duration-200">
                    {{ item.label }}
                  </span>
                </RouterLink>
              </div>

              <!-- Sub-group 2: Penilaian & Tugas -->
              <div v-if="filteredPenilaianTugas.length" class="space-y-0.5">
                <div class="px-5 pt-1.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-400/80">
                  Penilaian & Tugas
                </div>
                <RouterLink
                  v-for="item in filteredPenilaianTugas"
                  :key="item.to"
                  :to="item.to"
                  :ref="(el) => setNavItemRef(item.to, el)"
                  class="nav-item-link group !py-2 !text-xs !pl-7"
                  :class="{ 'active-text': isRouteActive(item.to) }"
                  @click="handleNavClick(item.to)"
                >
                  <span
                    class="w-4 h-4 flex-shrink-0 transition-colors duration-200"
                    :class="isRouteActive(item.to) ? 'text-[#0c2b3d]' : 'text-slate-300/80 group-hover:text-white'"
                    v-html="item.icon"
                  ></span>
                  <span class="truncate tracking-wide transition-colors duration-200">
                    {{ item.label }}
                  </span>
                </RouterLink>
              </div>

              <!-- Sub-group 3: Laporan & Peringkat -->
              <div v-if="filteredLaporanMateri.length" class="space-y-0.5">
                <div class="px-5 pt-1.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-400/80">
                  Laporan & Peringkat
                </div>
                <RouterLink
                  v-for="item in filteredLaporanMateri"
                  :key="item.to"
                  :to="item.to"
                  :ref="(el) => setNavItemRef(item.to, el)"
                  class="nav-item-link group !py-2 !text-xs !pl-7"
                  :class="{ 'active-text': isRouteActive(item.to) }"
                  @click="handleNavClick(item.to)"
                >
                  <span
                    class="w-4 h-4 flex-shrink-0 transition-colors duration-200"
                    :class="isRouteActive(item.to) ? 'text-[#0c2b3d]' : 'text-slate-300/80 group-hover:text-white'"
                    v-html="item.icon"
                  ></span>
                  <span class="truncate tracking-wide transition-colors duration-200">
                    {{ item.label }}
                  </span>
                </RouterLink>
              </div>
            </div>
          </div>

          <!-- When collapsed: Single Hub Icon with Sliding Pill Support -->
          <div v-else class="my-1">
            <RouterLink
              to="/academic"
              :ref="(el) => setNavItemRef('/academic', el)"
              class="nav-item-link group"
              :class="{ 'active-text': isCurrentRouteInAkademik() || isRouteActive('/academic') }"
              title="Pusat Akademik"
              @click="handleNavClick('/academic')"
            >
              <span
                class="w-5 h-5 flex-shrink-0 transition-colors duration-200"
                :class="isCurrentRouteInAkademik() || isRouteActive('/academic') ? 'text-[#0c2b3d]' : 'text-slate-300/80 group-hover:text-white'"
              >
                📁
              </span>
            </RouterLink>
          </div>
        </div>

        <!-- 4. PENGATURAN (TETAP DI BAGIAN BAWAH DENGAN DUKUNGAN SLIDING PILL) -->
        <div class="pt-3">
          <div v-if="sidebarOpen" class="px-4 pb-1 text-[10px] font-bold tracking-wider uppercase text-slate-400/80">
            PENGATURAN
          </div>
          <div v-else class="my-2 border-t border-white/10"></div>

          <div class="space-y-0.5">
            <RouterLink
              v-for="item in filteredPengaturan"
              :key="item.to"
              :to="item.to"
              :ref="(el) => setNavItemRef(item.to, el)"
              class="nav-item-link group !py-2 text-xs"
              :class="{ 'active-text': isRouteActive(item.to) }"
              :title="!sidebarOpen ? item.label : undefined"
              @click="handleNavClick(item.to)"
            >
              <span
                class="w-4 h-4 flex-shrink-0 transition-colors duration-200"
                :class="isRouteActive(item.to) ? 'text-[#0c2b3d]' : 'text-slate-300/80 group-hover:text-white'"
                v-html="item.icon"
              ></span>
              <span v-if="sidebarOpen" class="truncate tracking-wide transition-colors duration-200">
                {{ item.label }}
              </span>
            </RouterLink>
          </div>
        </div>
        </template>
      </nav>

      <!-- Bottom Action / Logout -->
      <div class="p-3 border-t border-white/10 bg-[#082231]/80 flex-shrink-0">
        <button
          v-if="sidebarOpen"
          @click="handleLogout"
          class="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-slate-300 hover:text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span>Keluar Akun</span>
        </button>

        <div v-else class="flex flex-col items-center">
          <button
            @click="handleLogout"
            class="p-2.5 text-white/60 hover:text-rose-400 hover:bg-white/10 rounded-xl transition cursor-pointer"
            title="Keluar Akun"
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
      :style="mainContentStyle"
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

        <!-- Right: Notification, Date/Time & Profile -->
        <div class="flex items-center gap-4 sm:gap-6">
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
              <p class="text-[11px] text-slate-400 leading-tight mt-0.5 truncate max-w-[200px]">{{ userSubjectText }} · {{ currentSchoolName }}</p>
            </div>
          </RouterLink>
        </div>
      </header>

      <!-- Page Main Content Slot -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
        <slot>
          <RouterView v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
              <component :is="Component" />
            </Transition>
          </RouterView>
        </slot>
      </main>

      <!-- Belajarena Footer -->
      <footer class="px-8 py-5 border-t border-slate-200/60 bg-white/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 mb-16 md:mb-0">
        <p>© 2026 Belajarena · {{ currentSchoolName }} · {{ currentTeacherCredit }}</p>
        <p class="font-medium text-slate-500">{{ userSubjectText }} · Versi 2.5.0</p>
      </footer>

      <!-- Floating AI Chatbot Circular Button (Global across all pages) -->
      <div class="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40">
        <button
          @click="openAssistant()"
          class="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center text-2xl shadow-xl hover:scale-110 active:scale-95 transition-all ring-4 ring-white animate-pulse-gentle shadow-blue-500/30 cursor-pointer group"
          title="Tanya AI Chatbot Belajarena"
        >
          <span>🤖</span>
          <span class="sr-only">Buka AI Chatbot Belajarena</span>
        </button>
      </div>

      <!-- Global AI Pedagogical Assistant Modal -->
      <AiAssistantModal />
    </div>

    <!-- Mobile Bottom Navigation Bar (Bilah Bawah HP: Tepat 4 Tombol Sesuai Spesifikasi) -->
    <nav class="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0c2b3d]/95 backdrop-blur-lg border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl">
      <!-- 1. Dashboard -->
      <RouterLink
        to="/dashboard"
        class="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition text-center min-w-[64px]"
        :class="isRouteActive('/dashboard') ? 'text-white font-bold bg-white/15' : 'text-slate-400 hover:text-slate-200'"
      >
        <span class="text-lg leading-none">🏠</span>
        <span class="text-[10px] tracking-tight">Dashboard</span>
      </RouterLink>

      <!-- 2. Edu-Games -->
      <RouterLink
        to="/games"
        class="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition text-center min-w-[64px] relative"
        :class="isRouteActive('/games') ? 'text-amber-300 font-bold bg-white/15 ring-1 ring-amber-400/50' : 'text-slate-300 hover:text-white'"
      >
        <span class="text-lg leading-none">🎮</span>
        <span class="text-[10px] tracking-tight">Edu-Games</span>
        <span class="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
      </RouterLink>

      <!-- 3. Live Presentasi -->
      <RouterLink
        to="/presentations"
        class="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition text-center min-w-[64px] relative"
        :class="isRouteActive('/presentations') ? 'text-cyan-300 font-bold bg-white/15 ring-1 ring-cyan-400/50' : 'text-slate-300 hover:text-white'"
      >
        <span class="text-lg leading-none">📡</span>
        <span class="text-[10px] tracking-tight">Live Presentasi</span>
      </RouterLink>

      <!-- 4. Akademik -->
      <RouterLink
        to="/academic"
        class="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition text-center min-w-[64px]"
        :class="isRouteActive('/academic') || isCurrentRouteInAkademik() ? 'text-white font-bold bg-white/15 ring-1 ring-blue-400/40' : 'text-slate-400 hover:text-slate-200'"
      >
        <span class="text-lg leading-none">📁</span>
        <span class="text-[10px] tracking-tight">Akademik</span>
      </RouterLink>
    </nav>
  </div>
  <div v-else class="min-h-screen bg-[#e8edf2] flex items-center justify-center p-4">
    <div class="spinner w-8 h-8 border-[#0c2b3d]"></div>
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

// User details & School Multi-Tenancy
const userName = computed(() => authStore.user?.name || 'Pendidik')
const userNip = computed(() => (authStore.user as any)?.nip || '')
const currentSchoolName = computed(() => authStore.currentSchool?.name || authStore.user?.school_name || 'Satuan Pendidikan')
const currentTeacherCredit = computed(() => {
  const name = authStore.user?.name || 'Pendidik'
  const nip = (authStore.user as any)?.nip ? ` (NIP: ${(authStore.user as any).nip})` : ''
  return `${name}${nip}`
})
const userSubjectText = computed(() => {
  if (Array.isArray(authStore.user?.subjects) && authStore.user.subjects.length > 0) {
    return authStore.user.subjects.join(', ')
  }
  return authStore.user?.subject || 'Pendidik'
})
const userAvatar = computed(() => {
  return authStore.user?.avatar_url || authStore.user?.avatar_path || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
})

const isStudent = computed(() => {
  return (
    authStore.user?.role === 'student' ||
    authStore.user?.is_student === true ||
    authStore.hasRole('student') ||
    !!authStore.user?.nis
  )
})
const isPlatformAdmin = computed(() => {
  return authStore.isSuperAdmin()
})
const userClassOrRole = computed(() => {
  if (isPlatformAdmin.value) return 'Administrator Website'
  if (isStudent.value) return 'Kelas XI IPA 1'
  return 'Guru Pengajar Mandiri'
})
const userStatusText = computed(() => {
  if (isPlatformAdmin.value) return 'Admin Platform Aktif'
  if (isStudent.value) return 'Siswa Aktif'
  return 'Ruang Mengajar Guru'
})
const userEmailOrNip = computed(() => {
  return authStore.user?.email || `NIP: ${userNip.value}`
})

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

// Responsive Mobile Detection & Main Content Offset
const isMobile = ref(false)
function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

const mainContentStyle = computed(() => {
  if (isMobile.value) {
    return { marginLeft: '0px' }
  }
  return {
    marginLeft: sidebarOpen.value ? '255px' : '79px',
    paddingLeft: '1px'
  }
})

let clockInterval: any = null
onMounted(() => {
  if (isStudent.value) {
    router.replace('/student')
    return
  }
  checkMobile()
  updateClock()
  loadNotifications()
  clockInterval = setInterval(updateClock, 1000)
  window.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', onWindowResize)
  updateIndicatorPosition(true)
})

watch(
  () => isStudent.value,
  (val) => {
    if (val) {
      router.replace('/student')
    }
  },
  { immediate: true }
)
onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval)
  window.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', onWindowResize)
})

function onWindowResize() {
  checkMobile()
  updateIndicatorPosition()
}

interface NavSubItem {
  to: string
  label: string
  icon: string
  teacherOnly?: boolean
}

// 0. MENU ADMINISTRATOR WEBSITE PLATFORM
const rawAdminMenu: NavSubItem[] = [
  {
    to: '/admin/overview',
    label: 'Ringkasan Platform',
    icon: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`
  },
  {
    to: '/admin/schools',
    label: 'Data Satuan Pendidikan',
    icon: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg>`
  },
  {
    to: '/admin/users',
    label: 'Data Pengguna & Guru',
    icon: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`
  },
  {
    to: '/profile',
    label: 'Profil Akun Admin',
    icon: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`
  }
]

// 1. KELAS & SISWA
const rawKelasSiswa: NavSubItem[] = [
  {
    to: '/classes',
    label: 'Manajemen Kelas',
    icon: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`,
    teacherOnly: true
  },
  {
    to: '/students',
    label: 'Data Siswa',
    icon: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
    teacherOnly: true
  },
  {
    to: '/schedule',
    label: 'Jadwal Mingguan',
    icon: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`
  },
  {
    to: '/attendance',
    label: 'Absensi Siswa',
    icon: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`
  }
]

// 2. PENILAIAN & TUGAS
const rawPenilaianTugas: NavSubItem[] = [
  {
    to: '/question-bank',
    label: 'Bank Soal',
    icon: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    teacherOnly: true
  },
  {
    to: '/cbt',
    label: 'Ujian CBT',
    icon: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`
  },
  {
    to: '/assignments',
    label: 'Tugas Siswa',
    icon: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>`
  },
  {
    to: '/paper-grading',
    label: 'Periksa Kertas (AI)',
    icon: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>`,
    teacherOnly: true
  },
  {
    to: '/curriculum/chapters',
    label: 'Mapping BAB & TP',
    icon: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>`,
    teacherOnly: true
  }
]

// 3. LAPORAN & PERINGKAT
const rawLaporanMateri: NavSubItem[] = [
  {
    to: '/reports/exam-events',
    label: 'Rekap Nilai Ulangan',
    icon: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`
  },
  {
    to: '/reports/grades',
    label: 'Rekap Nilai Siswa',
    icon: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>`
  },
  {
    to: '/rankings',
    label: 'Live Ranking',
    icon: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>`
  }
]

// 4. PENGATURAN
const rawPengaturan: NavSubItem[] = [
  {
    to: '/school/settings',
    label: 'Identitas Sekolah & Dokumen',
    icon: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg>`,
    teacherOnly: true
  },
  {
    to: '/profile',
    label: 'Profil & Sandi',
    icon: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`
  }
]

const filteredKelasSiswa = computed(() => {
  if (isStudent.value) {
    return rawKelasSiswa.filter(i => !i.teacherOnly).map(i => {
      if (i.to === '/attendance') return { ...i, label: 'Absensi Saya' }
      return i
    })
  }
  return rawKelasSiswa
})

const filteredPenilaianTugas = computed(() => {
  if (isStudent.value) {
    return rawPenilaianTugas.filter(i => !i.teacherOnly)
  }
  return rawPenilaianTugas
})

const filteredLaporanMateri = computed(() => {
  if (isStudent.value) {
    return rawLaporanMateri.filter(i => !i.teacherOnly)
  }
  return rawLaporanMateri
})

const filteredPengaturan = computed(() => {
  if (isStudent.value) {
    return rawPengaturan.filter(i => !i.teacherOnly)
  }
  return rawPengaturan
})

const visibleAkademikCount = computed(() => {
  return filteredKelasSiswa.value.length + filteredPenilaianTugas.value.length + filteredLaporanMateri.value.length
})

function isRouteActive(to: string): boolean {
  if (to === '/dashboard') return route.path === '/dashboard'
  if (to === '/academic') return route.path === '/academic'
  if (to === '/presentations') {
    return route.path === '/presentations' || route.path.startsWith('/presentations/')
  }
  return route.path.startsWith(to)
}

const isAkademikOpen = ref(true)

function isCurrentRouteInAkademik(): boolean {
  if (route.path === '/academic') return true
  if (route.path === '/presentations' && route.query.tab === 'library') return true
  const list = [
    '/classes',
    '/students',
    '/schedule',
    '/attendance',
    '/question-bank',
    '/cbt',
    '/assignments',
    '/curriculum',
    '/reports',
    '/rankings'
  ]
  return list.some(p => route.path.startsWith(p))
}

function isRouteInAkademikSubnav(): boolean {
  for (const item of filteredLaporanMateri.value) {
    if (isRouteActive(item.to)) return true
  }
  for (const item of filteredPenilaianTugas.value) {
    if (isRouteActive(item.to)) return true
  }
  for (const item of filteredKelasSiswa.value) {
    if (isRouteActive(item.to)) return true
  }
  return false
}

const isAkademikHeaderActive = computed(() => {
  if (route.path === '/academic' || route.path.startsWith('/academic')) return true
  if (isCurrentRouteInAkademik() && !isAkademikOpen.value) return true
  if (isCurrentRouteInAkademik() && isAkademikOpen.value && !isRouteInAkademikSubnav()) return true
  return false
})

// Sliding Active Nav Indicator (Smooth physics transition)
const navContainerRef = ref<HTMLElement | null>(null)
const navItemDomMap = new Map<string, HTMLElement>()
const indicatorTop = ref(0)
const indicatorHeight = ref(44)
const indicatorVisible = ref(false)
const indicatorReady = ref(false)
const hasMounted = ref(false)

function setNavItemRef(key: string, el: any) {
  if (el) {
    const domEl = el.$el || el
    navItemDomMap.set(key, domEl)
  }
}

function getActiveElement(): HTMLElement | null {
  // If platform admin
  if (isPlatformAdmin.value) {
    for (const item of rawAdminMenu) {
      if (isRouteActive(item.to)) {
        const el = navItemDomMap.get(item.to)
        if (el && el.offsetParent !== null) return el
      }
    }
    return null
  }

  // If sidebar is collapsed (!sidebarOpen) and route is in Akademik:
  if (!sidebarOpen.value && isCurrentRouteInAkademik()) {
    const hubEl = navItemDomMap.get('/academic')
    if (hubEl && hubEl.offsetParent !== null) return hubEl
  }

  // Hub Page (/academic)
  if (route.path === '/academic' || route.path.startsWith('/academic')) {
    const el = sidebarOpen.value ? navItemDomMap.get('akademik-header') : navItemDomMap.get('/academic')
    if (el && el.offsetParent !== null) return el
  }

  // 1. If accordion is OPEN, check child sub-routes first:
  if (isAkademikOpen.value) {
    for (const item of filteredLaporanMateri.value) {
      if (isRouteActive(item.to)) {
        const el = navItemDomMap.get(item.to)
        if (el && el.offsetParent !== null) return el
      }
    }

    for (const item of filteredPenilaianTugas.value) {
      if (isRouteActive(item.to)) {
        const el = navItemDomMap.get(item.to)
        if (el && el.offsetParent !== null) return el
      }
    }

    for (const item of filteredKelasSiswa.value) {
      if (isRouteActive(item.to)) {
        const el = navItemDomMap.get(item.to)
        if (el && el.offsetParent !== null) return el
      }
    }
  }

  // If in Akademik but accordion closed (or active subroute not directly in sidebar), highlight Akademik header
  if (isCurrentRouteInAkademik()) {
    const headerEl = navItemDomMap.get('akademik-header')
    if (headerEl && headerEl.offsetParent !== null) return headerEl
  }

  // Pengaturan
  for (const item of filteredPengaturan.value) {
    if (isRouteActive(item.to)) {
      const el = navItemDomMap.get(item.to)
      if (el && el.offsetParent !== null) return el
    }
  }

  // Fitur Utama
  if (isRouteActive('/games')) {
    const el = navItemDomMap.get('/games')
    if (el && el.offsetParent !== null) return el
  }
  if (isRouteActive('/presentations')) {
    const el = navItemDomMap.get('/presentations')
    if (el && el.offsetParent !== null) return el
  }

  // Dashboard
  if (isRouteActive('/dashboard')) {
    const el = navItemDomMap.get('/dashboard')
    if (el && el.offsetParent !== null) return el
  }

  return null
}

function updateIndicatorPosition(immediate = false) {
  nextTick(() => {
    const el = getActiveElement()
    if (el && navContainerRef.value) {
      const containerRect = navContainerRef.value.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      const relativeTop = elRect.top - containerRect.top + navContainerRef.value.scrollTop

      indicatorTop.value = relativeTop
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
  nextTick(() => {
    const targetKey = (to === '/academic' || to.startsWith('/academic')) && sidebarOpen.value ? 'akademik-header' : to
    const el = navItemDomMap.get(targetKey)
    if (el && navContainerRef.value) {
      const containerRect = navContainerRef.value.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      const relativeTop = elRect.top - containerRect.top + navContainerRef.value.scrollTop

      indicatorTop.value = relativeTop
      indicatorHeight.value = el.offsetHeight
      indicatorVisible.value = true
      indicatorReady.value = true
    }
  })
}

function toggleAkademik() {
  isAkademikOpen.value = !isAkademikOpen.value
  nextTick(() => {
    updateIndicatorPosition()
    setTimeout(updateIndicatorPosition, 80)
    setTimeout(updateIndicatorPosition, 220)
  })
}

const indicatorStyle = computed(() => {
  return {
    transform: `translateY(${indicatorTop.value}px)`,
    height: `${indicatorHeight.value}px`,
    opacity: indicatorVisible.value ? 1 : 0,
    transition: hasMounted.value
      ? 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), height 0.22s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease'
      : 'none'
  }
})

watch(
  () => [route.path, route.query.tab],
  () => {
    if (isCurrentRouteInAkademik()) {
      isAkademikOpen.value = true
    }
    nextTick(() => {
      setTimeout(updateIndicatorPosition, 60)
    })
  },
  { immediate: true }
)

watch(sidebarOpen, () => {
  nextTick(() => {
    setTimeout(updateIndicatorPosition, 320)
  })
})

watch(isAkademikOpen, () => {
  nextTick(() => {
    setTimeout(updateIndicatorPosition, 200)
  })
})

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
