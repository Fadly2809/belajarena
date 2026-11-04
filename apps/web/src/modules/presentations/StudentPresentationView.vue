<template>
  <div class="min-h-screen bg-surface-950 text-white flex flex-col justify-between selection:bg-primary-500 selection:text-white">
    <!-- Modal Masukkan Nama Real Siswa jika belum login / belum ada nama tersimpan -->
    <div
      v-if="showNamePrompt"
      class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div class="bg-surface-900 border border-surface-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
        <div class="text-center space-y-1">
          <div class="w-12 h-12 bg-primary-600/30 text-primary-400 rounded-xl flex items-center justify-center text-2xl mx-auto mb-2">
            👤
          </div>
          <h2 class="text-base font-bold text-white">Masukkan Nama Anda</h2>
          <p class="text-xs text-surface-300 font-medium">Nama Anda akan tampil di layar guru sebagai peserta yang terhubung secara real-time.</p>
        </div>
        <form @submit.prevent="saveStudentName" class="space-y-3">
          <input
            v-model="inputStudentName"
            type="text"
            required
            placeholder="Contoh: Rian Pratama"
            class="w-full py-2.5 px-3.5 bg-surface-950 border border-surface-600 rounded-xl text-white placeholder-surface-400 font-semibold focus:outline-none focus:border-primary-500 text-sm"
          />
          <button
            type="submit"
            :disabled="!inputStudentName.trim()"
            class="btn btn-primary w-full py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary-600/30"
          >
            Masuk ke Presentasi 🚀
          </button>
        </form>
      </div>
    </div>

    <!-- Top Mobile / Desktop Header -->
    <header class="h-14 bg-surface-900/90 backdrop-blur-md border-b border-surface-800 px-4 flex items-center justify-between gap-3 sticky top-0 z-30 shadow-md">
      <div class="flex items-center gap-3 min-w-0">
        <router-link
          to="/student"
          class="btn-icon bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white px-2 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition shrink-0"
          title="Keluar ke Portal Siswa"
        >
          <span>←</span>
          <span class="hidden sm:inline">Portal Siswa</span>
        </router-link>
        <img
          src="/logo-icon.png"
          alt="Belajarena"
          class="w-8 h-8 rounded-xl object-contain shadow shrink-0"
        />
        <div class="truncate">
          <h1 class="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-md">
            {{ sessionInfo.title }}
          </h1>
          <p class="text-[10px] text-surface-400">
            {{ sessionInfo.teacher }} &bull; {{ sessionInfo.classroom }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <!-- Live Synchronization Badge -->
        <div
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border"
          :class="isSyncing ? 'bg-amber-950 text-amber-400 border-amber-800' : 'bg-emerald-950 text-emerald-400 border-emerald-800'"
        >
          <span class="w-2 h-2 rounded-full" :class="isSyncing ? 'bg-amber-400 animate-spin' : 'bg-emerald-400 animate-pulse'"></span>
          <span class="hidden sm:inline">{{ isSyncing ? 'Sinkronisasi...' : 'Tersinkronisasi' }}</span>
          <span class="sm:hidden font-mono">#{{ currentSlide }}</span>
        </div>

        <!-- Landscape Fullscreen Toggle Button -->
        <button
          @click="toggleFullscreenLandscape"
          class="px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-sm"
          :class="isFullscreenLandscape ? 'bg-primary-600 text-white border-primary-400 shadow-primary-500/30 ring-1 ring-primary-400' : 'bg-surface-800 text-surface-200 hover:text-white border-surface-700'"
          title="Mode Landscape Layar Penuh (Fullscreen)"
        >
          <span>🔄</span>
          <span class="text-[11px] font-bold">{{ isFullscreenLandscape ? 'Keluar' : 'Landscape' }}</span>
        </button>
      </div>
    </header>

    <!-- Main Slide or Live Web Demo Viewport -->
    <main class="flex-1 flex flex-col items-center justify-center p-2 sm:p-6 overflow-hidden relative">
      <!-- Locked Screen Banner if Teacher Pauses Session -->
      <transition
        enter-active-class="transform ease-out duration-300"
        enter-from-class="scale-95 opacity-0"
        enter-to-class="scale-100 opacity-100"
      >
        <div
          v-if="isLocked"
          class="absolute inset-0 z-20 bg-surface-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 space-y-3"
        >
          <div class="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center text-3xl animate-bounce-short">
            🔒
          </div>
          <h2 class="text-xl font-black text-white">Layar Dijeda Sementara oleh Guru</h2>
          <p class="text-xs text-surface-400 max-w-sm">
            Fokuslah mendengarkan penjelasan dari guru di depan kelas. Layar slide akan otomatis kembali saat guru membuka kunci.
          </p>
        </div>
      </transition>

      <!-- VIEWPORT 1: LIVE WEB DEMO BROADCAST FROM TEACHER (MURNI TAMPILAN WEB TANPA TOOLBAR GURU) -->
      <div
        v-if="liveWebDemo && liveWebDemo.isActive"
        :class="[
          isFullscreenLandscape
            ? 'fixed inset-0 z-50 bg-black flex flex-col overflow-hidden'
            : 'w-full h-full max-w-6xl flex-1 flex flex-col bg-black rounded-2xl shadow-2xl overflow-hidden'
        ]"
        :style="isFullscreenLandscape && isPortrait ? {
          position: 'fixed',
          top: '0px',
          left: '0px',
          width: `${viewportHeight}px`,
          height: `${viewportWidth}px`,
          transformOrigin: 'top left',
          transform: `translateX(${viewportWidth}px) rotate(90deg)`,
          zIndex: 60,
        } : isFullscreenLandscape ? {
          position: 'fixed',
          top: '0px',
          left: '0px',
          width: '100vw',
          height: '100vh',
          zIndex: 60,
        } : {}"
      >
        <!-- Floating Close Button when in Fullscreen Landscape -->
        <button
          v-if="isFullscreenLandscape"
          @click="toggleFullscreenLandscape"
          class="absolute top-3 right-3 z-50 px-3.5 py-1.5 rounded-full bg-black/85 hover:bg-black text-white text-xs font-bold border border-white/20 backdrop-blur-md flex items-center gap-1.5 shadow-2xl transition"
        >
          <span>✕</span>
          <span>Keluar Fullscreen</span>
        </button>

        <!-- Web Demo Scaled Container: 100% Murni Tampilan Web Tanpa Toolbar Guru -->
        <div
          ref="demoContainerRef"
          class="flex-1 w-full h-full bg-black overflow-hidden relative flex items-center justify-center select-none min-h-0"
        >
          <!-- JIKA MODE SCREEN MIRRORING (GURU BAGIKAN LAYAR): TAMPILKAN LIVE SCREEN STREAM GURU SECARA REALTIME -->
          <div
            v-if="liveWebDemo.mode === 'screen'"
            class="w-full h-full flex items-center justify-center bg-black relative"
          >
            <img
              v-if="liveScreenFrame"
              :src="liveScreenFrame"
              alt="Live Screen Teacher"
              class="w-full h-full object-contain pointer-events-none select-none"
              style="image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;"
            />
            <div v-else class="flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-2xl animate-pulse">
                📡
              </div>
              <p class="font-bold text-sm">Menghubungkan ke Siaran Layar Guru...</p>
              <p class="text-xs text-surface-400">Guru sedang menyiapkan siaran langsung demonstrasi layar.</p>
            </div>
          </div>

          <!-- JIKA MODE EMBED WEB LAINNYA: TAMPILKAN IFRAME 1280x720 TERSKALA AGAR SELURUH KONTEN PAS DI LAYAR HP SISWA -->
          <div
            v-else
            class="relative overflow-hidden bg-white shadow-2xl rounded-lg shrink-0"
            :style="{
              width: `${Math.round(1280 * calculatedDemoScale)}px`,
              height: `${Math.round(720 * calculatedDemoScale)}px`
            }"
          >
            <!-- Iframe rendered with 1280x720 desktop dimensions, pinned at top:0 left:0 and scaled from top-left -->
            <div
              class="absolute top-0 left-0 origin-top-left shrink-0 pointer-events-none select-none"
              :style="{
                width: '1280px',
                height: '720px',
                transform: `scale(${calculatedDemoScale})`,
                transformOrigin: 'top left'
              }"
            >
              <iframe
                :key="iframeKey"
                :src="getEmbedUrl(liveWebDemo.url)"
                class="w-[1280px] h-[720px] border-0 pointer-events-none select-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                tabindex="-1"
              ></iframe>

              <!-- Full-Coverage Interaction Shield: Blocks ALL touch, drag, swipe, or click gestures from moving items -->
              <div
                class="absolute inset-0 z-30 pointer-events-auto select-none bg-transparent cursor-default"
                @touchstart.prevent.stop
                @touchmove.prevent.stop
                @touchend.prevent.stop
                @mousedown.prevent.stop
                @click.prevent.stop
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- VIEWPORT 2: REGULAR SLIDE MIRRORING -->
      <div
        v-else
        :class="[
          isFullscreenLandscape
            ? 'fixed inset-0 z-50 bg-black flex items-center justify-center p-2 overflow-hidden'
            : 'w-full max-w-4xl flex items-center justify-center relative my-auto p-1 sm:p-2'
        ]"
        :style="isFullscreenLandscape && isPortrait ? {
          position: 'fixed',
          top: '0px',
          left: '0px',
          width: `${viewportHeight}px`,
          height: `${viewportWidth}px`,
          transformOrigin: 'top left',
          transform: `translateX(${viewportWidth}px) rotate(90deg)`,
          zIndex: 60,
        } : isFullscreenLandscape ? {
          position: 'fixed',
          top: '0px',
          left: '0px',
          width: '100vw',
          height: '100vh',
          zIndex: 60,
        } : {}"
      >
        <!-- Floating Close Button when in Fullscreen -->
        <button
          v-if="isFullscreenLandscape"
          @click="toggleFullscreenLandscape"
          class="absolute top-3 right-3 z-40 px-3.5 py-1.5 rounded-full bg-black/80 hover:bg-black text-white text-xs font-bold border border-white/20 backdrop-blur-md flex items-center gap-1.5 shadow-2xl transition"
        >
          <span>✕</span>
          <span>Keluar Fullscreen</span>
        </button>

        <!-- Dedicated Strict 16:9 Slide Canvas (Matching Teacher Studio 1:1) -->
        <div
          class="relative w-full aspect-video max-h-full max-w-full bg-surface-950 rounded-xl sm:rounded-2xl border border-surface-800 shadow-2xl overflow-hidden flex items-center justify-center select-none mx-auto"
          :style="!isFullscreenLandscape ? { transform: `scale(${zoomLevel})` } : {}"
        >
          <!-- Skeleton Loading State jika data slide belum selesai di-fetch -->
          <div v-if="!isSessionLoaded && slideDeck.length === 0" class="flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div class="w-10 h-10 rounded-2xl bg-primary-600/20 border border-primary-500/40 text-primary-400 flex items-center justify-center text-xl animate-spin">
              ⏳
            </div>
            <p class="font-bold text-xs text-white">Menghubungkan ke Presentasi Guru...</p>
          </div>

          <template v-else>
            <!-- Floating Header Badge: Classroom & Subject -->
            <div class="absolute top-2.5 left-3 z-20 px-2.5 py-1 rounded-lg bg-surface-900/90 border border-surface-700/80 backdrop-blur-md flex items-center gap-2 text-[10px] sm:text-xs font-bold text-white shadow-md">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{{ sessionInfo.classroom }} &bull; {{ sessionInfo.subject }}</span>
            </div>

            <!-- Floating Header Badge: Slide Counter -->
            <div class="absolute top-2.5 right-3 z-20 px-2.5 py-1 rounded-lg bg-surface-900/90 border border-surface-700/80 backdrop-blur-md text-[10px] sm:text-xs font-mono font-bold text-amber-300 shadow-md">
              Slide {{ currentSlide }} / {{ totalSlides }}
            </div>

            <!-- Slide Content Visual (Image or Text) -->
            <div v-if="activeSlideContent.image" class="w-full h-full flex items-center justify-center bg-black relative">
              <img
                :src="activeSlideContent.image"
                :alt="activeSlideContent.title || 'Slide Visual'"
                class="w-full h-full object-contain pointer-events-none select-none"
              />
            </div>
            <div v-else class="p-6 text-center max-w-xl mx-auto space-y-3">
              <span class="text-4xl sm:text-5xl block animate-bounce-short">
                {{ activeSlideContent.icon || '📖' }}
              </span>
              <h2 class="text-lg sm:text-2xl font-black text-white tracking-tight leading-snug">
                {{ activeSlideContent.title }}
              </h2>
              <p class="text-xs sm:text-sm text-surface-200 leading-relaxed whitespace-pre-line font-medium">
                {{ activeSlideContent.description || (activeSlideContent as any).content }}
              </p>
            </div>

            <!-- Laser Pointer Dot Mirroring Teacher's Pointer (Placed inside the 16:9 canvas) -->
            <div
              v-if="teacherLaser.active"
              class="pointer-events-none absolute z-30 transform -translate-x-1/2 -translate-y-1/2 transition-[top,left] duration-[50ms] ease-linear"
              :style="{ top: `${teacherLaser.y}%`, left: `${teacherLaser.x}%` }"
            >
              <div class="w-6 h-6 rounded-full bg-rose-500 shadow-[0_0_20px_#ff0055,0_0_35px_#ff0000] border-2 border-white animate-pulse relative"></div>
              <div class="w-12 h-12 -top-3 -left-3 absolute rounded-full bg-rose-500/25 blur-sm pointer-events-none"></div>
            </div>

            <!-- Floating Watermark Footer -->
            <div class="absolute bottom-2 left-3 z-20 text-[9px] sm:text-[10px] text-surface-300 font-semibold bg-surface-950/80 px-2.5 py-0.5 rounded-md backdrop-blur-md border border-white/5">
              Belajarena &bull; Terhubung Realtime
            </div>
          </template>
        </div>
      </div>

      <!-- Mobile Floating Landscape Toggle for Quick Access on Smartphones -->
      <button
        v-if="!isFullscreenLandscape"
        @click="toggleFullscreenLandscape"
        class="sm:hidden fixed bottom-4 right-4 z-40 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 text-white font-black text-xs shadow-2xl flex items-center gap-2 border border-primary-400/50 active:scale-95 transition"
      >
        <span class="text-sm">🔄</span>
        <span>Landscape Layar Penuh</span>
      </button>

      <!-- Zoom and Floating Controls at Bottom of Slide (only when not in web demo) -->
      <div
        v-if="!liveWebDemo || !liveWebDemo.isActive"
        class="mt-3 flex items-center gap-2 bg-surface-900/90 border border-surface-700 px-3.5 py-1.5 rounded-full text-xs text-surface-200 shadow-md"
      >
        <button @click="zoomLevel = Math.max(0.8, zoomLevel - 0.1)" class="hover:text-white px-2 py-0.5 rounded bg-surface-800 text-white font-bold">-</button>
        <span class="font-mono text-xs font-bold text-amber-300">{{ Math.round(zoomLevel * 100) }}%</span>
        <button @click="zoomLevel = Math.min(1.4, zoomLevel + 0.1)" class="hover:text-white px-2 py-0.5 rounded bg-surface-800 text-white font-bold">+</button>
        <button @click="zoomLevel = 1.0" class="hover:text-white ml-1 text-xs text-primary-400 font-bold">Reset</button>
      </div>
    </main>

    <!-- LIVE VOTING FLOATING OVERLAY DI LAYAR SISWA (OVERLAY Z-[100] DI ATAS SEMUA VIEW) -->
    <transition
      enter-active-class="transform ease-out duration-300"
      enter-from-class="translate-y-8 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transform ease-in duration-200"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-8 opacity-0"
    >
      <div
        v-if="activeVote && activeVote.status === 'open' && !isSessionEnded && !dismissedVoteIds.has(activeVote.id)"
        class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm pointer-events-auto"
      >
        <div class="bg-surface-900 border-2 border-primary-500 shadow-2xl p-5 sm:p-6 max-w-xl w-full rounded-2xl sm:rounded-3xl space-y-4 relative">
          <!-- Close / Minimize Button -->
          <button
            @click="dismissVoteModal"
            class="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white flex items-center justify-center font-bold text-sm transition"
            title="Tutup / Kembali ke Slide"
          >
            ✕
          </button>

          <div class="flex items-center gap-3 pr-8 pb-3 border-b border-surface-800">
            <span class="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white font-black flex items-center justify-center text-xl shadow-lg shrink-0">
              📊
            </span>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary-950 text-primary-300 border border-primary-800">
                  Pertanyaan Interaktif
                </span>
              </div>
              <h3 class="text-sm sm:text-base font-black text-white mt-1 leading-snug">{{ activeVote.question }}</h3>
            </div>
          </div>

          <!-- Response Forms based on Vote Type (Active & Not Submitted) -->
          <div v-if="!hasSubmitted && activeVote.status === 'open'" class="space-y-3 pt-1">
            <!-- Choice Options (Single Choice, Yes/No, True/False, Rating Scale) -->
            <div v-if="activeVote.type !== 'short_text'" class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                v-for="(opt, idx) in (activeVote.options && activeVote.options.length ? activeVote.options : [
                  { id: 'yes', text: 'Ya (Setuju)' },
                  { id: 'no', text: 'Tidak (Tidak Setuju)' }
                ])"
                :key="opt.id || idx"
                @click="selectedOptionId = opt.id"
                :class="[
                  'p-3.5 sm:p-4 rounded-xl border-2 text-left text-xs font-bold transition flex items-center gap-3 active:scale-95',
                  selectedOptionId === opt.id
                    ? 'bg-primary-600 border-primary-300 text-white shadow-xl shadow-primary-600/30 ring-2 ring-primary-300'
                    : 'bg-surface-950 border-surface-700/80 text-white hover:border-primary-400 hover:bg-surface-800'
                ]"
              >
                <span
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 text-white shadow"
                  :class="[
                    idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-purple-600' : idx === 2 ? 'bg-amber-600' : idx === 3 ? 'bg-emerald-600' : 'bg-pink-600'
                  ]"
                >
                  {{ activeVote.type === 'rating_scale' ? (idx + 1) : (['A', 'B', 'C', 'D', 'E'][idx] || (idx + 1)) }}
                </span>
                <span class="truncate text-white font-bold">{{ opt.text }}</span>
              </button>
            </div>

            <!-- Short Text Input -->
            <div v-else class="space-y-2">
              <textarea
                v-model="shortAnswerText"
                rows="3"
                placeholder="Tuliskan jawaban Anda di sini..."
                class="w-full p-3.5 bg-surface-950 border-2 border-surface-700 rounded-xl text-white text-xs placeholder-surface-500 font-semibold focus:outline-none focus:border-primary-500 resize-none shadow-inner"
              ></textarea>
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end pt-2">
              <button
                @click="submitStudentVote"
                :disabled="activeVote.type === 'short_text' ? !shortAnswerText.trim() : !selectedOptionId"
                class="btn bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm px-7 py-3 rounded-xl shadow-xl shadow-primary-600/30 w-full sm:w-auto disabled:opacity-40 transition active:scale-95"
              >
                Kirim Jawaban Saya 🚀
              </button>
            </div>
          </div>

          <!-- Submitted Confirmation State with Auto-Dismiss & Return Button -->
          <div v-else class="p-6 bg-emerald-950/80 border-2 border-emerald-600 rounded-2xl text-center space-y-3">
            <span class="text-5xl block animate-bounce-short">✅</span>
            <p class="font-black text-white text-base">Jawaban Anda Telah Terkirim!</p>
            <p class="text-xs text-emerald-200">
              {{ activeVote.isAnonymous ? 'Jawaban Anda bersifat anonim dan tersimpan aman.' : 'Jawaban telah tercatat pada sesi pembelajaran guru.' }}
            </p>
            <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                @click="dismissVoteModal"
                class="btn bg-primary-600 hover:bg-primary-500 text-white font-black px-6 py-2.5 text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
              >
                <span>Kembali ke Slide Presentasi</span>
                <span class="font-mono text-amber-300">({{ autoDismissCountdown }}s) ➔</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Sesi Berakhir (Otomatis Kembali ke Dashboard Siswa) -->
    <transition
      enter-active-class="transform ease-out duration-300"
      enter-from-class="scale-95 opacity-0"
      enter-to-class="scale-100 opacity-100"
    >
      <div
        v-if="isSessionEnded"
        class="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 select-none"
      >
        <div class="bg-surface-900 border-2 border-emerald-500/80 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 text-center shadow-2xl">
          <div class="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-3xl mx-auto shadow-lg animate-bounce-short">
            🎓
          </div>
          <div class="space-y-2">
            <span class="text-[10px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
              Sesi Pembelajaran Selesai
            </span>
            <h2 class="text-lg sm:text-xl font-black text-white">
              Terima Kasih Telah Mengikuti Sesi!
            </h2>
            <p class="text-xs text-surface-300 font-medium leading-relaxed">
              Guru telah mengakhiri sesi presentasi ini. Seluruh partisipasi dan jawaban Anda telah tercatat dengan baik.
            </p>
          </div>

          <div class="p-3 bg-surface-950 rounded-2xl border border-surface-800 flex items-center justify-center gap-2 text-xs text-amber-300 font-mono">
            <span>Kembali ke Portal Siswa dalam</span>
            <strong class="text-sm font-black">{{ sessionEndCountdown }}s</strong>
          </div>

          <button
            @click="redirectToStudentDashboard"
            class="btn bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm py-3 px-6 rounded-2xl shadow-xl shadow-emerald-600/30 w-full flex items-center justify-center gap-2 transition active:scale-95"
          >
            <span>Kembali ke Dashboard Siswa Sekarang ➔</span>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import {
  presentationRealtime,
  type SlideState,
  type LiveVoteState,
  type WebDemoState,
  getWebDemoState,
} from '@/services/realtimePresentation'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const accessCode = (route.params.code as string) || 'PRS-7A'

