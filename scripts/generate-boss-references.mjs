import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const targetDir = path.resolve('apps/web/src/modules/games/bossBattle/reference2d')
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true })
}

const DEFS = `
  <defs>
    <!-- Shared Filters -->
    <filter id="eyeGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <!-- 1. ROBOT GLITCH GRADIENTS -->
    <linearGradient id="robotArmorGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="40%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#082f49" />
    </linearGradient>
    <linearGradient id="robotMetalGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#94a3b8" />
      <stop offset="50%" stop-color="#475569" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <radialGradient id="robotCoreGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="35%" stop-color="#38bdf8" />
      <stop offset="80%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#082f49" />
    </radialGradient>

    <!-- 2. RAKUS MAXIMUS GRADIENTS -->
    <radialGradient id="rakusBodyGrad" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#c084fc" />
      <stop offset="60%" stop-color="#7c3aed" />
      <stop offset="100%" stop-color="#1e1035" />
    </radialGradient>
    <linearGradient id="rakusHornGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#713f12" />
    </linearGradient>
    <linearGradient id="rakusArmorGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#475569" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>

    <!-- 3. VIRUS LAMBDA GRADIENTS -->
    <radialGradient id="virusCoreGrad" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#6ee7b7" />
      <stop offset="55%" stop-color="#059669" />
      <stop offset="100%" stop-color="#022c22" />
    </radialGradient>
    <linearGradient id="virusTentacleGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="100%" stop-color="#022c22" />
    </linearGradient>
    <radialGradient id="virusEyeGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="40%" stop-color="#a3e635" />
      <stop offset="85%" stop-color="#15803d" />
      <stop offset="100%" stop-color="#052e16" />
    </radialGradient>

    <!-- 4. BUGZILLA COMPILER GRADIENTS -->
    <linearGradient id="bugShellGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fcd34d" />
      <stop offset="45%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#451a03" />
    </linearGradient>
    <linearGradient id="bugMandibleGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef3c7" />
      <stop offset="50%" stop-color="#b45309" />
      <stop offset="100%" stop-color="#292524" />
    </linearGradient>
    <radialGradient id="bugEyeGrad" cx="45%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="40%" stop-color="#ef4444" />
      <stop offset="85%" stop-color="#991b1b" />
      <stop offset="100%" stop-color="#450a0a" />
    </radialGradient>
  </defs>
`

