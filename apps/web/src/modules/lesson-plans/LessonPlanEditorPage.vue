<template>
  <div class="space-y-6">
    <!-- Top Bar Navigation & Save -->
    <div class="card p-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 bg-white/90 backdrop-blur-md">
      <div class="flex items-center gap-3">
        <router-link to="/lesson-plans" class="btn btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1">
          ← Kembali ke Modul Ajar
        </router-link>
        <div>
          <h2 class="font-bold text-surface-900 text-sm leading-tight">
            {{ form.title || 'Modul Ajar Baru' }}
          </h2>
          <span class="text-[11px] text-surface-500">
            Fase D &bull; {{ form.subject }} Kelas {{ form.grade }} &bull; {{ form.duration }} JP
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="showPreview = !showPreview"
          class="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
        >
          <span>👁️</span> {{ showPreview ? 'Tutup Preview' : 'Preview Cetak' }}
        </button>
        <button
          @click="saveModulAjar"
          :disabled="isSaving"
          class="btn btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5 font-bold shadow-sm"
        >
          <span v-if="!isSaving">💾 Simpan Modul</span>
          <span v-else>Menyimpan...</span>
        </button>
      </div>
    </div>

    <!-- PREVIEW DOKUMEN MODUL AJAR (KEMENDIKBUD FORMAT) -->
    <div v-if="showPreview" class="card p-8 bg-white border-2 border-primary-200 shadow-xl max-w-4xl mx-auto space-y-6">
      <div class="text-center pb-4 border-b-2 border-surface-900 space-y-1">
        <h3 class="text-xs uppercase font-extrabold tracking-widest text-surface-500">Pemerintah Kota Kendari &bull; Dinas Pendidikan</h3>
        <h2 class="text-lg font-black text-surface-900">SMP NEGERI 6 KENDARI</h2>
        <p class="text-xs text-surface-500">Jalan R.A. Kartini No. 1, Kota Kendari &bull; NPSN: 40403892</p>
        <h1 class="text-base font-bold text-surface-800 pt-3 uppercase tracking-wide">
          MODUL AJAR KURIKULUM MERDEKA (FASE D)
        </h1>
      </div>

      <!-- Preview Table Identitas -->
      <table class="w-full text-xs text-surface-800 border border-surface-300">
        <tbody>
          <tr class="border-b border-surface-200">
            <td class="p-2.5 font-bold bg-surface-50 w-1/4">Mata Pelajaran</td>
            <td class="p-2.5 w-1/4">{{ form.subject }}</td>
            <td class="p-2.5 font-bold bg-surface-50 w-1/4">Fase / Kelas / Semester</td>
            <td class="p-2.5 w-1/4">Fase D / Kelas {{ form.grade }} / Ganjil</td>
          </tr>
          <tr class="border-b border-surface-200">
            <td class="p-2.5 font-bold bg-surface-50">Judul Modul</td>
            <td class="p-2.5" colspan="3">{{ form.title }}</td>
          </tr>
          <tr class="border-b border-surface-200">
            <td class="p-2.5 font-bold bg-surface-50">Alokasi Waktu</td>
            <td class="p-2.5">{{ form.duration }} Jam Pelajaran ({{ form.meetings }} Pertemuan)</td>
            <td class="p-2.5 font-bold bg-surface-50">Model Pembelajaran</td>
            <td class="p-2.5">{{ form.learningModel }}</td>
          </tr>
          <tr class="border-b border-surface-200">
            <td class="p-2.5 font-bold bg-surface-50">Profil Pelajar Pancasila</td>
            <td class="p-2.5" colspan="3">{{ form.dimensionsP3.join(', ') }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Preview Komponen Inti -->
      <div class="space-y-4 text-xs">
        <div>
          <h3 class="font-bold text-surface-900 uppercase tracking-wide pb-1 border-b border-surface-200">I. Capaian & Tujuan Pembelajaran</h3>
          <p class="mt-2 text-surface-700 leading-relaxed font-semibold">Tujuan Pembelajaran (TP):</p>
          <p class="text-surface-600 mt-0.5 leading-relaxed">{{ form.learningObjective }}</p>
          <p class="mt-2 text-surface-700 leading-relaxed font-semibold">Pemahaman Bermakna:</p>
          <p class="text-surface-600 mt-0.5 leading-relaxed">{{ form.meaningfulUnderstanding }}</p>
          <p class="mt-2 text-surface-700 leading-relaxed font-semibold">Pertanyaan Pemantik:</p>
          <p class="text-surface-600 mt-0.5 leading-relaxed">{{ form.triggerQuestions }}</p>
        </div>

        <div>
          <h3 class="font-bold text-surface-900 uppercase tracking-wide pb-1 border-b border-surface-200">II. Langkah-Langkah Pembelajaran</h3>
          <div class="mt-2 space-y-2">
            <div class="p-3 bg-surface-50 rounded-lg">
              <span class="font-bold text-surface-800">A. Kegiatan Pendahuluan (10 Menit):</span>
              <p class="text-surface-600 mt-1 whitespace-pre-line">{{ form.activityOpening }}</p>
            </div>
            <div class="p-3 bg-surface-50 rounded-lg">
              <span class="font-bold text-surface-800">B. Kegiatan Inti (60 Menit):</span>
              <p class="text-surface-600 mt-1 whitespace-pre-line">{{ form.activityCore }}</p>
            </div>
            <div class="p-3 bg-surface-50 rounded-lg">
              <span class="font-bold text-surface-800">C. Kegiatan Penutup (10 Menit):</span>
              <p class="text-surface-600 mt-1 whitespace-pre-line">{{ form.activityClosing }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MAIN EDITOR TABS -->
    <div v-else class="space-y-6">
      <!-- Tabs Selector -->
      <div class="flex border-b border-surface-200 bg-white rounded-t-xl px-4 pt-2 gap-2 overflow-x-auto text-xs font-semibold">
        <button
          v-for="t in tabs"
          :key="t.key"
          @click="currentTab = t.key"
          :class="[
            'pb-3 pt-2 px-3 border-b-2 transition whitespace-nowrap',
            currentTab === t.key ? 'border-primary-600 text-primary-600 font-bold' : 'border-transparent text-surface-500 hover:text-surface-800'
          ]"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- TAB 1: INFORMASI UMUM -->
      <div v-if="currentTab === 'info'" class="card space-y-5">
        <h3 class="text-base font-bold text-surface-900 pb-2 border-b border-surface-100">
          A. Identitas & Informasi Umum Modul
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div class="md:col-span-2">
            <label class="label">Judul Modul Ajar</label>
            <input v-model="form.title" type="text" class="input text-xs" placeholder="Misal: Perangkat Keras dan Pemrosesan Data Biner" />
          </div>
          <div>
            <label class="label">Mata Pelajaran</label>
            <select v-model="form.subject" class="input text-xs font-semibold">
              <option v-for="s in availableSubjects" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label class="label">Fase & Tingkat Kelas</label>
            <select v-model="form.grade" class="input text-xs font-semibold" @change="onGradeChange">
              <option value="7">Fase D - Kelas VII (KKA)</option>
              <option value="9">Fase D - Kelas IX (Informatika)</option>
            </select>
          </div>
          <div>
            <label class="label">Total Alokasi Waktu (JP)</label>
            <input v-model.number="form.duration" type="number" min="1" max="24" class="input text-xs" />
          </div>
          <div>
            <label class="label">Jumlah Pertemuan</label>
            <input v-model.number="form.meetings" type="number" min="1" max="8" class="input text-xs" />
          </div>
        </div>

        <div>
          <label class="label">Dimensi Profil Pelajar Pancasila (P3)</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
            <label
              v-for="dim in allDimensions"
              :key="dim"
              class="flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer hover:bg-surface-50 transition"
              :class="form.dimensionsP3.includes(dim) ? 'bg-primary-50/60 border-primary-300 text-primary-900 font-medium' : 'border-surface-200 text-surface-700'"
            >
              <input
                type="checkbox"
                :value="dim"
                v-model="form.dimensionsP3"
                class="rounded text-primary-600"
              />
              <span>{{ dim }}</span>
            </label>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="label">Model Pembelajaran</label>
            <select v-model="form.learningModel" class="input text-xs">
              <option value="Problem-Based Learning (PBL)">Problem-Based Learning (PBL)</option>
              <option value="Project-Based Learning (PjBL)">Project-Based Learning (PjBL)</option>
              <option value="Discovery / Inquiry Learning">Discovery / Inquiry Learning</option>
              <option value="Tatap Muka & Diskusi Interaktif">Tatap Muka & Diskusi Interaktif</option>
            </select>
          </div>
          <div>
            <label class="label">Sarana & Prasarana</label>
            <input v-model="form.facilities" type="text" class="input text-xs" placeholder="Lab Komputer / Laptop, Proyektor, Internet, LKPD" />
          </div>
        </div>
      </div>

      <!-- TAB 2: KOMPONEN INTI -->
      <div v-else-if="currentTab === 'core'" class="card space-y-5">
        <h3 class="text-base font-bold text-surface-900 pb-2 border-b border-surface-100">
          B. Komponen Inti & Alur Pembelajaran
        </h3>

        <div class="space-y-4 text-xs">
          <div>
            <label class="label">Tujuan Pembelajaran (TP)</label>
            <textarea
              v-model="form.learningObjective"
              rows="3"
              class="input text-xs"
              placeholder="Tuliskan tujuan pembelajaran yang dapat diobservasi dan diukur..."
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Pemahaman Bermakna</label>
              <textarea
                v-model="form.meaningfulUnderstanding"
                rows="3"
                class="input text-xs"
                placeholder="Manfaat yang akan peserta didik peroleh di kehidupan nyata..."
              ></textarea>
            </div>
            <div>
              <label class="label">Pertanyaan Pemantik</label>
              <textarea
                v-model="form.triggerQuestions"
                rows="3"
                class="input text-xs"
                placeholder="Pertanyaan untuk menumbuhkan rasa ingin tahu di awal..."
              ></textarea>
            </div>
          </div>

          <!-- Langkah Pembelajaran -->
          <div class="p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-3">
            <h4 class="font-bold text-surface-800 text-xs uppercase tracking-wider">Langkah-Langkah Aktivitas Belajar</h4>
            <div>
              <label class="label">1. Kegiatan Pendahuluan (Apersepsi & Motivasi)</label>
              <textarea v-model="form.activityOpening" rows="3" class="input text-xs"></textarea>
            </div>
            <div>
              <label class="label">2. Kegiatan Inti (Eksplorasi, Diskusi & Pembuktian)</label>
              <textarea v-model="form.activityCore" rows="4" class="input text-xs"></textarea>
            </div>
            <div>
              <label class="label">3. Kegiatan Penutup (Refleksi, Rangkuman & Doa)</label>
              <textarea v-model="form.activityClosing" rows="3" class="input text-xs"></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: ASESMEN & DIFERENSIASI -->
      <div v-else-if="currentTab === 'assessment'" class="card space-y-5">
        <h3 class="text-base font-bold text-surface-900 pb-2 border-b border-surface-100">
          C. Rancangan Asesmen & Diferensiasi
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div class="p-4 rounded-xl border border-surface-200 space-y-2">
            <h4 class="font-bold text-surface-900">1. Asesmen Diagnostik</h4>
            <p class="text-surface-500 text-[11px]">Sebelum pembelajaran dimulai</p>
            <textarea v-model="form.assessmentDiag" rows="4" class="input text-xs" placeholder="Kuis lisan pemantik, survei minat..."></textarea>
          </div>

          <div class="p-4 rounded-xl border border-surface-200 space-y-2">
            <h4 class="font-bold text-surface-900">2. Asesmen Formatif</h4>
            <p class="text-surface-500 text-[11px]">Selama proses pembelajaran berlangsung</p>
            <textarea v-model="form.assessmentForm" rows="4" class="input text-xs" placeholder="Observasi keaktifan kelompok, pengerjaan LKPD, kuis cbt..."></textarea>
          </div>

          <div class="p-4 rounded-xl border border-surface-200 space-y-2">
            <h4 class="font-bold text-surface-900">3. Asesmen Sumatif</h4>
            <p class="text-surface-500 text-[11px]">Di akhir lingkup materi</p>
            <textarea v-model="form.assessmentSum" rows="4" class="input text-xs" placeholder="Tes tertulis CBT, penilaian produk / proyek..."></textarea>
          </div>
        </div>

        <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-3">
          <h4 class="font-bold text-amber-900">Diferensiasi Pembelajaran (Inklusif)</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span class="font-semibold text-amber-800">Program Pengayaan (Pencapaian Tinggi):</span>
              <textarea v-model="form.enrichment" rows="2" class="input text-xs mt-1" placeholder="Tantangan eksplorasi lebih lanjut..."></textarea>
            </div>
            <div>
              <span class="font-semibold text-amber-800">Program Remedial (Perlu Bimbingan):</span>
              <textarea v-model="form.remedial" rows="2" class="input text-xs mt-1" placeholder="Pendampingan terfokus konsep mendasar..."></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentTab = ref('info')
const showPreview = ref(false)
const isSaving = ref(false)

const tabs = [
  { key: 'info', label: '1. Identitas & Info Umum' },
  { key: 'core', label: '2. Komponen Inti & Kegiatan' },
  { key: 'assessment', label: '3. Asesmen & Diferensiasi' }
]

const allDimensions = [
  'Beriman & Bertakwa kepada Tuhan YME',
  'Bernalar Kritis',
  'Mandiri',
  'Kreatif',
  'Bergotong Royong',
  'Berkebinekaan Global'
]

const availableSubjects = computed(() => {
  return form.value.grade === '7' ? ['KKA (Koding dan Kecerdasan Artifisial)'] : ['Informatika']
})

function onGradeChange() {
  form.value.subject = form.value.grade === '7' ? 'KKA (Koding dan Kecerdasan Artifisial)' : 'Informatika'
}

const form = ref({
  title: 'Logika Dasar Koding dan Blok Sekuensial',
  subject: 'KKA (Koding dan Kecerdasan Artifisial)',
  grade: '7',
  duration: 4,
  meetings: 2,
  learningModel: 'Problem-Based Learning (PBL)',
  facilities: 'Lab Komputer, Proyektor, Bahan Bacaan Siswa, LKPD Digital',
  dimensionsP3: ['Bernalar Kritis', 'Mandiri', 'Bergotong Royong'],
  learningObjective: 'Peserta didik mampu mengidentifikasi komponen perangkat keras komputer (input, proses, output, storage) serta memahami prinsip kerja aliran data secara kolaboratif.',
  meaningfulUnderstanding: 'Peserta didik menyadari bahwa setiap perangkat pintar (smartphone, laptop, ATM) tersusun atas sinergi perangkat keras yang memproses kode instruksi untuk memudahkan urusan manusia.',
  triggerQuestions: 'Pernahkah kalian berpikir bagaimana huruf yang kita ketik di keyboard bisa muncul seketika di layar monitor? Siapakah yang bertugas menerjemahkannya?',
  activityOpening: '1. Guru mengucapkan salam, menyapa siswa, dan mengajak berdoa.\n2. Presensi kehadiran dan icebreaking cepat (Roda Acak Tanya Jawab).\n3. Guru menyampaikan tujuan pembelajaran dan apersepsi pertanyaan pemantik.',
  activityCore: '1. Orientasi Masalah: Guru menampilkan motherboard komputer asli di depan kelas.\n2. Pengorganisasian: Siswa dibagi menjadi kelompok 4 orang untuk mengeksplorasi fungsi masing-masing komponen.\n3. Penyelidikan Mandiri: Siswa mengamati video cara kerja CPU dan RAM.\n4. Penyajian Hasil: Tiap kelompok mempresentasikan diagram alur data di papan tulis.\n5. Evaluasi: Guru memberikan klarifikasi dan penguatan konsep.',
  activityClosing: '1. Peserta didik bersama guru menyimpulkan inti materi hari ini.\n2. Refleksi pembelajaran: "Satu hal baru apa yang kamu pahami hari ini?".\n3. Doa penutup dan penyampaian materi pertemuan berikutnya.',
  assessmentDiag: 'Kuis lisan tanya jawab komponen komputer yang sering ditemui di rumah.',
  assessmentForm: 'Rubrik keaktifan diskusi kelompok dan pengerjaan LKPD digital di kelas.',
  assessmentSum: 'Tes CBT 20 butir soal pilihan ganda pemahaman perangkat keras.',
  enrichment: 'Diberikan studi kasus spesifikasi hardware komputer untuk kebutuhan video editing profesional.',
  remedial: 'Bimbingan khusus mengenal 4 blok utama komputer dengan kartu gambar flashcard.'
})

function saveModulAjar() {
  isSaving.value = true
  setTimeout(() => {
    isSaving.value = false
    alert('✅ Modul Ajar berhasil disimpan dan diverifikasi!')
  }, 600)
}
</script>