const isSyncing = ref(false)
const isLocked = ref(false)
const currentSlide = ref(1)
const totalSlides = ref(5)
const zoomLevel = ref(1.0)

// Status Sesi Selesai & Auto-Redirect ke Dashboard Siswa
const isSessionEnded = ref(false)
const sessionEndCountdown = ref(2)
let sessionEndTimer: any = null

function redirectToStudentDashboard() {
  if (sessionEndTimer) {
    clearInterval(sessionEndTimer)
    sessionEndTimer = null
  }
  // Keluar dari native fullscreen jika aktif
  try {
    if (document.fullscreenElement) {
      document.exitFullscreen?.()
    }
    const orientation = screen.orientation as any
    if (orientation && orientation.unlock) {
      orientation.unlock()
    }
  } catch (_) {}

  presentationRealtime.disconnectSession()
  router.push('/student')
}

function handleSessionEnded() {
  dismissVoteModal()
  if (isSessionEnded.value) return
  isSessionEnded.value = true
  sessionEndCountdown.value = 2

  // Keluar dari landscape fullscreen
  isFullscreenLandscape.value = false
  try {
    if (document.fullscreenElement) {
      document.exitFullscreen?.()
    }
  } catch (_) {}

  if (sessionEndTimer) clearInterval(sessionEndTimer)
  sessionEndTimer = setInterval(() => {
    sessionEndCountdown.value--
    if (sessionEndCountdown.value <= 0) {
      redirectToStudentDashboard()
    }
  }, 1000)
}