function getRobotSvg(pose = 'idle') {
  const isDefeated = pose === 'defeated' || pose === 'defeat_last_hit'
  const isLaugh = pose === 'laugh'

  let visorContent = `
    <circle cx="80" cy="80" r="8" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-dasharray="3 2" />
    <circle cx="80" cy="80" r="4" fill="#38bdf8" filter="url(#eyeGlow)" />
    <circle cx="80" cy="80" r="1.5" fill="#ffffff" />
    <circle cx="120" cy="80" r="8" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-dasharray="3 2" />
    <circle cx="120" cy="80" r="4" fill="#38bdf8" filter="url(#eyeGlow)" />
    <circle cx="120" cy="80" r="1.5" fill="#ffffff" />
    <line x1="62" y1="80" x2="138" y2="80" stroke="#67e8f9" stroke-width="1" opacity="0.6" />
  `

  if (isLaugh) {
    visorContent = `
      <path d="M 72 84 L 80 74 L 88 84" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" filter="url(#eyeGlow)" />
      <path d="M 112 84 L 120 74 L 128 84" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" filter="url(#eyeGlow)" />
      <path d="M 64 88 L 74 88 L 80 84 L 88 90 L 96 82 L 104 90 L 112 82 L 120 88 L 136 88" fill="none" stroke="#f43f5e" stroke-width="1.8" />
    `
  } else if (isDefeated) {
    visorContent = `
      <text x="100" y="81" font-family="monospace" font-size="10" font-weight="900" fill="#ef4444" text-anchor="middle" letter-spacing="1">ERR:404</text>
      <line x1="66" y1="72" x2="76" y2="84" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" />
      <line x1="76" y1="72" x2="66" y2="84" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" />
      <line x1="124" y1="72" x2="134" y2="84" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" />
      <line x1="134" y1="72" x2="124" y2="84" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" />
    `
  }

  const antennaLight = isDefeated ? '#64748b' : '#38bdf8'
  const antennaFilter = isDefeated ? '' : 'filter="url(#eyeGlow)"'
  const signals = isDefeated ? '' : `
    <path d="M 40 14 A 12 12 0 0 0 36 28" fill="none" stroke="#67e8f9" stroke-width="2" opacity="0.7" class="robot-signal" />
    <path d="M 160 14 A 12 12 0 0 1 164 28" fill="none" stroke="#67e8f9" stroke-width="2" opacity="0.7" class="robot-signal" />
  `
  const statusLed = isDefeated ? '#ef4444' : '#22c55e'
  const coreFilter = isDefeated ? '' : 'filter="url(#eyeGlow)"'
  const coreTriangle = isDefeated ? '#64748b' : '#ffffff'

  return `
    <g class="boss-character char-robot">
      <!-- Mecha Antennas -->
      <g class="robot-antennas">
        <path d="M 68 55 L 50 18 L 45 20 L 64 58 Z" fill="url(#robotMetalGrad)" stroke="#0f172a" stroke-width="1.5" />
        <circle cx="48" cy="19" r="6" fill="${antennaLight}" ${antennaFilter} />
        <path d="M 132 55 L 150 18 L 155 20 L 136 58 Z" fill="url(#robotMetalGrad)" stroke="#0f172a" stroke-width="1.5" />
        <circle cx="152" cy="19" r="6" fill="${antennaLight}" ${antennaFilter} />
        ${signals}
      </g>

      <!-- Arms / Mechanical Servo Claws -->
      <g class="robot-arms">
        <path d="M 45 100 L 22 125 L 28 150 L 38 145 L 34 128 L 52 110 Z" fill="url(#robotMetalGrad)" stroke="#0f172a" stroke-width="1.5" />
        <path d="M 24 150 L 12 165 L 18 168 L 28 155 Z" fill="#38bdf8" stroke="#082f49" stroke-width="1.2" />
        <path d="M 32 148 L 38 168 L 44 165 L 36 148 Z" fill="#38bdf8" stroke="#082f49" stroke-width="1.2" />
        <circle cx="28" cy="150" r="5" fill="#facc15" stroke="#713f12" stroke-width="1" />

        <path d="M 155 100 L 178 125 L 172 150 L 162 145 L 166 128 L 148 110 Z" fill="url(#robotMetalGrad)" stroke="#0f172a" stroke-width="1.5" />
        <path d="M 176 150 L 188 165 L 182 168 L 172 155 Z" fill="#38bdf8" stroke="#082f49" stroke-width="1.2" />
        <path d="M 168 148 L 162 168 L 156 165 L 164 148 Z" fill="#38bdf8" stroke="#082f49" stroke-width="1.2" />
        <circle cx="172" cy="150" r="5" fill="#facc15" stroke="#713f12" stroke-width="1" />
      </g>

      <!-- Heavy Mecha Torso -->
      <g class="robot-torso">
        <polygon points="55,90 145,90 160,165 140,195 60,195 40,165" fill="url(#robotArmorGrad)" stroke="#082f49" stroke-width="2.5" />
        <polygon points="62,96 138,96 148,155 132,185 68,185 52,155" fill="#0f172a" stroke="#0284c7" stroke-width="1.2" />

        <!-- Shoulder Pauldrons -->
        <path d="M 30 92 L 60 76 L 62 108 L 26 106 Z" fill="url(#robotMetalGrad)" stroke="#38bdf8" stroke-width="1.5" />
        <circle cx="36" cy="98" r="2.5" fill="#67e8f9" />
        <path d="M 170 92 L 140 76 L 138 108 L 174 106 Z" fill="url(#robotMetalGrad)" stroke="#38bdf8" stroke-width="1.5" />
        <circle cx="164" cy="98" r="2.5" fill="#67e8f9" />

        <!-- Cooling Vents -->
        <line x1="72" y1="168" x2="128" y2="168" stroke="#334155" stroke-width="2.5" stroke-linecap="round" />
        <line x1="75" y1="174" x2="125" y2="174" stroke="#334155" stroke-width="2.5" stroke-linecap="round" />
        <line x1="80" y1="180" x2="120" y2="180" stroke="#334155" stroke-width="2.5" stroke-linecap="round" />

        <!-- Arc Reactor Core (Center) -->
        <circle cx="100" cy="135" r="18" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" />
        <circle cx="100" cy="135" r="13" fill="url(#robotCoreGrad)" ${coreFilter} />
        <polygon points="100,126 108,140 92,140" fill="${coreTriangle}" opacity="0.9" />
      </g>

      <!-- Mecha Head & Glitch Visor -->
      <g class="robot-head">
        <polygon points="65,48 135,48 148,88 132,108 68,108 52,88" fill="url(#robotMetalGrad)" stroke="#082f49" stroke-width="2" />
        <rect x="46" y="60" width="8" height="24" rx="2" fill="#0284c7" stroke="#082f49" stroke-width="1" />
        <rect x="146" y="60" width="8" height="24" rx="2" fill="#0284c7" stroke="#082f49" stroke-width="1" />
        <polygon points="80,50 120,50 115,60 85,60" fill="#0f172a" stroke="#38bdf8" stroke-width="1" />
        <circle cx="100" cy="55" r="3" fill="${statusLed}" />
        <rect x="58" y="66" width="84" height="28" rx="6" fill="#020617" stroke="#38bdf8" stroke-width="2" />
        ${visorContent}
        <rect x="85" y="98" width="30" height="5" rx="2" fill="#0f172a" stroke="#334155" stroke-width="1" />
        <line x1="91" y1="99" x2="91" y2="102" stroke="#64748b" stroke-width="1.2" />
        <line x1="96" y1="99" x2="96" y2="102" stroke="#64748b" stroke-width="1.2" />
        <line x1="100" y1="99" x2="100" y2="102" stroke="#64748b" stroke-width="1.2" />
        <line x1="104" y1="99" x2="104" y2="102" stroke="#64748b" stroke-width="1.2" />
        <line x1="109" y1="99" x2="109" y2="102" stroke="#64748b" stroke-width="1.2" />
      </g>
    </g>
  `
}

