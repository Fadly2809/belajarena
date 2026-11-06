/**
 * AI Assistant Engine - Belajarena
 * Asisten Virtual Cerdas Berbasis Pengetahuan Menyeluruh Website Belajarena
 * Fleksibel Multi-Sekolah untuk Seluruh Guru & Satuan Pendidikan
 */

// Pangkalan Data Pengetahuan Resmi Belajarena (Dinamis Multi-Sekolah)
function getBelajarenaKnowledgeBase(schoolName = 'Satuan Pendidikan', teacherName = 'Bapak/Ibu Guru', teacherNip = '') {
  return `
# BASIS PENGETAHUAN LENGKAP BELAJARENA (${schoolName.toUpperCase()})
- Platform: Belajarena (Sistem Pembelajaran & Presentasi Interaktif Real-time Guru & Siswa)
- Satuan Pendidikan: ${schoolName}
- Guru Pengampu: ${teacherName} ${teacherNip ? `(NIP: ${teacherNip})` : ''}
- Mata Pelajaran Utama: 
  1. Informatika (Kurikulum Merdeka Fase D, Kelas VII, VIII, IX)
  2. KKA - Koding dan Kecerdasan Artifisial (Muatan Inovasi Digital)
- Alamat Akses: Web Browser (Komputer/Laptop/Tablet/HP) & Aplikasi Siswa Android (APK)

## PETA STRUKTUR MENU, ROUTE, & CARA PENGGUNAAN FITUR:

### 1. 🏠 DASHBOARD (/dashboard)
- Fungsi: Beranda utama pemantauan aktivitas mengajar guru.
- Isi: Ringkasan total siswa, jumlah rombel, absensi kehadiran hari ini, jadwal jam mengajar hari ini, statistik rata-rata nilai, dan kartu pintasan cepat ke Edu-Games & Live Presentasi.

### 2. ⭐ FITUR UTAMA 1: EDU-GAMES (/games)
- Tampilan: Fullscreen 100dvh interaktif hero showcase (tanpa scroll desktop/proyektor).
- 5 Pilihan Mode Game Edukasi:
  1. Boss Battle 3D Arena (/games/ulangan-harian/lobby): Pertempuran 3D kelas melawan Boss Monster Glitch. Siswa menjawab soal kuis di HP masing-masing untuk mengurangi HP Boss bersama sekelas.
  2. Fast Quiz: Kuis adu kecepatan dan ketepatan kilat dengan timer per soal.
  3. Memory Match: Game melatih memori dengan mencocokkan kartu pasangan istilah & konsep komputer.
  4. Class Race: Balapan sirkuit kendaraan di mana kecepatan mobil ditentukan oleh jawaban kuis yang benar.
  5. Tower Defense: Membangun menara pertahanan lab komputer dengan energi dari jawaban kuis yang benar.
- Cara Menjalankan Sesi Game:
  1. Buka menu Edu-Games (/games).
  2. Pilih salah satu dari 5 game yang ingin dimainkan.
  3. Klik tombol utama "Main Sekarang".
  4. Pilih paket soal dari Bank Soal dan tentukan kelas/rombel peserta.
  5. Klik "Mulai Sesi Kelas" -> Sistem mengeluarkan 6 digit PIN sesi (misal: 849201).
  6. Siswa memasukkan PIN di HP/laptop masing-masing untuk bergabung.
  7. Guru memantau live skor dan jalannya pertempuran di layar proyektor kelas.

### 3. ⭐ FITUR UTAMA 2: LIVE PRESENTASI (/presentations)
- Tampilan: Fullscreen 100dvh hero showcase bergaya product hero page.
- Fungsi: Menampilkan slide materi ke proyektor kelas dengan sinkronisasi real-time mirroring langsung ke HP siswa. Saat guru berpindah slide, seluruh layar HP siswa berganti seketika tanpa delay.
- Cara Memulai Sesi Live:
  1. Buka menu Live Presentasi (/presentations).
  2. Pilih modul materi yang sudah siap ajar.
  3. Klik tombol "▶️ Buka Sesi Kelas".
  4. Pada jendela yang muncul, tentukan rombel kelas sasaran (misal: Kelas VII A).
  5. Klik "Mulai Tayang Langsung" -> Sistem akan membuat sesi kelas dan menampilkan 6 Digit Kode PIN Sesi.
  6. Bagikan PIN sesi kepada siswa. Siswa mengakses (/presentation-live/:code).
  7. Guru masuk ke Layar Kontrol Studio Guru (/presentations/studio/:id) untuk memindah slide, melihat jumlah siswa terhubung, dan memantau respons siswa.
- Cara Membuat / Mengunggah Materi Baru:
  1. Klik tombol "📤 Unggah / Buat Modul" di pojok kanan atas.
  2. Masukkan judul materi dan pilih mata pelajaran (Informatika / KKA).
  3. Ceklis rombel sasaran (bisa pilih >1 kelas atau pilih semua kelas).
  4. Masukkan deskripsi materi.
  5. Unggah berkas slide (PPTX, PPT, atau PDF) untuk dikonversi otomatis menjadi slide interaktif, ATAU buat modul kanvas slide baru.
  6. Klik "Simpan & Proses Slide".

### 4. 📁 PUSAT AKADEMIK (/academic) - HUB MENU GABUNGAN:
Semua menu manajemen dan penilaian kelas disatukan dalam satu menu hub Akademik:

A. KELOMPOK KELAS & SISWA:
- Manajemen Kelas (/classes): Kelola data rombel kelas, atur nama kelas, wali kelas, tahun ajaran, dan kapasitas siswa.
- Data Siswa (/students): Kelola data induk siswa lengkap (Nama, NIS, NISN, Gender, Email, Kontak Ortu, Foto Profil/Avatar, Cetak Kartu Pelajar & QR Code).
- Jadwal Mingguan (/schedule):
  * Tab 1: Jadwal Mingguan Rutin (Master Senin s.d. Jumat berulang otomatis tiap minggu).
  * Tab 2: Info & Jurnal Pertemuan (catatan capaian materi dan refleksi pertemuan ke-1 hingga 16).
- Absensi Siswa (/attendance): Catat kehadiran harian kelas per jam pelajaran (Hadir, Sakit, Izin, Alpa), dilengkapi persentase kehadiran dan ekspor rekapitulasi.

B. KELOMPOK PENILAIAN & TUGAS:
- Bank Soal (/question-bank): 
  * Membuat soal pilihan ganda, essay, stimulus HOTS/MOTS.
  * Fitur Smart Import: Unggah berkas Microsoft Word (.docx), lembar kerja Excel (.xlsx), atau foto teks soal cetak melalui OCR kamera langsung.
- Ujian CBT (/cbt):
  * Membuat jadwal ulangan harian atau asesmen sumatif daring.
  * Dilengkapi Token Ujian dinamis, timer hitung mundur, acak urutan soal & pilihan ganda.
  * Sistem Anti-Curang (Tab-Switch Detection): Mendeteksi dan mencatat otomatis bila siswa membuka tab lain atau keluar aplikasi.
- Tugas Siswa (/assignments):
  * Memberikan tugas mandiri atau proyek kelompok koding/AI.
  * Siswa mengunggah berkas atau tautan hasil kerja.
  * Guru memeriksa, memberi nilai numerik (0-100), dan umpan balik personal.
- Periksa Kertas AI (/paper-grading):
  * Koreksi lembar jawaban fisik tugas/ulangan tulisan tangan siswa berbasis Gemini Vision.
- Mapping BAB & TP (/curriculum/mapping):
  * Pemetaan Bab, Elemen Kurikulum Merdeka (BK, TIK, SK, JKI, AD, AP, DSI, PLB), Capaian Pembelajaran (CP), dan Tujuan Pembelajaran (TP) serta KKTP.

C. KELOMPOK LAPORAN & MATERI:
- Rekap Nilai Ulangan (/reports/exam-events): Analisis butir soal CBT, daya pembeda, tingkat kesukaran, dan grafik ketuntasan belajar per kelas.
- Rekap Nilai Siswa / Ledger Nilai (/grades): Rekapitulasi nilai akhir gabungan dari seluruh komponen (Ulangan CBT + Tugas Proyek + Praktikum Koding + Kehadiran). Siap diunduh dalam format Excel.
- Live Ranking (/ranking): Papan peringkat leaderboard prestasi dan keaktifan siswa (Total Poin XP, Badge, dan Tingkat Ketuntasan).

### 5. ⚙️ PENGATURAN & PROFIL (/profile, /settings/school)
- Kelola profil guru, update NIP, email, nomor WhatsApp, foto avatar, dan ganti kata sandi.
- Kelola identitas satuan pendidikan (NPSN, nama sekolah, kepala sekolah, kktp standar).

### 6. 📱 PORTAL SISWA & MOBILE ANDROID APK (/student)
- Siswa dapat login menggunakan NIS atau Username mereka (password standar: 123456).
- Menu siswa: Dashboard Siswa, Jadwal Pelajaran Saya, Presensi Saya, Ujian CBT Siswa, Tugas Saya, Rekap Nilai Saya, dan Gabung Sesi Live Presentasi / Edu-Games via PIN.
`
}