// Embed URL Helper dengan Web Proxy Bypass Header
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

// Realtime Web Demo Broadcast State from Teacher
const liveWebDemo = ref<WebDemoState | null>(null)
const liveScreenFrame = ref<string | null>(null)
const iframeKey = ref(1)

function reloadStudentIframe() {
  iframeKey.value++
}

// Fullscreen Landscape & Responsive Viewport State for Mobile Students
const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 390)
const viewportHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 844)
const isFullscreenLandscape = ref(false)
const isPortrait = ref(typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : false)

function updateViewportDimensions() {
  if (typeof window !== 'undefined') {
    viewportWidth.value = window.innerWidth
    viewportHeight.value = window.innerHeight
    isPortrait.value = window.innerHeight > window.innerWidth
  }
}

// Web Demo Scaled Desktop Container State
const demoContainerRef = ref<HTMLElement | null>(null)
const demoContainerWidth = ref(360)
const demoContainerHeight = ref(400)
let demoResizeObserver: ResizeObserver | null = null

function updateDemoDimensions() {
  updateViewportDimensions()

  if (demoContainerRef.value) {
    const cw = demoContainerRef.value.clientWidth
    const ch = demoContainerRef.value.clientHeight
    if (cw > 0 && ch > 0) {
      demoContainerWidth.value = cw
      demoContainerHeight.value = ch
      return
    }
  }

  // Fallback calculation based on viewport & fullscreen orientation
  if (isFullscreenLandscape.value) {
    if (isPortrait.value) {
      // Pada orientasi portrait yang dirotasi 90deg, lebar visual adalah tinggi layar
      demoContainerWidth.value = Math.max(320, viewportHeight.value - 24)
      demoContainerHeight.value = Math.max(200, viewportWidth.value - 60)
    } else {
      demoContainerWidth.value = Math.max(320, viewportWidth.value - 24)
      demoContainerHeight.value = Math.max(200, viewportHeight.value - 60)
    }
  } else {
    demoContainerWidth.value = Math.max(300, viewportWidth.value - 24)
    demoContainerHeight.value = Math.max(240, Math.round(viewportHeight.value * 0.55))
  }
}

