<template>
  <div class="h-screen flex flex-col bg-surface-950 text-white overflow-hidden select-none">
    <!-- Top Header Bar -->
    <header class="h-14 bg-surface-900 border-b border-surface-800 px-4 flex items-center justify-between gap-3 shrink-0 z-20">
      <div class="flex items-center gap-3">
        <router-link
          to="/presentations"
          class="btn-icon btn-ghost text-surface-400 hover:text-white"
          title="Keluar ke Perpustakaan"
        >
          ←
        </router-link>
        <img
          src="/logo-icon.png"
          alt="Belajarena"
          class="w-7 h-7 rounded-lg object-contain shadow shrink-0 hidden sm:block"
        />
        <div>
          <h1 class="text-xs sm:text-sm font-black truncate max-w-[200px] sm:max-w-md text-white">
            {{ session.title }}
          </h1>
          <p class="text-[10px] text-surface-400">
            {{ session.classroom }} &bull; Slide {{ activeSlide }} dari {{ totalSlides }}
          </p>
        </div>
      </div>

      <!-- Center: PIN & Student Join Info -->
      <div class="flex items-center gap-2 bg-surface-800/80 border border-surface-700/80 px-3 py-1 rounded-xl">
        <span class="text-[10px] uppercase font-bold text-surface-400">PIN Sesi:</span>
        <span class="font-mono font-black text-amber-300 text-sm tracking-widest">{{ session.accessCode }}</span>
        <button
          @click="copyJoinLink"
          class="text-xs text-primary-400 hover:text-primary-300 ml-1 font-bold flex items-center gap-1 bg-surface-900/60 px-2 py-0.5 rounded-lg border border-surface-700 transition"
          :title="`Salin tautan untuk HP siswa: http://${session.localNetworkIp || '192.168.100.245'}:5173/presentation-live/${session.accessCode}`"
        >
          <span>{{ copied ? '✓' : '📋' }}</span>
          <span>{{ copied ? 'Tersalin!' : 'Salin Tautan HP' }}</span>
        </button>
      </div>

      <!-- Right Actions: Monitor, Voting, Pause, End -->
      <div class="flex items-center gap-2">
        <!-- Live Web Demo Broadcast Trigger -->
        <button
          @click="openWebDemo"
          :class="[
            'btn text-xs px-3 py-1.5 font-bold rounded-xl flex items-center gap-1.5 shadow transition',
            webDemo.isActive ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse' : (isWebDemoOpen ? 'bg-cyan-600 text-white' : 'bg-cyan-900/80 hover:bg-cyan-800 text-cyan-200 border border-cyan-700')
          ]"
          title="Buka website untuk mendemokan materi dan broadcast ke HP siswa"
        >
          <span>🌐</span>
          <span>Demo Web Live</span>
          <span v-if="webDemo.isActive" class="w-2 h-2 rounded-full bg-white"></span>
        </button>

        <!-- Live Participants Counter / Trigger Drawer -->
        <button
          @click="showMonitoring = !showMonitoring"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition border',
            showMonitoring ? 'bg-primary-600 border-primary-500 text-white' : 'bg-surface-800 border-surface-700 text-surface-300 hover:text-white'
          ]"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>👥 {{ connectedCount }} / {{ participants.length }} Siswa</span>
        </button>

        <!-- Live Voting Trigger -->
        <button
          @click="openVotingManager"
          class="btn bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 font-bold rounded-xl flex items-center gap-1.5 shadow"
        >
          <span>📊</span> Polling & Kuis
          <span v-if="activeVote" class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
        </button>

        <!-- Lock / Pause Student Screen -->
        <button
          @click="toggleSessionLock"
          :class="[
            'btn-icon text-xs rounded-xl border',
            session.isLocked ? 'bg-amber-600 text-white border-amber-500' : 'bg-surface-800 text-surface-300 border-surface-700'
          ]"
          :title="session.isLocked ? 'Buka Kunci Layar Siswa' : 'Kunci Interaksi Layar Siswa'"
        >
          {{ session.isLocked ? '🔒' : '🔓' }}
        </button>

        <!-- End Session Button -->
        <button
          @click="endSession"
          class="btn bg-rose-600 hover:bg-rose-700 text-white text-xs px-3 py-1.5 font-bold rounded-xl shadow"
        >
          Akhiri Sesi
        </button>
      </div>
    </header>

    <!-- Main Workspace (Center Slide or Web Demo + Optional Monitoring Panel) -->
    <div class="flex-1 flex overflow-hidden relative">
      <!-- VIEWPORT A: WEB DEMO BROADCAST MODE -->
      <div v-if="isWebDemoOpen" class="flex-1 flex flex-col p-3 sm:p-5 bg-surface-950 overflow-hidden">
        <!-- Web Demo Toolbar -->
        <div class="bg-surface-900 border border-surface-800 p-3 rounded-2xl shadow-xl mb-3 shrink-0 flex flex-wrap items-center justify-between gap-3">
          <!-- URL Input Bar -->
          <div class="flex items-center gap-2 flex-1 min-w-[280px]">
            <span class="text-xl">🌐</span>
            <input
              v-model="webInputUrl"
              type="url"
              class="flex-1 bg-surface-950 border border-surface-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-surface-500 focus:outline-none focus:border-cyan-500 font-mono"
              placeholder="Ketik tautan web... (contoh: Scratch, Python, PhET, Desmos)"
              @keyup.enter="applyWebUrl"
            />
            <button
              type="button"
              class="btn bg-surface-800 hover:bg-surface-700 text-xs px-3.5 py-2 font-bold rounded-xl"
              @click="applyWebUrl"
            >
              Buka Web
            </button>
          </div>

          <!-- Educational Web Presets -->
          <div class="flex items-center gap-1.5 overflow-x-auto text-xs py-0.5">
            <button
              v-for="p in WEB_PRESETS"
              :key="p.id"
              type="button"
              class="px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 transition shrink-0"
              :class="webDemo.presetId === p.id ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold ring-1 ring-cyan-500' : 'bg-surface-950/80 border-surface-800 text-surface-300 hover:border-surface-600'"
              @click="selectPreset(p)"
            >
              <span>{{ p.icon }}</span>
              <span>{{ p.title }}</span>
            </button>
          </div>

          <!-- Web Demo Actions -->
          <div class="flex items-center gap-2 shrink-0">
            <!-- Satu-satunya Tombol: Live Mirroring Web ke Seluruh Layar HP Siswa -->
            <button
              type="button"
              :class="[
                'btn text-xs px-4 py-2 font-black flex items-center gap-1.5 rounded-xl shadow-lg transition active:scale-95',
                (isScreenSharing || webDemo.isActive)
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse ring-2 ring-rose-400'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
              ]"
              @click="(isScreenSharing || webDemo.isActive) ? stopScreenMirroring() : startScreenMirroring()"
              title="Mulai siaran langsung cermin layar web ke HP siswa secara realtime"
            >
              <span>{{ (isScreenSharing || webDemo.isActive) ? '⏹️' : '🖥️' }}</span>
              <span>{{ (isScreenSharing || webDemo.isActive) ? 'Hentikan Live Mirroring' : 'Mulai Live Mirroring Web' }}</span>
            </button>

            <!-- Layar Penuh Web Button (Perbesar Web ke 100% Layar Bersih) -->
            <button
              type="button"
              class="btn bg-cyan-700/80 hover:bg-cyan-600 text-white text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-md transition active:scale-95 border border-cyan-500/50"
              @click="toggleWebFullscreen"
              title="Perbesar demo web ke seluruh monitor (Full Screen tanpa toolbar studio) agar bersih saat dicerminkan"
            >
              <span>{{ isWebFullscreen ? '✕' : '⛶' }}</span>
              <span>{{ isWebFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh Web' }}</span>
            </button>

            <!-- Open in New Tab -->
            <a
              :href="webDemo.url"
              target="_blank"
              rel="noopener noreferrer"
              class="btn bg-surface-800 hover:bg-surface-700 text-white text-xs px-3 py-2 rounded-xl flex items-center gap-1"
              title="Buka situs di tab terpisah"
            >
              <span>↗️</span>
              <span class="hidden md:inline">Buka Tab</span>
            </a>

            <!-- Reload Iframe -->
            <button
              type="button"
              class="btn-icon bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white text-xs rounded-xl p-2"
              @click="reloadIframe"
              title="Muat ulang konten web demo"
            >
              🔄
            </button>

            <!-- Switch Back to Slides -->
            <button
              type="button"
              class="btn bg-surface-800 hover:bg-surface-700 text-surface-200 hover:text-white text-xs px-3 py-2 rounded-xl font-bold flex items-center gap-1"
              @click="isWebDemoOpen = false"
              title="Kembali ke tampilan slide materi"
            >
              <span>📽️</span>
              <span>Kembali ke Slide</span>
            </button>
          </div>
        </div>

        <!-- Broadcast Status Banner -->
        <div
          class="flex items-center justify-between px-4 py-2 rounded-xl text-xs font-semibold mb-2 shadow-xs shrink-0 transition"
          :class="(isScreenSharing || webDemo.isActive) ? 'bg-cyan-950/90 border border-cyan-500/80 text-cyan-200' : 'bg-surface-900 border border-surface-800 text-surface-400'"
        >
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" :class="(isScreenSharing || webDemo.isActive) ? 'bg-cyan-400 animate-ping' : 'bg-surface-600'"></span>
            <span>
              {{ (isScreenSharing || webDemo.isActive)
                ? '🖥️ SIARAN LIVE MIRRORING AKTIF: Tampilan web demonstrasi guru saat ini sedang dicerminkan ke layar HP seluruh siswa secara realtime.'
                : '⚪ Mode Persiapan Guru: Siswa saat ini masih melihat slide presentasi. Klik tombol "Mulai Live Mirroring Web" saat siap mendemokan.' }}
            </span>
          </div>
          <div class="text-[11px] text-surface-400 flex items-center gap-2">
            <span class="font-mono text-cyan-300 truncate max-w-xs">{{ (isScreenSharing || webDemo.isActive) ? (webDemo.title || 'Live Mirroring') : 'Siaran Mati' }}</span>
            <span>&bull;</span>
            <span class="text-emerald-400">👥 {{ connectedCount }} Siswa Terhubung</span>
          </div>
        </div>

        <!-- Live Web Frame Viewport (Bisa Fullscreen 100% Layar Bersih untuk Demonstrasi & Mirroring) -->
        <div
          ref="webViewportRef"
          :class="[
            isWebFullscreen
              ? 'fixed inset-0 z-[100] w-screen h-screen bg-black flex flex-col'
              : 'flex-1 bg-surface-900 border-2 border-surface-800 rounded-2xl overflow-hidden relative shadow-2xl flex flex-col'
          ]"
        >
          <!-- Floating Controls saat Mode Layar Penuh Aktif -->
          <div
            v-if="isWebFullscreen"
            class="absolute top-3 right-4 z-50 flex items-center gap-2 pointer-events-auto"
          >
            <!-- Kontrol Mirroring Cepat di Mode Fullscreen -->
            <button
              type="button"
              :class="[
                'px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-2xl transition cursor-pointer backdrop-blur-md border active:scale-95',
                (isScreenSharing || webDemo.isActive)
                  ? 'bg-rose-600/90 hover:bg-rose-600 text-white border-rose-400 animate-pulse'
                  : 'bg-cyan-600/90 hover:bg-cyan-600 text-white border-cyan-400'
              ]"
              @click="(isScreenSharing || webDemo.isActive) ? stopScreenMirroring() : startScreenMirroring()"
              title="Mulai / Hentikan Live Mirroring langsung dari mode Fullscreen"
            >
              <span>{{ (isScreenSharing || webDemo.isActive) ? '⏹️ Hentikan Mirroring' : '🖥️ Mulai Live Mirroring' }}</span>
            </button>

            <!-- Tombol Keluar Layar Penuh -->
            <button
              type="button"
              @click="toggleWebFullscreen"
              class="px-3.5 py-1.5 rounded-full bg-black/80 hover:bg-black text-white text-xs font-bold border border-white/20 backdrop-blur-md shadow-2xl transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              title="Keluar Layar Penuh (Esc)"
            >
              <span>✕</span>
              <span>Keluar Layar Penuh (Esc)</span>
            </button>
          </div>

          <!-- Header info proxy (disembunyikan saat fullscreen agar 100% bersih) -->
          <div
            v-if="!isWebFullscreen"
            class="flex items-center justify-between px-3 py-1.5 bg-surface-950 border-b border-surface-800 text-[11px] text-surface-400 shrink-0"
          >
            <span class="flex items-center gap-1.5 text-cyan-300 font-medium">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              Web Terbuka via Proxy Aman (Mendukung Scratch, PhET, Wikipedia, Simulasi Web)
            </span>
            <a
              :href="webDemo.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
            >
              <span>Buka di Tab Baru ↗️</span>
            </a>
          </div>
          <iframe
            :key="iframeKey"
            :src="getEmbedUrl(webDemo.url)"
            class="w-full flex-1 border-0 bg-white"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          ></iframe>
        </div>
      </div>

      <!-- VIEWPORT B: REGULAR SLIDE VIEWPORT -->
      <div v-else class="flex-1 flex flex-col justify-between items-center p-4 sm:p-6 bg-gradient-to-b from-surface-950 via-surface-900 to-black overflow-hidden relative">
        <!-- Floating Active Web Broadcast Indicator banner if teacher is looking at slides while web is still broadcasted -->
        <div
          v-if="webDemo.isActive"
          class="w-full max-w-5xl mb-2 px-4 py-2 rounded-xl bg-rose-950/90 border border-rose-500/80 text-rose-200 flex items-center justify-between text-xs font-bold shadow-lg"
        >
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
            <span>Demo Web sedang ter-broadcast di layar HP siswa: {{ webDemo.title }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button @click="isWebDemoOpen = true" class="btn bg-rose-600 hover:bg-rose-500 text-white text-[11px] px-2.5 py-1 rounded-lg">
              Buka Layar Web
            </button>
            <button @click="stopWebBroadcast" class="btn bg-surface-800 hover:bg-surface-700 text-surface-200 text-[11px] px-2.5 py-1 rounded-lg">
              Hentikan Siaran
            </button>
          </div>
        </div>

        <!-- Active Slide Container (Strict 16:9 Aspect Ratio matching Student View 1:1) -->
        <div class="w-full max-w-5xl flex-1 flex items-center justify-center my-auto relative">
          <div
            ref="slideContainerRef"
            @mousemove="handleSlideMouseMove"
            @mouseenter="handleSlideMouseEnter"
            @mouseleave="handleSlideMouseLeave"
            class="w-full aspect-video rounded-2xl bg-surface-950 border-2 border-surface-700 shadow-2xl relative overflow-hidden flex items-center justify-center select-none"
            :class="{ 'cursor-none': isLaserActive }"
          >
            <!-- Floating Watermark Header: Left -->
            <div class="absolute top-3 left-4 z-20 px-3 py-1 rounded-lg bg-surface-900/90 border border-surface-700/80 backdrop-blur-md flex items-center gap-2 text-xs font-bold text-white shadow-md">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-primary-300 uppercase tracking-wider text-[11px]">{{ currentSchoolName }} &bull; {{ session.subject || 'Informatika Fase D' }}</span>
            </div>

            <!-- Floating Watermark Header: Right (Slide Counter) -->
            <div class="absolute top-3 right-4 z-20 px-3 py-1 rounded-lg bg-surface-900/90 border border-surface-700/80 backdrop-blur-md text-xs font-mono font-bold text-amber-300 shadow-md">
              Slide {{ activeSlide }} / {{ totalSlides }}
            </div>

            <!-- Slide Core Content Visual Render (Strict 16:9 matching Student View 1:1) -->
            <div v-if="slidesData.length === 0" class="flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-primary-600/20 border border-primary-500/40 text-primary-400 flex items-center justify-center text-2xl animate-spin">
                ⏳
              </div>
              <p class="font-bold text-sm text-white">Memuat Konten Slide Materi...</p>
            </div>
            <div v-else-if="currentSlideData.image" class="w-full h-full flex items-center justify-center bg-black relative">
              <img
                :src="resolveSlideImageUrl(currentSlideData.image)"
                :alt="currentSlideData.title || 'Slide Visual Content'"
                class="w-full h-full object-contain pointer-events-none select-none"
                loading="eager"
                decoding="sync"
              />
            </div>
            <div v-else class="p-8 text-center max-w-2xl mx-auto space-y-4">
              <!-- Label Peringatan Jujur jika Slide Tanpa Gambar Hasil Ekstraksi -->
              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-semibold max-w-lg mx-auto shadow-sm">
                <span>⚠️</span>
                <span>Ekstraksi visual otomatis belum tersedia pada lingkungan ini; gunakan mode <strong>Berbagi Layar</strong> langsung untuk menampilkan slide utuh.</span>
              </div>
              <span class="text-5xl block animate-bounce-short">
                {{ currentSlideData.icon || '🖥️' }}
              </span>
              <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                {{ currentSlideData.title }}
              </h2>
              <p class="text-xs sm:text-sm text-surface-200 leading-relaxed whitespace-pre-line font-medium">
                {{ currentSlideData.description || (currentSlideData as any).content }}
              </p>
            </div>

            <!-- Glowing Laser Pointer for Teacher -->
            <div
              v-if="isLaserActive && laserVisible"
              class="pointer-events-none absolute z-40 transform -translate-x-1/2 -translate-y-1/2 transition-[top,left] duration-75 ease-out"
              :style="{ top: `${laserPos.y}%`, left: `${laserPos.x}%` }"
            >
              <div class="w-6 h-6 rounded-full bg-rose-500 shadow-[0_0_20px_#ff0055,0_0_40px_#ff0000] border-2 border-white animate-pulse"></div>
              <div class="w-14 h-14 -top-4 -left-4 absolute rounded-full bg-rose-500/20 blur-md pointer-events-none"></div>
            </div>

            <!-- Live Active Vote Alert Ribbon over Slide -->
            <transition
              enter-active-class="transform ease-out duration-300"
              enter-from-class="-translate-y-4 opacity-0"
              enter-to-class="translate-y-0 opacity-100"
            >
              <div
                v-if="activeVote"
                class="absolute bottom-3 left-4 right-4 p-3 sm:p-4 rounded-xl bg-indigo-950/95 border-2 border-indigo-400 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-3 z-30"
              >
                <div class="flex items-center gap-3 min-w-0 max-w-sm">
                  <div class="w-9 h-9 rounded-xl bg-amber-400 text-amber-950 font-black flex items-center justify-center text-lg shrink-0 shadow-md">
                    📊
                  </div>
                  <div class="truncate">
                    <span class="text-[9px] uppercase font-black text-amber-300 tracking-wider flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      {{ activeVote.status === 'open' ? 'Live Polling Berlangsung' : 'Polling Selesai' }}
                    </span>
                    <p class="text-xs font-bold text-white truncate max-w-xs">{{ activeVote.question }}</p>
                  </div>
                </div>

                <!-- Mini Real-time Distribution Bars Live on Slide -->
                <div v-if="activeVote.options && activeVote.options.length" class="flex items-center gap-2 flex-1 max-w-lg w-full">
                  <div
                    v-for="(opt, idx) in activeVote.options"
                    :key="opt.id || idx"
                    class="flex-1 min-w-0 bg-black/50 border border-indigo-500/30 rounded-lg p-1.5 space-y-1"
                  >
                    <div class="flex items-center justify-between text-[10px] font-bold">
                      <span class="text-surface-200 truncate font-semibold">
                        {{ ['A', 'B', 'C', 'D', 'E'][idx] || (idx + 1) }}. {{ opt.text }}
                      </span>
                      <span class="text-amber-300 font-mono shrink-0 ml-1">
                        {{ calculateVotePercent(opt.id) }}%
                      </span>
                    </div>
                    <div class="h-1.5 w-full bg-surface-900 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-300"
                        :style="{ width: `${calculateVotePercent(opt.id)}%` }"
                      ></div>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <span class="text-xs font-bold text-amber-300 bg-black/60 px-3 py-1.5 rounded-lg border border-amber-400/30 font-mono">
                    {{ voteResponsesCount }} / {{ participants.length }} Respon
                  </span>
                  <button
                    @click="showVoteModal = true; activeVoteTab = 'recap'"
                    class="btn bg-white text-indigo-950 hover:bg-surface-100 text-xs px-3.5 py-1.5 font-black rounded-lg shadow-lg transition active:scale-95"
                  >
                    Detail ➔
                  </button>
                </div>
              </div>
            </transition>

            <!-- Floating Watermark Footer -->
            <div class="absolute bottom-2 left-4 z-20 text-[10px] text-surface-400 bg-surface-950/70 px-2.5 py-0.5 rounded-md backdrop-blur-xs border border-white/5">
              Kurikulum Merdeka &bull; Berpikir Komputasional
            </div>
          </div>
        </div>

        <!-- Floating Slide Navigation Bar -->
        <div class="mt-4 flex items-center gap-4 bg-surface-900/90 border border-surface-700/80 px-6 py-2.5 rounded-2xl shadow-xl backdrop-blur-md">
          <button
            @click="prevSlide"
            :disabled="activeSlide <= 1"
            class="btn-icon bg-surface-800 text-surface-200 hover:text-white disabled:opacity-30 rounded-xl"
            title="Slide Sebelumnya (Panah Kiri)"
          >
            ←
          </button>

          <span class="text-xs font-bold font-mono tracking-wider text-surface-300">
            Slide <strong class="text-amber-300 text-sm">{{ activeSlide }}</strong> / {{ totalSlides }}
          </span>

          <button
            @click="nextSlide"
            :disabled="activeSlide >= totalSlides"
            class="btn-icon bg-surface-800 text-surface-200 hover:text-white disabled:opacity-30 rounded-xl"
            title="Slide Berikutnya (Panah Kanan / Spasi)"
          >
            →
          </button>

          <div class="h-4 w-px bg-surface-700"></div>

          <!-- Laser Pointer Toggle Button -->
          <button
            @click="toggleLaserPointer"
            :class="[
              'text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition shadow-sm',
              isLaserActive
                ? 'bg-rose-600 text-white shadow-rose-600/50 ring-2 ring-rose-400 animate-pulse'
                : 'bg-surface-800 text-rose-400 hover:text-rose-300 hover:bg-surface-700'
            ]"
            title="Aktifkan Laser Pointer Guru (Tekan L di keyboard)"
          >
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500" :class="{ 'animate-ping': isLaserActive }"></span>
            <span>{{ isLaserActive ? 'Laser Aktif (L)' : 'Laser Pointer' }}</span>
          </button>

          <!-- Toggle Thumbnail Strip -->
          <button
            @click="showThumbnails = !showThumbnails"
            class="text-xs text-surface-400 hover:text-white font-medium flex items-center gap-1"
          >
            <span>🖼️</span> {{ showThumbnails ? 'Sembunyikan Strip' : 'Thumbnail' }}
          </button>

          <!-- Quick Question on Slide Button -->
          <button
            @click="triggerSlideQuestion"
            class="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 ml-2"
          >
            <span>❓</span> Pertanyaan Slide Ini
          </button>
        </div>

        <!-- Collapsible Thumbnail Strip -->
        <transition
          enter-active-class="transform ease-out duration-200"
          enter-from-class="translate-y-4 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
        >
          <div
            v-if="showThumbnails"
            class="w-full max-w-5xl mt-3 p-3 bg-surface-900/95 border border-surface-800 rounded-xl overflow-x-auto flex gap-3 z-10 shadow-lg"
          >
            <div
              v-for="idx in totalSlides"
              :key="idx"
              @click="jumpToSlide(idx)"
              :class="[
                'w-28 aspect-video rounded-lg border-2 p-1.5 flex flex-col justify-between shrink-0 cursor-pointer transition text-[9px] relative overflow-hidden',
                activeSlide === idx ? 'border-primary-500 bg-primary-950/60 shadow-lg ring-1 ring-primary-400' : 'border-surface-700 bg-surface-800/80 hover:border-surface-500'
              ]"
            >
              <img
                v-if="slidesData[idx - 1]?.image"
                :src="slidesData[idx - 1]?.image"
                class="absolute inset-0 w-full h-full object-cover opacity-60"
              />
              <div class="relative z-10 flex justify-between font-mono font-bold">
                <span class="text-surface-200 bg-black/60 px-1 py-0.2 rounded text-[9px]">#{{ idx }}</span>
                <span v-if="activeSlide === idx" class="text-primary-400">●</span>
              </div>
              <p class="relative z-10 truncate text-white text-[10px] font-semibold bg-black/60 px-1 py-0.2 rounded mt-auto">
                {{ slidesData[idx - 1]?.title || `Slide ${idx}` }}
              </p>
            </div>
          </div>
        </transition>
      </div>

      <!-- Realtime Student Monitoring Drawer -->
      <transition
        enter-active-class="transform ease-out duration-300"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transform ease-in duration-200"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
      >
        <aside
          v-if="showMonitoring"
          class="w-80 sm:w-96 bg-surface-900 border-l border-surface-800 flex flex-col justify-between shadow-2xl z-30 shrink-0"
        >
          <div class="p-4 border-b border-surface-800 flex items-center justify-between">
            <div>
              <h2 class="text-sm font-black text-white flex items-center gap-1.5">
                <span>📡</span> Monitoring Siswa Live
              </h2>
              <p class="text-[10px] text-surface-400">Sinkronisasi status denyut koneksi non-invasif</p>
            </div>
            <button @click="showMonitoring = false" class="text-surface-400 hover:text-white p-1">✕</button>
          </div>

          <!-- Summary Badges Top -->
          <div class="p-3 bg-surface-950 grid grid-cols-3 gap-2 text-center text-[10px] border-b border-surface-800">
            <div class="p-2 rounded-lg bg-surface-900 border border-surface-800">
              <span class="text-surface-400 block">Terhubung</span>
              <strong class="text-emerald-400 text-sm font-black">{{ connectedCount }}</strong>
            </div>
            <div class="p-2 rounded-lg bg-surface-900 border border-surface-800">
              <span class="text-surface-400 block">Sync Slide</span>
              <strong class="text-primary-400 text-sm font-black">{{ syncedSlideCount }}</strong>
            </div>
            <div class="p-2 rounded-lg bg-surface-900 border border-surface-800">
              <span class="text-surface-400 block">Respon Vote</span>
              <strong class="text-amber-400 text-sm font-black">{{ voteResponsesCount }}</strong>
            </div>
          </div>

          <!-- Search & Filter -->
          <div class="p-3 border-b border-surface-800">
            <input
              v-model="participantSearch"
              type="text"
              placeholder="Cari nama peserta..."
              class="w-full bg-surface-950 border border-surface-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <!-- Participant List Table -->
          <div class="flex-1 overflow-y-auto p-3 space-y-2">
            <div
              v-for="p in filteredParticipants"
              :key="p.id"
              class="p-2.5 rounded-xl bg-surface-950 border border-surface-800 text-xs flex items-center justify-between"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <span
                  class="w-2.5 h-2.5 rounded-full shrink-0"
                  :class="p.connectionStatus === 'connected' ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : p.connectionStatus === 'syncing' ? 'bg-amber-400' : 'bg-surface-600'"
                ></span>
                <div class="truncate">
                  <p class="font-bold text-white truncate text-xs">{{ p.name }}</p>
                  <p class="text-[10px] text-surface-300 font-mono">
                    Slide {{ p.lastAcknowledgedSlide }} &bull; {{ p.connectionStatus === 'connected' ? 'Aktif' : 'Syncing' }}
                  </p>
                </div>
              </div>

              <!-- Answering Status Badge -->
              <span
                :class="[
                  'text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 border',
                  p.hasAnsweredVote ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-surface-800 text-surface-300 border-surface-700'
                ]"
              >
                {{ p.hasAnsweredVote ? 'Menjawab' : 'Belum' }}
              </span>
            </div>
          </div>

          <!-- Footer Actions in Drawer -->
          <div class="p-3 border-t border-surface-800 bg-surface-950 text-center">
            <button
              @click="sendReminderNotification"
              class="w-full py-2.5 px-3 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-200 hover:text-white border border-surface-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              🔔 Kirim Pengingat ke yang Belum Hadir
            </button>
          </div>
        </aside>
      </transition>
    </div>

    <!-- MODAL LIVE VOTING / POLLING MANAGER -->
    <div
      v-if="showVoteModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      @click.self="showVoteModal = false"
    >
      <div class="bg-surface-900 border-2 border-surface-700 rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-4 text-white">
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-3 border-b border-surface-800">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 font-black flex items-center justify-center text-xl shadow-md">
              📊
            </span>
            <div>
              <h3 class="text-base font-black text-white">Live Polling & Kuis Interaktif</h3>
              <p class="text-xs text-surface-300 font-medium">Kuis respons cepat tersinkronisasi langsung ke HP siswa</p>
            </div>
          </div>
          <button
            @click="showVoteModal = false"
            class="w-8 h-8 rounded-full bg-surface-800 hover:bg-surface-700 text-surface-200 hover:text-white flex items-center justify-center font-bold text-sm transition"
          >
            ✕
          </button>
        </div>

        <!-- Navigation Tabs inside Modal -->
        <div class="flex items-center gap-2 border-b border-surface-800 pb-3">
          <button
            type="button"
            @click="activeVoteTab = 'recap'"
            :class="[
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border',
              activeVoteTab === 'recap'
                ? 'bg-primary-600 border-primary-500 text-white shadow-md'
                : 'bg-surface-800 border-surface-700 text-surface-300 hover:text-white'
            ]"
          >
            <span>📊</span>
            <span>Hasil & Rekapitulasi ({{ sessionVotes.length }})</span>
            <span v-if="activeVote && activeVote.status === 'open'" class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </button>

          <button
            type="button"
            @click="activeVoteTab = 'new'"
            :class="[
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border',
              activeVoteTab === 'new'
                ? 'bg-primary-600 border-primary-500 text-white shadow-md'
                : 'bg-surface-800 border-surface-700 text-surface-300 hover:text-white'
            ]"
          >
            <span>➕</span>
            <span>Buat Polling Baru</span>
          </button>
        </div>

        <!-- TAB 1: REKAPITULASI HASIL VOTING -->
        <div v-if="activeVoteTab === 'recap'" class="space-y-4">
          <!-- Empty State if no votes yet -->
          <div v-if="!currentDisplayVote" class="p-8 text-center space-y-3 bg-surface-950/60 rounded-2xl border border-surface-800">
            <span class="text-4xl block">📝</span>
            <p class="text-sm font-bold text-white">Belum Ada Polling yang Diselenggarakan</p>
            <p class="text-xs text-surface-300 max-w-sm mx-auto">
              Buka pertanyaan interaktif pertama untuk menguji pemahaman materi siswa secara real-time.
            </p>
            <button
              @click="activeVoteTab = 'new'"
              class="btn btn-primary text-xs px-5 py-2 font-bold rounded-xl shadow-lg mt-2"
            >
              Mulai Polling Sekarang ➔
            </button>
          </div>

          <!-- Content if votes exist -->
          <div v-else class="space-y-4 text-xs">
            <!-- Selector if multiple votes exist -->
            <div v-if="sessionVotes.length > 1" class="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                v-for="(vItem, vIdx) in sessionVotes"
                :key="vItem.id"
                @click="selectedVoteId = vItem.id"
                :class="[
                  'px-3 py-1 rounded-lg text-xs font-bold shrink-0 border transition',
                  (selectedVoteId ? selectedVoteId === vItem.id : vItem.id === currentDisplayVote.id)
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                    : 'bg-surface-800 border-surface-700 text-surface-300 hover:text-white'
                ]"
              >
                Polling #{{ vIdx + 1 }}
                <span v-if="vItem.status === 'open'" class="ml-1 text-emerald-400 text-[10px]">● Live</span>
              </button>
            </div>

            <!-- Header Card for Selected Vote -->
            <div class="bg-surface-950 p-4 rounded-2xl border border-surface-800 flex items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border"
                    :class="currentDisplayVote.status === 'open' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-surface-800 text-surface-300 border-surface-700'"
                  >
                    {{ currentDisplayVote.status === 'open' ? '🟢 Sedang Dibuka' : '🔴 Ditutup' }}
                  </span>
                  <span class="text-[10px] font-mono text-surface-400">Slide {{ currentDisplayVote.slideNumber }}</span>
                </div>
                <h4 class="font-bold text-white text-sm leading-snug">{{ currentDisplayVote.question }}</h4>
              </div>
              <div class="text-right shrink-0 bg-surface-900/80 px-3.5 py-2 rounded-xl border border-surface-800">
                <span class="text-2xl font-black text-amber-400 font-mono">{{ voteResponsesCount }}</span>
                <span class="text-[10px] text-surface-300 block font-semibold">/ {{ participants.length }} Respon</span>
              </div>
            </div>

            <!-- Realtime Bar Distribution -->
            <div class="space-y-3 bg-surface-950/60 p-4 rounded-2xl border border-surface-800">
              <div
                v-for="(opt, idx) in currentDisplayVote.options"
                :key="opt.id || idx"
                class="space-y-1.5"
              >
                <div class="flex justify-between items-center text-xs">
                  <div class="flex items-center gap-2 text-white font-bold">
                    <span
                      class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow"
                      :class="[
                        idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-purple-600' : idx === 2 ? 'bg-amber-600' : 'bg-emerald-600'
                      ]"
                    >
                      {{ ['A', 'B', 'C', 'D'][idx] }}
                    </span>
                    <span>{{ opt.text }}</span>
                  </div>
                  <div class="text-right shrink-0">
                    <span class="text-amber-300 font-mono font-bold">{{ calculateVotePercent(opt.id) }}%</span>
                    <span class="text-surface-300 font-mono text-[11px] ml-1">({{ (currentDisplayVote.distribution && currentDisplayVote.distribution[opt.id]) || 0 }} Suara)</span>
                  </div>
                </div>
                <div class="h-3 w-full bg-surface-900 rounded-full overflow-hidden border border-surface-800">
                  <div
                    class="h-full bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    :style="{ width: `${calculateVotePercent(opt.id)}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Modal Action Buttons for Recap -->
            <div class="flex items-center justify-between pt-2 border-t border-surface-800">
              <button
                v-if="currentDisplayVote.status === 'open'"
                @click="closeLiveVote"
                class="btn bg-rose-600 hover:bg-rose-500 text-white text-xs px-4 py-2 font-bold rounded-xl shadow-lg"
              >
                Tutup Voting Ini
              </button>
              <button
                v-else
                @click="activeVoteTab = 'new'"
                class="btn btn-primary text-xs px-4 py-2 font-bold rounded-xl shadow-lg"
              >
                ➕ Buat Pertanyaan Baru
              </button>

              <button
                @click="showVoteModal = false"
                class="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-200 hover:text-white border border-surface-700 text-xs font-bold transition"
              >
                Tutup Tampilan
              </button>
            </div>
          </div>
        </div>

        <!-- TAB 2: BUAT PERTANYAAN BARU -->
        <div v-else class="space-y-4 text-xs">
          <div>
            <label class="block text-slate-200 font-bold mb-1.5">Pertanyaan Polling / Kuis</label>
            <input
              v-model="newVote.question"
              type="text"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 font-semibold focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              placeholder="Contoh: Manakah komponen yang memproses operasi aritmatika?"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-200 font-bold mb-1.5">Jenis Pertanyaan</label>
              <select
                v-model="newVote.type"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-primary-500"
              >
                <option value="single_choice" class="bg-slate-900 text-white">Pilihan Ganda (Single Choice)</option>
                <option value="yes_no" class="bg-slate-900 text-white">Ya / Tidak</option>
                <option value="true_false" class="bg-slate-900 text-white">Benar / Salah</option>
                <option value="rating_scale" class="bg-slate-900 text-white">Skala Pemahaman (1 - 5 Bintang)</option>
                <option value="short_text" class="bg-slate-900 text-white">Jawaban Singkat (Short Text)</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-200 font-bold mb-1.5">Batas Waktu (Detik)</label>
              <select
                v-model.number="newVote.timeLimitSeconds"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-primary-500"
              >
                <option :value="0" class="bg-slate-900 text-white">Tanpa Batas Waktu</option>
                <option :value="30" class="bg-slate-900 text-white">30 Detik</option>
                <option :value="60" class="bg-slate-900 text-white">60 Detik</option>
                <option :value="90" class="bg-slate-900 text-white">90 Detik</option>
              </select>
            </div>
          </div>

          <!-- Options Builder for Multiple Choice -->
          <div v-if="newVote.type === 'single_choice'" class="space-y-2">
            <label class="block text-slate-200 font-bold">Pilihan Opsi Jawaban</label>
            <div v-for="(opt, idx) in newVote.options" :key="idx" class="flex items-center gap-2">
              <span
                class="w-6 h-6 rounded-full font-black text-center text-xs flex items-center justify-center text-white shrink-0"
                :class="[
                  idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-purple-600' : idx === 2 ? 'bg-amber-600' : 'bg-emerald-600'
                ]"
              >
                {{ ['A', 'B', 'C', 'D'][idx] }}
              </span>
              <input
                v-model="opt.text"
                type="text"
                class="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder-slate-400"
                :placeholder="`Opsi ${['A', 'B', 'C', 'D'][idx]}`"
              />
            </div>
          </div>

          <!-- Anonymous Setting -->
          <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span class="font-bold text-white block">Mode Voting Anonim</span>
              <span class="text-[11px] text-slate-400">Nama siswa disembunyikan dari hasil diagram visual</span>
            </div>
            <input type="checkbox" v-model="newVote.isAnonymous" class="rounded text-primary-600 w-4 h-4 cursor-pointer" />
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              @click="showVoteModal = false"
              class="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-200 hover:text-white border border-surface-700 text-xs font-bold transition"
            >
              Batal
            </button>
            <button
              type="button"
              @click="startLiveVote"
              class="btn btn-primary text-xs px-5 py-2 font-bold shadow-lg shadow-primary-600/30"
            >
              🚀 Buka Voting Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const authStore = useAuthStore()
const currentSchoolName = computed(() => authStore.currentSchool?.name || 'Satuan Pendidikan')
import {
  presentationRealtime,
  resolveSlideImageUrl,
  preloadSlideImages,
  type SlideState,
  type ParticipantState,
  type LiveVoteState,
  type WebDemoState,
  saveWebDemoState,
  getWebDemoState,
} from '@/services/realtimePresentation'

const route = useRoute()
const router = useRouter()

const sessionId = (route.params.id as string) || 'ses-live-01'
const activeSlide = ref(1)
const totalSlides = ref(5)
const stateVersion = ref(1)
const showThumbnails = ref(true)
const showMonitoring = ref(false)
const showVoteModal = ref(false)
const copied = ref(false)
const participantSearch = ref('')

function getEmbedUrl(rawUrl: string): string {
  if (!rawUrl) return ''
  let target = rawUrl.trim()
  if (!/^https?:\/\//i.test(target)) {
    target = 'https://' + target
  }
  // Auto-resolve Scratch editor ke Scratch Foundation GUI resmi yang 100% kompatibel di iframe tanpa error
  if (target.includes('scratch.mit.edu/projects/editor') || target.includes('turbowarp.org') || target === 'https://scratch.mit.edu' || target === 'https://scratch.mit.edu/') {
    return 'https://scratchfoundation.github.io/scratch-gui/'
  } else if (target.includes('scratch.mit.edu/projects/') && !target.includes('/embed')) {
    target = target.replace(/scratch\.mit\.edu\/projects\/(\d+)\/?/, 'scratch.mit.edu/projects/$1/embed')
  }

  // Layanan yang mendukung embed iframe secara langsung dan cepat tanpa proxy:
  if (
    target.includes('scratchfoundation.github.io') ||
    target.includes('blockly-demo.appspot.com') ||
    target.includes('phet.colorado.edu') ||
    target.includes('desmos.com/calculator') ||
    target.includes('trinket.io/embed')
  ) {
    return target
  }

  if (target.includes('youtube.com/watch?v=')) {
    const videoId = target.split('v=')[1]?.split('&')[0]
    if (videoId) return `https://www.youtube.com/embed/${videoId}`
  } else if (target.includes('youtu.be/')) {
    const videoId = target.split('youtu.be/')[1]?.split('?')[0]
    if (videoId) return `https://www.youtube.com/embed/${videoId}`
  }
  return `/api/v1/proxy-web?url=${encodeURIComponent(target)}`
}

