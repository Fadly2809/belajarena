<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
      <!-- Header Modal -->
      <div class="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shadow-inner">
            📋
          </div>
          <div>
            <h3 class="text-lg font-bold">Editor Rubrik & Kunci Penilaian Kertas</h3>
            <p class="text-xs text-blue-100">Sumber kebenaran penilaian AI. Nilai per butir divalidasi tidak melebihi skor maksimum.</p>
          </div>
        </div>
        <button
          @click="$emit('update:modelValue', false)"
          class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <!-- Konten Daftar Butir Soal -->
      <div class="p-6 overflow-y-auto flex-1 space-y-6">
        <div class="flex items-center justify-between bg-blue-50/80 p-3.5 rounded-xl border border-blue-200">
          <div class="text-xs text-blue-900 leading-relaxed">
            <span class="font-bold">Total Butir Soal:</span> {{ localRubric.length }} butir | 
            <span class="font-bold">Total Skor Maksimal:</span> {{ totalMaxScore }} poin (Diskalakan ke 0–100 pada rekap nilai)
          </div>
          <button
            @click="addItem"
            type="button"
            class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>+ Tambah Butir Soal</span>
          </button>
        </div>

        <div v-for="(item, idx) in localRubric" :key="item.id || idx" class="p-4 bg-gray-50 border border-gray-200 rounded-xl relative hover:border-blue-300 transition-all space-y-4">
          <!-- Nomor & Judul Butir -->
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-2 flex-1">
              <span class="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {{ idx + 1 }}
              </span>
              <input
                v-model="item.title"
                type="text"
                class="flex-1 px-3 py-1.5 text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Judul / Indikator Butir Soal"
              />
            </div>

            <!-- Tipe Soal -->
            <select
              v-model="item.type"
              class="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="pilihan_ganda">Pilihan Ganda</option>
              <option value="isian_singkat">Isian Singkat</option>
              <option value="uraian">Uraian Terstruktur</option>
              <option value="esai">Esai Panjang (Multi-Kriteria)</option>
            </select>

            <!-- Skor Maksimum -->
            <div class="flex items-center gap-1.5">
              <span class="text-xs text-gray-500 font-medium">Maks:</span>
              <input
                v-model.number="item.max_score"
                type="number"
                min="1"
                max="100"
                class="w-16 px-2.5 py-1 text-xs font-bold text-center text-blue-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Hapus Butir -->
            <button
              v-if="localRubric.length > 1"
              @click="removeItem(idx)"
              type="button"
              class="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 text-xs transition-colors"
              title="Hapus butir ini"
            >
              🗑️
            </button>
          </div>

          <!-- Kunci Jawaban (Objektif) -->
          <div v-if="item.type === 'pilihan_ganda' || item.type === 'isian_singkat'" class="bg-white p-3 rounded-lg border border-gray-200">
            <label class="block text-xs font-bold text-gray-700 mb-1">Kunci Jawaban Persis:</label>
            <input
              v-model="item.answer_key"
              type="text"
              class="w-full px-3 py-1.5 text-xs text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              :placeholder="item.type === 'pilihan_ganda' ? 'Contoh: A (atau B, C, D)' : 'Contoh: Algoritma Pencarian'"
            />
            <p class="text-[11px] text-gray-400 mt-1">AI akan mencocokkan persis transkripsi tulisan siswa dengan kunci ini.</p>
          </div>

          <!-- Deskripsi Rubrik (Uraian) -->
          <div v-if="item.type === 'uraian'" class="bg-white p-3 rounded-lg border border-gray-200">
            <label class="block text-xs font-bold text-gray-700 mb-1">Deskripsi Rubrik & Kriteria Penilaian:</label>
            <textarea
              v-model="item.description"
              rows="2"
              class="w-full px-3 py-1.5 text-xs text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Skor 10 jika menyebutkan definisi lengkap beserta 2 contoh nyata. Skor 5 jika hanya menyebutkan definisi."
            ></textarea>
          </div>

          <!-- Mode Esai: Multi Kriteria -->
          <div v-if="item.type === 'esai'" class="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-200 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-xs font-bold text-indigo-900">Kriteria Penilaian Esai</h4>
                <p class="text-[11px] text-indigo-600">AI menilai setiap kriteria terpisah dan mengutip kalimat bukti dari teks siswa.</p>
              </div>
              <button
                @click="addCriterion(item)"
                type="button"
                class="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded-md flex items-center gap-1 shadow-sm"
              >
                + Tambah Kriteria
              </button>
            </div>

            <div class="space-y-2">
              <div
                v-for="(crit, ci) in item.criteria"
                :key="crit.id || ci"
                class="bg-white p-2.5 rounded-lg border border-indigo-100 flex items-center justify-between gap-3 text-xs"
              >
                <div class="flex items-center gap-2 flex-1">
                  <span class="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                    {{ ci + 1 }}
                  </span>
                  <input
                    v-model="crit.name"
                    type="text"
                    class="flex-1 px-2.5 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                    placeholder="Nama Kriteria (misal: Ketepatan Konsep / Logika Argumen)"
                  />
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="text-[11px] text-gray-500">Maks:</span>
                  <input
                    v-model.number="crit.max_score"
                    type="number"
                    min="1"
                    max="50"
                    class="w-12 px-1.5 py-1 text-xs font-bold text-center border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <button
                  v-if="item.criteria.length > 1"
                  @click="removeCriterion(item, ci)"
                  type="button"
                  class="text-red-400 hover:text-red-600 text-xs px-1"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Modal -->
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <button
          @click="$emit('update:modelValue', false)"
          type="button"
          class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Batal
        </button>
        <button
          @click="saveRubric"
          type="button"
          class="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all flex items-center gap-2"
        >
          <span>💾 Simpan Perubahan Rubrik</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  rubric: any[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'save', rubric: any[]): void
}>()

