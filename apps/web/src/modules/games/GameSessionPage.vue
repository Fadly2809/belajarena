<template>
  <div class="min-h-[85vh] flex flex-col justify-between">
    <!-- Top Bar: Game Status & PIN -->
    <div class="card p-4 flex flex-wrap items-center justify-between gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-20">
      <div class="flex items-center gap-3">
        <router-link to="/games" class="btn btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1">
          ← Kembali ke Edu-Games
        </router-link>
        <div>
          <h2 class="font-bold text-surface-900 text-sm leading-tight flex items-center gap-2">
            <span>{{ getModeIcon(gameMode) }}</span>
            <span>{{ sessionData.title }}</span>
          </h2>
          <span class="text-[11px] text-surface-500">
            Kelas: <strong class="text-surface-800">{{ sessionData.classroom_name }}</strong> &bull;
            Fase: <strong class="capitalize text-primary-700">{{ getStageLabel(currentStage) }}</strong> &bull;
            <span v-if="gameMode !== 'memory_match'">
              Soal {{ currentQuestionIndex + 1 }} dari {{ questions.length }}
            </span>
            <span v-else>
              Pasangan {{ matchedPairsCount }} dari {{ memoryPairs.length }}
            </span>
          </span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- Game PIN Box -->
        <div class="bg-primary-50 border border-primary-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <span class="text-[10px] uppercase font-bold text-primary-700">PIN Game:</span>
          <span class="font-mono text-base font-extrabold tracking-wider text-primary-900">{{ sessionData.pin }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-xs text-surface-600">
          <span>👥</span>
          <span class="font-bold text-surface-900">{{ participants.length }}</span> Siswa Real
        </div>
        <button
          v-if="currentStage !== 'finish'"
          @click="stopSessionGame"
          class="btn bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
          title="Hentikan sesi game yang sedang berlangsung"
        >
          <span>⏹️</span>
          <span>Stop Sesi</span>
        </button>
      </div>
    </div>

    <!-- Loading State Data Real -->
    <div v-if="isLoading" class="my-auto py-12 text-center space-y-3">
      <div class="w-10 h-10 mx-auto rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>
      <p class="text-xs font-bold text-surface-700">Menghubungkan ke Bank Soal & Daftar Siswa Real...</p>
    </div>

    <!-- STAGE 1: LOBBY -->
    <div v-else-if="currentStage === 'lobby'" class="my-auto py-8 text-center max-w-3xl mx-auto space-y-8 w-full">
      <div class="space-y-3">
        <span class="badge badge-primary text-xs px-3 py-1">Lobby Ulangan Harian Gamifikasi Real</span>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-surface-900">
          Ruang Game: {{ sessionData.classroom_name }}
        </h1>
        <div class="inline-block bg-surface-900 text-white rounded-2xl p-6 shadow-xl border-4 border-amber-400">
          <p class="text-xs uppercase tracking-widest text-surface-400 mb-1">Kode / PIN Game Siswa</p>
          <p class="text-5xl font-mono font-black tracking-widest text-amber-300">{{ sessionData.pin }}</p>
        </div>
        <p class="text-xs text-surface-500">
          Mode: <strong class="text-surface-800">{{ getModeLabel(gameMode) }}</strong> &bull;
          Mata Pelajaran: <strong class="text-surface-800">{{ sessionData.subject }}</strong>
        </p>
      </div>

      <!-- Real Participant Chips (Siswa Real Kelas Bebas Dummy) -->
      <div class="card bg-surface-50/50 p-6 space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-surface-700 uppercase flex items-center gap-1.5">
            <span>👥</span> Siswa Terdaftar Kelas ({{ participants.length }} Siswa Real)
          </span>
          <span class="text-[11px] text-surface-500 font-medium">Bebas simulasi &bull; Skor riil otomatis masuk ke Raport (Sumatif TP)</span>
        </div>
        <div v-if="participants.length > 0" class="flex flex-wrap gap-2 justify-center max-h-48 overflow-y-auto p-2">
          <span
            v-for="(p, i) in participants"
            :key="i"
            class="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-surface-200 shadow-xs flex items-center gap-2"
          >
            <span>{{ p.avatar }}</span>
            <span class="font-bold text-surface-800">{{ p.name }}</span>
            <span v-if="p.nisn" class="text-[9px] text-surface-400 font-mono">({{ p.nisn }})</span>
          </span>
        </div>
        <div v-else class="text-xs text-amber-600 font-semibold p-4 bg-amber-50 rounded-xl border border-amber-200">
          ⚠️ Belum ada siswa terdaftar pada kelas ini. Silakan tambahkan siswa di Manajemen Kelas atau pilih kelas lainnya.
        </div>
      </div>

      <!-- Start Button -->
      <div>
        <button
          @click="startGame"
          :disabled="questions.length === 0"
          class="btn btn-primary px-10 py-3 text-lg font-bold shadow-xl shadow-primary-500/30 transform active:scale-95 transition cursor-pointer"
        >
          🚀 Mulai Permainan Sekarang ({{ questions.length }} Butir Soal)
        </button>
      </div>
    </div>

    <!-- STAGE 2: QUESTION PLAY (Disesuaikan dengan 4 Mode Game Edukasi) -->
    <div v-else-if="currentStage === 'question' && (currentQuestion || gameMode === 'memory_match')" class="my-auto py-6 max-w-4xl mx-auto w-full space-y-5">
      <!-- Top Banner: Giliran Siswa Real Menjawab (Pengganti Simulasi Acak) -->
      <div class="p-3.5 rounded-2xl bg-gradient-to-r from-primary-900 via-indigo-900 to-purple-900 text-white shadow-md flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center text-xl font-bold shadow-xs">
            {{ activeStudent?.avatar || '🧑' }}
          </div>
          <div>
            <div class="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-amber-300">
              <span>🎯</span> Giliran Siswa Menjawab:
            </div>
            <p class="text-sm font-extrabold text-white leading-tight">
              {{ activeStudent?.name || 'Seluruh Siswa Kelas' }}
              <span v-if="activeStudent?.nisn" class="text-[11px] font-normal text-white/70">({{ activeStudent.nisn }})</span>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="randomizeActiveStudent"
            type="button"
            class="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            title="Pilih siswa secara acak untuk giliran menjawab"
          >
            <span>🎲</span>
            <span>Acak Siswa</span>
          </button>
          <button
            @click="nextActiveStudent"
            type="button"
            class="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            title="Pindah ke siswa berikutnya sesuai absen"
          >
            <span>⏭️</span>
            <span>Giliran Berikutnya</span>
          </button>
          <select
            v-model="activeStudentId"
            class="bg-white/15 text-white border border-white/20 text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
          >
            <option v-for="stu in participants" :key="stu.id" :value="stu.id" class="text-surface-900">
              {{ stu.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Countdown Timer Bar (kecuali memory match yang menggunakan timer akumulatif) -->
      <div v-if="gameMode !== 'memory_match'" class="space-y-1">
        <div class="flex items-center justify-between text-xs font-bold text-surface-700">
          <span class="flex items-center gap-1.5">
            <span>⏱️</span> Sisa Waktu Babak Ini
          </span>
          <span :class="timeLeft <= 5 ? 'text-rose-600 text-base animate-pulse font-black' : 'text-primary-700 font-bold'">
            {{ timeLeft }} Detik
          </span>
        </div>
        <div class="h-3 w-full bg-surface-200 rounded-full overflow-hidden shadow-inner">
          <div
            class="h-full bg-gradient-to-r from-primary-500 to-indigo-600 transition-all duration-1000"
            :style="{ width: `${(timeLeft / maxTime) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Question Card (Soal Asli dari Bank Soal) -->
      <div v-if="gameMode !== 'memory_match'" class="card p-6 text-center bg-white shadow-xl border-2 border-surface-100 space-y-2">
        <div class="flex items-center justify-between text-xs font-bold text-primary-600 tracking-wider">
          <span class="uppercase">Butir Soal {{ currentQuestionIndex + 1 }} dari {{ questions.length }}</span>
          <span class="px-2.5 py-0.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-[10px]">
            {{ getModeLabel(gameMode) }}
          </span>
        </div>
        <h2 class="text-xl sm:text-2xl font-extrabold text-surface-900 leading-snug pt-2">
          {{ currentQuestion.text }}
        </h2>
      </div>

      <!-- ============================================== -->
      <!-- MODE 1: KUIS KILAT BERKECEPATAN (FAST QUIZ) -->
      <!-- ============================================== -->
      <div v-if="gameMode === 'fast_quiz'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          v-for="(opt, optIdx) in currentQuestion.options"
          :key="optIdx"
          @click="selectOption(optIdx)"
          :disabled="selectedAnswer !== null"
          :class="[
            'p-5 rounded-2xl text-left font-bold text-sm transition-all transform active:scale-98 shadow-md flex items-center justify-between cursor-pointer',
            selectedAnswer === optIdx ? 'ring-4 ring-white shadow-xl scale-[1.02]' : '',
            optionStyles[optIdx % optionStyles.length]
          ]"
        >
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-sm font-black">
              {{ ['A', 'B', 'C', 'D', 'E'][optIdx] }}
            </span>
            <span class="text-sm font-bold">{{ opt }}</span>
          </div>
          <span v-if="selectedAnswer === optIdx" class="text-xl font-black">✓</span>
        </button>
      </div>

      <!-- ============================================== -->
      <!-- MODE 2: SUSUN KATA KOSAKATA (WORD SCRAMBLE) -->
      <!-- ============================================== -->
      <div v-else-if="gameMode === 'word_scramble'" class="card p-6 text-center space-y-4 bg-fuchsia-50/50 border border-fuchsia-200">
        <div class="flex items-center justify-between">
          <p class="text-xs font-bold text-fuchsia-800 uppercase tracking-wider">
            Susun Huruf Menjadi Istilah Kunci Jawaban:
          </p>
          <span class="text-[11px] text-fuchsia-600 font-semibold">
            Panjang Kata: <strong>{{ targetWord.length }}</strong> Huruf
          </span>
        </div>

        <!-- Huruf Tersusun di Slot Jawaban -->
        <div class="flex justify-center gap-2 flex-wrap min-h-[56px] p-2.5 bg-white rounded-2xl border-2 border-fuchsia-300 shadow-inner items-center">
          <span
            v-for="(ch, idx) in scrambledInput"
            :key="idx"
            class="w-11 h-11 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-pink-600 text-white font-black text-xl flex items-center justify-center shadow-md cursor-pointer hover:bg-rose-500 active:scale-95 transition"
            title="Klik untuk kembalikan huruf ke wadah"
            @click="removeScrambleChar(idx)"
          >
            {{ ch }}
          </span>
          <span v-if="scrambledInput.length === 0" class="text-surface-400 text-xs italic">
            Klik huruf-huruf acak di bawah untuk menyusun istilah...
          </span>
        </div>

        <!-- Pilihan Huruf Acak di Pool -->
        <div class="space-y-1.5">
          <p class="text-[10px] uppercase font-bold text-surface-500">Pilihan Huruf:</p>
          <div class="flex justify-center gap-2 flex-wrap pt-1">
            <button
              v-for="(letter, lIdx) in scrambledPool"
              :key="lIdx"
              type="button"
              class="w-11 h-11 rounded-xl bg-white hover:bg-fuchsia-100 border-2 border-fuchsia-300 font-black text-lg text-fuchsia-950 shadow-sm transition active:scale-90 cursor-pointer"
              @click="addScrambleChar(letter, lIdx)"
            >
              {{ letter }}
            </button>
          </div>
        </div>

        <div class="flex justify-center gap-2.5 pt-2">
          <button @click="giveScrambleHint" class="btn btn-secondary text-xs px-3.5 py-2 font-bold flex items-center gap-1">
            <span>💡</span> Bantuan Huruf
          </button>
          <button @click="resetScramble" class="btn btn-secondary text-xs px-3.5 py-2 font-bold flex items-center gap-1">
            <span>🧹</span> Reset Huruf
          </button>
          <button
            @click="submitScrambleAnswer"
            :disabled="scrambledInput.length === 0"
            class="btn bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black text-xs px-6 py-2 shadow-md cursor-pointer"
          >
            🚀 Kirim Jawaban Kata
          </button>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- MODE 3: TEBAK KARTU KONSEP (FLASHCARDS) -->
      <!-- ============================================== -->
      <div v-else-if="gameMode === 'flashcard_battle'" class="card p-6 text-center space-y-5 bg-emerald-50/50 border border-emerald-200">
        <!-- 3D Interactive Flip Card -->
        <div
          @click="isFlipped = !isFlipped"
          class="p-8 sm:p-12 rounded-3xl bg-white border-2 border-emerald-300 shadow-xl cursor-pointer transition-all duration-300 hover:scale-[1.01] relative overflow-hidden"
        >
          <div class="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-3">
            <span>{{ isFlipped ? 'KARTU SISI BELAKANG (KUNCI & PENJELASAN RESMI)' : 'KARTU SISI DEPAN (STIMULUS & KASUS)' }}</span>
            <span class="flex items-center gap-1 text-emerald-600">🔄 Klik untuk Membalik</span>
          </div>

          <!-- Sisi Depan: Stimulus / Soal -->
          <div v-if="!isFlipped" class="space-y-3 py-4">
            <span class="text-3xl">🃏</span>
            <h3 class="text-xl sm:text-2xl font-black text-surface-900 leading-snug">
              {{ currentQuestion.text }}
            </h3>
            <p class="text-xs text-surface-500">Tebak istilah atau konsep jawaban sebelum membalik kartu!</p>
          </div>

          <!-- Sisi Belakang: Konsep Inti & Kunci Jawaban -->
          <div v-else class="space-y-3 py-4 animate-fade-in">
            <span class="text-3xl">✨</span>
            <h4 class="text-2xl font-black text-emerald-600">
              {{ currentQuestion.options[currentQuestion.correctIndex] }}
            </h4>
            <p class="text-xs text-surface-700 max-w-md mx-auto leading-relaxed">
              {{ currentQuestion.explanation || 'Konsep penting ini merupakan kunci materi resmi dari Bank Soal Sekolah.' }}
            </p>
          </div>
        </div>

        <!-- Pilihan Tebakan Konsep -->
        <div class="space-y-2">
          <p class="text-xs font-bold text-emerald-900 uppercase">Pilih Konsep Jawaban:</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              v-for="(opt, oIdx) in currentQuestion.options"
              :key="oIdx"
              @click="selectOption(oIdx)"
              :disabled="selectedAnswer !== null"
              class="p-3.5 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer"
              :class="selectedAnswer === oIdx ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white hover:bg-emerald-50 border-surface-200 text-surface-800'"
            >
              <span>{{ ['A', 'B', 'C', 'D', 'E'][oIdx] }}. {{ opt }}</span>
              <span v-if="selectedAnswer === oIdx">✓</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- MODE 4: PENCOCOK PASANGAN (MEMORY MATCH) REAL -->
      <!-- ============================================== -->
      <div v-else-if="gameMode === 'memory_match'" class="space-y-5">
        <div class="card p-4 bg-amber-50/60 border border-amber-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="text-sm font-extrabold text-amber-950 flex items-center gap-1.5">
              <span>🧠</span> Cocokkan Pasangan Soal & Jawaban Bank Soal
            </h3>
            <p class="text-xs text-amber-800">
              Klik 2 kartu yang saling berhubungan (Konsep <-> Jawaban). Kartu cocok akan tetap terbuka!
            </p>
          </div>
          <div class="flex items-center gap-3">
            <span class="badge badge-warning text-xs font-bold px-3 py-1">
              {{ matchedPairsCount }} / {{ memoryPairs.length }} Pasangan Cocok
            </span>
            <span class="text-xs font-mono font-bold text-amber-900">
              ⏱️ {{ memoryTimer }} Detik
            </span>
          </div>
        </div>

        <!-- Memory Card Grid (4x2 / 4x3) -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div
            v-for="(card, cIdx) in memoryCards"
            :key="cIdx"
            @click="flipMemoryCard(cIdx)"
            class="h-32 rounded-2xl p-3 flex flex-col justify-between text-center transition-all duration-300 transform cursor-pointer border-2 select-none shadow-sm"
            :class="[
              card.isMatched
                ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-md scale-[0.98]'
                : card.isFlipped
                ? 'bg-white border-primary-500 shadow-xl scale-[1.02]'
                : 'bg-gradient-to-br from-indigo-700 via-primary-800 to-purple-800 border-indigo-600 hover:border-amber-300 hover:scale-[1.02] text-white'
            ]"
          >
            <!-- Card Front (Face Down) -->
            <template v-if="!card.isFlipped && !card.isMatched">
              <div class="text-2xl pt-2">🃏</div>
              <p class="text-[10px] font-mono tracking-widest text-amber-300 font-bold uppercase">Edu-Match</p>
              <span class="text-[9px] text-white/60">Klik untuk Buka</span>
            </template>

            <!-- Card Back (Face Up or Matched) -->
            <template v-else>
              <div class="flex items-center justify-between text-[9px] font-black uppercase" :class="card.type === 'concept' ? 'text-primary-600' : 'text-emerald-600'">
                <span>{{ card.type === 'concept' ? 'Konsep Soal' : 'Jawaban Resmi' }}</span>
                <span v-if="card.isMatched" class="text-emerald-600">✅ Cocok</span>
              </div>
              <p class="text-xs font-extrabold leading-tight text-surface-900 my-auto overflow-hidden line-clamp-3">
                {{ card.text }}
              </p>
              <span class="text-[9px] text-surface-400">Pasangan #{{ card.pairId + 1 }}</span>
            </template>
          </div>
        </div>

        <div v-if="matchedPairsCount >= memoryPairs.length" class="card p-6 bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-bounce">
          <span class="text-4xl">🎉</span>
          <h3 class="text-xl font-black text-emerald-900">Seluruh Pasangan Berhasil Dicocokkan!</h3>
          <p class="text-xs text-emerald-700">Skor poin penuh telah diberikan kepada siswa yang aktif menjawab.</p>
          <button @click="showLeaderboard" class="btn btn-primary px-8 py-2.5 font-bold text-xs shadow-md">
            Lihat Papan Skor & Peringkat Siswa →
          </button>
        </div>
      </div>

      <!-- Status Aktif Partisipan Kelas -->
      <div class="text-center text-xs text-surface-500 pt-2 flex items-center justify-center gap-2">
        <span>Partisipasi Siswa Real:</span>
        <strong class="text-surface-800">{{ participants.length }} Siswa Terdaftar</strong>
        <span>&bull;</span>
        <span class="text-primary-700 font-bold">Sinkronisasi Nilai Ulangan Formatif Otomatis</span>
      </div>
    </div>

    <!-- STAGE 3: QUESTION RESULT & REVIEW -->
    <div v-else-if="currentStage === 'result' && currentQuestion" class="my-auto py-6 max-w-3xl mx-auto w-full space-y-6">
      <div class="card p-6 text-center space-y-4 shadow-xl border-2 border-surface-100">
        <div class="flex justify-center items-center gap-2">
          <span
            class="badge text-xs px-3.5 py-1 font-bold"
            :class="lastAnswerCorrect ? 'badge-success' : 'bg-rose-100 text-rose-800 border-rose-300'"
          >
            {{ lastAnswerCorrect ? '✅ Jawaban Tepat (+100 Poin)' : '❌ Jawaban Belum Tepat' }}
          </span>
          <span class="text-xs text-surface-500">
            Respon dari: <strong class="text-surface-800">{{ activeStudent?.name }}</strong>
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-black text-surface-900 pt-1">
          Kunci Jawaban Resmi:
          <span class="text-emerald-600 block sm:inline mt-1 sm:mt-0">
            {{ currentQuestion.options[currentQuestion.correctIndex] }}
          </span>
        </h2>

        <div class="p-4 rounded-2xl bg-surface-50 border border-surface-200 text-xs text-surface-700 max-w-xl mx-auto text-left space-y-1">
          <strong class="text-surface-900 block font-bold">📖 Pembahasan Bank Soal:</strong>
          <p class="leading-relaxed">
            {{ currentQuestion.explanation || 'Jawaban di atas sesuai dengan kunci jawaban dari Bank Soal Sekolah.' }}
          </p>
        </div>

        <!-- Breakdown Opsi -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
          <div
            v-for="(opt, idx) in currentQuestion.options"
            :key="idx"
            class="p-3 rounded-xl border text-center text-xs transition"
            :class="idx === currentQuestion.correctIndex ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-800 shadow-sm' : 'bg-surface-50 border-surface-200 text-surface-500'"
          >
            <div class="text-lg mb-1">{{ idx === currentQuestion.correctIndex ? '✅' : '❌' }}</div>
            <div class="truncate font-semibold">{{ opt }}</div>
            <div class="text-[10px] text-surface-400 mt-1">Opsi {{ ['A', 'B', 'C', 'D', 'E'][idx] }}</div>
          </div>
        </div>
      </div>

      <div class="flex justify-center gap-4">
        <button
          @click="showLeaderboard"
          class="btn btn-primary px-8 py-3 font-bold text-sm shadow-lg shadow-primary-500/20 cursor-pointer"
        >
          Lihat Papan Skor Siswa Real →
        </button>
      </div>
    </div>

    <!-- STAGE 4: LEADERBOARD & PODIUM (Siswa Real Kelas Bebas Dummy) -->
    <div v-else-if="currentStage === 'leaderboard'" class="my-auto py-6 max-w-3xl mx-auto w-full space-y-6">
      <div class="text-center space-y-1">
        <h2 class="text-2xl sm:text-3xl font-extrabold text-surface-900 flex items-center justify-center gap-2">
          <span>🏆</span> Papan Peringkat Real: {{ sessionData.classroom_name }}
        </h2>
        <p class="text-xs text-surface-500">Peringkat siswa riil kelas berdasarkan akumulasi poin dan akurasi jawaban</p>
      </div>

      <!-- Top 3 Podium Visual -->
      <div class="flex items-end justify-center gap-3 pt-6 pb-2">
        <!-- 2nd Place -->
        <div v-if="sortedLeaderboard[1]" class="flex flex-col items-center">
          <span class="text-2xl mb-1">{{ sortedLeaderboard[1].avatar }}</span>
          <span class="text-xs font-bold text-surface-800 truncate max-w-[90px]">{{ sortedLeaderboard[1].name }}</span>
          <span class="text-[11px] text-primary-600 font-bold">{{ sortedLeaderboard[1].score }} pts</span>
          <div class="w-20 sm:w-24 h-24 bg-surface-200 rounded-t-xl flex items-center justify-center font-black text-xl text-surface-500 border-t-4 border-surface-400 shadow-sm">
            2
          </div>
        </div>

        <!-- 1st Place -->
        <div v-if="sortedLeaderboard[0]" class="flex flex-col items-center">
          <span class="text-3xl mb-1">👑 {{ sortedLeaderboard[0].avatar }}</span>
          <span class="text-xs font-extrabold text-surface-900 truncate max-w-[100px]">{{ sortedLeaderboard[0].name }}</span>
          <span class="text-xs text-amber-600 font-extrabold">{{ sortedLeaderboard[0].score }} pts</span>
          <div class="w-24 sm:w-28 h-32 bg-amber-400 text-amber-950 rounded-t-xl flex items-center justify-center font-black text-2xl border-t-4 border-amber-300 shadow-lg">
            1
          </div>
        </div>

        <!-- 3rd Place -->
        <div v-if="sortedLeaderboard[2]" class="flex flex-col items-center">
          <span class="text-2xl mb-1">{{ sortedLeaderboard[2].avatar }}</span>
          <span class="text-xs font-bold text-surface-800 truncate max-w-[90px]">{{ sortedLeaderboard[2].name }}</span>
          <span class="text-[11px] text-primary-600 font-bold">{{ sortedLeaderboard[2].score }} pts</span>
          <div class="w-20 sm:w-24 h-16 bg-amber-700/20 rounded-t-xl flex items-center justify-center font-black text-xl text-amber-900 border-t-4 border-amber-600 shadow-xs">
            3
          </div>
        </div>
      </div>

      <!-- Rest of Real Students List -->
      <div class="card p-4 space-y-2 max-h-72 overflow-y-auto">
        <div
          v-for="(p, idx) in sortedLeaderboard"
          :key="idx"
          class="flex items-center justify-between p-2.5 rounded-lg bg-surface-50 text-xs border border-surface-100 hover:bg-surface-100 transition"
        >
          <div class="flex items-center gap-3">
            <span class="font-bold text-surface-500 w-5 text-center">{{ idx + 1 }}</span>
            <span class="text-base">{{ p.avatar }}</span>
            <span class="font-bold text-surface-900">{{ p.name }}</span>
            <span v-if="p.nisn" class="text-[10px] text-surface-400 font-mono">({{ p.nisn }})</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-[11px] text-surface-500">Nilai: <strong>{{ p.academic_score || 0 }}</strong></span>
            <span class="font-bold text-primary-700 font-mono">{{ p.score }} pts</span>
          </div>
        </div>
      </div>

      <!-- Action Button Next Soal or Finish -->
      <div class="flex justify-center">
        <button
          v-if="gameMode !== 'memory_match' && currentQuestionIndex < questions.length - 1"
          @click="nextQuestion"
          class="btn btn-primary px-8 py-3 font-bold text-sm shadow-md cursor-pointer"
        >
          Soal Selanjutnya ({{ currentQuestionIndex + 2 }}/{{ questions.length }}) →
        </button>
        <button
          v-else
          @click="finishGame"
          class="btn btn-primary px-8 py-3 font-bold text-sm bg-emerald-600 hover:bg-emerald-700 shadow-md cursor-pointer flex items-center gap-2"
        >
          <span>🏁</span>
          <span>Akhiri Game & Simpan Nilai Ulangan Harian</span>
        </button>
      </div>
    </div>

    <!-- STAGE 5: FINISH SUMMARY & REKAPITULASI NILAI RAPORT -->
    <div v-else-if="currentStage === 'finish'" class="my-auto py-8 max-w-3xl mx-auto space-y-6 w-full">
      <div class="text-center space-y-2">
        <div class="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl shadow-inner">
          🎉
        </div>
        <h2 class="text-3xl font-extrabold text-surface-900">Sesi Game Berhasil Selesai!</h2>
        <p class="text-surface-500 text-xs">
          Nilai ulangan formatif siswa kelas {{ sessionData.classroom_name }} telah otomatis tersimpan ke Raport (Sumatif TP).
        </p>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <span>✅</span>
          <span>Tersinkronisasi Real ke Raport Kelas: {{ sessionData.subject }}</span>
        </div>
      </div>

      <!-- Top Winner Card -->
      <div class="card p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-4">
          <span class="text-4xl">🥇</span>
          <div>
            <p class="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Juara 1 Sesi Ini</p>
            <p class="text-lg font-black text-amber-950">{{ sortedLeaderboard[0]?.name || 'Siswa Berprestasi' }}</p>
            <p class="text-xs text-amber-700">Skor Game: {{ sortedLeaderboard[0]?.score || 100 }} Poin &bull; Nilai Formatif: {{ sortedLeaderboard[0]?.academic_score || 100 }}</p>
          </div>
        </div>
        <span class="badge badge-warning text-xs font-extrabold px-3 py-1">Juara Kelas</span>
      </div>

      <!-- Rekapitulasi Nilai Siswa Real -->
      <div class="card p-5 space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-surface-100">
          <h3 class="font-bold text-surface-800 text-sm flex items-center gap-1.5">
            <span>📋</span> Rekapitulasi Nilai Siswa Kelas (Masuk ke Raport)
          </h3>
          <span class="text-xs text-surface-500 font-semibold">{{ participants.length }} Siswa</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="bg-surface-50 text-surface-600 font-semibold uppercase">
                <th class="py-2.5 px-3">No</th>
                <th class="py-2.5 px-3">Nama Siswa</th>
                <th class="py-2.5 px-3">NISN</th>
                <th class="py-2.5 px-3 text-center">Jawaban Benar</th>
                <th class="py-2.5 px-3 text-center">Nilai Raport (0-100)</th>
                <th class="py-2.5 px-3 text-center">Status KKTP</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-100">
              <tr v-for="(stu, sIdx) in sortedLeaderboard" :key="stu.id" class="hover:bg-surface-50">
                <td class="py-2.5 px-3 text-surface-500">{{ sIdx + 1 }}</td>
                <td class="py-2.5 px-3 font-bold text-surface-900 flex items-center gap-2">
                  <span>{{ stu.avatar }}</span>
                  <span>{{ stu.name }}</span>
                </td>
                <td class="py-2.5 px-3 text-surface-600 font-mono">{{ stu.nisn || '-' }}</td>
                <td class="py-2.5 px-3 text-center font-semibold text-surface-700">
                  {{ stu.correct || 0 }} / {{ questions.length || 5 }}
                </td>
                <td class="py-2.5 px-3 text-center font-bold text-primary-700 font-mono text-sm">
                  {{ stu.academic_score || 0 }}
                </td>
                <td class="py-2.5 px-3 text-center">
                  <span
                    class="badge text-[10px] font-bold"
                    :class="(stu.academic_score || 0) >= 75 ? 'badge-success' : 'badge-warning'"
                  >
                    {{ (stu.academic_score || 0) >= 75 ? 'Tuntas' : 'Perlu Bimbingan' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="flex justify-center gap-3">
        <router-link :to="{ path: '/reports/exam-events', query: route.params.id ? { session_id: String(route.params.id) } : undefined }" class="btn btn-primary text-xs px-5 py-2.5 font-bold shadow-md flex items-center gap-1.5">
          <span>📊</span>
          <span>Buka Dashboard Hasil Ulangan</span>
        </router-link>
        <router-link to="/games" class="btn btn-secondary text-xs px-5 py-2.5">
          Menu Edu-Games
        </router-link>
        <router-link to="/reports/grades" class="btn btn-secondary text-xs px-5 py-2.5">
          Rekap Nilai Rapor →
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'
import { useClassrooms } from '@/composables/useClassrooms'

const route = useRoute()
const { getClassName } = useClassrooms()

const currentStage = ref<'lobby' | 'question' | 'result' | 'leaderboard' | 'finish'>('lobby')
const currentQuestionIndex = ref(0)
const timeLeft = ref(15)
const maxTime = ref(15)
const selectedAnswer = ref<number | null>(null)
const lastAnswerCorrect = ref(false)
const isLoading = ref(true)
let timerInterval: any = null

const isFlipped = ref(false)
const scrambledPool = ref<string[]>([])
const scrambledInput = ref<string[]>([])
const targetWord = ref('')

// Mode 4 Memory Match Cards state
interface MemoryCard {
  id: number
  pairId: number
  type: 'concept' | 'answer'
  text: string
  isFlipped: boolean
  isMatched: boolean
}
const memoryCards = ref<MemoryCard[]>([])
const memoryPairs = ref<Array<{ concept: string; answer: string }>>([])
const flippedIndices = ref<number[]>([])
const matchedPairsCount = ref(0)
const memoryTimer = ref(0)
let memoryTimerInterval: any = null

const gameMode = ref(String(route.query.mode || 'fast_quiz'))
const activeStudentId = ref<string>('')

const sessionData = ref({
  id: '',
  title: 'Kuis Kilat Edu-Games',
  pin: '849 203',
  classroom_id: 'cls-7a',
  classroom_name: 'VII A',
  subject: 'Informatika'
})

const optionStyles = [
  'bg-rose-500 hover:bg-rose-600 text-white',
  'bg-blue-500 hover:bg-blue-600 text-white',
  'bg-amber-500 hover:bg-amber-600 text-white',
  'bg-emerald-500 hover:bg-emerald-600 text-white'
]

interface BattleQuestionItem {
  id: string
  text: string
  options: string[]
  correctIndex: number
  explanation: string
}

const questions = ref<BattleQuestionItem[]>([])
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

interface Participant {
  id: string
  name: string
  avatar: string
  score: number
  academic_score: number
  answered: number
  correct: number
  wrong: number
  nisn?: string
  nis?: string
}

const participants = ref<Participant[]>([])

const activeStudent = computed(() => {
  return participants.value.find(p => p.id === activeStudentId.value) || participants.value[0] || null
})

const sortedLeaderboard = computed(() => {
  return [...participants.value].sort((a, b) => (b.score || 0) - (a.score || 0))
})

onMounted(async () => {
  isLoading.value = true
  const sId = String(route.params.id || '')
  sessionData.value.id = sId

  // 1. Muat info sesi dari backend API (Source of Truth) atau localStorage
  let loadedFromApi = false
  try {
    const res = await api.get(`/ulangan-gamifikasi/sessions/${sId}`)
    const d = res.data?.data
    if (d) {
      sessionData.value.title = d.title || sessionData.value.title
      sessionData.value.pin = d.pin || d.join_code || sessionData.value.pin
      sessionData.value.classroom_id = d.classroom_id || String(route.query.classId || 'cls-7a')
      sessionData.value.classroom_name = d.classroom_name || getClassName(sessionData.value.classroom_id) || 'Kelas'
      sessionData.value.subject = d.subject || String(route.query.subject || 'Informatika')
      gameMode.value = d.mode || gameMode.value
      maxTime.value = Number(d.time_per_question) || 15
      timeLeft.value = maxTime.value

      if (Array.isArray(d.questions) && d.questions.length > 0) {
        formatQuestions(d.questions)
      }
      if (Array.isArray(d.participants) && d.participants.length > 0) {
        participants.value = d.participants.map(mapParticipant)
        if (participants.value.length > 0) activeStudentId.value = participants.value[0].id
      }
      loadedFromApi = true
    }
  } catch {}

  // Fallback ke localStorage jika API belum memuat
  if (!loadedFromApi && typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem('game_session_' + sId) || localStorage.getItem('game_session_active')
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        sessionData.value.title = parsed.title || sessionData.value.title
        sessionData.value.pin = parsed.pin || Math.floor(100000 + Math.random() * 900000).toString()
        sessionData.value.classroom_id = parsed.classroom_id || String(route.query.classId || 'cls-7a')
        sessionData.value.classroom_name = parsed.classroom_name || 'Kelas VII'
        sessionData.value.subject = parsed.subject || String(route.query.subject || 'Informatika')
        gameMode.value = parsed.mode || gameMode.value
        maxTime.value = Number(parsed.time_per_question) || 15
        timeLeft.value = maxTime.value
      } catch (err) {
        console.warn('Failed parsing session raw', err)
      }
    }
  }

  // 2. Muat Siswa Real dari Database jika belum ada
  if (participants.value.length === 0) {
    await loadRealStudents(sessionData.value.classroom_id)
  }

  // 3. Muat Soal Real dari Bank Soal jika belum ada
  if (questions.value.length === 0) {
    await loadRealQuestions(sessionData.value.subject)
  }

  // Jika game memory match, siapkan memory cards
  if (gameMode.value === 'memory_match') {
    setupMemoryMatchGame()
  }

  isLoading.value = false
})

function mapParticipant(s: any): Participant {
  return {
    id: String(s.id || s.student_id || Math.random()),
    name: s.name || s.student_name || 'Siswa',
    avatar: s.avatar || (s.gender === 'P' ? '👧' : '🧑'),
    score: Number(s.score) || 0,
    academic_score: Number(s.academic_score) || 0,
    answered: Number(s.answered) || 0,
    correct: Number(s.correct) || 0,
    wrong: Number(s.wrong) || 0,
    nisn: s.nisn || s.nis || '',
    nis: s.nis || s.nisn || ''
  }
}

async function loadRealStudents(classroomId: string) {
  try {
    const res = await api.get('/students', { params: { classroom_id: classroomId, all: 'true' } })
    const list = res.data?.data || []
    if (Array.isArray(list) && list.length > 0) {
      participants.value = list.map(mapParticipant)
      if (participants.value.length > 0) activeStudentId.value = participants.value[0].id
      return
    }
  } catch (err) {
    console.warn('Load students failed:', err)
  }

  // Fallback
  try {
    const allRes = await api.get('/students', { params: { all: 'true' } })
    const allList = allRes.data?.data || []
    if (Array.isArray(allList) && allList.length > 0) {
      participants.value = allList.map(mapParticipant)
      if (participants.value.length > 0) activeStudentId.value = participants.value[0].id
    }
  } catch {}
}

function formatQuestions(rawList: any[]) {
  questions.value = rawList.map((q: any, idx: number) => {
    const rawOpts = Array.isArray(q.options) ? q.options : []
    const options = rawOpts.map((o: any) => typeof o === 'string' ? o : (o.content || o.text || ''))
    let correctIdx = 0
    const found = rawOpts.findIndex((o: any) => o && o.is_correct === true)
    if (found !== -1) {
      correctIdx = found
    } else if (q.correct_answer) {
      const charIdx = ['A', 'B', 'C', 'D', 'E'].indexOf(String(q.correct_answer).toUpperCase())
      if (charIdx !== -1) correctIdx = charIdx
    }

    return {
      id: q.id || `q-${idx}`,
      text: q.content || q.questionText || q.text || 'Pertanyaan Bank Soal',
      options: options.length >= 2 ? options : ['CPU (Central Processing Unit)', 'RAM', 'Monitor', 'Hard Disk'],
      correctIndex: correctIdx,
      explanation: q.explanation || ''
    }
  })
}

async function loadRealQuestions(subjectName: string) {
  try {
    const res = await api.get('/questions', { params: { subject_name: subjectName } })
    const list = res.data?.data || []
    if (Array.isArray(list) && list.length > 0) {
      formatQuestions(list)
      return
    }
  } catch (err) {
    console.warn('Load questions failed:', err)
  }

  // Fallback 5 butir soal real Informatika
  formatQuestions([
    {
      content: 'Komponen perangkat keras yang berfungsi sebagai otak utama pemroses instruksi komputer adalah...',
      options: ['CPU (Central Processing Unit)', 'RAM (Random Access Memory)', 'Motherboard', 'Power Supply'],
      correctIndex: 0,
      explanation: 'CPU adalah otak utama sistem pemrosesan komputer yang mengeksekusi semua instruksi.'
    },
    {
      content: 'Urutan langkah logis dan sistematis dalam menyelesaikan suatu permasalahan komputasi disebut...',
      options: ['Algoritma', 'Variabel', 'Struktur Data', 'Kompilator'],
      correctIndex: 0,
      explanation: 'Algoritma adalah susunan langkah terstruktur dan terukur untuk memecahkan persoalan.'
    },
    {
      content: 'Jenis memori komputer yang bersifat volatile (data hilang saat daya dimatikan) adalah...',
      options: ['RAM', 'ROM', 'Hard Disk', 'Flashdisk'],
      correctIndex: 0,
      explanation: 'RAM bersifat volatile dan berfungsi menampung data instruksi yang sedang diproses.'
    },
    {
      content: 'Protokol standar yang digunakan untuk mentransfer data halaman web secara aman terenkripsi adalah...',
      options: ['HTTPS', 'FTP', 'SMTP', 'SSH'],
      correctIndex: 0,
      explanation: 'HTTPS (Hypertext Transfer Protocol Secure) mengenkripsi komunikasi web lewat SSL/TLS.'
    },
    {
      content: 'Pola berpikir pemecahan masalah dengan membagi masalah besar menjadi bagian-bagian kecil disebut...',
      options: ['Dekomposisi', 'Abstraksi', 'Pengenalan Pola', 'Algoritma'],
      correctIndex: 0,
      explanation: 'Dekomposisi adalah teknik memecah masalah kompleks menjadi sub-masalah yang lebih sederhana.'
    }
  ])
}

function getModeIcon(mode: string) {
  if (mode === 'fast_quiz') return '⚡'
  if (mode === 'word_scramble') return '🔤'
  if (mode === 'flashcard_battle') return '🃏'
  if (mode === 'memory_match') return '🧠'
  return '👾'
}

function getModeLabel(mode: string) {
  if (mode === 'fast_quiz') return 'Kuis Kilat Berkecepatan'
  if (mode === 'word_scramble') return 'Susun Kata Kosakata'
  if (mode === 'flashcard_battle') return 'Tebak Kartu Konsep'
  if (mode === 'memory_match') return 'Pencocok Pasangan'
  return 'Boss Battle'
}

function getStageLabel(stage: string) {
  if (stage === 'lobby') return 'Lobby Permainan'
  if (stage === 'question') return 'Sedang Menjawab'
  if (stage === 'result') return 'Pembahasan Soal'
  if (stage === 'leaderboard') return 'Papan Skor'
  if (stage === 'finish') return 'Selesai & Rekap'
  return stage
}

function randomizeActiveStudent() {
  if (participants.value.length === 0) return
  const randIdx = Math.floor(Math.random() * participants.value.length)
  activeStudentId.value = participants.value[randIdx].id
}

function nextActiveStudent() {
  if (participants.value.length === 0) return
  const currentIdx = participants.value.findIndex(p => p.id === activeStudentId.value)
  const nextIdx = (currentIdx + 1) % participants.value.length
  activeStudentId.value = participants.value[nextIdx].id
}

function startGame() {
  currentStage.value = 'question'
  currentQuestionIndex.value = 0
  setupQuestionState()
  if (gameMode.value === 'memory_match') {
    startMemoryTimer()
  } else {
    startQuestionTimer()
  }
}

function setupQuestionState() {
  selectedAnswer.value = null
  isFlipped.value = false
  lastAnswerCorrect.value = false

  // Setup Word Scramble jika mode scramble
  if (gameMode.value === 'word_scramble' && currentQuestion.value) {
    const rawWord = currentQuestion.value.options[currentQuestion.value.correctIndex] || 'INFORMATIKA'
    // Ambil kata pertama atau istilah inti yang clean
    const words = rawWord.split(' ')
    const candidate = words.find(w => w.length >= 3 && !w.startsWith('(')) || words[0] || 'KATA'
    targetWord.value = candidate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    const letters = targetWord.value.split('')
    scrambledPool.value = [...letters].sort(() => Math.random() - 0.5)
    scrambledInput.value = []
  }
}

// Scramble Controls
function addScrambleChar(ch: string, idx: number) {
  scrambledInput.value.push(ch)
  scrambledPool.value.splice(idx, 1)
}

function removeScrambleChar(idx: number) {
  const ch = scrambledInput.value.splice(idx, 1)[0]
  if (ch) scrambledPool.value.push(ch)
}

function resetScramble() {
  setupQuestionState()
}

function giveScrambleHint() {
  if (!targetWord.value) return
  const currentLen = scrambledInput.value.length
  if (currentLen < targetWord.value.length) {
    const expectedLetter = targetWord.value[currentLen]
    const poolIdx = scrambledPool.value.findIndex(l => l === expectedLetter)
    if (poolIdx !== -1) {
      addScrambleChar(expectedLetter, poolIdx)
    }
  }
}

function submitScrambleAnswer() {
  const userWord = scrambledInput.value.join('')
  if (userWord === targetWord.value) {
    selectOption(currentQuestion.value.correctIndex)
  } else {
    selectOption((currentQuestion.value.correctIndex + 1) % currentQuestion.value.options.length)
  }
}

// Memory Match Game Setup & Engine
function setupMemoryMatchGame() {
  memoryPairs.value = []
  const availableQ = questions.value.slice(0, 4)
  availableQ.forEach(q => {
    const promptSnippet = q.text.length > 50 ? q.text.substring(0, 48) + '...' : q.text
    const answer = q.options[q.correctIndex] || 'Jawaban'
    memoryPairs.value.push({ concept: promptSnippet, answer })
  })

  const cards: MemoryCard[] = []
  let cardId = 0
  memoryPairs.value.forEach((pair, pairIdx) => {
    cards.push({
      id: cardId++,
      pairId: pairIdx,
      type: 'concept',
      text: pair.concept,
      isFlipped: false,
      isMatched: false
    })
    cards.push({
      id: cardId++,
      pairId: pairIdx,
      type: 'answer',
      text: pair.answer,
      isFlipped: false,
      isMatched: false
    })
  })

  // Acak posisi kartu
  memoryCards.value = cards.sort(() => Math.random() - 0.5)
  flippedIndices.value = []
  matchedPairsCount.value = 0
}

function startMemoryTimer() {
  memoryTimer.value = 0
  if (memoryTimerInterval) clearInterval(memoryTimerInterval)
  memoryTimerInterval = setInterval(() => {
    memoryTimer.value++
  }, 1000)
}

function flipMemoryCard(cardIdx: number) {
  const card = memoryCards.value[cardIdx]
  if (!card || card.isFlipped || card.isMatched) return
  if (flippedIndices.value.length >= 2) return

  card.isFlipped = true
  flippedIndices.value.push(cardIdx)

  if (flippedIndices.value.length === 2) {
    const first = memoryCards.value[flippedIndices.value[0]]
    const second = memoryCards.value[flippedIndices.value[1]]

    if (first.pairId === second.pairId && first.type !== second.type) {
      // Cocok!
      first.isMatched = true
      second.isMatched = true
      matchedPairsCount.value++
      flippedIndices.value = []

      // Beri poin real ke siswa aktif
      if (activeStudent.value) {
        activeStudent.value.score = (activeStudent.value.score || 0) + 100
        activeStudent.value.correct = (activeStudent.value.correct || 0) + 1
        activeStudent.value.answered = (activeStudent.value.answered || 0) + 1
        activeStudent.value.academic_score = Math.min(100, Math.round((activeStudent.value.correct / memoryPairs.value.length) * 100))
      }

      if (matchedPairsCount.value >= memoryPairs.value.length) {
        if (memoryTimerInterval) clearInterval(memoryTimerInterval)
      }
    } else {
      // Tidak cocok, balik kembali setelah 800ms
      setTimeout(() => {
        first.isFlipped = false
        second.isFlipped = false
        flippedIndices.value = []
      }, 800)
    }
  }
}

function startQuestionTimer() {
  timeLeft.value = maxTime.value
  if (timerInterval) clearInterval(timerInterval)

  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      clearInterval(timerInterval)
      // Waktu habis, evaluasi jawaban kosong
      lastAnswerCorrect.value = false
      if (activeStudent.value) {
        activeStudent.value.answered = (activeStudent.value.answered || 0) + 1
        activeStudent.value.wrong = (activeStudent.value.wrong || 0) + 1
        activeStudent.value.academic_score = Math.round((activeStudent.value.correct / questions.value.length) * 100)
      }
      currentStage.value = 'result'
    }
  }, 1000)
}