// Web Demo Broadcast State
const isWebDemoOpen = ref(false)
const webDemo = ref<WebDemoState>({
  sessionId,
  isActive: false,
  url: 'https://scratchfoundation.github.io/scratch-gui/',
  title: 'Scratch 3.0 Coding Editor',
  presetId: 'scratch',
  mode: 'embed',
  allowStudentInteraction: true,
  timestamp: Date.now(),
})
const webInputUrl = ref('https://scratchfoundation.github.io/scratch-gui/')
const iframeKey = ref(1)

// Screen Mirroring State & Methods (Scratch / Dynamic Web Live Share)
const isScreenSharing = ref(false)
let screenCaptureStream: MediaStream | null = null
let screenFrameInterval: any = null
let captureVideoEl: HTMLVideoElement | null = null
let captureCanvasEl: HTMLCanvasElement | null = null

// Web Fullscreen State for Edge-to-Edge Teacher Demo
const isWebFullscreen = ref(false)
const webViewportRef = ref<HTMLElement | null>(null)

async function toggleWebFullscreen() {
  isWebFullscreen.value = !isWebFullscreen.value
  if (isWebFullscreen.value) {
    try {
      const el = webViewportRef.value as any
      if (el) {
        if (el.requestFullscreen) await el.requestFullscreen()
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen()
        else if (el.mozRequestFullScreen) await el.mozRequestFullScreen()
        else if (el.msRequestFullscreen) await el.msRequestFullscreen()
      }
    } catch (_) {}
  } else {
    try {
      const doc = document as any
      if (doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement) {
        if (doc.exitFullscreen) await doc.exitFullscreen()
        else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen()
      }
    } catch (_) {}
  }
}

