<template>
  <div class="min-h-screen bg-[#e8edf2] text-slate-800 pb-24 select-none font-sans">
    <!-- Top Mobile App Bar (Deep Petrol) -->
    <header class="sticky top-0 z-30 bg-[#0c2b3d] text-white px-4 py-3.5 shadow-md flex items-center justify-between border-b border-[#071a25]/40">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center font-bold text-lg shadow-inner">
          🎓
        </div>
        <div>
          <h1 class="text-sm font-black tracking-tight leading-none text-white">SMPN 6 KENDARI</h1>
          <p class="text-[10px] text-slate-300 font-medium">Portal Belajar Siswa Digital</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Live Dispatch Pulse Indicator -->
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-bold text-emerald-300">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Live Auto-Sync</span>
        </div>

        <button
          @click="handleLogout"
          class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs transition text-white"
          title="Keluar dari Akun"
        >
          🚪
        </button>
      </div>
    </header>

    <!-- LIVE AUTO-DISPATCH OVERLAY BANNER (Trigger Otomatis Sesi Guru) -->
    <Teleport to="body">
      <div
        v-if="liveSessionNotice"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      >
        <div class="bg-[#0c2b3d] text-white rounded-[28px] p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border-2 border-[#f59e0b]/50 animate-scale-up">
          <div class="w-16 h-16 rounded-2xl bg-[#f59e0b] text-slate-950 flex items-center justify-center text-3xl mx-auto shadow-lg animate-bounce font-black">
            <span v-if="liveSessionNotice.type === 'presentation'">📽️</span>
            <span v-else-if="liveSessionNotice.type === 'game'">⚔️</span>
            <span v-else>📝</span>
          </div>

          <div class="space-y-1">
            <span class="badge bg-[#f59e0b] text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              {{ liveSessionNotice.type === 'presentation' ? 'Live Presentasi Guru' : (liveSessionNotice.type === 'game' ? 'Ulangan Gamifikasi Boss Battle' : 'Sesi Ujian CBT Dimulai') }}
            </span>
            <h3 class="text-lg font-black text-white leading-tight pt-1">
              {{ liveSessionNotice.title }}
            </h3>
            <p class="text-xs text-slate-300 leading-relaxed">
              {{ liveSessionNotice.message }}
            </p>
          </div>

          <div class="p-3 rounded-2xl bg-white/10 border border-white/15 text-xs text-amber-300 font-bold flex items-center justify-center gap-2">
            <span class="spinner w-3.5 h-3.5 border-amber-300"></span>
            <span>Membuka otomatis dalam <strong>{{ autoRedirectCountdown }}</strong> detik...</span>
          </div>

          <div class="flex gap-2 pt-1">
            <button
              @click="cancelAutoRedirect"
              class="btn bg-white/10 hover:bg-white/20 text-white/70 text-xs py-2 px-3 flex-1 rounded-xl"
            >
              Tunda
            </button>
            <button
              @click="proceedToLiveSession"
              class="btn bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-black text-xs py-2 px-4 flex-1 rounded-xl shadow-lg"
            >
              Masuk Sekarang 🚀
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Main Container -->
    <main class="max-w-md mx-auto p-4 space-y-4">
      <!-- Loading State -->
      <div v-if="loading" class="card p-8 text-center text-slate-400 text-xs">
        <div class="spinner w-6 h-6 mx-auto mb-2"></div>
        <p>Memuat data portal siswa...</p>
      </div>

      <template v-else>
        <!-- TAB 1: BERANDA (HOME) -->
        <div v-if="currentTab === 'home'" class="space-y-4 animate-fade-in">
          <!-- Student Identity Card -->
          <div class="bg-white rounded-[24px] shadow-card border border-slate-200/60 p-5 relative overflow-hidden">
            <div class="absolute -right-4 -bottom-4 w-28 h-28 bg-slate-100/60 rounded-full blur-xl pointer-events-none"></div>

            <div class="flex items-center gap-3.5">
              <div class="w-14 h-14 rounded-2xl bg-[#0c2b3d] text-white font-black text-xl flex items-center justify-center shadow-md flex-shrink-0 overflow-hidden ring-2 ring-white">
                <img
                  v-if="student?.avatar_url || student?.avatar_path"
                  :src="student.avatar_url || student.avatar_path"
                  alt="Foto Siswa"
                  class="w-full h-full object-cover"
                />
                <span v-else>{{ student?.name?.charAt(0) || 'S' }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <span class="badge bg-[#0c2b3d]/10 text-[#0c2b3d] text-[10px] px-2 py-0.5 font-bold">
                    Kelas {{ student?.classroom_name || 'VII A' }}
                  </span>
                  <span class="badge bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 font-bold">
                    Siswa Aktif
                  </span>
                </div>
                <h2 class="text-base font-black text-slate-900 truncate mt-0.5">
                  {{ student?.name }}
                </h2>
                <p class="text-xs text-slate-500 font-mono">
                  NIS: {{ student?.nis }} &bull; NISN: {{ student?.nisn || '0089123401' }}
                </p>
              </div>
            </div>

            <!-- Quick Metrics Grid (Petrol, Honey, Dark) -->
            <div class="grid grid-cols-3 gap-2.5 mt-4 pt-3.5 border-t border-slate-100 text-center text-xs">
              <div class="p-2.5 rounded-2xl bg-[#0e3143] text-white shadow-xs">
                <span class="text-[10px] text-slate-300 font-bold uppercase block">Rata Rapor</span>
                <span class="font-black text-sm text-white mt-0.5 block">
                  {{ hasReportGrades ? reportSummary.average_score : '-' }}
                </span>
              </div>
              <div class="p-2.5 rounded-2xl bg-[#f59e0b] text-slate-950 shadow-xs">
                <span class="text-[10px] text-slate-950/70 font-bold uppercase block">Peringkat</span>
                <span class="font-black text-sm text-slate-950 mt-0.5 block">
                  {{ displayRank }}
                </span>
              </div>
              <div class="p-2.5 rounded-2xl bg-[#162834] text-white shadow-xs">
                <span class="text-[10px] text-slate-300 font-bold uppercase block">Tugas Aktif</span>
                <span class="font-black text-sm text-emerald-300 mt-0.5 block">
                  {{ pendingTasksCount }} Tugas
                </span>
              </div>
            </div>
          </div>

          <!-- Live Session Auto-Status Card (Jika ada sesi aktif) -->
          <div
            v-if="liveDispatchData?.active"
            class="p-4 bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-slate-950 rounded-[20px] shadow-card border border-amber-400 flex items-center justify-between gap-3 animate-pulse"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/30 backdrop-blur-sm flex items-center justify-center text-xl font-bold">
                ⚡
              </div>
              <div>
                <span class="text-[10px] font-black uppercase tracking-wider block text-slate-900">Sesi Sedang Berlangsung</span>
                <h4 class="font-black text-xs text-white leading-tight">{{ liveDispatchData.title }}</h4>
              </div>
            </div>
            <button
              @click="router.push(liveDispatchData.target_url)"
              class="btn bg-white text-slate-950 hover:bg-slate-50 text-xs px-3.5 py-1.5 font-black shadow-sm whitespace-nowrap rounded-xl"
            >
              Masuk 🚀
            </button>
          </div>

          <!-- Menu Akses Cepat Grid -->
          <div class="grid grid-cols-4 gap-2.5">
            <button
              @click="currentTab = 'tasks'"
              class="p-3 rounded-[20px] bg-white border border-slate-200/60 shadow-xs flex flex-col items-center justify-center text-center gap-1.5 hover:shadow-card transition active:scale-95"
            >
              <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                📝
              </div>
              <span class="text-[11px] font-bold text-slate-800">Tugas</span>
            </button>

            <button
              @click="currentTab = 'report'"
              class="p-3 rounded-[20px] bg-white border border-slate-200/60 shadow-xs flex flex-col items-center justify-center text-center gap-1.5 hover:shadow-card transition active:scale-95"
            >
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                📊
              </div>
              <span class="text-[11px] font-bold text-slate-800">Rapor</span>
            </button>

            <button
              @click="currentTab = 'materials'"
              class="p-3 rounded-[20px] bg-white border border-slate-200/60 shadow-xs flex flex-col items-center justify-center text-center gap-1.5 hover:shadow-card transition active:scale-95"
            >
              <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg">
                📖
              </div>
              <span class="text-[11px] font-bold text-slate-800">Materi</span>
            </button>

            <button
              @click="currentTab = 'leaderboard'"
              class="p-3 rounded-[20px] bg-white border border-slate-200/60 shadow-xs flex flex-col items-center justify-center text-center gap-1.5 hover:shadow-card transition active:scale-95"
            >
              <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
                🏆
              </div>
              <span class="text-[11px] font-bold text-slate-800">Ranking</span>
            </button>
          </div>

          <!-- Materi Pembelajaran Terakhir -->

          <!-- Materi Pembelajaran Terakhir -->
          <div class="card p-4 space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-surface-100">
              <h3 class="font-bold text-surface-900 text-xs flex items-center gap-1.5">
                <span>📚</span> Materi Pelajaran yang Pernah Diikuti
              </h3>
              <button @click="currentTab = 'materials'" class="text-[11px] text-primary-600 font-bold hover:underline">
                Lihat Semua
              </button>
            </div>

            <div v-if="materials.length === 0" class="text-center py-4 text-xs text-surface-400">
              Belum ada materi pembelajaran yang pernah kamu ikuti.
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="mat in materials.slice(0, 3)"
                :key="mat.id"
                @click="openMaterialViewer(mat)"
                class="p-3 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-between gap-3 cursor-pointer hover:border-primary-300 transition active:bg-surface-100"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    📽️
                  </div>
                  <div class="min-w-0">
                    <h4 class="text-xs font-bold text-surface-900 truncate">{{ mat.title }}</h4>
                    <p class="text-[10px] text-surface-500 truncate">{{ mat.subject }} &bull; {{ mat.slide_count }} Slide Materi</p>
                  </div>
                </div>
                <span class="text-xs text-primary-600 font-bold">Buka →</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: TUGAS & PENGUMPULAN (TASKS) -->
        <div v-else-if="currentTab === 'tasks'" class="space-y-4 animate-fade-in">
          <div class="flex items-center justify-between pb-1">
            <h2 class="text-sm font-black text-surface-900 flex items-center gap-2">
              <span>📝</span> Tugas & Penilaian Siswa
            </h2>
            <div class="flex gap-1 bg-surface-200 p-0.5 rounded-lg text-[10px] font-bold">
              <button
                @click="taskFilter = 'all'"
                class="px-2.5 py-1 rounded-md transition"
                :class="taskFilter === 'all' ? 'bg-white text-primary-800 shadow-xs' : 'text-surface-600'"
              >
                Semua
              </button>
              <button
                @click="taskFilter = 'pending'"
                class="px-2.5 py-1 rounded-md transition"
                :class="taskFilter === 'pending' ? 'bg-white text-primary-800 shadow-xs' : 'text-surface-600'"
              >
                Belum ({{ pendingTasksCount }})
              </button>
              <button
                @click="taskFilter = 'completed'"
                class="px-2.5 py-1 rounded-md transition"
                :class="taskFilter === 'completed' ? 'bg-white text-primary-800 shadow-xs' : 'text-surface-600'"
              >
                Selesai
              </button>
            </div>
          </div>

          <div v-if="filteredTasks.length === 0" class="card p-8 text-center text-surface-400 text-xs">
            Tidak ada tugas pada kategori ini.
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="task in filteredTasks"
              :key="task.id"
              class="card p-4 space-y-3 border border-surface-200"
            >
              <div class="flex items-start justify-between gap-2">
                <div>
                  <span class="badge badge-primary text-[10px] px-2 py-0.5 font-bold">
                    {{ task.subject_name }}
                  </span>
                  <h3 class="text-xs font-black text-surface-900 mt-1">
                    {{ task.title }}
                  </h3>
                </div>
                <span
                  class="badge text-[10px] font-bold whitespace-nowrap"
                  :class="task.status === 'graded' ? 'badge-success' : (task.status === 'submitted' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'badge-warning')"
                >
                  {{ task.status === 'graded' ? `Nilai: ${task.submission?.score}` : (task.status === 'submitted' ? 'Menunggu Penilaian' : 'Belum Dikumpul') }}
                </span>
              </div>

              <p class="text-xs text-surface-600 leading-relaxed">
                {{ task.description || 'Kerjakan tugas sesuai instruksi guru di kelas.' }}
              </p>

              <!-- Feedback Guru jika ada -->
              <div v-if="task.submission?.feedback" class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900">
                <span class="font-bold block">💬 Catatan Guru:</span>
                <span>{{ task.submission.feedback }}</span>
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-surface-100 text-[11px]">
                <span class="text-surface-400">Batas: {{ task.due_date || 'Minggu ini' }}</span>
                <button
                  @click="openSubmitTaskModal(task)"
                  class="btn text-xs px-3 py-1 font-bold rounded-lg"
                  :class="task.status === 'pending' ? 'btn-primary' : 'btn-secondary'"
                >
                  {{ task.status === 'pending' ? 'Kirim Tugas 📤' : 'Perbarui Jawaban ✏️' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 3: RAPOR & RIWAYAT ULANGAN/CBT (REPORT) -->
        <div v-else-if="currentTab === 'report'" class="space-y-4 animate-fade-in">
          <div class="flex items-center justify-between pb-1">
            <h2 class="text-sm font-black text-surface-900 flex items-center gap-2">
              <span>📊</span> Rapor Mata Pelajaran & Riwayat
            </h2>
          </div>

          <!-- Rapor Mata Pelajaran Pribadi -->
          <div class="card p-4 space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-surface-100">
              <div>
                <h3 class="font-bold text-surface-900 text-xs">Capaian Nilai Rapor Semester</h3>
                <p class="text-[10px] text-surface-400">Kurikulum Merdeka &bull; SMPN 6 Kendari</p>
              </div>
              <div class="text-right">
                <span class="text-xs font-black text-primary-700">Rata-rata: {{ hasReportGrades ? reportSummary.average_score : '-' }}</span>
                <span class="block text-[10px] text-surface-500 font-bold">{{ hasReportGrades ? reportSummary.predicate : 'Belum Ada Nilai' }}</span>
              </div>
            </div>

            <div v-if="reportSubjects.length === 0" class="text-center py-4 text-xs text-surface-400">
              Belum ada data nilai rapor untuk semester ini.
            </div>

            <div v-else class="space-y-2.5">
              <div
                v-for="sub in reportSubjects"
                :key="sub.id"
                class="p-3 rounded-xl bg-surface-50 border border-surface-200 space-y-2"
              >
                <div class="flex items-center justify-between">
                  <span class="font-black text-xs text-surface-900">{{ sub.subject_name || sub.subject }}</span>
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      Nilai: {{ sub.final_score }}
                    </span>
                    <span class="badge badge-secondary text-[10px]">{{ sub.predicate || 'Tuntas' }}</span>
                  </div>
                </div>

                <div class="grid grid-cols-4 gap-1 text-[10px] text-center text-surface-500 pt-1 border-t border-surface-200/60">
                  <div class="bg-white p-1 rounded border border-surface-100">
                    <span class="block text-[9px] text-surface-400">TP 1</span>
                    <strong class="text-surface-800">{{ sub.tp1_score !== undefined && sub.tp1_score !== null ? sub.tp1_score : '—' }}</strong>
                  </div>
                  <div class="bg-white p-1 rounded border border-surface-100">
                    <span class="block text-[9px] text-surface-400">TP 2</span>
                    <strong class="text-surface-800">{{ sub.tp2_score !== undefined && sub.tp2_score !== null ? sub.tp2_score : '—' }}</strong>
                  </div>
                  <div class="bg-white p-1 rounded border border-surface-100">
                    <span class="block text-[9px] text-surface-400">STS</span>
                    <strong class="text-surface-800">{{ sub.sts_score !== undefined && sub.sts_score !== null ? sub.sts_score : '—' }}</strong>
                  </div>
                  <div class="bg-white p-1 rounded border border-surface-100">
                    <span class="block text-[9px] text-surface-400">SAS</span>
                    <strong class="text-surface-800">{{ sub.sas_score !== undefined && sub.sas_score !== null ? sub.sas_score : '—' }}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Riwayat Ujian CBT & Game Boss Battle -->
          <div class="card p-4 space-y-3">
            <h3 class="font-bold text-surface-900 text-xs pb-2 border-b border-surface-100 flex items-center gap-1.5">
              <span>📜</span> Riwayat Ujian CBT & Ulangan Gamifikasi
            </h3>

            <div v-if="examHistory.cbt.length === 0 && examHistory.games.length === 0" class="text-center py-4 text-xs text-surface-400">
              Belum ada riwayat pengerjaan ujian atau ulangan.
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="cbt in examHistory.cbt"
                :key="cbt.id"
                class="p-2.5 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 class="font-bold text-surface-900">{{ cbt.exam?.title || 'Ujian Digital CBT' }}</h4>
                  <span class="text-[10px] text-surface-400">{{ cbt.started_at ? new Date(cbt.started_at).toLocaleDateString('id-ID') : 'Hari ini' }}</span>
                </div>
                <div class="text-right">
                  <span class="font-black text-xs text-emerald-700 block">Selesai</span>
                  <span class="text-[10px] text-surface-500">Tuntas KKM</span>
                </div>
              </div>

              <div
                v-for="game in examHistory.games"
                :key="game.id"
                class="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 class="font-bold text-surface-900">⚔️ {{ game.title || 'Boss Battle Ulangan Harian' }}</h4>
                  <span class="text-[10px] text-surface-500">{{ game.mode === 'boss_battle' ? 'Mode Boss Battle' : 'Ulangan Gamifikasi' }}</span>
                </div>
                <div class="text-right">
                  <span class="badge badge-warning text-[10px] font-bold">Terdaftar</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 4: MATERI PRESENTASI (MATERIALS) -->
        <div v-else-if="currentTab === 'materials'" class="space-y-4 animate-fade-in">
          <div class="flex items-center justify-between pb-1">
            <h2 class="text-sm font-black text-surface-900 flex items-center gap-2">
              <span>📖</span> Materi Slide yang Pernah Kamu Ikuti
            </h2>
            <span class="text-[10px] text-surface-400">{{ materials.length }} Materi</span>
          </div>

          <div v-if="materials.length === 0" class="card p-8 text-center text-surface-400 text-xs">
            Belum ada slide materi pembelajaran yang pernah kamu ikuti. Bergabunglah ke sesi presentasi guru saat jam pelajaran untuk membuka materi di sini.
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="mat in materials"
              :key="mat.id"
              class="card p-4 space-y-2 border border-surface-200 hover:border-primary-300 transition cursor-pointer"
              @click="openMaterialViewer(mat)"
            >
              <div class="flex items-start justify-between gap-2">
                <div>
                  <span class="badge badge-secondary text-[10px] px-2 py-0.5 font-bold">
                    {{ mat.subject }}
                  </span>
                  <h3 class="text-xs font-black text-surface-900 mt-1">
                    {{ mat.title }}
                  </h3>
                </div>
                <div class="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-sm">
                  📽️
                </div>
              </div>

              <p class="text-xs text-surface-600 leading-relaxed">
                {{ mat.description || 'Buka dan baca kembali materi presentasi slide ini secara mandiri.' }}
              </p>

              <div class="flex items-center justify-between pt-2 border-t border-surface-100 text-[11px]">
                <span class="text-surface-400">{{ mat.slide_count }} Slide Pembelajaran</span>
                <span class="text-primary-600 font-bold flex items-center gap-1">
                  Buka Slide Mandiri →
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 5: LIVE RANKING (LEADERBOARD) -->
        <div v-else-if="currentTab === 'leaderboard'" class="space-y-4 animate-fade-in">
          <div class="card p-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl shadow-md text-center space-y-1">
            <span class="text-3xl block">🏆</span>
            <h2 class="text-base font-black">Live Ranking Kelas {{ student?.classroom_name || 'VII A' }}</h2>
            <p class="text-[11px] text-amber-100">Berdasarkan keaktifan, tugas, kuis, dan ujian digital</p>
          </div>

          <div class="card p-4 space-y-2">
            <div
              v-for="item in leaderboard"
              :key="item.id"
              class="p-3 rounded-xl border flex items-center justify-between gap-3 transition"
              :class="item.is_me ? 'bg-primary-50/80 border-primary-300 ring-1 ring-primary-300 font-bold' : 'bg-surface-50 border-surface-200'"
            >
              <div class="flex items-center gap-3 min-w-0">
                <span class="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs"
                  :class="item.rank === 1 ? 'bg-amber-400 text-amber-950' : (item.rank === 2 ? 'bg-slate-300 text-slate-800' : (item.rank === 3 ? 'bg-amber-700 text-white' : 'bg-surface-200 text-surface-700'))"
                >
                  {{ item.rank === 1 ? '🥇' : (item.rank === 2 ? '🥈' : (item.rank === 3 ? '🥉' : item.rank)) }}
                </span>
                <div class="min-w-0">
                  <h4 class="text-xs text-surface-900 truncate">
                    {{ item.name }}
                    <span v-if="item.is_me" class="badge badge-primary text-[9px] ml-1">Saya</span>
                  </h4>
                  <p class="text-[10px] text-surface-500">NIS: {{ item.nis }}</p>
                </div>
              </div>

              <div class="text-right">
                <span class="text-xs font-black text-primary-700 block">{{ item.points }} Poin</span>
                <span class="text-[10px] text-surface-400">Rata: {{ item.average_score }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 6: PENGATURAN PROFIL SISWA (PROFILE) -->
        <div v-else-if="currentTab === 'profile'" class="space-y-4 animate-fade-in">
          <div class="card p-5 space-y-4">
            <h2 class="text-sm font-black text-surface-900 pb-2 border-b border-surface-100 flex items-center gap-2">
              <span>👤</span> Pengaturan Profil & Akun Siswa
            </h2>

            <!-- Student Photo Upload Card -->
            <div class="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div class="relative group shrink-0">
                <div class="w-20 h-20 rounded-2xl overflow-hidden bg-[#0c2b3d] text-white flex items-center justify-center font-black text-2xl shadow-md ring-2 ring-white">
                  <img
                    v-if="student?.avatar_url || student?.avatar_path"
                    :src="student.avatar_url || student.avatar_path"
                    alt="Foto Profil Siswa"
                    class="w-full h-full object-cover"
                  />
                  <span v-else>{{ student?.name?.charAt(0) || 'S' }}</span>
                </div>

                <label
                  class="absolute inset-0 rounded-2xl bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-center p-1 backdrop-blur-[2px]"
                  title="Klik untuk ubah foto"
                >
                  <span class="text-lg">📷</span>
                  <span class="text-[9px] font-bold mt-0.5">Ubah</span>
                  <input type="file" accept="image/*" class="hidden" @change="handleStudentAvatarChange" />
                </label>

                <div
                  v-if="uploadingStudentAvatar"
                  class="absolute inset-0 rounded-2xl bg-black/75 text-white flex flex-col items-center justify-center text-center p-1 z-20"
                >
                  <span class="spinner w-4 h-4 border-white mb-1"></span>
                  <span class="text-[9px] font-bold">Upload...</span>
                </div>
              </div>

              <div class="space-y-1.5 flex-1 min-w-0">
                <h3 class="text-xs font-bold text-slate-900 leading-tight">Foto Profil Siswa</h3>
                <p class="text-[11px] text-slate-500 leading-tight">Gunakan foto wajah siswa yang jelas dan rapi untuk identitas portal & rapor.</p>
                <div class="flex items-center gap-2 pt-1">
                  <label class="px-3 py-1 rounded-xl bg-[#0c2b3d] hover:bg-[#081e2b] text-white text-[11px] font-bold cursor-pointer transition flex items-center gap-1 shadow-2xs">
                    <span>📷</span>
                    <span>{{ student?.avatar_url ? 'Ganti Foto' : 'Pilih Foto' }}</span>
                    <input type="file" accept="image/*" class="hidden" @change="handleStudentAvatarChange" />
                  </label>
                  <button
                    v-if="student?.avatar_url || student?.avatar_path"
                    @click="handleRemoveStudentAvatar"
                    type="button"
                    class="px-2.5 py-1 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-[11px] font-semibold transition border border-slate-200 hover:border-rose-200"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>

            <form @submit.prevent="updateProfile" class="space-y-3 text-xs">
              <div>
                <label class="label text-[11px]">Nama Lengkap Siswa</label>
                <input v-model="profileForm.name" type="text" class="input text-xs font-semibold" required />
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="label text-[11px]">NIS (Nomor Induk)</label>
                  <input :value="student?.nis" type="text" class="input text-xs font-mono bg-surface-100" disabled />
                </div>
                <div>
                  <label class="label text-[11px]">Kelas</label>
                  <input :value="student?.classroom_name" type="text" class="input text-xs font-bold bg-surface-100" disabled />
                </div>
              </div>

              <div>
                <label class="label text-[11px]">Nomor WhatsApp / HP Siswa</label>
                <input v-model="profileForm.phone" type="tel" class="input text-xs font-mono" placeholder="08..." />
              </div>

              <div>
                <label class="label text-[11px]">Nama Orang Tua / Wali</label>
                <input v-model="profileForm.parent_name" type="text" class="input text-xs" placeholder="Nama ayah/ibu/wali" />
              </div>

              <div>
                <label class="label text-[11px]">Nomor WhatsApp Orang Tua</label>
                <input v-model="profileForm.parent_phone" type="tel" class="input text-xs font-mono" placeholder="08..." />
              </div>

              <div>
                <label class="label text-[11px]">Alamat Tempat Tinggal</label>
                <textarea v-model="profileForm.address" rows="2" class="input text-xs" placeholder="Alamat rumah siswa"></textarea>
              </div>

              <div class="pt-2 border-t border-surface-100">
                <label class="label text-[11px]">Ganti Kata Sandi (Password Baru)</label>
                <input v-model="profileForm.password" type="password" class="input text-xs font-mono" placeholder="Kosongkan jika tidak ingin ganti" />
                <span class="text-[10px] text-surface-400 mt-1 block">Kata sandi baru akan disinkronkan ke database sekolah.</span>
              </div>

              <div class="pt-2">
                <button
                  type="submit"
                  :disabled="savingProfile"
                  class="btn btn-primary w-full text-xs py-2.5 font-bold shadow-md flex items-center justify-center gap-2"
                >
                  <span v-if="savingProfile" class="spinner w-3.5 h-3.5"></span>
                  <span>{{ savingProfile ? 'Menyimpan...' : 'Simpan Perubahan Profil 💾' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </template>
    </main>

    <!-- Modal Submit Tugas Siswa -->
    <Teleport to="body">
      <div v-if="activeSubmitTask" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="activeSubmitTask = null"></div>
        <div class="relative bg-white rounded-3xl shadow-modal w-full max-w-sm p-6 space-y-4 animate-scale-up text-xs">
          <div class="flex items-center justify-between pb-2 border-b border-surface-100">
            <div>
              <h3 class="font-bold text-surface-900 text-sm">Pengumpulan Tugas Siswa</h3>
              <p class="text-[11px] text-surface-500">{{ activeSubmitTask.title }}</p>
            </div>
            <button @click="activeSubmitTask = null" class="text-surface-400 hover:text-surface-700 text-lg">✕</button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="label text-[11px]">Jawaban / Catatan Pengerjaan</label>
              <textarea
                v-model="submissionInput.text"
                rows="4"
                class="input text-xs"
                placeholder="Tuliskan rangkuman atau jawaban tugas Anda di sini..."
              ></textarea>
            </div>

            <div>
              <label class="label text-[11px]">Tautan Dokumen / File Tugas (Opsional)</label>
              <input
                v-model="submissionInput.file_url"
                type="url"
                class="input text-xs font-mono"
                placeholder="https://drive.google.com/..."
              />
              <span class="text-[10px] text-surface-400 block mt-0.5">Tautan Google Drive / Canva / Dokumen tugas</span>
            </div>
          </div>

          <div class="flex gap-2 pt-2">
            <button @click="activeSubmitTask = null" class="btn btn-secondary flex-1 text-xs py-2">Batal</button>
            <button
              @click="submitTaskToServer"
              :disabled="submittingTask"
              class="btn btn-primary flex-1 text-xs py-2 font-bold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span v-if="submittingTask" class="spinner w-3 h-3"></span>
              <span>Kirim ke Guru 🚀</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Viewer Materi Slide Mandiri -->
    <Teleport to="body">
      <div v-if="activeMaterial" class="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-scale-up text-xs">
          <!-- Slide Header -->
          <div class="p-4 bg-gradient-to-r from-primary-900 to-indigo-900 text-white flex items-center justify-between">
            <div>
              <span class="text-[10px] text-white/70 uppercase font-bold block">{{ activeMaterial.subject }} &bull; Materi Mandiri</span>
              <h3 class="text-xs font-bold text-white truncate max-w-[240px]">{{ activeMaterial.title }}</h3>
            </div>
            <button @click="activeMaterial = null" class="text-white/80 hover:text-white text-xl">✕</button>
          </div>

          <!-- Slide Content Body -->
          <div class="flex-1 overflow-y-auto p-5 space-y-4 bg-surface-50">
            <div v-if="activeMaterial.slides && activeMaterial.slides.length > 0">
              <div class="p-5 rounded-2xl bg-white border border-surface-200 shadow-sm space-y-3 min-h-[220px] flex flex-col justify-center">
                <div class="flex items-center justify-between text-[11px] text-surface-400 pb-1 border-b border-surface-100">
                  <span class="font-bold text-primary-700">Slide {{ currentSlideIndex + 1 }} dari {{ activeMaterial.slides.length }}</span>
                  <span>{{ activeMaterial.slides[currentSlideIndex]?.layout || 'Materi' }}</span>
                </div>

                <!-- Gambar Visual Slide jika ada -->
                <div
                  v-if="activeMaterial.slides[currentSlideIndex]?.image"
                  class="w-full rounded-xl overflow-hidden bg-black flex items-center justify-center my-2 max-h-64 shadow-inner"
                >
                  <img
                    :src="activeMaterial.slides[currentSlideIndex].image"
                    :alt="activeMaterial.slides[currentSlideIndex]?.title || 'Visual Slide'"
                    class="w-full h-auto max-h-64 object-contain pointer-events-none select-none"
                  />
                </div>

                <h4 class="text-sm font-black text-surface-900 leading-snug">
                  {{ activeMaterial.slides[currentSlideIndex]?.title || 'Pokok Bahasan' }}
                </h4>
                <p class="text-xs text-surface-700 leading-relaxed whitespace-pre-line">
                  {{ activeMaterial.slides[currentSlideIndex]?.content || 'Materi penjelasan slide.' }}
                </p>
              </div>

              <!-- Slide Controls -->
              <div class="flex items-center justify-between pt-3">
                <button
                  @click="currentSlideIndex = Math.max(0, currentSlideIndex - 1)"
                  :disabled="currentSlideIndex === 0"
                  class="btn btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
                >
                  ← Slide Sebelumnya
                </button>
                <span class="font-mono text-xs text-surface-500 font-bold">
                  {{ currentSlideIndex + 1 }} / {{ activeMaterial.slides.length }}
                </span>
                <button
                  @click="currentSlideIndex = Math.min(activeMaterial.slides.length - 1, currentSlideIndex + 1)"
                  :disabled="currentSlideIndex >= activeMaterial.slides.length - 1"
                  class="btn btn-primary text-xs px-3 py-1.5 disabled:opacity-40"
                >
                  Slide Berikutnya →
                </button>
              </div>
            </div>
            <div v-else class="text-center py-10 text-surface-400">
              Tidak ada konten slide untuk materi ini.
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Bottom Navigation Bar (Modern Petrol & Canvas) -->
    <nav class="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 max-w-md mx-auto shadow-lg rounded-t-3xl">
      <div class="grid grid-cols-5 py-2 px-2">
        <button
          @click="currentTab = 'home'"
          class="flex flex-col items-center justify-center py-1 text-center transition"
          :class="currentTab === 'home' ? 'text-[#0c2b3d] font-black scale-105' : 'text-slate-400 hover:text-slate-600 font-medium'"
        >
          <span class="text-lg">🏠</span>
          <span class="text-[10px] mt-0.5">Beranda</span>
        </button>

        <button
          @click="currentTab = 'tasks'"
          class="flex flex-col items-center justify-center py-1 text-center transition relative"
          :class="currentTab === 'tasks' ? 'text-[#0c2b3d] font-black scale-105' : 'text-slate-400 hover:text-slate-600 font-medium'"
        >
          <span class="text-lg">📝</span>
          <span class="text-[10px] mt-0.5">Tugas</span>
          <span v-if="pendingTasksCount > 0" class="absolute top-0.5 right-3 w-4 h-4 rounded-full bg-[#f59e0b] text-slate-950 text-[9px] font-black flex items-center justify-center shadow-xs">
            {{ pendingTasksCount }}
          </span>
        </button>

        <button
          @click="currentTab = 'report'"
          class="flex flex-col items-center justify-center py-1 text-center transition"
          :class="currentTab === 'report' ? 'text-[#0c2b3d] font-black scale-105' : 'text-slate-400 hover:text-slate-600 font-medium'"
        >
          <span class="text-lg">📊</span>
          <span class="text-[10px] mt-0.5">Rapor</span>
        </button>

        <button
          @click="currentTab = 'materials'"
          class="flex flex-col items-center justify-center py-1 text-center transition"
          :class="currentTab === 'materials' ? 'text-[#0c2b3d] font-black scale-105' : 'text-slate-400 hover:text-slate-600 font-medium'"
        >
          <span class="text-lg">📖</span>
          <span class="text-[10px] mt-0.5">Materi</span>
        </button>

        <button
          @click="currentTab = 'profile'"
          class="flex flex-col items-center justify-center py-1 text-center transition"
          :class="currentTab === 'profile' ? 'text-[#0c2b3d] font-black scale-105' : 'text-slate-400 hover:text-slate-600 font-medium'"
        >
          <span class="text-lg">👤</span>
          <span class="text-[10px] mt-0.5">Profil</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import { realtimeBossBattle } from '@/services/realtimeBossBattle'
import { getActiveBattleDispatch } from '@/modules/games/bossBattle/sessionStore'
import { compressImageFile } from '@/utils/imageHelper'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const currentTab = ref<'home' | 'tasks' | 'report' | 'materials' | 'leaderboard' | 'profile'>('home')
const taskFilter = ref<'all' | 'pending' | 'completed'>('all')

const student = ref<any>(null)
const tasks = ref<any[]>([])
const reportSummary = ref<any>({ total_subjects: 0, average_score: 0, predicate: '-' })
const reportSubjects = ref<any[]>([])
const examHistory = ref<any>({ cbt: [], games: [] })
const materials = ref<any[]>([])
const leaderboard = ref<any[]>([])

// Profil Form
const savingProfile = ref(false)
const uploadingStudentAvatar = ref(false)
const profileForm = reactive({
  name: '',
  phone: '',
  parent_name: '',
  parent_phone: '',
  address: '',
  password: ''
})

// Submit Task Modal
const activeSubmitTask = ref<any>(null)
const submittingTask = ref(false)
const submissionInput = reactive({
  text: '',
  file_url: ''
})

// Material Viewer Modal
const activeMaterial = ref<any>(null)
const currentSlideIndex = ref(0)

// LIVE AUTO-DISPATCH (Heartbeat Checker)
let broadcastInterval: ReturnType<typeof setInterval>
const liveDispatchData = ref<any>(null)
const liveSessionNotice = ref<any>(null)
const autoRedirectCountdown = ref(3)
let countdownInterval: ReturnType<typeof setInterval>
let hasAcknowledgedSessionId = ''

const pendingTasksCount = computed(() => {
  return tasks.value.filter(t => t.status === 'pending').length
})

const hasReportGrades = computed(() => {
  return (reportSummary.value?.total_subjects || 0) > 0 || (reportSubjects.value && reportSubjects.value.length > 0)
})

const displayRank = computed(() => {
  const me = leaderboard.value.find(l => l.is_me)
  if (me && (me.has_grades || me.points > 0)) {
    return `#${me.rank} Kelas`
  }
  return '-'
})

const myRank = computed(() => {
  const me = leaderboard.value.find(l => l.is_me)
  return me ? me.rank : '-'
})

const filteredTasks = computed(() => {
  if (taskFilter.value === 'pending') return tasks.value.filter(t => t.status === 'pending')
  if (taskFilter.value === 'completed') return tasks.value.filter(t => t.status !== 'pending')
  return tasks.value
})

async function fetchStudentProfile() {
  try {
    const res = await api.get('/student/profile')
    student.value = res.data?.data || res.data
    if (student.value) {
      profileForm.name = student.value.name || ''
      profileForm.phone = student.value.phone || ''
      profileForm.parent_name = student.value.parent_name || ''
      profileForm.parent_phone = student.value.parent_phone || ''
      profileForm.address = student.value.address || ''
    }
  } catch (err) {
    console.error('Failed to load student profile:', err)
  }
}

async function fetchTasks() {
  try {
    const res = await api.get('/student/tasks')
    tasks.value = res.data?.data || []
  } catch (err) {
    console.error('Failed to load student tasks:', err)
  }
}

async function fetchReportCard() {
  try {
    const res = await api.get('/student/report-card')
    const d = res.data?.data || {}
    reportSummary.value = d.summary || { total_subjects: 0, average_score: 0, predicate: '-' }
    reportSubjects.value = d.subjects || []
  } catch (err) {
    console.error('Failed to load report card:', err)
    reportSummary.value = { total_subjects: 0, average_score: 0, predicate: '-' }
    reportSubjects.value = []
  }
}

async function fetchExamHistory() {
  try {
    const res = await api.get('/student/exam-history')
    examHistory.value = res.data?.data || { cbt: [], games: [] }
  } catch (err) {
    console.error('Failed to load exam history:', err)
  }
}

async function fetchMaterials() {
  try {
    const res = await api.get('/student/materials')
    materials.value = res.data?.data || []
  } catch (err) {
    console.error('Failed to load materials:', err)
  }
}

async function fetchLeaderboard() {
  try {
    const res = await api.get('/student/leaderboard')
    leaderboard.value = res.data?.data || []
  } catch (err) {
    console.error('Failed to load leaderboard:', err)
  }
}

// Watcher Live Broadcast Auto-Trigger
async function checkLiveBroadcast() {
  try {
    const res = await api.get('/student/live-broadcast')
    const data = res.data?.data || {}
    liveDispatchData.value = data

    // Jika guru memulai sesi baru dan siswa belum dialihkan
    if (data.active && data.session_id && data.session_id !== hasAcknowledgedSessionId) {
      hasAcknowledgedSessionId = data.session_id
      liveSessionNotice.value = data
      startAutoCountdown()
    } else if (!data.active) {
      liveSessionNotice.value = null
      clearInterval(countdownInterval)
    }
  } catch {
    // Silent polling
  }
}

let unsubPortalBattle: (() => void) | null = null

function checkIsStudentSelected(payload: any): boolean {
  const currentStd = student.value || authStore.user
  if (!currentStd || !payload) return false

  const participantIds: string[] = (payload.participantIds || []).map(String)
  const studentIds: string[] = (payload.studentIds || []).map(String)
  const participantNames: string[] = (payload.participantNames || []).map((n: string) =>
    (n || '').toLowerCase().trim()
  )

  const myId = String(currentStd.id || '')
  const myStudentId = String(currentStd.student_id || '')
  const myUsername = String(currentStd.username || '')
  const myNis = String(currentStd.nis || '')
  const myName = (currentStd.name || '').toLowerCase().trim()

  return (
    (myId && (participantIds.includes(myId) || studentIds.includes(myId))) ||
    (myStudentId && (participantIds.includes(myStudentId) || studentIds.includes(myStudentId))) ||
    (myUsername && (participantIds.includes(myUsername) || studentIds.includes(myUsername))) ||
    (myNis && (participantIds.includes(myNis) || studentIds.includes(myNis))) ||
    (myName && participantNames.includes(myName))
  )
}

function handlePortalBattleStart(payload: any) {
  if (!payload || !payload.sessionId) return
  if (router.currentRoute.value.path.includes('/games/ulangan-harian/play')) return

  if (checkIsStudentSelected(payload)) {
    hasAcknowledgedSessionId = payload.sessionId
    liveSessionNotice.value = {
      type: 'game',
      title: payload.title || 'Boss Battle — Ulangan Harian',
      session_id: payload.sessionId,
      target_url: `/games/ulangan-harian/play/${payload.sessionId}`,
      message: `Guru telah memulai Boss Battle melawan ${payload.bossName || 'Boss'}. Kamu diceklis ikut pertempuran!`
    }
    startAutoCountdown()
  }
}

function startAutoCountdown() {
  autoRedirectCountdown.value = 3
  clearInterval(countdownInterval)
  countdownInterval = setInterval(() => {
    autoRedirectCountdown.value--
    if (autoRedirectCountdown.value <= 0) {
      clearInterval(countdownInterval)
      proceedToLiveSession()
    }
  }, 1000)
}

function proceedToLiveSession() {
  if (liveSessionNotice.value?.target_url) {
    const target = liveSessionNotice.value.target_url
    liveSessionNotice.value = null
    clearInterval(countdownInterval)
    router.push(target)
  }
}

function cancelAutoRedirect() {
  clearInterval(countdownInterval)
  liveSessionNotice.value = null
}


function openMaterialViewer(mat: any) {
  activeMaterial.value = mat
  currentSlideIndex.value = 0
}

function openSubmitTaskModal(task: any) {
  activeSubmitTask.value = task
  submissionInput.text = task.submission?.submission_text || ''
  submissionInput.file_url = task.submission?.file_url || ''
}

async function submitTaskToServer() {
  if (!activeSubmitTask.value) return
  submittingTask.value = true
  try {
    await api.post(`/student/tasks/${activeSubmitTask.value.id}/submit`, {
      submission_text: submissionInput.text,
      file_url: submissionInput.file_url
    })
    alert('✅ Tugas berhasil dikumpulkan ke guru!')
    activeSubmitTask.value = null
    await fetchTasks()
  } catch (err: any) {
    alert('Gagal mengumpulkan tugas: ' + (err.response?.data?.message || err.message))
  } finally {
    submittingTask.value = false
  }
}

async function updateProfile() {
  savingProfile.value = true
  try {
    const payload: any = {
      name: profileForm.name,
      phone: profileForm.phone,
      parent_name: profileForm.parent_name,
      parent_phone: profileForm.parent_phone,
      address: profileForm.address
    }
    if (profileForm.password.trim()) {
      payload.password = profileForm.password.trim()
    }

    const res = await api.put('/student/profile', payload)
    student.value = res.data?.data || student.value
    profileForm.password = ''
    alert('✅ Profil siswa berhasil diperbarui dan disinkronkan ke basis data sekolah!')
  } catch (err: any) {
    alert('Gagal memperbarui profil: ' + (err.response?.data?.message || err.message))
  } finally {
    savingProfile.value = false
  }
}

async function handleStudentAvatarChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploadingStudentAvatar.value = true
  try {
    const base64Image = await compressImageFile(file, 600, 600, 0.85)
    const res = await api.post('/profile/avatar', { avatar: base64Image })
    const newAvatarUrl = res.data?.data?.avatar_url || base64Image
    if (student.value) {
      student.value.avatar_url = newAvatarUrl
      student.value.avatar_path = newAvatarUrl
    }
    authStore.updateUser({
      avatar_url: newAvatarUrl,
      avatar_path: newAvatarUrl
    })
    alert('✅ Foto profil siswa berhasil diperbarui!')
  } catch (err: any) {
    alert('Gagal mengunggah foto profil: ' + (err.response?.data?.message || err.message))
  } finally {
    uploadingStudentAvatar.value = false
    input.value = ''
  }
}

async function handleRemoveStudentAvatar() {
  if (!confirm('Apakah kamu yakin ingin menghapus foto profil?')) return

  uploadingStudentAvatar.value = true
  try {
    await api.post('/profile/avatar', { avatar: 'remove' })
    if (student.value) {
      student.value.avatar_url = ''
      student.value.avatar_path = ''
    }
    authStore.updateUser({
      avatar_url: '',
      avatar_path: ''
    })
    alert('✅ Foto profil siswa berhasil dihapus.')
  } catch (err: any) {
    alert('Gagal menghapus foto: ' + (err.response?.data?.message || err.message))
  } finally {
    uploadingStudentAvatar.value = false
  }
}

async function handleLogout() {
  if (confirm('Apakah Anda yakin ingin keluar dari aplikasi siswa?')) {
    await authStore.logout()
    router.push('/login')
  }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([
    fetchStudentProfile(),
    fetchTasks(),
    fetchReportCard(),
    fetchExamHistory(),
    fetchMaterials(),
    fetchLeaderboard()
  ])
  loading.value = false

  // Jalankan cek live broadcast setiap 3 detik
  checkLiveBroadcast()
  broadcastInterval = setInterval(checkLiveBroadcast, 3000)

  // Real-time battle started listener
  unsubPortalBattle = realtimeBossBattle.subscribe('battle.started', (payload: any) => {
    handlePortalBattleStart(payload)
  })

  // Check if an active battle dispatch exists on load
  const activeDispatch = getActiveBattleDispatch()
  if (activeDispatch) {
    handlePortalBattleStart(activeDispatch)
  }
})

onUnmounted(() => {
  clearInterval(broadcastInterval)
  clearInterval(countdownInterval)
  unsubPortalBattle?.()
})
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fadeIn 0.25s ease-out;
}
.animate-scale-up {
  animation: scaleUp 0.25s ease-out;
}
</style>
