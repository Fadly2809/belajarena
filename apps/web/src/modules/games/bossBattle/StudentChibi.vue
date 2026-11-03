<template>
  <div
    class="chibi-student-root inline-flex flex-col items-center select-none"
    :class="[
      `pose-${pose || 'idle'}`,
      { 'is-attacking': pose === 'attack', 'is-hit': pose === 'hit', 'is-cheering': pose === 'cheer' }
    ]"
    :style="{ width: `${size || 60}px` }"
  >
    <!-- Character SVG Rig -->
    <div class="chibi-wrapper relative" :style="{ width: `${size || 60}px`, height: `${(size || 60) * 1.15}px` }">
      <!-- Glow Aura (Green when attacking / Red when hit / Gold when victory) -->
      <div v-if="pose === 'attack'" class="aura-green"></div>
      <div v-else-if="pose === 'hit'" class="aura-red"></div>
      <div v-else-if="pose === 'cheer'" class="aura-gold"></div>

      <svg
        viewBox="0 0 100 115"
        class="w-full h-full drop-shadow-md overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <!-- Hair Gradient: Boy Spiky Dark -->
          <linearGradient :id="`hairGrad-${uid}`" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" :stop-color="hairColor || '#292524'" />
            <stop offset="100%" :stop-color="hairShade || '#1c1917'" />
          </linearGradient>

          <!-- Skin Gradient -->
          <linearGradient :id="`skinGrad-${uid}`" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffedd5" />
            <stop offset="100%" stop-color="#fed7aa" />
          </linearGradient>

          <!-- Academy Blazer Uniform Gradient -->
          <linearGradient :id="`blazerGrad-${uid}`" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" :stop-color="uniformColor || '#1e3a5f'" />
            <stop offset="100%" :stop-color="uniformShade || '#0f172a'" />
          </linearGradient>

          <!-- Skirt Gradient (untuk siswi perempuan) -->
          <linearGradient :id="`skirtGrad-${uid}`" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" :stop-color="uniformColor || '#1e3a5f'" />
            <stop offset="100%" stop-color="#172554" />
          </linearGradient>

          <!-- Eye Glow Filter -->
          <filter :id="`chibiGlow-${uid}`" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Shadow under feet -->
        <ellipse cx="50" cy="110" rx="22" ry="5" fill="rgba(0,0,0,0.4)" />

        <!-- BODY / ACADEMY BLAZER UNIFORM -->
        <g class="chibi-body">
          <!-- Legs / Shoes -->
          <rect x="38" y="98" width="9" height="12" rx="3" :fill="isFemale ? `url(#skinGrad-${uid})` : '#1e293b'" />
          <rect x="53" y="98" width="9" height="12" rx="3" :fill="isFemale ? `url(#skinGrad-${uid})` : '#1e293b'" />
          <!-- Shoes / Brown boots -->
          <ellipse cx="42" cy="109" rx="6" ry="3.5" :fill="isFemale ? '#881337' : '#451a03'" />
          <ellipse cx="57" cy="109" rx="6" ry="3.5" :fill="isFemale ? '#881337' : '#451a03'" />

          <!-- Academy Blazer Jacket -->
          <path
            d="M 32 68 L 68 68 L 74 100 L 26 100 Z"
            :fill="`url(#blazerGrad-${uid})`"
            stroke="#0f172a"
            stroke-width="1.5"
          />

          <!-- Rok / Skirt untuk siswi perempuan -->
          <path
            v-if="isFemale"
            d="M 28 92 L 72 92 L 78 106 L 22 106 Z"
            :fill="`url(#skirtGrad-${uid})`"
            stroke="#0f172a"
            stroke-width="1.2"
          />
          <!-- Garis lipatan rok siswi -->
          <template v-if="isFemale">
            <line x1="38" y1="93" x2="35" y2="105" stroke="#0f172a" stroke-width="0.8" opacity="0.6" />
            <line x1="50" y1="93" x2="50" y2="105" stroke="#0f172a" stroke-width="0.8" opacity="0.6" />
            <line x1="62" y1="93" x2="65" y2="105" stroke="#0f172a" stroke-width="0.8" opacity="0.6" />
            <path d="M 28 92 L 72 92" stroke="#facc15" stroke-width="1" opacity="0.6" />
          </template>

          <!-- White shirt collar & tie -->
          <polygon points="50,68 44,78 56,78" fill="#ffffff" />
          <polygon points="48,76 52,76 53,88 50,91 47,88" fill="#dc2626" />
          <polygon points="48,75 52,75 53,78 47,78" fill="#facc15" />

          <!-- Gold Blazer buttons and trim -->
          <circle cx="50" cy="85" r="1.5" fill="#facc15" />
          <circle cx="50" cy="92" r="1.5" fill="#facc15" />
          <path d="M 32 100 L 68 100" stroke="#facc15" stroke-width="1" opacity="0.6" />

          <!-- ARMS -->
          <!-- 1. Normal / Idle Arms -->
          <template v-if="pose === 'idle' || !pose">
            <path d="M 28 72 C 22 80, 22 92, 26 96 C 29 97, 34 94, 32 85 Z" :fill="`url(#blazerGrad-${uid})`" stroke="#0f172a" stroke-width="1.2" />
            <circle cx="27" cy="95" r="4" :fill="`url(#skinGrad-${uid})`" />

            <path d="M 72 72 C 78 80, 78 92, 74 96 C 71 97, 66 94, 68 85 Z" :fill="`url(#blazerGrad-${uid})`" stroke="#0f172a" stroke-width="1.2" />
            <circle cx="73" cy="95" r="4" :fill="`url(#skinGrad-${uid})`" />
          </template>

          <!-- 2. Attacking Arms (Hands raised forward casting magic laser) -->
          <template v-else-if="pose === 'attack'">
            <!-- Left Arm raised -->
            <path d="M 30 72 L 20 60 L 26 58 L 36 70 Z" :fill="`url(#blazerGrad-${uid})`" stroke="#0f172a" stroke-width="1.2" />
            <circle cx="21" cy="58" r="5" fill="#22c55e" :filter="`url(#chibiGlow-${uid})`" />
            <circle cx="21" cy="58" r="3.5" :fill="`url(#skinGrad-${uid})`" />

            <!-- Right Arm raised -->
            <path d="M 70 72 L 80 60 L 74 58 L 64 70 Z" :fill="`url(#blazerGrad-${uid})`" stroke="#0f172a" stroke-width="1.2" />
            <circle cx="79" cy="58" r="5" fill="#22c55e" :filter="`url(#chibiGlow-${uid})`" />
            <circle cx="79" cy="58" r="3.5" :fill="`url(#skinGrad-${uid})`" />
          </template>

          <!-- 3. Hit Arms (Defensive recoil) -->
          <template v-else-if="pose === 'hit'">
            <path d="M 30 72 L 36 82 L 44 80 L 38 70 Z" :fill="`url(#blazerGrad-${uid})`" stroke="#0f172a" stroke-width="1.2" />
            <circle cx="43" cy="80" r="4" :fill="`url(#skinGrad-${uid})`" />

            <path d="M 70 72 L 64 82 L 56 80 L 62 70 Z" :fill="`url(#blazerGrad-${uid})`" stroke="#0f172a" stroke-width="1.2" />
            <circle cx="57" cy="80" r="4" :fill="`url(#skinGrad-${uid})`" />
          </template>

          <!-- 4. Cheer Arms (Hands raised high celebrating victory) -->
          <template v-else-if="pose === 'cheer'">
            <path d="M 30 72 L 18 52 L 24 50 L 36 68 Z" :fill="`url(#blazerGrad-${uid})`" stroke="#0f172a" stroke-width="1.2" />
            <circle cx="19" cy="50" r="4.5" :fill="`url(#skinGrad-${uid})`" />

            <path d="M 70 72 L 82 52 L 76 50 L 64 68 Z" :fill="`url(#blazerGrad-${uid})`" stroke="#0f172a" stroke-width="1.2" />
            <circle cx="81" cy="50" r="4.5" :fill="`url(#skinGrad-${uid})`" />
          </template>
        </g>

        <!-- HEAD & FACE -->
        <g class="chibi-head">
          <!-- Ears -->
          <circle cx="22" cy="46" r="6" :fill="`url(#skinGrad-${uid})`" />
          <circle cx="78" cy="46" r="6" :fill="`url(#skinGrad-${uid})`" />

          <!-- Face Shape (Cute Chibi round anime cheeks) -->
          <ellipse cx="50" cy="45" rx="28" ry="25" :fill="`url(#skinGrad-${uid})`" />
          <path d="M 23 44 C 23 62, 77 62, 77 44 Z" :fill="`url(#skinGrad-${uid})`" />

          <!-- Blush cheeks -->
          <ellipse cx="32" cy="52" rx="4.5" ry="2.5" fill="#f43f5e" opacity="0.3" />
          <ellipse cx="68" cy="52" rx="4.5" ry="2.5" fill="#f43f5e" opacity="0.3" />

          <!-- EYES: Big Anime Eyes -->
          <template v-if="pose !== 'hit'">
            <!-- Left Eye -->
            <ellipse cx="37" cy="44" rx="6.5" ry="8" fill="#0f172a" />
            <ellipse cx="37" cy="44" rx="5.5" ry="7" fill="#1e293b" />
            <!-- Eye Iris & Highlights -->
            <circle cx="36" cy="46" r="4" :fill="eyeColor || '#0284c7'" />
            <circle cx="35" cy="42" r="2.5" fill="#ffffff" />
            <circle cx="39" cy="47" r="1.2" fill="#ffffff" />
            <!-- Eyebrow -->
            <path d="M 30 34 Q 37 32 43 35" stroke="#1c1917" stroke-width="2" stroke-linecap="round" fill="none" />

            <!-- Right Eye -->
            <ellipse cx="63" cy="44" rx="6.5" ry="8" fill="#0f172a" />
            <ellipse cx="63" cy="44" rx="5.5" ry="7" fill="#1e293b" />
            <circle cx="64" cy="46" r="4" :fill="eyeColor || '#0284c7'" />
            <circle cx="62" cy="42" r="2.5" fill="#ffffff" />
            <circle cx="66" cy="47" r="1.2" fill="#ffffff" />
            <!-- Eyebrow -->
            <path d="M 57 35 Q 63 32 70 34" stroke="#1c1917" stroke-width="2" stroke-linecap="round" fill="none" />
          </template>

          <!-- EYES: Hit / Stunned (> < or X X) -->
          <template v-else>
            <!-- Left > -->
            <path d="M 32 40 L 40 45 L 32 50" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            <!-- Right < -->
            <path d="M 68 40 L 60 45 L 68 50" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </template>

          <!-- MOUTH -->
          <!-- 1. Smile / Idle -->
          <path v-if="pose === 'idle' || !pose" d="M 46 54 Q 50 58 54 54" stroke="#881337" stroke-width="1.8" stroke-linecap="round" fill="none" />
          <!-- 2. Attack / Shout -->
          <path v-else-if="pose === 'attack'" d="M 45 53 Q 50 61 55 53 Z" fill="#991b1b" stroke="#7f1d1d" stroke-width="1.2" />
          <!-- 3. Hit / Wobbly -->
          <path v-else-if="pose === 'hit'" d="M 45 56 Q 50 52 55 56" stroke="#881337" stroke-width="2" stroke-linecap="round" fill="none" />
          <!-- 4. Cheer / Open Happy Mouth -->
          <template v-else-if="pose === 'cheer'">
            <path d="M 44 52 Q 50 63 56 52 Z" fill="#e11d48" stroke="#881337" stroke-width="1.2" />
            <circle cx="50" cy="57" r="2.5" fill="#fda4af" />
          </template>
        </g>

        <!-- HAIRSTYLES (Multiple procedural styles based on styleIndex) -->
        <g class="chibi-hair">
          <!-- STYLE 1: Short Spiky Boy Hair (Bagas, Dimas, Budi, Raka) -->
          <template v-if="resolvedHairStyle === 'spiky'">
            <!-- Back Hair -->
            <path d="M 20 44 C 18 20, 82 20, 80 44 C 82 28, 70 12, 50 12 C 30 12, 18 28, 20 44 Z" :fill="`url(#hairGrad-${uid})`" />
            <!-- Front Bangs & Spikes -->
            <path
              d="M 18 42 C 16 26, 26 12, 50 10 C 74 12, 84 26, 82 42 C 78 35, 75 32, 70 36 C 66 28, 60 25, 55 35 C 50 24, 44 26, 40 36 C 34 30, 26 34, 18 42 Z"
              :fill="`url(#hairGrad-${uid})`"
              stroke="#0f172a"
              stroke-width="1.5"
            />
            <!-- Hair highlight shine line -->
            <path d="M 28 22 Q 40 18 52 20" stroke="#78716c" stroke-width="1.5" fill="none" opacity="0.6" />
          </template>

          <!-- STYLE 2: Bob Cut with Bangs Girl Hair (Rina, Nina, Ani, Dewi) -->
          <template v-else-if="resolvedHairStyle === 'bob'">
            <!-- Side tresses -->
            <path d="M 18 42 C 16 56, 20 68, 24 66 C 26 60, 26 50, 24 44 Z" :fill="`url(#hairGrad-${uid})`" />
            <path d="M 82 42 C 84 56, 80 68, 76 66 C 74 60, 74 50, 76 44 Z" :fill="`url(#hairGrad-${uid})`" />
            <!-- Hair dome & Straight bangs -->
            <path
              d="M 18 40 C 16 20, 30 8, 50 8 C 70 8, 84 20, 82 40 C 78 32, 68 34, 66 32 C 60 35, 54 32, 50 35 C 46 32, 40 35, 34 32 C 32 34, 22 32, 18 40 Z"
              :fill="`url(#hairGrad-${uid})`"
              stroke="#0f172a"
              stroke-width="1.5"
            />
            <!-- Cute hairpin / ribbon -->
            <circle cx="26" cy="28" r="3.5" fill="#f43f5e" />
            <circle cx="26" cy="28" r="1.5" fill="#ffffff" />
          </template>

          <!-- STYLE 3: Wavy / Layered Anime Hair (Fajar, Siti, etc.) -->
          <template v-else>
            <path
              d="M 18 44 C 15 22, 28 10, 50 8 C 72 10, 85 22, 82 44 C 80 34, 72 26, 68 34 C 64 26, 56 26, 52 35 C 48 24, 38 28, 34 36 C 28 30, 22 36, 18 44 Z"
              :fill="`url(#hairGrad-${uid})`"
              stroke="#0f172a"
              stroke-width="1.5"
            />
            <path d="M 32 20 Q 50 15 68 20" stroke="#78716c" stroke-width="1.5" fill="none" opacity="0.6" />
          </template>
        </g>
      </svg>
    </div>

    <!-- Student Name Label under Chibi -->
    <span
      v-if="showName"
      class="text-[10px] font-bold text-white text-center truncate max-w-full mt-0.5 tracking-tight drop-shadow"
    >
      {{ name }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name?: string
  studentId?: string
  size?: number
  pose?: 'idle' | 'attack' | 'hit' | 'cheer'
  showName?: boolean
  hairStyle?: 'spiky' | 'bob' | 'wavy'
  hairColor?: string
  hairShade?: string
  uniformColor?: string
  uniformShade?: string
  eyeColor?: string
  gender?: 'L' | 'P'
}>()

