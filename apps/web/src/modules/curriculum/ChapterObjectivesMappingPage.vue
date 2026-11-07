<template>
  <div class="space-y-6">
    <!-- Top Action Controls / Navigation Header -->
    <div class="bg-white rounded-[24px] shadow-card border border-slate-200/60 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
      <div class="flex items-center gap-3">
        <RouterLink to="/reports/grades" class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition shadow-2xs">
          ← Ke Rekap Nilai
        </RouterLink>
        <div>
          <h2 class="font-extrabold text-slate-900 text-sm sm:text-base leading-tight flex items-center gap-2">
            <span>🎯</span> Penginputan BAB, TP & Pemantauan Nilai Siswa
          </h2>
          <span class="text-[11px] text-slate-500 font-medium">
            Kurikulum Merdeka (Fase D SMP) &bull; Pemetaan Tugas & Ulangan Otomatis &bull; Presensi 40% + Tugas 60% Formatif
          </span>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <!-- Filter Kelas -->
        <select
          v-model="selectedClassId"
          @change="onClassChange"
          class="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option v-if="classrooms.length === 0" value="" disabled>Belum ada kelas</option>
          <option v-for="c in classrooms" :key="c.id" :value="c.id">
            {{ formatClassLabel(c) }}
          </option>
        </select>

        <!-- Filter Mata Pelajaran (Otomatis sinkron dengan jadwal kelas) -->
        <select
          v-model="selectedSubjectId"
          @change="onSubjectChange"
          class="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option v-if="availableSubjects.length === 0" value="" disabled>Belum ada mapel</option>
          <option v-for="s in availableSubjects" :key="s.id" :value="s.id">
            {{ s.name }}
          </option>
        </select>

        <!-- KKTP Dinamis -->
        <div class="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
          <label class="text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <span>🎯</span> KKTP:
          </label>
          <input
            v-model.number="currentKktp"
            @change="fetchMappingPreview"
            type="number"
            min="40"
            max="100"
            step="1"
            class="w-12 px-1 py-0.5 rounded-lg bg-white border border-slate-300 font-black text-xs text-blue-700 text-center shadow-2xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            title="Ubah batas KKTP"
          />
        </div>

        <!-- Tombol Sinkronisasi Utama -->
        <button
          @click="showSyncConfirmModal = true"
          :disabled="isSyncing || isLoading"
          class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
          title="Terapkan hasil perhitungan pemetaan ini ke Buku Nilai / Rekap Nilai Resmi"
        >
          <span v-if="isSyncing" class="animate-spin">⏳</span>
          <span v-else>🚀</span>
          <span>{{ isSyncing ? 'Menyinkronkan...' : 'Sinkronkan ke Rekap Nilai' }}</span>
        </button>
      </div>
    </div>

    <!-- Notification Toast / Banner jika baru disinkronkan -->
    <div
      v-if="syncSuccessMessage"
      class="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between gap-3 shadow-xs animate-fadeIn"
    >
      <div class="flex items-center gap-2">
        <span class="text-base">✅</span>
        <div>
          <strong class="font-bold">Sinkronisasi Berhasil:</strong> {{ syncSuccessMessage }}
        </div>
      </div>
      <div class="flex items-center gap-2">
        <RouterLink to="/reports/grades" class="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition">
          Buka Rekap Nilai Resmi →
        </RouterLink>
        <button @click="syncSuccessMessage = ''" class="text-emerald-700 hover:text-emerald-900 font-bold px-1.5 py-0.5">
          ✕
        </button>
      </div>
    </div>

    <!-- Tab Selector (2 Tab: Matriks Pemantauan & Penginputan BAB/TP) -->
    <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
      <button
        @click="activeTab = 'monitor'"
        class="px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition"
        :class="activeTab === 'monitor' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
      >
        <span>📊</span> Matriks Pemantauan Nilai Siswa (Pre-Flight)
        <span class="px-2 py-0.5 rounded-full text-[10px]" :class="activeTab === 'monitor' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'">
          {{ matrix.length }} Siswa
        </span>
      </button>

      <button
        @click="activeTab = 'chapters'"
        class="px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition"
        :class="activeTab === 'chapters' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
      >
        <span>📚</span> Penginputan BAB & TP
        <span class="px-2 py-0.5 rounded-full text-[10px]" :class="activeTab === 'chapters' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'">
          {{ chapters.length }} Bab
        </span>
      </button>
    </div>

    <!-- ============================================================== -->
    <!-- TAB 1: MATRIKS PEMANTAUAN NILAI PRE-FLIGHT (MONITORING)        -->
    <!-- ============================================================== -->
    <div v-if="activeTab === 'monitor'" class="space-y-6">
      <!-- Info Alert: Rumus Perhitungan & Presensi -->
      <div class="card p-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/80 border border-blue-200/80 space-y-2.5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2 text-blue-900 font-bold text-xs sm:text-sm">
            <span class="text-lg">💡</span>
            <span>Aturan Perhitungan Nilai Formatif Otomatis (Kurikulum Merdeka Fase D):</span>
          </div>
          <span class="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 text-[11px] font-black">
            Total Pertemuan Tercatat: {{ attendanceInfo.total_sessions || 0 }} Pertemuan
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700 leading-relaxed">
          <div class="p-3 rounded-xl bg-white/80 border border-blue-100 space-y-1">
            <strong class="text-blue-900 flex items-center gap-1.5 font-bold">
              <span>📅</span> 1. Kontribusi Presensi (40% ke Nilai Formatif)
            </strong>
            <p class="text-[11px]">
              Jika jumlah pertemuan baru 1 dan siswa <strong>Hadir</strong> &rarr; Nilai Kehadiran = 100% &rarr; Otomatis berkontribusi
              <span class="font-black text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">+40.0 poin</span> pada Formatif.
              Jika ada 2 pertemuan dan hadir 1 &rarr; Kehadiran = 50% &rarr; Berkontribusi
              <span class="font-black text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">+20.0 poin</span>.
            </p>
          </div>

          <div class="p-3 rounded-xl bg-white/80 border border-blue-100 space-y-1">
            <strong class="text-indigo-900 flex items-center gap-1.5 font-bold">
              <span>📝</span> 2. Akumulasi Tugas Terpetakan Otomatis (60% ke Nilai Formatif)
            </strong>
            <p class="text-[11px]">
              Tugas yang dibuat langsung dipetakan ke TP saat pembuatan tugas. Rata-rata nilai tugas dikalikan <strong>60%</strong>.
              <span class="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 block mt-1">
                Formatif = Presensi (40%) + Tugas (60%)
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- Summary KPI Metric Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div class="card p-3 border-l-4 border-l-blue-600 bg-white space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-500">Total Siswa</span>
          <div class="text-xl font-black text-slate-900">{{ stats.total_students || 0 }}</div>
          <span class="text-[10px] text-slate-400">Kelas {{ selectedClassLabel }}</span>
        </div>

        <div class="card p-3 border-l-4 border-l-emerald-600 bg-white space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-500">Rata-rata Presensi</span>
          <div class="text-xl font-black text-emerald-700">{{ stats.avg_attendance_pct || 0 }}%</div>
          <span class="text-[10px] text-emerald-600 font-semibold">&asymp; +{{ Math.round((stats.avg_attendance_pct || 0) * 0.4) }} pt Formatif</span>
        </div>

        <div class="card p-3 border-l-4 border-l-indigo-600 bg-white space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-500">Rata-rata Formatif</span>
          <div class="text-xl font-black text-indigo-700">{{ stats.avg_formatif || 0 }}</div>
          <span class="text-[10px] text-slate-400">Presensi + Tugas</span>
        </div>

        <div class="card p-3 border-l-4 border-l-purple-600 bg-white space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-500">Rata-rata Sumatif TP</span>
          <div class="text-xl font-black text-purple-700">{{ stats.avg_sumatif_tp || 0 }}</div>
          <span class="text-[10px] text-slate-400">Ulangan Otomatis</span>
        </div>

        <div class="card p-3 border-l-4 border-l-teal-600 bg-white space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-500">Rata-rata NA Rapor</span>
          <div class="text-xl font-black text-teal-800">{{ stats.avg_final_score || 0 }}</div>
          <span class="text-[10px] text-slate-400">Simulasi Lengkap</span>
        </div>

        <div class="card p-3 border-l-4 border-l-rose-500 bg-white space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-500">Ketuntasan (KKTP {{ currentKktp }})</span>
          <div class="text-xl font-black text-slate-900">
            <span class="text-emerald-600">{{ stats.tuntas_count || 0 }}</span>
            <span class="text-slate-400 text-sm">/</span>
            <span class="text-rose-600 text-sm">{{ stats.belum_tuntas_count || 0 }}</span>
          </div>
          <span class="text-[10px] text-slate-400">Tuntas vs Bimbingan</span>
        </div>
      </div>

      <!-- Controls & Filter Siswa -->
      <div class="card p-4 flex flex-wrap items-center justify-between gap-3 bg-white">
        <div class="flex items-center gap-3">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="🔍 Cari nama atau NIS siswa..."
            class="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />

          <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              @click="filterStatus = 'all'"
              class="px-2.5 py-1 rounded-lg transition"
              :class="filterStatus === 'all' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500'"
            >
              Semua ({{ matrix.length }})
            </button>
            <button
              @click="filterStatus = 'tuntas'"
              class="px-2.5 py-1 rounded-lg transition"
              :class="filterStatus === 'tuntas' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500'"
            >
              Tuntas ({{ stats.tuntas_count || 0 }})
            </button>
            <button
              @click="filterStatus = 'belum'"
              class="px-2.5 py-1 rounded-lg transition"
              :class="filterStatus === 'belum' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-500'"
            >
              Perlu Bimbingan ({{ stats.belum_tuntas_count || 0 }})
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="fetchMappingPreview"
            class="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
            title="Muat ulang kalkulasi nilai terbaru"
          >
            <span>🔄</span> Segarkan Data
          </button>
          <button
            @click="showSyncConfirmModal = true"
            class="btn btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5 font-bold shadow-xs"
          >
            <span>🚀</span> Sinkronkan ke Rekap Nilai
          </button>
        </div>
      </div>

      <!-- Tabel Pre-Flight Monitor -->
      <div class="card overflow-hidden border border-slate-200 bg-white shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left border-collapse">
            <thead>
              <tr class="bg-slate-800 text-white text-[11px] uppercase tracking-wider text-center">
                <th rowspan="2" class="p-3 border-r border-slate-700 w-10">No</th>
                <th rowspan="2" class="p-3 border-r border-slate-700 text-left min-w-[180px]">Nama Siswa & NIS</th>
                <th rowspan="2" class="p-3 border-r border-slate-700 w-10">L/P</th>
                <th colspan="3" class="p-2 border-r border-slate-700 bg-blue-900/90 text-blue-100">
                  Presensi Siswa (Bobot 40% Formatif)
                </th>
                <th colspan="2" class="p-2 border-r border-slate-700 bg-indigo-900/90 text-indigo-100">
                  Akumulasi Tugas (Bobot 60%)
                </th>
                <th rowspan="2" class="p-3 border-r border-slate-700 bg-sky-900 text-sky-100 w-24">
                  NA Formatif (100%)
                </th>
                <th colspan="2" class="p-2 border-r border-slate-700 bg-purple-900/90 text-purple-100">
                  Sumatif TP (30% NA)
                </th>
                <th rowspan="2" class="p-3 border-r border-slate-700 bg-slate-900 text-slate-100 w-20">
                  Simulasi NA
                </th>
                <th rowspan="2" class="p-3 border-r border-slate-700 w-24">Status KKTP</th>
                <th rowspan="2" class="p-3 w-28">Status Rekap</th>
              </tr>
              <tr class="bg-slate-700 text-slate-200 text-[10px] text-center">
                <!-- Presensi -->
                <th class="p-1.5 border-r border-slate-600 w-16">Hadir</th>
                <th class="p-1.5 border-r border-slate-600 w-16">% Presensi</th>
                <th class="p-1.5 border-r border-slate-700 bg-blue-800/80 font-bold w-20">+ Poin 40%</th>
                <!-- Tugas -->
                <th class="p-1.5 border-r border-slate-600 w-16">Rata Tugas</th>
                <th class="p-1.5 border-r border-slate-700 bg-indigo-800/80 font-bold w-20">+ Poin 60%</th>
                <!-- Sumatif TP -->
                <th class="p-1.5 border-r border-slate-600 w-16">TP 1</th>
                <th class="p-1.5 border-r border-slate-700 w-20">Rata Sumatif</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr
                v-for="(row, idx) in filteredMatrix"
                :key="row.id"
                class="hover:bg-blue-50/40 transition group"
                :class="idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'"
              >
                <td class="p-2.5 text-center font-mono text-slate-500 border-r border-slate-100">
                  {{ idx + 1 }}
                </td>

                <td class="p-2.5 border-r border-slate-100">
                  <div class="font-bold text-slate-900 leading-tight">{{ row.name }}</div>
                  <div class="text-[10px] text-slate-500 font-mono mt-0.5">NIS: {{ row.nis || '-' }}</div>
                </td>

                <td class="p-2.5 text-center font-bold text-slate-600 border-r border-slate-100">
                  {{ row.gender || 'L' }}
                </td>

                <!-- Presensi Hadir -->
                <td class="p-2.5 text-center font-mono border-r border-slate-100">
                  {{ row.attendance.present }} / {{ row.attendance.total }}
                </td>

                <!-- % Presensi -->
                <td class="p-2.5 text-center border-r border-slate-100">
                  <span
                    class="px-1.5 py-0.5 rounded font-mono font-bold text-[11px]"
                    :class="row.attendance.percentage >= 80 ? 'bg-emerald-100 text-emerald-800' : row.attendance.percentage >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'"
                  >
                    {{ row.attendance.percentage }}%
                  </span>
                </td>

                <!-- Presensi +40% Formatif -->
                <td class="p-2.5 text-center font-black bg-blue-50/60 text-blue-800 border-r border-slate-200 font-mono">
                  +{{ row.attendance.contrib_formatif }}
                </td>

                <!-- Rata Tugas -->
                <td class="p-2.5 text-center font-mono border-r border-slate-100 text-slate-800">
                  {{ row.tasks.avg || 0 }}
                </td>

                <!-- Tugas +60% Formatif -->
                <td class="p-2.5 text-center font-black bg-indigo-50/60 text-indigo-800 border-r border-slate-200 font-mono">
                  +{{ row.tasks.contrib_formatif }}
                </td>

                <!-- Total NA Formatif -->
                <td class="p-2.5 text-center font-black bg-sky-50 text-sky-900 border-r border-slate-200 font-mono text-sm">
                  {{ row.formatif.total }}
                </td>

                <!-- Nilai TP 1 (Ulangan) -->
                <td class="p-2.5 text-center font-mono border-r border-slate-100 text-slate-800">
                  <span
                    v-if="row.sumatif_tp.by_tp.tp1 > 0"
                    class="font-bold"
                    :class="row.sumatif_tp.by_tp.tp1 >= currentKktp ? 'text-emerald-700' : 'text-rose-600'"
                  >
                    {{ row.sumatif_tp.by_tp.tp1 }}
                  </span>
                  <span v-else class="text-slate-300">-</span>
                </td>

                <!-- Rata Sumatif TP -->
                <td class="p-2.5 text-center font-mono font-bold text-purple-900 border-r border-slate-200 bg-purple-50/40">
                  {{ row.sumatif_tp.avg }}
                </td>

                <!-- Simulasi NA -->
                <td class="p-2.5 text-center border-r border-slate-200 bg-slate-50 font-mono">
                  <span class="font-black text-sm text-slate-900">{{ row.preview_final_score }}</span>
                  <span class="text-[10px] font-bold text-slate-500 block">Grade {{ row.grade_letter }}</span>
                </td>

                <!-- Status KKTP -->
                <td class="p-2.5 text-center border-r border-slate-200">
                  <span
                    class="px-2 py-1 rounded-full text-[10px] font-black uppercase inline-block shadow-2xs"
                    :class="row.kktp_status === 'Tuntas' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'"
                  >
                    {{ row.kktp_status }}
                  </span>
                </td>

                <!-- Status Rekap -->
                <td class="p-2.5 text-center">
                  <span
                    v-if="row.is_synced"
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center gap-1"
                    title="Nilai di Buku Nilai sudah sama persis dengan hasil perhitungan pemetaan ini"
                  >
                    <span>✓</span> Tersinkron
                  </span>
                  <span
                    v-else
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center gap-1"
                    title="Perhitungan belum disinkronkan ke Rekap Nilai resmi"
                  >
                    <span>⚠️</span> Draft
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- TAB 2: PENGINPUTAN STRUKTUR BAB & TUJUAN PEMBELAJARAN (TP)      -->
    <!-- ============================================================== -->
    <div v-if="activeTab === 'chapters'" class="space-y-6">
      <div class="card p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span>📚</span> Penginputan Bab & Tujuan Pembelajaran ({{ selectedSubjectName }} - Kelas VII)
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">
            Kelola lingkup materi bab dan Tujuan Pembelajaran (TP). Tugas dan Ulangan otomatis terhubung saat Anda membuatnya di menu masing-masing.
          </p>
        </div>

        <button
          @click="openAddChapterModal"
          class="btn btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 font-bold shadow-xs"
        >
          <span>➕</span> Tambah BAB Baru
        </button>
      </div>

      <!-- Banner Info Otomatisasi Pemetaan -->
      <div class="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 flex items-center gap-3 text-xs text-indigo-900">
        <span class="text-xl">✨</span>
        <div class="leading-relaxed">
          <strong>Pemetaan Tugas & Ulangan Otomatis:</strong> Saat Anda membuat tugas di menu <em>Tugas Siswa</em> atau membuat ulangan di menu <em>Boss Battle / CBT</em>, sistem sudah menyediakan pilihan TP tujuan sehingga nilainya otomatis terpetakan ke TP bersangkutan tanpa perlu pemetaan manual.
        </div>
      </div>

      <!-- List of Chapters -->
      <div class="space-y-4">
        <div
          v-for="chap in chapters"
          :key="chap.id"
          class="card overflow-hidden border border-slate-200 bg-white hover:shadow-md transition"
        >
          <!-- Chapter Card Header -->
          <div class="p-4 bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <span class="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                {{ chap.chapter_number }}
              </span>
              <div>
                <h4 class="font-bold text-slate-900 text-sm leading-tight flex items-center gap-2">
                  {{ chap.title }}
                </h4>
                <p class="text-xs text-slate-500 mt-0.5">{{ chap.description || 'Tidak ada deskripsi' }}</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 text-[11px] font-bold">
                {{ chap.tps?.length || 0 }} TP Terdaftar
              </span>
              <button
                @click="openAddTpModal(chap)"
                class="btn btn-secondary text-xs px-2.5 py-1 flex items-center gap-1"
                title="Tambah TP ke bab ini"
              >
                <span>➕</span> Tambah TP
              </button>
              <button
                @click="openEditChapterModal(chap)"
                class="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                title="Edit Bab"
              >
                ✏️
              </button>
              <button
                @click="confirmDeleteChapter(chap)"
                class="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Hapus Bab"
              >
                🗑️
              </button>
            </div>
          </div>

          <!-- TPs in Chapter Table -->
          <div class="p-4">
            <div v-if="!chap.tps || chap.tps.length === 0" class="text-center py-6 text-slate-400 text-xs italic">
              Belum ada Tujuan Pembelajaran di bab ini. Klik "Tambah TP" untuk menambahkan.
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="tp in chap.tps"
                :key="tp.id"
                class="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition space-y-2.5"
              >
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-xs font-black shadow-2xs">
                      {{ tp.code }}
                    </span>
                    <span class="text-xs font-bold text-slate-800">{{ tp.description }}</span>
                  </div>

                  <div class="flex items-center gap-2">
                    <span class="text-[11px] text-slate-500">
                      Target KKTP: <strong class="text-blue-700 font-black">{{ tp.kktp || currentKktp }}</strong>
                    </span>
                    <button
                      @click="openEditTpModal(chap, tp)"
                      class="p-1 rounded text-slate-400 hover:text-blue-600 transition"
                      title="Edit TP"
                    >
                      ✏️
                    </button>
                    <button
                      @click="confirmDeleteTp(chap, tp)"
                      class="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                      title="Hapus TP"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <!-- Otomatis Terhubung: Tugas & Ulangan -->
                <div class="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200/60 text-xs">
                  <!-- Tugas Otomatis -->
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="text-[11px] font-bold text-indigo-900 flex items-center gap-1">
                      <span>📝</span> Tugas Terpetakan ({{ tp.mapped_tasks?.length || 0 }}):
                    </span>
                    <template v-if="tp.mapped_tasks && tp.mapped_tasks.length > 0">
                      <span
                        v-for="t in tp.mapped_tasks"
                        :key="t.id"
                        class="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-bold"
                      >
                        {{ t.title }}
                      </span>
                    </template>
                    <span v-else class="text-[11px] text-slate-400 italic">
                      Belum ada tugas dibuat untuk TP ini.
                    </span>
                  </div>

                  <!-- Ulangan Otomatis -->
                  <div class="flex items-center gap-1.5 flex-wrap ml-auto">
                    <span class="text-[11px] font-bold text-purple-900 flex items-center gap-1">
                      <span>⚔️</span> Ulangan Terpetakan ({{ tp.mapped_exams?.length || 0 }}):
                    </span>
                    <template v-if="tp.mapped_exams && tp.mapped_exams.length > 0">
                      <span
                        v-for="e in tp.mapped_exams"
                        :key="e.id"
                        class="px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-800 text-[10px] font-bold"
                      >
                        {{ e.title }}
                      </span>
                    </template>
                    <span v-else class="text-[11px] text-slate-400 italic">
                      Belum ada ulangan untuk TP ini.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL TAMBAH / EDIT BAB                                        -->
    <!-- ============================================================== -->
    <div
      v-if="showChapterModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      @click.self="showChapterModal = false"
    >
      <div class="card p-6 bg-white w-full max-w-md shadow-2xl rounded-2xl space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span>📚</span> {{ chapterForm.id ? 'Edit Bab Lingkup Materi' : 'Tambah Bab Baru' }}
          </h3>
          <button @click="showChapterModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <form @submit.prevent="submitChapter" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nomor Bab</label>
            <input
              v-model.number="chapterForm.chapter_number"
              type="number"
              min="1"
              max="20"
              required
              class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Judul Bab</label>
            <input
              v-model="chapterForm.title"
              type="text"
              placeholder="Contoh: Bab 1: Berpikir Komputasional (BK)"
              required
              class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Deskripsi / Capaian Elemen</label>
            <textarea
              v-model="chapterForm.description"
              rows="3"
              placeholder="Jelaskan ringkasan materi atau fokus elemen CP bab ini..."
              class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              @click="showChapterModal = false"
              class="btn btn-secondary text-xs px-4 py-2"
            >
              Batal
            </button>
            <button
              type="submit"
              class="btn btn-primary text-xs px-4 py-2 font-bold"
            >
              Simpan Bab
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL TAMBAH / EDIT TP                                         -->
    <!-- ============================================================== -->
    <div
      v-if="showTpModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      @click.self="showTpModal = false"
    >
      <div class="card p-6 bg-white w-full max-w-lg shadow-2xl rounded-2xl space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span>🎯</span> {{ tpForm.id ? 'Edit Tujuan Pembelajaran (TP)' : 'Tambah TP ke Bab Ini' }}
          </h3>
          <button @click="showTpModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <form @submit.prevent="submitTp" class="space-y-3 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Kode TP</label>
              <input
                v-model="tpForm.code"
                type="text"
                placeholder="Contoh: TP 1.1"
                required
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Target KKTP</label>
              <input
                v-model.number="tpForm.kktp"
                type="number"
                min="50"
                max="100"
                required
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-black text-blue-700"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Deskripsi Capaian TP</label>
            <textarea
              v-model="tpForm.description"
              rows="3"
              placeholder="Peserta didik mampu menerapkan konsep berpikir komputasional..."
              required
              class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              @click="showTpModal = false"
              class="btn btn-secondary text-xs px-4 py-2"
            >
              Batal
            </button>
            <button
              type="submit"
              class="btn btn-primary text-xs px-4 py-2 font-bold"
            >
              Simpan TP
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL KONFIRMASI SINKRONISASI KE REKAP NILAI SISWA             -->
    <!-- ============================================================== -->
    <div
      v-if="showSyncConfirmModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      @click.self="showSyncConfirmModal = false"
    >
      <div class="card p-6 bg-white w-full max-w-md shadow-2xl rounded-2xl space-y-4">
        <div class="flex items-center gap-3 text-emerald-700">
          <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">
            🚀
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-sm">Sinkronkan ke Rekap Nilai Siswa</h3>
            <p class="text-[11px] text-slate-500">{{ selectedClassLabel }} &bull; {{ selectedSubjectName }}</p>
          </div>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs leading-relaxed text-slate-700">
          <p>
            Proses ini akan menghitung dan menerapkan nilai siswa secara resmi ke <strong>Buku Nilai / Rekapitulasi Rapor</strong> dengan aturan:
          </p>
          <ul class="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
            <li><strong>Presensi (40%)</strong>: Kehadiran siswa pada {{ attendanceInfo.total_sessions || 0 }} pertemuan kelas.</li>
            <li><strong>Tugas (60%)</strong>: Akumulasi nilai tugas yang otomatis dipetakan ke TP.</li>
            <li><strong>Sumatif TP (30% NA)</strong>: Rata-rata asesmen ulangan per TP.</li>
            <li><strong>Total Siswa Diperbarui</strong>: <strong>{{ matrix.length }} Siswa</strong>.</li>
          </ul>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            @click="showSyncConfirmModal = false"
            class="btn btn-secondary text-xs px-4 py-2"
          >
            Batal
          </button>
          <button
            type="button"
            @click="commitSyncToGrades"
            :disabled="isSyncing"
            class="btn btn-primary bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 font-bold shadow-xs flex items-center gap-1.5"
          >
            <span v-if="isSyncing" class="animate-spin">⏳</span>
            <span>{{ isSyncing ? 'Memproses...' : 'Ya, Terapkan Sekarang' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/services/api'
import { useClassrooms } from '@/composables/useClassrooms'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const {
  classrooms,
  fetchClassrooms,
  fetchSubjects,
  formatClassLabel,
  getClassName,
  getClassGradeLevel,
  getSubjectIdForClass,
  getAvailableSubjectsForClass,
  filterClassroomsBySubject
} = useClassrooms()

// State filters
const selectedClassId = ref('')
const selectedSubjectId = ref('')
const availableSubjects = computed(() => getAvailableSubjectsForClass(selectedClassId.value))
const selectedGrade = computed(() => getClassGradeLevel(selectedClassId.value))
const currentKktp = ref(75)
const activeTab = ref<'monitor' | 'chapters'>('monitor')
const searchQuery = ref('')
const filterStatus = ref<'all' | 'tuntas' | 'belum'>('all')

// Data holders
const chapters = ref<any[]>([])
const matrix = ref<any[]>([])
const attendanceInfo = ref<any>({})
const stats = ref<any>({})

// Loading & sync status
const isLoading = ref(false)
const isSyncing = ref(false)
const syncSuccessMessage = ref('')

// Modals
const showChapterModal = ref(false)
const chapterForm = ref({
  id: '',
  chapter_number: 1,
  title: '',
  description: ''
})

const showTpModal = ref(false)
const currentTargetChapter = ref<any>(null)
const tpForm = ref({
  id: '',
  code: '',
  description: '',
  kktp: 75
})

const showSyncConfirmModal = ref(false)

// Computed labels
const selectedSubjectName = computed(() => {
  const found = availableSubjects.value.find(s => s.id === selectedSubjectId.value)
  return found?.name || authStore.user?.subject || 'Mata Pelajaran'
})

const selectedClassLabel = computed(() => {
  const c = classrooms.value.find(cl => cl.id === selectedClassId.value)
  return c ? formatClassLabel(c) : 'Pilih Kelas'
})

// Filtered matrix for pre-flight monitor
const filteredMatrix = computed(() => {
  let list = matrix.value || []
  if (filterStatus.value === 'tuntas') {
    list = list.filter(r => r.kktp_status === 'Tuntas')
  } else if (filterStatus.value === 'belum') {
    list = list.filter(r => r.kktp_status !== 'Tuntas')
  }

  if (searchQuery.value.trim()) {
    const term = searchQuery.value.toLowerCase().trim()
    list = list.filter(r =>
      r.name?.toLowerCase().includes(term) ||
      r.nis?.toLowerCase().includes(term)
    )
  }
  return list
})

// Lifecycle
onMounted(async () => {
  await Promise.all([fetchClassrooms(true), fetchSubjects(true)])
  if (classrooms.value.length > 0) {
    if (!selectedClassId.value || !classrooms.value.some(c => c.id === selectedClassId.value)) {
      selectedClassId.value = classrooms.value[0].id
    }
  } else {
    selectedClassId.value = ''
  }
  selectedSubjectId.value = getSubjectIdForClass(selectedClassId.value)
  await Promise.all([fetchChapters(), fetchMappingPreview()])
})

async function onClassChange() {
  selectedSubjectId.value = getSubjectIdForClass(selectedClassId.value)
  await onSubjectOrClassChange()
}

watch(selectedClassId, async (newClassId) => {
  if (newClassId) {
    const autoSubId = getSubjectIdForClass(newClassId)
    if (autoSubId && selectedSubjectId.value !== autoSubId) {
      selectedSubjectId.value = autoSubId
      await onSubjectOrClassChange()
    }
  }
})

async function onSubjectChange() {
  const validClasses = filterClassroomsBySubject(classrooms.value, selectedSubjectId.value)
  if (!validClasses.some(c => c.id === selectedClassId.value) && validClasses.length > 0) {
    selectedClassId.value = validClasses[0].id
  }
  await onSubjectOrClassChange()
}

async function fetchChapters() {
  try {
    const res = await api.get('/chapters', {
      params: {
        subject_id: selectedSubjectId.value,
        grade_level: selectedGrade.value
      }
    })
    chapters.value = res.data?.data || []
  } catch (err) {
    console.error('Failed to load chapters:', err)
  }
}

async function fetchMappingPreview() {
  isLoading.value = true
  try {
    const res = await api.get('/chapters/mapping-preview', {
      params: {
        classroom_id: selectedClassId.value,
        subject_id: selectedSubjectId.value,
        kktp: currentKktp.value
      }
    })
    if (res.data?.data) {
      const d = res.data.data
      matrix.value = d.matrix || []
      stats.value = d.stats || {}
      attendanceInfo.value = d.attendance_info || {}
      if (d.kktp) currentKktp.value = d.kktp
      if (d.chapters) chapters.value = d.chapters
    }
  } catch (err) {
    console.error('Failed to load mapping preview:', err)
  } finally {
    isLoading.value = false
  }
}

async function onSubjectOrClassChange() {
  await Promise.all([fetchChapters(), fetchMappingPreview()])
}

// -----------------------------------------------------------------
// CHAPTER CRUD
// -----------------------------------------------------------------
function openAddChapterModal() {
  chapterForm.value = {
    id: '',
    chapter_number: (chapters.value.length || 0) + 1,
    title: `Bab ${(chapters.value.length || 0) + 1}: `,
    description: ''
  }
  showChapterModal.value = true
}

function openEditChapterModal(chap: any) {
  chapterForm.value = {
    id: chap.id,
    chapter_number: chap.chapter_number,
    title: chap.title,
    description: chap.description || ''
  }
  showChapterModal.value = true
}

async function submitChapter() {
  try {
    if (chapterForm.value.id) {
      await api.put(`/chapters/${chapterForm.value.id}`, {
        chapter_number: chapterForm.value.chapter_number,
        title: chapterForm.value.title,
        description: chapterForm.value.description
      })
    } else {
      await api.post('/chapters', {
        subject_id: selectedSubjectId.value,
        grade_level: selectedGrade.value,
        chapter_number: chapterForm.value.chapter_number,
        title: chapterForm.value.title,
        description: chapterForm.value.description,
        tps: []
      })
    }
    showChapterModal.value = false
    await fetchChapters()
  } catch (err) {
    console.error('Failed to save chapter:', err)
    alert('Gagal menyimpan Bab materi.')
  }
}

async function confirmDeleteChapter(chap: any) {
  if (!confirm(`Hapus ${chap.title}? Seluruh TP di dalam bab ini juga akan terhapus.`)) return
  try {
    await api.delete(`/chapters/${chap.id}`)
    await fetchChapters()
  } catch (err) {
    console.error('Failed to delete chapter:', err)
    alert('Gagal menghapus bab.')
  }
}

// -----------------------------------------------------------------
// TP CRUD
// -----------------------------------------------------------------
function openAddTpModal(chap: any) {
  currentTargetChapter.value = chap
  const nextNum = (chap.tps?.length || 0) + 1
  tpForm.value = {
    id: '',
    code: `TP ${chap.chapter_number}.${nextNum}`,
    description: '',
    kktp: currentKktp.value
  }
  showTpModal.value = true
}

function openEditTpModal(chap: any, tp: any) {
  currentTargetChapter.value = chap
  tpForm.value = {
    id: tp.id,
    code: tp.code,
    description: tp.description,
    kktp: tp.kktp || currentKktp.value
  }
  showTpModal.value = true
}

async function submitTp() {
  if (!currentTargetChapter.value) return
  const chapId = currentTargetChapter.value.id

  try {
    if (tpForm.value.id) {
      await api.put(`/chapters/${chapId}/tps/${tpForm.value.id}`, {
        code: tpForm.value.code,
        description: tpForm.value.description,
        kktp: tpForm.value.kktp
      })
    } else {
      await api.post(`/chapters/${chapId}/tps`, {
        code: tpForm.value.code,
        description: tpForm.value.description,
        kktp: tpForm.value.kktp,
        task_ids: [],
        exam_session_ids: []
      })
    }
    showTpModal.value = false
    await fetchChapters()
    await fetchMappingPreview()
  } catch (err) {
    console.error('Failed to save TP:', err)
    alert('Gagal menyimpan TP.')
  }
}

async function confirmDeleteTp(chap: any, tp: any) {
  if (!confirm(`Hapus ${tp.code}?`)) return
  try {
    await api.delete(`/chapters/${chap.id}/tps/${tp.id}`)
    await fetchChapters()
    await fetchMappingPreview()
  } catch (err) {
    console.error('Failed to delete TP:', err)
    alert('Gagal menghapus TP.')
  }
}

// -----------------------------------------------------------------
// SYNC TO REKAP NILAI SISWA (db.subjectGrades)
// -----------------------------------------------------------------
async function commitSyncToGrades() {
  isSyncing.value = true
  try {
    const res = await api.post('/chapters/apply-to-grades', {
      classroom_id: selectedClassId.value,
      subject_id: selectedSubjectId.value,
      kktp: currentKktp.value
    })
    showSyncConfirmModal.value = false
    syncSuccessMessage.value = res.data?.message || 'Nilai siswa berhasil disinkronkan ke Rekap Nilai Siswa!'
    await fetchMappingPreview()
  } catch (err) {
    console.error('Failed to sync grades:', err)
    alert('Gagal menyinkronkan nilai ke Rekap Nilai.')
  } finally {
    isSyncing.value = false
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.25s ease-out forwards;
}
</style>