const calculatedDemoScale = computed(() => {
  const w = demoContainerWidth.value || 360
  const h = demoContainerHeight.value || 400
  const scaleW = w / 1280
  const scaleH = h / 720
  // Aspect-fit 16:9 desktop (1280x720) agar 100% seluruh konten web desktop pas sempurna di layar HP siswa tanpa terpotong
  const base = Math.min(scaleW, scaleH > 0.05 ? scaleH : scaleW)
  return Math.max(0.18, Math.min(1.5, base))
})

watch([liveWebDemo, isFullscreenLandscape, isPortrait], () => {
  nextTick(() => {
    updateDemoDimensions()
    if (demoContainerRef.value && demoResizeObserver) {
      demoResizeObserver.observe(demoContainerRef.value)
    }
    setTimeout(() => {
      updateDemoDimensions()
    }, 100)
  })
})

const sessionInfo = ref({
  id: '',
  title: 'Materi Pembelajaran Interaktif',
  teacher: 'Guru Pengampu',
  classroom: 'Kelas',
  subject: 'Mata Pelajaran'
})

async function toggleFullscreenLandscape() {
  isFullscreenLandscape.value = !isFullscreenLandscape.value

  if (isFullscreenLandscape.value) {
    // 1. Coba standar fullscreen native browser
    try {
      const docEl = document.documentElement as any
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen()
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen()
      } else if (docEl.mozRequestFullScreen) {
        await docEl.mozRequestFullScreen()
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen()
      }
    } catch (_) {}

    // 2. Coba kunci orientasi layar ke mode landscape (Android & modern browsers)
    try {
      const orientation = screen.orientation as any
      if (orientation && orientation.lock) {
        await orientation.lock('landscape')
      } else if ((screen as any).lockOrientation) {
        (screen as any).lockOrientation('landscape')
      }
    } catch (_) {}
  } else {
    // Keluar dari native fullscreen jika aktif
    try {
      const doc = document as any
      if (doc.exitFullscreen && doc.fullscreenElement) {
        await doc.exitFullscreen()
      } else if (doc.webkitExitFullscreen && doc.webkitFullscreenElement) {
        await doc.webkitExitFullscreen()
      }
    } catch (_) {}

    // Buka kembali orientasi layar
    try {
      const orientation = screen.orientation as any
      if (orientation && orientation.unlock) {
        orientation.unlock()
      } else if ((screen as any).unlockOrientation) {
        (screen as any).unlockOrientation()
      }
    } catch (_) {}
  }

  nextTick(() => {
    updateDemoDimensions()
    setTimeout(() => {
      updateDemoDimensions()
    }, 120)
  })
}

