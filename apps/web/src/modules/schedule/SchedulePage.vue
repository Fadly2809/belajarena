<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="text-2xl sm:text-3xl">📅</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Jadwal Mingguan & Info Pertemuan
          </h1>
          <span class="px-2.5 py-0.5 rounded-full bg-[#0c2b3d]/10 text-[#0c2b3d] font-bold text-xs">
            Rutin Mingguan
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-600 font-medium mt-1">
          {{ schoolName }} &bull; Guru Pengampu: <strong class="text-slate-800">{{ teacherName }}</strong> &bull; Mapel: <span class="font-bold text-slate-800">{{ teacherSubject }}</span>
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="activeTab === 'meetings'"
          @click="openCreateMeetingModal()"
          class="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
        >
          <span>➕</span> Tambah Info Pertemuan
        </button>
        <button
          @click="openSlotModal()"
          class="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition flex items-center gap-1.5"
        >
          <span>⚙️</span> Setting Jadwal Rutin
        </button>
        <button
          @click="printSchedule()"
          class="px-4 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#082231] text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
        >
          <span>🖨️</span> Cetak Jadwal
        </button>
      </div>
    </div>

    <!-- Alert Information Note -->
    <div class="p-4 sm:p-5 rounded-[24px] bg-[#0c2b3d]/5 border border-[#0c2b3d]/15 flex items-start gap-3.5 shadow-xs">
      <div class="w-9 h-9 rounded-xl bg-[#0c2b3d] text-white flex items-center justify-center text-base shrink-0 shadow-xs">
        💡
      </div>
      <div class="text-xs text-slate-800 leading-relaxed">
        <strong class="font-extrabold text-[#0c2b3d]">Prinsip Jadwal Mingguan Tetap:</strong>
        Jadwal mengajar Bapak berulang secara otomatis setiap minggu (Senin s.d. Jumat). Anda <em>tidak perlu menambah jadwal baru setiap minggu</em>. Cukup atur slot mingguan sekali di tab <strong>Jadwal Mingguan Rutin</strong>, lalu isi topik dan capaian ajar pada tab <strong>Info Pertemuan Tiap Minggu</strong>.
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="flex items-center border-b border-slate-200 space-x-6 text-xs font-bold">
      <button
        @click="activeTab = 'weekly'"
        class="pb-3 border-b-2 transition flex items-center gap-2"
        :class="activeTab === 'weekly' ? 'border-[#0c2b3d] text-[#0c2b3d]' : 'border-transparent text-slate-400 hover:text-slate-700'"
      >
        <span>📆</span> Jadwal Mingguan Rutin (Master)
      </button>
      <button
        @click="activeTab = 'meetings'"
        class="pb-3 border-b-2 transition flex items-center gap-2"
        :class="activeTab === 'meetings' ? 'border-[#0c2b3d] text-[#0c2b3d]' : 'border-transparent text-slate-400 hover:text-slate-700'"
      >
        <span>📝</span> Info & Jurnal Pertemuan (Minggu 1 - 16)
      </button>
    </div>

    <!-- ============================================================== -->
    <!-- TAB 1: JADWAL MINGGUAN RUTIN (SENIN - JUMAT) -->
    <!-- ============================================================== -->
    <div v-if="activeTab === 'weekly'" class="space-y-6">
      <!-- Days Grid (Senin s/d Jumat) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div
          v-for="day in daysOfWeek"
          :key="day"
          class="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden"
          :class="{ 'ring-2 ring-blue-500 shadow-blue-500/10': isToday(day) }"
        >
          <!-- Day Header -->
          <div
            class="px-4 py-3 border-b flex items-center justify-between"
            :class="isToday(day) ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-800'"
          >
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-xs uppercase tracking-wide">{{ day }}</span>
              <span v-if="isToday(day)" class="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-semibold">
                Hari Ini
              </span>
            </div>
            <span class="text-[11px] font-medium opacity-80">
              {{ getSlotsByDay(day).length }} Sesi
            </span>
          </div>

          <!-- Slots List in Day -->
          <div class="p-3 space-y-3 flex-1 bg-slate-50/40">
            <div
              v-for="slot in getSlotsByDay(day)"
              :key="slot.id"
              class="p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-xs hover:shadow-md transition space-y-2 relative group"
            >
              <!-- Time and Room -->
              <div class="flex items-center justify-between text-[11px]">
                <span class="font-bold text-slate-800 flex items-center gap-1">
                  <span>⏰</span> {{ slot.time_start }} - {{ slot.time_end }}
                </span>
                <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[10px]">
                  {{ slot.room }}
                </span>
              </div>

              <!-- Subject & Class -->
              <div>
                <span
                  class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold mb-1"
                  :style="{ backgroundColor: (slot.color || '#3B82F6') + '15', color: slot.color || '#3B82F6' }"
                >
                  {{ slot.subject_name || teacherSubject }}
                </span>
                <h4 class="text-xs font-bold text-slate-900 leading-tight">
                  {{ slot.classroom_name?.toLowerCase().startsWith('kelas') ? slot.classroom_name : `Kelas ${slot.classroom_name}` }}
                </h4>
                <p class="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  {{ slot.description || 'Kegiatan Pembelajaran & Praktikum' }}
                </p>
              </div>

              <!-- Action buttons -->
              <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <button
                  @click="openMeetingTrackerForSlot(slot)"
                  class="text-blue-600 hover:text-blue-800 font-bold transition flex items-center gap-1"
                >
                  <span>📝</span> Info Pertemuan
                </button>
                <div class="flex items-center gap-1">
                  <button
                    @click="editSlot(slot)"
                    class="text-slate-400 hover:text-slate-700 p-1 rounded-md"
                    title="Edit Slot Rutin"
                  >
                    ✏️
                  </button>
                  <button
                    @click="deleteSlot(slot)"
                    class="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                    title="Hapus Slot Rutin"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>

            <div
              v-if="getSlotsByDay(day).length === 0"
              class="py-8 text-center text-slate-400 text-xs italic"
            >
              Tidak ada jadwal mengajar rutin
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- TAB 2: INFO & JURNAL PERTEMUAN TIAP MINGGU (1 - 16) -->
    <!-- ============================================================== -->
    <div v-if="activeTab === 'meetings'" class="space-y-6">
      <!-- Filter Bar -->
      <div class="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <!-- Class Selector -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pilih Kelas</label>
            <select
              v-model="selectedClassId"
              class="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="onTrackingClassChange"
            >
              <option v-if="classrooms.length === 0" value="" disabled>Belum ada kelas</option>
              <option v-for="c in classrooms" :key="c.id" :value="c.id">
                {{ formatClassLabel(c) }}
              </option>
            </select>
          </div>

          <!-- Subject Selector -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mata Pelajaran</label>
            <select
              v-model="selectedSubjectId"
              class="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option v-if="availableTrackingSubjects.length === 0" value="" disabled>Belum ada mapel</option>
              <option v-for="s in availableTrackingSubjects" :key="s.id" :value="s.id">
                {{ s.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-500 hidden sm:inline">
            Total <strong>{{ currentMeetings.length }} Pertemuan</strong>
          </span>
          <button
            @click="openCreateMeetingModal()"
            class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5"
          >
            <span>➕</span> Tambah Info Pertemuan
          </button>
          <RouterLink
            to="/presentations"
            class="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5"
          >
            <span>🚀</span> Buka Studio Presentasi
          </RouterLink>
        </div>
      </div>

      <!-- Weekly Meetings List (Pertemuan 1 s/d 16) -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th class="py-3 px-4 w-16 text-center">Minggu</th>
                <th class="py-3 px-4 w-28">Tanggal</th>
                <th class="py-3 px-6">Topik / Materi Pembelajaran</th>
                <th class="py-3 px-6">Aktivitas Siswa di Lab</th>
                <th class="py-3 px-4 w-28 text-center">Status</th>
                <th class="py-3 px-4 w-28 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="meet in currentMeetings"
                :key="meet.id"
                class="hover:bg-slate-50/70 transition"
                :class="{ 'bg-blue-50/30': meet.status === 'in_progress' }"
              >
                <!-- Meeting Number -->
                <td class="py-3.5 px-4 text-center">
                  <span class="w-7 h-7 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center mx-auto">
                    {{ meet.meeting_number }}
                  </span>
                </td>

                <!-- Date -->
                <td class="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                  {{ formatDate(meet.date) }}
                </td>

                <!-- Topic -->
                <td class="py-3.5 px-6">
                  <div class="font-bold text-slate-900 leading-tight">
                    {{ meet.topic }}
                  </div>
                  <div v-if="meet.notes" class="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
                    <span>💡 Catatan:</span> {{ meet.notes }}
                  </div>
                </td>

                <!-- Activities -->
                <td class="py-3.5 px-6 text-slate-600 leading-relaxed text-[11px]">
                  {{ meet.activities || '-' }}
                </td>

                <!-- Status Badge -->
                <td class="py-3.5 px-4 text-center">
                  <span
                    class="px-2.5 py-1 rounded-full text-[10px] font-bold inline-block"
                    :class="
                      meet.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : meet.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-400'
                        : 'bg-slate-100 text-slate-600'
                    "
                  >
                    {{ meet.status === 'completed' ? '✓ Terlaksana' : meet.status === 'in_progress' ? '● Berlangsung' : '○ Terjadwal' }}
                  </span>
                </td>

                <!-- Action Button -->
                <td class="py-3.5 px-4 text-center">
                  <div class="flex items-center justify-center gap-1.5">
                    <button
                      @click="openEditMeetingModal(meet)"
                      class="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold text-xs transition"
                      title="Edit Info & Jurnal Pertemuan"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      @click="deleteMeeting(meet)"
                      class="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition"
                      title="Hapus Data Pertemuan"
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL: SETTING SLOT JADWAL MINGGUAN RUTIN -->
    <!-- ============================================================== -->
    <Teleport to="body">
      <div v-if="showSlotModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
          <div class="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
            <h3 class="font-bold text-sm">
              {{ editingSlotId ? 'Edit Slot Jadwal Mingguan' : 'Tambah Slot Jadwal Mingguan' }}
            </h3>
            <button @click="showSlotModal = false" class="text-white/80 hover:text-white">✕</button>
          </div>

          <div class="p-5 space-y-4 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Hari</label>
              <select v-model="slotForm.day" class="w-full px-3 py-2 bg-slate-50 border rounded-xl font-semibold">
                <option v-for="d in daysOfWeek" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Jam Mulai</label>
                <input v-model="slotForm.time_start" type="time" class="w-full px-3 py-2 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Jam Selesai</label>
                <input v-model="slotForm.time_end" type="time" class="w-full px-3 py-2 bg-slate-50 border rounded-xl" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Kelas</label>
                <select v-model="slotForm.classroom_id" class="w-full px-3 py-2 bg-slate-50 border rounded-xl font-semibold" @change="onSlotClassChange">
                  <option v-if="classrooms.length === 0" value="" disabled>-- Belum ada kelas (buat di Manajemen Kelas) --</option>
                  <option v-for="c in classrooms" :key="c.id" :value="c.id">
                    {{ formatClassLabel(c) }}
                  </option>
                </select>
                <div v-if="classrooms.length === 0" class="mt-1">
                  <RouterLink to="/classrooms" class="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-1">
                    <span>➕</span> Buat kelas di Manajemen Kelas
                  </RouterLink>
                </div>
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                <select v-model="slotForm.subject_id" class="w-full px-3 py-2 bg-slate-50 border rounded-xl font-semibold">
                  <option v-if="availableSlotSubjects.length === 0" value="" disabled>-- Belum ada mata pelajaran (atur di Profil) --</option>
                  <option v-for="s in availableSlotSubjects" :key="s.id" :value="s.id">
                    {{ s.name }}
                  </option>
                </select>
                <div v-if="availableSlotSubjects.length === 0" class="mt-1">
                  <RouterLink to="/settings/profile" class="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-1">
                    <span>⚙️</span> Atur Mapel di Profil Pendidik
                  </RouterLink>
                </div>
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Ruangan</label>
              <input v-model="slotForm.room" type="text" placeholder="Lab Komputer 1" class="w-full px-3 py-2 bg-slate-50 border rounded-xl" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Keterangan Singkat</label>
              <input v-model="slotForm.description" type="text" placeholder="Misal: Praktikum Logika & Koding" class="w-full px-3 py-2 bg-slate-50 border rounded-xl" />
            </div>
          </div>

          <div class="p-4 bg-slate-50 border-t flex items-center justify-between">
            <button
              v-if="editingSlotId"
              @click="deleteCurrentSlot"
              class="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition flex items-center gap-1"
            >
              <span>🗑️</span> Hapus Slot
            </button>
            <div v-else></div>
            <div class="flex items-center gap-2">
              <button @click="showSlotModal = false" class="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-200 text-xs">
                Batal
              </button>
              <button @click="saveSlotForm" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
                Simpan Jadwal Rutin
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ============================================================== -->
    <!-- MODAL: EDIT INFO PERTEMUAN MINGGUAN -->
    <!-- ============================================================== -->
    <Teleport to="body">
      <div v-if="showMeetingModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
          <div class="p-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
            <div>
              <h3 class="font-bold text-sm">
                {{ isCreatingMeeting ? 'Tambah Info Pertemuan Baru' : `Edit Info Pertemuan Ke-${editingMeeting?.meeting_number}` }}
              </h3>
              <p class="text-[11px] text-blue-200">
                <span v-if="editingMeeting?.week_number">Minggu ke-{{ editingMeeting?.week_number }} &bull; </span>Kelas {{ getClassName(selectedClassId) }} &bull; {{ getSubjectName(selectedSubjectId) }}
              </p>
            </div>
            <button @click="showMeetingModal = false" class="text-white/80 hover:text-white">✕</button>
          </div>

          <div class="p-5 space-y-4 text-xs" v-if="editingMeeting">
            <div class="grid grid-cols-2 gap-3" v-if="isCreatingMeeting">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Pertemuan Ke-</label>
                <input v-model.number="editingMeeting.meeting_number" type="number" min="1" class="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Minggu Ke-</label>
                <input v-model.number="editingMeeting.week_number" type="number" min="1" class="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Tanggal Pelaksanaan</label>
                <input v-model="editingMeeting.date" type="date" class="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Status Keterlaksanaan</label>
                <select v-model="editingMeeting.status" class="w-full px-3 py-2 bg-slate-50 border rounded-xl font-semibold">
                  <option value="completed">Terlaksana (Selesai)</option>
                  <option value="in_progress">Sedang Berlangsung (Hari Ini)</option>
                  <option value="scheduled">Terjadwal</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Topik / Materi Pembelajaran</label>
              <input
                v-model="editingMeeting.topic"
                type="text"
                placeholder="Misal: Logika Percabangan IF-ELSE pada Python"
                class="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium text-slate-900"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Aktivitas Siswa / Capaian di Lab Komputer</label>
              <textarea
                v-model="editingMeeting.activities"
                rows="2"
                placeholder="Aktivitas praktikum siswa..."
                class="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium leading-relaxed"
              ></textarea>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Catatan Refleksi & Kendala Guru (Opsional)</label>
              <textarea
                v-model="editingMeeting.notes"
                rows="2"
                placeholder="Catatan keaktifan siswa atau kendala teknis lab..."
                class="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium leading-relaxed"
              ></textarea>
            </div>
          </div>

          <div class="p-4 bg-slate-50 border-t flex items-center justify-between">
            <button
              v-if="!isCreatingMeeting && editingMeeting"
              @click="deleteCurrentMeeting"
              class="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition flex items-center gap-1"
            >
              <span>🗑️</span> Hapus Info Ini
            </button>
            <div v-else></div>
            <div class="flex items-center gap-2">
              <button @click="showMeetingModal = false" class="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-200 text-xs">
                Batal
              </button>
              <button @click="saveMeetingForm" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
                {{ isCreatingMeeting ? 'Tambah Pertemuan' : 'Simpan Info Pertemuan' }}
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
import { RouterLink } from 'vue-router'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import {
  useClassrooms,
  getSubjectIdForClass,
  getAvailableSubjectsForClass
} from '@/composables/useClassrooms'

const authStore = useAuthStore()
const schoolName = computed(() => authStore.currentSchool?.name || 'Satuan Pendidikan')
const teacherName = computed(() => authStore.user?.name || 'Guru Pengampu')
const teacherSubject = computed(() => authStore.user?.subject || 'Semua Mata Pelajaran')

const { classrooms, fetchClassrooms, formatClassLabel, getClassName, fetchSubjects } = useClassrooms()

const activeTab = ref<'weekly' | 'meetings'>('weekly')
const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']

const weeklySlots = ref<any[]>([])
const meetingLogs = ref<any[]>([])
const selectedClassId = ref('')
const selectedSubjectId = ref('')

const availableTrackingSubjects = computed(() => getAvailableSubjectsForClass(selectedClassId.value))

function onTrackingClassChange() {
  selectedSubjectId.value = getSubjectIdForClass(selectedClassId.value)
}

const showSlotModal = ref(false)
const editingSlotId = ref<string | null>(null)
const slotForm = ref({
  day: 'Senin',
  day_index: 1,
  time_start: '07:30',
  time_end: '08:50',
  subject_id: '',
  classroom_id: '',
  room: 'Ruang Kelas',
  description: ''
})

const availableSlotSubjects = computed(() => getAvailableSubjectsForClass(slotForm.value.classroom_id))

function onSlotClassChange() {
  slotForm.value.subject_id = getSubjectIdForClass(slotForm.value.classroom_id)
}

const showMeetingModal = ref(false)
const isCreatingMeeting = ref(false)
const editingMeeting = ref<any>(null)

async function fetchWeeklyData() {
  try {
    const res = await api.get('/schedules/weekly')
    if (res.data?.data) {
      weeklySlots.value = res.data.data.weeklySlots || []
      meetingLogs.value = res.data.data.meetingLogs || []
    }
  } catch (err) {
    console.error('Failed to load weekly schedule data:', err)
  }
}

onMounted(async () => {
  await Promise.all([fetchClassrooms(true), fetchSubjects(true)])
  if (classrooms.value.length > 0) {
    if (!classrooms.value.some(c => c.id === selectedClassId.value)) {
      selectedClassId.value = classrooms.value[0].id
      slotForm.value.classroom_id = classrooms.value[0].id
    }
  }
  selectedSubjectId.value = getSubjectIdForClass(selectedClassId.value)
  slotForm.value.subject_id = getSubjectIdForClass(slotForm.value.classroom_id)
  await fetchWeeklyData()
})

function getSlotsByDay(day: string) {
  return weeklySlots.value.filter(s => s.day === day)
}

function isToday(dayName: string): boolean {
  const dayIndex = new Date().getDay() // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
  const days = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', '']
  return days[dayIndex] === dayName
}

const currentMeetings = computed(() => {
  return meetingLogs.value.filter(
    m => m.classroom_id === selectedClassId.value && m.subject_id === selectedSubjectId.value
  )
})

function openSlotModal() {
  editingSlotId.value = null
  const defaultClass = classrooms.value[0]?.id || ''
  slotForm.value = {
    day: 'Senin',
    day_index: 1,
    time_start: '07:30',
    time_end: '08:50',
    subject_id: getSubjectIdForClass(defaultClass) || '',
    classroom_id: defaultClass,
    room: 'Ruang Kelas',
    description: ''
  }
  showSlotModal.value = true
}

function editSlot(slot: any) {
  editingSlotId.value = slot.id
  slotForm.value = {
    day: slot.day,
    day_index: slot.day_index,
    time_start: slot.time_start,
    time_end: slot.time_end,
    subject_id: slot.subject_id,
    classroom_id: slot.classroom_id,
    room: slot.room,
    description: slot.description || ''
  }
  showSlotModal.value = true
}

async function saveSlotForm() {
  if (!slotForm.value.classroom_id) {
    alert('Silakan pilih kelas terlebih dahulu. Jika belum ada kelas, buat kelas baru di menu Manajemen Kelas.')
    return
  }
  const dayMap: Record<string, number> = { Senin: 1, Selasa: 2, Rabu: 3, Kamis: 4, Jumat: 5 }
  const chosenSub = availableSlotSubjects.value.find(s => s.id === slotForm.value.subject_id) || availableSlotSubjects.value[0]
  const chosenClass = classrooms.value.find(c => c.id === slotForm.value.classroom_id)
  const subjectName = chosenSub?.name || authStore.user?.subject || 'Mata Pelajaran'
  const classroomName = chosenClass ? formatClassLabel(chosenClass) : getClassName(slotForm.value.classroom_id)

  const payload = {
    ...slotForm.value,
    day_index: dayMap[slotForm.value.day] || 1,
    subject_id: slotForm.value.subject_id || chosenSub?.id || 'sub-1',
    subject_name: subjectName,
    classroom_name: classroomName,
    color: '#3B82F6',
    icon: '📚'
  }

  try {
    if (editingSlotId.value) {
      await api.put(`/schedules/weekly/${editingSlotId.value}`, payload)
    } else {
      await api.post('/schedules/weekly', payload)
    }
    showSlotModal.value = false
    await fetchWeeklyData()
  } catch (err: any) {
    console.error('Failed to save slot:', err)
    alert(err.response?.data?.message || 'Gagal menyimpan slot jadwal')
  }
}

function openMeetingTrackerForSlot(slot: any) {
  selectedClassId.value = slot.classroom_id
  selectedSubjectId.value = slot.subject_id
  activeTab.value = 'meetings'
}

function openCreateMeetingModal() {
  isCreatingMeeting.value = true
  const nextNum = (currentMeetings.value.length || 0) + 1
  editingMeeting.value = {
    id: `meet-${selectedClassId.value}-${selectedSubjectId.value}-${Date.now().toString(36)}`,
    meeting_number: nextNum,
    week_number: nextNum,
    classroom_id: selectedClassId.value,
    subject_id: selectedSubjectId.value,
    date: new Date().toISOString().split('T')[0],
    topic: '',
    activities: '',
    notes: '',
    status: 'scheduled'
  }
  showMeetingModal.value = true
}

function openEditMeetingModal(meet: any) {
  isCreatingMeeting.value = false
  editingMeeting.value = { ...meet }
  showMeetingModal.value = true
}

async function saveMeetingForm() {
  if (!editingMeeting.value) return
  try {
    if (isCreatingMeeting.value) {
      await api.post('/schedules/meetings', editingMeeting.value)
    } else {
      await api.put(`/schedules/meetings/${editingMeeting.value.id}`, editingMeeting.value)
    }
    showMeetingModal.value = false
    await fetchWeeklyData()
  } catch (err: any) {
    console.error('Failed to save meeting:', err)
    alert(err.response?.data?.message || 'Gagal menyimpan info pertemuan')
  }
}

async function deleteSlot(slot: any) {
  if (!confirm(`Hapus slot jadwal rutin ${slot.day} (${slot.time_start} - ${slot.time_end}) untuk kelas ${slot.classroom_name}?`)) {
    return
  }
  try {
    await api.delete(`/schedules/weekly/${slot.id}`)
    await fetchWeeklyData()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menghapus slot jadwal')
  }
}

async function deleteCurrentSlot() {
  if (!editingSlotId.value) return
  if (!confirm('Hapus slot jadwal rutin ini?')) {
    return
  }
  try {
    await api.delete(`/schedules/weekly/${editingSlotId.value}`)
    showSlotModal.value = false
    await fetchWeeklyData()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menghapus slot jadwal')
  }
}

async function deleteMeeting(meet: any) {
  if (!confirm(`Hapus info dan jurnal pertemuan ke-${meet.meeting_number} (${meet.topic || 'Tanpa Materi'})?\n\nCatatan pertemuan ini akan dihapus dari sistem.`)) {
    return
  }
  try {
    await api.delete(`/schedules/meetings/${meet.id}`)
    await fetchWeeklyData()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menghapus info pertemuan')
  }
}

async function deleteCurrentMeeting() {
  if (!editingMeeting.value) return
  await deleteMeeting(editingMeeting.value)
  showMeetingModal.value = false
}

function formatDate(iso: string): string {
  if (!iso) return '-'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}



function getSubjectName(id: string) {
  const found = availableSlotSubjects.value.find(s => s.id === id) || availableTrackingSubjects.value.find(s => s.id === id)
  return found?.name || authStore.user?.subject || 'Mata Pelajaran'
}

function printSchedule() {
  window.print()
}
</script>
