<template>
  <!-- =========================================================================
       HERO PRODUCT PAGE FULLSCREEN VIEW (Default View - 100dvh Desktop / Projector)
       ========================================================================= -->
  <div
    v-if="currentView === 'hero'"
    class="hero-container min-h-[100dvh] lg:h-[100dvh] w-full overflow-y-auto lg:overflow-hidden flex flex-col justify-between relative select-none text-white font-sans transition-colors duration-700 ease-out"
    :style="{ background: currentTheme.gradient }"
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

      <!-- Student PIN Entry Card (Bila dibuka akun siswa atau mode live portal siswa) -->
      <div
        v-if="isStudent"
        class="relative z-40 bg-black/60 backdrop-blur-md border-b border-cyan-400/40 px-4 py-2.5 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-cyan-200"
      >
        <div class="flex items-center gap-2.5">
          <span class="text-xl">📱</span>
          <div>
            <span class="font-extrabold text-white text-xs">Portal Siswa &bull; Gabung Sesi Live Presentasi</span>
            <p class="text-[10px] text-cyan-300/80">Masukkan kode PIN sesi dari layar proyektor guru di depan kelas.</p>
          </div>
        </div>
        <form @submit.prevent="joinStudentSession()" class="flex items-center gap-2">
          <input
            v-model="studentJoinPin"
            type="text"
            maxlength="10"
            placeholder="PIN SESI (contoh: PRS-123)"
            class="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white font-mono font-bold tracking-widest text-center text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400 uppercase"
          />
          <button
            type="submit"
            class="px-4 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs shadow-md transition whitespace-nowrap cursor-pointer"
          >
            Masuk Sesi 🚀
          </button>
        </form>
      </div>

      <!-- BANNER SESI AKTIF (Under Header or Top of Screen) -->
      <div
        v-if="activeSession"
        class="relative z-40 bg-black/75 backdrop-blur-md border-b border-amber-400/50 px-4 sm:px-8 py-2.5 sm:py-3 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-amber-200"
      >
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center text-lg font-black shrink-0 animate-pulse">
            ⚡
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] uppercase font-black tracking-wider">
                Sedang Tayang Langsung
              </span>
              <span class="text-xs text-white/90 font-medium">
                Kelas {{ activeSession.classroom }} &bull; Slide {{ activeSession.activeSlide || 1 }} / {{ activeSession.totalSlides }}
              </span>
            </div>
            <div class="flex flex-wrap items-center gap-2 mt-0.5">
              <span class="font-bold text-white text-xs truncate max-w-sm">{{ activeSession.title }}</span>
              <span class="text-white/60">&bull;</span>
              <span class="text-[11px] text-white/80">PIN:</span>
              <span class="font-mono font-black text-slate-950 bg-amber-400 px-2 py-0.5 rounded text-xs tracking-wider">{{ activeSession.accessCode }}</span>
              <span class="text-emerald-300 font-bold text-[11px]">&bull; {{ activeSession.connectedCount || 0 }} Siswa Terhubung</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <!-- Button 4: Masuk Layar Kontrol Studio Guru -->
          <router-link
            :to="`/presentations/studio/${activeSession.id}`"
            class="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow transition cursor-pointer flex items-center gap-1.5"
          >
            <span>Masuk Layar Kontrol Studio Guru</span>
            <span>→</span>
          </router-link>

          <!-- Button 5: Buka Layar Siswa -->
          <router-link
            :to="`/presentation-live/${activeSession.accessCode}`"
            target="_blank"
            class="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 transition cursor-pointer flex items-center gap-1"
            title="Buka simulasi tampilan di HP siswa"
          >
            <span>📱</span>
            <span>Buka Layar Siswa</span>
          </router-link>

          <!-- Button 6: Akhiri Sesi -->
          <button
            @click="stopActiveSession"
            class="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs border border-rose-500/30 transition cursor-pointer flex items-center gap-1"
            title="Hentikan dan akhiri sesi tayang langsung ini"
          >
            <span>⏹️</span>
            <span>Akhiri Sesi</span>
          </button>
        </div>
      </div>

      <!-- =========================================================================
           TOP SLIM HEADER (Logo Belajarena, Filter Bar, Unggah Baru, KEMBALI KE DASHBOARD WAJIB)
           ========================================================================= -->
      <header class="relative z-40 px-4 sm:px-8 lg:px-12 py-3 sm:py-3.5 flex items-center justify-between gap-4 border-b border-white/10 backdrop-blur-sm">
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
            LIVE PRESENTASI
          </span>
        </div>

        <!-- Center: Filter & Search Bar Inline (Desktop / Tablet) -->
        <div class="hidden md:flex items-center gap-2 bg-black/25 p-1 px-3 rounded-full border border-white/15 backdrop-blur-md shadow-sm">
          <!-- A2: Kolom Pencarian Teks -->
          <div class="relative flex items-center">
            <span class="absolute left-2.5 text-white/50 text-xs">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari materi..."
              class="pl-7 pr-3 py-1 rounded-full bg-transparent text-xs text-white placeholder-white/50 focus:outline-none w-32 lg:w-44 focus:w-52 transition-all"
            />
          </div>

          <div class="w-px h-4 bg-white/20"></div>

          <!-- A3: Filter Mata Pelajaran -->
          <select
            v-model="filterSubject"
            class="bg-transparent text-xs text-white/90 font-medium focus:outline-none cursor-pointer pr-1"
          >
            <option value="all" class="bg-slate-900 text-white">Semua Mapel</option>
            <option v-for="s in availableSubjects" :key="s" :value="s" class="bg-slate-900 text-white">{{ s }}</option>
          </select>

          <div class="w-px h-4 bg-white/20"></div>

          <!-- A3: Filter Rombel -->
          <select
            v-model="filterClass"
            class="bg-transparent text-xs text-white/90 font-medium focus:outline-none cursor-pointer pr-1"
          >
            <option value="all" class="bg-slate-900 text-white">Semua Rombel</option>
            <option v-for="cls in classrooms" :key="cls.id" :value="cls.name" class="bg-slate-900 text-white">Kelas {{ cls.name }}</option>
          </select>

          <div class="w-px h-4 bg-white/20"></div>

          <!-- A3: Filter Status -->
          <select
            v-model="filterStatus"
            class="bg-transparent text-xs text-white/90 font-medium focus:outline-none cursor-pointer pr-1"
          >
            <option value="all" class="bg-slate-900 text-white">Semua Status</option>
            <option value="ready" class="bg-slate-900 text-white">Siap Ajar</option>
            <option value="processing" class="bg-slate-900 text-white">Konversi...</option>
            <option value="archived" class="bg-slate-900 text-white">Arsip</option>
          </select>
        </div>

        <!-- Right: Action Controls (Unggah Baru, Mode Ringan, KEMBALI KE DASHBOARD WAJIB) -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Toggle Mode Ringan / Reduced Motion -->
          <button
            @click="toggleReducedMotion"
            class="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full border border-white/20 bg-black/25 hover:bg-black/40 text-[11px] font-bold text-white/80 hover:text-white transition cursor-pointer flex items-center gap-1.5 backdrop-blur-sm"
            :title="reducedMotion ? 'Mode Ringan aktif (animasi dimatikan). Klik untuk menyalakan animasi.' : 'Mode Animasi aktif. Klik untuk Mode Ringan.'"
          >
            <span>{{ reducedMotion ? '🌱' : '✨' }}</span>
            <span class="hidden xl:inline">{{ reducedMotion ? 'Mode Ringan' : 'Animasi Halus' }}</span>
          </button>

          <!-- A1: KANAN ATAS WAJIB (a): Tombol Utama Unggah / Buat Materi Baru -->
          <button
            @click="showUploadModal = true"
            class="px-3.5 py-2 sm:px-4 sm:py-2 rounded-full bg-white text-slate-950 hover:bg-white/95 active:scale-95 font-extrabold text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap z-50"
            title="Unggah berkas PPTX, PDF, atau buat modul presentasi baru"
          >
            <span>📤</span>
            <span class="hidden sm:inline">Unggah / Buat Materi Baru</span>
            <span class="sm:hidden">Unggah</span>
          </button>

          <!-- KANAN ATAS WAJIB (b): Tombol Kembali ke Dashboard (Selalu terlihat di semua tema dan ukuran layar) -->
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

      <!-- Mobile Search Bar (Only shown on small screens) -->
      <div class="md:hidden px-4 py-2 bg-black/30 backdrop-blur-md border-b border-white/10 flex items-center gap-2 overflow-x-auto custom-scroll">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari materi..."
          class="px-3 py-1.5 rounded-xl bg-white/10 text-xs text-white placeholder-white/50 border border-white/15 focus:outline-none flex-1 min-w-[130px]"
        />
        <select v-model="filterSubject" class="bg-black/40 text-xs text-white rounded-xl px-2.5 py-1.5 border border-white/15">
          <option value="all">Semua Mapel</option>
          <option v-for="s in availableSubjects" :key="s" :value="s">{{ s }}</option>
        </select>
        <select v-model="filterClass" class="bg-black/40 text-xs text-white rounded-xl px-2.5 py-1.5 border border-white/15">
          <option value="all">Semua Rombel</option>
          <option v-for="cls in classrooms" :key="cls.id" :value="cls.name">Kelas {{ cls.name }}</option>
        </select>
      </div>

      <!-- =========================================================================
           CENTER HERO STAGE (3-Column Layout: Left Copy + Center Visual + Right Selector)
           ========================================================================= -->
      <main class="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-10 py-3 sm:py-5 max-w-[1440px] mx-auto w-full">
        <!-- EMPTY STATE (Bila tidak ada materi yang cocok) -->
        <div
          v-if="filteredPresentations.length === 0"
          class="flex flex-col items-center justify-center text-center p-8 space-y-4 my-auto max-w-lg mx-auto bg-black/30 backdrop-blur-md rounded-3xl border border-white/15 shadow-2xl"
        >
          <div class="text-6xl animate-bounce">📽️</div>
          <h2 class="text-2xl font-black text-white">Tidak Ada Materi Ditemukan</h2>
          <p class="text-xs sm:text-sm text-white/80 leading-relaxed">
            {{ searchQuery || filterSubject !== 'all' || filterClass !== 'all' || filterStatus !== 'all'
               ? 'Tidak ada materi presentasi yang sesuai dengan filter pencarian Anda. Coba bersihkan filter atau kata kunci.'
               : 'Belum ada bahan ajar atau slide presentasi interaktif yang diunggah. Mulai buat presentasi baru sekarang!' }}
          </p>
          <div class="flex items-center gap-3 pt-2">
            <button
              v-if="searchQuery || filterSubject !== 'all' || filterClass !== 'all' || filterStatus !== 'all'"
              @click="resetFilters"
              class="px-5 py-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md transition cursor-pointer"
            >
              Reset Filter
            </button>
            <!-- A1: Tombol pada keadaan kosong / empty state -->
            <button
              @click="showUploadModal = true"
              class="px-6 py-2.5 rounded-full bg-white text-slate-950 font-black text-xs sm:text-sm shadow-xl hover:bg-white/90 active:scale-95 transition cursor-pointer"
            >
              📤 Unggah / Buat Materi Baru
            </button>
          </div>
        </div>

        <!-- 3-COLUMN SHOWCASE LAYOUT (Bila ada materi aktif - Seimbang & Fit Layar Persis Edu Games) -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-12 items-center gap-6 sm:gap-8 lg:gap-8 w-full">
          <!-- -------------------------------------------------------------
               LEFT COLUMN (±25-30% lebar): Label, Judul Sangat Besar, Deskripsi, Tombol Aksi
               ------------------------------------------------------------- -->
          <div class="lg:col-span-3 xl:col-span-3 flex flex-col justify-center text-left space-y-3 sm:space-y-4 z-20 order-2 lg:order-1">
            <!-- Small Label Pill -->
            <div>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white/90 font-black text-[10px] tracking-[0.25em] uppercase border border-white/25 backdrop-blur-md shadow-xs">
                <span>📡</span> LIVE PRESENTASI
              </span>
            </div>

            <!-- Giant Presentation Title (Max 2 baris, ellipsis rapi) -->
            <div :key="`title-${currentPresentation.id}`" class="animate-text-title">
              <h1 class="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white leading-[1.08] tracking-tight drop-shadow-md line-clamp-2">
                {{ currentPresentation.title }}
              </h1>
              <p class="text-xs sm:text-sm font-extrabold text-white/80 tracking-wide mt-1 truncate">
                {{ currentPresentation.subject }} &bull; {{ formatClassroomBadge(currentPresentation) }}
              </p>
            </div>

            <!-- Short 2 Line Material Description -->
            <div :key="`desc-${currentPresentation.id}`" class="animate-text-desc">
              <p class="text-xs sm:text-sm text-white/90 leading-relaxed max-w-md drop-shadow-xs font-medium line-clamp-2">
                {{ currentPresentation.description || 'Slide presentasi interaktif dengan sinkronisasi proyektor cerdas dan mirroring langsung ke HP siswa.' }}
              </p>
            </div>

            <!-- Action Buttons Row (C7-C11) -->
            <div :key="`cta-${currentPresentation.id}`" class="animate-text-cta flex items-center gap-2 pt-1.5 sm:pt-2 flex-wrap">
              <!-- C7: Tombol Utama Buka Sesi Kelas (Pill, High Contrast, Disabled bila not ready) -->
              <button
                @click="openLaunchModal(currentPresentation)"
                :disabled="currentPresentation.status !== 'ready'"
                class="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-2xl hover:bg-white/90 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed group"
                :title="currentPresentation.status !== 'ready' ? 'Materi masih dalam proses atau diarsipkan' : 'Mulai tayangkan materi di proyektor kelas'"
              >
                <span>▶️</span>
                <span>Buka Sesi Kelas</span>
                <span class="group-hover:translate-x-1 transition-transform font-bold">→</span>
              </button>

              <!-- C8: Tombol Sekunder Pratinjau Slide -->
              <button
                @click="previewPresentation(currentPresentation)"
                class="px-3.5 py-2.5 sm:py-3 rounded-full bg-black/25 hover:bg-black/40 text-white font-bold text-xs sm:text-sm border border-white/25 backdrop-blur-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Pratinjau isi halaman slide"
              >
                <span>👁️</span>
                <span>Pratinjau</span>
              </button>

              <!-- C9: Tombol Sekunder Edit -->
              <button
                @click="openEditModal(currentPresentation)"
                class="px-3.5 py-2.5 sm:py-3 rounded-full bg-black/25 hover:bg-black/40 text-white font-bold text-xs sm:text-sm border border-white/25 backdrop-blur-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Edit judul, rombel, dan slide materi"
              >
                <span>✏️</span>
                <span>Edit</span>
              </button>

              <!-- C10: Ikon Duplikasi Slide -->
              <button
                @click="duplicatePresentation(currentPresentation)"
                class="p-2.5 sm:p-3 rounded-full bg-black/25 hover:bg-black/40 text-white/90 hover:text-white border border-white/25 backdrop-blur-md hover:scale-105 active:scale-95 transition cursor-pointer shadow-sm"
                title="Duplikasi Slide Modul Ini"
              >
                📋
              </button>

              <!-- C11: Ikon Hapus Materi (Konfirmasi seperti sekarang) -->
              <button
                @click="deletePresentation(currentPresentation)"
                class="p-2.5 sm:p-3 rounded-full bg-rose-600/30 hover:bg-rose-600/80 text-rose-200 hover:text-white border border-rose-400/30 backdrop-blur-md hover:scale-105 active:scale-95 transition cursor-pointer shadow-sm"
                title="Hapus Materi Presentasi"
              >
                🗑️
              </button>
            </div>
          </div>

          <!-- -------------------------------------------------------------
               CENTER COLUMN (±50% lebar): Kata Raksasa di Belakang + Pratinjau Slide Pertama (Fit Layar Pas)
               ------------------------------------------------------------- -->
          <div class="lg:col-span-6 xl:col-span-6 relative flex items-center justify-center min-h-[260px] sm:min-h-[320px] lg:min-h-[380px] z-10 order-1 lg:order-2">
            <!-- KATA RAKSASA DI TENGAH LAYAR DI BELAKANG VISUAL UTAMA -->
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
              <span
                :key="`giant-${currentPresentation.id}`"
                class="font-black tracking-tighter uppercase text-white/[0.14] select-none leading-none animate-giant-word font-sans text-center px-2"
                style="font-size: clamp(4.5rem, 15vw, 15rem);"
              >
                {{ currentGiantWord }}
              </span>
            </div>

            <!-- VISUAL UTAMA: PRATINJAU SLIDE PERTAMA MATERI (FIT LAYAR SEIMBANG PERSIS EDU GAMES) -->
            <div
              :key="`visual-${currentPresentation.id}`"
              class="relative z-10 w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl max-h-[46vh] sm:max-h-[48vh] aspect-video animate-visual-enter transition-transform duration-500"
            >
              <div class="w-full h-full rounded-3xl overflow-hidden border-2 border-white/25 shadow-[0_25px_50px_rgba(0,0,0,0.6)] relative group flex flex-col justify-between bg-black/40 backdrop-blur-md">
                <!-- Thumbnail Gambar Slide Pertama (Jika Ada Gambar/Visual Slide 1) -->
                <div v-if="getFirstSlide(currentPresentation).image" class="absolute inset-0 bg-[#0c2b3d] flex items-center justify-center overflow-hidden">
                  <img
                    :src="getFirstSlide(currentPresentation).image"
                    :alt="getFirstSlide(currentPresentation).title || currentPresentation.title"
                    class="w-full h-full object-contain select-none transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <!-- Gradient Overlay untuk keterbacaan badge dan teks keterangan -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 pointer-events-none"></div>

                  <!-- Keterangan Slide 1 di bagian bawah gambar -->
                  <div class="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-white pointer-events-none">
                    <span class="text-xs sm:text-sm font-bold truncate max-w-[70%] drop-shadow text-white">
                      Slide 1 &bull; {{ getFirstSlide(currentPresentation).title }}
                    </span>
                    <span class="font-mono text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[#f59e0b] border border-white/10 shrink-0">
                      {{ currentPresentation.slideCount || currentPresentation.slides?.length || 1 }} Slide
                    </span>
                  </div>
                </div>

                <!-- Thumbnail Tampilan Kanvas Slide Pertama (Jika Slide 1 Berupa Teks/Konten Modul) -->
                <div v-else class="absolute inset-0 bg-gradient-to-br from-[#0c2b3d] via-[#10384f] to-[#082231] p-5 sm:p-7 flex flex-col justify-between overflow-hidden select-none">
                  <div class="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

                  <!-- Header Mini Kanvas Slide -->
                  <div class="pt-5 flex items-center justify-between text-xs text-cyan-300 font-bold opacity-90 z-10">
                    <span class="tracking-wider uppercase">Slide 1 &bull; Pembuka</span>
                    <span class="font-mono text-[#f59e0b] font-bold">{{ currentPresentation.slideCount || currentPresentation.slides?.length || 1 }} Slide</span>
                  </div>

                  <!-- Body Mini Slide -->
                  <div class="relative z-10 my-auto text-center px-4 py-1.5 transform transition-transform duration-500 ease-out group-hover:scale-105">
                    <div class="w-12 h-12 mx-auto rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl shadow-inner mb-2.5 text-white">
                      {{ getFirstSlide(currentPresentation).icon }}
                    </div>
                    <h4 class="font-black text-sm sm:text-base lg:text-lg text-white line-clamp-2 leading-snug px-2 drop-shadow">
                      {{ getFirstSlide(currentPresentation).title }}
                    </h4>
                    <p class="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed max-w-md mx-auto">
                      {{ getFirstSlide(currentPresentation).content }}
                    </p>
                  </div>

                  <!-- Footer Mini Slide -->
                  <div class="relative z-10 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/10 pt-2">
                    <span class="truncate max-w-[65%]">{{ currentPresentation.title }}</span>
                    <span class="font-mono text-[#f59e0b] font-bold">16:9 Studio</span>
                  </div>
                </div>

                <!-- Floating Badges di Visual Utama (Wajib Selalu Terlihat) -->
                <!-- Badge Mapel • Rombel di Kiri Atas -->
                <span class="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-0.5 rounded-xl border border-white/25 max-w-[65%] truncate z-20 shadow-md">
                  {{ currentPresentation.subject }} &bull; {{ formatClassroomBadge(currentPresentation) }}
                </span>

                <!-- Badge Status di Kanan Atas ("Siap Ajar" / "Konversi..." / "Arsip") -->
                <span
                  :class="[
                    'text-[10px] sm:text-xs uppercase font-black absolute top-3 right-3 z-20 px-2.5 py-0.5 rounded-full shadow-md backdrop-blur-sm',
                    currentPresentation.status === 'ready'
                      ? 'bg-emerald-500 text-white border border-emerald-400/40'
                      : currentPresentation.status === 'processing'
                        ? 'bg-amber-400 text-slate-950 border border-amber-300'
                        : 'bg-slate-300 text-slate-900 border border-slate-200'
                  ]"
                >
                  {{ currentPresentation.status === 'ready' ? 'Siap Ajar' : currentPresentation.status === 'processing' ? 'Konversi...' : 'Arsip' }}
                </span>
              </div>
            </div>
          </div>

          <!-- -------------------------------------------------------------
               RIGHT COLUMN (±25% lebar): Pemilih Titik Warna + Chip Info Materi (Pola Edu Games)
               ------------------------------------------------------------- -->
          <div class="lg:col-span-3 xl:col-span-3 flex flex-col justify-center text-left lg:text-right space-y-3 sm:space-y-4 z-20 order-3">
            <!-- "PILIH MATERI" Label -->
            <div class="flex items-center justify-between lg:justify-end">
              <span class="text-[10px] font-black uppercase tracking-[0.25em] text-white/70">
                Pilih Materi
              </span>
              <span class="text-[10px] font-bold text-white/60">
                {{ activePresentationIndex + 1 }} dari {{ filteredPresentations.length }}
              </span>
            </div>

            <!-- Titik Warna (Choose Your Material Color Dots) -->
            <div class="flex items-center gap-2 lg:justify-end flex-wrap py-1">
              <button
                v-for="(item, idx) in filteredPresentations"
                :key="item.id"
                @click="selectPresentation(idx)"
                class="transition-all duration-300 rounded-full cursor-pointer relative flex items-center justify-center"
                :class="idx === activePresentationIndex
                  ? 'w-7 h-7 sm:w-8 sm:h-8 ring-4 ring-white shadow-[0_0_20px_rgba(255,255,255,0.7)] scale-110 z-10'
                  : 'w-5 h-5 sm:w-6 sm:h-6 opacity-70 hover:opacity-100 hover:scale-110'"
                :style="{ backgroundColor: getPresentationTheme(item).themeColor }"
                :title="`${item.title} (${getGiantWord(item)})`"
              >
                <span v-if="idx === activePresentationIndex" class="w-1.5 h-1.5 rounded-full bg-white shadow-xs"></span>
              </button>
            </div>

            <!-- Active Material Name Indicator Under Dots -->
            <div>
              <p class="text-white font-black text-sm tracking-wide truncate">
                {{ currentPresentation.title }}
              </p>
              <p class="text-[11px] font-bold text-white/70">
                Tema: <span class="capitalize">{{ currentTheme.themeName }}</span>
              </p>
            </div>

            <!-- Chip Info Materi Berbentuk Pill (Sama Persis dengan Edu Games: 3 Chip) -->
            <div :key="`chips-${currentPresentation.id}`" class="space-y-2 w-full max-w-xs lg:ml-auto animate-text-desc">
              <div
                v-for="(chip, cIdx) in currentChips"
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
           BOTTOM BAR (Mini Cards Strip, Prev/Next Arrows, & "Lihat Semua Materi" Button)
           ========================================================================= -->
      <footer class="relative z-30 px-4 sm:px-8 lg:px-12 py-2.5 sm:py-3.5 border-t border-white/10 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <!-- Mini Cards Strip + Navigation Arrows -->
        <div class="flex items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto py-1 custom-scroll">
          <!-- Prev Arrow -->
          <button
            @click="prevPresentation"
            class="w-8 h-8 rounded-full bg-black/25 hover:bg-black/50 border border-white/20 text-white font-bold flex items-center justify-center transition active:scale-95 cursor-pointer flex-shrink-0"
            title="Materi Sebelumnya (Panah Kiri)"
          >
            ‹
          </button>

          <!-- Mini Cards Strip -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <button
              v-for="(item, idx) in filteredPresentations"
              :key="item.id"
              @click="selectPresentation(idx)"
              class="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl border transition-all flex items-center gap-2 cursor-pointer text-left"
              :class="idx === activePresentationIndex
                ? 'bg-white/25 border-white shadow-lg scale-105 ring-2 ring-white/50'
                : 'bg-black/20 border-white/10 opacity-70 hover:opacity-100 hover:bg-black/30'"
            >
              <div class="w-7 h-5 rounded bg-black/40 overflow-hidden shrink-0 flex items-center justify-center text-[9px]">
                <img v-if="getFirstSlide(item).image" :src="getFirstSlide(item).image" class="w-full h-full object-cover" />
                <span v-else>{{ getFirstSlide(item).icon }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-black text-white whitespace-nowrap max-w-[120px] truncate">{{ item.title }}</span>
                <span class="text-[9px] font-bold text-white/70">{{ getGiantWord(item) }}</span>
              </div>
            </button>
          </div>

          <!-- Next Arrow -->
          <button
            @click="nextPresentation"
            class="w-8 h-8 rounded-full bg-black/25 hover:bg-black/50 border border-white/20 text-white font-bold flex items-center justify-center transition active:scale-95 cursor-pointer flex-shrink-0"
            title="Materi Berikutnya (Panah Kanan)"
          >
            ›
          </button>

          <!-- Keyboard Shortcut Helper (Hidden on Mobile) -->
          <span class="hidden xl:inline-flex items-center gap-1 text-[10px] text-white/60 font-medium ml-2">
            Gunakan <kbd class="px-1.5 py-0.5 rounded bg-white/15 text-white font-mono text-[9px]">←</kbd> <kbd class="px-1.5 py-0.5 rounded bg-white/15 text-white font-mono text-[9px]">→</kbd> ganti materi &bull; <kbd class="px-1.5 py-0.5 rounded bg-white/15 text-white font-mono text-[9px]">Enter</kbd> buka sesi
          </span>
        </div>

        <!-- Button "Lihat Semua Materi" -> Buka Grid Pustaka Lama -->
        <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            @click="currentView = 'catalog'"
            class="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 border border-white/25 text-white font-black text-xs transition flex items-center justify-center gap-2 backdrop-blur-md shadow-md cursor-pointer whitespace-nowrap"
          >
            <span>📂</span>
            <span>Lihat Semua Materi (Katalog & Pustaka)</span>
          </button>
        </div>
      </footer>
    </div>

    <!-- =========================================================================
         SECONDARY VIEW: KATALOG GRID LAMA & PUSTAKA MATERI AJAR
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
            <span>Kembali ke Mode Showcase (Hero)</span>
          </button>
          <span class="text-xs text-slate-300 hidden sm:inline">
            Live Presentasi &bull; Pustaka Modul Klasik & Riwayat Sesi
          </span>
        </div>
        <div class="flex items-center gap-2">
          <!-- A1: Tombol Unggah di Catalog View -->
          <button
            @click="showUploadModal = true"
            class="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>📤</span> <span>Unggah / Buat Modul</span>
          </button>
          <router-link
            to="/dashboard"
            class="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition flex items-center gap-1.5"
          >
            <span>🏠</span> <span>Dashboard Guru</span>
          </router-link>
        </div>
      </div>

      <!-- Student PIN Entry Card (Catalog View) -->
      <div
        v-if="isStudent"
        class="p-6 rounded-[24px] bg-gradient-to-br from-[#0c2b3d] to-[#164e63] text-white shadow-xl border-2 border-cyan-400/40 relative overflow-hidden"
      >
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-cyan-400 text-slate-950 flex items-center justify-center text-3xl font-black shadow-lg">
              📱
            </div>
            <div>
              <span class="px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-bold uppercase tracking-wider">
                Portal Siswa
              </span>
              <h2 class="text-lg font-black text-white mt-1">Gabung Sesi Live Presentasi</h2>
              <p class="text-xs text-slate-300 mt-0.5">
                Masukkan kode PIN yang ditampilkan oleh guru di layar proyektor kelas.
              </p>
            </div>
          </div>

          <form @submit.prevent="joinStudentSession()" class="flex items-center gap-2">
            <input
              v-model="studentJoinPin"
              type="text"
              maxlength="10"
              placeholder="Contoh: 849201"
              class="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-mono font-bold tracking-widest text-center text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-slate-400 uppercase"
            />
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs shadow-md transition whitespace-nowrap"
            >
              Masuk Sesi 🚀
            </button>
          </form>
        </div>
      </div>

      <!-- Top 4 Stat Cards Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Card 1: Total Modul Presentasi -->
        <div class="p-5 rounded-[24px] bg-[#0c2b3d] text-white shadow-card border border-white/10 flex flex-col justify-between group">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-300">Total Modul Presentasi</span>
              <div class="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-base shadow-inner">
                📽️
              </div>
            </div>
            <div class="mt-3">
              <div class="text-3xl font-black text-white tracking-tight leading-none">
                {{ presentations.length }}
              </div>
              <p class="text-[11px] text-slate-300 font-medium mt-1">
                Modul Ajar Digital Terdata
              </p>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300/90 group-hover:text-white transition">
            <button @click="showUploadModal = true" class="flex items-center justify-between w-full">
              <span>+ Buat / Unggah Modul</span>
              <span class="font-bold transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>

        <!-- Card 2: Slide Siap Tayang -->
        <div class="p-5 rounded-[24px] bg-[#f59e0b] text-slate-950 shadow-card border border-amber-300 flex flex-col justify-between group">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-900/80">Slide Siap Tayang</span>
              <div class="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center text-slate-950 text-base shadow-inner">
                📑
              </div>
            </div>
            <div class="mt-3">
              <div class="text-3xl font-black text-slate-950 tracking-tight leading-none">
                {{ totalReadySlides }}
              </div>
              <p class="text-[11px] text-slate-900/80 font-semibold mt-1">
                Halaman Slide Interaktif
              </p>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-xs text-slate-900/80 group-hover:text-slate-950 font-bold transition">
            <span>Format PPTX & PDF</span>
            <span class="font-black">✓ Siap Digunakan</span>
          </div>
        </div>

        <!-- Card 3: Total Sesi Terlaksana -->
        <div class="p-5 rounded-[24px] bg-[#0c2b3d] text-white shadow-card border border-white/10 flex flex-col justify-between group">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-300">Total Sesi Terlaksana</span>
              <div class="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-base shadow-inner">
                🏫
              </div>
            </div>
            <div class="mt-3">
              <div class="text-3xl font-black text-white tracking-tight leading-none">
                {{ totalSessionsDone }}
              </div>
              <p class="text-[11px] text-emerald-300 font-semibold mt-1">
                Sesi Kelas di Layar Proyektor
              </p>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300/90 group-hover:text-white transition">
            <span>Mirroring Proyektor</span>
            <span class="font-bold">{{ currentSchoolName }}</span>
          </div>
        </div>

        <!-- Card 4: Status Studio Live -->
        <div class="p-5 rounded-[24px] bg-[#082231] text-white shadow-card border border-white/10 flex flex-col justify-between group">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-300">Status Studio Live</span>
              <div class="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white text-base shadow-inner">
                ⚡
              </div>
            </div>
            <div class="mt-3">
              <div class="text-3xl font-black text-white tracking-tight leading-none">
                {{ activeSession ? 'Aktif' : 'Standby' }}
              </div>
              <p class="text-[11px] text-slate-300 font-medium mt-1 truncate">
                {{ activeSession ? `${activeSession.classroom} · PIN: ${activeSession.accessCode}` : 'Siap Tayang ke HP Siswa' }}
              </p>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300/90 group-hover:text-white transition">
            <span>Mirroring Real-Time</span>
            <span class="font-bold">{{ activeSession ? '🟢 ON AIR' : '⚪ STANDBY' }}</span>
          </div>
        </div>
      </div>

      <!-- Active Live Session Banner (Catalog View) -->
      <div
        v-if="activeSession"
        class="p-6 rounded-[24px] bg-[#0c2b3d] text-white shadow-xl border-2 border-[#f59e0b]/60 flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative overflow-hidden"
      >
        <div class="flex items-center gap-4 relative z-10">
          <div class="w-14 h-14 rounded-2xl bg-[#f59e0b] text-slate-950 flex items-center justify-center text-2xl font-black shadow-lg animate-pulse shrink-0">
            ⚡
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-[#f59e0b] text-slate-950 text-[10px] uppercase font-black tracking-wider">Sedang Tayang Langsung</span>
              <span class="text-xs text-slate-300 font-medium">Kelas {{ activeSession.classroom }} &bull; Slide {{ activeSession.activeSlide || 1 }} / {{ activeSession.totalSlides }}</span>
            </div>
            <h2 class="text-lg font-black text-white mt-1">{{ activeSession.title }}</h2>
            <p class="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2">
              <span>PIN Bergabung Siswa:</span>
              <span class="font-mono font-black text-slate-950 bg-[#f59e0b] px-2.5 py-0.5 rounded-lg text-xs tracking-widest shadow-xs">{{ activeSession.accessCode }}</span>
              <span class="text-emerald-400 font-bold">&bull; {{ activeSession.connectedCount || 0 }} Siswa Terhubung</span>
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2.5 relative z-10">
          <!-- Button 4 -->
          <router-link
            :to="`/presentations/studio/${activeSession.id}`"
            class="px-5 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <span>Masuk Layar Kontrol Studio Guru</span>
            <span>→</span>
          </router-link>
          <!-- Button 5 -->
          <router-link
            :to="`/presentation-live/${activeSession.accessCode}`"
            target="_blank"
            class="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition flex items-center gap-1.5"
            title="Buka simulasi tampilan di HP siswa"
          >
            <span>📱</span> Buka Layar Siswa
          </router-link>
          <!-- Button 6 -->
          <button
            @click="stopActiveSession"
            class="px-3.5 py-2.5 bg-rose-600/80 hover:bg-rose-700 text-white text-xs font-bold rounded-xl border border-rose-500/30 transition flex items-center gap-1 cursor-pointer"
            title="Hentikan dan akhiri sesi tayang langsung ini"
          >
            <span>⏹️</span> Akhiri Sesi
          </button>
        </div>
      </div>

      <!-- Filter & Search Bar Card (Catalog View) -->
      <div class="bg-white rounded-[24px] shadow-sm border border-slate-200/80 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <!-- A3: Filter Mapel -->
          <div>
            <select v-model="filterSubject" class="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition">
              <option value="all">Semua Mata Pelajaran</option>
              <option v-for="s in availableSubjects" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <!-- A3: Filter Rombel -->
          <div>
            <select v-model="filterClass" class="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition">
              <option value="all">Semua Rombel</option>
              <option v-for="cls in classrooms" :key="cls.id" :value="cls.name">Kelas {{ cls.name }}</option>
            </select>
          </div>
          <!-- A3: Filter Status -->
          <div>
            <select v-model="filterStatus" class="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition">
              <option value="all">Semua Status</option>
              <option value="ready">Siap Presentasi</option>
              <option value="processing">Sedang Diproses</option>
              <option value="archived">Diarsipkan</option>
            </select>
          </div>
        </div>

        <!-- A2: Kolom Pencarian -->
        <div class="w-full sm:w-72">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari materi presentasi..."
              class="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition"
            />
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="bg-white rounded-[24px] shadow-sm border border-slate-200/60 p-6 animate-pulse space-y-4">
          <div class="h-36 bg-slate-150 rounded-2xl"></div>
          <div class="h-4 bg-slate-150 rounded w-2/3"></div>
          <div class="h-8 bg-slate-150 rounded"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredPresentations.length === 0" class="bg-white rounded-[24px] shadow-sm border border-slate-200/60 p-12 text-center space-y-4">
        <div class="text-5xl">📽️</div>
        <h2 class="text-lg font-bold text-slate-900">Belum Ada Materi Presentasi</h2>
        <p class="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Belum ada bahan ajar atau slide presentasi interaktif yang diunggah. Mulai buat presentasi baru atau unggah berkas PPTX/PDF untuk rombongan belajar Anda.
        </p>
        <!-- A1: Tombol pada keadaan kosong / empty state -->
        <button
          @click="showUploadModal = true"
          class="px-5 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#082231] text-white font-bold text-xs shadow-md transition inline-flex items-center gap-2 cursor-pointer"
        >
          <span>📤 Unggah Materi Presentasi Baru</span>
        </button>
      </div>

      <!-- Presentation Cards Grid (Catalog View) -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="item in filteredPresentations"
          :key="item.id"
          class="bg-white rounded-[24px] shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group"
        >
          <!-- Slide Preview Banner / Thumbnail Slide 1 -->
          <div class="relative aspect-video bg-[#0c2b3d] flex flex-col justify-between overflow-hidden border-b border-slate-100">
            <!-- Thumbnail Gambar Slide Pertama -->
            <div v-if="getFirstSlide(item).image" class="absolute inset-0 bg-[#0c2b3d] flex items-center justify-center overflow-hidden">
              <img
                :src="getFirstSlide(item).image"
                :alt="getFirstSlide(item).title || item.title"
                class="w-full h-full object-contain select-none transition-transform duration-500 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 pointer-events-none"></div>

              <div class="absolute bottom-2.5 left-3.5 right-3.5 z-10 flex items-center justify-between text-white pointer-events-none">
                <span class="text-[11px] font-bold truncate max-w-[70%] drop-shadow text-white">
                  Slide 1 &bull; {{ getFirstSlide(item).title }}
                </span>
                <span class="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[#f59e0b] border border-white/10 shrink-0">
                  {{ item.slideCount || item.slides?.length || 1 }} Slide
                </span>
              </div>
            </div>

            <!-- Thumbnail Tampilan Kanvas Slide Pertama -->
            <div v-else class="absolute inset-0 bg-gradient-to-br from-[#0c2b3d] via-[#10384f] to-[#082231] p-5 flex flex-col justify-between overflow-hidden select-none">
              <div class="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

              <div class="pt-5 flex items-center justify-between text-[9px] text-cyan-300 font-bold opacity-90 z-10">
                <span class="tracking-wider uppercase">Slide 1 &bull; Pembuka</span>
                <span class="font-mono text-[#f59e0b] font-bold">{{ item.slideCount || item.slides?.length || 1 }} Slide</span>
              </div>

              <div class="relative z-10 my-auto text-center px-2 py-1 transform transition-transform duration-500 ease-out group-hover:scale-105">
                <div class="w-10 h-10 mx-auto rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-lg shadow-inner mb-2 text-white">
                  {{ getFirstSlide(item).icon }}
                </div>
                <h4 class="font-black text-xs sm:text-sm text-white line-clamp-2 leading-snug px-2 drop-shadow">
                  {{ getFirstSlide(item).title }}
                </h4>
                <p class="text-[10px] text-slate-300 line-clamp-2 mt-1 leading-relaxed max-w-xs mx-auto">
                  {{ getFirstSlide(item).content }}
                </p>
              </div>

              <div class="relative z-10 flex items-center justify-between text-[8px] text-slate-400 border-t border-white/10 pt-1.5">
                <span class="truncate max-w-[65%]">{{ item.title }}</span>
                <span class="font-mono text-[#f59e0b] font-bold">16:9 Studio</span>
              </div>
            </div>

            <!-- Floating Badges -->
            <span class="text-[10px] uppercase font-bold tracking-wider absolute top-3 left-3 bg-[#0c2b3d]/80 backdrop-blur-md text-white px-2.5 py-1 rounded-xl border border-white/20 max-w-[65%] truncate z-10 shadow-sm">
              {{ item.subject }} &bull; {{ formatClassroomBadge(item) }}
            </span>

            <span
              :class="[
                'text-[10px] uppercase font-bold absolute top-3 right-3 z-10 px-2.5 py-0.5 rounded-full shadow-sm',
                item.status === 'ready' ? 'bg-emerald-500 text-white font-bold' : item.status === 'processing' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-200 text-slate-700 font-bold'
              ]"
            >
              {{ item.status === 'ready' ? 'Siap Ajar' : item.status === 'processing' ? 'Konversi...' : 'Arsip' }}
            </span>

            <!-- Quick Actions on Hover -->
            <div class="absolute inset-0 bg-[#0c2b3d]/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2.5 p-4 z-20">
              <div class="text-xs text-[#f59e0b] font-mono font-bold mb-1">
                Slide 1 dari {{ item.slideCount || item.slides?.length || 1 }} Halaman
              </div>
              <div class="flex items-center gap-2">
                <!-- C8 -->
                <button
                  @click="previewPresentation(item)"
                  class="px-3.5 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
                >
                  <span>👁️</span> Pratinjau
                </button>
                <!-- C9 -->
                <button
                  @click="openEditModal(item)"
                  class="px-3.5 py-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 text-xs font-bold shadow-md flex items-center gap-1 active:scale-95 transition cursor-pointer"
                >
                  <span>✏️</span> Edit
                </button>
                <!-- C7 -->
                <button
                  v-if="item.status === 'ready'"
                  @click="openLaunchModal(item)"
                  class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md flex items-center gap-1 active:scale-95 transition cursor-pointer"
                >
                  <span>🚀</span> Mulai
                </button>
              </div>
            </div>
          </div>

          <!-- Meta Information -->
          <div class="p-5 space-y-3">
            <div>
              <h3 class="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition">
                {{ item.title }}
              </h3>
              <p class="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                {{ item.description || 'Tidak ada deskripsi pengantar materi.' }}
              </p>
            </div>

            <div class="flex flex-wrap gap-1.5" v-if="item.tags && item.tags.length">
              <span
                v-for="(t, i) in item.tags"
                :key="i"
                class="px-2.5 py-0.5 rounded-lg text-[10px] bg-slate-100 text-slate-600 font-medium"
              >
                #{{ t }}
              </span>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Digunakan: <strong class="text-slate-700">{{ item.sessionCount || 0 }}x Sesi</strong></span>
              <span>Update: {{ item.updatedAt || 'Baru saja' }}</span>
            </div>
          </div>

          <!-- Action Toolbar with All Buttons (C7-C11) -->
          <div class="p-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
            <div class="flex items-center gap-1">
              <!-- C8 -->
              <button
                @click="previewPresentation(item)"
                class="p-2 rounded-xl text-blue-600 hover:bg-blue-50 text-xs transition cursor-pointer"
                title="Pratinjau Slide"
              >
                👁️
              </button>
              <!-- C9 -->
              <button
                @click="openEditModal(item)"
                class="p-2 rounded-xl text-amber-600 hover:bg-amber-50 text-xs transition cursor-pointer"
                title="Edit Materi Presentasi"
              >
                ✏️
              </button>
              <!-- C10 -->
              <button
                @click="duplicatePresentation(item)"
                class="p-2 rounded-xl text-slate-500 hover:bg-slate-200 text-xs transition cursor-pointer"
                title="Duplikasi Slide"
              >
                📋
              </button>
              <!-- C11 -->
              <button
                @click="deletePresentation(item)"
                class="p-2 rounded-xl text-rose-500 hover:bg-rose-50 text-xs transition cursor-pointer"
                title="Hapus"
              >
                🗑️
              </button>
            </div>

            <!-- C7: Buka Sesi Kelas -->
            <button
              @click="openLaunchModal(item)"
              :disabled="item.status !== 'ready'"
              class="px-4 py-2 rounded-xl bg-[#0c2b3d] hover:bg-[#082231] text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>▶️</span> Buka Sesi Kelas
            </button>
          </div>
        </div>
      </div>
    </div>

  <!-- =========================================================================
       MODALS (TELEPORTED TO BODY FOR PROPER VIEWPORT LAYERING)
       ========================================================================= -->
  <Teleport to="body">
    <!-- =========================================================================
         MODAL 1: UNGGAH PRESENTASI (PPTX / PDF / FORM BARU) - Persis Original
         ========================================================================= -->
    <div
      v-if="showUploadModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
      @click.self="showUploadModal = false"
    >
      <div class="bg-white rounded-[28px] shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200/80 animate-scale-up">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-base font-bold text-slate-900">Buat / Unggah Materi Presentasi</h3>
            <p class="text-xs text-slate-500">Mendukung berkas PPTX, PDF, atau buat modul slide baru</p>
          </div>
          <button @click="showUploadModal = false" class="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer">✕</button>
        </div>

        <form @submit.prevent="submitUpload" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Judul Materi Pembelajaran <span class="text-rose-500">*</span></label>
            <input
              v-model="uploadForm.title"
              type="text"
              placeholder="Contoh: Pengenalan Jaringan Komputer & Internet"
              class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition"
              required
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Mata Pelajaran</label>
            <select v-model="uploadForm.subject" class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition">
              <option v-for="s in availableSubjects" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block font-bold text-slate-700 mb-0">Rombel Sasaran (Bisa Pilih > 1 Kelas) <span class="text-rose-500">*</span></label>
              <button
                type="button"
                @click="toggleSelectAllUploadClasses"
                class="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
              >
                {{ uploadForm.classroom_ids.length === classrooms.length ? 'Batal Pilih Semua' : 'Pilih Semua Kelas' }}
              </button>
            </div>

            <div class="p-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 max-h-36 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
              <label
                v-for="cls in classrooms"
                :key="cls.id"
                :class="[
                  'flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs cursor-pointer select-none transition-all',
                  uploadForm.classroom_ids.includes(cls.id)
                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                ]"
              >
                <input
                  type="checkbox"
                  :value="cls.id"
                  :checked="uploadForm.classroom_ids.includes(cls.id)"
                  @change="toggleUploadClass(cls.id)"
                  class="rounded text-[#0c2b3d] focus:ring-[#0c2b3d]"
                />
                <span class="truncate">Kelas {{ cls.name }}</span>
              </label>
            </div>
            <p class="text-[10px] text-slate-400 mt-1">
              Terpilih: {{ getSelectedClassroomsLabel(uploadForm.classroom_ids) }}
            </p>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Deskripsi Singkat / Catatan Pengantar</label>
            <textarea
              v-model="uploadForm.description"
              rows="2"
              placeholder="Tuliskan tujuan pembelajaran atau ringkasan topik bahasan..."
              class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition"
            ></textarea>
          </div>

          <!-- Area Upload Drag-and-Drop Berkas -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">Unggah Berkas Slide (PPTX / PPT / PDF) - Opsional</label>
            <div
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
              @click="triggerFileInput"
              :class="[
                'border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5',
                isDragging ? 'border-[#0c2b3d] bg-blue-50/50' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              ]"
            >
              <input
                ref="fileInputRef"
                type="file"
                accept=".pptx,.ppt,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint"
                class="hidden"
                @change="handleFileChange"
              />
              <span class="text-2xl">📄</span>
              <div v-if="!selectedFile">
                <span class="font-bold text-slate-700">Tarik berkas ke sini atau klik untuk memilih</span>
                <p class="text-[10px] text-slate-400 mt-0.5">Mendukung PowerPoint (.pptx) & Dokumen PDF (Maks. 50 MB)</p>
              </div>
              <div v-else class="text-left w-full bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div class="truncate max-w-[80%]">
                  <span class="font-bold text-slate-800 text-xs block truncate">{{ selectedFile.name }}</span>
                  <span class="text-[10px] text-slate-400">{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB</span>
                </div>
                <button
                  type="button"
                  @click.stop="selectedFile = null"
                  class="text-rose-500 hover:text-rose-700 font-bold text-xs p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <div v-if="isUploading" class="space-y-1">
            <div class="flex justify-between text-[10px] font-bold text-slate-600">
              <span>{{ uploadStatusText || 'Memproses Konversi Slide...' }}</span>
              <span>{{ uploadProgress }}%</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div class="bg-[#0c2b3d] h-1.5 rounded-full transition-all duration-300" :style="{ width: `${uploadProgress}%` }"></div>
            </div>
          </div>

          <div class="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              @click="showUploadModal = false"
              class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isUploading || !uploadForm.title"
              class="px-5 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#082231] text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {{ isUploading ? 'Menyimpan Materi...' : 'Simpan Materi' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- =========================================================================
         MODAL 2: PELUNCURAN SESI BARU (START SESSION) - Persis Original
         ========================================================================= -->
    <div
      v-if="launchingItem"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
      @click.self="launchingItem = null"
    >
      <div class="bg-white rounded-[28px] shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200/80 animate-scale-up">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 class="text-base font-bold text-slate-900">Mulai Sesi Presentasi Langsung</h3>
            <p class="text-xs text-slate-500 truncate max-w-xs">{{ launchingItem.title }}</p>
          </div>
          <button @click="launchingItem = null" class="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer">✕</button>
        </div>

        <form @submit.prevent="confirmLaunchSession" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Judul Sesi</label>
            <input
              v-model="sessionForm.title"
              type="text"
              class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block font-bold text-slate-700 mb-0">Pilih Rombel Siswa</label>
                <span v-if="availableLaunchClassrooms.length > 0" class="text-[10px] text-slate-400 font-medium">
                  {{ availableLaunchClassrooms.length }} Kelas Terpilih
                </span>
              </div>
              <select v-model="sessionForm.classroom" class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition" required>
                <!-- Opsi gabungan jika materi diperuntukkan lebih dari satu kelas -->
                <option
                  v-if="availableLaunchClassrooms.length > 1"
                  :value="availableLaunchClassrooms.map(c => c.name).join(', ')"
                >
                  Gabungan ({{ availableLaunchClassrooms.map(c => 'Kelas ' + c.name).join(', ') }})
                </option>
                <!-- Daftar kelas yang khusus terpilih untuk materi ini -->
                <option v-for="cls in availableLaunchClassrooms" :key="cls.id" :value="cls.name">
                  Kelas {{ cls.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Kode PIN Sesi</label>
              <input
                v-model="sessionForm.accessCode"
                type="text"
                class="w-full px-3 py-2 rounded-xl font-mono font-black text-center uppercase tracking-widest text-slate-950 bg-[#f59e0b]/20 border border-[#f59e0b]/40 text-xs"
                required
              />
            </div>
          </div>

          <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
            <span class="font-bold text-slate-800 block text-[11px] uppercase tracking-wide">Pengaturan Partisipasi Siswa:</span>
            <label class="flex items-center gap-2 cursor-pointer text-slate-700">
              <input type="checkbox" v-model="sessionForm.allowAnonymous" class="rounded text-[#0c2b3d] focus:ring-[#0c2b3d]" />
              <span>Izinkan opsi voting anonim</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer text-slate-700">
              <input type="checkbox" v-model="sessionForm.allowChangeAnswer" class="rounded text-[#0c2b3d] focus:ring-[#0c2b3d]" />
              <span>Siswa boleh mengubah respon sebelum waktu ditutup</span>
            </label>
          </div>

          <div class="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              @click="launchingItem = null"
              class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#082231] text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              🚀 Masuk Studio Presenter
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- =========================================================================
         MODAL 3: PRATINJAU SLIDE INTERAKTIF - Persis Original
         ========================================================================= -->
    <div
      v-if="previewItem"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fade-in"
      @click.self="previewItem = null"
    >
      <div class="bg-[#0c2b3d] text-white rounded-[28px] shadow-2xl max-w-4xl w-full p-6 space-y-4 border border-white/10 animate-scale-up">
        <div class="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] bg-white/15 text-white border border-white/20 font-bold">
                {{ previewItem.subject }} &bull; Kelas {{ previewItem.classroom }}
              </span>
              <span class="text-xs text-[#f59e0b] font-mono font-bold">
                Slide {{ previewSlideIndex + 1 }} dari {{ totalSlidesCount }}
              </span>
            </div>
            <h3 class="font-black text-lg text-white mt-1">{{ previewItem.title }}</h3>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="openEditModal(previewItem); previewItem = null"
              class="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>✏️</span> Edit Materi
            </button>
            <button @click="previewItem = null" class="text-slate-400 hover:text-white text-xl p-1 font-bold cursor-pointer">✕</button>
          </div>
        </div>

        <!-- Slide Canvas View -->
        <div class="relative aspect-video bg-gradient-to-br from-[#082231] via-[#0c2b3d] to-[#10384f] rounded-2xl flex flex-col justify-between p-8 text-center border border-white/10 shadow-2xl overflow-hidden">
          <div class="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>

          <div class="relative z-10 flex items-center justify-between text-xs text-slate-300">
            <span class="font-bold uppercase tracking-wider text-cyan-300">Modul Ajar Digital SMP</span>
            <span class="font-mono">{{ currentSchoolName }}</span>
          </div>

          <!-- Slide Content Body -->
          <div v-if="currentSlide?.image" class="relative z-10 w-full h-full max-h-[58vh] flex flex-col items-center justify-center my-auto p-2">
            <div class="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-black/40">
              <img
                :src="currentSlide.image"
                :alt="currentSlide.title || 'Slide Visual'"
                class="max-w-full max-h-full object-contain rounded-lg shadow-lg select-none"
              />
            </div>
            <div v-if="currentSlide.title && !currentSlide.title.startsWith('Halaman ')" class="mt-2 text-center shrink-0">
              <h4 class="text-sm sm:text-base font-bold text-white tracking-wide truncate">
                {{ currentSlide.title }}
              </h4>
            </div>
          </div>
          <div v-else class="relative z-10 max-w-2xl mx-auto space-y-4 my-auto">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl shadow-inner">
              {{ previewSlideIndex === 0 ? '🚀' : previewSlideIndex % 2 === 0 ? '💡' : '💻' }}
            </div>
            <h4 class="text-2xl font-black text-white tracking-wide">
              {{ currentSlide?.title || `Slide ${previewSlideIndex + 1}` }}
            </h4>
            <p class="text-sm text-slate-300 leading-relaxed max-w-xl mx-auto whitespace-pre-line">
              {{ currentSlide?.content || previewItem.description || 'Simulasi pemaparan materi ajar interaktif dan diskusi terpandu bersama siswa.' }}
            </p>
          </div>

          <div class="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-3">
            <span>{{ previewItem.title }}</span>
            <span class="font-bold text-[#f59e0b]">Halaman {{ previewSlideIndex + 1 }} / {{ totalSlidesCount }}</span>
          </div>

          <!-- Prev / Next Navigation Arrows -->
          <button
            @click="prevSlide"
            :disabled="previewSlideIndex === 0"
            class="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 text-white font-bold text-lg transition backdrop-blur-sm z-20 cursor-pointer disabled:cursor-not-allowed"
          >
            ←
          </button>
          <button
            @click="nextSlide"
            :disabled="previewSlideIndex >= totalSlidesCount - 1"
            class="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 text-white font-bold text-lg transition backdrop-blur-sm z-20 cursor-pointer disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>

        <!-- Slide Thumbnails Strip -->
        <div class="flex items-center gap-2.5 overflow-x-auto py-2 px-1 custom-scroll">
          <button
            v-for="(_, sIdx) in totalSlidesCount"
            :key="sIdx"
            @click="previewSlideIndex = sIdx"
            :class="[
              'relative rounded-xl border-2 transition shrink-0 overflow-hidden flex flex-col items-center justify-between text-left group/thumb cursor-pointer',
              previewSlideIndex === sIdx
                ? 'border-[#f59e0b] ring-2 ring-[#f59e0b]/50 bg-white/10'
                : 'border-white/15 hover:border-white/40 bg-white/5'
            ]"
            :style="{ width: '84px', height: '52px' }"
            :title="`Slide ${sIdx + 1}: ${previewItem?.slides?.[sIdx]?.title || ''}`"
          >
            <div v-if="previewItem?.slides?.[sIdx]?.image" class="w-full h-full bg-black flex items-center justify-center">
              <img :src="previewItem.slides[sIdx].image" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-full h-full p-1.5 flex flex-col justify-between bg-black/20 text-[8px] leading-tight text-slate-300">
              <span class="font-bold text-white truncate max-w-full">{{ previewItem?.slides?.[sIdx]?.title || `Slide ${sIdx + 1}` }}</span>
              <span class="text-[7px] text-slate-400 truncate">{{ previewItem?.slides?.[sIdx]?.content || '' }}</span>
            </div>
            <span class="absolute bottom-0.5 right-1 text-[8px] font-mono font-bold bg-black/80 px-1 rounded text-[#f59e0b]">
              {{ sIdx + 1 }}
            </span>
          </button>
        </div>

        <!-- Action Bottom -->
        <div class="flex items-center justify-between pt-2 border-t border-white/10">
          <span class="text-xs text-slate-400">Gunakan tombol panah (← / →) untuk berpindah slide</span>
          <div class="flex items-center gap-2">
            <button
              @click="openLaunchModal(previewItem); previewItem = null"
              class="px-5 py-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 text-xs font-black shadow-md transition cursor-pointer"
            >
              🚀 Mulai Tayangkan Sesi Sekarang →
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- =========================================================================
         MODAL 4: EDIT MATERI PRESENTASI - Persis Original
         ========================================================================= -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
      @click.self="showEditModal = false"
    >
      <div class="bg-white rounded-[28px] shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200/80 animate-scale-up">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-base font-bold text-slate-900">Edit Materi Presentasi</h3>
            <p class="text-xs text-slate-500">Perbarui judul, rombel sasaran, dan isi slide pembelajaran</p>
          </div>
          <button @click="showEditModal = false" class="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer">✕</button>
        </div>

        <form @submit.prevent="saveEditPresentation" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Judul Materi Pembelajaran <span class="text-rose-500">*</span></label>
            <input
              v-model="editForm.title"
              type="text"
              class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition"
              required
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Mata Pelajaran</label>
            <select v-model="editForm.subject" class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition">
              <option v-for="s in availableSubjects" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block font-bold text-slate-700 mb-0">Rombel Sasaran (Bisa Pilih > 1 Kelas) <span class="text-rose-500">*</span></label>
              <button
                type="button"
                @click="toggleSelectAllEditClasses"
                class="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
              >
                {{ editForm.classroom_ids.length === classrooms.length ? 'Batal Pilih Semua' : 'Pilih Semua Kelas' }}
              </button>
            </div>

            <div class="p-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 max-h-36 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
              <label
                v-for="cls in classrooms"
                :key="cls.id"
                :class="[
                  'flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs cursor-pointer select-none transition-all',
                  editForm.classroom_ids.includes(cls.id)
                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                ]"
              >
                <input
                  type="checkbox"
                  :value="cls.id"
                  :checked="editForm.classroom_ids.includes(cls.id)"
                  @change="toggleEditClass(cls.id)"
                  class="rounded text-[#0c2b3d] focus:ring-[#0c2b3d]"
                />
                <span class="truncate">Kelas {{ cls.name }}</span>
              </label>
            </div>
            <p class="text-[10px] text-slate-400 mt-1">
              Terpilih: {{ getSelectedClassroomsLabel(editForm.classroom_ids) }}
            </p>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
            <textarea
              v-model="editForm.description"
              rows="2"
              class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0c2b3d]"
            ></textarea>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Tags / Topik (Pisahkan dengan koma)</label>
            <input
              v-model="editForm.tagsString"
              type="text"
              placeholder="Contoh: algoritma, scratch, koding"
              class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0c2b3d]"
            />
          </div>

          <!-- Edit Daftar Slide -->
          <div class="border-t border-slate-100 pt-3">
            <div class="flex items-center justify-between mb-2">
              <label class="font-bold text-slate-800 text-xs">Isi Halaman Slide ({{ editForm.slides.length }} Halaman)</label>
              <button
                type="button"
                @click="addSlideToEdit"
                class="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <span>+</span> Tambah Slide
              </button>
            </div>

            <div class="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scroll">
              <div
                v-for="(sl, sIdx) in editForm.slides"
                :key="sIdx"
                class="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2"
              >
                <div class="flex items-center justify-between">
                  <span class="font-bold text-[11px] text-slate-700">Slide {{ sIdx + 1 }}</span>
                  <button
                    v-if="editForm.slides.length > 1"
                    type="button"
                    @click="removeSlideFromEdit(sIdx)"
                    class="text-rose-500 hover:text-rose-700 text-[10px] font-bold cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
                <input
                  v-model="sl.title"
                  type="text"
                  placeholder="Judul Slide"
                  class="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0c2b3d]"
                  required
                />
                <textarea
                  v-model="sl.content"
                  rows="2"
                  placeholder="Isi / Uraian Slide..."
                  class="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-[#0c2b3d]"
                ></textarea>

                <!-- Slide Image Preview & Upload -->
                <div v-if="sl.image" class="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-900/10 max-h-36 flex items-center justify-center p-1">
                  <img :src="sl.image" class="max-h-32 object-contain rounded-lg shadow-xs" />
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <label class="cursor-pointer bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-xl shadow hover:bg-blue-700">
                      Ganti Gambar
                      <input type="file" accept="image/*" class="hidden" @change="(e) => handleSlideImageUpload(e, sIdx)" />
                    </label>
                    <button
                      type="button"
                      @click="sl.image = undefined"
                      class="bg-rose-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-xl shadow hover:bg-rose-700 cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
                <div v-else class="flex items-center gap-2 pt-0.5">
                  <label class="cursor-pointer text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 border border-dashed border-blue-300 rounded-xl px-2.5 py-1.5 bg-blue-50/50 hover:bg-blue-50 transition">
                    <span>🖼️</span> <span>Sisipkan Gambar Slide (PNG/JPG/WebP)</span>
                    <input
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="(e) => handleSlideImageUpload(e, sIdx)"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#082231] text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              Simpan Perubahan Materi
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const currentSchoolName = computed(() => authStore.currentSchool?.name || 'Satuan Pendidikan')
const isStudent = computed(() => authStore.hasRole('student'))