// Laser Pointer State dari Guru
const teacherLaser = ref({ active: false, x: 50, y: 50 })
let unsubLaser: (() => void) | null = null

// Identitas Siswa Real
const savedName = localStorage.getItem('student_presentation_name') || ''
const showNamePrompt = ref(!authStore.user?.name && !savedName)
const inputStudentName = ref('')

const studentIdentity = ref({
  id: authStore.user?.id || (localStorage.getItem('student_presentation_id') || `st_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`),
  studentId: authStore.user?.id || (localStorage.getItem('student_presentation_id') || `st_${Date.now()}`),
  name: authStore.user?.name || savedName || 'Peserta',
  nis: authStore.user?.username || authStore.user?.email || '-'
})

async function joinSession() {
  try {
    const res = await api.post('/presentation-sessions/join', {
      accessCode,
      sessionId: sessionInfo.value.id || accessCode,
      studentId: studentIdentity.value.studentId,
      studentName: studentIdentity.value.name,
      nis: studentIdentity.value.nis,
      classroom: sessionInfo.value.classroom
    })
    if (res.data?.data) {
      const s = res.data.data.session
      if (s) {
        sessionInfo.value.id = s.id || sessionInfo.value.id
        sessionInfo.value.title = s.title || sessionInfo.value.title
        sessionInfo.value.classroom = s.classroom || sessionInfo.value.classroom
        sessionInfo.value.subject = s.subject || sessionInfo.value.subject
        if (s.activeSlide) currentSlide.value = Number(s.activeSlide)
        if (Array.isArray(s.slides) && s.slides.length > 0) {
          slideDeck.value = s.slides
          totalSlides.value = s.slides.length
        }
      }
    }
  } catch (err) {
    console.warn('Gagal bergabung ke sesi via API:', err)
  }
}

