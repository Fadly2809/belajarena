<template>
  <!-- =========================================================================
       HERO PRODUCT PAGE FULLSCREEN VIEW (Default View - 100dvh Desktop / Projector)
       ========================================================================= -->
  <div
    v-if="currentView === 'hero'"
    class="hero-container min-h-[100dvh] lg:h-[100dvh] w-full overflow-y-auto lg:overflow-hidden flex flex-col justify-between relative select-none text-white font-sans transition-colors duration-700 ease-out"
    :style="{ background: currentGame.gradient }"
    :class="{ 'mode-ringan': reducedMotion }"
  >
    <!-- Background Splatter Dots (CSS/SVG Light Effect, Hidden on Mode Ringan) -->
    <div v-if="!reducedMotion" class="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <svg class="w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15%" cy="25%" r="3" fill="#ffffff" class="splatter-dot" />
        <circle cx="22%" cy="18%" r="2" fill="#ffffff" class="splatter-dot" />
        <circle cx="32%" cy="28%" r="4" fill="#ffffff" class="splatter-dot" />
        <circle cx="48%" cy="14%" r="2.5" fill="#ffffff" class="splatter-dot" />
        <circle cx="68%" cy="22%" r="3.5" fill="#ffffff" class="splatter-dot" />
        <circle cx="78%" cy="16%" r="2" fill="#ffffff" class="splatter-dot" />
        <circle cx="85%" cy="32%" r="4" fill="#ffffff" class="splatter-dot" />
        <circle cx="12%" cy="65%" r="3" fill="#ffffff" class="splatter-dot" />
        <circle cx="20%" cy="75%" r="2.5" fill="#ffffff" class="splatter-dot" />
        <circle cx="30%" cy="85%" r="4" fill="#ffffff" class="splatter-dot" />
        <circle cx="70%" cy="78%" r="3" fill="#ffffff" class="splatter-dot" />
        <circle cx="82%" cy="72%" r="4.5" fill="#ffffff" class="splatter-dot" />
        <circle cx="88%" cy="86%" r="2" fill="#ffffff" class="splatter-dot" />
        <circle cx="50%" cy="88%" r="3" fill="#ffffff" class="splatter-dot" />
      </svg>
    </div>

    <!-- Active Session Warning Bar (Floating Pill if any game session is live) -->
    <div
      v-if="activeSessions.length > 0"
      class="relative z-40 bg-black/60 backdrop-blur-md border-b border-amber-400/40 px-4 py-2 text-xs flex items-center justify-between gap-3 text-amber-200"
    >
      <div class="flex items-center gap-2 truncate">
        <span class="animate-pulse text-amber-400 text-sm">⚡</span>
        <span class="font-extrabold truncate">Sesi Aktif Berlangsung: {{ activeSessions[0].title }} (PIN: {{ activeSessions[0].pin }})</span>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <button
          @click="stopActiveSessionFromList(activeSessions[0])"
          class="px-2.5 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-[10px] transition cursor-pointer"
        >
          Stop Sesi
        </button>
        <router-link
          :to="getActiveSessionUrl(activeSessions[0])"
          class="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] transition cursor-pointer"
        >
          Masuk Layar Kontrol Host →
        </router-link>
      </div>
    </div>

    <!-- =========================================================================
         TOP SLIM HEADER (Logo Belajarena, Center Nav, KEMBALI KE DASHBOARD WAJIB)
         ========================================================================= -->
    <header class="relative z-40 px-4 sm:px-8 lg:px-12 py-3.5 sm:py-4 flex items-center justify-between gap-4 border-b border-white/10 backdrop-blur-sm">
      <!-- Left: Logo Belajarena + Module Badge -->
      <div class="flex items-center gap-3">
        <router-link to="/dashboard" class="flex items-center gap-2.5 group cursor-pointer" title="Dashboard Utama">
          <img
            src="/logo.png"
            alt="Belajarena"
            class="h-8 sm:h-9 w-auto max-w-[170px] object-contain group-hover:scale-105 transition-transform drop-shadow"
          />
        </router-link>
        <span class="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-white/15 text-white font-extrabold text-[10px] tracking-wider uppercase border border-white/20">
          Edu-Games
        </span>
      </div>

      <!-- Center: Navigation Links to Other Teacher Sections (Visible on md+) -->
      <nav class="hidden md:flex items-center gap-1.5 bg-black/25 p-1 rounded-full border border-white/15 backdrop-blur-md shadow-sm">
        <router-link
          to="/dashboard"
          class="px-3 py-1.5 rounded-full text-xs font-semibold text-white/80 hover:text-white hover:bg-white/15 transition cursor-pointer"
        >
          Dashboard
        </router-link>
        <router-link
          to="/classes"
          class="px-3 py-1.5 rounded-full text-xs font-semibold text-white/80 hover:text-white hover:bg-white/15 transition cursor-pointer"
        >
          Kelas
        </router-link>
        <router-link
          to="/students"
          class="px-3 py-1.5 rounded-full text-xs font-semibold text-white/80 hover:text-white hover:bg-white/15 transition cursor-pointer"
        >
          Data Siswa
        </router-link>
        <router-link
          to="/question-bank"
          class="px-3 py-1.5 rounded-full text-xs font-semibold text-white/80 hover:text-white hover:bg-white/15 transition cursor-pointer"
        >
          Bank Soal
        </router-link>
        <router-link
          to="/cbt"
          class="px-3 py-1.5 rounded-full text-xs font-semibold text-white/80 hover:text-white hover:bg-white/15 transition cursor-pointer"
        >
          Ujian CBT
        </router-link>
      </nav>

      <!-- Right: Action Controls & KANAN ATAS WAJIB: Kembali ke Dashboard -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Toggle Mode Ringan / Reduced Motion -->
        <button
          @click="toggleReducedMotion"
          class="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full border border-white/20 bg-black/25 hover:bg-black/40 text-[11px] font-bold text-white/80 hover:text-white transition cursor-pointer flex items-center gap-1.5 backdrop-blur-sm"
          :title="reducedMotion ? 'Mode Ringan aktif (animasi dimatikan). Klik untuk menyalakan animasi.' : 'Mode Animasi aktif. Klik untuk Mode Ringan.'"
        >
          <span>{{ reducedMotion ? '🌱' : '✨' }}</span>
          <span class="hidden sm:inline">{{ reducedMotion ? 'Mode Ringan' : 'Animasi Halus' }}</span>
        </button>

        <!-- KANAN ATAS WAJIB: Tombol Kembali ke Dashboard (Selalu terlihat di semua tema dan ukuran layar) -->
        <router-link
          to="/dashboard"
          class="z-50 px-3.5 py-2 sm:px-4 sm:py-2 rounded-full bg-black/40 hover:bg-black/60 active:scale-95 text-white font-extrabold text-xs sm:text-sm border border-white/25 backdrop-blur-md shadow-xl transition-all flex items-center gap-2 group cursor-pointer whitespace-nowrap"
          title="Kembali ke Dashboard Guru Utama"
        >
          <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span class="font-extrabold">Kembali ke Dashboard</span>
        </router-link>
      </div>
    </header>

    <!-- =========================================================================
         CENTER HERO STAGE (3-Column Layout: Left Copy + Center Visual + Right Selector)
         ========================================================================= -->
    <main class="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-10 py-4 sm:py-6 max-w-[1440px] mx-auto w-full">
      <div class="grid grid-cols-1 lg:grid-cols-12 items-center gap-6 sm:gap-8 lg:gap-8 w-full">
        <!-- -------------------------------------------------------------
             LEFT COLUMN (±25-30% lebar): Label, Judul Sangat Besar, Deskripsi, CTA Buttons
             ------------------------------------------------------------- -->
        <div class="lg:col-span-3 xl:col-span-3 flex flex-col justify-center text-left space-y-3 sm:space-y-4 z-20 order-2 lg:order-1">
          <!-- Small Label Pill -->
          <div>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white/90 font-black text-[10px] tracking-[0.25em] uppercase border border-white/25 backdrop-blur-md shadow-xs">
              <span>🎮</span> EDU-GAMES
            </span>
          </div>

          <!-- Giant Game Name Title -->
          <div :key="`title-${currentGame.id}`" class="animate-text-title">
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.08] tracking-tight drop-shadow-md">
              {{ currentGame.name }}
            </h1>
            <p class="text-xs sm:text-sm font-extrabold text-white/80 tracking-wide mt-1">
              {{ currentGame.subtitle }}
            </p>
          </div>

          <!-- Short 2-3 Line Gameplay Description -->
          <div :key="`desc-${currentGame.id}`" class="animate-text-desc">
            <p class="text-xs sm:text-sm text-white/90 leading-relaxed max-w-md drop-shadow-xs font-medium">
              {{ currentGame.heroDesc }}
            </p>
          </div>

          <!-- Action Buttons (Main Sekarang & Cara Main) -->
          <div :key="`cta-${currentGame.id}`" class="animate-text-cta flex items-center gap-3 pt-2 sm:pt-3 flex-wrap">
            <!-- Main CTA Pill (High Contrast) -->
            <button
              @click="launchCurrentGame"
              class="px-7 sm:px-8 py-3 sm:py-3.5 rounded-full bg-white text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-2xl hover:bg-white/90 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer group"
            >
              <span>🚀</span>
              <span>Main Sekarang</span>
              <span class="group-hover:translate-x-1 transition-transform font-bold">→</span>
            </button>

            <!-- Secondary Button: Cara Main Modal -->
            <button
              @click="showHowToPlayModal = true"
              class="px-5 py-3 sm:py-3.5 rounded-full bg-black/25 hover:bg-black/40 text-white font-bold text-xs sm:text-sm border border-white/25 backdrop-blur-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>📖</span>
              <span>Cara Main</span>
            </button>
          </div>
        </div>

        <!-- -------------------------------------------------------------
             CENTER COLUMN (±50% lebar): Kata Raksasa di Belakang + Visual Utama Lebih Besar
             ------------------------------------------------------------- -->
        <div class="lg:col-span-6 xl:col-span-6 relative flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[480px] z-10 order-1 lg:order-2">
          <!-- KATA RAKSASA DI TENGAH LAYAR DI BELAKANG VISUAL UTAMA -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
            <span
              :key="`giant-${currentGame.id}`"
              class="font-black tracking-tighter uppercase text-white/[0.14] select-none leading-none animate-giant-word font-sans text-center"
              style="font-size: clamp(5.5rem, 19vw, 19rem);"
            >
              {{ currentGame.giantWord }}
            </span>
          </div>

          <!-- VISUAL UTAMA GAME LEBIH BESAR UNTUK HIGHLIGHT MAKSIMAL (Z-INDEX DI ATAS KATA RAKSASA) -->
          <div :key="`visual-${currentGame.id}`" class="relative z-10 flex items-center justify-center animate-visual-enter transform scale-110 sm:scale-120 lg:scale-130 xl:scale-135 transition-transform duration-500">
            <!-- 1. Final Boss Battle: Boss utama Robot Glitch dari BossSprite.vue aset existing -->
            <div v-if="currentGame.id === 'boss_battle'" class="relative flex items-center justify-center">
              <BossSprite
                boss-id="robot-glitch"
                name="Robot Glitch"
                pose="idle"
                :reduced-motion="reducedMotion"
                class="w-72 h-72 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] lg:w-[460px] lg:h-[460px] filter drop-shadow-[0_30px_60px_rgba(0,0,0,0.7)]"
              />
            </div>

            <!-- 2. Fast Quiz: Hero Visual Petir & Kartu Soal -->
            <FastQuizHeroVisual
              v-else-if="currentGame.id === 'fast_quiz'"
              :reduced-motion="reducedMotion"
            />

            <!-- 3. Memory Match: Hero Visual Pasangan Kartu Memori -->
            <MemoryMatchHeroVisual
              v-else-if="currentGame.id === 'memory_match'"
              :reduced-motion="reducedMotion"
            />

            <!-- 4. Class Race: Hero Visual Kendaraan Sirkuit Balapan -->
            <ClassRaceHeroVisual
              v-else-if="currentGame.id === 'class_race'"
              :reduced-motion="reducedMotion"
            />

            <!-- 5. Tower Defense: Hero Visual Menara Pertahanan Markas -->
            <TowerDefenseHeroVisual
              v-else-if="currentGame.id === 'tower_defense'"
              :reduced-motion="reducedMotion"
            />
          </div>
        </div>

        <!-- -------------------------------------------------------------
             RIGHT COLUMN (±25% lebar): Pemilih Titik Warna + Chip Info Game
             ------------------------------------------------------------- -->
        <div class="lg:col-span-3 xl:col-span-3 flex flex-col justify-center text-left lg:text-right space-y-3 sm:space-y-4 z-20 order-3">
          <!-- "PILIH GAME" Label -->
          <div>
            <span class="text-[10px] font-black uppercase tracking-[0.25em] text-white/70">
              Pilih Game
            </span>
          </div>

          <!-- 5 Titik Warna (Choose Your Game Color Dots) -->
          <div class="flex items-center gap-3 lg:justify-end flex-wrap py-1">
            <button
              v-for="(tpl, idx) in gameTemplates"
              :key="tpl.id"
              @click="selectGame(idx)"
              class="transition-all duration-300 rounded-full cursor-pointer relative flex items-center justify-center"
              :class="idx === activeGameIndex
                ? 'w-8 h-8 sm:w-9 sm:h-9 ring-4 ring-white shadow-[0_0_20px_rgba(255,255,255,0.7)] scale-110 z-10'
                : 'w-6 h-6 sm:w-7 sm:h-7 opacity-70 hover:opacity-100 hover:scale-110'"
              :style="{ backgroundColor: tpl.themeColor }"
              :title="`${tpl.name} (${tpl.giantWord})`"
            >
              <span v-if="idx === activeGameIndex" class="w-2 h-2 rounded-full bg-white shadow-xs"></span>
            </button>
          </div>

          <!-- Active Game Name Indicator Under Dots -->
          <div>
            <p class="text-white font-black text-sm tracking-wide">
              {{ currentGame.name }}
            </p>
            <p class="text-[11px] font-bold text-white/70">
              Tema: <span class="capitalize">{{ currentGame.themeName }}</span>
            </p>
          </div>

          <!-- Chip Info Game Berbentuk Pill (Meniru Pemilih Ukuran Sepatu) -->
          <div :key="`chips-${currentGame.id}`" class="space-y-2 w-full max-w-xs lg:ml-auto animate-text-desc">
            <div
              v-for="(chip, cIdx) in currentGame.chips"
              :key="cIdx"
              class="p-2.5 sm:p-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md transition hover:bg-white/15 text-left shadow-xs"
            >
              <div class="text-[9px] uppercase font-extrabold tracking-wider text-white/60">
                {{ chip.label }}
              </div>
              <div class="text-xs sm:text-sm font-black text-white mt-0.5 truncate">
                {{ chip.value }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- =========================================================================
         BOTTOM BAR (5 Mini Cards, Prev/Next Arrows, & "Lihat Semua Game" Button)
         ========================================================================= -->
    <footer class="relative z-30 px-4 sm:px-8 lg:px-12 py-3 sm:py-4 border-t border-white/10 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
      <!-- Mini Cards Strip + Navigation Arrows -->
      <div class="flex items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto py-1 custom-scroll">
        <!-- Prev Arrow -->
        <button
          @click="prevGame"
          class="w-8 h-8 rounded-full bg-black/25 hover:bg-black/50 border border-white/20 text-white font-bold flex items-center justify-center transition active:scale-95 cursor-pointer flex-shrink-0"
          title="Game Sebelumnya (Panah Kiri)"
        >
          ‹
        </button>

        <!-- 5 Mini Cards -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <button
            v-for="(tpl, idx) in gameTemplates"
            :key="tpl.id"
            @click="selectGame(idx)"
            class="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl border transition-all flex items-center gap-2 cursor-pointer text-left"
            :class="idx === activeGameIndex
              ? 'bg-white/25 border-white shadow-lg scale-105 ring-2 ring-white/50'
              : 'bg-black/20 border-white/10 opacity-70 hover:opacity-100 hover:bg-black/30'"
          >
            <span class="text-base sm:text-lg">{{ tpl.icon }}</span>
            <div class="flex flex-col">
              <span class="text-xs font-black text-white whitespace-nowrap">{{ tpl.shortName }}</span>
              <span class="text-[9px] font-bold text-white/70">{{ tpl.giantWord }}</span>
            </div>
          </button>
        </div>

        <!-- Next Arrow -->
        <button
          @click="nextGame"
          class="w-8 h-8 rounded-full bg-black/25 hover:bg-black/50 border border-white/20 text-white font-bold flex items-center justify-center transition active:scale-95 cursor-pointer flex-shrink-0"
          title="Game Berikutnya (Panah Kanan)"
        >
          ›
        </button>

        <!-- Keyboard Shortcut Helper (Hidden on Mobile) -->
        <span class="hidden xl:inline-flex items-center gap-1 text-[10px] text-white/60 font-medium ml-2">
          Gunakan <kbd class="px-1.5 py-0.5 rounded bg-white/15 text-white font-mono text-[9px]">←</kbd> <kbd class="px-1.5 py-0.5 rounded bg-white/15 text-white font-mono text-[9px]">→</kbd> ganti game &bull; <kbd class="px-1.5 py-0.5 rounded bg-white/15 text-white font-mono text-[9px]">Enter</kbd> main
        </span>
      </div>

      <!-- Button "Lihat Semua Game" -> Buka Grid Katalog Lama -->
      <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button
          @click="currentView = 'catalog'"
          class="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 border border-white/25 text-white font-black text-xs transition flex items-center justify-center gap-2 backdrop-blur-md shadow-md cursor-pointer whitespace-nowrap"
        >
          <span>📂</span>
          <span>Lihat Semua Game (Katalog & Riwayat)</span>
        </button>
      </div>
    </footer>
  </div>

  <!-- =========================================================================
       SECONDARY VIEW: KATALOG GRID LAMA & RIWAYAT SESI GAME (Bebas Kehilangan Fungsi)
       ========================================================================= -->
  <div v-else class="min-h-screen bg-[#e8edf2] p-4 sm:p-6 lg:p-8 space-y-6 font-sans">
    <!-- Top Sticky Return Bar to Hero Fullscreen -->
    <div class="rounded-2xl bg-[#0c2b3d] text-white p-4 shadow-lg flex flex-wrap items-center justify-between gap-4 sticky top-4 z-30">
      <div class="flex items-center gap-3">
        <button
          @click="currentView = 'hero'"
          class="px-4 py-2 rounded-xl bg-white text-[#0c2b3d] font-black text-xs hover:bg-white/90 active:scale-95 transition shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <span>←</span>
          <span>Kembali ke Tampilan Hero Fullscreen</span>
        </button>
        <span class="text-xs text-slate-300 hidden sm:inline">
          Edu-Games &bull; Tampilan Katalog Klasik & Riwayat Sesi
        </span>
      </div>
      <div class="flex items-center gap-2">
        <router-link
          to="/dashboard"
          class="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition flex items-center gap-1.5"
        >
          <span>🏠</span> <span>Dashboard Guru</span>
        </router-link>
        <router-link
          to="/cbt"
          class="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition flex items-center gap-1.5"
        >
          <span>📝</span> <span>Modul CBT →</span>
        </router-link>
      </div>
    </div>

    <!-- PANDUAN ASESMEN SEKOLAH: ULANGAN HARIAN VS CBT SEMESTER -->
    <div class="rounded-[24px] p-5 bg-[#0c2b3d]/5 border border-[#0c2b3d]/15 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div class="flex items-start gap-3.5">
        <span class="text-2xl mt-0.5">💡</span>
        <div class="text-xs space-y-1">
          <p class="font-extrabold text-[#0c2b3d] text-sm">
            Petunjuk Standar Asesmen Pembelajaran:
          </p>
          <p class="text-slate-600 leading-relaxed">
            &bull; <strong>Ulangan Harian Gamifikasi:</strong> Gunakan salah satu dari <strong>5 Pilihan Game Edukasi</strong> di bawah ini (Final Boss Battle, Fast Quiz, Memory Match, Balapan Kelas, & Pertahanan Markas) untuk evaluasi formatif kelas yang menyenangkan dan interaktif.<br>
            &bull; <strong>Ulangan Tengah Semester (UTS/PTS) & Ulangan Semester (UAS/PAS):</strong> Menggunakan sistem evaluasi formal berbasis komputer di <strong><router-link to="/cbt" class="text-[#0c2b3d] font-bold underline">Modul Ujian CBT</router-link></strong>.
          </p>
        </div>
      </div>
      <router-link
        to="/cbt"
        class="whitespace-nowrap px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-[#0c2b3d] font-bold text-xs shadow-xs hover:bg-slate-50 transition"
      >
        Buka Modul CBT →
      </router-link>
    </div>

    <!-- Active Games Banner if any (Real Sesi Aktif) -->
    <div v-if="activeSessions.length > 0" class="p-5 rounded-[24px] bg-[#0c2b3d] text-white shadow-card flex flex-wrap items-center justify-between gap-4 border border-slate-700/40">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-xl animate-pulse">
          ⚡
        </div>
        <div>
          <h2 class="font-bold text-base leading-snug">Sesi Game Sedang Berlangsung</h2>
          <p class="text-xs text-white/80">
            Kode / PIN: <span class="font-mono font-bold tracking-widest text-amber-300 text-sm">{{ activeSessions[0].pin }}</span>
            &bull; {{ activeSessions[0].title }} ({{ activeSessions[0].participantsCount }} Siswa Terdaftar)
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="stopActiveSessionFromList(activeSessions[0])"
          class="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
          title="Hentikan sesi game yang sedang aktif"
        >
          <span>⏹️</span>
          <span>Stop Sesi</span>
        </button>
        <router-link
          :to="getActiveSessionUrl(activeSessions[0])"
          class="px-4 py-2 bg-white text-slate-900 hover:bg-white/90 text-xs font-black rounded-lg shadow transition"
        >
          Masuk Layar Kontrol Host →
        </router-link>
      </div>
    </div>

    <!-- Pilihan 5 Mode Game Edukasi (Grid Katalog Klasik) -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>🧩</span> 5 Pilihan Mode Game Edukasi (Ulangan Harian)
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">
            Pilih mode gamifikasi yang paling sesuai dengan karakteristik materi dan gaya belajar kelas
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div
          v-for="tpl in gameTemplates"
          :key="tpl.id"
          class="card hover:shadow-lg transition-all border flex flex-col justify-between group cursor-pointer relative overflow-hidden bg-white p-5 rounded-2xl border-slate-200"
          @click="selectTemplate(tpl)"
        >
          <!-- Accent Corner Badge -->
          <div class="absolute top-2 right-2">
            <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full" :class="tpl.tagColor">
              {{ tpl.badge }}
            </span>
          </div>

          <div>
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3 transition-transform group-hover:scale-110 shadow-xs"
              :style="{ backgroundColor: tpl.bgColor }"
            >
              {{ tpl.icon }}
            </div>
            <h3 class="font-bold text-slate-900 text-sm mb-1.5 leading-snug">{{ tpl.name }}</h3>
            <p class="text-slate-500 text-xs leading-relaxed mb-3">
              {{ tpl.description }}
            </p>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span class="text-[10px] font-bold text-slate-600 truncate max-w-[120px]">{{ tpl.suitability }}</span>
            <button class="btn btn-secondary text-xs px-2.5 py-1 font-bold group-hover:bg-[#0c2b3d] group-hover:text-white transition">
              Mainkan →
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Riwayat Sesi Game Sebelumnya (Data Real Bebas Dummy) -->
    <div class="card space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 class="font-bold text-slate-900 text-base">Riwayat Sesi Game Kelas</h2>
          <p class="text-xs text-slate-500">Hasil dan rekapitulasi sesi kuis & ulangan gamifikasi yang telah selesai</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {{ pastSessions.length }} sesi selesai
          </span>
          <button
            v-if="pastSessions.length > 0"
            @click="deleteAllPastSessions"
            class="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition flex items-center gap-1.5 border border-rose-200 shadow-xs cursor-pointer"
            title="Hapus seluruh riwayat game yang sudah selesai"
          >
            <span>🗑️</span>
            <span>Hapus Semua</span>
          </button>
        </div>
      </div>

      <div v-if="pastSessions.length > 0" class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
              <th class="py-3 px-4">Judul Game</th>
              <th class="py-3 px-4">Kelas</th>
              <th class="py-3 px-4">Mode</th>
              <th class="py-3 px-4">Partisipan</th>
              <th class="py-3 px-4">Status / Hasil</th>
              <th class="py-3 px-4">Tanggal</th>
              <th class="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="ses in pastSessions" :key="ses.id" class="hover:bg-slate-50/50">
              <td class="py-3 px-4 font-semibold text-slate-900">{{ ses.title }}</td>
              <td class="py-3 px-4"><span class="badge badge-secondary">{{ ses.classroom }}</span></td>
              <td class="py-3 px-4">{{ ses.mode }}</td>
              <td class="py-3 px-4">{{ ses.participantsCount }} Siswa</td>
              <td class="py-3 px-4">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold"
                  :class="ses.outcome === 'class_victory' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'"
                >
                  {{ ses.outcomeLabel }}
                </span>
              </td>
              <td class="py-3 px-4 text-slate-500">{{ ses.date }}</td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <router-link
                    :to="`/reports/exam-events?session_id=${ses.id}`"
                    class="px-2 py-1 rounded-lg text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-semibold transition flex items-center gap-1"
                    title="Buka Rekap Nilai Event Ini & Masukkan ke Rekap Siswa"
                  >
                    <span>📋</span> Rekap Nilai
                  </router-link>
                  <router-link
                    :to="ses.link"
                    class="px-2.5 py-1 rounded-lg text-primary-600 hover:text-primary-700 hover:bg-primary-50 font-semibold transition"
                  >
                    Arena →
                  </router-link>
                  <button
                    @click="deleteSinglePastSession(ses)"
                    class="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                    title="Hapus riwayat sesi ini"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State Riwayat Nyata -->
      <div v-else class="p-8 text-center text-slate-400 space-y-2">
        <span class="text-3xl">🎮</span>
        <p class="font-bold text-slate-700 text-sm">Belum Ada Riwayat Sesi Game yang Selesai</p>
        <p class="text-xs text-slate-500 max-w-md mx-auto">
          Mulai ulangan gamifikasi Boss Battle atau kuis edukasi. Setelah sesi selesai atau dihentikan guru, rekapitulasi nilai siswa akan otomatis tampil di sini.
        </p>
      </div>
    </div>
  </div>

  <!-- =========================================================================
       MODAL CARA MAIN (Struktur Panduan Permainan untuk Game Aktif)
       ========================================================================= -->
  <div
    v-if="showHowToPlayModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in"
    @click.self="showHowToPlayModal = false"
  >
    <div class="bg-slate-900 border border-white/20 text-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scale-up relative">
      <div class="flex items-center justify-between pb-3 border-b border-white/10">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">{{ currentGame.icon }}</span>
          <div>
            <h3 class="text-base font-black text-white">
              Cara Main: {{ currentGame.name }}
            </h3>
            <p class="text-[11px] text-white/60">Panduan Praktis Pembelajaran & Ulangan Harian</p>
          </div>
        </div>
        <button
          @click="showHowToPlayModal = false"
          class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center text-sm font-bold transition cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Steps List -->
      <div class="space-y-3">
        <div
          v-for="(step, sIdx) in currentGame.howToPlay"
          :key="sIdx"
          class="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10"
        >
          <span class="w-6 h-6 rounded-full bg-white/20 text-white font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
            {{ sIdx + 1 }}
          </span>
          <p class="text-xs text-white/90 leading-relaxed font-medium">
            {{ step }}
          </p>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
        <button
          @click="showHowToPlayModal = false"
          class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer"
        >
          Tutup
        </button>
        <button
          @click="showHowToPlayModal = false; launchCurrentGame()"
          class="px-5 py-2 rounded-xl bg-white text-slate-950 font-black text-xs hover:bg-white/90 transition shadow-md cursor-pointer flex items-center gap-1.5"
        >
          <span>🚀</span>
          <span>Mainkan Sekarang</span>
        </button>
      </div>
    </div>
  </div>

  <!-- =========================================================================
       MODAL BUAT SESI BARU (Menggunakan Data Real Bank Soal & Siswa Kelas)
       ========================================================================= -->
  <div
    v-if="showCreateModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
    @click.self="showCreateModal = false"
  >
    <div class="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-4 animate-scale-up text-slate-800 max-h-[92vh] overflow-y-auto custom-scroll">
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>🚀</span> Setup Sesi Game: {{ activeTemplate?.name }}
          </h3>
          <p class="text-[11px] text-slate-500">Koneksi otomatis ke Bank Soal dan Daftar Siswa Kelas Real</p>
        </div>
        <button
          @click="showCreateModal = false"
          class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition cursor-pointer"
        >
          ✕
        </button>
      </div>

      <form @submit.prevent="launchNewSession" class="space-y-4 text-xs">
        <!-- Judul Aktivitas Game -->
        <div>
          <label class="label font-bold text-slate-700 block mb-1">Judul Aktivitas Game Ulangan Harian</label>
          <input
            v-model="newSession.title"
            type="text"
            class="input text-xs w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0c2b3d] outline-none"
            placeholder="Contoh: Kuis Cepat Berpikir Komputasional"
            required
          />
        </div>

        <!-- Target Kelas Rombel & Mata Pelajaran -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="label font-bold text-slate-700 block mb-1">Target Kelas Rombel</label>
            <select
              v-model="newSession.classroomId"
              class="input text-xs font-bold w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0c2b3d] outline-none"
              required
              @change="onClassChange"
            >
              <option v-for="c in classrooms" :key="c.id" :value="c.id">
                {{ formatClassLabel(c) }}
              </option>
            </select>
          </div>
          <div>
            <label class="label font-bold text-slate-700 block mb-1">Mata Pelajaran</label>
            <select
              v-model="newSession.subject"
              class="input text-xs font-semibold w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0c2b3d] outline-none"
              required
              @change="updateQuestionsCount"
            >
              <option v-for="s in availableSubjects" :key="s.id" :value="s.name">
                {{ s.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- KHUSUS UNTUK FINAL BOSS BATTLE: PEMILIHAN KARAKTER BOSS -->
        <div v-if="newSession.templateId === 'boss_battle'" class="space-y-2 pt-1 pb-1">
          <div class="flex items-center justify-between">
            <label class="label font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <span>👾</span>
              <span>Pilih Karakter Boss Utama (Final Boss Battle):</span>
            </label>
            <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-violet-100 text-violet-700">
              {{ selectedBoss.difficulty }}
            </span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div
              v-for="b in BOSS_CATALOG"
              :key="b.id"
              @click="selectedBossId = b.id"
              class="p-2.5 rounded-2xl border-2 transition-all flex flex-col justify-between cursor-pointer group text-left relative overflow-hidden"
              :class="selectedBossId === b.id
                ? 'border-violet-600 bg-violet-50/70 shadow-md ring-2 ring-violet-400/50'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'"
            >
              <!-- Check Badge -->
              <div v-if="selectedBossId === b.id" class="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center text-[9px] font-black shadow-xs">
                ✓
              </div>

              <!-- Sprite Visual Thumbnail -->
              <div
                class="h-16 rounded-xl flex items-center justify-center overflow-hidden mb-1.5 relative shadow-inner"
                :style="{ background: `radial-gradient(circle at 50% 50%, ${b.accent}33 0%, #0d0922 100%)` }"
              >
                <div class="scale-[0.32] origin-center pointer-events-none select-none">
                  <BossSprite
                    :name="b.name"
                    :boss-id="b.id"
                    :color="b.color"
                    :accent="b.accent"
                    pose="idle"
                  />
                </div>
              </div>

              <!-- Boss Details -->
              <div class="space-y-0.5">
                <p class="font-black text-slate-900 text-[11px] leading-tight truncate">{{ b.name }}</p>
                <p class="text-[9px] text-slate-500 truncate">{{ b.topic }}</p>
              </div>

              <div class="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[9px]">
                <span
                  class="font-bold uppercase tracking-wider"
                  :class="b.difficulty === 'mudah' ? 'text-emerald-600' : (b.difficulty === 'sulit' ? 'text-rose-600' : 'text-amber-600')"
                >
                  {{ b.difficulty }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Jumlah Soal & Waktu per Soal -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label font-bold text-slate-700 block mb-1">Jumlah Soal / Babak</label>
            <select
              v-if="manualSelectedQuestions.length === 0"
              v-model.number="newSession.questionCount"
              class="input text-xs w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0c2b3d] outline-none"
            >
              <option :value="5">5 Butir Soal</option>
              <option :value="10">10 Butir Soal</option>
              <option :value="15">15 Butir Soal</option>
              <option :value="20">20 Butir Soal</option>
            </select>
            <div
              v-else
              class="p-2.5 rounded-xl bg-violet-50 border border-violet-200 text-violet-900 font-extrabold text-xs flex items-center justify-between"
            >
              <span>{{ manualSelectedQuestions.length }} Butir Terpilih Manual</span>
              <button
                type="button"
                @click="resetToAutoQuestions"
                class="text-[10px] text-rose-600 hover:underline font-bold"
                title="Ganti ke mode jumlah soal otomatis"
              >
                Reset
              </button>
            </div>
          </div>
          <div>
            <label class="label font-bold text-slate-700 block mb-1">Waktu per Soal (Detik)</label>
            <select
              v-model.number="newSession.timePerQuestion"
              class="input text-xs w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0c2b3d] outline-none"
            >
              <option :value="10">10 Detik (Sangat Cepat)</option>
              <option :value="15">15 Detik (Standar)</option>
              <option :value="20">20 Detik</option>
              <option :value="30">30 Detik (Santai)</option>
            </select>
          </div>
        </div>

        <!-- Live Real Data Indicator & Tombol Memilih Soal -->
        <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-[11px]">
          <div class="flex items-center justify-between text-slate-700">
            <span class="flex items-center gap-1.5 font-medium">
              <span>👥</span> Siswa Terdaftar di Kelas:
            </span>
            <strong class="text-[#0c2b3d] font-bold text-xs">{{ classStudentCount }} Siswa</strong>
          </div>
          <div class="flex items-center justify-between text-slate-700">
            <span class="flex items-center gap-1.5 font-medium">
              <span>📚</span> Butir Soal di Bank Soal Real:
            </span>
            <strong class="text-emerald-700 font-bold text-xs">{{ bankQuestionCount }} Soal Siap</strong>
          </div>

          <!-- Status Seleksi Soal -->
          <div
            v-if="manualSelectedQuestions.length > 0"
            class="p-2 rounded-xl bg-violet-100/70 border border-violet-200 text-violet-900 flex items-center justify-between"
          >
            <span class="font-bold flex items-center gap-1.5 text-[10px] sm:text-[11px]">
              <span>🎯</span>
              <span>Paket Soal: <strong>{{ manualSelectedQuestions.length }} Butir Terpilih Manual</strong></span>
            </span>
            <button
              type="button"
              @click="resetToAutoQuestions"
              class="text-[10px] text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer"
            >
              ↺ Reset ke Otomatis
            </button>
          </div>
          <div v-else class="text-[10px] text-slate-500 flex items-center gap-1.5">
            <span>🎯</span>
            <span>Mode Soal: Mengambil otomatis {{ newSession.questionCount }} butir dari Bank Soal {{ newSession.subject }}.</span>
          </div>

          <!-- Tombol Aksi Memilih Soal Manual dari Bank Soal -->
          <div class="pt-1">
            <button
              type="button"
              @click="openQuestionPicker"
              class="w-full py-2.5 px-4 rounded-xl border border-violet-300 bg-violet-50 hover:bg-violet-100 text-violet-900 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-98"
            >
              <span>📚</span>
              <span>Pilih Butir Soal dari Bank Soal</span>
              <span
                v-if="manualSelectedQuestions.length > 0"
                class="px-2 py-0.5 rounded-full bg-violet-600 text-white text-[10px] font-black"
              >
                {{ manualSelectedQuestions.length }} Terpilih
              </span>
            </button>
          </div>
        </div>

        <!-- Form Footer Buttons -->
        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            @click="showCreateModal = false"
            class="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-6 py-2.5 rounded-xl bg-[#0c2b3d] text-white font-black text-xs hover:bg-[#082231] shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <span>🚀</span>
            <span>Buka Ruang Permainan</span>
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- =========================================================================
       MODAL PEMILIH SOAL DARI BANK SOAL (UNTUK SEMUA EDU-GAMES)
       ========================================================================= -->
  <Teleport to="body">
    <div
      v-if="showQuestionPickerModal"
      class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in"
      @click.self="showQuestionPickerModal = false"
    >
      <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up text-slate-800">
        <!-- Modal Header -->
        <div class="p-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center text-xl shadow-xs">
              📚
            </div>
            <div>
              <h3 class="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                Pilih Butir Soal Bank Soal — {{ newSession.subject }}
              </h3>
              <p class="text-xs text-slate-500">
                Pilih butir-butir soal yang akan dimasukkan ke sesi {{ activeTemplate?.name }}
              </p>
            </div>
          </div>
          <button
            @click="showQuestionPickerModal = false"
            class="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-sm font-bold transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <!-- Toolbar Search & Filter -->
        <div class="p-4 border-b border-slate-100 bg-white space-y-3 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <!-- Search Input -->
            <div class="sm:col-span-2 relative">
              <input
                v-model="pickerSearch"
                type="text"
                placeholder="Cari teks pertanyaan, materi, atau kata kunci..."
                class="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0c2b3d] outline-none"
              />
              <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            </div>

            <!-- Difficulty Filter -->
            <div>
              <select
                v-model="pickerDifficultyFilter"
                class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-[#0c2b3d] outline-none"
              >
                <option value="">Semua Tingkat Kesulitan</option>
                <option value="easy">Mudah</option>
                <option value="medium">Sedang</option>
                <option value="hard">Sulit</option>
              </select>
            </div>
          </div>

          <!-- Select All Toolbar -->
          <div class="flex items-center justify-between pt-1 text-[11px] text-slate-600">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                :checked="isAllVisibleSelected"
                @change="toggleSelectAllVisible"
                class="rounded border-slate-300 text-violet-600 focus:ring-violet-500 w-4 h-4 cursor-pointer"
              />
              <span class="font-bold text-slate-800">
                Pilih Semua yang Ditampilkan ({{ filteredBankQuestions.length }} Soal)
              </span>
            </label>

            <div class="flex items-center gap-2">
              <span
                v-if="tempSelectedQuestionIds.length > 0"
                class="font-black text-violet-800 bg-violet-100 px-2.5 py-1 rounded-lg border border-violet-200"
              >
                ✓ {{ tempSelectedQuestionIds.length }} Soal Dicentang
              </span>
              <span class="text-slate-400">
                Total Bank: {{ rawBankQuestions.length }} butir
              </span>
            </div>
          </div>
        </div>

        <!-- Question List (Scrollable) -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-50/50 text-xs custom-scroll">
          <!-- Empty State -->
          <div v-if="filteredBankQuestions.length === 0" class="py-10 text-center space-y-2 bg-white rounded-2xl border border-slate-200 p-6">
            <p class="text-3xl">🔍</p>
            <p class="font-bold text-slate-800 text-sm">Tidak ada butir soal yang sesuai filter</p>
            <p class="text-slate-500 text-xs max-w-sm mx-auto">
              Coba ubah kata kunci pencarian atau reset filter untuk melihat seluruh soal di Bank Soal.
            </p>
          </div>

          <!-- Question Cards -->
          <div
            v-for="(q, idx) in filteredBankQuestions"
            :key="q.id || idx"
            @click="toggleQuestionSelection(q.id)"
            class="p-4 rounded-2xl border transition-all cursor-pointer bg-white hover:border-violet-300 space-y-2.5 shadow-xs"
            :class="tempSelectedQuestionIds.includes(q.id)
              ? 'border-violet-500 bg-violet-50/30 ring-2 ring-violet-200'
              : 'border-slate-200'"
          >
            <div class="flex items-start gap-3">
              <input
                type="checkbox"
                :checked="tempSelectedQuestionIds.includes(q.id)"
                @click.stop="toggleQuestionSelection(q.id)"
                class="rounded border-slate-300 text-violet-600 focus:ring-violet-500 w-4 h-4 mt-0.5 cursor-pointer flex-shrink-0"
              />
              <div class="flex-1 space-y-1.5">
                <div class="flex flex-wrap items-center gap-1.5">
                  <span class="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                    #{{ idx + 1 }}
                  </span>
                  <span class="px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 font-bold text-[9px]">
                    {{ q.subject_name || newSession.subject }}
                  </span>
                  <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[9px] capitalize">
                    {{ formatDifficulty(q.difficulty) }}
                  </span>
                  <span v-if="q.topic" class="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold text-[9px]">
                    {{ q.topic }}
                  </span>
                </div>
                <p class="font-bold text-slate-900 text-xs leading-relaxed">
                  {{ stripHtml(q.content || q.text) }}
                </p>

                <!-- Option choices preview -->
                <div v-if="Array.isArray(q.options) && q.options.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  <div
                    v-for="(opt, optIdx) in q.options"
                    :key="optIdx"
                    class="px-2.5 py-1 rounded-lg text-[10px] font-medium border flex items-center gap-1.5"
                    :class="(typeof opt === 'object' && opt.is_correct)
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'"
                  >
                    <span class="font-bold">{{ ['A', 'B', 'C', 'D', 'E'][optIdx] }}.</span>
                    <span class="truncate">{{ typeof opt === 'string' ? opt : (opt.text || opt.content) }}</span>
                    <span v-if="typeof opt === 'object' && opt.is_correct" class="ml-auto text-emerald-600 font-black">✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
          <div class="text-xs">
            <span class="font-bold text-slate-800">{{ tempSelectedQuestionIds.length }} Soal Dipilih</span>
            <span class="text-slate-400 ml-1">dari total {{ filteredBankQuestions.length }} butir</span>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="showQuestionPickerModal = false"
              class="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              @click="applyQuestionSelection"
              class="px-5 py-2 rounded-xl bg-[#0c2b3d] hover:bg-[#082231] text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <span>✓</span>
              <span>Terapkan Pilihan Soal ({{ tempSelectedQuestionIds.length }} Butir)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  useClassrooms,
  getSubjectNameForClass,
  getSubjectIdForClass,
  getAvailableSubjectsForClass
} from '@/composables/useClassrooms'
import {
  useBossBattleSession,
  convertBankToBattleQuestions,
  registerStudentPool
} from '@/modules/games/bossBattle/sessionStore'
import { BOSS_CATALOG } from '@/modules/games/bossBattle/types'
import api from '@/services/api'

// Visual Components for Hero View
import BossSprite from '@/modules/games/bossBattle/BossSprite.vue'
import FastQuizHeroVisual from '@/modules/games/hero/FastQuizHeroVisual.vue'
import MemoryMatchHeroVisual from '@/modules/games/hero/MemoryMatchHeroVisual.vue'
import ClassRaceHeroVisual from '@/modules/games/hero/ClassRaceHeroVisual.vue'
import TowerDefenseHeroVisual from '@/modules/games/hero/TowerDefenseHeroVisual.vue'

const router = useRouter()
const { classrooms, fetchClassrooms, formatClassLabel, getClassName } = useClassrooms()
const { getActiveSession, restoreSession, stopActiveSession, clearActiveSession, draft, beginBattle } = useBossBattleSession()

// View State: 'hero' (Fullscreen Hero Product Page) or 'catalog' (Old grid & history)
const currentView = ref<'hero' | 'catalog'>('hero')
const showCreateModal = ref(false)
const showHowToPlayModal = ref(false)
const activeTemplate = ref<any>(null)
const classStudentCount = ref(0)
const bankQuestionCount = ref(0)
const reducedMotion = ref(false)

// Boss Character Selection for Final Boss Battle
const selectedBossId = ref<string>('robot-glitch')
const selectedBoss = computed(() => BOSS_CATALOG.find(b => b.id === selectedBossId.value) || BOSS_CATALOG[0])

// Question Picker States (Untuk Semua Game)
const showQuestionPickerModal = ref(false)
const rawBankQuestions = ref<any[]>([])
const manualSelectedQuestions = ref<any[]>([])
const tempSelectedQuestionIds = ref<string[]>([])
const pickerSearch = ref('')
const pickerDifficultyFilter = ref('')

const filteredBankQuestions = computed(() => {
  let list = rawBankQuestions.value
  if (pickerSearch.value.trim()) {
    const q = pickerSearch.value.toLowerCase().trim()
    list = list.filter(item => {
      const text = (item.content || item.text || item.topic || '').toLowerCase()
      return text.includes(q)
    })
  }
  if (pickerDifficultyFilter.value) {
    list = list.filter(item => item.difficulty === pickerDifficultyFilter.value)
  }
  return list
})

const isAllVisibleSelected = computed(() => {
  if (filteredBankQuestions.value.length === 0) return false
  return filteredBankQuestions.value.every(q => tempSelectedQuestionIds.value.includes(q.id))
})

function openQuestionPicker() {
  if (manualSelectedQuestions.value.length > 0) {
    tempSelectedQuestionIds.value = manualSelectedQuestions.value.map(q => q.id)
  } else if (rawBankQuestions.value.length > 0) {
    tempSelectedQuestionIds.value = rawBankQuestions.value
      .slice(0, Math.min(newSession.value.questionCount || 5, rawBankQuestions.value.length))
      .map(q => q.id)
  } else {
    tempSelectedQuestionIds.value = []
  }
  pickerSearch.value = ''
  pickerDifficultyFilter.value = ''
  showQuestionPickerModal.value = true
}

function toggleQuestionSelection(id: string) {
  const idx = tempSelectedQuestionIds.value.indexOf(id)
  if (idx === -1) {
    tempSelectedQuestionIds.value.push(id)
  } else {
    tempSelectedQuestionIds.value.splice(idx, 1)
  }
}

function toggleSelectAllVisible() {
  if (isAllVisibleSelected.value) {
    const visibleIds = new Set(filteredBankQuestions.value.map(q => q.id))
    tempSelectedQuestionIds.value = tempSelectedQuestionIds.value.filter(id => !visibleIds.has(id))
  } else {
    const current = new Set(tempSelectedQuestionIds.value)
    filteredBankQuestions.value.forEach(q => current.add(q.id))
    tempSelectedQuestionIds.value = Array.from(current)
  }
}

function applyQuestionSelection() {
  const chosen = rawBankQuestions.value.filter(q => tempSelectedQuestionIds.value.includes(q.id))
  manualSelectedQuestions.value = chosen
  if (chosen.length > 0) {
    newSession.value.questionCount = chosen.length
  }
  showQuestionPickerModal.value = false
}

function resetToAutoQuestions() {
  manualSelectedQuestions.value = []
  newSession.value.questionCount = Math.min(5, bankQuestionCount.value || 5)
}

function formatDifficulty(diff?: string) {
  if (diff === 'easy') return 'Mudah'
  if (diff === 'hard') return 'Sulit'
  return 'Sedang'
}

function stripHtml(html?: string) {
  if (!html) return ''
  return html.replace(/<[^>]*>?/gm, '').trim()
}

// ---------------------------------------------------------------------------
// 5 PEMETAAN GAME EDU-GAMES (Source of Truth Tunggal Katalog Game)
// 1. Final Boss Battle — kata "BOSS" — merah crimson (#E11D48)
// 2. Fast Quiz — kata "KILAT" — oranye (#F97316)
// 3. Memory Match — kata "INGAT" — ungu (#7C3AED)
// 4. Class Race — kata "BALAP" — hijau (#16A34A)
// 5. Tower Defense Kelas — kata "TAHAN" — biru (#2563EB)
// ---------------------------------------------------------------------------
const gameTemplates = [
  {
    id: 'boss_battle',
    name: 'Final Boss Battle',
    shortName: 'Boss Battle',
    subtitle: 'Serangan Kelas Melawan Robot Glitch',
    giantWord: 'BOSS',
    themeName: 'Crimson Fury',
    themeColor: '#E11D48',
    gradient: 'radial-gradient(circle at 55% 45%, #E11D48 0%, #9F1239 45%, #4C0519 100%)',
    heroDesc: 'Siswa satu kelas bersatu menembakkan laser ke Robot Glitch dengan menjawab soal Bank Soal secara akurat. Kalahkan boss saat kelas mencapai target KKM!',
    description: 'Siswa bekerja sama menembakkan laser ke Boss dengan menjawab benar. Boss tumbang saat seluruh kelas melewati target KKM!',
    icon: '👾',
    bgColor: '#f5f3ff',
    borderColor: 'border-violet-300',
    tagColor: 'bg-violet-100 text-violet-800',
    suitability: 'Paling Populer: Kolaboratif Kelas',
    badge: 'Boss Battle',
    isBossBattle: true,
    chips: [
      { label: 'Pemain', value: 'Satu Kelas (Kooperatif)' },
      { label: 'Format', value: 'Serangan HP Bersama' },
      { label: 'Mode', value: 'Ulangan Harian Formatif' }
    ],
    howToPlay: [
      'Guru mengatur kelas, mata pelajaran, target KKM, dan boss Robot Glitch.',
      'Proyektor menampilkan Arena Pertempuran Boss dengan HP bar raksasa.',
      'Siswa masuk dari Portal Siswa dan menjawab butir soal ulangan harian.',
      'Setiap jawaban benar menembakkan sinar laser dan mengurangi HP Boss.',
      'Nilai formatif otomatis tersinkronisasi ke buku nilai & rekapitulasi raport.'
    ]
  },
  {
    id: 'fast_quiz',
    name: 'Fast Quiz',
    shortName: 'Fast Quiz',
    subtitle: 'Kuis Kilat Berkecepatan & Akurasi',
    giantWord: 'KILAT',
    themeName: 'Electric Blaze',
    themeColor: '#F97316',
    gradient: 'radial-gradient(circle at 55% 45%, #F97316 0%, #C2410C 45%, #431407 100%)',
    heroDesc: 'Kompetisi kecepatan dan ketepatan menjawab butir soal pilihan ganda secara serentak. Siswa tercepat dan tertepat memimpin puncak klasemen podium!',
    description: 'Multiplayer interaktif ala Kahoot dengan soal pilihan ganda dari Bank Soal dan poin berdasarkan kecepatan serta ketepatan.',
    icon: '⚡',
    bgColor: '#eff6ff',
    borderColor: 'border-blue-200',
    tagColor: 'bg-blue-100 text-blue-800',
    suitability: 'Kompetisi Individu',
    badge: 'Speed Battle',
    chips: [
      { label: 'Pemain', value: 'Individual / Semua Siswa' },
      { label: 'Format', value: '5 - 20 Butir Soal' },
      { label: 'Mode', value: 'Kecepatan & Akurasi' }
    ],
    howToPlay: [
      'Guru memilih mata pelajaran, jumlah butir (5-20 soal), dan durasi (10-30 detik).',
      'Siswa memasukkan PIN Game dari perangkat masing-masing.',
      'Soal muncul di proyektor dan pilihan jawaban di layar siswa.',
      'Poin dihitung otomatis berdasarkan ketepatan dan kecepatan respons.',
      'Papan podium peringkat langsung terupdate di setiap akhir ronde soal.'
    ]
  },
  {
    id: 'memory_match',
    name: 'Memory Match',
    shortName: 'Memory Match',
    subtitle: 'Pencocok Pasangan Konsep & Fungsi',
    giantWord: 'INGAT',
    themeName: 'Royal Mystic',
    themeColor: '#7C3AED',
    gradient: 'radial-gradient(circle at 55% 45%, #7C3AED 0%, #5B21B6 45%, #2E1065 100%)',
    heroDesc: 'Tantang daya ingat dan pemahaman konsep dengan mencocokkan kartu pasangan istilah & fungsi secara tepat dalam waktu terbaik.',
    description: 'Permainan mencocokkan kartu pasangan antara konsep/istilah dan fungsi/jawaban nyata secara interaktif dan seru.',
    icon: '🧠',
    bgColor: '#fffbeb',
    borderColor: 'border-amber-200',
    tagColor: 'bg-amber-100 text-amber-800',
    suitability: 'Daya Ingat & Asosiasi Logika',
    badge: 'Pair Matching',
    chips: [
      { label: 'Pemain', value: 'Satu Kelas / Giliran' },
      { label: 'Format', value: '6 - 12 Pasangan Kartu' },
      { label: 'Mode', value: 'Daya Ingat & Logika' }
    ],
    howToPlay: [
      'Kartu-kartu stimulus (istilah) dan respon (fungsi/kunci) diacak di papan.',
      'Siswa membuka 2 kartu untuk menemukan pasangan yang cocok.',
      'Pasangan yang cocok akan tetap terbuka dan menyumbang poin kelas.',
      'Selesaikan seluruh pasangan kartu sebelum waktu habis untuk rekor terbaik.'
    ]
  },
  {
    id: 'class_race',
    name: 'Class Race',
    shortName: 'Class Race',
    subtitle: 'Balapan Sirkuit Sirkuler Kelas',
    giantWord: 'BALAP',
    themeName: 'Emerald Nitro',
    themeColor: '#16A34A',
    gradient: 'radial-gradient(circle at 55% 45%, #16A34A 0%, #15803D 45%, #052E16 100%)',
    heroDesc: 'Balapan sirkuit interaktif antar tim kelas di layar proyektor. Jawaban tepat memacu akselerasi dan nitro kendaraan tim melaju menuju garis finis!',
    description: 'Kuis tim serentak dengan lintasan balap proyektor. Kecepatan dan ketepatan tim memacu kendaraan melaju menuju garis finis!',
    icon: '🏎️',
    bgColor: '#fff7ed',
    borderColor: 'border-amber-300',
    tagColor: 'bg-amber-100 text-amber-800',
    suitability: 'Kompetisi Tim & Kolaborasi',
    badge: 'Race Arena',
    chips: [
      { label: 'Pemain', value: 'Kompetisi 2 - 4 Tim' },
      { label: 'Format', value: '500m Lintasan Balap' },
      { label: 'Mode', value: 'Akselerasi Nitro Tim' }
    ],
    howToPlay: [
      'Siswa dibagi ke dalam 2-4 tim balap (Merah, Biru, Hijau, Kuning).',
      'Setiap ronde, siswa menjawab butir soal yang tampil di layar.',
      'Akumulasi jawaban benar tim memicu boost nitro kendaraan di arena balap.',
      'Tim pertama yang melintasi garis finis 500m menyabet trofi podium juara 1.'
    ]
  },
  {
    id: 'tower_defense',
    name: 'Tower Defense Kelas',
    shortName: 'Tower Defense',
    subtitle: 'Pertahanan Markas Strategi Tim',
    giantWord: 'TAHAN',
    themeName: 'Sapphire Shield',
    themeColor: '#2563EB',
    gradient: 'radial-gradient(circle at 55% 45%, #2563EB 0%, #1D4ED8 45%, #172554 100%)',
    heroDesc: 'Kerja sama strategis seluruh kelas membangun menara dan menahan 5 gelombang monster. Jawaban benar menghasilkan koin pertahanan markas!',
    description: 'Strategi kolaboratif kelas membangun menara dan bertahan dari 5 gelombang musuh. Jawaban benar menyumbang koin dan buff menara!',
    icon: '🏰',
    bgColor: '#f0fdf4',
    borderColor: 'border-emerald-300',
    tagColor: 'bg-emerald-100 text-emerald-800',
    suitability: 'Strategi & Kolaborasi Kelas',
    badge: 'Base Defense',
    chips: [
      { label: 'Pemain', value: 'Satu Kelas (Kolaborasi)' },
      { label: 'Format', value: '5 Gelombang Musuh' },
      { label: 'Mode', value: 'Strategi & Pertahanan' }
    ],
    howToPlay: [
      'Monster musuh bergerak menyusuri jalur menuju markas utama kelas.',
      'Jawaban benar dari siswa menyumbang koin energi pertahanan kelas.',
      'Guru menempatkan dan meng-upgrade menara pemanah, sihir, atau meriam.',
      'Bertahanlah dari 5 gelombang serangan musuh untuk mempertahankan markas.'
    ]
  }
]

// Active Game Index (Default: Final Boss Battle [index 0], SessionStorage Persisted)
const activeGameIndex = ref(0)
const currentGame = computed(() => gameTemplates[activeGameIndex.value] || gameTemplates[0])

const activeSessions = ref<Array<{
  id: string
  pin: string
  title: string
  participantsCount: number
  mode?: string
  game_type?: string
  isBossBattle?: boolean
}>>([])

const pastSessions = ref<Array<{
  id: string
  title: string
  classroom: string
  mode: string
  participantsCount: number
  outcome?: string
  outcomeLabel: string
  date: string
  link: string
}>>([])

const newSession = ref({
  title: 'Kuis Interaktif Baru',
  templateId: 'fast_quiz',
  classroomId: 'cls-7a',
  classroom: 'VII A',
  subject: 'KKA (Koding dan Kecerdasan Artifisial)',
  questionCount: 5,
  timePerQuestion: 15
})

const availableSubjects = computed(() => getAvailableSubjectsForClass(newSession.value.classroomId))

// ---------------------------------------------------------------------------
// LIFECYCLE & KEYBOARD NAVIGATION
// ---------------------------------------------------------------------------
onMounted(async () => {
  // Check prefers-reduced-motion
  if (typeof window !== 'undefined' && window.matchMedia) {
    reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  // Restore last selected game from sessionStorage
  try {
    const savedGameId = sessionStorage.getItem('belajarena_active_game')
    if (savedGameId) {
      const foundIdx = gameTemplates.findIndex(g => g.id === savedGameId)
      if (foundIdx >= 0) {
        activeGameIndex.value = foundIdx
      }
    }
  } catch {}

  // Keyboard navigation listener
  window.addEventListener('keydown', handleKeydown)

  // Fetch real data
  await fetchClassrooms()
  if (classrooms.value.length > 0) {
    newSession.value.classroomId = classrooms.value[0].id
    newSession.value.classroom = classrooms.value[0].name
    newSession.value.subject = getSubjectNameForClass(classrooms.value[0].id)
  }
  await updateCounts()
  await loadRealSessions()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

function handleKeydown(e: KeyboardEvent) {
  // Ignore keyboard navigation if modals or inputs are focused
  if (showCreateModal.value || showHowToPlayModal.value) return
  const activeTagName = (document.activeElement?.tagName || '').toLowerCase()
  if (activeTagName === 'input' || activeTagName === 'select' || activeTagName === 'textarea') return

  if (e.key === 'ArrowLeft') {
    prevGame()
  } else if (e.key === 'ArrowRight') {
    nextGame()
  } else if (e.key === 'Enter') {
    launchCurrentGame()
  }
}

function selectGame(idx: number) {
  if (idx >= 0 && idx < gameTemplates.length) {
    activeGameIndex.value = idx
    try {
      sessionStorage.setItem('belajarena_active_game', gameTemplates[idx].id)
    } catch {}
  }
}

function prevGame() {
  const newIdx = (activeGameIndex.value - 1 + gameTemplates.length) % gameTemplates.length
  selectGame(newIdx)
}

function nextGame() {
  const newIdx = (activeGameIndex.value + 1) % gameTemplates.length
  selectGame(newIdx)
}

function toggleReducedMotion() {
  reducedMotion.value = !reducedMotion.value
}

// ---------------------------------------------------------------------------
// GAME LAUNCH FLOW SETUP (Preserves Existing Routes & Behaviors)
// ---------------------------------------------------------------------------
function launchCurrentGame() {
  selectTemplate(currentGame.value)
}

function selectTemplate(tpl: any) {
  activeTemplate.value = tpl
  newSession.value.templateId = tpl.id
  newSession.value.title = `${tpl.name} — ${newSession.value.classroom}`
  manualSelectedQuestions.value = []
  if (tpl.id === 'boss_battle' && !selectedBossId.value) {
    selectedBossId.value = 'robot-glitch'
  }
  showCreateModal.value = true
  updateCounts()
}

function getActiveSessionUrl(session: any): string {
  if (session.mode === 'class-race' || session.game_type === 'class-race') {
    return `/games/class-race/arena/${session.id}`
  }
  if (session.mode === 'tower-defense' || session.game_type === 'tower-defense') {
    return `/games/tower-defense/arena/${session.id}`
  }
  if (session.isBossBattle) {
    return '/games/ulangan-harian/arena/active'
  }
  return `/games/session/${session.id}?mode=${session.mode || 'fast_quiz'}`
}

async function onClassChange() {
  const c = classrooms.value.find(cl => cl.id === newSession.value.classroomId)
  if (c) newSession.value.classroom = c.name
  newSession.value.subject = getSubjectNameForClass(newSession.value.classroomId)
  manualSelectedQuestions.value = []
  await updateCounts()
}

async function updateQuestionsCount() {
  manualSelectedQuestions.value = []
  await updateCounts()
}

async function updateCounts() {
  try {
    const sRes = await api.get('/students', { params: { classroom_id: newSession.value.classroomId, all: 'true' } })
    const list = sRes.data?.data || []
    classStudentCount.value = list.length
  } catch {
    classStudentCount.value = 0
  }

  try {
    const qRes = await api.get('/questions', { params: { subject_name: newSession.value.subject } })
    const qList = qRes.data?.data || []
    if (Array.isArray(qList) && qList.length > 0) {
      bankQuestionCount.value = qList.length
      rawBankQuestions.value = qList
    } else {
      // Fallback: ambil seluruh butir soal bank dan filter berdasarkan mapel
      const allQRes = await api.get('/questions')
      const allQ = allQRes.data?.data || []
      const filtered = allQ.filter((q: any) =>
        (q.subject_name || '').toLowerCase().includes(newSession.value.subject.toLowerCase().substring(0, 3))
      )
      rawBankQuestions.value = filtered.length > 0 ? filtered : allQ
      bankQuestionCount.value = rawBankQuestions.value.length
    }
  } catch {
    bankQuestionCount.value = 0
    rawBankQuestions.value = []
  }
}

function getGameModeTitle(mode?: string) {
  if (mode === 'class-race' || mode === 'class_race') return 'Balapan Kelas (Class Race)'
  if (mode === 'tower-defense' || mode === 'tower_defense') return 'Pertahanan Markas (Tower Defense)'
  if (mode === 'fast_quiz') return 'Kuis Kilat (Speed Battle)'
  if (mode === 'memory_match') return 'Pencocok Pasangan'
  if (mode === 'word_scramble') return 'Susun Kata Kosakata (Arsip)'
  if (mode === 'flashcard_battle') return 'Tebak Kartu Konsep (Arsip)'
  return 'Boss Battle Gamifikasi'
}

async function loadRealSessions() {
  activeSessions.value = []
  pastSessions.value = []

  // 1. Fetch sesi dari API server (Server adalah Source of Truth sesi online)
  try {
    const res = await api.get('/ulangan-gamifikasi/sessions')
    const list = res.data?.data || []
    if (Array.isArray(list)) {
      for (const s of list) {
        const isLive = (s.status === 'active' || s.status === 'in_progress' || s.status === 'lobby') && s.outcome === 'ongoing'
        const isBoss = s.mode === 'boss_battle' || (!s.mode && !s.game_type) || s.quiz_type === 'boss_battle'
        const isClassRace = s.mode === 'class-race' || s.game_type === 'class-race'
        const isTD = s.mode === 'tower-defense' || s.game_type === 'tower-defense'
        if (isLive) {
          if (!activeSessions.value.some(a => a.id === s.id)) {
            activeSessions.value.push({
              id: s.id,
              pin: s.join_code || s.pin || s.id,
              title: s.title || (isClassRace ? 'Balapan Kelas' : (isTD ? 'Pertahanan Markas' : 'Ulangan Gamifikasi')),
              participantsCount: (s.participants || []).length || s.official_count || 0,
              mode: s.mode || s.game_type || (isBoss ? 'boss_battle' : 'fast_quiz'),
              game_type: s.game_type,
              isBossBattle: isBoss
            })
          }
        } else if (s.status === 'completed' || (s.outcome && s.outcome !== 'ongoing')) {
          const dateStr = s.ended_at || s.created_at
            ? new Date(s.ended_at || s.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
            : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

          const clsName = s.classroom_name
            ? (/^kelas\s+/i.test(s.classroom_name) ? s.classroom_name : `Kelas ${s.classroom_name}`)
            : (s.classroom_id ? getClassName(s.classroom_id) : 'Semua Kelas')

          let sessionLink = `/games/session/${s.id}?mode=${s.mode || 'fast_quiz'}`
          if (isClassRace) {
            sessionLink = `/games/class-race/arena/${s.id}`
          } else if (isTD) {
            sessionLink = `/games/tower-defense/arena/${s.id}`
          } else if (isBoss) {
            sessionLink = `/games/ulangan-harian/arena/${s.id}`
          }

          pastSessions.value.push({
            id: s.id,
            title: s.title || 'Edu-Game Sesi',
            classroom: clsName,
            mode: getGameModeTitle(s.mode || s.game_type),
            participantsCount: (s.participants || []).length || s.official_count || 0,
            outcome: s.outcome,
            outcomeLabel: 'Selesai',
            date: dateStr,
            link: sessionLink
          })
        }
      }
    }
  } catch (err) {
    console.warn('Load game sessions from api failed:', err)
  }

  // 2. Periksa sesi lokal Boss Battle aktif (HANYA jika game benar-benar sedang berjalan)
  restoreSession()
  const localBoss = getActiveSession()
  if (
    localBoss &&
    localBoss.status === 'active' &&
    localBoss.startedAt &&
    localBoss.outcome === 'ongoing'
  ) {
    if (!activeSessions.value.some(a => a.id === localBoss.sessionId)) {
      activeSessions.value.unshift({
        id: localBoss.sessionId,
        pin: localBoss.sessionId,
        title: localBoss.config.title || 'Ulangan Gamifikasi Boss Battle',
        participantsCount: localBoss.progress?.size || localBoss.officialRoster?.length || 0,
        mode: 'boss_battle',
        isBossBattle: true
      })
    }
  } else if (localBoss && (localBoss.status === 'waiting' || localBoss.status === 'preview' || !localBoss.startedAt)) {
    clearActiveSession()
  }
}

async function deleteSinglePastSession(ses: any) {
  if (confirm(`Apakah Anda yakin ingin menghapus riwayat sesi game "${ses.title}"?`)) {
    try {
      await api.delete(`/ulangan-gamifikasi/sessions/${ses.id}`)
      await loadRealSessions()
    } catch (err) {
      console.error('Gagal menghapus riwayat sesi:', err)
      alert('Gagal menghapus riwayat sesi.')
    }
  }
}

async function deleteAllPastSessions() {
  if (confirm(`Apakah Anda yakin ingin menghapus SEMUA (${pastSessions.value.length}) riwayat sesi game yang sudah selesai?`)) {
    try {
      await api.delete('/ulangan-gamifikasi/sessions')
      await loadRealSessions()
    } catch (err) {
      console.error('Gagal menghapus seluruh riwayat sesi:', err)
      alert('Gagal menghapus seluruh riwayat sesi.')
    }
  }
}

async function stopActiveSessionFromList(item: any) {
  if (confirm(`Apakah Anda yakin ingin menghentikan sesi "${item.title}" sekarang?`)) {
    if (item.isBossBattle) {
      stopActiveSession('Dihentikan dari menu Edu-Games')
      clearActiveSession()
    }
    try {
      await api.post(`/ulangan-gamifikasi/sessions/${item.id}/stop`, {})
      await api.post('/ulangan-gamifikasi/sessions/active/stop', {})
    } catch {}
    await loadRealSessions()
  }
}

async function launchNewSession() {
  showCreateModal.value = false
  const genId = 'ses-' + Date.now().toString(36)
  const pin = Math.floor(100000 + Math.random() * 900000).toString()

  // 1. Ambil data siswa real kelas
  let realStudents: any[] = []
  try {
    const sRes = await api.get('/students', { params: { classroom_id: newSession.value.classroomId, all: 'true' } })
    realStudents = sRes.data?.data || []
  } catch {}

  // 2. Tentukan butir soal yang digunakan (pilihan manual guru ATAU dari bank soal)
  let questionsToUse: any[] = []
  if (manualSelectedQuestions.value.length > 0) {
    questionsToUse = manualSelectedQuestions.value
  } else if (rawBankQuestions.value.length > 0) {
    questionsToUse = rawBankQuestions.value.slice(0, newSession.value.questionCount)
  } else {
    try {
      const qRes = await api.get('/questions', { params: { subject_name: newSession.value.subject } })
      const allQ = qRes.data?.data || []
      questionsToUse = allQ.slice(0, newSession.value.questionCount)
    } catch {}
  }

  // KHUSUS FINAL BOSS BATTLE
  if (newSession.value.templateId === 'boss_battle') {
    const bossConfig = BOSS_CATALOG.find(b => b.id === selectedBossId.value) || BOSS_CATALOG[0]
    draft.bossId = bossConfig.id
    draft.bossName = bossConfig.name
    draft.topic = bossConfig.topic
    draft.title = newSession.value.title
    draft.settings.classroomId = newSession.value.classroomId
    draft.settings.classroomName = newSession.value.classroom
    draft.subjectName = newSession.value.subject
    draft.subjectId = getSubjectIdForClass(newSession.value.classroomId)
    draft.settings.officialParticipantIds = realStudents.map(s => s.id)
    draft.settings.questionCount = questionsToUse.length
    draft.settings.durationMinutes = Math.max(5, Math.ceil((newSession.value.timePerQuestion * questionsToUse.length) / 60))

    registerStudentPool(realStudents)
    const battleQuestions = convertBankToBattleQuestions(questionsToUse)
    const s = beginBattle(battleQuestions)

    try {
      await api.post('/ulangan-gamifikasi/sessions/active', {
        session_id: s.sessionId,
        title: newSession.value.title,
        topic: bossConfig.topic,
        subject: newSession.value.subject,
        subject_id: getSubjectIdForClass(newSession.value.classroomId),
        classroom_id: newSession.value.classroomId,
        classroom_name: newSession.value.classroom,
        participant_ids: realStudents.map(s => s.id),
        boss_id: bossConfig.id,
        boss_name: bossConfig.name,
      })
    } catch (err) {
      console.warn('Could not register active boss session:', err)
    }

    router.push(`/games/ulangan-harian/arena/${s.sessionId}`)
    return
  }

  // UNTUK 4 GAME LAINNYA (Class Race, Tower Defense, Fast Quiz, Memory Match)
  const isClassRaceMode = newSession.value.templateId === 'class_race' || newSession.value.templateId === 'class-race'
  const isTdMode = newSession.value.templateId === 'tower_defense' || newSession.value.templateId === 'tower-defense'
  const sessionPayload: any = {
    id: genId,
    pin,
    join_code: pin,
    title: newSession.value.title,
    mode: isClassRaceMode ? 'class-race' : (isTdMode ? 'tower-defense' : newSession.value.templateId),
    quiz_type: isClassRaceMode ? 'class-race' : (isTdMode ? 'tower-defense' : newSession.value.templateId),
    game_type: isClassRaceMode ? 'class-race' : (isTdMode ? 'tower-defense' : undefined),
    classroom_id: newSession.value.classroomId,
    classroom_name: newSession.value.classroom,
    subject: newSession.value.subject,
    question_count: questionsToUse.length,
    time_per_question: newSession.value.timePerQuestion,
    race_length: isClassRaceMode ? 500 : undefined,
    per_question_seconds: isClassRaceMode ? (newSession.value.timePerQuestion || 15) : undefined,
    initial_coins: isTdMode ? 60 : undefined,
    status: (isClassRaceMode || isTdMode) ? 'lobby' : 'active',
    outcome: 'ongoing',
    questions: questionsToUse,
    participants: realStudents.map(s => ({
      id: s.id,
      name: s.name,
      nis: s.nis || s.nisn || '',
      nisn: s.nisn || s.nis || '',
      avatar: s.gender === 'P' ? '👧' : '🧑',
      score: 0,
      academic_score: 0,
      answered: 0,
      correct: 0,
      wrong: 0,
      reached_kkm: false
    })),
    created_at: new Date().toISOString()
  }

  // Simpan ke API Server (Source of Truth Real Sesi Game)
  try {
    await api.post('/ulangan-gamifikasi/sessions', sessionPayload)
  } catch (err) {
    console.warn('Gagal simpan session ke server:', err)
  }

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('game_session_' + genId, JSON.stringify(sessionPayload))
    localStorage.setItem('game_session_active', JSON.stringify(sessionPayload))
  }

  if (isClassRaceMode) {
    router.push(`/games/class-race/arena/${genId}`)
    return
  }

  if (isTdMode) {
    router.push(`/games/tower-defense/arena/${genId}`)
    return
  }

  router.push({
    path: `/games/session/${genId}`,
    query: {
      mode: newSession.value.templateId,
      classId: newSession.value.classroomId,
      subject: newSession.value.subject
    }
  })
}
</script>

<style scoped>
/* ---------------------------------------------------------------------------
   KEYFRAME ANIMATIONS FOR HERO PRODUCT PAGE (CSS MURNI & RINGAN)
   --------------------------------------------------------------------------- */
@keyframes giantWordFade {
  0% {
    opacity: 0;
    transform: scale(0.92) translateY(14px);
  }
  100% {
    opacity: 0.14;
    transform: scale(1) translateY(0);
  }
}

@keyframes visualEnter {
  0% {
    opacity: 0;
    transform: scale(0.88) translateY(24px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes textFadeUp {
  0% {
    opacity: 0;
    transform: translateY(16px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes splatterTwinkle {
  0%, 100% {
    opacity: 0.2;
    transform: scale(0.9);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}

.animate-giant-word {
  animation: giantWordFade 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-visual-enter {
  animation: visualEnter 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-text-title {
  animation: textFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both;
}

.animate-text-desc {
  animation: textFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
}

.animate-text-cta {
  animation: textFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both;
}

.splatter-dot {
  animation: splatterTwinkle 3.5s ease-in-out infinite;
}

/* ---------------------------------------------------------------------------
   MODE RINGAN & PREFERS-REDUCED-MOTION (Batasan Keras #4 & #6)
   --------------------------------------------------------------------------- */
.mode-ringan .animate-giant-word,
.mode-ringan .animate-visual-enter,
.mode-ringan .animate-text-title,
.mode-ringan .animate-text-desc,
.mode-ringan .animate-text-cta,
.mode-ringan .splatter-dot {
  animation: none !important;
  transition: none !important;
  opacity: 1 !important;
  transform: none !important;
}

.mode-ringan .animate-giant-word {
  opacity: 0.14 !important;
}

@media (prefers-reduced-motion: reduce) {
  .animate-giant-word,
  .animate-visual-enter,
  .animate-text-title,
  .animate-text-desc,
  .animate-text-cta,
  .splatter-dot {
    animation: none !important;
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
  .animate-giant-word {
    opacity: 0.14 !important;
  }
}

/* Custom Scrollbar for horizontal strip */
.custom-scroll::-webkit-scrollbar {
  height: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
}
</style>