function getVirusSvg(pose = 'idle') {
  const isDefeated = pose === 'defeated' || pose === 'defeat_last_hit'
  const isLaugh = pose === 'laugh'
  const filter = isDefeated ? '' : 'filter="url(#eyeGlow)"'

  let eyeContent = `
    <circle cx="100" cy="100" r="22" fill="#022c22" stroke="#6ee7b7" stroke-width="2.5" />
    <circle cx="100" cy="100" r="16" fill="url(#virusEyeGrad)" filter="url(#eyeGlow)" />
    <circle cx="100" cy="100" r="8" fill="#064e3b" />
    <circle cx="102" cy="98" r="3" fill="#ffffff" />
    <circle cx="74" cy="92" r="7" fill="#022c22" stroke="#34d399" stroke-width="1.5" />
    <circle cx="74" cy="92" r="4.5" fill="#a3e635" filter="url(#eyeGlow)" />
    <circle cx="126" cy="92" r="7" fill="#022c22" stroke="#34d399" stroke-width="1.5" />
    <circle cx="126" cy="92" r="4.5" fill="#a3e635" filter="url(#eyeGlow)" />
  `

  if (isLaugh) {
    eyeContent = `
      <circle cx="100" cy="100" r="22" fill="#022c22" stroke="#ef4444" stroke-width="2.5" />
      <circle cx="100" cy="100" r="16" fill="url(#virusEyeGrad)" filter="url(#eyeGlow)" />
      <polygon points="100,86 104,100 100,114 96,100" fill="#dc2626" />
      <circle cx="102" cy="98" r="2.5" fill="#ffffff" />
      <circle cx="74" cy="92" r="7" fill="#022c22" stroke="#ef4444" stroke-width="1.5" />
      <circle cx="74" cy="92" r="4.5" fill="#f87171" filter="url(#eyeGlow)" />
      <circle cx="126" cy="92" r="7" fill="#022c22" stroke="#ef4444" stroke-width="1.5" />
      <circle cx="126" cy="92" r="4.5" fill="#f87171" filter="url(#eyeGlow)" />
      <path d="M 88 126 Q 100 138 112 126" stroke="#022c22" stroke-width="3" fill="#450a0a" stroke-linecap="round" />
    `
  } else if (isDefeated) {
    eyeContent = `
      <circle cx="100" cy="100" r="22" fill="#0f172a" stroke="#475569" stroke-width="2" />
      <line x1="88" y1="88" x2="112" y2="112" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" />
      <line x1="112" y1="88" x2="88" y2="112" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" />
      <line x1="68" y1="86" x2="80" y2="98" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" />
      <line x1="80" y1="86" x2="68" y2="98" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" />
      <line x1="120" y1="86" x2="132" y2="98" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" />
      <line x1="132" y1="86" x2="120" y2="98" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" />
    `
  }

  const lambdaCrestOrb = isDefeated ? '#64748b' : '#a3e635'

  return `
    <g class="boss-character char-virus">
      <!-- Radiating Spikes (Peplomers) -->
      <g class="virus-spikes">
        <line x1="65" y1="65" x2="40" y2="40" stroke="#047857" stroke-width="5" stroke-linecap="round" />
        <circle cx="36" cy="36" r="8" fill="#6ee7b7" ${filter} />
        <line x1="135" y1="65" x2="160" y2="40" stroke="#047857" stroke-width="5" stroke-linecap="round" />
        <circle cx="164" cy="36" r="8" fill="#6ee7b7" ${filter} />
        <line x1="45" y1="100" x2="18" y2="95" stroke="#047857" stroke-width="5" stroke-linecap="round" />
        <circle cx="14" cy="95" r="7.5" fill="#6ee7b7" ${filter} />
        <line x1="155" y1="100" x2="182" y2="95" stroke="#047857" stroke-width="5" stroke-linecap="round" />
        <circle cx="186" cy="95" r="7.5" fill="#6ee7b7" ${filter} />
        <line x1="52" y1="132" x2="28" y2="150" stroke="#047857" stroke-width="4.5" stroke-linecap="round" />
        <circle cx="24" cy="154" r="6.5" fill="#6ee7b7" ${filter} />
        <line x1="148" y1="132" x2="172" y2="150" stroke="#047857" stroke-width="4.5" stroke-linecap="round" />
        <circle cx="176" cy="154" r="6.5" fill="#6ee7b7" ${filter} />
      </g>

      <!-- Undulating Bio-Tentacles -->
      <g class="virus-tentacles">
        <path d="M 68 140 C 50 160, 42 185, 48 200 C 52 205, 62 200, 56 185 C 52 175, 65 158, 76 145 Z" fill="url(#virusTentacleGrad)" stroke="#022c22" stroke-width="1.5" />
        <circle cx="50" cy="190" r="3" fill="#a3e635" />
        <path d="M 82 148 C 72 172, 70 192, 76 205 C 80 208, 88 202, 84 190 C 80 178, 88 165, 92 150 Z" fill="url(#virusTentacleGrad)" stroke="#022c22" stroke-width="1.5" />
        <circle cx="78" cy="195" r="3" fill="#a3e635" />
        <path d="M 96 150 C 94 175, 102 195, 100 208 C 98 212, 106 212, 108 202 C 110 188, 104 172, 104 150 Z" fill="url(#virusTentacleGrad)" stroke="#022c22" stroke-width="1.5" />
        <circle cx="102" cy="198" r="3.5" fill="#a3e635" />
        <path d="M 118 148 C 128 172, 130 192, 124 205 C 120 208, 112 202, 116 190 C 120 178, 112 165, 108 150 Z" fill="url(#virusTentacleGrad)" stroke="#022c22" stroke-width="1.5" />
        <circle cx="122" cy="195" r="3" fill="#a3e635" />
        <path d="M 132 140 C 150 160, 158 185, 152 200 C 148 205, 138 200, 144 185 C 148 175, 135 158, 124 145 Z" fill="url(#virusTentacleGrad)" stroke="#022c22" stroke-width="1.5" />
        <circle cx="150" cy="190" r="3" fill="#a3e635" />
      </g>

      <!-- Spherical Viral Capsid Core -->
      <g class="virus-body">
        <circle cx="100" cy="100" r="54" fill="url(#virusCoreGrad)" stroke="#022c22" stroke-width="3" />
        <polygon points="100,52 135,70 100,90 65,70" fill="#10b981" opacity="0.35" stroke="#34d399" stroke-width="1" />
        <polygon points="65,70 100,90 75,130 48,110" fill="#047857" opacity="0.4" stroke="#34d399" stroke-width="1" />
        <polygon points="135,70 100,90 125,130 152,110" fill="#047857" opacity="0.4" stroke="#34d399" stroke-width="1" />
        <polygon points="75,130 100,90 125,130 100,148" fill="#065f46" opacity="0.5" stroke="#34d399" stroke-width="1" />

        <!-- Lambda Crest -->
        <g class="virus-crest">
          <path d="M 100 24 L 88 50 M 96 34 L 112 50" fill="none" stroke="#6ee7b7" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" ${filter} />
          <circle cx="100" cy="22" r="3.5" fill="${lambdaCrestOrb}" ${filter} />
        </g>
        ${eyeContent}
      </g>
      <!-- Orbiting Mini Spores -->
      <circle cx="32" cy="120" r="7" fill="#10b981" stroke="#047857" stroke-width="1.5" />
      <circle cx="32" cy="120" r="3" fill="#6ee7b7" />
      <circle cx="170" cy="122" r="6" fill="#10b981" stroke="#047857" stroke-width="1.5" />
      <circle cx="170" cy="122" r="2.5" fill="#6ee7b7" />
    </g>
  `
}