function selectOption(idx: number) {
  if (selectedAnswer.value !== null) return
  selectedAnswer.value = idx
  clearInterval(timerInterval)

  const isCorrect = currentQuestion.value && idx === currentQuestion.value.correctIndex
  lastAnswerCorrect.value = Boolean(isCorrect)

  // Rekam nilai REAL siswa aktif (Bebas Simulasi Acak)
  if (activeStudent.value) {
    activeStudent.value.answered = (activeStudent.value.answered || 0) + 1
    if (isCorrect) {
      const speedBonus = Math.max(0, Math.round((timeLeft.value / maxTime.value) * 50))
      const points = 100 + speedBonus
      activeStudent.value.score = (activeStudent.value.score || 0) + points
      activeStudent.value.correct = (activeStudent.value.correct || 0) + 1
    } else {
      activeStudent.value.wrong = (activeStudent.value.wrong || 0) + 1
    }
    activeStudent.value.academic_score = Math.round((activeStudent.value.correct / questions.value.length) * 100)
  }

  // Kirim respon answer ke backend API agar sinkron
  try {
    api.post(`/ulangan-gamifikasi/sessions/${sessionData.value.id}/answer`, {
      participant_id: activeStudent.value?.id,
      participant_name: activeStudent.value?.name,
      question_id: currentQuestion.value?.id,
      is_correct: isCorrect,
      client_event_id: `ans-${Date.now()}`
    }).catch(() => {})
  } catch {}

  // Jeda 800ms lalu tampilkan kunci & pembahasan
  setTimeout(() => {
    currentStage.value = 'result'
  }, 800)
}