async function saveStudentName() {
  const trimmed = inputStudentName.value.trim()
  if (!trimmed) return
  studentIdentity.value.name = trimmed
  localStorage.setItem('student_presentation_name', trimmed)
  localStorage.setItem('student_presentation_id', studentIdentity.value.id)
  showNamePrompt.value = false

  // Daftarkan dan broadcast kehadiran siswa real ke panel guru
  await joinSession()
  broadcastJoin()
  sendHeartbeat()
}

// Slide Deck Materi Real (Inisialisasi kosong murni agar bebas dari flash dummy presentasi)
const isSessionLoaded = ref(false)
const slideDeck = ref<Array<{ icon?: string; title: string; description?: string; content?: string; image?: string }>>([])

const activeSlideContent = computed(() => {
  if (slideDeck.value.length === 0) {
    return {
      icon: '📖',
      title: sessionInfo.value.title || 'Materi Pembelajaran',
      description: 'Menghubungkan ke presentasi interaktif...',
      image: undefined
    }
  }
  return slideDeck.value[(currentSlide.value - 1) % slideDeck.value.length]
})

// Voting State for Student
const activeVote = ref<LiveVoteState | null>(null)
const selectedOptionId = ref<string | null>(null)
const shortAnswerText = ref('')
const hasSubmitted = ref(false)
const autoDismissCountdown = ref(3)
let autoDismissTimer: any = null
const dismissedVoteIds = ref<Set<string>>(new Set())
const submittedVoteIds = ref<Set<string>>(new Set())

function dismissVoteModal() {
  if (autoDismissTimer) {
    clearInterval(autoDismissTimer)
    autoDismissTimer = null
  }
  if (activeVote.value?.id) {
    dismissedVoteIds.value.add(activeVote.value.id)
  }
  activeVote.value = null
  selectedOptionId.value = null
  shortAnswerText.value = ''
}

function submitStudentVote() {
  if (!activeVote.value) return
  const answerId = activeVote.value.type === 'short_text' ? shortAnswerText.value.trim() : selectedOptionId.value
  if (!answerId) return

  submittedVoteIds.value.add(activeVote.value.id)
  hasSubmitted.value = true
  autoDismissCountdown.value = 3

  // Broadcast respons instan ke Teacher Studio (server otomatis menandai siswa sudah menjawab)
  presentationRealtime.broadcast('VOTE_RESPONSE', {
    voteId: activeVote.value.id,
    participantId: studentIdentity.value.id,
    studentId: studentIdentity.value.studentId,
    selectedOptionId: answerId,
    timestamp: Date.now()
  })

  // Hitung mundur otomatis 3 detik lalu kembali ke slide
  if (autoDismissTimer) clearInterval(autoDismissTimer)
  autoDismissTimer = setInterval(() => {
    autoDismissCountdown.value--
    if (autoDismissCountdown.value <= 0) {
      dismissVoteModal()
    }
  }, 1000)
}

