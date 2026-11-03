<template>
  <div
    class="relative w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96 flex items-center justify-center select-none"
    :class="{ 'reduce-anim': reducedMotion }"
  >
    <!-- Ground Shadow & Glow -->
    <div class="absolute bottom-2 w-72 h-14 bg-emerald-950/50 rounded-full blur-xl pointer-events-none transform scale-y-50"></div>
    <div class="absolute inset-4 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none animate-pulse-slow"></div>

    <!-- Main Racing Vehicle Stage -->
    <div class="relative w-full h-full flex items-center justify-center float-race">
      <!-- Speed Wind Streaks Behind Car -->
      <div class="absolute w-full flex flex-col gap-3 pointer-events-none opacity-40">
        <div class="h-0.5 bg-gradient-to-r from-transparent via-emerald-300 to-transparent w-full transform -translate-x-4 animate-dash"></div>
        <div class="h-0.5 bg-gradient-to-r from-transparent via-lime-300 to-transparent w-4/5 transform translate-x-2 animate-dash-delay"></div>
        <div class="h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent w-3/4 transform -translate-x-2 animate-dash"></div>
      </div>

      <!-- Vector Supercar SVG Rig -->
      <svg
        viewBox="0 0 320 220"
        class="w-full h-auto max-w-[340px] filter drop-shadow-[0_20px_40px_rgba(22,163,74,0.7)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="raceBodyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#4ADE80" />
            <stop offset="30%" stop-color="#22C55E" />
            <stop offset="70%" stop-color="#16A34A" />
            <stop offset="100%" stop-color="#052E16" />
          </linearGradient>
          <linearGradient id="cockpitGlass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#67E8F9" stop-opacity="0.9" />
            <stop offset="60%" stop-color="#0284C7" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#0F172A" />
          </linearGradient>
          <linearGradient id="neonStripe" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#FACC15" />
            <stop offset="50%" stop-color="#A3E635" />
            <stop offset="100%" stop-color="#22C55E" />
          </linearGradient>
          <filter id="headlightGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        <!-- Underglow Neon -->
        <ellipse cx="160" cy="180" rx="110" ry="16" fill="#22C55E" opacity="0.4" filter="url(#headlightGlow)" />

        <!-- Rear Wing / Aerodynamic Spoiler -->
        <path d="M 40 100 L 95 105 L 90 120 L 35 115 Z" fill="#0F172A" stroke="#22C55E" stroke-width="2" />
        <path d="M 45 102 L 35 70 L 60 70 L 68 103 Z" fill="#16A34A" stroke="#0F172A" stroke-width="1.5" />
        <rect x="25" y="65" width="55" height="8" rx="3" fill="#4ADE80" stroke="#052E16" stroke-width="1.5" />

        <!-- Car Chassis / Body (Isometric 3/4 Front Angled View) -->
        <path
          d="M 50 145 C 55 125, 90 115, 130 110 C 180 105, 220 115, 275 140 C 290 148, 295 160, 275 168 C 240 176, 120 178, 60 172 C 45 170, 45 155, 50 145 Z"
          fill="url(#raceBodyGrad)"
          stroke="#052E16"
          stroke-width="2.5"
        />

        <!-- Cockpit Canopy Glass -->
        <path
          d="M 115 112 C 135 90, 175 90, 205 112 C 190 125, 145 125, 115 112 Z"
          fill="url(#cockpitGlass)"
          stroke="#082F49"
          stroke-width="2"
        />
        <!-- Reflection highlight on cockpit -->
        <path d="M 130 100 Q 160 96 185 106" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.7" />

        <!-- Racing Decal Stripes -->
        <path d="M 125 112 L 245 146 L 240 152 L 120 118 Z" fill="url(#neonStripe)" />
        <circle cx="180" cy="138" r="14" fill="#FFFFFF" stroke="#052E16" stroke-width="1.5" />
        <text x="180" y="143" font-size="12" font-weight="900" fill="#0F172A" text-anchor="middle" font-family="sans-serif">01</text>

        <!-- Wheels with Rims & Brake Calipers -->
        <!-- Rear Left Wheel -->
        <g>
          <ellipse cx="85" cy="162" rx="22" ry="22" fill="#0F172A" stroke="#334155" stroke-width="3" />
          <ellipse cx="85" cy="162" rx="14" ry="14" fill="#1E293B" />
          <circle cx="85" cy="162" r="6" fill="#FACC15" />
          <line x1="85" y1="148" x2="85" y2="176" stroke="#64748B" stroke-width="2" />
          <line x1="71" y1="162" x2="99" y2="162" stroke="#64748B" stroke-width="2" />
        </g>
        <!-- Front Left Wheel -->
        <g>
          <ellipse cx="245" cy="165" rx="20" ry="20" fill="#0F172A" stroke="#334155" stroke-width="3" />
          <ellipse cx="245" cy="165" rx="12" ry="12" fill="#1E293B" />
          <circle cx="245" cy="165" r="5" fill="#FACC15" />
          <line x1="245" y1="153" x2="245" y2="177" stroke="#64748B" stroke-width="2" />
          <line x1="233" y1="165" x2="257" y2="165" stroke="#64748B" stroke-width="2" />
        </g>

        <!-- Front Splitter & Glowing Headlights -->
        <path d="M 270 152 L 295 158 L 290 166 L 265 160 Z" fill="#0F172A" stroke="#22C55E" stroke-width="1.5" />
        <!-- Headlight Beams -->
        <polygon points="280,154 318,140 318,175 285,162" fill="#FEF08A" opacity="0.4" filter="url(#headlightGlow)" />
        <ellipse cx="282" cy="156" rx="5" ry="3" fill="#FEF08A" />
      </svg>

      <!-- Checkered Racing Flag (Top Right) -->
      <div class="absolute -top-3 -right-2 z-30 px-3 py-1 rounded-full bg-slate-900/95 border-2 border-emerald-400 text-emerald-300 font-black text-xs shadow-xl flex items-center gap-1.5 animate-bounce-subtle">
        <span>🏁</span>
        <span>500M CIRCUIT</span>
      </div>

      <!-- Nitro Fire Flame Particle (Left / Exhaust) -->
      <div class="absolute bottom-12 left-2 text-2xl animate-flame pointer-events-none">🔥</div>
      <div class="absolute top-10 left-6 text-xl animate-float-left pointer-events-none">⚡</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  reducedMotion?: boolean
}>()
</script>

<style scoped>
@keyframes floatRace {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-6px) rotate(-1deg);
  }
}

@keyframes dash {
  0% {
    transform: translateX(-10%);
    opacity: 0.2;
  }
  50% {
    transform: translateX(10%);
    opacity: 0.7;
  }
  100% {
    transform: translateX(-10%);
    opacity: 0.2;
  }
}

@keyframes flame {
  0%, 100% {
    transform: scale(0.9) translateX(0);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.15) translateX(-4px);
    opacity: 1;
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

.float-race {
  animation: floatRace 3.5s ease-in-out infinite;
}

.animate-dash {
  animation: dash 2.5s ease-in-out infinite;
}

.animate-dash-delay {
  animation: dash 3s ease-in-out infinite 0.5s;
}

.animate-flame {
  animation: flame 1.2s ease-in-out infinite;
}

.animate-bounce-subtle {
  animation: bounceSubtle 2.5s ease-in-out infinite;
}

.reduce-anim .float-race,
.reduce-anim .animate-dash,
.reduce-anim .animate-dash-delay,
.reduce-anim .animate-flame,
.reduce-anim .animate-bounce-subtle {
  animation: none !important;
  transform: none !important;
}
</style>

