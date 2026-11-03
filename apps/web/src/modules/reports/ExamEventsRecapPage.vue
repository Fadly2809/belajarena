<template>
  <div class="space-y-6">
    <!-- Top Action Bar (Hidden during Print) -->
    <div class="bg-white rounded-[24px] shadow-card border border-slate-200/60 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 print:hidden sticky top-0 z-20">
      <div class="flex items-center gap-3">
        <RouterLink to="/reports/grades" class="px-3 py-2 rounded-xl text-xs font-bold text-[#0c2b3d] bg-[#0c2b3d]/10 hover:bg-[#0c2b3d]/15 border border-[#0c2b3d]/20 shadow-2xs transition flex items-center gap-1.5">
          <span>📊</span> Rekap Nilai Siswa
        </RouterLink>
        <div>
          <h2 class="font-extrabold text-slate-900 text-sm leading-tight flex items-center gap-2">
            <span>📋</span> Rekap Nilai per Event Ulangan
          </h2>
          <span class="text-[11px] text-slate-500 font-medium">
            Daftar sesi ulangan yang dilaksanakan &bull; Filter kelas & mapel &bull; Integrasikan ke Rekap Nilai Siswa
          </span>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <!-- Filter Mata Pelajaran -->
        <select
          v-model="selectedSubjectId"
          @change="onSubjectFilterChange"
          class="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
        >
          <option value="">Semua Mata Pelajaran</option>
          <option value="sub-kka">KKA (Koding &amp; Kecerdasan Artifisial) — Kelas 7</option>
          <option value="sub-inf">Informatika — Kelas 9</option>
        </select>

        <!-- Filter Kelas -->
        <select
          v-model="selectedClassId"
          class="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
        >
          <option value="">Semua Kelas</option>
          <option v-for="c in filteredFilterClassrooms" :key="c.id" :value="c.id">
            {{ formatClassLabel(c) }}
          </option>
        </select>

        <!-- Filter Status -->
        <select
          v-model="selectedStatus"
          class="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
        >
          <option value="">Semua Status Sesi</option>
          <option value="completed">Selesai (Tuntas)</option>
          <option value="active">Sedang Berlangsung</option>
        </select>

        <!-- Tombol Buka Rekap Nilai Siswa -->
        <RouterLink
          to="/reports/grades"
          class="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
        >
          <span>📊</span> Buka Rekap Nilai Siswa
        </RouterLink>

        <!-- Refresh Button -->
        <button
          @click="fetchSessions"
          class="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          title="Segarkan Data"
        >
          🔄
        </button>
      </div>
    </div>

    <!-- Summary Stats Bar (Hidden during Print) -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-center">
        <span class="text-[10px] uppercase font-bold text-slate-400">Total Event Ulangan</span>
        <p class="text-xl font-black text-slate-800 mt-0.5">{{ filteredSessions.length }}</p>
      </div>
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-center">
        <span class="text-[10px] uppercase font-bold text-slate-400">Total Peserta Mengikuti</span>
        <p class="text-xl font-black text-blue-600 mt-0.5">{{ totalParticipantsCount }}</p>
      </div>
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-center">
        <span class="text-[10px] uppercase font-bold text-slate-400">Rata-rata Ketuntasan Kelas</span>
        <p class="text-xl font-black text-emerald-600 mt-0.5">{{ avgKetuntasan }}%</p>
      </div>
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-center">
        <span class="text-[10px] uppercase font-bold text-slate-400">Telah Dimasukkan ke Rekap</span>
        <p class="text-xl font-black text-purple-600 mt-0.5">{{ importedCount }} / {{ filteredSessions.length }}</p>
      </div>
    </div>

    <!-- Search & Active Filters Bar -->
    <div class="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs print:hidden">
      <div class="relative flex-1 min-w-[240px]">
        <span class="absolute inset-y-0 left-3 flex items-center text-slate-400">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari judul ulangan, topik materi, atau boss..."
          class="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div class="flex items-center gap-2 text-xs text-slate-500">
        <span>Menampilkan <b>{{ filteredSessions.length }}</b> event ulangan</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredSessions.length === 0" class="card p-12 text-center bg-white rounded-2xl border border-slate-200">
      <div class="text-4xl mb-3">🎮</div>
      <h3 class="text-base font-bold text-slate-800">Tidak ada event ulangan yang ditemukan</h3>
      <p class="text-xs text-slate-500 max-w-md mx-auto mt-1">
        Belum ada sesi ulangan yang sesuai dengan filter kelas atau mata pelajaran yang dipilih.
      </p>
      <div class="mt-4 flex items-center justify-center gap-3">
        <RouterLink to="/games" class="btn btn-primary text-xs px-4 py-2 font-bold flex items-center gap-1.5 shadow-sm">
          <span>⚔️</span> Buka Edu-Games & Mulai Ulangan
        </RouterLink>
      </div>
    </div>

    <!-- List of Exam Events Cards -->
    <div v-else class="space-y-4 print:hidden">
      <div
        v-for="session in filteredSessions"
        :key="session.id"
        class="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition overflow-hidden"
      >
        <!-- Card Header -->
        <div class="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50">
          <div class="space-y-1.5">
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                :class="session.quiz_type === 'kuis_formatif' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'"
              >
                {{ formatQuizType(session.quiz_type) }}
              </span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                {{ formatClassBadge(session) }}
              </span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                {{ formatSubject(session) }}
              </span>
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                :class="session.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
              >
                {{ session.status === 'completed' ? '✓ Selesai' : '⏳ Berlangsung' }}
              </span>
              <span
                v-if="session.imported_to_grades"
                class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1"
              >
                <span>✓</span> Masuk ke Rekap Siswa: {{ session.imported_component || 'Rapor' }}
              </span>
            </div>

            <h3 class="font-bold text-slate-900 text-base flex items-center gap-2">
              <span>{{ session.boss?.name ? '👾' : '📝' }}</span>
              {{ session.title }}
            </h3>
            <p class="text-xs text-slate-500">
              Topik: <span class="font-medium text-slate-700">{{ session.topic }}</span>
              <span v-if="session.boss?.name" class="ml-2">&bull; Karakter: <span class="font-semibold text-slate-700">{{ session.boss.name }}</span></span>
              <span class="ml-2">&bull; KKTP: <span class="font-bold text-slate-800">{{ session.kkm || 75 }}</span></span>
              <span class="ml-2">&bull; Dilaksanakan: <span class="font-medium text-slate-600">{{ formatDate(session.started_at || session.created_at) }}</span></span>
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap items-center gap-2 shrink-0">
            <!-- Tombol Masukkan ke Rekap Nilai Siswa -->
            <button
              @click="openImportModal(session)"
              class="px-3.5 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
              :class="session.imported_to_grades ? 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200' : 'bg-purple-600 hover:bg-purple-700 text-white'"
            >
              <span>📥</span>
              <span>{{ session.imported_to_grades ? 'Perbarui di Rekap Siswa' : 'Masukkan ke Rekap Siswa' }}</span>
            </button>

            <!-- Toggle Detail Siswa -->
            <button
              @click="toggleSessionDetails(session.id)"
              class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1"
            >
              <span>{{ expandedSessionId === session.id ? '▲ Tutup' : '▼ Lihat Nilai Peserta' }}</span>
              <span class="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded-full font-mono">{{ session.participants?.length || 0 }}</span>
            </button>

            <!-- Cetak Rekap Event Ini -->
            <button
              @click="printSessionReport(session)"
              class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Cetak Rekap Hasil Event Ini"
            >
              🖨️
            </button>

            <!-- Ekspor CSV -->
            <button
              @click="exportSessionCsv(session)"
              class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Ekspor CSV Peserta"
            >
              📥
            </button>

            <!-- Hapus Riwayat -->
            <button
              @click="deleteSessionHistory(session)"
              class="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-rose-600 transition"
              title="Hapus Riwayat Ulangan Ini"
            >
              🗑️
            </button>
          </div>
        </div>

        <!-- Metrics Overview Row -->
        <div class="p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 bg-white text-xs border-b border-slate-100">
          <div class="text-center p-2 rounded-xl bg-slate-50">
            <span class="text-[10px] text-slate-400 font-bold uppercase">Peserta Mengikuti</span>
            <p class="text-base font-black text-slate-800 mt-0.5">{{ session.participants?.length || 0 }} Siswa</p>
          </div>
          <div class="text-center p-2 rounded-xl bg-slate-50">
            <span class="text-[10px] text-slate-400 font-bold uppercase">Tuntas KKTP (>= {{ session.kkm || 75 }})</span>
            <p class="text-base font-black text-emerald-600 mt-0.5">{{ getPassedCount(session) }} Siswa</p>
          </div>
          <div class="text-center p-2 rounded-xl bg-slate-50">
            <span class="text-[10px] text-slate-400 font-bold uppercase">Belum Tuntas</span>
            <p class="text-base font-black text-rose-600 mt-0.5">{{ getNotPassedCount(session) }} Siswa</p>
          </div>
          <div class="text-center p-2 rounded-xl bg-slate-50">
            <span class="text-[10px] text-slate-400 font-bold uppercase">Rata-rata Nilai</span>
            <p class="text-base font-black text-blue-600 mt-0.5">{{ getAvgScore(session) }}</p>
          </div>
          <div class="text-center p-2 rounded-xl bg-slate-50 col-span-2 sm:col-span-1">
            <span class="text-[10px] text-slate-400 font-bold uppercase">Status Hasil</span>
            <p class="text-base font-black mt-0.5" :class="session.outcome === 'class_victory' ? 'text-emerald-600' : 'text-amber-600'">
              {{ session.outcome === 'class_victory' ? '🏆 Kemenangan Kelas' : (session.outcome === 'boss_victory' ? '💀 Boss Menang' : 'Sedang Berlangsung') }}
            </p>
          </div>
        </div>

        <!-- Expanded Participant Score Table -->
        <div v-if="expandedSessionId === session.id" class="p-4 bg-slate-50/70">
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-bold text-xs text-slate-800">
              Daftar Nilai Asli Peserta Ulangan: {{ session.title }}
            </h4>
            <span class="text-[11px] text-slate-500">
              Hanya menampilkan data riil peserta yang mengerjakan sesi ini
            </span>
          </div>

          <div class="overflow-x-auto bg-white rounded-xl border border-slate-200">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase border-b border-slate-200">
                  <th class="py-2.5 px-3 w-10 text-center">No</th>
                  <th class="py-2.5 px-3 w-28">NIS</th>
                  <th class="py-2.5 px-4 min-w-[160px]">Nama Siswa</th>
                  <th class="py-2.5 px-3 text-center w-20">Benar</th>
                  <th class="py-2.5 px-3 text-center w-20">Salah</th>
                  <th class="py-2.5 px-3 text-center font-black text-slate-900 w-24">Skor Nilai</th>
                  <th class="py-2.5 px-3 text-center w-28">Status KKTP</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="(p, idx) in session.participants"
                  :key="p.id || idx"
                  class="hover:bg-slate-50"
                >
                  <td class="py-2 px-3 text-center font-bold text-slate-400">{{ idx + 1 }}</td>
                  <td class="py-2 px-3 font-mono text-[11px] text-slate-600">{{ p.nis || '-' }}</td>
                  <td class="py-2 px-4 font-bold text-slate-800">{{ p.name }}</td>
                  <td class="py-2 px-3 text-center font-semibold text-emerald-700">{{ p.correct ?? 0 }}</td>
                  <td class="py-2 px-3 text-center font-semibold text-rose-600">{{ p.wrong ?? 0 }}</td>
                  <td class="py-2 px-3 text-center font-black text-sm text-blue-700">
                    {{ Math.round(Number(p.academic_score) || 0) }}
                  </td>
                  <td class="py-2 px-3 text-center">
                    <span
                      class="px-2 py-0.5 rounded-full text-[10px] font-bold inline-block"
                      :class="(Number(p.academic_score) || 0) >= (session.kkm || 75) ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'"
                    >
                      {{ (Number(p.academic_score) || 0) >= (session.kkm || 75) ? 'Tuntas' : 'Perlu Bimbingan' }}
                    </span>
                  </td>
                </tr>
                <tr v-if="!session.participants || session.participants.length === 0">
                  <td colspan="7" class="py-6 text-center text-slate-400 text-xs">
                    Belum ada data pengerjaan siswa pada sesi ini.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL: MASUKKAN KE REKAP NILAI SISWA -->
    <!-- ============================================================== -->
    <Teleport to="body">
      <div v-if="showImportModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
          <div class="p-5 bg-gradient-to-r from-purple-700 to-indigo-800 text-white flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xl">📥</span>
              <div>
                <h3 class="font-bold text-sm">Masukkan Nilai Ulangan ke Rekap Siswa</h3>
                <p class="text-[11px] text-purple-200">
                  Pilih komponen penilaian buku nilai untuk sesi: {{ activeImportSession?.title }}
                </p>
              </div>
            </div>
            <button @click="showImportModal = false" class="text-white/80 hover:text-white font-bold">✕</button>
          </div>

          <div class="p-5 space-y-4 text-xs">
            <div class="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-purple-950">
              <p class="font-bold flex items-center gap-1.5">
                <span>ℹ️</span> Penjelasan Integrasi Nilai Kurikulum Merdeka
              </p>
              <p class="text-[11px] text-purple-800 mt-1 leading-relaxed">
                Nilai asli dari peserta ulangan ini akan dicocokkan ke daftar siswa resmi rombel dan dimasukkan secara presisi ke kolom penilaian yang dipilih di bawah. Nilai komponen lain yang belum diujikan tidak akan diisi nilai palsu/dummy.
              </p>
            </div>

            <!-- Target Rombel & Mapel -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Target Kelas / Rombel</label>
                <select
                  v-model="importForm.classroom_id"
                  @change="importForm.subject_id = getSubjectIdForClass(importForm.classroom_id)"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                >
                  <option v-for="c in classrooms" :key="c.id" :value="c.id">
                    {{ formatClassLabel(c) }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Target Mata Pelajaran</label>
                <select
                  v-model="importForm.subject_id"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                >
                  <option v-for="s in getAvailableSubjectsForClass(importForm.classroom_id)" :key="s.id" :value="s.id">
                    {{ s.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Komponen Penilaian Target -->
            <div>
              <label class="block font-bold text-slate-700 mb-1.5">
                Pilih Komponen Nilai Rapor Target:
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <!-- Sumatif TP Options -->
                <label
                  class="p-2.5 rounded-xl border cursor-pointer transition flex items-start gap-2.5"
                  :class="importForm.component_key === 'tp1' ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600' : 'border-slate-200 hover:bg-slate-50'"
                >
                  <input
                    type="radio"
                    v-model="importForm.component_key"
                    value="tp1"
                    @change="setComponent('sumatif_tp', 'tp1', 'Sumatif TP 1')"
                    class="mt-0.5 text-purple-600"
                  />
                  <div>
                    <span class="font-bold text-slate-900 block">Sumatif TP 1 (Lingkup Materi 1)</span>
                    <span class="text-[10px] text-slate-500">Bobot 40% &bull; Penilaian Sumatif TP pertama</span>
                  </div>
                </label>

                <label
                  class="p-2.5 rounded-xl border cursor-pointer transition flex items-start gap-2.5"
                  :class="importForm.component_key === 'tp2' ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600' : 'border-slate-200 hover:bg-slate-50'"
                >
                  <input
                    type="radio"
                    v-model="importForm.component_key"
                    value="tp2"
                    @change="setComponent('sumatif_tp', 'tp2', 'Sumatif TP 2')"
                    class="mt-0.5 text-purple-600"
                  />
                  <div>
                    <span class="font-bold text-slate-900 block">Sumatif TP 2 (Lingkup Materi 2)</span>
                    <span class="text-[10px] text-slate-500">Bobot 40% &bull; Penilaian Sumatif TP kedua</span>
                  </div>
                </label>

                <label
                  class="p-2.5 rounded-xl border cursor-pointer transition flex items-start gap-2.5"
                  :class="importForm.component_key === 'tp3' ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600' : 'border-slate-200 hover:bg-slate-50'"
                >
                  <input
                    type="radio"
                    v-model="importForm.component_key"
                    value="tp3"
                    @change="setComponent('sumatif_tp', 'tp3', 'Sumatif TP 3')"
                    class="mt-0.5 text-purple-600"
                  />
                  <div>
                    <span class="font-bold text-slate-900 block">Sumatif TP 3 (Lingkup Materi 3)</span>
                    <span class="text-[10px] text-slate-500">Bobot 40% &bull; Penilaian Sumatif TP ketiga</span>
                  </div>
                </label>

                <!-- Formatif Option -->
                <label
                  class="p-2.5 rounded-xl border cursor-pointer transition flex items-start gap-2.5"
                  :class="importForm.component_key === 'tugas1' ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600' : 'border-slate-200 hover:bg-slate-50'"
                >
                  <input
                    type="radio"
                    v-model="importForm.component_key"
                    value="tugas1"
                    @change="setComponent('formatif', 'tugas1', 'Formatif Tugas 1')"
                    class="mt-0.5 text-purple-600"
                  />
                  <div>
                    <span class="font-bold text-slate-900 block">Formatif — Tugas 1 / Kuis</span>
                    <span class="text-[10px] text-slate-500">Bobot 40% &bull; Kuis pemahaman materi</span>
                  </div>
                </label>

                <label
                  class="p-2.5 rounded-xl border cursor-pointer transition flex items-start gap-2.5"
                  :class="importForm.component_key === 'praktikum_lab' ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600' : 'border-slate-200 hover:bg-slate-50'"
                >
                  <input
                    type="radio"
                    v-model="importForm.component_key"
                    value="praktikum_lab"
                    @change="setComponent('formatif', 'praktikum_lab', 'Formatif Praktikum Lab')"
                    class="mt-0.5 text-purple-600"
                  />
                  <div>
                    <span class="font-bold text-slate-900 block">Formatif — Praktikum Lab</span>
                    <span class="text-[10px] text-slate-500">Bobot 40% &bull; Praktik komputer / coding</span>
                  </div>
                </label>

                <!-- SAS Option -->
                <label
                  class="p-2.5 rounded-xl border cursor-pointer transition flex items-start gap-2.5"
                  :class="importForm.component_key === 'sas' ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600' : 'border-slate-200 hover:bg-slate-50'"
                >
                  <input
                    type="radio"
                    v-model="importForm.component_key"
                    value="sas"
                    @change="setComponent('sas', 'sas', 'Sumatif Akhir Semester (SAS)')"
                    class="mt-0.5 text-purple-600"
                  />
                  <div>
                    <span class="font-bold text-slate-900 block">SAS (Sumatif Akhir Semester)</span>
                    <span class="text-[10px] text-slate-500">Bobot 20% &bull; Ujian Akhir CBT</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Preview of Students to be imported -->
            <div>
              <span class="text-[10px] font-bold text-slate-500 uppercase">
                Pratinjau Peserta yang Akan Dimasukkan ({{ activeImportSession?.participants?.length || 0 }} Siswa):
              </span>
              <div class="max-h-36 overflow-y-auto mt-1 border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
                <div
                  v-for="(p, i) in (activeImportSession?.participants || [])"
                  :key="i"
                  class="p-2 flex items-center justify-between text-[11px]"
                >
                  <span class="font-bold text-slate-800">{{ p.name }} <span class="font-mono text-slate-400 font-normal">({{ p.nis || '-' }})</span></span>
                  <span class="font-black text-blue-700">Skor: {{ Math.round(Number(p.academic_score) || 0) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 bg-slate-50 border-t flex items-center justify-end gap-2">
            <button
              @click="showImportModal = false"
              class="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-200"
            >
              Batal
            </button>
            <button
              :disabled="isSubmittingImport"
              @click="submitImport"
              class="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <span v-if="isSubmittingImport">Memproses...</span>
              <span v-else>Konfirmasi & Masukkan ke Rekap Siswa</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ============================================================== -->
    <!-- VIEW CETAK PRINT RESMI LEMBAR HASIL ULANGAN SATU EVENT -->
    <!-- ============================================================== -->
    <div v-if="printingSession" class="hidden print:block p-8 bg-white text-black space-y-6">
      <div class="border-b-2 border-black pb-4 text-center">
        <h2 class="text-base font-bold uppercase tracking-wider">PEMERINTAH KOTA KENDARI</h2>
        <h2 class="text-sm font-bold uppercase">DINAS PENDIDIKAN DAN KEBUDAYAAN</h2>
        <h1 class="text-lg font-black uppercase tracking-wide">SMP NEGERI 6 KENDARI</h1>
        <p class="text-[10px] mt-0.5">Alamat: Jl. Bunggasi No. 100, Poasia, Kota Kendari, Sulawesi Tenggara</p>
      </div>

      <div class="text-center space-y-1">
        <h3 class="text-sm font-bold uppercase tracking-wider underline">
          REKAPITULASI HASIL PELAKSANAAN ULANGAN
        </h3>
        <p class="text-xs font-semibold">
          {{ printingSession.title }} &bull; Mata Pelajaran: {{ formatSubject(printingSession) }}
        </p>
        <p class="text-[11px] text-slate-600">
          Kelas: {{ formatClassBadge(printingSession).replace(/^kelas\s+/i, '') }} &bull; Topik: {{ printingSession.topic }} &bull; KKTP: {{ printingSession.kkm || 75 }}
        </p>
      </div>

      <table class="w-full text-left text-xs border border-black border-collapse">
        <thead>
          <tr class="border-b border-black bg-slate-100 font-bold uppercase text-[10px]">
            <th class="border-r border-black py-2 px-2 text-center w-8">No</th>
            <th class="border-r border-black py-2 px-3 w-28">NIS</th>
            <th class="border-r border-black py-2 px-4">Nama Peserta Didik</th>
            <th class="border-r border-black py-2 px-3 text-center w-16">Benar</th>
            <th class="border-r border-black py-2 px-3 text-center w-16">Salah</th>
            <th class="border-r border-black py-2 px-3 text-center w-20">Nilai</th>
            <th class="py-2 px-3 text-center w-28">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(p, i) in (printingSession.participants || [])"
            :key="i"
            class="border-b border-black"
          >
            <td class="border-r border-black py-2 px-2 text-center">{{ i + 1 }}</td>
            <td class="border-r border-black py-2 px-3 font-mono">{{ p.nis || '-' }}</td>
            <td class="border-r border-black py-2 px-4 font-bold">{{ p.name }}</td>
            <td class="border-r border-black py-2 px-3 text-center">{{ p.correct ?? 0 }}</td>
            <td class="border-r border-black py-2 px-3 text-center">{{ p.wrong ?? 0 }}</td>
            <td class="border-r border-black py-2 px-3 text-center font-bold">{{ Math.round(Number(p.academic_score) || 0) }}</td>
            <td class="py-2 px-3 text-center font-semibold">
              {{ (Number(p.academic_score) || 0) >= (printingSession.kkm || 75) ? 'Tuntas' : 'Perlu Bimbingan' }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Tanda Tangan Resmi -->
      <div class="grid grid-cols-2 gap-8 pt-8 text-xs text-center">
        <div>
          <p>Mengetahui,</p>
          <p class="font-bold">Kepala SMP Negeri 6 Kendari</p>
          <div class="h-16"></div>
          <p class="font-bold underline">La Ode Muhamad Hidayat, S.Pd., M.Pd.</p>
          <p class="text-[10px]">NIP. 197205141998021002</p>
        </div>
        <div>
          <p>Kendari, {{ printDate }}</p>
          <p class="font-bold">Guru Mata Pelajaran,</p>
          <div class="h-16"></div>
          <p class="font-bold underline">Muhammad Fadly Akbar Arsandi, S.Pd.</p>
          <p class="text-[10px]">NIP. 199509282020121003</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import api from '@/services/api'
import * as XLSX from 'xlsx'
import {
  useClassrooms,
  getSubjectIdForClass,
  getAvailableSubjectsForClass,
  filterClassroomsBySubject
} from '@/composables/useClassrooms'

const route = useRoute()
const { classrooms, fetchClassrooms, formatClassLabel, getClassName } = useClassrooms()

const sessions = ref<any[]>([])
const selectedSubjectId = ref('')
const selectedClassId = ref('')
const selectedStatus = ref('')
const searchQuery = ref('')
const expandedSessionId = ref<string | null>(null)

const filteredFilterClassrooms = computed(() => {
  if (!selectedSubjectId.value) return classrooms.value
  return filterClassroomsBySubject(classrooms.value, selectedSubjectId.value)
})

function onSubjectFilterChange() {
  if (selectedClassId.value && selectedSubjectId.value) {
    const valid = filteredFilterClassrooms.value
    if (!valid.some(c => c.id === selectedClassId.value)) {
      selectedClassId.value = ''
    }
  }
}

// Import modal state
const showImportModal = ref(false)
const activeImportSession = ref<any>(null)
const isSubmittingImport = ref(false)
const importForm = ref({
  classroom_id: '',
  subject_id: 'sub-inf',
  component_type: 'sumatif_tp',
  component_key: 'tp1',
  component_label: 'Sumatif TP 1'
})

// Print state
const printingSession = ref<any>(null)
const printDate = new Date().toLocaleDateString('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})

async function fetchSessions() {
  try {
    const res = await api.get('/ulangan-gamifikasi/sessions')
    sessions.value = res.data?.data || []
  } catch (err) {
    console.error('Failed to fetch exam sessions:', err)
    sessions.value = []
  }
}

const filteredSessions = computed(() => {
  return sessions.value.filter(s => {
    // Filter Kelas
    if (selectedClassId.value && s.classroom_id !== selectedClassId.value) {
      return false
    }
    // Filter Mapel
    if (selectedSubjectId.value) {
      const isKka = s.subject_id === 'sub-kka' || s.title?.toLowerCase().includes('kka') || s.topic?.toLowerCase().includes('kka')
      const isInf = s.subject_id === 'sub-inf' || s.title?.toLowerCase().includes('informatika') || s.topic?.toLowerCase().includes('informatika') || (!isKka)
      if (selectedSubjectId.value === 'sub-kka' && !isKka) return false
      if (selectedSubjectId.value === 'sub-inf' && !isInf && isKka) return false
    }
    // Filter Status
    if (selectedStatus.value) {
      if (selectedStatus.value === 'completed' && s.status !== 'completed') return false
      if (selectedStatus.value === 'active' && s.status === 'completed') return false
    }
    // Search Query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const title = (s.title || '').toLowerCase()
      const topic = (s.topic || '').toLowerCase()
      const boss = (s.boss?.name || '').toLowerCase()
      const cls = (s.classroom_name || '').toLowerCase()
      if (!title.includes(q) && !topic.includes(q) && !boss.includes(q) && !cls.includes(q)) {
        return false
      }
    }
    return true
  })
})

const totalParticipantsCount = computed(() => {
  return filteredSessions.value.reduce((acc, s) => acc + (s.participants?.length || 0), 0)
})

const avgKetuntasan = computed(() => {
  if (filteredSessions.value.length === 0) return 0
  const total = filteredSessions.value.reduce((acc, s) => acc + (Number(s.ketuntasan_display) || 0), 0)
  return Math.round(total / filteredSessions.value.length)
})

const importedCount = computed(() => {
  return filteredSessions.value.filter(s => s.imported_to_grades).length
})

function toggleSessionDetails(sessionId: string) {
  if (expandedSessionId.value === sessionId) {
    expandedSessionId.value = null
  } else {
    expandedSessionId.value = sessionId
  }
}

function getPassedCount(session: any) {
  if (session.passed_count !== undefined) return session.passed_count
  const kkm = Number(session.kkm) || 75
  return (session.participants || []).filter((p: any) => (Number(p.academic_score) || 0) >= kkm).length
}

function getNotPassedCount(session: any) {
  const total = session.participants?.length || 0
  return Math.max(0, total - getPassedCount(session))
}

function getAvgScore(session: any) {
  const parts = session.participants || []
  if (parts.length === 0) return 0
  const sum = parts.reduce((acc: number, p: any) => acc + (Number(p.academic_score) || 0), 0)
  return Math.round(sum / parts.length)
}

function formatQuizType(type: string) {
  switch (type) {
    case 'kuis_formatif': return 'Kuis Formatif'
    case 'sumatif_tp': return 'Sumatif Lingkup Materi'
    case 'ulangan_harian': return 'Ulangan Harian'
    default: return 'Ulangan Gamifikasi'
  }
}

function formatSubject(session: any) {
  if (session.subject_id === 'sub-kka' || session.title?.toLowerCase().includes('kka') || session.topic?.toLowerCase().includes('kka')) {
    return 'KKA (Koding & AI)'
  }
  return 'Informatika'
}

function formatClassBadge(session: any): string {
  if (!session) return ''
  const raw = session.classroom_name || getClassName(session.classroom_id) || ''
  if (!raw) return 'Semua Kelas'
  if (/^kelas\s+/i.test(raw)) return raw
  return `Kelas ${raw}`
}

function formatDate(timestamp: any) {
  if (!timestamp) return '-'
  const d = new Date(timestamp)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function openImportModal(session: any) {
  activeImportSession.value = session
  const targetClsId = session.classroom_id || (classrooms.value[0]?.id || 'cls-7a')
  importForm.value = {
    classroom_id: targetClsId,
    subject_id: getSubjectIdForClass(targetClsId),
    component_type: session.quiz_type === 'kuis_formatif' ? 'formatif' : 'sumatif_tp',
    component_key: session.quiz_type === 'kuis_formatif' ? 'tugas1' : 'tp1',
    component_label: session.quiz_type === 'kuis_formatif' ? 'Formatif Tugas 1' : 'Sumatif TP 1'
  }
  showImportModal.value = true
}

function setComponent(type: string, key: string, label: string) {
  importForm.value.component_type = type
  importForm.value.component_key = key
  importForm.value.component_label = label
}

async function submitImport() {
  if (!activeImportSession.value) return
  isSubmittingImport.value = true
  try {
    const res = await api.post('/reports/grades/import-event', {
      session_id: activeImportSession.value.id,
      classroom_id: importForm.value.classroom_id,
      subject_id: importForm.value.subject_id,
      component_type: importForm.value.component_type,
      component_key: importForm.value.component_key,
      component_label: importForm.value.component_label
    })

    alert(res.data?.message || 'Nilai ulangan berhasil dimasukkan ke Rekap Nilai Siswa!')
    showImportModal.value = false
    await fetchSessions()
  } catch (err: any) {
    console.error('Failed to import event grades:', err)
    alert(err.response?.data?.message || 'Gagal memasukkan nilai ke Rekap Nilai Siswa.')
  } finally {
    isSubmittingImport.value = false
  }
}

function printSessionReport(session: any) {
  printingSession.value = session
  setTimeout(() => {
    window.print()
    printingSession.value = null
  }, 300)
}

function exportSessionCsv(session: any) {
  const parts = session.participants || []
  if (parts.length === 0) {
    alert('Belum ada data peserta untuk diekspor.')
    return
  }

  const rows = parts.map((p: any, idx: number) => ({
    No: idx + 1,
    NIS: p.nis || '',
    'Nama Siswa': p.name,
    'Nilai Skor': Math.round(Number(p.academic_score) || 0),
    'Jawaban Benar': p.correct ?? 0,
    'Jawaban Salah': p.wrong ?? 0,
    Status: (Number(p.academic_score) || 0) >= (session.kkm || 75) ? 'Tuntas' : 'Perlu Bimbingan'
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Hasil_Ulangan')
  const cleanTitle = (session.title || 'Ulangan').replace(/[^a-zA-Z0-9]/g, '_')
  const cleanClass = formatClassBadge(session).replace(/^kelas\s+/i, '') || 'Kelas'
  XLSX.writeFile(wb, `Rekap_${cleanTitle}_${cleanClass}.xlsx`)
}

async function deleteSessionHistory(session: any) {
  if (!confirm(`Apakah Anda yakin ingin menghapus riwayat ulangan "${session.title}"?`)) return
  try {
    await api.delete(`/ulangan-gamifikasi/sessions/${session.id}`)
    await fetchSessions()
  } catch (err) {
    console.error('Failed to delete session:', err)
    alert('Gagal menghapus riwayat sesi ulangan.')
  }
}

onMounted(async () => {
  await fetchClassrooms()
  if (route.query.classroom_id) {
    selectedClassId.value = String(route.query.classroom_id)
  }
  if (route.query.subject_id) {
    selectedSubjectId.value = String(route.query.subject_id)
  }
  if (route.query.session_id) {
    expandedSessionId.value = String(route.query.session_id)
  }
  await fetchSessions()
})
</script>
