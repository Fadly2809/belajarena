/**
 * AI Assistant Engine - Belajarena
 * Asisten Virtual Cerdas Berbasis Pengetahuan Menyeluruh Website Belajarena
 * Khusus untuk Guru Informatika & KKA (Koding dan Kecerdasan Artifisial)
 * SMP Negeri 6 Kendari — Muhammad Fadly Akbar Arsandi, S.Pd. (NIP: 199509282020121003)
 */

// Pangkalan Data Pengetahuan Resmi Belajarena
const BELAJARENA_KNOWLEDGE_BASE = `
# BASIS PENGETAHUAN LENGKAP BELAJARENA (SMP NEGERI 6 KENDARI)
- Platform: Belajarena (Sistem Pembelajaran & Presentasi Interaktif Real-time Guru & Siswa)
- Sekolah: SMP Negeri 6 Kendari, Sulawesi Tenggara
- Guru Pengampu: Muhammad Fadly Akbar Arsandi, S.Pd. (NIP: 199509282020121003, Email: muhammadarsandi89@guru.smp.belajar.id)
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
  4. Pilih rombel kelas sasaran -> Klik "Mulai Tayang Langsung".
  5. Bagikan PIN sesi kepada siswa. Siswa mengakses (/presentation-live/:code).
  6. Guru masuk ke Layar Kontrol Studio Guru (/presentations/studio/:id) untuk memindah slide, melihat jumlah siswa terhubung, dan memantau respons siswa.
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
- Manajemen Kelas (/classes): Kelola data rombel kelas VII A s.d. VII F, atur nama kelas, wali kelas, tahun ajaran, dan kapasitas siswa.
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
- Mapping BAB & TP (/curriculum/mapping):
  * Pemetaan Bab, Elemen Kurikulum Merdeka (BK, TIK, SK, JKI, AD, AP, DSI, PLB), Capaian Pembelajaran (CP), dan Tujuan Pembelajaran (TP) serta KKTP.

C. KELOMPOK LAPORAN & MATERI:
- Rekap Nilai Ulangan (/reports/exam-events): Analisis butir soal CBT, daya pembeda, tingkat kesukaran, dan grafik ketuntasan belajar per kelas.
- Rekap Nilai Siswa / Ledger Nilai (/grades): Rekapitulasi nilai akhir gabungan dari seluruh komponen (Ulangan CBT + Tugas Proyek + Praktikum Koding + Kehadiran). Siap diunduh dalam format Excel.
- Live Ranking (/ranking): Papan peringkat leaderboard prestasi dan keaktifan siswa (Total Poin XP, Badge, dan Tingkat Ketuntasan).
- Materi Ajar Pustaka (/presentations?view=catalog): Katalog pustaka digital modul ajar, materi presentasi, dan lembar kerja siswa.

### 5. ⚙️ PENGATURAN & PROFIL (/profile, /settings)
- Kelola profil guru Muhammad Fadly Akbar Arsandi, S.Pd., update NIP, email, nomor WhatsApp, foto avatar, dan ganti kata sandi.

### 6. 📱 PORTAL SISWA & MOBILE ANDROID APK (/student)
- Siswa dapat login menggunakan NIS atau Username mereka (password standar: 123456).
- Menu siswa: Dashboard Siswa, Jadwal Pelajaran Saya, Presensi Saya, Ujian CBT Siswa, Tugas Saya, Rekap Nilai Saya, dan Gabung Sesi Live Presentasi / Edu-Games via PIN.
`

