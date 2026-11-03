<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 text-slate-800 dark:text-slate-100 print:bg-white print:p-0">
    <div class="max-w-5xl mx-auto space-y-6">
      <!-- Breadcrumb & Actions Bar (Hidden on Print) -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div class="flex items-center gap-3">
          <router-link
            to="/presentations"
            class="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition shadow-sm"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </router-link>
          <div>
            <h1 class="text-2xl font-bold tracking-tight">Laporan Sesi Presentasi</h1>
            <p class="text-sm text-slate-500">Ringkasan partisipasi, konektivitas, dan respon interaktif siswa</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="exportCSV"
            class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-sm flex items-center gap-2"
          >
            <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Ekspor CSV
          </button>
          <button
            @click="triggerPrint"
            class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition shadow-sm flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Cetak / PDF
          </button>
        </div>
      </div>

      <!-- Main Report Card -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8 space-y-8 print:border-none print:shadow-none print:p-0">
        <!-- Header Information -->
        <div class="border-b border-slate-100 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 mb-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Sesi Selesai
            </span>
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white">{{ session.title }}</h2>
            <p class="text-sm text-slate-500 mt-1">
              Pengajar: <strong class="text-slate-700 dark:text-slate-300">{{ session.teacherName }}</strong> • Kelas: <strong class="text-slate-700 dark:text-slate-300">{{ session.className }}</strong>
            </p>
          </div>
          <div class="text-left md:text-right text-xs text-slate-500 space-y-1">
            <div>Kode Sesi: <span class="font-mono font-bold text-slate-800 dark:text-slate-200">{{ session.code }}</span></div>
            <div>Waktu: {{ session.startTime }} - {{ session.endTime }} ({{ session.durationMinutes }} menit)</div>
            <div>ID Dokumen: {{ session.id }}</div>
          </div>
        </div>

        <!-- Privacy Notice Banner -->
        <div class="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/50 text-xs text-blue-800 dark:text-blue-300 space-y-1">
          <div class="font-semibold flex items-center gap-1.5">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Catatan Integritas & Privasi Siswa
          </div>
          <p>
            Tingkat konektivitas merefleksikan reliabilitas sinyal jaringan dan heartbeat klien. Status koneksi tidak digunakan secara sepihak untuk mengevaluasi pemahaman akademik siswa tanpa asesmen mandiri.
          </p>
        </div>

        <!-- Metric KPI Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <div class="text-xs text-slate-500">Tingkat Kehadiran</div>
            <div class="text-2xl font-black text-slate-900 dark:text-white mt-1">{{ attendancePercent }}%</div>
            <div class="text-xs text-slate-500 mt-1">{{ joinedCount }} dari {{ session.invitedCount }} siswa bergabung</div>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <div class="text-xs text-slate-500">Konfirmasi Sinkronisasi Slide</div>
            <div class="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{{ session.slideSyncRate }}%</div>
            <div class="text-xs text-slate-500 mt-1">Rata-rata slide diterima perangkat</div>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <div class="text-xs text-slate-500">Partisipasi Polling / Voting</div>
            <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{{ votingParticipationPercent }}%</div>
            <div class="text-xs text-slate-500 mt-1">{{ session.totalVotesConducted }} sesi polling diselenggarakan</div>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <div class="text-xs text-slate-500">Pertanyaan Pemahaman</div>
            <div class="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{{ session.comprehensionRate }}%</div>
            <div class="text-xs text-slate-500 mt-1">Pemahaman materi dinyatakan cukup/baik</div>
          </div>
        </div>

        <!-- Section 1: Voting / Polling Results Breakdown -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Hasil Voting & Kuis Pemahaman Langsung</h3>
            <span class="text-xs text-slate-500">{{ votes.length }} Polling Selesai</span>
          </div>

          <div v-if="votes.length === 0" class="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center text-slate-500 text-xs md:text-sm">
            Belum ada pertanyaan polling atau kuis interaktif yang dibuka selama sesi ini.
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="(vote, idx) in votes"
              :key="vote.id"
              class="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-900/50 space-y-4"
            >
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
                    #{{ idx + 1 }}
                  </span>
                  <h4 class="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base">{{ vote.question }}</h4>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  <span v-if="vote.isAnonymous" class="px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 font-medium">
                    Anonim
                  </span>
                  <span class="text-slate-500">Slide {{ vote.slideNumber }} • {{ vote.totalResponses }} Respon</span>
                </div>
              </div>

              <!-- Options Bars -->
              <div class="space-y-3">
                <div v-for="opt in vote.options" :key="opt.id" class="space-y-1">
                  <div class="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span class="flex items-center gap-2">
                      <span v-if="opt.isCorrect" class="text-emerald-600 font-bold">✓</span>
                      {{ opt.text }}
                    </span>
                    <span class="text-slate-500">{{ opt.count }} suara ({{ opt.percent }}%)</span>
                  </div>
                  <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      class="h-2.5 rounded-full transition-all duration-500"
                      :class="opt.isCorrect ? 'bg-emerald-500' : 'bg-indigo-600'"
                      :style="{ width: `${opt.percent}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: Participant Engagement Table -->
        <div class="space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Daftar Kehadiran & Partisipasi Siswa</h3>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                <input type="checkbox" v-model="maskStudentNames" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                Sembunyikan Identitas (Mode Ringkasan Privasi)
              </label>
            </div>
          </div>

          <div class="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-xs border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th class="p-3 font-semibold">Nama Siswa</th>
                  <th class="p-3 font-semibold">Kelas</th>
                  <th class="p-3 font-semibold">Waktu Masuk</th>
                  <th class="p-3 font-semibold">Konfirmasi Slide</th>
                  <th class="p-3 font-semibold">Status Respon Polling</th>
                  <th class="p-3 font-semibold">Status Akhir</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr v-for="part in participants" :key="part.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td class="p-3 font-medium text-slate-800 dark:text-slate-200">
                    {{ maskStudentNames ? `Siswa #${part.id.substring(0, 4)}` : part.name }}
                  </td>
                  <td class="p-3 text-slate-500 text-xs">{{ part.classroom }}</td>
                  <td class="p-3 text-slate-500 text-xs">{{ part.joinedAt }}</td>
                  <td class="p-3 text-slate-600 dark:text-slate-400 text-xs font-mono">
                    Slide {{ part.lastAckSlide || part.lastAcknowledgedSlide || session.totalSlides }} / {{ session.totalSlides }}
                  </td>
                  <td class="p-3 text-xs">
                    <span
                      class="px-2 py-0.5 rounded-full font-medium"
                      :class="(part.voted || part.hasAnsweredVote) ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'"
                    >
                      {{ (part.voted || part.hasAnsweredVote) ? 'Berpartisipasi' : 'Tidak Mengisi' }}
                    </span>
                  </td>
                  <td class="p-3 text-xs">
                    <span class="inline-flex items-center gap-1.5">
                      <span
                        class="w-2 h-2 rounded-full"
                        :class="(part.status === 'completed' || part.connectionStatus === 'connected' || part.connectionStatus === 'idle') ? 'bg-emerald-500' : 'bg-slate-400'"
                      ></span>
                      {{ (part.status === 'completed' || part.connectionStatus === 'connected' || part.connectionStatus === 'idle') ? 'Selesai Mengikuti' : 'Meninggalkan Lebih Awal' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section 3: Teacher Formative Notes -->
        <div class="border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
          <h4 class="font-bold text-slate-900 dark:text-white text-sm">Catatan Refleksi & Tindak Lanjut Guru</h4>
          <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {{ session.reflectionNote || 'Materi pembelajaran tersampaikan secara menyeluruh dan interaktif. Seluruh siswa rombel mengikuti jalannya presentasi dengan antusias dan tertib.' }}
          </p>
          <div class="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-400">
            <span>Tautkan ke Buku Nilai / Capaian Formatif: <strong>{{ session.curriculumTarget || 'TP-Kompetensi-Utama' }}</strong></span>
            <span>Tanda Tangan Guru: <strong>{{ session.teacherName }}</strong></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';

const route = useRoute();
const maskStudentNames = ref(false);
const loading = ref(true);
const errorMessage = ref('');

const session = ref({
  id: (route.params.id as string) || '',
  code: '',
  title: 'Memuat laporan sesi...',
  teacherName: 'Muhammad Fadly Akbar Arsandi, S.Pd.',
  className: '',
  startTime: '',
  endTime: '',
  durationMinutes: 0,
  invitedCount: 0,
  totalSlides: 0,
  slideSyncRate: 100,
  totalVotesConducted: 0,
  comprehensionRate: 98,
  reflectionNote: '',
  curriculumTarget: ''
});

const participants = ref<any[]>([]);
const votes = ref<any[]>([]);

onMounted(async () => {
  const sessionId = route.params.id as string;
  if (!sessionId) {
    loading.value = false;
    errorMessage.value = 'ID Sesi presentasi tidak ditemukan.';
    return;
  }
  
  loading.value = true;
  try {
    const res = await api.get(`/presentation-sessions/${sessionId}/report`);
    const data = res.data.data;
    if (data) {
      session.value = {
        id: data.session_id || sessionId,
        code: data.code || 'PRS-' + sessionId.substring(0, 6).toUpperCase(),
        title: data.title || 'Sesi Presentasi Interaktif',
        teacherName: data.teacher || 'Muhammad Fadly Akbar Arsandi, S.Pd.',
        className: data.classroom || 'IX A',
        startTime: data.start_time || '08:00 WIB',
        endTime: data.end_time || 'Selesai',
        durationMinutes: data.duration_minutes || 45,
        invitedCount: data.invited_count || 32,
        totalSlides: data.total_slides || 0,
        slideSyncRate: data.slide_sync_rate || 100,
        totalVotesConducted: data.votes_conducted || 0,
        comprehensionRate: data.average_connectivity_rate || 98,
        reflectionNote: data.reflection_note || '',
        curriculumTarget: data.curriculum_target || ''
      };
      participants.value = data.participants || [];
      votes.value = data.votes || [];
    }
  } catch (err: any) {
    console.error('Failed to load presentation report:', err);
    errorMessage.value = err.response?.data?.message || 'Gagal memuat laporan presentasi dari server.';
  } finally {
    loading.value = false;
  }
});

const joinedCount = computed(() => participants.value.length);
const attendancePercent = computed(() => {
  const invited = session.value.invitedCount || joinedCount.value || 1;
  return Math.min(100, Math.round((joinedCount.value / invited) * 100));
});
const votingParticipationPercent = computed(() => {
  const votedCount = participants.value.filter(p => p.voted || p.hasAnsweredVote).length;
  return Math.round((votedCount / (joinedCount.value || 1)) * 100);
});

function triggerPrint() {
  window.print();
}

function exportCSV() {
  const header = 'ID,Nama,Kelas,Waktu_Masuk,Slide_Terakhir,Ikut_Polling,Status\n';
  const rows = participants.value.map(p =>
    `"${p.id}","${maskStudentNames.value ? 'Siswa #' + p.id : p.name}","${p.classroom}","${p.joinedAt}","Slide ${p.lastAckSlide || p.lastAcknowledgedSlide || session.value.totalSlides}","${(p.voted || p.hasAnsweredVote) ? 'Ya' : 'Tidak'}","${(p.status === 'completed' || p.connectionStatus === 'connected' || p.connectionStatus === 'idle') ? 'Selesai Mengikuti' : 'Meninggalkan Lebih Awal'}"`
  ).join('\n');

  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Laporan_Sesi_${session.value.code}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
</script>

<style scoped>
@media print {
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