function acknowledgeActiveSlide() {
  presentationRealtime.broadcast('SLIDE_ACK', {
    participantId: studentIdentity.value.id,
    studentId: studentIdentity.value.studentId,
    slideIndex: currentSlide.value,
    timestamp: Date.now()
  })
}

function broadcastJoin() {
  presentationRealtime.broadcast('STUDENT_JOINED', {
    id: studentIdentity.value.id,
    studentId: studentIdentity.value.studentId,
    name: studentIdentity.value.name,
    nis: studentIdentity.value.nis,
    classroom: sessionInfo.value.classroom,
    lastAcknowledgedSlide: currentSlide.value,
    timestamp: Date.now()
  })
}

function sendHeartbeat() {
  presentationRealtime.broadcast('PARTICIPANT_HEARTBEAT', {
    participantId: studentIdentity.value.id,
    studentId: studentIdentity.value.studentId,
    name: studentIdentity.value.name,
    nis: studentIdentity.value.nis,
    classroom: sessionInfo.value.classroom,
    connectionStatus: 'connected',
    currentSlide: currentSlide.value,
    hasAnsweredVote: hasSubmitted.value || (activeVote.value ? submittedVoteIds.value.has(activeVote.value.id) : false),
    timestamp: Date.now()
  })
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}

// Realtime listeners
let unsubSlide: (() => void) | null = null
let unsubVoteOpen: (() => void) | null = null
let unsubVoteClose: (() => void) | null = null
let unsubVoteState: (() => void) | null = null
let unsubSessionEnd: (() => void) | null = null
let unsubWebDemo: (() => void) | null = null
let unsubScreenFrame: (() => void) | null = null
let unsubTransition: (() => void) | null = null
let heartbeatTimer: any = null

// 3.5: Wake Lock API untuk menjaga layar HP siswa tetap menyala selama presentasi
let wakeLockSentinel: any = null

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator && (navigator as any).wakeLock?.request) {
      wakeLockSentinel = await (navigator as any).wakeLock.request('screen')
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null
      })
    }
  } catch (err) {
    console.debug('Wake lock request not available or rejected:', err)
  }
}

function releaseWakeLock() {
  if (wakeLockSentinel) {
    try {
      wakeLockSentinel.release()
    } catch (_) {}
    wakeLockSentinel = null
  }
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible' && !wakeLockSentinel) {
    requestWakeLock()
  }
}