// Cache nama-nama model yang berhasil dideteksi untuk efisiensi
let cachedModelsList = null

const STABLE_DEFAULT_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gemini-1.5-pro-latest',
  'gemini-1.5-flash-8b'
]

async function getAvailableGeminiModels(apiKey) {
  if (cachedModelsList && cachedModelsList.length > 0) return cachedModelsList

  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
    if (listRes.ok) {
      const data = await listRes.json()
      const models = data.models || []
      const generatingModels = models
        .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
        .map(m => m.name.replace(/^models\//, ''))
        // Buang model lama yang telah didegradasi / dinonaktifkan Google
        .filter(m => !m.startsWith('gemini-pro') && !m.startsWith('gemini-1.0') && !m.includes('bison'))

      console.log('[Gemini API] Available models for this key:', generatingModels)

      // Prioritaskan model generasi modern Google yang stabil dan terbukti aktif
      const preference = [
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-2.0-flash',
        'gemini-1.5-pro',
        'gemini-1.5-pro-latest',
        'gemini-1.5-flash-8b',
        'gemini-2.0-flash-exp'
      ]

      const prioritized = []
      for (const pref of preference) {
        if (generatingModels.includes(pref)) {
          prioritized.push(pref)
        }
      }
      for (const m of generatingModels) {
        if (!prioritized.includes(m) && !m.includes('tts') && !m.includes('image') && !m.includes('transcribe') && !m.includes('robotics') && !m.includes('embed')) {
          prioritized.push(m)
        }
      }

      if (prioritized.length > 0) {
        cachedModelsList = prioritized
        return prioritized
      }
    } else {
      const err = await listRes.text()
      console.warn('[Gemini API] ListModels response failed:', listRes.status, err)
    }
  } catch (err) {
    console.warn('[Gemini API] Failed to query ListModels:', err.message)
  }

  return STABLE_DEFAULT_MODELS
}

// Query Google Gemini API dengan Prompt Khusus Belajarena
async function callGeminiApi(apiKey, message, history = [], context = {}) {
  const currentRoute = context.currentRoute || '/dashboard'
  const schoolName = context.schoolName || context.school?.name || 'Satuan Pendidikan'
  const teacherName = context.teacherName || context.user?.name || 'Bapak/Ibu Guru'
  const teacherNip = context.teacherNip || context.user?.nip || ''
  const totalStudents = context.totalStudents || 180
  const totalClasses = context.totalClasses || 6
  const totalPresentations = context.totalPresentations || 8

  const knowledgeBase = getBelajarenaKnowledgeBase(schoolName, teacherName, teacherNip)

  const systemPrompt = `Anda adalah "AI Chatbot Belajarena", asisten resmi cerdas, interaktif, dan penuh inisiatif dari platform digital Belajarena di ${schoolName}.
Anda mendampingi ${teacherName} ${teacherNip ? `(NIP: ${teacherNip})` : ''} dalam kegiatan pembelajaran, evaluasi, dan presentasi kelas.

INFORMASI KONTESKTUAL SAAT INI:
- Satuan Pendidikan: ${schoolName}
- Guru Pengampu: ${teacherName} ${teacherNip ? `(NIP: ${teacherNip})` : ''}
- Halaman aktif guru: ${currentRoute}
- Total Siswa Terdaftar: ${totalStudents} siswa
- Total Rombel Kelas: ${totalClasses} kelas
- Total Modul Presentasi: ${totalPresentations} modul

ATURAN PERILAKU INTERAKTIF & REKREASI PERCAKAPAN (SEPERTI CHATGPT & GEMINI):
1. BERPIKIR & MERESPON SECARA DINAMIS (MEMILIKI OTAK PENALARAN):
   - Jangan pernah menjadi mesin kaku yang langsung membuang teks template jika permintaan pengguna masih umum!
   - JIKA GURU MEMINTA SESUATU YANG BELUM SPESIFIK (contoh: "buatkan soal", "minta soal", "saya butuh kuis", "bikin modul ajar", "bikin kodingan"):
     BERTANYALAH KEMBALI SECARA RAMAH DAN CERDAS untuk mengonfirmasi parameter yang dibutuhkan:
     * Tanyakan mata pelajaran (Informatika atau KKA?)
     * Tanyakan topik/bab materi apa?
     * Tanyakan untuk kelas berapa (Kelas VII, VIII, atau IX?)
     * Tanyakan berapa butir nomor soal yang diinginkan?
     * Tanyakan bentuk soal (Pilihan Ganda HOTS dengan stimulus atau Essay/Uraian?)
     Berikan pula contoh singkat agar guru tinggal memilih atau mengonfirmasi.
   - JIKA GURU SUDAH MEMBERIKAN DETAIL (contoh: "buatkan 5 soal pilihan ganda HOTS Informatika kelas 7 bab Jaringan Komputer"):
     Segera buatkan paket soal lengkap berkualitas tinggi dengan stimulus menarik, 4 pilihan opsi (A-D), kunci jawaban, dan pembahasan mendalam.
2. MENJAGA KONTEKS MULTI-TURN (INGAT PERCAKAPAN SEBELUMNYA):
   - Perhatikan riwayat chat (history). Jika sebelumnya Anda bertanya detail materi dan guru baru saja menjawabnya, langsung lanjutkan dengan materi yang diminta tanpa bertanya ulang.
3. KUASAI 100% FITUR & NAVIGASI BELAJARENA:
   - Jika guru bertanya seputar cara menggunakan fitur (Edu-Games, Live Presentasi, CBT, Bank Soal, Jadwal, Absensi, Siswa, Periksa Kertas, dll.), berikan panduan langkah demi langkah (1, 2, 3...) yang runut dan SELALU sertakan tautan navigasi langsung berformat [Nama Menu →](/route-link).
4. FORMAT GITHUB-FLAVORED MARKDOWN:
   - Gunakan format teks yang rapi, tebal, tabel perbandingan jika relevan, dan blok kode bersintaks.

${knowledgeBase}`

  const contents = []
  for (const h of history) {
    if (!h.content) continue
    contents.push({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }]
    })
  }
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  })

  // Dapatkan model terbaik yang tersedia untuk API key ini (Prioritas: gemini-1.5-flash)
  const candidateModels = await getAvailableGeminiModels(apiKey)
  console.log('[Gemini API] Attempting generateContent with candidate models:', candidateModels.slice(0, 4))

  let lastError = null

  for (const model of candidateModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    try {
      const payload = {
        contents: [...contents],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          maxOutputTokens: 2048
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const data = await response.json()
        const candidate = data.candidates?.[0]
        const replyText = candidate?.content?.parts?.[0]?.text
        if (replyText) {
          console.log(`[Gemini API] Successfully generated response using model: ${model}`)
          return replyText
        }
      } else {
        const errText = await response.text()
        console.warn(`[Gemini API] Model ${model} returned HTTP ${response.status}:`, errText)
        let parsedMessage = errText
        try {
          const parsed = JSON.parse(errText)
          if (parsed.error?.message) {
            parsedMessage = parsed.error.message
          }
        } catch (_) {}

        lastError = new Error(`Gemini ${model} (${response.status}): ${parsedMessage}`)
        // Jika 404 (model tidak ada), reset cache supaya sesi berikutnya ambil ulang daftar model
        if (response.status === 404) {
          cachedModelsList = null
          // Lanjut ke model berikutnya
          continue
        }
        // Jika 400 (bad request/invalid key) atau 403 (permission) atau 429 (quota), jangan coba model lain karena pasti sama
        if (response.status === 400 || response.status === 403 || response.status === 429) {
          throw lastError
        }
      }
    } catch (e) {
      lastError = e
      if (e.message && (e.message.includes('400') || e.message.includes('403') || e.message.includes('429') || e.message.includes('API_KEY_INVALID'))) {
        throw e
      }
    }
  }

  throw lastError || new Error('Gagal menghubungi Google Gemini API setelah mencoba model yang tersedia.')
}

