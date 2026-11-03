<template>
  <div
    class="boss-container select-none"
    :class="[
      `pose-${pose || 'idle'}`,
      `boss-${bossId || 'rakus-maximus'}`,
      { 'low-motion': reducedMotion }
    ]"
  >
    <!-- Ground Shadow -->
    <div class="ground-shadow" :class="{ 'ground-shadow-flat': pose === 'defeated' || pose === 'defeat_last_hit' }"></div>

    <!-- Speech Bubble for Boss Laugh -->
    <div v-if="pose === 'laugh'" class="laugh-bubble">
      <span class="bubble-text">HA HA HA!</span>
    </div>

    <!-- Custom Image Avatar if provided -->
    <div v-if="customImageUrl" class="custom-boss-wrap">
      <img
        :src="customImageUrl"
        :alt="name"
        class="custom-boss-img"
        :class="{
          'img-hit': pose === 'hit' || showHit,
          'img-defeated': pose === 'defeated' || pose === 'defeat_last_hit',
          'img-laugh': pose === 'laugh'
        }"
      />
    </div>

    <!-- Procedural Boss Character SVG / Vector Rig -->
    <div v-else class="boss-figure">
      <!-- Aura Glow -->
      <div
        class="boss-aura"
        :style="{
          background: `radial-gradient(circle, ${resolvedAuraColor}44 0%, transparent 70%)`
        }"
      ></div>

      <!-- Boss Body Frame -->
      <svg
        viewBox="0 0 200 220"
        class="boss-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <!-- Shared Filters -->
          <filter :id="eyeGlowId" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <!-- 1. ROBOT GLITCH GRADIENTS -->
          <linearGradient :id="robotArmorGradId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" :stop-color="robotAccent" />
            <stop offset="40%" :stop-color="robotColor" />
            <stop offset="100%" stop-color="#082f49" />
          </linearGradient>
          <linearGradient :id="robotMetalGradId" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#94a3b8" />
            <stop offset="50%" stop-color="#475569" />
            <stop offset="100%" stop-color="#0f172a" />
          </linearGradient>
          <radialGradient :id="robotCoreGradId" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="35%" :stop-color="robotAccent" />
            <stop offset="80%" :stop-color="robotColor" />
            <stop offset="100%" stop-color="#082f49" />
          </radialGradient>

          <!-- 2. RAKUS MAXIMUS GRADIENTS -->
          <radialGradient :id="rakusBodyGradId" cx="50%" cy="40%" r="60%">
            <stop offset="0%" :stop-color="rakusAccent" />
            <stop offset="60%" :stop-color="rakusColor" />
            <stop offset="100%" stop-color="#1e1035" />
          </radialGradient>
          <linearGradient :id="rakusHornGradId" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fef08a" />
            <stop offset="50%" stop-color="#eab308" />
            <stop offset="100%" stop-color="#713f12" />
          </linearGradient>
          <linearGradient :id="rakusArmorGradId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#475569" />
            <stop offset="100%" stop-color="#0f172a" />
          </linearGradient>

          <!-- 3. VIRUS LAMBDA GRADIENTS -->
          <radialGradient :id="virusCoreGradId" cx="45%" cy="40%" r="55%">
            <stop offset="0%" :stop-color="virusAccent" />
            <stop offset="55%" :stop-color="virusColor" />
            <stop offset="100%" stop-color="#022c22" />
          </radialGradient>
          <linearGradient :id="virusTentacleGradId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" :stop-color="virusColor" />
            <stop offset="100%" stop-color="#022c22" />
          </linearGradient>
          <radialGradient :id="virusEyeGradId" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="40%" stop-color="#a3e635" />
            <stop offset="85%" stop-color="#15803d" />
            <stop offset="100%" stop-color="#052e16" />
          </radialGradient>

          <!-- 4. BUGZILLA COMPILER GRADIENTS -->
          <linearGradient :id="bugShellGradId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" :stop-color="bugAccent" />
            <stop offset="45%" :stop-color="bugColor" />
            <stop offset="100%" stop-color="#451a03" />
          </linearGradient>
          <linearGradient :id="bugMandibleGradId" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fef3c7" />
            <stop offset="50%" stop-color="#b45309" />
            <stop offset="100%" stop-color="#292524" />
          </linearGradient>
          <radialGradient :id="bugEyeGradId" cx="45%" cy="40%" r="50%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="40%" stop-color="#ef4444" />
            <stop offset="85%" stop-color="#991b1b" />
            <stop offset="100%" stop-color="#450a0a" />
          </radialGradient>
        </defs>

        <!-- ========================================================
             1. ROBOT GLITCH (Cyber Mecha & Glitch Android)
             ======================================================== -->
        <g v-if="bossId === 'robot-glitch'" class="boss-character char-robot">
          <!-- Mecha Antennas -->
          <g class="robot-antennas">
            <!-- Left Antenna -->
            <path d="M 68 55 L 50 18 L 45 20 L 64 58 Z" :fill="robotMetalGradUrl" stroke="#0f172a" stroke-width="1.5" />
            <circle cx="48" cy="19" r="6" :fill="pose === 'defeated' ? '#64748b' : robotAccent" :filter="pose === 'defeated' ? undefined : eyeGlowUrl" />
            <path v-if="pose !== 'defeated'" d="M 40 14 A 12 12 0 0 0 36 28" fill="none" stroke="#67e8f9" stroke-width="2" opacity="0.7" class="robot-signal" />

            <!-- Right Antenna -->
            <path d="M 132 55 L 150 18 L 155 20 L 136 58 Z" :fill="robotMetalGradUrl" stroke="#0f172a" stroke-width="1.5" />
            <circle cx="152" cy="19" r="6" :fill="pose === 'defeated' ? '#64748b' : robotAccent" :filter="pose === 'defeated' ? undefined : eyeGlowUrl" />
            <path v-if="pose !== 'defeated'" d="M 160 14 A 12 12 0 0 1 164 28" fill="none" stroke="#67e8f9" stroke-width="2" opacity="0.7" class="robot-signal" />
          </g>

          <!-- Arms / Mechanical Servo Claws -->
          <g class="robot-arms">
            <!-- Left Arm -->
            <path d="M 45 100 L 22 125 L 28 150 L 38 145 L 34 128 L 52 110 Z" :fill="robotMetalGradUrl" stroke="#0f172a" stroke-width="1.5" />
            <path d="M 24 150 L 12 165 L 18 168 L 28 155 Z" fill="#38bdf8" stroke="#082f49" stroke-width="1.2" />
            <path d="M 32 148 L 38 168 L 44 165 L 36 148 Z" fill="#38bdf8" stroke="#082f49" stroke-width="1.2" />
            <circle cx="28" cy="150" r="5" fill="#facc15" stroke="#713f12" stroke-width="1" />

            <!-- Right Arm -->
            <path d="M 155 100 L 178 125 L 172 150 L 162 145 L 166 128 L 148 110 Z" :fill="robotMetalGradUrl" stroke="#0f172a" stroke-width="1.5" />
            <path d="M 176 150 L 188 165 L 182 168 L 172 155 Z" fill="#38bdf8" stroke="#082f49" stroke-width="1.2" />
            <path d="M 168 148 L 162 168 L 156 165 L 164 148 Z" fill="#38bdf8" stroke="#082f49" stroke-width="1.2" />
            <circle cx="172" cy="150" r="5" fill="#facc15" stroke="#713f12" stroke-width="1" />
          </g>

          <!-- Heavy Mecha Torso -->
          <g class="robot-torso">
            <polygon points="55,90 145,90 160,165 140,195 60,195 40,165" :fill="robotArmorGradUrl" stroke="#082f49" stroke-width="2.5" />
            <polygon points="62,96 138,96 148,155 132,185 68,185 52,155" fill="#0f172a" stroke="#0284c7" stroke-width="1.2" />

            <!-- Shoulder Pauldrons -->
            <path d="M 30 92 L 60 76 L 62 108 L 26 106 Z" :fill="robotMetalGradUrl" stroke="#38bdf8" stroke-width="1.5" />
            <circle cx="36" cy="98" r="2.5" fill="#67e8f9" />
            <path d="M 170 92 L 140 76 L 138 108 L 174 106 Z" :fill="robotMetalGradUrl" stroke="#38bdf8" stroke-width="1.5" />
            <circle cx="164" cy="98" r="2.5" fill="#67e8f9" />

            <!-- Cooling Vents -->
            <line x1="72" y1="168" x2="128" y2="168" stroke="#334155" stroke-width="2.5" stroke-linecap="round" />
            <line x1="75" y1="174" x2="125" y2="174" stroke="#334155" stroke-width="2.5" stroke-linecap="round" />
            <line x1="80" y1="180" x2="120" y2="180" stroke="#334155" stroke-width="2.5" stroke-linecap="round" />

            <!-- Arc Reactor Core (Center) -->
            <circle cx="100" cy="135" r="18" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" />
            <circle cx="100" cy="135" r="13" :fill="robotCoreGradUrl" :filter="pose === 'defeated' ? undefined : eyeGlowUrl" />
            <polygon points="100,126 108,140 92,140" :fill="pose === 'defeated' ? '#64748b' : '#ffffff'" opacity="0.9" />
          </g>

          <!-- Mecha Head & Glitch Visor -->
          <g class="robot-head">
            <polygon points="65,48 135,48 148,88 132,108 68,108 52,88" :fill="robotMetalGradUrl" stroke="#082f49" stroke-width="2" />
            <!-- Cyber Ear Modules -->
            <rect x="46" y="60" width="8" height="24" rx="2" fill="#0284c7" stroke="#082f49" stroke-width="1" />
            <rect x="146" y="60" width="8" height="24" rx="2" fill="#0284c7" stroke="#082f49" stroke-width="1" />

            <!-- Forehead Plate & Status LED -->
            <polygon points="80,50 120,50 115,60 85,60" fill="#0f172a" stroke="#38bdf8" stroke-width="1" />
            <circle cx="100" cy="55" r="3" :fill="pose === 'defeated' ? '#ef4444' : '#22c55e'" />

            <!-- Glitch Visor Glass Area -->
            <rect x="58" y="66" width="84" height="28" rx="6" fill="#020617" stroke="#38bdf8" stroke-width="2" />

            <!-- VISOR DISPLAY CONTENT (Pose-dependent) -->
            <!-- 1. Normal / Idle / Hit: Digital Cyan Optics / Scanline -->
            <template v-if="pose !== 'defeated' && pose !== 'defeat_last_hit' && pose !== 'laugh'">
              <circle cx="80" cy="80" r="8" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-dasharray="3 2" />
              <circle cx="80" cy="80" r="4" fill="#38bdf8" :filter="eyeGlowUrl" />
              <circle cx="80" cy="80" r="1.5" fill="#ffffff" />

              <circle cx="120" cy="80" r="8" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-dasharray="3 2" />
              <circle cx="120" cy="80" r="4" fill="#38bdf8" :filter="eyeGlowUrl" />
              <circle cx="120" cy="80" r="1.5" fill="#ffffff" />

              <line x1="62" y1="80" x2="138" y2="80" stroke="#67e8f9" stroke-width="1" opacity="0.6" />
            </template>

            <!-- 2. Laugh: Glitch Jagged Waveform / Evil Smile -->
            <template v-else-if="pose === 'laugh'">
              <path d="M 72 84 L 80 74 L 88 84" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" :filter="eyeGlowUrl" />
              <path d="M 112 84 L 120 74 L 128 84" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" :filter="eyeGlowUrl" />
              <path d="M 64 88 L 74 88 L 80 84 L 88 90 L 96 82 L 104 90 L 112 82 L 120 88 L 136 88" fill="none" stroke="#f43f5e" stroke-width="1.8" />
            </template>

            <!-- 3. Defeated: Red Matrix Error / 404 X X -->
            <template v-else>
              <text x="100" y="81" font-family="monospace" font-size="10" font-weight="900" fill="#ef4444" text-anchor="middle" letter-spacing="1">
                ERR:404
              </text>
              <line x1="66" y1="72" x2="76" y2="84" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" />
              <line x1="76" y1="72" x2="66" y2="84" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" />
              <line x1="124" y1="72" x2="134" y2="84" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" />
              <line x1="134" y1="72" x2="124" y2="84" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" />
            </template>

            <!-- Cyber Mouth Speaker Grille -->
            <rect x="85" y="98" width="30" height="5" rx="2" fill="#0f172a" stroke="#334155" stroke-width="1" />
            <line x1="91" y1="99" x2="91" y2="102" stroke="#64748b" stroke-width="1.2" />
            <line x1="96" y1="99" x2="96" y2="102" stroke="#64748b" stroke-width="1.2" />
            <line x1="100" y1="99" x2="100" y2="102" stroke="#64748b" stroke-width="1.2" />
            <line x1="104" y1="99" x2="104" y2="102" stroke="#64748b" stroke-width="1.2" />
            <line x1="109" y1="99" x2="109" y2="102" stroke="#64748b" stroke-width="1.2" />
          </g>

          <!-- Floating Hologram / Glitch Pixels -->
          <g v-if="pose !== 'defeated'" class="glitch-particles" opacity="0.8">
            <rect x="25" y="65" width="6" height="6" fill="#38bdf8" opacity="0.7" />
            <rect x="168" y="72" width="7" height="4" fill="#67e8f9" opacity="0.8" />
            <rect x="162" y="130" width="5" height="5" fill="#f43f5e" opacity="0.6" />
            <text x="28" y="55" font-family="monospace" font-size="8" fill="#38bdf8" opacity="0.7">01</text>
            <text x="165" y="55" font-family="monospace" font-size="8" fill="#67e8f9" opacity="0.7">//</text>
          </g>
        </g>

        <!-- ========================================================
             2. VIRUS LAMBDA (Spiked Toxic Capsid & Undulating Tentacles)
             ======================================================== -->
        <g v-else-if="bossId === 'virus-lambda'" class="boss-character char-virus">
          <!-- Radiating Spikes (Peplomers) from behind the core -->
          <g class="virus-spikes">
            <!-- Top-left spike -->
            <line x1="65" y1="65" x2="40" y2="40" stroke="#047857" stroke-width="5" stroke-linecap="round" />
            <circle cx="36" cy="36" r="8" :fill="virusAccent" :filter="pose === 'defeated' ? undefined : eyeGlowUrl" />

            <!-- Top-right spike -->
            <line x1="135" y1="65" x2="160" y2="40" stroke="#047857" stroke-width="5" stroke-linecap="round" />
            <circle cx="164" cy="36" r="8" :fill="virusAccent" :filter="pose === 'defeated' ? undefined : eyeGlowUrl" />

            <!-- Mid-left spike -->
            <line x1="45" y1="100" x2="18" y2="95" stroke="#047857" stroke-width="5" stroke-linecap="round" />
            <circle cx="14" cy="95" r="7.5" :fill="virusAccent" :filter="pose === 'defeated' ? undefined : eyeGlowUrl" />

            <!-- Mid-right spike -->
            <line x1="155" y1="100" x2="182" y2="95" stroke="#047857" stroke-width="5" stroke-linecap="round" />
            <circle cx="186" cy="95" r="7.5" :fill="virusAccent" :filter="pose === 'defeated' ? undefined : eyeGlowUrl" />

            <!-- Lower-left spike -->
            <line x1="52" y1="132" x2="28" y2="150" stroke="#047857" stroke-width="4.5" stroke-linecap="round" />
            <circle cx="24" cy="154" r="6.5" :fill="virusAccent" :filter="pose === 'defeated' ? undefined : eyeGlowUrl" />

            <!-- Lower-right spike -->
            <line x1="148" y1="132" x2="172" y2="150" stroke="#047857" stroke-width="4.5" stroke-linecap="round" />
            <circle cx="176" cy="154" r="6.5" :fill="virusAccent" :filter="pose === 'defeated' ? undefined : eyeGlowUrl" />
          </g>

          <!-- Undulating Bio-Tentacles (Draping down to arena floor) -->
          <g class="virus-tentacles">
            <!-- Tentacle 1 (Far left) -->
            <path
              d="M 68 140 C 50 160, 42 185, 48 200 C 52 205, 62 200, 56 185 C 52 175, 65 158, 76 145 Z"
              :fill="virusTentacleGradUrl"
              stroke="#022c22"
              stroke-width="1.5"
              class="tentacle t1"
            />
            <circle cx="50" cy="190" r="3" fill="#a3e635" />

            <!-- Tentacle 2 (Mid-left) -->
            <path
              d="M 82 148 C 72 172, 70 192, 76 205 C 80 208, 88 202, 84 190 C 80 178, 88 165, 92 150 Z"
              :fill="virusTentacleGradUrl"
              stroke="#022c22"
              stroke-width="1.5"
              class="tentacle t2"
            />
            <circle cx="78" cy="195" r="3" fill="#a3e635" />

            <!-- Tentacle 3 (Center) -->
            <path
              d="M 96 150 C 94 175, 102 195, 100 208 C 98 212, 106 212, 108 202 C 110 188, 104 172, 104 150 Z"
              :fill="virusTentacleGradUrl"
              stroke="#022c22"
              stroke-width="1.5"
              class="tentacle t3"
            />
            <circle cx="102" cy="198" r="3.5" fill="#a3e635" />

            <!-- Tentacle 4 (Mid-right) -->
            <path
              d="M 118 148 C 128 172, 130 192, 124 205 C 120 208, 112 202, 116 190 C 120 178, 112 165, 108 150 Z"
              :fill="virusTentacleGradUrl"
              stroke="#022c22"
              stroke-width="1.5"
              class="tentacle t4"
            />
            <circle cx="122" cy="195" r="3" fill="#a3e635" />

            <!-- Tentacle 5 (Far right) -->
            <path
              d="M 132 140 C 150 160, 158 185, 152 200 C 148 205, 138 200, 144 185 C 148 175, 135 158, 124 145 Z"
              :fill="virusTentacleGradUrl"
              stroke="#022c22"
              stroke-width="1.5"
              class="tentacle t5"
            />
            <circle cx="150" cy="190" r="3" fill="#a3e635" />
          </g>

          <!-- Spherical/Icosahedral Viral Capsid Core -->
          <g class="virus-body">
            <circle cx="100" cy="100" r="54" :fill="virusCoreGradUrl" stroke="#022c22" stroke-width="3" />

            <!-- Polygonal Facet Shell Plates -->
            <polygon points="100,52 135,70 100,90 65,70" fill="#10b981" opacity="0.35" stroke="#34d399" stroke-width="1" />
            <polygon points="65,70 100,90 75,130 48,110" fill="#047857" opacity="0.4" stroke="#34d399" stroke-width="1" />
            <polygon points="135,70 100,90 125,130 152,110" fill="#047857" opacity="0.4" stroke="#34d399" stroke-width="1" />
            <polygon points="75,130 100,90 125,130 100,148" fill="#065f46" opacity="0.5" stroke="#34d399" stroke-width="1" />

            <!-- Floating Glowing Lambda Crest Symbol (λ) -->
            <g class="virus-crest">
              <path
                d="M 100 24 L 88 50 M 96 34 L 112 50"
                fill="none"
                stroke="#6ee7b7"
                stroke-width="4.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                :filter="pose === 'defeated' ? undefined : eyeGlowUrl"
              />
              <circle cx="100" cy="22" r="3.5" :fill="pose === 'defeated' ? '#64748b' : '#a3e635'" :filter="pose === 'defeated' ? undefined : eyeGlowUrl" />
            </g>

            <!-- Bio Eye Cluster -->
            <!-- 1. Normal / Idle / Hit -->
            <template v-if="pose !== 'defeated' && pose !== 'defeat_last_hit' && pose !== 'laugh'">
              <circle cx="100" cy="100" r="22" fill="#022c22" stroke="#6ee7b7" stroke-width="2.5" />
              <circle cx="100" cy="100" r="16" :fill="virusEyeGradUrl" :filter="eyeGlowUrl" />
              <circle cx="100" cy="100" r="8" fill="#064e3b" />
              <circle cx="102" cy="98" r="3" fill="#ffffff" />
              <!-- Satellite Eyes -->
              <circle cx="74" cy="92" r="7" fill="#022c22" stroke="#34d399" stroke-width="1.5" />
              <circle cx="74" cy="92" r="4.5" fill="#a3e635" :filter="eyeGlowUrl" />
              <circle cx="126" cy="92" r="7" fill="#022c22" stroke="#34d399" stroke-width="1.5" />
              <circle cx="126" cy="92" r="4.5" fill="#a3e635" :filter="eyeGlowUrl" />
            </template>

            <!-- 2. Laugh: Sinister Alien Slit Eye -->
            <template v-else-if="pose === 'laugh'">
              <circle cx="100" cy="100" r="22" fill="#022c22" stroke="#ef4444" stroke-width="2.5" />
              <circle cx="100" cy="100" r="16" :fill="virusEyeGradUrl" :filter="eyeGlowUrl" />
              <polygon points="100,86 104,100 100,114 96,100" fill="#dc2626" />
              <circle cx="102" cy="98" r="2.5" fill="#ffffff" />
              <circle cx="74" cy="92" r="7" fill="#022c22" stroke="#ef4444" stroke-width="1.5" />
              <circle cx="74" cy="92" r="4.5" fill="#f87171" :filter="eyeGlowUrl" />
              <circle cx="126" cy="92" r="7" fill="#022c22" stroke="#ef4444" stroke-width="1.5" />
              <circle cx="126" cy="92" r="4.5" fill="#f87171" :filter="eyeGlowUrl" />
              <path d="M 88 126 Q 100 138 112 126" stroke="#022c22" stroke-width="3" fill="#450a0a" stroke-linecap="round" />
            </template>

            <!-- 3. Defeated: Dimmed Core with X Eyes -->
            <template v-else>
              <circle cx="100" cy="100" r="22" fill="#0f172a" stroke="#475569" stroke-width="2" />
              <line x1="88" y1="88" x2="112" y2="112" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" />
              <line x1="112" y1="88" x2="88" y2="112" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" />
              <line x1="68" y1="86" x2="80" y2="98" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" />
              <line x1="80" y1="86" x2="68" y2="98" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" />
              <line x1="120" y1="86" x2="132" y2="98" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" />
              <line x1="132" y1="86" x2="120" y2="98" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" />
            </template>
          </g>

          <!-- Orbiting Mini Spores -->
          <g v-if="pose !== 'defeated'" class="virus-minions">
            <g class="mini-spore sp1">
              <circle cx="32" cy="120" r="7" fill="#10b981" stroke="#047857" stroke-width="1.5" />
              <circle cx="32" cy="120" r="3" fill="#6ee7b7" />
            </g>
            <g class="mini-spore sp2">
              <circle cx="170" cy="122" r="6" fill="#10b981" stroke="#047857" stroke-width="1.5" />
              <circle cx="170" cy="122" r="2.5" fill="#6ee7b7" />
            </g>
          </g>
        </g>

        <!-- ========================================================
             3. BUGZILLA COMPILER (Insectoid Beetle Mantis)
             ======================================================== -->
        <g v-else-if="bossId === 'bugzilla' || bossId === 'bugzilla-compiler'" class="boss-character char-bug">
          <!-- Segmented Lightning Beetle Antennae -->
          <g class="bug-antennae">
            <!-- Left Antenna -->
            <path
              d="M 80 50 L 60 25 L 42 20 L 30 8"
              fill="none"
              :stroke="bugMandibleGradUrl"
              stroke-width="3"
              stroke-linecap="round"
              class="antenna a-left"
            />
            <circle cx="30" cy="8" r="4.5" :fill="pose === 'defeated' ? '#64748b' : '#ef4444'" :filter="pose === 'defeated' ? undefined : eyeGlowUrl" />
            <line x1="58" y1="26" x2="52" y2="34" stroke="#f59e0b" stroke-width="1.8" />
            <line x1="42" y1="20" x2="38" y2="28" stroke="#f59e0b" stroke-width="1.8" />

            <!-- Right Antenna -->
            <path
              d="M 120 50 L 140 25 L 158 20 L 170 8"
              fill="none"
              :stroke="bugMandibleGradUrl"
              stroke-width="3"
              stroke-linecap="round"
              class="antenna a-right"
            />
            <circle cx="170" cy="8" r="4.5" :fill="pose === 'defeated' ? '#64748b' : '#ef4444'" :filter="pose === 'defeated' ? undefined : eyeGlowUrl" />
            <line x1="142" y1="26" x2="148" y2="34" stroke="#f59e0b" stroke-width="1.8" />
            <line x1="158" y1="20" x2="162" y2="28" stroke="#f59e0b" stroke-width="1.8" />
          </g>

          <!-- Mantis Scythe Arms & Beetle Legs -->
          <g class="bug-limbs">
            <!-- Upper Scythe Arm Left -->
            <path
              d="M 50 100 L 20 85 L 15 115 L 28 120 L 30 96 L 52 110 Z"
              :fill="bugShellGradUrl"
              stroke="#451a03"
              stroke-width="1.8"
            />
            <path d="M 15 115 C 8 135, 18 155, 30 160 C 26 150, 22 135, 28 120 Z" fill="#fcd34d" stroke="#b45309" stroke-width="1.2" />

            <!-- Upper Scythe Arm Right -->
            <path
              d="M 150 100 L 180 85 L 185 115 L 172 120 L 170 96 L 148 110 Z"
              :fill="bugShellGradUrl"
              stroke="#451a03"
              stroke-width="1.8"
            />
            <path d="M 185 115 C 192 135, 182 155, 170 160 C 174 150, 178 135, 172 120 Z" fill="#fcd34d" stroke="#b45309" stroke-width="1.2" />

            <!-- Lower Leg Left -->
            <path d="M 55 150 L 35 175 L 22 195" fill="none" stroke="#78350f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            <!-- Lower Leg Right -->
            <path d="M 145 150 L 165 175 L 178 195" fill="none" stroke="#78350f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          </g>

          <!-- Heavy Chitin Carapace / Beetle Abdomen -->
          <g class="bug-carapace">
            <path
              d="M 60 90 C 40 120, 42 165, 65 190 C 85 208, 115 208, 135 190 C 158 165, 160 120, 140 90 Z"
              :fill="bugShellGradUrl"
              stroke="#451a03"
              stroke-width="2.5"
            />
            <line x1="100" y1="92" x2="100" y2="198" stroke="#451a03" stroke-width="2.5" />
            <path d="M 54 125 Q 100 135 146 125" stroke="#78350f" stroke-width="2" fill="none" />
            <path d="M 58 155 Q 100 165 142 155" stroke="#78350f" stroke-width="2" fill="none" />

            <!-- Compiler Bug Hazard Warning Shield (Center chest) -->
            <polygon points="100,105 118,135 82,135" fill="#facc15" stroke="#78350f" stroke-width="1.8" />
            <text x="100" y="130" font-family="sans-serif" font-size="16" font-weight="900" fill="#7f1d1d" text-anchor="middle">!</text>
          </g>

          <!-- Head & Powerful Stag-Beetle Mandibles -->
          <g class="bug-head">
            <path d="M 66 55 C 66 42, 134 42, 134 55 C 142 70, 140 92, 130 98 C 112 104, 88 104, 70 98 C 60 92, 58 70, 66 55 Z" fill="#292524" stroke="#f59e0b" stroke-width="2" />

            <!-- Left Stag Mandible / Pincer -->
            <path
              d="M 72 85 C 50 85, 36 105, 52 125 C 62 118, 66 102, 76 96 Z"
              :fill="bugMandibleGradUrl"
              stroke="#451a03"
              stroke-width="1.5"
            />
            <polygon points="54,102 58,105 52,108" fill="#ffffff" />
            <polygon points="56,112 60,115 54,118" fill="#ffffff" />

            <!-- Right Stag Mandible / Pincer -->
            <path
              d="M 128 85 C 150 85, 164 105, 148 125 C 138 118, 134 102, 124 96 Z"
              :fill="bugMandibleGradUrl"
              stroke="#451a03"
              stroke-width="1.5"
            />
            <polygon points="146,102 142,105 148,108" fill="#ffffff" />
            <polygon points="144,112 140,115 146,118" fill="#ffffff" />

            <!-- Compound Insect Eyes -->
            <!-- 1. Normal / Idle / Hit -->
            <template v-if="pose !== 'defeated' && pose !== 'defeat_last_hit' && pose !== 'laugh'">
              <ellipse cx="78" cy="68" rx="13" ry="10" :fill="bugEyeGradUrl" stroke="#78350f" stroke-width="1.5" :filter="eyeGlowUrl" />
              <line x1="72" y1="62" x2="84" y2="74" stroke="#fcd34d" stroke-width="0.8" opacity="0.6" />
              <line x1="72" y1="74" x2="84" y2="62" stroke="#fcd34d" stroke-width="0.8" opacity="0.6" />
              <circle cx="79" cy="66" r="2" fill="#ffffff" />

              <ellipse cx="122" cy="68" rx="13" ry="10" :fill="bugEyeGradUrl" stroke="#78350f" stroke-width="1.5" :filter="eyeGlowUrl" />
              <line x1="116" y1="62" x2="128" y2="74" stroke="#fcd34d" stroke-width="0.8" opacity="0.6" />
              <line x1="116" y1="74" x2="128" y2="62" stroke="#fcd34d" stroke-width="0.8" opacity="0.6" />
              <circle cx="121" cy="66" r="2" fill="#ffffff" />
            </template>

            <!-- 2. Laugh: Fierce Red Compound Eyes & Maw -->
            <template v-else-if="pose === 'laugh'">
              <ellipse cx="78" cy="68" rx="13" ry="10" fill="#dc2626" stroke="#991b1b" stroke-width="2" :filter="eyeGlowUrl" />
              <polygon points="68,64 88,68 86,74 68,70" fill="#fef08a" />
              <ellipse cx="122" cy="68" rx="13" ry="10" fill="#dc2626" stroke="#991b1b" stroke-width="2" :filter="eyeGlowUrl" />
              <polygon points="132,64 112,68 114,74 132,70" fill="#fef08a" />
              <path d="M 85 88 Q 100 98 115 88 Z" fill="#450a0a" stroke="#78350f" stroke-width="1.5" />
              <polygon points="90,88 94,94 98,88" fill="#ffffff" />
              <polygon points="102,88 106,94 110,88" fill="#ffffff" />
            </template>

            <!-- 3. Defeated: Dim Eyes with X stitches, Mandibles Ajar -->
            <template v-else>
              <ellipse cx="78" cy="68" rx="13" ry="10" fill="#1c1917" stroke="#57534e" stroke-width="1.5" />
              <line x1="72" y1="62" x2="84" y2="74" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" />
              <line x1="84" y1="62" x2="72" y2="74" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" />

              <ellipse cx="122" cy="68" rx="13" ry="10" fill="#1c1917" stroke="#57534e" stroke-width="1.5" />
              <line x1="116" y1="62" x2="128" y2="74" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" />
              <line x1="128" y1="62" x2="116" y2="74" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" />
              <path d="M 88 90 Q 100 84 112 90" stroke="#78716c" stroke-width="2" fill="none" />
            </template>
          </g>
        </g>

        <!-- ========================================================
             4. RAKUS MAXIMUS (Stout Horned Demonic Gargoyle Beast)
             ======================================================== -->
        <g v-else class="boss-character char-rakus">
          <!-- A. FALLEN / COLLAPSED STATE (Panel 7: Defeated Boss lying flat on cavern floor) -->
          <g v-if="pose === 'defeated' || pose === 'defeat_last_hit'" class="rakus-fallen">
            <!-- Ground sprawl shadow -->
            <ellipse cx="100" cy="180" rx="90" ry="25" fill="#000000" opacity="0.6" />

            <!-- Collapsed Back & Body Bulk -->
            <path
              d="M 25 175 C 20 130, 45 105, 100 100 C 155 105, 180 130, 175 175 C 160 190, 40 190, 25 175 Z"
              :fill="rakusBodyGradUrl"
              stroke="#1e1035"
              stroke-width="2.5"
            />

            <!-- Slumped Shoulder Spikes resting flat -->
            <path d="M 20 155 L 45 140 L 40 170 L 15 168 Z" :fill="rakusArmorGradUrl" stroke="#facc15" stroke-width="1.5" />
            <polygon points="12,160 2,150 16,155" fill="#eab308" />
            <path d="M 180 155 L 155 140 L 160 170 L 185 168 Z" :fill="rakusArmorGradUrl" stroke="#facc15" stroke-width="1.5" />
            <polygon points="188,160 198,150 184,155" fill="#eab308" />

            <!-- Fallen Horns lying sideways against the floor -->
            <path
              d="M 50 145 C 30 140, 12 125, 5 110 C 16 112, 38 128, 55 138 Z"
              :fill="rakusHornGradUrl"
              stroke="#713f12"
              stroke-width="1.8"
            />
            <path
              d="M 150 145 C 170 140, 188 125, 195 110 C 184 112, 162 128, 145 138 Z"
              :fill="rakusHornGradUrl"
              stroke="#713f12"
              stroke-width="1.8"
            />

            <!-- Drooped Head on the Floor -->
            <path
              d="M 65 140 C 60 120, 140 120, 135 140 C 145 165, 138 185, 100 188 C 62 185, 55 165, 65 140 Z"
              :fill="rakusBodyGradUrl"
              stroke="#1e1035"
              stroke-width="2"
            />

            <!-- X Eyes Knocked Out -->
            <line x1="72" y1="148" x2="84" y2="160" stroke="#94a3b8" stroke-width="3.5" stroke-linecap="round" />
            <line x1="84" y1="148" x2="72" y2="160" stroke="#94a3b8" stroke-width="3.5" stroke-linecap="round" />
            <line x1="116" y1="148" x2="128" y2="160" stroke="#94a3b8" stroke-width="3.5" stroke-linecap="round" />
            <line x1="128" y1="148" x2="116" y2="160" stroke="#94a3b8" stroke-width="3.5" stroke-linecap="round" />

            <!-- Slack Drooping Mouth & Tongue on the Ground -->
            <path d="M 80 170 Q 100 165 120 170" stroke="#334155" stroke-width="3" fill="none" stroke-linecap="round" />
            <path d="M 94 170 Q 96 182 104 180 Q 108 172 102 170 Z" fill="#f43f5e" stroke="#881337" stroke-width="1" />

            <!-- Paws sprawled on the floor -->
            <ellipse cx="40" cy="180" rx="15" ry="8" :fill="rakusBodyGradUrl" stroke="#1e1035" stroke-width="1.5" />
            <circle cx="30" cy="182" r="3.5" fill="#facc15" />
            <circle cx="38" cy="185" r="3.5" fill="#facc15" />
            <circle cx="46" cy="184" r="3.5" fill="#facc15" />

            <ellipse cx="160" cy="180" rx="15" ry="8" :fill="rakusBodyGradUrl" stroke="#1e1035" stroke-width="1.5" />
            <circle cx="170" cy="182" r="3.5" fill="#facc15" />
            <circle cx="162" cy="185" r="3.5" fill="#facc15" />
            <circle cx="154" cy="184" r="3.5" fill="#facc15" />
          </g>

          <!-- B. STANDING / SQUATTING MENACING BEHEMOTH (Panels 1, 2, 3, 4, 5, 6) -->
          <g v-else class="rakus-standing">
            <!-- Massive Ribbed Curved Demon Horns -->
            <g class="horns">
              <!-- Left Horn -->
              <path
                d="M 58 72 C 32 46, 12 18, 28 4 C 46 16, 62 44, 72 68 Z"
                :fill="rakusHornGradUrl"
                stroke="#713f12"
                stroke-width="2"
              />
              <!-- Horn Rib Ridges / Gold Bands -->
              <path d="M 36 24 Q 46 32 54 28" stroke="#fef08a" stroke-width="2" fill="none" opacity="0.8" />
              <path d="M 44 42 Q 54 48 62 44" stroke="#fef08a" stroke-width="2" fill="none" opacity="0.8" />
              <path d="M 52 58 Q 62 62 68 58" stroke="#fef08a" stroke-width="2" fill="none" opacity="0.8" />

              <!-- Right Horn -->
              <path
                d="M 142 72 C 168 46, 188 18, 172 4 C 154 16, 138 44, 128 68 Z"
                :fill="rakusHornGradUrl"
                stroke="#713f12"
                stroke-width="2"
              />
              <path d="M 164 24 Q 154 32 146 28" stroke="#fef08a" stroke-width="2" fill="none" opacity="0.8" />
              <path d="M 156 42 Q 146 48 138 44" stroke="#fef08a" stroke-width="2" fill="none" opacity="0.8" />
              <path d="M 148 58 Q 138 62 132 58" stroke="#fef08a" stroke-width="2" fill="none" opacity="0.8" />
            </g>

            <!-- Main Stout Torso (Wide Gargoyle Silhouette) -->
            <path
              d="M 46 76 C 35 48, 165 48, 154 76 C 182 110, 185 168, 160 194 C 125 204, 75 204, 40 194 C 15 168, 18 110, 46 76 Z"
              :fill="rakusBodyGradUrl"
              stroke="#1e1035"
              stroke-width="2.5"
            />

            <!-- Rocky Skin Bumps & Ridges Texture -->
            <path d="M 70 60 Q 82 56 94 60" stroke="#c084fc" stroke-width="2" fill="none" opacity="0.5" />
            <path d="M 106 60 Q 118 56 130 60" stroke="#c084fc" stroke-width="2" fill="none" opacity="0.5" />
            <ellipse cx="46" cy="115" rx="6" ry="4" fill="#581c87" opacity="0.6" />
            <ellipse cx="154" cy="115" rx="6" ry="4" fill="#581c87" opacity="0.6" />

            <!-- Bronze Studded Shoulder Pauldrons -->
            <path d="M 28 82 L 64 70 L 58 108 L 22 98 Z" :fill="rakusArmorGradUrl" stroke="#facc15" stroke-width="2" />
            <polygon points="26,80 14,66 34,74" fill="#eab308" stroke="#713f12" stroke-width="1" />
            <circle cx="36" cy="94" r="2.5" fill="#fde047" />
            <circle cx="50" cy="90" r="2.5" fill="#fde047" />

            <path d="M 172 82 L 136 70 L 142 108 L 178 98 Z" :fill="rakusArmorGradUrl" stroke="#facc15" stroke-width="2" />
            <polygon points="174,80 186,66 166,74" fill="#eab308" stroke="#713f12" stroke-width="1" />
            <circle cx="164" cy="94" r="2.5" fill="#fde047" />
            <circle cx="150" cy="90" r="2.5" fill="#fde047" />

            <!-- Heavy Pectoral Armor Plate & Glowing Core -->
            <path
              d="M 68 116 L 100 102 L 132 116 L 122 154 L 100 164 L 78 154 Z"
              fill="#1e1b4b"
              stroke="#eab308"
              stroke-width="2.5"
            />
            <circle cx="78" cy="120" r="2" fill="#facc15" />
            <circle cx="122" cy="120" r="2" fill="#facc15" />
            <circle cx="100" cy="158" r="2" fill="#facc15" />
            <!-- Molten Core Crystal -->
            <polygon
              points="100,118 114,134 100,150 86,134"
              :fill="rakusAccent"
              :filter="eyeGlowUrl"
            />

            <!-- Powerful Muscular Forearms & Claws Resting on Ground in Front -->
            <g class="front-paws">
              <!-- Left Forearm & Claw Fist -->
              <path
                d="M 45 106 C 28 120, 22 152, 34 182 C 45 186, 62 186, 68 174 C 72 158, 62 128, 54 112 Z"
                :fill="rakusBodyGradUrl"
                stroke="#1e1035"
                stroke-width="2"
              />
              <!-- Claws resting on floor -->
              <circle cx="36" cy="180" r="5" fill="#facc15" stroke="#713f12" stroke-width="1" />
              <circle cx="48" cy="184" r="5.5" fill="#facc15" stroke="#713f12" stroke-width="1" />
              <circle cx="60" cy="182" r="5" fill="#facc15" stroke="#713f12" stroke-width="1" />

              <!-- Right Forearm & Claw Fist -->
              <path
                d="M 155 106 C 172 120, 178 152, 166 182 C 155 186, 138 186, 132 174 C 128 158, 138 128, 146 112 Z"
                :fill="rakusBodyGradUrl"
                stroke="#1e1035"
                stroke-width="2"
              />
              <!-- Claws resting on floor -->
              <circle cx="164" cy="180" r="5" fill="#facc15" stroke="#713f12" stroke-width="1" />
              <circle cx="152" cy="184" r="5.5" fill="#facc15" stroke="#713f12" stroke-width="1" />
              <circle cx="140" cy="182" r="5" fill="#facc15" stroke="#713f12" stroke-width="1" />
            </g>

            <!-- Face & Glowing Menacing Eyes -->
            <g class="face">
              <!-- Heavy Brow Ridge -->
              <path d="M 64 78 Q 100 86 136 78" stroke="#1e1035" stroke-width="3" fill="none" />

              <!-- Left Glowing Orange/Red Eye -->
              <ellipse cx="78" cy="85" rx="14" ry="11" fill="#0f0728" />
              <polygon points="68,80 88,84 86,92 66,88" fill="#ea580c" />
              <circle cx="78" cy="86" r="4.5" fill="#fef08a" :filter="eyeGlowUrl" />
              <circle cx="79" cy="85" r="1.5" fill="#ffffff" />

              <!-- Right Glowing Orange/Red Eye -->
              <ellipse cx="122" cy="85" rx="14" ry="11" fill="#0f0728" />
              <polygon points="132,80 112,84 114,92 134,88" fill="#ea580c" />
              <circle cx="122" cy="86" r="4.5" fill="#fef08a" :filter="eyeGlowUrl" />
              <circle cx="121" cy="85" r="1.5" fill="#ffffff" />

              <!-- Gaping Toothy Grin with Prominent Lower Tusks (Mouth coordinate center: 100, 105) -->
              <!-- 1. Normal / Idle / Hit: Fierce Grin with Tusks -->
              <template v-if="pose === 'idle' || pose === 'hit'">
                <path d="M 72 102 Q 100 120 128 102 Z" fill="#2d0606" stroke="#1e1035" stroke-width="2.5" />
                <!-- Upper Teeth -->
                <polygon points="80,102 84,107 88,102" fill="#ffffff" />
                <polygon points="94,103 98,108 102,103" fill="#ffffff" />
                <polygon points="112,102 116,107 120,102" fill="#ffffff" />
                <!-- Prominent Lower Canine Tusks Pointing Upward -->
                <polygon points="78,112 84,98 88,112" fill="#fef08a" stroke="#713f12" stroke-width="0.8" />
                <polygon points="112,112 116,98 122,112" fill="#fef08a" stroke="#713f12" stroke-width="0.8" />
                <polygon points="98,114 100,106 104,114" fill="#ffffff" />
              </template>

              <!-- 2. Laughing: Gaping Open Maw Roaring with Laughter -->
              <template v-else-if="pose === 'laugh'">
                <path d="M 68 98 Q 100 134 132 98 Z" fill="#450a0a" stroke="#1e1035" stroke-width="2.5" />
                <!-- Sharp Teeth -->
                <polygon points="76,100 80,109 85,100" fill="#ffffff" />
                <polygon points="90,102 95,112 100,102" fill="#ffffff" />
                <polygon points="105,102 110,112 115,102" fill="#ffffff" />
                <polygon points="120,100 124,109 128,100" fill="#ffffff" />
                <!-- Big Lower Tusks -->
                <polygon points="74,115 80,98 86,115" fill="#fef08a" stroke="#713f12" stroke-width="1" />
                <polygon points="114,115 120,98 126,115" fill="#fef08a" stroke="#713f12" stroke-width="1" />
                <!-- Fiery Tongue -->
                <ellipse cx="100" cy="122" rx="14" ry="7" fill="#f43f5e" />
              </template>
            </g>
          </g>
        </g>
      </svg>
    </div>

    <!-- Hit Blast Overlay Particle -->
    <div v-if="showHit" class="hit-explosion">
      <span class="hit-spark">💥</span>
      <div class="hit-ring"></div>
    </div>

    <!-- Defeated Smoke / Dizzy Stars -->
    <div v-if="pose === 'defeated' || pose === 'defeat_last_hit'" class="defeated-stars">
      <span class="star-item s1">💫</span>
      <span class="star-item s2">⭐</span>
      <span class="star-item s3">💭</span>
    </div>

    <!-- Boss Name Plate -->
    <div class="boss-nameplate" :class="{ 'nameplate-defeated': pose === 'defeated' || pose === 'defeat_last_hit' }">
      <span class="nameplate-crown" v-if="pose !== 'defeated' && pose !== 'defeat_last_hit'">👑</span>
      <span class="nameplate-text">{{ name }}</span>
      <span class="nameplate-status" v-if="pose === 'defeated' || pose === 'defeat_last_hit'">[TUMBANG]</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useId, computed } from 'vue'

