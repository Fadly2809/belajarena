<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span>📚</span> Bank Soal Evaluasi
        </h1>
        <p class="text-slate-600 text-sm mt-1 font-medium">
          Kelola butir soal evaluasi, asesmen, CBT, dan games interaktif di {{ schoolName }}
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <!-- Dropdown Download Format -->
        <div class="relative">
          <button
            @click="showDownloadMenu = !showDownloadMenu"
            class="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition flex items-center gap-1.5"
            title="Download Format Template Soal"
          >
            <svg class="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            <span>Download Format</span>
            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div
            v-if="showDownloadMenu"
            class="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-30 animate-scale-up"
          >
            <button
              @click="downloadTemplateExcel"
              class="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition"
            >
              <span class="text-base">📊</span>
              <div>
                <p class="font-bold text-slate-800">Format Excel (.xlsx)</p>
                <p class="text-[10px] text-slate-400">Template tabel baris & kolom A-D</p>
              </div>
            </button>
            <button
              @click="downloadTemplateWord"
              class="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition"
            >
              <span class="text-base">📄</span>
              <div>
                <p class="font-bold text-slate-800">Format Word (.doc)</p>
                <p class="text-[10px] text-slate-400">Template penomoran soal & kunci</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Tombol Upload File Excel / Word -->
        <button
          @click="showUploadModal = true"
          class="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition flex items-center gap-1.5"
          title="Upload Soal dari Excel atau Word"
        >
          <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
          </svg>
          <span>Upload File</span>
        </button>

        <!-- Tombol Scan Soal dari Gambar (OCR) -->
        <button
          @click="showOcrModal = true"
          class="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition flex items-center gap-1.5"
          title="Input Soal dari Gambar (Deteksi Teks OCR Otomatis)"
        >
          <svg class="w-4 h-4 text-[#0c2b3d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span>Scan OCR</span>
        </button>

        <!-- Buat Soal Manual -->
        <RouterLink to="/question-bank/create" class="px-4 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#082231] text-white font-bold text-xs shadow-md transition flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span>Buat Soal Baru</span>
        </RouterLink>
      </div>
    </div>

    <!-- Quick Stat Cards Row (Theme Petrol & Honey) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <!-- Card 1: Total Soal (Deep Petrol) -->
      <div class="card-stat-petrol group">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-300">Total Butir Soal</span>
            <div class="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-base shadow-inner">
              📚
            </div>
          </div>
          <div class="mt-3">
            <div class="text-3xl font-black text-white tracking-tight leading-none">{{ stats.total }}</div>
            <p class="text-[11px] text-slate-300 font-medium mt-1">Bank soal terdata</p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300/90 group-hover:text-white transition">
          <span>Koleksi evaluasi tersimpan</span>
          <span class="font-bold transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>

      <!-- Card 2: Dipublikasikan (Warm Honey Amber) -->
      <div class="card-stat-honey group">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-900/80">Siap Ujian & Game</span>
            <div class="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center text-slate-950 text-base shadow-inner">
              ⚡
            </div>
          </div>
          <div class="mt-3">
            <div class="text-3xl font-black text-slate-950 tracking-tight leading-none">{{ stats.published }}</div>
            <p class="text-[11px] text-slate-900/80 font-semibold mt-1">Status dipublikasikan</p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-xs text-slate-900/80 group-hover:text-slate-950 font-bold transition">
          <span>Siap CBT & Boss Battle</span>
          <span class="font-black transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>

      <!-- Card 3: Draft (Deep Petrol) -->
      <div class="card-stat-petrol group">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-300">Draft Butir Soal</span>
            <div class="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-base shadow-inner">
              ✏️
            </div>
          </div>
          <div class="mt-3">
            <div class="text-3xl font-black text-white tracking-tight leading-none">{{ stats.draft }}</div>
            <p class="text-[11px] text-slate-300 font-medium mt-1">Perlu review / kunci</p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300/90 group-hover:text-white transition">
          <span>Periksa soal draft</span>
          <span class="font-bold transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>

      <!-- Card 4: Mata Pelajaran (Dark Slate) -->
      <div class="card-stat-dark group">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-300">Mata Pelajaran</span>
            <div class="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-base shadow-inner">
              🎯
            </div>
          </div>
          <div class="mt-3">
            <div class="text-3xl font-black text-white tracking-tight leading-none">{{ stats.subjects }}</div>
            <p class="text-[11px] text-slate-300 font-medium mt-1">Informatika & KKA</p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300/90 group-hover:text-white transition">
          <span>Kurikulum Merdeka</span>
          <span class="font-bold transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </div>

    <!-- Kategori Tingkat Kelas (Fase D SMPN 6 Kendari) -->
    <div class="card p-3.5 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 border border-slate-200/80 shadow-xs">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shadow-xs">
            🏫
          </div>
          <div>
            <h3 class="text-xs font-bold text-surface-900 uppercase tracking-wider">Kategori Tingkat Kelas</h3>
            <p class="text-[11px] text-surface-500">Filter butir soal berdasarkan jenjang fase capaian pembelajaran</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            @click="setGradeFilter('')"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            :class="!filter.grade ? 'bg-primary-600 text-white shadow-primary-500/20' : 'bg-white hover:bg-surface-100 text-surface-700 border border-surface-200'"
          >
            <span>📚 Semua Tingkat</span>
            <span class="px-1.5 py-0.5 rounded-full text-[10px]" :class="!filter.grade ? 'bg-white/20 text-white' : 'bg-surface-100 text-surface-600'">
              {{ stats.total }}
            </span>
          </button>

          <button
            type="button"
            @click="setGradeFilter('7')"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            :class="filter.grade === '7' ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-white hover:bg-blue-50/60 text-blue-900 border border-blue-200'"
          >
            <span>📘 Kelas 7 (KKA)</span>
            <span class="px-1.5 py-0.5 rounded-full text-[10px]" :class="filter.grade === '7' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'">
              {{ stats.grade_7 || 0 }}
            </span>
          </button>

          <button
            type="button"
            @click="setGradeFilter('9')"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            :class="filter.grade === '9' ? 'bg-rose-600 text-white shadow-rose-500/20' : 'bg-white hover:bg-rose-50/60 text-rose-900 border border-rose-200'"
          >
            <span>📕 Kelas 9 (Informatika)</span>
            <span class="px-1.5 py-0.5 rounded-full text-[10px]" :class="filter.grade === '9' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'">
              {{ stats.grade_9 || 0 }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Kategori Judul Materi (Topik Pokok Kurikulum Merdeka) -->
    <div class="card p-3.5 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/40 border border-indigo-100/90 shadow-xs">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shadow-xs">
            📑
          </div>
          <div>
            <h3 class="text-xs font-bold text-surface-900 uppercase tracking-wider">Kategori Judul Materi</h3>
            <p class="text-[11px] text-surface-500">Filter butir soal berdasarkan judul materi pokok pembelajaran</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <button
            type="button"
            @click="setTopicFilter('')"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs flex-shrink-0"
            :class="!filter.topic ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-white hover:bg-surface-100 text-surface-700 border border-surface-200'"
          >
            <span>🏷️ Semua Materi</span>
            <span class="px-1.5 py-0.5 rounded-full text-[10px]" :class="!filter.topic ? 'bg-white/20 text-white' : 'bg-surface-100 text-surface-600'">
              {{ stats.total }}
            </span>
          </button>

          <button
            v-for="(count, tName) in stats.topics"
            :key="tName"
            type="button"
            @click="setTopicFilter(String(tName))"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs flex-shrink-0"
            :class="filter.topic === tName ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-white hover:bg-indigo-50/70 text-indigo-900 border border-indigo-200/80'"
          >
            <span>{{ getTopicIcon(String(tName)) }} {{ tName }}</span>
            <span class="px-1.5 py-0.5 rounded-full text-[10px]" :class="filter.topic === tName ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700 font-semibold'">
              {{ count }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Filter & Search -->
    <div class="card p-4">
      <div class="flex flex-col sm:flex-row flex-wrap gap-3">
        <div class="flex-1 min-w-[200px]">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              v-model="search"
              type="text"
              class="input pl-10"
              placeholder="Cari pokok soal atau materi..."
              @input="debouncedSearch"
            />
          </div>
        </div>

        <!-- Filter Tingkat Kelas -->
        <select v-model="filter.grade" class="input w-full sm:w-36 font-semibold" @change="onGradeSelectChange">
          <option value="">Semua Tingkat</option>
          <option value="7">📘 Kelas 7 (KKA)</option>
          <option value="9">📕 Kelas 9 (Informatika)</option>
        </select>

        <!-- Filter Rombel Khusus -->
        <select v-model="filter.classroom_id" class="input w-full sm:w-36" @change="loadQuestions">
          <option value="">Semua Rombel</option>
          <option v-for="c in filteredClassrooms" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>

        <!-- Filter Judul Materi -->
        <select v-model="filter.topic" class="input w-full sm:w-44 font-medium" @change="loadQuestions">
          <option value="">Semua Judul Materi</option>
          <option v-for="(count, tName) in stats.topics" :key="tName" :value="tName">
            {{ getTopicIcon(String(tName)) }} {{ tName }} ({{ count }})
          </option>
        </select>

        <!-- Filter Mapel -->
        <select v-model="filter.subject" class="input w-full sm:w-44" @change="loadQuestions">
          <option value="">Semua Mapel</option>
          <option v-for="s in subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>

        <!-- Filter Jenis Soal -->
        <select v-model="filter.type" class="input w-full sm:w-40" @change="loadQuestions">
          <option value="">Semua Jenis</option>
          <option v-for="t in questionTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>

        <!-- Filter Kesukaran -->
        <select v-model="filter.difficulty" class="input w-full sm:w-32" @change="loadQuestions">
          <option value="">Semua Level</option>
          <option value="easy">Mudah</option>
          <option value="medium">Sedang</option>
          <option value="hard">Sulit (HOTS)</option>
        </select>

        <!-- Filter Status -->
        <select v-model="filter.status" class="input w-full sm:w-36" @change="loadQuestions">
          <option value="">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="reviewed">Ditinjau</option>
          <option value="published">Dipublikasikan</option>
          <option value="archived">Diarsipkan</option>
        </select>
      </div>
    </div>

    <!-- Questions table -->
    <div class="card p-0 overflow-hidden">
      <!-- Loading -->
      <div v-if="loading" class="p-8">
        <div class="space-y-4">
          <div v-for="i in 5" :key="i" class="animate-pulse flex items-start gap-4">
            <div class="w-10 h-10 rounded-xl bg-surface-200 flex-shrink-0"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-surface-200 rounded w-3/4"></div>
              <div class="h-3 bg-surface-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="questions.length === 0" class="p-12">
        <div class="empty-state">
          <svg class="w-16 h-16 text-surface-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-surface-700 font-medium">Belum ada soal untuk kategori materi ini</p>
          <p class="text-surface-500 text-sm mt-1">Gunakan tombol Buat Soal atau Upload File untuk menambahkan butir soal materi ini.</p>
          <RouterLink to="/question-bank/create" class="btn-primary mt-4">Buat Soal</RouterLink>
        </div>
      </div>

      <!-- Question list -->
      <div v-else>
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th class="w-8">
                  <input type="checkbox" v-model="selectAll" class="rounded border-surface-300" />
                </th>
                <th>Soal & Materi</th>
                <th>Tingkat Kelas</th>
                <th>Jenis</th>
                <th>Mapel</th>
                <th>Level</th>
                <th>Status</th>
                <th>Poin</th>
                <th class="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-100">
              <tr
                v-for="question in questions"
                :key="question.id"
                class="hover:bg-surface-50"
              >
                <td>
                  <input type="checkbox" v-model="selectedIds" :value="question.id" class="rounded border-surface-300" />
                </td>
                <td class="max-w-md">
                  <div class="flex items-start gap-3">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      :class="getTypeColor(question.type)"
                    >
                      <span class="text-xs font-bold">{{ getTypeShort(question.type) }}</span>
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-medium text-surface-800 line-clamp-2">
                        {{ stripHtml(question.content) }}
                      </p>
                      <div class="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span v-if="question.topic || question.element" class="badge text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center gap-1">
                          <span>{{ getTopicIcon(question.topic || question.element) }}</span>
                          <span>{{ question.topic || question.element }}</span>
                        </span>
                        <span v-if="question.stimulus" class="text-[10px] text-surface-400 font-medium">
                          📄 Ada stimulus
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="flex flex-col items-start gap-0.5">
                    <span class="badge text-[11px] font-bold" :class="getGradeBadgeClass(question.grade || question.classroom_id)">
                      {{ getGradeIcon(question.grade || question.classroom_id) }} {{ getGradeLabel(question.grade || question.classroom_id) }}
                    </span>
                    <span v-if="question.classroom_name" class="text-[10px] text-surface-400 font-medium">
                      {{ question.classroom_name }}
                    </span>
                  </div>
                </td>
                <td>
                  <span class="text-xs text-surface-600">{{ getTypeLabel(question.type) }}</span>
                </td>
                <td>
                  <span class="text-xs text-surface-600">{{ question.subject_name }}</span>
                </td>
                <td>
                  <span class="badge" :class="getDifficultyBadge(question.difficulty)">
                    {{ getDifficultyLabel(question.difficulty) }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="getStatusBadge(question.status)">
                    {{ getStatusLabel(question.status) }}
                  </span>
                </td>
                <td>
                  <span class="text-sm font-medium text-surface-700">{{ question.points }}</span>
                </td>
                <td class="text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      @click="previewQuestion(question)"
                      class="btn-icon btn-ghost text-surface-400 hover:text-primary-600"
                      title="Pratinjau"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </button>
                    <RouterLink
                      :to="`/question-bank/${question.id}/edit`"
                      class="btn-icon btn-ghost text-surface-400 hover:text-primary-600"
                      title="Edit"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </RouterLink>
                    <button
                      @click="duplicateQuestion(question)"
                      class="btn-icon btn-ghost text-surface-400 hover:text-primary-600"
                      title="Duplikasi"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                      </svg>
                    </button>
                    <button
                      @click="deleteQuestion(question)"
                      class="btn-icon btn-ghost text-surface-400 hover:text-red-600"
                      title="Hapus"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-surface-100 flex items-center justify-between">
          <p class="text-sm text-surface-500">
            Menampilkan {{ questions.length }} dari {{ meta.total }} soal
          </p>
          <div class="flex gap-1">
            <button
              @click="meta.currentPage--; loadQuestions()"
              class="btn-secondary btn-sm"
              :disabled="meta.currentPage <= 1"
            >←</button>
            <span class="px-3 py-1.5 text-sm text-surface-700 bg-primary-50 rounded-lg font-medium">
              {{ meta.currentPage }}
            </span>
            <button
              @click="meta.currentPage++; loadQuestions()"
              class="btn-secondary btn-sm"
              :disabled="meta.currentPage >= meta.lastPage"
            >→</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <Teleport to="body">
      <div v-if="previewItem" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="previewItem = null"></div>
        <div class="relative bg-white rounded-3xl shadow-modal w-full max-w-2xl max-h-[85vh] overflow-y-auto">
          <div class="p-6 border-b border-surface-100 flex items-center justify-between sticky top-0 bg-white">
            <h2 class="text-lg font-bold text-surface-900">Pratinjau Soal</h2>
            <button @click="previewItem = null" class="btn-icon btn-ghost">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <!-- Metadata -->
            <div class="flex flex-wrap gap-2">
              <span class="badge" :class="getGradeBadgeClass(previewItem.grade || previewItem.classroom_id)">
                {{ getGradeIcon(previewItem.grade || previewItem.classroom_id) }} {{ getGradeLabel(previewItem.grade || previewItem.classroom_id) }}
              </span>
              <span v-if="previewItem.topic || previewItem.element" class="badge bg-indigo-50 text-indigo-700 border border-indigo-200">
                {{ getTopicIcon(previewItem.topic || previewItem.element) }} {{ previewItem.topic || previewItem.element }}
              </span>
              <span class="badge badge-primary">{{ getTypeLabel(previewItem.type) }}</span>
              <span class="badge" :class="getDifficultyBadge(previewItem.difficulty)">{{ getDifficultyLabel(previewItem.difficulty) }}</span>
              <span class="badge badge-secondary">{{ previewItem.subject_name }}</span>
              <span class="badge badge-secondary">{{ previewItem.points }} poin</span>
            </div>

            <!-- Stimulus -->
            <div v-if="previewItem.stimulus" class="p-4 rounded-xl bg-surface-50 border border-surface-200">
              <p class="text-xs font-semibold text-surface-500 mb-2">STIMULUS / WACANA</p>
              <p class="text-sm text-surface-700 whitespace-pre-wrap">{{ previewItem.stimulus }}</p>
            </div>

            <!-- Question content -->
            <div>
              <p class="text-xs font-semibold text-surface-500 mb-2">SOAL</p>
              <p class="text-surface-800 whitespace-pre-wrap">{{ previewItem.content }}</p>
            </div>

            <!-- Options for MC -->
            <div v-if="previewItem.options?.length" class="space-y-2">
              <p class="text-xs font-semibold text-surface-500">PILIHAN JAWABAN</p>
              <div
                v-for="opt in previewItem.options"
                :key="opt.label"
                class="flex items-start gap-3 p-3 rounded-xl border"
                :class="opt.is_correct ? 'border-green-300 bg-green-50' : 'border-surface-200'"
              >
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  :class="opt.is_correct ? 'bg-green-500 text-white' : 'bg-surface-200 text-surface-600'"
                >{{ opt.label }}</span>
                <p class="text-sm text-surface-700">{{ opt.content }}</p>
                <svg v-if="opt.is_correct" class="w-4 h-4 text-green-500 flex-shrink-0 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>

            <!-- Explanation -->
            <div v-if="previewItem.explanation" class="p-4 rounded-xl bg-primary-50 border border-primary-100">
              <p class="text-xs font-semibold text-primary-700 mb-2">💡 PEMBAHASAN</p>
              <p class="text-sm text-primary-800 whitespace-pre-wrap">{{ previewItem.explanation }}</p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL 1: SCAN SOAL DARI GAMBAR (OCR) -->
    <Teleport to="body">
      <div v-if="showOcrModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeOcrModal"></div>
        <div class="relative bg-white rounded-3xl shadow-modal w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
          <!-- Header -->
          <div class="p-5 px-6 border-b border-surface-100 flex items-center justify-between bg-surface-50/50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center text-xl">
                📷
              </div>
              <div>
                <h2 class="text-base font-bold text-surface-900 leading-tight">Input Soal dari Gambar (OCR)</h2>
                <p class="text-[11px] text-surface-500">Unggah foto/screenshot soal cetak atau buku, sistem akan mengenali teks secara otomatis.</p>
              </div>
            </div>
            <button @click="closeOcrModal" class="btn-icon btn-ghost text-surface-400 hover:text-surface-600">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-5 overflow-y-auto flex-1">
            <!-- Upload Area -->
            <div
              v-if="!ocrImagePreview"
              class="border-2 border-dashed border-surface-300 rounded-2xl p-8 text-center hover:border-primary-400 bg-surface-50/50 transition-colors"
              @dragover.prevent
              @drop.prevent="handleOcrDrop"
              @paste="handleOcrPaste"
            >
              <div class="text-4xl mb-3">📸</div>
              <p class="text-surface-800 font-bold text-sm">Tarik dan letakkan gambar soal di sini</p>
              <p class="text-surface-500 text-xs mt-1">atau tempel langsung dengan <kbd class="px-2 py-0.5 bg-surface-200 text-surface-700 rounded font-mono text-[10px]">Ctrl+V</kbd> / <kbd class="px-2 py-0.5 bg-surface-200 text-surface-700 rounded font-mono text-[10px]">Cmd+V</kbd></p>
              <label class="btn-primary mt-4 inline-flex items-center gap-2 cursor-pointer text-xs px-4 py-2">
                <span>Pilih File Gambar</span>
                <input type="file" accept="image/*" class="hidden" @change="handleOcrFileSelect" />
              </label>
              <p class="text-[11px] text-surface-400 mt-3">Mendukung format JPG, PNG, WEBP, BMP (Maksimal 10 MB)</p>
            </div>

            <!-- Image Preview & Status -->
            <div v-else class="space-y-4">
              <div class="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-surface-50 border border-surface-200">
                <div class="w-full sm:w-48 h-36 bg-surface-200 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 relative group">
                  <img :src="ocrImagePreview" alt="Preview Gambar Soal" class="w-full h-full object-cover" />
                  <button
                    @click="resetOcrImage"
                    class="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition text-xs font-semibold"
                  >
                    <span>Ganti Gambar</span>
                  </button>
                </div>
                <div class="flex-1 space-y-2 flex flex-col justify-center">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-surface-800">Status OCR:</span>
                    <span class="badge" :class="ocrProcessing ? 'badge-warning' : 'badge-success'">
                      {{ ocrProcessing ? 'Sedang Memproses...' : 'Teks Berhasil Dikenali' }}
                    </span>
                  </div>

                  <!-- Progress Bar -->
                  <div v-if="ocrProcessing" class="space-y-1.5">
                    <div class="w-full bg-surface-200 rounded-full h-2 overflow-hidden">
                      <div class="bg-primary-600 h-2 rounded-full transition-all duration-300" :style="{ width: `${ocrProgress}%` }"></div>
                    </div>
                    <p class="text-[11px] text-surface-500 font-mono">{{ ocrStatusText }} ({{ ocrProgress }}%)</p>
                  </div>
                  <div v-else class="text-xs text-surface-600 space-y-1">
                    <p class="text-emerald-700 font-medium">✓ Karakter berhasil diekstrak dan dipilah menjadi pokok soal dan opsi.</p>
                    <p class="text-[11px] text-surface-400">Silakan tinjau teks pertanyaan dan kunci jawaban di bawah sebelum disimpan.</p>
                  </div>
                </div>
              </div>

              <!-- Detected Form -->
              <div v-if="!ocrProcessing && ocrParsedResult" class="space-y-4 pt-2">
                <div>
                  <label class="label font-bold text-surface-800">Pertanyaan Soal</label>
                  <textarea
                    v-model="ocrParsedResult.content"
                    rows="3"
                    class="input text-xs"
                    placeholder="Teks pertanyaan..."
                  ></textarea>
                </div>

                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="label font-bold text-surface-800">Pilihan Jawaban (A-D) & Kunci Jawaban</label>
                    <span class="text-[10px] text-surface-400">Pilih radio untuk menentukan kunci jawaban yang benar</span>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div
                      v-for="(opt, idx) in ocrParsedResult.options"
                      :key="idx"
                      class="flex items-center gap-2 p-2.5 rounded-xl border transition"
                      :class="ocrParsedResult.correct_answer === ['A','B','C','D','E'][idx] ? 'border-emerald-300 bg-emerald-50/60' : 'border-surface-200 bg-white'"
                    >
                      <input
                        type="radio"
                        :name="'ocr-correct'"
                        :value="['A','B','C','D','E'][idx]"
                        v-model="ocrParsedResult.correct_answer"
                        class="text-emerald-600 cursor-pointer"
                      />
                      <span class="font-bold text-xs w-5 text-center">{{ ['A','B','C','D','E'][idx] }}.</span>
                      <input
                        v-model="opt.text"
                        type="text"
                        class="input text-xs py-1 px-2 flex-1 border-0 bg-transparent focus:ring-0"
                        placeholder="Teks opsi..."
                      />
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label class="label">Tingkat Kelas</label>
                    <select v-model="ocrParsedResult.grade" class="input text-xs font-semibold" @change="onOcrGradeChange">
                      <option value="7">📘 Kelas 7 (KKA)</option>
                      <option value="9">📕 Kelas 9 (Informatika)</option>
                    </select>
                  </div>
                  <div>
                    <label class="label">Mata Pelajaran</label>
                    <select v-model="ocrParsedResult.subject_name" class="input text-xs font-semibold">
                      <option v-for="s in ocrAvailableSubjects" :key="s" :value="s">{{ s }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="label">Judul Materi / Topik</label>
                    <input
                      v-model="ocrParsedResult.topic"
                      type="text"
                      class="input text-xs font-medium"
                      placeholder="Contoh: Berpikir Komputasional"
                    />
                  </div>
                  <div>
                    <label class="label">Tingkat Kesukaran</label>
                    <select v-model="ocrParsedResult.difficulty" class="input text-xs">
                      <option value="easy">Mudah</option>
                      <option value="medium">Sedang</option>
                      <option value="hard">Sukar (HOTS)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="label">Pembahasan (Opsional)</label>
                  <textarea
                    v-model="ocrParsedResult.explanation"
                    rows="2"
                    class="input text-xs"
                    placeholder="Pembahasan atau materi terkait..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-4 px-6 border-t border-surface-100 flex items-center justify-between bg-white sticky bottom-0">
            <button @click="closeOcrModal" class="btn-secondary text-xs">
              Batal
            </button>
            <div class="flex items-center gap-2">
              <button
                v-if="ocrImagePreview && !ocrProcessing"
                @click="resetOcrImage"
                class="btn-secondary text-xs"
              >
                Scan Gambar Lain
              </button>
              <button
                @click="saveOcrQuestion"
                :disabled="ocrProcessing || !ocrParsedResult || !ocrParsedResult.content.trim() || savingOcr"
                class="btn-primary text-xs font-bold px-5 flex items-center gap-1.5 shadow-sm"
              >
                <span v-if="savingOcr" class="spinner w-3.5 h-3.5"></span>
                <span>{{ savingOcr ? 'Menyimpan...' : 'Simpan ke Bank Soal' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL 2: UPLOAD FILE EXCEL / WORD -->
    <Teleport to="body">
      <div v-if="showUploadModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeUploadModal"></div>
        <div class="relative bg-white rounded-3xl shadow-modal w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
          <!-- Header -->
          <div class="p-5 px-6 border-b border-surface-100 flex items-center justify-between bg-surface-50/50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl">
                📥
              </div>
              <div>
                <h2 class="text-base font-bold text-surface-900 leading-tight">Upload File Soal (Excel / Word)</h2>
                <p class="text-[11px] text-surface-500">Unggah berkas soal berformat Excel (.xlsx, .csv) atau dokumen Word (.docx, .doc).</p>
              </div>
            </div>
            <button @click="closeUploadModal" class="btn-icon btn-ghost text-surface-400 hover:text-surface-600">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-5 overflow-y-auto flex-1">
            <!-- Format download prompt -->
            <div class="p-4 rounded-2xl bg-primary-50/60 border border-primary-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p class="text-xs font-bold text-primary-900 flex items-center gap-1.5">
                  <span>💡</span> Belum memiliki format file yang sesuai?
                </p>
                <p class="text-[11px] text-primary-700 mt-0.5">
                  Unduh template standar kami agar sistem dapat mengenali nomor soal, opsi A-D, dan kunci jawaban dengan akurat.
                </p>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  @click="downloadTemplateExcel"
                  class="btn-secondary text-[11px] py-1.5 px-3 font-bold bg-white text-emerald-700 hover:bg-emerald-50 border-emerald-200 flex items-center gap-1"
                >
                  <span>📊</span> Template Excel
                </button>
                <button
                  type="button"
                  @click="downloadTemplateWord"
                  class="btn-secondary text-[11px] py-1.5 px-3 font-bold bg-white text-blue-700 hover:bg-blue-50 border-blue-200 flex items-center gap-1"
                >
                  <span>📄</span> Template Word
                </button>
              </div>
            </div>

            <!-- Upload Area -->
            <div
              v-if="!uploadedFileName"
              class="border-2 border-dashed border-surface-300 rounded-2xl p-8 text-center hover:border-emerald-400 bg-surface-50/50 transition-colors"
              @dragover.prevent
              @drop.prevent="handleUploadDrop"
            >
              <div class="text-4xl mb-3">📂</div>
              <p class="text-surface-800 font-bold text-sm">Tarik dan letakkan file Excel atau Word di sini</p>
              <p class="text-surface-500 text-xs mt-1">Mendukung berkas <strong>.xlsx, .xls, .docx, .doc, .csv</strong></p>
              <label class="btn bg-emerald-600 hover:bg-emerald-700 text-white mt-4 inline-flex items-center gap-2 cursor-pointer text-xs px-4 py-2 font-bold shadow-sm">
                <span>Pilih Berkas Soal</span>
                <input type="file" accept=".xlsx,.xls,.docx,.doc,.csv,.txt" class="hidden" @change="handleUploadFileSelect" />
              </label>
              <p class="text-[11px] text-surface-400 mt-3">Maksimal ukuran berkas 15 MB</p>
            </div>

            <!-- Uploaded file info & Parsed Preview -->
            <div v-else class="space-y-4">
              <div class="flex items-center justify-between p-3.5 px-4 rounded-2xl bg-surface-50 border border-surface-200">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    {{ uploadedFileName.endsWith('.docx') || uploadedFileName.endsWith('.doc') ? 'DOC' : 'XLS' }}
                  </div>
                  <div>
                    <p class="text-xs font-bold text-surface-900 truncate max-w-sm">{{ uploadedFileName }}</p>
                    <p class="text-[11px] text-emerald-600 font-medium">✓ Berhasil dibaca: {{ parsedQuestionsList.length }} butir soal terdeteksi</p>
                  </div>
                </div>
                <button
                  @click="resetUploadedFile"
                  class="btn-secondary text-xs px-2.5 py-1 text-surface-600 hover:text-surface-900"
                >
                  Ganti File
                </button>
              </div>

              <!-- Pilih Tingkat Kelas, Judul Materi, & Rombel Target untuk Soal yang Diimpor -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-surface-50 rounded-xl border border-surface-200">
                <div>
                  <label class="label font-bold text-surface-700">Tingkat Kelas Target</label>
                  <select v-model="batchUploadGrade" class="input text-xs font-semibold">
                    <option value="7">📘 Kelas 7 (KKA)</option>
                    <option value="9">📕 Kelas 9 (Informatika)</option>
                  </select>
                </div>
                <div>
                  <label class="label font-bold text-surface-700">Judul Materi Pokok</label>
                  <input
                    v-model="batchUploadTopic"
                    type="text"
                    class="input text-xs font-medium"
                    placeholder="Contoh: Berpikir Komputasional"
                  />
                </div>
                <div>
                  <label class="label font-bold text-surface-700">Rombel Khusus (Opsional)</label>
                  <select v-model="batchUploadClassroom" class="input text-xs">
                    <option value="">Semua Rombel di Tingkat Ini</option>
                    <option v-for="c in classrooms.filter(cl => String(cl.grade_level) === batchUploadGrade)" :key="c.id" :value="c.id">
                      {{ c.name }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- List of parsed questions preview -->
              <div v-if="parsedQuestionsList.length > 0" class="space-y-3">
                <p class="text-xs font-bold text-surface-700">Daftar Soal yang Akan Diimport:</p>
                <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
                  <div
                    v-for="(q, idx) in parsedQuestionsList"
                    :key="idx"
                    class="p-3.5 rounded-xl border border-surface-200 bg-white hover:border-surface-300 transition text-xs space-y-2"
                  >
                    <div class="flex items-start justify-between gap-2">
                      <p class="font-bold text-surface-800 leading-snug">
                        {{ idx + 1 }}. {{ q.content }}
                      </p>
                      <span class="badge badge-success flex-shrink-0 text-[10px]">
                        Kunci: {{ q.correct_answer }}
                      </span>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-[11px] text-surface-600 pl-4 border-l-2 border-surface-200">
                      <div v-for="(opt, optIdx) in q.options" :key="optIdx" :class="['A','B','C','D'][optIdx] === q.correct_answer ? 'font-bold text-emerald-700' : ''">
                        {{ ['A','B','C','D'][optIdx] }}. {{ opt.text }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="p-6 text-center text-surface-400 bg-surface-50 rounded-2xl">
                <p class="text-sm font-bold text-surface-700">Tidak ada soal yang dapat dibaca</p>
                <p class="text-xs text-surface-400 mt-1">Pastikan penomoran soal dan opsi A-D mengikuti template yang disediakan.</p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-4 px-6 border-t border-surface-100 flex items-center justify-between bg-white sticky bottom-0">
            <button @click="closeUploadModal" class="btn-secondary text-xs">
              Batal
            </button>
            <button
              @click="saveUploadedQuestions"
              :disabled="parsedQuestionsList.length === 0 || savingBatch"
              class="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 flex items-center gap-1.5 shadow-sm"
            >
              <span v-if="savingBatch" class="spinner w-3.5 h-3.5"></span>
              <span>{{ savingBatch ? 'Mengimpor...' : `Simpan ${parsedQuestionsList.length} Soal ke Bank Soal` }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Floating Bar saat ada soal terpilih -->
    <Teleport to="body">
      <div
        v-if="selectedIds.length > 0"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-surface-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3.5 border border-white/10"
      >
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-primary-500 text-white font-bold flex items-center justify-center text-xs">
            {{ selectedIds.length }}
          </span>
          <span class="text-xs font-semibold text-surface-200">Soal Terpilih</span>
        </div>
        <div class="h-4 w-px bg-white/20"></div>
        <button
          @click="createExamFromSelected"
          class="btn bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold py-1.5 px-3.5 rounded-xl flex items-center gap-1.5 transition shadow-sm"
        >
          <span>🚀 Buat Ujian CBT dari Soal Terpilih ({{ selectedIds.length }})</span>
        </button>
        <button
          @click="selectedIds = []"
          class="text-xs text-white/60 hover:text-white px-1.5 py-1"
        >
          ✕ Batal
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const authStore = useAuthStore()
const schoolName = computed(() => authStore.currentSchool?.name || 'Satuan Pendidikan')
import {
  extractTextFromImage,
  extractTextFromDocx,
  parseQuestionsFromRawText,
  parseQuestionsFromCsv,
  parseQuestionsFromXlsx,
  downloadQuestionTemplateWord,
  downloadQuestionTemplateXlsx,
  type ParsedQuestion
} from '@/utils/questionParser'

interface Question {
  id: string
  content: string
  stimulus?: string
  type: string
  difficulty: 'easy' | 'medium' | 'hard'
  status: 'draft' | 'reviewed' | 'published' | 'archived'
  points: number
  subject_name: string
  subject_id: string
  grade?: string
  grade_level?: number
  classroom_id?: string
  classroom_name?: string
  topic?: string
  element?: string
  explanation?: string
  options?: Array<{ label: string; content: string; is_correct: boolean }>
}

const router = useRouter()
const loading = ref(false)
const questions = ref<Question[]>([])
const subjects = ref<any[]>([])
const selectedIds = ref<string[]>([])
const previewItem = ref<Question | null>(null)
const search = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

function createExamFromSelected() {
  if (selectedIds.value.length === 0) return
  sessionStorage.setItem('cbt_preselected_questions', JSON.stringify(selectedIds.value))
  router.push('/cbt/create?from_bank=true')
}

// Dropdown & Modal States
const showDownloadMenu = ref(false)
const showOcrModal = ref(false)
const showUploadModal = ref(false)

// Download Template Handlers
function downloadTemplateExcel() {
  showDownloadMenu.value = false
  downloadQuestionTemplateXlsx()
}

function downloadTemplateWord() {
  showDownloadMenu.value = false
  downloadQuestionTemplateWord()
}

// OCR States & Handlers
const ocrImagePreview = ref<string | null>(null)
const ocrProcessing = ref(false)
const ocrProgress = ref(0)
const ocrStatusText = ref('')
const ocrParsedResult = ref<ParsedQuestion | null>(null)
const savingOcr = ref(false)

const ocrAvailableSubjects = computed(() => {
  return (ocrParsedResult.value as any)?.grade === '7' ? ['KKA'] : ['Informatika']
})

function onOcrGradeChange() {
  if (ocrParsedResult.value) {
    ocrParsedResult.value.subject_name = (ocrParsedResult.value as any)?.grade === '7' ? 'KKA' : 'Informatika'
  }
}

function closeOcrModal() {
  showOcrModal.value = false
  resetOcrImage()
}

function resetOcrImage() {
  ocrImagePreview.value = null
  ocrProcessing.value = false
  ocrProgress.value = 0
  ocrStatusText.value = ''
  ocrParsedResult.value = null
}

function handleOcrFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) processOcrFile(file)
}

function handleOcrDrop(e: DragEvent) {
  const file = e.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) processOcrFile(file)
}

function handleOcrPaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (items) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile()
        if (file) {
          processOcrFile(file)
          break
        }
      }
    }
  }
}

async function processOcrFile(file: File) {
  ocrImagePreview.value = URL.createObjectURL(file)
  ocrProcessing.value = true
  ocrProgress.value = 10
  ocrStatusText.value = 'Mempersiapkan gambar...'
  ocrParsedResult.value = null

  try {
    const rawText = await extractTextFromImage(file, (progress, status) => {
      ocrProgress.value = Math.round(progress * 100)
      ocrStatusText.value = status
    })

    const parsed = parseQuestionsFromRawText(rawText)
    if (parsed.length > 0) {
      const g = parsed[0].grade || '7'
      ocrParsedResult.value = {
        ...parsed[0],
        grade: g,
        subject_name: g === '7' ? 'KKA' : 'Informatika',
        topic: parsed[0].topic || (g === '7' ? 'Logika Pemrograman Dasar' : 'Berpikir Komputasional')
      }
    } else {
      ocrParsedResult.value = {
        content: rawText || 'Pertanyaan butir soal',
        options: [
          { text: 'Pilihan A' },
          { text: 'Pilihan B' },
          { text: 'Pilihan C' },
          { text: 'Pilihan D' }
        ],
        correct_answer: 'A',
        subject_name: 'KKA',
        grade: '7',
        topic: 'Logika Pemrograman Dasar',
        difficulty: 'medium',
        explanation: ''
      }
    }
  } catch (err: any) {
    alert('Gagal mendeteksi teks: ' + err.message)
    resetOcrImage()
  } finally {
    ocrProcessing.value = false
  }
}

async function saveOcrQuestion() {
  if (!ocrParsedResult.value || !ocrParsedResult.value.content.trim()) return
  savingOcr.value = true
  const qGrade = (ocrParsedResult.value as any)?.grade || '7'
  try {
    await api.post('/questions', {
      content: ocrParsedResult.value.content,
      grade: qGrade,
      subject_id: qGrade === '7' ? 'sub-kka' : 'sub-inf',
      subject_name: qGrade === '7' ? 'KKA' : 'Informatika',
      topic: ocrParsedResult.value.topic || (qGrade === '7' ? 'Logika Pemrograman Dasar' : 'Berpikir Komputasional'),
      element: ocrParsedResult.value.topic || (qGrade === '7' ? 'Logika Pemrograman Dasar' : 'Berpikir Komputasional'),
      options: (ocrParsedResult.value.options || []).map((o, idx) => ({
        label: ['A', 'B', 'C', 'D', 'E'][idx],
        content: o.text,
        is_correct: ['A', 'B', 'C', 'D', 'E'][idx] === ocrParsedResult.value?.correct_answer
      })),
      correct_answer: ocrParsedResult.value.correct_answer,
      difficulty: ocrParsedResult.value.difficulty || 'medium',
      explanation: ocrParsedResult.value.explanation || '',
      type: 'multiple_choice'
    })
    closeOcrModal()
    await loadQuestions()
    alert('✅ Butir soal hasil scan berhasil disimpan ke Bank Soal!')
  } catch (err: any) {
    console.error('Save OCR question failed:', err)
    alert('Gagal menyimpan soal: ' + (err.response?.data?.message || err.message))
  } finally {
    savingOcr.value = false
  }
}

// Upload File (Excel / Word) state & handlers
const uploadedFileName = ref('')
const parsedQuestionsList = ref<ParsedQuestion[]>([])
const batchUploadGrade = ref('7')
const batchUploadTopic = ref('Berpikir Komputasional')
const batchUploadClassroom = ref('')
const savingBatch = ref(false)

function closeUploadModal() {
  showUploadModal.value = false
  resetUploadedFile()
}

function resetUploadedFile() {
  uploadedFileName.value = ''
  parsedQuestionsList.value = []
  batchUploadGrade.value = '7'
  batchUploadTopic.value = 'Berpikir Komputasional'
  batchUploadClassroom.value = ''
  savingBatch.value = false
}

function handleUploadFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) processUploadFile(file)
}

