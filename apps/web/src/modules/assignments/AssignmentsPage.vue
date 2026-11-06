<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span>📝</span> Tugas & Proyek Siswa
        </h1>
        <p class="text-slate-600 text-sm mt-1 font-medium">
          Kelola penugasan terstruktur, batas waktu pengumpulan, rubrik penilaian kinerja, dan umpan balik belajar
        </p>
      </div>
      <div class="flex items-center gap-2">
        <RouterLink
          to="/reports/grades"
          class="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition flex items-center gap-1.5"
          title="Input nilai tugas praktikum atau PR yang dilakukan di luar aplikasi / offline / lampau"
        >
          <span>📝</span> <span>Input Tugas Luar Aplikasi</span>
        </RouterLink>
        <button
          @click="showCreateModal = true"
          class="px-4 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#082231] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
        >
          <span>➕</span> <span>Buat Tugas Baru</span>
        </button>
      </div>
    </div>

    <!-- Quick Stat Cards Row (Theme Petrol & Honey) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <!-- Card 1: Total Tugas Aktif (Deep Petrol) -->
      <div class="card-stat-petrol group">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-300">Tugas Aktif Berjalan</span>
            <div class="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-base shadow-inner">
              💻
            </div>
          </div>
          <div class="mt-3">
            <div class="text-3xl font-black text-white tracking-tight leading-none">{{ activeAssignmentsCount }}</div>
            <p class="text-[11px] text-slate-300 font-medium mt-1">Dari {{ assignments.length }} total penugasan</p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300/90 group-hover:text-white transition">
          <span>Tugas sedang dibuka</span>
          <span class="font-bold transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>

      <!-- Card 2: Pengumpulan Siswa (Warm Honey Amber) -->
      <div class="card-stat-honey group">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-900/80">Pengumpulan Siswa</span>
            <div class="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center text-slate-950 text-base shadow-inner">
              📥
            </div>
          </div>
          <div class="mt-3">
            <div class="text-3xl font-black text-slate-950 tracking-tight leading-none">{{ totalSubmissionsCount }}</div>
            <p class="text-[11px] text-slate-900/80 font-semibold mt-1">Berkas terunggah siswa</p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-xs text-slate-900/80 group-hover:text-slate-950 font-bold transition">
          <span>Tingkat respons kelas</span>
          <span class="font-black transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>

      <!-- Card 3: Telah Dinilai (Deep Petrol) -->
      <div class="card-stat-petrol group">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-300">Telah Dinilai & Diperiksa</span>
            <div class="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-base shadow-inner">
              ⭐
            </div>
          </div>
          <div class="mt-3">
            <div class="text-3xl font-black text-white tracking-tight leading-none">{{ totalGradedCount }}</div>
            <p class="text-[11px] text-slate-300 font-medium mt-1">Nilai & feedback tersimpan</p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300/90 group-hover:text-white transition">
          <span>Siap rekap ke rapor</span>
          <span class="font-bold transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>

      <!-- Card 4: Rombel Sasaran (Dark Slate) -->
      <div class="card-stat-dark group">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-300">Rombel Sasaran</span>
            <div class="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-base shadow-inner">
              🏫
            </div>
          </div>
          <div class="mt-3">
            <div class="text-3xl font-black text-white tracking-tight leading-none">{{ classrooms.length }} Kelas</div>
            <p class="text-[11px] text-slate-300 font-medium mt-1">{{ teacherSubject }} · {{ currentSchoolName }}</p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300/90 group-hover:text-white transition">
          <span>Distribusi penugasan</span>
          <span class="font-bold transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white rounded-[24px] shadow-card border border-slate-200/60 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <div>
          <select v-model="selectedClass" class="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition">
            <option value="all">Semua Rombel</option>
            <option v-for="cls in classrooms" :key="cls.id" :value="cls.name">{{ formatClassLabel(cls) }}</option>
          </select>
        </div>
        <div>
          <select v-model="selectedStatus" class="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition">
            <option value="all">Semua Status</option>
            <option value="active">Sedang Berlangsung</option>
            <option value="closed">Selesai / Ditutup</option>
          </select>
        </div>
      </div>

      <div class="w-full sm:w-64">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari judul tugas..."
          class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="card p-6 animate-pulse space-y-4">
        <div class="h-4 bg-surface-200 rounded w-1/3"></div>
        <div class="h-6 bg-surface-200 rounded w-3/4"></div>
        <div class="h-12 bg-surface-200 rounded"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredAssignments.length === 0" class="card p-12 text-center space-y-4">
      <div class="text-4xl">📝</div>
      <h2 class="text-lg font-bold text-surface-900">Belum Ada Tugas Siswa</h2>
      <p class="text-xs text-surface-500 max-w-md mx-auto">
        Belum ada penugasan atau proyek belajar yang dibuat. Mulai buat penugasan baru untuk rombongan belajar Anda.
      </p>
      <button
        @click="showCreateModal = true"
        class="btn btn-primary text-xs inline-flex items-center gap-2"
      >
        <span>➕ Buat Tugas Baru</span>
      </button>
    </div>

    <!-- Assignments Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="item in filteredAssignments"
        :key="item.id"
        class="bg-white rounded-[24px] shadow-card border border-slate-200/60 p-5 sm:p-6 hover:shadow-card-hover transition-all flex flex-col justify-between"
      >
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="badge badge-primary text-[10px]">{{ item.classroom }} &bull; {{ item.subject }}</span>
              <span v-if="item.tp_code" class="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[10px]" title="Tugas ini otomatis terpetakan ke TP ini">
                🎯 {{ item.tp_code }}
              </span>
            </div>
            <div class="flex items-center gap-1.5">
              <span
                :class="[
                  'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase',
                  item.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-surface-100 text-surface-600'
                ]"
              >
                {{ item.status === 'active' ? 'Aktif' : 'Ditutup' }}
              </span>
              <button
                @click="deleteAssignment(item)"
                class="btn-icon btn-ghost text-surface-400 hover:text-rose-600 p-1 rounded-lg"
                title="Hapus Tugas"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>

          <h2 class="font-bold text-surface-900 text-base leading-snug line-clamp-2">
            {{ item.title }}
          </h2>

          <p class="text-xs text-surface-500 line-clamp-2 leading-relaxed">
            {{ item.description || 'Tidak ada petunjuk khusus.' }}
          </p>

          <!-- Deadline info -->
          <div class="p-2.5 rounded-xl bg-surface-50 border border-surface-100 text-xs flex items-center justify-between">
            <span class="text-surface-500">Batas Pengumpulan:</span>
            <span class="font-bold text-rose-600">{{ item.deadline }}</span>
          </div>

          <!-- Submission Progress Bar -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-surface-500">Progres Pengumpulan:</span>
              <span class="font-bold text-surface-800">
                {{ item.submittedCount }} / {{ item.totalStudents }} Siswa ({{ item.totalStudents ? Math.round((item.submittedCount / item.totalStudents) * 100) : 0 }}%)
              </span>
            </div>
            <div class="h-2 w-full bg-surface-200 rounded-full overflow-hidden">
              <div
                class="h-full bg-emerald-500 rounded-full transition-all duration-300"
                :style="{ width: `${item.totalStudents ? (item.submittedCount / item.totalStudents) * 100 : 0}%` }"
              ></div>
            </div>
          </div>
        </div>

        <div class="pt-4 mt-4 border-t border-surface-100 flex items-center justify-between gap-2">
          <span class="text-[11px] text-surface-500">
            Telah Dinilai: <strong class="text-surface-800">{{ item.gradedCount }}/{{ item.submittedCount }}</strong>
          </span>
          <div class="flex items-center gap-1.5">
            <router-link
              :to="`/paper-grading?type=assignment&refId=${item.id}&classroomId=${item.classroom_id || ''}&title=${encodeURIComponent(item.title)}`"
              class="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1 shadow-xs"
              title="Periksa lembar jawaban fisik kertas tugas ini menggunakan AI"
            >
              <span>📝</span> Periksa Kertas
            </router-link>
            <button
              v-if="item.gradedCount > 0"
              @click="openImportModal(item)"
              class="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition flex items-center gap-1 shadow-xs"
              title="Masukkan nilai tugas ini ke Rekap Nilai Siswa"
            >
              <span>📥</span> Rekap Nilai
            </button>
            <router-link
              :to="`/assignments/${item.id}`"
              class="px-3.5 py-2 rounded-xl bg-[#0c2b3d] hover:bg-[#082231] text-white font-bold text-xs shadow-md transition"
            >
              Periksa →
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Buat Tugas Baru -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      @click.self="showCreateModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-surface-100">
          <h3 class="text-base font-bold text-surface-900">Buat Penugasan Baru</h3>
          <button @click="showCreateModal = false" class="text-surface-400 hover:text-surface-700">✕</button>
        </div>

        <form @submit.prevent="createAssignment" class="space-y-3 text-xs">
          <div>
            <label class="label">Judul Tugas / Proyek</label>
            <input v-model="newTask.title" type="text" class="input text-xs" placeholder="Misal: Laporan Praktik Merakit Diagram Komputer" required />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Rombel Kelas</label>
              <select v-model="newTask.classroom" @change="onNewTaskClassroomChange" class="input text-xs font-bold" required>
                <option v-for="cls in classrooms" :key="cls.id" :value="cls.name">{{ formatClassLabel(cls) }}</option>
              </select>
            </div>
            <div>
              <label class="label">Mata Pelajaran (Sesuai Jadwal)</label>
              <select v-model="newTask.subject" class="input text-xs" @change="loadChapters" required>
                <option v-for="s in availableTaskSubjects" :key="s.id" :value="s.name">{{ s.name }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="label flex items-center justify-between">
              <span>🎯 Pemetaan Tujuan Pembelajaran (TP)</span>
              <span class="text-[10px] text-indigo-600 font-bold">Otomatis Masuk Rekap Formatif (60%)</span>
            </label>
            <select v-model="newTask.tp_id" class="input text-xs font-semibold" required>
              <option value="">-- Pilih Tujuan Pembelajaran (TP) --</option>
              <optgroup v-for="chap in availableChapters" :key="chap.id" :label="chap.title">
                <option v-for="tp in chap.tps" :key="tp.id" :value="tp.id">
                  {{ tp.code }} — {{ tp.description }}
                </option>
              </optgroup>
            </select>
          </div>

          <div>
            <label class="label">Petunjuk & Instruksi Pengerjaan</label>
            <textarea v-model="newTask.description" rows="3" class="input text-xs" placeholder="Tuliskan petunjuk pengerjaan dan format berkas yang diterima (PDF/Foto)..." required></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Batas Waktu (Deadline)</label>
              <input v-model="newTask.deadline" type="datetime-local" class="input text-xs" required />
            </div>
            <div>
              <label class="label">Nilai Maksimal</label>
              <input v-model.number="newTask.maxScore" type="number" class="input text-xs" value="100" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-surface-100">
            <button
              type="button"
              @click="showCreateModal = false"
              class="btn btn-secondary text-xs px-4 py-2"
            >
              Batal
            </button>
            <button
              type="submit"
              class="btn btn-primary text-xs px-4 py-2 font-bold"
            >
              Terbitkan Tugas
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Masukkan ke Rekap Nilai Siswa -->
    <Teleport to="body">
      <div v-if="showImportModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
          <div class="p-5 bg-gradient-to-r from-purple-700 to-indigo-800 text-white flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xl">📥</span>
              <div>
                <h3 class="font-bold text-sm">Masukkan Nilai Tugas ke Rekap Nilai Siswa</h3>
                <p class="text-[11px] text-purple-200">
                  Tugas: {{ activeImportAssignment?.title }}
                </p>
              </div>
            </div>
            <button @click="showImportModal = false" class="text-white/80 hover:text-white font-bold">✕</button>
          </div>

          <div class="p-5 space-y-4 text-xs">
            <div class="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-purple-950">
              <p class="font-bold flex items-center gap-1.5">
                <span>ℹ️</span> Integrasi Nilai Kurikulum Merdeka
              </p>
              <p class="text-[11px] text-purple-800 mt-1 leading-relaxed">
                Nilai dari siswa yang telah dinilai pada penugasan ini akan dimasukkan ke komponen rapor yang dipilih. Siswa yang belum dinilai tidak akan diisi nilai palsu/dummy.
              </p>
            </div>

            <!-- Target Rombel & Mapel -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Target Kelas / Rombel</label>
                <select
                  v-model="importForm.classroom_id"
                  @change="onImportClassroomChange"
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
                  <option v-for="s in availableImportSubjects" :key="s.id" :value="s.id">
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
                <!-- Formatif Tugas 1 (Default) -->
                <label
                  class="p-2.5 rounded-xl border cursor-pointer transition flex items-start gap-2.5"
                  :class="importForm.component_key === 'tugas1' ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600' : 'border-slate-200 hover:bg-slate-50'"
                >
                  <input
                    type="radio"
                    v-model="importForm.component_key"
                    value="tugas1"
                    @change="setComponent('formatif', 'tugas1', 'Formatif — Tugas 1')"
                    class="mt-0.5 text-purple-600"
                  />
                  <div>
                    <span class="font-bold text-slate-900 block">Formatif — Tugas 1</span>
                    <span class="text-[10px] text-slate-500">Bobot 40% &bull; Penilaian Formatif Tugas</span>
                  </div>
                </label>

                <!-- Formatif Praktikum Lab -->
                <label
                  class="p-2.5 rounded-xl border cursor-pointer transition flex items-start gap-2.5"
                  :class="importForm.component_key === 'praktikum_lab' ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600' : 'border-slate-200 hover:bg-slate-50'"
                >
                  <input
                    type="radio"
                    v-model="importForm.component_key"
                    value="praktikum_lab"
                    @change="setComponent('formatif', 'praktikum_lab', 'Formatif — Praktikum Lab')"
                    class="mt-0.5 text-purple-600"
                  />
                  <div>
                    <span class="font-bold text-slate-900 block">Formatif — Praktikum Lab</span>
                    <span class="text-[10px] text-slate-500">Bobot 40% &bull; Penilaian Praktik Komputer</span>
                  </div>
                </label>

                <!-- Formatif Proyek Portofolio -->
                <label
                  class="p-2.5 rounded-xl border cursor-pointer transition flex items-start gap-2.5"
                  :class="importForm.component_key === 'proyek_portofolio' ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600' : 'border-slate-200 hover:bg-slate-50'"
                >
                  <input
                    type="radio"
                    v-model="importForm.component_key"
                    value="proyek_portofolio"
                    @change="setComponent('formatif', 'proyek_portofolio', 'Formatif — Proyek Portofolio')"
                    class="mt-0.5 text-purple-600"
                  />
                  <div>
                    <span class="font-bold text-slate-900 block">Formatif — Proyek Koding</span>
                    <span class="text-[10px] text-slate-500">Bobot 40% &bull; Karya / Proyek Siswa</span>
                  </div>
                </label>

                <!-- Sumatif TP 1 -->
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
                    <span class="font-bold text-slate-900 block">Sumatif TP 1</span>
                    <span class="text-[10px] text-slate-500">Bobot 40% &bull; Lingkup Materi 1</span>
                  </div>
                </label>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useClassrooms } from '@/composables/useClassrooms'