const props = defineProps<{
  name: string
  bossId?: string
  color?: string
  accent?: string
  customImageUrl?: string | null
  pose?: string // 'idle' | 'hit' | 'defeat_last_hit' | 'defeated' | 'laugh'
  showHit?: boolean
  reducedMotion?: boolean
}>()

const rawId = useId()
const uid = computed(() => `bs-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`)

// Scoped gradient / filter IDs
const eyeGlowId = computed(() => `${uid.value}-eyeGlow`)
const eyeGlowUrl = computed(() => `url(#${uid.value}-eyeGlow)`)

const robotArmorGradId = computed(() => `${uid.value}-robotArmorGrad`)
const robotArmorGradUrl = computed(() => `url(#${uid.value}-robotArmorGrad)`)

const robotMetalGradId = computed(() => `${uid.value}-robotMetalGrad`)
const robotMetalGradUrl = computed(() => `url(#${uid.value}-robotMetalGrad)`)

const robotCoreGradId = computed(() => `${uid.value}-robotCoreGrad`)
const robotCoreGradUrl = computed(() => `url(#${uid.value}-robotCoreGrad)`)

const rakusBodyGradId = computed(() => `${uid.value}-rakusBodyGrad`)
const rakusBodyGradUrl = computed(() => `url(#${uid.value}-rakusBodyGrad)`)