// Query Google Gemini API dengan Prompt Khusus Belajarena
async function callGeminiApi(apiKey, message, history = [], context = {}) {
  const currentRoute = context.currentRoute || '/dashboard'
  const totalStudents = context.totalStudents || 180
  const totalClasses = context.totalClasses || 6
  const totalPresentations = context.totalPresentations || 8

  const systemPrompt = `Anda adalah "AI Chatbot Belajarena", asisten resmi cerdas dan ramah dari platform digital Belajarena di SMP Negeri 6 Kendari.
Anda mendampingi Bapak Muhammad Fadly Akbar Arsandi, S.Pd. (Guru Informatika & KKA, NIP: 199509282020121003).

INFORMASI KONTESKTUAL SAAT INI:
- Halaman aktif guru: ${currentRoute}
- Total Siswa Terdaftar: ${totalStudents} siswa
- Total Rombel Kelas: ${totalClasses} kelas (Kelas VII A - VII F)
- Total Modul Presentasi: ${totalPresentations} modul

PANDUAN MENJAWAB:
1. Anda MENGUASAI 100% seluruh fitur, alur kerja, menu, dan navigasi website Belajarena sebagaimana tertera pada basis pengetahuan di bawah.
2. Jawablah selalu dengan bahasa Indonesia yang ramah, santun, profesional, dan terstruktur rapi (gunakan judul markdown, poin-poin bold, tabel jika relevan, dan kotak tips).
3. Bila guru bertanya "bagaimana cara...", berikan panduan langkah demi langkah (1, 2, 3...) yang jelas dan sebutkan nama tombol persis seperti di antarmuka web.
4. SELALU sertakan tautan navigasi yang dapat diklik langsung oleh guru menggunakan format markdown [Nama Tautan →](/url-menu). Contoh: [Buka Bank Soal →](/question-bank) atau [Buka Live Presentasi →](/presentations).
5. Bila guru meminta materi ajar atau soal, buatkan materi Kurikulum Merdeka Fase D (SMP) berkualitas tinggi, soal HOTS dengan stimulus, atau kode Python/Scratch yang rapi.

${BELAJARENA_KNOWLEDGE_BASE}`

  const contents = []
  for (const h of history) {
    contents.push({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }]
    })
  }
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  })

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.6,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    })
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Gemini API Error: ${response.status} - ${errText}`)
  }

  const data = await response.json()
  const candidate = data.candidates?.[0]
  const replyText = candidate?.content?.parts?.[0]?.text
  if (!replyText) throw new Error('Jawaban kosong dari Gemini API')
  return replyText
}

// Built-in Expert Engine (Offline / Tanpa API Key) dengan Pemahaman Penuh Fitur Belajarena
function generateBuiltInResponse(message, context = {}) {
  const text = message.toLowerCase()
  const currentRoute = context.currentRoute || '/dashboard'

  // 1. INTENT: LIVE PRESENTASI / STUDIO / SLIDE / PROYEKTOR / MIRRORING
  if (text.includes('presentasi') || text.includes('slide') || text.includes('studio') || text.includes('proyektor') || text.includes('mirroring') || text.includes('materi ajar')) {
    if (text.includes('cara') || text.includes('mulai') || text.includes('buat') || text.includes('unggah') || text.includes('upload') || text.includes('jalankan')) {
      return `### 📡 Panduan Lengkap Fitur Live Presentasi Interaktif
Halo Pak Fadly! Menu **Live Presentasi** adalah salah satu fitur unggulan Belajarena yang dirancang khusus untuk memproyeksikan slide ke proyektor kelas sekaligus melakukan *real-time mirroring* ke layar HP seluruh siswa secara sinkron tanpa jeda.

---

#### 🚀 Cara Memulai Sesi Live di Kelas:
1. Buka menu [⭐ Live Presentasi →](/presentations).
2. Pilih modul materi yang ingin diajarkan pada strip mini di bawah atau titik warna tema di sebelah kanan.
3. Klik tombol utama **"▶️ Buka Sesi Kelas"**.
4. Pada jendela yang muncul, tentukan rombel kelas sasaran (misal: Kelas VII A).
5. Klik **"Mulai Tayang Langsung"** -> Sistem akan membuat sesi kelas dan menampilkan **6 Digit Kode PIN Sesi**.
6. Ajak siswa membuka portal siswa di HP masing-masing dan memasukkan kode PIN tersebut.
7. Masuk ke **Layar Kontrol Studio Guru** untuk mengendalikan pergantian slide. Setiap kali Bapak memindah slide, layar HP siswa akan berganti secara otomatis.

