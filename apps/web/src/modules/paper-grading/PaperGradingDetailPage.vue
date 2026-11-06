<template>
  <div class="space-y-5">
    <!-- Header Sesi Detail -->
    <div class="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 p-5 rounded-2xl text-white shadow-xl">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <router-link to="/paper-grading" class="text-blue-200 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors">
              <span>←</span> Kembali ke Daftar Sesi
            </router-link>
            <span class="text-white/40">•</span>
            <span
              class="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wider"
              :class="session?.type === 'assignment' ? 'bg-amber-400/20 text-amber-200' : 'bg-purple-400/20 text-purple-200'"
            >
              {{ session?.type === 'assignment' ? 'Formatif (Tugas Kertas)' : 'Sumatif (Ulangan Kertas)' }}
            </span>
          </div>

          <h1 class="text-xl font-bold tracking-tight flex items-center gap-2">
            <span>📝</span> {{ session?.title || 'Memuat Sesi...' }}
          </h1>

          <div class="flex flex-wrap items-center gap-3 text-xs text-blue-100 mt-2">
            <span class="flex items-center gap-1">🏫 {{ session?.classroom_name }}</span>
            <span>•</span>
            <span class="flex items-center gap-1">📚 {{ session?.subject_name }}</span>
            <span>•</span>
            <span class="flex items-center gap-1">📋 {{ session?.rubric?.length || 0 }} Butir Soal</span>
          </div>
        </div>

        <!-- Tombol Aksi Header -->
        <div class="flex flex-wrap items-center gap-2.5">
          <button
            @click="showRubricModal = true"
            class="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 backdrop-blur-md transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>📋</span> Edit Rubrik & Kunci
          </button>

          <button
            @click="processAllQueue"
            :disabled="processingQueue || (stats?.queued_count || 0) === 0"
            class="px-3.5 py-2 bg-blue-500/80 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl border border-blue-400/30 backdrop-blur-md transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <span>⚡</span>
            <span v-if="processingQueue">Memproses...</span>
            <span v-else>Proses Antrean AI ({{ stats?.queued_count || 0 }})</span>
          </button>

          <button
            @click="openBulkApproveModal"
            :disabled="approvingBulk || (stats?.pending_count || 0) === 0"
            class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>✅</span>
            <span v-if="approvingBulk">Menyetujui...</span>
            <span v-else>Setujui Semua (Tinggi Saja)</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Peringatan Keseragaman Skor (Kewarasan Distribusi) -->
    <div v-if="uniformityWarning" class="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-xl flex items-start gap-3 shadow-sm animate-pulse">
      <div class="text-xl">⚠️</div>
      <div class="text-xs text-amber-900">
        <p class="font-bold text-amber-950">Peringatan Kewarasan Distribusi Skor:</p>
        <p class="mt-0.5">
          Skor AI sangat seragam (hampir semua siswa mendapat total nilai yang hampir identik dengan selisih &le; 2 poin).
          Ini merupakan indikasi bahwa deskripsi rubrik uraian terlalu umum atau contoh jawaban terlalu sempit. Pertimbangkan untuk memeriksa ulang rubrik atau meninjau lembar jawaban secara manual.
        </p>
      </div>
    </div>

    <!-- Layout 2 Kolom: Kiri Daftar Siswa, Kanan Layar Tinjau -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <!-- PANEL KIRI (5 Kolom): Daftar Siswa & Status -->
      <div class="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[750px] overflow-hidden">
        <!-- Header Panel Kiri -->
        <div class="p-4 border-b border-gray-100 space-y-3 bg-gray-50/70">
          <div class="flex items-center justify-between">
            <h2 class="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>👥</span> Daftar Siswa ({{ submissions.length }})
            </h2>
            <button
              @click="showBulkUploadModal = true"
              class="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors flex items-center gap-1"
            >
              <span>📤</span> Upload Massal
            </button>
          </div>

          <!-- Status Bar -->
          <div class="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div class="bg-white p-1.5 rounded-lg border border-gray-200">
              <span class="text-gray-400 block text-[10px]">Disetujui</span>
              <span class="font-bold text-green-700">{{ stats?.approved_count || 0 }}</span>
            </div>
            <div class="bg-white p-1.5 rounded-lg border border-gray-200">
              <span class="text-gray-400 block text-[10px]">Siap Tinjau</span>
              <span class="font-bold text-amber-700">{{ stats?.pending_count || 0 }}</span>
            </div>
            <div class="bg-white p-1.5 rounded-lg border border-gray-200">
              <span class="text-gray-400 block text-[10px]">Belum / Antre</span>
              <span class="font-bold text-blue-700">{{ (stats?.total_students || 0) - (stats?.approved_count || 0) - (stats?.pending_count || 0) }}</span>
            </div>
          </div>

          <!-- Search Input -->
          <input
            v-model="searchStudent"
            type="text"
            placeholder="Cari nama atau NIS siswa..."
            class="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- List Siswa Scrollable -->
        <div class="flex-1 overflow-y-auto divide-y divide-gray-100">
          <div
            v-for="sub in filteredSubmissions"
            :key="sub.student_id"
            @click="selectStudent(sub)"
            class="p-3.5 hover:bg-blue-50/60 cursor-pointer transition-all flex items-center justify-between gap-3 border-l-4"
            :class="selectedStudent?.student_id === sub.student_id ? 'bg-blue-50 border-blue-600' : 'border-transparent'"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-bold text-xs text-gray-900 truncate">{{ sub.student_name }}</span>
                <span v-if="sub.similarity_flag" class="px-1.5 py-0.5 bg-red-100 text-red-700 font-bold text-[9px] rounded-md border border-red-300 animate-pulse" title="Kemiripan esai tinggi antar siswa">
                  ⚠️ Mirip
                </span>
              </div>
              <div class="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                <span>NIS: {{ sub.student_nis }}</span>
                <span v-if="sub.files && sub.files.length > 0">• {{ sub.files.length }} berkas</span>
              </div>
            </div>

            <!-- Badge Status -->
            <div class="text-right flex flex-col items-end gap-1">
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                :class="getStatusBadgeClass(sub.status, sub.is_approved)"
              >
                {{ getStatusLabel(sub.status, sub.is_approved) }}
              </span>

              <span v-if="sub.is_approved" class="text-xs font-extrabold text-green-700">
                Nilai: {{ sub.final_total_score }}
              </span>
              <span v-else-if="sub.status === 'selesai' && sub.ai_result?.total_proposed_score !== null" class="text-[11px] font-bold text-amber-700">
                Usul: {{ sub.ai_result.total_proposed_score }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- PANEL KANAN (7 Kolom): Layar Tinjau Guru -->
      <div class="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[750px] overflow-hidden">
        <!-- Kondisi Belum Ada Siswa Dipilih -->
        <div v-if="!selectedStudent" class="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
          <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl mb-3">
            👈
          </div>
          <h3 class="text-sm font-bold text-gray-700">Pilih Siswa di Panel Kiri</h3>
          <p class="text-xs text-gray-400 max-w-xs mt-1">
            Klik salah satu nama siswa untuk mengunggah lembar jawaban atau meninjau usulan penilaian AI.
          </p>
        </div>

        <!-- Kondisi Siswa Belum Upload Lembar Jawaban -->
        <div v-else-if="selectedStudent.status === 'belum_upload' || (!selectedStudent.files || selectedStudent.files.length === 0)" class="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div class="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl mb-3">
            📸
          </div>
          <h3 class="text-sm font-bold text-gray-800">Unggah Lembar Jawaban: {{ selectedStudent.student_name }}</h3>
          <p class="text-xs text-gray-500 max-w-sm mt-1 mb-6">
            Unggah foto lembar jawaban tulisan tangan (JPG/PNG/WebP) atau 1 berkas PDF multi-halaman (&le; 10 MB).
          </p>

          <div
            @dragover.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false"
            @drop.prevent="handleFileDrop"
            class="w-full max-w-md p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all"
            :class="dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50/50'"
            @click="triggerFileInput"
          >
            <input
              ref="fileInputRef"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,application/pdf"
              class="hidden"
              @change="handleFileInput"
            />
            <span class="text-3xl mb-2">📁</span>
            <p class="text-xs font-bold text-gray-700">Klik atau Tarik Berkas ke Sini</p>
            <p class="text-[11px] text-gray-400 mt-1">Mendukung banyak foto sekaligus untuk 1 siswa yang sama</p>
          </div>

          <div v-if="uploadingFiles" class="mt-4 flex items-center gap-2 text-xs text-blue-600 font-bold">
            <div class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Mengunggah dan memasukkan ke antrean AI...</span>
          </div>
        </div>

        <!-- Kondisi Sedang Diproses / Antre -->
        <div v-else-if="selectedStudent.status === 'antre' || selectedStudent.status === 'diproses'" class="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div class="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h3 class="text-sm font-bold text-gray-800">Sedang Diperiksa oleh AI Gemini Vision...</h3>
          <p class="text-xs text-gray-500 max-w-xs mt-1">
            AI sedang membaca tulisan tangan pada lembar jawaban, mencocokkan rubrik, dan menyusun bukti kutipan.
          </p>
        </div>

        <!-- Kondisi Gagal Diproses -->
        <div v-else-if="selectedStudent.status === 'gagal_diproses'" class="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div class="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-3xl mb-3">
            ⚠️
          </div>
          <h3 class="text-sm font-bold text-red-800">Gagal Memproses Lembar Jawaban</h3>
          <p class="text-xs text-red-600 max-w-sm mt-1 mb-4">
            {{ selectedStudent.error_message || 'Terjadi kendala saat memproses lembar jawaban dengan AI Gemini Vision.' }}
          </p>
          <div class="flex items-center gap-3">
            <button
              @click="reprocessSingleStudent(selectedStudent)"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <span>🔄 Coba Proses Ulang</span>
            </button>
            <button
              @click="triggerFileInput"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
            >
              Unggah Ulang Foto
            </button>
          </div>
        </div>

        <!-- KONDISI UTAMA: Layar Tinjau Guru (Selesai / Sudah Disetujui) -->
        <div v-else class="flex-1 flex flex-col h-full overflow-hidden">
          <!-- Header Tinjau -->
          <div class="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-gray-900">{{ selectedStudent.student_name }}</h3>
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  :class="getStatusBadgeClass(selectedStudent.status, selectedStudent.is_approved)"
                >
                  {{ getStatusLabel(selectedStudent.status, selectedStudent.is_approved) }}
                </span>
                <span v-if="selectedStudent.similarity_flag" class="px-2 py-0.5 bg-red-100 text-red-800 font-bold text-[10px] rounded-md border border-red-300">
                  {{ selectedStudent.similarity_note || 'Kemiripan teks tinggi — periksa' }}
                </span>
              </div>
              <p class="text-[11px] text-gray-500 mt-0.5">
                Total Usulan AI: <span class="font-bold text-gray-800">{{ selectedStudent.ai_result?.total_proposed_score || 0 }}/100</span>
                <span v-if="selectedStudent.is_approved" class="text-green-700 font-bold ml-2">
                  • Nilai Akhir Disetujui: {{ selectedStudent.final_total_score }}
                </span>
              </p>
            </div>

            <!-- Tab Switcher -->
            <div class="flex items-center bg-gray-200/70 p-1 rounded-xl text-xs font-bold">
              <button
                @click="activeTab = 'ai'"
                class="px-3 py-1.5 rounded-lg transition-all"
                :class="activeTab === 'ai' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
              >
                📋 Penilaian AI & Guru
              </button>
              <button
                @click="activeTab = 'image'"
                class="px-3 py-1.5 rounded-lg transition-all"
                :class="activeTab === 'image' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
              >
                🖼️ Lembar Fisik ({{ selectedStudent.files?.length || 0 }})
              </button>
              <button
                @click="activeTab = 'audit'"
                class="px-3 py-1.5 rounded-lg transition-all"
                :class="activeTab === 'audit' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
              >
                🔍 Jejak Audit
              </button>
            </div>
          </div>

          <!-- TAB 1: Penilaian AI & Guru (Tabel Per Butir) -->
          <div v-if="activeTab === 'ai'" class="flex-1 overflow-y-auto p-4 space-y-4">
            <div
              v-for="item in selectedStudent.ai_result?.items || []"
              :key="item.item_id"
              class="p-4 rounded-xl border transition-all space-y-3"
              :class="item.confidence === 'tidak_terbaca' ? 'bg-red-50/50 border-red-300' : 'bg-gray-50/60 border-gray-200'"
            >
              <!-- Baris Judul Butir & Skor Guru -->
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {{ item.number }}
                  </span>
                  <span class="font-bold text-xs text-gray-800">{{ item.title }}</span>
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                    :class="getConfidenceBadgeClass(item.confidence)"
                  >
                    {{ item.confidence === 'tidak_terbaca' ? '⚠️ TIDAK TERBACA' : `Confidence: ${item.confidence}` }}
                  </span>
                </div>

                <!-- Input Skor Guru -->
                <div class="flex items-center gap-2">
                  <span class="text-xs font-semibold text-gray-500">Skor Guru:</span>
                  <input
                    v-model.number="item.score"
                    type="number"
                    step="0.5"
                    min="0"
                    :max="item.max_score"
                    class="w-16 px-2 py-1 text-xs font-bold text-center border rounded-lg focus:ring-2 focus:ring-blue-500"
                    :class="item.score === null ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-300 bg-white text-blue-700'"
                  />
                  <span class="text-xs text-gray-400">/ {{ item.max_score }}</span>
                </div>
              </div>

              <!-- Peringatan jika Tidak Terbaca -->
              <div v-if="item.confidence === 'tidak_terbaca'" class="p-2.5 bg-red-100 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
                <span>⚠️</span>
                <span><strong>Tulisan tidak terbaca:</strong> AI tidak menebak jawaban. Guru wajib melihat lembar jawaban fisik dan mengisi skor secara manual.</span>
              </div>

              <!-- Transkripsi Siswa -->
              <div class="bg-white p-3 rounded-lg border border-gray-200 text-xs">
                <span class="font-bold text-gray-700 block mb-1">Transkripsi Tulisan Siswa:</span>
                <p class="text-gray-800 italic font-serif leading-relaxed">
                  "{{ item.transcription || '(Tidak ada tulisan terdeteksi)' }}"
                </p>
              </div>

              <!-- Bukti Kutipan -->
              <div v-if="item.evidence && item.evidence !== '-'" class="text-xs text-gray-600 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                <span class="font-bold text-blue-900">Bukti yang Mendasari Nilai:</span>
                <p class="mt-0.5 text-gray-700">{{ item.evidence }}</p>
              </div>

              <!-- Mode Esai: Sub-tabel Kriteria -->
              <div v-if="item.criteria_scores && item.criteria_scores.length > 0" class="space-y-2 pt-2 border-t border-gray-200">
                <span class="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">Rincian Penilaian Per Kriteria Esai:</span>
                <div class="grid grid-cols-1 gap-2">
                  <div
                    v-for="crit in item.criteria_scores"
                    :key="crit.criterion_id"
                    class="bg-white p-2.5 rounded-lg border border-indigo-100 text-xs flex items-start justify-between gap-3"
                  >
                    <div class="flex-1">
                      <span class="font-bold text-gray-800">{{ crit.name }}:</span>
                      <p class="text-gray-600 text-[11px] mt-0.5">Bukti: {{ crit.evidence }}</p>
                      <p v-if="crit.feedback" class="text-indigo-600 text-[11px] mt-0.5">Umpan Balik: {{ crit.feedback }}</p>
                    </div>
                    <div class="text-right">
                      <span class="font-bold text-indigo-700">{{ crit.score ?? '-' }}</span>
                      <span class="text-gray-400"> / {{ crit.max_score }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Umpan Balik -->
              <div>
                <label class="block text-[11px] font-bold text-gray-700 mb-1">Umpan Balik Guru / AI:</label>
                <input
                  v-model="item.feedback"
                  type="text"
                  class="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  placeholder="Umpan balik yang akan dilihat siswa setelah disetujui..."
                />
              </div>
            </div>
          </div>

          <!-- TAB 2: Lembar Fisik (Viewer Berkas) -->
          <div v-else-if="activeTab === 'image'" class="flex-1 overflow-hidden flex flex-col bg-gray-900 p-4">
            <!-- Toolbar Zoom & Halaman -->
            <div class="flex items-center justify-between text-white text-xs mb-3 pb-2 border-b border-gray-800">
              <div class="flex items-center gap-2">
                <span>Halaman:</span>
                <select
                  v-model="activeFileIndex"
                  class="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs"
                >
                  <option v-for="(f, fi) in selectedStudent.files" :key="fi" :value="fi">
                    Halaman {{ fi + 1 }} ({{ f.original_name }})
                  </option>
                </select>
              </div>

              <div class="flex items-center gap-2">
                <button @click="zoomLevel = Math.max(0.5, zoomLevel - 0.2)" class="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded">🔍-</button>
                <span class="font-mono">{{ Math.round(zoomLevel * 100) }}%</span>
                <button @click="zoomLevel = Math.min(3, zoomLevel + 0.2)" class="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded">🔍+</button>
                <button @click="rotation = (rotation + 90) % 360" class="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded">🔄 Putar</button>
                <button @click="resetView" class="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded">Reset</button>
              </div>
            </div>

            <!-- Canvas Gambar -->
            <div class="flex-1 overflow-auto flex items-center justify-center p-4">
              <img
                :src="getFileUrl(selectedStudent, activeFileIndex)"
                alt="Lembar Jawaban Siswa"
                class="transition-transform duration-200 max-h-full object-contain rounded shadow-2xl"
                :style="{ transform: `scale(${zoomLevel}) rotate(${rotation}deg)` }"
              />
            </div>
          </div>

          <!-- TAB 3: Jejak Audit -->
          <div v-else-if="activeTab === 'audit'" class="flex-1 overflow-y-auto p-4 space-y-4">
            <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
              <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wider">Informasi Audit Persetujuan</h4>
              <div class="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span class="text-gray-400 block">Status:</span>
                  <span class="font-bold text-gray-800">{{ selectedStudent.is_approved ? 'Disetujui Guru' : 'Draf AI (Belum Masuk Rekap)' }}</span>
                </div>
                <div>
                  <span class="text-gray-400 block">Disetujui Oleh:</span>
                  <span class="font-bold text-gray-800">{{ selectedStudent.audit_trail?.approved_by || '-' }}</span>
                </div>
                <div>
                  <span class="text-gray-400 block">Waktu Proses AI:</span>
                  <span class="font-medium text-gray-700">{{ formatDate(selectedStudent.audit_trail?.ai_processed_at) }}</span>
                </div>
                <div>
                  <span class="text-gray-400 block">Waktu Persetujuan:</span>
                  <span class="font-medium text-gray-700">{{ formatDate(selectedStudent.audit_trail?.approved_at) }}</span>
                </div>
              </div>
            </div>

            <!-- Tabel Perbandingan Nilai Asli AI vs Final Guru -->
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table class="w-full text-xs text-left">
                <thead class="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                  <tr>
                    <th class="p-3">Butir Soal</th>
                    <th class="p-3 text-center">Skor Awal AI</th>
                    <th class="p-3 text-center">Skor Final Guru</th>
                    <th class="p-3 text-center">Perbedaan (Delta)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="item in selectedStudent.ai_result?.items || []" :key="item.item_id">
                    <td class="p-3 font-medium text-gray-800">{{ item.title }}</td>
                    <td class="p-3 text-center font-mono">
                      {{ selectedStudent.audit_trail?.ai_original_scores?.[item.item_id] ?? '-' }}
                    </td>
                    <td class="p-3 text-center font-bold font-mono text-blue-700">
                      {{ item.score ?? '-' }}
                    </td>
                    <td class="p-3 text-center font-mono">
                      <span
                        v-if="selectedStudent.audit_trail?.ai_original_scores?.[item.item_id] !== undefined && item.score !== null"
                        :class="getDeltaClass(Number(item.score) - Number(selectedStudent.audit_trail.ai_original_scores[item.item_id]))"
                      >
                        {{ formatDelta(Number(item.score) - Number(selectedStudent.audit_trail.ai_original_scores[item.item_id])) }}
                      </span>
                      <span v-else class="text-gray-400">-</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Footer Aksi Tinjau -->
          <div class="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <button
                @click="reprocessSingleStudent(selectedStudent)"
                class="px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>🔄</span> Proses Ulang AI
              </button>
              <button
                @click="saveScoresOnly"
                :disabled="savingScores"
                class="px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                <span v-if="savingScores">Menyimpan...</span>
                <span v-else>💾 Simpan Draf Skor</span>
              </button>
            </div>

            <button
              @click="approveCurrentStudent"
              :disabled="approving"
              class="px-5 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>✅</span>
              <span v-if="approving">Menerbitkan Nilai...</span>
              <span v-else-if="selectedStudent.is_approved">Perbarui Nilai Disetujui</span>
              <span v-else>Setujui & Terbitkan Nilai</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Upload Massal -->
    <div v-if="showBulkUploadModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up">
        <div class="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <h3 class="text-sm font-bold">Unggah Lembar Jawaban Massal</h3>
          <button @click="showBulkUploadModal = false" class="text-white/80 hover:text-white">✕</button>
        </div>

        <div class="p-6 space-y-4">
          <p class="text-xs text-gray-600">
            Pilih satu atau banyak berkas lembar jawaban siswa. Setelah berkas dipilih, Anda dapat menetapkan masing-masing berkas ke siswa yang bersangkutan.
          </p>

          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,application/pdf"
            @change="handleBulkFilesSelect"
            class="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />

          <!-- Preview Grid Berkas Terpilih -->
          <div v-if="bulkSelectedFiles.length > 0" class="max-h-60 overflow-y-auto space-y-2 border border-gray-200 rounded-xl p-3">
            <div
              v-for="(bf, bfi) in bulkSelectedFiles"
              :key="bfi"
              class="flex items-center justify-between gap-3 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-200"
            >
              <div class="flex-1 truncate">
                <span class="font-bold text-gray-800">{{ bf.file.name }}</span>
                <span class="text-gray-400 text-[11px] ml-2">({{ Math.round(bf.file.size / 1024) }} KB)</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[11px] text-gray-500">Tetapkan ke:</span>
                <select
                  v-model="bf.student_id"
                  class="px-2 py-1 text-xs border border-gray-300 rounded bg-white font-medium"
                >
                  <option value="" disabled>Pilih Siswa</option>
                  <option v-for="s in submissions" :key="s.student_id" :value="s.student_id">
                    {{ s.student_name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              @click="showBulkUploadModal = false"
              type="button"
              class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Batal
            </button>
            <button
              @click="uploadBulkFiles"
              :disabled="uploadingBulk || bulkSelectedFiles.length === 0"
              class="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <span v-if="uploadingBulk">Mengunggah...</span>
              <span v-else>Unggah & Masukkan ke Antrean AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Editor Rubrik -->
    <RubricEditorModal
      v-model="showRubricModal"
      :rubric="session?.rubric || []"
      @save="updateSessionRubric"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import RubricEditorModal from './components/RubricEditorModal.vue'

const route = useRoute()
const sessionId = route.params.id as string

const session = ref<any>(null)
const submissions = ref<any[]>([])
const stats = ref<any>(null)
const uniformityWarning = ref(false)

const searchStudent = ref('')
const selectedStudent = ref<any>(null)
const activeTab = ref<'ai' | 'image' | 'audit'>('ai')

const activeFileIndex = ref(0)
const zoomLevel = ref(1)
const rotation = ref(0)

const dragOver = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadingFiles = ref(false)
const savingScores = ref(false)
const approving = ref(false)
const processingQueue = ref(false)
const approvingBulk = ref(false)

const showRubricModal = ref(false)
const showBulkUploadModal = ref(false)
const bulkSelectedFiles = ref<{ file: File; student_id: string }[]>([])
const uploadingBulk = ref(false)

let pollInterval: any = null

const filteredSubmissions = computed(() => {
  if (!searchStudent.value) return submissions.value
  const q = searchStudent.value.toLowerCase()
  return submissions.value.filter(s =>
    s.student_name.toLowerCase().includes(q) ||
    s.student_nis.includes(q)
  )
})

function getAuthToken(): string {
  return localStorage.getItem('auth_token') || ''
}

function getFileUrl(student: any, fileIndex: number): string {
  if (!student?.id) return ''
  return `/api/v1/grading/sessions/${sessionId}/submissions/${student.id}/file/${fileIndex}`
}

function resetView() {
  zoomLevel.value = 1
  rotation.value = 0
}

async function fetchSessionDetail() {
  try {
    const res = await fetch(`/api/v1/grading/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })
    if (res.ok) {
      const data = await res.json()
      session.value = data.data.session
      submissions.value = data.data.submissions || []
      stats.value = data.data.stats
      uniformityWarning.value = data.data.uniformity_warning || false

      // Sinkronkan data selectedStudent jika ada yang diperbarui
      if (selectedStudent.value) {
        const found = submissions.value.find(s => s.student_id === selectedStudent.value.student_id)
        if (found) {
          selectedStudent.value = found
        }
      }
    }
  } catch (err) {
    console.error('Failed to fetch session detail:', err)
  }
}

function selectStudent(sub: any) {
  selectedStudent.value = sub
  activeFileIndex.value = 0
  resetView()
  activeTab.value = 'ai'
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileInput(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    uploadFilesForSelectedStudent(Array.from(target.files))
  }
}

function handleFileDrop(e: DragEvent) {
  dragOver.value = false
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    uploadFilesForSelectedStudent(Array.from(e.dataTransfer.files))
  }
}

async function uploadFilesForSelectedStudent(files: File[]) {
  if (!selectedStudent.value) return
  uploadingFiles.value = true

  try {
    const formData = new FormData()
    formData.append('student_id', selectedStudent.value.student_id)
    for (const f of files) {
      formData.append('files', f)
    }

    const res = await fetch(`/api/v1/grading/sessions/${sessionId}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      body: formData
    })

    if (res.ok) {
      await fetchSessionDetail()
    } else {
      const err = await res.json()
      alert(err.message || 'Gagal mengunggah berkas.')
    }
  } catch (err) {
    alert('Terjadi kesalahan jaringan saat mengunggah berkas.')
  } finally {
    uploadingFiles.value = false
  }
}

async function saveScoresOnly() {
  if (!selectedStudent.value || !selectedStudent.value.ai_result?.items) return
  savingScores.value = true

  try {
    const payload = {
      items: selectedStudent.value.ai_result.items.map((it: any) => ({
        item_id: it.item_id,
        score: it.score,
        feedback: it.feedback,
        criteria_scores: it.criteria_scores
      }))
    }

    const res = await fetch(`/api/v1/grading/sessions/${sessionId}/submissions/${selectedStudent.value.id}/scores`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(payload)
    })

    if (res.ok) {
      alert('Perubahan draf skor berhasil disimpan!')
      await fetchSessionDetail()
    } else {
      const err = await res.json()
      alert(err.message || 'Gagal menyimpan skor.')
    }
  } catch (err) {
    alert('Terjadi kesalahan jaringan.')
  } finally {
    savingScores.value = false
  }
}

async function approveCurrentStudent() {
  if (!selectedStudent.value) return

  // Validasi lokal: tidak boleh ada butir tidak_terbaca dengan skor null
  const unreadable = (selectedStudent.value.ai_result?.items || []).filter(
    (it: any) => it.confidence === 'tidak_terbaca' && (it.score === null || it.score === undefined)
  )
  if (unreadable.length > 0) {
    alert(`Terdapat ${unreadable.length} butir yang tidak terbaca. Harap periksa lembar fisik dan isi skor secara manual sebelum menyetujui.`)
    return
  }

  if (!confirm(`Setujui nilai siswa ${selectedStudent.value.student_name}? Nilai ini akan resmi diterbitkan ke Rekap Nilai Siswa.`)) return

  approving.value = true
  try {
    // Simpan editan skor terlebih dahulu
    await fetch(`/api/v1/grading/sessions/${sessionId}/submissions/${selectedStudent.value.id}/scores`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        items: selectedStudent.value.ai_result.items.map((it: any) => ({
          item_id: it.item_id,
          score: it.score,
          feedback: it.feedback,
          criteria_scores: it.criteria_scores
        }))
      })
    })

    // Kirim approval
    const res = await fetch(`/api/v1/grading/sessions/${sessionId}/submissions/${selectedStudent.value.id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })

    if (res.ok) {
      const data = await res.json()
      alert(data.message || 'Nilai siswa berhasil disetujui!')
      await fetchSessionDetail()
    } else {
      const err = await res.json()
      alert(err.message || 'Gagal menyetujui nilai.')
    }
  } catch (err) {
    alert('Terjadi kesalahan jaringan saat menyetujui nilai.')
  } finally {
    approving.value = false
  }
}

async function reprocessSingleStudent(sub: any) {
  if (!sub?.id) return
  if (!confirm(`Proses ulang lembar jawaban ${sub.student_name} menggunakan AI?`)) return

  try {
    const res = await fetch(`/api/v1/grading/sessions/${sessionId}/submissions/${sub.id}/process`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })
    if (res.ok) {
      await fetchSessionDetail()
    }
  } catch (err) {
    alert('Gagal memproses ulang.')
  }
}

async function processAllQueue() {
  processingQueue.value = true
  try {
    const res = await fetch(`/api/v1/grading/sessions/${sessionId}/process-all`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })
    if (res.ok) {
      await fetchSessionDetail()
    }
  } catch (err) {
    alert('Gagal memproses antrean.')
  } finally {
    processingQueue.value = false
  }
}

async function openBulkApproveModal() {
  if (!confirm('Setujui semua lembar jawaban siswa yang memiliki tingkat keyakinan TINGGI? Lembar dengan keyakinan sedang/rendah/tidak terbaca akan dilewati untuk Anda tinjau manual.')) return

  approvingBulk.value = true
  try {
    const res = await fetch(`/api/v1/grading/sessions/${sessionId}/approve-bulk`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })

    if (res.ok) {
      const result = await res.json()
      alert(result.message)
      await fetchSessionDetail()
    } else {
      const err = await res.json()
      alert(err.message || 'Gagal melakukan persetujuan massal.')
    }
  } catch (err) {
    alert('Terjadi kesalahan jaringan.')
  } finally {
    approvingBulk.value = false
  }
}

async function updateSessionRubric(newRubric: any[]) {
  try {
    const res = await fetch(`/api/v1/grading/sessions/${sessionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ rubric: newRubric })
    })

    if (res.ok) {
      alert('Rubrik berhasil diperbarui!')
      await fetchSessionDetail()
    } else {
      const err = await res.json()
      alert(err.message || 'Gagal memperbarui rubrik.')
    }
  } catch (err) {
    alert('Terjadi kesalahan.')
  }
}

function handleBulkFilesSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files) {
    bulkSelectedFiles.value = Array.from(target.files).map(file => ({
      file,
      student_id: ''
    }))
  }
}

async function uploadBulkFiles() {
  const unassigned = bulkSelectedFiles.value.filter(b => !b.student_id)
  if (unassigned.length > 0) {
    alert('Harap tentukan siswa untuk setiap berkas yang dipilih.')
    return
  }

  uploadingBulk.value = true
  try {
    for (const item of bulkSelectedFiles.value) {
      const formData = new FormData()
      formData.append('student_id', item.student_id)
      formData.append('files', item.file)

      await fetch(`/api/v1/grading/sessions/${sessionId}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        body: formData
      })
    }
    showBulkUploadModal.value = false
    bulkSelectedFiles.value = []
    await fetchSessionDetail()
    alert('Seluruh berkas berhasil diunggah ke antrean AI!')
  } catch (err) {
    alert('Sebagian berkas gagal diunggah.')
  } finally {
    uploadingBulk.value = false
  }
}

function getStatusBadgeClass(status: string, isApproved: boolean): string {
  if (isApproved) return 'bg-green-100 text-green-800'
  if (status === 'selesai') return 'bg-amber-100 text-amber-800'
  if (status === 'diproses' || status === 'antre') return 'bg-blue-100 text-blue-800 animate-pulse'
  if (status === 'gagal_diproses') return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-500'
}

function getStatusLabel(status: string, isApproved: boolean): string {
  if (isApproved) return '✅ Disetujui'
  if (status === 'selesai') return '⏳ Siap Tinjau'
  if (status === 'diproses') return '⚡ Sedang Diproses'
  if (status === 'antre') return '🕒 Antre'
  if (status === 'gagal_diproses') return '❌ Gagal'
  return '⚪ Belum Upload'
}

function getConfidenceBadgeClass(conf: string): string {
  if (conf === 'tinggi') return 'bg-green-100 text-green-800'
  if (conf === 'sedang') return 'bg-yellow-100 text-yellow-800'
  if (conf === 'rendah') return 'bg-red-100 text-red-800 border border-red-300'
  if (conf === 'tidak_terbaca') return 'bg-red-200 text-red-900 border-2 border-dashed border-red-500 animate-pulse font-extrabold'
  return 'bg-gray-100 text-gray-700'
}

function getDeltaClass(delta: number): string {
  if (delta > 0) return 'text-green-600 font-bold'
  if (delta < 0) return 'text-red-600 font-bold'
  return 'text-gray-400 font-medium'
}

function formatDelta(delta: number): string {
  if (delta > 0) return `+${delta}`
  if (delta < 0) return `${delta}`
  return '0 (Sama)'
}

function formatDate(iso: string): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  await fetchSessionDetail()
  // Polling status antrean setiap 3 detik bila ada yang sedang diproses / antre
  pollInterval = setInterval(() => {
    const hasQueue = submissions.value.some(s => s.status === 'antre' || s.status === 'diproses')
    if (hasQueue) {
      fetchSessionDetail()
    }
  }, 3000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})
</script>

<style scoped>
@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-scale-up {
  animation: scaleUp 0.2s ease-out;
}
</style>

