<template>
  <div class="arena-root min-h-screen text-white select-none flex flex-col justify-between">
    <!-- Top Header Bar (Layar Guru / Proyektor) -->
    <header class="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-black/60 border-b border-white/10 backdrop-blur-md sticky top-0 z-30">
      <div class="flex items-center gap-3">
        <img
          src="/logo-icon.png"
          alt="Belajarena"
          class="w-8 h-8 rounded-xl object-contain shadow"
        />
        <div>
          <p class="text-[10px] uppercase tracking-[0.25em] text-amber-300 font-extrabold">Layar Guru / Proyektor</p>
          <h1 class="text-base sm:text-lg font-black tracking-wide text-white">
            {{ getQuizTypeLabel(state?.quizType || 'ulangan_harian') }} — Materi: {{ state?.topic || 'Informatika' }}
          </h1>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <span class="px-2.5 py-1 rounded-lg bg-white/10 text-xs font-semibold border border-white/10">
          Status: <strong :class="statusColorClass">{{ statusLabel }}</strong>
        </span>
        <div class="flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-black tabular-nums text-sm shadow-md">
          <span>⏱️</span>
          <span>{{ clock }}</span>
        </div>

        <!-- Toggle Mode 3D / 2D -->
        <button
          @click="viewMode = viewMode === '3d' ? '2d' : '3d'"
          class="px-2.5 py-1 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
          :class="viewMode === '3d' ? 'bg-violet-500/20 text-violet-300 border-violet-400/40 hover:bg-violet-500/30' : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'"
          :title="viewMode === '3d' ? 'Mode 3D aktif. Klik untuk beralih ke Mode Ringan (2D)' : 'Mode 2D aktif. Klik untuk beralih ke Mode 3D'"
        >
          <span>{{ viewMode === '3d' ? '⚔️ 3D' : '🌱 2D' }}</span>
          <span class="hidden sm:inline">{{ viewMode === '3d' ? 'Mode 3D' : 'Mode Ringan' }}</span>
        </button>

        <!-- Tombol Toggle Mode Proyektor (Sembunyikan Menu Kanan Guru) -->
        <button
          @click="toggleProjectorMode"
          class="px-3.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer border"
          :class="isProjectorMode 
            ? 'bg-violet-600 hover:bg-violet-500 text-white border-violet-400 shadow-violet-500/30' 
            : 'bg-white/10 hover:bg-white/20 text-amber-300 border-amber-400/40'"
          :title="isProjectorMode ? 'Tampilkan kembali panel guru' : 'Sembunyikan menu guru agar hanya battlefield yang tampil di proyektor (Shortcut: P)'"
        >
          <span>{{ isProjectorMode ? '🎛️ Buka Panel Guru' : '📽️ Mode Proyektor (Full Battlefield)' }}</span>
        </button>

        <!-- Buka Layar Proyektor di Tab/Jendela Terpisah (Dual-Display) -->
        <button
          v-if="!isProjectorMode"
          @click="openSeparateProjector"
          class="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-medium transition flex items-center gap-1 border border-white/10 cursor-pointer"
          title="Buka jendela proyektor terpisah tanpa panel kontrol untuk layar proyektor / HDMI kedua"
        >
          <span>📺</span>
          <span class="hidden lg:inline">Layar Proyektor Terpisah</span>
        </button>

        <!-- Tombol Stop Sesi Game -->
        <button
          v-if="isSessionOngoing"
          @click="confirmStopSession"
          class="px-3.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
          title="Hentikan sesi game yang sedang berlangsung"
        >
          <span>⏹️</span>
          <span>Stop Sesi</span>
        </button>
        <button
          v-else
          @click="confirmCloseAndExit"
          class="px-3.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
          title="Tutup & Keluar dari sesi game"
        >
          <span>🚪</span>
          <span>Tutup Sesi</span>
        </button>

        <!-- Tombol Keluar Langsung ke Edu-Games (Selalu Tersedia) -->
        <button
          @click="handleTeacherExit"
          class="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/15 cursor-pointer"
          title="Keluar dari arena battle dan kembali ke ringkasan Edu-Games"
        >
          <span>🎮</span>
          <span>Ke Edu-Games</span>
        </button>

        <router-link
          to="/games/ulangan-harian"
          class="px-3 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-bold transition flex items-center gap-1"
        >
          ⚙️ Pengaturan
        </router-link>
      </div>
    </header>

    <!-- Main Battle Arena -->
    <main class="flex-1 p-3 sm:p-5 flex flex-col gap-4">
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-4 flex-1">
        <!-- ARENA CANVAS (Col 1-12 saat Mode Proyektor, Col 1-9 saat panel guru terbuka) -->
        <section
          :class="[
            'rounded-3xl overflow-hidden relative min-h-[580px] border border-violet-900/50 flex flex-col justify-between p-4 shadow-2xl transition-all duration-300',
            viewMode === '2d' ? arenaThemeClass : 'bg-slate-950',
            isProjectorMode ? 'xl:col-span-12 w-full' : 'xl:col-span-9'
          ]"
        >
          <!-- 3D Arena Environment Layer (Hanya Mode 2D) -->
          <div v-if="viewMode === '2d'" class="arena-env-layer" aria-hidden="true">
            <!-- Arena Floor (3D perspective) -->
            <div class="arena-floor"></div>
            <!-- Particles per theme -->
            <div class="arena-particles">
              <div v-for="i in 12" :key="i" class="arena-particle" :style="`--i:${i}`"></div>
            </div>
            <!-- Atmospheric glow -->
            <div class="arena-atmosphere"></div>
          </div>

          <!-- TOP HUD: Progress Kelas, Boss HP Bar, and Target Box -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-3 z-10">
            <!-- Left Card: Progress Kelas -->
            <div class="md:col-span-3 hud-card p-3 flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase tracking-wider text-rose-300">Progress Kelas</span>
                <span class="text-rose-400 text-sm">❤️</span>
              </div>
              <div class="my-1 flex items-baseline gap-2">
                <span class="text-3xl font-black text-rose-400 tabular-nums">
                  {{ state?.ketuntasanDisplay ?? 0 }}%
                </span>
                <span class="text-[11px] text-white/70">Ketuntasan</span>
              </div>
              <div class="text-[11px] text-white/90">
                Siswa di atas KKM: <strong class="text-emerald-400">{{ state?.passedCount ?? 0 }}</strong> / {{ state?.officialCount ?? 0 }}
              </div>
              <div class="text-[10px] text-white/60 mt-0.5">
                KKM: <strong class="text-amber-300">{{ kkm }}</strong>
              </div>
            </div>

            <!-- Center: Boss HP Bar -->
            <div class="md:col-span-6 flex flex-col items-center justify-center px-2">
              <p class="text-xs font-black tracking-widest text-amber-200 uppercase flex items-center gap-2">
                <span>👾</span> BOSS: {{ state?.boss?.name || 'Rakus Maximus' }}
              </p>
              <!-- HP Bar Container -->
              <div class="w-full h-5 rounded-full bg-black/70 overflow-hidden border-2 border-white/20 mt-1.5 relative shadow-inner">
                <div
                  class="h-full bg-gradient-to-r from-rose-600 via-orange-500 to-amber-400 transition-all duration-700 ease-out"
                  :style="{ width: hpWidth }"
                ></div>
                <!-- HP Numeric Overlay inside bar -->
                <div class="absolute inset-0 flex items-center justify-center text-[11px] font-black tracking-wider text-white drop-shadow-md tabular-nums">
                  {{ formatHp(state?.bossHpDisplay) }} / {{ formatHp(state?.initialBossHp) }} HP
                </div>
              </div>
              <p class="text-[11px] font-bold mt-1 text-white/80 tabular-nums">
                {{ formatHp(state?.bossHpDisplay) }} / {{ formatHp(state?.initialBossHp) }} HP
                <span class="text-amber-300 font-semibold">({{ state?.bossHpPercentDisplay ?? 100 }}% tersisa)</span>
              </p>
            </div>

            <!-- Right Card: Target -->
            <div class="md:col-span-3 hud-card p-3 flex flex-col justify-center text-xs">
              <p class="font-extrabold text-amber-300 flex items-center gap-1.5 mb-1 text-[11px]">
                <span>🎯</span> TARGET KELAS
              </p>
              <p class="text-white/90 text-[11px] leading-relaxed">
                Semua siswa harus mencapai nilai minimal KKM (<strong>{{ kkm }}</strong>) untuk mengalahkan boss!
              </p>
            </div>
          </div>

          <!-- ARENA 3D PERTEMPURAN BOSS (Default) -->
          <div v-if="viewMode === '3d'" class="w-full my-3 flex flex-col items-center relative">
            <BossBattle3DArena
              ref="boss3DArenaRef"
              :state="boss3DState"
              @switch-to-2d="viewMode = '2d'"
              @webgl-failed="viewMode = '2d'"
            />

            <!-- VICTORY DEFEATED BANNER DI BAWAH ARENA 3D -->
            <div v-if="state?.outcome === 'class_victory'" class="mt-3 text-center z-20 animate-fade-in w-full max-w-xl">
              <div class="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-900/90 via-emerald-600/90 to-teal-900/90 border-2 border-emerald-400/80 shadow-[0_0_30px_rgba(52,211,153,0.5)] inline-block w-full">
                <p class="text-xs sm:text-sm font-black text-emerald-200 uppercase tracking-widest">
                  Selamat! Semua siswa mencapai KKM!
                </p>
                <h2 class="text-xl sm:text-2xl font-black text-amber-300 tracking-wider mt-0.5">
                  BOSS DIKALAHKAN!
                </h2>
              </div>
            </div>

            <!-- DEFEAT BANNER DI BAWAH ARENA 3D -->
            <div v-else-if="state?.outcome === 'boss_victory'" class="mt-3 text-center defeat-container z-20 w-full max-w-xl">
              <div class="defeat-ribbon">
                💀 BOSS MENANG — MASIH ADA SISWA YANG BELUM TUNTAS 💀
              </div>
              <p class="text-xs text-rose-200 mt-1 font-semibold">
                {{ state?.passedCount }} dari {{ state?.officialCount }} siswa tuntas ({{ notPassedCount }} siswa belum mencapai KKM).
              </p>
              <p class="text-[11px] text-white/70 mt-0.5">
                Boss tertawa! Guru dapat membuka sesi remedial untuk siswa yang belum tuntas.
              </p>
            </div>
          </div>

          <!-- ARENA STAGE 2D (Fallback / Mode Ringan) -->
          <div v-else ref="arenaStageRef" class="relative flex-1 flex flex-col items-center justify-center my-4 min-h-[300px]">
            <!-- Tombol Mengambang di Pojok Kanan 2D Arena untuk kembali ke 3D -->
            <button
              @click="viewMode = '3d'"
              class="absolute top-2 right-2 z-30 px-3.5 py-1.5 rounded-xl bg-violet-600/90 hover:bg-violet-500 border border-violet-400 text-white font-black text-xs shadow-xl backdrop-blur-md transition flex items-center gap-1.5 cursor-pointer active:scale-95 animate-pulse"
              title="Beralih kembali ke tampilan 3D spektakuler"
            >
              <span>⚔️</span>
              <span>Beralih ke Mode 3D</span>
            </button>
            <!-- High-Energy Traveling Laser Beams & Counter-Attacks -->
            <svg class="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
              <defs>
                <!-- Green Dual Laser Gradient (Correct Answer: Panels 4 & 6) -->
                <linearGradient id="laserGreenGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stop-color="#22c55e" stop-opacity="0.9" />
                  <stop offset="50%" stop-color="#4ade80" stop-opacity="1" />
                  <stop offset="100%" stop-color="#ffffff" stop-opacity="1" />
                </linearGradient>

                <!-- Red Fiery Boss Laser Gradient (Wrong Answer Counter-Attack: Panel 5) -->
                <linearGradient id="laserRedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
                  <stop offset="40%" stop-color="#f97316" stop-opacity="1" />
                  <stop offset="100%" stop-color="#ef4444" stop-opacity="0.95" />
                </linearGradient>

                <filter id="laserGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g v-for="fx in activeProjectiles" :key="fx.id" class="laser-shot-group">
                <!-- 1. STUDENT CORRECT ATTACK (Dual Green Beams to Boss: Proporsional dengan Chibi 48px) -->
                <template v-if="fx.isCorrect !== false">
                  <!-- Outer Emerald Glow Beams -->
                  <line
                    :x1="`${fx.startX - 0.35}%`"
                    :y1="`${fx.startY ?? 96}%`"
                    x2="49.5%"
                    y2="38%"
                    stroke="#16a34a"
                    stroke-width="5"
                    stroke-linecap="round"
                    class="laser-beam-outer"
                    filter="url(#laserGlowFilter)"
                  />
                  <line
                    :x1="`${fx.startX + 0.35}%`"
                    :y1="`${fx.startY ?? 96}%`"
                    x2="50.5%"
                    y2="38%"
                    stroke="#16a34a"
                    stroke-width="5"
                    stroke-linecap="round"
                    class="laser-beam-outer"
                    filter="url(#laserGlowFilter)"
                  />

                  <!-- Main Dual Neon Green Laser Beams -->
                  <line
                    :x1="`${fx.startX - 0.35}%`"
                    :y1="`${fx.startY ?? 96}%`"
                    x2="49.5%"
                    y2="38%"
                    stroke="url(#laserGreenGrad)"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    class="laser-beam-main"
                  />
                  <line
                    :x1="`${fx.startX + 0.35}%`"
                    :y1="`${fx.startY ?? 96}%`"
                    x2="50.5%"
                    y2="38%"
                    stroke="url(#laserGreenGrad)"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    class="laser-beam-main"
                  />

                  <!-- Pure White Plasma Cores -->
                  <line
                    :x1="`${fx.startX - 0.35}%`"
                    :y1="`${fx.startY ?? 96}%`"
                    x2="49.5%"
                    y2="38%"
                    stroke="#ffffff"
                    stroke-width="1.0"
                    stroke-linecap="round"
                  />
                  <line
                    :x1="`${fx.startX + 0.35}%`"
                    :y1="`${fx.startY ?? 96}%`"
                    x2="50.5%"
                    y2="38%"
                    stroke="#ffffff"
                    stroke-width="1.0"
                    stroke-linecap="round"
                  />

                  <!-- Student Hand Muzzle Burst (Proporsional Chibi) -->
                  <circle
                    :cx="`${fx.startX}%`"
                    :cy="`${fx.startY ?? 96}%`"
                    r="7"
                    fill="#4ade80"
                    filter="url(#laserGlowFilter)"
                  />
                  <circle
                    :cx="`${fx.startX}%`"
                    :cy="`${fx.startY ?? 96}%`"
                    r="3.5"
                    fill="#ffffff"
                  />

                  <!-- Boss Impact Flash & Yellow Floating Damage Text -->
                  <circle
                    cx="50%"
                    cy="38%"
                    r="20"
                    fill="#22c55e"
                    filter="url(#laserGlowFilter)"
                  />
                  <circle cx="50%" cy="38%" r="9" fill="#ffffff" />
                  <text
                    x="50%"
                    y="31%"
                    fill="#facc15"
                    font-family="system-ui, sans-serif"
                    font-size="24"
                    font-weight="900"
                    text-anchor="middle"
                    filter="url(#laserGlowFilter)"
                    class="damage-popup-text"
                  >
                    {{ fx.damageText || '-3.3%' }}
                  </text>
                </template>

                <!-- 2. BOSS COUNTER-ATTACK (Fiery Red Beam from Boss Mouth to Student: Panel 5) -->
                <template v-else>
                  <!-- Laser meleset dari siswa ke arah samping boss (tidak mengenai boss) -->
                  <path
                    :d="`M ${fx.startX}% ${fx.startY ?? 96}% Q ${fx.startX <= 50 ? '38%' : '62%'} 50% ${fx.startX <= 50 ? '20%' : '80%'} 18%`"
                    stroke="#f97316"
                    stroke-width="3"
                    stroke-linecap="round"
                    fill="none"
                    class="laser-miss-beam"
                    filter="url(#laserGlowFilter)"
                  />
                  <path
                    :d="`M ${fx.startX}% ${fx.startY ?? 96}% Q ${fx.startX <= 50 ? '38%' : '62%'} 50% ${fx.startX <= 50 ? '20%' : '80%'} 18%`"
                    stroke="#ffffff"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    fill="none"
                    class="laser-miss-beam"
                  />
                  <!-- Muzzle flash di tangan siswa -->
                  <circle
                    :cx="`${fx.startX}%`"
                    :cy="`${fx.startY ?? 96}%`"
                    r="7"
                    fill="#f97316"
                    filter="url(#laserGlowFilter)"
                    class="laser-miss-beam"
                  />
                  <!-- Floating text "MELESET!" di titik laser meleset -->
                  <text
                    :x="fx.startX <= 50 ? '22%' : '78%'"
                    y="17%"
                    fill="#fb923c"
                    font-family="system-ui, sans-serif"
                    font-size="20"
                    font-weight="900"
                    text-anchor="middle"
                    filter="url(#laserGlowFilter)"
                    class="miss-popup-text"
                  >
                    MELESET!
                  </text>

                  <!-- Outer Fiery Crimson Beam (boss counter-attack) -->
                  <line
                    x1="50%"
                    y1="40%"
                    :x2="`${fx.startX}%`"
                    :y2="`${fx.startY ?? 96}%`"
                    stroke="#dc2626"
                    stroke-width="14"
                    stroke-linecap="round"
                    filter="url(#laserGlowFilter)"
                  />
                  <!-- Main Red/Orange Laser Shaft -->
                  <line
                    x1="50%"
                    y1="40%"
                    :x2="`${fx.startX}%`"
                    :y2="`${fx.startY ?? 96}%`"
                    stroke="url(#laserRedGrad)"
                    stroke-width="7"
                    stroke-linecap="round"
                  />
                  <line
                    x1="50%"
                    y1="40%"
                    :x2="`${fx.startX}%`"
                    :y2="`${fx.startY ?? 96}%`"
                    stroke="#ffffff"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  />

                  <!-- Boss Mouth Muzzle Burst -->
                  <circle cx="50%" cy="40%" r="20" fill="#f97316" filter="url(#laserGlowFilter)" />
                  <circle cx="50%" cy="40%" r="9" fill="#ffffff" />

                  <!-- Student Hit Impact Explosion -->
                  <circle
                    :cx="`${fx.startX}%`"
                    :cy="`${fx.startY ?? 96}%`"
                    r="26"
                    fill="#ef4444"
                    filter="url(#laserGlowFilter)"
                  />
                  <circle
                    :cx="`${fx.startX}%`"
                    :cy="`${fx.startY ?? 96}%`"
                    r="10"
                    fill="#ffffff"
                  />
                </template>
              </g>
            </svg>

            <!-- Teacher Encouragement Speech Bubble on Left (Panel 3) -->
            <div class="absolute left-3 sm:left-6 top-[28%] z-20 hidden md:flex items-center gap-2.5 bg-black/70 border border-white/15 rounded-2xl p-2.5 backdrop-blur-md max-w-[220px] shadow-2xl animate-fade-in">
              <div class="w-10 h-10 rounded-xl bg-violet-600/40 border border-violet-400 flex items-center justify-center text-xl shrink-0">
                👩‍🏫
              </div>
              <p class="text-[11px] text-white/95 font-semibold leading-tight">
                "Ayo semua! Kalahkan boss dengan nilai di atas KKM!"
              </p>
            </div>

            <!-- Right-Side Battle HUD Card (Panels 3, 4, 5, 6, 7) -->
            <div class="absolute right-3 sm:right-6 top-[22%] z-20 bg-black/75 border border-white/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-2xl min-w-[155px] space-y-2 text-left">
              <p class="text-xs font-black text-amber-300 pb-1 border-b border-white/15">
                Soal {{ currentQuestionDisplay }} dari {{ state?.questionCount || 10 }}
              </p>
              <div>
                <p class="text-[10px] text-white/60 uppercase font-extrabold tracking-wider">Siswa Tuntas KKM</p>
                <p class="text-sm font-black text-emerald-400 tabular-nums">
                  {{ state?.passedCount ?? 0 }} / {{ state?.officialCount ?? 0 }} ({{ state?.ketuntasanDisplay ?? 0 }}%)
                </p>
              </div>
              <div>
                <p class="text-[10px] text-white/60 uppercase font-extrabold tracking-wider">HP Boss</p>
                <p class="text-sm font-black text-rose-400 tabular-nums">
                  {{ formatHp(state?.bossHpDisplay) }} ({{ state?.bossHpPercentDisplay ?? 100 }}%)
                </p>
              </div>
            </div>

            <!-- Floating Real-Time Answer Notification Pill (Panels 4 & 5) -->
            <div
              v-if="recentNotification"
              class="absolute bottom-2 left-4 sm:left-6 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/80 border border-white/20 backdrop-blur-md shadow-2xl animate-bounce"
            >
              <StudentChibi :name="recentNotification.name" :size="32" :pose="recentNotification.type === 'correct' ? 'attack' : 'hit'" :gender="recentNotification.gender" />
              <span
                class="text-xs font-black tracking-wide"
                :class="recentNotification.type === 'correct' ? 'text-emerald-300' : 'text-rose-400'"
              >
                {{ recentNotification.name }} {{ recentNotification.type === 'correct' ? 'menjawab benar!' : 'menjawab salah!' }}
              </span>
            </div>

            <!-- Boss Reaction Sparks from Student attacks -->
            <div v-if="showHit" class="boss-hit-shockwave"></div>

            <!-- Central Boss Character Rig -->
            <BossSprite
              :name="state?.boss?.name || 'Rakus Maximus'"
              :boss-id="state?.boss?.id || 'rakus-maximus'"
              :color="state?.boss?.color || '#7c3aed'"
              :accent="state?.boss?.accent || '#c084fc'"
              :custom-image-url="state?.boss?.customImageUrl"
              :pose="visualPose"
              :show-hit="showHit"
              :reduced-motion="reduced"
            />

            <!-- VICTORY DEFEATED BANNER (Panel 7: Semua Siswa Capai KKM! BOSS DIKALAHKAN!) -->
            <div v-if="state?.outcome === 'class_victory'" class="mt-4 text-center z-20 animate-fade-in">
              <div class="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-900/90 via-emerald-600/90 to-teal-900/90 border-2 border-emerald-400/80 shadow-[0_0_30px_rgba(52,211,153,0.5)] inline-block">
                <p class="text-xs sm:text-sm font-black text-emerald-200 uppercase tracking-widest">
                  Selamat! Semua siswa mencapai KKM!
                </p>
                <h2 class="text-xl sm:text-2xl font-black text-amber-300 tracking-wider mt-0.5">
                  BOSS DIKALAHKAN!
                </h2>
              </div>
            </div>

            <!-- DEFEAT BANNER (Boss Victory) -->
            <div v-else-if="state?.outcome === 'boss_victory'" class="mt-4 text-center defeat-container z-20">
              <div class="defeat-ribbon">
                💀 BOSS MENANG — MASIH ADA SISWA YANG BELUM TUNTAS 💀
              </div>
              <p class="text-xs text-rose-200 mt-1 font-semibold">
                {{ state?.passedCount }} dari {{ state?.officialCount }} siswa tuntas ({{ notPassedCount }} siswa belum mencapai KKM).
              </p>
              <p class="text-[11px] text-white/70 mt-0.5">
                Boss tertawa! Guru dapat membuka sesi remedial untuk siswa yang belum tuntas.
              </p>
            </div>
          </div>

          <!-- BOTTOM STAGE: STUDENTS 2D ANIME CHIBI ROSTER LINEUP (Panels 2, 3, 4, 5, 6, 7) -->
          <div class="z-10 bg-black/60 backdrop-blur-md rounded-2xl p-3 border border-white/10 shadow-inner">
            <div class="flex items-center justify-between text-[11px] text-white/75 mb-2 px-1">
              <span class="font-bold flex items-center gap-1.5">
                <span>👥</span> Siswa Bergabung ({{ projectorStudents.length }} Siswa)
              </span>
              <span class="text-amber-300 font-semibold">
                Soal ke: {{ currentQuestionDisplay }} / {{ state?.questionCount || 10 }} &bull; Tipe: Pilihan Ganda
              </span>
            </div>

            <!-- Student Anime Chibi Grid (Two rows matching reference demo video) -->
            <div class="flex flex-wrap items-center justify-center gap-3.5 max-h-44 overflow-y-auto px-2 py-1">
              <div
                v-for="p in projectorStudents"
                :key="p.participantId"
                :ref="(el) => setStudentCardRef(p.participantId, el)"
                :data-participant-id="p.participantId"
                class="flex flex-col items-center transition-transform duration-300 group hover:scale-110 cursor-pointer"
              >
                <!-- 2D Anime Chibi Character -->
                <StudentChibi
                  :name="p.name"
                  :student-id="p.participantId"
                  :size="48"
                  :gender="p.gender"
                  :pose="attackingStudentId === p.participantId ? 'attack' : (hitStudentId === p.participantId ? 'hit' : (state?.outcome === 'class_victory' ? 'cheer' : 'idle'))"
                  :show-name="showNames"
                />

                <!-- Score Badge / KKM Indicator -->
                <div class="flex items-center gap-1 mt-0.5">
                  <span
                    class="text-[9px] font-black px-1.5 py-0.2 rounded-full tabular-nums"
                    :class="p.reachedKkm ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' : 'bg-black/60 text-white/70 border border-white/10'"
                  >
                    {{ Math.round(p.academicScore) }} {{ p.reachedKkm ? '✓' : '' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- TEACHER DASHBOARD SIDEBAR (Col 10-12) - Sembunyi Otomatis Saat Mode Proyektor Aktif -->
        <aside v-if="!isProjectorMode" class="xl:col-span-3 space-y-3 flex flex-col animate-fade-in">
          <!-- Control Panel -->
          <div class="hud-card p-4 space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-white/10">
              <h2 class="font-black text-sm text-amber-300 flex items-center gap-2">
                <span>🎛️</span> Dashboard Guru
              </h2>
              <span class="text-[10px] text-white/60">Live Engine</span>
            </div>

            <div class="space-y-1.5 text-xs">
              <p class="flex justify-between">
                <span class="text-white/70">Jenis Ulangan:</span>
                <strong class="text-white">{{ getQuizTypeLabel(state?.quizType || 'ulangan_harian') }}</strong>
              </p>
              <p class="flex justify-between">
                <span class="text-white/70">Ketuntasan Kelas:</span>
                <strong class="text-rose-400">{{ state?.ketuntasanDisplay ?? 0 }}%</strong>
              </p>
              <p class="flex justify-between">
                <span class="text-white/70">Siswa Tuntas:</span>
                <strong class="text-emerald-400">{{ state?.passedCount }} / {{ state?.officialCount }} siswa</strong>
              </p>
              <p class="flex justify-between">
                <span class="text-white/70">Belum Tuntas:</span>
                <strong class="text-rose-400">{{ notPassedCount }} siswa</strong>
              </p>
              <p class="flex justify-between">
                <span class="text-white/70">HP Boss Tersisa:</span>
                <strong class="text-amber-300">{{ formatHp(state?.bossHpDisplay) }} HP</strong>
              </p>
            </div>

            <!-- Action Simulation Buttons for Teacher Testing -->
            <div class="pt-2 border-t border-white/10 flex flex-col gap-2">
              <button
                class="btn-action bg-emerald-600 hover:bg-emerald-500"
                @click="simStudentAnswerCorrect"
                :disabled="state?.outcome === 'class_victory' && state?.learningMode !== true"
              >
                <span>⚡</span> Simulasikan Siswa Menjawab Benar
              </button>

              <button
                v-if="state?.outcome === 'class_victory'"
                class="btn-action bg-violet-600 hover:bg-violet-500"
                @click="simHitAfterDefeated"
              >
                <span>🎯</span> Serang Boss Kalah (Hanya Visual)
              </button>

              <button
                v-if="isSessionOngoing"
                class="btn-action bg-rose-600 hover:bg-rose-500 font-black"
                @click="confirmStopSession"
              >
                <span>⏹️</span> Hentikan Sesi Game (Stop)
              </button>
              <button
                v-else
                class="btn-action bg-emerald-600 hover:bg-emerald-500 font-black"
                @click="confirmCloseAndExit"
              >
                <span>🚪</span> Tutup Sesi & Ke Edu-Games
              </button>

              <button
                v-if="!isSessionOngoing && !state?.learningMode"
                class="btn-action bg-amber-600 hover:bg-amber-500"
                @click="enableLearning"
              >
                <span>📖</span> Aktifkan Mode Belajar (Kunci Nilai)
              </button>

              <router-link
                v-if="joinCode"
                class="btn-action bg-indigo-600 hover:bg-indigo-500 text-center"
                :to="`/games/ulangan-harian/play/${joinCode}`"
                target="_blank"
              >
                <span>📱</span> Buka Layar Siswa (Mobile Device) →
              </router-link>
            </div>
          </div>

          <!-- Individual Private Student Progress (Teacher Eyes Only) -->
          <div class="hud-card p-4 flex-1 flex flex-col min-h-0">
            <div class="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
              <div class="flex items-center gap-1.5">
                <span class="text-sm">🔒</span>
                <h3 class="font-bold text-xs text-white/90">
                  Nilai Siswa ({{ students.length }} Siswa)
                </h3>
              </div>
              <span class="text-[10px] text-amber-300 font-mono font-bold">KKM: {{ kkm }}</span>
            </div>

            <!-- Search & Filter Tabs -->
            <div class="space-y-1.5 mb-2.5">
              <input
                v-model="studentSearch"
                type="text"
                placeholder="🔍 Cari nama siswa..."
                class="w-full text-[11px] bg-black/40 border border-white/15 rounded-xl px-2.5 py-1.5 text-white placeholder-white/40 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition"
              />
              <div class="grid grid-cols-3 gap-1 text-[10px] font-bold">
                <button
                  type="button"
                  @click="studentFilterTab = 'all'"
                  class="py-1 px-1 rounded-lg transition text-center"
                  :class="studentFilterTab === 'all' ? 'bg-white/20 text-white font-extrabold shadow-xs' : 'text-white/60 hover:text-white hover:bg-white/5'"
                >
                  Semua ({{ students.length }})
                </button>
                <button
                  type="button"
                  @click="studentFilterTab = 'tuntas'"
                  class="py-1 px-1 rounded-lg transition text-center"
                  :class="studentFilterTab === 'tuntas' ? 'bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-400/40 shadow-xs' : 'text-white/60 hover:text-emerald-300 hover:bg-white/5'"
                >
                  Tuntas ({{ passedCountComputed }})
                </button>
                <button
                  type="button"
                  @click="studentFilterTab = 'belum'"
                  class="py-1 px-1 rounded-lg transition text-center"
                  :class="studentFilterTab === 'belum' ? 'bg-rose-500/20 text-rose-300 font-extrabold border border-rose-400/40 shadow-xs' : 'text-white/60 hover:text-rose-300 hover:bg-white/5'"
                >
                  Belum ({{ notPassedCount }})
                </button>
              </div>
            </div>

            <!-- Student List with Custom Visible Scrollbar -->
            <div class="space-y-1 overflow-y-auto max-h-[380px] pr-1 text-xs custom-scrollbar flex-1 divide-y divide-white/5">
              <div
                v-if="filteredStudents.length === 0"
                class="text-center py-6 text-white/40 text-[11px] italic"
              >
                Tidak ada data siswa yang cocok
              </div>
              <div
                v-for="(p, idx) in filteredStudents"
                :key="p.participantId"
                class="flex items-center justify-between py-1.5 px-1.5 rounded-lg transition hover:bg-white/5"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-[10px] text-white/40 font-mono w-4 text-right">{{ idx + 1 }}</span>
                  <span class="text-sm shrink-0">{{ p.avatar || '🧑' }}</span>
                  <span class="font-medium text-white/90 text-xs truncate max-w-[130px]" :title="p.name">
                    {{ p.name }}
                  </span>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <button
                    @click.stop="toggleStudentAbsent(p.participantId)"
                    class="px-1.5 py-0.5 rounded text-[9px] font-bold transition cursor-pointer"
                    :class="(p as any).isAbsent ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white/70'"
                    :title="(p as any).isAbsent ? 'Peserta ditandai ABSEN (klik untuk ubah jadi hadir)' : 'Tandai peserta ABSEN / tidak ikut'"
                  >
                    {{ (p as any).isAbsent ? 'Absen' : 'Hadir' }}
                  </button>
                  <span
                    class="font-mono font-bold text-xs tabular-nums"
                    :class="(p as any).isAbsent ? 'text-white/30 line-through' : (p.reachedKkm ? 'text-emerald-400' : 'text-rose-400')"
                  >
                    {{ Math.round(p.academicScore) }}
                  </span>
                  <span
                    class="px-1.5 py-0.5 rounded text-[9px] font-bold"
                    :class="(p as any).isAbsent ? 'bg-white/5 text-white/30 border border-white/10' : (p.reachedKkm ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30')"
                  >
                    {{ (p as any).isAbsent ? 'Absen' : (p.reachedKkm ? 'Tuntas' : 'Belum') }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Remedial Suggestion Box -->
          <div v-if="state?.outcome === 'boss_victory' && remedialOn" class="hud-card p-4 border-amber-500/40 bg-amber-950/30 text-xs space-y-1.5">
            <p class="font-bold text-amber-300 flex items-center gap-1.5">
              <span>💡</span> Tindak Lanjut Remedial
            </p>
            <p class="text-white/80">
              Sebanyak <strong>{{ notPassedCount }} siswa</strong> belum mencapai KKM. Guru dapat membuka paket remedial khusus di modul asesmen.
            </p>
            <router-link to="/assessments" class="inline-block text-amber-400 hover:text-amber-300 font-bold underline mt-1">
              Buka Modul Asesmen & Remedial →
            </router-link>
          </div>
        </aside>
      </div>

      <!-- Floating Buttons Saat Mode Proyektor (Untuk Membuka Kembali Panel Guru & Keluar) -->
      <div v-if="isProjectorMode" class="fixed bottom-5 right-5 z-40 flex items-center gap-2 animate-fade-in">
        <button
          @click="handleTeacherExit"
          class="px-3.5 py-2.5 rounded-2xl bg-black/85 hover:bg-rose-950/90 border border-white/20 hover:border-rose-400 text-white text-xs font-bold backdrop-blur-md shadow-2xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          title="Keluar dari arena battle dan kembali ke Dashboard"
        >
          <span>🚪</span>
          <span>Keluar</span>
        </button>
        <button
          @click="toggleProjectorMode"
          class="px-4 py-2.5 rounded-2xl bg-black/85 hover:bg-black border border-white/20 hover:border-amber-400 text-white text-xs font-bold backdrop-blur-md shadow-2xl flex items-center gap-2 transition active:scale-95 cursor-pointer"
          title="Buka kembali panel guru (Shortcut: P)"
        >
          <span>🎛️</span>
          <span>Buka Panel Guru</span>
        </button>
      </div>

      <!-- RESULTS SECTION: MVP PODIUM & BATTLE SUMMARY -->
      <section v-if="!isSessionOngoing" class="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-fade-in">
        <!-- MVP Podium (Most Valuable Players) -->
        <div class="lg:col-span-8 hud-card p-5">
          <!-- MVP Outcome Header: Menyesuaikan hasil kemenangan kelas vs boss -->
          <div class="text-center mb-5 pb-3 border-b border-white/10">
            <template v-if="state?.outcome === 'class_victory'">
              <h1 class="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 tracking-[0.2em] drop-shadow-[0_4px_20px_rgba(234,179,8,0.5)]">
                🏆 VICTORY!
              </h1>
              <p class="text-xs sm:text-sm text-emerald-300 font-bold mt-1">
                Hasil Pertandingan — Seluruh Siswa Mencapai KKM & Kelas Berhasil Menang!
              </p>
            </template>
            <template v-else>
              <h1 class="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-400 to-orange-400 tracking-[0.15em] drop-shadow-[0_4px_20px_rgba(244,63,94,0.4)]">
                ⚔️ BATTLE SELESAI
              </h1>
              <p class="text-xs sm:text-sm text-rose-300 font-bold mt-1">
                Hasil Pertandingan — Masih Ada Siswa Belum Mencapai KKM (Boss Menang)
              </p>
            </template>
            <p class="text-[11px] text-white/60 mt-1 uppercase tracking-wider font-semibold">
              ⭐ Daftar Pejuang & Kontributor Terbaik (MVP Podium)
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end max-w-2xl mx-auto mb-4">
            <div
              v-for="m in podiumMvpList"
              :key="m.participantId"
              class="mvp-podium-card flex flex-col items-center justify-between p-4 rounded-2xl border"
              :class="[
                m.rank === 1
                  ? 'bg-gradient-to-b from-amber-950/70 via-slate-900 to-slate-950 border-amber-400/80 shadow-[0_0_25px_rgba(250,204,21,0.35)] -translate-y-2'
                  : m.rank === 2
                  ? 'bg-gradient-to-b from-sky-950/70 via-slate-900 to-slate-950 border-sky-400/70 shadow-[0_0_20px_rgba(56,189,248,0.25)]'
                  : 'bg-gradient-to-b from-orange-950/70 via-slate-900 to-slate-950 border-orange-500/60 shadow-[0_0_20px_rgba(249,115,22,0.2)]'
              ]"
            >
              <div
                class="flex items-center gap-1 font-black text-xs uppercase tracking-wider mb-2"
                :class="m.rank === 1 ? 'text-amber-300' : m.rank === 2 ? 'text-sky-300' : 'text-orange-300'"
              >
                <span v-if="m.rank === 1">👑</span>
                <span>MVP #{{ m.rank }}</span>
              </div>

              <!-- Student Anime Chibi Avatar -->
              <div class="my-1">
                <StudentChibi :name="m.name" :student-id="m.participantId" :size="58" :pose="state?.outcome === 'class_victory' ? 'cheer' : 'idle'" :gender="m.gender" />
              </div>

              <h3 class="font-black text-sm text-white mt-1">{{ m.name }}</h3>

              <div class="mt-2 text-center text-xs space-y-0.5">
                <p class="font-extrabold text-amber-300">
                  Skor {{ Math.round(m.finalScore) }}
                </p>
                <p class="text-[11px] text-white/80">
                  Akurasi {{ Math.round(m.accuracy * 100) }}%
                </p>
              </div>
            </div>
          </div>

          <!-- Bottom Summary & Action Buttons (Panel 8) -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs text-white/80">
            <div class="flex items-center gap-4">
              <span>Ketuntasan Kelas: <strong class="text-emerald-400">{{ state?.ketuntasanDisplay ?? 0 }}% ({{ state?.passedCount ?? 0 }} / {{ state?.officialCount ?? 0 }})</strong></span>
              <span>Durasi: <strong class="text-white">{{ clock }}</strong></span>
            </div>
            <div class="flex items-center gap-2">
              <router-link to="/reports/exam-events" class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition">
                Lihat Rekap Nilai
              </router-link>
              <button @click="confirmCloseAndExit" class="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black transition shadow-lg cursor-pointer">
                Selesai & Ke Dashboard
              </button>
            </div>
          </div>
        </div>

        <!-- Ringkasan Battle & Class Rating Badge -->
        <div class="lg:col-span-4 hud-card p-5 flex flex-col justify-between">
          <div>
            <h2 class="font-black text-sm text-white mb-3 pb-2 border-b border-white/10 flex items-center justify-between">
              <span>📊 RINGKASAN BATTLE</span>
              <span class="text-xs text-amber-300 font-bold">Laporan Selesai</span>
            </h2>

            <div class="space-y-2 text-xs">
              <div class="flex justify-between py-1 border-b border-white/5">
                <span class="text-white/70">Total Siswa:</span>
                <span class="font-bold text-white">{{ state?.officialCount }} Peserta</span>
              </div>
              <div class="flex justify-between py-1 border-b border-white/5">
                <span class="text-white/70">Siswa di atas KKM:</span>
                <span class="font-bold text-emerald-400">{{ state?.passedCount }} ({{ state?.ketuntasanDisplay }}%)</span>
              </div>
              <div class="flex justify-between py-1 border-b border-white/5">
                <span class="text-white/70">Siswa Belum KKM:</span>
                <span class="font-bold text-rose-400">{{ notPassedCount }} Siswa</span>
              </div>
              <div class="flex justify-between py-1 border-b border-white/5">
                <span class="text-white/70">Tipe Soal:</span>
                <span class="font-bold text-white">Pilihan Ganda</span>
              </div>
              <div class="flex justify-between py-1 border-b border-white/5">
                <span class="text-white/70">Hasil Pertarungan:</span>
                <span class="font-black" :class="state?.outcome === 'class_victory' ? 'text-emerald-400' : 'text-rose-400'">
                  {{ state?.outcome === 'class_victory' ? 'KELAS MENANG' : 'BOSS MENANG' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Class Rating Medallion -->
          <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-4">
            <div class="rating-badge" :class="classRatingClass">
              <span class="text-2xl font-black">{{ classRatingLetter }}</span>
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-wider text-white/60 font-bold">Rating Kelas</p>
              <p class="text-xs font-extrabold text-white">{{ classRatingTitle }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import BossSprite from './BossSprite.vue'
import StudentChibi from './StudentChibi.vue'
import { getQuizTypeLabel } from './engine'
import { useBossBattleSession } from './sessionStore'
import { realtimeBossBattle } from '@/services/realtimeBossBattle'
import { isWebGLAvailable } from '@/game3d/core/WebGLDetector'
import BossBattle3DArena from '@/game3d/components/BossBattle3DArena.vue'
import type { BossStateData } from '@/game3d/bossBattle/BossBattle3DScene'

const route = useRoute()
const router = useRouter()
const viewMode = ref<'3d' | '2d'>(isWebGLAvailable() ? '3d' : '2d')
const boss3DArenaRef = ref<any>(null)
const {
  publicState,
  visualQueue,
  mvp,
  draft,
  progressList,
  getActiveSession,
  restoreSession,
  loadSessionFromBackend,
  syncOnlineSessionState,
  beginBattle,
  answerAsStudent,
  finishByTimeout,
  stopActiveSession,
  clearActiveSession,
  turnOnLearningMode,
  tick,
  syncBankQuestions,
  questionsOfActive,
} = useBossBattleSession()

const arenaStageRef = ref<HTMLElement | null>(null)
const studentCardRefs = new Map<string, HTMLElement>()

const podiumMvpList = computed(() => {
  const list = [...mvp.value]
  if (list.length === 0) return []
  const rank1 = list.find((m) => m.rank === 1) || list[0]
  const rank2 = list.find((m) => m.rank === 2) || list[1]
  const rank3 = list.find((m) => m.rank === 3) || list[2]
  // Olympic order: #2 on left, #1 in center, #3 on right
  const res = []
  if (rank2 && rank2 !== rank1) res.push(rank2)
  if (rank1) res.push(rank1)
  if (rank3 && rank3 !== rank1 && rank3 !== rank2) res.push(rank3)
  return res.length > 0 ? res : list.slice(0, 3)
})

function setStudentCardRef(id: string, el: any) {
  if (el) {
    const domEl = (el as any).$el || el
    studentCardRefs.set(id, domEl)
  } else {
    studentCardRefs.delete(id)
  }
}

const showHit = ref(false)
const attackingStudentId = ref<string | null>(null)
const hitStudentId = ref<string | null>(null)
const recentNotification = ref<{ type: 'correct' | 'wrong'; name: string; gender?: 'L' | 'P' } | null>(null)
const activeProjectiles = ref<Array<{
  id: string
  startX: number
  startY?: number
  isCorrect?: boolean
  damageText?: string
}>>([])
let timerInterval: ReturnType<typeof setInterval> | null = null
let hitTimeout: ReturnType<typeof setTimeout> | null = null
let notifTimeout: ReturnType<typeof setTimeout> | null = null
let unsubVisualArena: (() => void) | null = null
let unsubAnswerArena: (() => void) | null = null
let unsubHpArena: (() => void) | null = null
let unsubStateArena: (() => void) | null = null
let networkPollInterval: ReturnType<typeof setInterval> | null = null
let lastNetworkPollTimestamp = Date.now() - 5000

onMounted(async () => {
  const urlId = String(route.params.id || '')
  if (urlId && urlId !== 'active') {
    await loadSessionFromBackend(urlId)
  } else {
    await loadSessionFromBackend('active')
  }
  await syncBankQuestions()

  // 1. Tangkap serangan visual dari siswa secara real-time lokal
  unsubVisualArena = realtimeBossBattle.subscribe('boss.hit.visual', (visual: any) => {
    if (visual?.participantId) {
      triggerVisualAttack(visual.participantId, visual.correct !== false, visual.participantName || visual.name, visual.eventId, visual.damage)
    }
  })

  // 2. Tangkap jawaban siswa langsung untuk memicu efek serangan jika benar
  unsubAnswerArena = realtimeBossBattle.subscribe('student.answer.submitted', (payload: any) => {
    if (payload?.participantId) {
      triggerVisualAttack(payload.participantId, payload.isCorrect !== false, payload.participantName || payload.name, payload.clientEventId, payload.damage)
    }
  })

  // 3. Sinkronkan HP boss real-time lokal
  unsubHpArena = realtimeBossBattle.subscribe('boss.hp.updated', (payload: any) => {
    if (payload && publicState.value) {
      if (payload.bossHpExact !== undefined && payload.bossHpExact !== null) publicState.value.bossHpExact = payload.bossHpExact
      if (payload.bossHpDisplay !== undefined && payload.bossHpDisplay !== null) publicState.value.bossHpDisplay = payload.bossHpDisplay
      if (payload.bossHpPercentDisplay !== undefined && payload.bossHpPercentDisplay !== null) publicState.value.bossHpPercentDisplay = payload.bossHpPercentDisplay
      if (payload.ketuntasanExact !== undefined && payload.ketuntasanExact !== null) {
        publicState.value.ketuntasanExact = payload.ketuntasanExact
        publicState.value.ketuntasanDisplay = Math.round(payload.ketuntasanExact)
      }
      if (payload.passedCount !== undefined && payload.passedCount !== null) publicState.value.passedCount = payload.passedCount
      if (payload.officialCount !== undefined && payload.officialCount !== null) publicState.value.officialCount = payload.officialCount
      if (publicState.value.officialCount !== undefined && publicState.value.passedCount !== undefined) {
        publicState.value.notPassedCount = Math.max(0, publicState.value.officialCount - publicState.value.passedCount)
      }
    }
  })

  // 4. Sinkronkan public state real-time
  unsubStateArena = realtimeBossBattle.subscribe('session.state', (newState: any) => {
    if (newState && publicState.value) {
      publicState.value = newState
    }
  })

  // 5. Fast Network Polling (Untuk HP siswa lintas jaringan Wi-Fi sekolah ke Proyektor Guru)
  const seenVisualEventIds = new Set<string>()
  lastNetworkPollTimestamp = Date.now() - 5000
  networkPollInterval = setInterval(async () => {
    try {
      const sId = joinCode.value || 'active'
      const res = await api.get(`/ulangan-gamifikasi/sessions/${sId}/poll?since=${lastNetworkPollTimestamp}`)
      const data = res.data?.data
      if (data) {
        if (Array.isArray(data.events) && data.events.length > 0) {
          for (const evt of data.events) {
            const evtId = evt.id || `${evt.participant_id}-${evt.timestamp}`
            if (!seenVisualEventIds.has(evtId)) {
              seenVisualEventIds.add(evtId)
              triggerVisualAttack(
                evt.participant_id,
                evt.is_correct !== false,
                evt.participant_name,
                evtId,
                evt.damage,
                evt.boss_hp_exact !== undefined ? {
                  bossHpExact: evt.boss_hp_exact,
                  bossHpDisplay: evt.boss_hp_display,
                  bossHpPercentDisplay: evt.boss_hp_percent_display,
                } : undefined
              )
            }
          }
        }
        if (data.server_time) {
          lastNetworkPollTimestamp = Math.max(lastNetworkPollTimestamp, data.server_time - 1000)
        }
        if (data.session) {
          syncOnlineSessionState(data.session)
        }
      }
    } catch {
      // Silent polling
    }
  }, 300)

  timerInterval = setInterval(() => {
    tick(1)
  }, 1000)

  window.addEventListener('keydown', handleGlobalKeyDown)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  if (hitTimeout) clearTimeout(hitTimeout)
  if (networkPollInterval) clearInterval(networkPollInterval)
  window.removeEventListener('keydown', handleGlobalKeyDown)
  unsubVisualArena?.()
  unsubAnswerArena?.()
  unsubHpArena?.()
  unsubStateArena?.()
})

const state = publicState
const students = computed(() => progressList())
const kkm = computed(() => draft.settings.kkm || 75)
const reduced = computed(() => draft.settings.reducedMotion || !draft.settings.animationEnabled)
const showNames = computed(() => draft.settings.showStudentNamesOnProjector !== false)
const remedialOn = computed(() => draft.settings.remedialAvailable !== false)
const joinCode = computed(() => getActiveSession()?.sessionId || String(route.params.id || ''))
const projectorStudents = computed(() => students.value)

// Computed: CSS class arena 3D berdasarkan boss ID
const arenaThemeClass = computed(() => {
  const bossId = state.value?.boss?.id || draft.bossId
  switch (bossId) {
    case 'robot-glitch': return 'arena-robot-glitch'
    case 'rakus-maximus': return 'arena-rakus-maximus'
    case 'virus-lambda': return 'arena-virus-lambda'
    case 'bugzilla':
    case 'bugzilla-compiler': return 'arena-bugzilla'
    default: return 'dungeon-bg'
  }
})

// Mode Proyektor & Dual Display
const isProjectorMode = ref(route.query.view === 'projector' || route.query.mode === 'projector')
const isSessionOngoing = computed(() => {
  return state.value?.outcome === 'ongoing' && state.value?.status !== 'completed'
})

function toggleProjectorMode() {
  isProjectorMode.value = !isProjectorMode.value
}

function openSeparateProjector() {
  const currentPath = window.location.pathname
  const targetUrl = `${window.location.origin}${currentPath}?view=projector`
  window.open(targetUrl, '_blank', 'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no')
}

function handleGlobalKeyDown(e: KeyboardEvent) {
  if (e.key === 'p' || e.key === 'P') {
    const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
    if (tag !== 'input' && tag !== 'textarea') {
      toggleProjectorMode()
    }
  }
}

// Student Search, Filter & Accurate Dynamic Counts
const studentSearch = ref('')
const studentFilterTab = ref<'all' | 'tuntas' | 'belum'>('all')

const passedCountComputed = computed(() => {
  return students.value.filter((s) => s.reachedKkm).length
})

const notPassedCount = computed(() => {
  const official = state.value?.officialCount ?? projectorStudents.value.length ?? 0
  const passed = state.value?.passedCount ?? passedCountComputed.value
  return Math.max(0, official - passed)
})

const filteredStudents = computed(() => {
  let list = [...students.value]
  if (studentSearch.value.trim()) {
    const q = studentSearch.value.toLowerCase().trim()
    list = list.filter((s) => s.name?.toLowerCase().includes(q))
  }
  if (studentFilterTab.value === 'tuntas') {
    list = list.filter((s) => s.reachedKkm)
  } else if (studentFilterTab.value === 'belum') {
    list = list.filter((s) => !s.reachedKkm)
  }
  return list
})

const hpWidth = computed(() => {
  const pct = state.value?.bossHpPercentDisplay
  if (pct !== undefined && pct !== null && !isNaN(Number(pct))) {
    return `${Math.max(0, Math.min(100, Math.round(Number(pct))))}%`
  }
  return '100%'
})

const clock = computed(() => {
  const s = state.value?.remainingSeconds ?? 0
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
})

const currentQuestionDisplay = computed(() => {
  return Math.min((state.value?.currentQuestionIndex || 0) + 1, state.value?.questionCount || 10)
})

const statusLabel = computed(() => {
  if (state.value?.outcome === 'class_victory') return 'Kelas Menang!'
  if (state.value?.outcome === 'boss_victory') return 'Boss Menang'
  if (state.value?.learningMode) return 'Mode Belajar'
  return 'Battle Berlangsung'
})

const statusColorClass = computed(() => {
  if (state.value?.outcome === 'class_victory') return 'text-emerald-400'
  if (state.value?.outcome === 'boss_victory') return 'text-rose-400'
  return 'text-amber-300'
})

const visualPose = computed(() => {
  if (state.value?.outcome === 'class_victory') {
    return showHit.value ? 'defeat_last_hit' : 'defeated'
  }
  if (state.value?.outcome === 'boss_victory') {
    return 'laugh'
  }
  return showHit.value ? 'hit' : 'idle'
})

const boss3DState = computed<BossStateData | null>(() => {
  const ps = publicState.value as any
  if (!ps) return null
  const b = ps.boss || {}
  return {
    bossHpExact: ps.bossHpExact ?? 10000,
    bossHpDisplay: ps.bossHpDisplay ?? 10000,
    initialBossHp: ps.initialBossHp || 10000,
    bossHpPercentDisplay: ps.bossHpPercentDisplay ?? 100,
    outcome: ps.outcome || 'ongoing',
    status: ps.status || 'active',
    passedCount: ps.passedCount || 0,
    officialCount: ps.officialCount || projectorStudents.value.length || 0,
    ketuntasanDisplay: ps.ketuntasanDisplay || 0,
    questionCount: ps.questionCount || 10,
    currentQuestion: currentQuestionDisplay.value,
    kkm: kkm.value,
    pose: visualPose.value as any,
    boss: {
      id: b.id || draft.bossId || 'robot-glitch',
      name: b.name || draft.bossName || 'Robot Glitch',
      difficulty: b.difficulty || 'sedang',
      color: b.color || '#0ea5e9',
      accent: b.accent || '#67e8f9',
      customImageUrl: b.customImageUrl || draft.customImageUrl || null,
    },
  }
})

// Class Rating Badge calculation
const classRatingLetter = computed(() => {
  const ketuntasan = state.value?.ketuntasanDisplay ?? 0
  if (ketuntasan === 100) return 'S'
  if (ketuntasan >= 85) return 'A'
  if (ketuntasan >= 75) return 'B'
  return 'C'
})

const classRatingClass = computed(() => {
  const letter = classRatingLetter.value
  if (letter === 'S') return 'badge-gold-s'
  if (letter === 'A') return 'badge-silver-a'
  if (letter === 'B') return 'badge-bronze-b'
  return 'badge-stone-c'
})

const classRatingTitle = computed(() => {
  const letter = classRatingLetter.value
  if (letter === 'S') return 'Sempurna — Semua Siswa Tuntas'
  if (letter === 'A') return 'Sangat Baik'
  if (letter === 'B') return 'Cukup Baik'
  return 'Perlu Remedial'
})

// React to visual attack queue
watch(
  visualQueue,
  (q) => {
    const last = q[q.length - 1]
    if (!last) return
    triggerVisualAttack(last.participantId, last.correct !== false, last.name, last.eventId, last.damage)
  },
  { deep: true },
)

const recentAttackKeys = new Set<string>()

function triggerVisualAttack(
  participantId: string,
  isCorrect = true,
  participantName?: string,
  eventId?: string,
  damage?: number,
  hpPayload?: { bossHpExact?: number; bossHpDisplay?: number; bossHpPercentDisplay?: number }
) {
  const attackKey = eventId || `${participantId}:${isCorrect}:${Math.floor(Date.now() / 500)}`
  if (recentAttackKeys.has(attackKey)) return
  recentAttackKeys.add(attackKey)
  setTimeout(() => recentAttackKeys.delete(attackKey), 700)

  // Hitung perkiraan damage per hit untuk tampilan dan pengurangan HP langsung
  const initialHp = publicState.value?.initialBossHp || 10000
  const offCount = Math.max(1, publicState.value?.officialCount || projectorStudents.value.length || 1)
  const qCount = Math.max(1, publicState.value?.questionCount || 10)
  const kkmVal = Math.max(1, publicState.value?.kkm || 75)
  const targetHits = Math.max(1, Math.round(offCount * qCount * (kkmVal / 100)))
  const effectiveDamage = damage || Math.round(initialHp / targetHits)

  // Real-time Boss HP decrement:
  if (isCorrect && publicState.value) {
    if (hpPayload && hpPayload.bossHpExact !== undefined) {
      publicState.value.bossHpExact = hpPayload.bossHpExact
      publicState.value.bossHpDisplay = hpPayload.bossHpDisplay ?? Math.round(hpPayload.bossHpExact)
      publicState.value.bossHpPercentDisplay = hpPayload.bossHpPercentDisplay ?? Math.max(0, Math.min(100, Math.round((hpPayload.bossHpExact / initialHp) * 100)))
    } else {
      const nextHp = Math.max(0, publicState.value.bossHpExact - effectiveDamage)
      publicState.value.bossHpExact = nextHp
      publicState.value.bossHpDisplay = Math.round(nextHp)
      publicState.value.bossHpPercentDisplay = Math.max(0, Math.min(100, Math.round((nextHp / initialHp) * 100)))
    }
    if (publicState.value.bossHpExact <= 0 && publicState.value.outcome === 'ongoing') {
      publicState.value.outcome = 'class_victory'
      publicState.value.bossPose = 'defeat_last_hit'
    }
  }

  const std =
    projectorStudents.value.find(
      (s) =>
        s.participantId === participantId ||
        s.studentId === participantId ||
        String(s.participantId) === String(participantId) ||
        (participantName && s.name?.toLowerCase() === participantName.toLowerCase()),
    ) || projectorStudents.value[0]

  const studentName = participantName || std?.name || 'Siswa'
  const activePId = std?.participantId || participantId

  if (isCorrect) {
    attackingStudentId.value = activePId
    showHit.value = true
  } else {
    hitStudentId.value = activePId
  }

  recentNotification.value = {
    type: isCorrect ? 'correct' : 'wrong',
    name: studentName,
    gender: std?.gender,
  }
  if (notifTimeout) clearTimeout(notifTimeout)
  notifTimeout = setTimeout(() => {
    recentNotification.value = null
  }, 3500)

  let xPercent = 50
  let yPercent = 96

  // Ambil elemen DOM kartu siswa penyerang dan kontainer arena aktif (baik 3D maupun 2D)
  const cardEl =
    studentCardRefs.get(activePId) ||
    (document.querySelector(`[data-participant-id="${activePId}"]`) as HTMLElement | null)
  const activeArenaEl =
    (boss3DArenaRef.value?.$el as HTMLElement | null) ||
    arenaStageRef.value ||
    (document.querySelector('.boss-3d-arena-container') as HTMLElement | null)

  if (cardEl && activeArenaEl) {
    const cardRect = cardEl.getBoundingClientRect()
    const arenaRect = activeArenaEl.getBoundingClientRect()
    if (arenaRect.width > 0) {
      const cardCenterX = cardRect.left + cardRect.width / 2
      xPercent = Math.max(2, Math.min(98, ((cardCenterX - arenaRect.left) / arenaRect.width) * 100))
      if (arenaRect.height > 0) {
        // Hitung koordinat Y persis di atas avatar siswa
        yPercent = ((cardRect.top + 6 - arenaRect.top) / arenaRect.height) * 100
      }
    }
  } else {
    // Fallback: Distribusi simetris proporsional sesuai urutan siswa di roster
    const studentIndex = projectorStudents.value.findIndex(
      (s) => s.participantId === activePId || (participantName && s.name?.toLowerCase() === participantName.toLowerCase()),
    )
    const total = projectorStudents.value.length || 1
    if (total <= 1) {
      xPercent = 50
    } else if (studentIndex >= 0) {
      xPercent = Math.max(5, Math.min(95, ((studentIndex + 0.5) / total) * 100))
    }
  }

  const projId = `proj-${Date.now()}-${Math.random()}`
  const damageLabel = isCorrect ? `-${effectiveDamage.toLocaleString('id-ID')} HP` : undefined

  activeProjectiles.value = [
    ...activeProjectiles.value.slice(-3),
    {
      id: projId,
      startX: xPercent,
      startY: yPercent,
      isCorrect,
      damageText: damageLabel,
    },
  ]

  // Picu tembakan laser 3D pada boss di canvas 3D jika aktif
  if (isCorrect && boss3DArenaRef.value) {
    boss3DArenaRef.value.triggerAttack(xPercent, studentName, effectiveDamage)
  }

  // Proyektil laser & damage text visual timeout terpisah
  setTimeout(() => {
    activeProjectiles.value = activeProjectiles.value.filter((p) => p.id !== projId)
  }, 950)

  // Status hit boss & pose kartu
  if (hitTimeout) clearTimeout(hitTimeout)
  hitTimeout = setTimeout(() => {
    showHit.value = false
    attackingStudentId.value = null
    hitStudentId.value = null
  }, 750)
}

function formatHp(n?: number) {
  return (n ?? 0).toLocaleString('id-ID')
}

// Teacher Simulation Controls
function simStudentAnswerCorrect() {
  const session = getActiveSession()
  if (!session) return

  // Pick a student who has not reached KKM yet, or first student
  const belowKkm = [...session.progress.values()].find((p) => !p.reachedKkm)
  const p = belowKkm || [...session.progress.values()][0]
  if (!p) return

  const currentQ = session.questions[Math.min(p.answeredCount, session.questions.length - 1)]
  const res = answerAsStudent(p.participantId, currentQ.id, currentQ.correctIndex, `sim-${Date.now()}-${p.participantId}`)
  triggerVisualAttack(p.participantId, true, p.name, `sim-evt-${Date.now()}`, res?.visualAttack?.damage)
}

function simStudentAnswerWrong() {
  const session = getActiveSession()
  if (!session) return
  const p = [...session.progress.values()][0]
  if (!p) return
  const currentQ = session.questions[Math.min(p.answeredCount, session.questions.length - 1)]
  const wrongIndex = (currentQ.correctIndex + 1) % currentQ.options.length
  answerAsStudent(p.participantId, currentQ.id, wrongIndex, `sim-wrong-${Date.now()}`)
  triggerVisualAttack(p.participantId, false)
}

function simHitAfterDefeated() {
  const session = getActiveSession()
  if (!session) return
  const p = [...session.progress.values()][0]
  if (!p) return
  const currentQ = session.questions[0]
  answerAsStudent(p.participantId, currentQ.id, currentQ.correctIndex, `hit-defeat-${Date.now()}`)
}

function forceTimeout() {
  finishByTimeout()
}

async function confirmStopSession() {
  if (confirm('Apakah Anda yakin ingin menghentikan sesi game yang sedang berlangsung? Skor akhir dan hasil ulangan kelas akan difinalisasi ke rapor.')) {
    stopActiveSession('Dihentikan oleh guru')
    if (joinCode.value) {
      await api.post(`/ulangan-gamifikasi/sessions/${joinCode.value}/stop`, {}).catch(() => {})
    }
    clearActiveSession()
    router.push('/games')
  }
}

function confirmCloseAndExit() {
  if (confirm('Tutup sesi game ini dan kembali ke ringkasan Edu-Games?')) {
    clearActiveSession()
    router.push('/games')
  }
}

function handleTeacherExit() {
  if (isSessionOngoing.value) {
    if (confirm('Sesi game masih berlangsung. Ingin menghentikan sesi dan kembali ke ringkasan Edu-Games? (Klik "Cancel" jika ingin tetap berada di arena game)')) {
      stopActiveSession('Dihentikan oleh guru')
      if (joinCode.value) {
        api.post(`/ulangan-gamifikasi/sessions/${joinCode.value}/stop`, {}).catch(() => {})
      }
      clearActiveSession()
      router.push('/games')
    }
  } else {
    clearActiveSession()
    router.push('/games')
  }
}

async function toggleStudentAbsent(participantId: string) {
  try {
    const sId = joinCode.value || 'active'
    const res = await api.post(`/ulangan-gamifikasi/sessions/${sId}/participants/${participantId}/toggle-absent`)
    if (res.data?.data) {
      syncOnlineSessionState(res.data.data)
    }
  } catch (err) {
    console.error('Failed to toggle student absent:', err)
  }
}

function enableLearning() {
  turnOnLearningMode()
}
</script>

<style scoped>
.arena-root {
  background: #070417;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

.dungeon-bg {
  background:
    radial-gradient(ellipse at 50% 30%, rgba(124, 58, 237, 0.45), transparent 55%),
    radial-gradient(ellipse at 50% 85%, rgba(220, 38, 38, 0.25), transparent 50%),
    radial-gradient(circle at 10% 70%, rgba(249, 115, 22, 0.2), transparent 45%),
    radial-gradient(circle at 90% 70%, rgba(249, 115, 22, 0.2), transparent 45%),
    linear-gradient(180deg, #110729 0%, #0d061c 45%, #05020f 82%, #140824 100%);
  box-shadow: inset 0 0 120px rgba(0, 0, 0, 0.9);
  position: relative;
}

.dungeon-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: linear-gradient(180deg, rgba(5, 2, 18, 0.8) 0%, transparent 100%);
  pointer-events: none;
  z-index: 5;
}

.damage-popup-text {
  animation: damageFloat 0.7s ease-out forwards;
}

@keyframes damageFloat {
  0% { transform: translateY(0) scale(0.6); opacity: 0; }
  30% { transform: translateY(-8px) scale(1.2); opacity: 1; }
  80% { transform: translateY(-16px) scale(1); opacity: 1; }
  100% { transform: translateY(-24px) scale(0.9); opacity: 0; }
}

.miss-popup-text {
  animation: missFloat 0.7s ease-out forwards;
}

@keyframes missFloat {
  0% { transform: translateY(0) scale(0.6); opacity: 0; }
  30% { transform: translateY(-6px) scale(1.15); opacity: 1; }
  80% { transform: translateY(-14px) scale(1); opacity: 1; }
  100% { transform: translateY(-22px) scale(0.85); opacity: 0; }
}

.hud-card {
  background: rgba(15, 23, 42, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45);
}

/* Student Cards in Roster */
.student-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 10px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.12);
  min-width: 68px;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.student-card.is-tuntas {
  border-color: rgba(52, 211, 153, 0.8);
  box-shadow: 0 0 14px rgba(52, 211, 153, 0.35);
  background: rgba(6, 78, 59, 0.35);
}

.student-card.is-below-kkm {
  border-color: rgba(244, 63, 94, 0.4);
}

.student-card.is-attacking {
  transform: translateY(-12px) scale(1.14);
  box-shadow: 0 0 20px #facc15;
}

.student-card.celebrate-bounce {
  animation: studentBounce 1.6s ease-in-out infinite alternate;
}

.score-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 9999px;
  font-family: monospace;
}
.badge-tuntas {
  background: #059669;
  color: #ecfdf5;
}
.badge-below {
  background: #991b1b;
  color: #ffe4e6;
}

/* Action Buttons in Dashboard */
.btn-action {
  width: 100%;
  padding: 7px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Real Laser Cannon Beam Animation */
.laser-shot-group {
  animation: laserPulseFade 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.laser-beam-outer {
  stroke-dasharray: 900;
  stroke-dashoffset: 900;
  animation: laserTravel 0.24s ease-out forwards;
}

.laser-beam-main {
  stroke-dasharray: 900;
  stroke-dashoffset: 900;
  animation: laserTravel 0.24s ease-out forwards;
}

.laser-beam-core {
  stroke-dasharray: 900;
  stroke-dashoffset: 900;
  animation: laserTravel 0.24s ease-out forwards;
}

@keyframes laserTravel {
  0% {
    stroke-dashoffset: 900;
    opacity: 0.3;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

@keyframes laserPulseFade {
  0% {
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  65% {
    opacity: 1;
    filter: drop-shadow(0 0 20px #22d3ee);
  }
  100% {
    opacity: 0;
  }
}

.laser-muzzle-flash {
  transform-origin: center;
  animation: muzzleBlast 0.35s ease-out forwards;
}
.laser-muzzle-white {
  transform-origin: center;
  animation: muzzleBlast 0.25s ease-out forwards;
}

@keyframes muzzleBlast {
  0% { transform: scale(0.3); opacity: 1; }
  50% { transform: scale(1.6); opacity: 1; }
  100% { transform: scale(0.4); opacity: 0; }
}

.laser-impact-flash {
  transform-origin: center;
  animation: impactBlast 0.45s 0.12s ease-out forwards;
  opacity: 0;
}
.laser-impact-white {
  transform-origin: center;
  animation: impactBlast 0.35s 0.12s ease-out forwards;
  opacity: 0;
}

@keyframes impactBlast {
  0% { transform: scale(0.2); opacity: 1; }
  45% { transform: scale(1.8); opacity: 1; }
  100% { transform: scale(2.6); opacity: 0; }
}

/* Boss Hit Shockwave */
.boss-hit-shockwave {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 4px solid rgba(250, 204, 21, 0.85);
  animation: shockwaveExpand 0.45s ease-out forwards;
  pointer-events: none;
  z-index: 18;
}

@keyframes shockwaveExpand {
  0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
}

/* Banners */
.victory-ribbon {
  background: linear-gradient(90deg, #b45309, #f59e0b, #b45309);
  color: #1e1035;
  font-weight: 900;
  font-size: 20px;
  padding: 8px 24px;
  border-radius: 9999px;
  box-shadow: 0 0 35px rgba(245, 158, 11, 0.8);
  animation: pulseGold 1.5s ease-in-out infinite alternate;
}

.defeat-ribbon {
  background: linear-gradient(90deg, #881337, #e11d48, #881337);
  color: #ffffff;
  font-weight: 900;
  font-size: 18px;
  padding: 8px 22px;
  border-radius: 9999px;
  box-shadow: 0 0 35px rgba(225, 29, 72, 0.7);
}

@keyframes pulseGold {
  from { transform: scale(0.98); }
  to { transform: scale(1.02); }
}

@keyframes studentBounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-8px); }
}

/* MVP Podium Cards */
.mvp-podium-card {
  border-radius: 18px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: transform 0.2s;
}
.mvp-rank-1 {
  background: linear-gradient(160deg, rgba(234, 179, 8, 0.25), rgba(15, 23, 42, 0.85));
  border: 2px solid #eab308;
  box-shadow: 0 0 25px rgba(234, 179, 8, 0.4);
  transform: translateY(-6px);
}
.mvp-rank-2 {
  background: linear-gradient(160deg, rgba(203, 213, 225, 0.2), rgba(15, 23, 42, 0.85));
  border: 1.5px solid #cbd5e1;
}
.mvp-rank-3 {
  background: linear-gradient(160deg, rgba(217, 119, 6, 0.2), rgba(15, 23, 42, 0.85));
  border: 1.5px solid #d97706;
}
.mvp-medal {
  font-size: 26px;
  position: absolute;
  top: -12px;
}

/* Rating Badge Medallion */
.rating-badge {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}
.badge-gold-s {
  background: radial-gradient(circle, #fde047 0%, #ca8a04 100%);
  color: #422006;
  border: 3px solid #fef08a;
  box-shadow: 0 0 25px rgba(234, 179, 8, 0.7);
}
.badge-silver-a {
  background: radial-gradient(circle, #f1f5f9 0%, #64748b 100%);
  color: #0f172a;
  border: 3px solid #ffffff;
}
.badge-bronze-b {
  background: radial-gradient(circle, #fdba74 0%, #c2410c 100%);
  color: #431407;
  border: 3px solid #fed7aa;
}
.badge-stone-c {
  background: radial-gradient(circle, #94a3b8 0%, #334155 100%);
  color: #ffffff;
  border: 3px solid #cbd5e1;
}

/* Custom Scrollbar for Individual Student Grades */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(245, 158, 11, 0.5);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(245, 158, 11, 0.8);
}

/* =============================================
   LASER MISS ANIMATION (Jawaban Salah)
   ============================================= */
.laser-miss-beam {
  stroke-dasharray: 900;
  stroke-dashoffset: 900;
  animation: laserMiss 0.35s ease-out forwards;
}

@keyframes laserMiss {
  0% { stroke-dashoffset: 900; opacity: 0.8; }
  60% { stroke-dashoffset: 0; opacity: 0.8; }
  100% { stroke-dashoffset: 0; opacity: 0; }
}

/* =============================================
   3D ARENA ENVIRONMENT LAYER
   ============================================= */
.arena-env-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

/* =============================================
   ARENA THEME: ROBOT GLITCH (Cyber / Neon Blue)
   ============================================= */
.arena-robot-glitch {
  background:
    radial-gradient(ellipse at 50% 20%, rgba(6, 182, 212, 0.45), transparent 55%),
    radial-gradient(ellipse at 20% 80%, rgba(14, 165, 233, 0.3), transparent 50%),
    radial-gradient(circle at 80% 75%, rgba(99, 102, 241, 0.25), transparent 45%),
    linear-gradient(180deg, #020c18 0%, #040f1f 40%, #010810 80%, #030d1a 100%);
  box-shadow: inset 0 0 120px rgba(0, 0, 0, 0.9), inset 0 0 60px rgba(6, 182, 212, 0.08);
  position: relative;
}

.arena-robot-glitch::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(6, 182, 212, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(6, 182, 212, 0.07) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 1;
}

.arena-robot-glitch::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 50px;
  background: linear-gradient(180deg, rgba(2, 12, 24, 0.8) 0%, transparent 100%);
  pointer-events: none;
  z-index: 5;
}

/* Neon grid floor */
.arena-robot-glitch .arena-floor {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 160px;
  background:
    linear-gradient(rgba(6, 182, 212, 0.18) 1px, transparent 1px),
    linear-gradient(90deg, rgba(6, 182, 212, 0.18) 1px, transparent 1px);
  background-size: 40px 40px;
  transform: perspective(400px) rotateX(50deg);
  transform-origin: bottom center;
  opacity: 0.7;
  z-index: 1;
}

/* Electric / matrix particles */
.arena-robot-glitch .arena-particle {
  position: absolute;
  width: 2px;
  background: linear-gradient(180deg, #22d3ee, transparent);
  border-radius: 2px;
  animation: matrixRain calc(1.5s + var(--i, 1) * 0.3s) linear infinite;
  left: calc(var(--i, 1) * 8.3% - 4%);
  height: calc(20px + var(--i, 1) * 8px);
  top: -40px;
  opacity: 0.7;
}

@keyframes matrixRain {
  0% { top: -60px; opacity: 0.9; }
  80% { opacity: 0.7; }
  100% { top: 105%; opacity: 0; }
}

/* Atmospheric glow */
.arena-robot-glitch .arena-atmosphere {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 60%, rgba(6, 182, 212, 0.06), transparent 65%);
  animation: atmoPulse 4s ease-in-out infinite alternate;
  z-index: 1;
}

/* =============================================
   ARENA THEME: RAKUS MAXIMUS (Lava / Inferno)
   ============================================= */
.arena-rakus-maximus {
  background:
    radial-gradient(ellipse at 50% 30%, rgba(239, 68, 68, 0.55), transparent 55%),
    radial-gradient(ellipse at 20% 85%, rgba(249, 115, 22, 0.4), transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(220, 38, 38, 0.35), transparent 45%),
    linear-gradient(180deg, #1a0404 0%, #200506 40%, #120304 80%, #1c0505 100%);
  box-shadow: inset 0 0 120px rgba(0, 0, 0, 0.85), inset 0 0 80px rgba(239, 68, 68, 0.1);
  position: relative;
}

.arena-rakus-maximus::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 50px;
  background: linear-gradient(180deg, rgba(26, 4, 4, 0.8) 0%, transparent 100%);
  pointer-events: none;
  z-index: 5;
}

/* Lava floor */
.arena-rakus-maximus .arena-floor {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 150px;
  background: linear-gradient(180deg, transparent 0%, rgba(239, 68, 68, 0.25) 60%, rgba(249, 115, 22, 0.5) 100%);
  transform: perspective(400px) rotateX(50deg);
  transform-origin: bottom center;
  animation: lavaGlow 3s ease-in-out infinite alternate;
  z-index: 1;
}

@keyframes lavaGlow {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}

/* Ember / magma particles */
.arena-rakus-maximus .arena-particle {
  position: absolute;
  width: calc(3px + var(--i, 1) * 1px);
  height: calc(3px + var(--i, 1) * 1px);
  border-radius: 50%;
  background: radial-gradient(circle, #fbbf24, #ef4444);
  animation: emberRise calc(2s + var(--i, 1) * 0.4s) ease-out infinite;
  left: calc(var(--i, 1) * 8.3% - 2%);
  bottom: 20px;
  opacity: 0.9;
  box-shadow: 0 0 6px #f97316;
}

@keyframes emberRise {
  0% { bottom: 20px; opacity: 0.9; transform: translateX(0) scale(1); }
  50% { opacity: 0.7; transform: translateX(calc(var(--i, 1) * 4px - 24px)) scale(0.8); }
  100% { bottom: 90%; opacity: 0; transform: translateX(calc(var(--i, 1) * 8px - 48px)) scale(0.4); }
}

/* Atmospheric lava glow */
.arena-rakus-maximus .arena-atmosphere {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 40%;
  background: linear-gradient(0deg, rgba(239, 68, 68, 0.12), transparent);
  animation: atmoPulse 3s ease-in-out infinite alternate;
  z-index: 1;
}

/* =============================================
   ARENA THEME: VIRUS LAMBDA (Toxic / Biohazard)
   ============================================= */
.arena-virus-lambda {
  background:
    radial-gradient(ellipse at 50% 25%, rgba(16, 185, 129, 0.4), transparent 55%),
    radial-gradient(ellipse at 15% 75%, rgba(5, 150, 105, 0.3), transparent 50%),
    radial-gradient(circle at 85% 75%, rgba(4, 120, 87, 0.25), transparent 45%),
    linear-gradient(180deg, #010f08 0%, #021209 40%, #010b06 80%, #011009 100%);
  box-shadow: inset 0 0 120px rgba(0, 0, 0, 0.9), inset 0 0 70px rgba(16, 185, 129, 0.08);
  position: relative;
}

.arena-virus-lambda::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 50px;
  background: linear-gradient(180deg, rgba(1, 15, 8, 0.8) 0%, transparent 100%);
  pointer-events: none;
  z-index: 5;
}

/* Toxic floor */
.arena-virus-lambda .arena-floor {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 150px;
  background: linear-gradient(180deg, transparent 0%, rgba(16, 185, 129, 0.2) 60%, rgba(5, 150, 105, 0.4) 100%);
  transform: perspective(400px) rotateX(50deg);
  transform-origin: bottom center;
  animation: toxicGlow 4s ease-in-out infinite alternate;
  z-index: 1;
}

@keyframes toxicGlow {
  0% { opacity: 0.5; }
  100% { opacity: 0.9; }
}

/* Bubble / toxic particles */
.arena-virus-lambda .arena-particle {
  position: absolute;
  width: calc(4px + var(--i, 1) * 2px);
  height: calc(4px + var(--i, 1) * 2px);
  border-radius: 50%;
  border: 1px solid rgba(16, 185, 129, 0.8);
  background: rgba(16, 185, 129, 0.15);
  animation: bubbleRise calc(3s + var(--i, 1) * 0.5s) ease-in-out infinite;
  left: calc(var(--i, 1) * 8.3% - 2%);
  bottom: 10px;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

@keyframes bubbleRise {
  0% { bottom: 10px; opacity: 0.8; transform: scale(0.7) translateX(0); }
  50% { opacity: 0.6; transform: scale(1) translateX(calc(var(--i, 1) * 3px - 18px)); }
  100% { bottom: 85%; opacity: 0; transform: scale(1.3) translateX(calc(var(--i, 1) * 6px - 36px)); }
}

/* Toxic fog atmosphere */
.arena-virus-lambda .arena-atmosphere {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 35%;
  background: linear-gradient(0deg, rgba(16, 185, 129, 0.1), transparent);
  animation: atmoPulse 5s ease-in-out infinite alternate;
  z-index: 1;
}

/* =============================================
   ARENA THEME: BUGZILLA COMPILER (Amber / Digital)
   ============================================= */
.arena-bugzilla {
  background:
    radial-gradient(ellipse at 50% 30%, rgba(245, 158, 11, 0.4), transparent 55%),
    radial-gradient(ellipse at 20% 80%, rgba(217, 119, 6, 0.3), transparent 50%),
    radial-gradient(circle at 82% 72%, rgba(180, 83, 9, 0.25), transparent 45%),
    linear-gradient(180deg, #100900 0%, #150b00 40%, #0d0700 80%, #130900 100%);
  box-shadow: inset 0 0 120px rgba(0, 0, 0, 0.9), inset 0 0 60px rgba(245, 158, 11, 0.07);
  position: relative;
}

.arena-bugzilla::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 50px;
  background: linear-gradient(180deg, rgba(16, 9, 0, 0.8) 0%, transparent 100%);
  pointer-events: none;
  z-index: 5;
}

/* Amber circuit board floor */
.arena-bugzilla .arena-floor {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 150px;
  background:
    linear-gradient(rgba(245, 158, 11, 0.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(245, 158, 11, 0.12) 1px, transparent 1px),
    linear-gradient(180deg, transparent 0%, rgba(245, 158, 11, 0.2) 100%);
  background-size: 30px 30px, 30px 30px, 100% 100%;
  transform: perspective(400px) rotateX(50deg);
  transform-origin: bottom center;
  opacity: 0.75;
  z-index: 1;
}

/* Bug / spark particles */
.arena-bugzilla .arena-particle {
  position: absolute;
  width: calc(2px + var(--i, 1) * 1px);
  height: calc(8px + var(--i, 1) * 3px);
  background: linear-gradient(180deg, #fbbf24, rgba(245, 158, 11, 0.3));
  border-radius: 2px;
  animation: sparkFly calc(1.8s + var(--i, 1) * 0.35s) ease-in-out infinite;
  left: calc(var(--i, 1) * 8.3% - 2%);
  bottom: 30px;
  opacity: 0.8;
  box-shadow: 0 0 5px #f59e0b;
}

@keyframes sparkFly {
  0% { bottom: 30px; opacity: 0.8; transform: rotate(0deg) translateX(0); }
  30% { transform: rotate(20deg) translateX(8px); opacity: 1; }
  70% { transform: rotate(-15deg) translateX(-5px); opacity: 0.5; }
  100% { bottom: 80%; opacity: 0; transform: rotate(45deg) translateX(12px); }
}

/* Amber glow atmosphere */
.arena-bugzilla .arena-atmosphere {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 70%, rgba(245, 158, 11, 0.07), transparent 65%);
  animation: atmoPulse 4s ease-in-out infinite alternate;
  z-index: 1;
}

@keyframes atmoPulse {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}</style>
