<template>
  <div
    class="relative w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96 flex items-center justify-center select-none"
    :class="{ 'reduce-anim': reducedMotion }"
  >
    <!-- Ground Shadow & Glow -->
    <div class="absolute bottom-2 w-64 h-12 bg-purple-950/40 rounded-full blur-xl pointer-events-none transform scale-y-50"></div>
    <div class="absolute inset-4 rounded-full bg-purple-500/20 blur-3xl pointer-events-none animate-pulse-slow"></div>

    <!-- Main Floating Pair of Cards -->
    <div class="relative w-full h-full flex items-center justify-center float-cards">
      <!-- Card 1: Left Card (Concept Card) -->
      <div
        class="absolute -left-1 sm:left-4 z-10 w-40 h-56 sm:w-48 sm:h-64 rounded-3xl bg-gradient-to-br from-purple-800 via-indigo-900 to-slate-950 border-2 border-purple-400/60 shadow-2xl p-4 flex flex-col justify-between transform -rotate-12 hover:-rotate-6 transition-all duration-500 hover:scale-105 backdrop-blur-md"
      >
        <div class="flex items-center justify-between">
          <span class="text-[9px] font-black uppercase tracking-widest text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-400/30">
            KARTU A
          </span>
          <span class="text-xs text-amber-300">⭐</span>
        </div>

        <div class="text-center my-auto space-y-2">
          <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600/40 to-pink-500/30 border border-purple-300/40 flex items-center justify-center text-3xl sm:text-4xl shadow-inner animate-pulse-glow">
            🧠
          </div>
          <p class="text-xs font-black text-white tracking-wide">Konsep Inti</p>
          <div class="h-1.5 w-12 mx-auto rounded-full bg-purple-400/50"></div>
        </div>

        <div class="text-center">
          <span class="text-[9px] font-bold text-purple-200/80">Stimulus Bank Soal</span>
        </div>
      </div>

      <!-- Connecting Synergy Arc / Match Beam -->
      <div class="absolute z-20 flex items-center justify-center pointer-events-none">
        <div class="w-24 h-24 rounded-full border-2 border-dashed border-amber-300/70 animate-spin-slow flex items-center justify-center">
          <div class="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg animate-ping-subtle">
            ⚡
          </div>
        </div>
      </div>

      <!-- Card 2: Right Card (Definition / Match Card) -->
      <div
        class="absolute -right-1 sm:right-4 z-15 w-40 h-56 sm:w-48 sm:h-64 rounded-3xl bg-gradient-to-br from-fuchsia-800 via-purple-950 to-slate-950 border-2 border-fuchsia-400/60 shadow-2xl p-4 flex flex-col justify-between transform rotate-12 hover:rotate-6 transition-all duration-500 hover:scale-105 backdrop-blur-md"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs text-amber-300">⭐</span>
          <span class="text-[9px] font-black uppercase tracking-widest text-fuchsia-300 bg-fuchsia-500/20 px-2 py-0.5 rounded-full border border-fuchsia-400/30">
            KARTU B
          </span>
        </div>

        <div class="text-center my-auto space-y-2">
          <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-gradient-to-tr from-fuchsia-600/40 to-amber-500/30 border border-fuchsia-300/40 flex items-center justify-center text-3xl sm:text-4xl shadow-inner animate-pulse-glow">
            ✨
          </div>
          <p class="text-xs font-black text-white tracking-wide">Fungsi / Kunci</p>
          <div class="h-1.5 w-12 mx-auto rounded-full bg-fuchsia-400/50"></div>
        </div>

        <div class="text-center">
          <span class="text-[9px] font-bold text-fuchsia-200/80">Pasangan Cocok</span>
        </div>
      </div>

      <!-- Match Success Pill Badge (Top Center) -->
      <div class="absolute -top-3 z-30 px-3.5 py-1 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 text-white font-black text-[11px] uppercase tracking-wider shadow-lg flex items-center gap-1.5 border border-white/30 animate-bounce-subtle">
        <span>✓</span>
        <span>PAIR MATCHED!</span>
      </div>

      <!-- Floating Sparkles -->
      <div class="absolute -bottom-2 left-6 text-xl animate-float-left pointer-events-none">🔮</div>
      <div class="absolute top-8 right-2 text-xl animate-float-right pointer-events-none">💫</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  reducedMotion?: boolean
}>()
</script>

<style scoped>
@keyframes floatCards {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes spinSlow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pingSubtle {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.12);
    opacity: 0.9;
  }
}

@keyframes bounceSubtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.float-cards {
  animation: floatCards 4.5s ease-in-out infinite;
}

.animate-spin-slow {
  animation: spinSlow 12s linear infinite;
}

.animate-ping-subtle {
  animation: pingSubtle 2s ease-in-out infinite;
}

.animate-bounce-subtle {
  animation: bounceSubtle 2.5s ease-in-out infinite;
}

.reduce-anim .float-cards,
.reduce-anim .animate-spin-slow,
.reduce-anim .animate-ping-subtle,
.reduce-anim .animate-bounce-subtle {
  animation: none !important;
  transform: none !important;
}
</style>