// View mode: 'hero' (Fullscreen 100dvh) or 'catalog' (Classic Grid)
const currentView = ref<'hero' | 'catalog'>(route.query.view === 'catalog' ? 'catalog' : 'hero')

watch(() => route.query.view, (newView) => {
  if (newView === 'catalog') {
    currentView.value = 'catalog'
  } else {
    currentView.value = 'hero'
  }
})

// Active material index in hero showcase
const activePresentationIndex = ref(0)

// Mode Ringan / Reduced Motion Support
const reducedMotion = ref(false)

function initReducedMotion() {
  try {
    const saved = localStorage.getItem('belajarena_reduced_motion')
    if (saved !== null) {
      reducedMotion.value = saved === 'true'
    } else if (typeof window !== 'undefined' && window.matchMedia) {
      reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
  } catch {}
}

function toggleReducedMotion() {
  reducedMotion.value = !reducedMotion.value
  try {
    localStorage.setItem('belajarena_reduced_motion', String(reducedMotion.value))
  } catch {}
}

// Student Join PIN
const studentJoinPin = ref('')
function joinStudentSession(pin?: string) {
  const code = (pin || studentJoinPin.value).trim()
  if (!code) {
    alert('Silakan masukkan PIN sesi presentasi terlebih dahulu.')
    return
  }
  router.push(`/presentation-live/${code}`)
}

// Filters & Search
const loading = ref(false)
const filterSubject = ref('all')
const filterClass = ref('all')
const filterStatus = ref('all')
const searchQuery = ref('')

function resetFilters() {
  filterSubject.value = 'all'
  filterClass.value = 'all'
  filterStatus.value = 'all'
  searchQuery.value = ''
}

const classrooms = ref<any[]>([])
const presentations = ref<any[]>([])
const activeSession = ref<any>(null)

const availableSubjects = computed(() => {
  const set = new Set<string>()
  if (authStore.user?.subject) set.add(authStore.user.subject)
  presentations.value.forEach(p => {
    if (p.subject) set.add(p.subject)
  })
  if (set.size === 0) {
    set.add('Mata Pelajaran')
  }
  return Array.from(set)
})

// Stats Computed
const totalReadySlides = computed(() => {
  return presentations.value.reduce((acc, p) => acc + (p.slideCount || p.slides?.length || 0), 0)
})

const totalSessionsDone = computed(() => {
  return presentations.value.reduce((acc, p) => acc + (p.sessionCount || 0), 0)
})

// Filtered Presentations
const filteredPresentations = computed(() => {
  return presentations.value.filter(p => {
    const matchSubj = filterSubject.value === 'all' || p.subject === filterSubject.value

    let matchCls = filterClass.value === 'all'
    if (!matchCls) {
      const target = (filterClass.value || '').toLowerCase().trim()
      const targetNorm = target.replace(/^kelas\s+/i, '')
      const ids: string[] = p.classroom_ids || []
      const names: string[] = p.classrooms || (p.classroom ? p.classroom.split(',').map((s: string) => s.trim()) : [])
      matchCls = ids.some(id => id.toLowerCase() === target) ||
        names.some(n => n.toLowerCase() === target || n.toLowerCase() === targetNorm) ||
        (p.classroom && p.classroom.toLowerCase().includes(targetNorm))
    }

    const matchStat = filterStatus.value === 'all' || p.status === filterStatus.value
    const matchQuery = (p.title || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                       (p.description || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchSubj && matchCls && matchStat && matchQuery
  })
})

// Guard active presentation index when filtered list changes
watch(filteredPresentations, (newList) => {
  if (newList.length === 0) {
    activePresentationIndex.value = 0
    return
  }
  if (activePresentationIndex.value >= newList.length) {
    activePresentationIndex.value = 0
  }
})

// Current Active Presentation
const currentPresentation = computed(() => {
  if (filteredPresentations.value.length === 0) return null
  return filteredPresentations.value[activePresentationIndex.value] || filteredPresentations.value[0]
})

// ---------------------------------------------------------------------------
// THEME COLOR & RADIAL GRADIENT LOGIC (Aturan Warna Sesuai Spesifikasi)
// Informatika = #2563EB (biru), KKA = #7C3AED (ungu)
// Lainnya = Deterministik dari [merah #E11D48, oranye #F97316, hijau #16A34A, sian #0891B2]
// ---------------------------------------------------------------------------
const FALLBACK_PALETTE = ['#E11D48', '#F97316', '#16A34A', '#0891B2']

const THEME_MAP: Record<string, { themeName: string; gradient: string }> = {
  '#2563EB': {
    themeName: 'Ocean Blue',
    gradient: 'radial-gradient(circle at 55% 45%, #2563EB 0%, #1D4ED8 45%, #0B1E4A 100%)'
  },
  '#7C3AED': {
    themeName: 'Cyber Violet',
    gradient: 'radial-gradient(circle at 55% 45%, #7C3AED 0%, #5B21B6 45%, #2E1065 100%)'
  },
  '#E11D48': {
    themeName: 'Crimson Fury',
    gradient: 'radial-gradient(circle at 55% 45%, #E11D48 0%, #9F1239 45%, #4C0519 100%)'
  },
  '#F97316': {
    themeName: 'Electric Blaze',
    gradient: 'radial-gradient(circle at 55% 45%, #F97316 0%, #C2410C 45%, #431407 100%)'
  },
  '#16A34A': {
    themeName: 'Emerald Matrix',
    gradient: 'radial-gradient(circle at 55% 45%, #16A34A 0%, #15803D 45%, #052E16 100%)'
  },
  '#0891B2': {
    themeName: 'Cyan Pulse',
    gradient: 'radial-gradient(circle at 55% 45%, #0891B2 0%, #0E7490 45%, #083344 100%)'
  }
}

function getPresentationTheme(item: any): { themeColor: string; themeName: string; gradient: string } {
  if (!item) {
    return {
      themeColor: '#2563EB',
      themeName: 'Ocean Blue',
      gradient: THEME_MAP['#2563EB'].gradient
    }
  }

  const subj = (item.subject || '').toLowerCase()
  let color = ''

  if (subj.includes('kka') || subj.includes('koding') || subj.includes('kecerdasan')) {
    color = '#7C3AED'
  } else if (subj.includes('informatika')) {
    color = '#2563EB'
  } else {
    // Hash deterministik berdasarkan id materi
    const key = String(item.id || item.title || '0')
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i)
      hash |= 0
    }
    const idx = Math.abs(hash) % FALLBACK_PALETTE.length
    color = FALLBACK_PALETTE[idx]
  }

  const conf = THEME_MAP[color] || THEME_MAP['#2563EB']
  return {
    themeColor: color,
    themeName: conf.themeName,
    gradient: conf.gradient
  }
}

const currentTheme = computed(() => getPresentationTheme(currentPresentation.value))

// ---------------------------------------------------------------------------
// KATA RAKSASA (Aturan Sesuai Spesifikasi)
// Satu kata paling menonjol dari judul, uppercase, maks ±10 huruf.
// Abaikan kata umum: 'materi', 'bab', 'pertemuan', 'modul', 'ppt', 'pptx', 'pdf'
// Bila hanya satu kata umum, gunakan nama mapel.
// ---------------------------------------------------------------------------
function getGiantWord(item: any): string {
  if (!item) return 'PRESENTASI'
  const title = (item.title || '').trim()

  // Ambil kata-kata, pisahkan juga karakter pemisah seperti '-' dan '_'
  const words: string[] = title
    .replace(/[^\p{L}\p{N}\s_-]/gu, ' ')
    .split(/[\s_-]+/)
    .filter((w: string) => Boolean(w))

  const stopWords = ['materi', 'bab', 'pertemuan', 'modul', 'topik', 'pembelajaran', 'ppt', 'pptx', 'pdf']
  const significant = words.filter((w: string) => !stopWords.includes(w.toLowerCase()))
  const alphaSignificant = significant.filter((w: string) => /[a-zA-Z]/i.test(w))

  let candidate = ''
  if (alphaSignificant.length > 0) {
    candidate = alphaSignificant[0]
  } else if (significant.length > 0) {
    candidate = significant[0]
  } else if (item.subject) {
    const subjWords: string[] = item.subject
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((s: string) => Boolean(s))
    candidate = subjWords[0] || 'PRESENTASI'
  } else if (words.length > 0) {
    candidate = words[0]
  } else {
    candidate = 'PRESENTASI'
  }

  // Maksimal ±10 huruf, potong rapi
  if (candidate.length > 10) {
    candidate = candidate.slice(0, 10)
  }
  return candidate.toUpperCase()
}

const currentGiantWord = computed(() => getGiantWord(currentPresentation.value))

// Info Chips Authentic Data (3 Chips Seimbang Persis Edu Games)
const currentChips = computed(() => {
  const item = currentPresentation.value
  if (!item) return []
  return [
    { label: 'Jumlah Slide', value: `${item.slideCount || item.slides?.length || 1} Slide Interaktif` },
    { label: 'Mata Pelajaran', value: item.subject || 'Informatika' },
    { label: 'Rombel Sasaran', value: formatClassroomBadge(item) }
  ]
})

// Navigation & Selection Functions
function selectPresentation(index: number) {
  if (index >= 0 && index < filteredPresentations.value.length) {
    activePresentationIndex.value = index
    try {
      sessionStorage.setItem('belajarena_active_presentation_id', filteredPresentations.value[index].id)
    } catch {}
  }
}

function prevPresentation() {
  if (filteredPresentations.value.length === 0) return
  if (activePresentationIndex.value > 0) {
    selectPresentation(activePresentationIndex.value - 1)
  } else {
    selectPresentation(filteredPresentations.value.length - 1)
  }
}

function nextPresentation() {
  if (filteredPresentations.value.length === 0) return
  if (activePresentationIndex.value < filteredPresentations.value.length - 1) {
    selectPresentation(activePresentationIndex.value + 1)
  } else {
    selectPresentation(0)
  }
}

// Keyboard Navigation Listener (←, →, Enter)
function handleKeydown(e: KeyboardEvent) {
  if (showUploadModal.value || launchingItem.value || previewItem.value || showEditModal.value) return
  const activeTagName = (document.activeElement?.tagName || '').toLowerCase()
  if (activeTagName === 'input' || activeTagName === 'select' || activeTagName === 'textarea') return

  if (e.key === 'ArrowLeft') {
    prevPresentation()
  } else if (e.key === 'ArrowRight') {
    nextPresentation()
  } else if (e.key === 'Enter') {
    if (currentPresentation.value && currentPresentation.value.status === 'ready') {
      openLaunchModal(currentPresentation.value)
    }
  }
}

// Modals State
const showUploadModal = ref(false)
const isDragging = ref(false)
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadProgress = ref(0)
const uploadStatusText = ref('')
const isUploading = ref(false)

const launchingItem = ref<any>(null)
const previewItem = ref<any>(null)
const previewSlideIndex = ref(0)

const showEditModal = ref(false)
const editForm = ref({
  id: '',
  title: '',
  subject: 'Informatika',
  classroom_ids: [] as string[],
  description: '',
  tagsString: '',
  slides: [] as any[]
})

const uploadForm = ref({
  title: '',
  subject: authStore.user?.subject || 'Mata Pelajaran',
  classroom_ids: [] as string[],
  description: ''
})

const sessionForm = ref({
  title: '',
  classroom: '',
  accessCode: '',
  allowAnonymous: true,
  allowChangeAnswer: false
})

function toggleUploadClass(id: string) {
  const idx = uploadForm.value.classroom_ids.indexOf(id)
  if (idx > -1) {
    uploadForm.value.classroom_ids.splice(idx, 1)
  } else {
    uploadForm.value.classroom_ids.push(id)
  }
}

function toggleSelectAllUploadClasses() {
  if (uploadForm.value.classroom_ids.length === classrooms.value.length) {
    uploadForm.value.classroom_ids = []
  } else {
    uploadForm.value.classroom_ids = classrooms.value.map(c => c.id)
  }
}

function toggleEditClass(id: string) {
  const idx = editForm.value.classroom_ids.indexOf(id)
  if (idx > -1) {
    editForm.value.classroom_ids.splice(idx, 1)
  } else {
    editForm.value.classroom_ids.push(id)
  }
}

function toggleSelectAllEditClasses() {
  if (editForm.value.classroom_ids.length === classrooms.value.length) {
    editForm.value.classroom_ids = []
  } else {
    editForm.value.classroom_ids = classrooms.value.map(c => c.id)
  }
}

function getSelectedClassroomsLabel(ids: string[]) {
  if (!ids || ids.length === 0) return 'Belum ada kelas dipilih'
  return ids
    .map(id => {
      const c = classrooms.value.find(cls => cls.id === id)
      return c ? `Kelas ${c.name}` : id
    })
    .join(', ')
}

function formatClassroomBadge(item: any) {
  if (!item) return 'Semua Kelas'
  if (item.classrooms && Array.isArray(item.classrooms) && item.classrooms.length > 0) {
    return item.classrooms.map((c: string) => `Kelas ${c}`).join(', ')
  }
  if (item.classroom_ids && Array.isArray(item.classroom_ids) && item.classroom_ids.length > 0) {
    return item.classroom_ids
      .map((id: string) => {
        const c = classrooms.value.find(cls => cls.id === id)
        return c ? `Kelas ${c.name}` : id
      })
      .join(', ')
  }
  if (item.classroom) {
    return item.classroom.includes('Kelas') ? item.classroom : `Kelas ${item.classroom}`
  }
  return 'Semua Kelas'
}

function getFirstSlide(item: any) {
  if (item && Array.isArray(item.slides) && item.slides.length > 0) {
    const s = item.slides[0]
    return {
      title: s.title || item.title || 'Slide 1',
      content: s.content || s.description || item.description || 'Materi pembelajaran interaktif.',
      image: s.image || s.imageUrl || item.thumbnail || null,
      icon: s.icon || (item.subject?.includes('KKA') ? '💻' : '💡')
    }
  }
  if (item?.thumbnail) {
    return {
      title: item.title,
      content: item.description || 'Materi pembelajaran interaktif.',
      image: item.thumbnail,
      icon: '📽️'
    }
  }
  return {
    title: item?.title || 'Slide 1',
    content: item?.description || 'Materi pembelajaran interaktif.',
    image: null,
    icon: '📊'
  }
}

const totalSlidesCount = computed(() => {
  if (!previewItem.value) return 1
  return previewItem.value.slides?.length || previewItem.value.slideCount || 1
})

const currentSlide = computed(() => {
  if (!previewItem.value || !previewItem.value.slides) return null
  return previewItem.value.slides[previewSlideIndex.value] || null
})

function prevSlide() {
  if (previewSlideIndex.value > 0) {
    previewSlideIndex.value--
  }
}

function nextSlide() {
  if (previewSlideIndex.value < totalSlidesCount.value - 1) {
    previewSlideIndex.value++
  }
}

// Data Fetching
async function loadPresentations() {
  loading.value = true
  try {
    const res = await api.get('/presentations')
    const raw = res.data?.data || res.data || []
    presentations.value = Array.isArray(raw) ? raw : []

    // Restore selected presentation (prioritize active session, then sessionStorage, then 0)
    if (activeSession.value && activeSession.value.presentation_id) {
      const sIdx = presentations.value.findIndex(p => p.id === activeSession.value.presentation_id)
      if (sIdx !== -1) {
        activePresentationIndex.value = sIdx
        return
      }
    }

    try {
      const savedId = sessionStorage.getItem('belajarena_active_presentation_id')
      if (savedId) {
        const foundIdx = presentations.value.findIndex(p => p.id === savedId)
        if (foundIdx !== -1) {
          activePresentationIndex.value = foundIdx
        }
      }
    } catch {}
  } catch (err) {
    console.error('Failed to load presentations:', err)
    presentations.value = []
  } finally {
    loading.value = false
  }
}

async function loadActiveSession() {
  try {
    const res = await api.get('/presentation-sessions/active')
    const session = res.data?.data || null
    if (session) {
      if (presentations.value.length === 0) {
        activeSession.value = null
      } else {
        const presExists = presentations.value.some(p => p.id === session.presentation_id)
        activeSession.value = presExists ? session : null
      }
    } else {
      activeSession.value = null
    }
  } catch (err) {
    console.error('Failed to load active session:', err)
    activeSession.value = null
  }
}

// B6: Akhiri Sesi
async function stopActiveSession() {
  if (!activeSession.value) return
  if (!confirm(`Hentikan sesi presentasi "${activeSession.value.title}" sekarang?`)) return

  try {
    const sId = activeSession.value.id || 'all'
    await api.post(`/presentation-sessions/${sId}/end`)
    activeSession.value = null
    alert('✅ Sesi presentasi telah berhasil diakhiri.')
  } catch (err: any) {
    console.error('Gagal mengakhiri sesi:', err)
    activeSession.value = null
  } finally {
    await loadActiveSession()
  }
}

async function loadClassrooms() {
  try {
    const res = await api.get('/classrooms')
    const raw = res.data?.data || res.data || []
    classrooms.value = Array.isArray(raw) ? raw : []
    if (classrooms.value.length > 0) {
      if (uploadForm.value.classroom_ids.length === 0) {
        uploadForm.value.classroom_ids = [classrooms.value[0].id]
      }
      if (!sessionForm.value.classroom) {
        sessionForm.value.classroom = classrooms.value[0].name
      }
    }
  } catch (err) {
    console.error('Failed to load classrooms:', err)
    classrooms.value = []
  }
}

onMounted(async () => {
  initReducedMotion()
  window.addEventListener('keydown', handleKeydown)
  await Promise.all([loadClassrooms(), loadPresentations()])
  await loadActiveSession()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// File Upload Handlers (PPTX / PDF / Forms)
function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    validateAndSelectFile(target.files[0])
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    validateAndSelectFile(event.dataTransfer.files[0])
  }
}

async function parsePptxSlides(file: File): Promise<Array<{ title: string; content: string; image?: string }>> {
  try {
    const jszipModule: any = await import('jszip')
    const JSZip = jszipModule.default || jszipModule
    const zip = await JSZip.loadAsync(file)

    const slideFiles = Object.keys(zip.files)
      .filter(name => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)![0], 10)
        const numB = parseInt(b.match(/\d+/)![0], 10)
        return numA - numB
      })

    const allMediaFiles = Object.keys(zip.files)
      .filter(name => /^ppt\/media\/.+\.(png|jpe?g|webp|gif|svg|bmp)$/i.test(name))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))

    const mediaCache = new Map<string, string>()
    for (const mf of allMediaFiles) {
      try {
        const ext = mf.split('.').pop()?.toLowerCase() || 'png'
        const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
          : ext === 'svg' ? 'image/svg+xml'
          : ext === 'webp' ? 'image/webp'
          : ext === 'gif' ? 'image/gif'
          : 'image/png'
        const b64 = await zip.files[mf].async('base64')
        mediaCache.set(mf, `data:${mime};base64,${b64}`)
      } catch (err) {
        console.warn('Error reading media file:', mf, err)
      }
    }

    if (slideFiles.length === 0 && allMediaFiles.length > 0) {
      return allMediaFiles.map((mf, idx) => ({
        title: `Slide ${idx + 1}`,
        content: `Konten slide gambar ${idx + 1}`,
        image: mediaCache.get(mf)
      }))
    }

    if (slideFiles.length === 0) return []

    const slides: Array<{ title: string; content: string; image?: string }> = []
    const usedMedia = new Set<string>()

    for (let i = 0; i < slideFiles.length; i++) {
      const sf = slideFiles[i]
      const xmlStr = await zip.files[sf].async('text')
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlStr, 'application/xml')

      const paragraphs = xmlDoc.getElementsByTagName('a:p')
      const lines: string[] = []
      for (let p = 0; p < paragraphs.length; p++) {
        const textNodes = paragraphs[p].getElementsByTagName('a:t')
        let pText = ''
        for (let t = 0; t < textNodes.length; t++) {
          pText += textNodes[t].textContent || ''
        }
        pText = pText.trim()
        if (pText) lines.push(pText)
      }

      let slideImage: string | undefined = undefined
      const relName = sf.replace('ppt/slides/', 'ppt/slides/_rels/') + '.rels'
      if (zip.files[relName]) {
        try {
          const relXml = await zip.files[relName].async('text')
          const matches = [...relXml.matchAll(/Target="([^"]+)"/g)]
          for (const m of matches) {
            const rawTarget = m[1]
            const filename = rawTarget.split('/').pop() || ''
            if (/\.(png|jpe?g|webp|gif|svg|bmp)$/i.test(filename)) {
              const fullPath = `ppt/media/${filename}`
              if (mediaCache.has(fullPath)) {
                slideImage = mediaCache.get(fullPath)
                usedMedia.add(fullPath)
                break
              }
            }
          }
        } catch (e) {
          console.warn('Error parsing rels:', relName, e)
        }
      }

      if (!slideImage && allMediaFiles[i] && !usedMedia.has(allMediaFiles[i])) {
        slideImage = mediaCache.get(allMediaFiles[i])
        usedMedia.add(allMediaFiles[i])
      }

      const title = lines.length > 0 ? lines[0] : `Slide ${i + 1}`
      const content = lines.length > 1 ? lines.slice(1).join('\n') : (lines[0] || 'Materi pembelajaran interaktif.')

      slides.push({
        title,
        content,
        image: slideImage
      })
    }
    return slides
  } catch (e) {
    console.warn('Gagal membaca struktur berkas PPTX secara langsung:', e)
    return []
  }
}

