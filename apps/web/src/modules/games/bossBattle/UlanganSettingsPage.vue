<template>
  <div class="space-y-6 pb-20">
    <!-- Header with Action Buttons -->
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-surface-200 pb-5">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <router-link to="/games" class="btn btn-secondary text-xs px-2.5 py-1 flex items-center gap-1 font-bold">
            ← Kembali ke Menu Edu-Games
          </router-link>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
            <span>👾</span> Mode 1 Edu-Games: Final Boss Battle
          </div>
        </div>
        <h1 class="text-2xl font-black text-surface-900 tracking-tight">Pengaturan Final Boss Battle (Ulangan Harian)</h1>
        <p class="text-xs sm:text-sm text-surface-500 mt-1 max-w-2xl leading-relaxed">
          Atur kelas rombel, topik ulangan dari Bank Soal, karakter boss, dan target KKM kelas.
          Untuk Ujian Semester (UTS/UAS), gunakan <strong><router-link to="/cbt" class="text-indigo-600 underline">Modul CBT</router-link></strong>.
        </p>
      </div>

      <!-- Action Buttons (Simpan, Pratinjau, Mulai Battle) -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="btn btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 font-bold"
          @click="save"
        >
          <span>💾</span> Simpan Pengaturan
        </button>
        <button
          type="button"
          class="btn btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
          @click="openPreviewModal('boss')"
        >
          <span>👾</span> Pratinjau Boss
        </button>
        <button
          type="button"
          class="btn btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
          @click="openPreviewModal('arena')"
        >
          <span>🏟️</span> Pratinjau Arena
        </button>
        <button
          type="button"
          class="btn btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
          @click="openPreviewModal('animation')"
        >
          <span>⚡</span> Pratinjau Animasi
        </button>
        <button
          type="button"
          class="btn btn-primary text-xs px-4 py-2 font-black flex items-center gap-1.5 shadow-md"
          @click="start"
        >
          <span>🚀</span> Mulai Battle!
        </button>
      </div>
    </div>

    <!-- Notification Toast / Banner -->
    <div
      v-if="savedNote"
      class="rounded-xl px-4 py-3 text-xs font-semibold flex items-center justify-between shadow-xs transition"
      :class="savedNoteType === 'error' ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'"
    >
      <div class="flex items-center gap-2">
        <span>{{ savedNoteType === 'error' ? '⚠️' : '✅' }}</span>
        <span>{{ savedNote }}</span>
      </div>
      <button @click="savedNote = ''" class="text-surface-400 hover:text-surface-700">✕</button>
    </div>

    <!-- FORM SECTIONS -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- SECTION A: JENIS ULANGAN (2 Cols) -->
      <section class="card space-y-4 xl:col-span-2">
        <div class="flex items-center gap-2 pb-2 border-b border-surface-100">
          <span class="w-6 h-6 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs">A</span>
          <h2 class="font-bold text-surface-900 text-base">Jenis Ulangan</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          <label
            v-for="t in QUIZ_TYPES"
            :key="t.id"
            class="flex items-center gap-2.5 rounded-xl border p-3 text-xs cursor-pointer transition hover:border-violet-300"
            :class="draft.quizType === t.id ? 'border-violet-600 bg-violet-50/70 font-bold text-violet-900 ring-2 ring-violet-200' : 'border-surface-200 text-surface-700'"
          >
            <input v-model="draft.quizType" type="radio" :value="t.id" class="text-violet-600 focus:ring-violet-500" />
            <span>{{ t.label }}</span>
          </label>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label class="label">Mata Pelajaran</label>
            <select v-model="draft.subjectName" class="input text-xs font-semibold" @change="onSubjectChange">
              <option v-for="s in availableSubjects" :key="s.id" :value="s.name">
                {{ s.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="label flex items-center justify-between">
              <span>🎯 Tujuan Pembelajaran (TP) yang Diujikan</span>
              <span class="text-[10px] text-purple-600 font-bold">Otomatis Masuk Sumatif TP (30%)</span>
            </label>
            <select v-model="draft.tpId" class="input text-xs font-semibold" @change="onTpChange">
              <option value="">-- Pilih Tujuan Pembelajaran (TP) --</option>
              <optgroup v-for="chap in availableChapters" :key="chap.id" :label="chap.title">
                <option v-for="tp in chap.tps" :key="tp.id" :value="tp.id">
                  {{ tp.code }} — {{ tp.description }}
                </option>
              </optgroup>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label class="label">Judul Aktivitas Ulangan</label>
            <input
              v-model="draft.title"
              class="input text-xs"
              placeholder="Contoh: Ulangan Harian — Berpikir Komputasional"
            />
          </div>
          <div>
            <label class="label">Topik / Materi Pokok</label>
            <input
              v-model="draft.topic"
              class="input text-xs"
              placeholder="Contoh: Berpikir Komputasional & Algoritma"
            />
          </div>
        </div>
      </section>

      <!-- LIVE PREVIEW SPRITE CARD (1 Col) -->
      <section class="card space-y-3 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-2 border-b border-surface-100">
            <h2 class="font-bold text-surface-900 text-sm flex items-center gap-1.5">
              <span>👁️</span> Pratinjau Karakter Boss
            </h2>
            <span class="text-[10px] uppercase font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded">
              {{ currentBoss.difficulty }}
            </span>
          </div>

          <!-- Pose selector for preview -->
          <div class="flex items-center justify-center gap-1.5 my-2">
            <button
              v-for="p in ['idle', 'hit', 'laugh', 'defeated']"
              :key="p"
              type="button"
              class="px-2 py-0.5 rounded text-[10px] font-bold uppercase transition"
              :class="previewPose === p ? 'bg-violet-600 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'"
              @click="previewPose = p"
            >
              {{ p }}
            </button>
          </div>

          <div class="rounded-2xl bg-gradient-to-b from-[#180e38] via-[#0d0922] to-[#07051a] p-4 flex justify-center items-center min-h-[220px] shadow-inner border border-violet-950">
            <BossSprite
              :name="draft.bossName"
              :boss-id="draft.bossId"
              :color="currentBoss.color"
              :accent="currentBoss.accent"
              :custom-image-url="draft.customImageUrl"
              :pose="previewPose"
              :show-hit="previewHit"
            />
          </div>

          <div class="mt-3 text-center space-y-2">
            <p class="text-xs text-surface-600 italic px-2 leading-relaxed">
              "{{ currentBoss.description }}"
            </p>
            <button
              type="button"
              class="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              @click="start"
            >
              <span>⚔️</span> Mulai Battle!
            </button>
          </div>
        </div>

        <p class="text-[10px] text-surface-500 text-center italic">
          * Pratinjau tidak mengubah nilai akademik, data penilaian, atau hasil ulangan siswa.
        </p>
      </section>
    </div>

    <!-- SECTION B: NAMA BOSS & PESAN KARAKTER -->
    <section class="card space-y-4">
      <div class="flex items-center gap-2 pb-2 border-b border-surface-100">
        <span class="w-6 h-6 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs">B</span>
        <h2 class="font-bold text-surface-900 text-base">Nama Boss & Deskripsi</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <div>
          <label class="label">Nama Boss (Bisa Kustom)</label>
          <input v-model="draft.bossName" class="input text-xs" placeholder="Ketik nama boss kustom..." />
        </div>
        <div>
          <label class="label">Pilih dari Katalog Boss</label>
          <select v-model="draft.bossId" class="input text-xs font-semibold" @change="onCatalogBoss">
            <option v-for="b in BOSS_CATALOG" :key="b.id" :value="b.id">
              {{ b.name }} ({{ b.topic }})
            </option>
          </select>
        </div>
        <div>
          <label class="label">Tingkat Kesulitan</label>
          <input :value="currentBoss.difficulty.toUpperCase()" class="input text-xs bg-surface-50 font-bold capitalize text-surface-600" disabled />
        </div>
        <div class="md:col-span-2">
          <label class="label">Deskripsi Karakter Boss</label>
          <textarea
            v-model="draft.bossDescription"
            class="input text-xs min-h-[68px]"
            placeholder="Deskripsi peran boss dalam ulangan..."
          ></textarea>
        </div>
        <div>
          <label class="label">Materi / Topik yang Diwakili</label>
          <input v-model="draft.topic" class="input text-xs" />
        </div>
        <div>
          <label class="label">Pesan Saat Boss Muncul (Spawn Message)</label>
          <input v-model="draft.spawnMessage" class="input text-xs" />
        </div>
        <div>
          <label class="label">Pesan Saat Boss Kalah (Defeat Message)</label>
          <input v-model="draft.defeatMessage" class="input text-xs" />
        </div>
        <div>
          <label class="label">Pesan Saat Boss Menang (Win Message)</label>
          <input v-model="draft.winMessage" class="input text-xs" />
        </div>
      </div>
    </section>

    <!-- SECTION C: KARAKTER BOSS (KATALOG & CUSTOM IMAGE UPLOAD) -->
    <section class="card space-y-4">
      <div class="flex items-center justify-between pb-2 border-b border-surface-100">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs">C</span>
          <h2 class="font-bold text-surface-900 text-base">Karakter Boss</h2>
        </div>
        <span class="text-xs text-surface-500">Konfigurasi karakter disimpan secara snapshot bersama sesi</span>
      </div>

      <!-- Boss Catalog Grid Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <button
          v-for="b in BOSS_CATALOG"
          :key="b.id"
          type="button"
          class="rounded-2xl border p-3.5 text-left transition relative flex flex-col justify-between group hover:shadow-md"
          :class="draft.bossId === b.id ? 'border-violet-600 bg-violet-50/50 ring-2 ring-violet-200' : 'border-surface-200 bg-white hover:border-surface-300'"
          @click="pickBoss(b.id)"
        >
          <div
            class="h-32 rounded-xl mb-2.5 flex items-center justify-center overflow-hidden relative shadow-inner transition group-hover:scale-102 border border-white/5"
            :style="{ background: `radial-gradient(circle at 50% 50%, ${b.accent}22 0%, #0b0819 100%)` }"
          >
            <div class="scale-[0.44] origin-center pointer-events-none -my-14 select-none">
              <BossSprite
                :name="b.name"
                :boss-id="b.id"
                :color="b.color"
                :accent="b.accent"
                pose="idle"
              />
            </div>
          </div>
          <div>
            <p class="font-black text-xs text-surface-900">{{ b.name }}</p>
            <p class="text-[11px] text-surface-500 truncate">{{ b.topic }}</p>
            <div class="flex items-center justify-between mt-2 pt-2 border-t border-surface-100 text-[10px]">
              <span class="text-violet-600 font-bold capitalize">{{ b.difficulty }}</span>
              <span class="text-surface-400">Idle &bull; Hit &bull; Kalah</span>
            </div>
          </div>
        </button>
      </div>

      <!-- Upload Custom Character Image -->
      <div class="p-4 rounded-xl bg-surface-50 border border-surface-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="space-y-0.5 text-xs">
          <p class="font-bold text-surface-800">Unggah Gambar Karakter Sendiri (Opsional)</p>
          <p class="text-[11px] text-surface-500">Mendukung format PNG, JPEG, WebP (Maks 2MB, transparan direkomendasikan).</p>
        </div>
        <div class="flex items-center gap-2">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            class="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-600 file:text-white hover:file:bg-violet-700 cursor-pointer"
            @change="onUpload"
          />
          <button
            v-if="draft.customImageUrl"
            type="button"
            class="text-xs text-rose-600 font-bold hover:underline"
            @click="draft.customImageUrl = null"
          >
            Hapus Gambar
          </button>
        </div>
      </div>
    </section>

    <!-- SECTION D: PENGATURAN PERMAINAN -->
    <section class="card space-y-4">
      <div class="flex items-center gap-2 pb-2 border-b border-surface-100">
        <span class="w-6 h-6 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs">D</span>
        <h2 class="font-bold text-surface-900 text-base">Pengaturan Permainan</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
        <div>
          <label class="label">Kelas Peserta</label>
          <select v-model="draft.settings.classroomId" class="input text-xs font-bold" @change="onClassChange">
            <option v-for="c in classrooms" :key="c.id" :value="c.id">
              {{ formatClassLabel(c) }}
            </option>
          </select>
        </div>
        <div>
          <label class="label">KKM (Kriteria Ketuntasan Minimal)</label>
          <input
            v-model.number="draft.settings.kkm"
            type="number"
            min="1"
            max="100"
            class="input text-xs font-bold text-violet-700"
          />
        </div>
        <div>
          <label class="label">Jumlah Soal</label>
          <input v-model.number="draft.settings.questionCount" type="number" min="1" max="50" class="input text-xs font-bold" />
        </div>
        <div>
          <label class="label">Durasi Battle (Menit)</label>
          <input v-model.number="draft.settings.durationMinutes" type="number" min="1" max="180" class="input text-xs font-bold" />
        </div>
        <div>
          <label class="label">Sumber Soal</label>
          <select v-model="draft.settings.questionSource" class="input text-xs">
            <option value="bank_soal">Bank Soal Guru</option>
            <option value="asesmen">Paket Asesmen Kurikulum</option>
            <option value="manual">Soal Sesi Ini</option>
          </select>
        </div>
        <div>
          <label class="label">HP Awal Boss (Nilai Tampilan Visual)</label>
          <input
            v-model.number="draft.settings.initialBossHp"
            type="number"
            min="1000"
            step="1000"
            class="input text-xs font-bold"
          />
          <p class="text-[10px] text-amber-700 mt-1">
            * Hanya angka visual tampilan (misal 10.000). Ketuntasan ditentukan oleh KKM siswa.
          </p>
        </div>
      </div>

      <!-- Toggles & Checkboxes -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-2 border-t border-surface-100">
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="draft.settings.randomizeQuestions" type="checkbox" class="rounded text-violet-600" />
          <span>Pengacakan urutan soal</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="draft.settings.showStudentAvatars" type="checkbox" class="rounded text-violet-600" />
          <span>Tampilkan avatar siswa</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="draft.settings.soundEnabled" type="checkbox" class="rounded text-violet-600" />
          <span>Efek suara pertempuran</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="draft.settings.animationEnabled" type="checkbox" class="rounded text-violet-600" />
          <span>Animasi pertempuran aktif</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="draft.settings.reducedMotion" type="checkbox" class="rounded text-violet-600" />
          <span>Mode hemat animasi (Low Motion)</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="draft.settings.showStudentNamesOnProjector" type="checkbox" class="rounded text-violet-600" />
          <span>Tampilkan nama siswa di proyektor</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="draft.settings.mvpEnabled" type="checkbox" class="rounded text-violet-600" />
          <span>Tampilkan podium 3 MVP</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="draft.settings.remedialAvailable" type="checkbox" class="rounded text-violet-600" />
          <span>Ketersediaan alur remedial</span>
        </label>
      </div>

      <!-- Official Participant Roster Selection (Data Asli Sistem) -->
      <div class="pt-3 border-t border-surface-100">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div>
            <p class="label mb-0 font-bold text-surface-900">Daftar Siswa Peserta Resmi (Data Asli Sistem)</p>
            <p class="text-[11px] text-surface-500">
              Siswa yang dicentang akan menjadi peserta resmi pertempuran di Arena.
            </p>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <button
              v-if="rosterPool.length > 0"
              type="button"
              class="text-violet-600 font-bold hover:underline"
              @click="selectAllStudents"
            >
              Pilih Semua ({{ rosterPool.length }})
            </button>
            <span v-if="rosterPool.length > 0">&bull;</span>
            <span class="text-surface-600 font-medium">
              Terpilih: <strong class="text-violet-700">{{ draft.settings.officialParticipantIds.length }}</strong> dari {{ rosterPool.length }} Siswa Asli
            </span>
          </div>
        </div>

        <div v-if="loadingStudents" class="py-4 text-center text-xs text-surface-500 flex items-center justify-center gap-2">
          <span class="animate-spin">🔄</span> Memuat data siswa asli dari sistem...
        </div>

        <div v-else-if="rosterPool.length === 0" class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <span class="text-base flex-shrink-0">⚠️</span>
          <div>
            <p class="font-bold">Belum Ada Siswa Terdaftar di Rombel Ini</p>
            <p class="text-[11px] text-amber-800 mt-0.5">
              Silakan tambahkan data siswa di menu <router-link to="/students" class="font-bold underline">Data Siswa</router-link> atau ganti pilihan kelas sasaran di atas.
            </p>
          </div>
        </div>

        <div v-else class="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
          <label
            v-for="s in rosterPool"
            :key="s.id"
            class="px-3.5 py-2 rounded-xl border text-xs cursor-pointer transition flex items-center gap-2 select-none"
            :class="draft.settings.officialParticipantIds.includes(s.id) ? 'bg-violet-100 border-violet-500 text-violet-900 font-bold shadow-xs' : 'border-surface-200 text-surface-600 hover:bg-surface-50'"
          >
            <input
              type="checkbox"
              class="rounded text-violet-600"
              :checked="draft.settings.officialParticipantIds.includes(s.id)"
              @change="toggleStudent(s.id)"
            />
            <span class="text-base">{{ s.avatar || '🧑' }}</span>
            <div class="leading-tight">
              <span>{{ s.name }}</span>
              <span v-if="s.nis" class="text-[10px] text-surface-500 font-normal ml-1">
                (NIS: {{ s.nis }}{{ s.classroom_name ? ' &bull; ' + s.classroom_name : '' }})
              </span>
            </div>
          </label>
        </div>
        <p class="text-[10px] text-surface-400 mt-2">
          * Jumlah peserta ini akan dikunci sebagai penyebut ketuntasan kelas. Tidak akan berkurang jika siswa terputus jaringan.
        </p>
      </div>
    </section>

    <!-- SECTION E: PEMILIHAN BUTIR SOAL DARI BANK SOAL -->
    <section class="card space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-100">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs">E</span>
            <h2 class="font-bold text-surface-900 text-base">
              Butir Soal Terpilih untuk Final Boss Battle ({{ selectedQuestionsList.length }} Soal)
            </h2>
          </div>
          <p class="text-xs text-surface-500 mt-1">
            Pilih butir-butir soal dari Bank Soal yang ingin diujikan dalam Ulangan Gamifikasi Final Boss ini.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="openBankModal"
            class="btn btn-primary text-xs px-3.5 py-2 font-bold flex items-center gap-1.5 shadow-sm"
            id="btn-open-boss-bank-modal"
          >
            <span>📚</span>
            <span>+ Ambil dari Bank Soal</span>
          </button>
          <button
            v-if="selectedQuestionsList.length > 0"
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
        v-if="selectedQuestionsList.length === 0"
        class="p-8 border-2 border-dashed border-surface-200 rounded-2xl text-center space-y-3 bg-surface-50/60"
      >
        <div class="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center mx-auto text-xl">
          📚
        </div>
        <div>
          <h4 class="font-bold text-surface-800 text-sm">Belum Ada Soal Terpilih untuk Ulangan Boss Battle</h4>
          <p class="text-xs text-surface-500 mt-1 max-w-md mx-auto">
            Silakan klik tombol di bawah untuk membuka Bank Soal dan memilih butir-butir soal yang ingin dimasukkan ke dalam game Final Boss.
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
          v-for="(q, idx) in selectedQuestionsList"
          :key="q.id || idx"
          class="p-4 rounded-xl bg-surface-50 border border-surface-200 text-xs space-y-2 hover:border-surface-300 transition"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <span class="w-6 h-6 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">
                {{ idx + 1 }}
              </span>
              <div class="space-y-1">
                <div class="flex flex-wrap items-center gap-1.5">
                  <span class="badge bg-violet-100 text-violet-800 font-semibold text-[10px]">
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
              class="text-surface-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
              title="Hapus soal ini dari Boss Battle"
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
        </div>

        <!-- Tombol Tambah Lagi di Bawah Daftar -->
        <div class="pt-2 flex justify-center">
          <button
            type="button"
            @click="openBankModal"
            class="btn btn-secondary text-xs px-4 py-2 font-semibold flex items-center gap-1.5 text-violet-700 hover:bg-violet-50"
          >
            <span>➕ Tambah Butir Soal Lain dari Bank Soal</span>
          </button>
        </div>
      </div>
    </section>

    <!-- BOTTOM ACTION BAR -->
    <div class="card bg-surface-900 text-white p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-violet-700/50 rounded-2xl">
      <div>
        <p class="font-extrabold text-sm text-amber-300 flex items-center gap-1.5">
          <span>⚔️</span> Konfigurasi Battle Siap Dimulai
        </p>
        <p class="text-xs text-surface-300 mt-0.5">
          Boss: <strong class="text-white">{{ draft.bossName }}</strong> &bull; Peserta Resmi: <strong class="text-white">{{ draft.settings.officialParticipantIds.length }} Siswa</strong> &bull; KKM: <strong class="text-white">{{ draft.settings.kkm }}</strong>
        </p>
      </div>
      <div class="flex items-center gap-2.5">
        <button
          type="button"
          class="btn bg-surface-700 hover:bg-surface-600 text-white text-xs px-3.5 py-2.5 font-bold rounded-xl"
          @click="save"
        >
          💾 Simpan Draf
        </button>
        <button
          type="button"
          class="btn bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs px-5 py-2.5 shadow-lg flex items-center gap-2 rounded-xl ring-2 ring-violet-400/50 transition hover:scale-102"
          @click="start"
        >
          <span>🚀</span> Mulai Battle Sekarang!
        </button>
      </div>
    </div>

    <!-- PREVIEW MODAL (Pratinjau Boss / Arena / Animasi Tanpa Mengubah Sesi Aktif) -->
    <div
      v-if="showModalPreview"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
      @click.self="showModalPreview = false"
    >
      <div class="bg-slate-900 border border-white/20 rounded-3xl max-w-2xl w-full p-6 text-white space-y-4 shadow-2xl relative">
        <div class="flex items-center justify-between pb-3 border-b border-white/10">
          <div class="flex items-center gap-2">
            <span class="text-xl">👁️</span>
            <div>
              <h3 class="font-black text-base">Pratinjau {{ previewKindTitle }}</h3>
              <p class="text-[11px] text-white/60">Pratinjau visual & simulasi &bull; Sesi penilaian aktif tidak terpengaruh</p>
            </div>
          </div>
          <button @click="showModalPreview = false" class="text-white/60 hover:text-white text-lg">✕</button>
        </div>

        <!-- Preview Arena Simulation -->
        <div class="rounded-2xl bg-gradient-to-b from-[#1b0a3d] to-[#07051a] p-6 flex flex-col items-center justify-center min-h-[320px] relative overflow-hidden border border-violet-800/40">
          <!-- Realistic Laser Beam Preview -->
          <div v-if="previewLaser" class="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
            <div class="w-3 h-3/4 bg-gradient-to-t from-cyan-400 via-sky-300 to-white rounded-full shadow-[0_0_25px_#22d3ee,0_0_50px_#06b6d4] animate-pulse"></div>
            <div class="absolute top-[28%] w-12 h-12 rounded-full bg-cyan-300/40 border-2 border-white animate-ping"></div>
          </div>

          <BossSprite
            :name="draft.bossName"
            :boss-id="draft.bossId"
            :color="currentBoss.color"
            :accent="currentBoss.accent"
            :custom-image-url="draft.customImageUrl"
            :pose="modalPreviewPose"
            :show-hit="modalPreviewHit"
          />

          <div class="mt-4 flex flex-wrap gap-2 justify-center">
            <button
              class="px-2.5 py-1 rounded-lg text-xs font-bold transition"
              :class="modalPreviewPose === 'idle' ? 'bg-violet-600 text-white' : 'bg-white/10 text-white/70'"
              @click="modalPreviewPose = 'idle'"
            >
              Pose Idle
            </button>
            <button
              class="px-2.5 py-1 rounded-lg text-xs font-bold transition"
              :class="modalPreviewPose === 'hit' ? 'bg-rose-600 text-white' : 'bg-white/10 text-white/70'"
              @click="triggerHitPreview"
            >
              Pose Hit (Diserang)
            </button>
            <button
              class="px-2.5 py-1 rounded-lg text-xs font-bold transition"
              :class="modalPreviewPose === 'laugh' ? 'bg-amber-600 text-white' : 'bg-white/10 text-white/70'"
              @click="modalPreviewPose = 'laugh'"
            >
              Pose Laugh (Tertawa)
            </button>
            <button
              class="px-2.5 py-1 rounded-lg text-xs font-bold transition"
              :class="modalPreviewPose === 'defeated' ? 'bg-emerald-600 text-white' : 'bg-white/10 text-white/70'"
              @click="modalPreviewPose = 'defeated'"
            >
              Pose Kalah (Terbaring X X)
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between text-xs text-white/70 pt-2">
          <span>Target HP: {{ draft.settings.initialBossHp.toLocaleString('id-ID') }} HP (Visual)</span>
          <button class="btn btn-primary text-xs" @click="showModalPreview = false">Tutup Pratinjau</button>
        </div>
      </div>
    </div>

    <!-- MODAL PEMILIH SOAL DARI BANK SOAL (SAMA SEPERTI UJIAN CBT) -->
    <Teleport to="body">
      <div
        v-if="showBankModal"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      >
        <div class="bg-white rounded-2xl shadow-2xl border border-surface-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
          <!-- Modal Header -->
          <div class="p-4 sm:px-6 py-4 border-b border-surface-200 bg-surface-50 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center text-lg font-bold">
                📚
              </div>
              <div>
                <h3 class="font-bold text-surface-900 text-sm sm:text-base">
                  Pilih Butir Soal dari Bank Soal untuk Boss Battle
                </h3>
                <p class="text-xs text-surface-500">
                  Centang butir soal yang ingin dimasukkan ke dalam Ulangan Final Boss, lalu klik tombol Masukkan Soal.
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

          <!-- Modal Filter Bar -->
          <div class="p-4 border-b border-surface-100 bg-white space-y-3 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <!-- Search -->
              <div class="sm:col-span-2 relative">
                <input
                  v-model="bankSearch"
                  type="text"
                  placeholder="Cari teks pertanyaan, materi, atau kata kunci..."
                  class="input text-xs pl-8 w-full"
                />
                <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-400 text-xs">🔍</span>
              </div>

              <!-- Mapel Filter -->
              <div>
                <select v-model="bankSubjectFilter" class="input text-xs w-full">
                  <option value="">Semua Mata Pelajaran</option>
                  <option value="Informatika">Informatika (Kelas 9)</option>
                  <option value="KKA">KKA (Kelas 7)</option>
                </select>
              </div>

              <!-- Tingkat Kesulitan -->
              <div>
                <select v-model="bankDifficultyFilter" class="input text-xs w-full">
                  <option value="">Semua Tingkat Kesulitan</option>
                  <option value="easy">Mudah</option>
                  <option value="medium">Sedang</option>
                  <option value="hard">Sulit</option>
                </select>
              </div>
            </div>

            <!-- Select All & Stats Toolbar -->
            <div class="flex items-center justify-between pt-1 text-[11px] text-surface-600">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  :checked="isAllVisibleSelected"
                  @change="toggleSelectAllVisible"
                  class="rounded border-surface-300 text-violet-600 focus:ring-violet-500 w-4 h-4"
                />
                <span class="font-semibold text-surface-800">
                  Pilih Semua Soal yang Ditampilkan ({{ filteredBankQuestions.length }} Soal)
                </span>
              </label>

              <div class="flex items-center gap-3">
                <span v-if="selectedBankIds.length > 0" class="font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-200">
                  ✓ {{ selectedBankIds.length }} Soal Dicentang
                </span>
                <span class="text-surface-400">
                  Total di Bank Soal: {{ rawBankQuestions.length }} butir
                </span>
              </div>
            </div>
          </div>

          <!-- Modal Soal List (Scrollable) -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-surface-50/50 text-xs">
            <!-- Loading State -->
            <div v-if="loadingBank" class="py-12 text-center space-y-3">
              <div class="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p class="text-surface-500 font-medium">Memuat butir soal dari Bank Soal...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="filteredBankQuestions.length === 0" class="py-12 text-center space-y-2 card bg-white">
              <p class="text-2xl">🔍</p>
              <p class="font-bold text-surface-800">Tidak ada butir soal yang sesuai filter</p>
              <p class="text-surface-500 text-xs max-w-sm mx-auto">
                Coba ubah kata kunci pencarian atau ganti filter mata pelajaran untuk melihat soal lainnya.
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
              :class="selectedBankIds.includes(q.id) ? 'border-violet-500 bg-violet-50/30 ring-1 ring-violet-500' : 'border-surface-200 bg-white hover:border-surface-300'"
            >
              <div class="flex items-start gap-3">
                <!-- Checkbox -->
                <input
                  type="checkbox"
                  :checked="selectedBankIds.includes(q.id)"
                  @click.stop
                  @change="toggleQuestionSelection(q.id)"
                  class="mt-1 rounded border-surface-300 text-violet-600 focus:ring-violet-500 w-4 h-4 flex-shrink-0 cursor-pointer"
                />

                <div class="flex-1 space-y-2 min-w-0">
                  <!-- Badges & Status -->
                  <div class="flex flex-wrap items-center gap-1.5">
                    <span class="badge bg-violet-100 text-violet-800 font-semibold text-[10px]">
                      {{ q.subject_name || 'Informatika' }}
                    </span>
                    <span class="badge bg-surface-100 text-surface-700 text-[10px]">
                      {{ formatDifficulty(q.difficulty) }}
                    </span>
                    <span class="badge bg-surface-100 text-surface-700 text-[10px]">
                      {{ q.type === 'essay' ? 'Esai' : 'Pilihan Ganda' }}
                    </span>
                    <span v-if="isAlreadyInBattle(q.id)" class="badge bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                      ✓ Sudah Dipilih di Battle
                    </span>
                  </div>

                  <!-- Pertanyaan -->
                  <p class="font-medium text-surface-900 leading-relaxed text-xs">
                    {{ stripHtml(q.content || q.text) }}
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
              <span v-if="selectedBankIds.length > 0" class="font-bold text-violet-700">
                🎯 {{ selectedBankIds.length }} butir soal dipilih
              </span>
              <span v-else class="text-surface-400">
                Pilih minimal 1 butir soal untuk dimasukkan ke Final Boss Battle
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
                id="btn-insert-selected-boss-questions"
              >
                <span>➕ Masukkan Soal Terpilih ke Battle</span>
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
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BossSprite from './BossSprite.vue'
import { BOSS_CATALOG, QUIZ_TYPES } from './engine'
import { useBossBattleSession, convertBankToBattleQuestions } from './sessionStore'
import api from '@/services/api'
import {
  useClassrooms,
  getClassGradeLevel,
  getSubjectNameForClass,
  getSubjectIdForClass,
  getAvailableSubjectsForClass
} from '@/composables/useClassrooms'

const router = useRouter()
const route = useRoute()
const { classrooms, fetchClassrooms, formatClassLabel, getClassName } = useClassrooms()
const {
  draft,
  saveSettings,
  openPreview,
  beginBattle,
  applyBossDefaults,
  registerStudentPool,
  bankQuestions,
  setBankQuestions,
} = useBossBattleSession()

const availableSubjects = computed(() => getAvailableSubjectsForClass(draft.settings.classroomId))

const savedNote = ref('')
const savedNoteType = ref<'success' | 'error'>('success')
const previewPose = ref('idle')
const previewHit = ref(false)

// Bank Soal raw questions from API
const rawBankQuestions = ref<any[]>([])
// Selected questions for this boss battle session (array of raw bank question objects)
const selectedQuestionsList = ref<any[]>([])

// Bank Modal State (Identik dengan CBT Ujian)
const showBankModal = ref(false)
const loadingBank = ref(false)
const loadingQuestions = ref(false)
const seedingQuestions = ref(false)
const bankSearch = ref('')
const bankSubjectFilter = ref('')
const bankDifficultyFilter = ref('')
const selectedBankIds = ref<string[]>([])

// Modal preview states
const showModalPreview = ref(false)
const previewKind = ref<'boss' | 'arena' | 'animation'>('boss')
const modalPreviewPose = ref('idle')
const modalPreviewHit = ref(false)
const previewLaser = ref(false)

// Student Roster (Data Siswa Asli Sistem - Bukan Dummy)
const loadingStudents = ref(false)
const rosterPool = ref<Array<{ id: string; name: string; avatar?: string; nis?: string; classroom_name?: string }>>([])

// Computed untuk Filter Soal di Bank Modal
const filteredBankQuestions = computed(() => {
  return rawBankQuestions.value.filter((q) => {
    // Subject filter
    if (bankSubjectFilter.value && q.subject_name !== bankSubjectFilter.value && q.topic !== bankSubjectFilter.value) {
      return false
    }
    // Difficulty filter
    if (bankDifficultyFilter.value && q.difficulty !== bankDifficultyFilter.value) {
      return false
    }
    // Search text
    if (bankSearch.value.trim()) {
      const term = bankSearch.value.toLowerCase().trim()
      const contentMatch = (q.content || q.text || '').toLowerCase().includes(term)
      const topicMatch = (q.topic || q.subject_name || '').toLowerCase().includes(term)
      return contentMatch || topicMatch
    }
    return true
  })
})

const isAllVisibleSelected = computed(() => {
  if (filteredBankQuestions.value.length === 0) return false
  return filteredBankQuestions.value.every((q) => selectedBankIds.value.includes(q.id))
})

function openBankModal() {
  selectedBankIds.value = selectedQuestionsList.value.map((q) => q.id)
  showBankModal.value = true
}

function closeBankModal() {
  showBankModal.value = false
}

function toggleQuestionSelection(id: string) {
  const idx = selectedBankIds.value.indexOf(id)
  if (idx === -1) {
    selectedBankIds.value.push(id)
  } else {
    selectedBankIds.value.splice(idx, 1)
  }
}

function toggleSelectAllVisible() {
  if (isAllVisibleSelected.value) {
    const visibleIds = new Set(filteredBankQuestions.value.map((q) => q.id))
    selectedBankIds.value = selectedBankIds.value.filter((id) => !visibleIds.has(id))
  } else {
    const current = new Set(selectedBankIds.value)
    filteredBankQuestions.value.forEach((q) => current.add(q.id))
    selectedBankIds.value = Array.from(current)
  }
}

function resetBankFilters() {
  bankSearch.value = ''
  bankSubjectFilter.value = ''
  bankDifficultyFilter.value = ''
}

function isAlreadyInBattle(id: string) {
  return selectedQuestionsList.value.some((q) => q.id === id)
}

function isOptionCorrect(opt: any, optIdx: number, q: any) {
  if (typeof opt === 'object' && opt.is_correct === true) return true
  const letter = String.fromCharCode(65 + optIdx)
  if (q.correct_answer === letter || q.correctOption === letter) return true
  return false
}

function formatDifficulty(diff?: string) {
  if (diff === 'easy') return 'Mudah'
  if (diff === 'hard') return 'Sulit'
  return 'Sedang'
}

function stripHtml(html?: string) {
  if (!html) return ''
  return html.replace(/<[^>]*>?/gm, '').trim()
}

function insertSelectedQuestions() {
  if (selectedBankIds.value.length === 0) return

  const existingMap = new Map(selectedQuestionsList.value.map((q) => [q.id, q]))
  selectedBankIds.value.forEach((id) => {
    if (!existingMap.has(id)) {
      const found = rawBankQuestions.value.find((q) => q.id === id)
      if (found) {
        selectedQuestionsList.value.push(found)
      }
    }
  })

  // Sinkronkan urutan jika ada yang di-uncheck
  selectedQuestionsList.value = selectedQuestionsList.value.filter((q) => selectedBankIds.value.includes(q.id))

  // Update questionCount otomatis
  draft.settings.questionCount = selectedQuestionsList.value.length
  saveSelectedQuestionsToStorage()

  savedNote.value = `Berhasil memasukkan ${selectedQuestionsList.value.length} butir soal ke dalam paket Final Boss Battle!`
  savedNoteType.value = 'success'
  showBankModal.value = false
}

function removeQuestion(idx: number) {
  selectedQuestionsList.value.splice(idx, 1)
  draft.settings.questionCount = selectedQuestionsList.value.length
  saveSelectedQuestionsToStorage()
}

function clearAllQuestions() {
  if (confirm('Apakah Anda yakin ingin mengosongkan semua butir soal di paket Final Boss ini?')) {
    selectedQuestionsList.value = []
    draft.settings.questionCount = 0
    saveSelectedQuestionsToStorage()
  }
}

function saveSelectedQuestionsToStorage() {
  try {
    const ids = selectedQuestionsList.value.map((q) => q.id)
    localStorage.setItem('agd_boss_battle_selected_ids', JSON.stringify(ids))
  } catch {}
}

function loadSelectedQuestionsFromStorage() {
  try {
    const raw = localStorage.getItem('agd_boss_battle_selected_ids')
    if (raw) {
      const ids: string[] = JSON.parse(raw)
      const restored = rawBankQuestions.value.filter((q) => ids.includes(q.id))
      if (restored.length > 0) {
        selectedQuestionsList.value = restored
        draft.settings.questionCount = restored.length
        return
      }
    }
  } catch {}

  // Jika belum ada penyimpanan, ambil maksimal 10 butir pertama dari Bank Soal
  if (rawBankQuestions.value.length > 0 && selectedQuestionsList.value.length === 0) {
    selectedQuestionsList.value = rawBankQuestions.value.slice(0, Math.min(10, rawBankQuestions.value.length))
    draft.settings.questionCount = selectedQuestionsList.value.length
  }
}

async function fetchBankQuestions() {
  loadingQuestions.value = true
  loadingBank.value = true
  try {
    const res = await api.get('/questions')
    if (res.data?.data && Array.isArray(res.data.data)) {
      rawBankQuestions.value = res.data.data
      setBankQuestions(res.data.data)
      loadSelectedQuestionsFromStorage()
    } else {
      rawBankQuestions.value = []
      setBankQuestions([])
    }
  } catch (err) {
    console.warn('Failed to fetch bank questions:', err)
    rawBankQuestions.value = []
    setBankQuestions([])
  } finally {
    loadingQuestions.value = false
    loadingBank.value = false
  }
}

async function seedInformatikaQuestions() {
  seedingQuestions.value = true
  try {
    const defaultInformatikaQuestions = [
      {
        type: 'multiple_choice',
        content: 'Manakah di bawah ini yang merupakan 4 pilar utama dalam Berpikir Komputasional (Computational Thinking)?',
        options: [
          { text: 'Dekomposisi, Pengenalan Pola, Abstraksi, Algoritma', is_correct: true },
          { text: 'Coding, Desain Grafis, Perakitan, Jaringan', is_correct: false },
          { text: 'Analisis Data, Microsoft Word, Browser, Internet', is_correct: false },
          { text: 'Hardware, Software, Brainware, Firmware', is_correct: false },
        ],
        points: 10,
        explanation: 'Empat pilar berpikir komputasional adalah Dekomposisi, Pengenalan Pola, Abstraksi, dan Perancangan Algoritma.',
      },
      {
        type: 'multiple_choice',
        content: 'Proses memecah masalah kompleks menjadi sub-masalah atau bagian yang lebih kecil dan mudah dikelola disebut...',
        options: [
          { text: 'Abstraksi', is_correct: false },
          { text: 'Dekomposisi', is_correct: true },
          { text: 'Pengenalan Pola', is_correct: false },
          { text: 'Iterasi', is_correct: false },
        ],
        points: 10,
        explanation: 'Dekomposisi adalah teknik memecah masalah besar menjadi bagian-bagian yang lebih kecil.',
      },
      {
        type: 'multiple_choice',
        content: 'Dalam pemrograman komputer, struktur kontrol yang digunakan untuk memilih jalur eksekusi berdasarkan kondisi benar (true) atau salah (false) adalah...',
        options: [
          { text: 'Percabangan (If-Else)', is_correct: true },
          { text: 'Perulangan (Looping)', is_correct: false },
          { text: 'Deklarasi Variabel', is_correct: false },
          { text: 'Fungsi Rekursif', is_correct: false },
        ],
        points: 10,
        explanation: 'Struktur kontrol If-Else digunakan untuk percabangan logis sesuai kondisi.',
      },
      {
        type: 'multiple_choice',
        content: 'Perangkat lunak (software) sistem yang berfungsi sebagai jembatan utama antara brainware (pengguna) dan hardware komputer adalah...',
        options: [
          { text: 'Web Browser', is_correct: false },
          { text: 'Sistem Operasi (Operating System)', is_correct: true },
          { text: 'Database Management System', is_correct: false },
          { text: 'Aplikasi Spreadsheet', is_correct: false },
        ],
        points: 10,
        explanation: 'Sistem Operasi mengelola sumber daya perangkat keras dan menyediakan antarmuka bagi pengguna.',
      },
      {
        type: 'multiple_choice',
        content: 'Urutan langkah-langkah logis, berhingga, dan sistematis untuk menyelesaikan suatu masalah perhitungan dinamakan...',
        options: [
          { text: 'Pseudocode', is_correct: false },
          { text: 'Algoritma', is_correct: true },
          { text: 'Syntax', is_correct: false },
          { text: 'Compiler', is_correct: false },
        ],
        points: 10,
        explanation: 'Algoritma adalah serangkaian instruksi terurut untuk menyelesaikan masalah secara sistematis.',
      },
      {
        type: 'multiple_choice',
        content: 'Jaringan komputer lokal yang mencakup area terbatas seperti dalam satu ruangan laboratorium atau satu gedung sekolah disebut...',
        options: [
          { text: 'WAN (Wide Area Network)', is_correct: false },
          { text: 'LAN (Local Area Network)', is_correct: true },
          { text: 'MAN (Metropolitan Area Network)', is_correct: false },
          { text: 'PAN (Personal Area Network)', is_correct: false },
        ],
        points: 10,
        explanation: 'LAN mencakup area geografis terbatas seperti gedung atau lab sekolah.',
      },
      {
        type: 'multiple_choice',
        content: 'Teknik menyembunyikan detail kompleks yang tidak relevan dan hanya memfokuskan perhatian pada informasi paling esensial disebut...',
        options: [
          { text: 'Abstraksi', is_correct: true },
          { text: 'Dekomposisi', is_correct: false },
          { text: 'Generalisasi', is_correct: false },
          { text: 'Enkapsulasi', is_correct: false },
        ],
        points: 10,
        explanation: 'Abstraksi menyaring hal yang tidak esensial untuk mempermudah fokus pada masalah utama.',
      },
      {
        type: 'multiple_choice',
        content: 'Tipe data primitif yang hanya memiliki dua kemungkinan nilai kebenaran, yaitu True (Benar) atau False (Salah), adalah...',
        options: [
          { text: 'Integer', is_correct: false },
          { text: 'String', is_correct: false },
          { text: 'Boolean', is_correct: true },
          { text: 'Float', is_correct: false },
        ],
        points: 10,
        explanation: 'Boolean merepresentasikan nilai kebenaran True atau False.',
      },
      {
        type: 'multiple_choice',
        content: 'Protokol transmisi web yang menjamin keamanan komunikasi dengan menggunakan sertifikat enkripsi SSL/TLS adalah...',
        options: [
          { text: 'HTTP', is_correct: false },
          { text: 'HTTPS', is_correct: true },
          { text: 'FTP', is_correct: false },
          { text: 'SMTP', is_correct: false },
        ],
        points: 10,
        explanation: 'HTTPS mengenkripsi data antar browser dan web server untuk keamanan privasi.',
      },
      {
        type: 'multiple_choice',
        content: 'Dalam struktur data, prinsip penyimpanan di mana data terakhir yang dimasukkan akan dikeluarkan pertama kali (Last In, First Out) adalah karakteristik dari...',
        options: [
          { text: 'Queue (Antrean)', is_correct: false },
          { text: 'Stack (Tumpukan)', is_correct: true },
          { text: 'Array (Larik)', is_correct: false },
          { text: 'Tree (Pohon)', is_correct: false },
        ],
        points: 10,
        explanation: 'Stack bekerja berdasarkan prinsip LIFO (Last In First Out).',
      },
    ]

    for (const q of defaultInformatikaQuestions) {
      await api.post('/questions', q)
    }

    await fetchBankQuestions()
    savedNote.value = 'Berhasil memuat 10 Soal Standar Informatika ke dalam Bank Soal! Soal siap diujikan.'
    savedNoteType.value = 'success'
  } catch (err: any) {
    console.error('Failed to seed questions:', err)
    savedNote.value = `Gagal memuat soal standar: ${err?.message || err}`
    savedNoteType.value = 'error'
  } finally {
    seedingQuestions.value = false
  }
}

async function loadStudentsForClass(classId?: string) {
  loadingStudents.value = true
  try {
    // 1. Ambil seluruh data siswa kelas dari API (tanpa batasan 20 siswa)
    const classStudentsRes = await api.get('/students', { params: { classroom_id: classId, all: 'true' } })
    let matchedStudents: any[] = classStudentsRes.data?.data || []

    // 2. Jika kelas yang dipilih saat ini kosong, tapi ada siswa asli di kelas lain:
    if (matchedStudents.length === 0) {
      const allStudentsRes = await api.get('/students', { params: { all: 'true' } })
      const allStudents: any[] = allStudentsRes.data?.data || []
      if (allStudents.length > 0) {
        const firstReal = allStudents[0]
        if (firstReal.classroom_id && classrooms.value.some((c) => c.id === firstReal.classroom_id)) {
          draft.settings.classroomId = firstReal.classroom_id
          const rawCls = getClassName(firstReal.classroom_id)
          draft.settings.classroomName = rawCls.replace(/^kelas\s+/i, '')
          draft.subjectId = getSubjectIdForClass(firstReal.classroom_id)
          draft.subjectName = getSubjectNameForClass(firstReal.classroom_id)
          matchedStudents = allStudents.filter((s: any) => s.classroom_id === firstReal.classroom_id)
        } else {
          matchedStudents = allStudents
        }
      }
    }

    // 3. Hanya gunakan data siswa ASLI sistem (TIDAK ADA DATA SISWA DUMMY)
    if (matchedStudents.length > 0) {
      rosterPool.value = matchedStudents.map((s: any) => ({
        id: s.id,
        name: s.name,
        avatar: s.gender === 'P' ? '👧' : '🧑',
        nis: s.nis || '',
        classroom_name: s.classroom_name || '',
      }))
    } else {
      rosterPool.value = []
    }
  } catch (err) {
    console.warn('Failed to load real students:', err)
    rosterPool.value = []
  } finally {
    loadingStudents.value = false
  }

  // Daftarkan siswa asli ke pool sesi pertempuran
  registerStudentPool(rosterPool.value)
  draft.settings.officialParticipantIds = rosterPool.value.map((s: any) => s.id)
}

const availableChapters = ref<any[]>([])

async function loadChapters() {
  try {
    const sId = getSubjectIdForClass(draft.settings.classroomId) || (draft.subjectName.toLowerCase().includes('kka') ? 'sub-kka' : 'sub-inf')
    const gradeLevel = getClassGradeLevel(draft.settings.classroomId) || (sId === 'sub-kka' ? 7 : 9)
    const res = await api.get('/chapters', { params: { subject_id: sId, grade_level: gradeLevel } })
    availableChapters.value = res.data?.data || []
    if (availableChapters.value.length > 0 && !draft.tpId) {
      const firstTp = availableChapters.value[0]?.tps?.[0]
      if (firstTp) {
        draft.tpId = firstTp.id
        draft.tpCode = firstTp.code
      }
    }
  } catch (err) {
    console.error('Failed to load chapters for ulangan:', err)
  }
}

function onTpChange() {
  for (const chap of availableChapters.value) {
    const tp = (chap.tps || []).find((t: any) => t.id === draft.tpId)
    if (tp) {
      draft.tpCode = tp.code
      draft.title = `Ulangan Harian — ${tp.code}`
      draft.topic = tp.description || chap.title
      break
    }
  }
}

onMounted(async () => {
  await fetchClassrooms()
  const queryClassId = (route.query.classroomId || route.query.classId || route.query.classroom) as string | undefined
  if (queryClassId && classrooms.value.some((c) => c.id === queryClassId)) {
    draft.settings.classroomId = queryClassId
  } else if (classrooms.value.length > 0 && !draft.settings.classroomId) {
    draft.settings.classroomId = classrooms.value[0].id
  }
  if (draft.settings.classroomId) {
    const rawCls = getClassName(draft.settings.classroomId)
    draft.settings.classroomName = rawCls.replace(/^kelas\s+/i, '')
    draft.subjectName = getSubjectNameForClass(draft.settings.classroomId)
    draft.subjectId = getSubjectIdForClass(draft.settings.classroomId)
    draft.title = `Ulangan Harian — ${draft.subjectName}`
  }
  await fetchBankQuestions()
  await loadStudentsForClass(draft.settings.classroomId)
  await loadChapters()
})

const currentBoss = computed(() => {
  return BOSS_CATALOG.find((b) => b.id === draft.bossId) ?? BOSS_CATALOG[0]
})

const previewKindTitle = computed(() => {
  if (previewKind.value === 'boss') return 'Karakter Boss'
  if (previewKind.value === 'arena') return 'Arena Pertempuran'
  return 'Animasi Serangan Siswa'
})

async function onSubjectChange() {
  draft.title = `Ulangan Harian — ${draft.subjectName}`
  if (draft.subjectName === 'Informatika') {
    draft.topic = 'Berpikir Komputasional & Algoritma'
  } else {
    draft.topic = `Materi Pokok ${draft.subjectName}`
  }
  await loadChapters()
}

function onCatalogBoss() {
  applyBossDefaults(draft.bossId)
}

function pickBoss(id: string) {
  draft.bossId = id
  applyBossDefaults(id)
}

async function onClassChange() {
  const matchingSubject = getSubjectNameForClass(draft.settings.classroomId)
  const rawCls = getClassName(draft.settings.classroomId)
  draft.settings.classroomName = rawCls.replace(/^kelas\s+/i, '')
  draft.subjectId = getSubjectIdForClass(draft.settings.classroomId)
  if (matchingSubject) {
    draft.subjectName = matchingSubject
    draft.title = `Ulangan Harian — ${draft.subjectName}`
  }
  await loadStudentsForClass(draft.settings.classroomId)
  await loadChapters()
  savedNote.value = `Kelas diubah ke Kelas ${draft.settings.classroomName}. Daftar peserta resmi diperbarui (${rosterPool.value.length} siswa asli).`
  savedNoteType.value = 'success'
}

function toggleStudent(id: string) {
  const list = draft.settings.officialParticipantIds
  if (list.includes(id)) {
    draft.settings.officialParticipantIds = list.filter((x) => x !== id)
  } else {
    draft.settings.officialParticipantIds = [...list, id]
  }
}

function selectAllStudents() {
  draft.settings.officialParticipantIds = rosterPool.value.map((s) => s.id)
}

function getConvertedBattleQuestions() {
  if (selectedQuestionsList.value.length > 0) {
    return convertBankToBattleQuestions(selectedQuestionsList.value)
  }
  return convertBankToBattleQuestions(rawBankQuestions.value)
}

function save() {
  try {
    const rawCls = getClassName(draft.settings.classroomId)
    draft.settings.classroomName = rawCls.replace(/^kelas\s+/i, '')
    draft.subjectId = getSubjectIdForClass(draft.settings.classroomId)
    draft.subjectName = getSubjectNameForClass(draft.settings.classroomId)

    if (!draft.settings.officialParticipantIds.length) {
      if (rosterPool.value.length) {
        draft.settings.officialParticipantIds = rosterPool.value.map((s) => s.id)
      } else {
        savedNote.value = 'Belum ada siswa peserta resmi! Pastikan kelas memiliki data siswa asli.'
        savedNoteType.value = 'error'
        return
      }
    }

    const battleQuestions = getConvertedBattleQuestions()
    registerStudentPool(rosterPool.value)
    const s = saveSettings(battleQuestions)
    savedNote.value = `Pengaturan berhasil disimpan untuk sesi ${s.sessionId}! (${selectedQuestionsList.value.length} butir soal terpilih, ${rosterPool.value.length} siswa asli).`
    savedNoteType.value = 'success'
  } catch (err: any) {
    console.error('Failed to save settings:', err)
    savedNote.value = `Gagal menyimpan pengaturan: ${err?.message || err}`
    savedNoteType.value = 'error'
  }
}

function openPreviewModal(kind: 'boss' | 'arena' | 'animation') {
  try {
    registerStudentPool(rosterPool.value)
    const battleQuestions = getConvertedBattleQuestions()
    saveSettings(battleQuestions)
    openPreview(kind)
  } catch (err) {
    console.warn('Preview setup warning:', err)
  }
  previewKind.value = kind
  showModalPreview.value = true

  if (kind === 'animation') {
    triggerHitPreview()
  } else {
    modalPreviewPose.value = 'idle'
  }
}

function triggerHitPreview() {
  previewLaser.value = true
  modalPreviewHit.value = true
  modalPreviewPose.value = 'hit'
  setTimeout(() => {
    previewLaser.value = false
    modalPreviewHit.value = false
    modalPreviewPose.value = 'idle'
  }, 750)
}

async function start() {
  try {
    if (selectedQuestionsList.value.length === 0) {
      savedNote.value = '⚠️ Belum ada butir soal terpilih! Silakan klik "+ Ambil dari Bank Soal" untuk memilih butir soal yang diujikan.'
      savedNoteType.value = 'error'
      return
    }

    if (!draft.settings.officialParticipantIds.length) {
      if (rosterPool.value.length) {
        draft.settings.officialParticipantIds = rosterPool.value.map((s) => s.id)
      } else {
        savedNote.value = 'Tidak ada siswa peserta resmi terdeteksi di kelas ini! Pastikan rombel memiliki data siswa.'
        savedNoteType.value = 'error'
        return
      }
    }

    const rawCls = getClassName(draft.settings.classroomId)
    draft.settings.classroomName = rawCls.replace(/^kelas\s+/i, '')
    draft.subjectId = getSubjectIdForClass(draft.settings.classroomId)
    draft.subjectName = getSubjectNameForClass(draft.settings.classroomId)

    registerStudentPool(rosterPool.value)
    const battleQuestions = getConvertedBattleQuestions()
    const s = beginBattle(battleQuestions)

    // Sync to backend for live broadcast dispatch
    api.post('/ulangan-gamifikasi/sessions/active', {
      session_id: s.sessionId,
      title: draft.title || 'Boss Battle — Ulangan Harian',
      topic: draft.topic || `Materi Pokok ${draft.subjectName}`,
      subject: draft.subjectName,
      subject_id: draft.subjectId,
      classroom_id: draft.settings.classroomId,
      classroom_name: draft.settings.classroomName,
      participant_ids: draft.settings.officialParticipantIds,
    }).catch((err) => console.warn('Could not register active session to API:', err))

    savedNote.value = 'Battle dimulai! Mengalihkan ke arena...'
    savedNoteType.value = 'success'
    await router.push(`/games/ulangan-harian/arena/${s.sessionId}`)
  } catch (err: any) {
    console.error('Failed to start battle:', err)
    savedNote.value = `Gagal memulai battle: ${err?.message || err}`
    savedNoteType.value = 'error'
  }
}

function onUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    savedNote.value = 'Format gambar tidak didukung! Gunakan PNG, JPEG, atau WebP.'
    savedNoteType.value = 'error'
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    savedNote.value = 'Ukuran gambar maksimal 2MB!'
    savedNoteType.value = 'error'
    return
  }
  draft.customImageUrl = URL.createObjectURL(file)
  savedNote.value = 'Gambar boss kustom berhasil dimuat dalam pratinjau sesi ini!'
  savedNoteType.value = 'success'
}
</script>