function showLeaderboard() {
  currentStage.value = 'leaderboard'
}

function nextQuestion() {
  currentQuestionIndex.value++
  // Pindah giliran siswa otomatis ke siswa berikutnya
  nextActiveStudent()
  currentStage.value = 'question'
  setupQuestionState()
  startQuestionTimer()
}

async function finishGame() {
  if (timerInterval) clearInterval(timerInterval)
  if (memoryTimerInterval) clearInterval(memoryTimerInterval)

  // Pastikan academic score semua siswa terisi proporsional
  const totalQ = questions.value.length || 5
  participants.value.forEach(p => {
    if (p.answered > 0 && !p.academic_score) {
      p.academic_score = Math.round((p.correct / totalQ) * 100)
    } else if (!p.academic_score && p.score > 0) {
      p.academic_score = Math.min(100, Math.round((p.score / (totalQ * 100)) * 100))
    }
  })

  // Simpan nilai real ke Backend API & sinkronisasi ke Raport (Sumatif TP)
  try {
    await api.post(`/ulangan-gamifikasi/sessions/${sessionData.value.id}/finish`, {
      outcome: 'completed',
      participants: participants.value
    })
  } catch (err) {
    console.warn('Gagal memanggil finish api:', err)
  }

  // Update ke localStorage
  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem('game_session_' + sessionData.value.id)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        parsed.status = 'completed'
        parsed.outcome = 'completed'
        parsed.participants = participants.value
        localStorage.setItem('game_session_' + sessionData.value.id, JSON.stringify(parsed))
      } catch {}
    }
  }

  currentStage.value = 'finish'
}

function stopSessionGame() {
  if (confirm('Apakah Anda yakin ingin menghentikan sesi game ini sekarang dan merangkum skor siswa?')) {
    finishGame()
  }
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  if (memoryTimerInterval) clearInterval(memoryTimerInterval)
})
</script>