// Generate stable deterministic ID and procedural hairstyle/colors from student name/id
const uid = computed(() => {
  const seed = props.studentId || props.name || 'student'
  return seed.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'std'
})

const resolvedHairStyle = computed(() => {
  if (props.hairStyle) return props.hairStyle
  // Gender prop takes priority over name-based detection
  if (props.gender === 'P') return 'bob'
  if (props.gender === 'L') {
    const seed = props.name || props.studentId || 'A'
    const charCode = seed.charCodeAt(0) + (seed.charCodeAt(seed.length - 1) || 0)
    return charCode % 2 === 0 ? 'spiky' : 'wavy'
  }
  // Fallback: nama-based detection (logic lama)
  const seed = props.name || props.studentId || 'A'
  const charCode = seed.charCodeAt(0) + (seed.charCodeAt(seed.length - 1) || 0)
  const girlNames = ['rina', 'siti', 'ani', 'nina', 'dewi', 'putri', 'maya', 'zahra', 'tiara', 'aulia', 'safira']
  const isGirl = girlNames.some(g => (props.name || '').toLowerCase().includes(g))
  if (isGirl) return 'bob'
  return charCode % 2 === 0 ? 'spiky' : 'wavy'
})

const isFemale = computed(() => {
  if (props.gender === 'P') return true
  if (props.gender === 'L') return false
  return resolvedHairStyle.value === 'bob'
})
</script>