const rakusHornGradId = computed(() => `${uid.value}-rakusHornGrad`)
const rakusHornGradUrl = computed(() => `url(#${uid.value}-rakusHornGrad)`)

const rakusArmorGradId = computed(() => `${uid.value}-rakusArmorGrad`)
const rakusArmorGradUrl = computed(() => `url(#${uid.value}-rakusArmorGrad)`)

const virusCoreGradId = computed(() => `${uid.value}-virusCoreGrad`)
const virusCoreGradUrl = computed(() => `url(#${uid.value}-virusCoreGrad)`)

const virusTentacleGradId = computed(() => `${uid.value}-virusTentacleGrad`)
const virusTentacleGradUrl = computed(() => `url(#${uid.value}-virusTentacleGrad)`)

const virusEyeGradId = computed(() => `${uid.value}-virusEyeGrad`)
const virusEyeGradUrl = computed(() => `url(#${uid.value}-virusEyeGrad)`)

const bugShellGradId = computed(() => `${uid.value}-bugShellGrad`)
const bugShellGradUrl = computed(() => `url(#${uid.value}-bugShellGrad)`)

const bugMandibleGradId = computed(() => `${uid.value}-bugMandibleGrad`)
const bugMandibleGradUrl = computed(() => `url(#${uid.value}-bugMandibleGrad)`)