function getBugzillaSvg(pose = 'idle') {
  const isDefeated = pose === 'defeated' || pose === 'defeat_last_hit'
  const isLaugh = pose === 'laugh'
  const filter = isDefeated ? '' : 'filter="url(#eyeGlow)"'
  const tipColor = isDefeated ? '#64748b' : '#ef4444'

  let eyesAndMaw = `
    <ellipse cx="78" cy="68" rx="13" ry="10" fill="url(#bugEyeGrad)" stroke="#78350f" stroke-width="1.5" filter="url(#eyeGlow)" />
    <line x1="72" y1="62" x2="84" y2="74" stroke="#fcd34d" stroke-width="0.8" opacity="0.6" />
    <line x1="72" y1="74" x2="84" y2="62" stroke="#fcd34d" stroke-width="0.8" opacity="0.6" />
    <circle cx="79" cy="66" r="2" fill="#ffffff" />
    <ellipse cx="122" cy="68" rx="13" ry="10" fill="url(#bugEyeGrad)" stroke="#78350f" stroke-width="1.5" filter="url(#eyeGlow)" />
    <line x1="116" y1="62" x2="128" y2="74" stroke="#fcd34d" stroke-width="0.8" opacity="0.6" />
    <line x1="116" y1="74" x2="128" y2="62" stroke="#fcd34d" stroke-width="0.8" opacity="0.6" />
    <circle cx="121" cy="66" r="2" fill="#ffffff" />
  `

  if (isLaugh) {
    eyesAndMaw = `
      <ellipse cx="78" cy="68" rx="13" ry="10" fill="#dc2626" stroke="#991b1b" stroke-width="2" filter="url(#eyeGlow)" />
      <polygon points="68,64 88,68 86,74 68,70" fill="#fef08a" />
      <ellipse cx="122" cy="68" rx="13" ry="10" fill="#dc2626" stroke="#991b1b" stroke-width="2" filter="url(#eyeGlow)" />
      <polygon points="132,64 112,68 114,74 132,70" fill="#fef08a" />
      <path d="M 85 88 Q 100 98 115 88 Z" fill="#450a0a" stroke="#78350f" stroke-width="1.5" />
      <polygon points="90,88 94,94 98,88" fill="#ffffff" />
      <polygon points="102,88 106,94 110,88" fill="#ffffff" />
    `
  } else if (isDefeated) {
    eyesAndMaw = `
      <ellipse cx="78" cy="68" rx="13" ry="10" fill="#1c1917" stroke="#57534e" stroke-width="1.5" />
      <line x1="72" y1="62" x2="84" y2="74" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" />
      <line x1="84" y1="62" x2="72" y2="74" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" />
      <ellipse cx="122" cy="68" rx="13" ry="10" fill="#1c1917" stroke="#57534e" stroke-width="1.5" />
      <line x1="116" y1="62" x2="128" y2="74" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" />
      <line x1="128" y1="62" x2="116" y2="74" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" />
      <path d="M 88 90 Q 100 84 112 90" stroke="#78350f" stroke-width="2" fill="none" />
    `
  }

  return `
    <g class="boss-character char-bug">
      <!-- Antennae -->
      <g class="bug-antennae">
        <path d="M 80 50 L 60 25 L 42 20 L 30 8" fill="none" stroke="url(#bugMandibleGrad)" stroke-width="3" stroke-linecap="round" />
        <circle cx="30" cy="8" r="4.5" fill="${tipColor}" ${filter} />
        <line x1="58" y1="26" x2="52" y2="34" stroke="#f59e0b" stroke-width="1.8" />
        <line x1="42" y1="20" x2="38" y2="28" stroke="#f59e0b" stroke-width="1.8" />
        <path d="M 120 50 L 140 25 L 158 20 L 170 8" fill="none" stroke="url(#bugMandibleGrad)" stroke-width="3" stroke-linecap="round" />
        <circle cx="170" cy="8" r="4.5" fill="${tipColor}" ${filter} />
        <line x1="142" y1="26" x2="148" y2="34" stroke="#f59e0b" stroke-width="1.8" />
        <line x1="158" y1="20" x2="162" y2="28" stroke="#f59e0b" stroke-width="1.8" />
      </g>

      <!-- Limbs -->
      <g class="bug-limbs">
        <path d="M 50 100 L 20 85 L 15 115 L 28 120 L 30 96 L 52 110 Z" fill="url(#bugShellGrad)" stroke="#451a03" stroke-width="1.8" />
        <path d="M 15 115 C 8 135, 18 155, 30 160 C 26 150, 22 135, 28 120 Z" fill="#fcd34d" stroke="#b45309" stroke-width="1.2" />
        <path d="M 150 100 L 180 85 L 185 115 L 172 120 L 170 96 L 148 110 Z" fill="url(#bugShellGrad)" stroke="#451a03" stroke-width="1.8" />
        <path d="M 185 115 C 192 135, 182 155, 170 160 C 174 150, 178 135, 172 120 Z" fill="#fcd34d" stroke="#b45309" stroke-width="1.2" />
        <path d="M 55 150 L 35 175 L 22 195" fill="none" stroke="#78350f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 145 150 L 165 175 L 178 195" fill="none" stroke="#78350f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      </g>

      <!-- Carapace -->
      <g class="bug-carapace">
        <path d="M 60 90 C 40 120, 42 165, 65 190 C 85 208, 115 208, 135 190 C 158 165, 160 120, 140 90 Z" fill="url(#bugShellGrad)" stroke="#451a03" stroke-width="2.5" />
        <line x1="100" y1="92" x2="100" y2="198" stroke="#451a03" stroke-width="2.5" />
        <path d="M 54 125 Q 100 135 146 125" stroke="#78350f" stroke-width="2" fill="none" />
        <path d="M 58 155 Q 100 165 142 155" stroke="#78350f" stroke-width="2" fill="none" />
        <polygon points="100,105 118,135 82,135" fill="#facc15" stroke="#78350f" stroke-width="1.8" />
        <text x="100" y="130" font-family="sans-serif" font-size="16" font-weight="900" fill="#7f1d1d" text-anchor="middle">!</text>
      </g>

      <!-- Head & Mandibles -->
      <g class="bug-head">
        <path d="M 66 55 C 66 42, 134 42, 134 55 C 142 70, 140 92, 130 98 C 112 104, 88 104, 70 98 C 60 92, 58 70, 66 55 Z" fill="#292524" stroke="#f59e0b" stroke-width="2" />
        <path d="M 72 85 C 50 85, 36 105, 52 125 C 62 118, 66 102, 76 96 Z" fill="url(#bugMandibleGrad)" stroke="#451a03" stroke-width="1.5" />
        <polygon points="54,102 58,105 52,108" fill="#ffffff" />
        <polygon points="56,112 60,115 54,118" fill="#ffffff" />
        <path d="M 128 85 C 150 85, 164 105, 148 125 C 138 118, 134 102, 124 96 Z" fill="url(#bugMandibleGrad)" stroke="#451a03" stroke-width="1.5" />
        <polygon points="146,102 142,105 148,108" fill="#ffffff" />
        <polygon points="144,112 140,115 146,118" fill="#ffffff" />
        ${eyesAndMaw}
      </g>
    </g>
  `
}

