<template>
  <div class="space-y-6">
    <!-- Top Action Controls (Hidden during Print) -->
    <div class="bg-white rounded-[24px] shadow-card border border-slate-200/60 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 print:hidden sticky top-0 z-20">
      <div class="flex items-center gap-3">
        <RouterLink to="/curriculum/chapters" class="px-3 py-2 rounded-xl text-xs font-bold text-[#0c2b3d] bg-[#0c2b3d]/10 hover:bg-[#0c2b3d]/15 border border-[#0c2b3d]/20 shadow-2xs transition flex items-center gap-1.5">
          <span>🎯</span> Mapping BAB & TP
        </RouterLink>
        <div>
          <h2 class="font-extrabold text-slate-900 text-sm leading-tight flex items-center gap-2">
            <span>📊</span> Rekapitulasi Nilai Siswa ({{ selectedSubjectName }})
          </h2>
          <span class="text-[11px] text-slate-500 font-medium">
            {{ stats.school_name || currentSchoolName }} &bull; {{ stats.teacher_name || teacherName }} (NIP: {{ stats.teacher_nip || teacherNip }})
          </span>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <!-- Filter Kelas -->
        <select
          v-model="selectedClassId"
          @change="onClassChange"
          class="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
        >
          <option v-for="c in classrooms" :key="c.id" :value="c.id">
            {{ formatClassLabel(c) }}
          </option>
        </select>

        <!-- Filter Mata Pelajaran (Otomatis sinkron dengan jadwal kelas) -->
        <select
          v-model="selectedSubjectId"
          @change="onSubjectChange"
          class="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
        >
          <option v-for="sub in availableSubjects" :key="sub.id" :value="sub.id">
            {{ sub.name }}
          </option>
        </select>

        <!-- Pengaturan KKTP Dinamis -->
        <div class="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
          <label class="text-[11px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer">
            <span>🎯</span> KKTP:
          </label>
          <input
            v-model.number="currentKktp"
            @change="handleKktpChange"
            type="number"
            min="40"
            max="100"
            step="1"
            class="w-12 px-1 py-0.5 rounded-lg bg-white border border-slate-300 font-black text-xs text-blue-700 text-center shadow-2xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            title="Ubah nilai batas Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)"
          />
          <button
            v-if="isKktpDirty"
            @click="saveKktpChange"
            :disabled="isSavingKktp"
            class="px-2 py-0.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] transition flex items-center gap-1 shadow-xs"
            title="Simpan KKTP baru ke server"
          >
            <span>💾</span> {{ isSavingKktp ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>

        <!-- Toggle View Mode: Ledger vs Print Document -->
        <div class="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            @click="viewMode = 'ledger'"
            class="px-3 py-1 rounded-lg transition"
            :class="viewMode === 'ledger' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
          >
            📋 Ledger Nilai
          </button>
          <button
            @click="viewMode = 'print'"
            class="px-3 py-1 rounded-lg transition"
            :class="viewMode === 'print' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
          >
            📄 Lembar Cetak Resmi
          </button>
        </div>

        <!-- Link ke Rekap Nilai per Event Ulangan -->
        <RouterLink
          to="/reports/exam-events"
          class="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition flex items-center gap-1 shadow-xs"
        >
          <span>📥</span> Rekap Nilai per Event Ulangan
        </RouterLink>

        <!-- Live Ranking Button -->
        <RouterLink
          to="/rankings"
          class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition flex items-center gap-1 shadow-xs"
        >
          <span>🏆</span> Live Ranking Kelas
        </RouterLink>

        <!-- Input Nilai Luar Aplikasi (Tugas & Ulangan Offline / Lampau) -->
        <button
          @click="openCreateOfflineModal()"
          class="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition flex items-center gap-1.5 shadow-md border border-emerald-700 active:scale-95"
          style="background-color: #059669 !important; color: #ffffff !important;"
          title="Input nilai tugas, ulangan harian, atau ujian yang diambil di luar sistem / offline / lampau"
        >
          <span>📝</span> <span>Input Penilaian Luar Aplikasi</span>
        </button>

        <!-- Riwayat Nilai Luar Aplikasi -->
        <button
          @click="openManageOfflineModal"
          class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center gap-1.5 shadow-xs border border-slate-300"
          title="Kelola riwayat tugas dan ulangan luar aplikasi"
        >
          <span>📁</span> <span>Riwayat Nilai Offline</span>
          <span
            v-if="offlineAssessmentsList.length > 0"
            class="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black"
          >
            {{ offlineAssessmentsList.length }}
          </span>
        </button>

        <!-- Input Nilai Siswa Manual Button -->
        <button
          @click="openAddGrade"
          class="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1 shadow-xs"
        >
          <span>➕</span> Input Nilai Siswa
        </button>

        <!-- Upload Nilai Excel Button -->
        <button
          @click="openUploadExcelModal"
          class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1 shadow-xs"
        >
          <span>📤</span> Upload Nilai (Excel)
        </button>

        <!-- Export CSV Button -->
        <button
          @click="exportCsv"
          class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1 shadow-xs"
        >
          <span>📥</span> Ekspor Excel
        </button>

        <!-- Print Button -->
        <button
          @click="printReport"
          class="btn btn-secondary text-xs px-4 py-1.5 flex items-center gap-1.5 font-bold shadow-sm"
        >
          <span>🖨️</span> Cetak Rekap Nilai
        </button>
      </div>
    </div>

    <!-- Class Statistics Summary Bar (Hidden during Print) -->
    <!-- Class Statistics Summary Bar (Hidden during Print) -->
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 print:hidden">
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-center">
        <span class="text-[10px] uppercase font-bold text-slate-400">Total Siswa</span>
        <p class="text-xl font-black text-slate-800 mt-0.5">{{ gradesList.length }}</p>
      </div>
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-center">
        <span class="text-[10px] uppercase font-bold text-slate-400">Rata-rata Kelas</span>
        <p class="text-xl font-black mt-0.5" :class="gradesList.length > 0 && computedStats.average_score > 0 ? 'text-blue-600' : 'text-slate-400'">
          {{ gradesList.length > 0 && computedStats.average_score > 0 ? computedStats.average_score : '—' }}
        </p>
      </div>
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-center">
        <span class="text-[10px] uppercase font-bold text-slate-400">Nilai Tertinggi</span>
        <p class="text-xl font-black mt-0.5" :class="gradesList.length > 0 && computedStats.highest_score > 0 ? 'text-emerald-600' : 'text-slate-400'">
          {{ gradesList.length > 0 && computedStats.highest_score > 0 ? computedStats.highest_score : '—' }}
        </p>
      </div>
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-center">
        <span class="text-[10px] uppercase font-bold text-slate-400">Nilai Terendah</span>
        <p class="text-xl font-black mt-0.5" :class="gradesList.length > 0 && computedStats.lowest_score > 0 ? 'text-amber-600' : 'text-slate-400'">
          {{ gradesList.length > 0 && computedStats.lowest_score > 0 ? computedStats.lowest_score : '—' }}
        </p>
      </div>
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-center col-span-2 sm:col-span-1">
        <span class="text-[10px] uppercase font-bold text-slate-400">Ketuntasan KKTP (&gt;={{ currentKktp }})</span>
        <p class="text-xl font-black mt-0.5" :class="gradesList.length > 0 && computedStats.pass_rate > 0 ? 'text-emerald-600' : 'text-slate-400'">
          {{ gradesList.length > 0 && computedStats.pass_rate > 0 ? `${computedStats.pass_rate}%` : '—' }}
        </p>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- VIEW 1: INTERACTIVE LEDGER TABLE (SCREEN VIEW) -->
    <!-- ============================================================== -->
    <div v-if="viewMode === 'ledger'" class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print:hidden">
      <div class="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 class="font-bold text-sm text-slate-900">
            Ledger Nilai: {{ getSubjectName(selectedSubjectId) }}
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">
            Kelas {{ getClassName(selectedClassId) }} &bull; Semester Ganjil 2024/2025 &bull; Pembobotan: Formatif (30%) + Sumatif TP (30%) + STS (20%) + SAS (20%)
          </p>
        </div>
        <div class="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-xl px-2.5 py-1">
          <span class="text-[11px] font-bold text-blue-700">🎯 Target KKTP:</span>
          <input
            v-model.number="currentKktp"
            @change="handleKktpChange"
            type="number"
            min="40"
            max="100"
            class="w-12 px-1 py-0.5 text-center font-black text-xs text-blue-900 bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            v-if="isKktpDirty"
            @click="saveKktpChange"
            :disabled="isSavingKktp"
            class="px-2 py-0.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] transition"
          >
            {{ isSavingKktp ? '...' : 'Simpan' }}
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-100/80 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <th class="py-3 px-3 w-10 text-center">No</th>
              <th class="py-3 px-3 w-28">NIS / NISN</th>
              <th class="py-3 px-4 min-w-[180px]">Nama Siswa</th>
              <th class="py-3 px-2 w-10 text-center">L/P</th>
              <th class="py-3 px-3 text-center bg-blue-50/40 min-w-[130px]">
                Formatif (30%)
                <div class="text-[9px] font-normal normal-case text-blue-600">Absen 40% + Tugas 60%</div>
              </th>
              <th class="py-3 px-3 text-center bg-indigo-50/40 w-24">Sumatif TP (30%)</th>
              <th class="py-3 px-3 text-center bg-amber-50/40 w-20">STS (20%)</th>
              <th class="py-3 px-3 text-center bg-purple-50/40 w-20">SAS (20%)</th>
              <th class="py-3 px-3 text-center font-black text-slate-900 w-16">NA</th>
              <th class="py-3 px-2 text-center w-12">Predikat</th>
              <th class="py-3 px-3 text-center w-24">Status KKTP</th>
              <th class="py-3 px-4 min-w-[260px]">Capaian Kompetensi Kurikulum Merdeka</th>
              <th class="py-3 px-3 text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="(row, idx) in gradesList"
              :key="row.id"
              class="hover:bg-slate-50 transition"
            >
              <td class="py-3 px-3 text-center font-bold text-slate-400">{{ idx + 1 }}</td>
              <td class="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                {{ row.nis }}
              </td>
              <td class="py-3 px-4 font-bold text-slate-900">
                {{ row.student_name }}
              </td>
              <td class="py-3 px-2 text-center font-medium text-slate-500">{{ row.gender }}</td>
              
              <!-- Formatif Score (Otomatis: Absensi 40% + Tugas 60%) -->
              <td class="py-3 px-3 text-center bg-blue-50/20 font-semibold text-blue-900">
                <div class="flex flex-col items-center">
                  <span class="font-extrabold text-sm">{{ row.avg_formatif }}</span>
                  <span class="text-[9px] text-slate-500 font-medium whitespace-nowrap mt-0.5">
                    Absen: <strong class="text-blue-700">{{ row.attendance_contrib ?? Math.round((row.attendance_score || 0) * 0.4) }}</strong>
                    <span class="text-slate-400">({{ row.attendance_score ?? 0 }}%)</span>
                    &bull; Tugas: <strong class="text-indigo-700">{{ row.tugas_contrib ?? Math.round((row.avg_tugas || 0) * 0.6) }}</strong>
                  </span>
                </div>
              </td>

              <!-- Sumatif TP Score -->
              <td class="py-3 px-3 text-center bg-indigo-50/20 font-semibold text-indigo-900">
                <span v-if="row.avg_sumatif_tp && row.avg_sumatif_tp > 0">{{ row.avg_sumatif_tp }}</span>
                <span v-else class="text-slate-400 font-normal">-</span>
              </td>

              <!-- STS Score (Sumatif Tengah Semester) -->
              <td class="py-3 px-3 text-center bg-amber-50/20 font-semibold text-amber-900">
                <span v-if="row.sts && row.sts > 0">{{ row.sts }}</span>
                <span v-else class="text-slate-400 font-normal">-</span>
              </td>

              <!-- SAS Score (Sumatif Akhir Semester) -->
              <td class="py-3 px-3 text-center bg-purple-50/20 font-semibold text-purple-900">
                <span v-if="row.sas && row.sas > 0">{{ row.sas }}</span>
                <span v-else class="text-slate-400 font-normal">-</span>
              </td>

              <!-- Nilai Akhir (NA) -->
              <td class="py-3 px-3 text-center font-black text-sm text-slate-900">
                <span v-if="row.final_score && row.final_score > 0">{{ row.final_score }}</span>
                <span v-else class="text-slate-400 font-normal">-</span>
              </td>

              <!-- Predikat -->
              <td class="py-3 px-2 text-center">
                <span
                  v-if="row.final_score && row.final_score > 0"
                  class="w-6 h-6 rounded-md font-bold text-xs inline-flex items-center justify-center bg-slate-100 text-slate-800"
                >
                  {{ getGradeLetter(row.final_score) }}
                </span>
                <span v-else class="text-slate-400">-</span>
              </td>

              <!-- Status KKTP -->
              <td class="py-3 px-3 text-center">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold inline-block"
                  :class="row.final_score >= currentKktp ? 'bg-emerald-100 text-emerald-700' : (row.final_score > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500')"
                >
                  {{ row.final_score >= currentKktp ? 'Tuntas' : (row.final_score > 0 ? 'Belum Tuntas' : 'Belum Ada Nilai') }}
                </span>
              </td>

              <!-- Capaian Deskripsi -->
              <td class="py-3 px-4 text-[11px] leading-relaxed text-slate-600">
                {{ row.competency_desc }}
              </td>

              <!-- Edit & Delete Action -->
              <td class="py-3 px-3 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    @click="openEditGrade(row)"
                    class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-700 font-bold text-[11px] transition flex items-center gap-1"
                    title="Edit Nilai"
                  >
                    <span>✏️</span> Edit
                  </button>
                  <button
                    @click="deleteGrade(row)"
                    class="p-1 rounded-lg bg-slate-100 hover:bg-rose-100 hover:text-rose-700 font-bold text-[11px] transition text-rose-500"
                    title="Hapus / Reset Nilai Siswa"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="gradesList.length === 0">
              <td colspan="12" class="py-12 text-center text-slate-400">
                <div class="flex flex-col items-center justify-center gap-2">
                  <div class="text-3xl">📝</div>
                  <p class="font-bold text-slate-700 text-sm">Belum ada data nilai untuk kelas ini</p>
                  <p class="text-xs text-slate-400 max-w-sm">Mulai masukkan nilai formatif, sumatif TP, dan SAS secara manual untuk menghitung Nilai Akhir (NA).</p>
                  <div class="mt-2 flex items-center gap-2">
                    <button
                      @click="openAddGrade"
                      class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <span>➕</span> Input Nilai Siswa
                    </button>
                    <button
                      @click="openUploadExcelModal"
                      class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <span>📤</span> Upload Nilai (Excel)
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- VIEW 2: LEMBAR REKAP NILAI RESMI CETAK (PRINT & DOCUMENT VIEW) -->
    <!-- ============================================================== -->
    <div
      v-if="viewMode === 'print' || true"
      class="bg-white p-8 sm:p-12 max-w-5xl mx-auto border border-slate-200 shadow-xl space-y-6 print:shadow-none print:border-none print:p-0 print:max-w-none"
      :class="{ 'hidden print:block': viewMode === 'ledger' }"
    >
      <!-- Kop Dokumen Resmi Dinas & Sekolah -->
      <div class="text-center pb-4 border-b-2 border-slate-900 space-y-1">
        <p class="text-xs uppercase font-extrabold tracking-widest text-slate-600">
          {{ schoolInfo.institution || 'PEMERINTAH KOTA KENDARI' }} &bull; {{ schoolInfo.department || 'DINAS PENDIDIKAN DAN KEBUDAYAAN' }}
        </p>
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-wide">
          {{ stats.school_name || currentSchoolName }}
        </h1>
        <p class="text-xs text-slate-600">
          {{ schoolInfo.address || 'Alamat Satuan Pendidikan' }} &bull; Telp: {{ schoolInfo.phone || '-' }} &bull; NPSN: {{ schoolInfo.npsn || '-' }}
        </p>
        <div class="pt-3">
          <h2 class="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900 underline">
            REKAPITULASI PENILAIAN HASIL BELAJAR PESERTA DIDIK (KURIKULUM MERDEKA)
          </h2>
          <p class="text-xs font-bold text-slate-700 mt-0.5">
            Mata Pelajaran: {{ getSubjectName(selectedSubjectId) }} &bull; Semester Ganjil Tahun Ajaran 2024/2025
          </p>
        </div>
      </div>

      <!-- Identitas Kelas & Guru Pengampu -->
      <div class="grid grid-cols-2 gap-4 text-xs">
        <table class="w-full text-slate-800">
          <tbody>
            <tr>
              <td class="w-36 py-1 font-semibold text-slate-600">Satuan Pendidikan</td>
              <td class="w-4 py-1">:</td>
              <td class="py-1 font-bold">{{ stats.school_name || currentSchoolName }}</td>
            </tr>
            <tr>
              <td class="py-1 font-semibold text-slate-600">Mata Pelajaran</td>
              <td class="py-1">:</td>
              <td class="py-1 font-bold text-blue-900">{{ getSubjectName(selectedSubjectId) }}</td>
            </tr>
            <tr>
              <td class="py-1 font-semibold text-slate-600">Kelas / Fase</td>
              <td class="py-1">:</td>
              <td class="py-1 font-semibold">Kelas {{ getClassName(selectedClassId) }} / Fase D</td>
            </tr>
          </tbody>
        </table>

        <table class="w-full text-xs text-slate-800">
          <tbody>
            <tr>
              <td class="w-36 py-1 font-semibold text-slate-600">Guru Pengampu</td>
              <td class="w-4 py-1">:</td>
              <td class="py-1 font-bold">{{ stats.teacher_name || teacherName }}</td>
            </tr>
            <tr>
              <td class="py-1 font-semibold text-slate-600">NIP Guru</td>
              <td class="py-1">:</td>
              <td class="py-1 font-mono font-medium">{{ stats.teacher_nip || teacherNip || '-' }}</td>
            </tr>
            <tr>
              <td class="py-1 font-semibold text-slate-600">KKTP Minimal</td>
              <td class="py-1">:</td>
              <td class="py-1 font-bold">{{ currentKktp }} ({{ terbilang(currentKktp) }})</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tabel Resmi Hasil Rekap Nilai -->
      <div>
        <table class="w-full text-left text-xs border border-slate-900">
          <thead>
            <tr class="bg-slate-100 text-slate-900 font-bold border-b border-slate-900 text-center uppercase text-[10px]">
              <th class="py-2.5 px-2 w-8 border-r border-slate-900">No</th>
              <th class="py-2.5 px-3 w-24 border-r border-slate-900">NIS</th>
              <th class="py-2.5 px-3 border-r border-slate-900 text-left">Nama Peserta Didik</th>
              <th class="py-2.5 px-2 w-8 border-r border-slate-900">L/P</th>
              <th class="py-2.5 px-2 w-14 border-r border-slate-900">NF (30%)</th>
              <th class="py-2.5 px-2 w-14 border-r border-slate-900">NS (30%)</th>
              <th class="py-2.5 px-2 w-14 border-r border-slate-900">STS (20%)</th>
              <th class="py-2.5 px-2 w-14 border-r border-slate-900">SAS (20%)</th>
              <th class="py-2.5 px-2 w-12 border-r border-slate-900 font-black">NA</th>
              <th class="py-2.5 px-2 w-10 border-r border-slate-900">Pred</th>
              <th class="py-2.5 px-3 border-r border-slate-900 w-20">KKTP</th>
              <th class="py-2.5 px-3 text-left">Deskripsi Capaian Kompetensi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800 text-[11px]">
            <tr v-for="(st, idx) in gradesList" :key="st.id">
              <td class="py-2 px-2 text-center border-r border-slate-900">{{ idx + 1 }}</td>
              <td class="py-2 px-3 font-mono border-r border-slate-900">{{ st.nis }}</td>
              <td class="py-2 px-3 font-bold text-slate-900 border-r border-slate-900">{{ st.student_name }}</td>
              <td class="py-2 px-2 text-center border-r border-slate-900">{{ st.gender }}</td>
              <td class="py-2 px-2 text-center border-r border-slate-900">{{ (st.avg_formatif && st.avg_formatif > 0) ? st.avg_formatif : '-' }}</td>
              <td class="py-2 px-2 text-center border-r border-slate-900">{{ (st.avg_sumatif_tp && st.avg_sumatif_tp > 0) ? st.avg_sumatif_tp : '-' }}</td>
              <td class="py-2 px-2 text-center border-r border-slate-900">{{ (st.sts && st.sts > 0) ? st.sts : '-' }}</td>
              <td class="py-2 px-2 text-center border-r border-slate-900">{{ (st.sas && st.sas > 0) ? st.sas : '-' }}</td>
              <td class="py-2 px-2 text-center font-black border-r border-slate-900">{{ (st.final_score && st.final_score > 0) ? st.final_score : '-' }}</td>
              <td class="py-2 px-2 text-center font-bold border-r border-slate-900">{{ (st.final_score && st.final_score > 0) ? getGradeLetter(st.final_score) : '-' }}</td>
              <td class="py-2 px-3 text-center font-bold border-r border-slate-900"
                :class="st.final_score >= currentKktp ? 'text-emerald-800' : (st.final_score > 0 ? 'text-rose-700' : 'text-slate-500')"
              >
                {{ st.final_score >= currentKktp ? 'Tuntas' : (st.final_score > 0 ? 'Belum Tuntas' : '-') }}
              </td>
              <td class="py-2 px-3 text-[10px] leading-snug text-slate-700">
                {{ st.competency_desc }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Ringkasan Statistik Rekap Nilai -->
      <div class="border border-slate-900 p-3 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50/50">
        <div><strong>Jumlah Peserta Didik:</strong> {{ computedStats.total_students }} Siswa</div>
        <div><strong>Rata-Rata Kelas:</strong> {{ computedStats.average_score }}</div>
        <div><strong>Nilai Tertinggi / Terendah:</strong> {{ computedStats.highest_score }} / {{ computedStats.lowest_score }}</div>
        <div><strong>Ketuntasan KKTP (&ge; {{ currentKktp }}):</strong> {{ computedStats.pass_rate }}% ({{ computedStats.passed_students }}/{{ computedStats.total_students }})</div>
      </div>

      <!-- Tanda Tangan Resmi Pengesahan -->
      <div class="pt-6 grid grid-cols-2 gap-8 text-xs text-slate-900 text-center">
        <div>
          <p>Mengetahui,</p>
          <p class="font-bold">Kepala {{ stats.school_name || currentSchoolName }}</p>
          <div class="h-20"></div>
          <p class="font-black underline">{{ stats.principal_name }}</p>
          <p class="text-[11px] font-mono mt-0.5">NIP. {{ stats.principal_nip }}</p>
        </div>

        <div>
          <p>{{ (stats as any).city || 'Kendari' }}, {{ printDate }}</p>
          <p class="font-bold">Guru Mata Pelajaran</p>
          <div class="h-20"></div>
          <p class="font-black underline">{{ stats.teacher_name }}</p>
          <p class="text-[11px] font-mono mt-0.5">NIP. {{ stats.teacher_nip }}</p>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL: EDIT NILAI SISWA (FORMATIF, SUMATIF TP, SAS) -->
    <!-- ============================================================== -->
    <Teleport to="body">
      <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
          <div class="p-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
            <div>
              <h3 class="font-bold text-sm">Input & Edit Nilai Siswa</h3>
              <p class="text-[11px] text-blue-200">
                {{ editingRow?.student_name || 'Pilih Nama Siswa' }} &bull; NIS: {{ editingRow?.nis || '-' }} &bull; {{ getSubjectName(selectedSubjectId) }}
              </p>
            </div>
            <button @click="showEditModal = false" class="text-white/80 hover:text-white">✕</button>
          </div>

          <div class="p-5 space-y-4 text-xs" v-if="editingRow">
            <!-- Pilih Siswa dari Kelas (Kolom Memilih Nama Siswa) -->
            <div class="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-2">
              <div class="flex items-center justify-between">
                <label class="block font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <span>👤</span> Nama Siswa & Identitas <span class="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  @click="isManualStudentInput = !isManualStudentInput"
                  class="text-[10px] text-blue-600 hover:underline font-semibold"
                >
                  {{ isManualStudentInput ? '← Pilih dari Siswa Rombel' : '+ Ketik Nama Manual' }}
                </button>
              </div>

              <!-- Pilihan Dropdown Siswa Terdaftar -->
              <div v-if="!isManualStudentInput">
                <select
                  v-model="selectedStudentId"
                  @change="handleStudentSelect"
                  class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  <option value="" disabled>-- Pilih Nama Siswa Terdaftar --</option>
                  <option
                    v-for="s in classStudents"
                    :key="s.id"
                    :value="s.id"
                  >
                    {{ s.name }} (NIS: {{ s.nis || '-' }})
                  </option>
                </select>
                <div v-if="classStudents.length === 0" class="mt-1.5 p-2 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800 flex items-center justify-between">
                  <span>Belum ada siswa terdaftar di rombel ini.</span>
                  <button type="button" @click="isManualStudentInput = true" class="underline font-bold">Ketik manual →</button>
                </div>
              </div>

              <!-- Input Manual Nama Siswa -->
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <span class="text-[10px] text-slate-500">Nama Siswa <span class="text-rose-500">*</span></span>
                  <input
                    v-model="editingRow.student_name"
                    type="text"
                    placeholder="Contoh: Muhammad Fadly"
                    class="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-xs"
                    required
                  />
                </div>
                <div>
                  <span class="text-[10px] text-slate-500">Nomor Induk Siswa (NIS)</span>
                  <input
                    v-model="editingRow.nis"
                    type="text"
                    placeholder="Contoh: 12345678"
                    class="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-xs"
                  />
                </div>
              </div>
            </div>

            <!-- Formatif (Otomatis: Kehadiran 40% + Akumulasi Tugas 60%) -->
            <div class="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200 space-y-2.5">
              <div class="flex items-center justify-between">
                <label class="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <span>📘</span> 1. Nilai Formatif (Otomatis: Absensi 40% + Tugas 60%)
                </label>
                <span class="text-xs font-black text-blue-900 bg-white px-2 py-0.5 rounded-lg border border-blue-200">
                  Total NF: {{ Math.round(((Number(editingRow.attendance_score) || 0) * 0.4) + ((Number(editingRow.avg_tugas) || 0) * 0.6)) }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-3 text-xs">
                <!-- Kehadiran / Absensi -->
                <div class="bg-white p-2.5 rounded-xl border border-blue-100">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-[11px] font-bold text-slate-700">Kehadiran (40%)</span>
                    <span class="text-[10px] text-blue-600 font-bold">
                      +{{ Math.round((Number(editingRow.attendance_score) || 0) * 0.4) }} Poin
                    </span>
                  </div>
                  <input
                    v-model.number="editingRow.attendance_score"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0 - 100"
                    class="w-full px-2.5 py-1.5 bg-slate-50 border rounded-lg font-bold text-blue-900"
                  />
                  <p class="text-[10px] text-slate-400 mt-1">
                    Pertemuan: {{ editingRow.attendance_present ?? 0 }} / {{ editingRow.attendance_total ?? 1 }} Hadir
                  </p>
                </div>

                <!-- Akumulasi Tugas -->
                <div class="bg-white p-2.5 rounded-xl border border-blue-100">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-[11px] font-bold text-slate-700">Rata-rata Tugas (60%)</span>
                    <span class="text-[10px] text-indigo-600 font-bold">
                      +{{ Math.round((Number(editingRow.avg_tugas) || 0) * 0.6) }} Poin
                    </span>
                  </div>
                  <input
                    v-model.number="editingRow.avg_tugas"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0 - 100"
                    class="w-full px-2.5 py-1.5 bg-slate-50 border rounded-lg font-bold text-indigo-900"
                  />
                  <p class="text-[10px] text-slate-400 mt-1">
                    Akumulasi tugas materi siswa
                  </p>
                </div>
              </div>
            </div>

            <!-- Sumatif Lingkup Materi TP -->
            <div>
              <label class="block font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <span>📋</span> 2. Sumatif Lingkup Materi (Bobot 40%)
              </label>
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <span class="text-[10px] text-slate-500">Sumatif TP 1</span>
                  <input v-model.number="editingRow.sumatif_tp.tp1" type="number" min="0" max="100" class="w-full px-2.5 py-1.5 bg-slate-50 border rounded-xl font-bold" />
                </div>
                <div>
                  <span class="text-[10px] text-slate-500">Sumatif TP 2</span>
                  <input v-model.number="editingRow.sumatif_tp.tp2" type="number" min="0" max="100" class="w-full px-2.5 py-1.5 bg-slate-50 border rounded-xl font-bold" />
                </div>
                <div>
                  <span class="text-[10px] text-slate-500">Sumatif TP 3</span>
                  <input v-model.number="editingRow.sumatif_tp.tp3" type="number" min="0" max="100" class="w-full px-2.5 py-1.5 bg-slate-50 border rounded-xl font-bold" />
                </div>
              </div>
            </div>

            <!-- STS & SAS -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- STS (Sumatif Tengah Semester) -->
              <div>
                <label class="block font-bold text-slate-700 mb-1 flex items-center gap-1 text-xs">
                  <span>📝</span> 3. STS Tengah Semester (20%)
                </label>
                <input v-model.number="editingRow.sts" type="number" min="0" max="100" placeholder="0 - 100" class="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold text-sm text-amber-700" />
              </div>

              <!-- SAS (Sumatif Akhir Semester) -->
              <div>
                <label class="block font-bold text-slate-700 mb-1 flex items-center gap-1 text-xs">
                  <span>🎯</span> 4. SAS Akhir Semester (20%)
                </label>
                <input v-model.number="editingRow.sas" type="number" min="0" max="100" placeholder="0 - 100" class="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold text-sm text-blue-900" />
              </div>
            </div>

            <!-- Capaian Deskripsi Rapor -->
            <div>
              <label class="block font-bold text-slate-700 mb-1">Deskripsi Capaian Kompetensi Kurikulum Merdeka</label>
              <textarea
                v-model="editingRow.competency_desc"
                rows="3"
                class="w-full px-3 py-2 bg-slate-50 border rounded-xl leading-relaxed text-[11px]"
              ></textarea>
            </div>
          </div>

          <div class="p-4 bg-slate-50 border-t flex items-center justify-end gap-2">
            <button @click="showEditModal = false" class="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-200">
              Batal
            </button>
            <button @click="saveGradeEdit" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold">
              Simpan Nilai Siswa
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ============================================================== -->
    <!-- MODAL: UPLOAD FILE NILAI EXCEL (BATCH IMPORT) -->
    <!-- ============================================================== -->
    <Teleport to="body">
      <div v-if="showUploadModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
          <div class="p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xl">📊</span>
              <div>
                <h3 class="font-bold text-sm">Upload Nilai Siswa dari Excel / CSV</h3>
                <p class="text-[11px] text-emerald-100">
                  Kelas {{ getClassName(selectedClassId) }} &bull; {{ getSubjectName(selectedSubjectId) }}
                </p>
              </div>
            </div>
            <button @click="closeUploadModal" class="text-white/80 hover:text-white">✕</button>
          </div>

          <div class="p-5 space-y-4 text-xs">
            <!-- Step 1: Download Template -->
            <div class="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p class="font-bold text-emerald-950">Unduh Format Template Nilai Siswa</p>
                <p class="text-[11px] text-emerald-800">
                  Template ini sudah memuat seluruh daftar nama & NIS siswa Kelas {{ getClassName(selectedClassId) }}.
                </p>
              </div>
              <button
                @click="downloadGradeTemplate"
                class="px-3.5 py-1.5 bg-white hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-300 rounded-xl transition text-xs shrink-0 flex items-center gap-1 shadow-xs"
              >
                <span>📥</span> Unduh Format Excel
              </button>
            </div>

            <!-- Step 2: Upload File Area -->
            <div>
              <label class="block font-bold text-slate-700 mb-1.5">Unggah Berkas Excel (.xlsx, .xls) atau CSV</label>
              <div
                @dragover.prevent
                @drop.prevent="handleUploadDrop"
                @click="triggerFileInput"
                class="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-emerald-50/30 transition"
              >
                <input
                  ref="fileInputRef"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  class="hidden"
                  @change="handleFileSelect"
                />
                <div class="text-3xl mb-1">📄</div>
                <p class="font-bold text-slate-800">
                  {{ uploadFileName ? uploadFileName : 'Klik atau Tarik File Nilai Excel ke Sini' }}
                </p>
                <p class="text-[11px] text-slate-500 mt-0.5">
                  Mendukung berkas format .xlsx, .xls, atau .csv (Maksimal 10 MB)
                </p>
              </div>
            </div>

            <!-- Preview Data Siswa & Nilai -->
            <div v-if="parsedGradesPreview.length > 0" class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-800">Pratinjau Data Nilai ({{ parsedGradesPreview.length }} Siswa):</span>
                <span class="text-[11px] text-emerald-700 font-bold">Siap Disimpan</span>
              </div>
              <div class="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                <table class="w-full text-left text-[11px]">
                  <thead class="bg-slate-100 text-slate-700 font-bold sticky top-0">
                    <tr>
                      <th class="py-2 px-2.5">Nama Siswa</th>
                      <th class="py-2 px-2 text-center">NIS</th>
                      <th class="py-2 px-2 text-center">Formatif</th>
                      <th class="py-2 px-2 text-center">Sumatif TP</th>
                      <th class="py-2 px-2 text-center">STS</th>
                      <th class="py-2 px-2 text-center">SAS</th>
                      <th class="py-2 px-2 text-center">Nilai Akhir</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="(row, idx) in parsedGradesPreview" :key="idx" class="hover:bg-slate-50">
                      <td class="py-1.5 px-2.5 font-bold text-slate-800">{{ row.student_name }}</td>
                      <td class="py-1.5 px-2 text-center font-mono text-slate-600">{{ row.nis || '-' }}</td>
                      <td class="py-1.5 px-2 text-center">{{ row.avg_formatif }}</td>
                      <td class="py-1.5 px-2 text-center">{{ row.avg_sumatif_tp }}</td>
                      <td class="py-1.5 px-2 text-center font-semibold text-amber-700">{{ row.sts ?? '-' }}</td>
                      <td class="py-1.5 px-2 text-center font-semibold text-purple-700">{{ row.sas }}</td>
                      <td class="py-1.5 px-2 text-center font-black text-emerald-700">{{ row.final_score }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="p-4 bg-slate-50 border-t flex items-center justify-end gap-2">
            <button @click="closeUploadModal" class="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-200">
              Batal
            </button>
            <button
              :disabled="parsedGradesPreview.length === 0 || isSavingBatch"
              @click="saveBatchGrades"
              class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold transition flex items-center gap-1.5"
            >
              <span v-if="isSavingBatch">Menyimpan...</span>
              <span v-else>Simpan & Terapkan Nilai Rapor</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ============================================================== -->
    <!-- MODAL 1: FORM INPUT / EDIT PENILAIAN LUAR APLIKASI (OFFLINE/LAMPAU) -->
    <!-- ============================================================== -->
    <Teleport to="body">
      <div v-if="showOfflineFormModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 my-auto animate-in fade-in zoom-in-95 flex flex-col max-h-[92vh]">
          <!-- Modal Header -->
          <div class="p-5 bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 text-white flex items-center justify-between shrink-0">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">📝</span>
              <div>
                <h3 class="font-bold text-sm">
                  {{ editingOfflineId ? 'Edit Penilaian Luar Aplikasi' : 'Input Penilaian Luar Aplikasi (Tugas & Ulangan Offline / Lampau)' }}
                </h3>
                <p class="text-[11px] text-teal-100 mt-0.5">
                  Rombel: <strong>Kelas {{ getClassName(selectedClassId) }}</strong> &bull; {{ getSubjectName(selectedSubjectId) }}
                </p>
              </div>
            </div>
            <button @click="showOfflineFormModal = false" class="text-white/80 hover:text-white p-1 rounded-lg">✕</button>
          </div>

          <!-- Modal Scrollable Content -->
          <div class="p-5 space-y-4 text-xs overflow-y-auto flex-1">
            <!-- Pilihan Jenis Penilaian (4 Tipe) -->
            <div>
              <label class="block font-bold text-slate-800 mb-1.5 uppercase text-[10px] tracking-wider">
                1. Pilih Kategori Penilaian di Rapor <span class="text-rose-500">*</span>
              </label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  @click="offlineForm.type = 'tugas'"
                  class="p-2.5 rounded-2xl border-2 text-left transition flex flex-col justify-between gap-1"
                  :class="offlineForm.type === 'tugas' ? 'border-teal-600 bg-teal-50/70 text-teal-900 shadow-xs' : 'border-slate-200 hover:border-slate-300 text-slate-700'"
                >
                  <span class="text-base">📝</span>
                  <div>
                    <strong class="block font-bold text-xs">Formatif: Tugas</strong>
                    <span class="text-[10px] text-slate-500 leading-tight">Bobot 60% Formatif</span>
                  </div>
                </button>

                <button
                  type="button"
                  @click="offlineForm.type = 'ulangan_tp'"
                  class="p-2.5 rounded-2xl border-2 text-left transition flex flex-col justify-between gap-1"
                  :class="offlineForm.type === 'ulangan_tp' ? 'border-purple-600 bg-purple-50/70 text-purple-900 shadow-xs' : 'border-slate-200 hover:border-slate-300 text-slate-700'"
                >
                  <span class="text-base">📋</span>
                  <div>
                    <strong class="block font-bold text-xs">Sumatif TP</strong>
                    <span class="text-[10px] text-slate-500 leading-tight">Ulangan Harian (30%)</span>
                  </div>
                </button>

                <button
                  type="button"
                  @click="offlineForm.type = 'sts'"
                  class="p-2.5 rounded-2xl border-2 text-left transition flex flex-col justify-between gap-1"
                  :class="offlineForm.type === 'sts' ? 'border-amber-600 bg-amber-50/70 text-amber-900 shadow-xs' : 'border-slate-200 hover:border-slate-300 text-slate-700'"
                >
                  <span class="text-base">📊</span>
                  <div>
                    <strong class="block font-bold text-xs">STS Tertulis</strong>
                    <span class="text-[10px] text-slate-500 leading-tight">Tengah Semester (20%)</span>
                  </div>
                </button>

                <button
                  type="button"
                  @click="offlineForm.type = 'sas'"
                  class="p-2.5 rounded-2xl border-2 text-left transition flex flex-col justify-between gap-1"
                  :class="offlineForm.type === 'sas' ? 'border-rose-600 bg-rose-50/70 text-rose-900 shadow-xs' : 'border-slate-200 hover:border-slate-300 text-slate-700'"
                >
                  <span class="text-base">🎯</span>
                  <div>
                    <strong class="block font-bold text-xs">SAS Tertulis</strong>
                    <span class="text-[10px] text-slate-500 leading-tight">Akhir Semester (20%)</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Detail Informasi Asesmen -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="sm:col-span-2">
                <label class="block font-bold text-slate-700 mb-1">
                  Nama / Judul Tugas atau Ulangan <span class="text-rose-500">*</span>
                </label>
                <input
                  v-model="offlineForm.title"
                  type="text"
                  placeholder="Misal: Ulangan Harian 1: Logika Pemrograman (Kertas)"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">
                  Tanggal Pelaksanaan / Nilai Diambil
                </label>
                <input
                  v-model="offlineForm.assessment_date"
                  type="date"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <p class="text-[10px] text-slate-400 mt-0.5">Bisa tanggal lampau</p>
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Catatan Tambahan / Lingkup Materi (Opsional)</label>
              <input
                v-model="offlineForm.description"
                type="text"
                placeholder="Misal: Penilaian buku catatan atau ulangan luring sebelum sistem LMS dipakai"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <!-- Quick Batch Fill Toolbar -->
            <div class="p-3 bg-teal-50/80 rounded-2xl border border-teal-200 flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-teal-900">⚡ Isi Cepat Seluruh Siswa:</span>
                <input
                  v-model.number="batchFillScore"
                  type="number"
                  min="0"
                  max="100"
                  class="w-16 px-2 py-1 text-center font-bold text-xs bg-white border border-teal-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <button
                  type="button"
                  @click="applyBatchFill"
                  class="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition shadow-2xs"
                >
                  Terapkan ke Semua
                </button>
                <button
                  type="button"
                  @click="clearAllScores"
                  class="px-2.5 py-1 text-slate-500 hover:text-rose-600 text-xs font-medium"
                >
                  Kosongkan
                </button>
              </div>

              <!-- Live Stats -->
              <div class="flex items-center gap-3 text-[11px] font-bold text-teal-900">
                <span>Dinilai: <strong>{{ offlineStatsLive.scored }}</strong> / {{ offlineStatsLive.total }}</span>
                <span>Rata-rata: <strong>{{ offlineStatsLive.avg }}</strong></span>
                <span>Tuntas KKTP: <strong>{{ offlineStatsLive.passed }}</strong></span>
              </div>
            </div>

            <!-- Tabel Pengisian Nilai Siswa -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                  Daftar Nilai Peserta Didik ({{ offlineStudentScores.length }} Siswa)
                </span>
                <span class="text-[11px] text-slate-400">Kosongkan siswa yang belum memiliki nilai</span>
              </div>

              <div class="border border-slate-200 rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200 text-[10px] uppercase">
                    <tr>
                      <th class="py-2.5 px-3 w-10 text-center">No</th>
                      <th class="py-2.5 px-3 w-20 text-center">NIS</th>
                      <th class="py-2.5 px-4">Nama Siswa</th>
                      <th class="py-2.5 px-2 w-10 text-center">L/P</th>
                      <th class="py-2.5 px-3 w-24 text-center">Nilai (0-100)</th>
                      <th class="py-2.5 px-3 w-24 text-center">Status KKTP</th>
                      <th class="py-2.5 px-3">Catatan Khusus (Opsional)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr
                      v-for="(stu, idx) in offlineStudentScores"
                      :key="stu.student_id"
                      class="hover:bg-slate-50 transition"
                    >
                      <td class="py-2 px-3 text-center text-slate-400 font-bold">{{ idx + 1 }}</td>
                      <td class="py-2 px-3 text-center font-mono text-[11px] text-slate-500">{{ stu.nis || '—' }}</td>
                      <td class="py-2 px-4 font-bold text-slate-900">{{ stu.student_name }}</td>
                      <td class="py-2 px-2 text-center text-slate-500">{{ stu.gender }}</td>
                      <td class="py-2 px-3 text-center">
                        <input
                          v-model.number="stu.score"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="—"
                          class="w-16 px-2 py-1 text-center font-black text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          :class="stu.score !== null && stu.score >= currentKktp ? 'text-teal-700 bg-teal-50/40' : (stu.score !== null ? 'text-rose-600 bg-rose-50/40' : 'text-slate-400')"
                        />
                      </td>
                      <td class="py-2 px-3 text-center">
                        <span
                          v-if="stu.score !== null && !isNaN(Number(stu.score))"
                          class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          :class="stu.score >= currentKktp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'"
                        >
                          {{ stu.score >= currentKktp ? 'Tuntas' : 'Belum' }}
                        </span>
                        <span v-else class="text-slate-400 text-[10px]">—</span>
                      </td>
                      <td class="py-2 px-3">
                        <input
                          v-model="stu.notes"
                          type="text"
                          placeholder="Misal: Remedial / Pengayaan"
                          class="w-full px-2 py-1 text-[11px] rounded-lg border border-slate-200 bg-slate-50"
                        />
                      </td>
                    </tr>
                    <tr v-if="offlineStudentScores.length === 0">
                      <td colspan="7" class="py-8 text-center text-slate-400">
                        Tidak ada siswa terdaftar di rombel ini.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-4 bg-slate-50 border-t flex items-center justify-between shrink-0">
            <span class="text-[11px] text-slate-500">
              Nilai otomatis digabungkan ke 1 buku rekap nilai rapor & live ranking
            </span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="showOfflineFormModal = false"
                class="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="button"
                :disabled="isSavingOffline"
                @click="saveOfflineAssessment"
                class="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <span>💾</span>
                <span v-if="isSavingOffline">Menyimpan...</span>
                <span v-else>Simpan & Gabungkan ke Rekap Nilai</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ============================================================== -->
    <!-- MODAL 2: DAFTAR RIWAYAT PENILAIAN LUAR APLIKASI (MANAGE OFFLINE) -->
    <!-- ============================================================== -->
    <Teleport to="body">
      <div v-if="showManageOfflineModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
          <!-- Modal Header -->
          <div class="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">📁</span>
              <div>
                <h3 class="font-bold text-sm">Riwayat Penilaian Luar Aplikasi (Offline / Lampau)</h3>
                <p class="text-[11px] text-slate-300 mt-0.5">
                  Kelas {{ getClassName(selectedClassId) }} &bull; {{ getSubjectName(selectedSubjectId) }}
                </p>
              </div>
            </div>
            <button @click="showManageOfflineModal = false" class="text-white/80 hover:text-white p-1 rounded-lg">✕</button>
          </div>

          <!-- Body -->
          <div class="p-5 space-y-4 text-xs overflow-y-auto flex-1">
            <div class="flex items-center justify-between pb-2 border-b border-slate-200">
              <p class="text-slate-600">
                Berikut daftar penugasan dan ulangan yang dilakukan secara fisik / di luar sistem, yang nilainya telah digabungkan ke Rekap Nilai Rapor:
              </p>
              <button
                @click="openCreateOfflineModal()"
                class="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition flex items-center gap-1 shrink-0 shadow-2xs"
              >
                <span>➕</span> Input Penilaian Baru
              </button>
            </div>

            <!-- List Table -->
            <div class="overflow-x-auto border border-slate-200 rounded-2xl">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th class="py-3 px-3 w-10 text-center">No</th>
                    <th class="py-3 px-3 w-28">Tanggal</th>
                    <th class="py-3 px-4">Nama Penilaian Luar Aplikasi</th>
                    <th class="py-3 px-3 text-center w-36">Kategori Rapor</th>
                    <th class="py-3 px-3 text-center w-24">Jumlah Siswa</th>
                    <th class="py-3 px-3 text-center w-24">Rata-rata</th>
                    <th class="py-3 px-3 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr
                    v-for="(asst, idx) in offlineAssessmentsList"
                    :key="asst.id"
                    class="hover:bg-slate-50 transition"
                  >
                    <td class="py-3 px-3 text-center font-bold text-slate-400">{{ idx + 1 }}</td>
                    <td class="py-3 px-3 font-medium text-slate-600 whitespace-nowrap">
                      {{ asst.assessment_date || asst.created_at?.split('T')[0] }}
                    </td>
                    <td class="py-3 px-4">
                      <div class="font-bold text-slate-900">{{ asst.title }}</div>
                      <div v-if="asst.description" class="text-[11px] text-slate-500 mt-0.5">{{ asst.description }}</div>
                    </td>
                    <td class="py-3 px-3 text-center">
                      <span
                        class="px-2 py-0.5 rounded-full text-[10px] font-bold inline-block"
                        :class="
                          asst.type === 'tugas' ? 'bg-teal-100 text-teal-800' :
                          asst.type === 'ulangan_tp' ? 'bg-purple-100 text-purple-800' :
                          asst.type === 'sts' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        "
                      >
                        {{ asst.category || asst.type }}
                      </span>
                    </td>
                    <td class="py-3 px-3 text-center font-medium">
                      {{ asst.scored_count || asst.scores?.length || 0 }} / {{ asst.total_students || classStudents.length }}
                    </td>
                    <td class="py-3 px-3 text-center">
                      <span class="font-black text-slate-800">{{ asst.average_score || '—' }}</span>
                    </td>
                    <td class="py-3 px-3 text-center">
                      <div class="flex items-center justify-center gap-1.5">
                        <button
                          @click="openEditOfflineModal(asst)"
                          class="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition"
                          title="Edit Data Nilai"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          @click="deleteOfflineAssessment(asst)"
                          class="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition"
                          title="Hapus Penilaian Ini"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="offlineAssessmentsList.length === 0">
                    <td colspan="7" class="py-12 text-center text-slate-400">
                      <div class="flex flex-col items-center justify-center gap-2">
                        <span class="text-3xl">📁</span>
                        <p class="font-bold text-slate-700">Belum ada penilaian luar aplikasi untuk kelas ini</p>
                        <p class="text-xs text-slate-400 max-w-sm">
                          Input nilai tugas praktikum, PR, atau ulangan harian kertas yang dilakukan di luar aplikasi agar digabungkan ke rapor.
                        </p>
                        <button
                          @click="openCreateOfflineModal()"
                          class="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition shadow-xs"
                        >
                          ➕ Input Penilaian Baru
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-4 bg-slate-50 border-t flex items-center justify-end">
            <button
              @click="showManageOfflineModal = false"
              class="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/services/api'
import * as XLSX from 'xlsx'
import { useClassrooms } from '@/composables/useClassrooms'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const currentSchoolName = computed(() => authStore.currentSchool?.name || 'Satuan Pendidikan')
const teacherName = computed(() => authStore.user?.name || 'Guru Pengampu')
const teacherNip = computed(() => (authStore.user as any)?.nip || '-')
const schoolInfo = computed(() => authStore.currentSchool || { name: currentSchoolName.value, principal_name: 'Kepala Sekolah', principal_nip: '-', city: 'Kendari', institution: 'Pemerintah Kota Kendari', department: 'Dinas Pendidikan dan Kebudayaan', address: 'Alamat Satuan Pendidikan', phone: '-', npsn: '-' })
const selectedSubjectName = computed(() => getSubjectName(selectedSubjectId.value))

const {
  classrooms,
  subjects,
  fetchClassrooms,
  formatClassLabel,
  getClassName,
  getSubjectIdForClass,
  getAvailableSubjectsForClass,
  filterClassroomsBySubject
} = useClassrooms()

const selectedClassId = ref('cls-7a')
const selectedSubjectId = ref(getSubjectIdForClass(selectedClassId.value))
const availableSubjects = computed(() => getAvailableSubjectsForClass(selectedClassId.value))
const viewMode = ref<'ledger' | 'print'>('ledger')

const currentKktp = ref(75)
const isKktpDirty = ref(false)
const isSavingKktp = ref(false)

function getKktpStatus(score: number): 'Tuntas' | 'Perlu Bimbingan' {
  return (Number(score) || 0) >= currentKktp.value ? 'Tuntas' : 'Perlu Bimbingan'
}

function getGradeLetter(score: number): string {
  const s = Number(score) || 0
  const k = currentKktp.value
  if (s >= 90) return 'A'
  if (s >= 80) return 'B'
  if (s >= k) return 'C'
  return 'D'
}

function terbilang(n: number): string {
  const angka = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas']
  const num = Math.round(n)
  if (num < 12) return angka[num]
  if (num < 20) return terbilang(num - 10) + ' Belas'
  if (num < 100) return terbilang(Math.floor(num / 10)) + ' Puluh' + (num % 10 !== 0 ? ' ' + terbilang(num % 10) : '')
  if (num === 100) return 'Seratus'
  return String(num)
}

const computedStats = computed(() => {
  const list = gradesList.value
  const total = list.length
  if (total === 0) return { ...stats.value, kktp: currentKktp.value }
  const scores = list.map(g => Number(g.final_score) || 0)
  const avg = Math.round((scores.reduce((a, b) => a + b, 0) / total) * 10) / 10
  const highest = Math.max(...scores)
  const lowest = Math.min(...scores)
  const passed = list.filter(g => (Number(g.final_score) || 0) >= currentKktp.value).length
  const passRate = Math.round((passed / total) * 100)
  return {
    ...stats.value,
    kktp: currentKktp.value,
    total_students: total,
    average_score: avg,
    highest_score: highest,
    lowest_score: lowest,
    passed_students: passed,
    pass_rate: passRate
  }
})

function handleKktpChange() {
  if (currentKktp.value < 10) currentKktp.value = 10
  if (currentKktp.value > 100) currentKktp.value = 100
  isKktpDirty.value = true
}

async function saveKktpChange() {
  isSavingKktp.value = true
  try {
    await api.post('/reports/grades/kktp', {
      subject_id: selectedSubjectId.value,
      classroom_id: selectedClassId.value,
      kktp: currentKktp.value
    })
    isKktpDirty.value = false
    await fetchGrades()
  } catch (err: any) {
    console.error('Failed to save KKTP:', err)
    alert('Gagal menyimpan KKTP: ' + (err.message || 'Terjadi kesalahan'))
  } finally {
    isSavingKktp.value = false
  }
}

async function onSubjectChange() {
  isKktpDirty.value = false
  const validClasses = filterClassroomsBySubject(classrooms.value, selectedSubjectId.value)
  if (!validClasses.some(c => c.id === selectedClassId.value) && validClasses.length > 0) {
    selectedClassId.value = validClasses[0].id
    await onClassChange()
    return
  }
  await Promise.all([fetchGrades(), fetchOfflineAssessments()])
}

const gradesList = ref<any[]>([])
const classStudents = ref<any[]>([])
const selectedStudentId = ref('')
const isManualStudentInput = ref(false)

const stats = ref<any>({
  kktp: 75,
  total_students: 0,
  average_score: 0,
  highest_score: 0,
  lowest_score: 0,
  passed_students: 0,
  pass_rate: 0,
  teacher_name: '',
  teacher_nip: '',
  school_name: '',
  principal_name: '',
  principal_nip: ''
})

const showEditModal = ref(false)
const editingRow = ref<any>(null)

// State Upload Excel
const showUploadModal = ref(false)
const uploadFileName = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const parsedGradesPreview = ref<any[]>([])
const isSavingBatch = ref(false)

const printDate = new Date().toLocaleDateString('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})

async function fetchGrades() {
  try {
    const res = await api.get('/reports/grades', {
      params: {
        classroom_id: selectedClassId.value,
        subject_id: selectedSubjectId.value,
        kktp: currentKktp.value
      }
    })
    if (res.data?.data) {
      gradesList.value = res.data.data.grades || []
      stats.value = res.data.data.stats || stats.value
      if (res.data.data.stats?.kktp && !isKktpDirty.value) {
        currentKktp.value = Number(res.data.data.stats.kktp) || 75
      }
    }
  } catch (err) {
    console.error('Failed to load grades recap:', err)
  }
}

async function fetchClassStudents() {
  try {
    const res = await api.get('/students', {
      params: {
        classroom_id: selectedClassId.value,
        per_page: 100
      }
    })
    classStudents.value = (res as any)?.data?.data || (res as any)?.data || []
  } catch (err) {
    console.error('Failed to load class students:', err)
    classStudents.value = []
  }
}

async function onClassChange() {
  isKktpDirty.value = false
  selectedSubjectId.value = getSubjectIdForClass(selectedClassId.value)
  await Promise.all([fetchGrades(), fetchClassStudents(), fetchOfflineAssessments()])
}

watch(selectedClassId, async (newClassId) => {
  if (newClassId) {
    const autoSubId = getSubjectIdForClass(newClassId)
    if (autoSubId && selectedSubjectId.value !== autoSubId) {
      selectedSubjectId.value = autoSubId
      await onClassChange()
    }
  }
})

onMounted(async () => {
  try {
    const schRes = await api.get('/school')
    if (schRes.data?.data) {
      const s = schRes.data.data
      stats.value.school_name = s.name || stats.value.school_name
      stats.value.principal_name = s.principal_name || stats.value.principal_name
      stats.value.principal_nip = s.principal_nip || stats.value.principal_nip
      if (s.city) (stats.value as any).city = s.city
    }
    if (authStore.user?.name) {
      stats.value.teacher_name = authStore.user.name
      stats.value.teacher_nip = (authStore.user as any).nip || stats.value.teacher_nip
    }
  } catch {}

  await fetchClassrooms()
  if (classrooms.value.length > 0 && !classrooms.value.some(c => c.id === selectedClassId.value)) {
    selectedClassId.value = classrooms.value[0].id
  }
  selectedSubjectId.value = getSubjectIdForClass(selectedClassId.value)
  await onClassChange()
})

function openEditGrade(row: any) {
  isManualStudentInput.value = false
  editingRow.value = JSON.parse(JSON.stringify(row))
  const found = classStudents.value.find(s => s.id === row.student_id || (s.nis && s.nis === row.nis) || s.name === row.student_name)
  selectedStudentId.value = found ? found.id : ''
  showEditModal.value = true
}

function openAddGrade() {
  isManualStudentInput.value = false
  // Temukan siswa pertama yang belum memiliki nilai
  const unrecorded = classStudents.value.find(s => !gradesList.value.some(g => g.student_id === s.id || (g.nis && g.nis === s.nis)))
  const defaultStudent = unrecorded || classStudents.value[0] || null

  selectedStudentId.value = defaultStudent ? defaultStudent.id : ''

  editingRow.value = {
    id: `grd-${Date.now()}`,
    classroom_id: selectedClassId.value,
    classroom_name: getClassName(selectedClassId.value),
    subject_id: selectedSubjectId.value,
    subject_name: getSubjectName(selectedSubjectId.value),
    student_id: defaultStudent ? defaultStudent.id : '',
    student_name: defaultStudent ? defaultStudent.name : '',
    nis: defaultStudent ? defaultStudent.nis : '',
    gender: defaultStudent ? defaultStudent.gender : 'L',
    formatif: { tugas1: null, praktikum_lab: null, proyek_portofolio: null },
    sumatif_tp: { tp1: null, tp2: null, tp3: null },
    sts: null,
    sas: null,
    competency_desc: ''
  }
  showEditModal.value = true
}

function handleStudentSelect() {
  const st = classStudents.value.find(s => s.id === selectedStudentId.value)
  if (st && editingRow.value) {
    editingRow.value.student_id = st.id
    editingRow.value.student_name = st.name
    editingRow.value.nis = st.nis || ''
    editingRow.value.gender = st.gender || 'L'
  }
}

async function saveGradeEdit() {
  if (!editingRow.value) return
  if (!editingRow.value.student_name) {
    alert('Silakan pilih atau ketik nama siswa terlebih dahulu.')
    return
  }
  try {
    const isExisting = gradesList.value.some(g => g.id === editingRow.value.id)
    if (isExisting) {
      await api.put(`/reports/grades/${editingRow.value.id}`, {
        student_id: editingRow.value.student_id,
        student_name: editingRow.value.student_name,
        nis: editingRow.value.nis,
        gender: editingRow.value.gender,
        attendance_score: editingRow.value.attendance_score,
        avg_tugas: editingRow.value.avg_tugas,
        formatif: editingRow.value.formatif,
        sumatif_tp: editingRow.value.sumatif_tp,
        sts: editingRow.value.sts,
        sas: editingRow.value.sas,
        competency_desc: editingRow.value.competency_desc
      })
    } else {
      await api.post('/reports/grades', {
        ...editingRow.value,
        classroom_id: selectedClassId.value,
        classroom_name: getClassName(selectedClassId.value),
        subject_id: selectedSubjectId.value,
        subject_name: getSubjectName(selectedSubjectId.value)
      })
    }
    showEditModal.value = false
    await fetchGrades()
  } catch (err: any) {
    console.error('Failed to save grade:', err)
    alert('Gagal menyimpan nilai: ' + (err.message || 'Terjadi kesalahan'))
  }
}

async function deleteGrade(row: any) {
  if (!confirm(`Hapus catatan nilai siswa ${row.student_name}?`)) return
  try {
    await api.delete(`/reports/grades/${row.id}`)
    await fetchGrades()
  } catch (err) {
    console.error('Failed to delete grade:', err)
    alert('Gagal menghapus nilai')
  }
}

// ------------------------------------------------------------------
// PENILAIAN LUAR APLIKASI (TUGAS & ULANGAN OFFLINE / LAMPAU)
// ------------------------------------------------------------------
const offlineAssessmentsList = ref<any[]>([])
const showOfflineFormModal = ref(false)
const showManageOfflineModal = ref(false)
const isSavingOffline = ref(false)
const editingOfflineId = ref<string | null>(null)
const batchFillScore = ref<number>(80)

const offlineForm = ref({
  title: '',
  type: 'ulangan_tp', // 'tugas' | 'ulangan_tp' | 'sts' | 'sas'
  assessment_date: new Date().toISOString().split('T')[0],
  max_score: 100,
  description: '',
  tp_id: '',
  tp_code: ''
})

const offlineStudentScores = ref<Array<{
  student_id: string
  student_name: string
  nis: string
  gender: string
  score: number | null
  notes: string
}>>([])

const offlineStatsLive = computed(() => {
  const valid = offlineStudentScores.value
    .map(s => Number(s.score))
    .filter(n => !isNaN(n) && n !== null && n > 0)
  const total = offlineStudentScores.value.length
  const scored = valid.length
  const avg = scored > 0 ? Math.round((valid.reduce((a, b) => a + b, 0) / scored) * 10) / 10 : 0
  const passed = offlineStudentScores.value.filter(s => (Number(s.score) || 0) >= currentKktp.value).length
  return { total, scored, avg, passed }
})

async function fetchOfflineAssessments() {
  try {
    const res = await api.get('/offline-assessments', {
      params: {
        classroom_id: selectedClassId.value,
        subject_id: selectedSubjectId.value
      }
    })
    offlineAssessmentsList.value = res.data?.data || []
  } catch (err) {
    console.error('Failed to load offline assessments:', err)
    offlineAssessmentsList.value = []
  }
}

function openCreateOfflineModal(typeInput?: string | any) {
  const type = typeof typeInput === 'string' ? typeInput : 'ulangan_tp'
  editingOfflineId.value = null
  offlineForm.value = {
    title: type === 'tugas' ? 'Tugas Luar Aplikasi 1' : type === 'sts' ? 'STS Kertas (Tengah Semester)' : type === 'sas' ? 'SAS Kertas (Akhir Semester)' : 'Ulangan Harian 1 (Tertulis)',
    type: type,
    assessment_date: new Date().toISOString().split('T')[0],
    max_score: 100,
    description: '',
    tp_id: '',
    tp_code: ''
  }
  offlineStudentScores.value = classStudents.value.map(s => ({
    student_id: s.id,
    student_name: s.name,
    nis: s.nis || '',
    gender: s.gender || 'L',
    score: null,
    notes: ''
  }))
  showOfflineFormModal.value = true
}

async function openEditOfflineModal(item: any) {
  try {
    const res = await api.get(`/offline-assessments/${item.id}`)
    const data = res.data?.data || item
    editingOfflineId.value = data.id
    offlineForm.value = {
      title: data.title,
      type: data.type || 'ulangan_tp',
      assessment_date: data.assessment_date || new Date().toISOString().split('T')[0],
      max_score: data.max_score || 100,
      description: data.description || '',
      tp_id: data.tp_id || '',
      tp_code: data.tp_code || ''
    }

    const existingScoresMap = new Map((data.scores || []).map((s: any) => [s.student_id || s.nis, s]))
    offlineStudentScores.value = classStudents.value.map(s => {
      const existing: any = existingScoresMap.get(s.id) || existingScoresMap.get(s.nis)
      return {
        student_id: s.id,
        student_name: s.name,
        nis: s.nis || '',
        gender: s.gender || 'L',
        score: existing && existing.score !== undefined && existing.score !== null ? existing.score : null,
        notes: existing?.notes || ''
      }
    })
    showManageOfflineModal.value = false
    showOfflineFormModal.value = true
  } catch (err: any) {
    alert('Gagal memuat detail penilaian: ' + (err.message || 'Error'))
  }
}

function openManageOfflineModal() {
  fetchOfflineAssessments()
  showManageOfflineModal.value = true
}

function applyBatchFill() {
  const val = Number(batchFillScore.value)
  if (isNaN(val) || val < 0 || val > 100) {
    alert('Masukkan nilai yang valid antara 0 s.d. 100')
    return
  }
  offlineStudentScores.value.forEach(s => {
    s.score = val
  })
}

function clearAllScores() {
  if (confirm('Kosongkan semua nilai yang sudah diinput pada formulir ini?')) {
    offlineStudentScores.value.forEach(s => {
      s.score = null
    })
  }
}

async function saveOfflineAssessment() {
  if (!offlineForm.value.title.trim()) {
    alert('Silakan isi judul tugas / ulangan luar aplikasi terlebih dahulu.')
    return
  }
  isSavingOffline.value = true
  try {
    const payload = {
      ...offlineForm.value,
      classroom_id: selectedClassId.value,
      subject_id: selectedSubjectId.value,
      scores: offlineStudentScores.value.map(s => ({
        student_id: s.student_id,
        student_name: s.student_name,
        nis: s.nis,
        score: s.score !== null && (s.score as any) !== '' && !isNaN(Number(s.score)) ? Number(s.score) : null,
        notes: s.notes
      }))
    }

    if (editingOfflineId.value) {
      await api.put(`/offline-assessments/${editingOfflineId.value}`, payload)
      alert(`Nilai luar aplikasi "${offlineForm.value.title}" berhasil diperbarui!`)
    } else {
      await api.post('/offline-assessments', payload)
      alert(`Penilaian luar aplikasi "${offlineForm.value.title}" berhasil disimpan dan digabungkan ke Rekap Nilai Siswa!`)
    }

    showOfflineFormModal.value = false
    await Promise.all([fetchOfflineAssessments(), fetchGrades()])
  } catch (err: any) {
    console.error('Failed to save offline assessment:', err)
    alert('Gagal menyimpan penilaian: ' + (err.response?.data?.message || err.message || 'Terjadi kesalahan'))
  } finally {
    isSavingOffline.value = false
  }
}

async function deleteOfflineAssessment(item: any) {
  if (!confirm(`Hapus penilaian luar aplikasi "${item.title}"? Nilai ini akan ditarik kembali dari buku rekap nilai rapor.`)) return
  try {
    await api.delete(`/offline-assessments/${item.id}`)
    await Promise.all([fetchOfflineAssessments(), fetchGrades()])
    alert('Penilaian berhasil dihapus dan rekap nilai telah disinkronkan kembali.')
  } catch (err: any) {
    console.error('Failed to delete offline assessment:', err)
    alert('Gagal menghapus penilaian: ' + (err.message || 'Terjadi kesalahan'))
  }
}

// ------------------------------------------------------------------
// LOGIKA UPLOAD NILAI EXCEL
// ------------------------------------------------------------------
function openUploadExcelModal() {
  uploadFileName.value = ''
  parsedGradesPreview.value = []
  showUploadModal.value = true
}

function closeUploadModal() {
  showUploadModal.value = false
  uploadFileName.value = ''
  parsedGradesPreview.value = []
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function downloadGradeTemplate() {
  const rows = classStudents.value.length > 0
    ? classStudents.value.map(s => ({
        'NIS': s.nis || '',
        'Nama Siswa': s.name,
        'Tugas 1': 85,
        'Praktikum Lab': 85,
        'Proyek Koding': 85,
        'Sumatif TP 1': 80,
        'Sumatif TP 2': 80,
        'Sumatif TP 3': 80,
        'STS CBT': 80,
        'SAS CBT': 80,
        'Deskripsi Capaian': 'Menunjukkan pemahaman yang baik dalam pembelajaran.'
      }))
    : [{
        'NIS': '12345678',
        'Nama Siswa': 'Nama Siswa Contoh',
        'Tugas 1': 85,
        'Praktikum Lab': 85,
        'Proyek Koding': 85,
        'Sumatif TP 1': 80,
        'Sumatif TP 2': 80,
        'Sumatif TP 3': 80,
        'STS CBT': 80,
        'SAS CBT': 80,
        'Deskripsi Capaian': 'Menunjukkan pemahaman yang baik dalam pembelajaran.'
      }]

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Template Nilai')
  XLSX.writeFile(wb, `Template_Nilai_${getClassName(selectedClassId.value)}_${getSubjectName(selectedSubjectId.value)}.xlsx`)
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) processUploadFile(file)
}

function handleUploadDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file) processUploadFile(file)
}

async function processUploadFile(file: File) {
  uploadFileName.value = file.name
  try {
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet)

    if (jsonRows.length === 0) {
      alert('Berkas Excel kosong atau format tidak sesuai.')
      return
    }

    parsedGradesPreview.value = jsonRows.map((row, idx) => {
      const studentName = row['Nama Siswa'] || row['nama_siswa'] || row['Nama'] || row['Nama Peserta Didik'] || `Siswa ${idx + 1}`
      const nis = String(row['NIS'] || row['nis'] || '')
      const matchedStudent = classStudents.value.find(s => (nis && String(s.nis) === nis) || s.name.toLowerCase() === studentName.toLowerCase())

      const tugas1 = Number(row['Tugas 1'] || row['tugas1'] || 80)
      const praktikum_lab = Number(row['Praktikum Lab'] || row['praktikum_lab'] || 80)
      const proyek_portofolio = Number(row['Proyek Koding'] || row['proyek_portofolio'] || 80)
      const avg_formatif = Math.round(((tugas1 + praktikum_lab + proyek_portofolio) / 3) * 10) / 10

      const tp1 = Number(row['Sumatif TP 1'] || row['tp1'] || 80)
      const tp2 = Number(row['Sumatif TP 2'] || row['tp2'] || 80)
      const tp3 = Number(row['Sumatif TP 3'] || row['tp3'] || 80)
      const avg_sumatif_tp = Math.round(((tp1 + tp2 + tp3) / 3) * 10) / 10

      const sts = Number(row['STS CBT'] || row['STS'] || row['sts'] || row['Sumatif Tengah Semester'] || 80)
      const sas = Number(row['SAS CBT'] || row['SAS'] || row['sas'] || 80)
      const final_score = Math.round((avg_formatif * 0.3) + (avg_sumatif_tp * 0.3) + (sts * 0.2) + (sas * 0.2))

      return {
        classroom_id: selectedClassId.value,
        classroom_name: getClassName(selectedClassId.value),
        subject_id: selectedSubjectId.value,
        subject_name: getSubjectName(selectedSubjectId.value),
        student_id: matchedStudent?.id || `std-${Date.now()}-${idx}`,
        student_name: studentName,
        nis: nis || matchedStudent?.nis || '',
        gender: matchedStudent?.gender || 'L',
        formatif: { tugas1, praktikum_lab, proyek_portofolio },
        avg_formatif,
        sumatif_tp: { tp1, tp2, tp3 },
        avg_sumatif_tp,
        sts,
        sas,
        final_score,
        competency_desc: row['Deskripsi Capaian'] || row['competency_desc'] || 'Menunjukkan pemahaman yang baik dalam pembelajaran.'
      }
    })
  } catch (err: any) {
    console.error('Failed to parse excel file:', err)
    alert('Gagal membaca berkas Excel: ' + (err.message || 'Format berkas tidak valid'))
  }
}

async function saveBatchGrades() {
  if (parsedGradesPreview.value.length === 0) return
  isSavingBatch.value = true
  try {
    await api.post('/reports/grades/batch', parsedGradesPreview.value)
    alert(`Berhasil mengunggah dan menyimpan ${parsedGradesPreview.value.length} nilai siswa ke buku nilai!`)
    closeUploadModal()
    await fetchGrades()
  } catch (err: any) {
    console.error('Failed to save batch grades:', err)
    alert('Gagal menyimpan nilai secara massal: ' + (err.message || 'Terjadi kesalahan'))
  } finally {
    isSavingBatch.value = false
  }
}

function getSubjectName(id: string) {
  const found = (subjects.value || []).find(s => s.id === id)
  if (found) return found.name
  return authStore.user?.subject || 'Mata Pelajaran'
}

function printReport() {
  window.print()
}

function exportCsv() {
  const headers = ['No', 'NIS', 'NISN', 'Nama Siswa', 'L/P', 'Rata-rata Formatif', 'Rata-rata Sumatif TP', 'STS', 'SAS', 'Nilai Akhir', 'Predikat', 'Status KKTP', 'Capaian Kompetensi']
  const rows = gradesList.value.map((r, i) => [
    i + 1,
    `"${r.nis}"`,
    `"${r.nisn}"`,
    `"${r.student_name}"`,
    r.gender,
    r.avg_formatif,
    r.avg_sumatif_tp,
    r.sts ?? 0,
    r.sas,
    r.final_score,
    getGradeLetter(r.final_score),
    getKktpStatus(r.final_score),
    `"${(r.competency_desc || '').replace(/"/g, '""')}"`
  ])

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `Rekap_Nilai_${getSubjectName(selectedSubjectId.value)}_${getClassName(selectedClassId.value)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>