const bugEyeGradId = computed(() => `${uid.value}-bugEyeGrad`)
const bugEyeGradUrl = computed(() => `url(#${uid.value}-bugEyeGrad)`)

// Per-character resolved colors:
// If props.color/accent is provided for THIS boss character, use it; otherwise use the character's canonical color.
const robotColor = computed(() => (props.bossId === 'robot-glitch' && props.color) ? props.color : '#0ea5e9')
const robotAccent = computed(() => (props.bossId === 'robot-glitch' && props.accent) ? props.accent : '#67e8f9')

const rakusColor = computed(() => (props.bossId === 'rakus-maximus' && props.color) ? props.color : '#7c3aed')
const rakusAccent = computed(() => (props.bossId === 'rakus-maximus' && props.accent) ? props.accent : '#c084fc')

const virusColor = computed(() => (props.bossId === 'virus-lambda' && props.color) ? props.color : '#10b981')
const virusAccent = computed(() => (props.bossId === 'virus-lambda' && props.accent) ? props.accent : '#6ee7b7')

const bugColor = computed(() => ((props.bossId === 'bugzilla' || props.bossId === 'bugzilla-compiler') && props.color) ? props.color : '#f59e0b')
const bugAccent = computed(() => ((props.bossId === 'bugzilla' || props.bossId === 'bugzilla-compiler') && props.accent) ? props.accent : '#fcd34d')