function handleUploadDrop(e: DragEvent) {
  const file = e.dataTransfer?.files[0]
  if (file) processUploadFile(file)
}

async function processUploadFile(file: File) {
  uploadedFileName.value = file.name
  parsedQuestionsList.value = []

  try {
    if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      const text = await extractTextFromDocx(file)
      parsedQuestionsList.value = parseQuestionsFromRawText(text)
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      parsedQuestionsList.value = await parseQuestionsFromXlsx(file)
    } else {
      const text = await file.text()
      parsedQuestionsList.value = parseQuestionsFromCsv(text)
    }
  } catch (err: any) {
    console.error('File parse error:', err)
    alert('Gagal membaca berkas: ' + err.message)
    resetUploadedFile()
  }
}

async function saveUploadedQuestions() {
  if (parsedQuestionsList.value.length === 0) return
  savingBatch.value = true
  try {
    await api.post('/questions/batch', {
      questions: parsedQuestionsList.value.map(q => ({
        content: q.content,
        grade: batchUploadGrade.value,
        subject_id: batchUploadGrade.value === '7' ? 'sub-kka' : 'sub-inf',
        subject_name: batchUploadGrade.value === '7' ? 'KKA' : 'Informatika',
        topic: batchUploadTopic.value || q.topic || (batchUploadGrade.value === '7' ? 'Logika Pemrograman Dasar' : 'Berpikir Komputasional'),
        element: batchUploadTopic.value || q.topic || (batchUploadGrade.value === '7' ? 'Logika Pemrograman Dasar' : 'Berpikir Komputasional'),
        classroom_id: batchUploadClassroom.value || undefined,
        options: (q.options || []).map((o, idx) => ({
          label: ['A', 'B', 'C', 'D', 'E'][idx],
          content: o.text,
          is_correct: ['A', 'B', 'C', 'D', 'E'][idx] === q.correct_answer
        })),
        correct_answer: q.correct_answer,
        difficulty: q.difficulty || 'medium',
        explanation: q.explanation || '',
        type: 'multiple_choice'
      }))
    })
    const count = parsedQuestionsList.value.length
    closeUploadModal()
    await loadQuestions()
    alert(`✅ Berhasil mengimpor ${count} butir soal ke Bank Soal!`)
  } catch (err: any) {
    console.error('Batch save failed:', err)
    alert('Gagal mengimpor soal: ' + (err.response?.data?.message || err.message))
  } finally {
    savingBatch.value = false
  }
}

