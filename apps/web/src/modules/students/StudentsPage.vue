<template>
  <div class="space-y-6 animate-fade-in print:m-0 print:p-0">
    <!-- Header (Hidden on Print) -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4 justify-between print:hidden">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span>🎓</span> Data & Manajemen Akun Siswa
        </h1>
        <p class="text-slate-600 text-sm mt-1 font-medium">
          Kelola biodata, foto profil, dan kredensial akun login siswa untuk CBT, Ulangan Interaktif, dan Pembelajaran
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button @click="openPrintCardsModal" class="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition flex items-center gap-1.5">
          <span>🖨️</span>
          <span>Cetak Kartu Login</span>
        </button>
        <button @click="showImportModal = true" class="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition flex items-center gap-1.5">
          <svg class="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
          </svg>
          <span>Import Excel</span>
        </button>
        <button @click="showAddModal = true" class="px-4 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#082231] text-white font-bold text-xs shadow-md transition flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span>Tambah Siswa</span>
        </button>
      </div>
    </div>

    <!-- Stats (Hidden on Print) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 print:hidden">
      <!-- Card 1: Total Siswa (Deep Petrol) -->
      <div class="card-stat-petrol group">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-300">Total Siswa Terdaftar</span>
            <div class="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-base shadow-inner">
              🎓
            </div>
          </div>
          <div class="mt-3">
            <div class="text-3xl font-black text-white tracking-tight leading-none">{{ stats.total }}</div>
            <p class="text-[11px] text-slate-300 font-medium mt-1">Terdata di SMPN 6 Kendari</p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300/90 group-hover:text-white transition">
          <span>Semua rombongan belajar</span>
          <span class="font-bold transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>

      <!-- Card 2: Akun Login Aktif (Warm Honey Amber) -->
      <div class="card-stat-honey group">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-900/80">Akun Login Aktif</span>
            <div class="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center text-slate-950 text-base shadow-inner">
              ⚡
            </div>
          </div>
          <div class="mt-3">
            <div class="text-3xl font-black text-slate-950 tracking-tight leading-none">{{ stats.active }}</div>
            <p class="text-[11px] text-slate-900/80 font-semibold mt-1">Siap CBT & Ulangan Boss</p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-xs text-slate-900/80 group-hover:text-slate-950 font-bold transition">
          <span>Status akses login aktif</span>
          <span class="font-black transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>

      <!-- Card 3: Rombongan Belajar (Deep Petrol) -->
      <div class="card-stat-petrol group">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-300">Rombongan Belajar</span>
            <div class="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-base shadow-inner">
              🏫
            </div>
          </div>
          <div class="mt-3">
            <div class="text-3xl font-black text-white tracking-tight leading-none">{{ classrooms.length || stats.classrooms }}</div>
            <p class="text-[11px] text-slate-300 font-medium mt-1">Kelas 7, 8, dan 9</p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300/90 group-hover:text-white transition">
          <RouterLink to="/classes" class="flex items-center justify-between w-full">
            <span>Lihat manajemen rombel</span>
            <span class="font-bold transition-transform group-hover:translate-x-1">→</span>
          </RouterLink>
        </div>
      </div>

      <!-- Card 4: Akun Dinonaktifkan (Dark Slate) -->
      <div class="card-stat-dark group">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-300">Akun Dinonaktifkan</span>
            <div class="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-base shadow-inner">
              🔒
            </div>
          </div>
          <div class="mt-3">
            <div class="text-3xl font-black text-white tracking-tight leading-none">{{ stats.inactive }}</div>
            <p class="text-[11px] text-slate-300 font-medium mt-1">Perlu reset / verifikasi</p>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300/90 group-hover:text-white transition">
          <span>Filter akun nonaktif</span>
          <span class="font-bold transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </div>

    <!-- Filter & Search (Hidden on Print) -->
    <div class="bg-white rounded-[24px] shadow-card border border-slate-200/60 p-4 sm:p-5 print:hidden">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <div class="relative">
            <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input v-model="search" type="text" class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition" placeholder="Cari nama, NIS, NISN, atau username..." @input="debouncedSearch" />
          </div>
        </div>
        <select v-model="filter.classroom" class="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 w-full sm:w-44 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition" @change="loadStudents">
          <option value="">Semua Kelas</option>
          <option v-for="cls in classrooms" :key="cls.id" :value="cls.id">Kelas {{ cls.name }}</option>
        </select>
        <select v-model="filter.status" class="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 w-full sm:w-36 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition" @change="loadStudents">
          <option value="">Semua Status</option>
          <option value="active">Akun Aktif</option>
          <option value="inactive">Akun Nonaktif</option>
        </select>
        <button @click="exportStudents" class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex-shrink-0 flex items-center gap-1.5 shadow-xs">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          <span>Export CSV</span>
        </button>
      </div>
    </div>

    <!-- Students table (Hidden on Print) -->
    <div class="bg-white rounded-[24px] shadow-card border border-slate-200/60 p-0 overflow-hidden print:hidden">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="p-8">
        <div class="space-y-4">
          <div v-for="i in 5" :key="i" class="animate-pulse flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-surface-200"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-surface-200 rounded w-1/3"></div>
              <div class="h-3 bg-surface-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="students.length === 0" class="p-12">
        <div class="empty-state">
          <div class="text-4xl mb-2">🎓</div>
          <p class="text-surface-700 font-bold">Belum ada data siswa</p>
          <p class="text-surface-500 text-xs mt-1 max-w-sm mx-auto">
            Tambahkan peserta didik baru secara manual atau import dari berkas Excel/CSV untuk mulai mengelola akun login siswa.
          </p>
          <div class="flex gap-2 mt-4 justify-center">
            <button @click="showImportModal = true" class="btn-secondary text-xs">Import Excel</button>
            <button @click="showAddModal = true" class="btn-primary text-xs">Tambah Siswa Baru</button>
          </div>
        </div>
      </div>

      <template v-else>
        <!-- Bulk Actions Bar -->
        <div v-if="selectedIds.length > 0" class="bg-primary-50/80 border-b border-primary-200 p-3 px-6 flex flex-wrap items-center justify-between gap-3 animate-fade-in text-xs">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-primary-600 animate-pulse"></span>
            <p class="font-bold text-primary-900">
              {{ selectedIds.length }} siswa dipilih
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button @click="openPrintCardsForSelected" class="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 border-primary-300 text-primary-800 bg-white shadow-xs">
              <span>🖨️</span> Cetak Kartu Akun ({{ selectedIds.length }})
            </button>
            <button @click="confirmBulkResetPassword" class="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 bg-white shadow-xs">
              <span>🔑</span> Reset Password
            </button>
            <button @click="confirmBulkDelete" class="btn text-xs py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 shadow-sm">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Hapus ({{ selectedIds.length }})
            </button>
            <button @click="selectedIds = []" class="text-xs text-surface-500 hover:text-surface-700 px-2 py-1">
              Batal
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="table text-xs">
            <thead>
              <tr>
                <th class="w-8"><input type="checkbox" v-model="selectAll" class="rounded border-surface-300 text-primary-600" /></th>
                <th>Siswa</th>
                <th>NIS / NISN</th>
                <th>Kelas</th>
                <th>Akun Login Siswa</th>
                <th>Status Akun</th>
                <th class="text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-100">
              <tr v-for="student in students" :key="student.id" class="hover:bg-surface-50 transition">
                <td><input type="checkbox" v-model="selectedIds" :value="student.id" class="rounded border-surface-300 text-primary-600" /></td>
                <td>
                  <div class="flex items-center gap-3">
                    <div class="avatar w-8 h-8 text-xs font-bold flex-shrink-0 bg-primary-100 text-primary-700 overflow-hidden rounded-full ring-1 ring-slate-200">
                      <img
                        v-if="student.avatar_url || student.avatar_path"
                        :src="student.avatar_url || student.avatar_path"
                        class="w-full h-full object-cover"
                        alt="Foto"
                      />
                      <span v-else>{{ getInitials(student.name) }}</span>
                    </div>
                    <div>
                      <p class="font-bold text-surface-900 leading-tight">{{ student.name }}</p>
                      <p class="text-[11px] text-surface-400 mt-0.5">{{ student.gender === 'L' ? '♂ Laki-laki' : '♀ Perempuan' }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <p class="font-mono font-bold text-surface-800">{{ student.nis }}</p>
                  <p class="text-[10px] text-surface-400 font-mono">NISN: {{ student.nisn || '—' }}</p>
                </td>
                <td>
                  <span class="badge badge-primary text-[10px] font-semibold">Kelas {{ getStudentClassName(student) }}</span>
                </td>

                <!-- Kolom Kredensial Akun Login Siswa -->
                <td>
                  <div class="space-y-1">
                    <div class="flex items-center gap-1.5">
                      <span class="text-[10px] text-surface-500 font-medium">User:</span>
                      <span class="font-mono font-bold text-[11px] bg-surface-100 text-surface-800 px-1.5 py-0.5 rounded border border-surface-200">
                        {{ student.username || student.nis }}
                      </span>
                      <button
                        @click="copyStudentCredentials(student)"
                        class="text-[11px] text-primary-600 hover:text-primary-800 p-0.5 rounded hover:bg-primary-50"
                        title="Salin Username & Password"
                      >
                        📋
                      </button>
                    </div>

                    <div class="flex items-center gap-1.5">
                      <span class="text-[10px] text-surface-500 font-medium">Pass:</span>
                      <span v-if="revealedPasswords[student.id]" class="font-mono font-bold text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {{ student.password || student.nis || 'password' }}
                      </span>
                      <span v-else class="font-mono text-[11px] text-surface-400">
                        ••••••••
                      </span>
                      <button
                        @click="toggleRevealPassword(student.id)"
                        class="text-[11px] text-surface-400 hover:text-surface-700 p-0.5"
                        :title="revealedPasswords[student.id] ? 'Sembunyikan password' : 'Lihat password'"
                      >
                        {{ revealedPasswords[student.id] ? '🙈' : '👁️' }}
                      </button>
                    </div>
                  </div>
                </td>

                <!-- Status Akun Login (Toggle Active) -->
                <td>
                  <button
                    @click="toggleStudentAccountStatus(student)"
                    class="badge cursor-pointer transition select-none flex items-center gap-1 text-[10px] font-bold"
                    :class="student.is_active !== false && student.status !== 'inactive' 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200' 
                      : 'bg-rose-100 text-rose-800 border border-rose-200 hover:bg-rose-200'"
                    :title="student.is_active !== false && student.status !== 'inactive' ? 'Klik untuk nonaktifkan login siswa' : 'Klik untuk aktifkan akun login siswa'"
                  >
                    <span>{{ student.is_active !== false && student.status !== 'inactive' ? '🟢 Aktif' : '🔴 Nonaktif' }}</span>
                  </button>
                </td>

                <!-- Aksi Manajemen -->
                <td class="text-right">
                  <div class="flex items-center justify-end gap-1">
                    <!-- Tombol Kelola Akun Siswa -->
                    <button
                      @click="openAccountModal(student)"
                      class="btn-icon btn-ghost text-amber-600 hover:bg-amber-50"
                      title="Kelola Akun Login & Password Siswa"
                    >
                      <span class="text-sm">🔑</span>
                    </button>
                    <!-- Detail Siswa -->
                    <RouterLink :to="`/students/${student.id}`" class="btn-icon btn-ghost text-surface-400 hover:text-primary-600" title="Detail Profil Siswa">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </RouterLink>
                    <!-- Edit Siswa -->
                    <button @click="editStudent(student)" class="btn-icon btn-ghost text-surface-400 hover:text-primary-600" title="Edit Data Siswa">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <!-- Hapus Siswa -->
                    <button @click="confirmDeleteStudent(student)" class="btn-icon btn-ghost text-surface-400 hover:text-rose-600 hover:bg-rose-50" title="Hapus Siswa">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="px-6 py-4 border-t border-surface-100 flex items-center justify-between text-xs">
            <p class="text-surface-500">Menampilkan {{ students.length }} dari {{ meta.total }} siswa</p>
            <div class="flex gap-1">
              <button @click="meta.currentPage--; loadStudents()" class="btn-secondary btn-sm" :disabled="meta.currentPage <= 1">←</button>
              <span class="px-3 py-1 text-xs bg-primary-50 rounded-lg font-bold text-primary-700">{{ meta.currentPage }}</span>
              <button @click="meta.currentPage++; loadStudents()" class="btn-secondary btn-sm" :disabled="meta.currentPage >= meta.lastPage">→</button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- MODAL KELOLA AKUN LOGIN SISWA -->
    <Teleport to="body">
      <div v-if="showAccountModal && accountTargetStudent" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeAccountModal"></div>
        <div class="relative bg-white rounded-3xl shadow-modal w-full max-w-md overflow-hidden animate-scale-up">
          <div class="p-5 border-b border-surface-100 bg-surface-50 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="text-xl">🔑</span>
              <div>
                <h3 class="font-bold text-surface-900 text-sm">Manajemen Akun Login Siswa</h3>
                <p class="text-[11px] text-surface-500">{{ accountTargetStudent.name }} &bull; Kelas {{ getStudentClassName(accountTargetStudent) }}</p>
              </div>
            </div>
            <button @click="closeAccountModal" class="text-surface-400 hover:text-surface-700 p-1">✕</button>
          </div>

          <div class="p-6 space-y-4 text-xs">
            <!-- Username Field -->
            <div>
              <label class="label text-[11px]">Username Login Siswa</label>
              <input
                v-model="accountForm.username"
                type="text"
                class="input text-xs font-mono font-bold"
                placeholder="Nomor NIS atau username siswa"
              />
              <p class="text-[10px] text-surface-400 mt-1">Siswa menggunakan username ini untuk masuk di halaman Login.</p>
            </div>

            <!-- Password Field -->
            <div>
              <label class="label text-[11px]">Kata Sandi (Password) Baru</label>
              <div class="flex gap-1.5">
                <input
                  v-model="accountForm.password"
                  :type="showAccountModalPassword ? 'text' : 'password'"
                  class="input text-xs font-mono font-bold flex-1"
                  placeholder="Masukkan password baru"
                />
                <button
                  type="button"
                  @click="showAccountModalPassword = !showAccountModalPassword"
                  class="btn btn-secondary text-xs px-2.5"
                  title="Lihat / Sembunyikan"
                >
                  {{ showAccountModalPassword ? '🙈' : '👁️' }}
                </button>
                <button
                  type="button"
                  @click="accountForm.password = generateRandomPasswordString()"
                  class="btn btn-secondary text-xs px-2.5 whitespace-nowrap"
                  title="Acak password"
                >
                  🎲 Acak
                </button>
              </div>
              <div class="flex gap-2 mt-1.5">
                <button
                  type="button"
                  @click="accountForm.password = accountTargetStudent.nis || '123456'"
                  class="text-[10px] text-primary-600 hover:underline"
                >
                  Set sama dengan NIS ({{ accountTargetStudent.nis }})
                </button>
                <span class="text-surface-300">&bull;</span>
                <button
                  type="button"
                  @click="accountForm.password = 'password'"
                  class="text-[10px] text-primary-600 hover:underline"
                >
                  Set 'password'
                </button>
              </div>
            </div>

            <!-- Status Akun -->
            <div class="p-3 rounded-xl border border-surface-200 bg-surface-50 flex items-center justify-between">
              <div>
                <span class="font-bold text-surface-900 block text-xs">Izin Akses Login Siswa</span>
                <span class="text-[11px] text-surface-500">
                  {{ accountForm.is_active ? 'Siswa dapat login ke sistem CBT dan LMS' : 'Akun dibekukan / tidak dapat login' }}
                </span>
              </div>
              <input
                type="checkbox"
                v-model="accountForm.is_active"
                class="rounded text-primary-600 w-4 h-4 cursor-pointer"
              />
            </div>

            <!-- Action Copy -->
            <button
              type="button"
              @click="copyStudentCredentials({ ...accountTargetStudent, username: accountForm.username, password: accountForm.password })"
              class="w-full btn btn-secondary text-xs py-2 flex items-center justify-center gap-1.5 text-primary-700 bg-primary-50/50"
            >
              <span>📋 Salin Kredensial (Username & Password)</span>
            </button>
          </div>

          <div class="p-4 border-t border-surface-100 flex justify-end gap-2 bg-surface-50">
            <button @click="closeAccountModal" class="btn-secondary text-xs px-4 py-2">Batal</button>
            <button
              @click="saveStudentAccount"
              :disabled="savingAccount"
              class="btn-primary text-xs px-5 py-2 font-bold shadow-sm flex items-center gap-1.5"
            >
              <span v-if="savingAccount" class="spinner w-3.5 h-3.5"></span>
              <span>Simpan Perubahan Akun</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Add/Edit Modal Siswa Lengkap -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeAddModal"></div>
        <div class="relative bg-white rounded-3xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-surface-100 sticky top-0 bg-white z-10 flex items-center justify-between">
            <h2 class="text-base font-bold text-surface-900">
              {{ editingStudent ? '✏️ Edit Data & Akun Siswa' : '➕ Tambah Peserta Didik Baru' }}
            </h2>
            <button @click="closeAddModal" class="text-surface-400 hover:text-surface-700">✕</button>
          </div>
          
          <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div class="sm:col-span-2">
              <label class="label">Nama Lengkap Siswa <span class="text-red-500">*</span></label>
              <input v-model="form.name" type="text" class="input text-xs font-semibold" :class="{'input-error': formErrors.name}" placeholder="Misal: Ahmad Fadhil Prasetyo" />
              <p v-if="formErrors.name" class="error-msg">{{ formErrors.name }}</p>
            </div>

            <div>
              <label class="label">NIS (Nomor Induk Sekolah) <span class="text-red-500">*</span></label>
              <input v-model="form.nis" type="text" class="input text-xs font-mono" :class="{'input-error': formErrors.nis}" placeholder="Misal: 24001" @input="onNisInput" />
              <p v-if="formErrors.nis" class="error-msg">{{ formErrors.nis }}</p>
            </div>

            <div>
              <label class="label">NISN (Nomor Induk Siswa Nasional)</label>
              <input v-model="form.nisn" type="text" class="input text-xs font-mono" placeholder="Misal: 0089123401" />
            </div>

            <div>
              <label class="label">Rombongan Belajar (Kelas) <span class="text-red-500">*</span></label>
              <select v-model="form.classroom_id" class="input text-xs font-bold">
                <option value="">Pilih kelas...</option>
                <option v-for="cls in classrooms" :key="cls.id" :value="cls.id">Kelas {{ cls.name }}</option>
              </select>
            </div>

            <div>
              <label class="label">Jenis Kelamin</label>
              <select v-model="form.gender" class="input text-xs">
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            <!-- SECTION KREDENSIAL AKUN LOGIN SISWA -->
            <div class="sm:col-span-2 p-4 rounded-2xl bg-primary-50/60 border border-primary-200 space-y-3">
              <div class="flex items-center justify-between pb-1 border-b border-primary-100">
                <span class="font-bold text-surface-900 flex items-center gap-1.5 text-xs">
                  <span>🔐</span> Akun Login Siswa (Portal CBT & LMS)
                </span>
                <span class="text-[10px] text-primary-700 font-semibold bg-white px-2 py-0.5 rounded border border-primary-200">
                  Digunakan siswa untuk login
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="label text-[11px]">Username Login</label>
                  <input
                    v-model="form.username"
                    type="text"
                    class="input text-xs font-mono font-bold bg-white"
                    placeholder="Username siswa"
                  />
                  <p class="text-[10px] text-surface-500 mt-1">Default otomatis sama dengan nomor NIS</p>
                </div>

                <div>
                  <label class="label text-[11px]">Kata Sandi (Password)</label>
                  <div class="flex gap-1.5">
                    <input
                      v-model="form.password"
                      :type="showFormPassword ? 'text' : 'password'"
                      class="input text-xs font-mono font-bold bg-white flex-1"
                      placeholder="Password login siswa"
                    />
                    <button
                      type="button"
                      @click="showFormPassword = !showFormPassword"
                      class="btn btn-secondary text-xs px-2.5"
                    >
                      {{ showFormPassword ? '🙈' : '👁️' }}
                    </button>
                    <button
                      type="button"
                      @click="form.password = generateRandomPasswordString()"
                      class="btn btn-secondary text-xs px-2.5 whitespace-nowrap"
                    >
                      🎲 Acak
                    </button>
                  </div>
                  <p class="text-[10px] text-surface-500 mt-1">Kata sandi yang dibagikan kepada siswa</p>
                </div>
              </div>

              <label class="flex items-center gap-2 cursor-pointer select-none pt-1">
                <input type="checkbox" v-model="form.is_active" class="rounded text-primary-600 w-4 h-4 cursor-pointer" />
                <span class="font-bold text-surface-800 text-[11px]">Status Akun Aktif (Dapat Login ke Aplikasi)</span>
              </label>
            </div>

            <!-- Biodata Tambahan -->
            <div>
              <label class="label">Email Siswa (Opsional)</label>
              <input v-model="form.email" type="email" class="input text-xs" placeholder="email.siswa@sekolah.sch.id" />
            </div>

            <div>
              <label class="label">Nomor HP / WhatsApp Siswa</label>
              <input v-model="form.phone" type="text" class="input text-xs" placeholder="08xxxxxxxxxx" />
            </div>

            <div>
              <label class="label">Tempat Lahir</label>
              <input v-model="form.birth_place" type="text" class="input text-xs" placeholder="Kota kelahiran" />
            </div>

            <div>
              <label class="label">Tanggal Lahir</label>
              <input v-model="form.birth_date" type="date" class="input text-xs" />
            </div>

            <div>
              <label class="label">Nama Orang Tua / Wali</label>
              <input v-model="form.parent_name" type="text" class="input text-xs" placeholder="Nama ayah/ibu/wali" />
            </div>

            <div>
              <label class="label">No. HP Orang Tua</label>
              <input v-model="form.parent_phone" type="text" class="input text-xs" placeholder="08xxxxxxxxxx" />
            </div>

            <div class="sm:col-span-2">
              <label class="label">Alamat Tinggal</label>
              <textarea v-model="form.address" class="input text-xs" rows="2" placeholder="Alamat tempat tinggal siswa..."></textarea>
            </div>
          </div>

          <div class="p-6 border-t border-surface-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
            <button @click="closeAddModal" class="btn-secondary text-xs px-4 py-2">Batal</button>
            <button @click="saveStudent" class="btn-primary text-xs px-5 py-2 font-bold shadow-sm" :disabled="saving">
              <svg v-if="saving" class="spinner w-3.5 h-3.5 mr-1" viewBox="0 0 24 24"></svg>
              <span>{{ editingStudent ? 'Simpan Perubahan' : 'Tambahkan Siswa & Buat Akun' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL CETAK KARTU LOGIN SISWA (PRINTABLE) -->
    <Teleport to="body">
      <div v-if="showPrintCardsModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <div class="bg-white rounded-3xl shadow-2xl border border-surface-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up print:fixed print:inset-0 print:w-full print:max-w-none print:max-h-none print:rounded-none print:shadow-none print:border-none">
          <!-- Header Modal (Hidden on Print) -->
          <div class="p-4 sm:px-6 border-b border-surface-200 bg-surface-50 flex items-center justify-between gap-4 print:hidden">
            <div class="flex items-center gap-3">
              <span class="text-2xl">🖨️</span>
              <div>
                <h3 class="font-bold text-surface-900 text-sm sm:text-base">Pratinjau Kartu Akun Login Siswa</h3>
                <p class="text-xs text-surface-500">
                  Kartu ini dapat dicetak dan dibagikan kepada peserta didik untuk login ke portal Ujian CBT & Pembelajaran.
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button @click="triggerPrint" class="btn btn-primary text-xs px-4 py-2 font-bold shadow-sm flex items-center gap-1.5">
                <span>🖨️ Cetak / Print Kartu Sekarang</span>
              </button>
              <button @click="showPrintCardsModal = false" class="btn btn-secondary text-xs px-3 py-2">
                Tutup
              </button>
            </div>
          </div>

          <!-- Cards Preview Container (Print Target) -->
          <div class="flex-1 overflow-y-auto p-6 bg-slate-100 print:bg-white print:p-0">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
              <div
                v-for="s in printList"
                :key="s.id"
                class="bg-white rounded-2xl p-4 border-2 border-dashed border-slate-300 shadow-sm print:shadow-none print:border-slate-800 space-y-3 relative overflow-hidden"
              >
                <!-- Watermark / Logo background -->
                <div class="flex items-center justify-between border-b pb-2.5 border-slate-200">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-primary-700 text-white font-black flex items-center justify-center text-xs">
                      AGD
                    </div>
                    <div>
                      <h4 class="font-black text-xs text-slate-900 leading-tight">SMP NEGERI 6 KENDARI</h4>
                      <p class="text-[9px] text-slate-500 font-bold uppercase tracking-wider">KARTU LOGIN AKUN PESERTA DIDIK</p>
                    </div>
                  </div>
                  <span class="badge text-[9px] font-bold bg-primary-100 text-primary-800">
                    Kelas {{ getStudentClassName(s) }}
                  </span>
                </div>

                <!-- Biodata Siswa -->
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {{ getInitials(s.name) }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-extrabold text-xs text-slate-900 truncate">{{ s.name }}</p>
                    <p class="text-[10px] text-slate-500">
                      NIS: <strong class="text-slate-700">{{ s.nis }}</strong> &bull; NISN: {{ s.nisn || '—' }}
                    </p>
                  </div>
                </div>

                <!-- Box Kredensial Login -->
                <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span class="text-[9px] text-slate-400 font-bold uppercase block">Username Login</span>
                    <span class="font-mono font-black text-slate-900 text-xs tracking-wider">
                      {{ s.username || s.nis }}
                    </span>
                  </div>
                  <div>
                    <span class="text-[9px] text-slate-400 font-bold uppercase block">Password</span>
                    <span class="font-mono font-black text-primary-700 text-xs tracking-wider">
                      {{ s.password || s.nis || 'password' }}
                    </span>
                  </div>
                </div>

                <!-- Footer Petunjuk Login -->
                <div class="pt-1 flex items-center justify-between text-[9px] text-slate-400">
                  <span>Portal Siswa: <strong class="text-slate-600">Aplikasi Belajarena LMS</strong></span>
                  <span>Jaga kerahasiaan kata sandi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Import Modal -->
    <Teleport to="body">
      <div v-if="showImportModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showImportModal = false"></div>
        <div class="relative bg-white rounded-3xl shadow-modal w-full max-w-lg overflow-hidden animate-scale-up">
          <div class="p-6 border-b border-surface-100 flex items-center justify-between">
            <div>
              <h2 class="text-base font-bold text-surface-900">Import Data & Akun Siswa</h2>
              <p class="text-xs text-surface-500 mt-0.5">Upload file Excel/CSV untuk mendaftarkan siswa sekaligus membuat akun</p>
            </div>
            <button @click="showImportModal = false" class="text-surface-400 hover:text-surface-700">✕</button>
          </div>
          
          <div class="p-6 space-y-4 text-xs">
            <div class="border-2 border-dashed border-surface-200 rounded-2xl p-6 text-center hover:border-primary-300 transition-colors"
              @dragover.prevent @drop.prevent="handleFileDrop"
            >
              <div class="text-3xl mb-2">📊</div>
              <p class="text-surface-700 font-semibold">Tarik & lepas file di sini</p>
              <p class="text-surface-400 text-[11px] mt-0.5">atau klik tombol di bawah</p>
              <label class="btn-primary mt-3 inline-block cursor-pointer text-xs py-1.5 px-4 font-bold">
                Pilih File Excel / CSV
                <input type="file" accept=".xlsx,.xls,.csv" class="hidden" @change="handleFileSelect" />
              </label>
              <p class="text-[10px] text-surface-400 mt-2">Mendukung format .xlsx, .xls, .csv</p>
            </div>

            <div v-if="importFile" class="flex items-center gap-3 p-3 rounded-xl bg-primary-50 border border-primary-200">
              <span class="text-xl">📄</span>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-bold text-primary-900 truncate">{{ importFile.name }}</p>
                <p class="text-[10px] text-primary-600">{{ (importFile.size / 1024).toFixed(1) }} KB</p>
              </div>
              <button @click="importFile = null" class="text-primary-500 hover:text-primary-800 font-bold">✕</button>
            </div>

            <div class="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-200">
              <div>
                <p class="font-bold text-surface-800">Template Format Siswa</p>
                <p class="text-[10px] text-surface-400">Download contoh kolom data siswa siap isi</p>
              </div>
              <button @click="downloadTemplate" class="btn btn-secondary text-xs px-3 py-1.5 font-bold">
                ⬇️ Unduh Template
              </button>
            </div>
          </div>

          <div class="p-4 border-t border-surface-100 flex justify-end gap-2 bg-surface-50">
            <button @click="showImportModal = false" class="btn-secondary text-xs px-4 py-2">Batal</button>
            <button @click="importStudents" class="btn-primary text-xs px-5 py-2 font-bold shadow-sm" :disabled="!importFile || importing">
              <span v-if="importing" class="spinner w-3.5 h-3.5 mr-1"></span>
              <span>{{ importing ? 'Mengimpor...' : 'Mulai Import Siswa' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showDeleteModal = false"></div>
        <div class="relative bg-white rounded-3xl shadow-modal w-full max-w-sm p-6 space-y-4 text-center">
          <div class="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl mx-auto">
            🗑️
          </div>
          <div>
            <h3 class="font-bold text-surface-900 text-sm">
              {{ studentToDelete ? 'Hapus Data Siswa?' : `Hapus ${selectedIds.length} Siswa Terpilih?` }}
            </h3>
            <p class="text-xs text-surface-500 mt-1 leading-relaxed">
              <span v-if="studentToDelete">
                Apakah Anda yakin ingin menghapus data siswa <strong class="text-surface-800">{{ studentToDelete.name }}</strong>?
              </span>
              <span v-else>
                Apakah Anda yakin ingin menghapus {{ selectedIds.length }} siswa terpilih beserta akun login mereka?
              </span>
            </p>
          </div>
          <div class="flex gap-2">
            <button @click="showDeleteModal = false" class="btn-secondary flex-1 text-xs py-2">Batal</button>
            <button @click="executeDelete" class="btn bg-rose-600 hover:bg-rose-700 text-white font-bold flex-1 text-xs py-2" :disabled="deleting">
              {{ deleting ? 'Menghapus...' : 'Ya, Hapus' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/services/api'

interface Student {
  id: string
  name: string
  email: string
  nis: string
  nisn?: string
  username?: string
  password?: string
  gender: 'L' | 'P'
  birth_date?: string
  birth_place?: string
  classroom_name?: string
  classroom_id?: string
  status: string
  is_active: boolean
  parent_name?: string
  parent_phone?: string
  phone?: string
  address?: string
  avatar_url?: string
  avatar_path?: string
}

const loading = ref(false)
const saving = ref(false)
const importing = ref(false)
const deleting = ref(false)

const showAddModal = ref(false)
const showImportModal = ref(false)
const showDeleteModal = ref(false)
const showAccountModal = ref(false)
const showPrintCardsModal = ref(false)

const studentToDelete = ref<Student | null>(null)
const editingStudent = ref<Student | null>(null)
const accountTargetStudent = ref<Student | null>(null)
const savingAccount = ref(false)

const showFormPassword = ref(false)
const showAccountModalPassword = ref(false)
const revealedPasswords = reactive<Record<string, boolean>>({})

const students = ref<Student[]>([])
const classrooms = ref<any[]>([])
const selectedIds = ref<string[]>([])
const importFile = ref<File | null>(null)
const search = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

const stats = ref({ total: 0, active: 0, inactive: 0, classrooms: 0 })
const meta = reactive({ currentPage: 1, lastPage: 1, total: 0 })
const filter = reactive({ classroom: '', status: '' })

// Form Add / Edit
const form = reactive({
  name: '',
  email: '',
  nis: '',
  nisn: '',
  username: '',
  password: '',
  is_active: true,
  gender: 'L',
  birth_date: '',
  birth_place: '',
  classroom_id: '',
  address: '',
  parent_name: '',
  parent_phone: '',
  phone: ''
})

const formErrors = reactive({ name: '', nis: '' })

// Account modal form
const accountForm = reactive({
  username: '',
  password: '',
  is_active: true
})

const selectAll = computed({
  get: () => selectedIds.value.length === students.value.length && students.value.length > 0,
  set: (val) => { selectedIds.value = val ? students.value.map(s => s.id) : [] }
})

// Daftar siswa yang akan dicetak pada kartu akun
const printList = computed(() => {
  if (selectedIds.value.length > 0) {
    return students.value.filter(s => selectedIds.value.includes(s.id))
  }
  return students.value
})

function getInitials(name: string): string {
  if (!name) return 'S'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

function getStudentClassName(s: any): string {
  if (!s) return '—'
  if (s.classroom_id) {
    const cls = classrooms.value.find(c => c.id === s.classroom_id)
    if (cls) return cls.name
  }
  return s.classroom_name || s.classroom || '—'
}

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { meta.currentPage = 1; loadStudents() }, 400)
}

function onNisInput() {
  if (!editingStudent.value && !form.username) {
    form.username = form.nis
  }
  if (!editingStudent.value && !form.password) {
    form.password = form.nis
  }
}

function generateRandomPasswordString(): string {
  const chars = '23456789abcdefghjkmnpqrstuvwxyz'
  let res = ''
  for (let i = 0; i < 6; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return res
}

function toggleRevealPassword(studentId: string) {
  revealedPasswords[studentId] = !revealedPasswords[studentId]
}

function copyStudentCredentials(s: any) {
  const user = s.username || s.nis
  const pass = s.password || s.nis || 'password'
  const text = `Akun Siswa: ${s.name}\nUsername: ${user}\nPassword: ${pass}\nPortal: http://localhost:5173/login`
  navigator.clipboard.writeText(text)
  alert(`✅ Kredensial akun ${s.name} berhasil disalin ke clipboard!`)
}

// Buka Modal Kelola Akun
function openAccountModal(student: Student) {
  accountTargetStudent.value = student
  accountForm.username = student.username || student.nis
  accountForm.password = student.password || student.nis || 'password'
  accountForm.is_active = student.is_active !== false && student.status !== 'inactive'
  showAccountModal.value = true
}

function closeAccountModal() {
  showAccountModal.value = false
  accountTargetStudent.value = null
}

async function saveStudentAccount() {
  if (!accountTargetStudent.value) return
  savingAccount.value = true
  try {
    const studentId = accountTargetStudent.value.id
    await api.put(`/students/${studentId}`, {
      username: accountForm.username,
      password: accountForm.password,
      is_active: accountForm.is_active,
      status: accountForm.is_active ? 'active' : 'inactive'
    })
    closeAccountModal()
    await loadStudents()
    alert('✅ Akun login siswa berhasil diperbarui!')
  } catch (err: any) {
    console.error('Gagal memperbarui akun siswa:', err)
    alert('Gagal memperbarui akun: ' + (err.response?.data?.message || err.message))
  } finally {
    savingAccount.value = false
  }
}

// Toggle Aktifkan/Nonaktifkan Akun Langsung dari Tabel
async function toggleStudentAccountStatus(student: Student) {
  const curActive = student.is_active !== false && student.status !== 'inactive'
  const actionName = curActive ? 'menonaktifkan' : 'mengaktifkan'
  if (!confirm(`Apakah Anda yakin ingin ${actionName} akun login siswa ${student.name}?`)) return

  try {
    await api.post(`/students/${student.id}/toggle-status`)
    await loadStudents()
  } catch (err: any) {
    console.error('Gagal mengubah status akun:', err)
  }
}

// Cetak Kartu Siswa
function openPrintCardsModal() {
  showPrintCardsModal.value = true
}

function openPrintCardsForSelected() {
  showPrintCardsModal.value = true
}

function triggerPrint() {
  window.print()
}

// Bulk Reset Password
async function confirmBulkResetPassword() {
  if (selectedIds.value.length === 0) return
  if (!confirm(`Reset kata sandi ${selectedIds.value.length} siswa yang dipilih ke nomor NIS masing-masing?`)) return

  try {
    await api.post('/students/batch-reset-password', { ids: selectedIds.value })
    alert(`✅ Kata sandi ${selectedIds.value.length} siswa berhasil direset ke nomor NIS masing-masing!`)
    await loadStudents()
  } catch (err: any) {
    alert('Gagal reset password massal.')
  }
}

function editStudent(student: Student) {
  editingStudent.value = student
  const matchedClass = classrooms.value.find(c => c.id === student.classroom_id || c.name === student.classroom_name)
  Object.assign(form, {
    name: student.name,
    email: student.email,
    nis: student.nis,
    nisn: student.nisn || '',
    username: student.username || student.nis,
    password: student.password || student.nis || 'password',
    is_active: student.is_active !== false && student.status !== 'inactive',
    gender: student.gender || 'L',
    birth_date: student.birth_date || '',
    birth_place: student.birth_place || '',
    classroom_id: matchedClass?.id || student.classroom_id || (classrooms.value.length > 0 ? classrooms.value[0].id : ''),
    address: student.address || '',
    parent_name: student.parent_name || '',
    parent_phone: student.parent_phone || '',
    phone: student.phone || ''
  })
  showAddModal.value = true
}

function closeAddModal() {
  showAddModal.value = false
  editingStudent.value = null
  Object.assign(form, {
    name: '', email: '', nis: '', nisn: '', username: '', password: '',
    is_active: true, gender: 'L', birth_date: '', birth_place: '',
    classroom_id: classrooms.value[0]?.id || '', address: '', parent_name: '', parent_phone: '', phone: ''
  })
  formErrors.name = ''
  formErrors.nis = ''
}

function handleFileDrop(e: DragEvent) {
  const file = e.dataTransfer?.files[0]
  if (file) importFile.value = file
}

function handleFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) importFile.value = file
}

function validateForm(): boolean {
  formErrors.name = ''
  formErrors.nis = ''
  let valid = true
  if (!form.name.trim()) { formErrors.name = 'Nama lengkap wajib diisi'; valid = false }
  if (!form.nis.trim()) { formErrors.nis = 'NIS wajib diisi'; valid = false }
  return valid
}

async function saveStudent() {
  if (!validateForm()) return
  saving.value = true
  try {
    const selectedClass = classrooms.value.find(c => c.id === form.classroom_id)
    const payload = {
      ...form,
      classroom_id: form.classroom_id,
      classroom_name: selectedClass?.name || '',
      classroom: selectedClass?.name || '',
      username: form.username || form.nis,
      password: form.password || form.nis || 'password',
      status: form.is_active ? 'active' : 'inactive'
    }

    if (editingStudent.value) {
      await api.put(`/students/${editingStudent.value.id}`, payload)
    } else {
      await api.post('/students', payload)
    }
    closeAddModal()
    await loadStudents()
    alert('✅ Data dan akun siswa berhasil disimpan!')
  } catch (err: any) {
    const errors = err.response?.data?.errors || {}
    if (errors.name) formErrors.name = errors.name[0]
    if (errors.nis) formErrors.nis = errors.nis[0]
  } finally {
    saving.value = false
  }
}

function confirmDeleteStudent(student: Student) {
  studentToDelete.value = student
  showDeleteModal.value = true
}

function confirmBulkDelete() {
  studentToDelete.value = null
  showDeleteModal.value = true
}

async function executeDelete() {
  deleting.value = true
  try {
    if (studentToDelete.value) {
      await api.delete(`/students/${studentToDelete.value.id}`)
    } else if (selectedIds.value.length > 0) {
      await api.post('/students/batch-delete', { ids: selectedIds.value })
      selectedIds.value = []
    }
    showDeleteModal.value = false
    studentToDelete.value = null
    await loadStudents()
  } catch (err: any) {
    console.error('Delete student failed:', err)
    alert('Gagal menghapus siswa: ' + (err.response?.data?.message || err.message))
  } finally {
    deleting.value = false
  }
}

function downloadTemplate() {
  const headers = ['Nama Lengkap', 'NIS', 'NISN', 'Jenis Kelamin (L/P)', 'Kelas', 'Username', 'Password', 'Tanggal Lahir', 'Tempat Lahir', 'Nama Orang Tua', 'No HP Orang Tua', 'Alamat']
  const sampleRows = [
    ['Ahmad Fadhil Prasetyo', '24001', '0089123401', 'L', 'VII A', '24001', 'password', '2011-05-12', 'Kendari', 'H. Bambang', '081234567890', 'Jl. Bunga Melati No. 12'],
    ['Alya Putri Salsabila', '24002', '0089123402', 'P', 'VII A', '24002', 'password', '2011-08-20', 'Kendari', 'Ir. Hendra', '081298765432', 'Jl. Lawata No. 5']
  ]
  const csvRows = [headers.join(','), ...sampleRows.map(r => r.map(c => `"${c}"`).join(','))]
  const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'Template_Data_dan_Akun_Siswa.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function importStudents() {
  if (!importFile.value) return
  importing.value = true

  try {
    const file = importFile.value
    if (file.name.endsWith('.csv') || file.type.includes('csv') || file.type.includes('text')) {
      const text = await file.text()
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0)
      if (lines.length <= 1) {
        alert('File kosong atau hanya berisi judul kolom.')
        importing.value = false
        return
      }

      const parsedStudents: any[] = []
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]
        const delimiter = line.includes(';') && !line.includes(',') ? ';' : ','
        const cols = line.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''))
        const name = cols[0]
        if (!name) continue

        const nis = cols[1] || String(Date.now() + i).slice(-6)
        const nisn = cols[2] || ''
        const gender = (cols[3] || 'L').toUpperCase().startsWith('P') ? 'P' : 'L'
        const className = cols[4] || 'VII A'
        const username = cols[5] || nis
        const password = cols[6] || nis || '123456'
        const birthDate = cols[7] || ''
        const birthPlace = cols[8] || 'Kendari'
        const parentName = cols[9] || ''
        const parentPhone = cols[10] || ''
        const address = cols[11] || ''

        const matchedClass = classrooms.value.find(c => c.name.toLowerCase() === className.toLowerCase())

        parsedStudents.push({
          name, nis, nisn, gender, username, password,
          classroom_id: matchedClass?.id || classrooms.value[0]?.id || 'cls-7a',
          classroom_name: matchedClass?.name || className,
          birth_date: birthDate, birth_place: birthPlace,
          parent_name: parentName, parent_phone: parentPhone, phone: parentPhone,
          address, is_active: true, status: 'active'
        })
      }

      await api.post('/students/batch', { students: parsedStudents })
    } else {
      const fd = new FormData()
      fd.append('file', file)
      await api.post('/students/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    }

    showImportModal.value = false
    importFile.value = null
    await loadStudents()
    alert('✅ Import data dan akun siswa berhasil!')
  } catch (err: any) {
    console.error('Import failed:', err)
    alert('Import gagal. Pastikan format file sesuai template.')
  } finally {
    importing.value = false
  }
}

async function exportStudents() {
  try {
    const res = await api.get('/students/export', { params: filter, responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = `data-dan-akun-siswa-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (err) {
    alert('Export gagal.')
  }
}

async function loadClassrooms() {
  try {
    const res = await api.get('/classrooms', { params: { per_page: 100 } })
    classrooms.value = res.data.data || []
    if (classrooms.value.length > 0 && !form.classroom_id) {
      form.classroom_id = classrooms.value[0].id
    }
  } catch {
    classrooms.value = [{ id: 'cls-7a', name: 'VII A' }]
  }
}

async function loadStudents() {
  loading.value = true
  try {
    const res = await api.get('/students', {
      params: {
        search: search.value || undefined,
        classroom_id: filter.classroom || undefined,
        status: filter.status || undefined,
        page: meta.currentPage,
        per_page: 20,
      }
    })
    students.value = res.data.data || []
    meta.total = res.data.meta?.total || 0
    meta.lastPage = res.data.meta?.last_page || 1
    stats.value = res.data.stats || { total: meta.total, active: 0, inactive: 0, classrooms: 0 }
  } catch (err: any) {
    console.error('Failed to load students:', err.response?.data?.message)
    students.value = []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadClassrooms(), loadStudents()])
})
</script>
