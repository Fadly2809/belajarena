<template>
  <div
    class="relative w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96 flex items-center justify-center select-none"
    :class="{ 'reduce-anim': reducedMotion }"
  >
    <!-- Ground Shadow & Glow -->
    <div class="absolute bottom-2 w-64 h-12 bg-blue-950/50 rounded-full blur-xl pointer-events-none transform scale-y-50"></div>
    <div class="absolute inset-4 rounded-full bg-blue-500/20 blur-3xl pointer-events-none animate-pulse-slow"></div>

    <!-- Main Tower Defense Stage -->
    <div class="relative w-full h-full flex items-center justify-center float-tower">
      <!-- Pulsing Concentric Energy Shield Rings -->
      <div class="absolute z-0 flex items-center justify-center pointer-events-none">
        <div class="w-60 h-60 sm:w-72 sm:h-72 rounded-full border border-cyan-400/20 animate-pulse-ring"></div>
        <div class="absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 border-dashed border-blue-400/30 animate-spin-slow"></div>
      </div>

      <!-- Vector Defense Citadel SVG -->
      <svg
        viewBox="0 0 240 280"
        class="w-full h-auto max-w-[260px] filter drop-shadow-[0_20px_45px_rgba(37,99,235,0.8)] z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="crystalGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#E0F2FE" />
            <stop offset="35%" stop-color="#38BDF8" />
            <stop offset="75%" stop-color="#2563EB" />
            <stop offset="100%" stop-color="#1E3A8A" />
          </linearGradient>
          <linearGradient id="towerWall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#334155" />
            <stop offset="50%" stop-color="#1E293B" />
            <stop offset="100%" stop-color="#0F172A" />
          </linearGradient>
          <linearGradient id="goldTrim" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#FDE047" />
            <stop offset="50%" stop-color="#CA8A04" />
            <stop offset="100%" stop-color="#EAB308" />
          </linearGradient>
          <filter id="crystalGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        <!-- Foundation & Ground Bastion Platform -->
        <polygon points="30,250 210,250 195,220 45,220" fill="url(#towerWall)" stroke="#1E3A8A" stroke-width="2" />
        <rect x="50" y="222" width="140" height="6" fill="url(#goldTrim)" />

        <!-- Lower Tower Tier -->
        <polygon points="55,220 185,220 175,150 65,150" fill="url(#towerWall)" stroke="#0F172A" stroke-width="2" />
        <!-- Stone Brick Lines -->
        <line x1="75" y1="180" x2="165" y2="180" stroke="#475569" stroke-width="1.5" />
        <line x1="120" y1="150" x2="120" y2="180" stroke="#475569" stroke-width="1.5" />
        <line x1="95" y1="180" x2="95" y2="220" stroke="#475569" stroke-width="1.5" />
        <line x1="145" y1="180" x2="145" y2="220" stroke="#475569" stroke-width="1.5" />

        <!-- Middle Battlements & Turrets -->
        <rect x="55" y="142" width="130" height="8" rx="2" fill="url(#goldTrim)" />
        <polygon points="50,142 65,142 65,130 50,130" fill="url(#towerWall)" stroke="#38BDF8" stroke-width="1" />
        <polygon points="80,142 95,142 95,130 80,130" fill="url(#towerWall)" stroke="#38BDF8" stroke-width="1" />
        <polygon points="145,142 160,142 160,130 145,130" fill="url(#towerWall)" stroke="#38BDF8" stroke-width="1" />
        <polygon points="175,142 190,142 190,130 175,130" fill="url(#towerWall)" stroke="#38BDF8" stroke-width="1" />

        <!-- Upper Tower Spire Base -->
        <polygon points="75,140 165,140 155,90 85,90" fill="url(#towerWall)" stroke="#1E293B" stroke-width="2" />
        <!-- Arch Window with Energy Glow -->
        <path d="M 108 120 C 108 108, 132 108, 132 120 L 132 135 L 108 135 Z" fill="#38BDF8" filter="url(#crystalGlow)" opacity="0.8" />

        <!-- Spire Pillar Mount -->
        <polygon points="90,90 150,90 140,75 100,75" fill="url(#goldTrim)" stroke="#713F12" stroke-width="1" />

        <!-- Giant Floating Apex Defense Crystal (Hovering & Glowing) -->
        <g class="crystal-float">
          <!-- Outer Aura Polygon -->
          <polygon
            points="120,8 152,48 120,72 88,48"
            fill="url(#crystalGrad)"
            stroke="#BAE6FD"
            stroke-width="2.5"
            filter="url(#crystalGlow)"
          />
          <!-- Crystal Facets -->
          <polygon points="120,8 152,48 120,72" fill="#38BDF8" opacity="0.6" />
          <polygon points="120,8 88,48 120,72" fill="#60A5FA" opacity="0.9" />
          <line x1="120" y1="8" x2="120" y2="72" stroke="#FFFFFF" stroke-width="2" />
          <!-- White Specular Sparkle -->
          <circle cx="114" cy="30" r="4" fill="#FFFFFF" opacity="0.9" />
        </g>
      </svg>

      <!-- Wave Indicator Pill (Top Right) -->
      <div class="absolute -top-3 right-2 z-30 px-3.5 py-1 rounded-full bg-slate-900/95 border-2 border-blue-400 text-blue-300 font-black text-xs shadow-xl flex items-center gap-1.5 animate-bounce-subtle">
        <span>🛡️</span>
        <span>5 WAVES DEFENSE</span>
      </div>

      <!-- Floating Mana Defense Orbs -->
      <div class="absolute top-16 left-4 text-xl animate-float-left pointer-events-none">💎</div>
      <div class="absolute bottom-16 right-4 text-xl animate-float-right pointer-events-none">⚡</div>
      <div class="absolute top-1/3 -right-2 text-lg text-cyan-300 animate-pulse pointer-events-none">✨</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  reducedMotion?: boolean
}>()
</script>

<style scoped>
@keyframes floatTower {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes crystalFloat {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-5px) scale(1.05);
  }
}

@keyframes pulseRing {
  0%, 100% {
    transform: scale(0.95);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.6;
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

@keyframes bounceSubtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.float-tower {
  animation: floatTower 4s ease-in-out infinite;
}

.crystal-float {
  animation: crystalFloat 2.8s ease-in-out infinite;
}

.animate-pulse-ring {
  animation: pulseRing 3s ease-in-out infinite;
}

.animate-spin-slow {
  animation: spinSlow 15s linear infinite;
}

.animate-bounce-subtle {
  animation: bounceSubtle 2.5s ease-in-out infinite;
}

.reduce-anim .float-tower,
.reduce-anim .crystal-float,
.reduce-anim .animate-pulse-ring,
.reduce-anim .animate-spin-slow,
.reduce-anim .animate-bounce-subtle {
  animation: none !important;
  transform: none !important;
}
</style>