---

#### 📤 Cara Mengunggah Berkas Presentasi Baru (PPTX / PDF):
1. Di halaman [Live Presentasi](/presentations), klik tombol **"📤 Unggah / Buat Modul"** di pojok kanan atas.
2. Tuliskan **Judul Materi Pembelajaran** dan pilih **Mata Pelajaran** (Informatika atau KKA).
3. Ceklis kelas mana saja yang diperuntukkan modul ini.
4. Tarik (*drag and drop*) berkas slide presentasi Bapak (**format .pptx, .ppt, atau .pdf**).
5. Sistem akan otomatis mengonversi halaman berkas menjadi slide interaktif 16:9 siap ajar.
6. Klik **"Simpan & Proses Slide"**.

> 💡 **Tips Guru:** Anda juga dapat melihat seluruh arsip file presentasi dalam mode katalog klasik dengan mengeklik tombol [Lihat Semua Materi (Katalog) →](/presentations?view=catalog).`
    }
  }

  // 2. INTENT: EDU-GAMES / BOSS BATTLE / GAME / KUIS INTERAKTIF
  if (text.includes('game') || text.includes('edu-games') || text.includes('boss battle') || text.includes('fast quiz') || text.includes('memory') || text.includes('race') || text.includes('tower defense')) {
    return `### 🎮 Panduan Fitur Edu-Games Belajarena
Halo Pak Fadly! Belajarena menyediakan **5 Mode Game Edukasi Interaktif** berbasis 100dvh fullscreen yang terhubung langsung dengan Bank Soal Informatika & KKA:

---

#### 🕹️ 5 Pilihan Mode Edu-Games:
1. **⚔️ Boss Battle 3D Arena**: Seluruh siswa di kelas bekerja sama mengalahkan monster glitch raksasa (Robot Glitch / Golem Api). Setiap jawaban benar siswa menembakkan laser dan mengurangi HP Boss!
2. **⚡ Fast Quiz**: Kuis adu kecepatan dan ketepatan kilat dengan papan skor langsung (*real-time leaderboard*).
3. **🃏 Memory Match**: Mengasah daya ingat siswa dengan mencocokkan kartu pasangan konsep & istilah komputer.
4. **🏎️ Class Race**: Balapan mobil di sirkuit siber berkecepatan tinggi yang ditentukan oleh ketepatan menjawab soal.
5. **🏰 Tower Defense**: Menjaga menara lab komputer dari serangan bot menggunakan energi dari jawaban kuis yang tepat.

---

#### 📋 Langkah Menjalankan Edu-Games di Kelas:
1. Buka menu [⭐ Edu-Games →](/games).
2. Geser atau klik game yang ingin dimainkan, lalu klik tombol **"🚀 Main Sekarang"**.
3. Pilih paket bank soal yang sudah dibuat sebelumnya (soal Informatika / KKA).
4. Tentukan rombel kelas yang bertanding.
5. Klik **"Mulai Sesi Permainan"** -> Layar akan menampilkan PIN Sesi game.
6. Siswa memasukkan PIN dari HP masing-masing dan memilih avatar chibi karakter mereka.
7. Tampilkan layar proyektor di depan kelas untuk menghidupkan suasana kompetisi belajar yang seru!

> 🔗 **Tautan Cepat:** [Buka Halaman Edu-Games Sekarang →](/games)`
  }

  // 3. INTENT: BANK SOAL / IMPORT SOAL / WORD / EXCEL / OCR KAMERA
  if (text.includes('bank soal') || text.includes('import soal') || text.includes('unggah soal') || text.includes('word') || text.includes('excel') || text.includes('ocr') || text.includes('tesseract')) {
    return `### 📝 Panduan Manajemen Bank Soal & Smart Import
Halo Pak Fadly! Belajarena memiliki modul **Bank Soal Cerdas** yang memudahkan pembuatan dan pengorganisasian butir asesmen formatif maupun sumatif.

---