function getRakusSvg(pose = 'idle') {
  const isDefeated = pose === 'defeated' || pose === 'defeat_last_hit'
  const isLaugh = pose === 'laugh'

  if (isDefeated) {
    return `
      <g class="boss-character char-rakus rakus-fallen">
        <ellipse cx="100" cy="180" rx="90" ry="25" fill="#000000" opacity="0.6" />
        <path d="M 25 175 C 20 130, 45 105, 100 100 C 155 105, 180 130, 175 175 C 160 190, 40 190, 25 175 Z" fill="url(#rakusBodyGrad)" stroke="#1e1035" stroke-width="2.5" />
        <path d="M 20 155 L 45 140 L 40 170 L 15 168 Z" fill="url(#rakusArmorGrad)" stroke="#facc15" stroke-width="1.5" />
        <polygon points="12,160 2,150 16,155" fill="#eab308" />
        <path d="M 180 155 L 155 140 L 160 170 L 185 168 Z" fill="url(#rakusArmorGrad)" stroke="#facc15" stroke-width="1.5" />
        <polygon points="188,160 198,150 184,155" fill="#eab308" />
        <path d="M 50 145 C 30 140, 12 125, 5 110 C 16 112, 38 128, 55 138 Z" fill="url(#rakusHornGrad)" stroke="#713f12" stroke-width="1.8" />
        <path d="M 150 145 C 170 140, 188 125, 195 110 C 184 112, 162 128, 145 138 Z" fill="url(#rakusHornGrad)" stroke="#713f12" stroke-width="1.8" />
        <path d="M 65 140 C 60 120, 140 120, 135 140 C 145 165, 138 185, 100 188 C 62 185, 55 165, 65 140 Z" fill="url(#rakusBodyGrad)" stroke="#1e1035" stroke-width="2" />
        <line x1="72" y1="148" x2="84" y2="160" stroke="#94a3b8" stroke-width="3.5" stroke-linecap="round" />
        <line x1="84" y1="148" x2="72" y2="160" stroke="#94a3b8" stroke-width="3.5" stroke-linecap="round" />
        <line x1="116" y1="148" x2="128" y2="160" stroke="#94a3b8" stroke-width="3.5" stroke-linecap="round" />
        <line x1="128" y1="148" x2="116" y2="160" stroke="#94a3b8" stroke-width="3.5" stroke-linecap="round" />
        <path d="M 80 170 Q 100 165 120 170" stroke="#334155" stroke-width="3" fill="none" stroke-linecap="round" />
        <path d="M 94 170 Q 96 182 104 180 Q 108 172 102 170 Z" fill="#f43f5e" stroke="#881337" stroke-width="1" />
        <ellipse cx="40" cy="180" rx="15" ry="8" fill="url(#rakusBodyGrad)" stroke="#1e1035" stroke-width="1.5" />
        <circle cx="30" cy="182" r="3.5" fill="#facc15" />
        <circle cx="38" cy="185" r="3.5" fill="#facc15" />
        <circle cx="46" cy="184" r="3.5" fill="#facc15" />
        <ellipse cx="160" cy="180" rx="15" ry="8" fill="url(#rakusBodyGrad)" stroke="#1e1035" stroke-width="1.5" />
        <circle cx="170" cy="182" r="3.5" fill="#facc15" />
        <circle cx="162" cy="185" r="3.5" fill="#facc15" />
        <circle cx="154" cy="184" r="3.5" fill="#facc15" />
      </g>
    `
  }

  let mouthContent = `
    <path d="M 72 102 Q 100 120 128 102 Z" fill="#2d0606" stroke="#1e1035" stroke-width="2.5" />
    <polygon points="80,102 84,107 88,102" fill="#ffffff" />
    <polygon points="94,103 98,108 102,103" fill="#ffffff" />
    <polygon points="112,102 116,107 120,102" fill="#ffffff" />
    <polygon points="78,112 84,98 88,112" fill="#fef08a" stroke="#713f12" stroke-width="0.8" />
    <polygon points="112,112 116,98 122,112" fill="#fef08a" stroke="#713f12" stroke-width="0.8" />
    <polygon points="98,114 100,106 104,114" fill="#ffffff" />
  `

  if (isLaugh) {
    mouthContent = `
      <path d="M 68 98 Q 100 134 132 98 Z" fill="#450a0a" stroke="#1e1035" stroke-width="2.5" />
      <polygon points="76,100 80,109 85,100" fill="#ffffff" />
      <polygon points="90,102 95,112 100,102" fill="#ffffff" />
      <polygon points="105,102 110,112 115,102" fill="#ffffff" />
      <polygon points="120,100 124,109 128,100" fill="#ffffff" />
      <polygon points="74,115 80,98 86,115" fill="#fef08a" stroke="#713f12" stroke-width="1" />
      <polygon points="114,115 120,98 126,115" fill="#fef08a" stroke="#713f12" stroke-width="1" />
      <ellipse cx="100" cy="122" rx="14" ry="7" fill="#f43f5e" />
    `
  }

  return `
    <g class="boss-character char-rakus rakus-standing">
      <!-- Horns -->
      <g class="horns">
        <path d="M 58 72 C 32 46, 12 18, 28 4 C 46 16, 62 44, 72 68 Z" fill="url(#rakusHornGrad)" stroke="#713f12" stroke-width="2" />
        <path d="M 36 24 Q 46 32 54 28" stroke="#fef08a" stroke-width="2" fill="none" opacity="0.8" />
        <path d="M 44 42 Q 54 48 62 44" stroke="#fef08a" stroke-width="2" fill="none" opacity="0.8" />
        <path d="M 52 58 Q 62 62 68 58" stroke="#fef08a" stroke-width="2" fill="none" opacity="0.8" />

        <path d="M 142 72 C 168 46, 188 18, 172 4 C 154 16, 138 44, 128 68 Z" fill="url(#rakusHornGrad)" stroke="#713f12" stroke-width="2" />
        <path d="M 164 24 Q 154 32 146 28" stroke="#fef08a" stroke-width="2" fill="none" opacity="0.8" />
        <path d="M 156 42 Q 146 48 138 44" stroke="#fef08a" stroke-width="2" fill="none" opacity="0.8" />
        <path d="M 148 58 Q 138 62 132 58" stroke="#fef08a" stroke-width="2" fill="none" opacity="0.8" />
      </g>

      <!-- Torso -->
      <path d="M 46 76 C 35 48, 165 48, 154 76 C 182 110, 185 168, 160 194 C 125 204, 75 204, 40 194 C 15 168, 18 110, 46 76 Z" fill="url(#rakusBodyGrad)" stroke="#1e1035" stroke-width="2.5" />
      <path d="M 70 60 Q 82 56 94 60" stroke="#c084fc" stroke-width="2" fill="none" opacity="0.5" />
      <path d="M 106 60 Q 118 56 130 60" stroke="#c084fc" stroke-width="2" fill="none" opacity="0.5" />
      <ellipse cx="46" cy="115" rx="6" ry="4" fill="#581c87" opacity="0.6" />
      <ellipse cx="154" cy="115" rx="6" ry="4" fill="#581c87" opacity="0.6" />

      <!-- Pauldrons -->
      <path d="M 28 82 L 64 70 L 58 108 L 22 98 Z" fill="url(#rakusArmorGrad)" stroke="#facc15" stroke-width="2" />
      <polygon points="26,80 14,66 34,74" fill="#eab308" stroke="#713f12" stroke-width="1" />
      <circle cx="36" cy="94" r="2.5" fill="#fde047" />
      <circle cx="50" cy="90" r="2.5" fill="#fde047" />
      <path d="M 172 82 L 136 70 L 142 108 L 178 98 Z" fill="url(#rakusArmorGrad)" stroke="#facc15" stroke-width="2" />
      <polygon points="174,80 186,66 166,74" fill="#eab308" stroke="#713f12" stroke-width="1" />
      <circle cx="164" cy="94" r="2.5" fill="#fde047" />
      <circle cx="150" cy="90" r="2.5" fill="#fde047" />

      <!-- Chest Plate & Core -->
      <path d="M 68 116 L 100 102 L 132 116 L 122 154 L 100 164 L 78 154 Z" fill="#1e1b4b" stroke="#eab308" stroke-width="2.5" />
      <circle cx="78" cy="120" r="2" fill="#facc15" />
      <circle cx="122" cy="120" r="2" fill="#facc15" />
      <circle cx="100" cy="158" r="2" fill="#facc15" />
      <polygon points="100,118 114,134 100,150 86,134" fill="#f43f5e" filter="url(#eyeGlow)" />

      <!-- Front Paws & Claws -->
      <g class="front-paws">
        <path d="M 45 106 C 28 120, 22 152, 34 182 C 45 186, 62 186, 68 174 C 72 158, 62 128, 54 112 Z" fill="url(#rakusBodyGrad)" stroke="#1e1035" stroke-width="2" />
        <circle cx="36" cy="180" r="5" fill="#facc15" stroke="#713f12" stroke-width="1" />
        <circle cx="48" cy="184" r="5.5" fill="#facc15" stroke="#713f12" stroke-width="1" />
        <circle cx="60" cy="182" r="5" fill="#facc15" stroke="#713f12" stroke-width="1" />
        <path d="M 155 106 C 172 120, 178 152, 166 182 C 155 186, 138 186, 132 174 C 128 158, 138 128, 146 112 Z" fill="url(#rakusBodyGrad)" stroke="#1e1035" stroke-width="2" />
        <circle cx="164" cy="180" r="5" fill="#facc15" stroke="#713f12" stroke-width="1" />
        <circle cx="152" cy="184" r="5.5" fill="#facc15" stroke="#713f12" stroke-width="1" />
        <circle cx="140" cy="182" r="5" fill="#facc15" stroke="#713f12" stroke-width="1" />
      </g>

      <!-- Face -->
      <g class="face">
        <path d="M 64 78 Q 100 86 136 78" stroke="#1e1035" stroke-width="3" fill="none" />
        <ellipse cx="78" cy="85" rx="14" ry="11" fill="#0f0728" />
        <polygon points="68,80 88,84 86,92 66,88" fill="#ea580c" />
        <circle cx="78" cy="86" r="4.5" fill="#fef08a" filter="url(#eyeGlow)" />
        <circle cx="79" cy="85" r="1.5" fill="#ffffff" />
        <ellipse cx="122" cy="85" rx="14" ry="11" fill="#0f0728" />
        <polygon points="132,80 112,84 114,92 134,88" fill="#ea580c" />
        <circle cx="122" cy="86" r="4.5" fill="#fef08a" filter="url(#eyeGlow)" />
        <circle cx="121" cy="85" r="1.5" fill="#ffffff" />
        ${mouthContent}
      </g>
    </g>
  `
}

