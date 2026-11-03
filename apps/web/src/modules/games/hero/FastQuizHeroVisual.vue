<template>
  <div
    class="relative w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96 flex items-center justify-center select-none"
    :class="{ 'reduce-anim': reducedMotion }"
  >
    <!-- Ground Shadow & Glow -->
    <div class="absolute bottom-2 w-64 h-12 bg-amber-950/40 rounded-full blur-xl pointer-events-none transform scale-y-50"></div>
    <div class="absolute inset-4 rounded-full bg-orange-500/20 blur-3xl pointer-events-none animate-pulse-slow"></div>

    <!-- Main Floating Stage -->
    <div class="relative w-full h-full flex items-center justify-center float-card">
      <!-- Question Card Behind Lightning (3D Tilt) -->
      <div class="absolute w-56 h-68 sm:w-64 sm:h-76 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-orange-950/90 border-2 border-orange-400/50 shadow-2xl p-5 flex flex-col justify-between transform -rotate-6 hover:rotate-0 transition-transform duration-500 backdrop-blur-md">
        <!-- Top Card Bar -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-full bg-rose-500"></span>
            <span class="w-3 h-3 rounded-full bg-amber-500"></span>
            <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
          </div>
          <span class="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
            SOAL #01
          </span>
        </div>

        <!-- Question Body Placeholder Lines -->
        <div class="space-y-2.5 my-auto">
          <div class="h-3 w-4/5 rounded bg-white/30"></div>
          <div class="h-3 w-full rounded bg-white/20"></div>
          <div class="h-3 w-3/5 rounded bg-white/20"></div>
        </div>

        <!-- 4 Answer Options Pills -->
        <div class="grid grid-cols-2 gap-2 pt-2">
          <div class="px-2.5 py-1.5 rounded-xl bg-orange-500/20 border border-orange-400/40 text-[10px] font-bold text-orange-200 flex items-center gap-1.5 shadow-sm">
            <span class="w-4 h-4 rounded-full bg-orange-400 text-slate-950 font-black text-[9px] flex items-center justify-center">A</span>
            <span class="truncate">Opsi Alpha</span>
          </div>
          <div class="px-2.5 py-1.5 rounded-xl bg-white/10 border border-white/20 text-[10px] font-bold text-white/70 flex items-center gap-1.5">
            <span class="w-4 h-4 rounded-full bg-white/20 text-white font-black text-[9px] flex items-center justify-center">B</span>
            <span class="truncate">Opsi Beta</span>
          </div>
          <div class="px-2.5 py-1.5 rounded-xl bg-white/10 border border-white/20 text-[10px] font-bold text-white/70 flex items-center gap-1.5">
            <span class="w-4 h-4 rounded-full bg-white/20 text-white font-black text-[9px] flex items-center justify-center">C</span>
            <span class="truncate">Opsi Gamma</span>
          </div>
          <div class="px-2.5 py-1.5 rounded-xl bg-white/10 border border-white/20 text-[10px] font-bold text-white/70 flex items-center gap-1.5">
            <span class="w-4 h-4 rounded-full bg-white/20 text-white font-black text-[9px] flex items-center justify-center">D</span>
            <span class="truncate">Opsi Delta</span>
          </div>
        </div>
      </div>

      <!-- Giant High-Voltage Lightning Bolt SVG in Center -->
      <div class="relative z-20 flex items-center justify-center bolt-glow">
        <svg
          class="w-48 h-48 sm:w-56 sm:h-56 filter drop-shadow-[0_15px_35px_rgba(249,115,22,0.85)]"
          viewBox="0 0 100 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="boltGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#FFFBEB" />
              <stop offset="25%" stop-color="#FDE047" />
              <stop offset="60%" stop-color="#F97316" />
              <stop offset="100%" stop-color="#EA580C" />
            </linearGradient>
            <filter id="boltNeon" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>
          <!-- Lightning Polygon -->
          <polygon
            points="58,6 18,66 48,66 38,114 84,48 54,48"
            fill="url(#boltGrad)"
            stroke="#FFFFFF"
            stroke-width="2.5"
            stroke-linejoin="round"
            filter="url(#boltNeon)"
          />
          <!-- Core Energy Streak -->
          <polygon
            points="56,12 26,62 48,62 42,98 74,52 52,52"
            fill="#FFFFFF"
            opacity="0.85"
          />
        </svg>
      </div>

      <!-- Glowing Timer Pill Badge (Top Right) -->
      <div class="absolute -top-2 right-4 z-30 px-3 py-1.5 rounded-full bg-slate-900/95 border-2 border-amber-400 text-amber-300 font-mono font-black text-xs sm:text-sm shadow-xl flex items-center gap-1.5 animate-bounce-subtle">
        <span class="text-amber-400">⏱️</span>
        <span>15s</span>
      </div>

      <!-- Floating Energy Sparkles -->
      <div class="absolute top-8 left-4 text-xl sm:text-2xl animate-float-left pointer-events-none">⚡</div>
      <div class="absolute bottom-10 right-6 text-xl sm:text-2xl animate-float-right pointer-events-none">✨</div>
      <div class="absolute top-1/2 -left-3 text-lg text-amber-300 animate-pulse pointer-events-none">💥</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  reducedMotion?: boolean
}>()
</script>

<style scoped>
@keyframes floatCard {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-8px) rotate(1deg);
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

@keyframes floatLeft {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-6px) rotate(-10deg);
  }
}

@keyframes floatRight {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(15deg);
  }
}

.float-card {
  animation: floatCard 4s ease-in-out infinite;
}

.animate-bounce-subtle {
  animation: bounceSubtle 2.5s ease-in-out infinite;
}

.animate-float-left {
  animation: floatLeft 3s ease-in-out infinite;
}

.animate-float-right {
  animation: floatRight 3.5s ease-in-out infinite;
}

.reduce-anim .float-card,
.reduce-anim .animate-bounce-subtle,
.reduce-anim .animate-float-left,
.reduce-anim .animate-float-right {
  animation: none !important;
  transform: none !important;
}
</style>

