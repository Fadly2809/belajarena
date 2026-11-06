<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 flex items-center gap-2">
          <span>📖</span> Jurnal Mengajar & Agenda Kelas Harian
        </h1>
        <p class="text-surface-500 text-sm mt-0.5">
          Dokumentasi riil proses tatap muka kelas, materi TP yang dibahas, kendala pembelajaran, dan tindak lanjut
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="showCreateModal = true"
          class="btn btn-primary text-sm flex items-center gap-2"
        >
          <span>➕</span> Tulis Entri Jurnal Baru
        </button>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="card p-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <div>
          <select v-model="selectedClass" @change="onSelectedClassChange" class="input text-xs py-1.5 font-bold">
            <option value="all">Semua Rombel</option>
            <option v-for="c in classrooms" :key="c.id" :value="c.name">
              {{ formatClassLabel(c) }}
            </option>
          </select>
        </div>
        <div>
          <select v-model="selectedSubject" class="input text-xs py-1.5">
            <option value="all">Semua Mapel</option>
            <option v-for="s in availableFilterSubjects" :key="s.id" :value="s.name">
              {{ s.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="text-xs text-surface-500">
        Menampilkan <strong>{{ filteredJournals.length }}</strong> catatan pertemuan mengajar
      </div>
    </div>

    <!-- Journal Timeline Cards -->
    <div class="space-y-4">
      <div
        v-for="j in filteredJournals"
        :key="j.id"
        class="card hover:shadow-md transition p-5 border border-surface-200 space-y-3"
      >
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-surface-100">
          <div class="flex items-center gap-2">
            <span class="badge badge-primary text-[10px]">{{ j.classroom }}</span>
            <span class="font-bold text-surface-900 text-xs">{{ j.subject }}</span>
            <span class="text-xs text-surface-400">&bull; Pertemuan Ke-{{ j.meetingNumber }}</span>
          </div>
          <div class="flex items-center gap-3 text-xs text-surface-500">
            <span>📅 {{ j.date }} (Jam: {{ j.time }})</span>
            <span class="font-bold text-emerald-600">Kehadiran: {{ j.presentCount }}/{{ j.totalStudents }} Siswa</span>
            <button
              @click="deleteJournal(j.id)"
              class="text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg font-bold text-xs transition flex items-center gap-1"
              title="Hapus Jurnal"
            >
              <span>🗑️</span> Hapus
            </button>
          </div>
        </div>

        <div>
          <h2 class="font-bold text-surface-900 text-sm leading-snug">
            Materi: {{ j.topic }}
          </h2>
          <p class="text-xs text-surface-600 mt-1 leading-relaxed">
            <strong>Aktivitas yang dilaksanakan:</strong> {{ j.activities }}
          </p>
        </div>

        <div v-if="j.notes" class="p-2.5 rounded-lg bg-surface-50 border border-surface-100 text-xs text-surface-600">
          <strong class="text-surface-800">Catatan Khusus Kejadian Kelas:</strong> {{ j.notes }}
        </div>
      </div>
    </div>

    <!-- Modal Tulis Jurnal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      @click.self="showCreateModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-surface-100">
          <h3 class="text-base font-bold text-surface-900">Catat Jurnal Mengajar Baru</h3>
          <button @click="showCreateModal = false" class="text-surface-400 hover:text-surface-700">✕</button>
        </div>

        <form @submit.prevent="createJournal" class="space-y-3 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Tanggal Mengajar</label>
              <input v-model="newJournal.date" type="date" class="input text-xs" required />
            </div>
            <div>
              <label class="label">Rombel Kelas</label>
              <select v-model="newJournal.classroom" @change="onNewJournalClassChange" class="input text-xs font-bold">
                <option v-for="c in classrooms" :key="c.id" :value="c.name">
                  {{ formatClassLabel(c) }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Mata Pelajaran (Sesuai Jadwal)</label>
              <select v-model="newJournal.subject" class="input text-xs">
                <option v-for="s in availableNewJournalSubjects" :key="s.id" :value="s.name">
                  {{ s.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="label">Pertemuan Ke-</label>
              <input v-model.number="newJournal.meetingNumber" type="number" min="1" max="36" class="input text-xs" />
            </div>
          </div>

          <div>
            <label class="label">Topik / Materi yang Diajarkan</label>
            <input v-model="newJournal.topic" type="text" class="input text-xs" placeholder="Misal: Perangkat Keras dan Logika Biner" required />
          </div>

          <div>
            <label class="label">Rangkuman Kegiatan Pembelajaran</label>
            <textarea v-model="newJournal.activities" rows="3" class="input text-xs" placeholder="Diskusi kelompok komponen motherboard dan konversi bilangan biner..." required></textarea>
          </div>

          <div>
            <label class="label">Catatan Refleksi / Kejadian Siswa</label>
            <input v-model="newJournal.notes" type="text" class="input text-xs" placeholder="Seluruh kelompok antusias, Dimas perlu pendampingan tambahan biner." />
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
              Simpan Jurnal
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useClassrooms } from '@/composables/useClassrooms'

const authStore = useAuthStore()
const { classrooms, fetchClassrooms, fetchSubjects, formatClassLabel, getClassName, getSubjectNameForClass, getAvailableSubjectsForClass } = useClassrooms()

const selectedClass = ref('all')
const selectedSubject = ref('all')
const showCreateModal = ref(false)

const availableFilterSubjects = computed(() => {
  if (selectedClass.value === 'all') {
    return getAvailableSubjectsForClass()
  }
  return getAvailableSubjectsForClass(selectedClass.value)
})

function onSelectedClassChange() {
  if (selectedClass.value !== 'all') {
    selectedSubject.value = getSubjectNameForClass(selectedClass.value)
  } else {
    selectedSubject.value = 'all'
  }
}

const availableNewJournalSubjects = computed(() => {
  return getAvailableSubjectsForClass(newJournal.value.classroom)
})

function onNewJournalClassChange() {
  newJournal.value.subject = getSubjectNameForClass(newJournal.value.classroom)
}

const defaultSmp6Journals = [
  {
    id: 'j-01',
    date: '2024-10-24',
    time: '08:20 - 09:40',
    classroom: 'VII A',
    subject: 'Informatika & KKA',
    meetingNumber: 12,
    topic: 'Praktik Pemrograman Visual: Percabangan Kondisional IF-ELSE',
    activities: 'Siswa mempraktikkan pembuatan kuis tebak angka menggunakan blok Scratch di Lab Komputer 1.',
    presentCount: 28,
    totalStudents: 28,
    notes: 'Aktivitas lab koding berjalan lancar dan seluruh siswa antusias.'
  },
  {
    id: 'j-02',
    date: '2024-10-21',
    time: '07:00 - 08:20',
    classroom: 'VII B',
    subject: 'Informatika & KKA',
    meetingNumber: 11,
    topic: 'Logika Algoritma & Prompt Engineering Dasar AI',
    activities: 'Menyusun perintah prompt AI terstruktur dan memahami etika kecerdasan buatan.',
    presentCount: 28,
    totalStudents: 28,
    notes: 'Diskusi interaktif berjalan produktif.'
  },
  {
    id: 'j-03',
    date: '2024-10-18',
    time: '10:10 - 11:30',
    classroom: 'IX A',
    subject: 'Informatika',
    meetingNumber: 10,
    topic: 'Analisis Data & Jaringan Komputer',
    activities: 'Latihan pengolahan data spreadsheet dan pemahaman topologi jaringan.',
    presentCount: 27,
    totalStudents: 27,
    notes: 'Seluruh peserta didik tuntas menyelesaikan tugas lab.'
  }
]

const journals = ref<any[]>(authStore.currentSchool?.id === 'sch-smpn6kendari' ? defaultSmp6Journals : [])

function normalizeClass(nameOrId: string) {
  return (nameOrId || '').replace(/[\s-]/g, '').toLowerCase()
}

const filteredJournals = computed(() => {
  return journals.value.filter(j => {
    const matchClass = selectedClass.value === 'all' ||
      normalizeClass(j.classroom) === normalizeClass(selectedClass.value) ||
      normalizeClass(j.classroom) === normalizeClass(getClassName(selectedClass.value))
    const matchSubj = selectedSubject.value === 'all' || j.subject === selectedSubject.value
    return matchClass && matchSubj
  })
})

const newJournal = ref({
  date: new Date().toISOString().split('T')[0],
  classroom: '',
  subject: authStore.user?.subject || '',
  meetingNumber: 1,
  topic: '',
  activities: '',
  notes: ''
})

onMounted(async () => {
  await Promise.all([fetchClassrooms(true), fetchSubjects(true)])
  if (authStore.currentSchool?.id !== 'sch-smpn6kendari') {
    journals.value = []
  }
  if (classrooms.value.length > 0) {
    newJournal.value.classroom = classrooms.value[0].name
    newJournal.value.subject = getSubjectNameForClass(newJournal.value.classroom)
  }
})

function createJournal() {
  journals.value.unshift({
    id: 'j-' + Date.now(),
    date: newJournal.value.date,
    time: '08:20 - 09:40',
    classroom: newJournal.value.classroom,
    subject: newJournal.value.subject,
    meetingNumber: newJournal.value.meetingNumber,
    topic: newJournal.value.topic,
    activities: newJournal.value.activities,
    presentCount: 28,
    totalStudents: 28,
    notes: newJournal.value.notes
  })
  showCreateModal.value = false
  const defCls = classrooms.value[0]?.name || 'VII A'
  newJournal.value = {
    date: new Date().toISOString().split('T')[0],
    classroom: defCls,
    subject: getSubjectNameForClass(defCls),
    meetingNumber: 13,
    topic: '',
    activities: '',
    notes: ''
  }
}

function deleteJournal(id: string) {
  if (!confirm('Apakah Anda yakin ingin menghapus catatan jurnal kelas ini?')) {
    return
  }
  journals.value = journals.value.filter(j => j.id !== id)
}
</script>