// Active aura glow color
const resolvedAuraColor = computed(() => {
  if (props.bossId === 'robot-glitch') return robotAccent.value
  if (props.bossId === 'rakus-maximus') return rakusAccent.value
  if (props.bossId === 'virus-lambda') return virusAccent.value
  if (props.bossId === 'bugzilla' || props.bossId === 'bugzilla-compiler') return bugAccent.value
  return props.accent || '#c084fc'
})
</script>

<style scoped>
.boss-container {
  position: relative;
  width: 260px;
  height: 270px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  perspective: 800px;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ground-shadow {
  position: absolute;
  bottom: 26px;
  width: 170px;
  height: 24px;
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 75%);
  border-radius: 50%;
  pointer-events: none;
  transition: all 0.5s ease;
}

.ground-shadow-flat {
  width: 220px;
  height: 28px;
  transform: translateY(10px);
  opacity: 0.85;
}

.boss-figure {
  position: relative;
  width: 210px;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: 50% 90%;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease;
}

.boss-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 14px 22px rgba(0, 0, 0, 0.65));
}

.boss-aura {
  position: absolute;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  pointer-events: none;
  animation: auraPulse 3s ease-in-out infinite;
}

/* ========================================================
   CHARACTER-SPECIFIC ANIMATIONS
   ======================================================== */

