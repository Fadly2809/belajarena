<template>
  <div class="space-y-7 animate-fade-in pb-12 font-sans">
    <!-- 1. Header Studio Presentasi -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span>📽️</span> Studio Presentasi & Materi Interaktif
        </h1>
        <p class="text-slate-600 text-sm mt-1 font-medium">
          Layar Proyektor Cermin, konversi PPTX/PDF otomatis, dan peluncur sesi presentasi mirroring HP siswa · <strong class="text-slate-800">SMP Negeri 6 Kendari</strong>
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <span class="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold font-mono shadow-2xs">
          Kurikulum Merdeka (Fase D)
        </span>
        <button
          @click="showUploadModal = true"
          class="px-4 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#082231] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
        >
          <span>📤</span> <span>Unggah / Buat Modul Baru</span>
        </button>
      </div>
    </div>

    <!-- Tab Switcher: Live Presentasi Studio vs Pustaka Materi Ajar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-[22px] border border-slate-200/80 shadow-xs">
      <div class="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100">
        <button
          @click="switchTab('studio')"
          class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2"
          :class="activeTab === 'studio' ? 'bg-[#0c2b3d] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
        >
          <span>📡</span>
          <span>Studio Live Presentasi</span>
          <span v-if="activeSession" class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>
        <button
          @click="switchTab('library')"
          class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2"
          :class="activeTab === 'library' ? 'bg-[#0c2b3d] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
        >
          <span>📚</span>
          <span>Pustaka Materi Ajar (File & Slide)</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded-full" :class="activeTab === 'library' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'">
            {{ presentations.length }}
          </span>
        </button>
      </div>

      <div class="text-xs text-slate-500 font-medium px-2">
        <span v-if="activeTab === 'studio'">⚡ Fokus: Pemaparan cermin proyektor & mirroring HP siswa</span>
        <span v-else>📁 Fokus: Arsip file slide PPTX, PDF & materi pembelajaran</span>
      </div>
    </div>

    <!-- Student PIN Entry Card (Tampil jika role siswa atau di mode live) -->
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
              Masukkan 6 digit kode PIN yang ditampilkan oleh guru di layar proyektor kelas.
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

    <!-- 2. Top 4 Stat Cards Row (Matching Dashboard Theme) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <!-- Card 1: Total Modul Presentasi (Deep Petrol) -->
      <div class="card-stat-petrol group">
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

      <!-- Card 2: Slide Siap Tayang (Warm Honey Amber) -->
      <div class="card-stat-honey group">
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

      <!-- Card 3: Total Sesi Terlaksana (Deep Petrol) -->
      <div class="card-stat-petrol group">
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
          <span class="font-bold">SMPN 6</span>
        </div>
      </div>

      <!-- Card 4: Status Studio Live (Dark Slate Petrol) -->
      <div class="card-stat-dark group">
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

    <!-- 3. Active Live Session Banner (Jika ada sesi tayang langsung) -->
    <div
      v-if="activeSession"
      class="p-6 rounded-[24px] bg-[#0c2b3d] text-white shadow-card border-2 border-[#f59e0b]/60 flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative overflow-hidden"
    >
      <div class="absolute -right-10 -bottom-10 w-44 h-44 bg-[#f59e0b]/10 rounded-full blur-3xl pointer-events-none"></div>

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
        <router-link
          :to="`/presentations/studio/${activeSession.id}`"
          class="px-5 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5"
        >
          <span>Masuk Layar Kontrol Guru</span>
          <span>→</span>
        </router-link>
        <router-link
          :to="`/presentation-live/${activeSession.accessCode}`"
          target="_blank"
          class="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition flex items-center gap-1.5"
          title="Buka simulasi tampilan di HP siswa"
        >
          <span>📱</span> Buka Layar Siswa
        </router-link>
        <button
          @click="stopActiveSession"
          class="px-3.5 py-2.5 bg-rose-600/80 hover:bg-rose-700 text-white text-xs font-bold rounded-xl border border-rose-500/30 transition flex items-center gap-1"
          title="Hentikan dan akhiri sesi tayang langsung ini"
        >
          <span>⏹️</span> Akhiri Sesi
        </button>
      </div>
    </div>

    <!-- 4. Filter & Search Bar Card -->
    <div class="bg-white rounded-[24px] shadow-card border border-slate-200/60 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <div>
          <select v-model="filterSubject" class="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition">
            <option value="all">Semua Mata Pelajaran</option>
            <option value="Informatika">Informatika</option>
            <option value="KKA (Koding dan Kecerdasan Artifisial)">KKA (Koding dan Kecerdasan Artifisial)</option>
          </select>
        </div>
        <div>
          <select v-model="filterClass" class="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition">
            <option value="all">Semua Rombel</option>
            <option v-for="cls in classrooms" :key="cls.id" :value="cls.name">Kelas {{ cls.name }}</option>
          </select>
        </div>
        <div>
          <select v-model="filterStatus" class="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition">
            <option value="all">Semua Status</option>
            <option value="ready">Siap Presentasi</option>
            <option value="processing">Sedang Diproses</option>
            <option value="archived">Diarsipkan</option>
          </select>
        </div>
      </div>

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

    <!-- 5. Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="bg-white rounded-[24px] shadow-card border border-slate-200/60 p-6 animate-pulse space-y-4">
        <div class="h-36 bg-slate-150 rounded-2xl"></div>
        <div class="h-4 bg-slate-150 rounded w-2/3"></div>
        <div class="h-8 bg-slate-150 rounded"></div>
      </div>
    </div>

    <!-- 6. Empty State -->
    <div v-else-if="filteredPresentations.length === 0" class="bg-white rounded-[24px] shadow-card border border-slate-200/60 p-12 text-center space-y-4">
      <div class="text-5xl">📽️</div>
      <h2 class="text-lg font-bold text-slate-900">Belum Ada Materi Presentasi</h2>
      <p class="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
        Belum ada bahan ajar atau slide presentasi interaktif yang diunggah. Mulai buat presentasi baru atau unggah berkas PPTX/PDF untuk rombongan belajar Anda.
      </p>
      <button
        @click="showUploadModal = true"
        class="px-5 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#082231] text-white font-bold text-xs shadow-md transition inline-flex items-center gap-2"
      >
        <span>📤 Unggah Materi Presentasi Baru</span>
      </button>
    </div>

    <!-- 7. Presentation Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="item in filteredPresentations"
        :key="item.id"
        class="bg-white rounded-[24px] shadow-card border border-slate-200/60 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group"
      >
        <!-- Slide Preview Banner / Thumbnail Slide 1 -->
        <div class="relative aspect-video bg-[#0c2b3d] flex flex-col justify-between overflow-hidden border-b border-slate-100">
          <!-- Thumbnail Gambar Slide Pertama (Jika Ada Gambar/Visual Slide 1) -->
          <div v-if="getFirstSlide(item).image" class="absolute inset-0 bg-[#0c2b3d] flex items-center justify-center overflow-hidden">
            <img
              :src="getFirstSlide(item).image"
              :alt="getFirstSlide(item).title || item.title"
              class="w-full h-full object-contain select-none transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
            />
            <!-- Gradient Overlay untuk keterbacaan badge dan teks keterangan -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 pointer-events-none"></div>

            <!-- Keterangan Slide 1 di bagian bawah gambar -->
            <div class="absolute bottom-2.5 left-3.5 right-3.5 z-10 flex items-center justify-between text-white pointer-events-none">
              <span class="text-[11px] font-bold truncate max-w-[70%] drop-shadow text-white">
                Slide 1 &bull; {{ getFirstSlide(item).title }}
              </span>
              <span class="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[#f59e0b] border border-white/10 shrink-0">
                {{ item.slideCount || item.slides?.length || 1 }} Slide
              </span>
            </div>
          </div>

          <!-- Thumbnail Tampilan Kanvas Slide Pertama (Jika Slide 1 Berupa Teks/Konten Modul) -->
          <div v-else class="absolute inset-0 bg-gradient-to-br from-[#0c2b3d] via-[#10384f] to-[#082231] p-5 flex flex-col justify-between overflow-hidden select-none">
            <div class="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <!-- Header Mini Kanvas Slide -->
            <div class="pt-5 flex items-center justify-between text-[9px] text-cyan-300 font-bold opacity-90 z-10">
              <span class="tracking-wider uppercase">Slide 1 &bull; Pembuka</span>
              <span class="font-mono text-[#f59e0b] font-bold">{{ item.slideCount || item.slides?.length || 1 }} Slide</span>
            </div>

            <!-- Body Mini Slide -->
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

            <!-- Footer Mini Slide -->
            <div class="relative z-10 flex items-center justify-between text-[8px] text-slate-400 border-t border-white/10 pt-1.5">
              <span class="truncate max-w-[65%]">{{ item.title }}</span>
              <span class="font-mono text-[#f59e0b] font-bold">16:9 Studio</span>
            </div>
          </div>

          <!-- Floating Badges: Subject & Status -->
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

          <!-- Quick Actions Button on Hover -->
          <div class="absolute inset-0 bg-[#0c2b3d]/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2.5 p-4 z-20">
            <div class="text-xs text-[#f59e0b] font-mono font-bold mb-1">
              Slide 1 dari {{ item.slideCount || item.slides?.length || 1 }} Halaman
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="previewPresentation(item)"
                class="px-3.5 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition"
              >
                <span>👁️</span> Pratinjau
              </button>
              <button
                @click="openEditModal(item)"
                class="px-3.5 py-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 text-xs font-bold shadow-md flex items-center gap-1 active:scale-95 transition"
              >
                <span>✏️</span> Edit
              </button>
              <button
                v-if="item.status === 'ready'"
                @click="openLaunchModal(item)"
                class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md flex items-center gap-1 active:scale-95 transition"
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

          <!-- Tags & TP Link -->
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

        <!-- Action Toolbar with Edit & Preview -->
        <div class="p-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
          <div class="flex items-center gap-1">
            <button
              @click="previewPresentation(item)"
              class="p-2 rounded-xl text-blue-600 hover:bg-blue-50 text-xs transition"
              title="Pratinjau Slide"
            >
              👁️
            </button>
            <button
              @click="openEditModal(item)"
              class="p-2 rounded-xl text-amber-600 hover:bg-amber-50 text-xs transition"
              title="Edit Materi Presentasi"
            >
              ✏️
            </button>
            <button
              @click="duplicatePresentation(item)"
              class="p-2 rounded-xl text-slate-500 hover:bg-slate-200 text-xs transition"
              title="Duplikasi Slide"
            >
              📋
            </button>
            <button
              @click="deletePresentation(item)"
              class="p-2 rounded-xl text-rose-500 hover:bg-rose-50 text-xs transition"
              title="Hapus"
            >
              🗑️
            </button>
          </div>

          <button
            @click="openLaunchModal(item)"
            :disabled="item.status !== 'ready'"
            class="px-4 py-2 rounded-xl bg-[#0c2b3d] hover:bg-[#082231] text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 disabled:opacity-40"
          >
            <span>▶️</span> Buka Sesi Kelas
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 1: UNGGAH PRESENTASI (PPTX / PDF / FORM BARU) -->
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
          <button @click="showUploadModal = false" class="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
        </div>

        <form @submit.prevent="submitUpload" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Judul Materi Pembelajaran <span class="text-rose-500">*</span></label>
            <input
              v-model="uploadForm.title"
              type="text"
              class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition"
              placeholder="Misal: Arsitektur Komputer & Pemrosesan Biner"
              required
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Mata Pelajaran</label>
            <select v-model="uploadForm.subject" class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition">
              <option value="Informatika">Informatika</option>
              <option value="KKA (Koding dan Kecerdasan Artifisial)">KKA (Koding dan Kecerdasan Artifisial)</option>
            </select>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block font-bold text-slate-700 mb-0">Rombel Sasaran (Bisa Pilih > 1 Kelas) <span class="text-rose-500">*</span></label>
              <button
                type="button"
                @click="toggleSelectAllUploadClasses"
                class="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition"
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
                  class="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span class="truncate">Kelas {{ cls.name }}</span>
              </label>
            </div>
            <p v-if="uploadForm.classroom_ids.length === 0" class="text-[11px] text-rose-500 font-medium mt-1">
              ⚠️ Pilih minimal satu kelas rombel sasaran.
            </p>
            <p v-else class="text-[11px] text-slate-500 mt-1">
              Terpilih: <strong class="text-slate-800">{{ uploadForm.classroom_ids.length }} Kelas</strong> ({{ getSelectedClassroomsLabel(uploadForm.classroom_ids) }})
            </p>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Deskripsi Ringkas Materi</label>
            <textarea
              v-model="uploadForm.description"
              rows="2"
              class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition"
              placeholder="Catatan pengantar materi dan tujuan apersepsi..."
            ></textarea>
          </div>

          <!-- Drag and Drop Dropzone -->
          <div
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            :class="[
              'border-2 border-dashed rounded-2xl p-5 text-center transition-colors cursor-pointer flex flex-col items-center justify-center space-y-1.5',
              isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-blue-400 bg-slate-50/60'
            ]"
            @click="triggerFileInput"
          >
            <input
              type="file"
              ref="fileInputRef"
              class="hidden"
              accept=".pdf,.pptx,.ppt,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint"
              @change="handleFileChange"
            />
            <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl">
              📄
            </div>
            <div v-if="!selectedFile">
              <p class="font-bold text-slate-800 text-xs">Klik untuk memilih berkas PPT / PPTX / PDF (opsional)</p>
              <p class="text-[11px] text-slate-400">Atau langsung simpan untuk mulai menyusun slide di studio</p>
            </div>
            <div v-else class="space-y-0.5">
              <p class="font-bold text-blue-800 text-xs">{{ selectedFile.name }}</p>
              <p class="text-[11px] text-emerald-600 font-semibold">
                {{ (selectedFile.size / (1024 * 1024)).toFixed(2) }} MB &bull; Berkas valid
              </p>
            </div>
          </div>

          <div v-if="uploadProgress > 0" class="space-y-1">
            <div class="flex justify-between text-[11px] font-semibold text-slate-600">
              <span>Menyimpan & Menyiapkan Slide...</span>
              <span>{{ uploadProgress }}%</span>
            </div>
            <div class="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div class="h-full bg-[#0c2b3d] transition-all duration-300" :style="{ width: `${uploadProgress}%` }"></div>
            </div>
          </div>

          <div class="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              @click="showUploadModal = false"
              class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isUploading"
              class="px-5 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#082231] text-white font-bold text-xs shadow-md transition disabled:opacity-50"
            >
              {{ isUploading ? 'Menyimpan Materi...' : 'Simpan Materi' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 2: PELUNCURAN SESI BARU (START SESSION) -->
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
          <button @click="launchingItem = null" class="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
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
              <label class="block font-bold text-slate-700 mb-1">Pilih Rombel Siswa</label>
              <select v-model="sessionForm.classroom" class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition">
                <option v-for="cls in classrooms" :key="cls.id" :value="cls.name">Kelas {{ cls.name }}</option>
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
              class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#082231] text-white font-bold text-xs shadow-md transition"
            >
              🚀 Masuk Studio Presenter
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 3: PRATINJAU SLIDE INTERAKTIF -->
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
              class="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>✏️</span> Edit Materi
            </button>
            <button @click="previewItem = null" class="text-slate-400 hover:text-white text-xl p-1 font-bold">✕</button>
          </div>
        </div>

        <!-- Slide Canvas View -->
        <div class="relative aspect-video bg-gradient-to-br from-[#082231] via-[#0c2b3d] to-[#10384f] rounded-2xl flex flex-col justify-between p-8 text-center border border-white/10 shadow-2xl overflow-hidden">
          <div class="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>

          <div class="relative z-10 flex items-center justify-between text-xs text-slate-300">
            <span class="font-bold uppercase tracking-wider text-cyan-300">Modul Ajar Digital SMP</span>
            <span class="font-mono">SMP Negeri 6 Kendari</span>
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
            class="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 text-white font-bold text-lg transition backdrop-blur-sm z-20"
          >
            ←
          </button>
          <button
            @click="nextSlide"
            :disabled="previewSlideIndex >= totalSlidesCount - 1"
            class="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 text-white font-bold text-lg transition backdrop-blur-sm z-20"
          >
            →
          </button>
        </div>

        <!-- Slide Thumbnails Strip -->
        <div class="flex items-center gap-2.5 overflow-x-auto py-2 px-1">
          <button
            v-for="(_, sIdx) in totalSlidesCount"
            :key="sIdx"
            @click="previewSlideIndex = sIdx"
            :class="[
              'relative rounded-xl border-2 transition shrink-0 overflow-hidden flex flex-col items-center justify-between text-left group/thumb',
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
              class="px-5 py-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 text-xs font-black shadow-md transition"
            >
              🚀 Mulai Tayangkan Sesi Sekarang →
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL 4: EDIT MATERI PRESENTASI -->
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
          <button @click="showEditModal = false" class="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
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
              <option value="Informatika">Informatika</option>
              <option value="KKA (Koding dan Kecerdasan Artifisial)">KKA (Koding dan Kecerdasan Artifisial)</option>
            </select>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block font-bold text-slate-700 mb-0">Rombel Sasaran (Bisa Pilih > 1 Kelas) <span class="text-rose-500">*</span></label>
              <button
                type="button"
                @click="toggleSelectAllEditClasses"
                class="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition"
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
                  class="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span class="truncate">Kelas {{ cls.name }}</span>
              </label>
            </div>
            <p v-if="editForm.classroom_ids.length === 0" class="text-[11px] text-rose-500 font-medium mt-1">
              ⚠️ Pilih minimal satu kelas rombel sasaran.
            </p>
            <p v-else class="text-[11px] text-slate-500 mt-1">
              Terpilih: <strong class="text-slate-800">{{ editForm.classroom_ids.length }} Kelas</strong> ({{ getSelectedClassroomsLabel(editForm.classroom_ids) }})
            </p>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Deskripsi Ringkas Materi</label>
            <textarea
              v-model="editForm.description"
              rows="2"
              class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition"
              placeholder="Catatan pengantar materi..."
            ></textarea>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Tag / Topik (pisahkan dengan koma)</label>
            <input
              v-model="editForm.tagsString"
              type="text"
              class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c2b3d]/20 focus:border-[#0c2b3d] transition"
              placeholder="Contoh: fase-d, hardware, jaringan"
            />
          </div>

          <!-- Slide Content Editor -->
          <div class="space-y-2.5 pt-2.5 border-t border-slate-100">
            <div class="flex items-center justify-between">
              <label class="block font-bold text-slate-700 mb-0">Daftar Konten Slide ({{ editForm.slides.length }} Halaman)</label>
              <button
                type="button"
                @click="addSlideToEdit"
                class="text-[11px] text-blue-600 hover:underline font-bold"
              >
                + Tambah Slide Baru
              </button>
            </div>

            <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
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
                    class="text-rose-500 hover:text-rose-700 text-[10px] font-bold"
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
                      class="bg-rose-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-xl shadow hover:bg-rose-700"
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
              class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-[#0c2b3d] hover:bg-[#082231] text-white font-bold text-xs shadow-md transition"
            >
              Simpan Perubahan Materi
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isStudent = computed(() => authStore.hasRole('student'))

const activeTab = ref<'studio' | 'library'>(route.query.tab === 'library' ? 'library' : 'studio')

watch(() => route.query.tab, (newTab) => {
  if (newTab === 'library') {
    activeTab.value = 'library'
  } else if (newTab === 'studio') {
    activeTab.value = 'studio'
  }
})

function switchTab(tab: 'studio' | 'library') {
  activeTab.value = tab
  router.replace({
    query: {
      ...route.query,
      tab
    }
  })
}

const studentJoinPin = ref('')
function joinStudentSession(pin?: string) {
  const code = (pin || studentJoinPin.value).trim()
  if (!code) {
    alert('Silakan masukkan PIN sesi presentasi terlebih dahulu.')
    return
  }
  router.push(`/presentation-live/${code}`)
}

const loading = ref(false)
const filterSubject = ref('all')
const filterClass = ref('all')
const filterStatus = ref('all')
const searchQuery = ref('')

const classrooms = ref<any[]>([])
const presentations = ref<any[]>([])
const activeSession = ref<any>(null)

const totalReadySlides = computed(() => {
  return presentations.value.reduce((acc, p) => acc + (p.slideCount || p.slides?.length || 0), 0)
})

const totalSessionsDone = computed(() => {
  return presentations.value.reduce((acc, p) => acc + (p.sessionCount || 0), 0)
})

const showUploadModal = ref(false)
const isDragging = ref(false)
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadProgress = ref(0)
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
  subject: 'Informatika',
  classroom_ids: [] as string[],
  description: ''
})

const sessionForm = ref({
  title: '',
  classroom: 'VII A',
  accessCode: 'PRS-7A',
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

async function loadPresentations() {
  loading.value = true
  try {
    const res = await api.get('/presentations')
    const raw = res.data?.data || res.data || []
    presentations.value = Array.isArray(raw) ? raw : []
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
    // Sesi aktif hanya boleh muncul jika materi presentasi terkait memang ada
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
  await Promise.all([loadClassrooms(), loadPresentations()])
  await loadActiveSession()
})

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
    const arrayBuffer = await file.arrayBuffer()
    const pdfjsModule: any = await import('pdfjs-dist/legacy/build/pdf.js')
    const pdfjsLib = pdfjsModule.default || pdfjsModule

    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      disableWorker: true
    })
    const pdfDoc = await loadingTask.promise
    const numPages = pdfDoc.numPages
    const slides: Array<{ title: string; content: string; image?: string }> = []

    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDoc.getPage(i)
      const viewport = page.getViewport({ scale: 1.5 })

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = viewport.width
      canvas.height = viewport.height

      let imageDataUrl = ''
      if (ctx) {
        await page.render({ canvasContext: ctx, viewport }).promise
        imageDataUrl = canvas.toDataURL('image/jpeg', 0.85)
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
  } catch (err) {
    console.warn('Gagal membaca berkas PDF:', err)
    return []
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

async function submitUpload() {
  if (!uploadForm.value.title) return
  if (uploadForm.value.classroom_ids.length === 0) {
    alert('Pilih minimal satu rombel kelas tujuan materi!')
    return
  }
  isUploading.value = true
  uploadProgress.value = 35

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
        uploadProgress.value = 50
        const extracted = await parsePptxSlides(selectedFile.value)
        if (!extracted || extracted.length === 0) {
          throw new Error('Ekstraksi berkas PPTX tidak menghasilkan slide yang valid. Pastikan format berkas didukung dan tidak terenkripsi.')
        }
        finalSlides = extracted
      } else if (ext === 'pdf') {
        uploadProgress.value = 50
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

    uploadProgress.value = 80
    await api.post('/presentations', payload)
    uploadProgress.value = 100

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
    if (err.message === 'Network Error' || !err.response) {
      errorMsg = 'Koneksi ke backend server terputus (Network Error). Pastikan server Belajarena aktif di port 8000.'
    }
    alert('Gagal menyimpan presentasi: ' + errorMsg)
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

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

function previewPresentation(item: any) {
  previewItem.value = item
  previewSlideIndex.value = 0
}

function openLaunchModal(item: any) {
  launchingItem.value = item
  sessionForm.value.title = `Sesi Presentasi: ${item.title}`
  sessionForm.value.classroom = item.classroom
  sessionForm.value.accessCode = 'PRS-' + Math.floor(100 + Math.random() * 900)
}

async function confirmLaunchSession() {
  if (!launchingItem.value) return
  try {
    const payload = {
      presentation_id: launchingItem.value.id,
      title: sessionForm.value.title,
      classroom: sessionForm.value.classroom,
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

async function duplicatePresentation(item: any) {
  try {
    const payload = {
      title: `${item.title} (Salinan)`,
      description: item.description,
      subject: item.subject,
      classroom: item.classroom,
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
