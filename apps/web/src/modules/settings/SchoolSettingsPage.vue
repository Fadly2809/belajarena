<template>
  <div class="space-y-6 max-w-5xl">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span>🏛️</span> Identitas Sekolah & Kelengkapan Dokumen
        </h1>
        <p class="text-slate-600 text-sm mt-1 font-medium">
          Kelola profil sekolah dan data penandatangan resmi untuk keperluan kop soal asesmen CBT, kartu ujian, modul ajar, dan rekap penilaian Anda.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="saveSchoolSettings"
          :disabled="isSaving"
          class="px-4 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#082231] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
        >
          <span>💾</span> <span>{{ isSaving ? 'Menyimpan...' : 'Simpan Profil Dokumen' }}</span>
        </button>
      </div>
    </div>

    <!-- Alert status -->
    <div v-if="successMsg" class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span>✅</span>
        <span>{{ successMsg }}</span>
      </div>
      <button @click="successMsg = ''" class="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
    </div>

    <!-- Identitas Sekolah Aktif Card -->
    <div class="card space-y-4">
      <h2 class="font-bold text-surface-900 text-sm pb-2 border-b border-surface-100 flex items-center gap-2">
        <span>📋</span> Identitas Pokok Satuan Pendidikan (Kop Resmi Dokumen & Rapor)
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label class="label">Nama Satuan Pendidikan</label>
          <input v-model="school.name" type="text" class="input text-xs font-bold" required />
        </div>
        <div>
          <label class="label">Nomor Pokok Sekolah Nasional (NPSN)</label>
          <input v-model="school.npsn" type="text" class="input text-xs font-mono" required />
        </div>
        <div>
          <label class="label">Bentuk Pendidikan & Status</label>
          <input v-model="school.institution" type="text" class="input text-xs" />
        </div>
        <div>
          <label class="label">Status Akreditasi</label>
          <select v-model="school.accreditation" class="input text-xs font-semibold">
            <option value="A">Terakreditasi A (Unggul)</option>
            <option value="B">Terakreditasi B (Baik)</option>
            <option value="C">Terakreditasi C</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Alamat & Kontak Resmi -->
    <div class="card space-y-4">
      <h2 class="font-bold text-surface-900 text-sm pb-2 border-b border-surface-100 flex items-center gap-2">
        <span>📍</span> Alamat & Kontak Resmi Satuan Pendidikan
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div class="md:col-span-2">
          <label class="label">Alamat Jalan</label>
          <input v-model="school.address" type="text" class="input text-xs" required />
        </div>
        <div>
          <label class="label">Kota / Kabupaten</label>
          <input v-model="school.city" type="text" class="input text-xs" required />
        </div>
        <div>
          <label class="label">Provinsi</label>
          <input v-model="school.province" type="text" class="input text-xs" required />
        </div>
        <div>
          <label class="label">Nomor Telepon Kantor</label>
          <input v-model="school.phone" type="text" class="input text-xs font-mono" />
        </div>
        <div>
          <label class="label">Alamat Surel (Email Resmi)</label>
          <input v-model="school.email" type="email" class="input text-xs" required />
        </div>
      </div>
    </div>

    <!-- Kepala Sekolah & Pejabat Penandatangan -->
    <div class="card space-y-4">
      <h2 class="font-bold text-surface-900 text-sm pb-2 border-b border-surface-100 flex items-center gap-2">
        <span>✍️</span> Kepala Sekolah (Penandatangan Dokumen Resmi)
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label class="label">Nama Kepala Sekolah & Gelar</label>
          <input v-model="school.principalName" type="text" class="input text-xs font-bold" required />
        </div>
        <div>
          <label class="label">NIP Kepala Sekolah</label>
          <input v-model="school.principalNip" type="text" class="input text-xs font-mono" required />
        </div>
      </div>
    </div>

    <!-- Konfigurasi Kurikulum & Penilaian -->
    <div class="card space-y-4">
      <h2 class="font-bold text-surface-900 text-sm pb-2 border-b border-surface-100 flex items-center gap-2">
        <span>⚙️</span> Standar Penilaian & Kriteria Ketuntasan (KKTP)
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div>
          <label class="label">Kurikulum yang Berlaku</label>
          <select v-model="school.curriculum" class="input text-xs font-semibold">
            <option value="Kurikulum Merdeka">Kurikulum Merdeka (Fase D)</option>
            <option value="Kurikulum 2013">Kurikulum 2013 Revisi</option>
          </select>
        </div>
        <div>
          <label class="label">Kriteria Ketercapaian Minimum (KKTP)</label>
          <input v-model.number="school.kktp" type="number" min="50" max="90" class="input text-xs font-bold" />
        </div>
        <div>
          <label class="label">Tahun Pelajaran Berjalan</label>
          <input v-model="school.academicYear" type="text" class="input text-xs font-semibold" />
        </div>
      </div>
    </div>

    <!-- AKUN GURU & PENDIDIK TERDAFTAR -->
    <div class="card space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-surface-100">
        <div>
          <h2 class="font-bold text-surface-900 text-sm flex items-center gap-2">
            <span>👨‍🏫</span> Akun Pendidik & Pengelola ({{ school.name }})
          </h2>
          <p class="text-[11px] text-slate-500 mt-0.5">
            Daftarkan akun rekan guru agar dapat masuk, mengampu kelas, dan mengelola materi serta ulangan untuk sekolah ini.
          </p>
        </div>
        <button
          @click="showAddTeacherModal = true"
          class="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>➕</span> <span>Tambah Akun Guru</span>
        </button>
      </div>

      <div v-if="loadingTeachers" class="py-6 text-center text-xs text-slate-400">
        Memuat daftar guru...
      </div>
      <div v-else-if="teachersList.length === 0" class="py-6 text-center text-xs text-slate-500">
        Belum ada guru tambahan yang terdaftar.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
              <th class="py-2.5 px-3">Nama Lengkap & NIP</th>
              <th class="py-2.5 px-3">Email Login</th>
              <th class="py-2.5 px-3">Mata Pelajaran</th>
              <th class="py-2.5 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="t in teachersList" :key="t.id" class="hover:bg-slate-50/60 transition">
              <td class="py-3 px-3">
                <span class="font-bold text-slate-900 block">{{ t.name }}</span>
                <span class="text-[10px] text-slate-400 font-mono">{{ t.nip ? 'NIP: ' + t.nip : 'Non-NIP' }}</span>
              </td>
              <td class="py-3 px-3 font-mono text-slate-700">{{ t.email }}</td>
              <td class="py-3 px-3">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="sub in (t.subjects?.length ? t.subjects : (t.subject ? t.subject.split(', ') : ['Semua Mapel']))"
                    :key="sub"
                    class="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-semibold text-[11px]"
                  >
                    {{ sub }}
                  </span>
                </div>
              </td>
              <td class="py-3 px-3 text-right">
                <button
                  v-if="t.id !== authStore.user?.id"
                  @click="handleDeleteTeacher(t)"
                  class="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] transition"
                  title="Hapus akun guru"
                >
                  Hapus
                </button>
                <span v-else class="text-[10px] text-slate-400 font-semibold italic">Akun Anda</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL TAMBAH GURU BARU -->
    <div
      v-if="showAddTeacherModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="showAddTeacherModal = false"
    >
      <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto">
        <div class="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
          <div class="flex items-center gap-3">
            <span class="text-2xl">👨‍🏫</span>
            <div>
              <h3 class="text-base font-bold text-slate-900">Tambah Akun Guru Baru</h3>
              <p class="text-xs text-slate-500 mt-0.5">Untuk {{ school.name }}</p>
            </div>
          </div>
          <button @click="showAddTeacherModal = false" class="text-slate-400 hover:text-slate-600 text-sm">✕</button>
        </div>

        <form @submit.prevent="handleAddTeacher" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nama Lengkap Guru <span class="text-red-500">*</span></label>
            <input v-model="newTeacherForm.name" type="text" required class="input text-xs font-semibold" placeholder="Contoh: Siti Rahmawati, S.Pd." />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">NIP (Opsional)</label>
            <input v-model="newTeacherForm.nip" type="text" class="input text-xs font-mono" placeholder="1990xxxxxxxx" />
          </div>

          <!-- Pemilihan Mata Pelajaran (Dropdown Multi-Mapel) -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="block font-semibold text-slate-700">
                Mata Pelajaran yang Diampu <span class="text-red-500">*</span>
              </label>
              <button
                type="button"
                @click="addTeacherSubjectSlot"
                class="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <span>+ Tambah Mapel</span>
              </button>
            </div>

            <div class="space-y-2">
              <div
                v-for="(slot, idx) in teacherSubjectSlots"
                :key="idx"
                class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
              >
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-bold text-slate-400 w-5 text-center">#{{ idx + 1 }}</span>
                  <select
                    v-model="slot.selected"
                    required
                    class="input text-xs flex-1 bg-white font-medium"
                  >
                    <option value="" disabled>-- Pilih Mata Pelajaran --</option>
                    <option v-for="std in STANDARD_SUBJECTS" :key="std" :value="std">{{ std }}</option>
                    <option value="__CUSTOM__">Lainnya (Ketik Manual)...</option>
                  </select>
                  <button
                    v-if="teacherSubjectSlots.length > 1"
                    type="button"
                    @click="removeTeacherSubjectSlot(idx)"
                    class="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition shrink-0 cursor-pointer"
                    title="Hapus pilihan mapel ini"
                  >
                    ✕
                  </button>
                </div>

                <div v-if="slot.selected === '__CUSTOM__'" class="pl-7">
                  <input
                    v-model="slot.custom"
                    type="text"
                    required
                    class="input text-xs bg-white"
                    placeholder="Ketik nama mata pelajaran kustom/muatan lokal..."
                  />
                </div>
              </div>
            </div>
            <p class="text-[10px] text-slate-500">Pilih dari dropdown atau klik <strong>+ Tambah Mapel</strong> jika guru mengampu lebih dari 1 mata pelajaran.</p>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Email Guru (Untuk Login) <span class="text-red-500">*</span></label>
            <input v-model="newTeacherForm.email" type="email" required class="input text-xs" placeholder="siti.rahma@sekolah.sch.id" />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Kata Sandi Awal <span class="text-red-500">*</span></label>
            <input v-model="newTeacherForm.password" type="password" required minlength="6" class="input text-xs" placeholder="Minimal 6 karakter" />
          </div>

          <div class="pt-3 flex gap-2">
            <button
              type="button"
              @click="showAddTeacherModal = false"
              class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isAddingTeacher"
              class="flex-1 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#164255] text-white font-bold transition flex items-center justify-center gap-2"
            >
              <span>{{ isAddingTeacher ? 'Menyimpan...' : 'Daftarkan Guru' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const isSaving = ref(false)
const successMsg = ref('')

// Teacher Management State
const teachersList = ref<any[]>([])
const loadingTeachers = ref(false)
const showAddTeacherModal = ref(false)
const isAddingTeacher = ref(false)

const STANDARD_SUBJECTS = [
  'Matematika',
  'Informatika',
  'Koding dan Kecerdasan Artifisial (KKA)',
  'Ilmu Pengetahuan Alam (IPA)',
  'Ilmu Pengetahuan Sosial (IPS)',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Pendidikan Pancasila (PPKn)',
  'Pendidikan Agama & Budi Pekerti',
  'PJOK',
  'Seni Budaya',
  'Prakarya',
  'Bimbingan dan Konseling (BK)',
  'Bahasa Daerah / Muatan Lokal'
]

const teacherSubjectSlots = ref<Array<{ selected: string; custom: string }>>([
  { selected: 'Matematika', custom: '' }
])

function addTeacherSubjectSlot() {
  teacherSubjectSlots.value.push({ selected: '', custom: '' })
}

function removeTeacherSubjectSlot(index: number) {
  if (teacherSubjectSlots.value.length > 1) {
    teacherSubjectSlots.value.splice(index, 1)
  }
}

const newTeacherForm = ref({
  name: '',
  nip: '',
  subject: '',
  email: '',
  password: 'password123'
})

const school = ref({
  id: '',
  name: '',
  npsn: '',
  institution: '',
  accreditation: 'A',
  address: '',
  city: '',
  province: '',
  phone: '',
  email: '',
  principalName: '',
  principalNip: '',
  curriculum: 'Kurikulum Merdeka',
  kktp: 75,
  academicYear: '2026/2027'
})

async function loadActiveSchool() {
  try {
    const res = await api.get('/school')
    if (res.data?.data) {
      const data = res.data.data
      school.value = {
        ...school.value,
        ...data,
        principalName: data.principal_name || school.value.principalName,
        principalNip: data.principal_nip || school.value.principalNip,
        kktp: data.kktp || school.value.kktp
      }
      authStore.setSchool(data)
    }
  } catch (err) {
    console.error('Failed to load school settings:', err)
  }
}

async function fetchTeachersList() {
  loadingTeachers.value = true
  try {
    const res = await api.get('/teachers')
    if (res.data?.data) {
      teachersList.value = res.data.data
    }
  } catch (err) {
    console.warn('Failed to load teachers list:', err)
  } finally {
    loadingTeachers.value = false
  }
}

async function handleAddTeacher() {
  if (!newTeacherForm.value.name.trim() || !newTeacherForm.value.email.trim()) return

  const resolvedSubjects = teacherSubjectSlots.value
    .map(s => (s.selected === '__CUSTOM__' ? s.custom.trim() : s.selected.trim()))
    .filter(Boolean)

  if (resolvedSubjects.length === 0) {
    alert('Silakan tentukan minimal 1 mata pelajaran yang diampu guru.')
    return
  }

  isAddingTeacher.value = true
  try {
    const payload = {
      ...newTeacherForm.value,
      subject: resolvedSubjects.join(', '),
      subjects: resolvedSubjects
    }
    const res = await api.post('/teachers', payload)
    if (res.data?.data) {
      successMsg.value = `Akun guru "${newTeacherForm.value.name}" berhasil didaftarkan!`
      showAddTeacherModal.value = false
      newTeacherForm.value = {
        name: '',
        nip: '',
        subject: '',
        email: '',
        password: 'password123'
      }
      teacherSubjectSlots.value = [{ selected: 'Matematika', custom: '' }]
      await fetchTeachersList()
    }
  } catch (err: any) {
    alert('Gagal menambah akun guru: ' + (err.response?.data?.message || err.message))
  } finally {
    isAddingTeacher.value = false
  }
}

async function handleDeleteTeacher(teacher: any) {
  if (!confirm(`Hapus akun guru "${teacher.name}"? Guru ini tidak akan bisa login lagi.`)) return
  try {
    await api.delete(`/teachers/${teacher.id}`)
    successMsg.value = `Akun guru "${teacher.name}" berhasil dihapus.`
    await fetchTeachersList()
  } catch (err: any) {
    alert('Gagal menghapus guru: ' + (err.response?.data?.message || err.message))
  }
}

onMounted(async () => {
  await Promise.all([
    loadActiveSchool(),
    fetchTeachersList()
  ])
})

async function saveSchoolSettings() {
  isSaving.value = true
  try {
    const res = await api.put('/school', {
      ...school.value,
      principal_name: school.value.principalName,
      principal_nip: school.value.principalNip,
      kktp: Number(school.value.kktp) || 75
    })
    if (res.data?.data) {
      authStore.setSchool(res.data.data)
    }
    successMsg.value = 'Profil satuan pendidikan dan kelengkapan dokumen berhasil disimpan!'
  } catch (err: any) {
    console.error('Failed to save school settings:', err)
    alert('Gagal menyimpan pengaturan: ' + (err.response?.data?.message || err.message))
  } finally {
    isSaving.value = false
  }
}
</script>
