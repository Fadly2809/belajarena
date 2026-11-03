<template>
  <div class="space-y-6">
    <!-- Header (Hidden during Print) -->
    <div class="p-6 bg-[#0c2b3d] text-white rounded-[28px] shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-5 border border-slate-700/40 print:hidden relative overflow-hidden">
      <div class="relative z-10">
        <div class="flex items-center gap-2">
          <span class="text-2xl">🏆</span>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Live Real-time
          </span>
          <span class="text-xs text-slate-300 font-medium">Kurikulum Merdeka SMP</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
          Live Ranking & Leaderboard Kelas
        </h1>
        <p class="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
          Peringkat prestasi belajar terpadu Kurikulum Merdeka sinkron Rekap Nilai Siswa: <strong>Formatif (30%)</strong> [Absen 40% + Tugas 60%], <strong>Sumatif TP (30%)</strong>, <strong>STS (20%)</strong>, dan <strong>SAS (20%)</strong>
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5 relative z-10">
        <button
          @click="exportCsv"
          class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1.5 border border-white/15 backdrop-blur-md"
        >
          <span>📥</span> Ekspor Excel
        </button>
        <button
          @click="printRanking"
          class="px-4 py-2.5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-500/20"
        >
          <span>🖨️</span> Cetak Peringkat
        </button>
      </div>
    </div>

    <!-- Filter Bar (Hidden during Print) -->
    <div class="bg-white rounded-[24px] shadow-card border border-slate-200/60 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 print:hidden">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Filter Mata Pelajaran -->
        <div>
          <label class="block text-[10px] font-bold uppercase text-surface-500 mb-1">Mata Pelajaran</label>
          <select
            v-model="selectedSubjectId"
            @change="onSubjectChange"
            class="input text-xs py-1.5 font-bold"
          >
            <option value="sub-kka">KKA (Koding &amp; Kecerdasan Artifisial) — Kelas VII</option>
            <option value="sub-inf">Informatika — Kelas IX</option>
          </select>
        </div>

        <!-- Filter Rombel Kelas (Otomatis Tersinkron dengan Jadwal) -->
        <div>
          <label class="block text-[10px] font-bold uppercase text-surface-500 mb-1">Rombel Kelas</label>
          <select
            v-model="selectedClassId"
            @change="onClassChange"
            class="input text-xs py-1.5 font-bold"
          >
            <option v-for="cls in availableClassrooms" :key="cls.id" :value="cls.id">
              {{ formatClassLabel(cls) }}
            </option>
          </select>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2 text-xs">
        <span class="badge bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 text-[10px] flex items-center gap-1">
          <span>📅</span> Sinkron Rapor
        </span>
        <span class="text-surface-500 text-[11px]">Bobot:</span>
        <span class="badge bg-blue-50 text-blue-700 font-bold border border-blue-200 text-[10px]">Formatif 30%</span>
        <span class="badge bg-purple-50 text-purple-700 font-bold border border-purple-200 text-[10px]">Sumatif TP 30%</span>
        <span class="badge bg-amber-50 text-amber-700 font-bold border border-amber-200 text-[10px]">STS 20%</span>
        <span class="badge bg-rose-50 text-rose-700 font-bold border border-rose-200 text-[10px]">SAS 20%</span>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="i in 3" :key="i" class="card p-6 animate-pulse space-y-3">
          <div class="h-6 bg-surface-200 rounded w-1/3 mx-auto"></div>
          <div class="h-10 bg-surface-200 rounded w-2/3 mx-auto"></div>
          <div class="h-12 bg-surface-200 rounded"></div>
        </div>
      </div>
      <div class="card p-6 animate-pulse h-48 bg-surface-100"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="leaderboard.length === 0" class="card p-12 text-center space-y-4">
      <div class="text-5xl">🏆</div>
      <h2 class="text-lg font-bold text-surface-900">Belum Ada Data Siswa di Kelas Ini</h2>
      <p class="text-xs text-surface-500 max-w-md mx-auto">
        Belum ada peserta didik terdaftar di rombel ini. Masukkan siswa terlebih dahulu melalui menu Data Siswa atau Manajemen Kelas.
      </p>
      <router-link to="/students" class="btn btn-primary text-xs inline-flex items-center gap-1.5 font-bold">
        <span>➕</span> Kelola Data Siswa
      </router-link>
    </div>

    <div v-else class="space-y-6">
      <!-- Top 3 Podium Cards Showcase (Hidden during Print) -->
      <div v-if="topThree.length > 0 && topThree[0].final_score !== null" class="grid grid-cols-1 md:grid-cols-3 gap-5 print:hidden">
        <!-- Juara 2 (Perak) -->
        <div
          v-if="topThree[1]"
          class="card p-5 border-2 border-slate-200 bg-gradient-to-b from-white to-slate-50/50 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition order-2 md:order-1"
        >
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-200 text-slate-800">
              Peringkat 2
            </span>
            <span class="text-3xl">🥈</span>
          </div>

          <div class="text-center my-3 space-y-1">
            <div class="w-14 h-14 mx-auto rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-center text-xl font-black text-slate-700">
              {{ topThree[1].student_name.charAt(0) }}
            </div>
            <h3 class="font-extrabold text-surface-900 text-base line-clamp-1 mt-2">
              {{ topThree[1].student_name }}
            </h3>
            <p class="text-[11px] font-mono text-surface-500">NIS: {{ topThree[1].nis || '—' }}</p>
            <div class="pt-1">
              <span class="text-3xl font-black text-slate-800">{{ topThree[1].final_score }}</span>
              <span class="text-xs text-surface-400 ml-1">/ 100</span>
            </div>
            <div class="flex items-center justify-center gap-1.5 pt-0.5">
              <span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold">
                Predikat: {{ topThree[1].grade_letter }}
              </span>
              <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                {{ topThree[1].status_kktp }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-1.5 p-2 rounded-xl bg-slate-100 text-center text-[10px] font-bold">
            <div class="p-1 bg-white/70 rounded-lg">
              <span class="block text-surface-500 font-medium text-[9px]">Formatif (30%)</span>
              <span class="text-blue-700 font-black">{{ topThree[1].avg_formatif || '—' }}</span>
            </div>
            <div class="p-1 bg-white/70 rounded-lg">
              <span class="block text-surface-500 font-medium text-[9px]">Sumatif TP (30%)</span>
              <span class="text-purple-700 font-black">{{ topThree[1].avg_sumatif_tp || '—' }}</span>
            </div>
            <div class="p-1 bg-white/70 rounded-lg">
              <span class="block text-surface-500 font-medium text-[9px]">STS (20%)</span>
              <span class="text-amber-700 font-black">{{ topThree[1].sts || '—' }}</span>
            </div>
            <div class="p-1 bg-white/70 rounded-lg">
              <span class="block text-surface-500 font-medium text-[9px]">SAS (20%)</span>
              <span class="text-rose-700 font-black">{{ topThree[1].sas || '—' }}</span>
            </div>
          </div>
        </div>

        <!-- Juara 1 (Emas - Center Elevated) -->
        <div
          v-if="topThree[0]"
          class="card p-6 border-2 border-amber-300 bg-gradient-to-b from-amber-50/70 via-white to-amber-50/30 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-xl shadow-amber-500/10 hover:shadow-2xl transition order-1 md:order-2 md:-translate-y-2 ring-4 ring-amber-400/20"
        >
          <div class="absolute -right-6 -top-6 w-24 h-24 bg-amber-400/15 rounded-full blur-xl"></div>
          
          <div class="flex items-center justify-between">
            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm flex items-center gap-1">
              <span>👑</span> Juara 1 Kelas
            </span>
            <span class="text-4xl">🥇</span>
          </div>

          <div class="text-center my-3 space-y-1">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-2xl font-black text-amber-900 shadow-inner">
              {{ topThree[0].student_name.charAt(0) }}
            </div>
            <h3 class="font-black text-surface-900 text-lg line-clamp-1 mt-2">
              {{ topThree[0].student_name }}
            </h3>
            <p class="text-xs font-mono text-amber-800 font-semibold">NIS: {{ topThree[0].nis || '—' }}</p>
            <div class="pt-1">
              <span class="text-4xl font-black text-amber-600">{{ topThree[0].final_score }}</span>
              <span class="text-xs text-surface-400 ml-1">/ 100</span>
            </div>
            <div class="flex items-center justify-center gap-1.5 pt-0.5">
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                Predikat: {{ topThree[0].grade_letter }}
              </span>
              <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                {{ topThree[0].status_kktp }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-1.5 p-2.5 rounded-xl bg-amber-100/70 text-center text-[10px] font-bold border border-amber-200">
            <div class="p-1.5 bg-white/80 rounded-lg">
              <span class="block text-surface-600 font-medium text-[9px]">Formatif (30%)</span>
              <span class="text-blue-800 font-black">{{ topThree[0].avg_formatif || '—' }}</span>
            </div>
            <div class="p-1.5 bg-white/80 rounded-lg">
              <span class="block text-surface-600 font-medium text-[9px]">Sumatif TP (30%)</span>
              <span class="text-purple-800 font-black">{{ topThree[0].avg_sumatif_tp || '—' }}</span>
            </div>
            <div class="p-1.5 bg-white/80 rounded-lg">
              <span class="block text-surface-600 font-medium text-[9px]">STS (20%)</span>
              <span class="text-amber-800 font-black">{{ topThree[0].sts || '—' }}</span>
            </div>
            <div class="p-1.5 bg-white/80 rounded-lg">
              <span class="block text-surface-600 font-medium text-[9px]">SAS (20%)</span>
              <span class="text-rose-800 font-black">{{ topThree[0].sas || '—' }}</span>
            </div>
          </div>
        </div>

        <!-- Juara 3 (Perunggu) -->
        <div
          v-if="topThree[2]"
          class="card p-5 border-2 border-amber-700/20 bg-gradient-to-b from-white to-amber-50/20 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition order-3"
        >
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-800/15 text-amber-900">
              Peringkat 3
            </span>
            <span class="text-3xl">🥉</span>
          </div>

          <div class="text-center my-3 space-y-1">
            <div class="w-14 h-14 mx-auto rounded-2xl bg-amber-100/60 border border-amber-300 flex items-center justify-center text-xl font-black text-amber-900">
              {{ topThree[2].student_name.charAt(0) }}
            </div>
            <h3 class="font-extrabold text-surface-900 text-base line-clamp-1 mt-2">
              {{ topThree[2].student_name }}
            </h3>
            <p class="text-[11px] font-mono text-surface-500">NIS: {{ topThree[2].nis || '—' }}</p>
            <div class="pt-1">
              <span class="text-3xl font-black text-amber-800">{{ topThree[2].final_score }}</span>
              <span class="text-xs text-surface-400 ml-1">/ 100</span>
            </div>
            <div class="flex items-center justify-center gap-1.5 pt-0.5">
              <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                Predikat: {{ topThree[2].grade_letter }}
              </span>
              <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                {{ topThree[2].status_kktp }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-1.5 p-2 rounded-xl bg-amber-100/40 text-center text-[10px] font-bold">
            <div class="p-1 bg-white/70 rounded-lg">
              <span class="block text-surface-500 font-medium text-[9px]">Formatif (30%)</span>
              <span class="text-blue-700 font-black">{{ topThree[2].avg_formatif || '—' }}</span>
            </div>
            <div class="p-1 bg-white/70 rounded-lg">
              <span class="block text-surface-500 font-medium text-[9px]">Sumatif TP (30%)</span>
              <span class="text-purple-700 font-black">{{ topThree[2].avg_sumatif_tp || '—' }}</span>
            </div>
            <div class="p-1 bg-white/70 rounded-lg">
              <span class="block text-surface-500 font-medium text-[9px]">STS (20%)</span>
              <span class="text-amber-700 font-black">{{ topThree[2].sts || '—' }}</span>
            </div>
            <div class="p-1 bg-white/70 rounded-lg">
              <span class="block text-surface-500 font-medium text-[9px]">SAS (20%)</span>
              <span class="text-rose-700 font-black">{{ topThree[2].sas || '—' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Summary Stats (Hidden during Print) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
        <div class="card p-4 text-center">
          <span class="text-[10px] uppercase font-bold text-surface-400">Total Siswa Terdaftar</span>
          <p class="text-xl font-black text-surface-900 mt-0.5">{{ totalStudents }} Siswa</p>
        </div>
        <div class="card p-4 text-center">
          <span class="text-[10px] uppercase font-bold text-surface-400">Rata-rata Skor Kelas</span>
          <p class="text-xl font-black text-primary-600 mt-0.5">{{ stats.average_score || '—' }}</p>
        </div>
        <div class="card p-4 text-center">
          <span class="text-[10px] uppercase font-bold text-surface-400">Skor Tertinggi / Terendah</span>
          <p class="text-xl font-black text-surface-900 mt-0.5">{{ stats.highest_score || '0' }} / {{ stats.lowest_score || '0' }}</p>
        </div>
        <div class="card p-4 text-center">
          <span class="text-[10px] uppercase font-bold text-surface-400">Ketuntasan KKTP (&ge; {{ (stats as any).kktp || 75 }})</span>
          <p class="text-xl font-black text-emerald-600 mt-0.5">{{ stats.pass_rate }}% ({{ stats.passed_count }}/{{ stats.total_students || totalStudents }})</p>
        </div>
      </div>

      <!-- Printable Official Header (Only in Print) -->
      <div class="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-6">
        <h2 class="text-base font-black uppercase tracking-wider text-slate-900">SMP NEGERI 6 KENDARI</h2>
        <h3 class="text-sm font-bold text-slate-800">LEMBAR PERINGKAT & LIVE RANKING KELAS</h3>
        <p class="text-xs text-slate-600 mt-0.5">
          Mata Pelajaran: {{ currentSubjectName }} &bull; Rombel: {{ currentClassName }} &bull; Tahun Ajaran 2024/2025
        </p>
      </div>

      <!-- Main Leaderboard Table -->
      <div class="card p-0 overflow-hidden border border-surface-200">
        <div class="p-4 bg-surface-50 border-b border-surface-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-bold text-surface-900 text-sm">Daftar Peringkat Siswa Lengkap</span>
            <span class="text-xs text-surface-500">({{ leaderboard.length }} Peserta Didik)</span>
          </div>
          <span class="text-xs text-surface-500 print:hidden">Urut otomatis berdasarkan skor tertinggi</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-surface-50 text-surface-600 font-semibold uppercase tracking-wider text-[11px] border-b border-surface-200">
                <th class="py-3 px-3 w-14 text-center">Rank</th>
                <th class="py-3 px-4 min-w-[170px]">Nama Siswa</th>
                <th class="py-3 px-2 text-center">NIS</th>
                <th class="py-3 px-2 text-center">L/P</th>
                <th class="py-3 px-3 text-center bg-blue-50/50 text-blue-900 font-bold">
                  <div>Formatif (30%)</div>
                  <div class="text-[9px] font-normal text-blue-700">Absen (40%) + Tugas (60%)</div>
                </th>
                <th class="py-3 px-3 text-center bg-purple-50/50 text-purple-900 font-bold">
                  <div>Sumatif TP (30%)</div>
                  <div class="text-[9px] font-normal text-purple-700">Boss Battle / CBT TP</div>
                </th>
                <th class="py-3 px-3 text-center bg-amber-50/50 text-amber-900 font-bold">
                  <div>STS (20%)</div>
                  <div class="text-[9px] font-normal text-amber-700">Tengah Semester</div>
                </th>
                <th class="py-3 px-3 text-center bg-rose-50/50 text-rose-900 font-bold">
                  <div>SAS (20%)</div>
                  <div class="text-[9px] font-normal text-rose-700">Akhir Semester</div>
                </th>
                <th class="py-3 px-3 text-center bg-primary-50 font-black text-primary-900">
                  <div>Nilai Akhir (NA)</div>
                  <div class="text-[9px] font-bold text-primary-600">Sinkron Rapor</div>
                </th>
                <th class="py-3 px-2.5 text-center">Predikat</th>
                <th class="py-3 px-3 text-center">Status KKTP</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-100 text-xs">
              <tr
                v-for="item in leaderboard"
                :key="item.student_id"
                :class="[
                  'hover:bg-surface-50/70 transition',
                  item.rank === 1 ? 'bg-amber-50/20 font-semibold' : ''
                ]"
              >
                <!-- Rank -->
                <td class="py-3 px-3 text-center">
                  <div class="flex items-center justify-center gap-1 font-black">
                    <span v-if="item.medal" class="text-base">{{ item.medal }}</span>
                    <span :class="item.rank === 1 ? 'text-amber-600 font-extrabold text-sm' : item.rank === 2 ? 'text-slate-600' : item.rank === 3 ? 'text-amber-800' : 'text-surface-600'">
                      {{ item.rank }}
                    </span>
                  </div>
                </td>

                <!-- Nama Siswa -->
                <td class="py-3 px-4 font-bold text-surface-900">
                  {{ item.student_name }}
                </td>

                <!-- NIS -->
                <td class="py-3 px-2 text-center font-mono text-surface-500">
                  {{ item.nis || '—' }}
                </td>

                <!-- Gender -->
                <td class="py-3 px-2 text-center text-surface-600">
                  {{ item.gender || 'L' }}
                </td>

                <!-- Formatif (30%) [Absen 40% + Tugas 60%] -->
                <td class="py-3 px-3 text-center bg-blue-50/20 font-bold text-blue-900">
                  <div class="text-xs font-black">{{ item.avg_formatif > 0 ? item.avg_formatif : '—' }}</div>
                  <div v-if="item.avg_formatif > 0" class="text-[10px] text-blue-600 font-medium">
                    Abs: {{ item.attendance_score }}% &bull; Tgs: {{ item.avg_tugas }}
                  </div>
                </td>

                <!-- Sumatif TP (30%) -->
                <td class="py-3 px-3 text-center bg-purple-50/20 font-bold text-purple-900">
                  <span v-if="item.avg_sumatif_tp > 0" class="font-bold text-purple-900">{{ item.avg_sumatif_tp }}</span>
                  <span v-else class="text-surface-400 font-normal italic">—</span>
                </td>

                <!-- STS (20%) -->
                <td class="py-3 px-3 text-center bg-amber-50/20 font-bold text-amber-900">
                  <span v-if="item.sts > 0" class="font-bold text-amber-900">{{ item.sts }}</span>
                  <span v-else class="text-surface-400 font-normal italic">—</span>
                </td>

                <!-- SAS (20%) -->
                <td class="py-3 px-3 text-center bg-rose-50/20 font-bold text-rose-900">
                  <span v-if="item.sas > 0" class="font-bold text-rose-900">{{ item.sas }}</span>
                  <span v-else class="text-surface-400 font-normal italic">—</span>
                </td>

                <!-- Nilai Akhir NA (Rapor) -->
                <td class="py-3 px-3 text-center bg-primary-50/50">
                  <span v-if="item.final_score > 0" class="font-black text-sm text-primary-800 bg-white px-2.5 py-0.5 rounded-lg border border-primary-200 shadow-2xs">
                    {{ item.final_score }}
                  </span>
                  <span v-else class="text-surface-400 italic text-[11px]">Belum Dinilai</span>
                </td>

                <!-- Predikat -->
                <td class="py-3 px-2.5 text-center font-bold">
                  <span
                    :class="[
                      'px-2 py-0.5 rounded text-[10px] font-black',
                      item.grade_letter === 'A' ? 'bg-emerald-100 text-emerald-800' :
                      item.grade_letter === 'B' ? 'bg-blue-100 text-blue-800' :
                      item.grade_letter === 'C' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-700'
                    ]"
                  >
                    {{ item.grade_letter }}
                  </span>
                </td>

                <!-- Status KKTP -->
                <td class="py-3 px-3 text-center">
                  <span
                    :class="[
                      'badge text-[10px] font-bold',
                      item.status_kktp === 'Tuntas' ? 'badge-success' :
                      item.status_kktp === 'Belum Tuntas' ? 'badge-danger' : 'badge-secondary'
                    ]"
                  >
                    {{ item.status_kktp }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tanda Tangan Cetak (Only in Print View) -->
      <div class="hidden print:grid grid-cols-2 gap-8 text-xs text-slate-900 text-center pt-8">
        <div>
          <p>Mengetahui,</p>
          <p class="font-bold">Kepala SMP Negeri 6 Kendari</p>
          <div class="h-20"></div>
          <p class="font-black underline">H. Abdul Rahman, S.Pd., M.Pd.</p>
          <p class="text-[11px] font-mono mt-0.5">NIP. 197003151996031002</p>
        </div>

        <div>
          <p>Kendari, {{ printDate }}</p>
          <p class="font-bold">Guru Mata Pelajaran</p>
          <div class="h-20"></div>
          <p class="font-black underline">Muhammad Fadly Akbar Arsandi, S.Pd.</p>
          <p class="text-[11px] font-mono mt-0.5">NIP. 199509282020121003</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'
import {
  useClassrooms,
  getSubjectIdForClass,
  filterClassroomsBySubject
} from '@/composables/useClassrooms'

const route = useRoute()
const { classrooms, fetchClassrooms, formatClassLabel, getClassName } = useClassrooms()

const loading = ref(false)
const selectedClassId = ref('cls-7a')
const selectedSubjectId = ref(getSubjectIdForClass(selectedClassId.value))

// Kelas yang tersedia sesuai mata pelajaran terpilih
// sub-kka -> VII A, VII B, VII C, VII D
// sub-inf -> IX A, IX B, IX C, IX D
const availableClassrooms = computed(() => {
  return filterClassroomsBySubject(classrooms.value, selectedSubjectId.value)
})

function onSubjectChange() {
  const valid = availableClassrooms.value
  if (!valid.some(c => c.id === selectedClassId.value) && valid.length > 0) {
    selectedClassId.value = valid[0].id
  }
  fetchRanking()
}

function onClassChange() {
  const officialSubId = getSubjectIdForClass(selectedClassId.value)
  if (selectedSubjectId.value !== officialSubId) {
    selectedSubjectId.value = officialSubId
  }
  fetchRanking()
}

const leaderboard = ref<any[]>([])
const totalStudents = ref(0)
const stats = ref<any>({
  average_score: 0,
  highest_score: 0,
  lowest_score: 0,
  passed_count: 0,
  pass_rate: 0,
  top_student: null
})

const printDate = new Date().toLocaleDateString('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})

const topThree = computed(() => {
  return leaderboard.value.slice(0, 3)
})

const currentSubjectName = computed(() => {
  return selectedSubjectId.value === 'sub-kka' ? 'KKA (Koding dan Kecerdasan Artifisial)' : 'Informatika'
})

const currentClassName = computed(() => {
  return getClassName(selectedClassId.value)
})

async function fetchRanking() {
  loading.value = true
  try {
    const res = await api.get('/rankings', {
      params: {
        classroom_id: selectedClassId.value,
        subject_id: selectedSubjectId.value
      }
    })
    const d = res.data?.data || res.data
    if (d) {
      leaderboard.value = d.leaderboard || []
      stats.value = d.stats || stats.value
      totalStudents.value = d.total_students || 0
    }
  } catch (err) {
    console.error('Failed to load live ranking:', err)
  } finally {
    loading.value = false
  }
}

function printRanking() {
  window.print()
}

function exportCsv() {
  if (leaderboard.value.length === 0) {
    alert('Belum ada data peringkat untuk diekspor.')
    return
  }

  const headers = [
    'Peringkat',
    'Nama Siswa',
    'NIS',
    'L/P',
    'Presensi (%)',
    'Rata-rata Tugas',
    'Formatif (30%)',
    'Sumatif TP (30%)',
    'STS (20%)',
    'SAS (20%)',
    'Nilai Akhir (NA)',
    'Predikat',
    'Status KKTP'
  ]
  const rows = leaderboard.value.map(s => [
    s.rank,
    `"${s.student_name}"`,
    `"${s.nis || ''}"`,
    s.gender || 'L',
    s.attendance_score ?? '',
    s.avg_tugas ?? '',
    s.avg_formatif ?? '',
    s.avg_sumatif_tp ?? '',
    s.sts ?? '',
    s.sas ?? '',
    s.final_score ?? '',
    s.grade_letter,
    `"${s.status_kktp}"`
  ])

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `Live_Ranking_${currentClassName.value}_${currentSubjectName.value}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(async () => {
  await fetchClassrooms()
  if (route.query.classroom_id && typeof route.query.classroom_id === 'string') {
    selectedClassId.value = route.query.classroom_id
  }
  selectedSubjectId.value = getSubjectIdForClass(selectedClassId.value)
  await fetchRanking()
})
</script>
