# VERSION-2.0-CHANGELOG.md — Belajarena v2.0 Stable Release

**Tanggal Rilis:** 3 November 2026  
**Status Rilis:** STABLE / PRODUCTION-READY  
**Identitas Sekolah:** SMP Negeri 6 Kendari  
**Pengampu:** Muhammad Fadly Akbar Arsandi, S.Pd. (Informatika & KKA)

---

## 1. Ringkasan Eksekutif Rilis

Versi 2.0 merupakan rilis besar yang memadukan penyempurnaan **Teknikal Artist 3D Boss Battle Arena**, perbaikan **Integritas & Akurasi Data Nyata**, perombakan visual ke **Tema UI "Deep Petrol & Soft Canvas"**, serta fitur **Upload Foto Guru & Siswa** di seluruh portal aplikasi.

Semua fungsi backend dan frontend telah lulus audit tipe data (`vue-tsc -b`) dan build produksi Vite tanpa error (`Exit Code 0`).

---

## 2. Rincian Perubahan & Peningkatan Utama

### A. Rekonstruksi Model 3D Final Boss Battle (SVG-to-3D)
- **Koreksi Identitas Karakter 3D**: Mengisolasi model prosedural generik lama dan mengonstruksi ulang model bervolume Three.js langsung dari bentuk/path SVG asli pada `BossSprite.vue` menggunakan `SVGLoader` dan `ExtrudeGeometry` dengan bevel halus.
- **Karakter Terkalibrasi Presisi Sesuai Desain 2D**:
  1. **Robot Glitch (`robot-glitch`)**: Kepala mecha bersudut, visor hitam lebar, mata optik cyan bulat, antena miring dengan bola bercahaya, modul telinga cyan, reaktor cyan segitiga putih, capit cyan, palet resmi `#0ea5e9` & `#67e8f9`.
  2. **Virus Lambda (`virus-lambda`)**: Inti kapsid hijau faset poligonal, 6 spike/peplomer mint pada posisi akurat, lambang lambda bercahaya di puncak, 5 tentakel menggantung, 3 mata (1 besar + 2 satelit), dan spora mengorbit.
  3. **Bugzilla Compiler (`bugzilla`)**: Kepala serangga gelap, mata majemuk merah silang, 2 antena panjang bersegmen, capit mulut melengkung, karapas kuning-oranye bergaris, perisai segitiga tanda seru merah wajib, palet `#f59e0b` & `#fcd34d`.
  4. **Rakus Maximus (`rakus-maximus`)**: Monster gargoyle ungu kekar siluet lebar rendah, tanduk melengkung bergaris emas 3 strip, pauldron bahu duri emas, dada perisai berhias kristal belah ketupat magenta, cakar emas menapak tanah, pose defeated merebah di lantai.
- **Dukungan Custom Boss Image**: Gambar kustom dari guru dipertahankan sebagai referensi utama dalam mode 2.5D/plane berlapis tanpa diubah bentuknya.
- **Pembersihan Glitch Visual**: Menghapus quad/lembaran bayangan latar transparan yang sebelumnya menghalangi visual karakter 3D di arena.
- **Proporsional Laser Siswa**: Ukuran berkas tembakan laser siswa disesuaikan proporsional dengan skala chibi/avatar siswa agar tidak mendominasi layar.
- **Isolasi Warna Karakter**: Pemilihan satu boss tidak lagi mengubah warna boss lainnya di arena maupun konfigurasi.

---

### B. Harmonisasi UI "Deep Petrol & Soft Canvas" di Seluruh Menu
Menyelaraskan tema antarmuka di mode Guru dan Siswa mengikuti panduan desain modern:
- **Design Tokens**:
  - Background kanvas luar: `#e8edf2`
  - Warna primer utama: Deep Petrol `#0c2b3d`
  - Warna aksen: Warm Honey Amber `#f59e0b`
  - Kartu kontainer: `bg-white rounded-[24px] shadow-card border border-slate-200/60`
  - Tipografi: Plus Jakarta Sans / Inter dengan bobot `font-extrabold` pada judul