/* Robot Glitch Signals & Bits */
.robot-signal {
  animation: signalPulse 1.6s ease-in-out infinite;
}
@keyframes signalPulse {
  0%, 100% { opacity: 0.3; transform: scale(0.95); }
  50% { opacity: 0.9; transform: scale(1.05); }
}

.glitch-particles {
  animation: glitchBlink 2.2s steps(2) infinite;
}
@keyframes glitchBlink {
  0%, 100% { opacity: 0.85; }
  50% { opacity: 0.35; }
}

/* Virus Lambda Tentacles & Spores */
.tentacle {
  transform-origin: 50% 0%;
  animation: tentacleWave 3.2s ease-in-out infinite alternate;
}
.t1 { animation-delay: 0s; }
.t2 { animation-delay: 0.6s; }
.t3 { animation-delay: 1.2s; }
.t4 { animation-delay: 0.4s; }
.t5 { animation-delay: 0.9s; }

@keyframes tentacleWave {
  0% { transform: rotate(-3deg) scaleY(0.98); }
  100% { transform: rotate(4deg) scaleY(1.03); }
}

.mini-spore {
  animation: sporeFloat 3.8s ease-in-out infinite;
}
.sp1 { animation-delay: 0s; }
.sp2 { animation-delay: 1.9s; }