const localRubric = ref<any[]>([])

watch(
  () => props.rubric,
  (val) => {
    if (Array.isArray(val) && val.length > 0) {
      localRubric.value = JSON.parse(JSON.stringify(val))
    } else {
      localRubric.value = [
        {
          id: `item-${Date.now()}-1`,
          number: 1,
          title: 'Soal 1',
          type: 'uraian',
          answer_key: '',
          max_score: 10,
          description: 'Ketepatan konsep materi dan penjelasan.',
          criteria: []
        }
      ]
    }
  },
  { immediate: true, deep: true }
)

const totalMaxScore = computed(() => {
  return localRubric.value.reduce((sum, item) => sum + (Number(item.max_score) || 0), 0)
})

function addItem() {
  const nextNum = localRubric.value.length + 1
  localRubric.value.push({
    id: `item-${Date.now()}-${nextNum}`,
    number: nextNum,
    title: `Soal ${nextNum}`,
    type: 'uraian',
    answer_key: '',
    max_score: 10,
    description: '',
    criteria: []
  })
}

function removeItem(idx: number) {
  localRubric.value.splice(idx, 1)
  localRubric.value.forEach((item, i) => {
    item.number = i + 1
  })
}

function addCriterion(item: any) {
  item.criteria = item.criteria || []
  const cNum = item.criteria.length + 1
  item.criteria.push({
    id: `crit-${Date.now()}-${cNum}`,
    name: `Kriteria ${cNum}`,
    max_score: 4,
    levels: [
      { score: 4, desc: 'Sangat Baik' },
      { score: 3, desc: 'Baik' },
      { score: 2, desc: 'Cukup' },
      { score: 1, desc: 'Kurang' }
    ]
  })
}

function removeCriterion(item: any, ci: number) {
  item.criteria.splice(ci, 1)
}

function saveRubric() {
  emit('save', JSON.parse(JSON.stringify(localRubric.value)))
  emit('update:modelValue', false)
}
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