#### ⚡ 3 Cara Praktis Mengisi Bank Soal:
1. **Input Manual Interaktif**:
   - Buka menu [Pusat Bank Soal →](/question-bank).
   - Klik tombol **"+ Buat Butir Soal Baru"**.
   - Masukkan stimulus teks/gambar, pertanyaan, pilihan opsi A-D, kunci jawaban, dan pembahasan.

2. **Smart Import dari Berkas Word (.docx) atau Excel (.xlsx)**:
   - Klik tombol **"📥 Impor Soal (Word / Excel / OCR)"**.
   - Pilih berkas soal Word atau Excel dari laptop Bapak.
   - Sistem akan otomatis membedah butir soal, opsi jawaban, dan kunci jawaban secara instan.

3. **OCR Foto Buku / Kertas Cetak**:
   - Jika Bapak memiliki lembar soal cetak fisik, cukup foto atau unggah gambarnya.
   - Engine OCR Tesseract Belajarena akan memindai teks soal dan memasukkannya ke draf soal secara otomatis.

---

> 💡 **Keterkaitan Modul:** Soal-soal di Bank Soal dapat langsung dipakai untuk **Ujian CBT** maupun sesi **Edu-Games Boss Battle**.
> 🔗 **Tautan Cepat:** [Buka Bank Soal Belajarena →](/question-bank)`
  }

  // 4. INTENT: UJIAN CBT / ULANGAN HARIAN / TOKEN / ANTI-CURANG
  if (text.includes('cbt') || text.includes('ujian') || text.includes('ulangan') || text.includes('token') || text.includes('curang')) {
    return `### 🖥️ Panduan Penyelenggaraan Ujian CBT Online
Halo Pak Fadly! Menu **Ujian CBT** memungkinkan Bapak menyelenggarakan asesmen formatif dan sumatif secara tertib, aman, dan otomatis ternilai.

---