const authStore = useAuthStore()
const teacherSubject = computed(() => authStore.user?.subject || 'Mata Pelajaran')
const currentSchoolName = computed(() => authStore.currentSchool?.name || authStore.user?.school_name || 'Satuan Pendidikan')
const {
  classrooms,
  fetchClassrooms,
  formatClassLabel,
  getClassName,
  getSubjectIdForClass,
  getSubjectNameForClass,
  getAvailableSubjectsForClass
} = useClassrooms()

const loading = ref(false)
const selectedClass = ref('all')
const selectedStatus = ref('all')
const searchQuery = ref('')
const showCreateModal = ref(false)

// Import modal state
const showImportModal = ref(false)
const activeImportAssignment = ref<any>(null)
const isSubmittingImport = ref(false)
const importForm = ref({
  classroom_id: '',
  subject_id: '',
  component_type: 'formatif',
  component_key: 'tugas1',
  component_label: 'Formatif — Tugas 1'
})

const availableImportSubjects = computed(() => {
  return getAvailableSubjectsForClass(importForm.value.classroom_id)
})

function onImportClassroomChange() {
  importForm.value.subject_id = getSubjectIdForClass(importForm.value.classroom_id)
}

function openImportModal(item: any) {
  activeImportAssignment.value = item
  const cls = classrooms.value.find(c => c.name === item.classroom)
  importForm.value.classroom_id = cls?.id || (classrooms.value[0]?.id || '')
  importForm.value.subject_id = getSubjectIdForClass(importForm.value.classroom_id)
  showImportModal.value = true
}

