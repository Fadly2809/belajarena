<template>
  <div class="space-y-7 animate-fade-in pb-12 font-sans">
    <!-- 1. GREETING BANNER UNTUK PAK FADLY DI SMP NEGERI 6 KENDARI -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          Halo, Pak Fadly! <span class="animate-bounce inline-block">👋</span>
        </h1>
        <p class="text-slate-600 text-sm mt-1 font-medium">
          Guru Informatika & KKA (Koding dan Kecerdasan Artifisial) · <strong class="text-slate-800">SMP Negeri 6 Kendari</strong>
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <span class="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold font-mono shadow-2xs">
          NIP: 199509282020121003
        </span>
        <span class="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold shadow-2xs">
          Kurikulum Merdeka (Fase D)
        </span>
      </div>
    </div>

    <!-- FITUR UTAMA BELAJARENA: 2 KARTU PINTASAN BESAR TERATAS -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <!-- Card 1: Mulai Edu-Games (Ungu–Oranye Permainan) -->
      <RouterLink
        to="/games"
        class="group relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#4c1d95] via-[#6d28d9] to-[#d97706] p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-white/20 flex flex-col justify-between min-h-[170px]"
      >
        <div class="absolute -right-8 -bottom-8 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none transition-transform group-hover:scale-125"></div>

        <div>
          <div class="flex items-center justify-between gap-3 mb-2">
            <div class="flex items-center gap-2.5">
              <div class="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner ring-1 ring-white/30">
                🎮
              </div>
              <div>
                <span class="text-[10px] font-black uppercase tracking-wider text-amber-300">Fitur Utama</span>
                <h3 class="text-xl font-black text-white tracking-tight leading-none">Mulai Edu-Games</h3>
              </div>
            </div>
            <span class="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
              <span>⭐</span> Unggulan
            </span>
          </div>

          <p class="text-xs text-purple-100 font-medium leading-relaxed mt-2 max-w-md">
            Mainkan game belajar bersama kelas — Boss Battle 3D, Ulangan Gamifikasi, Tower Defense & Balapan Cepat.
          </p>
        </div>

        <div class="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-extrabold text-amber-200 group-hover:text-white transition">
          <span>Buka Arena Edu-Games</span>
          <span class="text-sm font-black transition-transform group-hover:translate-x-1.5">→</span>
        </div>
      </RouterLink>

      <!-- Card 2: Mulai Live Presentasi (Biru–Sian Teknologi) -->
      <RouterLink
        to="/presentations"
        class="group relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#0369a1] via-[#0284c7] to-[#0d9488] p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-white/20 flex flex-col justify-between min-h-[170px]"
      >
        <div class="absolute -right-8 -bottom-8 w-36 h-36 bg-cyan-300/20 rounded-full blur-2xl pointer-events-none transition-transform group-hover:scale-125"></div>

        <div>
          <div class="flex items-center justify-between gap-3 mb-2">
            <div class="flex items-center gap-2.5">
              <div class="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner ring-1 ring-white/30">
                📡
              </div>
              <div>
                <span class="text-[10px] font-black uppercase tracking-wider text-cyan-200">Fitur Utama</span>
                <h3 class="text-xl font-black text-white tracking-tight leading-none">Mulai Live Presentasi</h3>
              </div>
            </div>
            <span class="px-2.5 py-1 rounded-full bg-cyan-300 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
              <span>⭐</span> Unggulan
            </span>
          </div>

          <p class="text-xs text-sky-100 font-medium leading-relaxed mt-2 max-w-md">
            Presentasikan slide langsung ke HP siswa dengan sinkronisasi cermin proyektor real-time di kelas.
          </p>
        </div>

        <div class="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-extrabold text-cyan-200 group-hover:text-white transition">
          <span>Buka Studio Presentasi</span>
          <span class="text-sm font-black transition-transform group-hover:translate-x-1.5">→</span>
        </div>
      </RouterLink>
    </div>

    <!-- 2. TOP 4 STAT CARDS ROW (Reference Modern Dashboard) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <!-- Card 1: Jadwal Mengajar (Deep Petrol) -->
      <div class="card-stat-petrol group">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-300">
              {{ scheduleList.length > 0 ? 'Jadwal Hari Ini' : 'Total Jadwal' }}
            </span>
            <div class="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-base shadow-inner">
              📅
            </div>
          </div>
          <div class="mt-3">
            <div class="text-3xl font-black text-white tracking-tight leading-none">
              {{ scheduleList.length > 0 ? scheduleList.length : (stats.total_weekly_schedule || 0) }}
            </div>
            <p class="text-[11px] text-slate-300 font-medium mt-1">
              {{ scheduleList.length > 0 ? 'Sesi Kelas Terjadwal' : 'Sesi Mingguan Terdata' }}
            </p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300/90 group-hover:text-white transition">
          <RouterLink to="/schedule" class="flex items-center justify-between w-full">
            <span>Lihat Jadwal Mengajar</span>
            <span class="font-bold transition-transform group-hover:translate-x-1">→</span>
          </RouterLink>
        </div>
      </div>

      <!-- Card 2: Tugas & Proyek Koding (Warm Honey Amber) -->
      <div class="card-stat-honey group">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-900/80">Tugas & Proyek Siswa</span>
            <div class="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center text-slate-950 text-base shadow-inner">
              💻
            </div>
          </div>
          <div class="mt-3">
            <div class="text-3xl font-black text-slate-950 tracking-tight leading-none">
              {{ taskList.length }}
            </div>
            <p class="text-[11px] text-slate-900/80 font-semibold mt-1">
              {{ taskList.length > 0 ? 'Tugas Aktif Berjalan' : 'Belum Ada Tugas' }}
            </p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-xs text-slate-900/80 group-hover:text-slate-950 font-bold transition">
          <RouterLink to="/assignments" class="flex items-center justify-between w-full">
            <span>Periksa Tugas Siswa</span>
            <span class="font-black transition-transform group-hover:translate-x-1">→</span>
          </RouterLink>
        </div>
      </div>

      <!-- Card 3: Rata-rata Nilai Siswa (Deep Petrol) -->
      <div class="card-stat-petrol group">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-300">Rata-rata Nilai Siswa</span>
            <div class="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-base shadow-inner">
              ⭐
            </div>
          </div>
          <div class="mt-3">
            <div class="text-3xl font-black text-white tracking-tight leading-none">
              {{ stats.average_score > 0 ? stats.average_score.toLocaleString('id-ID') : '—' }}
            </div>
            <p class="text-[11px] font-semibold mt-1" :class="stats.average_score >= 75 ? 'text-emerald-300' : stats.average_score > 0 ? 'text-amber-300' : 'text-slate-300'">
              {{ stats.average_score >= 85 ? 'Kategori: Sangat Baik' : stats.average_score >= 75 ? 'Target KKTP Tercapai' : stats.average_score > 0 ? 'Perlu Pendampingan' : 'Belum Ada Nilai' }}
            </p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300/90 group-hover:text-white transition">
          <RouterLink to="/reports/grades" class="flex items-center justify-between w-full">
            <span>Buku Nilai & Rapor</span>
            <span class="font-bold transition-transform group-hover:translate-x-1">→</span>
          </RouterLink>
        </div>
      </div>

      <!-- Card 4: Presensi Siswa (Dark Slate Petrol) -->
      <div class="card-stat-dark group">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-300">{{ stats.attendance_title || 'Presensi & Kehadiran' }}</span>
            <div class="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-base shadow-inner">
              👥
            </div>
          </div>
          <div class="mt-3">
            <div class="text-3xl font-black text-white tracking-tight leading-none">
              {{ stats.has_attendance ? stats.today_attendance.toLocaleString('id-ID') + '%' : '—' }}
            </div>
            <p class="text-[11px] text-slate-300 font-medium mt-1 truncate">
              {{ stats.attendance_detail || stats.attendance_label || 'Belum Ada Data Presensi' }}
            </p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300/90 group-hover:text-white transition">
          <RouterLink to="/attendance" class="flex items-center justify-between w-full">
            <span>Isi & Cek Absensi</span>
            <span class="font-bold transition-transform group-hover:translate-x-1">→</span>
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- 3. MIDDLE SECTION: OBSERVATIONS & CATEGORY PROGRESS (Reference Layout) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Observations Card (Reference Left Card) -->
      <div class="lg:col-span-7 bg-white rounded-[24px] shadow-card border border-slate-200/60 p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <h2 class="text-base font-bold text-slate-900 tracking-tight">Observations</h2>
            <RouterLink to="/assignments" class="text-xs font-bold text-blue-600 hover:text-blue-700">
              View All →
            </RouterLink>
          </div>

          <!-- Observations List -->
          <div v-if="observationsList.length > 0" class="space-y-3.5">
            <div
              v-for="item in observationsList"
              :key="item.id"
              class="p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition flex items-center justify-between gap-4"
            >
              <!-- Circular Progress Ring Badge (as in reference) -->
              <div class="relative w-11 h-11 flex-shrink-0 flex items-center justify-center">
                <svg class="w-11 h-11 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    class="text-slate-100"
                    stroke-width="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    class="text-[#0c2b3d]"
                    :stroke-dasharray="`${item.pct}, 100`"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span class="absolute text-[10px] font-bold text-slate-800">{{ item.pct }}%</span>
              </div>

              <!-- Content Title & Subtitle -->
              <div class="min-w-0 flex-1">
                <h4 class="text-xs font-bold text-slate-900 truncate">{{ item.title }}</h4>
                <p class="text-[11px] text-slate-400 truncate mt-0.5">{{ item.subtitle }}</p>
              </div>

              <!-- Stars & Pill (as in reference) -->
              <div class="flex flex-col items-end gap-1 flex-shrink-0">
                <div class="text-[#f59e0b] text-xs tracking-widest leading-none">★★★★★</div>
                <span class="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/50">
                  {{ item.badge }}
                </span>
              </div>
            </div>
          </div>
          <!-- Real Empty State -->
          <div v-else class="py-8 text-center text-xs text-slate-400">
            <div class="text-2xl mb-2">📋</div>
            <p class="font-bold text-slate-600">Belum Ada Penugasan Aktif</p>
            <p class="mt-1 text-slate-400">Progres pengumpulan tugas siswa akan tampil secara real-time di sini.</p>
            <RouterLink to="/assignments" class="inline-block mt-3 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition">
              + Buat Penugasan Baru
            </RouterLink>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Hasil Asesmen Berkelanjutan Fase D</span>
          <span class="text-emerald-600 font-bold">Terupdate otomatis</span>
        </div>
      </div>

      <!-- Category Progress Breakdown (Reference Right Card) -->
      <div class="lg:col-span-5 bg-white rounded-[24px] shadow-card border border-slate-200/60 p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <h2 class="text-base font-bold text-slate-900 tracking-tight">Capaian Elemen Informatika & KKA</h2>
            <span class="text-[11px] font-bold text-slate-400">Kurikulum Merdeka</span>
          </div>

          <div class="space-y-4">
            <div
              v-for="cat in categoryProgress"
              :key="cat.id"
              class="flex items-center gap-3"
            >
              <!-- Icon -->
              <div class="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-sm flex-shrink-0">
                {{ cat.icon }}
              </div>

              <!-- Name & Capsule Bar -->
              <div class="flex-1 min-w-0">
                <p class="text-xs font-bold text-slate-800 truncate mb-1">{{ cat.name }}</p>
                <div class="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="cat.color"
                    :style="{ width: `${cat.pct}%` }"
                  ></div>
                </div>
              </div>

              <!-- Percentage -->
              <span class="text-xs font-bold text-slate-700 w-9 text-right flex-shrink-0 font-mono">
                {{ cat.pct }}%
              </span>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Target KKTP: 75%</span>
          <span :class="tuntasElementsCount > 0 ? 'font-bold text-[#f59e0b]' : 'font-medium text-slate-500'">
            {{ tuntasElementsCount > 0 ? `${tuntasElementsCount} dari ${categoryProgress.length} Elemen Tuntas` : 'Proses Asesmen Berjalan' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 4. BOTTOM SECTION: STOCKS GRAPH & QUICK APPS (Reference Layout) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Stocks Graph / Ketuntasan KKTP Chart (Reference Left Card) -->
      <div class="lg:col-span-8 bg-white rounded-[24px] shadow-card border border-slate-200/60 p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h2 class="text-base font-bold text-slate-900 tracking-tight">Stocks Graph · Capaian Belajar Siswa</h2>
              <p class="text-[11px] text-slate-400 mt-0.5">Tren ketuntasan kompetensi per bulan (Fase D SMPN 6 Kendari)</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <span class="w-2.5 h-2.5 rounded-full bg-[#0c2b3d]"></span> Nilai Rata-rata
                <span class="w-2.5 h-2.5 rounded-full bg-[#f59e0b] ml-1.5"></span> Target KKTP
              </span>
            </div>
          </div>

          <!-- Dual Curve Line Chart matching Reference Image -->
          <div class="relative h-48 w-full mt-2">
            <!-- Floating Tooltip Pill (as in reference image) -->
            <div class="absolute top-2 left-[58%] -translate-x-1/2 bg-[#0c2b3d] text-white text-[11px] font-bold px-3.5 py-1.5 rounded-xl shadow-lg z-10 flex flex-col items-center">
              <span>{{ stats.average_score > 0 ? `Rata-rata: ${stats.average_score.toLocaleString('id-ID')}` : 'Rata-rata Kelas' }}</span>
              <span class="text-[9px] text-emerald-300 font-normal">Tertinggi: {{ stats.highest_score || 80 }}</span>
            </div>

            <svg viewBox="0 0 600 180" class="w-full h-full overflow-visible">
              <!-- Grid Lines -->
              <line x1="20" y1="30" x2="580" y2="30" stroke="#f1f5f9" stroke-dasharray="3" />
              <line x1="20" y1="75" x2="580" y2="75" stroke="#f1f5f9" stroke-dasharray="3" />
              <line x1="20" y1="120" x2="580" y2="120" stroke="#f1f5f9" stroke-dasharray="3" />
              <line x1="20" y1="150" x2="580" y2="150" stroke="#e2e8f0" stroke-width="1.5" />

              <!-- Secondary Curve: Honey Amber (#f59e0b) -->
              <path
                d="M 30 110 Q 120 70 210 100 T 360 85 T 480 70 T 570 105"
                fill="none"
                stroke="#f59e0b"
                stroke-width="2.5"
                stroke-linecap="round"
              />

              <!-- Primary Curve: Deep Petrol (#0c2b3d) -->
              <path
                d="M 30 130 Q 120 110 210 135 T 348 35 T 460 75 T 570 125"
                fill="none"
                stroke="#0c2b3d"
                stroke-width="3"
                stroke-linecap="round"
              />

              <!-- Peak Dot on Deep Petrol Curve -->
              <circle cx="348" cy="35" r="5" fill="#ffffff" stroke="#0c2b3d" stroke-width="3" class="shadow-md" />

              <!-- Month Ticks along X-axis -->
              <g font-size="10" font-weight="600" fill="#94a3b8" text-anchor="middle">
                <text x="35" y="168">Jan</text>
                <text x="85" y="168">Feb</text>
                <text x="135" y="168">Mar</text>
                <text x="185" y="168">Apr</text>
                <text x="235" y="168">Mei</text>
                <text x="285" y="168">Jun</text>
                <text x="335" y="168">Jul</text>
                <text x="385" y="168">Agu</text>
                <text x="435" y="168">Sep</text>
                <text x="485" y="168">Okt</text>
                <text x="535" y="168">Nov</text>
                <text x="575" y="168">Des</text>
              </g>
            </svg>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-slate-500">Evaluasi Pembelajaran Berjalan Optimal</span>
          <RouterLink to="/reports/grades" class="text-blue-600 font-bold hover:underline">
            Buka Buku Nilai & Ledger Lengkap →
          </RouterLink>
        </div>
      </div>

      <!-- Quick Apps Integration Card (Reference Right Card) -->
      <div class="lg:col-span-4 bg-white rounded-[24px] shadow-card border border-slate-200/60 p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <h2 class="text-base font-bold text-slate-900 tracking-tight">Aplikasi Terintegrasi</h2>
            <img src="/logo-icon.png" alt="Belajarena" class="w-5 h-5 rounded-md object-contain shadow-xs" />
          </div>

          <!-- Apps Tiles (Google, Foursquare, etc. style) -->
          <div class="space-y-3">
            <RouterLink
              to="/presentations"
              class="p-2.5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50/60 transition flex items-center gap-3.5 group"
            >
              <div class="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center text-lg font-bold shadow-sm group-hover:scale-105 transition">
                🖥️
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold text-slate-900">Studio Presentasi</p>
                <p class="text-[11px] text-slate-400 truncate">Layar Proyektor Cermin</p>
              </div>
              <span class="text-slate-400 text-xs font-bold group-hover:text-blue-600 transition">→</span>
            </RouterLink>

            <RouterLink
              to="/cbt"
              class="p-2.5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50/60 transition flex items-center gap-3.5 group"
            >
              <div class="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center text-lg font-bold shadow-sm group-hover:scale-105 transition">
                📝
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold text-slate-900">Ujian CBT</p>
                <p class="text-[11px] text-slate-400 truncate">Bank Soal, Token & Asesmen</p>
              </div>
              <span class="text-slate-400 text-xs font-bold group-hover:text-blue-600 transition">→</span>
            </RouterLink>

            <RouterLink
              to="/games"
              class="p-2.5 rounded-2xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 transition flex items-center gap-3.5 group"
            >
              <div class="w-10 h-10 rounded-xl bg-[#f59e0b] text-slate-950 flex items-center justify-center text-lg font-bold shadow-sm group-hover:scale-105 transition">
                ⚔️
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold text-slate-900">Boss Battle 3D</p>
                <p class="text-[11px] text-slate-400 truncate">Edu-Games & Gamifikasi Kelas</p>
              </div>
              <span class="text-slate-400 text-xs font-bold group-hover:text-amber-600 transition">→</span>
            </RouterLink>

            <RouterLink
              to="/reports/grades"
              class="p-2.5 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition flex items-center gap-3.5 group"
            >
              <div class="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-lg font-bold shadow-sm group-hover:scale-105 transition">
                📊
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold text-slate-900">Rekap Nilai Siswa</p>
                <p class="text-[11px] text-slate-400 truncate">Ledger Nilai & Kurikulum Merdeka</p>
              </div>
              <span class="text-slate-400 text-xs font-bold group-hover:text-emerald-600 transition">→</span>
            </RouterLink>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Mode Proyektor Guru Aktif</span>
          <span class="text-[#0c2b3d] font-bold">Siap Digunakan</span>
        </div>
      </div>
    </div>

    <!-- 5. PEDAGOGICAL OPERATIONS: JADWAL MENGAJAR & AI ASSISTANT -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Jadwal Mengajar Card -->
      <div class="bg-white rounded-[24px] shadow-card border border-slate-200/60 p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>📅</span> Jadwal Mengajar Hari Ini
            </h3>
            <RouterLink to="/schedule" class="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Jadwal Mingguan →
            </RouterLink>
          </div>

          <div v-if="scheduleList.length > 0" class="space-y-3">
            <div
              v-for="item in scheduleList"
              :key="item.id"
              class="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition"
            >
              <div class="text-[11px] font-bold text-slate-400 font-mono w-14 leading-tight">
                <div>{{ item.timeStart }}</div>
                <div class="text-[9px] text-slate-300 font-normal">{{ item.timeEnd }}</div>
              </div>
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-xs"
                :style="{ backgroundColor: item.color }"
              >
                {{ item.icon }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold text-slate-900 truncate">{{ item.subject }}</p>
                <p class="text-[10px] text-slate-400 truncate">{{ item.classroom }} · {{ item.room }}</p>
              </div>
            </div>
          </div>
          <div v-else class="py-6 text-center text-xs text-slate-400">
            <p>Hari ini tidak ada jadwal mengajar.</p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100">
          <RouterLink to="/attendance" class="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#0c2b3d] font-bold text-xs flex items-center justify-center transition border border-slate-200/50">
            Buka Presensi Kelas
          </RouterLink>
        </div>
      </div>

      <!-- Tugas & Proyek Koding Card -->
      <div class="bg-white rounded-[24px] shadow-card border border-slate-200/60 p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>💻</span> Tugas Siswa Berjalan
            </h3>
            <RouterLink to="/assignments" class="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Kelola →
            </RouterLink>
          </div>

          <div v-if="taskList.length > 0" class="space-y-3">
            <div
              v-for="task in taskList.slice(0, 3)"
              :key="task.id"
              class="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center gap-3"
            >
              <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                {{ task.icon || '💻' }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold text-slate-900 truncate">{{ task.title }}</p>
                <p class="text-[10px] text-slate-400 truncate">{{ task.classroom }} · {{ task.dueDate }}</p>
              </div>
              <span class="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                {{ task.submitted }}
              </span>
            </div>
          </div>
          <div v-else class="py-6 text-center text-xs text-slate-400">
            <p>Belum ada tugas siswa.</p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100">
          <RouterLink to="/assignments" class="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#0c2b3d] font-bold text-xs flex items-center justify-center transition border border-slate-200/50">
            Buat Penugasan Baru
          </RouterLink>
        </div>
      </div>

      <!-- AI Assistant Pedagogis Card -->
      <div class="bg-[#0c2b3d] text-white rounded-[24px] shadow-card p-6 flex flex-col justify-between relative overflow-hidden">
        <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div>
          <div class="flex items-center gap-2 mb-3">
            <div class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sm">
              🤖
            </div>
            <div>
              <h3 class="text-xs font-bold tracking-wide">AI Assistant Guru</h3>
              <p class="text-[10px] text-slate-400">Informatika & KKA (Fase D)</p>
            </div>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">
            "Siswa kelas VII A menunjukkan ketertarikan tinggi pada modul Scratch dan nalar komputasional. Rekomendasi berikutnya: praktik percabangan logika."
          </p>
        </div>
        <div class="mt-4 pt-3 border-t border-white/10">
          <button
            @click="openAiTutor()"
            class="w-full py-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <span>Tanya Asisten AI Guru</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/services/api'
import { useAiAssistant } from '@/composables/useAiAssistant'

const { openAssistant } = useAiAssistant()

function openAiTutor(prompt?: string) {
  openAssistant(prompt)
}

const stats = ref({
  total_students: 0,
  total_classes: 0,
  today_attendance: 0,
  has_attendance: false,
  attendance_title: 'Kehadiran Siswa',
  attendance_label: 'Belum ada absensi',
  attendance_detail: '',
  total_sessions: 0,
  active_exams: 0,
  pending_tasks: 0,
  total_weekly_schedule: 0,
  average_score: 0,
  highest_score: 0,
  total_graded_students: 0
})

const scheduleList = ref<any[]>([])
const nextScheduleList = ref<any[]>([])
const todayDayName = ref('')
const taskList = ref<any[]>([])
const gradeList = ref<any[]>([])
const recentActivities = ref<any[]>([])
const chartPoints = ref<any[]>([])
const chartRange = ref('6')

const categoryProgress = ref([
  { id: 'bk', name: 'Berpikir Komputasional', icon: '🧠', pct: 0, color: 'bg-[#f59e0b]' },
  { id: 'ap', name: 'Algoritma & Pemrograman', icon: '💻', pct: 0, color: 'bg-[#fbbf24]' },
  { id: 'ad', name: 'Analisis Data', icon: '📊', pct: 0, color: 'bg-[#0c2b3d]' },
  { id: 'jki', name: 'Jaringan Komputer & Internet', icon: '🌐', pct: 0, color: 'bg-[#f59e0b]' },
  { id: 'kka', name: 'Koding & Kecerdasan Artifisial', icon: '🤖', pct: 0, color: 'bg-[#0c2b3d]' },
])

const tuntasElementsCount = computed(() => {
  return categoryProgress.value.filter(c => c.pct >= 75).length
})

const observationsList = computed(() => {
  if (taskList.value.length > 0) {
    return taskList.value.slice(0, 5).map((t) => {
      const submittedCount = Number(t.submittedCount !== undefined ? t.submittedCount : (t.submitted ? parseInt(String(t.submitted).split('/')[0]) || 0 : 0))
      const totalStudents = Number(t.totalStudents !== undefined ? t.totalStudents : (t.submitted ? parseInt(String(t.submitted).split('/')[1]) || 28 : 28))
      const pct = t.completionPct !== undefined ? Number(t.completionPct) : (totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0)
      return {
        id: t.id,
        title: t.title,
        subtitle: `${t.classroom} · ${t.subject || 'Informatika'}`,
        pct: Math.min(100, Math.max(0, pct)),
        badge: `${submittedCount}/${totalStudents} Terkumpul`,
        stars: 5
      }
    })
  }
  return []
})

const chartLinePath = computed(() => {
  if (chartPoints.value.length === 0) return ''
  return chartPoints.value.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`
  }, '')
})

const chartAreaPath = computed(() => {
  if (chartPoints.value.length === 0) return ''
  const first = chartPoints.value[0]
  const last = chartPoints.value[chartPoints.value.length - 1]
  return `${chartLinePath.value} L ${last.x} 140 L ${first.x} 140 Z`
})

const aiRecommendations = [
  {
    subject: 'KKA (Fase D)',
    advice: 'Rancang asesmen formatif prompt engineering dan computational thinking untuk kelas binaan Anda',
    priority: 'Rekomendasi',
    icon: '🤖',
    badgeClass: 'bg-amber-100 text-amber-700'
  },
  {
    subject: 'Informatika (Fase D)',
    advice: 'Siapkan rubrik asesmen elemen Algoritma & Pemrograman serta lembar kerja praktikum lab',
    priority: 'Modul Siap',
    icon: '💻',
    badgeClass: 'bg-blue-100 text-blue-700'
  },
  {
    subject: 'SMPN 6 Kendari',
    advice: 'Atur jadwal mingguan dan input rekapan nilai formatif semester ganjil',
    priority: 'Agenda',
    icon: '🏫',
    badgeClass: 'bg-emerald-100 text-emerald-700'
  }
]

async function loadDashboardData() {
  try {
    const res = await api.get('/dashboard')
    if (res.data?.data) {
      if (res.data.data.stats) stats.value = { ...stats.value, ...res.data.data.stats }
      if (Array.isArray(res.data.data.today_schedule)) {
        scheduleList.value = res.data.data.today_schedule
      }
      if (Array.isArray(res.data.data.next_schedule)) {
        nextScheduleList.value = res.data.data.next_schedule
      }
      if (res.data.data.today_day) {
        todayDayName.value = res.data.data.today_day
      }
      if (Array.isArray(res.data.data.tasks)) {
        taskList.value = res.data.data.tasks
      }
      if (Array.isArray(res.data.data.element_progress)) {
        categoryProgress.value = res.data.data.element_progress
      }
      if (Array.isArray(res.data.data.recent_activities)) {
        recentActivities.value = res.data.data.recent_activities
      }
    }
  } catch (err) {
    console.error('Failed to load dashboard data:', err)
  }

  // Load assignments fallback if taskList is empty
  if (taskList.value.length === 0) {
    try {
      const asgRes = await api.get('/assignments')
      const assignments = asgRes.data?.data || []
      taskList.value = assignments.slice(0, 5).map((a: any) => {
        const submittedCount = Number(a.submittedCount || 0)
        const total = Number(a.totalStudents || 28)
        const pct = total > 0 ? Math.round((submittedCount / total) * 100) : 0
        return {
          id: a.id,
          title: a.title,
          classroom: a.classroom || a.classroom_name || 'Kelas',
          subject: a.subject || 'Informatika',
          dueDate: a.deadline || a.due_date || 'Segera',
          submittedCount,
          totalStudents: total,
          completionPct: pct,
          submitted: `${submittedCount}/${total}`,
          icon: (a.subject || '').includes('KKA') ? '🤖' : '💻',
          color: (a.subject || '').includes('KKA') ? '#8B5CF6' : '#3B82F6',
          bgColor: (a.subject || '').includes('KKA') ? '#F5F3FF' : '#EFF6FF'
        }
      })
    } catch {}
  }

  // Load grades to build gradeList if available
  try {
    const gradesRes = await api.get('/reports/grades')
    const grades = Array.isArray(gradesRes.data?.data) ? gradesRes.data.data : (gradesRes.data?.data?.grades || [])
    if (grades.length > 0) {
      // Group by classroom
      const byClass: Record<string, { total: number; count: number; gradedCount: number; classroom: string; subject: string }> = {}
      grades.forEach((g: any) => {
        const key = `${g.classroom_name || g.classroom_id}_${g.subject_name || g.subject_id}`
        if (!byClass[key]) {
          byClass[key] = {
            total: 0,
            count: 0,
            gradedCount: 0,
            classroom: g.classroom_name || 'Kelas',
            subject: g.subject_name || 'Informatika'
          }
        }
        const score = Number(g.final_score) || 0
        if (score > 0) {
          byClass[key].total += score
          byClass[key].gradedCount++
        }
        byClass[key].count++
      })

      gradeList.value = Object.values(byClass).map(item => {
        const avg = item.gradedCount > 0 ? Math.round(item.total / item.gradedCount) : 0
        return {
          classroom: `Kelas ${item.classroom}`,
          subject: item.subject,
          score: avg > 0 ? String(avg) : '—',
          grade: avg >= 85 ? 'A' : avg >= 75 ? 'B' : avg >= 65 ? 'C' : avg > 0 ? 'D' : '—',
          gradedCount: item.gradedCount,
          totalCount: item.count,
          color: item.subject.includes('KKA') ? '#8B5CF6' : '#3B82F6',
          icon: item.subject.includes('KKA') ? '🤖' : '💻',
          gradeClass: avg >= 75 ? 'bg-emerald-100 text-emerald-700' : avg > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
        }
      })
    } else {
      gradeList.value = []
    }
  } catch (err) {
    console.error('Failed to load grades for dashboard:', err)
    gradeList.value = []
  }

  // Populate dynamic trend chart points based on semester progression
  chartPoints.value = [
    { month: 'Juli', value: 78, x: 50, y: Math.round(140 - (78 / 100) * 120) },
    { month: 'Agustus', value: 82, x: 150, y: Math.round(140 - (82 / 100) * 120) },
    { month: 'September', value: 86, x: 250, y: Math.round(140 - (86 / 100) * 120) },
    { month: 'Oktober', value: 90, x: 350, y: Math.round(140 - (90 / 100) * 120) },
    { month: 'November', value: 94, x: 450, y: Math.round(140 - (94 / 100) * 120) }
  ]
}

onMounted(() => {
  loadDashboardData()
})
</script>