const bosses = [
  { id: 'robot-glitch', fn: getRobotSvg },
  { id: 'virus-lambda', fn: getVirusSvg },
  { id: 'bugzilla', fn: getBugzillaSvg },
  { id: 'rakus-maximus', fn: getRakusSvg },
]

const poses = ['idle', 'laugh', 'defeated']

for (const b of bosses) {
  for (const p of poses) {
    const filenameBase = `${b.id}-${p}`
    const svgPath = path.join(targetDir, `${filenameBase}.svg`)
    const pngPath = path.join(targetDir, `${filenameBase}.png`)

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="880" viewBox="0 0 200 220">
${DEFS}
${b.fn(p)}
</svg>`

    fs.writeFileSync(svgPath, svgContent, 'utf8')
    console.log(`Generated SVG: ${svgPath}`)

    // Render to 800px PNG using qlmanage
    try {
      execSync(`qlmanage -t -s 800 -o "${targetDir}" "${svgPath}" >/dev/null 2>&1`)
      const producedPng = path.join(targetDir, `${filenameBase}.svg.png`)
      if (fs.existsSync(producedPng)) {
        fs.renameSync(producedPng, pngPath)
        console.log(`Rendered PNG: ${pngPath}`)
      }
    } catch (err) {
      console.warn(`qlmanage error for ${filenameBase}:`, err.message)
    }
  }
}
console.log('All 2D reference images generated successfully!')