@keyframes sporeFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-7px) translateX(3px); }
}

/* Bugzilla Antennae */
.antenna {
  transform-origin: bottom center;
  animation: antennaTwitch 4.5s ease-in-out infinite;
}
.a-left { animation-delay: 0.2s; }
.a-right { animation-delay: 0.8s; }

@keyframes antennaTwitch {
  0%, 88%, 100% { transform: rotate(0deg); }
  92% { transform: rotate(-3deg); }
  96% { transform: rotate(3deg); }
}

/* ========================================================
   ANIMATION POSES
   ======================================================== */

/* 1. IDLE */
.pose-idle .boss-figure {
  animation: bossIdle 2.8s ease-in-out infinite;
}

/* 2. HIT (Takes damage, shakes, flashes) */
.pose-hit .boss-figure {
  animation: bossHit 0.4s ease-out;
  filter: brightness(1.7) saturate(1.4) drop-shadow(0 0 20px #ef4444);
}

/* 3. DEFEAT LAST HIT (Dramatic shattering recoil) */
.pose-defeat_last_hit .boss-figure {
  animation: bossLastHit 0.6s ease-out forwards;
  filter: brightness(2) drop-shadow(0 0 35px #facc15);
}

/* 4. DEFEATED (Lying down flat on arena floor, defeated) */
.pose-defeated .boss-figure {
  animation: none !important;
  transform: rotate(88deg) translate(38px, 45px) scale(0.92);
  filter: grayscale(0.55) brightness(0.65) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.7));
}