const stats = ref<{
  total: number
  published: number
  draft: number
  subjects: number
  grade_7: number
  grade_8: number
  grade_9: number
  topics?: Record<string, number>
}>({
  total: 0,
  published: 0,
  draft: 0,
  subjects: 0,
  grade_7: 0,
  grade_8: 0,
  grade_9: 0,
  topics: {}
})
const meta = reactive({ currentPage: 1, lastPage: 1, total: 0 })

const classrooms = ref<any[]>([])

const filter = reactive({
  grade: '',
  classroom_id: '',
  topic: '',
  subject: '',
  type: '',
  difficulty: '',
  status: '',
})

const filteredClassrooms = computed(() => {
  if (!filter.grade) return classrooms.value
  return classrooms.value.filter(c => String(c.grade_level) === filter.grade)
})

function setGradeFilter(g: string) {
  filter.grade = g
  filter.classroom_id = ''
  meta.currentPage = 1
  loadQuestions()
}

function onGradeSelectChange() {
  filter.classroom_id = ''
  meta.currentPage = 1
  loadQuestions()
}

function setTopicFilter(t: string) {
  filter.topic = t
  meta.currentPage = 1
  loadQuestions()
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

function getGradeIcon(gradeOrCls?: string | number): string {
  const str = String(gradeOrCls || '')
  if (str.includes('7') || str === '7') return '📘'
  if (str.includes('8') || str === '8') return '📙'
  if (str.includes('9') || str === '9') return '📕'
  return '📚'
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

const selectAll = computed({
  get: () => selectedIds.value.length === questions.value.length && questions.value.length > 0,
  set: (val) => {
    selectedIds.value = val ? questions.value.map(q => q.id) : []
  }
})

const questionTypes = [
  { value: 'multiple_choice', label: 'Pilihan Ganda' },
  { value: 'true_false', label: 'Benar/Salah' },
  { value: 'short_answer', label: 'Jawaban Singkat' },
  { value: 'essay', label: 'Esai' },
  { value: 'fill_blank', label: 'Isian' },
  { value: 'matching', label: 'Menjodohkan' },
]

function getTypeLabel(type: string): string {
  return questionTypes.find(t => t.value === type)?.label ?? type
}

function getTypeShort(type: string): string {
  const map: Record<string, string> = {
    multiple_choice: 'PG',
    true_false: 'TF',
    short_answer: 'JS',
    essay: 'ES',
    fill_blank: 'IS',
    matching: 'JO',
  }
  return map[type] || 'Q'
}

function getTypeColor(type: string): string {
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

function getDifficultyLabel(d: string): string {
  return { easy: 'Mudah', medium: 'Sedang', hard: 'Sulit' }[d] || d
}

function getDifficultyBadge(d: string): string {
  return { easy: 'badge-success', medium: 'badge-warning', hard: 'badge-danger' }[d] || 'badge-secondary'
}

function getStatusLabel(s: string): string {
  return {
    draft: 'Draft',
    reviewed: 'Ditinjau',
    published: 'Dipublikasikan',
    archived: 'Diarsipkan',
  }[s] || s
}

function getStatusBadge(s: string): string {
  return {
    draft: 'badge-secondary',
    reviewed: 'badge-warning',
    published: 'badge-primary',
    archived: 'badge-secondary',
  }[s] || 'badge-secondary'
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '') || html
}

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => loadQuestions(), 400)
}