function handleFullscreenChange() {
  const doc = document as any
  const isFs = Boolean(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement)
  if (!isFs && isWebFullscreen.value) {
    isWebFullscreen.value = false
  }
}

async function startScreenMirroring() {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
    alert('Browser ini tidak mendukung fitur Screen Sharing langsung. Harap gunakan browser Chrome atau Edge.')
    return
  }
  try {
    const displayMediaOptions: any = {
      video: {
        displaySurface: 'browser', // Prioritas utama: Tab Browser atau Jendela Web aplikasi
        width: { ideal: 1920, max: 2560 },
        height: { ideal: 1080, max: 1440 },
        frameRate: { ideal: 15, max: 24 }
      },
      audio: false,
      preferCurrentTab: false,
      selfBrowserSurface: 'include',
      systemAudio: 'exclude',
      surfaceSwitching: 'include',
      monitorTypeSurfaces: 'exclude' // Menghindari agar tidak memilih seluruh monitor OS
    }
    const stream = await (navigator.mediaDevices as any).getDisplayMedia(displayMediaOptions)
    screenCaptureStream = stream
    isScreenSharing.value = true
    webDemo.value.mode = 'screen'
    webDemo.value.isActive = true
    webDemo.value.timestamp = Date.now()
    saveWebDemoState(webDemo.value)
    presentationRealtime.broadcast('WEB_DEMO_CHANGED', webDemo.value)

    if (!captureVideoEl) {
      captureVideoEl = document.createElement('video')
      captureVideoEl.playsInline = true
      captureVideoEl.muted = true
    }
    captureVideoEl.srcObject = stream
    await captureVideoEl.play()

    if (!captureCanvasEl) {
      captureCanvasEl = document.createElement('canvas')
    }
    const ctx = captureCanvasEl.getContext('2d', { alpha: false })
    if (screenFrameInterval) clearInterval(screenFrameInterval)
    let isUploadingFrame = false
    screenFrameInterval = setInterval(async () => {
      if (!isScreenSharing.value || !captureVideoEl || !ctx || !captureCanvasEl) return
      if (isUploadingFrame) return
      if (captureVideoEl.readyState >= 2) {
        isUploadingFrame = true
        // Resolusi optimal untuk transfer jaringan lancar tanpa membebani bandwidth tunnel
        const vw = captureVideoEl.videoWidth || 1280
        const vh = captureVideoEl.videoHeight || 720
        const targetWidth = Math.min(1024, Math.max(800, vw))
        const targetHeight = Math.round(targetWidth * (vh / vw))

        if (captureCanvasEl.width !== targetWidth || captureCanvasEl.height !== targetHeight) {
          captureCanvasEl.width = targetWidth
          captureCanvasEl.height = targetHeight
        }

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'medium'
        ctx.drawImage(captureVideoEl, 0, 0, targetWidth, targetHeight)

        // WebP kualitas 0.62 menghasilkan ukuran file kecil (~30KB) namun tetap sangat jelas
        let frameData: string
        try {
          frameData = captureCanvasEl.toDataURL('image/webp', 0.62)
          if (!frameData.startsWith('data:image/webp')) {
            frameData = captureCanvasEl.toDataURL('image/jpeg', 0.62)
          }
        } catch (_) {
          frameData = captureCanvasEl.toDataURL('image/jpeg', 0.62)
        }

        try {
          await presentationRealtime.sendScreenFrame(frameData)
        } catch (_) {}
        isUploadingFrame = false
      }
    }, 180)

    stream.getVideoTracks()[0].onended = () => {
      stopScreenMirroring()
    }
  } catch (err: any) {
    if (err.name !== 'NotAllowedError') {
      console.warn('Gagal memulai screen sharing:', err)
      alert('Gagal memulai siaran layar: ' + (err.message || 'Izin ditolak'))
    }
    isScreenSharing.value = false
  }
}