/* Rakus Maximus has custom collapsed SVG drawn flat to match Demo Video Panel 7 */
.boss-rakus-maximus.pose-defeated .boss-figure,
.boss-rakus-maximus.pose-defeat_last_hit .boss-figure {
  transform: translateY(18px) scale(0.98) !important;
  filter: grayscale(0.35) brightness(0.7) drop-shadow(0 6px 16px rgba(0, 0, 0, 0.8)) !important;
}

/* Crucial requirement: even if hit when defeated, keep lying down! */
.pose-defeated.pose-hit .boss-figure,
.pose-defeated .img-hit {
  transform: rotate(88deg) translate(38px, 45px) scale(0.92);
  filter: grayscale(0.4) brightness(0.9) drop-shadow(0 0 16px #f43f5e);
}
.boss-rakus-maximus.pose-defeated.pose-hit .boss-figure {
  transform: translateY(18px) scale(0.98) !important;
}

/* 5. LAUGH (Victorious boss taunting class) */
.pose-laugh .boss-figure {
  animation: bossLaugh 0.45s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.6));
}

/* Laugh speech bubble */
.laugh-bubble {
  position: absolute;
  top: -24px;
  right: -10px;
  background: #ffffff;
  color: #991b1b;
  font-weight: 900;
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
  border: 2px solid #dc2626;
  animation: bubblePop 0.5s ease-in-out infinite alternate;
  z-index: 10;
}
.laugh-bubble::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 14px;
  border-width: 6px 6px 0;
  border-style: solid;
  border-color: #ffffff transparent;
}

/* Hit Explosion Effect */
.hit-explosion {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 20;
}
.hit-spark {
  font-size: 48px;
  display: block;
  animation: hitSpark 0.4s ease-out forwards;
}
.hit-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80px;
  height: 80px;
  margin: -40px 0 0 -40px;
  border: 3px solid #f87171;
  border-radius: 50%;
  animation: hitRing 0.45s ease-out forwards;
}

/* Defeated Stars / Smoke */
.defeated-stars {
  position: absolute;
  top: 20px;
  left: 30px;
  pointer-events: none;
  z-index: 20;
}
.star-item {
  position: absolute;
  font-size: 22px;
  animation: starRotate 2.5s linear infinite;
}
.s1 { top: 0; left: 10px; animation-delay: 0s; }
.s2 { top: 15px; left: 35px; animation-delay: 0.8s; }
.s3 { top: -10px; left: 60px; animation-delay: 1.6s; }

/* Custom Boss Image */
.custom-boss-wrap {
  width: 190px;
  height: 190px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.custom-boss-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 12px 20px rgba(0, 0, 0, 0.6));
  transition: transform 0.4s ease;
}
.custom-boss-img.img-hit {
  animation: bossHit 0.4s ease-out;
  filter: brightness(1.6) saturate(1.5) drop-shadow(0 0 20px #ef4444);
}
.custom-boss-img.img-defeated {
  transform: rotate(90deg) translate(25px, 20px);
  filter: grayscale(0.6) brightness(0.6);
}
.custom-boss-img.img-laugh {
  animation: bossLaugh 0.45s ease-in-out infinite;
}

/* Nameplate */
.boss-nameplate {
  margin-top: 10px;
  padding: 4px 12px;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(250, 204, 21, 0.4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fef08a;
  z-index: 5;
}
.nameplate-defeated {
  border-color: rgba(148, 163, 184, 0.3);
  color: #94a3b8;
  background: rgba(15, 23, 42, 0.6);
}
.nameplate-status {
  color: #f87171;
  font-size: 10px;
}

/* KEYFRAMES */
@keyframes bossIdle {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-9px) scale(1.02);
  }
}

@keyframes bossHit {
  0% { transform: scale(1); }
  25% { transform: scale(0.92) translateX(-14px) rotate(-4deg); }
  50% { transform: scale(0.95) translateX(12px) rotate(3deg); }
  75% { transform: scale(0.98) translateX(-6px); }
  100% { transform: scale(1) translateX(0); }
}

@keyframes bossLastHit {
  0% { transform: scale(1); }
  30% { transform: scale(1.15) translateY(-18px) rotate(-8deg); }
  60% { transform: scale(0.95) translateY(10px) rotate(45deg); }
  100% { transform: rotate(88deg) translate(38px, 45px) scale(0.92); }
}

@keyframes bossLaugh {
  0%, 100% {
    transform: translateY(0) scale(1) rotate(-2deg);
  }
  50% {
    transform: translateY(-6px) scale(1.05) rotate(2deg);
  }
}

@keyframes auraPulse {
  0%, 100% { transform: scale(0.95); opacity: 0.35; }
  50% { transform: scale(1.12); opacity: 0.65; }
}

@keyframes bubblePop {
  from { transform: translateY(0) scale(1); }
  to { transform: translateY(-4px) scale(1.06); }
}

@keyframes hitSpark {
  0% { transform: scale(0.4) rotate(0deg); opacity: 0; }
  40% { transform: scale(1.3) rotate(15deg); opacity: 1; }
  100% { transform: scale(1.8) rotate(35deg); opacity: 0; }
}

@keyframes hitRing {
  0% { transform: scale(0.3); opacity: 1; }
  100% { transform: scale(1.6); opacity: 0; }
}

@keyframes starRotate {
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-6px) rotate(180deg); }
  100% { transform: translateY(0) rotate(360deg); }
}

/* Reduced Motion Mode */
.low-motion .boss-figure,
.low-motion .boss-aura,
.low-motion .ground-shadow,
.low-motion .laugh-bubble,
.low-motion .tentacle,
.low-motion .mini-spore,
.low-motion .antenna,
.low-motion .robot-signal {
  animation: none !important;
}
</style>