- **Sidebar & Menu Slider**:
  - Animasi transisi penyorot menu aktif kini bergerak mulus (`transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`) dengan kurva notch atas-bawah presisi tanpa celah garis putih.
- **Penyelarasan Menu Halaman**:
  1. **Studio Presentasi (`/presentations`)**: Rebranding dari Materi Ajar ke Studio Presentasi, 4 stat cards signature (Total Modul, Slide Siap Tayang, Sesi Terlaksana, Studio Live), live indicator banner, dan modal berdesain modern.
  2. **Manajemen Kelas (`/classes`)**: 4 stat cards, grade filter pills Deep Petrol, kartu rombel `rounded-[24px]` dengan counter terdaftar `#0c2b3d`.
  3. **Data Siswa (`/students`)**: 4 stat cards, search & filter card, dan kontainer tabel modern `rounded-[24px] overflow-hidden`.
  4. **CBT – Ujian Online (`/cbt`)**: 4 stat cards (Total, Aktif, Terjadwal, Selesai), chip kode akses berbingkai halus, dan list kartu ujian modern.
  5. **Tugas & Proyek Siswa (`/assignments`)**: 4 stat cards, bar kemajuan pengumpulan siswa rapi, dan tombol periksa Deep Petrol.
  6. **Jadwal Mingguan (`/schedule`)**: Banner informasi jadwal rutin berbingkai Deep Petrol, tab navigation bergaris bawah rapi, dan kartu hari Senin–Jumat.
  7. **Absensi Siswa (`/attendance`)**: Header modern, filter toolbar kelas & mapel, dan list pertemuan presensi.
  8. **Bank Soal (`/question-bank`)**: 4 stat cards, action bar (Download Format, Upload Excel/Word, Scan OCR, Buat Soal Baru).
  9. **Live Ranking (`/rankings`)**: Header banner Deep Petrol `#0c2b3d` dengan aksen Honey Amber `#f59e0b` dan pulsasi real-time.
  10. **Edu-Games Hub (`/games`)**: Banner panduan asesmen dan banner sesi aktif langsung menggunakan Deep Petrol `#0c2b3d`.
  11. **Laporan & Kurikulum**: Mapping BAB & TP (`/curriculum/chapters`), Rekap Nilai (`/reports/grades`), Rekap Event (`/reports/exam-events`), dan Pengaturan Sekolah (`/school/settings`).
  12. **Portal Siswa (`/student`)**: App bar Deep Petrol, live auto-dispatch modal, kartu profil siswa, dan navigasi tab modern.

---

### C. Integritas & Akurasi Data Nyata (Real Data Audit)
- **Perbaikan Bug Nilai Melebihi 100 di Live Ranking**:
  - Masalah nilai siswa `162/100` telah diperbaiki. Logika skor kini menerapkan capping ketat `Math.min(100, Math.max(0, score))` dan pembobotan proporsional Kurikulum Merdeka (Formatif 30%, Sumatif TP 30%, STS 20%, SAS 20%).
- **Perbaikan Anomali Data Dashboard**:
  - Menghilangkan persentase hardcoded `80%` saat pengumpulan tugas berstatus `0/26`. Persentase kini dihitung secara real dari `(submittedCount / totalStudents) * 100` atau menampilkan `0%` bila belum ada siswa yang mengumpulkan.
  - Menghapus angka fallback statis (`86.5`, `98%`, `|| 80`) di dashboard guru dan portal siswa. Semua data merujuk langsung ke rekaman basis data nyata di `database.json`.
  - Sinkronisasi endpoint `GET /api/v1/dashboard` untuk menghitung submission aktual dari `db.assignmentSubmissions`.

---

### D. Fitur Upload Foto Profil Guru & Siswa
- **Upload Foto Akun Guru (`/profile`)**:
  - Avatar guru memiliki overlay kamera saat di-hover.
  - Mendukung upload file gambar langsung, validasi tipe & ukuran berkas, preview instan, serta penyimpanan permanen di server (`/storage/avatars/`).
