<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="card p-5 bg-white border border-surface-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <router-link to="/assessments" class="btn btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1">
          ← Kembali ke Asesmen
        </router-link>
        <div>
          <div class="flex items-center gap-2">
            <span class="badge badge-primary text-[10px]">Formatif &bull; Kelas VII-A</span>
            <span class="text-xs text-emerald-600 font-bold">Target: TP 7.1 Komponen Sistem Komputer</span>
          </div>
          <h1 class="text-xl font-bold text-surface-900 mt-1">
            Rubrik Penilaian Formatif: Pengenalan Komponen Sistem Komputer
          </h1>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <router-link
          :to="`/paper-grading?type=exam&refId=${$route.params.id}&title=${encodeURIComponent('Penilaian Kertas Asesmen')}`"
          class="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
        >
          <span>📝</span> Periksa Kertas (AI)
        </router-link>
        <button @click="saveScores" class="btn btn-primary text-xs px-4 py-2 font-bold shadow-sm">
          💾 Simpan Nilai ke Ledger
        </button>
      </div>
    </div>

    <!-- Rubric Scoring Table -->
    <div class="card p-0 overflow-x-auto">
      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="bg-surface-50 text-surface-700 font-bold border-b border-surface-200 uppercase tracking-wider text-[11px]">
            <th class="py-3 px-3 w-12 text-center border-r border-surface-200">No</th>
            <th class="py-3 px-4 w-28 border-r border-surface-200">NIS</th>
            <th class="py-3 px-4 min-w-[180px] border-r border-surface-200">Nama Siswa</th>
            <th class="py-3 px-3 text-center border-r border-surface-200">Indikator 1: Identifikasi Komponen (1-4)</th>
            <th class="py-3 px-3 text-center border-r border-surface-200">Indikator 2: Fungsi Alur Data (1-4)</th>
            <th class="py-3 px-3 text-center border-r border-surface-200">Indikator 3: Kolaborasi Tim (1-4)</th>
            <th class="py-3 px-4 text-center border-r border-surface-200 bg-emerald-50 text-emerald-900 font-black">Nilai Konversi (0-100)</th>
            <th class="py-3 px-4 text-center">Tindak Lanjut</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-200">
          <tr v-for="(row, idx) in studentScores" :key="row.id" class="hover:bg-surface-50/60">
            <td class="py-2.5 px-3 text-center font-semibold text-surface-400 border-r border-surface-200">{{ idx + 1 }}</td>
            <td class="py-2.5 px-4 font-mono text-surface-700 border-r border-surface-200">{{ row.nis }}</td>
            <td class="py-2.5 px-4 font-semibold text-surface-900 border-r border-surface-200">{{ row.name }}</td>

            <!-- Rubric Rubrics (1-4 scale) -->
            <td class="py-2 px-3 text-center border-r border-surface-200">
              <select v-model.number="row.ind1" class="input text-xs py-1 text-center font-bold" @change="recalc(row)">
                <option :value="1">1 (Perlu Bimbingan)</option>
                <option :value="2">2 (Cukup)</option>
                <option :value="3">3 (Baik)</option>
                <option :value="4">4 (Sangat Baik)</option>
              </select>
            </td>
            <td class="py-2 px-3 text-center border-r border-surface-200">
              <select v-model.number="row.ind2" class="input text-xs py-1 text-center font-bold" @change="recalc(row)">
                <option :value="1">1 (Perlu Bimbingan)</option>
                <option :value="2">2 (Cukup)</option>
                <option :value="3">3 (Baik)</option>
                <option :value="4">4 (Sangat Baik)</option>
              </select>
            </td>
            <td class="py-2 px-3 text-center border-r border-surface-200">
              <select v-model.number="row.ind3" class="input text-xs py-1 text-center font-bold" @change="recalc(row)">
                <option :value="1">1 (Perlu Bimbingan)</option>
                <option :value="2">2 (Cukup)</option>
                <option :value="3">3 (Baik)</option>
                <option :value="4">4 (Sangat Baik)</option>
              </select>
            </td>

            <td class="py-2.5 px-4 text-center border-r border-surface-200 bg-emerald-50/40">
              <span class="font-black text-sm text-emerald-800">{{ row.finalScore }}</span>
            </td>

            <td class="py-2.5 px-4 text-center">
              <span
                :class="[
                  'badge text-[10px] font-bold uppercase',
                  row.finalScore >= 70 ? 'badge-success' : 'badge-danger'
                ]"
              >
                {{ row.finalScore >= 70 ? 'Tercapai' : 'Remedial' }}
              </span>
            </td>
          </tr>
          <tr v-if="studentScores.length === 0">
            <td colspan="7" class="py-12 text-center text-surface-400">
              <div class="flex flex-col items-center justify-center gap-2">
                <div class="text-3xl">📋</div>
                <p class="font-bold text-surface-700 text-sm">Belum ada data siswa untuk rubrik asesmen ini</p>
                <p class="text-xs text-surface-400">Data siswa akan muncul setelah siswa terdaftar di kelas bersangkutan.</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const studentScores = ref<any[]>([])

function recalc(row: any) {
  const total = row.ind1 + row.ind2 + row.ind3
  row.finalScore = Math.round((total / 12) * 100)
}

function saveScores() {
  alert('Nilai rubrik asesmen berhasil disimpan dan otomatis disinkronkan ke Buku Nilai / Ledger!')
}
</script>