// Built-in Expert Engine (Offline / Tanpa API Key) dengan Pemahaman Dialog Interaktif
function generateBuiltInResponse(message, context = {}, history = []) {
  const rawText = message.trim()
  const text = rawText.toLowerCase()
  const currentRoute = context.currentRoute || '/dashboard'

  // Periksa apakah pesan sebelumnya dari bot adalah pertanyaan klarifikasi soal
  const lastBotMsg = history.length > 0 ? (history[history.length - 1].content || '').toLowerCase() : ''
  const isFollowUpToQuestionClarification = lastBotMsg.includes('berapa butir nomor') || lastBotMsg.includes('mata pelajaran apa') || lastBotMsg.includes('topik / bab materi apa')

  // -------------------------------------------------------------
  // 1. INTENT: PERMINTAAN SOAL (DIALOG INTERAKTIF SEPERTI CHATGPT/GEMINI)
  // -------------------------------------------------------------
  const isAskingForQuestions = 
    text.includes('soal') || 
    text.includes('kuis') || 
    text.includes('pertanyaan') || 
    text.includes('ujian') || 
    isFollowUpToQuestionClarification

  if (isAskingForQuestions) {
    // Deteksi parameter spesifik dalam pesan sekarang atau kombinasi follow-up
    const hasTopic = 
      text.includes('jaringan') || text.includes('internet') ||
      text.includes('algoritma') || text.includes('pemrograman') || text.includes('scratch') || text.includes('python') ||
      text.includes('komputer') || text.includes('hardware') || text.includes('software') || text.includes('sistem komputer') ||
      text.includes('data') || text.includes('excel') || text.includes('analisis') ||
      text.includes('ai') || text.includes('kecerdasan') || text.includes('prompt') || text.includes('vision') || text.includes('machine learning') ||
      text.includes('etika') || text.includes('berpikir komputasional')

    const hasCount = /\b(\d+)\s*(nomor|butir|soal)?\b/.test(text)
    const hasGrade = text.includes('kelas 7') || text.includes('kelas vii') || text.includes('kelas 8') || text.includes('kelas viii') || text.includes('kelas 9') || text.includes('kelas ix')

    // KASUS A: Permintaan masih umum (misal: "minta soal", "buatkan soal", "bikin soal", "butuh soal")
    // -> BOT BERTANYA BALIK SEPERTI CHATGPT/GEMINI!
    if (!hasTopic && !isFollowUpToQuestionClarification) {
      return `### 🤖 Siap Membantu, Pak Fadly!

Agar paket soal yang saya buatkan benar-benar tepat sasaran dan sesuai dengan tujuan pembelajaran Bapak di kelas, boleh saya konfirmasi beberapa detail berikut?

1. 📚 **Mata Pelajaran**: Mau untuk **Informatika** atau **KKA (Koding & Kecerdasan Artifisial)**?
2. 🎯 **Materi / Topik Utama**:
   - *Informatika*: Berpikir Komputasional, Sistem Komputer, Jaringan Komputer & Internet, Analisis Data, atau Algoritma Pemrograman?
   - *KKA*: Konsep Dasar AI, Machine Learning, Computer Vision, Prompt Engineering, atau Etika Digital AI?
3. 🏫 **Tingkatan Kelas**: Kelas **VII**, **VIII**, atau **IX** SMP?
4. 🔢 **Jumlah Nomor Soal**: Mau dibuatkan berapa butir? *(contoh: 3, 5, atau 10 nomor)*
5. 📝 **Bentuk Soal**: Pilihan Ganda (A–D) HOTS dengan stimulus narasi/studi kasus, atau Soal Essay/Uraian?

---

> 💡 **Atau Bapak cukup ketik satu kalimat spesifik, contohnya:**  
> *"Buatkan 5 butir soal pilihan ganda HOTS Informatika Kelas 7 materi Jaringan Komputer"*`
    }

    // KASUS B: Sudah ada topik spesifik (atau jawaban dari klarifikasi)
    // -> GENERATE SOAL SPESIFIK SESUAI TOPIK YANG DIMINTA!
    let detectedTopic = 'Informatika & KKA'
    let subjectName = 'Informatika'
    let sampleQuestions = []

    if (text.includes('jaringan') || text.includes('internet')) {
      detectedTopic = 'Jaringan Komputer dan Internet (JKI)'
      subjectName = 'Informatika'
      sampleQuestions = [
        {
          num: 1,
          stimulus: 'Di Lab Komputer SMP Negeri 6 Kendari, 20 unit komputer dapat saling berbagi pakai printer tanpa harus memindahkan kabel colokan ke tiap komputer.',
          question: 'Arsitektur jaringan komputer lokal yang paling tepat menggambarkan kondisi pemanfaatan perangkat di lab tersebut adalah...',
          options: [
            'A. WAN (Wide Area Network) berbasis satelit antar-wilayah.',
            'B. LAN (Local Area Network) dengan mekanisme resource sharing perangkat.',
            'C. PAN (Personal Area Network) nirkabel Bluetooth jarak sangat pendek.',
            'D. MAN (Metropolitan Area Network) penghubung kantor dinas kota.'
          ],
          key: 'B',
          expl: 'LAN (Local Area Network) mencakup area terbatas seperti gedung atau lab sekolah, memungkinkan resource sharing (berbagi printer, berkas, internet).'
        },
        {
          num: 2,
          stimulus: 'Siswa kelas VII ingin mencari referensi materi pelajaran di internet. Di bilah peramban (browser) muncul peringatan tanda gembok terbuka dengan protokol "http://" bukan "https://".',
          question: 'Berdasarkan aspek keamanan data digital, langkah pencegahan paling tepat yang harus dilakukan siswa adalah...',
          options: [
            'A. Tetap memasukkan password akun karena peramban komputer lab sudah canggih.',
            'B. Tidak memasukkan data sensitif (password/identitas) karena jalur transmisi data HTTP tidak terenkripsi.',
            'C. Mematikan sambungan listrik komputer seketika agar tidak terkena radiasi.',
            'D. Mengubah kabel LAN agar otomatis berubah menjadi protokol HTTPS.'
          ],
          key: 'B',
          expl: 'Protokol HTTPS menggunakan enkripsi SSL/TLS untuk melindungi kerahasiaan data pengguna, sedangkan HTTP mentransmisikan data dalam bentuk plain text yang rentan disadap.'
        },
        {
          num: 3,
          stimulus: 'Seorang guru mengirimkan file modul ajar berukuran 5 MB ke ponsel seluruh siswa di kelas menggunakan sambungan Wi-Fi sekolah.',
          question: 'Perangkat keras jaringan yang berfungsi memancarkan sinyal gelombang radio Wi-Fi di dalam ruangan kelas tersebut adalah...',
          options: [
            'A. Wireless Access Point (WAP)',
            'B. Harddisk Eksternal',
            'C. Power Supply Unit',
            'D. VGA Card'
          ],
          key: 'A',
          expl: 'Access Point adalah perangkat yang memancarkan sinyal nirkabel (Wi-Fi) sehingga perangkat laptop/ponsel dapat terhubung ke jaringan lokal sekolah.'
        }
      ]
    } else if (text.includes('ai') || text.includes('kecerdasan') || text.includes('kka') || text.includes('prompt') || text.includes('vision')) {
      detectedTopic = 'Koding dan Kecerdasan Artifisial (KKA) - Konsep & Etika AI'
      subjectName = 'KKA (Koding & Kecerdasan Artifisial)'
      sampleQuestions = [
        {
          num: 1,
          stimulus: 'Model AI pengenal objek yang dilatih siswa kelas VII SMPN 6 Kendari selalu menandai botol plastik bening di atas rumput hijau sebagai "daun kering", padahal botol plastik di atas meja putih dikenali dengan sangat akurat.',
          question: 'Penyebab utama terjadinya galat (error) pengenalan pada botol di atas rumput tersebut adalah...',
          options: [
            'A. Komputer lab kekurangan daya baterai saat proses pemindaian.',
            'B. Fenomena background bias (bias latar belakang) karena data latih botol kurang variasi warna lingkungan.',
            'C. Kamera web otomatis mengubah struktur atom plastik menjadi klorofil daun.',
            'D. Algoritma AI menolak memproses benda tembus pandang.'
          ],
          key: 'B',
          expl: 'Computer Vision mempelajari pola fitur pixel gambar. Jika sampel botol selalu berlatar meja putih, saat diletakkan di rumput model justru memproses warna rumput hijau sebagai daun.'
        },
        {
          num: 2,
          stimulus: 'Seorang siswa menuliskan instruksi prompt ke AI generatif: "Ceritakan komputer zaman dulu dong." Jawaban yang keluar terlalu panjang, bertele-tele, dan memuat dongeng fiksi.',
          question: 'Berdasarkan teknik Prompt Engineering yang baik, revisi prompt mana yang paling efektif untuk kebutuhan belajar rangkuman sekolah?',
          options: [
            'A. "Tolong ceritakan sejarah komputer sebanyak mungkin sekarang."',
            'B. "Buat rangkuman sejarah perkembangan komputer generasi 1 s.d. 5 dalam tabel perbandingan komponen utama dan tahun, bahasa ringkas untuk anak SMP."',
            'C. "Jangan beri dongeng, pokoknya komputer saja."',
            'D. "Apakah kamu tahu sejarah komputer? Ya atau tidak."'
          ],
          key: 'B',
          expl: 'Prompt yang efektif harus memiliki konteks jelas, instruksi tugas spesifik, format keluaran (tabel perbandingan), dan persona sasaran pembaca (anak SMP).'
        }
      ]
    } else {
      // Default Algoritma / Sistem Komputer
      detectedTopic = 'Algoritma Pemrograman & Berpikir Komputasional'
      subjectName = 'Informatika'
      sampleQuestions = [
        {
          num: 1,
          stimulus: 'Siswa diminta membuat urutan logika algoritma: "Jika nilai tugas >= 75, maka TUNTAS, jika tidak maka REMEDIAL".',
          question: 'Struktur kontrol pemrograman yang tepat untuk mengeksekusi logika pengambilan keputusan tersebut adalah...',
          options: [
            'A. Struktur Perulangan (Looping FOR/WHILE)',
            'B. Struktur Percabangan Bersyarat (Selection IF-ELSE)',
            'C. Struktur Variabel Array Statis',
            'D. Struktur Deklarasi Komentar'
          ],
          key: 'B',
          expl: 'Percabangan (IF-ELSE) digunakan ketika komputer harus memilih satu di antara dua atau lebih jalur aksi berdasarkan kondisi benar/salah.'
        },
        {
          num: 2,
          stimulus: 'Dalam pemrograman visual Scratch, sprite kucing ingin digerakkan maju 10 langkah sebanyak 5 kali berturut-turut tanpa menulis blok "gerak 10 langkah" berulang 5 kali.',
          question: 'Blok perintah Scratch mana yang paling efisien digunakan?',
          options: [
            'A. Blok kontrol "ulangi (5) kali"',
            'B. Blok gerak "lompat ke sembarang posisi"',
            'C. Blok tampilan "katakan Halo!"',
            'D. Blok sensor "jarak ke mouse"'
          ],
          key: 'A',
          expl: 'Blok perulangan (loop repeat) menghemat penulisan kode dan menjalankan instruksi secara berulang sesuai jumlah iterasi yang ditentukan.'
        }
      ]
    }

    let questionsOutput = `### 📋 Paket Butir Soal HOTS — ${subjectName}\n`
    questionsOutput += `**Topik Materi**: ${detectedTopic}  \n`
    questionsOutput += `**Satuan Pendidikan**: SMP Negeri 6 Kendari  \n`
    questionsOutput += `**Fase / Kelas**: Fase D (SMP)  \n`
    questionsOutput += `**Penyusun**: Muhammad Fadly Akbar Arsandi, S.Pd.\n\n---\n\n`

    sampleQuestions.forEach(q => {
      questionsOutput += `#### Nomor ${q.num}: Analisis Kasus\n`
      questionsOutput += `> **Stimulus:**\n> ${q.stimulus}\n\n`
      questionsOutput += `**Pertanyaan:** ${q.question}\n`
      q.options.forEach(opt => {
        questionsOutput += `- ${opt}\n`
      })
      questionsOutput += `\n✅ **Kunci Jawaban:** **${q.key}**  \n`
      questionsOutput += `💡 **Pembahasan:** ${q.expl}\n\n---\n\n`
    })

    questionsOutput += `> 📥 **Aksi Selanjutnya:** Bapak bisa langsung menambahkan butir soal ini ke Bank Soal Belajarena: [Buka Bank Soal →](/question-bank)\n\n`
    questionsOutput += `*Apakah butir soal di atas sudah sesuai, atau Bapak ingin menambah jumlah nomor dan mengubah tingkat kesulitannya?*`

    return questionsOutput
  }

  // -------------------------------------------------------------
  // 2. INTENT: PERMINTAAN MODUL AJAR (BERTANYA DETAIL JIKA UMUM)
  // -------------------------------------------------------------
  if (text.includes('modul ajar') || text.includes('rpp') || text.includes('perangkat ajar')) {
    if (!text.includes('elemen') && !text.includes('jp') && !text.includes('bab') && !text.includes('topik')) {
      return `### 📘 Draf Perangkat Ajar Kurikulum Merdeka (Fase D SMP)
Halo Pak Fadly! Saya siap merumuskan modul ajar yang lengkap dan terstruktur sesuai panduan Kurikulum Merdeka SMPN 6 Kendari.

Agar modul ajar sesuai dengan target pertemuan minggu ini, mohon konfirmasi beberapa hal:
1. **Mata Pelajaran**: **Informatika** atau **KKA**?
2. **Elemen Capaian**: Berpikir Komputasional (BK), Teknologi Informasi & Komunikasi (TIK), Sistem Komputer (SK), Jaringan Komputer & Internet (JKI), Analisis Data (AD), atau Algoritma Pemrograman (AP)?
3. **Sasaran Kelas & Alokasi Waktu**: Kelas VII, VIII, atau IX (berapa JP, misal 2 x 40 menit)?
4. **Model Pembelajaran**: Mau menggunakan *Project-Based Learning (PjBL)*, *Problem-Based Learning (PBL)*, atau *Discovery Learning*?

---

> 💡 **Ketik cepat jika ingin langsung dibuatkan contoh lengkap:**  
> *"Buatkan modul ajar Informatika Fase D elemen Algoritma Pemrograman 2 JP model PjBL"*`
    }
  }

  // -------------------------------------------------------------
  // 3. INTENT: KODING PYTHON / SCRATCH / PEMROGRAMAN
  // -------------------------------------------------------------
  if (text.includes('koding') || text.includes('coding') || text.includes('python') || text.includes('scratch') || text.includes('program') || text.includes('kode') || text.includes('script')) {
    if (text.includes('python') || text.includes('scratch') || text.includes('contoh')) {
      return `### 💻 Contoh Script Praktikum Siswa SMPN 6 Kendari
**Topik**: Logika Percabangan Nilai Kelulusan Proyek Komputasi  
**Guru Pengampu**: Muhammad Fadly Akbar Arsandi, S.Pd.

\`\`\`python
# ==========================================================
# Program: Pengecekan Ketuntasan KKA SMP Negeri 6 Kendari
# ==========================================================

nama = input("Nama Siswa : ")
nilai = float(input("Nilai Proyek Koding (0-100): "))

print("\\n--- HASIL EVALUASI ---")
if nilai >= 85:
    status = "Istimewa - Sangat Mahir (Kategori A)"
elif nilai >= 75:
    status = "Tuntas - Memenuhi Standar KKTP (Kategori B)"
else:
    status = "Perlu Pendampingan Remedial di Lab (Kategori C)"

print(f"Siswa: {nama} | Status: {status}")
\`\`\`

> 💡 **Praktikum Lab:** Mintalah siswa menjalankan kode ini di IDLE Python atau VS Code di lab komputer dan memasukkan nilai mereka masing-masing.`
    }

    return `### 💻 Bantuan Praktikum Koding & Pemrograman
Halo Pak Fadly! Belajarena mendukung materi koding ramah siswa SMP.

Mau saya bantu buatkan contoh kode untuk topik apa?
1. **Bahasa Pemrograman**: Mau berbasis visual (**Scratch / MakeCode Block**) atau teks (**Python**)?
2. **Topik Materi**:
   - Logika Runtunan (Sekuensial)
   - Logika Percabangan (\`if-elif-else\`)
   - Perulangan (\`for\` / \`while\`)
   - Variabel dan Operasi Hitung Nilai
3. **Tingkat Kesulitan**: Pemula (Kelas VII) atau Lanjutan (Kelas VIII-IX)?`
  }

  // -------------------------------------------------------------
  // 4. INTENT: PANDUAN LIVE PRESENTASI
  // -------------------------------------------------------------
  if (text.includes('presentasi') || text.includes('slide') || text.includes('studio') || text.includes('proyektor') || text.includes('mirroring')) {
    return `### 📡 Panduan Lengkap Fitur Live Presentasi Interaktif
Halo Pak Fadly! Menu **Live Presentasi** adalah fitur unggulan Belajarena untuk memproyeksikan slide ke proyektor kelas dengan sinkronisasi real-time mirroring langsung ke HP siswa.

---

#### 🚀 Cara Memulai Sesi Live di Kelas:
1. Buka menu [⭐ Live Presentasi →](/presentations).
2. Pilih modul materi yang ingin diajarkan.
3. Klik tombol utama **"▶️ Buka Sesi Kelas"**.
4. Tentukan rombel kelas sasaran (misal: Kelas VII A).
5. Klik **"Mulai Tayang Langsung"** -> Sistem membuat sesi dan menampilkan **6 Digit PIN Sesi**.
6. Siswa memasukkan PIN di portal siswa (/presentation-live/:code).
7. Guru mengontrol slide via [Studio Guru](/presentations) dan seluruh layar HP siswa berganti seketika tanpa delay.

> 📤 **Unggah Modul Baru:** Klik tombol [Unggah / Buat Modul](/presentations) di pojok kanan atas untuk mengunggah file PPTX/PDF.`
  }

  // -------------------------------------------------------------
  // 5. INTENT: EDU-GAMES
  // -------------------------------------------------------------
  if (text.includes('game') || text.includes('edu-games') || text.includes('boss battle') || text.includes('kuis') || text.includes('fast quiz')) {
    return `### 🎮 Panduan Fitur Edu-Games Belajarena
Belajarena menyediakan **5 Mode Game Edukasi Interaktif** (100dvh fullscreen) yang terhubung langsung dengan Bank Soal:

1. **⚔️ Boss Battle 3D**: Seluruh siswa sekelas bekerja sama mengalahkan Boss Monster dengan menjawab kuis di HP.
2. **⚡ Fast Quiz**: Kuis adu kecepatan dan ketepatan kilat dengan papan skor real-time.
3. **🃏 Memory Match**: Mencocokkan kartu pasangan istilah & konsep komputer.
4. **🏎️ Class Race**: Balapan sirkuit siber berbasis ketepatan jawaban kuis.
5. **🏰 Tower Defense**: Menjaga menara lab dari bot dengan energi dari jawaban kuis.

> 🚀 **Langkah:** Buka [⭐ Edu-Games →](/games) -> Pilih Game -> Klik "Main Sekarang" -> Pilih paket Bank Soal -> Dapatkan PIN Sesi untuk siswa!`
  }

  // -------------------------------------------------------------
  // 6. INTENT: BANK SOAL & SMART IMPORT
  // -------------------------------------------------------------
  if (text.includes('bank soal') || text.includes('import') || text.includes('word') || text.includes('excel') || text.includes('ocr')) {
    return `### 📝 Panduan Manajemen Bank Soal & Smart Import
Belajarena menyediakan 3 cara praktis untuk menyusun bank soal:

1. **Input Manual**: Buka [Bank Soal →](/question-bank) -> Klik **"+ Buat Butir Soal Baru"**.
2. **Smart Import Word (.docx) / Excel (.xlsx)**: Klik tombol **"📥 Impor Soal"** dan unggah berkas dari laptop Bapak.
3. **OCR Foto Buku / Lembar Cetak**: Cukup foto lembar soal cetak fisik; OCR Belajarena akan mengekstrak teksnya secara instan.

> 🔗 **Tautan Cepat:** [Buka Bank Soal Belajarena →](/question-bank)`
  }

  // -------------------------------------------------------------
  // 7. INTENT: UJIAN CBT
  // -------------------------------------------------------------
  if (text.includes('cbt') || text.includes('token') || text.includes('anti-curang')) {
    return `### 🖥️ Panduan Penyelenggaraan Ujian CBT Online
Langkah menyelenggarakan ujian CBT di Belajarena:
1. Buka menu [Pusat Ujian CBT →](/cbt).
2. Klik **"+ Jadwalkan Ujian Baru"** -> Masukkan judul dan pilih kelas sasaran.
3. Pilih paket soal dari Bank Soal dan atur durasi pengerjaan.
4. Sistem akan menghasilkan **Token Ujian** untuk dibagikan kepada siswa saat ujian dimulai.
5. Dilengkapi sistem **Anti-Curang (Tab-Switch Detection)** otomatis.

> 🔗 **Tautan Cepat:** [Buka Menu Ujian CBT →](/cbt)`
  }

  // -------------------------------------------------------------
  // 8. INTENT: JADWAL & ABSENSI
  // -------------------------------------------------------------
  if (text.includes('jadwal') || text.includes('jurnal')) {
    return `### 📆 Jadwal Mengajar & Jurnal Mingguan
Buka menu [Jadwal & Jurnal Mengajar →](/schedule):
- **Tab 1: Jadwal Mingguan Rutin**: Slot mengajar tetap Senin–Jumat yang otomatis berulang tiap pekan.
- **Tab 2: Info & Jurnal Pertemuan (Minggu 1-16)**: Catatan capaian ajar dan refleksi per pertemuan.

> 🔗 [Buka Jadwal & Jurnal →](/schedule)`
  }

  if (text.includes('absen') || text.includes('kehadiran') || text.includes('presensi')) {
    return `### 📋 Presensi & Absensi Siswa
Buka menu [Absensi Siswa →](/attendance):
1. Pilih kelas yang sedang diajar dan tanggal pertemuan.
2. Tandai Hadir (H), Sakit (S), Izin (I), atau Alpa (A).
3. Ada tombol cepat **"Tandai Semua Hadir"**.
4. Klik **"Simpan Presensi"**; rekapan otomatis tersimpan ke ledger nilai.

> 🔗 [Buka Absensi Siswa →](/attendance)`
  }

  // -------------------------------------------------------------
  // 9. INTENT: NILAI & LEDGER
  // -------------------------------------------------------------
  if (text.includes('nilai') || text.includes('ledger') || text.includes('rekap') || text.includes('rapor')) {
    return `### 📊 Rekapitulasi Nilai & Ledger Rapor
- **Rekap Nilai Ulangan ([Buka Rekap CBT →](/reports/exam-events))**: Analisis butir soal CBT dan daya pembeda.
- **Rekap Nilai Siswa / Ledger ([Buka Ledger Nilai →](/grades))**: Nilai akhir komprehensif (CBT + Tugas + Proyek Koding + Absensi) siap ekspor ke Excel.

> 🎯 **Standar KKTP**: Informatika & KKA Fase D minimal **75 - 78**.`
  }

  // -------------------------------------------------------------
  // 10. DEFAULT / PERCAKAPAN UMUM
  // -------------------------------------------------------------
  const schoolName = context.schoolName || context.school?.name || 'Satuan Pendidikan'
  const teacherName = context.teacherName || context.user?.name || 'Bapak/Ibu Guru'
  const teacherNip = context.teacherNip || context.user?.nip ? `(NIP: ${context.teacherNip || context.user?.nip})` : ''

  return `### 🤖 Asisten AI Belajarena — ${schoolName}
Halo **${teacherName}** ${teacherNip}!  
Selamat datang di Asisten Pedagogis Digital Belajarena untuk **${schoolName}**.

Mengenai: **"${rawText}"**

Bagaimana saya bisa membantu Bapak/Ibu hari ini?
- 📋 Mau membuat paket butir soal kuis atau ulangan? *(Ketik: "Buatkan soal Informatika" atau "Buatkan soal KKA")*
- 📘 Butuh bantuan draf Modul Ajar Kurikulum Merdeka? *(Ketik: "Buatkan modul ajar")*
- 📡 Panduan menjalankan [Live Presentasi](/presentations) atau [Edu-Games](/games)?
- 📝 Panduan koreksi lembar jawaban fisik [Periksa Kertas AI](/paper-grading)?
- 🖥️ Pengaturan [Ujian CBT](/cbt) atau [Bank Soal](/question-bank)?

> 💡 *Silakan beritahu saya kebutuhan Anda secara santai layaknya berbicara dengan asisten pribadi!*`
}