- **Upload Foto Akun Siswa (`/students`)**:
  - Modal tambah & edit data siswa dilengkapi pemilih file foto siswa dengan preview langsung.
  - Foto tersimpan di database siswa (`avatar_url` / `avatar_path`) dan otomatis ditampilkan pada Portal Siswa, Game Arena, dan CBT.

---

### E. Transformasi Menu Edu-Games — Fullscreen Hero Showcase Page (100dvh)
- **Tampilan Satu Layar Penuh (100dvh Desktop / Proyektor)**:
  - Mengonfigurasi `layout: 'blank'` pada route `/games` di `apps/web/src/app/router/index.ts` sehingga halaman dapat memanfaatkan seluruh layar tanpa scroll.
  - Latar bertema radial gradient dinamis yang berganti halus saat memilih game.
  - Efek kata raksasa condensed di tengah layar (`BOSS`, `KILAT`, `INGAT`, `BALAP`, `TAHAN`) di belakang visual utama.
- **Pemetaan 5 Game Edu-Games**:
  1. **Final Boss Battle**: Kata "BOSS", warna Crimson Fury (`#E11D48`), visual Robot Glitch asli dari `BossSprite.vue` (tanpa redesain karakter).
  2. **Fast Quiz**: Kata "KILAT", warna Electric Blaze (`#F97316`), visual `FastQuizHeroVisual.vue` (kartu soal 3D tilt, petir energi tinggi `⚡`, dial timer).
  3. **Memory Match**: Kata "INGAT", warna Royal Mystic (`#7C3AED`), visual `MemoryMatchHeroVisual.vue` (sepasang kartu memori mengambang `🧠` dan `✨` bergelombang sinergi).
  4. **Class Race**: Kata "BALAP", warna Emerald Nitro (`#16A34A`), visual `ClassRaceHeroVisual.vue` (kendaraan sirkuit aerodinamis, garis kecepatan, bendera finis `🏁`).
  5. **Tower Defense Kelas**: Kata "TAHAN", warna Sapphire Shield (`#2563EB`), visual `TowerDefenseHeroVisual.vue` (citadel kristal energi, cincin pelindung pertahanan, 5 gelombang).
- **Elemen Navigasi & Kontrol**:
  - **Tombol "Kembali ke Dashboard" (Kanan Atas Wajib)**: Selalu terlihat dengan kontras tinggi di atas seluruh kelima warna tema dan semua resolusi layar (desktop, tablet, HP) mengarah ke `/dashboard`.
  - **Header Ramping**: Logo Belajarena di kiri, navigasi guru di tengah.
  - **Pilih Game & Chip Spesifikasi**: Selector 5 titik warna dengan active ring, nama game aktif, dan pill info (Pemain, Format/Soal, Mode).
  - **Strip Bawah**: 5 kartu mini, panah navigasi (`‹` / `›`), keyboard navigation (`ArrowLeft`, `ArrowRight`, `Enter`), dan persistensi `sessionStorage`.
  - **Dukungan Aksesibilitas**: Toggle Mode Ringan & `prefers-reduced-motion` otomatis mematikan partikel splatter dan mereduksi animasi.
  - **Tampilan Sekunder ("Lihat Semua Game")**: Membuka grid katalog klasik dan riwayat sesi game lengkap tanpa kehilangan fungsi apa pun.

---

## 3. Hasil Pengujian & Verifikasi

- **TypeScript / Vue Compiler (`vue-tsc -b`)**: `0 errors, 0 warnings`.
- **Vite Production Bundler (`vite build`)**: Seluruh 695 modul terkompilasi dalam 30.33 detik (`Exit code 0`).
- **Layanan Localhost**:
  - Backend API: `http://localhost:8000` (Online & aktif).
  - Frontend Web: `http://localhost:5173` (Online & respons HTTP 200 OK).

---

## 4. Cadangan Berkas (Backup Artifacts)
- **Source Code Archive**: `belajarena-v2-stable-backup.zip` (Arsip bersih bebas `node_modules`, `dist`, dan berkas sementara).
- **Database Snapshot**: `apps/api/database/database.backup-v2-stable.json`.
- **Git Repository Snapshot**: Tag `v2.0-stable` diinisialisasi pada branch utama.