<style scoped>
.chibi-student-root {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pose-idle .chibi-wrapper {
  animation: chibiBob 2.5s ease-in-out infinite alternate;
}

.pose-attack {
  transform: translateY(-4px) scale(1.08);
}

.pose-hit {
  animation: chibiHit 0.4s ease-out;
}

.pose-cheer {
  animation: chibiJump 0.8s ease-in-out infinite alternate;
}

/* Auras */
.aura-green {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.5) 0%, transparent 70%);
  animation: auraPulse 1s ease-in-out infinite alternate;
  pointer-events: none;
}

.aura-red {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(239, 68, 68, 0.6) 0%, transparent 70%);
  animation: auraPulse 0.5s ease-in-out infinite alternate;
  pointer-events: none;
}

.aura-gold {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(250, 204, 21, 0.55) 0%, transparent 70%);
  animation: auraPulse 1.2s ease-in-out infinite alternate;
  pointer-events: none;
}

@keyframes chibiBob {
  0% { transform: translateY(0); }
  100% { transform: translateY(-3px); }
}

@keyframes chibiJump {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(-9px) scale(1.05); }
}

@keyframes chibiHit {
  0% { transform: translateX(0); }
  25% { transform: translateX(-6px) rotate(-6deg); }
  50% { transform: translateX(6px) rotate(4deg); }
  75% { transform: translateX(-3px); }
  100% { transform: translateX(0); }
}

@keyframes auraPulse {
  0% { transform: scale(0.9); opacity: 0.4; }
  100% { transform: scale(1.15); opacity: 0.85; }
}
</style>
