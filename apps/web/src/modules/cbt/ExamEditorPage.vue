<template>
  <div class="space-y-6 max-w-4xl pb-16">
    <!-- Header -->
    <div class="card p-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 bg-white/95 backdrop-blur-md shadow-sm">
      <div class="flex items-center gap-3">
        <router-link to="/cbt" class="btn btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1">
          ← Kembali ke CBT
        </router-link>
        <div>
          <h2 class="font-bold text-surface-900 text-sm leading-tight">
            {{ form.title || 'Paket Ujian CBT Baru' }}
          </h2>
          <span class="text-[11px] text-surface-500">
            {{ form.subject }} &bull; Kelas {{ form.classroom }} &bull; Durasi {{ form.durationMinutes }} Menit &bull; {{ questionsList.length }} Soal
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="saveExam"
          :disabled="isSaving"
          class="btn btn-primary text-xs px-5 py-2 font-bold shadow-sm flex items-center gap-2"
        >
          <svg v-if="isSaving" class="spinner w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-if="!isSaving">🚀 Terbitkan Paket Ujian</span>
          <span v-else>Menyimpan...</span>
        </button>
      </div>
    </div>

    <!-- Alert Sukses / Info -->
    <div v-if="successNotice" class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span>✅</span>
        <span>{{ successNotice }}</span>
      </div>
      <button @click="successNotice = ''" class="text-emerald-600 hover:text-emerald-800 font-bold">✕</button>
    </div>

    <!-- Form Section -->
    <div class="space-y-6 text-xs">
      <!-- 1. Identitas Pokok Ujian -->
      <div class="card space-y-4">
        <h3 class="text-sm font-bold text-surface-900 pb-2 border-b border-surface-100 flex items-center gap-2">
          <span>📝</span> 1. Identitas & Jadwal Sesi Ujian
        </h3>

        <div class="space-y-3">
          <div>
            <label class="label">Judul Ujian CBT</label>
            <input v-model="form.title" type="text" class="input text-xs font-semibold" placeholder="Misal: Sumatif Tengah Semester: Informatika Fase D" required />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="label">Sasaran Rombel</label>
              <select v-model="form.classroom" @change="onClassroomChange" class="input text-xs font-bold">
                <option v-for="c in classrooms" :key="c.id" :value="c.name">
                  {{ formatClassLabel(c) }}
                </option>
              </select>
            </div>
            <div>
              <label class="label">Mata Pelajaran (Sesuai Jadwal)</label>
              <select v-model="form.subject" class="input text-xs" @change="onSubjectChange">
                <option v-for="s in availableExamSubjects" :key="s.id" :value="s.name">
                  {{ s.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="label">KKTP Minimum</label>
              <input v-model.number="form.kktp" type="number" class="input text-xs font-bold" min="50" max="100" />
            </div>
          </div>

          <!-- Pemetaan Kategori Asesmen ke Rekap Nilai Rapor -->
          <div class="p-3.5 bg-gradient-to-r from-blue-50/70 via-indigo-50/60 to-purple-50/50 border border-indigo-200/80 rounded-2xl space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="text-lg">📊</span>
                <div>
                  <h4 class="text-xs font-bold text-indigo-950">Pemetaan Asesmen ke Rekap Nilai Siswa</h4>
                  <p class="text-[11px] text-indigo-700">Tentukan kolom tujuan nilai CBT ini pada Rekap Nilai Kurikulum Merdeka</p>
                </div>
              </div>
              <div class="flex items-center gap-1.5 bg-indigo-600/10 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                <span>⚡</span>
                <span>Otomatis Masuk Rekap Nilai</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <!-- Pilihan STS -->
              <label
                @click="onSelectAssessmentType('sts')"
                class="flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all shadow-xs"
                :class="form.assessment_type === 'sts'
                  ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/40 text-amber-950 font-semibold'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/80'"
              >
                <input type="radio" v-model="form.assessment_type" value="sts" class="mt-0.5 text-amber-600 focus:ring-amber-500" />
                <div class="space-y-0.5">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold text-slate-900">📑 Sumatif Tengah Semester (STS)</span>
                    <span class="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">20%</span>
                  </div>
                  <p class="text-[11px] text-slate-500 leading-tight">
                    Nilai otomatis masuk ke kolom <strong>STS</strong> di Rekap Nilai Siswa.
                  </p>
                </div>
              </label>

              <!-- Pilihan SAS -->
              <label
                @click="onSelectAssessmentType('sas')"
                class="flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all shadow-xs"
                :class="form.assessment_type === 'sas'
                  ? 'bg-purple-500/15 border-purple-500 ring-2 ring-purple-500/40 text-purple-950 font-semibold'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/80'"
              >
                <input type="radio" v-model="form.assessment_type" value="sas" class="mt-0.5 text-purple-600 focus:ring-purple-500" />
                <div class="space-y-0.5">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold text-slate-900">🏆 Sumatif Akhir Semester (SAS)</span>
                    <span class="text-[10px] font-extrabold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">20%</span>
                  </div>
                  <p class="text-[11px] text-slate-500 leading-tight">
                    Nilai otomatis masuk ke kolom <strong>SAS</strong> di Rekap Nilai Siswa.
                  </p>
                </div>
              </label>

              <!-- Pilihan TP (Lingkup Materi) -->
              <label
                @click="onSelectAssessmentType('tp')"
                class="flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all shadow-xs"
                :class="form.assessment_type === 'tp'
                  ? 'bg-blue-500/15 border-blue-500 ring-2 ring-blue-500/40 text-blue-950 font-semibold'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/80'"
              >
                <input type="radio" v-model="form.assessment_type" value="tp" class="mt-0.5 text-blue-600 focus:ring-blue-500" />
                <div class="space-y-0.5">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold text-slate-900">🎯 Sumatif Lingkup Materi (TP)</span>
                    <span class="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">30%</span>
                  </div>
                  <p class="text-[11px] text-slate-500 leading-tight">
                    Nilai dipetakan ke <strong>Tujuan Pembelajaran (TP)</strong> pada Sumatif TP.
                  </p>
                </div>
              </label>
            </div>

            <!-- Jika tipe TP: Pilih TP -->
            <div v-if="form.assessment_type === 'tp'" class="pt-2 border-t border-indigo-200/70 flex flex-col sm:flex-row sm:items-center gap-2">
              <label class="label text-xs font-bold text-indigo-950 shrink-0">🎯 Target Tujuan Pembelajaran (TP):</label>
              <select v-model="form.tp_id" class="input text-xs font-semibold bg-white flex-1" required>
                <option value="">-- Pilih Tujuan Pembelajaran (TP) --</option>
                <optgroup v-for="chap in availableChapters" :key="chap.id" :label="chap.title">
                  <option v-for="tp in chap.tps" :key="tp.id" :value="tp.id">
                    {{ tp.code }} — {{ tp.description }}
                  </option>
                </optgroup>
              </select>
            </div>

            <!-- Notice Banner info -->
            <div class="flex items-center gap-2 text-[11px] text-indigo-900 bg-white/70 p-2 rounded-xl border border-indigo-100">
              <span class="shrink-0 text-indigo-600 font-bold">ℹ️ Info Sinkronisasi:</span>
              <span v-if="form.assessment_type === 'sts'">
                Nilai ujian CBT ini akan langsung mengisi kolom <strong>STS (Sumatif Tengah Semester)</strong> di Rekap Nilai Siswa kelas {{ form.classroom }} secara otomatis saat siswa menyelesaikan ujian.
              </span>
              <span v-else-if="form.assessment_type === 'sas'">
                Nilai ujian CBT ini akan langsung mengisi kolom <strong>SAS (Sumatif Akhir Semester)</strong> di Rekap Nilai Siswa kelas {{ form.classroom }} secara otomatis saat siswa menyelesaikan ujian.
              </span>
              <span v-else>
                Nilai ujian CBT ini akan terpetakan ke TP terpilih dan masuk dalam perhitungan <strong>Rata-rata Sumatif TP (30%)</strong> di Rekap Nilai Siswa.
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="label">Waktu Mulai</label>
              <input v-model="form.startTime" type="datetime-local" class="input text-xs" />
            </div>
            <div>
              <label class="label">Durasi Pengerjaan (Menit)</label>
              <input v-model.number="form.durationMinutes" type="number" min="15" max="180" class="input text-xs font-semibold" />
            </div>
            <div>
              <label class="label">Token Akses CBT</label>
              <div class="flex gap-1">
                <input v-model="form.token" type="text" class="input text-xs font-mono font-bold uppercase tracking-wider" />
                <button type="button" @click="generateToken" class="btn btn-secondary text-xs px-2.5">Acak</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Keamanan & Anti-Curang -->
      <div class="card space-y-4">
        <h3 class="text-sm font-bold text-surface-900 pb-2 border-b border-surface-100 flex items-center gap-2">
          <span>🛡️</span> 2. Aturan Pengawasan & Fitur Anti-Curang
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label class="flex items-start gap-2.5 p-3 rounded-xl border border-surface-200 cursor-pointer hover:bg-surface-50">
            <input type="checkbox" v-model="form.randomizeQuestions" class="mt-0.5 rounded text-primary-600" />
            <div>
              <span class="font-bold text-surface-900 block">Acak Urutan Soal</span>
              <span class="text-surface-500 text-[11px]">Setiap komputer siswa menerima urutan nomor yang berbeda</span>
            </div>
          </label>

          <label class="flex items-start gap-2.5 p-3 rounded-xl border border-surface-200 cursor-pointer hover:bg-surface-50">
            <input type="checkbox" v-model="form.randomizeOptions" class="mt-0.5 rounded text-primary-600" />
            <div>
              <span class="font-bold text-surface-900 block">Acak Urutan Pilihan Opsi</span>
              <span class="text-surface-500 text-[11px]">Pilihan A, B, C, D diacak posisinya secara dinamis</span>
            </div>
          </label>

          <label class="flex items-start gap-2.5 p-3 rounded-xl border border-surface-200 cursor-pointer hover:bg-surface-50">
            <input type="checkbox" v-model="form.tabSwitchDetection" class="mt-0.5 rounded text-primary-600" />
            <div>
              <span class="font-bold text-surface-900 block">Deteksi Keluar Layar / Pindah Tab</span>
              <span class="text-surface-500 text-[11px]">Catat log pelanggaran dan beri peringatan jika membuka aplikasi lain</span>
            </div>
          </label>

          <label class="flex items-start gap-2.5 p-3 rounded-xl border border-surface-200 cursor-pointer hover:bg-surface-50">
            <input type="checkbox" v-model="form.showScoreImmediately" class="mt-0.5 rounded text-primary-600" />
            <div>
              <span class="font-bold text-surface-900 block">Tampilkan Nilai Langsung ke Siswa</span>
              <span class="text-surface-500 text-[11px]">Siswa langsung melihat perolehan skor setelah klik Selesai</span>
            </div>
          </label>
        </div>
      </div>

      <!-- 3. Pemilihan Butir Soal -->
      <div class="card space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-surface-100">
          <div>
            <h3 class="text-sm font-bold text-surface-900 flex items-center gap-2">
              <span>📚</span> 3. Butir Soal Terpilih ({{ selectedQuestionsCount }} Soal)
            </h3>
            <p class="text-[11px] text-surface-500 mt-0.5">
              Soal-soal yang ada di daftar ini akan dikerjakan oleh siswa pada saat sesi CBT dimulai.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="openBankModal"
              class="btn btn-primary text-xs px-3.5 py-1.5 font-bold flex items-center gap-1.5 shadow-sm"
              id="btn-open-bank-modal"
            >
              <span>📚</span>
              <span>+ Ambil dari Bank Soal</span>
            </button>
            <button
              v-if="questionsList.length > 0"
              type="button"
              @click="clearAllQuestions"
              class="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1"
            >
              Hapus Semua
            </button>
          </div>
        </div>

        <!-- Empty State jika belum ada butir soal -->
        <div
          v-if="questionsList.length === 0"
          class="p-8 border-2 border-dashed border-surface-200 rounded-2xl text-center space-y-3 bg-surface-50/60"
        >
          <div class="w-12 h-12 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center mx-auto text-xl">
            📚
          </div>
          <div>
            <h4 class="font-bold text-surface-800 text-sm">Belum Ada Soal dalam Paket Ujian</h4>
            <p class="text-xs text-surface-500 mt-1 max-w-md mx-auto">
              Silakan klik tombol di bawah untuk membuka Bank Soal dan memilih butir-butir soal yang ingin dimasukkan ke CBT.
            </p>
          </div>
          <button
            type="button"
            @click="openBankModal"
            class="btn btn-primary text-xs px-4 py-2 font-bold inline-flex items-center gap-2 shadow-sm"
          >
            <span>📚 Buka & Pilih dari Bank Soal</span>
          </button>
        </div>

        <!-- Daftar Butir Soal Terpilih -->
        <div v-else class="space-y-3">
          <div
            v-for="(q, idx) in questionsList"
            :key="q.id || idx"
            class="p-4 rounded-xl bg-surface-50 border border-surface-200 text-xs space-y-2 hover:border-surface-300 transition"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-start gap-3">
                <span class="w-6 h-6 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">
                  {{ idx + 1 }}
                </span>
                <div class="space-y-1">
                  <div class="flex flex-wrap items-center gap-1.5">
                    <span class="badge bg-primary-100 text-primary-800 font-semibold text-[10px]">
                      {{ q.subject_name || q.topic || 'Informatika' }}
                    </span>
                    <span class="badge bg-surface-200 text-surface-700 text-[10px]">
                      {{ formatDifficulty(q.difficulty) }}
                    </span>
                    <span class="badge bg-surface-200 text-surface-700 text-[10px]">
                      {{ q.type === 'essay' ? 'Esai' : 'Pilihan Ganda' }}
                    </span>
                  </div>
                  <p class="font-semibold text-surface-900 text-xs leading-relaxed">
                    {{ stripHtml(q.content || q.text) }}
                  </p>
                </div>
              </div>

              <button
                @click="removeQuestion(idx)"
                class="text-surface-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition"
                title="Hapus soal ini dari paket ujian"
              >
                ✕
              </button>
            </div>

            <!-- Opsi Jawaban (Jika Pilihan Ganda) -->
            <div v-if="q.options && q.options.length > 0" class="pl-9 grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              <div
                v-for="(opt, optIdx) in q.options"
                :key="optIdx"
                class="p-2 rounded-lg text-[11px] flex items-center gap-2"
                :class="isOptionCorrect(opt, optIdx, q) ? 'bg-emerald-50 border border-emerald-300 text-emerald-900 font-medium' : 'bg-white border border-surface-200 text-surface-700'"
              >
                <span class="w-4 h-4 rounded-full font-bold flex items-center justify-center text-[10px]"
                  :class="isOptionCorrect(opt, optIdx, q) ? 'bg-emerald-600 text-white' : 'bg-surface-200 text-surface-600'"
                >
                  {{ String.fromCharCode(65 + optIdx) }}
                </span>
                <span class="truncate">{{ opt.text || opt.content || opt }}</span>
                <span v-if="isOptionCorrect(opt, optIdx, q)" class="ml-auto text-[10px] text-emerald-700 font-bold">✓ Kunci</span>
              </div>
            </div>

            <!-- Jawaban Esai / Text Kunci Alternatif -->
            <div v-else-if="q.correctOption || q.correct_answer" class="pl-9 text-[11px] text-surface-600 flex items-center gap-1.5">
              <span class="font-bold text-emerald-700">Kunci Jawaban:</span>
              <span>{{ q.correctOption || q.correct_answer }}</span>
            </div>
          </div>

          <!-- Tombol Tambah Lagi di Bawah Daftar -->
          <div class="pt-2 flex justify-center">
            <button
              type="button"
              @click="openBankModal"
              class="btn btn-secondary text-xs px-4 py-2 font-semibold flex items-center gap-1.5 text-primary-700 hover:bg-primary-50"
            >
              <span>➕ Tambah Butir Soal Lain dari Bank Soal</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL PEMILIH SOAL DARI BANK SOAL -->
    <Teleport to="body">
      <div
        v-if="showBankModal"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      >
        <div class="bg-white rounded-2xl shadow-2xl border border-surface-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
          <!-- Modal Header -->
          <div class="p-4 sm:px-6 py-4 border-b border-surface-200 bg-surface-50 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center text-lg font-bold shadow-xs">
                📚
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-surface-900 text-sm sm:text-base">
                    Pilih Butir Soal dari Bank Soal
                  </h3>
                  <span class="badge bg-primary-50 text-primary-700 border border-primary-200 font-semibold text-xs">
                    {{ bankQuestions.length }} Total Butir di Bank
                  </span>
                </div>
                <p class="text-xs text-surface-500">
                  Menampilkan seluruh butir soal dari Bank Soal. Gunakan filter lengkap untuk mempersempit pilihan, lalu centang dan masukkan ke ujian CBT.
                </p>
              </div>
            </div>
            <button
              @click="closeBankModal"
              class="text-surface-400 hover:text-surface-700 p-2 rounded-xl hover:bg-surface-200 transition"
              title="Tutup dialog"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Kategori Tingkat Kelas (Sama dengan Menu Bank Soal) -->
          <div class="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 border-b border-surface-200">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-surface-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🏫</span> Tingkat Kelas:
                </span>
              </div>
              <div class="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  @click="setBankGradeFilter('')"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                  :class="!bankGradeFilter ? 'bg-primary-600 text-white shadow-primary-500/20' : 'bg-white hover:bg-surface-100 text-surface-700 border border-surface-200'"
                >
                  <span>📚 Semua Tingkat</span>
                  <span class="px-1.5 py-0.2 rounded-full text-[10px]" :class="!bankGradeFilter ? 'bg-white/20 text-white' : 'bg-surface-100 text-surface-600'">
                    {{ bankStats.total }}
                  </span>
                </button>

                <button
                  type="button"
                  @click="setBankGradeFilter('7')"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                  :class="bankGradeFilter === '7' ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-white hover:bg-blue-50/60 text-blue-900 border border-blue-200'"
                >
                  <span>📘 Kelas 7</span>
                  <span class="px-1.5 py-0.2 rounded-full text-[10px]" :class="bankGradeFilter === '7' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'">
                    {{ bankStats.grade_7 || 0 }}
                  </span>
                </button>

                <button
                  type="button"
                  @click="setBankGradeFilter('8')"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                  :class="bankGradeFilter === '8' ? 'bg-purple-600 text-white shadow-purple-500/20' : 'bg-white hover:bg-purple-50/60 text-purple-900 border border-purple-200'"
                >
                  <span>📙 Kelas 8</span>
                  <span class="px-1.5 py-0.2 rounded-full text-[10px]" :class="bankGradeFilter === '8' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'">
                    {{ bankStats.grade_8 || 0 }}
                  </span>
                </button>

                <button
                  type="button"
                  @click="setBankGradeFilter('9')"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                  :class="bankGradeFilter === '9' ? 'bg-rose-600 text-white shadow-rose-500/20' : 'bg-white hover:bg-rose-50/60 text-rose-900 border border-rose-200'"
                >
                  <span>📕 Kelas 9</span>
                  <span class="px-1.5 py-0.2 rounded-full text-[10px]" :class="bankGradeFilter === '9' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'">
                    {{ bankStats.grade_9 || 0 }}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- Kategori Judul Materi (Scrollable Pills Sama dengan Menu Bank Soal) -->
          <div class="px-4 sm:px-6 py-2 bg-gradient-to-r from-indigo-50/40 via-white to-purple-50/30 border-b border-surface-200">
            <div class="flex items-center gap-2 overflow-x-auto pb-0.5 max-w-full text-xs">
              <span class="font-bold text-surface-700 flex-shrink-0 flex items-center gap-1 text-[11px] uppercase tracking-wider mr-1">
                <span>📑</span> Judul Materi:
              </span>
              <button
                type="button"
                @click="setBankTopicFilter('')"
                class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs flex-shrink-0"
                :class="!bankTopicFilter ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-white hover:bg-surface-100 text-surface-700 border border-surface-200'"
              >
                <span>🏷️ Semua Materi</span>
                <span class="px-1.5 py-0.2 rounded-full text-[10px]" :class="!bankTopicFilter ? 'bg-white/20 text-white' : 'bg-surface-100 text-surface-600'">
                  {{ bankStats.total }}
                </span>
              </button>

              <button
                v-for="(count, tName) in bankStats.topics"
                :key="tName"
                type="button"
                @click="setBankTopicFilter(String(tName))"
                class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs flex-shrink-0"
                :class="bankTopicFilter === tName ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-white hover:bg-indigo-50/70 text-indigo-900 border border-indigo-200/80'"
              >
                <span>{{ getTopicIcon(String(tName)) }} {{ tName }}</span>
                <span class="px-1.5 py-0.2 rounded-full text-[10px]" :class="bankTopicFilter === tName ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700 font-semibold'">
                  {{ count }}
                </span>
              </button>
            </div>
          </div>

          <!-- Modal Filter Bar (Form Grid Lengkap Sama dengan Menu Bank Soal) -->
          <div class="p-4 border-b border-surface-200 bg-white space-y-2.5 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
              <!-- Search (2 cols) -->
              <div class="sm:col-span-2 relative">
                <input
                  v-model="bankSearch"
                  type="text"
                  placeholder="Cari pokok soal atau materi..."
                  class="input text-xs pl-8 w-full"
                />
                <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-400 text-xs">🔍</span>
                <button
                  v-if="bankSearch"
                  @click="bankSearch = ''"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-700 text-xs"
                >
                  ✕
                </button>
              </div>

              <!-- Filter Tingkat Kelas -->
              <div>
                <select v-model="bankGradeFilter" @change="bankClassroomFilter = ''" class="input text-xs w-full font-semibold">
                  <option value="">Semua Tingkat</option>
                  <option value="7">📘 Kelas 7</option>
                  <option value="8">📙 Kelas 8</option>
                  <option value="9">📕 Kelas 9</option>
                </select>
              </div>

              <!-- Filter Rombel Khusus -->
              <div>
                <select v-model="bankClassroomFilter" class="input text-xs w-full">
                  <option value="">Semua Rombel</option>
                  <option v-for="c in filteredBankClassrooms" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>

              <!-- Filter Judul Materi -->
              <div>
                <select v-model="bankTopicFilter" class="input text-xs w-full font-medium">
                  <option value="">Semua Judul Materi</option>
                  <option v-for="(count, tName) in bankStats.topics" :key="tName" :value="tName">
                    {{ getTopicIcon(String(tName)) }} {{ tName }} ({{ count }})
                  </option>
                </select>
              </div>

              <!-- Filter Mapel -->
              <div>
                <select v-model="bankSubjectFilter" class="input text-xs w-full">
                  <option value="">Semua Mapel</option>
                  <option v-for="s in availableBankSubjects" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>

              <!-- Filter Jenis Soal -->
              <div>
                <select v-model="bankTypeFilter" class="input text-xs w-full">
                  <option value="">Semua Jenis</option>
                  <option v-for="t in questionTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
                </select>
              </div>

              <!-- Filter Kesukaran -->
              <div>
                <select v-model="bankDifficultyFilter" class="input text-xs w-full">
                  <option value="">Semua Level</option>
                  <option value="easy">Mudah</option>
                  <option value="medium">Sedang</option>
                  <option value="hard">Sulit (HOTS)</option>
                </select>
              </div>
            </div>

            <!-- Quick Action & Reset Row -->
            <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div class="flex flex-wrap items-center gap-2">
                <!-- Quick Mapel Ujian Filter Button -->
                <button
                  type="button"
                  @click="toggleExamSubjectFilter"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition flex items-center gap-1.5"
                  :class="bankSubjectFilter.toLowerCase() === (form.subject || '').toLowerCase() ? 'bg-primary-100 text-primary-800 border-primary-300' : 'bg-surface-50 text-surface-600 border-surface-200 hover:bg-surface-100'"
                >
                  <span>🎯 Filter Mapel Ujian ({{ form.subject }})</span>
                  <span v-if="bankSubjectFilter.toLowerCase() === (form.subject || '').toLowerCase()" class="text-primary-700 font-bold">✓ Aktif</span>
                </button>

                <!-- Filter Status -->
                <div class="flex items-center gap-1.5 text-[11px]">
                  <span class="text-surface-500">Status:</span>
                  <select v-model="bankStatusFilter" class="input py-1 px-2 text-[11px] h-7">
                    <option value="">Semua Status</option>
                    <option value="draft">Draft</option>
                    <option value="reviewed">Ditinjau</option>
                    <option value="published">Dipublikasikan</option>
                    <option value="archived">Diarsipkan</option>
                  </select>
                </div>
              </div>

              <!-- Reset Button -->
              <button
                type="button"
                @click="resetBankFilters"
                class="text-[11px] text-surface-500 hover:text-surface-800 hover:underline flex items-center gap-1 py-1 px-2 rounded hover:bg-surface-100"
              >
                <span>🔄 Reset Semua Filter</span>
              </button>
            </div>

            <!-- Select All & Stats Toolbar -->
            <div class="flex items-center justify-between pt-2 border-t border-surface-100 text-[11px] text-surface-600">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  :checked="isAllVisibleSelected"
                  @change="toggleSelectAllVisible"
                  class="rounded border-surface-300 text-primary-600 focus:ring-primary-500 w-4 h-4"
                />
                <span class="font-semibold text-surface-800">
                  Pilih Semua Soal yang Ditampilkan ({{ filteredBankQuestions.length }} Soal)
                </span>
              </label>

              <div class="flex items-center gap-3">
                <span v-if="selectedBankIds.length > 0" class="font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-200">
                  ✓ {{ selectedBankIds.length }} Soal Dicentang
                </span>
                <span class="text-surface-400">
                  Total di Bank Soal: {{ bankQuestions.length }} butir
                </span>
              </div>
            </div>
          </div>

          <!-- Modal Soal List (Scrollable) -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-surface-50/50 text-xs">
            <!-- Loading State -->
            <div v-if="loadingBank" class="py-12 text-center space-y-3">
              <div class="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p class="text-surface-500 font-medium">Memuat butir soal dari Bank Soal...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="filteredBankQuestions.length === 0" class="py-12 text-center space-y-2 card bg-white">
              <p class="text-2xl">🔍</p>
              <p class="font-bold text-surface-800">Tidak ada butir soal yang sesuai filter</p>
              <p class="text-surface-500 text-xs max-w-sm mx-auto">
                Coba ubah kata kunci pencarian atau ganti filter mata pelajaran, tingkat kelas, atau jenis soal.
              </p>
              <button
                @click="resetBankFilters"
                class="btn btn-secondary text-xs px-3 py-1.5 mt-2"
              >
                Reset Filter
              </button>
            </div>

            <!-- Questions Items -->
            <div
              v-else
              v-for="q in filteredBankQuestions"
              :key="q.id"
              @click="toggleQuestionSelection(q.id)"
              class="card p-4 transition-all cursor-pointer border relative select-none hover:shadow-sm"
              :class="selectedBankIds.includes(q.id) ? 'border-primary-500 bg-primary-50/30 ring-1 ring-primary-500' : 'border-surface-200 bg-white hover:border-surface-300'"
            >
              <div class="flex items-start gap-3">
                <!-- Checkbox -->
                <input
                  type="checkbox"
                  :checked="selectedBankIds.includes(q.id)"
                  @click.stop
                  @change="toggleQuestionSelection(q.id)"
                  class="mt-1 rounded border-surface-300 text-primary-600 focus:ring-primary-500 w-4 h-4 flex-shrink-0 cursor-pointer"
                />

                <div class="flex-1 space-y-2 min-w-0">
                  <!-- Badges & Status -->
                  <div class="flex flex-wrap items-center gap-1.5">
                    <span class="badge bg-primary-100 text-primary-800 font-semibold text-[10px]">
                      {{ q.subject_name || 'Informatika' }}
                    </span>
                    <span class="badge font-medium text-[10px]" :class="getGradeBadgeClass(getGrade(q))">
                      {{ getGradeLabel(getGrade(q)) }}
                    </span>
                    <span v-if="q.topic || q.element" class="badge bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px]">
                      {{ getTopicIcon(q.topic || q.element) }} {{ q.topic || q.element }}
                    </span>
                    <span class="badge text-[10px]" :class="getTypeBadgeColor(q.type)">
                      {{ getTypeLabel(q.type) }}
                    </span>
                    <span class="badge bg-surface-100 text-surface-700 text-[10px]">
                      {{ formatDifficulty(q.difficulty) }}
                    </span>
                    <span v-if="q.status && q.status !== 'published'" class="badge bg-amber-50 text-amber-700 border border-amber-200 text-[10px]">
                      {{ q.status }}
                    </span>
                    <span v-if="isAlreadyInExam(q.id)" class="badge bg-amber-100 text-amber-800 font-semibold text-[10px]">
                      ✓ Sudah Ada di Ujian Ini
                    </span>
                  </div>

                  <!-- Pertanyaan -->
                  <p class="font-medium text-surface-900 leading-relaxed text-xs">
                    {{ stripHtml(q.content) }}
                  </p>

                  <!-- Preview Opsi Jawaban (Jika ada) -->
                  <div v-if="q.options && q.options.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    <div
                      v-for="(opt, oIdx) in q.options"
                      :key="oIdx"
                      class="p-2 rounded-lg text-[11px] flex items-center gap-2"
                      :class="isOptionCorrect(opt, oIdx, q) ? 'bg-emerald-50 border border-emerald-300 text-emerald-900 font-medium' : 'bg-surface-50 border border-surface-200 text-surface-700'"
                    >
                      <span class="w-4 h-4 rounded-full font-bold flex items-center justify-center text-[10px]"
                        :class="isOptionCorrect(opt, oIdx, q) ? 'bg-emerald-600 text-white' : 'bg-surface-200 text-surface-600'"
                      >
                        {{ String.fromCharCode(65 + oIdx) }}
                      </span>
                      <span class="truncate">{{ opt.text || opt.content || opt }}</span>
                      <span v-if="isOptionCorrect(opt, oIdx, q)" class="ml-auto text-[10px] text-emerald-700 font-bold">✓ Kunci</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer (Tombol Aksi Pemilihan Soal) -->
          <div class="p-4 sm:px-6 py-3.5 border-t border-surface-200 bg-white flex flex-wrap items-center justify-between gap-3">
            <div class="text-xs text-surface-600">
              <span v-if="selectedBankIds.length > 0" class="font-bold text-primary-700">
                🎯 {{ selectedBankIds.length }} butir soal dipilih
              </span>
              <span v-else class="text-surface-400">
                Pilih minimal 1 butir soal untuk dimasukkan ke ujian CBT
              </span>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="closeBankModal"
                class="btn btn-secondary text-xs px-4 py-2"
              >
                Batal
              </button>
              <button
                type="button"
                @click="insertSelectedQuestions"
                :disabled="selectedBankIds.length === 0"
                class="btn btn-primary text-xs px-5 py-2 font-bold shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                id="btn-insert-selected-questions"
              >
                <span>➕ Masukkan Soal Terpilih</span>
                <span v-if="selectedBankIds.length > 0" class="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">
                  {{ selectedBankIds.length }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useClassrooms } from '@/composables/useClassrooms'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const {
  classrooms,
  fetchClassrooms,
  formatClassLabel,
  getSubjectNameForClass,
  getAvailableSubjectsForClass,
  getSubjectForClass
} = useClassrooms()

const isSaving = ref(false)
const successNotice = ref('')

const availableChapters = ref<any[]>([])

async function loadChapters() {
  try {
    const sId = (form.value.subject || '').toLowerCase().includes('kka') ? 'sub-kka' : 'sub-inf'
    const gl = (form.value.classroom || '').includes('IX') || (form.value.classroom || '').includes('9') ? 9 : 7
    const res = await api.get('/chapters', { params: { subject_id: sId, grade_level: gl } })
    availableChapters.value = res.data?.data || []
  } catch (err) {
    console.error('Failed to load chapters for exam:', err)
  }
}

const form = ref({
  title: '',
  assessment_type: 'sts' as 'sts' | 'sas' | 'tp',
  subject: authStore.user?.subject || 'Mata Pelajaran',
  classroom: '',
  tp_id: '',
  kktp: 75,
  startTime: new Date().toISOString().slice(0, 16),
  durationMinutes: 60,
  token: 'STS-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
  randomizeQuestions: true,
  randomizeOptions: true,
  tabSwitchDetection: true,
  showScoreImmediately: true
})

const availableExamSubjects = computed(() => {
  return getAvailableSubjectsForClass(form.value.classroom)
})

function onClassroomChange() {
  const matchingSub = getSubjectForClass(form.value.classroom)
  form.value.subject = matchingSub.name
  form.value.kktp = matchingSub.kktp
  onSelectAssessmentType(form.value.assessment_type)
  loadChapters()
}

function onSubjectChange() {
  loadChapters()
}

function onSelectAssessmentType(type: 'sts' | 'sas' | 'tp') {
  form.value.assessment_type = type
  if (type === 'sts') {
    form.value.title = `Sumatif Tengah Semester (STS): ${form.value.subject} Kelas ${form.value.classroom}`
    form.value.tp_id = ''
  } else if (type === 'sas') {
    form.value.title = `Sumatif Akhir Semester (SAS): ${form.value.subject} Kelas ${form.value.classroom}`
    form.value.tp_id = ''
  } else if (type === 'tp') {
    form.value.title = `Sumatif Lingkup Materi: ${form.value.subject} Kelas ${form.value.classroom}`
    if (availableChapters.value[0]?.tps?.[0]?.id) {
      form.value.tp_id = availableChapters.value[0].tps[0].id
    }
  }
}

// Bank Soal Modal States
const showBankModal = ref(false)
const loadingBank = ref(false)
const bankQuestions = ref<any[]>([])
const selectedBankIds = ref<string[]>([])
const bankSearch = ref('')
const bankGradeFilter = ref('')
const bankClassroomFilter = ref('')
const bankTopicFilter = ref('')
const bankSubjectFilter = ref('') // Default kosong agar menampilkan seluruh soal
const bankTypeFilter = ref('')
const bankDifficultyFilter = ref('')
const bankStatusFilter = ref('')

const subjectsList = ref<any[]>([])

const questionTypes = [
  { value: 'multiple_choice', label: 'Pilihan Ganda' },
  { value: 'true_false', label: 'Benar/Salah' },
  { value: 'short_answer', label: 'Jawaban Singkat' },
  { value: 'essay', label: 'Esai' },
  { value: 'fill_blank', label: 'Isian' },
  { value: 'matching', label: 'Menjodohkan' },
]

function getTypeLabel(type: string): string {
  return questionTypes.find(t => t.value === type)?.label ?? (type === 'essay' ? 'Esai' : 'Pilihan Ganda')
}

function getTypeBadgeColor(type: string): string {
  const map: Record<string, string> = {
    multiple_choice: 'bg-primary-100 text-primary-700',
    true_false: 'bg-green-100 text-green-700',
    short_answer: 'bg-amber-100 text-amber-700',
    essay: 'bg-purple-100 text-purple-700',
    fill_blank: 'bg-pink-100 text-pink-700',
    matching: 'bg-teal-100 text-teal-700',
  }
  return map[type] || 'bg-surface-100 text-surface-700'
}

function getGrade(q: any): string {
  const g = String(q.grade || q.grade_level || '')
  if (g.includes('7') || g === '7') return '7'
  if (g.includes('8') || g === '8') return '8'
  if (g.includes('9') || g === '9') return '9'
  if (q.classroom_id?.includes('-7') || q.classroom_name?.includes('VII')) return '7'
  if (q.classroom_id?.includes('-8') || q.classroom_name?.includes('VIII')) return '8'
  if (q.classroom_id?.includes('-9') || q.classroom_name?.includes('IX')) return '9'
  return '7'
}

function getGradeLabel(gradeOrCls?: string | number): string {
  const str = String(gradeOrCls || '')
  if (str.includes('7') || str === '7') return 'Kelas 7'
  if (str.includes('8') || str === '8') return 'Kelas 8'
  if (str.includes('9') || str === '9') return 'Kelas 9'
  return 'Kelas 7'
}

function getGradeBadgeClass(gradeOrCls?: string | number): string {
  const str = String(gradeOrCls || '')
  if (str.includes('7') || str === '7') return 'bg-blue-50 text-blue-700 border border-blue-200'
  if (str.includes('8') || str === '8') return 'bg-purple-50 text-purple-700 border border-purple-200'
  if (str.includes('9') || str === '9') return 'bg-rose-50 text-rose-700 border border-rose-200'
  return 'bg-surface-100 text-surface-700 border border-surface-200'
}

function getTopicIcon(t?: string): string {
  const str = String(t || '').toLowerCase()
  if (str.includes('komputasional') || str.includes('pikir')) return '🧠'
  if (str.includes('sistem') || str.includes('hardware') || str.includes('komputer')) return '💻'
  if (str.includes('jaringan') || str.includes('internet') || str.includes('lan')) return '🌐'
  if (str.includes('algoritma') || str.includes('pemrograman') || str.includes('koding')) return '⚡'
  if (str.includes('data') || str.includes('spreadsheet')) return '📊'
  if (str.includes('ai') || str.includes('artifisial') || str.includes('machine')) return '🤖'
  if (str.includes('sosial') || str.includes('keamanan') || str.includes('cyber') || str.includes('siber')) return '🛡️'
  return '📖'
}

// Stats & topics computed from bankQuestions
const bankStats = computed(() => {
  const total = bankQuestions.value.length
  let g7 = 0, g8 = 0, g9 = 0
  const topicMap: Record<string, number> = {}

  for (const q of bankQuestions.value) {
    const g = getGrade(q)
    if (g === '7') g7++
    else if (g === '8') g8++
    else if (g === '9') g9++

    const t = q.topic || q.element || 'Umum'
    topicMap[t] = (topicMap[t] || 0) + 1
  }

  return {
    total,
    grade_7: g7,
    grade_8: g8,
    grade_9: g9,
    topics: topicMap
  }
})

// Filtered classrooms based on bankGradeFilter
const filteredBankClassrooms = computed(() => {
  if (!bankGradeFilter.value) return classrooms.value
  return classrooms.value.filter(c => String(c.grade_level || '') === bankGradeFilter.value)
})

// Unified available subjects list (API + subjects in questions + current subject)
const availableBankSubjects = computed(() => {
  const set = new Map<string, string>()
  subjectsList.value.forEach(s => {
    if (s.name) set.set(s.name.toLowerCase(), s.name)
  })
  bankQuestions.value.forEach(q => {
    if (q.subject_name) set.set(q.subject_name.toLowerCase(), q.subject_name)
  })
  if (form.value.subject) {
    set.set(form.value.subject.toLowerCase(), form.value.subject)
  }
  return Array.from(set.values())
})

function setBankGradeFilter(g: string) {
  bankGradeFilter.value = g
  bankClassroomFilter.value = ''
}

function setBankTopicFilter(t: string) {
  bankTopicFilter.value = t
}

function toggleExamSubjectFilter() {
  if (bankSubjectFilter.value.toLowerCase() === (form.value.subject || '').toLowerCase()) {
    bankSubjectFilter.value = ''
  } else {
    bankSubjectFilter.value = form.value.subject || ''
  }
}

// List soal terpilih di Ujian CBT
const questionsList = ref<any[]>([
  {
    id: 'q-mvn6lp4p',
    content: 'Manakah di bawah ini yang merupakan 4 pilar utama dalam Berpikir Komputasional (Computational Thinking)?',
    subject_name: 'Informatika',
    topic: 'Berpikir Komputasional',
    difficulty: 'medium',
    type: 'multiple_choice',
    correct_answer: 'A',
    options: [
      { text: 'Dekomposisi, Pengenalan Pola, Abstraksi, Algoritma', is_correct: true },
      { text: 'Coding, Desain Grafis, Perakitan, Jaringan', is_correct: false },
      { text: 'Analisis Data, Microsoft Word, Browser, Internet', is_correct: false },
      { text: 'Hardware, Software, Brainware, Firmware', is_correct: false }
    ]
  },
  {
    id: 'q-mvn6lp55',
    content: 'Proses memecah masalah kompleks menjadi sub-masalah atau bagian yang lebih kecil dan mudah dikelola disebut...',
    subject_name: 'Informatika',
    topic: 'Sistem Komputer',
    difficulty: 'medium',
    type: 'multiple_choice',
    correct_answer: 'B',
    options: [
      { text: 'Abstraksi', is_correct: false },
      { text: 'Dekomposisi', is_correct: true },
      { text: 'Pengenalan Pola', is_correct: false },
      { text: 'Iterasi', is_correct: false }
    ]
  }
])

const selectedQuestionsCount = computed(() => questionsList.value.length)

// Filter Bank Soal Lengkap
const filteredBankQuestions = computed(() => {
  return bankQuestions.value.filter(q => {
    // Search
    if (bankSearch.value.trim()) {
      const s = bankSearch.value.toLowerCase().trim()
      const contentMatch = (q.content || '').toLowerCase().includes(s)
      const topicMatch = (q.topic || q.element || '').toLowerCase().includes(s)
      const subjectMatch = (q.subject_name || '').toLowerCase().includes(s)
      const stimulusMatch = (q.stimulus || '').toLowerCase().includes(s)
      if (!contentMatch && !topicMatch && !subjectMatch && !stimulusMatch) return false
    }

    // Grade Filter
    if (bankGradeFilter.value) {
      if (getGrade(q) !== bankGradeFilter.value) return false
    }

    // Classroom Filter
    if (bankClassroomFilter.value) {
      if (q.classroom_id !== bankClassroomFilter.value) return false
    }

    // Topic Filter
    if (bankTopicFilter.value) {
      const qTopic = String(q.topic || q.element || '').toLowerCase()
      if (qTopic !== bankTopicFilter.value.toLowerCase() && !qTopic.includes(bankTopicFilter.value.toLowerCase())) {
        return false
      }
    }

    // Subject Filter
    if (bankSubjectFilter.value) {
      const qSubject = (q.subject_name || q.subject_id || '').toLowerCase()
      const targetSub = bankSubjectFilter.value.toLowerCase()
      if (qSubject !== targetSub && !qSubject.includes(targetSub)) {
        return false
      }
    }

    // Difficulty Filter
    if (bankDifficultyFilter.value) {
      if (q.difficulty !== bankDifficultyFilter.value) {
        return false
      }
    }

    // Type Filter
    if (bankTypeFilter.value) {
      if (q.type !== bankTypeFilter.value) {
        return false
      }
    }

    // Status Filter
    if (bankStatusFilter.value) {
      const qStatus = q.status || 'published'
      if (qStatus !== bankStatusFilter.value) {
        return false
      }
    }

    return true
  })
})

const isAllVisibleSelected = computed(() => {
  if (filteredBankQuestions.value.length === 0) return false
  return filteredBankQuestions.value.every(q => selectedBankIds.value.includes(q.id))
})

function toggleSelectAllVisible() {
  if (isAllVisibleSelected.value) {
    // Unselect all visible
    const visibleIds = new Set(filteredBankQuestions.value.map(q => q.id))
    selectedBankIds.value = selectedBankIds.value.filter(id => !visibleIds.has(id))
  } else {
    // Select all visible
    const newIds = new Set([...selectedBankIds.value, ...filteredBankQuestions.value.map(q => q.id)])
    selectedBankIds.value = Array.from(newIds)
  }
}

function toggleQuestionSelection(id: string) {
  const idx = selectedBankIds.value.indexOf(id)
  if (idx > -1) {
    selectedBankIds.value.splice(idx, 1)
  } else {
    selectedBankIds.value.push(id)
  }
}

function isAlreadyInExam(id: string) {
  return questionsList.value.some(q => q.id === id)
}

function resetBankFilters() {
  bankSearch.value = ''
  bankGradeFilter.value = ''
  bankClassroomFilter.value = ''
  bankTopicFilter.value = ''
  bankSubjectFilter.value = ''
  bankTypeFilter.value = ''
  bankDifficultyFilter.value = ''
  bankStatusFilter.value = ''
}

// Buka Modal Bank Soal - Tampilkan Seluruh Soal Secara Default
async function openBankModal() {
  showBankModal.value = true
  resetBankFilters()
  
  // Default checklist untuk soal yang sudah ada di ujian
  selectedBankIds.value = questionsList.value.map(q => q.id).filter(Boolean)

  if (bankQuestions.value.length === 0) {
    await fetchBankQuestions()
  }
}

function closeBankModal() {
  showBankModal.value = false
}

async function fetchBankQuestions() {
  loadingBank.value = true
  try {
    const res = await api.get('/questions')
    const list = res.data?.data || []
    bankQuestions.value = list
  } catch (err) {
    console.error('Gagal memuat bank soal:', err)
  } finally {
    loadingBank.value = false
  }
}

// Masukkan Soal Terpilih ke Ujian CBT
function insertSelectedQuestions() {
  if (selectedBankIds.value.length === 0) return

  let addedCount = 0
  const existingMap = new Map(questionsList.value.map(q => [q.id, q]))

  selectedBankIds.value.forEach(id => {
    if (!existingMap.has(id)) {
      const found = bankQuestions.value.find(q => q.id === id)
      if (found) {
        questionsList.value.push({
          id: found.id,
          content: found.content,
          text: stripHtml(found.content),
          subject_name: found.subject_name || form.value.subject,
          topic: found.subject_name || form.value.subject,
          difficulty: found.difficulty || 'medium',
          type: found.type || 'multiple_choice',
          correct_answer: found.correct_answer || 'A',
          correctOption: found.correct_answer || 'A',
          options: found.options || []
        })
        addedCount++
      }
    }
  })

  // Tampilkan notifikasi
  successNotice.value = `Berhasil memasukkan ${selectedBankIds.value.length} butir soal ke paket ujian CBT!`
  setTimeout(() => {
    successNotice.value = ''
  }, 4000)

  showBankModal.value = false
}

function removeQuestion(idx: number) {
  questionsList.value.splice(idx, 1)
}

function clearAllQuestions() {
  if (confirm('Apakah Anda yakin ingin mengosongkan semua butir soal di paket ujian ini?')) {
    questionsList.value = []
  }
}

function generateToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let res = ''
  for (let i = 0; i < 6; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  form.value.token = res
}

function formatDifficulty(diff: string) {
  if (diff === 'easy') return 'Mudah'
  if (diff === 'hard') return 'Sulit'
  return 'Sedang'
}

function stripHtml(html: string) {
  if (!html) return ''
  return html.replace(/<[^>]*>?/gm, '').trim()
}

function isOptionCorrect(opt: any, optIdx: number, q: any) {
  if (typeof opt === 'object' && opt.is_correct === true) return true
  const letter = String.fromCharCode(65 + optIdx)
  if (q.correct_answer === letter || q.correctOption === letter) return true
  return false
}

// Simpan Ujian CBT ke Backend
async function saveExam() {
  if (!form.value.title.trim()) {
    alert('Harap isi judul ujian CBT terlebih dahulu!')
    return
  }

  if (questionsList.value.length === 0) {
    if (!confirm('Paket ujian belum memiliki butir soal. Apakah Anda tetap ingin menyimpan sebagai draf?')) {
      return
    }
  }

  isSaving.value = true
  try {
    const payload = {
      title: form.value.title,
      assessment_type: form.value.assessment_type,
      subject_name: form.value.subject,
      subject: form.value.subject,
      classroom_name: form.value.classroom,
      classroom: form.value.classroom,
      tp_id: form.value.assessment_type === 'tp' ? form.value.tp_id : null,
      duration_minutes: form.value.durationMinutes,
      kktp: form.value.kktp,
      kkm: form.value.kktp,
      passing_grade: form.value.kktp,
      created_by_name: authStore.user?.name || 'Pendidik',
      teacher_name: authStore.user?.name || 'Pendidik',
      token: form.value.token,
      start_time: form.value.startTime,
      randomize_questions: form.value.randomizeQuestions,
      randomize_options: form.value.randomizeOptions,
      tab_switch_detection: form.value.tabSwitchDetection,
      show_score_immediately: form.value.showScoreImmediately,
      question_ids: questionsList.value.map(q => q.id),
      questions: questionsList.value
    }

    await api.post('/exams', payload)
    alert('✅ Paket Ujian CBT berhasil diterbitkan dan siap dikerjakan siswa!')
    router.push('/cbt')
  } catch (err: any) {
    console.error('Gagal menyimpan ujian CBT:', err)
    alert('Gagal menyimpan ujian CBT: ' + (err.response?.data?.message || err.message))
  } finally {
    isSaving.value = false
  }
}

async function loadSubjects() {
  try {
    const res = await api.get('/subjects', { params: { per_page: 100 } })
    if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
      subjectsList.value = res.data.data
      return
    }
  } catch (err) {
    console.warn('Failed to load subjects:', err)
  }
  const userSub = authStore.user?.subject
  if (userSub) {
    subjectsList.value = [{ id: 'sub-user-active', name: userSub }]
  } else {
    subjectsList.value = []
  }
}

onMounted(async () => {
  await Promise.all([fetchClassrooms(true), loadSubjects(), loadChapters()])
  if (classrooms.value.length > 0) {
    form.value.classroom = classrooms.value[0].name
    form.value.subject = getSubjectNameForClass(classrooms.value[0].id)
  } else {
    form.value.classroom = ''
    form.value.subject = authStore.user?.subject || ''
  }

  // Pre-fetch bank questions so stats and topics are immediately ready
  await fetchBankQuestions()

  // Cek apakah ada soal preselected dari Bank Soal (via sessionStorage)
  try {
    const preselected = sessionStorage.getItem('cbt_preselected_questions')
    if (preselected) {
      sessionStorage.removeItem('cbt_preselected_questions')
      const ids = JSON.parse(preselected)
      if (Array.isArray(ids) && ids.length > 0) {
        selectedBankIds.value = ids
        insertSelectedQuestions()
      }
    }
  } catch (e) {
    console.error('Error loading preselected questions:', e)
  }
})
</script>

