<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span>📋</span> Absensi & Jurnal Kelas
        </h1>
        <p class="text-slate-600 text-sm mt-1 font-medium">
          Catat kehadiran siswa, rekap presensi per pertemuan, dan integrasi persentase kehadiran formatif
        </p>
      </div>
      <button @click="showNewSessionModal = true" class="px-4 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#082231] text-white font-bold text-xs shadow-md transition flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        <span>Buat Pertemuan Baru</span>
      </button>
    </div>

    <!-- Filter bar -->
    <div class="bg-white rounded-[24px] shadow-card border border-slate-200/60 p-4 sm:p-5">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">Kelas / Rombel</label>
          <select v-model="filter.classroomId" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition" @change="onFilterClassChange">
            <option value="">Semua Kelas</option>
            <option v-for="cls in classrooms" :key="cls.id" :value="cls.id">
              {{ cls.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">Mata Pelajaran</label>
          <select v-model="filter.subjectId" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition" @change="loadSessions">
            <option value="">Semua Mapel</option>
            <option v-for="subj in filteredFilterSubjects" :key="subj.id" :value="subj.id">
              {{ subj.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">Tanggal Pertemuan</label>
          <input v-model="filter.date" type="date" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition" @change="loadSessions" />
        </div>
      </div>
    </div>

    <!-- Sessions list -->
    <div v-if="loadingSessions" class="card">
      <div class="space-y-3">
        <div v-for="i in 3" :key="i" class="animate-pulse flex items-center gap-4 p-3 rounded-xl bg-surface-50">
          <div class="w-12 h-12 rounded-xl bg-surface-200"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-surface-200 rounded w-1/3"></div>
            <div class="h-3 bg-surface-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="sessionsError" class="card p-6 text-center">
      <p class="text-red-500 font-medium">{{ sessionsError }}</p>
      <button @click="loadSessions" class="btn-secondary mt-3">Coba Lagi</button>
    </div>

    <div v-else>
      <div v-if="sessions.length === 0" class="card">
        <div class="empty-state">
          <svg class="w-16 h-16 text-surface-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <p class="text-surface-700 font-medium">Belum ada pertemuan</p>
          <p class="text-surface-500 text-sm mt-1">Buat pertemuan baru untuk mulai mengisi absensi</p>
          <button @click="showNewSessionModal = true" class="btn-primary mt-4">
            Buat Pertemuan
          </button>
        </div>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="session in sessions"
          :key="session.id"
          class="card p-4 hover:shadow-card-hover transition-shadow cursor-pointer"
          @click="openSession(session)"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              :class="session.status === 'completed' ? 'bg-green-100 text-green-600' :
                      session.status === 'in_progress' ? 'bg-primary-100 text-primary-600' :
                      'bg-surface-100 text-surface-500'"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2m-3 7l2 2 4-4"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="font-bold text-surface-900 text-sm">{{ session.classroom_name }} · {{ session.subject_name }}</p>
                <span class="badge" :class="getStatusBadge(session.status).class">
                  {{ getStatusBadge(session.status).label }}
                </span>
                <span class="text-xs text-surface-400">&bull; Pertemuan Ke-{{ session.session_number }}</span>
              </div>
              <p class="text-xs text-surface-500 mt-0.5">
                📅 {{ formatDate(session.session_date) }}
              </p>
              <p class="text-xs font-semibold text-surface-800 mt-1">
                <strong>Materi:</strong> {{ session.topic || 'Belum ada materi topik' }}
              </p>
              <p v-if="session.activities" class="text-xs text-surface-600 mt-1 line-clamp-2 leading-relaxed">
                <strong>Aktivitas:</strong> {{ session.activities }}
              </p>
              <div v-if="session.notes" class="mt-1.5 p-2 rounded-lg bg-surface-50 border border-surface-200/60 text-xs text-surface-600">
                <strong class="text-surface-800">💡 Catatan / Kendala:</strong> {{ session.notes }}
              </div>
              <div class="flex items-center gap-4 mt-2">
                <span class="text-xs text-green-600 font-bold">✓ Hadir: {{ session.present_count ?? '—' }}</span>
                <span class="text-xs text-red-500 font-bold">✗ Alpa: {{ session.absent_count ?? '—' }}</span>
                <span class="text-xs text-amber-500 font-bold">S Sakit: {{ session.sick_count ?? '—' }}</span>
                <span class="text-xs text-blue-500 font-bold">I Izin: {{ session.excused_count ?? '—' }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <button
                v-if="session.status !== 'completed'"
                @click.stop="openSession(session)"
                class="btn-primary btn-sm flex items-center gap-1"
                title="Isi kehadiran siswa"
              >
                <span>✏️</span> Isi Absensi
              </button>
              <button
                v-else
                @click.stop="openSession(session)"
                class="btn-secondary btn-sm flex items-center gap-1"
                title="Lihat & ubah absensi siswa"
              >
                <span>👁️</span> Lihat / Edit Absensi
              </button>
              <button
                @click.stop="openEditSession(session)"
                class="btn-ghost btn-sm text-surface-500 hover:text-blue-600 p-1.5 rounded-lg"
                title="Edit Informasi Pertemuan (Tanggal, Topik, Status)"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button
                @click.stop="deleteSession(session)"
                class="p-2 text-surface-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                title="Hapus Pertemuan & Data Absensi"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Attendance Input Modal -->
    <Teleport to="body">
      <div v-if="showAttendanceModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeAttendanceModal"></div>
        <div class="relative bg-white rounded-3xl shadow-modal w-full max-w-2xl max-h-[90vh] flex flex-col">
          <!-- Modal header -->
          <div class="flex items-center justify-between p-6 border-b border-surface-100">
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-lg font-bold text-surface-900">Absensi Siswa</h2>
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  :class="activeSession?.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'"
                >
                  {{ activeSession?.status === 'completed' ? 'Terkunci (Selesai)' : 'Draft / Berlangsung' }}
                </span>
              </div>
              <p class="text-sm text-surface-500 mt-0.5">
                {{ activeSession?.classroom_name }} · {{ activeSession?.subject_name }} ·
                Pertemuan {{ activeSession?.session_number }}
              </p>
            </div>
            <button @click="closeAttendanceModal" class="btn-icon btn-ghost">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Loading students -->
          <div v-if="loadingStudents" class="flex-1 flex items-center justify-center p-8">
            <svg class="spinner w-8 h-8 text-primary-600" viewBox="0 0 24 24"></svg>
          </div>

          <!-- No students -->
          <div v-else-if="attendanceRecords.length === 0" class="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <p class="text-surface-500 font-medium">Tidak ada siswa di kelas ini</p>
              <p class="text-surface-400 text-sm mt-1">Tambahkan siswa ke kelas terlebih dahulu</p>
            </div>
          </div>

          <template v-else>
            <!-- Quick actions -->
            <div class="px-6 py-3 border-b border-surface-100 bg-surface-50 flex items-center gap-2 flex-wrap">
              <span class="text-sm text-surface-500 mr-2">Tandai semua:</span>
              <button @click="markAll('present')" class="btn-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-lg px-3 py-1 text-xs font-medium">
                ✓ Hadir
              </button>
              <button @click="markAll('absent')" class="btn-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg px-3 py-1 text-xs font-medium">
                ✗ Alpa
              </button>
            </div>

            <!-- Students list -->
            <div class="flex-1 overflow-y-auto p-6 space-y-2">
              <div
                v-for="(record, idx) in attendanceRecords"
                :key="record.student_id"
                class="flex items-center gap-3 p-3 rounded-xl border transition-colors"
                :class="getAttendanceBg(record.status)"
              >
                <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-700 flex-shrink-0">
                  {{ idx + 1 }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-surface-800 text-sm truncate">{{ record.student_name }}</p>
                  <p class="text-xs text-surface-400">NIS: {{ record.nis }}</p>
                </div>
                <!-- Status buttons -->
                <div class="flex gap-1">
                  <button
                    v-for="status in attendanceStatuses"
                    :key="status.value"
                    @click="record.status = status.value as 'present' | 'sick' | 'excused' | 'absent'"
                    class="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                    :class="record.status === status.value ? status.activeClass : 'bg-surface-100 text-surface-400 hover:bg-surface-200'"
                    :title="status.label"
                  >
                    {{ status.short }}
                  </button>
                </div>
                <!-- Notes -->
                <input
                  v-model="record.notes"
                  type="text"
                  class="input w-32 text-xs py-1.5"
                  placeholder="Catatan..."
                />
              </div>
            </div>

            <!-- Modal footer -->
            <div class="p-6 border-t border-surface-100 flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-3 text-sm text-surface-500">
                <span class="text-green-600">✓ {{ countByStatus('present') }} Hadir</span>
                <span class="text-red-500">✗ {{ countByStatus('absent') }} Alpa</span>
                <span class="text-amber-500">S {{ countByStatus('sick') }} Sakit</span>
                <span class="text-blue-500">I {{ countByStatus('excused') }} Izin</span>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="deleteCurrentSession"
                  class="btn text-rose-600 hover:bg-rose-50 border border-rose-200"
                  title="Hapus pertemuan ini beserta data absensinya"
                >
                  <svg class="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Hapus Sesi
                </button>
                <button @click="saveDraft" class="btn-secondary" :disabled="savingAttendance">
                  Simpan Draft
                </button>
                <button @click="saveAndLock" class="btn-primary" :disabled="savingAttendance">
                  <svg v-if="savingAttendance" class="spinner w-4 h-4" viewBox="0 0 24 24"></svg>
                  Simpan & Kunci
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </Teleport>

    <!-- Edit Session Modal -->
    <Teleport to="body">
      <div v-if="showEditSessionModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showEditSessionModal = false"></div>
        <div class="relative bg-white rounded-3xl shadow-modal w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
          <div class="p-6 border-b border-surface-100 flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-surface-900">Edit Informasi & Jurnal Pertemuan</h2>
              <p class="text-xs text-surface-500 mt-0.5">Otomatis sinkron ke Info & Jurnal Pertemuan</p>
            </div>
            <button @click="showEditSessionModal = false" class="btn-icon btn-ghost">✕</button>
          </div>
          <div class="p-6 space-y-4 text-xs overflow-y-auto flex-1" v-if="editingSession">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Kelas</label>
                <input :value="editingSession.classroom_name" disabled class="input bg-surface-100 text-surface-500 font-bold" />
              </div>
              <div>
                <label class="label">Mata Pelajaran</label>
                <input :value="editingSession.subject_name" disabled class="input bg-surface-100 text-surface-500 font-bold" />
              </div>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="label">Tanggal Pelaksanaan</label>
                <input v-model="editingSession.session_date" type="date" class="input font-medium" />
              </div>
              <div>
                <label class="label">Pertemuan Ke-</label>
                <input v-model.number="editingSession.session_number" type="number" min="1" class="input font-medium" />
              </div>
              <div>
                <label class="label">Minggu Ke-</label>
                <input v-model.number="editingSession.week_number" type="number" min="1" class="input font-medium" />
              </div>
            </div>
            <div>
              <label class="label">Topik / Materi Pembelajaran <span class="text-red-500">*</span></label>
              <input v-model="editingSession.topic" type="text" placeholder="Misal: Logika Percabangan IF-ELSE pada Python" class="input font-medium text-surface-900" />
            </div>
            <div>
              <label class="label">Aktivitas Siswa / Capaian di Lab Komputer</label>
              <textarea
                v-model="editingSession.activities"
                rows="2"
                placeholder="Aktivitas praktikum siswa, pengerjaan tugas lab..."
                class="input font-medium leading-relaxed"
              ></textarea>
            </div>
            <div>
              <label class="label">Catatan Refleksi & Kendala Guru (Jurnal Kelas)</label>
              <textarea
                v-model="editingSession.notes"
                rows="2"
                placeholder="Catatan keaktifan siswa atau kendala teknis lab..."
                class="input font-medium leading-relaxed"
              ></textarea>
            </div>
            <div>
              <label class="label">Status Keterlaksanaan</label>
              <select v-model="editingSession.status" class="input font-medium">
                <option value="in_progress">Sedang Berlangsung / Draft</option>
                <option value="completed">Terlaksana (Terkunci Selesai)</option>
              </select>
            </div>
          </div>
          <div class="p-6 border-t border-surface-100 flex items-center justify-end gap-2">
            <button @click="showEditSessionModal = false" class="btn-secondary">Batal</button>
            <button @click="saveEditSession" class="btn-primary" :disabled="savingSessionInfo">
              <svg v-if="savingSessionInfo" class="spinner w-4 h-4 mr-1" viewBox="0 0 24 24"></svg>
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- New Session Modal -->
    <Teleport to="body">
      <div v-if="showNewSessionModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showNewSessionModal = false"></div>
        <div class="relative bg-white rounded-3xl shadow-modal w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
          <div class="p-6 border-b border-surface-100 flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-surface-900">Buat Pertemuan & Jurnal Baru</h2>
              <p class="text-xs text-surface-500 mt-0.5">Otomatis mengisi Info & Jurnal Pertemuan</p>
            </div>
            <button @click="showNewSessionModal = false" class="btn-icon btn-ghost">✕</button>
          </div>
          <div class="p-6 space-y-4 text-xs overflow-y-auto flex-1">
            <div v-if="createError" class="alert-error">{{ createError }}</div>

            <!-- Info Alert -->
            <div class="p-3 bg-blue-50 border border-blue-200/60 rounded-xl text-blue-800 text-[11px] leading-relaxed flex items-start gap-2">
              <span class="text-base mt-0.5">💡</span>
              <div>
                <strong>Otomatis Sinkron:</strong> Data materi topik, aktivitas siswa, dan catatan yang diinput di sini akan langsung otomatis tersimpan ke tab <strong>Info & Jurnal Pertemuan</strong>.
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Kelas <span class="text-red-500">*</span></label>
                <select v-model="newSession.classroomId" @change="onNewSessionClassChange" class="input" :class="{ 'input-error': newSessionErrors.classroomId }">
                  <option value="">Pilih kelas...</option>
                  <option v-for="cls in classrooms" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
                </select>
                <p v-if="newSessionErrors.classroomId" class="error-msg">{{ newSessionErrors.classroomId }}</p>
              </div>
              <div>
                <label class="label">Mata Pelajaran <span class="text-red-500">*</span></label>
                <select v-model="newSession.subjectId" class="input" :class="{ 'input-error': newSessionErrors.subjectId }">
                  <option value="">Pilih mata pelajaran...</option>
                  <option v-for="subj in availableNewSessionSubjects" :key="subj.id" :value="subj.id">{{ subj.name }}</option>
                </select>
                <p v-if="newSessionErrors.subjectId" class="error-msg">{{ newSessionErrors.subjectId }}</p>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="label">Tanggal <span class="text-red-500">*</span></label>
                <input v-model="newSession.date" type="date" class="input font-medium" />
              </div>
              <div>
                <label class="label">Pertemuan ke-</label>
                <input v-model.number="newSession.sessionNumber" type="number" class="input font-medium" min="1" />
              </div>
              <div>
                <label class="label">Minggu ke-</label>
                <input v-model.number="newSession.weekNumber" type="number" class="input font-medium" min="1" />
              </div>
            </div>

            <div>
              <label class="label">Topik / Materi Pembelajaran <span class="text-red-500">*</span></label>
              <input v-model="newSession.topic" type="text" class="input font-medium text-surface-900" placeholder="Misal: Struktur Data Algoritma & Pemrograman Visual" />
            </div>

            <div>
              <label class="label">Aktivitas Siswa / Capaian di Lab Komputer</label>
              <textarea
                v-model="newSession.activities"
                rows="2"
                placeholder="Praktikum di Lab Komputer, eksplorasi koding mandiri, demonstrasi proyektor..."
                class="input font-medium leading-relaxed"
              ></textarea>
            </div>

            <div>
              <label class="label">Catatan Refleksi & Kendala Guru (Jurnal Kelas)</label>
              <textarea
                v-model="newSession.notes"
                rows="2"
                placeholder="Catatan keaktifan siswa, penugasan mandiri, atau kendala perangkat lab..."
                class="input font-medium leading-relaxed"
              ></textarea>
            </div>

            <div>
              <label class="label">Status Pertemuan</label>
              <select v-model="newSession.status" class="input font-medium">
                <option value="in_progress">Sedang Berlangsung / Draft</option>
                <option value="completed">Terlaksana (Terkunci Selesai)</option>
              </select>
            </div>
          </div>
          <div class="p-6 border-t border-surface-100 flex justify-end gap-3">
            <button @click="showNewSessionModal = false" class="btn-secondary">Batal</button>
            <button @click="createSession" class="btn-primary" :disabled="creatingSession">
              <svg v-if="creatingSession" class="spinner w-4 h-4" viewBox="0 0 24 24"></svg>
              Buat Pertemuan
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/services/api'
import { getSubjectIdForClass, getAvailableSubjectsForClass } from '@/composables/useClassrooms'

interface Session {
  id: string
  classroom_name: string
  subject_name: string
  classroom_id: string
  subject_id: string
  session_number: number
  week_number?: number
  session_date: string
  topic?: string
  activities?: string
  notes?: string
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  present_count?: number
  absent_count?: number
  sick_count?: number
  excused_count?: number
}

interface AttendanceRecord {
  student_id: string
  student_name: string
  nis: string
  status: 'present' | 'sick' | 'excused' | 'absent'
  notes: string
}

const loadingSessions = ref(false)
const loadingStudents = ref(false)
const savingAttendance = ref(false)
const creatingSession = ref(false)
const showAttendanceModal = ref(false)
const showNewSessionModal = ref(false)
const showEditSessionModal = ref(false)
const savingSessionInfo = ref(false)
const editingSession = ref<any>(null)
const sessionsError = ref('')
const createError = ref('')
const activeSession = ref<Session | null>(null)
const sessions = ref<Session[]>([])
const classrooms = ref<any[]>([])
const subjects = ref<any[]>([])
const attendanceRecords = ref<AttendanceRecord[]>([])

const filter = reactive({
  classroomId: '',
  subjectId: '',
  date: '',
})

const filteredFilterSubjects = computed(() => {
  if (!filter.classroomId) return subjects.value
  return getAvailableSubjectsForClass(filter.classroomId)
})

function onFilterClassChange() {
  if (filter.classroomId) {
    filter.subjectId = getSubjectIdForClass(filter.classroomId)
  }
  loadSessions()
}

const newSession = reactive({
  classroomId: '',
  subjectId: '',
  date: new Date().toISOString().split('T')[0],
  sessionNumber: 1,
  weekNumber: 1,
  topic: '',
  activities: '',
  notes: '',
  status: 'in_progress',
})

const availableNewSessionSubjects = computed(() => {
  if (!newSession.classroomId) return subjects.value
  return getAvailableSubjectsForClass(newSession.classroomId)
})

function onNewSessionClassChange() {
  if (newSession.classroomId) {
    newSession.subjectId = getSubjectIdForClass(newSession.classroomId)
  }
}

const newSessionErrors = reactive({
  classroomId: '',
  subjectId: '',
})

const attendanceStatuses = [
  { value: 'present', label: 'Hadir', short: 'H', activeClass: 'bg-green-500 text-white' },
  { value: 'sick', label: 'Sakit', short: 'S', activeClass: 'bg-amber-500 text-white' },
  { value: 'excused', label: 'Izin', short: 'I', activeClass: 'bg-blue-500 text-white' },
  { value: 'absent', label: 'Alpa', short: 'A', activeClass: 'bg-red-500 text-white' },
]

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

function getStatusBadge(status: string) {
  const map: Record<string, { class: string; label: string }> = {
    planned: { class: 'badge-secondary', label: 'Direncanakan' },
    in_progress: { class: 'badge-primary', label: 'Sedang Berlangsung' },
    completed: { class: 'badge-success', label: 'Selesai' },
    cancelled: { class: 'badge-danger', label: 'Dibatalkan' },
  }
  return map[status] || { class: 'badge-secondary', label: status }
}

function getAttendanceBg(status: string): string {
  const map: Record<string, string> = {
    present: 'border-green-200 bg-green-50',
    sick: 'border-amber-200 bg-amber-50',
    excused: 'border-blue-200 bg-blue-50',
    absent: 'border-red-200 bg-red-50',
  }
  return map[status] || 'border-surface-200 bg-white'
}

function countByStatus(status: string): number {
  return attendanceRecords.value.filter(r => r.status === status).length
}

function markAll(status: 'present' | 'sick' | 'excused' | 'absent') {
  attendanceRecords.value.forEach(r => r.status = status)
}

async function loadClassrooms() {
  try {
    const res = await api.get('/classrooms', { params: { per_page: 100 } })
    classrooms.value = res.data.data || []
  } catch (err: any) {
    console.error('Failed to load classrooms:', err.response?.data?.message)
  }
}

async function loadSubjects() {
  try {
    const res = await api.get('/subjects', { params: { per_page: 100 } })
    subjects.value = res.data.data || []
  } catch (err: any) {
    console.error('Failed to load subjects:', err.response?.data?.message)
  }
}

async function loadSessions() {
  loadingSessions.value = true
  sessionsError.value = ''
  try {
    const params: any = {}
    if (filter.classroomId) params.classroom_id = filter.classroomId
    if (filter.subjectId) params.subject_id = filter.subjectId
    if (filter.date) params.session_date = filter.date
    const res = await api.get('/sessions', { params })
    sessions.value = res.data.data || []
  } catch (err: any) {
    sessionsError.value = err.response?.data?.message || 'Gagal memuat daftar pertemuan'
  } finally {
    loadingSessions.value = false
  }
}

async function openSession(session: Session) {
  activeSession.value = session
  showAttendanceModal.value = true
  loadingStudents.value = true
  attendanceRecords.value = []

  try {
    const res = await api.get(`/sessions/${session.id}/attendance`)
    const rawList = res.data.data || []
    attendanceRecords.value = rawList.map((r: any) => ({
      student_id: r.student_id,
      student_name: r.student_name,
      nis: r.nis || r.nisn || '',
      status: r.status === 'permitted' ? 'excused' : (r.status || 'present'),
      notes: r.notes || '',
    }))
  } catch (err: any) {
    console.error('Failed to load attendance:', err.response?.data?.message)
  } finally {
    loadingStudents.value = false
  }
}

function openEditSession(session: Session) {
  editingSession.value = {
    id: session.id,
    classroom_name: session.classroom_name,
    subject_name: session.subject_name,
    session_date: session.session_date,
    session_number: session.session_number,
    week_number: session.week_number || session.session_number || 1,
    topic: session.topic || '',
    activities: session.activities || '',
    notes: session.notes || '',
    status: session.status || 'in_progress',
  }
  showEditSessionModal.value = true
}

async function saveEditSession() {
  if (!editingSession.value) return
  savingSessionInfo.value = true
  try {
    await api.put(`/sessions/${editingSession.value.id}`, {
      session_date: editingSession.value.session_date,
      session_number: editingSession.value.session_number,
      week_number: editingSession.value.week_number,
      topic: editingSession.value.topic,
      activities: editingSession.value.activities,
      notes: editingSession.value.notes,
      status: editingSession.value.status,
    })
    alert('Informasi pertemuan & jurnal berhasil diperbarui dan tersinkron!')
    showEditSessionModal.value = false
    await loadSessions()
  } catch (err: any) {
    console.error('Failed to update session info:', err)
    alert(err.response?.data?.message || 'Gagal memperbarui informasi pertemuan')
  } finally {
    savingSessionInfo.value = false
  }
}

function closeAttendanceModal() {
  showAttendanceModal.value = false
  activeSession.value = null
  attendanceRecords.value = []
}

async function saveDraft() {
  await saveAttendance('draft')
}

async function saveAndLock() {
  await saveAttendance('lock')
}

async function saveAttendance(mode: 'draft' | 'lock') {
  if (!activeSession.value) return
  savingAttendance.value = true

  try {
    const payload = {
      attendance: attendanceRecords.value.map(r => ({
        student_id: r.student_id,
        student_name: r.student_name,
        nisn: r.nis,
        status: r.status,
        notes: r.notes || '',
      })),
      records: attendanceRecords.value.map(r => ({
        student_id: r.student_id,
        student_name: r.student_name,
        nisn: r.nis,
        status: r.status,
        notes: r.notes || '',
      })),
      lock: mode === 'lock',
    }

    await api.post(`/sessions/${activeSession.value.id}/attendance`, payload)

    alert(mode === 'lock'
      ? 'Kehadiran siswa berhasil disimpan dan status pertemuan dikunci (Selesai)!'
      : 'Perubahan draft absensi siswa berhasil disimpan!')

    if (mode === 'lock') {
      closeAttendanceModal()
    }

    await loadSessions()
  } catch (err: any) {
    console.error('Failed to save attendance:', err.response?.data?.message)
    alert(err.response?.data?.message || 'Gagal menyimpan absensi')
  } finally {
    savingAttendance.value = false
  }
}

async function deleteSession(session: Session) {
  if (!confirm(`Hapus data absensi & pertemuan ${session.classroom_name} (Pertemuan ke-${session.session_number})?\n\nSemua rekap absensi pada pertemuan ini akan terhapus.`)) {
    return
  }
  try {
    await api.delete(`/sessions/${session.id}`)
    await loadSessions()
  } catch (err: any) {
    console.error('Failed to delete session:', err)
    alert(err.response?.data?.message || 'Gagal menghapus sesi pertemuan')
  }
}

async function deleteCurrentSession() {
  if (!activeSession.value) return
  if (!confirm(`Hapus data absensi & pertemuan ${activeSession.value.classroom_name} (Pertemuan ke-${activeSession.value.session_number})?\n\nSemua rekap absensi pada pertemuan ini akan terhapus.`)) {
    return
  }
  try {
    await api.delete(`/sessions/${activeSession.value.id}`)
    closeAttendanceModal()
    await loadSessions()
  } catch (err: any) {
    console.error('Failed to delete session:', err)
    alert(err.response?.data?.message || 'Gagal menghapus sesi pertemuan')
  }
}

async function createSession() {
  createError.value = ''
  newSessionErrors.classroomId = ''
  newSessionErrors.subjectId = ''

  if (!newSession.classroomId) {
    newSessionErrors.classroomId = 'Kelas wajib dipilih'
    return
  }
  if (!newSession.subjectId) {
    newSessionErrors.subjectId = 'Mata pelajaran wajib dipilih'
    return
  }

  creatingSession.value = true
  try {
    const res = await api.post('/sessions', {
      classroom_id: newSession.classroomId,
      subject_id: newSession.subjectId,
      session_date: newSession.date,
      session_number: newSession.sessionNumber,
      week_number: newSession.weekNumber || newSession.sessionNumber,
      topic: newSession.topic,
      activities: newSession.activities,
      notes: newSession.notes,
      status: newSession.status || 'in_progress',
    })
    showNewSessionModal.value = false
    newSession.topic = ''
    newSession.activities = ''
    newSession.notes = ''
    await loadSessions()
    // Automatically open attendance for the new session
    if (res.data.data) {
      openSession(res.data.data)
    }
  } catch (err: any) {
    const errs = err.response?.data?.errors
    if (errs?.classroom_id) newSessionErrors.classroomId = errs.classroom_id[0]
    else if (errs?.subject_id) newSessionErrors.subjectId = errs.subject_id[0]
    else createError.value = err.response?.data?.message || 'Gagal membuat pertemuan'
  } finally {
    creatingSession.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadClassrooms(), loadSubjects(), loadSessions()])
})
</script>