#### 📋 Langkah Menyelenggarakan Ujian CBT:
1. Buka menu [Pusat Ujian CBT →](/cbt).
2. Klik tombol **"+ Jadwalkan Ujian Baru"**.
3. Tuliskan judul ujian (misal: *Ulangan Harian 1: Perangkat Keras Komputer*).
4. Pilih rombel kelas sasaran dan mata pelajaran (Informatika / KKA).
5. Pilih paket soal dari Bank Soal yang telah disiapkan.
6. Tentukan durasi pengerjaan (misal: 60 menit) dan aktifkan opsi **"Acak Urutan Soal & Pilihan"**.
7. Sistem akan mengenerate **Token Ujian** (misal: \`INF7-CBT\`).
8. Bagikan token kepada siswa saat waktu ujian dimulai.

---

#### 🛡️ Fitur Proteksi Anti-Curang (Tab-Switch Detection):
- Aplikasi CBT Belajarena secara otomatis mendeteksi bila siswa mencoba membuka tab baru, mencari jawaban di internet, atau berpindah aplikasi di ponsel/laptop.
- Pelanggaran akan dicatat di log pemantauan guru dan layar ujian siswa dapat terkunci otomatis jika melebihi batas toleransi.

> 🔗 **Tautan Cepat:** [Buka Menu Ujian CBT →](/cbt)`
  }

  // 5. INTENT: JADWAL MENGAJAR / JURNAL PERTEMUAN
  if (text.includes('jadwal') || text.includes('jurnal') || text.includes('pertemuan') || text.includes('minggu')) {
    return `### 📆 Panduan Jadwal Mengajar & Jurnal Mingguan
Halo Pak Fadly! Belajarena menerapkan sistem **Jadwal Mingguan Rutin Tetap**, sehingga Bapak tidak perlu membuat jadwal baru berulang-ulang setiap minggu.

---

#### 📌 Struktur Menu Jadwal:
- Buka menu [Jadwal & Jurnal Mengajar →](/schedule).
- **Tab 1: Jadwal Mingguan Rutin (Master)**:
  Berisi slot mengajar tetap Bapak dari hari **Senin s.d. Jumat**. Jadwal ini otomatis berulang setiap pekan selama satu semester aktif.
- **Tab 2: Info & Jurnal Pertemuan (Minggu 1 - 16)**:
  Digunakan untuk mencatat agenda capaian materi ajar, catatan refleksi kelas, dan kendala pembelajaran per pertemuan secara berkala.

> 🔗 **Tautan Cepat:** [Buka Jadwal & Jurnal Mengajar →](/schedule)`
  }

  // 6. INTENT: ABSENSI / KEHADIRAN SISWA
  if (text.includes('absen') || text.includes('absensi') || text.includes('kehadiran') || text.includes('presensi')) {
    return `### 📋 Panduan Presensi & Absensi Siswa
Halo Pak Fadly! Pencatatan kehadiran siswa di Belajarena terintegrasi langsung dengan data kelas dan ledger nilai akhir.

---

#### 📝 Cara Melakukan Presensi Kelas:
1. Buka menu [Absensi Siswa →](/attendance).
2. Pilih kelas yang sedang diajar (misal: Kelas VII A) dan pilih tanggal pertemuan hari ini.
3. Tandai status kehadiran tiap siswa:
   - 🟢 **Hadir** (H)
   - 🟡 **Sakit** (S)
   - 🔵 **Izin** (I)
   - 🔴 **Alpa** (A)
4. Terdapat tombol cepat **"Tandai Semua Hadir"** untuk mempercepat proses presensi.
5. Klik **"Simpan Presensi"**. Persentase kehadiran kelas akan langsung terakumulasi secara otomatis di ledger rapor.

> 🔗 **Tautan Cepat:** [Buka Menu Absensi Siswa →](/attendance)`
  }

  // 7. INTENT: REKAP NILAI / LEDGER / RAPOR / KKM / KKTP
  if (text.includes('nilai') || text.includes('ledger') || text.includes('rekap') || text.includes('rapor') || text.includes('kktp') || text.includes('kkm')) {
    return `### 📊 Panduan Rekapitulasi Nilai & Ledger Rapor
Halo Pak Fadly! Belajarena menyediakan sistem pembukuan nilai komprehensif yang menggabungkan seluruh komponen asesmen Kurikulum Merdeka.

---

#### 📂 2 Menu Laporan Nilai:
1. **Rekap Nilai Ulangan ([Buka Rekap CBT →](/reports/exam-events))**:
   Menganalisis hasil pengerjaan setiap sesi ujian CBT, lengkap dengan rata-rata nilai, daya pembeda soal, dan daftar siswa yang tuntas/belum tuntas.
2. **Rekap Nilai Siswa / Ledger Komprehensif ([Buka Ledger Nilai →](/grades))**:
   Menggabungkan seluruh bobot nilai:
   - Rata-rata Nilai Ulangan Harian CBT
   - Rata-rata Nilai Tugas & Proyek Koding
   - Nilai Partisipasi Edu-Games
   - Persentase Kehadiran Siswa
   - Dilengkapi tombol **"📥 Ekspor ke Excel"** untuk pencetakan rapor semester.

> 🎯 **Standar Ketuntasan (KKTP):** Untuk mata pelajaran Informatika dan KKA Fase D di SMP Negeri 6 Kendari, standar ketercapaian minimal berada pada rentang skor **75 - 78**.`
  }

  // 8. INTENT: KELAS & DATA SISWA / MANAJEMEN SISWA
  if (text.includes('kelas') || text.includes('siswa') || text.includes('rombel') || text.includes('nis') || text.includes('kartu pelajar')) {
    return `### 👥 Panduan Manajemen Kelas & Data Siswa
Halo Pak Fadly! Belajarena memudahkan pengelolaan rombel belajar dan data profil seluruh peserta didik di SMP Negeri 6 Kendari.

---

#### 🏫 Fitur yang Tersedia:
- **Manajemen Kelas ([Buka Manajemen Kelas →](/classes))**:
  Mengatur daftar rombel kelas aktif (Kelas VII A, VII B, VII C, VII D, VII E, VII F), wali kelas pengampu, dan kuota kelas.
- **Data Siswa ([Buka Data Siswa →](/students))**:
  - Melihat direktori seluruh siswa beserta nomor NIS dan NISN.
  - Mengubah foto profil avatar siswa atau memperbarui kontak orang tua.
  - Mencetak **Kartu Pelajar Digital** yang dilengkapi kode QR untuk absensi cepat.
  - Memfilter siswa per rombel kelas secara langsung.

> 🔗 **Tautan Cepat:** [Kelola Data Siswa →](/students) &bull; [Kelola Rombel Kelas →](/classes)`
  }

  // 9. INTENT: TUGAS SISWA / PENUGASAN
  if (text.includes('tugas') || text.includes('tenggat') || text.includes('penugasan') || text.includes('pr')) {
    return `### 📂 Panduan Tugas Siswa Belajarena
Halo Pak Fadly! Modul Tugas Siswa memungkinkan pemberian tugas terstruktur dengan sistem unggah berkas langsung dari HP atau komputer siswa.

---

#### 📝 Cara Membuat Tugas Baru:
1. Buka menu [Tugas Siswa →](/assignments).
2. Klik tombol **"+ Berikan Tugas Baru"**.
3. Masukkan judul tugas (misal: *Latihan Membuat Diagram Alir Algoritma Percabangan*).
4. Pilih kelas sasaran dan tentukan batas akhir pengumpulan (*deadline*).
5. Tuliskan instruksi pengerjaan dan lampirkan lembar kerja bila ada.
6. Siswa dapat melihat tugas di akun mereka, mengunggah jawaban (PDF/Foto/Dokumen), dan Bapak dapat langsung memberikan nilai dan feedback di portal ini.

> 🔗 **Tautan Cepat:** [Buka Modul Tugas Siswa →](/assignments)`
  }

  // 10. INTENT: CARA LOGIN SISWA / APLIKASI SISWA
  if (text.includes('login siswa') || text.includes('portal siswa') || text.includes('apk') || text.includes('aplikasi siswa') || text.includes('akun siswa')) {
    return `### 📱 Panduan Akses Portal & Aplikasi Siswa
Halo Pak Fadly! Siswa dapat mengakses Belajarena melalui dua jalur yang sangat fleksibel:

---

#### 1. Masuk Menggunakan Akun Siswa (Web / APK Android):
- Buka tautan portal: [Portal Siswa Belajarena →](/student).
- Siswa memasukkan **Username / Nomor NIS** (misal: \`24001\`).
- Kata sandi bawaan siswa: \`123456\` (siswa dapat mengganti kata sandi di profil mereka).
- Di dalam portal, siswa dapat melihat jadwal pelajaran, mengerjakan ujian CBT, mengumpulkan tugas, dan melihat rekapan nilai mereka.

#### 2. Masuk Cepat Tanpa Login (Khusus Sesi Live Kelas):
- Saat Bapak memulai **Live Presentasi** atau **Edu-Games**, sistem mengeluarkan **Kode PIN 6 Digit**.
- Siswa tidak wajib login akun; cukup membuka halaman sesi dan memasukkan kode PIN tersebut untuk langsung terhubung ke layar kelas secara instan.

> 🔗 **Tautan Portal Siswa:** [Buka Portal Siswa →](/student)`
  }

  // 11. INTENT: STRUKTUR MENU BARU / NAVIGASI SISTEM
  if (text.includes('menu') || text.includes('struktur') || text.includes('fitur') || text.includes('navigasi') || text.includes('apa saja') || text.includes('bantuan')) {
    return `### 🧭 Peta Lengkap Menu & Fitur Website Belajarena
Halo Pak Fadly! Sesuai rancangan tata letak modern Belajarena, sistem difokuskan pada **2 Fitur Utama Unggulan**, sementara seluruh menu penunjang dikelompokkan rapi di dalam **Pusat Akademik**:

---

#### ⭐ FITUR UTAMA UNGGULAN:
- [🎮 Edu-Games (/games)](/games): 5 arena permainan edukasi (Boss Battle 3D, Fast Quiz, Memory Match, Class Race, Tower Defense).
- [📡 Live Presentasi (/presentations)](/presentations): Studio tayang materi proyektor dengan mirroring langsung ke HP siswa.

#### 📁 PUSAT AKADEMIK (/academic):
- **Kelas & Siswa**: [Manajemen Kelas](/classes) &bull; [Data Siswa](/students) &bull; [Jadwal Mingguan](/schedule) &bull; [Absensi Siswa](/attendance)
- **Penilaian & Tugas**: [Bank Soal](/question-bank) &bull; [Ujian CBT](/cbt) &bull; [Tugas Siswa](/assignments) &bull; [Mapping BAB & TP](/curriculum/mapping)
- **Laporan & Materi**: [Rekap Nilai Ulangan](/reports/exam-events) &bull; [Rekap Nilai Siswa (Ledger)](/grades) &bull; [Live Ranking](/ranking) &bull; [Pustaka Materi Ajar](/presentations?view=catalog)

#### ⚙️ PENGATURAN:
- [Profil Guru & Sandi (/profile)](/profile) &bull; Pengaturan Sekolah SMPN 6 Kendari

> 💬 *Silakan ketik pertanyaan spesifik seputar fitur di atas, dan saya siap memandu Bapak langkah demi langkah!*`
  }

  // 12. INTENT: SOAL HOTS / BUTIR SOAL / ASESMEN KURIKULUM MERDEKA
  if (text.includes('soal') || text.includes('asesmen') || text.includes('hots')) {
    return `### 📋 Paket Butir Soal HOTS — Informatika & KKA (Fase D SMP)
**Mata Pelajaran**: KKA (Koding dan Kecerdasan Artifisial)  
**Satuan Pendidikan**: SMP Negeri 6 Kendari  
**Tingkat Kognitif**: C4 (Menganalisis) & C5 (Mengevaluasi)

---

#### Butir Soal 1: Analisis Model Computer Vision
> **Stimulus:**
> Sekelompok siswa kelas VII A di Lab Komputer SMP Negeri 6 Kendari sedang melatih model kecerdasan artifisial menggunakan *Teachable Machine* untuk membedakan sampah plastik dan daun kering. Dari 100 data uji, model mengenali 92 gambar dengan benar, namun keliru mendeteksi botol plastik bening di atas rumput sebagai daun.

**Pertanyaan:** Mengapa model kecerdasan artifisial tersebut mengalami kesalahan klasifikasi pada botol plastik bening di atas rumput?
- **A.** Daya komputasi komputer lab kurang memadai untuk memproses gambar berwarna.
- **B.** Model AI mempelajari fitur warna hijau latar belakang (*background bias*) karena variasi data latih kurang beragam.
- **C.** Sensor kamera digital secara otomatis mengubah pixel plastik menjadi daun.
- **D.** Algoritma AI hanya bisa mendeteksi benda padat yang tidak tembus cahaya.

✅ **Kunci Jawaban:** **B**  
💡 **Pembahasan:** Kesalahan tersebut merupakan fenomena klasik *background bias* pada *Computer Vision*. Model mengasosiasikan warna hijau rumput dengan label "daun". Solusinya adalah menambah variasi data latih botol plastik dengan berbagai latar belakang.

---

> 📥 *Bapak bisa langsung menyalin butir soal ini dan menambahkannya ke Bank Soal melalui tautan ini:* [Buka Bank Soal →](/question-bank)`
  }

  // 13. INTENT: MODUL AJAR / RPP KURIKULUM MERDEKA
  if (text.includes('modul ajar') || text.includes('rpp') || text.includes('perangkat ajar')) {
    return `### 📘 Draf Modul Ajar Kurikulum Merdeka (Fase D SMP)
**Mata Pelajaran**: Informatika / KKA  
**Satuan Pendidikan**: SMP Negeri 6 Kendari  
**Penyusun**: Muhammad Fadly Akbar Arsandi, S.Pd. (NIP: 199509282020121003)  
**Elemen**: Algoritma dan Pemrograman (AP) & Berpikir Komputasional (BK)  
**Alokasi Waktu**: 2 JP (2 x 40 Menit)

---

#### 1. TUJUAN PEMBELAJARAN (TP):
1. Peserta didik mampu menjelaskan konsep dasar logika percabangan (\`if-else\`) dalam pemecahan masalah sehari-hari.
2. Peserta didik mampu merancang program visual block / script sederhana yang merespons input kondisi secara akurat.

#### 2. LANGKAH PEMBELAJARAN (MODEL: PROJECT-BASED LEARNING):
- **Pendahuluan (10 Menit)**: Salam pembuka, presensi via [Menu Absensi Belajarena](/attendance), apersepsi logika komputer.
- **Kegiatan Inti (60 Menit)**:
  1. Guru mendemonstrasikan slide pengantar melalui [Live Presentasi Belajarena](/presentations).
  2. Siswa membuka komputer lab dan menyelesaikan tantangan koding berpasangan.
  3. Siswa menguji pemahaman dengan kuis interaktif di [Edu-Games Belajarena](/games).
- **Penutup (10 Menit)**: Refleksi capaian belajar, tindak lanjut pengayaan materi di portal siswa.`
  }

  // 14. INTENT: KODING PYTHON / SCRATCH
  if (text.includes('koding') || text.includes('python') || text.includes('scratch') || text.includes('program') || text.includes('kode')) {
    return `### 💻 Contoh Script Python Praktikum Siswa SMPN 6 Kendari
**Topik**: Logika Percabangan Nilai Kelulusan Proyek Komputasi  
**Guru Pengampu**: Muhammad Fadly Akbar Arsandi, S.Pd.

\`\`\`python
# ==========================================================
# Program: Pengecekan Ketuntasan KKA SMP Negeri 6 Kendari
# ==========================================================

nama = input("Nama Siswa : ")
nilai = float(input("Nilai Proyek Koding (0-100): "))

print("\n--- HASIL EVALUASI ---")
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

  // 15. DEFAULT RESPONS KONSULTASI LENGKAP
  return `### 🤖 Asisten AI Belajarena — SMP Negeri 6 Kendari
Halo Bapak **Muhammad Fadly Akbar Arsandi, S.Pd.!** (NIP: 199509282020121003)  
Guru Mata Pelajaran **Informatika & KKA** di SMP Negeri 6 Kendari.

Mengenai pertanyaan Bapak: **"${message}"**

Berikut panduan cepat fitur terkait di platform Belajarena:

1. **Navigasi Fitur Website:**
   - Ingin menayangkan materi proyektor dengan mirroring ke HP siswa? [Buka Live Presentasi →](/presentations)
   - Ingin menjalankan kuis game interaktif (Boss Battle 3D, Fast Quiz, Race)? [Buka Edu-Games →](/games)
   - Ingin membuat soal, import Word/Excel, atau asesmen CBT? [Buka Bank Soal →](/question-bank) atau [Buka Ujian CBT →](/cbt)
   - Ingin melihat rekapitulasi nilai akhir siswa? [Buka Rekap Nilai Siswa →](/grades)
   - Ingin memeriksa jadwal dan jurnal pertemuan mingguan? [Buka Jadwal & Jurnal →](/schedule)

2. **Bantuan Pedagogik & Perangkat Ajar:**
   - Ketik **"Buatkan soal HOTS KKA"** untuk paket butir soal lengkap dengan stimulus dan kunci jawaban.
   - Ketik **"Draf modul ajar informatika"** untuk perangkat ajar resmi Kurikulum Merdeka Fase D.
   - Ketik **"Script Python praktikum"** untuk materi koding lab komputer siswa SMP.

> 💡 *Bapak dapat bertanya tentang cara menggunakan bagian manapun dari website Belajarena atau meminta bantuan pembuatan materi ajar. Saya siap membantu setiap saat!*`
}

export { callGeminiApi, generateBuiltInResponse }