function previewQuestion(q: Question) {
  previewItem.value = q
}

async function duplicateQuestion(q: Question) {
  try {
    await api.post(`/questions/${q.id}/duplicate`)
    await loadQuestions()
  } catch (err) {
    console.error('Duplicate failed:', err)
  }
}

async function deleteQuestion(q: Question) {
  if (!confirm(`Hapus soal ini?\n"${stripHtml(q.content).substring(0, 80)}..."`)) return
  try {
    await api.delete(`/questions/${q.id}`)
    await loadQuestions()
  } catch (err) {
    console.error('Delete failed:', err)
  }
}

async function loadSubjects() {
  try {
    const res = await api.get('/subjects', { params: { per_page: 100 } })
    subjects.value = res.data.data || []
  } catch {
    subjects.value = [
      { id: 'sub-kka', name: 'KKA (Koding & Kecerdasan Artifisial)' },
      { id: 'sub-inf', name: 'Informatika' },
    ]
  }
}

async function loadClassrooms() {
  try {
    const res = await api.get('/classrooms')
    classrooms.value = res.data.data || []
  } catch {
    classrooms.value = [
      { id: 'cls-7a', name: 'VII A', grade_level: 7 },
      { id: 'cls-7b', name: 'VII B', grade_level: 7 },
      { id: 'cls-7c', name: 'VII C', grade_level: 7 },
      { id: 'cls-7d', name: 'VII D', grade_level: 7 },
      { id: 'cls-9a', name: 'IX A', grade_level: 9 },
      { id: 'cls-9b', name: 'IX B', grade_level: 9 },
      { id: 'cls-9c', name: 'IX C', grade_level: 9 },
      { id: 'cls-9d', name: 'IX D', grade_level: 9 },
    ]
  }
}

async function loadQuestions() {
  loading.value = true
  try {
    const res = await api.get('/questions', {
      params: {
        search: search.value || undefined,
        grade: filter.grade || undefined,
        topic: filter.topic || undefined,
        classroom_id: filter.classroom_id || undefined,
        subject_id: filter.subject || undefined,
        type: filter.type || undefined,
        difficulty: filter.difficulty || undefined,
        status: filter.status || undefined,
        page: meta.currentPage,
        per_page: 20,
      }
    })
    questions.value = res.data.data || []
    meta.total = res.data.meta?.total || 0
    meta.lastPage = res.data.meta?.last_page || 1
    stats.value = res.data.stats || stats.value
  } catch (err: any) {
    console.error('Failed to load questions:', err.response?.data?.message)
    questions.value = []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadSubjects(), loadClassrooms(), loadQuestions()])
})
</script>