function setComponent(type: string, key: string, label: string) {
  importForm.value.component_type = type
  importForm.value.component_key = key
  importForm.value.component_label = label
}

async function submitImport() {
  if (!activeImportAssignment.value) return
  isSubmittingImport.value = true
  try {
    const res = await api.post('/reports/grades/import-assignment', {
      assignment_id: activeImportAssignment.value.id,
      classroom_id: importForm.value.classroom_id,
      subject_id: importForm.value.subject_id,
      component_type: importForm.value.component_type,
      component_key: importForm.value.component_key,
      component_label: importForm.value.component_label
    })

    alert(res.data?.message || 'Nilai tugas berhasil dimasukkan ke Rekap Nilai Siswa!')
    showImportModal.value = false
    await loadAssignments()
  } catch (err: any) {
    console.error('Failed to import assignment grades:', err)
    alert(err.response?.data?.message || 'Gagal memasukkan nilai tugas ke Rekap Nilai Siswa.')
  } finally {
    isSubmittingImport.value = false
  }
}

const assignments = ref<any[]>([])

const activeAssignmentsCount = computed(() => assignments.value.filter(a => a.status === 'active').length)
const totalSubmissionsCount = computed(() => assignments.value.reduce((acc, a) => acc + (a.submittedCount || 0), 0))
const totalGradedCount = computed(() => assignments.value.reduce((acc, a) => acc + (a.gradedCount || 0), 0))