async function parsePdfSlides(file: File): Promise<Array<{ title: string; content: string; image?: string }>> {
  try {
    uploadStatusText.value = 'Mempersiapkan mesin ekstraksi dokumen PDF...'
    uploadProgress.value = 40
    await nextTick()

    const arrayBuffer = await file.arrayBuffer()
    const pdfjsModule: any = await import('pdfjs-dist/legacy/build/pdf.js')
    const pdfjsLib = pdfjsModule.default || pdfjsModule

    if (pdfjsLib.GlobalWorkerOptions) {
      const workerUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/pdf.worker.min.js`
        : '/pdf.worker.min.js'
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl
    }

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true
    })
    const pdfDoc = await loadingTask.promise
    const numPages = pdfDoc.numPages
    const slides: Array<{ title: string; content: string; image?: string }> = []

    for (let i = 1; i <= numPages; i++) {
      uploadStatusText.value = `Mengonversi halaman ${i} dari ${numPages}...`
      uploadProgress.value = 40 + Math.round((i / numPages) * 35)
      await nextTick()

      const page = await pdfDoc.getPage(i)
      
      // Hitung skala adaptif agar tampilan tajam namun ukuran payload tetap efisien
      const baseViewport = page.getViewport({ scale: 1.0 })
      const maxDim = Math.max(baseViewport.width, baseViewport.height)
      const targetScale = Math.min(1.5, Math.max(0.75, 1280 / maxDim))
      const viewport = page.getViewport({ scale: targetScale })

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = Math.round(viewport.width)
      canvas.height = Math.round(viewport.height)

      let imageDataUrl = ''
      if (ctx) {
        await page.render({ canvasContext: ctx, viewport }).promise
        imageDataUrl = canvas.toDataURL('image/jpeg', 0.80)
      }

      let pageText = ''
      try {
        const textContent = await page.getTextContent()
        pageText = textContent.items.map((item: any) => item.str || '').filter(Boolean).join(' ')
      } catch (_) {}

      const firstSentence = pageText.split(/[.\n]/)[0]?.trim()
      const title = firstSentence && firstSentence.length < 50 ? firstSentence : `Halaman ${i}`
      const content = pageText ? pageText.slice(0, 300) : `Konten visual halaman ${i}`

      slides.push({
        title,
        content,
        image: imageDataUrl || undefined
      })
    }
    return slides
  } catch (err: any) {
    console.error('Gagal membaca berkas PDF:', err)
    throw new Error('Gagal mengekstrak berkas PDF: ' + (err?.message || 'Format tidak didukung atau terenkripsi'))
  }
}

function handleSlideImageUpload(e: Event, sIdx: number) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    if (file.size > 15 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 15 MB!')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      editForm.value.slides[sIdx].image = reader.result as string
    }
    reader.readAsDataURL(file)
  }
}

function validateAndSelectFile(file: File) {
  const allowedExts = ['pdf', 'pptx', 'ppt']
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (!allowedExts.includes(ext)) {
    alert('Format file tidak didukung! Harap unggah berkas berekstensi .pptx, .ppt, atau .pdf.')
    return
  }
  if (file.size > 50 * 1024 * 1024) {
    alert('Ukuran berkas melebihi batas 50 MB!')
    return
  }
  selectedFile.value = file
  if (!uploadForm.value.title) {
    uploadForm.value.title = file.name.replace(/\.[^/.]+$/, '')
  }
}

// Modal 1 Submit: Unggah / Buat Modul
async function submitUpload() {
  if (!uploadForm.value.title) return
  if (uploadForm.value.classroom_ids.length === 0) {
    alert('Pilih minimal satu rombel kelas tujuan materi!')
    return
  }
  isUploading.value = true
  uploadProgress.value = 25
  uploadStatusText.value = 'Mempersiapkan data materi...'

  try {
    let finalSlides: Array<{ title: string; content?: string; image?: string }> = [
      { title: uploadForm.value.title, content: uploadForm.value.description || 'Pengantar materi pembelajaran dan apersepsi kompetensi.' },
      { title: 'Tujuan & Capaian Pembelajaran', content: 'Target pemahaman materi pembelajaran Kurikulum Merdeka Fase D.' },
      { title: 'Konsep Inti & Pembahasan Materi', content: 'Uraian terstruktur konsep utama materi beserta contoh penerapannya.' },
      { title: 'Aktivitas Kolaborasi & Praktik Mandiri', content: 'Instruksi tugas kelompok dan latihan pemecahan masalah.' },
      { title: 'Refleksi & Rangkuman Penutup', content: 'Kesimpulan materi ajar dan penilaian formatif interaktif.' }
    ]

    let fileType = ''
    if (selectedFile.value) {
      const ext = selectedFile.value.name.split('.').pop()?.toLowerCase() || ''
      fileType = ext
      if (ext === 'pptx') {
        uploadProgress.value = 40
        uploadStatusText.value = 'Mengekstrak slide berkas PPTX...'
        await nextTick()
        const extracted = await parsePptxSlides(selectedFile.value)
        if (!extracted || extracted.length === 0) {
          throw new Error('Ekstraksi berkas PPTX tidak menghasilkan slide yang valid. Pastikan format berkas didukung dan tidak terenkripsi.')
        }
        finalSlides = extracted
      } else if (ext === 'pdf') {
        uploadProgress.value = 40
        uploadStatusText.value = 'Mengekstrak halaman berkas PDF...'
        await nextTick()
        const extracted = await parsePdfSlides(selectedFile.value)
        if (!extracted || extracted.length === 0) {
          throw new Error('Ekstraksi berkas PDF tidak menghasilkan halaman yang valid.')
        }
        finalSlides = extracted
      }
    }

    const hasVisualImages = finalSlides.some(s => Boolean(s.image))
    const visualNotice = (!hasVisualImages && fileType)
      ? 'Ekstraksi visual otomatis belum tersedia pada lingkungan ini; gunakan mode Berbagi Layar langsung untuk menampilkan slide utuh.'
      : ''

    const selectedClasses = uploadForm.value.classroom_ids
      .map(id => classrooms.value.find(c => c.id === id))
      .filter(Boolean)
    const selectedNames = selectedClasses.map(c => c!.name)
    const classroomLabel = selectedNames.join(', ')

    const payload = {
      title: uploadForm.value.title,
      description: uploadForm.value.description,
      subject: uploadForm.value.subject,
      classroom: classroomLabel,
      classroom_id: uploadForm.value.classroom_ids[0] || 'cls-7a',
      classroom_ids: uploadForm.value.classroom_ids,
      classrooms: selectedNames,
      slideCount: finalSlides.length,
      slides: finalSlides,
      file_type: fileType,
      visual_notice: visualNotice,
      status: 'ready'
    }

    uploadProgress.value = 85
    uploadStatusText.value = 'Menyimpan materi ke server Belajarena...'
    await nextTick()

    // Resilient save with automatic retry on temporary network drop
    let postSuccess = false
    let lastPostErr = null
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await api.post('/presentations', payload, { timeout: 60000 })
        postSuccess = true
        break
      } catch (postErr: any) {
        lastPostErr = postErr
        if (attempt === 1 && (postErr.message === 'Network Error' || postErr.code === 'ERR_NETWORK' || !postErr.response)) {
          console.warn('Percobaan pertama simpan presentasi gagal, mencoba ulang...', postErr)
          uploadStatusText.value = 'Menghubungkan ulang ke server...'
          await new Promise(r => setTimeout(r, 1000))
        } else {
          throw postErr
        }
      }
    }

    uploadProgress.value = 100
    uploadStatusText.value = 'Materi berhasil disimpan!'
    await nextTick()

    showUploadModal.value = false
    selectedFile.value = null
    uploadForm.value = {
      title: '',
      subject: 'Informatika',
      classroom_ids: classrooms.value.length ? [classrooms.value[0].id] : [],
      description: ''
    }
    await loadPresentations()
  } catch (err: any) {
    console.error('Failed to create presentation:', err)
    let errorMsg = err.response?.data?.message || err.message || 'Terjadi kesalahan sistem'
    if (err.isAxiosError && (err.message === 'Network Error' || err.code === 'ERR_NETWORK' || !err.response)) {
      errorMsg = 'Koneksi ke backend server terputus (Network Error). Pastikan server Belajarena aktif di port 8000.'
    } else if (err.response?.status === 413) {
      errorMsg = 'Ukuran berkas melebihi batas server (Maksimal 100 MB).'
    }
    alert('Gagal menyimpan presentasi: ' + errorMsg)
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
    uploadStatusText.value = ''
  }
}

// Modal 4: Edit Presentation
function openEditModal(item: any) {
  let initialClassIds: string[] = []
  if (item.classroom_ids && Array.isArray(item.classroom_ids) && item.classroom_ids.length > 0) {
    initialClassIds = [...item.classroom_ids]
  } else if (item.classroom) {
    const rawNames = item.classroom.split(',').map((s: string) => s.trim().replace(/^kelas\s+/i, '').toLowerCase())
    initialClassIds = classrooms.value
      .filter(c => rawNames.includes(c.name.toLowerCase()) || rawNames.includes(c.id.toLowerCase()))
      .map(c => c.id)
  }
  if (initialClassIds.length === 0 && classrooms.value.length > 0) {
    initialClassIds = [classrooms.value[0].id]
  }

  editForm.value = {
    id: item.id,
    title: item.title,
    subject: item.subject || 'Informatika',
    classroom_ids: initialClassIds,
    description: item.description || '',
    tagsString: Array.isArray(item.tags) ? item.tags.join(', ') : '',
    slides: item.slides && item.slides.length > 0
      ? JSON.parse(JSON.stringify(item.slides))
      : [
          { title: item.title, content: item.description || 'Pengantar materi pembelajaran.' },
          { title: 'Materi Pokok', content: 'Uraian topik pembahasan.' }
        ]
  }
  showEditModal.value = true
}

function addSlideToEdit() {
  editForm.value.slides.push({
    title: `Slide ${editForm.value.slides.length + 1}`,
    content: 'Tuliskan poin pembahasan atau materi untuk slide ini.'
  })
}

function removeSlideFromEdit(index: number) {
  editForm.value.slides.splice(index, 1)
}

async function saveEditPresentation() {
  if (!editForm.value.id || !editForm.value.title) return
  if (editForm.value.classroom_ids.length === 0) {
    alert('Pilih minimal satu rombel kelas tujuan materi!')
    return
  }
  try {
    const selectedClasses = editForm.value.classroom_ids
      .map(id => classrooms.value.find(c => c.id === id))
      .filter(Boolean)
    const selectedNames = selectedClasses.map(c => c!.name)
    const classroomLabel = selectedNames.join(', ')

    const payload = {
      title: editForm.value.title,
      subject: editForm.value.subject,
      classroom: classroomLabel,
      classroom_id: editForm.value.classroom_ids[0] || 'cls-7a',
      classroom_ids: editForm.value.classroom_ids,
      classrooms: selectedNames,
      description: editForm.value.description,
      tags: editForm.value.tagsString.split(',').map((t: string) => t.trim()).filter(Boolean),
      slides: editForm.value.slides
    }
    await api.put(`/presentations/${editForm.value.id}`, payload)
    showEditModal.value = false
    await loadPresentations()
  } catch (err: any) {
    console.error('Failed to update presentation:', err)
    alert('Gagal memperbarui materi: ' + (err.message || 'Terjadi kesalahan'))
  }
}

// Modal 3: Preview
function previewPresentation(item: any) {
  previewItem.value = item
  previewSlideIndex.value = 0
}

// Modal 2: Launch Session & Filter Rombel Terpilih
function getAvailableClassroomsForItem(item: any): any[] {
  if (!item) return classrooms.value

  // 1. Berdasarkan array ID kelas (classroom_ids)
  if (Array.isArray(item.classroom_ids) && item.classroom_ids.length > 0) {
    const matched = classrooms.value.filter(c => item.classroom_ids.includes(c.id))
    if (matched.length > 0) return matched
  }

  // 2. Berdasarkan array nama kelas (classrooms)
  if (Array.isArray(item.classrooms) && item.classrooms.length > 0) {
    const targetNames = item.classrooms.map((n: string) =>
      String(n).trim().toLowerCase().replace(/^kelas\s+/i, '')
    )
    const matched = classrooms.value.filter(c =>
      targetNames.includes(String(c.name).trim().toLowerCase().replace(/^kelas\s+/i, ''))
    )
    if (matched.length > 0) return matched
  }

  // 3. Berdasarkan string classroom (misal: "IX A, IX B")
  if (item.classroom && typeof item.classroom === 'string') {
    const rawTokens = item.classroom
      .split(',')
      .map((s: string) => s.trim().toLowerCase().replace(/^kelas\s+/i, ''))
      .filter(Boolean)
    const matched = classrooms.value.filter(c =>
      rawTokens.includes(String(c.name).trim().toLowerCase().replace(/^kelas\s+/i, ''))
    )
    if (matched.length > 0) return matched
  }

  // 4. Berdasarkan classroom_id tunggal
  if (item.classroom_id) {
    const matched = classrooms.value.filter(c => c.id === item.classroom_id)
    if (matched.length > 0) return matched
  }

  return classrooms.value
}

const availableLaunchClassrooms = computed(() => {
  return getAvailableClassroomsForItem(launchingItem.value)
})

function openLaunchModal(item: any) {
  launchingItem.value = item
  sessionForm.value.title = `Sesi Presentasi: ${item.title}`

  const available = getAvailableClassroomsForItem(item)
  if (available.length > 0) {
    // Pilih kelas pertama yang ditugaskan sebagai default
    sessionForm.value.classroom = available[0].name
  } else if (item.classroom) {
    sessionForm.value.classroom = item.classroom.includes(',') ? item.classroom.split(',')[0].trim() : item.classroom
  } else {
    sessionForm.value.classroom = classrooms.value[0]?.name || 'VII A'
  }

  sessionForm.value.accessCode = 'PRS-' + Math.floor(100 + Math.random() * 900)
}

async function confirmLaunchSession() {
  if (!launchingItem.value) return
  try {
    let selectedClassIds: string[] = []
    const selectedClassNames = sessionForm.value.classroom.split(',').map((s: string) => s.trim().replace(/^kelas\s+/i, ''))
    const matched = classrooms.value.filter(c => selectedClassNames.includes(c.name))
    if (matched.length > 0) {
      selectedClassIds = matched.map(c => c.id)
    } else if (launchingItem.value.classroom_ids) {
      selectedClassIds = launchingItem.value.classroom_ids
    }

    const payload = {
      presentation_id: launchingItem.value.id,
      title: sessionForm.value.title,
      classroom: sessionForm.value.classroom,
      classroom_ids: selectedClassIds,
      accessCode: sessionForm.value.accessCode,
      totalSlides: launchingItem.value.slideCount || launchingItem.value.slides?.length || 10,
      slides: launchingItem.value.slides || []
    }
    const res = await api.post('/presentation-sessions', payload)
    const sessionData = (res as any)?.data?.data || (res as any)?.data
    activeSession.value = sessionData
    const sId = sessionData?.id || ('ses-' + Date.now().toString(36))
    launchingItem.value = null
    router.push(`/presentations/studio/${sId}`)
  } catch (err: any) {
    console.error('Failed to launch session:', err)
    alert('Gagal memulai sesi presentasi: ' + (err.message || 'Terjadi kesalahan'))
  }
}

// C10: Duplikasi
async function duplicatePresentation(item: any) {
  try {
    const payload = {
      title: `${item.title} (Salinan)`,
      description: item.description,
      subject: item.subject,
      classroom: item.classroom,
      classroom_ids: item.classroom_ids,
      classrooms: item.classrooms,
      tags: item.tags,
      slides: item.slides,
      slideCount: item.slideCount
    }
    await api.post('/presentations', payload)
    await loadPresentations()
  } catch (err: any) {
    console.error('Failed to duplicate presentation:', err)
  }
}

// C11: Hapus
async function deletePresentation(item: any) {
  if (!confirm(`Hapus presentasi "${item.title}"?`)) return
  try {
    await api.delete(`/presentations/${item.id}`)
    await loadPresentations()
  } catch (err: any) {
    console.error('Failed to delete presentation:', err)
    alert('Gagal menghapus materi: ' + (err.message || 'Terjadi kesalahan'))
  }
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
   MODE RINGAN & PREFERS-REDUCED-MOTION (Batasan Keras #4 & #9)
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

/* Custom Scrollbar for horizontal strip & dropdowns */
.custom-scroll::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
}

/* Animation utilities for modals */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
.animate-scale-up {
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