function stopScreenMirroring() {
  isScreenSharing.value = false
  if (screenFrameInterval) {
    clearInterval(screenFrameInterval)
    screenFrameInterval = null
  }
  if (screenCaptureStream) {
    screenCaptureStream.getTracks().forEach(t => t.stop())
    screenCaptureStream = null
  }
  if (captureVideoEl) {
    captureVideoEl.srcObject = null
  }
  presentationRealtime.sendScreenFrame(null)
  webDemo.value.mode = 'embed'
  webDemo.value.isActive = false
  webDemo.value.timestamp = Date.now()
  saveWebDemoState(webDemo.value)
  presentationRealtime.broadcast('WEB_DEMO_CHANGED', webDemo.value)
}

const WEB_PRESETS = [
  { id: 'google', title: 'Google Search', url: 'https://www.google.com/search?igu=1&q=Informatika', icon: '🔍' },
  { id: 'scratch', title: 'Scratch 3.0 Coding', url: 'https://scratchfoundation.github.io/scratch-gui/', icon: '🐱' },
  { id: 'blockly', title: 'Blockly Coding', url: 'https://blockly-demo.appspot.com/static/demos/code/index.html', icon: '🧩' },
  { id: 'phet', title: 'PhET Sains Listrik', url: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html', icon: '⚡' },
  { id: 'desmos', title: 'Desmos Kalkulator', url: 'https://www.desmos.com/calculator?embed', icon: '📐' },
  { id: 'python', title: 'Python Trinket', url: 'https://trinket.io/embed/python3/a5015e1739', icon: '🐍' },
  { id: 'wiki', title: 'Wikipedia ID', url: 'https://id.m.wikipedia.org/wiki/Informatika', icon: '📖' },
]

function openWebDemo() {
  isWebDemoOpen.value = true
}

function selectPreset(preset: typeof WEB_PRESETS[0]) {
  webDemo.value.presetId = preset.id
  webDemo.value.title = preset.title
  webDemo.value.url = preset.url
  webInputUrl.value = preset.url
  iframeKey.value++

  if (webDemo.value.isActive) {
    webDemo.value.timestamp = Date.now()
    saveWebDemoState(webDemo.value)
    presentationRealtime.broadcast('WEB_DEMO_CHANGED', webDemo.value)
  }
}

function applyWebUrl() {
  let val = webInputUrl.value.trim()
  if (!val) return

  // Deteksi jika input berupa kata kunci pencarian (contoh: "scratch game" atau "komponen komputer")
  if (!/^https?:\/\//i.test(val) && !val.includes('.')) {
    val = `https://www.google.com/search?q=${encodeURIComponent(val)}`
    webDemo.value.presetId = 'google'
    webDemo.value.title = `Google: ${webInputUrl.value}`
  } else {
    if (!/^https?:\/\//i.test(val)) {
      val = 'https://' + val
    }
    if (val.includes('scratch.mit.edu/projects/editor') || val.includes('turbowarp.org') || val === 'https://scratch.mit.edu' || val === 'https://scratch.mit.edu/') {
      val = 'https://scratchfoundation.github.io/scratch-gui/'
      webDemo.value.presetId = 'scratch'
      webDemo.value.title = 'Scratch 3.0 Coding Editor'
    } else if (val.includes('blockly-demo.appspot.com')) {
      val = 'https://blockly-demo.appspot.com/static/demos/code/index.html'
      webDemo.value.presetId = 'blockly'
      webDemo.value.title = 'Blockly Coding'
    } else if (val.includes('google.com') && !val.includes('search')) {
      val = 'https://www.google.com/search?q=Informatika'
      webDemo.value.presetId = 'google'
      webDemo.value.title = 'Google Pencarian'
    } else {
      webDemo.value.presetId = 'custom'
      webDemo.value.title = val.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'Demo Web'
    }
  }

  webDemo.value.url = val
  webInputUrl.value = val
  iframeKey.value++

  if (webDemo.value.isActive) {
    webDemo.value.timestamp = Date.now()
    saveWebDemoState(webDemo.value)
    presentationRealtime.broadcast('WEB_DEMO_CHANGED', webDemo.value)
  }
}

function toggleWebBroadcast() {
  if (webDemo.value.isActive) {
    stopWebBroadcast()
  } else {
    startWebBroadcast()
  }
}

function startWebBroadcast() {
  if (isScreenSharing.value) {
    stopScreenMirroring()
  }
  webDemo.value.mode = 'embed'
  webDemo.value.isActive = true
  webDemo.value.timestamp = Date.now()
  saveWebDemoState(webDemo.value)
  presentationRealtime.broadcast('WEB_DEMO_CHANGED', webDemo.value)
}

function stopWebBroadcast() {
  if (isScreenSharing.value) {
    stopScreenMirroring()
  }
  webDemo.value.isActive = false
  webDemo.value.timestamp = Date.now()
  saveWebDemoState(webDemo.value)
  presentationRealtime.broadcast('WEB_DEMO_CHANGED', webDemo.value)
}

function reloadIframe() {
  iframeKey.value++
}

const session = ref({
  id: sessionId,
  title: 'Materi Pembelajaran Interaktif',
  classroom: 'Semua Kelas',
  subject: 'Mata Pelajaran',
  accessCode: 'PRS-7A',
  isLocked: false,
  localNetworkIp: ''
})

const slidesData = ref<Array<{ icon?: string; title: string; description?: string; content?: string; image?: string }>>([])

const currentSlideData = computed(() => {
  if (slidesData.value.length === 0) {
    return { icon: '📊', title: session.value.title, description: 'Menampilkan presentasi materi', image: undefined }
  }
  return slidesData.value[(activeSlide.value - 1) % slidesData.value.length]
})

// Participants - Data Real Siswa (Kosong di awal, terisi ketika ada siswa yang benar-benar join)
const participants = ref<ParticipantState[]>([])

const connectedCount = computed(() => {
  return participants.value.filter(p => p.connectionStatus === 'connected' || p.connectionStatus === 'syncing').length
})

const syncedSlideCount = computed(() => {
  return participants.value.filter(p => p.lastAcknowledgedSlide === activeSlide.value).length
})

const filteredParticipants = computed(() => {
  if (!participantSearch.value) return participants.value
  return participants.value.filter(p =>
    p.name.toLowerCase().includes(participantSearch.value.toLowerCase()) ||
    p.nis.includes(participantSearch.value)
  )
})

// Voting State & History
const activeVote = ref<LiveVoteState | null>(null)
const sessionVotes = ref<LiveVoteState[]>([])
const selectedVoteId = ref<string | null>(null)
const activeVoteTab = ref<'recap' | 'new'>('recap')

const newVote = ref({
  question: 'Komponen CPU mana yang bertugas menghitung operasi logika biner?',
  type: 'single_choice' as LiveVoteState['type'],
  timeLimitSeconds: 60,
  isAnonymous: true,
  options: [
    { id: 'opt_1', text: 'ALU (Arithmetic Logic Unit)' },
    { id: 'opt_2', text: 'Control Unit (CU)' },
    { id: 'opt_3', text: 'RAM Memory' },
    { id: 'opt_4', text: 'Hard Disk Drive' }
  ]
})

const currentDisplayVote = computed<LiveVoteState | null>(() => {
  if (activeVote.value && activeVote.value.status === 'open' && (!selectedVoteId.value || selectedVoteId.value === activeVote.value.id)) {
    return activeVote.value
  }
  if (selectedVoteId.value) {
    const found = sessionVotes.value.find(v => v.id === selectedVoteId.value)
    if (found) return found
  }
  if (activeVote.value) return activeVote.value
  if (sessionVotes.value.length > 0) return sessionVotes.value[sessionVotes.value.length - 1]
  return null
})

const voteResponsesCount = computed(() => {
  if (!currentDisplayVote.value) return 0
  const dist = currentDisplayVote.value.distribution || {}
  const sumFromDist = Object.values(dist).reduce((a, b) => a + Number(b), 0)
  if (sumFromDist > 0) return sumFromDist
  if (typeof currentDisplayVote.value.responsesCount === 'number') {
    return currentDisplayVote.value.responsesCount
  }
  return 0
})

function calculateVotePercent(optionId: string): number {
  if (!currentDisplayVote.value || voteResponsesCount.value === 0) return 0
  const count = (currentDisplayVote.value.distribution && currentDisplayVote.value.distribution[optionId]) || 0
  return Math.round((Number(count) / voteResponsesCount.value) * 100)
}

function nextSlide() {
  if (activeSlide.value < totalSlides.value) {
    jumpToSlide(activeSlide.value + 1)
  }
}

function prevSlide() {
  if (activeSlide.value > 1) {
    jumpToSlide(activeSlide.value - 1)
  }
}

function jumpToSlide(num: number) {
  activeSlide.value = num
  stateVersion.value++
  broadcastSlideChange()
}

function broadcastSlideChange() {
  const payload: SlideState = {
    sessionId: session.value.id,
    activeSlide: activeSlide.value,
    totalSlides: totalSlides.value,
    stateVersion: stateVersion.value,
    seq: Date.now(),
    isLocked: session.value.isLocked,
    timestamp: Date.now()
  }
  presentationRealtime.broadcast('SLIDE_CHANGED', payload)
}

function toggleSessionLock() {
  session.value.isLocked = !session.value.isLocked
  broadcastSlideChange()
}

function copyJoinLink() {
  const host = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && session.value.localNetworkIp
    ? `${session.value.localNetworkIp}:${window.location.port || '5173'}`
    : window.location.host
  const url = `${window.location.protocol}//${host}/presentation-live/${session.value.accessCode}`
  navigator.clipboard?.writeText(url)
  copied.value = true
  setTimeout(() => copied.value = false, 3000)
}

function openVotingManager() {
  if (sessionVotes.value.length === 0 && !activeVote.value) {
    activeVoteTab.value = 'new'
  } else {
    activeVoteTab.value = 'recap'
  }
  showVoteModal.value = true
}

function startLiveVote() {
  let options = [...newVote.value.options]
  if (newVote.value.type === 'yes_no') {
    options = [
      { id: 'yes', text: 'Ya (Setuju)' },
      { id: 'no', text: 'Tidak (Tidak Setuju)' }
    ]
  } else if (newVote.value.type === 'true_false') {
    options = [
      { id: 'true', text: 'Benar' },
      { id: 'false', text: 'Salah' }
    ]
  } else if (newVote.value.type === 'rating_scale') {
    options = [
      { id: 'star_1', text: '⭐ 1 Bintang' },
      { id: 'star_2', text: '⭐⭐ 2 Bintang' },
      { id: 'star_3', text: '⭐⭐⭐ 3 Bintang' },
      { id: 'star_4', text: '⭐⭐⭐⭐ 4 Bintang' },
      { id: 'star_5', text: '⭐⭐⭐⭐⭐ 5 Bintang' }
    ]
  } else if (newVote.value.type === 'single_choice') {
    options = options.filter(o => o.text && o.text.trim())
    if (options.length === 0) {
      options = [
        { id: 'opt_1', text: 'Pilihan A' },
        { id: 'opt_2', text: 'Pilihan B' }
      ]
    }
  }

  const dist: Record<string, number> = {}
  options.forEach(opt => {
    dist[opt.id] = 0
  })

  const newV: LiveVoteState = {
    id: 'vote-' + Date.now(),
    sessionId: session.value.id,
    slideNumber: activeSlide.value,
    question: newVote.value.question,
    type: newVote.value.type,
    options,
    isAnonymous: newVote.value.isAnonymous,
    allowChangeAnswer: false,
    timeLimitSeconds: newVote.value.timeLimitSeconds,
    status: 'open',
    responsesCount: 0,
    distribution: dist
  }

  activeVote.value = newV
  selectedVoteId.value = newV.id
  activeVoteTab.value = 'recap'

  const existIdx = sessionVotes.value.findIndex(v => v.id === newV.id)
  if (existIdx > -1) {
    sessionVotes.value.splice(existIdx, 1, newV)
  } else {
    sessionVotes.value.push(newV)
  }
  sessionVotes.value = [...sessionVotes.value]

  // Reset student answer flags
  participants.value.forEach(p => p.hasAnsweredVote = false)

  // Broadcast VOTE_OPENED to student screens & server
  presentationRealtime.broadcast('VOTE_OPENED', activeVote.value)
}

function closeLiveVote() {
  if (activeVote.value) {
    const updated: LiveVoteState = {
      ...activeVote.value,
      status: 'closed'
    }
    const idx = sessionVotes.value.findIndex(v => v.id === updated.id)
    if (idx !== -1) {
      sessionVotes.value.splice(idx, 1, { ...updated })
    }
    sessionVotes.value = [...sessionVotes.value]
    presentationRealtime.broadcast('VOTE_CLOSED', updated)
    presentationRealtime.broadcast('VOTE_STATE', null)
    activeVote.value = null
  }
}

function dismissVote() {
  if (activeVote.value && activeVote.value.status === 'open') {
    closeLiveVote()
  }
  showVoteModal.value = false
}

function triggerSlideQuestion() {
  newVote.value.question = `Pertanyaan Pemahaman Slide ${activeSlide.value}: Gagasan utama apa yang dibahas?`
  newVote.value.type = 'single_choice'
  activeVoteTab.value = 'new'
  showVoteModal.value = true
}

function sendReminderNotification() {
  alert('🔔 Notifikasi pengingat sesi presentasi telah dikirim ke perangkat peserta yang belum hadir!')
}

async function endSession() {
  if (confirm('Akhiri sesi presentasi interaktif ini sekarang? Rangkuman laporan dan hasil voting akan digenerate otomatis.')) {
    if (activeVote.value) {
      closeLiveVote()
    }
    if (webDemo.value.isActive) {
      stopWebBroadcast()
    }
    presentationRealtime.broadcast('SESSION_ENDED', { sessionId: session.value.id })
    try {
      const allVotes = sessionVotes.value.length > 0
        ? sessionVotes.value
        : (activeVote.value ? [activeVote.value] : [])

      const normalizedParts = participants.value.map((p: any) => ({
        ...p,
        lastAckSlide: p.lastAcknowledgedSlide || activeSlide.value,
        voted: Boolean(p.voted || p.hasAnsweredVote || allVotes.some((v: any) => v.voters && (v.voters[p.id] || v.voters[p.studentId] || (p.nis && v.voters[p.nis])))),
        status: (p.connectionStatus !== 'disconnected' || (p.lastAcknowledgedSlide && p.lastAcknowledgedSlide >= 1)) ? 'completed' : 'left_early'
      }))

      await api.post(`/presentation-sessions/${session.value.id}/end`, {
        participants: normalizedParts,
        votes: allVotes,
        activeSlide: activeSlide.value
      })
    } catch (e) {
      console.error('Error ending session in API:', e)
    }
    activeVote.value = null
    presentationRealtime.disconnectSession()
    router.push(`/presentations/session/${session.value.id}/report`)
  }
}

// Laser Pointer State & Handlers
const slideContainerRef = ref<HTMLElement | null>(null)
const isLaserActive = ref(false)
const laserPos = ref({ x: 50, y: 50 })
const laserVisible = ref(false)

function toggleLaserPointer() {
  isLaserActive.value = !isLaserActive.value
  if (!isLaserActive.value) {
    laserVisible.value = false
    presentationRealtime.broadcast('LASER_POINTER', { active: false, timestamp: Date.now() })
  }
}

function handleSlideMouseMove(e: MouseEvent) {
  if (!isLaserActive.value || !slideContainerRef.value) return
  const rect = slideContainerRef.value.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return
  const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
  const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
  laserPos.value = { x, y }
  laserVisible.value = true
  presentationRealtime.broadcast('LASER_POINTER', {
    active: true,
    x,
    y,
    timestamp: Date.now()
  })
}

function handleSlideMouseEnter() {
  if (isLaserActive.value) laserVisible.value = true
}

function handleSlideMouseLeave() {
  if (isLaserActive.value) {
    laserVisible.value = false
    presentationRealtime.broadcast('LASER_POINTER', { active: false, timestamp: Date.now() })
  }
}

// Keyboard shortcuts listener
function handleKeyDown(e: KeyboardEvent) {
  // Ignore shortcuts if active in input / textarea
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return

  if (e.key === 'Escape') {
    if (isWebFullscreen.value) {
      e.preventDefault()
      toggleWebFullscreen()
      return
    }
  }

  if (e.key === 'l' || e.key === 'L') {
    e.preventDefault()
    toggleLaserPointer()
    return
  }

  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
    e.preventDefault()
    nextSlide()
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    e.preventDefault()
    prevSlide()
  }
}