function normalizeClass(nameOrId: string) {
  return (nameOrId || '').replace(/[\s-]/g, '').toLowerCase()
}

const filteredAssignments = computed(() => {
  return assignments.value.filter(a => {
    const matchClass = selectedClass.value === 'all' ||
      normalizeClass(a.classroom) === normalizeClass(selectedClass.value) ||
      normalizeClass(a.classroom) === normalizeClass(getClassName(selectedClass.value))
    const matchStatus = selectedStatus.value === 'all' || a.status === selectedStatus.value
    const matchSearch = (a.title || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchClass && matchStatus && matchSearch
  })
})

const availableChapters = ref<any[]>([])

async function loadChapters() {
  try {
    const sId = newTask.value.subject.toLowerCase().includes('kka') ? 'sub-kka' : 'sub-inf'
    const res = await api.get('/chapters', { params: { subject_id: sId, grade_level: 7 } })
    availableChapters.value = res.data?.data || []
    if (availableChapters.value.length > 0 && !newTask.value.tp_id) {
      const firstTp = availableChapters.value[0]?.tps?.[0]
      if (firstTp) newTask.value.tp_id = firstTp.id
    }
  } catch (err) {
    console.error('Failed to load chapters for assignment:', err)
  }
}

const newTask = ref({
  title: '',
  classroom: '',
  subject: authStore.user?.subject || 'Mata Pelajaran',
  tp_id: '',
  description: '',
  deadline: '',
  maxScore: 100
})

const availableTaskSubjects = computed(() => {
  return getAvailableSubjectsForClass(newTask.value.classroom)
})

function onNewTaskClassroomChange() {
  newTask.value.subject = getSubjectNameForClass(newTask.value.classroom)
  loadChapters()
}

async function loadAssignments() {
  loading.value = true
  try {
    const res = await api.get('/assignments')
    const raw = res.data?.data || res.data || []
    assignments.value = Array.isArray(raw) ? raw : []
  } catch (err) {
    console.error('Failed to load assignments:', err)
    assignments.value = []
  } finally {
    loading.value = false
  }
}

async function loadClassrooms() {
  await fetchClassrooms(true)
  if (classrooms.value.length > 0 && !newTask.value.classroom) {
    newTask.value.classroom = classrooms.value[0].name
    newTask.value.subject = getSubjectNameForClass(newTask.value.classroom)
    await loadChapters()
  } else if (classrooms.value.length === 0) {
    newTask.value.classroom = ''
    newTask.value.subject = authStore.user?.subject || ''
  }
}

async function createAssignment() {
  try {
    const formattedDeadline = newTask.value.deadline ? newTask.value.deadline.replace('T', ' ') : 'Tidak ditentukan'
    const targetCls = classrooms.value.find(c => c.name === newTask.value.classroom)
    const payload = {
      title: newTask.value.title,
      classroom_id: targetCls?.id || '',
      classroom: newTask.value.classroom,
      subject: newTask.value.subject,
      tp_id: newTask.value.tp_id,
      description: newTask.value.description,
      deadline: formattedDeadline,
      maxScore: newTask.value.maxScore,
      status: 'active'
    }
    await api.post('/assignments', payload)
    showCreateModal.value = false
    newTask.value = {
      title: '',
      classroom: classrooms.value[0]?.name || '',
      subject: getSubjectNameForClass(classrooms.value[0]?.name || ''),
      tp_id: '',
      description: '',
      deadline: '',
      maxScore: 100
    }
    await loadAssignments()
  } catch (err: any) {
    alert('Gagal membuat tugas: ' + (err.message || 'Terjadi kesalahan'))
  }
}

async function deleteAssignment(item: any) {
  if (!confirm(`Hapus tugas "${item.title}"? Semua data pengumpulan siswa pada tugas ini akan ikut terhapus.`)) {
    return
  }
  try {
    await api.delete(`/assignments/${item.id}`)
    await loadAssignments()
  } catch (err: any) {
    alert('Gagal menghapus tugas: ' + (err.message || 'Terjadi kesalahan'))
  }
}

onMounted(() => {
  loadClassrooms()
  loadAssignments()
  loadChapters()
})
</script>