onMounted(async () => {
  requestWakeLock()
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('resize', updateDemoDimensions)
  window.addEventListener('orientationchange', updateDemoDimensions)
  document.addEventListener('fullscreenchange', updateDemoDimensions)
  document.addEventListener('webkitfullscreenchange', updateDemoDimensions)

  if (typeof ResizeObserver !== 'undefined') {
    demoResizeObserver = new ResizeObserver(() => updateDemoDimensions())
    nextTick(() => {
      if (demoContainerRef.value) {
        demoResizeObserver?.observe(demoContainerRef.value)
      }
      updateDemoDimensions()
    })
  }

  // 1. Ambil data sesi & slide materi real dari API berdasarkan kode PIN / ID sesi
  try {
    const res = await api.get(`/presentation-sessions/code/${accessCode}`)
    if (res.data?.data) {
      const data = res.data.data
      sessionInfo.value.id = data.id || sessionInfo.value.id
      sessionInfo.value.title = data.title || sessionInfo.value.title
      sessionInfo.value.teacher = data.teacher || sessionInfo.value.teacher
      sessionInfo.value.classroom = data.classroom || sessionInfo.value.classroom
      sessionInfo.value.subject = data.subject || sessionInfo.value.subject
      if (data.activeSlide) currentSlide.value = Number(data.activeSlide)
      if (Array.isArray(data.slides) && data.slides.length > 0) {
        slideDeck.value = data.slides
        totalSlides.value = data.slides.length
      }
      if (data.webDemo) {
        liveWebDemo.value = data.webDemo.isActive ? data.webDemo : null
      }
      if (data.activeVote && data.activeVote.status === 'open' && !dismissedVoteIds.value.has(data.activeVote.id)) {
        activeVote.value = data.activeVote
      }
    }
  } catch (err) {
    console.warn('Load session from code fallback:', err)
  } finally {
    isSessionLoaded.value = true
  }

  // 2. Hubungkan ke engine realtime sesi (SSE / Network Sync)
  presentationRealtime.connectSession(sessionInfo.value.id || accessCode, 'student')

  // 3. Masukkan siswa ke daftar partisipan resmi server
  await joinSession()

  // 4. Selalu broadcast kehadiran instan agar guru langsung mendeteksi jumlah siswa terhubung
  broadcastJoin()

  // 5. Acknowledge slide awal
  acknowledgeActiveSlide()

  // 6. Heartbeat loop setiap 5 detik agar guru selalu mendeteksi siswa aktif
  sendHeartbeat()
  heartbeatTimer = setInterval(sendHeartbeat, 5000)

  // 7. Listen to teacher slide changes
  unsubSlide = presentationRealtime.subscribe('SLIDE_CHANGED', (payload: SlideState) => {
    isSyncing.value = true
    currentSlide.value = Number(payload.activeSlide)
    if (payload.totalSlides) totalSlides.value = Number(payload.totalSlides)
    isLocked.value = Boolean(payload.isLocked)
    setTimeout(() => {
      isSyncing.value = false
      acknowledgeActiveSlide()
    }, 150)
  })

  // 8. Listen to Laser Pointer Guru secara realtime
  unsubLaser = presentationRealtime.subscribe('LASER_POINTER', (payload: any) => {
    if (payload) {
      teacherLaser.value = {
        active: Boolean(payload.active),
        x: Number(payload.x ?? 50),
        y: Number(payload.y ?? 50)
      }
    }
  })

  // 9. Listen to Teacher Live Web Demo Broadcast (Bebas dari reload loop!)
  unsubWebDemo = presentationRealtime.subscribe('WEB_DEMO_CHANGED', (state: WebDemoState) => {
    const wasActive = liveWebDemo.value?.isActive
    const oldUrl = liveWebDemo.value?.url
    const oldMode = (liveWebDemo.value as any)?.mode
    liveWebDemo.value = (state && state.isActive) ? state : null
    
    // HANYA reload iframe jika URL/Mode benar-benar berganti atau baru pertama kali aktif
    if (state?.isActive && (!wasActive || (state.url && state.url !== oldUrl) || (state.mode && state.mode !== oldMode))) {
      iframeKey.value++
    }
  })

  // 9b. Listen to Live Screen Mirroring Frames from Teacher
  unsubScreenFrame = presentationRealtime.subscribe('WEB_SCREEN_FRAME', (frame: string | null) => {
    liveScreenFrame.value = frame
  })

  // 10. Listen to Vote Opened
  unsubVoteOpen = presentationRealtime.subscribe('VOTE_OPENED', (vote: LiveVoteState) => {
    if (isSessionEnded.value || !vote || vote.status === 'closed') return
    if (dismissedVoteIds.value.has(vote.id)) return
    if (autoDismissTimer) {
      clearInterval(autoDismissTimer)
      autoDismissTimer = null
    }
    if (!activeVote.value || activeVote.value.id !== vote.id) {
      activeVote.value = vote
      selectedOptionId.value = null
      hasSubmitted.value = submittedVoteIds.value.has(vote.id)
    } else {
      activeVote.value = { ...activeVote.value, ...vote }
    }
  })

  // 11. Listen to Vote Closed: tutup overlay seketika dan kembalikan siswa ke slide
  unsubVoteClose = presentationRealtime.subscribe('VOTE_CLOSED', (vote?: LiveVoteState | null) => {
    if (vote?.id) {
      dismissedVoteIds.value.add(vote.id)
    }
    dismissVoteModal()
  })

  // 12. Listen to Continuous Vote State Reconciliation (Anti-Reset & Anti-Stuck)
  unsubVoteState = presentationRealtime.subscribe('VOTE_STATE', (vote: LiveVoteState | null) => {
    if (!vote || vote.status === 'closed' || isSessionEnded.value) {
      if (vote?.id) dismissedVoteIds.value.add(vote.id)
      dismissVoteModal()
    } else if (vote.status === 'open') {
      if (dismissedVoteIds.value.has(vote.id)) {
        dismissVoteModal()
        return
      }
      if (!hasSubmitted.value) {
        if (!activeVote.value || activeVote.value.id !== vote.id) {
          activeVote.value = vote
          selectedOptionId.value = null
          hasSubmitted.value = submittedVoteIds.value.has(vote.id)
        } else {
          activeVote.value = { ...activeVote.value, ...vote }
        }
      }
    }
  })

  // 13. Listen to Session Ended
  unsubSessionEnd = presentationRealtime.subscribe('SESSION_ENDED', () => {
    dismissVoteModal()
    handleSessionEnded()
  })

  // 14. Auto switch jika guru membuka sesi baru
  unsubTransition = presentationRealtime.subscribe('SESSION_TRANSITION', async (payload: any) => {
    if (payload && payload.newSessionId && payload.newSessionId !== sessionInfo.value.id) {
      sessionInfo.value.id = payload.newSessionId
      try {
        const res = await api.get(`/presentation-sessions/${payload.newSessionId}`)
        if (res.data?.data) {
          const s = res.data.data
          sessionInfo.value.title = s.title || sessionInfo.value.title
          sessionInfo.value.classroom = s.classroom || sessionInfo.value.classroom
          sessionInfo.value.subject = s.subject || sessionInfo.value.subject
          if (Array.isArray(s.slides) && s.slides.length > 0) {
            slideDeck.value = s.slides
            totalSlides.value = s.slides.length
          }
          if (s.activeSlide) currentSlide.value = Number(s.activeSlide)
          if (s.webDemo) {
            liveWebDemo.value = s.webDemo.isActive ? s.webDemo : null
          }
        }
      } catch (_) {}
      await joinSession()
      broadcastJoin()
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDemoDimensions)
  window.removeEventListener('orientationchange', updateDemoDimensions)
  document.removeEventListener('fullscreenchange', updateDemoDimensions)
  document.removeEventListener('webkitfullscreenchange', updateDemoDimensions)
  demoResizeObserver?.disconnect()
  presentationRealtime.disconnectSession()
  unsubSlide?.()
  unsubLaser?.()
  unsubWebDemo?.()
  unsubScreenFrame?.()
  unsubVoteOpen?.()
  unsubVoteClose?.()
  unsubVoteState?.()
  unsubTransition?.()
  unsubSessionEnd?.()
  if (heartbeatTimer) clearInterval(heartbeatTimer)
  if (autoDismissTimer) clearInterval(autoDismissTimer)
  if (sessionEndTimer) clearInterval(sessionEndTimer)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  releaseWakeLock()
})
</script>