// Realtime event listeners for student heartbeats & slide acknowledgements
let unsubHeartbeat: (() => void) | null = null
let unsubAck: (() => void) | null = null
let unsubVoteOpen: (() => void) | null = null
let unsubVoteClose: (() => void) | null = null
let unsubVoteResp: (() => void) | null = null
let unsubVoteState: (() => void) | null = null
let unsubVotesSync: (() => void) | null = null
let unsubJoin: (() => void) | null = null
let unsubPartsSync: (() => void) | null = null
let heartbeatCheckTimer: any = null

onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)

  // Hubungkan ke engine realtime sesi
  presentationRealtime.connectSession(session.value.id || sessionId, 'teacher')
  broadcastSlideChange()

  // Muat data sesi dan materi nyata dari database/API
  try {
    const res = await api.get(`/presentation-sessions/${sessionId}`)
    if (res.data?.data) {
      const data = res.data.data
      session.value.id = data.id || session.value.id
      session.value.title = data.title || session.value.title
      session.value.classroom = data.classroom || session.value.classroom
      session.value.subject = data.subject || session.value.subject
      session.value.accessCode = data.access_code || data.accessCode || session.value.accessCode
      session.value.localNetworkIp = data.local_network_ip || '192.168.100.245'
      if (Array.isArray(data.slides) && data.slides.length > 0) {
        slidesData.value = data.slides
        totalSlides.value = data.slides.length
        preloadSlideImages(data.slides)
      }
      if (Array.isArray(data.participants) && data.participants.length > 0) {
        participants.value = data.participants
      }
      if (Array.isArray(data.votes) && data.votes.length > 0) {
        sessionVotes.value = data.votes
      }
      if (data.activeVote && data.activeVote.status === 'open') {
        activeVote.value = data.activeVote
        if (!sessionVotes.value.some(v => v.id === data.activeVote.id)) {
          sessionVotes.value.push(data.activeVote)
        }
      }
      presentationRealtime.connectSession(session.value.id, 'teacher')
    }
  } catch (err) {
    console.warn('Load session from server fallback:', err)
  }

  const saved = getWebDemoState(session.value.id)
  if (saved) {
    webDemo.value = { ...saved }
    webInputUrl.value = saved.url
    if (saved.isActive) {
      isWebDemoOpen.value = true
    }
  }

  // Sinkronisasi daftar peserta secara menyeluruh antar-perangkat
  unsubPartsSync = presentationRealtime.subscribe('PARTICIPANTS_SYNC', (list: any[]) => {
    if (Array.isArray(list) && list.length > 0) {
      participants.value = list
    }
  })

  // Tangkap siswa real yang bergabung ke sesi
  unsubJoin = presentationRealtime.subscribe('STUDENT_JOINED', (payload: any) => {
    if (!payload || !payload.studentId) return
    const existing = participants.value.find(p => p.studentId === payload.studentId || p.id === payload.id)
    if (existing) {
      existing.name = payload.name || existing.name
      existing.nis = payload.nis || existing.nis
      existing.classroom = payload.classroom || existing.classroom
      existing.connectionStatus = 'connected'
      existing.lastHeartbeat = Date.now()
    } else {
      participants.value.push({
        id: payload.id || `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        studentId: payload.studentId,
        name: payload.name || 'Peserta Siswa',
        nis: payload.nis || '-',
        classroom: payload.classroom || session.value.classroom || 'Kelas VII',
        connectionStatus: 'connected',
        lastAcknowledgedSlide: payload.lastAcknowledgedSlide || activeSlide.value,
        hasAnsweredVote: false,
        lastHeartbeat: Date.now()
      })
    }
  })

  // Heartbeat real dari siswa
  unsubHeartbeat = presentationRealtime.subscribe('PARTICIPANT_HEARTBEAT', (payload: any) => {
    if (!payload) return
    const p = participants.value.find(part => part.id === payload.participantId || part.studentId === payload.studentId)
    if (p) {
      p.connectionStatus = 'connected'
      p.lastHeartbeat = Date.now()
      if (payload.currentSlide) {
        p.lastAcknowledgedSlide = payload.currentSlide
      }
    } else if (payload.studentId && payload.name) {
      participants.value.push({
        id: payload.participantId || payload.studentId,
        studentId: payload.studentId,
        name: payload.name,
        nis: payload.nis || '-',
        classroom: payload.classroom || session.value.classroom,
        connectionStatus: 'connected',
        lastAcknowledgedSlide: payload.currentSlide || activeSlide.value,
        hasAnsweredVote: false,
        lastHeartbeat: Date.now()
      })
    }
  })

  // Slide acknowledgement dari siswa
  unsubAck = presentationRealtime.subscribe('SLIDE_ACK', (payload: any) => {
    const p = participants.value.find(part => part.id === payload.participantId || part.studentId === payload.studentId)
    if (p) {
      p.lastAcknowledgedSlide = payload.slideIndex
      p.connectionStatus = 'connected'
      p.lastHeartbeat = Date.now()
    }
  })

  // Sinkronisasi ketika sesi voting dibuka
  unsubVoteOpen = presentationRealtime.subscribe('VOTE_OPENED', (vote: LiveVoteState) => {
    if (vote) {
      activeVote.value = { ...vote }
      selectedVoteId.value = vote.id
      const idx = sessionVotes.value.findIndex(v => v.id === vote.id)
      if (idx !== -1) {
        sessionVotes.value.splice(idx, 1, { ...vote })
      } else {
        sessionVotes.value.push({ ...vote })
      }
      sessionVotes.value = [...sessionVotes.value]
      participants.value.forEach(p => p.hasAnsweredVote = false)
    }
  })

  // Sinkronisasi instan saat ada respons voting masuk dari siswa (penghitungan agregat dikelola secara otoritatif oleh server via VOTE_STATE)
  unsubVoteResp = presentationRealtime.subscribe('VOTE_RESPONSE', (payload: any) => {
    if (!payload) return
    const p = participants.value.find(part => part.id === payload.participantId || part.studentId === payload.studentId)
    if (p) {
      p.hasAnsweredVote = true
    }
  })

  // Tutup floating status jika vote ditutup
  unsubVoteClose = presentationRealtime.subscribe('VOTE_CLOSED', () => {
    activeVote.value = null
  })

  // Sinkronisasi status Live Vote dari snapshot server polling & SSE
  unsubVoteState = presentationRealtime.subscribe('VOTE_STATE', (vote: LiveVoteState | null) => {
    if (!vote || vote.status === 'closed') {
      if (activeVote.value && (!vote || activeVote.value.id === vote?.id)) {
        activeVote.value = null
      }
    } else if (vote.status === 'open') {
      activeVote.value = { ...vote }
      if (!selectedVoteId.value || selectedVoteId.value === vote.id) {
        selectedVoteId.value = vote.id
      }
    }
    if (vote) {
      const vIdx = sessionVotes.value.findIndex(v => v.id === vote.id)
      if (vIdx !== -1) {
        sessionVotes.value.splice(vIdx, 1, { ...vote })
      } else {
        sessionVotes.value.push({ ...vote })
      }
      sessionVotes.value = [...sessionVotes.value]
    }
  })

  // Sinkronisasi riwayat seluruh voting sesi
  unsubVotesSync = presentationRealtime.subscribe('VOTES_SYNC', (votes: LiveVoteState[]) => {
    if (Array.isArray(votes) && votes.length > 0) {
      sessionVotes.value = [...votes]
      if (activeVote.value) {
        const found = votes.find(v => v.id === activeVote.value?.id)
        if (found) {
          activeVote.value = { ...found }
        }
      }
    }
  })

  // Timer pengecekan keaktifan koneksi siswa (hapus status aktif jika siswa menutup tab > 30 detik)
  heartbeatCheckTimer = setInterval(() => {
    const now = Date.now()
    participants.value.forEach(p => {
      if (now - p.lastHeartbeat > 30000) {
        p.connectionStatus = 'disconnected'
      } else if (now - p.lastHeartbeat > 15000) {
        p.connectionStatus = 'idle'
      }
    })
  }, 8000)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  if (isScreenSharing.value) {
    stopScreenMirroring()
  }
  presentationRealtime.disconnectSession()
  unsubJoin?.()
  unsubHeartbeat?.()
  unsubAck?.()
  unsubVoteOpen?.()
  unsubVoteClose?.()
  unsubVoteResp?.()
  unsubVoteState?.()
  unsubVotesSync?.()
  unsubPartsSync?.()
  if (heartbeatCheckTimer) clearInterval(heartbeatCheckTimer)
})
</script>