// Query Google Gemini Vision API untuk Pemeriksaan Lembar Jawaban Kertas
async function callGeminiVision(apiKey, imageParts = [], promptText = '', options = {}) {
  if (!apiKey) {
    throw new Error('API Key Google Gemini belum dikonfigurasi di server.')
  }

  if (!imageParts || imageParts.length === 0) {
    throw new Error('Tidak ada berkas lembar jawaban yang disertakan.')
  }

  // Model vision Google Gemini (prioritas 1.5-flash / 2.0-flash / 1.5-pro)
  const candidateModels = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-2.0-flash',
    'gemini-1.5-pro'
  ]

  // Siapkan parts: gambar-gambar diikuti teks prompt instruksi penilaian
  const parts = []
  for (const img of imageParts) {
    if (img.inlineData) {
      parts.push({
        inlineData: {
          mimeType: img.inlineData.mimeType || 'image/jpeg',
          data: img.inlineData.data
        }
      })
    } else if (img.mimeType && img.data) {
      parts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.data
        }
      })
    }
  }

  parts.push({
    text: promptText
  })

  const payload = {
    contents: [
      {
        role: 'user',
        parts: parts
      }
    ],
    generationConfig: {
      temperature: options.temperature !== undefined ? options.temperature : 0.15,
      topP: 0.95,
      maxOutputTokens: options.maxOutputTokens || 4096,
      responseMimeType: 'application/json'
    }
  }

  let lastError = null

  // Coba model kandidat secara berurutan
  for (const model of candidateModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    
    // Maksimal 1x retry jika JSON parse error
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 detik timeout

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        })
        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          const candidate = data.candidates?.[0]
          const rawText = candidate?.content?.parts?.[0]?.text
          if (!rawText) {
            throw new Error(`Respons model ${model} kosong.`)
          }

          // Bersihkan markdown code fences jika model menyertakan ```json ... ```
          let cleaned = rawText.trim()
          if (cleaned.startsWith('```json')) {
            cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim()
          } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '').trim()
          }

          try {
            const parsedJson = JSON.parse(cleaned)
            console.log(`[Gemini Vision] Berhasil memproses lembar jawaban menggunakan model: ${model}`)
            return parsedJson
          } catch (jsonErr) {
            console.warn(`[Gemini Vision] Percobaan ${attempt + 1}: Gagal parse JSON dari model ${model}:`, jsonErr.message)
            if (attempt === 0) continue // Retry 1 kali
            throw new Error(`Format JSON dari AI tidak valid: ${jsonErr.message}`)
          }
        } else {
          const errText = await response.text()
          console.warn(`[Gemini Vision] Model ${model} HTTP ${response.status}:`, errText.slice(0, 200))
          let parsedMessage = errText
          try {
            const p = JSON.parse(errText)
            if (p.error?.message) parsedMessage = p.error.message
          } catch (_) {}

          lastError = new Error(`Gemini ${model} (${response.status}): ${parsedMessage}`)
          // Jika permission/invalid key/quota, stop
          if (response.status === 400 || response.status === 403 || response.status === 429) {
            throw lastError
          }
          break // Pindah ke model berikutnya jika 404 atau server error
        }
      } catch (err) {
        lastError = err
        if (err.name === 'AbortError') {
          lastError = new Error(`Permintaan ke Gemini API (${model}) timeout setelah 60 detik.`)
        }
        if (lastError.message && (lastError.message.includes('400') || lastError.message.includes('403') || lastError.message.includes('429') || lastError.message.includes('API_KEY_INVALID'))) {
          throw lastError
        }
        break // Pindah ke model kandidat berikutnya
      }
    }
  }

  throw lastError || new Error('Gagal memproses lembar jawaban menggunakan Google Gemini Vision.')
}

export { callGeminiApi, generateBuiltInResponse, callGeminiVision }
